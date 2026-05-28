# SUB-PR 0.5 — Auth Integration (Clerk) — Report

> **Phase:** P0 Foundations · **Unit:** SUB-PR 0.5 (`roadmap/WEB_SITE_ROADMAP.md` §18)
> **Scope (verbatim):** *"Clerk/Auth.js with social + email/magic-link, sessions, and server-side authorization helpers (ADR-8)."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green.
> **Roadmap references consulted:** §11 (Security & Compliance), ADR-8.
> **Provider committed:** **Clerk** (via `@clerk/nextjs`).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Dependency installed | `@clerk/nextjs` (current stable, brings `@clerk/types` transitively — no separate install needed). |
| Middleware | `src/middleware.ts` — `clerkMiddleware` + `createRouteMatcher`, default-public with a tight protected matcher. |
| Provider wiring | `src/app/layout.tsx` — `<ClerkProvider>` wraps `<html>`; fonts, metadata, and all prior layout state preserved. |
| Server helpers | `src/lib/auth.ts` — `getUserId`, `requireUserId`, `getAuthenticatedUser`, plus a documented `syncClerkUserToDatabase` placeholder. |
| Identity ↔ data sync | Architecture is documented in `auth.ts` and reflected in `memory/PAST_DECISIONS.md`. Webhook handler itself is correctly deferred (§4). |
| Constitution updated | `memory/PAST_DECISIONS.md` adds **Authentication — Clerk** as a locked decision; `CLAUDE.md` file layout adds `src/lib/auth.ts` and `src/middleware.ts`. |

---

## 2. Middleware route policy

Default-public, explicit-protect. Public routes (no auth required) include everything *not* matched by `isProtectedRoute` — that covers the marketing/catalog surfaces (`/`, `/books(.*)`, `/categories(.*)`, `/authors(.*)`, `/blog(.*)`) and the webhook receivers (`/api/webhooks(.*)`).

