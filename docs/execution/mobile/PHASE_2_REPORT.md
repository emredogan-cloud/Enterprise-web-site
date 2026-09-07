# Phase 2 — Document theme, viewport, and safe areas

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P1-6** (dark pages on a near-white canvas, no browser-chrome integration) · **P3-1** (safe-area insets inert)

> This is the roadmap's **one deliberately document-level change**, and the only
> phase permitted to alter desktop. The change is described, measured and
> accepted in *Desktop regression* below.

---

## Objective

Make the dark theme a property of the document rather than of a `div`, so the
browser chrome, the overscroll canvas and native controls stop contradicting it.

---

## Implemented changes

| File | Change |
| --- | --- |
| `src/app/layout.tsx` | New `export const viewport`: `themeColor: "#050705"`, `viewportFit: "cover"`, `width: "device-width"`, `initialScale: 1`. |
| `src/app/globals.css` | `html { background-color: #050705; color-scheme: dark; }` |
| `src/components/home/cinematic-header.tsx` | `px-6` → `pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]` |
| `src/components/home/mobile-nav.tsx` | Drawer gains `paddingRight: env(safe-area-inset-right)` alongside the top/bottom insets already wired in Phase 1. |
| `scripts/mobile/journeys.mjs` | New `theme` check group; hydration-safe `tapUntil`; route pre-warming. |
| `scripts/mobile/fingerprint.mjs` | Path indexing made stable (see *Harness correction*). |

**`maximumScale` and `userScalable` are deliberately not set.** Suppressing
pinch-zoom fails WCAG 2.2 SC 1.4.4. One of the reference sites surveyed for this
roadmap ships `maximum-scale=1`; it is the single thing from that survey we
explicitly do not copy. A device check asserts the meta tag stays clean.

---

## Redmi results

**104/104 interaction checks pass** (79 navigation + 4 inputs + 21 theme).

| Check (each on `/`, `/books`, `/terms`) | Before | After |
| --- | --- | --- |
| `theme-color` | **absent** | **`#050705`** ✅ |
| `viewport-fit=cover` | absent | present ✅ |
| Zoom suppression (WCAG 1.4.4) | none | **still none** ✅ |
| `color-scheme` | **`normal`** | **`dark`** ✅ |
| Document canvas | **`rgba(0,0,0,0)`** → body's near-white propagated | **`rgb(5,7,5)`** ✅ |
| Header safe-area gutter | `24px` (plain) | `24px` (inset-aware) ✅ |

Additional device measurements:

- **Native `<select>` now inherits `color-scheme: dark`** — verified on `/books`,
  where the sort control's popup previously rendered as a light panel over a
  near-black page. Also affects `/authors` and `/account/orders`.
- **Overscroll no longer reveals white.** `html` paints the cinematic ground, so
  the rubber-band area at either end of every page is dark.
- **Pinch-zoom still works**; `visualViewport.scale` reads 1 and the meta tag
  carries no scale limits.

### Safe-area insets: enabled, but zero on this hardware

Measured with `viewport-fit=cover` live, on the physical Redmi:

| Orientation | Viewport | top | right | bottom | left |
| --- | --- | --- | --- | --- | --- |
| Portrait | 392 × 718 | `0px` | `0px` | `0px` | `0px` |
| Landscape | 986 × 392 | `0px` | `0px` | `0px` | `0px` |

Stated plainly: **the mechanism is now live, and this device reports nothing to
inset.** The Redmi Note 8's waterdrop notch does not intrude into Chrome's
viewport in normal browsing, so Chrome reports zero in both orientations. The
`max(1.5rem, env(...))` gutters and the drawer's insets therefore resolve to the
existing values here, and will take effect on hardware that has a real cutout or
gesture inset. This phase does **not** claim safe-area padding was observed
doing anything on this device — only that it can now.

---

## Desktop regression — the accepted change

**Layout: 9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**
**Device: 30/30 routes identical.** Not one element box, font size, padding or
grid track moved anywhere, at any width. The header's `px-6` → `max(1.5rem, env(…))`
swap is geometrically a no-op: both compute to `24px` where there is no inset.

**What does change on desktop, and is accepted:**

1. **Native scrollbars render dark** instead of light, on every route.
2. **Native form controls render dark** — the `<select>` popups on `/books`,
   `/authors`, `/account/orders`.
3. **The document canvas is dark** — visible on overscroll.

All three follow from `color-scheme: dark` and the `html` background, which are
document-level by nature and cannot be breakpoint-scoped. They were reviewed on a
1440 × 900 desktop capture taken **with scrollbars visible** (the routine
baseline captures run with `--hide-scrollbars`): the homepage renders correctly,
the full horizontal nav is intact, the dark scrollbar sits naturally against the
cinematic ground, and nothing is broken.

**This is correct rather than merely tolerable.** There is no theme toggle in
this codebase and `.dark` is never applied; all 26 route files render inside
`.cinematic-root`. The document was already permanently dark — it just had not
told the browser. Declaring `color-scheme: dark` states what is true.

---

## Harness correction found this phase

The layout fingerprint reported **261 changed elements on `/blog`** for a page
that had not moved a pixel. Cause: element paths were indexed among *all*
siblings, and React streams a varying number of `<script>` tags into `<body>`,
so the app root's index shifted (`div[35]` → `div[34]`) and every descendant path
shifted with it. Indices now count only siblings that actually render. Verified
deterministic across repeat runs, and both phases' fingerprints were regenerated
under the corrected scheme so the comparison is like-for-like.

Two smaller harness fixes: taps now retry against a condition (`tapUntil`),
because a tap landing before React hydrates does nothing and produced
"panel opens: false" on exactly the routes `next dev` was compiling for the
first time; and every device route is pre-warmed before the suite runs.

**Operational note:** editing the `@layer base` block in `globals.css` does
**not** hot-reload in this setup. The dev server must be restarted or the old
CSS is served silently — this cost a full round of false "colour-scheme is
normal" failures before it was spotted.

---

## Route audit — before vs after

| Metric | Phase 1 | Phase 2 |
| --- | --- | --- |
| Routes measured / failed | 30 / 0 | 30 / 0 |
| Horizontal overflow | 0 | 0 |
| WCAG 2.5.8 tap failures | 0 | 0 |
| Targets < 24 px | 606 | 606 |
| Text < 12.5 px | 478 | 478 |
| Console errors | 0 | 0 |

---

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean · **349 / 349 tests pass**.

---

## Known limitations

1. **Safe-area padding is unexercised on the available hardware** (0 px insets in
   both orientations). Correct by construction, unverified in effect.
2. **iOS Safari untested** — no device. `color-scheme: dark` and `theme-color`
   are well-supported there, but this phase claims nothing about iOS.
3. The dark `<select>` popup was confirmed via computed `color-scheme` on the
   control, not by screenshotting an open native popup — a native popup cannot
   be captured through CDP.

## Remaining P2/P3

Unchanged. Phase 2 introduced no new P2/P3.

**COMMIT:** `f4a8379`
