/**
 * One-click unsubscribe links that actually unsubscribe someone.
 *
 * WHY THIS EXISTS
 * The welcome email shipped with `{{{RESEND_UNSUBSCRIBE_URL}}}` in the body
 * and in the `List-Unsubscribe` header. Resend expands that token only for
 * sends bound to an audience contact — a Broadcast — and the welcome mail is
 * a plain `emails.send`. So the token was delivered *literally*: a subscriber
 * who wanted out was shown the string `{{{RESEND_UNSUBSCRIBE_URL}}}` as their
 * unsubscribe link. Verified in a real inbox on 2026-09-02.
 *
 * That is not a cosmetic bug. Gmail and Yahoo require a working one-click
 * unsubscribe on bulk mail (RFC 8058) and a broken one is answered with the
 * spam button, which is the fastest way to lose a sending domain.
 *
 * THE LINK
 *   https://valicepress.com/unsubscribe?e=<email>&t=<token>
 *
 * `t` is a truncated HMAC over the lowercased address. It makes the link
 * unguessable — without it, anyone could unsubscribe any address by typing
 * it into the query string — while keeping the URL short enough to survive
 * an email client's line wrapping. It does not expire: an unsubscribe link
 * has to work in a message someone kept for two years.
 *
 * THE KEY
 * Derived from `RESEND_API_KEY` rather than stored separately. The key is
 * already required for the mail to exist at all, never leaves the server,
 * and is domain-separated by a fixed label so the derived value cannot be
 * confused with the key itself or with any other use of it.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { getSiteUrl } from "@/lib/site-url";

const LABEL = "valice-unsubscribe-v1";
/** 20 hex chars ≈ 80 bits — unguessable, and short in a wrapped email line. */
const TOKEN_LENGTH = 20;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signingKey(): string | null {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) return null;
  return createHash("sha256").update(`${LABEL}\0${secret}`).digest("hex");
}

/** The token for an address, or null when the app has no key to sign with. */
export function unsubscribeToken(email: string): string | null {
  const key = signingKey();
  if (!key) return null;
  return createHmac("sha256", key)
    .update(normalizeEmail(email))
    .digest("hex")
    .slice(0, TOKEN_LENGTH);
}

/** Constant-time check. Returns false rather than throwing on any bad input. */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (!expected || typeof token !== "string" || token.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

/**
 * The absolute URL to put in an email body and in `List-Unsubscribe`.
 * Returns null when no key is available — the caller must then omit the
 * header rather than send a link that cannot work.
 */
export function unsubscribeUrl(email: string): string | null {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const url = new URL("/unsubscribe", getSiteUrl());
  url.searchParams.set("e", normalizeEmail(email));
  url.searchParams.set("t", token);
  return url.toString();
}
