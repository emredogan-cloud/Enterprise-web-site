#!/usr/bin/env node
/**
 * Documentation rule-set audit and archiver.
 *
 * Classifies every strategy/report document in the repository and moves the
 * ones that are no longer authoritative into `archive/`, preserving their
 * original filenames. Emits RULE_SET_INDEX.md so the founder can answer
 * "which document is currently in force?" from one file.
 *
 *   node scripts/strategy/archive-docs.mjs            # dry run (default)
 *   node scripts/strategy/archive-docs.mjs --commit   # actually move files
 *
 * NOTHING IS EVER DELETED. Archiving is a move, and `git mv` keeps history.
 *
 * Classification vocabulary (from the phase brief):
 *   ACTIVE       still in force
 *   SUPERSEDED   replaced by a newer decision; kept for provenance
 *   HISTORICAL   a record of a finished phase; not a rule
 *   CONFLICTING  contradicts a rule that is currently in force
 *   UNKNOWN      currency could not be established — needs a founder read
 *
 * Only SUPERSEDED / HISTORICAL / CONFLICTING move. ACTIVE and UNKNOWN stay
 * where they are: archiving something whose status we could not establish
 * would be exactly the silent removal this script exists to prevent.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const COMMIT = process.argv.includes("--commit");

/** @typedef {{path:string,status:string,bucket?:string,supersededBy?:string,reason:string,founderAction?:string}} Doc */

