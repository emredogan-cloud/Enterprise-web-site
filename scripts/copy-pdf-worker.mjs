#!/usr/bin/env node
/**
 * Copy the pdf.js worker file from `node_modules/pdfjs-dist/build/` into
 * `public/pdf.worker.min.mjs` so the running app can serve it from a
 * same-origin URL (`/pdf.worker.min.mjs`).
 *
 * Why a copy instead of a bundler import:
 *   - Same-origin serving keeps our CSP `worker-src 'self' blob:` strict —
 *     no need to allowlist a CDN or any cross-origin worker source.
 *   - The worker version always matches the installed pdfjs-dist (no
 *     CDN-version-drift class of bugs).
 *   - Deterministic in every environment: `npm install` runs `postinstall`
 *     which runs this script; CI / Vercel / local dev all get the same
 *     bytes from the same node_modules tree.
 *
 * The public/pdf.worker.min.mjs file is gitignored — it is a derived
 * artifact, regenerated on every install.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, "..");

const SRC_CANDIDATES = [
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/build/pdf.worker.mjs",
];

const DEST_REL = "public/pdf.worker.min.mjs";
const dest = join(projectRoot, DEST_REL);

let chosen = null;
for (const rel of SRC_CANDIDATES) {
  const src = join(projectRoot, rel);
  if (existsSync(src)) {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    chosen = rel;
    break;
  }
}

if (chosen) {
  console.log(`[copy-pdf-worker] ${chosen} → ${DEST_REL}`);
} else {
  // Soft-fail so a fresh `npm install` (where pdfjs-dist may transiently
  // not be on disk yet during the install lifecycle) does not abort.
  console.warn(
    "[copy-pdf-worker] pdfjs-dist worker not found; reader will not function until this resolves.",
  );
  process.exit(0);
}
