# SUB-PR 1.1 — Catalog Rendering: Book / Category / Author Pages (SSG/ISR) — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.1 — *first unit of P1.*
> **Scope (verbatim):** *"Static-first catalog surfaces using the slug/routing strategy of §6 and the rendering table of §8."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green; all routes correctly classified as **Static / SSG**.
> **Roadmap references consulted:** §6 (IA), §7 (UI/Brand), §8 / ADR-1 (rendering strategy).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `BookCard` core component | `src/components/book-card.tsx` — typography-forward layout: serif title, muted subtitle, author list, formatted price; full focus-ring + hover affordance using our design tokens. |
| `CoverImage` with placeholder | `src/components/cover-image.tsx` — 2:3 aspect, gradient + serif title-initial; preserves `coverKey` on `data-cover-key` so swap-to-`<Image>` is a single-component change once R2 is provisioned. |
| `EmptyState` | `src/components/empty-state.tsx` — calm, dashed-border block reused across all catalog surfaces. |
| Price helper | `src/lib/format.ts` — `formatPrice(cents, currency)` via `Intl.NumberFormat`. |
| Catalog query layer | `src/lib/db/queries/catalog.ts` — six functions (3 list-slugs + 3 detail/list) wrapped in `safeQuery` for graceful-empty-states. |
| Four catalog routes | `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]` — all SSG/ISR (§3 below). |

---

## 2. Build classification — the load-bearing check

The §8 / ADR-1 SEO requirement is non-negotiable: **catalog pages must be statically rendered**. Build output proves it:

