# BOOK REPORT — Mancala

**Stewart Culin, 1894 · Valice Classics 11 · slug `mancala`**
**State: QA. Held on three Founder signatures and one blocked live write (F-026).**

Built on branch `feature/public-domain-phase-2`. Not merged, not deployed.

---

## What this edition is

Culin's whole paper — the first serious study of mancala in English — with an apparatus
longer than the paper. It is the shortest book this press has published and the only one
of the phase built from a human transcription rather than a scan. **It is published as an
ebook only, and that is a decision rather than an omission.**

| | |
|---|---|
| Source | Project Gutenberg 66220 — a transcription proof-read by volunteers. **No scan, no OCR.** |
| Scope | the paper entire: 30 paragraphs, 6 footnotes, all 22 figure captions |
| Source words | 4,885 |
| Editorial words | 5,916 — **54.8%** against a 20% floor |
| Pages | 38 (6 × 9 in PDF; no print edition) |
| EPUB | 681,466 bytes · EPUBCheck **0 errors, 0 warnings** |
| Original diagrams | 3 — two EVIDENCE, one RECONSTRUCTION |
| Companion sheets | 4, at `valicepress.com/companion/mancala` |
| Claims | 17, every one VERIFIED against an external source |
| Price | ebook **$4.99** · no paperback |

---

## Why there is no paperback

The volume is 38 pages. A printed block needs an even count, so with the
companion leaf it would run to 40, giving a spine of 0.090 in. KDP allows
spine text only from 79 pages, and a perfect-bound book that thin is a bad object whatever
is printed inside it — it invites exactly the review it would deserve.

A print-ready interior and a cover wrap are both built, so the arithmetic exists if the
decision is ever revisited, and both are marked **not for use**: `QA/interior-main.json`
carries `printEdition: false`, `QA/cover.json` carries `wrapBuiltButNotForUse: true`, and
nothing is registered in `scripts/factory/print-interiors.mjs`. The consequence is that
the ebook is the only edition, so **the ebook carries the companion address** — a page
called *The Sheets That Go With This Book*, where the other three volumes of the phase use
a leaf bound in under a QR code.

---

## What is different about building from a transcription

The three books before this one exist to repair what a scanner does: three-stream type
separation to tell a footnote from the sentence it interrupts, debris detection to find
the lone letters that are the signature of illustration OCR, a physical constraint to
validate a page number. **None of that is used here and none of it is needed.** The whole
parse is: strip what the transcribers added, keep what Culin wrote.

Three consequences, all of them recorded in the book itself:

1. **There is not one repair to declare.** The other volumes carry a repairs file with a
   fault class and an external check per repair. This one has none, because there was
   nothing to repair.
2. **This edition cannot cite the pages of the original.** The transcribers did not record
   where the pages of the 1896 printing fell, and there is no honest way to reconstruct
   it. The machinery to print a source folio at the head of each leaf was written here
   before that was checked, drew nothing on every page of every pass, and has been taken
   out; *A Note on the Text* says so to the reader.
3. **The dead scan machinery went with it** — a script-marker filter that could never
   fire, and six helper functions carried over from the third book (a chess-game table
   among them) that nothing called.

---

## What the adversarial review found

Every one of these was found after the book was first called finished.

