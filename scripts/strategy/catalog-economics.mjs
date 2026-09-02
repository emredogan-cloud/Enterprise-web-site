#!/usr/bin/env node
/**
 * Valice Press — real per-title catalogue economics.
 *
 * Unlike `unit-economics.mjs` (generic archetypes), this reads the LIVE
 * catalogue out of Postgres and prices every real format against KDP's
 * actual rate card, using each book's real page count, trim class and ink.
 *
 *   node --env-file=.env scripts/strategy/catalog-economics.mjs
 *   node --env-file=.env scripts/strategy/catalog-economics.mjs --csv > CATALOG_ECONOMICS_FINAL.csv
 *   node --env-file=.env scripts/strategy/catalog-economics.mjs --ladder-csv > FORMAT_LADDER_MATRIX.csv
 *
 * ── RATE CARD, all VERIFIED at kdp.amazon.com on 2026-09-01 ────────────────
 * Paperback printing, Amazon.com:
 *   B&W regular   24-110p: $2.30 flat   |  110-828p: $1.00 + $0.012/p
 *   B&W large     24-110p: $2.84 flat   |  110-828p: $1.00 + $0.017/p
 *   Std colour regular 72-600p: $1.00 + $0.0255/p ; large: $1.00 + $0.0402/p
 *   Prem colour regular 42-828p: $1.00 + $0.065/p ; large: $1.00 + $0.080/p
 * Hardcover printing, Amazon.com (75-550p; 75-108p B&W = fixed cost only):
 *   B&W regular $5.65 + $0.012/p  |  B&W large $5.65 + $0.017/p
 *   Premium colour regular $5.65 + $0.065/p | large $5.65 + $0.080/p
 *   NOTE: standard colour is NOT offered for hardcover.
 * Print royalty: 60% of list on Amazon marketplaces at list >= $9.99,
 *   50% below that; 40% on Expanded Distribution. Less printing cost.
 * Kindle: 70% for $2.99-$12.99 (from 2026-07-07) less $0.15/MB delivery;
 *   35% otherwise, and 35% ONLY for primarily-public-domain titles.
 * Direct (Paddle MoR): list - (5% + $0.50).
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Trim class and ink are DECLARED below because they live in the book
 * production repos, not in this database. Each value is sourced from a real
 * artefact in /home/emre/Downloads/MY-DİGİTAL-BOOK — see `evidence`.
 */

import { neon } from "@neondatabase/serverless";

