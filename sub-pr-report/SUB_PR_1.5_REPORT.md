# SUB-PR 1.5 — Paddle Checkout + Webhook Fulfillment Pipeline — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.5.
> **Scope (verbatim):** *"Paddle/Lemon Squeezy hosted checkout; signature-verified, idempotent webhook upserting Order/OrderItem/Entitlement(pending) keyed on MoR order ref (ADR-2, §9)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green; SSG invariant preserved.
> **Roadmap references consulted:** §9 (architecture), §10 (schema), §11 (security), §4 (commerce), ADR-2.
> **MoR committed:** **Paddle** (`@paddle/paddle-node-sdk` ^3.8.0).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Paddle SDK installed | `@paddle/paddle-node-sdk` ^3.8.0 (the package name is `paddle-node-sdk` *scoped to `@paddle/`*; a first install of unscoped `paddle-node-sdk` 404'd and was corrected). |
| Paddle client (`src/lib/paddle.ts`) | Lazy + memoized — same pattern as DB + storage clients. Environment auto-selects (`sandbox` unless `PADDLE_ENVIRONMENT=production`). |
| Schema change | New nullable `books.paddle_price_id` column (migration `0001_funny_kid_colt.sql`). |
| `createCheckoutSession` action | In `src/app/cart/actions.ts` — fetches cart, validates Paddle price mapping, creates transaction, returns hosted-checkout URL. |
| `CheckoutButton` Client Component | In `src/components/checkout-button.tsx` — calls the action, navigates on success, surfaces calm inline error on failure. |
| `/cart` page wiring | Replaced the disabled placeholder with the new `<CheckoutButton />`. |
| Webhook handler | `src/app/api/webhooks/paddle/route.ts` — Node runtime, force-dynamic, **signature-verified first**, then defensive field extraction. |
| Fulfillment pipeline | `src/lib/fulfillment.ts` — `processCompletedTransaction()`: atomic Order + OrderItems + Entitlements(pending) inside a Drizzle transaction, idempotent on `mor_order_ref`. |
| Fulfillment audit log | `src/lib/fulfillment-log.ts` — placeholder for the watermark queue (SUB-PR 1.6); always `console.log`'d, best-effort file append. |
| Constitution updated | `PAST_DECISIONS.md` now locks **Paddle** as the MoR (was *Paddle/Lemon Squeezy*). |

---

## 2. Build classification (SSG invariant preserved)

```
Route (app)               Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /api/cart/count
├ ƒ /api/webhooks/paddle              ← new dynamic Route Handler
├ ● /authors/[slug]
├ ○ /books                        1h      1y
├ ● /books/[slug]
├ ƒ /cart
├ ● /categories/[slug]
└ ƒ /search
```

The only new route is `/api/webhooks/paddle` — correctly **ƒ Dynamic** (POST-only Route Handler that reads request body + writes DB). Every other classification is identical to the previous SUB-PR. ADR-1 holds.

---

## 3. Paddle SDK setup

```ts
// src/lib/paddle.ts
let _paddle: Paddle | undefined;

export function getPaddleClient(): Paddle {
  if (_paddle) return _paddle;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("Paddle is not configured. Set PADDLE_API_KEY …");
  }
  const environment =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;
  _paddle = new Paddle(apiKey, { environment });
  return _paddle;
}

export function isPaddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}
```

Three intentional properties (same discipline as DB + storage clients):
1. **Lazy** — `new Paddle(...)` is only called on first use; the module imports cleanly when `PADDLE_API_KEY` is unset (build / tsc / CI pass).
2. **Memoized** — repeated calls return the same client; no per-request reconstruction.
3. **`isPaddleConfigured()`** — a cheap pre-flight the action uses before calling Paddle, so an unprovisioned env returns a calm `{ ok: false, error: … }` to the client instead of an SDK-level exception.

---

## 4. Schema addition: `books.paddle_price_id`

A new nullable column on `books`:

```ts
/**
 * Paddle catalog `priceId` (e.g. `pri_01abc…`). Populated by the admin
 * after registering the book in Paddle's dashboard. Nullable so a book
 * can exist in draft before its Paddle price is set up; checkout fails
 * fast if any cart item lacks this value.
 */
paddlePriceId: text("paddle_price_id"),
```

Migration:
```
drizzle/0001_funny_kid_colt.sql
ALTER TABLE "books" ADD COLUMN "paddle_price_id" text;
```

This is a tiny, additive migration — no defaults, no NOT NULL, no FK. Apply order is preserved by Drizzle's migration journal. The admin form will gain a `paddle_price_id` input field in a follow-up SUB-PR (alongside the Paddle product/price registration flow); SUB-PR 1.5 unblocks the column.

---

## 5. Server Action `createCheckoutSession`

```ts
export async function createCheckoutSession(): Promise<CheckoutResult> {
  if (!isPaddleConfigured()) return { ok: false, error: "…" };
  const cart = await readCart();
  if (cart.items.length === 0) return { ok: false, error: "…" };
  const books = await getCheckoutItems(cart.items.map((i) => i.bookId));
  if (books.length === 0) return { ok: false, error: "…" };
  const unmapped = books.filter((b) => !b.paddlePriceId);
  if (unmapped.length > 0) return { ok: false, error: `… ${titles}.` };

  try {
    const transaction = await paddle.transactions.create({
      items: books.map((book) => ({
        priceId: book.paddlePriceId as string,
        quantity: 1,
      })),
      customData: { bookIds: books.map((b) => b.id) },
      collectionMode: "automatic",
    });
    const url = transaction.checkout?.url;
    if (!url) return { ok: false, error: "Paddle did not return a checkout URL." };
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Checkout failed." };
  }
}
```

**Why every failure mode returns `{ ok: false, error }` instead of throwing:**
The Server Action's result is rendered inline by the `CheckoutButton` Client Component, which sets a `role="alert"` paragraph beneath the button. Throwing would surface as a 500; structured errors give the user actionable feedback.

**Failure modes covered explicitly:**
| Cause | User-facing message |
|---|---|
| `PADDLE_API_KEY` missing | "Checkout is not configured yet (missing PADDLE_API_KEY)." |
| Empty cart | "Your cart is empty." |
| All cart items unpublished | "None of the items in your cart are available right now." |
| Any book lacks `paddle_price_id` | "Not ready for checkout — these titles have no Paddle price yet: <titles>." |
| Paddle API rejected | The SDK's error message (e.g. invalid price ID, currency mismatch). |

**`customData.bookIds`** is the link back to our catalog rows in the webhook — Paddle echoes this object back unchanged with the transaction notification, so the fulfillment pipeline knows which books to entitle.

---

## 6. Webhook handler — signature first, then defensive narrowing

```
POST /api/webhooks/paddle
  ├─ Reject 503 if PADDLE_WEBHOOK_SECRET unset
  ├─ Reject 401 if Paddle-Signature header missing
  ├─ Read raw body (Paddle signs raw bytes — never JSON-parse first)
  ├─ paddle.webhooks.unmarshal(rawBody, secret, signature)   ← signature verify
  │   └─ throw → 401
  ├─ switch on event.eventType
  │   └─ "transaction.completed" → processCompletedTransaction(args)
  └─ Return 200 (or 500 to trigger Paddle retry on handler error)
```

**Three security disciplines explicitly enforced (Roadmap §11):**

1. **Signature verification happens first.** No DB call, no log write, no early code path executes until `paddle.webhooks.unmarshal()` accepts the signature. The SDK does both verification and parsing in one call — using it is the canonical-safe pattern; rolling our own HMAC would be a footgun.
2. **Raw-body signing.** Paddle signs the raw request bytes, so the handler reads `request.text()` and passes the string straight to the verifier. We never `request.json()` before verification — JSON re-serialization would invalidate the signature.
3. **Defensive field narrowing.** Even after verification, we treat `customData.bookIds` as `unknown` and runtime-filter it to a `string[]` — a Paddle dashboard misconfiguration shouldn't be able to inject objects into our DB writes.

**`runtime = "nodejs"`** is set because the handler uses Drizzle's `db.transaction()` over `@neondatabase/serverless`'s WebSocket pool — Edge runtime would not support it.

---

## 7. Idempotent fulfillment — the architectural meat

```ts
// src/lib/fulfillment.ts
await db.transaction(async (tx) => {
  const inserted = await tx
    .insert(orders)
    .values({
      userId: localUserId,
      morOrderRef: transactionId,    // Paddle transaction_id ← idempotency key
      totalCents,
      currency,
      taxCents,
      status: "paid",
    })
    .onConflictDoNothing({ target: orders.morOrderRef })   // ← UNIQUE in §10
    .returning({ id: orders.id });

  if (inserted.length === 0) {
    // Paddle retried the webhook → row already exists → no-op return.
    return;
  }

  const orderId = inserted[0].id;
  createdOrderId = orderId;

  for (const book of books) {
    await tx.insert(orderItems).values({ … });
    await tx.insert(entitlements).values({ …, status: "pending" })
      .onConflictDoNothing({ target: [entitlements.userId, entitlements.bookId] });
  }
});
```

**Idempotency primitive:** `orders.mor_order_ref` carries a UNIQUE constraint (`orders_mor_order_ref_uk` from SUB-PR 0.3). The `onConflictDoNothing(target).returning({id})` pattern *atomically* asks the database "is this the first time?". A Paddle retry (sent on a 5xx, on a network blip, or because the handler raced with itself) inserts nothing and returns no row → we no-op cleanly. **No double-fulfillment is possible**, no double-entitlement, no double-watermark-job.

**Atomic boundary:** Order + OrderItems + Entitlements are written inside a single Drizzle transaction. If anything mid-way fails (a book vanished between checkout and webhook, the connection blipped, etc.), the entire tx rolls back; Paddle's next retry replays cleanly.

**Why the user upsert is OUTSIDE the transaction:** `upsertLocalUser` is independently idempotent (UNIQUE on `email`), and it never needs to share atomicity with the order rows — a successful upsert + a failed order tx still leaves a consistent DB. Keeping it outside the tx keeps the tx's surface area minimal.

---

## 8. Watermark queue — placeholder, then the real thing in 1.6

The `processCompletedTransaction` function ends with `appendFulfillmentLogEntry({...})` instead of an actual queue `send()`. The audit-log entry:

```
[fulfillment] {"timestamp":"…","transactionId":"…","orderId":"…","userId":"…","email":"…","bookIds":["…"],"totalCents":1500,"currency":"USD","note":"watermark-queue placeholder; SUB-PR 1.6 wires Inngest/Vercel Queues"}
```

Always written to `console.log` (works in Vercel Functions — appears in runtime logs). Best-effort append to `logs/fulfillments.json` for local dev; on Vercel's read-only filesystem it silently no-ops (the `console.log` is the canonical record). `logs/` is now gitignored.

The placeholder lives at the *exact* boundary where the queue enqueue belongs. SUB-PR 1.6 is a single-line swap:
```ts
// Before (now):
await appendFulfillmentLogEntry({...});
// After (SUB-PR 1.6):
await inngest.send({ name: "fulfillment.transaction.completed", data: {...} });
```

---

## 9. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Migration generation | `npm run db:generate` | ✅ `drizzle/0001_funny_kid_colt.sql` — single `ALTER TABLE … ADD COLUMN paddle_price_id text;` |
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass *(after one cycle: had to drop a broad `Record<string, unknown>` cast on `event.data` and use the SDK's typed `TransactionNotification` shape — TS rightly refused the unsafe widen)* |
| Build | `npm run build` | ✅ Pass — `/api/webhooks/paddle` is `ƒ Dynamic`, every other route classification unchanged |

Same `[catalog] … failed` warnings from `safeQuery` during build (DB unprovisioned) — graceful as always. `getCheckoutItems` doesn't appear in the list because `/cart` is dynamic and the action only runs at request time.

---

## 10. Files created / modified

```
src/lib/db/schema.ts                              (+ paddlePriceId column)
drizzle/0001_funny_kid_colt.sql                   (new — generated migration)
drizzle/meta/0001_snapshot.json                   (new — snapshot)
drizzle/meta/_journal.json                        (updated — journal entry)
src/lib/paddle.ts                                 (new — lazy SDK client)
src/lib/fulfillment.ts                            (new — idempotent processor)
src/lib/fulfillment-log.ts                        (new — audit log placeholder)
src/app/api/webhooks/paddle/route.ts              (new — POST handler, signature-verified)
src/components/checkout-button.tsx                (new — Client Component)
src/app/cart/actions.ts                           (+ createCheckoutSession)
src/app/cart/page.tsx                             (− disabled Button, + CheckoutButton)
src/lib/db/queries/catalog.ts                     (+ getCheckoutItems)
memory/PAST_DECISIONS.md                          (Paddle locked over Lemon Squeezy)
.gitignore                                        (+ /logs)
package.json                                      (+ @paddle/paddle-node-sdk)
package-lock.json                                 (updated)
sub-pr-report/SUB_PR_1.5_REPORT.md                (new — this report)
```

---

## 11. Decisions / deviations worth surfacing

1. **`@paddle/paddle-node-sdk` (scoped), not `paddle-node-sdk`** — the unscoped name 404s on npm. Caught immediately on install; cost one retry.
2. **`books.paddle_price_id` is nullable, and missing-id is a calm error in `createCheckoutSession`.** The admin can publish a book before wiring its Paddle price (e.g., for SEO landing pages); only checkout requires the mapping. The error message names the offending titles so the admin knows where to look.
3. **Idempotency via `onConflictDoNothing(target: mor_order_ref).returning({id})`** — the database itself is the lock; no application-level mutex, no Redis. This is the strongest pattern available and was specifically the reason `mor_order_ref` carries a UNIQUE in §10.
4. **User upsert outside the transaction; order/items/entitlements inside.** Different atomicity boundaries — the user row is independently idempotent (UNIQUE email) and never needs to share a tx with the order rows.
5. **Webhook reads `request.text()`, not `request.json()`** — Paddle signs the raw body; JSON-reparse would break the signature.
6. **`processCompletedTransaction` lives in `src/lib/`, not in the route handler file** — separates HTTP concerns (signature verify, status codes) from business logic (DB writes). Future webhook providers (e.g., Lemon Squeezy fallback, Stripe direct) reuse the same processor.
7. **`runtime = "nodejs"`** on the webhook because Drizzle's `db.transaction()` over Neon's WebSocket pool needs Node — Edge runtime would fail.
8. **Watermark queue is a `console.log` + best-effort file append**, NOT a misleading no-op. The audit trail is real even in production (Vercel logs); the file append is a developer aid that gracefully degrades.

---

## 12. Definition-of-done vs. SUB-PR 1.5 scope

- [x] `@paddle/paddle-node-sdk` installed (after correcting the unscoped name 404).
- [x] `src/lib/paddle.ts` — lazy SDK client + `isPaddleConfigured()` helper.
- [x] `createCheckoutSession` Server Action — fetches cart, calls Paddle, returns hosted URL.
- [x] `CheckoutButton` Client Component on `/cart` — handles success-redirect + calm inline errors.
- [x] `POST /api/webhooks/paddle` — signature-verified before any side effect.
- [x] Idempotent fulfillment pipeline — Order + OrderItems + Entitlements(pending) in one Drizzle tx, keyed on `mor_order_ref`.
- [x] Watermark queue placeholder — `console.log` + best-effort `logs/fulfillments.json` append.
- [x] Local verification — lint (zero warnings), tsc, build — all green; **every catalog route's classification unchanged**.

**Out of scope (correctly deferred):**
- Real watermark queue (Inngest / Vercel Queues) — SUB-PR 1.6.
- `paddle_price_id` admin form field + the admin's Paddle-side product/price-registration flow.
- Order confirmation page at `/order/{id}` (§6 sitemap) — lands with the "ready to download" UX in SUB-PR 1.7.
- `subscription.*` event handlers (we sell one-time, not subscriptions; F2).
- Refund / chargeback event handlers (`transaction.payment_failed`, `adjustment.created`) — straightforward extension of the existing switch.

---

## 13. Next unit (NOT started — awaiting approval)

**SUB-PR 1.6 — Async watermark pipeline.** Inngest (or Vercel Queues) durable job that stamps the per-order PDF (`pdf-lib` / `qpdf`), writes the artifact to R2, sets `entitlement.status = "ready"`, and sends the ready email. The `appendFulfillmentLogEntry` call in `processCompletedTransaction` becomes the queue's `send()`. Execution is **halted pending your explicit approval.**
