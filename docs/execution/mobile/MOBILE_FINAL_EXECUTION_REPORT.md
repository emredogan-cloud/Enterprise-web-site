# Valice Press — mobile optimization, final execution report

**Branch:** `feature/mobile-optimization` — **NOT merged, and not to be merged by me.**
**Base:** `a2dd7bb` on `main` · **Head:** see the table below
**Reference device:** Redmi Note 8 (2021) `M1908C3JGG`, Android 11, Chrome 152.0.7977.75,
**392 × 718 CSS px @ DPR 2.75**
**Dates:** 2026-09-04 (audit) → 2026-09-05 (execution)

---

## The one-paragraph version

Nine phases, nine commits, every one measured on a real phone over the Chrome DevTools Protocol
rather than in an emulator. The roadmap's only P0 — **there was no way to browse this store from a
phone at all** — is closed. So are all four P1s. The 640–1023 px band, which nobody had ever
designed or tested, turned out to be broken on every route and is now correct. Two defects that
have nothing to do with layout surfaced on the device and are fixed: the store told readers it had
added a book to their cart when it had not, and the catalogue had no stable sort order. Two
performance targets are **not** met and are stated as such: production LCP and INP could not be
measured on this branch at all, and the dev-build numbers they would be judged by miss on two of
three funnel routes.

---

## Phase status

| Phase | Commit | Status |
| --- | --- | --- |
| 0 — Instrumentation and device harness | `99f21bc` | ✅ complete |
| 1 — Navigation and the input-collapse cluster | `fbe4bbc` | ✅ complete — **the P0** |
| 2 — Document theme, viewport, safe areas | `f4a8379` | ✅ complete |
| 3 — Responsive containers, spacing, editorial type | `0334dc9` | ✅ complete |
| 4 — Cards, category tiles, shelves | `10c1216` | ✅ complete |
| 5 — Discovery: catalog, filters, search | `3988f31` | ✅ complete |
| 6 — Consideration and purchase | `c23bcc2` | ✅ complete |
| 7 — Editorial surfaces | `62378d2` | ✅ complete |
| 8 — Accessibility, performance, motion | `8102fa7` | ⚠️ complete; **LCP and INP not met** |
| 9 — Full regression, tablet band, sign-off | `c85f22c` | ✅ complete |

Each phase has its own report in this directory with what was measured, on what surface, and what
was not met. `MOBILE_REGRESSION_SUITE.md` is the runnable checklist that keeps it from rotting.

---

## Final numbers, on the device

| | Phase 0 | Now |
| --- | --- | --- |
| Browse destinations reachable from a phone header | **0** | 7, via a focus-trapped drawer |
| Routes with horizontal overflow (device width) | 4 | **0** |
| Routes with horizontal overflow (7 widths × 32 routes) | not measured — **36** when first swept | **0** |
| WCAG 2.5.8 tap-target failures | 14 | **0** |
| Contrast failures (SC 1.4.3) | never measured | **0**, and 0 indeterminate |
| Text below 12 px, 320–1023 px | 464 nodes | **0** |
| Console errors across all routes | 0 | **0** |
| Collapsed form inputs | 5 | **0** |
| Images over-fetching ≥ 2× | 6 | **0** |
| Zoom suppression | `maximum-scale=1` | removed |
| Skip link | absent | on all 27 route files |
| Routes never opened on a device | 6 | **0** |
| Interaction checks | — | **211/211** |
| End-to-end journeys A–E | — | **48/48**, twice consecutively |

**Core Web Vitals (dev build, 1.6 Mbps / 70 ms, median of three):**

| route | LCP then | LCP now | CLS now | INP now |
| --- | --- | --- | --- | --- |
| `/` | 3 920 ms | **1 880 ms** ✅ | 0 | 224 ms |
| `/books` | 2 212 ms | 3 328 ms | 0 | **168 ms** ✅ |
| `/books/meditations` | 4 040 ms | 3 596 ms | 0 | **160 ms** ✅ |

---

## What was found that nobody asked for

Three of the most valuable findings were not on the roadmap. Real-device work produces that.

1. **"Added to cart" was a lie.** `addToCart` had four legitimate early returns and no return value;
   the button set its success state regardless. Tapped on a real product page: button said Added,
   cart count stayed 0, cart was empty. Fixed at the contract, with a regression check in Journey B.
2. **The catalogue had no stable order.** Four queries sorted on a single non-unique key, so tied
   rows came back in whatever order Postgres felt like. Shelves reshuffled between builds; the
   visual regression gate could never have been trusted. All four now break ties on the primary key.
