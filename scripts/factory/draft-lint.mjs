#!/usr/bin/env node
/**
 * Draft checks for a project's CONTENT/ (Gate 4).
 *
 *   node scripts/factory/draft-lint.mjs --project <dir> [--json]
 *
 * Reads the budget block from SPEC.md (```json {"wordBudget":{"min","max"},
 * "requiredSections":[...]} ```) and checks every CONTENT/*.md:
 *   - no placeholder tokens ({{…}}, [TBD], TODO, lorem ipsum, XXX, [PLACEHOLDER])
 *   - total word count inside the budget (±10 % is a warning band)
 *   - required sections present (as headings) somewhere in CONTENT/
 *   - no sentence longer than the audience's maximum (house-style JSON)
 *   - no text matching a rejected fact
 * Writes the measured word count into QA/draft-lint.json (the project config's
 * `measured.words` is updated from there by the build, never by hand).
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { Report, finish, jsonBlockFromMarkdown, normalizeText, readJSONL } from "./lib/lint.mjs";
import { HOUSE_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

const PLACEHOLDER = /\{\{[^}]+\}\}|\[TBD\]|\bTODO\b|lorem ipsum|\bXXX\b|\[PLACEHOLDER\]/i;

export function wordCount(text) {
  return (text.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;
}

export function lintDraft({ files, spec, style, audience = "adult", rejected = [] }, report = new Report("draft-lint", "CONTENT")) {
  if (!files.length) {
    report.warn("content", "CONTENT/ has no markdown files yet");
    return { report, words: 0 };
  }
  const maxSentence = style?.readingLevel?.[audience]?.maxSentenceWords ?? 45;
  const rejectedTexts = rejected.map((r) => normalizeText(r.statement)).filter(Boolean);
  let words = 0;
  const headings = new Set();
  for (const { name, text } of files) {
    words += wordCount(text);
    text.split("\n").forEach((line, i) => {
      if (PLACEHOLDER.test(line)) report.error("placeholder", line.trim().slice(0, 80), `${name}:${i + 1}`);
      const h = line.match(/^(#{1,6})\s+(.+)/);
      if (h) headings.add(normalizeText(h[2]));
    });
    for (const sentence of text.replace(/^#.*$/gm, "").split(/(?<=[.!?])\s+/)) {
      const n = wordCount(sentence);
      if (n > maxSentence) report.warn("sentence-length", `${n} words (max ${maxSentence}): "${sentence.trim().slice(0, 60)}…"`, name);
    }
    const norm = normalizeText(text);
    for (const r of rejectedTexts) if (r && norm.includes(r)) report.error("rejected-fact", `contains a rejected statement: "${r.slice(0, 60)}"`, name);
  }
  const budget = spec?.wordBudget ?? {};
  if (budget.min != null && budget.max != null) {
    if (words < budget.min * 0.9 || words > budget.max * 1.1) report.error("word-budget", `${words} words, budget ${budget.min}–${budget.max}`);
    else if (words < budget.min || words > budget.max) report.warn("word-budget", `${words} words, budget ${budget.min}–${budget.max} (within 10 %)`);
    else report.pass("word-budget", `${words} words`);
  } else report.skipped("word-budget", "SPEC.md has no wordBudget yet");
  for (const s of spec?.requiredSections ?? []) {
    if (!headings.has(normalizeText(s))) report.error("required-section", `missing heading "${s}"`);
  }
  if (!report.errors.length) report.pass("draft", `${files.length} files, ${words} words`);
  return { report, words };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.project) {
    console.error("usage: draft-lint.mjs --project <dir> [--json]");
    process.exit(2);
  }
  const project = loadProject(args.project);
  const dir = join(project.root, "CONTENT");
  const files = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => ({ name: `CONTENT/${f}`, text: readFileSync(join(dir, f), "utf8") }))
    : [];
  const spec = jsonBlockFromMarkdown(join(project.root, "SPEC.md"));
  const style = jsonBlockFromMarkdown(join(HOUSE_ROOT, "house-style", "HOUSE_STYLE.md"));
  const rejected = readJSONL(join(HOUSE_ROOT, "rejected-facts", "rejected.jsonl"));
  const audience = project.config.audience?.readingLevel ?? "adult";
  const report = new Report("draft-lint", dir);
  const { words } = lintDraft({ files, spec, style, audience, rejected }, report);
  report.findings.push({ level: "pass", check: "measured.words", message: String(words), where: null });
  finish(report, { projectRoot: project.root, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("draft-lint.mjs")) main();
