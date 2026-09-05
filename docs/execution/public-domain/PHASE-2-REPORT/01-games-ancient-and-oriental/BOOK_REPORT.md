# BOOK 1 — Games Ancient and Oriental: The Egyptian Games

**Valice Classics 8 · Lane C · slug `games-ancient-and-oriental`**
**Built 5 September 2026 · State: QA · Gates 4 and 9 passed · NOT PUBLISHED**

> Status in one line: **built end to end and validated; not on sale.** Every file exists,
> every automated check passes, and the three things standing in the way are two founder
> signatures and one live write this environment refuses. None of them is work that was
> skipped.

This is the first Valice edition made from a **scan** rather than from a proof-read
transcription, and most of what is worth reading below is about what that costs.

---

## 1. Identity

| | |
|---|---|
| Work | *Games Ancient and Oriental, and How to Play Them*, sections I–VI |
| Author | **Edward Falkener, 1814–1896** — architect, archaeologist |
| Published | London: Longmans, Green and Co., 1892 |
| Also printing | **Dr Samuel Birch, 1813–1885**, whose 1864 paper occupies most of section II |
| Source | Internet Archive scan `gamesancientorie00falkuoft` |
| Why this book | It is the first attempt anybody made to turn the antiquarian literature on ancient games into games you can play — and it hides the join between evidence and invention. That join is the product. |

## 2. What the edition is for

Falkener's complaint is the best sentence in the book. Two centuries of antiquaries had
collected every classical passage about ancient board games, and

> the bones of the entire skeleton have been put together, but there they remained; the
> game was not played, and it could only be regarded as an interesting fragment of
> antiquity — curious, but incomplete, and useless.

So he supplied the rules. **The ancient sources do not contain them.** His rules are
inferred from board geometry, piece counts, a few Latin verses and living games he thought
were descendants, and the book prints them in the imperative, with worked games in full
move notation, and no mark showing where the evidence stops.

**The Register of Reconstructions** puts that mark in. For each of the three games it
separates what the evidence shows, what Falkener supplies, and what is known now — which in
every case includes that the rules are *still* not known. It does not score him.
Reconstructing a lost game from a board and a handful of verses is still how the subject
proceeds. What changed since 1892 is the convention: a reconstruction is now published as
one, with its assumptions on the page. He published his as rules.

## 3. Rights

`rights-lint` clean over 60 ledger rows; **RL-0017** is GREEN.

| Layer | Creator | Death | Status |
|---|---|---|---|
| The text | Edward Falkener | **17 Dec 1896** | PD everywhere; life+70 expired 1 Jan 1967 |
| The 1864 paper in §II | Samuel Birch | **27 Dec 1885** | PD everywhere |
| The OCR text layer | Internet Archive | — | PD; a mechanical transcription carries no new right |
| **The 1892 engravings** | **unidentified** | **unknown** | **NOT USED — and not usable** |
| Apparatus, diagrams, arrangement | Valice Press | — | © 2026 Valice Press |

**The illustrations are the interesting row, and the first build got the reasoning wrong.**
There are two layers. The line figures — the boards and diagrams — are unsigned, and no
draughtsman is named for them. The photographic plates *are* credited: the volume's
terminal colophon reads *WILLIAM POLLARD & Co., PRINTERS, EXETER. **OWEN WILLIAMS,
PHOTOGRAPHER, LAUGHARNE.** WATERLOW & SONS LTD., PHOTO-ENGRAVERS, LONDON.* Owen Williams
is a named person whose dates are not recoverable, so the plates cannot be cleared either.
Neither layer is reproduced, which is why this book has five drawings of its own — the
same outcome as Werner's plates in Phase 1, by a different route.

Gate 2's evidence is complete; the signature is the Founder's — **FOUNDER F-020**.

## 4. Facts

**Twelve claims registered in `CLAIMS.jsonl`, every one VERIFIED against an external
source. `claim-lint` clean.** The verification pass was not a formality: it caught two
errors before they shipped.

| | Was | Is | Source |
|---|---|---|---|
| Falkener's death | **1908** on the imprint page | **1896** | National Archives authority record; IA record; the ledger already said 1896 |
| Birch's keepership | "**later** its Keeper of Oriental Antiquities" | Keeper since the 1861 division; Oriental Antiquities alone from 1866 — so he already held it when he wrote in 1864 | DNB 1901 supplement |

