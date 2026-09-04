# The Greek Alphabet Handwriting Workbook — production report

**Date:** 2026-09-04 · **Project:** `MY-DİGİTAL-BOOK/GREEK-ALPHABET-HANDWRITING-WORKBOOK`
**Supersedes:** `GREEK_WORKBOOK_STATE.md` (2026-09-04, morning), which recorded an empty
scaffold and refused to manufacture a product from it. That refusal stands as
written; this is what happened when the same project was authorised to be built.

---

## The short answer

The book exists. 100 pages, measured off the file. Two masters uploaded to R2 and read
back. A catalogue row, a preview, a companion page with four sheets, a KDP upload package
and a Founder handbook. **It is not published, and the reasons are four facts nobody in
this environment can change**, all recorded in the catalogue row's `blockers`.

| | |
|---|---|
| Interior | **100 pages**, 8.5 × 11, gutter 0.75 in, outer 0.50 in, no bleed |
| Lessons | **32** — 24 letters, 5 variant forms, 3 on marks and on joining letters |
| Glyph forms taught | **53** — 24 capitals, 24 small, 5 variants |
| Stroke-order provenance | 33 `transcribed` · 16 `latin` · 4 `derived` |
| EPUB | reflowable reference edition, 36 documents, 77 vector diagrams |
| epubcheck 5.1.0 | **0 fatals / 0 errors / 0 warnings** |
| KDP preflight | interior **clean** · cover **clean** |
| Cover | spine 0.2252 in, wrap 17.4752 × 11.25 in, no spine text (correctly) |
| Printed companion | page **99**, QR at **27 % of page height / 30 % of usable**, 2.6 mm modules |
| Paperback | **$12.99** — nets $4.95, 38.1 % |
| Direct ebook | **$6.99** — PDF + EPUB, nets $6.14, 87.8 % |
| Website status | **`draft`** — and that is correct; see *Why it is a draft* |

---

## What the book actually is, and why it is not the obvious book

Greek has **no official stroke-order standard**. That is not a gap in the research; it is
the research finding, and everything about this book follows from it.

- Greek teaching practice says so outright: «Δεν υπάρχει σωστή φορά γραφής των γραμμάτων,
  υπάρχει μόνο προτεινόμενη» — *there is no correct writing direction for the letters,
  only a recommended one* [S-GR-03, re-read and quoted verbatim on 2026-09-04].
- The evidence backs it. A 1998 study of **756** Greek primary-school children, 126 from
  every grade, recorded **28** different ways of writing β, 11 of δ, 19 of θ, **31 of
  capital Δ**, 20 of capital Μ and 15 of capital Ν — and judged the direction of some
  letters in the official first-grade model «κινητικά μη-δόκιμος», motorically unsound
  [S-GR-02; every figure re-verified against the article record on 2026-09-04].

So a Greek handwriting workbook has exactly two options: invent an authority it does not
have, or say what is true. **This one teaches one recommended order per letter, says on
the page that it is recommended, prints the reason, and labels every one of the 53 forms
with where its order came from** — transcribed from a published source, taken from the
Latin letter the reader already writes, or derived by a rule stated in the lesson. That
page is the product. It is also the only claim in the book a reader can check, which is
the kind of differentiator that survives a one-star review.

The second thesis is the pair: every letter carries **what it sounds like in Athens today
and what it sounded like in fifth-century Attic**, so one book serves the traveller and
the Loeb reader. The variant forms (ϑ ϖ ϱ ϲ) and the full polytonic mark set are there for
the same reason — a reader who opens an inscription or an older edition meets them at once.

## The lesson shape

Each lesson is a spread, and the left page does four things a competing workbook does
three of:

1. the letter, capital and small, at 132 pt, with a red dot at every pen-down and a
   numbered arrow for every stroke;
2. **the same letter built up one stroke at a time** — a strip that shows the *order*,
   which a single letter with three arrows on it cannot;
3. what it sounds like now, and what it sounded like then;
4. how it is written, in prose, and the mistake to watch for.

The right page is ruled practice that moves **trace → dot-start → free** and finishes on a
real Greek word — one the reader can spell with what the book has taught by that page, and
the build fails if that is not true.

---

## What was verified, and how

Nothing below is a claim about a build script. Every line is a measurement of a file.

