#!/usr/bin/env node
/**
 * KDP compliance sheet (Gate 10) from project_config.json.
 *
 *   node scripts/factory/compliance-lint.mjs --project <dir> [--json]
 *
 * Checks (rules verified on kdp.amazon.com, 2026-09-02):
 *   - AI disclosure decided for text, images and translation (generated |
 *     assisted | none), with decidedBy=founder; `generated` is flagged as
 *     "must be declared at upload" (never as a failure)
 *   - public-domain edition: differentiation set and title tagged
 *   - ink ∈ black | standard-color | premium-color; premium-color warns
 *     (≈ $0.99/unit on a $24.99 book); hardcover with colour ink is an error
 *     (hardcover is black ink only)
 *   - page counts inside KDP ranges when measured: paperback 24–828,
 *     hardcover 75–550
 *   - kdpSelect true ⇒ directSale must be false (exclusivity)
 *   - bonus content ≤ 10 %
 *   - back-matter links: none whose purpose is a form collecting customer data;
 *     companion printedUrl must be on valicepress.com
 *   - velocity: ≤ 5 new titles per format per week (planning value)
 *   - THE BUILT INTERIOR (when the project's slug has editions registered in
 *     print-interiors.mjs): kdp-linkage-lint runs on the actual PDFs. A
 *     non-canonical host, a data-wall URL, the invented biography, broken
 *     PDF metadata or a false listing claim is an error; a companion that
 *     exists but is not printed is an error too — no new print book is
 *     final without its route home. Pass --no-interior to skip (planning
 *     runs on a project that has not been typeset yet).
 */

import { join } from "node:path";

import { Report, finish } from "./lib/lint.mjs";
import { loadProject, parseArgs } from "./lib/project.mjs";
import { runLinkageAudit } from "./kdp-linkage-lint.mjs";
import { PRINT_INTERIORS } from "./print-interiors.mjs";

const DISCLOSURE = ["generated", "assisted", "none"];
const INKS = ["black", "standard-color", "premium-color"];