Two more were tightened rather than corrected: mehen's span was too narrow at both ends
(now c. 3300–2200 BC, from Naqada II through the sixth dynasty), and the Manchester show
that dates section III now has its name and date — the **Royal Jubilee Exhibition, opened
3 May 1887**, where the relics were shown by their owner Jesse Haworth, Flinders Petrie's
patron.

Gate 5's evidence is complete; the signature is the Founder's — **FOUNDER F-020**.

## 5. The scan, and what it cost

This is the part that has no equivalent in Phase 1.

### Running heads

Stripping them by a list of expected spellings was tried first and **quietly failed**. The
heads are the worst-scanned lines in the book: LUDUS LATRUNCULORUM comes back as *LTJDUS*,
*LUDDS*, *LDDUS* and *LATBUNCULORUM*, and every variant the list had not anticipated was
printed mid-sentence — including the whole of section III's *QUEEN HATASU'S DRAUGHT-BOARD*.

They are now found by what they **are**: a short run of capitals at the top of the page,
set clear of the text block by more than 1.3× the leading, recurring at least three times
across the volume. **81 leaves of 98.** A section's display title looks identical but
occurs once, so it survives.

Two measurements had to replace two guesses. The band is not a fixed percentage of page
height — a fixed band swallowed the first line of prose on nine leaves in thirteen. And the
gap under a head is about 1.5× the leading, not the 2.2× first assumed.

### The 1892 pagination

Preserved in the margin, so a reader can cite the original. **82 legible, 80 printed.** The
two that were dropped failed a physical test rather than a judgement: between two leaves of
a scan the printed page can only go forward, and never faster than the scan does, because
inserted plates make the scan run ahead and never the reverse. That rule keeps every
genuine reading across offsets stepping −10, −12, −14, −18 through inserted plates, and
rejects scan 107, where the head reads THE GAME OF THE BOWL. 89 but a stray 2 elsewhere on
the leaf had been taken for the folio. Confirmed against the page image.

### Corrections

**Nothing was corrected without looking at the printed page.** Every candidate was cropped
out of the page images at 400 dpi using the OCR's own coordinates, and read.

- **12 word corrections, 22 occurrences.** The systematic fault is a capital R read as E or
  K: *Eoman*, *Koman*, *Eobbers*, *EELICS*.
- **20 rejected.** Including the detector's single most frequent proposal, *Tau → Tan*,
  **37 times**. The page reads TAU — the game the book is about.
- **47 further readings** that carry punctuation and so cannot be matched as words.

### The Greek is restored, not marked

Falkener and Birch quote Greek in Greek type, which the OCR cannot read; it returns Latin
letters that resemble the shapes. The page images were enlarged and the Greek read off
them. **Twelve words are now set in Greek**: γραμμή, πολλῶν, ψήφων, πόλις, κύνες, ψῆφοι,
καρδία, κραδία, κινεῖσθαι, κράδη, νάβλα. Where a reading was doubtful it was not made.

### The hieroglyphs are marked, because they cannot be read

Birch quotes hieroglyphic signs inside his sentences. Transliterating what the OCR returns
would be inventing a reading. **65 runs** are marked `[hieroglyphs]`, **4** inline figures
`[a board diagram]`, and **21** real words that had sign-noise stuck to them were cleaned
rather than marked.

### The move tables

Falkener sets his worked games in four columns. An OCR reads a page in lines, and a line
crosses all four columns, so **about an eighth of the source text** arrived as this:

```
14—15 127—126 43—44 78—77 15—16 126—125 85—86 116—106 …
```

Neither table nor prose, and unusable. The coordinates were in the OCR the whole time.
`scripts/factory/ocr/tables.py` rebuilds the printed table from them — words grouped into
rows by vertical centre, columns found by which left edges recur across the rows, every
word placed in the cell it was printed in. **19 tables set, 474 rows.** The reconstruction
of scan 72 matches the page image cell for cell.

Four things had to be measured rather than assumed, each after a wrong guess:

