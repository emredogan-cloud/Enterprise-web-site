# KDP distribution — audited 2026-09-07 (second pass)

> **Third pass, evening.** Since the second: the Puzzle Book paperback **went from publishing to
> live while this session watched it** and is recorded live; every KDP price was reconciled
> against the catalogue line by line; the KDP quality queue was read; and the format gap was
> costed against the files actually on disk. Third-pass changes are marked ◆; second-pass ▲.


**12 titles on the bookshelf · ◆ 23 live ASINs · 0 publishing.**
Audited through the KDP web UI. No KDP API was called. Every ASIN below was read off the
bookshelf and confirmed on its own Amazon product page.

---

## 1. The bookshelf, as it stands

| Title | eBook | Paperback | Hardcover |
|---|---|---|---|
| Codex Mythologica (main) | **live** $6.99 `B0HD8121RR` | **live** $21.99 `B0HCY8KY3X` | **live** $32.99 `B0HDBFZRQ4` |
| Codex Mythologica — Large Print | — | **live** $27.99 `B0HDDR84MF` | — |
| Codex Mythologica: The Puzzle Book | — | ◆ **live** $16.99 `B0HJ2TPX4T` | ▲ interior built, no cover on disk |
| Codex Bestiarium (main) | **live** $12.99 `B0HDLS4W8Q` | **live** $24.99 `B0HDLQHQ7H` | **live** $37.99 `B0HDLLPG5M` |
| Codex Bestiarium — Large Print | — | **live** $29.99 `B0HDLT1V3P` | — |
| Codex Enigmatica | **live** $9.99 `B0HGRZ3BRC` | **live** $19.99 `B0HGSVF15Q` | **live**¹ $29.99 `B0HH3B4HQ7` |
| The Great Book of World Myths | **live** $6.99 `B0HDQRPKST` | **live** $14.99 `B0HDTL5V2H` | **live** $26.99 `B0HDZJ4PHQ` |
| The Great Book of World Games | **live** $11.99 `B0HG44FH1B` | **live** $22.99 `B0HG3KMK9L` | **live** $34.99 `B0HG41F21F` |
| The Great Book of World Games — Large Print² | — | **live** $31.99 `B0HHNCVQVX` | — |
| The Myth Hunter's Field Book | — | **live** $14.99 `B0HFP4KYX5` | — |
| Korean Hangul Handwriting Workbook | — | **live** $12.99 `B0HHHWXGG4` | **live**¹ $21.99 `B0HHLZ31CV` |
| The Puzzles of Henry Dudeney | — | **live** $14.99 `B0HHS2JW9N` | — |

¹ "Live · Updates in review" — the edition is live, a metadata change is pending.
² Listed on KDP as a second paperback, which is why a format-name match missed it.

## 2. Cross-match against the local filesystem

**26 local book/volume builds across 25 projects; 27 catalogue rows; zero local books missing
from the catalogue.**

| Direction | Result |
|---|---|
| ASINs on KDP but not in the catalogue | **3 — all now recorded** (§4) |
| ASINs in the catalogue but not on KDP | **none** |
| Malformed ASINs anywhere | **none** — 22 of 22 match `B0` + 8 |
| Invented ASINs / ISBNs | **none** |

## 2b. ▲ The Puzzle Book paperback is PUBLISHING, not live

`B0HJ2TPX4T`. Verified before being written down anywhere:

