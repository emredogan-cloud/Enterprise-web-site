"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CatalogBookCard } from "./catalog-book-card";
import {
  CatalogToolbar,
  type SortOption,
  type ViewMode,
} from "./catalog-toolbar";
import { type DemoBook } from "./demo-books";
import { FilterSidebar } from "./filter-sidebar";
import { Pagination } from "./pagination";

const PAGE_SIZE = 12; // 4 cols × 3 rows — larger cards, fuller catalog page (Issue 3)
const PRICE_MAX_CAP = 50;

const VALID_SORTS: ReadonlyArray<SortOption> = [
  "newest",
  "price-low",
  "price-high",
  "rating",
];
const VALID_VIEWS: ReadonlyArray<ViewMode> = ["grid", "list"];

/**
 * The single source of truth for the catalog's interactive state.
 *
 * Phase 2.F — URL-synced filters. Every interactive surface writes to
 * the URL via `router.replace`; mounting reads initial state from
 * `useSearchParams`; browser back/forward stays in sync because the
 * URL is authoritative. A refresh restores everything; a shared link
 * lands on the same filtered view; the back button rewinds filter
 * history one step at a time.
 *
 * Phase 2.I fold-in — the "Showing X-Y of 50,231" sahte global label
 * is gone; the toolbar now reflects the real catalog size.
 *
 * The page (`src/app/books/page.tsx`) stays a Server Component that
 * fetches `listPublishedBooks()` at SSG/ISR time and passes the baked-in
 * array as a prop here. Page classification stays `○ Static + ISR 1h` —
 * URL params only affect the client view, never the SSG payload.
 */

// URL param keys — kept short for shareable URLs.
const URL_KEYS = {
  query: "q",
  categories: "cat",
  formats: "fmt",
  priceMax: "p",
  rating: "r",
  sort: "sort",
  view: "view",
  page: "page",
} as const;

interface CatalogState {
  searchQuery: string;
  selectedCategories: Set<string>;
  selectedFormats: Set<string>;
  priceMax: number;
  minRating: number;
  sortBy: SortOption;
  viewMode: ViewMode;
  currentPage: number;
}

const DEFAULT_STATE: CatalogState = {
  searchQuery: "",
  selectedCategories: new Set(),
  selectedFormats: new Set(),
  priceMax: PRICE_MAX_CAP,
  minRating: 0,
  sortBy: "newest",
  viewMode: "grid",
  currentPage: 1,
};

/**
 * Parse a `URLSearchParams` snapshot into a `CatalogState`, falling back
 * to defaults for any missing / malformed key. The catalog accepts
 * arbitrary URLs gracefully — `/books?p=hello` ignores `hello` rather
 * than throwing.
 */
