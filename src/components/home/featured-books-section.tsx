import Link from "next/link";
import { Star } from "lucide-react";

import type { BookCardData } from "@/components/book-card";
import { formatPrice } from "@/lib/format";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Featured Books — Handpicked for you" — 6 vertical book cards.
 *
 * Phase 2.G — accepts real `BookCardData[]` from the homepage (which
 * calls `getFeaturedBooks(6)` at SSG time). Each card now links to the
 * actual `/books/{slug}` instead of the catalog root, and authors come
 * from the DB join.
 *
 * Falls back to a curated demo set when the DB is empty so the homepage
 * never looks abandoned. The demo entries are kept identical to the
 * pre-2.G shape — same gradient palette, ratings, prices — for visual
 * continuity.
 *
 * Rating values are decorative for now (no per-book aggregate is exposed
 * on the catalog API yet). When that lands, swap to the real aggregate.
 */

interface BookProps {
  slug: string; // "" when this is a curated demo card (links to /books root)
  title: string;
  author: string;
  price: string;
  rating: number;
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

const DEMO_FALLBACK: BookProps[] = [
  {
    slug: "",
    title: "Atomic Habits",
    author: "James Clear",
    price: "$19",
    rating: 4.9,
    coverGradient: "linear-gradient(160deg, #c9701a 0%, #5d2f08 100%)",
    coverAccent: "#ffce63",
    badge: { label: "Bestseller", color: "#ff9d4d" },
  },
  {
    slug: "",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: "$22",
    rating: 4.8,
    coverGradient: "linear-gradient(160deg, #1a2c1f 0%, #0a1610 100%)",
    coverAccent: "#33f0aa",
  },
  {
    slug: "",
    title: "Anil Mary",
    author: "Anand Patel",
    price: "$15",
    rating: 4.7,
    coverGradient: "linear-gradient(160deg, #c84a4a 0%, #6b1818 100%)",
    coverAccent: "#ffd0d0",
    badge: { label: "Popular", color: "#7ab6ff" },
  },
  {
    slug: "",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    price: "$18",
    rating: 4.6,
    coverGradient: "linear-gradient(160deg, #16386b 0%, #051426 100%)",
    coverAccent: "#7ab6ff",
  },
  {
    slug: "",
    title: "Fast Slow",
    author: "Daniel Kahneman",
    price: "$24",
    rating: 4.9,
    coverGradient: "linear-gradient(160deg, #d8d4cb 0%, #84807a 100%)",
    coverAccent: "#2a261f",
    darkText: true,
  },
  {
    slug: "",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    price: "$17",
    rating: 4.5,
    coverGradient: "linear-gradient(160deg, #f4f2ed 0%, #d4d1ca 100%)",
    coverAccent: "#ff6b35",
    darkText: true,
  },
];

export function FeaturedBooksSection({
  books = [],
}: {
  /** Real DB books from `getFeaturedBooks(6)`. Empty array → demo fallback. */
  books?: BookCardData[];
}) {
  const cards: BookProps[] =
    books.length > 0
      ? books.slice(0, 6).map((b, i) => ({
          slug: b.slug,
          title: b.title,
          author: b.authors[0]?.name ?? "—",
          price: formatPrice(b.priceCents, b.currency),
          // Rating is decorative until the catalog API exposes per-book
          // aggregates. 4.8 reads as "well-reviewed" without claiming a
          // specific number.
          rating: 4.8,
          coverGradient:
            REAL_BOOK_PALETTE[i % REAL_BOOK_PALETTE.length].coverGradient,
          coverAccent:
            REAL_BOOK_PALETTE[i % REAL_BOOK_PALETTE.length].coverAccent,
        }))
      : DEMO_FALLBACK;

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#33f0aa]/80">
                Handpicked for you
              </p>
              <h2 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[44px]">
                Featured books
              </h2>
            </div>
            <Link
              href="/books"
              className="text-sm font-medium text-[#33f0aa] underline-offset-4 hover:underline"
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
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]/60 rounded-lg"
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
        <h3 className="line-clamp-2 font-serif text-sm font-medium leading-snug text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa]">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-[#88918a]">{book.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#a7a7a0]">
            <Star
              aria-hidden
              className="h-3 w-3 fill-[#33f0aa] text-[#33f0aa]"
            />
            {book.rating.toFixed(1)}
          </div>
          <span className="text-sm font-semibold text-[#e6e6e0]">
            {book.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
