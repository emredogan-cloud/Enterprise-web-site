# Valice Press — Mobile Optimization Master Roadmap

**Date:** 2026-09-04
**Status:** PLAN — not yet implemented. No production UI has been modified.
**Audit of record:** [`MOBILE_CURRENT_STATE_AUDIT.md`](./MOBILE_CURRENT_STATE_AUDIT.md)
**Baseline captures:** [`./baseline/`](./baseline/) — 59 device screenshots at 392 px (1×)

---

## Executive summary

Valice Press is **partially mobile**: mobile-first in CSS syntax, desktop-first in composition. The
foundations are stronger than a first look suggests — **zero horizontal overflow across all 23
device-measured routes**, **CLS = 0** on production, a correct `next/image` pipeline, and honoured
reduced-motion. The problems are concentrated, not diffuse.

Twenty findings: **1 P0, 6 P1, 9 P2, 4 P3.**

Four of them carry most of the commercial damage:

1. **There is no mobile navigation.** `CinematicHeader`'s nav is `hidden … md:flex`, and no hamburger,
   drawer, or menu component exists anywhere in the codebase. Since all 26 route files render
   `CinematicHeader`, **every browse destination on the site is unreachable from the header below
   768 px.**
2. **Five forms render a ~20 px-tall input** because `flex-1` in a `flex-col` container puts
   `flex-basis: 0%` on the height axis and defeats `h-12`. The homepage newsletter field measures
   **19.6 px** next to its correct 48 px button.
3. **Every category card's title overflows its 47 px box** at ≤639 px — "Philosophy" overhangs by
   50 px, straight over the book count and the arrow. This is the exact title/cover collision the
   house rule forbids.
4. **`/books` shows a hero and a full filter panel before a single book** — about 1.5 screens of
   scrolling to reach a 7-book catalog.

The plan is **nine phases**, ordered by commercial funnel impact and dependency, each ending in a
mandatory Redmi QA pass and a desktop regression gate. Phase 1 alone (navigation + the input-collapse
cluster) removes the P0 and two P1s and is the highest-value work in the document.

**Every proposed change is gated below a breakpoint the desktop never renders, with one deliberate
exception** — the document-level dark-theme fix in Phase 2, which is called out and given its own
desktop verification step.

---

## Current state

| Dimension | State |
| --- | --- |
| Framework | Next.js 16.2.6 App Router / Turbopack, React 19.2.4, Tailwind v4 |
| Routes | 29 page patterns; 23 measured on-device, 6 source-only (auth/ID-gated) |
| Components | 143 under `src/components/` |
| Breakpoints | Tailwind defaults. `sm:` ×346, `lg:` ×169, `xl:` ×14, **`md:` ×2**, `2xl:` ×0 |
| Undesigned band | **640–1023 px** (tablet portrait, large-phone landscape) |
| Header | `CinematicHeader` on all 26 route files. `SiteHeader` is hidden everywhere by `body:has(.cinematic-root) > header` — effectively dead code |
| Horizontal overflow | **None** (≤1 px rounding, all routes) |
| CLS | **0** on `/`, `/books`, `/books/[slug]` |
| LCP (prod, Redmi, 1.6 Mbps/70 ms) | `/` **5 916 ms** · `/books` 1 560 ms · `/books/[slug]` 3 052 ms |
| Hover guards | **None** — 268 `hover:` utilities, zero `@media (hover: hover)` |
| Safe areas | `env(safe-area-inset-*)` = **0 px** (no `viewport-fit=cover`) |
| `theme-color` / `color-scheme` | **Unset** / `normal` |

---

## Goals

1. **Reachability** — every browse destination reachable from the header at 320–430 px.
2. **No broken components** — nothing renders at a size or position that makes it unusable or illegible.
3. **WCAG 2.2 AA on touch** — no target below 24 × 24 CSS px without a valid exception; 44 px for
   primary commerce controls.
4. **Mobile LCP ≤ 2.5 s** at the 75th percentile on the funnel routes.
5. **Preserve CLS = 0** and preserve zero horizontal overflow.
6. **Design the 640–1023 px band** rather than letting it inherit.
7. **Responsive editorial typography** — keep the serif voice; make it legible at 392 px.
8. **Desktop unchanged** — verified by diff, not by impression.

## Non-goals

- Redesigning the desktop composition, visual identity, or the cinematic dark language.
- Changing book data, pricing, catalog rows, KDP/Amazon/Paddle configuration, or SEO copy.
- Replacing fonts, the CSS framework, or the image pipeline.
- Weakening authentication, payment, consent, or privacy behaviour.
- Adding a native app, a service worker, or an offline mode.
- Building a component library or a design-token refactor.
- Copying any reference site's layout, assets, copy, or proprietary interactions.

---

## Device matrix

The Redmi is the primary real-device truth. Everything else is a secondary check.

| Device / class | Browser | Width × height (CSS) | DPR | Orientation | Role | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **Redmi Note 8 (2021)** `M1908C3JGG` | **Chrome 152.0.7977.65** / Android 11 | **392 × 718** | **2.75** | Portrait | **Primary — mandatory every phase** | ✅ connected, CDP verified |
| Redmi Note 8 (2021) | Chrome 152 | 718 × 392 | 2.75 | Landscape | Secondary — Phases 1, 4, 8 | ✅ available |
| Redmi Note 8 (2021) | Android System WebView 151 | 392 × 718 | 2.75 | Portrait | In-app-browser check (Phase 8) | ✅ available |
| Small phone | DevTools emulation | 320 × 568 | 2 | Portrait | Minimum supported width | Emulated |
| Standard phone | DevTools emulation | 375 × 667 | 2 | Portrait | iPhone SE class | Emulated |
| Large phone | DevTools emulation | 430 × 932 | 3 | Portrait | iPhone Pro Max class | Emulated |
| Phablet / small tablet | DevTools emulation | 600 × 960 | 2 | Portrait | **The undesigned band** | Emulated |
| Tablet portrait | DevTools emulation | 768 × 1024 | 2 | Portrait | **`md:` boundary** | Emulated |
| Tablet landscape | DevTools emulation | 1024 × 768 | 2 | Landscape | `lg:` boundary | Emulated |
| Desktop baseline | Chrome desktop | 1440 × 900 | 1–2 | — | **Regression gate** | Available |
| Wide desktop | Chrome desktop | 1920 × 1080 | 1 | — | Regression gate | Available |
| iOS Safari | — | — | — | — | **Not available** — P2-7 stays unverified | ⛔ no device |

**Standing gap to declare:** there is no iOS device. iOS Safari behaviours (input zoom below 16 px,
`-webkit-fill-available`, bounce-scroll background) are **planned for but unverified**. No phase may
claim iOS compatibility. If an iPhone becomes available, run the Phase 8 suite on it.

---

## Breakpoint strategy

**Keep Tailwind's defaults.** They are already load-bearing in 346 + 169 declarations, and redefining
them is a site-wide regression risk for no gain. The work is to *use* the scale that already exists.

