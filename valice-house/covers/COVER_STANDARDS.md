# Cover Standards

**Status:** ACTIVE · v1 (2026-09-02) · **Gate:** 7 (R7 prepares, Founder approves) · **Read by:** `scripts/factory/cover-check.mjs`, `scripts/covers/ingest-covers.mjs`

## 1. Series identity

| Series | Ground / palette | Typography | Imagery | Idiom |
|---|---|---|---|---|
| Codex | dark navy/black, cream, gold accent | serif display, small caps | one central engraved plate inside a thin frame | engraved grimoire; "reference but enchanted" |
| The Great Book of… | cream + one saturated colour per volume | rounded serif | one hero scene with a map feeling | warm, illustrated, not cheap |
| Field Book | brown + red seal | slab/mono mix | badges, seals, map fragments | field notebook |
| Valice Script | white + one colour per script (Hangul cobalt, Greek terracotta, Cyrillic red, Kana indigo) | geometric sans | one large letter/syllable with numbered stroke arrows | clean, pedagogical |
| Valice Classics | emerald/black | Noto Serif Display | typographic + one fine engraved device | classic, restrained (Meditations pattern) |

## 2. Rules that apply to every cover

1. **Title ≥ 25 % of cover height and legible at 150 px** (Amazon thumbnail). Check the 150 px render before Gate 7.
2. **All lettering is set in type, never rendered inside the image** (Hangul K34: the letter is not taken from the artwork; image models mis-render text).
3. **No QR code, URL or form on any cover** (KDP disallows it on covers; the companion address lives on the last leaf).
4. **No text in A+ module images** — a module with lettering means the wrong file was uploaded (Games checklist).
5. Cover placement is **measured from the artwork** (the quietest bands by standard deviation), not fixed fractions (Hangul K40; Games cover: title band σ 12.8).
6. Series volumes share the plate idiom, frame and type; a new series needs a Founder-approved identity before its first cover.
7. **AI-generated cover art is "AI-generated" content and is disclosed at KDP upload** [V, KDP G200672390]. Record the answer in `project_config.json → founder.aiDisclosure`. The US Copyright Office does not register purely AI-generated images [A — 2025 report; re-check]: the brand is defended by type, frame and series identity, not by the picture.
8. Artwork native resolution is recorded honestly: Mythologica 112 PPI, Bestiarium 103–116 PPI, Hangul ~83 PPI were **accepted by the Founder and written down**; a new cover targets ≥ 300 PPI at print size and never claims a resolution the file does not have.

## 3. File slots and specifications

| Slot | Path | Spec |
|---|---|---|
| Front (source) | `assets/<slug>/cover/front-v<n>.png` | PNG, sRGB, **≥ 2400 × 3600 px**, ratio 1:1.5 ± 5 %; no embedded text |
| Paperback wrap | `assets/<slug>/cover/paperback-wrap-v<n>.pdf` | single PDF, 300 DPI, CMYK recommended, ≤ 40 MB, bleed 0.125 in on all sides, text ≥ 0.125 in inside trim, barcode corner (lower right of back) empty |
| Hardcover wrap | `assets/<slug>/cover/hardcover-wrap-v<n>.pdf` | as paperback but geometry **read from the KDP Cover Calculator for the hardcover page count and paper** (Games: 18.624 × 12.417 in, spine 0.549 in for 160 pp) — never derived |
| Kindle | `assets/<slug>/cover/kindle-v<n>.jpg` | 1600 × 2560 px, JPEG, ≤ 50 MB |
| Storefront | `public/images/books/<slug>.webp` | derived by `ingest-covers.mjs`, height 1600, quality 82, ≤ 400 KB |
| A+ modules | `assets/<slug>/aplus/module-0<n>.png` | 970 × 300 (header) / 970 × 600; no text |

Versions are never overwritten; bump `v<n>`. The ingest script takes the highest version.

## 4. Spine and wrap arithmetic [V, KDP G201953020]

| Paper / ink | Spine width per page |
|---|---|
| white, B&W or standard colour | 0.002252 in |
| cream, B&W | 0.0025 in |
| premium colour | 0.002347 in |

Spine text needs ≥ 79 pages. Wrap width = bleed + back + spine + front + bleed. **Paper must match the calculator run**: Enigmatica's hardcover was calculated on white; 274 pp cream would be 0.8737 in vs 0.8058 in white — a 0.068 in error, outside KDP's ±0.0625 in tolerance.

## 5. The recorded cover defects (never repeat)

| Defect | Book | Rule |
|---|---|---|
| White-paper wrap variants had the gold spine band overflow by 1.10 mm (pb) / 0.41 mm (hc) | Bestiarium | one wrap per paper stock; the band is measured against the spine of that stock |
| Safe area measured from the trim (0.375 in) instead of the outer edge (0.716 in required) | Enigmatica | safe area is measured from the **outer** edge of the wrap |
| Measurement and drawing lived in two places; the PDF still overflowed after the "measured, clean" report | Enigmatica | the drawing reads the measured layout record; one placement, one source |
| Hardcover cover computed the spine from the **paperback** page count (0.8058 vs 0.8103 in) | Enigmatica | each edition's cover reads its own page count |
| Fabricated stroke numbers on the cover | Hangul ART-001 | no invented diagram detail anywhere, cover included; fixed by pixel-count-proven erasure (K44) |
| Cover art at 83–116 PPI upscaled to 300 DPI canvas | Hangul, Bestiarium, Mythologica | record native PPI; a new title targets ≥ 300 PPI; interpolation is disclosed in the report |

## 6. Gate 7 checklist (Founder)

- [ ] 150 px thumbnail: title readable, series recognisable
- [ ] type set in the layout, none in the raster
- [ ] no QR/URL/form on the cover
- [ ] spine width matches the edition's page count and paper (calculator screenshot in `DESIGN/`)
- [ ] barcode corner empty
- [ ] native art PPI recorded; AI disclosure answer recorded
- [ ] `QA/cover-check.json` clean for every slot
