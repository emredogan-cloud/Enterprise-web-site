# Book 1 — Kwaidan: Stories and Studies of Strange Things

**Valice Classics 13** · Lafcadio Hearn, 1904 · built 2026-09-06 · branch
`feature/public-domain-phase-3`, **not merged**

## 1 · What it is

The whole of Hearn's *Kwaidan*: seventeen tales, three insect studies, his own notes and
his own prefatory note, with both plates of the 1904 edition. 138 pages at
6 × 9. Nothing of Hearn's is cut.

| | |
|---|---|
| Source | Project Gutenberg ebook 1210 — a proof-read human transcription, not a scan |
| Source words printed | 36,053 |
| Editor words | 9,768 |
| **Editor share** | **21.02%** against a 20% floor |
| Pages | 138 (even, as KDP requires) |
| Claims registered | 23, all verified — one CORRECTED by verification |
| Quotations checked | 34 — 25 in source, 9 external, **0 not found** |

## 2 · Rights, and two findings that go against the roadmap

**The plates are printed.** The roadmap put Kwaidan's plates under "expected risks":
*"Kwaidan's Takénouchi plates remain unattributed and are designed out."* That is true of
the source file, which labels both `[Illustration]` and names nobody. It is not true of the
artist. Wikipedia's article on the book names Takeuchi Keishū; Wikimedia Commons carries
Wikidata **Q11545824**, giving his birth as 13 November 1861 and his death as 3 January
**1942 or 1943**. The uncertainty does not matter: life-plus-seventy expired at the end of
2012 on the earlier date and 2013 on the later, and the 1904 United States imprint settles
the US independently. Both plates are reproduced at their true 300 DPI size — 858 × 1000 and
908 × 1000 px, about three inches across — and are not enlarged beyond it.

**The 1904 introduction is not printed.** The first edition's prefatory matter is two
pieces and only one is Hearn's:

- Hearn's own note, 154 words, signed **"L. H."**, dated Tōkyō,
  20 January 1904. **Printed.**
- A second piece, **677 words** in
  5 paragraphs, dated **March
  1904**, on the Russo-Japanese war, quoting Paul Elmer More. **Unsigned in the source, and
  its author is named in no authority record.** Not printed.

Article 3 says a public-domain text does not clear the layer beside it; Article 4 says GREEN
is not clearance. A layer whose creator cannot be named has no death year and therefore no
rights position. The Source Note states the omission and the reasoning on the page, not
only in a QA file.

## 3 · Source coverage

Phase 2's rule — a build that succeeds while dropping source is a failure — measured rather
than asserted:

| | |
|---|---|
| Body words in the file | 37,076 |
| Words inside sections | 36,960 (99.69%) |
| Gap | 116 words — **measured**: 105 inside heading tags, 11 in the contents lists and title page |
| Boilerplate leaks | **0** — asserted on every build |
| Accounting | 36,909 − 677 (dropped introduction) − 179 (title page, contents, three container headings) = **36,053 printed** |

17 stories (23,908 w), 3 studies (9,826 w),
17 note sections (2,165 w).

## 4 · What the apparatus adds

The introduction runs 2,937 words, above the constitution's 1,500 minimum.

- **A head-note before every one of the 20 pieces.**
- **The Register of Provenance** — the thing no other edition has. Hearn's note says *most*
  of the tales came from old Japanese books and names five; it never says which tale came
  from which. **Three** pieces have an origin he states (one Chinese, one told him by a
  farmer of Chōfu in Musashi, one that happened to him); a **fourth** is not stated by him
  and is marked EVIDENT rather than STATED, being plainly autobiography. **Sixteen are
  shown as open** rather than assigned to one of his five books on a guess.
- **A glossary of 45 terms** — every Japanese word he italicises and leaves unexplained.
- **The Yōkai Register**, 15 entries, naming the creatures by what folklore calls them.
  "Mujina" is filed under *noppera-bō*: the animal in the title never appears.
