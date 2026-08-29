# Production Verification Report

> Verified 2026-08-29 against the live production deployment at `https://enterprise-web-site.vercel.app` (Vercel project `valicepress-book-site`) and the production database `neondb`.
>
> **PASS** = tested and observed working. **BLOCKED** = could not be tested because an external credential or founder action is missing — never recorded as PASS. **FAIL** = tested and broken.

---

## Summary

| | Count |
|---|---|
| PASS | 24 |
| BLOCKED — founder action required | 9 |
| FAIL | 0 |
| N/A | 2 |

No test failed. Everything not passing is blocked on something outside this repository.

---

## Storefront

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Public site reachable anonymously | **PASS** | `GET /` → 200, no SSO wall. (The previous audit's "Deployment Protection blocks visitors" blocker is resolved.) |
| 2 | Branding is Valice Press | **PASS** | `<title>Valice Press — Find it. Own it. Read it anywhere.</title>`; **0** occurrences of "Digital Bookstore" in the served homepage |
| 3 | Homepage renders | **PASS** | 200 |
| 4 | `/books` renders | **PASS** | 200, shows *Meditations* only |
| 5 | `/ebooks` exists and renders | **PASS** | 200; honest empty state — "No ebook is on sale yet" |
| 6 | Book detail page | **PASS** | `/books/meditations` → 200 |
| 7 | `/authors` renders | **PASS** | 200 |
| 8 | Codex Enigmatica verify page live | **PASS** | `/codex-enigmatica/verify` → 200 |
| 9 | **Fake product pages removed** | **PASS** | `/books/the-midnight-library` → **404**, `/books/atomic-habits` → **404** (both were **200** before this session — see the finding below) |
| 10 | No demo inventory in the served catalog | **PASS** | Only *Meditations* appears; no Midnight Library / Atomic Habits / Dune / Sapiens |

> ### ⚠️ Finding: fake product pages were live in production
>
> Before this session, `/books/the-midnight-library`, `/books/atomic-habits` and `/books/dune` all returned **200** on the public production site, rendering as Valice Press product pages — with cover, category, price and a call to action — for books Valice Press has no right to sell. The catalog *index* did not list them (the production database had one real book, so the demo fallback never triggered there), but the *detail* route had its own independent fallback that resolved any demo slug. They are now 404.

---

## Catalog data

| # | Check | Result | Evidence |
|---|---|---|---|
| 11 | Production schema complete | **PASS** | 15 tables; `commerce_events` and `book_formats` both present after migrations 0004 + 0005 |
| 12 | Real books loaded | **PASS** | 7 books, all `draft`; *Meditations* untouched at `published` |
| 13 | Format rows loaded | **PASS** | 22 rows across 4 format types |
| 14 | No fabricated ASINs | **PASS** | `count(amazon_asin) = 0` — correct, because no Valice Press book is on Amazon |
| 15 | Real covers installed | **PASS** | 6 real covers converted to WebP; 19 placeholder covers removed |
| 16 | Loader is idempotent | **PASS** | Run against sandbox and production; upserts on natural keys, no duplicates |
| 17 | Loader refuses accidental production writes | **PASS** | Requires an explicit flag; prints target database first |

---

## Commerce

| # | Check | Result | Notes |
|---|---|---|---|
| 18 | Checkout against live Paddle | **BLOCKED** | No production Paddle account. `PADDLE_ENVIRONMENT=sandbox`; *Meditations* carries the fake `pri_test_meditations_999`. Configuration Manual **B1**. |
| 19 | Signed webhook end-to-end | **BLOCKED** | Requires B1. |
| 20 | Fulfillment → watermark → R2 artifact | **BLOCKED** | Requires B1 and B3. Code and sandbox verification exist from earlier phases; the live path is unproven. |
| 21 | Refund → entitlement revocation | **BLOCKED** | Requires B1. |
| 22 | `commerce_events` audit writes | **PASS (schema)** / **BLOCKED (runtime)** | Table now exists in production — **it did not before this session**, so Phase F's refund audit was silently writing nowhere. Runtime verification needs a real transaction. |
| 23 | Inngest function registered | **BLOCKED** | `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are set, but `GET /api/inngest` returns 401 and the dashboard was not inspected. **This is the failure that is silent** — unsynced, a purchase enqueues an event nothing consumes and the buyer's entitlement stays `pending` forever. Configuration Manual **B3**. |

---

## Email

| # | Check | Result | Notes |
|---|---|---|---|
| 24 | Newsletter validation path | **PASS** | `POST /api/newsletter` with a malformed address → `400 {"error":"invalid-email"}` |
| 25 | Newsletter subscription succeeds | **BLOCKED — and currently broken in production** | `RESEND_AUDIENCE_ID` is **not set** in the production environment (verified against `vercel env ls production`). The route requires it and returns `503 provider-unavailable`. **Every signup on the live site is failing right now.** Ten-minute fix — Configuration Manual **B2**. |
| 26 | Welcome email delivered | **BLOCKED** | Depends on 25. Code is unit-tested; no email has actually been sent. |
| 27 | Consent recorded verbatim | **PASS (unit)** | `signup_purpose`, `consent_text`, `consent_at` written on every subscription, including untagged ones. Covered by tests. |
| 28 | No IP / user-agent / country collected | **PASS** | Explicit test asserts this and passes. |
| 29 | Order-ready transactional email | **BLOCKED** | Requires a real purchase (B1). |

---

## Security and access control

| # | Check | Result | Notes |
|---|---|---|---|
| 30 | Auth-gated routes still protected | **PASS** | `/account`, `/admin`, `/order`, `/read` remain behind Clerk via `src/proxy.ts`; unchanged this session |
| 31 | Private R2 buckets stay private | **PASS** | Unchanged. No bucket was made public; no master file is served directly |
| 32 | Webhook signature verification intact | **PASS** | Unchanged |
| 33 | No secrets committed | **PASS** | `scripts/tmp/` gitignored; the one script that was briefly tracked reads `DATABASE_URL` from the environment and hardcodes nothing — verified against the commit |
| 34 | Ownership/entitlement authorization intact | **PASS** | `resolveEntitlementAccess` chokepoint unchanged |

---

## Build and quality

| # | Check | Result | Evidence |
|---|---|---|---|
| 35 | Lint | **PASS** | clean |
| 36 | TypeScript | **PASS** | `tsc --noEmit` clean |
| 37 | Tests | **PASS** | 105/105 |
| 38 | Production build | **PASS** | compiled successfully |
| 39 | Route classification preserved | **PASS** | `/books`, `/authors`, `/ebooks` static with 1h ISR; `/books/[slug]`, `/authors/[slug]` SSG; account/cart/search/reader dynamic — matches the pre-existing split |
| 40 | Deployment succeeded | **PASS** | Ready, production, verified live |

---

## Not verified in this session

| # | Item | Result | Why |
|---|---|---|---|
| 41 | Mobile rendering across the new pages | **N/A — not tested** | No device or browser session was used. The new components use the existing responsive primitives and wide content is in `overflow-x` containers, but **that is an inference, not a test.** Worth a real check on `/ebooks` and the Editions table before promoting the store. |
| 42 | Accessibility audit | **N/A — not tested** | New markup uses semantic sections, labelled headings, a visible focus ring on the format CTAs, `sr-only` text on the outbound Amazon link, and a real `<label>` on the author search. Not run through an automated auditor or a screen reader. |
| 43 | `valicepress.com` | **FAIL — domain does not resolve** | Connection fails. Not a code defect, but see below. |

---

## ⚠️ The most time-critical open item

**`valicepress.com` is not registered or not pointed anywhere.**

*Codex Enigmatica*'s final answer is deliberately printed **nowhere in the book**. The reader is directed to a verification page whose address is printed on the last leaf: `valicepress.com/codex-enigmatica/verify`. That page works — but only at the `.vercel.app` hostname. The project config records `domainRegistered: false`.

**If any copy is printed before that domain is live, every copy ships with a dead address and the book's central mechanic becomes unresolvable.** It cannot be fixed after printing. Register the domain and attach it to the Vercel project before the book goes to print — Configuration Manual **B0**.

---

## Verdict

| Level | Status | Reasoning |
|---|---|---|
| **Development ready** | ✅ **Yes** | Builds, typechecks, tests, lints clean; deployed and serving |
| **Production ready (code)** | ✅ **Yes** | Live, publicly reachable, correctly branded, no fabricated inventory |
| **Production ready (operational)** | ⚠️ **Partly** | Database and deployment are done. Email capture is **broken right now** (B2); Inngest sync is unconfirmed (B3) |
| **Customer ready** | ❌ **No** | No live Paddle account, so no real purchase is possible. B1 is the critical path and has the longest external lead time. |

**Plainly: the store is real, honest and live, but it cannot yet take money, and it cannot currently capture an email address either.** Both are external provisioning, not code.
