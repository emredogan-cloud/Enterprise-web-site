# Phase 5 — Ads results

**Read at:** 2026-09-03, second pass.

## The ledger

**No campaign exists. No ad has run. $0.00 has been spent. No impression, click or attributed sale has been recorded, because there is nothing to record.**

## Why, verified again today rather than repeated

`node scripts/tmp/ads-probe.mjs`, run 2026-09-03:

| Probe | Result |
|---|---|
| environment variables matching `AMAZON\|ADS\|LWA\|SP_API\|SELLING_PARTNER\|ATTRIBUTION` | **none**, in the repository or in Vercel production |
| `POST https://api.amazon.com/auth/o2/token` | **400** — no client id to authenticate with |
| `GET https://advertising-api.amazon.com/v2/profiles` | **401** |

Same answer as Phase 3 and Phase 4. The blockage is a provider boundary, not a technical one.

**New this pass:** the boundary has been mapped rather than only re-confirmed. `AMAZON_ACCESS_AND_API_SETUP_2026.md` is the forty minutes of Founder work, written out from Amazon's own documentation read in a browser today — six steps, three consoles, one approval that takes up to a business day, and the exact environment-variable names to store afterwards. It also records what only a person can do, what needs Amazon's approval, and what the agent takes over the moment a refresh token exists.

**And the thing worth knowing before starting:** the first campaign does **not** need the API. It is created by hand in the ad console. The API buys automated reporting, programmatic bid changes and Attribution tags — all worth having, none of them blocking.

## The campaign, unchanged

```
Sponsored Products · AUTOMATIC targeting
Product    The Great Book of World Games, paperback   B0HG3KMK9L
Budget     $5.00 / day
Bid        $0.35 default
Duration   14 days · read on day 7 and day 14
Purpose    harvest real search terms. Not to be profitable.
```

Net $10.07 a unit, **break-even ACOS 43.8 %** — the arithmetic is in `phase-4/ADS_REPORT.md` and has not moved.

### Stop rules, fixed before the first dollar

| Trip | Action |
|---|---|
| ACOS above **43.8 %** | pause |
| **$20** spent on one target with no order | negate that target |
| **20 clicks, 0 orders** | pause the campaign and re-read the listing, not the bid |
| any off-intent search term | negate it |

No decision on fewer than 20 clicks. A zero from three clicks is a zero a coin flip would produce.

## The order of operations, and why it is not negotiable

**A1 before F5.** The World Games paperback and hardcover interiors now end on a dedicated companion page — a 2.9-inch code and `valicepress.com/companion/world-games` printed under it in display type. Until those two files are at KDP, an ad buys a stranger who reaches the last page of the book and is told nothing.

The ad is the expensive half of that pair. The upload is ten minutes and costs nothing. Doing them in the wrong order does not fail loudly; it just quietly wastes the budget, which is worse.

## Attribution

No tag exists and none is claimed. Amazon Attribution **is** available to KDP authors — confirmed today on Amazon's own launch announcement (30 September 2022) and product page, in the US among other markets, free, with pages-read and royalty visible in its reporting.

Five minutes in the ad console creates one tag for the World Games paperback; pasting the whole tracking URL into `valice-catalog.mjs → amazonUrl` (keeping the ASIN) takes effect at the next catalogue load with no code change. It is the only mechanism that can close the loop **site → Amazon → sale**, which is exactly the leg this phase cannot currently see.

A third-party claim of a "10 % bonus on Attribution-driven sales for KDP authors" appears on neither Amazon page read today. **Not claimed, and nothing here is planned around it.**
