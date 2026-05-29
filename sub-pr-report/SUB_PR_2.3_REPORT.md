# SUB-PR 2.3 — Account, Orders/Receipts & GDPR Privacy Tooling — Report

> **Phase:** P2 Reading & Accounts · **Unit:** SUB-PR 2.3 — *the closing piece of M2.*
> **Scope (verbatim):** *"Account settings, receipts, and GDPR export/delete + retention/purge of watermark & download PII (§6, §11)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green; **🏁 M2 (Read Online) reached.**
> **Roadmap references consulted:** §6 (IA — `/account/*`), §11 (Security & Compliance — GDPR-CCPA, watermark/download PII retention).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `/account/orders` protected route | Chronological list of past purchases — date, total, status, books, link back to `/order/[id]`. |
| `/account/settings` protected route | Profile block + Privacy block with the two GDPR controls. |
| `exportUserData` Server Action | Five-table aggregate (profile + orders + entitlements + reading progress + reviews) → JSON download. Internal storage keys intentionally excluded. |
| `deleteUserAccount` Server Action | Two-phase: atomic local-data anonymization in a DB transaction, then best-effort Clerk identity deletion. **Commercial records preserved** for §11 / MoR-tax compliance. |
| `purgeExpiredPrivacyData` utility | 30-day download_logs purge + 730-day watermarked-artifact reference clear. Cron-ready; documented for `vercel.json` wiring. |
| Query layer extension | `getUserOrders(userId)` in `src/lib/db/queries/account.ts`. |
| Verification | lint · tsc · build — all green (after one lint cycle for an unescaped apostrophe in JSX); `/account/orders` + `/account/settings` correctly `ƒ Dynamic`; every catalog classification preserved. |

---

## 2. The GDPR delete strategy — *why* it's a two-phase anonymization

`deleteUserAccount` is the highest-stakes function shipped in this SUB-PR. It threads two competing requirements:

| Requirement | Source |
|---|---|
| **Right to erasure** — remove the user's personal data on request | GDPR Art. 17 / Roadmap §11 ("data export & delete") |
| **Tax / commerce-record retention** — orders, receipts, entitlements must persist | §11 ("watermark = PII → … *retention schedule*") + MoR (Paddle) compliance |

These collide head-on for digital goods: the *purchase* is the regulated record that must be kept, but the *purchaser* has the right to be forgotten. The §11-correct resolution is **anonymization, not deletion**, of the bridge row.

### Phase 1 — atomic local-data anonymization (in a `db.transaction`)

```ts
await db.transaction(async (tx) => {
  // Personal-only data → DELETE
  await tx.delete(readingProgress).where(eq(readingProgress.userId, localUserId));
  await tx.delete(reviews).where(eq(reviews.userId, localUserId));

  // Bridge row → ANONYMIZE (commercial relations stay valid because the row stays present)
  await tx
    .update(users)
    .set({
      email: `deleted-${localUserId}@anonymous.local`,
      name: null,
      authProvider: "deleted",
    })
    .where(eq(users.id, localUserId));
});
```

| Table | Action | Why |
|---|---|---|
| `reading_progress` | DELETE | Personal preference data — no commercial retention reason. |
| `reviews` | DELETE | Personal opinion data — same. |
| `users` row | ANONYMIZE — `email` → unique synthetic, `name` → NULL, `auth_provider` → `"deleted"` | Commercial FKs (`orders.user_id`, `entitlements.user_id`, `order_items` via `orders`) all carry `onDelete: "restrict"`. The row must persist or the FK chain breaks. Anonymization keeps the row, kills the PII. |
| `orders` / `order_items` / `entitlements` | **UNTOUCHED** | Regulated commerce records — kept per §11 + MoR tax compliance. They now point at an anonymized row, severing the identity link. |

**Why `deleted-${localUserId}@anonymous.local` for the email:** `users.email` has a `UNIQUE` constraint. The user's UUID is collision-free by construction. The synthetic format is RFC-5321-valid but RFC-2606-style reserved (`.local`), so it can never be a real deliverable address. Repeated calls converge — the function is idempotent.

### Phase 2 — best-effort Clerk identity deletion (OUTSIDE the tx)

