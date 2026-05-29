# SUB-PR 3.3 — Reviews & Ratings Report

**Branch:** `main`
**Scope:** Phase 3 — Discovery & Growth, unit 3 (Reviews & ratings)
**Roadmap refs:** §6 (Information Architecture), §10 (Database Strategy), §13 (SEO & Discoverability)
**Status:** ✅ Complete. First-cycle verification gate passed; `/books/[slug]` still `● SSG`.

---

## 1. What landed

A verified-purchaser review system bolted onto the existing book detail page, with `AggregateRating` JSON-LD injected for SEO rich-results eligibility.

```
WRITE  submitReview(input)                  Server Action  /books/[slug]/actions.ts
READ   getReviewsForBook(bookId)            SQL JOIN       /books/[slug]  (SSG)
READ   getBookRatingAggregate(bookId)       SQL AVG+COUNT  /books/[slug]  (SSG)
SEO    buildBookJsonLd({ aggregateRating }) JSON-LD        /books/[slug]  (SSG)
UI     <ReviewForm />                       Client Comp.   embedded in SSG page
UI     <ReviewsList />                      Server Comp.   embedded in SSG HTML
UI     <StarRating />                       Server Comp.   reusable
```

The `reviews` table itself **already existed** in `src/lib/db/schema.ts` (committed in SUB-PR 0.3 per Roadmap §10) and is materialized by migration `0000_plain_chat.sql`. No schema or migration changes were needed.

---

## 2. AuthZ flow — the verified-purchaser model

The brief is explicit: only users with `entitlements.status = 'ready'` for a book may review it. Anonymous, signed-in-but-never-bought, and pending-watermark users are all rejected.

```
┌──────────────────────────────────────────────────────────────────────┐
│              submitReview Server Action — AuthZ chain                │
│                                                                      │
│   1. Input shape validation              (cheap, no I/O)             │
│      ├─ rating ∈ [1..5] integer                                      │
│      ├─ body ≤ 4000 chars (after trim)                               │
│      ├─ bookId, slug both non-empty strings                          │
│      └─ short-circuit return on any failure                          │
│                                                                      │
│   2. AuthN — getUserId()                 ← Clerk session JWT only    │
│      └─ no Clerk API call yet            ← cheap                     │
│                                                                      │
│   3. Resolve local user UUID                                         │
│      ├─ currentUser()                    ← one Clerk API call        │
│      ├─ extract primaryEmailAddress                                  │
│      └─ upsertLocalUser({ clerkUserId, email, name })                │
│                                                                      │
│   4. AuthZ — entitlement gate                                        │
│      ├─ WHERE user_id = $1 AND book_id = $2 AND status = 'ready'    │
│      └─ return { ok: false, error } when missing                     │
│                                                                      │
│   5. Persist                                                         │
│      └─ INSERT … ON CONFLICT (user_id, book_id) DO UPDATE            │
│         SET rating, body, status                                     │
│         (createdAt deliberately omitted — preserve original date)    │
│                                                                      │
│   6. ISR invalidation                                                │
│      └─ revalidatePath(`/books/${slug}`)                             │
└──────────────────────────────────────────────────────────────────────┘
```

The entitlement gate is the *trust signal* in our model — purchase is the proof-of-readership. That is what justifies the second non-obvious decision:

### Why `status: 'approved'` on insert (overriding the `'pending'` schema default)

The schema's enum allows `pending | approved | rejected` — a 3-state moderation surface. Pre-moderation is the right default for *public-write* review systems (Yelp, Google Reviews) where anyone can submit. We're already gating on `entitlements.status = 'ready'`, so the trust threshold is higher than pre-moderation would add:

- Pre-moderation queue would introduce a "wait for admin" UX with no real abuse vector to prevent.
- The `pending` / `rejected` states remain available — they're reserved for a future "report this review" flagging workflow (SUB-PR 3.4 candidate).