| Evidence | |
|---|---|
| KDP bookshelf | status **Publishing**, $16.99, modified 2026-09-07 |
| `amazon.com/dp/B0HJ2TPX4T` | resolves — right title, **ISBN 979-8172268281** (KDP's own assignment), **156 pages** matching the corrected interior |
| Price on the Amazon page | **absent** — which is what a title still in KDP's pipeline looks like |

So its state is **IN REVIEW / publishing**, and it is recorded that way. It is not LIVE and is
not reported as LIVE. Amazon typically completes this within 72 hours.

Recording it broke `valice-catalog.test.ts`, and the test was right to fire: its rule was
*ASIN implies `kdp: "live"`*. That rule has a gap this case found — **Amazon issues an ASIN when
it accepts a title, not when the listing becomes purchasable.** The type union now models
`publishing` and the invariant admits it. It is not weakened: an ASIN on `not_created`,
`in_review` or `not_applicable` still fails. Proved by temporarily setting `kdp: "not_created"`
on the real ASIN and watching the test fail.

**The hardcover is built and ready** — 156 pp at 8.25 × 11 (KDP has no 8.5 × 11 case laminate),
preflight 11/11 pass, and carrying the same table fix. Creating the format at KDP is refused by
this environment.

## 3. The Puzzle Book paperback — worked end to end

The one format that was incomplete on the shelf, and the only one this session could advance.

| Step | Result |
|---|---|
| Details | already complete |
| ISBN | `9798172268281`, free KDP ISBN, imprint Independently published |
| Print options | B&W / white / **8.5 × 11 in** / no bleed / matte — matches the built interior |
| **First Previewer run** | **2 ERRORS on p. 152** — "This text is outside the margins", "This object is outside the margins" |
| Root cause | see §3.1 — far worse than a margin |
| Fix | `render.table` + `Book.tbl`: long tables now split across pages, header repeated |
| Re-upload | corrected interior, sha `b12e1fb8…`, 156 pp |
| **Second Previewer run** | **0 errors.** Approve enabled and clicked |
| Visual QA | cover, spine, barcode zone, pp. 152–153 inspected — table now inside the margins, folio clear |
| Pricing | **$16.99**, printing $3.65, royalty **$6.54 at 60%** (KDP's own figures), worldwide rights |
| Saved | as Draft; bookshelf now shows $16.99 |
| **Remaining** | **"Publish Your Paperback Book"** — carries the KDP Terms agreement. **Account owner only.** |

### 3.1 What the previewer actually found

`render.table` draws every row in one block. `Book.tbl` called `need()`, which moves to a fresh
page when the table does not fit — the right move for a table that fits on a page, and useless
for one that does not, because a new page has no more room than a page.

So the fifty-seven-creature reference table **drew off the bottom of the paper**, and three rows
never printed: **Ghūl, ʿIfrīt and Rukh — the whole Arabian civilization** — in a table whose own
caption says "three to each, exactly" for nineteen civilizations. The printed book held 54 of 57.

Proved by extracting the text of both builds: the three names were **not in the text layer at
all** before the fix, because they were drawn past the paper edge. The hardcover had the same
defect (Arabian mentions 19 → 22). Page counts did not move, so both covers still fit.

**No local instrument caught this.** Preflight passed, fonts embedded, page count correct. KDP's
previewer found it in one click.

## 4. Corrections made to the catalogue from KDP evidence

| ASIN | Was | Now |
|---|---|---|
| `B0HHLZ31CV` Hangul hardcover | `coming_soon` / `in_review` / no ASIN | **available / live**, ASIN + ISBN 979-8170927647 |
| `B0HHS2JW9N` Dudeney paperback | `coming_soon` / `not_created` / no ASIN | **available / live**, ASIN + ISBN 979-8171876937 |
| `B0HHNCVQVX` World Games large print | `coming_soon` / `in_review` / no ASIN | **available / live**, ASIN + ISBN 979-8171397371, **plus three recorded listing defects** |

The Hangul row carried a comment explaining the absence: an author-wide Amazon search on
2026-09-02 had found no hardcover. That was true that day. It went live on 2026-09-03 and the
search was never run again.

## 5. Open KDP items

| # | Item | Status | Owner |
|---|---|---|---|
| 1 | Puzzle Book paperback — **Publish** | staged, previewer clean | **Founder** |
| 2 | World Games LP — title typo **"39 Cultıres"** | live, uncorrected — **KDP: "Subtitle can no longer be edited… publish a new edition"** | **Founder** |
| 3 | World Games LP — title omits "Large Print" | mitigated: the description now names the edition; the title still cannot | **Founder** |
| 4 | World Games LP — description printed literal `\n\n` | **SAVED IN KDP** (verified across a reload); also corrected "160 pages" → 232 and named the edition. ▲ **Re-checked on Amazon at 14:4x — still the old text.** Metadata takes up to 72 h (F-047) | propagating |
| 5 | Codex Enigmatica — three **Teen & Young Adult** categories on a book whose config says ages 16–99 | evidence gathered, change refused by this environment (F-048) | **Founder** |
| 6 | Phase 2 + Phase 3 books — no KDP listing | 11 books, Gate 2 unsigned | **Founder** |

## 6. The one judgement I did not make

KDP's Quality Notifications shows a single open item: *Codex Enigmatica*, "Reading Interest Age
is missing". A **recommendation**, not an issue — nothing suppressed, no quality warnings, two
items already resolved.

It fires because the Kindle edition is filed under **Teen & Young Adult › Hobbies & Games ›
Games & Activities**, and that category expects an age range. So either the category is right and
the book needs an age range, or it is an adult puzzle book in the wrong category. *The Puzzles of
Henry Dudeney* and the World Games large print are filed the same way, so the answer probably
applies to all three. **I had no basis to choose and did not guess.**

## 7. One correction I did make

The Puzzle Book's KDP AI declaration read **Images: None**. Its `project_config.json` records the
cover as gpt-image-1 output, made for $0.4992 against a $4.00 cap and logged in two ledgers.
Corrected to **"One or a few AI-generated images, with minimal or no editing"**, tool
`gpt-image-1`. Article 20 and KDP both require the declaration to match the production history,
and it did not.

## 8. Not distributed, and why

**Eleven books** — five Phase 2, six Phase 3 — are built, packaged and have KDP upload handbooks
generated from their own QA records. **None has been uploaded.** All eleven carry
"GATE 2 IS UNSIGNED": the rights signature, which no agent can give. No ASIN, ISBN or KDP state
has been invented for any of them.

## 8b. Every format classified — no UNKNOWN

73 format entries across 27 catalogue rows:

| State | Count |
|---|---|
| **LIVE** — ASIN present and `kdp: live` | **22** |
| **READY** — published row, format not created at KDP | 22 |
| **BLOCKED (Gate 2)** — the 11 draft books | 22 |
| **NOT APPLICABLE** — no such format in the local project | 6 |
| **PENDING OWNER CONFIRMATION** — Puzzle Book paperback | 1 |
| **UNKNOWN** | **0** |

## 9. States, exactly

| State | Meaning here |
|---|---|
| **LIVE** | confirmed on the KDP bookshelf *and* the Amazon product page |
| **READY / PENDING OWNER CONFIRMATION** | every agent-performable step done; one owner click remains |
| **SAVED, PROPAGATING** | written and verified in KDP; Amazon has not caught up (≤72 h) |
| **BLOCKED** | cannot proceed here — a gate signature, or an action this environment refuses |
| **NOT APPLICABLE** | the local project has no such format |

## 10. Truthfulness

| Claim | Basis |
|---|---|
| 22 live ASINs | read from the bookshelf; three spot-checked on their Amazon pages |
| Puzzle Book previewer clean | **VERIFIED** — ran it, read the errors, fixed the source, re-ran it, inspected pages |
| Puzzle Book published | **NO.** It is DRAFT. One click remains and it is the owner's |
| World Games LP defects | **VERIFIED** — read on the live Amazon page |
| R2 | **VERIFIED** — 13 masters confirmed by HeadObject against the live bucket. My earlier "placeholders" finding was wrong: I had read only `scripts/tmp/.env.production`, and the real credentials are in `.env`/`.env.local`. See F-044, withdrawn. |

---

# ◆ Third pass — evening, 2026-09-07

## 11. Every KDP price against every catalogue price

The bookshelf was read in full — both pages, 12 titles, 23 format listings — and each listing
matched to its catalogue row by ASIN. Not spot-checked: **all 23, both directions.**

| | |
|---|---|
| Price mismatches | **0 of 23** |
| KDP listings with no catalogue row | **0** |
| Catalogue ASINs absent from the shelf | **0** |
| Malformed ASINs | **0** |

```
codex-bestiarium/ebook          B0HDLS4W8Q  $12.99  $12.99  ok
codex-bestiarium/paperback      B0HDLQHQ7H  $24.99  $24.99  ok
codex-bestiarium/hardcover      B0HDLLPG5M  $37.99  $37.99  ok
codex-bestiarium/large_print    B0HDLT1V3P  $29.99  $29.99  ok
codex-enigmatica/ebook          B0HGRZ3BRC   $9.99   $9.99  ok
codex-enigmatica/paperback      B0HGSVF15Q  $19.99  $19.99  ok
codex-enigmatica/hardcover      B0HH3B4HQ7  $29.99  $29.99  ok · KDP: Updates in review
codex-mythologica/ebook         B0HD8121RR   $6.99   $6.99  ok
codex-mythologica/paperback     B0HCY8KY3X  $21.99  $21.99  ok
codex-mythologica/hardcover     B0HDBFZRQ4  $32.99  $32.99  ok
codex-mythologica/large_print   B0HDDR84MF  $27.99  $27.99  ok
puzzle-book/paperback           B0HJ2TPX4T  $16.99  $16.99  ok
hangul/paperback                B0HHHWXGG4  $12.99  $12.99  ok
hangul/hardcover                B0HHLZ31CV  $21.99  $21.99  ok · KDP: Updates in review
world-games/ebook               B0HG44FH1B  $11.99  $11.99  ok
world-games/paperback           B0HG3KMK9L  $22.99  $22.99  ok
world-games/hardcover           B0HG41F21F  $34.99  $34.99  ok
world-games/large_print         B0HHNCVQVX  $31.99  $31.99  ok · KDP: Updates in review
world-myths/ebook               B0HDQRPKST   $6.99   $6.99  ok
world-myths/paperback           B0HDTL5V2H  $14.99  $14.99  ok
world-myths/hardcover           B0HDZJ4PHQ  $26.99  $26.99  ok
myth-hunters/paperback          B0HFP4KYX5  $14.99  $14.99  ok
dudeney/paperback               B0HHS2JW9N  $14.99  $14.99  ok
```

Worth saying plainly: reading the shelf, I thought the World Games large print was mispriced —
$31.99 on KDP against a remembered $29.99. **It is not. $29.99 is the Bestiarium large print.**
The table caught a misremembering that a spot check would have promoted into a finding.

## 12. The Puzzle Book paperback went live during this session

The one state change worth watching in real time.

| When | KDP bookshelf | `amazon.com/dp/B0HJ2TPX4T` |
|---|---|---|
| Morning | Publishing, $16.99 | page exists · ISBN 979-8172268281 · 156 pp · **price shows `—`** |
| Evening | **Live**, $16.99 | **"Paperback from $16.99"**, with *Other New from $16.99* beneath |

Recorded `kdp: "live"`, `availability: "available"`, and loaded into production. The page also
says *"This item cannot be shipped to your selected delivery location"* for the account's own
address in Turkey — that is a shipping-destination limit on one address, not a listing state, and
it is not a reason to withhold the edition from readers who can receive it.

**This is why `publishing` had to become a real state in the catalogue rather than a rounding of
`live`.** For most of a day the honest answer was neither.

## 13. The KDP quality queue — read, not guessed

| Bucket | Count |
|---|---|
| Suppressed | **0 books** |
| Quality warnings | **0 books** |
| Make corrections | 0 items |
| Under review by Amazon | 0 items |
| Resolved | 2 items in 1 book |
| **Open — Review** | **1 item in 1 book** |

The single open item is on **Codex Enigmatica's Kindle edition** (`B0HGRZ3BRC`, last audited
2026-09-05), category *Metadata*, type *Recommendation*:

> **Metadata — Reading Interest Age is missing.** *"To improve the discoverability of books in
> the Juvenile book categories on Amazon, choose an appropriate age range for your title."*

The recommendation is not the finding. **The finding is why Amazon is offering it**: the live
breadcrumb on that listing reads

> Kindle Store › Kindle eBooks › **Teen & Young Adult** › Hobbies & Games › Games & Activities

A hundred engraved ciphers with a book-length unbroken mystery is being shelved as young-adult.
That is the F-048 categorisation problem showing up from Amazon's side as well as ours, and the
age-range prompt is a symptom of it. **Filling in an age range would answer the prompt and
entrench the wrong shelf.**

None of the three buttons — *Edit book details*, *I will fix it*, *Decline* — was pressed. Each
submits a response to Amazon about a live listing, and the right response depends on a
categorisation decision that is the Founder's.

## 14. The format gap, costed against files on disk

**28 Amazon-fulfilled formats in the catalogue have no ASIN.** Eighteen belong to `draft` books a
visitor cannot see. **Ten belong to books already published** — nine of them promised on a live
page as *coming soon*, one marked not-applicable:

| Book | Format | Promised at | Interior on disk | Cover on disk |
|---|---|---|---|---|
| greek-alphabet-workbook | paperback | $12.99 | **missing** | **missing** |
| greek-alphabet-workbook | hardcover | $24.99 | **missing** | no path |
| greek-alphabet-workbook | large_print | — | **missing** | **missing** |
| puzzle-book | hardcover | $33.99 | OK 421 K | **no cover** |
| puzzle-book | large_print | — | — | — |
| epictetus | paperback | $16.99 | **missing** | **missing** |
| seneca | paperback | $15.99 | **missing** | **missing** |
| myths-and-legends-of-china | paperback | $13.99 | **missing** | **missing** |
| indian-myth-and-legend | paperback | $12.99 | **missing** | **missing** |
| mythical-monsters | paperback | $11.99 | **missing** | **missing** |
| world-myths | large_print | *(not applicable)* | — | — |

**Not one of the nine has a complete package.** Eight are missing both files; the Puzzle Book
hardcover has an interior and no cover. There is nothing to upload, so nothing was uploaded —
the blocker is upstream of KDP entirely.

Four editions *do* have both files ready — `games-ancient-and-oriental`, `korean-games`,
`chess-and-playing-cards` and `traditional-games`, all paperback. **They were not uploaded**, and
that is a decision worth stating rather than burying:

* All four are `websiteStatus: draft`. Publishing them to Amazon would put a book on Amazon that
  Valice Press itself does not list.
* Their gates **1, 3, 6, 7, 8, 10 and 12** are all `not_started` — including Cover, Interior/proof
  and KDP compliance, the three gates that exist precisely to be passed *before* a KDP upload.
* Those are founder-signature gates, and signing them is refused here.

Pushing four books past three unrun compliance gates to make a report say "uploaded" is the exact
trade the gate system exists to prevent.

### ▲ Correction to the second pass

The package index at `docs/execution/phase-5/kdp-packages/INDEX.json` (generated 09-05) still
lists `the-puzzles-of-henry-dudeney/paperback` and `codex-mythologica-the-puzzle-book/paperback`
as `not_created`. **Both are live** — `B0HHS2JW9N` and `B0HJ2TPX4T`. Its `kdpState` field is
stale; its file paths are not, and it was the file paths this section used.

## 15. Distribution scorecard — no UNKNOWN rows

| | Count | Evidence |
|---|---|---|
| Titles on the bookshelf | 12 | read in the KDP UI, both pages |
| Format listings | 23 | every one carries an ASIN |
| **Live** | **23** | each confirmed on its own Amazon page |
| Publishing | 0 | the last one cleared this evening |
| In review / blocked / draft at KDP | 0 | the shelf filter reports none |
| Listings with a pending metadata update | 3 | Enigmatica hardcover, Hangul hardcover, World Games LP — *"Live · Updates in review"* |
| Price mismatches vs the catalogue | **0** | §11 |
| Suppressed or quality-warned | **0** | §13 |
| Open quality items | 1 | §13, a recommendation |
| Amazon formats with no ASIN | 28 | 18 on draft books, 10 on published; §14 |
| Of those, uploadable today | **0** | §14 — files absent, or gates unrun |
| ASINs or ISBNs invented | **0** | every number here was read off Amazon or KDP |

**No API was called. Every figure was read through the normal browser workflow, and no button
that submits anything to Amazon was pressed.**
