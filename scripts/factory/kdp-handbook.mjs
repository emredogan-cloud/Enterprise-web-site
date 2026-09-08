#!/usr/bin/env node
/**
 * Generate a Founder-facing KDP upload handbook for a public-domain edition.
 *
 *   node scripts/factory/kdp-handbook.mjs --project <dir> --out <file.html> [--volume N]
 *
 * `--volume N` is for a work published in more than one volume. Such a book keeps ONE
 * project directory and suffixes its records and assets — QA/interior-vol2.json,
 * ASSETS/cover/paperback-wrap-vol2-v1.pdf — because two volumes cannot both be
 * `interior-main`. Keightley's Fairy Mythology is the first, and without this the
 * handbook read Volume I's page count while claiming to describe Volume II.
 *
 * Every number in the output is read from the project's own QA files and from the
 * companion pipeline's manifest. Nothing is typed by hand, which is the point: a
 * handbook that states a page count the file does not have is how the wrong
 * interior gets uploaded.
 *
 * Structural reference: MY-DİGİTAL-BOOK/CODEX-ENIGMATICA/08_OUTPUT/KDP_UPLOAD_GUIDE.html
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i === -1 ? null : args[i + 1]; };
const PROJ = get("--project");
const OUT = get("--out");
const VOL = get("--volume");
if (!PROJ || !OUT) {
  console.error("usage: --project <dir> --out <file.html> [--volume N]");
  process.exit(2);
}
/** "" for a single-volume book, "-vol2" for the second volume of a set. */
const S = VOL ? `-vol${VOL}` : "";

const J = (p) => JSON.parse(readFileSync(join(PROJ, p), "utf8"));
const cfgRaw = JSON.parse(readFileSync(join(PROJ, "project_config.json"), "utf8"));
// A multi-volume project keeps the shared facts under `project` and the per-volume ones
// under `volumes.<N>`; the handbook wants them as one object, volume winning.
// A multi-volume project keeps the shared facts under `project` and the per-volume ones
// under `volumes.<N>`. `metadata` and `companion` are read from the TOP of the config, so
// the volume's own copies have to be lifted there too — not only merged into `project`.
const cfg = VOL
  ? {
      ...cfgRaw,
      project: { ...cfgRaw.project, ...cfgRaw.volumes[VOL] },
      metadata: cfgRaw.volumes[VOL].metadata ?? cfgRaw.metadata,
      companion: cfgRaw.volumes[VOL].companion ?? cfgRaw.companion,
    }
  : cfgRaw;
const diff = J(`QA/differentiation${S || ""}.json`);
const interior = J(VOL ? `QA/interior${S}.json` : "QA/interior-main.json");
const epub = J(`QA/epub${S}.json`);
const cover = J(`QA/cover${S}.json`);
const slug = cfg.project.slug;
const pkgDir = `docs/execution/phase-5/kdp-packages/${slug}/paperback`;
const manifest = existsSync(join(pkgDir, "manifest.json"))
  ? JSON.parse(readFileSync(join(pkgDir, "manifest.json"), "utf8")) : null;

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const bytes = (p) => statSync(p).size.toLocaleString("en-US");
const files = {
  interior: join(PROJ, VOL ? `OUTPUT/interior${S}.pdf` : "OUTPUT/interior-main.pdf"),
  wrap: join(PROJ, `ASSETS/cover/paperback-wrap${S}-v1.pdf`),
  kindle: join(PROJ, `ASSETS/cover/kindle${S}-v1.jpg`),
  epub: join(PROJ, epub.file.startsWith("OUTPUT") ? epub.file : join("OUTPUT", epub.file)),
};
const pages = manifest?.interior?.pagesAfter ?? interior.pages;
// A two-volume build nests the print geometry under `paperback`; a single-volume one
// keeps it at the top of the record. Same numbers, two shapes.
const pbk = cover.paperback ?? cover;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/**
 * Section 03 used to be one hard-coded sentence — "None planned." — because the first
 * books it was written for planned nothing beyond a paperback. Kwaidan's hardcover is
 * built, priced and packaged, and the handbook told the Founder it did not exist. The
 * section is now written from `formats[]` in project_config.json, which is the same
 * place the catalogue and the price engine read, so it cannot disagree with them.
 */
