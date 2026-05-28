"use server";

import { revalidatePath } from "next/cache";

import { deleteCart, readCart, writeCart } from "@/lib/cart";

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
