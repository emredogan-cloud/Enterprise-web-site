"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

/**
 * <CinematicRecommendationCarousel> — Phase 3.F shared primitive.
 *
 * Extracts the horizontal scroll-snap carousel (track + arrows + edge
 * fades) that `cart/recommendation-shelf` and
 * `library/library-recommendation-shelf` were each cloning. Now both
 * consumers (and the new Phase 3.F RelatedBooks shelf on
 * `/books/[slug]`) call this single primitive.
 *
 * Children = the cards. The carousel doesn't care what shape they are
 * (cart-shelf uses `<RecommendationCard book={DemoBook}>`, library uses
 * the same, RelatedBooks uses its own). Width-180 + gap-20 is the
 * canonical card geometry; the arrow `scrollBy` is calibrated against
 * those numbers.
 *
 * The `padX` prop tunes inner padding for shelves that need it (library
 * embeds the carousel inside a glass panel with edge breathing room;
 * cart sits flush in a page section). Pass `0` for flush, `7` (default)
 * for breathing room.
 */
const CARD_WIDTH = 180;
const CARD_GAP = 20;

export function CinematicRecommendationCarousel({
  children,
  prevLabel = "Previous picks",
  nextLabel = "Next picks",
  arrowVariant = "outset",
  padX = 0,
}: {
  /** The card components, already mapped over the items array. */
  children: ReactNode;
  prevLabel?: string;
  nextLabel?: string;
  /**
   * Arrow positioning:
   *   - "outset"  → arrows sit OUTSIDE the visible track (cart shelf)
   *   - "overlay" → arrows overlay the track edges (library shelf, where
   *                 the carousel is nested inside a glass panel and there
   *                 is no room to the side)
   */
  arrowVariant?: "outset" | "overlay";
  /** Inner horizontal padding of the scroll track. Default 0 (flush). */
  padX?: 0 | 4 | 6 | 7 | 8 | 10 | 12;
}) {
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

  // Arrow chrome differs slightly between the two existing call sites
  // (cart = 11×11 outside; library = 10×10 overlay). Standardize on a
  // single set; the existing micro-diff was accidental.
  const arrowSize = "h-11 w-11";
  const arrowLeftPos =
    arrowVariant === "outset"
      ? "-left-2 lg:-left-14"
      : "left-2";
  const arrowRightPos =
    arrowVariant === "outset"
      ? "-right-2 lg:-right-14"
      : "right-2";

  const trackPadClass: Record<typeof padX, string> = {
    0: "",
    4: "px-4",
    6: "px-6",
    7: "px-7",
    8: "px-8",
    10: "px-10",
    12: "px-12",
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scrollBy("left")}
        aria-label={prevLabel}
        className={`absolute ${arrowLeftPos} top-1/2 z-20 hidden ${arrowSize} -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/85 text-fg-mid backdrop-blur-md transition-all hover:border-emerald-bright/40 hover:text-emerald-bright hover:shadow-[0_0_18px_rgba(51,240,170,0.3)] sm:flex`}
      >
        <ChevronLeft aria-hidden className="h-5 w-5" />
      </button>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scrollBy("right")}
        aria-label={nextLabel}
        className={`absolute ${arrowRightPos} top-1/2 z-20 hidden ${arrowSize} -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.1] bg-[#0a1410]/85 text-fg-mid backdrop-blur-md transition-all hover:border-emerald-bright/40 hover:text-emerald-bright hover:shadow-[0_0_18px_rgba(51,240,170,0.3)] sm:flex`}
      >
        <ChevronRight aria-hidden className="h-5 w-5" />
      </button>

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className={`cart-shelf-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 ${trackPadClass[padX]}`}
        style={{ scrollPaddingInline: "8px" }}
      >
        {children}
      </div>

      {/* Edge fades — left + right, so cards melt into the page edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#07110b] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#07110b] to-transparent"
      />
    </div>
  );
}
