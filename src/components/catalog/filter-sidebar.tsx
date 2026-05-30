"use client";

import { Search, Star } from "lucide-react";

import {
  type DemoBook,
  getCategoryCounts,
  getFormatCounts,
  getRatingCounts,
} from "./demo-books";

/**
 * Premium filter sidebar — props-driven, presentational only.
 *
 * Receives filter state + setters from `<CatalogShell>`; never owns state
 * itself. This keeps the source-of-truth for the catalog single (the
 * shell) and lets the sidebar be tested in isolation by passing static
 * props.
 */
export interface FilterSidebarProps {
  allBooks: DemoBook[];
  searchQuery: string;
  selectedCategories: ReadonlySet<string>;
  selectedFormats: ReadonlySet<string>;
  priceMax: number;
  minRating: number;
  onSearchChange: (q: string) => void;
  onToggleCategory: (name: string) => void;
  onToggleFormat: (name: string) => void;
  onPriceMaxChange: (v: number) => void;
  onMinRatingChange: (v: number) => void;
  onResetAll: () => void;
}

const PRICE_MAX_CAP = 50;

export function FilterSidebar(props: FilterSidebarProps) {
  const categoryCounts = getCategoryCounts(props.allBooks);
  const formatCounts = getFormatCounts(props.allBooks);
  const ratingCounts = getRatingCounts(props.allBooks);

  return (
    <aside
      className="home-glass relative h-fit overflow-hidden rounded-[26px] p-6"
      aria-label="Catalog filters"
    >
      {/* Edge glow — top emerald line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
      />

      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-medium text-[#e6e6e0]">
          Filters
        </h2>
        <button
          type="button"
          onClick={props.onResetAll}
          className="text-xs font-medium text-[#33f0aa] transition-colors hover:text-[#1ddf8f]"
        >
          Reset all
        </button>
      </header>

      {/* Search */}
      <SectionWrap title="Search books">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5d675f]"
          />
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search within books..."
            className="block h-9 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 text-sm text-[#e6e6e0] placeholder:text-[#5d675f] transition-colors focus:border-[#33f0aa]/40 focus:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
          />
        </div>
      </SectionWrap>

      {/* Categories */}
      <SectionWrap title="Categories">
        <ul className="space-y-1">
          {categoryCounts.map((cat) => (
            <FilterCheckbox
              key={cat.name}
              label={cat.name}
              count={cat.count}
              checked={props.selectedCategories.has(cat.name)}
              onToggle={() => props.onToggleCategory(cat.name)}
            />
          ))}
        </ul>
      </SectionWrap>

      {/* Formats */}
      <SectionWrap title="Formats">
        <ul className="space-y-1">
          {formatCounts.map((fmt) => (
            <FilterCheckbox
              key={fmt.name}
              label={fmt.name}
              count={fmt.count}
              checked={props.selectedFormats.has(fmt.name)}
              onToggle={() => props.onToggleFormat(fmt.name)}
            />
          ))}
        </ul>
      </SectionWrap>

      {/* Price */}
      <SectionWrap title="Price">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#a7a7a0]">
            <span className="tabular-nums">$0</span>
            <span className="font-medium tabular-nums text-[#e6e6e0]">
              ${props.priceMax >= PRICE_MAX_CAP ? `${PRICE_MAX_CAP}+` : props.priceMax}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={PRICE_MAX_CAP}
            step={1}
            value={props.priceMax}
            onChange={(e) => props.onPriceMaxChange(Number(e.target.value))}
            className="catalog-range w-full"
            aria-label="Maximum price"
            style={
              {
                ["--range-progress" as string]: `${((props.priceMax - 5) / (PRICE_MAX_CAP - 5)) * 100}%`,
              } as React.CSSProperties
            }
          />
        </div>
      </SectionWrap>

      {/* Rating */}
      <SectionWrap title="Rating">
        <ul className="space-y-1">
          {ratingCounts.map((r) => {
            const isActive = props.minRating === r.stars;
            return (
              <li key={r.stars}>
                <button
                  type="button"
                  onClick={() =>
                    props.onMinRatingChange(isActive ? 0 : r.stars)
                  }
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-[#33f0aa]/10 text-[#e6e6e0]"
                      : "text-[#a7a7a0] hover:bg-white/[0.04] hover:text-[#e6e6e0]"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        aria-hidden
                        className={`h-3 w-3 ${
                          i < r.stars
                            ? "fill-[#f4c44b] text-[#f4c44b]"
                            : "fill-transparent text-[#3a4039]"
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-xs">& up</span>
                  </span>
                  <span className="text-xs tabular-nums text-[#5d675f]">
                    {r.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </SectionWrap>

    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function SectionWrap({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border-t border-white/[0.05] pt-5 first-of-type:mt-7">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88918a]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterCheckbox({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-[#a7a7a0] transition-colors hover:bg-white/[0.04] hover:text-[#e6e6e0]"
      >
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={`flex h-4 w-4 items-center justify-center rounded-[5px] border transition-all ${
              checked
                ? "border-[#33f0aa] bg-[#33f0aa] shadow-[0_0_10px_rgba(51,240,170,0.5)]"
                : "border-white/[0.15] bg-white/[0.02] group-hover:border-white/[0.3]"
            }`}
          >
            {checked && (
              <svg
                className="h-2.5 w-2.5 text-[#06231a]"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6.5l2.5 2.5L10 3.5" />
              </svg>
            )}
          </span>
          <span className={checked ? "text-[#e6e6e0]" : ""}>{label}</span>
        </span>
        <span className="text-xs tabular-nums text-[#5d675f]">{count}</span>
      </button>
    </li>
  );
}
