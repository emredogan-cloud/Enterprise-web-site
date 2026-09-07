# Valice Press — Mobile Current-State Audit

**Date:** 2026-09-04
**Branch:** `feat/production-readiness`
**Auditor:** mobile UX / responsive frontend agent
**Status:** AUDIT ONLY — no production code was modified.

Companion document: [`MOBILE_OPTIMIZATION_MASTER_ROADMAP.md`](./MOBILE_OPTIMIZATION_MASTER_ROADMAP.md)
Screenshot baseline: [`./baseline/`](./baseline/) — 59 true-device captures, 392 px wide (1×).

---

## 1. Method, and what this audit does and does not claim

Every number below was measured, not estimated. Two measurement surfaces were used:

| Surface | What it was used for |
| --- | --- |
| **Physical Redmi Note 8 (2021)** over USB → ADB → Chrome DevTools Protocol | Layout geometry, tap-target sizes, computed styles, font resolution, overflow, screenshots |
| **`https://valicepress.com` (production)** loaded on that same device | Core Web Vitals, payloads, request counts |

Local measurement ran against `next dev` on the laptop, reverse-proxied to the phone
(`adb reverse tcp:3000 tcp:3000`), so the phone loaded `http://localhost:3000` as a first-party origin.

**Two corrections made during the audit, recorded so the numbers can be trusted:**

1. An early font-coverage probe reported that *no* webfont was loading and that Turkish fell back to
   Roboto. The dev server had died mid-run; the probe was measuring an error page. Re-run against a
   confirmed-healthy server, **Turkish renders correctly in Geist and Fraunces**. The false finding is
   not carried forward.
2. An early set of screenshots used `captureBeyondViewport`, which tiles the page and repaints
   `position: sticky` elements per tile — the header and hero appeared duplicated. All baseline
   captures were redone with real scroll-and-capture at the device viewport.

**Not measured on-device (6 of 29 route patterns):** `/admin`, `/admin/books/[slug]/edit`,
`/order/[id]`, `/read/[bookId]`, `/blog/tag/[slug]`, `/codex-enigmatica/verify` — these are auth-gated
or require a live ID. They were audited by source reading only. Findings that touch them are marked
**(source-only)**.

Performance numbers come from production because `next start` cannot boot locally
(`@clerk/nextjs: Missing publishableKey` — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is absent from
`.env.local`; the root layout guards for this but `src/proxy.ts` does not). This is a local-env gap,
not a mobile defect, and is out of scope here.

---

## 2. Device and browser state

The Redmi is connected, authorised, and fully drivable. This is the primary QA target.

| Property | Value |
| --- | --- |
| Model | `M1908C3JGG` — **Redmi Note 8 (2021)**, codename `biloba` |
| Manufacturer | Xiaomi |
| Android | 11 (SDK 30) |
| Physical screen | 1080 × 2340 px, 440 dpi |
| **CSS viewport** | **392 × 718 px** (773 px tall with the URL bar collapsed) |
| **devicePixelRatio** | **2.75** |
| `visualViewport.width` | 393 px |
| Browser | **Chrome 152.0.7977.65** (Android) |
| System WebView | 151.0.7922.199 |
| ADB | 1.0.41 / 37.0.0-14910828, at `/home/emre/Android/Sdk/platform-tools/adb` |
| USB id | `2717:ff48` Xiaomi Mi/Redmi series (MTP + ADB) |
| Serial | `AYXSUKIVJVPZ7HPZ` |

**Confirmed working connection method** (this is the method the roadmap depends on):

```bash
export PATH=$PATH:/home/emre/Android/Sdk/platform-tools
adb devices -l                                  # device must show "device", not "unauthorized"
adb reverse tcp:3000 tcp:3000                   # phone's localhost:3000 -> laptop's dev server
adb shell am start -a android.intent.action.VIEW \
  -d "http://localhost:3000/" com.android.chrome
adb forward tcp:9222 localabstract:chrome_devtools_remote
curl -s http://localhost:9222/json/list          # page targets + webSocketDebuggerUrl
```

From there, CDP over a WebSocket (Node 24 has a global `WebSocket`, no dependency needed) gives
`Page.navigate`, `Runtime.evaluate`, `Page.captureScreenshot`, `CSS.getPlatformFontsForNode`,
`Network.emulateNetworkConditions`. The audit harness built on this lives in the session scratchpad;
the roadmap's Phase 0 makes it a committed script.

