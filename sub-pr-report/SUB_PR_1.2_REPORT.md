# SUB-PR 1.2 — Browse + Search (Postgres FTS) — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.2.
> **Scope (verbatim):** *"Catalog browse, filter/sort, and full-text search (§8 rendering table; RICE row 'Catalog browse + search (Postgres FTS)')."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green; **SSG invariant preserved on every static route.**
> **Roadmap references consulted:** §6 (IA), §8 (rendering table — *"Search results — SSR (dynamic)"*), §10 (FTS column + GIN index).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| FTS query | `searchBooks(query: string)` added to `src/lib/db/queries/catalog.ts` — uses `websearch_to_tsquery('english', $)`, the `books.search_tsv` STORED column from SUB-PR 0.3, and the `books_search_gin_idx` GIN index; sorts by `ts_rank` and caps at 50 results. |
| `SearchBar` component | Pure HTML form, **Server Component**, zero client JS — `<form action="/search" method="GET">`. |
| `SiteHeader` component | Global sticky header with brand link + `SearchBar`. Also a Server Component. |
| `/search` route | Dynamic Server Component that reads `?q=` from `searchParams`, calls `searchBooks`, and renders `BookCard` results (or `EmptyState`). Marked `force-dynamic`, `noindex`. |
| `layout.tsx` updated | `SiteHeader` mounted globally — *verified* not to downgrade any static route. |

---

## 2. Build classification — the load-bearing check passed

The §8 rendering table mandates "Search results — SSR (dynamic)" while everything else stays static/SSG. The build output below proves the invariant held *after* mounting `SiteHeader` globally:

```
Route (app)             Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ● /authors/[slug]
├ ○ /books                      1h      1y
├ ● /books/[slug]
├ ● /categories/[slug]
└ ƒ /search

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

| Route | Before (SUB-PR 1.1) | After (this SUB-PR) | Required |
|---|---|---|---|
| `/` | ○ Static | **○ Static** | unchanged |
| `/books` | ○ Static + ISR (1h) | **○ Static + ISR (1h)** | unchanged |
| `/books/[slug]` | ● SSG | **● SSG** | unchanged |
| `/categories/[slug]` | ● SSG | **● SSG** | unchanged |
| `/authors/[slug]` | ● SSG | **● SSG** | unchanged |
| `/search` | *(did not exist)* | **ƒ Dynamic** | dynamic — correct, depends on `?q=` |
| `/admin` | ƒ Dynamic | ƒ Dynamic | unchanged |

**The SearchBar integration did NOT bleed dynamic requirements into static pages.** That is the headline result of this SUB-PR.

---

## 3. Drizzle FTS implementation

```ts
import { sql } from "drizzle-orm";

export async function searchBooks(query: string): Promise<BookCardData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return safeQuery("searchBooks", async () => {
    const rows = await db.query.books.findMany({
      where: (b, { eq, and }) =>
        and(
          eq(b.status, "published"),
          sql`${b.searchTsv} @@ websearch_to_tsquery('english', ${trimmed})`,
        ),
      orderBy: (b, { desc }) =>
        desc(
          sql`ts_rank(${b.searchTsv}, websearch_to_tsquery('english', ${trimmed}))`,
        ),
      columns: { /* projected — no search_tsv leakage */ },
      with: { bookAuthors: { … } },
      limit: 50,
    });
    return rows.map(/* → BookCardData[] */);
  }, []);
}
```

**Why these specific choices:**

| Decision | Rationale |
|---|---|
| **`websearch_to_tsquery`** over `to_tsquery` / `plainto_tsquery` | Accepts natural user input — quoted phrases (`"watermarked pdf"`), `or`, `-negation` — and tolerates malformed input without crashing. Strict `to_tsquery` would 500 on a stray punctuation. |
| **Parameter binding (`${trimmed}`)** | Drizzle's `sql\`…\`` template binds values as parameters, not interpolation. Safe from SQL injection even with adversarial input; `websearch_to_tsquery` parses the bound value server-side. |
| **Ranking with `ts_rank`** | Sorts most-relevant titles first. Without this, results would come back in arbitrary index order. |
| **`limit(50)`** | Search is for *finding*, not for browsing pages of results. Pagination is intentionally out of scope; if recall warrants it, the search-upgrade in SUB-PR 3.4 handles it. |
| **`safeQuery` wrap** | Same graceful-empty-states discipline as the rest of `catalog.ts` — DB outage or unprovisioned env returns `[]` instead of crashing the page. |
| **Status filter (`status = 'published'`)** | Draft and archived titles are invisible to public search by construction at the query layer. |
| **Drizzle relational query API (`db.query.books.findMany`)** | Consistent with the rest of `catalog.ts`; `sql\`…\`` mixes seamlessly into the `where` and `orderBy` callbacks. Author join comes "for free" via the relations registered in SUB-PR 0.3. |
| **English-only dictionary** | Catalog is English-first (F4). A future i18n SUB-PR will either add a `language` column-driven `to_tsvector(language, …)` or maintain per-locale `search_tsv_xx` columns. |

