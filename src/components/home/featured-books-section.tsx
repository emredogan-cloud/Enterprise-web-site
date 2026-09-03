import Link from "next/link";

import type { BookCardData } from "@/components/book-card";
import { CoverArt } from "@/components/cinematic/cover-art";
import { formatCatalogPrice } from "@/lib/format";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Featured books — Handpicked for you" — six vertical book cards.
 *
 * Accepts real `BookCardData[]` from the homepage (`getFeaturedBooks(6)` at
 * SSG time). Each card links to `/books/{slug}` and draws the book's REAL
 * cover through `<CoverArt>`; the query layer attaches `coverSrc` from the
 * asset manifest, so this section cannot disagree with `/ebooks` about what
 * a book looks like. Until Phase 4 it painted six gradients by index and
 * never looked at the cover at all — the most visible surface on the site
 * showed no book.
 *
 * Three things this section used to do, and no longer does: fall back to six
 * curated bestsellers by other publishers when the database was empty; stamp
 * every card with an invented 4.8-star rating; and hide real covers behind a
 * palette. An empty catalog now renders nothing, a book with no reviews shows
 * no stars, and a book with a cover shows its cover.
 *
 * The price label is `formatCatalogPrice`: a real direct price, or "On
 * Amazon" for a title whose editions are all fulfilled there — never "$0".
 */
export function FeaturedBooksSection({
  books = [],
}: {
  /** Real DB books from `getFeaturedBooks(6)`. Empty → section hidden. */
  books?: BookCardData[];
}) {
  const cards = books.slice(0, 6);
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
            <FeaturedCard key={book.id} book={book} priority={i < 3} />
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

function FeaturedCard({ book, priority }: { book: BookCardData; priority: boolean }) {
  const author = book.authors[0]?.name ?? "—";
  const price = formatCatalogPrice(book.priceCents, book.currency);
  const direct = book.priceCents > 0;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60"
    >
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] bg-[#0a1410] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)]">
        <CoverArt
          src={book.coverSrc}
          title={book.title}
          eyebrow="Featured"
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
        />
      </div>

      <div className="mt-4 px-0.5">
        <h3 className="line-clamp-2 font-serif text-sm font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-fg-soft">{author}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-fg-fade">
            {direct ? "Ebook · direct" : "Print · Amazon"}
          </span>
          <span className="text-sm font-semibold text-fg-hi">{price}</span>
        </div>
      </div>
    </Link>
  );
}
