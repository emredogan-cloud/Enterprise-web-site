"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/cart/actions";

/**
 * "Add to cart" button rendered on the book detail page.
 *
 * Client Component because it needs `useTransition` for pending-state and
 * `window.dispatchEvent` to notify the header's `CartIndicator` to refetch
 * its count. The Server Action it calls (`addToCart`) lives in
 * `src/app/cart/actions.ts` and writes the cookie server-side.
 *
 * Embedding this Client Component inside the SSG `/books/[slug]` page is
 * safe — Client Components do not promote their parent to dynamic. The
 * page stays `● SSG`; only the button hydrates client-side.
 */
export function AddToCartButton({ bookId }: { bookId: string }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(bookId);
      setAdded(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-changed"));
      }
      // Reset the "Added" affordance after a short pause.
      window.setTimeout(() => setAdded(false), 2500);
    });
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={pending || added}
      aria-live="polite"
    >
      {added ? "Added to cart" : pending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
