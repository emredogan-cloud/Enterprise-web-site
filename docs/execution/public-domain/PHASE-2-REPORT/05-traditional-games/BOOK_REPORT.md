# BOOK REPORT — The Singing Games

**Alice Bertha Gomme, 1894 · Valice Classics 12 · slug `traditional-games`**
**State: QA. Held on three Founder signatures, one blocked live write (F-027) and the KDP upload.**

Built on branch `feature/public-domain-phase-2`. Not merged, not deployed.

---

## What this edition is

The singing half of Gomme's first volume — every entry in it that carries a tune — with
all of its music engraved for this edition from the notes. It is the largest book this
press has made and the only one with sheet music in it.

| | |
|---|---|
| Source | Project Gutenberg 41727, the HTML — a transcription proof-read by volunteers. **No scan, no OCR.** |
| Scope | the 43 entries of Volume I that carry a tune, from *All the Soldiers in the Town* to *Nuts in May* |
| Source words | 45,959 |
| Editorial words | 11,733 — **20.3%** against a 20% floor |
| Versions of the rhymes | 209, each with its county and its collector |
| Tunes | **78**, engraved as 94 staves, 836 bars, 3,042 notes |
| Pages | 244 (6 × 9 in, even for KDP, companion leaf spliced and sealed) |
| Spine | 0.5495 in · wrap 12.7995 × 9.25 in |
| EPUB | 6,119,630 bytes · EPUBCheck **0 errors, 0 warnings** |
| Gazetteer | 42 counties and countries, 79 named collectors, from 296 attribution lines |
| Claims | 15, every one VERIFIED against an external source |
| Price | ebook **$9.99** · paperback **$16.99** |

---

## The thing that makes this book: the music

Gomme's contribution was not the rhymes. Halliwell had printed rhymes for fifty years.
Hers was **the tunes**, taken down as the children sang them and printed unaltered — and
the tunes are the part of her work that could not simply be reprinted, because an 1894
engraved stave is a picture, and this press does not reproduce pictures it has not cleared
or cannot improve on.

So the book engraves its own. The chain is four programs, each of which does one thing:

| | |
|---|---|
| `BUILD/midi.py` | reads a Standard MIDI File down to pitch, duration, key and metre. Written here rather than installed: the format is small, the file is the evidence, and a dependency would have to be trusted and pinned. |
| `BUILD/notation.py` | turns that into printed values — which note is a dotted crotchet, where the bar-lines fall, which letter of the scale each pitch is spelled as in its key, where a note must be tied across a bar-line, which runs are triplets, which quavers beam together. |
| `BUILD/engrave.py` | draws it: staff lines, clef, key and time signatures, noteheads, stems, beams, flags, dots, accidentals, ledger lines, ties, bar-lines, the final double bar. |
| `BUILD/rlcairo.py` | puts the same drawing on a ReportLab page, so the print interior gets **vector** staves rather than a resampled picture of one. |

**The check that matters is the bar count.** A bar that does not add up means the durations
were read wrongly, and after three rewrites of the timing model **836 of 836 bars come out
exactly full**. What got them there was giving up on the note-offs: every note in these
files is released slightly early, the way a singer breathes, so a note lasts until the next
one begins, and no rest is printed anywhere. Triplets are given exact thirds, which is what
stopped a drift that had been snapping demisemiquaver rests into existence two bars later.

---

## What is not here, and why it is said out loud

**23 of these 43 entries carry a comparative table** — the lines of a
rhyme down the side, the places across the top, up to eighteen columns wide and printed
sideways on a quarto page. Not one is reproduced. There is no honest way to put one on a
six-by-nine page: reduced to fit, the type is smaller than anything this press will print;
split across pages, the comparison the table exists to make is gone.

**What replaces them is the gazetteer**, which is the edition's own instrument: every place
and collector named under every version and every tune, read out of the 296 attribution
lines and resolved to a county through **Gomme's own List of Authorities**. 42 counties,
79 collectors, 32 citations to a printed book rather than a person, and 18 lines that name
no place her list knows — all 18 of them listed in the working record rather than guessed at.

