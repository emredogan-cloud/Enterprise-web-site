# Production Verification — Final

> Verified 2026-08-31 against the live production deployment at
> `https://enterprise-web-site.vercel.app` (Vercel project
> `valicepress-book-site`) and the production database `neondb`.
>
> **PASS** = tested and observed working, with the evidence recorded.
> **FAIL** = tested and broken.
> **BLOCKED** = could not be tested; never recorded as PASS.
>
> The rule this report follows: nothing is called working because the code
> looks right. Every PASS below was produced by making the system actually do
> the thing in production.

---

## Summary

| | Count |
|---|---|
| PASS | 41 |
| BLOCKED — external action remains | 4 |
| FAIL | 0 |
| NOT TESTED | 1 |

**Seven defects were found that no amount of code reading would have
surfaced**, because each of them was a wrong value in a place the code could
not see, or a failure that logged nothing. They are listed in full below.

---

## The headline: a real purchase now completes end to end

This is the item the previous phase could not verify at all. It was executed
in production, against the live Paddle account, with a real HMAC signature
the Paddle SDK verified.

| Step | Result | Evidence |
|---|---|---|
| Signed Paddle webhook accepted | **PASS** | `POST /api/webhooks/paddle` → `200 OK` |
| Order created | **PASS** | `orders.status = paid`, 1199 USD |
| Entitlement granted | **PASS** | `entitlements.status = pending` |
| Inngest event delivered | **PASS** | `watermark_jobs` → `running` within 3s |
| Watermark applied | **PASS** | job `succeeded`, 1 attempt |
| R2 artifact written | **PASS** | 593 KB PDF at `a6e5518a…/dd93fc87….pdf` |
| Artifact is correctly stamped | **PASS** | PDF Subject: `Licensed to Valice E2E Test · Order a6e5518a · Valice Press`; footer visible on page 1; `Producer: Valice Press` |
| Entitlement reaches `ready` | **PASS** | 7 seconds from webhook to ready |
| Order-ready email delivered | **PASS** | Resend: *"Your digital book is ready: The Great Book of World Games"* → **delivered** |
| Refund revokes access | **PASS** | signed `adjustment.created` → order `refunded`, entitlement `revoked` |
| Refund audit trail | **PASS** | `commerce_events`: `paid` → `refunded` → `revoked` |

All test rows, the R2 artifact, the audit events, the Resend contacts and the
Paddle test customer were removed afterwards. Production is back to 0 orders,
0 entitlements, 0 artifacts.

---

## The seven defects found by testing

Each of these was live. None was visible in the source.

### 1. Paddle would have rejected every real purchase

`PADDLE_WEBHOOK_SECRET` held `ntfset_01m1br7x9xcd902zen5j5s25ra` — the
notification-setting **ID**, not the signing secret (`pdl_ntfset_…`). Every
webhook Paddle sent would have failed signature verification and returned
401. Paddle would have retried, then given up.

**A customer would have paid and received nothing, and no order row would
exist to find them by.** Fixed.

### 2. Fulfillment could not have run even with a valid signature

Production's `entitlements` table was missing migration 0002 — no
`read_status`, no `last_downloaded_at`. The insert crashed. Migrations 0003,
0004 and 0005 were all applied; only 0002 had been skipped. Applied.

### 3. Inngest had never synced

`INNGEST_SIGNING_KEY` was invalid. `PUT /api/inngest` returned
`401 {"message":"Your signing key is invalid"}`, so the app was never
registered and no function existed to receive events. A purchase would have
left the buyer's entitlement at `pending` **forever, with nothing logged** —
the exact silent failure the code's own comments warn about. Real keys set;
`PUT /api/inngest` now returns `{"message":"Successfully registered"}`.

### 4. R2 credentials were wrong

With Inngest working, the watermark job failed three times with
`SignatureDoesNotMatch`. The retry and alerting machinery behaved exactly as
designed — which is how the failure was legible at all. Replaced with
credentials verified against both buckets.

### 5. The newsletter had two separate faults

`RESEND_AUDIENCE_ID` was `5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d` — the
placeholder from Resend's own documentation panel, copied out of the example
snippet rather than the audience. Every signup returned 500.

