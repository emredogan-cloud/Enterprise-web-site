# SUB-PR 1.3 — Sample Viewer & Typography Integration — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.3.
> **Scope (verbatim):** *"HTML sample/excerpt on the book page (§5, §13; RICE row 'Sample/preview')."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green; `/books/[slug]` remains **● SSG** with the sample baked into the HTML payload.
> **Roadmap references consulted:** §5 (UX & trust), §7 (UI / typography), §13 (SEO — "the paywall-content problem").

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Typography plugin | `@tailwindcss/typography` installed as a dev-dep and **wired natively in Tailwind v4** via the `@plugin` directive in `globals.css` (no JS plugin-array hack). |
| `SampleViewer` component | `src/components/sample-viewer.tsx` — pure Server Component, renders an HTML excerpt inside `<article>` with our brand-tuned prose tokens. |
| Placeholder content | `src/lib/placeholders/book-sample.ts` — multi-paragraph, on-brand `Chapter 1 — On gathering` excerpt exercising h2, h3, p, and blockquote so the prose styles are visible end-to-end. |
| Book-detail integration | `/books/[slug]` now ends with a `Preview` section that renders the sample SSR-side, **in the static HTML payload**, with the SSG classification intact. |

---

## 2. The SEO-critical check (Roadmap §13) passed

§13 is explicit: *"the PDF itself isn't crawlable, so make book pages content-rich in HTML — full description, table of contents, an HTML sample excerpt, author bio, topics. This is what ranks."*

To honor that, the sample must be:
1. **In the rendered DOM** at SSG/render time — *not* loaded client-side after hydration.
2. **Indexable** — present in the same HTML payload Google fetches on first request.
3. **Not** a regression on the SSG classification of `/books/[slug]`.

All three hold:

- `SampleViewer` is a Server Component. It uses `dangerouslySetInnerHTML` to inject the HTML string into the article at render time. No client fetching, no `"use client"` directive, no Suspense bailout.
- The book-detail page receives `sampleHtml` synchronously (currently the placeholder constant; future R2 fetch resolves at SSG time too).
- The build classification stayed `● /books/[slug]`:

```
Route (app)             Revalidate  Expire
┌ ○ /
├ ƒ /admin
├ ● /authors/[slug]
├ ○ /books                      1h      1y
├ ● /books/[slug]                                  ← still SSG with the sample baked in
├ ● /categories/[slug]
└ ƒ /search
```

---

## 3. Tailwind v4 typography integration

Tailwind v4 is CSS-first; plugins load via the `@plugin` directive, not a JS `plugins: [...]` array. The wiring in `src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@config "../../tailwind.config.ts";

/*
  Tailwind v4 plugin: @tailwindcss/typography — generates the `prose` /
  `prose-*` utility families used by the SampleViewer for long-form
  reading content (Roadmap §13 — "paywall-content problem" fix).
*/
@plugin "@tailwindcss/typography";
```

No other config change was needed — `@plugin` registers the `prose-*` utility families and is picked up by Turbopack during the build (the build output reflects this; the `/books/[slug]` page generated without errors and the prose classes are present in the compiled CSS).

This is the **v4-native** wiring; the v3-era `plugins: [require('@tailwindcss/typography')]` in the JS config would also work via our `@config` directive, but the `@plugin` form is the right idiom for new v4 projects.

---

## 4. Brand-tuned prose — calm, literary, typography-forward

Default `prose` is good; default-with-our-brand is better. The `SampleViewer` applies:

```ts
const PROSE_CLASSES = [
  "prose prose-lg prose-stone dark:prose-invert",        // warm stone theme, dark-mode safe
  "max-w-prose mx-auto",                                  // 68ch reading column (our token)
  "prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight",
  "prose-blockquote:font-serif prose-blockquote:border-l-primary prose-blockquote:not-italic prose-blockquote:text-foreground/90",
  "prose-a:text-primary",
];
```

| Override | Why |
|---|---|
| `prose-stone` | Warm, paper-toned grey (matches our literary palette better than the default `prose-gray`). |
| `dark:prose-invert` | Free dark-mode inversion of the prose tones; lights up the `.dark` class chain we wired in SUB-PR 0.1. |
| `max-w-prose` | Uses our **68ch** token from `tailwind.config.ts` — slightly more generous than the prose plugin's default 65ch; reads calmer. |
| `prose-headings:font-serif font-medium tracking-tight` | Headings inside the article render in `Fraunces` at a calm medium weight — matches the `h1`/`h2` styling used elsewhere on the site. Not bold, not theatrical. |
| `prose-blockquote:font-serif not-italic border-l-primary` | The default italic blockquote reads as "look at me!"; serif-upright + an evergreen-accent rule reads as "consider this." Calm, on-brand. |
| `prose-a:text-primary` | Inline links pick up the accent — deliberate, not noisy. |

The resulting article is visually consistent with the rest of the site: the same fonts, the same accent, the same reading measure.

---

## 5. Placeholder strategy — graceful, on-brand, and visible

The DB is currently unprovisioned and R2 doesn't serve real files yet. `book.sampleKey` will be null until the first real sample is uploaded. Without a fallback the Preview section would either crash or render blank — both bad.

