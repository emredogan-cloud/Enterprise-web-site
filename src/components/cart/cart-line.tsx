"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";

import { removeFromCart } from "@/app/cart/actions";
import { CoverArt } from "@/components/cinematic/cover-art";
import { formatPrice } from "@/lib/format";

/**
 * Single cart-line item — glass card with mini cover + meta + remove.
 *
 * Client Component because the remove control wraps a Server Action via
 * `useTransition` for pending state + dispatches the `cart-changed`
 * event the rest of the site listens for (header cart-count refresh).
 *
 * The mini cover is the book's real cover (`coverSrc`, attached by the
 * catalog query from the asset manifest). It used to be a fixed emerald
 * gradient for every line, whatever was in the cart.
 */
export interface CartLineBook {
  id: string;
  slug: string;
  title: string;
  authors: ReadonlyArray<{ name: string }>;
  priceCents: number;
  currency: string;
  coverSrc?: string | null;
}

export function CartLine({
  book,
  owned = false,
}: {
  book: CartLineBook;
  /** Signed-in user already owns this book (non-revoked entitlement). */
  owned?: boolean;
}) {
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
    <article
      data-pending={pending ? "true" : "false"}
      className="home-glass home-card-hover relative flex items-center gap-5 rounded-2xl p-4 transition-opacity duration-300 data-[pending=true]:opacity-50"
    >
      {/* Mini cover */}
      <Link
        href={`/books/${book.slug}`}
        className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#0a1410] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.6)]"
      >
        <CoverArt
          src={book.coverSrc}
          title={book.title}
          sizes="64px"
          titleClassName="font-serif text-[9px] font-medium leading-tight text-white line-clamp-3"
        />
      </Link>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/books/${book.slug}`}
          className="block font-serif text-base font-medium leading-tight text-fg-hi transition-colors hover:text-emerald-bright"
        >
          {book.title}
        </Link>
        {book.authors.length > 0 && (
          <p className="mt-1 text-sm text-fg-soft">
            {book.authors.map((a) => a.name).join(", ")}
          </p>
        )}
        <p className="mt-2 text-sm font-semibold text-fg-hi tabular-nums">
          {formatPrice(book.priceCents, book.currency)}
        </p>
        {owned && (
          <Link
            href="/account/library"
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-[#f4c44b]/30 bg-[#f4c44b]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#f4c44b] transition-colors hover:border-[#f4c44b]/50"
          >
            Already in your library — remove to check out
          </Link>
        )}
      </div>

      {/* Remove — circular glass icon button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={pending}
        aria-label={`Remove ${book.title} from cart`}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-fg-soft transition-all hover:border-[#ff7a7a]/40 hover:bg-[#ff7a7a]/10 hover:text-[#ff9b9b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </article>
  );
}
