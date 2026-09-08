# Master book inventory — 2026-09-08

**27 catalogue books · 73 (book, format) rows · 25 local projects · 23 live KDP listings ·
16 books serving 200 on valicepress.com.**

> **SUPERSEDED AGAIN, 2026-09-08.** Nine KDP editions were driven to the line where
> publishing becomes a legal attestation and now sit as **Draft — pending owner
> confirmation**: seven paperbacks (Seneca 156 pp, Myths and Legends of China 112 pp,
> Indian Myth and Legend 94 pp, Mythical Monsters 74 pp, Games Ancient and Oriental
> 78 pp, Korean Games 144 pp, the Greek Alphabet Workbook 100 pp) and the Codex
> Mythologica Puzzle Book hardcover; the Myth Hunter's hardcover (F-051, 8.25 × 11)
> has its cover, ISBN and AI declaration in place and is blocked only on one 33 MB
> interior upload. Two more paperbacks are blocked on KDP's weekly title-creation
> limit. Both Kindle-matched direct ebooks came down to **$9.99**. Every image on
> valicepress.com was 404 for part of the day and is now verified back. Four books
> were found to be printing raw HTML in their apparatus and were rebuilt. Read
> [EXPANDED_DISTRIBUTION_EXECUTION_REPORT.md](../30-kdp/EXPANDED_DISTRIBUTION_EXECUTION_REPORT.md)
> §20–26 first; where it disagrees with anything below, it is later and it was measured.
>
> **SUPERSEDED AGAIN, 2026-09-07 night.** Eleven of the books this file calls DRAFT are on
> sale: 27 published, 24 buyable direct ebooks, 24 Paddle products, and the Myth Hunter's
> hardcover — §10's single BLOCKED row — is built. `validate-catalog` reads 127 pass / 0
> error. Read
> [EXPANDED_DISTRIBUTION_EXECUTION_REPORT.md](../30-kdp/EXPANDED_DISTRIBUTION_EXECUTION_REPORT.md)
> first; where it disagrees with anything below, it is later and it was measured.
>
> **SUPERSEDED IN PART, 2026-09-07 evening.** Every project now carries a gate record (25, up
> from 13) and the board reads 146 passed / 79 in_progress / 75 not_started. §13's "12 projects
> with no gates.json" is closed. Four live Amazon listings were found to overstate a count
> (F-052). Read
> [FINAL_CATALOG_DISTRIBUTION_REPORT.md](FINAL_CATALOG_DISTRIBUTION_REPORT.md) and
> [GATE_12_RELEASE_POLICY.md](../00-critical/GATE_12_RELEASE_POLICY.md) for the current state;
> where they disagree with this file, they are later.

Every status below was measured, not read off a manifest. Valice status comes from an HTTP
request to production; KDP status from the KDP Bookshelf read in a browser; Paddle and R2 from
the live accounts; page counts, trims and fonts out of the PDFs themselves. Where something
could not be established it says `UNVERIFIED` and why. **There are no UNKNOWN rows.**

> **Why measurement rather than manifests.** `docs/execution/phase-5/kdp-packages/INDEX.json`
> was the obvious source for "is this edition built?". Thirty-five of its interior and cover
> paths did not resolve — some naming a `CODEX_BESTIARIUM/` directory that has never existed.
> An earlier pass of this audit read that file and reported eight built editions as having
> neither interior nor cover. All 35 paths are repaired in this pass; the lesson is in §15.

---

## 1. Summary

| | |
|---|---|
| Catalogue books | **27** |
| (book, format) rows | **73** |
| Local book projects | **25** (+1 catalogue row with no project: `meditations`, pre-factory, digital-only) |
| Live on valicepress.com | **16 books**, 46 format rows |
| Live on KDP | **23 listings** across 12 titles (20 LIVE, 3 LIVE · updates in review) |
| Ready to upload to KDP | **8** — every one held by an unsigned Founder gate, not by a missing file |
| F-049 print packages | **8 READY, 1 BLOCKED** |
| Paddle | 19 active products, **14 of 14** direct-sold books price-matched to the cent |
| R2 | every master present; 3 oversized and deliberately so |
| Blocked by a Founder signature | **14 rows** on gates 7, 8 and 10 |