/** @type {Doc[]} */
const DOCS = [
  // ── ACTIVE — the rules currently in force ───────────────────────────────
  { path: "CLAUDE.md", status: "ACTIVE", reason: "Agent operating instructions. Authoritative." },
  { path: "AGENTS.md", status: "ACTIVE", reason: "Agent instructions companion to CLAUDE.md." },
  { path: "README.md", status: "ACTIVE", reason: "Repository entry point." },
  { path: "memory/PAST_DECISIONS.md", status: "ACTIVE", reason: "Locked architectural + catalog constitution. Consult before any architectural change." },
  { path: "memory/USER_PROFILE.md", status: "ACTIVE", reason: "Engineering standards." },
  { path: "roadmap/WEB_SITE_ROADMAP.md", status: "ACTIVE", reason: "Source of truth for the ADRs referenced by PAST_DECISIONS.md." },

  { path: "VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.md", status: "ACTIVE", reason: "Current master business strategy (2026-08-31)." },
  { path: "docs/VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.html", status: "ACTIVE", reason: "Founder-facing edition of the master strategy." },
  { path: "KDP_BUSINESS_MODEL_COMPARISON.md", status: "ACTIVE", reason: "Unit economics behind the master strategy." },
  { path: "PUBLISHING_FACTORY_ARCHITECTURE.md", status: "ACTIVE", reason: "Production system design behind the master strategy." },
  { path: "CATALOG_ECONOMICS_FINAL.md", status: "ACTIVE", reason: "Per-title economics against the live catalogue (this phase)." },

  // ── Master roadmap phase (2026-09-02) — research + architecture + plan; no books produced ──
  { path: "VALICE_PRESS_MASTER_ROADMAP_TR.md", status: "ACTIVE", reason: "Master publishing roadmap (2026-09-02): phases 0-41, first 5/20/50 books, 12/24/36-month plan, founder checklist. Working version." },
  { path: "VALICE_PRESS_MASTER_ROADMAP_TR.html", status: "ACTIVE", reason: "Founder-facing edition of the master roadmap (2026-09-02)." },
  { path: "PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md", status: "ACTIVE", reason: "Operational factory design (9 roles, 20 steps, 12 gates, factory memory). Builds on PUBLISHING_FACTORY_ARCHITECTURE.md; supersedes only its topology section." },
  { path: "KDP_PRODUCTION_MASTER_PLAN_TR.md", status: "ACTIVE", reason: "KDP rules verified 2026-09-02, format ladder per title, production workflow, pricing engine usage." },
  { path: "VALICE_EBOOK_PRODUCTION_MASTER_PLAN_TR.md", status: "ACTIVE", reason: "Digital edition standard, ebook sourcing pipeline, bundles." },
  { path: "PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md", status: "ACTIVE", reason: "Public-domain discovery engine, rights gate, differentiation standards. Builds on PUBLIC_DOMAIN_BATCH_1_PLAN.md (Batch 1 unchanged)." },
  { path: "PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv", status: "ACTIVE", reason: "Scored public-domain candidate pool with verified PG/IA identifiers (94 rows)." },
  { path: "SEO_MASTER_IMPLEMENTATION_PLAN_TR.md", status: "ACTIVE", reason: "SEO audit, architecture for the real catalogue, Search Console/Cloud procedure, content factory. Replaces the strategic layer of docs/seo/ (which was written for the pre-rebrand catalogue)." },
  { path: "AMAZON_ADS_MASTER_PLAN_TR.md", status: "ACTIVE", reason: "Amazon Ads product selection, economics, launch system (2026 rules)." },
  { path: "AMAZON_TO_VALICE_CUSTOMER_BRIDGE_TR.md", status: "ACTIVE", reason: "Companion templates, QR/URL rules, email flows, direct value proposition." },
  { path: "CATALOG_LIFECYCLE_AND_MAINTENANCE_TR.md", status: "ACTIVE", reason: "Lifecycle classes, maintenance automation thresholds, rights system, QA, launch checklist." },

  // ── Execution phase (2026-09-02) — reports live under docs/execution/, never in the root ──
  { path: "docs/execution/FOUNDER_ACTIONS.md", status: "ACTIVE", reason: "The single canonical Founder handbook: only actions the agent cannot perform." },
  { path: "docs/execution/phase-0/PHASE_0_REPORT.md", status: "ACTIVE", reason: "Verified current-state baseline (2026-09-02) and the fixes applied." },
  { path: "docs/execution/phase-1/PHASE_1_REPORT.md", status: "ACTIVE", reason: "Factory foundation: what was built, tested, and what remains for Phase 2." },
  { path: "docs/execution/phase-1/FACTORY_IMPLEMENTATION.md", status: "ACTIVE", reason: "Operator manual for valice-house/ and scripts/factory/." },
  { path: "docs/execution/phase-2/PHASE_2_REPORT.md", status: "ACTIVE", reason: "First commercial production: Hangul remediation, World Games large print, the Dudeney edition, the analytics sink." },
  { path: "docs/execution/phase-2/COMMERCIAL_RESULTS.md", status: "ACTIVE", reason: "Phase 2 commercial position — superseded numerically by phase-3, kept as the before-picture." },
  { path: "docs/execution/phase-2/PILOT_HANGUL.md", status: "ACTIVE", reason: "How the Hangul rights remediation was carried out. Evidence, not a rule." },
  { path: "docs/execution/phase-2/PILOT_WORLD_GAMES.md", status: "ACTIVE", reason: "Large-print build and companion pack record." },
  { path: "docs/execution/phase-2/PILOT_DUDENEY.md", status: "ACTIVE", reason: "How the Dudeney edition was built end to end." },
  { path: "docs/execution/phase-3/PHASE_3_REPORT.md", status: "ACTIVE", reason: "Commercial activation: what is live, what was broken, what is blocked. The current baseline for what exists." },
  { path: "docs/execution/phase-3/COMMERCIAL_RESULTS.md", status: "ACTIVE", reason: "Measured commercial position — orders, funnel, index, reviews. Re-runnable via commercial-dashboard.mjs." },
  { path: "docs/execution/phase-3/DUDENEY_REPORT.md", status: "ACTIVE", reason: "Gate 1 market sample, the two factual corrections, and the price and format decisions." },
  { path: "docs/execution/phase-3/HANGUL_REPORT.md", status: "ACTIVE", reason: "Live paperback state and what Gate 2 still gates." },
  { path: "docs/execution/phase-3/WORLD_GAMES_REPORT.md", status: "ACTIVE", reason: "Live format state and why the ad plan changed." },
  { path: "docs/execution/phase-3/ADS_REPORT.md", status: "ACTIVE", reason: "Campaign spec, break-even ACOS per format, stop rules. No ad has run." },
  { path: "docs/execution/phase-3/EMAIL_REPORT.md", status: "ACTIVE", reason: "Delivery proven in an inbox; the unsubscribe defect and its fix." },
  { path: "docs/execution/phase-3/SEO_REPORT.md", status: "ACTIVE", reason: "Search Console baseline: zero indexed. Technical state and the four pages worth writing." },
  { path: "docs/execution/phase-4/PHASE_4_FINALIZATION_REPORT.md", status: "ACTIVE", reason: "Phase 4 finalization (2026-09-03): KDP linkage matrix, seven companions, real assets everywhere, analytics exclusion. Supersedes PHASE_4_REPORT.md as the state-of-the-system document." },
  { path: "docs/execution/phase-4/ASSET_MAP.md", status: "ACTIVE", reason: "The asset-to-entity map: what every surface shows and where it comes from; provenance of every real asset; what was removed and why." },
  { path: "docs/execution/phase-4/ASSET_INVENTORY.csv", status: "ACTIVE", reason: "Every file under public/images with slot, entity, size and referencing files. Regenerate with asset-manifest.mjs --inventory." },
  { path: "docs/execution/phase-4/ANALYTICS_EXCLUSION.md", status: "ACTIVE", reason: "How Founder and agent traffic is kept out of analytics, on the mechanism Vercel documents; activation steps and limits." },
  { path: "docs/execution/phase-5/PHASE_5_REPORT.md", status: "ACTIVE", reason: "Traction engine: the three pilots, the six firsts, observation windows and the decision framework. No result yet." },
  { path: "docs/execution/phase-5/COMMERCIAL_RESULTS.md", status: "ACTIVE", reason: "Per-pilot orders, revenue, contribution (measured zeros)." },
  { path: "docs/execution/phase-5/ADS_RESULTS.md", status: "ACTIVE", reason: "Ads ledger; no campaign exists." },
  { path: "docs/execution/phase-5/SEO_RESULTS.md", status: "ACTIVE", reason: "Search Console per page; sitemap re-submitted 2026-09-03." },
  { path: "docs/execution/phase-5/COMPANION_RESULTS.md", status: "ACTIVE", reason: "Companion visits and downloads per book; which interiors carry the URL." },
  { path: "docs/execution/phase-5/EMAIL_RESULTS.md", status: "ACTIVE", reason: "Subscribers by source; zero real." },
  { path: "docs/execution/phase-5/CATALOG_RESULTS.md", status: "ACTIVE", reason: "Every listing and edition, verified 2026-09-03." },
  { path: "docs/execution/phase-4/PHASE_4_REPORT.md", status: "ACTIVE", reason: "First revenue phase: Dudeney live, two-artifact delivery, the KDP linkage audit. The current baseline for what exists." },
  { path: "docs/execution/phase-4/COMMERCIAL_RESULTS.md", status: "ACTIVE", reason: "Measured commercial position after Dudeney went on sale." },
  { path: "docs/execution/phase-4/KDP_VALICE_LINKAGE_REPORT.md", status: "ACTIVE", reason: "Which printed books send readers to Valice Press, which do not, and the exact URL each should print. The phase's flagship deliverable." },
  { path: "docs/execution/phase-4/KDP_VALICE_LINKAGE_MATRIX.csv", status: "ACTIVE", reason: "Per-edition linkage data with the update decision. Regenerate with kdp-linkage-matrix.mjs." },
  { path: "docs/execution/phase-4/DUDENEY_REPORT.md", status: "ACTIVE", reason: "All twelve gates with evidence; what a buyer receives; the AI declaration conflict." },
  { path: "docs/execution/phase-4/WORLD_GAMES_REPORT.md", status: "ACTIVE", reason: "Companion back matter, the invented biography, and the corrected trim economics." },
  { path: "docs/execution/phase-4/HANGUL_REPORT.md", status: "ACTIVE", reason: "Live state and the one upload that should carry two fixes." },
  { path: "docs/execution/phase-4/ADS_REPORT.md", status: "ACTIVE", reason: "Campaign spec on the paperback, corrected break-even ACOS, stop rules. No ad has run." },
  { path: "docs/execution/phase-4/EMAIL_REPORT.md", status: "ACTIVE", reason: "Consent recording closed; what to send when there is a first customer." },
  { path: "docs/execution/phase-4/SEO_REPORT.md", status: "ACTIVE", reason: "Four utility pages live, still zero indexed, and what to do about it." },
  { path: "docs/execution/PHASE-REPORT/README.md", status: "ACTIVE", reason: "Pointer only. Replaced stale duplicate copies of the Phase 0/1 reports and an out-of-date handbook." },
  { path: "valice-house/README.md", status: "ACTIVE", reason: "Factory standing context and memory — entry point for every agent role." },

  { path: "CATALOG_MASTER_INVENTORY_FINAL.md", status: "ACTIVE", reason: "Current catalogue inventory (2026-08-31)." },
  { path: "EBOOK_STORE_FINAL.md", status: "ACTIVE", reason: "Current ebook store state." },
  { path: "EMAIL_SYSTEM_FINAL.md", status: "ACTIVE", reason: "Current email system state." },
  { path: "PRODUCTION_VERIFICATION_FINAL.md", status: "ACTIVE", reason: "Current production verification." },
  { path: "PHASE_4_COMPLETION_REPORT_TR.md", status: "ACTIVE", reason: "Most recent completed phase; still the baseline for what exists." },
  { path: "PUBLIC_DOMAIN_BATCH_1_PLAN.md", status: "ACTIVE", reason: "Current public-domain production plan." },
  { path: "FOUNDER_CONFIGURATION_MANUAL.md", status: "ACTIVE", reason: "Operational runbook for provider configuration." },
  { path: "FOUNDER_OPERATIONS_MANUAL.md", status: "ACTIVE", reason: "Operational runbook for day-to-day running." },
  { path: "docs/KURULUM_VE_ENV_REHBERI.md", status: "ACTIVE", reason: "Environment setup guide." },

  // Rights and provenance documents are ALWAYS active. A legal record does
  // not expire because a strategy changed, and archiving one would remove
  // the evidence trail behind a published edition.
  { path: "BOOK_ACQUISITION_LEGAL_REPORT_TR.md", status: "ACTIVE", reason: "Rights/legal reference. Legal records never expire with a strategy change." },
  { path: "MEDITATIONS_EDITION_SOURCE_REPORT_TR.md", status: "ACTIVE", reason: "Edition provenance for a published title. Evidence trail — must stay in place." },

  // Current commercial research (2026-08-29). Consistent with, and feeding,
  // the master strategy rather than superseded by it.
  ...[
    "12_MONTH_VALICE_PRESS_ROADMAP",
    "90_DAY_EXECUTION_PLAN",
    "CUSTOMER_ACQUISITION_STRATEGY",
    "DIRECT_SALES_BUSINESS_MODEL",
    "EMAIL_LIST_STRATEGY",
    "FINAL_COMMERCIAL_STRATEGY",
    "KDP_CATALOG_AUDIT",
    "KDP_WEBSITE_POLICY_RESEARCH",
    "PUBLIC_DOMAIN_CATALOG_STRATEGY",
    "WEBSITE_CURRENT_STATE_AUDIT",
    "WEBSITE_REVENUE_MODEL",
  ].map((n) => ({
    path: `01_REPORTS/${n}.md`,
    status: "ACTIVE",
    reason: "Commercial research (2026-08-29) that the master strategy builds on, not replaces.",
  })),

  { path: "CLAUDE_AGENT_SDK_MASTERCLASS_TR.md", status: "ACTIVE", reason: "Technical reference, not a business rule. Independent of strategy." },

  // ── CONFLICTING ─────────────────────────────────────────────────────────
  {
    path: "docs/STRATEJI_VE_KITAP_FIKIRLERI.md",
    status: "CONFLICTING",
    bucket: "strategy",
    supersededBy: "VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.md",
    reason:
      "Prescribes 1-2 premium titles/year in engineering + executive niches and 'stop at 5-6 titles'. " +
      "The master strategy reaches the opposite conclusion: too slow for a main income, and those two " +
      "niches rank last of 30 on Valice asset fit. Two contradictory strategy documents in one repo " +
      "usually means neither is executed.",
    founderAction:
      "None required — the master strategy is in force. Read the archived copy only for its pricing " +
      "and launch-sequencing sections, which remain useful for Lane B flagship titles.",
  },

  // ── SUPERSEDED ──────────────────────────────────────────────────────────
  { path: "CATALOG_MASTER_INVENTORY.md", status: "SUPERSEDED", bucket: "reports", supersededBy: "CATALOG_MASTER_INVENTORY_FINAL.md", reason: "Earlier inventory (08-29) replaced by the FINAL revision (08-31)." },
  { path: "PRODUCTION_VERIFICATION_REPORT.md", status: "SUPERSEDED", bucket: "reports", supersededBy: "PRODUCTION_VERIFICATION_FINAL.md", reason: "Earlier verification pass replaced by the FINAL revision." },
  { path: "PUBLIC_DOMAIN_8_10_BOOK_PLAN.md", status: "SUPERSEDED", bucket: "strategy", supersededBy: "PUBLIC_DOMAIN_BATCH_1_PLAN.md", reason: "Superseded batch plan; Batch 1 is the current scope." },
  { path: "IMPLEMENTATION_COMPLETION_REPORT.md", status: "SUPERSEDED", bucket: "reports", supersededBy: "PHASE_4_COMPLETION_REPORT_TR.md", reason: "Superseded by the Phase 4 completion report." },
  { path: "FINAL_VALICE_PRESS_BUSINESS_PLAN.html", status: "SUPERSEDED", bucket: "strategy", supersededBy: "docs/VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.html", reason: "Earlier business plan (08-29) replaced by the master publishing strategy (08-31)." },

  // ── HISTORICAL — finished phases; records, not rules ─────────────────────
  ...[
    "PHASE_A_PROVISION_CHECKLIST_TR",
    "PHASE_C_COMPLETION_REPORT_TR",
    "PHASE_D_COMPLETION_REPORT_TR",
    "PHASE_E_COMPLETION_REPORT_TR",
    "PHASE_F_COMPLETION_REPORT_TR",
    "PHASE_G1_PRODUCTION_READINESS_REPORT_TR",
    "MAIN_MERGE_REPORT_TR",
    "POST_MERGE_SYSTEM_AUDIT_TR",
    "FINAL_LAUNCH_READINESS_REPORT_TR",
    "ROADMAP_COMPLETION_SUMMARY_TR",
    "CUSTOMER_READY_EXECUTION_MASTERPLAN_TR",
    "DESIGN_CORRECTION_PATCH_REPORT_TR",
    "FIRST_BOOK_INGESTION_REPORT_TR",
    "INGESTION_PIPELINE_PATCH_REPORT_TR",
    "GORSEL_PROMPT_ENVANTERI_TR",
    "SESSION_MEMORY_CONTINUE_FROM_HERE_TR",
  ].map((n) => ({
    path: `${n}.md`,
    status: "HISTORICAL",
    bucket: "reports",
    reason: "Completed-phase record from the May-June 2026 build. Useful as provenance, not as a current rule.",
  })),
  ...["PHASE_0", "PHASE_1", "PHASE_2", "PHASE_3"].map((n) => ({
    path: `docs/${n}_COMPLETION_REPORT_TR.md`,
    status: "HISTORICAL",
    bucket: "reports",
    reason: "Completed-phase record (2026-05-30).",
  })),
  { path: "docs/SINEMATIK_REDESIGN_EXECUTION_PHASES_TR.md", status: "HISTORICAL", bucket: "reports", reason: "Completed design-execution plan; the redesign shipped." },
  { path: "docs/TASARIM_AUDIT_RAPORU_TR.md", status: "HISTORICAL", bucket: "reports", reason: "Design audit that produced the completed redesign." },
];