Auto-approve gives immediate UX feedback (review appears on next render) without weakening the trust posture.

### Defense-in-depth posture

| Layer | What it checks | What it surfaces on failure |
|---|---|---|
| Client (`<ReviewForm>`) | `useUser().isSignedIn` → show form vs sign-in CTA | Sign-in modal via `<SignInButton>` |
| Server Action § 1 | Input shape (rating, body length, bookId) | Inline `{ok:false, error}` |
| Server Action § 2 | Clerk session present | "Please sign in to write a review." |
| Server Action § 4 | Entitlement `status = 'ready'` | "Only readers who own this book can leave a review." |
| DB constraint | UNIQUE `(user_id, book_id)` | Caught by `onConflictDoUpdate` (becomes edit) |

The client never assumes its own checks are enough. The server is the authoritative gate.

---

## 3. SSG preservation — why this route is still `● SSG`

The crucial check from the brief: *"the book detail page (`/books/[slug]`) remains `● SSG`. The review submission is dynamic, but the display of reviews must be baked into the static HTML at build time (and updated via ISR)."*

Three architectural separations made this trivial:

1. **The Server Action lives in `actions.ts`, not in `page.tsx`.** Server Actions imported into a Client Component don't promote the page that renders them; only the `"use server"` file is dynamic. The `page.tsx` itself is still a pure async render function with no dynamic APIs.
2. **`ReviewForm` is a Client Component.** Client Components can be embedded inside `● SSG` pages — only the form *hydrates* on the client; the page's HTML payload is still pre-rendered. Same pattern we've used since SUB-PR 1.4 for `AddToCartButton`.
3. **`getReviewsForBook` + `getBookRatingAggregate` are `safeQuery`-wrapped reads.** They run at SSG/ISR time, fetch data, render into HTML. No dynamic APIs (cookies, headers, etc.) touched.

The freshness mechanism for new reviews is the `revalidatePath('/books/<slug>')` call inside the action — targeted ISR invalidation, the surrounding catalog/blog/account routes stay cached.

```
First page render at build:           review list + JSON-LD baked in
User submits review:                  action writes row + revalidatePath
Next request to /books/<slug>:        ISR regenerates → new review visible
Other /books/<slug>:                  unaffected — still cached
Catalog browse, /blog, /account:      unaffected — still cached
```

---

## 4. `AggregateRating` JSON-LD integration

`buildBookJsonLd` from SUB-PR 3.1 was structured for exactly this extension. Now extended (additively — no breaking signature changes):

```ts
interface BookJsonLdArgs {
  // … existing fields unchanged …
  aggregateRating?: AggregateRatingInput | null;
}

export interface AggregateRatingInput {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;  // defaults to 5
  worstRating?: number; // defaults to 1
}
```

### One block, two entities, no drift

The aggregate is built once and reused on both `Book` and `Product`:

```ts
const aggregateRatingBlock =
  args.aggregateRating && args.aggregateRating.reviewCount > 0
    ? buildAggregateRatingBlock(args.aggregateRating)
    : null;

// then:
{ "@type": "Book",    …, ...(aggregateRatingBlock ? { aggregateRating: aggregateRatingBlock } : {}) }
{ "@type": "Product", …, ...(aggregateRatingBlock ? { aggregateRating: aggregateRatingBlock } : {}) }
```

If a future tweak changes `bestRating` or rounds `ratingValue` differently, both entities get the change atomically. They can't drift to different rating values, which is exactly the kind of payload inconsistency that gets a page kicked out of rich-results.

### The `reviewCount > 0` guard

Google's rich-results eligibility *rejects* `aggregateRating: { reviewCount: 0 }`. Pages with a 0-review aggregate look like spam to the structured-data parser — better to omit the field entirely until there are actual reviews. The guard lives in the helper, so callers can't forget it.

### Headline rendering mirrors the JSON-LD

