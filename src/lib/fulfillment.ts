import { db } from "@/lib/db";
import { getCheckoutItems } from "@/lib/db/queries/catalog";
import { entitlements, orderItems, orders } from "@/lib/db/schema";
import { upsertLocalUser } from "@/lib/db/users";
import {
  FULFILLMENT_EVENT,
  type FulfillmentTransactionCompletedData,
  inngest,
} from "@/lib/inngest/client";

import { appendFulfillmentLogEntry } from "./fulfillment-log";

export interface ProcessCompletedTransactionArgs {
  /** Paddle `transaction_id` — used as the canonical idempotency key. */
  transactionId: string;
  customerId: string | null;
  customerEmail: string | null;
  /** Customer's display name from Paddle (used for the per-order watermark). */
  customerName: string | null;
  /** Book IDs we passed into Paddle via `customData.bookIds`. */
  bookIds: string[];
  totalCents: number;
  taxCents: number;
  /** ISO-4217 currency code, upper-cased. */
  currency: string;
}

/**
 * Idempotent fulfillment of a completed MoR transaction (Roadmap §9, ADR-3).
 *
 * Idempotency primitive:
 *   Paddle's `transaction_id` is mapped onto `orders.mor_order_ref` which
 *   carries a UNIQUE constraint (Roadmap §10, `orders_mor_order_ref_uk`).
 *   The `onConflictDoNothing(target).returning({id})` pattern *atomically*
 *   asks the database "is this the first time?" — a retry (Paddle resends
 *   on a 5xx, or our handler raced with itself) finds an existing row,
 *   returns no rows, and we no-op cleanly. No double-fulfillment.
 *
 * Atomic boundary:
 *   Order + OrderItems + Entitlements(pending) are written inside a single
 *   Drizzle transaction. If any insert mid-way fails, the whole tx rolls
 *   back; Paddle's retry re-attempts cleanly.
 *
 * Watermark enqueue (SUB-PR 1.6):
 *   Once the DB rows are committed, an `inngest.send(...)` event triggers
 *   the watermark worker. If the send itself fails (e.g., Inngest env
 *   missing), the order is still safely committed — we log the failure
 *   to the fulfillment audit log so the worker can be replayed later.
 */
export async function processCompletedTransaction(
  args: ProcessCompletedTransactionArgs,
): Promise<void> {
  const {
    transactionId,
    customerId,
    customerEmail,
    customerName,
    bookIds,
    totalCents,
    taxCents,
    currency,
  } = args;

  if (!customerEmail) {
    console.error("[fulfillment] missing customer email for", transactionId);
    return;
  }
  if (bookIds.length === 0) {
    console.error("[fulfillment] no bookIds in customData for", transactionId);
    return;
  }

  // Idempotent local-user upsert keyed on email (UNIQUE). `auth_provider`
  // gets a Paddle placeholder when this is the first time we see the user;
  // a future Clerk-webhook sync reconciles the row to `clerk:<id>`.
  const localUserId = await upsertLocalUser({
    clerkUserId: customerId ?? "paddle-customer-unknown",
    email: customerEmail,
    name: customerName ?? undefined,
  });

  const books = await getCheckoutItems(bookIds);
  if (books.length === 0) {
    console.error(
      "[fulfillment] none of the bookIds map to published books for",
      transactionId,
      bookIds,
    );
    return;
  }

  // `createdOrderId` is captured from inside the tx so we know whether the
  // current invocation actually fulfilled the order (truthy) or whether it
  // was a Paddle retry of a previously-fulfilled transaction (null).
  let createdOrderId: string | null = null;

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(orders)
      .values({
        userId: localUserId,
        morOrderRef: transactionId,
        totalCents,
        currency,
        taxCents,
        status: "paid",
      })
      .onConflictDoNothing({ target: orders.morOrderRef })
      .returning({ id: orders.id });

    if (inserted.length === 0) {
      // Idempotent path: another invocation already wrote this order.
      return;
    }

    const orderId = inserted[0].id;
    createdOrderId = orderId;

    for (const book of books) {
      await tx.insert(orderItems).values({
        orderId,
        bookId: book.id,
        priceCentsAtPurchase: book.priceCents,
      });

      await tx
        .insert(entitlements)
        .values({
          userId: localUserId,
          bookId: book.id,
          orderId,
          status: "pending",
        })
        .onConflictDoNothing({
          target: [entitlements.userId, entitlements.bookId],
        });
    }
  });

  if (!createdOrderId) {
    console.log(
      `[fulfillment] transaction ${transactionId} already processed (idempotent return)`,
    );
    return;
  }

  // Enqueue the watermark job. Order rows are already committed, so even
  // if the send fails (Inngest env unset, network blip) the canonical
  // record exists in Postgres and the worker can be replayed later by
  // re-dispatching the same event with the same data.
  const eventPayload = {
    transactionId,
    orderId: createdOrderId,
    userId: localUserId,
    buyerName: customerName ?? null,
    buyerEmail: customerEmail,
    bookIds: books.map((b) => b.id),
  } satisfies FulfillmentTransactionCompletedData;

  try {
    await inngest.send({
      name: FULFILLMENT_EVENT,
      data: eventPayload,
    });
    await appendFulfillmentLogEntry({
      timestamp: new Date().toISOString(),
      ...eventPayload,
      totalCents,
      currency,
      note: "watermark-job enqueued via inngest.send",
    });
  } catch (err) {
    console.error("[fulfillment] inngest.send failed:", err);
    await appendFulfillmentLogEntry({
      timestamp: new Date().toISOString(),
      ...eventPayload,
      totalCents,
      currency,
      note: "ENQUEUE FAILED — Inngest unreachable. Order is committed; replay this event manually once Inngest is configured.",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
