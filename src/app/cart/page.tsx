import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { ClearCartButton, RemoveFromCartButton } from "@/components/cart-buttons";
import { CoverImage } from "@/components/cover-image";
import { EmptyState } from "@/components/empty-state";
import { readCart } from "@/lib/cart";
import { getCartBooks } from "@/lib/db/queries/catalog";
import { formatPrice } from "@/lib/format";

// `/cart` reads the per-request cart cookie, so it is intentionally dynamic.
// This is the *only* cart-aware page; the catalog stays statically rendered
// because the header's count badge is fetched client-side from /api/cart/count.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await readCart();
  const books =
    cart.items.length > 0
      ? await getCartBooks(cart.items.map((i) => i.bookId))
      : [];

  // Preserve add-order from the cookie; books returned by the DB may come
  // back in arbitrary order, and may be missing entirely if a title was
  // unpublished or deleted since it landed in the cart.
  const booksById = new Map(books.map((b) => [b.id, b]));
  const orderedBooks = cart.items
    .map((item) => booksById.get(item.bookId))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const totalCents = orderedBooks.reduce((s, b) => s + b.priceCents, 0);
  const currency = orderedBooks[0]?.currency ?? "USD";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Your cart
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-foreground">
          {orderedBooks.length === 0
            ? "Your cart is empty"
            : `${orderedBooks.length} ${orderedBooks.length === 1 ? "book" : "books"}`}
        </h1>
      </header>

      {orderedBooks.length === 0 ? (
        <EmptyState
          heading="Nothing in here yet."
          body="Browse the catalog to add books. They live in a session cookie until you check out."
        />
      ) : (
        <div className="mt-12 space-y-4">
          {orderedBooks.map((book) => (
            <article
              key={book.id}
              className="flex gap-6 rounded-lg border border-border p-4"
            >
              <div className="w-20 shrink-0">
                <CoverImage title={book.title} coverKey={book.coverKey} />
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-serif text-lg font-medium leading-tight text-foreground">
                  {book.title}
                </h2>
                {book.authors.length > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.authors.map((a) => a.name).join(", ")}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <p className="font-medium text-foreground">
                    {formatPrice(book.priceCents, book.currency)}
                  </p>
                  <RemoveFromCartButton bookId={book.id} />
                </div>
              </div>
            </article>
          ))}

          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-serif text-2xl font-medium text-foreground">
              {formatPrice(totalCents, currency)}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <ClearCartButton />
            <Button size="lg" disabled>
              Checkout (lands in SUB-PR 1.5)
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
