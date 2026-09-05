# Valice Press — mobile regression suite

The runnable checklist for keeping this work from rotting. Everything here is a
command, not a description: if a line cannot be run, it does not belong in this
file.

**Reference device:** Redmi Note 8 (2021), `M1908C3JGG`, Android 11,
Chrome 152 / Android System WebView 151, **392 × 718 CSS px @ DPR 2.75**
(landscape 986 × 392).

---

## 0. Bring the harness up

```bash
# 1. dev server for the tree under test
npx next dev -p 3100

# 2. phone: USB debugging on, screen unlocked
adb devices                                   # must list one device
adb forward tcp:9222 localabstract:chrome_devtools_remote
adb reverse tcp:3100 tcp:3100                 # the phone reaches the laptop's server
curl -s localhost:9222/json/version           # must answer with a Chrome build
```

**Chrome must be the foreground app on the phone.** A backgrounded Chrome accepts
a DevTools connection and then never answers; the sweep dies mid-run on
`CDP timeout: CSS.enable`, which reads like a harness bug and is not one.
`wakeDevice()` now foregrounds it on every connect, but if you have been driving
another app, check.

**If a CSS change appears not to take effect, clear `.next`.** Turbopack served a
stale CSS chunk here across a full dev-server restart — same chunk name, same
bytes, missing the new rule — and cost an hour of chasing a fix that was already
correct. `mv .next /tmp/…` and restart. TSX changes hot-reload fine; only CSS was
affected.

---

## 1. The gates

Run in this order. Each is independently meaningful; the desktop gate is the one
that must never go red without a written reason.

```bash
npm run lint
npx tsc --noEmit

# route audit — geometry, tap targets, contrast, console errors, 32 routes
npm run mobile:audit -- --out docs/execution/mobile/baseline/latest/audit.json

# the full width matrix (32 routes × 7 widths = 224 measurements, ~25 min)
npm run mobile:audit -- --widths 320,360,392,430,600,768,1024 \
  --out docs/execution/mobile/baseline/latest/audit-widths.json

# landscape (986 × 392) — a real orientation, not a wide portrait
npm run mobile:audit -- --landscape \
  --out docs/execution/mobile/baseline/latest/audit-landscape.json

# behaviour: taps, focus, scroll lock, keyboard, reduced motion
npm run mobile:journeys -- --out docs/execution/mobile/baseline/latest/journeys.json

# the five user journeys, walked end to end
npm run mobile:e2e -- --out docs/execution/mobile/baseline/latest/e2e.json

# Android System WebView (in-app browser)
scripts/mobile/wvhost/build.sh          # once; installs the host
npm run mobile:webview -- --out docs/execution/mobile/baseline/latest/webview.json
npm run mobile:webview -- --uninstall   # when finished

# Core Web Vitals on the three funnel routes
npm run mobile:cwv -- --out docs/execution/mobile/baseline/latest/cwv.json

# DESKTOP REGRESSION GATE — must stay 9/9 identical.
# Two steps: capture, then compare against the Phase 0 baseline.
B=docs/execution/mobile/baseline
npm run mobile:fingerprint -- --desktop --width 1440 --height 900 \
  --out $B/latest/fingerprint-desktop-1440.json
npm run mobile:fingerprint -- --compare \
  $B/phase-0/fingerprint-desktop-1440.json $B/latest/fingerprint-desktop-1440.json

npm run mobile:fingerprint -- --desktop --width 1920 --height 1080 \
  --out $B/latest/fingerprint-desktop-1920.json
npm run mobile:fingerprint -- --compare \
  $B/phase-0/fingerprint-desktop-1920.json $B/latest/fingerprint-desktop-1920.json

# the device fingerprint, for comparing phone layout between phases
npm run mobile:fingerprint -- --out $B/latest/fingerprint-device.json
```

### What each gate is allowed to report

| Gate | Pass condition |
| --- | --- |
| `lint`, `tsc` | clean |
| audit (any width) | `hOverflowPx` 0 · WCAG 2.5.8 failures 0 · contrast failures 0 · contrast indeterminate 0 · console errors 0 |
| landscape | same, at 986 × 392 |
| journeys | every check passes; a skip must carry a reason |
| e2e | every step passes; `notExercised` must carry a reason |
| webview | overflow 0, tap 0, contrast 0 on every route measured |
| cwv | CLS ≤ 0.1 everywhere; LCP and INP recorded against the target, not asserted on a dev build |
| **fingerprint (desktop)** | **9/9 identical, or identical layout + an explicitly accepted colour change** |

---

## 2. The desktop gate is a layout fingerprint, not a pixel diff

Pixel diffing this site does not work: 11 of 26 captures differed on identical
code, because the hero canvas animates and the reveal observers fire at slightly
different scroll offsets run to run. `scripts/mobile/fingerprint.mjs` records
geometry and computed style per element instead, and is deterministic — 9/9
stable across repeated runs on unchanged code.

It classifies its own output, which matters:

- **identical** — nothing changed.
- **identical layout; COLOUR ONLY** — every box is where it was; only paint
  differs. Phase 8's contrast fix reads this way and was accepted deliberately.
- **geometry changed** — stop. Something moved on desktop.

`display: contents` renames element paths, so the gate also carries a
geometry-equivalence check; without it, Phase 5's `lg:contents` wrapper looked
like 300 changed elements when nothing had moved.

---

## 3. Manual checks the harness cannot make

- [ ] **Landscape, by hand.** Rotate the phone on `/`, a book detail, `/cart`,
      `/account/library`. The harness emulates 986 × 392, which is the right box
      but not the real gesture bar or the real address bar collapse.