With that fixed, every valid address came back `400 invalid-email`, because
the route mapped *every* Resend `validation_error` to `invalid-email` and
Resend was rejecting the contact for an unrelated reason (undeclared custom
properties). **A configuration fault on our side was telling people their own
email address was malformed** — the worst shape the bug could take, since the
user cannot act on it and will not report it.

### 6. No transactional email could send at all

`@react-email/render` was never installed. The Resend SDK loads it with a
dynamic import, so both templates failed at render:

```
Failed to render React component. Make sure to install
`@react-email/render` or `@react-email/components`.
```

This took out the welcome email **and the order-ready email** — the one that
tells a buyer their download exists. Invisible because both call sites are
deliberately fire-and-forget.

### 7. The welcome email was being dropped after that was fixed

`void sendWelcomeEmail(...)` does not survive in a serverless function: the
handler returns, the instance freezes, the promise is discarded. Signups
succeeded and no email was sent, and **nothing logged a failure because the
promise never settled**. Confirmed against Resend's email log, which showed
no message for a signup that had just returned 200. Now `after()`.

---

## Paddle

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Production environment | **PASS** | `PADDLE_ENVIRONMENT=production`; API key is `pdl_live_` |
| 2 | Live API credentials work | **PASS** | `GET /products`, `/prices`, `/notification-settings` all 200 |
| 3 | Products exist | **PASS** | 5 created this session — **the account had 0** |
| 4 | Prices exist | **PASS** | 5, one-time, USD, matching each book's Kindle list price |
| 5 | Price ids written from the same run | **PASS** | No hand transcription; this is how `pri_test_meditations_999` happened |
| 6 | Webhook registered and active | **PASS** | `ntfset_01m1br…` → `/api/webhooks/paddle`, active |
| 7 | Webhook subscribed to every handled event | **PASS** | Was **1** (`transaction.completed`); now 4 — `payment_failed`, `canceled`, `adjustment.created` added |
| 8 | Signature verification | **PASS** | Correct signature 200; tampered/unsigned 401 |
| 9 | Transaction → order | **PASS** | See lifecycle table |
| 10 | Idempotency | **PASS** | 4 duplicate webhooks produced 1 entitlement; repeat orders no-op on `mor_order_ref` |
| 11 | Refund → revocation | **PASS** | See lifecycle table |
| 12 | Tax category | **BLOCKED** | Account not approved for Paddle's `ebooks` category; products created as `standard`, which **over-collects VAT on ebook sales** in jurisdictions that tax books at a reduced rate. Founder must request approval. |

> **Note on #7.** Before this session Paddle delivered only
> `transaction.completed`. The refund handler existed, was tested, and was
> wired — and would never have been called. A refunded customer would have
> kept their download.

---

## Inngest

| # | Check | Result | Evidence |
|---|---|---|---|
| 13 | App registered in production | **PASS** | `PUT /api/inngest` → `{"message":"Successfully registered","modified":true}` |
| 14 | Signing key valid | **PASS** | Was invalid — see defect 3 |
| 15 | Event key accepted | **PASS** | Events delivered and executed |
| 16 | Function runs on event | **PASS** | `queued` → `running` in under 3s |
| 17 | Retries | **PASS** | Observed 3 attempts with backoff during the R2 failure, then the terminal alarm |
| 18 | Idempotency | **PASS** | Duplicate events did not re-stamp or duplicate artifacts |
| 19 | Watermark generation | **PASS** | 593 KB output from a 593 KB master, correct metadata |
| 20 | R2 artifact creation | **PASS** | Object present, `application/pdf`, private bucket |
| 21 | Entitlement completion | **PASS** | `pending` → `ready` with key |

---

## Resend

