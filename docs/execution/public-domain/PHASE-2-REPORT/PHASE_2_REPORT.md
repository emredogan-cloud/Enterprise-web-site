# PHASE 2 REPORT — The World's Games

**Branch: `feature/public-domain-phase-2` · NOT MERGED · 4–6 September 2026**

> **PHASE 2 COMPLETE.** All five books are built end to end, each has been through an
> adversarial review of its own, and the phase has been through a final review across all
> five together. Nothing has been merged to `main`, nothing has been deployed, and no
> product of this phase is on sale. Each book is held on Founder signatures and one blocked
> live write; the paperbacks are held on a KDP upload that only the Founder can make.

---

## The five books

| # | Book | Author, date | Source | Pages | Editorial | Claims | Price |
|---|---|---|---|---|---|---|---|
| 1 | *Games Ancient and Oriental* | Edward Falkener, 1892 | IA scan, OCR | 78 | **28.0%** | 18 | $7.99 · $12.99 |
| 2 | *Korean Games* | Stewart Culin, 1895 | IA scan, OCR | 144 | **23.0%** | 12 | $8.99 · $16.99 |
| 3 | *Chess and Playing Cards* | Stewart Culin, 1898 | IA scan, OCR | 120 | **21.5%** | 12 | $7.99 · $14.99 |
| 4 | *Mancala* | Stewart Culin, 1894 | PG 66220, a transcription | 38 | **54.8%** | 17 | $4.99 · ebook only |
| 5 | *The Singing Games* | Alice Gomme, 1894 | PG 41727, a transcription | 244 | **20.3%** | 15 | $9.99 · $16.99 |

**624 printed pages. 146,333 words of source text and 47,184 words of editorial matter.
74 claims, every one verified against an external source. Five EPUBs at 0 errors and 0
warnings. And 78 engraved tunes.**

Every percentage above is measured from the manuscript by the book's own `measure.py` at
build time. The floor is 20% and the tightest margin in the phase is book 5's 20.3%.

---

## What the phase was for, and what it produced

Phase 2's stated objective was to build the scan pipeline **once** and amortise it across
five titles. That happened, and then something better happened: the phase produced three
instruments that did not exist before, each of which was built because a specific defect got
into a finished book.

| Instrument | Built for | Exists because |
|---|---|---|
| `scripts/factory/ocr/djvu.py` + `ocr/streams.py` | books 1–3 | an OCR layer is not a manuscript: footnotes, captions and body have to be told apart by type size, and illustration debris has to be found and marked |
| `COMMON-AREA/music/` — `midi.py`, `notation.py`, `engrave.py`, `rlcairo.py` | book 5 | a printed stave is a picture, and this press does not reprint pictures it cannot improve on. 78 tunes, 836 bars, drawn from pitch and duration |
| `COMMON-AREA/checks/check_quotes.py` | book 4, then all five | a fabricated quotation survived three readings of a finished book |

`COMMON-AREA/` now holds all three, with `CONVENTIONS.md` — one page of rules, each one a
defect that reached a finished book.

---

## The books, in one paragraph each

**1. Games Ancient and Oriental** (Falkener, 1892). The Egyptian half of a Victorian
gentleman's attempt to reconstruct games nobody had played for three thousand years. Its
instrument is a Register of Reconstructions, which separates the boards Falkener saw in
museums from the rules he invented for them — the distinction his own book never makes.
Five original diagrams; 20,003 source words; 28.0% editorial, the highest of the scan-built
three.

**2. Korean Games** (Culin, 1895). Twenty-eight games of chance and divination, collected in
America from Korean informants Culin names. Its instruments are a Register of Record and
Inference and a note on the spellings that gets a reader from Culin's *tjyang-keui* to the
*janggi* the rest of the world writes. It also carries the phase's hardest single piece of
reconstruction: a thirty-move illustrative chess game rebuilt from the word coordinates of
the scan, because the printed table had been shredded by the OCR.

**3. Chess and Playing Cards** (Culin, 1898). A museum catalogue that is a thesis: that
chess and playing-cards both descend from the divinatory use of the arrow. Murray
disbelieved it and the field has left it alone since. The edition's instrument is a Register
of Object and Argument, because **this is a book whose evidence outlived its argument** —
sixty-two gambling sticks in a leather pouch stay true whatever one thinks about arrows.

