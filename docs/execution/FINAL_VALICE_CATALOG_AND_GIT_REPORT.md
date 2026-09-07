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

## 5. Commerce

**Paddle — VERIFIED.** `pri_01m1v4n80k6g2tba6wt8882ehf` resolved against `api.paddle.com`:
active, correctly named, $8.99. Phase 2's five products and prices are live.

**R2, Inngest, Resend, Paddle webhook — UNVERIFIED, and blocked.** All six `R2_*` values, both
Inngest keys, both Resend keys and `PADDLE_WEBHOOK_SECRET` are the literal placeholder
`[SENSITIVE]` in `scripts/tmp/.env.production`. Real and used: `DATABASE_URL`,
`CLERK_SECRET_KEY`, `PADDLE_API_KEY`, `OPENAI_API_KEY`. **F-044.**

So no master could be uploaded and fulfillment could not be exercised end to end. It is also the
right order: an R2 master is the file a paying customer downloads, and none of these books can be
bought until Gate 2 is signed. `upload-masters.mjs` reports every object as "(new)", but with
placeholder credentials it cannot list the bucket — **that is not evidence of absence** and is
no longer treated as evidence at all.

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

## 8. Everything still open, and who owns it

| # | Item | Owner |
|---|---|---|
| Gate 2 | Rights signature — **all 11 draft books** | Founder |
| F-036 | Phase 3 prices are engine recommendations, unapproved | Founder |
| F-043 | AI disclosure written as the standing house answer, not a decision taken | Founder |
| F-044 | R2 / Inngest / Resend credentials are placeholders | Founder |
| F-045 | Three live defects on the World Games large print listing | Founder |
| F-046 | Puzzle Book **Publish** click; Codex Enigmatica age-range judgement | Founder |
| — | Merge PR #23 | Founder |