## 2. Local books

| Book | Family | Project path | Formats | Valice | KDP live |
|---|---|---|---|---|---|
| `book-of-were-wolves` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/03-BOOK-OF-WERE-WOLVES` | 3 | DRAFT | 0/3 |
| `british-goblins` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/04-BRITISH-GOBLINS` | 3 | DRAFT | 0/3 |
| `chess-and-playing-cards` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/03-CHESS-AND-PLAYING-CARDS` | 2 | DRAFT | 0/2 |
| `codex-bestiarium` | ROADMAP-BOOKS | `ROADMAP-BOOKS/CODEX-BESTIARIUM` | 4 | LIVE | 4/4 |
| `codex-enigmatica` | ROADMAP-BOOKS | `ROADMAP-BOOKS/CODEX-ENIGMATICA` | 3 | LIVE | 3/3 |
| `codex-mythologica` | ROADMAP-BOOKS | `ROADMAP-BOOKS/CODEX-MYTHOLOGICA` | 4 | LIVE | 4/4 |
| `codex-mythologica-the-puzzle-book` | ROADMAP-BOOKS | `ROADMAP-BOOKS/04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK` | 4 | LIVE | 1/4 |
| `epictetus-discourses-and-enchiridion` | ROADMAP-BOOKS | `ROADMAP-BOOKS/05-EPICTETUS-DISCOURSES-AND-ENCHIRIDION` | 2 | LIVE | 0/2 |
| `fairy-mythology-vol-1` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/05-FAIRY-MYTHOLOGY` | 3 | DRAFT | 0/3 |
| `fairy-mythology-vol-2` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/05-FAIRY-MYTHOLOGY` | 3 | DRAFT | 0/3 |
| `games-ancient-and-oriental` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/01-GAMES-ANCIENT-AND-ORIENTAL` | 2 | DRAFT | 0/2 |
| `greek-alphabet-handwriting-workbook` | ROADMAP-BOOKS | `ROADMAP-BOOKS/02-GREEK-ALPHABET-HANDWRITING-WORKBOOK` | 4 | LIVE | 0/4 |
| `indian-myth-and-legend` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/04-INDIAN-MYTH-AND-LEGEND` | 2 | LIVE | 0/2 |
| `korean-games` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/02-KOREAN-GAMES` | 2 | DRAFT | 0/2 |
| `korean-hangul-handwriting-workbook` | ROADMAP-BOOKS | `ROADMAP-BOOKS/01-KOREAN-HANGUL-HANDWRITING-WORKBOOK` | 3 | LIVE | 2/3 |
| `kwaidan` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/01-KWAIDAN` | 3 | DRAFT | 0/3 |
| `mancala` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/04-MANCALA` | 1 | DRAFT | 0/1 |
| `meditations` | (no local project) | `—` | 1 | LIVE | 0/1 |
| `mythical-monsters` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/05-MYTHICAL-MONSTERS` | 2 | LIVE | 0/2 |
| `myths-and-legends-of-china` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/03-MYTHS-AND-LEGENDS-OF-CHINA` | 2 | LIVE | 0/2 |
| `sea-monsters-unmasked` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PHASE-3-BOOK/02-SEA-MONSTERS-UNMASKED` | 3 | DRAFT | 0/3 |
| `seneca-selected-dialogues` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES` | 2 | LIVE | 0/2 |
| `the-great-book-of-world-games` | ROADMAP-BOOKS | `ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-GAMES` | 4 | LIVE | 4/4 |
| `the-great-book-of-world-myths` | ROADMAP-BOOKS | `ROADMAP-BOOKS/THE-GREAT-BOOK-OF-WORLD-MYTHS` | 4 | LIVE | 3/4 |
| `the-myth-hunters-field-book` | ROADMAP-BOOKS | `ROADMAP-BOOKS/THE-MYTH-HUNTERS-FIELD-BOOK` | 3 | LIVE | 1/3 |
| `the-puzzles-of-henry-dudeney` | ROADMAP-BOOKS | `ROADMAP-BOOKS/03-THE-PUZZLES-OF-HENRY-DUDENEY` | 2 | LIVE | 1/2 |
| `traditional-games` | PUBLIC-BOOKS | `PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK/05-TRADITIONAL-GAMES` | 2 | DRAFT | 0/2 |

