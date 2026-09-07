# PHASE 3 — the Codex Bestiarium expansion

**Five roadmap titles · six product volumes · 1,630 printed pages**
**Branch:** `feature/public-domain-phase-3` (from `origin/main` @ `415a1d5`)
**Opened** 2026-09-06 · **built** 2026-09-06/07

---

## The one-paragraph version

Five Victorian and Georgian folklorists, printed entire, each with an apparatus that says
where the material came from and what became of it. The fifth is published as two volumes at
its own author's division, because in one it would have exceeded the limit at which a
case-bound book can be made at all. Every book was attacked by an independent reviewer before
it was called finished, and the reviewer was right every time: it found eleven falsehoods in
the fourth book alone, nine of them contradicted by text that same volume prints. The phase's
lasting product is not a book. It is the checker written to make that class of error
impossible — `check_source_claims.py`, which asserts the apparatus's claims **about** the
source against the source.

---

## 1. The six volumes

| # | Title | Author | Series | Pages | Source words | Apparatus | Share |
|---|---|---|---|---|---|---|---|
| 1 | **Kwaidan** | Lafcadio Hearn | Classics 13 | 138 | 36,144 | 9,768 | **21.3%** |
| 2 | **Sea Monsters Unmasked** | Henry Lee | Classics 14 | 232 | 64,119 | 18,491 | **22.4%** |
| 3 | **The Book of Were-Wolves** | Sabine Baring-Gould | Classics 15 | 198 | 54,456 | 14,998 | **21.6%** |
| 4 | **British Goblins** | Wirt Sikes | Classics 16 | 390 | 112,594 | 29,223 | **20.6%** |
| 5a | **The Fairy Mythology, Vol I** | Thomas Keightley | Classics 17 | 336 | 101,835 | 14,376 | 12.4% |
| 5b | **The Fairy Mythology, Vol II** | Thomas Keightley | Classics 18 | 326 | 101,612 | 10,963 | 9.7% |
| | | | | **1,630** | **471,760** | **98,019** | **17.2%** |

Four of six clear the 20% floor. **The two Keightley volumes do not, and are recorded rather
than padded** — Article 2 forbids filler, and the Founder's standing instruction is that the
floor is a quality floor and not a word-count target. See **F-038**.

> **These figures were corrected on 2026-09-07**, at the end of the phase, when writing this
> report turned up a defect in `differentiation.py` — the instrument Article 2 is judged by.
> It counted *every* string in a content file, so each block's `kind` label ("p", "verse")
> scored as a word of the book, and a verse block, which carries both a joined `text` and its
> `lines`, was counted **twice**. All of it landed in the SOURCE denominator, so every
> reported share had been **understated** — most sharply in Fairy Mythology, where 10,175 and
> 10,853 words of Keightley's verse were counted double. The counter now skips structural keys
> and counts a block once; all six volumes were re-measured. Every share rose, and every book
> that met the floor still meets it. A measuring instrument that errs in the safe direction is
> still a broken instrument.

---

## 2. The two-volume decision

Keightley's *Fairy Mythology* runs to about 200,000 words. In a single volume, set as this
series sets a book and carrying the apparatus a Valice Classic carries, it would come to
something over six hundred pages — **beyond KDP's 550-page hardcover limit outright**, and at
a paperback price near $38.

