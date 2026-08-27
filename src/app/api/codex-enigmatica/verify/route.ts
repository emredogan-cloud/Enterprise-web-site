import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { readVerifyConfig, verifySubmission } from "@/lib/codex-verify";

/**
 * POST /api/codex-enigmatica/verify — the destination the printed book
 * points its reader at.
 *
 * Codex Enigmatica withholds exactly one answer: the last question's. It
 * is printed nowhere in the book, and the contract page tells the reader
 * to enter it here. This route is that promise, implemented.
 *
 * ─── SECURITY MODEL ──────────────────────────────────────────────────
 *
 * 1. The answer is never in this repository. The route holds a PEPPERED
 *    SHA-256 digest in a server-only env var and compares digests in
 *    constant time (`src/lib/codex-verify.ts`).
 *
 * 2. The response is a single boolean. No length, no partial match, no
 *    "close" signal, no echo of the submission. A wrong guess and a
 *    malformed guess are indistinguishable to the caller apart from the
 *    HTTP status the shape of the request itself earns.
 *
 * 3. DEDICATED RATE LIMIT — and this is the one that matters.
 *    The global perimeter limiter in `src/proxy.ts` allows 100 requests
 *    per 10 seconds per IP. That is correct for a catalog, and useless
 *    here: at ten guesses a second an attacker walks a dictionary of
 *    plausible five-letter English words in under a minute. This route
 *    therefore installs its OWN much tighter bucket — a handful of
 *    attempts a minute, a couple of dozen an hour — which keeps the page
 *    comfortable for a human who mistypes and hostile to a script.
 *
 *    ⚠ Unlike the perimeter limiter, THIS one fails CLOSED. If Upstash
 *    is unreachable we answer 503 rather than opening an unmetered
 *    guessing oracle. A verification page that is briefly unavailable is
 *    a small problem; one that can be brute-forced is a permanent one.
 *
 * 4. Nothing sensitive is logged. The submitted value never reaches
 *    `console`, Sentry, or an analytics event.
 *
 * ─── RESPONSES ───────────────────────────────────────────────────────
 *   200 { ok: true,  result: "match" }
 *   200 { ok: true,  result: "no-match" }
 *   400 { ok: false, error: "empty" | "too-long" | "invalid-json" }
 *   429 { ok: false, error: "rate-limited" }
 *   503 { ok: false, error: "unavailable" }
 *
 * Note that BOTH verification outcomes are 200. A distinct status code
 * for a correct answer would let a caller detect success from the
 * response line alone without parsing — and would show up in any
 * intermediary's access logs as a visible "someone got it right" signal.
 */

// This route reads env + Redis per request; it must never be prerendered
// or cached. `force-dynamic` also keeps it out of the static export.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Dedicated rate limit — two buckets, both must pass.
//
//   burst:    5 attempts / minute  → a human who mistypes is unaffected
//   sustained: 20 attempts / hour  → a script is stopped well before it
//                                    covers any meaningful search space
//
// Keyed on IP with its own prefix so it shares no budget with the
// perimeter limiter or with any other endpoint.
// ---------------------------------------------------------------------------
const BURST_LIMIT = 5;
const BURST_WINDOW = "60 s" as const;
const SUSTAINED_LIMIT = 20;
const SUSTAINED_WINDOW = "1 h" as const;

type Limiters = { burst: Ratelimit; sustained: Ratelimit } | null;
let _limiters: Limiters | undefined;

function getLimiters(): Limiters {
  if (_limiters !== undefined) return _limiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[codex/verify] Upstash is not configured — this endpoint FAILS CLOSED " +
        "and will answer 503 until it is. An unmetered verification endpoint " +
        "is a guessing oracle.",
    );
    _limiters = null;
    return null;
  }

  const redis = new Redis({ url, token });
  _limiters = {
    burst: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(BURST_LIMIT, BURST_WINDOW),
      analytics: true,
      prefix: "codex-verify-burst",
    }),
    sustained: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(SUSTAINED_LIMIT, SUSTAINED_WINDOW),
      analytics: true,
      prefix: "codex-verify-hour",
    }),
  };
  return _limiters;
}

/** Same header chain the perimeter limiter uses (`NextRequest.ip` is gone). */
function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}

function json(body: unknown, status: number, extra?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}

export async function POST(req: Request) {
  // ---- 1. Rate limit BEFORE any parsing or hashing ------------------------
  const limiters = getLimiters();
  if (!limiters) {
    return json({ ok: false, error: "unavailable" }, 503);
  }

  const ip = clientIp(req);
  let allowed = false;
  let reset = Date.now();
  try {
    const [burst, sustained] = await Promise.all([
      limiters.burst.limit(ip),
      limiters.sustained.limit(ip),
    ]);
    allowed = burst.success && sustained.success;
    reset = Math.max(burst.reset, sustained.reset);
  } catch (err) {
    // FAIL CLOSED. The perimeter limiter fails open because the site must
    // stay up; this one must not become an unmetered oracle.
    console.warn(
      "[codex/verify] rate-limit backend unreachable; refusing:",
      err instanceof Error ? err.message : err,
    );
    return json({ ok: false, error: "unavailable" }, 503);
  }

  if (!allowed) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return json({ ok: false, error: "rate-limited" }, 429, {
      "Retry-After": String(retryAfter),
    });
  }

  // ---- 2. Parse ----------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, 400);
  }

  const raw =
    typeof body === "object" && body !== null && "answer" in body
      ? (body as { answer: unknown }).answer
      : undefined;

  // ---- 3. Decide ---------------------------------------------------------
  const outcome = verifySubmission(raw, readVerifyConfig());

  switch (outcome.result) {
    case "empty":
      return json({ ok: false, error: "empty" }, 400);
    case "too-long":
      return json({ ok: false, error: "too-long" }, 400);
    case "unavailable":
      // The secret pair is not provisioned. Fail closed and say so
      // honestly rather than telling every reader they are wrong.
      console.warn(
        "[codex/verify] CODEX_VERIFY_PEPPER / CODEX_VERIFY_DIGEST are not " +
          "set — answering 503 rather than rejecting every reader.",
      );
      return json({ ok: false, error: "unavailable" }, 503);
    case "match":
      return json({ ok: true, result: "match" }, 200);
    case "no-match":
      return json({ ok: true, result: "no-match" }, 200);
  }
}

/**
 * Everything else is 405.
 *
 * GET is called out explicitly because a reader who pastes the API path
 * into a browser should get a clear method error, not a confusing 500 —
 * and because a GET-able verification endpoint would put submissions in
 * query strings, and therefore in server access logs.
 */
export function GET() {
  return NextResponse.json(
    { ok: false, error: "method-not-allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}