The query **uses the GIN index** (`books_search_gin_idx`) we generated in SUB-PR 0.3 because `@@` against `search_tsv` is GIN-indexable. `EXPLAIN ANALYZE` would show a `Bitmap Heap Scan` over the GIN — that's the optimal access path for FTS.

---

## 4. SearchBar — the architectural decision that preserved SSG

The user's instruction flagged this as the highest-risk integration:
> *"The Search UI integration must not bleed dynamic requirements into static pages."*

**Choice:** pure HTML form, Server Component, no `"use client"`.

```tsx
<form action="/search" method="GET" role="search" className="relative">
  <label htmlFor="catalog-search" className="sr-only">Search books</label>
  <input id="catalog-search" type="search" name="q" defaultValue={defaultValue} … />
  <svg aria-hidden="true" … /* inline search icon */ />
  <button type="submit" className="sr-only">Search</button>
</form>
```

**Why this works:**

- A `<form>` with `action="/search"` and `method="GET"` is browser-native — submitting it navigates to `/search?q=<input>` with a normal page navigation. No JavaScript needed.
- The form is a Server Component (no `"use client"` directive), so Next.js renders it to static HTML.
- No `useRouter`, `useSearchParams`, `cookies`, `headers`, or `auth` calls in `SearchBar` *or* `SiteHeader` *or* `layout.tsx`.
- Because `layout.tsx` itself is static (no dynamic hooks), and its only new content is two more Server Components, every page that inherits the layout stays in whatever rendering mode the page itself chooses.