const MOVE = new Set(["SUPERSEDED", "HISTORICAL", "CONFLICTING"]);

function gitMv(from, to) {
  try {
    execFileSync("git", ["mv", from, to], { cwd: ROOT, stdio: "pipe" });
    return "git mv";
  } catch {
    renameSync(join(ROOT, from), join(ROOT, to));
    return "fs rename";
  }
}

const results = [];
let moved = 0;
let already = 0;
let missing = 0;

for (const doc of DOCS) {
  const dest = MOVE.has(doc.status)
    ? `archive/${doc.bucket ?? "reports"}/${doc.path.split("/").pop()}`
    : null;

  const atOrigin = existsSync(join(ROOT, doc.path));
  // Idempotency: once a document has been archived it no longer exists at its
  // original path, and a naive existence check would report it MISSING and
  // silently drop it from the index — losing exactly the provenance record
  // this script exists to preserve. Check the destination too.
  const atDest = dest ? existsSync(join(ROOT, dest)) : false;

  if (!atOrigin && atDest) {
    already++;
    results.push({ ...doc, outcome: `already archived at ${dest}`, dest });
    continue;
  }
  if (!atOrigin) {
    missing++;
    results.push({ ...doc, outcome: "MISSING — not on disk" });
    continue;
  }
  if (!dest) {
    results.push({ ...doc, outcome: "left in place" });
    continue;
  }
  if (COMMIT) {
    mkdirSync(join(ROOT, dirname(dest)), { recursive: true });
    const how = gitMv(doc.path, dest);
    results.push({ ...doc, outcome: `moved → ${dest} (${how})`, dest });
  } else {
    results.push({ ...doc, outcome: `WOULD MOVE → ${dest}`, dest });
  }
  moved++;
}