## 3. Live on Valice

* `codex-bestiarium`
* `codex-enigmatica`
* `codex-mythologica`
* `codex-mythologica-the-puzzle-book`
* `korean-hangul-handwriting-workbook`
* `the-great-book-of-world-games`
* `the-great-book-of-world-myths`
* `the-myth-hunters-field-book`
* `the-puzzles-of-henry-dudeney`

…plus the seven in §6 that are live on the site but have no Amazon edition.

## 4. Live on KDP

Twelve titles, 23 format listings, every price reconciled against the catalogue with **zero
drift**. Three carry a pending metadata update (*"Live · Updates in review"*): Codex Enigmatica
hardcover, Hangul hardcover, World Games large print.

## 5. Live on both — set D (9)

* `codex-bestiarium`
* `codex-enigmatica`
* `codex-mythologica`
* `codex-mythologica-the-puzzle-book`
* `korean-hangul-handwriting-workbook`
* `the-great-book-of-world-games`
* `the-great-book-of-world-myths`
* `the-myth-hunters-field-book`
* `the-puzzles-of-henry-dudeney`

## 6. Ready for Valice — set B, live on Valice with no Amazon edition (7)

* `epictetus-discourses-and-enchiridion`
* `greek-alphabet-handwriting-workbook`
* `indian-myth-and-legend`
* `meditations`
* `mythical-monsters`
* `myths-and-legends-of-china`
* `seneca-selected-dialogues`

`meditations` is digital-only by design. The other six each have a print edition promised as
*coming soon*; see §11 and §12.

## 7. Ready for KDP

**Eight editions have a complete, preflight-clean package on disk** (§11). None is *ready to
publish*: all eight fail the same three gates — 7 (Cover), 8 (Interior/proof) and 10 (KDP
compliance) — which are Founder sign-offs and which no agent may give.

## 8. Ready for both — set E (0)

Empty, and the reason is one thing: **gate 12 (Founder publication approval) has never been
passed for any book in this house**, including the twelve already selling.

## 9. Not ready — set F (11)

* `book-of-were-wolves`
* `british-goblins`
* `chess-and-playing-cards`
* `fairy-mythology-vol-1`
* `fairy-mythology-vol-2`
* `games-ancient-and-oriental`
* `korean-games`
* `kwaidan`
* `mancala`
* `sea-monsters-unmasked`
* `traditional-games`

## 10. Blocked — set G (1)

* `the-myth-hunters-field-book`

`the-myth-hunters-field-book` hardcover. Not an oversight: the project's own
`project_config.json` records **TEK FORMAT: ciltsiz** — single format, paperback — because
*"an activity book is written in"*, and `DECISIONS.md` carries **A5**, *"will a hardcover gift
edition go into v1.0"*, as **AÇIK (varsayım: hayır)** — open, assumption no. The catalogue
advertises the hardcover as *coming soon* anyway. See F-051 in §15.

## 11. F-049 results

