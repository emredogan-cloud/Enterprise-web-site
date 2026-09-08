# PHASE 4 — The Puzzle Shelf

**Status: IN PROGRESS. One book of five is part-built. Nothing is COMPLETE.**

*Opened 2026-09-08 on Founder authorisation. This report states what is true at the point
the session ended, not what was planned.*

---

## The one-paragraph version

Phase 4 was authorised and opened. The roadmap's five books were confirmed from the
roadmap itself rather than from memory. **Book 1, Hoffmann's *Puzzles Old and New*, is the
only one started**, and it is the hardest of the five — the sole Phase 4 title with no
transcription anywhere, an Internet Archive OCR scan of 416 pages. Its source is ingested
and measured, its rights are cleared to Gate 2 standard against three authority records,
its selection is decided on measurement, and roughly half its editorial apparatus is
written. It is **not** finished: it has no diagrams, no print interior, no EPUB, no cover,
no companion and no commerce, and its apparatus sits below the Article 2 floor. Books 2
to 5 have project directories and nothing else.

## The phase, as the roadmap defines it

Read from `PUBLIC_DOMAIN_MASTER_ROADMAP.md`, which marks the phase **LOCKED — planning
only**. That lock is the state a phase waits in for a Founder decision, and this brief was
that decision; it is recorded here rather than assumed.

| # | Title | Author | Source | Tier | Status |
|---|---|---|---|---|---|
| 1 | Puzzles Old and New (1893) | Professor Hoffmann | IA `puzzlesoldnew00hoff` — **OCR** | S | **IN PROGRESS** |
| 2 | Modern Magic (1876) | Professor Hoffmann | PG 58057 | A | NOT STARTED |
| 3 | Twentieth Century Standard Puzzle Book (1907) | A. Cyril Pearson | PG 63884 | A | NOT STARTED |
| 4 | Mathematical Recreations and Essays, 4th ed. (1905) | W. W. Rouse Ball | PG 26839 | A | NOT STARTED |
| 5 | Mathematical Essays and Recreations (1898) | Hermann Schubert | PG 25387 | C | NOT STARTED |

Article 16 requires **BOOK 1 COMPLETE → BOOK 2**, never five half-finished books. That
rule is being followed: no work has begun on Books 2–5 beyond creating their directories.

---

## Book 1 — Puzzles Old and New

### What is COMPLETE

**Source acquisition and ingest.** The Boston Public Library scan, its metadata, its OCR
text and its page-structured XML. A page-aware ingest that strips running heads and folios
**by position** rather than by string match — the flat OCR file carries one formfeed for
416 pages, so position is the only thing available, and string matching would delete
section titles from the body. Raw word count matches the archive's own flat text exactly
at 87,665, so the ingest loses nothing.

**Rights, to Gate 2 standard.** Eight layers assessed separately. Angelo John Lewis,
1839–1919, confirmed against **three independent authority records** — Boston Public
Library MARC, Library of Congress, Open Library — and not against Wikipedia, which is the
Phase 3 lesson. The scan sits in a named library's own collection under `americana`, the
strong provenance signal of Article 3 rule 3. The 462 engravings are clear by date in both
markets and are **not used at all**, which removes the layer that would otherwise carry
the risk.

**The selection, decided by measurement.** The roadmap said scope it as a selection, never
a complete edition. Each of the ten chapters was counted:

| | Chapters | Figures | Words |
|---|---|---:|---:|
| Solvable with household objects | IV, V, VI, VII, IX | **91** | 39,438 |
| Requires a Victorian puzzle to be bought | I, II, III, VIII, X | **378** | 40,465 |

Half the words; nineteen per cent of the figures. The volume is the half a reader can
actually do — a pen, some coins, a box of matches — and the excluded half is a catalogue
of a shop that closed.

**Source completeness, and a real defect found.** The first parse reported 161 puzzles,
raised no error, and was wrong: the book's own Table of Contents lists 203 in those
chapters. Held against the TOC it resolved to **195 present and 8 absent**, and the proof
is the folio sequence, which runs `154` then `157`. **Printed pages 155 and 156 were never
captured by the only extant scan.** The eight puzzles on them are named from Hoffmann's
contents list and omitted; several have surviving solutions, and writing the questions
backwards out of the answers would be forgery. Another copy was looked for first — the
Internet Archive holds one 1893 scan and Project Gutenberg has no transcription.

