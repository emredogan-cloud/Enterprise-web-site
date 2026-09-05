# Phase 8 — Accessibility, performance, motion

**Status:** ⚠️ **COMPLETE WITH TWO CRITERIA NOT MET AND ONE UNVERIFIABLE** — see *Targets*
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P2-1** (comfort tap targets) · **P2-8** (skip link) · **P3-4** (reveal flash) · contrast measured for the first time
**Corrects:** the roadmap's hover-guard item (already satisfied by Tailwind v4)

---

## Targets — stated plainly

| Target | Result |
| --- | --- |
| **LCP ≤ 2.5 s** | ⚠️ **met on `/` only** (2 152 ms). `/books` 2 576 ms, `/books/meditations` 3 108 ms. **Dev build.** |
| **CLS ≤ 0.1** | ✅ 0 / 0.0007 / 0 |
| **INP ≤ 200 ms** | ❌ **not met** — 240 / 216 / 256 ms. **Dev build.** |
| Homepage transfer −30 % | ❌ not met as a byte total; see *On payload* |
| No target < 24 px without a valid exception | ✅ **0 WCAG 2.5.8 failures** across 32 routes |
| **Contrast (SC 1.4.3)** | ✅ **0 failures, 0 indeterminate** across 32 routes |

**The LCP and INP numbers are from a dev build and cannot be judged against a
production target.** This build ships ~907–929 KB of unminified JavaScript;
production ships ~250 KB. Verifying the production target for this branch was
attempted and is **blocked** — see *Why production could not be measured*.

---

## Movement since Phase 0 (same dev surface, like for like)

| Route | LCP Phase 0 | LCP now | CLS Phase 0 | CLS now |
| --- | --- | --- | --- | --- |
| `/` | 3 920 ms | **2 152 ms (−45 %)** ✅ GOOD | 0.0341 | **0** |
| `/books` | 2 212 ms | 2 576 ms | 0.0008 | 0.0007 |
| `/books/meditations` | 4 040 ms | **3 108 ms (−23 %)** | 0 | 0 |

---

## Images: the real, structural win

Rather than chase byte totals, over-fetch was measured directly — requested
image width against the slot's actual device-pixel need, with the viewport
override cleared and the cache disabled:

| Route | Images over-fetching ≥ 2× — before | after |
| --- | --- | --- |
| `/books/meditations` | **6** (worst 2.74×: 828 px for a 302 px slot) | **0** |
| `/books` | 0 | 0 |
| `/blog` | 0 | 0 |
| `/` | 0 | 0 |

Two causes, both fixed:

1. **Phase 6's cover cap invalidated its own `sizes`.** Capping the cover at
   `w-[72%]` left `sizes="… 100vw"`, so Next's preload picked **w=1200 for a
   710 device-pixel slot** — the LCP asset on that route.
2. **`BookCover` served two very different contexts from one hard-coded hint.**
   The same component renders the 258 px hero cover *and* the 103–211 px shelf
   tiles. It now takes a `sizes` prop; `CinematicBookTile` passes its own,
   measured across 392 / 768 / 1440.

Max remaining over-fetch is **1.61×**, which is inherent to Next's width ladder
(a 399 px need has no candidate between 384 and 640).

### A finding I nearly reported, and retracted

Every `<img>` appeared to lack `srcset` and be served at `w=3840` — in
production as well as dev. That would have been a serious site-wide defect.
It was wrong: React serialises the attribute as **`srcSet`** (camelCase) and the
grep was case-sensitive. All images carry full responsive srcsets. Verified
before writing anything down.

---

## Accessibility

| Item | Before | After |
| --- | --- | --- |
| **Skip link** | absent | first focusable element on every route, `#main-content`, 1×1 until focused then **142 × 45** |
| `id="main-content"` | — | added to `<main>` on all **27** route files |
| Header controls | 36 × 36 | **44 × 44** below `sm:` (5 controls) |
| Wordmark link | 23 px tall | **44 px** below `sm:`, unchanged at `sm:`+ |
| **Contrast (SC 1.4.3)** | **never measured** | **measured; 0 failures** |
| Reduced motion | honoured | verified: transition ≈ 0 s under emulation |

### Contrast — measured, and what it took to measure honestly

The audit never measured contrast. Doing it properly needed three corrections to
the checker before the numbers meant anything:

1. **Backdrop resolution.** Bailing on any ancestor with a `background-image`
   left **346 of ~350 text nodes unmeasurable** — `.cinematic-root` carries
   atmospheric gradients. The walker now averages gradient colour stops and
   marks the result approximate.
2. **`background-clip: text`.** The emerald display headings paint their
   gradient *onto the glyphs*. Measured naively they scored **1.42:1** when the
   true ratio is about **12.5:1**. The gradient is now read as the ink, not the
   backdrop.
