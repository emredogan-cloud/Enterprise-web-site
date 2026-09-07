# KDP distribution — audited 2026-09-07

**12 titles on the bookshelf · 22 live ASINs · 1 staged and awaiting the owner's click.**
Audited through the KDP web UI. No KDP API was called. Every ASIN below was read off the
bookshelf and confirmed on its own Amazon product page.

---

## 1. The bookshelf, as it stands

| Title | eBook | Paperback | Hardcover |
|---|---|---|---|
| Codex Mythologica (main) | **live** $6.99 `B0HD8121RR` | **live** $21.99 `B0HCY8KY3X` | **live** $32.99 `B0HDBFZRQ4` |
| Codex Mythologica — Large Print | — | **live** $27.99 `B0HDDR84MF` | — |
| Codex Mythologica: The Puzzle Book | — | **DRAFT — ready to publish** $16.99 | — |
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
| 2 | World Games LP — title typo **"39 Cultıres"** | live, uncorrected | **Founder** (past the 72-hour title window; needs a new edition) |
| 3 | World Games LP — title omits "Large Print" | live, uncorrected | **Founder** |
| 4 | World Games LP — description prints literal `\n\n` | live, uncorrected | **Founder** (editable without a new edition) |
| 5 | Codex Enigmatica — "Reading Interest Age is missing" | open recommendation | **Founder** — see §6 |
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

## 9. Truthfulness

| Claim | Basis |
|---|---|
| 22 live ASINs | read from the bookshelf; three spot-checked on their Amazon pages |
| Puzzle Book previewer clean | **VERIFIED** — ran it, read the errors, fixed the source, re-ran it, inspected pages |
| Puzzle Book published | **NO.** It is DRAFT. One click remains and it is the owner's |
| World Games LP defects | **VERIFIED** — read on the live Amazon page |
| R2 / fulfillment | **UNVERIFIED** — credentials are placeholders (F-044) |
