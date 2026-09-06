# Codex Mythologica: The Puzzle Book — book report

**Date:** 2026-09-05 · **Project:**
`MY-DİGİTAL-BOOK/ROADMAP-BOOKS/04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK`
· **Branch:** `feature/public-domain-phase-2`, **not merged**
· **State:** QA · **Gate:** `qa`

> **A note on where this file sits.** The 2026-09-05 instruction named this
> path, so it is written here. This book is **not** one of the five
> public-domain Phase 2 titles — those are Falkener, Culin ×3 and Gomme, and
> Phase 2's own fourth slot is Mancala. It is roadmap book 4, and the Founder's
> own reorganisation of the book tree the same day put it where it belongs:
> `ROADMAP-BOOKS/04-…`, alongside Hangul, Greek and Dudeney. `PHASE_2_REPORT.md`
> is therefore **not** credited with a sixth book; it carries a cross-reference
> instead.

---

## 1 · What was built

A hundred puzzles from the Codex universe, in five gatherings, as three
products: a paperback, a hardcover and a direct ebook of two files.

| | |
|---|---|
| Puzzles | **100**, in 12 families across 5 gatherings |
| Civilizations | **19**, every one of them in at least 8 puzzles |
| Factual premises | **542**, each re-read from source on every build |
| Tiers | I 33 · II 31 · III 36 |
| Paperback | 8.5 × 11, **156 pp**, $16.99 |
| Hardcover | 8.25 × 11, **156 pp**, $33.99 |
| Direct ebook | $11.99, **live** on a live Paddle price |
| Companion | `/companion/codex-puzzles` — 10 more puzzles, 330 hints, the filled grids, an answer checker |

### The families

Ciphers 14 · deductions 12 · logic grids 10 · word fits 10 · word searches 10 ·
orderings 8 · classifications 8 · tallies 8 · pictures 8 · acrostics 4 ·
matchings 4 · rail fences 4.

## 2 · The three rules the book is built on, and how each is enforced

This book's commercial argument is not its subject — mythology puzzle books
exist — it is that everything in it is checkable. So each of the three claims
is a build gate rather than an intention, and the build fails rather than
warns.

### Rule 1 — every puzzle is solved by something that never sees the answer

`BUILD/solvers.py` holds twelve solvers. Each is handed exactly what the
printed page gives a reader — the grid, the clue list, the candidate table —
and never the answer key, and never the code that made the puzzle. The build
requires the solver to reach the key's answer AND to reach no other one.

**Result: 100/100 reach the printed answer, and no other.** Where a puzzle had
two answers it was rebuilt: six were, during the build — two deductions, one
sequence, one classification and two matchings, each named in the git history.

The one deliberate exception is **P074**, a classification keyed NONE: the
reader is meant to check every candidate and find that not one joins the set,
and the puzzle's own printed instruction says so before they start — *"It is
possible for the answer to be NONE — one of these eight is exactly that, and
the point of it is that you should not force a fit."* That line is printed on
all eight classification pages, in the book and in the ebook.

The verification table used to summarise the gate as *"100 of 100, each to
exactly one answer"*. For P074 the solver reaches zero qualifying candidates,
so read as a count that sentence was false, and the adversarial review said so.
It now reads **"100 of 100, to the printed answer and no other"** — true of all
hundred, and the stronger claim, because it asserts the key match as well.

### Rule 2 — no puzzle needs knowledge the reader arrived with

Every deduction prints its whole candidate list as a table with the columns the
clues talk about. Every logic grid names its categories in full. Every tally
prints the figures it counts. Every classification prints all ten rows.

This cost pages: it is most of why the book is 156 and not the 130 the roadmap
planned. It is also the difference between a puzzle book and a quiz, and it is
the sentence on the back cover that a buyer is actually deciding on.

### Rule 3 — facts come from fields, not from memory

A civilization, a class, a kin family, an epoch are **fields** in the two Codex
manuscripts, so a claim about one is verified by re-reading the field.
`BUILD/claim_lint.py` does that on every build: 473 field checks, 37 verbatim
quotations cited to story/paragraph/sentence, 32 counts recomputed over the
manuscripts. **542/542 pass.**

