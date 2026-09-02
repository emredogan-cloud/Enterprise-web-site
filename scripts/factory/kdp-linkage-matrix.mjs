/**
 * The linkage audit as a CSV the Founder can sort, and as a decision per book.
 *
 * `kdp-linkage-lint.mjs` answers "is the link there?". This adds the two
 * columns a person actually needs next: the exact URL that edition should
 * print, and whether it is worth re-uploading an interior to say so now or
 * at the next revision anyway.
 *
 *   node scripts/factory/kdp-linkage-matrix.mjs > docs/execution/phase-4/KDP_VALICE_LINKAGE_MATRIX.csv
 */
import { execFileSync } from "node:child_process";

const audit = JSON.parse(
  execFileSync("node", ["scripts/factory/kdp-linkage-lint.mjs", "--json"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }),
);

/**
 * When to re-upload, per book. A KDP interior replacement is free of charge
 * and costs a review cycle of a few days, during which the listing keeps
 * selling — so the real question is not cost but whether there is anything
 * worth pointing at yet.
 *
 *   update_now         a companion already exists; the only missing step is
 *                      printing its address.
 *   with_companion     the companion has to be built first; do both in one
 *                      upload rather than two.
 *   next_edition       nothing to point at and no companion planned; fold the
 *                      URL in whenever the interior is next touched for
 *                      another reason.
 */
const PLAN = {
  "the-great-book-of-world-games": {
    decision: "update_now",
    why: "The companion is live with four PDFs — index, culture cards, score sheets and 31 board diagrams — and this is the flagship print pilot with an ad campaign about to point at it. Every buyer who reaches the last page today is told nothing.",
  },
  "korean-hangul-handwriting-workbook": {
    decision: "update_now",
    why: "The companion is live, and the interior is being reopened anyway to confirm the remediated file (handbook F1a). One upload, two fixes.",
  },
  "the-great-book-of-world-myths": {
    decision: "with_companion",
    why: "The strongest companion case in the catalogue and no companion yet: the book already contains a world map, per-culture cards and a pronunciation guide, and its buyers are parents and teachers who print things. Build the companion, then upload the interior once.",
  },
  "codex-bestiarium": {
    decision: "with_companion",
    why: "435 pages, 112 creatures with Thompson motif codes — a printable motif index is a genuinely useful free artefact and nobody else publishes one. Not urgent; no ad spend points here.",
  },
  "codex-mythologica": {
    decision: "with_companion",
    why: "Three live print editions and the book with the widest audience. Wait for the KDP Select term to lapse on 2026-11-03, when the ebook question reopens, and do the interior and the direct edition together.",
  },
  "the-myth-hunters-field-book": {
    decision: "with_companion",
    why: "A puzzle book with an answer key printed inside. The Enigmatica pattern — an online verification page instead of a printed answer — is a better product and a better reason to visit, but it is a rebuild, not a back-matter page.",
  },
  "the-puzzles-of-henry-dudeney": {
    decision: "already_done",
    why: "The interior was typeset after the companion existed and prints its URL. Nothing to do; it is the template for the rest.",
  },
  "codex-enigmatica": {
    decision: "already_done",
    why: "Prints valicepress.com/codex-enigmatica/verify — the verification page for the book's single hidden word. Reader utility first, no email, no data wall. The pattern every other title should copy.",
  },
};

const esc = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = [
  "book", "title", "asin", "format", "live", "companion_exists", "companion_url",
  "url_in_interior", "companion_url_in_interior", "qr_mentioned", "forbidden_host",
  "data_wall", "status", "decision", "exact_url_to_print", "action_required", "why",
];
console.log(header.join(","));

for (const r of audit.rows) {
  const plan = PLAN[r.book] ?? { decision: "next_edition", why: "" };
  console.log(
    [
      r.book,
      r.title,
      r.asin ?? "",
      r.format,
      r.live ? "yes" : "no",
      r.companionSlug ? "yes" : "no",
      r.companionUrl ?? "",
      r.hasSiteUrl === undefined ? "" : r.hasSiteUrl ? (r.urls ?? []).join(" | ") : "none",
      r.hasCompanionUrl === null || r.hasCompanionUrl === undefined
        ? "n/a"
        : r.hasCompanionUrl ? "yes" : "no",
      r.mentionsQr ? "yes" : "no",
      (r.forbiddenHosts ?? []).join(" | "),
      (r.dataWallUrls ?? []).join(" | "),
      r.status,
      plan.decision,
      r.companionUrl ?? `https://valicepress.com/books/${r.book}`,
      r.action,
      plan.why,
    ].map(esc).join(","),
  );
}
