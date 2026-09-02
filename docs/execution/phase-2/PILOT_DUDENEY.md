# Pilot 2 — The Puzzles of Henry Dudeney (Valice Classics 2)

**Status: RIGHTS-CLEAR IN THE FILES · BUILT END TO END · staged for direct sale · founder Gates 2/8/12 pending · Paddle price and catalogue load blocked by the permission layer** (2026-09-02)

## Objective
Prove the public-domain engine: source → parse → editorial edition → PDF/EPUB/cover → direct ebook product → companion, in one phase, with real differentiation and no fabricated facts.

## Product
144-page 6 × 9 annotated edition: 110 puzzles selected from 544 (Amusements in Mathematics 1917, The Canterbury Puzzles 1907), seven parts, Dudeney's statements and solutions verbatim with the 97 original figures, plus a ~2,000-word introduction, seven part introductions, an original hint and a difficulty mark for every puzzle, editor's notes on the famous problems, a glossary of pre-decimal money and measures, a chronology, a source note and a concordance. Measured: 25,014 words, **27.9 % editorial** (series bible minimum 20 %). Project `MY-DİGİTAL-BOOK/THE-PUZZLES-OF-HENRY-DUDENEY`.

## Production
| Step | Result |
|---|---|
| Sources | PG #16713 and #27635 (HTML + images) — 430 + 114 puzzles parsed with 429 + 114 matched solutions (AM-163 "The Paper Box" has no solution in the source, recorded as such); 590 images copied; 4 title-format quirks fixed. `QA/parse-report.json`. |
| Selection + apparatus | `CONTENT/selection.json`, `edition-main.json`, `apparatus.json` — written after reading every selected puzzle and solution. |
| Typesetting | `BUILD/build_interior.py` (ReportLab, Liberation Serif embedded, KDP gutter table + 0.05 in, TOC with real page numbers, even page count). Two KDP-fatal defects found and fixed by the preflight: an unembedded Helvetica from the canvas base font, then one from the TOC's internal table. `scripts/factory/preflight.py`: fonts embedded (4), 144 pp, 6.000 × 9.000 in — ok. |
| EPUB | `BUILD/build_epub.py` — reflowable EPUB 3, 18 documents, 97 images, cross-links puzzle ↔ hint ↔ solution; **epubcheck 0 fatals / 0 errors / 0 warnings** (after an id-collision fix). |
| Cover | `BUILD/build_cover.py` — typographic emerald/paper front (1600 × 2560 JPEG) and full-wrap paperback cover (12.574 × 9.25 in, spine 0.3243 in). No image model. |
| Digital edition | `scripts/catalog/build-digital-editions.mjs` → 2.10 MB PDF; **uploaded** to R2 key `books/the-puzzles-of-henry-dudeney/master/v1/master.pdf` in `bookstore-masters-dev` (the bucket the local env names — the Phase 0 check that found the five existing masters used the same bucket; the docs name `bookstore-masters-prod`, where none of the six masters exist — Founder to confirm which bucket production's sensitive `R2_BUCKET_MASTERS` points at). |
| Previews | pages 29–30 (the Haberdasher's puzzle and two more, no solutions) rendered to `public/images/previews/the-puzzles-of-henry-dudeney/`. Storefront cover `public/images/books/the-puzzles-of-henry-dudeney.webp`. |
| Paddle | `paddle-products.mjs` carries the product at **$9.99**; dry run: "WOULD CREATE" and no other change. **The commit run was blocked by the tool-permission layer** — no Paddle object exists yet (FOUNDER_ACTIONS R2). |
| Catalogue | entry added as `draft`, ebook `coming_soon`, paperback `coming_soon` $14.99; Meditations set to Valice Classics 1; author Henry E. Dudeney with a MacTutor-sourced bio. **Production load blocked** (FOUNDER_ACTIONS R2). |
| Factory | gates 3, 4, 6, 9 passed with evidence; 1 (no Amazon sample taken), 2, 5, 7, 8, 10, 11, 12 open; state RESEARCH. |

## Rights
Work public domain (author d. 1930; US publication 1907/1917; PG "Public domain in the USA"); apparatus original; ledger RL-0024–RL-0026 **YELLOW pending the Founder's signature**; `RIGHTS.md` prepared. KDP differentiation: *annotated*. Claims for the introduction and chronology in `CLAIMS.jsonl` (17 entries; **C-014 UNVERIFIED** — the 2014 Frame–Stewart proof — Founder confirms or three sentences are cut).

## Pricing
Direct $9.99 (nets $8.99); paperback $14.99 (prints $2.73, nets $6.27); no Kindle at launch (35 % PD cap, free texts on Kindle). Founder decides at Gate 8.

## Website / customer product
When published the buyer gets the watermarked PDF (fulfillment worker, R2 master) and can read online; the EPUB is built but the library delivers the PDF today — the EPUB is not yet wired into fulfillment (a Phase 3 item; nothing on the page claims it until then). Companion `/companion/dudeney` (LIVE after this deploy): twelve puzzle sheets (13 pp) and the hints booklet (7 pp), no solutions; source `dudeney-companion`.

## Funnel
Amazon paperback (future) → printed companion URL → hints/sheets → email → Codex Enigmatica / Meditations cross-sell. The imprint and the back matter carry the companion address.

## Ads
None planned at launch (no account; direct-first title).

## Results (actual)
No sales: not on sale. No fabricated numbers.

## Blockers
Founder Gates 2, 8, 12; Paddle provisioning and catalogue load (permission); C-014; Amazon market sample (Gate 1) before any print upload; R2 bucket confirmation.

## Time
Agent wall-clock: ≈ 4 h 40 min (parsing 25 min, editorial selection and reading 45 min, apparatus and front/back matter 70 min, typesetting + fixes 50 min, EPUB/cover/companion 45 min, catalogue/ops 25 min). Founder: 0.

## Next decision
Founder: sign Gate 2, confirm prices, decide the AI declaration, run (or permit) the Paddle and catalogue commands, say "publish". Then measure the first direct sale.
