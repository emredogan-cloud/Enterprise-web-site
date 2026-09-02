# SEO — Phase 4

Four utility pages shipped. Still zero pages indexed, which is the expected state and worth stating plainly rather than dressing up.

## The measurement

`node scripts/seo/gsc-export.mjs --key <key> --days 28 --inspect …`, read 18:00 UTC.

| | |
|---|---|
| Clicks · impressions, 2026-08-03 → 08-31 | **0 · 0** |
| Sitemap | submitted 07:10 UTC, 0 errors, **23 URLs submitted, 0 indexed** |
| Home | *Discovered — currently not indexed*, never crawled |
| `/books/the-puzzles-of-henry-dudeney` | *URL is unknown to Google* |
| `/blog/board-game-origin-myths` | *URL is unknown to Google* |

The sitemap has not been re-fetched since this morning, so today's four new pages and the Dudeney page are not yet in Google's copy of it. Nothing here is a fault. It is a fifteen-hour-old site index.

## The four pages

Each is built on something only these books contain, which is the only defensible reason for a small publisher to write a reference page at all.

**[Seven things everyone says about old board games that are not true](/blog/board-game-origin-myths)** — the Invented Traditions from the back of *World Games*. Hopscotch was not Roman drill practice; Gomme, who collected the English forms from correspondents across the country in the 1890s, records neither the story nor the origin. Chinese checkers is German and from 1892, published as *Stern-Halma*. Kalah is an American commercial game of the 1940s. Forbes's four-handed-chess genealogy of 1860 was taken apart by Murray in 1913 and is still repeated because it is the better story. Nobody else publishes a debunking list for this shelf.

**[Hangul stroke order](/blog/hangul-stroke-order)** — the rule, the two places it breaks (compound consonants; the leading stroke of ㅊ and ㅎ, which is stroke one and not an accent), the shape rule that lets you predict where a vowel sits before you have met it, and the provenance no competing guide states: 28 of the 40 stroke sequences transcribed from published diagrams, 12 derived from the rule, and the book says which is which.

**[The Haberdasher's puzzle](/blog/haberdashers-puzzle)** — Dudeney's own construction text, why `EH` is the geometric mean doing the real work, the hinged mahogany model shown at Burlington House on 17 May 1905, and the fact that a three-piece dissection has never been found *or* ruled out.

**[World mythology beyond Greece](/blog/world-mythology-traditions)** — nineteen traditions, one entry story each, and why that one.

All four end at a product and a free companion. **None ends at a newsletter form**, which is the rule: free value first, email optional forever.

## Technical state — verified

| Check | Result |
|---|---|
| All four pages | 200, in the sitemap |
| Sitemap | 36 URLs, clean, downloaded by Google without error |
| Canonical host | `www` → apex, 308 |
| Retired `.vercel.app` | 404 |
| Book pages | 200 with valid canonical and parseable JSON-LD |
| `/unsubscribe` | 200, `noindex, nofollow` — crawlable enough to be seen, never indexed |

## What to do next, in order

1. **Wait 72 hours and re-run the baseline.** "Discovered" should become "Crawled" and then "Indexed". If it has not moved in a week, that is a real finding worth chasing and not a patience problem.
2. **Then get the interiors uploaded.** The four new pages are the second-best acquisition asset built this phase. The best one is a companion URL printed in a book someone already paid for — and eleven live editions still do not carry it.
3. **Do not write four more pages yet.** Four that rank beat forty that do not, and none of these four has been crawled once.
