# Roadmap book 05 — Epictetus: The Discourses and Enchiridion

**Date:** 2026-09-06 · **Branch:** `feature/book-05-production`, **not merged**
· **Project:** `MY-DİGİTAL-BOOK/ROADMAP-BOOKS/05-EPICTETUS-DISCOURSES-AND-ENCHIRIDION`
· **Series:** Valice Classics #3 · Valice Press

---

## 1 · Which book this is

The Master Roadmap §5.1: **"Kitap 05 · Epictetus: The Enchiridion and Selected
Discourses (Annotated)"** — Valice Classics #3, BISAC PHI011000, George Long's
translation, an apparatus, and a Stoic Library bundle as its commercial reason.

Phase 1 built and shipped its ebook. The book itself was never finished:
`SPEC.md` read **NOT STARTED** in every section, eight of twelve gates were
`not_started`, every format in `project_config.json` was `not_planned`, the
catalogue promised a paperback with nothing uploadable behind it, and the
bundle did not exist. This report covers finishing it.

## 2 · The canonical title, and why the cover moved

Seven authorities were read in the order the brief sets. Four agree —
`project_config.json`, the printed title page, the EPUB's `dc:title`, the
catalogue — and the ebook has been **on sale** under that string since Phase 1.

**Canonical: `Epictetus: The Discourses and Enchiridion`.**

The roadmap's line is a *planning* title written before the book existed, and it
describes a different selection ("Selected Discourses"). The cover artwork was
the single outlier, reading *THE DISCOURSES and **the** ENCHIRIDION*. A live
product is not renamed to match a plan, so the cover is what moved.

**A second title field is deliberate and was restored after I broke it.**
`metadata.title` — the KDP listing field — carries **(Annotated)**, because the
house requires a public-domain reissue to be distinguishable in a listing from
the bare public-domain text. `metadata-lint` (`pd-title-tag`) and
`compliance-lint` (`pd`) both enforce it. Flattening the two into one string
broke both; reverted, and the upload guide now tells the Founder which string
goes in KDP's Title box and why. (DECISIONS K2, K7.)

## 3 · The cover, corrected without redrawing anything

Another session had built cover v2 from Founder artwork with good method —
Real-ESRGAN, geometry read from KDP's Cover Calculator rather than derived,
effective ppi computed from real pixels. Three defects remained.

**Both wraps failed preflight**, on the two faults this house has each been
rejected for once: `Helvetica` declared and not embedded (Codex Enigmatica's
real KDP rejection) and metadata `untitled`/`anonymous` (what the Field Book
shipped). Same cause — a PDF written around an image with nobody setting the
document up. The whole wrap is one 3794 × 2775 JPEG; there is no type on the
page at all. `BUILD/wrap_pdf.py` re-emits each with the real title and author,
removes the font resource, and removes the empty `BT /F1 … ET` block that made
poppler report *Unknown font tag 'F1'*.

**The title line.** `BUILD/fix_cover_title.py` locates the gold italic line by
colour, splits it at its own word gap, repaints the line's span with ground
interpolated **per column** from the rows just above and below, and pastes the
artwork's **own `and` glyphs** back, re-centred on the axis of the ENCHIRIDION
line beneath. No font is matched and nothing is redrawn. The module refuses to
write if one pixel outside the line's bounding box changes: it reported **0** on
every cover file.

**The barcode rectangle.** KDP overprints a 2.0 × 1.2 in box at the lower right
of the back cover, and the imprint group — rule, *VALICE CLASSICS · 3*, rule,
*VALICE PRESS* — ran into it. F-029 records that three inpainting repairs were
tried across this cover family and **all three were rejected** for damaging the
artwork. That method was not repeated. Instead the slack in the two gaps above
the group was spent: the laurel wreath and the imprint block were lifted as
blocks (paperback 133 / 224 px, hardcover 85 / 194 px), each cut with its
antialiasing, its old position refilled per column, and pasted higher. The group
stays centred, at its own size, in its own type.

| measured on the rendered final PDF, 300 dpi | glyphs in the box | border rule |
|---|---|---|
| `paperback-wrap-v4.pdf` | **0 px** | 1.198 % |
| `hardcover-wrap-v3.pdf` | **0 px** | 1.360 % |

What remains is the decorative frame that runs around all four sides. KDP's
white box **overlays** it rather than cutting a word, and deleting it would
leave this cover with three finished corners and one open. The check separates
glyphs from the rule and gates on glyphs.

## 4 · The ebook

`build_epub.py` **never added a cover**. The `img/cover.jpg` in the shipped
EPUB had been dropped into the zip by hand, was not declared in the OPF
manifest — so no reading system showed it — and carried the stale artwork. The
builder now packages it properly: a manifest item with
`properties="cover-image"`, the legacy `<meta name="cover">` some shops still
read, and a cover page first in the spine. The editor's name also lost its `ğ`
in `dc:contributor`; restored.

| | |
|---|---|
| EPUBCheck | **0 fatals / 0 errors / 0 warnings** |
| Documents | 21 · **767 internal links, 0 broken** |
| Cover | declared, spine-first, sha256-identical to `ASSETS/cover/kindle-v3.jpg` |
| `dc:title` | matches the canonical title exactly |

## 5 · Formats, decided against measured economics

