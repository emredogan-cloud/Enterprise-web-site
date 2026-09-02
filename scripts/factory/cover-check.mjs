#!/usr/bin/env node
/**
 * Cover asset checks (Gate 7) without image libraries: reads PNG/JPEG
 * headers directly and inspects PDFs with poppler's pdfinfo.
 *
 *   node scripts/factory/cover-check.mjs <file-or-dir> [--project <dir>] [--json]
 *
 * Slots and rules (valice-house/covers/COVER_STANDARDS.md):
 *   front-v<n>.png       PNG · ≥ 2400 × 3600 px · ratio 1:1.5 ± 5 % · sRGB/iCCP chunk present (warn if absent)
 *   kindle-v<n>.jpg      JPEG · exactly 1600 × 2560 (warn otherwise)
 *   paperback-wrap-v<n>.pdf / hardcover-wrap-v<n>.pdf   PDF · 1 page · ≤ 40 MB
 *   generated/…          ignored (raw model output, never a slot)
 * Every slot file must carry a version suffix; versions are never overwritten.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

import { Report, finish } from "./lib/lint.mjs";
import { loadProject, parseArgs } from "./lib/project.mjs";

export function pngInfo(buf) {
  if (buf.length < 33 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  let hasColorProfile = false;
  let offset = 8;
  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    if (type === "sRGB" || type === "iCCP") hasColorProfile = true;
    if (type === "IDAT" || type === "IEND") break;
    offset += 12 + len;
  }
  return { format: "png", width, height, colorType, hasColorProfile };
}

export function jpegInfo(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const len = buf.readUInt16BE(offset + 2);
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { format: "jpeg", height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7), components: buf[offset + 9] };
    }
    offset += 2 + len;
  }
  return null;
}

export function checkFile(path, report) {
  const name = basename(path);
  const dir = basename(join(path, ".."));
  if (dir === "generated") return; // raw model output is never a slot
  const buf = readFileSync(path);
  const versioned = /-v\d+\.[a-z]+$/.test(name);
  if (!versioned) report.error("version", "slot files must be named …-v<n>.<ext>", name);
  if (/^front-v\d+\.png$/.test(name)) {
    const info = pngInfo(buf);
    if (!info) return report.error("format", "not a PNG", name);
    if (info.width < 2400 || info.height < 3600) report.error("size", `${info.width}×${info.height} (min 2400×3600)`, name);
    const ratio = info.height / info.width;
    if (Math.abs(ratio - 1.5) > 0.075) report.error("ratio", `${ratio.toFixed(3)} (expected 1.5 ± 5 %)`, name);
    if (!info.hasColorProfile) report.warn("colorspace", "no sRGB/iCCP chunk — colour may shift in print/web", name);
    if (report.errors.every((e) => e.where !== name)) report.pass("front", `${info.width}×${info.height}`, name);
  } else if (/^kindle-v\d+\.jpg$/.test(name)) {
    const info = jpegInfo(buf);
    if (!info) return report.error("format", "not a JPEG", name);
    if (info.width !== 1600 || info.height !== 2560) report.warn("size", `${info.width}×${info.height} (KDP recommends 1600×2560)`, name);
    else report.pass("kindle", "1600×2560", name);
  } else if (/^(paperback|hardcover)-wrap-v\d+\.pdf$/.test(name)) {
    const mb = buf.length / 1048576;
    if (mb > 40) report.error("size", `${mb.toFixed(1)} MB (KDP limit 40 MB)`, name);
    try {
      const info = execFileSync("pdfinfo", [path], { encoding: "utf8" });
      const pages = Number((info.match(/Pages:\s+(\d+)/) ?? [])[1]);
      if (pages !== 1) report.error("pages", `${pages} pages (a cover wrap is one page)`, name);
      else report.pass("wrap", `${mb.toFixed(1)} MB, 1 page`, name);
    } catch {
      report.skipped("pdfinfo", `could not run pdfinfo on ${name}`);
    }
  } else if (/\.(png|jpe?g|pdf)$/i.test(name)) {
    report.warn("slot", "not a recognised cover slot name (front-v<n>.png, kindle-v<n>.jpg, paperback-wrap-v<n>.pdf, hardcover-wrap-v<n>.pdf)", name);
  }
}

export function checkPath(target, report) {
  const p = resolve(target);
  if (!existsSync(p)) {
    report.error("missing", `no such file or directory: ${p}`);
    return report;
  }
  if (statSync(p).isDirectory()) {
    const files = readdirSync(p).filter((f) => /\.(png|jpe?g|pdf)$/i.test(f));
    if (!files.length) report.warn("empty", `no cover files in ${p}`);
    for (const f of files) checkFile(join(p, f), report);
  } else checkFile(p, report);
  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let target = args._[0];
  let projectRoot = null;
  if (args.project) {
    const project = loadProject(args.project);
    projectRoot = project.root;
    target = target ?? join(project.root, "ASSETS", "cover");
  }
  if (!target) {
    console.error("usage: cover-check.mjs <file-or-dir> [--project <dir>]");
    process.exit(2);
  }
  const report = new Report("cover-check", resolve(target));
  checkPath(target, report);
  finish(report, { projectRoot, json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("cover-check.mjs")) main();
