"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/cart/actions";

/**
 * Checkout button on `/cart` — calls the `createCheckoutSession` Server
 * Action, which talks to Paddle and returns a hosted checkout URL. On
 * success we hard-navigate the browser to Paddle; on failure we surface
 * a calm inline error so the user knows what went wrong without a 500.
 *
 * Client Component because it needs `useTransition` for pending state and
 * a direct `window.location.href` assignment for the redirect — Server
 * Actions cannot return a redirect to an external URL.
 */
export function CheckoutButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        size="lg"
        onClick={handleClick}
        disabled={pending}
        aria-live="polite"
      >
        {pending ? "Starting checkout…" : "Checkout"}
      </Button>
      {error && (
        <p
          role="alert"
          className="max-w-sm text-pretty text-xs text-destructive sm:text-right"
        >
          {error}
        </p>
      )}
    </div>
  );
}
