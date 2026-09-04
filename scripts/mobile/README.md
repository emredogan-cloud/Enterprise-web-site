# Mobile QA harness

Drives the **physical Redmi Note 8 (2021)** over ADB + the Chrome DevTools
Protocol, and a local **Chrome for Testing** for desktop regression. No new npm
dependencies — Node 24 ships a global `WebSocket`.

Built for `docs/execution/mobile/MOBILE_OPTIMIZATION_MASTER_ROADMAP.md`
(Phase 0). Every phase after it is signed off with these three commands.

```
scripts/mobile/
  device.mjs    CDP driver: connect, navigate, health + render assertions
  probe.mjs     the in-page measurement function (runs inside the phone)
  routes.mjs    the canonical route list + desktop baseline + width matrix
  audit.mjs     route sweep      → npm run mobile:audit
  capture.mjs   screenshots      → npm run mobile:shots / mobile:desktop
  cwv.mjs       vitals + INP     → npm run mobile:cwv
```

## Device setup

```bash
export PATH=$PATH:/home/emre/Android/Sdk/platform-tools
adb devices -l                                   # expect AYXSUKIVJVPZ7HPZ … device
adb reverse tcp:3100 tcp:3100                    # phone's localhost:3100 → this machine
adb forward tcp:9222 localabstract:chrome_devtools_remote
curl -s http://localhost:9222/json/version       # expect Chrome/152.x
```

Open any tab in Chrome on the phone once — the harness attaches to an existing
page target, it does not create one. `connectDevice()` wakes the screen and sets
`svc power stayon usb` on every run (a sleeping phone drops the socket and the
sweep dies mid-way with `CDP timeout: CSS.enable`).

## Commands

```bash
npm run mobile:audit                       # 30 device routes → JSON report
npm run mobile:audit -- --routes home,catalog --widths 320,392,768
npm run mobile:audit -- --out docs/execution/mobile/baseline/phase-3/audit.json
npm run mobile:audit -- --include-source-only     # also try the auth/ID-gated routes

npm run mobile:shots  -- --dir docs/execution/mobile/baseline/phase-3/device
npm run mobile:desktop -- --dir .../phase-3/desktop-1440 --width 1440 --height 900

npm run mobile:cwv                          # local, median of 3
npm run mobile:cwv -- --url https://valicepress.com --repeat 3
```

Environment: `MOBILE_BASE_URL` (default `http://localhost:3100`), `MOBILE_CDP`
(default `http://localhost:9222`), `MOBILE_CHROME` (desktop Chrome binary),
`ADB_BIN`.

## What it measures

`mobile:audit` writes, per route: viewport, horizontal overflow **plus the
un-clipped offenders**, a tap-target histogram (<24px, 24–44px) *and* a real
WCAG 2.2 SC 2.5.8 evaluation including the spacing exception, drag targets,
text under 12.5px, body type scale and measure, image count / lazy / oversized,
`env(safe-area-inset-*)`, theme integration (`theme-color`, `color-scheme`,
document background), header navigation reachability, accessibility spot checks,
resolved platform fonts, and console errors.

## Rules this harness encodes

These are not stylistic choices — each one is a bug that already cost real time.

1. **The dev server is asserted healthy before every route**, not once per run.
   It died twice mid-sweep during the original audit and silently produced eight
   blank captures.
2. **A render failure is detected and fails the run.** `readyState`, a DOM-size
   floor per route, presence of `<main>`, visible text length, error titles, and
   a `scrollHeight <= innerHeight` + thin-DOM check.
3. **Never `captureBeyondViewport`.** It tiles the page and repaints sticky
   elements per tile; the first baseline had the header and hero duplicated
   down every screenshot. Scroll and capture instead.
4. **Navigate client-side by default.** In `next dev`, a hard load of a route
   whose tree contains a postponed Suspense boundary (`<!--$~-->`, e.g. `/books`
   whose `CatalogShell` reads `useSearchParams`) can leave the streamed markup
   parked in a hidden `<div id="S:0">` that is never swapped in — the catalog
   renders *zero* books and the sweep would baseline a blank page. Production
   does not do this. The harness clicks an existing Next `<Link>` (a freshly
   injected `<a>` is not intercepted — Next hangs an onClick on the anchors it
   renders rather than delegating from the document) and waits for the DOM to
   stop growing. `hard: true` forces a real load; `cwv.mjs` always uses it.
5. **Probe from scroll 0.** `RevealOnScroll` gates sections at `opacity: 0`
   until they intersect, so a probe at an arbitrary offset counts a different
   number of interactive elements each run.
6. **Report conformance and comfort separately.** `tapUnder24` is a comfort
   metric; `tapFailsWcag` is the conformance number, and it applies the spacing
   exception properly. Inflating one into the other misstates the problem.
7. **Median of N for vitals.** One lab run is not a baseline — see below.

## Measurement surfaces, and which to trust

| Surface | Transport | Use it for |
| --- | --- | --- |
| **Local dev over adb** | USB, deterministic | **Phase-to-phase comparison.** LCP spread across 3 runs was 1940–2716 ms. |
| Production (`valicepress.com`) | live internet + CDP throttle | Real-world reference only. Same page measured 1816 / 4076 / 5836 / 12976 ms — CDP throttling stacks on live jitter. |
| Vercel preview of this branch | live internet | Phase 8 final verification against a real production build. |

Local dev bundles are unminified (~900 KB JS vs ~250 KB in production), so local
LCP is **not** comparable to production in absolute terms — only to the previous
local run. Always state which surface a number came from.

`inpProxyMs` is the worst latency across a fixed set of scripted taps, with a
capture-phase `preventDefault` so links can be tapped without navigating. It is
a lab proxy, not field INP.
