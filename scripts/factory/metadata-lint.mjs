#!/usr/bin/env node
/**
 * Metadata checks (Gate 9) on project_config.json → metadata + measured.
 *
 *   node scripts/factory/metadata-lint.mjs --project <dir> [--json]
 *
 * Rules (KDP keyword guidance verified 2026-09-02; house metadata standards):
 *   - title present; subtitle ≤ 200 characters
 *   - every number in the title/subtitle must equal a measured count in
 *     `measured` (unitCount, words, pages.*) — the "120 vs 112" rule
 *   - keywords: ≤ 7, none empty, ≤ 50 characters each, no duplicates, no
 *     banned terms (brand names not owned, subjective claims, time-sensitive
 *     words, Amazon program names), no word already in a category name
 *   - public-domain edition: title carries (Annotated)/(Illustrated)/(Translated)
 *     matching rights.differentiation
 *   - description present, 200–4000 characters, no placeholder, no banned phrase
 *   - author bio present (KDP rejected a placeholder bio as template text)
 */

import { join } from "node:path";

import { Report, finish, jsonBlockFromMarkdown } from "./lib/lint.mjs";
import { HOUSE_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

const DEFAULT_BANNED = [
  "kindle unlimited", "kdp select", "amazon", "best seller", "bestseller", "bestselling", "best book",
  "best ever", "new", "on sale", "available now", "free", "cheap", "#1", "number one", "ultimate", "definitive",
];

export function numbersIn(text) {
  return [...String(text ?? "").matchAll(/\b(\d{1,5})\b/g)].map((m) => Number(m[1]));
}

export function measuredCounts(measured = {}) {
  const out = new Set();
  const walk = (v) => {
    if (typeof v === "number") out.add(v);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(measured);
  return out;
}

export function lintMetadata(config, standards, report = new Report("metadata-lint", "metadata")) {
  const m = config.metadata ?? {};
  const banned = (standards?.bannedKeywordTerms ?? DEFAULT_BANNED).map((b) => b.toLowerCase());
  if (!m.title) report.error("title", "missing");
  if (m.subtitle && m.subtitle.length > 200) report.error("subtitle", `${m.subtitle.length} characters (max 200)`);
  const counts = measuredCounts(config.measured);
  for (const n of [...numbersIn(m.title), ...numbersIn(m.subtitle)]) {
    if (n < 1900 || n > 2100) {
      if (!counts.has(n)) report.error("measured-count", `"${n}" appears in the title/subtitle but is not a measured count in project_config.json → measured`);
    }
  }
  const kws = Array.isArray(m.keywords) ? m.keywords : [];
  if (kws.length > 7) report.error("keywords", `${kws.length} keywords (max 7)`);
  const seen = new Set();
  const categoryWords = new Set((m.categories ?? []).flatMap((c) => String(c).toLowerCase().split(/[^a-z]+/)).filter((w) => w.length > 3));
  kws.forEach((k, i) => {
    const kw = String(k ?? "").trim();
    if (!kw) return report.error("keywords", "empty keyword", `#${i + 1}`);
    if (kw.length > 50) report.error("keywords", `"${kw}" is ${kw.length} characters (max 50)`);
    const low = kw.toLowerCase();
    if (seen.has(low)) report.error("keywords", `duplicate "${kw}"`);
    seen.add(low);
    for (const b of banned) if (low.split(/\s+/).includes(b) || (b.includes(" ") && low.includes(b))) report.error("keywords", `"${kw}" contains banned term "${b}"`);
    for (const w of low.split(/[^a-z]+/)) if (categoryWords.has(w)) report.warn("keywords", `"${kw}" repeats a category word ("${w}")`);
  });
  if (config.rights?.publicDomain) {
    const diff = config.rights.differentiation;
    const tag = { translated: "(Translated)", annotated: "(Annotated)", illustrated: "(Illustrated)" }[diff];
    if (!tag) report.error("pd-differentiation", "public-domain edition without rights.differentiation ∈ translated|annotated|illustrated");
    else if (!String(m.title).includes(tag) && !String(m.subtitle ?? "").includes(tag)) report.error("pd-title-tag", `public-domain edition must carry ${tag} in the title field`);
  }
  const d = String(m.description ?? "");
  if (!d) report.error("description", "missing");
  else {
    if (d.length < 200 || d.length > 4000) report.error("description", `${d.length} characters (200–4000)`);
    if (/\{\{|\[TBD\]|TODO|lorem/i.test(d)) report.error("description", "placeholder text");
    for (const b of ["ultimate", "best ever", "#1", "bestseller"]) if (d.toLowerCase().includes(b)) report.warn("description", `contains "${b}"`);
  }
  if (!config.founder?.authorBio) report.error("author-bio", "founder.authorBio is null — KDP rejected a placeholder bio as template text; a real bio is required");
  if (!report.errors.length) report.pass("metadata", "clean");
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) {
    console.error("usage: metadata-lint.mjs --project <dir> [--json]");
    process.exit(2);
  }
  const project = loadProject(args.project);
  const standards = jsonBlockFromMarkdown(join(HOUSE_ROOT, "metadata", "METADATA_STANDARDS.md"));
  const report = new Report("metadata-lint", join(project.root, "project_config.json"));
  if (!standards) report.skipped("standards", "no JSON block in METADATA_STANDARDS.md — using built-in banned list");
  lintMetadata(project.config, standards, report);
  finish(report, { projectRoot: project.root, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("metadata-lint.mjs")) main();