**4. Mancala** (Culin, 1894). The shortest book this press has made and the only one of the
five not built from a scan. Thirteen printed pages of the first serious study of mancala in
English, with an apparatus longer than the text — and **ebook only**, because a 40-page
perfect-bound paperback is a bad object whatever is printed in it.

**5. The Singing Games** (Gomme, 1894). The largest book this press has made: 43 singing
games, 209 versions of the rhymes each with its county and its collector, and **78 tunes
engraved for this edition from the notes**. Gomme's contribution was never the rhymes —
Halliwell had printed rhymes for fifty years — it was that she wrote down the tunes as the
children sang them.

---

## What the reviews found

Each book was reviewed on the instruction *prove this book is not ready*, and then the phase
was reviewed across all five. The findings that matter are of four kinds.

### 1. A fabricated quotation

Book 4's introduction quoted Culin's closing prediction as ending "…when this account may
acquire a practical value." **He wrote no such thing.** The first half was his; the second
was invented, and it survived three readings because it sounds like the sentence it replaced
and finishes the thought a reader expects.

`check_quotes.py` was built for that finding and then run against the other four books. It
found three more: two invented examples of the kind of cross-reference Culin writes, an
honorific dropped from inside a quotation, and a measurement silently modernised inside
quotation marks. It also found a repair that was *right* and unrecorded — "Chargé" where
the scan reads "Cftarge" — which is now in the book's corrections ledger, and the checker
applies that ledger to the corpus, so **a repaired quotation passes only if the repair is
written down**.

### 2. Silent losses in the parse

Book 5's parser dropped **28,752 of Gomme's 51,383 words** and reported success. Two rules
did it: a non-greedy regex for a `<div>` that stops at the first closing tag, which is the
end of the *first stanza*; and a page-marker rule that swallowed any paragraph containing a
page marker, which the transcribers put in the middle of sentences. Coverage went from 44%
to 97%, and the missing 3% is the transcribers' own apparatus.

The lesson generalises: **a parse must be measured against its source, not trusted.** Every
book of this phase now reports its capture rate.

### 3. Machinery that promised what it never delivered

Book 4 carried a complete apparatus for printing the source's page numbers at the head of
each leaf — which drew nothing on every page of every pass, because the transcription does
not record where the pages fell. It had also inherited six helper functions from book 3 that
nothing called, including a chess-table renderer in a book with no chess in it. All of it is
gone, and *A Note on the Text* now tells the reader plainly that this edition cannot cite
the pages of its original, which is a real difference from the other four.

### 4. Defects the five books shared

Found only by looking at all five at once:

- **`&nbsp;` printed literally** in three books, in every game of two playing guides. The
  `rl()` helper escapes markup, so an entity passed through it comes out as text.
- **Every section opened under the wrong running head** in books 2, 3 and 4. ReportLab hands
  `afterFlowable` an `LCActionFlowable` at each page transition, before the page's first real
  content, so the control object claimed the first-content slot on every leaf that opens a
  section.
- **An unembedded Helvetica** in book 5's interior, from a table cell's default font. KDP
  rejects a PDF that carries one even where nothing visible uses it.
- **Two QA records describing files that no longer existed** — 143 pages against the 144 the
  PDF had — because a rebuild had not been followed by a re-seal, and the cover's spine
  arithmetic reads that record.

---

## Rights, book by book

| Book | Text | Illustrations | Position |
|---|---|---|---|
| 1 | Falkener d. 1896; 1892 imprint | **RED** — unattributed plates, not reproduced | green text, red images |
| 2 | Culin d. 1929; 1895 imprint | **RED** — Ki San (Kim Chun-gŭn), no death year recorded | green text, red images |
| 3 | Culin d. 1929; 1898 imprint | **RED** — several plates are Culin's own reuse of the *Korean Games* artwork | green text, red images |
| 4 | Culin d. 1929; 1896 imprint | **RED** — 22 captioned pictures, no photographer and no draughtsman named | green text, red images |
| 5 | Gomme d. 1938; 1894 imprint | **GREEN** — J. P. Emslie d. 1913, and still not reproduced | green throughout |

