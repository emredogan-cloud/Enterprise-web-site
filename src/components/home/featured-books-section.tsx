import Link from "next/link";

import type { BookCardData } from "@/components/book-card";
import { CoverArt } from "@/components/cinematic/cover-art";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Featured books" — an editorial column beside a horizontal shelf of cards.
 *
 * WHAT THE CARDS SAY, AND WHAT THEY DELIBERATELY DO NOT.
 * Cover, title, subtitle, imprint, and the collections the book actually
 * belongs to. No price — during the free campaign every one of these is free
 * to request, and a struck-through figure beside "free" is noise. When the
 * campaign ends the price belongs back on the card; that is a one-line change
 * against `campaignIsOpen()`, deliberately not hard-coded to a date here.
 *
 * No invented ratings, no invented bestseller badges, no curated books by
 * other publishers when the database is empty. An empty catalogue renders
 * nothing at all.
 *
 * THE CHIPS ARE REAL. `categories` comes from `book_categories`. A book in one
 * collection shows one chip; nothing pads it out to two to match a mockup.
 *
 * Scrolling is native — `overflow-x-auto` with scroll snapping. No carousel
 * library, no JS, no autoplay: a keyboard tabs through the links, a trackpad
 * swipes, a screen reader reads a list. The arrows in the reference are a
 * mouse affordance for a scroller that already works without them, and adding
 * a client component to draw two buttons would be the most expensive part of
 * this section.
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
    <section className="relative py-14 sm:py-20 lg:py-24" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12">
          {/* Editorial column */}
          <div className="lg:pt-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#33f0aa] shadow-[0_0_8px_#33f0aa]"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-bright/80 sm:text-[11px]">
                Featured books
              </span>
            </div>
            <h2
              id="featured-heading"
              className="mt-4 font-serif text-[30px] font-medium leading-[1.12] tracking-[-0.02em] text-fg-hi sm:text-[36px]"
            >
              Thoughtful reads for a brighter tomorrow.
            </h2>
            <Link
              href="/books"
              className="mt-5 inline-flex items-center gap-1.5 border-b border-white/20 pb-1 text-[13px] font-medium text-fg-mid transition-colors hover:border-emerald-bright/60 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]"
            >
              View all books
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* The shelf of cards */}
          <RevealOnScroll>
            <div
              className="rail-scroll -mx-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:rounded-2xl lg:border lg:border-white/[0.07] lg:bg-white/[0.015] lg:px-2 lg:py-2"
              style={{ scrollSnapType: "x proximity" }}
            >
              <ul className="flex list-none gap-3 lg:gap-0">
                {cards.map((b, i) => (
                  <li
                    key={b.slug}
                    style={{ scrollSnapAlign: "start" }}
                    className={
                      "w-[260px] shrink-0 sm:w-[300px] lg:w-[calc(100%/3)] lg:min-w-[260px]" +
                      // Hairline dividers between cards, like the reference —
                      // but only where cards actually sit side by side.
                      (i > 0 ? " lg:border-l lg:border-white/[0.06]" : "")
                    }
                  >
                    <Link
                      href={`/books/${b.slug}`}
                      className="group flex h-full gap-3.5 rounded-xl p-3 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa] lg:gap-4"
                    >
                      <div className="relative aspect-[2/3] w-[74px] shrink-0 overflow-hidden rounded-md border border-white/[0.07] shadow-[0_10px_22px_-14px_rgba(0,0,0,0.9)] sm:w-[84px]">
                        <CoverArt
                          src={b.coverSrc ?? null}
                          title={b.title}
                          alt={`${b.title} — cover`}
                          sizes="84px"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="font-serif text-[15px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-base">
                          {b.title}
                        </h3>
                        {b.subtitle ? (
                          <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-fg-soft">
                            {b.subtitle}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-fg-soft/80">
                          Valice Press
                        </p>

                        {b.categories && b.categories.length > 0 ? (
                          <ul className="mt-auto flex list-none flex-wrap gap-1.5 pt-3">
                            {b.categories.slice(0, 2).map((c) => (
                              <li
                                key={c}
                                className="rounded-full border border-white/[0.12] px-2.5 py-1 text-[10.5px] leading-none text-fg-mid"
                              >
                                {c}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
