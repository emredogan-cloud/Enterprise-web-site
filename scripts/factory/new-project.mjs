#!/usr/bin/env node
/**
 * Instantiate a new content project from the house template.
 *
 *   node scripts/factory/new-project.mjs --slug greek-alphabet-handwriting-workbook \
 *        --title "The Greek Alphabet Handwriting Workbook" --series valice-script --lane A \
 *        [--dest /home/emre/Downloads/MY-DİGİTAL-BOOK] [--dry-run]
 *
 * Creates `<dest>/<SLUG-UPPER-KEBAB>/` from `valice-house/templates/project-template/`,
 * fills the placeholders, writes gates.json (all twelve gates not_started),
 * state.json (IDEA) and `.gate`. Refuses to overwrite an existing directory.
 *
 * Dry run (default when --dry-run is passed) prints the plan and writes
 * nothing. Nothing about the book's content is invented: MARKET.md, RIGHTS.md,
 * SPEC.md etc. are skeletons whose every section says NOT STARTED.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  FactoryError,
  HOUSE_ROOT,
  emptyGateRecord,
  emptyState,
  loadHouse,
  parseArgs,
  writeJSON,
} from "./lib/project.mjs";

const SERIES = {
  "valice-script": { name: "Valice Script", bible: "valice-house/series-bibles/valice-script.md" },
  codex: { name: "Codex", bible: "valice-house/series-bibles/codex.md" },
  "the-great-book-of": { name: "The Great Book of…", bible: "valice-house/series-bibles/the-great-book-of.md" },
  "field-book": { name: "Field Book", bible: "valice-house/series-bibles/field-book.md" },
  "valice-classics": { name: "Valice Classics", bible: "valice-house/series-bibles/valice-classics.md" },
  none: { name: "(standalone)", bible: null },
};

export function slugToDirName(slug) {
  return slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function render(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : `{{${k}}}`));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function planProject({ slug, title, series, lane, dest, templateRoot }) {
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new FactoryError("--slug must be lower-kebab-case");
  if (!title) throw new FactoryError("--title is required");
  if (!SERIES[series]) throw new FactoryError(`--series must be one of ${Object.keys(SERIES).join("|")}`);
  if (!["A", "B", "C"].includes(lane)) throw new FactoryError("--lane must be A, B or C");
  const dirName = slugToDirName(slug);
  const target = join(resolve(dest), dirName);
  if (existsSync(target)) throw new FactoryError(`refusing to overwrite existing project directory ${target}`);
  if (!existsSync(templateRoot)) throw new FactoryError(`template missing: ${templateRoot}`);
  return { slug, title, series, lane, dirName, target, templateRoot };
}

export function createProject(plan, house, { dryRun = true, today = new Date().toISOString().slice(0, 10) } = {}) {
  const vars = {
    slug: plan.slug,
    title: plan.title,
    series: plan.series,
    seriesName: SERIES[plan.series].name,
    seriesBible: SERIES[plan.series].bible ?? "(none)",
    lane: plan.lane,
    date: today,
    dirName: plan.dirName,
  };
  const files = walk(plan.templateRoot);
  const actions = files.map((src) => ({ src, dest: join(plan.target, src.slice(plan.templateRoot.length + 1)) }));
  if (dryRun) {
    return { vars, actions, written: false };
  }
  mkdirSync(plan.target, { recursive: true });
  for (const { src, dest } of actions) {
    mkdirSync(join(dest, ".."), { recursive: true });
    if (/\.(md|json|txt|py|jsonl|gitkeep)$/.test(src) || src.endsWith(".gate")) {
      writeFileSync(dest, render(readFileSync(src, "utf8"), vars));
    } else {
      cpSync(src, dest);
    }
  }
  writeJSON(join(plan.target, "gates.json"), emptyGateRecord(house));
  const state = emptyState(house);
  writeJSON(join(plan.target, "state.json"), state);
  writeFileSync(join(plan.target, ".gate"), `${state.state.toLowerCase()}\n`);
  return { vars, actions, written: true };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dest = args.dest ?? process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";
  const templateRoot = join(HOUSE_ROOT, "templates", "project-template");
  const plan = planProject({
    slug: args.slug,
    title: args.title,
    series: args.series ?? "none",
    lane: args.lane ?? "A",
    dest,
    templateRoot,
  });
  const house = loadHouse();
  const dryRun = Boolean(args["dry-run"]) || !args.commit;
  const result = createProject(plan, house, { dryRun });
  console.log(`${dryRun ? "DRY RUN — " : ""}project ${plan.dirName}`);
  console.log(`  target : ${plan.target}`);
  console.log(`  series : ${result.vars.seriesName} (${plan.series}) · lane ${plan.lane}`);
  console.log(`  files  : ${result.actions.length} from template + gates.json + state.json + .gate`);
  if (dryRun) console.log("  (pass --commit to write)");
  else console.log("  written.");
}

if (process.argv[1] && process.argv[1].endsWith("new-project.mjs")) {
  try {
    main();
  } catch (e) {
    console.error(`new-project: ${e.message}`);
    process.exit(e.code ?? 1);
  }
}
