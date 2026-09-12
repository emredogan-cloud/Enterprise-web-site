/**
 * Locale-aware price formatting.
 *
 * Prices are stored as integer cents (`books.price_cents`), so we divide
 * by 100 before formatting with the given ISO-4217 currency code.
 * Locale is fixed to `en-US` while the storefront is English-first (F4);
 * a future i18n SUB-PR will switch this to a request-derived locale.
 */
export function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

/**
 * Price label for a catalog card, tile or list row.
 *
 * `books.price_cents` is 0 for a title this store does not sell.
 *
 * Zero is therefore not a price, and `formatPrice` rendering it as "$0.00"
 * advertises a free book that does not exist. Every surface that shows a
 * price beside a book calls this instead, so the rule lives in one place
 * rather than being re-derived — and re-forgotten — per component.
 *
 * WHY IT NO LONGER SAYS "On Amazon".
 * It used to, because every zero-priced title really was an Amazon-fulfilled
 * one: The Myth Hunter's Field Book has no digital edition, and Codex
 * Mythologica's Kindle edition is locked by KDP Select. Both are still true.
 * But on 2026-09-12 eighteen Valice Classics came off the paid checkout for
 * Paddle compliance, and most of them have no Amazon edition at all — so
 * "On Amazon" became a direction to a shop that does not stock them.
 * "Not sold here" is true of every zero-priced title, including the two it
 * was originally written for, and the book's own page lists whatever real
 * editions it does have.
 */
export function formatCatalogPrice(
  priceCents: number,
  currency: string,
): string {
  return priceCents > 0 ? formatPrice(priceCents, currency) : "Not sold here";
}
