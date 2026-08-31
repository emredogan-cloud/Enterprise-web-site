# Ebook Store — Final

> `/ebooks` is the only shelf on this site a reader can buy from. Everything
> else links to Amazon. Verified live on 2026-08-31.

---

## What is on sale, and why only these five

| Book | Price | Master in R2 | Paddle price |
|---|---|---|---|
| Meditations | $9.99 | 386 KB | `pri_01m1btwjzqvest52bwde6mqqam` |
| The Great Book of World Myths | $4.99 | 3.72 MB | `pri_01m1btjddes1p637hd78zsvczx` |
| Codex Enigmatica | $9.99 | 8.39 MB | `pri_01m1btjc0bp4phgs7vrqhq4g18` |
| The Great Book of World Games | $11.99 | 0.58 MB | `pri_01m1btjcqgabh6v8rsxg85frxr` |
| Codex Bestiarium | $12.99 | 4.62 MB | `pri_01m1btjb037st1aew8mt990htv` |

Three books are absent, each for a different and recorded reason:

- **Codex Mythologica** — its Kindle edition is enrolled in **KDP Select**,
  which is an exclusivity agreement. Selling the digital edition here would
  breach it. Enforced in code, not by care: a test fails if a Select-enrolled
  book is ever flagged for direct sale.
- **The Myth Hunter's Field Book** — no digital edition exists by design. It
  is a write-in activity book.
- **Korean Hangul Handwriting Workbook** — unresolved CC BY-NC dictionary
  source. That blocks sale in every channel, not just this one.

## Pricing

Every direct price matches that book's own Kindle list price to the cent,
verified on the KDP bookshelf. That is deliberate: undercutting Amazon on a
title Amazon also sells invites price-matching against the Kindle listing, and
overcutting makes the direct store the worse deal for no reason.

**What the reader gets here that they do not get on Kindle is the format** — a
DRM-free, watermarked PDF of the print interior, no device lock, no expiry,
re-downloadable. The differentiator is the product, not the price.

## The digital edition is a distinct artifact

The print interiors run 40–121 MB because they carry 300 DPI plates sized for
offset printing. Loading one of those into memory, re-saving it and writing it
back to R2 is not something a serverless function should be asked to do, and a
121 MB download is not something a reader should be asked to accept.

So `scripts/catalog/build-digital-editions.mjs` cuts a separate edition with
Ghostscript's `/ebook` profile — 150 DPI colour and greyscale, 300 DPI mono,
which keeps the line-engraved plates crisp at reading size:

| Book | Print interior | Digital edition |
|---|---|---|
| Codex Bestiarium | 103.45 MB | **4.62 MB** |
| The Great Book of World Myths | 115.36 MB | **3.72 MB** |
| Codex Enigmatica | 67.13 MB | **8.39 MB** |
| The Great Book of World Games | 0.49 MB | 0.58 MB |

The print files are untouched; Amazon keeps the 300 DPI originals. Sample
pages were rendered and inspected at reading size before this was accepted.

It is deliberately **not** the EPUB. A watermarked, DRM-free PDF is what this
store sells and what the reader route renders; the EPUBs exist for Kindle,
which is Amazon's channel.

## Fulfillment, verified end to end

`webhook → order → entitlement → Inngest → watermark → R2 → ready → email`,
**7 seconds** in production. Each buyer's PDF carries their name and order id
in the metadata and in a footer on every page:

```
Licensed to <buyer> · Order <id> · Valice Press
```

Refund reverses it: order `refunded`, entitlement `revoked`, three audit rows
in `commerce_events`. Both directions were executed against production.

## The page itself

| Element | State |
|---|---|
| Navigation | Own top-level entry, `aria-current="page"` correct |
| Hero | "Bought here. Yours to keep." — states DRM-free, no device lock, no expiry, and that print goes to Amazon |
| Grid | 5 real books, real cover art |
| Filters | Categories with real counts. **Formats hidden** (one format), **Rating hidden** (nothing reviewed) — a filter is a promise that something is behind it |
| Sorting | Newest, price ↑/↓ |
| Prices | Real, from the database |
| Empty state | Honest — no filters over nothing |
| SEO | Canonical, OG, description; indexable |
| Responsive | Grid and list views; **narrow-viewport rendering not device-tested** — see the verification report |

## Fixed while verifying this page

- Real covers were being published with a **second title printed over them**:
  the typographic stand-in cover and the real cover both rendered, and the
  text carried `z-10` while the image did not.
- The words **"Sort by" rendered in open space** above the toolbar — the
  screen-reader label used `absolute -left-[200px] -top-[200px]`, which
  positions against the nearest positioned ancestor rather than off the page.
- **EPUB and MOBI filters at 0** advertised editions that do not exist.
- **Five rating filters, all 0**, every one returning an empty grid.
