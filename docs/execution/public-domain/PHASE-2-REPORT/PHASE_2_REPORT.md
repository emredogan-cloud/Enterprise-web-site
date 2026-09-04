# PHASE 2 REPORT — The World's Games

**Branch: `feature/public-domain-phase-2` · NOT MERGED · started 4 September 2026**

> **Status: IN PROGRESS.** The shared scan/OCR pipeline is built and Book 1 is
> ingested, rights-verified and scoped. No Phase 2 book is complete. Nothing in this
> branch has been merged to `main` or deployed to production, and nothing will be
> without explicit Founder instruction.

---

## The five books

Taken from `PUBLIC_DOMAIN_MASTER_ROADMAP.md` without substitution.

| # | Book | Author | Pub. | Source | State |
|---|---|---|---|---|---|
| 1 | Games Ancient and Oriental, and How to Play Them | Edward Falkener | 1892 | IA `gamesancientorie00falkuoft` — **scan, OCR** | **OCR corrected, text extracted** |
| 2 | Korean Games | Stewart Culin | 1895 | IA `koreangameswith00culigoog` — **scan, OCR** | not started |
| 3 | Chess and Playing Cards | Stewart Culin | 1898 | IA `chessplayingcard00culi` — **scan, OCR** | not started |
| 4 | Mancala, the National Game of Africa | Stewart Culin | 1896 | PG 66220 — proof-read HTML | not started |
| 5 | The Traditional Games of England, Scotland, and Ireland | Alice Bertha Gomme | 1894/98 | PG 41727 / 41728 | not started |

---

## 1. The scan pipeline, built once

Phase 2's stated objective is to build the scan pipeline once and amortise it across
five titles. It is built, and it was written before the first book rather than five
times: `scripts/factory/ocr/djvu.py` and `scripts/factory/ocr/ocr_qa.py`.

**`djvu.py`** reads Internet Archive's `_djvu.xml` into pages, lines and words with
per-word confidence and coordinates. The XML rather than the flat `.txt`, because the
`.txt` loses the two things this house needs: the **page boundary**, so a quotation can
be cited to the scan page it came from, and the **confidence**, which is the only signal
for finding likely errors without reading 400 pages. It also reads the **printed folio**
off the leaf rather than counting images — the scan's Nth image is not the book's page N
— and returns `None` rather than guessing.

**`ocr_qa.py`** finds where the OCR is likely wrong and says on which page.

### Two things learned by measuring rather than assuming

**1. `x-confidence` is not a percentage.** On this derive it runs **0–30** with the mass
at 28–30. A fixed "below 40" threshold flagged **100%** of the words and said nothing.
The ceiling is now read from the file and the tail taken relative to it.

**2. Confidence alone is close to useless here.** The uncertain tail is mostly *Pachisi*,
*Seega* and *Ludus* — real words no OCR dictionary carries — while the actual errors sit
at **full confidence**, because the engine is certain it read a K. So the load-bearing
test is different: a token that is not a word, and becomes one by undoing a single
character confusion this typeface is known to produce, is almost certainly that error —
and unlike a confidence score, it names the fix.

The first version of that test proposed `Tau → TaN`, `der → deB` and `Fac → FaG`: a
capital dropped into the middle of a lower-case word, scoring because the substitution
table was case-blind. Suggestions must now preserve the case shape of the word they
repair, and Roman numerals and two-letter tokens are excluded. The tool proposes; it
does not rewrite.

---

## 2. Book 1 — Falkener, *Games Ancient and Oriental* (1892)

### Rights — verified at ingestion

Edward Falkener **1814–1896**. US public domain (published 1892, before the 1931 line);
EU/UK/TR life+70 expired **1 January 1967**. No translation layer — he wrote in English.

**The figures are a known problem and are not cleared.** The 1892 game boards and
diagrams are unattributed engravings, which is exactly the position that made Werner's
plates unusable. Original Valice diagrams will be required. Recorded as an open decision.

### Source — retained and digested

`_djvu.txt`, `_djvu.xml`, the IA metadata and the page-image PDF are held in
`SOURCE/raw/` with SHA-256 digests in `QA/source-digests.json`. Nothing is parsed from a
file whose digest is not on record.

### OCR quality — measured

| | |
|---|---|
| Pages | 408 |
| Words | 78,857 |
| Confidence scale | 0–30, read from the file |
| Uncertain tail | 5.3% |
| Alphabetic tokens | 55,727 |
| Not in the word list | 2,704 (4.9%) — mostly proper nouns and game names |
| **One confusion from a real word** | **170 (0.31%)** — the likely errors |
| Printed folios legible | 145 of 408 pages |

