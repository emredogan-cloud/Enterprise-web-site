/**
 * Gate 1 market sample: what is already on the shelf next to a book we are
 * about to put there.
 *
 * Takes the first page of Amazon's book results for each query, merges them,
 * then re-reads the top N as product pages so the sample carries the two
 * fields the search grid does not: the sales rank and the page count. Writes
 * a Markdown table ready to paste into a project's MARKET.md, plus the raw
 * JSON so a later sample can be diffed against this one.
 *
 * Gate 1 asks whether a market exists and where the gap is; it is answered
 * with prices, review counts and ranks, not with an opinion.
 *
 *   node scripts/market/market-sample.mjs --out MARKET-sample.md \
 *     --depth 10 "dudeney puzzles" "mathematical puzzles classic"
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { DEFAULT_DELAY_MS, readProduct, search, sleep } from "./amazon.mjs";

const argv = process.argv.slice(2);
const outFlag = argv.indexOf("--out");
const out = outFlag !== -1 ? argv[outFlag + 1] : null;
const depthFlag = argv.indexOf("--depth");
const depth = depthFlag !== -1 ? Number(argv[depthFlag + 1]) : 10;
const queries = argv.filter(
  (a, i) => !a.startsWith("--") && argv[i - 1] !== "--out" && argv[i - 1] !== "--depth",
);
if (!queries.length) {
  console.error('usage: market-sample.mjs [--out FILE] [--depth N] "query" ["query" …]');
  process.exit(2);
}

const merged = new Map();
for (const [i, q] of queries.entries()) {
  if (i) await sleep(DEFAULT_DELAY_MS);
  process.stderr.write(`searching: ${q}\n`);
  for (const [rank, row] of (await search(q)).entries()) {
    const prev = merged.get(row.asin);
    if (prev) {
      prev.queries.push(q);
      prev.bestRank = Math.min(prev.bestRank, rank + 1);
    } else {
      merged.set(row.asin, { ...row, queries: [q], bestRank: rank + 1 });
    }
  }
}

const ranked = [...merged.values()]
  .filter((r) => !r.sponsored)
  .sort((a, b) => b.queries.length - a.queries.length || a.bestRank - b.bestRank)
  .slice(0, depth);

process.stderr.write(`reading ${ranked.length} product pages for rank and length…\n`);
const rows = [];
for (const [i, r] of ranked.entries()) {
  if (i) await sleep(DEFAULT_DELAY_MS);
  try {
    const p = await readProduct(r.asin);
    rows.push({ ...r, pageCount: p.pageCount, ranks: p.ranks, rating: p.rating ?? r.rating, reviewCount: p.reviewCount ?? r.reviewCount, publicationDate: p.publicationDate, editions: p.editions });
  } catch (err) {
    rows.push({ ...r, error: err.message });
  }
}

const money = (c) => (c == null ? "—" : `$${(c / 100).toFixed(2)}`);
const lines = [
  `Sample taken ${new Date().toISOString()} from amazon.com (US, USD), queries: ${queries.map((q) => `\`${q}\``).join(", ")}.`,
  "",
  "| # | ASIN | Title | Format | Price | Pages | Rating | Reviews | Best Sellers Rank |",
  "|---|---|---|---|---|---|---|---|---|",
];
rows.forEach((r, i) => {
  const rank = r.ranks?.[0] ? `#${r.ranks[0].rank.toLocaleString()} ${r.ranks[0].category}` : "—";
  lines.push(
    `| ${i + 1} | ${r.asin} | ${(r.title ?? "").replace(/\|/g, "／").slice(0, 90)} | ${r.format ?? "—"} | ` +
      `${money(r.priceCents)} | ${r.pageCount ?? "—"} | ${r.rating ?? "—"} | ${r.reviewCount ?? "—"} | ${rank} |`,
  );
});

const priced = rows.map((r) => r.priceCents).filter(Boolean).sort((a, b) => a - b);
const reviewed = rows.map((r) => r.reviewCount).filter((n) => typeof n === "number");
lines.push(
  "",
  `**Prices** (${priced.length} of ${rows.length} priced): low ${money(priced[0])} · median ${money(priced[Math.floor(priced.length / 2)])} · high ${money(priced.at(-1))}.`,
  `**Reviews**: median ${reviewed.length ? reviewed.sort((a, b) => a - b)[Math.floor(reviewed.length / 2)] : "—"}, max ${reviewed.length ? Math.max(...reviewed) : "—"}.`,
  `**Ranked** (has a Best Sellers Rank, i.e. has sold): ${rows.filter((r) => r.ranks?.length).length} of ${rows.length}.`,
);

const md = lines.join("\n") + "\n";
console.log(md);
if (out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, md);
  writeFileSync(out.replace(/\.md$/, ".json"), JSON.stringify({ takenAt: new Date().toISOString(), queries, rows }, null, 2));
  process.stderr.write(`→ ${out}\n`);
}
