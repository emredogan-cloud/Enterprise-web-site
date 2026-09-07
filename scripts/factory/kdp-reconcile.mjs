import { readFileSync } from "node:fs";
import { BOOKS } from "../catalog/valice-catalog.mjs";
const obs = JSON.parse(readFileSync("docs/30-kdp/KDP_BOOKSHELF_OBSERVED.json", "utf8")).listings;
const byAsin = new Map(obs.map((o) => [o.asin, o]));

const rows = [];
for (const b of BOOKS) for (const f of b.formats ?? []) {
  if (!f.amazonAsin) continue;
  const o = byAsin.get(f.amazonAsin);
  rows.push({ slug: b.slug, format: f.format, asin: f.amazonAsin, catPrice: f.priceCents,
              kdpPrice: o ? Math.round(o.priceUsd * 100) : null, kdpStatus: o?.status ?? null,
              kdpNote: o?.note ?? null, avail: f.availability, kdp: f.kdp });
  if (o) byAsin.delete(f.amazonAsin);
}
const m = (c) => (c == null ? "—" : `$${(c / 100).toFixed(2)}`);
let mismatch = 0, missing = 0;
console.log("catalogue format".padEnd(46) + "ASIN".padEnd(13) + "catalogue  KDP        verdict");
for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  let v;
  if (r.kdpPrice === null) { v = "NOT ON THE KDP SHELF"; missing++; }
  else if (r.kdpPrice !== r.catPrice) { v = `PRICE MISMATCH (${m(r.kdpPrice - r.catPrice)} off)`; mismatch++; }
  else v = "ok" + (r.kdpNote ? `  · KDP: ${r.kdpNote}` : "");
  console.log(`${(r.slug + "/" + r.format).padEnd(46)}${r.asin.padEnd(13)}${m(r.catPrice).padEnd(11)}${m(r.kdpPrice).padEnd(11)}${v}`);
}
console.log(`\nKDP listings with no catalogue row: ${byAsin.size}${byAsin.size ? " → " + [...byAsin.keys()].join(", ") : ""}`);
console.log(`price mismatches: ${mismatch}   catalogue ASINs absent from KDP: ${missing}   rows compared: ${rows.length}`);