The visible "4.5 ★★★★☆ · 23 reviews" headline near the title uses the same `ratingAggregate.average` and `ratingAggregate.count` values that get serialized into the JSON-LD. Same data, two surfaces — crawlers and humans see consistent numbers.

---

## 5. SQL aggregate — one round-trip, scales

```ts
const [agg] = await db
  .select({
    count: sql<number>`count(*)::int`,
    average: sql<number | null>`avg(${reviews.rating})::real`,
  })
  .from(reviews)
  .where(and(eq(reviews.bookId, bookId), eq(reviews.status, "approved")));
```

- `::int` and `::real` cast Postgres `numeric` into types Drizzle marshals as JS numbers (default `numeric` marshals to `string`, which would require parsing).
- `avg()` returns NULL on empty input — we use that to short-circuit to `{count: 0, average: null}` rather than risk a misread `{count: 0, average: 0}` ("everyone gave it zero stars").
- The `(book_id, status)` index from the schema's `reviews_book_status_idx` keeps the `WHERE` selective even at scale.

In-memory aggregation (fetch all rows, compute in TS) would have been one less file edit but would push every review row to the app server on every render. Not worth the future-rework.

---

## 6. Client Component — two-layer Clerk-safety

The `ReviewForm` lives inside an SSG page, which means it ships in environments where `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` may or may not be set (the root-layout `ClerkProvider` from the post-SUB-PR-2.3 fix is conditional). If a Client Component calls `useUser()` without a `ClerkProvider` mounted, React throws a hook-context error at runtime.

Two-layer safety:

```tsx
"use client";

// Layer 1 — build-time inlined env check. Static branch.
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function ReviewForm(props) {
  if (!CLERK_ENABLED) {
    return <p>Reviews aren't available right now — sign-in is not configured…</p>;
  }
  return <ReviewFormAuthed {...props} />;
}

// Layer 2 — only rendered when CLERK_ENABLED is true.
function ReviewFormAuthed(props) {
  const { isLoaded, isSignedIn } = useUser();  // ← only called when Clerk is mounted
  // …
}
```

Next.js inlines `NEXT_PUBLIC_*` at build time, so the branch is genuinely static. When Clerk isn't provisioned, `ReviewFormAuthed` is dead code and React never tries to invoke its hooks.

The Server Action (`submitReview`) is the *authoritative* check. Anything that somehow reaches the form and submits without auth gets back `{ ok: false, error: "Please sign in…" }` from the action — never crashes, never trusts client state.

---

## 7. a11y notes

- **Star rating display (`<StarRating>`):** single `aria-label="4.5 out of 5 stars"` on the wrapping `<span role="img">`; the individual `<Star>` glyphs are `aria-hidden`. Screen readers don't enumerate every star.
- **Star rating picker (in `<ReviewForm>`):** each star button has `aria-label="N stars"` and `aria-pressed={rating === n}`. Screen reader announces "3 stars, pressed" when selected.
- **Body textarea:** properly labelled with `<label htmlFor>`, char counter live, `maxLength` enforced both client- and server-side.
- **Result regions:** errors use `role="alert"`, success uses `role="status"` — announced without a focus shift.

---

## 8. Files touched / created

**New (5):**
1. `src/lib/db/queries/reviews.ts` — `getReviewsForBook`, `getBookRatingAggregate`
2. `src/components/star-rating.tsx` — reusable read-only star display
3. `src/components/reviews-list.tsx` — Server Component list
4. `src/components/review-form.tsx` — Client Component with two-layer Clerk safety
5. `src/app/books/[slug]/actions.ts` — `submitReview` Server Action
6. `sub-pr-report/SUB_PR_3.3_REPORT.md` (this file)

**Modified (2):**
- `src/lib/seo.ts` — added `AggregateRatingInput`; extended `buildBookJsonLd` to optionally inject `aggregateRating` on Book + Product
- `src/app/books/[slug]/page.tsx` — fetches reviews + aggregate via `Promise.all`; passes aggregate to JSON-LD; renders aggregate headline + ReviewsList + ReviewForm

