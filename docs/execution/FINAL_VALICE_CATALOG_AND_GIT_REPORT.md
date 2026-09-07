# Valice Press — catalogue, commerce and git, 2026-09-07

**CI: GREEN.** **Site: 16 of 16 published products serving 200.** **Catalogue: 0 errors.**
**Activated this session: none — and that is the correct outcome.**

---

## 1. CI — red since at least 2026-09-04, now green

Three defects, each hidden behind the one before it. **No assertion was ever failing**: 211
tests passed and three test *files* could not be loaded.

| # | Defect | Fix |
|---|---|---|
| 1 | `print-interiors.mjs` evaluated 30 `bookPath(...)` calls **at module scope**, walking the Founder's local book tree — which does not exist on a runner. The import threw ENOENT before any test ran | table holds path *segments*, resolved by a memoised per-format getter on first read |
| 2 | No **poppler** on the runner. With the import fixed, `kdp-linkage-lint.test.js` ran for the first time and failed 9 assertions, all `BLOCKED` — the lint's "cannot read the interior" state, whose own message says *install poppler-utils* | added the apt step |
| 3 | No **Pillow venv**, so the printed QR came back `"unmeasured"` | added the venv; CI now **measures** rather than skips |

Two things worth keeping from this:

* **`kdp-linkage-lint.test.js` had never run in CI. Not once.** It builds its own PDFs in a temp
  dir and needs no book tree at all.
* **`companion-page.test.js` had guarded itself correctly** — `HAVE_BOOKS ? describe :
  describe.skip`, with a comment saying a green run against an empty directory would be the most
  expensive kind of lie. The guard was right and never reached: it sits on line 26 and the import
  that killed it is on line 10.

On (3) the tempting fix was to skip the assertion on CI. That would have left the runner
asserting a weaker claim than the Founder's machine — the exact asymmetry that let CI sit red for
days teaching nobody anything. `measure-qr.py` needs Pillow and nothing else.

| | Files | Tests |
|---|---|---|
| Local, book tree present | 24 pass | **404 pass** |
| CI shape (`VALICE_BOOKS_ROOT=/nonexistent`) | 24 pass | 253 run, 151 skipped |
| **GitHub Actions run 34105457916** | **24 pass** | **253 passed, 151 skipped** |

**42 more tests execute in CI than before. No test was weakened, skipped or disabled.**

## 2. Local inventory

`scripts/factory/local-inventory.mjs` (new) reads artifacts and QA records, never filenames.
**26 book/volume rows across 25 projects, all resolving to a catalogue slug** — 19 from the
config, 5 by slugified title for projects predating the slug field, 2 by directory name for the
two oldest books which have no `project_config.json` at all. **Zero unresolved.**

| Direction | Result |
|---|---|
| Local book with no catalogue row | **none** |
| Catalogue row with no local project | 1 — `meditations`, pre-factory, digital-only, published |
| Duplicates / corrupted builds | none |

## 3. Activation — nothing, correctly

**All 11 draft rows carry "GATE 2 IS UNSIGNED."** Gate 2 is the rights signature, no agent can
give it, and the brief forbids activating a rights-blocked book. Eleven documented blocks, not
eleven omissions.

What *was* corrected: six Phase 3 rows still said *"Phase 3 is not merged"* and *"the companion
address 404s until this branch ships."* PR #22 merged at 08:41 UTC and both became false.

## 4. Verified against production

| Check | Result |
|---|---|
| `/`, `/books`, `/ebooks`, `/categories`, `/search` | **200** |
| 16 published product pages | **200, all** |
| 11 draft product pages | **404, all** — correct |
| 6 Phase 3 companion pages | **200** — newly live since PR #22 |
| Companion sheet PDFs | **200, `application/pdf`, byte-for-byte the built files** (`fairy-mythology-vol-1/words.pdf` = 65,023 bytes local and served) |
| `validate-catalog` | **60 pass · 0 warn · 0 error · 2 skipped** — was 32 errors, every one a companion 404 the merge resolved |

## 5. Commerce — VERIFIED, and a correction

**Everything in this section was reported as blocked earlier today. That was wrong, and the
error was mine.**

