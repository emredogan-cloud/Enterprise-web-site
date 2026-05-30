"use client";

import { ChevronDown, LayoutGrid, LayoutList, Rows3 } from "lucide-react";
import { useState } from "react";

/**
 * Library filter bar — segmented tabs LEFT + sort/view RIGHT.
 *
 * Per the brief: active tab gets **emerald text AND a dark green
 * background pill** — not just a text color change. The tabs are
 * housed inside a single glass container; the active pill slides
 * visually via the per-tab background class.
 *
 * Client Component because the tab/sort/view all hold local state.
 * Currently the state isn't wired to anything substantive (no per-tab
 * filtering of `LibraryEntry` yet because we don't track read/want-to-
 * read on the schema), but the UI is fully interactive and ready for
 * the data to land. The component visually communicates the system
 * — readers know what's coming.
 */
const TABS = ["All Books", "Downloaded", "Reading", "Want to Read", "Finished"] as const;
const SORTS = ["Recently Added", "Title A → Z", "Recently Read"] as const;

export function LibraryFilters() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All Books");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Recently Added");
  const [view, setView] = useState<"grid" | "shelf" | "list">("grid");

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
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-b from-[#0e3a28] to-[#0a2c1f] text-[#33f0aa] shadow-[inset_0_1px_0_rgba(51,240,170,0.15),0_0_14px_-2px_rgba(51,240,170,0.35)]"
                    : "text-[#88918a] hover:text-[#e6e6e0]"
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
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#88918a]"
            >
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.currentTarget.value as (typeof SORTS)[number])}
              aria-label="Sort library"
              className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-[68px] pr-9 text-sm text-[#e6e6e0] transition-colors hover:border-white/[0.14] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
            >
              {SORTS.map((s) => (
                <option key={s} value={s} className="bg-[#0a1410]">
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a7a7a0]"
            />
          </div>

          {/* View toggle — Grid / Shelf / List */}
          <div className="flex h-10 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
            <ViewButton
              active={view === "grid"}
              label="Grid view"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            </ViewButton>
            <ViewButton
              active={view === "shelf"}
              label="Shelf view"
              onClick={() => setView("shelf")}
            >
              <Rows3 className="h-3.5 w-3.5" aria-hidden />
            </ViewButton>
            <ViewButton
              active={view === "list"}
              label="List view"
              onClick={() => setView("list")}
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
          ? "bg-[#33f0aa]/15 text-[#33f0aa] shadow-[0_0_12px_rgba(51,240,170,0.3)]"
          : "text-[#88918a] hover:text-[#e6e6e0]"
      }`}
    >
      {children}
    </button>
  );
}
