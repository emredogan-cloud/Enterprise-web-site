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
