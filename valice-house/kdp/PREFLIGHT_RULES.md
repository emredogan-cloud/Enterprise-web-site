# Preflight Rules — the checks that exist because KDP rejected us

**Status:** ACTIVE · v1 (2026-09-02) · **Gate:** 8 · **Read by:** `scripts/factory/preflight.py`, `scripts/factory/cover-check.mjs`

Every rule below is a real rejection or a real defect from the book repositories. None is hypothetical. A build that fails one of these is not uploaded.

## A. Interior PDF

| # | Rule | Origin | Check |
|---|---|---|---|
| A1 | **Every font on every page is embedded and subsetted.** ReportLab's default canvas font (Helvetica, Type 1, not embedded) is written into every page's resource dictionary even when no text uses it; KDP substitutes non-embedded type ("question marks or boxes"). Set `rl_config.canvas_basefontname` to a project font — do not patch the default, replace it. | Enigmatica [1.4.0] ⛔① — all 274 pages | `pdffonts`: no row with `emb: no` |
| A2 | **Glyph coverage is measured against the face that will print the character, from the source text — not from the output.** `⚠` U+26A0 existed in DejaVu Sans Mono but not in DejaVu Serif; ReportLab drew `.notdef` and the character vanished from `pdftotext` output entirely, so the defect was invisible in the PDF text layer. The check runs at typesetting time and stops the build. Same class: `ğ` missing from every project font until a fifth font was added (Hangul K39); `Māori` printed as `M■ori` (Field Book, fonts 0/3 embedded in phase 6). | Enigmatica ⛔②; Hangul K39; Field Book | source-text codepoints ∩ font cmap per face |
| A3 | Page count, page size and trim are identical across the file and match `project_config.json`; hardcover and paperback are **separate builds with their own page counts** (Enigmatica hc went 274 → 276 when `⚠` was removed and the line breaks changed). | Enigmatica ⛔⑤ | `pdfinfo` |
| A4 | PDF metadata Title and Author are set (Field Book's file reads `untitled` / `anonymous`). | Field Book | `pdfinfo` |
| A5 | No placeholder tokens anywhere in the text layer: `[PLACEHOLDER]`, `[QR CODE`, `TBD`, `lorem`, `pending copy`. KDP rejected World Myths for a `[QR CODE — Phase 6]` placeholder and for a placeholder author bio read as template text. | World Myths K-QR, bio rejection 2026-08-12 | `pdftotext` grep |
| A6 | ISBN line reads `PENDING — KDP-PROVIDED ISBN` or a real KDP-assigned ISBN; never an invented number. | all projects | `pdftotext` grep |
| A7 | Ink margins: nothing within 0.25 in of the trim without bleed (KDP minimum); inside margin per KDP's page-count table (0.75 in at 436 pp, 0.875 in at 763 pp — Bestiarium). | Games checklist, Bestiarium brief §8 | measured ink bounding boxes |
| A8 | Deliberate blank pages are counted and expected (two-page-spread books need each entry on a left page); a non-deliberate blank page is a defect. | Games checklist | blank-page list vs spec |
| A9 | Raster images ≥ 300 dpi at placed size for a **new** title; the Field Book's 150 dpi floor and the 83–116 PPI covers are recorded exceptions, not precedents. | Field Book, Hangul ART-002 | image dpi at placement |

## B. Cover PDF

| # | Rule | Origin | Check |
|---|---|---|---|
| B1 | **Safe area is measured from the OUTER edge of the wrap** (0.716 in required at 6 × 9), not from the trim (which gave 0.375 in — half). | Enigmatica ⛔③ | text-layer bounding boxes vs wrap edges |
| B2 | **Measurement and drawing read one layout record.** The first repair reported "measured, clean" while the PDF still overflowed because `plan()` measured a new band centre and the draw loop used the old panel centre. | Enigmatica ⛔④ | draw code takes the measured record; the check runs on the **final PDF's text layer** |
| B3 | **The hardcover cover reads the hardcover page count and paper.** Spine from the paperback count is wrong the moment the two builds differ. | Enigmatica ⛔⑤ | spine width = pages × per-page factor for that edition's paper |
| B4 | **Hardcover geometry is read from the KDP Cover Calculator, never derived** (Previewer rejected derived geometry; World Myths K39; Games: calculator screenshot 2026-08-21). | World Myths, Games | calculator values stored in `DESIGN/cover-calculator.json` with date |
| B5 | Paper stock of the wrap equals the paper stock of the listing (cream vs white changes the spine by 0.068 in at 274 pp — outside tolerance). | Enigmatica A15 | config check |
| B6 | Spine band / decorative elements fit the spine of **each** stock; white-paper variants of Bestiarium overflowed by 1.10 mm. | Bestiarium | per-stock wrap files |
| B7 | Spine text only at ≥ 79 pages; barcode corner empty; ≤ 40 MB; 300 DPI; single PDF. | KDP G201953020 | cover-check |
| B8 | No lettering baked into raster art; no QR on the cover; no fabricated diagram detail (Hangul ART-001). | K34, K44 | visual review at Gate 7 |

## C. EPUB / Kindle

| # | Rule | Origin |
|---|---|---|
| C1 | `epubcheck` zero errors; cover 1600 × 2560; file size watched — Enigmatica's 46 MB EPUB implies a ~$6.90 delivery fee at $0.15/MB on the 70 % plan → re-export with compressed plates. | Enigmatica, KDP plan |
| C2 | Fixed-layout only where the page *is* the content (workbooks, puzzles); reflowable otherwise. | Hangul K35, Enigmatica |

## D. Listing

| # | Rule | Origin |
|---|---|---|
| D1 | Subtitle integers equal measured counts (Bestiarium "120" vs 112 built). | Bestiarium |
| D2 | Real author bio present. | World Myths |
| D3 | Age range left empty for family reference volumes. | Games handbook §11 |
| D4 | Categories: three, recorded. Keywords: seven, no banned terms. | Games handbook |

## E. Process

| # | Rule |
|---|---|
| E1 | The Previewer is run by a human in KDP's UI; the agent never claims to have run it (`KDP_PREVIEWER_CHECKLIST.md` pattern: "what it is likely to say, what it must not say, which pages to stop on"). |
| E2 | A physical proof is ordered for the first use of any trim/template/paper combination and for any change to a cover template. |
| E3 | A KDP rejection is written to `CHANGELOG.md` with root causes and the check that now prevents it; `selftest.py` gains a fixture that reproduces the defect. |