3. **The `md:` breakpoint broke every page between 768 and 1023 px** — 219 px of overflow on all 32
   routes, because the desktop header appeared 256 px before it fits.

And three assumptions in the audit turned out to be wrong, each corrected on evidence rather than
carried forward: the hover guard already existed (Tailwind v4 emits it), the blog line-height was
1.75 and not 1.35, and the ≥25 % scroll-depth target was arithmetically impossible.

---

## Not met, and why

1. **Production LCP ≤ 2.5 s and INP ≤ 200 ms are unverified for this branch.** Every number above is
   from a dev build shipping ~907 KB of unminified JavaScript against production's ~250 KB, which is
   not a surface those targets apply to. Both routes to a production measurement are closed: the
   preview deployment sits behind Deployment Protection and the documented OIDC header still returns
   302, and a local production build cannot boot because Clerk keys are absent from every
   environment `vercel env run` exposes. **What would close it:** a protection bypass for the
   preview, or the branch promoted and measured on the real origin. The harness is ready —
   `npm run mobile:cwv -- --url <preview>`.
2. **LCP misses on two funnel routes even on the dev surface** — `/books` 3 328 ms and
   `/books/meditations` 3 596 ms. `/` is good at 1 880 ms, down 52 % from Phase 0. The two that miss
   got slower as the catalogue grew from 7 books to 15 during this project through other work;
   `/books` now ships 641 KB of images. Image over-fetch, the part this project controls, is zero.
3. **iOS Safari is untested, in every phase.** No device in the matrix. Input zoom below 16 px,
   `-webkit-fill-available` and bounce-scroll backgrounds are planned for and unverified. `/search`'s
   input is 15 px and would zoom on iOS.
4. **The soft keyboard is modelled, not raised.** CDP cannot summon the Android IME. Submitting a
   search dismisses it anyway, which is the state a reader lands in; the overlap check is in the
   manual list in the regression suite.
5. **One title is in an inconsistent commerce state** — its page offers a buy button the server then
   declines. The lying UI is fixed; the provisioning gap is a Paddle action for the Founder.
6. **The desktop gate is 4/9 against Phase 0, not 9/9.** Every difference is traced to the Phase 8
   contrast token or the Phase 9 ordering fix; an A/B capture against the same database shows no box
   in the design moved. Diff future phases against `baseline/phase-9/`.

---

## Desktop regression

The gate is a **layout fingerprint** — geometry and computed style per element — not a pixel diff.
Pixel diffing this site does not work: 11 of 26 captures differed on identical code because the hero
canvas animates and reveal observers fire at slightly different offsets. The fingerprint is
deterministic, 9/9 stable on unchanged code, and it caught three mistakes during this project that
would otherwise have shipped: `text-xs` silently changing desktop line-height on 143 elements, the
wordmark growing 23 → 44 px at every width, and the skip link rendering as a 41 × 25 clipped box
instead of 1 × 1.

---

## What the branch contains

- **Product:** the drawer nav, the document theme, the 12 px type floor to 1023 px, container-query
  category cards, the filter sheet and usable price slider, price and CTA above the fold, the TOC
  disclosure, the skip link and 44 px controls, the contrast token, `sizes` on covers, the honest
  add-to-cart, and a total order for the catalogue.
- **Harness** (`scripts/mobile/`): the CDP driver, the in-page probe with a full SC 2.5.8 and SC
  1.4.3 implementation, the route audit with a width matrix and landscape mode, the interaction
  checks, the end-to-end journeys, the Core Web Vitals runner, the layout fingerprint gate, the
  capture tool, and a build-from-source Android System WebView host.
- **Evidence** (`docs/execution/mobile/baseline/phase-N/`): audits, journeys, CWV, fingerprints and
  capture sets for every phase, including the A/B that separates the data change from the code
  change on desktop.
- **Documentation:** ten phase reports, the annotated roadmap, and the regression suite.

---

## For the Founder

**Do not merge this on my say-so — that is your call, and the brief says so.** Before merging, the
two things worth doing are:

1. **Get a production measurement.** Grant a Deployment Protection bypass for the preview, or
   promote the branch to a preview you can open, and run `npm run mobile:cwv -- --url <url>`. Until
   then the LCP and INP targets are open.
2. **Look at the 640–1023 px band on a tablet if you have one.** It is correct by measurement, but
   it is the part of the site that has changed the most and that nobody has ever *looked* at.

Then: `scripts/mobile/wvhost` installed a debug-signed test app on the phone during QA. Remove it
with `npm run mobile:webview -- --uninstall`.

# DO NOT MERGE.
