/**
 * Compare the catalogue's Amazon claims against the live listings.
 *
 * Reads every format in `valice-catalog.mjs` that carries an ASIN, fetches
 * the listing, and reports each field the catalogue asserts and the page
 * contradicts: price, page count, liveness. It also reports the fields the
 * catalogue does *not* carry but the market does — rating, review count,
 * sales rank — because "no Best Sellers Rank" is the plainest available
 * evidence that a title has not sold.
 *
 * Read-only. Writes a JSON snapshot to data/market/amazon-<date>.json when
 * --out is given, so a later run can be diffed against this one.
 *
 * Usage:
 *   node scripts/market/verify-amazon.mjs
 *   node scripts/market/verify-amazon.mjs --out
 *   node scripts/market/verify-amazon.mjs --slug the-great-book-of-world-games
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { BOOKS } from "../catalog/valice-catalog.mjs";
import { DEFAULT_DELAY_MS, readProduct, sleep } from "./amazon.mjs";

const slugFlag = process.argv.indexOf("--slug");
const only = slugFlag !== -1 ? process.argv[slugFlag + 1] : null;
const write = process.argv.includes("--out");

const targets = [];
for (const b of BOOKS) {
  if (only && b.slug !== only) continue;
  for (const f of b.formats) {
    if (f.amazonAsin) targets.push({ book: b, format: f });
  }
}

console.log(`checking ${targets.length} listing(s) on amazon.com\n`);

const results = [];
let problems = 0;
for (const [i, t] of targets.entries()) {
  if (i) await sleep(DEFAULT_DELAY_MS);
  const { book, format } = t;
  const label = `${book.slug} · ${format.format}`;
  let page;
  try {
    page = await readProduct(format.amazonAsin);
  } catch (err) {
    console.log(`ERROR   ${label.padEnd(46)} ${format.amazonAsin}  ${err.message}`);
    results.push({ slug: book.slug, format: format.format, asin: format.amazonAsin, error: err.message });
    problems++;
    continue;
  }

  const issues = [];
  const notes = [];
  if (!page.live) issues.push("no product title on the page — listing may be down");
  if (page.asinOnPage && page.asinOnPage !== format.amazonAsin)
    issues.push(`page ASIN ${page.asinOnPage} ≠ catalogue ${format.amazonAsin} (redirected?)`);
  // Read the price from the edition swatch, not the buy box: a Kindle ASIN
  // and its print editions share one detail page, so the buy box shows
  // whichever edition is selected.
  const SWATCH = { ebook: "kindle", paperback: "paperback", hardcover: "hardcover", large_print: "paperback" };
  const edition = page.editions?.[SWATCH[format.format]] ?? null;
  const livePrice = edition?.priceCents ?? null;
  if (livePrice === null) {
    issues.push("no price on the format strip — the listing may not be buyable");
  } else if (format.priceCents && livePrice !== format.priceCents) {
    issues.push(`list price live $${(livePrice / 100).toFixed(2)} ≠ catalogue $${(format.priceCents / 100).toFixed(2)}`);
  }
  // Amazon discounts print books below list at its own discretion, and the
  // KDP royalty is still computed on list, so a lower buy box is a market
  // observation rather than a catalogue defect — but it is the number the
  // customer compares against a direct price, so it has to be recorded.
  if (page.priceCents && livePrice && page.priceCents < livePrice && format.format !== "ebook")
    notes.push(
      `Amazon is discounting: buy box $${(page.priceCents / 100).toFixed(2)} against a $${(livePrice / 100).toFixed(2)} list ` +
        `(-${Math.round((1 - page.priceCents / livePrice) * 100)}%)`,
    );
  if (page.editions?.kindle?.kindleUnlimited)
    notes.push("Kindle shows $0.00 with Kindle Unlimited — the title is still inside a KDP Select exclusivity term");
  if (page.pageCount && format.pageCount && page.pageCount !== format.pageCount)
    issues.push(`page count live ${page.pageCount} ≠ catalogue ${format.pageCount}`);
  if (format.availability === "available" && !page.live)
    issues.push("catalogue says available but the listing does not render");

  const rank = page.ranks[0] ? `#${page.ranks[0].rank} ${page.ranks[0].category}` : "no BSR";
  const reviews = page.reviewCount ? `${page.reviewCount} reviews · ${page.rating}★` : "0 reviews";
  console.log(
    `${issues.length ? "DRIFT " : "ok    "} ${label.padEnd(46)} ${format.amazonAsin}  ` +
      `${(livePrice ? "$" + (livePrice / 100).toFixed(2) : "-").padStart(7)}  ${String(page.pageCount ?? "-").padStart(4)}pp  ${reviews.padEnd(22)} ${rank}`,
  );
  for (const x of issues) console.log(`         ✗ ${x}`);
  for (const x of notes) console.log(`         · ${x}`);
  problems += issues.length;
  results.push({ slug: book.slug, format: format.format, catalogue: { priceCents: format.priceCents ?? null, pageCount: format.pageCount ?? null, availability: format.availability }, live: page, issues, notes });
}

console.log(`\n${problems} problem(s) across ${targets.length} listing(s).`);

if (write) {
  mkdirSync("data/market", { recursive: true });
  const file = `data/market/amazon-${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), results }, null, 2));
  console.log(`snapshot → ${file}`);
}