```ts
let clerkDeleted = false;
try {
  const client = await clerkClient();
  await client.users.deleteUser(clerkUserId);
  clerkDeleted = true;
} catch (err) {
  console.warn("[delete-account] Clerk identity deletion failed; local data is already anonymized:", err);
}
return { ok: true, clerkDeleted };
```

Three deliberate properties:

1. **Outside the DB transaction.** Clerk is a separate fault domain. Holding a DB transaction open while we make an HTTP call to Clerk would either timeout or leak connections under load.
2. **Best-effort.** If Clerk is down or env unset, **the GDPR-required work (local-data anonymization) is already done** — we return `{ ok: true, clerkDeleted: false }`. The UI surfaces a "finish removal in Clerk" hint via a brief alert before redirecting.
3. **Local first, Clerk second.** If we did Clerk first and the local tx failed, the user would be locked out of their own account with their residual data still present — they could not log in to fix it. The chosen order means the worst outcome is "data is gone, identity might linger" — recoverable from the user side.

---

## 3. Data export — five-table aggregate, no internal keys

```ts
const payload = {
  exportedAt: new Date().toISOString(),
  generator: "digital-bookstore",
  profile: { … },
  orders: [{ items: [{ book: { slug, title }, … }], … }],
  entitlements: [{ book: { slug, title }, status, createdAt }, …],
  readingProgress: [{ book: { slug, title }, page, percent, updatedAt }, …],
  reviews: [{ book: { slug, title }, rating, body, status, createdAt }, …],
};
return { ok: true, filename: `…-${localUserId}-${Date.now()}.json`, json: JSON.stringify(payload, null, 2) };
```

**Excluded from the projection (intentionally):**
- `entitlements.watermarkedKey` — internal R2 path, of no use to the user.
- `books.masterFileKey` — admin-only artifact path.
- `books.searchTsv` — FTS column, not human data.
- `download_logs` — security telemetry; surface in a future SUB-PR if a user explicitly asks.

The `<ExportDataButton />` Client Component receives the JSON string, wraps it in a `Blob`, generates a transient object URL, and clicks a hidden `<a download>` — **no server-side file is ever materialized**, no temporary R2 upload, nothing cached. `URL.revokeObjectURL` fires right after the click to release the blob memory.

---

## 4. Privacy retention purge — what runs, what stays

`src/lib/privacy-retention.ts` defines the daily-or-similar cron job. Two cleanups:

```ts
export const DOWNLOAD_LOG_RETENTION_DAYS = 30;
export const WATERMARK_RETENTION_DAYS    = 730; // ≈ 2 years
```

| Sweep | Cutoff | DB effect | Rationale |
|---|---|---|---|
| Delete `download_logs` rows older than 30 days | `created_at < NOW() − 30 d` | Hard DELETE | These are PII (IP + UA) and have a narrow utility window — velocity / abuse detection within the last few weeks. After 30 days they are dead weight + a GDPR surface area. |
| Clear `entitlements.watermarked_key` for entitlements older than 730 days | `created_at < (NOW() − 2 y)` AND `watermarked_key IS NOT NULL` | UPDATE SET `watermarked_key = NULL` | The artifact has buyer-name + order-ID baked into the PDF — that is **PII inside the file**. After ~2 years it is well past commercial-utility for the buyer (re-stamp on demand if they return). The entitlement row itself stays — perpetual ownership is preserved. |

**Two-row R2 cleanup is NOT yet wired.** The DB nulls the reference; the bytes in R2 are orphaned (unreachable through our app). A future SUB-PR can add an R2 `DeleteObjectCommand` sweep against the now-NULL set captured in the same transaction. The TSDoc on `purgeExpiredPrivacyData` calls this out explicitly.

**Cron wiring sketch (documented inside the file):**

```jsonc
// vercel.json
{
  "crons": [
    { "path": "/api/cron/purge-expired-pii", "schedule": "0 3 * * *" }
  ]
}
```

```ts
// src/app/api/cron/purge-expired-pii/route.ts (FUTURE SUB-PR)
export async function GET(request: Request) {
  // Verify Vercel Cron signature here before invoking.
  return Response.json(await purgeExpiredPrivacyData());
}
```

Idempotency: the queries are set-based and time-windowed. Running hourly vs. daily vs. weekly yields the same eventual state — only the lag between expiry and purge differs.

---

## 5. The two-stage delete UX (small but important)