The alternative to two volumes was not one volume; it was an abridgement, and this house does
not abridge a book to make it convenient. So: two volumes, **at Keightley's own `GREAT
BRITAIN` division**, which is one of his top-level headings. Volume I is his preface to the
end of Switzerland; Volume II is Great Britain to the end of the Appendix.

The halves come out at **99,871 and 100,134** of his words — within three hundred of each
other, without being adjusted. That is a fact about how he built the book, not about how it
was cut.

**One roadmap title. Two product volumes. Not a sixth title.**

---

## 3. What the adversarial reviews found

Every book was given to an independent reviewer with one instruction: *prove this book is not
ready.* Every verdict was NOT READY, and every one was right.

| Book | Findings closed |
|---|---|
| Kwaidan | 23 |
| Sea Monsters Unmasked | 29 corrections registered in the ledger |
| The Book of Were-Wolves | 30 |
| British Goblins | **11 P0** + 17 P1 + 19 P2 |
| The Fairy Mythology, I & II | **6 P0** + 21 P1 + a dozen P2 |

**Two are worth reading about.**

**The Fairy Mythology** was found to be **dropping 3,363 words of Keightley's footnotes** —
61 notes truncated, 19 printing as nothing — while four separate checks watched and none could
see it, because the count that was being made was of notes *found* rather than words *kept*. It
also carried a **fabricated authority**: William Hone, given fourteen and twenty-six citations
and a whole essay, is named **zero times** in either volume. And Hebrew was silently dropped
from both printed books by a font with no coverage, then — once that was fixed — printed
*backwards*, because ReportLab has no bidi. The full account is in the book report.

**British Goblins is the other.** Its entire critical apparatus rested on
the claim that Sikes introduces Edmund Jones and then *stops marking him*. Counted against the
source: after that chapter he names the Prophet Jones eleven more times, nine of them in Book
II, with four further footnotes. He marks Jones constantly. The claim was in four apparatus
passages, the Register, **both covers**, a companion sheet and the catalogue description.

Alongside it: Gwyn ap Nudd described as "a figure whom Sikes does not name" (named eleven
times, with a section about him); Rip Van Winkle "which Sikes does not mention once" (a
chapter section is *titled* after it); two chronology rows naming Olaus Magnus and Marie de
France, neither of whom appears in the book at all — imported from another book of the phase;
a plate provenance invented outright; and "four years in Wales" for a consul who served seven.

**The cause was one thing.** The source text was parsed carefully and the facts *about* it
came from Wikipedia and were never held against the parsed text. Eleven of twenty-five
verified claims cited `en.wikipedia.org` as sole evidence, including material Wikipedia itself
leaves uncited. Its "W. Howell" typo was inherited verbatim; the book prints "W. Howells".

---

## 4. The instrument this phase leaves behind

`scripts/factory/check_source_claims.py` — documented in
`docs/execution/public-domain/SOURCE_CLAIM_CHECKER.md`, 15 tests of which **five are
regressions replaying the actual British Goblins failures**.

`check_quotes.py` proves the quotations are the author's. This proves the statements **about**
the author are true of the book. A claims file names each assertion, the check, and *where in
the apparatus the claim is made*, so a failure points at the sentence to fix. Negative claims —
"the author never mentions X" — are first-class, because a negative claim is the highest-risk
sentence an editor can write: it cannot be confirmed by reading around it, only by counting.

It earned itself on its first run against British Goblins, finding three live errors including
a county count that had been "corrected" twice and was still computed over text that contained
the whole index.

`check_quotes.py` also gained `--italics`, because Keightley's apparatus quotes in italics and
the checker reported *checked: 0* against it — which passes, for the worst possible reason.

`check_source_claims.py` itself gained two things from the Keightley review, and both are
about the shape of a claim rather than its content. It can now assert a **floor** and not only
an equality (`"op": ">="`), because the claim that mattered most — *the words inside the 604
footnotes* — is a quantity that may legitimately rise, and a floor written as an exact number
has to be edited every time the parse improves; an assertion edited to match its output is not
an assertion. And a claim can now be marked **case-sensitive**, because the checker defaults to
case-insensitive and the negative claim *"Keightley never names William Hone"* failed against a
book innocent of it — on the Irish lament *"Oh hone, oh hone"*. A negative claim that matches a
lament can never pass, and a check that can never pass gets switched off.

`differentiation.py`, the instrument Article 2 is judged by, was found wrong at the end of the
phase and is discussed above.

---

## 5. Rights

| Book | Layers | Notable |
|---|---|---|
| Kwaidan | 4 | plates printed — the artist is datable |
| Sea Monsters | 11 | the *Field*'s cuts were the ILN's; two named artists, not one |
| Were-Wolves | 3 | **no illustration layer at all**, and none invented |
| British Goblins | 4 | 20 of T. H. Thomas's 21 drawings set; **the six music engravings REFUSED** — they are Lesley Halamek's of 2010 |
| Fairy Mythology | **5** | Cruikshank's frontispiece and seven anonymous 1850 script blocks used; **141 letter-images REFUSED** — the 2012 transcribers' work |

Twice in this phase a layer sitting inside a public-domain file turned out not to be public
domain, and both times the answer was to refuse it. In Keightley's case refusing it *improved*
the book: 141 letter-images became Unicode characters, so the Old English and Irish can be
searched, copied and read aloud. The mapping was established by reading each glyph **in the
words it spells** — *Munt-ælfen*, *Wulfes-fist*, *daine maiṫ*, *siaḃra* — never from file
names and never from shapes.

---

## 6. What is not done, and why

**Nothing is on sale, and no book can be.** Every volume of this phase is blocked on the
Founder's **Gate 2 (Rights)** signature, which no agent can give. Recorded as F-033, F-035,
F-037.

Also open: F-034 (seven chapters of murder printed entire — the decision, recorded rather than
taken quietly), F-036 (pricing at $19.99–$41.99, the engine's own recommendations, far above
anything this press has sold), F-038 (the Keightley apparatus below the floor), F-039 (five
**Phase 2** books complete, Paddle-provisioned and still held on Gate 2).

No Paddle product, no R2 master and no KDP listing exists for any Phase 3 volume. No ASIN,
ISBN or identifier has been invented for any of them.

---

## 7. Measured, per volume

| | Kwaidan | Sea Monsters | Were-Wolves | British Goblins | Fairy I | Fairy II |
|---|---|---|---|---|---|---|
| Coverage failures | 0 | 0 | 0 | 0 | 0 | 0 |
| Quotations not in source | 0 | 0 | 0 | 0 | 0 | 0 |
| EPUBCheck | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |
| Barcode zone clear | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| QR, measured in the PDF | 25.7% | 25.9% | 25.9% | 25.7% | 25.5% | 25.5% |
| Cover geometry | calculator row | calculator row | calculator row | calculator row | calculator row | calculator row |

Every cover dimension in this phase comes from a KDP Print Cover Calculator row read for the
book's actual final page count. Where a row did not exist it was fetched; where a build fell
back to the spine **formula** — Fairy Mythology Volume II's first cover did — the row was
fetched and the cover rebuilt rather than shipping an inferred figure.

---

## 8. The build order this phase settled

**Freeze the content → build the interior → read the calculator for the final page count →
build the covers.** British Goblins' cover was built three times because the count moved from
388 to 390 after review corrections; Fairy Mythology Volume I's moved 330 → 332 when the
companion QR was set. A cover built before the interior is final is a cover that will be
rebuilt.
