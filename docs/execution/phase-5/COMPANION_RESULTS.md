# Phase 5 — Companion results

**Read at:** 2026-09-03, second pass · `analytics_events` where `event = companion_download`; Vercel Analytics page views (Hobby plan: page views only, no custom events).

## What is printed, where, and how big

Every row measured off the built PDF today: the page is located by the house standing line, and the code is found and measured from its finder patterns by `scripts/factory/measure-qr.py` — not inferred from a caption.

| Companion | Live | Dedicated page | Code, measured | At KDP | Downloads | Signups |
|---|---|---|---|---|---|---|
| `/companion/world-games` | yes | pb + hc **p. 160**, lp p. 233 | 2.93 in · 2.26 mm/module | **awaiting A1, A2** (lp held) | 0 | 0 |
| `/companion/world-myths` | yes | pb + hc **p. 233** | 2.08 in · 1.59 mm/module | **awaiting A3, A4** | 0 | 0 |
| `/companion/hangul` | yes | pb + hc **p. 125** | 2.85 in · 2.50 mm/module | **awaiting B1** (hc in review) | 0 | 0 |
| `/companion/dudeney` | yes | pb **p. 144** | 2.52 in · 1.94 mm/module | not listed (F1, F2) | 0 | 0 |
| `/companion/codex-bestiarium` | yes | pb + hc **p. 436**, lp p. 600 | 2.08 in · 1.60 mm/module | held for O4 | 0 | 0 |
| `/companion/codex-mythologica` | yes | pb + hc **p. 330**, lp p. 579 | 2.12 in · 1.63 mm/module | held to 2026-11-03 | 0 | 0 |
| `/companion/myth-hunters-field-book` | yes | pb **p. 156** | 2.06 in · 2.21 mm/module | **awaiting A5** | 0 | 0 |
| `/codex-enigmatica/verify` | yes | pb **p. 274**, hc **p. 276** | 2.08 in · 1.61 mm/module | **awaiting A6, A7** | n/a | n/a |

Seven companions and one verification page. **Every one now stands on a page of its own** — before today, four of them were a paragraph, a caption or a line inside the imprint.

## What changed today

| | Before | After |
|---|---|---|
| Editions whose address is on a dedicated page | **0** | **17** |
| Editions carrying a QR at all | 2 (World Myths pb + hc, ~1 in) | **17** |
| Smallest code in the catalogue | ~1.0 in, in a corner | **2.06 in**, centred, in clear space |
| Editions the linkage lint calls NEEDS_REVISION | 2 | **0** |

## What has been measured

**Nothing.** No companion page view, no download, no signup, on any of the eight addresses. That is not a disappointing result — it is the expected one: **not a single interior carrying a code has reached a reader yet.** Six of the seventeen files are held for scheduled KDP visits, two are in review, and the remaining nine wait on uploads that take about half an hour in total.

The first honest reading of this table is possible **thirty days after A1–A5 are uploaded**, and not before. Until then every zero here measures the upload queue, not the reader.

## Verification, today

- all seven companion pages and **22 companion assets** answer 200 on production (`validate-catalog`: 28 pass · 0 warn · 0 error)
- every printed address answers 200 (`kdp-linkage-lint --check-urls`)
- each code was read back off the finished page module by module and matched the URL it is meant to carry
- a printed address typed in the wrong case now redirects instead of 404ing — two of these books are set in a face whose lowercase glyphs are small caps, so a reader copying what they see types capitals (`src/lib/printed-address.ts`)