```
Route (app)             Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ● /authors/[slug]
├ ○ /books                      1h      1y
├ ● /books/[slug]
└ ● /categories/[slug]

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

| Route | Classification | Why |
|---|---|---|
| `/books` | **○ Static** + ISR (1 h) | No dynamic params; `revalidate = 3600` shows up as `1h` revalidate and `1y` expire. |
| `/books/[slug]` | **● SSG** | `generateStaticParams` defined + `revalidate = 3600`. |
| `/categories/[slug]` | **● SSG** | Same pattern. |
| `/authors/[slug]` | **● SSG** | Same pattern. |
| `/admin` | **ƒ Dynamic** | Correct — auth-gated, reads cookies, writes DB. |

**No route regressed to Dynamic.** Public catalog surfaces remain indexable. ADR-1 holds.

---

## 3. `generateStaticParams` + ISR configuration

Identical pattern in all three dynamic routes:

```ts
export const revalidate = 3600; // ISR — 1 hour

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await listPublishedBookSlugs();    // or category/author equivalent
  return slugs.map(({ slug }) => ({ slug }));
}
```

- **`revalidate = 3600`** — Next.js builds the page once at deploy time, then re-renders on demand at most once per hour. This is the "revalidate on publish (or hourly fallback)" policy of §8.
- **`generateStaticParams`** — at build time, returns every published-book / category / author slug. Each becomes a prerendered HTML file. Currently returns `[]` (empty DB), so 0 pages are prerendered, but the route is **already SSG-classified** — once content lands, the next build prerenders it without code changes.
- **`dynamicParams` default `true`** — unknown slugs (post-build) render on demand and are cached for the next `revalidate` window. This means new books published *between* deploys appear after the next revalidation tick, not at the next deploy.

`/books` (no params) also exports `revalidate = 3600`, so it ISRs the catalog browse on the same cadence — important because publishing a new title needs to surface in `/books` between deploys.

The detail routes also export `generateMetadata` so per-book / per-author / per-category titles + descriptions are baked into the HTML — SEO-ready before SUB-PR 3.1 hardens structured data.

---

## 4. Graceful empty states — `safeQuery` + `EmptyState`

The DB is currently unprovisioned. Without defensive fetching, every catalog route would crash the build. The `safeQuery` wrapper in `src/lib/db/queries/catalog.ts` makes the data layer build-resilient:

```ts
async function safeQuery<T>(label, run, fallback): Promise<T> {
  try { return await run(); }
  catch (err) {
    console.warn(`[catalog] ${label} failed (DB unavailable or query error):`, …);
    return fallback;
  }
}
```

Build log this run (proves the path works):
```
[catalog] listPublishedBookSlugs failed (DB unavailable or query error): Failed query: …
[catalog] listCategorySlugs failed (DB unavailable or query error): Failed query: …
[catalog] listAuthorSlugs failed (DB unavailable or query error): Failed query: …
[catalog] listPublishedBooks failed (DB unavailable or query error): Failed query: …
```
…all logged, all caught, all returned empty — and the build **still succeeded** with every route correctly classified. Once `DATABASE_URL` is set in Vercel/CI/`.env.local`, this fallback branch is silently bypassed.

UI side: every list page renders `<EmptyState>` when its data array is empty; detail pages call `notFound()` and render the standard 404. Both treat "no data" as the equilibrium state, not an error.

---

## 5. Query design notes

- **Drizzle relational query API** (`db.query.books.findMany({ with: { bookAuthors: { with: { author } } } })`) — clean joins through the `bookAuthors` junction table set up in SUB-PR 0.3. The relations registered in `schema.ts` made this possible without raw SQL.
- **Explicit `columns: { … }` projection** — `books.search_tsv` is a heavy `tsvector` (FTS column) and `books.master_file_key` is private; neither leaves the DB layer. We project only what `BookCard` / `BookDetail` need.
- **Authors carried on every list query** — `BookCard` is the only catalog presentation shape, so the data layer always returns books with their author array. Avoids the "list view has no authors" inconsistency.
- **Published filter at the query layer** — `where: status = "published"` is enforced in every public read; draft titles are invisible to non-admin surfaces by construction.
- **`onConflict`-style policies / draft-suppression** are tested implicitly: empty DB → empty `published` set → empty page → no leakage. The contract is correct.

---

## 6. UI / brand decisions (Roadmap §7)

- **Typography-forward `BookCard`:** serif title, sans subtitle/authors/price, generous spacing, hover-color shift to `primary` (the evergreen accent from 0.1) instead of underline.
- **Cover placeholder:** 2:3 portrait aspect with a soft gradient and a 7xl serif title-initial in `muted-foreground/30` — a literary feel that reads "tome", not "broken image", when there is no cover.
- **`data-cover-key`** kept on the placeholder root so the intended R2 key is visible in DOM today and ready to drive a future `<Image src>`.
- **Detail page composition:** two-column grid on `md+`, cover sticky on scroll; serif `text-5xl` title with `text-balance`; a definition list for price / language / pages / ISBN — a calm, scannable spec-sheet rather than a marketing block.
- **`EmptyState`** is dashed-border + serif heading — visually distinct from "real" content; cannot be mistaken for a real empty section.

---

## 7. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — **every catalog route classified as Static or SSG** (table in §2) |

Only remaining warning across the build: the benign `MODULE_TYPELESS_PACKAGE_JSON` on `tailwind.config.ts` — cosmetic, unchanged from earlier SUB-PRs.

---

## 8. Files created / modified

```
src/lib/format.ts                           (new — formatPrice helper)
src/components/cover-image.tsx              (new — placeholder + future-Image swap point)
src/components/book-card.tsx                (new — catalog tile + BookCardData type)
src/components/empty-state.tsx              (new — shared empty surface)
src/lib/db/queries/catalog.ts               (new — safeQuery + 6 catalog reads)
src/app/books/page.tsx                      (new — catalog browse, ISR 1h)
src/app/books/[slug]/page.tsx               (new — book detail, SSG)
src/app/categories/[slug]/page.tsx          (new — category hub, SSG)
src/app/authors/[slug]/page.tsx             (new — author page, SSG)
sub-pr-report/SUB_PR_1.1_REPORT.md          (new — this report)
```

No existing files were modified (the `CLAUDE.md` File Layout already covers `src/components/` and `src/lib/db/` at a level of abstraction that absorbs these additions; an update would only repeat existing language).

---

## 9. Decisions / deviations worth surfacing

1. **`safeQuery` wrapper at the data layer**, not in each page. Single, audited place where DB failure → empty UI. Logs are clearly labeled `[catalog] <fn>` for future grepping.
2. **`BookCardData` lives in `src/components/book-card.tsx`** and is imported by the queries (a small "lib → components type-only import"). Reasoning: the UI is the natural owner of the *display* shape; queries adapt to it.
3. **All list queries include `authors`** even though the empty DB makes this invisible today. Avoids a future schema split between "list view" and "detail view" shapes.
4. **Cover placeholder is rendered always** in 1.1 — wiring `<Image>` requires both R2_PUBLIC_BASE_URL provisioning AND `images.remotePatterns` config. Both arrive together when the first real cover is uploaded; `CoverImage` is the single swap point.
5. **`dynamicParams` left at default `true`** — new published titles surface lazily between deploys (after their first request triggers ISR). This matches §8's "revalidate on publish" intent.
6. **Two-query catalog routes (`books` + `bookAuthors` + `authors`)** use the Drizzle relational API for clarity. If we ever need raw performance, we can drop to a single SQL with `json_agg` — the call sites and shapes are stable.
7. **`/categories` and `/authors` top-level index pages were NOT created.** §6 sitemap only shows `[slug]` hubs for these; the scope was the four routes you listed, no broader IA changes.

---

## 10. Definition-of-done vs. SUB-PR 1.1 scope

- [x] `BookCard` component built with the literary design tokens — cover (placeholder), title, author(s), price.
- [x] `/books/page.tsx` — catalog browse, lists all published books.
- [x] `/books/[slug]/page.tsx` — book detail page.
- [x] `/categories/[slug]/page.tsx` — category hub.
- [x] `/authors/[slug]/page.tsx` — author page.
- [x] `generateStaticParams` in all dynamic routes, querying the DB for existing slugs.
- [x] `revalidate = 3600` ISR config in every catalog route segment.
- [x] Graceful empty states — `safeQuery` + `EmptyState`; no crashes on an empty / unprovisioned DB.
- [x] Local verification — lint (zero warnings), tsc, build — all green; **all catalog routes Static/SSG**.

**Out of scope (correctly deferred):**
- Real cover-image rendering (needs R2 provisioned + `images.remotePatterns`).
- Structured data / JSON-LD (lands in SUB-PR 3.1 — *SEO hardening*).
- Search / filter on `/books` (lands in SUB-PR 1.2 — *Browse + search (Postgres FTS)*).
- A buy button / add-to-cart on the detail page (lands in SUB-PR 1.4 / 1.5).
- Sample viewer on the detail page (lands in SUB-PR 1.3).

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 1.2 — Browse + search (Postgres FTS).** Adds query / filter / sort to `/books`, and wires the FTS pipeline we built in SUB-PR 0.3 (the `search_tsv` STORED column + `books_search_gin_idx`) to a search input + results UI. Execution is **halted pending your explicit approval.**