Four of the five reproduce no illustration because nobody is named in them. The fifth names
its artist, who is out of copyright — and it still draws its own, which is a decision about
scope and is stated as one in the book.

**The tunes of book 5 are the one novel rights question of the phase**, and the answer is
that nothing of the transcribers' work is in the product: their MIDI files are read for
pitch and duration, and every stave is drawn by a program in this repository.

---

## What is registered, and what is held

Every book is registered in the catalogue, the Paddle product table, the digital-edition
sources, the preview pages, the companion registry and the newsletter sources; four of the
five are registered in the print pipeline with their companion leaf spliced and their
interior sealed. Masters for all five are in R2. **Nothing is on sale.**

| Held on | Books | Founder action |
|---|---|---|
| Paddle product creation (a live write this environment blocks) | all five | F-019, F-022, F-024, F-026, F-027 — one command covers all of them |
| Gate 2 (Rights) signature | all five | the evidence is prepared in each `RIGHTS.md` |
| Gate 5 (Facts) signature | all five | 74 claims, all verified |
| Gate 10 (KDP compliance) signature | 4 and 5 | the sheets are clean |
| KDP upload | 1, 2, 3, 5 | handbooks written; `kdp: "not_created"` and no ASIN invented |

`node scripts/factory/status.mjs` shows all five at **QA, 2/12 gates passed, blocked on
gate 2**.

---

## What this phase did not do

- **It did not merge.** `main` has not been merged into, fast-forwarded, reset or
  force-pushed, and will not be without explicit Founder instruction.
- **It did not deploy.** The 33 errors `validate-catalog` reports are all companion routes
  and assets returning 404 in production, which is what a companion page that has never been
  deployed does. They resolve on the first deploy and not before.
- **It did not invent an identifier.** No ASIN, no Paddle price id, no rating, no review.
- **It did not generate an image.** Every cover, diagram and stave in these five books is
  drawn by a program in this repository. Total image-model spend for Phase 2: **$0.00**.
- **It did not reproduce an illustration** from any of the five source volumes.

---

## Volume II, and what a sixth book would start from

Three of the five books have an explicit second volume already scoped, which is the most
useful thing this phase leaves behind after the instruments:

- **Falkener**, the non-Egyptian half — the Oriental games he reconstructs.
- **Chess and Playing Cards**, entries 1 to 44: the dice, boards and race games, 68,849
  words, which carry the collection but not the thesis.
- **The Singing Games**, volume two: 23 more singing games and 59 more tunes, plus Gomme's
  memoir on the study of children's games. And the four hundred *descriptive* games of
  volume one — hopscotch, marbles, fivestones, tag — which are a different book again.

A sixth book starts by copying `COMMON-AREA/` and reading `CONVENTIONS.md`, which is one
page and every line of it was paid for.

---

## Branch discipline

Created from `origin/main` at `2b16865`, 0 ahead / 0 behind at creation. Every Phase 2
commit lands on `feature/public-domain-phase-2` only. `main` has not been touched.

**PHASE 2 COMPLETE — WAITING FOR FOUNDER MERGE APPROVAL.**

---

## Appendix: a book that is on this branch but is not a Phase 2 book

**Codex Mythologica: The Puzzle Book** was built end to end on 2026-09-05 and its work lands
on this branch, but it is **not** one of the five public-domain titles this phase is about.
It is roadmap book 4 — an original work built out of two Codex volumes this press already
owns — and it does not count towards Phase 2's five. Its report is at
`docs/execution/public-domain/PHASE-2-REPORT/04-CODEX-MYTHOLOGICA/BOOK_REPORT.md` because the
2026-09-05 instruction named that path; the book itself lives under `ROADMAP-BOOKS/`.

It is here because a branch is a place to put work, not a claim about what the work is.

---

# Appendix: the working record

*What follows was written during the phase, book by book, as each problem was met. It is
kept unedited below the summary because it is the only account of HOW the pipeline was
built and what it cost: the summary above says what the five books are, and this says
what it took. Where it disagrees with the summary about a count, the summary is later
and is measured from the finished books.*

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

## 2b. Book 1 — apparatus and diagrams

**Apparatus: 5,814 words, 22.0% of the volume.** Sized against the floor before writing,
and built around the one thing this book needs explaining.

