# BOOK 4 — Indian Myth and Legend: Volume One, The Vedic Gods

**Valice Classics 6 · Lane C · slug `indian-myth-and-legend`**
**Built 4 September 2026 · State: RESEARCH · Gates 2, 4, 5, 9 passed · NOT PUBLISHED**

> Status in one line: **built, validated end to end, and staged.** This is the first book
> in the phase where the scope was sized against the apparatus floor *before* the apparatus
> was written, which is the lesson Werner taught at some cost.

---

## 1. Scope decided in the right order

Werner was blocked because its selection was chosen first and measured afterwards. Here the
measurement came first.

Mackenzie's twenty-six chapters are about 140,000 words. A realistic apparatus for this
kind of book — introduction, chapter introductions, a who's-who, a chronology, a names
note, a register, a source note — comes to roughly 7,500 words. That fixes the selection
before a word of it is written:

| Candidate volume | Chapters | Source words | Apparatus needed for 22% | Verdict |
|---|---|---|---|---|
| All the Vedic material | I–VIII | 44,519 | 12,554 | too big |
| **The Vedic gods** | **I, II, III, IV, VI** | **26,956** | **~7,600** | **chosen** |
| + New Faiths | + VII | 32,752 | 9,239 | 19.8% — under floor |

Chapter V is a social history of the Vedic age — the same shape as Werner's excluded
sociology chapter. Chapters VII and VIII belong with the epics. The Mahabharata cycle, the
Nala romance and the Ramayana are roughly 100,000 words and become volumes two to four.

**Measured result: 21.5%**, and not a padded sentence in it.

## 2. Source

| | |
|---|---|
| Primary | Project Gutenberg ebook **47228**, fetched 2026-09-04 |
| SHA-256 | recorded in `QA/parse-report.json` |
| Edition reproduced | London: Gresham Publishing Company, 1913 |
| Parse result | **5 chapters, 7 sections, 26,956 words, 105 of Mackenzie's footnotes, 0 anomalies** |
| Verse recovered | **29 blocks (~1,400 words)** — see §4 |
| PG marks | stripped; `pg_strip.clean: true`, asserted on every parse |

## 3. Rights — three answers in one book

**Signed at Gate 2.** Ledger rows **RL-0053 … RL-0058**; `rights-lint` passes on 57 rows.

| Layer | Creator | Death | Status |
|---|---|---|---|
| The work | Donald A. Mackenzie | **1936** | PD: US (pub. 1913), EU/UK/TR since **1 Jan 2007** |
| 8 colour plates | **Warwick Goble** | **1943** | **PD — but none is in this volume** |
| 2 plates here | **Nandalal Bose** | **1966** | **IN COPYRIGHT until 2037 — not used** |
| 11 plates here | **unknown** | — | cannot be cleared — not used |
| Mackenzie's footnotes | Mackenzie | 1936 | same as the work |
| The transcription | PG volunteers | — | PD; marks stripped |

**There is no translation layer.** Mackenzie wrote in English; the Rigveda verse he quotes
is Griffith's, and Griffith died in 1906.

**The finding worth carrying forward: a book published in 1913 can still contain work in
copyright.** *Agni, the Fire God* and *Yama and Savitri* are credited in the 1913 plate
list as "From a painting by Nanda Lall Bose". Nandalal Bose (1882–1966) later illustrated
the Constitution of India. His work is protected in the EU, UK and Türkiye until **1 January
2037**. Anyone reasoning "1913, therefore clear" would have reproduced two in-copyright
paintings.

**And the mirror image:** Goble *is* a named illustrator on the PG record — the row the
Werner project looked for and could not find — so his eight colour plates are clear. None
of them illustrates these five chapters; they all belong to the epics. They are recorded
as cleared-on-evidence so the later volumes inherit the work rather than repeat it.

## 4. A defect that would have gutted the book

Mackenzie quotes the Rigveda constantly, and the transcription sets those quotations as
`<div class="poem"><div class="stanza"><span class="i0">` — **not** as paragraphs. The
first parser collected paragraphs only, and therefore **silently dropped every hymn in the
book**, including the Hymn of Creation, which is the reason chapter VI exists.

It was caught by trying to verify a quotation for the cover and finding it absent from the
parsed text. The parser now walks paragraphs and poems in document order; verse is carried
as `<verse>…</verse>` with its attribution and is set as verse by both typesetters.

A second bug inside the fix: each verse line is `<span class="i0">TEXT<br></span>`, and
`TEXT` may itself contain a `<span class="smcap">`. Matching to the first `</span>`
truncated every line with small caps in it — it lost half of *"Then was there only THAT,
resting within itself."*

**29 verse blocks, about 1,400 words, are printed that would otherwise have been lost.**