3. **CTA buttons.** Dark text on an emerald gradient scored 1.11:1 for the same
   reason. Fixed by the same change.

With the checker correct, exactly **one genuine defect** remained: the
`fg-fade` token — `#5d675f` on the cinematic ground — measured **3.44:1 at 13 px
and 3.25:1 at 12 px** against a required **4.5:1**. Raised to **`#737e75`**,
which measures **4.78:1** and keeps the recessive quality the token exists for.

**Result: 0 contrast failures and 0 indeterminate nodes across all 32 routes.**

### Reveal flash (P3-4)

`RevealOnScroll` shipped its markup visible and applied the hiding attribute in
an effect, so a section painted, vanished at hydration, and faded back in. The
attribute is now rendered **on the server**; staggered blocks hide their children
via a wrapper attribute; and a `<noscript>` rule forces everything visible if
JavaScript never arrives, so this can never hide content permanently. Verified:
the hiding attribute is present in the SSR markup.

### The hover guard was already there

The roadmap asked for `@media (hover: hover)` around 268 `hover:` utilities.
**Tailwind v4 already does this** — the compiled stylesheet contains **82**
`@media (hover: hover)` blocks and every `hover:`/`group-hover:` rule sits inside
one. No change was needed. Recorded as an audit assumption that did not hold.

---

## Why production could not be measured

The roadmap's LCP target is a production target. Two routes were attempted:

1. **A Vercel preview deployment** (authorised by the brief §40). It deployed
   successfully, but sits behind **Deployment Protection**. The documented
   browser path — attaching `x-vercel-trusted-oidc-idp-token` — still returns
   **302 to `vercel.com/sso-api`**, over both CDP and plain curl. The skill for
   this explicitly rules out disabling protection or requesting a long-lived
   bypass secret, and both are access-control changes needing the Founder.
2. **A local production build.** `next start` refuses to boot:
   `@clerk/nextjs: Missing publishableKey`. `vercel env run` confirms the Clerk
   keys are **not present in the development environment** either, so the build
   cannot be served locally.

**What would close it:** the Founder either grants a protection bypass for the
preview, or promotes the branch and it is measured on the real origin. The
harness is ready — `npm run mobile:cwv -- --url <preview>` already attaches the
OIDC header when the environment provides one.

The preview is left deployed at
`valicepress-book-site-6197xh3x5-emre30283-4955s-projects.vercel.app`.
**It is a preview only. Nothing was promoted to production.**

## On payload

The ≥30 % homepage-transfer target is not met as a byte total, and the figure is
not meaningful on this surface: dev JavaScript dominates (907 KB unminified), and
the catalogue grew from 7 to 24 books during this project through another agent's
commits, which raised image bytes independently of anything done here. The
defensible, structural measure is over-fetch — reported above, and now zero.

## Redmi results

**210/210 interaction checks pass**, 5 honestly skipped. New `a11y` group (28
checks): skip link is first focusable, its target exists, it becomes visible on
focus, header controls ≥ 44 px, one `<h1>`, landmarks present, reduced motion
neutralises the reveal, and the hiding attribute is in the SSR markup.

## Route audit

| Metric | Phase 7 | Phase 8 |
| --- | --- | --- |
| Routes measured / failed | 32 / 0 | 32 / 0 |
| Horizontal overflow | 0 | **0** |
| WCAG 2.5.8 tap failures | 0 | **0** |
| **Contrast failures** | not measured | **0** |
| **Contrast indeterminate** | not measured | **0** |
| Text below 12 px | 0 | **0** |
| Console errors | 0 | **0** |

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080 — layout identical,
colour only.** The gate now classifies this explicitly, reporting e.g.
*"identical layout; COLOUR ONLY — −19 rgb(93, 103, 95), +19 rgb(115, 126, 117)"*.
The only desktop-visible change is the contrast token, which is global by nature
and is Phase 8's own accessibility remit.

The gate caught two mistakes on the way: the wordmark's `min-h-11` was applied at
every width (it grew 23 → 44 px on desktop) and has been scoped to below `sm:`;
and the skip link's `sr-only` plus padding produced a 41 × 25 clipped box instead
of 1 × 1, so the padding is now focus-only.

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean.
**278 passed, 71 failed** — the same pre-existing environmental failures recorded
since Phase 5. No assertion weakened.

## Known limitations

1. **LCP ≤ 2.5 s is met only on `/`, and only on a dev build.** Not verified for
   production. Carried to Phase 9.
2. **INP ≤ 200 ms is not met** (216–256 ms on a dev build, where React's
   development event handling inflates it). Not verified for production.
3. **iOS Safari untested** throughout.

**COMMIT:** `c8f93f2`
