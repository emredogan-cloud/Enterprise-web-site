#!/usr/bin/env node
/**
 * Put a dedicated companion page into every printed Valice edition, and
 * recalculate everything the page count touches.
 *
 * ── WHAT IT DOES, IN ORDER, PER EDITION ───────────────────────────────────
 *   1. reads the built interior and measures the leaf the new page will join
 *      (MediaBox, folio position, page count) — never a table, never a guess;
 *   2. renders the companion page in the book's own fonts at the book's own
 *      margins, with a QR occupying 25–35 % of the usable height;
 *   3. splices it in — replacing a blank or a weak old note where one exists,
 *      appending a leaf where none does;
 *   4. verifies the result by reading the file back: page count, the printed
 *      address, embedded fonts, and the QR itself decoded module-by-module
 *      against the URL it is supposed to carry;
 *   5. runs the spine arithmetic and says whether the cover must be rebuilt;
 *   6. writes a deterministic upload package under
 *      docs/execution/phase-5/kdp-packages/<slug>/<format>/.
 *
 * ── WHAT IT REFUSES TO DO ─────────────────────────────────────────────────
 * Overwrite an interior without keeping the previous build beside it
 * (`*.pre-companion.pdf`), print a page whose fonts lack a glyph it needs,
 * shrink a QR below the house floor, or report success on a file it has not
 * read back.
 *
 *   node scripts/factory/build-companion-pages.mjs --dry-run     # plan only
 *   node scripts/factory/build-companion-pages.mjs --commit      # write
 *   node scripts/factory/build-companion-pages.mjs --commit --slug hangul
 *   node scripts/factory/build-companion-pages.mjs --verify      # read back only
 *
 * Dry run is the default, as every catalogue script in this repository is.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

import { AUTHORS, BOOKS } from "../catalog/valice-catalog.mjs";
import { COMPANION_PAGE_COPY, COMPANION_PAGE_PLAN, HOUSE_COPY, printedUrl, qrUrl } from "./companion-page-spec.mjs";
import { EDITION_GEOMETRY } from "./edition-geometry.mjs";
import { PRINT_INTERIORS } from "./print-interiors.mjs";
import { coverFor } from "./rebuilt-covers.mjs";
import { assess } from "./spine-check.mjs";

const REPO = new URL("../..", import.meta.url).pathname;
const PY = join(REPO, ".venv-factory/bin/python");
const RENDERER = join(REPO, "scripts/factory/companion-page.py");
const PACKAGES = join(REPO, "docs/execution/phase-5/kdp-packages");
const TMP = join(REPO, ".venv-factory/tmp");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const val = (f) => { const i = argv.indexOf(`--${f}`); return i === -1 ? undefined : argv[i + 1]; };
const COMMIT = has("commit");
// Rewrite the upload packages from the interiors already on disk, without
// splicing anything. Implies --commit for the package files only.
const PACKAGES_ONLY = has("packages-only");
const ONLY = val("slug");

/** The standing line every Valice companion page carries, per book imprint. */
const eyebrowFor = (imprint) => `CONTINUE WITH ${imprint.toUpperCase()}`;

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function pdfinfo(path) {
  const out = execFileSync("pdfinfo", [path], { encoding: "utf8" });
  return {
    pages: Number(/Pages:\s+(\d+)/.exec(out)?.[1]),
    title: /^Title:\s+(.*)$/m.exec(out)?.[1]?.trim() ?? "",
    author: /^Author:\s+(.*)$/m.exec(out)?.[1]?.trim() ?? "",
    size: /Page size:\s+(.+)/.exec(out)?.[1]?.trim() ?? "",
  };
}

function pageText(path, page) {
  return execFileSync("pdftotext", ["-f", String(page), "-l", String(page), path, "-"], { encoding: "utf8" });
}

