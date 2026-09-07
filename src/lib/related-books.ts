import type { BookCardData } from "@/components/book-card";

/**
 * Pick the books to show on a book's page, most relevant first.
 *
 * This shelf was once "anything else published, first six". That put the Field
 * Book next to Epictetus and left *Meditations* — the book Marcus wrote after
 * reading him, and the other half of the same bundle — off the page entirely.
 * It also gave a reader standing on Volume I of Keightley's *Fairy Mythology*
 * no route to Volume II, which the catalogue rows themselves called out: *"the
 * related-products link between the two rows is not optional"*.
 *
 * Two branches of this phase fixed that independently and each caught half of
 * it — one ranked by bundle and collection, the other by shared author — so the
 * signals are combined here rather than one being chosen over the other.
 * Strongest relationship first:
 *
 *   1. a book this one is BUNDLED with — they are sold together and priced
 *      together, the strongest connection the shop can make;
 *   2. a book by the same distinctive author — which is what makes a
 *      multi-volume work hold together;
 *   3. a book in the same collection;
 *   4. everything else, in the order the catalogue returned.
 *
 * A SHARED AUTHOR ONLY MEANS SOMETHING IF IT IS NOT SHARED BY EVERYONE. The
 * house editor is credited on every row in this catalogue, so the obvious
 * implementation — count shared authors — returns 1 for every pair and orders
 * nothing at all. An author on more than four fifths of the catalogue is the
 * house credit and is discounted. That threshold was "more than half" first,
 * and half is wrong for exactly the case this exists to serve: on a small or
 * filtered list a two-volume author can hold half the rows and would be thrown
 * away as ubiquitous.
 *
 * Pure ranking over the list already fetched: no extra query. Ties keep the
 * incoming order, which is recency, so this only ever promotes — a book with no
 * relationships fills its shelf exactly as it did before.
 */
export function relatedBooks(
  current: {
    slug: string;
    authors: ReadonlyArray<{ slug: string }>;
    primaryCategory?: string | null;
  },
  all: ReadonlyArray<BookCardData>,
  options: { bundledWith?: ReadonlyArray<string>; limit?: number } = {},
): BookCardData[] {
  const { bundledWith = [], limit = 6 } = options;
  const bundlePartners = new Set(bundledWith.filter((s) => s !== current.slug));

  const frequency = new Map<string, number>();
  for (const b of all) {
    for (const a of b.authors) frequency.set(a.slug, (frequency.get(a.slug) ?? 0) + 1);
  }
  const distinctive = (authorSlug: string) =>
    (frequency.get(authorSlug) ?? 0) <= all.length * 0.8;
  const mine = new Set(current.authors.map((a) => a.slug).filter(distinctive));

  const rank = (b: BookCardData) => {
    if (bundlePartners.has(b.slug)) return 0;
    if (b.authors.some((a) => mine.has(a.slug))) return 1;
    if (b.primaryCategory && b.primaryCategory === current.primaryCategory) return 2;
    return 3;
  };

  return all
    .filter((b) => b.slug !== current.slug)
    .map((b, i) => ({ b, i, r: rank(b) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .slice(0, limit)
    .map((x) => x.b);
}
