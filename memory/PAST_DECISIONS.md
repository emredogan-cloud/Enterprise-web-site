# Past Decisions — Locked Architectural Constitution

> Source of truth: `WEB_SITE_ROADMAP.md` (§2 facts, §8–§12 ADRs). **Consult this file before proposing or changing any architectural direction.** These decisions are **locked**; reopen only if a listed assumption is invalidated (see roadmap §2.2 and §19 "what would change the plan").

## Complexity tier
Tier 2 — mid-complexity transactional content platform. Build a **modular monolith** on managed/serverless infrastructure. Do not over-engineer.

## Locked product decisions (Phase-0 gate)
- **Supply model:** First-party catalog — we own/license the titles. No multi-vendor marketplace.
- **Monetization:** One-time purchase per book (à la carte, perpetual ownership). No subscription.
- **Content protection:** Social DRM — per-buyer PDF watermarking. No hard DRM.
- **Market:** B2C, global (English-first, i18n-ready).
- **Delivery:** Downloadable PDF **and** online reading.

## Locked architectural decisions
- **Frontend — Next.js (App Router), SSG/ISR-first.** Catalog pages are statically rendered for SEO (the growth engine); account/reader surfaces are dynamic and auth-gated. (ADR-1)
- **Database — PostgreSQL on Neon (serverless) via Drizzle ORM + drizzle-kit.** Relational + ACID for fulfillment correctness; schema per the §10 ERD. *(Committed in SUB-PR 0.3.)* (§10)
- **Authentication — Clerk via `@clerk/nextjs`.** Hosted identity (social + email/magic-link) and route protection via `clerkMiddleware`. The Postgres `users` table holds the commercial relationships; a future Clerk-webhook syncer reconciles identity into the local row. *(Committed in SUB-PR 0.5.)* (ADR-8)
- **File storage — Cloudflare R2 (zero egress).** Selling downloads = sustained egress; R2's $0 egress makes cost near-fixed. S3-compatible, so portable. (ADR-6)
- **Payments — Paddle as Merchant of Record (MoR).** Offloads global VAT/sales-tax, PCI scope, and much fraud/chargeback liability. **Not** raw Stripe; Paddle chosen over Lemon Squeezy for broader tax-jurisdiction coverage. *(Committed in SUB-PR 1.5.)* (ADR-2)
- **Content-protection pipeline — async Social DRM.** On the MoR purchase webhook, an idempotent worker (Inngest / Vercel Queues) stamps a per-order watermarked PDF, stores it privately in R2, and serves it via short-lived signed URLs. (ADR-3)

## Explicit rejections
- **Microservices** — rejected at this tier. Enforce module boundaries inside one deployable app to preserve the option to extract a service later. (ADR-7)
- **Hard DRM** (Readium LCP/Adobe), **self-hosted infrastructure**, **custom tax/payments stack**, and **multi-region active-active DB** — out of scope (see roadmap right-sizing).

## Re-open triggers
A publisher hard-DRM mandate (→ Readium LCP), a funded team / high volume (→ revisit Stripe-direct), or a shift to subscription/marketplace would reopen these. Until then, treat as fixed.
