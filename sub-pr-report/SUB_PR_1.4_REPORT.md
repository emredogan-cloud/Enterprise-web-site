# SUB-PR 1.4 — Runtime Hardening & Cookie-Backed Cart — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.4, paired with a runtime-hardening hot-fix.
> **Date:** 2026-05-28 · **Status:** ✅ Complete — both commits green; SSG invariant preserved on every catalog route.
> **Roadmap references consulted:** §4 (revenue), §9 (fulfillment pipeline shape), §11 (defense-in-depth), §8 / ADR-1 (rendering strategy).

This SUB-PR shipped as **two commits** to keep the fix isolated and reviewable:

1. **`08130e8` · fix: handle missing env vars gracefully to prevent 500 errors on dynamic routes**
2. **`<this commit>` · feat: complete SUB-PR 1.4 cookie-backed cart**

---

## PART 1 — Why `/admin` was 500-ing, and how it now degrades

### Root causes (three of them, in execution order)

| # | Where | Failure |
|--:|---|---|
| 1 | `src/proxy.ts` middleware | `auth.protect()` on `/admin(.*)` threw at the edge when `CLERK_SECRET_KEY` was absent — the request never reached the page. |
| 2 | `src/app/admin/page.tsx` | `getAuthenticatedUser()` and `requireUserId()` (Clerk) threw when keys were missing — uncaught, surfaced as 500. |
| 3 | `src/lib/db/users.ts` → `upsertLocalUser()` | A `db.insert(...).onConflictDoNothing(...)` call threw when `DATABASE_URL` was empty — uncaught, surfaced as 500. |

### Fixes

**Middleware (`src/proxy.ts`) — never enforce auth at the edge when Clerk isn't configured:**

```ts
function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    if (!isClerkConfigured()) return;   // ← let the page render its own notice
    await auth.protect();
  }
});
```

This is intentionally a *dev-ergonomics* concession, not a security regression: in production deployments the Clerk env keys are required by the platform (Vercel env). When they're missing — which only happens on a freshly-cloned local dev box or a CI smoke run — the *page* renders the "unprovisioned" notice (see below) instead of a hard 500. Once env is populated, the middleware enforces as designed.

**Admin page (`src/app/admin/page.tsx`) — a context loader that maps every failure mode to a structured "blocked" reason:**

```ts
async function loadAdminContext(): Promise<AdminContextOk | AdminContextBlocked> {
  // Cheap pre-flight: which env vars are missing right now?
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
  }
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (missing.length > 0) return { ok: false, title: …, body: …, missing };

  try {
    const user = await getAuthenticatedUser();
    if (!user) return { ok: false, title: "Sign in required", … };
    // resolve primary email, upsert local user …
    return { ok: true, email, localUserId };
  } catch (err) {
    return { ok: false, title: "Admin panel — system unavailable", body: err.message, missing: [] };
  }
}
```

On `ok: false`, the page renders `<UnprovisionedNotice />` — a calm, on-brand stand-in that lists *exactly* which env vars to set, plus a pointer to `.env.example` and `vercel env pull`. On `ok: true`, the existing admin form renders unchanged.

**`createBook` Server Action (`src/app/admin/actions.ts`):** wrapped in `try/catch` so a DB rejection (e.g., duplicate slug) is logged server-side rather than propagated to the client as a 500. Inline form-level error display is queued for a later SUB-PR.

**Global error boundary (`src/app/error.tsx`):** a Client Component that catches anything that slips past per-route try/catches. Dev builds surface the raw message; production stays terse. Includes a `reset()` button that re-renders the segment.

**New shared component (`src/components/unprovisioned-notice.tsx`):** a single calm Server Component used by `/admin` today and any future dynamic route that needs the same fallback.

### Why these specific choices

- **Edge-level skip + page-level guard** is preferred over making middleware fail loud and then catching in the page — `auth.protect()` issues a redirect (302), which the page can't recover from. Skipping protection at the edge when env is missing is the only path that lets the page render at all.
- **Cheap env pre-flight** before calling Clerk/DB — if `DATABASE_URL` is missing the admin can identify the issue without paying for a Clerk API call that would have failed anyway.
- **Throw-vs-catch policy:** Server Actions catch internally (no client 500); page renderers also catch and render a notice; `error.tsx` is the global backstop for the long tail.

### Files touched in Part 1

