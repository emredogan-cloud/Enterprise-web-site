/**
 * Transactional email (Roadmap §9 — operational tooling, SUB-PR 4.3).
 *
 * Wraps the Resend SDK with the same lazy-init + graceful-degradation
 * discipline used everywhere else in `src/lib/*`:
 *   - The client is constructed on first call, not at module load.
 *   - When `RESEND_API_KEY` is missing, the helper returns
 *     `{ ok: false, error: "..." }` and emits a one-shot `console.warn`
 *     instead of throwing.
 *
 * Callers (notably the watermark worker in `src/inngest/functions/`) treat
 * email as a NON-CRITICAL side-effect of fulfillment. The entitlement is
 * already `ready` by the time we attempt the email; a failure here logs
 * and continues. The user can always reach their library via /account.
 */

import { Resend } from "resend";

import { OrderReadyEmail } from "@/emails/order-ready";
import { WelcomeEmail } from "@/emails/welcome";
import type { NewsletterSource } from "@/lib/newsletter-client";
import { getSiteUrl } from "@/lib/site-url";
import { unsubscribeUrl } from "@/lib/unsubscribe";

// ---------------------------------------------------------------------------
// Client init — memoized; one-shot warn when unconfigured.
//   undefined → never resolved (lazy)
//   null      → resolved + intentionally disabled (env missing)
//   instance  → ready
// ---------------------------------------------------------------------------
let _resend: Resend | null | undefined;

function getResendClient(): Resend | null {
  if (_resend !== undefined) return _resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not set. Transactional email is DISABLED " +
        "for this process; sends will return `{ok:false}` and log a warning.",
    );
    _resend = null;
    return null;
  }
  _resend = new Resend(apiKey);
  return _resend;
}

/**
 * Resolve the `From:` line.
 *
 * The configured `EMAIL_FROM` env var is preferred (operator-controlled,
 * uses a verified domain). When absent, we fall back to Resend's shared
 * test-mode sender (`onboarding@resend.dev`) which works WITHOUT domain
 * verification but is heavily throttled and visibly Resend-branded — fine
 * for local dev / first-deploy smoke tests, not for production traffic.
 */
function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ?? "Valice Press <onboarding@resend.dev>"
  );
}

/**
 * Absolute base URL for in-email links. Email clients require absolute
 * URLs — relative paths render as broken links in most webmail UIs. Uses the
 * single validated resolver (`@/lib/site-url`, WS-A) so emails, canonicals,
 * and OG all share one origin.
 */
function getAppBaseUrl(): string {
  return getSiteUrl();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SendOrderReadyArgs {
  /** Recipient email address (from the order's Paddle customer record). */
  to: string;
  /** Display name from Paddle; may be null. Used for greeting. */
  buyerName: string | null;
  /** Book title — used in subject + body. */
  bookTitle: string;
  /** Our internal order UUID. Used in body footer + idempotency key. */
  orderId: string;
  /** Our internal book UUID. Used in idempotency key. */
  bookId: string;
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Send the "your digital book is ready" transactional email.
 *
 * Idempotency: pass `${orderId}-${bookId}` as the Resend
 * `idempotencyKey`. Inngest may retry our outer step on transient
 * failures; with this key, Resend de-duplicates inside its own pipeline
 * so a retry can never produce a duplicate user-visible email.
 *
 * Never throws — returns a discriminated union the caller can log and
 * continue past. Email failure is observable in `[email]` logs and the
 * Resend dashboard, but does NOT roll back the watermark/entitlement.
 */
export async function sendOrderReadyEmail(
  args: SendOrderReadyArgs,
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return {
      ok: false,
      error: "Resend not configured (RESEND_API_KEY missing).",
    };
  }

  const libraryUrl = `${getAppBaseUrl()}/account/library`;
  const subject = `Your digital book is ready: ${args.bookTitle}`;
  const idempotencyKey = `order-ready:${args.orderId}:${args.bookId}`;

  try {
    const result = await resend.emails.send(
      {
        from: getFromAddress(),
        to: args.to,
        subject,
        react: OrderReadyEmail({
          buyerName: args.buyerName,
          bookTitle: args.bookTitle,
          orderId: args.orderId,
          libraryUrl,
        }),
      },
      { idempotencyKey },
    );

    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Unknown Resend error",
      };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

// ---------------------------------------------------------------------------
// Marketing email
//
// Everything above this line is transactional: it is sent because someone
// bought something, and consent is not the gate — the purchase is. Below
// this line is marketing, and the rules are different. A marketing send
// requires an opt-in, carries an unsubscribe link, and must never be
// triggered by a purchase alone. Buying a book is not subscribing to a
// newsletter, and conflating the two is how a storefront ends up mailing
// people who never agreed to hear from it.
// ---------------------------------------------------------------------------

export interface SendWelcomeArgs {
  to: string;
  /** Which form the subscription came from; changes only the opening line. */
  source: NewsletterSource | null;
}

/**
 * Send the one-off welcome email to a new subscriber.
 *
 * Idempotency: keyed on the address, so a double form submission or a
 * retried request cannot produce two welcomes. Resend de-duplicates inside
 * its own pipeline on this key.
 *
 * Non-critical, like every other send here: a failure is logged and the
 * subscription still stands. Losing the welcome email is a small problem;
 * losing the subscription because the welcome failed would be a bigger one.
 */
export async function sendWelcomeEmail(
  args: SendWelcomeArgs,
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return {
      ok: false,
      error: "Resend not configured (RESEND_API_KEY missing).",
    };
  }

  const base = getAppBaseUrl();

  // Our own signed link, not `{{{RESEND_UNSUBSCRIBE_URL}}}`.
  //
  // That token is expanded only for sends bound to an audience contact — a
  // Broadcast. This is a plain `emails.send`, so on 2026-09-02 the token was
  // delivered to a real inbox *literally*: the reader's unsubscribe link was
  // the string `{{{RESEND_UNSUBSCRIBE_URL}}}`. See src/lib/unsubscribe.ts.
  const unsub = unsubscribeUrl(args.to);

  try {
    const result = await resend.emails.send(
      {
        from: getFromAddress(),
        to: args.to,
        subject: "You're on the Valice Press list",
        react: WelcomeEmail({
          source: args.source,
          catalogUrl: `${base}/books`,
          unsubscribeUrl: unsub ?? `${base}/unsubscribe`,
        }),
        headers: unsub
          ? {
              // One-click unsubscribe (RFC 8058). Gmail and Yahoo require it
              // on bulk mail, and it is the difference between a reader
              // unsubscribing and a reader marking the message as spam.
              "List-Unsubscribe": `<${unsub}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : // No key means no signable link. An advertised one-click header
            // that 400s is worse than no header at all.
            undefined,
      },
      { idempotencyKey: `welcome:${args.to.toLowerCase()}` },
    );

    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Unknown Resend error",
      };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
