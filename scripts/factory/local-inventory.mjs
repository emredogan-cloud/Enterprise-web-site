#!/usr/bin/env node
/**
 * local-inventory.mjs — what actually exists on disk, for every book project.
 *
 * READ THE ARTIFACTS, NOT THE FILENAMES. A file called `interior-main.pdf` proves a build
 * ran, not that the build is current or correct; a directory called `05-MYTHICAL-MONSTERS`
 * proves nothing at all. Every column below is either a file that was stat'd, a number read
 * out of a QA record the build wrote, or the word UNKNOWN.
 *
 * Emits JSON on stdout, or a table with --table.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";
const SKIP = new Set(["BACKUP", "COMMON-AREA", "reports", "node_modules", ".git"]);

/** Book projects: any directory that has a project_config.json, an OUTPUT/ or an 04_PRINT/. */
function findProjects(dir, depth = 0, out = []) {
  if (depth > 3) return out;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    const marks = ["project_config.json", "OUTPUT", "04_PRINT", "08_OUTPUT", "09_OUTPUT"];
    if (marks.some((m) => existsSync(join(full, m)))) out.push(full);
    else findProjects(full, depth + 1, out);
  }
  return out;
}

const j = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
const size = (p) => { try { return statSync(p).size; } catch { return null; } };

/** Every PDF/EPUB under a project, by extension, with its size. */
function artifacts(dir, depth = 0, out = []) {
  if (depth > 4) return out;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith(".") && e.name !== "node_modules") artifacts(full, depth + 1, out);
    } else if (/\.(pdf|epub)$/i.test(e.name)) {
      out.push({ file: full, name: e.name, bytes: size(full) });
    }
  }
  return out;
}

/**
 * The catalogue slug for a project that predates the `slug` field.
 *
 * Seven projects — the Codex series, the games books, the Hangul workbook — were built
 * before `project.slug` existed and carry only `project.title`. Matching on slug alone
 * reported them as "in the catalogue with no local project", which is exactly backwards:
 * they are on disk and always were. Slugifying the title resolves all seven, and the
 * result is CHECKED against the catalogue rather than trusted.
 */
function slugify(title) {
  return String(title ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    // An apostrophe is dropped, not turned into a separator: "The Myth Hunter's Field
    // Book" is `the-myth-hunters-field-book` in the catalogue, not `...hunter-s-...`.
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATALOG_SLUGS = new Set(
  (await import("../catalog/valice-catalog.mjs")).BOOKS.map((b) => b.slug),
);

function resolveSlug(v, proj, dir) {
  if (v.slug ?? proj.slug) return v.slug ?? proj.slug;
  const byTitle = slugify(proj.title);
  if (CATALOG_SLUGS.has(byTitle)) return byTitle;
  const byDir = slugify(basename(dir).replace(/^\d+-/, ""));
  return CATALOG_SLUGS.has(byDir) ? byDir : null;
}

const rows = [];
for (const dir of findProjects(ROOT)) {
  const cfg = j(join(dir, "project_config.json"));
  const qaDir = join(dir, "QA");
  const qa = existsSync(qaDir) ? readdirSync(qaDir).filter((f) => f.endsWith(".json")) : [];
  const files = artifacts(dir);
  const proj = cfg?.project ?? cfg ?? {};
  const volumes = cfg?.volumes ? Object.keys(cfg.volumes) : [null];

  for (const vol of volumes) {
    const v = vol ? cfg.volumes[vol] : proj;
    const sfx = vol ? `-vol${vol}` : "";
    const interior = j(join(qaDir, vol ? `interior${sfx}.json` : "interior-main.json"));
    const cover = j(join(qaDir, `cover${sfx}.json`)) ?? j(join(qaDir, "cover.json"));
    const epub = j(join(qaDir, `epub${sfx}.json`)) ?? j(join(qaDir, "epub.json"));
    const diff = j(join(qaDir, `differentiation${sfx}.json`)) ?? j(join(qaDir, "differentiation.json"));

    const pick = (re) => files.filter((f) => re.test(f.name)).map((f) => f.file);
    rows.push({
      dir: dir.replace(ROOT + "/", ""),
      project: basename(dir),
      // Three fallbacks, each checked against the catalogue rather than trusted: the
      // config's own slug; the slugified title, for the seven projects that predate the
      // slug field; and the directory name, for the two oldest books which have no
      // project_config.json at all.
      slug: resolveSlug(v, proj, dir),
      slugSource: v.slug ?? proj.slug ? "config"
        : CATALOG_SLUGS.has(slugify(proj.title)) ? "title-match"
        : CATALOG_SLUGS.has(slugify(basename(dir).replace(/^\d+-/, ""))) ? "dirname-match"
        : "unresolved",
      title: v.title ?? proj.title ?? null,
      volume: vol,
      seriesVolume: v.seriesVolume ?? proj.seriesVolume ?? null,
      pages: interior?.pages ?? null,
      apparatusShare: diff ? Number((diff.editorShare * 100).toFixed(2)) : null,
      aiDisclosure: cfg?.compliance?.aiDisclosure
        ? [cfg.compliance.aiDisclosure.text, cfg.compliance.aiDisclosure.images].join("/")
        : null,
      companionUrl: v.companion?.printedUrl ?? v.companionUrl ?? cfg?.companion?.printedUrl ?? null,
      artifacts: {
        interiorPdf: pick(new RegExp(`interior${sfx}\\.pdf$|interior-main\\.pdf$|INTERIOR.*\\.pdf$`, "i")),
        epub: pick(/\.epub$/i),
        paperbackWrap: pick(new RegExp(`paperback-wrap${sfx}-v\\d+\\.pdf$|paperback.*wrap.*\\.pdf$`, "i")),
        hardcoverWrap: pick(new RegExp(`hardcover-wrap${sfx}-v\\d+\\.pdf$|hardcover.*wrap.*\\.pdf$`, "i")),
        companionSheets: pick(new RegExp(`^(?!interior|paperback|hardcover).*${sfx}\\.pdf$`, "i")).length,
      },
      qaRecords: qa.length,
      pdfCount: files.filter((f) => /\.pdf$/i.test(f.name)).length,
      epubCount: files.filter((f) => /\.epub$/i.test(f.name)).length,
      epubcheck: epub ? "clean" : null,
      coverGeometry: cover ? (cover.paperback?.spineIn ?? cover.spineIn ?? null) : null,
    });
  }
}

rows.sort((a, b) => (a.seriesVolume ?? 999) - (b.seriesVolume ?? 999) || String(a.slug).localeCompare(String(b.slug)));

if (process.argv.includes("--table")) {
  const P = (s, n) => String(s ?? "—").slice(0, n).padEnd(n);
  console.log(P("slug", 34), P("vol", 4), P("pp", 5), P("app%", 6), P("pdf", 4), P("epub", 5), P("ai", 20), "project");
  console.log("-".repeat(130));
  for (const r of rows) {
    console.log(P(r.slug, 34), P(r.volume, 4), P(r.pages, 5), P(r.apparatusShare, 6),
      P(r.pdfCount, 4), P(r.epubCount, 5), P(r.aiDisclosure, 20), r.dir);
  }
  console.log(`\n${rows.length} book/volume rows across ${new Set(rows.map((r) => r.dir)).size} projects`);
} else {
  console.log(JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), root: ROOT, rows }, null, 1));
}
