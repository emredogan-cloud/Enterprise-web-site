# Greek Alphabet Handwriting Workbook — covers, ebook, deployment

**Date:** 2026-09-04 · Companion report to `GREEK_WORKBOOK_PRODUCTION.md`.

---

## Covers

Two files arrived from the Founder on 2026-09-04, both pure artwork: **neither
carried a title, an author or an imprint.** They are backgrounds, so typography
was set on top of them from `project_config.json` — the same strings the
interior and the catalogue use. The artwork itself was not redesigned.

| | Supplied | After Real-ESRGAN ×4 | Placed into | Effective dpi |
|---|---|---|---|---|
| Paperback wrap | `new_cover.png` 1536×1024 | 6144×4096 | 17.4752 × 11.25 in, spine 0.2252 in | back **341.2**, front **343.5**, vertical **372.4** |
| Ebook front | `e-book-cover.png` 1024×1536 | 4096×6144 | 2400×3600 slot | **300.0** at final size |
| Kindle | derived | — | 1600×2560 | — |

Compression: 50,307,837 → **1,416,611 bytes** (DCT q92, floor 300 dpi), under KDP's 40 MB.
Barcode zone, measured at 300 dpi on both feet of the back panel: **{'outer': 0.0, 'spine-side': 0.0}** — clear.

Files: `OUTPUT/KDP/PAPERBACK/cover-art-v2.pdf` 1,416,611 bytes · `c011d749733896df…`; `ASSETS/cover/front-ART-PENDING-GREEK-FIX.png` 8,726,482 bytes · `a58b34841d02a40b…`.

### What had to be solved

**Resolution.** At 1536 × 1024 the wrap art is **85 dpi** across a 17.4752 in
wrap — under a third of KDP's minimum. On the Founder's instruction
`realesrgan-ncnn-vulkan` (Real-ESRGAN v0.2.5.0, official upstream release) was
installed and run on the GPU with `realesrgan-x4plus`. That is a real
reconstruction, not a metadata edit: the numbers above are the true pixel counts
divided by the true physical size, and the record in `QA/cover-art.json` keeps
the supplied size, the upscaled size and the resulting dpi side by side.

**The painted spine was 4× too wide.** The marble band in the supplied wrap is
5.27 % of the image width; a real 0.2252 in spine on a 17.4752 in wrap is
1.29 %. Dropped in as one picture the marble would have spilled ~0.35 in onto
both panels. The art is cut into its three painted regions and each is placed
into the region it belongs to — the method used for the Dudeney wrap.

**Bleed.** Art supplied by a person is drawn to the edge of the picture, and
that edge is the TRIM. Scaling it to cover the bleed would shrink everything
inside the trim by 3 %. The outermost strip is replicated outward instead.

**The back cover was unreadable.** The first build set light type over a sunlit
sea under a gradient scrim. A scrim dark enough to fix it would have blacked out
the picture, so the art became a frame and the blurb got a panel.

**Size.** ReportLab embedded the 6144 px art flate-encoded: 50.3 MB, over KDP's
40 MB ceiling. Ghostscript re-encodes at DCT q92 with a 300 dpi floor → 1.4 MB.

---

## The reason the new covers are NOT live

**The supplied artwork prints a Greek alphabet with wrong letterforms.**

| Where | Supplied | Correct |
|---|---|---|
| Ebook scroll, row 3 | `Ν Ε Ο Π Ρ Σ` | `Ν Ξ Ο Π Ρ Σ` — the Ξ is drawn as an Ε |
| Ebook scroll, row 1 | Δ as an open Λ with a detached bar | a closed triangle |
| Wrap scroll | letters out of order; Ε paired with κ, Ζ with ς; one glyph is a Latin **G** | — |

This book's back cover says every stroke order in it is sourced and labelled,
and `RESEARCH/SOURCES.md` gives the reason its letterforms are typeset from a
real face rather than drawn: *a malformed Greek letter in a book that teaches
Greek letters is the one unrecoverable error.* A wrong alphabet on the jacket
refutes the book on its own cover.

**Founder decision, 2026-09-04: regenerate the artwork with correct Greek.**
The vector covers stay canonical until it arrives. The upscaled, placed,
preflighted artwork waits under `-ART-PENDING-GREEK-FIX` names — deliberately
outside the `front-v<n>.png` sequence, because `ingest-covers.mjs` takes the
highest `front-v<n>` and would otherwise publish it on the next run. The swap is
one command, written out in `ASSETS/cover/README-COVERS.md`.

Both wraps pass preflight 6/6. Interior preflight 5/5, 100 pages, all fonts
embedded.

---

## Ebook — live

| | |
|---|---|
| Paddle product | `pro_01m1pmtdjrvqgnccam8m37pvvm` — active, tax category `standard` |
| Paddle price | `pri_01m1pmtds9p93zm735432kv98x` — active, one-time, **699 USD** |
| Verified | read back from `api.paddle.com` after creation; `custom_data.valice_slug` matches |
| R2 `master.pdf` | 423,229 bytes, sha `ed8aa1ffab6e48f5…` — downloaded and hashed, matches local |
| R2 `master.epub` | 284,072 bytes, sha `e6a635d96f983278…` — matches local |
| EPUB | epubcheck 5.1.0 — 0 fatals / 0 errors / 0 warnings |
| Storefront cover | `front-v1.png` → `/images/books/greek-alphabet-handwriting-workbook.webp`, 1067×1600, 30 KB |
| Category | `language-and-learning` |
| DB row | `published`, price 699, both master keys, page_count 100 |