---

## What the adversarial review found

| # | Finding | Fix |
|---|---|---|
| 1 | **The parser silently dropped 28,752 of Gomme's 51,383 words.** `<div class="poem">.*?</div>` stops at the first closing tag, which is the end of the *first stanza*; every rhyme after the opening stanza was lost, including five sixths of "Nuts in May". | A scanner that counts nesting instead of a regex that cannot. |
| 2 | **Then it dropped 1,000 more.** Any block *containing* a page marker was treated as a page marker, and the transcribers put those in the middle of sentences — eight paragraphs of "Cushion Dance", including its longest, went with them. | A page marker is a block only when it stands alone; otherwise the span is stripped and the paragraph kept. Coverage went from 44% to 97%, and the missing 3% is the transcribers' own apparatus. |
| 3 | **The playing guide sent readers to a game that is not in this volume.** *Oranges and Lemons* is an "O": it is in Volume II. | Replaced with *Hark the Robbers*, which is this volume's arch game. And *London Bridge* was given a tug-of-war ending that Gomme explicitly denies — "only there is no 'tug-of-war' at the end" — which is now quoted. |
| 4 | **An unembedded Helvetica in the PDF.** ReportLab's default cell font lands in a table's resources whether or not a glyph is drawn, and KDP rejects a file that carries one. | Every table names the house face. `pdffonts` now shows six faces, all embedded. |
| 5 | **A tune nine hundred points tall.** Several MIDI files hold a whole plate of versions; engraved end to end they were taller than a page, which stops the build outright, and their bar-lines were wrong from the second version on. | Split at the silences between versions — which is musical — and then, if a single version is still taller than a page, by bars. |
| 6 | **The flags floated an inch from the stems.** The Unicode combining flags are cut to sit on the stem *character*, not on a stem this program draws. | Flags are drawn. So are the augmentation dots, which the combining glyph put a space and a half too high. |
| 7 | **A quotation with a question mark Gomme did not print, and a quoted first line that was Halliwell's rather than hers.** | `BUILD/check_quotes.py` holds all 31 quoted passages in the apparatus and the head-notes against her text on every build, with elisions allowed and typography folded away. |
| 8 | Smaller: the last note of a tune was printed at whatever length the player held it; the last system of a stave was justified to the full width and looked like a page that had lost its notes; the staff was ruled past the end of the music. | All three fixed in the engraver, which is one code path for the book, the EPUB and the companion sheets. |

---

## Rights

The cleanest position of the five books of this phase, and **the only one with no red row**.
Gomme died on 5 January 1938: public domain everywhere since the end of 2008, and the 1894
British imprint settles the United States on its own.

**The tunes.** The Music Team's MIDI files are read for pitch and duration only; every
stave is drawn by this edition. Nothing of theirs — page images, harmonisation, tempo,
instrument — is in the product.

**The drawings are clear and are still not used.** J. P. Emslie, who drew the figures, died
in 1913; his work has been out of copyright since 1983. This edition draws its own and says
so where each of his figures stood.

**The transcription** carries no new copyright, and Project Gutenberg's trademark — which
is the thing its licence conditions — is used nowhere.

---

## Gates

| Gate | Status | Note |
|---|---|---|
| 2 Rights | prepared, **awaiting signature** | `RIGHTS.md`, `CLAIMS.jsonl`; green throughout |
| 4 Content | **passed** | 20.3% editorial against a 20% floor — the tightest of the phase |
| 5 Facts | prepared, **awaiting signature** | 15 claims, all VERIFIED; `check_quotes.py` on every build |
| 9 Metadata | **passed** | metadata-lint clean |
| 10 Compliance | prepared, **awaiting signature** | text generated / images NONE / translation none |

---

## The one number that matters

**20.3% of this volume is original editorial matter**, measured from the manuscript by
`BUILD/measure.py`, with the gazetteer's lists of names deliberately *not* counted as the
edition's words — they are Gomme's names rearranged. The 78 engraved tunes are not counted
either, on the ground that they are the edition's work but are not words.
