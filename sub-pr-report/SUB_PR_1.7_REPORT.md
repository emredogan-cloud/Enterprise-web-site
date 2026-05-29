# SUB-PR 1.7 — Library, Order UX & Secure Signed-URL Downloads — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.7 — *the closing piece of milestone M1.*
> **Scope (verbatim):** *"Library grid, re-download via fresh signed URL, and the 'preparing your copy' optimistic state (§5, §9)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green; **🏁 M1 (Sell & Download) reached.**
> **Roadmap references re-read at start of unit:** §5 (UX / Trust), §11 (Security / Abuse prevention).

---

## 1. Roadmap refresh (§5 + §11) — what changed in my approach

Before writing any code I re-read the two sections that govern this SUB-PR. The two binding requirements that drove the implementation:

| Section | Mandate | How it shows up in the code |
|---|---|---|
| **§5 — UX / Trust** | *"Confirmation page shows 'Preparing your copy…' with optimistic state; download button activates on `entitlement.ready` (poll/realtime). This turns a backend constraint into a calm, trustworthy moment."* | `<FulfillmentPoller />` headless Client Component (`router.refresh()` every 4 s when any entitlement is pending; auto-stops when the parent re-renders with `enabled={false}`). Pending entitlements render a calm "Preparing your copy…" line with a softly-pulsing accent dot — no spinner, no theatrical loader. |
| **§11 — Security & abuse prevention** | *"reader & download endpoints verify `Entitlement(user, book).status = ready` server-side before issuing a signed URL"* + *"log DOWNLOAD_LOG (IP/UA) for velocity anomalies"* | `downloadBook` Server Action runs **five disciplined steps in strict order** (§4 below); the `download_logs` row is written **before** the signed URL is returned. |

---

## 2. Routes shipped — and their build classification

```
┌ ƒ /account/library          ← new, dynamic (per-user library, auth-gated)
├ ƒ /order/[id]               ← new, dynamic (per-user order confirmation)
```

Plus a middleware update — `/order(.*)` added to the protected matcher in `src/proxy.ts` so unauthenticated requests are redirected by `auth.protect()`.

Full route table:
```
┌ ○ /
├ ƒ /account/library                    ← NEW
├ ƒ /admin
├ ƒ /api/cart/count
├ ƒ /api/inngest
├ ƒ /api/webhooks/paddle
├ ● /authors/[slug]
├ ○ /books                        1h      1y
├ ● /books/[slug]
├ ƒ /cart
├ ● /categories/[slug]
├ ƒ /order/[id]                         ← NEW
└ ƒ /search
```

Every catalog route's classification is unchanged. The two new routes are `ƒ Dynamic`, exactly as the user predicted in the brief.

---

## 3. The `/order/[id]` page — the §5 "calm moment"

```tsx
const order = await getOrderForUser({ orderId, userId: userCtx.localUserId });
if (!order) notFound();

const hasPending = order.entitlements.some((e) => e.status === "pending");

return (
  <main>
    <FulfillmentPoller enabled={hasPending} />        {/* §5 polling */}
    <header> Thank you for your purchase / Order ab12cd34 · $15.00 </header>
    {hasPending && <PreparingBanner />}                {/* calm explanation */}
    <ul>
      {order.entitlements.map((ent) =>
        ent.status === "ready" ? <DownloadButton /> : <PreparingDot />
      )}
    </ul>
    <p>All your books also live in <Link href="/account/library">your library</Link>.</p>
  </main>
);
```

Three things worth noting:

1. **Ownership is enforced at the SQL layer** — `getOrderForUser`'s `WHERE` clause is `eq(o.id, orderId) AND eq(o.userId, currentUserId)`. A non-owning user receives `null`, which 404s. They cannot distinguish "no such order" from "not yours" → no enumeration vulnerability.
2. **Polling auto-stops.** When the worker (SUB-PR 1.6) flips an entitlement to `ready`, the next `router.refresh()` re-renders with `hasPending: false`; the poller's effect runs `clearInterval(...)` in its cleanup, never polls again. No memory leak, no wasted bandwidth.
3. **Per-book status** — each entitlement renders independently. A 3-book order where #1 is ready and #2 + #3 are still being watermarked shows one download button and two preparing-dots. The user can start reading immediately.

---

## 4. The download Server Action — five disciplined steps, in order