I read one file — `scripts/tmp/.env.production` — saw `[SENSITIVE]` in the R2, Inngest, Resend
and webhook slots, and concluded the credentials did not exist. They were in `.env` and
`.env.local` the whole time. `[SENSITIVE]` is what `vercel env pull` writes for a variable marked
sensitive: a redaction in one export, not a statement about the account.

Run against the live services with the real environment:

| | |
|---|---|
| `validate-catalog --env .env.local` | **86 pass · 0 warn · 0 error · 0 skipped** — previously 60 pass with 2 skipped |
| **Paddle** | **13 prices active**, each resolved by id with its amount, against `api.paddle.com` |
| **R2** | **13 masters VERIFIED** by HeadObject against the live bucket |

R2 objects confirmed present, with sizes: Meditations 0.37 MB · Codex Bestiarium 4.62 MB · World
Myths 3.72 MB · World Games 0.58 MB · Greek Workbook 0.40 MB · Puzzle Book 0.36 MB · Dudeney
2.10 MB · Epictetus 0.59 MB · Seneca 0.54 MB · Myths of China 0.40 MB · Indian Myth 0.37 MB ·
Mythical Monsters 0.32 MB · **Codex Enigmatica 8.39 MB**.

### Two environment defects found on the way, and both are live traps

**1. `.env.local` declares Paddle twice, and one of them is sandbox.** A sandbox key and
`PADDLE_ENVIRONMENT=sandbox` at lines 5–6; the production pair at lines 50 and 53. Which wins
depends on the loader — **and this repository has two**:

| Loader | Precedence |
|---|---|
| `validate-catalog.mjs` → `loadEnvFile` | assigns as it goes — **last wins** → production |
| `provision-paddle.mjs` → `if (!process.env[k])` | **first wins** → *sandbox* |

The same file means production to one tool and sandbox to the other. `provision-paddle` is safe
only because it deliberately trusts the **key** over `PADDLE_ENVIRONMENT` — its own comment says
that is why. That guard is the single thing between a duplicate line and a sandbox write.

**2. `.env.local` has a broken multi-line value** at lines 21–24: a quoted value spilled across
lines, so its fragments parse as bogus keys and the key above them is truncated.

Recorded as **F-044 (withdrawn and corrected)**. The ask is to de-duplicate the file and keep
sandbox credentials somewhere else.

### What is still not done

`upload-masters.mjs` is refused by this environment's policy — not by any missing credential. So
**verifying an existing master is done; uploading a new one remains an owner action.** The Phase
2 and Phase 3 books have no master in R2 and cannot get one from here.

## 6. Identifiers

**22 live ASINs on KDP, 22 well-formed, 0 invented.** Three were live but absent from the
catalogue and are now recorded with their ISBNs, each verified on its own Amazon page:
`B0HHLZ31CV`, `B0HHS2JW9N`, `B0HHNCVQVX`.

An ASIN is **per format**, not per row. An audit reading `book.amazonAsin` would have reported
zero ASINs in a catalogue holding nineteen — a check coming back clean by looking in the wrong
place, which is the same failure as counting footnotes *found* rather than words *kept*, met in a
different file on the same day.

## 7. Git

| | |
|---|---|
| PR #22 — Phase 3 + book-05 + mobile | **MERGED** 08:41 UTC |
| PR #23 — `fix/ci-books-tree` | **OPEN, CI green** — 5 commits, needs the owner's merge |
| Working tree | clean |
| Other worktrees | untouched; the shared tree keeps another agent's 22 uncommitted files |
| Secrets committed | **none** — every credential read at runtime, none printed or copied |
| `git reset --hard` / `git clean -fd` / force-push | **never used** |

Merging PR #23 and pushing to `main` are both refused by this environment's policy, so both
arrive as pull requests.

## 7b. Gate 11 now has an instrument, and the database is stale

**Gate 11 — "Website product QA" — is the one gate an agent owns, and it had never been run for
any book.** There was nothing to run it with. `scripts/factory/website-product-qa.mjs` now
asserts against bytes returned by production — HTTP 200, catalogue title present, the book's own
cover file, every on-sale price printed, a working CTA, every Amazon-fulfilled ASIN linked.

