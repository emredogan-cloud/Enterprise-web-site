# Amazon Ads — Phase 3

**No campaign has run. No ad money has been spent. There is no ad result in
this document, because there is no ad result.**

The account, Author Central and Attribution all exist. What does not exist is a
path from this environment to a campaign.

---

## 1. Why the agent cannot create the campaign

The Amazon Ads API requires three things, in order:

1. a **Login with Amazon security profile** (client id + secret), created in
   the Amazon developer console by the account holder;
2. a **refresh token**, minted by the account holder completing an OAuth
   consent screen against that profile;
3. an **approved API application** — Amazon reviews Ads API access separately
   and grants it to the advertiser, not to a tool.

None of those is a credential in this environment and none can be created by an
agent on someone's behalf. This is a provider boundary, not a missing script.
Recorded as handbook item **F8**; if the Founder completes (1)–(3) and supplies
the refresh token as a Vercel environment variable, campaign creation and
reporting both become automatable.

Until then the Founder creates campaigns in the console, and the agent reads
the CSV exports (handbook **O4**).

---

## 2. The recommendation, and where it departs from the brief

The brief nominated **World Games hardcover** first, because its contribution
per unit is the strongest of the proven formats. A live market validation says
open elsewhere.

### The market, read 2026-09-02

Ten titles across the three proposed keywords. Median $12.99, high $24.95, and
**every one of them has a sales rank** — the category sells, we simply are not
in it.

The decisive row: the **Oxford History of Board Games**, hardcover, **$24.95
for 400 pages**, 65 reviews. Ours is **$34.99 for 160**. There is no version of
a click that ends well when the comparison shopper opens both tabs.

### The arithmetic

| Format | List | Print cost | Net/unit | Break-even ACOS | Max CPC @8% | Max CPC @3% |
|---|---|---|---|---|---|---|
| Hardcover | $34.99 | $7.57 | $13.42 | 38.4% | $1.07 | $0.40 |
| Paperback | $22.99 | $2.92 | $10.87 | **47.3%** | $0.87 | $0.33 |
| Large print | $31.99 | $4.94 | $14.25 | 44.5% | $1.14 | $0.43 |

Break-even ACOS is net ÷ list — the fraction of the list price that can go to
advertising before the sale stops paying. The paperback tolerates the most.
Max CPC is net × conversion rate, so the hardcover's apparent advantage exists
only at a conversion rate the price makes unlikely.

### The campaign to run first

```
Type            Sponsored Products, AUTOMATIC targeting
Products        World Games paperback (B0HG3KMK9L) + hardcover (B0HG41F21F)
Budget          $5.00 / day
Default bid     $0.35
Duration        14 days, no end date, reviewed on day 7 and day 14
Purpose         harvest search terms. Not to be profitable.
```

Automatic, not manual, and deliberately. There is **no click history, no
conversion history and no search-term history** for any Valice title. A manual
campaign built on three guessed keywords spends the budget proving the guesses
were guesses. Fourteen days of automatic targeting at $5/day costs at most $70
and returns the one thing that cannot be bought any other way: the words real
buyers actually typed before clicking.

### The campaign to run second

Manual, exact and phrase match, built **only** from search terms in the
automatic campaign's report that produced a click at or below $0.35 — with a
bid at the observed CPC, not at the ceiling. Starting points, from the
validation, ranked by how tight the intent looked:

| Term | Match | Note |
|---|---|---|
| `board games history book` | phrase | tightest intent in the sample; surfaces Oxford, Murray, *It's All a Game* |
| `ancient board games` | phrase | surfaces Murray and the Egypt-to-Catan trade titles |
| `traditional games book` | broad | loosest — pulled in riddle books and a Japanese game book. Broad only, and watch it. |
| `games from around the world` | phrase | the brief's suggestion; not validated separately — treat as unproven |

Product targeting: **0486238555** (Murray/Dover), **1635617952** (Oxford
History), **1250292050** (*It's All a Game*). All three are the right shelf and
none has enough reviews to be unassailable.

---

## 3. Decision rules — fixed before the first dollar

Track per campaign, per ad group and per search term: impressions, clicks, CPC,
spend, orders, ACOS, TACOS, contribution.

| Rule | Threshold |
|---|---|
| **Hard ceiling** | break-even ACOS: **38.4%** hardcover · **47.3%** paperback · **44.5%** large print |
| **Scale** | only when ACOS ≤ break-even − 10 points **and** conversion has held for 7 days |
| **Stop a target** | spend exceeds 2× the contribution of one unit with no order — $27 hardcover, $22 paperback |
| **Stop a target** | search term is clearly off-intent, whatever it costs |
| **Stop a target** | ≥ 20 clicks, 0 orders |
| **Never** | optimise for clicks or impressions. The only success metric is a profitable order. |

TACOS (ad spend ÷ total sales, including organic) is the number that decides
whether advertising is buying rank or just buying sales. It cannot be computed
until there are organic sales to compare against, which is another way of
saying the first campaign is a discovery cost, not an investment.

---

## 4. Amazon Attribution

The plumbing exists and is honest about existing. The storefront's Amazon CTA
prefers a format's `amazonUrl` over the `/dp/<ASIN>` fallback
(`src/components/book-detail/format-table.tsx` → `amazonHref`), so an
Attribution URL pasted into `amazonUrl` in `valice-catalog.mjs` takes effect on
the next catalogue load with no code change. The `amazonAsin` field stays
alongside it, because that is what `verify-amazon.mjs` checks the listing
against — a tracking URL pointing at the wrong book is exactly the failure the
catalogue exists to prevent.

**No attribution tag has been created, so no attribution is claimed.** Tags are
minted in the Attribution console and copied whole; they are signed and cannot
be assembled by hand. The surfaces worth tagging, in order: the book pages'
Buy-on-Amazon buttons, the two companion pages, and any email that links to a
listing.

---

## 5. What would make advertising work better than advertising would

Two things, both cheaper than $70:

1. **Reprice the World Games hardcover.** $29.99 still nets $10.42 and sits far
   nearer the $24.95 anchor the category has set. A price that loses the
   comparison costs more per click than any bid does.
2. **Get one review.** Every competitor in the sample has between 12 and 466;
   we have zero across eighteen listings. Ads send traffic to a page with no
   social proof, which is the most expensive kind of traffic there is.
