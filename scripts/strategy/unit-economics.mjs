#!/usr/bin/env node
/**
 * Valice Press — publishing unit economics model.
 *
 * Research support for VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.
 * Pure arithmetic over VERIFIED platform rates (see SOURCES below). It predicts
 * nothing: it converts a revenue target into the units, titles and ad spend the
 * target requires, so the founder can judge whether that demand is plausible.
 *
 * Run: node scripts/strategy/unit-economics.mjs
 *      node scripts/strategy/unit-economics.mjs --json
 *
 * SOURCES (all verified 2026-08-31, see the report's source table):
 *  - KDP eBook royalty: 70% band $2.99–$12.99 on Amazon.com from 2026-07-07,
 *    less delivery cost $0.15/MB (US). 35% otherwise, and 35% ONLY for books
 *    consisting primarily of public-domain content.
 *  - KDP paperback: 60% of list on Amazon marketplaces (50% under $9.99),
 *    40% on Expanded Distribution, less printing cost.
 *  - US printing: fixed $1.00 + per-page — B&W $0.012, standard colour
 *    $0.0255, premium colour $0.065.
 *  - Paddle (this store's MoR): 5% + $0.50 per transaction.
 */

const USD = (n) => `$${n.toFixed(2)}`;
const PCT = (n) => `${(n * 100).toFixed(1)}%`;

// ---------------------------------------------------------------------------
// Platform rate cards (VERIFIED)
// ---------------------------------------------------------------------------

const KDP = {
  ebook: {
    royalty70: 0.70,
    royalty35: 0.35,
    band70: { min: 2.99, max: 12.99 }, // Amazon.com, from 2026-07-07
    deliveryPerMB: 0.15, // US
  },
  print: {
    amazonRateHigh: 0.60, // list >= $9.99
    amazonRateLow: 0.50, // list <  $9.99
    expandedRate: 0.40,
    fixed: 1.0,
    perPage: { bw: 0.012, colorStandard: 0.0255, colorPremium: 0.065 },
  },
};

const PADDLE = { pct: 0.05, flat: 0.5 };

// ---------------------------------------------------------------------------
// Channel margin functions
// ---------------------------------------------------------------------------

/** Amazon Kindle royalty. `pd` forces the 35% tier (public-domain rule). */
function amazonEbook(list, sizeMB = 2, { pd = false } = {}) {
  const in70 = list >= KDP.ebook.band70.min && list <= KDP.ebook.band70.max;
  if (pd || !in70) return { net: list * KDP.ebook.royalty35, tier: "35%" };
  const delivery = sizeMB * KDP.ebook.deliveryPerMB;
  return { net: list * KDP.ebook.royalty70 - delivery, tier: "70%" };
}

/** Amazon print royalty. */
function amazonPrint(list, pages, ink = "bw", { expanded = false } = {}) {
  const printing = KDP.print.fixed + pages * KDP.print.perPage[ink];
  const rate = expanded
    ? KDP.print.expandedRate
    : list >= 9.99
      ? KDP.print.amazonRateHigh
      : KDP.print.amazonRateLow;
  return { net: list * rate - printing, printing, rate };
}

/** Direct sale on valicepress.com through Paddle. */
function direct(list) {
  return { net: list - (list * PADDLE.pct + PADDLE.flat) };
}

// ---------------------------------------------------------------------------
// Product archetypes — the shapes Valice can actually build
// ---------------------------------------------------------------------------

const ARCHETYPES = [
  {
    id: "workbook-pb",
    label: "Practice workbook — paperback, 120p B&W",
    channel: "Amazon",
    calc: () => amazonPrint(12.99, 120, "bw"),
    list: 12.99,
    hours: 14,
  },
  {
    id: "workbook-hc",
    label: "Practice workbook — hardcover companion, 120p B&W",
    channel: "Amazon",
    calc: () => amazonPrint(21.99, 120, "bw"),
    list: 21.99,
    hours: 3, // derivative of the paperback
  },
  {
    id: "illustrated-std",
    label: "Illustrated reference — 200p STANDARD colour",
    channel: "Amazon",
    calc: () => amazonPrint(24.99, 200, "colorStandard"),
    list: 24.99,
    hours: 90,
  },
  {
    id: "illustrated-prem",
    label: "Illustrated reference — 200p PREMIUM colour (trap)",
    channel: "Amazon",
    calc: () => amazonPrint(24.99, 200, "colorPremium"),
    list: 24.99,
    hours: 90,
  },
  {
    id: "ebook-amz-499",
    label: "eBook on Amazon @ $4.99",
    channel: "Amazon",
    calc: () => amazonEbook(4.99),
    list: 4.99,
    hours: 40,
  },
  {
    id: "ebook-amz-999",
    label: "eBook on Amazon @ $9.99",
    channel: "Amazon",
    calc: () => amazonEbook(9.99),
    list: 9.99,
    hours: 40,
  },
  {
    id: "ebook-amz-1299",
    label: "eBook on Amazon @ $12.99 (new 2026 ceiling)",
    channel: "Amazon",
    calc: () => amazonEbook(12.99),
    list: 12.99,
    hours: 40,
  },
  {
    id: "ebook-direct-999",
    label: "eBook direct on Valice @ $9.99",
    channel: "Direct",
    calc: () => direct(9.99),
    list: 9.99,
    hours: 40,
  },
  {
    id: "pd-amz-999",
    label: "Annotated public-domain edition on Amazon @ $9.99 (35% cap)",
    channel: "Amazon",
    calc: () => amazonEbook(9.99, 2, { pd: true }),
    list: 9.99,
    hours: 25,
  },
  {
    id: "pd-direct-999",
    label: "Annotated public-domain edition direct @ $9.99",
    channel: "Direct",
    calc: () => direct(9.99),
    list: 9.99,
    hours: 25,
  },
  {
    id: "flagship-direct-79",
    label: "Flagship high-content guide direct @ $79",
    channel: "Direct",
    calc: () => direct(79),
    list: 79,
    hours: 220,
  },
  {
    id: "bundle-direct-149",
    label: "Series bundle direct @ $149",
    channel: "Direct",
    calc: () => direct(149),
    list: 149,
    hours: 12, // repackaging existing assets
  },
];

