# Phase 9 — Full regression, the tablet band, and sign-off

**Status:** ✅ **COMPLETE** — with two performance targets carried forward unmet from Phase 8
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** **P2-5** (the undesigned 640–1023 px band) · the five user journeys · the three
source-only routes · the in-app-browser check
**Adds:** `MOBILE_REGRESSION_SUITE.md`, `scripts/mobile/e2e.mjs`, `scripts/mobile/webview.mjs`,
`scripts/mobile/wvhost/`

---

## What the sweep found, and it was not small

The width matrix ran 32 routes × 7 widths on the Redmi — 224 measurements — and turned up
**three real defects that eight phases of device work had never touched**, because every
previous phase measured the phone's own 392 px and nothing else.

### 1. The `md:` breakpoint broke every page on a tablet

At an emulated **768 px, all 32 routes overflowed by 219 px.** Not a card, not a table — the
document itself was 987 px wide inside a 768 px viewport, so Chrome shrank the whole page to fit.

The cause is site-wide chrome: the header's primary nav was `hidden … md:flex`, so at exactly
768 px the desktop navigation appeared. Wordmark + seven links + the 256 px search pill + cart +
account need **987 px**. Nobody had ever looked at the band between the phone and the desktop.

Moved to `lg:` (1024 px), where the row measurably fits with 37 px to spare, and `MobileNav` from
`md:hidden` to `lg:hidden` so the drawer carries navigation up to 1023 px. Verified across
320 / 360 / 600 / 640 / 700 / 768 / 900 / 1023 / 1024:

| width | overflow before | overflow after | nav | drawer |
| --- | --- | --- | --- | --- |
| 640–1023 | **219 px** at 768+ | **0** | hidden | present |
| 1024 | 0 | 0 | present | hidden |

### 2. One bare URL dragged every blog route past a 320 px viewport

`/blog/*` overflowed by 7 px at 320 px. The article sits in a grid whose single column below `lg:`
was **implicit**, and an implicit `auto` track sizes to its items' min-content. The Hangul article
links a bare URL — `valicepress.com/companion/hangul` — 311 px of unbreakable text, in a 288 px
container.

Two fixes, because there were two mistakes:
- `overflow-wrap: anywhere` on prose links and inline code. **`anywhere`, not `break-word`:** only
  `anywhere` reduces min-content, and min-content was the thing doing the damage. `break-word`
  would have wrapped the URL on screen and left the overflow exactly where it was.
- `grid-cols-1` — the explicit `repeat(1, minmax(0, 1fr))` — so no future long token can widen the
  column again.

### 3. The catalog toolbar did not fit a 320 px phone

`/books` and `/ebooks` overflowed by 4 px: the sort dropdown and the grid/list toggle need 308 px of
a 288 px row and `flex-wrap` was off. Wrapping costs nothing at 360 px and up, where they already fit.

### Result

| | before | after |
| --- | --- | --- |
| Measurements | 224 | 224 |
| Routes failed to render | 0 | 0 |
| **Horizontal overflow** | **36** | **0** |
| WCAG 2.5.8 tap failures | 0 | 0 |
| Contrast failures / indeterminate | 0 / 0 | 0 / 0 |
| Console errors | 0 | 0 |

---

## The type floor now covers tablets

The sweep also showed **228 text nodes below 12 px at 768 px** and 236 at 1024 px. That was by
construction: Phase 3 set a 12 px floor and restored the original smaller type at `sm:` (640 px) to
leave the desktop composition untouched.

At 768 px that reasoning does not hold — a tablet is still a device held in a hand at reading
distance. The restore point moved from `sm:` to `lg:`, mechanically, across **143 occurrences in 85
files** (`text-[12px] sm:text-[Npx]` → `text-[12px] lg:text-[Npx]`).

| width | 320 | 360 | 392 | 430 | 600 | 768 | 1024 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| nodes < 12 px | 0 | 0 | 0 | 0 | 0 | **0** (was 228) | 236 (by design) |

Desktop is untouched: `lg:` starts at 1024, and the 1440/1920 gate confirms it.

---

## Landscape

**986 × 392, all 32 routes: 0 overflow, 0 tap failures, 0 text below 12 px, 0 contrast failures,
0 console errors.** Landscape had been spot-checked before; this is the first full sweep.

