# The KDP update package — what to upload, in what order, and what not to touch

**Built 2026-09-03.** Eighteen print editions were audited by reading their built PDFs; seventeen were rebuilt. This file is the index. Each edition has its own directory under `kdp-packages/<slug>/<format>/` with a `manifest.json` (machine-readable, hashes included) and an `UPLOAD.md` (the steps, for a person).

Regenerate the whole set: `node scripts/factory/build-companion-pages.mjs --commit`.

---

## Read this first

**Eight of the seventeen files can be uploaded today with no cover work at all.** They replaced a blank page or a weak note, so the page count did not move, so the wrap at KDP is still exactly right. Those are the twenty minutes that matter.

The other nine added a leaf. Six of them have a rebuilt cover waiting beside them; two cannot have one built from here and say so; one is in KDP review and must not be touched. **Six of the nine are held for a business reason that has nothing to do with whether the file is finished** — they are, and they are verified.

---

## Group A — upload now · no cover changes · about twenty minutes

Interior only. **Do not touch the covers**: the page count did not change, so the spine did not change, so the wrap you already uploaded is still correct. Uploading a cover you did not need to is how a valid listing goes back into review.

| # | Book | Format | Pages | Companion page | What it replaced |
|---|---|---|---|---|---|
| **A1** | The Great Book of World Games | paperback · `B0HG3KMK9L` | 160 → **160** | p. 160 | the 09-02 note: a text block at the top of an otherwise empty page, **no code at all** |
| **A2** | The Great Book of World Games | hardcover · `B0HG41F21F` | 160 → **160** | p. 160 | the same |
| **A3** | The Great Book of World Myths | paperback · `B0HDTL5V2H` | 234 → **234** | p. 233 | the half-page "THE MAP, FULL SIZE" note — a one-inch code low on the page with a caption beside it |
| **A4** | The Great Book of World Myths | hardcover · `B0HDZJ4PHQ` | 234 → **234** | p. 233 | the same |
| **A5** | The Myth Hunter's Field Book | paperback · `B0HFP4KYX5` | 156 → **156** | p. 156 | the second of two identical ruled "Field Notes" pages. **Also fixes the PDF metadata**, which shipped as *untitled / anonymous* — what a library catalogue reads |
| **A6** | Codex Enigmatica | paperback · `B0HGSVF15Q` | 274 → **274** | p. 274 | the verification page, which printed its address in body type and carried no code. Same three facts, now with a 2.1-inch code |
| **A7** | Codex Enigmatica | hardcover · `B0HH3B4HQ7` | 276 → **276** | p. 276 | an empty final leaf. The original verification page on p. 275 is untouched |
| **A8** | The Puzzles of Henry Dudeney | paperback · *not listed* | 144 → **144** | p. 144 | an empty page carrying only a running head. The book's one companion mention had been a single line inside the imprint on p. 4 |

A8 has no ASIN because the paperback has never been uploaded — it waits on **F1** (the AI declaration) and **F2** (a proof). Nothing at KDP is affected by rebuilding it.

**Per edition:** Bookshelf → the book → the format → *Edit print manuscript* → upload the interior named in that edition's `UPLOAD.md` → previewer → confirm the page shown above carries the code and the address → save.

---

## Group B — upload with a rebuilt cover

The block changed thickness. The spine changed with it. Upload both files together.

| # | Book | Format | Pages | Spine | Rebuilt wrap | Hold |
|---|---|---|---|---|---|---|
| **B1** | Korean Hangul Handwriting Workbook | paperback · `B0HHHWXGG4` | 124 → **126** | 0.2792 → **0.2838 in** | ✅ `05_APLUS_COVER/exports/paperback_cover.pdf` | none — **upload it** |
| **B2** | Korean Hangul Handwriting Workbook | hardcover · in review | 124 → **126** | — | ❌ see below | in review **and** needs your calculator run |
| **B3** | Codex Bestiarium | paperback · `B0HDLQHQ7H` | 435 → **436** | 1.0875 → **1.0900 in** (cream) | ✅ `03_COVER/PAPERBACK/exports/` | bundle with **O4** |
| **B4** | Codex Bestiarium | hardcover · `B0HDLLPG5M` | 435 → **436** | wrap 14.8508 × 10.4167 in | ✅ `03_COVER/HARDCOVER/exports/` | bundle with **O4** |
| **B5** | Codex Bestiarium | large print · `B0HDLT1V3P` | 599 → **600** | 1.4975 → **1.5000 in** | ✅ `03_COVER/LARGEPRINT/exports/` | bundle with **O4** |
| **B6** | Codex Mythologica | paperback · `B0HCY8KY3X` | 329 → **330** | 0.8225 → **0.8250 in** | ✅ `03_COVER/PAPERBACK/exports/` | **2026-11-03** |
| **B7** | Codex Mythologica | hardcover · `B0HDBFZRQ4` | 329 → **330** | wrap 14.5858 × 10.4167 in | ✅ `03_COVER/HARDCOVER/exports/` | **2026-11-03** |
| **B8** | Codex Mythologica | large print · `B0HDDR84MF` | 578 → **579** | 1.4450 → **1.4475 in** | ✅ `03_COVER/LARGEPRINT/exports/` | **2026-11-03** |
| **B9** | The Great Book of World Games | large print · in review | 232 → **233** | 0.5225 → **0.5247 in** | ❌ see below | in review **and** the cover cannot be built here |

