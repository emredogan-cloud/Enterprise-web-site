# Roadmap book 05 — Epictetus: The Discourses and Enchiridion

**Date:** 2026-09-06 · **Branch:** `feature/book-05-production`, **not merged**
· **Project:** `MY-DİGİTAL-BOOK/ROADMAP-BOOKS/05-EPICTETUS-DISCOURSES-AND-ENCHIRIDION`
· **Series:** Valice Classics #3 · **State:** advanced, **not complete**

---

## 1 · Which book this is, and why

The Master Roadmap, §5.1: **"Kitap 05 · Epictetus: The Enchiridion and Selected
Discourses (Annotated)"** — Valice Classics #3, BISAC PHI011000, George Long's
translation, an apparatus, and a Stoic Library bundle as its commercial reason.
No substitution and no guess: the roadmap names it.

**It was already half-shipped.** Phase 1 built its ebook and put it on sale, and
the ebook is good. But the book was never finished:

| | |
|---|---|
| `SPEC.md` | read **NOT STARTED** in every section |
| Gates | **8 of 12** `not_started` |
| `project_config.json` formats | **every one** `not_planned` — no price basis, no ISBN, no KDP state |
| Print editions | catalogue promised a paperback as *coming soon*; nothing was uploadable |
| Bundle | the roadmap's whole reason for the book — **absent** |

So roadmap book 05 is not a book to write. It is a book to **finish**.

## 2 · Where it now lives

Moved to `ROADMAP-BOOKS/05-EPICTETUS-DISCOURSES-AND-ENCHIRIDION`, beside books
01–04, which is where the brief puts book 05. A **symlink** is left at the old
Phase 1 path so another session's absolute paths keep resolving, and the three
tools that referenced the old prefix are repointed. Nothing was deleted; the
Phase 1 report's account of Phase 1 stays true.

## 3 · What was verified, by measurement

| Check | Result |
|---|---|
| Interior | preflight **ok** · **176 pp** · 6.000 × 9.000 in |
| EPUB | EPUBCheck **0 fatals / 0 errors / 0 warnings** |
| Printed QR, page 176 | rasterised at 300 dpi and decoded by OpenCV: exactly `https://valicepress.com/companion/epictetus` |
| Companion | **live** — the page and all four assets return 200 |
| Companion leaf | `kdp-linkage-lint`: **COMPLETE** · dedicated page · QR 24 % of page · 1.696 mm/module · no invented biography |
| Apparatus share | **20.09 %** against the house 20 % floor — passes, by 0.09 of a point |
| Enchiridion | **52 of 52** chapters — the back cover says "complete" and it is |
| Discourses | **68**, all assigned across the **7** thematic parts (6·10·9·7·12·13·11) |
| Head-notes | **120** — one for every chapter, 68 + 52 |
| Glossary | **18** entries, every one carrying Long's own rendering |
| Concordance | the introduction's *"four places … and the two places"* is exact: 4 in-selection, 2 cited-but-absent, plus one contextual row the concordance page frames separately |
| House lints | claim · rights · metadata · compliance — all **ok** |

## 4 · What the review found, and what was fixed

**Both wraps failed preflight.** Another session built cover v2 from Founder
artwork this morning with good method — Real-ESRGAN, geometry read from KDP's
Cover Calculator rather than derived, effective ppi computed from real pixels
rather than metadata. They nonetheless failed on the two faults this house has
each been rejected for once:

- `Helvetica` **declared and not embedded** — Codex Enigmatica's real KDP rejection;
- PDF metadata **`untitled` / `anonymous`** — what the Myth Hunter's Field Book shipped.

Same cause: a PDF written around an image with nobody setting the document up.
ReportLab writes a default `/F1 Helvetica` into page resources whether or not
any text is drawn, and there is **no type on these pages at all** — the whole
wrap is one 3794 × 2775 JPEG.

`BUILD/wrap_pdf.py` re-emits each wrap with the real title and author and with
the font resource removed outright. The artwork is extracted and copied through
without re-encoding: **the embedded JPEG is sha256-identical before and after**.
Both wraps now preflight **ok**.

### Cleared as false alarms

Four findings were chased and did not survive: the part assignment (all 68 are
placed — my check read the wrong key), the concordance count (4 + 2 is exact),
the sub-8 pt type (all 26 runs are on the companion leaf, none in body copy),
and the apparatus floor — my own word count said 19.4 % and was wrong, because
the project's `measure.py` correctly treats Long's biographical note as **source**
and includes the concordance and subject index. It is 20.09 %.

### Still open

1. **The cover title does not match the listed title.** The artwork reads
   **"THE DISCOURSES and the ENCHIRIDION"**; the interior title page, the EPUB's
   `dc:title` and the catalogue all say **"The Discourses and Enchiridion"** —
   no definite article. Amazon expects the cover to match the listing. One of
   the two must move, and the artwork is a raster.
2. **The barcode zone is not clear.** KDP overprints a 2.0 × 1.2 in box at the
   lower right of the back cover; the comp's *VALICE CLASSICS · 3 / VALICE PRESS*
   imprint line runs into it, so the imprint's right end will be cut. The
   previous session measured this and recorded that three repairs were built and
   **all three damaged the artwork more than the barcode does**. The fix belongs
   in the composition, not in a patch.

## 5 · Formats, decided against measured economics

| Format | State | List | Basis |
|---|---|---|---|
| Direct ebook | **live** | **$9.99** | what every Valice Classics volume 1–7 charges; on Paddle since Phase 1 |
| Paperback | **ready to upload** | **$16.99** | 176 pp measured · printing **$3.11** · nets **$7.08 (41.7 %)** · floor first cleared at $12.99 |
| Hardcover | **NOT JUSTIFIED** | — | printing $7.76; 35 % floor not cleared until **$31.99** — 1.9× its own paperback, in a twelve-volume series where **no volume has a hardcover** |
| Large print | **NOT JUSTIFIED** | — | body is **10.5 pt**; at KDP's 16 pt convention 176 pp goes past 400 |
| Kindle | deferred | — | Select is exclusivity and would kill the live direct ebook |

The hardcover wrap is built, preflight clean and **kept**, so that decision is
reversible without rebuilding.

## 6 · What is left

1. **The two cover findings above.** Both are in the supplied artwork.
2. **The Stoic Library bundle** — Meditations + Epictetus at $14.99. The
   roadmap gives it as this book's commercial reason; the catalogue has no
   bundle mechanism at all, so this is a storefront feature, not a book task.
3. **Catalogue**: move the paperback from `coming_soon` to available once it is
   uploaded, and record the ASIN.
4. **KDP upload** of the paperback — account-holder action.
   `KDP_UPLOAD_HANDBOOK.html` is written, with every field, both file hashes,
   the measured geometry, the barcode caveat stated plainly, and the files
   **not** to upload.
5. **A second adversarial pass** once 1 and 2 are closed.

**This book is not finished, and this report does not say it is.**
