# Phase 5 — Traction engine: report

**Date:** 2026-09-03 · **Entered from:** `phase-4/PHASE_4_FINALIZATION_REPORT.md` §10 (technical entry criteria met; two commercial criteria are the Founder's to close).

Statuses are strict: **VERIFIED**, **OBSERVED**, **BLOCKED**, **DEFERRED**, **UNVERIFIED**. Nothing here is called validated, a winner or a success. No sale, no review, no visitor from search and no ad has happened, and this document says so at the top so that nothing below can be read as if one had.

---

## 1. Objective and the six firsts

Phase 5 exists to **prove customer acquisition**, not to add supply. The six events it is waiting for, with the system that will record each:

| First | Recorded by | State on 2026-09-03 |
|---|---|---|
| First direct sale | Paddle transactions · `orders` · `commercial-dashboard.mjs` | **none** (0 transactions, live account, all time) |
| First Amazon sale | monthly KDP report (`data/kdp/YYYY-MM.csv`, handbook O3) · sales rank on a listing | **none** (no BSR on 19 listings) |
| First review | `verify-amazon.mjs` review counts · the site's `reviews` table | **none** |
| First companion visitor | `companion_download` events; Vercel page views on `/companion/*` | **none** recorded |
| First real email subscriber | Resend audience with a `*-companion`, `home` or `article` source; 3 test aliases excluded | **none** |
| First repeat customer | a second paid order for the same `user_id` | **none** |

## 2. The three pilots, kept separate

Each pilot is one product, one channel, one page. Nothing changes on two of them at once, so a movement can be attributed.

### Pilot A — Dudeney · direct digital · SEO
- **Product:** *The Puzzles of Henry Dudeney (Annotated)*, $9.99, PDF + EPUB, on sale since 2026-09-02.
- **Channel:** Google → `/blog/haberdashers-puzzle` and the three other reference pages → `/books/the-puzzles-of-henry-dudeney` → Paddle → library → `/companion/dudeney`.
- **State:** the four pages are live, in the sitemap, and **not indexed** (Search Console, 2026-09-03: 0 impressions). The sitemap was re-submitted today. The Haberdasher page now carries Dudeney's own dissection figure.
- **What would move it:** indexing. Nothing to do but re-read Search Console on 2026-09-06 and 2026-09-10. If "Discovered — currently not indexed" has not become "Crawled" by 09-10, that is a finding (robots, canonical, or quality) and not a patience problem.
- **Measures:** impressions and clicks per page (`gsc-export.mjs`), `view_item` and `sample_read` on the Dudeney page, `begin_checkout`, Paddle transactions.

### Pilot B — World Games · print · Amazon discovery
- **Product:** paperback B0HG3KMK9L, $22.99, net $10.07, break-even ACOS 43.8%.
- **Channel:** Sponsored Products automatic campaign ($5/day, $0.35 bid, 14 days) → listing → sale → the companion page printed on p. 160 → `/companion/world-games` → email (optional) → the direct ebook or the next title.
- **State:** **BLOCKED on two Founder actions** — the campaign (F5; no API credential exists, verified 09-02 and 09-03) and the interior upload that puts the companion address into the book (U1). Until U1 ships, a buyer reaches the last page and is told nothing, so an ad before U1 buys traffic into a dead end.
- **Order of operations:** U1 → F5 → day 7 read → day 14 read.
- **Measures:** impressions, clicks, CPC, orders, ACOS from the Ads console (Founder-exported until an API credential exists); companion page views and `companion_download` on `/companion/world-games`; `world-games-companion` newsletter signups.
- **Stop rules (fixed before the first dollar):** ACOS above 43.8%; $20 spend on one target with no order; 20 clicks and no order; any off-intent term.

### Pilot C — Hangul · workbook · Amazon + companion
- **Product:** paperback B0HHHWXGG4, $12.99, live since 2026-08-29; hardcover in review; no direct ebook until Gate 2.
- **Channel:** organic Amazon (workbook search terms) → sale → p. 122 callout → `/companion/hangul` (practice grids, stroke boxes, tracker) → email (optional). Plus Google → `/blog/hangul-stroke-order` → the book page → Amazon.
- **State:** the rebuilt interior with the callout awaits upload (U3). The companion is live and its generated sheets render on demand.
- **Measures:** `/companion/hangul` page views and `companion_download` per sheet; `hangul-companion` signups; Amazon units from the monthly KDP export; impressions on the stroke-order page.

## 3. Observation windows

| Window | Question it answers | Decision allowed |
|---|---|---|
| 7 days | is the instrumentation recording at all (events, Search Console, Ads console) | fix instrumentation only |
| 14 days | is there an early acquisition signal (any impression, click, companion visit) | HOLD or MODIFY one variable |
| 30 days | is there a commercial interpretation (a sale, a review, a subscriber) | SCALE / HOLD / MODIFY / STOP per pilot |

No decision is taken on fewer than 20 clicks or on a zero that a tiny sample would produce anyway.

## 4. What the agent did today toward Phase 5

- Instrumented the funnel so it can be read: internal traffic (Founder's browsers once F6 is pressed, and every agent probe) no longer lands in `analytics_events` or Vercel Analytics; the dashboard reads the rest.
- Made the companion path real for seven books and printed it into three more interiors (six editions, awaiting upload).
- Re-submitted the sitemap so Pilot A's pages can be fetched.
- Re-verified all 19 Amazon listings and recorded the prices and discounts.
- Wrote the results files below with measured zeros, not blanks.

## 5. What the agent will do on the next pass

1. Re-read Search Console (Pilot A) and the dashboard; record the numbers in `SEO_RESULTS.md` and `COMMERCIAL_RESULTS.md`.
2. If U1 has shipped, confirm the KDP previewer state with the Founder and mark World Games COMPLETE-uploaded in the matrix.
3. If F5 has shipped, take the Founder's Ads console export and compute ACOS against the stop rules in `ADS_RESULTS.md`.
4. Only if a pilot reads SCALE at 30 days: propose the second book in that pilot's series. **Not before.** The factory amplifies proven demand; it does not manufacture supply into an empty market.

## 6. Results files

- `COMMERCIAL_RESULTS.md` — orders, revenue, contribution, per pilot.
- `ADS_RESULTS.md` — the campaign, once it exists; stop-rule ledger.
- `SEO_RESULTS.md` — Search Console per page and per query.
- `COMPANION_RESULTS.md` — companion visits and downloads per book.
- `EMAIL_RESULTS.md` — subscribers by source, sends, opens.
- `CATALOG_RESULTS.md` — the state of every listing and edition.

All six carry today's measured zeros and the command that produced each number.
