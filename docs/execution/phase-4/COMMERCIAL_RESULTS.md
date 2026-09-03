# Phase 4 finalization — Commercial results

**Read at:** 2026-09-03, 01:48 UTC (dashboard) and 05:10 UTC (Amazon), from the system that owns each figure. Re-read with `node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production` and `node scripts/market/verify-amazon.mjs --out`.

---

## ACTUAL

### Money

| | |
|---|---|
| Paid orders | **0** |
| Revenue · contribution | **$0.00 · $0.00** |
| Paddle transactions, live account, all time | **0** |
| Entitlements · watermark jobs | 0 · 0 |
| Registered users | 1 |
| Ad spend | **$0.00** — no campaign has run |
| First direct sale · first Amazon sale · first review · first repeat customer | **none** |

### Amazon — VERIFIED 2026-09-03 against all 19 live listings

19 of 19 listings answer; every catalogue price matches the live list price; **0 reviews and no sales rank on any edition**, unchanged.

Amazon is discounting of its own accord (royalty is computed on list, so this costs nothing): World Myths paperback buy box **$8.90 against $14.99** (−41%), World Myths hardcover **$12.99 against $26.99** (−52%), the Field Book **$13.91 against $14.99**. Codex Mythologica's Kindle edition shows $0.00 with Kindle Unlimited — the Select term runs to 2026-11-03.

The World Games large print is **not on the shelf** (author-wide search); recorded as *in review*.

### Google — VERIFIED 2026-09-03 through the service account

| | |
|---|---|
| Clicks · impressions, 2026-08-04 → 09-01 | **0 · 0** |
| Sitemap | submitted and downloaded 2026-09-02 07:10 UTC, 0 errors, 23 URLs submitted, **0 indexed** |
| Re-fetched since | **no** — hence the re-submission this phase (`scripts/seo/gsc-submit-sitemap.mjs`) |

### Funnel — first-party `analytics_events`

| Event | Count, all time | Note |
|---|---|---|
| `view_item` | 6 | four of them at 2026-09-03 01:13 UTC — the Founder's screenshot session; the exclusion switch did not exist yet |
| `sample_read` | 1 | same session |
| `add_to_cart`, `begin_checkout`, `purchase`, `companion_download`, `newsletter_signup` | 0 | |

From this deploy on, a browser marked on `/account/settings` and every agent probe are dropped before they reach this table (`ANALYTICS_EXCLUSION.md`).

### Email

Delivery, one-click unsubscribe and consent recording unchanged from Phase 4 (all proven). Subscribers: 3, all test aliases. Companion newsletter tags now exist for all seven companions; **no real subscriber yet**.

---

## What changed this pass

| | Before | After |
|---|---|---|
| Print editions that print a route home (live) | 5 of 15 | **9 of 15** once the three rebuilt interiors are uploaded |
| Companions live | 3 | **7** |
| Books whose companion exists | 3 | **7** of 8 print titles (Codex Enigmatica has a verification page instead) |
| Surfaces showing real covers | 3 routes | **all** (home, catalog, ebooks, cart, library, related, search, orders) |
| Fabricated figures on production | stats strip, 4.7 rating, AI portraits | **none** |
| Founder traffic excluded from analytics | no | **yes, per browser, via the supported hook** |
| Catalogue Kindle/print prices matching Amazon | 19 of 19 | 19 of 19 |

---

## Prices — re-read and kept

| Product | Amazon list (VERIFIED) | Direct | Direct net (Paddle ~10%) | Amazon net |
|---|---|---|---|---|
| World Myths ebook | $6.99 Kindle | **$6.99** | $6.14 | $3.04 (70% band, delivery fee) — Phase 4 report |
| Codex Mythologica ebook | $6.99 Kindle (Select until 11-03) | not sold here | — | — |
| World Games ebook | $11.99 Kindle | **$11.99** | $10.89 | ~$5.6 |
| Dudeney ebook | no Kindle edition | **$9.99** | $8.99 | — |
| World Games paperback | **$22.99** | Amazon only | — | $10.07 (8.5 × 11, 160 pp) |

**No price moved.** The rule stands: a direct price matches the Kindle list to the cent and wins on contribution (World Myths: $6.14 direct against $3.04 on Kindle at the same price to the customer) and on what the buyer gets (PDF + EPUB for Dudeney, a permanent library, re-download). Amazon's own 41–52% discounts on the World Myths print editions are Amazon's margin, not ours, and are not a reason to undercut a $6.99 ebook. Nothing in the evidence supports a race.

---

## Why nothing has sold — unchanged, and now with less excuse

0 pages indexed → no organic discovery. 0 reviews, no BSR → no organic Amazon discovery. 0 ad spend → no paid discovery. And until this pass, 11 of 15 live print editions could not send a buyer home. The last item is now a queue of three uploads (U1–U3) and two next-revision jobs; the first three need the Founder's KDP account; the ad campaign needs the Founder's Ads account. This remains a traffic problem, and the two levers that produce traffic this month are both in the handbook.