**Caveat learned the hard way:** `adb reverse` survives, but the Next dev server died twice mid-sweep.
Any automated device run must assert `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`
returns `200` *between* routes, or it will silently capture error pages. A `scrollHeight` exactly equal
to `innerHeight` is the tell.

---

## 3. Responsive architecture as it actually is

**Stack:** Next.js 16.2.6 (App Router, Turbopack), React 19.2.4, Tailwind CSS v4 (CSS-first tokens in
`src/app/globals.css`, typed config in `tailwind.config.ts`), 143 components under `src/components/`.

**Two visual systems, one of which is dead code on mobile:**

- `src/components/site-header.tsx` — the warm "calm-literary" header mounted in the root layout.
- `src/components/home/cinematic-header.tsx` — the dark cinematic header.
- `globals.css` hides the first whenever the second's scope is present:
  ```css
  body:has(.cinematic-root) > header { display: none; }
  ```

**26 route files carry `.cinematic-root` and render `CinematicHeader`** — including the `(legal)` and
`codex-enigmatica` layouts. That is every route in the app. **`SiteHeader` is therefore never visible
in production.** Any mobile-navigation work must target `CinematicHeader`; changing `SiteHeader` would
change nothing a user sees.

**Verdict on maturity: *partially mobile, mobile-first in syntax, desktop-first in composition.***
The base (unprefixed) styles are the small-screen styles, which is the correct Tailwind idiom, and the
result is genuinely free of horizontal overflow. But the base layer was largely inherited from the
desktop composition rather than designed for 392 px: fixed flex rows that only fit a wide viewport,
section padding that grows rather than shrinks at small sizes, and a navigation that simply disappears.

---

## 4. Breakpoints

Tailwind v4 defaults are unchanged — no custom `--breakpoint-*` tokens are defined. Effective scale:
`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`.

Usage across all `.tsx` in `src/`:

| Prefix | Min-width | Occurrences |
| --- | --- | --- |
| `sm:` | 640 px | **346** |
| `lg:` | 1024 px | **169** |
| `xl:` | 1280 px | 14 |
| `md:` | 768 px | **2** |
| `2xl:` | 1536 px | 0 |

Only **two** `md:` usages exist in the entire codebase:

- `src/components/cinematic/cinematic-hero.tsx:101` — a size token, not a breakpoint decision.
- `src/components/home/cinematic-header.tsx:104` — `hidden … md:flex`, the primary nav. This single
  declaration is the cause of finding **P0-1**.

**Consequence:** the layout has two designed states — "below 640" and "1024 and up" — and the
**640–1023 px band is undesigned**. Tablet portrait (768 px) and large-phone landscape both land in it.

Custom media queries in `globals.css`: exactly one, `@media (prefers-reduced-motion: reduce)`.
There is **no `@media (hover: hover)` guard anywhere**, against 268 `hover:` utilities and 60
`group-hover:` utilities — so hover styles resolve on touch (sticky-hover) on every card and link.
Only one `group-hover` actually *reveals* content that is otherwise invisible
(`settings/profile-actions.tsx:90`, an avatar overlay), so the damage is cosmetic rather than
functional, but it is systemic.

**Container widths:** `max-w-[1320px]` (29 uses) is the house page container, with `max-w-[1440px]`
on the catalog and `max-w-7xl` on both headers. Gutters are `px-4 sm:px-6` on most routes but a flat
`px-6` on the catalog shell and several book-detail sections — an inconsistency worth normalising.

---

## 5. Route inventory

29 `page.tsx` route patterns. **23 measured on-device**, 6 source-only.