| # | Book / format | Trim | Pages | Interior sha256 | Cover sha256 | State |
|---|---|---|---|---|---|---|
| 1 | `the-myth-hunters-field-book`/hardcover | 8.25×11 | — | — | — | **BLOCKED** |
| 2 | `greek-alphabet-handwriting-workbook`/paperback | 8.5×11 in | 100 | `3230cc14bda3f366` | `7bc1d8390e90212b` | **READY** |
| 3 | `greek-alphabet-handwriting-workbook`/hardcover | 8.25×11 in | 100 | `133fd418c0f4c8bb` | `34280382abbb9ac4` | **READY** |
| 4 | `codex-mythologica-the-puzzle-book`/hardcover | 8.25×11 in | 156 | `e73a2a6a7840bf00` | `cbab0509f02fab57` | **READY** |
| 5 | `epictetus-discourses-and-enchiridion`/paperback | 6×9 in | 176 | `e1a3940ffdddf100` | `a58288f5a8d1f4cd` | **READY** |
| 6 | `seneca-selected-dialogues`/paperback | 6×9 in | 154 | `f06fea37a5d083f0` | `401cb2e3b4f7391d` | **READY** |
| 7 | `myths-and-legends-of-china`/paperback | 6×9 in | 108 | `f4738f2a4e0474bb` | `ab0d20db521e50f3` | **READY** |
| 8 | `indian-myth-and-legend`/paperback | 6×9 in | 94 | `0ac86524968a8782` | `08357e8714454de0` | **READY** |
| 9 | `mythical-monsters`/paperback | 6×9 in | 74 | `a97c3e4abbd3e7c1` | `6e70f7f22244378e` | **READY** |

**What F-049 actually was.** The item read "nine print editions priced on live pages with
nothing built behind them." Eight of the nine had a finished interior and cover the whole time —
the earlier report had read the stale package index instead of the disk. What was really wrong
was different and worse:

| Defect | Found on | Fix |
|---|---|---|
| `Helvetica` declared and **not embedded** | 4 covers | re-emitted with no font resource |
| PDF metadata `untitled` / `anonymous` | the same 4 | real title and author set |
| Wrap built for **156 pages against a 154-page interior** | Seneca | rebuilt at 154 |
| `measured.pages.paperback` wrong | Seneca (156→154), Mancala (null→38) | corrected |
| `trimPaperback` null, so no wrap could be sized | China, Indian, Mythical Monsters | 6×9 recorded, measured off the interiors |

A non-embedded base-14 face is **the exact defect KDP has already rejected on this account**
(Codex Enigmatica). All four would have been rejected at upload.

## 12. Missing formats

| Blocker | Rows | Who owns it |
|---|---|---|
| no built package (not in the F-049 set and no interior/cover found) | 18 | agent — build it |
| book is draft on the site | 16 | Founder — websiteStatus is a data edit |
| no gates.json — never entered the gate system | 14 | agent — generate; Founder signs |
| gate 7 (cover) not passed | 14 | **Founder** — sign-off gate |
| gate 8 (interior/proof) not passed | 14 | **Founder** — sign-off gate, physical proof |
| gate 10 (KDP compliance) not passed | 14 | **Founder** — sign-off gate |
| no gates.json | 13 | agent — generate; Founder signs |
| no Paddle product provisioned | 8 | agent — provision-paddle.mjs |
| no R2 master key | 8 | agent — upload-masters.mjs |
| no price | 5 | Founder — price-engine proposes, Founder decides |
| gate 2 (rights) unsigned | 2 | **Founder** — rights signature |
| no interior and no cover exist | 1 | Founder — decision A5 |

## 13. Gate status — CLOSED 2026-09-07

**Was:** 64 of 156 cells passed across 13 projects, with twelve more projects — five of them
live and selling — carrying no `gates.json` at all.

**Now:** **146 passed · 79 in_progress · 75 not_started, across 25 projects, all on one model.**
Every book project has a record. `scripts/factory/backfill-gates.mjs` built them from the
canonical definition and attached evidence that already existed; nothing was back-dated and no
Founder gate was set `passed`. Evidence-in-hand on a Founder gate reads `in_progress` with the
reason saying the signature is what is missing.

Gate 12 is `not_started` on all 25 and that is now a decision rather than a gap — see
[GATE_12_RELEASE_POLICY.md](../00-critical/GATE_12_RELEASE_POLICY.md).

## 14. Paddle / R2 / fulfillment

