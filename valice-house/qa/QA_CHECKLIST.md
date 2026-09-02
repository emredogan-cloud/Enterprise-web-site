# QA Checklist — Gates 8 and 11

**Status:** ACTIVE · v1 (2026-09-02)

## Gate 8 — Interior / proof (R7 prepares, Founder signs)

Run in this order; each line names its evidence file inside the project's `QA/` directory.

| Step | Check | Tool | Evidence |
|---|---|---|---|
| 1 | Interior PDF opens; page count, page size, trim match `project_config.json`; separate hardcover build if the hardcover page count differs | `python3 scripts/factory/preflight.py <project>` (uses `pdfinfo`, `pdffonts`, `pdftotext`) | `QA/preflight.json` |
| 2 | Every font embedded on every page (rule A1) | same | same |
| 3 | No placeholder tokens; ISBN line is `PENDING — KDP-PROVIDED ISBN` or real (A5, A6) | same | same |
| 4 | PDF Title/Author metadata set (A4) | same | same |
| 5 | Glyph coverage of the source text against each face (A2) | project `qa_kdp_conversion.py` or equivalent in the book repo | `QA/glyphs.json` |
| 6 | Cover wraps: safe area from outer edge, spine from the edition's page count and paper, calculator values on file, ≤ 40 MB (B1–B7) | `node scripts/factory/cover-check.mjs <project>` | `QA/cover-check.json` |
| 7 | Deliberate blank pages match the spec (A8) | preflight | `QA/preflight.json` |
| 8 | KDP Previewer walked by the Founder using the project's `KDP_PREVIEWER_CHECKLIST.md` (E1) | human | `QA/previewer.md` with date and findings |
| 9 | Physical proof ordered for a new trim/template/paper (E2); defects logged | human | `QA/proof.md` with order id |
| 10 | Gate recorded with evidence | `node scripts/factory/gate.mjs <project> set 8 passed --evidence QA/preflight.json --owner founder` | `gates.json` |

## Gate 11 — Website product QA (R9, automated)

| Step | Check | Tool |
|---|---|---|
| 1 | Catalogue entry passes the catalogue tests (ASIN only on `kdp: "live"`, Select ⇒ no direct sale, price 0 ⇒ no Offer) | `npm test` (`valice-catalog.test.ts`) |
| 2 | Cover `public/images/books/<slug>.webp` present, ≥ 1200 px tall | `node scripts/covers/ingest-covers.mjs --check` |
| 3 | Direct formats: master present in R2 (`books/<slug>/master/v<n>/master.pdf`), `paddlePriceId` real and active | `node scripts/catalog/validate-catalog.mjs --env scripts/tmp/.env.production` |
| 4 | Preview pages rendered from the real PDF (4 images) | `build-previews.mjs`; validate-catalog |
| 5 | Every `kdp: "live"` ASIN returns 200 | validate-catalog |
| 6 | Production page `/books/<slug>` 200; JSON-LD parses; Offer only when price > 0 | validate-catalog |
| 7 | Slug in `sitemap.xml`; companion route (if any) 200 | validate-catalog |
| 8 | Price consistency DB ↔ catalogue ↔ Paddle | validate-catalog |
| 9 | Gate recorded | `gate.mjs <project> set 11 passed --evidence QA/validate-catalog.json --owner R9` |

## Gate 12 — Founder publication approval

The diff that sets `websiteStatus: "published"` in `scripts/catalog/valice-catalog.mjs` (and/or the KDP submission id) is the evidence. The loader applies it; nothing publishes by SQL.