| Route | Type | Device-measured | Page height on Redmi | Screens (÷718) |
| --- | --- | --- | --- | --- |
| `/` | Static | ✅ | 7 052 px | 9.8 |
| `/books` | Static | ✅ | 3 767 px | 5.2 |
| `/ebooks` | Static | ✅ | 3 499 px | 4.9 |
| `/books/[slug]` | SSG | ✅ ×3 | 6 062 px | 8.4 |
| `/categories` | Static | ✅ | 2 680 px | 3.7 |
| `/categories/[slug]` | SSG | ✅ ×2 | 2 313 px | 3.2 |
| `/authors` | Static | ✅ | 2 247 px | 3.1 |
| `/authors/[slug]` | SSG | ✅ ×2 | — | — |
| `/blog` | Static | ✅ | 6 487 px | 9.0 |
| `/blog/[slug]` | SSG | ✅ ×2 | **9 811 px** | **13.7** |
| `/blog/category/[slug]` | SSG | ✅ | — | — |
| `/blog/tag/[slug]` | SSG | ⛔ source-only | — | — |
| `/search` | Dynamic | ✅ | 3 306 px | 4.6 |
| `/cart` | Dynamic | ✅ | 2 548 px | 3.5 |
| `/companion/[slug]` | SSG | ✅ | 3 730 px | 5.2 |
| `/about` | Static | ✅ | 5 739 px | 8.0 |
| `/account/library` | Dynamic | ✅ | 1 971 px | 2.7 |
| `/account/orders` | Dynamic | ✅ | — | — |
| `/account/settings` | Dynamic | ✅ | — | — |
| `/terms` `/privacy` `/refund` `/kvkk` `/unsubscribe` | Static | ✅ ×5 | 6 234 px (terms) | 8.7 |
| `/order/[id]` | Dynamic | ⛔ source-only | — | — |
| `/read/[bookId]` | Dynamic | ⛔ source-only | — | — |
| `/admin`, `/admin/books/[slug]/edit` | Dynamic | ⛔ source-only | — | — |
| `/codex-enigmatica/verify` | Static | ⛔ source-only | — | — |

Also present: 12 API routes and `/companion/[slug]/sheets/[sheet]` (a file route, not a page).
`/genres` permanently redirects to `/categories` (`next.config.ts`).

---

## 6. Findings

Severity per the brief: **P0** cannot use the page/function · **P1** major visual/function problem ·
**P2** noticeable UX degradation · **P3** polish.

### P0 — 1 finding

#### P0-1 · There is no mobile navigation on any route

`src/components/home/cinematic-header.tsx:104`

```tsx
<nav aria-label="Primary" className="ml-6 hidden items-center gap-7 text-sm md:flex">
```

The primary nav — **All books, Ebooks, Authors, Categories, Blog, Library, About** — is hidden below
768 px. There is no hamburger, no drawer, no bottom bar, no overflow menu. A codebase-wide search for
`hamburger|mobile-menu|drawer|MenuIcon|Sheet` returns **zero** matching components (all hits are
false positives: a Web Share sheet, printable practice sheets, a decorative fog sheet).

On the Redmi at 392 px the header offers exactly four controls: the wordmark (→ `/`), a search icon,
a cart icon, an account control. **Every browse destination on the site is unreachable from the
header.** A visitor can reach a book only via on-page links or search.

Because `SiteHeader` is hidden on all 26 cinematic routes, its own `hidden … sm:flex` nav (Books, Blog)
is not a fallback — it never renders.

Measured on production: `hasMenuButton: false` on `/`, `/books`, and `/blog/hangul-stroke-order`.
For contrast, **all four commercial reference sites measured on the same device expose a menu button**
(§10).

*Desktop impact of fixing: none, if the fix is additive below `md:`.*

---

### P1 — 6 findings

#### P1-1 · Five forms collapse their input to ~20 px tall on mobile

Measured on-device on `/`:

```json
{ "input": { "w": 279, "h": 20, "cssHeight": "19.6364px", "flex": "1 1 0%",
             "flexBasis": "0%", "classes": "h-12 flex-1 rounded-full …" },
  "form":  { "direction": "column", "gap": "12px" },
  "submitButton": { "w": 279, "h": 48 } }
```

**Root cause.** The container is `flex flex-col gap-3 sm:flex-row`. The input carries `h-12 flex-1`.
In a **column** flex container the main axis is vertical, so `flex-1`'s `flex-basis: 0%` applies to
*height* and defeats `h-12`. The input renders at its line-height (19.6 px) next to a correctly-sized
48 px button. At `sm:` and above `flex-row` makes the main axis horizontal, `flex-basis` governs width
again, and the bug vanishes — which is why it has never been visible on desktop.

Five instances of the same pattern:

| File | Line | Classes | Consequence |
| --- | --- | --- | --- |
| `components/home/newsletter-section.tsx` | 92 | `h-12 flex-1` | Homepage newsletter capture — **verified 19.6 px** |
| `components/article/author-newsletter-strip.tsx` | 135 | `h-11 flex-1` | Newsletter capture on every blog article |
| `components/codex/verify-form.tsx` | 101 | `h-12 flex-1` | **(source-only)** the code entry that gates the Codex feature |
| `components/codex/verify-form.tsx` | 245 | `h-11 flex-1` | **(source-only)** secondary capture |
| `components/companion/companion-signup.tsx` | 92 | `min-w-0 flex-1` + `py-3` | Padding-only, so it collapses to ~26 px rather than 20 px |

