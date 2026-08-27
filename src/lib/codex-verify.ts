/**
 * Codex Enigmatica — final-answer verification core.
 *
 * WHY THIS MODULE EXISTS
 * ----------------------
 * The printed book makes the reader a promise on its contract page:
 *
 *   "The last question's answer is NOT in the back matter and is printed
 *    nowhere in this book. You enter it on the VERIFICATION PAGE, whose
 *    address is printed on the last leaf. That page levels case, spacing
 *    and punctuation BEFORE it compares; only the letters matter."
 *
 * Everything here exists to make that sentence literally true, and to make
 * it true WITHOUT the answer ever existing in this repository, in the
 * client bundle, in the HTML, or in a log line.
 *
 * THE SECRET MODEL
 * ----------------
 * The canonical answer is five letters. A bare SHA-256 of a five-letter
 * word is not a secret: 26^5 is 11.9 million candidates, which a laptop
 * exhausts in under a second. So the digest is PEPPERED — a long random
 * server-only string is mixed in before hashing, and the pepper never
 * leaves the server environment:
 *
 *     digest = sha256( PEPPER + "\0" + normalize(answer) )
 *
 * Two env vars, both server-only (no `NEXT_PUBLIC_` prefix, so Next never
 * inlines them into the client bundle):
 *
 *     CODEX_VERIFY_PEPPER   long random string (32+ bytes hex)
 *     CODEX_VERIFY_DIGEST   the hex digest above
 *
 * An attacker who somehow obtains the digest alone still cannot brute
 * force it, because the pepper is not in the search space.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 * -----------------------------------------
 *   - It does not know the answer. Nothing in this repo does.
 *   - It does not reveal length, shape, or any partial match.
 *   - It does not echo the submission back to the caller.
 *
 * `normalizeAnswer` is pure and is exported for unit tests; the digest
 * helpers read `process.env` and are therefore server-only.
 */

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Longest submission we will even look at.
 *
 * The gate answers are short sayings (nineteen letters at most in this
 * edition) and the last answer is a single word, so 200 characters is
 * already absurdly generous. The cap exists to stop a megabyte body from
 * reaching the hash function at all.
 */
export const MAX_SUBMISSION_LENGTH = 200;

/**
 * The book's own normalization contract, implemented exactly.
 *
 * "levels case, spacing and punctuation BEFORE it compares; only the
 *  letters matter"
 *
 * So: uppercase, then discard every character that is not an ASCII
 * letter. Digits go too — the book is explicit that a number is never an
 * answer ("that number is NOT the answer — it is a row"), so a reader who
 * types the row number should get a clean "no", not a near-miss.
 *
 * Unicode note: the answer space is the book's own 26-letter alphabet, so
 * stripping to /[A-Z]/ is correct rather than merely convenient. A reader
 * who types a smart quote, an accented character or a zero-width space
 * has those removed instead of failing on invisible input.
 */
export function normalizeAnswer(raw: string): string {
  return raw.normalize("NFKD").toUpperCase().replace(/[^A-Z]/g, "");
}

/** Hex SHA-256 of `pepper \0 normalized`. Server-side only. */
export function digestFor(normalized: string, pepper: string): string {
  return createHash("sha256")
    .update(pepper, "utf8")
    .update("\0", "utf8")
    .update(normalized, "utf8")
    .digest("hex");
}

export type VerifyConfig = { pepper: string; digest: string };

/**
 * Read the server-side secret pair.
 *
 * Returns `null` when either half is missing so the route can answer 503
 * ("verification is temporarily unavailable") instead of throwing a 500 or
 * — far worse — silently accepting everything. An unprovisioned deploy
 * must FAIL CLOSED here: this is the one endpoint where "allow through on
 * misconfiguration" would be the wrong instinct.
 */
export function readVerifyConfig(): VerifyConfig | null {
  const pepper = process.env.CODEX_VERIFY_PEPPER;
  const digest = process.env.CODEX_VERIFY_DIGEST;
  if (!pepper || !digest) return null;
  if (!/^[0-9a-f]{64}$/i.test(digest)) return null;
  return { pepper, digest: digest.toLowerCase() };
}

/**
 * Constant-time digest comparison.
 *
 * `timingSafeEqual` throws on a length mismatch, so the lengths are
 * checked first — both are always 64 hex chars here, but the guard keeps
 * a malformed env var from turning into a 500.
 */
export function digestsMatch(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export type VerifyOutcome =
  | { result: "match" }
  | { result: "no-match" }
  | { result: "empty" }
  | { result: "too-long" }
  | { result: "unavailable" };

/**
 * The whole decision, in one pure-ish function so the route stays thin
 * and the logic is testable with an injected config.
 */
export function verifySubmission(
  raw: unknown,
  config: VerifyConfig | null,
): VerifyOutcome {
  if (typeof raw !== "string") return { result: "empty" };
  if (raw.length > MAX_SUBMISSION_LENGTH) return { result: "too-long" };

  const normalized = normalizeAnswer(raw);
  if (!normalized) return { result: "empty" };

  // Fail CLOSED: without the secret pair we cannot say "yes" to anything.
  if (!config) return { result: "unavailable" };

  const candidate = digestFor(normalized, config.pepper);
  return digestsMatch(candidate, config.digest)
    ? { result: "match" }
    : { result: "no-match" };
}
