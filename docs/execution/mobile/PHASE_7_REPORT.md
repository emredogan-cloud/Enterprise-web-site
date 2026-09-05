# Phase 7 — Editorial surfaces: blog, authors, categories, companions

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P2-6** (Korean font strategy — decided on evidence) · reading-sidebar placement · share-control sizing

---

## The article started 1.6 screens down

Measured on the Redmi at 392 × 718:

| | Before | After |
| --- | --- | --- |
| `<h1>` | 235 px | 235 px |
| Table of contents card | **408 px tall, in flow** | **44 px disclosure, closed** |
| Share row | 1 033 px, buttons **36 px** | 858 px, buttons **44 px** |
| **Article body starts** | **1 134 px** | **967 px** ✅ |
| Page height | 9 436 px | 9 254 px |

The reading sidebar had no `hidden lg:block`, so on a phone the whole
table of contents and the share row sat between the headline and the first
sentence. Below `lg:` the TOC is now a disclosure — a 44 px labelled toggle,
closed by default, with `aria-expanded` and `aria-controls`. At `lg:` the
sticky sidebar column is untouched: the toggle is hidden and the list is always
shown.

Verified on device: closed → list hidden, `aria-expanded="false"`, body at
967 px. Tapped → list 185 px, `aria-expanded="true"`, and every TOC link
resolves to a real heading id.

---

## The Korean decision, made on measurement

The audit recorded P2-6: Hangul falls back to `Noto Sans CJK SC`, a
**Simplified-Chinese** face, rather than a Korean one. The roadmap asked for a
deliberate decision, with payload measured.

**Decision: ship no Korean webfont, and add no font-family fallback. Mark the
language instead.**

The evidence:

1. **There are six Hangul characters in the entire product**, on one route:
   `"Hangul practice grid (원고지 style)"` on `/companion/hangul`. Three distinct
   glyphs. `/blog/hangul-stroke-order` and the Hangul workbook product page
   contain **zero** Hangul — they are written in English about Korean.
2. **A CSS fallback stack cannot work on the reference device.** Every candidate
   family name was tested with `CSS.getPlatformFontsForNode` on the Redmi:

   | Requested | Actually used |
   | --- | --- |
   | `Noto Sans KR` | Noto Sans CJK SC |
   | `Noto Sans CJK KR` | Noto Sans CJK SC |
   | `Apple SD Gothic Neo` | Noto Sans CJK SC |
   | `Malgun Gothic` | Noto Sans CJK SC |
   | `Nanum Gothic` | Noto Sans CJK SC |
   | `Noto Sans CJK JP` | Noto Sans CJK SC |

   Android ships **one** unified CJK font and maps every CJK family request to
   it. Naming Korean faces in a stack is provably a no-op here.
3. **The only mechanism that would work is a Korean webfont** — tens of
   kilobytes, even subsetted, and a render-blocking font request added to a
   route whose purpose is downloading practice PDFs, for three glyphs.
4. `Noto Sans CJK SC` renders Hangul **correctly**. The objection was
   typographic flavour, not legibility or correctness.

**What was done instead, because it is cheap and genuinely useful:** the Hangul
run is wrapped in `<span lang="ko">` (`src/lib/lang-runs.tsx`). That satisfies
**WCAG 2.2 SC 3.1.2 Language of Parts (AA)** — assistive technology now
pronounces it as Korean rather than reading it with an English voice — costs
zero bytes, and makes a `:lang(ko)` rule possible the day a Korean face is
actually available. Verified in the served HTML.

---

## Share

`navigator.share` is available on the device, so the "Share via system" button
is the real primary path on a phone; the X / Facebook / LinkedIn fallbacks
remain for browsers without it. All share controls raised **36 px → 44 px**
below `sm:`, restored to 36 px at `sm:` and above.

---

## Redmi results

**182/182 interaction checks pass**, 5 honestly skipped. New `editorial` group
(22 checks): TOC disclosure state, toggle size, article start position, share
sizing, native share availability, reading rhythm, TOC open-on-tap, TOC anchor
integrity, Korean language marking, and clean render (no overflow, no broken
images) across `/authors`, `/authors/[slug]`, `/categories/[slug]`,
`/blog/category/[slug]` and `/companion/[slug]`.

Reading rhythm re-confirmed at **18 px / 1.75** — unchanged, and correct since
Phase 3 established the audit's "1.35" was a mis-measurement.

## Route audit

| Metric | Phase 6 | Phase 7 |
| --- | --- | --- |
| Routes measured / failed | 32 / 0 | 32 / 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| Text below 12 px | 0 | **0** |
| Targets < 24 px (comfort) | 645 | 636 |
| Console errors | 0 | **0** |

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080.**

The article page is not in the pinned nine, so it was checked explicitly at
1440: TOC list **visible** (221 px), toggle **hidden**, "On this page" heading
present, aside still `position: sticky`, share buttons back to **36 px**.
Desktop is untouched.

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean.
**278 passed, 71 failed** — the same pre-existing environmental failures
recorded in Phases 5 and 6 (external print-PDF directory emptied by another
agent). No assertion weakened.

## Known limitations

1. **Hangul still renders in `Noto Sans CJK SC`** on Android. Documented as a
   deliberate decision above, not an oversight.
2. `lang="ko"` marking is applied at the one render site that needs it. If
   Korean copy is added elsewhere, `withLangRuns` should be applied there too.
3. **iOS Safari untested** — `navigator.share` behaviour there is unverified.

**COMMIT:** `eb29970`
