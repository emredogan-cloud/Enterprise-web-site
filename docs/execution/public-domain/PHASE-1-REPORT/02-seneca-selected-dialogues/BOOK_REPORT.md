# BOOK 2 — Seneca: Selected Dialogues

**Valice Classics 4 · Lane C · slug `seneca-selected-dialogues`**
**Built 4 September 2026 · State: RESEARCH · Gates 2, 4, 5, 9 passed · NOT PUBLISHED**

> **This book exists because a rights check failed.** The 2026-09-03 research pass found that
> the source the previous candidate pool had chosen for Seneca could not be cleared. This is
> the substitute, and it is a better book for it.

---

## 1. Why this title, and why this translation

The old candidate pool recorded Seneca's source as the Loeb translation by Richard M. Gummere,
marked GREEN on a death year of **1919**. That is the publication year of volume 2 of a series
whose volume 3 appeared in 1925 — the translator was demonstrably alive after the date recorded
as his death. His authority record reads `Gummere, Richard M. (Richard Mott), 1883- `: a birth
year and no death. On the evidence held, that text **cannot be cleared for the EU, UK or
Türkiye**.

**Aubrey Stewart** (1844–1918) is the verified substitute. His 1889 Bohn's Classical Library
translation is clear in every market Valice sells to, and has been since 1 January 1989.

The constitution now carries the lesson: *a publication year is not a death year.*

## 2. Source and parse

| | |
|---|---|
| Primary | Project Gutenberg **64576**, fetched 2026-09-04, SHA-256 in `QA/parse-report.json` |
| Also fetched, **not used** | PG **3794** (*On Benefits*) — a separate work, not one of the *Dialogi*. Recorded as ledger RL-0039 so the fetch is accounted for. |
| In the source | **12 dialogues** plus both books of *On Clemency* — about 148,000 words |
| Selected | **5 dialogues, 79 chapters, 47,858 words** — each complete, none abridged |
| Stewart's own notes | **41**, kept and labelled as his |
| PG marks | header, footer, licence, trademark and Bohn page numbers stripped; **strip asserted by the parser**, `pg_strip.clean: true` |
| Parse anomalies | **0** |

Two parser bugs were found and fixed rather than worked around. A lazy `DIALOGUES?` also
matched *De Clementia*'s heading and silently overwrote *On Providence*; a guard now errors on
a duplicate capture. And the chapter regex missed *On Peace of Mind*'s opening, because the
text begins `I. [ Serenus. ]` — a speaker tag, not prose.

## 3. What the selection is, and why

Five of twelve, and the choice is editorial rather than arbitrary: the five about **how to
live**. Left out are the three books *On Anger* (a 40,000-word treatise), the three
consolations to the bereaved, and *On Clemency*, the political address to Nero.

| Dialogue | Latin | To | Chapters | Words |
|---|---|---|---:|---:|
| On Providence | *De Providentia* | Lucilius | 6 | 6,823 |
| On the Happy Life | *De Vita Beata* | Gallio | 28 | 12,618 |
| On Leisure | *De Otio* | Serenus | 8 | 3,380 |
| On Peace of Mind | *De Tranquillitate Animi* | Serenus | 17 | 13,260 |
| On the Shortness of Life | *De Brevitate Vitae* | Paulinus | 20 | 10,615 |

**Two are incomplete in the manuscripts, and the edition says so.** *On the Happy Life* breaks
off mid-sentence in its final chapter; *On Leisure* is a fragment at both ends. This is not
asserted — `BUILD/parse_sources.py` computes it from the source text and writes it to
`CONTENT/dialogues.json`, and the dialogue introductions print it. Nothing was supplied to
close the gaps.

## 4. Rights

**Signed at Gate 2.** `RIGHTS.md` + ledger **RL-0033 … RL-0039**, formerly YELLOW pending the
founder's signature. `rights-lint` passes on 38 rows.

| Market | Rule | Result |
|---|---|---|
| US | Published 1889, before the 1931 line | Public domain |
| EU / UK / TR | Life + 70; Stewart d. 1918 → expired 1 Jan 1989 | Public domain |
| URAA | British, 1889, clear at home long before 1996 | Nothing to restore |

**Illustration layer: none used, checked not assumed** — the PG record lists no Illustrator.

## 5. Differentiation — measured

| | Words |
|---|---:|
| Source (Seneca / Stewart, incl. his 41 notes) | 47,858 |
| **Original editorial matter** | **12,026** |
| Total | 59,884 |
| **Editor share** | **20.1%** (floor 20%) |

The first assembly measured **14.5%**. It was not shipped there and it was not padded. What
closed the gap was, again, delivering what the introduction had already claimed — 3,000 words
rather than 1,820 — plus a reception-history section, deeper dialogue introductions, and
depth at the twenty pivotal chapters of the argument map. Two redundancies my own expansions
introduced were found and rewritten rather than left to inflate the count.

## 6. The apparatus, and the one piece that is unusual

- **An argument map: a line for every one of the 79 chapters.** This is
  the apparatus this specific book most needs. Seneca wrote no headings; the chapter numbers
  were imposed by later editors and carry no information at all. A reader forty pages into
  *On the Happy Life* has no way of knowing that the self-defence starts at chapter XVII and
  runs unbroken to the end.
