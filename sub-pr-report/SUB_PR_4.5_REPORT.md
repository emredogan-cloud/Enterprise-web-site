# SUB-PR 4.5 — Sentry Observability + Vitest Testing Report

**Branch:** `main`
**Scope:** Phase 4 — Operations & Optimization, unit 5 (Observability + Testing combined)
**Roadmap refs:** §9 (Architecture — operational tooling), §11 (Security — PII discipline), §12 (Testing strategy)
**Status:** ✅ Complete. All four verification gates pass (lint · tsc · build · test). 25/25 tests passing in <1 s.

---

## 1. What landed

Two distinct streams under one SUB-PR — connected because the logger that Sentry hooks into needs the test runner that proves it works.

### A. Observability (Sentry)
- 4 new init files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- `withSentryConfig` wrap around `next.config.ts` with graceful source-map upload skip
- `src/lib/logger.ts` — three-level structured logger that forwards `error()` to Sentry when configured
- 7 strategic `console.error` → `logger.error` migrations in admin actions + Paddle webhook

### B. Testing (Vitest)
- `vitest.config.ts` with React + jsdom + path alias
- `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` (devDeps)
- `package.json` — `test` script replaces the SUB-PR 0.1 placeholder; `test:watch` added
- 3 co-located `.test.ts` files covering 25 cases across `safeParseCart`, SEO helpers, and `slugifyCategory`

---

## 2. Sentry architecture — four files, four runtimes covered

```
                  ┌─────────────────────────────────────────────────────┐
                  │  instrumentation.ts                                 │
                  │  ┌───────────────────────────────────────────────┐  │
                  │  │ register():                                   │  │
                  │  │   if (NEXT_RUNTIME==="nodejs")                │  │
                  │  │     import("./sentry.server.config")          │  │
                  │  │   if (NEXT_RUNTIME==="edge")                  │  │
                  │  │     import("./sentry.edge.config")            │  │
                  │  └───────────────────────────────────────────────┘  │
                  │  onRequestError = Sentry.captureRequestError        │
                  └────────────┬────────────────────────────────────────┘
                               │
       ┌───────────────────────┼──────────────────────────┬───────────┐
       │                       │                          │           │
       ▼                       ▼                          ▼           ▼
sentry.client.config.ts  sentry.server.config.ts  sentry.edge.config.ts
  • Browser runtime         • Node serverless          • Edge middleware
  • Auto-loaded by          • Loaded by register()     • Loaded by register()
    Sentry webpack          • Reads SENTRY_DSN         • Reads SENTRY_DSN
    plugin during build     • init() skipped if        • init() skipped if
  • Reads                     unset                      unset
    NEXT_PUBLIC_SENTRY_DSN
  • init() skipped if unset
```

### 2.1. Why two DSN env vars (`NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN`)

`NEXT_PUBLIC_*` vars are inlined into the client bundle. The server-side DSN is read via plain `process.env.SENTRY_DSN` — never bundled. Keeping the two halves separate means:
- Operators can route client vs server errors to **different Sentry projects** if needed (e.g., to separate browser noise from server alerts).
- The server DSN can rotate independently of the client DSN without forcing a frontend redeploy.
- Most installations use the **same DSN for both** — that works too. The split is optional optionality, not mandatory complexity.

### 2.2. Graceful degradation — all four runtimes

