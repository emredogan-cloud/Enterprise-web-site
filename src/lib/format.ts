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
 * `books.price_cents` is 0 for a title this store does not sell — one whose
 * editions are all fulfilled by Amazon, either because no digital edition
 * exists (The Myth Hunter's Field Book is written in by hand) or because the
 * Kindle edition is enrolled in KDP Select and may not be sold anywhere else
 * (Codex Mythologica).
 *
 * Zero is therefore not a price, and `formatPrice` rendering it as "$0.00"
 * advertises a free book that does not exist. Every surface that shows a
 * price beside a book calls this instead, so the rule lives in one place
 * rather than being re-derived — and re-forgotten — per component.
 */
export function formatCatalogPrice(
  priceCents: number,
  currency: string,
): string {
  return priceCents > 0 ? formatPrice(priceCents, currency) : "On Amazon";
}
