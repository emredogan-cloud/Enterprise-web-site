/**
 * Reader bundles — a set of books that costs less bought together.
 *
 * WHY A DISCOUNT AND NOT A BUNDLE PRODUCT
 * The commerce path already supports a multi-book purchase: the cart creates a
 * Paddle transaction with one line per book and passes every book id in
 * `customData.bookIds`, and `processCompletedTransaction` grants one
 * entitlement per id. Buying two books together therefore already delivers two
 * books. The only thing the roadmap's "Stoic Library" adds is a lower price.
 *
 * So a bundle here is a Paddle **discount restricted to a fixed set of prices**,
 * attached at checkout when the cart contains the whole set. Nothing else
 * changes: no new product, no new catalogue entity, no second checkout path,
 * and no new entitlement semantics to get wrong. A buyer who owns one of the
 * two is blocked from re-buying it by the existing ownership guard and simply
 * pays full price for the other, which is the correct behaviour.
 *
 * The discount is restricted to its member prices on Paddle's side as well, so
 * it cannot be applied to anything else even if this file were wrong.
 */

export interface Bundle {
  /** Stable id, also the Paddle discount's `custom_data.valice_bundle`. */
  slug: string;
  name: string;
  /** Catalogue slugs that must ALL be in the cart for the bundle to apply. */
  bookSlugs: string[];
  /** Paddle discount id (live). */
  discountId: string;
  /** What the set costs together, in cents, after the discount. */
  bundleCents: number;
  /** What the same books cost bought separately, in cents. */
  separatelyCents: number;
  blurb: string;
}

export const BUNDLES: Bundle[] = [
  {
    slug: "stoic-library",
    name: "The Stoic Library",
    bookSlugs: ["meditations", "epictetus-discourses-and-enchiridion"],
    discountId: "dsc_01m1v1b5a1e0b3711gmj78brt3",
    bundleCents: 1499,
    separatelyCents: 1998,
    blurb:
      "Marcus Aurelius read Epictetus — he says so in the first book of the " +
      "Meditations, thanking Junius Rusticus for lending him a copy. Both " +
      "editions together, and the concordance in the Epictetus lists the four " +
      "passages he demonstrably read.",
  },
];

/** Cents saved by buying the set together. */
export function bundleSaving(b: Bundle): number {
  return b.separatelyCents - b.bundleCents;
}

/**
 * The bundle a cart qualifies for, if any.
 *
 * A cart qualifies when it contains EVERY member. Extra books are fine — the
 * discount is restricted to the member prices on Paddle's side, so a third
 * title in the same transaction is charged in full.
 */
export function matchBundle(slugsInCart: readonly string[]): Bundle | null {
  const have = new Set(slugsInCart);
  return (
    BUNDLES.find((b) => b.bookSlugs.every((s) => have.has(s))) ?? null
  );
}

/** The bundles a given book belongs to — for cross-sell on a product page. */
export function bundlesContaining(slug: string): Bundle[] {
  return BUNDLES.filter((b) => b.bookSlugs.includes(slug));
}
