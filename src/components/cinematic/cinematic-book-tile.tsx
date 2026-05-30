import Link from "next/link";

import { BookCover } from "@/components/book-detail/book-cover";
import { formatPrice } from "@/lib/format";
import type { BookCardData } from "@/components/book-card";

/**
 * <CinematicBookTile> — a compact cinematic book card for grids that
 * consume real DB `BookCardData` (not the catalog page's demo shape).
 *
 * Phase 1.D ships it for `/authors/[slug]`; Phase 1.F reuses it for
 * `/categories/[slug]`. The catalog page uses its own `<CatalogBookCard>`
 * (DemoBook shape with synthetic ratings/badges) — we don't want to merge
 * those two contracts in this phase.
 *
 * Composition: glass card + `<BookCover>` (cinematic emerald rim) + title
 * (serif, hover emerald) + subtitle (italic mid) + authors (muted) +
 * price chip aligned to the bottom right.
 *
 * Pure Server Component. Wrapped in a single `<Link>` to /books/{slug}.
 */
export function CinematicBookTile({ book }: { book: BookCardData }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="home-card-hover home-glass group relative flex flex-col overflow-hidden rounded-[22px] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-bright/40"
    >
      {/* Top emerald edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/30 to-transparent"
      />

      <BookCover title={book.title} coverKey={book.coverKey} />

      <div className="mt-4 flex flex-1 flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-fg-hi transition-colors group-hover:text-emerald-bright">
          {book.title}
        </h3>

        {book.subtitle && (
          <p className="line-clamp-1 text-xs italic text-fg-mid">
            {book.subtitle}
          </p>
        )}

        {book.authors.length > 0 && (
          <p className="line-clamp-1 text-[11px] uppercase tracking-[0.12em] text-fg-soft">
            {book.authors.map((a) => a.name).join(", ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-end pt-3">
          <span className="font-semibold tabular-nums text-fg-hi">
            {formatPrice(book.priceCents, book.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