| Guess | Why it failed | What replaced it |
|---|---|---|
| Row spacing from the median y-gap | That median is 2 px — the four cells of one row sit within 8 px of each other, so it measured jitter | Word height (~37 px); rows are ~63 px apart |
| Columns from gaps in the sorted left edges | A wide cell reaches the OCR as two words and the second sits between two columns, bridging the gap; on one page that chained three columns into one | Columns by **density** — a left edge that recurs on most rows |
| Merging words into cells by the gap between them | This encoder tiles its word boxes across the line: `14—16` is given a box 367 px wide, running to the next word | Cells assembled by column instead |
| One rule for "a table" | It walked past every two-column game and every numbered board | Three kinds: `moves`, `grid`, `other` |

**Repair is constrained by the page.** Falkener numbers his board 10 to 129 with two
lettered ranks, so a cell number above 129 cannot be a square, and the scan makes exactly
one substitution — `a` read as 0, `b` as 3 — visible in the board key itself, which returns
its lettered rank as 190, 290, 390. Anything that still does not resolve to a square is
**marked with a double dagger, not corrected and not dropped**, and the note under each
table says how many.

| Kind | Cells | Marked unread |
|---|---|---|
| Worked games | 897 | **46 (5%)** |
| Numbered boards | 505 | 89 (18%) — the board key itself is 6 in 144 |
| Throw-and-enter forms | 435 | 382 (88%) |

**Nine tables are described rather than reproduced.** The bowl game's form is read at 88%
wrong or absent, and a table of move notation with a third of its numbers wrong is worse
than no table. Each omission is marked in place with what stood there, its size, its 1892
page and the measured share that could not be read.

## 6. What was added

**7,760 words of original editorial matter — 28.0% of the volume**, against a 20% floor,
measured from the manuscript by `BUILD/measure.py`.

| | Words |
|---|---|
| Introduction | 1,269 |
| A Note on the Text | 1,346 |
| Six section introductions | 1,099 |
| **A Register of Reconstructions** | 1,061 |
| Glossary — 19 entries | 944 |
| Chronology — 17 rows | 533 |
| Diagram captions | 278 |
| Three Ways In | 172 |
| Index of subjects — 31 headings, 101 references | — |

### Five original diagrams

Drawn with **cairo, one code path to vector PDF and raster PNG**, so the print interior and
the EPUB cannot drift apart — and no dependency on an SVG rasteriser, which this machine
does not have. Each states its status on its face.

| Diagram | Status |
|---|---|
| A board of thirty compartments (3 × 10) | **EVIDENCE** — Birch's description |
| The three-lane board (centre 12, sides 4) | **EVIDENCE** — Birch's description |
| Falkener's board of twelve squares each way | **RECONSTRUCTION** |
| Senat: five squares each way | **RECONSTRUCTION** |
| Hab em Han: concentric rings with the bowl | **RECONSTRUCTION** |

The 144-cell board is the clearest case. No surviving Egyptian board is that size; Falkener
gets there by reading the men in the hieroglyph as *the number of cells on a side* rather
than the number of pieces, then finds two solid lines of twelve cannot move — "we thus came
to a stand-still, and so felt convinced that something was missing" — and adds a leap to
free them.

Each renders twice: a standalone figure with its caption burned in, for the companion
sheets, and a **plate** with the caption omitted for the book, where the caption is set in
the book's own type. A burned-in caption would come out around 6 pt once a 760 pt drawing
is fitted to a 6 × 9 text block. The EVIDENCE/RECONSTRUCTION badge stays in both.

## 7. The physical book

| | |
|---|---|
| Interior | **78 pp**, 6 × 9 in, Liberation Serif embedded, gutter 0.375 in, no bleed |
| Companion leaf | p78, spliced by the house pipeline; QR **28%** of usable height, **1.70 mm/module** against a 0.5 mm floor |
| Spine | **0.1712 in** — agrees with the pipeline's arithmetic to four decimals; no cover rebuild required |
| Wrap | 12.4212 × 9.25 in at 300 dpi, 0.125 in bleed |
| **Spine text** | **None.** KDP allows it only from 79 pages and this book is 78 |
| Cover title | 30.6% of cover height (house floor 25%); thumbnail contrast 0.97 at 150 px |
| EPUB | 865 KB, 17 documents, **EPUBCheck 0 errors / 0 warnings** |

**The spine-text rule is worth recording as a defect that was caught.** The cover builder
had invented its own threshold — a spine *width* of 1/16 in — which would have printed
spine text on a 78-page book that KDP rejects. It now imports the house rule
(`SPINE_TEXT_MIN_PAGES = 79`).