```
src/proxy.ts                              (+ isClerkConfigured guard)
src/app/admin/page.tsx                    (loadAdminContext + UnprovisionedNotice render path)
src/app/admin/actions.ts                  (try/catch around the whole action body)
src/components/unprovisioned-notice.tsx   (new — shared calm fallback UI)
src/app/error.tsx                         (new — global Client error boundary)
```

---

## PART 2 — Cookie-backed cart

### Design overview

| Concern | Choice | Why |
|---|---|---|
| **State** | Single `dbs_cart` cookie (httpOnly, sameSite=lax, 30-day max-age) | No DB row, no auth requirement; works pre- and post-sign-in identically. JIT-merge into a DB-backed `carts` table later if cross-device persistence is wanted. |
| **Item shape** | `{ bookId: string; addedAt: number }` | Digital books have implicit quantity 1; we use add-order for display. |
| **Reads** | `readCart()` in `src/lib/cart.ts` (defensive parser — never throws) | Malformed / tampered cookies degrade to an empty cart. |
| **Writes** | Server Actions only (`addToCart` / `removeFromCart` / `clearCart`) | Next.js restriction: only Server Actions and Route Handlers can `cookies().set()`. |
| **Header badge** | **Client Component** that fetches `/api/cart/count` | This is the load-bearing decision — see below. |

### The SSG-preservation decision (load-bearing)

The user mandated: *"Ensure catalog routes remain strictly Static or SSG."* The naïve implementation — reading the cart cookie in the `SiteHeader` Server Component — would call `cookies()` in the layout, which **propagates dynamism downward** through the entire route tree. Every catalog page would become `ƒ Dynamic`. ADR-1 broken.

**The chosen pattern:**

1. The cart cookie read lives in **two narrow surfaces**: the `/cart` page (intentionally dynamic) and `/api/cart/count` (Route Handler, intentionally dynamic).
2. The header's `<CartIndicator />` is a **Client Component**. It fetches `/api/cart/count` once on mount and re-fetches on a `cart-changed` `CustomEvent` dispatched by the three cart-mutating buttons (`AddToCartButton`, `RemoveFromCartButton`, `ClearCartButton`).
3. **`SiteHeader` and `layout.tsx` stay pure Server Components with no dynamic hooks** — Client Components do *not* promote their parent to dynamic.

Build output confirms the decision held:

```
Route (app)             Revalidate  Expire
┌ ○ /
├ ƒ /admin
├ ƒ /api/cart/count                       ← Dynamic (new — Route Handler)
├ ● /authors/[slug]
├ ○ /books                      1h      1y
├ ● /books/[slug]                          ← STILL SSG, even with AddToCartButton inside
├ ƒ /cart                                  ← Dynamic (new — reads cookie)
├ ● /categories/[slug]
└ ƒ /search
```

**Same `BookCard`-bearing routes are still `● SSG`. Same home is still `○ Static`. ADR-1 holds.** The only new dynamic routes are the two that genuinely need to be: `/cart` (per-request cookie) and `/api/cart/count` (per-request cookie).

### Update propagation — how the badge stays current

After a Server Action mutates the cart, Next.js auto-revalidates the affected path (`/cart`). But the `<CartIndicator />` lives in the static-ish layout shell and would otherwise show a stale count. The lightweight fix:

```ts
// in each cart-mutating Client button
await addToCart(bookId);                                  // Server Action — cookie write
window.dispatchEvent(new CustomEvent("cart-changed"));    // signal
```

```ts
// in CartIndicator (Client Component)
useEffect(() => {
  void refetch();
  const handler = () => { void refetch(); };
  window.addEventListener("cart-changed", handler);
  return () => window.removeEventListener("cart-changed", handler);
}, []);
```

No context provider, no global state library — the cookie is the source of truth and we re-fetch on signal. Two listeners total (plus the initial mount fetch). The badge updates the moment the action returns.

### Cart page behaviour

- `readCart()` → `getCartBooks(bookIds)` (new query in `src/lib/db/queries/catalog.ts`, `safeQuery`-wrapped like the rest).
- The DB returns books in arbitrary order; we **re-order by `addedAt`** to match the cookie's add-order.
- A book that was unpublished or deleted since it landed in the cart silently drops from the page (filtered by `b.status = 'published'` in the query, and by `booksById.get(...)` returning `undefined` after).
- Total is summed across `priceCents`; we use the first item's currency for the formatted total (TODO for multi-currency carts when we add internationalization).
- "Checkout" button is a placeholder (`disabled`) — wires up in SUB-PR 1.5 (MoR).

