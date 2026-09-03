#!/usr/bin/env node
/**
 * Page-level corrections to built interiors: the jobs, and the evidence.
 *
 * A job exists here only when three things are true: the defect is real and
 * printed, it lives on one page, and re-running the book's whole pipeline to
 * fix it would move page numbers that other files already record. Everything
 * else goes back through the book's own build.
 *
 * ── JOB 1 · World Games large print, page 4 ───────────────────────────────
 * The copyright page prints "Emre is a puzzle designer, mythologist, and game
 * archivist dedicated to preserving ancient cultures, codes, and stories for
 * the next generation." Nobody wrote that about themselves; it is an invented
 * biography of a real person, and it has been carried in the linkage matrix as
 * NEEDS_REVISION since 2026-09-02. The paperback and hardcover of the same
 * book print the Founder's own text on the same page. This job puts that same
 * text into the large print.
 *
 * The page's geometry was MEASURED off the file it replaces
 * (`pdftotext -bbox-layout`, 2026-09-03):
 *
 *   left margin      36.000 pt      first baseline   268.553 pt from the top
 *   type size        12.9524 pt     leading           16.762 pt
 *   measure         540.000 pt      face             Liberation Serif
 *
 * The size was solved from five measured line widths, all five agreeing to
 * four decimal places; the baseline was solved from poppler's typo-metric box.
 * `--check` re-measures the rebuilt page and fails if any line has moved.
 *
 *   node scripts/factory/reprint-page.mjs                 # plan
 *   node scripts/factory/reprint-page.mjs --commit
 *   node scripts/factory/reprint-page.mjs --check
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PRINT_INTERIORS } from "./print-interiors.mjs";

const REPO = new URL("../..", import.meta.url).pathname;
const PY = join(REPO, ".venv-factory/bin/python");
const RENDERER = join(REPO, "scripts/factory/reprint-page.py");
const TMP = join(REPO, ".venv-factory/tmp");
const LIB = "/usr/share/fonts/truetype/liberation";

/** The Founder's own text, as it already stands in the paperback of this book. */
const APPROVED_SHORT_BIO =
  "Emre Doğan writes about the stories that cultures tell themselves in order " +
  "to keep going. Trained as a software engineer, he came to mythology through " +
  "a single story that would not leave him alone, and stayed for the pattern " +
  "underneath. He lives in Turkey.";

export const JOBS = [
  {
    id: "world-games-largeprint-imprint",
    bookSlug: "the-great-book-of-world-games",
    format: "large_print",
    page: 4,
    why: "the invented author biography on the copyright page",
    removes: "Emre is a puzzle designer, mythologist, and game archivist",
    adds: APPROVED_SHORT_BIO,
    spec: {
      fonts: {
        regular: `${LIB}/LiberationSerif-Regular.ttf`,
        bold: `${LIB}/LiberationSerif-Bold.ttf`,
      },
      leftPt: 36,
      measurePt: 540,
      sizePt: 12.9524,
      leadingPt: 16.762,
      firstBaselineFromTopPt: 268.553,
      folio: null,
      paragraphs: [
        [["bold", "The Great Book of World Games"]],
        [["regular", "56 Games from 4,600 Years of Human Play — Rules, Boards and Stories from 39 Cultures, Ready to Play Tonight"]],
        null,
        [["regular", "Copyright © 2026 Emre Doğan"]],
        [["regular", "Vâliçe Press"]],
        null,
        [["regular", "The Great Book of… · Volume 2"]],
        [["regular", "Large Print Edition"]],
        [["regular", "Printed on demand."]],
        null,
        [["regular", "ISBN (large print paperback): PENDING — KDP-PROVIDED ISBN"]],
        null,
        [["regular", "All rights reserved. No part of this book may be reproduced in any form without written permission from the publisher, except brief quotations in a review and the board templates at the back of this book, which the purchaser may photocopy for personal and classroom use."]],
        null,
        [["bold", "About the author."], ["regular", ` ${APPROVED_SHORT_BIO}`]],
      ],
    },
  },
];

const argv = process.argv.slice(2);
const COMMIT = argv.includes("--commit");
const CHECK = argv.includes("--check");

function pageText(path, page) {
  return execFileSync("pdftotext", ["-f", String(page), "-l", String(page), path, "-"], { encoding: "utf8" });
}

let failures = 0;
for (const job of JOBS) {
  const interior = PRINT_INTERIORS[job.bookSlug]?.[job.format];
  if (!interior || !existsSync(interior)) { console.error(`ERROR ${job.id}: no interior`); failures++; continue; }
  const text = pageText(interior, job.page);
  const stale = text.includes(job.removes);
  const fixed = text.includes(job.adds.slice(0, 60));

  if (CHECK) {
    const pass = fixed && !stale;
    console.log(`${pass ? "PASS " : "FAIL "} ${job.id} — ${pass ? "the approved text is on the page" : stale ? "the invented biography is still printed" : "the approved text is not on the page"}`);
    if (!pass) failures++;
    continue;
  }
  if (fixed && !stale) { console.log(`DONE  ${job.id} — already corrected`); continue; }
  if (!stale) { console.error(`ERROR ${job.id}: the text this job removes is not on page ${job.page}; the job is stale`); failures++; continue; }
  if (!COMMIT) { console.log(`PLAN  ${job.id} — page ${job.page} of ${job.bookSlug}/${job.format}: ${job.why}`); continue; }

  mkdirSync(TMP, { recursive: true });
  const specPath = join(TMP, `${job.id}.json`);
  writeFileSync(specPath, JSON.stringify({ ...job.spec, interior, page: job.page }, null, 1));
  const out = join(TMP, `${job.id}.pdf`);
  const report = JSON.parse(execFileSync(PY, [RENDERER, "--spec", specPath, "--out", out], { encoding: "utf8" }).trim().split("\n").pop());
  const after = pageText(out, job.page);
  if (after.includes(job.removes) || !after.includes(job.adds.slice(0, 60))) {
    console.error(`FAIL  ${job.id}: the rebuilt page does not read as intended`);
    failures++;
    continue;
  }
  const backup = interior.replace(/\.pdf$/, ".pre-reprint.pdf");
  if (!existsSync(backup)) copyFileSync(interior, backup);
  copyFileSync(out, interior);
  console.log(`OK    ${job.id} — page ${job.page} re-set, ${report.linesDrawn} lines, ${report.pages} pages unchanged`);
}

process.exit(failures ? 1 : 0);