### What the book actually is

Falkener's complaint, in his own words, is the best sentence in it: two centuries of
antiquaries had collected every classical passage about ancient games, and *"the bones of
the entire skeleton have been put together, but there they remained; the game was not
played, and it could only be regarded as an interesting fragment of antiquity — curious,
but incomplete, and useless."*

So he supplied the rules. **The ancient sources do not contain them.** His rules are
reconstructions — inferred from board geometry, piece counts, a few Latin verses and
living games he thought were descendants — and the book prints them in the imperative,
with worked sample games in full move notation, and no mark showing where the evidence
stopped and the architect began.

**The Register of Reconstructions** puts that mark in. For each of the three games it
separates what the evidence shows, what Falkener supplies, and what is known now — which
in every case includes that the rules are *still* not known. Senet's rules are unknown;
every published set, his and the better-known twentieth-century ones alike, is an attempt.

The register does not score him. Reconstructing a lost game from a board and a handful of
verses is still how the subject proceeds. What has changed since 1892 is the convention: a
reconstruction is now published as one. He published his as rules.

### The best thing in the book is a letter

Section II prints a paper written for Falkener in **1864 by Dr Samuel Birch** of the
British Museum — later its Keeper of Oriental Antiquities and founder of the Society of
Biblical Archaeology. Birch describes the tomb scenes game by game and marks his
uncertainty: *sent*, he warns, is written without a determinative and is "very ambiguous";
it *might* connect with *sen*, a robber.

Falkener takes that *might* and builds a game called Robbers on it. That is the difference
between the two men, and the volume is arranged so a reader can see it.

*(A small chronology worth getting right: Falkener calls Birch the Society's founder,
which he was — from 1870, six years after the letter. Verified, and noted in the text.)*

### Five original diagrams

The 1892 engravings are unsigned, the 1892 line figures are unsigned and no draughtsman is named for them; the colophon credits the photographic plates to Owen Williams, photographer, of Laugharne, whose dates are not recoverable, and an image with no
identified creator has no death year — the same position that made Werner's plates
unusable. **None is reproduced.** Every board is newly drawn from the descriptions in
Falkener's own text, and each states its status on its face:

| Diagram | Status |
|---|---|
| A board of thirty compartments (3 × 10) | **EVIDENCE** — Birch's description |
| The three-lane board (centre 12, sides 4) | **EVIDENCE** — Birch's description |
| Falkener's board of twelve squares each way (144 cells) | **RECONSTRUCTION** |
| Senat: five squares each way, centre vacant | **RECONSTRUCTION** |
| Hab em Han: concentric rings with the bowl | **RECONSTRUCTION** |

The 144-cell board is the clearest case: no surviving Egyptian board is that size.
Falkener gets there by reading the men in the hieroglyph as *the number of cells on a
side* rather than the number of pieces — and then discovers two solid lines of twelve
cannot move, "and so felt convinced that something was missing", and adds a leap to free
them. The drawing says RECONSTRUCTION.

Drawn with **cairo, one code path to vector PDF and raster PNG**, so the print interior
and the EPUB cannot drift apart. There is no SVG rasteriser on this machine and now no
dependency on one. Two layout faults and one real rendering bug were found and fixed by
looking at the output: captions colliding with grids, and a stray diagonal from the title
into the spiral board — `show_text` leaves a current point, so the next `arc()` drew a
line to it.

---

## 3. Book 2 — Korean Games, and the detector that had to be switched off

Stewart Culin, *Korean Games, with Notes on the Corresponding Games of China and Japan*
(Philadelphia, 1895), from the Internet Archive scan `koreangameswith00culigoog`.

**Scope: the introduction and games LXX–XCVII — 45,423 words.** Culin's argument is that
games are survivals of divinatory rites, and the games that carry it are the ones played
with implements of chance on boards: nyout, the game of promotion, dice, backgammon,
chess, the pebble game, the kono family, dominoes, playing-cards, the lottery. Games
I–LXIX are 20,648 words of children's amusements in one-paragraph entries; they carry
none of the thesis and would add roughly 5,000 words to the apparatus floor for it.
Measured before any apparatus was written.