The cover device is the **board of thirty compartments** — the EVIDENCE board. Putting a
reconstructed board on the cover would have stated the book's argument backwards.

## 8. The companion

`valicepress.com/companion/games-ancient-and-oriental` — four sheets, free, nothing asked
of the reader.

| Sheet | What it is |
|---|---|
| **boards.pdf** | The three boards at playing size, to print and play on |
| register-card.pdf | The Register of Reconstructions on one sheet |
| the-terms.pdf | The glossary |
| chronology.pdf | The three timelines the volume keeps apart |

The boards are the point. Falkener's complaint was that the game was never played; the one
thing a reader of this edition can do that his readers could not is print the board and
play on it. They are drawn by the same cairo code path as the figures, so the sheet and the
diagram cannot disagree, and each carries the same EVIDENCE or RECONSTRUCTION mark.

## 9. Commercial

| Format | List | Net | Basis |
|---|---|---|---|
| Direct ebook (PDF + EPUB) | **$7.99** | $7.09 after Paddle | Engine recommends $6.99. The Classics band is $7.99–9.99; this volume is 78 pp against 154–176 for the others, so it sits at the bottom of the band, not at the $9.99 the longer books carry. |
| Paperback | **$12.99** proposed | $5.49 (42.3%) | Prints at $2.30; engine recommends $9.99. The Classics band of $16.99–19.99 assumes a 150-page-plus volume. Founder decides at Gate 8. |