/** Every face on the page must be embedded; KDP rejects a file that is not. */
function fontsEmbedded(path, page) {
  const out = execFileSync("pdffonts", ["-f", String(page), "-l", String(page), path], { encoding: "utf8" });
  const rows = out.trim().split("\n").slice(2).filter(Boolean);
  // The three yes/no columns are emb / sub / uni; the first is the one that
  // decides whether KDP accepts the file. Matched by shape rather than by
  // character offset, because pdfinfo pads the name column to the longest name
  // on the page and that width moves between books.
  const bad = rows.filter((r) => !/\b(yes|no)\s+(yes|no)\s+(yes|no)\s+\d+/.test(r) || /\bno\s+(yes|no)\s+(yes|no)\s+\d+/.test(r));
  return { rows: rows.length, embedded: rows.length > 0 && bad.length === 0, detail: rows.map((r) => r.split(/\s{2,}/)[0].trim()) };
}

/**
 * The book's cover, converted once per run to a print-resolution PNG. It is
 * the only image on the page, it is the book the reader is holding, and it is
 * the same file the storefront shows — one cover everywhere, Phase 4's rule.
 */
function coverPng(slug) {
  const webp = join(REPO, "public/images/books", `${slug}.webp`);
  if (!existsSync(webp)) return null;
  mkdirSync(TMP, { recursive: true });
  const png = join(TMP, `${slug}-cover.png`);
  if (!existsSync(png)) execFileSync("convert", [webp, "-resize", "x600", png]);
  return png;
}

function buildSpec(bookSlug, format, edition, book, { skipDoneCheck = false } = {}) {
  const copy = COMPANION_PAGE_COPY[bookSlug];
  const catalogBook = BOOKS.find((b) => b.slug === bookSlug);
  const author = AUTHORS.find((a) => a.slug === (catalogBook?.authors?.[0] ?? "emre-dogan"));
  const interior = PRINT_INTERIORS[bookSlug]?.[format];
  if (!interior || !existsSync(interior)) throw new Error(`${bookSlug}/${format}: no built interior at ${interior}`);

  // The plan describes a transition, so re-running it must not double-apply.
  // An interior already at `pagesAfter` whose companion page already prints
  // the address is finished; anything else at an unexpected length means the
  // book was rebuilt underneath us and the plan is what needs fixing.
  const info = pdfinfo(interior);
  const target = edition.mode === "native" || edition.mode === "replace"
    ? edition.page
    : edition.pagesBefore + 1;
  // `--packages-only` rewrites the upload package from the file already on
  // disk and touches no interior. It exists because UPLOAD.md is a document a
  // person acts on and its wording gets corrected from time to time — four of
  // them were telling the Founder "do not touch the cover" for editions that
  // have no cover at KDP at all — and refreshing that text must never be a
  // reason to re-splice a finished book.
  if (PACKAGES_ONLY && !skipDoneCheck) {
    if (!pageText(interior, target).includes(printedUrl(bookSlug))) {
      throw new Error(`${bookSlug}/${format}: page ${target} does not print ${printedUrl(bookSlug)} — nothing to package`);
    }
    return { alreadyDone: true, interior, companionPage: target, pages: info.pages };
  }
  // A `native` edition was typeset with its companion leaf in place, so there
  // is nothing to splice and pagesBefore === pagesAfter. It still goes through
  // the read-back checks and still gets an upload package: what those verify
  // is the printed page, and the page does not care who drew it.
  if (edition.mode === "native") {
    if (info.pages !== edition.pagesAfter) {
      throw new Error(`${bookSlug}/${format}: interior is ${info.pages} pages, plan says ${edition.pagesAfter} — fix the plan, not the file`);
    }
    if (!pageText(interior, target).includes(printedUrl(bookSlug))) {
      throw new Error(`${bookSlug}/${format}: page ${target} is declared native but does not print ${printedUrl(bookSlug)}`);
    }
    if (!skipDoneCheck) return { alreadyDone: true, interior, companionPage: target, pages: info.pages };
  }
  if (!skipDoneCheck && info.pages === edition.pagesAfter && info.pages !== edition.pagesBefore) {
    const printed = pageText(interior, target).includes(printedUrl(bookSlug));
    if (printed) return { alreadyDone: true, interior, companionPage: target, pages: info.pages };
  }
  if (!skipDoneCheck && info.pages !== edition.pagesBefore) {
    throw new Error(`${bookSlug}/${format}: interior is ${info.pages} pages, plan says ${edition.pagesBefore} — the plan is stale, fix it rather than the file`);
  }

  const folio = edition.folio
    ? {
        ...edition.folio,
        number: (edition.mode === "native" || edition.mode === "replace"
          ? edition.page
          : edition.pagesBefore + 1) + edition.folio.offset,
      }
    : null;

  return {
    id: `${bookSlug}/${format}`,
    interior,
    mode: edition.mode,
    page: edition.page,
    recto: edition.recto,
    trailingBlank: Boolean(edition.trailingBlank),
    folio,
    style: { ...book.style, fonts: book.style.fonts },
    coverImage: coverPng(bookSlug),
    pdfAuthor: author?.name ?? "",
    docInfo: {
      title: catalogBook ? `${catalogBook.title}${catalogBook.subtitle ? `: ${catalogBook.subtitle}` : ""}` : info.title,
      author: author?.name ?? info.author,
    },
    house: { ...HOUSE_COPY, eyebrow: eyebrowFor(copy.imprint) },
    copy: {
      headline: copy.headline,
      promise: copy.promise,
      listHeading: copy.listHeading,
      bullets: copy.bullets,
      printedUrl: printedUrl(bookSlug),
      qrUrl: qrUrl(bookSlug),
      freeLine: copy.freeLineOverride ?? null,
      imprint: copy.imprint,
      footerTitle: catalogBook?.title ?? copy.footerTitle ?? "",
    },
  };
}

