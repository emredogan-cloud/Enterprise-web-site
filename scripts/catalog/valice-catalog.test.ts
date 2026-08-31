/**
 * Catalog integrity, as tests.
 *
 * `load-catalog.mjs` refuses to write a catalog that violates these rules,
 * but that check only runs when someone loads the catalog. These are the
 * same invariants enforced in CI, on every commit, because each one of them
 * describes a defect that actually reached production in this project:
 *
 *   - a Paddle price id that was never a real price (`pri_test_meditations_999`),
 *     which failed at the till rather than at load;
 *   - product pages for books Valice Press has no right to sell;
 *   - "Buy on Amazon" as a concept, waiting on ASINs that did not exist.
 *
 * The rule that matters most now is the exclusivity one. KDP Select is a
 * contract, and a data edit that flips a Select title to direct sale would
 * breach it silently — nothing else in the system would object.
 */
import { describe, expect, it } from "vitest";

// Plain-JS catalog data, deliberately not TypeScript so the operational
// scripts can import it under bare `node` without a build step. The shapes
// are asserted below rather than declared.
import { AUTHORS, BOOKS, CATEGORIES } from "./valice-catalog.mjs";

interface Format {
  format: string;
  availability: "available" | "coming_soon" | "unavailable";
  fulfillment: "direct" | "amazon";
  priceCents: number | null;
  pageCount: number | null;
  amazonAsin: string | null;
  amazonUrl: string | null;
  kdp: "live" | "in_review" | "not_created" | "not_applicable";
  masterFileKey: string | null;
}

interface Book {
  slug: string;
  title: string;
  websiteStatus: "published" | "draft";
  kdpSelect: boolean;
  directSale: boolean;
  directSaleBlockedBy: string | null;
  paddlePriceId: string | null;
  categories: string[];
  authors: string[];
  formats: Format[];
  blockers: string[];
}

const books = BOOKS as Book[];
const directEbook = (b: Book) =>
  b.formats.find(
    (f) =>
      f.format === "ebook" &&
      f.fulfillment === "direct" &&
      f.availability === "available",
  );

describe("catalog structure", () => {
  it("has unique book slugs", () => {
    const slugs = books.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has at most one row per format per book", () => {
    for (const b of books) {
      const names = b.formats.map((f) => f.format);
      expect(new Set(names).size, `${b.slug} has duplicate format rows`).toBe(
        names.length,
      );
    }
  });

  it("references only categories and authors that exist", () => {
    const cats = new Set((CATEGORIES as { slug: string }[]).map((c) => c.slug));
    const authors = new Set((AUTHORS as { slug: string }[]).map((a) => a.slug));
    for (const b of books) {
      for (const c of b.categories) expect(cats, `${b.slug} → ${c}`).toContain(c);
      for (const a of b.authors) expect(authors, `${b.slug} → ${a}`).toContain(a);
    }
  });

  it("gives every book at least one category and author", () => {
    for (const b of books) {
      expect(b.categories.length, `${b.slug} has no category`).toBeGreaterThan(0);
      expect(b.authors.length, `${b.slug} has no author`).toBeGreaterThan(0);
    }
  });
});

describe("KDP Select exclusivity", () => {
  it("never sells a Select-enrolled book's ebook directly", () => {
    for (const b of books) {
      if (!b.kdpSelect) continue;
      expect(
        directEbook(b),
        `${b.slug} is enrolled in KDP Select — selling its ebook here breaches exclusivity`,
      ).toBeUndefined();
      expect(b.directSale, `${b.slug} is in Select but flagged directSale`).toBe(false);
    }
  });

  it("records a reason whenever direct sale is switched off", () => {
    for (const b of books) {
      if (b.directSale) continue;
      expect(
        b.directSaleBlockedBy,
        `${b.slug} is not sold directly but records no reason why`,
      ).toBeTruthy();
    }
  });
});

describe("Paddle wiring", () => {
  // The shape Paddle actually issues. `pri_test_meditations_999` passes a
  // naive startsWith("pri_") check, which is precisely how it survived.
  const PRICE_ID = /^pri_[a-z0-9]{20,}$/;

  it("gives every directly-sold book a real-looking Paddle price id", () => {
    for (const b of books) {
      if (!directEbook(b)) continue;
      expect(b.paddlePriceId, `${b.slug} is on sale with no Paddle price`).toBeTruthy();
      expect(
        b.paddlePriceId,
        `${b.slug}: "${b.paddlePriceId}" is not shaped like a Paddle price id`,
      ).toMatch(PRICE_ID);
    }
  });

  it("does not carry a Paddle price for a book that is not sold here", () => {
    for (const b of books) {
      if (directEbook(b)) continue;
      expect(
        b.paddlePriceId,
        `${b.slug} is not sold here but carries a Paddle price id`,
      ).toBeNull();
    }
  });
});

