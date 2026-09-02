#!/usr/bin/env node
/**
 * Valice Press — 30-niche opportunity matrix.
 *
 * Emits NICHE_OPPORTUNITY_MATRIX.csv.
 * Run: node scripts/strategy/niche-matrix.mjs > NICHE_OPPORTUNITY_MATRIX.csv
 *
 * ── HONESTY NOTE, READ BEFORE USING THESE NUMBERS ──────────────────────────
 * These sub-scores are STRUCTURED JUDGEMENT, not measured Amazon data. No
 * BSR, search-volume or keyword-competition API was available for this pass.
 * They are calibrated against what the 2026 research DID establish (verified
 * royalty bands, verified policy limits, documented low-content saturation,
 * documented ad CPC ranges) and against Valice's existing catalogue, and they
 * are internally consistent — a niche scoring 78 is judged better than one
 * scoring 61 on the stated axes.
 *
 * They are a RANKING TO VALIDATE, not a finding. Before committing a series,
 * verify the top candidates with real marketplace data (Publisher Rocket,
 * KDSPY, Helium 10, or manual BSR sampling of the top 20 results).
 * ───────────────────────────────────────────────────────────────────────────
 *
 * WEIGHTS — deviate from the brief's §17 defaults, deliberately:
 *   Policy/Risk raised 5% → 10%, and Demand lowered 20% → 15%.
 * Rationale: the 2026 evidence is that demand is NOT the scarce input in these
 * categories — survival is. Amazon tightened to account-level enforcement for
 * undisclosed AI content, capped new-title velocity, and the low-content
 * segment is documented as saturated in its generic corner. A niche that
 * cannot be published safely at volume has an expected value of zero however
 * large its demand, so risk deserves the weight demand no longer needs.
 */

const WEIGHTS = {
  demand: 0.15,
  competition: 0.15, // higher score = LESS crowded
  margin: 0.15,
  repeat: 0.15,
  series: 0.1,
  prodEff: 0.1,
  policy: 0.1, // higher score = SAFER
  diff: 0.05,
  ads: 0.05,
};

const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(sum - 1) > 1e-9) throw new Error(`weights sum to ${sum}, not 1`);

/** [demand, competition, margin, repeat, series, prodEff, policy, diff, ads] */
const N = (name, group, s, note) => ({
  name,
  group,
  demand: s[0],
  competition: s[1],
  margin: s[2],
  repeat: s[3],
  series: s[4],
  prodEff: s[5],
  policy: s[6],
  diff: s[7],
  ads: s[8],
  note,
});

