# KDP Business Model Comparison

Supporting analysis for `docs/VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.html`.
All figures reproducible with `node scripts/strategy/unit-economics.mjs`.

Evidence labels used throughout: **[V]** verified against a primary source,
**[I]** inference drawn from verified inputs, **[R]** recommendation.

---

## 1. The platform rate card (all [V], as of 2026-08-31)

| Rate | Value | Source |
|---|---|---|
| Kindle 70% royalty band, Amazon.com | **$2.99 – $12.99** (raised from $9.99 on **2026-07-07**) | KDP eBook List Price Requirements |
| Kindle 70% delivery cost | $0.15/MB (US) | KDP Digital Book Pricing |
| Kindle 35% royalty | All other prices/territories, $0.99–$200, no delivery cost | KDP Digital Book Pricing |
| **Public-domain Kindle titles** | **35% only** — "Books that consist primarily of public domain content are only eligible for the 35% Royalty Option" | KDP Digital Book Pricing |
| Paperback royalty | 50% or 60% of list by price band, Amazon marketplaces; **40%** Expanded Distribution | KDP Paperback Royalty |
| US print cost, B&W | $1.00 + $0.012/page | KDP Printing Cost |
| US print cost, standard colour | $1.00 + $0.0255/page | KDP Printing Cost |
| US print cost, premium colour | $1.00 + $0.065/page | KDP Printing Cost |
| New-title upload ceiling | 3/day (Sept 2023) → **~10 per format per week** (late 2025) | Publishers Weekly; KDP Help |
| AI disclosure | Required for AI-**generated** text/images/translations, even after heavy editing. Internal to Amazon; does **not** affect royalties or ranking. Not disclosing risks account-level enforcement. | KDP Content Guidelines |
| Public-domain differentiation | Needs translation, original annotation, **or 10+ original illustrations**; title must carry `(Annotated)` / `(Translated)` / `(Illustrated)` | KDP Publishing Public Domain Content |
| Paddle (Valice's MoR) | 5% + $0.50 per transaction | Paddle pricing |

---

## 2. Contribution per unit, by product shape [V arithmetic over V rates]

| Product | List | Net/unit | Margin |
|---|---:|---:|---:|
| Series bundle, direct | $149.00 | **$141.05** | 94.7% |
| Flagship guide, direct | $79.00 | **$74.55** | 94.4% |
| Workbook **hardcover**, 120p B&W | $21.99 | **$10.75** | 48.9% |
| eBook direct @ $9.99 | $9.99 | **$8.99** | 90.0% |
| Annotated PD **direct** @ $9.99 | $9.99 | **$8.99** | 90.0% |
| eBook Amazon @ $12.99 | $12.99 | **$8.79** | 67.7% |
| Illustrated ref., 200p **standard** colour | $24.99 | **$8.89** | 35.6% |
| eBook Amazon @ $9.99 | $9.99 | **$6.69** | 67.0% |
| Workbook **paperback**, 120p B&W | $12.99 | **$5.35** | 41.2% |
| Annotated PD **on Amazon** @ $9.99 | $9.99 | **$3.50** | 35.0% |
| eBook Amazon @ $4.99 | $4.99 | **$3.19** | 64.0% |
| Illustrated ref., 200p **premium** colour | $24.99 | **$0.99** | **4.0%** |

### Three findings that change decisions

**a) Premium colour is a margin trap.** The same $24.99 book returns $8.89 on
standard colour and $0.99 on premium — a 9× difference from one dropdown at
upload time. At premium colour the break-even ACOS is 4%, meaning **no
advertising is ever profitable**. Any illustrated Valice title set to premium
colour is being sold at roughly cost. [V]

**b) The hardcover companion is the best labour ROI in the catalogue.** It
reuses a finished interior — roughly 3 hours of cover and setup work — and
returns $10.75/unit against the paperback's $5.35. That is **$3.59 of
contribution per production hour, versus $0.38 for the paperback it derives
from**: a 9× return on the marginal hour. Every paperback without a hardcover
and large-print sibling is leaving the cheapest money in the business on the
table. [I from V rates]

**c) $4.99 is the worst price point available.** It nets $3.19. The July 2026
band extension to $12.99 means $9.99–$12.99 now sits inside the 70% tier, where
the same book nets $6.69–$8.79. [V]

