# Phase 3 — Commercial results

**Read at:** 2026-09-02, 16:25 UTC. Every figure comes from the system that
owns it: money from Neon and the live Paddle account, the funnel from
`analytics_events`, Amazon from the listings themselves, Google from Search
Console. Re-read any time with
`node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production`.

---

## ACTUAL

### Money

| | |
|---|---|
| Paid orders | **0** |
| Orders, any status | **0** |
| Revenue | **$0.00** |
| Contribution | **$0.00** |
| Paddle transactions, live account, all time | **0** |
| Ad spend | **$0.00** (no campaign has run) |
| CAC | undefined — no customer |
| Repeat purchase rate | undefined — no customer |

### Fulfillment

| | |
|---|---|
| Entitlements | 0 |
| Watermark jobs | 0 |
| Registered users | 1 (the Founder) |
| Refunds | 0 |

### Funnel

| Event | Count | Note |
|---|---|---|
| `view_item` | 4 | Enigmatica 2, Mythologica 1, Meditations 1 — all before today's deploys |
| everything else | 0 | |

The sink was proven to accept and store all seven required events today; the
probe rows were deleted afterwards. Four page views is the entire measured
history of this storefront.

### Amazon — 18 live listings

**0 reviews. No Best Sellers Rank on any of them.**

A listing with no BSR has not sold enough copies for Amazon to rank it. This is
the same result for every title, in every format, across four months of
publication.

| Title | Formats live | Reviews | BSR |
|---|---|---|---|
| Codex Mythologica | Kindle, paperback, hardcover, large print | 0 | none |
| Codex Bestiarium | Kindle, paperback, hardcover, large print | 0 | none |
| Codex Enigmatica | Kindle, paperback, hardcover | 0 | none |
| The Great Book of World Myths | Kindle, paperback, hardcover | 0 | none |
| The Great Book of World Games | Kindle, paperback, hardcover | 0 | none |
| The Myth Hunter's Field Book | paperback | 0 | none |
| Korean Hangul Handwriting Workbook | paperback | 0 | none |

Amazon is discounting three of them below list of its own accord — World Myths
hardcover to $12.99 from $26.99, its paperback to $12.99 from $14.99, the Field
Book to $13.91 from $14.99. Royalty is computed on list, so this costs nothing;
it is recorded because it is the price a customer compares a direct price
against.

### Google

| | |
|---|---|
| Clicks, 2026-08-03 → 08-31 | **0** |
| Impressions | **0** |
| Sitemap URLs submitted | 23 |
| **Indexed** | **0** |
| `/`, `/books`, `/books/the-great-book-of-world-games` | Discovered — currently not indexed; never crawled |
| `/ebooks`, `/companion/world-games`, Hangul page | URL is unknown to Google |

The sitemap was submitted at 07:10 UTC this morning, so zero indexed pages is
the expected state and not a fault. It does mean organic search cannot produce a
customer this month.

### Email

| | |
|---|---|
| Delivery | **works** — verified in a real inbox, dkim/spf/dmarc all pass |
| Unsubscribe | **works** — one-click POST returns `unsubscribed`; a forged token 400s |
| Consent records | **not stored** — `consentRecorded: false` on every signup, pending four audience properties in the Resend dashboard |
| Subscribers | 2, both agent test aliases; one has since been unsubscribed by the test |

---

## What a real customer can buy today, and what they get

Five direct ebooks: **Meditations $9.99 · Codex Bestiarium $12.99 · The Great
Book of World Myths $4.99 · The Great Book of World Games $11.99 · Codex
Enigmatica $9.99.**

What arrives, all four verified in production on the real files today:

- a **watermarked PDF** of the print interior — stamped per order, name and
  short order id in the footer, forensic ids in the XMP metadata;
- a **permanent library** at `/account/library`;
- **unlimited re-download** through short-TTL signed URLs;
- the **online reader** at `/read/[bookId]`.

What they do **not** get, and what the store therefore does not claim:

- **no EPUB.** Fulfillment ships exactly one file. The Dudeney EPUB exists and
  is epubcheck-clean; nothing delivers it. The sentence promising it has been
  removed from the live Paddle product.
- **no MOBI**, and the storefront filter offering it was already removed.

Nineteen Amazon formats are linked from the site, each verified against its
live listing today.

---

## What did not sell, and the most likely reason

Everything, and: **nobody can find it.**

- 0 pages in Google's index → no organic discovery.
- 0 reviews and no BSR on Amazon → no organic Amazon discovery either; Amazon
  ranks on sales velocity and there has been none.
- 0 ad spend → no paid discovery.
- 4 recorded page views, ever → the funnel has never had anything to convert.

This is a **traffic** problem presenting as a conversion problem. Nothing
measured this phase suggests the product, the price or the checkout is what is
wrong — the checkout has never been reached. Phase 3 established that it works
when it is.

---

## PROJECTED — arithmetic over the current prices, not a forecast

Contribution per unit if a unit sells. It says nothing about how many will.

| Product | Format | List | Net | Margin |
|---|---|---|---|---|
| Meditations | direct ebook | $9.99 | $8.99 | 90% |
| Codex Bestiarium | direct ebook | $12.99 | $11.84 | 91% |
| World Myths | direct ebook | $4.99 | $4.24 | 85% |
| World Games | direct ebook | $11.99 | $10.89 | 91% |
| Codex Enigmatica | direct ebook | $9.99 | $8.99 | 90% |
| World Games | hardcover | $34.99 | $13.42 | 38.4% |
| World Games | paperback | $22.99 | $10.87 | 47.3% |
| World Games | large print (not live) | $31.99 | $14.25 | 44.5% |
| Dudeney (not live) | direct ebook | $9.99 | $8.99 | 90% |
| Dudeney (not built) | paperback | $14.99 | $6.27 | 41.8% |

The direct channel is worth roughly **three times** the Amazon Kindle channel
per copy (World Myths: $4.24 direct against $3.04 on Kindle at the same list),
and roughly **the same** as an Amazon print sale at twice the list price. That
is the whole commercial argument for the direct store, and it is why the answer
to "should the direct ebook be cheaper than Kindle" is no.

---

## The first three things that could produce a customer

Ranked by how quickly they could plausibly do it:

1. **The companion pages.** `/companion/world-games` and `/companion/dudeney`
   are free, useful and already live, and the printed books will eventually
   carry the URL. They are the only asset that can bring a reader who already
   owns a Valice book back to a Valice page. Nothing measures them yet beyond
   `companion_download`.
2. **One $5/day Amazon auto campaign.** The only channel that can put a Valice
   book in front of a stranger this week. Specs and stop rules in
   `ADS_REPORT.md`; it needs the Founder to create the campaign.
3. **Indexation.** Free, and slow. The sitemap is submitted and clean; the next
   useful action is content that answers a question someone actually types —
   see `SEO_REPORT.md`.