## 5. Two more data defects found

**Two Savitris.** The solar deity of chapters I–II — yellow-haired, pre-Vedic, called the
Stimulator, the setting sun — and Princess Savitri of Madra, who argues Yama out of her
husband's soul in chapter III, share a name and are different figures. The who's-who lists
them separately, and `build_names.py` now keys its results by **entry** rather than by
search term, because keying by term merged them into one figure with one set of chapters.
This is the same class of error as Werner's P'an Ku / P'an Kuan.

**The chapter argument line.** Mackenzie's dash-separated chapter summary was being parsed
as body text, which made Ushas, Ratri, Chandra and the Adityas look as though chapter II
*discussed* them when it only *lists* them. It is now a separate field: printed, because it
is his, but excluded from name searches.

## 6. What the edition adds

| Component | Size | Note |
|---|---|---|
| Introduction | 1,784 w | including the work Mackenzie's own (unprinted) introduction would have done |
| Chapter introductions | 5 | |
| **A Register of Comparisons** | 4 classes | **new for this volume** — see below |
| Who Is Who | 32 figures | references *searched*, not asserted |
| Chronology | 16 rows | |
| A Note on the Names | 344 w | three s-sounds, unmarked long vowels, the pronounced final -a |
| Index of Subjects | 34 headings | generated from the text |
| Four Ways In · Source note | | |

**The Register of Comparisons is why this volume works.** Mackenzie compares Indra to Thor,
Agni to Heimdal, the Indian demons to Celtic giants and half the pantheon to something
Babylonian — in the same tone, with the same authorities cited, whether the parallel is a
proven cognate or a theory nobody now defends. He nowhere grades them. The register sorts
them into four classes: Indo-Iranian (solid, and still what specialists say), wider
Indo-European (suggestive), Babylonian derivation (a dead school), and decorative.

That is the test for warranted apparatus: it answers the reader's actual difficulty with
*this* book, and it could not have been written for any other.

The introduction also handles the word **"Aryan"** directly — what it meant in 1913, that
it conflated a language family with a race, that the linguistic relationship is real and
the racial inference is not, and that the text is printed unaltered.

## 7. Facts

**Gate 5 signed. 29 claims, all VERIFIED by a check:** 17 verbatim quotations located in
the source file by search, 5 measurements from the QA files, 7 against the Project
Gutenberg record and biographical sources (Mackenzie, Goble, Nandalal Bose, Griffith).

## 8. Files produced

| File | Facts |
|---|---|
| `OUTPUT/interior-main.pdf` | **94 pp**, 6×9, all fonts embedded, preflight clean |
| `OUTPUT/indian-myth-and-legend.epub` | epubcheck **0 / 0 / 0**, 16 documents, chapter cross-links live |
| `ASSETS/cover/front-v1.png` | 2400×3600, sRGB, title **33.6%** of height, thumbnail contrast 0.94 |
| `ASSETS/cover/paperback-wrap-v1.pdf` | spine 0.2117 in, preflight clean |
| `ASSETS/companion/*.pdf` | 4 sheets, also served from the site |
| R2 masters | PDF + EPUB uploaded and **content-verified** |

## 9. Price

| Format | Proposed | Basis |
|---|---|---|
| Direct ebook | **$9.99** | nets $8.99 after Paddle; 21.5% is above the floor, short of premium |
| Paperback | **$12.99** | prints at $2.30; nets $5.49 at 42.3% |

A dollar under the Werner volume because it is fourteen pages shorter — the same principle
that put Werner below Epictetus. The Founder signs at Gate 8.

## 10. Companion

`valicepress.com/companion/vedic-gods` — built by the house pipeline, which appended the
leaf, read the file back to confirm the page count and printed address, and decoded the QR
module-by-module: **p.94, QR 29% of page height, 1.73 mm per module** against a 0.5 mm floor.

## 11. Gates

| Gate | Status |
|---|---|
| 1 Market | not started — no Amazon access in this environment |
| **2 Rights** | **passed** |
| **4 Content** | **passed** — 21.5% |
| **5 Facts** | **passed** — 29/29 |
| **9 Metadata** | **passed** |
| 7 Cover · 8 Interior · 10 Compliance · 12 Publish | founder signs |

## 12. Why it is still `draft`

**Paddle** — and the diagnosis changed during this phase. The live key exists and works;
one malformed line in `.env` shadows it. FOUNDER **F-004**.

## 13. Final state

Built, measured, rights-signed, fact-checked, preflighted, uploaded to R2, spliced,
packaged for KDP, and catalogued as `draft`. **Volumes two to four are scoped and unbuilt**,
and Goble's eight cleared colour plates are waiting for them.
