# SUB-PR 3.2 — Blog / Content Hub Report

**Branch:** `main`
**Scope:** Phase 3 — Discovery & Growth, unit 2 (Blog / content hub)
**Roadmap refs:** §6 (Information Architecture), §13 (SEO & Discoverability)
**Status:** ✅ Complete. All blog routes pre-rendered; first-cycle verification gate passed.

---

## 1. What landed

A filesystem-backed editorial content hub that doubles as an SEO internal-linking surface into the catalog:

```
GET  /blog                           ○ Static       — index + category chips
GET  /blog/[slug]                    ● SSG          — post detail + JSON-LD + RelatedBooks
GET  /blog/category/[slug]           ● SSG          — category hub
```

Plus the existing `/sitemap.xml` is now extended with blog URLs, so the entire surface is discoverable on the first crawl.

---

## 2. Why a filesystem CMS (not the DB)

Blog content is highly static, deploy-pinned, and SEO-critical. Putting it in Postgres would:

1. **Add a DB read to every blog pageview** — the most-read pages in any content-marketing setup would now require DB connectivity to render.
2. **Make ADR-1 harder to honor** — DB-backed pages need either ISR + `outputFileTracingIncludes` for graceful degradation, or they have to accept runtime DB dependencies on what should be a fully pre-rendered surface.
3. **Lose the repo's normal review flow** — markdown in `src/content/blog/*.md` ships through PRs, which is the right authoring loop for opinionated editorial content. CMS UIs come later, when there's a non-developer editorial team.

The trade-off: new posts require a deploy. For v1 of the editorial track, that's the *correct* friction — it forces editorial review through the same gate as code.

---

## 3. Architecture map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BUILD TIME (next build)                       │
│                                                                      │
│   src/content/blog/*.md                                              │
│            │                                                         │
│            │   fs.readdir + gray-matter + marked.parse               │
│            ▼                                                         │
│   src/lib/blog.ts                                                    │
│            │   ┌─────────────────────────────────────────────┐       │
│            │   │ module-level Promise cache                  │       │
│            │   │   _postsCache: Promise<BlogPostMeta[]>      │       │
│            │   │   one scan/parse per build process          │       │
│            │   └─────────────────────────────────────────────┘       │
│            ▼                                                         │
│   ┌──────────────────────┬──────────────────────┬─────────────────┐  │
│   │ getAllPostSlugs()    │ getAllPosts()        │ getAll          │  │
│   │   →                  │   →                  │ CategorySlugs() │  │
│   │ generateStatic       │ /blog index page     │   →             │  │
│   │ Params on            │                      │ generateStatic  │  │
│   │ /blog/[slug]         │ getPostBySlug() →    │ Params on       │  │
│   │                      │ /blog/[slug] detail  │ /blog/category/ │  │
│   │                      │ (with rendered HTML) │ [slug]          │  │
│   └──────────────────────┴──────────────────────┴─────────────────┘  │
│                                                                      │
│                                  ─ plus ─                            │
│                                                                      │
│   /blog/[slug]/page.tsx ──► RelatedBooks (Server Component)          │
│                                │                                     │
│                                ▼                                     │
│                     getFeaturedBooks(limit=3)                        │
│                                │                                     │
│                                ▼   safeQuery-wrapped                 │
│                              Neon                                    │
│                                │                                     │
│                                ▼                                     │
│                BookCard grid (3 books) baked into SSG HTML           │
└──────────────────────────────────────────────────────────────────────┘
```

Everything above happens during `next build`. The rendered HTML is shipped as static assets. No DB read or filesystem scan at request time.

---

## 4. Markdown pipeline — `marked` + `gray-matter`

Two small dependencies, both runtime (`dependencies`) because Server Components consume them during SSG:

| Dep | Version | Role |
|---|---|---|
| `gray-matter` | ^4.0.3 | Parse YAML frontmatter from the markdown file head |
| `marked` | ^18.0.4 | Parse markdown body → HTML |

**Why `marked` and not `unified` + `remark-parse` + `remark-html`:**
- One package vs. three. Matches the minimal-dependency philosophy from PAST_DECISIONS.
- GFM (tables, task-lists, autolinks) is on by default in v8+.
- Sync by default → simpler call sites. Typed `string | Promise<string>` so `await marked.parse(content)` is forward-compatible if we ever flip on async plugins.

**Why no DOMPurify / rehype-sanitize:**
- Content is repo-controlled. Authors PR a `.md` file, which goes through code review like any other artifact.
- Same trust posture as `SampleViewer` (SUB-PR 1.3) — controlled-source assumption holds.

If we ever accept user-submitted markdown (comments, reviews), we add a sanitizer at *that* boundary, not this one.

---

## 5. The internal-linking story (Roadmap §13)

After structured data, internal linking is the second-most-important on-page SEO surface. Every blog post is wired to flow link juice into the catalog *and* to other blog pages:

```
/blog/[slug] post page emits these internal links:
  ├─ ./.. → /blog                   (breadcrumb)
  ├─ ./.. → /blog/category/<X>      (category chip in header)
  ├─ <body> → any in-post links     (e.g., /books from author copy)
  ├─ RelatedBooks → /books/<slug>   × 3   (the bridge)
  └─ RelatedBooks → /books          (catalog catch-all)
```

The `RelatedBooks` Server Component is the deliberate crux. It:
- Reuses `BookCard` so the visual treatment matches the catalog (cover + title + author + price).
- Calls the new `getFeaturedBooks(limit)` query, which is `safeQuery`-wrapped — empty DB just returns `[]`, and the component renders `null` rather than an awkward "no related books" empty state on a blog post.
- Lives in `src/components/related-books.tsx` so any future page (e.g., the homepage) can drop it in identically.

---

## 6. Why **no** `revalidate` on blog routes

Every other dynamic route on the site uses `revalidate = 3600`. Blog routes deliberately do not. Two reasons:

1. **Markdown is deploy-pinned.** A new post lands when a PR merges and the site redeploys. ISR-revalidating a page whose content cannot have changed since build is busywork.
2. **Avoids `outputFileTracingIncludes`.** If we did set `revalidate`, the markdown files would need to be present in the serverless function bundle at runtime — Next.js's auto-tracing doesn't always capture `fs.readdir(staticPath)` reads. Setting `outputFileTracingIncludes: { '/blog/**': ['./src/content/**/*'] }` in `next.config.ts` would fix that, but pulling in `src/content/**` for every blog function invocation costs serverless cold-start size. The simpler win is to keep the pages purely static.

