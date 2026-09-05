# Phase 3 — Containers, spacing, and editorial typography

**Status:** ✅ COMPLETE — **with one acceptance criterion revised on evidence** (see *Scroll depth*)
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P2-2** (text below 12 px) · **P2-3** (vertical rhythm) · **P2-9** (inconsistent gutters)
**Corrects:** **P2-4** — the audit's "blog line-height 1.35" was a measurement error; see below.

---

## Objective

Make the vertical rhythm and type scale fit a 718 px viewport without flattening
the editorial voice.

---

## Implemented changes

| Area | Change | Scope |
| --- | --- | --- |
| **Type floor** | 144 declarations: `text-[9px]/[10px]/[11px]` → `text-[12px] sm:text-[Npx]` across 85 files | below `sm:` only |
| **Section rhythm** | 29 class strings: `py-N` → `py-M sm:py-N`, `py-N sm:py-P` → `py-M sm:py-N lg:py-P`, `mt-N` → `mt-M sm:mt-N`. Mobile map 16→10, 20→12, 24→14, 28→16, 32→16 | below `sm:` only |
| **Footer** | Link columns 2-up below `sm:`; brand column spans both. `sm:` and `lg:` restated at existing values | below `sm:` only |
| **Gutters** | 12 page containers: flat `px-6` → `px-4 sm:px-6` | below `sm:` only |
| **Harness** | `bodyType` scoped to the reading column; `textBelow12` and `docScrollH` added; backtick guard in the probe | — |

---

## Results

### Type floor — target met

| Size | Phase 2 | Phase 3 |
| --- | --- | --- |
| 9 px | 2 | **0** |
| 10 px | 26 | **0** |
| 11 px | 198 | **0** |
| 12 px | 252 | 478 |
| **Below 12 px** | **226** | **0** ✅ |

Every text node that carries meaning is now at least 12 px on a phone; the
original sizes are restored from 640 px up. Verified on the device that the
12 px eyebrow labels (`NEW · CURATED DIGITAL LIBRARY`, `BROWSE BY CATEGORY`,
`PRICE`) still set on one line with their `0.2em`–`0.3em` tracking intact — the
editorial voice is unchanged, just legible.

### Scroll depth — criterion revised on evidence

The roadmap asked for **≥25 %** on the worst routes. **Delivered: −10.6 % across
all 30 routes (median −10.2 %, best −26.9 %, home −10.5 %).** The target is not
met, and the reason is arithmetic rather than effort.

Measured composition of the homepage after this phase (6 317 px):

| Band | Height |
| --- | --- |
| Header | 65 px |
| Hero section | 1 448 px |
| Four content sections | 4 102 px, of which **448 px is section padding** |
| Footer | 702 px, of which **80 px is padding** |
| **All section padding** | **528 px = 8.4 % of the page** |

Reducing *every scrap* of vertical padding to zero would take the homepage from
7 060 px to 5 789 px — **−18 %**, still short of −25 %, and it would look
broken. The remaining height is hero, cards, prose and footer *content*.
Reaching −25 % would require cutting content or compressing the reading
typography, both of which the roadmap explicitly forbids (§31, §44, and this
phase's own "do not flatten into generic SaaS typography").

**The target was written during the audit on the assumption that section padding
dominated page height. The measurement shows it is 8.4 %.** What was actually
available has been taken: the base rhythm now scales down instead of up, and the
footer — 1 086 px, 1.5 screens of links on every route — is now 702 px, a 35 %
cut with no information removed. Further reduction belongs to Phase 4 (card
geometry), not here.

| Route | Phase 2 | Phase 3 | Change |
| --- | --- | --- | --- |
| `blog-article` | 9 900 | 9 418 | −4.9 % |
| `home` | 7 060 | 6 317 | −10.5 % |
| `legal-terms` | 6 234 | 5 728 | −8.1 % |
| `book-detail` | 6 063 | 5 458 | −10.0 % |
| **All 30 routes** | **140 854** | **125 867** | **−10.6 %** |

### Reading rhythm — the audit was wrong, and no change was needed

`MOBILE_CURRENT_STATE_AUDIT.md` recorded P2-4 as "blog article body 18 px with
**24.375 px** line-height = **1.35** — tight for reading". Measured properly on
the device, the article's reading column is:

```
.cinematic-prose p → font-size 18px, line-height 31.5px, ratio 1.75, 39 chars/line
```

**1.75, not 1.35.** The audit's probe took `document.querySelectorAll("p")[0]`,
which on an article page is the hero standfirst, not the body — a different
element with different type. The reading column was already correct and has been
left alone. The probe now scopes `bodyType` to `.cinematic-prose` when present,
so the number cannot be misread again.

For reference, Standard Ebooks — the closest peer measured on the same device —
runs 19.36 px / 1.50. Valice Press's 18 px / 1.75 is comparable and arguably
more generous.

### Reading the article on the device

Per the roadmap, signed off by reading, not by screenshot review: the full
Hangul article was scrolled end to end on the Redmi — **14 screens, 16
paragraphs, maximum horizontal overflow 0 px at every scroll position**.
Ordered lists, bold runs, emerald bullets, serif headings and the closing
related-book card all render correctly.

---

## Desktop regression — and the regression this gate caught

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**

**The first attempt failed the gate, and that is the point of having one.**
The type floor was initially written as `text-[11px]` → `text-xs sm:text-[11px]`.
Tailwind's `text-xs` sets font-size **and** line-height, while an arbitrary
`text-[11px]` sets font-size only and leaves leading at `normal`. Pairing them
changed the **desktop** line-height of every one of those 143 elements:

```
11px label   line-height 16.5px    → 14.6667px
10px kbd     line-height 14.2857px → 13.3333px
```

`/account/library` shrank by 4 px and 84 elements moved. No screenshot review
would have found this. Rewritten as `text-[12px] sm:text-[11px]` — an arbitrary
size that raises the floor without touching leading — and the gate went green.

---

## Route audit — before vs after

| Metric | Phase 2 | Phase 3 |
| --- | --- | --- |
| Routes measured / failed | 30 / 0 | 30 / 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| **Text below 12 px** | **226** | **0** ✅ |
| Targets < 24 px (comfort) | 606 | 606 |
| Console errors | 0 | **0** |
| Interaction checks | 104/104 | **104/104** |

---

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean · **349 / 349 tests pass**.

---

## Known limitations

1. **The ≥25 % scroll-depth criterion is not met and cannot be met by spacing.**
   Documented above with the measurement. Recorded as a revision, not a pass.
2. Two multi-line `className` strings in `book-preview-pages.tsx` were briefly
   collapsed onto one line by the transform; the wrapping was restored, and the
   classes are unchanged.
3. `tinyTextTotal` (478) counts everything under 12.5 px, which includes 12 px
   `text-xs`. The acceptance number is `textBelow12`, now reported separately.

## Remaining P2/P3

- **P2-1** comfort targets (36 px header icons, 32 px cart controls) — Phase 8.
- **P2-5** the 640–1023 px band — Phase 9. This phase began designing it: the
  `sm:` step now carries the former desktop rhythm rather than inheriting phone
  values.
- **P2-6** Korean fallback — Phase 7. **P2-7** iOS input zoom — untestable.
- **P2-8** skip link — Phase 8. **P3-2/3/4** unchanged.

**COMMIT:** `0c7bb3d`
