# SUB-PR 0.2 — Environments & CI/CD — Report

> **Phase:** P0 Foundations · **Unit:** SUB-PR 0.2 (`roadmap/WEB_SITE_ROADMAP.md` §18)
> **Scope (verbatim):** *"Preview-per-PR / staging / production, GitHub→Vercel pipeline (typecheck + lint + test + migration), rolling releases and rollback (§12)."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green.
> **Roadmap references consulted:** §11 (Security & Compliance), §12 (DevOps & Infrastructure).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `.env.example` | Complete environment-variable schema across **8 logical groups**, all annotated with provider options + roadmap citations + the multi-environment configuration note. |
| Security headers | Implemented natively in `next.config.ts` via `headers()` (preferred for App Router); CSP + 5 supporting headers; dev/prod-aware. |
| CI pipeline expansion | `.github/workflows/ci.yml` now runs **install → lint → typecheck → test → DB-migration (placeholder) → build → preview deploy (placeholder)**, matching the roadmap §12 pipeline shape. |
| Local verification | All four checks green (§5). |

---

## 2. `.env.example` — schema groups

Each group carries inline provider notes + a roadmap citation. The file's banner spells out the Vercel multi-environment rule (Preview / Staging / Production isolation — separate DB branches, R2 bucket pairs, MoR sandbox-vs-live keys; per §12).

| # | Group | Key variables | Notes |
|--:|---|---|---|
| 1 | **Application** | `NEXT_PUBLIC_APP_URL` | Drives absolute links, OG tags, and registered webhook callbacks. |
| 2 | **Database — Postgres** | `DATABASE_URL` (pooled), `DIRECT_URL` (migrations) | Examples for both Neon and Supabase patterns (§10 / ADR). |
| 3 | **Auth — Clerk OR Auth.js** | Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, sign-in/up URLs · Auth.js (commented): `AUTH_SECRET`, `AUTH_URL`, providers | One block uncommented; 0.5 commits to one (ADR-8). |
| 4 | **MoR — Paddle OR Lemon Squeezy** | Paddle: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` · Lemon Squeezy (commented): `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook secrets mandatory (§11 — signature-verified webhooks). |
| 5 | **Storage — Cloudflare R2** | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, **`R2_BUCKET_MASTERS`**, **`R2_BUCKET_ARTIFACTS`**, `R2_PUBLIC_BASE_URL` (optional) | Two private buckets per env, per the §9 architecture diagram (ADR-6). |
| 6 | **Async jobs — Inngest OR Vercel Queues** | Inngest: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` · Vercel Queues: auto-injected | Drives the watermark pipeline (ADR-3). |
| 7 | **Transactional email** *(extension)* | `RESEND_API_KEY`, `EMAIL_FROM` | Required by the §9 fulfillment flow ("your book is ready" + receipts). Included because the architecture references it. |
| 8 | **Observability — Sentry** *(extension)* | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | §12 — "Sentry errors, queue failure alerts, uptime checks". |

The two *extension* groups (7, 8) were added because the architecture in §9/§12 explicitly relies on them; the file would otherwise be incomplete. The five groups you named are present and primary.

---

## 3. Security headers (Roadmap §11)

Implemented in `next.config.ts` via Next.js' native `async headers()`, applied to **all routes** (`source: "/:path*"`).

| Header | Value | Notes |
|---|---|---|
| **Content-Security-Policy** | strict directive set (see below) | Dev variant adds `'unsafe-eval'` and `ws:/wss:` for Turbopack HMR; prod is tighter. |
| **X-Frame-Options** | `DENY` | Legacy mirror of `frame-ancestors 'none'` for older agents. |
| **X-Content-Type-Options** | `nosniff` | Prevents MIME-sniffing attacks. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Modern default; sends origin (not full URL) cross-site, full URL same-origin. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()` | Denies APIs we don't use; explicitly opts out of FLoC/Topics. |
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | **Production-only** — emitting HSTS over plain-HTTP localhost can lock the browser out of dev. Vercel terminates TLS in Preview/Staging/Prod. |

**CSP directive set:**
```
default-src 'self'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; frame-src 'self'; object-src 'none';
img-src 'self' data: blob: https:; font-src 'self' data:;
manifest-src 'self'; media-src 'self'; worker-src 'self' blob:;
script-src 'self' 'unsafe-inline' [+ 'unsafe-eval' in dev];
style-src 'self' 'unsafe-inline';
connect-src 'self' [+ ws: wss: in dev, https: in prod];
upgrade-insecure-requests
```

- `worker-src 'self' blob:` is included pre-emptively because the **PDF.js reader** (SUB-PR 2.1) uses a Web Worker — adding it now avoids a future surprise.
- `style-src 'unsafe-inline'` is retained because Next.js / Tailwind v4 inject runtime style tags; nonces require dynamic rendering and conflict with our SSG-first surfaces. A nonce-based CSP via Routing Middleware is the planned hardening once we add authed/dynamic routes (`/account`, `/admin`).
- `frame-src 'self'` will be widened to allow `https://*.paddle.com` (or Lemon Squeezy domains) in SUB-PR 1.5 when the MoR overlay/iframe is wired.