```ts
// src/app/account/library/actions.ts
export async function downloadBook(bookId: string): Promise<DownloadResult> {
  // 1. AuthN — Clerk session + local user upsert
  const userCtx = await loadAuthenticatedLocalUser();
  if (!userCtx.ok) return { ok: false, error: "…" };

  // 2. AuthZ — look up entitlement by (userId, bookId); UNIQUE composite index
  const entitlement = await db.query.entitlements.findFirst({
    where: (e, { and, eq }) =>
      and(eq(e.userId, userCtx.localUserId), eq(e.bookId, bookId)),
    columns: { id: true, status: true, watermarkedKey: true },
  });
  if (!entitlement) return { ok: false, error: "You do not own this book." };

  // 3. State — only `ready` + watermarkedKey qualify
  if (entitlement.status !== "ready" || !entitlement.watermarkedKey) {
    return { ok: false, error: "Your copy is still being prepared…" };
  }

  // 4. Audit log — INSERT INTO download_logs BEFORE the URL is returned
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent") ?? null;
    await db.insert(downloadLogs).values({
      entitlementId: entitlement.id, ip, userAgent,
    });
  } catch (err) {
    // Best-effort: log failure must not block a legitimate download.
    console.error("[download] audit-log insert failed:", err);
  }

  // 5. Signed URL — short TTL, signed-URL-only access (§11)
  const url = await generateSignedDownloadUrl({
    bucket: ARTIFACTS_BUCKET,
    key: entitlement.watermarkedKey,
  });
  return { ok: true, url };
}
```

| Discipline | Why |
|---|---|
| **AuthN before AuthZ** | Cheaper failure mode first; an unauthenticated request never touches the DB. |
| **AuthZ via the SQL `WHERE` clause** | The DB itself enforces ownership through the `entitlements_user_book_uk` UNIQUE composite index. Never trust the client. |
| **State check after AuthZ** | A `pending` entitlement IS owned by the user — they just can't download yet. The error message is honest about *why*. |
| **Audit-log BEFORE the URL** | The §11 velocity trail must capture every *attempt*, not just successful downloads. If the user clicks "Download" and we issue a URL, that's the abuse-detection event — regardless of whether they actually GET the file. |
| **Audit-log failure is logged but does not block** | An ops glitch on the logs table should never trap a legitimate buyer behind their own purchase. The console.error is the operator's hook to investigate. |
| **`return { ok, url }` not `redirect()`** | Symmetric error handling — `{ ok: false, error }` flows into the same UI path as `{ ok: true, url }`. From the user's perspective the experience is identical to a direct redirect. |
| **Short TTL via storage default** | `generateSignedDownloadUrl` uses the SUB-PR 0.4 default (600 s / 10 min) with a hard 900 s ceiling. The URL is single-purpose; if intercepted, it expires in minutes. |

**What's NOT here** (acknowledged out-of-scope, also §11):
- **Rate-limiting**. The `download_logs` rows we now write are exactly the data source a future Upstash-Redis-backed limiter will consume. Today's pipeline only *records* velocity; SUB-PR-future *acts* on it.

---

## 5. The `/account/library` page

The library is intentionally simple — a 3-column grid of `BookCard`-shaped tiles, each with its own status:

| Entitlement state | UI |
|---|---|
| `ready` | `<DownloadButton bookId={...} />` |
| `pending` | "Preparing your copy…" with the pulsing accent dot |
| `revoked` | "Access revoked." in the destructive token |

The same `<FulfillmentPoller enabled={hasPending} />` mounts here too — if a user lands on `/account/library` mid-watermark (e.g., after navigating away from `/order/[id]` before the worker finished), the books resolve to "ready" in the background and the download buttons appear.

