# SUB-PR 4.1 — Admin Polish & Dashboard Report

**Branch:** `main`
**Scope:** Phase 4 — Operations & Optimization, unit 1 (Admin polish & dashboard)
**Roadmap refs:** §6 (Information Architecture)
**Status:** ✅ Complete. First-cycle verification gate passed; `/admin` still `ƒ Dynamic`.

---

## 1. What landed

A real admin dashboard mounted at `/admin`, with the existing "Add a book" form moved beneath the new metrics + recent-orders surface and extended with the `paddle_price_id` field that was missing since SUB-PR 1.5.

```
/admin   ƒ Dynamic
  ├─ MetricsRow                  ← 3 stat cards: revenue / books sold / users
  ├─ RecentOrdersSection         ← table of the 10 most recent orders
  └─ CreateBookSection           ← existing form + new paddlePriceId fieldset
```

Two new server-side queries (`getDashboardMetrics`, `getRecentOrders`) live in `src/lib/db/queries/admin.ts` and are gated by a new strict `requireAdmin()` helper in `src/lib/auth.ts`.

---

## 2. Admin AuthZ strategy

### Two-layer gate

| Layer | What it checks | Failure mode |
|---|---|---|
| **Proxy** (`src/proxy.ts`) | Clerk session exists for any `/admin/*` path | Redirect to sign-in |
| **`loadAdminContext` page-level** | Calls `requireAdmin()`; maps `AdminAccessError.kind` to a calm `UnprovisionedNotice` | In-page notice (never 500) |
| **Per-query `requireAdmin()`** | Every admin DB query begins with `await requireAdmin()` | Throws — bubbles up |

Defense in depth: the page-level gate is the *user-facing* check (renders a friendly notice on any failure); the per-query gates are the *correctness* check (guarantee the queries cannot leak data if accidentally imported from a non-admin route).

### `ADMIN_EMAILS` allowlist (env-driven, no DB column)

```
ADMIN_EMAILS=alice@example.com,bob@example.com
```

- Comma-separated. Case-insensitive comparison. Whitespace tolerant.
- **Empty / unset = nobody is admin.** Safe default — never silently grants admin when env happens to be missing.
- Promotion / revocation is a redeploy. No admin UI to manage admins yet; that surface would deserve its own SUB-PR with audit logs.

`isAdminEmail(email)` is exported as a pure predicate so non-admin surfaces (a future "you're signed in as an admin" header chip) can read the same state without going through the throw-on-fail `requireAdmin` path.

### The strict `requireAdmin()` gate

```ts
export const requireAdmin = cache(async (): Promise<AdminIdentity> => {
  if (getAdminEmailAllowlist().length === 0) {
    throw new AdminAccessError("unconfigured");          // ← ADMIN_EMAILS unset
  }
  const user = await currentUser();
  if (!user) throw new AdminAccessError("not_signed_in");
  const email = user.emailAddresses.find(/* … */)?.emailAddress;
  if (!email) throw new AdminAccessError("no_primary_email");
  if (!isAdminEmail(email)) throw new AdminAccessError("not_admin");

  // JIT-upsert local row so admin queries that need `users.id` always have it.
  const localUserId = await upsertLocalUser({ /* … */ });
  return { email: email.toLowerCase(), localUserId };
});
```

Three architectural notes:

1. **Throws an `AdminAccessError` with a discriminating `kind`.** Callers (the page loader) can `switch (err.kind)` and render targeted messaging — "sign in", "not on the allowlist", "ADMIN_EMAILS is empty" — without inspecting error message strings.
2. **Wrapped with React's `cache()`.** The page calls `requireAdmin` once via `loadAdminContext`; each of the two admin queries also calls `await requireAdmin()` defensively. With `cache()`, the per-request cost is fixed — one Clerk API call, one allowlist check, one `users` upsert no matter how many admin queries call into it.
3. **No silent-grant defaults.** If `ADMIN_EMAILS` is unset, we throw `unconfigured` immediately — never check whether the user happens to be signed in.

### Error-kind → user-facing notice mapping

| `AdminAccessError.kind` | Notice title | Missing-env hint |
|---|---|---|
| `unconfigured` | "Admin allowlist is empty" | `ADMIN_EMAILS` |
| `not_signed_in` | "Sign in required" | — |
| `no_primary_email` | "Your Clerk account has no primary email" | — |
| `not_admin` | "Not authorized" | — |

Every failure case is a friendly in-page notice. The 500-on-error path is reserved for genuinely-unexpected failures (Clerk API outage, DB connection refused mid-request).

---

## 3. The metric queries

`src/lib/db/queries/admin.ts` exposes two functions; both begin with `await requireAdmin()` and are wrapped in a local `safeQuery` for DB-failure resilience (same discipline as `catalog.ts` / `account.ts` / `reviews.ts`).

### `getDashboardMetrics()` → `{ revenueByCurrency, booksSold, totalUsers }`

