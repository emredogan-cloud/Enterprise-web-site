import type { Metadata } from "next";

import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { searchBooks } from "@/lib/db/queries/catalog";

/**
 * Search depends entirely on a request-time `?q=` query parameter, so it is
 * the one catalog surface that must render dynamically (Roadmap §8 table:
 * "Search results — SSR (dynamic) or client-fetch"). This is the intended
 * single exception to the static-first rule; everything else stays static
 * because `SearchBar` is a pure HTML form with no client JS.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  // Search-results pages should not be indexed (they would mostly produce
  // thin, query-string-driven duplicates of canonical /books).
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

  const results = query ? await searchBooks(query) : [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Search
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {query ? `Results for ${JSON.stringify(query)}` : "Search the catalog"}
        </h1>

        <div className="mx-auto mt-8 max-w-md">
          <SearchBar defaultValue={query} />
        </div>

        {query && (
          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}
      </header>

      {!query ? (
        <EmptyState
          heading="Enter a search term."
          body="Try a title, an author name, or a topic."
        />
      ) : results.length === 0 ? (
        <EmptyState
          heading={`No books match ${JSON.stringify(query)}.`}
          body="Try fewer or different words, or browse the full catalog."
        />
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
