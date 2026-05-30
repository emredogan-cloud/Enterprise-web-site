"use client";

import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { DEMO_BOOKS } from "@/components/catalog/demo-books";
import { RecommendationCard } from "@/components/cart/recommendation-card";

/**
 * Bottom recommendation strip — large glass panel with editorial CTA
 * LEFT and a scroll-snap book carousel RIGHT.
 *
 * Reuses the cart's `<RecommendationCard>` (which has the inline `+`
 * add-to-cart button + check confirmation flow). On a library page,
 * encouraging the reader to add more books to their cart matches the
 * surface intent: "looking for your next read?".
 */
const PICKS = DEMO_BOOKS.slice(0, 8);
const CARD_WIDTH = 180;
const CARD_GAP = 20;

export function LibraryRecommendationShelf() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const delta = (CARD_WIDTH + CARD_GAP) * 2;
    el.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto mt-20 max-w-[1320px] px-4 sm:mt-24 sm:px-6">
      <div className="home-glass relative overflow-hidden rounded-[36px]">
        {/* Top emerald edge line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/40 to-transparent"
        />

        <div className="grid gap-0 lg:grid-cols-[1fr_1.6fr]">
          {/* LEFT — editorial CTA */}
          <div className="relative flex flex-col justify-center p-7 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#33f0aa]">
              Looking for your next read?
            </p>
            <h2 className="mt-4 font-serif text-[26px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[32px]">
              Discover your next favorite book
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#a7a7a0]">
              Explore handpicked recommendations based on your interests.
            </p>
            <Link
              href="/books"
              className="home-cta-primary mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight"
            >
              <BookOpen aria-hidden className="h-4 w-4" />
              <span>Explore books</span>
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          {/* Vertical divider on lg+ */}
          <div
            aria-hidden
            className="pointer-events-none hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:block"
          />

          {/* RIGHT — carousel */}
          <div className="relative border-t border-white/[0.05] py-7 lg:border-l lg:border-t-0 lg:py-9">
            {/* Left arrow */}
            <button
              type="button"
              onClick={() => scrollBy("left")}
              aria-label="Previous picks"
              className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/85 text-[#a7a7a0] backdrop-blur-md transition-all hover:border-[#33f0aa]/40 hover:text-[#33f0aa] hover:shadow-[0_0_16px_rgba(51,240,170,0.3)] sm:flex"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy("right")}
              aria-label="Next picks"
              className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/85 text-[#a7a7a0] backdrop-blur-md transition-all hover:border-[#33f0aa]/40 hover:text-[#33f0aa] hover:shadow-[0_0_16px_rgba(51,240,170,0.3)] sm:flex"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>

            {/* Scroll track — hidden scrollbar (same `.cart-shelf-track` rule) */}
            <div
              ref={trackRef}
              className="cart-shelf-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-7"
              style={{ scrollPaddingInline: "12px" }}
            >
              {PICKS.map((book) => (
                <RecommendationCard key={book.id} book={book} />
              ))}
            </div>

            {/* Edge fades */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#07110b] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#07110b] to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
