"use client";

import { useMemo, useState } from "react";

import { CatalogBookCard } from "./catalog-book-card";
import {
  CatalogToolbar,
  type SortOption,
  type ViewMode,
} from "./catalog-toolbar";
import { type DemoBook } from "./demo-books";
import { FilterSidebar } from "./filter-sidebar";
import { Pagination } from "./pagination";

const PAGE_SIZE = 10; // 5 cols × 2 rows = the reference's visible window
const PRICE_MAX_CAP = 50;

/**
 * The single source of truth for the catalog's interactive state.
 *
 * Why one big Client Component instead of fine-grained Server/Client mix:
 *   - Every interactive surface (filter checkboxes, search input, range
 *     slider, sort dropdown, view toggle, pagination) needs to react to
 *     the same shared state. Lifting that state to a parent keeps it
 *     trivially in sync; no URL syncing / Context / Zustand needed.
 *   - The page (`src/app/books/page.tsx`) stays a Server Component that
 *     fetches `listPublishedBooks()` at SSG/ISR time and passes the
 *     baked-in array as a prop here. Page classification stays
 *     `○ Static + ISR 1h`.
 *
 * The Hero (which has no state) stays a Server Component above us; the
 * Header is its own small Client island. Only this shell + its children
 * hydrate.
 */
