# 90-Day Execution Plan

> Every task: objective, expected impact, complexity, dependencies, measurable result. Nothing here builds subscriptions, marketplaces, or new architecture — per the master prompt's explicit "do not build the whole business yet."

## Weeks 1–2 — Foundation (make the one real sale actually work)

| Task | Objective | Impact | Complexity | Dependencies | Measurable result |
|---|---|---|---|---|---|
| Fix Meditations `paddlePriceId` in prod (real live Price) | Unblock the only currently-buyable book | Enables first real dollar | Low | Live Paddle account (B1) | Checkout completes with real payment |
| Provision Paddle production account + live webhook | Remove the single biggest launch blocker | Critical path | Medium (Paddle approval can take days — external dependency) | None | Live webhook receives signed `transaction.completed` |
| Sync Inngest function to production | Fulfillment actually runs after purchase | Critical path | Low | Inngest prod keys | `process-fulfillment-transaction` visible in Inngest Cloud dashboard |
| Apply missing prod DB migration (`commerce_events` etc.) | Audit trail + refund/revoke path work in prod | Required for safe launch | Low | Direct Neon-driver DDL (per known `db:migrate` limitation) | Verification SQL from `FINAL_LAUNCH_READINESS_REPORT_TR.md` §5 returns non-null |
| Turn off/verify Vercel Deployment Protection | Public visitors can reach the site at all | Critical path | Trivial | None | Anonymous browser loads site without SSO wall |
| Rebrand `SITE_NAME` "Digital Bookstore" → "Valice Press" + audit OG/meta | Brand consistency across every crawled surface | Medium — first impressions, SEO entity consistency | Low | None | `src/lib/seo.ts` and metadata factory updated; spot-check OG tags |
| One live low-value smoke purchase | Prove the full loop | Confidence gate before any traffic | Low | All above | Real order → entitlement ready → download/read works → refund → revoke works |

## Weeks 3–4 — Conversion

| Task | Objective | Impact | Complexity | Dependencies | Measurable result |
|---|---|---|---|---|---|
| Remove/clearly label demo placeholder catalog (Midnight Library, Atomic Habits, etc.) | Prevent false-advertising appearance | High (trust/legal) | Low | None | No fake bestseller titles visible to a real visitor |
| Publish Codex Enigmatica as a real catalog entry (if confirmed available for direct sale — check KDP Select status first) | Give the existing verification-page funnel somewhere to land | High — closes an existing infra loop | Medium | KDP catalog snapshot from Founder (`KDP_CATALOG_AUDIT.md` §5) | Book page live, purchasable or Amazon-linked correctly |
| Add "Buy on Amazon" links wherever print exists | Capture print demand without building fulfillment | Medium | Low | Real ASINs from Founder | Working outbound links on relevant book pages |
| Wire post-purchase email capture (not pre-purchase) | Grow list from real buyers | Medium | Low | Existing newsletter infra | New subscribers tagged appropriately |
| Basic funnel analytics check (visits → book page → checkout start → completed) | Establish KPI baseline | Medium | Low | Existing Vercel Analytics | First real numbers in `KPI` tracking sheet |

## Month 2 — Catalog + Email

| Task | Objective | Impact | Complexity | Dependencies | Measurable result |
|---|---|---|---|---|---|
| Add 3–5 more curated PD editions (per `PUBLIC_DOMAIN_CATALOG_STRATEGY.md` A-tier) | Give SEO and bundles something to work with | High | Medium (translation-selection diligence per title, real typesetting) | Founder time or contracted editorial work | 4–6 real, purchasable titles live |
| Build welcome + post-purchase email automations | Convert list into repeat revenue | Medium-High | Low-Medium | Existing Resend Audience infra | Automations firing on real signup/purchase events |
| Replicate Codex Enigmatica back-matter pattern for any second puzzle title | Repeat the one channel proven to work | High if a second puzzle title exists | Low (pattern already built) | A second title | New verify-style page live |

## Month 3 — Revenue Expansion

| Task | Objective | Impact | Complexity | Dependencies | Measurable result |
|---|---|---|---|---|---|
| Launch first bundle (3+ related titles) | Increase AOV | Medium | Low (UI exists) | ≥3 titles in one coherent group | Bundle purchasable, priced per `WEBSITE_REVENUE_MODEL.md` §3 |
| Review 90-day KPIs; decide go/no-go on Month-4+ scope (more PD titles vs. institutional outreach vs. still-premature subscription) | Data-driven next phase | — | — | 60+ days of real traffic/conversion data | Documented decision, not a guess |

**RECOMMENDATION:** Do not start Month 2/3 catalog work until Weeks 1–2's "foundation" tasks are fully verified live — every later stream depends on checkout actually working.
