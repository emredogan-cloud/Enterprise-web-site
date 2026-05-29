"use server";

import { revalidatePath } from "next/cache";

import { deleteCart, readCart, writeCart } from "@/lib/cart";
import { getCheckoutItems } from "@/lib/db/queries/catalog";
import { getPaddleClient, isPaddleConfigured } from "@/lib/paddle";

// ---------------------------------------------------------------------------
// Cart-mutation actions (cookie-backed; from SUB-PR 1.4)
// ---------------------------------------------------------------------------

/**
 * Add a book to the cart. Idempotent — if the book is already in the
 * cart we no-op (digital books have an implicit quantity of 1).
 */
export async function addToCart(bookId: string): Promise<void> {
  if (!bookId) return;
  const cart = await readCart();
  if (cart.items.some((i) => i.bookId === bookId)) return;
  cart.items.push({ bookId, addedAt: Date.now() });
  await writeCart(cart);
  revalidatePath("/cart");
}

/** Remove a single book from the cart. */
export async function removeFromCart(bookId: string): Promise<void> {
  if (!bookId) return;
  const cart = await readCart();
  cart.items = cart.items.filter((i) => i.bookId !== bookId);
  await writeCart(cart);
  revalidatePath("/cart");
}

/** Clear the cart entirely. */
export async function clearCart(): Promise<void> {
  await deleteCart();
  revalidatePath("/cart");
}

// ---------------------------------------------------------------------------
// Checkout (SUB-PR 1.5)
// ---------------------------------------------------------------------------

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * `createCheckoutSession` — assembles a Paddle Transaction from the
 * current cart and returns a hosted-checkout URL.
 *
 * Defensive failure modes (each returns a calm error to the client; none
 * propagate as a 500):
 *   - Paddle env unset (`PADDLE_API_KEY` missing).
 *   - Cart empty.
 *   - None of the cart books are published anymore.
 *   - Any book lacks a Paddle `priceId` (i.e. wasn't fully provisioned in
 *     the admin) — surface the affected titles by name.
 *   - Paddle's API rejects the request — surface the SDK error message.
 *
 * `customData.bookIds` is what links Paddle's transaction back to our
 * catalog rows in the webhook handler (see `processCompletedTransaction`).
 */
export async function createCheckoutSession(): Promise<CheckoutResult> {
  if (!isPaddleConfigured()) {
    return {
      ok: false,
      error: "Checkout is not configured yet (missing PADDLE_API_KEY).",
    };
  }

  const cart = await readCart();
  if (cart.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const books = await getCheckoutItems(cart.items.map((i) => i.bookId));
  if (books.length === 0) {
    return {
      ok: false,
      error: "None of the items in your cart are available right now.",
    };
  }

  const unmapped = books.filter((b) => !b.paddlePriceId);
  if (unmapped.length > 0) {
    const titles = unmapped.map((b) => b.title).join(", ");
    return {
      ok: false,
      error: `Not ready for checkout — these titles have no Paddle price yet: ${titles}.`,
    };
  }

  try {
    const paddle = getPaddleClient();
    const transaction = await paddle.transactions.create({
      items: books.map((book) => ({
        priceId: book.paddlePriceId as string,
        quantity: 1,
      })),
      customData: {
        bookIds: books.map((b) => b.id),
      },
      collectionMode: "automatic",
    });

    const url = transaction.checkout?.url;
    if (!url) {
      return { ok: false, error: "Paddle did not return a checkout URL." };
    }
    return { ok: true, url };
  } catch (err) {
    console.error("[checkout] Paddle transaction failed:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Checkout failed — please try again.",
    };
  }
}
