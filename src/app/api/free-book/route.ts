import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { campaignIsOpen, campaignStartMs } from "@/lib/campaign";
import {
  countRecentByIp,
  createFreeBookRequest,
  getRequestHistory,
  resolveBookForRequest,
  type FreeBookRequestStatus,
} from "@/lib/db/queries/free-books";

/**
 * POST /api/free-book — record a request for a free ebook.
 *
 * WHAT THIS ROUTE WILL NOT DO
 * It will not read, write, verify, or care about an Amazon review. There is no
 * `reviewUrl` field, no screenshot upload, no eligibility check that consults
 * anything a reader might or might not have posted. Amazon permits giving a
 * book away and permits asking for an honest review afterwards; it forbids
 * requiring one, or making any benefit conditional on one. Keeping that line
 * is not a matter of restraint in the copy — it is a matter of this endpoint
 * having nowhere to put the answer. See `free_book_requests` in the schema.
 *
 * WHAT IT IS AUTHORITATIVE ABOUT
 *   - the campaign window: a `/books` page can sit in a CDN cache for an hour
 *     after the promotion ends, gift boxes and all, so the UI cannot be the
 *     gate. This checks `campaignIsOpen()` on every call.
 *   - the book: the browser posts a slug and nothing else. Title, price and id
 *     are looked up here. Nothing a visitor types decides what they get.
 *
 * ABUSE CONTROL, AND ITS LIMIT
 * Per-IP burst limiting already happens at the edge (`src/proxy.ts` covers
 * `/(api|trpc)(.*)`). What this adds is history: how many books this address
 * has taken during the campaign, and whether it has asked for this one before.
 * Neither is allowed to produce a hostile experience — a duplicate is answered
 * honestly ("you already asked for this one, check your inbox"), and a high
 * volume is *flagged for a human*, never silently refused. The one hard stop
 * is a cap high enough that no genuine reader will meet it.
 *
 * Responses
 *   200 { ok: true, status: "received" | "duplicate" }
 *   400 { ok: false, error: "invalid-email" | "invalid-book" | "message-too-long" }
 *   404 { ok: false, error: "unknown-book" }
 *   409 { ok: false, error: "campaign-closed" | "book-unavailable" }
 *   429 { ok: false, error: "too-many-requests" }
 *   500 { ok: false, error: "internal-error" }
 */

const MAX_EMAIL_LENGTH = 254; // RFC 5321
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Same pragmatic check the newsletter route uses. No regex is RFC-correct and
 * pretending otherwise rejects real addresses; this only turns away input that
 * is obviously not an address at all.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * How many free books one address may take during the campaign before the
 * request is held for a human to look at, and the hard ceiling.
 *
 * The soft threshold does not refuse anybody: it marks the row `flagged`, the
 * operator sees it at the top of the list, and it is fulfilled or not by a
 * person. The hard cap exists so a script cannot enqueue ten thousand rows.
 */
const FLAG_AFTER_PER_EMAIL = 6;
const HARD_CAP_PER_EMAIL = 25;
const FLAG_AFTER_PER_IP = 20;
const HARD_CAP_PER_IP = 60;

/**
 * Salt for the IP hash.
 *
 * We record *that* requests came from one source, never *which* source. An
 * unsalted hash of an IPv4 address is reversible by brute force in seconds —
 * there are only four billion of them — so a bare `sha256(ip)` is an IP
 * address wearing a hat. When no salt is configured the field is left null
 * rather than written weakly: a missing signal is better than a false promise
 * of anonymity in a table an operator reads.
 */
function hashIp(ip: string | null): string | null {
  const salt = process.env.FREE_BOOK_IP_SALT;
  if (!ip || !salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 64);
}

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

