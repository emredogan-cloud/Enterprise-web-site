"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cart count badge for the global header.
 *
 * Client Component on purpose: it fetches the current cart count from the
 * dedicated `/api/cart/count` Route Handler. Putting the cookie read in a
 * Client Component (and a separate Route Handler) keeps the parent
 * `SiteHeader` and `layout.tsx` *pure server-static*, which is what lets
 * every catalog route stay `○ Static` / `● SSG`.
 *
 * Updates after a cart mutation come via a `cart-changed` `CustomEvent`
 * dispatched on `window` from `AddToCartButton` / `RemoveFromCartButton`
 * / `ClearCartButton`. That's deliberately lightweight — no context, no
 * state library; the data is in the cookie and we re-fetch on signal.
 */
export function CartIndicator() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refetch = async () => {
      try {
        const res = await fetch("/api/cart/count", { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { count?: unknown };
        if (cancelled) return;
        setCount(typeof data.count === "number" ? data.count : 0);
      } catch {
        if (!cancelled) setCount(0);
      }
    };

    void refetch();

    const handler = () => {
      void refetch();
    };
    window.addEventListener("cart-changed", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("cart-changed", handler);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      aria-label={
        count !== null && count > 0
          ? `Cart — ${count} item${count === 1 ? "" : "s"}`
          : "Cart"
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count !== null && count > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
