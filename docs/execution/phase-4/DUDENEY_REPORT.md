# The Puzzles of Henry Dudeney — Phase 4

**On sale.** The first Valice Classic, the first book to pass all twelve gates with recorded evidence, and the first product in the catalogue that delivers two files from one purchase.

---

## The gates

| # | Gate | State | Evidence |
|---|---|---|---|
| 1 | Market fit | passed (Phase 3) | 12-row live Amazon sample, three queries |
| 2 | Rights | **passed 2026-09-02, founder** | RIGHTS.md, ledger RL-0024–26 now GREEN |
| 3 | Originality | passed | parse report, selection |
| 4 | Content quality | passed | edition-main.json, QA |
| 5 | Factual verification | **passed 2026-09-02, founder** | CLAIMS.jsonl clean, 18 claims, F-2026-0009 |
| 6 | Editorial | passed | apparatus.json, epub QA |
| 7 | Cover | **passed 2026-09-02** | preflight clean; the `anonymous` author defect fixed in Phase 3 |
| 8 | Interior / price | **passed 2026-09-02, founder** | 144 pp, 6 × 9, fonts embedded; $9.99 / $14.99 confirmed |
| 9 | Metadata | passed | author bio now present; "(Annotated)" added |
| 10 | KDP compliance | **passed, scoped** | direct sale only — see the AI declaration below |
| 11 | Website product QA | **passed** | page 200, panel renders, both artifacts proven |
| 12 | Publication approval | **passed 2026-09-02, founder** | "Yayınla" |

---

## What a buyer gets

Verified in production today against the real masters, not against a fixture:

```
master 2.20 MB → pdf-lib stamps every page      442 ms → signed URL 200 → byte-identical PDF
epub   1.41 MB → licence leaf + dc:rights       330 ms → signed URL 200 → byte-identical EPUB
                                                          starts PK, first entry `mimetype`
```

- **A watermarked PDF** of the 144-page print interior.
- **A reflowable EPUB**, epubcheck-clean before and after stamping.
- The online reader, a permanent library, unlimited re-download.
- The free companion: twelve puzzle sheets and a hints booklet, no email.

Each copy carries one quiet line naming the reader it was sold to. That is the whole of the copy protection.

---

## The page leads with the right thing

§3 asked that the page not open with "the source is public domain". It does not — the phrase appears **zero times** in the rendered page. What it opens with is the apparatus: a hint for every puzzle, a difficulty mark on every one, pounds shillings and pence explained, the concordance back to the original numbering, 110 chosen from 544.

That is not presentation. It is the entire commercial argument. The strongest thing in the Gate 1 market sample was *Amusements in Mathematics*, **free on Kindle, 621 reviews, BSR #193 in Mathematics** — the same text, at zero. Selling "110 Dudeney puzzles" at $9.99 against a free 544 is a losing sentence. Selling the help around them is not.

---

## Two things fixed on the way through, both by a lint refusing to pass

**"(Annotated)" is now in the listing title.** `compliance-lint` enforces the KDP rule that a differentiated public-domain edition carries its tag, and the check was failing. It is also the single strongest word available: no competing Dudeney edition in the sample carries any annotation at all. The printed title page is unchanged — the tag belongs to the shelf, not to the page.

**The author biography.** `metadata-lint` blocks Gate 9 on a null `authorBio`. Fixing it for Dudeney meant fixing it everywhere, which turned up an invented one-liner in three other projects — see `KDP_VALICE_LINKAGE_REPORT.md`.

---

## The AI declaration, recorded honestly

The Founder declared "Yapay zeka kullanılmadı", and it is preserved verbatim.

It is **right** for images — the cover is typographic geometry drawn by `build_cover.py`, and the project's cost ledger records $0 of image generation — and right for translation, of which there is none.

For **text** it conflicts with what this repository records. The apparatus is 28.1% of the words and was drafted by the agent in the Phase 2 session. Amazon's rule, re-read on 2026-09-02, requires disclosure of "AI-generated" text — text an AI tool created from your prompts — and does not require it for "AI-assisted" text, meaning text you wrote with AI help for brainstorming, outlining, editing or grammar. On that definition the apparatus is AI-generated, and undisclosed AI-generated content can block a title or suspend an account.

So `compliance.aiDisclosure.text` records `generated`, with `founderWording` preserved beside it and the conflict written out in `textConflict`. **The direct ebook is unaffected — it makes no declaration to anyone.** It must be settled before any KDP upload, and it is handbook item F1.

---

## The paperback, not yet

Built, preflight-clean, 144 pages at 6 × 9, $14.99 confirmed, and never uploaded. It needs two things first: a physical proof copy (Gate 8's other half, and a physical object nobody can delegate) and the AI declaration above.

**No hardcover.** Printing is $7.38 against a $12.30 KDP minimum, and no price in the band clears the 35% margin target — $26.99 reaches 32.7%. A 144-page case-bound book is also thin at $27, and no hardcover Dudeney appears anywhere in the market sample. The arithmetic refuses it; this is not a judgement call.

**Large print deferred.** Best per-unit economics of the three formats, but the large-print buyers the sample surfaced are word-search readers, not arithmetic-puzzle readers, and it would compete with the paperback for the same reader. Revisit after 30 days of paperback data.