function bad(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  // The window is checked before anything else is read. A closed campaign is
  // not a validation problem to report field by field; it is simply over.
  if (!campaignIsOpen()) return bad("campaign-closed", 409);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid-body", 400);
  }
  if (typeof body !== "object" || body === null) return bad("invalid-body", 400);
  const b = body as Record<string, unknown>;

  // Honeypot. A field no human sees and no human fills. Answered with the same
  // 200 a real submission gets, because telling a bot it was detected is how it
  // learns to stop filling the field.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return NextResponse.json({ ok: true, status: "received" });
  }

  const email = String(b.email ?? "").trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return bad("invalid-email", 400);
  }

  const slug = String(b.slug ?? "").trim();
  if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/.test(slug)) {
    return bad("invalid-book", 400);
  }

  const rawMessage = typeof b.message === "string" ? b.message.trim() : "";
  if (rawMessage.length > MAX_MESSAGE_LENGTH) return bad("message-too-long", 400);
  // Stored as plain text, exactly as typed. It is never interpolated into HTML
  // — React escapes it in the admin table and the operator email sends it as a
  // text part — so the right thing to store is the truth, not a mangled
  // "sanitised" version that loses an apostrophe from someone's name.
  const message = rawMessage === "" ? null : rawMessage;

  const marketingConsent = b.marketingConsent === true;

  const book = await resolveBookForRequest(slug);
  if (!book) return bad("unknown-book", 404);

  /**
   * REFUSE A BOOK THIS STORE CANNOT ACTUALLY DELIVER.
   *
   * The test is `masterFileKey`, and only that: fulfilment hands over exactly
   * that object, so with no master there is no file, and accepting the request
   * would promise a delivery that has to fail in the queue later.
   *
   * THIS USED TO ALSO REQUIRE `priceCents > 0`, AND THAT WAS A PROXY, NOT A
   * REASON. Zero meant "not sold here", which until 2026-09-12 was only ever
   * true of three titles that also had no master — Codex Mythologica (its
   * ebook is enrolled in KDP Select, an exclusivity agreement with Amazon),
   * the Hangul workbook and The Myth Hunter's Field Book. The proxy and the
   * reason agreed, so nobody had to choose between them.
   *
   * The Paddle compliance gate broke the agreement. Eighteen public-domain
   * titles now carry price 0 because they are no longer sold here, while still
   * holding their master and still being ours to give away. Keeping the price
   * test would have silently ended the free campaign for two thirds of the
   * catalogue — the modal would open and the submission would answer 409.
   *
   * Checked against the database on 2026-09-12: exactly three published books
   * have no master, and they are exactly the three that must never be given
   * away. The file test alone is therefore both necessary and sufficient.
   *
   * The gift box hides itself for these, but a shelf can sit in a CDN cache
   * for an hour and a payload can be hand-edited, so the refusal lives here
   * as well. Answered as `unavailable` rather than `unknown-book`: the title
   * is real, it is just not ours to give.
   */
  if (!book.masterFileKey) {
    return bad("book-unavailable", 409);
  }

  const ipHash = hashIp(clientIp(req));
  const since = campaignStartMs();

  let history: { total: number; sameBook: number };
  try {
    history = await getRequestHistory(email, slug, since);
  } catch (err) {
    console.error("[free-book] history lookup failed:", err);
    return bad("internal-error", 500);
  }

  if (history.total >= HARD_CAP_PER_EMAIL) return bad("too-many-requests", 429);

  let ipCount = 0;
  if (ipHash) {
    try {
      ipCount = await countRecentByIp(ipHash, since);
    } catch {
      // A failure to count is not a reason to refuse a reader a book.
      ipCount = 0;
    }
    if (ipCount >= HARD_CAP_PER_IP) return bad("too-many-requests", 429);
  }

  // Status is decided here, once, so the operator's list is meaningful without
  // anyone having to re-derive "is this suspicious?" while reading it.
  let status: FreeBookRequestStatus = "pending";
  const notes: string[] = [];
  if (history.sameBook > 0) {
    status = "duplicate";
    notes.push(`already requested this title ${history.sameBook}x during the campaign`);
  } else if (history.total >= FLAG_AFTER_PER_EMAIL) {
    status = "flagged";
    notes.push(`${history.total} requests from this address during the campaign`);
  } else if (ipHash && ipCount >= FLAG_AFTER_PER_IP) {
    status = "flagged";
    notes.push(`${ipCount} requests from this source during the campaign`);
  }

  try {
    await createFreeBookRequest({
      email,
      book,
      message,
      marketingConsent,
      ipHash,
      status,
      notes: notes.length ? notes.join("; ") : null,
    });
  } catch (err) {
    console.error("[free-book] insert failed:", err);
    return bad("internal-error", 500);
  }

  // MARKETING CONSENT IS RECORDED HERE AND ACTED ON ELSEWHERE, DELIBERATELY.
  //
  // The row above stores which consent this person actually gave, because that
  // is the record we must be able to produce later. The subscription itself is
  // performed by the modal, against `POST /api/newsletter`, which already owns
  // the audience id, the verbatim consent sentence, the property-declaration
  // fallback and the welcome mail — all of it tested. Re-implementing that
  // here to save one request would mean two copies of a consent sentence that
  // must never drift apart, and the copy in a giveaway endpoint would be the
  // one nobody remembered to update.
  //
  // Asking for a book is not consent to a mailing list. The checkbox defaults
  // to off, and a request submitted with it off subscribes nobody.

  return NextResponse.json({
    ok: true,
    status: status === "duplicate" ? "duplicate" : "received",
  });
}
