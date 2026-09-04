# Dudeney — the new cover, made KDP-ready

**Date:** 2026-09-04 · **Project:** `MY-DİGİTAL-BOOK/THE-PUZZLES-OF-HENRY-DUDENEY`

Two raster files were supplied on 2026-09-03. They are now the canonical production covers; the typographic covers they replace are archived. The artwork was not redesigned, restyled or re-lettered — it was placed into real KDP geometry, which it was not in.

---

## 1. Which file is which — determined from the files, not the filenames

| Supplied file | Measured | What it actually is |
|---|---|---|
| `new-cover.png` | 992 × 1586 px, portrait, **1 : 1.599** | a **front cover**. 1:1.6 is the Kindle/ebook front ratio. Dark green ground, gold type |
| `new-cover-paperback.png` | 1536 × 1024 px, landscape, 1.500 | a **full wrap** — back panel, spine, front panel. Its front panel is **cream with dark green type** |

Both arrived as 8-bit sRGB PNG with an alpha channel and no DPI metadata.

**Neither is a hardcover cover, and this book has no hardcover.** `project_config.json` records the format as `not_planned` with a recorded reason: a 144-page public-domain paperback at $14.99 does not support a $5.65-base hardcover without a proven audience (DECISIONS.md K6). No hardcover interior has ever been built either. Nothing was invented to fill that slot.

**One thing to notice, and it is the Founder's call:** the wrap's printed front is **cream**; the standalone front is **dark green**. A buyer sees the dark green one online and receives the cream one. Both are the Founder's own art, either could be intentional, and it is recorded rather than silently resolved.

## 2. Old covers, removed from the production path

Moved to `09_ARCHIVE/covers-superseded-2026-09-04/`, preserved, never deleted:

| Was | Now |
|---|---|
| `OUTPUT/cover-paperback.pdf` | `cover-paperback.typographic.pdf` — the 2026-09-02 typographic wrap |
| `OUTPUT/cover-front.jpg` | `cover-front.typographic.jpg` |
| `OUTPUT/new-cover-paperback.png` | `new-cover-paperback.as-supplied.png` |
| `OUTPUT/new-cover.png` | `new-cover.as-supplied.png` |

The supplied artwork is now versioned at `ASSETS/cover/paperback-wrap-v1.png` and `ASSETS/cover/front-v1.png`, the slot `COVER_STANDARDS.md` §3 defines. `OUTPUT/` holds built files only. The handbook lists all six as **do not upload**.

## 3. What the artwork needed, and why a resize would not have done it

The supplied wrap is a *picture of* a wrap:

| | Supplied | Required | |
|---|---|---|---|
| aspect | 1.500 | 1.3594 | — |
| painted spine | 123 px of 1536 = **8.0 %** | 0.3243 in of 12.5743 = **2.58 %** | **3.1× too wide** |
| resolution | 1536 × 1024 | 3772 × 2775 at 300 DPI | 16 % of the pixels |

Scaling the whole image to fit would have pushed the painted spine across the front panel's gutter and squashed the lettering — the defect the Hangul cover pipeline records as K40.

So `BUILD/build_cover_art.py` places the **three regions separately**, each into its own true zone, each at a single scale factor, with nothing stretched anywhere. The boundaries were measured off the file by a column scan — the spine's left gold rule at x = 730, the cream front panel at x = 852 — and written into the script so a re-run cannot drift.

**The spine is set in type, not cropped.** Fitting 123 px of painted spine into a 97 px real one would clip the letters, and `COVER_STANDARDS` §2.2 requires cover lettering to be typeset rather than taken from a raster. The spine carries the artwork's own ground colour and its own gold, both sampled from the file, with the line reproduced as the artwork prints it: *THE PUZZLES OF HENRY DUDENEY · VALICE CLASSICS · 2*, at 10 pt inside a 0.1993 in safe width.

### The defect the first build produced, and the fix

Placed edge-to-edge on the wrap, the artwork's decorative frame landed **0.110 in from the wrap edge on the left — outside the 0.125 in trim.** It would have been guillotined off.

The artwork depicts a *finished* cover: its edges are trim edges and it carries no bleed. So it is placed on the **trim**, and the printer's 0.125 in is made by replicating each panel's own edge pixels outward. The back panel additionally had to be *fitted* rather than covered — its aspect is 0.712 against a 6 × 9 page's 0.667, and covering it removed 0.203 in from each side, which cut the frame. Fitting puts a band of its own ground above and below instead, invisible on a dark textured panel.

**Measured on the finished file:**

| Edge | Frame sits at | Trim | |
|---|---|---|---|
| left | 0.3199 in | 0.125 in | inside ✓ |
| right | 0.2799 in | 0.125 in | inside ✓ |
| top | 0.2999 in | 0.125 in | inside ✓ |
| bottom | 0.2799 in | 0.125 in | inside ✓ |

