# Phase 1 + Phase 2 — cover and format revision

**Date:** 2026-09-06 · **Branch:** `feature/public-domain-phase-2` · **Books:** all ten

The Founder supplied new cover artwork for all ten Phase 1 and Phase 2 books on 2026-09-05/06,
two files per book under `ASSETS/cover/`: `new-kindle-cover.png` and
`new-paperback-wrap-cover.png`. This is what was done with them.

## 1. What the artwork actually was

Measured before anything was done to it, and not from the metadata — the supplied PNGs carry
**no DPI tag at all**, so an "effective DPI" taken from the file header would have been a
fiction.

| | kindle art | wrap art |
|---|---|---|
| pixels | 992 × 1586 (Chess: 1024 × 1536) | 1536 × 1024 |
| colour | sRGB, 8-bit, **alpha present** | sRGB, 8-bit, **alpha present** |
| DPI tag | absent | absent |

The wrap file is a **comp, not a wrap**. Its spine is about 110 px of 1536 — roughly 1.0 in on
a 12.6 in wrap — where a real 176 pp 6 × 9 spine is 0.396 in. Its panels are also the wrong
aspect for a 6 × 9 page. It could not be used as supplied and was not.

## 2. The decision: Option A, artwork kept

The task offered two routes: keep the artwork and re-set its typography, or generate a
textless equivalent. **The artwork was kept and its typography kept with it**, because the
test that decides it came out in the artwork's favour:

- the lettering was inspected at 1:1 and is correctly formed — no mis-rendered glyphs, which
  is the fault the house rule against raster type exists to catch;
- every factual claim on every cover was checked against that book's own records — the
  diagram counts (5/5/5/3), the 78 tunes, *Accroshay to Nuts in May*, the Oriental Club of
  Philadelphia and its 1894 date, and all ten source-author names. **All correct.**
- taken to print size with Real-ESRGAN the type stays crisp at 300 DPI, small caps included.

No image model was run. `OPENAI_API_KEY` is present and was **not used**: it was not needed.

**The one exception is the spine**, which had to be rebuilt — the comp's spine is ~2.6× too
wide and its lettering cannot simply be scaled down. Each spine is now a text-free ground in
the comp's own colour (per-row dark-percentile, so the shading survives and the letters do
not) with the title and author **set in type** in the house faces, Cinzel and EB Garamond.

## 3. Resolution — what was really done

Real pixel upscaling with **Real-ESRGAN (realesrgan-x4plus, ncnn-vulkan 20220424)** on the
GPU, ×4, then LANCZOS down to the exact target. Measured against plain LANCZOS on the same
crop, ESRGAN is visibly sharper on the fine type and does not distort the letterforms.

Per COVER_STANDARDS.md §2.8 the **native** resolution is recorded and not dressed up: a back
or front comp panel is ~700 px across a 6.125 in printed panel, which is ~114 ppi of original
detail presented on a true 300 DPI raster. The file is genuinely 300 DPI; the detail in it
came from 114 ppi and a super-resolution model. Both numbers are in each `QA/cover.json`.

## 4. Geometry — from the calculator, never derived

