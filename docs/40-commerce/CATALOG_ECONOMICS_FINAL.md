# Catalog Economics — Final

Per-title economics for the real Valice Press catalogue, computed against
KDP's verified rate card using each book's actual page count, trim class and
ink type.

Reproduce with:
```bash
node --env-file=.env scripts/strategy/catalog-economics.mjs
node --env-file=.env scripts/strategy/catalog-economics.mjs --csv > CATALOG_ECONOMICS_FINAL.csv
node --env-file=.env scripts/strategy/catalog-economics.mjs --ladder-csv > FORMAT_LADDER_MATRIX.csv
```

Evidence labels: **[V]** verified against a primary source · **[O]** observed in
the live system · **[A]** assumption · **[R]** recommendation.

---

## 1. Two corrections to the master strategy

This audit reached the real data and overturned two things the Phase 0
strategy asserted from a generic model. Both are stated here rather than
quietly fixed, because both changed a recommendation.

### 1.1 The premium-colour risk does not exist in this catalogue [O]

Phase 0 flagged premium colour as an urgent, possibly money-losing risk and
made auditing it the single most urgent action. **The audit found no premium
colour anywhere.** Every Valice print title is black ink:

| Title | Evidence |
|---|---|
| Codex Mythologica | `CASE_LAMINATE_6.000x9.000_329_BW_CREAM_en_US` — the KDP hardcover cover template filename encodes BW |
| Codex Bestiarium | `01_SOURCE/book.json` → "black and white"; `.github/workflows/plates.yml` → "black ink" |
| Codex Enigmatica | `project_config.json` → `ink: "black"`, `trimClass: "regular"` |
| The Great Book of World Myths | config → `colorMode: "bw"`; pageSize 432×648pt = 6×9in |
| The Great Book of World Games | `project_config.json` → `ink: "black"`, `trimClass: "large"` |
| The Myth Hunter's Field Book | `project_config.json` → `ink: "black"`, `trimClass: "large"` |
| Korean Hangul Workbook | `project_config.json` → 8.5×11in, founder-approved (DECISIONS K32) |

The risk was real in general and correctly identified; it simply had already
been avoided. **No action required.** Keep the Gate 8 ink check for future
titles — it costs nothing and the failure mode is a 9× margin loss.

There is also a structural reason it can't silently happen on a long book:
KDP enforces a minimum list price equal to printing cost ÷ royalty rate, so a
435-page premium-colour paperback simply cannot be listed at $24.99.

### 1.2 The format ladder is worth less than Phase 0 claimed, and the best rung is large print, not hardcover [V]

Phase 0 modelled a hardcover using **paperback** printing costs and reported
$10.75/unit and a 9× return per marginal hour. That was wrong.

**KDP hardcover carries a $5.65 fixed printing cost**, against $1.00 for a
paperback over 110 pages. [V] The fixed cost eats most of the price
difference, especially on short books:

| | Phase 0 claim | Actual |
|---|---:|---:|
| 120p hardcover @ $21.99, net | $10.75 | **$6.10** |
| Hangul 124p large-trim hardcover @ $21.99 | — | **$5.44** vs paperback $4.69 |

On the Hangul workbook the hardcover adds **$0.75 per unit**, not double. The
ladder is still worth building — but it is a modest, per-title-tested gain,
not the automatic win Phase 0 described.

**And the best missing rung is large print, not hardcover:**

| Book | Missing | Suggested list | Print cost | Net/unit | Verdict |
|---|---|---:|---:|---:|---|
| The Great Book of World Games | large print | $31.03 | $5.76 | **$12.86** | **YES** |
| Codex Enigmatica | large print | $26.98 | $9.16 | **$7.03** | **YES** |
| The Myth Hunter's Field Book | large print | $20.23 | $5.64 | **$6.50** | **YES** |
| Korean Hangul Workbook | large print | $17.53 | $4.69 | $5.83 | TEST |
| The Myth Hunter's Field Book | hardcover | $22.48 | $8.30 | $5.19 | TEST |
| The Great Book of World Myths | large print | $20.23 | $7.97 | $4.17 | TEST |

A World Games large-print edition would be **the highest-contribution print
unit in the entire catalogue at $12.86** — higher than any existing format of
any existing book.

> Suggested prices are modelled at the house ratios already visible in the
> catalogue (~1.5× paperback for hardcover, ~1.35× for large print) and large
> print assumes ~1.75× the base page count. Both are **[A]** and must be
> confirmed against a real re-typeset before listing.

