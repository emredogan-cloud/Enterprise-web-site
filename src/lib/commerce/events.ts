/**
 * Commerce audit trail (Phase F) — append-only record of every MoR lifecycle
 * transition (paid / payment_failed / transaction_canceled / refunded /
 * chargeback / revoked), backed by the `commerce_events` table.
 *
 * This is the source of truth for "a purchased book's state history is
 * VISIBLE, AUDITABLE and RECOVERABLE" and the data layer for support
 * visibility. Writes are best-effort and idempotent; reads are read-only.
 */

import { db } from "@/lib/db";
import { commerceEvents } from "@/lib/db/schema";

export type CommerceEventType =
  | "paid"
  | "payment_failed"
  | "transaction_canceled"
  | "refunded"
  | "chargeback"
  | "revoked";

export interface RecordCommerceEventArgs {
  type: CommerceEventType;
  /** Paddle event id (`evt_…`) — UNIQUE → idempotent webhook re-delivery. */
  providerEventId?: string | null;
  /** Paddle transaction id (`txn_…`); mirrors `orders.mor_order_ref`. */
  morOrderRef?: string | null;
  orderId?: string | null;
  entitlementId?: string | null;
  reason?: string | null;
}

/**
 * Append one audit row. **Idempotent** on `providerEventId` (UNIQUE) — a
 * re-delivered Paddle webhook records exactly one row. **Best-effort:** never
 * throws (an audit-write failure must never break the webhook / fulfillment /
 * revocation path). Returns `true` if a row was written, `false` if it was
 * deduplicated or the write failed.
 */
export async function recordCommerceEvent(
  args: RecordCommerceEventArgs,
): Promise<boolean> {
  try {
    const inserted = await db
      .insert(commerceEvents)
      .values({
        type: args.type,
        providerEventId: args.providerEventId ?? null,
        morOrderRef: args.morOrderRef ?? null,
        orderId: args.orderId ?? null,
        entitlementId: args.entitlementId ?? null,
        reason: args.reason?.slice(0, 500) ?? null,
      })
      // NULL provider ids never conflict (Postgres treats NULLs as distinct),
      // so non-provider events (e.g. support actions) always record; Paddle
      // events (provider id present) dedupe on re-delivery.
      .onConflictDoNothing({ target: commerceEvents.providerEventId })
      .returning({ id: commerceEvents.id });
    return inserted.length > 0;
  } catch (err) {
    console.error("[commerce-events] record failed:", err);
    return false;
  }
}

export interface CommerceEventRow {
  id: string;
  type: CommerceEventType;
  morOrderRef: string | null;
  orderId: string | null;
  entitlementId: string | null;
  reason: string | null;
  createdAt: Date;
}

const EVENT_COLUMNS = {
  id: true,
  type: true,
  morOrderRef: true,
  orderId: true,
  entitlementId: true,
  reason: true,
  createdAt: true,
} as const;

/** Support visibility — full audit timeline for an order, newest first. */
export async function getCommerceEventsForOrder(
  orderId: string,
): Promise<CommerceEventRow[]> {
  return db.query.commerceEvents.findMany({
    where: (e, { eq }) => eq(e.orderId, orderId),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
    columns: EVENT_COLUMNS,
  });
}

/**
 * Support visibility — audit timeline by Paddle transaction ref. Covers events
 * that have no order row (e.g. a `payment_failed` attempt that never completed).
 */
export async function getCommerceEventsForRef(
  morOrderRef: string,
): Promise<CommerceEventRow[]> {
  return db.query.commerceEvents.findMany({
    where: (e, { eq }) => eq(e.morOrderRef, morOrderRef),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
    columns: EVENT_COLUMNS,
  });
}
