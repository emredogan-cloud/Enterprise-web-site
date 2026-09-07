# Gate 12 release policy — 2026-09-07

**Decision: Gate 12 is prospective. It governs publications from 2026-09-07 forward. The
sixteen books already on sale are to be WAIVED with their publishing commit on the record —
not passed, and not back-dated.**

---

## 1. The finding

Gate 12 — *Founder publication approval* — has never been passed for any book in this house,
including the twelve titles currently selling. That was reported as a backlog item. It is not
one; it is an architecture question, and the answer is not "sign twelve things".

The gate's own definition names its evidence:

> the reviewed diff that sets `websiteStatus: "published"` (commit hash) and/or the KDP
> submission id

**That evidence exists for every one of the sixteen live books.** Six commits published all
sixteen, each a reviewed diff, each in `main`:

| Book | Commit | Date | Subject |
|---|---|---|---|
| `meditations` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `codex-mythologica` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `codex-bestiarium` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `the-great-book-of-world-myths` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `the-great-book-of-world-games` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `the-myth-hunters-field-book` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |
| `greek-alphabet-handwriting-workbook` | `817ad4d8` | 2026-09-04 | greek: the ebook on sale — live Paddle price, catalogue  |
| `codex-mythologica-the-puzzle-book` | `629d6523` | 2026-09-05 | feat(public-domain): PHASE 2 book 3 — Culin's Chess and  |
| `korean-hangul-handwriting-workbook` | `54ffb225` | 2026-09-02 | phase3: settle the R2 production question, make unsubscr |
| `the-puzzles-of-henry-dudeney` | `28b875dd` | 2026-09-02 | phase4: Dudeney on sale, and one purchase now delivers t |
| `epictetus-discourses-and-enchiridion` | `cbf4ec70` | 2026-09-04 | phase1: the five public-domain editions go on sale |
| `seneca-selected-dialogues` | `cbf4ec70` | 2026-09-04 | phase1: the five public-domain editions go on sale |
| `myths-and-legends-of-china` | `cbf4ec70` | 2026-09-04 | phase1: the five public-domain editions go on sale |
| `indian-myth-and-legend` | `cbf4ec70` | 2026-09-04 | phase1: the five public-domain editions go on sale |
| `mythical-monsters` | `cbf4ec70` | 2026-09-04 | phase1: the five public-domain editions go on sale |
| `codex-enigmatica` | `103ee28e` | 2026-08-31 | feat(catalog): real Amazon catalog, direct ebook sales,  |

So the situation is precise, and it is not the one the empty column implied. These books were
not published without review. They were published by a real, reviewable process that predates
the gate framework and was never recorded *as* Gate 12.

## 2. The three options, and why one of them is out

**A — prospective, with the existing sixteen waived.** Gate 12 binds new publications. The
sixteen get `waived`, carrying the publishing commit as evidence and a reason that says they
predate the gate. `gate.mjs` records a waiver as a founder override and **never displays it as
a pass**, which is exactly the distinction that needs preserving.

**B — back-fill Gate 12 as `passed`, citing the commits.** Rejected. The commits are evidence
that a publication *happened*, not that a Founder gave this gate's approval — the approval did
not exist to give. Writing `passed` with today's timestamp and a month-old commit would
manufacture a historical approval record. That is the one thing this system is built not to do.

**C — leave all sixteen `not_started`.** Rejected. The board would go on reporting sixteen
selling books as unapproved for the rest of the project's life, and a column that is wrong
everywhere teaches nobody anything. It is the same failure as a check that fails correct
behaviour: the noise buries the signal.

**A is the decision.**

## 3. What that means going forward

| | |
|---|---|
| **Before 2026-09-07** | Gate 12 is waived on evidence of the publishing commit. The waiver says the book predates the gate. |
| **From 2026-09-07** | No book reaches `websiteStatus: "published"` until Gate 12 is `passed`, with the reviewed diff or the KDP submission id as evidence. |
| **Who** | Founder only. `gate.mjs` refuses both `passed` and `waived` on a founder gate without `--approved-by founder`, and that refusal is correct. |
| **Order** | Gate 12 is last. It is the approval to sell, and it means nothing signed before gates 7, 8 and 10. |

## 4. The commands

Sixteen waivers, one per live book. Each is a Founder action; the evidence is already in `main`.

```bash
# The pattern. BOOKS is the project directory, SHA the publishing commit from the table above.
node scripts/factory/gate.mjs <project-dir> set 12 waived \
  --approved-by founder \
  --reason "Published 2026-08-31 by reviewed commit 103ee28e, before gate 12 existed as a \
recorded step. Waived under docs/00-critical/GATE_12_RELEASE_POLICY.md; not a pass."
```

A waiver takes `--reason` and `--approved-by founder` and nothing else — no `--evidence`, because
`gate.mjs` only stores evidence on a pass. Put the commit hash in the reason, where it is read.

## 5. Enforcement, and when to turn it on

The policy is worth only as much as the thing that checks it. The natural place is
`load-catalog.mjs`, which already refuses a catalogue that fails its integrity gate: it would
refuse to write `status = published` for a book whose Gate 12 is neither `passed` nor `waived`.

**That check is deliberately NOT implemented yet.** Turned on today it would refuse to load all
sixteen live books, because none of them is waived — an integrity check that takes the store
down is not an improvement. The order is: waive the sixteen, then add the check, then it costs
nothing and catches the next one.

## 6. What this does not change

Gates 2 (Rights), 5 (Facts), 7 (Cover), 8 (Interior/proof) and 10 (KDP compliance) are
unaffected. They are earned, not grandfathered, and several of them are what actually stands
between the eight ready print packages and a KDP upload. Gate 8's evidence is a physical proof
copy; no policy makes that appear.

---

*Written 2026-09-07 against the measured board: 146 passed, 79 in_progress, 75 not_started,
across 25 projects. Gate 12: not_started on all 25.*
