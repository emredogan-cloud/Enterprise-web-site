import Link from "next/link";

import { BookAddToCart } from "@/components/book-detail/book-add-to-cart";
import { BookCover } from "@/components/book-detail/book-cover";
import { CinematicStarRating } from "@/components/book-detail/cinematic-star-rating";
import { formatPrice } from "@/lib/format";

/**
 * Cinematic book-detail hero — Product Detail family.
 *
 * Phase 1.C. Layout:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  LEFT (sticky on desktop)        │  RIGHT (scrolling)     │
 *   │  ┌────────────┐                  │  AUTHORS (eyebrow)     │
 *   │  │            │                  │  Title (serif)         │
 *   │  │  COVER     │                  │  Subtitle              │
 *   │  │  (2:3)     │                  │  ★★★★★ 4.5 · 23 rev   │
 *   │  └────────────┘                  │  Description prose      │
 *   │                                  │  Meta dl (Pages, Lang,  │
 *   │  ┌──── BUY PANEL ────┐           │   ISBN)                 │
 *   │  │  $19.00           │           │                         │
 *   │  │  [Add to cart]    │           │                         │
 *   │  │  trust microcopy  │           │                         │
 *   │  └───────────────────┘           │                         │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Pure Server Component (BookAddToCart is a Client island).
 */

export interface BookHeroProps {
  bookId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverKey: string | null;
  /** Pre-resolved cover source (R2 coverKey URL → /images/books/{slug}.webp). */
  coverSrc?: string | null;
  priceCents: number;
  currency: string;
  pageCount: number | null;
  language: string;
  isbn: string | null;
  authors: ReadonlyArray<{ slug: string; name: string }>;
  ratingAggregate: { count: number; average: number | null };
  /**
   * Whether this store can actually sell this book.
   *
   * False for a title that exists only as print, or whose ebook is
   * elsewhere — Codex Mythologica's Kindle edition is enrolled in KDP
   * Select, and The Myth Hunter's Field Book is written in by hand and has
   * no digital edition at all. Both are real, published, buyable books; they
   * are simply not buyable *here*.
   *
   * `books.price_cents` is 0 for exactly those titles, because zero is what
   * this store charges for something it does not sell. Rendering that as
   * "$0.00" above an add-to-cart button — which is what happened the moment
   * the first Amazon-only book was published — advertises a free book and
   * then fails. So the panel switches instead of formatting a zero.
   */
  directSale?: boolean;
}

export function BookHero({
  bookId,
  title,
  subtitle,
  description,
  coverKey,
  coverSrc,
  priceCents,
  currency,
  pageCount,
  language,
  isbn,
  authors,
  ratingAggregate,
  directSale = true,
}: BookHeroProps) {
  return (
    <section className="mx-auto mt-6 max-w-[1320px] px-4 sm:mt-10 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.4fr)] lg:gap-16">
        {/* LEFT — cover + sticky buy panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookCover
            title={title}
            coverKey={coverKey}
            coverSrc={coverSrc}
            priority
          />

          {/* Buy panel — glass card with price + CTA + trust microcopy */}
          <div className="home-glass relative mt-10 overflow-hidden rounded-[20px] p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
            />

            {/* Price line — only when there is a price of ours to state. */}
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                {directSale ? "Price" : "Editions"}
              </span>
              <span className="font-serif text-[28px] font-medium leading-none text-fg-hi">
                {directSale ? formatPrice(priceCents, currency) : "In print"}
              </span>
            </div>

            <div className="mt-5">
              {directSale ? (
                <BookAddToCart bookId={bookId} />
              ) : (
                <a
                  href="#formats-heading"
                  className="home-cta-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight"
                >
                  See editions and prices
                  <span aria-hidden>↓</span>
                </a>
              )}
            </div>
            {!directSale && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-fg-soft">
                This title isn&apos;t sold on this site. Every edition it
                exists in is listed below, with where to buy it.
              </p>
            )}

            {/* Trust microcopy — the "buy once, yours to keep" promise + refund link */}
            <ul className="mt-5 space-y-2 text-[12px] text-fg-mid">
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-[#33f0aa] shadow-[0_0_4px_#33f0aa]"
                />
                Yours to keep — never locked
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-[#33f0aa] shadow-[0_0_4px_#33f0aa]"
                />
                Watermarked PDF, no DRM
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-[#33f0aa] shadow-[0_0_4px_#33f0aa]"
                />
                14-day refund before download
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT — meta, title, description */}
        <div>
          {/* Authors */}
          {authors.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
              {authors.map((a, i) => (
                <span key={`${a.slug}-${i}`}>
                  {/* Always a real link now. The plain-text branch existed
                      for demo-catalog titles whose author slugs resolved to
                      nothing; those titles are gone and every author here is
                      a row with a page. */}
                  <Link
                    href={`/authors/${a.slug}`}
                    className="transition-colors hover:text-fg-hi"
                  >
                    {a.name}
                  </Link>
                  {i < authors.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}

          {/* Title */}
          <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.05] tracking-[-0.025em] text-fg-hi sm:text-[56px] lg:text-[64px]">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-5 font-serif text-[20px] italic text-fg-mid sm:text-[22px]">
              {subtitle}
            </p>
          )}

          {/* Aggregate rating — visible only when there's at least one review */}
          {ratingAggregate.count > 0 && ratingAggregate.average !== null && (
            <div className="mt-6 flex items-center gap-3">
              <CinematicStarRating
                value={ratingAggregate.average}
                size="sm"
              />
              <p className="text-sm text-fg-mid">
                <span className="font-medium text-fg-hi">
                  {ratingAggregate.average.toFixed(1)}
                </span>{" "}
                · {ratingAggregate.count}{" "}
                {ratingAggregate.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="mt-10 max-w-prose text-pretty text-base leading-relaxed text-[#d4d4cc] sm:text-[17px]">
              {description}
            </p>
          )}

          {/* Meta — Pages / Language / ISBN */}
          <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
            {pageCount !== null && (
              <>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                  Pages
                </dt>
                <dd className="text-fg-hi">{pageCount}</dd>
              </>
            )}
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
              Language
            </dt>
            <dd className="text-fg-hi">{language}</dd>
            {isbn && (
              <>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
                  ISBN
                </dt>
                <dd className="font-mono text-xs text-fg-mid">{isbn}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
