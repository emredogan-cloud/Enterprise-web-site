import { describe, expect, it } from "vitest";
import { BUNDLES, SUSPENDED_BUNDLES, bundlesContaining } from "@/lib/bundles";

/**
 * The related shelf ranks a bundle partner first, then same-collection titles,
 * then everything else in catalogue order.
 *
 * This used to read the partner set out of the live BUNDLES, which made it a
 * test of two things at once — the ranking rule AND whether a particular
 * bundle happened to be on sale. When the Stoic Library was suspended for
 * Paddle compliance on 2026-09-12 the partner set went empty and the test
 * failed without the ranking rule having changed at all. The rule is now
 * tested against an explicit partner set, and the live wiring is asserted
 * separately, so a future suspension moves exactly one expectation.
 */
describe("related-shelf ranking", () => {
  const allBooks = [
    { slug: "codex-mythologica", primaryCategory: "Mythology & Folklore" },
    { slug: "the-great-book-of-world-games", primaryCategory: "Games" },
    { slug: "the-myth-hunters-field-book", primaryCategory: "Mythology & Folklore" },
    { slug: "meditations", primaryCategory: "Classics & Philosophy" },
    { slug: "seneca-selected-dialogues", primaryCategory: "Classics & Philosophy" },
    { slug: "the-puzzles-of-henry-dudeney", primaryCategory: "Games" },
  ];

  const rankWith = (partners: Set<string>, category: string) => {
    const rank = (b: (typeof allBooks)[number]) =>
      partners.has(b.slug) ? 0
      : b.primaryCategory && b.primaryCategory === category ? 1 : 2;
    return allBooks
      .map((b, i) => ({ b, i, r: rank(b) }))
      .sort((x, y) => x.r - y.r || x.i - y.i)
      .map((x) => x.b.slug);
  };

  it("puts a bundle partner ahead of a same-collection title", () => {
    const ranked = rankWith(new Set(["meditations"]), "Classics & Philosophy");
    expect(ranked[0]).toBe("meditations");
    expect(ranked[1]).toBe("seneca-selected-dialogues");
    expect(ranked.slice(2)).toEqual([
      "codex-mythologica",
      "the-great-book-of-world-games",
      "the-myth-hunters-field-book",
      "the-puzzles-of-henry-dudeney",
    ]);
  });

  it("falls back to collection order when there is no bundle partner", () => {
    const ranked = rankWith(new Set(), "Classics & Philosophy");
    expect(ranked.slice(0, 2)).toEqual(["meditations", "seneca-selected-dialogues"]);
  });

  it("reflects the live bundle wiring, whatever it currently is", () => {
    const slug = "epictetus-discourses-and-enchiridion";
    const partners = bundlesContaining(slug)
      .flatMap((b) => b.bookSlugs)
      .filter((s) => s !== slug);
    // The Stoic Library is suspended for Paddle compliance, so Epictetus has
    // no live partner today. The definition still names Meditations, and that
    // is what comes back if it is restored.
    expect(partners).toEqual([]);
    expect(BUNDLES).toHaveLength(0);
    expect(SUSPENDED_BUNDLES.find((b) => b.slug === "stoic-library")?.bookSlugs).toEqual([
      "meditations",
      "epictetus-discourses-and-enchiridion",
    ]);
  });
});