```ts
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/read(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

| Path family | Policy | Why |
|---|---|---|
| `/`, `/books(.*)`, `/categories(.*)`, `/authors(.*)`, `/blog(.*)` | **Public** | SSG-rendered, SEO surfaces (ADR-1 / §13). |
| `/api/webhooks(.*)` | **Public** | MoR & Clerk webhooks are server-to-server; auth comes from the webhook signing secret (§11). Routes verify their own signature; **never** add browser-auth on top. |
| `/account(.*)` | **Protected** | Library, orders, downloads, settings. |
| `/read(.*)` | **Protected** | Online reader. |
| `/admin(.*)` | **Protected** | Catalog ingest, pricing, publishing (admin-only role check arrives with the role layer in a later SUB-PR). |

The matcher excludes `_next/*` and static asset extensions explicitly so the middleware never runs on inert assets — saves edge-runtime CPU on every page load.

---

## 3. ClerkProvider in `layout.tsx`

```tsx
<ClerkProvider>
  <html lang="en" suppressHydrationWarning className={...}>
    <body className="min-h-full flex flex-col">{children}</body>
  </html>
</ClerkProvider>
```

`<ClerkProvider>` wraps `<html>` (the Clerk-recommended placement) so client-side hooks (`useUser`, `useAuth`, etc.) have context everywhere. All prior layout state — Geist + Fraunces fonts, metadata, body className, `suppressHydrationWarning` — is preserved.

**Build-safety verified:** the build is green with **no Clerk env keys present**. `ClerkProvider` and `clerkMiddleware` both gracefully degrade at module load — they only complain at request time when credentials are actually required. This is the same lazy-resilience pattern as the DB (`src/lib/db/index.ts`) and storage (`src/lib/storage/index.ts`) clients.

**SSG preserved:** the build output still shows `Route (app) ┌ ○ /` — the root page remains statically prerendered through the provider + middleware. The middleware appears in the build summary as `ƒ Proxy (Middleware)` (Next.js 16's new label) but does *not* convert SSG routes to dynamic.

---

## 4. Server-side auth helpers (`src/lib/auth.ts`)

Four exports plus the architectural commentary at the top of the file:

| Export | Purpose | Use when |
|---|---|---|
| `getUserId()` | `Promise<string \| null>` — reads the session JWT, no Clerk API call. | Any server-side code that needs the ID and tolerates `null`. |
| `requireUserId()` | `Promise<string>` — throws `Unauthenticated` if no session. | Server Actions / Route Handlers (defense-in-depth backstop *after* the middleware gate). |
| `getAuthenticatedUser()` | Full Clerk user (one Clerk API call). | When you need email / name / image / metadata. |
| `syncClerkUserToDatabase(clerkUserId)` | **Placeholder — throws on call.** | Documents the future Clerk-webhook syncer; visible in autocomplete; loud on accidental use. |

The `requireUserId` helper is intentionally a *backstop*, not the primary gate — the middleware already gates `/account`, `/read`, `/admin`. `requireUserId` exists for code paths that are reached from *publicly* matched routes but still require a user (e.g., a Server Action triggered from a public page).

---

## 5. Identity vs. database synchronization strategy

This is the load-bearing architectural decision in 0.5, documented in `src/lib/auth.ts` and recorded in `memory/PAST_DECISIONS.md`:

- **Clerk owns IDENTITY** — login, email verification, magic links, sessions, social providers. Source of truth for "who is the user".
- **Postgres `users` owns COMMERCIAL RELATIONSHIPS** — orders, entitlements, reading progress, reviews (§10 ERD). Source of truth for "what does this user own / read / review".
- **The bridge is a Clerk webhook** (to be built in a later SUB-PR) that consumes `user.created` / `user.updated` / `user.deleted` and upserts / soft-deletes the local row keyed on `auth_provider = 'clerk'` + the Clerk user ID.

**Why webhook, not JIT-only:**
- Webhook is the only path that can react to `user.deleted` (GDPR right-to-erasure starting point — §11).
- `user.updated` (e.g., email change) needs to flow into the local row for receipts and ready-emails.

**Why a JIT upsert is also OK temporarily:** until the webhook lands, code that needs a local row (order/entitlement creation in 1.5/1.6) must do a just-in-time upsert keyed on Clerk's `userId` + email. That's noted in the architecture comment for the next agent to find.

`syncClerkUserToDatabase` is the named entry point for the future webhook handler. It currently throws — accidental use today is loud, not silent.

---

## 6. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — **zero warnings** (fixed an underscore-prefix `no-unused-vars` warning by making the placeholder's arg meaningful in the error message). |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — compiled in ~2.4 s; `/` still **○ Static**; build green **without Clerk env keys** in scope (provider + middleware degrade gracefully). |

**Two non-blocking warnings observed:**

1. **`The "middleware" file convention is deprecated. Please use "proxy" instead.`** — new in Next.js 16. The framework still supports `middleware.ts`; the build output labels it as `ƒ Proxy (Middleware)`. Per your literal instruction (*"Create a `src/middleware.ts` file"*) I kept the file as `middleware.ts`. Renaming to `proxy.ts` is a one-line operation when you want it; see §8.
2. **`MODULE_TYPELESS_PACKAGE_JSON`** on `tailwind.config.ts` — the same cosmetic Node note from prior SUB-PRs.

---

## 7. Files created / modified

```
src/middleware.ts                    (new — clerkMiddleware + route matcher)
src/lib/auth.ts                      (new — getUserId / requireUserId / getAuthenticatedUser / sync placeholder)
src/app/layout.tsx                   (ClerkProvider wraps <html>; prior layout preserved)
CLAUDE.md                            (file layout: + src/lib/auth.ts and src/middleware.ts)
memory/PAST_DECISIONS.md             (+ "Authentication — Clerk" locked decision, ADR-8 reference)
package.json                         (+ @clerk/nextjs)
package-lock.json                    (updated)
sub-pr-report/SUB_PR_0.5_REPORT.md   (new — this report)
```

---

## 8. Decisions / deviations worth surfacing

1. **`middleware.ts` kept, not renamed to `proxy.ts`.** Next.js 16 deprecated `middleware` in favor of `proxy`; both names still work in 16. You said `src/middleware.ts` literally, so I matched that. **Recommendation:** rename in a tiny follow-up SUB-PR to silence the warning and stay ahead of the eventual removal — happy to do it now if you'd like.
2. **Default-public, explicit-protect** middleware shape (rather than default-private with explicit public). This matches Clerk's documented pattern for app-router and is the safer default for a marketing-heavy SSG site — if a new public marketing route lands and someone forgets to register it as public, it stays public (SEO unaffected) instead of suddenly 401-ing.
3. **Webhooks remain public** (no `auth.protect()` on `/api/webhooks(.*)`). Webhook handlers will authenticate via the provider's **signing secret**, not via Clerk session — adding browser auth on top would break server-to-server callers.
4. **`syncClerkUserToDatabase` throws on call**, not silent no-op. Visible-in-autocomplete documentation + safety-against-misuse.
5. **`@clerk/types` was NOT installed.** Not needed — types come transitively through `@clerk/nextjs` and the helpers compile cleanly without it. (Available if a future SUB-PR needs direct type imports.)
6. **`requireUserId` is a backstop, not the primary gate.** Routes that *must* be authenticated are gated by the middleware; `requireUserId` exists for Server Actions reachable from public routes that still need a user.

---

## 9. Definition-of-done vs. SUB-PR 0.5 scope

- [x] `@clerk/nextjs` installed.
- [x] `src/middleware.ts` configures `clerkMiddleware` with the exact public/protected sets you specified.
- [x] `<ClerkProvider>` wraps the App Router root layout.
- [x] Server-side helpers in `src/lib/auth.ts` (`getUserId` / `requireUserId` / `getAuthenticatedUser`).
- [x] Documented placeholder for the future Clerk → Postgres sync webhook.
- [x] Local verification — lint (zero warnings), tsc, build — all green; SSG of `/` preserved.

**Out of scope (correctly deferred):** real Clerk project creation, env-key provisioning (Clerk publishable + secret keys, webhook signing secret), `/api/webhooks/clerk` route handler, role-based access on `/admin`, the JIT-upsert helper for local `users` rows.

---

## 10. Next unit (NOT started — awaiting approval)

**SUB-PR 0.6 — Admin catalog ingest & publishing.** Internal `/admin` route (now gated by the middleware) to upload master/cover/sample, edit metadata + pricing, and move titles draft → published. This SUB-PR will likely add `generateSignedUploadUrl` to `src/lib/storage`, and a JIT-upsert path for the `users` table. Execution is **halted pending explicit approval.**
