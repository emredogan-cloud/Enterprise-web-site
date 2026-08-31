# Catalog Master Inventory — Final

> Re-derived from scratch on 2026-08-31: the KDP bookshelf, Amazon Author
> Central, the built PDFs' own metadata, and the project repositories under
> `MY-DİGİTAL-BOOK/`. Nothing here is inherited from an earlier report.
>
> Source of truth in code: `scripts/catalog/valice-catalog.mjs`.
> Enforced by `scripts/catalog/valice-catalog.test.ts` (18 tests).

---

## The finding that inverted the previous inventory

The last inventory opened: *"No Valice Press book is published on Amazon.
There is no ASIN anywhere in any project."* That was true when written.

**Six of the seven titles are live on Amazon across eighteen editions.** Every
ASIN below was read off the KDP bookshelf and every `/dp/` URL was fetched and
returned 200.

And the constraint that follows from it, which the previous report explicitly
ruled out: **Codex Mythologica's Kindle edition is enrolled in KDP Select.**
Select is exclusive. That book's digital edition may not be sold anywhere but
Amazon while the enrolment stands — including here. The old conclusion
("nothing is enrolled in KDP Select, because nothing is on KDP at all") is now
wrong in both halves.

---

## Status vocabulary

Three statuses that move independently, and the confusion between them is the
thing this table exists to prevent:

- **`websiteStatus`** — whether valicepress.com lists the book.
- **`kdp`** (per format) — what Amazon holds for that edition.
- **`directSale`** — whether we may sell the digital edition ourselves.

A book can be live on Amazon and unsellable here (Codex Mythologica), or
sellable here and not on Amazon at all (Meditations).

---

## 1. Meditations — Marcus Aurelius

| | |
|---|---|
| Website | **published** · sold here |
| Category | Classics & Philosophy |
| Pages | 148 |
| Source | George Long translation, 1862; Project Gutenberg #15877 |
| Rights | **Public domain** — translation (1862) and work both long out of copyright |

| Format | Price | Channel | KDP | Status |
|---|---|---|---|---|
| Ebook | $9.99 | direct | not created | **on sale here** |

**Blockers**
- Its checkout was broken for the entire time it has been published: the row
  carried `pri_test_meditations_999`, a Paddle price that never existed. Now
  `pri_01m1btwjzqvest52bwde6mqqam`. No sale was lost — production had zero
  orders — but the store's only buyable title could not be bought.
- **Pricing/differentiation, open:** $9.99 is at the top of the range for a
  public-domain text whose original contribution is currently typesetting and
  a source note. Long's translation is free on Gutenberg and $0.99 on Kindle.
  Either add the original matter that justifies the price or reprice. Same
  decision every Batch 1 title faces — see `PUBLIC_DOMAIN_BATCH_1_PLAN.md`.

**Verdict: READY TO PUBLISH — published. Reprice or differentiate.**

---

## 2. Codex Mythologica

| | |
|---|---|
| Website | **published** · Amazon only |
| Pages | 329 (large print 578) |
| **KDP Select** | ✅ **eBook enrolled — exclusivity applies** |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Kindle | $4.99 | amazon | `B0HD8121RR` | live |
| Paperback | $21.99 | amazon | `B0HCY8KY3X` | live |
| Hardcover | $32.99 | amazon | `B0HDBFZRQ4` | live |
| Large print | $27.99 | amazon | `B0HDDR84MF` | live |

The previous catalog modelled the paperback at $18.99. Amazon charges $21.99.

**Blockers**
- KDP Select blocks direct ebook sale. This is the only thing between this
  title and the Valice Press store. To sell it here: turn off auto-renew in
  KDP and wait out the current 90-day term.
- Cover art native resolution ~112 PPI (101 on the hardcover canvas).

**Verdict: COMMERCIAL HOLD (digital) — exclusivity, not quality.**

---

## 3. Codex Bestiarium

| | |
|---|---|
| Website | **published** · sold here |
| Pages | 435 (large print 599) |
| Paddle price | `pri_01m1btjb037st1aew8mt990htv` |
| Master | `books/codex-bestiarium/master/v1/master.pdf` (4.62 MB) |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Ebook | $12.99 | **direct** | `B0HDLS4W8Q` (Kindle) | live |
| Paperback | $24.99 | amazon | `B0HDLQHQ7H` | live |
| Hardcover | $37.99 | amazon | `B0HDLLPG5M` | live |
| Large print | $29.99 | amazon | `B0HDLT1V3P` | live |