---

## Android System WebView — a real one, not an approximation

A large share of mobile traffic never opens a browser: links from Instagram, Gmail or WhatsApp
render in the host app's WebView. Nothing on the phone exposed a debuggable one — `/proc/net/unix`
lists Chrome and two Stetho sockets belonging to Google Messages — so this phase ships
`scripts/mobile/wvhost`: ~40 lines of Java that put one full-bleed WebView on screen, turn contents
debugging on, and load the intent's URL. It configures nothing else on purpose, so what it measures
is the **defaults** an in-app browser hands the site.

Android System WebView **151.0.7922.199** (Chrome on the same phone is 152.0.7977.75):

| route | viewport | overflow | tap | contrast | `prefers-color-scheme` | `html` background |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 392×718 | 0 | 0 | 0 | **light** | `rgb(5, 7, 5)` |
| `/books` | 392×718 | 0 | 0 | 0 | light | `rgb(5, 7, 5)` |
| `/books/meditations` | 392×718 | 0 | 0 | 0 | light | `rgb(5, 7, 5)` |
| `/cart` | 392×718 | 0 | 0 | 0 | light | `rgb(5, 7, 5)` |
| `/blog/hangul-stroke-order` | 392×718 | 0 | 0 | 0 | light | `rgb(5, 7, 5)` |

**The WebView reports `prefers-color-scheme: light` and the site is still dark and legible.** That
is Phase 2's decision paying off: the theme is a *document* theme with an explicit background on
`<html>`, not a media query. Had it been left to `prefers-color-scheme`, every in-app browser on
Android would have rendered this site light-on-light.

---

## The five journeys, walked end to end

`scripts/mobile/e2e.mjs` walks the roadmap's Journeys A–E as sequences rather than as a grid of
independent assertions: open the site, find the way in, follow it, and only then judge what you
arrived at. A journey fails where a reader would get stuck, and every step after that is recorded
as `blocked` — never as a pass, never as a separate failure.

**48 of 48 assertable steps pass. Five steps are deliberately not exercised**, each with its reason
recorded in the artifact:

| not exercised | why |
| --- | --- |
| B — Paddle overlay → return → `/order/[id]` → library | completing checkout is a real payment-provider transaction and the brief forbids faking one. Paddle is not keyed here either, so a tap would surface a config error, not a reader's experience. |
| B — "adjust the quantity" | not applicable. `src/lib/cart.ts` stores `Array<{bookId, addedAt}>`, not a quantity map, because "you can't buy two copies of the same title". There is no control to test; the line's real control is **remove**, and that is tested instead. |
| C — an Amazon-ONLY book hides the buy CTA | no Amazon-only book is published in this environment. Checked as an invariant across all published books instead, and the rule stays enforced by `valice-catalog.test.ts`. |
| D — sign in, open an owned book, download and read | Clerk is not provisioned in any `vercel env` scope. The library shell and `/read/[bookId]` are measured; the entitled path is not, and is not claimed. |
| E — the first result with the soft keyboard raised | CDP taps do not summon the Android IME, so this can only be modelled. Submitting dismisses the keyboard anyway, which is the state a reader lands in; the modelled number is recorded and the real check is in the manual list. |

---

## The defect the journeys found: the store said "Added to cart" and added nothing

Journey B tapped **Add to cart** on a real product page. The button answered **"Added to cart"**.
`/api/cart/count` stayed at **0**. The cart was empty when the reader got there.

`addToCart` returned `void` and had four legitimate early returns — unknown book, no price, no
Paddle price, already present. `BookAddToCart` ran `await addToCart(bookId); setAdded(true);` and
so claimed success unconditionally. Reproduced on the device, not inferred.

The most likely trigger here is a stale ISR page carrying a book id the database no longer has —
the catalog was being rewritten by another agent while this ran — but the trigger is beside the
point. **A store may decline to sell a book. It may not tell the reader it sold them one.**

Fixed at the contract:
- `addToCart` now returns `{ ok: true, state: "added" | "inCart" } | { ok: false, reason: "unknown" | "unavailable" }`.
- `BookAddToCart` shows "Try again" and a `role="alert"` explanation on failure, and only fires
  `add_to_cart` analytics and the `cart-changed` event when something was actually added.
