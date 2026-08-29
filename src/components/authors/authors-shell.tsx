"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

import { AuthorCard } from "./author-card";
import {
  AUTHOR_SORTS,
  type AuthorSort,
  type AuthorCardData,
} from "./author-card-data";

/**
 * Single Client wrapper holding all interactive state for the authors
 * discovery surface:
 *   - searchQuery   (free-text on author name + works)
 *   - selectedGenre (string | null — drives both pills + dropdown)
 *   - sortBy        ("Popular" | "A → Z" | "Most books")
 *
 * Layout matches the brief's explicit notes:
 *   - Search input + genre dropdown CENTERED side-by-side
 *   - Genre pills row below
 *   - Sort dropdown RIGHT-aligned above the grid
 *   - 6-col grid with stagger reveal
 *   - "View all authors" CTA centered beneath
 *
 * The page itself (`/authors/page.tsx`) stays a Server Component; this
 * wrapper hydrates with the demo author list baked-in.
 */
export function AuthorsShell({ authors }: { authors: AuthorCardData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<AuthorSort>("A → Z");

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    // Search covers name and bio — the two fields that actually hold text.
    // The genre facet went with the demo roster: `category` was a made-up
    // label on made-up people, and the real `authors` table has no genre.
    const result = authors.filter((a) => {
      if (!needle) return true;
      return `${a.name} ${a.bio ?? ""}`.toLowerCase().includes(needle);
    });

    return sortBy === "Most books"
      ? [...result].sort(
          (a, b) => b.bookCount - a.bookCount || a.name.localeCompare(b.name),
        )
      : [...result].sort((a, b) => a.name.localeCompare(b.name));
  }, [authors, searchQuery, sortBy]);

  return (
    <>
      {/* Centered search. The genre dropdown and pill row that used to sit
          beside it are gone: they filtered on a `category` field that only
          ever existed on the fabricated author roster. The real `authors`
          table has no genre, so those controls promised a cut of the data
          that cannot be made. */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center px-6">
        <div className="relative w-full">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-fade"
          />
          <label htmlFor="author-search" className="sr-only">
            Search authors
          </label>
          <input
            id="author-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="Search authors…"
            className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-fg-hi placeholder:text-fg-fade transition-colors focus:border-emerald-bright/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-bright/20"
          />
        </div>
      </div>

      {/* Sort bar — right-aligned glass dropdown */}
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-end px-6">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-fg-soft"
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.currentTarget.value as AuthorSort)}
            aria-label="Sort authors"
            className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-[68px] pr-9 text-sm text-fg-hi transition-colors hover:border-white/[0.14] focus:border-emerald-bright/40 focus:outline-none focus:ring-2 focus:ring-emerald-bright/20"
          >
            {AUTHOR_SORTS.map((s) => (
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
      </div>

      {/* Author grid */}
      <section className="mx-auto mt-6 max-w-7xl px-6">
        {filtered.length === 0 ? (
          <EmptyResults onClear={() => setSearchQuery("")} />
        ) : (
          <RevealOnScroll
            stagger
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6"
          >
            {filtered.map((author) => (
              <AuthorCard key={author.slug} author={author} />
            ))}
          </RevealOnScroll>
        )}
      </section>

      {/* Phase 1.I — "View all authors" CTA removed (was `href="#all"`,
          a dead anchor with no matching target element in the DOM, AND
          redundant since the grid already shows every author after
          filters are cleared via the empty-state Reset button). */}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty-results — shown when filters yield zero authors                      */
/* -------------------------------------------------------------------------- */

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="home-glass mx-auto mt-6 max-w-md rounded-2xl px-8 py-12 text-center">
      <p className="font-serif text-lg text-fg-hi">
        No authors match those filters.
      </p>
      <p className="mt-2 text-sm text-fg-soft">
        Try a different genre or clear the search.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="home-cta-secondary mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
      >
        Reset filters
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

