#!/usr/bin/env node
/**
 * Validate a project's CLAIMS.jsonl (Gate 5).
 *
 *   node scripts/factory/claim-lint.mjs --project <dir> [--json]
 *
 * Rules:
 *   - every line parses and has id, text, location, author, verdict
 *   - verdict ∈ PENDING | VERIFIED | WRONG | UNVERIFIABLE
 *   - a claim with a verdict other than PENDING has a verifier, and the
 *     verifier is not the author (the factory's central rule)
 *   - VERIFIED needs evidence; a facts.jsonl reference must exist
 *   - a claim whose text matches a rejected fact is an error
 *   - Gate 5 readiness: no PENDING, no WRONG left in the ledger
 */

import { join } from "node:path";

import { Report, finish, normalizeText, readJSONL } from "./lib/lint.mjs";
import { HOUSE_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

const VERDICTS = ["PENDING", "VERIFIED", "WRONG", "UNVERIFIABLE"];

/**
 * Read a claims ledger written before the schema settled.
 *
 * The Dudeney pilot wrote `{claim, where, source, status, note}` where the
 * house schema says `{text, location, author, verdict, verifier, evidence}`,
 * and the lint answered with ninety identical errors that said nothing about
 * the actual state of the ledger. Mapping the old names costs six lines and
 * turns that into one warning plus real findings.
 *
 * Deliberately conservative about `verdict`: only a legacy status that is
 * exactly "verified" becomes VERIFIED. Every hedge ("partly verified",
 * "verified (proxy: a regex …)") becomes PENDING, because a hedge is what a
 * ledger says when the verification is not finished, and Gate 5 should see it.
 */
export function adaptLegacyClaim(c) {
  if (c.__parseError || c.text || c.verdict) return { claim: c, legacy: false };
  const status = String(c.status ?? "").trim().toLowerCase();
  return {
    legacy: true,
    claim: {
      ...c,
      text: c.claim ?? c.text,
      location: c.where ?? c.location,
      author: c.author ?? "unrecorded author (legacy ledger)",
      verdict: status === "verified" ? "VERIFIED" : status.startsWith("wrong") ? "WRONG" : "PENDING",
      // Left undefined on purpose. A legacy row records no verifier, and the
      // independence rule should say "a verdict needs a verifier" rather than
      // invent one and then accuse it of verifying its own claim.
      verifier: c.verifier,
      evidence: c.evidence ?? (c.source ? [c.source] : []),
    },
  };
}

export function lintClaims(claims, { facts = [], rejected = [] } = {}, report = new Report("claim-lint", "claims")) {
  const factIds = new Set(facts.map((f) => f.fact_id));
  const rejectedTexts = new Set(rejected.map((r) => normalizeText(r.statement)));
  const ids = new Set();
  let pending = 0;
  let wrong = 0;
  if (!claims.length) report.warn("empty", "CLAIMS.jsonl has no claims yet");
  let legacyRows = 0;
  claims = claims.map((c) => {
    const { claim, legacy } = adaptLegacyClaim(c);
    if (legacy) legacyRows++;
    return claim;
  });
  if (legacyRows)
    report.warn(
      "legacy-schema",
      `${legacyRows} claim(s) use the pre-schema field names (claim/where/status). ` +
        "They were read through the adapter; rewrite the file with text/location/author/verdict/verifier/evidence.",
    );
  claims.forEach((c, i) => {
    const where = c.id ?? `line ${i + 1}`;
    if (c.__parseError) {
      report.error("parse", `line ${c.line} is not valid JSON`);
      return;
    }
    for (const k of ["id", "text", "location", "author", "verdict"]) {
      if (!c[k]) report.error("fields", `missing ${k}`, where);
    }
    if (c.id) {
      if (ids.has(c.id)) report.error("id", "duplicate id", where);
      ids.add(c.id);
    }
    if (!VERDICTS.includes(c.verdict)) report.error("verdict", `must be ${VERDICTS.join("|")}`, where);
    if (c.verdict && c.verdict !== "PENDING") {
      if (!c.verifier) report.error("verifier", "a verdict needs a verifier", where);
      else if (c.verifier === c.author) report.error("verifier-is-author", `verifier '${c.verifier}' is the author — a claim may not verify itself`, where);
    }
    if (c.verdict === "VERIFIED") {
      const ev = Array.isArray(c.evidence) ? c.evidence : [];
      if (!ev.length) report.error("evidence", "VERIFIED without evidence", where);
      for (const e of ev) {
        const m = String(e).match(/facts\.jsonl#(F-\d{4}-\d{4})/);
        if (m && !factIds.has(m[1])) report.error("evidence", `references unknown fact ${m[1]}`, where);
      }
    }
    if (c.verdict === "PENDING") pending++;
    if (c.verdict === "WRONG") wrong++;
    if (rejectedTexts.has(normalizeText(c.text))) report.error("rejected-fact", "claim matches a rejected fact in valice-house/rejected-facts", where);
  });
  if (claims.length && !pending && !wrong && !report.errors.length) report.pass("gate-5-ready", `${claims.length} claims, all verified or cut`);
  else if (claims.length) report.warn("gate-5-ready", `${pending} pending, ${wrong} wrong`);
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) {
    console.error("usage: claim-lint.mjs --project <dir> [--json]");
    process.exit(2);
  }
  const project = loadProject(args.project);
  const claims = readJSONL(join(project.root, "CLAIMS.jsonl"));
  const facts = readJSONL(join(HOUSE_ROOT, "verified-facts", "facts.jsonl"));
  const rejected = readJSONL(join(HOUSE_ROOT, "rejected-facts", "rejected.jsonl"));
  const report = new Report("claim-lint", join(project.root, "CLAIMS.jsonl"));
  lintClaims(claims, { facts, rejected }, report);
  finish(report, { projectRoot: project.root, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("claim-lint.mjs")) main();