// ---------------------------------------------------------------------------
// Revenue-target inversion
// ---------------------------------------------------------------------------

/**
 * How many units per month does a target require, given a product mix?
 * `mix` entries: { archetype, share } where share sums to 1.
 */
function unitsForTarget(monthlyTarget, mix) {
  const blendedNet = mix.reduce((sum, m) => {
    const a = ARCHETYPES.find((x) => x.id === m.archetype);
    return sum + a.calc().net * m.share;
  }, 0);
  return { blendedNet, units: monthlyTarget / blendedNet };
}

/** Break-even ACOS: the share of the sale price the royalty represents. */
function breakEvenAcos(net, list) {
  return net / list;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const asJson = process.argv.includes("--json");
const out = { archetypes: [], targets: [], portfolio: [] };

function hr(title) {
  if (!asJson) console.log(`\n${"=".repeat(78)}\n${title}\n${"=".repeat(78)}`);
}

hr("1. UNIT ECONOMICS BY PRODUCT ARCHETYPE");
if (!asJson) {
  console.log(
    "archetype".padEnd(52) +
      "list".padStart(9) +
      "net".padStart(9) +
      "margin".padStart(9) +
      "$/hr".padStart(9),
  );
  console.log("-".repeat(88));
}
for (const a of ARCHETYPES) {
  const { net } = a.calc();
  const margin = net / a.list;
  const perHour = net / a.hours; // per unit sold, per production hour
  out.archetypes.push({ id: a.id, list: a.list, net, margin, hours: a.hours });
  if (!asJson) {
    console.log(
      a.label.padEnd(52) +
        USD(a.list).padStart(9) +
        USD(net).padStart(9) +
        PCT(margin).padStart(9) +
        perHour.toFixed(3).padStart(9),
    );
  }
}

hr("2. THE SAME BOOK, BOTH CHANNELS  (why the storefront exists)");
if (!asJson) {
  for (const list of [4.99, 9.99, 12.99]) {
    const amz = amazonEbook(list);
    const dir = direct(list);
    const pd = amazonEbook(list, 2, { pd: true });
    console.log(
      `  $${list.toFixed(2)} ebook — Amazon ${USD(amz.net)} (${amz.tier})   ` +
        `Direct ${USD(dir.net)}   uplift ${PCT(dir.net / amz.net - 1)}` +
        `   | if public domain, Amazon pays only ${USD(pd.net)} → uplift ${PCT(dir.net / pd.net - 1)}`,
    );
  }
}

hr("3. BREAK-EVEN ACOS BY ARCHETYPE  (how much ad room each product has)");
if (!asJson) {
  for (const a of ARCHETYPES.filter((x) => x.channel === "Amazon")) {
    const { net } = a.calc();
    console.log(
      `  ${a.label.padEnd(52)} break-even ACOS ${PCT(breakEvenAcos(net, a.list)).padStart(7)}` +
        `   → max profitable CPC at 8% CVR: ${USD((net * 0.08) / 1)}`,
    );
  }
}

// ---------------------------------------------------------------------------

hr("4. WHAT EACH REVENUE TARGET REQUIRES");

const MIXES = {
  "A · Amazon workbook factory (print-led)": [
    { archetype: "workbook-pb", share: 0.7 },
    { archetype: "workbook-hc", share: 0.3 },
  ],
  "C · Micro-niche low-content": [{ archetype: "workbook-pb", share: 1.0 }],
  "D · Public domain, direct-first": [{ archetype: "pd-direct-999", share: 1.0 }],
  "D' · Public domain, Amazon-only": [{ archetype: "pd-amz-999", share: 1.0 }],
  "B · High-content flagship (direct)": [
    { archetype: "flagship-direct-79", share: 0.8 },
    { archetype: "bundle-direct-149", share: 0.2 },
  ],
  "E · Hybrid (recommended)": [
    { archetype: "workbook-pb", share: 0.4 },
    { archetype: "workbook-hc", share: 0.12 },
    { archetype: "illustrated-std", share: 0.08 },
    { archetype: "ebook-direct-999", share: 0.15 },
    { archetype: "pd-direct-999", share: 0.15 },
    { archetype: "flagship-direct-79", share: 0.07 },
    { archetype: "bundle-direct-149", share: 0.03 },
  ],
};

const TARGETS = [1000, 3000, 5000, 10000, 20000, 50000];

for (const [name, mix] of Object.entries(MIXES)) {
  const { blendedNet } = unitsForTarget(1, mix);
  if (!asJson) {
    console.log(`\n  ${name}`);
    console.log(`  blended contribution per unit: ${USD(blendedNet)}`);
    console.log(
      "    target/mo".padEnd(16) +
        "units/mo".padStart(11) +
        "units/day".padStart(11) +
        "titles @2/day".padStart(15) +
        "titles @0.5/day".padStart(17),
    );
  }
  for (const t of TARGETS) {
    const { units } = unitsForTarget(t, mix);
    const perDay = units / 30.4;
    const row = {
      mix: name,
      target: t,
      units: Math.ceil(units),
      titlesFast: Math.ceil(perDay / 2),
      titlesSlow: Math.ceil(perDay / 0.5),
    };
    out.targets.push(row);
    if (!asJson) {
      console.log(
        `    ${USD(t).padEnd(14)}` +
          Math.ceil(units).toLocaleString().padStart(11) +
          perDay.toFixed(1).padStart(11) +
          Math.ceil(perDay / 2)
            .toLocaleString()
            .padStart(15) +
          Math.ceil(perDay / 0.5)
            .toLocaleString()
            .padStart(17),
      );
    }
  }
}

if (!asJson) {
  console.log(`
  Reading the last two columns: a title selling 2 copies/day is a genuine
  performer in a narrow non-fiction niche; 0.5 copies/day is an ordinary
  mid-list title. They bracket how big the catalogue must be at each target.`);
}

// ---------------------------------------------------------------------------

hr("5. PORTFOLIO REALITY — 20/30/50 quality distribution");

/**
 * Catalogue outcome distribution. Assumption (INFERENCE, not measured):
 * 20% winners, 30% average, 50% weak — the shape repeatedly described in
 * self-publishing, applied here to sales/day per title.
 */
const DIST = [
  { band: "winner", share: 0.2, perDay: 3.0 },
  { band: "average", share: 0.3, perDay: 0.7 },
  { band: "weak", share: 0.5, perDay: 0.1 },
];

const hybridNet = unitsForTarget(1, MIXES["E · Hybrid (recommended)"]).blendedNet;

for (const catalog of [10, 30, 50, 100, 200, 360]) {
  const unitsPerMonth = DIST.reduce(
    (s, d) => s + catalog * d.share * d.perDay * 30.4,
    0,
  );
  const rev = unitsPerMonth * hybridNet;
  out.portfolio.push({ catalog, unitsPerMonth, revenue: rev });
  if (!asJson) {
    console.log(
      `  ${String(catalog).padStart(4)} titles → ` +
        `${Math.round(unitsPerMonth).toLocaleString().padStart(7)} units/mo → ` +
        `${USD(rev).padStart(12)}/mo gross contribution` +
        `   (${Math.round(catalog * 0.2)} winners carry ${PCT(
          (catalog * 0.2 * 3.0) /
            DIST.reduce((s, d) => s + catalog * d.share * d.perDay, 0),
        )} of it)`,
    );
  }
}

if (!asJson) {
  console.log(`
  NOTE: this is the model's most fragile assumption. The 3.0/0.7/0.1 sales
  rates are ILLUSTRATIVE. Replace them with your own first-12-month data as
  soon as 10 titles have a year of history — that single measurement is worth
  more than every benchmark in the report.`);
}

// ---------------------------------------------------------------------------

hr("6. THROUGHPUT vs KDP UPLOAD CEILING");
if (!asJson) {
  const weeklyPerFormat = 10;
  console.log(
    `  KDP allows ~${weeklyPerFormat} new titles per format per week (ebook / paperback / hardcover).`,
  );
  console.log(
    `  Ceiling ≈ ${weeklyPerFormat * 3} title-format records/week ≈ ${weeklyPerFormat * 3 * 4.33} /month.`,
  );
  console.log(
    `  A 10-books/month plan publishing 3 formats each = 30 records/month.`,
  );
  console.log(
    `  → The platform ceiling is NOT the binding constraint. Attention is.\n`,
  );
  const adHoursPerTitlePerMonth = 0.5;
  for (const n of [10, 30, 60, 120, 360]) {
    console.log(
      `  ${String(n).padStart(4)} live titles → ${(n * adHoursPerTitlePerMonth).toFixed(0).padStart(4)} h/month of ad+listing maintenance ` +
        `(at ${adHoursPerTitlePerMonth} h/title/mo) = ${((n * adHoursPerTitlePerMonth) / 160).toFixed(2)} FTE`,
    );
  }
}

if (asJson) console.log(JSON.stringify(out, null, 2));