---

## 4. CI/CD pipeline expansion

`.github/workflows/ci.yml` now mirrors the §12 pipeline shape — `typecheck + lint + tests + DB migration + preview deploy`:

| Step | Status | When |
|---|---|---|
| Checkout | ✅ | always |
| Setup Node 24 (npm cache) | ✅ | always |
| `npm ci` | ✅ | always |
| **Lint** (`npm run lint`) | ✅ | always |
| **Typecheck** (`npx tsc --noEmit`) | ✅ | always |
| **Test** (`npm test`) | 🟡 **placeholder** (echo, exits 0; real Vitest in a later SUB-PR) | always |
| **DB migration (Prisma/Drizzle)** | 🟡 **placeholder echo** — SUB-PR 0.3 replaces with `npm run db:migrate:deploy` | only on `push` to `main` (never on PRs) |
| **Build** (`npm run build`) | ✅ | always |
| **Preview deploy** | 🟡 handled by Vercel's native GitHub integration; echo + commented CLI fallback (`vercel pull` → `vercel build` → `vercel deploy --prebuilt`) for VERCEL_TOKEN-based use | only on `pull_request` |

Both placeholders use GitHub Actions `::notice` annotations so they show up clearly in the run summary, not as silent no-ops.

**`package.json`** gained the placeholder `test` script:
```json
"test": "echo 'no tests yet — placeholder; a real test runner (Vitest) lands in a later SUB-PR'"
```

**Vercel-native vs. CLI deploy:** the workflow comment explicitly explains that previews are handled by Vercel's native GitHub app, which aligns with Vercel's "platform-native before custom infrastructure" guidance. The CLI commands are documented so the team can switch to explicit CI-driven deploys if the repo is ever disconnected from Vercel — a one-line swap.

---

## 5. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — no errors/warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Test (placeholder) | `npm test` | ✅ Pass — echoed and exited 0 |
| Build | `npm run build` | ✅ Pass — compiled in ~2.1s; TypeScript validated; 4 static pages; `/` still prerendered **○ Static** (SSG preserved despite the new headers) |

Same benign Node warning as 0.1 (`MODULE_TYPELESS_PACKAGE_JSON` for `tailwind.config.ts`) — cosmetic, not blocking.

---

## 6. Files created / modified

```
.env.example                         (new — environment schema, 8 groups)
next.config.ts                       (security headers via headers())
.github/workflows/ci.yml             (expanded pipeline; placeholders for test/migration/preview)
package.json                         (+ "test" placeholder script)
sub-pr-report/SUB_PR_0.2_REPORT.md   (new — this report)
```

---

## 7. Decisions / deviations worth surfacing

1. **`next.config.ts`, not `vercel.json`.** The Next.js native `headers()` was explicitly preferred in your brief, and keeps the policy versioned next to the app.
2. **`'unsafe-inline'` retained in CSP for now.** Removing it requires nonce-based CSP, which forces dynamic rendering and conflicts with our SSG-first surfaces (§8/ADR-1). Documented in `next.config.ts` as a planned hardening once dynamic surfaces land.
3. **HSTS is production-only.** Setting `Strict-Transport-Security` on `http://localhost` can lock a browser out of dev if cached. Conditional emission via `process.env.NODE_ENV`.
4. **`worker-src 'self' blob:`** added pre-emptively for the PDF.js reader (SUB-PR 2.1).
5. **Two extra `.env.example` groups (Email, Observability)** added because the architecture relies on them; you asked for the "complete environment variable schema," and omitting these would mis-represent the architecture.
6. **Preview deploy** documented as Vercel-native rather than CLI-driven (Vercel guidance: platform-native first). CLI fallback is one comment swap away.

---

## 8. Definition-of-done vs. SUB-PR 0.2 scope

- [x] `.env.example` with the 5 mandated groups (plus 2 architecture-needed extensions), annotated and grouped, with the multi-environment Vercel note.
- [x] Security headers per §11 (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) — implemented in `next.config.ts`.
- [x] CI pipeline shape = typecheck + lint + tests + DB migration + preview deploy, with placeholders honoring the SUB-PR 0.3 constraint.
- [x] Local verification (lint · typecheck · test · build) all green.
- [x] Report present in `sub-pr-report/`.

**Out of scope (correctly deferred):** Vercel project linking, actual environment-variable upload via `vercel env add`, real test runner, real DB migration script, nonce-based CSP, MoR iframe allowlist — these belong to SUB-PRs 0.3 / 0.5 / 1.5 / later hardening.

---

## 9. Next unit (NOT started — awaiting approval)

**SUB-PR 0.3 — Postgres provisioning & schema migrations:** managed Postgres (Neon or Supabase), ORM (Prisma or Drizzle) + typed migrations in CI, and the full ERD schema from §10 with indexes (`book.slug`, `book.status+published_at`, unique `entitlement(user_id, book_id)`, unique `order.mor_order_ref`, FTS on `book(title, description)`). The DB-migration step placeholder in `ci.yml` will be replaced with the real migration command. Execution is **halted pending explicit approval.**
