/**
 * Commerce lifecycle transitions (Phase F) — the order/entitlement state
 * machine driven by Paddle MoR webhooks beyond the happy path:
 *
 *   transaction.payment_failed / .canceled → audit (no order row)
 *   adjustment.created (refund / chargeback) → order `refunded` + entitlements
 *                                              `revoked` + audit + alert
 *
 * Goal (Phase F): a purchased book can be paid / failed / refunded / revoked,
 * and every transition is VISIBLE (audit trail), AUDITABLE (commerce_events) and
 * RECOVERABLE (idempotent, replayable). The revoked gate is already enforced by
 * the download (Phase D) and reader (Phase E) paths, which require
 * status==='ready' — so revoking flips access off with no change at those call
 * sites.
 */

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { entitlements, orders } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

import { recordCommerceEvent } from "./events";

// Paddle adjustment actions that return money / dispute the charge → revoke.
// 'credit', 'credit_reverse', 'chargeback_reverse' do NOT revoke (audit only).
const REVOKING_ACTIONS = new Set([
  "refund",
  "chargeback",
  "chargeback_warning",
]);

// ---------------------------------------------------------------------------
// Revocation lifecycle (reusable: refund/chargeback handler + future support
// action). Marks the order `refunded` and ALL its entitlements `revoked`,
// atomically, then audits each transition.
// ---------------------------------------------------------------------------
export interface RevokeOrderArgs {
  orderId: string;
  transactionId: string;
  /** Audit event type for the order transition. */
  eventType: "refunded" | "chargeback";
  providerEventId?: string | null;
  reason?: string | null;
}

export async function revokeEntitlementsForOrder(
  args: RevokeOrderArgs,
): Promise<{ revokedIds: string[] }> {
  let revokedIds: string[] = [];

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ status: "refunded" })
      .where(eq(orders.id, args.orderId));

    // Revoke ONLY this order's entitlements (never another order's grant for
    // the same book → a legitimate re-purchase keeps its access).
    const revoked = await tx
      .update(entitlements)
      .set({ status: "revoked" })
      .where(eq(entitlements.orderId, args.orderId))
      .returning({ id: entitlements.id });
    revokedIds = revoked.map((r) => r.id);
  });

  // Audit: one order-level event + one per revoked entitlement.
  await recordCommerceEvent({
    type: args.eventType,
    providerEventId: args.providerEventId,
    morOrderRef: args.transactionId,
    orderId: args.orderId,
    reason: args.reason ?? `${args.eventType}: ${revokedIds.length} entitlement(s) revoked`,
  });
  for (const entitlementId of revokedIds) {
    await recordCommerceEvent({
      type: "revoked",
      // Per-entitlement provider id keeps re-delivery idempotent without
      // colliding with the order-level event's id.
      providerEventId: args.providerEventId
        ? `${args.providerEventId}:${entitlementId}`
        : null,
      morOrderRef: args.transactionId,
      orderId: args.orderId,
      entitlementId,
      reason: `revoked via ${args.eventType}`,
    });
  }

  return { revokedIds };
}

// ---------------------------------------------------------------------------
// Refund / chargeback (Paddle `adjustment.created`)
// ---------------------------------------------------------------------------
export interface RefundOrChargebackArgs {
  /** Paddle transaction id the adjustment is against (→ orders.mor_order_ref). */
  transactionId: string;
  /** Paddle adjustment action: refund | chargeback | chargeback_warning | credit | … */
  action: string;
  /** Paddle event id (`evt_…`) — idempotency + audit. */
  providerEventId?: string | null;
  /** Paddle adjustment id (`adj_…`) / human note for the audit reason. */
  reason?: string | null;
}

export interface RefundResult {
  orderFound: boolean;
  revoked: boolean;
  revokedCount: number;
  alreadyRefunded: boolean;
}

