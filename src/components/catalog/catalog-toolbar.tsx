"use client";

import { LayoutGrid, List } from "lucide-react";

export type SortOption = "newest" | "price-low" | "price-high" | "rating";
export type ViewMode = "grid" | "list";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-low": "Price: Low → High",
  "price-high": "Price: High → Low",
  rating: "Top Rated",
};

export interface CatalogToolbarProps {
  startIndex: number;
  endIndex: number;
  totalDisplayed: number;
  totalGlobal: string;
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (s: SortOption) => void;
  onViewChange: (v: ViewMode) => void;
}

/**
 * Toolbar above the book grid.
 *   LEFT: "Showing X-Y of Z books" (results count)
 *   RIGHT: glass select for sort + segmented grid/list view toggle
 */
export function CatalogToolbar(props: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT — results count */}
      <p className="text-sm text-fg-mid">
        Showing{" "}
        <span className="tabular-nums text-fg-hi">
          {props.startIndex}-{props.endIndex}
        </span>{" "}
        of{" "}
        <span className="tabular-nums text-fg-hi">
          {props.totalGlobal}
        </span>{" "}
        books
      </p>

      {/* RIGHT — sort + view */}
      <div className="flex items-center gap-3">
        {/* Sort — glass dropdown (native select with custom styling) */}
        <div className="relative">
          <label
            htmlFor="catalog-sort"
            className="absolute -left-[200px] -top-[200px]"
          >
            Sort by
          </label>
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-fg-soft"
          >
            Sort by:
          </span>
          <select
            id="catalog-sort"
            value={props.sortBy}
            onChange={(e) =>
              props.onSortChange(e.target.value as SortOption)
            }
            className="h-9 cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] py-0 pl-[70px] pr-9 text-sm text-fg-hi transition-colors hover:border-white/[0.14] focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key} className="bg-[#0a1410]">
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-fg-mid"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* View toggle */}
        <div className="flex h-9 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
          <button
            type="button"
            onClick={() => props.onViewChange("grid")}
            aria-pressed={props.viewMode === "grid"}
            aria-label="Grid view"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              props.viewMode === "grid"
                ? "bg-emerald-bright/15 text-emerald-bright shadow-[0_0_12px_rgba(51,240,170,0.3)]"
                : "text-fg-soft hover:text-fg-hi"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => props.onViewChange("list")}
            aria-pressed={props.viewMode === "list"}
            aria-label="List view"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              props.viewMode === "list"
                ? "bg-emerald-bright/15 text-emerald-bright shadow-[0_0_12px_rgba(51,240,170,0.3)]"
                : "text-fg-soft hover:text-fg-hi"
            }`}
          >
            <List className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