Both papers were rebuilt for the six Codex wraps (white and cream). **Take the one your listing actually prints on** — the manifests carry both wrap widths, and a wrap built on the wrong stock is the recorded Enigmatica defect: 0.068 in out, outside KDP's ±0.0625 in tolerance, on a file that had already been reported clean.

### Why the two holds are business decisions, not unfinished work

**B3–B5 (Bestiarium), held for O4.** All four Bestiarium listings still say *120 Legendary Creatures*; the book contains 112. That correction needs a KDP visit for every edition anyway. Doing the interior now would mean two review cycles per edition instead of one, on books with zero sales. When you sit down to fix the number, these three files go up in the same pass.

**B6–B8 (Mythologica), held to 2026-11-03.** KDP Select runs until that date, and on it the interiors are reopened anyway so the ebook can be sold here. One calendar entry, two jobs — handbook **O5**.

### Why two covers could not be built here, precisely

**B2 · Hangul hardcover.** This project records the hardcover wrap as a value you read out of KDP's own Cover Calculator (`project_config.json → formats.hardcover.kdp_calculator`), and that stored value is pinned and page-count independent — so re-running the builder at 126 pages faithfully reproduces the 124-page wrap. The house standard forbids deriving a hardcover wrap from a formula. **Five minutes in the calculator** at 126 pp / 8.25 × 11 / white, paste the three numbers into that config block, re-run `06_BUILD/build_cover.py --format hardcover`, and it is done. The paperback (B1) has no such dependency and its cover is rebuilt and correct.

**B9 · World Games large print.** The block moves 232 → 233 pages, so the wrap needs a new spine, but this project's `covers.py` takes the page count from `06_REPORTS/interior-largeprint.json` — and that report has recorded **234 pages since before this phase while the built block was 232**. That divergence is a pre-existing finding, not something this pass caused, and only re-running `04_BUILD/interior.py` regenerates the report and its page map. So at this edition's first revision after it leaves review: run `interior.py`, then `covers.py`, and take the companion page through the pipeline's own companion block rather than as a splice. Its copy is already written in `companion-page-spec.mjs`.

**B9 also carried the invented author biography** — "Emre is a puzzle designer, mythologist, and game archivist", a claim about you that nobody authorised, open in the matrix since 2026-09-02. **That is now fixed**, on a page re-set to land within 0.001 pt of the original line geometry, and it is page-neutral. It rides along whenever this edition is next touched.

---

## Not in either group

**The Myth Hunter's Field Book, hardcover.** Listed as *coming soon*; no interior has ever been built for it. `kdp-linkage-lint` reports it BLOCKED, which is accurate: there is no file. Building it is a book-production job, not a linkage job.

---

## What "verified" means on these files

Every one of the seventeen was read back after it was written, not merely produced:

| Check | How |
|---|---|
| page count | `pdfinfo` on the finished file, compared with the plan |
| the printed address | `pdftotext` of the companion page, string match |
| canonical host | no `vercel.app`, no `localhost`, no IP, no `valice-press.com` |
| no email wall | the page asks for nothing; KDP's hyperlink rule and the stricter house rule |
| **the code carries the right URL** | the finished page rasterised at 300 dpi and read **module by module** against the code the URL produces. One flipped module fails |
| QR is large enough | measured share of the usable page height, and millimetres per module against the 0.5 mm print floor |
| fonts embedded | `pdffonts` on that page — this is what caught ReportLab quietly adding non-embedded Helvetica |
| PDF metadata | a real title and author, never *untitled / anonymous* |
| the spine | `spine-check.mjs` against KDP's published per-page thickness, agreeing with each project's own cover report |

The previous build of every interior is kept beside it as `*.pre-companion.pdf` and is never deleted.

---

## The order to do it in

1. **A1–A8** — eight uploads, no covers, about twenty minutes. This is the whole of the reader-facing win.
2. **B1** — Hangul paperback, interior + rebuilt cover. Pilot C's bridge.
3. **F5 · the first ad campaign.** Only after A1: an ad sends a stranger to a listing, and the page in the book is what turns that buyer into someone you can reach again.
4. **O4** whenever you next open KDP → B3–B5 ride along.
5. **2026-11-03** → B6–B8, plus the Mythologica ebook going on sale here.
6. **When the two in-review editions go live** → B2 (after five minutes in the cover calculator) and B9 (after a pipeline run).
