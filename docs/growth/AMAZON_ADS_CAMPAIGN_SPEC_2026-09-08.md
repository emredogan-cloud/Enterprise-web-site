# Amazon Ads — first campaign, exact console values (2026-09-08)

**Account state, verified in the console today:** the Amazon Ads account exists
(`Sponsored ads – Author`, entity `ENTITY2XE9WDWG6RB7N`), United States billing profile
**Active**, zero campaigns ever created, $0.00 lifetime spend, Amazon Attribution available.
The Sponsored Products builder loads and accepts the World Games paperback
(`B0HG3KMK9L`, $22.99, in stock) as an advertised product.

**What the agent did:** opened the builder, selected the product, switched targeting to
per-group bids. **What the agent could not do:** the environment's permission classifier
blocked the batch that types bid amounts and negative keywords into the form. That is not a
Founder refusal and it is not worked around. The exact values are below; entering them is
ten minutes.

These values follow `docs/research/VALICE_FIRST_200_DOLLAR_AMAZON_ADS_STRATEGY_TR.html`
§10–13 and the `AMAZON_ADS_MASTER_PLAN_TR.md` §3.5 experiment design. Two things differ from
the console defaults and must be changed by hand: Amazon suggests **$0.75** per group — our
ceiling at 8 % conversion is $0.81, so $0.75 leaves no margin for error; and the builder
selects **Custom text** by default, which is fine, but the text must be entered.

## Portfolio (create first: Campaigns → Portfolios → Create)
| Field | Value |
|---|---|
| Name | `VP · world-games · pb · US` |
| Budget | **Date range, $200.00**, start today, end start + 45 days |
| Why | The hard cap. When the portfolio budget is spent every campaign inside it pauses. |

## Campaign C1 — automatic discovery
| Field | Value |
|---|---|
| Ad format | Custom text |
| Custom text (≤150 chars) | `56 traditional games from 39 cultures, each with sourced rules and a board you can play from tonight. Sorted by how they work.` |
| Product | The Great Book of World Games — **Paperback** — B0HG3KMK9L (only this one) |
| Targeting | Automatic → **Set bids by targeting group** |
| Close match | **$0.45** |
| Loose match | **$0.35** |
| Substitutes | **$0.40** |
| Complements | **$0.30** |
| Negative keywords — **exact** | free · pdf · download · printable · online · app · monopoly · catan · chess set · playing cards · coloring book · video game · kindle unlimited · summary |
| Negative keywords — **phrase** | how to make · how to play · board game table · board game storage · board game insert · board game shelf · game night ideas · for toddlers · ages 3 · expansion pack · replacement pieces |
| Negative product targeting | our own ASINs: B0HG41F21F (hc), B0HG44FH1B (Kindle), B0HHNCVQVX (large print) |
| Campaign name | `VP · world-games · pb · 01-auto · US` |
| Portfolio | `VP · world-games · pb · US` |
| Start / end | today / today + 45 days |
| Daily budget | **$4.50** (days 1–10), then $1.50 (days 11–20) |
| Bidding strategy | **Fixed bids** (not dynamic) |
| Placement adjustments | Top of search 0 % · Product pages 0 % · Rest of search 0 % |
| "Launch in 1 additional country" (beta) | **OFF** |
| Automated rules (beta) | none |

## Campaign C2 — manual exact (open the same day)
| Field | Value |
|---|---|
| Product | B0HG3KMK9L |
| Targeting | Manual → Keyword targeting → **Exact** only |
| Tier 1 @ $0.50 | traditional board games book · board game history book · games from around the world book · ancient board games book · book of board games rules |
| Tier 2 @ $0.40 | world games rules and history · family games for adults and kids · classic board games book · history of board games reference · classroom games activity book |
| Negatives | same exact list as C1 |
| Name | `VP · world-games · pb · 02-exact · US` |
| Daily budget | **$3.00** · Fixed bids · placements 0 % |

## Stop rules (fixed before the first dollar)
| Trip | Action |
|---|---|
| Any target: 30 clicks, 0 orders | pause it; negative-exact the term in C1 |
| Campaign: 100 clicks, 0 orders | pause; the problem is the page (category, reviews, Look Inside), not the bid |
| Real CPC > $0.65 | bids −20 % |
| Impressions < 300/day for 3 days | bids +20 % |
| ACOS > 60 % on a target with ≥ 20 clicks | pause the target |
| Day 20 | apply the decision tree in the $200 report §20 before spending the $40 reserve |

No bid is changed on data younger than 72 hours. Reports are exported on the 3rd of each
month (Campaign, Search term, Targeting, Placement) into `data/ads/`.

## Before launch — the two listing defects found today
1. **Category.** amazon.com shelves the paperback under *Books › Teen & Young Adult › Hobbies
   & Games › Games & Activities*; the "products related to this item" strip is children's
   bedtime books. KDP → the paperback → *Categories* → choose *Humor & Entertainment ›
   Puzzles & Games › Board Games* + *Reference › General* (or *History › General*), and
   confirm the title is **not** flagged as a children's book. Category changes do not take
   the listing down.
2. **A+ content.** The eight A+ images and their copy are built
   (`08_OUTPUT/APLUS/`) but the live page shows no A+ modules. KDP → Marketing →
   A+ Content → the paperback ASIN → publish the six modules. Moderation ≈ 7 days.

Both are conversion fixes on the page an ad sends people to. The ad can start before A+ is
approved; it should not start before the category is corrected.