- [ ] **Soft keyboard, by hand.** Tap the search field and confirm the results
      list is not hidden behind the keyboard. `visualViewport` is emulated in
      the harness; the real IME is not.
- [ ] **Reduced motion at the OS level.** Settings → Accessibility → Remove
      animations. The harness sets the media feature; the OS setting also
      changes Chrome's own transitions.
- [ ] **An in-app browser you actually use.** The WebView host proves the
      engine; Instagram or Gmail add their own toolbars over it.
- [ ] **iOS Safari.** Untested throughout this project. No device in the matrix.

---

## 4. WebView host

`npm run mobile:webview` needs a debuggable WebView, and nothing on the phone
ships one — `/proc/net/unix` lists Chrome plus two Stetho sockets belonging to
Google Messages, none of which will load an arbitrary URL. `scripts/mobile/wvhost`
is the smallest thing that fixes that: one activity, one full-bleed WebView,
`setWebContentsDebuggingEnabled(true)`, loading the intent's URL.

```bash
scripts/mobile/wvhost/build.sh          # build, sign, install (Android SDK + JDK)
scripts/mobile/wvhost/build.sh --build  # build only
npm run mobile:webview -- --uninstall   # remove it from the phone
```

It configures nothing else on purpose — no forced dark mode, no user-agent
override, no zoom controls — so that what it measures is the WebView **defaults**
an ordinary in-app browser hands the site.

---

## 5. Invariants worth knowing before you change something

1. **The navigation boundary is `lg:` (1024px), not `md:`.** The desktop header
   needs 987px. At `md:` it appeared at 768 and pushed every route 219px past
   the viewport. Below 1024 the drawer is the navigation.
2. **The type floor is 12px up to 1024px.** `text-[12px] lg:text-[Npx]`, 143
   occurrences. The restore point was `sm:` until Phase 9 measured 228 sub-12px
   nodes at 768 — a tablet is still held in a hand.
3. **`MobileNav` must stay portalled to `<body>`.** The header's
   `backdrop-blur-xl` establishes a containing block for `position: fixed`, and
   an in-header overlay comes out 338 × 64 at the header's origin: visible in a
   DOM dump, completely untappable.
4. **Do not put `onClick={close}` on a drawer `<Link>`.** Next runs the caller's
   handler before navigating; closing unmounts the anchor and the navigation is
   lost.
5. **`text-xs` is not a safe substitute for `text-[12px]`.** It also sets
   `line-height`, which moved 143 desktop elements from 16.5px to 14.667px — the
   desktop gate caught it.
6. **Long tokens in prose need `overflow-wrap: anywhere`, not `break-word`.**
   Only `anywhere` reduces min-content, and min-content is what sizes an implicit
   grid track. One bare URL made the blog grid 311px wide inside 288px.
7. **`next dev` parks Suspense content in a hidden `#S:0`** on a hard load of a
   route that reads `useSearchParams` (`/books`). The harness navigates by
   clicking an existing Next `<Link>` instead — a freshly injected `<a>` is not
   intercepted. Production is unaffected.
8. **An empty `/cart` in dev is not proof.** `next dev` caches renders across
   cookie changes; `resetCart()` verifies against an anonymous fetch and says so
   when the server is lying.
9. **Do not judge the cart by `/api/cart/count`.** Under `next dev` it was
   measured returning 0 while `/cart` rendered the line and its remove control
   in the same session. The reader's truth is the cart page; count its remove
   controls (one per line), not the book links on it — the page also carries a
   recommendation shelf, and counting those reported "10 lines" for an empty
   cart.
10. **A phone set to another language will translate the site.** Chrome on a
   Turkish device returned "Sepete ekle" for every "Add to cart", and every
   text-matching check reported its control missing. `connectDevice` pins
   `accept-language` and the locale to `en-US`; if a run still reports controls
   missing everywhere, check the phone's translation setting before believing it.
11. **Text-driven checks must resolve the element at tap time.** `BookAddToCart`
   re-renders when `/api/entitlement` resolves, which drops any `id` a probe
   planted a moment earlier; the tap then hits nothing and a working button is
   reported broken.

---

## 6. What the desktop gate can and cannot tell you

On catalog-driven routes — `/`, `/books`, `/ebooks`, `/books/[slug]`, `/cart` —
the fingerprint compares **content as well as layout**. A different book in a
card slot is a different title length, a different price string, sometimes a
different set of controls, and the gate reports all of that as changed. The
database behind this site is written by other work, so those routes will drift.

When a diff appears on one of them, separate the two questions the way Phase 9
did: capture both code states **against the same database, back to back**.

```bash
git stash push -- $(git diff --name-only | tr '\n' ' ')
npm run mobile:fingerprint -- --desktop --out /tmp/fp-before.json
git stash pop
npm run mobile:fingerprint -- --desktop --out /tmp/fp-after.json
npm run mobile:fingerprint -- --compare /tmp/fp-before.json /tmp/fp-after.json
```

If every difference sits inside a card and no box in the surrounding design
moved, the data changed and the design did not. Routes with no catalog list —
`/authors`, `/blog`, `/categories`, `/account/library` — stay byte-comparable and
are the ones to trust first.

Diff against **`phase-9/`**, not `phase-0/`: Phase 9 gave the catalog queries a
total order (`publishedAt`, then `id`), so from here on the card order is stable.

## 7. Baselines

`docs/execution/mobile/baseline/phase-N/` holds each phase's evidence:
`audit.json`, `journeys.json`, `cwv-*.json`, `fingerprint-*.json`, and the
device and desktop capture sets. Phase 0 is the before; compare against it when
you want to know what a change actually cost.
