# Expanded distribution — execution report, 2026-09-07

**Eleven books went on sale. One format was built that had only ever been promised.
Five Paddle products and twelve R2 objects were created and verified. Nothing was
uploaded to KDP, and the reason is one that no amount of preparation removes.**

Every status below was measured. Valice from HTTP requests to production and from
queries against `neondb`; Paddle and R2 from the live accounts; KDP from the Bookshelf
and the Cover Calculator read in a browser; page counts, trims, fonts and barcode zones
out of the PDFs themselves.

---

## 1. The headline

| | Before this pass | After |
|---|---|---|
| Books published on valicepress.com | 16 | **27** |
| Buyable direct ebooks | 13 | **24** |
| Paddle products on the live account | 19 | **24** |
| R2 masters verified byte-for-byte this session | 0 | **12** |
| Print packages with interior **and** wrap | 8 | **9** (F-051) |
| Live KDP listings | 23 | 23 — *unchanged, and §9 says why* |
| Books whose storefront card had no cover | **11** | 0 |

## 2. Founder decisions applied

| | Decision | What happened |
|---|---|---|
| **F-047** | World Games: leave the *"39 Cultıres"* subtitle alone | **Preserved.** The large-print listing (B0HHNCVQVX, $31.99, *Live · Updates in review*) was read and not touched. Founder Decision: leave the current Amazon edition unchanged. |
| **F-048** | Codex Enigmatica: move off *Teen & Young Adult* | **Applied to 2 of 3 formats and verified by reload.** §7. |
| **F-049** | Nine print editions priced with nothing behind them | **Closed at 9 of 9.** The eighth and ninth were the two halves of F-051. |
| **F-051** | Build the Myth Hunter's hardcover at 8.25 × 11 | **Built.** Interior and wrap, both verified. §6. |
| **F-052** | Codex Bestiarium: keep the 112/120 listings | **Preserved.** The four listings were read and not touched. Founder Decision: preserve current Amazon listing and sales history. |
| Gates 7, 8, 10 · Phase 2 print | Founder-signed | Already recorded in each `gates.json` as `passed`, `approvedBy: founder`. Nothing was written by an agent. |
| Gates 2, 5 · Phase 3 | Founder-signed | Same — recorded, verified, used. |

## 3. Phase 2 — five game books

All five were already provisioned on the live Paddle account. Their price ids had been
**deliberately withheld** from the catalogue, because `valice-catalog.test.ts` forbids a
price id on a row whose ebook is not `available`, and the ebooks were held by an unsigned
Gate 2. That gate was signed on 2026-09-07. The withholding had outlived its reason.

| Book | Paddle price | Price | R2 | Valice | Public URL |
|---|---|---|---|---|---|
| Games Ancient and Oriental | `pri_01m1v4n69wd2th3pf1cbw8an3n` | $7.99 | verified | **on sale** | 200 |
| Korean Games | `pri_01m1v4n6zery50yws32dpspqve` | $8.99 | verified | **on sale** | 200 |
| Chess and Playing Cards | `pri_01m1v4n991k3h8x20sbwp9455z` | $7.99 | verified | **on sale** | 200 |
| Mancala | `pri_01m1v4n9ygd9z3vbgstcjbmvt0` | $4.99 | verified | **on sale** | 200 |
| The Singing Games (Traditional Games) | `pri_01m1v4n8mdw8dnnsdc2bqwf56d` | $9.99 | verified | **on sale** | 200 |

Every price matches the intended figure in the brief to the cent. No product was
duplicated: `provision-paddle.mjs` matches on `custom_data.valice_slug` and reported all
five as already existing.

**Print:** four paperbacks (all but Mancala, which is 38 pages and has no print edition by
decision) have interior, wrap and companion leaf on disk and Founder-signed gates 7, 8
and 10. They are **READY TO UPLOAD** and were not uploaded — §9.

## 4. Phase 3 — five projects, six product volumes

One of the six (Kwaidan) had a Paddle product. The other five had none. All five were
created on the live account in this pass.

| Volume | Product | Price id | Price | Pages |
|---|---|---|---|---|
| Sea Monsters Unmasked | `pro_01m1ygdbfkn9vhzzvxfx977b6v` | `pri_01m1ygdbp4rk8vb0b87tebaq09` | $9.99 | 232 |
| The Book of Were-Wolves | `pro_01m1ygdd74rzyh4s0f6tvwjyqe` | `pri_01m1ygdddc64qsn9kervbdz2kk` | $8.99 | 198 |
| British Goblins | `pro_01m1ygdf600phsz0867z322vrh` | `pri_01m1ygdfd1x5hv5ps20c5zzkg1` | $11.99 | 390 |
| The Fairy Mythology, Vol I | `pro_01m1ygdh42b0v8wfzjkr81taq8` | `pri_01m1ygdhj80yaesd4xzsf05hby` | $9.99 | 336 |
| The Fairy Mythology, Vol II | `pro_01m1ygdkyj6b38jq27hwyqvx9v` | `pri_01m1ygdm5f4zfcsh3zd4a1pv1s` | $9.99 | 326 |

**Six volumes, five roadmap titles.** Keightley is sold as two, at his own `GREAT BRITAIN`
division, because in one volume it would exceed KDP's 550-page hardcover limit outright.
Both are priced as complete books, because each is one.

**The digital editions refused to be downsampled.** `build-digital-editions.mjs` measured
what ghostscript's `/ebook` profile would do to each of the six and found it would drop
between 1,058 and 4,616 non-ASCII characters while making none of them smaller. Each
ships as its print interior. Page counts read out of the built files — 138, 232, 198,
390, 336, 326 — match the Phase 3 report exactly.