**No schema or migration changes.** The `reviews` table was already in `0000_plain_chat.sql` from SUB-PR 0.3.

---

## 9. Verification (first-cycle green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean
$ npm run build           # → success, classifications below
```

Build output (relevant rows):

```
├ ○ /                                              ← Static
├ ƒ /account/*                                     ← Dynamic
├ ● /authors/[slug]                                ← SSG
├ ○ /blog                                          ← Static
├ ● /blog/[slug]                                   ← SSG
├ ● /blog/category/[slug]                          ← SSG
├ ○ /books                              1h     1y  ← Static + ISR
├ ● /books/[slug]                                  ← SSG ✅ unchanged
├ ƒ /cart                                          ← Dynamic
├ ● /categories/[slug]                             ← SSG
├ ƒ /order/[id]                                    ← Dynamic
├ ƒ /read/[bookId]                                 ← Dynamic
├ ƒ /search                                        ← Dynamic
└ ○ /sitemap.xml                        1h     1y  ← Static + ISR
```

**`● /books/[slug]` is still SSG.** The crucial constraint from the brief holds — embedding a Client Component (`ReviewForm`) and adding two new server-side reads (`getReviewsForBook` + `getBookRatingAggregate`) did not promote the route to dynamic. Every classification from SUB-PR 3.2 also holds; no regressions.

DB-unavailable warnings during build (`[catalog] getFeaturedBooks failed …`) are *expected* — they prove the `safeQuery` fallbacks ran. The reviews-query warnings did not fire because `listPublishedBookSlugs` returned `[]` (no DB), so `generateStaticParams` yielded zero slugs and no review queries ran. Once `DATABASE_URL` is provisioned, the SSG step pre-renders all book pages with their review data and aggregate.

---

## 10. What this unlocks (and what is deliberately out of scope)

**Unlocked:**
- Rich-result eligibility for star ratings in Google search — when there's ≥1 review, the JSON-LD ships `AggregateRating` on both Book and Product.
- Verified-purchaser social proof on the book detail page — the trust posture is materially higher than open-web review systems.
- Edit-my-review without separate UI — `onConflictDoUpdate` collapses create + edit into one form path.

**Out of scope (deliberately):**
- **Per-review JSON-LD (`Review` entities).** `AggregateRating` is what Google uses for rich-results. Per-review `Review` schema gets verbose and rarely surfaces. Add if/when there is a SEO reason to.
- **Moderation queue UI.** The `pending`/`rejected` states are reserved in the enum; an admin moderation tool can be a small SUB-PR-3.4 (or later) addition.
- **"Report this review" flagging.** Would set status to `pending` and require admin re-approval. Follows the same UI path as moderation.
- **Review helpfulness votes.** Worth doing once there's any actual review density.
- **Email notifications on new reviews.** A follow-up once the email infrastructure decision (Resend / Postmark / SES) is made.

---

## 11. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 3.3 reuses |
|---|---|
| 0.3 — Postgres + Drizzle | `reviews` table + `(user_id, book_id)` UK + `(book_id, status)` index already present |
| 0.5 — Clerk auth | `getUserId`, `getAuthenticatedUser`, `upsertLocalUser` JIT pattern |
| 1.4 — cart UI | Client-Component-inside-SSG-page pattern (mirrors `AddToCartButton`) |
| 1.5 — Paddle checkout | `entitlements.status = 'ready'` model — the gate condition |
| 1.6 — watermark pipeline | Same `'ready'` status; reviewing is restricted to fully-fulfilled purchases |
| 3.1 — SEO hardening | `buildBookJsonLd` was structured for additive extension; `schema-dts` types; `metadataBase` |

No regressions to any of them.

---

**Next:** HALT for explicit approval before starting SUB-PR 3.4.
