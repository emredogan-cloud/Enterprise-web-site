# Phase 1 — Mobile navigation and the input-collapse cluster

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P0-1** (no mobile navigation) · **P1-1** (five collapsed form inputs)

---

## Objective

Give a phone user a way to reach every browse destination, and make every form
input a real field again. After this phase the site's mobile funnel exists.

---

## Implemented changes

| File | Change |
| --- | --- |
| `src/components/home/mobile-nav.tsx` | **New.** Portalled drawer + 44×44 trigger, `md:hidden`. |
| `src/components/home/cinematic-header.tsx` | Mounts `<MobileNav>` at the end of the right cluster; adds `MOBILE_NAV_ITEMS` (NAV_ITEMS + About). Desktop markup untouched. |
| `src/components/home/newsletter-section.tsx` | `h-12 flex-1` → `h-12 w-full sm:flex-1` |
| `src/components/article/author-newsletter-strip.tsx` | `h-11 flex-1` → `h-11 w-full sm:flex-1` |
| `src/components/codex/verify-form.tsx` (×2) | `h-12/h-11 flex-1` → `… w-full sm:flex-1` |
| `src/components/companion/companion-signup.tsx` | `min-w-0 flex-1` → `min-h-11 w-full min-w-0 sm:flex-1` |
| `scripts/mobile/journeys.mjs` | **New.** Device-driven interaction checks (`npm run mobile:journeys`). |
| `scripts/mobile/fingerprint.mjs` | **New.** Deterministic layout-regression gate (`npm run mobile:fingerprint`). |
| `scripts/mobile/diff.mjs` | **New.** Pixel diff, kept as human evidence (`npm run mobile:diff`). |
| `scripts/mobile/capture.mjs` | Deterministic captures: reduced-motion emulation, lazy-load pre-warm, height settling, pinned scroll. |

### The input fix

`flex-1` expands to `flex: 1 1 0%`. In a **column** flex container the main axis
is vertical, so `flex-basis: 0%` governs *height* and silently defeats `h-12`.
The homepage field measured **279 × 20 px** beside its correct 48 px button.
`w-full sm:flex-1` states the axis explicitly: full width while the form is
stacked, flex sizing once `sm:flex-row` makes the main axis horizontal. Computed
style at ≥640 px is unchanged, which the desktop gate confirms.

### The drawer

Trigger: 44 × 44, `aria-label="Menu"`, `aria-expanded`, `aria-controls`,
`aria-haspopup="dialog"`. Panel: right-hand sheet, `role="dialog"`,
`aria-modal="true"`, labelled by its own heading, rows ≥48 px, active row marked
with `aria-current="page"` and an emerald rule. Escape, backdrop tap and
navigation all close it; focus enters on open and returns to the trigger on
close; Tab and Shift+Tab are trapped; `prefers-reduced-motion` removes the slide
and fade. Safe-area padding is already wired and resolves to 0 until Phase 2
turns on `viewport-fit=cover`.

---

## Two defects found only because the tests ran on real hardware

**1. The drawer was invisible to touch.** The header carries `backdrop-blur-xl`.
A `backdrop-filter` establishes a containing block for `position: fixed`
descendants, so the panel was laid out against the **64 px header** instead of
the viewport: measured **338 × 64 at the header's origin**, with
`elementFromPoint` over every drawer link returning the hero text behind it. A
DOM dump looked perfect — correct links, correct row heights. It was completely
unusable. Fixed by portalling the overlay to `document.body`, with a comment
saying why it must stay there.

**2. Tapping a drawer link closed the drawer without navigating.** Next's
`<Link>` calls the caller's `onClick` first and navigates afterwards; `close()`
unmounted the anchor mid-handler and the navigation was lost — measured as
*panel closed, route still `/`*. The `onClick={close}` was removed; the
pathname-change check closes the drawer on arrival instead.

---

## Redmi results

**79/79 navigation checks and 83/83 total interaction checks pass** on the
physical Redmi Note 8 (2021), Chrome 152, 392 × 766 @ DPR 2.75.

Per route (`home`, `catalog`, `blog`, `cart`, `legal-terms`):

