#!/usr/bin/env node
/**
 * link-cover-slots.mjs — put a build's cover output into the house slot naming.
 *
 *   node scripts/factory/link-cover-slots.mjs [--commit]
 *
 * Two projects write their wraps as `OUTPUT/KDP/<FORMAT>/cover.pdf`; the rest write
 * `ASSETS/cover/<binding>-wrap-v<n>.pdf`. cover-check.mjs enforces the second, and
 * against the first it errors on the FILENAME and then checks nothing else — so three
 * covers that are geometrically correct had never actually been validated. A lint that
 * stops at the name is not validating the file.
 *
 * This copies the build output into the slot name and records the source checksum beside
 * it, so a later drift between the two is detectable rather than silent. It does not
 * change any build script: the build keeps writing where it writes.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const COMMIT = process.argv.includes("--commit");
const ROOT = process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";

const SLOTS = [
  { project: "ROADMAP-BOOKS/02-GREEK-ALPHABET-HANDWRITING-WORKBOOK",
    from: "OUTPUT/KDP/PAPERBACK/cover.pdf", to: "ASSETS/cover/paperback-wrap-v1.pdf" },
  { project: "ROADMAP-BOOKS/02-GREEK-ALPHABET-HANDWRITING-WORKBOOK",
    from: "OUTPUT/KDP/HARDCOVER/cover.pdf", to: "ASSETS/cover/hardcover-wrap-v1.pdf" },
  { project: "ROADMAP-BOOKS/04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK",
    from: "OUTPUT/HARDCOVER/cover.pdf", to: "ASSETS/cover/hardcover-wrap-v1.pdf" },
  { project: "ROADMAP-BOOKS/04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK",
    from: "OUTPUT/PAPERBACK/cover.pdf", to: "ASSETS/cover/paperback-wrap-v1.pdf" },
];

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

let done = 0, missing = 0;
const record = [];
for (const s of SLOTS) {
  const from = join(ROOT, s.project, s.from);
  const to = join(ROOT, s.project, s.to);
  if (!existsSync(from)) { missing++; console.log(`  no build output  ${s.project}/${s.from}`); continue; }
  const src = sha(from);
  const same = existsSync(to) && sha(to) === src;
  if (COMMIT && !same) { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); }
  record.push({ project: s.project, buildOutput: s.from, slot: s.to, sha256: src });
  done++;
  console.log(`  ${same ? "already current" : COMMIT ? "copied         " : "would copy     "}  ${s.project.split("/").pop()}  ${s.from} → ${s.to}`);
}
if (COMMIT) {
  for (const proj of [...new Set(record.map((r) => r.project))]) {
    const qa = join(ROOT, proj, "QA");
    mkdirSync(qa, { recursive: true });
    writeFileSync(join(qa, "cover-slots.json"), JSON.stringify({
      $why: "These slot files are COPIES of this project's build output, made so cover-check.mjs " +
            "can see them at all — it errors on an unrecognised filename and then validates " +
            "nothing. The sha256 below is the build output's at copy time; if the two ever " +
            "disagree, the slot is stale and the build output is the truth.",
      copiedAt: "2026-09-07",
      slots: record.filter((r) => r.project === proj),
    }, null, 1) + "\n");
  }
}
console.log(`\n  ${done} slot(s) ${COMMIT ? "in place" : "to copy"}, ${missing} with no build output.`);
if (!COMMIT) console.log("  DRY RUN — pass --commit.");
