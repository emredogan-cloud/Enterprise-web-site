# SUB-PR 2.2 — Reading-Progress Sync — Report

> **Phase:** P2 Reading & Accounts · **Unit:** SUB-PR 2.2.
> **Scope (verbatim):** *"Persist/restore `ReadingProgress` per user/book (§10)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green on the first cycle; SSG invariant preserved.
> **Roadmap references consulted:** §10 (Database Strategy — the `reading_progress` table from SUB-PR 0.3).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `syncReadingProgress` Server Action | `src/app/read/[bookId]/actions.ts` — input validation + AuthN + idempotent UPSERT |
| Read-route resume | `src/app/read/[bookId]/page.tsx` — server-side query for existing `reading_progress.page`, passed to `<ReaderShell />` as `initialPage` |
| ReaderShell debounced sync | `src/components/reader-shell.tsx` — accepts `initialPage` + `bookId` props, initializes `pageNumber` state from server, fires `syncReadingProgress` after 2 s of inactivity on page change |
| Verification | lint · tsc · build — all green on the **first cycle**; `/read/[bookId]` still `ƒ Dynamic`; every other classification unchanged |

---

## 2. The UPSERT (Roadmap §10 / spec, verbatim)

```ts
await db
  .insert(readingProgress)
  .values({
    userId: userCtx.localUserId,
    bookId: args.bookId,
    page: args.page,
    percent,
  })
  .onConflictDoUpdate({
    target: [readingProgress.userId, readingProgress.bookId],
    set: {
      page: sql`EXCLUDED.page`,
      percent: sql`EXCLUDED.percent`,
      updatedAt: sql`NOW()`,
    },
  });
```

The Drizzle call emits exactly the SQL the brief specified:

```sql
INSERT INTO reading_progress (user_id, book_id, page, percent)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, book_id) DO UPDATE
SET page = EXCLUDED.page,
    percent = EXCLUDED.percent,
    updated_at = NOW();
```

**Why `EXCLUDED.col` (vs passing the values again):** they're functionally equivalent — Postgres binds parameterized values in both cases — but `EXCLUDED.*` is the canonical pattern, matches the brief word-for-word, and keeps the SQL log compact and readable.

**Why `sql\`NOW()\`` (vs `new Date()`):** lets Postgres choose the timestamp at write time using its own clock. This is the right choice for an `updated_at` semantic because:
- Multiple instances writing concurrently get a consistent monotonic ordering.
- No client/server clock skew (which would otherwise let an event "from the future" be persisted).
- The Drizzle schema has `$onUpdate(() => new Date())` on the column, but `$onUpdate` only fires on `.update()` calls — it does NOT fire on the `DO UPDATE` branch of an UPSERT. The explicit `sql\`NOW()\`` is the only way to keep that column fresh on conflict.

**Concurrency model:** the UNIQUE constraint `reading_progress_user_book_uk` (from SUB-PR 0.3) is the lock. Two concurrent calls — e.g., a rapid page flip in one tab while another tab also has the book open — converge deterministically to *last write wins*, with no application-level coordination needed.

---

## 3. The 2-second debounce — exactly two well-defined effects

The reader has two failure modes the debounce fixes:

| Failure mode | What it would have done without debounce |
|---|---|
| **Rapid page flips** (e.g., arrow-key-held to skip ahead) | One `syncReadingProgress` per page → N round-trips for a flip of N pages, each writing a row that's immediately overwritten by the next |
| **Browser auto-scroll between pages on touch devices** | Same — bursts of pageNumber changes the user never "settled" on |

The debounce is implemented as a single `useEffect`:

```ts
const isFirstSyncRender = useRef(true);
useEffect(() => {
  if (!pdf || numPages === 0) return;
  if (isFirstSyncRender.current) {
    isFirstSyncRender.current = false;        // skip the initialPage → state hop
    return;
  }

  const timeoutId = window.setTimeout(() => {
    const percent = (pageNumber / numPages) * 100;
    void syncReadingProgress({ bookId, page: pageNumber, percent });
  }, 2000);

  return () => window.clearTimeout(timeoutId);   // ← cancels superseded syncs
}, [pageNumber, pdf, numPages, bookId]);
```

Three properties make this correct:

1. **Cleanup cancels in-flight timers.** Each `pageNumber` change → effect re-runs → previous cleanup clears the previous timeout → new 2 s timer starts. Only the *last settled page* syncs.
2. **`isFirstSyncRender` ref skips the initial render**, where `pageNumber === initialPage` — we never sync the same value back as a no-op. The ref-based gate intentionally survives effect re-runs (refs don't trigger re-renders, refs don't reset across re-renders).
3. **`void` discards the promise** — we don't await it. Reading UX is never blocked on a sync; if the network is slow, the user keeps flipping pages.

---

## 4. Resume-where-you-left-off — Server Component query

```ts
const progress = await db.query.readingProgress.findFirst({
  where: (rp, { and, eq }) =>
    and(eq(rp.userId, userCtx.localUserId), eq(rp.bookId, bookId)),
  columns: { page: true },
});
const initialPage = progress?.page && progress.page >= 1 ? progress.page : 1;
```

Two defensive choices:
- **`columns: { page: true }`** — narrow projection; we only need `page` here, not `percent` or `updated_at`.
- **`page >= 1` guard** — even though the schema defaults `page` to 0 and the action validates ≥ 1, an old row from a prior schema or a stale `0` would otherwise render page 0 in pdf.js (which throws). Clamping to 1 makes the page renderable in every shape.

