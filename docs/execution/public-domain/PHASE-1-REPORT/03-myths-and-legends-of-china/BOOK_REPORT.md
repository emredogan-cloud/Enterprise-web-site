# BOOK 3 — Myths and Legends of China: Volume One, The Gods

**Valice Classics 5 · Lane C · slug `myths-and-legends-of-china`**
**Built 4 September 2026 · State: RESEARCH · Gates 2, 4, 5, 9 passed · NOT PUBLISHED**

> Status in one line: **built, validated end to end, and staged.** This is the book that
> was BLOCKED at 13.3% original matter against a 20% floor. It is not blocked any more,
> and the way out was not more apparatus — it was a smaller subject.

---

## 1. Why this book was blocked, and what actually fixed it

Werner's twelve narrative chapters are 63,857 words. The apparatus that was *genuinely
warranted* came to 9,797 words — **13.3%**, against a series floor of 20%. Closing a gap
that size would have meant roughly six thousand words of writing nobody needed, which the
constitution forbids in as many words.

The Founder's decision was to split the book. It is the right decision for a reason that
only becomes visible once you look at what the chapters *are*:

| | Chapters | Words | What they are |
|---|---|---|---|
| **Volume one (this book)** | III, V, VI, VII, VIII, IX, XI, XIII | **31,210** | The divine order: creation, the ministries that run the natural world, the Immortals, a war in heaven |
| Volume two (scoped, unbuilt) | X, XII, XIV, XV | 31,744 | Four long legend cycles, each built around one figure: Kuan Yin, the Guardian, Monkey, the fox-spirits |

The two halves are almost exactly the same size, and they are different kinds of book.
The eight chapters here describe a *system* and explain one another. The four held back
are sustained narrative. Splitting on that seam produces two books that each have a
subject; keeping them together produced one ninety-thousand-word book whose first half is
a constitution and whose second half is a set of novels.

**The floor was met by choosing a smaller subject, not by padding.** The apparatus grew
by 850 words in the process — an introduction rewritten for the volume it actually
introduces, and one new component (below) that the volume genuinely needed.

## 2. Source

| | |
|---|---|
| Primary | Project Gutenberg ebook **15250**, fetched 2026-09-04 |
| SHA-256 | recorded in `QA/parse-report.json` |
| Edition reproduced | London: George G. Harrap & Co. Ltd., 1922 |
| Parse result | **8 chapters, 121 sections, 31,210 words, 16 of Werner's footnotes, 0 anomalies** |
| PG marks | header, footer, licence and trademark stripped; strip asserted by the parser, `pg_strip.clean: true` |
| Repaired | **1** mangled tag, counted in `totals.tagResidueRepaired` (see §8) |

## 3. Rights

**Signed at Gate 2.** `RIGHTS.md` + ledger rows **RL-0040 … RL-0043**. `rights-lint.mjs`
passes on 50 ledger rows.

| Layer | Creator | Death | US | EU / UK / TR |
|---|---|---|---|---|
| The work | E. T. C. Werner | **1954** | PD (pub. 1922 < 1931) | PD since **1 Jan 2025** |
| The plates (32) | **"Chinese Artists" — no individual named** | — | **not cleared** | **not cleared** |
| Werner's footnotes | E. T. C. Werner | 1954 | same as the work | same as the work |
| The transcription | PG volunteers (2005) | — | PD; marks stripped | PD |
| The apparatus | Valice Press | — | valice-original | valice-original |

**There is no translation layer.** Werner wrote in English and translated from the Chinese
himself. That is unusual on this shelf and it removes the exact failure that cost Valice a
Seneca edition, where a translator's death year was read off a volume's imprint date.

**The date is recent and it matters.** Werner cleared life+70 on 1 January 2025 — twenty
months before this edition. Valice's own earlier research still records this title as
encumbered outside the United States. That older note is simply out of date.

## 4. The plates, and a correction worth recording

The first draft of the rights position said "no source consulted names the artist." That
was *imprecise*, and the imprecision was found by reading the title page rather than
trusting the summary:

> **With Thirty-two Illustrations in Colours by Chinese Artists**

