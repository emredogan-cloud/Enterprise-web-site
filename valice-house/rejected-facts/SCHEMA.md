# Rejected facts — schema

`rejected.jsonl` records claims that failed verification, so that no future
draft re-introduces them. Same append-only rule as the verified ledger.

| Field | Type | Rule |
|---|---|---|
| `fact_id` | `X-YYYY-NNNN` | unique |
| `statement` | string | the claim as it was made |
| `why_rejected` | string | what the sources actually say, or why no source could be found |
| `checked_sources` | array of strings | citations consulted |
| `rejected_by` | `R4` · `founder` | |
| `rejected_on` | ISO date | |
| `related_book` | array of slugs | |
| `replacement` | string or null | the verified fact id that replaces it, if any |
| `status` | `REJECTED` | |

`draft-lint` and `claim-lint` flag a claim whose text matches a rejected
statement (case-insensitive, whitespace-normalised).
