# Phase 0 — Instrumentation and device harness

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization` (isolated git worktree at `/home/emre/Downloads/valice-mobile-wt`)
**Base commit:** `9736f56` — *feat(public-domain): PHASE 2 book 1 — Falkener OCR corrected against the page images*
**Commit:** see `COMMIT` line at the end of this report.

---

## Objective

Make the Redmi loop reproducible and committed, and establish the numbers every
later phase is measured against. **No product UI was changed in this phase.**

---

## Implemented changes

| File | What it is |
| --- | --- |
| `scripts/mobile/device.mjs` | CDP driver. Device + desktop targets, health assertion, adaptive navigation, render-failure detection, viewport/throttle/cache control, device wake. |
| `scripts/mobile/probe.mjs` | The in-page measurement function (runs inside the phone's Chrome). |
| `scripts/mobile/routes.mjs` | Canonical route list (30 device-measurable, 5 source-only), desktop baseline set, width matrix. |
| `scripts/mobile/audit.mjs` | Route sweep → JSON report. `npm run mobile:audit` |
| `scripts/mobile/capture.mjs` | Scroll-and-capture screenshots, device or desktop. `npm run mobile:shots` / `mobile:desktop` |
| `scripts/mobile/cwv.mjs` | Core Web Vitals + INP, median of N. `npm run mobile:cwv` |
| `scripts/mobile/README.md` | Setup, commands, and the rules the harness encodes. |
| `package.json` | Four scripts added: `mobile:audit`, `mobile:shots`, `mobile:cwv`, `mobile:desktop`. |

No new npm dependencies — Node 24's global `WebSocket` speaks CDP directly.

---

## Routes affected

None. Instrumentation only.

---

## Redmi results

**Device:** Redmi Note 8 (2021) `M1908C3JGG`, Android 11, **Chrome 152.0.7977.75**,
CSS viewport **392 × 766**, DPR **2.75**, serial `AYXSUKIVJVPZ7HPZ`.

| Check | Result |
| --- | --- |
| Redmi connected | ✅ `adb devices -l` → `device` |
| CDP connected | ✅ `http://localhost:9222/json/version` → Chrome/152.0.7977.75 |
| Device routes audited | ✅ **30 / 30**, zero failures |
| Baseline captures | ✅ **116** device folds (392 px, 1×) + 26 desktop-1440 + 26 desktop-1920 = **168** |
| Server health assertion | ✅ asserted before every route, 60 s timeout, one retry |
| Intentional server failure | ✅ killed the dev server mid-run → `╳ HARNESS FAILURE: dev server unreachable`, **exit code 1** |
| INP baseline | ✅ recorded on all three funnel routes |
| `mobile:audit` | ✅ |
| `mobile:shots` | ✅ |
| `mobile:cwv` | ✅ |
| Baseline stored | ✅ `docs/execution/mobile/baseline/phase-0/` |
| Tests | ✅ 349 / 349 |
| Desktop regression | ✅ n/a — no product code touched; desktop baseline captured for later phases |

### Stability — two consecutive full runs

Every acceptance-critical field is **identical** across `audit-run1.json` and
`audit-run2.json`:

| Metric | Run 1 | Run 2 |
| --- | --- | --- |
| Routes measured | 30 | 30 |
| Routes failed | 0 | 0 |
| Routes with horizontal overflow | 0 | 0 |
| **WCAG 2.5.8 tap failures** | **0** | **0** |
| Targets under 24 px (comfort) | 609 | 609 |
| Text nodes under 12.5 px | 478 | 478 |
| Routes with console errors | 0 | 0 |

`domNodes` drifts by ~12 nodes on 8 routes between runs — the Next dev overlay
and route announcer. It is a render-failure floor, not an acceptance metric.

---

## Baseline measurements (the "before" for every later phase)

### Navigation — the P0, quantified

Measured on `/`, `/books`, `/blog`, `/cart`, `/terms` — identical on all:

```json
{ "headerFound": true,
  "headerLinks": ["/", "/search", "/cart", "/account/library"],
  "headerLinkCount": 4, "browseDestinations": 1,
  "hasMenuButton": false, "menuButtonSize": null }
```

Four header controls, none of which is a browse destination except the account
avatar's dev-only fallback link. **All books, Ebooks, Authors, Categories, Blog
and About are unreachable from the header below 768 px.** No menu button exists.

### Theme integration — P1-6

```json
{ "htmlBg": "rgba(0, 0, 0, 0)", "bodyBg": "lab(99.2132 -0.128955 1.51819)",
  "colorScheme": "normal", "themeColorMeta": null,
  "viewportMeta": "width=device-width, initial-scale=1" }
```

### Safe areas — P3-1

`env(safe-area-inset-top/bottom/left/right)` all resolve to **`0px`** — no
`viewport-fit=cover`.

