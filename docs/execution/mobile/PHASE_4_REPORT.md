# Phase 4 — Cards, category tiles, and shelves

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P1-2** (category card titles overflow their box) · **P3-2** verified and protected

---

## Objective

Fix the category-card title collision the house rule forbids — *real book covers
plus a clear category title* — and confirm every card and shelf works under a
finger.

---

## The defect was wider than the audit recorded

The audit reported P1-2 as a mobile problem at ≤639 px. Measured across the full
width matrix, the widest title word overhangs its box at **almost every width,
including the desktop baseline**:

| Viewport | Grid | Card | Title box | Cards overhanging | Worst overhang |
| --- | --- | --- | --- | --- | --- |
| 320 px | 2-up | 136 px | **11 px** | **6 / 6** | "Philosophy" +87 px |
| 360 px | 2-up | 156 px | 31 px | **6 / 6** | +67 px |
| 392 px | 2-up | 172 px | 47 px | **6 / 6** | +51 px |
| 430 px | 2-up | 191 px | 66 px | 5 / 6 | +32 px |
| 600 px | 2-up | 284 px | 160 px | 0 / 6 | — |
| 768 px | 3-up | 227 px | 93 px | 2 / 6 | +15 px |
| **1024 px** | **5-up** | **179 px** | **45 px** | **6 / 6** | **+63 px** |
| 1280 px | 5-up | 230 px | 96 px | 1 / 6 | +12 px |
| 1440 px | 5-up | 238 px | 104 px | 1 / 6 | +4 px |

**1024 px was the worst case of all** — worse than any phone. The grid is 2-up at
base, 3-up at `sm:` and 5-up at `lg:`, so card width is **not monotonic in
viewport width** and no viewport breakpoint can express "this card is too narrow
for one row".

---

## Implemented change

`src/components/categories/category-card.tsx` only.

The card becomes a **`@container`**, and the info row adapts to *the card's own
width*:

- **Card < 228 px** — the title takes its own full-width line; the icon badge,
  book count and arrow wrap onto a row beneath it.
- **Card ≥ 228 px** — the original single row is restored exactly: badge, title,
  arrow, in DOM order, with the original spacing.
- The heading carries `lang="en"`, `hyphens-auto` and `[overflow-wrap:anywhere]`
  as a **guarantee rather than a plan**: the stacked layout already gives the
  title room at every width measured, and these make it impossible for a longer
  category name added later to paint over the badge again. Hyphenation is also
  what a book would do.

Container queries are the right tool precisely because the failure is a function
of card width, not viewport width — one rule fixes 320 px, 1024 px and everything
between.

### Result — zero ink overflow everywhere

Measured as real ink (`scrollWidth > clientWidth`, plus the heading box staying
inside the card), not as predicted word width:

| Viewport | 320 | 360 | 392 | 430 | 600 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cards overflowing | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |

---

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**

The gate caught a mistake on the way. The first version added `order-2`/`order-3`
to the badge and arrow for the stacked layout but did not reset them at
`@min-[228px]`, so at 1440 px the **badge moved from the left of the title to the
right of it** — 55 elements changed on `/categories`. Adding
`@min-[228px]:order-none` to both restored DOM order and the gate went green.

**At 1024 px the desktop layout does change**, deliberately: the cards stack.
That width was not in the pinned baseline (which is 1440/1920), and leaving it
alone would have meant knowingly shipping six colliding titles on a desktop
width. It is a defect fix, not a redesign — the same elements, the same artwork,
the same information, in an order that fits. Reviewed on a 1024 × 900 capture.

---

## Shelves and covers

Added a permanent `cards` check group to `npm run mobile:journeys`:

| Check | Result |
| --- | --- |
| Category title ink overflow at 320/360/392/430/600/768 | **0 at every width** ✅ |
| Card artwork renders at every width | ✅ |
| Cart recommendation shelf scrollable | ✅ |
| Cart shelf: next card peeks | ✅ |
| Related-books shelf scrollable | ✅ |
| Related-books shelf: next card peeks | ✅ |
| Library shelf | **skipped** — `/account/library` renders `UnprovisionedNotice` (no Clerk key in this environment) |

The peek check matters because on touch it is the *only* scroll affordance: the
scrollbar is hidden (`cart-shelf-track`) and the arrows are `sm:flex`. A future
change that makes cards exactly fill the track would silently remove it.

### Canonical asset consistency

Every book that appears on more than one surface was checked across home,
catalog, ebooks, category, search and book detail:

**10 / 10 books render the same cover file on every surface.** No drift.

---

## A deliberate non-change: which artwork the cards show

On this branch the category cards render the bespoke
`/images/categories/<slug>.webp` art rather than a fan of real book covers,
because `category-card.tsx` prefers `artSrc` when present and those six files are
committed.

**That precedence was left untouched on purpose.** Another agent has in-flight
uncommitted work in the main tree that changes exactly those lines — "the artwork
is always a fan of the real covers filed in the category; a bespoke image, when
present, layers in behind them as atmosphere rather than replacing them". Editing
the same lines here would duplicate their work and guarantee a merge conflict on
the very hunk they are writing.

This phase changed only the info row. **Expect a merge conflict on the
`<article>` element** between this branch and that work; both changes are wanted
and they compose — the container query is independent of which image renders
behind it, and of the `aspect-[3/4] sm:aspect-[5/4]` change they are making.

---

## Route audit

| Metric | Phase 3 | Phase 4 |
| --- | --- | --- |
| Routes measured / failed | 30 / 0 | 30 / 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| Text below 12 px | 0 | **0** |
| Console errors | 0 | **0** |
| Interaction checks | 104/104 | **120/120** (+1 skipped) |

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean · **349 / 349 tests pass**.

## Known limitations

1. **The library shelf is untestable in this environment** — Clerk is not
   configured, so `/account/library`, `/account/orders` and `/account/settings`
   render `UnprovisionedNotice`. Recorded as skipped, not passed. Phase 6 carries
   the same constraint.
2. The 1024 px desktop width is not part of the pinned regression baseline; the
   change there is evidenced by measurement and a capture rather than by a
   fingerprint diff.

**COMMIT:** `35032c3`