The query joins on the UNIQUE `(user_id, book_id)` index — sub-ms lookup. A missing row (user never opened this book) returns `undefined`; `initialPage` defaults to 1.

**Stale-resume guard inside the client:**
```ts
if (initialPage > doc.numPages) {
  setPageNumber(doc.numPages);
}
```
If a book is republished with fewer pages, an old `reading_progress.page` could point past the end. Clamp to `numPages` before rendering — pdf.js throws on out-of-range page requests.

---

## 5. AuthZ scope — AuthN only, by design

The action uses `loadAuthenticatedLocalUser` for AuthN per the brief, but deliberately **does not** add an entitlement (`(user_id, book_id) → status = 'ready'`) check.

**Reasoning:** `reading_progress` rows are keyed on the caller's own `user_id`. A malicious client calling `syncReadingProgress` with a `bookId` they don't own can only pollute their own progress rows — they can't read other users' progress, can't affect any other user's library, and can't reach the actual file. The download (1.7) and reader (2.1) paths remain the AuthZ chokepoints — they are the only paths that hand out signed URLs to bytes.

Adding the entitlement query would add a sub-ms lookup per page-change-sync. Worth it eventually if abuse becomes a pattern; not worth it today.

(Compare: the watermark queue → R2 → DB chain *always* enforces ownership because it gates access to bytes. The progress chain only gates a metadata write to a row scoped to the caller — different security profile, different cost calculus.)

---

## 6. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings, first cycle |
| Typecheck | `npx tsc --noEmit` | ✅ Pass — first cycle |
| Build | `npm run build` | ✅ Pass — every catalog route still Static/SSG, `/read/[bookId]` still `ƒ Dynamic` |

```
┌ ○ /
├ ƒ /account/library
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

No new routes — the Server Action is invokable from `<ReaderShell />` via Next.js's internal RPC; it does not surface as its own URL.

---

## 7. Files created / modified

```
src/app/read/[bookId]/actions.ts        (new — syncReadingProgress Server Action)
src/app/read/[bookId]/page.tsx          (+ readingProgress query, + initialPage / bookId props to ReaderShell)
src/components/reader-shell.tsx         (+ initialPage / bookId props, + debounced sync effect, + stale-resume clamp)
sub-pr-report/SUB_PR_2.2_REPORT.md      (new — this report)
```

---

## 8. Decisions / deviations worth surfacing

1. **`sql\`EXCLUDED.col\``** + `sql\`NOW()\`` — exactly the SQL the brief specified, and (more importantly) `NOW()` works on the `DO UPDATE` branch where Drizzle's `$onUpdate(() => new Date())` does not.
2. **2 s debounce + cleanup-cancels-timer** — the timer is in the effect, the timer-clear is in the cleanup. Each `pageNumber` change re-runs the effect, which (a) cancels the previous pending sync and (b) schedules a fresh one. Only the *last settled page* syncs.
3. **`isFirstSyncRender` ref skips the initial-render sync** — no no-op write when `pageNumber === initialPage`. Using a ref intentionally (not state) so it survives re-renders without re-triggering them.
4. **Stale-resume clamp inside the loader** — `if (initialPage > doc.numPages) setPageNumber(doc.numPages)`. A republished book with fewer pages can't crash pdf.js.
5. **Fire-and-forget** — `void syncReadingProgress(...)`. Reading UX is never blocked on a sync; the next page flip will re-attempt.
6. **AuthN only, no entitlement check** — `reading_progress` is benign metadata scoped to the caller's own `user_id`. Documented the calculus in §5 above.
7. **First-cycle pass.** Two prior SUB-PRs (1.6 v4 API quirks; 2.1 pdf.js v5 / `public/**` lint) took two cycles each. 2.2 was a tight, well-scoped change, and the lint + tsc + build all ran clean on the first attempt.

---

## 9. Definition-of-done vs. SUB-PR 2.2 scope

- [x] `syncReadingProgress` Server Action — AuthN via `loadAuthenticatedLocalUser`; `INSERT ... ON CONFLICT (user_id, book_id) DO UPDATE` keyed on the existing UNIQUE composite.
- [x] Server Component queries `reading_progress` for the user-book pair and passes `initialPage` to the client.
- [x] `<ReaderShell />` initializes `pageNumber` from `initialPage` so pdf.js renders the right page on first paint.
- [x] 2-second debounce on page changes before firing `syncReadingProgress`. Percent computed as `(pageNumber / numPages) * 100`.
- [x] Local verification — lint, tsc, build — all green on the first cycle; every static route classification unchanged.

**Out of scope (correctly deferred):**
- Entitlement check inside `syncReadingProgress` (acknowledged — benign-data threat model).
- `beforeunload`-style "sync immediately on navigate away" (the 2 s debounce + most-users-spend-> 2 s-on-a-page makes this rarely matter; adds significant complexity).
- "Pages read" / "reading streak" analytics surfaces — would consume the same `reading_progress` table; future polish.
- Scroll-position sync within a page (currently we only sync `page`, not vertical scroll). Pages are typically a single viewport in fit-to-width mode, so this matters less than it might sound; future polish.

---

## 10. Next unit (NOT started — awaiting approval)

**SUB-PR 2.3 — Account, orders/receipts & privacy tooling.** The closing piece of Phase 2: `/account/settings`, `/account/orders` (full receipts list), GDPR data export + delete, and retention/purge of watermark + download PII (Roadmap §6, §11). Reaches **milestone M2 — Read Online** when combined with 2.1 and 2.2. Execution is **halted pending your explicit approval.**