Conscious trade-off (documented here for future reference): the **`RelatedBooks` grid is build-time frozen** on each blog post. When new books land, existing blog posts won't surface them in their "From the catalog" section until the next deploy. Acceptable for v1; if it becomes a freshness problem, the targeted fix is to move just the `RelatedBooks` query path to a small dynamic API route (or to add `revalidate` + `outputFileTracingIncludes` together).

---

## 7. `BlogPosting` JSON-LD

Mirrors the Book/Product `@graph` approach from SUB-PR 3.1, but the editorial content surface has nothing to cross-reference (no `Offer`, no `Author` as a structured entity yet), so a single top-level `BlogPosting` is the right scope:

```ts
const jsonLd: WithContext<BlogPosting> = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${baseUrl}/blog/${slug}#post`,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/blog/${slug}` },
  headline: post.title,
  description: post.excerpt,
  datePublished: post.date,
  dateModified: post.date,
  articleSection: post.category,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,   // ← cross-references the
    name: SITE_NAME,                     //    Organization @id from
    url: baseUrl,                        //    the book pages
  },
};
```

The `publisher.@id` deliberately matches the `@id` we use for the Organization node on `/books/[slug]` — so when a crawler indexes both pages, they resolve to the same publisher entity, not two duplicates. Same `schema-dts` typed approach as 3.1 — no casts.

---

## 8. Metadata composition (relies on the SUB-PR 3.1 `metadataBase`)

Every blog route declares `alternates.canonical` as a relative path; Next.js absolutizes against `metadataBase` from the root layout. No URL string is duplicated between metadata and JSON-LD; both flow from `getBaseUrl()`.

| Route | `openGraph.type` | Notes |
|---|---|---|
| `/blog` | `website` | Static, no per-route variation needed |
| `/blog/[slug]` | `article` | Adds `publishedTime` + `section` — canonical OG shape for editorial |
| `/blog/category/[slug]` | `website` | Category hubs are listing pages, not articles |
| `/sitemap.xml` | n/a | Extended with `/blog`, all posts, all category hubs |

---

## 9. `PROSE_CLASSES` extracted to `src/lib/prose.ts`

The blog post body and `SampleViewer` (SUB-PR 1.3) now share the exact same typography composition via `import { PROSE_CLASSES } from "@/lib/prose"`. Before this SUB-PR, `PROSE_CLASSES` was a private constant inside `sample-viewer.tsx`; if we'd duplicated it into a new `BlogPostBody` component, a future typography tweak (e.g., adjusting `prose-blockquote` styling) would have to land in two places and drift the moment one was forgotten. The shared module is the cheapest insurance against that drift.

Both surfaces now render:
- Serif headings (Fraunces) at `font-medium` with `-tracking-tight`
- Non-italic blockquotes with the brand evergreen left rule
- Inline links in the evergreen accent
- 68ch reading measure via `max-w-prose`

---

## 10. Sitemap extension

`src/app/sitemap.ts` previously emitted: home, `/books`, all `/books/<slug>`, all `/categories/<slug>`, all `/authors/<slug>` (SUB-PR 3.1).

