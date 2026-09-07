import { describe, expect, it } from "vitest";
import { bundlesContaining } from "@/lib/bundles";

describe("related-shelf ranking for Epictetus", () => {
  it("puts the bundle partner first", () => {
    const slug = "epictetus-discourses-and-enchiridion";
    const partners = new Set(
      bundlesContaining(slug).flatMap((b) => b.bookSlugs).filter((s) => s !== slug),
    );
    expect([...partners]).toEqual(["meditations"]);

    // the shelf the live site shows today, in its current order
    const allBooks = [
      { slug: "codex-mythologica", primaryCategory: "Mythology & Folklore" },
      { slug: "the-great-book-of-world-games", primaryCategory: "Games" },
      { slug: "the-myth-hunters-field-book", primaryCategory: "Mythology & Folklore" },
      { slug: "meditations", primaryCategory: "Classics & Philosophy" },
      { slug: "seneca-selected-dialogues", primaryCategory: "Classics & Philosophy" },
      { slug: "the-puzzles-of-henry-dudeney", primaryCategory: "Games" },
    ];
    const book = { primaryCategory: "Classics & Philosophy" };
    const rank = (b: (typeof allBooks)[number]) =>
      partners.has(b.slug) ? 0
      : b.primaryCategory && b.primaryCategory === book.primaryCategory ? 1 : 2;
    const ranked = allBooks
      .map((b, i) => ({ b, i, r: rank(b) }))
      .sort((x, y) => x.r - y.r || x.i - y.i)
      .map((x) => x.b.slug);

    expect(ranked[0]).toBe("meditations");           // the bundle partner
    expect(ranked[1]).toBe("seneca-selected-dialogues"); // same collection
    expect(ranked.slice(2)).toEqual([
      "codex-mythologica",
      "the-great-book-of-world-games",
      "the-myth-hunters-field-book",
      "the-puzzles-of-henry-dudeney",
    ]);
  });
});
