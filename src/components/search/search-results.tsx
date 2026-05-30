import Link from "next/link";
import { Star } from "lucide-react";

import type { BookCardData } from "@/components/book-card";
import { formatPrice } from "@/lib/format";

/**
 * Cinematic search-results grid — rendered when `?q=…` is present.
 *
 * Each result is a compact glass card with a CSS-rendered cover (so
 * results don't depend on R2 cover uploads), title, author, and price.
 * When the real DB has covers via `coverKey`, this can be extended to
 * prefer `<Image>` over the gradient.
 *
 * Pure Server Component; the parent `<SearchPage>` is also Server.
 */
export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: BookCardData[];
}) {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-6 pb-20">
      <p className="text-center text-sm text-fg-soft">
        {results.length === 0 ? (
          <>
            No results for{" "}
            <span className="text-fg-hi">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          <>
            <span className="tabular-nums text-fg-hi">
              {results.length}
            </span>{" "}
            {results.length === 1 ? "result" : "results"} for{" "}
            <span className="text-fg-hi">&ldquo;{query}&rdquo;</span>
          </>
        )}
      </p>

      {results.length === 0 ? (
        <div className="home-glass mx-auto mt-10 max-w-md rounded-2xl px-8 py-12 text-center">
          <p className="font-serif text-lg text-fg-hi">
            Try a different search.
          </p>
          <p className="mt-2 text-sm text-fg-soft">
            Fewer words, a different spelling, or browse the full catalog
            instead.
          </p>
          <Link
            href="/books"
            className="home-cta-secondary mt-6 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
          >
            Browse catalog →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((book, i) => (
            <li key={book.id}>
              <ResultCard book={book} themeIndex={i} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Compact result card — CSS cover + title + author + price                   */
/* -------------------------------------------------------------------------- */

const COVER_PALETTE = [
  { gradient: "linear-gradient(160deg, #1a3326 0%, #0a1f14 100%)", accent: "#33f0aa" },
  { gradient: "linear-gradient(160deg, #1a2c4f 0%, #050a1e 100%)", accent: "#7ab6ff" },
  { gradient: "linear-gradient(160deg, #c98341 0%, #4b1f0a 100%)", accent: "#ffce63" },
  { gradient: "linear-gradient(160deg, #b41c1c 0%, #4a0808 100%)", accent: "#f4d4a8" },
  { gradient: "linear-gradient(160deg, #2c1f1a 0%, #14110a 100%)", accent: "#d1a86a" },
] as const;

function ResultCard({
  book,
  themeIndex,
}: {
  book: BookCardData;
  themeIndex: number;
}) {
  const palette = COVER_PALETTE[themeIndex % COVER_PALETTE.length];
  const author = book.authors[0]?.name ?? "—";

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60 rounded-lg"
    >
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)]">
        <div
          className="absolute inset-0"
          style={{ background: palette.gradient }}
        />
        <div
          aria-hidden
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${palette.accent}55 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <p className="font-serif text-base font-medium leading-tight text-white">
            {book.title}
          </p>
        </div>
        <div
          aria-hidden
          className="absolute right-0 top-[2px] bottom-[2px] w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-2 font-serif text-sm font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-fg-soft">{author}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-fg-mid">
            <Star aria-hidden className="h-3 w-3 fill-[#f4c44b] text-[#f4c44b]" />
            <span className="tabular-nums">4.7</span>
          </span>
          <span className="text-sm font-semibold text-fg-hi">
            {formatPrice(book.priceCents, book.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