---

## 3. Same book, both channels [V]

| List | Amazon net | Direct net | Direct uplift |
|---:|---:|---:|---:|
| $4.99 | $3.19 | $4.24 | +33% |
| $9.99 | $6.69 | $8.99 | +34% |
| $12.99 | $8.79 | $11.84 | +35% |
| **$9.99, public domain** | **$3.50** | **$8.99** | **+157%** |

The storefront is worth about a third of a sale on ordinary titles — and
**more than doubles** the take on public-domain editions, because KDP's 35% cap
does not apply to a shop Valice owns. This is the single largest structural
edge the company has, and it exists only because the storefront was built.

---

## 4. Break-even ACOS, and what it permits [I from V]

Break-even ACOS = net ÷ list. Book Sponsored Products CPCs run **$0.15–$0.45**,
reaching $0.60+ in competitive categories. [V]

| Product | Break-even ACOS | Max profitable CPC @ 8% CVR |
|---|---:|---:|
| eBook Amazon @ $12.99 | 67.7% | $0.70 |
| Workbook hardcover $21.99 | 48.9% | $0.86 |
| Workbook paperback $12.99 | 41.2% | $0.43 |
| Illustrated std. colour $24.99 | 35.6% | $0.71 |
| Annotated PD on Amazon $9.99 | 35.0% | $0.28 |
| Illustrated **premium** colour | 4.0% | $0.08 — never advertise |

A $12.99 paperback at $0.43 max CPC sits **at the top of the observed CPC
band**. It can be advertised, but with no room for error and none of the
Kindle Unlimited read-through that funds fiction advertising. Ads are viable
here as a **launch-ranking tool**, not as a permanent acquisition channel. [I]

---

## 5. What each revenue target requires [I]

Blended contribution per unit, and the monthly unit count each target implies:

| Model | $/unit | units/mo for $5k | for $10k | for $20k | for $50k |
|---|---:|---:|---:|---:|---:|
| C · Micro-niche low-content | $5.35 | 934 | 1,868 | 3,736 | 9,339 |
| A · Amazon workbook factory | $6.97 | 717 | 1,434 | 2,868 | 7,170 |
| D′ · Public domain, Amazon-only | $3.50 | 1,431 | 2,861 | 5,721 | 14,301 |
| D · Public domain, **direct-first** | $8.99 | 557 | 1,113 | 2,225 | 5,562 |
| **E · Hybrid (recommended)** | **$16.29** | **307** | **614** | **1,228** | **3,070** |
| B · High-content flagship, direct | $87.85 | 57 | 114 | 228 | 570 |

**The hybrid needs one-third the unit volume of the pure workbook factory for
the same money.** Volume is not the lever; contribution per unit is. Reaching
$10k/month means 614 units — about 20/day — not 1,868. [I]

---

## 6. The four models, tested

### Model A — Original niche workbook series (Grok's favourite)

**Holds up on:** production efficiency, series structure, evergreen demand,
policy safety relative to low-content, and the fact that the format ladder
(paperback → hardcover → large print) triples revenue per unit of content work.

**Fails on:** it is a **print thesis, and print is Amazon-only**. A workbook is
a consumable the buyer writes in. Valice's entire technical moat — watermarked
PDFs, the online reader, direct checkout, R2, the customer library — is
**inert** for a physical practice book. Model A grows the business on the one
channel where Valice has no structural advantage and Amazon takes 40–50%.

**Verdict:** a correct *volume and discovery* engine. Wrong as the *core*
business model, because it routes around every asset the company owns. [I]

### Model B — Original high-content series

Best margin in the study ($74.55/unit, 94%) and best website fit. But ~220
production hours per title and a launch that depends on reputation rather than
search. At 4 titles/year this cannot be the primary engine of a main income
within 24 months. **Verdict: the margin and authority layer, not the engine.**

### Model C — Micro-niche low/medium-content factory

The 2026 evidence is against it as a core model: the generic corner of
low-content is documented as saturated, Amazon capped new-title velocity
explicitly to curb it, and there is a documented consumer backlash against
"AI slop". It has the worst contribution per unit ($5.35), the least
differentiation, and the highest account risk. **Verdict: test laboratory
only** — useful for cheaply probing whether a niche has demand before
committing a real series to it. Never the main line.