The plates **are** credited — to a collective, with no individual named, there or in the
text or in the Project Gutenberg record (which lists this book's agents by role and
carries no Illustrator row; verified against the live record on 2026-09-04). The
conclusion is unchanged and now rests on firmer ground: **a collective credit yields no
death year, so life+70 cannot be applied.** Nine of the thirty-two fall inside these
chapters and all nine were dropped. RL-0041 is RED and says "not cleared, not used" — a
row that says that is auditable; a missing row is not.

## 5. Differentiation — measured, not asserted

| | Words | |
|---|---|---|
| Werner (source) | 31,716 | including 506 words of his own footnotes |
| **Valice (editorial)** | **9,133** | |
| Total | 40,849 | |
| **Editor share** | **22.4%** | floor 20% → **PASS**, with margin |

Measured by `BUILD/measure.py` from the manuscript on every build. The number printed in
the book's own source note is read from that file, not typed.

## 6. What the edition adds

| Component | Size | Note |
|---|---|---|
| Introduction | 2,532 w | rewritten for this volume; every count in it is measured |
| Chapter introductions | 8 | one per chapter |
| **Register of the Ministries** | 9 rows | **new for this volume** — see below |
| Who Is Who | 25 figures | chapter references *searched*, not asserted |
| Chronology | 15 rows | two inherited errors corrected (§7) |
| A Note on the Names | 407 w | what the apostrophe and the breve do in Wade-Giles |
| Index of Subjects | 30 headings | generated from the text |
| Four Ways In | 4 paths | |
| Source note | 827 w | records the split, the plates and the repair |

**The Register of the Ministries is the reason this volume works.** Werner's own catalogue
of the celestial administration is chapter IV — one of the chapters this edition never
prints. So the framework it would have supplied was rebuilt from the chapters that *are*
printed: nine ministries, each with the officers Werner names and the chapter to read.
Where he names no President, the register says so instead of inventing one. Every row is
a quotation traced back to the source (claims C-001 … C-010).

That is the test for whether apparatus is warranted or padding: this component answers the
question the book itself raises on its first page, and it could not have been written for
any other selection of chapters.

## 7. Facts

**Gate 5 signed. 30 claims, all VERIFIED — each by a check, not by assertion:**

- **16** are verbatim quotations, located in `SOURCE/raw/pg15250.html` by search at build time
- **10** are measurements read from `QA/differentiation.json` and `QA/parse-report.json`
- **4** were verified against the Project Gutenberg authority record and a biographical source

**Three errors were found and corrected in the process:**

| Was | Is | How it was caught |
|---|---|---|
| Werner "born in Scotland to an English family" | Born at **Port Chalmers, Dunedin, New Zealand** — the middle name is the place | checking a claim that had no source |
| "1884–1917 … thirty-three years" | Arrived in Peking in the 1880s; **left the consular service in 1914** | same |
| Chapter IV "twenty-four-thousand-word catalogue" | **23,442 words** → "twenty-three-thousand" | measured with the parser's selection widened |

## 8. Two defects found in the data, and fixed

**A false match in the glossary index.** The hand-made `name-locations.json` sent readers
to chapter X for **P'an Ku**. Chapter X does not contain P'an Ku; it contains **P'an
Kuan**, the judge of the underworld — a different figure whose name merely starts the same
way. A second one was worse: the glossary identified **Yen Wang** as Yama, king of hell,
on the strength of two occurrences in chapter VII — where the text actually reads "**Yen
Wang, Prince of Yen**", a mortal governor in the Peking water legend.

Both are exactly what the apparatus promises never to do. `BUILD/build_names.py` now
derives every chapter reference by whole-name search, and it was validated by reproducing
the twelve-chapter numbers before being trusted on the eight. The P'an Ku reference was
corrected; the Yen Wang entry was removed.

**A double-escape in the parser.** The PG transcription stores HTML entities, and the
parser kept them, so the typesetter escaped them again and the printed page read
`ti chih&gt;` inside Werner's sentence. Entities are now decoded once, at parse time.
The stray `>` itself turned out to be a mangled comma — the parallel phrase in the same
sentence carries its comma inside the tag (`<i>t'ien kan,</i>`) — so it is repaired rather
than reproduced, and the repair is counted in `totals.tagResidueRepaired` so that it is a
decision on file rather than a silent edit.

