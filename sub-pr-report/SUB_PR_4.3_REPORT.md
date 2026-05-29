# SUB-PR 4.3 — Transactional Email & Analytics Report

**Branch:** `main`
**Scope:** Phase 4 — Operations & Optimization, unit 3 (Email + Vercel observability)
**Roadmap refs:** §9 (Architecture — operational tooling), §11 (Security — PII discipline)
**Status:** ✅ Complete. First-cycle verification gate passed; no classification regressions.

---

## 1. What landed

The "your digital book is ready" notification flow is end-to-end live:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Paddle webhook      → src/app/api/webhooks/paddle/route.ts            │
│         ↓ signature-verified, fulfillment.transaction.completed       │
│  Inngest event       → processFulfillment (src/inngest/.../watermark.ts) │
│         ↓ for each bookId in order:                                    │
│         ↓   step.run("watermark-${bookId}")  ← writes ENTITLEMENT      │
│         ↓   step.run("email-order-ready-${bookId}")  ← THIS SUB-PR    │
│         ↓     ↓                                                        │
│  src/lib/email.ts   → sendOrderReadyEmail({ to, name, title, … })     │
│         ↓ lazy Resend client (graceful degrade if env missing)         │
│         ↓ idempotencyKey: `order-ready:${orderId}:${bookId}`           │
│  Resend API          → React Email template (src/emails/order-ready.tsx)│
│         ↓                                                              │
│  Customer inbox      → "Your book is ready" → CTA to /account/library  │
└────────────────────────────────────────────────────────────────────────┘
```

Plus Vercel Analytics + Speed Insights mounted in the root layout, auto-no-op outside Vercel.

---

## 2. Email module — `src/lib/email.ts`

Same lazy-init + graceful-degradation discipline as every other third-party client (`paddle.ts`, `storage/index.ts`, `rate-limit.ts`):

| Pattern | Why |
|---|---|
| **Memoized client** (`undefined` = unchecked, `null` = disabled, instance = ready) | One env check + one `console.warn` per process |
| **Returns `{ ok }` discriminated union, never throws** | Email is a NON-CRITICAL side-effect of fulfillment; entitlement is already `ready` when this runs |
| **Resend `idempotencyKey: "order-ready:${orderId}:${bookId}"`** | At-most-once guarantee at the Resend layer — Inngest's at-least-once retry can't produce a duplicate user-visible email |
| **`getFromAddress()` falls back to `onboarding@resend.dev`** | Lets local dev / first-deploy smoke tests send without domain verification (Resend's test sender, heavily throttled) |
| **`getAppBaseUrl()` mirrors `src/lib/seo.ts`** | Same source of truth as canonical URLs / JSON-LD |

### Why the function returns instead of throws

```ts
export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };
```

Email failure must NOT roll back the entitlement. By the time `sendOrderReadyEmail` runs, the watermark step has already:
1. Stamped the PDF
2. Uploaded to the ARTIFACTS bucket
3. Updated `entitlements.status` to `'ready'`

The customer can already access their library at `/account/library` regardless of whether the email goes through. Throwing here would cause Inngest to retry the *entire* function (which would re-walk the books, hit the "already-ready" short-circuit on each, and then retry email forever on the same failure). Returning a structured error lets the caller log and move on.

---

## 3. React Email template — `src/emails/order-ready.tsx`

Calm-literary tone consistent with the storefront, but **mapped to email-safe primitives** because email clients are not real browsers:

| Site (web) | Email |
|---|---|
| OKLCH color tokens | Hex equivalents (`#1e5c47` evergreen, `#fdfbf5` paper, `#2a261f` foreground) |
| Fraunces serif via `next/font` | `Georgia, "Times New Roman", "Hoefler Text", Cambria, serif` stack (Fraunces won't reliably load in webmail) |
| Tailwind classes | Inline `style` props on every `@react-email/components` element |
| `next/image` | No images (transactional notification — no marketing chrome) |
| `Link` from `next/link` | `<Link>` from `@react-email/components` (which renders as a proper `<a>` with email-safe attrs) |
| Hover states, transitions | Removed (most email clients strip them anyway) |

### Layout choices

- **Single primary CTA** — "Open my library" in evergreen, button-shaped via padded `<Link>`. No secondary actions.
- **Fallback URL line** — visible URL beneath the button, in case the styled button renders as plain text in the recipient's client.
- **`<Preview>`** carries the short snippet that webmail shows under the subject line — set to `"Your digital book is ready: <title>"` (≤90 chars).
- **First-name extraction** from `buyerName` (Paddle's customer name), falling back to "Hello," when unavailable.
- **Order ref footer** — short 8-char prefix of the UUID, useful for support tickets without leaking the full id.

### What the email deliberately doesn't include

- **The watermarked PDF as an attachment.** It would bloat inboxes (PDFs are 1-50 MB), and our model is "buy → download from /account/library when you want it." The CTA replaces the attachment.
- **A download link to the PDF directly.** Signed URLs are TTL-bound (10-15 min per Roadmap §11); a clickable link in an email aged hours/days would 403. The library page issues a fresh signed URL on demand.
- **Marketing follow-ups.** This is a transactional template. Newsletter / promo sends would be a separate template in a later SUB-PR.

---

## 4. Inngest worker integration

Three architectural changes to `src/inngest/functions/watermark.ts`:

### 4.1. Email is its own step

Before:
```ts
// Email lived INSIDE watermarkOneBook (which is wrapped in one step.run)
await step.run(`watermark-${bookId}`, async () => {
  // …watermark logic…
  await sendReadyEmailPlaceholder(…);  // ← inside the same checkpoint
});
```

After:
```ts
const result = await step.run(`watermark-${bookId}`, async () => {
  return await watermarkOneBook(…);
});
if (result.status === "watermarked") {
  await step.run(`email-order-ready-${bookId}`, async () => {
    return await sendOrderReadyEmail(…);
  });
}
```

Three benefits:
1. **Independent retry semantics.** If email fails on retry, the watermark isn't redone (an expensive PDF stamp + R2 round-trip).
2. **Skip-on-re-trigger.** When the entitlement was already `'ready'` (re-trigger scenario — Paddle resends the webhook, our idempotency lets the watermark short-circuit), we *also* skip the email. The customer already got it on the original delivery.
3. **Inngest checkpoint visibility.** The email step appears as a discrete row in the Inngest dashboard — easier to debug "did the email send?" without spelunking through application logs.

### 4.2. `WatermarkResult` carries `bookTitle`

The email needs the title; without plumbing it through the step result, we'd need a second DB lookup just to compose the subject line. Adding `bookTitle` to the return shape keeps the email step DB-free.

### 4.3. `WatermarkArgs.buyerEmail` removed

The watermark step never used the email (PII minimization per Roadmap §11 — the watermark stamps name + order ref only, NOT email). It was unused noise in the function signature. The caller (the main Inngest handler) still holds `buyerEmail` and passes it to the email step directly.

### 4.4. Two-layer idempotency

| Layer | Mechanism | Guarantees |
|---|---|---|
| Inngest | `step.run("email-order-ready-${bookId}", …)` | A retry of the function skips completed steps |
| Resend | `idempotencyKey: "order-ready:${orderId}:${bookId}"` | Even if Inngest replays past the checkpoint (rare — e.g., manual replay), Resend dedupes server-side |

The customer can never receive a duplicate "your book is ready" email for the same purchase.

---

## 5. Vercel Analytics & Speed Insights

### 5.1. Wiring

Both components mounted in `src/app/layout.tsx`, inside `<body>` and AFTER `{children}`:

```tsx
<body className="min-h-full flex flex-col">
  <SiteHeader />
  {children}
  <Analytics />
  <SpeedInsights />
</body>
```

Placement matters: they're inside the `tree` constant, which means they render in **both** branches of the conditional `<ClerkProvider>`. When Clerk isn't configured, analytics still fire; when Clerk is configured, analytics fire inside the Clerk wrapper. Same behavior either way.

### 5.2. Zero env vars, zero local impact

Both packages **auto-detect Vercel** at runtime:
- Outside Vercel (local dev, self-host) → no script injection, no beacons, no console noise.
- Inside Vercel → script loaded from `https://va.vercel-scripts.com`, beacons sent to `https://vitals.vercel-insights.com`.

No `process.env` reads in our code. No CSP exception needed for the beacon endpoint (already covered by `connect-src 'self' https:`).

### 5.3. CSP allowlist for the script host

Only one CSP change needed — extend `script-src` to allow Vercel's analytics script host:

```ts
// Before
`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,

// After
`script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
```

Explicitly allowlisted hostname rather than wildcarding all HTTPS — the only external script host we trust is the one we actually depend on.

### 5.4. Operator side

The mount alone doesn't turn the products on — operators must also enable Analytics + Speed Insights from the Vercel project dashboard (**Analytics tab → Enable**). The mount is the application-side prerequisite; the dashboard toggle is the operator-side prerequisite. Both are documented in §16 of `KURULUM_VE_ENV_REHBERI.md`.

---

## 6. Files touched / created

**New (3):**
1. `src/lib/email.ts` — Resend lazy client + `sendOrderReadyEmail`
2. `src/emails/order-ready.tsx` — React Email template
3. `sub-pr-report/SUB_PR_4.3_REPORT.md` (this file)

**Modified (4):**
- `src/inngest/functions/watermark.ts` — email moved to its own step; `WatermarkResult.bookTitle` added; placeholder helper removed; `buyerEmail` stripped from `WatermarkArgs`
- `src/app/layout.tsx` — `<Analytics />` + `<SpeedInsights />` injected
- `next.config.ts` — CSP `script-src` extended for `va.vercel-scripts.com`
- `KURULUM_VE_ENV_REHBERI.md` — appended §15 (Resend) + §16 (Vercel Analytics); extended §0 TOC + §2 envanter + §13 production checklist
- `package.json` + `package-lock.json` — `resend@6.12.4`, `@react-email/components@1.0.12`, `@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`

**No schema or migration changes.** No changes to existing routes' classifications.

---

## 7. Verification (first-cycle green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean
$ npm run build           # → success, no classification changes
```

Build output (relevant rows — note: identical to SUB-PR 4.2's final state):

```
┌ ○ /                                              ← Static
├ ƒ /account/{library,orders,settings}             ← Dynamic
├ ƒ /admin                                         ← Dynamic
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

**Zero regressions.** Analytics + Speed Insights components are pure visual mounts with no dynamic APIs; the conditional `<ClerkProvider>` still resolves correctly with them inside the inner `<body>` tree.

---

## 8. Operational expectations

### When Resend is not configured (`RESEND_API_KEY` missing)

- One `console.warn` per process start: `[email] RESEND_API_KEY is not set…`
- `sendOrderReadyEmail` returns `{ ok: false, error: "Resend not configured…" }`
- Watermark worker logs `[email] order-ready send failed for order=… book=…: Resend not configured…`
- Fulfillment STILL succeeds — entitlement is `ready`, customer can use the library
- No 500s, no rolled-back transactions

### When Resend is configured and healthy

- Each watermarked book triggers a separate email (3-book order = 3 emails)
- Idempotency at both Inngest and Resend layers → no duplicates
- `Idempotency-Key` header carries `order-ready:${orderId}:${bookId}` for Resend dedupe
- Resend dashboard's "Logs" tab shows every send with a message id

### When Resend throws (network blip, auth error, rate limit)

- `sendOrderReadyEmail` catches → returns `{ ok: false, error: <message> }`
- `[email]` warn logged
- Inngest still marks the step `succeeded` (we returned a value, not threw)
- The step's "result" pane in the Inngest dashboard shows the structured error
- Manual replay possible from the Inngest dashboard if needed

### When Vercel Analytics is not configured (local / self-host)

- Components no-op
- No script load, no beacons, no console noise
- No impact on bundle size meaningfully — the components are small

### When Vercel Analytics is configured (Vercel deploy + dashboard enabled)

- `https://va.vercel-scripts.com/v1/script.js` loaded once per page
- `vitals.vercel-insights.com` beacons sent per pageview
- Real User Monitoring (RUM) data appears in the Vercel dashboard within ~30 seconds

---

## 9. What this unlocks (and what's deliberately out of scope)

**Unlocked:**
- A real notification touchpoint when fulfillment completes — closes the "did my purchase work?" anxiety loop without the customer having to refresh `/account/library`
- The React Email + Resend pipeline is now in place; future templates (refund confirmation, account deletion confirmation, review thank-you, password reset) are one-file additions
- Real User Monitoring + product analytics so we can correlate deploys with regressions in LCP/INP/CLS

**Out of scope (deliberately):**
- **Email preview tooling.** `npx email dev` works against `src/emails/` out of the box; we just haven't wired a npm script for it. One-line add in a follow-up.
- **Multiple email templates.** Only `order-ready` for v1. Refund / account-delete / etc. come as separate small SUB-PRs.
- **Per-order email digest** (one email summarizing all books) vs **per-book emails** (what we ship). Per-book is simpler, matches the step structure, and is the common pattern for delivery notifications. Revisit if customer feedback says otherwise.
- **In-app notification center.** A notification surface inside `/account/*` would be its own SUB-PR with schema (`notifications` table) and read/unread UX.
- **Custom analytics events.** Just pageview tracking for now. `track()` calls for cart-add, checkout-start, etc. is a follow-up.
- **Wiring Sentry / structured logging.** Env vars already declared (`SENTRY_DSN` in `.env.example`); separate SUB-PR for the actual SDK integration.

---

## 10. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 4.3 reuses or extends |
|---|---|
| 1.5 — Paddle checkout | The `transaction.completed` event that triggers the Inngest fulfillment chain |
| 1.6 — watermark pipeline | The `processFulfillment` Inngest function structure; the explicit `sendReadyEmailPlaceholder` from that SUB-PR is now replaced by real Resend send |
| 1.7 — library / order UX | The `/account/library` route the email CTA links to |
| 2.3 — root layout 500 fix | The conditional `<ClerkProvider>` pattern — Analytics/SpeedInsights placed inside `<body>` to render in BOTH branches |
| 3.1 — SEO hardening | `getBaseUrl()` mirrored in `src/lib/email.ts:getAppBaseUrl()` — same source of truth for absolute URLs |

No regressions to any of them.

---

**Next:** HALT for explicit approval before any further work.
