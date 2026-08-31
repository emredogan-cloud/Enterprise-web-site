import Link from "next/link";

import type { BookCardData } from "@/components/book-card";
import { formatCatalogPrice } from "@/lib/format";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Featured Books — Handpicked for you" — 6 vertical book cards.
 *
 * Phase 2.G — accepts real `BookCardData[]` from the homepage (which
 * calls `getFeaturedBooks(6)` at SSG time). Each card now links to the
 * actual `/books/{slug}` instead of the catalog root, and authors come
 * from the DB join.
 *
 * Two things this section used to do, and no longer does.
 *
 * It fell back to six curated bestsellers when the database returned
 * nothing — Atomic Habits, The Psychology of Money, The Silent Patient and
 * three more, real books by real named authors, with invented prices, on
 * the front page of a publisher that has no right to sell any of them.
 * An empty catalog now renders nothing; the homepage has other sections.
 *
 * And it stamped every card with a 4.8-star rating. Not a real aggregate —
 * a constant, chosen because it "reads as well-reviewed". Every book in
 * this catalog has zero reviews, so that star was the only review any of
 * them had, and it was invented. Ratings are gone from this section until
 * there are ratings; the book page already renders the real aggregate, and
 * renders nothing when the count is zero.
 */

interface BookProps {
  slug: string; // "" when this is a curated demo card (links to /books root)
  title: string;
  author: string;
  price: string;
  coverGradient: string;
  coverAccent: string;
  darkText?: boolean;
  badge?: { label: string; color: string };
}

// 6 deterministic gradient palettes — one per real DB book by index. Same
// palette family as `/books/page.tsx` so real books look on-brand even
// without their own cover key uploaded.
const REAL_BOOK_PALETTE: Array<Pick<BookProps, "coverGradient" | "coverAccent">> = [
  {
    coverGradient: "linear-gradient(160deg, #c9701a 0%, #5d2f08 100%)",
    coverAccent: "#ffce63",
  },
  {
    coverGradient: "linear-gradient(160deg, #1a2c1f 0%, #0a1610 100%)",
    coverAccent: "#33f0aa",
  },
  {
    coverGradient: "linear-gradient(160deg, #c84a4a 0%, #6b1818 100%)",
    coverAccent: "#ffd0d0",
  },
  {
    coverGradient: "linear-gradient(160deg, #16386b 0%, #051426 100%)",
    coverAccent: "#7ab6ff",
  },
  {
    coverGradient: "linear-gradient(160deg, #2c1f1a 0%, #14110a 100%)",
    coverAccent: "#d1a86a",
  },
  {
    coverGradient: "linear-gradient(160deg, #3a2845 0%, #14081c 100%)",
    coverAccent: "#b18cff",
  },
];


export function FeaturedBooksSection({
  books = [],
}: {
  /** Real DB books from `getFeaturedBooks(6)`. Empty → section hidden. */
  books?: BookCardData[];
}) {
  const cards: BookProps[] = books.slice(0, 6).map((b, i) => ({
    slug: b.slug,
    title: b.title,
    author: b.authors[0]?.name ?? "—",
    price: formatCatalogPrice(b.priceCents, b.currency),
    coverGradient:
      REAL_BOOK_PALETTE[i % REAL_BOOK_PALETTE.length].coverGradient,
    coverAccent: REAL_BOOK_PALETTE[i % REAL_BOOK_PALETTE.length].coverAccent,
  }));

  if (cards.length === 0) return null;

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-emerald-bright/80">
                Handpicked for you
              </p>
              <h2 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-fg-hi sm:text-[44px]">
                Featured books
              </h2>
            </div>
            <Link
              href="/books"
              className="text-sm font-medium text-emerald-bright underline-offset-4 hover:underline"
            >
              View all books →
            </Link>
          </header>
        </RevealOnScroll>

        <RevealOnScroll
          stagger
          className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6"
        >
          {cards.map((book, i) => (
            <BookCard key={`${book.title}-${i}`} {...book} />
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

function BookCard(book: BookProps) {
  // Real books link to /books/{slug}; demo fallback cards link to /books
  // (catalog) since they have no real slug.
  const href = book.slug ? `/books/${book.slug}` : "/books";

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60 rounded-lg"
    >
      {/* Cover */}
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)]">
        <div
          className="absolute inset-0"
          style={{ background: book.coverGradient }}
        />

        {/* Top corner accent glow */}
        <div
          aria-hidden
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${book.coverAccent}40 0%, transparent 70%)`,
          }}
        />

        {/* Vertical text on cover */}
        <div className="absolute inset-0 flex flex-col justify-between p-3.5">
          <span
            className="text-[8px] font-medium uppercase tracking-[0.2em]"
            style={{
              color: book.darkText
                ? "rgba(0,0,0,0.5)"
                : "rgba(255,255,255,0.5)",
            }}
          >
            Featured
          </span>
          <p
            className="font-serif text-base font-medium leading-tight"
            style={{
              color: book.darkText ? "#1a1612" : "#fff",
            }}
          >
            {book.title}
          </p>
        </div>

        {/* Right edge highlight */}
        <div
          aria-hidden
          className="absolute right-0 top-[2px] bottom-[2px] w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />

        {/* Floating badge (demo cards only — real DB books don't carry a
            badge dimension yet) */}
        {book.badge && (
          <span
            className="absolute left-2 top-2 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-lg"
            style={{
              background: book.badge.color,
              backdropFilter: "blur(8px)",
            }}
          >
            {book.badge.label}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="mt-4 px-0.5">
        <h3 className="line-clamp-2 font-serif text-sm font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-fg-soft">{book.author}</p>
        <div className="mt-2 flex items-center justify-end">
          <span className="text-sm font-semibold text-fg-hi">
            {book.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