**Blockers**
- **LISTING ERROR ON AMAZON.** All four live listings are titled *"120
  Legendary Creatures"*. The book contains **112** — confirmed by the build
  reports (`entries: 112`, `plate-consistency: measured 112, accepted 112`)
  and by the PDF's own metadata. The listing overstates the contents by eight
  entries. **Correct it in KDP.**
- White-paper cover variants are defective (spine band overflow). Cream is
  correct and is what was published.
- Cover art 103–116 PPI upscaled to a 300 DPI canvas.

**Verdict: READY TO PUBLISH — published. Fix the Amazon title.**

---

## 4. The Great Book of World Myths

| | |
|---|---|
| Website | **published** · sold here |
| Pages | 234 |
| Paddle price | `pri_01m1btjddes1p637hd78zsvczx` |
| Master | `books/the-great-book-of-world-myths/master/v1/master.pdf` (3.72 MB) |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Ebook | $4.99 | **direct** | `B0HDQRPKST` (Kindle) | live |
| Paperback | $14.99 | amazon | `B0HDTL5V2H` | live |
| Hardcover | $26.99 | amazon | `B0HDZJ4PHQ` | live |
| Large print | — | — | — | disabled by decision K6/A6 |

The previous catalog modelled the paperback at $16.99. Amazon charges $14.99.

**Blockers**
- The AI-content declaration was made at upload (the book is live) but is
  recorded nowhere in the project files. Record it for the audit trail.
- Cover art 115/106 dpi.
- The two-parent-readings gate was closed by attestation with no per-reader
  log. No claim in the book depends on it.

**Verdict: READY TO PUBLISH — published.**

---

## 5. The Great Book of World Games

| | |
|---|---|
| Website | **published** · sold here |
| Pages | 160 |
| Paddle price | `pri_01m1btjcqgabh6v8rsxg85frxr` |
| Master | `books/the-great-book-of-world-games/master/v1/master.pdf` (0.58 MB) |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Ebook | $11.99 | **direct** | `B0HG44FH1B` (Kindle) | live |
| Paperback | $22.99 | amazon | `B0HG3KMK9L` | live |
| Hardcover | $34.99 | amazon | `B0HG41F21F` | live |

**Blockers**
- The subtitle promises *"Ready to Play Tonight"* and
  `01_SOURCE/playtests/` is empty. **No game in this book has been played by
  a human from the book's text alone.** The previous phase marked this title
  not eligible for direct sale on exactly that ground; it has since been
  published to Amazon and is selling, so the claim is one the founder has
  already made publicly. Listing it here adds no new claim.
  **Running even five playtests is the highest-value thing available for this
  title**, and it is the one blocker on this list that is about the book
  rather than about paperwork.
- Scope: 56 games of a locked target of 100; 39 cultures of 45. The published
  book does not claim 100, so this is a roadmap gap, not a misstatement.
- A+ module APLUS-05 has no artwork.

**Verdict: NEEDS EDITORIAL VALIDATION — published, claim unevidenced.**

---

## 6. The Myth Hunter's Field Book

| | |
|---|---|
| Website | **published** · Amazon only |
| Pages | 156 |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Paperback | $14.99 | amazon | `B0HFP4KYX5` | live |
| Hardcover | — | amazon | — | not created |
| Ebook | — | — | — | **deliberately does not exist** |

There is no ebook by design: this is a write-in activity book and the puzzles
are solved on the page.

**Blockers**
- Accepted risk on record: **zero child testing**
  (`externalValidation = overridden-zero-sessions`, explicitly not "passed").
  The project config permanently refuses to claim a child tested this book.
  It is live on Amazon regardless.
- Accepted risk: interior art floor lowered from 300 to 150 dpi by decision.
- The PDF carries no title or author metadata (`untitled` / `anonymous`) —
  cosmetic, but it is what a library catalogue reads.

**Verdict: READY TO PUBLISH (print) — published. No digital edition, by design.**

---

## 7. Codex Enigmatica

| | |
|---|---|
| Website | **published** · sold here |
| Pages | **274** (the previous catalog said 238 — corrected from the PDF) |
| Paddle price | `pri_01m1btjc0bp4phgs7vrqhq4g18` |
| Master | `books/codex-enigmatica/master/v1/master.pdf` (8.39 MB) |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Ebook | $9.99 | **direct** | `B0HGRZ3BRC` (Kindle) | live |
| Paperback | $19.99 | amazon | `B0HGSVF15Q` | live |
| Hardcover | $29.99 | amazon | `B0HH3B4HQ7` | live |