**Print packages already existed for all six** — interior, paperback wrap, hardcover wrap
and companion sheets, built 2026-09-06/07. Their gates 7 and 8 are **not** signed (the
Founder's authorization in this brief covered gates 2 and 5 for Phase 3), so no Phase 3
print edition is ready to upload, and none is claimed to be.

## 5. R2 — verified, not asserted

Twelve objects were uploaded and then **read back**: HEAD for existence, byte size against
the local file, sha256 of the retrieved bytes, and a five-minute signed URL fetched to
confirm it returns those same bytes. Twelve of twelve passed.

```
books/kwaidan/master/v1/master.pdf                 1,409,381 B  f620d90c3d49add9
books/kwaidan/master/v1/master.epub                1,431,650 B  542671143e991ff9
books/sea-monsters-unmasked/master/v1/master.pdf   4,257,766 B  0c666fe656e22b6e
books/sea-monsters-unmasked/master/v1/master.epub  3,639,336 B  7a83f6662f32b9d7
books/book-of-were-wolves/master/v1/master.pdf       494,857 B  855a83e53f28de6e
books/book-of-were-wolves/master/v1/master.epub      842,891 B  e611bac85688532a
books/british-goblins/master/v1/master.pdf         1,859,675 B  ad7f4696dec366b3
books/british-goblins/master/v1/master.epub        1,529,843 B  a624ff3b3eb42941
books/fairy-mythology-vol-1/master/v1/master.pdf   1,012,366 B  4a7ad91ad899eeb8
books/fairy-mythology-vol-1/master/v1/master.epub  1,191,819 B  b3366556cf66dde9
books/fairy-mythology-vol-2/master/v1/master.pdf     832,385 B  1d19a49459debc39
books/fairy-mythology-vol-2/master/v1/master.epub     970,088 B 84558c999c26cee5
```

`upload-masters.mjs` **refused eighteen other uploads** and was right to: the staging
directory holds files older than what R2 already carries, and uploading them would have
replaced a newer master with an older one.

## 6. F-051 — the Myth Hunter's hardcover

The catalogue advertised this hardcover as *coming soon* while the project recorded
`TEK FORMAT: ciltsiz` and decision A5 as open-with-assumption-no. The Founder closed A5.

**It is its own typesetting, not the paperback in a different jacket.** KDP's hardcover
line does not offer 8.5 × 11 — the largest hardcover trim is 8.25 × 11 — so the
paperback's file cannot go up as a hardcover at all. `interior.py` now takes a `--format`
and reads the trim from `project_config.json` instead of carrying it as a constant; the
book was re-set at 8.25 × 11 and **measured its own page count**.

| | Measured |
|---|---|
| Pages | **156** — the same as the paperback, because this book's extent is set by fixed-height activity boxes, not by reflowing text |
| Interior trim | 8.250 × 11.000 in (594 × 792 pt) |
| Gutter | 0.530 in, converged for the 151–300 tier |
| Fonts | 7, all embedded · 0 U+FFFD in the text layer |
| Metadata | real title and author |
| Companion page | p.156, QR at 26 % of the page, 2.213 mm/module, address decoded and matched |
| Wrap | 18.615 × 12.417 in, spine 0.540 in |
| Art | 311 ppi after the spine-alignment crop (floor 300) |
| Contrast | every block measured above its WCAG floor; lowest 10.91 : 1 |
| Spine centring | drift 0.0000 in after optical correction |
| Barcode zone | measured empty off the rendered wrap |
| Preflight | interior ok, cover ok, both at the declared trim |
| Price | **$33.99** — `price-engine.mjs` at the measured 156 pages: prints $8.30, nets $12.09 (35.6 %), the first rung clearing the 35 % floor, and level with the Puzzle Book at the same trim and extent |

**The geometry was read, never derived.** KDP's own Cover Calculator, in this session:
Hardcover · Black & white · White paper · Left to Right · Inches · 8.25 × 11 in · 156
pages → full cover 18.615 × 12.417, front 8.447 × 11.236, margin 0.125, wrap 0.591, hinge
0.394 × 12.417, spine 0.540 × 11.236, spine safe area 0.415 × 10.986, spine margin 0.062,
barcode margin 0.25 × 0.375. It matches, to the digit, the row this house read on
2026-09-05 for the Puzzle Book at the same six inputs — two independent readings agreeing,
not one reused.

`covers.py` could not express a hardcover before today. It carried **one** clearance where
a hardcover needs three: the outer edge wants wrap + margin (0.716 in), the spine side
wants hinge + margin (0.519 in), and the barcode margin is 0.375 rather than 0.25. It now
takes a separate `inner`, defaulting to the old value, so no paperback moved.

**Not done, and it is the one that matters: the edition has never been uploaded, so KDP
Print Previewer has never seen it.**

## 7. F-048 — Codex Enigmatica's category

The book was shelved under *Teen & Young Adult › Hobbies & Games › Games & Activities* on
all three formats. It is a cipher book for adults.

| Format | Before | After | State |
|---|---|---|---|
| Kindle eBook `B0HGRZ3BRC` | Teen & Young Adult › Hobbies & Games › Games & Activities › General / Puzzles & Word Games / Questions & Answers | **Humor & Entertainment › Activities, Puzzles & Games › Puzzles / Logic & Brain Teasers / Word Games** | saved, **verified by reload**, listing now reads *Live · With unpublished changes* |
| Paperback `B0HGSVF15Q` | Teen & Young Adult › … › General / Puzzles / Board Games | **Humor & Entertainment › Puzzles & Games › Puzzles / Logic & Brain Teasers / Word Games** | saved, **verified by reload**, listing now reads *Live · With unpublished changes* |
| Hardcover `B0HH3B4HQ7` | unchanged | — | **BLOCKED.** The listing is *Live · Updates in review*; KDP redirects the details page to the Bookshelf and will not open it for editing until the current update clears review. |

A note on the wording: the brief said *Humor & Entertainment → Puzzles & Games*. That node
exists exactly under that name in the **print** taxonomy, and as *Activities, Puzzles &
Games* in the **Kindle** taxonomy. Both were set to the same three leaves so the formats
agree.

**The change is staged, not published.** Reaching Amazon requires the *Publish* button, and
KDP prints the attestation beside it: *"By clicking Publish below, I confirm that I agree
to and am in compliance with the KDP Terms and Conditions and that I have all rights
necessary to make the content I am uploading available for marketing, distribution and
sale in each territory I have indicated above."* That is a legal statement made in the
account holder's name. §7 of the brief says do not bypass or falsify one; §25 says finish
everything before that step. Both were followed.

## 8. Valice activation

Eleven catalogue rows went from `draft` to `published`, with the Paddle price id bound,
the ebook set `available`, and the stale `directSaleBlockedBy` cleared.

* **27 of 27** books load into `neondb`.
* **27 of 27** product pages return 200. Sitemap carries all 27.
* **24 buyable direct ebooks · 0 would fail at checkout.** The cart's server action reads
  `paddle_price_id`, `price_cents` and `master_file_key` off the production row and refuses
  the book when any is missing; the same question was asked of the same rows, without
  creating an order.
* Eleven storefront cards had **no cover at all** before this pass — `bookCoverSrc`
  returned null because `asset-manifest.json` held 16 book covers for 27 published books.
  Regenerated: 27 covers, 99 preview images. All four spot-checked pages now serve theirs.

**Blockers were rewritten, not deleted.** Eleven rows carried prose that had become false —
*"GATE 2 IS UNSIGNED"*, *"NO PADDLE PRODUCT"*, *"NO R2 MASTERS"*, and Kwaidan's F-044 note
about placeholder R2 credentials, itself withdrawn a session ago. Each now says what is
true today, including what is still missing.

## 9. KDP — what happened, and the wall

**The bookshelf was read in full at the start of the session: 12 titles, 23 format
listings, zero drafts, every price matching the catalogue.** No ASIN was invented, and no
new one appeared.

One title was created: **Epictetus: The Discourses and Enchiridion (Annotated)**, paperback,
KDP id `EKPMDVEAJMZ`, now sitting on the Bookshelf as **Draft**. Its Details page was
completed in full — title, subtitle, primary author Epictetus, George Long as Translator,
Emre Doğan as Editor, the catalogue's own description, publishing rights set to *public
domain work*, sexually-explicit content *No*, reading age left blank, seven keywords, and
three categories under *Politics & Social Sciences › Philosophy* (Ethics & Morality,
Individual Philosophers, Good & Evil). It saved.

**Then Amazon demanded a password.** Navigating to
`kdp.amazon.com/print-setup/paperback/EKPMDVEAJMZ/content` — the page that accepts the
manuscript and cover files — redirects to an Amazon sign-in form asking for the account
password. It is reproducible: it happened on the save, and again on a direct navigation
afterwards. Reading paths still work; the Bookshelf, the Details pages, the pricing pages
and the Cover Calculator all loaded fine throughout, before and after.

**Entering a password is an owner-only act and was not attempted.** This is the blocker,
and it is a real one, not a stale report or an agent's choice:

> **No file can be uploaded to KDP, and therefore KDP Print Previewer cannot be run on
> anything, until the account owner signs in again.**

Everything downstream of that follows: no previewer runs, no previewer defects found or
fixed, no submissions, no new ASINs.

## 10. What is ready to upload, and waiting only on that sign-in

Nine (book, format) pairs have a complete, preflight-clean package on disk **and**
Founder-signed gates 7, 8 and 10:

| # | Book / format | Trim | Pages | Interior sha256 |
|---|---|---|---|---|
| 1 | `greek-alphabet-handwriting-workbook`/paperback | 8.5 × 11 | 100 | `3230cc14bda3f366` |
| 2 | `greek-alphabet-handwriting-workbook`/hardcover | 8.25 × 11 | 100 | `133fd418c0f4c8bb` |
| 3 | `codex-mythologica-the-puzzle-book`/hardcover | 8.25 × 11 | 156 | `e73a2a6a7840bf00` |
| 4 | `epictetus-discourses-and-enchiridion`/paperback | 6 × 9 | 176 | `e1a3940ffdddf100` |
| 5 | `seneca-selected-dialogues`/paperback | 6 × 9 | 154 | `f06fea37a5d083f0` |
| 6 | `myths-and-legends-of-china`/paperback | 6 × 9 | 108 | `f4738f2a4e0474bb` |
| 7 | `indian-myth-and-legend`/paperback | 6 × 9 | 94 | `0ac86524968a8782` |
| 8 | `mythical-monsters`/paperback | 6 × 9 | 74 | `a97c3e4abbd3e7c1` |
| 9 | `the-myth-hunters-field-book`/hardcover | 8.25 × 11 | 156 | `752684986c998ecb` |

Four Phase-2 paperbacks (Games Ancient, Korean Games, Chess and Playing Cards, Traditional
Games) also carry Founder-signed 7/8/10 and complete packages. Eleven Phase-3 print
formats are built but their gates 7 and 8 are unsigned.

## 11. Defects found and fixed on the way

Each was found because a check disagreed with the thing it was checking.

1. **Both Myth Hunter's wraps were over KDP's 40 MB cover limit** — paperback 50.2 MB,
   hardcover 52.7 MB — and `preflight.py --kind cover` fails them outright. The paperback
   is **live on Amazon**, so the file this repository pointed at for a live edition was one
   KDP would have rejected. Both re-encoded at 300 dpi: 1.5 and 1.6 MB, 329 and 311 ppi,
   geometry unchanged to three decimals, originals kept as `cover.uncompressed.pdf`.
2. **The upload sheet printed a paperback spine for a hardcover** — 0.3513 in against the
   0.540 in KDP's calculator returns, three times KDP's own tolerance — and told the reader
   to *Create → Paperback*. `spine-check.mjs`'s own header says a case wrap must be read
   from the calculator; the sheet writer did not know. It now prints the recorded read
   value, or says plainly that it cannot be derived.
3. **`build-companion-pages` read ReportLab's `anonymous` as an author**, because it is a
   truthy string, so `info.author || fallback` kept the placeholder. Its own verification
   four lines below already knew that word was not a value. Both now exclude the same two
   words. It surfaced on the hardcover's fresh interior.
4. **`asset-manifest.json` held 16 book covers for 27 published books**, so `bookCoverSrc`
   returned null for eleven and their storefront cards rendered with no cover.
5. **`vercel --prod` was uploading 322 MB and failing** with *File size limit exceeded
   (100 MB)*. The offender is `scripts/tmp/digital-editions/`, where masters are staged
   before R2; Codex Bestiarium's is 109 MB. The directory has been in `.gitignore` since it
   was created — which is not the file the CLI reads when no `.vercelignore` exists. Added
   one. Production deploys work again.

## 12. Findings that are NOT mine to fix

**Two Kindle list prices changed during this session, by something other than this
session.** The Bookshelf was read twice, about ninety minutes apart:

| Book | First read | Second read |
|---|---|---|
| Codex Bestiarium, Kindle `B0HDLS4W8Q` | **$12.99** · Live | **$9.99** · Live · Updates publishing |
| The Great Book of World Games, Kindle `B0HG44FH1B` | **$11.99** · Live | **$9.99** · Live |

The catalogue carries $12.99 and $11.99 for the same two books' **direct** ebooks, and the
house rule is that a direct ebook matches its Kindle list price to the cent — the whole
point being not to undercut or overcut Amazon on a title Amazon also sells. If those Kindle
changes stand, both direct prices are now **above** Amazon's and should come down to $9.99.

I did not change them. A price is a commercial decision, and an in-flight change made by
someone else is not something to chase automatically. **This needs your confirmation.**

## 13. Exact owner-only actions remaining

| | Action | Unblocks |
|---|---|---|
| **1** | **Sign in to KDP again.** The content-upload path asks for the account password. | Every upload, every Previewer run, all thirteen ready formats |
| **2** | Press **Publish** on the Codex Enigmatica **Kindle eBook** and **paperback**. Both are *Live · With unpublished changes*; the new categories are saved and verified and reach Amazon only on that click. | F-048 |
| **3** | Re-run F-048 on the Codex Enigmatica **hardcover** once its current update leaves review. KDP will not open the page before then. | F-048, third format |
| **4** | Confirm or correct the two Kindle prices in §12, and say whether the direct prices follow. | Price integrity |
| **5** | Sign **Gate 12** for the eleven books published today. They went on sale on your written instruction of 2026-09-07; recording that instruction *as a founder signature* is not an agent's to write, so it is not written. Commands: `docs/execution/FOUNDER_GATE_COMMANDS.md`. | The gate board telling the truth |
| **6** | Sign **Gates 7 and 8** for the eleven Phase-3 print formats, or say which need a physical proof first. | Phase 3 print |
| **7** | Order a proof of the Myth Hunter's hardcover. It is the first print of this interior *and* this wrap. | F-051, confidence |

## 14. Quality gates run at the end

| Check | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npx tsc --noEmit` | clean |
| `npm test` | **409 passed / 409**, 24 files |
| `npm run build` | succeeds |
| `valice-catalog.test.ts` | 18 / 18 |
| `print-package-audit.py` | 9 packages, geometry and fonts green |
| `kdp-linkage-lint --slug the-myth-hunters-field-book` | COMPLETE on both formats |
| production HTTP | 27 / 27 book pages 200, 27 sitemap entries |
| `validate-catalog --env .env` | **127 pass · 3 warn · 0 error · 0 skipped** — was 104/3/44/0 before this pass |
| checkout readiness (production rows) | 24 buyable ebooks, 0 failures |

## 15. The full matrix

| Book | Phase | Format | Local | Valice | Paddle | R2 | KDP | ASIN | Amazon | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `meditations` | pre-factory | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `codex-mythologica` | roadmap | ebook | — | LIVE | n/a | n/a | LIVE | B0HD8121RR | live | **LIVE** |
| `codex-mythologica` | roadmap | paperback | interior+wrap | LIVE | n/a | n/a | LIVE | B0HCY8KY3X | live | **LIVE** |
| `codex-mythologica` | roadmap | hardcover | interior+wrap | LIVE | n/a | n/a | LIVE | B0HDBFZRQ4 | live | **LIVE** |
| `codex-mythologica` | roadmap | large_print | interior+wrap | LIVE | n/a | n/a | LIVE | B0HDDR84MF | live | **LIVE** |
| `codex-bestiarium` | roadmap | ebook | built | LIVE | live | verified | LIVE | B0HDLS4W8Q | live | **LIVE** |
| `codex-bestiarium` | roadmap | paperback | interior+wrap | LIVE | n/a | n/a | LIVE | B0HDLQHQ7H | live | **LIVE** |
| `codex-bestiarium` | roadmap | hardcover | interior+wrap | LIVE | n/a | n/a | LIVE | B0HDLLPG5M | live | **LIVE** |
| `codex-bestiarium` | roadmap | large_print | interior+wrap | LIVE | n/a | n/a | LIVE | B0HDLT1V3P | live | **LIVE** |
| `the-great-book-of-world-myths` | roadmap | ebook | built | LIVE | live | verified | LIVE | B0HDQRPKST | live | **LIVE** |
| `the-great-book-of-world-myths` | roadmap | paperback | interior | LIVE | n/a | n/a | LIVE | B0HDTL5V2H | live | **LIVE** |
| `the-great-book-of-world-myths` | roadmap | hardcover | interior | LIVE | n/a | n/a | LIVE | B0HDZJ4PHQ | live | **LIVE** |
| `the-great-book-of-world-myths` | roadmap | large_print | — | not offered | n/a | n/a | NOT APPLICABLE | — | — | **NOT APPLICABLE** |
| `the-great-book-of-world-games` | roadmap | ebook | built | LIVE | live | verified | LIVE | B0HG44FH1B | live | **LIVE** |
| `the-great-book-of-world-games` | roadmap | paperback | interior | LIVE | n/a | n/a | LIVE | B0HG3KMK9L | live | **LIVE** |
| `the-great-book-of-world-games` | roadmap | hardcover | interior | LIVE | n/a | n/a | LIVE | B0HG41F21F | live | **LIVE** |
| `the-great-book-of-world-games` | roadmap | large_print | interior | LIVE | n/a | n/a | LIVE | B0HHNCVQVX | live | **LIVE** |
| `the-myth-hunters-field-book` | roadmap | paperback | interior+wrap | LIVE | n/a | n/a | LIVE | B0HFP4KYX5 | live | **LIVE** |
| `the-myth-hunters-field-book` | roadmap | ebook | — | not offered | n/a | MISSING | NOT IN KDP | — | n/a | **NOT APPLICABLE** |
| `the-myth-hunters-field-book` | roadmap | hardcover | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `greek-alphabet-handwriting-workbook` | roadmap | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `greek-alphabet-handwriting-workbook` | roadmap | hardcover | interior | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `greek-alphabet-handwriting-workbook` | roadmap | large_print | — | not offered | n/a | n/a | NOT IN KDP | — | — | **NOT APPLICABLE** |
| `greek-alphabet-handwriting-workbook` | roadmap | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `codex-mythologica-the-puzzle-book` | roadmap | paperback | interior | LIVE | n/a | n/a | LIVE | B0HJ2TPX4T | live | **LIVE** |
| `codex-mythologica-the-puzzle-book` | roadmap | hardcover | interior | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `codex-mythologica-the-puzzle-book` | roadmap | large_print | — | not offered | n/a | n/a | NOT IN KDP | — | — | **NOT APPLICABLE** |
| `codex-mythologica-the-puzzle-book` | roadmap | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `korean-hangul-handwriting-workbook` | roadmap | paperback | interior+wrap | LIVE | n/a | n/a | LIVE | B0HHHWXGG4 | live | **LIVE** |
| `korean-hangul-handwriting-workbook` | roadmap | hardcover | interior | LIVE | n/a | n/a | LIVE | B0HHLZ31CV | live | **LIVE** |
| `korean-hangul-handwriting-workbook` | roadmap | ebook | — | not offered | n/a | MISSING | NOT IN KDP | — | n/a | **NOT APPLICABLE** |
| `the-puzzles-of-henry-dudeney` | roadmap | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `the-puzzles-of-henry-dudeney` | roadmap | paperback | interior | LIVE | n/a | n/a | LIVE | B0HHS2JW9N | live | **LIVE** |
| `epictetus-discourses-and-enchiridion` | PD-1 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `epictetus-discourses-and-enchiridion` | PD-1 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `seneca-selected-dialogues` | PD-1 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `seneca-selected-dialogues` | PD-1 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `myths-and-legends-of-china` | PD-1 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `myths-and-legends-of-china` | PD-1 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `indian-myth-and-legend` | PD-1 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `indian-myth-and-legend` | PD-1 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `mythical-monsters` | PD-1 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `mythical-monsters` | PD-1 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `games-ancient-and-oriental` | PD-2 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `games-ancient-and-oriental` | PD-2 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `korean-games` | PD-2 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `korean-games` | PD-2 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `kwaidan` | PD-3 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `kwaidan` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `kwaidan` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `fairy-mythology-vol-1` | PD-3 | ebook | built | LIVE | live | verified | NOT APPLICABLE | — | n/a | **LIVE (Valice only)** |
| `fairy-mythology-vol-1` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `fairy-mythology-vol-1` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `fairy-mythology-vol-2` | PD-3 | ebook | built | LIVE | live | verified | NOT APPLICABLE | — | n/a | **LIVE (Valice only)** |
| `fairy-mythology-vol-2` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `fairy-mythology-vol-2` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `british-goblins` | PD-3 | ebook | built | LIVE | live | verified | NOT APPLICABLE | — | n/a | **LIVE (Valice only)** |
| `british-goblins` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `british-goblins` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `book-of-were-wolves` | PD-3 | ebook | built | LIVE | live | verified | NOT APPLICABLE | — | n/a | **LIVE (Valice only)** |
| `book-of-were-wolves` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `book-of-were-wolves` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `sea-monsters-unmasked` | PD-3 | ebook | built | LIVE | live | verified | NOT APPLICABLE | — | n/a | **LIVE (Valice only)** |
| `sea-monsters-unmasked` | PD-3 | paperback | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `sea-monsters-unmasked` | PD-3 | hardcover | — | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **BLOCKED · no package** |
| `traditional-games` | PD-2 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `traditional-games` | PD-2 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `chess-and-playing-cards` | PD-2 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `chess-and-playing-cards` | PD-2 | paperback | interior+wrap | listed · coming soon | n/a | n/a | NOT IN KDP | — | — | **READY TO UPLOAD** |
| `mancala` | PD-2 | ebook | built | LIVE | live | verified | NOT IN KDP | — | n/a | **LIVE (Valice only)** |
| `codex-enigmatica` | roadmap | ebook | built | LIVE | live | verified | LIVE | B0HGRZ3BRC | live | **LIVE** |
| `codex-enigmatica` | roadmap | paperback | interior | LIVE | n/a | n/a | LIVE | B0HGSVF15Q | live | **LIVE** |
| `codex-enigmatica` | roadmap | hardcover | interior | LIVE | n/a | n/a | LIVE | B0HH3B4HQ7 | live | **LIVE** |

**No row reads UNKNOWN.** "NOT IN KDP" means the format has never been created there;
"NOT APPLICABLE" means the edition is not planned and the reason is on the catalogue row.
"READY TO UPLOAD" means interior, wrap and companion leaf exist, preflight is clean, and
gates 7, 8 and 10 are signed — it does not mean anything has been sent to Amazon, and
nothing has.

## 16. No book left behind — the whole tree, classified

`MY-DİGİTAL-BOOK/` holds **25 book projects in the two production families** (all 25 are in
the matrix above and all 25 carry a `gates.json`), plus `COMMON-AREA/` (shared instruments,
not a book) and **eight projects under `BACKUP/`**. None of the eight is in the catalogue,
none has a Paddle product or an R2 master, and none is claimed as a Valice product. They
are listed here because §31 of the brief says nothing may be silently ignored.

| Project | What it is | Measured state | Why it is not in the queue |
|---|---|---|---|
| `backup/` | HTML guides and old reports | no manuscript, no build | **NOT APPLICABLE** — not a book |
| `Fabl` | Turkish children's fables | 5,466 words, 32 content entries, **0 built files** | **BLOCKED** — Turkish; this store sells in English and has no Turkish channel |
| `intikam-yemini` | Turkish novel | 54,693 words, 19 content entries, 0 built files | same |
| `tuzun-hafizasi` | Turkish novel | 95,834 words, 38 content entries, 0 built files | same — and the longest manuscript in the tree |
| `solgun-kitabe` | Turkish novel | 3,670 words, 8 content entries | same, and early |
| `mendiran-vakayinamesi` | Turkish novel | 3,700 words, **0 content entries** | same — a scaffold |
| `LICENSE-AND-LAUNCH-CALIFORNIA-LIFE-HEALTH` | US insurance-exam prep | only two 2026-08-24 source PDFs; **no manuscript output** | **BLOCKED** — nothing has been written yet |
| `TRUE-FIT-SEWING-PATTERN-FITTING-SERIES` | three-book sewing series | BOOK-01 has a built 728 KB PDF and a pilot sheet | **PENDING FOUNDER** — this is the *Before You Cut* line, and the standing item on it is **O9: trademark clearance and testers**, which is yours |

To be exact about the one that could move: **BOOK-01 of the sewing series is the only book
outside the 25 with a built PDF.** It has no cover, no catalogue row, no gate record and no
KDP handbook, and O9 stands in front of it. Adding it to a distribution queue is a decision,
not a build step, so it was not added.

---

# Session 2 — 2026-09-07/08 · the sign-in wall came down

**KDP session restored. File upload works. The Previewer ran, found a real fault, the fault
was fixed at its root, and the re-run is clean. One book is staged to the Terms line. Ten
more are unblocked by a Founder answer but not yet driven through the UI.**

## S2.1 What the restored session actually unblocked

Both blockers from session 1 are gone, and each was verified rather than assumed:

| | Session 1 | Now |
|---|---|---|
| KDP content page | redirected to a password form | **loads** |
| `file_upload` to KDP | never reached | **works** — 601 KB manuscript, 4.9 MB cover, both accepted |
| Print Previewer | never ran | **ran, failed, was fixed, re-ran clean, approved** |

## S2.2 Pre-upload re-validation found four stale artifacts

§3 of the brief says not to assume the thirteen are unchanged. They were not.

**Four Phase-2 wraps carried `Title='paperback-wrap-v1'` and no author** — the filename as
the title, which is what a library catalogue reads. `preflight.py --kind cover` fails all
four. Re-emitted through `COMMON-AREA/covers/rewrap_clean.py` with the book's real title,
subtitle and author; the new wrap widths are also exact where two had been 0.0010 in out.

**Three Phase-2 interiors credited the annotator alone for somebody else's text.** Korean
Games and Chess and Playing Cards said *Emre Doğan* for Stewart Culin's surveys; The Singing
Games said the same for Alice Gomme's collection. Volume 8 of the same phase already carried
the full form. Corrected in each `project_config.json` from that project's own rights ledger,
then written into the three PDFs **without touching a printed page** — every page's content
stream hashed before and after, all identical.

After the fixes: **13/13 packages pass geometry, trim, fonts and file-size preflight. 0
failures.**

## S2.3 The Previewer found what nothing local could

Epictetus paperback, first upload. KDP returned:

> **ERROR** — *This text is outside the margins.* Pages **34** and **96**.

Every local check was green and each was right about what it measured. `pdftotext -bbox`
reports **advance** boxes, and by that measure every line on every page sat at exactly
0.5000 in. Rasterised at 300 dpi and measured as **ink**, the two flagged lines carried to
0.4867 in of the trim edge while every other line stopped at 0.4967 — 0.0133 in further out.

The cause is the italic terminal of the last glyph. A right-leaning face puts ink outside its
own advance width, and a **justified** line ends its advance exactly on the frame edge. Body
text never trips it because the body face is upright; only the head-notes are justified
italic.

> A margin measured in advance widths is not the margin the printer sees.

`S["note"]` now ends 2 pt short of the frame — 0.0278 in, twice the measured overhang,
invisible at 8.8 pt. Rebuilt, companion leaf re-spliced, re-uploaded. **Previewer clean,
approved.** Page count unchanged at 176, so the wrap built for 176 pages is still right —
checked, not assumed. Visual QA passed on the cover, the spine, the barcode zone, pages
174–175 and the companion page at 176.

## S2.4 The blocker that stopped the other ten, and the answer

KDP's Content page **will not save** without naming the tool that generated the AI images —
verified by attempting the save and reading the refusal. Nine of the thirteen declare
`images: generated` (your supplied cover artwork) and **no project file recorded the
generator**; a tenth, the Myth Hunter's, had no `compliance.aiDisclosure` block at all and
its config reserved the choice to you.

Naming a generator I had no record of would be a false statement to Amazon in your name, so
I asked. Your answers, now written into all ten `project_config.json` files so the
declaration and the repository say the same thing:

* **Image tool: `gpt-image-1`** — consistent with the two covers this house generated itself
  and logged (Puzzle Book, RIGHTS.md S-CP-03, $0.4992 in the cost ledger; and Kwaidan).
* **The Myth Hunter's Field Book**: texts *some sections, extensive editing*; images *yes*.
  `founderConfirmed` is now true, dated, with the KDP mapping recorded.

## S2.5 Epictetus paperback — the one driven end to end

| Step | State |
|---|---|
| Title | created, KDP id `EKPMDVEAJMZ` |
| Details | title, subtitle, Epictetus as author, George Long as Translator, Emre Doğan as Editor, catalogue description, **public domain work**, adult content No, 7 keywords, 3 categories under Politics & Social Sciences › Philosophy |
| ISBN | **9798172626982** — free KDP ISBN, assigned this session, printed in the barcode on the uploaded wrap |
| Content | manuscript + cover uploaded, 6×9, no bleed, white, matte |
| AI declaration | Texts *some sections, extensive editing* (Claude) · Images *one or a few, extensive editing* (gpt-image-1) · Translations *None* |
| Previewer | **clean and approved** after the margin fix |
| Pricing | **$16.99**, worldwide rights. KDP's own calculator: printing $3.11, royalty **$7.08** — the exact figure the catalogue's price basis recorded |
| Publish | **PENDING OWNER CONFIRMATION** |

The Publish button carries: *"By clicking publish I confirm that I agree to and am in
compliance with the KDP Terms and Conditions."* §15 of the brief says finish everything
before that step and record it. Done, and recorded.

## S2.6 Where the other twelve stand

Nothing is blocked by a missing file or a missing answer any more. What remains is UI work.

* **Puzzle Book hardcover** — Details inherit correctly from the live paperback (title,
  subtitle, author, description, keywords, categories, rights all pre-filled and verified),
  but *Save and Continue* will not advance and KDP surfaces no error. The Content page 404s,
  so the format record does not yet exist. **BLOCKED — KDP UI, cause not yet identified.**
* **Greek paperback** — new title, Details filled (title, subtitle, author, description, 7
  keywords); the two rights radios would not register after the description editor updated.
  **IN PROGRESS.**
* **The other ten** — files validated, AI declaration now answerable, not yet started at KDP.

## S2.7 Independent end-to-end audit — run fresh, not read off the log

| # | System | Checked | Result |
|---|---|---|---|
| 1 | Local files | 13 interiors + 13 covers, sha256 each | **26/26 present**, page counts and geometry as recorded |
| 2 | Preflight | fonts, metadata, trim, page count, 40 MB cover cap | **0 failures** (was 4 before S2.2) |
| 3 | Print geometry | wrap width vs measured page count, all 13 | **13/13 OK**, every spine exact |
| 4 | R2 | 42 objects: HEAD, size, **sha256 of retrieved bytes vs local**, signed URL | **41 OK, 1 mismatch — found and closed** |
| 5 | Paddle | live account vs catalogue | 24 products, **0 to create**, no duplicates, webhook active 4/4 |
| 6 | Production DB | the rows checkout actually reads | **24 buyable, 0 would fail** |
| 7 | Website | `/`, `/books`, `/ebooks`, `/categories`, `/cart`, companion | all 200 |
| 8 | Book pages | all 27, status + cover | **27/27 200 with their cover**, 27 in sitemap |
| 9 | KDP bookshelf | read fresh, 24 format rows | 23 live + 1 draft (Epictetus $16.99) |
| 10 | Amazon | B0HDLS4W8Q product page opened | live, correct title, author and series |
| 11 | Gates | 25 projects | 190 passed · 40 in_progress · 70 not_started — **unchanged**; no gate was written by an agent |
| 12 | Git | status, branches, worktrees, secret scan over 6 commits | clean, one worktree, **0 credential matches** |
| 13 | CI | lint, tsc, 409 tests, build | **all green** |

**The one mismatch, and why it was not "fixed" on the wrong side.** R2 held
`codex-mythologica-the-puzzle-book/master.pdf` at 429,205 B; the local staging copy was
429,015 B and differed. R2 was **right**: its object matches the current print interior
(429,205 B, built 2026-09-07 12:41) while the staging file was the 09-06 build.
`upload-masters` had been refusing to overwrite it, correctly, for two days. The staging copy
was rebuilt; both now report SAME at `b12e1fb891d0`. Nothing in production was touched.

## S2.8 Discrepancy table

| System | Expected | Actual | Result |
|---|---|---|---|
| R2 vs local, Puzzle Book PDF | identical | differed; R2 newer | **FIXED** — staging rebuilt, now identical |
| 4 Phase-2 wraps | real title + author | `paperback-wrap-v1`, no author | **FIXED** — re-emitted |
| 3 Phase-2 interiors | text's author credited | annotator only | **FIXED** — metadata only, pages byte-identical |
| Epictetus interior margins | ink inside 0.5 in | 0.4867 in on 2 pages | **FIXED** — root cause, Previewer clean |
| Kindle **Codex Bestiarium** B0HDLS4W8Q | $12.99 (catalogue) | **$9.99** | **OPEN — yours** |
| Kindle **World Games** B0HG44FH1B | $11.99 (catalogue) | **$9.99** | **OPEN — yours** |
| Puzzle Book hardcover at KDP | Details saved | will not advance, no error shown | **OPEN — KDP UI** |
| Gate 12, 11 published books | signed or waived | `not_started` | **OPEN — yours** |
| Epictetus paperback | published | Draft, complete to the Terms line | **PENDING OWNER CONFIRMATION** |

**The two Kindle prices are now settled, not in flight.** Both listings read plain *Live* at
$9.99. The house rule is that a direct ebook matches its Kindle list price to the cent, so
the catalogue's $12.99 and $11.99 are now **above** Amazon's on the same two books. Changing
a price is yours; the exact edit is two `priceCents` values plus a Paddle price update.

## S2.9 What is owner-only, restated after this session

1. **Publish** — every print format ends at *"By clicking publish I confirm that I agree to
   and am in compliance with the KDP Terms and Conditions."* Epictetus waits there now.
2. **The two Kindle prices** in §S2.8, and whether the direct prices follow.
3. **Gate 12** for the eleven books published in session 1.
4. **Gates 7 and 8** for the eleven Phase-3 print formats.
5. A **proof copy** of the Myth Hunter's hardcover — first print of that interior and wrap.

---

# Session 3 — 2026-09-08 · seven more defects, and the exact shape of the KDP wall

**Epictetus is IN REVIEW — you published it. Seven further data defects were found and fixed
before anything was uploaded. The queue did not finish, and the reason is specific,
reproducible and worth writing down rather than retrying blindly.**

## S3.1 Epictetus reached Amazon

| | |
|---|---|
| KDP id | `EKPMDVEAJMZ` |
| Status | **In review** — submitted 2026-09-08 |
| Price | $16.99 |
| ISBN | 9798172626982 |
| ASIN | none yet — assigned when it goes live, and it will not be invented here |

The loop the brief asks for ran in full on this book: upload → Previewer → **real defect** →
root-cause fix → rebuild → re-upload → Previewer clean → approve → price → your Publish.

## S3.2 Seven defects found by re-validating, before any upload

§1 of the brief says not to assume the twelve are unchanged. They were not. Every one of
these would have gone to Amazon uncorrected.

| # | Defect | Where | Fix |
|---|---|---|---|
| 1–4 | PDF `Title` was the **filename** — `paperback-wrap-v1` — and no author | 4 Phase-2 wraps | re-emitted through `rewrap_clean.py` with the real title, subtitle and author; two wrap widths that were 0.0010 in out are now exact |
| 5–7 | Interior credited **the annotator alone** for Stewart Culin's and Alice Gomme's text | Korean Games, Chess and Playing Cards, The Singing Games | credit corrected from each project's own rights ledger, then written into the PDFs |
| 8–11 | The same defect again, one phase earlier: E. T. C. Werner, Donald A. Mackenzie, Charles Gould and Seneca's translator all reduced to *Emre Doğan* | 4 Phase-1 interiors | same fix, names from ledger row S-1 |
| 12 | `rights.publicDomain: false` with a null differentiation — on a book whose **own RIGHTS.md** says Alice Bertha Gomme died in 1938 and whose listing title already carries *(Annotated)* | The Singing Games | set to `true` / `annotated`. It would have put the wrong **Publishing Rights** answer into KDP |

Every interior edit was metadata-only and **proved** so: each page's content stream was
hashed before and after and is byte-identical. All 26 files re-preflight clean.

> Four books in two different phases credited the wrong person, and the covers already had it
> right. Cover and interior disagreed for weeks and nothing compared them.

## S3.3 What actually stops the queue

Not files, not gates, not the AI declaration — all of those are resolved. The obstacle is the
KDP form itself under browser automation, and it is specific:

**The custom React dropdowns will not open.** They have no underlying `<select>`; the listbox
never renders for a synthetic click or a keyboard event. That blocks exactly one field —
**Trim Size** — and only for books that are not KDP's 6 × 9 default.

| Trim | Books | Drivable? |
|---|---|---|
| 6 × 9 (default) | Epictetus, Seneca, China, Indian, Mythical Monsters, Games Ancient, Korean Games, Chess & Cards, Singing Games | **yes** — Epictetus proves it |
| 8.5 × 11 | Greek paperback | no — needs the trim dropdown |
| 8.25 × 11 | Greek hardcover, Puzzle Book hardcover, Myth Hunter's hardcover | no — same |

Uploading an 8.5 × 11 interior against a 6 × 9 setting is the mismatch KDP rejects, so those
four were not uploaded rather than uploaded wrongly.

The other UI faults are intermittent rather than absolute: radio buttons and Save buttons
sometimes take a `ref` click and sometimes a coordinate click, with no discernible rule. That
unreliability, not any missing artifact, is what consumed the session.

## S3.4 ⚠ Two Greek drafts exist — one must be deleted

Because a Save that appeared to fail had in fact succeeded, **two identical paperback drafts
were created for the same book**:

| KDP id | Details | Content | Keep? |
|---|---|---|---|
| `T7F0P031S9D` | complete — title, 7 keywords, 1,095-char description, own-copyright, 3 categories | empty | either |
| `0QM43ZAMWJE` | complete, identical | empty | either |

**Neither may be published as it stands.** Both carry KDP's default **6 × 9** trim while the
Greek interior is **8.5 × 11**. Delete one, and set the other's trim before any upload.

## S3.5 Second independent audit — run fresh

| # | System | Checked | Result |
|---|---|---|---|
| 1 | Local files | 13 interiors + 13 covers | **26/26 present**, geometry and page counts as recorded |
| 2 | Preflight | fonts, metadata, trim, 40 MB cover cap | **0 failures / 26** |
| 3 | Print geometry | wrap width vs measured pages, all 13 | **13/13 OK** |
| 4 | Interior credits | 7 public-domain interiors | **7/7 now name the original author** |
| 5 | R2 | 42 objects: HEAD, size, sha256 of **retrieved** bytes vs local, signed URL | **0 mismatches · 0 URL failures** |
| 6 | Paddle | live account vs catalogue | 24 products, **0 to create**, webhook active 4/4 |
| 7 | Production DB | the rows checkout reads | **24 buyable · 0 would fail** |
| 8 | Website | `/`, `/books`, `/ebooks`, `/categories`, `/cart` | all 200 |
| 9 | Book pages | all 27, status + cover | **27/27 200 with cover**, 27 in sitemap |
| 10 | KDP bookshelf | read fresh | 26 rows: 20 Live, 3 Live·updates in review, **1 In review**, 2 Draft |
| 11 | Gates | 25 projects | 190 passed · 40 in_progress · 70 not_started — **unchanged; nothing written by an agent** |
| 12 | Git | status, worktrees, secret scan | clean, 1 worktree, 0 credential matches |
| 13 | CI | lint, tsc, 409 tests | **all green** |

## S3.6 Discrepancy matrix

| System | Expected | Actual | Result |
|---|---|---|---|
| 4 Phase-2 wraps | real title + author | filename as title | **FIXED** |
| 7 PD interiors | original author credited | annotator only | **FIXED**, pages byte-identical |
| Singing Games rights | public domain / annotated | false / null | **FIXED** |
| R2 vs local | identical | identical | **PASS** (the session-2 mismatch stays closed) |
| Paddle | 24 products, no dupes | 24, none to create | **PASS** |
| Website | 27 pages + covers | 27/27 | **PASS** |
| Greek at KDP | one draft, 8.5 × 11 | **two drafts, both 6 × 9** | **OPEN — delete one, set the trim** |
| Greek/Puzzle/Myth-Hunter hardcovers | uploaded | not uploaded | **BLOCKED — trim dropdown will not open** |
| 8 × 6 × 9 paperbacks | uploaded | not uploaded | **OPEN — no blocker, session ran out** |
| Kindle Bestiarium B0HDLS4W8Q | $12.99 (catalogue) | **$9.99** | **OPEN — yours** |
| Kindle World Games B0HG44FH1B | $11.99 (catalogue) | **$9.99** | **OPEN — yours** |
| Gate 12, 11 published books | signed or waived | `not_started` | **OPEN — yours** |
| F-047 World Games | untouched | untouched, ASIN B0HHNCVQVX intact | **PRESERVED** |
| F-052 Codex Bestiarium | untouched | untouched, 3 ASINs intact | **PRESERVED** |
| F-048 Codex Enigmatica | categories corrected | staged on ebook + paperback; hardcover locked in review | **PARTIAL — awaits your Publish** |
| F-051 Myth Hunter's hardcover | built + uploaded | **built and verified**; not uploaded | **PARTIAL** |

## S3.7 What the next pass should do first

1. **Delete one Greek draft** (`T7F0P031S9D` or `0QM43ZAMWJE`) and set the survivor's trim to
   8.5 × 11 by hand. Two drafts of one book is how a book gets published twice.
2. **The eight 6 × 9 paperbacks** need no dropdown and no decisions — Seneca, China, Indian,
   Mythical Monsters, Games Ancient, Korean Games, Chess & Cards, Singing Games. Their files,
   credits, rights answers, AI declarations and prices are all settled and recorded.
3. **Set the trim by hand once per hardcover**, then the rest of that flow automates.
4. The two Kindle prices, and Gate 12.

---

*Written 2026-09-07. Sources: the filesystem, valicepress.com, `neondb`, api.paddle.com,
the R2 bucket, the KDP Bookshelf and the KDP Print Cover Calculator.*

---

# Session 4 — 2026-09-08: the site came back, and four books were setting HTML as text

**The images returned to valicepress.com. Both Kindle-matched ebooks came down to
$9.99. Nine KDP editions were driven to the line where publishing becomes a legal
attestation. And chasing one Previewer rejection found a defect that would have
printed `<br>` between the lines of every verse quotation in four books.**

Measured, not assumed: images by fetching bytes and by counting `naturalWidth === 0`
in the production browser; prices from the KDP Bookshelf, the Paddle live API and
`neondb`; margins by rendering every page at 300 dpi and reading the ink bounding
box; page counts out of the PDFs; KDP state from the Previewer and the Bookshelf.

## 20. The outage: an ignore pattern took every image off the site

The Founder reported that no book or category image was loading. It was true, and it
was mine.

Session 1 added a `.vercelignore` to keep a 109 MB PDF out of the deploy. It used
`images/` and `assets/`. **A path in a deploy-ignore file is a prefix, not a
directory, unless you anchor it** — so `images/` also matched `public/images/`, and
159 shipped files stopped existing. Every cover, every category tile, the author
portraits, the blog art.

The check that would have caught this is fetching one image from production. My
earlier audit had grepped the page HTML for the path instead, and the HTML was
correct — it referenced files that were no longer deployed. A one-sided check again.

Fixed by root-anchoring every pattern. Verified after the deploy, in this order:

| Check | Result |
|---|---|
| 164 image paths fetched from production | 159 × `200`, 0 real failures |
| The five non-200s | JSDoc examples and *negative* test assertions — the house rules that forbid a Founder photo and genre art. Correct that they 404. |
| `next/image` optimizer, all 16 widths | every width the site emits returns `200`; only `w=16` 400s, and no page emits it |
| Broken images in the production browser | `0` on `/`, `/books`, `/categories`, `/categories/myth-and-folklore`, `/books/codex-bestiarium`, `/authors` |
| Covers visually correct | confirmed by screenshot after forcing lazy images to load |

The window manager would not honour a resize, so mobile could not be tested by
viewport. It was tested where it actually matters instead — every `srcset` candidate
width a browser could pick, from 32 px to 3840 px, fetched and confirmed `200`.

## 21. §10B — both direct ebooks matched to Amazon

Read at source rather than trusted: the KDP Bookshelf shows Kindle `B0HDLS4W8Q` Live
at **$9.99** and `B0HG44FH1B` Live at **$9.99**. The direct editions were quoting
$12.99 and $11.99 — the storefront was charging more than Amazon for the same file.

| | Bestiarium | World Games |
|---|---|---|
| Kindle list, read on KDP | $9.99 | $9.99 |
| Direct price before | $12.99 | $11.99 |
| Direct price now | **$9.99** | **$9.99** |
| Paddle price id | `pri_01m1btjb037st1aew8mt990htv` → `pri_01m1zbewy6v80k9r58qbsxz1r4` | `pri_01m1btjcqgabh6v8rsxg85frxr` → `pri_01m1zbf17bapxg1hd2gtp1554a` |

A Paddle price is immutable in amount, so each reprice creates a new price and
archives the old one. Each was committed with `--slug` so one book moved at a time,
and the new ids were written into `valice-catalog.mjs` before the load — a stale id
would have quoted an archived price at checkout. `paddle-crosscheck` reads both as
active at $9.99, `neondb` holds $9.99 against the new ids, and both product pages
render $9.99 with `"price":"9.99"` in the JSON-LD.

## 22. The defect the Previewer found

Seneca's first upload was rejected: *text outside the margins*, pages 126 and 136.
Chasing it found two faults, and the second was much worse than the first.

**Markup printed as text.** `rl()` protected only bare `<i>` and `<b>`. So
`<i lang="la">e lorica</i>` fell through the escaper and set as visible angle
brackets; `<br>` was not handled at all, so every verse quotation ran together as
prose with `<br>` printed between the lines; and text already carrying `&amp;` was
escaped twice and set as `&amp;`.

| Book | Occurrences | Pages |
|---|---|---|
| Seneca: Selected Dialogues | 53 | 25, 40, 46, 74, 108, 122, 123, 125, 126, 137 |
| Myths and Legends of China | 12 | 15, 89 |
| Mythical Monsters | 4 | 27, 30 |
| Indian Myth and Legend | 2 | 20, 24 |

**Margins.** KDP measures ink, not the advance box. Every page reported exactly
0.5000 in of advance box; rendered at 300 dpi, justified italic lines put glyph ink
at **0.4867 in** — 0.0133 in inside the gutter a 156-page book is required to hold.
Six pages of Seneca. The Contents table was sized from its own copy of the frame
arithmetic and hung 0.02 in outside the frame on page 4 of three books.

Fixed at the source, not in the output: tags are now stashed whole and restored after
the typographic substitutions, so an attribute can never be reached by the
quote-smartener; and one `INK_ALLOWANCE` constant holds every text box 0.02 in inside
the legal margin, shared by the frame and by `FW`.

Rebuilding moved two page counts, so the companion plan followed and the wraps were
re-checked against the new thickness:

| Book | Pages | Wrap width needed | Wrap width built | Verdict |
|---|---|---|---|---|
| Seneca | 154 → **156** | 12.6013 in | 12.5968 in | −0.0045 in, inside tolerance |
| Myths and Legends of China | 108 → **112** | 12.5022 in | 12.4932 in | −0.0090 in, inside tolerance |
| Indian Myth and Legend | 94 | 12.4617 in | 12.4617 in | exact |
| Mythical Monsters | 74 | 12.4166 in | 12.4166 in | exact |
| the four Phase-2 game books | unchanged | — | — | exact |

The rebuild also silently reverted an earlier PDF-metadata repair, because the credit
lived only in the patched file and not in the builder. All four builders now carry the
full credit, so the next rebuild keeps it.

**After the fix, on the rebuilt files:** 0 leaked markup, 0 pages with ink inside the
required gutter, every page-count claim in the listing copy matching the PDF, and the
KDP Previewer clean on Seneca at 156 pages.

Two listing-copy defects were corrected on the way: Seneca's blurb claimed 156 pages
for a 154-page book (it is now genuinely 156, and verified), and four descriptions
were single 1,400–1,970-character blocks, now broken at their own natural movements.

## 23. What was driven at KDP

| Book | Format | Title id | ISBN | Trim | Pages | Price | Previewer | State |
|---|---|---|---|---|---|---|---|---|
| Seneca: Selected Dialogues | paperback | `GM84M0E1V62` | 9798172687273 | 6×9 | 156 | $15.99 | clean | **Draft — pending owner confirmation** |
| Myths and Legends of China | paperback | `GC7MT3V7W30` | 9798172694240 | 6×9 | 112 | $13.99 | clean | **Draft — pending owner confirmation** |
| Indian Myth and Legend | paperback | `YP7JKSCNWVT` | 9798172694967 | 6×9 | 94 | $12.99 | clean | **Draft — pending owner confirmation** |
| Mythical Monsters | paperback | `R2C9VPQH270` | 9798172695872 | 6×9 | 74 | $11.99 | clean | **Draft — pending owner confirmation** |
| Games Ancient and Oriental | paperback | `281J6G0V6G7` | 9798172696701 | 6×9 | 78 | $12.99 | clean | **Draft — pending owner confirmation** |
| Korean Games | paperback | `EHJRTWA1PDM` | 9798172697418 | 6×9 | 144 | $16.99 | clean | **Draft — pending owner confirmation** |
| Greek Alphabet Handwriting Workbook | paperback | `0QM43ZAMWJE` | 9798172680830 | 8.5×11 | 100 | $12.99 | clean after a fix | **Draft — pending owner confirmation** |
| Codex Mythologica: The Puzzle Book | hardcover | `8P928QGPN9R` | 9798172680939 | 8.25×11 | 156 | $33.99 | clean | **Draft — pending owner confirmation** |
| The Myth Hunter's Field Book (F-051) | hardcover | `T0TA64W2VEP` | 9798172681028 | 8.25×11 | 156 | $33.99 | not run | **Blocked — interior upload** |
| Chess and Playing Cards | paperback | — | — | 6×9 | 120 | $14.99 | — | **Blocked — KDP weekly limit** |
| The Singing Games of England, Scotland, and Ireland | paperback | — | — | 6×9 | 244 | $16.99 | — | **Blocked — KDP weekly limit** |

Every one carries: publishing rights *public domain work*; adult content *no*; three
category placements (two for Chess, see below); worldwide territories; Amazon.com as
primary marketplace; and the AI declaration recorded from the Founder's own
provenance — texts *some sections, with extensive editing* (Claude), images *one or a
few AI-generated images, with extensive editing* (`gpt-image-1`), translations *None*.

**Why nothing was published.** The Publish button carries the sentence *"By clicking
publish I confirm that I agree to and am in compliance with the KDP Terms and
Conditions."* That is a legal attestation, and the standing instruction is to finish
everything before it, record `PENDING OWNER CONFIRMATION`, and continue. Nine
editions sit one click from live. Gate 12 reads `not_started` on every book in the
tree; no gate status was written by this session.

### The Greek workbook: a fix, and a fact worth reading twice

Its first upload was rejected. The folio baseline sat at `M_BOT - 22` = 17.6 pt,
putting its ink **0.2467 in** from the trim edge against KDP's 0.25 in floor. KDP
listed 20 pages; measuring every page at 300 dpi found it on **90 of 100**. Moved to
`M_BOT - 18`. The folio is drawn absolutely, so nothing reflowed: still 100 pages, and
the wrap (17.4752 × 11.25 in) still fits exactly. KDP's own summary then quoted a
$2.84 printing cost — the same figure the catalogue's price basis was computed from.

Also: the note in memory calling this book an *empty scaffold* is out of date. It is a
real 100-page workbook with 32 lessons.

## 24. Blockers, stated plainly

**KDP weekly title-creation limit.** After six new paperbacks, KDP refused the seventh:
*"Title creation limit exceeded — You have reached the weekly title creation limit for
this format."* This is an account rate limit, not a data problem — Chess and Playing
Cards and The Singing Games have verified files, metadata, categories and listing copy
staged and waiting. The two errors KDP showed alongside it (*language isn't supported*,
*release date too soon*) are artefacts of the refused creation, not real field faults.

**The Myth Hunter's hardcover interior.** The built file is correct: 156 pp, 8.25 × 11,
F-051 satisfied. It is 33.2 MB. KDP accepts 650 MB; this session's file-upload bridge
caps a transfer at 10 MB. The payload is 32.9 MB of lossless PNG art, and a lossless
re-compression test returned 3 %. It could only be brought under the cap by lossy
recompression of a print interior already sitting at 150 dpi, so **it was left alone
deliberately.** Its cover, AI declaration, trim and ISBN are all in place; one file
upload by hand finishes it, and pricing unlocks with it (KDP needs the page count to
compute printing cost).

**A duplicate draft.** `23FPQXH1MDR` is an empty second *Mythical Monsters* — no ISBN,
no manuscript, no cover — created when a Save that looked like it had failed had in
fact created a title. The same failure mode as the earlier Greek duplicate. The
complete one is `R2C9VPQH270`. It was **not** deleted here: deletion is destructive and
the weekly creation limit is exhausted, so a mistaken deletion could not be undone this
week.

**Chess and Playing Cards has two category placements, not three.** Its second and
third rows rendered their placement lists outside the live DOM and would not take.
KDP allows *up to* three; two are correct and saved.

## 25. Findings outside the KDP work

**Clerk is running a development instance in production. (HIGH)** `valicepress.com/account/*`
correctly redirects a signed-out browser to sign-in — but to
`organic-dragon-70.accounts.dev`, headed *"Sign in to digital-bookstore"*, with an
orange **Development mode** badge under the form. A buyer clicking Library, Orders or a
download link sees the old scaffold name and a development banner. Clerk development
instances also carry hard user caps and are not supported for production traffic. Fixing
it means creating the production instance, renaming the application, and putting new keys
into Vercel — a credential change, which is the Founder's to make.

**The Greek workbook's own gates are open.** It is staged to publish-ready, but its
`gates.json` still shows Gate 2 (Rights, R6) and Gate 5 (Factual verification, R4)
`in_progress`. **Do not publish this title until those close.** The other six staged
titles show only Gate 1 (Market fit, a standing state) and Gate 12.

**The barcode sits on the imprint line on some covers.** KDP prints its own barcode in a
2.0 × 1.2 in box at the back cover's lower right. On Seneca the box covers the end of
*VALICE CLASSICS* and sits on *VALICE PRESS*; China, Indian and the four Phase-2 game
books are clear. It is cosmetic — the Previewer raised no error and Approve was enabled —
but it is a real defect on a printed back cover, and the fix is a cover-art change:
move the imprint line out of the box.

## 26. Systems, re-verified at the end

| System | Check | Result |
|---|---|---|
| Catalogue | `validate-catalog` | **127 pass · 3 warn · 0 error** |
| Paddle | `paddle-crosscheck` against the live account | every direct-sold book has a live, active, price-matched price |
| `neondb` | direct query | 27 published · 24 buyable direct ebooks · 23 formats with an ASIN |
| Paddle-less published books | direct query | 3 — Myth Hunter's (no digital edition by design), Codex Mythologica (KDP Select to 2026-11-03), Hangul (Gate 2 unsigned). All three deliberate and documented. |
| Site | all 27 `/books/*` pages | 27 × `200`, JSON-LD on every one, prices correct; the only three without an Offer are exactly the three not sold here |
| Inngest | `PUT /api/inngest` | `{"message":"Successfully registered","modified":true}` |
| Paddle webhook | unsigned `POST` | `401` — signature verification is live |
| Internal links | 7 hub pages | every link `200` except `/account/{library,orders,settings}`, which return 404 to a non-browser and correctly redirect a browser to sign-in |
| Images | 164 paths + 16 optimizer widths + browser render | 0 broken |
| CI | lint · `tsc` · tests · build | clean · clean · **409/409** · compiled |