**Solution (matches the user's "well-formatted, multi-paragraph placeholder excerpt" requirement):**

- A dedicated constant `PLACEHOLDER_SAMPLE_HTML` lives in `src/lib/placeholders/book-sample.ts`.
- The content is a real, calm, on-brand "Chapter 1 — On gathering" excerpt — literary, in our voice, about ownership-without-DRM (which is, conveniently, the bookstore's own positioning).
- It exercises every prose element the rest of the catalog will want to style: `<h2>`, `<h3>`, `<p>`, `<blockquote>` — so a designer reviewing the book page sees the full typography vocabulary in one screen.
- The book-detail page wires the future R2 path *next to* the placeholder so the future swap is a two-line, conflict-free change:

```ts
/*
 * Sample resolution (Roadmap §13 — SEO-critical):
 *   …Once R2 sample-fetching is wired in a follow-up, this becomes:
 *
 *     const sampleHtml = book.sampleKey
 *       ? await fetchSampleFromR2(book.sampleKey)
 *       : PLACEHOLDER_SAMPLE_HTML;
 */
const sampleHtml = PLACEHOLDER_SAMPLE_HTML;
```

When R2 sample-fetching lands, the placeholder remains the explicit no-sample fallback.

---

## 6. Trust-input policy & `dangerouslySetInnerHTML`

`SampleViewer` uses `dangerouslySetInnerHTML` because the source content is **HTML**, not React JSX. That is the only safe way to inject markup into the article at render time without a Markdown/HTML parser dep (we deliberately avoided adding `remark` / `marked` for SUB-PR 1.3 to stay minimal — see §USER_PROFILE).

**Input is controlled:** the only source today is our own placeholder constant; once R2 serves real samples, the source is a private bucket we control through the admin ingest flow. If we ever accept user-submitted HTML (e.g., review bodies with markup), we will add a sanitizer (`DOMPurify` on the way in) — that is *not* a 1.3 concern. The TSDoc on the component records this policy.

`eslint-config-next` does not enable `react/no-danger` by default, so no lint disable is required (a preemptive `eslint-disable-next-line` flagged "unused directive" on the first run — I removed it; the final code is comment-free).

---

## 7. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — **zero warnings** (after removing the preemptive unused `eslint-disable-next-line`). |
| Typecheck | `npx tsc --noEmit` | ✅ Pass |
| Build | `npm run build` | ✅ Pass — `/books/[slug]` is **● SSG** (table in §2); every other route classification unchanged. |

`safeQuery` warnings still appear during build (DB unprovisioned) — same graceful-empty-states behavior as 1.1 and 1.2. The build still produces the right route table.

Same benign `MODULE_TYPELESS_PACKAGE_JSON` cosmetic note on `tailwind.config.ts` as in every prior SUB-PR.

---

## 8. Files created / modified

```
src/app/globals.css                       (+ @plugin "@tailwindcss/typography";)
src/components/sample-viewer.tsx          (new — Server Component, prose-tuned)
src/lib/placeholders/book-sample.ts       (new — multi-paragraph on-brand excerpt)
src/app/books/[slug]/page.tsx             (+ Preview section, − old "Buy flow…" scaffold note)
package.json                              (+ devDep @tailwindcss/typography)
package-lock.json                         (updated)
sub-pr-report/SUB_PR_1.3_REPORT.md        (new — this report)
```

---

## 9. Decisions / deviations worth surfacing

1. **`@plugin "@tailwindcss/typography";` in CSS** — the v4-native wiring. The v3 alternative (JS `plugins: [...]` in `tailwind.config.ts` via `@config`) would also work but is the older idiom; we picked the v4-correct path on a new 2026 project.
2. **HTML, not Markdown** — `SampleViewer` accepts an HTML string. Markdown support would require a parser dep (`remark` / `marked`), which is out of scope for 1.3. The component is the single swap-point if we ever need it.
3. **Placeholder content is real prose, not lorem-ipsum** — exercises every prose element AND reads as a credible book opening. Costs nothing and gives the page real weight while we wait on real catalog data.
4. **`prose-stone` over `prose-gray`** — warmer, closer to the paper-and-ink palette we set in SUB-PR 0.1.
5. **`max-w-prose` uses our 68ch override** from `tailwind.config.ts` — slightly more generous than the prose plugin's 65ch default. Calmer reading.
6. **Removed the SUB-PR 1.1 "Buy flow lands…" footnote** from the book-detail page — the Preview section makes the page feel substantively complete; the scaffold note no longer earned its place. Buy CTA arrives in 1.4/1.5 anyway.
7. **`SampleViewer` has its own `className` prop** — the page can position it (e.g., `mt-8`) without leaking layout concerns into the component's defaults.

---

## 10. Definition-of-done vs. SUB-PR 1.3 scope

- [x] `@tailwindcss/typography` installed and wired with the **v4-native** `@plugin` directive.
- [x] `SampleViewer` Server Component — renders an HTML string inside `<article class="prose …">` with our calm-literary overrides.
- [x] Integrated into `src/app/books/[slug]/page.tsx` as a "Preview" section.
- [x] Graceful placeholder fallback when `book.sampleKey` is missing.
- [x] **CRITICAL SEO REQUIREMENT met (§13):** sample text is in the HTML DOM at SSG time — no client fetching.
- [x] Local verification — lint (zero warnings), tsc, build — all green; **`/books/[slug]` remains ● SSG**.

**Out of scope (correctly deferred):**
- R2 fetching of real sample files (the swap-point is wired and documented).
- Markdown support (no parser dep added).
- HTML sanitization for user-submitted markup (curated catalog content is controlled).
- ToC / "What's inside" structured content (lands in SEO-hardening SUB-PR 3.1).

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 1.4 — Cart.** Multi-item à-la-carte cart (Roadmap §4 + §9 fulfillment pipeline). Execution is **halted pending your explicit approval.**
