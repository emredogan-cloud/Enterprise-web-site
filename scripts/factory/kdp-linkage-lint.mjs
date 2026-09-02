#!/usr/bin/env node
/**
 * Does this printed book tell its reader that valicepress.com exists?
 *
 * WHY IT MATTERS MORE THAN IT SOUNDS
 * A reader who buys a Valice book on Amazon is, commercially, a stranger.
 * Amazon does not share their address and never will. The single place we are
 * allowed to speak to them again is inside the book they already paid for —
 * and only if the book carries a reason to visit and an address to visit. Every
 * Valice interior printed so far was typeset before the companions existed, so
 * every one of them ends without either. That is the whole gap between "eight
 * titles on Amazon" and "an audience".
 *
 * WHAT IT CHECKS, per built interior PDF:
 *   1. any valicepress.com URL at all;
 *   2. the companion URL specifically, when the book has a companion;
 *   3. that the URL is the canonical host — not a `.vercel.app` preview, not
 *      localhost, not a retired domain. A printed wrong URL cannot be patched;
 *   4. that the companion page it names actually resolves (registry lookup);
 *   5. that no promised URL is a data wall — KDP forbids a hyperlink whose
 *      purpose is collecting customer information, and the house rule is
 *      stricter: real free value first, email optional forever.
 *
 * It reads the PDF's text with `pdftotext`, which is what a KDP reviewer's
 * eyes and every automated scan see. A URL rendered only as a QR image is
 * reported as such rather than counted as present.
 *
 *   node scripts/factory/kdp-linkage-lint.mjs                 # every book
 *   node scripts/factory/kdp-linkage-lint.mjs --slug hangul   # one
 *   node scripts/factory/kdp-linkage-lint.mjs --json
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

import { BOOKS } from "../catalog/valice-catalog.mjs";
import { PRINT_INTERIORS } from "./print-interiors.mjs";

const CANONICAL = "valicepress.com";
/** Hosts that must never reach print. Each one has actually appeared somewhere. */
const FORBIDDEN = [
  /localhost(:\d+)?/i,
  /\d+\.\d+\.\d+\.\d+:\d+/,
  /[a-z0-9-]+\.vercel\.app/i,
  /valice-press\.(com|net|org)/i,
];
/** A URL whose only purpose is a form. KDP prohibits it; so do we. */
const DATA_WALL = /(subscribe|signup|sign-up|optin|opt-in|newsletter|mailinglist)\b/i;

/**
 * Copy that must never reach print again. Found the same way as the missing
 * URLs — by reading the built interiors rather than the source that made them.
 *
 * The first entry is not hypothetical: "Emre is a puzzle designer,
 * mythologist, and game archivist…" is a biography nobody authorised, naming
 * three occupations the Founder has not claimed, and it was printed on the
 * imprint page AND the back cover of three live World Games editions.
 */
const BANNED_COPY = [
  {
    re: /puzzle designer,\s*mythologist/i,
    what: "the invented author biography ('puzzle designer, mythologist, and game archivist')",
    fix: "replace with the Founder's own biography — project_config.json → founder.authorBio",
  },
  {
    re: /Digital Bookstore/i,
    what: "the pre-rebrand imprint name 'Digital Bookstore'",
    fix: "the imprint is Vâliçe Press in print and Valice Press online",
  },
  {
    re: /Lorem ipsum|TK TK|XXX PLACEHOLDER/i,
    what: "placeholder text",
    fix: "write the real copy",
  },
];

const args = process.argv.slice(2);
const only = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const asJson = args.includes("--json");

/** Companion registry, read from the site's own source so the two cannot drift. */
async function companionsByBook() {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync("src/lib/companions.ts", "utf8"),
  );
  const map = new Map();
  for (const m of src.matchAll(/slug:\s*"([a-z0-9-]+)",\s*\n\s*bookSlug:\s*"([a-z0-9-]+)"/g)) {
    map.set(m[2], m[1]);
  }
  return map;
}

