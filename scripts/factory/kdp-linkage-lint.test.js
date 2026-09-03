import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { auditEdition, companionsByBook } from "./kdp-linkage-lint.mjs";

/**
 * The linkage lint reads BUILT PDFs, so these tests build tiny real PDFs and
 * read them back through pdftotext/pdfinfo — the same path a KDP reviewer's
 * copy takes. Nothing here passes on a file merely existing.
 */

async function pdfWith(lines, { title = "A Test Book", author = "Valice Press" } = {}) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor(author);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([432, 648]);
  let y = 600;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 18;
  }
  const dir = mkdtempSync(join(tmpdir(), "linkage-"));
  const file = join(dir, "interior.pdf");
  writeFileSync(file, await doc.save());
  return file;
}

const book = { slug: "test-book", title: "A Test Book" };
const live = { format: "paperback", availability: "available", amazonAsin: "B0TEST0000", kdp: "live" };
const companion = { slug: "test", state: "book-available", assets: ["Sheet"] };

describe("kdp-linkage-lint on built PDFs", () => {
  it("is COMPLETE when the companion URL is printed on a canonical host", async () => {
    const file = await pdfWith(["Free material at valicepress.com/companion/test", "Scan, or type the address."]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.status).toBe("COMPLETE");
    expect(row.hasCompanionUrl).toBe(true);
    expect(row.metadataOk).toBe(true);
  });

  it("does not accept a caption as evidence that a code was printed", async () => {
    // Until 2026-09-03 the audit answered "is there a QR?" by looking for the
    // words "Scan, or type the address" — so a page that printed the caption
    // and lost the code passed. The code is now found in the raster or not at
    // all, and this page has no code on it.
    const file = await pdfWith(["Free material at valicepress.com/companion/test", "Scan, or type the address."]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.qrPresent).toBe("no");
    expect(row.findings.some((f) => f.check === "qr-missing")).toBe(true);
  });

  it("does not mistake a passing mention for a dedicated companion page", async () => {
    // What the Dudeney paperback carried until this pass: one line inside the
    // imprint on p.4, and nothing else anywhere in 144 pages.
    const file = await pdfWith([
      "Copyright 2026. Set in Liberation Serif. Printed on demand.",
      "valicepress.com/companion/test — hints and printable sheets, free.",
    ]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.dedicatedPage).toBe(false);
    expect(row.findings.some((f) => f.check === "dedicated-page")).toBe(true);
  });

  it("recognises a house companion page by its standing line", async () => {
    const file = await pdfWith([
      "CONTINUE WITH VÂLIÇE PRESS",
      "Scan the code, or type the address:",
      "valicepress.com/companion/test",
    ]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.dedicatedPage).toBe(true);
    expect(row.companionPage).toBe(1);
    expect(row.findings.some((f) => f.check === "dedicated-page")).toBe(false);
  });

  it("is MISSING when a companion exists but the interior never names it", async () => {
    const file = await pdfWith(["The end."]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.status).toBe("MISSING");
    expect(row.action).toContain("valicepress.com/companion/test");
  });

  it("refuses a preview host, a data wall and the invented biography", async () => {
    const file = await pdfWith([
      "Visit valice-press-abc123.vercel.app/companion/test",
      "Also valicepress.com/newsletter-signup",
      "Emre is a puzzle designer, mythologist, and game archivist.",
    ]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.status).toBe("NEEDS_REVISION");
    expect(row.forbiddenHosts.length).toBeGreaterThan(0);
    expect(row.dataWallUrls.length).toBeGreaterThan(0);
    expect(row.bioStatus).toBe("invented");
  });

  it("refuses broken PDF metadata and a false listing claim", async () => {
    const file = await pdfWith(
      ["A World Bestiary: 120 Legendary Creatures", "valicepress.com/companion/test"],
      { title: "untitled", author: "anonymous" },
    );
    const row = await auditEdition(book, live, file, companion);
    expect(row.status).toBe("NEEDS_REVISION");
    expect(row.metadataOk).toBe(false);
    expect(row.falseClaims.length).toBe(1);
  });

  it("recognises the approved biography and reports an unregistered interior as BLOCKED", async () => {
    const file = await pdfWith(["Emre Dogan writes about the stories that cultures tell themselves in order to keep going.", "valicepress.com/companion/test"]);
    const row = await auditEdition(book, live, file, companion);
    expect(row.bioStatus).toBe("approved");
    const blocked = await auditEdition(book, live, null, companion);
    expect(blocked.status).toBe("BLOCKED");
  });

  it("marks an edition at KDP review as IN_REVIEW rather than asking for an upload", async () => {
    const file = await pdfWith(["The end."]);
    const row = await auditEdition(book, { ...live, amazonAsin: null, availability: "coming_soon", kdp: "in_review" }, file, companion);
    expect(row.status).toBe("IN_REVIEW");
  });

  it("reads the companion registry from the site source", () => {
    const map = companionsByBook();
    expect(map.get("the-great-book-of-world-games")?.slug).toBe("world-games");
    expect(map.get("the-great-book-of-world-myths")?.slug).toBe("world-myths");
    expect(map.get("codex-bestiarium")?.slug).toBe("codex-bestiarium");
    expect(map.get("codex-mythologica")?.slug).toBe("codex-mythologica");
    expect(map.get("the-myth-hunters-field-book")?.slug).toBe("myth-hunters-field-book");
    expect(map.get("korean-hangul-handwriting-workbook")?.slug).toBe("hangul");
  });
});
