# Phase 3, Book 2 — *Sea Monsters Unmasked, and Sea Fables Explained*

**Henry Lee, 1883. Valice Classics 14. Built 2026-09-06. Not deployed, not listed, not sold.**

---

## What it is

Two shilling handbooks, written seven weeks apart for the International Fisheries Exhibition
at South Kensington and sold at the gate, printed here entire with all sixty-eight of their
figures. Lee takes the sea monsters one at a time and explains most of them away: the kraken
is a giant squid, the mermaid a dugong, the hydra and Scylla the octopus, the whale's spout
is breath, the paper nautilus does not sail, and the barnacle goose is a goose. The great sea
serpent he cannot solve, and says so — which is why that chapter has aged best of all.

| | |
|---|---|
| Pages | **232**, 6 × 9, even, no filler leaf needed |
| Lee's words printed | **62,018** — 8 chapters, 2 prefaces, 100 footnotes |
| Editorial apparatus | **18,491 words, 22.38%** against a 20% floor |
| Figures | **68 of 68**, at the size their scans honestly support |
| Coverage | 99.71% of the source body; **0 boilerplate leaks**; 10/10 pieces open and close as the source does |
| Quotations | **21 checked against the source, 0 not his** |
| Claims | **41 registered, all verified, 29 corrected by verification** |
| Paperback | 12.772 × 9.25 in, 0.522 in spine — calculator row read for 232 pp |
| Hardcover | 14.286 × 10.417 in, 0.711 in spine — calculator row read for 232 pp |
| EPUB | 3.64 MB, 68 plates, **EPUBCheck 0 fatal / 0 error / 0 warning** |
| Companion | 4 sheets, QR **25.9% of usable page height**, 1.45 mm modules, independently decoded |


> **Re-measured 2026-09-07.** A defect was found in `differentiation.py`, the instrument Article 2 is judged by: it counted every string in a content file, so each block's `kind` label scored as a word of the book, and a verse block carrying both `text` and `lines` was counted twice. Those words inflated the SOURCE denominator, so the share had been **understated**. The counter now skips structural keys and counts a block once; all six Phase 3 volumes were re-measured. The figure above is the corrected one, and this book still clears the floor.


## What this edition does that the free text does not

- **A head-note before each of the eight chapters**, each ending in **Reading against him** —
  the specific thing in that chapter a modern reader should resist. That second half is where
  the edition disagrees with its author, and it is the reason to buy it.
- **A Register of Evidence and Inference**: what Lee watched, what he was told, what he read,
  what he concluded, chapter by chapter. It closes on the two places where the instrument
  slipped — both of them cases of looking at a picture and calling it observing.
- **A descriptive list of all 68 plates**, each marked as evidence of an animal, evidence of a
  belief, or decoration.
- **A note on the captions.** Every figure is captioned twice, under the plate and again in the
  List of Illustrations, and in **nine places the two say materially different things**.
  Figure 24 of the first handbook is a **skeleton** — only the List says so. Figure 11 of the
  second is "Christian symbol" under the plate and "Seal, drawn as a fish" in the List.
- **Lee's hundred footnotes**, printed as their own section.
- A casebook of the named sightings, a who's-who of his authorities, a glossary, a register of
  the creatures, the picture credits as a table, a chronology, four short essays, and an
  account of what has been established since 1883.

## What the build had to solve

**All one hundred footnotes were landing inside the last chapter.** The transcription gathers
every footnote of both handbooks into one run of divs at the end of the file, so a walker that
assigns blocks to whichever section is open gave the whole hundred to *Barnacle Geese*, which
printed its own text and then a hundred unlabelled paragraphs about Pontoppidan's dates. They
are lifted out and set as their own section — and **footnote 41 brings a plate with it**:
figure 11, the seal from the Roman catacombs, was stranded a hundred pages from the chapter it
belongs to.

**Two pairs of plates share one caption.** Figures 9 and 10 of the second handbook are set side
by side under a single caption, and figures 21 and 22 likewise. Read plate by plate they look
uncaptioned — which is what an earlier draft of this apparatus told the reader, having
described all four from the engravings without noticing that the book had already named them.
They are set as pairs here, each keeping its own figure number, because Lee cross-references
them three lines below: *"on the obverse of Fig. 9 is the head of Nero, and on that of Fig. 10,
the head of his grandmother Agrippina."*

**228 transcriber's page markers** were printing mid-sentence — `[Pg 12]` between "from being"
and "an emblem". The first regex missed the front matter, which is foliated in roman.

**Eight bracketed transliterations of Greek** are restored to Greek. Six are the ΙΧΘΥΣ acrostic
in footnote 41, which Lee glosses word for word in the same sentence; two are the legend of a
coin of Syracuse. Anything the edition could not identify with certainty would have been left
as found and reported; nothing was.

## What the review found

An independent reviewer, which did not write the book, was told to prove it was not ready. It
raised **29 defects**. It was right about essentially all of them, and three were serious.

