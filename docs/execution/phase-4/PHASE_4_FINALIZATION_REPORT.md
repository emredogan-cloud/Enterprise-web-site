# Phase 4 finalization — KDP catalog bridge, real assets, analytics: report

**Date:** 2026-09-03 · **Branch:** `feat/production-readiness` · **Production:** deployment `dpl_6KckbrkfmJvWAuUo4d5R6ziFAC1u`, commit `9933123`, READY on `production` at 02:36 UTC.

Statuses are used strictly. **VERIFIED** = measured on the system that owns the fact. **OBSERVED** = seen, not measured. **BLOCKED** = named blocker, named owner. **DEFERRED** = deliberately not this pass, with the reason. **UNVERIFIED** = could not be checked from here and is not claimed.

Companion documents in this directory: `KDP_VALICE_LINKAGE_REPORT.md` + `KDP_VALICE_LINKAGE_MATRIX.csv`, `ASSET_MAP.md` + `ASSET_INVENTORY.csv`, `ANALYTICS_EXCLUSION.md`, `COMMERCIAL_RESULTS.md`, `ADS_REPORT.md`, `SEO_REPORT.md`. The Founder handbook is `../FOUNDER_ACTIONS.md`.

---

## 1. The short answer

**Seven of eight print titles now have a free companion worth opening, three more interiors carry the route home at unchanged page counts, every surface of the storefront shows the real cover, and nothing fabricated is left on production.** Zero orders, zero reviews, zero indexed pages — unchanged, and stated first.

What this pass did not do: generate a single image (no OpenAI key exists in this environment — $0.00 of the $4.00 budget), run an ad (no credential exists; verified again), or sell a book. What it did was remove the reasons a customer who *did* arrive would have been lost.

---

## 2. KDP LINKAGE — DONE (matrix), PARTIAL (uploads are the Founder's)

Audited: **18 print editions**, every one by reading its built PDF with `pdftotext` and `pdfinfo` — front matter, imprint, biography, every URL on any host, Amazon references, QR evidence, PDF metadata, false listing claims.

| Status | Editions | |
|---|---|---|
| **COMPLETE** | 8 | World Games ×2 (rebuilt 09-02, awaiting upload U1) · **World Myths ×2 (rebuilt today, U2)** · **Hangul paperback (rebuilt today, U3)** · Dudeney · Enigmatica ×2 |
| **MISSING** | 6 | Codex Mythologica ×3, Codex Bestiarium ×3 — companions built today; interiors at the next revision (no blank leaf; spine change) |
| **NEEDS_REVISION** | 2 | World Games large print (invented biography; in review — untouched by rule) · Field Book paperback (PDF metadata *untitled / anonymous*, newly caught) |
| **IN_REVIEW** | 1 | Hangul hardcover |
| **BLOCKED** | 1 | Field Book hardcover — never built |
| **NOT_APPROPRIATE** | 0 | no edition where a link is prohibited |

**Updated now, VERIFIED:** World Myths paperback + hardcover (234 → 234 pages; only pp. 231 and 233 differ; all fonts embedded; build gate 24/24), Hangul paperback + hardcover (124 → 124; only p. 122 differs; name font verified embedded after one rebuild without `fontTools` silently dropped it — caught by `pdffonts`, fixed with a venv). **Deferred, with reasons:** Mythologica (2026-11-03, Select lapse), Bestiarium (bundle with the 120 → 112 correction), Field Book (metadata + URL at the next build; pipeline not run this pass), World Games large print (in review).

**Author information:** the invented biography survives only in the World Games large print (in review). The approved text is now in seven interiors; Bestiarium prints a factual but non-canonical one; four books print none. On the site, `/authors/emre-dogan` and `/about` print the approved text — VERIFIED by `validate-catalog`'s fabrication sweep. Author Central: UNVERIFIED from here.

**The factory now enforces it:** `compliance-lint.mjs` (Gate 10) runs the audit on the project's built interiors; `gates.json` says so; seven tests build real PDFs and read them back.

## 3. ASSETS — DONE