| Check | Result | How |
|---|---|---|
| Paddle webhook | active, **4 of 4** events subscribed | `api.paddle.com` |
| Active Paddle products / prices | 19 / 19 | live account |
| Direct-sold books price-matched | **14 of 14**, to the cent | live account vs catalogue |
| Paddle products provisioned but parked | **5** — the Phase-2 books | ids live in `blockers` prose **on purpose**; `valice-catalog.test.ts` forbids the field on a row whose ebook is not available, because a live id on a row that is not for sale fails at the till rather than at load |
| R2 masters | all present; `upload-masters` reports every key `SAME` | live bucket |
| Oversized masters | 3 — Bestiarium 103.9 MB, World Myths 93.0 MB, Enigmatica 67.5 MB | deliberate: the small ones were ghostscript output that dropped 845 non-ASCII characters |
| Watermark cost | 103.9 MB → **606 MB peak RSS**, 0.6 s | measured, one process per file |
| `R2_BUCKET_ARTIFACTS` | **empty in `.env` and `.env.local`** | a local-only gap; production has its own value |

## 15. Exact solutions for every blocker

| # | Blocker | Exact next action | Owner |
|---|---|---|---|
| 1 | 8 editions built and preflight-clean, gates 7/8/10 unsigned | order a proof, then `gate.mjs <project> set 7\|8\|10 passed --evidence <file> --owner founder --approved-by founder` | Founder |
| 2 | Gate 12 never passed for any book | decide whether gate 12 governs publication; if it does, sign it for the twelve already live | Founder |
| 3 | 12 projects with no `gates.json` | run `new-project.mjs`-style generation and back-fill from existing evidence | agent, then Founder signs |
| 4 | 11 draft books not on the site | `websiteStatus: "published"` in `valice-catalog.mjs`, then `load-catalog --commit` | Founder |
| 5 | 5 Phase-2 Paddle ids parked | nothing — this is correct until the ebooks become `available` | — |
| 6 | Fairy Mythology, British Goblins, Were-Wolves, Sea Monsters: no Paddle, no R2 master | `provision-paddle.mjs --commit`, then `upload-masters.mjs --commit` | agent |
| 7 | Myth Hunter's hardcover promised, never built, decision open | **F-051**: answer A5. If no, set the format `not_applicable` and the promise comes off the page; if yes, it needs an 8.25×11 interior build | Founder |
| 8 | 4 Phase-1 covers had unembedded Helvetica | **done** — `COMMON-AREA/covers/rewrap_clean.py`, all four now preflight clean | — |
| 9 | `build_book_covers.py` trusted a recorded page count | **done** — it measures the interior and refuses on disagreement | — |
| 10 | `kdp-packages/INDEX.json` had 35 dangling paths | **done** — all resolve; each repair records what it was | — |
| 11 | Two diverged `COMMON-AREA` trees | five files differ (`check_quotes.py`, `CONVENTIONS.md`, `build_handbook.py`, `kdp_geometry.json`, `README.md`). The two geometry tables **agree on every shared row** and the root is a superset (16 rows vs 2). The other four need a read before merging | agent, next session |
| 12 | World Games large print subtitle typo *"39 Cultıres"* | KDP locks the subtitle 72 h after publication — needs a new edition (F-047) | Founder |
| 13 | Codex Enigmatica shelved under *Teen & Young Adult* | move to *Humor & Entertainment › Puzzles & Games*; leave reading age blank (F-048) | Founder |

## 16. Recommended execution order

1. **Answer A5** (F-051). One line either way, and it decides whether a live page keeps
   advertising a book nobody is building.
2. **Sign gates 7, 8 and 10 on the eight ready editions** — or say which need a physical proof
   first. This is the only thing between eight finished packages and a KDP upload.
3. **Generate `gates.json` for the twelve projects that have none**, five of which are selling.
   An agent can generate and back-fill; the signatures stay yours.
4. **Decide gate 12's meaning** before it is signed for anything.
5. Then, and only then, the distribution phase: upload the eight, and take the draft books
   through publication as data.

---

*Generated 2026-09-07. Sources: the filesystem, valicepress.com, the KDP Bookshelf,
api.paddle.com and the R2 buckets. Machine-readable form: `scripts/tmp/matrix.json`.*
