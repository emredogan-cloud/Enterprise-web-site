# SUB-PR 3.1 — SEO Hardening, Structured Data & Dynamic Sitemaps — Report

> **Phase:** P3 Discovery & Growth · **Unit:** SUB-PR 3.1 — *the first unit of Phase 3.*
> **Scope (verbatim):** *"JSON-LD (Book/Product/Offer/AggregateRating/BreadcrumbList/Organization), dynamic sitemaps, canonicals, OG/Twitter cards, Core Web Vitals (§13)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green on the first cycle; SSG invariant preserved.
> **Roadmap references consulted:** §13 (SEO & Discoverability) — including the "paywall-content problem" guidance and ADR-1's SSG-first rendering policy.

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `schema-dts` installed | `^2.0.0` (dev-only) — type-safe Schema.org via JSON-LD |
| JSON-LD on book detail page | Single `<script type="application/ld+json">` with one `@graph` covering Organization + BreadcrumbList + Book + Product + nested Offer |
| Dynamic XML sitemap | `src/app/sitemap.ts` — books / categories / authors generated from the DB; ISR 1 h, `safeQuery`-wrapped, `getBookSitemapEntries` returns accurate `lastModified` |
| Metadata enhancements | `metadataBase` in root layout + per-route OpenGraph + Twitter Cards + canonical URLs on `/`, `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]` |
| LCP-optimized cover image | `<CoverImage />` now renders real R2 covers via `next/image` with `priority` on the book detail page; typographic placeholder is the graceful fallback when env / cover key is missing |
| `next.config.ts` images | `remotePatterns` for `*.r2.cloudflarestorage.com` / `*.r2.dev` (both single + multi-subdomain) + build-time custom-CDN hostname from `R2_PUBLIC_BASE_URL` |
| `.env.example` updated | Clarified `R2_PUBLIC_BASE_URL` — *public* covers, NOT private masters/artifacts |
| Verification | lint · tsc · build — all green on the **first cycle**; new `/sitemap.xml` correctly `○ Static`; every other classification unchanged |

---

## 2. Build classification — invariant preserved across 17 routes

```
Route (app)               Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /account/library
├ ƒ /account/orders
├ ƒ /account/settings
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
├ ƒ /search
└ ○ /sitemap.xml                  1h      1y                ← NEW
```

The only new entry is `/sitemap.xml`, correctly `○ Static` with the same `revalidate: 3600` cadence as the catalog routes. **Every catalog page is still Static / SSG** — adding JSON-LD, enhanced metadata, Next/Image, and a sitemap did not introduce a single dynamic-rendering bleed.

---

## 3. JSON-LD architecture — one `@graph`, four entities, schema-dts typed

```ts
// src/lib/seo.ts
export function buildBookJsonLd(args): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization",     "@id": `${baseUrl}/#organization`, … },
      { "@type": "BreadcrumbList",   itemListElement: [Home → Books → <title>] },
      { "@type": "Book",             "@id": `${bookUrl}#book`,           … },
      { "@type": "Product",          offers: { "@type": "Offer", … } },
    ],
  };
}
```

| Entity | Why it's here |
|---|---|
| **Organization** | The publisher identity. `@id` is the canonical site origin so Google can dedupe across pages. |
| **BreadcrumbList** | Three-step breadcrumb (Home → Books → title). Eligible for the SERP breadcrumb sub-result. |
| **Book** | Catalog metadata — `name`, `author` (Person[]), `isbn` (if present), `bookFormat: EBook`, `inLanguage`, `numberOfPages`, `image`. Books are eligible for rich-result enhancements in Google. |
| **Product** | Commerce signals — `name`, `image[]`, `brand` (Organization), and a nested **Offer** with `price`, `priceCurrency`, `availability: InStock`, `seller`. |

**One graph, not four scripts.** Putting all four entities under a single `@graph` makes `@id` cross-references resolvable in the same payload — the Book and Product can refer back to the Organization without restating it.

**`AggregateRating` is intentionally omitted** — Google rejects rich results when AggregateRating has a `ratingValue` of 0 or fewer than 1 review. The brief explicitly defers it to SUB-PR 3.3 when reviews land; we'll wire it then with the same helper file.

**schema-dts gave us type safety with zero friction this time.** The `Graph` return type accepted the entity-discriminated array directly; no `as` casts needed. The conditional-spread pattern (`...(args.isbn ? { isbn: args.isbn } : {})`) handled optional fields without leaking `undefined` into the rendered JSON.

**The script tag itself:**

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

`dangerouslySetInnerHTML` is the canonical pattern for JSON-LD; the content is a JSON-serialized object we control entirely, so the `react/no-danger` rule (off by default in `eslint-config-next`) was a non-issue.

---

## 4. Sitemap — `safeQuery`-wrapped, DB-driven, ISR

```ts
// src/app/sitemap.ts
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [books, categories, authors] = await Promise.all([
    getBookSitemapEntries(),
    listCategorySlugs(),
    listAuthorSlugs(),
  ]);
  // …builds an array of { url, lastModified, changeFrequency, priority }
}
```

Three design choices:

1. **`safeQuery`-wrapped DB reads.** Same discipline as the catalog pages — a missing `DATABASE_URL` degrades the sitemap to just the site root + `/books`, never crashes. Once Neon is provisioned, the per-slug entries appear on the next ISR revalidation tick automatically.
2. **Accurate `lastModified` for books** via a new `getBookSitemapEntries` query that projects `slug + updatedAt`. Categories and authors have no `updatedAt` columns in the schema, so they fall back to the sitemap-generation time (acceptable hint to crawlers; we could add `updatedAt` columns in a future SUB-PR if granular freshness matters).
3. **Hourly ISR** matches the catalog cadence — a new book published into the catalog appears in the sitemap within the hour without manual cache busting.

`priority` / `changeFrequency` reflect SEO weight: `/books` is `daily/0.9`, per-book pages are `weekly/0.8`, hubs are `weekly/0.6`. Hints, not contracts.

---

## 5. Metadata — `metadataBase` + per-route enhancements

The single most consequential addition is `metadataBase` in the root layout:

```ts
// src/app/layout.tsx
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  // …title template, description, OG site defaults, Twitter card default
};
```

With `metadataBase` set, every relative URL emitted by per-page `generateMetadata` (canonicals, OG `url`, OG `images`, Twitter `images`) is **auto-absolutized** by Next.js. Per-route code stays clean — we write `alternates: { canonical: "/books" }` and Next emits `https://your-deploy/books`.

