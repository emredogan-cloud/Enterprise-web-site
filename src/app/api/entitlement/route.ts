import { getCurrentLocalUserIdReadOnly } from "@/lib/account";
import { getOwnedBookIds } from "@/lib/db/queries/account";

/**
 * Route Handler — does the signed-in visitor already own a given book?
 *
 * The product page (`/books/[slug]`) is SSG, so its `<BookAddToCart>` island
 * fetches this once on mount to decide whether to show a buy button or a
 * "library" link. Putting the per-user ownership read in this dedicated
 * dynamic endpoint keeps the catalog page itself static (same pattern as
 * `/api/cart/count`). Read-only; anonymous or non-owning visitors — and any
 * DB/auth hiccup — resolve to `{ owned: false }`.
 */
export async function GET(request: Request) {
  const noStore = { headers: { "Cache-Control": "no-store" } } as const;
  const bookId = new URL(request.url).searchParams.get("bookId");
  if (!bookId) {
    return Response.json({ owned: false }, noStore);
  }
  const localUserId = await getCurrentLocalUserIdReadOnly();
  const owned =
    localUserId !== null &&
    (await getOwnedBookIds(localUserId, [bookId])).has(bookId);
  return Response.json({ owned }, noStore);
}