This is the single highest-value fix in the audit: it is a one-token change per site, has zero desktop
regression risk, and it currently breaks the site's primary retention mechanism.

#### P1-2 · Category card titles overflow their box on all six cards

`src/components/categories/category-card.tsx:74` puts the icon badge, the title block and the arrow
button in one flex row: `absolute inset-x-0 bottom-0 flex items-end gap-3 p-4`. At 392 px the card is
**172 × 230 px**, and after 32 px padding, a ~36 px badge, a ~28 px arrow and two 12 px gaps, the title
gets **47 px of width**. Computed styles are `overflow-wrap: normal; word-break: normal; hyphens: manual`,
so a long word cannot break — it paints outside its box, over the book-count label and the arrow.

Measured on-device, all six cards:

| Category | Widest word | Word width | Box width | Overhang |
| --- | --- | --- | --- | --- |
| Classics & Philosophy | "Philosophy" | 97 px | 47 px | **+50 px** |
| Puzzle & Challenge | "Challenge" | 86 px | 47 px | +39 px |
| Language & Learning | "Language" | 83 px | 47 px | +37 px |
| Young Explorers | "Explorers" | 84 px | 47 px | +37 px |
| Myth & Folklore | "Folklore" | 72 px | 47 px | +25 px |
| Games & Play | "Games" | 59 px | 47 px | +12 px |

The brief's §14 states the fixed hierarchy — real book covers **plus a clear category title** — must
not regress into title/cover collision. **It has regressed, at mobile widths only.** Desktop is
unaffected: `sm:aspect-[5/4]` and the wider card give the title room.

Baseline evidence: `baseline/categories-fold1.webp`, `categories-fold2.webp`.

*Note: the h3's **box** does not geometrically intersect the badges — an early box-intersection test
returned "no overlap" and was misleading. The overflow is of **ink**, not of the box. Verified via
`scrollWidth` vs `clientWidth` and per-word canvas measurement.*

#### P1-3 · `/books` buries the catalog under a hero and a full filter panel

`src/components/catalog/catalog-shell.tsx:300` — `grid … lg:grid-cols-[300px_minmax(0,_1fr)]`. Below
1024 px the grid collapses to one column and `FilterSidebar` (`h-fit`, `lg:sticky`) stacks **above**
the results. There is no drawer, no collapse, no "Filters" button.

On the Redmi the reader scrolls past: the `CATALOG` eyebrow → the "All books" hero → the entire filter
panel (search-within, six category checkboxes, price range, sort) → "Showing 1-7 of 7 books" → and only
then the first book cover, roughly **1.5 screens down**. The catalog contains **7 books**; the filter
panel is longer than the thing it filters.

Baseline evidence: `baseline/catalog-fold1.webp`, `catalog-fold2.webp`.

#### P1-4 · The price range slider is a 4 px target — a WCAG 2.2 AA failure

`globals.css:736` sets `.catalog-range { height: 4px }` with a `16px` thumb. Measured on-device the
input's box is **295 × 4 px**; the draggable thumb is 16 × 16 px.

WCAG 2.2 SC 2.5.8 (Level AA) requires 24 × 24 CSS px. None of the five exceptions rescue it: it is not
inline, not user-agent-controlled, not essential, and there is **no equivalent control** — the range
input is the only way to set a price filter. This is a conformance failure, and on a finger it is close
to undraggable.

#### P1-5 · Homepage LCP is 5.9 s on the real device

Measured on `https://valicepress.com/` from the Redmi, cache disabled, CDP network emulation at
**1.6 Mbps down / 70 ms RTT**:

| Route | TTFB | FCP | **LCP** | CLS | Requests | JS | CSS | Fonts | Images | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | — | — | **5 916 ms** | **0** | 61 | 250 KB | 25 KB | 104 KB | 251 KB → 634 KB¹ | ~1 046 KB¹ |
| `/books` | 118 ms | 1 560 ms | **1 560 ms** | **0** | 76 | 271 KB | 25 KB | 104 KB | 573 KB¹ | ~1 051 KB¹ |
| `/books/meditations` | 126 ms | 1 672 ms | **3 052 ms** | **0** | 56 | 262 KB | 25 KB | 104 KB | 92 KB | ~518 KB |

