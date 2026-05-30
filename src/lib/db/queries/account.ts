/**
 * Account / library queries — strictly personal data, every query keyed
 * on `userId`. None of these queries return rows for any other user.
 *
 * `safeQuery`-wrapped (same discipline as `catalog.ts`) so unprovisioned
 * DB envs degrade to an empty result instead of a 500.
 */

import { db } from "@/lib/db";

async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.warn(
      `[account] ${label} failed (DB unavailable or query error):`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Types — kept narrow on purpose. Each query projects only what its UI needs.
// ---------------------------------------------------------------------------

interface EntitlementBookSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverKey: string | null;
}

export type EntitlementStatus = "pending" | "ready" | "revoked";

export interface OrderEntitlement {
  bookId: string;
  status: EntitlementStatus;
  watermarkedKey: string | null;
  /**
   * Per-book price paid at purchase time (cents). Pulled from
   * `order_items.priceCentsAtPurchase` so it is **historically accurate**
   * — book prices can change later, but the order page must always
   * reflect what the customer actually paid. Null only when the
   * order_items row is missing (degraded state — shouldn't happen in
   * practice, but defensive UI handles the missing-price case).
   */
  priceCentsAtPurchase: number | null;
  book: EntitlementBookSummary;
}

export interface OrderForUser {
  id: string;
  totalCents: number;
  taxCents: number;
  currency: string;
  morOrderRef: string;
  createdAt: Date;
  entitlements: OrderEntitlement[];
}

export type ReadStatus = "not_started" | "reading" | "finished";

export interface LibraryEntry {
  bookId: string;
  status: EntitlementStatus;
  watermarkedKey: string | null;
  /** Phase 2.B — independent reading lifecycle (default not_started). */
  readStatus: ReadStatus;
  /** Phase 2.B — set on every successful `downloadBook` call; null until
   *  the user pulls the file for the first time. Drives the "Downloaded"
   *  filter tab on /account/library. */
  lastDownloadedAt: Date | null;
  createdAt: Date;
  book: EntitlementBookSummary;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch a single order *only if it belongs to the given user*.
 *
 * Ownership is enforced in the `WHERE` clause (`o.userId = userId`), so
 * the function returns `null` both when the order does not exist and when
 * it exists but belongs to someone else — callers cannot distinguish the
 * two, which is the right answer for both UX and security (no enumeration).
 */
export async function getOrderForUser(args: {
  orderId: string;
  userId: string;
}): Promise<OrderForUser | null> {
  return safeQuery(
    "getOrderForUser",
    async () => {
      const order = await db.query.orders.findFirst({
        where: (o, { eq, and }) =>
          and(eq(o.id, args.orderId), eq(o.userId, args.userId)),
        columns: {
          id: true,
          totalCents: true,
          taxCents: true,
          currency: true,
          morOrderRef: true,
          createdAt: true,
        },
        with: {
          entitlements: {
            columns: { bookId: true, status: true, watermarkedKey: true },
            with: {
              book: {
                columns: {
                  id: true,
                  slug: true,
                  title: true,
                  subtitle: true,
                  coverKey: true,
                },
              },
            },
          },
          // Pull order_items alongside so we can join per-book price into
          // each entitlement view. `priceCentsAtPurchase` is the snapshot
          // the customer paid — never the current books.price_cents.
          // Relation name on `orders` is `items` (see ordersRelations in
          // schema.ts).
          items: {
            columns: { bookId: true, priceCentsAtPurchase: true },
          },
        },
      });
      if (!order) return null;

      // Build a (bookId → price) map once, then merge into entitlements.
      const priceByBookId = new Map<string, number>();
      for (const item of order.items) {
        priceByBookId.set(item.bookId, item.priceCentsAtPurchase);
      }

      return {
        id: order.id,
        totalCents: order.totalCents,
        taxCents: order.taxCents,
        currency: order.currency,
        morOrderRef: order.morOrderRef,
        createdAt: order.createdAt,
        entitlements: order.entitlements.map((e) => ({
          bookId: e.bookId,
          status: e.status,
          watermarkedKey: e.watermarkedKey,
          priceCentsAtPurchase: priceByBookId.get(e.bookId) ?? null,
          book: e.book,
        })),
      };
    },
    null,
  );
}

// ---------------------------------------------------------------------------
// Order history — for `/account/orders`.
// ---------------------------------------------------------------------------

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface UserOrderSummaryItem {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  priceCentsAtPurchase: number;
}

export interface UserOrderSummary {
  id: string;
  morOrderRef: string;
  totalCents: number;
  taxCents: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  items: UserOrderSummaryItem[];
}

/**
 * Chronological order history for one user, newest first.
 * Keyed strictly on `userId`; no enumeration possible.
 */
export async function getUserOrders(userId: string): Promise<UserOrderSummary[]> {
  return safeQuery(
    "getUserOrders",
    async () => {
      const rows = await db.query.orders.findMany({
        where: (o, { eq }) => eq(o.userId, userId),
        orderBy: (o, { desc }) => desc(o.createdAt),
        columns: {
          id: true,
          morOrderRef: true,
          totalCents: true,
          taxCents: true,
          currency: true,
          status: true,
          createdAt: true,
        },
        with: {
          items: {
            columns: { bookId: true, priceCentsAtPurchase: true },
            with: {
              book: { columns: { slug: true, title: true } },
            },
          },
        },
      });
      return rows.map((o) => ({
        id: o.id,
        morOrderRef: o.morOrderRef,
        totalCents: o.totalCents,
        taxCents: o.taxCents,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          bookId: i.bookId,
          bookTitle: i.book.title,
          bookSlug: i.book.slug,
          priceCentsAtPurchase: i.priceCentsAtPurchase,
        })),
      }));
    },
    [],
  );
}

/**
 * All entitlements (across orders) for one user, newest first.
 * This is the source of truth for `/account/library`.
 */
export async function getUserLibrary(userId: string): Promise<LibraryEntry[]> {
  return safeQuery(
    "getUserLibrary",
    async () => {
      const rows = await db.query.entitlements.findMany({
        where: (e, { eq }) => eq(e.userId, userId),
        orderBy: (e, { desc }) => desc(e.createdAt),
        columns: {
          bookId: true,
          status: true,
          watermarkedKey: true,
          readStatus: true,
          lastDownloadedAt: true,
          createdAt: true,
        },
        with: {
          book: {
            columns: {
              id: true,
              slug: true,
              title: true,
              subtitle: true,
              coverKey: true,
            },
          },
        },
      });
      return rows.map((r) => ({
        bookId: r.bookId,
        status: r.status,
        watermarkedKey: r.watermarkedKey,
        readStatus: r.readStatus,
        lastDownloadedAt: r.lastDownloadedAt,
        createdAt: r.createdAt,
        book: r.book,
      }));
    },
    [],
  );
}
