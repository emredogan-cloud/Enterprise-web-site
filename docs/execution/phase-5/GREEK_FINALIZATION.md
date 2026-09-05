# The Greek Alphabet Handwriting Workbook — finalisation

**Date:** 2026-09-05 · **Project:** `MY-DİGİTAL-BOOK/LANGUAGE-SERIES/GREEK-ALPHABET-HANDWRITING-WORKBOOK`
· **Supersedes** `GREEK_WORKBOOK_STATE.md` (2026-09-04, "there is no book") and
`GREEK_DEPLOYMENT.md` on the cover and on the hardcover.

The Founder's instruction of 2026-09-05 set the format ladder for this title:
**direct ebook + paperback + hardcover**, large print only if genuinely
justified. Two of those already existed. This pass produced the third, lifted
the cover hold, and closed the fallout of a repository reorganisation that had
quietly broken six catalogue tools.

---

## 1 · The cover hold was half right, and is now closed

The 2026-09-04 pass held the Founder's supplied artwork because its scroll
printed a Greek alphabet with wrong letterforms. Held, not discarded — which
was the right call, because the artwork is good and the defect was specific.

Re-read on 2026-09-05 at 8×, with each row de-slanted so the perspective stops
lying about what is drawn:

| Claim, 2026-09-04 | Measured, 2026-09-05 |
|---|---|
| Portrait art row 1: Δ drawn as an open Λ | **True.** Apex (409, 965), left foot to (411, 1005), right foot to (460, 998), and clean parchment where the baseline belongs |
| Portrait art row 3: `Ν Ε Ο Π Ρ Σ`, Ξ drawn as Ε | **False.** The glyph is three detached horizontal bars with no stem — a correct Ξ. Its bars' left ends step right as the rows recede, which at cover size reads as a stem |
| Landscape art: letters out of order, mismatched case pairs, a Latin G | **True, and worse.** Ι and Ο are absent entirely, sigma appears twice (once as a lunate C), and Θ is drawn with a cross for its bar |

So the two artworks needed two different answers.

**The portrait art is repaired.** A Δ is a Λ plus its baseline, so
`BUILD/repair_cover_greek.py` draws that one stroke between the two feet the
painter already drew: 4,422 pixels of a 25-megapixel picture (0.018 %), every
one of them the paper underneath multiplied by the ink-to-paper ratio measured
off this same letter's right leg (0.222 / 0.202 / 0.186). Multiplying rather
than filling means the new stroke carries the picture's own sunlight — warm
brown where the parchment is lit, near-black where the scroll turns into shade,
exactly as the painted strokes do. Nothing is repainted and no image model is
asked for a letter, which is the same rule the interior follows.

**The landscape art is not repaired, because it is not repairable.** Its scroll
is not a correct alphabet with a missing stroke; it is a different alphabet. So
it supplies what it is good at and what is true — the back panel (olive, the
Acropolis at dusk, an inscribed stone) and the marble spine — and the **front
panel of every format comes from the corrected portrait art**. That has a second
benefit worth more than the first: the paperback front, the hardcover front, the
storefront cover and the Kindle thumbnail are now one picture, which is what
every other Valice title does and what this one did not.

Recorded as `DECISIONS.md` K11 and in `ASSETS/cover/README-COVERS.md`.

## 2 · The hardcover: an override that the numbers agreed with

`K8` (2026-09-04) measured a $19.99 hardcover at 21 % and concluded the format
was not viable. The measurement was right. The conclusion was not: **$19.99 was
the wrong price, not the wrong format.**

KDP's hardcover printing cost in the **75–108 page band is a flat $5.65** with
no per-page charge, which makes a short hardcover the cheapest one it prints.

| List | Print | Net | Margin | House floor 35 % |
|---|---|---|---|---|
| $19.99 | $5.65 | $6.34 | 31.7 % | ✗ |
| $21.99 (roadmap TEST) | $5.65 | $7.54 | 34.3 % | ✗ — misses by 0.7 pt |
| **$24.99** | $5.65 | **$9.34** | **37.4 %** | ✓ |