Runs three SQL aggregates in parallel via `Promise.all`:

```sql
-- 1. Per-currency revenue rollup
SELECT currency,
       COALESCE(SUM(total_cents - tax_cents), 0)::int  AS net_cents,
       COALESCE(SUM(total_cents),               0)::int AS gross_cents,
       COALESCE(SUM(tax_cents),                 0)::int AS tax_cents,
       COUNT(*)::int                                    AS order_count
FROM   orders
WHERE  status = 'paid'
GROUP  BY currency
ORDER  BY COALESCE(SUM(total_cents - tax_cents), 0) DESC;

-- 2. Books sold across all paid orders
SELECT COUNT(order_items.id)::int AS count
FROM   order_items
JOIN   orders ON order_items.order_id = orders.id
WHERE  orders.status = 'paid';

-- 3. Total users
SELECT COUNT(*)::int FROM users;
```

#### Why net + gross + tax all in the response

Tax is collected on our behalf and remitted to the relevant authority — it isn't ours to spend. The headline "revenue" metric is **net** (`total_cents - tax_cents`). Gross and tax are still returned so the dashboard can show, in small print, the gross amount and order count — useful for sanity-checking against the Paddle dashboard.

#### Why per-currency, not a single total

`orders.currency` is per-row. Summing across currencies without FX would either silently mislabel the total or quietly drop non-dominant-currency orders. The query returns one row per currency, sorted by net revenue descending; the dashboard headline picks `revenueByCurrency[0]` (the dominant currency) and lists the rest in a sub-line. No silent FX, no silent drop.

#### Why `::int` casts

Postgres `numeric` (the default return type of `SUM`) marshals to JS as `string` in the `pg` driver. The `::int` cast turns the result into a real JS number — small payload, no string-parsing in the app server.

#### Why `COALESCE(SUM(…), 0)`

`SUM` over an empty result set returns `NULL`. Coalescing to `0` keeps the response shape stable for the empty-DB case so the dashboard renders zeros instead of having to handle `null`.

### `getRecentOrders(limit = 10)` → `RecentOrder[]`

Uses Drizzle's relational query API — same shape as `account.getUserOrders` but unconstrained by `userId`:

```ts
db.query.orders.findMany({
  orderBy: (o, { desc }) => desc(o.createdAt),
  limit,
  columns: { /* … */ },
  with: {
    user:  { columns: { email: true, name: true } },
    items: { columns: { priceCentsAtPurchase: true },
             with: { book: { columns: { title: true, slug: true } } } },
  },
});
```

Projects only what the table actually needs — no `mor_order_ref` PII concerns beyond what's already visible to the admin (it's their own data).

---

## 4. Paddle price ID — the missing piece from SUB-PR 1.5

`books.paddle_price_id` was added to the schema in SUB-PR 1.5 and a comment notes that checkout fails fast for any cart item without it. Until SUB-PR 4.1, there was no admin UI to actually populate it — books had to be edited via direct SQL.

Added in three places:

1. **Form field** — new fieldset on the "Add a book" form, with `legend="Merchant of Record (Paddle) — required before checkout"` and help text pointing at the Paddle dashboard.
2. **`CreateBookInput` interface** — new optional `paddlePriceId?: string` field.
3. **`parseCreateBookFormData` parser** — reads the form field, applies the same `trim → undefined` discipline as the other string fields.
4. **`createBook` insert** — `paddlePriceId: input.paddlePriceId ?? null`.

The field is **optional at create time** so a book can land in `draft` while the operator goes to the Paddle dashboard to register the price. The checkout-time guard from SUB-PR 1.5 remains the enforcement point.

---

## 5. The dashboard UI

| Section | What it shows | Treatment |
|---|---|---|
| Header | "Admin · Dashboard" overline + serif H1 + signed-in-as line | Matches existing admin/catalog typography |
| MetricsRow | 3 `StatCard`s + optional secondary-currency sub-line | Card uses `bg-card`, `border-border`, serif numerals |
| RecentOrdersSection | Real `<table>` with semantic `<thead>` / `<tbody>` / `<th scope>` | Mobile-overflow-scroll on the wrapper |
| StatusBadge | Inline pill, color-coded by order status | `paid` → primary, `pending` → muted, `failed` → destructive, `refunded` → accent |
| CreateBookSection | Existing form, now wrapped in a `<section>` with its own heading | New `paddlePriceId` fieldset added at the bottom |

a11y notes:
- The metrics row has a visually-hidden `<h2 id="metrics-heading">Key metrics</h2>` so screen readers get a clear section landmark.
- The orders table uses `<th scope="col">` for column headers.
- The Status column uses an `inline-flex` pill with both color and text, so it's readable in monochrome.

---

## 6. SSG / Dynamic invariants preserved

