# Phase 0 — Validation Gate Report

**Status: ✅ PASS (stable).** Phase 0 changes are implemented on branch `feat/seo-p0-discoverability` (off `main`), **uncommitted, not deployed**. No regressions found. Proceeding to research is authorized.

> Scope of Phase 0 = 2.5 shipped wins: `app/robots.ts`, home `Organization`+`WebSite`+`SearchAction` JSON-LD, and a default `opengraph-image.tsx` (homepage-covered; hub-page coverage is an open scope fork, **not yet resolved**).

---

## 1. Validation matrix

| Check | Method | Result | Evidence |
|---|---|---|---|
| Type safety | `npx tsc --noEmit` | ✅ exit 0 | Earlier stale `.next/types` error was a branch-switch artifact; gone after rebuild |
| Unit tests | `npx vitest run` (full) | ✅ 29/29 pass (3 files) | 25 pre-existing + 4 new `buildSiteJsonLd` tests |
| Lint | `eslint` (changed files) | ✅ exit 0 | robots.ts, opengraph-image.tsx, page.tsx, seo.ts, seo.test.ts |
| Production build | `NEXT_PUBLIC_APP_URL=… next build` | ✅ exit 0 | 33 routes; `/robots.txt`, `/opengraph-image`, `/` all generated |
| robots.txt body | build artifact `robots.txt.body` | ✅ correct rules + `Sitemap:`/`Host:`; `/search` intentionally crawlable | — |
| OG image | build artifact | ✅ real `PNG 1200×630 RGBA` (111 KB), no network-font dependency | `opengraph-image.body` |
| Home JSON-LD | prerendered `index.html` | ✅ `Organization`+`WebSite`+`SearchAction`; org `@id` matches book-graph anchor | — |
| No duplicate Org | prerendered `about.html` | ✅ `Organization` count = 0 on non-home pages | home-only injection works |
| OG/Twitter wiring | prerendered `index.html` | ✅ `og:image` + `twitter:image` resolve to `/opengraph-image` (Twitter inherits from OG) | — |
| Build integrity (private routes) | route table | ✅ `/account`,`/admin`,`/cart`,`/order`,`/read`,`/search` = `ƒ` Dynamic | — |

## 2. Env-driven URL resolution — the `metadataBase` dependency chain

This was the single highest-risk item (a silent empty env → every canonical/OG/JSON-LD URL points at `localhost` sitewide). **Resolved as safe in prod/preview:**

| Environment | `NEXT_PUBLIC_APP_URL` | Effect on canonical/OG/JSON-LD/robots/sitemap |
|---|---|---|
| **Production** | ✅ set (`vercel env ls`: Preview+Production, encrypted) → resolves to `https://enterprise-web-site.vercel.app` | ✅ Verified live: prod `canonical=https://enterprise-web-site.vercel.app`, sitemap `<loc>` absolute on same origin |
| **Preview** | ✅ set | ✅ URLs resolve correctly on preview deploys |
| **Local** | ⚠️ empty in `.env.local` (encrypted vars pull empty) | ⚠️ Local build **only works with the var exported inline**, because `main`'s `layout.tsx` uses `??` (see Risk R1) |

**Live production evidence:**
- `GET /sitemap.xml` → `<loc>https://enterprise-web-site.vercel.app/books/meditations</loc>` (absolute, real origin). The dynamic sitemap proves `getBaseUrl()`/`metadataBase` resolves correctly in prod.
- `GET /` head → `<link rel="canonical" href="https://enterprise-web-site.vercel.app"/>`, `<html lang="en">`, `og:url` correct, **no `og:image` yet** (my unmerged change is what adds it).
- `GET /robots.txt` → **HTTP 404** (confirms the gap `robots.ts` closes).

## 3. Residual risks (carry into research/roadmap as inputs)

| # | Risk | Severity | State | Recommended handling |
|---|---|---|---|---|
| **R1** | **`layout.tsx:33` on `main` uses `?? "http://localhost:3000"`** — `??` does NOT catch empty string, so an empty `NEXT_PUBLIC_APP_URL` → `new URL("")` → **500 on every page**. The `||` fix exists only on the unmerged `feat/visual-asset-inventory-pipeline` branch. | **High (latent)** | Prod safe today (var is set), but fragile; `main` cannot build with an empty env | Phase 2: land the `||` fix **and** add build-time env validation (see research §Phase 2) |
| **R2** | **Production domain is `enterprise-web-site.vercel.app`** — a staging-grade Vercel subdomain, not a brand domain. `kitabevi.com.tr` is only a test fixture (no such domain registered). | Medium (strategic) | Current | Phase 2/5 (WS-E): **research + plan only** (recommendation + runbook + risk analysis); **owner-gated** — no purchase / DNS / Vercel / prod change without explicit approval. GSC verification + data-collection start **now on the current domain** (not gated on this). |
| **R3** | **Default OG image covers homepage only.** Next.js replaces `openGraph` per-segment; all 17 indexable pages define their own `openGraph`, so none inherit the file-convention image (verified: even the homepage lost the layout's `og:site_name`). | Medium | Open scope fork | Phase 2: resolve via metadata-architecture decision (research compares 6 options) |
| **R4** | **Clerk + `DATABASE_URL` + `DIRECT_URL` are Production-only** (not Preview). Preview deploys run without auth/DB and rely on graceful-degradation paths. | Low | By design | Note when validating preview deploys; SEO surfaces (public catalog) still render via fallbacks |
| **R5** | **`legal-shell.tsx` renders 2 `<h1>`** (grep: `:2`). Potential duplicate-H1 on `/privacy`,`/terms`,`/refund`,`/kvkk`,`/about`. | Low | Pre-existing | Phase 3: verify and collapse to one H1 |

## 4. Verdict

Phase 0 is **functionally stable, type-clean, test-covered, and build-verified**, with the env dependency chain **validated in production**. The residual risks above are **not regressions** — R1/R2/R4/R5 are pre-existing conditions surfaced by Phase 0, and R3 is a known open decision. None block the research cycle.

➡️ **Gate result: PROCEED.**