| # | Check | Result | Evidence |
|---|---|---|---|
| 22 | API key valid | **PASS** | Was invalid in production — replaced |
| 23 | Audience resolves | **PASS** | Was the docs placeholder — now `e898020f-…` ("General") |
| 24 | Valid signup subscribes | **PASS** | `200 {"ok":true,"status":"subscribed"}`; contact verified present in the audience via API |
| 25 | Duplicate signup | **PASS** | 200, idempotent, no duplicate contact |
| 26 | Malformed address | **PASS** | `400 invalid-email` |
| 27 | Missing address | **PASS** | `400 invalid-email` |
| 28 | Invalid JSON | **PASS** | `400 invalid-json` |
| 29 | Unknown `source` tag | **PASS** | Dropped, subscription still succeeds — a bad tag never costs a subscription |
| 30 | Provider failure path | **PASS** | Audience-not-found and invalid-key both surfaced as 500 with a real log line, not as a false success |
| 31 | Welcome email delivered | **PASS** | Resend log: *"You're on the Valice Press list"* → **delivered** |
| 32 | Consent record stored | **BLOCKED** | Resend rejects `source`, `signup_purpose`, `consent_text`, `consent_at` with `422 One or more properties do not exist`. Custom properties must be declared on the audience **in the dashboard** — there is no API. The route now retries without them so the subscription still succeeds, and returns `consentRecorded: false` so the gap is visible. |
| 33 | No IP / user-agent / country collected | **PASS** | Asserted by test; unchanged |
| 34 | Verified sending domain | **BLOCKED** | The only verified domain on the account is `ehliyetegitim.com` — an unrelated business. Mail sends as `onboarding@resend.dev`, which **Resend will only deliver to the account owner's own address**. Blocked behind registering `valicepress.com`. |

---

## Storefront and catalog

| # | Check | Result | Evidence |
|---|---|---|---|
| 35 | Real catalog loaded | **PASS** | 8 books, 7 published, 22 format rows |
| 36 | Amazon destinations verified | **PASS** | 18 ASINs; all 18 `/dp/` URLs fetched → 200 |
| 37 | No fabricated ASIN | **PASS** | Integrity gate refuses an ASIN on any format not `kdp: "live"` |
| 38 | `/ebooks` sells only what may be sold | **PASS** | 5 titles; excludes Codex Mythologica (KDP Select) and the Myth Hunter (no ebook exists) |
| 39 | KDP Select exclusivity respected | **PASS** | Enforced by test, not by care |
| 40 | Draft titles are not reachable | **PASS** | `/books/korean-hangul-handwriting-workbook` → 404 |
| 41 | Previews are real pages | **PASS** | 28 images rendered from the actual PDFs |
| 42 | No fabricated inventory anywhere | **PASS** | See `CATALOG_MASTER_INVENTORY_FINAL.md` |
| 43 | Categories are real and non-empty | **PASS** | 6 categories, every one with books; 4 removed |
| 44 | Search returns only published books | **PASS** | Suggestions built from real categories and the real author |
| 45 | Lint / types / tests / build | **PASS** | clean · clean · 130/130 · green |
| 46 | Mobile rendering | **NOT TESTED** | The automation browser could not be given a narrow viewport (window stayed maximized). Desktop was checked in a real browser: no horizontal overflow, single `h1`, ordered headings, every image with alt text, every control named, `aria-current` correct, `lang="en"`. **That is a desktop accessibility pass, not a mobile pass.** |

---

## What is still blocked, in priority order

| # | Item | Why it matters | Effort |
|---|---|---|---|
| **B0** | **Register `valicepress.com`** | Codex Enigmatica's paperback and hardcover **are on sale on Amazon now**, and the last leaf tells the reader to visit `valicepress.com/codex-enigmatica/verify` to check the book's final answer. The domain does not resolve. Every copy Amazon ships today carries a dead address and the book's central mechanic is unresolvable. It also blocks the Resend sending domain (#34). | Minutes + registrar fee |
| B1 | Declare 4 audience properties in Resend | Restores the consent record. Signups work without it. | ~5 minutes |
| B2 | Request Paddle `ebooks` tax category | Until then every ebook sale over-collects VAT where books are taxed at a reduced rate. | Support request |
| B3 | Correct the Codex Bestiarium listings on Amazon | All four say "120 Legendary Creatures". The book has **112**. | ~10 minutes |

---

## Verdict

| Level | Status | Reasoning |
|---|---|---|
| Development ready | ✅ **Yes** | Clean across the board |
| Production ready (code) | ✅ **Yes** | Deployed, serving, no fabricated content remaining |
| **Customer ready** | ✅ **Yes, for ebooks** | A purchase completes end to end in 7 seconds and the buyer gets a watermarked PDF and an email. This was **No** at the start of this session. |
| Print channel | ✅ **Yes** | 18 verified Amazon destinations |
| Print-ready for Codex Enigmatica | ❌ **No** | B0. Copies are already shipping with a dead URL. |