const NICHES = [
  // ── Script & language practice ────────────────────────────────────────────
  N("Korean Hangul script & handwriting", "Language/Script", [78, 62, 70, 65, 88, 85, 82, 60, 70],
    "Already in review at Valice. K-culture demand is durable; script books are print-native and template-driven."),
  N("Japanese kana (hiragana/katakana)", "Language/Script", [85, 45, 70, 68, 90, 85, 80, 45, 65],
    "Largest script-practice demand but the most crowded; needs a real differentiator (mnemonics, stroke video QR)."),
  N("Mandarin character & stroke practice", "Language/Script", [80, 52, 70, 72, 88, 78, 80, 55, 65],
    "High repeat: learners buy per HSK level. Natural 6-book ladder."),
  N("Russian Cyrillic script", "Language/Script", [55, 72, 70, 55, 80, 88, 82, 65, 60],
    "Thinner demand, markedly thinner competition. Good second-wave title."),
  N("Greek alphabet (modern + classical)", "Language/Script", [48, 78, 72, 55, 78, 85, 85, 75, 55],
    "Ties directly into Valice's mythology catalogue — cross-sell is free."),
  N("Arabic script practice", "Language/Script", [70, 58, 70, 62, 82, 70, 72, 58, 60],
    "Strong demand; RTL typesetting is a genuine production cost and a moat."),
  N("Hebrew script practice", "Language/Script", [52, 70, 70, 58, 75, 70, 70, 62, 55],
    "Religious-study demand is stable and price-insensitive. RTL cost again."),
  N("Thai script practice", "Language/Script", [42, 82, 70, 52, 72, 72, 82, 70, 50],
    "Genuinely underserved. Small ceiling, low fight."),
  N("Devanagari / Hindi script", "Language/Script", [58, 68, 70, 58, 78, 72, 80, 62, 55],
    "Large heritage-learner market, weak incumbent quality."),
  N("Latin for classical readers", "Language/Script", [40, 75, 78, 60, 75, 68, 88, 78, 45],
    "Small but high-intent, high-WTP, and adjacent to the classics catalogue."),

  // ── Puzzle & activity ─────────────────────────────────────────────────────
  N("Large-print word search for seniors", "Puzzle/Activity", [88, 28, 62, 78, 70, 92, 55, 25, 55],
    "Documented as evergreen AND as the single most saturated corner. Volume without defensibility."),
  N("Large-print sudoku & variants", "Puzzle/Activity", [82, 32, 62, 78, 72, 90, 58, 30, 55],
    "Same shape as word search. Commodity; competes on cover and price alone."),
  N("Cryptic / British-style crosswords", "Puzzle/Activity", [45, 78, 68, 72, 78, 42, 82, 82, 45],
    "Hard to generate, therefore hard to copy. Constructing fair cryptics is real editorial work."),
  N("Logic grid puzzles", "Puzzle/Activity", [52, 68, 66, 68, 78, 62, 78, 68, 50],
    "Programmatically generable with genuine quality control. Underexploited."),
  N("Nonogram / Picross", "Puzzle/Activity", [48, 72, 64, 70, 80, 72, 78, 65, 45],
    "Solver-verifiable by construction — a QA advantage most publishers lack."),
  N("Codeword & cipher puzzles", "Puzzle/Activity", [42, 76, 64, 65, 76, 68, 80, 70, 42],
    "Thin market, low competition, pairs with the Codex/mythology brand."),
  N("Mythology-themed puzzle books", "Puzzle/Activity", [38, 85, 68, 60, 82, 70, 85, 88, 45],
    "Valice-native: nobody else owns both the myth content and the puzzle craft."),
  N("Kids' mythology activity & field books", "Puzzle/Activity", [58, 72, 66, 62, 85, 68, 72, 80, 55],
    "The Myth Hunter's Field Book already proves this shape works."),

  // ── Mythology, classics, reference (Valice's existing core) ───────────────
  N("Illustrated world-mythology reference", "Myth/Classics", [72, 62, 72, 45, 75, 30, 78, 88, 62],
    "Valice's flagship shape. Slow and expensive to make — which is exactly why it defends itself."),
  N("Bestiary / creature compendia", "Myth/Classics", [65, 65, 72, 48, 80, 32, 78, 88, 60],
    "Codex Bestiarium already live. Strong series and gift-market pull."),
  N("Regional & national folklore collections", "Myth/Classics", [55, 75, 70, 52, 88, 45, 80, 82, 55],
    "Near-infinite series runway (by country/region) on one template."),
  N("Annotated Stoic & philosophy editions", "Myth/Classics", [78, 48, 88, 58, 82, 72, 65, 70, 58],
    "Margin score is direct-channel margin. On Amazon the 35% public-domain cap guts it."),
  N("Annotated classic literature editions", "Myth/Classics", [70, 38, 88, 55, 90, 70, 58, 55, 50],
    "Most crowded public-domain corner; free versions exist for nearly all of it."),
  N("Comparative mythology study guides", "Myth/Classics", [45, 78, 78, 55, 78, 58, 82, 80, 48],
    "Education-adjacent, high differentiation, modest ceiling."),

  // ── Practice & education ──────────────────────────────────────────────────
  N("Adult handwriting / cursive revival", "Education", [68, 55, 64, 58, 78, 85, 68, 48, 58],
    "Big and template-friendly, but the generic end is already commoditised."),
  N("Grade-level math practice workbooks", "Education", [85, 32, 62, 82, 88, 78, 60, 28, 62],
    "Huge repeat demand, brutal competition, and content errors are reputationally fatal."),
  N("Certification / test-prep workbooks", "Education", [72, 52, 80, 65, 80, 45, 62, 65, 70],
    "High WTP, but content decays annually and inaccuracy carries real liability."),

  // ── High-content / professional ───────────────────────────────────────────
  N("Technical deep guides for engineers", "High-Content", [55, 82, 95, 62, 65, 22, 88, 92, 40],
    "Best margin in the entire matrix; worst throughput. Website-native, Amazon-irrelevant."),
  N("Executive playbooks & frameworks", "High-Content", [45, 85, 96, 58, 62, 25, 88, 92, 30],
    "Highest price ceiling, smallest audience, sold by reputation not by search."),
  N("Creative-professional visual references", "High-Content", [42, 80, 90, 55, 68, 28, 85, 90, 35],
    "PDF-native (colour fidelity). Amazon print economics are hostile at this page count."),
];

const score = (n) =>
  Object.entries(WEIGHTS).reduce((s, [k, w]) => s + n[k] * w, 0);