function pdfText(file) {
  try {
    return execFileSync("pdftotext", ["-q", file, "-"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    return { error: err.message };
  }
}

const companions = await companionsByBook();
const rows = [];

for (const book of BOOKS) {
  if (only && book.slug !== only) continue;
  const interiors = PRINT_INTERIORS[book.slug] ?? {};
  const companionSlug = companions.get(book.slug) ?? null;
  const companionUrl = companionSlug ? `https://${CANONICAL}/companion/${companionSlug}` : null;

  for (const format of ["paperback", "hardcover", "large_print"]) {
    const spec = book.formats.find((f) => f.format === format);
    if (!spec || spec.availability === "unavailable") continue;

    const file = interiors[format] ?? null;
    const row = {
      book: book.slug,
      title: book.title,
      format,
      asin: spec.amazonAsin ?? null,
      live: spec.availability === "available" && Boolean(spec.amazonAsin),
      companionSlug,
      companionUrl,
      interior: file,
    };

    if (!file || !existsSync(file)) {
      row.status = file ? "BLOCKED" : "BLOCKED";
      row.detail = file
        ? `interior not on disk: ${file}`
        : "no built interior is registered for this format";
      row.action = file
        ? "rebuild the interior, or correct the path in scripts/factory/print-interiors.mjs"
        : "register the built interior in scripts/factory/print-interiors.mjs";
      rows.push(row);
      continue;
    }

    const text = pdfText(file);
    if (typeof text !== "string") {
      row.status = "BLOCKED";
      row.detail = `pdftotext failed: ${text.error}`;
      row.action = "install poppler-utils";
      rows.push(row);
      continue;
    }

    const flat = text.replace(/\s+/g, " ");
    const urls = [...flat.matchAll(/(?:https?:\/\/)?(?:www\.)?valicepress\.com[^\s,)"']*/gi)].map(
      (m) => m[0],
    );
    row.hasSiteUrl = urls.length > 0;
    row.urls = [...new Set(urls)].slice(0, 8);
    row.hasCompanionUrl = companionSlug
      ? urls.some((u) => u.includes(`/companion/${companionSlug}`))
      : null;
    row.forbiddenHosts = FORBIDDEN.flatMap((re) => flat.match(re) ?? []);
    row.dataWallUrls = urls.filter((u) => DATA_WALL.test(u));
    // A QR is an image; pdftotext will not see it. Report the possibility
    // rather than claim either way.
    row.mentionsQr = /\bQR\b/i.test(flat);
    row.bannedCopy = BANNED_COPY.filter((b) => b.re.test(flat)).map((b) => b.what);
    row.bannedCopyFix = BANNED_COPY.filter((b) => b.re.test(flat)).map((b) => b.fix);

    if (row.bannedCopy.length) {
      row.status = "NEEDS_REVISION";
      row.detail = `printed copy that must not ship: ${row.bannedCopy.join("; ")}`;
      row.action = row.bannedCopyFix.join("; ");
    } else if (row.forbiddenHosts.length) {
      row.status = "NEEDS_REVISION";
      row.detail = `a non-canonical host is printed: ${row.forbiddenHosts.join(", ")}`;
      row.action = "fix the URL and re-upload — a printed wrong address cannot be patched";
    } else if (row.dataWallUrls.length) {
      row.status = "NEEDS_REVISION";
      row.detail = `printed URL looks like a signup wall: ${row.dataWallUrls.join(", ")}`;
      row.action = "point it at free value; email stays optional (KDP hyperlink rule + house rule)";
    } else if (!companionSlug && !row.hasSiteUrl) {
      row.status = "MISSING";
      row.detail = "no valicepress.com anywhere in the interior, and this book has no companion";
      row.action = `build a companion for ${book.slug}, then print its URL at the next revision`;
    } else if (companionSlug && !row.hasCompanionUrl) {
      row.status = "MISSING";
      row.detail = row.hasSiteUrl
        ? `the interior names valicepress.com but not ${companionUrl}`
        : `a companion exists at ${companionUrl} and the interior does not mention it`;
      row.action = `print ${companionUrl} in the back matter at the next revision`;
    } else {
      row.status = "COMPLETE";
      row.detail = `prints ${row.urls[0]}`;
      row.action = "none";
    }
    rows.push(row);
  }
}

if (asJson) {
  console.log(JSON.stringify({ takenAt: new Date().toISOString(), rows }, null, 2));
  process.exit(0);
}

const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
console.log(`kdp-linkage-lint — ${rows.length} print edition(s)\n`);
for (const r of rows) {
  const live = r.live ? "live" : "not live";
  console.log(
    `${r.status.padEnd(15)} ${r.book.slice(0, 30).padEnd(31)} ${r.format.padEnd(12)} ${live.padEnd(9)} ${r.asin ?? "—"}`,
  );
  console.log(`                ${r.detail}`);
  if (r.action !== "none") console.log(`                → ${r.action}`);
}
console.log(
  `\n${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join("  ·  ")}`,
);
const bad = rows.filter((r) => r.status === "NEEDS_REVISION").length;
process.exitCode = bad ? 1 : 0;
