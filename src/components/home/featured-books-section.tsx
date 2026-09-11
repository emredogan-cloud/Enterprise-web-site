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
    <section className="relative py-16 sm:py-24 lg:py-32" aria-labelledby="featured-heading">
      {/*
        Same container as the hero, for the same reason: `max-w-7xl` left a
        280px gutter and squeezed the editorial column to a measured 16% of
        the section — the brief asks for 30-35%. The grid is now a fraction
        rather than a fixed 300px, so the balance holds at every width.
      */}
      <div className="mx-auto w-full max-w-[1700px] px-6 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:gap-14 xl:gap-16">
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
              className="mt-5 font-serif text-[34px] font-medium leading-[1.08] tracking-[-0.025em] text-fg-hi sm:text-[44px] lg:text-[52px] xl:text-[58px]"
            >
              Thoughtful reads for a brighter tomorrow.
            </h2>
            <p className="mt-5 max-w-[330px] text-[14px] leading-relaxed text-fg-soft sm:text-[15px]">
              Six from the shelf, chosen for people who keep what they read.
            </p>
            <Link
              href="/books"
              className="mt-7 inline-flex items-center gap-1.5 border-b border-white/20 pb-1.5 text-[14px] font-medium text-fg-mid transition-colors hover:border-emerald-bright/60 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]"
            >
              View all books
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* The shelf of cards */}
          <RevealOnScroll>
            <div
              className="rail-scroll -mx-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:rounded-[20px] lg:border lg:border-white/[0.07] lg:bg-white/[0.015] lg:px-3 lg:py-3"
              style={{ scrollSnapType: "x proximity" }}
            >
              <ul className="flex list-none gap-3 lg:gap-0">
                {cards.map((b, i) => (
                  <li
                    key={b.slug}
                    style={{ scrollSnapAlign: "start" }}
                    className={
                      "w-[290px] shrink-0 sm:w-[330px] lg:w-[calc(100%/3)] lg:min-w-[300px]" +
                      // Hairline dividers between cards, like the reference —
                      // but only where cards actually sit side by side.
                      (i > 0 ? " lg:border-l lg:border-white/[0.06]" : "")
                    }
                  >
                    <Link
                      href={`/books/${b.slug}`}
                      className="group flex h-full gap-4 rounded-xl p-3.5 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa] lg:gap-5 lg:p-4"
                    >
                      {/* The cover was a measured 82px — a thumbnail, not a
                          book. A discovery shelf has to show the artwork. */}
                      <div className="relative aspect-[2/3] w-[112px] shrink-0 overflow-hidden rounded-lg border border-white/[0.07] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none sm:w-[124px] lg:w-[136px] xl:w-[148px]">
                        <CoverArt
                          src={b.coverSrc ?? null}
                          title={b.title}
                          alt={`${b.title} — cover`}
                          sizes="(min-width: 1280px) 148px, (min-width: 1024px) 136px, (min-width: 640px) 124px, 112px"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="font-serif text-[17px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright sm:text-[18px] xl:text-[19px]">
                          {b.title}
                        </h3>
                        {b.subtitle ? (
                          <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-fg-soft">
                            {b.subtitle}
                          </p>
                        ) : null}
                        <p className="mt-2.5 text-[11px] uppercase tracking-[0.16em] text-fg-soft/80">
                          Valice Press
                        </p>

                        {b.categories && b.categories.length > 0 ? (
                          <ul className="mt-auto flex list-none flex-wrap gap-1.5 pt-3">
                            {b.categories.slice(0, 2).map((c) => (
                              <li
                                key={c}
                                className="rounded-full border border-white/[0.12] px-3 py-1.5 text-[11px] leading-none text-fg-mid"
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
