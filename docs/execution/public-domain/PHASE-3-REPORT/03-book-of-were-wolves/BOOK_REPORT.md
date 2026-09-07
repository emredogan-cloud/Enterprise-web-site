# Phase 3, Book 3 — *The Book of Were-Wolves*

**Sabine Baring-Gould, 1865. Valice Classics 15. Built 2026-09-06. Not deployed, not listed,
not sold.**

---

## What it is

A young Devon curate could not hire anyone to walk him home across the fields one night in
1865: it was getting dark and there were *loups-garoux* abroad. He crossed the marais alone
with a stick, and then went away and spent a year finding out what those people were afraid
of. What he produced is not the horror anthology it has been sold as. It is source criticism:
the werewolf taken backwards through the record — Herodotus and Petronius, then the Norse
sagas, then the medieval chronicles, then the French trial transcripts — with the question at
each step of what the witnesses actually said.

| | |
|---|---|
| Pages | **198**, 6 × 9, even |
| Baring-Gould's words printed | **54,346** — 16 chapters, 38 footnotes, 15 passages of verse |
| Editorial apparatus | **14,998 words, 21.59%** against a 20% floor |
| Illustrations | **none, and none invented** — the 1865 book has no plates |
| Coverage | 99.73% of the source body; **0 boilerplate leaks**; 16/16 chapters open and close as the source does |
| Quotations | **8 checked against the source, 0 not his** |
| Claims | **30 registered, all verified, 20 corrected by verification** |
| Paperback | 12.696 × 9.25 in, 0.446 in spine — calculator row read for 198 pp |
| Hardcover | 14.21 × 10.417 in, 0.635 in spine — calculator row read for 198 pp |
| EPUB | 843 KB, **EPUBCheck 0 fatal / 0 error / 0 warning** |
| Companion | 4 sheets, QR **25.9% of usable page height** |


> **Re-measured 2026-09-07.** A defect was found in `differentiation.py`, the instrument Article 2 is judged by: it counted every string in a content file, so each block's `kind` label scored as a word of the book, and a verse block carrying both `text` and `lines` was counted twice. Those words inflated the SOURCE denominator, so the share had been **understated**. The counter now skips structural keys and counts a block once; all six Phase 3 volumes were re-measured. The figure above is the corrected one, and this book still clears the floor.


## What this edition adds

- **A head-note before each of the sixteen chapters**, each ending in **Reading against him** —
  the specific thing in that chapter to resist. Seven open by naming the murders in them.
- **A Register of Evidence and Inference**: what he construed from a language he could read,
  transcribed from a document, repeated at second hand, or theorised.
- **What Has Been Established Since 1865** — ten findings. The philology held; the mythology
  was abandoned within his lifetime; the medicine was replaced by clinical lycanthropy.
- **The Two Courts**, a casebook of every trial, a who's-who, five essays, a Norse glossary,
  a register of shape-changers, a chronology.
- **A note at the front saying which chapters describe murders and what is in them.** The
  chapters are printed entire — Article 18 forbids abridging to hide what a book contains,
  and his argument depends on them — so what is removed is the surprise, not the content.

## What the build had to solve

**The section headings are roman numerals.** Books 2 and 3 of this phase identify special
paragraphs by folding the text to a key and looking it up. That fails completely here: the
chapter headings are I. to VIII., repeated across sixteen chapters, so a fold-keyed dictionary
sees fourteen where there are 233. This book is walked positionally instead.

**`p.letter` marks two different things** — the chapter argument, and the actual letters
Baring-Gould quotes. Gilles de Rais writing *Monsieur my Cousin and honoured Sire* carries
the same class as a chapter synopsis. They are told apart by position: the argument is the
first block of its chapter and everything else so marked is a letter.