The count rose from 516 because the review found the linter had been excusing
two families that assert facts — see §4.

## 3 · What went wrong, and what caught it

Four defects that a careless build would have shipped.

**The class names were invented.** The first draft printed "Guardians of the
Threshold", "Shapechangers", "Waters", "Storm and Sky", "The Unquiet Dead".
Five of those six are not what CODEX BESTIARIUM calls them; the real names are
on that book's *How to Read This Book* page — The Guardians, The Devourers, The
Shape-Changers, The Water-Dwellers, Sky and Storm, The Restless Dead. On a
puzzle whose answer IS a class name that is a wrong answer key, not a style
choice. `BUILD/taxonomy.py` now lifts them from the manuscript and **fails the
build if a name is not on that page.**

**Two sequences were invented mythology.** "The Five Suns" ordered Jaguar →
Wind → Rain of Fire → Water; the Codex names them the Sun of Earth, of Wind, of
Rain and of Water. "The Descent of Ishtar" listed earrings, a girdle and
bangles; the Codex lists the crown of the steppe, the lapis beads at the
throat, the small beads of the breast, the breastplate, the gold ring, the
lapis rod and line, and the royal robe. Both are now the source's own, and all
eight sequences carry claims — which they did not, which is how this was found:
the claim linter reported eight puzzles with no evidence at all.

**The difficulty model measured the wrong thing.** The first version scored
1.35·log2(the search the solver performed) plus a handling count. That grades a
word search — seven thousand cells for a solver, ten unstrained minutes for a
person — as harder than a four-by-three logic grid, and it produced a book of
6 tier I, 20 tier II and 74 tier III, in which "tier I" meant nothing. The
model now estimates READER effort: a per-family base plus a size term,
calibrated so a tier means the same across all twelve families. **33 / 31 / 36.**

**The rights rows pointed at another book.** The first draft of the source
block reused RL-0053 … RL-0058, which are Mackenzie's *Indian Myth and Legend*
rows — two of them RED. `rights-lint` read the ledger and reported this book as
carrying a RED source it has nothing to do with. Six new rows, RL-0068 …
RL-0073, were appended instead.

## 4 · The adversarial review, and what it found

The brief asked for a fresh reviewer whose instruction is *prove this book is
not ready*. The independent agent launched for it was terminated by the
provider mid-pass (HTTP 429, session limit), so the review was run to
completion here instead, against the **built artefacts** rather than the
build's own reports — the PDFs' content streams, the EPUB's XHTML, the shipped
`answers.json`, the R2 objects and the rendered pages. Eight passes. It found
three real defects and one process gap. All are fixed.

### The finding that mattered: two enciphered sentences were invented

The four rail fences (P015–P018) carried hand-typed plaintexts. Checked against
the source for the first time:

| | printed as | verdict |
|---|---|---|
| P015 | THE TREE IS THE SPINE OF THE WORLD | real, but a fragment of the sentence **cipher 2 already enciphers** |
| P016 | EVERY GRAVE HAS A ROAD RUNNING OUT OF IT | **in no Codex story. Invented.** |
| P017 | THE FIFTH WORLD IS THE ONE WE ARE STANDING IN | **in no Codex story. Invented.** |
| P018 | SHE REMEMBERS AGES NO ONE ELSE REMEMBERS | real, but the sentence **cipher 6 already enciphers** |

The back cover says *"The mythology behind them is not invented either."* Two
of these made that false, and two more meant the book enciphered the same
sentence twice under different titles. `FENCES` is now a citation table exactly
like `CIPHERS` — `(story, para, index)` — and the sentence is read off the
manuscript:

- P015 · *Baldur was the most beloved of the gods.* — The Death of Baldur
- P016 · *Charon would not take him a second time.* — Orpheus
- P017 · *Each ended in the way it had been built to end.* — The Five Suns
- P018 · *Zal was born to Sam, a great noble of Persia.* — The Simurgh

