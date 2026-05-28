"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { clearCart, removeFromCart } from "@/app/cart/actions";

function dispatchCartChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-changed"));
  }
}

export function RemoveFromCartButton({ bookId }: { bookId: string }) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await removeFromCart(bookId);
      dispatchCartChanged();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}

export function ClearCartButton() {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await clearCart();
      dispatchCartChanged();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "Clearing…" : "Clear cart"}
    </Button>
  );
}
