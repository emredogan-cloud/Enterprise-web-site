#!/usr/bin/env node
/**
 * Originality check (Gate 3): 8-gram shingle overlap between a project's
 * CONTENT/ and a corpus of other Valice manuscripts.
 *
 *   node scripts/factory/similarity.mjs --project <dir> [--corpus <dir>]... [--threshold 0.15] [--json]
 *
 * Default corpus: every other project's CONTENT/*.md under the books root,
 * plus any *.md under 02_MANUSCRIPT/ of the legacy repositories, plus the
 * storefront blog. The score is containment: the share of the draft's
 * shingles that also occur in a corpus document. Above the threshold is an
 * error; the best-matching document is named so the overlap can be read.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

import { Report, finish, normalizeText } from "./lib/lint.mjs";
import { REPO_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

export function shingles(text, n = 8) {
  const words = normalizeText(text).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(" "));
  return out;
}

export function containment(a, b) {
  if (!a.size) return 0;
  let hit = 0;
  for (const s of a) if (b.has(s)) hit++;
  return hit / a.size;
}

function collectMarkdown(dir, out = [], depth = 0) {
  if (!existsSync(dir) || depth > 4) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".git", "09_ARCHIVE", "10_ARCHIVE", "OUTPUT", "QA", "ASSETS"].includes(entry)) continue;
      collectMarkdown(p, out, depth + 1);
    } else if (/\.(md|txt)$/.test(entry) && st.size > 500) out.push(p);
  }
  return out;
}

export function defaultCorpus(booksRoot, excludeRoot) {
  const files = [];
  if (existsSync(booksRoot)) {
    for (const entry of readdirSync(booksRoot)) {
      const p = join(booksRoot, entry);
      if (!statSync(p).isDirectory() || resolve(p) === resolve(excludeRoot)) continue;
      for (const sub of ["CONTENT", "02_MANUSCRIPT", "01_SOURCE"]) collectMarkdown(join(p, sub), files, 0);
    }
  }
  collectMarkdown(join(REPO_ROOT, "src", "content", "blog"), files, 0);
  return files;
}

export function compare(draftFiles, corpusFiles, threshold, report) {
  const draftText = draftFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const draft = shingles(draftText);
  if (draft.size < 50) {
    report.skipped("similarity", `draft too short for 8-gram comparison (${draft.size} shingles)`);
    return report;
  }
  let worst = { file: null, score: 0 };
  for (const f of corpusFiles) {
    const score = containment(draft, shingles(readFileSync(f, "utf8")));
    if (score > worst.score) worst = { file: f, score };
  }
  if (!corpusFiles.length) report.skipped("similarity", "empty corpus");
  else if (worst.score > threshold) report.error("overlap", `${(worst.score * 100).toFixed(1)} % of the draft's 8-grams occur in ${worst.file} (threshold ${threshold * 100} %)`);
  else report.pass("overlap", `max ${(worst.score * 100).toFixed(1)} % vs ${corpusFiles.length} documents${worst.file ? ` (closest: ${basename(worst.file)})` : ""}`);
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) {
    console.error("usage: similarity.mjs --project <dir> [--corpus <dir>]... [--threshold 0.15]");
    process.exit(2);
  }
  const project = loadProject(args.project);
  const threshold = Number(args.threshold ?? 0.15);
  const draftFiles = collectMarkdown(join(project.root, "CONTENT"));
  const corpusDirs = args.corpus ? (Array.isArray(args.corpus) ? args.corpus : [args.corpus]) : null;
  const corpusFiles = corpusDirs
    ? corpusDirs.flatMap((d) => collectMarkdown(resolve(d)))
    : defaultCorpus(process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK", project.root);
  const report = new Report("similarity", join(project.root, "CONTENT"));
  if (!draftFiles.length) report.warn("content", "no CONTENT/*.md to compare");
  else compare(draftFiles, corpusFiles, threshold, report);
  finish(report, { projectRoot: project.root, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("similarity.mjs")) main();
