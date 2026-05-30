"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { DEMO_BOOKS, type DemoBook } from "@/components/catalog/demo-books";

import { RecommendationCard } from "./recommendation-card";

/**
 * "You might like" recommendation shelf.
 *
 * Horizontal scroll-snap carousel with circular glass arrow buttons
 * positioned OUTSIDE the visible card track (per the brief — never
 * overlapping the books, vertically centered).
 *
 * Why CSS scroll-snap + a tiny scrollBy handler instead of a heavy
 * carousel lib:
 *   - Native scroll-snap is buttery on mobile (touch) AND keyboard.
 *   - Arrow buttons just call `scrollBy({ left: cardWidth + gap })`.
 *   - Total client cost: ~30 lines.
 *
 * Picks: first 8 entries from the catalog's demo set, so the showcase
 * stays consistent with what users see on the /books page.
 */

const VISIBLE_PICKS: DemoBook[] = DEMO_BOOKS.slice(0, 8);
const CARD_WIDTH = 180;
const CARD_GAP = 20;

export function RecommendationShelf() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by 2 cards at a time so the user sees real progress on each press.
    const delta = (CARD_WIDTH + CARD_GAP) * 2;
    el.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative mt-24 px-6 sm:mt-28">
      {/* Section heading — centered, editorial */}
      <header className="text-center">
        <h2 className="font-serif text-[28px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[34px]">
          You might like
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#33f0aa]/50 to-transparent" />
      </header>

      {/* Carousel container — outer holds the arrow buttons; inner scrolls */}
      <div className="relative mt-10 lg:mx-12">
        {/* Left arrow — vertically centered outside the track */}
        <button
          type="button"
          onClick={() => scrollBy("left")}
          aria-label="Previous picks"
          className="absolute -left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/80 text-[#a7a7a0] backdrop-blur-md transition-all hover:border-[#33f0aa]/40 hover:text-[#33f0aa] hover:shadow-[0_0_18px_rgba(51,240,170,0.3)] sm:flex lg:-left-14"
        >
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </button>

        {/* Right arrow — symmetric to the left */}
        <button
          type="button"
          onClick={() => scrollBy("right")}
          aria-label="Next picks"
          className="absolute -right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/80 text-[#a7a7a0] backdrop-blur-md transition-all hover:border-[#33f0aa]/40 hover:text-[#33f0aa] hover:shadow-[0_0_18px_rgba(51,240,170,0.3)] sm:flex lg:-right-14"
        >
          <ChevronRight aria-hidden className="h-5 w-5" />
        </button>

        {/* Scrolling track */}
        <div
          ref={trackRef}
          className="cart-shelf-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4"
          style={{ scrollPaddingInline: "8px" }}
        >
          {VISIBLE_PICKS.map((book) => (
            <RecommendationCard key={book.id} book={book} />
          ))}
        </div>

        {/* Soft edge fade — left + right, so cards melt into the page edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#07110b] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#07110b] to-transparent"
        />
      </div>
    </section>
  );
}
