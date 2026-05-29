# Digital Bookstore

> A first-party, B2C digital bookstore with Social DRM.
> Buy a book once, download a watermarked PDF, and read it anywhere — yours to keep.

[![Version](https://img.shields.io/badge/version-1.0.0-1e5c47)](https://github.com/emredogan-cloud/Enterprise-web-site/releases/tag/v1.0.0)
[![Build](https://img.shields.io/badge/build-passing-1e5c47)](#)
[![Tests](https://img.shields.io/badge/tests-25%2F25%20passing-1e5c47)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](#)

---

## Executive summary

Digital Bookstore is a production-ready storefront for selling DRM-free
PDFs of books we own or license. It is deliberately **first-party** (no
multi-vendor marketplace), **one-time purchase** (no subscription), and
**Social-DRM-protected** (per-buyer watermark stamped into every download,
no hard-DRM file locks).

The customer-facing surface is a calm, typography-forward storefront
optimized for organic discovery. The operator-facing surface is a
self-contained admin dashboard that handles catalog management, order
visibility, and book lifecycle (draft → published → archived) without
raw SQL. The fulfillment pipeline is idempotent and observability-
covered, so the same Paddle webhook hitting our endpoint a hundred times
produces exactly one watermarked PDF, one entitlement, and one
"your book is ready" email.

---

## The tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 16** (App Router) | SSG/ISR-first for catalog SEO; Server Actions for mutations |
| Language | **TypeScript** (strict) | Compile-time safety across the data + UI layers |
| Styling | **Tailwind CSS v4** + shadcn/ui (`new-york` style) | Token-driven design system; calm-literary tone |
| Database | **Neon** (serverless Postgres) | WebSocket transactions for atomic fulfillment; branches per env |
| ORM | **Drizzle** + drizzle-kit | Strict types, migration-first, no runtime bloat |
| Authentication | **Clerk** (`@clerk/nextjs`) | Hosted identity (magic-link + social); session JWT at the edge |
| Object storage | **Cloudflare R2** | $0 egress for sustained PDF downloads (S3-compatible API) |
| Payments | **Paddle** (Merchant of Record) | Offloads global VAT / PCI / chargeback liability |
| Async jobs | **Inngest** | Durable, retry-aware steps for the watermark pipeline |
| Rate limit + cache | **Upstash Redis** | Sliding-window limiter + Data Cache backend |
| Email | **Resend** + `@react-email/components` | Transactional "your book is ready" notifications |
| Observability | **Sentry** + Vercel Analytics + Speed Insights | Errors, performance, Core Web Vitals |
| Testing | **Vitest** + @testing-library/react + jsdom | Co-located unit tests; CI-friendly |
| PDF | **pdf-lib** (server stamping) + **pdf.js** (online reader) | Same-origin worker, CSP-strict |
| Hosting | **Vercel** (Fluid Compute) | Native Next.js, edge-aware deploys, ISR everywhere |

---

## Architectural highlights

### SSG/ISR-first rendering (ADR-1)

The catalog routes — home, `/books`, `/books/[slug]`, `/categories/[slug]`,
`/authors/[slug]`, `/blog`, `/blog/[slug]`, `/blog/category/[slug]`,
`/sitemap.xml` — are all **statically rendered** (`○ Static` or `● SSG`)
with 1-hour ISR. Auth-gated routes (`/account/*`, `/admin/*`, `/read/*`,
`/order/[id]`, `/cart`, `/search`) are `ƒ Dynamic`.

The split is enforced at every SUB-PR: every change is verified against
the build's route-classification table to confirm no static page silently
fell over to dynamic. The growth engine (organic search → catalog page
→ checkout) sits entirely on cached HTML; auth-gated surfaces pay the
dynamic cost only when actually used.

### Idempotent fulfillment pipeline

```
Paddle webhook
   │  (HTTPS, signature-verified)
   ▼
/api/webhooks/paddle/route.ts
   │  1. SDK signature unmarshal — bad sig → 401, no DB writes
   │  2. processCompletedTransaction()
   │       ├─ orders UPSERT (mor_order_ref UNIQUE)            ← DB lock layer
   │       ├─ order_items INSERT
   │       └─ entitlements UPSERT (user_id, book_id UNIQUE)   ← DB lock layer
   │  3. inngest.send("fulfillment.transaction.completed")
   ▼
Inngest queue
   │
   ▼
processFulfillment function (src/inngest/functions/watermark.ts)
   │  for each bookId:
   │    step.run("watermark-${bookId}")    ← Inngest checkpoint layer
   │      ├─ short-circuit if entitlement.status === "ready"  ← DB-state layer
   │      ├─ fetch master from R2
   │      ├─ stamp watermark (name + order ref, no email PII)
   │      ├─ upload artifact to R2
   │      └─ entitlement → "ready"
   │    step.run("email-order-ready-${bookId}")
   │      └─ Resend send with idempotencyKey="order-ready:${orderId}:${bookId}"
   │                                                            ← Resend dedupe layer
   ▼
Customer receives exactly one email per book; downloads via signed URL
```

**Three layers of fulfillment idempotency** (DB UNIQUE → Inngest step name →
DB-state short-circuit) plus **two layers of email idempotency** (Inngest
step + Resend `idempotencyKey`) mean the same Paddle event can hit our
endpoint a hundred times and produce exactly one of everything.

### Graceful degradation — every third-party client is lazy

Every external SDK (Paddle, R2, Resend, Sentry, Upstash, Inngest) is
constructed on first call, not at module load. Missing env vars do
**not** crash `next build`, `npx tsc`, or `npm run dev`. The unhappy
path is:

- Build → succeeds (lazy clients defer creation)
- First runtime call against an unset env → clear, actionable error
  (e.g., `"R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."`)
- Higher-level surfaces wrap this with `safeQuery` / `{ ok }` discriminated
  returns / `loadAdminContext` / `<UnprovisionedNotice>` so the user
  sees a calm "configuration required" page instead of a 500

Translated: a freshly-cloned repo with **zero env vars set** still
boots, renders public pages with graceful empty states, and tells the
operator exactly what to provision.

---

## Getting started

### Provisioning (third-party accounts)

The complete operational blueprint for every third-party service — Neon,
Clerk, Cloudflare R2, Paddle, Inngest, Upstash, Resend, Sentry, Vercel
Analytics — is in:

> **[`KURULUM_VE_ENV_REHBERI.md`](./KURULUM_VE_ENV_REHBERI.md)** *(Turkish — Kurulum ve Ortam Değişkenleri Rehberi)*

That document is grounded in actual `process.env.*` references from
the running code (scanned, not guessed) and covers exact dashboard
paths for each provider, three-environment placement (local / Vercel
Preview / Vercel Production), troubleshooting, and a production
go-live checklist. Treat it as the source of truth for env wiring.

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy the env schema and fill in values per KURULUM_VE_ENV_REHBERI.md
cp .env.example .env.local

# 3. Apply DB schema (after DATABASE_URL is set)
npm run db:migrate

# 4. Dev server
npm run dev

# 5. (Optional) Inngest dev runner in a second terminal
npx inngest-cli@latest dev
```

The site boots on `http://localhost:3000` even with **no env vars set**
— public pages render with empty states, dynamic pages render the
"configuration required" notice.

### The standard checks

```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript
npm run build         # Production build + route classification table
npm run test          # Vitest (currently 25 tests across 3 files)
npm run test:watch    # Vitest in watch mode
```

All four pass on a clean clone.

---

## Project phases

The project shipped across **five disciplined phases**, 17 SUB-PRs total.
Each SUB-PR has a report in `sub-pr-report/` documenting decisions,
trade-offs, and architectural invariants.

| Phase | Theme | SUB-PRs |
|---|---|---|
| **0 — Foundations** | Repo scaffold, design tokens, security headers, CI, DB, storage, auth, admin ingest | 0.1 — 0.6 |
| **1 — Commerce core** | SSG catalog, full-text search, sample viewer, cart, checkout (Paddle), watermark pipeline, library/order UX | 1.1 — 1.7 |
| **2 — Reading & accounts** | PDF.js reader, reading-progress sync, account/orders/GDPR | 2.1 — 2.3 |
| **3 — Discovery & growth** | SEO hardening + structured data, blog content hub, reviews + AggregateRating | 3.1 — 3.3 |
| **4 — Operations & optimization** | Admin dashboard, rate limiting + caching, transactional email + analytics, catalog management + publish flow, Sentry observability + Vitest scaffolding | 4.1 — 4.5 |

The constitution that governs the project lives in
[`memory/PAST_DECISIONS.md`](./memory/PAST_DECISIONS.md) — locked
architectural decisions, explicit rejections, and re-open triggers.

---

## File map

```
src/
├─ app/                     # Next.js App Router — routes + layouts
│  ├─ admin/                # /admin dashboard + /admin/books/[slug]/edit
│  ├─ api/                  # Webhook + cart-count + Inngest endpoints
│  ├─ blog/                 # Content hub (markdown-backed, SSG)
│  ├─ books/                # Catalog browse + detail (SSG + ISR)
│  ├─ account/              # Library, orders, settings (Dynamic, auth-gated)
│  ├─ read/                 # In-browser PDF reader (Dynamic)
│  └─ ...
├─ components/              # Reusable UI (mix of Server + Client)
├─ content/blog/            # Markdown blog posts (deploy-pinned)
├─ emails/                  # React Email templates
├─ inngest/functions/       # Async workers (watermark + email)
├─ lib/
│  ├─ db/                   # Drizzle schema, client, queries
│  ├─ storage/              # R2 S3-compatible client (lazy init)
│  ├─ auth.ts               # Clerk helpers + requireAdmin gate
│  ├─ cart.ts               # Cookie-backed cart (safeParseCart)
│  ├─ email.ts              # Resend client + sendOrderReadyEmail
│  ├─ logger.ts             # Structured logger → Sentry bridge
│  ├─ rate-limit.ts         # Upstash sliding window
│  ├─ seo.ts                # JSON-LD + canonical URL helpers
│  └─ ...
sentry.client.config.ts     # Sentry browser init
sentry.server.config.ts     # Sentry Node init
sentry.edge.config.ts       # Sentry Edge init
instrumentation.ts          # Next.js register() hook
src/proxy.ts                # Clerk middleware + rate limiter (Next 16 rename of middleware.ts)
drizzle/                    # Generated SQL migrations (committed)
memory/                     # Project constitution + agent memory
sub-pr-report/              # Per-SUB-PR engineering reports
KURULUM_VE_ENV_REHBERI.md   # Turkish provisioning guide (17 sections)
```

---

## License

MIT.

---

*This README is the front door. The deep operational details live in
[`KURULUM_VE_ENV_REHBERI.md`](./KURULUM_VE_ENV_REHBERI.md); the
architectural constitution lives in
[`memory/PAST_DECISIONS.md`](./memory/PAST_DECISIONS.md); per-SUB-PR
engineering decisions live in `sub-pr-report/`.*
