# Pilot 1 — The Great Book of World Games

**Status: LARGE PRINT READY FOR KDP · companion LIVE · ads PLANNED, not run** (2026-09-02)

## Objective
Print economics and formats (paperback, hardcover, large print), the Amazon → companion → website bridge, and the first ad plan on a title that is already live.

## Product
160-page paperback ($22.99, B0HG3KMK9L), hardcover ($34.99, B0HG41F21F), Kindle ($11.99, B0HG44FH1B), direct PDF ($11.99, Paddle `pri_01m1btjcqgabh6v8rsxg85frxr`). Project `MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-GAMES` (commit `a6a945d`).

## Production this phase
| Item | Result |
|---|---|
| Existing paperback / hardcover files | verified: `interior.py --check` 160 pp, 56/56 games on a verso, gutter ≥ KDP; `kdp_preflight` green; outputs byte-identical before and after (git-tracked reports unchanged). |
| Hardcover | already live; nothing to produce. Economics: $34.99 → royalty $12.62, break-even ACOS 36.1 %. |
| **Large print** | **built**: 232 pp, 8.5 × 11, body 16 pt, nothing under 12 pt, diagrams at ≥ 1.00 × paperback size, gutter 0.550 in, KDP preflight 30/30 green, fonts embedded; full-wrap cover (spine 0.5225 in) with "LARGE PRINT EDITION"; list **$31.99** → royalty $14.25 (44.5 % break-even ACOS). Files `08_OUTPUT/LARGEPRINT/`; report `06_REPORTS/LARGEPRINT_BUILD_REPORT.md`. Format state: `built → preflight_ok`; upload is the Founder's (R1 in FOUNDER_ACTIONS). Catalogue row `large_print: coming_soon`. |
| Code | `interior.py` large-print mode (type scale, minimum point size, continuous flow per game, running-head fix after a preflight catch), `covers.py`, `editions.py`, `kdp_preflight.py`; `project_config.json → production.largePrint`. |

## Rights
Unchanged (original work; sources per game in the book).

## Companion — `/companion/world-games` (LIVE after this deploy)
Generated from the manuscript by `04_BUILD/companion_pack.py`: game index (3 pp), quick-reference cards (56 cards, 14 pp — no turn sequence, the book stays the product), score sheets (8 pp: general grid, match record, 5 tailored tally sheets only where the rules count), boards pack (31 boards from the book's own SVGs, 32 pp; 25 excluded as too large/not a board). All fonts embedded; footer carries the companion URL. Registry entry with a buy link to the book page; newsletter source `world-games-companion`; `companion_download` events recorded.

## Amazon bridge
Printed URL convention `valicepress.com/companion/world-games` is ready; the **printed** interiors do not yet carry it (the live paperback/hardcover predate the companion). Adding the address is an interior change → a KDP file update → next reprint decision (Founder). The large-print interior does not carry it either — deliberately, so the three editions match; add to all three at the next update.

## Website
Book page: JSON-LD now lists the live print editions as `workExample` Book nodes with Amazon URLs; `view_item` / `sample_read` were already wired; events now land in `analytics_events`.

## Email
`world-games-companion` source added to the allow-list and the client type.

## Ads (planned, not run — no Amazon Ads account: FOUNDER_ACTIONS R4)
| Edition | List | Royalty | Break-even ACOS | Max CPC @ 8 % CVR |
|---|---|---|---|---|
| Hardcover | $34.99 | $12.62 | 36.1 % | ≈ $1.01 |
| Paperback | $22.99 | $10.07 | 43.8 % | ≈ $0.81 |
| Large print | $31.99 | $14.25 | 44.5 % | $1.14 |
| Kindle | $11.99 | $7.19 | 60.0 % | ≈ $0.58 |
Plan: automatic campaign $5/day on the hardcover (target ACOS ≤ 30 %), exact-match on "board games history book", "ancient board games", "traditional games book"; phrase on "games from around the world"; product targeting against Parlett/Bell. Rule: STOP any keyword with spend > 2 × royalty and no order; SCALE only below break-even minus 10 points. Nothing has run; no ad figure exists.

## Results (actual)
Orders since launch: **0** direct (production `orders` table), Amazon sales **unknown** (no KDP report exported — FOUNDER O4). No companion visits yet (page deploys with this phase). No fabricated numbers.

## Blockers
Upload of the large-print edition (Founder). Amazon Ads account (Founder). KDP report export (Founder).

## Time
Agent wall-clock: large print ≈ 1 h 20 min including the preflight fix; companion pack ≈ 25 min (script inherited from a killed agent run, then run and checked). Founder: 0.

## Next decision
Upload the large print at $31.99; export the first KDP report; open the ads account. Then the first real ad test on the hardcover.