| Env state | `init()` call | Sentry SDK calls (`captureException`, etc.) | Build |
|---|---|---|---|
| Both DSNs unset | Skipped (config files' `if (dsn)` guard) | No-op (init never ran) | Succeeds |
| `SENTRY_AUTH_TOKEN` unset | n/a | n/a | Source-map upload skipped; build still succeeds |
| Only client DSN set | Server/edge init skipped | Server logger no-ops; client captures | Succeeds |
| Only server DSN set | Client init skipped | Client logger no-ops; server captures | Succeeds |
| All set + CI | All init | Full pipeline | Source maps upload; build logs verbose |

The unprovisioned dev workflow is unchanged — `npm install && npm run dev` works without a single Sentry env var.

### 2.3. `withSentryConfig` wrap

```ts
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
```

Two non-negotiable invariants:

| Option | Why it's safe |
|---|---|
| `silent: !process.env.CI` | Quiet locally so `npm run build` doesn't spam the terminal with Sentry plugin noise during dev; verbose in CI where the build log IS the operator visibility |
| `sourcemaps.disable: !process.env.SENTRY_AUTH_TOKEN` | Without this, `withSentryConfig` would try to upload source maps on EVERY `npm run build` and either prompt for auth or fail loudly. With it, missing-token = silently-skip-upload. |

The `silent: !process.env.CI` knob is crucial in this codebase: building locally without `CI=true` should produce a clean log so the route-classification table is readable.

### 2.4. Sentry init posture

All three configs share the same safe defaults:

```ts
Sentry.init({
  dsn,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  environment: process.env.NODE_ENV,
});
```

- **`sendDefaultPii: false`** — matches Roadmap §11 PII discipline. Sentry won't auto-capture form values, cookies, or auth headers.
- **`tracesSampleRate: 0.1`** — 10% performance trace sampling. Free-tier-friendly default; raise temporarily when debugging a regression.
- **`environment: process.env.NODE_ENV`** — lets the Sentry dashboard filter `development` events from `production` even when the same project is used for both.

---

## 3. Structured logger — `src/lib/logger.ts`

Three-level API that bridges console + Sentry without making callers care:

```ts
logger.info("[fulfillment] order created", { orderId });
logger.warn("[rate-limit] check failed; allowing request", { err });
logger.error("[admin] updateBook failed", err, { bookId, slug });
```

### 3.1. Routing

| Level | Console | Sentry (when DSN set) |
|---|---|---|
| `info` | `console.log("[INFO] …", context)` | — |
| `warn` | `console.warn("[WARN] …", context)` | — |
| `error` (Error instance) | `console.error("[ERROR] …", err, context)` | `captureException(err, { extra: { message, ...context } })` |
| `error` (non-Error) | `console.error("[ERROR] …", val, context)` | `captureMessage(message, { level: "error", extra })` |

**Console output stays regardless of Sentry state** — Vercel's log drain is the visibility floor. If Sentry is misconfigured, we still see everything in Vercel logs. If both are configured, we see everything in BOTH (no info loss, slight noise — acceptable trade for redundancy).

### 3.2. `Error` vs non-`Error` branching

`captureException` only accepts thrown things with stack traces. Passing a string would lose the stack. The logger branches on `error instanceof Error`:
- Error → `captureException` preserves stack
- Anything else (or no error) → `captureMessage` with `level: 'error'` so it still appears in the dashboard

### 3.3. Migration of existing `console.error` calls

Seven strategic spots upgraded to use `logger.error`:

| File | Site | Why |
|---|---|---|
| `src/app/admin/actions.ts` | `createBook` catch | High-value: silent admin failures are easy to miss in logs |
| `src/app/admin/actions.ts` | `updateBook` existing-fetch catch | Includes `bookId` in context |
| `src/app/admin/actions.ts` | `updateBook` write catch | Includes `bookId` + `slug` |
| `src/app/admin/actions.ts` | `deleteBook` catch | Includes `bookId` + `slug` |
| `src/app/api/webhooks/paddle/route.ts` | `PADDLE_WEBHOOK_SECRET` missing | 503 path — Sentry alert on misconfigured webhook |
| `src/app/api/webhooks/paddle/route.ts` | signature verification failed | 401 — could indicate attack or secret rotation |
| `src/app/api/webhooks/paddle/route.ts` | handler failed | 500 — actively breaking fulfillment |

Deliberately left as `console.warn` (not upgraded):
- `[catalog] safeQuery` warnings — these are expected DB-unavailable degradations, not real errors. Routing them through Sentry would generate alert noise during local dev / build.
- `[rate-limit] check failed; allowing request` — fail-open path; not an error condition.
- `[email] RESEND_API_KEY is not set` — one-shot startup warn; not a runtime error.

The rest of the codebase still uses `console.*` directly — the migration is intentionally partial to demonstrate the pattern without bulk-rewriting low-value sites. Future SUB-PRs can extend coverage as patterns emerge.

---

## 4. Vitest scaffolding

### 4.1. Configuration

```ts
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",         // forward-compat for component tests
    globals: false,               // explicit imports; no tsconfig pollution
    unstubEnvs: true,             // auto-rollback vi.stubEnv between tests
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Three deliberate choices:
- **`jsdom` environment** — even pure-function tests don't need it, but adding it now means future component tests don't require config changes. Vitest spins jsdom up only when needed.
- **`globals: false`** — keeps test files explicit (`import { describe, it, expect } from "vitest"`). The alternative (`globals: true` + `types: ["vitest/globals"]` in tsconfig) would pollute app-code TS lookups. The 1-line-per-file import cost is worth the isolation.
- **`unstubEnvs: true`** — `vi.stubEnv("X", "value")` calls in any test are auto-rolled-back between tests. Prevents env mutations leaking across files.

### 4.2. `package.json` scripts

```diff
- "test": "echo 'no tests yet — placeholder; a real test runner (Vitest) lands in a later SUB-PR'",
+ "test": "vitest run",
+ "test:watch": "vitest",
```

`vitest run` exits after one pass — the CI-correct shape. `vitest` (no args) starts watch mode for local dev. Default `test` script is the CI-runnable one; watch is opt-in.

---

## 5. Initial test coverage — 25 cases across 3 files

### 5.1. `src/lib/cart.test.ts` — `safeParseCart` (8 cases)

This is the trust boundary between an untrusted cookie value and our typed cart model. Worth a dense battery:

| Case | What it proves |
|---|---|
| Undefined cookie | Returns empty cart (no throw) |
| Empty string | Returns empty cart |
| Malformed JSON (`{not-valid`, `undefined`) | Never throws |
| Non-object JSON (`null`, `"string"`, `42`) | Returns empty cart |
| Missing / non-array `items` field | Returns empty cart |
| Mixed valid + invalid items | Filters to only the valid; preserves order |
| Happy path | Returns parsed cart unchanged |
| Extraneous fields on items (tampering) | Strips down to exactly `{ bookId, addedAt }` |

The "extraneous fields stripped" test specifically guards against the failure mode where a malicious cookie includes an `isAdmin: true` field that some other code path might naively trust.

**Required a refactor:** `safeParseCart` was a private helper; exported it (with a comment explaining the SUB-PR 4.5 rationale) so the test can call it directly without mocking `next/headers`.

### 5.2. `src/lib/seo.test.ts` — SEO helpers (10 cases)

Three function families:

| Function | Cases |
|---|---|
| `getBaseUrl()` | Fallback to localhost; configured URL; trailing-slash strip |
| `getCoverImageUrl()` | Null/undefined key; missing env; happy join; double-slash normalization |
| `buildBookJsonLd()` AggregateRating guard | Omitted when arg absent; omitted when `reviewCount === 0` (Google rich-results rule); included on BOTH Book and Product when valid |

The AggregateRating tests are the most operationally important — a regression there would silently get the storefront kicked out of Google rich-results eligibility, with no visible local failure mode. The test makes the SUB-PR 3.3 guard executable spec.

`vi.stubEnv()` is used for the env-dependent helpers; `vi.unstubAllEnvs()` in `beforeEach`/`afterEach` keeps the stubs isolated to each test.

### 5.3. `src/lib/blog.test.ts` — `slugifyCategory` (7 cases)

The deterministic name → slug transform. Authors don't write slugs in frontmatter; they rely on this function to derive consistent URLs. A regression here would silently 404 every category-hub page that used the affected name.

Edge cases tested:
- Multi-word + lowercase (`"Behind the Scenes"` → `"behind-the-scenes"`)
- Whitespace trim
- Consecutive whitespace collapse
- Punctuation stripping (`"Reading Guides!!!"`, `"Q&A — Reader Mail"`)
- No leading/trailing dashes (`"---Foo---"` → `"foo"`)
- Single-word lowercase
- Digit preservation (`"Top 10 Picks"`)

---

## 6. Files touched / created

**New (10):**
1. `sentry.client.config.ts`
2. `sentry.server.config.ts`
3. `sentry.edge.config.ts`
4. `instrumentation.ts`
5. `src/lib/logger.ts`
6. `vitest.config.ts`
7. `src/lib/cart.test.ts`
8. `src/lib/seo.test.ts`
9. `src/lib/blog.test.ts`
10. `sub-pr-report/SUB_PR_4.5_REPORT.md` (this file)

**Modified (5):**
- `next.config.ts` — wrapped export with `withSentryConfig(...)`
- `package.json` — `test` script replaced (no more placeholder); `test:watch` added
- `src/lib/cart.ts` — exported `safeParseCart` (was private)
- `src/app/admin/actions.ts` — 4 `console.error` → `logger.error` migrations + import
- `src/app/api/webhooks/paddle/route.ts` — 3 `console.error` → `logger.error` migrations + import
- `KURULUM_VE_ENV_REHBERI.md` — appended §17 (Sentry), extended §0 TOC + §2 envanter + §13 production checklist

**No schema or migration changes.** All Sentry env vars were already declared in `.env.example` from earlier SUB-PRs.

---

## 7. Verification (all four gates green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean (one fix iteration on a readonly cast in seo.test.ts)
$ npm run build           # → success; classifications unchanged from 4.4
$ npm run test            # → 3 test files · 25/25 tests pass · 868ms total
```

### Iteration history

| Iter | Outcome | Fix |
|---|---|---|
| 1 | `tsc` failed — `seo.test.ts` cast `as Array<Record<string, unknown>>` against a `readonly Thing[]` from schema-dts | Use `ReadonlyArray<…>` instead — preserves the readonly constraint, `.find()` still works |
| 2 (final) | **All four gates pass; 25/25 tests** | — |

### Build output — zero classification regressions

```
┌ ○ /                                              ← Static
├ ƒ /account/{library,orders,settings}             ← Dynamic
├ ƒ /admin                                         ← Dynamic
├ ƒ /admin/books/[slug]/edit                       ← Dynamic
├ ƒ /api/{cart/count,inngest,webhooks/paddle}      ← Dynamic
├ ● /authors/[slug]                                ← SSG
├ ○ /blog                                          ← Static
├ ● /blog/[slug]                          1h   1y  ← SSG + ISR
├ ● /blog/category/[slug]                          ← SSG
├ ○ /books                                1h   1y  ← Static + ISR
├ ● /books/[slug]                                  ← SSG
├ ƒ /cart                                          ← Dynamic
├ ● /categories/[slug]                             ← SSG
├ ƒ /{order/[id], read/[bookId], search}           ← Dynamic
└ ○ /sitemap.xml                          1h   1y  ← Static + ISR

ƒ Proxy (Middleware)                                ← rate-limit + Clerk
```

Identical to SUB-PR 4.4's final state. The Sentry plugin (`withSentryConfig`) and `instrumentation.ts` registration did not change a single route classification.

---

## 8. Guide additions (§17 Sentry)

Ten sub-sections matching the depth of the Neon / Clerk / R2 / Paddle / Inngest / Upstash / Resend / Vercel Analytics sections:

| § | Content |
|---|---|
| 17.1 | Amaç + three-runtime architecture diagram |
| 17.2 | Hesap + proje oluşturma (sentry.io/signup, Create Project, Next.js platform) |
| 17.3 | DSN copy from Settings → Client Keys; one DSN safe for both client + server |
| 17.4 | Source-map upload setup (auth token + org + project slugs) |
| 17.5 | Üç ortama yerleştirme (yerel/preview/production) |
| 17.6 | Kod tabanı ile bağlantı (file map: 4 config files + logger + next.config) |
| 17.7 | Graceful degradation sözleşmesi (the four no-op layers) |
| 17.8 | Doğrulama (test error → Issues sekmesi → sembolize stack trace) |
| 17.9 | Yaygın sorunlar (5-row troubleshooting matrix) |
| 17.10 | Maliyet (Developer plan ücretsiz: 5k hata/ay) |

Plus 5 new envanter rows (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) and 3 new production checklist items.

---

## 9. Operational expectations

### When Sentry is unconfigured (free local / preview dev)

- One `console.warn` per process for `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`... actually no — the config files don't even warn; they silently skip `init()`. Less noise.
- All `Sentry.*` calls (capture, etc.) are no-ops.
- `logger.error(...)` still writes to `console.error` — Vercel logs continue to capture everything.
- `npm run build` succeeds with no Sentry plugin output (silent: true unless CI=true).

### When Sentry runtime DSN is set but auth token missing

- Production errors appear in Sentry → Issues.
- Stack traces are **minified** (no source-map sembolization). Operator sees a nudge in the build log to add the auth token.
- Behavior is otherwise identical.

### When fully configured (DSN + auth token + org + project)

- Server errors symbolicated to source paths in Sentry dashboard.
- 10% trace sampling visible in Performance tab.
- `environment: production` filter splits real traffic from any preview/staging deploys.
- Build logs include `Successfully uploaded source maps`.

---

## 10. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 4.5 reuses or extends |
|---|---|
| 0.2 — CI standard | The `test` script placeholder from 0.1 is replaced; CI can now actually run tests |
| 1.4 — cart cookie | `safeParseCart` exported for testability |
| 1.5 — Paddle | Webhook handler's `console.error` → `logger.error` migration |
| 3.1 — SEO hardening | `getBaseUrl()`, `getCoverImageUrl()`, `buildBookJsonLd()` AggregateRating guard all under test |
| 3.2 — blog | `slugifyCategory` under test |
| 3.3 — reviews | The AggregateRating JSON-LD guard tested here was added in 3.3 — the tests are the executable spec for it |
| 4.1 — admin dashboard | `requireAdmin` strict gate; admin actions logging |
| 4.4 — catalog management | `updateBook` / `deleteBook` error paths now route through logger → Sentry |

No regressions to any of them.

---

## 11. What this unlocks (and what's deliberately out of scope)

**Unlocked:**
- Production observability — every uncaught server error + every `logger.error()` call lands in Sentry with symbolicated stack traces.
- A real testing baseline — 25 tests covering high-value pure functions. CI can fail the build on regression. Future SUB-PRs can extend without scaffolding work.
- The split-DSN architecture lets a future SUB-PR route browser vs server to different projects without breaking changes.
- The structured logger is in place; future code paths can adopt it for free.

**Out of scope (deliberately):**
- **Per-route Sentry transaction names** — would require manual `Sentry.startSpan` calls. The `tracesSampleRate: 0.1` default gives basic auto-instrumentation; deeper traces are a follow-up when there's a concrete performance question to answer.
- **Sentry session replay** — useful but adds 50+ KB to the client bundle and has its own privacy posture (form masking, etc.). Worth a separate SUB-PR with explicit consent semantics.
- **Sentry user feedback widget** — same — separate UX surface.
- **Component tests** (`@testing-library/react`) — installed but unused. First targets would be `<ReviewForm>`, `<AdminDeleteBookButton>`, `<CoverImage>` — small atomic components with conditional logic. Worth a dedicated SUB-PR.
- **Integration tests** (e.g., end-to-end signed-URL flow) — needs network mocking strategy decisions; out of scope here.
- **Coverage thresholds** in `vitest.config.ts` — opt in when there's a real baseline. Premature thresholds discourage adding tests.
- **Migrating ALL `console.*` calls to logger** — partial migration demonstrates the pattern; bulk-rewrite would inflate this SUB-PR's diff with low-information changes.

---

## 12. Final state

The project now has:
- **17 SUB-PRs shipped** across Phases 0 → 4
- **Production-grade observability** (Sentry + structured logger + Vercel Analytics + Speed Insights)
- **Production-grade test runner** (Vitest with 25 passing tests as the seed)
- **A complete Turkish operations guide** (`KURULUM_VE_ENV_REHBERI.md` — 17 sections + 2 appendices + 24-row env inventory)
- **Zero regressions** across the entire route classification table from Phase 0 through here

**Next:** HALT for your final review and project wrap-up instructions.
