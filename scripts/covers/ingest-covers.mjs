#!/usr/bin/env node
/**
 * Deterministic cover ingestion: the founder drops files into a slot, the
 * storefront asset is derived — no code change per book.
 *
 *   node scripts/covers/ingest-covers.mjs --slug <slug> [--source <dir>] [--commit] [--json]
 *
 * Source resolution (first that exists):
 *   --source <dir>
 *   assets/<slug>/cover/                       (drop folder in this repo, gitignored)
 *   $VALICE_BOOKS_ROOT/<SLUG-UPPER-KEBAB>/ASSETS/cover/   (a factory project)
 * The highest `front-v<n>.png` is validated (scripts/factory/cover-check.mjs
 * rules), then converted with ImageMagick to
 * `public/images/books/<slug>.webp` (height 1600, quality 82, metadata
 * stripped). The output must be ≤ 400 KB and 1:1.5 ± 5 %.
 *
 * Dry run is the default: it prints what would happen and writes nothing.
 * A missing source is an error, never a placeholder: `validate:catalog`
 * flags a published book without a webp.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

import { Report, finish } from "../factory/lib/lint.mjs";
import { checkFile } from "../factory/cover-check.mjs";
import { REPO_ROOT, parseArgs } from "../factory/lib/project.mjs";
import { slugToDirName } from "../factory/new-project.mjs";

export function resolveSource(slug, explicit) {
  const candidates = [
    explicit ? resolve(explicit) : null,
    join(REPO_ROOT, "assets", slug, "cover"),
    join(process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK", slugToDirName(slug), "ASSETS", "cover"),
  ].filter(Boolean);
  return candidates.find((c) => existsSync(c)) ?? null;
}

export function latestFront(dir) {
  const fronts = readdirSync(dir)
    .map((f) => ({ f, m: f.match(/^front-v(\d+)\.png$/) }))
    .filter((x) => x.m)
    .map((x) => ({ file: x.f, version: Number(x.m[1]) }))
    .sort((a, b) => b.version - a.version);
  return fronts[0] ?? null;
}

export function haveImageMagick() {
  try {
    execFileSync("convert", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function convertToWebp(src, dest) {
  mkdirSync(join(dest, ".."), { recursive: true });
  execFileSync("convert", [src, "-strip", "-resize", "x1600>", "-quality", "82", "-define", "webp:method=6", dest], { stdio: "inherit" });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(args.slug)) {
    console.error("usage: ingest-covers.mjs --slug <slug> [--source <dir>] [--commit]");
    process.exit(2);
  }
  const report = new Report("ingest-covers", args.slug);
  const source = resolveSource(args.slug, args.source);
  if (!source) {
    report.error("source", `no cover directory found for ${args.slug} (looked in assets/${args.slug}/cover and the project's ASSETS/cover)`);
    return finish(report, { json: Boolean(args.json) });
  }
  const front = latestFront(source);
  if (!front) {
    report.error("front", `no front-v<n>.png in ${source}`);
    return finish(report, { json: Boolean(args.json) });
  }
  const srcPath = join(source, front.file);
  checkFile(srcPath, report);
  if (!report.ok) return finish(report, { json: Boolean(args.json) });

  const dest = join(REPO_ROOT, "public", "images", "books", `${args.slug}.webp`);
  const commit = Boolean(args.commit);
  if (!haveImageMagick()) {
    report.skipped("convert", "ImageMagick `convert` not found — install imagemagick or run on a machine that has it");
    return finish(report, { json: Boolean(args.json) });
  }
  if (!commit) {
    report.pass("plan", `${srcPath} → ${dest} (height 1600, q82, strip). Pass --commit to write.`);
    return finish(report, { json: Boolean(args.json) });
  }
  convertToWebp(srcPath, dest);
  const size = statSync(dest).size;
  if (size > 400 * 1024) report.warn("output-size", `${(size / 1024).toFixed(0)} KB > 400 KB — consider a lower quality or a smaller source`);
  const identify = execFileSync("identify", ["-format", "%w %h", dest], { encoding: "utf8" }).trim().split(" ").map(Number);
  const ratio = identify[1] / identify[0];
  if (Math.abs(ratio - 1.5) > 0.075) report.error("output-ratio", `${identify[0]}×${identify[1]}`);
  else report.pass("written", `${dest} ${identify[0]}×${identify[1]} ${(size / 1024).toFixed(0)} KB (from ${front.file})`);
  finish(report, { json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("ingest-covers.mjs")) main();
