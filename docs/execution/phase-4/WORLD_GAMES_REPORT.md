# The Great Book of World Games — Phase 4

The flagship Amazon print pilot. Two of its three editions now carry a route home for the first time, its economics were being modelled at the wrong trim, and it was printing a biography nobody wrote.

---

## Live state

| Format | ASIN | List | Pages | Trim | Reviews | BSR |
|---|---|---|---|---|---|---|
| Kindle | B0HG44FH1B | $11.99 | — | — | 0 | none |
| Paperback | B0HG3KMK9L | $22.99 | 160 | **8.5 × 11** | 0 | none |
| Hardcover | B0HG41F21F | $34.99 | 160 | **8.25 × 11** | 0 | none |
| Direct ebook | — | $11.99 | 160 | — | — | — |
| Large print | **still not on the shelf** | $31.99 planned | 232 | 8.5 × 11 | | |

The large print remains in KDP review: an author-wide Amazon search on 2026-09-02 returns Mythologica's and Bestiarium's large-print editions and no World Games large print. The catalogue keeps `coming_soon` with **no ASIN** and nothing invents one.

---

## Fixed today: the interiors now end somewhere

Both the paperback and hardcover interiors now close on a companion page listing what is waiting online — 31 board templates at full playing size, culture cards, score sheets, the index of all 56 games — the URL, and one sentence making clear that nothing is asked in return.

**Both are still 160 pages.** That is the part that took the thinking. The builder's `section()` helper pads to a recto, which took the book to 162, changed the spine, invalidated a cover already sitting at KDP, and turned a one-file update into a two-file revision with a new proof. The book already ended on a blank page; flowing the section onto it instead holds the count. Preflight clean at 160 pages and 8.5 × 11; the project's own selftest is 229/229 green.

**The large print was restored from backup and deliberately not changed.** It has no blank final page, so the companion adds two pages — and it is in review right now. Withdrawing a book mid-review to save a URL is the wrong trade.

## Fixed today: a biography nobody authorised

> "Emre is a puzzle designer, mythologist, and game archivist dedicated to preserving ancient cultures, codes, and stories for the next generation."

Printed on the imprint page **and the back cover** of all three live editions. It came from `02_MANUSCRIPT/frontmatter.json` and nothing was checking it. Replaced with the Founder's own biography, cut to the one paragraph an imprint page holds — his first sentence, the middle of his second, and his last, every word his.

The large print still carries the old line, because it is in review. `kdp-linkage-lint` reports that edition as `NEEDS_REVISION` and will keep reporting it.

---

## The economics were wrong, and the ad plan changes again

Phase 3 costed this book at 6 × 9. **It is 8.5 × 11** — read from the PDF's own page size, which is the only source that cannot be misremembered.

| | Phase 3 | Corrected |
|---|---|---|
| Paperback print cost | $2.92 | **$3.72** |
| Paperback net @ $22.99 | $10.87 | **$10.07** · BE ACOS **43.8%** · max CPC $0.81 @ 8% CVR |
| Hardcover print cost | $7.57 | **$8.37** |
| Hardcover net @ $34.99 | $13.42 | **$12.62** · BE ACOS **36.1%** · max CPC $1.01 @ 8% CVR |

### The hardcover repricing recommendation is withdrawn

Phase 3 suggested testing $29.99 to sit nearer the *Oxford History of Board Games* at $24.95. At the true print cost:

| List | Net | Margin |
|---|---|---|
| $27.99 | $8.42 | 30.1% ✗ |
| $29.99 | $9.62 | 32.1% ✗ |
| $32.99 | $11.42 | 34.6% ✗ |
| $34.99 | $12.62 | **36.1%** ✓ |

**Only $34.99 clears the 35% house target — and $34.99 is the price the market says is too high.** A 160-page large-format hardcover cannot be priced against a 400-page one, because the print cost floor is $8.37 before anything else.

The hardcover is squeezed from both sides. The answer to §10 is therefore **product-targeting only, and do not lead with the hardcover**: the paperback is the ad target, at $10.07 net and a 43.8% break-even ACOS.

If the hardcover is to compete on price at all, the lever is not the price — it is the page count or the trim, and both mean a new edition.

---

## Companion

`valicepress.com/companion/world-games` — live, all four PDFs serve as `application/pdf`, `companion_download` fires per file, no email wall. **Downloads to date: 0.** Until today, nothing pointed at it: every printed edition predated it.

That is now half fixed in the files and waiting on one KDP upload.