Every print dimension was read off the **official KDP Print Cover Calculator**
(<https://kdp.amazon.com/en_US/cover-templates>) on 2026-09-06 and stored in
`COMMON-AREA/covers/kdp_geometry.json`. The paperback formula the projects already used
(spine = pages × 0.002252 in) was **confirmed exactly** against the calculator at 176 pp
(12.646 × 9.25, spine 0.396) and 244 pp (12.799 × 9.25, spine 0.549).

## 5. Every book

| Phase | Book | supplied kindle | supplied wrap | ebook cover | pp | spine in | wrap in | hardcover |
|---|---|---|---|---|---|---|---|---|
| Phase 1 | **Epictetus: The Discourses and Enchiridion** | 992×1586 | 1536×1024 | 1600×2560 | 176 | 0.3964 | 12.6464×9.25 | yes |
| Phase 1 | **Seneca: Selected Dialogues** | 992×1586 | 1536×1024 | 1600×2560 | 156 | 0.3513 | 12.6013×9.25 | yes |
| Phase 1 | **Myths and Legends of China** | 992×1586 | 1536×1024 | 1600×2560 | 108 | 0.2432 | 12.4932×9.25 | yes |
| Phase 1 | **Indian Myth and Legend** | 992×1586 | 1536×1024 | 1600×2560 | 94 | 0.2117 | 12.4617×9.25 | yes |
| Phase 1 | **Mythical Monsters** | 992×1586 | 1536×1024 | 1600×2560 | 74 | 0.1666 | 12.4166×9.25 | **no** |
| Phase 2 | **Games Ancient and Oriental** | 992×1586 | 1536×1024 | 1600×2560 | 78 | 0.1757 | 12.4257×9.25 | yes |
| Phase 2 | **Korean Games** | 992×1586 | 1536×1024 | 1600×2560 | 144 | 0.3243 | 12.5743×9.25 | yes |
| Phase 2 | **Chess and Playing Cards** | 1024×1536 | 1536×1024 | 1600×2560 | 120 | 0.2702 | 12.5202×9.25 | yes |
| Phase 2 | **Mancala, the National Game of Africa** | 992×1586 | 1536×1024 | 1600×2560 | 38 | 0.0856 | 12.3356×9.25 | **no** |
| Phase 2 | **The Singing Games of England, Scotland, and Ireland** | 992×1586 | 1536×1024 | 1600×2560 | 244 | 0.5495 | 12.7995×9.25 | yes |

## 6. Hardcover — geometry read per page count

KDP hardcover accepts **76–550 pages**; the calculator's exact words for 74 are
*"Page count must be between 76 - 550"*. Eight qualify and are built. Constants for all:
front cover 6.197 × 9.236 in, wrap 0.591 in, hinge 0.394 in, spine margin 0.062 in,
barcode margin 0.25 × 0.375 in.

| Book | pp | full wrap in | spine in | spine safe in | px @300 |
|---|---|---|---|---|---|
| Epictetus: The Discourses and Enchiridion | 176 | **14.16 × 10.417** | 0.585 | 0.46 | 4248×3125 |
| Seneca: Selected Dialogues | 156 | **14.115 × 10.417** | 0.54 | 0.415 | 4234×3125 |
| Myths and Legends of China | 108 | **14.007 × 10.417** | 0.432 | 0.307 | 4202×3125 |
| Indian Myth and Legend | 94 | **13.975 × 10.417** | 0.401 | 0.276 | 4192×3125 |
| Mythical Monsters | 74 | — | — | — | *74 pp — two under the 76 minimum* |
| Games Ancient and Oriental | 78 | **13.939 × 10.417** | 0.365 | 0.24 | 4182×3125 |
| Korean Games | 144 | **14.088 × 10.417** | 0.513 | 0.388 | 4226×3125 |
| Chess and Playing Cards | 120 | **14.034 × 10.417** | 0.459 | 0.334 | 4210×3125 |
| Mancala, the National Game of Africa | 38 | — | — | — | *38 pp — ebook only* |
| The Singing Games of England, Scotland, and Ireland | 244 | **14.313 × 10.417** | 0.738 | 0.613 | 4294×3125 |

## 7. The defect that was found and not repaired

KDP prints the barcode in a white 2.0 × 1.2 in box at the lower right of the back cover.
The comps centre the series line at the foot of the back cover and on eight of ten it lands
in that box.

| Book | barcode box | lines inside |
|---|---|---|
| Epictetus: The Discourses and Enchiridion | **lettering inside** | 1 |
| Seneca: Selected Dialogues | **lettering inside** | 3 |
| Myths and Legends of China | **lettering inside** | 1 |
| Indian Myth and Legend | clear | 0 |
| Mythical Monsters | **lettering inside** | 3 |
| Games Ancient and Oriental | **lettering inside** | 1 |
| Korean Games | clear | 0 |
| Chess and Playing Cards | **lettering inside** | 4 |
| Mancala, the National Game of Africa | **lettering inside** | 3 |
| The Singing Games of England, Scotland, and Ireland | **lettering inside** | 1 |

Three repairs were built and all three rejected on the proof — an inpaint over the band
smeared the rock, foliage and frame rule; a per-row ground refill left flat rectangles on the
marble; a tight glyph-mask inpaint left ghost blobs. Each did more visible harm than the
barcode does, so **the artwork ships intact** and the finding is **F-029** for the Founder.
The fix belongs in the comp and costs one regeneration.

## 8. Ebooks

All ten EPUBs now carry the new cover and all ten pass EPUBCheck **0 fatal / 0 error /
0 warning**. Two different faults were repaired:

- **Phase 1 (five books)** had **no cover at all** — no image, no cover page, no
  `properties="cover-image"`, no `<meta name="cover">`. They are on sale. A reader would have
  shown a blank slab. The whole cover was added.
- **Phase 2 (five books)** carried the superseded `kindle-v1` art; the image was replaced.

## 9. Website

`front-v2.png` was ingested to `public/images/books/<slug>.webp` for all ten by the
repository's own `scripts/covers/ingest-covers.mjs` — one asset map, not ten page edits.
**Four of the ten had no storefront image at all** (Korean Games, Chess and Playing Cards,
Mancala, The Singing Games). `validate-catalog` went from **44 pass / 33 error** to
**54 pass / 0 error**.

## 10. Compliance

`compliance.aiDisclosure.images` moved from `none` to **`generated`** on all ten, with the
evidence written beside it. The covers are AI-generated images and KDP must be told. This is
what Constitution **Article 20** already provides for — *"Where one is used, it is declared"* —
so it is the policy applying, not a change to it. Interior figures are unchanged and are not
generated: where a book has diagrams or staves they are drawn by its own `BUILD/` program
from measured values.

## 11. What was NOT done

- **No KDP upload.** No ASIN, ISBN, review or sales figure appears anywhere. The Founder
  uploads; `KDP_UPLOAD_HANDBOOK.html` in each book names every file and field.
- **No Paddle write.** The five Phase 2 products are still to create; the sandbox classifier
  refuses the live-account command. **F-028** carries the one-liner.
- **No manuscript was rebuilt.** Not one word of any interior changed.
