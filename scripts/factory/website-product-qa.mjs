#!/usr/bin/env node
/**
 * website-product-qa.mjs — Gate 11 evidence, taken from the live site.
 *
 * Gate 11 is "Website product QA" and it is the one gate an agent owns that had never been
 * run for any book. It cannot be satisfied by reading the catalogue: a row can say
 * `published` while the page 404s, serves a placeholder cover, or shows a price the row does
 * not carry. So every check here is an HTTP request to production and an assertion about the
 * bytes that came back.
 *
 * A book whose page is not live CANNOT pass this gate, and this script says so rather than
 * skipping it quietly — an unbuilt page and a broken one are different facts.
 *
 *   node scripts/factory/website-product-qa.mjs [--slug <slug>]... [--out <file>]
 */
import { writeFileSync } from "node:fs";
import { BOOKS } from "../catalog/valice-catalog.mjs";

const args = process.argv.slice(2);
const only = args.reduce((a, v, i) => (v === "--slug" ? [...a, args[i + 1]] : a), []);
const outIdx = args.indexOf("--out");
const OUT = outIdx !== -1 ? args[outIdx + 1] : null;
const BASE = "https://valicepress.com";

const money = (c) => (c == null ? null : `$${(c / 100).toFixed(2)}`);

async function get(url) {
  try {
    const r = await fetch(url, { redirect: "follow", headers: { "x-valice-probe": "gate-11" } });
    return { status: r.status, body: r.status === 200 ? await r.text() : "" };
  } catch (e) {
    return { status: 0, body: "", error: String(e.message ?? e) };
  }
}

const rows = [];
for (const b of BOOKS) {
  if (only.length && !only.includes(b.slug)) continue;
  const url = `${BASE}/books/${b.slug}`;
  const { status, body, error } = await get(url);
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  add("http-200", status === 200, error ?? `HTTP ${status}`);

  if (status === 200) {
    // The title as the catalogue holds it must appear on the page. Compared on letters and
    // digits only: the page sets typographic quotes and dashes the catalogue stores plain.
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    add("title", norm(body).includes(norm(b.title)), b.title);

    // The cover must be the book's own file, not a gradient placeholder.
    add("cover", body.includes(`/images/books/${b.slug}.webp`), `/images/books/${b.slug}.webp`);

    // Every price the catalogue says is on sale must be printed somewhere on the page.
    const sold = (b.formats ?? []).filter((f) => f.availability === "available" && f.priceCents);
    const missing = sold.filter((f) => !body.includes(money(f.priceCents)));
    add("prices", missing.length === 0,
        sold.length ? `${sold.length - missing.length}/${sold.length} shown` : "none on sale");

    // A buyer needs a way to act: a direct cart control, or a link to the Amazon listing.
    const asins = (b.formats ?? []).map((f) => f.amazonAsin).filter(Boolean);
    const hasCta = /add to cart|buy now|add-to-cart/i.test(body) || asins.some((a) => body.includes(a));
    add("cta", hasCta, asins.length ? `amazon ${asins.join(",")}` : "direct");

    // A recorded ASIN must reach the page, or the Amazon edition is invisible to a reader —
    // BUT ONLY FOR FORMATS AMAZON FULFILS. A book whose ebook is sold direct still has a
    // Kindle edition with an ASIN, and its page correctly shows a cart button instead of a
    // link to Amazon. Requiring every ASIN to appear failed four books for doing the right
    // thing, and would have buried the three that are genuinely wrong.
    const amazonAsins = (b.formats ?? [])
      .filter((f) => f.amazonAsin && f.fulfillment === "amazon")
      .map((f) => f.amazonAsin);
    if (amazonAsins.length) {
      const absent = amazonAsins.filter((a) => !body.includes(a));
      add("asin-links", absent.length === 0,
          absent.length ? `absent: ${absent.join(",")}` : amazonAsins.join(","));
    }
  }

  const ok = checks.every((c) => c.ok);
  rows.push({ slug: b.slug, url, websiteStatus: b.websiteStatus, status, ok, checks });
}

const live = rows.filter((r) => r.status === 200);
const rec = {
  tool: "website-product-qa",
  target: BASE,
  ranAt: new Date().toISOString(),
  counts: { checked: rows.length, live: live.length, passing: rows.filter((r) => r.ok).length },
  $why: "Gate 11 evidence. Every assertion is against bytes returned by production; a row that "
      + "says published while the page 404s fails here, which is the point.",
  rows,
};
if (OUT) writeFileSync(OUT, JSON.stringify(rec, null, 1));

for (const r of rows) {
  const bad = r.checks.filter((c) => !c.ok).map((c) => c.name);
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.slug.padEnd(36)} ${String(r.status).padEnd(4)} ${r.websiteStatus.padEnd(10)} ${bad.length ? "failed: " + bad.join(",") : ""}`);
}
console.log(`\n${rec.counts.passing}/${rec.counts.checked} pass · ${rec.counts.live} live pages`);
process.exit(0);
