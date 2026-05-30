import type { Metadata } from "next";

import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { CategoryDiscoveryPanel } from "@/components/search/category-discovery-panel";
import { EmptySearchCard } from "@/components/search/empty-search-card";
import { LargeSearchInput } from "@/components/search/large-search-input";
import { PopularSearchesPanel } from "@/components/search/popular-searches-panel";
import { SearchHero } from "@/components/search/search-hero";
import { SearchResults } from "@/components/search/search-results";
import { SuggestionPills } from "@/components/search/suggestion-pills";
import { searchBooks } from "@/lib/db/queries/catalog";

/**
 * `/search` — cinematic universal search experience.
 *
 * Stays `ƒ Dynamic` (reads `?q=` searchParams at request time) — this is
 * Roadmap §8's single exception to the static-first rule. Two states:
 *
 *   - **No query**: hero + large input + suggestion pills + two-panel
 *     discovery surface (Popular searches LEFT, Browse by category
 *     RIGHT) + the bottom empty-search focal card.
 *   - **With query**: hero + input + cinematic results grid (FTS via
 *     `searchBooks()` from SUB-PR 1.2's full-text search system).
 *
 * Both states share the same dark cinematic atmosphere as the rest of
 * the site, via `.cinematic-root` + the shared header / footer.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  // Search-results pages should not be indexed (mostly thin query-string-
  // driven duplicates of the canonical /books surface).
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ q?: string | string[] }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim();
  const hasQuery = query.length > 0;

  const results = hasQuery ? await searchBooks(query) : [];

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        <SearchHero />
        {/* `key` remounts the input when the URL `?q=` changes so the
            controlled state reflects back/forward navigation without
            requiring a setState-in-effect (React 19 anti-pattern). */}
        <LargeSearchInput key={query} defaultValue={query} />

        {hasQuery ? (
          <SearchResults query={query} results={results} />
        ) : (
          <>
            <SuggestionPills />

            {/* Two-panel discovery — 50/50 on lg, stacked below */}
            <section className="mx-auto mt-14 grid max-w-7xl gap-5 px-6 lg:grid-cols-2 lg:gap-6">
              <PopularSearchesPanel />
              <CategoryDiscoveryPanel />
            </section>

            <EmptySearchCard />
            <div className="h-20" />
          </>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
