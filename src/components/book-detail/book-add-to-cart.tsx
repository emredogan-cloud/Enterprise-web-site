"use client";

import { useState, useTransition } from "react";

import { addToCart } from "@/app/cart/actions";

/**
 * Cinematic "Add to cart" button for `/books/[slug]`.
 *
 * Phase 1.C. Same server-action contract as the warm `<AddToCartButton>`:
 *   - Calls `addToCart(bookId)` (writes the cart cookie server-side)
 *   - Dispatches `cart-changed` so the header's cart badge can refresh
 *   - Reverts the "Added" affordance after ~2.5s
 *
 * Chrome differences:
 *   - `.home-cta-primary` — emerald gradient pill, not warm shadcn Button
 *   - Full-width by default; the buy panel layout controls the width
 *   - Pending-state pulse uses an emerald dot instead of a spinner glyph
 *
 * SSG-safe: this Client Component embedded inside an SSG page does not
 * promote the page to dynamic — only the button hydrates.
 */
export function BookAddToCart({ bookId }: { bookId: string }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(bookId);
      setAdded(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-changed"));
      }
      window.setTimeout(() => setAdded(false), 2500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || added}
      aria-live="polite"
      className="home-cta-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-80"
    >
      {added ? (
        <>
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-[#032015] shadow-[0_0_6px_rgba(3,32,21,0.6)]"
          />
          Added to cart
        </>
      ) : pending ? (
        <>
          <span
            aria-hidden
            className="h-2 w-2 animate-pulse rounded-full bg-[#032015]"
          />
          Adding…
        </>
      ) : (
        <>Add to cart</>
      )}
    </button>
  );
}