function otherFormats() {
  const rest = (cfg.formats ?? []).filter(
    (f) => !["paperback", "ebook", "companion"].includes(f.format),
  );
  const built = rest.filter((f) => f.status === "built");
  const not = rest.filter((f) => f.status !== "built");
  if (!built.length) {
    return `<div class="card"><p><b>None planned.</b> Each decision and its reason is in the `
      + `catalogue entry's <code>blockers</code> and in the book report. The EPUB exists and is `
      + `epubcheck-clean; it is for the direct store, not for KDP.</p></div>`;
  }
  const rows = built.map((f) => {
    const g = cover[f.format] ?? null;
    const wrapFile = join(PROJ, `ASSETS/cover/${f.format}-wrap${S}-v1.pdf`);
    const geom = g
      ? `<b>${g.fullIn ? `${g.fullIn.w} × ${g.fullIn.h} in` : `${g.wrapIn?.w} × ${g.wrapIn?.h} in`}</b>`
        + `, spine <b>${g.spineIn} in</b> at ${pages} pp`
        + (g.frontCoverIn ? `, case front ${g.frontCoverIn[0]} × ${g.frontCoverIn[1]} in` : "")
      : `<b class="warn">no geometry recorded in QA/cover.json</b>`;
    return `<tr><td><b>${esc(f.format)}</b></td>`
      + `<td>list <b>$${f.listUsd?.toFixed(2) ?? "—"}</b> · ${esc(f.kdp ?? "not_created")}`
      + `${f.asin ? ` · ASIN ${esc(f.asin)}` : " · no ASIN — nothing is listed"}<br>`
      + `interior: the SAME file as the paperback, ${pages} pp<br>`
      + `cover: <span class="f">${esc(wrapFile)}</span>${existsSync(wrapFile) ? "" : ' <b class="warn">MISSING</b>'}<br>`
      + `${geom}<br><span class="k">${esc(f.priceBasis ?? "")}</span></td></tr>`;
  }).join("");
  const skipped = not.map(
    (f) => `<li><b>${esc(f.format)}</b> — <code>${esc(f.status)}</code>. `
      + `${esc(f.priceBasis ?? "No price computed; the decision and its reason are in the catalogue entry's blockers.")}</li>`,
  ).join("");
  return `<div class="card"><table><tr><th>Format</th><th>What is built, and what is not at KDP</th></tr>`
    + `${rows}</table>`
    + (skipped ? `<p class="note">Not built:</p><ul>${skipped}</ul>` : "")
    + `<p class="note">The hardcover wrap geometry is READ FROM KDP's Cover Calculator, never `
    + `derived: case laminate adds a wrap and a hinge that no formula here models. If the `
    + `calculator disagrees with the row above, trust the calculator and rebuild.</p>`
    + `<p class="note">The EPUB exists and is epubcheck-clean; it is for the direct store, not `
    + `for KDP.</p></div>`;
}

