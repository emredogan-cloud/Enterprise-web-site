import type { NextRequest } from "next/server";

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

  let event;
  try {
    event = await getPaddleClient().webhooks.unmarshal(
      rawBody,
      webhookSecret,
      signature,
    );
  } catch (err) {
    logger.error("[paddle-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 401 });
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
          console.warn("[paddle-webhook] customer.get failed:", err);
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
    } else {
      console.log("[paddle-webhook] ignoring event:", event.eventType);
    }
  } catch (err) {
    logger.error("[paddle-webhook] handler failed", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
