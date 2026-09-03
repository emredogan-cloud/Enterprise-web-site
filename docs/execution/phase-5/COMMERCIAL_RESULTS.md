# Phase 5 — Commercial results

**Read at:** 2026-09-03, second pass · `node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production`, against the production Neon database and the live Paddle account.

## Money — ACTUAL, measured

| | |
|---|---|
| Paid orders | **0** |
| Orders, all statuses | **0** |
| Revenue | **$0.00** |
| Paddle transactions (live account, all time) | **0** |
| Contribution | **$0.00** |
| Entitlements issued | **0** |
| Watermark jobs run | **0** |
| Registered users | **1** |

Six direct ebooks have been purchasable since 2026-09-02. Nobody has bought one.

## Funnel — first-party `analytics_events`, all time

| Event | Count | Last seen |
|---|---|---|
| `view_item` | 8 | 2026-09-03 02:46 UTC |
| `search` | 3 | 2026-09-03 02:49 UTC |
| `sample_read` | 2 | 2026-09-03 10:00 UTC |
| `begin_checkout` | **0** | — |
| `purchase` | **0** | — |
| `companion_download` | **0** | — |
| **Total** | **13** | |

By book: Dudeney 3 views + 1 sample read · Enigmatica 2 views · Mythologica 1 · Meditations 1 · World Myths 1 · Bestiarium 1 sample read.

**Almost all of this is the Founder's own browsing.** Phase 4 recorded 7 events and said the same. The exclusion switch (**F6**) has not been pressed in any browser, so the Founder's visits are still counted; the six new events since Phase 4 should be read as internal until F6 is on. The number that matters is not 13, it is the two zeros: **`begin_checkout` 0, `purchase` 0.** Nobody has reached a checkout.

## Amazon — snapshot 2026-09-03 02:30 UTC

**Nineteen listings. Zero reviews. No sales rank on any of them.** A missing BSR means Amazon has recorded no sale for that edition, ever.

## Per pilot

| | Pilot A · Dudeney | Pilot B · World Games | Pilot C · Hangul |
|---|---|---|---|
| Channel | Google → article → book page → Paddle | Amazon Sponsored Products → listing → companion | organic Amazon → listing → companion |
| Product | ebook $9.99, PDF + EPUB | paperback $22.99, `B0HG3KMK9L` | paperback $12.99, `B0HHHWXGG4` |
| Live since | 2026-09-02 | 2026-08 | 2026-08-29 |
| Orders | **0** | **0** | **0** |
| Revenue | **$0.00** | **$0.00** | **$0.00** |
| Traffic recorded | 3 `view_item`, 1 `sample_read` — internal | none | none |
| Blocked on | indexing (0 impressions in 30 days) | **A1** then **F5** | **B1** |
| Moved this pass | its only companion mention was one line in the imprint on p. 4; there is now a dedicated p. 144 | the weak p. 160 note is now a real page with a 2.9-inch code | the grey box at the foot of p. 122 is now a dedicated p. 125 |

## What this phase has and has not proved

**Proved:** that a customer who arrives can buy, download and be delivered to (Phase 4 end-to-end, on the real masters); that every printed book now has a route home a reader would notice; that the funnel records what happens.

**Not proved, and not claimed:** that anyone arrives. There is no evidence of demand for any Valice title from any channel. Nothing in this catalogue is validated, a winner, or successful, and the word "traction" appears in this directory only as the name of a phase.

## The one number to watch

**`begin_checkout`.** It is currently 0. The first non-internal one is the first evidence that a stranger considered paying, and it will arrive before any revenue does. Everything upstream of it — impressions, page views, companion visits — can be produced by curiosity. That one cannot.
