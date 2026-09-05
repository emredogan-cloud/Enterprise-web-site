# Phase 5 — Discovery: catalog, filters, search

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P1-3** (catalog buried under a filter panel) · **P1-4** (price slider drag target)

---

## Objective

Put products before filters on a phone, make the filter controls touchable, and
keep the search field and its results usable with the on-screen keyboard up.

---

## The problem, measured

On the Redmi at 392 px, before this phase:

| | `/books` | `/ebooks` |
| --- | --- | --- |
| Page height | 4 169 px | 4 223 px |
| Filter sidebar | in flow, 565 px tall, starting at 351 px | in flow, starting at 455 px |
| **First book cover** | **1 053 px down** | **1 156 px down** |

A screen and a half of hero and filter controls before a single product — for a
catalogue of **15 books**. The panel was longer than the thing it filtered.

---

## Implemented changes

| File | Change |
| --- | --- |
| `src/components/catalog/catalog-shell.tsx` | Mobile filter sheet: `Filters (n)` trigger, backdrop, dialog, scroll lock, Escape, "Show N books" confirm. Gutters `px-6` → `px-4 sm:px-6`. |
| `src/app/globals.css` | Price slider: 44 px hit area below `lg:`, visible 4 px track moved to `::-webkit-slider-runnable-track`. |
| `src/components/search/large-search-input.tsx` | On focus below `lg:`, scroll the field under the header so results survive the keyboard. |
| `scripts/mobile/journeys.mjs` | New `filters` check group (28 checks) including a **real on-screen keyboard** test. |
| `scripts/mobile/fingerprint.mjs` | Geometry-equivalence check — distinguishes "layout moved" from "DOM depth changed". |
| `scripts/mobile/probe.mjs` | Drag-target hit sampling made viewport-aware. |

### `lg:contents` is what keeps desktop safe

The same `<FilterSidebar>` instance serves both presentations, so filter state
lives in one place. The wrapper is `lg:contents`: at desktop it **generates no
box at all**, so `<aside>` remains a direct child of the grid and its
`lg:sticky lg:top-24 lg:self-start` behaves exactly as before. Re-parenting it
into a real wrapper would have broken the sticky column — the roadmap named that
as the phase's main risk.

Verified on desktop at 1440: `position: sticky`, `top: 96px`, and at
`scrollY = 900` the aside is pinned at `top = 96`. Sticky holds.

---

## Results

| Measure | Before | After |
| --- | --- | --- |
| **First cover, `/books`** | 1 053 px | **544 px** ✅ |
| **First cover, `/ebooks`** | 1 156 px | **648 px** ✅ |
| Page height `/books` | 4 169 px | 3 720 px |
| Page height `/ebooks` | 4 223 px | 3 775 px |
| Sidebar in flow when closed | yes (565 px) | **no** |
| Filters trigger | — | **361 × 44 px** with active count |
| **Price slider hit height** | **16 px** | **44 px** ✅ |
| Slider visible track | 4 px | **4 px (unchanged)** |
| Numeric price readout | present | present, verified |

### On the price slider, precisely

The audit called this a WCAG 2.2 SC 2.5.8 conformance failure. **It was not.**
The automated spacing-exception evaluation returns zero conformance failures
site-wide: an isolated undersized control is carried by the spacing exception.

It was fixed anyway, because a **16 px drag target is genuinely hard to operate
with a finger** — and the audit's own "0 px hit height" figure was itself wrong:
`elementFromPoint` returns null for anything off-screen, and the slider sat at
y = 881 on a 718 px viewport. Sampled with the control actually in view, the real
hit height was 16 px, from the thumb overhanging the 4 px track. The probe now
refuses to report a hit height for an off-screen element.

The element grows to 44 px and paints nothing itself; the visible 4 px track
moves to `::-webkit-slider-runnable-track`. **The control looks identical and
only its touch surface changes**, and the rule is scoped under 1024 px so the
desktop sidebar does not grow 40 px taller.

### The on-screen keyboard — tested for real

Not simulated. Tapping the search field on the Redmi raises a **255 px IME**;
the visual viewport drops **719 px → 464 px**.

| | Before | After |
| --- | --- | --- |
| Search field top | 313 px | **12 px** |
| Field visible with keyboard up | yes | yes |
| First result top | 477 px | **177 px** |
| **First result visible with keyboard up** | **no — 13 px below the fold** | **yes** ✅ |

The browser did not scroll on its own because the field was already in view
*before* the keyboard arrived. A focus handler now lifts it under the header, on
phone and tablet only.

---

## Redmi results

**148/148 interaction checks pass**, 1 honestly skipped. The new `filters` group
(28 checks) covers, on both `/books` and `/ebooks`: first cover within 720 px ·
panel out of flow when closed · trigger ≥ 44 px · sheet opens on tap · dialog
semantics · `html` **and** `body` scroll locked · slider hit ≥ 44 px · numeric
readout · filtering updates results and the trigger's count badge · Escape
closes · lock released. Plus five search checks including the live IME.

---

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**

`catalog` and `ebooks` were initially reported as 319 and 309 elements changed.
They had not moved: the `display: contents` wrapper adds a DOM level, which
renames every descendant path in a path-keyed comparison. Verified by comparing
the **multiset of element signatures** instead — 434 nodes, identical page
height, **zero signatures differing in either direction**. The gate now performs
that check itself and reports *"identical geometry; DOM depth changed — N paths
renamed"* rather than crying regression.

---

## Route audit

| Metric | Phase 4 | Phase 5 |
| --- | --- | --- |
| Routes measured / failed | 30 / 0 | 30 / 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| Text below 12 px | 0 | **0** |
| Targets < 24 px (comfort) | 606 | 602 |
| Console errors | 0 | **0** |

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean.

**Test suite: 278 passed, 71 failed — all 71 pre-existing and environmental, none
caused by this branch.**

The failures are confined to `scripts/factory/companion-page.test.js`, which
reads print PDFs from `/home/emre/Downloads/MY-DİGİTAL-BOOK/...` — an absolute
path *outside the repository*. Mid-session, another agent emptied
`GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/`, so every assertion against those
files now fails.

Verified not to be this branch's doing: **the identical 71 failures reproduce in
the main working tree**, at its own newer commit `a2dd7bb`, with none of this
branch's changes present. This branch touches no file that suite reads. The
suite passed 349/349 in Phases 0–4 of this same branch, before that directory
was emptied.

No assertion was weakened, skipped or deleted.

## Known limitations

1. **The sheet is a full-height panel, not a draggable bottom sheet.** It opens
   below the header, scrolls internally and closes by Escape, backdrop, the X or
   "Show N books". A drag-to-dismiss gesture was not built — it adds a custom
   touch handler for no measured benefit.
2. **iOS Safari untested.** The IME result above is Android Chrome only; iOS
   resizes the visual viewport differently.
3. `/account/*` remains unprovisioned locally, so the library shelf check stays
   skipped.

**COMMIT:** `3988f31`
