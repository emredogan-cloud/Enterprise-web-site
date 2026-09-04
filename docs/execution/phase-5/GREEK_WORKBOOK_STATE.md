# The Greek Alphabet Handwriting Workbook — what is actually there

**Date:** 2026-09-04 · **Project:** `MY-DİGİTAL-BOOK/GREEK-ALPHABET-HANDWRITING-WORKBOOK` · **State:** `RESEARCH`, gate `research`

---

## The short answer

**There is no book.** The project is an empty scaffold created on 2026-09-02 as a template proof, and nothing has been written into it since. The task asked for an EPUB, a price, a website listing, a paperback, a hardcover, a large-print decision, a companion, a printed QR bridge and a KDP upload handbook. **Producing any of those today would mean inventing the book they describe**, and this catalogue's first rule is that a book is never claimed to have a property it does not have.

So this pass did the work that can honestly be done — determined the true state, wrote the specification and the outline that had read *NOT STARTED* since the project was created, recorded five format decisions with their reasons, and sharpened the one question that is actually blocking. It did not manufacture a product.

## Starting state, measured

| | |
|---|---|
| `state.json` | `RESEARCH` — previous `IDEA`. Created 2026-09-02T07:23:22Z, reason: *"Phase 1 template proof: research not started, no market data fabricated"* |
| `.gate` | `research` |
| `CONTENT/` | **empty** — `.gitkeep` only |
| `OUTPUT/` | **empty** — `.gitkeep` only |
| `ASSETS/` (8 folders) | **all empty** |
| `CLAIMS.jsonl` | **0 bytes** |
| `measured` in `project_config.json` | `unitCount: null` · `words: null` · `pages: {paperback: null, hardcover: null, largePrint: null}` |
| `SPEC.md` · `OUTLINE.md` · `MARKET.md` · `RIGHTS.md` | all read **NOT STARTED** |
| `QA/metadata-lint.json` | 2 errors |
| `QA/compliance-lint.json` | 3 errors |
| `rights.publicDomain` | `false`; the single source reads *"to be chosen"*; ledger row `RL-0020` is **YELLOW** |
| `compliance.aiDisclosure` | text / images / translation all `null` |
| Catalogue entry on valicepress.com | **none** |
| Companion in `src/lib/companions.ts` | **none** |
| ISBN · ASIN | **none** · **none** |

Series bible: *"2 · The Greek Alphabet Handwriting Workbook: Modern and Classical — **template proof (Phase 1)**"*.

## What was already complete

**Nothing of the book.** What existed and was correct, and was therefore left alone: the project scaffold, the trim and paper decisions inherited from the series bible (K2), the price *bands* from `price-engine.mjs` (K3), and three open Founder questions correctly recorded as open.

## What was completed this pass

| | |
|---|---|
| `SPEC.md` | **written** — promise, reader, the differentiator, a thirty-lesson structure across four parts, budgets marked as targets, production spec, the companion rule, the format table, and the three blockers in the order they bind. Every section previously read *NOT STARTED* |
| `OUTLINE.md` | **written** — all thirty lessons named, the twenty-four letters in alphabet order, the three variant lessons, the three marks-and-joins lessons, front and back matter |
| `DECISIONS.md` | **K4–K7 recorded**, and **A2 sharpened** from a one-line placeholder to the specific thing that blocks |
| `project_config.json` | reasons written onto the `large_print`, `ebook`, `kindle` and `companion` rows; a `$state` block added so no later session reads the planned prices as evidence a book exists |

## What was NOT produced, and exactly why

| Asked for | Not produced because |
|---|---|
| **EPUB** | There is no text to put in it. Beyond that, the series bible forbids it: *"no ebook for sale (a write-in book — a fixed-layout EPUB may exist for Kindle only)"*. A handwriting workbook's value is the empty box; an EPUB of empty boxes cannot be written in and would be refunded. The Hangul volume has no direct ebook for the same reason. Recorded as **K5** |
| **Direct ebook price** | Same. A price for a product the house does not sell would be a number with nothing behind it |
| **Website listing** | The request itself says *"EPUB availability only if actual delivery works"* and *"do not use a placeholder"*. Listing a book with no manuscript, no cover and no file would be the most damaging thing that could be added to this storefront |
| **Paperback** | `CONTENT/` is empty. There is no interior to preflight and no cover art |
| **Hardcover** | Same, plus: at 120 pp a $19.99 hardcover nets 21.5 %, below the 35 % house floor. It stays a TEST to decide after the paperback has data |
| **Large print** | **NOT PRODUCED — NOT JUSTIFIED.** The book is already an 8.5 × 11 large trim; a large-print edition of a large-trim workbook is duplication, not a format. Series bible; recorded as **K4** |
| **Companion** | Three of its four assets are generated from the book's own lesson structure, and there are no lessons. Building it first would mean inventing what the book teaches — the *"do not create generic filler"* rule. Recorded as **K7** |
| **Printed URL + QR bridge** | It is printed on a page of a book. There is no book |
| **KDP upload handbook** | It would be a document instructing the Founder to upload files that do not exist. That is not a handbook; it is a fabrication with a table of contents |

## The one thing that actually blocks this book

**A2 — the stroke-order sources.** Not the writing, not the typesetting, not the cover.

The series bible's prohibited-drift list is explicit: *"no unverified stroke orders: every sequence is either transcribed with a citation or rule-derived and labelled so."* The Hangul volume carries a recorded defect, **ART-001**, for fabricated stroke numbers — on a cover, a single element, and it still had to be fixed by pixel-count-proven erasure. This book needs a sourced sequence for roughly **forty-eight glyph forms**: twenty-four letters in upper and lower case, plus final ς and the classical variants ϑ ϐ ϖ ϱ ϲ.

Inventing them from plausibility would be ART-001 at book scale, in the one part of the product a buyer is paying for. `rights.sources[0]` still reads *"to be chosen"* and `RL-0020` is YELLOW.

That question is the Founder's to close, and the agent can prepare the candidates on request. **It was not researched in this pass** — the instruction was explicit that no new research project was to be started, and a rights investigation across Greek education-ministry and typographic sources is exactly that. Say the word and it is a bounded, separate job.

## Honest scale

For calibration rather than as an estimate to hold anyone to: the Hangul volume — the same template, one script — took a full project phase, and its rights question alone forced a withdrawal and rebuild of ninety-seven vocabulary entries. Greek is comparable work with a harder source problem, because Hangul had a community diagram set to transcribe and Greek's equivalent has not been identified yet. It is a project, not a session.

## Remaining Founder actions

| | | Blocks |
|---|---|---|
| **A1** | Read `SPEC.md` and `OUTLINE.md` and approve, change or reject. About fifteen minutes | Gate 1 — everything |
| **A2** | Decide the stroke-order source position. Ask for a candidate list if you want one prepared | Gate 2 — the manuscript |
| **A3** | The AI-disclosure answer for text / images / translation | Gate 10 — any upload |

Nothing in this project can move without A1 and A2, and neither is something an agent may answer.
