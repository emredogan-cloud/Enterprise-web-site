# Phase 2 v3 — First commercial production: report

**Date:** 2026-09-02 · **Branch:** `feat/production-readiness` · **Site commit:** `56ce3b8` (promoted to production; deployment id in §9) · **Book repos:** Hangul `bc3c512`, World Games `a6a945d`, Dudeney (new project, no git)

Honesty rule applied throughout: DONE means built, measured and verified; PARTIAL means built but a step is missing; BLOCKED names who holds the key. No ASIN, ISBN, sale, review, delivery or ad figure in this document is invented.

## 1. What was produced
| Product | State |
|---|---|
| Korean Hangul Handwriting Workbook — remediated edition (paperback 124 pp, hardcover 124 pp, Kindle fixed-layout) | **DONE** — rights-clean in the files, all QA green, final package rebuilt |
| The Great Book of World Games — Large Print (232 pp interior + full-wrap cover) | **DONE** — preflight 30/30, priced $31.99 |
| World Games companion pack (index, cards, score sheets, 31 boards) | **DONE** — live at `/companion/world-games` |
| The Puzzles of Henry Dudeney — annotated edition (144 pp PDF, EPUB 3, covers, previews, R2 master) | **DONE** — built end to end; not on sale |
| Dudeney companion (12 puzzle sheets, hints booklet) | **DONE** — live at `/companion/dudeney` |
| First-party analytics sink (`analytics_events`, `/api/events`, admin read, server-side `purchase`) | **DONE** — table live in production, endpoint returns 204 |
| Newsletter sources, EMAIL_FROM fix, JSON-LD print editions, catalogue data | **DONE** in code; **catalogue load to the production DB BLOCKED** (permission layer) |

## 2. What was published
Nothing new was put on sale. Two companion pages went live. The Hangul, large-print and Dudeney products are staged behind founder gates, as the brief requires ("do not publish automatically until Gates 2, 5, 8, 10, 12 are satisfied").

## 3. KDP-ready
- **World Games Large Print** — files, price, preflight, upload steps: `06_REPORTS/LARGEPRINT_BUILD_REPORT.md`. Founder uploads (R1).
- **Hangul** — remediated interiors in `09_OUTPUT/FINAL/`; KDP currently holds the pre-remediation files in review; Founder signs Gate 2 and replaces the files (U1).
- **Dudeney paperback** — `OUTPUT/interior-main.pdf` + `OUTPUT/cover-paperback.pdf`, 6 × 9, 144 pp, preflight ok, $14.99 proposed; needs the Gate 1 market sample and Gate 2 first.

## 4. Direct-sale-ready
- **Dudeney** — master in R2 (bucket question in §16), previews rendered, storefront cover, catalogue entry drafted at $9.99, Paddle product listed in `paddle-products.mjs`. Missing: the Paddle object itself and the catalogue load — both one-line commands that the tool-permission layer refused to let the agent run (§16).
- **Hangul** — not priced until Gate 2.

## 5. Hangul rights remediation
See `PILOT_HANGUL.md`. Summary: three licence-incompatible sources withdrawn (not relabelled), replaced by a KOGL Type 1 word list and a public-domain phonetics text; one word replaced; all glosses rewritten; every edition rebuilt; QA 273 checks and 257 self-tests green; `RIGHTS.md` written; ledger rows YELLOW pending the Founder's signature. Remaining A7 items are Founder-only (cover art, AI declaration).

## 6. World Games pilot
See `PILOT_WORLD_GAMES.md`. Large print built with the existing engine extended (type scale, minimum 12 pt, continuous flow, diagrams at paperback size); a running-head margin defect was caught by the preflight and fixed. Companion pack generated from the manuscript. Ads planned with break-even ACOS per edition; no account, nothing run.

