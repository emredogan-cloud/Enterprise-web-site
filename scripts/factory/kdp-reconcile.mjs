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

// ---------------------------------------------------------------------------
// Does every number in a LIVE KDP title have a measured count behind it?
//
// metadata-lint already refuses an unbacked number in a title — but it compares the
// project config's title against the project config's counts, so both sides can agree
// while the thing a customer reads is wrong. Codex Bestiarium sold for a month with
// "120 Legendary Creatures" on four listings against a manuscript of 112 and a printed
// interior that says 112 in its own front matter. This is the join that catches it.
// ---------------------------------------------------------------------------
import { existsSync as _exists, readFileSync as _read } from "node:fs";
const BOOKS_ROOT = process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";
const TITLE_TO_PROJECT = [
  ["Codex Mythologica: The Puzzle Book", "ROADMAP-BOOKS/04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK"],
  ["Codex Bestiarium", "ROADMAP-BOOKS/CODEX-BESTIARIUM"],
  ["Codex Mythologica", "ROADMAP-BOOKS/CODEX-MYTHOLOGICA"],
  ["Codex Enigmatica", "ROADMAP-BOOKS/CODEX-ENIGMATICA"],
  ["The Great Book of World Games", "ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-GAMES"],
  ["The Great Book of World Myths", "ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-MYTHS"],
  ["The Myth Hunter", "ROADMAP-BOOKS/THE-MYTH-HUNTERS-FIELD-BOOK"],
  ["Korean Hangul", "ROADMAP-BOOKS/01-KOREAN-HANGUL-HANDWRITING-WORKBOOK"],
  ["The Puzzles of Henry Dudeney", "ROADMAP-BOOKS/03-THE-PUZZLES-OF-HENRY-DUDENEY"],
];

function measuredCounts(projectRel) {
  const p = `${BOOKS_ROOT}/${projectRel}/project_config.json`;
  if (!_exists(p)) return null;
  let cfg;
  try { cfg = JSON.parse(_read(p, "utf8")); } catch { return null; }
  const m = cfg.measured ?? {};
  const out = new Set();
  for (const [k, v] of Object.entries(m)) {
    if (typeof v === "number" && Number.isInteger(v)) { out.add(String(v)); out.add(k); }
  }
  return out;
}

let titleBad = 0;
console.log("\n── numbers in the live KDP title, against the project's measured counts ──");
for (const l of obs) {
  const rel = (TITLE_TO_PROJECT.find(([k]) => l.kdpTitle.startsWith(k)) ?? [])[1];
  if (!rel) continue;
  const m = measuredCounts(rel);
  if (!m) continue;
  // "4,600" is one number; strip the separator before splitting.
  const nums = [...l.kdpTitle.replace(/(\d),(\d{3})/g, "$1$2").matchAll(/\b\d{1,5}\b/g)].map((x) => x[0]);
  const unbacked = nums.filter((n) => !m.has(n));
  if (unbacked.length) {
    titleBad++;
    console.log(`  MISMATCH ${l.asin}  ${l.kdpTitle.slice(0, 74)}`);
    console.log(`           title says ${unbacked.join(", ")}; measured: ${[...m].filter((x) => /^\d+$/.test(x)).sort().join(", ")}`);
  }
}
console.log(titleBad === 0
  ? "  every number in every live title has a measured count behind it"
  : `  ${titleBad} listing(s) carry a number the book does not support`);
