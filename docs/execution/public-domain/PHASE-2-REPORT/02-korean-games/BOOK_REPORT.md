# BOOK REPORT — Korean Games

**Stewart Culin, 1895 · Valice Classics 9 · slug `korean-games`**
**State: QA. Held on two Founder signatures (F-023) and one blocked live write (F-022).**

Built on branch `feature/public-domain-phase-2`. Not merged, not deployed.

---

## What this edition is

Culin's introduction and games LXX to XCVII — the games of chance, strategy and
divination — in six parts, with W. H. Wilkinson's chapter on Korean chess. Games I to
LXIX are 20,648 words of children's amusements in one-paragraph entries and carry none of
the argument; the scope was decided and recorded **before any apparatus was written**,
which is the order Phase 1 taught.

| | |
|---|---|
| Source | IA `koreangameswith00culigoog` — a **Google scan**, no per-word confidence |
| Games set | 28 |
| Source words | 43,822 |
| Editorial words | 13,108 — **23.0%** against a 20% floor |
| Printed pages | 144 (6 × 9 in, even for KDP) |
| Spine | 0.3243 in · wrap 12.5743 × 9.25 in · spine text allowed |
| EPUB | 801,755 bytes · EPUBCheck **0 errors, 0 warnings** |
| Original diagrams | 5 — four EVIDENCE, one RECONSTRUCTION |
| Claims | 12, every one VERIFIED against an external source |
| Price | ebook **$8.99** · paperback **$16.99** |

---

## What this scan needed that the last one did not

Falkener's scan came with per-word confidence and clean single-column pages. This one has
neither, and three problems had to be solved before a word of it could be set.

**1 · The detector had to be switched off.** The single-character-confusion detector that
found real errors on Falkener proposed **137 substitutions** here.
About a dozen were real; the rest were romanisations — `Kan`→`Ran`, `Oya`→`Ova`,
`sai`→`sat`. A detector cannot tell a misread English word from a correctly read Korean
one, and on a book that is a third transliteration that makes it a source of errors rather
than a finder of them. Only closed fault classes were applied: **11
corrections, 16 occurrences**, with 10
documented rejections.

**2 · Three sizes of type, three streams.** Culin sets his figures *into* the text and the
text wraps round them, so a caption's lines share their place on the page with the body
lines beside them. Read in the order a scan gives them, the caption is spliced through the
sentence — on one leaf the caption's last word was even hyphen-joined to the body's next,
giving *"From a native drawinKsize and the Pawns"*. Twenty-one leaves were affected, nine
of them in Culin's introduction. Body, footnote and caption are now separated by the size
of type they are printed in, measured against the **volume's** median rather than the
page's, because a page that is mostly caption has a caption-sized median of its own.
3,645 body lines, 516 footnote,
345 caption. A `Fig. 6` set inside a sentence as a
cross-reference is body-sized and stays where Culin put it.

**3 · Lines are read across the page, not down it.** The OCR breaks a printed line in two
wherever the spacing widens and gives the halves y-centres two pixels apart. Sorting on y
alone produced *"Those purchased by the monk and a nun, writer in 1892 represent a"*.

**And what could not be read is marked, not smoothed.** 502 runs of Korean,
Chinese and Japanese script the OCR reads as nothing carry a marker saying so.
36 passages — about 598 words — are the scanner's reading of a line
figure or of the ghost a tissue guard prints onto the facing page; each is marked in place
and **listed with what the scanner made of it in `QA/debris.json`**, so the refusal can be
checked rather than believed. Every large one was verified to duplicate text that IS
printed elsewhere in the edition.

---

## Wilkinson's illustrative game, rebuilt

Page 89 of the original sets thirty moves in two columns with Wilkinson's comments between
the rows. Read as prose — which is what every digital text of this book does with it,
including the one this edition started from — it comes out as *"takes takes 7 h"* and
*"to I e to"*. It is rebuilt here from the position of every word on the page:
**30 moves, 5 comments, 0 cells left
unread**, and Culin's footnote crediting Wilkinson recovered from the foot of the same page.

**Which column is which was read off the page, not assumed.** The heading *Red.* sits at
x=1341 and *Green.* at x=2574, so Red is the left column; the paragraph parse had them the
other way round, which would have inverted the whole game. The reading is independently
corroborated by Culin's own worked examples elsewhere in the chapter, where Green's King
stands on the a and b ranks and Red's on i and j — exactly as the rebuilt game has them.

A move is corrected only where the notation's own grammar proves what the token has to be
— piece, file 1–9, rank a–j, *to* or *takes*, destination — and only where exactly one
reading survives that test. 16 repairs were proved that way.

---

## The apparatus

- **Introduction** — Culin had never been to Korea and says so in his second paragraph.
- **A Register of Record and Inference** — six rows, one per part: what he records at first
  hand, what he is told, what he concludes, and how to read the difference.
- **A Note on the Spellings** — sixteen rows bridging his 1895 romanisation to Revised Romanization and McCune–Reischauer.
  No edition of this text has supplied that bridge before.