### Model D — Differentiated public domain

Grok rated this lowest. **On Amazon, Grok is right**: the 35% cap makes a
$9.99 PD ebook pay $3.50, and the differentiation bar (translation, original
annotation, or 10+ original illustrations) is real work for a low ceiling.

**On Valice's own storefront, Grok is wrong.** The identical edition nets
$8.99 — **157% more** — because the cap is a KDP rule, not a market fact.
Valice already encoded this (`memory/PAST_DECISIONS.md`: "Public-domain
editions are direct-first"); this analysis quantifies it. The source text is
free, the annotation work is real but bounded (~25h), and the result is a
90%-margin product with no licensing cost.

**Verdict: Grok's ranking is correct for a KDP-only publisher and wrong for
this one.** Channel choice inverts the conclusion.

### Model E — Hybrid

$16.29/unit blended. Uses Amazon for what Amazon is good at (discovery, print,
credibility) and the storefront for what it is good at (margin, ownership,
repeat purchase). **Verdict: recommended.**

---

## 7. Decision matrix

Scores 1–10, 10 best; Risk scored so 10 = safest. Simple unweighted mean.

| Model | Speed | Margin | Scale | Repeat | Ads | Risk | Prod. eff. | Web synergy | Sustain. | **Overall** |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **E · Hybrid** | 6 | 8 | 7 | 8 | 7 | 8 | 7 | 9 | 9 | **7.7** |
| **D · PD direct-first** | 6 | 9 | 6 | 6 | 5 | 7 | 7 | 10 | 7 | **7.0** |
| A · Niche workbook series | 7 | 5 | 8 | 7 | 6 | 6 | 8 | 3 | 6 | **6.2** |
| B · High-content series | 2 | 10 | 3 | 5 | 3 | 9 | 2 | 10 | 8 | **5.8** |
| C · Micro-niche factory | 9 | 3 | 9 | 6 | 4 | 3 | 9 | 2 | 2 | **5.2** |
| D′ · PD on Amazon only | 6 | 2 | 6 | 4 | 3 | 5 | 7 | 4 | 4 | **4.6** |

Note rows D and D′ — the *same content strategy*, 2.4 points apart on channel
alone.

---

## 8. Portfolio distribution [I — the model's weakest assumption]

Assuming a 20/30/50 winner/average/weak split at 3.0 / 0.7 / 0.1 sales per day
per title, on the hybrid's $16.29 blended contribution:

| Catalogue | Units/mo | Gross contribution/mo | Winners carry |
|---:|---:|---:|---:|
| 10 | 261 | $4,259 | 70% |
| 30 | 784 | $12,777 | 70% |
| 50 | 1,307 | $21,295 | 70% |
| 100 | 2,614 | $42,591 | 70% |

**These sales rates are illustrative, not measured.** They are the load-bearing
assumption in every revenue projection here, and no public dataset gives
trustworthy per-title sales rates for this category. Treat the *shape* (a fifth
of titles carry ~70% of revenue) as the finding, and the absolute figures as a
placeholder to be replaced by Valice's own first-12-month data.

---

## 9. What the evidence does **not** support

- **"Publishers make $1,000–$5,000/month."** No sample size, category,
  timeframe, gross-vs-net basis, or ad-spend accounting is attached to this
  claim anywhere it was found, and it is quoted from vendors selling courses to
  aspiring publishers — a textbook survivorship-bias channel. **Do not plan
  against it.** The tables above give required units instead of predicted
  income precisely because the required-units question is answerable and the
  predicted-income question is not.
- **Series read-through of 35–50%.** The available figures are self-reported by
  *fiction* authors on forums. Fiction read-through is driven by narrative
  momentum, which a practice workbook does not have. Nonfiction/workbook
  read-through is plausibly far lower, and no credible public benchmark exists.
  Assume a workbook series compounds through **keyword and brand coverage**,
  not through readers finishing book 1 and needing book 2. [I]
- **Per-title sales rates in any of these categories.** Nothing public and
  trustworthy. This is the highest-value thing Valice can measure itself.