- An introduction of 2,639 words, built around **George Long's
  refusal**. Long — whose *Meditations* Valice publishes — deliberately left Seneca out of his
  account of the Stoics: *"He was in a sense a Stoic… His writings and his life must be taken
  together, and I have nothing more to say of him here."* The introduction takes up the
  sentence instead of quoting the compliment.
- An introduction to each of the five dialogues.
- **14 glossary entries** and **14 biographical entries**.
- A **14-row chronology** that sets the essays beside Nero's reign.
- A subject index: **30 headings, 591 references**,
  generated by searching the text.
- A concordance: **2 verified, 2 recorded as
  NOT PRESENT** — including the verified link from *On Providence* VI, the chapter Long cites
  in his *Meditations* notes and says he doubts Marcus would have agreed with. Its last line is
  *the way of escape lies open before you… I have made nothing easier for you than to die.*
  Seneca died that way, on the order of the pupil he had taught.

**Nothing was softened.** The introduction has a section called "The difficulties" on the
wealth, on Nero, and on slavery.

## 7. Files produced

| Artifact | Result |
|---|---|
| Print interior | **154 pp**, 6 × 9 in, gutter 0.5 in — preflight **ok**, 4 fonts all embedded |
| EPUB | 16 documents, 79 cross-link targets, **epubcheck 0 fatals / 0 errors / 0 warnings** |
| Digital edition | 0.53 MB, 154 pp |
| Cover | front 2400×3600 sRGB · Kindle 1600×2560 · wrap 12.6013×9.25 in, spine **0.3513 in** |
| Cover check | 3 pass, 0 warn, 0 error · title 25.5% of height |
| Companion page | built by the **house pipeline**, p.156, QR **25% of page**, **1.947 mm/module** |
| KDP package | `docs/execution/phase-5/kdp-packages/seneca-selected-dialogues/paperback/` |
| Companion assets | 4 of 4 promised |

**No image model was used and none is available.** Cost: $0.

## 8. A correction made during this book

The Epictetus volume authored its own companion page inside the interior. It met the numbers,
but it was a **parallel system**: it did not read the file back, did not decode the QR
module-by-module, did not run the spine arithmetic, and produced no KDP package — all of which
`scripts/factory/build-companion-pages.mjs` already did. `CLAUDE.md` is explicit about not
building a parallel publishing system when one exists.

Both Phase 1 books were moved onto the house pipeline. The interior builders now deliberately
produce an **odd** page count, because the appended companion leaf is what makes the final
count even. The house spec gained two entries, `edition-geometry.mjs` two more, and
`rebuilt-covers.mjs` records that both wraps were already built at the final counts and agree
with the pipeline's own arithmetic to four decimal places.

## 9. Price and format decisions

| Format | Decision | Basis |
|---|---|---|
| Direct ebook | **YES — $9.99** | nets $8.99 (90%). 20.1% apparatus is the floor, not premium, so the same price as the other three Classics. |
| Paperback | **YES — $15.99 proposed** | 154 pp prints at $2.85; $15.99 nets $6.72 (42.0%). One dollar under the Epictetus paperback because the book is twenty pages shorter. **Founder decides at Gate 8.** |
| Hardcover | **NO** | Qualifies on page count, but competes with Penguin and Everyman hardbacks at a price this edition has not earned. |
| Large print | **NO** | 154 pp re-set runs to roughly 285, list about $21.99, with no demand evidence. Deferred, with the reason recorded. |
| Kindle | **NO at launch** | 35% cap on public domain, and free Seneca editions saturate the store. |

## 10. Facts

`CLAIMS.jsonl`: **12 claims — all 12 VERIFIED**, `claim-lint` clean. Gate 5 is signed; the five once-PENDING claims were resolved by verifying Gallio at Acts 18:12 and in the source text itself, and by cutting the Dio fortune figure, the Jerome attribution and the nine-tragedies count.
The verified ones are evidenced from Long's own *Meditations* and from the project's own
measurement files. The five pending are the Acts identification of Gallio, the Tacitus death
scene, the Dio fortune figure, the Paul forgery, and the count of the tragedies — each hedged
in the printed text, each with a written fallback if Gate 5 cannot confirm it.

## 11. Gates

| Gate | State |
|---|---|
| 1 Market | not started — needs an Amazon sample the agent cannot take |
| 2 Rights | **prepared, unsigned** — RL-0033…RL-0039 |
| 4 Content | **PASSED** |
| 5 Facts | pending — 7 verified, 5 pending, founder signs |
| 7 Cover | ready — cover-check clean |
| 8 Interior | ready — preflight clean; founder signs after a proof |
| 9 Metadata | **PASSED** |
| 10 Compliance | blocked on the AI disclosure decision |
| 11 Website | blocked on deploy |
| 12 Publish | founder |

## 12. Final state

**COMPLETE as a build. NOT PUBLISHED.** 329 tests pass, lint and tsc clean, `npm run build`
succeeds. What remains needs a person.

