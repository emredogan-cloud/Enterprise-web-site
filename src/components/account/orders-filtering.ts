import type { UserOrderSummary } from "@/lib/db/queries/account";

import type { OrderSort, OrderStatusFilter } from "./orders-filter-bar";

/**
 * Pure filter / sort / pagination helpers for the order history.
 *
 * Extracted from `<OrdersBrowser>` so the logic is unit-testable without a
 * DOM (the component itself pulls in `RevealOnScroll`, which needs
 * IntersectionObserver). The browser just wires these to its UI state.
 */

export const ORDERS_PAGE_SIZE = 5;

/**
 * Filter by status + free-text (matches order id, MoR ref, or any book
 * title), then sort. Returns a NEW array; the input is never mutated.
 */
export function filterSortOrders(
  orders: ReadonlyArray<UserOrderSummary>,
  opts: { query: string; status: OrderStatusFilter; sort: OrderSort },
): UserOrderSummary[] {
  const needle = opts.query.trim().toLowerCase();

  const list = orders.filter((o) => {
    if (opts.status !== "all" && o.status !== opts.status) return false;
    if (needle) {
      const hay = `${o.id} ${o.morOrderRef} ${o.items
        .map((i) => i.bookTitle)
        .join(" ")}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  return list.sort((a, b) => {
    switch (opts.sort) {
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "amount-high":
        return b.totalCents - a.totalCents;
      case "amount-low":
        return a.totalCents - b.totalCents;
      case "newest":
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });
}

/** Number of pages for `total` items — always at least 1. */
export function pageCountFor(total: number, pageSize = ORDERS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** The slice of items for a 1-based page, clamping the page into range. */
export function pageSlice<T>(
  items: ReadonlyArray<T>,
  page: number,
  pageSize = ORDERS_PAGE_SIZE,
): T[] {
  const pages = pageCountFor(items.length, pageSize);
  const safePage = Math.min(Math.max(1, page), pages);
  return items.slice((safePage - 1) * pageSize, safePage * pageSize);
}
