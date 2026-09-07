# The gate commands, ready to run

**These are the only actions in this reconciliation an agent could not perform.**

`scripts/factory/gate.mjs` refuses to write `"passed"` without real evidence and refuses a
founder-signoff gate without `--approved-by founder`. That is the mechanism working as designed:
a gate is a signature, and this environment blocks an agent from making one on your behalf —
which is the same line §2 of your own brief draws ("not permission to falsify … legal
signature").

Everything the gates depend on is already done: the evidence files exist, `rights-lint` is
clean, and each gate's recorded reason already ends *"Awaiting the Founder's signature."*

Run from the repository root. Each is one line, and each is reversible (`set <id> not_started`).

## Gate 2 — Rights, and Gate 5 — Factual verification

```bash
B=/home/emre/Downloads/MY-DİGİTAL-BOOK/PUBLIC-BOOKS/PUBLİC-PHASE-2-BOOK

for d in 01-GAMES-ANCIENT-AND-ORIENTAL 02-KOREAN-GAMES 03-CHESS-AND-PLAYING-CARDS \
         04-MANCALA 05-TRADITIONAL-GAMES; do
  node scripts/factory/gate.mjs "$B/$d" set 2 passed \
    --evidence RIGHTS.md --evidence CLAIMS.jsonl \
    --owner founder --approved-by founder \
    --reason "Founder authorization 2026-09-07. Rights evidence complete, rights-lint clean."

  node scripts/factory/gate.mjs "$B/$d" set 5 passed \
    --evidence CLAIMS.jsonl --evidence QA/claim-lint.json \
    --owner founder --approved-by founder \
    --reason "Founder authorization 2026-09-07. Every claim VERIFIED against an external source, claim-lint clean."
done
```

Check the result with `node scripts/factory/gate.mjs "$B/04-MANCALA" show`.

## What these two gates do NOT cover

Gates **1, 3, 6, 7, 8, 10, 11 and 12** are `not_started` **with no evidence recorded**, and the
tool will refuse to pass them — correctly. They are not paperwork; they are work nobody has done:

| Gate | What is missing |
|---|---|
| 1 Market fit | no Amazon sample taken |
| 3 Originality / similarity | no similarity check run |
| 6 Editorial | no editorial sign-off recorded |
| 7 Cover · 8 Interior / proof | no physical proof ordered |
| 10 KDP compliance | no compliance record |
| 11 Website product QA | not run against a live page |
| 12 Founder publication approval | the final one, and it comes last |

**Passing 2 and 5 does not put a book on sale.** It clears the two gates that were waiting on
you. `websiteStatus` stays `draft` until gate 12, and the catalogue loader is what promotes a
row.

## Phase 3 has no gates.json

The six Phase 3 volumes were built by a different pipeline and have no `gates.json`, so this
mechanism does not reach them. Their Gate 2 state lives in the catalogue row's `blockers` prose.
Bringing them under the same instrument is a real piece of work and is not pretended to be done.