| # | Finding | Fix |
|---|---|---|
| 1 | **A fabricated quotation.** The introduction quoted Culin's closing prediction as ending "…when this account may acquire a practical value". He wrote "…when this account may answer some inquiries that may be made as to its history." The first half was his; the second was invented, and it sounded exactly like the sentence it replaced. | Printed as he wrote it. `BUILD/check_quotes.py` now holds all 24 quoted passages in the apparatus **and in the build scripts** against the source on every build. |
| 2 | **The Chuba board was not the Chuba board.** Four rows of six, opening one and two — which comes to 66 counters in a game sold with 60. Culin gives 11 pockets a row and an opening with an exception in it: the pocket at each player's own extreme left is vacant and the next holds one, which is 30 a side. | Redrawn at 11, with the exception, in the diagram *and* on the printable companion sheet. The build asserts the total is 60 and that each player's own-left pocket opens vacant. |
| 3 | **The rational game was described wrongly and then apologised for.** The guide said Culin left the opening count unstated and suggested one. He states it — "it is customary in Syria to put seven pieces in each hole", which is exactly the 98 counters — and the thing that makes it a game of skill is not the layout but that a player "may select any hole on their side of the board as a starting place". | Rewritten from the source. The register now points at the gap between the informant's classification and the rules underneath it. |
| 4 | **A wrong century and a wrong country.** "Boards at Aksumite sites in Ethiopia from the eighth century" — the finds are dated sixth-to-seventh century, and one of the two sites, Matara, is in Eritrea. | Corrected and evidenced. A companion sheet that had computed "at least eighteen centuries" from the earliest edge of the Gedera range now names the evidence instead. |
| 5 | **A count dressed up as an authority.** "The standard reference count is more than eight hundred names… in ninety-nine countries" — the encyclopaedia carries the 800/200 figures without a citation, and the country figure comes from a specialist census. | The sentence now says which number comes from where. |
| 6 | **Every section opened under the wrong running head.** ReportLab hands `afterFlowable` an `LCActionFlowable` at each page transition, before the page's first real content, so the control object was claiming the first-content slot: "Index of Subjects" stood over *A Note on the Text*, and *A Note on the Text* over the sheets page. | Only flowables that actually draw are counted. **This bug is in the shared machinery and affects the other three books of the phase.** |
| 7 | **The book never said where its companion sheets were.** The text referred to them three times; `QA/companion.json` claimed "the page inside the book lists exactly these four"; no such page existed. | The page exists, in both formats, and reads its list from that file. |
| 8 | **Arithmetic a reader would do and we had not.** Five plates and fifteen text figures is twenty, and the edition prints twenty-two captions. Both are right — Plates 2 and 4 carry two figures each — and the reconciliation was nowhere. | Printed in the imprint, the source note, RIGHTS.md and the product page. |
| 9 | Smaller: `&nbsp;` printed literally in the playing guide (the `rl()` escaping trap, sprung a fourth time); "Project Gutenberg ebook 66,220" — a thousands separator inside an identifier; "3 original diagrams" beside "three complete games"; a chronology that ran 1894 → 1896 → 1895; the secondary name *la'b akila* used where the primary *la'b hakimi* belonged. | All fixed; the identifier and the spelled-out number are now handled in `counts.py` so neither can recur. |

---

## Rights

Two independent grounds for the text: Culin died in 1929, and the 1896 United States
imprint settles the United States on its own. He directed the University of Pennsylvania's
museum and was **not** a federal employee, so the government-works rule is not relied on
even though the Government Printing Office printed the volume.

**RED on the images.** Five plates and fifteen text figures, 22 captioned pictures, and
not one names a photographer or a draughtsman; two are explicitly redrawings of Lane and
of Hyde, and one plate is "From an old print" that Culin does not identify. With no
identified creator there is no death year, so life-plus-seventy cannot be applied. None is
reproduced. All 22 captions are printed where the figures stood, because a caption is
Culin's text and says what is missing.

The transcription is a faithful copy of a public-domain text and attracts no new
copyright. Project Gutenberg's **trademark** is the thing its licence conditions, and the
condition is met by not using it: the header, footer, licence and transcriber's notes are
stripped at parse time, the mark appears nowhere, and the source is named in prose in *A
Note on the Text*, with the SHA-256 of the file actually read in `QA/source-digests.json`.

---

## What is registered where

| | |
|---|---|
| Catalogue | `scripts/catalog/valice-catalog.mjs` — `websiteStatus: "draft"`, ebook `coming_soon`, `directSaleBlockedBy: "paddle-not-provisioned"` |
| Paddle | `scripts/catalog/paddle-products.mjs` at $4.99 — **not provisioned**, F-026 |
| Masters | R2 `books/mancala/master/v1/master.pdf` and `master.epub` |
| Digital edition | `scripts/catalog/digital-edition-sources.mjs` — the interior **is** the ebook's PDF, not a print master |
| Preview | `scripts/catalog/preview-pages.mjs` — **one page**, p19; the 5% cap on a 38-page book is a single leaf |
| Companion | `src/lib/companions.ts`, `src/lib/newsletter-client.ts`, `src/app/api/newsletter/route.ts` |
| Print | **nothing.** No entry in `print-interiors.mjs`, `edition-geometry.mjs` or `companion-page-spec.mjs`, because there is no print edition. |

---

## Gates

| Gate | Status | Note |
|---|---|---|
| 2 Rights | prepared, **awaiting signature** | `RIGHTS.md`, `CLAIMS.jsonl`; GREEN text, RED images |
| 4 Content | **passed** | 54.8% editorial against a 20% floor |
| 5 Facts | prepared, **awaiting signature** | 17 claims, all VERIFIED; three corrected by the verification |
| 9 Metadata | **passed** | metadata-lint clean; title carries (Annotated) |
| 10 Compliance | prepared, **awaiting signature** | text generated / images none / translation none |

---

## The one number that matters

**54.8% of this volume is original editorial matter**, measured from the
manuscript by `BUILD/measure.py` at build time and printed into the book from the
measurement. The apparatus is longer than Culin's paper. That inversion is unusual for
this series and is stated in *A Note on the Text* and on the product page rather than
discovered on the page.