No Kindle (KDP caps public-domain content at 35% and the store already carries free scans).
No hardcover (78 pp is the very bottom of KDP's 75–550 range and would bind badly). No large
print (the move tables do not enlarge usefully). Each decision is written down rather than
assumed.

## 10. What is done, and what is not

**Done:** manuscript · apparatus · five diagrams · print interior · companion leaf spliced
and verified · cover (front, Kindle, wrap) · EPUB, EPUBCheck clean · four companion sheets
served from the site · catalogue entry · R2 masters uploaded and content-verified ·
`asset-manifest` cover · KDP package and upload handbook · `metadata-lint`,
`compliance-lint`, `claim-lint`, `rights-lint`, `kdp-linkage-lint` all clean ·
`npm test` at the pre-existing baseline · `tsc` clean · `npm run build` 73 static pages.

**Not done, and why:**

| | Why | Where |
|---|---|---|
| Not on sale | The Paddle product is a live write this environment refuses. One command. | **F-019** |
| Gates 2 and 5 unsigned | They need a person's signature, not a check. Both checks are done. | **F-020** |
| Not on KDP | The print upload is a Founder action. | `KDP_UPLOAD_HANDBOOK.html` |
| `websiteStatus: draft` | Follows from F-019. A buy button with no price behind it is a lie. | catalogue |

---

## 11. The adversarial review, and what it found

**The first build of this book failed its review.** An independent reviewer was given one
instruction — *prove this book is not ready* — and its verdict was **no**. It was right,
and the findings are recorded here rather than quietly fixed, because the point of the
review is lost if the book that ships pretends it passed first time.

### The worst one

**The Register of Reconstructions committed the error it exists to catch.** Under WHAT THE
EVIDENCE SHOWS, for Senat, the first build printed:

> Living practice in nineteenth-century Egypt, **which Falkener reports at first hand**

and called it *the most defensible chapter, because its best material — what he saw people
doing — is reported rather than inferred.*

Falkener saw nothing. He never went to Egypt for it. The passage is **E. W. Lane's**, from
*Manners and Customs of the Modern Egyptians* (1836), and Falkener credits him twice on the
page: *"Lane tells us that many of the fellaheen of Egypt frequently amuse themselves with
the game of Seega."* The one feature that distinguishes this edition — a register that
separates evidence from inference — attributed another man's observation to Falkener as
eyewitness testimony, in four places.

Two more went with it. The same row called Senat's board *"the same board with fewer
pieces"* — it is a different board, five squares each way against section IV's twelve, as
the edition's own two diagrams show on facing claims of sameness. And the introduction
said the register's *what is known now* column *"in every case includes that the rules are
still not known"*, which is false for exactly that section: **Seega's rules were recorded
from living players and never lost.** That inversion is now the interesting thing about the
row, and it is written up as such.

### Numbers that were false on the page that promises they are measured

The Note on the Text said *"The counts below are written by the build from the manuscript
it produced; they are not estimates."* Five of them were typed by hand from an early
working report, and the parse had changed underneath them.

The fix is mechanical, not editorial: the note now carries `{{TOKENS}}` and `BUILD/counts.py`
fills them from the manuscript being set. **A number this edition cannot compute is a
number it does not print.**

### Everything else, and where it went

| # | Finding | Fix |
|---|---|---|
| 1 | Register attributes Lane's observation to Falkener | row rewritten; claims **C-013**, **C-014** |
| 2 | "the same board with fewer pieces" — it is a different board | corrected in register, section intro and glossary |
| 3 | Five counts in the Note on the Text false | `BUILD/counts.py`; the note is now token-filled |
| 4 | `895—89` printed unmarked where the page reads `89b—89a`; a table's final row and its result deleted; `Slack` for `Black` in 8 heading cells; ten phantom empty rows | move cells are range-checked against the board now, not just shape-checked; headings are matched against `{White, Black, Red}`; empty rows dropped; a blank cell inside a table is **marked unread**, not printed blank |
| 5 | Section V's 13×13 board validated against section IV's 10–129 board, so ~12 cells printed wrong and unmarked | the board's range is **inferred per table**, and a numbered board that fits its own arithmetic is now *checked against it* — the 13×13 fits row-major from 1, the scan agreed on 159 of 168 readings, and the edition prints what the board requires |
| 6 | "the 1892 line figures are unsigned and no draughtsman is named for them; the colophon credits the photographic plates to Owen Williams, photographer, of Laugharne, whose dates are not recoverable" — false; the colophon credits **Owen Williams, photographer, Laugharne** | rewritten in imprint, source note, `RIGHTS.md` and config; claim **C-015** |
| 7 | `RIGHTS.md` a blank template; `DECISIONS.md` had two entries numbered A2 | `RIGHTS.md` written in full; decisions renumbered and closed |
| 8 | Sections V and VI opened with OCR garbage — `r11"!` and `SAB EM HAN` for **HAB EM HAN** | a section's printed display title is now dropped as furniture, structurally, by the gap under it |
| 9 | The wrap's frame rules struck through **VALICE PRESS**; the cover printed one series name and the config another | imprint block moved clear, and the build now *asserts* it clears the rule; the series line is read from `project_config.json` |
| 10 | Eight of fourteen contents page numbers off by one | the layout **iterates to a fixed point** — filling the numbers in lengthened the table and moved everything after it — and the build fails rather than shipping a contents that disagrees |
| 11 | `QA/interior-main.json` described the pre-splice file, and the cover read its page count | `BUILD/seal_interior.py` rewrites the record from the PDF after the splice; the cover refuses to run until it has |
| 12 | `Eameses`, `Eosellini`, `Eenouf`, `Garrington`, `Historise`, `mture`, `rowp`, `iar` — the very class the note says it hunted | 13 more corrections and 7 more token fixes, each with its page |
| 13 | Three passages deleted, including the winning move and the result of Game I | prose inside a table's span is collected **per row and rejoined in column order** instead of dropped |
| 14 | `[hieroglyphs]` markers splitting a transliterated word | restored Greek and existing markers are now immune to the sign pass — **κραδία had been read off the page image, written in, and then eaten** |
| 15 | Ten factual defects: the spiral/rings contradiction, fourth vs fifth dynasty, senet on the wrong board, the AD 100 papyrus, the 1967 anachronism, Murray vs Kendall, "eleven sections", the *kelbs* etymology, three index headings naming things not in the text | all corrected; claims **C-016**, **C-017**, **C-018** |
| 16 | `CLAIMS.jsonl` empty, and `claim-lint` treated that as a *warning* | **an empty ledger is now an error**: a facts gate that passes when nothing has been checked is worse than no gate |
| 17 | AI disclosure said `generated` in one field and "AI-assisted" in another | config corrected; the handbook now **renders the declaration from the config** instead of a literal |
| 18 | The annotator was not named anywhere inside a book sold as *(Annotated)* | on the title page and in the imprint |


### The second pass: two of the fixes had regressed it

The reviewer verified the eighteen and attacked the rebuild. Nine were fully fixed. **Two
of the fixes had created new defects**, and that is the part worth recording.

**Inferring the board's range per table broke the table it was meant to protect.** Fixing
section V — which had been validated against section IV's board — widened section IV's own
range so far that its out-of-range rule stopped firing. The board key then printed
`193 293 393` for `19b 29b 39b`: twelve wrong cells, one dagger, and a note assuring the
reader that 143 of 144 readings were sound. It was the table the Note on the Text cites as
its worked example of the substitution it was getting wrong.

**And dropping the printed display title as furniture deleted source text.** With it went
the only place the four Roman names of the game appear — *LUDUS LATRUNCULORUM, LUDUS
CALCULORUM, PRŒLIA LATRONUM, BELLUM LATRONUM* — while the Note still said nothing had been
cut, and the freshly-repaired Register argued its case by quoting a heading the book no
longer printed.

The grid checks are structural now rather than range-based: `rank_rows()` finds the
lettered ranks Falkener prints above his board so the arithmetic fit runs on the body; a
lettered token in a table with *no* lettered rank is a misread digit (`11a` is 110 on the
1–169 board); and the placing tables are checked as permutations, because they are not
boards — every square appears once, which catches a duplicate no range test can.
`apply_grid_fit` no longer overwrites silently: it had printed ten reconstructed cells and
set the unread count to **zero**.

Falkener's display line is kept now, set under this edition's section title, with
**SAB EM HAN** corrected to **HAB EM HAN** — the game's name misspelled in its own heading.

Four more arithmetic faults on the Note went with them, including one that mattered:
*"the margin shows the 1892 page wherever it changes"* was false by 33. The marker count is
now counted as the marks are drawn, carried through the layout's fixed-point loop, and the
build fails if it never settles. `QA/counts.json` is written by the build rather than
recomputed and discarded — it had four numbers wrong while the printed page was right,
which is the worse way round.

### The third pass: the checks, run here

The third review terminated on a session rate limit before reading anything, so the four
checks it had been asked for were run here instead, against the page images rather than
against the arithmetic. The 12 × 12 key really does print a **b** rank and an **a** rank
above twelve rows of plain numbers — cropped at 200 dpi and read — so the twelve rewrites
are what the page says, and every one is marked.

Two defects came out of it. **Nine tables printed with no column labels**, because the
heading row was only ever sought on the line immediately above the data, and this OCR puts
each label on its own line object. And a four-row minimum was leaving short continuation
blocks to be set as running prose. What remains of the wreckage — seven short runs that
fall outside every table this edition can rebuild — is now a **marked lacuna** giving the
word count and the share the scan failed on. Prose wreckage: fifteen at the second review,
zero now.

### A mistake I made twice

Reconciling the page count with a search-and-replace across the catalogue took
*"176 pages"* to *"178"* three times inside the **Epictetus** entry, and turned its linkage
record from *"175 → 176 pp"* into *"175 → 178 pp"*. The same blind replace had corrupted the
**codex-mythologica** large-print plan a few minutes earlier. Both were reverted by editing
only the bytes between the owning slug and the next one, and verified by walking every
changed hunk back to the book that owns it. A search-and-replace across a file of
twenty-four books is never safe, and twice in one session is a pattern rather than an
accident.

### What the review confirmed

Falkener 1814–1896 and Birch 1813–1885; the 1892 Longmans imprint; the Society of Biblical
Archaeology in 1870; *latrunculi* as its own game; senet's rules genuinely unknown. Every
price reproduces from `price-engine.mjs`. The catalogue row, the companion wiring and the
spine rule are clean. `epubcheck` genuinely passes. **No 1892 illustration is reproduced
anywhere** — verified across all six EPUB images and all five interior figures.

### The verification, re-run

27 checks over the rebuilt PDF: 17 things that must not appear (`Slack`, `at first hand`,
`SAB EM HAN`, `1 January 1967`, unfilled `{{tokens}}`, literal `<font>` tags, `Eameses`,
"no illustrator is named", …) and 10 that must (`Lane tells us`, `Black resigns`, `but is
taken itself`, `Here it is evident`, `ἱερὰ γραμμή`, `κραδία`, Owen Williams, the annotator's
name, the Royal Jubilee Exhibition, Rashepses). **All 27 pass.**


---

*Branch `feature/public-domain-phase-2`. Not merged to `main`.*