- `RecommendationCard`, the other caller, respects the same result.
- Journey B carries the regression test: **"the button's claim matches the cart"** — whatever
  happened, the control and the cart must agree.

This is not mobile work. It was found by mobile work, on a real device, and left unfixed it would
have cost sales silently.

---

## A second defect: the catalog had no stable order

The desktop gate flagged three routes where a card's title had grown from one line to two. It was
not a style change: **two adjacent cards had swapped places** between two builds of identical code
(452 px and 473 px tall exchanging positions).

`listPublishedBooks`, `listEbooks`, `getFeaturedBooks` and `searchBooks` all ordered by a single
non-unique key — `publishedAt`, or `ts_rank` — and several books share a publication timestamp
because they were provisioned in one batch. Postgres may return tied rows in any order, so the
rendered page was not reproducible from one build to the next: shelves reshuffle for readers on
every revalidation, and any visual regression gate is flaky forever.

All four now break ties on `id`, the primary key.

---

## Desktop regression — read this carefully

**Against the Phase 0 baseline the gate is 4/9, not 9/9.** Every difference is accounted for, and
none of it is a layout change:

1. **The Phase 8 contrast token** — `rgb(93,103,95)` → `rgb(115,126,117)`, reported by the gate as
   *identical layout; COLOUR ONLY*, accepted deliberately in Phase 8.
2. **The ordering fix above.** Card slots now hold different books than the arbitrary order Phase 0
   happened to capture, so a card is a different height, a price string is a different width, and a
   `$0` book's add button is absent where a priced one's was present.

To separate "the design changed" from "the data changed", both code states were captured **against
the same database, back to back**: Phase 8 code, then Phase 9 code, same session, same catalog.

> `docs/execution/mobile/baseline/phase-9/ab-desktop-1440.txt`

Every difference in that A/B sits inside a catalog card — title height, price width, presence of an
add button on a `$0` line. **No box in the design moved.** Routes with no catalog list — `/authors`,
`/blog`, `/categories`, `/account/library` — are byte-identical apart from the colour token.

**This is a real limitation of the gate and it is now written down:** on catalog-driven routes the
fingerprint compares content as well as layout, so a database change reads as a regression. The
regression suite says so, and the Phase 9 capture is the baseline future phases should diff against.

---

## Routes that had never been opened on a device

`/admin`, `/order/[id]` and `/read/[bookId]` were source-only through the audit and every phase
since. All three now render on the phone and are measured every run: **35 routes, 0 overflow,
0 WCAG 2.5.8 failures, 0 text below 12 px, 0 contrast failures, 0 console errors.** `/read/[bookId]`
in particular had never been seen on a phone before this phase.

---

## Other fixes this phase

- **Companion download links were 37 px tall.** That page exists because a printed QR code points
  at it — the reader is holding the book in one hand and the phone in the other, and that link is
  the page's entire job. `min-h-11` below `sm:`, unchanged above.
- **Nine phase reports cited commit hashes that were not on the branch.** Each cited its own
  pre-amend object. All nine corrected.

---

## Harness work this phase

| | |
| --- | --- |
| `scripts/mobile/e2e.mjs` | Journeys A–E as sequences, with `blocked` and `notExercised` as first-class outcomes |
| `scripts/mobile/webview.mjs` + `wvhost/` | a real Android System WebView target, built and installed from source |
| `audit.mjs --landscape` | 986 × 392 as an orientation, not a wide portrait — the height is the point |
| `device.mjs` | foregrounds Chrome on connect; pins the browser to `en-US` |

Four harness bugs were fixed rather than worked around, because each of them had produced a
**false accusation against the product**:

1. The root layout mounts a legacy `<SiteHeader>` that `body:has(.cinematic-root) > header` hides.
   `header a[href="/cart"]` and `input[type=search]` therefore resolve to a `display:none` element
   **first**. A reachable 44 × 44 cart button was reported "control not found".
2. "Is this title clipped?" was `scrollHeight > height`. A gradient display heading
   (`background-clip: text`) reports 4–5 px of extra scroll height while `overflow: visible` paints
   every pixel — the `/categories` h1 measured 105 against 101 and lost nothing. Now it tests for an
   actual clip: an ellipsis, a line clamp, or an overflow that hides.