A `Delete my account…` button alone is too easy to mis-click. `<DeleteAccountButton />` ships the standard destructive-action pattern:

```
Stage idle  → single button (no side effects)
                ↓ click
Stage confirm → in-place panel with:
                  • a tabular list of what will be deleted vs retained
                  • a typed-`DELETE` confirmation input
                  • Confirm (destructive variant, disabled until "DELETE")
                  • Cancel (restores stage `idle`, no side effects)
                ↓ Confirm
              Server Action → router.push("/")
                  with a brief alert if Clerk deletion partially failed
```

The destructive-variant button and dashed `destructive`-token border are deliberate: this surface should *not* feel like an everyday CTA.

---

## 6. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass (after one cycle: removed unused schema imports + a `void`-expression workaround + escaped a JSX apostrophe in the delete-confirmation copy) |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — `/account/orders` + `/account/settings` correctly `ƒ Dynamic`; every catalog route still Static/SSG |

Final route table (two new entries):

```
┌ ○ /
├ ƒ /account/library
├ ƒ /account/orders                ← NEW (Dynamic)
├ ƒ /account/settings              ← NEW (Dynamic)
├ ƒ /admin
├ ƒ /api/cart/count
├ ƒ /api/inngest
├ ƒ /api/webhooks/paddle
├ ● /authors/[slug]
├ ○ /books                        1h      1y
├ ● /books/[slug]
├ ƒ /cart
├ ● /categories/[slug]
├ ƒ /order/[id]
├ ƒ /read/[bookId]
└ ƒ /search
```

**16 routes; ADR-1 invariant unbroken end-to-end.** Every public catalog surface is Static/SSG; every auth-gated / per-user surface is Dynamic. Nothing in between.

---

## 7. Files created / modified

```
src/app/account/orders/page.tsx                   (new — chronological receipts list)
src/app/account/settings/page.tsx                 (new — profile + privacy controls)
src/app/account/settings/actions.ts               (new — exportUserData + deleteUserAccount)
src/components/export-data-button.tsx             (new — Client Component, blob-download)
src/components/delete-account-button.tsx          (new — two-stage destructive UX)
src/lib/privacy-retention.ts                      (new — purgeExpiredPrivacyData)
src/lib/db/queries/account.ts                     (+ getUserOrders + UserOrderSummary types)
sub-pr-report/SUB_PR_2.3_REPORT.md                (new — this report)
```

---

## 8. Decisions / deviations worth surfacing

1. **Anonymize, do not delete, the `users` row.** Commercial FKs are `onDelete: "restrict"` — deletion would break the chain. Anonymization preserves the regulated records while killing the PII; the `email` becomes `deleted-${UUID}@anonymous.local` (collision-free, RFC-2606-reserved, idempotent across re-runs).
2. **Two-phase delete: local first, Clerk second.** Worst outcome is "data anonymized; identity possibly still in Clerk" — recoverable from the user side. The opposite order ("Clerk first") could lock the user out of fixing residual data.
3. **`download_logs` deleted on a 30-day window; `watermarked_key` cleared on a 730-day window.** Different PII profiles → different retention rules. `download_logs` is high-volume security telemetry with narrow utility; the watermarked PDF carries the buyer's *name* into the file itself and deserves a much longer commercial-utility window.
4. **R2 object cleanup is documented but NOT wired.** The DB clears `watermarked_key`; the bytes in R2 become orphaned. A future SUB-PR can add a `DeleteObjectCommand` sweep against the now-NULL set. Acknowledged in the TSDoc — operators reading the code see the gap immediately.
5. **Export omits internal storage keys.** `watermarkedKey` / `masterFileKey` / `searchTsv` / `download_logs` are not in the JSON. The export is for the human; engineering paths and security telemetry have no business in a user-downloaded file.
6. **Best-effort Clerk deletion outside the DB transaction.** Different fault domain; holding a tx open across an HTTP call to Clerk would burn pool connections under load.
7. **Two-stage delete UX with typed-`DELETE` confirmation.** Standard destructive-action pattern; the dashed destructive-token border + destructive-variant buttons make this surface visually un-CTA-like.

---

## 9. Definition-of-done vs. SUB-PR 2.3 scope

