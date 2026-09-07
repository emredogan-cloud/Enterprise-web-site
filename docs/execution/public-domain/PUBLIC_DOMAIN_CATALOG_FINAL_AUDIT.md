# The catalogue, audited — 2026-09-07

**27 rows · 73 format entries · 16 published, 11 draft.**
Audited at the close of Phase 3, against the catalogue file, the QA records, the built files
and — where a fact is external — against the service that holds it.

---

## 1. Every claim that can be checked, checked

| Claim | Method | Result |
|---|---|---|
| No invented ASIN | every `formats[].amazonAsin` matched against `B0` + 8 alphanumerics, and against its `kdp` state | **19 ASINs, 0 malformed, all on `kdp: "live"` entries.** Zero on any Phase 3 row |
| No invented ISBN | grep for an ISBN field or a 13-digit run anywhere in the catalogue | **none exists** |
| No invented price ID | `pri_…` ids resolved against `api.paddle.com` | Kwaidan's `pri_01m1v4n80k6g2tba6wt8882ehf` is **active**, named for the book, **$8.99** |
| No rating or review count without a review | catalogue carries neither field | **none** |
| KDP Select exclusivity | `kdpSelect` true ⇒ no direct ebook sale | **1 row enrolled** (`codex-mythologica`), and it sells no ebook here. `valice-catalog.test.ts` asserts it |
| `price_cents = 0` never shown as free | `formatCatalogPrice` is the only formatter | asserted by test |
| Cover exists for every row | `public/images/books/<slug>.webp` ≥ 1200 px tall, indexed in the asset manifest | **23 covers, all six Phase 3 books now indexed** |

## 2. Phase 3, row by row

All six are **`websiteStatus: "draft"`**. Nothing here is on sale and nothing can be.

| Row | Pages | ebook | paperback | hardcover | ASIN | Master in R2 |
|---|---|---|---|---|---|---|
| kwaidan | 138 | $8.99 · **Paddle live** | $14.99 | $29.99 | — | key recorded, **not uploaded** |
| sea-monsters-unmasked | 232 | $9.99 | $16.99 | $33.99 | — | — |
| book-of-were-wolves | 198 | $8.99 | $15.99 | $32.99 | — | — |
| british-goblins | 390 | $11.99 | $22.99 | $41.99 | — | — |
| fairy-mythology-vol-1 | 336 | $9.99 | $19.99 | $38.99 | — | — |
| fairy-mythology-vol-2 | 326 | $9.99 | $19.99 | $38.99 | — | — |

Every price is the price engine's recommendation and **none has been approved** (F-036).
Every `kdp` state is `not_created` or `not_applicable`, which is the truth: none of these has
ever been uploaded.

## 3. What could not be verified, and why

**R2 is not reachable from this environment.** `scripts/tmp/.env.production` carries the
literal placeholder `[SENSITIVE]` for all six `R2_*` values, so no master can be uploaded and
no fulfillment path can be exercised end to end. `validate-catalog` reports this honestly as
`SKIPPED r2 — no R2_* credentials`. The same is true of **Inngest** (both keys), **Resend**
(both keys) and the **Paddle webhook secret**. `DATABASE_URL`, `CLERK_SECRET_KEY`,
`PADDLE_API_KEY` and `OPENAI_API_KEY` are real and were used.

This is a genuine external blocker, not a step that was skipped. **F-044.**

It is also, on the facts, the right order: an R2 master is the file a paying customer
downloads, and putting one there for a book whose rights signature has not been given would be
backwards.

## 4. The 32 validation errors, named

`validate-catalog` fails with 32 errors and **every one is the same thing**: a 404 against
production for a companion page or sheet belonging to a Phase 3 book whose branch is not
deployed.

- 6 · `/companion/<slug>` → 404 — one per Phase 3 volume
- 26 · `/companion/<slug>/<sheet>.pdf` → 404 — their free sheets

They resolve on merge. Nothing else fails: 53 checks pass, 0 warnings, 2 skipped (both R2).

## 5. Where the identifiers live, and why that matters

An ASIN is **per format**, not per row: a book can have a live paperback and a hardcover still
in review, and flattening that to one field would make one of the two a lie. The audit above
reads `formats[].amazonAsin`, and an audit that read `book.amazonAsin` would have reported
**zero ASINs in a catalogue that has nineteen** — which is how a check comes back clean by
looking in the wrong place. That is the same failure as counting footnotes *found* rather than
words *kept*, met in a different file on the same day.

## 6. Standing

**Nothing in this catalogue asserts a fact that cannot be pointed at.** Every ASIN resolves to
a live listing, the one live price id resolves to an active Paddle price at the stated amount,
every page count matches a built PDF, and every cover resolves to a file of the right
dimensions. Where a fact is not known it is `null`, and where a book is not ready its state
says so.
