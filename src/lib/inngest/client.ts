import { Inngest } from "inngest";

/**
 * Inngest client (v4).
 *
 * `id` is the app identifier in Inngest Cloud. Keep stable — renaming
 * resets historical run state for any in-flight job.
 *
 * Construction is cheap and idempotent — no network at instantiation.
 * `inngest.send(...)` is the first call that requires `INNGEST_EVENT_KEY`,
 * so this module stays import-time safe even when the env is unset
 * (build / unprovisioned dev / CI smoke runs still pass).
 *
 * Event typing:
 *   Inngest v4 removed the v3-style `EventSchemas`. We keep payload
 *   shapes aligned across producers and consumers via the local TS
 *   contracts exported below — producers use `satisfies` at the call
 *   site, consumers cast `event.data` through the same interface. A
 *   future SUB-PR can wire Zod/StandardSchema-based trigger validation
 *   if/when payloads need server-side guarantees beyond TypeScript.
 */
export const inngest = new Inngest({
  id: "digital-bookstore",
});

// ---------------------------------------------------------------------------
// Event contracts (the single source of truth for producer ↔ consumer wire)
// ---------------------------------------------------------------------------

export const FULFILLMENT_EVENT = "fulfillment.transaction.completed" as const;

export interface FulfillmentTransactionCompletedData {
  /** Paddle transaction id (mirrors `orders.mor_order_ref`). */
  transactionId: string;
  /** Our local order UUID. */
  orderId: string;
  /** Our local user UUID. */
  userId: string;
  /** Customer display name from Paddle (used in the watermark). */
  buyerName: string | null;
  /** Customer email (server-side only — never embedded in the artifact). */
  buyerEmail: string;
  /** Book IDs to watermark — one event drives N step.run calls. */
  bookIds: string[];
}