**A span inside a word puts a space inside the word.** The transcription sets the opening of a
quoted letter as `<span class="smcap">M</span>ONSIEUR`, so one extraction returns
`M ONSIEUR MY C OUSIN` and the other `MONSIEUR MY COUSIN`. Folding on letters alone, spaces
dropped, made them agree.

## What the review found

An independent reviewer, which did not write the book, raised **30 defects**. It was right
about essentially all of them, and one was very serious.

**The P0 was a fabrication, and it was the edition's headline claim.** Six passages asserted
that Baring-Gould printed the two great French judgments *without noticing what they meant* —
that he "passes over their significance", "does not draw the inference", "printed it and
walked past it". He states it plainly, at the end of chapter VII, in a paragraph this edition
prints on page 74:

> "In the two cases of Roulet and Grenier the courts referred the whole matter of Lycanthropy
> … **to its true and legitimate cause, an aberration of the brain.** From this time medical
> men seem to have regarded it as a form of mental malady to be brought under their treatment,
> rather than as a crime to be punished by law."

That is exactly the inference the apparatus said he failed to draw. All six passages are
rewritten, and the criticism that survives is much narrower and truer: he draws it once, at
the end of a chapter, and then builds chapter IX on a moral category instead.

**The second serious finding broke the same argument from the other side.** The casebook
claimed to list *every* prosecution and omitted the one that matters most: on 14 December 1598
— the same year the Parlement of Paris spared Jacques Roulet — **that same court sent a tailor
of Châlons to the flames for lycanthropy**. The edition had drawn a contrast between village
courts that convicted and sovereign courts that saw illness. The same sovereign court did
both, inside twelve months. The essay is rebuilt on that.

**Third: chapter IX had no content warning.** Its title, *Natural Causes of Lycanthropy*,
sounds clinical; it contains the most graphic material in the book. It is now named at the
front and warned in its own head-note, as are chapters XII and XIII, and the count is
corrected — **seven** chapters describe murders, not six.

**Also fixed.** Jean Grenier was **thirteen**, not fourteen, and was **sentenced to perpetual
imprisonment** in a monastery with escape punishable by death — not, as the casebook said,
"not punished at all". The Greek transliteration was **deleting the rough breathing**, so
ὑγρόν printed as *ugròn* and αἱ as *ai*, while the source note promised the reader ordinary
scholarly transliteration; the aspirate is now written, and the iota subscript and accent
markers no longer print raw. Running heads were mis-cased on **114 of 196 pages** —
`Chapter Xii. the Maréchal De Retz.—Ii.` — because the title-caser could not handle a roman
numeral or a word after an em dash. De Lancre ran the Labourd hunt in **1609**, six years
after the Bordeaux judgment, not three. Geiler's sermon gives **seven** causes, not three.
`RIGHTS.md` cited a digest file that does not exist. Two claims carried boilerplate from
another book of the phase — *enaliosaurian*, *barnacle-goose* — and were marked VERIFIED in
that state. And a chronology entry dating the modern use of *clinical lycanthropy* to 1963
could not be sourced at all, so it was **removed rather than softened**.

The reviewer also flagged the companion page as a P0 404. Half of that is a false positive —
the page is registered in this branch's companion registry, which the reviewer could not see
from the main tree. The other half is real and is a release blocker, recorded as one: the
printed address is permanent and the page is not live until Phase 3 is deployed. All three
books' `QA/qr.json` now say what decoding a QR does *not* establish.

## What is not done

- **Not deployed.** Phase 3 is unmerged by instruction; the companion URLs 404 against
  production, as the other two books' do.
- **No Paddle product, no R2 master, no KDP listing.** No identifier invented for any.
- **Gate 2 unsigned** — three rows, the simplest rights position of the phase. **F-033.**
- **The content decision** — seven chapters of murder printed entire — is recorded as
  **F-034** for the Founder to revisit rather than taken quietly.
- **Cover series idiom**: painted, where COVER_STANDARDS gives Valice Classics as typographic.
  Same open decision as the other two. **F-031.**