$24.99 is now the best margin of any format this book has. `DECISIONS.md` K12,
recorded as an override — K8's measurement stands untouched above it.

### It is a separate book, not a separate jacket

`build_interior.py --hardcover` was changing the gutter and leaving the trim at
8.5 × 11. **KDP has no 8.5 × 11 case-laminate trim** — its five are 5.5×8.5,
6×9, 6.14×9.21, 7×10 and 8.25×11, read off the Cover Calculator's own
configuration block. That build would have produced a file KDP rejects. It now
sets the trim as well: 8.25 × 11 with a 0.875 in gutter, and measures its own
page count, which came out at 100 as well — the 0.25 in the narrower trim loses
is the same 0.25 in the wider gutter takes. `DECISIONS.md` K13.

### The wrap geometry was read, never derived

The house standard forbids deriving a hardcover wrap, and it has a scar behind
it: World Myths' derived hardcover spine was 0.129 in narrow and would have been
rejected. Earlier passes therefore recorded hardcover wraps as Founder actions —
five minutes in KDP's Cover Calculator.

That calculator turns out to be **a public page that needs no sign-in**. Run at
Hardcover · Black & white · White paper · Left to Right · Inches · 8.25 × 11 in
· 100 pages, it printed:

| | in |
|---|---|
| Full cover | **18.489 × 12.417** |
| Front cover panel | 8.447 × 11.236 |
| Spine | **0.414** |
| Wrap (all four edges) | 0.591 |
| Hinge (each side of the spine) | 0.394 |
| Margin | 0.125 |
| Spine safe area | 0.289 × 10.986 |
| Barcode margin | 0.25 horizontal · 0.375 vertical |

Cross-checked against the one other confirmed calculator run this house holds
(World Games, same trim and paper, 160 pages: 18.624 × 12.417, spine 0.549, wrap
0.591, hinge 0.394, front 8.447 × 11.236): every field but the spine is
identical, and the two full widths differ by exactly the spine difference —
0.135 in. Stored at `project_config.json → formats.hardcover.kdp_calculator`
with its source line, and `build_cover_art.py` **refuses to build** if the
stored page count and the built interior disagree. `DECISIONS.md` K14.

## 3 · Spine type: one format gets it, one does not

KDP allows spine text from 79 pages. That is a rule about whether a fold exists,
not about whether type fits in it.

- **Paperback — none.** Spine 0.2252 in, less KDP's 0.0625 in clearance on each
  side, leaves 0.1002 in ≈ 7 pt. KDP's own binding tolerance is ±0.0625 in,
  which is *larger than the clearance the type would sit in*. Type there is type
  that can be trimmed off.