/**
 * SECOND LENS — Valice asset fit.
 *
 * The generic weighted score above lands every one of the 30 niches between
 * ~63 and ~73. That flatness is a real result, not a defect of the scoring:
 * good and bad niches trade off along DIFFERENT axes (the crowded ones are
 * easy to produce, the defensible ones are slow), so a weighted average of
 * general-market attractiveness cannot separate them. Anyone can enter any of
 * these; general attractiveness is therefore not a decision variable.
 *
 * What separates them for THIS publisher is leverage over assets no competitor
 * has: an existing catalogue, an owned storefront that keeps ~90% of a sale,
 * a watermarking + reader pipeline, and an email list. Scored 0-100:
 *   90+  a live Valice title already anchors it
 *   70+  reuses an existing template, brand or audience
 *   50   neutral — Valice starts level with any other entrant
 *   <40  needs capability Valice would have to build from nothing
 */
const ASSET_FIT = {
  "Korean Hangul script & handwriting": 95, // title already in review
  "Mythology-themed puzzle books": 92, // myth + puzzle catalogue both exist
  "Kids' mythology activity & field books": 92, // Myth Hunter's Field Book is live
  "Annotated Stoic & philosophy editions": 90, // Meditations is live, direct-sale
  "Bestiary / creature compendia": 88, // Codex Bestiarium is live
  "Illustrated world-mythology reference": 88, // Codex Mythologica + World Myths live
  "Regional & national folklore collections": 82,
  "Greek alphabet (modern + classical)": 78, // cross-sells the myth catalogue
  "Comparative mythology study guides": 75,
  "Codeword & cipher puzzles": 70,
  "Annotated classic literature editions": 68,
  "Latin for classical readers": 68,
  "Japanese kana (hiragana/katakana)": 62, // same template as Hangul
  "Mandarin character & stroke practice": 62,
  "Russian Cyrillic script": 60,
  "Devanagari / Hindi script": 55,
  "Thai script practice": 55,
  "Arabic script practice": 48, // RTL typesetting not yet built
  "Hebrew script practice": 48,
  "Nonogram / Picross": 45,
  "Logic grid puzzles": 45,
  "Large-print word search for seniors": 40,
  "Large-print sudoku & variants": 40,
  "Cryptic / British-style crosswords": 35,
  "Adult handwriting / cursive revival": 35,
  "Technical deep guides for engineers": 30, // storefront fits, subject matter doesn't
  "Creative-professional visual references": 28,
  "Certification / test-prep workbooks": 22,
  "Executive playbooks & frameworks": 20,
  "Grade-level math practice workbooks": 18,
};

/** Priority = market attractiveness tempered by what Valice can uniquely do. */
const priority = (n) => 0.5 * score(n) + 0.5 * (ASSET_FIT[n.name] ?? 50);

const ranked = NICHES.map((n) => ({
  ...n,
  score: score(n),
  assetFit: ASSET_FIT[n.name] ?? 50,
  priority: priority(n),
})).sort((a, b) => b.priority - a.priority);

const cols = [
  "Rank", "Niche", "Group", "Demand", "Competition(low=crowded)", "Margin",
  "RepeatPurchase", "SeriesPotential", "ProductionEfficiency", "PolicyRisk(high=safe)",
  "Differentiation", "AdsViability", "MarketScore", "ValiceAssetFit",
  "ValicePriority", "PrimaryChannel", "Note",
];

const channelFor = (n) =>
  n.group === "High-Content"
    ? "Direct (website)"
    : n.name.startsWith("Annotated")
      ? "Direct-first (KDP caps PD at 35%)"
      : "Amazon print-first";

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

console.log(cols.map(esc).join(","));
ranked.forEach((n, i) => {
  console.log(
    [
      i + 1, n.name, n.group, n.demand, n.competition, n.margin, n.repeat,
      n.series, n.prodEff, n.policy, n.diff, n.ads, n.score.toFixed(1),
      n.assetFit, n.priority.toFixed(1), channelFor(n), n.note,
    ].map(esc).join(","),
  );
});

if (process.env.SUMMARY) {
  const spread = (xs) => `${Math.min(...xs).toFixed(1)}–${Math.max(...xs).toFixed(1)}`;
  console.error(
    `\nMarketScore spread:   ${spread(ranked.map((n) => n.score))}  (flat — not decision-useful)`,
  );
  console.error(
    `ValicePriority spread: ${spread(ranked.map((n) => n.priority))}  (separates)`,
  );
  console.error("\nTOP 10 BY VALICE PRIORITY:");
  ranked.slice(0, 10).forEach((n, i) =>
    console.error(
      `${String(i + 1).padStart(2)}. ${n.priority.toFixed(1)}  (mkt ${n.score.toFixed(1)} / fit ${String(n.assetFit).padStart(2)})  ${n.name}`,
    ),
  );
  console.error("\nBOTTOM 5:");
  ranked.slice(-5).forEach((n) =>
    console.error(
      `    ${n.priority.toFixed(1)}  (mkt ${n.score.toFixed(1)} / fit ${String(n.assetFit).padStart(2)})  ${n.name}`,
    ),
  );
}
