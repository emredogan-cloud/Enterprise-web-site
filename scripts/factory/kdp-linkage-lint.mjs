#!/usr/bin/env node
/**
 * Does this printed book tell its reader that valicepress.com exists — and
 * does it say nothing it should not?
 *
 * WHY IT MATTERS MORE THAN IT SOUNDS
 * A reader who buys a Valice book on Amazon is, commercially, a stranger.
 * Amazon does not share their address and never will. The single place we are
 * allowed to speak to them again is inside the book they already paid for —
 * and only if the book carries a reason to visit and an address to visit.
 *
 * WHAT IT READS
 * The BUILT interior of every print edition, with `pdftotext` and `pdfinfo` —
 * what a KDP reviewer and every automated scan see, not what the source
 * claims. A registry lookup answers "does the companion this book should
 * name actually exist", and `--check-urls` asks production whether each
 * printed address answers 200.
 *
 * WHAT IT CHECKS, per edition:
 *   1. any valicepress.com URL, and the companion URL specifically when the
 *      book has a companion (registry: src/lib/companions.ts);
 *   2. the host is canonical — never a `.vercel.app` preview, localhost, an
 *      IP, or the retired `valice-press.com`. A printed wrong URL cannot be
 *      patched;
 *   3. no printed URL is a data wall (KDP forbids a hyperlink whose purpose
 *      is collecting customer information; the house rule is stricter);
 *   4. no copy that must never ship: the invented author biography, the
 *      pre-rebrand imprint, placeholder text;
 *   5. the author biography, when one is printed, is the Founder's approved
 *      text (catalogue AUTHORS) — reported as approved / non-canonical /
 *      absent, and as invented when it is the banned one;
 *   6. PDF metadata carries a real title and author ("untitled" /
 *      "anonymous" is what a library catalogue would read);
 *   7. no listing claim the book contradicts (e.g. "120 Legendary Creatures"
 *      in a book that contains 112);
 *   8. Amazon references are surfaced with context — a "printed by" line is
 *      fine; a link to another store is not.
 *
 * STATUSES (docs/execution/phase-4/KDP_VALICE_LINKAGE_MATRIX.csv)
 *   COMPLETE          prints the right URL, nothing wrong
 *   MISSING           no route home (or the companion URL is not printed)
 *   NEEDS_REVISION    something printed must not ship (wrong host, data
 *                     wall, banned copy, broken metadata, false claim)
 *   BLOCKED           the built interior cannot be read
 *   IN_REVIEW         edition is at KDP awaiting review — do not touch it
 *   NOT_APPROPRIATE   a link is not appropriate for this edition (declared
 *                     in the catalogue as `linkage: "not_appropriate"`)
 *
 *   node scripts/factory/kdp-linkage-lint.mjs                    # every edition
 *   node scripts/factory/kdp-linkage-lint.mjs --slug hangul      # one book
 *   node scripts/factory/kdp-linkage-lint.mjs --json             # machine output
 *   node scripts/factory/kdp-linkage-lint.mjs --check-urls       # + production 200s
 *   node scripts/factory/kdp-linkage-lint.mjs --strict           # MISSING fails too
 *                                                                # (the factory gate)
 * Exit 1 on any NEEDS_REVISION (and, with --strict, on MISSING for a book
 * whose companion exists). A missing companion is reported, not failed: a
 * book whose companion has not been built yet is early, not defective.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname } from "node:path";

import { AUTHORS, BOOKS } from "../catalog/valice-catalog.mjs";
import { PRINT_INTERIORS } from "./print-interiors.mjs";

export const CANONICAL = "valicepress.com";
/** Hosts that must never reach print. Each one has actually appeared somewhere. */
export const FORBIDDEN = [
  /localhost(:\d+)?/i,
  /\d+\.\d+\.\d+\.\d+:\d+/,
  /[a-z0-9-]+\.vercel\.app/i,
  /valice-press\.(com|net|org)/i,
];
/** A URL whose only purpose is a form. KDP prohibits it; so do we. */
export const DATA_WALL = /(subscribe|signup|sign-up|optin|opt-in|newsletter|mailinglist)\b/i;
/** Other storefronts a KDP interior must not send the reader to. */
const OTHER_STORES = /(kobo\.com|apple\.com\/books|books\.google|barnesandnoble|gumroad\.com|lulu\.com|smashwords)/i;

