import { describe, expect, it } from "vitest";

import type { UserOrderSummary } from "@/lib/db/queries/account";

import {
  ORDERS_PAGE_SIZE,
  filterSortOrders,
  pageCountFor,
  pageSlice,
} from "./orders-filtering";

function makeOrder(over: Partial<UserOrderSummary> & { id: string }): UserOrderSummary {
  return {
    id: over.id,
    morOrderRef: over.morOrderRef ?? `mor-${over.id}`,
    totalCents: over.totalCents ?? 1000,
    taxCents: over.taxCents ?? 0,
    currency: over.currency ?? "USD",
    status: over.status ?? "paid",
    createdAt: over.createdAt ?? new Date("2026-01-01T00:00:00Z"),
    items: over.items ?? [
      {
        bookId: `b-${over.id}`,
        bookTitle: "Untitled",
        bookSlug: `s-${over.id}`,
        priceCentsAtPurchase: 1000,
      },
    ],
  };
}

const ORDERS: UserOrderSummary[] = [
  makeOrder({
    id: "aaa",
    status: "paid",
    totalCents: 3000,
    createdAt: new Date("2026-03-01T00:00:00Z"),
    items: [
      { bookId: "b1", bookTitle: "The Emerald Atlas", bookSlug: "emerald-atlas", priceCentsAtPurchase: 3000 },
    ],
  }),
  makeOrder({
    id: "bbb",
    status: "pending",
    totalCents: 1200,
    createdAt: new Date("2026-02-01T00:00:00Z"),
    items: [
      { bookId: "b2", bookTitle: "Dune Notes", bookSlug: "dune-notes", priceCentsAtPurchase: 1200 },
    ],
  }),
  makeOrder({
    id: "ccc",
    status: "refunded",
    totalCents: 9900,
    createdAt: new Date("2026-01-15T00:00:00Z"),
    morOrderRef: "PAD-REFUND-77",
    items: [
      { bookId: "b3", bookTitle: "Cartography", bookSlug: "cartography", priceCentsAtPurchase: 9900 },
    ],
  }),
];

describe("filterSortOrders", () => {
  it("returns all orders newest-first by default", () => {
    const out = filterSortOrders(ORDERS, { query: "", status: "all", sort: "newest" });
    expect(out.map((o) => o.id)).toEqual(["aaa", "bbb", "ccc"]);
  });

  it("does not mutate the input array", () => {
    const snapshot = ORDERS.map((o) => o.id);
    filterSortOrders(ORDERS, { query: "", status: "all", sort: "oldest" });
    expect(ORDERS.map((o) => o.id)).toEqual(snapshot);
  });

  it("filters by status", () => {
    const out = filterSortOrders(ORDERS, { query: "", status: "pending", sort: "newest" });
    expect(out.map((o) => o.id)).toEqual(["bbb"]);
  });

  it("matches free-text against book title (case-insensitive)", () => {
    const out = filterSortOrders(ORDERS, { query: "emerald", status: "all", sort: "newest" });
    expect(out.map((o) => o.id)).toEqual(["aaa"]);
  });

  it("matches free-text against the MoR ref", () => {
    const out = filterSortOrders(ORDERS, { query: "pad-refund", status: "all", sort: "newest" });
    expect(out.map((o) => o.id)).toEqual(["ccc"]);
  });

  it("sorts oldest-first", () => {
    const out = filterSortOrders(ORDERS, { query: "", status: "all", sort: "oldest" });
    expect(out.map((o) => o.id)).toEqual(["ccc", "bbb", "aaa"]);
  });

  it("sorts by amount high→low and low→high", () => {
    const high = filterSortOrders(ORDERS, { query: "", status: "all", sort: "amount-high" });
    expect(high.map((o) => o.totalCents)).toEqual([9900, 3000, 1200]);
    const low = filterSortOrders(ORDERS, { query: "", status: "all", sort: "amount-low" });
    expect(low.map((o) => o.totalCents)).toEqual([1200, 3000, 9900]);
  });

  it("combines status filter + search + sort", () => {
    const out = filterSortOrders(ORDERS, { query: "cartography", status: "refunded", sort: "newest" });
    expect(out.map((o) => o.id)).toEqual(["ccc"]);
    const none = filterSortOrders(ORDERS, { query: "cartography", status: "paid", sort: "newest" });
    expect(none).toEqual([]);
  });
});

describe("pagination", () => {
  it("computes page count (min 1)", () => {
    expect(pageCountFor(0)).toBe(1);
    expect(pageCountFor(ORDERS_PAGE_SIZE)).toBe(1);
    expect(pageCountFor(ORDERS_PAGE_SIZE + 1)).toBe(2);
    expect(pageCountFor(ORDERS_PAGE_SIZE * 3)).toBe(3);
  });

  it("slices a page and clamps out-of-range pages", () => {
    const items = Array.from({ length: 12 }, (_, i) => i);
    expect(pageSlice(items, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(pageSlice(items, 3)).toEqual([10, 11]);
    // page 99 clamps to the last page
    expect(pageSlice(items, 99)).toEqual([10, 11]);
    // page 0 / negative clamps to the first page
    expect(pageSlice(items, 0)).toEqual([0, 1, 2, 3, 4]);
  });
});