---

## 2. The rate card [V — kdp.amazon.com, 2026-09-01]

**Paperback printing, Amazon.com**

| Ink / trim | Short-book band | Long-book formula |
|---|---|---|
| B&W regular | 24–110p: **$2.30 flat** | 110–828p: $1.00 + $0.012/p |
| B&W large | 24–110p: **$2.84 flat** | 110–828p: $1.00 + $0.017/p |
| Standard colour regular | — | 72–600p: $1.00 + $0.0255/p |
| Standard colour large | — | 72–600p: $1.00 + $0.0402/p |
| Premium colour regular | 24–40p: $3.60 flat | 42–828p: $1.00 + $0.065/p |
| Premium colour large | 24–40p: $4.20 flat | 42–828p: $1.00 + $0.080/p |

**Hardcover printing, Amazon.com** (75–550 pages; **75–108p B&W = fixed cost only**)

| Ink / trim | Formula |
|---|---|
| B&W regular | **$5.65** + $0.012/p |
| B&W large | **$5.65** + $0.017/p |
| Premium colour regular | $5.65 + $0.065/p |
| Premium colour large | $5.65 + $0.080/p |

**Standard colour is not offered for hardcover** — hardcover is black ink or
premium colour only. [V] This matters for any future illustrated hardcover:
there is no middle tier to fall back on.

**Royalty** — print: 60% of list on Amazon marketplaces at list ≥ $9.99, 50%
below; 40% Expanded Distribution; printing cost deducted in all cases.
Kindle: 70% for $2.99–$12.99 (band raised from $9.99 on 2026-07-07) less
$0.15/MB delivery; 35% otherwise and **35% only** for primarily-public-domain
titles. Direct (Paddle MoR): list − (5% + $0.50).

---

## 3. The catalogue as it stands [O — live database, 2026-09-01]

Full machine-readable version: `CATALOG_ECONOMICS_FINAL.csv`.

| Book | Format | Pages | List | Print | **Net** | Margin |
|---|---|---:|---:|---:|---:|---:|
| **Codex Bestiarium** (6×9, BW) | ebook · direct | 435 | $12.99 | — | **$11.84** | 91.2% |
| | paperback | 435 | $24.99 | $6.22 | $8.77 | 35.1% |
| | hardcover | 435 | $37.99 | $10.87 | **$11.92** | 31.4% |
| | large print | 599 | $29.99 | $11.18 | $6.81 | 22.7% |
| **Codex Enigmatica** (6×9, BW) | ebook · direct | 274 | $9.99 | — | $8.99 | 90.0% |
| | paperback | 274 | $19.99 | $4.29 | $7.71 | 38.5% |
| | hardcover | 274 | $29.99 | $8.94 | $9.06 | 30.2% |
| **Codex Mythologica** (6×9, BW) | ebook · **amazon** | 329 | **$4.99** | — | **$3.04** | 61.0% |
| | paperback | 329 | $21.99 | $4.95 | $8.25 | 37.5% |
| | hardcover | 329 | $32.99 | $9.60 | $10.20 | 30.9% |
| | large print | 578 | $27.99 | $10.83 | $5.97 | 21.3% |
| **Korean Hangul Workbook** (8.5×11, BW) | paperback · *coming soon* | 124 | $12.99 | $3.11 | $4.69 | 36.1% |
| | hardcover · *coming soon* | 124 | $21.99 | $7.76 | $5.44 | 24.7% |
| **Meditations** (digital only) | ebook · direct | 148 | $9.99 | — | $8.99 | 90.0% |
| **World Games** (large, BW) | ebook · direct | 160 | $11.99 | — | $10.89 | 90.8% |
| | paperback | 160 | $22.99 | $3.72 | **$10.07** | 43.8% |
| | hardcover | 160 | $34.99 | $8.37 | **$12.62** | 36.1% |
| **World Myths** (6×9, BW) | ebook · direct | 234 | **$4.99** | — | **$4.24** | 85.0% |
| | paperback | 234 | $14.99 | $3.81 | $5.19 | 34.6% |
| | hardcover | 234 | $26.99 | $8.46 | $7.74 | 28.7% |
| **Myth Hunter's Field Book** (large, BW) | paperback | 156 | $14.99 | $3.65 | $5.34 | 35.6% |
| | hardcover · *coming soon* | 156 | — | — | — | — |