- **A gazetteer of the ten old provinces**, which catches an error the text has carried for
  a century — it puts Niigata in **Echizen**, and Niigata is in **Echigo**. Hearn's sentence
  is left exactly as he wrote it and the reader is told.
- **A chronology**, **five editorial notes** inside Hearn's own, **what has been established
  since 1904**, a **source note**, and a **28-entry index**.

Article 6's three registers are kept apart: the Spencerian ant sociology and the racial
explanations are marked as not sustained; the mosquito identification — *Culex fasciatus*,
now *Aedes aegypti* — is marked as correct, because it is.

## 5 · The formats

| | Paperback | Hardcover | Ebook |
|---|---|---|---|
| Pages | 138 | 138 | 138 pp PDF + reflowable EPUB |
| Trim | 6 × 9 in | 6 × 9 in interior | — |
| Spine | 0.3108 in (safe 0.186) | **0.5 in** (safe 0.375) | — |
| Full wrap | 12.5608 × 9.25 in | **14.075 × 10.417 in** | — |
| Geometry from | KDP calculator, 138 pp row | KDP calculator, 138 pp row | — |
| List | $14.99 | $29.99 | $8.99 |

Both wrap geometries were read off the official KDP Print Cover Calculator on 2026-09-06 and
stored in `COMMON-AREA/covers/kdp_geometry.json`. Nothing is interpolated.

## 6 · The cover

Artwork generated with **gpt-image-1** (1024 × 1536, quality high, $0.2496, recorded in
`valice-house/cost/ledger.jsonl`). **The prompt contains no text and the model rendered
none**; the title, author, series line and imprint are set in the layout in Cinzel and Noto
Serif Display, which is COVER_STANDARDS §2.2.

| | |
|---|---|
| Native artwork ppi at printed panel width | **167.2** — recorded, not dressed up as 300 |
| Files | true 300 DPI rasters, 4× Real-ESRGAN then LANCZOS |
| 150 px thumbnail contrast | 1.0 |
| Title band | 24.0% of cover height — below the 25% proxy because KWAIDAN is one word; thumbnail legibility measured instead |
| **Barcode box** | **clear — 0 bright pixels** in the 2.0 × 1.2 in box. Reserved in the composition, not repaired afterwards |
| ICC | sRGB embedded |

## 7 · Ebook and companion

EPUB 3, **EPUBCheck 0 fatals / 0 errors / 0 warnings**, 37 documents,
36 nav entries, both plates included. The cover is declared three ways —
`properties="cover-image"`, a legacy `<meta name="cover">`, and `cover.xhtml` first in the
spine — because Phase 1 shipped five EPUBs with **no cover at all**.

The companion is four printable sheets at `valicepress.com/companion/kwaidan`: the Provinces
card, the Yōkai cards, the Register of Provenance, and a sheet for playing
*hyakumonogatari kaidankai* with seventeen tales instead of a hundred. The printed QR is
2.55 in — **33.7% of the usable page height**,
against a 25% floor — at 385.9 effective DPI, and it was decoded
independently with OpenCV: `https://valicepress.com/companion/kwaidan`, which matches the printed URL.

## 8 · Commerce

| | |
|---|---|
| Paddle product | `pro_01m1v4n7tthzcxjvp08fzkkt5t` |
| Paddle price | `pri_01m1v4n80k6g2tba6wt8882ehf` — $8.99, **live** |
| Tax category | `standard`, not `ebooks` — the account is not approved. FOUNDER **F-029** |
| R2 masters | `books/kwaidan/master/v1/master.pdf` and `.epub` in `bookstore-masters-dev` |
| R2 verified | read back and hashed: **byte-identical** to the local files |
| Storefront | `public/images/books/kwaidan.webp`, 1067 × 1600, 46 KB |
| Catalogue | row added; `websiteStatus: "draft"` **on purpose** — see below |

