#!/usr/bin/env node
/**
 * Valice Press — revenue-target requirements model.
 *
 * For each monthly contribution target ($1k … $50k) this prints what the
 * target REQUIRES: units, customers, catalogue size, ad budget and production
 * capacity — under explicitly labelled assumptions. It is the inverse of a
 * forecast: it never says "you will earn X"; it says "to earn X you would
 * need Y", so the founder can judge whether Y is plausible.
 *
 * Usage:
 *   node scripts/strategy/revenue-targets.mjs
 *   node scripts/strategy/revenue-targets.mjs --json
 *   node scripts/strategy/revenue-targets.mjs --velocity 1.5,0.4,0.05   # winner/avg/weak sales per day
 *   node scripts/strategy/revenue-targets.mjs --mix lane-c-heavy
 *
 * Every assumption is printed with the output. Replace the velocity triple
 * with Valice's own measured per-title sales as soon as 10 titles have a
 * full quarter of history — that single measurement is worth more than any
 * benchmark in this file.
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => {
    if (!a.startsWith("--")) return [];
    const k = a.slice(2);
    const v = arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true;
    return [k, v];
  }).filter((p) => p.length),
);

// ---------------------------------------------------------------------------
// Contribution per unit by product shape — arithmetic over the verified
// rate card (see price-engine.mjs / catalog-economics.mjs). [V]
// ---------------------------------------------------------------------------
const SHAPES = {
  // Lane A — Amazon print-first franchise titles
  workbookPaperback: { net: 4.69, list: 12.99, label: "Lane A paperback (124p, 8.5×11, B&W) @ $12.99" },
  workbookHardcover: { net: 5.44, list: 21.99, label: "Lane A hardcover (124p) @ $21.99" },
  referencePaperback: { net: 8.25, list: 21.99, label: "Codex-class paperback (329p, 6×9) @ $21.99" },
  referenceHardcover: { net: 10.2, list: 32.99, label: "Codex-class hardcover (329p) @ $32.99" },
  largePrint: { net: 7.03, list: 26.98, label: "Large print (Enigmatica-class) @ $26.98" },
  kindle: { net: 6.54, list: 9.99, label: "Kindle original @ $9.99 (70%)" },
  // Direct
  directEbook: { net: 8.99, list: 9.99, label: "Direct ebook @ $9.99 (Paddle)" },
  directEbookPremium: { net: 11.84, list: 12.99, label: "Direct ebook @ $12.99 (Paddle)" },
  directPd: { net: 8.99, list: 9.99, label: "Direct annotated public-domain edition @ $9.99" },
  bundle: { net: 27.65, list: 29.99, label: "Direct 3-title bundle @ $29.99" },
};

// Unit mix scenarios — share of units, not of revenue. [A]
const MIXES = {
  hybrid: {
    label: "Hybrid (strategy §28): Amazon print discovery + direct margin",
    mix: {
      workbookPaperback: 0.22, workbookHardcover: 0.06, referencePaperback: 0.14, referenceHardcover: 0.06,
      largePrint: 0.05, kindle: 0.12, directEbook: 0.15, directEbookPremium: 0.08, directPd: 0.09, bundle: 0.03,
    },
  },
  "amazon-heavy": {
    label: "Amazon-heavy (what happens if the storefront is neglected)",
    mix: {
      workbookPaperback: 0.32, workbookHardcover: 0.08, referencePaperback: 0.18, referenceHardcover: 0.08,
      largePrint: 0.06, kindle: 0.18, directEbook: 0.05, directEbookPremium: 0.02, directPd: 0.03, bundle: 0.0,
    },
  },
  "lane-c-heavy": {
    label: "Direct-heavy (companion bridge and PD line working)",
    mix: {
      workbookPaperback: 0.15, workbookHardcover: 0.04, referencePaperback: 0.10, referenceHardcover: 0.05,
      largePrint: 0.04, kindle: 0.08, directEbook: 0.20, directEbookPremium: 0.12, directPd: 0.16, bundle: 0.06,
    },
  },
};

const TARGETS = [1000, 3000, 5000, 10000, 20000, 50000];

// Per-title velocity triple: winner / average / weak, units per DAY, and the
// 20/30/50 split. [A] ILLUSTRATIVE — no public dataset supports these for this
// category. Override with --velocity.
const velocity = String(args.velocity ?? "3.0,0.7,0.1").split(",").map(Number);
const SPLIT = [0.2, 0.3, 0.5];
const unitsPerTitlePerMonth = velocity.reduce((s, v, i) => s + v * SPLIT[i] * 30, 0);

// Repeat purchase and AOV assumptions for the customer count. [A]
const AOV_UNITS = 1.25; // units per order (bundles and paired print+ebook lift this)
const REPEAT_RATE = 0.15; // share of customers who buy again within 12 months — unmeasured

// Ad budget: launch-only advertising sized as a share of contribution. [A]
const AD_SHARE_OF_CONTRIBUTION = 0.15;

// Production capacity: content projects a title needs to exist. Every content
// project yields ~2.75 title-format records (measured on the live catalogue). [O]
const RECORDS_PER_PROJECT = 2.75;

function model(mixKey) {
  const { mix, label } = MIXES[mixKey];
  const share = Object.values(mix).reduce((a, b) => a + b, 0);
  if (Math.abs(share - 1) > 0.001) throw new Error(`mix ${mixKey} sums to ${share}`);
  const blendedNet = Object.entries(mix).reduce((s, [k, w]) => s + w * SHAPES[k].net, 0);
  const blendedList = Object.entries(mix).reduce((s, [k, w]) => s + w * SHAPES[k].list, 0);
  const rows = TARGETS.map((target) => {
    const grossContribution = target / (1 - AD_SHARE_OF_CONTRIBUTION); // contribution before ads
    const units = grossContribution / blendedNet;
    const orders = units / AOV_UNITS;
    const customers = orders / (1 + REPEAT_RATE);
    const titleFormatRecords = units / unitsPerTitlePerMonth;
    const contentProjects = titleFormatRecords / RECORDS_PER_PROJECT;
    return {
      targetContributionPerMonth: target,
      requiredUnitsPerMonth: Math.ceil(units),
      requiredUnitsPerDay: Number((units / 30).toFixed(1)),
      requiredOrdersPerMonth: Math.ceil(orders),
      requiredNewCustomersPerMonth: Math.ceil(customers),
      grossRevenuePerMonth: Math.round(units * blendedList),
      adBudgetPerMonth: Math.round(grossContribution * AD_SHARE_OF_CONTRIBUTION),
      titleFormatRecordsNeeded: Math.ceil(titleFormatRecords),
      contentProjectsNeeded: Math.ceil(contentProjects),
      monthsToBuildAt5PerMonth: Math.ceil(contentProjects / 5),
      monthsToBuildAt8PerMonth: Math.ceil(contentProjects / 8),
    };
  });
  return { mixKey, label, blendedNet: Number(blendedNet.toFixed(2)), blendedList: Number(blendedList.toFixed(2)), rows };
}

const mixKey = args.mix && MIXES[args.mix] ? args.mix : "hybrid";
const out = {
  assumptions: [
    `[A] Per-title velocity (units/day) winner/average/weak = ${velocity.join("/")} with a 20/30/50 split → ${unitsPerTitlePerMonth.toFixed(1)} units per title-format record per month. ILLUSTRATIVE.`,
    `[A] ${AOV_UNITS} units per order; ${(REPEAT_RATE * 100).toFixed(0)}% repeat rate. Neither is measured yet.`,
    `[A] Ads sized at ${(AD_SHARE_OF_CONTRIBUTION * 100).toFixed(0)}% of gross contribution (launch-ranking use, not always-on).`,
    `[O] ${RECORDS_PER_PROJECT} title-format records per content project, measured on the live catalogue (8 projects → 22 records).`,
    "[V] Net-per-unit figures are arithmetic over the verified KDP/Paddle rate card (CATALOG_ECONOMICS_FINAL.md).",
    "[S] Targets are CONTRIBUTION after ads, before founder time, model cost and infrastructure (~$100–150/mo).",
  ],
  models: [model(mixKey)],
};
if (args.all) out.models = Object.keys(MIXES).map(model);

if (args.json) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const m of out.models) {
    console.log(`\n${m.label}\nblended net/unit $${m.blendedNet}  ·  blended list $${m.blendedList}\n`);
    console.log("target/mo | units/mo | units/day | orders | new cust | gross rev | ad budget | records | projects | mo@5 | mo@8");
    for (const r of m.rows) {
      console.log(
        [
          `$${r.targetContributionPerMonth}`.padStart(9),
          String(r.requiredUnitsPerMonth).padStart(8),
          String(r.requiredUnitsPerDay).padStart(9),
          String(r.requiredOrdersPerMonth).padStart(6),
          String(r.requiredNewCustomersPerMonth).padStart(8),
          `$${r.grossRevenuePerMonth}`.padStart(9),
          `$${r.adBudgetPerMonth}`.padStart(9),
          String(r.titleFormatRecordsNeeded).padStart(7),
          String(r.contentProjectsNeeded).padStart(8),
          String(r.monthsToBuildAt5PerMonth).padStart(4),
          String(r.monthsToBuildAt8PerMonth).padStart(4),
        ].join(" | "),
      );
    }
  }
  console.log("\nassumptions:");
  for (const a of out.assumptions) console.log(`  ${a}`);
}
