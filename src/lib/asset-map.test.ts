import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BOOKS, CATEGORIES, AUTHORS } from "../../scripts/catalog/valice-catalog.mjs";
import manifest from "./asset-manifest.json";
import {
  assetExists,
  authorPortraitSrc,
  blogImageSrc,
  bookCoverSrc,
  bookSlugsWithCovers,
} from "./asset-map";

/**
 * The asset map is the single answer to "does this book have a cover?" for
 * every route. These tests defend the two properties the Founder's
 * screenshots showed being violated: the same book resolving differently on
 * different pages, and a real asset going unused because a surface never
 * asked for it.
 */

const PUBLIC = join(process.cwd(), "public");

describe("asset manifest", () => {
  it("lists only files that exist on disk", () => {
    for (const a of manifest.assets) {
      expect(existsSync(join(PUBLIC, a.path)), a.path).toBe(true);
    }
  });

  it("carries measured dimensions for every asset", () => {
    for (const a of manifest.assets) {
      expect(a.width, a.path).toBeGreaterThan(0);
      expect(a.height, a.path).toBeGreaterThan(0);
    }
  });

  it("holds no fabricated likeness or orphaned genre art", () => {
    // Removed in Phase 4: an AI-generated "portrait" of the Founder presented
    // with his name as alt text, an AI-rendered bust of Marcus Aurelius, a
    // fictional "Luminous Library" cover, and seventeen genre paintings for
    // categories this press does not have.
    expect(assetExists("/images/about/founder_portrait.webp")).toBe(false);
    expect(assetExists("/images/homepage/homepage_hero_main_cover.webp")).toBe(false);
    expect(manifest.assets.some((a) => a.path.startsWith("/images/genres/"))).toBe(false);
  });
});

describe("book covers", () => {
  it("resolves a 2:3 cover for every published book in the catalogue", () => {
    for (const b of BOOKS.filter((x) => x.websiteStatus === "published")) {
      expect(bookCoverSrc(b.slug), b.slug).toBe(`/images/books/${b.slug}.webp`);
    }
  });

  it("never invents a cover for a slug without one", () => {
    expect(bookCoverSrc("no-such-book")).toBeNull();
  });

  it("has no cover file the catalogue does not know about", () => {
    const known = new Set(BOOKS.map((b) => b.slug));
    for (const slug of bookSlugsWithCovers()) expect(known.has(slug), slug).toBe(true);
  });
});

describe("authors and categories", () => {
  it("resolves a portrait only from a real file", () => {
    for (const a of AUTHORS) {
      const src = authorPortraitSrc(a.slug);
      if (src) expect(existsSync(join(PUBLIC, src))).toBe(true);
    }
    // The Founder has supplied no photograph; the identity mark renders.
    expect(authorPortraitSrc("emre-dogan")).toBeNull();
    // Historical authors carry public-domain likenesses (sources in ASSET_MAP.md).
    expect(authorPortraitSrc("henry-dudeney")).not.toBeNull();
    expect(authorPortraitSrc("marcus-aurelius")).not.toBeNull();
  });

  it("knows every real category slug", () => {
    for (const c of CATEGORIES) expect(typeof c.slug).toBe("string");
  });

  it("resolves a blog image only from a real file", () => {
    expect(blogImageSrc("haberdashers-puzzle")).toBe("/images/blog/haberdashers-puzzle.webp");
    expect(blogImageSrc("no-such-post")).toBeNull();
  });
});