¹ Images measured twice: at initial viewport, and after one 600 px scroll. The homepage loads 251 KB of
images before any scroll and 634 KB after one.

**LCP element on `/` is a text node** — `SPAN.block` containing **"Read it anywhere."**, the third line
of the hero headline. Diagnosis from the resource timeline:

- Fonts download from 1 027 ms to **3 043 ms** (4 files, 104 KB).
- The hero image finishes at 3 421 ms; the largest book cover at 4 250 ms.
- The last JS response lands at **11 623 ms**.
- At 1.6 Mbps, ~1 046 KB cannot transfer in under **~5.2 s** — which is essentially the measured LCP.

So the homepage LCP is **bandwidth-bound**, not blocked by a single asset. The fix is payload and
priority, not a one-line preload.

**CLS is 0 on all three routes** — genuinely good, and worth protecting through any change.

`web.dev` thresholds (checked 2026-09-04): LCP good ≤ **2.5 s**, INP ≤ **200 ms**, CLS ≤ **0.1**, all at
the **75th percentile**. INP was not measured — no scripted interaction pass was run; it belongs in
Phase 0.

#### P1-6 · Dark pages sit on a near-white canvas, with no browser-chrome integration

Measured on `/`, `/books`, `/cart`, `/terms`:

```json
{ "htmlBg": "rgba(0, 0, 0, 0)", "bodyBg": "lab(99.2132 -0.128955 1.51819)",
  "themeColorMeta": null, "colorScheme": "normal", "htmlOverscroll": "auto" }
```

Three separate consequences of one root cause — the dark theme is a scoped `div`, not a document-level
theme:

1. `<html>` is transparent, so Chrome propagates **`body`'s near-white background to the canvas**.
   Overscroll / rubber-band at either end of any dark page flashes white.
2. **No `theme-color` meta** — the Android Chrome address bar stays light above a near-black page.
   There is no `export const viewport` anywhere in `src/` (0 files).
3. **`color-scheme: normal`** — native controls render light-mode. The site uses `<select>` elements
   (`catalog-toolbar`, `authors-shell:93`, `orders-filter-bar:105`), whose dropdown popups will render
   as light UI over a dark page.

`.cinematic-root` currently covers the viewport on all pages tested (content is tall enough), so the
"short page shows a white band" case is **latent, not active**. It becomes active on any short or
empty-state route.

---

### P2 — 9 findings

| # | Finding | Evidence |
| --- | --- | --- |
| **P2-1** | **Comfort-size tap targets.** Header icon controls are `h-9 w-9` = **36 × 36 px**; cart quantity buttons `h-8 w-8` = **32 × 32 px**. Both pass WCAG 2.5.8 (≥24) but sit under the 44–48 px commonly recommended for primary touch controls. 4–21 targets per route fall in the 24–44 px band. | Measured, every route |
| **P2-2** | **Type below 12 px.** 10 px and 11 px uppercase labels with `tracking-[0.2em]`–`[0.3em]`: 11 instances at 10 px on `/` alone (e.g. the "1 book" category count), 4–15 instances at 11 px per route; 30 sub-12.5 px text nodes on a book detail page. | Measured, every route |
| **P2-3** | **Vertical rhythm scales the wrong way.** `py-24` (96 px) at base rising to `sm:py-28`/`sm:py-32`; 7 sections use `py-16`+ at mobile with no smaller base; 18 unprefixed `mt-16`/`mt-20`/`mt-24`. Result: `/` is **9.8 screens**, `/blog/[slug]` **13.7 screens**, `/terms` **8.7 screens** on a 718 px viewport. | Measured |
| **P2-4** | **Blog article line-height is tight.** Production `/blog/hangul-stroke-order`: body 18 px with **24.375 px** line-height = **1.35**. Standard Ebooks, measured on the same device, uses 19.36 px / 29.04 px = **1.50**. | Measured |
| **P2-5** | **The 640–1023 px band is undesigned.** `md:` used twice; tablet portrait (768 px) inherits phone layout, including 2-column card grids on a 768 px screen. | Static analysis |
| **P2-6** | **Korean falls back to a system CJK face.** `CSS.getPlatformFontsForNode` on the device: `원고지 한글` → `Noto Sans CJK SC (system)` / `Noto Serif CJK SC (system)`, with Geist/Fraunces covering only the Latin remainder. It renders, but in a **Simplified-Chinese** face rather than a Korean one, and would tofu on a device without Noto CJK. Turkish (`ğ ş İ ı ö ü ç`) is **fully covered** by both webfonts — verified, 31/31 glyphs. | Measured |
| **P2-7** | **iOS Safari will zoom on focus.** All four content-facing `<input>` elements are `text-sm` (14 px). Safari zooms the viewport when a focused input's font-size is below 16 px. **Untested — no iOS device available**; flagged as a compatibility risk, not a confirmed defect. | Static analysis |
| **P2-8** | **No skip link.** No "skip to content" control anywhere in `src/`. 27 files render `<main>`, so landmark navigation exists for screen readers, but keyboard users have no bypass (WCAG 2.4.1). | Static analysis |
| **P2-9** | **Inconsistent gutters.** Most routes use `px-4 sm:px-6`; `catalog-shell.tsx:300` and several book-detail sections use a flat `px-6`, giving the catalog 8 px less content width than the rest of the site at 392 px. | Static analysis |

