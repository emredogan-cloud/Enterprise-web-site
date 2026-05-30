"use client";

import { useState, useTransition } from "react";

import { clearCart, createCheckoutSession } from "@/app/cart/actions";
import { formatPrice } from "@/lib/format";

/**
 * Cart totals + checkout + clear, in one glass panel.
 *
 * Client Component because:
 *   - Checkout: `useTransition` for the Paddle session creation, then
 *     `window.location.href` to the hosted checkout URL (Server Actions
 *     can't return cross-origin redirects).
 *   - Clear: also useTransition; emits the `cart-changed` event for the
 *     header cart-count indicator to refresh.
 */
export function CartSummary({
  totalCents,
  currency,
  itemCount,
}: {
  totalCents: number;
  currency: string;
  itemCount: number;
}) {
  const [checkoutPending, startCheckout] = useTransition();
  const [clearPending, startClear] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onCheckout = () => {
    setError(null);
    startCheckout(async () => {
      const result = await createCheckoutSession();
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.error);
      }
    });
  };

  const onClear = () => {
    startClear(async () => {
      await clearCart();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-changed"));
      }
    });
  };

  return (
    <aside className="home-glass relative overflow-hidden rounded-[24px] p-6 sm:p-7">
      {/* Top emerald edge line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/45 to-transparent"
      />

      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
        Order summary
      </h2>

      {/* Line items count */}
      <div className="mt-6 flex items-baseline justify-between border-b border-white/[0.06] pb-4 text-sm">
        <span className="text-fg-mid">
          {itemCount} {itemCount === 1 ? "book" : "books"}
        </span>
        <span className="text-fg-hi tabular-nums">
          {formatPrice(totalCents, currency)}
        </span>
      </div>

      {/* Tax note — Paddle handles tax at checkout, so we're explicit */}
      <p className="mt-3 text-xs text-fg-fade">
        Local taxes are calculated at checkout by our Merchant of Record.
      </p>

      {/* Total */}
      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-fg-mid">
          Total
        </span>
        <span className="font-serif text-3xl font-medium text-fg-hi tabular-nums">
          {formatPrice(totalCents, currency)}
        </span>
      </div>

      {/* Checkout CTA */}
      <button
        type="button"
        onClick={onCheckout}
        disabled={checkoutPending}
        aria-live="polite"
        className="home-cta-primary mt-7 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-sm font-semibold tracking-tight disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checkoutPending ? "Starting checkout…" : "Checkout securely"}
        <span aria-hidden className="text-base">
          →
        </span>
      </button>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-[#ff7a7a]/30 bg-[#ff7a7a]/5 px-3 py-2 text-xs text-[#ff9b9b]"
        >
          {error}
        </p>
      )}

      {/* Clear cart — subtle link-style */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onClear}
          disabled={clearPending}
          className="text-xs text-fg-fade underline-offset-4 transition-colors hover:text-fg-mid hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {clearPending ? "Clearing…" : "Clear cart"}
        </button>
      </div>

      {/* Trust microcopy */}
      <div className="mt-7 border-t border-white/[0.06] pt-5">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-fg-fade">
          ✓ Paddle · MoR &nbsp;·&nbsp; ✓ Watermarked PDF &nbsp;·&nbsp; ✓ Yours to keep
        </p>
      </div>
    </aside>
  );
}
