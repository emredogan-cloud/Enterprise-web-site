import { streamText, stepCountIs, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse, type NextRequest } from "next/server";

import {
  ASSISTANT_MODEL,
  EXTRACTION_REFUSAL,
  MAX_STEPS,
  PROVIDER_FALLBACK,
  buildSystemPrompt,
  createAssistantTools,
  isExtractionAttempt,
} from "@/lib/ai/assistant";
import { bookDetail } from "@/lib/ai/catalog-context";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";

/**
 * POST /api/assistant — the storefront concierge.
 *
 * THE KEY NEVER LEAVES THIS PROCESS.
 * `OPENAI_API_KEY` is read here, on the server, from the environment the rest
 * of the site already uses. The browser posts a question and receives prose;
 * it has no provider, no key, no model name and no system prompt. There is
 * deliberately no `NEXT_PUBLIC_` anything in this feature.
 *
 * THE SHAPE OF A TURN
 *   browser → this route → guardrails (in code) → model → deterministic tools
 *   over the site's own catalog queries → streamed text → browser.
 *
 * The guardrails run BEFORE the model is called, not as instructions to it.
 * A cap the model is asked to respect is a suggestion; a cap enforced here is
 * a cap. What the prompt adds on top is tone, not security.
 *
 * WHAT A HOSTILE MESSAGE CAN ACHIEVE
 * Nothing but words. Every tool on the other side is read-only over published
 * catalog rows, the visitor's own cart cookie and the campaign clock; there is
 * no tool that writes, charges, emails, or reads another person's anything.
 * So the worst case for a successful prompt injection is a rude sentence —
 * not an action — and that is a property of the tool surface, not of how
 * cleverly the instructions are worded.
 *
 * WHAT COMES BACK WHEN SOMETHING BREAKS
 * A plain, friendly sentence and a 200. Never a stack trace, never a provider
 * error, never the name of an environment variable. The visitor is told the
 * assistant is unavailable and pointed at /books, which is where they wanted
 * to go anyway.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Hard caps, enforced here rather than requested of the model. */
const MAX_BODY_BYTES = 16_000;
const MAX_MESSAGE_CHARS = 1_000;
const MAX_HISTORY = 12;

/**
 * A per-instance question budget.
 *
 * The site-wide limiter in `src/proxy.ts` allows 100 requests per 10s, which is
 * right for pages and far too generous for an endpoint that spends money per
 * call. This is a second, much tighter window on top of it.
 *
 * It is in memory, so it is a floor rather than a ceiling: with several
 * instances warm, a determined caller gets this many per instance. That is an
 * honest limitation and it is still worth having — Fluid Compute reuses
 * instances, so in practice a single abusive client meets it almost at once,
 * and it costs no dependency and no round trip to enforce.
 */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const hits = new Map<string, number[]>();

function overRate(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  // Bounded cleanup so a long-lived instance cannot accumulate keys forever.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_MAX;
}

function clientKey(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

/**
 * One PII-free funnel row, written from the server and never awaited.
 *
 * WHAT IS DELIBERATELY NOT IN IT: the question. Not the text, not a
 * "normalised" form of it, not the first few words. A question typed into a
 * chat box is the single most identifying thing this feature touches — people
 * type their names, their children's reading ages, sometimes their email
 * address — and the honest way to keep it private is to have no column it
 * could land in. `/api/events` already refuses a `query` prop for exactly this
 * reason; this route holds the same line from the other side.
 *
 * What is recorded: that a question happened, how long it was, and which turn
 * of the conversation it was. Enough to see whether anyone uses the thing.
 */
function record(event: string, props: Record<string, string | number | boolean | null>): void {
  void db
    .insert(analyticsEvents)
    .values({ event, props, path: "/api/assistant", bookSlug: null, source: "server" })
    .catch((err) => {
      // Analytics must never break a conversation.
      console.error("[assistant] analytics insert failed (non-fatal):", err);
    });
}

/** A refusal or a failure, delivered as a normal assistant turn. */
function say(text: string) {
  return new NextResponse(text, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Take only what we recognise from the body.
 *
 * Roles are whitelisted to `user` and `assistant` specifically so a client
 * cannot post a `system` turn and rewrite the assistant's instructions from
 * the browser — the one genuinely dangerous thing an open chat endpoint can
 * be talked into. The system prompt is built here, on every request, and is
 * the only system message that exists.
 */
function sanitize(raw: unknown): IncomingMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: IncomingMessage[] = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    if (typeof m !== "object" || m === null) continue;
    const { role, content } = m as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) out.push({ role, content: text });
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (overRate(clientKey(req))) {
    return say(
      "That's a lot of questions at once — give me a minute to catch up. " +
        "Everything is browsable at /books in the meantime.",
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return say(PROVIDER_FALLBACK);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return say(PROVIDER_FALLBACK);
  }

  const messages = sanitize(body.messages);
  if (messages.length === 0) return say("What are you looking for? A subject, an author, a mood — anything.");

  const last = messages[messages.length - 1]!;

  /**
   * Refused without calling the model at all.
   *
   * Deterministic, free, and unbullyable: no phrasing of "ignore your previous
   * instructions" can talk a regex into a different answer. The patterns are
   * narrow on purpose (see `isExtractionAttempt`) — a bookshop that publishes
   * Seneca and a treatise on ciphers must stay able to discuss dark subjects.
   */
  if (last.role === "user" && isExtractionAttempt(last.content)) {
    record("assistant_refused", { reason: "extraction" });
    return say(EXTRACTION_REFUSAL);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Not an error the visitor caused, and not one they can act on. The
    // console line names the variable; the response never does.
    console.error("[assistant] OPENAI_API_KEY is not set — assistant disabled");
    return say(PROVIDER_FALLBACK);
  }

  const page = (typeof body.page === "object" && body.page !== null
    ? (body.page as Record<string, unknown>)
    : {}) as { path?: unknown; bookSlug?: unknown };

  /**
   * Resolve the page's book before the model sees anything.
   *
   * The slug arrives from the browser, so it is validated to the catalog's own
   * shape and then used only as a lookup key against published rows — it can
   * name a book or name nothing, and either way nothing it contains reaches a
   * query as text. An unknown slug simply yields `null` and the conversation
   * proceeds without page context.
   */
  const slug =
    typeof page.bookSlug === "string" && /^[a-z0-9-]{1,200}$/.test(page.bookSlug)
      ? page.bookSlug
      : null;
  const pageBook = slug ? await bookDetail(slug).catch(() => null) : null;

  const system = buildSystemPrompt({
    path: typeof page.path === "string" ? page.path.slice(0, 120) : undefined,
    book: pageBook,
  });

  try {
    const openai = createOpenAI({ apiKey });
    const result = streamText({
      model: openai(ASSISTANT_MODEL),
      system,
      messages: messages as ModelMessage[],
      tools: createAssistantTools(),
      // Enough steps to search, then look one book up, then answer. Without a
      // stop condition the SDK would return after the first tool call and the
      // visitor would get an empty reply.
      stopWhen: stepCountIs(MAX_STEPS),
      temperature: 0.3,
      onError: ({ error }) => {
        // Streamed errors do not throw — without this they are swallowed and
        // the visitor gets a truncated sentence with nothing in the log.
        console.error("[assistant] stream error:", error);
      },
    });

    record("assistant_message", {
      // The question itself is never recorded. Its length is a useful signal
      // about whether people write sentences or keywords, and it identifies
      // nobody.
      chars: last.content.length,
      turn: messages.length,
    });

    return result.toTextStreamResponse({
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("[assistant] failed:", err);
    return say(PROVIDER_FALLBACK);
  }
}