### Accessibility

```json
{ "h1Count": 1, "landmarks": 4, "skipLink": false,
  "inputsWithoutLabel": 0, "reducedMotionHonoured": false }
```

### Broken controls

| Control | Measured | Finding |
| --- | --- | --- |
| Homepage newsletter email | **279 × 20 px** | P1-1 — `flex-1` in a `flex-col` container |
| Catalog price slider | **295 × 4 px**, hit-sample height 0 | P1-4 |

### Core Web Vitals — local, median of 3, 1.6 Mbps / 70 ms, cache off

| Route | LCP median | Samples | CLS max | INP proxy | Total |
| --- | --- | --- | --- | --- | --- |
| `/` | **3 920 ms** | 5528 / 2028 / 3920 | 0.0341 | **272 ms** | 1 190 KB (js 900) |
| `/books` | **2 212 ms** | 2244 / 1916 / 2212 | 0.0008 | **248 ms** | 1 290 KB (js 914) |
| `/books/meditations` | **4 040 ms** | 4736 / 3844 / 4040 | 0 | 72 ms | 1 156 KB (js 922) |

LCP element on `/` is the text `SPAN.block` — "Read it anywhere.".
Two of three routes exceed the 200 ms INP target.

**These are dev-build numbers** (~900 KB of unminified JS vs ~250 KB in
production). They are the comparison surface for phase-to-phase movement, not an
absolute production figure.

---

## Known limitations

1. **Production is not a usable measurement surface from this machine.** The same
   page measured **1816 / 4076 / 5836 / 12976 ms** LCP throttled, and
   **4100 / 8320 / 10332 ms** unthrottled — CDP throttling stacks on live network
   jitter. `cwv-production.json` is recorded for reference and explicitly
   **rejected as a baseline**. Local-over-adb has a ~10 % spread and is
   authoritative for phase comparison.
2. **No local production build.** `next start` fails with
   `@clerk/nextjs: Missing publishableKey` (`src/proxy.ts` runs `clerkMiddleware`
   unconditionally; the root layout guards, the proxy does not).
   `vercel env pull` is blocked by the environment's command classifier.
   **Phase 8 dependency:** the absolute "LCP ≤ 2.5 s" target needs a real
   production build — to be solved there via a Vercel preview deployment of this
   branch (authorised by the execution brief §40).
3. **No iOS device.** iOS Safari behaviour stays untested throughout, as the
   roadmap already states.
4. **`next dev` parks postponed Suspense boundaries.** A hard load of `/books`
   or `/ebooks` can leave the streamed markup in a hidden `<div id="S:0">` that
   is never swapped in — the catalog renders **zero** books. Production does not
   do this (`valicepress.com/books` ships the cards inline, no `S:0`). The
   harness navigates client-side to avoid baselining a blank page, and
   `assertRendered` now treats a parked `S:0` as a render failure.

---

## Environment issues found and fixed (not product defects)

The fresh worktree initially failed 21 tests. Every one was a missing untracked
dev artifact, confirmed by running the same suites in the main tree:

| Symptom | Cause | Fix |
| --- | --- | --- |
| 20 companion-page failures | Branch was 6 commits behind; the Phase-1 books had been reorganised under `PHASE-1-BOOK/` | Fast-forwarded `feature/mobile-optimization` to `9736f56` (no overlap with any file this project touches) |
| `qrPresent: "unmeasured"` | `./.venv-factory` is untracked and absent in a new worktree | Symlinked the existing venv (never committed) |
| Turbopack refused to start | `node_modules` symlink "points out of the filesystem root" | Hardlinked copy (`cp -al`, 1.7 s) |

**349 / 349 tests pass. `npm run lint` clean. `npx tsc --noEmit` clean.**

---

## Remaining P2/P3 issues

None introduced. Phase 0 changes no product code. The full P0–P3 inventory
stands as written in `MOBILE_CURRENT_STATE_AUDIT.md`, with two corrections the
harness produced:

- **P1-4 (price slider) is not a WCAG 2.5.8 conformance failure.** The automated
  spacing-exception evaluation returns **0 conformance failures site-wide**: an
  isolated 4 px-tall control satisfies the spacing exception. It remains a severe
  **usability** defect (295 × 4 px drag target) and is still fixed in Phase 5.
  The audit's wording overstated it; the roadmap's fix is unchanged.
- The same applies to the 609 sub-24 px targets: they are a **comfort** metric,
  not a conformance one. `tapFailsWcag` is the conformance number and it is 0.

---

## Concurrency note

Another agent is actively committing to this repository (6 commits landed during
this phase, and the working tree it uses still holds uncommitted changes). This
project therefore runs in a **separate git worktree** so it cannot touch that
tree's files. `main` is untouched.

**COMMIT:** `99f21bc`
