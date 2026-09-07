import type { BookCardData } from "@/components/book-card";

/**
 * Pick the books to show on a book's page, most relevant first.
 *
 * This shelf used to be "the six most recently published books". That is a
 * reasonable default and a bad answer for a work published in more than one
 * volume: Keightley's *Fairy Mythology* is two catalogue rows, and a reader on
 * Volume I had no route to Volume II from the page they were standing on. The
 * rows themselves say so — *"the related-products link between the two rows is
 * not optional"*.
 *
 * A SHARED AUTHOR ONLY MEANS SOMETHING IF IT IS NOT SHARED BY EVERYONE. The
 * house editor is credited on every book in this catalogue, so a plain count of
 * shared authors is 1 for every pair and orders nothing at all.
 *
 * The threshold is deliberately high — an author on more than four fifths of the
 * catalogue is the house credit, and nothing else plausibly is. "More than half"
 * was tried first and is wrong for exactly the case this function exists to
 * serve: on a small or filtered list, a two-volume author can hold half the rows
 * and would be discarded as ubiquitous, which is the opposite of the intent.
 *
 * Ties keep the incoming order, which is recency, so this only ever promotes:
 * a page with no author in common with anything shows exactly what it showed
 * before.
 */
export function relatedBooks(
  current: { slug: string; authors: ReadonlyArray<{ slug: string }> },
  all: ReadonlyArray<BookCardData>,
  limit = 6,
): BookCardData[] {
  const frequency = new Map<string, number>();
  for (const b of all) {
    for (const a of b.authors) frequency.set(a.slug, (frequency.get(a.slug) ?? 0) + 1);
  }
  const distinctive = (authorSlug: string) =>
    (frequency.get(authorSlug) ?? 0) <= all.length * 0.8;

  const mine = new Set(current.authors.map((a) => a.slug).filter(distinctive));

  return all
    .filter((b) => b.slug !== current.slug)
    .map((b, i) => ({ b, i, shared: b.authors.filter((a) => mine.has(a.slug)).length }))
    .sort((x, y) => y.shared - x.shared || x.i - y.i)
    .slice(0, limit)
    .map((x) => x.b);
}