- [x] `/account/orders` — chronological list of past purchases with dates, totals, statuses, items.
- [x] `/account/settings` — profile read-out + Privacy block with Export + Delete buttons.
- [x] `exportUserData` Server Action — five-table aggregate, JSON, client-side blob download.
- [x] `deleteUserAccount` Server Action — atomic local anonymization + best-effort Clerk delete; commercial records retained per §11 + MoR compliance.
- [x] `purgeExpiredPrivacyData` utility — 30-day `download_logs` delete + 730-day `watermarked_key` clear; cron wiring sketched in TSDoc.
- [x] Local verification — lint, tsc, build — all green; new routes `ƒ Dynamic`; catalog routes unchanged.

**Out of scope (correctly deferred):**
- The actual Vercel Cron route handler — the utility is cron-ready; the route handler is one file in a follow-up SUB-PR.
- R2 `DeleteObjectCommand` sweep on cleared `watermarked_key`s — documented in TSDoc; awaits a small storage helper.
- "Re-stamp on demand" flow if a user requests a book whose `watermarked_key` has been purged — the watermark worker already exists; the re-trigger surface is a future SUB-PR.
- Subject-access-request audit log — recording WHEN a user exported / deleted their data, for our own compliance bookkeeping.
- Email confirmations on delete ("your account has been deleted") — needs the transactional email wiring (still placeholder from SUB-PR 1.6).

---

# 🏁 MILESTONE M2 — Read Online · COMPLETE 🎉

> *"M2 — Read Online (P2 complete)"* — Roadmap §18.

Three SUB-PRs delivered Milestone 2:

| SUB-PR | What it added | Commit |
|--:|---|---|
| **2.1** | Online reader (PDF.js) — `/read/[bookId]`, ReaderShell, postinstall worker copy, CSP-strict same-origin worker | `6f3c03b` |
| **2.2** | Reading-progress sync — `syncReadingProgress` UPSERT (EXCLUDED + NOW()), 2 s client-side debounce, resume-where-you-left-off | `fb2a049` |
| **2.3** | Account, orders, settings, GDPR export + delete, privacy retention purge | *this commit* |

**The end-to-end flow that now works (M1 + M2):**

```
SEO discovery → catalog browse → search → book detail page (sample)
   → Add to cart → MoR-hosted Paddle checkout
   → Signature-verified webhook → idempotent Order + Entitlements(pending)
   → Inngest enqueue → watermark worker (pdf-lib stamp + R2 put)
   → entitlement.ready
   → /order/[id] auto-polls "Preparing…" → "Download" / "Read online"
   → DOWNLOAD: AuthN + AuthZ + state + audit-log + short-TTL signed URL
   → READ ONLINE: AuthN + AuthZ + state + signed URL + PDF.js + range requests
      → page change → 2 s debounce → reading_progress UPSERT
      → next visit: ReaderShell opens at the saved page
   → ACCOUNT:
      → /account/library — your books, status-aware, re-download anytime
      → /account/orders — chronological receipts
      → /account/settings — profile + Export my data + Delete my account
   → GDPR retention purge (cron-ready) — 30-day download_logs, 730-day watermark PII
```

**16 routes; ADR-1 invariant unbroken**: every catalog page Static/SSG, every personal page Dynamic, nothing in between.

**The constitution holds**: every architectural decision recorded in `PAST_DECISIONS.md` from Phase 0 is still in force; no SUB-PR has reopened or contradicted an earlier ADR.

---

## 10. Awaiting your instructions for Phase 3

Phase 3 in the roadmap is **Discovery & Growth** — SUB-PRs 3.1 through 3.4:

| Unit | Scope | Depends on |
|---|---|---|
| **3.1** | SEO hardening + structured data — JSON-LD (Book / Product / Offer / AggregateRating / BreadcrumbList / Organization), dynamic sitemaps, canonicals, OG cards, Core Web Vitals | 1.1 |
| **3.2** | Blog / content hub — `/blog` SSG + category hubs with internal linking | 3.1 |
| **3.3** | Reviews + ratings — `Review` submission/display feeding AggregateRating into 3.1 | 1.7, 2.3 |
| **3.4** | Search upgrade + semantic search / recommendations (AI) — Meilisearch/Typesense and/or embeddings | 1.2 |

Completion of P3 reaches **M3 — Discoverable** (the SEO-growth milestone).

I'm halted and ready when you are. Take a moment to celebrate M2 — the *Read Online* milestone is a real piece of work. 🎉
