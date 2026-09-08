# Source completeness — Puzzles Old and New

**Two leaves of the only extant scan are missing, and they take eight puzzles with them.
Everything else in the selection is present. This is how that was established.**

Brief §7: *never assume a successful parse means the source was fully captured.* The
first parse of this book reported 161 puzzles and raised no error. The book contains 203
in the selected chapters. Nothing had gone wrong — nothing had been checked.

---

## The chain of measurements

| Stage | Words | Note |
|---|---:|---|
| `_djvu.txt`, the flat OCR | 87,665 | the whole 416-page scan |
| `ingest_ia.py`, raw | 87,665 | **exact match** — the page-aware ingest lost nothing |
| after stripping page furniture | 83,759 | 3,906 words of running heads and folios, 4.46% |
| the five selected chapters | 39,438 | measured over the chapter spans |

The ingest was written against the XML rather than the flat text for one reason: the flat
text for this item contains **one** formfeed for 416 pages, so page boundaries do not
exist in it, and furniture cannot be stripped by position. The XML carries every word
with its bounding box.

## How the eight were found

**The parse was held against the book's own Table of Contents.** The TOC is printed by
the publisher, is independent of the body's typography, and is a separate OCR pass — so
where the two disagree, something is wrong with one of them, and it says which.

| Chapter | TOC | Body markers | Method |
|---|---:|---:|---|
| IV Arithmetical | 103 | 96 | fuzzy title match |
| V Word and Letter | 14 | 16 | fuzzy title match |
| VI Counters | 25 | 26 | number sequence — *the chapter has no puzzle titles* |
| VII Lucifer Matches | 19 | 19 | number sequence — *ditto* |
| IX Quibble or Catch | 42 | 38 | fuzzy title match |

Chapters VI and VII are checked differently on purpose. Their puzzles are named by their
figures, so the body carries `No. VIII.` and nothing else; matching TOC titles against
body headings there can only ever fail, and **a check that can never pass is not
evidence**. That is the Phase 3 lesson about the Hebrew lament, applied in advance.

## The proof is the folio sequence, not the fuzzy match

Fuzzy title matching narrowed the field but could not close it: `Tenth Man Out` is
thirteen characters and will find a 0.77 match somewhere in 7,000 words by chance. The
decisive evidence is the printed page numbers, which run:

```
scan p176   running head "154 Puzzles Old and New."
scan p177   running head "Arithmetical Puzzles. 157"
```

**Printed pages 155 and 156 were never captured.** The scan jumps straight across them,
and the sentence at the break is cut mid-clause — *"How long will it be before all four
again meet at the"* — and resumes inside a bracketed editorial note two puzzles later.

Between `No. XLVII. The Walking Match` (printed p154, present) and `No. LVI. The Three
Travellers` (printed p157, present) the Table of Contents lists exactly eight items:

| | |
|---|---|
| XLVIII | A Feat of Divination |
| XLIX | A Peculiar Number |
| L | Another Peculiar Number |
| LI | The Three Legacies |
| LII | Another Mysterious Multiplicand |
| LIII | How to Divide Twelve among Thirteen |
| LIV | Tenth Man Out |
| LV | Ninth Man Out |

## What was done about it

**Nothing was reconstructed.** Several of the eight have their *solutions* in the key
section, which survives — the answers are on printed pages 207–210 and the scan has them.
It would be possible to write a puzzle backwards from its answer and print it in
Hoffmann's voice. That is fabrication under Article 18 and it is not done.

**The eight are omitted, and the book says so**, by name, in the Note on the Text, with
the reason and the archive item id. A reader who wants them knows precisely what to look
for and where the gap is.

### Was there another copy?

Checked, before deciding to omit:

- **Internet Archive** — one 1893 Hoffmann scan exists, `puzzlesoldnew00hoff`, the one
  used. The other `puzzlesoldnew*` items are Slocum & Botermans 1986, a different and
  in-copyright book.
- **Project Gutenberg** — no transcription of this title.

## Everything else is present

Eleven titles that the first pass reported missing were found in the body with their
`No. N.` marker lost to OCR — the numeral sits beside a figure and the scan drops it.
They are recovered through the TOC manifest, which supplies the number and the title the
marker should have carried.

| | |
|---|---|
| Selected chapters, TOC | **203 puzzles** |
| Present in the scan | **195** |
| Absent with printed pp. 155–156 | **8** |

---

*Instruments: `BUILD/ingest_ia.py`, `BUILD/parse_puzzles.py`, `BUILD/toc_manifest.py`.
Machine-readable results: `QA/ingest.json`, `QA/parse.json`, `QA/toc_vs_body.json`.*
