import type { NextRequest } from "next/server";

import {
  handlePaymentFailure,
  handleRefundOrChargeback,
} from "@/lib/commerce/lifecycle";
import { processCompletedTransaction } from "@/lib/fulfillment";
import { logger } from "@/lib/logger";
import { getPaddleClient } from "@/lib/paddle";

// We use Drizzle transactions inside the handler → Node runtime required.
export const runtime = "nodejs";
// Cookies/headers are read and we write to the DB; never cache.
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/paddle
 *
 * Mandatory steps (Roadmap §11):
 *  1. **Signature verification first.** No early returns, no DB calls, no
 *     log writes — none of it happens until the SDK's `unmarshal()`
 *     accepts the body, secret and Paddle-Signature header. A failed
 *     signature returns 401 immediately.
 *  2. Idempotent fulfillment delegated to `processCompletedTransaction`,
 *     which uses `orders.mor_order_ref` (UNIQUE) to detect Paddle's
 *     retry-on-5xx pattern and no-op cleanly.
 *  3. Return 200 only after the fulfillment write committed (or was
 *     deduplicated). Any thrown error returns 500 so Paddle retries.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return new Response("Missing Paddle-Signature header", { status: 401 });
  }

  // Paddle signs the raw request body — read it as text, never as JSON.
  const rawBody = await request.text();
  if (!rawBody) {
    return new Response("Empty body", { status: 400 });
  }

  // Verify the signature as its own step, BEFORE unmarshalling.
  //
  // `unmarshal()` both verifies and parses, and the previous version wrapped
  // the whole thing in one catch that reported everything as "Invalid
  // signature" with a 401. So a correctly-signed request whose body the SDK
  // could not parse was reported as a signature failure — which sends anyone
  // debugging it to rotate a secret that was never wrong. Splitting the two
  // costs one extra HMAC and makes the log say which of the two actually
  // happened.
  const paddle = getPaddleClient();
  let signatureValid = false;
  try {
    signatureValid = await paddle.webhooks.isSignatureValid(
      rawBody,
      webhookSecret,
      signature,
    );
  } catch (err) {
    logger.error("[paddle-webhook] signature check threw", err);
    return new Response("Invalid signature", { status: 401 });
  }
  if (!signatureValid) {
    logger.error(
      "[paddle-webhook] signature verification FAILED — check that " +
        "PADDLE_WEBHOOK_SECRET holds the signing secret (pdl_ntfset_…), not " +
        "the notification-setting id (ntfset_…)",
    );
    return new Response("Invalid signature", { status: 401 });
  }

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    // Signature was good, so this is Paddle sending a shape this SDK version
    // does not understand. 400, not 401: retrying will not help, and a 500
    // would make Paddle retry a payload that can never parse.
    logger.error("[paddle-webhook] signature OK but payload did not parse", err);
    return new Response("Unparseable payload", { status: 400 });
  }

  try {
    if (event.eventType === "transaction.completed") {
      // SDK narrows `event.data` to `TransactionNotification` here.
      const tx = event.data;

      const transactionId = tx.id;
      if (!transactionId) {
        return new Response("Missing transaction id", { status: 400 });
      }

      const customerId = tx.customerId ?? null;

      // Paddle webhook payloads don't reliably inline the customer email /
      // name — fetch the customer record explicitly when we have an id.
      // Both fields feed the per-order watermark in SUB-PR 1.6 (Roadmap §11
      // PII policy: name is OK to embed; email stays server-side).
      let customerEmail: string | null = null;
      let customerName: string | null = null;
      if (customerId) {
        try {
          const customer = await getPaddleClient().customers.get(customerId);
          customerEmail = customer.email ?? null;
          customerName = customer.name ?? null;
        } catch (err) {
          // [Phase B — robustness] Do NOT swallow into a null email: fulfillment
          // then early-returns and we'd respond 200, so Paddle never retries and
          // the paid order is lost. Re-throw → the handler returns 500 → Paddle
          // retries (customer.get failures are usually transient).
          throw err instanceof Error
            ? err
            : new Error(
                `customer.get failed for ${customerId} (tx ${transactionId})`,
              );
        }
      }

      // `customData` is typed loosely by the SDK; narrow `bookIds` defensively.
      const rawBookIds = (tx.customData as { bookIds?: unknown } | null)
        ?.bookIds;
      const bookIds = Array.isArray(rawBookIds)
        ? rawBookIds.filter(
            (x): x is string => typeof x === "string" && x.length > 0,
          )
        : [];

      // Paddle returns money as strings to avoid float precision issues —
      // coerce safely.
      const totals = tx.details?.totals;
      const totalCents = totals?.total ? Number(totals.total) : 0;
      const taxCents = totals?.tax ? Number(totals.tax) : 0;

      const currency = String(tx.currencyCode ?? "USD").toUpperCase();

      await processCompletedTransaction({
        transactionId,
        customerId,
        customerEmail,
        customerName,
        bookIds,
        totalCents,
        taxCents,
        currency,
      });
    } else if (event.eventType === "transaction.payment_failed") {
      // [Phase F] Audit the failed attempt. We still write NO order row: a
      // failed attempt shares its transaction id with the eventual
      // `transaction.completed` (same txn, customer retried), so a `failed`
      // order keyed on `mor_order_ref` would collide with the idempotent
      // completed-insert and BLOCK fulfillment (Phase B finding). The failed
      // STATE lives in the audit trail (commerce_events), queryable by ref.
      await handlePaymentFailure({
        transactionId: event.data.id,
        providerEventId: event.eventId,
        reason: "transaction.payment_failed",
      });
    } else if (event.eventType === "transaction.canceled") {
      // [Phase F] A canceled transaction — same audit-only treatment.
      await handlePaymentFailure({
        transactionId: event.data.id,
        providerEventId: event.eventId,
        reason: "transaction.canceled",
        canceled: true,
      });
    } else if (event.eventType === "adjustment.created") {
      // [Phase F] Refund / chargeback — Paddle models both as adjustments
      // (discriminated by `action`). Mark the referenced order `refunded` and
      // revoke its entitlements so download + reader deny access immediately;
      // recorded in the audit trail and alerted. Idempotent on re-delivery.
      const adj = event.data;
      await handleRefundOrChargeback({
        transactionId: adj.transactionId,
        action: String(adj.action),
        providerEventId: event.eventId,
        reason: `adjustment ${adj.id} (${adj.status})`,
      });
    } else {
      console.log("[paddle-webhook] ignoring event:", event.eventType);
    }
  } catch (err) {
    logger.error("[paddle-webhook] handler failed", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