| Band | Range | Named | Current state | Target state |
| --- | --- | --- | --- | --- |
| Compact phone | 320–389 | base | Inherits; untested | Explicitly verified at 320 |
| **Standard phone** | **390–639** | base | **Primary defect zone** | **Designed. The Redmi (392) is the reference.** |
| Large phone / phablet | 640–767 | `sm:` | Desktop-ish layout arrives early | Two-column cards fine; nav still needs the drawer |
| **Tablet portrait** | **768–1023** | `md:` | **Undesigned — 2 uses** | **Designed. Nav appears; grids step up.** |
| Desktop | 1024–1279 | `lg:` | Designed | **Frozen — regression gate** |
| Wide | 1280+ | `xl:` | Designed | **Frozen — regression gate** |

Two rules for every phase:

- **Additive-below rule.** Mobile fixes are expressed as base-layer changes plus a `sm:`/`md:`/`lg:`
  restatement of the existing desktop value. Never edit a `lg:` or `xl:` value to fix mobile.
- **Nav boundary rule.** The drawer is the navigation for `< md`. At `md:` and up the existing
  horizontal nav is authoritative and untouched.

---

## Phase plan

Nine phases. Dependencies are strict: **0 → 1 → 2 → 3 → {4, 5, 6} → 7 → 8**. Phases 4, 5 and 6 are
mutually independent once 3 lands and may run in parallel or in any order.

Effort is **LOW / MEDIUM / HIGH** — relative implementation size, not hours. The repository does not
carry velocity data, so hour estimates would be invented.

---

### PHASE 0 — Instrumentation and device harness

**Objective.** Make the Redmi loop reproducible and committed, and establish the numbers every later
phase is measured against. No UI changes at all.

**Files.** New: `scripts/mobile/device.mjs` (CDP driver), `scripts/mobile/audit.mjs` (in-page probe),
`scripts/mobile/capture.mjs` (scroll-and-capture), `scripts/mobile/README.md`. `package.json` scripts:
`mobile:audit`, `mobile:shots`, `mobile:cwv`.

**Current problem.** The audit harness exists only in a scratchpad. There is no repeatable way to prove
a phase improved anything, and two dev-server deaths during this audit silently produced invalid
measurements before being caught.

**Proposed solution.**
1. Commit the CDP driver (Node 24 global `WebSocket`; no new dependency).
2. Health-assert `HTTP 200` between every route; abort loudly on failure. Treat
   `scrollHeight === innerHeight` as a render failure, not a short page.
3. `mobile:audit` emits JSON per route: viewport, overflow, tap-target histogram, sub-12.5 px text,
   oversized images, `env(safe-area-*)`, console errors.
4. `mobile:shots` writes 1× WebP folds to `docs/execution/mobile/baseline/<phase>/`.
5. `mobile:cwv` runs against production with `Network.setCacheDisabled` + emulation at 1.6 Mbps/70 ms.
6. **Add an INP pass** — scripted tap on the menu trigger, a filter control, and Add-to-cart, reading
   `event`/`first-input` timings. INP is currently the one Core Web Vital with no baseline.

**Desktop regression risk.** **None** — no application code is touched.

**Mobile benefit.** Indirect but gating: nothing after this can be verified without it.

**Dependencies.** None.

**Testing procedure.** Run all three scripts twice; confirm route-level numbers are stable
(±1 px geometry, ±10 % timings). Confirm a deliberately killed dev server produces a hard failure.

**Redmi QA checklist.**
- [ ] `adb devices -l` shows `AYXSUKIVJVPZ7HPZ … device`
- [ ] `adb reverse tcp:3000 tcp:3000` set; `adb forward tcp:9222 localabstract:chrome_devtools_remote` set
- [ ] `curl -s http://localhost:9222/json/version` reports Chrome 152
- [ ] `npm run mobile:audit` completes all 23 routes with zero health failures
- [ ] `npm run mobile:shots` writes 59 captures at 392 px width
- [ ] `npm run mobile:cwv` reproduces `/` LCP within ±15 % of 5 916 ms
- [ ] Kill the dev server mid-run → the harness fails loudly

**Acceptance criteria.** Three scripts committed and documented; a full baseline JSON + capture set
stored under `baseline/phase-0/`; INP baseline recorded for `/`, `/books`, `/cart`.

**Rollback.** Delete `scripts/mobile/` and the three `package.json` entries. Zero product impact.

**Effort.** MEDIUM. **Owner:** tooling/infra agent.

---

### PHASE 1 — Navigation and the input-collapse cluster

**Objective.** Remove the P0 and the highest-value P1. After this phase a phone user can reach every
destination and every form field is a real field.

**Files.**
- `src/components/home/cinematic-header.tsx` (nav at :104; right cluster at :140–:160)
- New `src/components/home/mobile-nav.tsx` (drawer)
- `src/components/home/newsletter-section.tsx:92`
- `src/components/article/author-newsletter-strip.tsx:135`
- `src/components/codex/verify-form.tsx:101` and `:245`
- `src/components/companion/companion-signup.tsx:92`

**Current problem.**
- **P0-1** — `hidden … md:flex` hides all seven nav destinations below 768 px; no menu component exists.
- **P1-1** — `flex-1` inside `flex-col` sets `flex-basis: 0%` on the height axis, overriding `h-12`;
  the homepage newsletter input measures **19.6 px** beside its correct 48 px button.

**Proposed solution.**
1. Add a **menu trigger button** in the header right cluster, `md:hidden`, minimum **44 × 44 px**,
   `aria-expanded` / `aria-controls`, labelled "Menu".
2. Add a **drawer** (`<dialog>` or a focus-trapped overlay) containing all seven `NAV_ITEMS` plus
   About, each row **≥48 px tall**. Requirements: body scroll lock while open; `Esc` closes; backdrop
   tap closes; focus moves to the first item on open and returns to the trigger on close;
   `aria-current="page"` preserved; respects `prefers-reduced-motion`.
3. Replace `flex-1` with `w-full sm:flex-1` at all five input sites. **Do not** simply add `basis-auto`
   — being explicit about the axis is what makes the intent legible to the next reader.
4. For `companion-signup.tsx:92`, additionally set an explicit `min-h-11` since it sizes by padding.

**Desktop regression risk.** **None.** The trigger and drawer are `md:hidden`; the `md:flex` nav is
untouched. The input change is a no-op at `sm:`+ — verify by computed-style diff.

**Mobile benefit.** Restores all seven browse destinations; repairs the site's primary retention
capture and the Codex verification gate.

**Dependencies.** Phase 0.

**Testing procedure.** Unit-test the drawer's open/close/focus contract. Computed-style diff of the five
inputs at 640, 768, 1024, 1440 — assert `height` is unchanged from the pre-change baseline.

