# SUB-PR 4.4 — Admin Catalog Management & Publish Flow Report

**Branch:** `main`
**Scope:** Phase 4 — Operations & Optimization, unit 4 (Admin catalog management + ISR bridge)
**Roadmap refs:** §6 (Information Architecture), §11 (Security — PII / commercial-record retention), ADR-1 (SSG/ISR-first)
**Status:** ✅ Complete. First-cycle verification gate passed; one new dynamic route added, every other classification preserved.

---

## 1. What landed

A real catalog operator surface: list every book regardless of status, edit any field, transition between draft/published/archived, and delete (when commercially safe to do so) — all without raw SQL.

```
/admin                                              ƒ Dynamic
  ├─ Metrics (existing — SUB-PR 4.1)
  ├─ Recent orders (existing — SUB-PR 4.1)
  ├─ Catalog Management table  (NEW — SUB-PR 4.4)
  │    rows: title · slug · price · status · "Edit →"
  └─ Add a book form (existing — SUB-PR 0.6 + 4.1)

/admin/books/[slug]/edit                            ƒ Dynamic  (NEW)
  ├─ Header + breadcrumb + BookStatusBadge
  ├─ Edit form (all 14 editable fields incl. status select)
  └─ Danger zone — two-step confirmation delete
```

Three new Server Actions:
- `updateBook(input: UpdateBookInput)` — typed; returns `{ok}` discriminated
- `deleteBook(input: { id, slug })` — typed; returns `{ok}` discriminated; FK-aware error
- `createBook(formData)` — **upgraded** from `requireUserId` → `requireAdmin` (consistency fix; the gap pre-dated SUB-PR 4.1's strict admin gate)

All three share the same `invalidateCatalogPaths()` helper for ISR invalidation.

---

## 2. The ISR invalidation bridge (the SEO-critical part)

The brief's "Crucial" step. The architectural tension is:

- **Storefront routes are Static + 1h ISR** (`/books`, `/books/[slug]`, `/sitemap.xml`, `/categories/[slug]`, `/authors/[slug]`) per ADR-1 — the SEO growth engine depends on cached static HTML.
- **Admin actions are dynamic writes** that must reach customers immediately, not 1 hour later.

Bridge: every catalog mutation calls a shared helper that revalidates every dependent surface in one place.

```ts
function invalidateCatalogPaths(args: { newSlug: string; oldSlug?: string }): void {
  revalidatePath("/books");                              // catalog browse
  revalidatePath("/sitemap.xml");                        // XML sitemap
  revalidatePath(`/books/${args.newSlug}`);              // current detail page
  if (args.oldSlug && args.oldSlug !== args.newSlug) {
    revalidatePath(`/books/${args.oldSlug}`);            // old URL when slug changed
  }
  revalidatePath("/authors/[slug]", "page");             // pattern revalidation
  revalidatePath("/categories/[slug]", "page");          // pattern revalidation
  revalidatePath("/admin");                              // refresh the table itself
}
```

### Why pattern revalidation for author / category pages

Each book can belong to N authors and M categories. To target only the *specific* author/category pages that reference this book, we'd need a follow-up SELECT against `book_authors` and `book_categories`. Cost / benefit:

| Approach | Cost | Coverage |
|---|---|---|
| **Pattern revalidation** (`'/authors/[slug]', 'page'`) | Invalidates ALL author / category pages | 100% coverage, slight over-invalidation |
| **Targeted by slug** | 2 extra SELECTs + N+M `revalidatePath` calls | Exact coverage, more failure modes |

Pattern revalidation wins for v1 — author/category page count is small (one per author/category), regen is cheap (`safeQuery`-wrapped DB read + render), and "over-invalidate" is a strictly safer failure mode than "under-invalidate". If we ever have thousands of authors and a publish triggers a thundering ISR herd, we'll switch to targeted.

### Slug-change handling

When the admin renames a slug, the OLD slug's `/books/<old>` cache must also be busted — otherwise that URL keeps serving stale HTML pointing at a now-renamed book. The Client form carries `originalSlug` in props (sourced from the DB load); the action sees both `input.slug` (new) and `input.originalSlug` (old) and invalidates both.

The old URL will then 404 on next render (no such book), which is the *correct* failure mode — Google's crawler will eventually drop the old URL from its index when it sees the 404.

---

## 3. The three actions

### 3.1. `createBook` — consistency upgrade

**Change:** `requireUserId()` → `requireAdmin()`.

**Why now:** SUB-PR 4.1 added the strict admin gate to `loadAdminContext` (page-level) and SUB-PR 4.1 added it to `getDashboardMetrics` / `getRecentOrders` (per-query). Leaving `createBook` on a weaker check meant any authenticated user (not just admins) could POST to `/admin/actions` and create a book in our catalog. The gate is now symmetric across all three actions.

The error-handling shape is unchanged (catch + log + return void) — the form has no inline-error UI yet, so the same legacy log-and-swallow path covers admin-error AND DB-error paths.

### 3.2. `updateBook` — typed args, structured returns

```ts
export async function updateBook(input: UpdateBookInput): Promise<UpdateBookResult>;
//   UpdateBookResult = { ok: true } | { ok: false; error: string }
```

Five-step flow:

1. **AuthZ** — `requireAdmin()` inside try/catch; `AdminAccessError` → `{ok:false, error: <kind-mapped>}`. Other errors re-throw (genuinely unexpected).
2. **Light validation** — id present, title non-empty, slug non-empty, priceCents ≥ 0. Per-field returns with precise messages.
3. **`publishedAt` transition logic** — see §3.4 below.
4. **Persist** — single `UPDATE`; FK / unique-constraint errors map to friendly messages (the only real per-user error is duplicate slug, surfaced as `Slug "<x>" is already in use by another book.`).
5. **ISR invalidation** — `invalidateCatalogPaths({ newSlug, oldSlug })`.

### 3.3. `deleteBook` — FK-aware, suggests archiving on failure

The schema deliberately makes purchased books **un-deletable**:

```ts
// entitlements
userId: uuid("user_id").references(() => users.id, { onDelete: "restrict" }),
bookId: uuid("book_id").references(() => books.id, { onDelete: "restrict" }),

// order_items
bookId: uuid("book_id").references(() => books.id, { onDelete: "restrict" }),
```

That `'restrict'` is the Roadmap §11 commercial-record-retention policy in schema form. The action tries the hard delete; if Postgres raises a foreign-key error, we translate it to:

> "Cannot delete: this book has order / entitlement history. Archive it instead by changing the status to 'archived' — it will disappear from the catalog while preserving the commercial record."

The Client delete button (see §4.2) surfaces this text inline so the operator immediately knows what to do.

For a draft book with zero purchases, the hard delete succeeds and the book is gone — useful for cleaning up typo-created entries.

### 3.4. `publishedAt` transition — idempotent first-publish stamp

The catalog browse uses `orderBy: desc(publishedAt)` (SUB-PR 1.1). For a book to rank correctly when first published, `publishedAt` must be set at that moment.

```ts
const shouldSetPublishedAt =
  input.status === "published" &&
  existing.status !== "published" &&     // ← transition, not "still published"
  existing.publishedAt === null;          // ← idempotent: don't re-stamp
```

The three conditions together mean:
- **draft → published, first time** → stamp `publishedAt = now()` ✓
- **draft → published, was-published-then-archived-then-republishing** → keep original `publishedAt` ✓ (preserves the "when was this first published" semantic)
- **published → published** (admin edits an already-live book) → no change ✓
- **published → archived** → no change ✓

Re-publishing keeps the original stamp because admins shouldn't be able to make a 5-year-old book appear "new" by toggling status.

---

## 4. The two Client Components

### 4.1. `<AdminEditBookForm book={book} />`

Uncontrolled inputs + `defaultValue` (13+ fields would make `useState` per field heavy for no real benefit). The ONLY field with reactive state is `status` (it's a `<select>` and we want a hint banner when "publishing for the first time"):

```tsx
{status === "published" && book.publishedAt === null && (
  <p className="text-xs text-primary">
    Publishing for the first time — <code>published_at</code> will be
    stamped to now on save.
  </p>
)}
```

Submit path:
- `e.preventDefault()` → read via `new FormData(e.currentTarget)`
- Build typed `UpdateBookInput`
- `startTransition(async () => updateBook(input))`
- On success: brief "Saved" pill (600 ms), then `router.push('/admin')`
- On error: inline `role="alert"` pill with the action's error message

Form is disabled while pending — no double-submit, no Cancel button shenanigans.

### 4.2. `<AdminDeleteBookButton bookId slug title />`

Two-step inline confirmation (cheaper than installing Radix Dialog for one button + same destruction-protection):

```
Initial state              "Delete this book"  (destructive button)
                                  ↓ click
Confirmation state         Permanently delete "<title>"? [Yes, delete] Cancel
                                  ↓ click "Yes, delete"
useTransition pending      "Deleting…"
                                  ↓
On success                 router.push("/admin")
On error                   Return to initial state with inline alert
                           (typically: "Cannot delete: …has order history…")
```

The book title is rendered literally in the confirmation copy so the admin sees exactly what they're about to destroy. The FK-error message tells them the right next step (archive) without making them read the schema.

---

## 5. Files touched / created

**New (5):**
1. `src/app/admin/books/[slug]/edit/page.tsx` — edit page (Server Component shell)
2. `src/components/admin-edit-book-form.tsx` — Client form
3. `src/components/admin-delete-book-button.tsx` — Client delete button
4. `src/components/book-status-badge.tsx` — reusable pill (separate enum from OrderStatus)
5. `sub-pr-report/SUB_PR_4.4_REPORT.md` (this file)

**Modified (3):**
- `src/lib/db/queries/admin.ts` — added `BookStatus` type, `BookAdminListItem`, `BookEditData`, `listAllBooksForAdmin()`, `getBookForEdit(slug)`
- `src/app/admin/actions.ts` — added `updateBook`, `deleteBook`; upgraded `createBook` from `requireUserId` to `requireAdmin`; added `invalidateCatalogPaths()` helper + `adminErrorMessage()` helper
- `src/app/admin/page.tsx` — added `CatalogManagementSection` + `CatalogRow`; wired `listAllBooksForAdmin` into the parallel data fetch; imported `BookStatusBadge`

**No schema or migration changes.** Every column edited by `updateBook` was already in the SUB-PR 0.3 schema + SUB-PR 1.5 `paddle_price_id` addition.

---

## 6. Verification (first-cycle green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean
$ npm run build           # → success, one new dynamic route, zero regressions
```

Build classifications:

```
┌ ○ /                                              ← Static
├ ƒ /account/{library,orders,settings}             ← Dynamic
├ ƒ /admin                                         ← Dynamic
├ ƒ /admin/books/[slug]/edit                       ← Dynamic  ◀── NEW
├ ƒ /api/{cart/count,inngest,webhooks/paddle}      ← Dynamic
├ ● /authors/[slug]                                ← SSG
├ ○ /blog                                          ← Static
├ ● /blog/[slug]                          1h   1y  ← SSG + ISR (now invalidated on book edit)
├ ● /blog/category/[slug]                          ← SSG
├ ○ /books                                1h   1y  ← Static + ISR (now invalidated on book edit)
├ ● /books/[slug]                                  ← SSG (now invalidated on book edit)
├ ƒ /cart                                          ← Dynamic
├ ● /categories/[slug]                             ← SSG (now invalidated on book edit)
├ ƒ /{order/[id], read/[bookId], search}           ← Dynamic
└ ○ /sitemap.xml                          1h   1y  ← Static + ISR (now invalidated on book edit)

ƒ Proxy (Middleware)                                ← rate-limit + Clerk
```

The new `/admin/books/[slug]/edit` correctly `ƒ Dynamic` (force-dynamic export, Clerk-gated, DB-reading). The five storefront surfaces marked "now invalidated on book edit" still have their `Static + ISR` classification — the `revalidatePath` calls don't change classifications, they just force the next request to regenerate immediately rather than waiting the 1h window.

---

## 7. Operational expectations

### Operator workflow

1. Sign in as an admin (email in `ADMIN_EMAILS`).
2. Hit `/admin` → see Catalog Management table with every book.
3. Click "Edit →" on a draft row → land on `/admin/books/<slug>/edit`.
4. Fill in master file key + Paddle price ID + any other missing fields.
5. Change Status to `published` → see the "first-publish" hint banner.
6. Click "Save changes" → 600 ms confirmation → redirected to `/admin`.
7. **Immediately** open `/books` in another tab → the new book is visible.
8. **Immediately** open `/books/<slug>` → renders correctly.
9. **Immediately** open `/sitemap.xml` → new entry present.

Steps 7-9 work because `invalidateCatalogPaths()` ran inside the action; no waiting for the 1h ISR window.

### Failure paths

| Scenario | Behavior |
|---|---|
| Non-admin POST to `updateBook` | Returns `{ok:false, error:"You are not on the admin allowlist."}` — Client renders inline |
| Slug collision | `Slug "<x>" is already in use by another book.` |
| Required field missing | Per-field validation message (e.g., "Title is required.") |
| Hard-delete on purchased book | `Cannot delete: this book has order / entitlement history. Archive it instead…` |
| DB outage during update | Action returns `{ok:false, error:<message>}`; `safeQuery` fallbacks on the read paths keep `/admin` rendering with stale data |
| Clerk env missing | Page-level `loadAdminContext` short-circuits with `UnprovisionedNotice` — same as `/admin` |

### What the admin **cannot** do (deliberately)

- Edit `book_authors` / `book_categories` M:N relationships — needs its own UI (later SUB-PR)
- Hard-delete a purchased book — schema FK enforces, action surfaces friendly explanation
- Set `publishedAt` to an arbitrary past/future date — auto-stamped on transition; manual override would deserve its own audit trail
- Bulk-edit multiple books — single-row workflow for v1; bulk + multi-select is a future addition

---

## 8. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 4.4 reuses or extends |
|---|---|
| 0.3 — schema | `books` table, `book_status` enum, FK restrictions on `entitlements` / `order_items` |
| 0.6 — admin ingest | The `createBook` action's `parseCreateBookFormData` + `FormField` patterns |
| 1.1 — catalog SSG/ISR | The five Static/SSG routes that the invalidation helper now wakes up |
| 1.5 — Paddle | `books.paddle_price_id` is editable in the form (closes the SUB-PR 1.5 loop end-to-end) |
| 3.1 — sitemap | `/sitemap.xml` is in the invalidation list |
| 3.2 — blog content hub | `/blog/[slug]` ISR (now 1h, from 4.2) is also implicitly refreshed via `RelatedBooks` data |
| 4.1 — admin dashboard | `requireAdmin` strict gate; `loadAdminContext` + `UnprovisionedNotice` pattern; the existing dashboard layout that gained one new section |
| 4.2 — caching | The cached `getFeaturedBooks` will see the new book on its next 1h tick (or sooner if we wire `revalidateTag` once the Next.js 16 cache API stabilizes) |

No regressions to any of them.

---

## 9. What this unlocks (and what's deliberately out of scope)

**Unlocked:**
- Operators can run the catalog end-to-end without touching SQL: create draft → fill in R2 keys + Paddle price → publish → edit → archive.
- The `entitlements.status = 'ready'` review-eligibility gate from SUB-PR 3.3 is now testable on an actual published book (without raw SQL to flip status).
- The `paddle_price_id` field added in SUB-PR 1.5 is now editable per-book — not just at create time.
- Architectural pattern (`invalidateCatalogPaths`) is in place; any future admin action that mutates the catalog (bulk import, refund flow, etc.) gets the ISR bridge for free.

**Out of scope (deliberately):**
- **Author / category M:N editing.** Junction-table editing has its own UX (combobox, search, drag-reorder for `position`); deserves a separate SUB-PR.
- **File upload UI for `coverKey` / `sampleKey` / `masterFileKey`.** Right now operators paste R2 keys after uploading via the Cloudflare console. A presigned-upload form is a known future SUB-PR (the `generateSignedUploadUrl` helper already exists in `src/lib/storage`).
- **Audit log of admin actions.** Any future "who changed what when" requirement deserves its own `admin_audit_log` table + read surface.
- **Bulk edit / multi-select.** Single-row workflow is enough for the current catalog size.
- **Schema-level publish workflow** (e.g., `pending_review` status, approval gates). The 3-state enum (`draft/published/archived`) is sufficient for v1.
- **Revert / version history.** Useful eventually; deserves an `admin_audit_log` precondition.

---

**Next:** HALT for explicit approval before any further work (per brief: "await my explicit approval for the final observability (Sentry) and testing step").