**OCR correction, evidence-backed.** No global replace: this scan reads `R` as `E` at the
start of a word, and replacing every `E` would repair `Eemarkable` and destroy every
`England`. A word is corrected only where it is not a word, exactly one candidate from an
attested confusion class *is*, and it is not protected. Six words in 30,124 met that test.
Separately, 103 line-break hyphens were re-joined, which cut the unrecognised residue from
725 tokens to 326 — and most of what remains is real Victorian vocabulary (`pennyworth`,
`counterpoise`, `parlourmaid`) correctly left alone.

**A fact-checker that de-hyphenates first.** Asking the raw pages how often Hoffmann names
`Montauban` returns **zero**, because the preface breaks it as `Montau-\nban`. A negative
claim written on that answer would have been false, printed, and unfalsifiable by
re-reading the sentence around it — the Phase 3 British Goblins defect exactly. Every
claim about the source is produced by query, against de-hyphenated text.

**Twelve claims registered and verified**, one of them by being **cut**: an early draft of
the introduction asserted that Bachet's first edition was 1612 against Hoffmann's 1613.
That could not be confirmed against an authority record, so the counter-claim was removed
rather than softened, per Article 6. A second draft said "sixty-four of the problems" are
priced in old money; the count supports sixty-four *mentions*, and the sentence was
corrected before it was built.

### What is IN PROGRESS

**The editorial apparatus is about two-thirds written and is below its floor.**

| Piece | Words | State |
|---|---:|---|
| Introduction | 1,755 | written, claims verified |
| Chapter notes ×5 | 1,349 | written |
| Note on the Text | 1,122 | written |
| Register of Victorian Assumptions + glossary + difficulty scale | 1,278 | written |
| **Total apparatus prose** | **5,504** | |
| Source words (selected, corrected) | 30,125 | |
| **Measured editor share** | **15.4%** | **BELOW the Article 2 floor of 20%** |

**2,027 words short.** This is stated rather than closed, because Article 2 forbids adding
filler to reach a percentage — *"a padded introduction is worse than a short one, because
it is both useless and dishonest."* The remaining words have to be real apparatus: the
per-puzzle difficulty ratings with their reasoning, head-notes on the two dozen puzzles
with a genuine history, cross-references to *Codex Enigmatica*, and a generated subject
index. None of that is written.

The **Register of Victorian Assumptions** is generated rather than asserted: every puzzle,
statement and solution together, was read for pre-decimal money, imperial units and
assumed idiom. **34 puzzles carry a dependency** — 20 money, 5 units, 12 idiom — with the
triggering words recorded so each entry can be checked against the puzzle. The idiom class
is reported separately because it is the only one that can make a puzzle genuinely
unsolvable rather than merely unfamiliar.

### What is NOT STARTED

Diagrams (91 originals, none drawn); print interior; EPUB; covers; companion; Paddle; R2;
catalogue and website; KDP package and handbook; per-book adversarial review.

The diagram work has a design already settled and worth recording: **Chapter VII's figures
are self-checking.** Hoffmann's text states how many matches an arrangement uses and how
many squares it makes, so a drawing produced from those numbers can be counted by the
build and refused if it disagrees — a figure captioned as nine squares from twenty-four
matches contains twenty-four segments and nine squares, or it does not print.

---

## Instruments this phase has produced so far

Four, all in `BUILD/`, none yet promoted to `COMMON-AREA/` because they have run against
one book only:

- **`ingest_ia.py`** — page-aware ingest of an Internet Archive DjVu XML, furniture
  stripped by position. The first ingest for a scanned rather than transcribed source;
  Phase 3's `pg_html.py` does not apply.
- **`toc_manifest.py`** — holds a parse against the book's own contents list, and asks a
  different question of chapters that have no puzzle titles, because *a check that can
  never pass is not evidence*.
- **`fix_ocr.py`** — dictionary-gated, class-limited OCR correction with a visible residue.
- **`source_facts.py`** — answers questions about the source against the source, after
  de-hyphenation.

## Blockers

**None.** Nothing about Book 1 is blocked; it is simply unfinished. The eight missing
puzzles are a permanent property of the source, recorded and closed, not a blocker.

## Git

Branch `feature/public-domain-phase-4`, cut from `main` at `c61b306`. Main is untouched.
The KDP handoff record was committed first, then Book 1's source, rights and selection.

---

*Book report: `01-puzzles-old-and-new/`. Working tree:
`/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PHASE-4-BOOK/`.*
