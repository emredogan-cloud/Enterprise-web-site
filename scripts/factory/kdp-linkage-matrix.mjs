#!/usr/bin/env node
/**
 * The KDP → Valice Press linkage matrix, one row per print edition.
 *
 *   node scripts/factory/kdp-linkage-matrix.mjs [--check-urls] > docs/execution/phase-5/KDP_VALICE_LINKAGE_MATRIX.csv
 *
 * Since 2026-09-03 the matrix also carries what the *page* looks like, not
 * only whether an address appears somewhere in the book: which page the
 * companion stands on, whether that page meets the house standard for a
 * dedicated destination, the QR's measured size and module pitch, the old and
 * new page counts, and what each of those does to the spine and the cover.
 * Those columns exist because "the URL is in the book" turned out to be true
 * of four editions in which no reader would ever have noticed it.
 *
 * Every column is read by `kdp-linkage-lint.mjs` from the built interior,
 * the catalogue and the companion registry — nothing is typed in. The
 * `decision` and `why` columns come from the catalogue's per-book
 * `linkageDecision`, so the reasoning sits next to the data it is about.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BOOKS } from "../catalog/valice-catalog.mjs";
import { COMPANION_PAGE_PLAN } from "./companion-page-spec.mjs";
import { EDITION_GEOMETRY } from "./edition-geometry.mjs";
import { runLinkageAudit } from "./kdp-linkage-lint.mjs";
import { coverFor } from "./rebuilt-covers.mjs";
import { assess } from "./spine-check.mjs";

const PACKAGES = "docs/execution/phase-5/kdp-packages";

const checkUrls = process.argv.includes("--check-urls");

const COLUMNS = [
  "book", "project", "asin", "format", "current_amazon_state", "companion_exists", "companion_url",
  "companion_value", "printed_url_present", "printed_urls", "companion_page", "dedicated_companion_page",
  "other_mention_pages", "qr_present", "qr_side_in", "qr_percent_of_page_height", "qr_module_mm",
  "amazon_back_matter", "valice_reference", "author_bio_correct", "domain_correct", "pdf_metadata_ok",
  "page_count_old", "page_count_new", "page_count_changed", "spine_in_old", "spine_in_new",
  "cover_update_required", "spine_update_required", "rebuilt_cover_available", "revised_interior",
  "revision_reason", "kdp_upload_required", "proof_recommended", "hold_reason",
  "kdp_linkage_status", "decision", "required_action", "why", "source_file", "evidence", "last_checked",
];

const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const rows = await runLinkageAudit({ checkUrls });
const decisions = new Map(BOOKS.map((b) => [b.slug, b.linkageDecision ?? null]));

console.log(COLUMNS.join(","));
for (const r of rows) {
  const d = decisions.get(r.book) ?? {};
  const state = r.live ? "live" : r.amazonState === "in_review" ? "in_review" : r.availability === "coming_soon" ? "coming_soon (not uploaded)" : r.amazonState;
  const plan = COMPANION_PAGE_PLAN[r.book]?.editions?.[r.format] ?? null;
  const geo = EDITION_GEOMETRY[r.book]?.[r.format] ?? null;
  const spine = plan && geo ? assess({ pagesBefore: plan.pagesBefore, pagesAfter: plan.pagesAfter, ...geo }) : null;
  const cover = coverFor(r.book, r.format);
  const pkg = join(PACKAGES, r.book, r.format, "manifest.json");
  const manifest = existsSync(pkg) ? JSON.parse(readFileSync(pkg, "utf8")) : null;
  const qr = r.qr?.found ? r.qr : null;

  console.log([
    r.book, r.project ?? "", r.asin ?? "", r.format, state,
    r.companionExists ? "yes" : "no", r.companionUrl ?? "", r.companionValue ?? "",
    r.hasSiteUrl ? "yes" : "no", (r.urls ?? []).join(" | "),
    r.companionPage ?? "", r.dedicatedPage ? "yes" : "no", (r.otherMentionPages ?? []).join(" | "),
    r.qrPresent ?? "", qr ? qr.sideIn : "", qr ? (qr.fractionOfPageHeight * 100).toFixed(1) : "", qr ? qr.moduleMm : "",
    r.amazonContext ? `yes — “${r.amazonContext}”` : "no", r.valiceMention ? "yes" : "no",
    r.bioStatus ?? "", r.forbiddenHosts?.length ? "no" : "yes", r.metadataOk === undefined ? "" : r.metadataOk ? "yes" : "no",
    plan?.pagesBefore ?? "", r.pages ?? "", plan ? (plan.pagesBefore === plan.pagesAfter ? "no" : "yes") : "",
    spine ? spine.before.spineWidthIn.toFixed(4) : "", spine ? spine.after.spineWidthIn.toFixed(4) : "",
    spine ? (spine.coverRebuildRequired ? "required (outside KDP tolerance)" : spine.coverRebuildCorrect ? "rebuild correct (inside tolerance)" : "no") : "",
    spine ? (spine.coverRebuildCorrect ? "yes" : "no") : "",
    cover ? (cover.built ? cover.path : `no — ${cover.reason}`) : (spine?.coverRebuildCorrect ? "no rebuilt wrap recorded" : "not needed"),
    manifest ? "yes" : "no", plan?.replacing ?? "", manifest ? "yes" : "no",
    manifest ? (manifest.proofRecommended ? "yes" : "no") : "",
    plan?.hold ?? "",
    r.status, d.decision ?? "", r.action ?? "", d.why ?? "", r.interior ?? "",
    manifest ? join(PACKAGES, r.book, r.format, "UPLOAD.md") : "", r.lastChecked,
  ].map(q).join(","));
}
