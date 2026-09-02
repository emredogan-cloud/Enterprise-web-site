#!/usr/bin/env node
/**
 * Valice Press — per-title pricing engine.
 *
 * Turns a title's physical facts (pages, trim, ink), its format, its channel
 * and a handful of labelled assumptions (ad spend, production hours, target
 * margin) into the numbers a pricing decision actually needs:
 *
 *   - printing cost and KDP's minimum list price
 *   - net contribution per unit and margin at every candidate list price
 *   - the recommended list price (lowest $X.99 that clears the target margin)
 *   - break-even ACOS and the maximum profitable CPC at a given conversion rate
 *   - units to recover the production hours at a founder hourly rate
 *
 * It predicts nothing. Every number is arithmetic over the verified rate card
 * below. Demand is unknown and stays unknown; this script tells you what a
 * price *would* earn, not how many you will sell.
 *
 * Usage:
 *   node scripts/strategy/price-engine.mjs --pages 160 --trim large --ink bw --format paperback
 *   node scripts/strategy/price-engine.mjs --pages 148 --format ebook --channel direct --pd
 *   node scripts/strategy/price-engine.mjs --pages 274 --format large_print --hours 6 --json
 *
 * Options:
 *   --pages N           page count of THIS format (large print: give the large-print count)
 *   --trim regular|large   6x9-class or 8.5x11-class (default regular)
 *   --ink bw|colorStandard|colorPremium   (default bw)
 *   --format ebook|paperback|hardcover|large_print
 *   --channel amazon|direct   (ebook only; print is always amazon)
 *   --pd                title is primarily public domain (Kindle capped at 35%)
 *   --size-mb N         Kindle file size for delivery fee (default 3)
 *   --target-margin F   fraction of list price, e.g. 0.35 (default: 0.35 print, 0.85 direct ebook, 0.60 Kindle)
 *   --cvr F             ad click → order conversion rate (default 0.08)
 *   --hours N           production hours to recover (default 0 = skip)
 *   --hourly N          founder hourly rate for the recovery calc (default 25)
 *   --ad-per-unit N     ad spend attributed per unit sold (default 0)
 *   --candidates a,b,c  explicit list prices to evaluate (default: a $X.99 grid)
 *   --json              machine-readable output
 *
 * ── RATE CARD (verified kdp.amazon.com 2026-09-01; Paddle pricing page) ───
 * Paperback printing, Amazon.com:
 *   B&W regular   24–110p: $2.30 flat | 110–828p: $1.00 + $0.012/p
 *   B&W large     24–110p: $2.84 flat | 110–828p: $1.00 + $0.017/p
 *   Std colour    regular 72–600p: $1.00 + $0.0255/p | large $1.00 + $0.0402/p
 *   Prem colour   regular 42–828p: $1.00 + $0.065/p  | large $1.00 + $0.080/p
 * Hardcover printing, Amazon.com (75–550p; 75–108p B&W = fixed cost only):
 *   B&W regular $5.65 + $0.012/p | B&W large $5.65 + $0.017/p
 *   Premium colour regular $5.65 + $0.065/p | large $5.65 + $0.080/p
 *   Standard colour is NOT offered for hardcover.
 * Print royalty: 60% of list on Amazon marketplaces at list ≥ $9.99, 50% below;
 *   40% Expanded Distribution. Printing cost deducted. KDP minimum list price
 *   = printing cost ÷ royalty rate.
 * Kindle: 70% for $2.99–$12.99 (Amazon.com, from 2026-07-07) less $0.15/MB;
 *   35% otherwise and 35% ONLY for primarily-public-domain titles.
 * Direct (Paddle MoR): list − (5% + $0.50).
 * If the KDP research in KDP_PRODUCTION_MASTER_PLAN_TR.md records a change to
 * any of these, change it HERE and nowhere else.
 */

const args = parseArgs(process.argv.slice(2));

const PAPERBACK = {
  bw: {
    regular: { flatUnder110: 2.3, fixed: 1.0, perPage: 0.012, min: 24, max: 828 },
    large: { flatUnder110: 2.84, fixed: 1.0, perPage: 0.017, min: 24, max: 828 },
  },
  colorStandard: {
    regular: { fixed: 1.0, perPage: 0.0255, min: 72, max: 600 },
    large: { fixed: 1.0, perPage: 0.0402, min: 72, max: 600 },
  },
  colorPremium: {
    regular: { fixed: 1.0, perPage: 0.065, min: 42, max: 828 },
    large: { fixed: 1.0, perPage: 0.08, min: 42, max: 828 },
  },
};

const HARDCOVER = {
  bw: {
    regular: { fixed: 5.65, perPage: 0.012, min: 75, max: 550 },
    large: { fixed: 5.65, perPage: 0.017, min: 75, max: 550 },
  },
  colorPremium: {
    regular: { fixed: 5.65, perPage: 0.065, min: 75, max: 550 },
    large: { fixed: 5.65, perPage: 0.08, min: 75, max: 550 },
  },
};

