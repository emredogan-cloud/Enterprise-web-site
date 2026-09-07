# Catalogue reconciliation — 2026-09-07

**CI: GREEN.** 24 files, 253 tests, 151 skipped — up from 211 with three files that could not
load at all.
**Catalogue: 27 rows, 26 local book/volume builds, zero unaccounted for either way.**
**Activated this session: none, and that is the correct outcome** — every candidate is held by
a rights signature.

---

## 1. CI — red since at least 2026-09-04, now green

Three defects, each hidden behind the one before it.

### The failure

Every run failed, on `main` and on PRs alike. **No assertion was failing.** 211 tests passed;
three test *files* could not be loaded:

```
Error: ENOENT: no such file or directory, scandir '/home/emre/Downloads/MY-DİGİTAL-BOOK'
 ❯ parents scripts/factory/book-dirs.mjs:56
 ❯ bookPath scripts/factory/book-dirs.mjs:103
 ❯ scripts/factory/print-interiors.mjs:25
```

### Root cause 1 — a data table doing filesystem I/O at import time

`print-interiors.mjs` is a table of where each printed interior lives. All thirty entries were
`bookPath(...)` calls **evaluated at module scope**, so importing the module walked the
Founder's local book tree thirty times. That directory does not exist on a CI runner and never
will.

The collateral damage is the part worth keeping:

* **`kdp-linkage-lint.test.js` had never run in CI. Not once.** It builds its own tiny PDFs in
  a temp dir and needs no book tree at all.
* **`companion-page.test.js` had already guarded itself correctly** — `HAVE_BOOKS ? describe :
  describe.skip`, with a comment saying a green run against an empty directory would be the
  most expensive kind of lie. The guard was right and never reached: it is on line 26 and the
  import that killed it is on line 10.

**Fix.** The table holds path *segments* and resolves them through a memoised per-format getter
on first read. Import touches no filesystem; reading still throws loudly when a book has moved.
Two supporting fixes: `book-dirs.parents()` ran *only while building an error message* and
called `readdirSync` unguarded, so its ENOENT escaped instead of the message being assembled;
and `companion-page.test.js` resolved a path in the **describe body**, which vitest executes
even for a skipped suite.

### Root cause 2 — no poppler on the runner

With the import fixed, `kdp-linkage-lint.test.js` ran for the first time and failed **nine**
assertions, all returning `BLOCKED`. That is the lint's "cannot read the interior" state, and
its own diagnostic names the remedy: *"pdftotext/pdfinfo failed: install poppler-utils"*. These
suites read built PDFs back — they assert on what a KDP reviewer's copy contains, not on what a
generator was asked to write.

Reproduced locally by shadowing `pdftotext`/`pdfinfo` with stubs that exit 127: nine failures,
same shape. **Fix:** install `poppler-utils` in CI.

### Root cause 3 — the QR was reported unmeasured, not measured

One failure left: `qrPresent: "unmeasured"`. The lint measures a printed QR by rendering the
page with `pdftoppm` and looking for the 1:1:3:1:1 finder signature, through
`./.venv-factory/bin/python`. No venv on the runner.

*Unmeasured is an honest answer and it is not a measurement.* The tempting fix — skip that one
assertion on CI — would have left the runner asserting a weaker claim than the Founder's
machine, which is the asymmetry that let CI sit red for days teaching nobody anything.
`measure-qr.py` needs **Pillow and nothing else**, so **CI now measures for real.**

### Validation

| | Files | Tests |
|---|---|---|
| Local, book tree present | 24 pass | **404 pass** |
| `VALICE_BOOKS_ROOT=/nonexistent` (CI shape) | 24 pass | **253 run, 151 skipped** |
| **GitHub Actions, run 34105457916** | **24 pass** | **253 passed, 151 skipped** |

`npm run lint`, `npx tsc --noEmit`, `npm run build` all clean. **Net: 42 more tests execute in
CI than before, not fewer. No test was weakened, skipped or disabled.**