---

### P3 — 4 findings

| # | Finding | Evidence |
| --- | --- | --- |
| **P3-1** | **Safe-area insets are inert.** Measured on-device: `env(safe-area-inset-top/bottom/left)` all resolve to **`0px`**, because the viewport meta is Next's default `width=device-width, initial-scale=1` with no `viewport-fit=cover`. Low impact on this device in portrait; matters for notched hardware and for any future sticky bottom bar. | Measured |
| **P3-2** | **Carousels rely solely on a peeking card.** `cart-shelf-track` sets `::-webkit-scrollbar { height: 0 }` and `scrollbar-width: none`; the arrows are `hidden … sm:flex`. Affordance therefore rests entirely on partial-card visibility — which *does* work: `library-books-grid.tsx:74` uses `w-[42vw]` = 165 px at 392 px, so two cards plus a peek. Correct as designed; noted so a future change does not remove the peek. | Measured + source |
| **P3-3** | **Greek would fall back.** `Δελτα Ελληνικά` resolves to `Roboto (system)` on-device. No Greek content ships in `src/` today, so this is latent — but the Greek Alphabet Workbook is a known future title. | Measured |
| **P3-4** | **Reveal-on-scroll inverts on hydration.** `reveal-on-scroll.tsx` adds `data-reveal=""` in `useEffect`, and `globals.css:422` sets `[data-reveal] { opacity: 0 }`. SSR HTML renders visible, then hydration hides it until the IntersectionObserver fires. Failure mode is safe (no JS → stays visible), but on a slow device this can flash. Reduced-motion is correctly honoured — the observer is skipped entirely. | Source + measured CSS |

---

## 7. What is already right, and must not regress

Stated plainly, because the roadmap must protect these:

- **Zero horizontal overflow on all 23 measured routes.** Document scroll width exceeds client width by
  at most 1 px (rounding) everywhere. The decorative atmosphere layers are correctly built as
  `pointer-events-none fixed inset-0 -z-10 overflow-hidden`, so the 1 100–1 440 px glow ellipses clip
  instead of pushing the page wide. This is unusually well done and is easy to break.
- **CLS = 0** on all three production routes measured.
- **The image system is sound.** `next/image` in 9 components with exactly one raw `<img>` in the tree
  (and that one is a deliberate CSS background). `sizes` is set on 20 call sites; `priority` is set on
  the book-detail hero, article hero, and the first three featured cards.
- **Reduced motion is respected** — both a global CSS rule and a JS guard in `reveal-on-scroll`.
- **Turkish typography is correct** in both webfonts.
- **Focus styling exists** — a global `.cinematic-root *:focus-visible` emerald ring plus 22 explicit
  `focus-visible:` utilities.
- **Form feedback is announced** — 29 `aria-live` / `role="alert"` / `role="status"` usages.
- **Carousel arrows are correctly hidden on touch** and correctly sized (44 px) where shown.

---

## 8. Touch interaction summary

Interactive elements per route and their sizes, measured on-device:

| Route | Total targets | < 24 px | 24–44 px |
| --- | --- | --- | --- |
| `/` | 41 | 21 | 4 |
| `/books` | 59 | 20 | **19** |
| `/ebooks` | 55 | 20 | 17 |
| `/search` | 53 | 18 | 10 |
| `/cart` | 48 | 18 | 9 |
| `/blog/[slug]` | — | 26–29 | 14–15 |
| `/books/[slug]` | — | 20 | 4–7 |
| legal routes | ~40 | 23–24 | 4 |

