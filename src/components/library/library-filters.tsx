"use client";

import { ChevronDown, LayoutGrid, LayoutList, Rows3 } from "lucide-react";

/**
 * Library filter bar — segmented tabs LEFT + sort/view RIGHT.
 *
 * Per the brief: active tab gets **emerald text AND a dark green
 * background pill** — not just a text color change.
 *
 * Phase 2.B — converted from a self-state component to a CONTROLLED
 * component. State now lives in `<LibraryShell>` (the new client wrapper
 * around the library page) so the grid below actually responds to user
 * input.
 *
 * "Want to Read" tab removed — wishlist is a separate feature (separate
 * table, separate flow) and was an aspirational placeholder in the
 * audit. The remaining four tabs are all functional against real data.
 */

export type LibraryTab = "All Books" | "Downloaded" | "Reading" | "Finished";
export type LibrarySort = "Recently Added" | "Title A → Z" | "Recently Read";
export type LibraryView = "grid" | "shelf" | "list";

export const LIBRARY_TABS: ReadonlyArray<LibraryTab> = [
  "All Books",
  "Downloaded",
  "Reading",
  "Finished",
];
export const LIBRARY_SORTS: ReadonlyArray<LibrarySort> = [
  "Recently Added",
  "Title A → Z",
  "Recently Read",
];

export interface LibraryFiltersProps {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  sort: LibrarySort;
  onSortChange: (sort: LibrarySort) => void;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
}

export function LibraryFilters({
  activeTab,
  onTabChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: LibraryFiltersProps) {
  return (
    <section
      aria-label="Library filters"
      className="mx-auto mt-12 max-w-[1320px] px-4 sm:px-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT — segmented tabs */}
        <div
          role="tablist"
          aria-label="Library status"
          className="home-glass inline-flex flex-wrap items-center gap-1 rounded-full p-1.5"
        >
          {LIBRARY_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onTabChange(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-b from-[#0e3a28] to-[#0a2c1f] text-emerald-bright shadow-[inset_0_1px_0_rgba(51,240,170,0.15),0_0_14px_-2px_rgba(51,240,170,0.35)]"
                    : "text-fg-soft hover:text-fg-hi"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* RIGHT — sort + view toggle */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-fg-soft"
            >
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) =>
                onSortChange(e.currentTarget.value as LibrarySort)
              }
              aria-label="Sort library"
              className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-[68px] pr-9 text-sm text-fg-hi transition-colors hover:border-white/[0.14] focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20"
            >
              {LIBRARY_SORTS.map((s) => (
                <option key={s} value={s} className="bg-[#0a1410]">
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-mid"
            />
          </div>

          {/* View toggle — Grid / Shelf / List */}
          <div className="flex h-10 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
            <ViewButton
              active={view === "grid"}
              label="Grid view"
              onClick={() => onViewChange("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            </ViewButton>
            <ViewButton
              active={view === "shelf"}
              label="Shelf view"
              onClick={() => onViewChange("shelf")}
            >
              <Rows3 className="h-3.5 w-3.5" aria-hidden />
            </ViewButton>
            <ViewButton
              active={view === "list"}
              label="List view"
              onClick={() => onViewChange("list")}
            >
              <LayoutList className="h-3.5 w-3.5" aria-hidden />
            </ViewButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
        active
          ? "bg-emerald-bright/15 text-emerald-bright shadow-[0_0_12px_rgba(51,240,170,0.3)]"
          : "text-fg-soft hover:text-fg-hi"
      }`}
    >
      {children}
    </button>
  );
}