// ── console summary ────────────────────────────────────────────────────────
const byStatus = {};
for (const r of results) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

console.log(COMMIT ? "ARCHIVE — COMMITTED\n" : "ARCHIVE — DRY RUN (pass --commit to apply)\n");
for (const [s, n] of Object.entries(byStatus).sort()) {
  console.log(`  ${s.padEnd(12)} ${n}`);
}
console.log(`\n  files to move: ${moved}`);
console.log(`  already archived: ${already}`);
console.log(`  listed but not on disk: ${missing}`);
for (const r of results.filter((x) => x.outcome.startsWith("MISSING"))) {
  console.log(`    - ${r.path}`);
}

// ── RULE_SET_INDEX.md ──────────────────────────────────────────────────────
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const order = { ACTIVE: 0, CONFLICTING: 1, SUPERSEDED: 2, HISTORICAL: 3, UNKNOWN: 4 };
const sorted = [...results]
  .filter((r) => !r.outcome.startsWith("MISSING"))
  .sort((a, b) => (order[a.status] - order[b.status]) || a.path.localeCompare(b.path));

const index = `# Rule-Set Index

**Which document is currently in force?** This file answers that in one place.
Generated by \`scripts/strategy/archive-docs.mjs\` — regenerate it rather than
editing it by hand.

Last generated: ${new Date().toISOString().slice(0, 10)}

## How to read this

| Status | Meaning |
|---|---|
| **ACTIVE** | In force. Follow it. |
| **CONFLICTING** | Contradicts an active rule. Archived; the superseding document wins. |
| **SUPERSEDED** | Replaced by a newer decision. Archived for provenance. |
| **HISTORICAL** | A record of a finished phase, not a rule. Archived. |
| **UNKNOWN** | Currency not established. **Left in place** — needs a founder read. |

Nothing is ever deleted. Archived documents keep their original filenames
under \`archive/\`, and \`git mv\` preserves their history.

## The six documents that are actually in force

If you read nothing else:

1. \`memory/PAST_DECISIONS.md\` — locked architectural and catalogue constitution
2. \`VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.md\` — the business model
3. \`CATALOG_ECONOMICS_FINAL.md\` — what each title actually earns
4. \`CLAUDE.md\` — how agents must work in this repo
5. \`docs/execution/phase-4/PHASE_4_REPORT.md\` — what currently exists, what is
   live, and what is measured. Supersedes \`PHASE_4_COMPLETION_REPORT_TR.md\` as
   the state-of-the-system document (that one describes the May–June build and
   is still accurate about the codebase, not about the commerce), and supersedes
   \`phase-3/PHASE_3_REPORT.md\` on every number it restates.
6. \`docs/execution/FOUNDER_ACTIONS.md\` — the only list of what a person still
   has to do

## Index

| Document | Status | Superseded by | Reason | Founder action |
|---|---|---|---|---|
${sorted
  .map(
    (r) =>
      `| \`${esc(r.dest ?? r.path)}\` | ${r.status} | ${
        r.supersededBy ? `\`${esc(r.supersededBy)}\`` : "—"
      } | ${esc(r.reason)} | ${esc(r.founderAction ?? "None")} |`,
  )
  .join("\n")}

## Not covered by this index

- \`sub-pr-report/\` — 20 per-PR build records from the May–June 2026 phase.
  Left in place as a single coherent historical block; they are provenance for
  the codebase, not rules, and splitting them across two directories would make
  them harder to read rather than easier.
- \`e-book/\`, \`images/\`, \`logs/\` — assets and runtime output, not documentation.
- Book production repositories under \`MY-DİGİTAL-BOOK/\` — each carries its own
  \`DECISIONS.md\` and is the source of truth for that book's specification.
`;

writeFileSync(join(ROOT, "RULE_SET_INDEX.md"), index);
console.log(`\n  wrote RULE_SET_INDEX.md (${sorted.length} rows)`);
if (!COMMIT) console.log("\n  DRY RUN — no files were moved.");