Same civilizations, same rail counts, same puzzle titles; the tier
distribution and the coverage counts are unchanged.

### Why nothing caught it

`claim_lint.py` held an exemption list, `NO_CLAIM_FAMILIES = {transposition,
nonogram, matching}`, and its reasoning was wrong for two of the three.

- **transposition** was excused as *"a rail fence of a sentence this book
  wrote"*. It was not: a fence prints a sentence and hands it to the reader as
  a line out of the myths.
- **matching** was excused as *"a constraint problem over names the puzzle
  prints in full"*. The names are printed; the **pairing** is the answer key,
  and *Kérberos is Greek* is a field in a manuscript like any other. All four
  matchings turned out to be correct — they were simply unchecked, which is a
  different thing from being right.

Only the nonogram survives as an exemption: it is a drawing, and a drawing
asserts nothing that could be false. Closing the other two took the book from
**516 verified premises to 542**, and 542/542 pass.

### The digital edition was a PDF with anchors and no links

The EPUB carried 100 `id="P0NN"` anchors and **not one link to any of them**. A
reader on puzzle 47 who wanted a hint had to leave the page, open the table of
contents, choose a hint pass, scroll a hundred entries, and then scroll five
gathering documents to get back — four times per puzzle. In print that is what
page numbers are for; in an ebook it is the failure the brief names by name.

Every puzzle now carries a jump row to its three hints and its answer, and
every hint and answer a return link: **1,111 internal links over 501 anchors,
0 broken, EPUBCheck still 0/0/0.** The three hint passes remain three separate
documents, so following the first hint still cannot put the third in view.

### The process gap

`ASSETS/cover/{paperback,hardcover}-wrap-v1.pdf` were placed by hand and had
gone stale — they still printed *516 factual premises*. An upload from `ASSETS`
would have shipped a cover contradicting its own book. `build_cover.py` writes
them from `OUTPUT` now.

### What the review checked and cleared

- **Cover text.** The first script reported the covers do not print *Emre
  Doğan* or *VÂLIÇE PRESS*. False alarm: the cover PDFs are raw ReportLab
  output with `/WinAnsiEncoding` and no `ToUnicode` map, so `pdftotext` drops
  `ğ`, `Â` and `Ç`. Rasterised at 220 dpi and read off the pixels, both lines
  set correctly. (The interiors go through Ghostscript and do carry `ToUnicode`;
  KDP rasterises covers, so nothing here needs changing.)
- **The imprint's dotless I.** `VÂLIÇE PRESS` is Python's `.upper()`, not
  Turkish casing. It is also what every other book in this catalogue prints —
  World Games, Enigmatica, Mythologica, Bestiarium, Hangul, Greek. Left as the
  house convention rather than made the odd one out.
- **Geometry.** Paperback spine recomputed from the measured page count to
  0.351312 in; wrap 17.6013 × 11.25 in. Hardcover 18.6150 × 12.4169 against
  the calculator's 18.615 × 12.417. Barcode zones measured at 150 dpi: 0.00 %
  ink in both.
- **The QR.** Rasterised at 300 dpi and decoded by OpenCV 5.0 — a decoder that
  knows nothing about how the code was made — from both interiors: exactly
  `https://valicepress.com/companion/codex-puzzles`.
- **Type size.** The claim is *nothing under 8 pt*. Read out of the content
  streams: the smallest size set anywhere in either interior is **8.0 pt**.
- **The answer checker.** The browser's `normalise()` and truncated SHA-256
  were re-implemented from the TSX and run against the shipped
  `answers.json`: **82/82** checkable puzzles round-trip, and a wrong answer
  is rejected.
- **Rights.** `RIGHTS.md` still cited RL-0053 … RL-0058 — Mackenzie's *Indian
  Myth and Legend* rows, two of them RED — although the ledger had already been
  corrected. Repointed to RL-0068 … RL-0073, and the same stale ids fixed in
  `DECISIONS.md` A2.
