"use client";

import { Check, ExternalLink, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

import { addToCart } from "@/app/cart/actions";
import type { CatalogItem } from "@/components/catalog/catalog-item";
import { CoverArt } from "@/components/cinematic/cover-art";
import { formatCatalogPrice } from "@/lib/format";

/**
 * Single recommendation card for the "You might like" shelves (cart, library).
 *
 * Cover + meta, with the bottom row split: rating/price LEFT, action RIGHT.
 *
 * Two honesty rules live here, both learned from the Founder's screenshots:
 *
 *  1. The cover is the book's real cover (`item.coverSrc`, from the asset
 *     manifest). The gradient stand-in appears only for a book that has no
 *     cover asset at all.
 *  2. A title this store does not sell — `priceCents === 0`, every edition
 *     fulfilled by Amazon — gets no add-to-cart button. It used to get one,
 *     and pressing it put a $0 line in the cart for a book nobody could check
 *     out. Such a card says "On Amazon" and links to the book page, where the
 *     real Amazon editions are listed.
 */
export function RecommendationCard({ book }: { book: CatalogItem }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useStateAdded();
  const direct = book.priceCents > 0;

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!direct) return;
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
      className="group relative flex h-full flex-shrink-0 snap-start flex-col gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/60"
      style={{ width: "180px" }}
    >
      {/* Cover */}
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#0a1410] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.7)]">
        <CoverArt
          src={book.coverSrc}
          title={book.title}
          eyebrow={book.category}
          sizes="180px"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1 px-0.5">
        <h4 className="line-clamp-1 font-serif text-[14px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h4>
        <p className="text-xs text-fg-soft">{book.author}</p>
      </div>

      {/* Bottom row — rating/price LEFT, action RIGHT */}
      <div className="flex items-end justify-between px-0.5">
        <div className="flex flex-col gap-1">
          {/* No invented stars — see <CatalogBookCard>. */}
          {book.rating > 0 ? (
            <div className="flex items-center gap-1 text-xs text-fg-mid">
              <Star
                aria-hidden
                className="h-3 w-3 fill-[#f4c44b] text-[#f4c44b]"
              />
              <span className="tabular-nums">{book.rating.toFixed(1)}</span>
            </div>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold tabular-nums text-fg-hi">
            {formatCatalogPrice(book.priceCents, "USD")}
          </span>
        </div>

        {direct ? (
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
        ) : (
          <span
            aria-hidden
            title="Print editions on Amazon — see the book page"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-fg-fade"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </Link>
  );
}

/** Temporary "added" flag that auto-clears after two seconds. */
function useStateAdded(): [boolean, () => void] {
  const [added, setRawAdded] = useState(false);
  const set = useCallback(() => {
    setRawAdded(true);
    window.setTimeout(() => setRawAdded(false), 2000);
  }, []);
  return [added, set];
}
