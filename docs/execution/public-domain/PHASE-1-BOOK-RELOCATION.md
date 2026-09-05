# Phase 1 book projects — relocation map

**Date:** 2026-09-04 · One-off reorganisation. This file is the record of what moved
and what had to be changed with it.

## Why

The five Phase 1 public-domain projects sat directly under
`/home/emre/Downloads/MY-DİGİTAL-BOOK/`, beside eighteen unrelated book directories.
They are now under one parent.

## The move

| Old | New |
|---|---|
| `MY-DİGİTAL-BOOK/EPICTETUS-DISCOURSES-AND-ENCHIRIDION` | `MY-DİGİTAL-BOOK/PHASE-1-BOOK/01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION` |
| `MY-DİGİTAL-BOOK/SENECA-SELECTED-DIALOGUES` | `MY-DİGİTAL-BOOK/PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES` |
| `MY-DİGİTAL-BOOK/MYTHS-AND-LEGENDS-OF-CHINA` | `MY-DİGİTAL-BOOK/PHASE-1-BOOK/03-MYTHS-AND-LEGENDS-OF-CHINA` |
| `MY-DİGİTAL-BOOK/INDIAN-MYTH-AND-LEGEND` | `MY-DİGİTAL-BOOK/PHASE-1-BOOK/04-INDIAN-MYTH-AND-LEGEND` |
| `MY-DİGİTAL-BOOK/MYTHICAL-MONSTERS` | `MY-DİGİTAL-BOOK/PHASE-1-BOOK/05-MYTHICAL-MONSTERS` |

**The canonical directory names are kept**, with a two-digit ordering prefix. The
brief suggested longer names carrying author and volume
(`03-WERNER-MYTHS-AND-LEGENDS-OF-CHINA-I-THE-GODS`) but also said to prefer the
canonical names already in use. The canonical name is what twenty files across the
repository refer to, what the KDP packages record, and what the factory tools template
into paths; keeping it makes every one of those a prefix change rather than a rename,
and keeps `grep` for a project honest. The author and volume are already carried by the
catalogue slug and the book's own `project_config.json`.

**Nothing else moved.** Greek Alphabet, Dudeney, the Codex titles, World Games, World
Myths, Hangul, Field Book, and every unrelated directory stayed where they were. The Phase 2 project moved
separately, into `PHASE-2-BOOK/01-GAMES-ANCIENT-AND-ORIENTAL`, when that phase's own
directory was created — the same convention, one parent per phase.

## What had to change with it

Twenty files referenced the old locations. They fall into four kinds.

**1. Live factory tooling — three files, path templates.** These are the only ones that
would have broken a build:

- `scripts/catalog/digital-edition-sources.mjs` — 10 paths (print interior + EPUB × 5)
- `scripts/factory/print-interiors.mjs` — 5 paths
- `scripts/factory/rebuilt-covers.mjs` — 5 paths

Each defines `ROOT`/`BOOKS` as `/home/emre/Downloads/MY-DİGİTAL-BOOK` and appends the
project directory, so only the appended segment changed.

**2. The rights ledger** — 4 `file:///…/RIGHTS.md` evidence URLs (Epictetus, Seneca),
URL-encoded. Evidence URLs must resolve, so they were rewritten rather than left.

**3. Generated KDP records** — 11 files under `docs/execution/phase-5/kdp-packages/`
(five manifests, five `UPLOAD.md`, the `INDEX.json`) which record the absolute path of
the interior each package was built from.

**4. Regenerated rather than rewritten.** The five `KDP_UPLOAD_HANDBOOK.html` files and
21 per-project `QA/*-lint.json` outputs record the project path they ran against. These
were regenerated from the new locations by re-running the generators, which is safer
than editing generated output by hand. `02-SENECA-SELECTED-DIALOGUES/RIGHTS.md` carried
one hard-coded path in prose and was corrected directly.

Replacements were anchored on `${ROOT}/`, `${BOOKS}/`, `MY-DİGİTAL-BOOK/` and the
URL-encoded form, so a project name appearing as prose was never touched.

## Verification

| Check | Result |
|---|---|
| Files before / after | **332 / 332** |
| Subtrees per project (`SOURCE CONTENT OUTPUT ASSETS QA BUILD`) | **6/6** on all five |
| Key files (`RIGHTS.md CLAIMS.jsonl gates.json state.json project_config.json`) | **5/5** on all five |
| Stale paths, repo-wide and project-wide | **0** |
| Gates per project | **4 passed** on all five, states intact |
| `rights-lint` | 60 rows, clean |
| `kdp-linkage-lint` | 21 COMPLETE |
| Digital editions rebuilt from new paths | 176 / 154 / 108 / 94 / 74 pp — all correct |
| `npm test` | 349 passed |
| `npm run build` | 72/72 static pages |
| `validate-catalog --env .env` | 70 pass · 0 error |

### One thing worth recording

Rebuilding the digital editions produced masters that were byte-different from the ones
in R2 at the same size. That looked like a content change and was checked rather than
assumed: extracted text of the R2 copy against the rebuilt copy is **identical** — the
difference is the PDF creation timestamp. The masters were re-uploaded anyway, so that
`upload-masters.mjs` reporting `SAME` keeps meaning something.

The first comparison was wrong and is worth noting: it compared the R2 *master* against
the local *print interior*, which are different artifacts by design, and showed 1,163
differing lines. Comparing like with like showed none.