Now also emits, in this order:
- `/blog` — `lastModified` = newest post's `date`, `priority` 0.7
- All `/blog/<slug>` — `lastModified` = post's `date`, `priority` 0.6, `monthly` cadence
- All `/blog/category/<slug>` — `lastModified` = newest post **in that category**, `priority` 0.5

The per-category lastModified is computed by walking the post list once and `Map`-tracking the max date per category slug — keeps the sitemap honest without an N+1.

---

## 11. Files touched / created

**New (10):**
1. `src/content/blog/why-we-built-a-digital-bookstore.md`
2. `src/content/blog/how-to-choose-your-next-book.md`
3. `src/lib/blog.ts` — FS + frontmatter + markdown loader
4. `src/lib/prose.ts` — extracted `PROSE_CLASSES`
5. `src/components/blog-card.tsx`
6. `src/components/related-books.tsx`
7. `src/app/blog/page.tsx`
8. `src/app/blog/[slug]/page.tsx`
9. `src/app/blog/category/[slug]/page.tsx`
10. `sub-pr-report/SUB_PR_3.2_REPORT.md` (this file)

**Modified (4):**
- `src/components/sample-viewer.tsx` — imports `PROSE_CLASSES` from `@/lib/prose`
- `src/lib/db/queries/catalog.ts` — added `getFeaturedBooks(limit)`
- `src/app/sitemap.ts` — extended with blog URLs
- `src/components/site-header.tsx` — added "Books" + "Blog" primary nav
- `package.json` + `package-lock.json` — `marked` + `gray-matter`

---

## 12. Verification (first-cycle green)

```bash
$ npm run lint            # → clean
$ npx tsc --noEmit        # → clean
$ npm run build           # → success, classifications below
```

Build output (relevant rows):

```
├ ○ /blog                                                  ← Static
├ ● /blog/[slug]                                           ← SSG
│ ├ /blog/how-to-choose-your-next-book
│ └ /blog/why-we-built-a-digital-bookstore
├ ● /blog/category/[slug]                                  ← SSG
│ ├ /blog/category/behind-the-scenes
│ └ /blog/category/reading-guides
└ ○ /sitemap.xml                                  1h   1y  ← updated
```

**Every `/blog*` route is `○ Static` or `●` SSG.** The crucial check holds — the blog is completely pre-rendered. Every classification from SUB-PR 3.1 also holds; no regressions to any catalog or account route.

DB-unavailable warnings during build (`[catalog] getFeaturedBooks failed ...`) are *expected* — they prove the `safeQuery` fallback ran and `RelatedBooks` rendered `null`, exactly the empty-state contract. Once `DATABASE_URL` is provisioned, those warnings disappear and the cross-link grid materializes automatically.

---

## 13. What this unlocks (and what is deliberately out of scope)

**Unlocked:**
- A real internal-link surface from content → commerce. Every post is a SEO-indexable page that funnels link juice into `/books/*`.
- The site now has a publishable editorial voice — the "why we built this" + "how to choose your next book" posts are intentionally on-brand for the calm-literary tone established in Roadmap §7.
- A path for marketing/SEO to add posts via PR with zero code changes.

**Out of scope (deliberately, for now):**
- **CMS UI.** Markdown-in-repo is the right authoring loop until there is a non-developer editorial team.
- **MDX / interactive components in posts.** Plain markdown covers the editorial surface. Promote to MDX when a post genuinely needs in-line interactivity.
- **Syntax highlighting in code blocks.** No technical posts yet; we can add `rehype-pretty-code` (and switch from `marked` to `unified`) when the first one lands.
- **`AggregateRating` on `BlogPosting`.** Reviews / comments aren't a thing yet (deferred to SUB-PR 3.3 alongside book reviews).
- **Author entities.** Posts have a single implicit author (the site). When multiple authors are needed, we add `author: { @type: "Person", … }` to the JSON-LD and a hover-card byline on the post.

---

## 14. Dependencies on prior SUB-PRs

| Prior SUB-PR | What 3.2 reuses |
|---|---|
| 0.1 — scaffold | Tailwind v4 + design tokens (evergreen primary, serif headings, paper-and-ink palette) |
| 0.3 — Postgres + Drizzle | `safeQuery` discipline; catalog query module |
| 1.1 — SSG/ISR catalog | `BookCard` shape (`BookCardData`), reused inside `RelatedBooks` |
| 1.3 — sample viewer | `@tailwindcss/typography` + the `PROSE_CLASSES` composition (extracted to `src/lib/prose.ts`) |
| 3.1 — SEO hardening | `getBaseUrl()`, `SITE_NAME`, `schema-dts` types, `metadataBase` resolution, sitemap convention |

No regressions to any of them.

---

**Next:** HALT for explicit approval before starting SUB-PR 3.3 (reviews/ratings + `AggregateRating` JSON-LD on `Book` / `Product`).