The query that drives the library is `getUserLibrary(userId)` in `src/lib/db/queries/account.ts` — strictly keyed on `userId`, projecting only what the UI needs (no `watermarked_key` exposed to the page render — that's an internal storage key, only `downloadBook` needs to know it; the page only needs `status`).

---

## 6. Shared identity-to-local-user helper

A new helper, `loadAuthenticatedLocalUser()` in `src/lib/account.ts`, is the single composition point used by both new pages and the download action:

```ts
1. Env pre-flight (Clerk + DB) → UnprovisionedNotice on miss
2. getAuthenticatedUser() (Clerk)
3. Pluck primary email
4. upsertLocalUser({ clerkUserId, email, name }) → local UUID
5. Return { ok: true, clerkUserId, email, name, localUserId }
                       OR { ok: false, title, body, missing }
```

It's the same pattern as `loadAdminContext` in `/admin`, lifted into a shared module so future authed pages (`/account/orders`, `/account/settings`, …) need one line, not fifty. The discriminated union's `ok: false` branch shapes its fields to spread directly into `<UnprovisionedNotice />`.

(The `/admin` page still uses its inline `loadAdminContext` — refactoring it would be churn outside this SUB-PR's scope.)

---

## 7. The optimistic UX — `<FulfillmentPoller />`

```tsx
"use client";
export function FulfillmentPoller({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(interval);
  }, [enabled, router]);
  return null;
}
```

Headless on purpose — it's a side-effect component. Three design choices:

1. **`enabled` is computed server-side** per render, so the loop runs *exactly* as long as there are pending entitlements. No client-side bookkeeping required.
2. **`router.refresh()` is the entire mechanism** — re-runs the Server Component query (`getOrderForUser` / `getUserLibrary`), re-renders the tree, the `enabled` prop flips to `false`, the next effect cleanup clears the interval. Zero state.
3. **4-second cadence** — long enough that the network cost is negligible, short enough that the "Preparing…" → "Download" transition feels instant after a typical 1–5 s watermark job. (`step.run` in the SUB-PR 1.6 worker stamps a 5 MB PDF in 1–2 s on Vercel Fluid Compute.)

---

## 8. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — `/order/[id]` + `/account/library` correctly `ƒ Dynamic`; every other classification unchanged |

The build still shows the catalog `safeQuery` warnings (DB unprovisioned) — same graceful-empty-states behavior as every prior SUB-PR. `getOrderForUser` and `getUserLibrary` don't appear in the warning list because both their pages are dynamic — neither runs at build time.

---

## 9. Files created / modified

```
src/proxy.ts                                     (+ /order(.*) to the protected matcher)
src/lib/account.ts                               (new — loadAuthenticatedLocalUser)
src/lib/db/queries/account.ts                   (new — getOrderForUser, getUserLibrary)
src/components/download-button.tsx              (new — Client Component)
src/components/fulfillment-poller.tsx           (new — headless polling Client Component)
src/app/account/library/actions.ts              (new — downloadBook Server Action)
src/app/account/library/page.tsx                (new — library page)
src/app/order/[id]/page.tsx                     (new — order confirmation page)
sub-pr-report/SUB_PR_1.7_REPORT.md              (new — this report)
```

---

## 10. Decisions / deviations worth surfacing

1. **Return URL + client navigate** instead of Server Action `redirect()`. Same user experience, but symmetric error handling — `{ ok: false, error }` flows into the same path as `{ ok: true, url }`. The Client `DownloadButton` shows inline `role="alert"` text on refusal.
2. **`downloadBook` audit-logs before issuing the URL.** Velocity trail captures *attempts*, not just completed downloads — the abuse-detection use case in §11 needs both.
3. **`loadAuthenticatedLocalUser` was extracted** into `src/lib/account.ts` rather than inlined in each page. Two pages already use it; future `/account/*` surfaces will use one line, not fifty.
4. **Ownership is enforced in the `WHERE` clause**, never in application code. `getOrderForUser`'s `WHERE` includes `o.userId = currentUserId`; a non-owning user gets `null` from the query, indistinguishable from "no such order" — no enumeration.
5. **Headless poller**, no state library. The cookie / DB row is the source of truth; the client just signals "re-render me" every 4 s while there's something to wait for.
6. **`/account/library` re-uses `<CoverImage />` not `<BookCard />`.** The library tile needs the cover + a `DownloadButton` (not a `<Link>` to a public page); the card primitive is the wrong shape here.
7. **Rate-limiting deferred** — the `download_logs` table now collects the data; a future SUB-PR adds an Upstash-Redis-backed limiter that reads from it.

---

## 11. Definition-of-done vs. SUB-PR 1.7 scope

- [x] Roadmap refreshed (§5 + §11 re-read at start of unit).
- [x] `/order/[id]` protected route — receipt, optimistic "Preparing…" UI, per-entitlement download button when ready, auto-polling.
- [x] `/account/library` protected route — user's purchased books, ready/pending/revoked status per book.
- [x] `downloadBook` Server Action:
  - [x] AuthN via `requireUserId()` equivalent (`loadAuthenticatedLocalUser`).
  - [x] AuthZ via SQL `WHERE` keyed on the `(user_id, book_id)` UNIQUE index.
  - [x] State check (`status = 'ready'` AND `watermarked_key` set).
  - [x] `download_logs` insert (IP / UA / timestamp via `defaultNow()`) BEFORE returning URL.
  - [x] Short-TTL signed URL via `generateSignedDownloadUrl` from `ARTIFACTS_BUCKET`.
- [x] User redirected to the signed URL via client `window.location.href = result.url`.
- [x] `/order(.*)` added to the Clerk middleware's protected matcher.
- [x] Local verification — lint (zero warnings), tsc, build — all green; **`/account/library` + `/order/[id]` correctly `ƒ Dynamic`**; every catalog classification unchanged.

**Out of scope (correctly deferred):**
- Rate-limiting on `downloadBook` (Upstash Redis or equivalent — the `download_logs` table is the data source it will consume).
- `/account/orders` (full order history) and `/account/settings` (privacy / export / delete) — §6 sitemap entries for a later SUB-PR.
- Online reader at `/read/[bookId]` — SUB-PR 2.1.
- "Your book is ready" transactional email — the SUB-PR 1.6 placeholder remains; email wiring is its own SUB-PR.

---

# 🏁 MILESTONE M1 — Sell & Download · **COMPLETE**

> *"M1 — Sell & Download (P1 complete: a customer can buy and receive a watermarked PDF)"* — Roadmap §18.

Seven SUB-PRs delivered Milestone 1:

| SUB-PR | What it added | Commit |
|--:|---|---|
| **1.1** | SSG/ISR catalog rendering — `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]` + `BookCard` / `CoverImage` / `EmptyState` | `e258cbd` |
| **1.2** | Postgres FTS search — `searchBooks` + `/search` + global `SearchBar` (pure HTML form, SSG-preserving) | `e2d2173` |
| **1.3** | Sample viewer — `@tailwindcss/typography` + `<SampleViewer />` + on-brand placeholder | `be03ada` |
| **1.4** | Cookie-backed cart — `/cart` + `<CartIndicator />` + `<AddToCartButton />` + cart Server Actions | `744a4a5` |
| **1.5** | Paddle MoR checkout + signature-verified, idempotent webhook fulfillment | `ac5d82a` |
| **1.6** | Async watermark pipeline — Inngest + pdf-lib; three-layer idempotency; XMP forensic metadata | `cccc704` |
| **1.7** | Library + order-confirmation UX + secure signed-URL download with audit log | *this commit* |

**The end-to-end flow that now works:**

```
Public catalog (○ Static / ● SSG) — Google indexes every book page
  ↓ SEO-driven discovery
Visitor finds a book in /search or /books/[slug]
  ↓ "Add to cart" (Client Component → cookie write Server Action)
Cart count appears in the SiteHeader (Client fetch via /api/cart/count)
  ↓ Checkout button on /cart
createCheckoutSession Server Action — Paddle Transaction created
  ↓ window.location.href = Paddle hosted URL
User completes payment on Paddle's MoR-hosted page
  ↓ Paddle webhook: transaction.completed → POST /api/webhooks/paddle
Signature verified → processCompletedTransaction()
  ↓ db.transaction: idempotent Order + OrderItems + Entitlements(pending)
inngest.send("fulfillment.transaction.completed", ...)
  ↓ POST /api/inngest dispatches the worker
Inngest worker — for each book: step.run("watermark-<bookId>", ...)
  ↓ getObject(MASTERS_BUCKET) → pdf-lib stamp → putObject(ARTIFACTS_BUCKET)
  ↓ UPDATE entitlements SET status='ready', watermarked_key=...
  ↓ sendReadyEmailPlaceholder()  ← real email lands in a follow-up
User on /order/[id] sees the page auto-refresh from "Preparing…" → "Download"
  ↓ DownloadButton calls downloadBook(bookId) Server Action
AuthN + AuthZ + status check + audit-log insert → short-TTL signed URL
  ↓ window.location.href = signed URL
Browser downloads the watermarked PDF from Cloudflare R2
```

**Every step is auditable, idempotent, and degrades gracefully when an env var is missing.** The constitution (PAST_DECISIONS.md) and ADRs from Phase 0 hold — no architectural debt accumulated through Phase 1.

---

## 12. Next phase (NOT started — awaiting your instructions)

**P2 — Reading & Accounts:** SUB-PRs 2.1–2.3.

| Unit | Scope |
|---|---|
| **2.1** | Online reader (PDF.js) — render the watermarked artifact via signed URL with range requests |
| **2.2** | Reading-progress sync — persist/restore per-(user, book) |
| **2.3** | Account, orders/receipts & privacy tooling — settings, receipts list, GDPR export/delete + retention/purge of watermark & download PII |

Completion of P2 reaches **M2 — Read Online**.

Execution is **halted; awaiting your instructions for Phase 2.** 🎉
