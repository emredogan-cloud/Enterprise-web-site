import Link from "next/link";

import { CoverImage } from "@/components/cover-image";
import { formatPrice } from "@/lib/format";

/**
 * The shape every catalog list item flows in. Defined alongside the UI
 * component that consumes it; query functions in `src/lib/db/queries/*`
 * import this type and return matching objects.
 */
export interface BookCardData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverKey: string | null;
  /**
   * The book's real cover as a public path (`/images/books/<slug>.webp`),
   * resolved by the query layer from the asset manifest (`@/lib/asset-map`).
   * Null when no cover asset exists. Every surface draws THIS, so the same
   * book cannot show a cover on one route and a gradient on another.
   */
  coverSrc?: string | null;
  priceCents: number;
  currency: string;
  authors: ReadonlyArray<{ slug: string; name: string }>;
  /**
   * Primary collection/category name from the `book_categories` relation
   * (first by name when a book is in several). Optional — surfaces that don't
   * need it (search, cart, related) leave it undefined. Used by the catalog
   * grid card so it shows the real collection instead of a hardcoded tag.
   */
  primaryCategory?: string | null;
}

export function BookCard({ book }: { book: BookCardData }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-md"
    >
      <CoverImage title={book.title} coverKey={book.coverKey} coverSrc={book.coverSrc} />
      <div className="mt-4">
        <h3 className="font-serif text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{book.subtitle}</p>
        )}
        {book.authors.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {book.authors.map((a) => a.name).join(", ")}
          </p>
        )}
        <p className="mt-2 text-sm font-medium text-foreground">
          {formatPrice(book.priceCents, book.currency)}
        </p>
      </div>
    </Link>
  );
}