function run(spec, outPath) {
  mkdirSync(TMP, { recursive: true });
  const specPath = join(TMP, `${spec.id.replace("/", "-")}.json`);
  writeFileSync(specPath, JSON.stringify(spec, null, 1));
  const out = execFileSync(PY, [RENDERER, "--spec", specPath, "--out", outPath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim().split("\n").pop());
}

function verify(spec, outPath, result) {
  const info = pdfinfo(outPath);
  const page = result.companionPage;
  const text = pageText(outPath, page);
  const fonts = fontsEmbedded(outPath, page);
  const checks = [];
  const ok = (name, pass, detail) => checks.push({ name, pass, detail });

  ok("page-count", info.pages === spec.expectedPagesAfter, `${info.pages} pages (expected ${spec.expectedPagesAfter})`);
  ok("printed-url", text.includes(spec.copy.printedUrl), spec.copy.printedUrl);
  ok("canonical-host", !/vercel\.app|localhost|valice-press\.com|\d+\.\d+\.\d+\.\d+/i.test(text), "no forbidden host on the page");
  // A data wall is a page that DEMANDS an address; the house line "nothing to
  // sign up for, no email asked" is its opposite and must not trip the check.
  // The line is removed before the test, which is then run against what is
  // left. KDP prohibits a hyperlink whose purpose is collecting customer
  // information; the house rule is stricter — no gate on a promised bonus.
  const withoutHousePromise = text.replace(/nothing to sign ?up for[^.]*\./gi, "");
  const wall = /(enter your (e-?mail|address)|sign ?up (to|for) (get|access|download|unlock|receive)|subscribe to (get|access|download|unlock|receive)|e-?mail (is )?required|join (our|the) (list|newsletter)|register to (download|access))/i;
  ok("no-email-wall", !wall.test(withoutHousePromise), "the page asks for nothing");
  ok("headline", text.includes(spec.copy.headline.split("\n")[0].trim()), "headline present");
  ok("eyebrow", text.replace(/\s+/g, " ").includes(spec.house.eyebrow), spec.house.eyebrow);
  ok("fonts-embedded", fonts.embedded, `${fonts.rows} faces: ${fonts.detail.join(", ")}`);
  ok("qr-floor", result.qr.fraction_of_usable_height >= 0.25,
     `${(result.qr.fraction_of_usable_height * 100).toFixed(1)}% of usable height`);
  ok("qr-module-size", result.qr.module_mm >= 0.5, `${result.qr.module_mm.toFixed(2)} mm per module`);
  ok("pdf-metadata", Boolean(info.title) && !/untitled/i.test(info.title) && Boolean(info.author) && !/anonymous/i.test(info.author),
     `title="${info.title}" author="${info.author}"`);

  // Read the code back off the printed page and compare it, module by module,
  // with the code the URL produces. A QR is permanent once printed; "we drew
  // one" is not evidence that it carries the right address.
  const decoded = execFileSync(PY, [RENDERER, "--spec", join(TMP, `${spec.id.replace("/", "-")}.json`),
    "--out", outPath, "--verify", String(page),
    "--qr-box", `${result.qr.x_pt},${result.qr.y_pt},${result.qr.side_pt}`],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const v = JSON.parse(decoded.trim().split("\n").pop());
  ok("qr-matches-url", v.matches, v.detail);

  return { info, checks, allPass: checks.every((c) => c.pass), qrVerify: v };
}

function packageDir(bookSlug, format) {
  return join(PACKAGES, bookSlug, format);
}

function writePackage(bookSlug, format, edition, spec, result, verification, spine, interiorPath, previousPath) {
  const dir = packageDir(bookSlug, format);
  mkdirSync(dir, { recursive: true });
  const catalogBook = BOOKS.find((b) => b.slug === bookSlug);
  const fmt = catalogBook?.formats?.find((f) => f.format === format);
  const manifest = {
    generatedAt: new Date().toISOString().slice(0, 10),
    book: bookSlug,
    format,
    title: catalogBook?.title ?? null,
    asin: fmt?.amazonAsin ?? null,
    kdpState: fmt?.kdp ?? "unknown",
    interior: {
      path: interiorPath,
      sha256: sha256(interiorPath),
      bytes: statSync(interiorPath).size,
      pagesBefore: edition.pagesBefore,
      pagesAfter: verification.info.pages,
      companionPage: result.companionPage,
      // A native edition replaced nothing, so there is no earlier build to
      // keep. Naming a `.pre-companion.pdf` that does not exist would send the
      // Founder looking for a file, which is worse than saying so.
      previousBuildKept: edition.mode === "native" ? null : previousPath,
      builtBy: edition.builtBy ?? "scripts/factory/companion-page.py (spliced)",
    },
    companion: {
      printedUrl: spec.copy.printedUrl,
      qrUrl: spec.copy.qrUrl,
      qr: result.qr,
      dedicatedPage: true,
      emailWall: false,
    },
    spine,
    cover: coverFor(bookSlug, format),
    coverAction: fmt?.kdp === "not_created"
      ? "FIRST UPLOAD — there is no cover at KDP yet; upload the wrap built for this page count alongside the interior"
      : spine.coverRebuildRequired
      ? "REBUILD REQUIRED — the wrap is outside KDP tolerance"
      : spine.coverRebuildCorrect
        ? "REBUILD CORRECT — inside tolerance, but the printed spine no longer matches the block"
        : "NONE — page count unchanged; the cover at KDP stays valid",
    uploadRequired: true,
    hold: edition.hold ?? null,
    // A proof is recommended when the block changed thickness OR when nobody
    // has ever held this interior. The second case is the one that used to
    // slip through: a brand-new book whose page count has not "changed" reads
    // as "no proof needed", which is exactly backwards.
    proofRecommended: spine.coverRebuildCorrect || fmt?.kdp === "not_created",
    proofWhy: spine.coverRebuildCorrect
      ? "the block changed thickness, so the wrap is new and unproved"
      : fmt?.kdp === "not_created"
        ? "this edition has never been printed — first proof of this interior and this cover"
        : "the interior is a swap into an edition already in print",
    verification: verification.checks,
  };
  writeFileSync(join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(dir, "UPLOAD.md"), uploadInstructions(manifest, edition));
  return manifest;
}

function uploadInstructions(m, edition) {
  const lines = [];
  lines.push(`# ${m.title} — ${m.format} — KDP upload package`);
  lines.push("");
  lines.push(`**Generated:** ${m.generatedAt} · **ASIN:** ${m.asin ?? "— (not listed)"} · **KDP state:** ${m.kdpState}`);
  lines.push("");
  if (m.hold) {
    lines.push(`## HOLD — do not upload yet`);
    lines.push("");
    lines.push(m.hold);
    lines.push("");
    lines.push("The file below is finished and verified. It waits on the calendar, not on work.");
    lines.push("");
  }
  // The QR fraction arrives under two names: the renderer reports it against
  // the USABLE height it drew into, `measure-qr.py` against the page. Taking
  // whichever is present beats printing "NaN %" in a document a person acts on.
  const qrPct = (() => {
    const q = m.companion.qr ?? {};
    const f = q.fraction_of_usable_height ?? q.fractionOfPageHeight;
    return typeof f === "number" ? `${(f * 100).toFixed(0)} % of the ${q.fraction_of_usable_height != null ? "usable page height" : "page height"}` : "a measured share of the page";
  })();
  const firstUpload = m.kdpState === "not_created";
  lines.push(firstUpload ? "## What this is" : "## What changed");
  lines.push("");
  lines.push(firstUpload
    // Two first-upload cases, and they are not the same sentence: a book
    // typeset with its companion leaf in place, and a book that had the leaf
    // spliced in before it ever reached KDP. Saying "not spliced in
    // afterwards" about the second one is simply untrue.
    ? `This edition has never been uploaded. The file below is its first. A dedicated companion page stands on page **${m.interior.companionPage}**: a QR occupying ${qrPct}, the address \`${m.companion.printedUrl}\` printed beneath it in display type, and a named list of what is waiting there${m.interior.previousBuildKept ? `. ${edition.replacing ? `It replaces ${edition.replacing}.` : "It is a new leaf; nothing was removed."}` : " — set by the book's own builder when it was typeset, not spliced in afterwards."}`
    : `A dedicated companion page now stands on page **${m.interior.companionPage}**: a QR occupying ${qrPct}, the address \`${m.companion.printedUrl}\` printed beneath it in display type, and a named list of what is waiting there. ${edition.replacing ? `It replaces ${edition.replacing}.` : "It is a new leaf; nothing was removed."}`);
  lines.push("");
  lines.push(firstUpload
    ? `- **Pages:** **${m.interior.pagesAfter}**`
    : `- **Pages:** ${m.interior.pagesBefore} → **${m.interior.pagesAfter}**`);
  lines.push(firstUpload
    ? `- **Spine:** **${m.spine.after.spineWidthIn.toFixed(4)} in** (${m.spine.paper} paper, ${m.spine.trim})`
    : `- **Spine:** ${m.spine.before.spineWidthIn.toFixed(4)} in → **${m.spine.after.spineWidthIn.toFixed(4)} in** (${m.spine.paper} paper, ${m.spine.trim})`);
  lines.push(firstUpload
    ? `- **Wrap width:** **${m.spine.after.wrapWidthIn.toFixed(4)} in**`
    : `- **Wrap width:** ${m.spine.before.wrapWidthIn.toFixed(4)} in → **${m.spine.after.wrapWidthIn.toFixed(4)} in**`);
  lines.push(`- **Cover:** ${m.coverAction}`);
  lines.push(`- **Proof:** ${m.proofRecommended ? `recommended — ${m.proofWhy}` : `not required — ${m.proofWhy}`}`);
  lines.push("");
  lines.push("## The file");
  lines.push("");
  lines.push("```");
  lines.push(m.interior.path);
  lines.push(`sha256 ${m.interior.sha256}`);
  lines.push(`${m.interior.bytes.toLocaleString("en-US")} bytes · ${m.interior.pagesAfter} pages`);
  lines.push("```");
  lines.push("");
  lines.push(m.interior.previousBuildKept
    ? `The build it replaces is kept at \`${m.interior.previousBuildKept}\` and is never deleted.`
    : `Nothing was replaced: the companion leaf was set by \`${m.interior.builtBy}\` when the book was typeset, so there is no earlier build.`);
  lines.push("");
  lines.push("## In KDP");
  lines.push("");
  if (firstUpload) {
    lines.push(`1. KDP → **Create** → **Paperback**. This book is not on the bookshelf; there is nothing to edit.`);
    lines.push(`2. Upload the interior above, and the cover built for **${m.interior.pagesAfter} pages** — see the book's own \`OUTPUT/KDP/KDP_UPLOAD_GUIDE.html\` for the trim, paper and bleed settings, which must match or the file is rejected.`);
    lines.push(`3. **Do not use Cover Creator.** The wrap was computed for this page count; Cover Creator regenerates it and the spine moves.`);
    lines.push(`4. Open the previewer and confirm page ${m.interior.companionPage} shows the code and the address. Scan the code with a phone before you publish — it cannot be changed once it is printed.`);
    lines.push("");
    lines.push("## How this file was checked");
    lines.push("");
    for (const c of m.verification) lines.push(`- ${c.pass ? "PASS" : "FAIL"} · **${c.name}** — ${c.detail}`);
    lines.push("");
    lines.push(`Regenerate with \`node scripts/factory/build-companion-pages.mjs --commit --slug ${m.book}\`.`);
    lines.push("");
    return lines.join("\n");
  }
  lines.push(`1. Bookshelf → **${m.title}** → ${m.format} → *Edit print manuscript*.`);
  lines.push(`2. Upload the interior above.`);
  if (m.spine.coverRebuildCorrect) {
    if (m.cover?.built) {
      lines.push(`3. Upload the rebuilt cover for **${m.interior.pagesAfter} pages** — the spine changed, do not reuse the old wrap:`);
      lines.push("");
      lines.push("   ```");
      lines.push(`   ${m.cover.path}`);
      lines.push(`   spine ${m.cover.spineIn ?? "see wrap"} in · wrap ${m.cover.wrapIn}`);
      lines.push(`   ${m.cover.note}`);
      lines.push("   ```");
      lines.push("");
    } else if (m.cover) {
      lines.push(`3. **The cover has NOT been rebuilt, and the interior must not be uploaded without it.** ${m.cover.reason}`);
    } else {
      lines.push(`3. The spine changed and no rebuilt wrap is recorded for this edition — do not upload the interior until one exists.`);
    }
    lines.push(`4. Open the previewer and confirm page ${m.interior.companionPage} shows the code and the address, and that the spine text still sits inside its safe zone.`);
  } else {
    lines.push(`3. **Do not touch the cover.** The page count did not move, so the wrap at KDP is still exactly right.`);
    lines.push(`4. Open the previewer and confirm page ${m.interior.companionPage} shows the code and the address.`);
  }
  lines.push("");
  lines.push("## How this file was checked");
  lines.push("");
  for (const c of m.verification) lines.push(`- ${c.pass ? "PASS" : "FAIL"} · **${c.name}** — ${c.detail}`);
  lines.push("");
  lines.push(`Regenerate with \`node scripts/factory/build-companion-pages.mjs --commit --slug ${m.book}\`.`);
  lines.push("");
  return lines.join("\n");
}


/**
 * The spec without the "is it already done" short-circuit — used when a
 * finished edition's package has to be rewritten from the file on disk.
 */
function buildSpecForPackage(bookSlug, format, edition, book) {
  const spec = buildSpec(bookSlug, format, edition, book, { skipDoneCheck: true });
  spec.expectedPagesAfter = edition.pagesAfter;
  return spec;
}

/** Re-run the acceptance checks against a file that is already finished. */
function recheck(interior, page, spec) {
  const info = pdfinfo(interior);
  const text = pageText(interior, page);
  const fonts = fontsEmbedded(interior, page);
  const checks = [];
  const ok = (name, pass, detail) => checks.push({ name, pass, detail });
  ok("page-count", info.pages === spec.expectedPagesAfter, `${info.pages} pages (expected ${spec.expectedPagesAfter})`);
  ok("printed-url", text.includes(spec.copy.printedUrl), spec.copy.printedUrl);
  ok("canonical-host", !/vercel\.app|localhost|valice-press\.com|\d+\.\d+\.\d+\.\d+/i.test(text), "no forbidden host on the page");
  ok("eyebrow", text.replace(/\s+/g, " ").includes(spec.house.eyebrow), spec.house.eyebrow);
  ok("fonts-embedded", fonts.embedded, `${fonts.rows} faces: ${fonts.detail.join(", ")}`);
  ok("pdf-metadata", Boolean(info.title) && !/untitled/i.test(info.title) && Boolean(info.author) && !/anonymous/i.test(info.author),
     `title="${info.title}" author="${info.author}"`);
  return checks;
}

/** The QR geometry of a page already drawn, recovered by re-solving it. */
/**
 * The QR geometry of a page that is already printed, measured off the page.
 *
 * `measure-qr.py` finds the code by its finder patterns and reports its size
 * in points, its module pitch in millimetres and what fraction of the page it
 * occupies — which is the only honest way to answer "is the code big enough"
 * for a leaf this pipeline did not draw.
 */
function measuredQrFromFile(interior, page) {
  try {
    const out = execFileSync(PY, [join("scripts/factory", "measure-qr.py"), interior, String(page)], { encoding: "utf8" });
    const r = JSON.parse(out.trim().split("\n").pop());
    if (!r.found) return { note: "no QR finder patterns detected on the page" };
    return { measuredOffThePage: true, ...r };
  } catch (err) {
    return { note: `could not measure: ${err.message.split("\n")[0]}` };
  }
}

function measuredQr(spec) {
  const specPath = join(TMP, `${spec.id.replace("/", "-")}.json`);
  if (!existsSync(specPath)) return { note: "geometry not re-measured on this run" };
  const out = execFileSync(PY, [RENDERER, "--spec", specPath, "--out", join(TMP, "probe.pdf"), "--page-only", join(TMP, "probe.pdf")], { encoding: "utf8" });
  const r = JSON.parse(out.trim().split("\n").pop());
  rmSync(join(TMP, "probe.page.pdf"), { force: true });
  return r.qr;
}

// ── main ─────────────────────────────────────────────────────────────────────
const results = [];
let failures = 0;

for (const [bookSlug, book] of Object.entries(COMPANION_PAGE_PLAN)) {
  if (ONLY && !bookSlug.includes(ONLY)) continue;
  for (const [format, edition] of Object.entries(book.editions)) {
    const label = `${bookSlug}/${format}`;
    try {
      const spec = buildSpec(bookSlug, format, edition, book);
      if (spec.alreadyDone) {
        const geoDone = EDITION_GEOMETRY[bookSlug]?.[format];
        const spineDone = assess({ pagesBefore: edition.pagesBefore, pagesAfter: edition.pagesAfter, ...geoDone });
        if (COMMIT) {
          const full = buildSpecForPackage(bookSlug, format, edition, book);
          const v = { info: pdfinfo(spec.interior), checks: recheck(spec.interior, spec.companionPage, full), allPass: true };
          v.allPass = v.checks.every((c) => c.pass);
          if (!v.allPass) {
            failures++;
            console.error(`FAIL  ${label} (re-check of the finished file)`);
            for (const c of v.checks.filter((x) => !x.pass)) console.error(`      ${c.name}: ${c.detail}`);
            continue;
          }
          const m = writePackage(bookSlug, format, edition, full,
            { companionPage: spec.companionPage,
              qr: edition.mode === "native"
                ? measuredQrFromFile(spec.interior, spec.companionPage)
                : measuredQr(full) },
            v, spineDone, spec.interior, spec.interior.replace(/\.pdf$/, ".pre-companion.pdf"));
          results.push({ label, manifest: m });
        } else {
          results.push({ label, alreadyDone: true });
        }
        console.log(`DONE  ${label.padEnd(46)} p${spec.companionPage} · ${spec.pages} pp · already carries the address${edition.hold ? "  [HOLD]" : ""}`);
        continue;
      }
      spec.expectedPagesAfter = edition.pagesAfter;
      const geo = EDITION_GEOMETRY[bookSlug]?.[format];
      if (!geo) throw new Error(`no geometry for ${label}`);
      const spine = assess({ pagesBefore: edition.pagesBefore, pagesAfter: edition.pagesAfter, ...geo });

      // `--page-only <dir>` draws the leaf on its own so it can be looked at
      // before anything is spliced into a book. Every one of these pages was
      // eyeballed at 8.5 × 11 before it went into an interior.
      const proofDir = val("page-only");
      if (proofDir) {
        mkdirSync(proofDir, { recursive: true });
        const specPath = join(TMP, `${label.replace("/", "-")}.json`);
        mkdirSync(TMP, { recursive: true });
        writeFileSync(specPath, JSON.stringify(spec, null, 1));
        const out = execFileSync(PY, [RENDERER, "--spec", specPath, "--out", join(proofDir, `${label.replace("/", "-")}.pdf`), "--page-only", join(proofDir, `${label.replace("/", "-")}.pdf`)], { encoding: "utf8" });
        const r = JSON.parse(out.trim().split("\n").pop());
        console.log(`PROOF ${label.padEnd(46)} QR ${(r.qr.fraction_of_usable_height * 100).toFixed(0)}% · ${r.qr.module_mm.toFixed(2)} mm/module · type scale ${r.layout.typeScale}`);
        results.push({ label, proof: true });
        continue;
      }

      if (!COMMIT) {
        console.log(`PLAN  ${label.padEnd(46)} ${edition.mode.padEnd(7)} ${edition.pagesBefore} → ${edition.pagesAfter}  ${spine.coverRebuildCorrect ? "cover rebuild" : "cover unchanged"}${edition.hold ? "  [HOLD]" : ""}`);
        results.push({ label, planned: true, spine });
        continue;
      }

      const interiorPath = spec.interior;
      const previousPath = interiorPath.replace(/\.pdf$/, ".pre-companion.pdf");
      if (!existsSync(previousPath)) copyFileSync(interiorPath, previousPath);
      const tmpOut = join(TMP, `${label.replace("/", "-")}.pdf`);
      const result = run(spec, tmpOut);
      const verification = verify(spec, tmpOut, result);
      if (!verification.allPass) {
        failures++;
        console.error(`FAIL  ${label}`);
        for (const c of verification.checks.filter((x) => !x.pass)) console.error(`      ${c.name}: ${c.detail}`);
        rmSync(tmpOut, { force: true });
        continue;
      }
      copyFileSync(tmpOut, interiorPath);
      rmSync(tmpOut, { force: true });
      const manifest = writePackage(bookSlug, format, edition, spec, result, verification, spine, interiorPath, previousPath);
      results.push({ label, manifest });
      console.log(`OK    ${label.padEnd(46)} p${result.companionPage} · ${edition.pagesBefore} → ${verification.info.pages} · QR ${(result.qr.fraction_of_usable_height * 100).toFixed(0)}% ${result.qr.module_mm.toFixed(2)}mm/module${edition.hold ? "  [HOLD]" : ""}`);
    } catch (err) {
      failures++;
      console.error(`ERROR ${label}: ${err.message.split("\n").slice(-6).join("\n")}`);
    }
  }
}

if (COMMIT) {
  const index = join(PACKAGES, "INDEX.json");
  mkdirSync(dirname(index), { recursive: true });
  // MERGE, never replace. A --slug run processes one edition, and writing only
  // that one used to delete every other edition in the index: 19 editions
  // became 1, twice, from two different sessions. Entries this run rebuilt win;
  // everything else is carried through untouched.
  const key = (m) => `${m?.book}/${m?.format}`;
  const kept = new Map();
  if (existsSync(index)) {
    try {
      const prev = JSON.parse(readFileSync(index, "utf8"));
      for (const m of prev.editions ?? []) if (m?.book && m?.format) kept.set(key(m), m);
    } catch (err) {
      console.error(`WARN  ${index} is unreadable (${err.message}); it will be rewritten from this run alone.`);
    }
  }
  for (const r of results) if (r.manifest) kept.set(key(r.manifest), r.manifest);
  const editions = [...kept.values()].sort((a, b) =>
    a.book === b.book ? a.format.localeCompare(b.format) : a.book.localeCompare(b.book));
  writeFileSync(index, `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), editions }, null, 2)}\n`);
}
console.log(`\n${results.length} edition(s) processed, ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
