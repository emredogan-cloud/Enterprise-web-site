/**
 * Build the direct-sale digital edition of each ebook from its print interior.
 *
 * WHY THIS EXISTS
 * The fulfillment worker (`src/inngest/functions/watermark.ts`) stamps a
 * per-buyer watermark into a PDF with pdf-lib, inside a serverless function.
 * The print interiors are 40–121 MB because they carry 300 DPI plates sized
 * for offset printing. Loading one of those into memory, re-saving it and
 * writing it back to R2 is not something a function should be asked to do,
 * and a 121 MB download is not something a reader should be asked to accept.
 *
 * So the digital edition is a distinct artifact: the same typeset pages, with
 * images resampled to screen resolution. Ghostscript's /ebook profile
 * (150 DPI colour + greyscale, 300 DPI mono) keeps the line-engraved plates
 * crisp at reading size while taking Codex Bestiarium from 108 MB to ~4.8 MB.
 * The print files are untouched — Amazon keeps the 300 DPI originals.
 *
 * The output is deliberately NOT the EPUB. A watermarked, DRM-free PDF is
 * what this store sells and what the reader route renders; the EPUBs exist
 * for Kindle and are Amazon's channel.
 *
 * Usage:
 *   node scripts/catalog/build-digital-editions.mjs            # build all
 *   node scripts/catalog/build-digital-editions.mjs <slug>...  # build some
 *
 * Output: scripts/tmp/digital-editions/<slug>.pdf
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { DIGITAL_EDITION_SOURCES } from "./digital-edition-sources.mjs";

const OUT_DIR = "scripts/tmp/digital-editions";
mkdirSync(OUT_DIR, { recursive: true });

const wanted = process.argv.slice(2);
const targets = wanted.length
  ? DIGITAL_EDITION_SOURCES.filter((s) => wanted.includes(s.slug))
  : DIGITAL_EDITION_SOURCES;

if (!targets.length) {
  console.error("No matching slug. Known:", DIGITAL_EDITION_SOURCES.map((s) => s.slug).join(", "));
  process.exit(1);
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";

for (const src of targets) {
  const out = `${OUT_DIR}/${src.slug}.pdf`;
  let inSize;
  try {
    inSize = statSync(src.printInterior).size;
  } catch {
    console.error(`MISSING SOURCE  ${src.slug}\n  ${src.printInterior}`);
    process.exitCode = 1;
    continue;
  }

  execFileSync(
    "gs",
    [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.7",
      // /ebook: 150 DPI colour+grey, 300 DPI mono. The plates in these books
      // are line engravings, which survive this well; a lower profile
      // (/screen, 72 DPI) visibly destroys them.
      "-dPDFSETTINGS=/ebook",
      "-dDetectDuplicateImages=true",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${out}`,
      src.printInterior,
    ],
    { stdio: "inherit" },
  );

  const outSize = statSync(out).size;
  const pages = execFileSync("pdfinfo", [out], { encoding: "utf8" })
    .split("\n")
    .find((l) => l.startsWith("Pages:"))
    ?.split(/\s+/)[1];

  console.log(
    `${src.slug.padEnd(32)} ${mb(inSize).padStart(10)} → ${mb(outSize).padStart(9)}  ${pages}pp`,
  );

  if (outSize > 25 * 1024 * 1024) {
    console.warn(
      `  WARNING: ${src.slug} is still over 25 MB. The watermark worker reads the` +
        ` whole file into memory; check the function's memory limit before selling it.`,
    );
  }
}