export async function handleRefundOrChargeback(
  args: RefundOrChargebackArgs,
): Promise<RefundResult> {
  const { transactionId, action, providerEventId, reason } = args;
  const eventType = action.startsWith("chargeback") ? "chargeback" : "refunded";

  // Non-revoking adjustments (credit, reversal) → audit only, never revoke.
  if (!REVOKING_ACTIONS.has(action)) {
    await recordCommerceEvent({
      type: eventType,
      providerEventId,
      morOrderRef: transactionId,
      reason: `adjustment.${action} (no revoke)`,
    });
    logger.warn(`[commerce] non-revoking adjustment '${action}'`, {
      transactionId,
    });
    return { orderFound: false, revoked: false, revokedCount: 0, alreadyRefunded: false };
  }

  const order = await db.query.orders.findFirst({
    where: (o, { eq: _eq }) => _eq(o.morOrderRef, transactionId),
    columns: { id: true, status: true },
  });

  if (!order) {
    // Money returned but we have no order (fulfillment never completed, or a
    // foreign transaction). Audit + alert; nothing to revoke.
    logger.error(
      `[commerce] ALERT: ${eventType} for unknown transaction ${transactionId}`,
      undefined,
      { transactionId, action },
    );
    await recordCommerceEvent({
      type: eventType,
      providerEventId,
      morOrderRef: transactionId,
      reason: `${action}: no matching order`,
    });
    return { orderFound: false, revoked: false, revokedCount: 0, alreadyRefunded: false };
  }

  // Idempotency: a re-delivered adjustment must not re-revoke / double-audit.
  if (order.status === "refunded") {
    await recordCommerceEvent({
      type: eventType,
      providerEventId,
      morOrderRef: transactionId,
      orderId: order.id,
      reason: `${action}: order already refunded (idempotent no-op)`,
    });
    return { orderFound: true, revoked: false, revokedCount: 0, alreadyRefunded: true };
  }

  const { revokedIds } = await revokeEntitlementsForOrder({
    orderId: order.id,
    transactionId,
    eventType,
    providerEventId,
    reason: reason
      ? `${action} (${reason})`
      : `${action}: order refunded, entitlements revoked`,
  });

  // Operational alert — a refund/chargeback is money out + access revoked.
  logger.error(
    `[commerce] ALERT: ${eventType} — order ${order.id} refunded, ${revokedIds.length} entitlement(s) revoked`,
    undefined,
    { transactionId, action, orderId: order.id, revokedCount: revokedIds.length },
  );

  return {
    orderFound: true,
    revoked: true,
    revokedCount: revokedIds.length,
    alreadyRefunded: false,
  };
}

// ---------------------------------------------------------------------------
// Failed / canceled payment (Paddle `transaction.payment_failed` / `.canceled`)
// ---------------------------------------------------------------------------
export interface PaymentFailureArgs {
  transactionId: string;
  providerEventId?: string | null;
  reason?: string | null;
  /** true → `transaction.canceled`; false/undefined → `transaction.payment_failed`. */
  canceled?: boolean;
}

/**
 * Record a failed / canceled payment attempt in the audit trail.
 *
 * **Deliberately writes NO order row.** A failed (or canceled) attempt shares
 * its `transaction_id` with the eventual `transaction.completed` (the customer
 * may retry the same transaction), so inserting a `failed` order keyed on
 * `mor_order_ref` would collide with the idempotent completed-insert and BLOCK
 * fulfillment (the Phase B finding). The failed STATE is therefore captured as
 * an audit event — visible, auditable, queryable by transaction ref — without
 * compromising the proven completed → fulfillment path.
 */
export async function handlePaymentFailure(
  args: PaymentFailureArgs,
): Promise<void> {
  const type = args.canceled ? "transaction_canceled" : "payment_failed";
  await recordCommerceEvent({
    type,
    providerEventId: args.providerEventId,
    morOrderRef: args.transactionId,
    reason: args.reason ?? null,
  });
  logger.warn(`[commerce] ${type}`, {
    transactionId: args.transactionId,
    reason: args.reason ?? undefined,
  });
}
