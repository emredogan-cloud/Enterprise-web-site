#!/usr/bin/env node
/**
 * House-style checks (Gate 6) over a project's CONTENT/ or a single file.
 *
 *   node scripts/factory/style-lint.mjs --project <dir> [--json]
 *   node scripts/factory/style-lint.mjs --file <markdown>
 *
 * Reads the JSON block at the end of valice-house/house-style/HOUSE_STYLE.md:
 *   - banned phrases (marketing superlatives, AI self-reference, placeholders)
 *   - heading levels: a single H1 per file, no skipped levels, max depth
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { Report, finish, jsonBlockFromMarkdown } from "./lib/lint.mjs";
import { HOUSE_ROOT, loadProject, parseArgs } from "./lib/project.mjs";

export function lintStyle(files, style, report = new Report("style-lint", "content")) {
  const banned = (style?.bannedPhrases ?? []).map((p) => p.toLowerCase());
  const maxLevel = style?.headingLevels?.max ?? 3;
  const singleH1 = style?.headingLevels?.requireSingleH1 ?? true;
  if (!files.length) report.warn("content", "nothing to lint");
  for (const { name, text } of files) {
    const lines = text.split("\n");
    let h1 = 0;
    let prevLevel = 0;
    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      for (const p of banned) if (lower.includes(p)) report.error("banned-phrase", `"${p}"`, `${name}:${i + 1}`);
      const h = line.match(/^(#{1,6})\s/);
      if (h) {
        const level = h[1].length;
        if (level === 1) h1++;
        if (level > maxLevel) report.error("heading-depth", `H${level} deeper than max H${maxLevel}`, `${name}:${i + 1}`);
        if (prevLevel && level > prevLevel + 1) report.error("heading-skip", `H${prevLevel} → H${level}`, `${name}:${i + 1}`);
        prevLevel = level;
      }
    });
    if (singleH1 && h1 !== 1) report.error("single-h1", `${h1} H1 headings (expected 1)`, name);
  }
  if (!report.errors.length && files.length) report.pass("style", `${files.length} files clean`);
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const style = jsonBlockFromMarkdown(join(HOUSE_ROOT, "house-style", "HOUSE_STYLE.md"));
  let files = [];
  let projectRoot = null;
  if (args.project) {
    const project = loadProject(args.project);
    projectRoot = project.root;
    const dir = join(project.root, "CONTENT");
    files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => ({ name: `CONTENT/${f}`, text: readFileSync(join(dir, f), "utf8") })) : [];
  } else if (args.file) {
    const p = resolve(args.file);
    files = [{ name: p, text: readFileSync(p, "utf8") }];
  } else {
    console.error("usage: style-lint.mjs --project <dir> | --file <md>");
    process.exit(2);
  }
  const report = new Report("style-lint", projectRoot ?? args.file);
  if (!style) report.skipped("house-style", "no JSON block found in HOUSE_STYLE.md");
  lintStyle(files, style ?? {}, report);
  finish(report, { projectRoot, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("style-lint.mjs")) main();