**The dominant sub-24 px population is the footer link list** (`home-footer.tsx:107`), at 18 px tall —
"All Books", "Bestsellers", "New Releases", "Categories", "Blog", and so on, repeated on every route.

**These footer links pass SC 2.5.8** via the spacing exception, and the audit says so rather than
inflating the count: the list is `space-y-3` (12 px), so link centres are 30 px apart; 24 px-diameter
circles centred on each need only 24 px of separation, and they neither intersect each other nor the
adjacent bounding boxes. They are a *comfort* problem, not a conformance failure.

The genuine conformance failures are **P1-4** (4 px slider) and **P1-1** (20 px input) — both are bugs
rather than deliberate sizing.

Blog-article TOC links (`reading-sidebar.tsx:146`, 17–18 px tall at `space-y-3`) pass by the same
spacing arithmetic. The reading sidebar is **not** hidden on mobile — it has no `hidden lg:block` — so
its position in the mobile flow should be reviewed in Phase 6.

---

## 9. Desktop regression concerns

Every P0/P1 fix proposed in the roadmap is gated *below* a breakpoint that desktop never sees, with one
exception. Ranked by risk:

| Change | Desktop risk | Why |
| --- | --- | --- |
| Add a mobile menu below `md:` | **None** | Purely additive; the `md:flex` nav is untouched. |
| `flex-1` → `w-full sm:flex-1` on the five inputs | **None** | At `sm:` and up the computed style is identical (`flex-basis: 0%` on a row axis). Verify by computed-style diff, not by eye. |
| Category card info-row stacking below `sm:` | **None** | `sm:aspect-[5/4]` and the current row layout stay as-is at ≥640 px. |
| Filter drawer below `lg:` | **Low** | `lg:grid-cols-[300px_1fr]` is preserved; the risk is the sidebar's `lg:sticky lg:top-24` behaviour if the element is re-parented. Keep it in the same DOM position and toggle presentation only. |
| Price slider hit area | **Low** | Enlarging the touch target via an invisible padded wrapper or `::-webkit-slider-runnable-track` height changes desktop visuals if done on the visible track. Prefer a transparent hit-area expansion. |
| `theme-color` + `color-scheme: dark` + document background | **Medium — the only real one** | This is document-level, not breakpoint-scoped. `color-scheme: dark` changes native control rendering on **desktop too**, and setting an explicit dark `html` background affects every viewport. Must be verified on the desktop baseline, not just the phone. |
| Reduce mobile section padding | **None** | Only touches unprefixed values, with `sm:` values kept. |
| Type scale changes | **None if `sm:`-gated** | Raising the 10–11 px labels must not change the `sm:` and `lg:` sizes. |

The desktop baseline to diff against is: `/`, `/books`, `/ebooks`, `/categories`, `/authors`, `/blog`,
`/books/[slug]`, `/cart`, `/account/library`.

---

## 10. Reference sites — measured, not asserted

Rather than describe designs from memory, five reference sites were loaded **on the same Redmi, at the
same 392 px viewport, with the same probe** used on Valice Press. This is a like-for-like comparison.

| Site | Targets | <24 px | 24–44 px | Menu button | Body px | Line-height | h1 px | `theme-color` | DOM nodes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Valice Press** `/` | 27 | 21 | 3 | **✗ none** | 14 | 28.05 | 56 | **none** | 443 |
| **Valice Press** `/books` | 50 | 20 | 21 | **✗ none** | 14 | 22.75 | 52 | **none** | 494 |
| **Valice Press** blog article | 48 | 29 | 14 | **✗ none** | 18 | 24.375 | 40 | **none** | 425 |
| Standard Ebooks | **32** | **4** | 23 | ✗ (flat nav) | **19.36** | **29.04** | 52.8 | `#394451` | **215** |
| Bookshop.org | 239 | 53 | 94 | ✓ 40 × 40 | 14 | 20 | 24 | none | 3 647 |
| Penguin Random House | 84 | 41 | 16 | ✓ | 14 | 28 | 26 | none | 1 584 |
| The Folio Society | 531 | 83 | 103 | ✓ | 14 | 19.6 | 34 | `#ffffff` | 2 650 |
| The New York Times | 84 | 40 | 17 | ✓ | 20 | 33.6 | 16 | none | 2 328 |

**What this actually tells us:**

1. **Every commercial reference exposes a mobile menu control; Valice Press is the only site measured
   with none.** This is the empirical case for P0-1.