### Files added / modified in Part 2

```
src/lib/cart.ts                                 (new — cookie utilities, defensive parser)
src/app/cart/actions.ts                         (new — addToCart / removeFromCart / clearCart)
src/app/api/cart/count/route.ts                 (new — GET cart count for the Client badge)
src/components/cart-indicator.tsx               (new — Client Component, cart-changed-aware)
src/components/add-to-cart-button.tsx           (new — Client Component on book detail)
src/components/cart-buttons.tsx                 (new — RemoveFromCartButton + ClearCartButton)
src/app/cart/page.tsx                           (new — dynamic, noindex)
src/components/site-header.tsx                  (+ <CartIndicator /> after the search bar)
src/lib/db/queries/catalog.ts                   (+ getCartBooks helper)
src/app/books/[slug]/page.tsx                   (+ AddToCartButton beneath the spec list)
sub-pr-report/SUB_PR_1.4_REPORT.md              (new — this report)
```

---

## Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — full route classification table above; `/books/[slug]` is `● SSG`, `/cart` and `/api/cart/count` are `ƒ Dynamic`, every other classification unchanged |

`safeQuery` warnings still appear during build for the catalog list/slug queries — same graceful-empty-states behavior as 1.1/1.2/1.3. `getCartBooks` doesn't appear in the warning list because `/cart` is dynamic (it never runs at build time).

Only persistent benign note across the build: the `MODULE_TYPELESS_PACKAGE_JSON` cosmetic warning on `tailwind.config.ts` — unchanged from every prior SUB-PR.

---

## Decisions / deviations worth surfacing

1. **The fix and the feature ship as two commits** — they're orthogonal and each is independently revertable.
2. **Middleware skips `auth.protect()` when Clerk isn't configured** (dev-ergonomics, no production impact — env keys are required at deploy time).
3. **The cart count badge is a Client Component**, *not* a Server Component reading cookies. This is the single decision that preserves SSG across every catalog route.
4. **The cart cookie is httpOnly + sameSite=lax + 30-day max-age**, secure-only in production. Tampering returns an empty cart via the defensive parser.
5. **`cart-changed` `CustomEvent` over a global store / context** — lightweight, no library cost, no provider in the tree.
6. **No quantity field on cart items.** Digital books have implicit quantity 1; representing it would be misleading.
7. **Cart re-ordering happens client-side (in the page Server Component)** after the DB returns rows — the cookie is the canonical order, the DB just supplies metadata.
8. **`UnprovisionedNotice` is a shared component**, not inlined in `/admin`. The same pattern will guard other dynamic routes (the future `/account` library page, the watermark worker dashboard) as they land.

---

## Definition-of-done vs. SUB-PR 1.4 + Part 1 fix

**Part 1 (500 fix):**
- [x] Investigation — three root causes identified (middleware, page, JIT upsert).
- [x] Fix — middleware guard + page-level context loader + Server Action try/catch + `error.tsx`.
- [x] Local verification green; routes unchanged.
- [x] Committed (`08130e8`).

**Part 2 (Cart):**
- [x] Cookie-backed cart utility (`src/lib/cart.ts`) with defensive parser and the read/write/delete trio.
- [x] Server Actions for add / remove / clear, each with cookie write + `revalidatePath`.
- [x] `<CartIndicator />` in the header — Client Component fetching `/api/cart/count`, listening for `cart-changed`.
- [x] `<AddToCartButton />` on `/books/[slug]` — Client Component dispatching the event after the Server Action.
- [x] `/cart` page — items, total, Clear / placeholder Checkout, dynamic + `noindex`.
- [x] Local verification — lint (zero warnings), tsc, build — all green.
- [x] **`/books/[slug]` remains `● SSG`** and every other catalog route's classification is unchanged.

**Out of scope (correctly deferred):**
- Inline form-error display on the admin form (the Server Action currently swallows + logs).
- DB-backed cart for cross-device persistence (cookie is enough until checkout).
- Multi-currency cart total handling (single-currency assumption while the catalog is one currency).
- The Checkout button itself (MoR — SUB-PR 1.5).

---

## Next unit (NOT started — awaiting approval)

**SUB-PR 1.5 — MoR checkout + webhook ingestion.** Paddle/Lemon Squeezy hosted checkout, signature-verified idempotent webhook upserting `Order` + `OrderItem` + `Entitlement(pending)` keyed on the MoR order ref (Roadmap ADR-2, §9). Execution is **halted pending your explicit approval.**