## 9. Files produced

| File | Facts |
|---|---|
| `OUTPUT/interior-main.pdf` | **108 pp**, 6×9, all fonts embedded, preflight clean |
| `OUTPUT/myths-and-legends-of-china.epub` | epubcheck **0 fatals / 0 errors / 0 warnings**, 19 documents, chapter cross-links live |
| `ASSETS/cover/front-v1.png` | 2400×3600, sRGB embedded, title 31.5% of height, thumbnail contrast 0.94 |
| `ASSETS/cover/paperback-wrap-v1.pdf` | 12.4932 × 9.2500 in, spine 0.2432 in, preflight clean |
| `ASSETS/cover/kindle-v1.jpg` | 1600×2560 |
| `ASSETS/companion/*.pdf` | 4 sheets, also served from the site |
| R2 masters | PDF + EPUB uploaded and **content-verified** against the local files |

The interior is typeset deliberately **odd (107 pp)** so that the companion leaf the house
pipeline appends makes the final count even, which KDP requires.

## 10. Price

| Format | Proposed | Basis |
|---|---|---|
| Direct ebook | **$9.99** | nets $8.99 after Paddle. 22.4% apparatus is above the floor but short of the 35% premium tier, so the same price as the other Classics |
| Paperback | **$13.99** | prints at $2.30 (flat rate under 110 pp); nets $6.09 at 43.6% |

**The paperback is deliberately priced below Epictetus's proposed $16.99.** This is a
108-page book against a 176-page one, and pricing them level would be charging the same for
less. The Founder signs the price at Gate 8.

## 11. Format decisions — made, with reasons

- **No Kindle at launch.** KDP caps public-domain content at the 35% royalty tier, and the
  Kindle store already carries free Werner editions. Discovery channel, not revenue.
- **No hardcover, no large print.** At 108 pages a hardcover would compete with established
  mythology hardbacks at a price this edition has not earned; large print would roughly
  double the extent with no demand evidence. Both deferred, with the reasons on file.

## 12. Companion

`valicepress.com/companion/china-gods` — built by the house pipeline
(`scripts/factory/build-companion-pages.mjs`), which appended the leaf, read the file back
to confirm the page count and the printed address, and decoded the QR module-by-module
against the URL it carries: **p.108, QR 29% of page height, 1.71 mm per module** against a
0.5 mm print floor.

Four free sheets, all built from the same content files as the book: the ministries
register, who-is-who, four ways in, and the note on the names.

## 13. Gates

| Gate | Status | |
|---|---|---|
| 1 Market | not started | no Amazon access in this environment |
| **2 Rights** | **passed** | signed, RL-0040…43 |
| 3 Originality | not started | |
| **4 Content** | **passed** | 22.4% measured |
| **5 Facts** | **passed** | 30/30 verified |
| 6 Editorial | not started | |
| 7 Cover | not started | founder signs |
| 8 Interior | not started | founder signs; **a physical proof is recommended** — the block changed thickness when the leaf was appended, so the wrap is new and unproved |
| **9 Metadata** | **passed** | metadata-lint clean |
| 10 Compliance | not started | compliance-lint clean; founder signs |
| 11 Website QA | not started | |
| 12 Publish | not started | founder signs |

## 14. Why it is still `draft`

**One dependency: Paddle.** The only Paddle key in this environment is a sandbox key
(`pdl_sdbx_…`) that returns **403 on every endpoint**, including read-only product
listing. No price can be created. The catalogue's own test — *"publishes nothing that
cannot be either bought or linked"* — refuses a published page for a book nobody can
obtain, and it is right to.

One line changes when a live key exists: provision, paste the `pri_` into
`paddlePriceId`, set the ebook to `available`, set `websiteStatus` to `published`.

## 15. Final state

Built, measured, rights-signed, fact-checked, preflighted, uploaded to R2, spliced,
packaged for KDP, and catalogued as `draft`. **Volume two is scoped and unbuilt**, and
this volume's apparatus refers to it as forthcoming — which is a promise the house now
has to keep.
