# Seneca: Selected Dialogues — paperback — KDP upload package

**Generated:** 2026-09-08 · **ASIN:** — (not listed) · **KDP state:** not_created

## What this is

This edition has never been uploaded. The file below is its first. A dedicated companion page stands on page **156**: a QR occupying 29 % of the usable page height, the address `valicepress.com/companion/seneca` printed beneath it in display type, and a named list of what is waiting there. It is a new leaf; nothing was removed.

- **Pages:** **156**
- **Spine:** **0.3513 in** (white paper, 6×9 in)
- **Wrap width:** **12.6013 in**
- **Cover:** FIRST UPLOAD — there is no cover at KDP yet; upload the wrap built for this page count alongside the interior
- **Proof:** recommended — the block changed thickness, so the wrap is new and unproved

## The file

```
/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pdf
sha256 b504a558646f4cbdeb302595662427d30730509004ef3462ea53af3c54c3d3db
577,932 bytes · 156 pages
```

The build it replaces is kept at `/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pre-companion.pdf` and is never deleted.

## In KDP

1. KDP → **Create** → **Paperback**. This book is not on the bookshelf; there is nothing to edit.
2. Upload the interior above, and the cover built for **156 pages** — see the book's own `OUTPUT/KDP/KDP_UPLOAD_GUIDE.html` for the trim, paper and bleed settings, which must match or the file is rejected.
3. **Do not use Cover Creator.** The wrap was computed for this page count; Cover Creator regenerates it and the spine moves.
4. Open the previewer and confirm page 156 shows the code and the address. Scan the code with a phone before you publish — it cannot be changed once it is printed.

## How this file was checked

- PASS · **page-count** — 156 pages (expected 156)
- PASS · **printed-url** — valicepress.com/companion/seneca
- PASS · **canonical-host** — no forbidden host on the page
- PASS · **no-email-wall** — the page asks for nothing
- PASS · **headline** — headline present
- PASS · **eyebrow** — CONTINUE WITH VALICE PRESS
- PASS · **fonts-embedded** — 3 faces: AAAAAA+LiberationSerif-Bold, AAAAAA+LiberationSerif-Italic, AAAAAA+LiberationSerif
- PASS · **qr-floor** — 28.7% of usable height
- PASS · **qr-module-size** — 1.95 mm per module
- PASS · **pdf-metadata** — title="Seneca: Selected Dialogues: Five Dialogues Complete in Aubrey Stewart's Translation, Annotated — with an Argument Map of All 79 Chapters, a Glossary, a Biographical Index and a Chronology" author="Seneca · translated by Aubrey Stewart · edited and annotated by Emre Doğan"
- PASS · **qr-matches-url** — 29×29 modules read off the printed page at 300 dpi and matched the code for https://valicepress.com/companion/seneca

Regenerate with `node scripts/factory/build-companion-pages.mjs --commit --slug seneca-selected-dialogues`.
