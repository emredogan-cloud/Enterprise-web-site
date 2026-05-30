"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

import { removeFromCart } from "@/app/cart/actions";
import { formatPrice } from "@/lib/format";

/**
 * Single cart-line item — glass card with mini cover + meta + remove.
 *
 * Client Component because the remove control wraps a Server Action via
 * `useTransition` for pending state + dispatches the `cart-changed`
 * event the rest of the site listens for (header cart-count refresh).
 */
export interface CartLineBook {
  id: string;
  slug: string;
  title: string;
  authors: ReadonlyArray<{ name: string }>;
  priceCents: number;
  currency: string;
}

export function CartLine({ book }: { book: CartLineBook }) {
  const [pending, startTransition] = useTransition();

  const onRemove = () => {
    startTransition(async () => {
      await removeFromCart(book.id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-changed"));
      }
    });
  };

  return (
    <article className="home-glass home-card-hover relative flex items-center gap-5 rounded-2xl p-4 transition-opacity duration-300 data-[pending=true]:opacity-50">
      {/* Mini cover — CSS-rendered placeholder (same primitive as catalog) */}
      <Link
        href={`/books/${book.slug}`}
        className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md shadow-[0_8px_16px_-6px_rgba(0,0,0,0.6)]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #1a3326 0%, #0a1f14 60%, #07110b 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-3 -top-3 h-12 w-12 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(51, 240, 170, 0.35) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-2">
          <p className="font-serif text-[9px] font-medium leading-tight text-white line-clamp-2">
            {book.title}
          </p>
        </div>
        {/* Right edge highlight */}
        <div
          aria-hidden
          className="absolute right-0 top-[2px] bottom-[2px] w-[1.5px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />
      </Link>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/books/${book.slug}`}
          className="block font-serif text-base font-medium leading-tight text-[#e6e6e0] transition-colors hover:text-[#33f0aa]"
        >
          {book.title}
        </Link>
        {book.authors.length > 0 && (
          <p className="mt-1 text-sm text-[#88918a]">
            {book.authors.map((a) => a.name).join(", ")}
          </p>
        )}
        <p className="mt-2 text-sm font-semibold text-[#e6e6e0] tabular-nums">
          {formatPrice(book.priceCents, book.currency)}
        </p>
      </div>

      {/* Remove — circular glass icon button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={pending}
        aria-label={`Remove ${book.title} from cart`}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-[#88918a] transition-all hover:border-[#ff7a7a]/40 hover:bg-[#ff7a7a]/10 hover:text-[#ff9b9b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </article>
  );
}