/**
 * Copy that must never reach print again. Found by reading built interiors.
 * "Emre is a puzzle designer, mythologist, and game archivist…" is a
 * biography nobody authorised, naming three occupations the Founder has not
 * claimed; it was printed on the imprint page AND the back cover of three
 * live World Games editions.
 */
export const BANNED_COPY = [
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
    re: /Lorem ipsum|TK TK|XXX PLACEHOLDER|\[QR CODE|\[AUTHOR BIO|PENDING — publisher decision/i,
    what: "placeholder text",
    fix: "write the real copy",
  },
];

/**
 * Listing claims a book contradicts. The Bestiarium listings say 120
 * creatures; the book contains 112 (build reports, PDF metadata). The
 * interior must not repeat the wrong number.
 */
const FALSE_CLAIMS = [
  { re: /\b120\s+Legendary\s+Creatures/i, what: "'120 Legendary Creatures' — the book contains 112" },
];

const args = process.argv.slice(2);
const only = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const asJson = args.includes("--json");
const checkUrls = args.includes("--check-urls");
const strict = args.includes("--strict");
const origin = args.includes("--origin") ? args[args.indexOf("--origin") + 1] : "https://valicepress.com";

/** The approved biography and the sentence that identifies it. */
function approvedBio() {
  const founder = AUTHORS.find((a) => a.slug === "emre-dogan");
  const text = founder?.bio ?? "";
  return { text, marker: /stories that cultures tell themselves/i };
}

/** Companion registry, read from the site's own source so the two cannot drift. */
export function companionsByBook() {
  const src = readFileSync("src/lib/companions.ts", "utf8");
  const map = new Map();
  const blocks = src.split(/const [A-Z_]+: Companion = \{/).slice(1);
  for (const block of blocks) {
    const slug = block.match(/\bslug:\s*"([a-z0-9-]+)"/)?.[1];
    const bookSlug = block.match(/\bbookSlug:\s*"([a-z0-9-]+)"/)?.[1];
    const state = block.match(/\bstate:\s*"([a-z-]+)"/)?.[1] ?? null;
    const assets = [...block.matchAll(/^\s+title:\s*"([^"]+)",$/gm)].map((m) => m[1]);
    if (slug && bookSlug) map.set(bookSlug, { slug, state, assets });
  }
  return map;
}

function run(cmd, cmdArgs) {
  try {
    return execFileSync(cmd, cmdArgs, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    return { error: err.message };
  }
}

function pdfInfo(file) {
  const out = run("pdfinfo", [file]);
  if (typeof out !== "string") return { error: out.error };
  const get = (k) => (out.match(new RegExp(`^${k}:\\s+(.*)$`, "m")) ?? [])[1]?.trim() ?? "";
  return { title: get("Title"), author: get("Author"), pages: Number(get("Pages") || 0), pageSize: get("Page size") };
}

function pdfText(file, first, last) {
  const a = ["-q"];
  if (first) a.push("-f", String(first));
  if (last) a.push("-l", String(last));
  return run("pdftotext", [...a, file, "-"]);
}

async function urlStatus(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", headers: { "user-agent": "valice-linkage-lint", "x-valice-internal": "1" } });
    return res.status;
  } catch {
    return 0;
  }
}

/**
 * The house standard for a companion page, as it can be read back off print.
 *
 * Every page rendered by `companion-page.py` opens with the standing line
 * CONTINUE WITH <IMPRINT>, and nothing else in any of these books uses that
 * phrase. Finding it on the same page as the printed address is what
 * distinguishes a dedicated destination from an address mentioned in passing —
 * which is what four of these books used to carry.
 */
const HOUSE_EYEBROW = /CONTINUE\s+WITH\s+V[ÂA]LI[ÇC]E\s+PRESS/i;
/**
 * The house floor is 25 % of the usable page height. `measure-qr.py` finds the
 * code from its finder patterns, and that method reads the side about 5–10 %
 * high (the finder centroids carry a little slop) while reading the module
 * pitch exactly. So the floor is checked at 0.24 of the FULL page height,
 * which is the conservative reading of the same rule, and the module pitch —
 * the number that actually decides whether a phone can read it — is checked
 * exactly against the 0.5 mm print floor.
 */
// Expressed against the FULL page height, because that is what the raster
// gives. The house floor is 25 % of the USABLE height, and these books carry
// 0.62–0.8 in margins, so 25 % of usable is 20.5–21 % of the page. 0.20 is
// that same rule, read off the only surface a measurement can reach.
const QR_FRACTION_FLOOR = 0.20;
const QR_MODULE_FLOOR_MM = 0.5;

function measureQr(file, page) {
  const py = "./.venv-factory/bin/python";
  if (!existsSync(py)) return { found: null, note: "no .venv-factory — run `python3 -m venv .venv-factory && .venv-factory/bin/pip install pypdf pikepdf segno reportlab fonttools Pillow`" };
  const out = run(py, ["scripts/factory/measure-qr.py", file, String(page)]);
  if (typeof out !== "string") return { found: null, note: out.error };
  try { return JSON.parse(out.trim().split("\n").pop()); } catch { return { found: null, note: "unreadable measurement" }; }
}

/** Every URL-ish token in the text, any host. */
function urlsIn(flat) {
  return [...new Set([...flat.matchAll(/(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|app|dev|kr|uk|edu|gov)(?:\/[^\s,)"'<>]*)?/gi)]
    .map((m) => m[0].replace(/[.,;:]+$/, "")))];
}

function context(flat, re, width = 70) {
  const m = flat.match(re);
  if (!m) return null;
  const i = m.index ?? 0;
  return flat.slice(Math.max(0, i - width), Math.min(flat.length, i + m[0].length + width)).trim();
}

export async function auditEdition(book, spec, file, companion, opts = {}) {
  const bio = approvedBio();
  const projectDir = file ? basename(dirname(dirname(dirname(file)))) : null;
  const row = {
    book: book.slug,
    title: book.title,
    project: projectDir,
    format: spec.format,
    asin: spec.amazonAsin ?? null,
    kdp: spec.kdp,
    availability: spec.availability,
    live: spec.availability === "available" && Boolean(spec.amazonAsin),
    amazonState: spec.kdp === "live" ? "live" : spec.kdp === "in_review" ? "in_review" : spec.kdp === "not_applicable" ? "n/a" : "not_created",
    companionExists: Boolean(companion),
    companionSlug: companion?.slug ?? null,
    companionUrl: companion ? `https://${CANONICAL}/companion/${companion.slug}` : null,
    companionValue: companion ? companion.assets.join(" · ") : null,
    companionState: companion?.state ?? null,
    interior: file,
    lastChecked: new Date().toISOString().slice(0, 10),
    findings: [],
  };

  if (spec.linkage === "not_appropriate") {
    row.status = "NOT_APPROPRIATE";
    row.detail = spec.linkageReason ?? "declared not appropriate in the catalogue";
    row.action = "none";
    return row;
  }

  if (!file || !existsSync(file)) {
    row.status = "BLOCKED";
    row.detail = file ? `interior not on disk: ${file}` : "no built interior is registered for this format";
    row.action = file
      ? "rebuild the interior, or correct the path in scripts/factory/print-interiors.mjs"
      : "register the built interior in scripts/factory/print-interiors.mjs";
    return row;
  }

  const info = pdfInfo(file);
  const text = pdfText(file);
  if (typeof text !== "string" || info.error) {
    row.status = "BLOCKED";
    row.detail = `pdftotext/pdfinfo failed: ${text.error ?? info.error}`;
    row.action = "install poppler-utils";
    return row;
  }
  const flat = text.replace(/\s+/g, " ");
  const pages = text.split("\f");
  row.pages = info.pages;
  row.pdfTitle = info.title;
  row.pdfAuthor = info.author;
  row.pageSize = info.pageSize;

  const allUrls = urlsIn(flat);
  const siteUrls = allUrls.filter((u) => /valicepress\.com/i.test(u));
  row.urls = siteUrls.slice(0, 8);
  row.otherUrls = allUrls.filter((u) => !/valicepress\.com/i.test(u)).slice(0, 12);
  row.hasSiteUrl = siteUrls.length > 0;
  row.hasCompanionUrl = companion ? siteUrls.some((u) => u.includes(`/companion/${companion.slug}`)) : null;
  row.forbiddenHosts = FORBIDDEN.flatMap((re) => flat.match(re) ?? []);
  row.dataWallUrls = siteUrls.filter((u) => DATA_WALL.test(u));
  row.otherStoreUrls = allUrls.filter((u) => OTHER_STORES.test(u));
  // Where the address is printed, and whether that page is a destination or a
  // mention. `companionPage` is 1-based, as a reader would say it.
  const wanted = companion ? `/companion/${companion.slug}` : "valicepress.com";
  // Look for the DEDICATED page first. Several of these books mention the
  // address a second time where it is natural — Dudeney on its imprint page,
  // Hangul at the foot of its closing note — and the first page carrying the
  // address is usually that quieter mention, not the destination.
  const dedicatedIndex = pages.findIndex((p) => HOUSE_EYEBROW.test(p) && p.includes(wanted));
  const anyIndex = pages.findIndex((p) => p.includes(wanted));
  row.dedicatedPage = dedicatedIndex !== -1;
  row.companionPage = (dedicatedIndex !== -1 ? dedicatedIndex : anyIndex) + 1 || null;
  // Where else the address appears. A second, quieter mention is deliberate;
  // it is only a defect when it is the ONLY mention.
  row.otherMentionPages = pages
    .map((p, i) => (p.includes(wanted) ? i + 1 : null))
    .filter((n) => n && n !== row.companionPage);

  // The code itself, found and measured on the page rather than inferred from
  // a caption. `qrPresent` stays in the row for the matrix's sake, but it is
  // now an answer from the raster, not from the text layer.
  row.qr = row.companionPage && !opts.skipQr ? measureQr(file, row.companionPage) : { found: null, note: "not measured" };
  row.qrPresent = row.qr.found === true ? "yes" : row.qr.found === false ? "no" : "unmeasured";
  row.valiceMention = /Valice|Vâliçe/i.test(flat);
  // The store, not the river or its people: "Amazons" and "Amazonia" occur in
  // two of these books and are not references to the retailer.
  row.amazonContext = context(flat, /(?<![A-Za-z])Amazon(?:\.com)?(?![A-Za-z])/);
  row.bannedCopy = BANNED_COPY.filter((b) => b.re.test(flat));
  row.falseClaims = FALSE_CLAIMS.filter((c) => c.re.test(flat)).map((c) => c.what);
  row.bioStatus = row.bannedCopy.some((b) => /biography/.test(b.what))
    ? "invented"
    : bio.marker.test(flat)
      ? "approved"
      : /about the (author|editor)/i.test(flat) || /Emre Do.an (is|writes)/i.test(flat)
        ? "non-canonical"
        : "absent";
  row.bioContext = row.bioStatus === "non-canonical" ? context(flat, /Emre Do.an (is|writes)[^.]*\./i, 20) : null;
  row.metadataOk = Boolean(info.title) && !/^untitled$/i.test(info.title) && Boolean(info.author) && !/^anonymous$/i.test(info.author);

  if (opts.checkUrls && siteUrls.length) {
    row.urlStatus = {};
    for (const u of [...new Set(siteUrls)]) {
      const full = u.startsWith("http") ? u : `https://${u}`;
      row.urlStatus[u] = await urlStatus(full);
    }
  }

  // ── findings, in severity order ─────────────────────────────────────────
  const f = row.findings;
  for (const b of row.bannedCopy) f.push({ level: "error", check: "banned-copy", message: b.what, fix: b.fix });
  if (row.forbiddenHosts.length) f.push({ level: "error", check: "host", message: `non-canonical host printed: ${row.forbiddenHosts.join(", ")}`, fix: "fix the URL and re-upload — a printed wrong address cannot be patched" });
  if (row.dataWallUrls.length) f.push({ level: "error", check: "data-wall", message: `printed URL looks like a signup wall: ${row.dataWallUrls.join(", ")}`, fix: "point it at free value; email stays optional (KDP hyperlink rule + house rule)" });
  if (row.otherStoreUrls.length) f.push({ level: "error", check: "other-store", message: `link to another storefront: ${row.otherStoreUrls.join(", ")}`, fix: "KDP prohibits links to competing stores" });
  for (const c of row.falseClaims) f.push({ level: "error", check: "claim", message: c, fix: "correct the number in the interior and the listing" });
  if (!row.metadataOk) f.push({ level: "error", check: "metadata", message: `PDF metadata title="${info.title || "—"}" author="${info.author || "—"}"`, fix: "set the PDF title and author at the next build; it is what a library catalogue reads" });
  if (row.urlStatus) {
    for (const [u, st] of Object.entries(row.urlStatus)) {
      if (st !== 200) f.push({ level: "error", check: "url-resolves", message: `${u} → ${st}`, fix: "the printed address must answer 200 on production before upload" });
    }
  }
  if (row.bioStatus === "non-canonical") f.push({ level: "warn", check: "bio", message: "the printed biography is not the approved text", fix: "replace with the Founder's approved biography at the next revision (no false claim found)" });
  if (companion && row.hasCompanionUrl && !row.dedicatedPage) f.push({ level: "warn", check: "dedicated-page", message: `the address is printed on p.${row.companionPage}, which is not a house companion page (no "CONTINUE WITH …" heading)`, fix: "rebuild the page with scripts/factory/build-companion-pages.mjs — a mention inside other copy is not noticed by a reader" });
  if (row.qr.found === false) f.push({ level: "warn", check: "qr-missing", message: `no QR code found on p.${row.companionPage}`, fix: "a printed address without a code costs the reader a typing session; rebuild the page" });
  if (row.qr.found === true && row.qr.fractionOfPageHeight < QR_FRACTION_FLOOR) f.push({ level: "warn", check: "qr-small", message: `the QR is ${(row.qr.fractionOfPageHeight * 100).toFixed(1)} % of page height (floor ${(QR_FRACTION_FLOOR * 100).toFixed(0)} % of page height, which is the house's 25 % of usable height)`, fix: "enlarge it — a code that reads as a footnote is not scanned" });
  if (row.qr.found === true && row.qr.moduleMm < QR_MODULE_FLOOR_MM) f.push({ level: "error", check: "qr-module", message: `QR modules print at ${row.qr.moduleMm} mm (floor ${QR_MODULE_FLOOR_MM} mm)`, fix: "enlarge the code or shorten the URL; below half a millimetre the modules bleed together on uncoated stock" });
  if (opts.catalogPages && row.pages && opts.catalogPages !== row.pages) f.push({ level: "warn", check: "page-count", message: `the built interior is ${row.pages} pages; the catalogue records ${opts.catalogPages}${opts.catalogPagesArePending ? " as this format's pending count" : ""}`, fix: opts.catalogPagesArePending ? "the pending count and the built file disagree — one of them is wrong" : "record the new count as `pendingPageCount` in valice-catalog.mjs; `pageCount` keeps describing the edition a buyer can actually buy until the file is uploaded" });
  if (companion && !row.hasCompanionUrl) f.push({ level: "warn", check: "companion", message: row.hasSiteUrl ? `names ${CANONICAL} but not ${row.companionUrl}` : `a companion exists at ${row.companionUrl} and the interior does not mention it`, fix: `print ${row.companionUrl} in the back matter` });
  if (!companion && !row.hasSiteUrl) f.push({ level: "warn", check: "route-home", message: `no ${CANONICAL} anywhere in the interior, and this book has no companion`, fix: `build a companion for ${book.slug}, then print its URL at the next revision` });

  const errors = f.filter((x) => x.level === "error");
  if (errors.length) {
    row.status = "NEEDS_REVISION";
    row.detail = errors.map((e) => e.message).join("; ");
    row.action = errors.map((e) => e.fix).join("; ");
  } else if (spec.kdp === "in_review") {
    row.status = "IN_REVIEW";
    row.detail = f.length ? f.map((e) => e.message).join("; ") : `prints ${row.urls[0]}`;
    row.action = f.length ? `after it goes live: ${f.map((e) => e.fix).join("; ")}` : "none — wait for the review";
  } else if (companion && !row.hasCompanionUrl) {
    row.status = "MISSING";
    row.detail = f.find((x) => x.check === "companion")?.message;
    row.action = f.find((x) => x.check === "companion")?.fix;
  } else if (!companion && !row.hasSiteUrl) {
    row.status = "MISSING";
    row.detail = f.find((x) => x.check === "route-home")?.message;
    row.action = f.find((x) => x.check === "route-home")?.fix;
  } else {
    row.status = "COMPLETE";
    row.detail = `prints ${row.urls[0]}${row.qrPresent === "yes" ? " (+ QR)" : ""}`;
    row.action = f.length ? f.map((e) => e.fix).join("; ") : "none";
  }
  return row;
}

export async function runLinkageAudit({ slug = null, checkUrls: doCheck = false, skipQr = false } = {}) {
  const companions = companionsByBook();
  const rows = [];
  for (const book of BOOKS) {
    if (slug && book.slug !== slug) continue;
    const interiors = PRINT_INTERIORS[book.slug] ?? {};
    const companion = companions.get(book.slug) ?? null;
    for (const format of ["paperback", "hardcover", "large_print"]) {
      const spec = book.formats.find((x) => x.format === format);
      if (!spec || spec.availability === "unavailable") continue;
      rows.push(await auditEdition(book, spec, interiors[format] ?? null, companion, { checkUrls: doCheck, catalogPages: spec.pendingPageCount ?? spec.pageCount ?? null,
        catalogPagesArePending: Boolean(spec.pendingPageCount), skipQr }));
    }
  }
  return rows;
}

if (process.argv[1] && process.argv[1].endsWith("kdp-linkage-lint.mjs")) {
  const rows = await runLinkageAudit({ slug: only, checkUrls, skipQr: args.includes("--skip-qr") });
  if (asJson) {
    console.log(JSON.stringify({ takenAt: new Date().toISOString(), origin, rows }, null, 2));
  } else {
    const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
    console.log(`kdp-linkage-lint — ${rows.length} print edition(s)${checkUrls ? " · printed URLs checked on " + origin : ""}\n`);
    for (const r of rows) {
      const live = r.live ? "live" : r.amazonState === "in_review" ? "in review" : "not live";
      console.log(`${r.status.padEnd(15)} ${r.book.slice(0, 30).padEnd(31)} ${r.format.padEnd(12)} ${live.padEnd(10)} ${r.asin ?? "—"}`);
      console.log(`                ${r.detail}`);
      if (r.pages) console.log(`                ${r.pages} pp · bio: ${r.bioStatus} · metadata: ${r.metadataOk ? "ok" : "MISSING"} · page ${r.companionPage ?? "—"}${r.dedicatedPage ? " (dedicated)" : ""} · QR: ${r.qr?.found ? `${(r.qr.fractionOfPageHeight * 100).toFixed(0)}% of page, ${r.qr.moduleMm} mm/module` : r.qrPresent}${r.otherUrls?.length ? ` · other URLs: ${r.otherUrls.join(", ")}` : ""}`);
      if (r.action && r.action !== "none") console.log(`                → ${r.action}`);
    }
    console.log(`\n${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join("  ·  ")}`);
  }
  const bad = rows.filter((r) => r.status === "NEEDS_REVISION" || (strict && r.status === "MISSING" && r.companionExists)).length;
  process.exitCode = bad ? 1 : 0;
}