| Check | Tool | Result |
|---|---|---|
| Page count, trim | `pdfinfo` | 100 pages · 612 × 792 pt (8.5 × 11 in) |
| Fonts embedded | `pdffonts` | 5 faces, **all embedded and subset**, no Helvetica |
| PDF metadata | `pdfinfo` | Title and Author set (they were `untitled`/`anonymous` until the linkage lint said so) |
| KDP preflight, interior | `scripts/factory/preflight.py` | 5/5 **PASS** |
| KDP preflight, cover | same | 6/6 **PASS** |
| Cover slots | `scripts/factory/cover-check.mjs` | 2 pass, **0 warn, 0 error** |
| EPUB | `epubcheck 5.1.0` | **0 fatals / 0 errors / 0 warnings** |
| QR position and size | `scripts/factory/measure-qr.py` | 3 finder patterns · 2.972 in · 2.6 mm/module · 27.0 % of page height |
| QR content | **OpenCV `QRCodeDetector`** — not the library that made it | `https://valicepress.com/companion/greek` at 300, 102, 66 and 45 dpi, and after a q60 JPEG round trip |
| Companion linkage | `scripts/factory/kdp-linkage-lint.mjs` | **COMPLETE** — dedicated page, address printed, no email wall |
| Metadata | `scripts/factory/metadata-lint.mjs` | **clean** |
| Rights | `scripts/factory/rights-lint.mjs` | ok — 8 rows, all assessed, all awaiting signature |
| Claims | `scripts/factory/claim-lint.mjs` | ok — 22 claims, 21 VERIFIED, 1 PENDING (declared) |
| R2 masters | `HeadObjectCommand` read-back | `master.pdf` and `master.epub` present, byte counts match local |
| Site | `npm run lint`, `npx tsc --noEmit`, `npm test` | clean · clean · **334 passed** |

### The claims ledger

22 checkable statements, each with its evidence: `CLAIMS.jsonl`. Twenty-one are VERIFIED
against a source re-read on 2026-09-04. **One is PENDING and stays PENDING**: the English
glosses on the 30 practice words and 12 names. I am confident in every one of them, and
"the author is confident" is not verification — in a book whose whole argument is that
this distinction matters, it would be indefensible to mark it green. Ten minutes with a
Greek speaker closes it. Nothing else in the book depends on it.

---

## Why it is a draft, and what would publish it

The catalogue row is `websiteStatus: "draft"`. That is not caution; it is the catalogue's
own rule, enforced by a test: *a published page must be a page a reader can act on.* Right
now nobody can buy this book anywhere, so a product page for it would be a dead end.

Two facts, either of which flips it:

**1 · The Paddle price does not exist, and this was verified rather than assumed.**
The `PADDLE_API_KEY` in this environment is a **sandbox** key (`pdl_sdbx_…`) and returns
**403 forbidden** on `/products`, `/prices` and `/notification-settings` alike. The live
key exists only in the Vercel project environment. One command with it does everything:

```
node scripts/catalog/provision-paddle.mjs --env <live-env-file> --commit --i-know-this-is-live
```

Both master files are already in R2 and read back, so the moment a price exists the ebook
row goes `coming_soon` → `available` and the page publishes.

**2 · The paperback has not been uploaded.** The interior and the cover are built,
preflighted and packaged; only the account holder can put them on KDP. When the ASIN
exists, it goes in the catalogue row and the page publishes on the Amazon link alone.