Delivered as **PR #23** (green). Merging it is an account-owner action — see §5.

---

## 2. Local inventory

`scripts/factory/local-inventory.mjs` (new) reads artifacts and QA records, never filenames.

**26 book/volume rows across 25 projects.** Every one resolves to a catalogue slug:

| How the slug was resolved | Count |
|---|---|
| `project.slug` in the config | 19 |
| slugified `project.title` — projects predating the slug field | 5 |
| directory name — the two oldest books, which have no `project_config.json` at all | 2 |
| **unresolved** | **0** |

## 3. Gap analysis

| Direction | Result |
|---|---|
| Local book with no catalogue row | **none** |
| Catalogue row with no local project | **1 — `meditations`**, pre-factory, digital-only, published, live Paddle price |
| Duplicates | none |
| Broken / corrupted builds | none found |

## 4. Activation — why nothing was activated

**All 11 draft rows carry "GATE 2 IS UNSIGNED."** Gate 2 is the rights signature; no agent can
give it, and the operating brief says explicitly not to activate rights-blocked books.

So the honest result of the activation step is **zero activations and eleven documented
blocks** — not a failure to act, but the rule working.

What *was* corrected: six Phase 3 rows still said *"Phase 3 is not merged"* and *"the companion
address 404s until this branch ships."* **PR #22 merged at 08:41 UTC and both statements became
false.** Verified against production and rewritten.

## 5. Verified against production

| Check | Result |
|---|---|
| Core routes `/`, `/books`, `/ebooks`, `/categories`, `/search` | **200** |
| 16 published product pages | **200, all** |
| 11 draft product pages | **404, all** — correct, they are drafts |
| 6 Phase 3 companion pages | **200, all** — newly live since PR #22 |
| Companion sheet PDFs | **200, `application/pdf`, byte-for-byte the built files** (e.g. `fairy-mythology-vol-1/words.pdf` = 65,023 bytes local and served) |
| `validate-catalog` | **60 pass · 0 warn · 0 error · 2 skipped** — was 32 errors, all of them the companion 404s the merge resolved |
| Paddle `pri_01m1v4n80k6g2tba6wt8882ehf` | **active**, correctly named, $8.99, against `api.paddle.com` |

## 6. R2, Inngest, Resend — UNVERIFIED, and why

`scripts/tmp/.env.production` carries the literal placeholder `[SENSITIVE]` for all six `R2_*`
values, both Inngest keys, both Resend keys and `PADDLE_WEBHOOK_SECRET`. Real and used:
`DATABASE_URL`, `CLERK_SECRET_KEY`, `PADDLE_API_KEY`, `OPENAI_API_KEY`.

So **no master could be uploaded and fulfillment could not be exercised end to end.** Recorded
as **F-044**. `upload-masters.mjs` reports every object as "(new)", but with placeholder
credentials it cannot list the bucket, so **that is not evidence of absence and is not reported
as such.** Kwaidan's `masterFileKey` claim from an earlier session is now labelled UNVERIFIED
rather than left asserting.

## 7. Git

| | |
|---|---|
| PR #22 (Phase 3 + book-05 + mobile) | **MERGED** 2026-09-07 08:41 UTC |
| PR #23 (the CI fix) | **OPEN, green, mergeable** — needs the owner's merge |
| Working tree | clean |
| Other worktrees | untouched; the shared tree keeps another agent's 22 uncommitted files |
| Secrets committed | none |

## 8. Open blockers

| # | Blocker | Owner |
|---|---|---|
| F-044 | R2/Inngest/Resend credentials are placeholders | Founder |
| Gate 2 | Rights signature — **all 11 draft books** | Founder |
| F-036 | Phase 3 prices are engine recommendations, unapproved | Founder |
| F-043 | AI disclosure written as the standing house answer, not a decision taken | Founder |
| — | PR #23 merge | Founder |
