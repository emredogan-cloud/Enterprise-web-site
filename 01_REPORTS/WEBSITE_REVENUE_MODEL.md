# Website Revenue Model

## 1. Full revenue-stream map

| # | Stream | Complexity | Margin | Demand (evidence) | Risk | Priority | Time to revenue |
|---|---|---|---|---|---|---|---|
| 1 | Direct ebook sales | Low — already built | High (Paddle MoR fee only) | Unproven directly; inferred from any Amazon sales the catalog already has | Piracy (mitigated by watermark), support | **NOW** | Days, once real price + real catalog exist |
| 2 | Direct print sales | High (fulfillment) | Low/negative at low volume | Unproven | Fulfillment/tax complexity | LATER | Months |
| 3 | Amazon referral / "Buy on Amazon" | Trivial | N/A (Amazon's own margin) | High — Amazon already has traffic | Low | **NOW** | Immediate |
| 4 | Bundles | Low (data only — UI exists) | High | Unproven, plausible given puzzle+classics fit | Low | NEXT | Weeks |
| 5 | Subscriptions | High | Speculative | Not ready — see `DIRECT_SALES_BUSINESS_MODEL.md` §8 | High (churn) | LATER | Months, conditional |
| 6 | Premium/limited/collector digital editions | Medium | High | Plausible for puzzle-book audience | Low | NEXT | Weeks |
| 7 | Paid bonus content (extra puzzles, deleted content, commentary) | Medium | High | Plausible, matches Codex Enigmatica mechanic | Low | NEXT | Weeks |
| 8 | Educational packs | Medium | Medium | Unproven, plausible for World Games/Myth Hunter concepts | Medium (curriculum fit) | LATER | Months |
| 9 | Printable puzzle packs | Low | High | Plausible extension of Codex IP | Low | NEXT | Weeks |
| 10 | Public-domain editions | Low-Medium | High | Proven interest pattern (Meditations already built) | Low (legal diligence per title) | **NOW/NEXT** | Weeks |
| 11 | Licensing (translation/foreign rights, adaptation) | High (deal-dependent) | Very high if it lands | Unknown, needs a proven catalog first | Low financial, high effort | LATER | Quarters |
| 12 | Institutional sales (schools/libraries/museums) | Medium-High (sales cycle) | Medium-High | Plausible for World Games/Myth Hunter/Codex line | Medium (long sales cycles) | LATER | Quarters |
| 13 | Educator packs | Medium | Medium | Same as institutional | Medium | LATER | Quarters |
| 14 | Affiliate revenue (linking to complementary products) | Low | Low | Speculative, minor | Low | LATER, minor | Weeks if pursued |
| 15 | Future marketplace revenue | Very high | Unknown | Out of scope — conflicts with locked ADR | High | **DO NOT BUILD** | N/A |

## 2. Profit scenarios (illustrative — every number below is a labeled ASSUMPTION, not measured data)

**ASSUMPTIONS used across all three scenarios:** average direct order value $12 (single PD/original ebook); Paddle MoR effective fee ~5% blended (industry-typical MoR range, not this project's confirmed contract rate); no paid acquisition spend in Conservative/Base (organic + Amazon-funnel only); email/software costs ≈ $50–150/month (Resend + existing infra, already sunk); no employees, founder-operated.

| Scenario | Monthly site visitors | Conversion to purchase | Monthly direct customers | Monthly direct revenue | Payment cost (~5%) | Fulfillment cost | Software cost | Contribution margin |
|---|---|---|---|---|---|---|---|---|
| **Conservative** | 500 (mostly Amazon-funnel + light organic) | 0.8% | 4 | $48 | $2.4 | ~$0 (digital, automated) | $100 | **−$54/mo** (pre-revenue-proof phase; expected) |
| **Base** | 3,000 (catalog grown to 8–10 titles, SEO maturing, funnel pages on 2–3 books) | 1.5% | 45 | $540 | $27 | ~$0 | $120 | **+$393/mo** |
| **Aggressive** | 12,000 (multiple funnel books, email automations live, some bundle/premium mix pushing AOV to $18) | 2.2% | 264 | $4,752 | $238 | ~$0 | $150 | **+$4,364/mo** |

**These are illustrative planning inputs, not forecasts.** The single biggest lever in all three scenarios is **traffic**, and traffic is gated by (a) how many books exist with a working Amazon→website funnel page, and (b) how many books exist at all for organic/SEO discovery — both catalog problems, not code problems.

## 3. Bundles — modeled

**RECOMMENDATION:** Bundle pricing should sit at roughly **70–80% of the sum of individual prices**, which is the standard "buy more, save some, but not so much it cannibalizes single-title margin" range for digital goods with near-zero marginal cost. E.g., a 3-book "Myth & Folklore Collection" priced individually at $9.99 each ($29.97) bundled at ~$21.99 (~73%). Because digital COGS is ~zero, bundle discounting costs almost nothing in absolute terms and increases average order value — **RECOMMENDATION: yes, worth doing, but only once there are at least 3 real titles in a coherent group** (§ catalog architecture in `PUBLIC_DOMAIN_CATALOG_STRATEGY.md`).

## 4. What produces revenue fastest vs. largest long-term

- **Fastest first non-Amazon dollar:** fixing the Paddle price ID + shipping the one real title (Meditations) live — this is hours of operational work, not weeks (see `90_DAY_EXECUTION_PLAN.md` Week 1–2).
- **Largest plausible long-term stream:** direct ebook sales across a grown, differentiated public-domain + original-puzzle catalog, compounding with the email list — not subscriptions, not institutional sales, both of which require scale this catalog doesn't have yet.
