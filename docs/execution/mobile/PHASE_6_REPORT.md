# Phase 6 — Book detail, cart, library, order (the money path)

**Status:** ✅ COMPLETE
**Date:** 2026-09-05
**Branch:** `feature/mobile-optimization`
**Closes:** commercial above-the-fold problem · sub-44 px commerce controls
**Also:** all six previously source-only routes attempted on the device

> **No payment or entitlement logic was touched.** Journey B was driven to the
> checkout handoff and stopped there; no transaction was initiated or faked.

---

## Measure first — what the roadmap asked for

Measured on the Redmi at 392 × 718, across four books (direct-sale, and mixed
direct + Amazon):

| | Before | After |
| --- | --- | --- |
| Cover | **359 × 540 px** (75 % of the viewport) | **258 × 388 px** |
| **Price** | **695 px** — at the very bottom edge | **543 px** ✅ |
| **"Add to cart"** | **743 px — below the fold** | **592 px** ✅ |
| `/books/[slug]` height | 5 478 px | 5 262 px |

The buy control was below the fold on **every** book type. A reader landing on a
product page could not see it without scrolling.

### What changed, and why the cover

`BookCover` is capped at `w-[72%]` below `sm:`, `sm:w-full` above. The cover is
still the dominant object on the first screen — arguably more object-like,
centred with its floor shadow, than when it was full-bleed — and both the price
and the CTA now clear the fold with 126 px to spare.

The alternative was a sticky bottom buy-bar. It was not built: it adds permanent
chrome to a reading-led design for a problem a 141 px cover cap solves.

**Known limitation, stated rather than hidden:** the `<h1>` still sits at
~851 px, below the fold. The hero is a two-column grid whose first column holds
cover + buy panel and whose second holds the title and description; moving the
title above the cover on mobile alone would require splitting a column across the
grid, which is a composition change beyond this phase's remit. The cover carries
the title visually in the meantime. **Carried to Phase 9.**

---

## Controls raised to 44 px (below `sm:` only)

| Control | Before | After |
| --- | --- | --- |
| Cart line "Remove" | 36 × 36 | **44 × 44** |
| Cart "Clear cart" | **54 × 16** | **44 px hit area, identical appearance** |
| Cart recommendation "Add to cart" (×7) | 32 × 32 | **44 × 44** |
| "Buy on Amazon" in the format list | 40 px tall | **44 px** |

"Clear cart" is deliberately understated — a destructive action should not
shout. It gets its 44 px from padding rather than type size, so it looks exactly
as it did.

**`FormatTable` needed no change.** The roadmap called for turning it into
stacked cards below `sm:`; it is already a semantic `<ul>` of flex rows that
wrap, not a `<table>`. The probe found **zero `<table>` elements** on any book
page. Recorded as a roadmap assumption that did not hold.

---

## Journey B, on the device, to the handoff

```
/ebooks              first cover at 648px
  → /books/meditations   CTA at 592px, 48px tall
  → tap Add to cart      button becomes "Added to cart"; header badge "Cart — 1 item"
  → /cart                1 line: "Meditations · Marcus Aurelius · $9.99"
                         checkout control "Checkout securely →" 311 × 48
                         horizontal overflow 0
  → STOP (payment not initiated)
```

---

## The six source-only routes, finally attempted on hardware

Every one was loaded on the Redmi. None had been opened on a device before.

| Route | Result |
| --- | --- |
| `/codex-enigmatica/verify` | **Renders fully** — h1 "Have you reached the final answer?". Promoted to the measured route set. Its collapsed input (P1-1) is now verified fixed on device. |
| `/blog/tag/[slug]` | **Renders fully** — promoted to the measured route set. |
| `/read/[bookId]` | HTTP 200, renders `UnprovisionedNotice`. **Reader UI not exercisable here** — no Clerk key, no DB. Shell is clean: no overflow, mobile menu present. |
| `/order/[id]` | Same. |
| `/admin` | Same ("Admin panel — configuration required"). |
| `/account/*` | Same. |

