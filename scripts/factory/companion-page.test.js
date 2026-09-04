import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { BOOKS } from "../catalog/valice-catalog.mjs";
import { COMPANION_PAGE_COPY, COMPANION_PAGE_PLAN, editions, printedUrl, qrUrl } from "./companion-page-spec.mjs";
import { EDITION_GEOMETRY, MEASURED_MEDIABOX_PT } from "./edition-geometry.mjs";
import { PRINT_INTERIORS } from "./print-interiors.mjs";
import { assess, spineWidthIn, wrapIn, KDP_TOLERANCE_IN } from "./spine-check.mjs";

/**
 * The companion page is printed matter. Once a code is on paper it cannot be
 * edited, re-pointed or made larger, and it will be scanned years after the
 * edition that carries it has changed. So these tests do not check that the
 * generator was called — they check the FILES that exist, the way a reader's
 * phone and a KDP reviewer would.
 *
 * The suite is skipped, loudly, when the book repositories are not mounted:
 * an absent book is a different fact from a defective one, and a green run on
 * an empty directory would be the most expensive kind of lie here.
 */

const HAVE_BOOKS = existsSync("/home/emre/Downloads/MY-DİGİTAL-BOOK");
const describeBooks = HAVE_BOOKS ? describe : describe.skip;

function pdfPages(file) {
  const out = execFileSync("pdfinfo", [file], { encoding: "utf8" });
  return Number(/Pages:\s+(\d+)/.exec(out)?.[1]);
}
function pageText(file, page) {
  return execFileSync("pdftotext", ["-f", String(page), "-l", String(page), file, "-"], { encoding: "utf8" });
}
function mediaBox(file, page) {
  const out = execFileSync("pdfinfo", ["-f", String(page), "-l", String(page), file], { encoding: "utf8" });
  const m = /Page\s+\d+\s+size:\s+([\d.]+)\s+x\s+([\d.]+)/.exec(out);
  return m ? [Math.round(Number(m[1])), Math.round(Number(m[2]))] : null;
}

// ── The copy, checked against the material it promises ──────────────────────
describe("companion page copy", () => {
  const registry = readFileSync("src/lib/companions.ts", "utf8");

  it("never promises material the companion registry does not carry", () => {
    // The single rule this project cannot bend: a book may not claim a thing
    // exists. A printed bullet naming a sheet nobody built is exactly that.
    for (const [bookSlug, copy] of Object.entries(COMPANION_PAGE_COPY)) {
      for (const bullet of copy.bullets) {
        if (!bullet.asset) continue;
        expect(registry, `${bookSlug} → ${bullet.asset}`).toContain(`id: "${bullet.asset}"`);
      }
    }
  });

  it("prints a canonical address and encodes the same one, with a scheme", () => {
    for (const bookSlug of Object.keys(COMPANION_PAGE_COPY)) {
      const printed = printedUrl(bookSlug);
      expect(printed).toMatch(/^valicepress\.com\/[a-z0-9/-]+$/);
      expect(printed).not.toMatch(/vercel\.app|localhost|valice-press\.com/);
      expect(qrUrl(bookSlug)).toBe(`https://${printed}`);
    }
  });

  it("has a plan entry and a geometry entry for every book it writes copy for", () => {
    for (const bookSlug of Object.keys(COMPANION_PAGE_COPY)) {
      expect(COMPANION_PAGE_PLAN[bookSlug], bookSlug).toBeDefined();
      expect(EDITION_GEOMETRY[bookSlug], bookSlug).toBeDefined();
    }
  });

  it("names a real catalogue book in every entry", () => {
    for (const bookSlug of Object.keys(COMPANION_PAGE_COPY)) {
      expect(BOOKS.some((b) => b.slug === bookSlug), bookSlug).toBe(true);
    }
  });
});

