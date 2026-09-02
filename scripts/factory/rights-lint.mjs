#!/usr/bin/env node
/**
 * Validate the rights ledger, and optionally a project's use of it (Gate 2).
 *
 *   node scripts/factory/rights-lint.mjs [--ledger valice-house/rights/ledger.csv] [--project <dir>] [--json]
 *
 * Ledger rules (see valice-house/rights/SCHEMA.md and RIGHTS_GATE.md):
 *   - required columns present; row_id unique; status GREEN|YELLOW|RED
 *   - GREEN needs evidence_url, verification_date and approved_by=founder
 *   - CC-BY-NC is never GREEN; unknown licence is never GREEN; CC-BY-SA is at most YELLOW
 *   - a translation/illustration row claiming public-domain with no death year
 *     and no pre-1931 US publication cannot be GREEN
 * Project rules:
 *   - every rights.sources[].ledgerRow in project_config.json exists in the ledger
 *   - Gate 2 readiness: every referenced row is GREEN (YELLOW rows must carry a note)
 */

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { Report, finish, parseCSV } from "./lib/lint.mjs";
import { HOUSE_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

const REQUIRED = [
  "row_id", "book_slug", "layer", "title", "author", "author_death_year", "original_publication_year",
  "edition", "source_repository", "license", "jurisdictions_checked", "evidence_url", "verification_date",
  "status", "approved_by", "approved_on", "supersedes", "notes",
];
const LAYERS = ["work", "translation", "edition", "illustration", "apparatus", "data", "font", "image", "cover-art"];

export function lintLedger(rows, report) {
  const header = rows.length ? Object.keys(rows[0]) : [];
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length) report.error("columns", `missing columns: ${missing.join(", ")}`);
  const ids = new Set();
  for (const r of rows) {
    const id = r.row_id;
    if (!/^RL-\d{4}$/.test(id)) report.error("row_id", `bad id '${id}'`, id);
    if (ids.has(id)) report.error("row_id", "duplicate", id);
    ids.add(id);
    if (!LAYERS.includes(r.layer)) report.error("layer", `unknown layer '${r.layer}'`, id);
    if (!["GREEN", "YELLOW", "RED"].includes(r.status)) report.error("status", `status must be GREEN|YELLOW|RED, got '${r.status}'`, id);
    if (r.status === "GREEN") {
      if (!r.evidence_url) report.error("green-evidence", "GREEN without evidence_url", id);
      if (!r.verification_date) report.error("green-date", "GREEN without verification_date", id);
      if (r.approved_by !== "founder") report.error("green-approval", "GREEN without approved_by=founder", id);
      if (r.license === "CC-BY-NC") report.error("license", "CC-BY-NC can never be GREEN for a sold book", id);
      if (r.license === "CC-BY-SA") report.error("license", "CC-BY-SA can be YELLOW at most for a closed commercial book", id);
      if (r.license === "unknown" || !r.license) report.error("license", "unknown licence cannot be GREEN", id);
      const pd = r.license === "public-domain";
      const preUS1931 = Number(r.original_publication_year) > 0 && Number(r.original_publication_year) < 1931;
      if (pd && ["translation", "illustration", "apparatus", "edition"].includes(r.layer) && !r.author_death_year && !(preUS1931 && /^US/.test(r.jurisdictions_checked) && !/EU|UK|TR/.test(r.jurisdictions_checked))) {
        report.error("life-plus-70", `${r.layer} row claims public domain with no author death year and non-US markets checked`, id);
      }
    }
    if (r.status === "YELLOW" && !r.notes) report.warn("yellow-note", "YELLOW without a mitigation note", id);
    if (r.status === "RED" && !r.notes) report.error("red-reason", "RED without a reason", id);
    if (r.supersedes && !ids.has(r.supersedes) && !rows.some((x) => x.row_id === r.supersedes)) report.error("supersedes", `unknown row ${r.supersedes}`, id);
  }
  if (!report.errors.length) report.pass("ledger", `${rows.length} rows`);
  return report;
}

export function lintProjectRights(project, rows, report) {
  const sources = project.config.rights?.sources ?? [];
  if (!sources.length) {
    report.warn("sources", "project_config.json → rights.sources is empty; Gate 2 cannot be prepared");
    return report;
  }
  const byId = new Map(rows.map((r) => [r.row_id, r]));
  let allGreen = true;
  for (const s of sources) {
    const row = byId.get(s.ledgerRow);
    if (!row) {
      report.error("ledger-row", `source ${s.id} references missing ledger row ${s.ledgerRow}`);
      allGreen = false;
      continue;
    }
    if (row.status === "RED") {
      report.error("red-source", `source ${s.id} → ${row.row_id} is RED: ${row.notes}`);
      allGreen = false;
    } else if (row.status === "YELLOW") {
      report.warn("yellow-source", `source ${s.id} → ${row.row_id} is YELLOW: ${row.notes}`);
      allGreen = false;
    }
  }
  if (allGreen) report.pass("gate-2-ready", "every source row is GREEN");
  else report.warn("gate-2-ready", "not ready: a source is YELLOW or RED");
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const ledgerPath = resolve(args.ledger ?? join(HOUSE_ROOT, "rights", "ledger.csv"));
  const rows = parseCSV(readFileSync(ledgerPath, "utf8"));
  const report = new Report("rights-lint", ledgerPath);
  lintLedger(rows, report);
  let projectRoot = null;
  if (args.project) {
    const project = loadProject(args.project);
    projectRoot = project.root;
    lintProjectRights(project, rows, report);
  }
  finish(report, { projectRoot, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("rights-lint.mjs")) main();
