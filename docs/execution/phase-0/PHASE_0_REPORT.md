# Phase 0 — Current State Lock

**Window:** 2026-09-02 02:41 → 10:30 UTC · **Branch:** `feat/production-readiness` (production branch of Vercel project `valicepress-book-site`) · **Method:** every item below was produced by making the live system do the thing (curl, dig, Vercel/Paddle/Inngest APIs, production database read, poppler on the real PDFs, browser on Search Console) — not by copying a previous report.

Labels: **VERIFIED** (measured against the live system today) · **OBSERVED** (read from a file or dashboard today) · **ASSUMED** (planning input, not measured) · **BLOCKED** (could not be done by the agent).

---

## A. Current system

| Layer | Fact | Label |
|---|---|---|
| Repository | Next.js 16.2.6 App Router, TypeScript strict, Tailwind 4; npm (package-lock.json); Node 24.13.1 | VERIFIED |
| Start of phase | 62 uncommitted paths (28 staged archive moves from 2026-09-01, companion feature untracked, roadmap docs untracked); HEAD `f8a1f0e` | VERIFIED |
| Scripts | lint (eslint), test (vitest), build (next build), db:* (drizzle-kit); catalog loader/provisioning under `scripts/catalog/`; strategy scripts under `scripts/strategy/` | VERIFIED |
| Application | routes: /, /books, /books/[slug], /ebooks, /categories(/[slug]), /authors(/[slug]), /blog(…), /about, /cart, /order/[id], /account/*, /read/[bookId], /admin, /companion/[slug] (+ sheets route), /codex-enigmatica/verify, legal pages; APIs: /api/webhooks/paddle, /api/inngest, /api/newsletter, /api/entitlement, /api/cart/count, /api/codex-enigmatica/verify | VERIFIED |
| Database | Neon `neondb`, 15 public tables, Drizzle; `drizzle.__drizzle_migrations` has **0 rows** (production was provisioned with `db:push`; `db:migrate` cannot be used — documented in the Founder Configuration Manual) | VERIFIED |
| Auth | Clerk (`src/proxy.ts`), protected routes /account, /admin, /order, /read | OBSERVED |
| Storage | Cloudflare R2, masters bucket holds 5 digital editions (0.37–8.39 MB) | VERIFIED |
| Payments | Paddle LIVE (`api.paddle.com`), 5 products, 5 active prices equal to the catalogue (999/1299/499/1199/999 USD) | VERIFIED |
| Async | Inngest app `digital-bookstore`; `PUT /api/inngest` on the apex → `Successfully registered` | VERIFIED |
| Email | Resend; newsletter POST → `subscribed`, `consentRecorded: true`; DKIM at `resend._domainkey`; DMARC `p=none` present; `send.` subdomain points at `send.forge.rmta.net` (not Resend's documented `amazonses.com` records) | VERIFIED (records) / BLOCKED (dashboard status) |
| Observability | Sentry wired; Speed Insights component present; Vercel Web Analytics **was not enabled** → enabled today | VERIFIED |
| Catalog loader | `scripts/catalog/valice-catalog.mjs` (source of truth) + `load-catalog.mjs` + 18 tests | OBSERVED |

## B. Verified live state (after today's fixes)

| Check | Before (02:41 UTC) | After (10:30 UTC) |
|---|---|---|
| `https://valicepress.com/` | 308 → www | **200** |
| `https://www.valicepress.com/` | 200 | **308 → apex** |
| `https://valicepress.com/sitemap.xml`, `/robots.txt` | 308 | **200** |
| `POST https://valicepress.com/api/webhooks/paddle` (unsigned) | **308** (Paddle would retry 60× then drop) | **401** (reaches the handler; signature check) |
| `POST https://www.valicepress.com/api/webhooks/paddle` | 401 | 308 → apex (Paddle target is the apex) |
| `https://enterprise-web-site.vercel.app/` | 200, indexable | 200 until the next production deploy; code redirect committed (`src/lib/canonical-host.ts`) |
| `valicepress-book-site-…vercel.app` | 302 → Vercel SSO (protected) | unchanged |
| Canonical on the home page | `https://valicepress.com` (now consistent with the served host) | consistent |
| `dig TXT valicepress.com` | SPF + **google-site-verification token present** (Founder added overnight) | — |
| `dig TXT _dmarc.valicepress.com` | `v=DMARC1; p=none; rua=mailto:emre30283@gmail.com` (Founder added overnight) | — |
| Vercel Web Analytics | not enabled | **enabled** (`vercel project web-analytics` → `enabled: true`) |
| Search Console | Domain property created 2026-09-01, unverified | **verified** (Overview reachable, “data processing”); **sitemap submitted** (status “Couldn't fetch” immediately after submission; re-check in 48 h) |
| Inngest registration | registered at www | **re-registered at the apex** |
| 18 Amazon ASINs | — | **all 200** |
| 7 published book pages | — | **200, canonical on the apex, JSON-LD parses; Offer only where a direct price exists** (`validate-catalog`) |
| 5 Paddle prices | — | **active and equal to the catalogue** |
| 5 R2 masters | — | **present, 0.37–8.39 MB** |

## C. Differences from previous reports

| Previous statement | Today |
|---|---|
| Phase 4: “1 order (test) in production” | **0 orders, 0 entitlements, 0 watermark jobs** — the test rows were cleaned; 1 user row remains |
| Roadmap P0-1 “apex 308 → webhook bounces” | fixed via the Vercel API (`PATCH /v9/projects/…/domains`) — apex primary, www 308 |
| Roadmap “GSC property unverified, TXT needed” | TXT is in DNS; property verified; sitemap submitted |
| Roadmap “no DMARC” | DMARC present |
| Roadmap “Web Analytics not enabled” | enabled |
| Roadmap “`begin_checkout` never fires” | fires from the checkout button |
| Roadmap “sitemap missing /ebooks, /companion, /about…; lastmod = build clock” | fixed in code; live after deploy |
| Catalog inventory “Codex Bestiarium listing says 120” | still says 120 on Amazon — Founder U2 |
| Book repos “Field Book PDF untitled/anonymous” | confirmed by `preflight.py` today |
| Book repos “Enigmatica fonts not embedded” (the August rejection) | **fixed in the shipped interiors**: preflight shows all fonts embedded in all 7 interiors |

## D. Problems found

1. Apex→www redirect broke Paddle webhooks and made every canonical self-contradictory (P0). **Fixed.**
2. Retired production alias served the whole catalogue with a 200 (duplicate index). **Fixed in code; live on next deploy.**
3. No traffic measurement at all. **Fixed (Web Analytics enabled).**
4. `begin_checkout` declared but never fired. **Fixed.**
5. Sitemap incomplete and non-deterministic. **Fixed.**
6. Search Console property unverified; no sitemap submitted. **Fixed.**
7. Companion page code existed only as untracked files (404 in production). **Committed; live on next deploy.**
8. Hangul book in KDP review with CC BY-SA / CC BY-NC sources. **BLOCKED — Founder U1.**
9. Bestiarium listings claim 120 creatures. **BLOCKED — Founder U2.**
10. Resend `send.` records differ from Resend's documented pattern; API key is a sensitive env var. **BLOCKED — Founder U3.**
11. Paddle tax category `standard` for ebooks. **BLOCKED — Founder R4.**
12. Author bio null; publisher name split (Vâliçe/Valice). **BLOCKED — Founder R5/R6.**
13. README still titled “Digital Bookstore”. **Fixed (title/summary lines).** Inngest app id `digital-bookstore` deliberately unchanged (renaming resets run history). Test fixtures `kitabevi.com.tr` remain as fixtures.

## E. Fixes actually applied (each verified)

| Fix | How | Evidence |
|---|---|---|
| Apex primary, www → apex 308 | Vercel REST API `PATCH …/domains/valicepress.com {"redirect":null}` then `…/www.valicepress.com {"redirect":"valicepress.com","redirectStatusCode":308}` | live curl: apex 200, www 308, apex webhook POST 401 |
| Web Analytics | `npx vercel project web-analytics valicepress-book-site --format json` | `{"enabled": true}` |
| Inngest at the apex | `PUT https://valicepress.com/api/inngest` | `Successfully registered`, `modified: true` |
| Search Console | browser: property verified (TXT in DNS); Sitemaps → `https://valicepress.com/sitemap.xml` submitted | Sitemaps page lists it (2 Sep 2026) |
| `*.vercel.app` → 308 canonical | `src/lib/canonical-host.ts` + `src/proxy.ts` (production only, `.vercel.app` hosts only, never www) | 7 unit tests |
| `begin_checkout` | `src/components/cart/cart-summary.tsx` | code + lint |
| Sitemap | `src/app/sitemap.ts`: +/ebooks, /categories, /authors, /about, /companion/*; `lastModified` from the newest book row or a hand-bumped revision date | build output lists `/sitemap.xml`; validate-catalog after deploy |
| README brand | title + summary | grep |
| Companion feature committed | commit `f09e648` | git log |
| Catalogue validation | `scripts/catalog/validate-catalog.mjs` run against production with Paddle + R2 | 18 pass, 2 warn (sitemap routes not yet deployed), 0 error |

Commits: `9f0d332` archive moves · `f09e648` companion · `0cb968d` phase0 fixes · `b51c6a2` roadmap docs.

## F. Fixes not applied (deliberately)

- Blog posts (May 2026 generic copy) — Phase 12 editorial work, not a Phase 0 correctness fix.
- JSON-LD `["Product","Book"]` co-typing, ProductGroup, RSS, AI-crawler robots policy — Phase 12.
- Renaming the Inngest app id — would reset run history; documented.
- Any price change — commercial decision (Founder R1).
- Any database write — none were needed; production DB was read only.

## G. True external blockers

| Blocker | Why the agent cannot | Handbook item |
|---|---|---|
| Resend dashboard state / sender identity | API key is a Sensitive Vercel variable; dashboard needs the account | U3 |
| Paddle `ebooks` tax category | support request from the account holder | R4 |
| Google Cloud service-account key | a credential must not be downloaded or pasted by an agent | R7 |
| Amazon Ads / Author Central / Attribution | account sign-up under the Founder's identity | R8 |
| KDP listing edits, Select auto-renew, AI declaration, proof orders | KDP Bookshelf, human-only | U2, R2, R3 |

## H. Founder-only blockers

U1 Hangul rights decision · U2 Bestiarium 120 → 112 · U3 Resend confirmation · R1 price tests · R2 Select auto-renew · R3 large-print approvals + AI declaration + proofs · R4 Paddle tax category · R5 author bio · R6 imprint spelling · R7 GCP key · R8 Ads/Author Central. Full detail: `docs/execution/FOUNDER_ACTIONS.md`.

## I. Current catalog (production database, 2026-09-02)

| Item | Value | Label |
|---|---|---|
| Books | 8 (7 published, 1 draft: Korean Hangul) | VERIFIED |
| Format rows | 22: ebook direct 5 available · ebook amazon 1 · paperback amazon 6 available + 1 coming_soon · hardcover amazon 5 + 2 coming_soon · large_print amazon 2 | VERIFIED |
| Amazon formats available without ASIN | 0 | VERIFIED |
| Direct-available ebooks missing master or Paddle price | 0 | VERIFIED |
| ASINs | 18, all `/dp/` → 200 | VERIFIED |
| ISBN | none (KDP-free ISBN strategy in every project; `isbn` null) | OBSERVED |
| Prices | equal to Paddle (direct) and to the live Amazon list (read 2026-08-31) | VERIFIED / OBSERVED |
| Covers | 8 webp in `public/images/books/` | VERIFIED |
| Previews | 7 × 4 real pages | VERIFIED |
| Companions | 1 registry entry (hangul) — live after deploy; Enigmatica verification page live (`no-match` → 200) | VERIFIED |
| Orders / entitlements / reviews | 0 / 0 / 0 | VERIFIED |
| Fabricated data found | none (no fake titles/authors/ASINs/ISBNs; “Digital Bookstore” only in README title, fixed) | VERIFIED |

### Book assets (poppler on the real interiors)

| Book | Pages | Trim | Fonts embedded | Title/Author metadata | Source repo |
|---|---|---|---|---|---|
| Codex Bestiarium | 435 | 6×9 | yes | yes | CODEX_BESTIARIUM |
| Codex Enigmatica | 274 | 6×9 | yes | yes | CODEX-ENIGMATICA |
| Codex Mythologica | 329 | 6×9 | yes | yes | CODEX_MYTHOLOGICA (no git) |
| The Great Book of World Myths | 234 | 6×9 | yes | yes | THE-GREAT-BOOK-OF-WORLD-MYTHS |
| The Great Book of World Games | 160 | 8.5×11 | yes | yes | THE-GREAT-BOOK-OF-WORLD-GAMES |
| The Myth Hunter's Field Book | 156 | 8.5×11 | yes | **no (untitled / anonymous)** | THE-MYTH-HUNTERS-FIELD-BOOK |
| Korean Hangul Workbook | 124 | 8.5×11 | yes | yes | KOREAN-HANGUL-HANDWRITING-WORKBOOK |
| Meditations | 148 | 6×9 | (digital edition in R2, 0.37 MB) | yes | this repo (source report) |

Digital editions (150 DPI) exist in R2 for the five direct titles; masters are the digital editions, never the print interiors.

## J. Current integrations

| Integration | State | Label |
|---|---|---|
| Namecheap DNS | A 216.198.79.1 (Vercel), www CNAME to vercel-dns, SPF (Namecheap forwarding), GSC TXT, DMARC, Resend DKIM, `send.` CNAME/MX/SPF (rmta.net) | VERIFIED |
| Vercel | project `valicepress-book-site`, apex primary, www 308, `NEXT_PUBLIC_APP_URL=https://valicepress.com`, Web Analytics on, latest production deploy `3d3a022` (redeploy 2026-09-01 21:38 UTC) | VERIFIED |
| Paddle | live; webhook `ntfset_01m1br7x…` → apex, 4 events, active; prices verified | VERIFIED |
| Resend | signup + consent OK; sender domain status unconfirmed | VERIFIED / BLOCKED |
| Inngest | registered at apex | VERIFIED |
| Search Console | verified; sitemap submitted | VERIFIED |
| Google Cloud | no project | BLOCKED (R7) |
| Amazon Ads / Attribution / Author Central | none | BLOCKED (R8) |
| Sentry | configured (DSN in env); not exercised today | OBSERVED |

## K. Current tests / build

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| `npm test` | **175 / 175** (14 files; +7 canonical-host, +25 factory) |
| `npm run build` | success (`/companion/hangul` prerendered; `/sitemap.xml` ISR 1 h) |
| `node scripts/catalog/validate-catalog.mjs --env …` | 18 pass · 2 warn · 0 error |

## L. Phase 1 prerequisites

All met: repository green; production payment path reachable; catalogue integrity verified; book repositories inspected; conventions (`project_config.json`, `.gate`, `DECISIONS.md`, `kill_gate.py`, `selftest.py`, ReportLab) confirmed as the base to build on.