- **The commercial claims.** Every claim on the back cover and in the
  storefront description checked against the shipped data: the counts, the
  tally table, the tier split, the coverage floor, the three-pass hints, the
  per-answer verification lines, and the 542 premises. All true as printed.

---

## 5 · Verified, not asserted

| Check | Result |
|---|---|
| Puzzles solved independently | **100/100** reach the printed answer and no other · 99 resolve to one candidate, P074 by design to none |
| Factual premises re-read from source | **542/542** · 473 field · 37 quote · 32 count |
| Every puzzle carries evidence | `puzzlesWithNoClaim: []`; the only exempt family is `nonogram`, which is a drawing |
| Hint escalation | machine-checked: hint 1 may contain no part of the answer; hint 3 must be strictly more specific than hint 1 |
| Nineteen civilizations | verified against the source, which carries exactly 19; the build **stops** if that stops being true, because the subtitle quotes it |
| Civilization coverage | every one in ≥ 8 puzzles (min 8 · turkish, max 29 · norse) |
| Paperback interior | preflight **ok** · 156 pp · 8.500 × 11.000 in · 9 faces, all embedded |
| Hardcover interior | preflight **ok** · 156 pp · 8.250 × 11.000 in · 9 faces, all embedded |
| Paperback wrap | preflight **ok** · 17.6013 × 11.25 in · spine 0.3513 in · barcode zone measured 0.00 % ink |
| Hardcover wrap | preflight **ok** · 18.6150 × 12.4169 in · spine 0.54 in · barcode zone measured 0.00 % ink |
| Hardcover geometry | **read** from KDP's Cover Calculator, never derived |
| Smallest type set anywhere | **8.0 pt**, read out of both interiors' content streams — the book claims nothing under 8 pt |
| `cover-check.mjs` | 4 pass · 0 warn · 0 error |
| EPUB | EPUBCheck **0 fatals / 0 errors / 0 warnings / 0 infos** · 12 documents · 50 SVG grids · 3 hint passes |
| EPUB navigation | **1,111 internal links over 501 anchors, 0 broken** — every puzzle to its three hints and its answer, and back |
| Printed QR, both interiors | rasterised at 300 dpi and decoded by **OpenCV 5.0**, which knows nothing about how the code was made: exactly `https://valicepress.com/companion/codex-puzzles` · 33 × 33 modules · 2.304 mm/module · 27.3 % of the page |
| Answer checker | the browser's `normalise()` + truncated SHA-256, re-implemented against the shipped `answers.json`: **82/82** checkable puzzles round-trip; a wrong answer is rejected |
| R2 masters | `master.pdf` (0.36 MB) and `master.epub` (1.83 MB) uploaded and **read back byte-identical** (sha256 `f96c727c…`, `c7c8ad47…`) |
| KDP handbook | every sha256 and byte size in `KDP_UPLOAD_GUIDE.html` re-checked against the five shipped files — all match |
| Preview pages | pages 59–62 re-rendered from the rebuilt interior and compared to the served webps: mean absolute difference ≤ 0.43/255 |
| Paddle | product `pro_01m1sbkpvz2xryxdcvbxjrwb0k`, price `pri_01m1sbkq3qsjyfx3tzwctay664` — created against the LIVE account, active, one-time, 1199 USD |
| Catalogue | `valice-catalog.test.ts` 18/18 · loader wrote 20 books, this one 4 formats and 1 buyable |
| House lints | metadata **clean** · claim-lint **clean** · rights-lint 0 errors · compliance-lint 1 error, which is the AI declaration only a person can make |
| Test suite | **379/379** across 21 files |
| Production build | `/books/codex-mythologica-the-puzzle-book`, `/companion/codex-puzzles` and `/ebooks` all prerender with the right content |

## 6 · The economics, and the one place the roadmap was wrong

| Format | Pages | Print | List | Net | Margin | House floor 35 % |
|---|---|---|---|---|---|---|
| Paperback | 156 | $3.65 | **$16.99** | $6.54 | 38.5 % | ✓ |
| Hardcover | 156 | $8.30 | **$33.99** | $12.09 | 35.6 % | ✓ |
| Direct ebook | — | — | **$11.99** | $10.89 | 90.8 % | ✓ |