// ── The spine arithmetic, against KDP's published figures ───────────────────
describe("spine arithmetic", () => {
  it("matches KDP's own per-page thickness", () => {
    // 160 pages, white: the number this book's own cover report carries.
    expect(spineWidthIn(160, "white")).toBeCloseTo(0.3603, 4);
    // 124 → 126 pages, white: the Hangul rebuild.
    expect(spineWidthIn(124, "white")).toBeCloseTo(0.279248, 6);
    expect(spineWidthIn(126, "white")).toBeCloseTo(0.283752, 6);
    // 436 pages, cream: the Bestiarium rebuild, checked against the wrap the
    // book's own builder produced (13.3400 in wide at 6 × 9 + bleed).
    expect(wrapIn({ pages: 436, trimWidthIn: 6, trimHeightIn: 9, paper: "cream" }).wrapWidthIn)
      .toBeCloseTo(13.34, 4);
  });

  it("says a cover is unchanged only when the page count did not move", () => {
    const same = assess({ pagesBefore: 160, pagesAfter: 160, trimWidthIn: 8.5, trimHeightIn: 11 });
    expect(same.coverRebuildCorrect).toBe(false);
    expect(same.coverRebuildRequired).toBe(false);

    const grew = assess({ pagesBefore: 124, pagesAfter: 126, trimWidthIn: 8.5, trimHeightIn: 11 });
    expect(grew.coverRebuildCorrect).toBe(true);
    // Two pages is inside KDP's tolerance — the rebuild is correct, not forced.
    expect(grew.coverRebuildRequired).toBe(false);
    expect(Math.abs(grew.deltaWrapWidthIn)).toBeLessThan(KDP_TOLERANCE_IN);
  });

  it("forces a rebuild once the wrap leaves KDP's tolerance", () => {
    // 30 pages on cream moves the wrap by 0.075 in.
    const big = assess({ pagesBefore: 400, pagesAfter: 430, trimWidthIn: 6, trimHeightIn: 9, paper: "cream" });
    expect(big.coverRebuildRequired).toBe(true);
  });
});

// ── The finished files ──────────────────────────────────────────────────────
describeBooks("the printed companion pages", () => {
  const rows = editions();

  it("covers every print edition that has a built interior", () => {
    for (const [slug, formats] of Object.entries(PRINT_INTERIORS)) {
      for (const format of Object.keys(formats)) {
        expect(rows.some((r) => r.bookSlug === slug && r.format === format), `${slug}/${format}`).toBe(true);
      }
    }
  });

  for (const row of rows) {
    const file = PRINT_INTERIORS[row.bookSlug]?.[row.format];
    const label = `${row.bookSlug}/${row.format}`;
    // `native` and `replace` both name the page outright; `append` puts the
    // leaf one past the old last page.
    const page = row.mode === "append" ? row.pagesBefore + 1 : row.page;

    it(`${label}: the interior is the page count the plan produced`, () => {
      expect(existsSync(file), file).toBe(true);
      expect(pdfPages(file)).toBe(row.pagesAfter);
    });

    it(`${label}: page ${page} is a dedicated companion page`, () => {
      const text = pageText(file, page).replace(/\s+/g, " ");
      const imprint = COMPANION_PAGE_COPY[row.bookSlug].imprint.toUpperCase();
      expect(text).toContain(`CONTINUE WITH ${imprint}`);
      expect(text).toContain(printedUrl(row.bookSlug));
      // The promise that makes the page worth scanning, and that KDP's
      // hyperlink rule requires to be true.
      expect(text.toLowerCase()).toContain("no email asked");
      expect(text).not.toMatch(/vercel\.app|localhost|valice-press\.com/i);
    });

    it(`${label}: the new leaf is cut to the book's own trim`, () => {
      const expected = MEASURED_MEDIABOX_PT[row.bookSlug]?.[row.format];
      if (!expected) return;
      expect(mediaBox(file, page)).toEqual(expected);
    });
  }
});

// ── The upload packages ─────────────────────────────────────────────────────
describeBooks("the KDP upload packages", () => {
  const root = "docs/execution/phase-5/kdp-packages";

  for (const row of editions()) {
    const dir = join(root, row.bookSlug, row.format);
    it(`${row.bookSlug}/${row.format}: has a manifest whose numbers match the file`, () => {
      const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
      const file = PRINT_INTERIORS[row.bookSlug][row.format];
      expect(manifest.interior.pagesAfter).toBe(pdfPages(file));
      expect(manifest.companion.printedUrl).toBe(printedUrl(row.bookSlug));
      expect(manifest.companion.emailWall).toBe(false);
      expect(manifest.verification.every((c) => c.pass), JSON.stringify(manifest.verification)).toBe(true);
    });

    it(`${row.bookSlug}/${row.format}: never tells the Founder to reuse a wrap that no longer fits`, () => {
      const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
      const upload = readFileSync(join(dir, "UPLOAD.md"), "utf8");
      if (manifest.kdpState === "not_created") {
        // Nothing is at KDP to reuse or to leave alone. Telling the Founder
        // "do not touch the cover" here would be telling them not to upload
        // one, which is how a paperback goes live with no cover at all.
        expect(upload).not.toContain("Do not touch the cover");
        expect(upload).toContain("there is no cover at KDP yet");
        expect(upload).toContain("Do not use Cover Creator");
      } else if (manifest.spine.coverRebuildCorrect) {
        expect(upload).not.toContain("Do not touch the cover");
        // Either a rebuilt wrap is named, or the reason there is none is given.
        expect(manifest.cover?.built === true || typeof manifest.cover?.reason === "string" ).toBe(true);
      } else {
        expect(upload).toContain("Do not touch the cover");
      }
    });
  }
});