- **The playing guide** — six games you can sit down and play, each with *how complete
  Culin's account is*, and a section on **what cannot be played from this book at all**,
  because a guide that lists only its successes is advertising.
- **5 original diagrams**, drawn with cairo from Culin's descriptions.
- **Who Is Being Talked About**, **The Terms**, a **chronology**, **The Plates That Are Not
  Here**, and an index of 31 subjects generated from the text.
- **An editorial division inside game XCII.** Culin's running head reads PLAYING-CARDS from
  the first page of XC to the last page of his comparative account — twenty-eight leaves
  under one head — so the material stands where he put it. But fourteen of those pages are
  Japanese hanafuda and Chinese money-suited packs, and a contents line reading
  "XCII · Tong-tang" over them tells the reader something false. The heading is the
  editor's and is marked as such on the page and in the contents.

---

## Rights

**GREEN for the text, RED for the images.** Culin d. 1929, Wilkinson d. 1930; the 1895 US
imprint settles the United States on its own. **No illustration from the volume is
reproduced.** Culin names Ki San — Kim Chun-gŭn, whose drawings the Smithsonian holds,
bought from Mary A. Shufeldt in 1901 — and Teotiku Morimoto of Tokyo, and **no death year
is recorded for either**, so there is no calculation to make. The rest are unattributed.

---

## The adversarial review, and what it found

Run under the instruction *prove this book is not ready*. Six substantive faults, all
fixed before this report:

1. **The McCune–Reischauer form of `pa-tok` was wrong** — printed `pat'uk`, where the
   apostrophe marks an aspirated ㅌ the word does not contain. It is `paduk`. This was in
   the conversion table the edition advertises as its scholarly contribution, and on the
   free companion card. The other fifteen rows were re-audited; the remaining five
   apostrophes are genuine ㅍ/ㅌ aspirates.
2. **Figure captions were being set inside Culin's sentences** on twenty-one leaves, nine
   of them in the introduction. Fixed by the type-size separation above.
3. **Two fragments of the same printed line were ordered by a two-pixel y difference**
   rather than by their position across the page.
4. **The playing guide gave kon-tjil nine men a side** — the European game's number.
   Culin has the players fill all twenty-four points, which is **twelve** each, and a
   captured man is not lifted but marked in place under its captor until the board fills.
   The whole entry was describing nine men's morris rather than the game Culin recorded.
   Worse, the companion card's build-time check compared the card against the guide and
   passed, because both were wrong; the check now consults **Culin's text**, and was
   tested by feeding it the false claim to confirm it bites.
5. **The nyout entry mis-stated the throws and invented a gap.** Culin's *mo* — four black
   faces, none white — counts **5**, not zero; and the guide told the reader that the
   extra-throw rule "is not in this text" when Culin states it plainly. Rewritten from his
   account, and every claim in it verified against his words.
6. **"Culin gives nyout eleven pages, more than any other game"** — game XCII runs twenty
   printed pages and LXXXIX twelve. Corrected to what is true and more informative: nyout
   is the longest treatment of a Korean game *as a game*, and the two longer numerals are
   long because he hangs his comparative account on the last numeral of a group.

Two further defects were found and fixed outside the book:

- **The index had two headings that pointed at almost everything** — "China, games of" at
  25 of 28 games and "Japan, games of" at 24. The builder already refused a heading that
  matched nothing; it now refuses one that matches more than 60% as well, and the two are
  replaced by the particular Chinese and Japanese games Culin compares, indexed by name.
- **Book 1 had no storefront preview at all** — it had gone through the whole pipeline
  with nothing to read on its page. Added, and trimmed to three pages when the catalogue's
  own test showed four would exceed 5% of a 78-page book.

---

## Verification

| Check | Result |
|---|---|
| `measure.py` apparatus floor | **23.0%** ≥ 20% |
| EPUBCheck 5.1.0 | 0 fatals · 0 errors · 0 warnings |
| Fonts embedded in the interior | LiberationSerif, LiberationSerif-Bold, LiberationSerif-BoldItalic, LiberationSerif-Italic — all embedded |
| Page count even for KDP | 144 |
| Contents page numbers | iterated to a fixed point; the build fails if they move |
| The book's own numbers | every one substituted from `counts.py`; the interior refuses to build if the count it prints disagrees with the pages |
| `claim-lint` · `rights-lint` · `metadata-lint` · `compliance-lint` | clean |
| `kdp-linkage-lint` | COMPLETE |
| Companion QR | 4 assets · QR at 29% of usable height |
| `npm run lint` · `npx tsc --noEmit` · `npm run build` | clean |
| `validate-catalog` | 45 pass · 10 errors, **all** the companion 404s that resolve on deploy |

---

## Held on

- **F-022** — the Paddle product and price. One command, refused by this environment.
- **F-023** — gates 2 and 5, which only the Founder can sign.
- The companion page and its four sheets are built and prerender locally; their URLs 404
  until this branch is deployed. That is the same condition Book 1 is in.
