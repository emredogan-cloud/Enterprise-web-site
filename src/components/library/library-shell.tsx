"use client";

import { useMemo, useState } from "react";

import { LibraryBooksGrid } from "@/components/library/library-books-grid";
import {
  LIBRARY_TABS,
  LIBRARY_SORTS,
  LibraryFilters,
  type LibrarySort,
  type LibraryTab,
  type LibraryView,
} from "@/components/library/library-filters";
import type { LibraryEntry } from "@/lib/db/queries/account";

/**
 * <LibraryShell> — owns the activeTab / sort / view state for the
 * cinematic library page (Phase 2.B state lift).
 *
 * Composition:
 *   <LibraryFilters />  — controlled by this shell's state
 *   <LibraryBooksGrid /> — receives the filtered+sorted entries +
 *                         the chosen view mode
 *
 * Filtering rules (all four tabs functional against real data):
 *   - "All Books"  → every entitlement
 *   - "Downloaded" → entitlement.lastDownloadedAt !== null
 *   - "Reading"    → entitlement.readStatus === "reading"
 *   - "Finished"   → entitlement.readStatus === "finished"
 *
 * Sort rules:
 *   - "Recently Added"  → entitlement.createdAt DESC (default)
 *   - "Title A → Z"     → book.title ASC, locale-aware
 *   - "Recently Read"   → lastDownloadedAt DESC, nulls last
 */
export function LibraryShell({ library }: { library: LibraryEntry[] }) {
  const [activeTab, setActiveTab] = useState<LibraryTab>(LIBRARY_TABS[0]);
  const [sort, setSort] = useState<LibrarySort>(LIBRARY_SORTS[0]);
  const [view, setView] = useState<LibraryView>("grid");

  const visible = useMemo(() => {
    // 1. Filter
    const filtered = library.filter((entry) => {
      switch (activeTab) {
        case "All Books":
          return true;
        case "Downloaded":
          return entry.lastDownloadedAt !== null;
        case "Reading":
          return entry.readStatus === "reading";
        case "Finished":
          return entry.readStatus === "finished";
      }
    });

    // 2. Sort (stable copy)
    const sorted = [...filtered];
    switch (sort) {
      case "Recently Added":
        // Already DESC by createdAt from the query; explicit re-sort
        // keeps the contract honest even if upstream order ever changes.
        sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;
      case "Title A → Z":
        sorted.sort((a, b) =>
          a.book.title.localeCompare(b.book.title, undefined, {
            sensitivity: "base",
          }),
        );
        break;
      case "Recently Read":
        sorted.sort((a, b) => {
          const aT = a.lastDownloadedAt?.getTime() ?? 0;
          const bT = b.lastDownloadedAt?.getTime() ?? 0;
          return bT - aT;
        });
        break;
    }

    return sorted;
  }, [library, activeTab, sort]);

  return (
    <>
      <LibraryFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      <LibraryBooksGrid library={visible} view={view} />

      {/* Inline empty-result feedback when filters hide everything but
          the library itself is not empty. The library-empty-panel only
          fires at library.length === 0; we need a softer signal here. */}
      {library.length > 0 && visible.length === 0 && (
        <p className="mx-auto mt-10 max-w-md px-6 text-center text-sm text-fg-soft">
          No books match this filter yet. Try a different tab.
        </p>
      )}
    </>
  );
}