### The Paddle blocker was misdiagnosed, and this corrects it

Phase 5 reported the price as *"verified blocked — the only key here is a
sandbox key that 403s on every endpoint."* That was the observed behaviour and
the wrong cause. `.env` carries **two** `PADDLE_API_KEY` lines; the second is
the live key, written `PADDLE_API_KEY = pdl_live…` with a space before the `=`.
Every loader in this repo matches `^([A-Z0-9_]+)=(.*)$` and keeps the first
parseable value, so the live line was skipped and a stale sandbox key won. The
public-domain session found this first. The same defect hides `DATABASE_URL`
from `load-catalog.mjs`, which looks for a line starting `DATABASE_URL=`.

Both were worked around with a normalised env file in a scratch directory. **The
Founder's `.env` was not touched** — the two-line fix is theirs to make.

---

## What else the catalogue load changed

`load-catalog.mjs` is all-or-nothing and production was several already-approved
changes behind. Alongside the Greek row it also applied:

- **Hangul** draft → published (its paperback has been live on Amazon since 2026-09-02)
- **Dudeney** added as published (real Paddle price, on sale since 2026-09-02)
- **World Myths** $4.99 → **$6.99**, the price the Founder set on 2026-09-02 — production had been undercharging
- five public-domain titles added as **drafts**, invisible to the storefront

Every one of those states was already written in `valice-catalog.mjs`. Nothing
new was decided here; the database was simply stale.

**Also removed: the `kindle` format row.** It broke the loader outright —
`book_format` is a Postgres enum of `ebook | paperback | hardcover |
large_print`, so even the DELETE the loader runs for an unavailable edition
failed its enum cast. The decision not to make a Kindle edition lives in
`DECISIONS.md` K5/K9, which is where a decision belongs.

---

## Git and the concurrent process

A second agent session was working in this repository throughout. It was not
interrupted, its branch was not touched, and nothing of its was reset, stashed
or reverted.

- Its commits: `19cf8ec`, `aa0c5c6`, `538523b`, `7b1fa95` (five public-domain books).
- Its uncommitted work — four `src/components/*` files, `docs/execution/mobile/`,
  `images/assets/`, `CATEGORY_CARD_ASSET_INGESTION.md`,
  `VALICE_PRESS_UI_ASSET_PROMPT_BOOK.html` — was left exactly as found.
- My commit `817ad4d` staged **three explicit paths**. No `git add -A`, no `git add .`.

**On the "mobile/UI changes already created by you":** there are none of mine.
`docs/execution/mobile/` says on its own first page *"AUDIT ONLY — no production
code was modified"* and its roadmap says *"PLAN — not yet implemented."* The four
modified components (14:48–15:13) belong to the other session's category-card
asset work. There is no mobile code from anyone to deploy, and none of that work
was included.

---

## Deployment

`817ad4d` and `1887f37` pushed to both `feat/production-readiness` and `main`;
Vercel built and aliased to `valicepress.com`.

### The database the site actually reads

The first catalogue load went to the wrong database and cost two deployments.
`load-catalog.mjs --env .env` writes to the `DATABASE_URL` in `.env`, which is
Neon **`bookstore`**. The site reads the one in Vercel's production environment:
**`neondb`** — same host, same credentials, different database.

It was hard to see because `bookstore` is not stale rubbish: it holds the same
books and agreed with production on everything except the rows this task
touched. "World Myths is $6.99 on the live site" looked like proof the write had
landed; it was only proof that both databases had been given that price at
different times.

What settled it: `/search` is the one route rendered on demand rather than from
the ISR cache, and an uncached request for a term only the Greek row carries
came back empty while `.env` insisted the row was published. `vercel env pull`
then put the two database names side by side.

### Live verification

| Check | Result |
|---|---|
| `/books/greek-alphabet-handwriting-workbook` | **200** — cover, $6.99, Add to cart, companion link, 4 preview images |
| `/companion/greek` | **200**, and all four sheets 200 as `application/pdf` |
| QR target | decodes to `https://valicepress.com/companion/greek`, which is 200 |
| `/ebooks`, `/books`, `/categories/language-and-learning`, `/sitemap.xml` | all list the book |
| `/images/books/greek-alphabet-handwriting-workbook.webp` | 200, `image/webp`, 30,232 bytes |
| Production DB | `published`, $6.99, live price id, both master keys, 100 pages |

**Not verified:** the delivery half of a purchase. `/api/admin/fulfillment-check`
would prove master → watermark → signed URL → bytes on the real runtime, but it
needs `OPS_DIAG_TOKEN`, which Vercel marks sensitive and does not return through
`env pull`. The parts that could be checked were: the master downloads from R2
and hashes equal to the local file, the DB row carries both master keys, the
Paddle price is active and maps to this slug, and the webhook is subscribed to
all four events with none missing.