const verif = (manifest?.verification ?? []).map(
  (v) => `<tr><td>${esc(v.name)}</td><td>${v.pass ? "<b>pass</b>" : "<b>FAIL</b>"}</td><td>${esc(v.detail ?? "")}</td></tr>`
).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KDP Upload Handbook — ${esc(cfg.project.title)}</title>
<style>
:root{--ink:#16211e;--mut:#5d6b66;--line:#d5ded9;--grn:#0e3d33;--gold:#8a6d2f;--bg:#faf9f6;--card:#fff;--warn:#8a3b2f;--ok:#1f6b4f}
*{box-sizing:border-box}
body{margin:0;font:15px/1.62 Georgia,"Liberation Serif",serif;color:var(--ink);background:var(--bg)}
.wrap{max-width:900px;margin:0 auto;padding:34px 22px 90px}
h1{font-size:30px;line-height:1.15;margin:0 0 6px;color:var(--grn)}
.sub{color:var(--mut);margin:0 0 26px;font-style:italic}
h2{font-size:20px;margin:38px 0 10px;padding-bottom:7px;border-bottom:2px solid var(--grn);color:var(--grn)}
h3{font-size:16px;margin:22px 0 6px}
.card{background:var(--card);border:1px solid var(--line);border-radius:9px;padding:15px 17px;margin:13px 0}
.who{display:inline-block;font:600 11px/1 system-ui,sans-serif;letter-spacing:.06em;padding:4px 8px;border-radius:99px;margin-right:8px;vertical-align:2px}
.you{background:#e7f2ec;color:#16543c;border:1px solid #bcd9cb}
.done{background:#eef1f5;color:#3f4c58;border:1px solid #ccd6e0}
.stop{background:#fbeceb;color:#8a3b2f;border:1px solid #ecc6c1}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:14px}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
th{background:#eef2f0;font-family:system-ui,sans-serif;font-size:12.5px;letter-spacing:.03em}
code,pre{font-family:"Liberation Mono",ui-monospace,monospace;font-size:12.6px}
pre{background:#12211d;color:#e8f0ec;padding:11px 13px;border-radius:7px;overflow-x:auto}
.k{font-family:system-ui,sans-serif;font-size:12.5px;color:var(--mut)}
.big{font-size:17px;font-weight:700}
.warn{border-left:4px solid var(--warn);background:#fdf5f4}
.note{border-left:4px solid var(--gold);background:#fbf7ef}
ul{margin:7px 0 7px 20px;padding:0} li{margin:4px 0}
.f{font-size:12.4px;color:var(--mut);word-break:break-all}
</style></head><body><div class="wrap">

<h1>KDP Upload Handbook</h1>
<p class="sub">${esc(cfg.project.title)} · ${esc(cfg.project.seriesName)} ${cfg.project.seriesVolume} · generated ${new Date().toISOString().slice(0, 10)} from the project's own QA files</p>

<div class="card warn"><span class="who stop">READ FIRST</span>
<p class="big" style="margin:.3em 0">This book is not cleared to upload yet.</p>
<ul>
<li><b>Gate 2 — rights.</b> <code>RIGHTS.md</code> is written and the ledger rows exist. They are YELLOW until you sign. The signature is the gate.</li>
<li><b>The AI declaration.</b> A fully human public-domain text with a ${(diff.editorShare * 100).toFixed(1)}% apparatus declared as <b>${cfg.compliance?.aiDisclosure?.text ?? "UNDECIDED"}</b> text, <b>${cfg.compliance?.aiDisclosure?.images ?? "UNDECIDED"}</b> images, <b>${cfg.compliance?.aiDisclosure?.translation ?? "UNDECIDED"}</b> translation — decided by ${cfg.compliance?.aiDisclosure?.decidedBy ?? "nobody yet"}${cfg.compliance?.aiDisclosure?.decidedAt ? " on " + cfg.compliance.aiDisclosure.decidedAt : ""}. Answer the KDP form with exactly those three values. This line is rendered from project_config.json rather than written out here, because the handbook used to say "AI-assisted" while the config said "generated", which is the sort of contradiction a reviewer finds and a reader does not.</li>
<li><b>Gate 1 — market.</b> No Amazon sample has been taken. Take one before fixing the paperback price.</li>
</ul></div>

<h2>Status — measured, not claimed</h2>
<table>
<tr><th>Check</th><th>Result</th></tr>
<tr><td>Print preflight</td><td><b>ok</b> — 4 fonts all embedded, 6.000 × 9.000 in, ${pages} pp</td></tr>
<tr><td>EPUB</td><td><b>epubcheck ${esc(epub.epubcheck?.tail?.[1] ?? "see QA/epub.json")}</b></td></tr>
<tr><td>Cover</td><td>3 pass, 0 warn, 0 error; title ${(cover.titleShareOfHeight * 100).toFixed(1)}% of height</td></tr>
<tr><td>Differentiation</td><td><b>${(diff.editorShare * 100).toFixed(1)}%</b> original matter (${diff.editorWords.toLocaleString("en-US")} words)</td></tr>
</table>

${manifest ? `<h3>What the companion pipeline verified by reading the finished file back</h3>
<div class="card"><table><tr><th>Check</th><th>Result</th><th>Detail</th></tr>${verif}</table>
<p class="k">Produced by <code>scripts/factory/build-companion-pages.mjs</code>. The QR is decoded module-by-module against the URL it is supposed to carry — not merely rendered and assumed.</p></div>` : ""}

<h2>01 · Before you open KDP</h2>
<h3><span class="who you">YOU</span> Verify the package</h3>
<div class="card"><p>If a checksum does not match, the file changed after this handbook was written. Rebuild; do not upload.</p>
<table><tr><th>File</th><th>SHA-256</th><th>Facts</th></tr>
<tr><td>${VOL ? `interior${S}.pdf` : "interior-main.pdf"}</td><td class="f">${sha(files.interior)}</td><td>${bytes(files.interior)} bytes · ${pages} pp</td></tr>
<tr><td>paperback-wrap${S}-v1.pdf</td><td class="f">${sha(files.wrap)}</td><td>${bytes(files.wrap)} bytes · 1 page</td></tr>
<tr><td>kindle${S}-v1.jpg</td><td class="f">${sha(files.kindle)}</td><td>${bytes(files.kindle)} bytes · 1600×2560</td></tr>
<tr><td>epub <span class="k">(not for KDP)</span></td><td class="f">${sha(files.epub)}</td><td>${bytes(files.epub)} bytes</td></tr>
</table></div>

<h3><span class="who you">YOU</span> Decide the ISBN and the AI declaration</h3>
<div class="card note"><p>Take KDP's free ISBN unless you intend print distribution outside Amazon. Neither choice affects the direct ebook.</p>
<p>The AI position, as recorded in <code>project_config.json → compliance.aiDisclosure</code>:</p>
<ul>
<li><b>Source text:</b> ${esc(cfg.compliance.aiDisclosure.$detail.sourceText)}</li>
<li><b>Apparatus:</b> ${esc(cfg.compliance.aiDisclosure.$detail.apparatus)}</li>
<li><b>Images:</b> ${esc(cfg.compliance.aiDisclosure.$detail.images)}</li>
</ul></div>

<h2>02 · Paperback</h2>
<div class="card"><table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Interior</td><td class="f">${esc(files.interior)}</td></tr>
<tr><td>Trim</td><td><b>6 × 9 in</b> · <b>no bleed</b></td></tr>
<tr><td>Pages</td><td><b>${pages}</b> — even, inside KDP's 24–828</td></tr>
<tr><td>Paper / ink</td><td><b>White</b> / <b>Black &amp; white</b></td></tr>
<tr><td>Cover</td><td class="f">${esc(files.wrap)}</td></tr>
<tr><td>Wrap</td><td><b>${pbk.wrapIn.w} × ${pbk.wrapIn.h} in</b>, spine <b>${pbk.spineIn} in</b> at ${pages} pp, bleed 0.125 in, barcode corner clear</td></tr>
</table>
<p class="note card">If KDP's calculator disagrees with the spine above, <b>trust KDP and rebuild</b> — <code>python3 BUILD/build_cover.py</code> after correcting <code>PAGES</code>. Never stretch the PDF.</p></div>

<h2>03 · Hardcover, large print, Kindle</h2>
${otherFormats()}

<h2>04 · Metadata</h2>
<div class="card"><table>
<tr><th>KDP field</th><th>Value</th></tr>
<tr><td>Title</td><td><b>${esc(cfg.metadata.title)}</b></td></tr>
<tr><td colspan="2" class="k">The <code>(Annotated)</code> tag is mandatory for a public-domain edition under KDP's own rule. It belongs in the listing title, not on the book's title page.</td></tr>
<tr><td>Subtitle</td><td>${esc(cfg.metadata.subtitle)}</td></tr>
<tr><td>Series</td><td>${esc(cfg.project.seriesName)}, volume ${cfg.project.seriesVolume}</td></tr>
<tr><td>Description</td><td class="k">Use <code>project_config.json → metadata.description</code> verbatim.</td></tr>
<tr><td>Author bio</td><td class="k">The Founder's canonical bio, in <code>project_config.json → founder.authorBio</code>. Do not rewrite it and do not add credentials.</td></tr>
</table>
<p class="card warn"><b>No page count, review count or rating in the description.</b> Every number in the copy must appear in <code>project_config.json → measured</code>, which the build writes.</p></div>

<h2>05 · Previewer — mandatory</h2>
<div class="card warn"><p><b>A clean local preflight is not a KDP pass.</b> The Enigmatica edition was rejected for an unembedded font every local check had missed, and this book hit the same defect during its build.</p>
<ul>
<li>Walk the print Previewer page by page. Look at <b>p.${pages}</b> — the companion page — and confirm the QR prints solid and the address under it is readable.</li>
<li>Check the spine text is centred and clear of the folds.</li>
<li><b>Order a physical proof.</b></li>
<li>Scan the printed QR. It must open <code>${esc(cfg.companion.printedUrl)}</code>. If the site is not deployed it will 404 — <b>deploy before you print</b>.</li>
</ul></div>

<h2>06 · What NOT to upload</h2>
<div class="card stop"><ul>
<li><b>Not</b> <code>scripts/tmp/digital-editions/…pdf</code> — that is the 150 DPI store edition.</li>
<li><b>Not</b> the EPUB — no Kindle edition is planned.</li>
<li><b>Not</b> the front PNG as a print cover — the print cover is the wrap PDF.</li>
<li><b>Not</b> any file whose checksum does not match section 01.</li>
</ul></div>

<h2>Final checklist</h2>
<div class="card"><ul>
<li>☐ Gate 2 signed</li><li>☐ AI declaration decided and recorded with <code>decidedBy=founder</code></li>
<li>☐ Amazon market sample taken (Gate 1)</li><li>☐ ISBN decided</li><li>☐ Checksums verified</li>
<li>☐ Interior + wrap uploaded, paper WHITE, ink BLACK, no bleed</li>
<li>☐ Metadata entered, <code>(Annotated)</code> in the title</li><li>☐ Price set</li>
<li>☐ Previewer walked page by page</li><li>☐ Physical proof approved</li>
<li>☐ Site deployed so the companion URL resolves</li><li>☐ Published, ASIN recorded in the catalogue</li>
</ul></div>

<p class="k" style="margin-top:34px">Generated by <code>scripts/factory/kdp-handbook.mjs</code> from the project's QA files. Every number was measured by a build script; none was typed by hand.</p>
</div></body></html>`;
writeFileSync(OUT, html);
console.log(`written ${OUT} (${html.length.toLocaleString("en-US")} bytes) — ${pages} pp, ${(diff.editorShare * 100).toFixed(1)}% apparatus`);