**The roadmap's hardcover TEST position of $24.99 cannot be built.** At 156
pages it nets 26.8 %, eight points under the floor; $29.99 gives 32.3 % and
$31.99 gives 34.0 %. $33.99 is the first price that clears it. That is inside
the Codex hardcover band ($29.99–37.99) and beside the closest comparable in
this catalogue — The Great Book of World Games, 160 pages at the same trim,
live at $34.99.

**The paperback is $16.99, not the roadmap's $14.99.** The roadmap's figure was
set against a planned 130 pages; at the built 156 it nets 35.6 %, six tenths of
a point over the floor and inside the noise of a KDP printing-rate change.

## 7 · The formats that were not made, and why

**No large print, and the reason is the format rather than the market.** The
book is already 8.5 × 11 with 10 pt clues and nothing under 8 pt. A large-print
edition would have to enlarge the **grids**, and a nonogram at 1.75× is not a
more readable nonogram — it is one that no longer fits a page. Where large
print genuinely helps here is the hints and the answers, and those are on the
companion page as selectable text at whatever size the reader's own browser is
set to.

**No Kindle edition, and never KDP Select.** Select is exclusivity and would
forbid the direct ebook this book's whole companion bridge depends on. *Codex
Mythologica* — a different book with a confusingly similar name — is the
catalogue's cautionary case: its Kindle edition is enrolled, which is exactly
why it cannot be sold direct.

## 8 · The cover

The illustration is OpenAI `gpt-image-1` output, one call on 2026-09-05 for
**$0.4992** against a $4.00 cap, made through the house wrapper that never logs
the key and writes every call to a ledger. The prompt forbids **all writing**,
in as many ways as a prompt can, and the model drew none — because an image
model cannot spell, and a cover whose title is an approximation of the title is
a cover that gets thrown away.

Every word on the jacket is typeset by `BUILD/build_cover.py` from
`project_config.json` — the same strings the catalogue and the interior use.
The title block is sized to the artwork's **measured** calm band: a per-row
contrast profile puts it in the top fifth, and the first render, which set
`Mythologica` at 95 pt and ran the sub-title across the carved tablet, was
unreadable.

Declared to KDP as **images: generated**, which is the truthful answer.

## 9 · The companion

`/companion/codex-puzzles`, and it is not a leaflet.

- **Ten puzzles that are not in the book** (101–110), through the same solver
  gate: each solved independently to exactly one answer. A free sample that is
  wrong tells a reader what the paid book is like.
- **All 330 hints**, in the same three passes the book prints them in.
- **The filled grids** — eleven word fits and nine pictures.
- **An answer checker** that hashes the reader's guess in their own browser
  against a truncated digest. Not security: every answer is printed in the
  book. Tact — so that opening the page does not spoil a hundred puzzles.

## 10 · The merge, the deployment, and what is actually live

**2026-09-06.** The Founder authorised the merge and production activation.

### The merge

`feature/public-domain-phase-2` → `main`, **fast-forward**, `2b16865..48d3e5f`.
No squash, no force, no history rewritten, nothing overwritten: `origin/main`
was an ancestor of the branch, so the merge could only add. The branch was
pushed to its own remote first as a backup.

The branch carries more than this book — it is the programme's integration
branch, and `main` was 61 commits behind it. Merging therefore also advanced
main to the finished Phase 1 and Phase 2 work. That work is not deployed
*visibly*: all five Phase 2 public-domain books are `draft` in the catalogue and
do not render a public page. The 16 published books are the 15 that were already
live plus this one. Nothing was demoted.

The other session's uncommitted work — four `src/components/*` files,
`docs/execution/mobile/`, `images/assets/` and two phase-5 documents — was left
exactly as found and is not in the merge.

### The deployment