**Redmi QA checklist.**
- [ ] `/` at 392 px — menu trigger visible, ≥44 × 44 px measured via CDP
- [ ] Tap trigger → drawer opens; all 7 destinations + About present and tappable
- [ ] Each row measures ≥48 px tall
- [ ] Background does **not** scroll while the drawer is open
- [ ] Backdrop tap closes; `Esc` (Bluetooth keyboard) closes; focus returns to the trigger
- [ ] Navigate to `/books` from the drawer — correct route, drawer closed on arrival
- [ ] `aria-current` on the active item (verify via CDP accessibility tree)
- [ ] Repeat on `/blog`, `/cart`, `/terms` — the drawer is present on all cinematic routes
- [ ] **Landscape (718 × 392)** — drawer scrolls internally, no clipped rows
- [ ] Homepage newsletter input measures **≥44 px tall**; type an address, submit, read the response
- [ ] Same on a blog article, a companion page, `/codex-enigmatica/verify`
- [ ] Zero horizontal overflow on every route touched
- [ ] Console clean

**Desktop regression gate.** `/`, `/books`, `/ebooks`, `/categories`, `/authors`, `/blog`,
`/books/[slug]`, `/cart`, `/account/library` at 1440 — nav renders horizontally, no trigger visible,
newsletter input unchanged at 48 px.

**Acceptance criteria.** P0-1 closed. P1-1 closed at all five sites. No new P0/P1. CLS still 0.

**Rollback.** Revert the header commit (the drawer is a new file); revert the five one-line class edits.

**Effort.** MEDIUM. **Owner:** frontend agent with a11y competence — the focus-trap contract is the
hard part, not the layout.

---

### PHASE 2 — Document-level theme, viewport, and safe areas

**Objective.** Make the dark theme a document theme instead of a scoped `div`, so the browser chrome,
overscroll, and native controls stop contradicting it.

**Files.** `src/app/layout.tsx` (add `export const viewport`), `src/app/globals.css`
(`:root`/`html` background, `color-scheme`), possibly `src/components/settings/*` if a theme toggle exists.

**Current problem — P1-6 and P3-1.** Measured: `htmlBg: rgba(0,0,0,0)`, `bodyBg: lab(99.21 …)` (near-white),
`themeColorMeta: null`, `colorScheme: "normal"`, `env(safe-area-inset-*)` = `0px`. Consequences:
white overscroll on every dark page; a light Android address bar above a near-black page; light-mode
native `<select>` popups on `/books`, `/authors`, `/account/orders`.

