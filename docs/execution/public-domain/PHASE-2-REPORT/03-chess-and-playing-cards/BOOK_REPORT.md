# BOOK REPORT — Chess and Playing Cards

**Stewart Culin, 1898 · Valice Classics 10 · slug `chess-and-playing-cards`**
**State: QA. Held on two Founder signatures and one blocked live write (F-024).**

Built on branch `feature/public-domain-phase-2`. Not merged, not deployed.

---

## What this edition is

Culin's introduction and catalogue entries 45 to 120 — chess, the divination implements
and the playing-cards — in four parts. Entries 1 to 44 are the dice, boards and race
games, 68,849 words, and are a second volume: they carry the collection but not the
thesis. **The scope was decided and recorded before a word of the apparatus was written.**

| | |
|---|---|
| Source | IA `chessplayingcard00culi` — an Internet Archive scan, Library of Congress sponsor |
| Entries set | 76 of 120 |
| Source words | 31,664 |
| Editorial words | 8,668 — **21.5%** against a 20% floor |
| Printed pages | 120 (6 × 9 in, even for KDP) |
| Spine | 0.2702 in · wrap 12.5202 × 9.25 in |
| EPUB | 741,009 bytes · EPUBCheck **0 errors, 0 warnings** |
| Original diagrams | 5 — four EVIDENCE, one RECONSTRUCTION |
| Claims | 12, every one VERIFIED against an external source |
| Price | ebook **$7.99** · paperback **$14.99** |

---

## The argument this book is, and why the edition exists

A museum catalogue is normally the least argumentative thing a scholar writes. This one is
a thesis from its first sentence: chess and playing-cards both descend from the divinatory
use of the arrow, on a suggestion from Frank Hamilton Cushing, and **the order of the
objects is the argument**. Murray treated the thesis with plain disbelief in 1952 and the
field has left it alone since.

But an object is not a claim. When Culin writes that sixty-two gambling sticks five inches
long came in a leather pouch collected by Dr A. H. Hoff of the United States Army, that
stays true whatever one thinks about arrows. **This is a book whose evidence outlived its
argument**, and the Register of Object and Argument is the instrument that lets the two be
told apart, part by part.

---

## Where each entry begins — derived, not typed

The entry number is a run-in heading at body size, not a display line, and the scanner
mangles it: *62* reads *82*, *104* reads *KM*, *118* reads *lis*. So the index is built by
making **three independent readings agree**:

1. Culin's own table of contents, read as the ordered list it is — which is what caught
   the row where *33. Snake game … 842* is scanned as *88. Snake gam … 842* and would have
   silently overwritten entry 88, a pack of tarocchino cards from Bologna.
2. The run-in headings in the body.
3. The printed page numbers in the running head, repaired from the closed confusions this
   typeface produces and then validated against the physical rule that a printed page can
   only advance, and never faster than the scan.

**50 of 76 entries were confirmed by two readings**; the rest
were placed by one, and `QA/entry-index.json` says which is which. Where the heading and
the folio disagreed, **the folio won** — it is validated before use and the heading probe
has known false positives. Two numbers were proved from the sequence alone: *5G* is 56 and
*lis* is 118.

**Five entries could not be opened at all** and their descriptions stand within the entry
above. They are printed in their place with their number and title from Culin's own
contents and a line saying so, because an entry silently missing from a catalogue is worse
than one marked missing.

---

## Two findings about this scan

**The confidence field is unusable, and that was measured.** This derive carries a
per-word `x-confidence` that the Google scan behind Valice Classics 9 did not, and the
obvious thing to do with it is flag the low scorers. Its median over this volume is **22**
on a scale to 100, and words scoring 10 or less include *and*, *of*, *is*, *than* and
*four*. It does not correlate with correctness here. Nothing in the edition depends on it;
the finding is recorded because the opposite assumption is the natural one.

**The text quality is better than book 2's** — median junk 5.1% a leaf against 5.6% — so
only 16 passages, about 202 words, are marked as the scanner's
reading of a figure rather than set as prose.

