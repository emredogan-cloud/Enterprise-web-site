/**
 * Admin dashboard queries (Roadmap §6 — admin IA, SUB-PR 4.1).
 *
 * Every public function in this file begins with `await requireAdmin()` —
 * the strict AuthZ gate that throws `AdminAccessError` for any
 * non-admin / unsigned / unconfigured caller. Calling `requireAdmin`
 * from inside each query is defense-in-depth: even if a query were
 * accidentally imported into a non-admin route, it can never leak
 * aggregated revenue / customer data without an admin session.
 *
 * `requireAdmin` is wrapped with React's `cache()` so calling it from
 * N admin queries in the same request still does just one Clerk API
 * call + one allowlist check + one local-user upsert.
 *
 * Database failures (unprovisioned DB, query errors) are absorbed by the
 * local `safeQuery` wrapper — same discipline as `catalog.ts` /
 * `account.ts` / `reviews.ts`. AuthZ failures are NOT absorbed; they
 * bubble out so the page can render the correct "not authorized" notice.
 */

import { desc, eq, sql } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders, users } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// safeQuery — DB-failure fallback only. AuthZ errors bypass this wrapper.
// ---------------------------------------------------------------------------
async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.warn(
      `[admin] ${label} failed (DB unavailable or query error):`,
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RevenueByCurrency {
  /** ISO-4217 currency code (e.g., "USD"). */
  currency: string;
  /** Sum of `total_cents - tax_cents` across all paid orders in this currency. */
  netCents: number;
  /** Sum of `total_cents` across all paid orders in this currency. */
  grossCents: number;
  /** Sum of `tax_cents` across all paid orders in this currency. */
  taxCents: number;
  /** Number of paid orders contributing to the above sums. */
  orderCount: number;
}

export interface DashboardMetrics {
  /**
   * Per-currency revenue rollup, sorted by net descending. Empty array
   * means "no paid orders yet" — the UI should render a $0 placeholder
   * rather than picking a misleading default currency.
   */
  revenueByCurrency: RevenueByCurrency[];
  /** Count of order_items across all paid orders. */
  booksSold: number;
  /** Count of rows in `users`. */
  totalUsers: number;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface RecentOrderItem {
  bookTitle: string;
  bookSlug: string;
  priceCentsAtPurchase: number;
}

export interface RecentOrder {
  id: string;
  morOrderRef: string;
  totalCents: number;
  taxCents: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  customerEmail: string;
  customerName: string | null;
  items: RecentOrderItem[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const EMPTY_METRICS: DashboardMetrics = {
  revenueByCurrency: [],
  booksSold: 0,
  totalUsers: 0,
};

/**
 * Snapshot of the three headline metrics in one logical call.
 *
 * Performs three small `select` queries in parallel:
 *   - per-currency revenue rollup from `orders` WHERE status = 'paid'
 *   - books-sold count from `order_items` JOIN paid orders
 *   - total `users` count
 *
 * All three are SQL aggregates (one round-trip each); they scale beyond
 * tens of thousands of rows without dragging row data into the app server.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await requireAdmin();

  return safeQuery(
    "getDashboardMetrics",
    async () => {
      const [revenueRows, booksSoldRow, usersRow] = await Promise.all([
        // --- Per-currency revenue ----------------------------------------
        // `::int` casts the Postgres `numeric` sum to a JS-friendly
        // number; without it Drizzle marshals as `string`.
        db
          .select({
            currency: orders.currency,
            netCents: sql<number>`COALESCE(SUM(${orders.totalCents} - ${orders.taxCents}), 0)::int`,
            grossCents: sql<number>`COALESCE(SUM(${orders.totalCents}), 0)::int`,
            taxCents: sql<number>`COALESCE(SUM(${orders.taxCents}), 0)::int`,
            orderCount: sql<number>`COUNT(*)::int`,
          })
          .from(orders)
          .where(eq(orders.status, "paid"))
          .groupBy(orders.currency)
          .orderBy(
            // Largest net-revenue currency first — the dashboard headline
            // picks this row.
            desc(
              sql`COALESCE(SUM(${orders.totalCents} - ${orders.taxCents}), 0)`,
            ),
          ),

        // --- Books sold (count of order_items in paid orders) ------------
        db
          .select({
            count: sql<number>`COUNT(${orderItems.id})::int`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(eq(orders.status, "paid")),

        // --- Total users -------------------------------------------------
        db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(users),
      ]);

      return {
        revenueByCurrency: revenueRows,
        booksSold: booksSoldRow[0]?.count ?? 0,
        totalUsers: usersRow[0]?.count ?? 0,
      };
    },
    EMPTY_METRICS,
  );
}

/**
 * The most recent `limit` orders (default 10) with the customer email/
 * name and each line item's book title — exactly what the dashboard's
 * "Recent orders" table needs.
 *
 * Uses Drizzle's relational query API (same shape as `account.getUserOrders`
 * but unconstrained by `userId`).
 */
export async function getRecentOrders(
  limit: number = 10,
): Promise<RecentOrder[]> {
  await requireAdmin();

  return safeQuery(
    "getRecentOrders",
    async () => {
      const rows = await db.query.orders.findMany({
        orderBy: (o, { desc: descFn }) => descFn(o.createdAt),
        limit,
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
          user: { columns: { email: true, name: true } },
          items: {
            columns: { priceCentsAtPurchase: true },
            with: {
              book: { columns: { title: true, slug: true } },
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
        customerEmail: o.user.email,
        customerName: o.user.name,
        items: o.items.map((i) => ({
          bookTitle: i.book.title,
          bookSlug: i.book.slug,
          priceCentsAtPurchase: i.priceCentsAtPurchase,
        })),
      }));
    },
    [],
  );
}

