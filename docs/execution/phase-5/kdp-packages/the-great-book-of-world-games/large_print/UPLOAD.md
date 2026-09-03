# The Great Book of World Games — large_print — KDP upload package

**Generated:** 2026-09-03 · **ASIN:** — (not listed) · **KDP state:** in_review

## HOLD — do not upload yet

IN KDP REVIEW since 2026-09-02, and the cover cannot be rebuilt from here. The block moves 232 → 233 pages, so the wrap needs a new spine — but this project's cover pipeline reads `06_REPORTS/interior-largeprint.json`, which has recorded 234 pages since before this phase while the built block was 232 (a pre-existing divergence, reported as a finding). Only re-running `04_BUILD/interior.py` regenerates that report and its pagemap. So: at the first revision after this edition goes live, run interior.py → covers.py, and take the companion page through the pipeline's own companion block rather than as a splice. The invented biography, which was the other defect, is already fixed and is page-neutral.

The file below is finished and verified. It waits on the calendar, not on work.

## What changed

A dedicated companion page now stands on page **233**: a QR occupying NaN % of the usable page height, the address `valicepress.com/companion/world-games` printed beneath it in display type, and a named list of what is waiting there. It is a new leaf; nothing was removed.

- **Pages:** 232 → **233**
- **Spine:** 0.5225 in → **0.5247 in** (white paper, 8.5×11 in)
- **Wrap width:** 17.7725 in → **17.7747 in**
- **Cover:** REBUILD CORRECT — inside tolerance, but the printed spine no longer matches the block
- **Proof:** recommended — the block changed thickness

## The file

```
/home/emre/Downloads/MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/LARGEPRINT/GreatBookOfWorldGames_interior_largeprint.pdf
sha256 5a73f4b9d8660a4f1f039e5904bb12e705ba22b0a3742fdbbe1e7157769e29a0
994,068 bytes · 233 pages
```

The build it replaces is kept at `/home/emre/Downloads/MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/LARGEPRINT/GreatBookOfWorldGames_interior_largeprint.pre-companion.pdf` and is never deleted.

## In KDP

1. Bookshelf → **The Great Book of World Games** → large_print → *Edit print manuscript*.
2. Upload the interior above.
3. **The cover has NOT been rebuilt, and the interior must not be uploaded without it.** the block moved 232 → 233 pp, so the wrap needs a new spine, but this project's covers.py takes the page count from 06_REPORTS/interior-largeprint.json, which has recorded 234 pages since before this phase while the built block was 232. Only re-running 04_BUILD/interior.py regenerates that report and its pagemap. Do it at the first revision after this edition leaves KDP review, then run covers.py.
4. Open the previewer and confirm page 233 shows the code and the address, and that the spine text still sits inside its safe zone.

## How this file was checked

- PASS · **page-count** — 233 pages (expected 233)
- PASS · **printed-url** — valicepress.com/companion/world-games
- PASS · **canonical-host** — no forbidden host on the page
- PASS · **eyebrow** — CONTINUE WITH VÂLIÇE PRESS
- PASS · **fonts-embedded** — 3 faces: AAAAAA+LiberationSerif-Bold, AAAAAA+LiberationSerif-Italic, AAAAAA+LiberationSerif
- PASS · **pdf-metadata** — title="The Great Book of World Games: 56 Games from 4,600 Years of Human Play — Rules, Boards and Stories from 39 Cultures, Ready to Play Tonight" author="Emre Doğan"

Regenerate with `node scripts/factory/build-companion-pages.mjs --commit --slug the-great-book-of-world-games`.