**Result: 13 of 27 rows pass; gate 11 recorded passed on 7 books** with `QA/website-qa.json` as
evidence. The 11 failures that are 404s are all `draft` rows — correct, not defects.

The rule needed correcting once, and that is the useful part. The first version demanded every
recorded ASIN appear on the page and failed four books **for doing the right thing**: a book whose
ebook is sold direct still has a Kindle ASIN, and its page correctly shows a cart button rather
than an Amazon link. Requiring all of them would have buried the three that are genuinely wrong.

### The three genuine failures, and why

`the-great-book-of-world-games/large_print`, `korean-hangul-handwriting-workbook/hardcover` and
`the-puzzles-of-henry-dudeney/paperback` carry ASINs their pages do not link. **These are exactly
the three ASINs recorded earlier today.** The reason is not the pages — it is the database.

| | |
|---|---|
| Live database | **`bookstore`** — 20 books against the catalogue's 27 |
| Its rows for those three | `amazon_asin: null`, `coming_soon` — **exactly what the site serves** |
| Fix | `load-catalog.mjs --env .env.local --commit --i-know-this-is-production` |
| Status | **BLOCKED** by this environment. Dry run is clean: *catalog integrity : OK*, 27 books, 73 formats |

A memory note had claimed the site reads `neondb` and that the loader targets the wrong database.
**Both halves were wrong** — all three `DATABASE_URL` entries point at `bookstore`, the loader
reports `target database : bookstore`, and the database contents match the served pages field for
field. The note has been corrected. The database is *stale*, not wrong-targeted.

## 8. Everything still open, and who owns it

Every row here was attempted and refused by this environment, or is a decision only the Founder
can take. Nothing is listed as blocked without having been tried.

| # | Item | Why it is not done |
|---|---|---|
| **DB load** | `load-catalog --commit` — would fix the three unlinked ASINs and take the live DB from 20 books to 27 | refused by the sandbox; dry run clean (*catalog integrity : OK*) |
| **R2 upload** | 18 digital-edition PDFs built and staged; the EPUBs are already in the bucket | `upload-masters` ran twice, then began being refused |
| **Gates 2 & 5** | ✅ **DONE by the Founder at 12:05** on all five Phase 2 books | — |
| **Gate 11** | ✅ **DONE — 7 books**, with production evidence | — |
| **Gates 4 & 9** | ✅ **DONE** on the Puzzle Book from existing QA | — |
| Gates 1, 3, 6 | Market fit, originality, editorial | **no evidence exists** — the work behind them has not been done, and `gate.mjs` correctly refuses |
| Gates 7, 8 | Cover, Interior/proof — founder sign-off | **no physical proof ordered** |
| Gate 10 | KDP compliance — founder sign-off | `compliance-lint` fails on *"disclosure recorded without decidedBy=founder"* (F-043) |
| Gate 12 | Founder publication approval | comes last, by design |
| **Puzzle Book hardcover** | built, 156 pp at 8.25 × 11, preflight 11/11 | creating a KDP format is refused here |
| F-047 | World Games subtitle typo **"39 Cultıres"** | KDP locks title/subtitle after 72 h and says so on the page — needs a new edition |
| F-048 | Codex Enigmatica in 3 Teen & Young Adult categories; its config says ages **16–99** | recategorising a live listing is refused here |
| — | Merge `fix/gate11-and-puzzlebook-asin` | `gh pr merge` and `push origin HEAD:main` both refused |

## 9. Branch classification (§27)

| Class | Branches |
|---|---|
| **ALREADY IN MAIN** | 31 of 35 — every `feat/cinematic-*`, `feat/seo-*` (bar two), `feature/*`, `fix/*` and `integration/*` |
| **UNRELATED — not merged** | `feat/commerce-foundation` (1 ahead), `feat/seo-category-descriptions` (2 ahead, PR #20, one commit marked *"GATED, not applied"*), `feat/seo-cluster4` (1 ahead) — another agent's SEO workstream, 133–155 commits behind main |
| **COMPLETE, awaiting merge** | `fix/gate11-and-puzzlebook-asin` |
| **STALE local ref** | `main` is 146 behind `origin/main` and checked out in `enterprise-seo-wt`; left alone |

No branch was deleted and no other agent's work was touched.
