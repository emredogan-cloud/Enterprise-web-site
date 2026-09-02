import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

/**
 * Social-DRM watermarking for EPUB 3, the way an EPUB permits it.
 *
 * The PDF path stamps a footer line on every page with pdf-lib. An EPUB has no
 * pages — the reader lays it out — so the equivalent is not a stamp but a
 * *leaf*: one extra document at the end of the reading order, plus the same
 * licence line written into the package metadata where a file inspector and a
 * library app will both find it.
 *
 * WHAT IS WRITTEN
 *   1. `OEBPS/valice-licence.xhtml` — a short, plain page naming the buyer and
 *      the order. Last in the spine, so it never interrupts the book.
 *   2. `dc:rights` in the OPF, extended with the same line.
 *   3. `<meta name="valice:order">` / `valice:book` — machine-readable, the
 *      counterpart of the PDF's XMP keywords.
 *
 * WHAT IS DELIBERATELY NOT DONE
 * Nothing is injected into the book's own chapters. A watermark that edits the
 * text a reader paid for is a defect, not a deterrent, and every extra
 * insertion point is another way to produce an EPUB that fails validation.
 *
 * The zip is rebuilt with `mimetype` first and stored uncompressed, which is
 * an EPUB requirement (OCF 3.x) that a naive re-zip silently breaks.
 */

export interface EpubWatermarkArgs {
  buyerName: string | null;
  orderId: string;
  bookId: string;
  bookTitle: string;
}

/** The one-line licence, identical in wording to the PDF footer. */
export function buildEpubLicenceLine(args: {
  buyerName: string | null;
  orderId: string;
}): string {
  const name = (args.buyerName?.trim() || "reader").slice(0, 80);
  return `Licensed to ${name} · Order ${args.orderId.slice(0, 8)} · Valice Press`;
}

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const LICENCE_HREF = "valice-licence.xhtml";
const LICENCE_ID = "valice-licence";

function licencePage(line: string, bookTitle: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head><title>Your copy</title><meta charset="utf-8"/></head>
<body>
<section epub:type="colophon">
<h1>Your copy</h1>
<p>${escapeXml(line)}</p>
<p>This copy of <em>${escapeXml(bookTitle)}</em> carries no DRM. It is yours: read it on
any device you own, keep it as long as you like, and re-download it from your
library at valicepress.com whenever you need to. We ask only that you do not
post it publicly — a small press runs on the assumption that you will not.</p>
<p><a href="https://valicepress.com/account/library">valicepress.com/account/library</a></p>
</section>
</body>
</html>
`;
}

/** Locate the OPF the way a reading system does: through the container. */
function opfPath(files: Record<string, Uint8Array>): string {
  const container = files["META-INF/container.xml"];
  if (!container) throw new Error("[epub] no META-INF/container.xml — not an EPUB");
  const m = strFromU8(container).match(/full-path="([^"]+)"/);
  if (!m) throw new Error("[epub] container.xml names no rootfile");
  if (!files[m[1]]) throw new Error(`[epub] rootfile ${m[1]} is not in the archive`);
  return m[1];
}

/**
 * Returns a new EPUB carrying the buyer's licence. The input is not mutated.
 *
 * Throws rather than returning the original on a structural surprise: silently
 * delivering an unwatermarked file would defeat the point and would do it
 * invisibly.
 */
export function watermarkEpub(
  epubBytes: Uint8Array,
  args: EpubWatermarkArgs,
): Uint8Array {
  const files = unzipSync(epubBytes);
  const line = buildEpubLicenceLine(args);

  const opfName = opfPath(files);
  // The OPF's own directory is the base for every href in it.
  const dir = opfName.includes("/") ? opfName.slice(0, opfName.lastIndexOf("/") + 1) : "";
  let opf = strFromU8(files[opfName]);

  // 1. The page itself.
  files[`${dir}${LICENCE_HREF}`] = strToU8(licencePage(line, args.bookTitle));

  // 2. Manifest — skip if a previous run already added it, so re-watermarking
  //    an already-watermarked file cannot produce a duplicate id.
  if (!opf.includes(`id="${LICENCE_ID}"`)) {
    opf = opf.replace(
      /<\/manifest>/,
      `<item id="${LICENCE_ID}" href="${LICENCE_HREF}" media-type="application/xhtml+xml"/></manifest>`,
    );
    opf = opf.replace(/<\/spine>/, `<itemref idref="${LICENCE_ID}"/></spine>`);
  }

  // 3. Metadata. `dc:rights` is where a library app shows provenance; the two
  //    `valice:` metas are the machine-readable pair of the PDF's XMP keywords.
  const rightsLine = escapeXml(line);
  opf = opf.includes("<dc:rights>")
    ? opf.replace(/<dc:rights>([\s\S]*?)<\/dc:rights>/, (_m, inner) =>
        inner.includes("Licensed to")
          ? `<dc:rights>${inner.replace(/Licensed to [^<]*/, rightsLine)}</dc:rights>`
          : `<dc:rights>${inner} ${rightsLine}</dc:rights>`,
      )
    : opf.replace(/<\/metadata>/, `<dc:rights>${rightsLine}</dc:rights></metadata>`);

  opf = opf.replace(/\s*<meta name="valice:(order|book)" content="[^"]*"\/>/g, "");
  opf = opf.replace(
    /<\/metadata>/,
    `<meta name="valice:order" content="${escapeXml(args.orderId)}"/>` +
      `<meta name="valice:book" content="${escapeXml(args.bookId)}"/></metadata>`,
  );

  // EPUB requires `dcterms:modified` to be a real timestamp, and changing the
  // file without changing it leaves a package that claims to be older than it is.
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  opf = opf.replace(
    /<meta property="dcterms:modified">[^<]*<\/meta>/,
    `<meta property="dcterms:modified">${now}</meta>`,
  );

  files[opfName] = strToU8(opf);

  // OCF: `mimetype` must be the first entry and must be stored, not deflated.
  // fflate writes entries in key order, so rebuild the map with it first.
  const ordered: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
  ordered["mimetype"] = [files["mimetype"] ?? strToU8("application/epub+zip"), { level: 0 }];
  for (const [name, bytes] of Object.entries(files)) {
    if (name === "mimetype") continue;
    ordered[name] = [bytes, { level: 6 }];
  }
  return zipSync(ordered as unknown as Parameters<typeof zipSync>[0]);
}
