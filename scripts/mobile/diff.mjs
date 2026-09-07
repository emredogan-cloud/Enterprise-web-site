#!/usr/bin/env node
/**
 * Pixel-diff two capture directories — the desktop regression gate.
 *
 *   npm run mobile:diff -- --before docs/execution/mobile/baseline/phase-0/desktop-1440 \
 *                          --after  docs/execution/mobile/baseline/phase-1/desktop-1440
 *
 * Uses ImageMagick `compare -metric AE` (absolute error: the count of pixels
 * that differ). Exits non-zero when any pair differs by more than `--tolerance`
 * pixels, so a phase cannot close on an unnoticed desktop change.
 *
 * Differences are expected in exactly two places in this roadmap — Phase 2's
 * document-level theme and Phase 8's image priority — and both must be
 * consciously accepted and recorded in that phase's report. Everywhere else,
 * zero.
 */
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const BEFORE = arg("before", null);
const AFTER = arg("after", null);
const TOLERANCE = Number(arg("tolerance", 0));
const OUTDIR = arg("outdir", null);   // where to write visual diff images

if (!BEFORE || !AFTER) {
  console.error("usage: mobile:diff -- --before <dir> --after <dir> [--tolerance N] [--outdir <dir>]");
  process.exit(2);
}

const beforeDir = resolve(process.cwd(), BEFORE);
const afterDir = resolve(process.cwd(), AFTER);
for (const d of [beforeDir, afterDir]) {
  if (!existsSync(d)) { console.error(`╳ missing directory: ${d}`); process.exit(2); }
}
if (OUTDIR) mkdirSync(resolve(process.cwd(), OUTDIR), { recursive: true });

const imgs = (d) => readdirSync(d).filter((f) => /\.(png|webp)$/i.test(f)).sort();
const beforeFiles = imgs(beforeDir);
const afterFiles = imgs(afterDir);

/** Pixels that differ between two images; null when they cannot be compared. */
function pixelDelta(a, b, outPath) {
  try {
    const args = ["-metric", "AE", a, b, outPath ?? "null:"];
    // `compare` writes the metric to stderr and exits 1 when images differ.
    execFileSync("compare", args, { stdio: ["ignore", "ignore", "pipe"] });
    return 0;
  } catch (err) {
    const out = String(err.stderr ?? "").trim();
    const m = /^(\d+(?:\.\d+)?)/.exec(out);
    if (m) return Number(m[1]);
    if (/geometry does not match|widths or heights differ/i.test(out)) return Infinity;
    return null;
  }
}

console.log(`\n▸ Desktop regression diff`);
console.log(`  before: ${BEFORE}  (${beforeFiles.length} images)`);
console.log(`  after:  ${AFTER}  (${afterFiles.length} images)\n`);

const onlyBefore = beforeFiles.filter((f) => !afterFiles.includes(f));
const onlyAfter = afterFiles.filter((f) => !beforeFiles.includes(f));
const common = beforeFiles.filter((f) => afterFiles.includes(f));

const changed = [];
for (const f of common) {
  const out = OUTDIR ? join(resolve(process.cwd(), OUTDIR), `diff-${f.replace(/\.\w+$/, ".png")}`) : null;
  const delta = pixelDelta(join(beforeDir, f), join(afterDir, f), out);
  if (delta === null) { console.log(`  ? ${f.padEnd(30)} could not compare`); continue; }
  if (delta === Infinity) { console.log(`  ╳ ${f.padEnd(30)} DIMENSIONS DIFFER`); changed.push({ f, delta: "dimensions" }); continue; }
  if (delta > TOLERANCE) {
    console.log(`  ╳ ${f.padEnd(30)} ${delta} px differ`);
    changed.push({ f, delta });
  } else {
    console.log(`  ✓ ${f.padEnd(30)} identical`);
  }
}

if (onlyBefore.length) console.log(`\n  ⚠ only in before: ${onlyBefore.join(", ")}`);
if (onlyAfter.length) console.log(`  ⚠ only in after:  ${onlyAfter.join(", ")}`);

const missing = onlyBefore.length + onlyAfter.length;
console.log(`\n▸ ${common.length - changed.length}/${common.length} identical` +
            (changed.length ? `, ${changed.length} changed` : "") +
            (missing ? `, ${missing} unpaired` : ""));

if (changed.length || missing) process.exit(1);