## 4. The final files

| File | What | Measured |
|---|---|---|
| `OUTPUT/KDP/PAPERBACK/cover.pdf` | paperback full wrap | **12.5743 × 9.2500 in** (905.349 × 666 pt) · spine **0.3243 in** · bleed 0.125 in · 21,833,777 bytes · `ff67a224…` |
| `OUTPUT/KDP/EBOOK/cover-front.jpg` | ebook / Kindle / storefront front | **1600 × 2560 px** · 300 DPI metadata · RGB, alpha removed · quality 94, no chroma subsampling · 1,795,112 bytes · `95f2ba93…` |
| `public/images/books/the-puzzles-of-henry-dudeney.webp` | storefront cover | 1001 × 1600 · 180 KB · same recipe `ingest-covers.mjs` uses (height 1600, q82, strip) |
| **hardcover** | — | **not built.** No artwork supplied, no interior exists, format is `not_planned` |

Spine arithmetic: **144 pages × 0.002252 in (white) = 0.324288 in**, the page count read from the built interior with `pdfinfo` on the day, never from a constant. The record is `QA/cover-art.json`; `python3 BUILD/build_cover_art.py --check` re-verifies the hashes and re-reads the page count, and fails if the interior has moved underneath the cover.

## 5. Validation

| Check | Result |
|---|---|
| Wrap dimensions vs. the measured page count | 12.5743 × 9.2500 in — **exact** |
| Frame inside the trim, all four edges | **PASS** (0.28–0.32 in) |
| Spine text inside the spine safe zone | PASS — 10 pt in 0.1993 in usable |
| Barcode zone | back panel, lower right, left clear |
| No stretching | PASS — one scale factor per region |
| Transparency | removed; both outputs are RGB |
| PDF metadata | title and author set — never *untitled / anonymous* |
| File size | 21.8 MB, inside KDP's 40 MB cover limit |
| `build_cover_art.py --check` | PASS on all three (hashes + geometry) |
| Storefront asset manifest | `ok (60 assets)` |

### Two house-standard deviations, recorded rather than hidden

1. **Native resolution 113.8 PPI** where `COVER_STANDARDS` targets 300. This press has already accepted and written down 83 PPI (Hangul), 103–116 (Bestiarium) and 112 (Mythologica); this file is above all three. The number is in `QA/cover-art.json`, and a physical proof is recommended in the handbook because this is the first print of this artwork.
2. **`ingest-covers.mjs` refuses the front art** on two counts — 992 × 1586 against a 2400 × 3600 minimum, and 1:1.599 against an expected 1:1.5. Both refusals are correct and were left in place. The storefront webp was produced with that script's own documented recipe instead. The ratio finding is worth a note: the house front slot expects a 6 × 9 proportion, but this file — and the file it replaced — are the 1:1.6 Kindle proportion, so the check has never matched this book's actual convention. Not changed here; out of scope.

## 6. The handbook

`OUTPUT/KDP/KDP_UPLOAD_GUIDE.html` — Turkish, on the Codex Enigmatica pattern: sticky progress bar, per-step checkboxes saved in the browser, copy buttons on every field, and the five-row card the Enigmatica guide uses — *what I will do · where in KDP · what I enter · which file I choose · what I check · what success looks like*.

Dudeney-specific throughout: the real checksums, the real page count, the real spine, the actual metadata to paste, the price basis, a §03 that lists **six files that must not be uploaded** (including the two supplied rasters and the pre-companion interior), and a previewer checklist that names page 144 and page 4 by number.

It opens by saying that the only real blocker is not technical: **the AI declaration.** The Founder declared no AI use on 2026-09-02; the repository records 28.1 % of the words — the introduction, the part introductions, the 110 hints, the notes, glossary, chronology and concordance — as agent-drafted, which is *AI-generated* under Amazon's definition. Dudeney's own text, 71.9 %, is verbatim 1907 and 1917 and is not. The guide states both, plainly, and says an agent cannot make that declaration.

## 7. What is left for a person

1. **The AI declaration** (F1, open since Phase 4).
2. **The ISBN decision** — free KDP ISBN, or your own, in which case the copyright page is re-set first.
3. **A proof copy** — recommended, not required: first print of this artwork, at 113.8 PPI.
4. **Read the back cover in the previewer.** Its last line, *"Emre Doğan is a puzzle designer and archivist; this is the second Valice Classic"*, is your own cover copy — it has been in `build_cover.py` since 2026-09-02 — and it differs from the approved biography in `founder.authorBio`. It is your claim about yourself and it was left exactly as supplied. Flagged once so it is a decision rather than an accident.
5. **The upload itself**, then the ASIN.
