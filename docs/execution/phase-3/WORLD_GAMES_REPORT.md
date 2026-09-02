# The Great Book of World Games — Phase 3

The first Amazon print pilot. Three formats live and verified, the large print
still not on the shelf, the companion live, and the commercial reading of the
market has changed the ad plan.

---

## 1. Live state, read from the listings today

| Format | ASIN | List | Buy box | Pages | Reviews | BSR |
|---|---|---|---|---|---|---|
| Kindle | B0HG44FH1B | $11.99 | $11.99 | — | 0 | none |
| Paperback | B0HG3KMK9L | $22.99 | $22.99 | 160 | 0 | none |
| Hardcover | B0HG41F21F | $34.99 | $34.99 | 160 | 0 | none |
| Direct ebook | — | $11.99 | — | 160 | — | — |
| **Large print** | **not on the shelf** | $31.99 planned | | 232 | | |

Everything matches the catalogue. No listing has sold enough to earn a sales
rank.

**Large print.** The Founder uploaded it to KDP. It is not live: an author-wide
Amazon search on 2026-09-02 returns Mythologica's and Bestiarium's large-print
editions and no World Games large print. So it is in review, or the submission
did not complete. The catalogue keeps `large_print: coming_soon` at $31.99 with
**no ASIN**, and nothing invents one. When it appears,
`scripts/market/amazon.mjs`'s search will find it by title and the catalogue,
the CTA, the JSON-LD `workExample` and the sitemap all follow from one edit.

---

## 2. The ad plan changed, and here is why

The brief nominated the **hardcover** as the first ad target on the grounds
that its contribution is strongest. A ten-title validation of the three
proposed keywords says that is the hardest sell in the catalogue.

Sample (`board games history book`, `ancient board games`, `traditional games
book`), read 2026-09-02:

| Competitor | Format | Price | Pages | Reviews | BSR |
|---|---|---|---|---|---|
| Board and Table Games from Many Civilizations (Murray/Dover) | Kindle | $9.99 | 464 | 64 | #1,037,337 |
| **Oxford History of Board Games** | **hardcover** | **$24.95** | **400** | 65 | #1,421,158 |
| It's All a Game | Kindle | $12.34 | 304 | 271 | #126,806 |
| Penguin Book of Card Games | Kindle | $12.99 | 658 | 466 | #62,819 |
| Board Games in 100 Moves | Kindle | $8.99 | — | 64 | #1,689,275 |

Median $12.99. High $24.95. **Our hardcover is $34.99 for 160 pages against a
$24.95 hardcover with 400.** Every title in the sample has sold; ours has not.

| Our format | Net/unit | Break-even ACOS | Max CPC @8% CVR |
|---|---|---|---|
| Hardcover $34.99 | $13.42 | 38.4% | $1.07 |
| Paperback $22.99 | $10.87 | **47.3%** | $0.87 |
| Large print $31.99 | $14.25 | 44.5% | $1.14 |

The max-CPC column assumes 8% conversion. A 160-page hardcover priced 40% over
the best-known hardcover in the category will not convert at 8%; at a more
plausible 3% its ceiling falls to **$0.40** and the paperback wins outright.

**Recommendation: do not open on the hardcover.** Open with one $5/day
automatic campaign covering paperback and hardcover together, for 14 days, to
harvest the search terms a real buyer types — because there are none yet, and
the three proposed keywords are informed guesses. Build the manual campaign
from what converts. Full spec in `ADS_REPORT.md`.

There is a second, cheaper lever the sample points at: **the hardcover is
mispriced against its market**, and $29.99 would still net $10.42 while sitting
much nearer the $24.95 anchor. That is a Founder pricing call, not an agent
one, and it is worth more than the first $70 of ad spend.

---

## 3. Companion

`https://valicepress.com/companion/world-games` — **200**, and all four PDFs
serve as `application/pdf`: index, culture cards, score sheets, 31 board
diagrams. Free, no email wall, `companion_download` fires on each file.
Measured downloads to date: **0**. Nothing has linked to it.

The printed interiors predate the companion and do not carry its URL. That is
the single highest-value change to the next print revision — it is the only
thing that turns an Amazon buyer into someone the store can reach again. It
belongs in the same upload as any other interior change, not in one of its own.

---

## 4. What this pilot has actually proved

That a book can be produced, priced, listed in three formats and given a free
companion — and still be invisible. World Games has been on Amazon since 4
August with **no review, no rank and no measurable visit**. The pilot's
remaining question is not whether the product is good; it is whether $5 a day
can find one person who wants it. That question has not been asked yet.
