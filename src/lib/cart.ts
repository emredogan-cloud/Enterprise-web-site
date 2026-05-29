/**
 * Cookie-backed cart — stateless, server-rendered (Roadmap §4 + §9).
 *
 * Design notes:
 *   - State lives in a single httpOnly cookie. No database row, no auth
 *     requirement — works pre- and post-sign-in identically. When auth
 *     lands, the cart cookie can be merged into a DB-backed `carts` table
 *     by a JIT upsert (same pattern as `upsertLocalUser`).
 *   - Items are *sets* keyed by `bookId`. Digital books have an implicit
 *     quantity of 1 (you can't buy two copies of the same title), so the
 *     data shape is `Array<{ bookId, addedAt }>`, not a quantity map.
 *   - All cookie reads/writes go through this module so the cookie name,
 *     serialization, and validation live in exactly one place.
 *   - Reads work in any Server Component or Server Action. Writes only
 *     work in Server Actions / Route Handlers (Next.js restriction).
 */

import { cookies } from "next/headers";

export const CART_COOKIE = "dbs_cart";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface CartItem {
  bookId: string;
  /** Epoch ms when the item was added — used to preserve display order. */
  addedAt: number;
}

export interface Cart {
  items: CartItem[];
}

const EMPTY_CART: Cart = { items: [] };

/**
 * Defensive parser — never throws. Returns an empty cart if the cookie
 * is missing, malformed, or stuffed with garbage by a third party.
 *
 * Exported (SUB-PR 4.5) so it can be unit-tested in isolation from
 * `next/headers` — pure string-in / Cart-out function, no I/O.
 */
export function safeParseCart(raw: string | undefined): Cart {
  if (!raw) return EMPTY_CART;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_CART;
    const items = (parsed as { items?: unknown }).items;
    if (!Array.isArray(items)) return EMPTY_CART;
    const cleaned: CartItem[] = [];
    for (const item of items) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as CartItem).bookId === "string" &&
        typeof (item as CartItem).addedAt === "number" &&
        Number.isFinite((item as CartItem).addedAt)
      ) {
        cleaned.push({
          bookId: (item as CartItem).bookId,
          addedAt: (item as CartItem).addedAt,
        });
      }
    }
    return { items: cleaned };
  } catch {
    return EMPTY_CART;
  }
}

/** Read the cart from the request cookie. Safe in any server context. */
export async function readCart(): Promise<Cart> {
  const store = await cookies();
  return safeParseCart(store.get(CART_COOKIE)?.value);
}

/** Write the cart to the response cookie. Only callable from Server Actions / Route Handlers. */
export async function writeCart(cart: Cart): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
}

/** Delete the cart cookie. Only callable from Server Actions / Route Handlers. */
export async function deleteCart(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}