**Proposed solution.**
1. `export const viewport: Viewport = { themeColor: "#050705", viewportFit: "cover",
   width: "device-width", initialScale: 1 }`. **Do not set `maximumScale`** — suppressing pinch-zoom is
   a WCAG 1.4.4 hazard (and is exactly what The Folio Society does wrong, per the audit's §10).
2. Set an explicit dark background on `html` so the canvas propagation is dark.
3. Set `color-scheme: dark` on the cinematic scope so native controls and scrollbars render dark.
4. Introduce safe-area padding **only** where it matters: the sticky header's top and the drawer's
   bottom, via `env(safe-area-inset-*)` with a `0px` fallback.

**Desktop regression risk.** **MEDIUM — the only medium-risk change in this roadmap.** `color-scheme`
and the `html` background are document-level, not breakpoint-scoped, so they affect desktop too. They
should make desktop *more* correct (dark scrollbars, dark form controls), but that is a visible change
and must be signed off explicitly rather than assumed.

**Mobile benefit.** No white flash on overscroll; address bar matches the page; native dropdowns stop
being light rectangles on a black page.

**Dependencies.** Phase 0. Independent of Phase 1, but sequenced after it so the drawer can consume the
safe-area tokens.

**Testing procedure.** Screenshot diff of the 9 desktop baseline routes at 1440 before/after, with
particular attention to scrollbars, `<select>` popups, and any white-background component.

**Redmi QA checklist.**
- [ ] Address bar renders dark on `/`, `/books`, `/terms`
- [ ] Overscroll at the top and bottom of `/` shows **no white band**
- [ ] Open the sort `<select>` on `/books` — popup renders dark
- [ ] `env(safe-area-inset-top)` resolves non-zero where applied (CDP probe)
- [ ] Sticky header not clipped by the status bar; drawer bottom clear of the gesture bar
- [ ] **Landscape** — no content under the notch/cutout
- [ ] Pinch-zoom still works (WCAG 1.4.4)

**Desktop regression gate.** All 9 baseline routes at 1440 and 1920: screenshot diff reviewed by a
human; scrollbar and `<select>` changes explicitly accepted or reverted.

**Acceptance criteria.** P1-6 and P3-1 closed. Desktop diff reviewed and signed off. CLS still 0.

**Rollback.** Remove the `viewport` export and revert the three CSS declarations. Fully isolated.

**Effort.** LOW to implement, MEDIUM to verify. **Owner:** frontend agent, with Founder sign-off on the
desktop diff.

---

### PHASE 3 — Responsive containers, spacing, and editorial type

**Objective.** Make the vertical rhythm and type scale fit a 718 px viewport without flattening the
editorial voice.

**Files.** `src/app/globals.css`; section wrappers across `src/components/home/*`, `about/*`,
`categories/*`, `article/*`; the flat-`px-6` containers in `catalog-shell.tsx:300` and the book-detail
sections.

**Current problem — P2-2, P2-3, P2-4, P2-9.** `py-24` (96 px) at base rising to `sm:py-28`/`sm:py-32`;
7 sections at `py-16`+ with no smaller base; 18 unprefixed `mt-16`/`mt-20`/`mt-24`. Measured page
heights: `/` **9.8 screens**, `/blog/[slug]` **13.7**, `/terms` **8.7**. Labels at 10–11 px with
0.2–0.3em tracking. Blog body 18 px / **1.35** line-height against Standard Ebooks' 19.36 px / **1.50**
measured on the same device. Catalog gutters are `px-6` where the rest of the site is `px-4 sm:px-6`.

**Proposed solution.**
1. **Invert the padding scale**: `py-14 sm:py-24 lg:py-28` in place of `py-24 sm:py-28`. Desktop keeps
   its current value; only the base shrinks. Same treatment for the 18 unprefixed large margins.
2. **Raise the type floor** to **12 px** for any text carrying meaning. The 10 px `1 book` counts and
   11 px eyebrows become `text-xs sm:text-[11px]` / `text-[13px] sm:text-[11px]` as appropriate —
   larger on mobile, unchanged on desktop. Reduce tracking below `sm:` where it costs legibility.
3. **Blog/companion reading rhythm**: body line-height from 1.35 to **1.55–1.6** below `sm:`.
   Measured character-per-line is 39–44, which is already a healthy mobile measure — do not narrow it.
4. **Normalise gutters** to `px-4 sm:px-6` everywhere, including the catalog.
5. Keep the hero display sizes. `h1` at 40–56 px on mobile is in line with Standard Ebooks (52.8 px)
   and is part of the brand voice.

**Desktop regression risk.** **None if strictly additive-below.** Every rule adds or raises a base value
and restates the existing `sm:`/`lg:` value. No `lg:` or `xl:` token changes.

**Mobile benefit.** Target ≥25 % reduction in page height on the four worst routes; all meaningful text
≥12 px; comfortable reading rhythm on articles.

**Dependencies.** Phases 0–2.

**Testing procedure.** Re-run `mobile:audit` and compare page heights and the sub-12.5 px text census
against the Phase 0 baseline. Desktop screenshot diff must be **pixel-identical** at 1440 — this is the
strongest assertion available and this phase should meet it.

**Redmi QA checklist.**
- [ ] `/` height reduced from 7 052 px by ≥25 %
- [ ] `/blog/[slug]` reduced from 9 811 px by ≥25 %
- [ ] `/terms` reduced from 6 234 px by ≥25 %
- [ ] `mobile:audit` reports **zero** text nodes below 12 px
- [ ] Blog article body line-height ≥1.5 (CDP computed style)
- [ ] Read one full article on the device — rhythm is comfortable, no cramped or gappy sections
- [ ] Gutters visually identical across `/`, `/books`, `/blog`, `/terms`
- [ ] No overflow; CLS still 0

**Desktop regression gate.** 9 baseline routes at 1440 — **pixel-identical** screenshot diff required.

**Acceptance criteria.** P2-2, P2-3, P2-4, P2-9 closed. Desktop pixel-identical.

**Rollback.** Per-component revert; each edit is independent.

**Effort.** MEDIUM (broad but mechanical). **Owner:** frontend agent with typographic judgement.

---

### PHASE 4 — Cards, category tiles, and shelves

**Objective.** Fix the category-card collision and confirm every card and shelf works under a finger.

**Files.** `src/components/categories/category-card.tsx:74–85`, `category-cover-stack.tsx`,
`src/components/cinematic/cinematic-book-tile.tsx`, `catalog/catalog-book-card.tsx`,
`cinematic/recommendation-carousel.tsx`, `library/library-books-grid.tsx`,
`book-detail/related-books-shelf.tsx`.

**Current problem — P1-2 (and P3-2 as a guard).** At 392 px the category card is 172 × 230 px and the
title box is **47 px** wide; with `overflow-wrap: normal` the widest word paints outside it — "Philosophy"
by 50 px, over the book count and the arrow. All six cards affected. This is the collision the house
rule explicitly forbids.

**Proposed solution.**
1. Below `sm:`, **stack the info row**: title on its own full-width line, with the icon badge and arrow
   on a second row beneath (or drop the arrow below `sm:` — the whole card is already a link, so the
   arrow is decorative). At `sm:` and up, restore today's single-row layout unchanged.
2. Add `overflow-wrap: anywhere` (or `hyphens: auto`) to the title as a **belt-and-braces guard**, so a
   future long category name cannot re-break it.
3. Re-verify the cover stack still reads as real book covers at 172 px — the rule is *real covers plus a
   clear title*, and this phase must not trade one for the other.
4. **Preserve the shelf peek.** `library-books-grid.tsx:74` uses `w-[42vw]` (165 px at 392 px), giving
   two cards plus a partial third — the only scroll affordance on touch, since scrollbars are hidden
   (`cart-shelf-track`) and arrows are `sm:flex`. Assert this in the QA pass rather than changing it.
5. Audit the same book card across homepage / category / catalog / ebooks / search / library / cart /
   related shelves for canonical asset consistency.

**Desktop regression risk.** **None** — all changes below `sm:`; `sm:aspect-[5/4]` and the existing row
layout are preserved verbatim.

**Mobile benefit.** Six category cards become legible; card titles safe against future long names.

**Dependencies.** Phases 0–3 (type scale must settle first, since it changes word widths).

**Testing procedure.** Re-run the per-word overflow probe from the audit
(`scrollWidth > clientWidth` plus canvas per-word measurement) and assert **zero** overhang on all six
cards at 320, 360, 392, 430, 600, 768.

**Redmi QA checklist.**
- [ ] All 6 category titles fully readable, no ink outside any box (probe reports 0 px overhang)
- [ ] Book count and arrow legible and unobstructed on every card
- [ ] Real book covers still visible and recognisable behind each title
- [ ] Tap each of the 6 cards → correct category route
- [ ] Horizontal shelves: swipe on `/cart`, `/account/library`, `/books/[slug]` — smooth, snapping, first and last item reachable
- [ ] **Partial next card visible** on every shelf (the peek affordance)
- [ ] Shelf swipe does **not** scroll the page horizontally
- [ ] Same cover art for the same book across homepage, category, catalog, search, library, cart
- [ ] No overflow; CLS still 0

**Desktop regression gate.** `/categories`, `/books`, `/`, `/account/library` at 1440 — pixel-identical.

**Acceptance criteria.** P1-2 closed with a measured 0 px overhang at all six widths. Peek affordance
retained. Canonical asset consistency confirmed.

**Rollback.** Revert `category-card.tsx`; other files are verification-only.

**Effort.** MEDIUM. **Owner:** frontend agent.

---

### PHASE 5 — Discovery: catalog, filters, search

**Objective.** Put products above filters on mobile and make the filter controls touchable.

**Files.** `src/components/catalog/catalog-shell.tsx:300`, `catalog/filter-sidebar.tsx` (:44, :127),
`catalog/catalog-toolbar.tsx`, `src/app/globals.css:736` (`.catalog-range`),
`src/components/search/*`, `src/app/ebooks/page.tsx`.

**Current problem — P1-3 and P1-4.** Below `lg:` the filter panel stacks above the results; the reader
scrolls ~1.5 screens past a hero and a full filter panel to reach a 7-book catalog. The price slider is
a **295 × 4 px** input with a 16 px thumb — a WCAG 2.2 AA failure with no equivalent control.

**Proposed solution.**
1. Below `lg:`, present filters as a **bottom sheet or drawer** behind a sticky "Filters (n)" button
   placed with the sort control. **Keep the sidebar in the same DOM position** and change presentation
   only, so `lg:sticky lg:top-24` behaviour is untouched at desktop.
2. Compress the `/books` hero below `sm:` so the first row of covers is visible within the first
   scroll — target **first cover above 1.0 screens** (720 px).
3. **Price slider:** raise the touch target to ≥24 px (44 px preferred) with a transparent hit area —
   an enlarged `::-webkit-slider-runnable-track`/thumb hit box or a padded wrapper — **without**
   changing the 4 px visible track on desktop. Add a visible numeric readout so the value is legible
   without dragging.
4. Re-check the `/search` flow with the on-screen keyboard raised: results must not be hidden behind
   the sticky header, and the input must stay visible.

**Desktop regression risk.** **LOW.** The `lg:grid-cols-[300px_1fr]` layout is preserved. The one real
risk is re-parenting the sidebar and breaking `lg:sticky` — mitigated by changing presentation, not
position.

**Mobile benefit.** Products visible immediately; filters reachable but not blocking; the price filter
becomes usable with a finger.

**Dependencies.** Phases 0–3. Independent of 4 and 6.

**Testing procedure.** Measure the y-offset of the first book cover on `/books` at 320/392/430/768.
Verify the slider's hit box via `elementFromPoint` sampling across its height.

**Redmi QA checklist.**
- [ ] `/books` — first book cover visible within the first 720 px of scroll
- [ ] "Filters" button visible, ≥44 × 44 px
- [ ] Open filters → sheet opens; body scroll locked; `Esc`/backdrop/close all dismiss
- [ ] Select a category filter → results update; active-filter count shown on the button
- [ ] **Price slider draggable with a thumb** — `elementFromPoint` hits the input across ≥24 px of height
- [ ] Numeric price readout updates while dragging
- [ ] Sort `<select>` opens a dark popup (Phase 2) and applies
- [ ] `/search` — tap the field, keyboard raises, input stays visible, results not hidden behind the header
- [ ] Submit a query → results render; empty query → empty state renders
- [ ] `/ebooks` same checks
- [ ] **Landscape** — filter sheet scrolls internally
- [ ] No overflow; CLS still 0

**Desktop regression gate.** `/books`, `/ebooks`, `/search` at 1440 — sidebar still sticky at `top-24`,
grid still `lg:grid-cols-3 xl:grid-cols-4`, slider visually unchanged.

**Acceptance criteria.** P1-3 and P1-4 closed. Desktop sidebar sticky behaviour verified unchanged.

**Rollback.** Revert `catalog-shell.tsx` and `filter-sidebar.tsx`; the slider CSS is independent.

**Effort.** HIGH — the filter sheet is the largest single build in this roadmap.

---

### PHASE 6 — Consideration and purchase: book detail, cart, library, order

**Objective.** Verify and tune the money path on a phone.

**Files.** `src/app/books/[slug]/page.tsx` (:195–:318), `book-detail/book-hero.tsx`,
`format-table.tsx`, `direct-edition-panel.tsx`, `book-preview-pages.tsx`, `cart/cart-line.tsx`,
`cart/cart-summary.tsx`, `library/library-books-grid.tsx`, `order/*`.

**Current problem.** Book detail is **8.4 screens** on the Redmi. Source order is hero → format table →
preview pages → reviews → related → explore; whether price and CTA land above the fold at 392 px is
**unverified**. `FormatTable` is a table on a 392 px screen (`/books/[slug]` shows 20 sub-24 px targets).
Cart quantity buttons are 32 × 32 px (P2-1). `direct-edition-panel.tsx:55` and
`books/[slug]/page.tsx:224` use flat `px-6`.

**Proposed solution.**
1. **Measure first**, then act: capture the y-offset of price and primary CTA on three book types
   (direct-sale, Amazon-only, mixed). If either falls below 718 px, hoist a compact price + CTA block
   above the fold below `sm:` — without moving the desktop composition.
2. `FormatTable`: below `sm:`, render as stacked cards rather than a table; keep the table at `sm:`+.
3. Raise cart quantity controls to **44 × 44 px** below `sm:`.
4. Verify `/read/[bookId]` and `/order/[id]` on-device — both are **source-only** so far, and both are
   post-purchase surfaces where a defect is most expensive.
5. Do **not** touch payment logic. Paddle handoff is verification-only.

**Desktop regression risk.** **None** if all changes are `sm:`-gated. The format-table swap is the one
to watch: keep the `<table>` markup at `sm:`+ rather than replacing it outright.

**Mobile benefit.** Commercial information above the fold; a tappable cart; verified checkout return.

**Dependencies.** Phases 0–3. Independent of 4 and 5.

**Testing procedure.** Measure CTA offsets. Run Journeys B and D (below) end to end.

**Redmi QA checklist.**
- [ ] `/books/meditations`, `/books/the-great-book-of-world-games`, `/books/codex-enigmatica` — price and primary CTA within the first 718 px
- [ ] Format table readable at 392 px, no clipped columns, no horizontal scroll
- [ ] Preview pages swipe horizontally; page images legible
- [ ] Add to cart → badge increments → `/cart` shows the line
- [ ] Quantity +/− measure ≥44 px and work under a finger
- [ ] Remove a line; empty-cart state renders
- [ ] Long book titles do not overflow the cart line
- [ ] Checkout → Paddle handoff opens; **return** lands on `/order/[id]`; entitlement appears in `/account/library`
- [ ] `/read/[bookId]` opens and pages on the device *(first-ever device test)*
- [ ] **Landscape** on book detail and cart
- [ ] No overflow; CLS still 0

**Desktop regression gate.** `/books/[slug]`, `/cart`, `/account/library` at 1440 — hero two-column
layout, sticky cover, and format table unchanged.

**Acceptance criteria.** Journeys B and D pass on the device. Cart controls ≥44 px. `/read` and `/order`
device-verified for the first time.

**Rollback.** Per-component revert. **Nothing in this phase may alter payment or entitlement logic** —
if a fix appears to require that, stop and escalate.

**Effort.** MEDIUM–HIGH. **Owner:** frontend agent; Paddle return path verified with the Founder.

---

### PHASE 7 — Editorial surfaces: blog, authors, categories, companions

**Objective.** Bring the reading and discovery surfaces to the same standard.

**Files.** `src/app/blog/[slug]/page.tsx`, `article/reading-sidebar.tsx`, `article-body.tsx`,
`share-panel.tsx`, `author-newsletter-strip.tsx`, `authors/*`, `category/category-sidebar.tsx`,
`app/companion/[slug]/page.tsx`.

**Current problem.** `/blog/[slug]` is **13.7 screens** and carries the most small targets (26–29 under
24 px). The reading sidebar has **no `hidden lg:block`**, so the TOC and share panel sit in the mobile
flow at an unverified position. Companion pages render Korean in a system CJK SC face (P2-6).

**Proposed solution.**
1. Determine where the reading sidebar lands in the mobile flow. If it precedes the article body,
   either move it after the first section or collapse it into a disclosure below `lg:`.
2. Apply the Phase 3 reading rhythm; re-verify measure stays in the 39–44 CPL range already measured.
3. Share panel: ensure the Web Share API path is the mobile default and the fallback list is tappable.
4. **Korean (P2-6):** add a Korean subset to the relevant face, or declare an explicit
   `font-family` fallback naming a Korean face ahead of the CJK SC default, so Hangul renders in a
   Korean face. Decide deliberately — adding a subset costs payload on every route unless scoped.
5. Author and category pages: verify cards, portraits, and the category sidebar newsletter form
   (which is `w-full`, not `flex-1`, and so is **not** affected by P1-1).

**Desktop regression risk.** **None** if `lg:`-gated. The font decision is document-level — measure the
payload delta before committing.

**Dependencies.** Phases 0–3.

**Redmi QA checklist.**
- [ ] `/blog/[slug]` — article body starts within the first screen; TOC does not block it
- [ ] TOC links navigate to the right heading; back-scroll works
- [ ] Share panel opens the native Android share sheet
- [ ] Article images legible; no overflow; tables scroll inside their own container
- [ ] Newsletter strip input ≥44 px (Phase 1 fix holds here)
- [ ] `/companion/world-games` and `/companion/hangul` — Hangul renders in a Korean face; sheets download
- [ ] `/authors`, `/authors/[slug]`, `/categories/[slug]` — cards and portraits correct, no fabricated metrics
- [ ] Font payload delta recorded if a subset was added
- [ ] No overflow; CLS still 0

**Desktop regression gate.** `/blog`, `/blog/[slug]`, `/authors`, `/categories/[slug]` at 1440.

**Acceptance criteria.** P2-6 resolved by explicit decision. Blog article height reduced ≥25 %.
Reading sidebar position deliberate and documented.

**Effort.** MEDIUM.

---

### PHASE 8 — Accessibility, performance, motion

**Objective.** Close the remaining conformance gaps and bring mobile LCP under target.

**Files.** `src/app/layout.tsx`, `globals.css`, `home/hero.tsx`, `home/featured-books-section.tsx`,
`reveal-on-scroll.tsx`, `cover-image.tsx`, `cinematic/cover-art.tsx`.

**Current problem.** P1-5 (`/` LCP 5 916 ms, bandwidth-bound at ~1 046 KB), P2-1 (36 px / 32 px comfort
targets), P2-8 (no skip link), P3-4 (hydration reveal inversion), and 268 unguarded `hover:` utilities.

**Proposed solution.**
1. **Payload.** The homepage loads 251 KB of images before any scroll and 634 KB after one, with the
   last JS response at 11 623 ms. Reduce below-fold image eagerness; confirm `sizes` values match the
   real rendered widths at 392 px × DPR 2.75; consider `fetchPriority="high"` on the hero and lower
   priority on the first featured row. **Target: `/` LCP ≤ 2.5 s at the 75th percentile.**
2. **Fonts.** 104 KB across 4 files on the critical path, finishing at 3 043 ms. Confirm every loaded
   weight is used; preload only the face that paints the LCP text.
3. **Skip link** as the first focusable element, visible on focus.
4. **Hover guard.** Wrap decorative `hover:` effects in `@media (hover: hover)` so touch does not latch
   hover state. 268 call sites — do this by adding a guarded variant, not by editing each site.
5. **Comfort targets.** Header controls 36 → 44 px, cart controls 32 → 44 px below `sm:`.
6. **Reveal inversion.** Set `data-reveal` during SSR, or gate the `opacity: 0` rule behind a
   `js-enabled` class, so content never renders visible and then hides.
7. **INP** — measure against the Phase 0 baseline; target ≤200 ms.

**Desktop regression risk.** **LOW to MEDIUM.** The hover guard changes desktop hover behaviour if
written carelessly — `@media (hover: hover)` *keeps* hover on desktop, which is the intent, but the
refactor touches many files. Image-priority changes can shift desktop LCP; re-measure desktop too.

**Dependencies.** Phases 0–7 (payload and layout must be settled before optimising them).

**Redmi QA checklist.**
- [ ] `mobile:cwv` on `/`: **LCP ≤ 2.5 s**, CLS ≤ 0.1, INP ≤ 200 ms at 1.6 Mbps/70 ms
- [ ] Same for `/books` and `/books/[slug]`
- [ ] Total homepage transfer reduced ≥30 % from ~1 046 KB
- [ ] Tap a card, then scroll away — no latched hover state
- [ ] Skip link reachable with a Bluetooth keyboard and visible on focus
- [ ] Header and cart controls measure ≥44 px
- [ ] Enable "Remove animations" in Android accessibility settings → reveals are instant, no flash
- [ ] No content flash-then-hide on load
- [ ] `mobile:audit` reports 0 targets below 24 px without a valid exception

**Desktop regression gate.** All 9 baseline routes at 1440 — hover states still work; desktop LCP not
regressed.

**Acceptance criteria.** P1-5, P2-1, P2-8, P3-4 closed. CWV targets met on the three funnel routes.

**Effort.** HIGH.

---

### PHASE 9 — Full regression, tablet band, and sign-off

**Objective.** Prove the whole system on the device, close the 640–1023 px gap, and establish the
permanent regression suite.

**Files.** Whatever the tablet band exposes; `scripts/mobile/*`; a new
`docs/execution/mobile/MOBILE_REGRESSION_SUITE.md`.

**Current problem — P2-5.** `md:` is used twice; the 640–1023 px band has never been designed or tested.
Phases 1–8 will have touched it incidentally.

**Proposed solution.**
1. Sweep all 23 device-measurable routes at 320 / 360 / 392 / 430 / 600 / 768 / 1024.
2. Design the `md:` step deliberately where a phase exposed a gap — grid column counts, nav
   appearance boundary, card aspect ratios.
3. Run all five user journeys end to end on the Redmi.
4. Verify the **6 source-only routes** on-device for the first time.
5. Commit the regression suite as a runnable checklist.

**Redmi QA checklist.**
- [ ] All 23 routes: no overflow, no console errors, no target <24 px without exception
- [ ] Journeys A–E all pass (below)
- [ ] The 6 previously source-only routes verified on-device
- [ ] Portrait **and** landscape on nav, book detail, library, cart, checkout return
- [ ] Android System WebView (in-app browser) check on `/` and `/books/[slug]`
- [ ] Before/after capture set produced for every route
- [ ] CWV targets hold on the three funnel routes

**Desktop regression gate.** Full 9-route diff at 1440 **and** 1920 against the Phase 0 desktop baseline.

**Acceptance criteria.** Zero open P0. Zero open P1 on a customer route. P2/P3 either closed or
explicitly carried forward with written justification. Regression suite committed.

**Effort.** MEDIUM. **Owner:** QA-focused agent.

---

## Phase dependency graph

```
Phase 0  Instrumentation ─┐
                          ▼
Phase 1  Navigation + input collapse      (removes P0-1, P1-1)
                          ▼
Phase 2  Theme / viewport / safe areas    (removes P1-6, P3-1)
                          ▼
Phase 3  Containers, spacing, type        (removes P2-2/3/4/9)
                          ▼
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
Phase 4 Cards       Phase 5 Discovery   Phase 6 Purchase
(P1-2, P3-2)        (P1-3, P1-4)        (P2-1 partial)
        └─────────────────┼─────────────────┘
                          ▼
Phase 7  Editorial surfaces               (P2-6)
                          ▼
Phase 8  A11y / performance / motion      (P1-5, P2-1, P2-8, P3-4)
                          ▼
Phase 9  Full regression + tablet band    (P2-5)
```

**Why this order.** Phase 1 is first because a site whose navigation does not exist on mobile has no
functioning funnel. Phase 3 precedes 4 because the type scale changes word widths, and Phase 4's
acceptance test is a per-word overflow measurement. Phase 8 is late because optimising a payload that
is still being restructured wastes the work.

---

## Prioritisation rationale

Ranked by customer impact → severity → dependency → risk → performance → commercial impact:

| Rank | Work | Why here |
| --- | --- | --- |
| 1 | Navigation (P0-1) | The only P0. Blocks all discovery. Zero desktop risk. |
| 2 | Input collapse (P1-1) | Breaks retention capture *and* the Codex gate. One-token fix ×5. |
| 3 | Catalog burial (P1-3) | First step of the browse funnel; products hidden behind filters. |
| 4 | Category cards (P1-2) | Six broken cards on a primary discovery route; violates a house rule. |
| 5 | Price slider (P1-4) | WCAG AA failure with no equivalent control. |
| 6 | LCP (P1-5) | 5.9 s on real hardware; costs sessions before anything else is seen. |
| 7 | Theme/chrome (P1-6) | Cheap, visible polish; unblocks safe-area work. |
| 8 | Type and rhythm (P2-2/3/4) | Broad legibility and scroll-length gains. |
| 9 | Comfort targets, skip link, hover guards | Conformance and comfort. |
| 10 | Tablet band (P2-5) | Real but lower-traffic; needs the rest settled first. |

Decorative polish is deliberately last. Checkout usability, navigation, product cards, touch,
typography and overflow all rank above it.

---

## Redmi QA strategy

**The Redmi is used at the end of every phase — it is not a final smoke test.**

Standing procedure:

```bash
export PATH=$PATH:/home/emre/Android/Sdk/platform-tools
adb devices -l                      # expect AYXSUKIVJVPZ7HPZ … device
adb reverse tcp:3000 tcp:3000
npm run dev
adb shell am start -a android.intent.action.VIEW -d "http://localhost:3000/" com.android.chrome
adb forward tcp:9222 localabstract:chrome_devtools_remote
npm run mobile:audit && npm run mobile:shots
```

Every phase's QA pass must cover, at minimum: pages opened · functions exercised · visual alignment ·
interaction · scroll · touch · keyboard (Bluetooth) · orientation where relevant · network behaviour ·
performance observations · **zero horizontal overflow** · **clean console** · comparison against the
stored desktop baseline.

**Hard rules.**
- Assert `HTTP 200` between routes. `scrollHeight === innerHeight` means a render failure, not a short
  page — this produced eight invalid captures during the audit before it was caught.
- Never use `captureBeyondViewport` — it tiles and duplicates sticky elements. Scroll and capture.
- Re-verify any finding derived from a compressed screenshot against a CDP measurement. The category
  card collision looked like box overlap in a screenshot and was actually ink overflow; the wrong
  diagnosis would have produced the wrong fix.

**Sign-off.** A phase closes only when its acceptance criteria pass on the Redmi **and** the desktop
gate is clean. A phase may not close with an open P0, or an open P1 on a customer route.

---

## Desktop regression strategy

**Baseline routes (all 9, every phase):** `/`, `/books`, `/ebooks`, `/categories`, `/authors`, `/blog`,
`/books/[slug]`, `/cart`, `/account/library`.

**Method.** Capture at 1440 × 900 before the phase; re-capture after; diff. Phases 3 and 4 must be
**pixel-identical**. Phases 1, 5, 6, 7 must be pixel-identical on the 9 routes. Phases 2 and 8 have
accepted, documented desktop changes and require explicit Founder sign-off.

**The one medium-risk change in the whole roadmap** is Phase 2's document-level `color-scheme: dark`
and `html` background. Everything else is breakpoint-gated below what desktop renders.

**Additive-below rule, restated:** never edit a `lg:` or `xl:` value to fix a mobile problem. Add or
raise the base value and restate the existing desktop value alongside it.

---

## Accessibility strategy

Aligned to **WCAG 2.2 Level AA**.

| Area | Target | Current | Phase |
| --- | --- | --- | --- |
| Target size (SC 2.5.8) | 24 × 24 px minimum; 44 px for primary commerce controls | Slider 4 px and input 20 px **fail**; 32–36 px controls pass but are uncomfortable; footer links pass via the spacing exception | 1, 5, 6, 8 |
| Bypass blocks (SC 2.4.1) | Skip link | Absent; 27 `<main>` landmarks exist | 8 |
| Focus visible (SC 2.4.7) | Visible on all interactive elements | Global `.cinematic-root *:focus-visible` + 22 explicit — **already good** | verify only |
| Focus order / trapping | Drawer and sheets trap and restore focus | No drawer exists yet | 1, 5 |
| Reflow (SC 1.4.10) | No horizontal scroll at 320 px | **Already met** — ≤1 px on all 23 routes | protect |
| Resize text (SC 1.4.4) | 200 % zoom; pinch-zoom never suppressed | Met; **must not** add `maximum-scale` | 2 |
| Text contrast (SC 1.4.3) | 4.5:1 body, 3:1 large | Not yet measured | 8 |
| Reduced motion | Honoured | **Already honoured** — CSS rule + JS guard | protect |
| Form labels / errors | Labelled, announced | 29 `aria-live`/`role=alert` — good | verify |
| Non-text content | Alt on all meaningful images | 10 of 11 `<Image>` carry `alt` | 8 |

Contrast measurement is genuinely outstanding — it was not run in this audit and should not be claimed.

---

## Performance strategy

Targets from **web.dev Core Web Vitals** (checked 2026-09-04), at the **75th percentile**, mobile:

| Metric | Target | Current (Redmi, prod, 1.6 Mbps/70 ms) |
| --- | --- | --- |
| **LCP** | **≤ 2.5 s** | `/` **5 916 ms** ✗ · `/books` 1 560 ms ✓ · `/books/[slug]` 3 052 ms ✗ |
| **CLS** | **≤ 0.1** | **0** on all three ✓ |
| **INP** | **≤ 200 ms** | **Not measured** — Phase 0 |
| JS transfer | ≤ 200 KB/route | 250–271 KB |
| Image payload (initial viewport) | ≤ 200 KB | 251 KB on `/` (634 KB after one scroll) |
| Font payload | ≤ 100 KB | 104 KB (4 files) |
| CSS transfer | ≤ 30 KB | 25 KB ✓ (153.6 KB on disk, one file) |

The `/` LCP is **bandwidth-bound**, not asset-bound: ~1 046 KB at 1.6 Mbps needs ~5.2 s, which is
essentially the measured LCP. The LCP element is a text node — `SPAN.block`, "Read it anywhere." — so
the fix is total payload and priority, not a single preload. Fonts finish at 3 043 ms; the last JS
response lands at 11 623 ms.

Targets are the published thresholds, not invented ones. **CLS = 0 is a current strength and every
phase must re-verify it rather than assume it.**

---

## Browser compatibility

| Browser | Priority | Status |
| --- | --- | --- |
| **Chrome Android 152** | **Primary — the Redmi's browser** | ✅ tested throughout |
| Android System WebView 151 | In-app browsers (social/email links) | Phase 9 |
| Samsung Internet | Common on Samsung hardware | ⚠️ untested — no device |
| **iOS Safari** | High share generally | ⛔ **untested — no device.** P2-7 (14 px input zoom) unverified |
| Firefox Android | Low | Not planned |
| Desktop Chrome | Regression gate | ✅ available |

**No phase may claim iOS Safari compatibility.** Known-untested iOS behaviours: focus zoom below 16 px
font-size, `-webkit-fill-available`, bounce-scroll background colour, `<dialog>` support. The Phase 1
drawer and Phase 5 sheet should avoid iOS-fragile constructs and be re-tested if a device appears.

Feature support relied on: `body:has()` (already in production), `env(safe-area-inset-*)` (Phase 2),
`@media (hover: hover)` (Phase 8), CSS scroll-snap (already in production). All are supported in
Chrome 152.

---

## Reference sites

Measured on the **same Redmi at the same 392 px viewport with the same probe** as Valice Press — see
the audit's §10 for the full table. Summary of what each contributes:

| Site | URL | Worth studying | Adapt to Valice |
| --- | --- | --- | --- |
| **Standard Ebooks** | `standardebooks.org` | Closest peer: public-domain literary texts, typographically serious. **215 DOM nodes, 32 targets, 4 under 24 px, body 19.36 px / 1.50.** | Reading type scale and line-height (Phases 3, 7). The lesson is restraint, not more features. |
| Bookshop.org | `bookshop.org` | Commerce-first mobile IA; **40 × 40 px menu button** | Menu trigger sizing and placement (Phase 1) |
| Penguin Random House | `penguinrandomhouse.com` | Large-catalogue browse-by-facet on a phone | Filter drawer pattern (Phase 5) |
| The Folio Society | `foliosociety.com` | Premium presentation of physical editions | Book-detail imagery hierarchy (Phase 6). **Do not copy its `maximum-scale=1`** — a WCAG 1.4.4 hazard. |
| The New York Times | `nytimes.com` | Editorial mobile type — **20 px / 33.6 px** | Article body rhythm (Phase 7) |

**All four commercial references expose a mobile menu; Valice Press is the only site measured with
none.** That is the empirical case for Phase 1.

Valice already beats every big-retail reference on DOM weight (443 vs 1 584–3 647 nodes) and small-target
count (21 vs 40–83). The mobile problem is not bloat — it is missing navigation and a few broken
components.

*References inform information hierarchy, responsive navigation, touch behaviour, card systems,
checkout clarity, typography scaling and performance patterns only. No layout, asset, branding, copy or
proprietary interaction is to be reproduced.*

---

## Technical sources

| Source | URL | Checked | Recommendation used | Applied in |
| --- | --- | --- | --- | --- |
| web.dev — Core Web Vitals | `https://web.dev/articles/vitals` | 2026-09-04 | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, at the 75th percentile, field data, segmented by device | Phase 8, Performance strategy |
| W3C — WCAG 2.2 SC 2.5.8 | `https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html` | 2026-09-04 | 24 × 24 CSS px at AA, five exceptions; spacing exception = non-intersecting 24 px circles | Phases 1, 5, 6, 8 |
| Chrome DevTools Protocol | `CSS.getPlatformFontsForNode`, `Network.emulateNetworkConditions`, `Page.captureScreenshot`, `Runtime.evaluate` | 2026-09-04 | Authoritative per-node font resolution and throttled field measurement on real hardware | Phase 0 harness |
| Next.js 16 App Router | project source | 2026-09-04 | Default viewport is `width=device-width, initial-scale=1`; `viewportFit` and `themeColor` need an explicit `export const viewport` | Phase 2 |
| Tailwind CSS v4 | project `globals.css` / `tailwind.config.ts` | 2026-09-04 | Default breakpoints in force; no custom `--breakpoint-*` tokens | Breakpoint strategy |

---

## Real-device user journeys

Each must pass on the Redmi in Phase 9, and the relevant one in its own phase.

**Journey A — Discovery.** Open `/` → open the menu → tap Categories → tap a category → tap a book →
book detail loads.
*Failure:* menu unreachable; category title unreadable; cover missing; any horizontal scroll.

**Journey B — Purchase.** Open `/ebooks` → tap a direct-sale book → read price → Add to cart → open cart
→ adjust quantity → checkout → Paddle → return → `/order/[id]` → book appears in `/account/library`.
*Failure:* price or CTA below the fold; quantity control untappable; return lands on an error;
entitlement missing.

**Journey C — Amazon + companion.** Open an Amazon-only book → confirm no direct-buy CTA is offered →
follow the companion link → download a sheet → optionally sign up.
*Failure:* a buy CTA appears for a book not sold here; sheet fails; signup input collapsed (P1-1).

**Journey D — Retention.** Sign in → `/account/library` → open a book → download **and** read.
*Failure:* sign-in modal clipped; library cards need hover; `/read/[bookId]` unusable *(never yet
tested on a device)*.

**Journey E — Search.** Tap search → type "games" → keyboard raises → results visible → tap a result.
*Failure:* keyboard covers results; sticky header overlaps the field; results hidden.

---

## Mobile regression suite (permanent, from Phase 9)

Every route gets four checks: **visual**, **interaction**, **horizontal overflow**, **console errors**.

`NAVIGATION` · `SEARCH` · `HOMEPAGE` · `CATALOG` · `EBOOKS` · `CATEGORY` · `AUTHORS` · `BLOG` ·
`BOOK DETAIL` · `LIBRARY` · `CART` · `ACCOUNT` · `COMPANION` · `CHECKOUT RETURN` · `LEGAL`

Run at 320 / 392 / 768 emulated plus the physical Redmi at 392. Store captures under
`docs/execution/mobile/baseline/<phase>/` for before/after comparison.

---

## Ownership

| Phase | Suggested agent |
| --- | --- |
| 0 | Tooling/infra — CDP harness, no UI |
| 1 | Frontend with **accessibility competence** — the focus-trap contract is the hard part |
| 2 | Frontend + **Founder sign-off** on the desktop theme diff |
| 3 | Frontend with typographic judgement |
| 4 | Frontend — component-level |
| 5 | Frontend — largest single build (filter sheet) |
| 6 | Frontend + Founder for the Paddle return path |
| 7 | Frontend + a font-payload decision |
| 8 | Performance-focused agent |
| 9 | QA-focused agent |

Small, testable phases → real-device QA → desktop regression → next phase. Not one large refactor.

---

## Success criteria

The roadmap has succeeded when:

1. **Zero open P0.** Every browse destination is reachable from the header at 320–430 px.
2. **Zero open P1 on a customer route.**
3. **CWV on the Redmi:** LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms at the 75th percentile on `/`, `/books`,
   `/books/[slug]`.
4. **WCAG 2.2 AA on touch:** no target under 24 × 24 px without a valid documented exception.
5. **Zero horizontal overflow** at 320 / 360 / 392 / 430 / 600 / 768 / 1024 — the current strength,
   preserved.
6. **Desktop pixel-identical** on the 9 baseline routes, except Phase 2's and Phase 8's documented,
   signed-off changes.
7. **All five journeys pass on the physical Redmi.**
8. **The 640–1023 px band is designed**, not inherited.
9. **The editorial voice survives** — serif display type, generous measure, the cinematic dark language
   intact. Legible, not flattened.
10. **The regression suite is committed and runnable** by the next agent without re-deriving anything in
    this document.
