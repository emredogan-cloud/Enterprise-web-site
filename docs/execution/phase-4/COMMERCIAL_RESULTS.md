# Phase 4 — Commercial results

**Read at:** 2026-09-02, 18:00 UTC, from the system that owns each figure. Re-read with `node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production`.

---

## ACTUAL

### Money

| | |
|---|---|
| Paid orders | **0** |
| Revenue | **$0.00** |
| Contribution | **$0.00** |
| Paddle transactions, live account, all time | **0** |
| Ad spend | **$0.00** — no campaign has run |
| CAC · LTV · repeat rate | undefined — no customer |

### Amazon

**18 live editions. 0 reviews. No sales rank on any of them.** Unchanged from Phase 3, and the same for every title in every format across four months of publication.

Amazon continues to discount three titles below list of its own accord (World Myths hardcover $12.99 against $26.99; its paperback $12.99 against $14.99; the Field Book $13.91 against $14.99). Royalty is computed on list, so this costs nothing — it is recorded because it is the number a customer compares a direct price against.

### Google

| | |
|---|---|
| Clicks · impressions, 28 days | **0 · 0** |
| Sitemap URLs submitted | 23 · **indexed 0** |
| Home page | Discovered — currently not indexed; never crawled |
| Dudeney page, new blog posts | URL is unknown to Google |

The sitemap has not been re-fetched since 07:10 this morning, so the four new pages are not in it yet from Google's side.

### Funnel

4 `view_item` events, all time, all from before this phase. Every probe row the agent created while verifying the sink was deleted afterwards.

### Email

| | |
|---|---|
| Delivery | works — dkim/spf/dmarc pass, verified in a real inbox |
| One-click unsubscribe | works — signed link, forged token 400s |
| **Consent records** | **now stored** — `consentRecorded: true`, the Phase 3 defect is closed |
| Subscribers | 3, all agent test aliases |

---

## What changed this phase

| | Before | After |
|---|---|---|
| Direct ebooks buyable | 5 | **6** |
| Books published on the site | 8 | **9** |
| Files a purchase delivers | 1 (PDF) | **2** (PDF + EPUB) for Dudeney |
| Print editions linking home | 3 of 18 | **5 of 18** |
| Live editions printing an unauthorised biography | 3 | **1** (the large print, in KDP review) |
| Direct price of World Myths | $4.99 | **$6.99**, following Kindle |
| Consent recorded on signup | no | **yes** |
| Catalogue Kindle prices matching Amazon | 3 of 5 | **5 of 5** |

---

## What a customer can buy today

Six direct ebooks:

| Title | Price | Files |
|---|---|---|
| **The Puzzles of Henry Dudeney — Annotated** | **$9.99** | **watermarked PDF + EPUB** |
| Codex Bestiarium | $12.99 | watermarked PDF |
| Codex Enigmatica | $9.99 | watermarked PDF |
| The Great Book of World Games | $11.99 | watermarked PDF |
| The Great Book of World Myths | $6.99 | watermarked PDF |
| Meditations | $9.99 | watermarked PDF |

Plus, for every one: a permanent library, unlimited re-download through short-TTL signed URLs, and the online reader. All verified in production against the real masters today.

Nineteen Amazon formats are linked from the site, every ASIN verified against its live listing.

---

## PROJECTED — arithmetic over current prices, not a forecast

| Product | Format | List | Net | Margin |
|---|---|---|---|---|
| Dudeney | direct ebook | $9.99 | $8.99 | 90% |
| Codex Bestiarium | direct ebook | $12.99 | $11.84 | 91% |
| World Games | direct ebook | $11.99 | $10.89 | 91% |
| Codex Enigmatica | direct ebook | $9.99 | $8.99 | 90% |
| Meditations | direct ebook | $9.99 | $8.99 | 90% |
| **World Myths** | direct ebook | **$6.99** | **$6.14** | 88% |
| World Games | paperback 8.5×11 | $22.99 | **$10.07** | 43.8% |
| World Games | hardcover 8.25×11 | $34.99 | **$12.62** | 36.1% |
| World Games | large print (in review) | $31.99 | $14.25 | 44.5% |
| Dudeney (not built) | paperback 6×9 | $14.99 | $6.27 | 41.8% |

The two World Games print rows are **corrected**: Phase 3 costed a 6 × 9 book and it is 8.5 × 11. Real print cost is $3.72 and $8.37, not $2.92 and $7.57.

**World Myths at $6.99 direct now nets $6.14 against $3.04 on Kindle at the same list — twice the contribution, at the same price to the customer.** That is the clearest single argument for the direct channel in the catalogue, and it arrived by following Amazon's price rather than by undercutting it.

---

## Why nothing has sold

Unchanged from Phase 3, and now with one more piece of the explanation.

- 0 pages indexed → no organic discovery.
- 0 reviews, no BSR → no organic Amazon discovery; Amazon ranks on sales velocity and there has been none.
- 0 ad spend → no paid discovery.
- **11 live print editions with no route home** → four months of Amazon buyers, if there were any, could not have found the website. That gap is now half closed and the other half is a queue of interior uploads.

This is still a traffic problem presenting as a conversion problem. What changed this phase is that the thing traffic would arrive at is now worth arriving at: a book that delivers two files, a page that says what you get before you pay, and four pages that answer a question someone might actually type.
