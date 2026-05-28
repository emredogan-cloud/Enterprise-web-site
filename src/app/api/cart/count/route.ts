import { readCart } from "@/lib/cart";

/**
 * Route Handler — returns the current cart item count.
 *
 * The header's `<CartIndicator>` (a Client Component) fetches this once on
 * mount and refetches on the `cart-changed` custom event. Putting cookie
 * reads in this dedicated dynamic endpoint keeps the layout (and every
 * catalog route inheriting it) safely STATIC / SSG — the cookie read
 * never bleeds upward into `app/layout.tsx`.
 */
export async function GET() {
  const cart = await readCart();
  return Response.json(
    { count: cart.items.length },
    { headers: { "Cache-Control": "no-store" } },
  );
}
