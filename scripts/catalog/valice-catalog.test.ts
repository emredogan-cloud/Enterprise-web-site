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
  // "publishing" is KDP's state between submission and sale: the title has been
  // accepted, Amazon has ISSUED THE ASIN and the product page exists, but the
  // listing is not yet purchasable. It is distinct from "in_review", where no ASIN
  // has been issued at all.
  kdp: "live" | "publishing" | "in_review" | "not_created" | "not_applicable";
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
  series?: { name: string; volume?: number } | null;
  categories: string[];
  authors: string[];
  formats: Format[];
  blockers: string[];
}

const books = BOOKS as Book[];
/** Has an ebook this site holds and can hand over — the free campaign's test. */
const directEbook = (b: Book) =>
  b.formats.find(
    (f) =>
      f.format === "ebook" &&
      f.fulfillment === "direct" &&
      f.availability === "available",
  );

/**
 * May we CHARGE for it here? Narrower than `directEbook` since the Paddle
 * compliance gate: eighteen public-domain titles are deliverable (the free
 * campaign still works) but are deliberately not Paddle transactions.
 */
const soldHere = (b: Book) => Boolean(directEbook(b)) && b.directSale !== false;

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

/**
 * The Paddle compliance gate, asserted rather than trusted.
 *
 * Paddle declined valicepress.com on 2026-09-09 and 2026-09-11, the second
 * time naming "reselling/redistribution of third party content" and "physical
 * goods sold or otherwise provided as part of the product". The catalog answers
 * both by holding the public-domain series out of the paid checkout and by
 * refusing to advertise print editions that do not exist.
 *
 * These tests exist so that neither can be undone by accident — by a new book
 * copied from an old template, or by somebody restoring a price id without
 * knowing why it was removed. If Paddle later approves the public-domain model
 * in writing, the gate comes out of `valice-catalog.mjs` and these come out
 * with it, deliberately and together.
 */