## 7. Dudeney pilot
See `PILOT_DUDENEY.md`. 544 puzzles parsed from two Gutenberg sources, 110 selected and annotated (27.9 % editorial share), typeset, EPUB validated, covers generated typographically, staged for direct sale. Two unembedded-font defects found by the preflight and fixed. One factual claim left UNVERIFIED and flagged.

## 8. Amazon results
UNVERIFIED — no KDP report exported (Founder O4). No new ASIN this phase.

## 9. Website results
Production deployment `dpl_3XguJVYuy3sMup3s9KyzEpnT8gL1`, promoted from the branch build of `56ce3b8` at 2026-09-02 14:18 UTC (production branch on Vercel is still `main` — O5). Measured after promotion (14:20 UTC): `/companion/world-games` and `/companion/dudeney` 200 with their PDFs (200 `application/pdf`); `/api/events` returns 204 for a valid event and 204 (dropped) for an unknown one; the sitemap carries all three companions; the World Games page's JSON-LD carries `workExample` for the three live print editions; the Dudeney storefront cover is served. Orders: 0. Traffic: no funnel data existed before this deploy (custom events were being dropped on the Hobby plan); the sink starts now — the first stored row is the agent's own `view_item` test (see the production read-back in this section's follow-up).

## 10. Companion results
Two new companions live; Hangul companion unchanged. Downloads recorded from now on (`companion_download`). No visits yet.

## 11. Email results
Root cause of "no welcome email" found in production logs: Resend refused every send because the From address was the test-mode `onboarding@resend.dev` ("You can only send testing emails to your own email address"), and the audience properties (`source`, `consent_text`…) do not exist, so consent was not being recorded. Fixed: `EMAIL_FROM = Valice Press <hello@valicepress.com>` set in Vercel (production + preview) and deployed with this build. Not fixable by the agent: the audience properties (Resend dashboard, U3). **Delivery test after the deploy (14:20 UTC, alias signup with source `dudeney-companion`): still no email.** The production log now says: "The valicepress.com domain is not verified. Please, add and verify your domain on resend.com/domains." So the Resend account behind the production API key does **not** hold `valicepress.com` as a verified sending domain — contrary to the "sender domain verified" premise; either the domain was verified in a different Resend team/account, or only a subdomain was, or verification is still pending. The From address is now correct in shape; the domain status is the remaining defect and it is dashboard-only (U3, updated).

## 12. Ads results
None — no Amazon Ads account. Plan and thresholds in `PILOT_WORLD_GAMES.md`.

## 13. Actual production hours (agent wall-clock, 2026-09-02 08:00–17:40 UTC, interleaved)
| Pilot / stream | Hours | Notes |
|---|---|---|
| Hangul remediation + rebuild + QA + docs | ≈ 2.5 | R6 rights 1.0 · R3 content 0.5 · R9 build/QA 0.7 · docs 0.3 |
| World Games large print + companion | ≈ 1.75 | R7 design/typesetting 1.2 · R9 preflight 0.3 · companion 0.25 |
| Dudeney end to end | ≈ 4.7 | R1/R6 sources 0.4 · R2 spec 0.2 · R3/R5 editorial 1.9 · R7 typesetting/EPUB/cover 1.5 · R9 ops 0.4 · docs 0.3 |
| Site (analytics, companions, SEO, catalogue, email) | ≈ 1.5 | |
| Reports, handbook, memory | ≈ 0.6 | |
| **Total** | **≈ 11** | three pilots ran in parallel at different stages; no context leakage observed (separate repos, separate scripts); three subagents launched for the builds were killed by the API rate limit within seconds and all work was done in the main session |
Founder hours this phase: 0 (nothing was asked).

## 14. AI/API costs
- Image generation: **$0** (no image model called; the $4 budget is untouched; the Dudeney cover is geometry).
- Session tokens: **not metered per project** by the provider; `valice-house/cost/ledger.jsonl` carries `usd: 0` entries with a note saying exactly that — not an estimate of zero.
- Other APIs: Vercel, Paddle (read), R2, Neon — no metered cost beyond existing plans.

## 15. Founder hours
0 in this phase. Requested next: ≈ 30 min (Hangul signature + KDP files), ≈ 20 min (large-print upload), ≈ 20 min (Dudeney gates + two commands), ≈ 10 min (Resend properties).

## 16. Blockers (who holds the key)
1. **Tool-permission layer** blocked two production writes the agent had prepared and dry-run: `provision-paddle.mjs --commit --i-know-this-is-live` (creates the Dudeney price) and `load-catalog.mjs --commit --i-know-this-is-production` (loads nine books / 28 formats). They are safe, idempotent, one-line commands; FOUNDER_ACTIONS R2 gives them verbatim. Until run, the production catalogue is the pre-Phase-2 one.
2. **R2 bucket** — the local env names `bookstore-masters-dev` and that is where all six masters (five old, one new) verifiably are; the setup guide says production uses `bookstore-masters-prod`, where none exist under the local token; production's `R2_BUCKET_MASTERS` is a sensitive variable. If production really points at `-prod`, no direct sale has ever had a master to watermark — an inherited defect from before Phase 0, and one to settle before the first Dudeney sale.
3. Founder gates: Hangul Gate 2; Dudeney Gates 2/8/12 and claim C-014; large-print upload; Resend audience properties; Amazon Ads account; KDP report export; author bio.
4. Dudeney Gate 1 (Amazon market sample) not taken.

## 17. Factory bottlenecks (measured)
- **The Founder gate is the bottleneck, not production.** Three products reached "ready" in one day; none can move without a signature, an upload or a dashboard action.
- **Production preflight catches real KDP-fatal defects** (three unembedded-font findings, one margin finding) — worth its cost every time.
- **Editorial reading is the slowest agent stage** (reading 110 puzzles and their solutions before writing hints ≈ 45 min) and the one that does not parallelise.
- **Subagents were unusable** today (API session limit killed all four immediately); parallelism came from running the three pilots interleaved in one session.
- **Verification independence (R4 ≠ author)** was not achievable with one agent; the claims ledger marks this.

## 18. Factory improvements made
`interior.py` large-print mode (World Games) · `upload-masters.mjs` slug filter and same-size skip · `validate-catalog.mjs` placeholder handling (Phase 0 follow-up) · Dudeney pipeline scripts (parse, interior, EPUB, cover, companion) reusable for the next Valice Classic · `analytics_events` sink · `scripts/tmp/apply-migration.mjs` (single-migration apply for a `db:push`-created database) · companion registry generalised (`assetsHeading`, typed sources, buy link, download events).

## 19. Actual capacity evidence
One agent session produced, in ≈ 11 wall-clock hours: one rights remediation with full rebuild, one large-print edition, one 144-page annotated PD edition with EPUB and covers, two companion packs, and the site plumbing — three content projects touched, one created from nothing. That is consistent with the roadmap's 5 projects/month at quality, and with 8–10/month only for templated Lane A/C work where the editorial reading is short. It says nothing about revenue: no unit sold this phase.

## 20. Phase 3 recommendation
1. Founder clears the queue in FOUNDER_ACTIONS (U1–U3, R1–R2) — an afternoon — so three products actually go on sale.
2. Measure for 30 days before producing more: `analytics_events`, first KDP report, first direct order.
3. Next production, in order: Hangul Book 2 (franchise; rights process now proven), a second Valice Classic on the Dudeney pipeline (Epictetus or Loyd), and the two remaining large prints (Enigmatica, Field Book) with the World Games engine.
4. Decide the R2 bucket question and the deploy-branch question (O5) before any customer is promised a download.

## Founder's own folder
`docs/execution/PHASE-REPORT/` holds copies of the Phase 0/1 reports and the handbook that were made outside the repository's canonical layout; it is untracked and was left as found. The canonical files stay under `docs/execution/phase-0/`, `phase-1/`, `phase-2/` and `FOUNDER_ACTIONS.md`.
