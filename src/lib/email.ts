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
    process.env.EMAIL_FROM ?? "Digital Bookstore <onboarding@resend.dev>"
  );
}

/**
 * Absolute base URL for in-email links. Email clients require absolute
 * URLs — relative paths render as broken links in most webmail UIs.
 * Mirrors `getBaseUrl()` from `src/lib/seo.ts`.
 */
function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
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
