# Website Current-State Audit

> Audited: `/home/emre/Downloads/Valice-Press-Site` (git: `feat/production-readiness`, HEAD `5d4b13d`). This audit re-derives conclusions from source inspection; where the codebase already carries a prior audit (`FINAL_LAUNCH_READINESS_REPORT_TR.md`, `PHASE_G1_PRODUCTION_READINESS_REPORT_TR.md`, `ROADMAP_COMPLETION_SUMMARY_TR.md`), those are cross-checked, not duplicated. **FACT** = verified in source/config. **INFERENCE** = reasoned from evidence. **RECOMMENDATION** = strategic advice.

## 1. What the site actually is today

FACT — This is a fully coded, single-tenant **digital bookstore** for one-time-purchase, DRM-free (social/watermark) ebook sales:
- Next.js 16 App Router, TypeScript, Tailwind v4 + shadcn/ui ("cinematic dark emerald" design language).
- Neon Postgres (serverless) + Drizzle ORM, 14 tables / 7 enums (`src/lib/db/schema.ts`).
- Clerk auth, route-protected via `src/proxy.ts` (`/account`, `/admin`, `/order`, `/read`).
- Cloudflare R2 for two private buckets: source masters + per-order watermarked artifacts.
- **Paddle** as Merchant of Record for checkout (handles global tax/PCI).
- **Inngest** for the async watermarking worker.
- **Resend** for transactional email and a real Audiences-based newsletter (`/api/newsletter`).
- Sentry + Vercel Analytics/Speed Insights for observability.