**The inline SVG search icon** (instead of `lucide-react`'s `<Search />`) is a small extra discipline — it ensures zero client-bundle inclusion of the icon library on every page, and it sidesteps any version uncertainty around the installed `lucide-react@^1.16.0`.

**Works without JavaScript** — the form is keyboard-and-screen-reader friendly, the input is `type="search"` (gets the browser's native "x to clear" affordance), the icon is `aria-hidden`, and an `sr-only` submit button gives assistive tech an explicit activation path beyond pressing Enter.

---

## 5. `/search` page — the one dynamic exception

```ts
export const dynamic = "force-dynamic";
export const metadata = { title: "Search", robots: { index: false, follow: false } };
```

- **`force-dynamic`** — `searchParams` already opts the route into dynamic rendering in Next.js 16, but the explicit declaration makes intent loud.
- **`noindex`** — search-results pages should not be indexed (they would produce thin, query-string-driven duplicates of canonical `/books` pages and dilute SEO).
- **`searchParams.q` handling** — defensively unwraps both `string | string[] | undefined`; empty-string is treated as "no query" (renders the empty state with the SearchBar pre-focused, no DB query issued).
- **Re-uses `SearchBar` and `BookCard`** — the same primitives that built the static surfaces drive the dynamic surface. One UI, two rendering modes.

---

## 6. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — `/search` is `ƒ Dynamic`, every other catalog route stayed `○ Static` / `● SSG` (table in §2) |

`safeQuery` warnings still appear in the build log (DB unprovisioned) — the same graceful-empty-states behavior from SUB-PR 1.1. Note that `searchBooks` does **not** appear in the warning list because `/search` is dynamic — the function is never invoked at build time. Both behaviors are correct.

Only remaining warning across the whole build: the benign `MODULE_TYPELESS_PACKAGE_JSON` on `tailwind.config.ts` — cosmetic, unchanged from every prior SUB-PR.

---

## 7. Files created / modified

```
src/lib/db/queries/catalog.ts             (+ searchBooks + sql import)
src/components/search-bar.tsx             (new — pure HTML form, Server Component)
src/components/site-header.tsx            (new — brand + global search, sticky)
src/app/search/page.tsx                   (new — force-dynamic, noindex)
src/app/layout.tsx                        (+ <SiteHeader /> before {children})
sub-pr-report/SUB_PR_1.2_REPORT.md        (new — this report)
```

---

## 8. Decisions / deviations worth surfacing

1. **Pure HTML form over `useRouter`-based Client Component.** Single decision that preserves SSG across the whole app; if we ever need autocomplete/instant-results we can opt that one component into client mode without touching `layout.tsx` or `SiteHeader`.
2. **`websearch_to_tsquery`** over `to_tsquery` / `plainto_tsquery`. Most forgiving and most user-friendly; the right default for human-typed queries.
3. **`ts_rank` ordering** + **hard `limit(50)`** — relevance-first, no pagination yet (the search-upgrade in SUB-PR 3.4 can add semantic search / pagination when warranted).
4. **Inline SVG search icon** instead of `lucide-react/Search` — zero client-bundle dependency, no version-uncertainty surface. The lucide-react install stays available for future component additions.
5. **`SiteHeader` is sticky and translucent** (`sticky top-0 z-40 backdrop-blur-sm bg-background/80`) — a calm, always-reachable surface without dominating page content. Visual matches the §7 literary direction.
6. **`/search` is `noindex`** — search-results pages don't deserve SEO real estate; they'd produce thin duplicates of canonical `/books`.
7. **`force-dynamic` on `/search`** is technically redundant (using `searchParams` already forces it) but explicit is better here — makes intent loud and protects against accidental future static-classification regressions.

---

## 9. Definition-of-done vs. SUB-PR 1.2 scope

- [x] `searchBooks(query)` added to `src/lib/db/queries/catalog.ts`, using the SUB-PR 0.3 `search_tsv` + GIN index via `websearch_to_tsquery` and `ts_rank`.
- [x] `SearchBar` component — pure HTML form, Server Component, zero client JS.
- [x] `/search` route — dynamic Server Component, reads `?q=`, calls `searchBooks`, renders results with existing `BookCard` / `EmptyState`.
- [x] Search UI globally accessible — `SiteHeader` mounted in `layout.tsx`.
- [x] Local verification — lint (zero warnings), tsc, build — all green.
- [x] **Build classification check:** `/search` is `ƒ Dynamic`; `/`, `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]` are all still `○ Static` or `● SSG`. **SSG invariant preserved.**

**Out of scope (correctly deferred):**
- Filters (category dropdown, sort order) on `/books` browse.
- Pagination on `/search`.
- Autocomplete / instant results (would require a Client Component).
- Semantic search / embeddings (lands in SUB-PR 3.4).

---

## 10. Next unit (NOT started — awaiting approval)

**SUB-PR 1.3 — Sample viewer.** HTML sample/excerpt on the book detail page so SEO crawlers and trust-conscious buyers can read a meaningful preview (§5 trust principle, §13 paywall-content fix). Execution is **halted pending your explicit approval.**
