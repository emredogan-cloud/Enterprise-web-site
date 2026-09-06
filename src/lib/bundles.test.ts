import { describe, expect, it } from "vitest";
import {
  BUNDLES,
  bundleSaving,
  bundlesContaining,
  matchBundle,
} from "./bundles";
import { BOOKS } from "../../scripts/catalog/valice-catalog.mjs";

describe("reader bundles", () => {
  it("every member is a real, published, direct-sale book with a Paddle price", () => {
    for (const b of BUNDLES) {
      for (const slug of b.bookSlugs) {
        const book = BOOKS.find((x) => x.slug === slug);
        expect(book, `${b.slug} names an unknown book ${slug}`).toBeTruthy();
        if (!book) continue;
        expect(book.websiteStatus, `${slug} is not published`).toBe("published");
        expect(book.directSale, `${slug} is not sold direct`).toBe(true);
        expect(book.paddlePriceId, `${slug} has no Paddle price`).toBeTruthy();
      }
    }
  });

  it("the advertised 'separately' price is the sum of the members' real prices", () => {
    for (const b of BUNDLES) {
      const sum = b.bookSlugs.reduce((total, slug) => {
        const book = BOOKS.find((x) => x.slug === slug);
        const ebook = book?.formats.find((f) => f.format === "ebook");
        expect(ebook, `${slug} has no ebook format`).toBeTruthy();
        return total + (ebook?.priceCents ?? 0);
      }, 0);
      expect(sum, `${b.slug} misstates what its books cost separately`).toBe(
        b.separatelyCents,
      );
    }
  });

  it("a bundle actually saves money", () => {
    for (const b of BUNDLES) {
      expect(bundleSaving(b), `${b.slug} saves nothing`).toBeGreaterThan(0);
      expect(b.bundleCents).toBeLessThan(b.separatelyCents);
    }
  });

  it("carries a live Paddle discount id", () => {
    for (const b of BUNDLES) expect(b.discountId).toMatch(/^dsc_[a-z0-9]+$/);
  });

  it("matches only when every member is in the cart", () => {
    const b = BUNDLES[0];
    expect(matchBundle(b.bookSlugs)).toBe(b);
    expect(matchBundle([b.bookSlugs[0]])).toBeNull();
    expect(matchBundle([])).toBeNull();
    // extra titles do not break the match — the discount is price-restricted
    expect(matchBundle([...b.bookSlugs, "codex-bestiarium"])).toBe(b);
  });

  it("bundlesContaining finds a book's bundles and nothing else", () => {
    const b = BUNDLES[0];
    expect(bundlesContaining(b.bookSlugs[0])).toContain(b);
    expect(bundlesContaining("codex-bestiarium")).not.toContain(b);
  });

  it("no bundle is a subset of another (one cart, one discount)", () => {
    for (const a of BUNDLES) {
      for (const b of BUNDLES) {
        if (a === b) continue;
        const aIn = new Set(a.bookSlugs);
        expect(b.bookSlugs.every((s) => aIn.has(s))).toBe(false);
      }
    }
  });
});