function readStateFromParams(params: URLSearchParams): CatalogState {
  const categoriesParam = params.get(URL_KEYS.categories);
  const formatsParam = params.get(URL_KEYS.formats);
  const priceMaxParam = params.get(URL_KEYS.priceMax);
  const ratingParam = params.get(URL_KEYS.rating);
  const sortParam = params.get(URL_KEYS.sort);
  const viewParam = params.get(URL_KEYS.view);
  const pageParam = params.get(URL_KEYS.page);

  const priceMaxNum = priceMaxParam ? Number(priceMaxParam) : NaN;
  const ratingNum = ratingParam ? Number(ratingParam) : NaN;
  const pageNum = pageParam ? Number(pageParam) : NaN;

  const sort = (VALID_SORTS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : DEFAULT_STATE.sortBy;
  const view = (VALID_VIEWS as readonly string[]).includes(viewParam ?? "")
    ? (viewParam as ViewMode)
    : DEFAULT_STATE.viewMode;

  return {
    searchQuery: params.get(URL_KEYS.query) ?? "",
    selectedCategories: new Set(
      categoriesParam ? categoriesParam.split(",").filter(Boolean) : [],
    ),
    selectedFormats: new Set(
      formatsParam ? formatsParam.split(",").filter(Boolean) : [],
    ),
    priceMax:
      Number.isFinite(priceMaxNum) && priceMaxNum >= 0 && priceMaxNum <= PRICE_MAX_CAP
        ? priceMaxNum
        : PRICE_MAX_CAP,
    minRating:
      Number.isFinite(ratingNum) && ratingNum >= 0 && ratingNum <= 5
        ? ratingNum
        : 0,
    sortBy: sort,
    viewMode: view,
    currentPage:
      Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1,
  };
}

/**
 * Serialize a `CatalogState` into URL query params, omitting any key that
 * matches the default value so the URL stays short. `/books` (no params)
 * is the canonical "no filters" URL.
 */
function writeStateToParams(state: CatalogState): URLSearchParams {
  const next = new URLSearchParams();
  if (state.searchQuery) next.set(URL_KEYS.query, state.searchQuery);
  if (state.selectedCategories.size > 0) {
    next.set(URL_KEYS.categories, Array.from(state.selectedCategories).join(","));
  }
  if (state.selectedFormats.size > 0) {
    next.set(URL_KEYS.formats, Array.from(state.selectedFormats).join(","));
  }
  if (state.priceMax !== PRICE_MAX_CAP) {
    next.set(URL_KEYS.priceMax, String(state.priceMax));
  }
  if (state.minRating !== 0) {
    next.set(URL_KEYS.rating, String(state.minRating));
  }
  if (state.sortBy !== DEFAULT_STATE.sortBy) {
    next.set(URL_KEYS.sort, state.sortBy);
  }
  if (state.viewMode !== DEFAULT_STATE.viewMode) {
    next.set(URL_KEYS.view, state.viewMode);
  }
  if (state.currentPage !== 1) {
    next.set(URL_KEYS.page, String(state.currentPage));
  }
  return next;
}

export function CatalogShell({ books }: { books: DemoBook[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initial state — read from the URL once at mount. Subsequent URL
  // changes from outside (browser back/forward) re-sync via the effect
  // below.
  const [state, setState] = useState<CatalogState>(() =>
    readStateFromParams(new URLSearchParams(searchParams?.toString() ?? "")),
  );

  // Resync local state when the URL changes from outside this component
  // (e.g. browser back/forward). We compare a serialized snapshot to
  // avoid an infinite re-render loop with the writer effect below.
  const lastWrittenQuery = useRef<string>(searchParams?.toString() ?? "");
  useEffect(() => {
    const currentQuery = searchParams?.toString() ?? "";
    if (currentQuery === lastWrittenQuery.current) return;
    lastWrittenQuery.current = currentQuery;
    setState(readStateFromParams(new URLSearchParams(currentQuery)));
  }, [searchParams]);

  // Write state → URL whenever state changes. Search input is debounced
  // (300ms) so typing doesn't pollute history. Everything else commits
  // immediately because filter clicks are deliberate.
  const writeUrl = useCallback(
    (next: CatalogState) => {
      const params = writeStateToParams(next);
      const queryString = params.toString();
      lastWrittenQuery.current = queryString;
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  const debouncedSearchWrite = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  useEffect(() => {
    if (debouncedSearchWrite.current) clearTimeout(debouncedSearchWrite.current);
    debouncedSearchWrite.current = setTimeout(() => {
      writeUrl(state);
    }, 300);
    return () => {
      if (debouncedSearchWrite.current) clearTimeout(debouncedSearchWrite.current);
    };
    // The writer is debounced via this single effect; we re-run on every
    // state change so search typing collapses into one URL write.
  }, [state, writeUrl]);

  /* -------------------------------- filters ------------------------------ */
  const filtered = useMemo(() => {
    const needle = state.searchQuery.trim().toLowerCase();
    const arr = books.filter((b) => {
      if (needle && !b.title.toLowerCase().includes(needle)) return false;
      if (
        state.selectedCategories.size &&
        !state.selectedCategories.has(b.category)
      ) {
        return false;
      }
      if (
        state.selectedFormats.size &&
        !b.formats.some((f) => state.selectedFormats.has(f))
      ) {
        return false;
      }
      const priceDollars = b.priceCents / 100;
      if (priceDollars > state.priceMax) return false;
      if (state.minRating && b.rating < state.minRating) return false;
      return true;
    });

    switch (state.sortBy) {
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
  }, [books, state]);

  /* ----------------------------- pagination ----------------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(state.currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageEnd);

  /* ------------------------- filter handler helpers --------------------- */
  // Every filter change resets pagination to page 1 — without this the
  // user would land on page 5 after toggling a category that only has 8
  // matches, see an empty page, and be confused.
  const togglerForSetKey = (key: "selectedCategories" | "selectedFormats") => {
    return (name: string) => {
      setState((prev) => {
        const next = new Set(prev[key]);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return { ...prev, [key]: next, currentPage: 1 };
      });
    };
  };

  const onSearchChange = (q: string) =>
    setState((s) => ({ ...s, searchQuery: q, currentPage: 1 }));
  const onToggleCategory = togglerForSetKey("selectedCategories");
  const onToggleFormat = togglerForSetKey("selectedFormats");
  const onPriceMaxChange = (v: number) =>
    setState((s) => ({ ...s, priceMax: v, currentPage: 1 }));
  const onMinRatingChange = (v: number) =>
    setState((s) => ({ ...s, minRating: v, currentPage: 1 }));
  const onSortChange = (s: SortOption) =>
    setState((prev) => ({ ...prev, sortBy: s, currentPage: 1 }));
  const onViewChange = (v: ViewMode) =>
    setState((s) => ({ ...s, viewMode: v }));
  const onPageChange = (p: number) =>
    setState((s) => ({
      ...s,
      currentPage: Math.max(1, Math.min(p, totalPages)),
    }));
  const onResetAll = () =>
    setState({
      ...DEFAULT_STATE,
      // Replace the Sets with fresh instances so React picks up the change.
      selectedCategories: new Set(),
      selectedFormats: new Set(),
    });

  /* --------------------------------- render ----------------------------- */
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-6 pb-24 lg:grid-cols-[300px_minmax(0,_1fr)] lg:gap-12">
      {/* Sidebar */}
      <FilterSidebar
        allBooks={books}
        searchQuery={state.searchQuery}
        selectedCategories={state.selectedCategories}
        selectedFormats={state.selectedFormats}
        priceMax={state.priceMax}
        minRating={state.minRating}
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
          // Phase 2.I fold-in — the previous "50,231" sahte marketing
          // label is gone. We always show the real total catalog size
          // (the input `books` length) when no filters are active, and
          // the filtered count otherwise.
          totalGlobal={
            filtered.length === books.length
              ? books.length.toLocaleString("en-US")
              : filtered.length.toLocaleString("en-US")
          }
          sortBy={state.sortBy}
          viewMode={state.viewMode}
          onSortChange={onSortChange}
          onViewChange={onViewChange}
        />

        {/* Grid / list */}
        {visible.length === 0 ? (
          <EmptyResults onReset={onResetAll} />
        ) : state.viewMode === "grid" ? (
          <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
            onPageChange={onPageChange}
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
          className="font-semibold uppercase tracking-[0.12em]"
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
        <h4 className="truncate font-serif text-base font-medium text-fg-hi group-hover:text-emerald-bright">
          {book.title}
        </h4>
        <p className="mt-0.5 truncate text-sm text-fg-soft">{book.author}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-fg-mid">
          <span className="rounded-full bg-white/[0.04] px-2 py-0.5">
            {book.category}
          </span>
          <span>{book.formats.join(" · ")}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-semibold tabular-nums text-fg-hi">
          ${(book.priceCents / 100).toFixed(0)}
        </span>
        <span className="flex items-center gap-1 text-xs text-fg-mid">
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
      <p className="font-serif text-xl text-fg-hi">
        No books match these filters.
      </p>
      <p className="mt-2 text-sm text-fg-soft">
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