3. "The cover" was "the largest image on the page" — which is the interior-preview carousel, lazy
   and 2 629 px down, so legitimately undecoded. A page whose cover was on screen and painted was
   reported as missing its cover.
4. `/read/[bookId]` was scored with a naive "< 24 px" scan and flagged four footer links. SC 2.5.8
   has normative exceptions and the footer list satisfies the spacing one; the audit's own checker
   scores that route clean. It now uses the audit's checker.

And one that would have silently corrupted a whole run: a phone set to Turkish had Chrome translate
the page on arrival, so every text-matching check saw "Sepete ekle" instead of "Add to cart" and
reported every control missing. `connectDevice` now pins `accept-language` and the locale to English.

---

## Full results

| gate | result |
| --- | --- |
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| Width matrix (224 measurements) | **0 overflow · 0 tap · 0 contrast · 0 console** |
| Landscape 986 × 392 (32 routes) | **0 / 0 / 0 / 0** |
| Device audit incl. source-only (35 routes) | **0 / 0 / 0 / 0** |
| Android System WebView (5 routes) | **5/5 clean** |
| Interaction checks | **211/211**, 4 skipped with reasons |
| Journeys A–E | **48/48**, 5 not exercised with reasons |
| Desktop 1440 / 1920 | 4/9 identical — every difference traced above, no layout change |
| `npm test` | **258 passed, 91 failed** — every failure in `scripts/factory/companion-page.test.js`, and **identical with this branch's changes stashed**. No assertion weakened. |

The 91 failures are the long-standing environmental ones: that file reads print PDFs from
`~/Downloads/MY-DİGİTAL-BOOK/…`, a directory another agent rewrites continuously. They were 71 at
Phase 8 and are 91 now because that agent added books, not because anything here changed — measured
by running the suite with this branch's diff stashed and getting the same 258/91. The other 20 test
files pass.

---

## Core Web Vitals, re-measured

Dev build, 1.6 Mbps / 70 ms, median of three, on the Redmi:

| route | LCP Phase 0 | Phase 8 | **Phase 9** | CLS | INP Phase 8 | **Phase 9** |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 3 920 ms | 2 152 ms | **1 880 ms** ✅ GOOD | 0 | 240 ms | **224 ms** |
| `/books` | 2 212 ms | 2 576 ms | 3 328 ms | 0 | 216 ms | **168 ms** ✅ |
| `/books/meditations` | 4 040 ms | 3 108 ms | 3 596 ms | 0 | 256 ms | **160 ms** ✅ |

**INP improved on all three routes and now meets the 200 ms target on two of them.** CLS is 0
everywhere.

`/books` and `/books/meditations` regressed on LCP, and the reason is in the byte counts, not in
this branch: the catalogue grew from 7 books at Phase 0 to 15 while this project ran, through
another agent's commits and database writes. `/books` now ships **641 KB of images** against
324 KB on `/`. Image over-fetch — the thing this project can actually control, and the measure
Phase 8 fixed — is still 0.

These remain dev-build numbers against production targets. See below.

---

## Carried forward, unmet

1. **Production LCP and INP are still unverified for this branch.** Phase 8 measured LCP 2 152 ms
   on `/` (good), 2 576 ms on `/books` and 3 108 ms on `/books/meditations`, and INP 216–256 ms —
   all on a dev build shipping ~907 KB of unminified JavaScript, which is not a surface those
   targets apply to. The preview deployment is behind Deployment Protection (the OIDC header still
   returns 302) and a local production build cannot boot without Clerk keys. **What would close it:**
   a protection bypass on the preview, or a promoted branch measured on the real origin. The harness
   is ready — `npm run mobile:cwv -- --url <preview>`.
2. **iOS Safari is untested.** No device in the matrix, in any phase. The 16 px input-zoom threshold
   in particular is modelled, not verified; `/search`'s input is 15 px and would zoom on iOS.
3. **The soft keyboard is modelled, not raised.** CDP taps do not summon the Android IME, so
   "does the keyboard cover the results" is a manual check in the regression suite. Submitting the
   search dismisses the IME on Android, and the first result lands at 477 px of 718 px.
4. **One book is in an inconsistent commerce state.** The silent-failure UI is fixed, but a title
   whose page offers a buy button the action then declines is a provisioning gap the Founder should
   close in Paddle, not a UI problem.

**COMMIT:** `c85f22c`