2. **Standard Ebooks (`standardebooks.org`) is the closest peer and the one to study.** Same
   proposition — public-domain literary texts, typographically serious, no marketing bloat — and it is
   the outlier on every axis that matters: 215 DOM nodes, 32 interactive targets, 4 below 24 px, body
   text at **19.36 px / 1.50 line-height**, and a `theme-color` set. Its lesson is *restraint plus
   large reading type*, not more features. Valice's blog article is 18 px / 1.35; the gap to close is
   line-height, not size.
3. **Valice already beats the big-retail references on DOM weight and target hygiene** (443 nodes vs
   1 584–3 647; 21 small targets vs 40–83). The mobile problem here is not bloat — it is *absence of
   navigation* and a handful of specific broken components.
4. **`theme-color` is used by 2 of 5 references** and by neither of the two biggest. Valice, being a
   near-black site, has more to gain from it than any of them (P1-6).
5. **What not to copy:** The Folio Society ships
   `viewport: width=device-width, initial-scale=1, maximum-scale=1`. `maximum-scale=1` suppresses pinch
   zoom and is a WCAG 1.4.4 hazard. Do not adopt it.

Adaptation targets, per site, kept to what the measurements support:

| Site | Pattern worth studying | What Valice could adapt |
| --- | --- | --- |
| Standard Ebooks | Reading-first type scale; minimal chrome; flat nav that needs no drawer | Blog/companion reading type; consider whether 7 nav items justify a drawer or whether a flatter set fits |
| Bookshop.org | 40 × 40 menu button; commerce-first mobile IA | Menu button sizing and placement for P0-1 |
| Penguin Random House | Large-catalogue browse-by-facet on mobile | Filter-drawer pattern for P1-3 |
| The Folio Society | Premium-object presentation of physical editions | Book-detail imagery hierarchy — *not* its viewport meta |
| The New York Times | Editorial mobile type (20 px / 33.6 px) | Article body rhythm (P2-4) |

*These sites are references for information hierarchy and interaction patterns only. No layout, asset,
copy, or proprietary interaction is to be reproduced.*

---

## 11. Research sources

All checked **2026-09-04**.

| Source | URL | Recommendation taken | Applies to |
| --- | --- | --- | --- |
| web.dev — Core Web Vitals | `https://web.dev/articles/vitals` | LCP ≤ **2.5 s**, INP ≤ **200 ms**, CLS ≤ **0.1**, measured at the **75th percentile**, segmented mobile/desktop, from field data | P1-5; Phase 7 targets |
| W3C — WCAG 2.2 SC 2.5.8 Target Size (Minimum) | `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html` | **24 × 24 CSS px** at Level AA, with five exceptions (spacing, equivalent, inline, user-agent, essential); the spacing exception is satisfied when 24 px-diameter circles centred on undersized targets intersect neither each other nor adjacent targets | P1-4; P2-1; footer-link ruling in §8 |
| Chrome DevTools Protocol | `CSS.getPlatformFontsForNode`, `Network.emulateNetworkConditions`, `Page.captureScreenshot` | Authoritative per-node font resolution with glyph counts; used instead of canvas width heuristics, which cannot distinguish a webfont from its fallback stack | P2-6; P3-3; §2 method |
| Next.js 16 App Router | project's own `next.config.ts`, `src/app/layout.tsx` | Default viewport meta is `width=device-width, initial-scale=1`; `viewport-fit` and `themeColor` require an explicit `export const viewport` | P1-6; P3-1 |
| Tailwind CSS v4 | project's `globals.css` (`@theme`), `tailwind.config.ts` | Default breakpoints in force (640/768/1024/1280/1536); no custom `--breakpoint-*` tokens defined | §4 |

Sources consulted but **not** used as authority for any claim above: none — every threshold cited is
from the two standards documents listed.

---

## 12. Summary

| Severity | Count |
| --- | --- |
| **P0** | **1** |
| **P1** | **6** |
| **P2** | **9** |
| **P3** | **4** |
| **Total** | **20** |

**Maturity: partially mobile.** The foundations are better than expected — no overflow, zero CLS, a
correct image pipeline, honoured reduced-motion — and the defects are concentrated and specific rather
than diffuse. One route-level absence (navigation), one bug class repeated five times (flex-column
input collapse), one component that breaks at small widths (category cards), one page that hides its
own product (the catalog), and a document-level dark-theme integration that was never wired up.

None of the twenty findings requires redesigning the desktop composition.