Recorded as **skipped, not passed**. The device route set grows from 30 to 32.

*Checked and dismissed:* `/blog/tag/` renders `# Reading Habits` — the `#` is the
intentional hashtag prefix (`title: \`#${tag.name}\``), not unrendered markdown.

---

## Two corrections to the accessibility checker

The audit reported its **first-ever WCAG 2.5.8 conformance failure** this phase.
Investigated, and the checker was wrong twice — both times because it was missing
a normative exception:

1. **Inline exception.** "The target is in a sentence or its size is otherwise
   constrained by the line-height of non-target text." The flagged control was a
   tag link sitting beside a date in a metadata line — explicitly excluded by the
   criterion. Now implemented: exempt when the element is no taller than its line
   box **and** shares its parent with other text.
2. **Equivalent exception.** "Another control on the same page performs the same
   function and meets the requirement." The cart line links the book from both a
   **96 × 64 px cover** and a 179 × 20 px title; the title is carried by the cover.
   Now implemented, matched on `href`.

Neither is a waiver — each is a clause of SC 2.5.8 the checker did not implement.
With both in place the site has **zero genuine SC 2.5.8 failures**, and forcing
the cart title to 44 px would have distorted the line for no accessibility gain.

---

## A dev-server artifact that looked like a serious bug

Mid-phase, `/cart` began serving a populated cart to **anonymous requests** — a
cookie-less `curl`, and a desktop browser with no cookies at all. That reads like
session leakage.

It is not. It is `next dev`'s in-memory render cache:

- The cart is an `httpOnly` cookie; `/cart` is `export const dynamic = "force-dynamic"`.
- After a dev-server restart, an anonymous request correctly returns the empty state.
- The same cache is why clicking "Clear cart" appears to do nothing in dev — the
  cookie *is* deleted, the stale render is what you keep seeing.

**No product bug, and nothing was changed in the cart.** The harness now puts the
cart in a known-empty state before any baseline and *verifies* it with an
anonymous fetch, warning loudly if the dev server is still serving a cached cart
rather than silently baselining it. Without this the Phase 6 desktop gate
compared a full cart against an empty-cart baseline and reported 226 elements
"changed" on `/cart` with no code difference at all.

---

## Redmi results

**161/161 interaction checks pass**, 4 honestly skipped. New `commerce` group:
price above the fold · primary CTA above the fold · CTA ≥ 44 px · Amazon CTAs
≥ 44 px — each on three book types — plus cart control sizing, the checkout
control, and the three gated routes recorded as shell-only.

## Route audit

| Metric | Phase 5 | Phase 6 |
| --- | --- | --- |
| Routes measured / failed | 30 / 0 | **32 / 0** |
| Horizontal overflow | 0 | **0** |
| **WCAG 2.5.8 tap failures** | 0 | **0** |
| Text below 12 px | 0 | **0** |
| Console errors | 0 | **0** |

## Desktop regression

**9/9 routes identical at 1440 × 900 and 9/9 at 1920 × 1080**, with a
verified-empty cart. Every change is `sm:`-gated; `sm:w-full` restores the cover
and `sm:h-9 sm:w-9` / `sm:min-h-0` restore the cart controls.

## Tests

`npm run lint` clean · `npx tsc --noEmit` clean.
**278 passed, 71 failed — the same pre-existing environmental failures recorded
in Phase 5**, in `scripts/factory/companion-page.test.js`, which reads print PDFs
from a directory outside the repo that another agent emptied mid-session. They
reproduce identically in the main working tree. No assertion was weakened.

## Known limitations

1. **The `<h1>` is still below the fold** on book detail (~851 px) — carried to
   Phase 9 with the reason above.
2. **The reader, order and admin UIs cannot be exercised** in this environment.
   Only their shells were verified.
3. **Checkout stops at the handoff.** The Paddle flow, the return URL and
   entitlement were not exercised — that needs a real transaction.

**COMMIT:** `c23bcc2`
