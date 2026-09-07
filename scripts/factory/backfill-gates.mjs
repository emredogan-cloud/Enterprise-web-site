#!/usr/bin/env node
/**
 * backfill-gates.mjs — give every book project the same twelve-gate record.
 *
 *   node scripts/factory/backfill-gates.mjs            # dry run
 *   node scripts/factory/backfill-gates.mjs --commit
 *
 * WHY THIS EXISTS
 * Twelve book projects had no `gates.json` at all — the whole PHASE-3 tree, both
 * pre-factory Codex books, World Games, World Myths, Myth Hunters, Enigmatica and
 * Hangul. Five of them are live and earning. They were not failing the gates; they
 * had never been entered into them, so the board read as though seven books were
 * missing their homework when in fact nobody had ever asked them for it.
 *
 * WHAT IT WILL AND WILL NOT DO
 * The record is built from the canonical definition in valice-house/workflows/
 * gates.json via emptyGateRecord(), so every project ends up on ONE gate model.
 * Evidence is attached only where a file already exists on disk. Then:
 *
 *   - an AGENT-owned gate whose evidence carries a machine-readable verdict
 *     (`ok: true`, zero errors) is set `passed`;
 *   - any gate whose evidence is a MEASUREMENT with no verdict — a build record,
 *     a rights document, a claims file — is set `in_progress` with the evidence
 *     attached and the reason saying what is still missing;
 *   - a FOUNDER gate is NEVER set `passed` here, whatever evidence exists. The
 *     signature is the thing being recorded, and an agent cannot make one.
 *
 * Nothing is back-dated. `updatedAt` is now, `updatedBy` is this script, and
 * `approvedBy` stays null. A book that went on sale before the factory existed
 * keeps a record that says so rather than one that pretends it was gated.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { emptyGateRecord, loadHouse } from "./lib/project.mjs";

const COMMIT = process.argv.includes("--commit");
const REFRESH = process.argv.includes("--refresh");
const ROOT = process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";

/** Candidate evidence paths per gate, most canonical first. */
const EVIDENCE = {
  1: ["MARKET.md", "00_CONTEXT/MARKET.md", "BRIEF.md"],
  2: ["RIGHTS.md", "RIGHTS/RIGHTS.md", "00_CONTEXT/RIGHTS.md"],
  3: ["QA/similarity.json"],
  4: ["QA/draft-lint.json", "QA/interior-main.json", "06_REPORTS/qa.json"],
  5: ["CLAIMS.jsonl", "CLAIMS/CLAIMS.jsonl", "QA/claim-lint.json", "QA/claims-verified.json"],
  6: ["QA/style-lint.json"],
  7: ["QA/cover-check.json", "QA/cover.json", "06_REPORTS/cover.json"],
  8: ["QA/preflight.json", "QA/preflight-interior.json", "06_REPORTS/kdp-preflight.json",
      "08_OUTPUT/FINAL_KDP_PREFLIGHT.md"],
  9: ["QA/metadata-lint.json", "06_REPORTS/metadata.json"],
  10: ["QA/compliance-lint.json"],
  11: ["QA/website-qa.json"],
  12: [],
};

/**
 * Does this evidence file carry its own verdict, and is that verdict clean?
 * Returns true / false / null (no verdict expressible — a measurement).
 */
export function verdict(abs) {
  if (!abs.endsWith(".json")) return null;
  let d;
  try { d = JSON.parse(readFileSync(abs, "utf8")); } catch { return false; }
  const c = d.counts ?? {};
  if (typeof d.ok === "boolean") return d.ok && (c.error ?? 0) === 0;
  if (typeof d.clean === "boolean") return d.clean;
  if (Array.isArray(d.rows) && d.rows.length) return d.rows.every((r) => r.ok);
  return null;
}

export function planFor(house, projectDir) {
  const rec = emptyGateRecord(house);
  const notes = [];
  for (const g of house.gates.gates) {
    const id = String(g.id);
    const rel = (EVIDENCE[g.id] ?? []).find((c) => existsSync(join(projectDir, c)));
    if (!rel) continue;
    const v = verdict(join(projectDir, rel));
    const cell = rec.gates[id];
    cell.evidence = [rel];
    cell.updatedBy = "backfill-gates.mjs";
    cell.updatedAt = new Date().toISOString();
    if (g.founderSignoff) {
      cell.status = "in_progress";
      cell.reason = `Evidence on disk (${rel})${v === true ? ", and it reports clean" : ""}. ` +
        `This gate is a Founder sign-off; the signature has not been given, and no agent may ` +
        `give it. Recorded as in_progress rather than passed.`;
      notes.push(`${id}=in_progress(founder)`);
    } else if (v === true) {
      cell.status = "passed";
      cell.reason = `${rel} reports ok with zero errors. Back-filled from existing evidence ` +
        `2026-09-07; the check was run before this record existed.`;
      notes.push(`${id}=passed`);
    } else if (v === false) {
      cell.status = "failed";
      cell.reason = `${rel} exists but reports errors. Back-filled 2026-09-07.`;
      notes.push(`${id}=FAILED`);
    } else {
      cell.status = "in_progress";
      cell.reason = `${rel} is a measurement record, not a verdict — it says what was built, ` +
        `not whether the gate is satisfied. Attached as evidence; the gate needs its own check.`;
      notes.push(`${id}=in_progress`);
    }
  }
  return { rec, notes };
}