- **Hardcover — yes.** Spine 0.414 in with a 0.289 in safe area takes 10.8 pt.
  Set in dark ink with a paper halo (the painted spine is pale marble; the first
  render's light type was invisible on it), and placed in the two bands of the
  painted strip that carry no ornament — measured off the art's own row-darkness
  profile: capital at 0.841–0.990, olive sprig at 0.484–0.540, capital at
  0.084–0.178.

`DECISIONS.md` K15.

## 4 · Large print: still no, and still for the same reason

The book is already an 8.5 × 11 large trim with 44-point exemplars and four-line
rules. A large-print edition would be the same book at the same size: nothing
for the reader, one more record to maintain, and a listing competing with its
own. `DECISIONS.md` K4, re-examined and unchanged.

## 5 · What was verified, not asserted

| Check | Result |
|---|---|
| Paperback interior | preflight **ok** · 100 pp · 8.500 × 11.000 in · 5 fonts, all embedded |
| Hardcover interior | preflight **ok** · 100 pp · 8.250 × 11.000 in · 5 fonts, all embedded |
| Paperback wrap | preflight **ok** · 17.475 × 11.250 in · 2.0 MB · barcode zone measured clear (0.00 %) |
| Hardcover wrap | preflight **ok** · 18.489 × 12.417 in · 2.1 MB · barcode zone measured clear (0.00 %) |
| Cover resolution | back 341 dpi · front 482 dpi (paperback); back 343 · front 485 (hardcover) — KDP asks 300 |
| `cover-check.mjs` | 6 pass · 0 warn · 0 error |
| EPUB | EPUBCheck **0 fatals / 0 errors / 0 warnings / 0 infos** · 36 documents · 77 images · rebuilt on the new cover |
| Printed QR, both interiors | rasterised at 200 dpi and read **module for module**: 841/841 match against `https://valicepress.com/companion/greek`, which returns 200. 2.6 mm per module, 27 % of the page height, on a leaf of its own |
| R2 masters | `master.pdf` (0.40 MB) and `master.epub` (1.18 MB) re-uploaded and read back |
| Paddle | price `pri_01m1pmtds9p93zm735432kv98x` live, 699 USD, one-time — unchanged, verified present |
| Catalogue | `valice-catalog.test.ts` 18/18 · loader wrote 16 books, Greek carrying 4 formats and 1 buyable |
| Storefront cover | `front-v2.png` → `public/images/books/greek-alphabet-handwriting-workbook.webp` 1067×1600, 142 KB |
| Live routes | `/books/greek-alphabet-handwriting-workbook`, `/ebooks`, `/companion/greek`, `/categories/language-and-learning` — all **200** |

## 6 · Six catalogue tools were pointing at paths that no longer exist

Not part of the brief, but it blocked the brief. The book repositories were
reorganised into `CODEX-SERIES/`, `GAMES-PUZZLE/`, `LANGUAGE-SERIES/` and
`PHASE-1-BOOK/` after these path tables were written, and nothing had re-read
them since. The tools failed loudly, which is why they were found rather than
silently producing wrong output.

| File | Was | Now |
|---|---|---|
| `scripts/catalog/digital-edition-sources.mjs` | 6 of 12 sources missing | all 12 resolve |
| `scripts/catalog/preview-pages.mjs` | 4 books "MISSING SOURCE", keeping stale images | 55 preview images, all books rendered |
| `scripts/factory/print-interiors.mjs` | **20 of 26 editions BLOCKED** | 25/25 interiors resolve · linkage lint **COMPLETE 22** |

The linkage audit had been reporting the whole catalogue as blocked. It now
reports COMPLETE 22 · NEEDS_REVISION 1 · IN_REVIEW 2 · BLOCKED 1.

## 7 · What is left, and who has to do it

Everything remaining is an account-holder action. Nothing is waiting on work.

1. **KDP upload — paperback**, then **hardcover**. Two interiors, two wraps, all
   four preflight clean. `OUTPUT/KDP/KDP_UPLOAD_GUIDE.html` now carries three
   full format sections (ebook · paperback · hardcover) with every field, every
   filename, every measured dimension and the files *not* to upload.
2. **The AI declaration.** The values are recorded with their evidence in
   `project_config.json → compliance.aiDisclosure`; the declaration is made on a
   person's KDP form. `compliance-lint` fails on exactly that one line, which is
   the honest state of this book.
3. **Gate 2 signature** on nine assessed-clean rights rows.
4. **Ten minutes with a Greek speaker** on the 30 word glosses — the single
   PENDING row in `CLAIMS.jsonl`.
5. **Proof copies, both formats.** First print of both interiors and both
   covers; the hardcover's case folds around board and that fold is not visible
   on screen.
6. **Deploy.** The corrected cover and the new previews are repository files on
   `feature/public-domain-phase-2`. Production still serves the superseded
   vector cover until that branch is merged — which the 2026-09-05 instruction
   explicitly defers to the Founder.