| | |
|---|---|
| Placeholder surfaces fixed | homepage featured books, homepage category cards, `/categories`, `/authors`, `/blog`, `/cart` (lines + shelf), `/account/library` (tiles, list, shelf), `/books/[slug]` related shelf, `/search`, `/order/[id]`, `/account/orders`, `/categories/[slug]`, `/authors/[slug]` |
| Root cause | no single answer to "what is this book's cover": three routes checked the filesystem, seven never asked. Fixed with `src/lib/asset-map.ts` + a committed manifest; every query attaches `coverSrc`; one `<CoverArt>` primitive |
| Real assets mapped | 9 covers (all routes) · 34 preview pages · 2 public-domain author likenesses (Commons, licences read from the API) · 7 article images (4 from the books' own material, 3 existing scenes) · 6 category cards composed of their real covers |
| Generated | **none** — `OPENAI_API_KEY` absent; **$0.00 spent** |
| Removed | AI-generated "founder portrait" presented with the Founder's name · AI-rendered Marcus Aurelius bust · a fictional "Luminous Library" cover · 17 genre paintings for categories this press does not have · the procedural genre-world matcher · the "10K+ / 50K+ / 2M+ / 120+" stats strip and its dead "Apply Now" · the constant 4.7 ★ on search |
| Remaining gaps | no real Founder portrait exists (designed initials mark by rule); signed-in library/order surfaces could not be screenshotted from this session (same code path as the public ones; covered by tests and the production validator) |

Inventory with dimensions and referencing files: `ASSET_INVENTORY.csv`. `npm test` fails when the manifest is stale.

**Visual regression, production, OBSERVED at 1440 px:** home — five category cards fanned with their real covers, featured books with real covers; `/categories` — real covers; `/authors` — initials mark, Dudeney photograph, Marcus Aurelius bust; `/cart` — eight real covers, Amazon-only titles show a link-out glyph instead of an add button; `/companion/world-myths` renders. `/blog` and `/search` returned the perimeter rate limiter's "Too many requests" during the same minute as the agent's own two production sweeps; re-checked below.

## 4. AMAZON

| | |
|---|---|
| Listings | **19 of 19 answer, every price matches the catalogue** (VERIFIED 2026-09-03 05:10 UTC) |
| ASIN updates | none — nothing new is live. World Games large print recorded as **in review**; Hangul hardcover in review |
| Discounts Amazon applies itself | World Myths paperback $8.90 vs $14.99; hardcover $12.99 vs $26.99; Field Book $13.91 vs $14.99 |
| Ads | **BLOCKED — re-verified**: no credential in the environment, LWA 400, Ads API 401. Campaign spec unchanged (paperback, $5/day, auto, 14 days). Handbook F5 |
| Attribution | **no tag exists; none claimed.** The catalogue accepts a pasted tracking URL with no code change |

## 5. WEBSITE — VERIFIED on production (`validate-catalog`: 34 pass · 0 warn · 0 error · 1 skipped)

Real covers on every route (new cover-consistency check); categories from real covers; authors with a designed mark and two public-domain likenesses; featured books with real covers, honest price/"On Amazon" labels and an "Ebook · direct / Print · Amazon" line; library and cart draw the same covers; blog rows carry real figures; seven companion pages and every companion asset answer 200; the public pages carry none of the once-invented strings.

## 6. ANALYTICS — DONE, on the supported mechanism

Vercel offers no IP or account exclusion; its documented filter is `beforeSend` (and its documented opt-out reads `localStorage["va-disable"]`). Built: a gated `<Analytics>`/`<SpeedInsights>`, a per-browser switch on `/account/settings` that sets `va-disable` and a `vp_internal` cookie for a year, and a server-side drop in `/api/events` for that cookie or an `x-valice-internal` header. Every agent probe sends the header. Purchase telemetry untouched. **Founder step F6:** press the switch in each browser. Seven events recorded before this shipped are noted as probable internal traffic. Details: `ANALYTICS_EXCLUSION.md`.

Real events, VERIFIED: 6 `view_item`, 1 `sample_read`, 0 of everything else, all time.

## 7. COMMERCIAL — unchanged

Prices: World Myths $6.99, World Games $11.99, Dudeney $9.99, Bestiarium $12.99, Enigmatica $9.99, Meditations $9.99 direct; all matched to Kindle where a Kindle edition exists; **no price moved** (`COMMERCIAL_RESULTS.md`). Live direct products: **6**. Actual sales: **0**. Paddle transactions: **0**.

## 8. SEO

Search Console 2026-08-04 → 09-01: **0 clicks, 0 impressions, 23 URLs submitted, 0 indexed**; Google had not re-fetched the sitemap since 09-02 07:10. **Re-submitted through the API today (accepted, 204)**; the sitemap now carries all seven companions. Nothing is indexed and nothing is claimed to be.

## 9. Tests

`npm run lint` clean · `tsc --noEmit` clean · `npm test` **218 passed** (19 files; +7 linkage-lint tests, +9 asset-map tests) · `npm run build` clean · `validate:catalog` against production 34/0/0 · `kdp-linkage-lint --check-urls`: every printed address answers 200 · asset manifest `--check` fresh · the World Myths and Hangul build gates green · companion PDFs: fonts embedded, hashes in each manifest.

## 10. Phase 5 entry — gate check

| Criterion | State |
|---|---|
| Catalog integrity clean | **VERIFIED** (validator, tests) |
| KDP linkage audited | **VERIFIED** (18/18, matrix) |
| Critical image placeholders fixed | **VERIFIED** on production |
| Direct fulfillment verified | VERIFIED in Phase 4 (PDF + EPUB on the real masters); webhook leg needs F3 |
| Analytics filtered for internal testing | **built**; effective in each browser once F6 is pressed |
| Resend functional | VERIFIED in Phase 4 |
| GSC configured | VERIFIED; sitemap re-submitted today |
| Amazon Ads path available | **BLOCKED** — provider boundary (F5) |
| Attribution available | plumbed; no tag (F5) |
| One live direct product | **yes** — six |
| One active Amazon acquisition experiment | **no** — needs F5 |
| One active companion path | **yes** — seven, three of them printed in interiors awaiting upload |
| Measurable website funnel | **yes** — `commercial-dashboard.mjs`, event sink, internal traffic excluded |
| Real attribution path where supported | pending a tag |

Phase 5 is entered on the technical criteria. Two commercial criteria are the Founder's to close (F5, U1–U3), and the Phase 5 plan is written around that fact rather than around a pretence.

---

## THE EXIT STATEMENT

**WHAT IS LIVE NOW** — valicepress.com with real covers on every surface, seven free companions, six direct ebooks on sale, the analytics exclusion switch, and a catalogue whose 19 Amazon links are verified.

**WHAT A REAL CUSTOMER CAN BUY NOW** — six direct ebooks: Dudeney ($9.99, PDF + EPUB), Codex Bestiarium ($12.99), Codex Enigmatica ($9.99), World Games ($11.99), World Myths ($6.99), Meditations ($9.99). Fifteen print editions on Amazon.

**WHAT AMAZON CUSTOMERS CAN REACH** — from the books already printed: Codex Enigmatica's verification page (2 editions). From the interiors now built and waiting on upload: World Games (2), World Myths (2), Hangul (1) → seven companions. From the six editions deferred to the next revision: nothing yet.

**WHICH BOOKS HAVE COMPANIONS** — World Games, Hangul, Dudeney (existing); **World Myths, Codex Bestiarium, Codex Mythologica, the Myth Hunter's Field Book (new)**. Codex Enigmatica has a verification page instead. Meditations has none (direct-only, no print edition).

**WHICH KDP INTERIORS WERE UPDATED** — World Myths paperback and hardcover (companion block + QR + approved biography, 234 pp); Hangul paperback and hardcover (companion callout, 124 pp). Plus World Games paperback and hardcover from 2026-09-02. All six await the Founder's upload.

**WHICH PLACEHOLDERS WERE REMOVED** — gradient covers on ten route families; genre-world scenes; the silhouette portraits (replaced by a designed mark or a real likeness); abstract blog vignettes on seven posts; the fabricated stats strip; the constant rating; the fabricated founder photograph.

**WHICH REAL ASSETS WERE USED** — the nine ingested covers; Dudeney's photograph (PD, c. 1910) and the Glyptothek Marcus Aurelius (PD); the Nine Men's Morris board, the Lesson 3 stroke-order plate, Dudeney's own dissection figure, the Codex sigil wheel; three existing decorative scenes.

**WHICH ASSETS WERE GENERATED** — none. No key, $0.00.

**WHICH ADS RAN** — none.

**WHAT TRAFFIC EXISTS** — Google: 0 clicks, 0 impressions, 0 indexed. First-party: 7 events, all time, most of them the Founder's. Amazon: no sales rank on any edition.

**WHAT SOLD** — nothing. **WHAT DID NOT SELL** — everything.

**WHAT REMAINS BLOCKED** — the three interior uploads (U1–U3), the first ad campaign (F5), the Attribution tag (F5), the Dudeney paperback (F1, F2), the webhook e2e (F3), the ebooks tax category (F4), and the two editions in KDP review.
