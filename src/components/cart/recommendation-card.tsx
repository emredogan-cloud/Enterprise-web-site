"use client";

import { Check, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

import { addToCart } from "@/app/cart/actions";
import type { DemoBook } from "@/components/catalog/demo-books";

/**
 * Single recommendation card for the "You might like" shelf.
 *
 * Visually identical DNA to the catalog book card (cover + meta), with
 * one critical difference: the bottom row uses Flexbox `justify-between`
 * + `items-end` so the rating/price block aligns LEFT and the small
 * circular `+` add button aligns RIGHT — exactly per the brief.
 *
 * The `+` button calls `addToCart` directly (no shopping flow detour);
 * once added, it flips to a green ✓ check to confirm the addition. The
 * `cart-changed` event refreshes the header's cart-count indicator.
 */
export function RecommendationCard({ book }: { book: DemoBook }) {
  const [pending, startTransition] = useTransition();
  // Local "added" flag — visible for 2 seconds, then resets.
  // We use a stale `useState` ref pattern via a CSS data attribute so we
  // don't trigger re-renders for the flash effect.
  const [added, setAdded] = useStateAdded();

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await addToCart(book.id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-changed"));
      }
      setAdded();
    });
  };

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group relative flex h-full flex-shrink-0 snap-start flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60 rounded-lg"
      style={{ width: "180px" }}
    >
      {/* Cover */}
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-[16px] border border-white/[0.08] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.7)]">
        <div
          className="absolute inset-0"
          style={{ background: book.cover.gradient }}
        />

        {/* Corner accent glow */}
        <div
          aria-hidden
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${book.cover.accent}55 0%, transparent 70%)`,
          }}
        />

        {/* Title on cover */}
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          <span
            className="text-[8px] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: book.cover.darkText
                ? "rgba(0,0,0,0.5)"
                : "rgba(255,255,255,0.5)",
            }}
          >
            {book.category}
          </span>
          <p
            className="font-serif text-[14px] font-medium leading-tight"
            style={{
              color: book.cover.darkText ? "#1a1612" : "#ffffff",
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
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1 px-0.5">
        <h4 className="line-clamp-1 font-serif text-[14px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h4>
        <p className="text-xs text-fg-soft">{book.author}</p>
      </div>

      {/* Bottom row — rating/price LEFT, + button RIGHT.
          Per the brief: flex space-between + items-end alignment. */}
      <div className="flex items-end justify-between px-0.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-fg-mid">
            <Star
              aria-hidden
              className="h-3 w-3 fill-[#f4c44b] text-[#f4c44b]"
            />
            <span className="tabular-nums">{book.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-fg-hi">
            ${(book.priceCents / 100).toFixed(0)}
          </span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={pending}
          aria-label={`Add ${book.title} to cart`}
          aria-pressed={added}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            added
              ? "border-emerald-bright/60 bg-emerald-bright/15 text-emerald-bright shadow-[0_0_14px_rgba(51,240,170,0.45)]"
              : "border-white/[0.1] bg-white/[0.03] text-fg-mid hover:scale-105 hover:border-emerald-bright/50 hover:bg-emerald-bright/10 hover:text-emerald-bright hover:shadow-[0_0_14px_rgba(51,240,170,0.4)]"
          }`}
        >
          {added ? (
            <Check aria-hidden className="h-4 w-4" />
          ) : (
            <Plus aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Tiny local hook — temporary "added" flag that auto-clears after 2 sec.     */
/* Kept local because no other component needs it.                            */
/* -------------------------------------------------------------------------- */

import { useCallback, useState } from "react";

function useStateAdded(): [boolean, () => void] {
  const [added, setRawAdded] = useState(false);
  const set = useCallback(() => {
    setRawAdded(true);
    window.setTimeout(() => setRawAdded(false), 2000);
  }, []);
  return [added, set];
}