| Route | Before | After |
|---|---|---|
| `ƒ /admin` | Dynamic | **Dynamic** ✅ |
| `○ /` | Static | Static |
| `○ /books` | Static + ISR | Static + ISR |
| `● /books/[slug]` | SSG | SSG |
| `○ /blog` | Static | Static |
| `● /blog/[slug]` | SSG | SSG |
| `● /blog/category/[slug]` | SSG | SSG |
| `● /authors/[slug]`, `● /categories/[slug]` | SSG | SSG |
| `ƒ /account/*`, `ƒ /cart`, `ƒ /search`, … | Dynamic | Dynamic |
| `○ /sitemap.xml` | Static + ISR | Static + ISR |

The `/admin` route was already `force-dynamic` from SUB-PR 0.6 (Clerk + DB at request time). Adding the queries and dashboard surfaces did not change its classification. Every other route's classification is also unchanged — zero regressions to Phases 0/1/2/3.

---

## 7. Files touched / created

**New (2):**
1. `src/lib/db/queries/admin.ts` — `getDashboardMetrics`, `getRecentOrders`
2. `sub-pr-report/SUB_PR_4.1_REPORT.md` (this file)

**Modified (4):**
- `.env.example` — added `ADMIN_EMAILS` section + commentary
- `src/lib/auth.ts` — added `AdminAccessError`, `getAdminEmailAllowlist`, `isAdminEmail`, `requireAdmin` (cached), `AdminIdentity` type
- `src/app/admin/page.tsx` — replaced ad-hoc auth check with `requireAdmin()`-backed `loadAdminContext`; added MetricsRow + RecentOrdersSection + StatCard + StatusBadge + new Paddle-price-id fieldset
- `src/app/admin/actions.ts` — extended `CreateBookInput`, `parseCreateBookFormData`, and the `INSERT` to handle `paddlePriceId`

**No schema or migration changes.** `books.paddle_price_id` already existed from SUB-PR 1.5.

---

## 8. Verification (first-cycle green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean
$ npm run build           # → success
```

Build output (relevant rows):

```
├ ƒ /admin                                         ← Dynamic  ◀── crucial check holds
├ ƒ /account/{library,orders,settings}             ← Dynamic
├ ● /books/[slug]                                  ← SSG
├ ○ /books                              1h     1y  ← Static + ISR
├ ○ /blog                                          ← Static
├ ● /blog/[slug]                                   ← SSG
└ … (all others unchanged)
```

**`ƒ /admin` stays Dynamic.** No regressions to any other classification.

The expected DB-unavailable warnings during build (`[catalog] …`) still appear because catalog queries run at SSG/ISR time; admin queries do not appear in the build output because `/admin` is `force-dynamic` and never executes at build. The `[admin]` warnings will only surface in production logs when an admin actually loads the dashboard against an unprovisioned DB — at which point the `safeQuery` fallback degrades the dashboard to zeros rather than crashing it.

---

## 9. What this unlocks (and what's deliberately out of scope)

**Unlocked:**
- Operators can see the business at a glance without opening Drizzle Studio or the Postgres console.
- The `paddle_price_id` wiring gap from SUB-PR 1.5 is closed — books can be created with their MoR id straight from the admin form.
- The `requireAdmin()` + `AdminAccessError` plumbing is the foundation for *any* future admin-only surface (publish flow, refund processor, review moderation, content-flag triage).

**Out of scope (deliberately, for now):**
- **An Edit Book form.** Create-only is sufficient for v1; edit needs a list view first, and that deserves its own UX pass. Hand-edits via DB studio are an acceptable interim.
- **An admin user-management UI.** `ADMIN_EMAILS` env + redeploy is the right scope for a single-admin / small-team product.
- **Audit logs of admin actions.** Worth doing once there are non-trivial admin actions to audit (publish, refund, ban).
- **Charts / time-series for revenue.** A single snapshot is right for v1; trend lines need a date-range picker and that's its own SUB-PR.
- **Per-book performance breakdown.** Reasonable next step but not required by this brief.
- **Refund / cancel actions from the admin.** Needs the Paddle Refund API surface (also a meaningful SUB-PR on its own).

---

## 10. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 4.1 reuses |
|---|---|
| 0.1 — scaffold | Design tokens, Button primitive, typography |
| 0.3 — Postgres + Drizzle | `orders`, `order_items`, `users` schema |
| 0.5 — Clerk auth | `currentUser`, the `upsertLocalUser` JIT pattern |
| 0.6 — admin ingest | The existing `/admin` page skeleton + `UnprovisionedNotice` + `createBook` action / `parseCreateBookFormData` |
| 1.5 — Paddle checkout | `books.paddle_price_id` column (already in schema; this SUB-PR finally surfaces it in the admin form) |
| 1.6 — watermark pipeline | The `entitlements.status = 'ready'` state model that the recent-orders table indirectly reflects |
| 1.7 — library / order UX | The order/order_item relational query shape, mirrored in `getRecentOrders` |

No regressions to any of them.

---

**Next:** HALT for explicit approval before starting SUB-PR 4.2.
