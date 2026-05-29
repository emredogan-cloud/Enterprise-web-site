import { db } from "@/lib/db";
import { getCheckoutItems } from "@/lib/db/queries/catalog";
import { entitlements, orderItems, orders } from "@/lib/db/schema";
import { upsertLocalUser } from "@/lib/db/users";

import { appendFulfillmentLogEntry } from "./fulfillment-log";

export interface ProcessCompletedTransactionArgs {
  /** Paddle `transaction_id` — used as the canonical idempotency key. */
  transactionId: string;
  customerId: string | null;
  customerEmail: string | null;
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
 *   The `onConflictDoNothing(target: mor_order_ref).returning({id})` pattern
 *   *atomically* asks the database "is this the first time?" — a retry
 *   (Paddle resends on a 5xx) finds an existing row, returns no rows, and
 *   we no-op cleanly. No double-fulfillment is possible.
 *
 * Atomic boundary:
 *   Order + OrderItems + Entitlements(pending) are written inside a single
 *   Drizzle transaction. If any insert mid-way fails (e.g., a book vanished
 *   between checkout and webhook), the whole tx rolls back; Paddle's retry
 *   re-attempts cleanly.
 *
 * Watermark enqueue:
 *   Deferred to SUB-PR 1.6. For now we append an audit entry to the
 *   fulfillment log so the boundary is observable while the real queue
 *   (Inngest / Vercel Queues) is wired in.
 */
export async function processCompletedTransaction(
  args: ProcessCompletedTransactionArgs,
): Promise<void> {
  const {
    transactionId,
    customerId,
    customerEmail,
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

  // PLACEHOLDER: SUB-PR 1.6 replaces this with the real watermark queue.
  await appendFulfillmentLogEntry({
    timestamp: new Date().toISOString(),
    transactionId,
    orderId: createdOrderId,
    userId: localUserId,
    email: customerEmail,
    bookIds: books.map((b) => b.id),
    totalCents,
    currency,
    note: "watermark-queue placeholder; SUB-PR 1.6 wires Inngest/Vercel Queues",
  });
}
