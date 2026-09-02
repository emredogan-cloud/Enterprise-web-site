# Amazon Ads — Phase 4

**No campaign has run. No ad money has been spent. There is no ad result in this document.**

What changed since Phase 3: the blockage was verified rather than repeated, and the recommendation moved from the hardcover to the paperback because the hardcover's economics were being modelled at the wrong trim.

---

## The blockage, established

§12 asked for this to be proved rather than asserted. `scripts/tmp/ads-probe.mjs`:

| Probe | Result |
|---|---|
| Environment variables matching `AMAZON` / `ADS` / `LWA` / `ATTRIBUTION` | **none** |
| `POST https://api.amazon.com/auth/o2/token` | **400** — wants a real `client_id` and `client_secret` |
| `GET https://advertising-api.amazon.com/v2/profiles` | **401 Authorization Required** |

The network path exists and both endpoints answer. What does not exist is a credential, and the three things needed to make one — a Login-with-Amazon security profile, a refresh token minted by the account holder completing an OAuth consent screen, and a separately approved Ads API application — can only be created by the person who owns the advertising account.

This is a provider boundary, not a missing script. Handbook item **F5** carries the exact campaign to create by hand; if the Founder ever completes the three steps and puts the refresh token in Vercel, campaign creation and reporting both become automatable in an afternoon.

---

## The recommendation, corrected

Phase 3 recommended a $5/day automatic campaign across the World Games paperback **and hardcover**, and suggested testing the hardcover at $29.99. The trim correction changes both halves.

World Games is **8.5 × 11**, not 6 × 9 — read from the PDF's own page size.

| Format | List | Print cost | Net | Break-even ACOS | Max CPC @8% CVR |
|---|---|---|---|---|---|
| Paperback | $22.99 | **$3.72** | **$10.07** | **43.8%** | $0.81 |
| Hardcover | $34.99 | **$8.37** | **$12.62** | 36.1% | $1.01 |
| Large print (in review) | $31.99 | $4.94 | $14.25 | 44.5% | $1.14 |

### The hardcover cannot be repriced

| List | Net | Margin | Clears the 35% house target? |
|---|---|---|---|
| $27.99 | $8.42 | 30.1% | no |
| $29.99 | $9.62 | 32.1% | no |
| $32.99 | $11.42 | 34.6% | no |
| $34.99 | $12.62 | 36.1% | **yes** |

The competitor the market sets against it is the *Oxford History of Board Games*: hardcover, **$24.95, 400 pages, 65 reviews**. Ours is $34.99 for 160 pages with none. There is no price that is both competitive and inside the margin rule, because an 8.25 × 11 hardcover costs $8.37 to print before anything else happens.

**Answer to §10: product-targeting only, and do not lead with the hardcover.** Not "pause ads" — the hardcover can still appear in a campaign that is aimed at the paperback — but it should not be the ASIN the budget is spent discovering.

If the hardcover is to compete on price, the lever is the trim or the page count, and both mean a new edition rather than a new price.

---

## The campaign to create

```
Sponsored Products · AUTOMATIC targeting
Product    World Games PAPERBACK  B0HG3KMK9L      (hardcover B0HG41F21F optional, same ad group)
Budget     $5.00 / day
Bid        $0.35 default
Duration   14 days; review on day 7 and day 14
Purpose    harvest real search terms. Not to be profitable.
```

Automatic, not manual, and deliberately: there is **no click history, no conversion history and no search-term history** for any Valice title. A manual campaign built on three guessed keywords spends the budget proving they were guesses. Fourteen days at $5/day costs at most $70 and buys the one thing that cannot be bought another way — the words a real buyer typed before clicking.

**Then** a manual exact/phrase campaign, built only from search terms that produced a click at or below $0.35, bid at the observed CPC rather than at the ceiling.

Validated starting points, from the ten-title keyword check: `board games history book` (tightest intent — surfaces Murray, Oxford, *It's All a Game*), `ancient board games` (Murray and the Egypt-to-Catan trade titles), `traditional games book` (loosest; it pulled in riddle books — broad match only, and watch it).

Product targeting: **0486238555** (Murray/Dover), **1635617952** (Oxford History), **1250292050** (*It's All a Game*). The right shelf, and none of them has enough reviews to be unassailable.

---

## Stop rules — fixed before the first dollar

| Rule | Threshold |
|---|---|
| Hard ceiling | break-even ACOS: **43.8%** paperback · **36.1%** hardcover · **44.5%** large print |
| Scale | only when ACOS ≤ break-even − 10 points **and** conversion has held for 7 days |
| Stop a target | spend exceeds 2× the contribution of one unit with no order — **$20 paperback**, $25 hardcover |
| Stop a target | ≥ 20 clicks, 0 orders |
| Stop a target | clearly off-intent search term, whatever it costs |
| Never | optimise for clicks or impressions |

---

## Amazon Attribution

Plumbed and honestly labelled. The storefront's Amazon CTA prefers a format's `amazonUrl` over the `/dp/<ASIN>` fallback, so a tracking URL pasted into `valice-catalog.mjs` takes effect on the next catalogue load with no code change. `amazonAsin` stays alongside it, because that is what `verify-amazon.mjs` checks the listing against — a tracking URL silently pointing at the wrong book is exactly the failure the catalogue exists to prevent.

**No tag has been created, so no attribution is claimed.** Tags are minted in the Attribution console and copied whole; they are signed and cannot be assembled by hand. The surfaces worth tagging, in order: the book pages' Buy-on-Amazon buttons, the two companion pages, and the four new reference pages.

---

## The cheapest thing that would help more than $70 of ads

**Get the two World Games interiors re-uploaded.** They are built, preflight-clean, 160 pages, and they now end on a page telling the reader that 31 printable boards are waiting. An ad campaign sends strangers to a listing; a companion URL in the book turns a buyer into someone you can reach again. The second one is free and it is already done — it is sitting in `08_OUTPUT/` waiting for a KDP upload.