The other two blockers are not commercial but must not be skipped: the **AI declaration**
(the facts are recorded; the declaration is a statement on a person's account) and the
**ISBN** (none assigned; the copyright page prints `PENDING — KDP-PROVIDED ISBN`).

---

## Decisions taken, with their arithmetic

| Decision | Answer | Why |
|---|---|---|
| Paperback price | **$12.99** | 100 pp large trim: printing $2.84, nets $4.95 (38.1 %). Series band $12.99–14.99; matched to volume 1 (Hangul) so two comparable workbooks are not priced differently on a page count. |
| Hardcover | **not produced** | $19.99 at 100 pp nets ~21 %, under the 35 % house floor — and a consumable a reader writes in and finishes is not a book people want bound. |
| Large print | **not produced** | The book is already 8.5 × 11 with 44-pt exemplars and four-line rules. A large-print edition would be the same book at the same size. |
| Kindle | **not planned** | The reference edition nets 87.8 % direct against at best 70 % on Kindle, and would compete with the print book it exists to support. |
| Direct ebook | **$6.99, two files** | The earlier decision (`no ebook — a workbook's value is the empty box`) was right about the wrong thing. What was built is not a fixed-layout workbook: it is the **printable** interior as a watermarked PDF — the format that lets a reader print page 31 again rather than write in their only copy — plus a **reflowable reference edition**, 36 chapters and 77 scalable diagrams, which is the half a screen is better at. |
| Cover images | **2400 × 3600 PNG + 1600 × 2560 JPEG** | The house source slot is 2400 × 3600 at ratio 1.5 (`COVER_STANDARDS.md`); Amazon's Kindle slot is exactly 1600 × 2560. Neither is the shape of the physical book (8.5 × 11 is ratio 1.294) and neither should be — they are catalogue images, and the wrap PDF is the book's real cover. |

---

## Defects found and fixed during production

Every one of these was found by looking at a rendered page or by running a tool, not by
reading the code that produced it.

1. **Two red start dots on β, Γ, Ε, Ρ and capital Β where there is one pen-down.** The
   diagram nudged coincident dots apart so both were "countable" — printing a capital Β
   with two dots a hair apart under a label reading *2 strokes*. A reader counts dots.
   Now one dot per place the pen goes down, with the arrows fanning out of it and each
   number riding at the tip of its own arrow.
2. **μ's two strokes started at the same point in the same direction** — two identical
   arrows on one dot, describing a movement nobody makes. Stroke 2 now starts at the
   baseline where the stem crosses the line (0.276 of the glyph box, measured), and the
   prose says so.
3. **Α, Λ, Μ and Ν climbed from the baseline** while the book printed *top to bottom, left
   to right* three pages earlier — and while claiming the Latin order for three of them.
   All four now leave the top. Λ was corrected against its source's own words: S-GR-01
   gives capital Λ as *"Same as an A without the horizontal bar"*.
4. **The module's docstring claimed every sequence obeys the general rule.** It does not
   and cannot: the returning diagonals of Μ, Ν, Ζ, Κ, Χ and Υ must travel up, the round
   letters are made anticlockwise, and Δ and Ω are written from the foot. The claim is now
   what is true, and the two exceptions say so in their own lessons.
5. **Five variant pages and the joining lesson were 60–75 % white.** They now carry a
   side-by-side against the ordinary form, a spacing demonstration, and ruled practice to
   the foot of the page.
6. **`Practice grids— the four-line rule`** — the em dash welded to the term on all four
   companion-page bullets, because `wrap()` throws away a leading space.
7. **The interior PDF said `untitled` by `anonymous`.** Caught by the linkage lint.
8. **Non-embedded Helvetica in both the interior and the cover** — ReportLab's `BT /F1 12
   Tf` preamble. Caught by `pdffonts` and by preflight; fixed with `initialFontName`.
9. **`front-v1.png` was 1600 × 2560 with no sRGB chunk**, which is the Kindle spec in the
   house source slot. Now 2400 × 3600 with the chunk written directly (ImageMagick will
   not write it), and the Kindle image lives in its own slot.
10. **The book said "thirty lessons" on the back cover, in the front matter, in the EPUB
    and on the companion tracker. It has thirty-two.** The count is now derived from the
    data in one place, the tracker lists all 32, and the build asserts it.
11. **The names page printed Ζεύς, Απόλλων, Ποσειδών and Ορφεύς with no note**, which
    would leave a reader writing Ζεύς at a taverna. It now prints today's form beside each.
12. **`build-previews.mjs` deleted a live book's preview.** The Hangul interior had been
    renamed by the Phase 5 companion pass, so its path dangled, and the builder dropped
    any book whose source was missing. One unrelated run removed Hangul from the
    storefront. The path is fixed and the builder now keeps an already-rendered preview.

### Guards added, so these cannot come back silently

- `greek_data.check()` — runs on every build. Refuses two strokes that share a start point
  **and** a direction; refuses a first stroke that does not begin at the top of the glyph
  unless the letter is one of the two documented exceptions; refuses a practice word using
  a letter the book has not taught (it caught Ή in Ήρα the first time it ran, via NFD
  decomposition).
- `backmatter.py` asserts its own lesson count against `greek_data.MARK_LESSONS_COUNT`.
- `build_companion.py` asserts the tracker has one row per lesson.
- `mode: "native"` in the companion-page plan — a first-class state for a book typeset with
  its companion leaf in place, so the read-back checks and the upload package still run
  against it without a splice being simulated.

---

## Files

| File | Bytes | sha256 |
|---|---|---|
| `OUTPUT/KDP/PAPERBACK/interior.pdf` | 426,044 | `b127010251f0e701…` |
| `OUTPUT/KDP/PAPERBACK/cover.pdf` | 82,713 | `f7245e24187e5c77…` |
| `OUTPUT/EBOOK/greek-alphabet-reference.epub` | 120,535 | `b97f9788a80ee25d…` |
| `ASSETS/cover/front-v1.png` | 228,308 | `9cf9e6f1af107270…` |
| `ASSETS/cover/kindle-v1.jpg` | 227,993 | `1ffd41a7b7a80056…` |
| `OUTPUT/KDP/KDP_UPLOAD_GUIDE.html` | 22,911 | `1449553014e80edb…` |

*(The KDP handbook is regenerated after any rebuild; its checksums are read from the files
at generation time, so the copy in `OUTPUT/KDP/` always describes the files beside it.)*

---

## What changed in the site repository

| File | Change |
|---|---|
| `scripts/catalog/valice-catalog.mjs` | The book's catalogue row: five format rows, the price bases, the blockers, `websiteStatus: "draft"` with the reason on the line above it |
| `scripts/catalog/paddle-products.mjs` | The product Paddle will create when a live key exists — name, description, $6.99 |
| `scripts/catalog/digital-edition-sources.mjs` | Where the two master files come from, and why a workbook belongs in this list when the Hangul one does not |
| `scripts/catalog/preview-pages.mjs` | Pages 30–31 — the beta spread, chosen because beta is the letter the 1998 study found being written twenty-eight ways |
| `scripts/catalog/build-previews.mjs` | **Fix:** a missing source no longer deletes an already-rendered preview |
| `src/lib/companions.ts` | The `/companion/greek` page: four sheets, the rights note, `book-not-yet-available` with an honest state note |
| `src/lib/newsletter-client.ts`, `src/app/api/newsletter/route.ts` | `greek-companion` added to **both** the type and the runtime allowlist — the Phase 4 defect where four sources were in one and not the other |
| `scripts/factory/print-interiors.mjs` | The built interior, so the linkage lint can read the book |
| `scripts/factory/edition-geometry.mjs` | 8.5 × 11, white, paperback — `paperVerified: true`, measured not assumed |
| `scripts/factory/companion-page-spec.mjs` | The page copy, and **`mode: "native"`** — a first-class state for a book typeset with its companion leaf in place |
| `scripts/factory/build-companion-pages.mjs` | Understands `native`; **`--packages-only`** refreshes upload packages without re-splicing any interior; the manifest no longer names a backup file that does not exist, measures the QR off the page for native editions, and recommends a proof for an edition nobody has ever printed |
| `scripts/factory/companion-page.test.js` | Resolves the companion page for `native`; asserts that a package for an edition **not yet at KDP** never says "do not touch the cover" |
| `valice-house/rights/ledger.csv` | Eight rows, RL-0044 … RL-0051; the 2026-09-02 placeholder RL-0020 marked superseded |
| `public/companion/greek/` | Four generated sheets: 48-page stroke boxes, 4-page grid, chart, tracker |
| `public/images/previews/greek-alphabet-handwriting-workbook/` | Two rendered pages |

### The bug that was found by accident, and mattered most

`build-previews.mjs` rebuilt the manifest from scratch on every run and **dropped any book
whose source PDF was missing**. The Hangul interior had been renamed by the Phase 5
companion pass (`…_124pp.pdf` → `…_126pp.pdf`), so its path dangled — and the first
unrelated run of the preview builder silently removed a **live** book's preview from the
storefront. Only the catalogue test caught it, and only because that book is published.

The path is corrected, and the builder now keeps an entry whose images are still on disk
and says so loudly instead. A slug removed from the configuration is still dropped, because
that is a decision rather than an accident.

### The other cross-book fix

Four upload packages — Dudeney, Epictetus, Seneca and Myths and Legends of China — told
the Founder **"Do not touch the cover. The page count did not move, so the wrap at KDP is
still exactly right."** None of those four editions is at KDP. Following that instruction
would mean publishing a paperback with no cover. The writer now distinguishes a first
upload from a re-upload, the test asserts it, and all nineteen finished packages were
refreshed with `--packages-only`, which rewrites the document without touching a single
interior.