Pushing `main` triggered Vercel's git integration, as the Phase 1 record
describes. Production deployment **`dpl_GKN7PGPLBG2ogh6tLwuP292qbbTj`**, target
`production`, state **READY**, from commit `48d3e5f`, aliased to
`valicepress.com`.

### What is live, measured on the public URL

| Route | Status |
|---|---|
| `/` · `/ebooks` · `/books` · `/categories` · `/search` · `/cart` | **200** |
| `/companion/codex-puzzles` | **200** — the page, its hints, the filled grids and the checker |
| `/companion/codex-puzzles/answers.json` | **200** · 25,687 B · `application/json` |
| `/companion/codex-puzzles/hint-cards.pdf` | **200** · 89,548 B · `application/pdf` |
| `/companion/codex-puzzles/solution-grids.pdf` | **200** · 87,732 B · `application/pdf` |
| `/companion/codex-puzzles/extra-puzzles.pdf` | **200** · 174,840 B · `application/pdf` |
| `/books/codex-mythologica-the-puzzle-book` | **404 — see below** |

Every companion byte count matches the built file exactly.

`/account/library` returns 404 to an anonymous request because it is behind
authentication; that is the route working, not failing.

### Fulfilment, verified without a purchase

| Link | Result |
|---|---|
| Paddle price `pri_01m1sbkq3qsjyfx3tzwctay664` | **200 · active · 1199 USD · one-time** on the live account |
| R2 `books/codex-mythologica-the-puzzle-book/master/v1/` | both objects present |
| Signed URL — same call shape and 600 s TTL as `src/lib/storage/index.ts` | **HTTP 200** on both |
| The file a buyer receives | `master.epub` **1,920,020 B**, `application/epub+zip`, ZIP magic `PK` · `master.pdf` **374,701 B**, `application/pdf`, `%PDF` |

No transaction was created and none is claimed.

### The one thing standing between this book and its public page

**The production catalogue row has not been written.** The site prerenders
`/books/<slug>` from the database at build time, and there are two Neon
databases on the same host and credentials: `bookstore`, which every local
`.env` points at, and **`neondb`, which the site actually reads.** This trap has
now caught three sessions and is recorded in the Phase 1 report.

Everything up to the write is done and verified: the environment was pulled with
`vercel env pull`, the loader confirms `target database : neondb`, and its dry
run is clean — `catalog integrity : OK`, 21 books, 55 formats, this book
`published · 4 formats · 1 buyable`, the five Phase 2 books `draft`, nothing
demoted.

The write itself was refused by this environment's permission classifier, which
is correct behaviour for a production database. It is one command:

```
node scripts/catalog/load-catalog.mjs \
  --env scripts/tmp/.env.production --commit --i-know-this-is-production
```

Then the deployment must be rebuilt so the page is prerendered against the new
row — a redeploy of `48d3e5f`, which is how Phase 1 did it.

Until that runs, this book is **merged and deployed but not publicly listed**,
and this report does not call it live.

---

## 11 · What is left, and who has to do it

Everything remaining is an account-holder action. Nothing waits on work.

1. **KDP upload — paperback, then hardcover.** Two interiors, two wraps, all
   four preflight clean. `KDP/KDP_UPLOAD_GUIDE.html` carries three full format
   sections plus one on why there is no large print, with every field, every
   filename, every measured dimension and the files *not* to upload.
2. **The AI declaration.** Text **generated** and images **generated**, both
   recorded with their evidence; the declaration is made on a person's KDP
   form. `compliance-lint` fails on exactly that one line.
3. **Gate 2 signature** on six assessed-clean rights rows.
4. **Paddle `ebooks` tax category** — the product was created as `standard`
   because this account is not approved; same pending request as seven others.
5. **ISBN** — none assigned; each format needs its own.
6. **Proof copies, both formats.** First print of both interiors and both
   covers; the hardcover's case wrap folds around board and that fold is not
   visible on screen.
7. **Deploy.** The storefront page, the companion and the cover are on
   `feature/public-domain-phase-2` and reach production when that branch is
   merged — which the 2026-09-05 instruction defers to the Founder.
