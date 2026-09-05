# null — paperback — KDP upload package

**Generated:** 2026-09-05 · **ASIN:** — (not listed) · **KDP state:** unknown

## What changed

A dedicated companion page now stands on page **120**: a QR occupying 29 % of the usable page height, the address `valicepress.com/companion/chess-and-playing-cards` printed beneath it in display type, and a named list of what is waiting there. It is a new leaf; nothing was removed.

- **Pages:** 119 → **120**
- **Spine:** 0.2680 in → **0.2702 in** (white paper, 6×9 in)
- **Wrap width:** 12.5180 in → **12.5202 in**
- **Cover:** REBUILD CORRECT — inside tolerance, but the printed spine no longer matches the block
- **Proof:** recommended — the block changed thickness, so the wrap is new and unproved

## The file

```
/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/03-CHESS-AND-PLAYING-CARDS/OUTPUT/interior-main.pdf
sha256 214e6bb865a0476c5b2076385e32c69ddf285e19213cba7d050e7d10d247b470
849,305 bytes · 120 pages
```

The build it replaces is kept at `/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/03-CHESS-AND-PLAYING-CARDS/OUTPUT/interior-main.pre-companion.pdf` and is never deleted.

## In KDP

1. Bookshelf → **null** → paperback → *Edit print manuscript*.
2. Upload the interior above.
3. The spine changed and no rebuilt wrap is recorded for this edition — do not upload the interior until one exists.
4. Open the previewer and confirm page 120 shows the code and the address, and that the spine text still sits inside its safe zone.

## How this file was checked

- PASS · **page-count** — 120 pages (expected 120)
- PASS · **printed-url** — valicepress.com/companion/chess-and-playing-cards
- PASS · **canonical-host** — no forbidden host on the page
- PASS · **no-email-wall** — the page asks for nothing
- PASS · **headline** — headline present
- PASS · **eyebrow** — CONTINUE WITH VALICE PRESS
- PASS · **fonts-embedded** — 3 faces: AAAAAA+LiberationSerif-Bold, AAAAAA+LiberationSerif-Italic, AAAAAA+LiberationSerif
- PASS · **qr-floor** — 28.9% of usable height
- PASS · **qr-module-size** — 1.73 mm per module
- PASS · **pdf-metadata** — title="Chess and Playing Cards (Annotated)" author="Emre Doğan"
- PASS · **qr-matches-url** — 33×33 modules read off the printed page at 300 dpi and matched the code for https://valicepress.com/companion/chess-and-playing-cards

Regenerate with `node scripts/factory/build-companion-pages.mjs --commit --slug chess-and-playing-cards`.