| Format | State | List | Basis |
|---|---|---|---|
| Direct ebook | **live** | **$9.99** | what Valice Classics 1–7 charge; on Paddle since Phase 1 |
| Paperback | **ready to upload** | **$16.99** | 176 pp measured · printing $3.11 · nets **$7.08 (41.7 %)** · floor first cleared at $12.99 |
| Hardcover | **NOT JUSTIFIED** | — | printing $7.76; the 35 % floor is not cleared until **$31.99** — 1.9× its own paperback, in a twelve-volume series where **no volume has a hardcover**, and the roadmap does not ask for one |
| Large print | **NOT JUSTIFIED** | — | body is **10.5 pt**; at KDP's 16 pt convention 176 pp goes past 400 |
| Kindle | deferred | — | Select is exclusivity and would kill the live direct ebook |

The hardcover wrap is built, preflight clean and **kept**, so that decision is
reversible without rebuilding.

**Why the paperback still reads `coming_soon`.** The files are ready; the Amazon
listing does not exist. Twelve paperbacks in this catalogue share
`coming_soon` + `kdp: not_created`, which is the house's way of saying exactly
that. Marking it `available` would invent a KDP status a reader cannot act on.

## 6 · The Stoic Library bundle — a real transaction, not a presentation

The previous report called this unimplementable because the catalogue has no
bundle entity. Reading the commerce path showed that was wrong. The cart already
creates a Paddle transaction with **one line per book** and passes every book id
in `customData.bookIds`; `processCompletedTransaction` already loops those ids
and grants an entitlement each. Two books in one cart already deliver two books.
The only thing the bundle adds is a lower price.

So it is a **Paddle discount restricted to the two member prices**, attached at
checkout when the cart holds the whole set. No new product, no new catalogue
entity, no second checkout path, no new entitlement semantics.

**Verified against Paddle's own pricing engine:**

| | subtotal | discount | total |
|---|---|---|---|
| separately | $19.98 | $0.00 | **$19.98** |
| as the bundle | $19.98 | $4.99 | **$14.99** |

`dsc_01m1v1b5a1e0b3711gmj78brt3` — active, flat 499 USD, restricted to
`pri_01m1btwjzqvest52bwde6mqqam` (Meditations) and
`pri_01m1pttdvakbj8p0vb8tc86nj5` (Epictetus), tagged
`custom_data.valice_bundle = stoic-library`. It was the only discount on the
account; nothing was duplicated.

The cart used to sum its lines to $19.98 and then charge $14.99. It now prints
the subtotal, the named bundle and what it takes off. Seven tests hold the
definition to the catalogue.

## 7 · Cross-sell

The related shelf was "anything else published, first six" — on this page that
produced the Field Book and World Games and left out **Meditations**, the book
Marcus wrote after reading Epictetus and the other half of the bundle. It now
ranks by relationships the catalogue knows: bundled-with first, then same
collection, then previous order. Making the category tier real required a fix:
`getPublishedBookBySlug` never returned `primaryCategory`, and because the field
is optional the comparison typechecked and always missed — dead code that
looked alive.

## 8 · Commerce, verified

| | |
|---|---|
| Paddle price | `pri_01m1pttdvakbj8p0vb8tc86nj5` · **active** · 999 USD · one-time |
| Paddle product | `pro_01m1pttdjqtta5ryabvtvmtrcj` · active · `valice_slug` linked |
| Corrected on the live account | product name carried "(Annotated)" where the store title does not; description advertised **"178 pages"** for a **176**-page book |
| R2 | `master.pdf` 645,911 B · `master.epub` 1,481,835 B — uploaded and **read back byte-identical** |
| Fulfilment | signed URL (same call shape and TTL as `src/lib/storage`) returns the real EPUB: HTTP 200, `application/epub+zip`, ZIP magic |
| Catalogue | written to **`neondb`**, the database the site reads · 21 books · integrity OK |
| Public page | `/books/epictetus-discourses-and-enchiridion` **200** with the title, translator, $9.99, $16.99, 176 pp and the companion link |
| Companion | `/companion/epictetus` **200**, all four PDFs 200 |

## 9 · Content and print, measured

| Check | Result |
|---|---|
| Enchiridion | **52 of 52** chapters — the back cover says "complete" and it is |
| Discourses | **68**, all assigned across **7** parts (6·10·9·7·12·13·11) |
| Head-notes | **120** — one per chapter |
| Glossary | **18** entries, each with Long's own rendering |
| Concordance | the introduction's *"the four places … and the two places"* is exact: 4 in-selection, 2 cited-but-absent, plus one contextual row the page frames separately |
| Apparatus share | **20.09 %** against the 20 % floor — passes, by 0.09 of a point |
| Interior | preflight **ok** · 176 pp · 6.000 × 9.000 in |
| Spine, recomputed | 176 × 0.002252 = **0.3964 in**; 0.25 + 12.0 + 0.3964 = **12.6464 in** = the built wrap width exactly |
| Printed QR, page 176 | decoded by OpenCV at 300 dpi to exactly `https://valicepress.com/companion/epictetus` |
| Companion leaf | `kdp-linkage-lint`: **COMPLETE** · dedicated page · QR 24 % of page · no invented biography |
| House lints | metadata **ok** · claim **ok** · rights **ok** · compliance **ok** (2 informational AI-disclosure warnings) |
| Suite / lint / types / build | **391 tests pass** · eslint clean · `tsc` clean · build compiles |

## 10 · What is left, and who has to do it

**One action, and it is Amazon's account, not an agent's:** upload the
paperback. `KDP_UPLOAD_GUIDE.html` carries every field, both file hashes, the
measured geometry, the barcode result, the AI declaration, the upload order and
the files **not** to upload. Raised as **F-031**.

Everything else on this book is done.