### The rights answer arrives by the opposite route

Culin died 1929 and **W. H. Wilkinson**, who wrote the chess chapter — the book says so on
its first line — died 1930. Both texts are free everywhere; the 1895 imprint settles the
United States regardless.

The illustrations cannot be cleared, and this time it is because the artists **are** named.
Culin's preface credits the Korean plates to **Ki San**, *"an artist in the little Korean
village of Tcho-ryang, back of Fusan"*, and the text sketches in part to **Teotiku
Morimoto of Tokyo**. Ki San is Kim Chun-gŭn, the genre painter whose Shufeldt collection
the Smithsonian holds, catalogued everywhere as *late 19th – early 20th century*: **no
death year is recorded.** Morimoto is not identifiable at all beyond Culin naming him, and
the rest are unattributed.

So: the same conclusion as Werner's plates and Falkener's engravings, reached from the
other direction — named artists with no recoverable dates rather than no artists at all.

### Three new problems for the shared pipeline

This is a **Google** scan, and it needed three changes rather than a rewrite:

1. **Google's own front matter, and its footer on 238 of 313 leaves.** Google's text is
   Google's. `furniture.py` finds footers now as well as heads — and the capitals test
   that identifies a head had to be dropped at the foot, because *"Digitized by"* is not
   capitals and gating on it found zero footers on a book that has one on every page.
2. **Short heads.** An eight-letter minimum on the head key silently dropped the entire
   chess chapter, whose recto head is `CHESS.` — five letters — and a three-page
   recurrence floor dropped backgammon, which is four pages long.
3. **Native script.** Culin quotes Korean, Chinese and Japanese throughout and the OCR
   reads none of it. Falkener's Greek could be transcribed word by word from the page
   images; **737 runs** here cannot, so they are marked, and the count is published.

### The detector that worked on book one is dangerous here

The single-character-confusion detector — the thing that found `Eoman` for *Roman* on
Falkener and named the fix — proposed **137 substitutions** over Culin's 45,000 words.
About a dozen were real.

The rest were **romanisations**. `Kan`, `Oya`, `sai`, `Kung`, `Liu`, `piu`, `tai`, `hau`,
`Kon`, `lai`, `Bai`, `shiu`, `Chau`, `siu`, `Kiu`, `tui`, `fai`, `fau` — none is an English
word and every one is correct. It even proposed `Tau → Tan` again, the exact suggestion
Falkener's detector made thirty-seven times.

A detector cannot tell a misread English word from a correctly read Korean one, and on a
book that is a third transliteration that makes it a source of errors rather than a finder
of them. **So it is not used as a candidate list here.** A correction is applied only where
the class of fault is closed and no romanisation could produce the token: the `li/h`
confusion (there is no syllable spelled *tlie*, *wlio* or *witli*), and the small-capital
`B/E` and `K/R` faults. **Eleven corrections, sixteen occurrences.** Ten of the rejections
are written down with the reason, so the next book inherits the judgement rather than the
list.

### Four parse bugs, found by reading the output

Games sharing a scan page were each given the whole page, so the kono family's text
printed three times over. `LXXX`'s numeral pattern matched the head of `LXXXI` and
swallowed the next game. The OCR splits `LXXXVIII` as `LXXXVII I.`, so `LXXXVII` ate it.
And the heading strip was consuming the first letter of every game's name.

The printed display titles are dropped too — this edition sets its own, and the OCR's is
where the damage is: **NVOUT** for NYOUT, **DIGNITARIES** for what the contents calls
PROMOTION. Found by measuring the capital share of the run rather than matching a
capitals-only pattern, which broke on `(bACKGAMMON)`.

### What Book 2 still needs

Apparatus (~11,000 words at the 20% floor), original diagrams for the boards, interior,
cover, EPUB, companion, catalogue, Paddle, R2, KDP package and handbook, adversarial
review, final QA.


---

## 4. What was not done, at the moment this record stops

*This paragraph was true when it was written, on 5 September, and is kept as written.*

Book 1 has apparatus and diagrams; nothing has been typeset yet. Books 2–5 have not been
started. No Phase 2 product exists on the website and none will be published from this
branch.

**All five books were built in the day that followed.** The summary at the head of this
document is the state now.

---
