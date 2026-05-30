"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { RevealOnScroll } from "@/components/home/reveal-on-scroll";

import { AuthorCard } from "./author-card";
import {
  AUTHOR_GENRES,
  AUTHOR_SORTS,
  type AuthorSort,
  type DemoAuthor,
  getAuthorCountsByGenre,
} from "./demo-authors";

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
export function AuthorsShell({ authors }: { authors: DemoAuthor[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<AuthorSort>("Popular");

  const genreCounts = getAuthorCountsByGenre(authors);

  const filtered = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    let result = authors.filter((a) => {
      if (selectedGenre && a.category !== selectedGenre) return false;
      if (needle) {
        const hay = `${a.name} ${a.works} ${a.role}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    switch (sortBy) {
      case "A → Z":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Most books":
        result = [...result].sort((a, b) => b.bookCount - a.bookCount);
        break;
      case "Popular":
      default:
        // Featured first, then by parsed follower count (millions > K > raw)
        result = [...result].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (b.featured && !a.featured) return 1;
          return parseFollowers(b.followerCount) - parseFollowers(a.followerCount);
        });
    }
    return result;
  }, [authors, searchQuery, selectedGenre, sortBy]);

  return (
    <>
      {/* Centered search + genre dropdown cluster (brief explicit). */}
      <div className="mx-auto mt-6 flex max-w-2xl flex-col items-stretch justify-center gap-3 px-6 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5d675f]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="Search authors, works…"
            className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-[#e6e6e0] placeholder:text-[#5d675f] transition-colors focus:border-[#33f0aa]/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
          />
        </div>

        {/* Genre dropdown — glass select */}
        <div className="relative">
          <select
            value={selectedGenre ?? ""}
            onChange={(e) =>
              setSelectedGenre(e.currentTarget.value || null)
            }
            aria-label="Filter by genre"
            className="h-11 w-full cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-4 pr-10 text-sm text-[#e6e6e0] transition-colors hover:border-white/[0.14] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20 sm:w-44"
          >
            <option value="" className="bg-[#0a1410]">All Genres</option>
            {AUTHOR_GENRES.map((g) => (
              <option key={g} value={g} className="bg-[#0a1410]">
                {g}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a7a7a0]"
          />
        </div>
      </div>

      {/* Genre pills row */}
      <nav
        aria-label="Filter by genre"
        className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-2 px-6"
      >
        <PillButton
          label="All Authors"
          count={authors.length}
          isActive={selectedGenre === null}
          onClick={() => setSelectedGenre(null)}
        />
        {genreCounts
          .filter((g) => g.count > 0)
          .map((g) => (
            <PillButton
              key={g.name}
              label={g.name}
              count={g.count}
              isActive={selectedGenre === g.name}
              onClick={() =>
                setSelectedGenre(selectedGenre === g.name ? null : g.name)
              }
            />
          ))}
      </nav>

      {/* Sort bar — right-aligned glass dropdown */}
      <div className="mx-auto mt-12 flex max-w-7xl items-center justify-end px-6">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#88918a]"
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.currentTarget.value as AuthorSort)}
            aria-label="Sort authors"
            className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] pl-[68px] pr-9 text-sm text-[#e6e6e0] transition-colors hover:border-white/[0.14] focus:border-[#33f0aa]/40 focus:outline-none focus:ring-2 focus:ring-[#33f0aa]/20"
          >
            {AUTHOR_SORTS.map((s) => (
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
      </div>

      {/* Author grid */}
      <section className="mx-auto mt-6 max-w-7xl px-6">
        {filtered.length === 0 ? (
          <EmptyResults
            onClear={() => {
              setSearchQuery("");
              setSelectedGenre(null);
            }}
          />
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
/* Pill — used for the genre filter row                                       */
/* -------------------------------------------------------------------------- */

function PillButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
        isActive
          ? "border-[#33f0aa]/50 bg-[#33f0aa]/12 text-[#33f0aa] shadow-[0_0_16px_rgba(51,240,170,0.25)]"
          : "border-white/[0.08] bg-white/[0.03] text-[#a7a7a0] hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-[#e6e6e0]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[10px] font-semibold tabular-nums ${
          isActive
            ? "bg-[#33f0aa]/20 text-[#33f0aa]"
            : "bg-white/[0.05] text-[#5d675f]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty-results — shown when filters yield zero authors                      */
/* -------------------------------------------------------------------------- */

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="home-glass mx-auto mt-6 max-w-md rounded-2xl px-8 py-12 text-center">
      <p className="font-serif text-lg text-[#e6e6e0]">
        No authors match those filters.
      </p>
      <p className="mt-2 text-sm text-[#88918a]">
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

/** Parse "1.2M" / "843K" / "287" → numeric for the Popular sort. */
function parseFollowers(s: string): number {
  const trimmed = s.trim();
  const last = trimmed.slice(-1).toUpperCase();
  const base = parseFloat(trimmed);
  if (Number.isNaN(base)) return 0;
  if (last === "M") return base * 1_000_000;
  if (last === "K") return base * 1_000;
  return base;
}
