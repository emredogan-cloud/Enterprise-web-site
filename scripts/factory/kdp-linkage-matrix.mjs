#!/usr/bin/env node
/**
 * The KDP → Valice Press linkage matrix, one row per print edition.
 *
 *   node scripts/factory/kdp-linkage-matrix.mjs [--check-urls] > docs/execution/phase-4/KDP_VALICE_LINKAGE_MATRIX.csv
 *
 * Every column is read by `kdp-linkage-lint.mjs` from the built interior,
 * the catalogue and the companion registry — nothing is typed in. The
 * `decision` and `why` columns come from the catalogue's per-book
 * `linkageDecision`, so the reasoning sits next to the data it is about.
 */
import { BOOKS } from "../catalog/valice-catalog.mjs";
import { runLinkageAudit } from "./kdp-linkage-lint.mjs";

const checkUrls = process.argv.includes("--check-urls");

const COLUMNS = [
  "book", "project", "asin", "format", "current_amazon_state", "companion_exists", "companion_url",
  "companion_value", "printed_url_present", "printed_urls", "qr_present", "amazon_back_matter",
  "valice_reference", "author_bio_correct", "domain_correct", "pdf_metadata_ok", "page_count",
  "kdp_linkage_status", "decision", "required_action", "why", "source_file", "last_checked",
];

const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const rows = await runLinkageAudit({ checkUrls });
const decisions = new Map(BOOKS.map((b) => [b.slug, b.linkageDecision ?? null]));

console.log(COLUMNS.join(","));
for (const r of rows) {
  const d = decisions.get(r.book) ?? {};
  const state = r.live ? "live" : r.amazonState === "in_review" ? "in_review" : r.availability === "coming_soon" ? "coming_soon (not uploaded)" : r.amazonState;
  console.log([
    r.book, r.project ?? "", r.asin ?? "", r.format, state,
    r.companionExists ? "yes" : "no", r.companionUrl ?? "", r.companionValue ?? "",
    r.hasSiteUrl ? "yes" : "no", (r.urls ?? []).join(" | "), r.qrPresent ?? "",
    r.amazonContext ? `yes — “${r.amazonContext}”` : "no", r.valiceMention ? "yes" : "no",
    r.bioStatus ?? "", r.forbiddenHosts?.length ? "no" : "yes", r.metadataOk === undefined ? "" : r.metadataOk ? "yes" : "no",
    r.pages ?? "", r.status, d.decision ?? "", r.action ?? "", d.why ?? "", r.interior ?? "", r.lastChecked,
  ].map(q).join(","));
}
