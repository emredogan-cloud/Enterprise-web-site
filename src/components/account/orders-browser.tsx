"use client";

import { useMemo, useState } from "react";

import { RevealOnScroll } from "@/components/home/reveal-on-scroll";
import type { UserOrderSummary } from "@/lib/db/queries/account";

import { OrderCard } from "./order-card";
import { OrderPagination } from "./order-pagination";
import {
  OrdersFilterBar,
  type OrderSort,
  type OrderStatusFilter,
} from "./orders-filter-bar";
import {
  ORDERS_PAGE_SIZE,
  filterSortOrders,
  pageCountFor,
} from "./orders-filtering";

/**
 * OrdersBrowser — the interactive heart of `/account/orders`.
 *
 * Holds search / status / sort / page state and renders the filter bar, the
 * filtered + sorted + paginated `<OrderCard>` list, and the pager. The full
 * order list is already fetched server-side, so all filtering is in-memory
 * (no round-trips). Changing any filter resets to page 1.
 *
 * The card list is keyed on `status|sort|page` so it re-staggers its reveal
 * on those changes; query-filtered swaps on the same page render immediately
 * (cards added after mount simply have no reveal attribute → fully visible),
 * which keeps the list correct under live search.
 */

export function OrdersBrowser({ orders }: { orders: UserOrderSummary[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [sort, setSort] = useState<OrderSort>("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => filterSortOrders(orders, { query, status, sort }),
    [orders, query, status, sort],
  );

  const pageCount = pageCountFor(filtered.length);
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * ORDERS_PAGE_SIZE,
    safePage * ORDERS_PAGE_SIZE,
  );

  // Any filter change returns to the first page.
  const onQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const onStatus = (v: OrderStatusFilter) => {
    setStatus(v);
    setPage(1);
  };
  const onSort = (v: OrderSort) => {
    setSort(v);
    setPage(1);
  };
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <OrdersFilterBar
        query={query}
        status={status}
        sort={sort}
        onQuery={onQuery}
        onStatus={onStatus}
        onSort={onSort}
      />

      {filtered.length === 0 ? (
        <FilteredEmpty onReset={resetFilters} />
      ) : (
        <>
          <RevealOnScroll
            stagger
            key={`${status}-${sort}-${safePage}`}
            className="space-y-4"
          >
            {pageItems.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </RevealOnScroll>

          <OrderPagination
            page={safePage}
            pageCount={pageCount}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}

function FilteredEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div className="home-glass relative overflow-hidden rounded-[24px] p-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/35 to-transparent"
      />
      <p className="font-serif text-[18px] font-medium leading-tight text-fg-hi sm:text-[20px]">
        No orders match those filters
      </p>
      <p className="mt-2 text-sm text-fg-mid">
        Try a different status or clear your search.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="home-cta-secondary mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
      >
        Reset filters
      </button>
    </div>
  );
}
