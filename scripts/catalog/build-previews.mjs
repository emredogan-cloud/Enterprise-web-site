/**
 * Render each book's preview pages to WebP for the storefront.
 *
 * Output: public/images/previews/<slug>/p<N>.webp, plus a manifest at
 * src/lib/previews/manifest.json that the book page reads. The manifest is
 * generated rather than hand-written so a preview cannot be referenced by a
 * page that was never rendered.
 *
 * Rendered at 150 DPI and capped at 1100px wide: sharp on a high-density
 * phone screen at the size it is displayed, and far short of a resolution
 * anyone would reconstruct a book from.
 *
 * Requires poppler-utils (pdftoppm) and cwebp/ImageMagick for WebP.
 *
 * Usage: node scripts/catalog/build-previews.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { PREVIEW_PAGES } from "./preview-pages.mjs";

const OUT_ROOT = "public/images/previews";
const MANIFEST = "src/lib/previews/manifest.json";
const DPI = 150;
const MAX_WIDTH = 1100;

mkdirSync("src/lib/previews", { recursive: true });

/**
 * Encode to WebP with whichever tool this machine has.
 *
 * `magick` is ImageMagick 7, `convert` is ImageMagick 6 — Ubuntu still ships
 * the latter. Trying each in turn and only failing once all three are gone
 * beats requiring one specific install, and every candidate is tried before
 * the error is raised so the message names all of them.
 */
const WEBP_ENCODERS = [
  ["cwebp", (png, webp) => ["-quiet", "-q", "82", "-resize", String(MAX_WIDTH), "0", png, "-o", webp]],
  ["magick", (png, webp) => [png, "-resize", `${MAX_WIDTH}x>`, "-quality", "82", webp]],
  ["convert", (png, webp) => [png, "-resize", `${MAX_WIDTH}x>`, "-quality", "82", webp]],
];

function toWebp(png, webp) {
  for (const [bin, args] of WEBP_ENCODERS) {
    try {
      execFileSync(bin, args(png, webp), { stdio: "pipe" });
      return;
    } catch (err) {
      // Only fall through when the binary is absent. A real encoding failure
      // must surface rather than being retried against another encoder and
      // reported as "nothing installed".
      if (err.code !== "ENOENT") throw err;
    }
  }
  throw new Error(
    `No WebP encoder found. Install one of: ${WEBP_ENCODERS.map(([b]) => b).join(", ")}.`,
  );
}

const manifest = {};
let total = 0;

for (const book of PREVIEW_PAGES) {
  if (!existsSync(book.source)) {
    console.error(`MISSING SOURCE  ${book.slug}\n  ${book.source}`);
    process.exitCode = 1;
    continue;
  }

  const dir = `${OUT_ROOT}/${book.slug}`;
  // Wipe first so a shortened range does not leave an orphaned page behind
  // that the manifest no longer lists but the bucket still serves.
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const [from, to] = book.pages;
  execFileSync("pdftoppm", [
    "-f", String(from),
    "-l", String(to),
    "-r", String(DPI),
    "-png",
    book.source,
    `${dir}/raw`,
  ]);

  const pages = [];
  for (const png of readdirSync(dir).filter((f) => f.endsWith(".png")).sort()) {
    const n = png.match(/raw-0*(\d+)\.png$/)?.[1];
    const webp = `${dir}/p${n}.webp`;
    toWebp(`${dir}/${png}`, webp);
    rmSync(`${dir}/${png}`);
    pages.push({
      src: `/images/previews/${book.slug}/p${n}.webp`,
      page: Number(n),
      bytes: statSync(webp).size,
    });
  }

  manifest[book.slug] = { note: book.note, pages: pages.map(({ src, page }) => ({ src, page })) };
  total += pages.length;
  const kb = (pages.reduce((n, p) => n + p.bytes, 0) / 1024).toFixed(0);
  console.log(`${book.slug.padEnd(32)} pages ${from}–${to}  ${pages.length} images  ${kb} KB`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${total} preview images · manifest → ${MANIFEST}`);