FACT — Internal metadata (`src/lib/seo.ts:22`) sets `SITE_NAME = "Digital Bookstore"`, a generic placeholder brand — not "Valice Press." The one page that does say "Vâliçe Press" is `/codex-enigmatica/verify` (hardcoded in that page's edition metadata). **This is a real, fixable brand inconsistency**, not a hypothetical risk — anyone crawling metadata/OG tags today sees "Digital Bookstore," not Valice Press.

## 2. What is READY

| Area | Evidence |
|---|---|
| SSG/ISR catalog routes | `/`, `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]`, `/blog*`, `/sitemap.xml` — statically rendered, 1h ISR (ADR-1) |
| Checkout → fulfillment pipeline (code) | Paddle webhook → idempotent order/entitlement UPSERT → Inngest watermark job → R2 artifact → Resend "ready" email — all coded, tested, sandbox-verified end to end (Phases A–F, merged to `main`) |
| Ownership/AuthZ | Single `resolveEntitlementAccess` chokepoint gates library/download/reader; revoked entitlements correctly lose access |
| Refund/chargeback handling | Paddle `adjustment.created` → order `refunded` + entitlement `revoked`, `commerce_events` audit trail, alerting |
| Reader | `/read/[bookId]` — pdf.js, signed short-TTL R2 URLs, reading-progress persistence, ownership-gated |
| Newsletter infra | Real Resend Audiences integration, single master audience + `source` tag (`home`/`article`/`category`/`codex-verify`) — **this already matches the recommended email architecture in §7 of the business plan** |
| Legal pages | `/privacy`, `/terms`, `/refund`, `/kvkk` exist |
| Test/build discipline | 53/53 tests, lint, tsc, build green per last recorded run |

## 3. What is PARTIALLY READY

| Area | Gap |
|---|---|
| Catalog content | **Exactly one real book exists**: *Meditations* (public-domain, George Long 1862 translation), $9.99 list. `src/components/catalog/demo-books.ts` ships 11 **fake placeholder titles** (The Midnight Library, Atomic Habits, Dune, 1984, Sapiens, etc.) used only as UI fallback when the DB has no real inventory — these are not real products, but if ever shown to a real visitor without an obvious "demo" label, they read as false advertising. |
| Prod Paddle pricing | `books.paddlePriceId` for Meditations in **production DB** is a fake test id (`pri_test_meditations_999`) — a real checkout would fail. Sandbox has a real sandbox price. |
| Prod DB schema | `commerce_events`, `watermark_jobs`, `reading_progress`, `download_logs`, and some `entitlements` columns are unverified/possibly missing in the **production** Neon DB (`db:push`-based, no migration journal). |
| Inngest | Coded and sandbox-verified; **not deployed/synced to Inngest Cloud for production** — a live purchase today would enqueue a fulfillment event that nothing processes (entitlement stuck `pending`). |
| Brand identity | "Digital Bookstore" vs "Valice Press" mismatch (see §1). |
| Codex Enigmatica integration | The book's answer-verification back matter infrastructure exists (`/codex-enigmatica/verify`, noindex, normalized string comparison, newsletter source tag `codex-verify`) — but **the book itself is not in the website catalog** for sale. This is reader-magnet infrastructure with no product behind it yet. |

## 4. What is BROKEN / NOT PRODUCTION-SUITABLE right now

- **Live checkout will fail** — fake Paddle price ID in prod, no live Paddle account/keys.
- **Vercel Deployment Protection** was previously found returning 401/SSO-gated — public visitors could not reach the site at all until this is turned off and verified.
- **No real catalog** — a visitor today can browse a "bookstore" with one buyable title.

## 5. UNIMPLEMENTED (by design, not gaps)

Per `memory/PAST_DECISIONS.md` (locked ADRs): no subscription, no multi-vendor marketplace, no hard DRM. These are deliberate scope boundaries, not technical debt — see `DIRECT_SALES_BUSINESS_MODEL.md` for whether they should be revisited.

## 6. Scorecard (0–100, with reasoning)

| Dimension | Score | Reason |
|---|---|---|
| Architecture/code quality | 85 | Idempotent commerce pipeline, single AuthZ chokepoint, audited by 6 internal phase reports; genuinely strong engineering |
| Catalog/content | 8 | One real SKU; everything else is placeholder |
| Checkout readiness | 20 | Code complete; fake price id + no live MoR account = 0% functional today |
| Digital delivery | 75 | Fully coded and sandbox-proven; blocked only by Inngest prod sync + DB migration |
| Search/discovery | 55 | FTS + filters exist in code; nothing to discover because catalog is empty |
| Email capture / CRM | 65 | Real single-audience Resend integration with source tagging; no automation sequences built yet |
| Analytics | 50 | Vercel Analytics/Speed Insights + Sentry wired; no funnel/consent-mode/GSC-level instrumentation confirmed live |
| SEO scaffolding | 60 | Sitemap, ISR, metadata factory, breadcrumbs, schema.org — all present, but nothing to rank because there's no real content yet |
| Legal readiness | 55 | Terms/privacy/refund/KVKK pages exist; content not verified against a live payment/print flow |
| Brand consistency | 30 | "Digital Bookstore" internal branding vs "Valice Press" external/print branding |
| Conversion readiness | 15 | No functioning purchase path yet |
| Scalability | 80 | Serverless stack (Vercel/Neon/R2) scales without re-architecture at this business's likely volume |

## 7. NOW / NEXT / LATER / DO NOT BUILD YET

**NOW**
- Fix the B1–B5 blockers already identified in `FINAL_LAUNCH_READINESS_REPORT_TR.md` (live Paddle, Inngest prod sync, prod DB migration, Deployment Protection, one live smoke test).
- Rebrand site metadata/UI from "Digital Bookstore" → "Valice Press."
- Load the real catalog: Meditations (already built) + any genuinely-owned/PD titles ready for direct sale.
- Decide, per book, whether it needs its own landing/verification page (the Codex Enigmatica pattern is reusable for future puzzle titles).

**NEXT**
- Bundles, cross-sell shelves (code scaffolding — `related-books-shelf.tsx`, `explore-strip.tsx` — already exists, needs real data).
- Newsletter automation sequences (welcome, post-purchase, next-book).
- Public-domain catalog expansion (see `PUBLIC_DOMAIN_CATALOG_STRATEGY.md`).

**LATER**
- Institutional/B2B sales portal.
- Any subscription/page-read product (only if `DIRECT_SALES_BUSINESS_MODEL.md`'s threshold is met).

**DO NOT BUILD YET**
- Multi-vendor marketplace (explicitly rejected in `PAST_DECISIONS.md`).
- Hard DRM.
- Subscription/KU-style page-read billing before there is a real multi-book catalog.
