# Book State Machine

Human-readable rendering of `state-machine.json`, which `scripts/factory/state.mjs`
enforces. A **content project** has exactly one state. Its **format records** (ebook,
paperback, hardcover, large_print, kindle, companion) have their own readiness, recorded in
`project_config.json → formats[].status`, and never move past what the project's state
allows.

## 1. States

| State | Meaning |
|---|---|
| `IDEA` | one page (`IDEA.md`/`project_config.json` working title); nothing validated |
| `RESEARCH` | R1 is measuring demand for the slate |
| `MARKET_VALIDATED` | gate 1 passed with a timestamped sample and a go |
| `RIGHTS_PENDING` | R6 has prepared `RIGHTS.md` and ledger rows; waiting for the founder |
| `RIGHTS_APPROVED` | gate 2 signed by the founder |
| `SPEC_READY` | `SPEC.md`/`OUTLINE.md` written and price-engine-checked |
| `DRAFTING` | R3 writing `CONTENT/` and `CLAIMS.jsonl` |
| `VERIFYING` | R4 (fresh session) assigning verdicts; gates 3 and 4 already passed |
| `EDITING` | gate 5 signed; R5 line-editing |
| `DESIGNING` | gate 6 passed; R7 building covers, illustrations, companion assets |
| `FORMATTING` | gate 7 signed; R7 building interiors, EPUB, digital edition |
| `QA` | gate 8 passed; R8 metadata + compliance, R9 web QA |
| `FOUNDER_REVIEW` | gates 9, 10, 11 passed; the publication diff is in front of the founder |
| `APPROVED` | gate 12 signed |
| `PUBLISHED` | live on at least one channel; ASIN/entry verified |
| `OPTIMIZE` | in the quarterly loop (price tests, ads, metadata, ladder) |
| `ARCHIVE` | withdrawn or dormant by founder decision; companion pages stay up |
| `BLOCKED` | left the batch with a recorded reason; returns to the previous state |
| `KILLED` | terminal, founder-only, with reason; directory and house memory retained |

## 2. Transitions

| From | To | Required gates (all `passed`) | Founder-only |
|---|---|---|---|
| `IDEA` | `RESEARCH` | — | no |
| `RESEARCH` | `MARKET_VALIDATED` | 1 | no |
| `MARKET_VALIDATED` | `RIGHTS_PENDING` | 1 | no |
| `RIGHTS_PENDING` | `RIGHTS_APPROVED` | 2 | **yes** |
| `RIGHTS_APPROVED` | `SPEC_READY` | 2 | no |
| `SPEC_READY` | `DRAFTING` | 2 | no |
| `DRAFTING` | `VERIFYING` | 3, 4 | no |
| `VERIFYING` | `EDITING` | 5 | **yes** |
| `EDITING` | `DESIGNING` | 6 | no |
| `DESIGNING` | `FORMATTING` | 7 | **yes** |
| `FORMATTING` | `QA` | 8 | no |
| `QA` | `FOUNDER_REVIEW` | 9, 10, 11 | no |
| `FOUNDER_REVIEW` | `APPROVED` | 12 | **yes** |
| `APPROVED` | `PUBLISHED` | 12 | no |
| `PUBLISHED` | `OPTIMIZE` | — | no |
| `OPTIMIZE` | `ARCHIVE` | — | **yes** |
| any | `BLOCKED` | — (reason required) | no |
| `BLOCKED` | previous state | — (reason required) | no |
| any | `KILLED` | — (reason required) | **yes** |

`state.mjs` reads the project's `gates.json`, checks every required gate is `passed`
(a `waived` gate satisfies a transition only if the gate is waivable — see below), checks
`--owner founder` on founder-only transitions, records the previous state so `BLOCKED` can
return, and appends a line to `QA/state-log.jsonl`.

## 3. BLOCKED and KILLED

- `BLOCKED` is not a failure of the book; it is the book leaving the batch. The reason names
  the gate and the kill criterion (`"gate 4: pilot session missing"`). The title rejoins the
  next slate at the previous state once the reason is cleared; the gate is re-run.
- `KILLED` is terminal and founder-only. Killed projects keep their directory, ledger rows
  and facts; nothing is deleted.

## 4. Never skip 2 / 5 / 10 / 12

Gates 2 (rights), 5 (facts), 10 (KDP compliance) and 12 (publication) cannot be waived and
cannot be passed by an agent. `state.mjs` refuses any transition that requires one of them
unless the gate record shows `status: "passed"` and `owner: "founder"`. This is the rule
that protects the KDP account and the company; it is enforced in code, not by care.

## 5. Content project vs format record

A project has one state; each format has a readiness value:

`not_planned` · `planned` · `built` · `preflight_ok` · `uploaded` · `in_review` · `live` · `withdrawn`

Rules:
- `built` requires the project to be at `FORMATTING` or later.
- `preflight_ok` requires `QA/preflight.json` clean for that format.
- **`uploaded` requires the project to be `APPROVED` or later** — no format reaches KDP before gate 12.
- `live` requires the listing fetched with HTTP 200 and the ASIN recorded from that fetch.
- `withdrawn` keeps the record; a printed companion address keeps resolving.
- A companion "format" becomes `live` when its route returns 200 in production — before any
  printed copy may carry the address.

The storefront catalogue mirrors this: `format.kdp` (`live` / `in_review` / `not_created` /
`not_applicable`) and `availability` in `valice-catalog.mjs` are written by R9 from these
values, never guessed.