**Why the row is still draft.** The Paddle product exists and the ebook format is marked
available, but Phase 3 is not merged and must not be. Publishing the row would write a
book into the production database whose page code, cover and companion sheets are not
deployed, and the reader would meet broken images and a 404 companion. Database-write
authorisation is not deployment authorisation, and this is where the two separate.

## 9 · What is NOT done

- **No KDP upload.** No ASIN, no ISBN, no review, no rank appears anywhere.
  `KDP/KDP_UPLOAD_HANDBOOK.html` names every file and field for both print formats.
- **Gate 2 unsigned.** Prepared, with the two findings above set out for ratification —
  FOUNDER **F-030**.
- **Not deployed.** Deliberately, per §44.

## 10 · The adversarial review

An independent reviewer, which did not write the book, was given one instruction: **prove
this book is not ready**. It raised **23 defects** in
about half an hour, and it was right about nearly all of them. The book that shipped is not
the book it reviewed.

**The P0.** The edition's headline claim — the thing that makes it worth buying — said
*"four pieces have an origin Hearn states, and sixteen do not"*. Hearn states an origin for
**three**. The fourth, *Hi-Mawari*, is plainly autobiography and the book's own table said
so two pages later: *"Not stated by Hearn"*. The wrong number was on the paperback back
cover, the hardcover back cover, the printed introduction, the printed register, the
companion sheet, the catalogue row and the Paddle description — seven surfaces, and on the
covers it had further degraded into "four **tales**", which only adds to twenty if the three
insect studies are counted as tales. All seven are corrected.

**The worst of the nine P1s.** The hardcover laid its type out against the sheet instead of
against the case, so *VALICE PRESS* sat **0.23–0.36 in below the bottom fold** — printed on
the inside of the boards, invisible on the finished book. This is COVER_STANDARDS §5's
recorded Enigmatica defect, verbatim: *"safe area measured from the trim instead of the
outer edge"*. The panels now compose into a real safe box, inset **0.716 in** from the outer
edge — the exact figure §5 names — and **0.519 in** on the spine side to clear the hinge.

**The others worth naming.** A Hearn quotation on both back covers had a full stop
substituted for his comma and continuing clause, closing a sentence he did not close, inside
quotation marks, with no ellipsis. The quote checker exists to catch precisely that and did
not, because the record had been produced before the build scripts existed and the
build-script scan had never run; the checker also drowned its real finding in 32 false
positives on HTML attributes. Both are fixed and the record is now reproducible. The
apparatus claimed Hearn *"identifies"* his mosquito as *Culex fasciatus*; he wrote that it
*"much resembles"* what Howard calls *Stegomyia fasciata*, and named the Stegomyia first —
converting his hedge into a firm claim is exactly what Article 6 forbids, and C-008 is
marked **VERIFIED — CORRECTED** rather than quietly rewritten. A sentence saying Hearn was
right about mosquitoes *"forty years before it was fashionable"* was false and contradicted
the book's own next section; it is cut. Nine checkable statements were not in
`CLAIMS.jsonl`; seven are now registered, and two of those turned out to be **wrong** —
"twenty years as a newspaperman" was fifteen, and "two provinces down the coast" was three.

**What was not fixed, and why.** Two findings are recorded as Founder decisions rather than
changed by the factory: the cover is a painted scene where COVER_STANDARDS gives the series
a typographic identity, and its title band is 23.7% against a 25% rule that a one-word title
cannot meet without printing KWAI over DAN. Both are **F-031**. One finding — a blank final
leaf carrying a running head — stopped applying when the page count settled at 138, and the
safeguard that detects it was kept anyway.

**What the reviewer verified as sound** is worth recording too: no source text is truncated
anywhere (it re-parsed the file independently and swept 12-word shingles across all 37,000
printed words), the dropped introduction is genuinely absent from both formats, the plates
are byte-identical to the source scan and placed at exactly the size the rights note claims,
the QR decodes to the printed URL, the barcode zone is genuinely empty, and there is no
cross-book leakage anywhere in the tree.
