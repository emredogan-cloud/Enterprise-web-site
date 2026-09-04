# BOOK 3 — Myths and Legends of China

**Valice Classics 5 (proposed) · Lane C · slug `myths-and-legends-of-china`**
**Worked 4 September 2026 · State: BLOCKED · NOT COMPLETE**

> **This book is not finished, and the reason is a decision rather than missing work.**
> The source is parsed, the rights are cleared and recorded, and a real apparatus is written.
> It measures **13.3%** against the series floor of 20%. Closing that gap
> means changing what the book is, and that is the Founder's call — the options are measured
> below.

---

## 1. What is done

| | |
|---|---|
| Source | Project Gutenberg **15250**, fetched 2026-09-04, SHA-256 in `QA/parse-report.json` |
| Parsed | **12 chapters, 233 sections, 62,954 words**, 0 anomalies |
| Werner's own notes | **35**, kept and labelled as his |
| PG marks | stripped; **strip asserted by the parser**, `pg_strip.clean: true` |
| Rights | ledger **RL-0040 … RL-0043**, `rights-lint` passes on 42 rows |
| Apparatus written | 9,797 words — introduction, 12 chapter introductions, 34-entry glossary with verified references, 15-row chronology, a note on Wade-Giles romanisation, reading paths, source note, and a subject index of 32 headings / 228 references generated from the text |

## 2. The rights finding worth keeping

**The 1922 colour plates cannot be used, and 17 of them were dropped from the
selected chapters.** No source consulted names the artist — the Project Gutenberg record lists
agents by role and carries no Illustrator. With no identified creator there is no death year,
so the life-plus-seventy rule that governs the European, British and Turkish markets cannot be
applied at all. Ledger row **RL-0041 is RED** and says so.

The count is written to `QA/parse-report.json` by the parser, so the omission is a decision on
file rather than something that quietly happened.

**A second finding worth recording:** Werner died in 1954, so this book became public domain in
the UK, EU and Türkiye only on **1 January 2025**. Valice research written before that date
still records the title as encumbered outside the United States. It is not.

## 3. Why it is blocked

The apparatus is good and it is not big enough, because Werner is long.

| | Words |
|---|---:|
| Source (Werner + his 35 notes) | 63,857 |
| Original editorial matter | 9,797 |
| **Editor share** | **13.3%** — floor 20% |

Every expansion that was genuinely warranted has been made. The introduction now runs to about
3,000 words and covers the pantheon-as-civil-service, the three religions, the sources, Werner
himself, and the romanisation. Each of the twelve chapters has an introduction. The glossary
entries average about 180 words and every chapter reference in them was verified by searching
the text.

**What has not been done is add apparatus this book does not need.** Werner's section titles
are already descriptive — *The Nunnery on Fire*, *Miao Shan visits the Infernal Regions* — so
the per-section head-notes that carried Epictetus and Seneca over the floor would be padding
here. The constitution written for this factory forbids exactly that: *"Do not add filler to
reach a percentage. A padded introduction is worse than a short one."*

## 4. The decision, measured

Selection changes the ratio. These are the real options, computed against the apparatus that
already exists:

| Option | Chapters | Source words | Editor share | |
|---|---|---:|---:|---|
| **A** — all twelve, as parsed | III, V–XV | 63,857 | **13.3%** | fails |
| **B** — drop the two Ming-novel extracts (No-cha, Monkey) | 10 chapters | 47,193 | **17.2%** | fails |
| **C** — the pantheon only, no long narratives | III, V–IX, XI, XIII | 32,113 | **23.4%** | passes |
| **D** — pantheon + the Goddess of Mercy | 9 chapters | 42,500 | **18.7%** | fails |
| **E** — pantheon + the fox legends | 9 chapters | 36,806 | **21.0%** | passes |

Two options pass. **Neither should be chosen because it passes.**

Option C drops the Goddess of Mercy, the Eight Immortals, Monkey and the fox legends — that is,
everything a reader picks the book up for. Option E keeps the foxes and drops Kuan Yin, which
is arbitrary. Both are shaped by arithmetic rather than by what makes a good book, and the
constitution is explicit that selection must be editorial.

### The option that is not in the table

**Split Werner into two volumes.** The natural seam is real and not invented: chapters III and
V–IX plus XI and XIII are *the pantheon* — the ministries, the officials, the system — while X,
XII, XIV and XV are *long narratives*, three of them extracted from Ming novels and one from a
seventeenth-century short-story collection. They are different kinds of book.

- **Volume one — the gods and their ministries.** 32,113 words. The existing apparatus carries
  it at **23.4%**, comfortably clear, and the introduction's civil-service framework is exactly
  what that volume is about.
- **Volume two — the long narratives.** Kuan Yin, No-cha, Monkey and the fox legends. Needs its
  own apparatus, which would be a Phase 2 title.

This is better publishing than either passing option, and it is a roadmap amendment rather than
a technical fix. It is therefore the Founder's, not the agent's.

## 5. What is deliberately NOT done

No interior, EPUB, cover, companion, catalogue entry or KDP package was built. Producing them
for a book whose scope is undecided would mean building the wrong artifacts and then rebuilding
them — and would put a page count, a spine and a price into the record for a book that does not
exist yet.

The work that survives any of the options above — the parse, the rights, the glossary, the
chronology, the romanisation note — is all done and none of it is wasted.

## 6. Founder action

**`FOUNDER.md` F-013.** Decide the scope. Then the remaining production is a day's work, because
the pipeline is proven on two books.