The systematic fault is **E→R, K→R and li→h**: *Eajah→Rajah* ×21, *Eoman→Roman*,
*Eomans*, *Eajahs*, *Eed*, *Eoyal*, *CAVALIEE→CAVALIER*, *Koman/Kajah→Roman/Rajah*,
*Tlie→The*, *Wliite→White*. **No correction has been applied**; the list is
page-referenced in `QA/ocr-report.json`.

### Scope — decided against the floor, before writing

Measured first, as Phase 1 taught the hard way.

| Candidate | Words | Apparatus needed at 22% | |
|---|---:|---:|---|
| **The ancient games — Egyptian + Roman (scan 7–108)** | **21,930** | **~6,200** | **chosen** |
| Everything except Magic Squares | 61,768 | ~17,400 | too big |
| The whole book | 78,972 | ~22,300 | too big |

The Greek and oriental chess material (39,838 words) and Magic Squares (17,204) become
later volumes.

---

## 2a. Book 1 — OCR corrected and text extracted

### The scope boundary turned out to be the book's own

The first estimate treated the selection as two blocks, "Egyptian + Roman". Reading the
section markers off the scan showed something better: the book divides itself into
numbered sections, and **sections I–VI end at scan 108**, with section VII opening the
Greek *Hiera Gramme* at scan 109. The chosen scope lands exactly on that seam.

| | Section | Scan | Words |
|---|---|---|---|
| I | Introduction | 11–18 | 1,796 |
| II | The Games of the Ancient Egyptians | 19–31 | 3,231 |
| III | Ancient Royal Egyptian Relics at the Manchester Exhibition | 32–50 | 3,873 |
| IV | The Game of Tau, or the Game of Robbers | 51–80 | 6,208 |
| V | The Game of Senat | 81–100 | 3,856 |
| VI | Hab em Han, the Game of the Bowl | 101–108 | 1,681 |
| | **Total** | | **20,645** |

**The Roman game is not a bolted-on second block.** Falkener's argument in section IV is
that the Roman *ludus latrunculorum* **is** the Egyptian game of Tau, which is why the
running head over those thirty pages alternates between the two names. Splitting them
would cut his case in half.

Section VI's heading is a line of hieroglyphs the OCR read as `i n a o / vt\ o`; the
title was read off the page image — **HAB EM HAN**, the Game of the Bowl. The book sets
hieroglyphs as headings throughout, which no OCR can recover and which will need original
redrawing alongside the boards.

### Corrections — verified on the page, never from the dictionary alone

81 candidates fell inside the scope, 32 distinct. **Twelve were corrected. Twenty were
not.** Every one of the twelve was cropped out of the scan at 400 dpi around the OCR's
own coordinates and read before being changed:

`Eoman→Roman` · `Eomans→Romans` · `Koman→Roman` · `Eobbers→Robbers` · `Eitual→Ritual` ·
`Eoyal→Royal` · `EOYAL→ROYAL` · `EELICS→RELICS` · `Eed→Red` · `Eome→Rome` ·
`Kelative→Relative` · `Tlie→The`

**The most frequent candidate was rejected.** `Tau → Tan` was proposed 37 times. The page
image (scan 51) reads **TAU** — the Egyptian game the chapter is about. Applying that
substitution blindly would have corrupted the book's central game name thirty-seven
times, and it is the clearest possible argument for the rule that a token is only
corrected once the printed page has been looked at.

The other nineteen rejections are Latin, French and proper nouns the English word list
does not carry. Their OCR readings stand unchanged, with the reason recorded per token
in `CONTENT/corrections.json`.

22 corrections were applied across the extracted text; **zero R-confusions remain**.

### Provenance kept

Every paragraph carries the scan page it came from and the folio printed on that leaf.
Running heads are stripped — they are the worst-OCR'd lines in the book
(`LDDUS LATRUNCULORDM`, `THE GAME OF TIIK BOWL`) and are page furniture, not text.
Compositor's hyphens across line breaks are rejoined. The source XML's SHA-256 and the
Archive URL are in `QA/parse-report.json`.

**A new reusable tool:** `scripts/factory/ocr/crop.py` puts a suspect token in front of a
human, cropped from its own page at the OCR's coordinates. It is what made per-token
verification practical, and Books 2 and 3 will use it.

### Still to do on Book 1

Apparatus (~5,800 words at the 22% floor), original diagrams for the boards and
hieroglyphs, manuscript, EPUB, cover, companion, catalogue, Paddle, R2, KDP package and
handbook, adversarial review, final QA.

---

## 3. What is not done

Book 1's apparatus has not been written and nothing has been typeset. Books 2–5 have not been started. No Phase 2 product exists on the website and
none will be published from this branch.

---

## 4. Branch discipline

Created from `origin/main` at `2b16865`, 0 ahead / 0 behind at creation. Every Phase 2
commit lands here only. `main` has not been merged into, fast-forwarded, reset or
force-pushed, and will not be without explicit Founder instruction.