describe("Paddle compliance gate", () => {
  const PUBLIC_DOMAIN_SERIES = "Valice Classics";

  it("keeps every public-domain title out of the paid checkout", () => {
    const offenders = books
      .filter((b) => b.series?.name === PUBLIC_DOMAIN_SERIES)
      .filter((b) => b.paddlePriceId || b.directSale !== false)
      .map((b) => b.slug);
    expect(
      offenders,
      `public-domain titles must not be Paddle-wired: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("still lets held-out titles be delivered, so the free campaign survives", () => {
    // The bug this guards: tying master_file_key to "is it on sale" nulls the
    // key for every held-out book and breaks free delivery for two thirds of
    // the catalogue.
    const classics = books.filter(
      (b) => b.series?.name === PUBLIC_DOMAIN_SERIES && b.websiteStatus === "published",
    );
    expect(classics.length).toBeGreaterThan(0);
    for (const b of classics) {
      const ebook = directEbook(b);
      expect(ebook, `${b.slug} lost its deliverable ebook`).toBeDefined();
      expect(ebook!.masterFileKey, `${b.slug} has no master to deliver`).toBeTruthy();
    }
  });

  it("records why every held-out title is held out", () => {
    for (const b of books.filter((x) => x.series?.name === PUBLIC_DOMAIN_SERIES)) {
      expect(b.directSaleBlockedBy, `${b.slug} records no reason`).toMatch(/Paddle/i);
    }
  });

  /**
   * The free campaign must survive the gate.
   *
   * Everything that decides "can this be given away" used to ask about price,
   * because until 2026-09-12 an unpriced book was always also a book with no
   * file. The gate separated those, and three separate places had to be taught
   * the difference: the API (`/api/free-book`), the gift box, and the loader's
   * `master_file_key` write. If any one of them reverts to the price test,
   * eighteen titles silently stop being requestable — the modal opens and the
   * submission answers 409.
   */
  it("leaves every held-out title giftable, and every unfillable title not", () => {
    const published = books.filter((b) => b.websiteStatus === "published");
    const withMaster = published.filter((b) => directEbook(b)?.masterFileKey);
    const withoutMaster = published.filter((b) => !directEbook(b)?.masterFileKey);

    // Held out of the paid checkout, still ours to give.
    for (const b of published.filter((x) => x.series?.name === PUBLIC_DOMAIN_SERIES)) {
      expect(withMaster, `${b.slug} must stay giftable`).toContain(b);
    }
    // The only books that must never be offered are the ones with no file.
    for (const b of withoutMaster) {
      expect(directEbook(b)?.masterFileKey ?? null, `${b.slug}`).toBeFalsy();
    }
    expect(withMaster.length).toBeGreaterThanOrEqual(18);
  });

  it("advertises no print edition that does not exist", () => {
    const phantom = books.flatMap((b) =>
      b.formats
        .filter(
          (f) =>
            (f.format === "paperback" ||
              f.format === "hardcover" ||
              f.format === "large_print") &&
            f.availability !== "unavailable" &&
            !f.amazonAsin,
        )
        .map((f) => `${b.slug}/${f.format}`),
    );
    expect(
      phantom,
      `print editions shown without a real ASIN: ${phantom.join(", ")}`,
    ).toEqual([]);
  });

  it("keeps the print editions that DO exist, with their Amazon links", () => {
    // The other half of the rule: Valice Press really does sell printed books
    // through Amazon, and this separation must not quietly delete that.
    const live = books.flatMap((b) =>
      b.formats.filter((f) => f.amazonUrl && f.amazonAsin).map((f) => `${b.slug}/${f.format}`),
    );
    expect(live.length).toBeGreaterThanOrEqual(20);
  });
});

describe("Paddle wiring", () => {
  // The shape Paddle actually issues. `pri_test_meditations_999` passes a
  // naive startsWith("pri_") check, which is precisely how it survived.
  const PRICE_ID = /^pri_[a-z0-9]{20,}$/;

  it("gives every directly-sold book a real-looking Paddle price id", () => {
    for (const b of books) {
      if (!soldHere(b)) continue;
      expect(b.paddlePriceId, `${b.slug} is on sale with no Paddle price`).toBeTruthy();
      expect(
        b.paddlePriceId,
        `${b.slug}: "${b.paddlePriceId}" is not shaped like a Paddle price id`,
      ).toMatch(PRICE_ID);
    }
  });

  it("does not carry a Paddle price for a book that is not sold here", () => {
    for (const b of books) {
      if (soldHere(b)) continue;
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
        // The destination is always the verified ASIN's own /dp/ page. An
        // Amazon Attribution tag (created in the Ads console, 2026-09-08) is
        // allowed as a query string on that same page: it changes what
        // Amazon reports, not where the reader lands.
        const dp = `https://www.amazon.com/dp/${f.amazonAsin}`;
        expect(
          f.amazonUrl === dp || f.amazonUrl.startsWith(`${dp}?`),
          `${b.slug}/${f.format}: amazonUrl must be the ASIN's /dp/ page, optionally with a query string`,
        ).toBe(true);
      }
    }
  });

  it("only carries an ASIN for an edition Amazon has actually issued one for", () => {
    // Amazon issues an ASIN when it accepts a title, not when the listing becomes
    // purchasable. An ASIN on a title that is still in review, was never created, or
    // has no Amazon edition at all is, by definition, made up — and that is what this
    // guards. "publishing" is admitted because it is the state between the two: the
    // ASIN exists and resolves to a real product page, the price simply is not up yet.
    //
    // Widened on 2026-09-07 for B0HJ2TPX4T (the Puzzle Book paperback), whose page was
    // loaded and checked before the state was written: right title, ISBN 979-8172268281
    // matching KDP's assignment, 156 pages matching the built interior. Refusing a
    // verified ASIN would have meant deleting a true fact to satisfy a narrow rule.
    const ISSUED = ["live", "publishing"];
    for (const b of books) {
      for (const f of b.formats) {
        if (!f.amazonAsin) continue;
        expect(
          ISSUED,
          `${b.slug}/${f.format} has an ASIN but kdp="${f.kdp}"`,
        ).toContain(f.kdp);
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
