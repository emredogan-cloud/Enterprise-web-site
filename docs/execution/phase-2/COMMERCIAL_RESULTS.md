# Phase 2 — Commercial results (2026-09-02)

Two columns, never mixed: **PROJECTED** is arithmetic over the verified rate
cards (`scripts/strategy/price-engine.mjs`, KDP/Paddle rates verified
2026-09-01); **ACTUAL** is what the production database, Paddle and KDP
report. Where nothing has happened the actual figure is 0 or UNVERIFIED, and
it is written that way.

## Actual — as of 2026-09-02 17:30 UTC

| Metric | Actual | Source |
|---|---|---|
| Direct orders (all time) | **0** | production `orders` table (Phase 0 count; no webhook fulfilled since — `commerce_events` empty of `paid`) |
| Direct revenue | **$0** | same |
| Entitlements issued | 0 | production `entitlements` |
| Amazon units / royalties (any title) | **UNVERIFIED** — no KDP report has ever been exported (FOUNDER O4) | KDP Reports |
| Amazon Ads spend / orders / ACOS | **0 / 0 / —** — no ads account exists (FOUNDER R4) | — |
| Companion visits, downloads | 0 recorded — the `analytics_events` sink went live in this deploy; the World Games and Dudeney companions deploy with it | `analytics_events` |
| Email signups this phase | 2 test signups by the agent (owner address + alias), both `consentRecorded: false` until the Resend properties exist; welcome email failing until `EMAIL_FROM` was set today | production logs |
| First sale / first direct sale / first Amazon sale / first repeat / first ad conversion | **none observed** | — |
| Conversion, CAC, repeat rate | **not computable** (no traffic measurement before today, no orders) | — |

## Projected — per unit, verified rate cards

| Product | List | Channel | Print / fee | Net per unit | Break-even ACOS |
|---|---|---|---|---|---|
| World Games hardcover (live) | $34.99 | Amazon | $8.37 | $12.62 | 36.1 % |
| World Games paperback (live) | $22.99 | Amazon | $3.72 | $10.07 | 43.8 % |
| World Games Kindle (live) | $11.99 | Amazon | $1.20 delivery | $7.19 | 60.0 % |
| World Games direct PDF (live) | $11.99 | Valice | 5 % + $0.50 | $10.89 | — |
| **World Games large print (built, not uploaded)** | **$31.99** | Amazon | $4.94 | **$14.25** | 44.5 % |
| **Dudeney direct PDF+EPUB (built, not published)** | **$9.99** | Valice | 5 % + $0.50 | **$8.99** | — |
| Dudeney paperback (built, not uploaded) | $14.99 | Amazon | $2.73 | $6.27 | 41.8 % |
| Hangul paperback (rebuilt, in review) | $12.99 | Amazon | $3.11 | $4.68 | 36.0 % |
| Hangul hardcover (rebuilt, in review) | $21.99 | Amazon | $7.76 | $5.43 | 24.7 % |

Demand is not modelled anywhere in this document. A projected net per unit
is a price statement, not a forecast; the roadmap's $8.20 blended figure and
the 1,436-units/month target for $10K stand unchanged and untested.

## Direct vs Amazon
No actual split exists. Projected: a Dudeney direct sale nets $8.99 against
$6.27 for the same reader buying the paperback on Amazon — the reason the
Valice Classics line is direct-first.

## What would change these tables first
1. Founder signs Dudeney Gate 2/8/12 and runs (or permits) the Paddle and
   catalogue commands → first direct product of the phase can sell.
2. Founder uploads the World Games large print → first new Amazon SKU.
3. Founder exports the first KDP report → the Amazon column stops being
   UNVERIFIED.
4. The `analytics_events` sink accumulates a week → conversion becomes a
   number instead of a dash.
