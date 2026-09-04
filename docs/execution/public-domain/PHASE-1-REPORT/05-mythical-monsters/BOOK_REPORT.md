# BOOK 5 — Mythical Monsters: Volume One, The Dragon

**Valice Classics 7 · Lane C · slug `mythical-monsters`**
**Built 4 September 2026 · State: RESEARCH · Gates 2, 4, 5, 9 passed · NOT PUBLISHED**

> Status in one line: **built, validated end to end, and staged.** This is the one book in
> Phase 1 whose central thesis is false, and the apparatus is built around saying so.

---

## 1. The problem this book poses

Charles Gould believed dragons were real animals — large reptiles that lived alongside
early humans and became extinct within historical memory. He is wrong, and no amount of
editorial sympathy changes that.

He was also the first Government Geologist of Tasmania, trained at the Royal School of
Mines, a veteran of the Geological Survey of Great Britain, and the son of John Gould the
ornithologist. The argument he builds across chapters I to V is disciplined: species do go
extinct; humans are far older than the biblical chronology allowed; traditions dismissed as
fable sometimes turn out to record events; myths demonstrably travel and degrade.

What kills it is a number nobody in 1886 could supply. The geological timescale was known
to be vast and was not yet calibrated; the interval between the last great reptile and the
first human — sixty-six million years — was not available to him. **He is reasoning
carefully into a hole in the evidence**, which is a different failure from carelessness and
a far more instructive one.

Publishing this required deciding what an honest edition of a wrong book looks like.
Dropping the thesis silently would be dishonest. Printing it silently would be misleading.

## 2. What the edition does about it

**A Register of Claims.** Six assertions carry the book. Each is set out in three parts:
what Gould claims, what is actually established, and an editorial reading of the
difference. This is the apparatus the Founder's brief for this title asked for — source
claim, current fact, editorial interpretation kept visibly apart — and it is the component
the volume exists for.

The register does not correct his text. It gives the reader an instrument, because Gould's
prose is equally confident whether he is reporting a source, reporting a fact, or drawing a
conclusion, and he never marks the transitions.

**A graded source list.** Gould cites across three thousand years in one tone. The back
matter sorts what he uses into four kinds and says what each is worth:

| Kind | Weight |
|---|---|
| The Chinese classics — *Shan Hai King*, *Yih King*, *'Rh Ya*, *Păn Tsao Kang Mu* | **Genuinely old, honestly used.** The best evidence in the book. |
| The classical authors — Pliny, Aristotle, Diodorus, Ammianus | Repeating travellers' tales, mostly quoting one another |
| The Renaissance naturalists — Gesner, Aldrovandus | Compiling from those, with pictures |
| Victorian newspapers — *North China Herald*, *Straits Times* | **Not evidence.** |

**The best row in the register is the one that costs Gould.** In chapter VII he separates
what he takes to be the original *Shan King* from later material and reports that in that
older, more credible portion, references to dragons are **infrequent**. He damages his own
case, in the chapter he wants to be his strongest, and prints it anyway. That is the
clearest evidence that he was arguing rather than advocating, and it is why the book is
worth publishing.

## 3. Source and scope

| | |
|---|---|
| Primary | Project Gutenberg ebook **40972**, fetched 2026-09-04 |
| Edition reproduced | London: W. H. Allen & Co., 1886 |
| Parse result | **3 chapters, 22,570 words, 0 anomalies** |
| PG marks | stripped; `pg_strip.clean: true` |

Chapters VI, VII and VIII are Gould's whole treatment of one creature. Chapter IX, on the
sea-serpent, is 25,000 words and becomes volume two; the unicorn and the Chinese phoenix go
with it. Chapters I to V are not printed in any planned volume: they are the framework, and
the introduction supplies what a reader needs of them.

## 4. Rights

**Signed at Gate 2.** Ledger rows **RL-0059 … RL-0061**.

The simplest position of the five Phase 1 books: one author, dead since 1893, writing in
English. Public domain in the United States since long before the 1931 line and in the UK,
EU and Türkiye since **1 January 1964**.

**The figures are the only red.** Thirty-three fall in these chapters; the PG record carries
no illustrator, the figures are unsigned, and no source names who drew them. All thirty-three
were dropped — **and their captions with them**, because a caption describing a picture the
reader cannot see is worse than no caption. Where a figure carried argument, the chapter
introduction says what it showed.

## 5. Files produced

| File | Facts |
|---|---|
| `OUTPUT/interior-main.pdf` | **74 pp**, 6×9, fonts embedded, preflight clean |
| `OUTPUT/mythical-monsters.epub` | epubcheck **0 / 0 / 0** |
| `ASSETS/cover/front-v1.png` | title **30.1%** of height, thumbnail contrast 0.95 |
| `ASSETS/cover/paperback-wrap-v1.pdf` | spine 0.1666 in, preflight clean |
| R2 masters | PDF + EPUB uploaded and content-verified |

## 6. Facts

**Gate 5 signed. 16 claims, all VERIFIED:** 8 verbatim quotations located in the source by
search, 4 measurements from the QA files, 4 against the PG record and biographical sources.

One claim initially failed its check because the transcription's `[Pg 160]` page-break
marker falls **inside** the sentence being quoted. The verifier now normalises those markers
away — a quotation should not fail verification for spanning a page turn.

## 7. A tool defect found and fixed

`metadata-lint` exempts four-digit years from its "don't quote an unmeasured number" rule,
and its window started at **1900**. Every pre-1900 title fails it: the year in "Complete in
the 1886 Text" is not a claim about a quantity. The window is now 1400–2100, and all five
Phase 1 books re-lint clean. A public-domain house will meet this constantly.

## 8. Price

| Format | Proposed | Basis |
|---|---|---|
| Direct ebook | **$9.99** | nets $8.99 after Paddle |
| Paperback | **$11.99** | prints at $2.30; nets $4.89 at 40.8% |

A dollar under the Mackenzie volume because it is twenty pages shorter — the same principle
applied down the whole series.

## 9. Companion

`valicepress.com/companion/the-dragon` — spliced by the house pipeline: **p.74, QR 29% of
page height, 1.73 mm per module**.

## 10. Final state

Built, measured, rights-signed, fact-checked, preflighted, uploaded to R2, spliced,
packaged for KDP, and catalogued as `draft` — for the one reason all five share.
