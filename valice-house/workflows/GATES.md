# The Twelve Gates

Human-readable rendering of `gates.json`. A gate is **passed only with evidence** — a file
path, a URL or a measurement — plus an owner and a timestamp. `scripts/factory/gate.mjs`
refuses anything else, and refuses a founder gate from a non-founder owner.

| # | Key | Name | Owner | Founder sign-off | Evidence required | Kill criterion |
|---|---|---|---|---|---|---|
| 1 | `market` | Market fit | R1 | no | `MARKET.md` with a top-20 BSR sample (≥20 timestamped rows) and a go/no-go | no competitor gap, or no measurable demand |
| 2 | `rights` | Rights | R6 | **yes** | `RIGHTS.md` + a ledger row per source with status GREEN and evidence URLs | any RED, or a YELLOW without a written mitigation |
| 3 | `originality` | Originality / similarity | R8 | no | `QA/similarity.json`, overlap below threshold | 8-gram overlap above threshold with any Valice manuscript |
| 4 | `content` | Content quality | R3 | no | `QA/draft-lint.json` clean; usability pilot recorded for workbooks/puzzles | below `SPEC.md` budget; placeholder tokens; missing pilot |
| 5 | `facts` | Factual verification | R4 | **yes** | `CLAIMS.jsonl` with a verdict per claim from a verifier who is not the author; no WRONG remaining | a load-bearing claim WRONG or UNVERIFIABLE and not cut |
| 6 | `editorial` | Editorial | R5 | no | `QA/style-lint.json` clean | house-style violations; a cut claim re-introduced |
| 7 | `cover` | Cover | R7 | **yes** | `QA/cover-check.json` clean for every cover slot | thumbnail unreadable; wrong spine; <300 DPI; rights issue |
| 8 | `interior` | Interior / proof | R7 | **yes** | `QA/preflight.json` clean; KDP Previewer pass recorded; proof order id for a new trim/template | fonts not embedded; missing glyphs; page count outside range; Previewer rejection |
| 9 | `metadata` | Metadata | R8 | no | `QA/metadata-lint.json` clean (subtitle counts equal measured counts; keyword rules) | a claim in metadata not true of the book |
| 10 | `compliance` | KDP compliance | R8 | **yes** | `QA/compliance-lint.json` clean; AI disclosure answered in `project_config.json` | undisclosed AI content; undifferentiated public domain; Select conflict; wrong ink |
| 11 | `website` | Website product QA | R9 | no | `validate:catalog` output clean for the slug | missing cover/master/price/preview; JSON-LD invalid |
| 12 | `publish` | Founder publication approval | founder | **yes** | the reviewed diff that sets `websiteStatus: "published"` (commit hash) and/or the KDP submission id | — |

## The per-project record

Each project carries a `gates.json` (created by `new-project.mjs`, edited only by `gate.mjs`):

```json
{
  "gates": {
    "1": { "status": "not_started", "evidence": [], "owner": null, "updatedAt": null, "reason": null },
    "2": { "status": "passed", "evidence": ["RIGHTS.md", "valice-house/rights/ledger.csv#greek-alphabet-handwriting-workbook"], "owner": "founder", "updatedAt": "2026-09-15T10:12:00Z", "reason": null },
    "4": { "status": "failed", "evidence": ["QA/draft-lint.json"], "owner": "R3", "updatedAt": "2026-09-16T08:00:00Z", "reason": "placeholder token in CONTENT/lesson-07.md" }
  }
}
```

Status values: `not_started` · `in_progress` · `passed` · `failed` · `waived`.

Rules `gate.mjs` enforces:
- `passed` requires ≥1 evidence entry **and** an owner **and** sets `updatedAt`; evidence that
  names a file must exist on disk at the time of the call.
- A gate whose `founderSignoff` is `true` accepts `passed` only with `--owner founder`.
- `failed` requires a reason.
- `waived` is a **founder override**: `--owner founder --reason "<why>"`, recorded with the
  timestamp. It is never rewritten as `passed`, and it is not available for gates 2, 5, 10, 12.
- A gate cannot be passed while a lower-numbered gate that the state machine requires
  earlier is `not_started` or `failed` (the ordering follows `state-machine.json`, not the
  gate number alone: 3 and 4 are checked together, 9/10/11 together).

## Audit rule

A `waived` gate is an override, not a pass. The status report (`status.mjs`) lists every
waiver with its reason; `DECISIONS.md` carries the same text as a `K##` beginning
`FOUNDER OVERRIDE`. A measurement that failed (zero pilot sessions, zero external solvers)
stays in the record as the measurement; the waiver sits next to it, never instead of it.