const PADDLE = { pct: 0.05, flat: 0.5 };
const KINDLE = { band70: [2.99, 12.99], deliveryPerMB: 0.15 };
const PRINT_RATE = (list) => (list >= 9.99 ? 0.6 : 0.5);

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function num(v, fallback) {
  if (v === undefined || v === true) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fail(msg) {
  console.error(`price-engine: ${msg}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Printing cost
// ---------------------------------------------------------------------------

function printingCost({ format, pages, trim, ink }) {
  if (format === "ebook") return { cost: 0, note: "digital" };
  if (format === "hardcover") {
    const table = HARDCOVER[ink === "bw" ? "bw" : "colorPremium"];
    if (ink === "colorStandard")
      return { cost: NaN, note: "standard colour is not offered for hardcover — choose bw or colorPremium" };
    const c = table[trim];
    if (pages < c.min || pages > c.max)
      return { cost: NaN, note: `hardcover page count must be ${c.min}–${c.max} (got ${pages})` };
    if (ink === "bw" && pages <= 108) return { cost: c.fixed, note: "75–108p B&W hardcover = fixed cost only" };
    return { cost: c.fixed + pages * c.perPage, note: "" };
  }
  // paperback and large_print are both paperback economics; large print
  // always uses the large trim class.
  const c = PAPERBACK[ink][format === "large_print" ? "large" : trim];
  if (pages < c.min || pages > c.max)
    return { cost: NaN, note: `paperback page count must be ${c.min}–${c.max} for ${ink} (got ${pages})` };
  if (ink === "bw" && pages <= 110) return { cost: c.flatUnder110, note: "≤110p B&W flat rate" };
  return { cost: c.fixed + pages * c.perPage, note: "" };
}

// ---------------------------------------------------------------------------
// Net per unit at a given list price
// ---------------------------------------------------------------------------

function netAt(list, cfg, printing) {
  if (cfg.format === "ebook") {
    if (cfg.channel === "direct") {
      const net = list - (list * PADDLE.pct + PADDLE.flat);
      return { net, tier: "Paddle 5%+$0.50", printing: 0 };
    }
    const inBand = list >= KINDLE.band70[0] && list <= KINDLE.band70[1];
    if (cfg.pd || !inBand) return { net: list * 0.35, tier: cfg.pd ? "Kindle 35% (public domain)" : "Kindle 35% (outside band)", printing: 0 };
    return { net: list * 0.7 - cfg.sizeMB * KINDLE.deliveryPerMB, tier: "Kindle 70%", printing: 0 };
  }
  const rate = PRINT_RATE(list);
  return { net: list * rate - printing, tier: `KDP print ${Math.round(rate * 100)}%`, printing };
}

function candidateGrid(cfg, printing) {
  if (cfg.candidates) return cfg.candidates;
  if (cfg.format === "ebook") return [2.99, 4.99, 6.99, 7.99, 8.99, 9.99, 11.99, 12.99, 14.99, 16.99, 19.99, 24.99];
  // print: start at the KDP minimum, step $X.99 up to a sane ceiling
  const minList = Math.ceil((printing / 0.6) * 100) / 100;
  const start = Math.max(8.99, Math.floor(minList) + 0.99);
  const grid = [];
  for (let p = start; p <= 59.99; p += 1) grid.push(Math.round(p * 100) / 100);
  return grid;
}

// ---------------------------------------------------------------------------

function main() {
  const cfg = {
    pages: num(args.pages, NaN),
    trim: args.trim ?? "regular",
    ink: args.ink ?? "bw",
    format: args.format ?? "paperback",
    channel: args.channel ?? "amazon",
    pd: Boolean(args.pd),
    sizeMB: num(args["size-mb"], 3),
    cvr: num(args.cvr, 0.08),
    hours: num(args.hours, 0),
    hourly: num(args.hourly, 25),
    adPerUnit: num(args["ad-per-unit"], 0),
    candidates: args.candidates ? String(args.candidates).split(",").map(Number) : null,
  };
  if (!["ebook", "paperback", "hardcover", "large_print"].includes(cfg.format)) fail(`unknown --format ${cfg.format}`);
  if (!["regular", "large"].includes(cfg.trim)) fail(`unknown --trim ${cfg.trim}`);
  if (!["bw", "colorStandard", "colorPremium"].includes(cfg.ink)) fail(`unknown --ink ${cfg.ink}`);
  if (cfg.format !== "ebook" && !Number.isFinite(cfg.pages)) fail("--pages is required for print formats");
  if (cfg.format !== "ebook") cfg.channel = "amazon";

  const defaultMargin = cfg.format === "ebook" ? (cfg.channel === "direct" ? 0.85 : 0.6) : 0.35;
  cfg.targetMargin = num(args["target-margin"], defaultMargin);

  const pc = printingCost(cfg);
  if (Number.isNaN(pc.cost)) fail(pc.note);
  const printing = pc.cost;
  const kdpMinList = cfg.format === "ebook" ? (cfg.channel === "direct" ? 0 : 0.99) : Math.ceil((printing / PRINT_RATE(9.99)) * 100) / 100;

  const rows = candidateGrid(cfg, printing).map((list) => {
    const { net, tier } = netAt(list, cfg, printing);
    const afterAds = net - cfg.adPerUnit;
    const margin = net / list;
    const breakEvenAcos = net / list; // ACOS at which ad spend equals contribution
    const maxCpc = net * cfg.cvr; // max CPC that still breaks even at this CVR
    const unitsToRecover = cfg.hours > 0 && afterAds > 0 ? Math.ceil((cfg.hours * cfg.hourly) / afterAds) : null;
    return {
      list,
      tier,
      printing: Number(printing.toFixed(2)),
      net: Number(net.toFixed(2)),
      netAfterAds: Number(afterAds.toFixed(2)),
      marginPct: Number((margin * 100).toFixed(1)),
      breakEvenAcosPct: Number((breakEvenAcos * 100).toFixed(1)),
      maxCpcAtCvr: Number(maxCpc.toFixed(2)),
      unitsToRecoverHours: unitsToRecover,
      clearsTarget: margin >= cfg.targetMargin && list >= kdpMinList,
    };
  });

  const recommended = rows.find((r) => r.clearsTarget) ?? null;
  const minViable = rows.find((r) => r.net > 0 && r.list >= kdpMinList) ?? null;

  const result = {
    inputs: cfg,
    printingCost: Number(printing.toFixed(2)),
    printingNote: pc.note,
    kdpMinimumListPrice: kdpMinList,
    targetMargin: cfg.targetMargin,
    recommendedListPrice: recommended?.list ?? null,
    minimumViableListPrice: minViable?.list ?? null,
    rows,
    assumptions: [
      "[A] Conversion rate from ad click to order (--cvr) is an assumption; Valice has no measured CVR yet.",
      "[A] Ad spend per unit (--ad-per-unit) is a planning input, not an observed cost.",
      "[A] Founder hourly rate (--hourly) is a planning input for the recovery calculation only.",
      "[V] All rates: KDP printing/royalty and Kindle bands as verified 2026-09-01; Paddle 5%+$0.50.",
      "[S] Demand is not modelled. A higher price that clears the margin target may sell fewer units; test in 30-day steps.",
    ],
  };

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const USD = (n) => (n == null ? "—" : `$${n.toFixed(2)}`);
  console.log(`\nprice-engine — ${cfg.format}${cfg.format === "ebook" ? ` (${cfg.channel})` : ""}, ${cfg.pages || "n/a"}p, ${cfg.trim}, ${cfg.ink}${cfg.pd ? ", PUBLIC DOMAIN" : ""}`);
  console.log(`printing cost      : ${USD(printing)} ${pc.note ? `(${pc.note})` : ""}`);
  if (cfg.format !== "ebook") console.log(`KDP minimum list   : ${USD(kdpMinList)}`);
  console.log(`target margin      : ${(cfg.targetMargin * 100).toFixed(0)}%   ad/unit: ${USD(cfg.adPerUnit)}   CVR: ${(cfg.cvr * 100).toFixed(0)}%${cfg.hours ? `   hours: ${cfg.hours} @ $${cfg.hourly}/h` : ""}`);
  console.log(`recommended list   : ${recommended ? USD(recommended.list) : "none clears target"}`);
  console.log(`minimum viable list: ${minViable ? USD(minViable.list) : "none"}\n`);
  const head = ["list", "tier", "net", "after ads", "margin", "BE ACOS", "max CPC", cfg.hours ? "units→recover" : "", "ok"].filter(Boolean);
  console.log(head.join(" | "));
  for (const r of rows) {
    const cells = [
      USD(r.list).padStart(7),
      r.tier.padEnd(26),
      USD(r.net).padStart(7),
      USD(r.netAfterAds).padStart(9),
      `${r.marginPct}%`.padStart(6),
      `${r.breakEvenAcosPct}%`.padStart(7),
      USD(r.maxCpcAtCvr).padStart(7),
      cfg.hours ? String(r.unitsToRecoverHours ?? "—").padStart(13) : "",
      r.clearsTarget ? "✓" : " ",
    ].filter((c) => c !== "");
    console.log(cells.join(" | "));
  }
  console.log("\nassumptions:");
  for (const a of result.assumptions) console.log(`  ${a}`);
}

main();