### The pattern that actually drives contribution [O]

Contribution is governed by **price per page**, not by format. Compare:

- World Games: 160p at $22.99 → **$10.07**
- Codex Bestiarium: 435p at $24.99 → **$8.77**

The shorter book earns more per unit despite the lower price, because 275
extra pages cost $3.30 to print and were not priced for. And the effect is
sharpest at the top of the ladder: **every large-print edition in the
catalogue is its book's *worst* print margin** (22.7%, 21.3%) because page
counts inflate ~1.75× while prices rise only ~1.35×.

**[R] Price large-print editions on page count, not on a ratio to the
paperback.** Bestiarium large print at 599 pages should list nearer $34.99
than $29.99 to hold a normal margin.

---

## 4. Price-test candidates [O + A]

Two ebooks sit below the reach of the 70% band. Neither should be moved
automatically — elasticity is unknown and the catalogue has almost no sales
history to estimate it from (1 order, 0 reviews in production). What the
model *can* say precisely is how much volume each test may lose before it
stops paying:

### The Great Book of World Myths — direct, $4.99, 234 pages → $4.24

| Test price | Net/unit | Multiple | Breaks even at |
|---:|---:|---:|---:|
| $6.99 | $6.14 | 1.45× | **69%** of current volume |
| $9.99 | $8.99 | 2.12× | **47%** of current volume |
| $12.99 | $11.84 | 2.79× | **36%** of current volume |

### Codex Mythologica — Amazon Kindle, $4.99, 329 pages → $3.04

| Test price | Net/unit | Multiple | Breaks even at |
|---:|---:|---:|---:|
| $6.99 | $4.44 | 1.46× | **68%** of current volume |
| $9.99 | $6.54 | 2.15× | **47%** of current volume |
| $12.99 | $8.64 | 2.84× | **35%** of current volume |

**[R] Move both to $6.99 first, not $9.99.** At $6.99 the title still reads as
an impulse purchase, and it only has to retain ~69% of unit volume to come out
ahead. Hold for 30 days, then step to $9.99 if volume holds. A 234-page
illustrated reference at $4.99 is underpriced against its own paperback at
$14.99 regardless.

**Constraint on the direct title:** changing the World Myths price means
issuing a **new Paddle price** — Paddle prices are not edited in place — and
writing the new `pri_…` id into `valice-catalog.mjs`. See
`PHASE_1_EXECUTION_COMPLETION_TR.md` for the exact steps.

**Constraint on Mythologica:** it is Amazon-fulfilled and **KDP Select
enrolled**. The price change is a manual KDP Bookshelf edit, and Select
exclusivity is unaffected by price.

---

## 5. Channel comparison [V]

| Book | List | Amazon net | Direct net | Direct uplift |
|---|---:|---:|---:|---:|
| Codex Bestiarium | $12.99 | $8.64 | $11.84 | +37% |
| Codex Enigmatica | $9.99 | $6.54 | $8.99 | +37% |
| Codex Mythologica | $4.99 | $3.04 | $4.24 | +39% |
| World Games | $11.99 | $7.94 | $10.89 | +37% |
| World Myths | $4.99 | $3.04 | $4.24 | +39% |
| **Meditations (public domain)** | $9.99 | **$3.50** | **$8.99** | **+157%** |

The storefront is worth roughly a third of a sale on ordinary titles and
**more than doubles** the take on public domain, because KDP's 35% cap is a
KDP rule and does not apply to a shop Valice owns. Meditations is already
correctly configured as direct-only.

---

## 6. What this means for the model

The hybrid model's blended $16.29/unit from Phase 0 survives, but its
composition changes:

- **Direct ebooks are even better than modelled** — Bestiarium nets $11.84 and
  World Games $10.89, both above the $8.99 archetype, because they are priced
  at $11.99–$12.99 rather than $9.99.
- **Print is worse than modelled at high page counts** — the archetype assumed
  120 pages; the real catalogue averages far more, and large print is
  systematically thin.
- **The ladder is a per-title decision, not a rule.** `FORMAT_LADDER_MATRIX.csv`
  gives a YES/TEST/LATER for each real opportunity. Three are YES.

**[R] The single highest-value production action in the catalogue is a
large-print edition of The Great Book of World Games** — $12.86/unit, on an
existing 160-page interior, in the book with the best margin profile already.