**Per-route additions** — every catalog route now has:

```ts
alternates: { canonical: <path> },
openGraph: { title, description, url: <path>, type: "website" | "book" | "profile" },
twitter:   { card: "summary_large_image", title, description, images: [...] },
```

`type: "book"` on `/books/[slug]` aligns with the OG Books extension; `type: "profile"` on `/authors/[slug]`; `type: "website"` everywhere else.

`OG images` on book detail use the same `getCoverImageUrl(coverKey)` helper that drives `<CoverImage />` — when the cover is real, it's the share image; when it's a placeholder, OG image is omitted (better than a half-hearted text-on-a-rectangle).

The home page also got first-class metadata, with `title: { absolute: "…" }` to bypass the `"%s · Digital Bookstore"` template (we don't want the brand name doubled on the home page) and a real `Link href="/books"` on the *Browse the catalog* button — small win, but it's the most SEO-relevant internal link on the site.

---

## 6. Core Web Vitals — LCP-optimized covers via `next/image`

`<CoverImage />` now has two render paths, chosen at request time:

| Condition | Render |
|---|---|
| `coverKey` set AND `R2_PUBLIC_BASE_URL` provisioned | `next/image` with `fill`, `sizes`, `priority?` |
| Either missing | The SUB-PR 1.1 typographic placeholder (unchanged) |

```tsx
<CoverImage title={book.title} coverKey={book.coverKey} priority />   // book detail (LCP)
<CoverImage title={book.title} coverKey={book.coverKey} />            // catalog grid (lazy)
```

**Why `priority` on the book detail page only:** the cover *is* the LCP candidate on `/books/[slug]` — a calm reading page where the cover is the largest above-the-fold element. `priority` opts the image into preload + no lazy-loading, eliminating LCP idle time. Catalog grids stay lazy-loaded (typical sub-LCP elements; lazy is correct).

**Allowlist (`next.config.ts`):**

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    { protocol: "https", hostname: "*.r2.dev" },
    { protocol: "https", hostname: "**.r2.dev" },
    ...buildCustomR2RemotePattern(),  // captures R2_PUBLIC_BASE_URL hostname at build time
  ],
},
```

Three deliberate properties:
- **Both `*` and `**`** for each R2 hostname family — `*` matches one subdomain level, `**` matches deeper. R2's `<bucket>.<account>.r2.cloudflarestorage.com` is two-level; we cover both shapes.
- **Build-time custom-CDN hostname capture.** If `R2_PUBLIC_BASE_URL` is set when the build runs, its hostname is parsed and added to the allowlist. An unparseable value is silently ignored — no build break.
- **Not `hostname: "**"`** (which would allow any HTTPS host). Tight allowlist; the worst case for a Next/Image proxy exfiltration is "only the hosts we've explicitly named at deploy."

**No CSP changes required.** The browser sees same-origin `/_next/image?…` URLs; the cross-origin fetch happens server-side in the Next.js image proxy, outside the browser CSP.

---

## 7. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings, **first cycle** |
| Typecheck | `npx tsc --noEmit` | ✅ Pass — `schema-dts` `Graph` type accepted the entity-discriminated array directly, no casts |
| Build | `npm run build` | ✅ Pass — `/sitemap.xml` correctly `○ Static`; every catalog classification unchanged |

The `safeQuery` warnings for unprovisioned DB continue to appear during the build (catalog list/slug queries) — gracefully handled as in every prior SUB-PR. `getBookSitemapEntries` now appears in that list because the sitemap function calls it at build time; same fallback path applies.

---

## 8. Files created / modified

```
src/lib/seo.ts                                    (new — getBaseUrl, getCoverImageUrl, buildBookJsonLd)
src/app/sitemap.ts                                (new — dynamic XML sitemap, ISR 1h)
src/components/cover-image.tsx                    (rewrite — Next/Image + priority + placeholder fallback)
src/app/books/[slug]/page.tsx                     (rewrite — JSON-LD + enhanced metadata + priority cover)
src/app/page.tsx                                  (rewrite — page metadata + Browse-the-catalog Link)
src/lib/db/queries/catalog.ts                     (+ getBookSitemapEntries + BookSitemapEntry type)
src/app/layout.tsx                                (+ metadataBase + OG/Twitter root defaults)
src/app/books/page.tsx                            (+ canonical + OpenGraph in metadata)
src/app/categories/[slug]/page.tsx                (+ canonical + OpenGraph in generateMetadata)
src/app/authors/[slug]/page.tsx                   (+ canonical + OpenGraph in generateMetadata)
next.config.ts                                    (+ images.remotePatterns)
.env.example                                      (R2_PUBLIC_BASE_URL — clarified for covers/public assets)
package.json                                      (+ schema-dts dev dep)
package-lock.json                                 (updated)
sub-pr-report/SUB_PR_3.1_REPORT.md                (new — this report)
```

---

## 9. Decisions / deviations worth surfacing

1. **One `@graph`, four entities, single `<script>`.** Crawler-friendlier than four separate JSON-LD scripts (cross-referenced `@id`s resolve in the same payload).
2. **`AggregateRating` deliberately omitted** per spec — Google rejects rich results when ratingValue is 0 / count < 1. Slots back in cleanly via `buildBookJsonLd` when 3.3 lands.
3. **`metadataBase` in root layout.** Every per-route metadata `url`, canonical, and image is now relative; Next absolutizes from one canonical origin. One thing to set in env (`NEXT_PUBLIC_APP_URL`); the entire metadata surface inherits it.
4. **`getCoverImageUrl` shared across `<CoverImage />` + `generateMetadata` + JSON-LD.** Single helper, one source of truth for "is there a cover URL or not?". When R2 is unprovisioned, *all three* paths gracefully fall back (placeholder render, OG image omitted, JSON-LD `image` field omitted).
5. **`priority` only on the book detail page cover.** It is the LCP candidate there; catalog grids should stay lazy-loaded. Adding a prop with `default = false` keeps every other call site unchanged.
6. **Build-time custom-CDN hostname capture in `next.config.ts`.** Reads `R2_PUBLIC_BASE_URL` once at build start, derives the hostname, adds to `remotePatterns`. Unparseable / unset env silently skips — no build break, no over-broad allowlist.
7. **Sitemap revalidates hourly** — matches catalog ISR. A new book is searchable in the sitemap within an hour of publish; no manual cache flush.
8. **Home page CTA wired to `/books`** via `<Button asChild><Link href="/books">…</Link></Button>`. Small but it's the highest-value internal link on the site for crawlers.
9. **First-cycle pass.** No SDK surprises this time — `schema-dts` v2 accepted the entity union cleanly, Next/Image's `priority` prop is stable, `MetadataRoute.Sitemap` is exactly the shape sitemap.ts returns.

---

## 10. Definition-of-done vs. SUB-PR 3.1 scope

- [x] `schema-dts` installed (dev).
- [x] JSON-LD on `/books/[slug]` with Organization + BreadcrumbList + Book + Product + Offer (AggregateRating deferred to 3.3 per spec).
- [x] `src/app/sitemap.ts` — dynamic, DB-backed, ISR-revalidated, `safeQuery`-resilient; accurate `lastModified` on books.
- [x] `metadataBase` + per-route `generateMetadata` enhancements: canonical, OpenGraph, Twitter Cards on `/`, `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]`.
- [x] `<CoverImage />` uses `next/image` with `priority` on above-the-fold render; typographic placeholder remains the fallback.
- [x] `next.config.ts` `images.remotePatterns` with build-time `R2_PUBLIC_BASE_URL` hostname capture.
- [x] `R2_PUBLIC_BASE_URL` placeholder is in `.env.example` and the comment clarifies its scope (covers/public, not private buckets).
- [x] Local verification — lint, tsc, build — all green; **every catalog classification still SSG/Static**.

**Out of scope (correctly deferred):**
- `AggregateRating` — needs reviews (SUB-PR 3.3).
- `robots.ts` / `/robots.txt` — defaults are sufficient; explicit declaration when we need fine-grained crawler rules.
- OG image for the home page — needs a brand asset; placeholder text-on-rectangle isn't worth shipping.
- Per-category / per-author OG images — same.
- `manifest.json` / PWA install hints — separate concern.
- I18n `<link rel="alternate" hreflang>` tags — F4 says English-first; revisit at i18n time.

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 3.2 — Blog / content hub.** `/blog` SSG + category hubs with internal linking (Roadmap §6, §13). Builds on the SEO surface this SUB-PR just established. Execution is **halted pending your explicit approval.**