**The first P0 was a fabricated quotation** — caught earlier by the build's own checker, not by
the reviewer. An editorial note was headed *"I find that this mosquito…"*, attributed to Lee.
The word *mosquito* does not occur anywhere in either handbook. It had drifted in from
Kwaidan's claims ledger, which discusses Hearn's essay on mosquitoes. `check_quotes.py` exists
because a fabricated quotation shipped in Phase 2; it has now caught a second one before print.

**The second P0 was the companion address, printed broken.** Set at 13.5 pt it was a tenth of
an inch too wide for the measure and wrapped after `sea-monsters-unmaske`, leaving a lone `d`
centred on the next line — a dead address, on the one page whose entire job is the bridge. The
size is now computed from the string at build time.

**The third P0 erased a lender from the rights record.** `RIGHTS.md` gave the ***Field***'s
five cuts to the *Illustrated London News* and dropped the three the *News* actually presented.
The *Field* — whose permission Lee records in three separate places — appeared nowhere in the
edition or its rights record, and the copyright page nonetheless asserted that every layer was
assessed. Two further layers were missing entirely: **Messrs Longman**, for two woodcuts from
Tennent's *Ceylon*, and **Ellen Caroline Woodward**, who drew the swimming and erect squids
from Lee's rough sketches. She is the second of the book's two named individual artists — the
rights record had claimed there was one — and the only figure layer by a named person whose
dates nobody had established, which made her the only one where the term might still have been
running. She is **1859–1943**; it expired at the end of 2013. The table went from five rows to
eleven.

**The best of the P1s.** The enaliosaurian hypothesis was attributed to Gosse in eight places
and twice called "a surviving plesiosaur". Lee's own printed text, on page 87 of this edition,
says **Edward Newman** advanced it, Gosse took it up emphatically, and *"neither he nor Mr.
Newman insist that the 'great unknown' must be the Plesiosaurus itself."* Newman — the man to
whom Lee says *"the fullest acknowledgments are due"* — had no entry in the who's-who at all.
Separately, two passages had escalated a defensible claim (not *photographed* alive until 2002)
into "not *seen* alive by anybody", which Lee refutes in his own book: he prints the *Alecton*
of 1861, a squid found alive at Coomb's Cove in 1872, and the Conception Bay animal that shot
out its tentacles at the men who found it.

Also fixed: 76 literal `&lt;br/&gt;` printing on the page — the fifth form of Phase 2's
"`rl()` escapes markup" rule, and the first that is a self-closing tag; running heads reading
`Barnacle Geese—goose Barnacles` across forty pages, because the title-caser capitalised the
character after an em dash rather than the letter; two contents entries with no folio; part
titles carrying folios; a scorecard whose tally disagreed with its own list; and a claim that
the barnacle-goose chapter was the longest of the second handbook, when the mermaid chapter is
nearly twice as long.

## Where the edition still disagrees with Lee

- **The fish-gods.** The plates that open the mermaid chapter rest on a reading of Dagon that
  scholarship has abandoned. The name is now referred to grain, not fish; the fish reading is
  late, first attested in a fourth-century glossary; and the figures are Mesopotamian
  apotropaic creatures belonging to Ea. Lee prints **both** forms and captions both Dagon:
  figure 2 is fish-bodied, figure 3 is a bearded man wearing a fish skin with his own legs
  visible below. A man wearing a fish is not a man made of one.
- **The sirenian in the wrong ocean.** Dugongs and manatees are tropical; a great many mermaid
  reports come from Norway, Greenland and the North Atlantic. Seals are the candidate Lee never
  takes up — and in footnote 41 he prints a seal drawn as a fish and remarks on it, which is the
  mermaid's whole mechanism, noticed and filed under Christian symbolism.
- **The barnacle goose.** Lee explains six hundred years of belief by a resemblance. The fact
  that carries it is that the bird breeds in the Arctic and was never seen to nest in Europe —
  and he prints that too, quoting a 1662 record of Dutch seamen who declared in 1569 that they
  had seen the geese on their eggs at Nova Zembla. He praises the investigation and does not
  notice that it dissolves his puzzle.

## What is not done

- **Not deployed.** Phase 3 is unmerged by instruction. The companion page and its four sheets
  404 against production, as Kwaidan's four do, for the same reason.
- **No Paddle product**, so `paddlePriceId` is null and the ebook is `coming_soon`.
- **No R2 masters uploaded**, so `masterFileKey` and `epubFileKey` are null.
- **No KDP listing**, so `kdp: "not_created"` and no ASIN is invented.
- **Gate 2 unsigned** — and its table was rewritten during review, from five rows to eleven.
  **Founder F-032.**
- **Cover series idiom**: a painted cover where COVER_STANDARDS gives Valice Classics as
  typographic. Same open decision as Kwaidan, **F-031**. Title band 15.2% against a 25% rule;
  thumbnail contrast 0.99.