| Check | Result |
| --- | --- |
| Menu trigger present | ✅ |
| Trigger ≥ 44 × 44 | ✅ 44 × 44 |
| Trigger labelled + ARIA wired | ✅ |
| Panel opens on tap | ✅ |
| `aria-expanded` flips true | ✅ |
| Dialog semantics (`role`, `aria-modal`, labelled) | ✅ |
| All 7 destinations present | ✅ `/books /ebooks /authors /categories /blog /account/library /about` |
| Every row ≥ 48 px tall | ✅ |
| Focus moves into panel | ✅ |
| Page scroll locked (html **and** body) | ✅ |
| Background does not scroll on touch drag | ✅ |
| Escape closes | ✅ |
| Focus returns to trigger | ✅ |
| Scroll lock released | ✅ |
| Backdrop tap closes | ✅ |
| `aria-current` marks the active route | ✅ (`/books` on catalog) |

Journey: open drawer → tap **Categories** → lands on `/categories`, drawer
closed, scroll lock released. ✅

Inputs, measured on device: homepage newsletter ≥44 px ✅ · article newsletter
≥40 px ✅ · companion signup ≥40 px ✅ · blog-category sidebar ≥36 px ✅.
The homepage field is no longer in the sub-24 px target list.

### Landscape

Rotated the physical device (`user_rotation 1`). CSS viewport becomes
**986 × 392**, which is above `md`, so the trigger correctly disappears and the
full horizontal nav takes over with **8 destinations** reachable. Verified on
`/`, `/books`, `/cart`.

A raw `scrollWidth − clientWidth` of 212 px was observed on the physically
rotated device — **not** a layout defect: the element-level overflow probe found
**0 offenders**, and the same 986 × 392 viewport under CDP emulation reports no
overflow at all. `clientWidth` came back 774 against `innerWidth` 986, i.e. a
browser layout-width/zoom artifact left by rotating with a page already loaded.
Portrait re-measures clean (392 / 392 / 392, scale 1, overflow 0). Recorded so
it is not mistaken for a finding later.

---

## Route audit — before vs after

| Metric | Phase 0 | Phase 1 |
| --- | --- | --- |
| Routes measured | 30 | 30 |
| Routes failed | 0 | 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| Targets < 24 px (comfort) | 609 | **606** |
| Text < 12.5 px | 478 | 478 |
| Console errors | 0 | **0** |
| `hasMenuButton` | **false** | **true (44×44)** |
| Browse destinations from header | **0** | **7, via the drawer** |

---

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**

`/` `/books` `/ebooks` `/categories` `/authors` `/blog` `/books/[slug]` `/cart`
`/account/library` — every element's box, display, position, flex-direction,
font-size, line-height, family, colour, background, padding, margin and
grid-template compared. No differences.

The one mobile change is exactly what was intended: on every device route the
header's right cluster grows from 132 × 36 to 188 × 44 and the existing icons
shift 56 px left to make room for the trigger. Nothing else moves.

### Note on the regression method

A pixel gate was built first and abandoned as untrustworthy: **two captures of
identical code differed on 11 of 26 desktop images.** Emulating
`prefers-reduced-motion`, waiting for every image to decode, waiting for the
document height to settle and pinning the scroll offset each reduced it but
never reached zero — a late reflow shifts a fold boundary and the whole image
moves a few pixels. The gate is now a **layout fingerprint** (geometry +
computed style per element), which is **9/9 deterministic across repeat runs**.
Screenshots are still captured every phase, as evidence for a human rather than
as the gate. `npm run mobile:diff` remains available.

---

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean · **349 / 349 tests pass**.

---

## Known limitations

1. **iOS Safari untested** — no device. The drawer deliberately avoids
   `<dialog>` for this reason.
2. The drawer's links are counted by the probe only when the panel is open;
   `nav.browseDestinations` in the route audit still reports the *closed*
   header's 4 controls by design. The drawer contract is covered by
   `mobile:journeys` instead.
3. Comfort-size targets (36 px header icons, 32 px cart controls) are unchanged
   — they are Phase 8's scope. The new trigger is already 44 px.

## Remaining P2/P3

Unchanged from the audit, minus nothing. Phase 1 introduced no new P2/P3.

**COMMIT:** `fbe4bbc`