/**
 * Re-read an EXISTING record and update only what fresh evidence justifies.
 *
 * Two things are never touched:
 *   - a gate a human actually signed (`approvedBy === "founder"`);
 *   - a founder gate's status, which stays whatever it was — a lint passing does
 *     not make a signature exist.
 */
export function refreshRecord(house, projectDir, rec) {
  const changes = [];
  for (const g of house.gates.gates) {
    const id = String(g.id);
    const cell = rec.gates[id];
    if (!cell) continue;
    if (cell.approvedBy === "founder") continue;          // a real signature; leave it alone
    const rel = (EVIDENCE[g.id] ?? []).find((c) => existsSync(join(projectDir, c)));
    if (!rel) continue;
    const v = verdict(join(projectDir, rel));
    if (g.founderSignoff) {
      if (cell.status === "not_started") {
        cell.status = "in_progress";
        cell.evidence = [rel];
        cell.reason = `Evidence on disk (${rel}). Founder sign-off gate — the signature has not ` +
          `been given and no agent may give it.`;
        cell.updatedAt = new Date().toISOString();
        cell.updatedBy = "backfill-gates.mjs --refresh";
        changes.push(`${id}→in_progress`);
      }
      continue;
    }
    const want = v === true ? "passed" : v === false ? "failed" : "in_progress";
    // NEVER walk a gate backwards on the strength of a file being merely present.
    // The first version of this did: it found a measurement record for a gate that was
    // already `passed`, saw "no verdict", and proposed in_progress — downgrading six
    // gates on Seneca alone. A pass is only undone by a check that actually FAILS.
    if (cell.status === "passed" && want !== "failed") continue;
    if (cell.status === want && cell.evidence?.[0] === rel) continue;
    cell.status = want;
    cell.evidence = [rel];
    cell.reason = v === true
      ? `${rel} reports ok with zero errors, re-read 2026-09-07.`
      : v === false
        ? `${rel} reports errors, re-read 2026-09-07.`
        : `${rel} is a measurement with no verdict; attached as evidence.`;
    cell.updatedAt = new Date().toISOString();
    cell.updatedBy = "backfill-gates.mjs --refresh";
    changes.push(`${id}→${want}`);
  }
  return changes;
}

const PROJECTS = [
  "ROADMAP-BOOKS/01-KOREAN-HANGUL-HANDWRITING-WORKBOOK",
  "ROADMAP-BOOKS/CODEX-BESTIARIUM",
  "ROADMAP-BOOKS/CODEX-ENIGMATICA",
  "ROADMAP-BOOKS/CODEX-MYTHOLOGICA",
  "ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-GAMES",
  "ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-MYTHS",
  "ROADMAP-BOOKS/THE-MYTH-HUNTERS-FIELD-BOOK",
  "PUBLIC-BOOKS/PHASE-3-BOOK/01-KWAIDAN",
  "PUBLIC-BOOKS/PHASE-3-BOOK/02-SEA-MONSTERS-UNMASKED",
  "PUBLIC-BOOKS/PHASE-3-BOOK/03-BOOK-OF-WERE-WOLVES",
  "PUBLIC-BOOKS/PHASE-3-BOOK/04-BRITISH-GOBLINS",
  "PUBLIC-BOOKS/PHASE-3-BOOK/05-FAIRY-MYTHOLOGY",
];

/** Every project under the book root that already carries a gate record. */
export function allProjectsWithGates() {
  const out = [];
  const walk = (rel, depth) => {
    if (depth > 3) return;
    let entries;
    try { entries = readdirSync(join(ROOT, rel), { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === "COMMON-AREA" || e.name.startsWith(".")) continue;
      const child = rel ? `${rel}/${e.name}` : e.name;
      if (existsSync(join(ROOT, child, "gates.json"))) out.push(child);
      else walk(child, depth + 1);
    }
  };
  walk("", 0);
  return out.sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const house = loadHouse();
  let written = 0, skipped = 0;
  const targets = REFRESH ? allProjectsWithGates() : PROJECTS;
  for (const rel of targets) {
    const dir = join(ROOT, rel);
    if (!existsSync(dir)) { console.log(`  MISSING PROJECT  ${rel}`); continue; }
    const out = join(dir, "gates.json");
    if (existsSync(out)) {
      if (!REFRESH) { skipped++; console.log(`  already has one  ${rel}`); continue; }
      const rec = JSON.parse(readFileSync(out, "utf8"));
      const ch = refreshRecord(house, dir, rec);
      if (ch.length && COMMIT) writeFileSync(out, JSON.stringify(rec, null, 1) + "\n");
      skipped++;
      console.log(`  ${ch.length ? (COMMIT ? "refreshed" : "would refresh") : "unchanged "}  ${rel.padEnd(52)} ${ch.join(" ")}`);
      continue;
    }
    const { rec, notes } = planFor(house, dir);
    if (COMMIT) writeFileSync(out, JSON.stringify(rec, null, 1) + "\n");
    written++;
    console.log(`  ${COMMIT ? "wrote" : "would write"}  ${rel.padEnd(52)} ${notes.join(" ") || "(no evidence found — all twelve not_started)"}`);
  }
  console.log(`\n  ${written} gate record(s) ${COMMIT ? "written" : "to write"}, ${skipped} already present.`);
  if (!COMMIT) console.log("  DRY RUN — pass --commit to write.");
}