const USD = (n) => (n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`);

// ---------------------------------------------------------------------------
// Rate card
// ---------------------------------------------------------------------------

const PAPERBACK = {
  bw: {
    regular: { flatUnder110: 2.3, fixed: 1.0, perPage: 0.012 },
    large: { flatUnder110: 2.84, fixed: 1.0, perPage: 0.017 },
  },
  colorStandard: {
    regular: { fixed: 1.0, perPage: 0.0255 },
    large: { fixed: 1.0, perPage: 0.0402 },
  },
  colorPremium: {
    regular: { fixed: 1.0, perPage: 0.065 },
    large: { fixed: 1.0, perPage: 0.08 },
  },
};

const HARDCOVER = {
  bw: {
    regular: { fixed: 5.65, perPage: 0.012 },
    large: { fixed: 5.65, perPage: 0.017 },
  },
  colorPremium: {
    regular: { fixed: 5.65, perPage: 0.065 },
    large: { fixed: 5.65, perPage: 0.08 },
  },
};

const PADDLE = { pct: 0.05, flat: 0.5 };
const KINDLE = { band70: [2.99, 12.99], deliveryPerMB: 0.15 };

function paperbackPrinting(pages, ink, trim) {
  const c = PAPERBACK[ink][trim];
  if (ink === "bw" && pages <= 110) return c.flatUnder110;
  return c.fixed + pages * c.perPage;
}

function hardcoverPrinting(pages, ink, trim) {
  const c = HARDCOVER[ink === "bw" ? "bw" : "colorPremium"][trim];
  if (ink === "bw" && pages >= 75 && pages <= 108) return c.fixed;
  return c.fixed + pages * c.perPage;
}

const printRoyaltyRate = (list) => (list >= 9.99 ? 0.6 : 0.5);

function kindleNet(list, sizeMB = 3, { publicDomain = false } = {}) {
  const inBand = list >= KINDLE.band70[0] && list <= KINDLE.band70[1];
  if (publicDomain || !inBand) return { net: list * 0.35, tier: "35%" };
  return { net: list * 0.7 - sizeMB * KINDLE.deliveryPerMB, tier: "70%" };
}

const directNet = (list) => list - (list * PADDLE.pct + PADDLE.flat);

// ---------------------------------------------------------------------------
// Declared production facts (from the book repos, not the DB)
// ---------------------------------------------------------------------------

const PRODUCTION = {
  "codex-mythologica": {
    trim: "regular", ink: "bw",
    evidence: "CASE_LAMINATE_6.000x9.000_329_BW_CREAM_en_US (KDP hardcover cover template filename)",
  },
  "codex-bestiarium": {
    trim: "regular", ink: "bw",
    evidence: "01_SOURCE/book.json 'black and white'; 6x9 throughout docs",
  },
  "codex-enigmatica": {
    trim: "regular", ink: "bw",
    evidence: "project_config.json ink:'black', trimClass:'regular'",
  },
  "the-great-book-of-world-myths": {
    trim: "regular", ink: "bw",
    evidence: "config colorMode:'bw'; pageSize 432x648pt = 6x9in",
  },
  "the-great-book-of-world-games": {
    trim: "large", ink: "bw",
    evidence: "project config ink:'black', trimClass:'large'",
  },
  "the-myth-hunters-field-book": {
    trim: "large", ink: "bw",
    evidence: "project config ink:'black', trimClass:'large'",
  },
  "korean-hangul-handwriting-workbook": {
    trim: "large", ink: "bw",
    evidence: "project_config.json 8.5x11in, founder-approved (DECISIONS K32)",
  },
  meditations: {
    trim: "regular", ink: "bw",
    evidence: "digital-only edition; no print edition exists",
    publicDomain: true,
  },
};

// Large-print editions always use a larger trim than their base edition.
const LARGE_PRINT_TRIM = "large";

// ---------------------------------------------------------------------------

async function main() {
  const mode = process.argv.includes("--csv")
    ? "csv"
    : process.argv.includes("--ladder-csv")
      ? "ladder"
      : "report";

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Run with: node --env-file=.env ...");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql`
    select b.slug, b.title, bf.format, bf.price_cents, bf.availability,
           bf.fulfillment, bf.amazon_asin, bf.page_count,
           (bf.master_file_key is not null) as has_master
    from books b join book_formats bf on bf.book_id = b.id
    order by b.slug,
      case bf.format when 'ebook' then 1 when 'paperback' then 2
                     when 'hardcover' then 3 else 4 end`;

  const analysed = rows.map((r) => {
    const prod = PRODUCTION[r.slug] ?? { trim: "regular", ink: "bw", evidence: "UNKNOWN — assumed" };
    const list = r.price_cents == null ? null : r.price_cents / 100;
    const pages = r.page_count;
    let printing = null;
    let net = null;
    let channel = r.fulfillment;

    if (list != null) {
      if (r.format === "ebook") {
        net = channel === "direct"
          ? directNet(list)
          : kindleNet(list, 3, { publicDomain: !!prod.publicDomain }).net;
      } else if (r.format === "paperback" || r.format === "large_print") {
        const trim = r.format === "large_print" ? LARGE_PRINT_TRIM : prod.trim;
        printing = paperbackPrinting(pages, prod.ink, trim);
        net = list * printRoyaltyRate(list) - printing;
      } else if (r.format === "hardcover") {
        printing = hardcoverPrinting(pages, prod.ink, prod.trim);
        net = list * printRoyaltyRate(list) - printing;
      }
    }
    return { ...r, list, printing, net, trim: prod.trim, ink: prod.ink,
             margin: list && net != null ? net / list : null,
             evidence: prod.evidence };
  });

  if (mode === "csv") {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    console.log(["Slug","Title","Format","Channel","Availability","ASIN","Pages","Trim","Ink",
      "ListUSD","PrintingCostUSD","NetPerUnitUSD","MarginPct","HasMasterFile","SpecEvidence"]
      .map(esc).join(","));
    for (const a of analysed) {
      console.log([a.slug,a.title,a.format,a.fulfillment,a.availability,a.amazon_asin ?? "PENDING",
        a.page_count,a.trim,a.ink,a.list?.toFixed(2) ?? "",a.printing?.toFixed(2) ?? "",
        a.net?.toFixed(2) ?? "",a.margin != null ? (a.margin*100).toFixed(1) : "",
        a.has_master,a.evidence].map(esc).join(","));
    }
    return;
  }

  // -------------------------------------------------------------------------
  // Format-ladder opportunity: what is missing, and what would it actually pay?
  // -------------------------------------------------------------------------
  const bySlug = new Map();
  for (const a of analysed) {
    if (!bySlug.has(a.slug)) bySlug.set(a.slug, { title: a.title, formats: new Map() });
    bySlug.get(a.slug).formats.set(a.format, a);
  }

  const LADDER_HOURS = 3; // cover + setup + proof on an existing interior
  const opportunities = [];
  for (const [slug, bk] of bySlug) {
    const prod = PRODUCTION[slug] ?? {};
    const pb = bk.formats.get("paperback");
    const hc = bk.formats.get("hardcover");
    const lp = bk.formats.get("large_print");
    if (!pb) continue; // no print interior to derive from
    const pages = pb.page_count;

    // Hardcover
    if (!hc || hc.list == null) {
      const eligible = pages >= 75 && pages <= 550;
      // Price the hardcover at the observed house ratio (~1.5x paperback).
      const suggested = Math.round((pb.list * 1.5 - 0.01) * 100) / 100;
      const printing = hardcoverPrinting(pages, prod.ink ?? "bw", prod.trim ?? "regular");
      const net = suggested * printRoyaltyRate(suggested) - printing;
      opportunities.push({
        slug, title: bk.title, missing: "hardcover", eligible,
        reason: eligible ? "" : `page count ${pages} outside KDP hardcover 75-550`,
        suggested, printing, net, uplift: net - (pb.net ?? 0),
        perHour: net / LADDER_HOURS, exists: !!hc,
      });
    }
    // Large print
    if (!lp || lp.list == null) {
      // Large print re-typesets: assume ~1.75x the base page count, large trim.
      const lpPages = Math.round(pages * 1.75);
      const suggested = Math.round((pb.list * 1.35 - 0.01) * 100) / 100;
      const printing = paperbackPrinting(lpPages, prod.ink ?? "bw", "large");
      const net = suggested * printRoyaltyRate(suggested) - printing;
      opportunities.push({
        slug, title: bk.title, missing: "large_print", eligible: lpPages <= 828,
        reason: lpPages <= 828 ? "" : `projected ${lpPages}p exceeds 828`,
        suggested, printing, net, uplift: net - (pb.net ?? 0),
        perHour: net / (LADDER_HOURS * 2), // re-typesetting costs more than a cover
        exists: !!lp, projectedPages: lpPages,
      });
    }
  }

  if (mode === "ladder") {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    console.log(["Slug","Title","MissingFormat","KDPEligible","Blocker","SuggestedListUSD",
      "PrintingCostUSD","NetPerUnitUSD","EstHours","NetPerHourUSD","Recommendation"]
      .map(esc).join(","));
    for (const o of opportunities) {
      const hours = o.missing === "large_print" ? LADDER_HOURS * 2 : LADDER_HOURS;
      const rec = !o.eligible ? "NO — ineligible"
        : o.net < 3 ? "LATER — thin contribution"
        : o.net >= 6 ? "YES" : "TEST";
      console.log([o.slug,o.title,o.missing,o.eligible,o.reason,o.suggested.toFixed(2),
        o.printing.toFixed(2),o.net.toFixed(2),hours,o.perHour.toFixed(2),rec].map(esc).join(","));
    }
    return;
  }

  // -------------------------------------------------------------------------
  // Human report
  // -------------------------------------------------------------------------
  console.log("=".repeat(100));
  console.log("VALICE PRESS — REAL CATALOGUE ECONOMICS  (live DB × verified KDP rate card)");
  console.log("=".repeat(100));

  let cur = null;
  for (const a of analysed) {
    if (a.slug !== cur) {
      cur = a.slug;
      const p = PRODUCTION[a.slug] ?? {};
      console.log(`\n${a.title}  [${a.slug}]   trim=${p.trim ?? "?"} ink=${p.ink ?? "?"}`);
      console.log(`  spec evidence: ${p.evidence ?? "UNKNOWN"}`);
      console.log("  " + "-".repeat(94));
      console.log("  " + "format".padEnd(13) + "chan".padEnd(9) + "avail".padEnd(13) +
        "pages".padStart(6) + "list".padStart(9) + "print".padStart(9) +
        "net".padStart(9) + "margin".padStart(9) + "  ASIN");
    }
    console.log("  " + a.format.padEnd(13) + a.fulfillment.padEnd(9) +
      a.availability.padEnd(13) + String(a.page_count ?? "-").padStart(6) +
      (a.list != null ? USD(a.list) : "—").padStart(9) +
      (a.printing != null ? USD(a.printing) : "—").padStart(9) +
      (a.net != null ? USD(a.net) : "—").padStart(9) +
      (a.margin != null ? `${(a.margin * 100).toFixed(1)}%` : "—").padStart(9) +
      "  " + (a.amazon_asin ?? "PENDING"));
  }

  console.log("\n\n" + "=".repeat(100));
  console.log("PRICE-TEST CANDIDATES — ebooks priced below the 70% band's reach");
  console.log("=".repeat(100));
  for (const a of analysed.filter((x) => x.format === "ebook" && x.list != null && x.list < 9.99)) {
    console.log(`\n  ${a.title} — ${a.fulfillment} @ ${USD(a.list)}, ${a.page_count}p → net ${USD(a.net)}`);
    for (const test of [6.99, 9.99, 12.99]) {
      const n = a.fulfillment === "direct"
        ? directNet(test)
        : kindleNet(test, 3, { publicDomain: !!PRODUCTION[a.slug]?.publicDomain }).net;
      const breakEvenVol = a.net / n; // fraction of current volume needed to break even
      console.log(`      @ ${USD(test).padStart(7)} → net ${USD(n).padStart(7)}  ` +
        `(${(n / a.net).toFixed(2)}× per unit; breaks even at ${(breakEvenVol * 100).toFixed(0)}% of current volume)`);
    }
  }

  console.log("\n\n" + "=".repeat(100));
  console.log("FORMAT-LADDER OPPORTUNITIES — missing formats, real contribution");
  console.log("=".repeat(100));
  console.log("\n  " + "book".padEnd(34) + "missing".padEnd(13) + "list".padStart(9) +
    "print".padStart(9) + "net".padStart(9) + "$/hr".padStart(8) + "  verdict");
  console.log("  " + "-".repeat(94));
  for (const o of opportunities.sort((a, b) => b.net - a.net)) {
    const rec = !o.eligible ? `NO (${o.reason})`
      : o.net < 3 ? "LATER — thin"
      : o.net >= 6 ? "YES" : "TEST";
    console.log("  " + o.title.slice(0, 33).padEnd(34) + o.missing.padEnd(13) +
      USD(o.suggested).padStart(9) + USD(o.printing).padStart(9) +
      USD(o.net).padStart(9) + o.perHour.toFixed(2).padStart(8) + "  " + rec);
  }

  console.log(`
  NOTE ON HARDCOVER: KDP's hardcover fixed printing cost is $5.65, versus
  $1.00 for a paperback over 110 pages. A hardcover is therefore NOT simply
  "the same interior at double the price" — the fixed cost eats most of the
  price difference on short books. On a 124-page large-trim workbook the
  paperback nets ${USD(0.6 * 12.99 - paperbackPrinting(124, "bw", "large"))} and the hardcover ${USD(0.6 * 21.99 - hardcoverPrinting(124, "bw", "large"))} — a real gain, but
  far from the 2x that a paperback-cost model would predict.`);

  console.log("\n" + "=".repeat(100));
  console.log("CHANNEL COMPARISON — every direct-sold ebook, both ways");
  console.log("=".repeat(100));
  for (const a of analysed.filter((x) => x.format === "ebook" && x.list != null)) {
    const pd = !!PRODUCTION[a.slug]?.publicDomain;
    const amz = kindleNet(a.list, 3, { publicDomain: pd });
    const dir = directNet(a.list);
    console.log(`  ${a.title.slice(0, 34).padEnd(35)} @ ${USD(a.list).padStart(7)}  ` +
      `Amazon ${USD(amz.net).padStart(7)} (${amz.tier})  Direct ${USD(dir).padStart(7)}  ` +
      `uplift ${((dir / amz.net - 1) * 100).toFixed(0).padStart(4)}%${pd ? "   ← public domain, 35% cap" : ""}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