---

## The apparatus

- **A Register of Object and Argument** — five rows: the introduction and the four parts.
- **The Chess Games, Compared** — nine forms of chess on one table, every cell drawn from
  Culin's own descriptions and every row verified against the entry it summarises.
- **How the Divining Procedures Work** — what the objects in Part Two actually do.
- **What You Can Play From This Book** — and, plainly, what you cannot.
- **5 original diagrams.** Four are boards Culin counts out. The fifth is
  not a board: it is a Korean playing-card drawn beside the feathered end of an arrow, to
  the proportions he gives, so a reader can look at the resemblance the whole catalogue
  rests on and judge it. He never draws them together; that is this edition's doing and
  it carries the RECONSTRUCTION mark. It is also the cover device.
- **What This Book Shares With Korean Games** — nine entries describe games Valice
  Classics 9 already covers. Said plainly, with the difference: that book describes how a
  game is *played*, this one describes the *object*.
- **Tracing an Object Today** — and an explicit statement that no object has been traced
  for this edition and no current location is asserted anywhere in it.

---

## The adversarial review

Run under the instruction *prove this book is not ready*. What it found:

1. **"by" was being destroyed throughout.** Adapting `mark_script` by hand for this book
   dropped its dictionary test, and *by* — two letters, no vowel — was replaced by the
   marker for unreadable script **395 times**: "Collected by Dr. A. H. Hoff" came out as
   "Collected [Korean, Chinese or Japanese script] Dr. A. H. Hoff". The function now lives
   in `scripts/factory/ocr/streams.py` with one implementation, and Korean Games' parse
   output was verified byte-identical after the move.
2. **Sixteen of the seventy-six entries had no text at all**, their pages folded silently
   into the entry before them, because their mangled numerals never matched. Fixed by
   walking a pointer through the ordered catalogue and matching on the number, on a
   repaired number, or on the opening words of the title. Seventy-one of seventy-six now
   open; the remaining five are marked on the page.
3. **Nineteen entry titles were printed as the scanner spelled them** — *Fiance* for
   France, *Sckaffhansen* for Schaffhausen, *Mautegna* for Mantegna, *Cncncards* for Cucu
   cards. Repaired from a table that shows its working: every repair meets **both** tests,
   a closed fault class this typeface produces **and** a target verifiable against the
   world. The build refuses a repair whose original is not the title it found.
4. **The interior's own script-marker check compared the manuscript with itself**, which
   can only ever pass. The seal now recounts them from the finished PDF.
5. **The figure-caption wrapping ran off the plate.** The two books before this carried
   captions pre-split into short lines by hand; the helper now measures.

Verified and found sound: every diagram claim against the entry it comes from, every row
of the chess comparison against its entries, every printed word against its own source
leaf (269 of 287 blocks above 96% coverage, the rest explained by dehyphenation), and the
entry order in the finished PDF — 76 headings, in order, none missing, five marked.

---

## Verification

| Check | Result |
|---|---|
| `measure.py` apparatus floor | **21.5%** ≥ 20% |
| EPUBCheck 5.1.0 | 0 fatals · 0 errors · 0 warnings |
| Fonts embedded | LiberationSerif, LiberationSerif-Bold, LiberationSerif-BoldItalic, LiberationSerif-Italic |
| Page count even for KDP | 120 |
| Entry index in order | asserted by the build; it stopped three bad placements |
| Contents page numbers | iterated to a fixed point |
| `claim-lint` · `rights-lint` · `metadata-lint` · `compliance-lint` | clean |
| Companion | 4 assets · QR at 29% of usable height |
| `npm run lint` · `npx tsc --noEmit` · `npm run build` | clean |

---

## Held on

- **F-024** — the Paddle product, and gates 2 and 5.
- The companion page and its four sheets prerender locally; their URLs 404 until this
  branch is deployed, as with the two books before it.
