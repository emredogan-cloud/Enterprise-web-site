import { ChevronDown, Search } from "lucide-react";

/**
 * OrdersFilterBar — the glass "management layer" above the order list:
 * a search input + status filter + sort selector. Presentational and
 * fully controlled by `<OrdersBrowser>`. Native `<select>`s (styled glass,
 * appearance-none + chevron) keep keyboard + screen-reader behavior for
 * free — luxury control system, not an enterprise grid.
 */

export type OrderStatusFilter = "all" | "paid" | "pending" | "failed" | "refunded";
export type OrderSort = "newest" | "oldest" | "amount-high" | "amount-low";

const STATUS_OPTIONS: ReadonlyArray<{ value: OrderStatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Completed" },
  { value: "pending", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: OrderSort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount-high", label: "Amount: high to low" },
  { value: "amount-low", label: "Amount: low to high" },
];

export function OrdersFilterBar({
  query,
  status,
  sort,
  onQuery,
  onStatus,
  onSort,
}: {
  query: string;
  status: OrderStatusFilter;
  sort: OrderSort;
  onQuery: (v: string) => void;
  onStatus: (v: OrderStatusFilter) => void;
  onSort: (v: OrderSort) => void;
}) {
  return (
    <div className="home-glass relative overflow-hidden rounded-[20px] p-3 sm:p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/35 to-transparent"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <label className="relative flex-1">
          <Search
            aria-hidden
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search orders…"
            aria-label="Search orders"
            className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-fg-hi outline-none transition-colors placeholder:text-fg-soft focus:border-emerald-bright/40 focus:bg-white/[0.05]"
          />
        </label>

        {/* Status filter */}
        <GlassSelect
          ariaLabel="Filter by status"
          value={status}
          onChange={onStatus}
          options={STATUS_OPTIONS}
        />

        {/* Sort */}
        <GlassSelect
          ariaLabel="Sort orders"
          value={sort}
          onChange={onSort}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}

function GlassSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  ariaLabel: string;
}) {
  return (
    <div className="relative sm:w-[200px]">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-11 w-full cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-4 pr-10 text-sm text-fg-hi outline-none transition-colors hover:border-white/[0.14] focus:border-emerald-bright/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0c1813] text-fg-hi">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-soft"
      />
    </div>
  );
}
