# Seneca: Selected Dialogues — paperback — KDP upload package

**Generated:** 2026-09-04 · **ASIN:** — (not listed) · **KDP state:** not_created

## What this is

This edition has never been uploaded. The file below is its first. A dedicated companion page stands on page **154**: a QR occupying 29 % of the usable page height, the address `valicepress.com/companion/seneca` printed beneath it in display type, and a named list of what is waiting there. It is a new leaf; nothing was removed.

- **Pages:** **154**
- **Spine:** **0.3468 in** (white paper, 6×9 in)
- **Wrap width:** **12.5968 in**
- **Cover:** FIRST UPLOAD — there is no cover at KDP yet; upload the wrap built for this page count alongside the interior
- **Proof:** recommended — the block changed thickness, so the wrap is new and unproved

## The file

```
/home/emre/Downloads/MY-DİGİTAL-BOOK/SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pdf
sha256 f06fea37a5d083f0a0ea7f89240b42dc8f38c870a85bc3c23f5aee24ea93fa8d
575,959 bytes · 154 pages
```

The build it replaces is kept at `/home/emre/Downloads/MY-DİGİTAL-BOOK/SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pre-companion.pdf` and is never deleted.

## In KDP

1. KDP → **Create** → **Paperback**. This book is not on the bookshelf; there is nothing to edit.
2. Upload the interior above, and the cover built for **154 pages** — see the book's own `OUTPUT/KDP/KDP_UPLOAD_GUIDE.html` for the trim, paper and bleed settings, which must match or the file is rejected.
3. **Do not use Cover Creator.** The wrap was computed for this page count; Cover Creator regenerates it and the spine moves.
4. Open the previewer and confirm page 154 shows the code and the address. Scan the code with a phone before you publish — it cannot be changed once it is printed.

## How this file was checked

- PASS · **page-count** — 154 pages (expected 154)
- PASS · **printed-url** — valicepress.com/companion/seneca
- PASS · **canonical-host** — no forbidden host on the page
- PASS · **eyebrow** — CONTINUE WITH VALICE PRESS
- PASS · **fonts-embedded** — 3 faces: AAAAAA+LiberationSerif-Bold, AAAAAA+LiberationSerif-Italic, AAAAAA+LiberationSerif
- PASS · **pdf-metadata** — title="Seneca: Selected Dialogues: Five Dialogues Complete in Aubrey Stewart's Translation, Annotated — with an Argument Map of All 79 Chapters, a Glossary, a Biographical Index and a Chronology" author="Emre Doğan"

Regenerate with `node scripts/factory/build-companion-pages.mjs --commit --slug seneca-selected-dialogues`.
