# Phase 5 — Catalog results

**Read at:** 2026-09-03, second pass · `verify-amazon.mjs` (19/19 listings answer, every price matches) · `validate-catalog.mjs --origin https://valicepress.com` (**28 pass · 0 warn · 0 error · 2 skipped**) · `kdp-linkage-lint.mjs --check-urls` (**15 COMPLETE · 2 IN_REVIEW · 1 BLOCKED · 0 NEEDS_REVISION**).

## Per title

| Book | Direct | Amazon editions live | Prices match | Companion page in the book | Upload state | Notes |
|---|---|---|---|---|---|---|
| Meditations | $9.99 | — | — | n/a (no print edition) | — | direct only |
| Codex Mythologica | not sold (Select to 11-03) | Kindle $6.99 · pb $21.99 · hc $32.99 · LP $27.99 | yes | **p. 330 / 330 / 579** | **HELD to 2026-11-03** (O5) — files and all six wraps built | |
| Codex Bestiarium | $12.99 | Kindle $12.99 · pb $24.99 · hc $37.99 · LP $29.99 | yes | **p. 436 / 436 / 600** | **HELD for O4** — files and all six wraps built | listings still say 120 creatures; the book has 112 |
| World Myths | $6.99 | Kindle $6.99 · pb $14.99 · hc $26.99 | yes | **p. 233**, both formats | **ready — A3, A4** · no cover change | Amazon discounts pb to $8.90, hc to $12.99 |
| World Games | $11.99 | Kindle $11.99 · pb $22.99 · hc $34.99 · LP in review | yes | **p. 160** pb + hc; **p. 233** LP | **ready — A1, A2** · no cover change. LP held (B9) | **LP's invented biography is fixed** |
| Field Book | — (write-in book) | pb $14.99 · hc never built | yes | **p. 156** | **ready — A5** · no cover change | **PDF metadata fixed**; hc BLOCKED (no interior exists) |
| Hangul | — (Gate 2) | pb $12.99 · hc in review | yes | **p. 125**, both formats | **ready — B1** (pb + rebuilt cover). hc held (B2) | only book whose page count had to move: 124 → 126 |
| Dudeney | $9.99 (PDF + EPUB) | pb not yet at KDP | — | **p. 144** | not listed — F1, F2 | its only mention had been one line in the imprint |
| Codex Enigmatica | $9.99 | Kindle $9.99 · pb $19.99 · hc $29.99 | yes | **p. 274 / 276** (verification page) | **ready — A6, A7** · no cover change | the verify page now carries a code |

## Page counts

`pageCount` in `valice-catalog.mjs` continues to describe **the edition a buyer can buy today**, because it feeds `numberOfPages` in the storefront's structured data and a listing that has not been updated still sells the old block. Nine formats now also carry **`pendingPageCount`**, which is what the built file measures:

| Format | Listed | Built | Flips when |
|---|---|---|---|
| Mythologica pb / hc / LP | 329 · 329 · 578 | **330 · 330 · 579** | B6–B8 upload |
| Bestiarium pb / hc / LP | 435 · 435 · 599 | **436 · 436 · 600** | B3–B5 upload |
| World Games LP | 232 | **233** | B9 upload |
| Hangul pb / hc | 124 · 124 | **126 · 126** | B1 / B2 upload |

`kdp-linkage-lint` compares the built interior against `pendingPageCount` where one exists and against `pageCount` otherwise, so a file and its record can no longer drift silently.

## What has not changed

**Reviews: 0 on every edition. Sales rank: none on every edition.** A missing BSR means Amazon has recorded no sale for that edition, ever. No price moved this pass.
