import type { Metadata } from "next";

import { CartHero } from "@/components/cart/cart-hero";
import { CartLine } from "@/components/cart/cart-line";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCartCard } from "@/components/cart/empty-cart-card";
import { RecommendationShelf } from "@/components/cart/recommendation-shelf";
import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";
import { readCart } from "@/lib/cart";
import { getCartBooks } from "@/lib/db/queries/catalog";

// `/cart` reads the per-request cart cookie, so it is intentionally dynamic.
// The classification stays `ƒ Dynamic`; only the visual language changed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

/**
 * Cinematic cart page — dark luxury aesthetic shared with homepage / catalog / blog.
 *
 * Two states, both inside `.cinematic-root`:
 *   - **Empty** (cookie has no items): hero ("Your cart is empty") + glass
 *     empty-card with circular cart-icon ring + CTA to /books + the
 *     "You might like" recommendation shelf below.
 *   - **With items**: hero ("N books ready") + a two-column body
 *     (`<CartLine>` items LEFT, `<CartSummary>` panel RIGHT) + the same
 *     recommendation shelf at the bottom so users can keep browsing.
 *
 * Both states render the shared `<CinematicHeader>` and `<HomeFooter>`,
 * so the visual continuity from the homepage / catalog / blog is total.
 */
export default async function CartPage() {
  const cart = await readCart();
  const books =
    cart.items.length > 0
      ? await getCartBooks(cart.items.map((i) => i.bookId))
      : [];

  // Preserve cookie order; drop unpublished/missing books defensively.
  const booksById = new Map(books.map((b) => [b.id, b]));
  const orderedBooks = cart.items
    .map((item) => booksById.get(item.bookId))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const totalCents = orderedBooks.reduce((s, b) => s + b.priceCents, 0);
  const currency = orderedBooks[0]?.currency ?? "USD";
  const isEmpty = orderedBooks.length === 0;

  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10">
        <CartHero
          variant={isEmpty ? "empty" : "with-items"}
          itemCount={orderedBooks.length}
        />

        {isEmpty ? (
          <EmptyCartCard />
        ) : (
          <section className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
              {/* Items list */}
              <div className="space-y-3">
                {orderedBooks.map((book) => (
                  <CartLine key={book.id} book={book} />
                ))}
              </div>

              {/* Summary + checkout */}
              <CartSummary
                totalCents={totalCents}
                currency={currency}
                itemCount={orderedBooks.length}
              />
            </div>
          </section>
        )}

        {/* Recommendation shelf — visible in BOTH states.
            Empty state: anchors the page so it doesn't feel dead.
            With-items state: encourages browsing without leaving the cart. */}
        <RecommendationShelf />

        {/* Bottom breathing space before footer */}
        <div className="h-24" />
      </main>

      <HomeFooter />
    </div>
  );
}
