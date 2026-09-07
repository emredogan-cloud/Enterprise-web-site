# The public-domain programme — status at the close of Phase 3

**2026-09-07.** Three phases, sixteen roadmap titles, seventeen product volumes.
**Nothing from Phase 2 or Phase 3 is on sale, and the reason is the same for all of them.**

---

## Where each phase stands

| Phase | Titles | Volumes | Pages | Built | Provisioned | On sale |
|---|---|---|---|---|---|---|
| **1** — the first five | 5 | 5 | — | ✅ | ✅ | ✅ **on sale** |
| **2** — games | 5 | 5 | 624 | ✅ | ✅ Paddle live | ❌ **Gate 2 + Gate 5** |
| **3** — the bestiary and the fairies | 5 | 6 | 1,630 | ✅ | ❌ none | ❌ **Gate 2** |

Phase 1's five books are live and selling. Everything since is finished and waiting on a
signature.

## The one blocker

**Gate 2 is the Rights signature, and no agent can give it.** It is not a technical
obstruction and there is no way to work around it — that is what the gate is for. Phase 2 adds
Gate 5 (Facts).

Recorded as **F-033, F-035, F-037, F-039**. Phase 2's blocker text said the environment
prevented the Paddle write; that was true when written and false by 2026-09-07, and has been
corrected — their products and prices are live against `api.paddle.com`. The five are held by
signatures alone.

## Phase 3, measured

| # | Title | Series | Pages | Source words | Apparatus | Share |
|---|---|---|---|---|---|---|
| 1 | Kwaidan | Classics 13 | 138 | 36,144 | 9,768 | 21.3% |
| 2 | Sea Monsters Unmasked | Classics 14 | 232 | 64,119 | 18,491 | 22.4% |
| 3 | The Book of Were-Wolves | Classics 15 | 198 | 54,456 | 14,998 | 21.6% |
| 4 | British Goblins | Classics 16 | 390 | 112,594 | 29,223 | 20.6% |
| 5a | The Fairy Mythology, Vol I | Classics 17 | 336 | 101,835 | 14,376 | 12.4% |
| 5b | The Fairy Mythology, Vol II | Classics 18 | 326 | 101,612 | 10,963 | 9.7% |
| | | | **1,630** | **471,760** | **98,019** | **17.2%** |

Four of six clear the 20% floor. The two Keightley volumes do not, and are **recorded rather
than padded** (F-038): the share is low because the denominator is 200,000 words of Keightley,
not because the apparatus is thin — every one of the fifty-one sections carries a head-note.

## What every volume has

Coverage 0 failures · quotations 0 not in source · EPUBCheck 0/0/0 · barcode zone clear ·
QR measured in the built PDF at ≥25% of page height and decoded back by a reader that did not
write it · cover geometry from a KDP calculator row read for that exact page count ·
a KDP upload handbook generated from its own QA records, with no invented figure in it.

## What no volume has

**No ASIN. No ISBN. No KDP listing. No price that anyone has agreed.** None of these has been
invented anywhere in this repository, and the tests forbid it.

## Where the code stands

`main` is 41 commits behind the reconciled tree. Three branches were merged in order —
`feature/public-domain-phase-3`, `feature/book-05-production`, `feature/mobile-optimization` —
with lint, typecheck, the full test suite and a production build after each. All green: **404
tests pass**.

**The direct push to `main` was refused by this environment's policy**, so the reconciled tree
is on `integration/phase-3-reconciliation` and open as **PR #22**. Merging it deploys, and
deploying resolves the 32 companion 404s that are the only thing `validate-catalog` still
reports.

## What could not be done from here

**R2, Inngest, Resend and the Paddle webhook secret are placeholders** in the production env
file — the literal string `[SENSITIVE]`. No master can be uploaded and fulfillment cannot be
proved end to end (**F-044**). It is also the right order: an R2 master is the file a paying
customer downloads, and none of these books can be bought.

## The two instruments this programme leaves behind

**`check_source_claims.py`** asserts the apparatus's claims *about* the source against the
source. `check_quotes.py` proves the quotations are the author's; this proves the statements
about the author are true of the book. It exists because eleven falsehoods reached print in
*British Goblins*, nine of them contradicted by text that same volume prints. Twenty-two tests,
five of them replaying the actual failures.

**`measure_qr.py`** measures the printed companion code in the finished interior, by the same
detector that proves it scans. It exists because four books recorded a QR figure computed by a
script that no longer existed, so the record outlived the tool and went stale.

## The lesson of Phase 3, in one line

Twice now a confident, specific, checkable number turned out to be invented — eleven in
*British Goblins*, and William Hone in *The Fairy Mythology*, who was given a citation count, an
entry in two who's-whos and a whole essay, and who is named **zero times** in either volume.
Both times the same thing was true: **the number was never held against the text the book
actually prints.**