describe("fulfillment", () => {
  it("has a master file in R2 for every ebook sold directly", () => {
    for (const b of books) {
      const e = directEbook(b);
      if (!e) continue;
      expect(
        e.masterFileKey,
        `${b.slug} is on sale but has no master file to watermark`,
      ).toMatch(/^books\/.+\/master\/v\d+\/master\.pdf$/);
    }
  });

  it("prices every format that can be bought", () => {
    for (const b of books) {
      for (const f of b.formats) {
        if (f.availability !== "available") continue;
        expect(
          f.priceCents,
          `${b.slug}/${f.format} is buyable with no price`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("Amazon destinations", () => {
  const ASIN = /^B0[A-Z0-9]{8}$/;

  it("only links to Amazon with a verified ASIN behind it", () => {
    for (const b of books) {
      for (const f of b.formats) {
        if (!f.amazonUrl) continue;
        expect(f.amazonAsin, `${b.slug}/${f.format}: URL without an ASIN`).toBeTruthy();
        expect(f.amazonAsin, `${b.slug}/${f.format}: malformed ASIN`).toMatch(ASIN);
        expect(f.amazonUrl).toBe(`https://www.amazon.com/dp/${f.amazonAsin}`);
      }
    }
  });

  it("only carries an ASIN for an edition that is actually live", () => {
    // Amazon issues an ASIN at publication. An ASIN on a title that is still
    // in review or was never created is, by definition, made up.
    for (const b of books) {
      for (const f of b.formats) {
        if (!f.amazonAsin) continue;
        expect(f.kdp, `${b.slug}/${f.format} has an ASIN but kdp="${f.kdp}"`).toBe(
          "live",
        );
      }
    }
  });

  it("never leaves an available Amazon edition without somewhere to send the buyer", () => {
    for (const b of books) {
      for (const f of b.formats) {
        if (f.fulfillment !== "amazon" || f.availability !== "available") continue;
        expect(
          f.amazonUrl,
          `${b.slug}/${f.format} is on sale at Amazon with no link`,
        ).toBeTruthy();
      }
    }
  });
});

describe("previews", () => {
  it("renders a real preview for every published book", async () => {
    // Guards the regression this replaced: every product page used to show
    // the same invented sample prose. A published book with no preview must
    // show no preview section — never borrowed or generic text — so the
    // manifest and the published set are kept in step here.
    const { getPreview } = await import("../../src/lib/previews/index.js");
    for (const b of books) {
      if (b.websiteStatus !== "published") continue;
      const preview = getPreview(b.slug);
      expect(preview, `${b.slug} is published with no rendered preview`).not.toBeNull();
      expect(preview!.pages.length, `${b.slug} preview is empty`).toBeGreaterThan(0);
    }
  });

  it("keeps previews far short of the whole book", async () => {
    const { getPreview } = await import("../../src/lib/previews/index.js");
    for (const b of books) {
      const preview = getPreview(b.slug);
      if (!preview) continue;
      // A preview is a sample, not a substitute. 5% of the book is already
      // generous; these run well under 3%.
      const share = preview.pages.length / b.formats[0].pageCount!;
      expect(share, `${b.slug} previews ${(share * 100).toFixed(1)}% of the book`).toBeLessThan(
        0.05,
      );
    }
  });
});

describe("publication", () => {
  it("uses only the two states the loader understands", () => {
    for (const b of books) {
      expect(["published", "draft"]).toContain(b.websiteStatus);
    }
  });

  it("publishes nothing that cannot be either bought or linked", () => {
    // A published page with no ebook to sell and no Amazon edition to link
    // is a dead end: a product page for something nobody can obtain.
    for (const b of books) {
      if (b.websiteStatus !== "published") continue;
      const obtainable =
        Boolean(directEbook(b)) ||
        b.formats.some((f) => f.availability === "available" && f.amazonUrl);
      expect(obtainable, `${b.slug} is published but cannot be obtained anywhere`).toBe(
        true,
      );
    }
  });

  it("records why each book is where it is", () => {
    for (const b of books) {
      expect(Array.isArray(b.blockers), `${b.slug} has no blockers array`).toBe(true);
    }
  });
});
