# Pilot 3 — Korean Hangul Handwriting Workbook

**Status: RIGHTS-CLEAN IN THE FILES · READY FOR KDP + WEBSITE · founder Gate 2 signature pending** (2026-09-02)

## Objective
Prove the factory can take a book with a real rights defect, remove the defect in the source materials, rebuild every edition, and hand the Founder a ready-to-upload package — without fabricating a clearance.

## Product
124-page workbook (8.5 × 11 paperback, 8.25 × 11 hardcover, fixed-layout Kindle EPUB), 30 lessons, 40 letters, 122 stroke-order panels, 97 practice words. Project: `MY-DİGİTAL-BOOK/KOREAN-HANGUL-HANDWRITING-WORKBOOK` (commit `bc3c512`).

## Rights remediation (what was actually done)
| Step | Result |
|---|---|
| Inventory of the defect | S-0017 krdict and S-0018 표준국어대사전 (both CC BY-SA 2.0 KR) cited as verification authorities by all 97 word records and 30 lessons; S-0019 OSU IPA chart (CC BY-NC) cited by 28 character records and the pronunciation-hint table; one sentence of S-0019 quoted in an internal standard. No definition, example sentence or table had been reproduced (K18), but the Founder's rule is "not clearly commercial → not used at all". |
| Replacement sources | **S-0020** 국립국어원 「한국어 학습용 어휘 목록」 (2003; 5,965 words; page states 공공누리 제1유형 = commercial use and adaptation permitted, attribution required) — local copy + CSV, SHA-256 recorded. **S-0021** FSI *Korean Basic Course* vol. 1 (1968, U.S. Department of State; 17 U.S.C. § 105 public domain; archive.org "Public Domain") — OCR text, SHA-256 recorded. |
| Re-verification | 96/97 words found in S-0020 with entry id, part of speech and grade; **하마 was not in the list and was replaced by 허리 (waist, grade A)** using the same lesson's letters. 22 homographs disambiguated and recorded per word. |
| Rewrite | All 97 `english_gloss` / `literal_gloss` values re-authored; every `.notes.md` rewritten (entry, homograph choice, gloss authorship, history). 28 character records, the hint table, 30 lessons, the schema, the book's sources page (now prints the KOGL attribution line) and the derived-character builder rewired to S-0020/S-0021; the internal quotation removed. Old records kept with `superseded_by`, never deleted. |
| Mechanics | `06_BUILD/remediate_rights_sources.py` (idempotent; fails if any withdrawn id remains under `02_CONTENT`). |
| Rebuild | paperback + hardcover interiors, Kindle fixed-layout EPUB (13.4 MB), final package tree, KDP handbook regenerated to its fixed point. |
| QA | `qa_all.sh` **273 ✓ / 0 ✗**, `selftest.py` **257/257**, `kill_gate.py` PASS, validate_spec 21 sources / 56 chars / 40 strokes / 249 blocks / 97 words / 30 lessons. |
| Legal analysis | `RIGHTS.md` (new): layer-by-layer table; why "verification only" was defensible (17 U.S.C. § 102(b); CC FAQ: licence terms do not apply where there is no copyright; Korean database right: 97 look-ups are not a substantial part) and why the sources were withdrawn anyway. Not a legal opinion. |
| Ledger | `valice-house/rights/ledger.csv` RL-0021 (S-0020), RL-0022 (S-0021), RL-0023 (rewritten glosses) — **YELLOW pending the Founder's signature**; RL-0011/RL-0012 superseded. |

## What is still open, and whose it is
- **A7-5** cover-art commercial rights (Founder-supplied AI artwork) and **A7-6** KDP AI declaration — Founder (`legal.a7_status` stays `LEGAL_REVIEW_REQUIRED` until then; `.gate = release` is mechanically held).
- **KDP** — the paperback and hardcover in review carry the pre-remediation files; the Founder replaces them with `09_OUTPUT/FINAL/…` when KDP allows.
- Older, unchanged: cover art at ~83 DPI; no human usability test (Founder override K20); no BISAC.

## Formats and pricing
Paperback $12.99 and hardcover $21.99 — Founder-approved K43 (unchanged). Direct ebook: not priced until Gate 2; a fixed-layout EPUB is a reference edition and the direct product would be the PDF.

## Website
Catalogue entry rewritten (blockers, description no longer says "dictionary-verified"); stays `draft`. Companion `/companion/hangul` live since Phase 0, unchanged (it never depended on the withdrawn sources). *The catalogue load to production was blocked by the tool-permission layer — see FOUNDER_ACTIONS.*

## Email / companion / ads
Companion source `hangul-companion`; welcome email path fixed (EMAIL_FROM). No ads (not for sale).

## Results (actual)
No sales — the book is not on sale anywhere. Nothing to report and nothing invented.

## Time
Agent wall-clock for the remediation, rebuild and QA: about 2 h 30 min (11:55–14:30 UTC, interleaved with the other pilots). Founder time: 0 so far; the signature and the KDP file replacement are ~30 min.

## Next decision
Founder: sign Gate 2 (RIGHTS.md) → agent flips the catalogue, prices the direct ebook via price-engine, provisions Paddle, uploads the master. Then the Hangul franchise (Book 2) is unblocked.