export function lintCompliance(config, report = new Report("compliance-lint", "compliance")) {
  const c = config.compliance ?? {};
  const ai = c.aiDisclosure ?? {};
  for (const k of ["text", "images", "translation"]) {
    if (!DISCLOSURE.includes(ai[k])) report.error("ai-disclosure", `${k} is ${JSON.stringify(ai[k] ?? null)} — must be generated|assisted|none, decided by the founder`);
    else if (ai[k] === "generated") report.warn("ai-disclosure", `${k}: AI-generated → must be declared in the KDP form at every upload/republish`);
  }
  if (ai.decidedBy && ai.decidedBy !== "founder") report.error("ai-disclosure", `decidedBy must be founder, got ${ai.decidedBy}`);
  if (DISCLOSURE.includes(ai.text) && ai.decidedBy !== "founder") report.error("ai-disclosure", "disclosure recorded without decidedBy=founder");

  if (config.rights?.publicDomain) {
    const diff = config.rights.differentiation;
    if (!["translated", "annotated", "illustrated"].includes(diff)) report.error("pd", "public-domain edition without differentiation");
    const tag = { translated: "(Translated)", annotated: "(Annotated)", illustrated: "(Illustrated)" }[diff];
    if (tag && !String(config.metadata?.title ?? "").includes(tag)) report.error("pd", `title must carry ${tag}`);
    if (c.kdpSelect) report.error("pd", "public-domain content is not eligible for KDP Select");
  }

  const ink = config.production?.ink;
  if (ink && !INKS.includes(ink)) report.error("ink", `unknown ink ${ink}`);
  if (ink === "premium-color") report.warn("ink", "premium colour: a $24.99 200-page book nets about $0.99/unit — confirm with price-engine before upload");
  const formats = config.formats ?? [];
  const hc = formats.find((f) => f.format === "hardcover" && f.status !== "not_planned");
  if (hc && ink && ink !== "black") report.error("ink", "hardcover is black ink only on KDP");
  const pages = config.measured?.pages ?? {};
  if (pages.paperback != null && (pages.paperback < 24 || pages.paperback > 828)) report.error("pages", `paperback ${pages.paperback} outside 24–828`);
  if (pages.hardcover != null && (pages.hardcover < 75 || pages.hardcover > 550)) report.error("pages", `hardcover ${pages.hardcover} outside 75–550`);

  if (c.kdpSelect === true && c.directSale === true) report.error("select", "KDP Select is digital exclusivity: directSale must be false while enrolled");
  if (Number(c.bonusContentSharePct ?? 0) > 10) report.error("bonus-content", `${c.bonusContentSharePct} % (KDP: about 10 % maximum, at the end of the book)`);
  for (const l of c.backMatterLinks ?? []) {
    const purpose = String(l.purpose ?? "").toLowerCase();
    if (/form|signup|sign-up|newsletter|email/.test(purpose)) report.error("hyperlink", `link ${l.url} has purpose "${l.purpose}" — KDP prohibits links to forms that collect customer information`);
    if (/amazon\.|kobo|apple\.com\/books|gumroad|lulu/.test(String(l.url))) report.error("hyperlink", `link ${l.url} points at another store`);
  }
  const printed = config.companion?.printedUrl;
  if (printed && !/^valicepress\.com\/companion\/[a-z0-9-]+$/.test(printed)) report.error("printed-url", `printedUrl must be valicepress.com/companion/<slug>, got ${printed}`);
  if (printed && !/^https?:\/\//.test(printed) && printed.includes("vercel.app")) report.error("printed-url", "never print a vercel.app address");
  if (c.velocityWeek != null && c.velocityWeek > 5) report.warn("velocity", `${c.velocityWeek} new titles planned this week for a format (house limit 5)`);
  if (!report.errors.length) report.pass("compliance", "sheet clean (founder still signs Gate 10)");
  return report;
}

/**
 * Gate 10's other half: what the built interior actually says. Reads the
 * registered PDFs for the project's catalogue slug through kdp-linkage-lint;
 * the sheet can be clean while the book prints a dead address.
 */
export async function lintBuiltInterior(slug, report) {
  if (!slug || !PRINT_INTERIORS[slug]) {
    report.skipped("linkage", `no built interior registered for ${slug ?? "(no slug)"} in print-interiors.mjs`);
    return report;
  }
  const rows = await runLinkageAudit({ slug });
  for (const r of rows) {
    const where = `${r.book}/${r.format}`;
    if (r.status === "BLOCKED") report.error("linkage", r.detail, where);
    else if (r.status === "NEEDS_REVISION") report.error("linkage", `${r.detail} → ${r.action}`, where);
    else if (r.status === "MISSING" && r.companionExists) report.error("linkage", `${r.detail} → ${r.action}`, where);
    else if (r.status === "MISSING") report.warn("linkage", `${r.detail} → ${r.action}`, where);
    else if (r.status === "IN_REVIEW") report.warn("linkage", `at KDP in review; ${r.detail}`, where);
    else report.pass("linkage", `${r.detail}${r.bioStatus === "approved" ? " · approved biography" : ""}`, where);
    if (r.bioStatus === "non-canonical") report.warn("linkage", "printed biography is not the approved text", where);
  }
  return report;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) {
    console.error("usage: compliance-lint.mjs --project <dir> [--json] [--no-interior]");
    process.exit(2);
  }
  const project = loadProject(args.project);
  const report = new Report("compliance-lint", join(project.root, "project_config.json"));
  lintCompliance(project.config, report);
  if (!args["no-interior"]) {
    const slug = project.config.project?.slug ?? project.config.slug ?? null;
    await lintBuiltInterior(slug, report);
  }
  finish(report, { projectRoot: project.root, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("compliance-lint.mjs")) main();