export function CatalogShell({ books }: { books: DemoBook[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [priceMax, setPriceMax] = useState(PRICE_MAX_CAP);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------- filters ------------------------------ */
  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const arr = books.filter((b) => {
      if (needle && !b.title.toLowerCase().includes(needle)) return false;
      if (selectedCategories.size && !selectedCategories.has(b.category)) {
        return false;
      }
      if (
        selectedFormats.size &&
        !b.formats.some((f) => selectedFormats.has(f))
      ) {
        return false;
      }
      const priceDollars = b.priceCents / 100;
      if (priceDollars > priceMax) return false;
      if (minRating && b.rating < minRating) return false;
      return true;
    });

    switch (sortBy) {
      case "price-low":
        return [...arr].sort((a, b) => a.priceCents - b.priceCents);
      case "price-high":
        return [...arr].sort((a, b) => b.priceCents - a.priceCents);
      case "rating":
        return [...arr].sort((a, b) => b.rating - a.rating);
      case "newest":
      default:
        return arr; // keep original order
    }
  }, [
    books,
    searchQuery,
    selectedCategories,
    selectedFormats,
    priceMax,
    minRating,
    sortBy,
  ]);

  /* ----------------------------- pagination ----------------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageEnd);

  /* ------------------------- filter handler helpers --------------------- */
  // Every filter change resets pagination to page 1 — without this the
  // user would land on page 5 after toggling a category that only has 8
  // matches, see an empty page, and be confused.
  const togglerForSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) => {
    return (name: string) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
      setCurrentPage(1);
    };
  };

  const onSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };
  const onToggleCategory = togglerForSet(setSelectedCategories);
  const onToggleFormat = togglerForSet(setSelectedFormats);
  const onPriceMaxChange = (v: number) => {
    setPriceMax(v);
    setCurrentPage(1);
  };
  const onMinRatingChange = (v: number) => {
    setMinRating(v);
    setCurrentPage(1);
  };
  const onSortChange = (s: SortOption) => {
    setSortBy(s);
    setCurrentPage(1);
  };
  const onResetAll = () => {
    setSearchQuery("");
    setSelectedCategories(new Set());
    setSelectedFormats(new Set());
    setPriceMax(PRICE_MAX_CAP);
    setMinRating(0);
    setCurrentPage(1);
  };

  /* --------------------------------- render ----------------------------- */
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 lg:grid-cols-[280px_1fr] lg:gap-10">
      {/* Sidebar */}
      <FilterSidebar
        allBooks={books}
        searchQuery={searchQuery}
        selectedCategories={selectedCategories}
        selectedFormats={selectedFormats}
        priceMax={priceMax}
        minRating={minRating}
        onSearchChange={onSearchChange}
        onToggleCategory={onToggleCategory}
        onToggleFormat={onToggleFormat}
        onPriceMaxChange={onPriceMaxChange}
        onMinRatingChange={onMinRatingChange}
        onResetAll={onResetAll}
      />

      {/* Main content */}
      <section className="min-w-0">
        <CatalogToolbar
          startIndex={visible.length === 0 ? 0 : pageStart + 1}
          endIndex={pageStart + visible.length}
          totalDisplayed={filtered.length}
          // Keep the marketing 50K label so the storefront feels populated
          // even when the underlying dataset is small; once real catalog
          // grows past 50K, pipe the actual filtered count through here.
          totalGlobal={
            filtered.length === books.length
              ? "50,231"
              : filtered.length.toLocaleString("en-US")
          }
          sortBy={sortBy}
          viewMode={viewMode}
          onSortChange={onSortChange}
          onViewChange={setViewMode}
        />

        {/* Grid / list */}
        {visible.length === 0 ? (
          <EmptyResults onReset={onResetAll} />
        ) : viewMode === "grid" ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((book) => (
              <li key={book.id}>
                <CatalogBookCard book={book} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-10 space-y-3">
            {visible.map((book) => (
              <li key={book.id}>
                <ListRow book={book} />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        <div className="mt-14">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={(p) =>
              setCurrentPage(Math.max(1, Math.min(p, totalPages)))
            }
          />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List view row — compact horizontal layout for the alternate view mode      */
/* -------------------------------------------------------------------------- */

function ListRow({ book }: { book: DemoBook }) {
  return (
    <div className="home-glass home-card-hover group flex items-center gap-5 rounded-2xl p-4">
      <div
        className="flex h-24 w-16 flex-shrink-0 flex-col justify-between rounded-md p-2 text-[8px]"
        style={{ background: book.cover.gradient }}
      >
        <span
          className="font-semibold uppercase tracking-[0.15em]"
          style={{
            color: book.cover.darkText
              ? "rgba(0,0,0,0.45)"
              : "rgba(255,255,255,0.5)",
          }}
        >
          {book.category.slice(0, 3)}
        </span>
        <span
          className="font-serif text-[10px] leading-tight"
          style={{ color: book.cover.darkText ? "#1a1612" : "#fff" }}
        >
          {book.title.split(" ").slice(0, 2).join(" ")}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-serif text-base font-medium text-[#e6e6e0] group-hover:text-[#33f0aa]">
          {book.title}
        </h4>
        <p className="mt-0.5 truncate text-sm text-[#88918a]">{book.author}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-[#a7a7a0]">
          <span className="rounded-full bg-white/[0.04] px-2 py-0.5">
            {book.category}
          </span>
          <span>{book.formats.join(" · ")}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-semibold tabular-nums text-[#e6e6e0]">
          ${(book.priceCents / 100).toFixed(0)}
        </span>
        <span className="flex items-center gap-1 text-xs text-[#a7a7a0]">
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="h-3 w-3 fill-[#f4c44b]"
          >
            <path d="M6 1l1.6 3.3 3.4.5-2.5 2.4.6 3.4L6 9 2.9 10.6l.6-3.4L1 4.8l3.4-.5z" />
          </svg>
          <span className="tabular-nums">{book.rating.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty-results state — shown when filters yield zero matches                */
/* -------------------------------------------------------------------------- */

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="home-glass mt-10 rounded-2xl px-8 py-16 text-center">
      <p className="font-serif text-xl text-[#e6e6e0]">
        No books match these filters.
      </p>
      <p className="mt-2 text-sm text-[#88918a]">
        Try widening the price range, or clear the filters to start over.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="home-cta-secondary mt-7 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
      >
        Reset filters
      </button>
    </div>
  );
}
