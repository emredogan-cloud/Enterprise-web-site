# Phase 5 — SEO results

**Read at:** 2026-09-03, second pass · `node scripts/seo/gsc-export.mjs --key valice-press-seo-89a35cede5b2.json --days 30`. Raw: `gsc-2026-09-03-afternoon.json`.

## Search Console, 2026-08-02 → 2026-09-01

| | |
|---|---|
| Clicks | **0** |
| Impressions | **0** |
| CTR | 0.00 % |
| Average position | — (no impressions) |
| Top pages | none |
| Top queries | none |
| Top countries | none |

## The sitemap — the one thing that moved

| | Phase 4 (this morning) | Now |
|---|---|---|
| Last submitted | 2026-09-03 02:39 UTC | 2026-09-03 02:39 UTC |
| **Last downloaded by Google** | 2026-09-02 07:10 | **2026-09-03 02:39:03 UTC** |
| URLs submitted | 23 | **41** |
| **Indexed** | **0** | **0** |

Google fetched the sitemap three seconds after it was submitted, and it now lists 41 URLs including all seven companions and the four reference articles. **Nothing is indexed.** Fetching a sitemap is Google agreeing to look at a list; it is not agreeing to index anything on it, and the difference is the whole of this phase's SEO position.

## Pilot A, read honestly

Dudeney's four pages — `/blog/haberdashers-puzzle`, the three other reference articles, and `/books/the-puzzles-of-henry-dudeney` — are live, in the sitemap, and have **zero impressions in thirty days.** A page with zero impressions is not ranking badly. It is not in the index.

## The decision this sets up, with a date

Re-read Search Console on **2026-09-06** and **2026-09-10**.

- If the URLs read *Discovered — currently not indexed* on 09-10, **that is a finding, not a patience problem**, and the causes worth checking in order are: robots/canonical, thin or duplicative content, and domain trust on a site registered five days ago with no inbound links.
- If they read *Crawled — currently not indexed*, Google has read them and declined. That is a content judgement and the answer is better pages, not more pages.
- If impressions appear at all, the first honest question is which query, not how many.

**No decision before 09-10.** A domain registered on 2026-09-01 with zero backlinks is not expected to be indexed in three days, and reading a zero at day three as a defect would produce a fix for a problem that does not exist.

## What is not blamed

Not the technical layer. `validate-catalog` passes 28 checks against production including the sitemap, canonical hosts, and structured data; the four utility pages shipped in Phase 4; the sitemap is fresh and Google has read it. **Nothing on this list is what is stopping indexing**, which is why the next move is to wait one week and then look at the reason Google gives, rather than to build more.