**Blockers**
- ⚠️ **SHIPPING NOW WITH A DEAD ADDRESS.** Paperback live 2026-08-27,
  hardcover 2026-08-29. The last leaf directs the reader to
  `valicepress.com/codex-enigmatica/verify` to check the book's final answer,
  which is printed nowhere in the book. **`valicepress.com` does not
  resolve — there is no DNS record.** Every copy Amazon ships today carries an
  address that goes nowhere, and for that buyer the book's central mechanic is
  unresolvable. The page itself works, at the deployment hostname. This is no
  longer a pre-print risk; it is a live customer-facing failure, and
  registering the domain is the entire fix.
- The project's own kill gate (five external solvers) was never passed — zero
  sessions recorded. No puzzle in this book has been solved by anyone other
  than its author. Published regardless.

**Verdict: READY TO PUBLISH — published. B0 is urgent and shipping.**

---

## 8. Korean Hangul Handwriting Workbook — **the one held back**

| | |
|---|---|
| Website | **draft** — not listed |
| Pages | 124 |

| Format | Price | Channel | ASIN | KDP |
|---|---|---|---|---|
| Paperback | $12.99 | amazon | — | **in review** |
| Hardcover | $21.99 | amazon | — | **in review** |
| Ebook | — | — | — | not created |

**Blockers**
- **LEGAL — UNRESOLVED AND NOW URGENT.** An A7 review item flags a
  **CC BY-NC licensed dictionary source (S-0019)** used in a commercial book.
  Non-commercial licensing is incompatible with selling this title in **any**
  channel — it blocks direct sale exactly as much as it blocks Amazon. And the
  paperback and hardcover are **in review at KDP right now**: if they pass,
  they go on sale with the question still open. **Resolve it or withdraw the
  submissions.**
- Further A7 items: ownership terms of the AI-generated cover art; the KDP AI
  declaration.
- Cover art ~83 DPI true resolution; no higher-resolution source exists.
- No real human usability test — the Phase 4 pilot used an AI proxy and
  returned REVISE, closed by founder override.
- No BISAC code assigned.

**Verdict: RIGHTS BLOCKED. Correctly held back.**

---

## Re-evaluation of the three previously hard-stopped projects

| Project | Previous state | New evidence | Now |
|---|---|---|---|
| CC BY-NC Hangul workbook | Hard stop — licence | None. The licence question is untouched, and the book is now in KDP review, which makes it **more** urgent, not less. | **Still blocked.** Held at `draft`. |
| *"Ready to Play Tonight"* / untested | Hard stop — zero playtests | The founder published it to Amazon; it is live and selling. `01_SOURCE/playtests/` is still empty. The blocker was overridden by a commercial act, not resolved by evidence. | **Published, claim still unevidenced.** Recorded rather than laundered. |
| 101 unverified drafts (Codex Enigmatica) | Hard stop — kill gate | The book was finished and published: 274pp interior, cover and Kindle edition all built and live. The kill gate (five external solvers) was never passed. | **Published.** Production complete; validation gate still open. |

None of these decisions was overridden by this session. Two were overridden by
the founder's own publication of the books, and this report records that
plainly rather than treating publication as evidence of validation.

---

## Excluded — recorded so the omission is a decision

| Title | Reason |
|---|---|
| Before You Cut — Book 1 | 255pp interior with no cover, title page, copyright page or bibliography; 0/43 fit signs and 0/129 cause claims verified; kill-gate fails on two hard stops. Not a sellable product. |
| Before You Cut — Books 2–3 | Empty scaffolds. |
| License & Launch: California Life & Health | 0 questions, 0 manuscript words, no author. Unpublishable while K9 forbids hiring an SME. |
| Turkish web projects | Reader applications, not typeset books — no PDF or EPUB exists. `tuzun-hafizasi` (63,541 words, v1.0 locked) is genuinely publication-grade prose and the strongest future candidate, but needs a full typesetting pass. |

---

## Counts

| | |
|---|---|
| Books in catalog | **8** |
| Published on the site | **7** |
| Held back | **1** (Korean Hangul — rights) |
| Format rows | **22** |
| **Verified Amazon destinations** | **18** (all fetched, all 200) |
| Fabricated ASINs | **0** |
| Buyable here (direct ebook) | **5** |
| Paddle prices, real | **5** |
| Masters in R2 | **5** |
| Books with a real preview | **7** (28 pages) |
| Books with a real cover | **8** |
| Titles enrolled in KDP Select | **1** (Codex Mythologica) |
| Amazon listings with a factual error | **1** (Bestiarium: 120 vs 112) |
