# Verified facts — schema

`facts.jsonl` is append-only, one JSON object per line. A fact is a checkable
statement that a Valice book relies on and that a verifier (never the
author of the claim) has confirmed against sources that meet the house
sourcing standard (two independent sources, at least one primary or
scholarly; indexes and retellings never count).

| Field | Type | Rule |
|---|---|---|
| `fact_id` | `F-YYYY-NNNN` | unique, never reused |
| `statement` | string | the fact as a single sentence, in the form a book could print |
| `source` | string | citation in house form (author, *title*, translator/edition, year, page) |
| `source_url` | string or null | archive/publisher URL when one exists |
| `source_date` | string | year or ISO date of the source |
| `confidence` | `high` · `medium` | `medium` when only one primary/scholarly source could be found; such facts may not be load-bearing |
| `verified_by` | `R4` · `founder` · session id | the verifier — never the claim's author |
| `last_verified` | ISO date | |
| `related_book` | array of slugs | |
| `status` | `VERIFIED` · `NEEDS_REVIEW` | rejected facts live in `../rejected-facts/rejected.jsonl` |
| `notes` | string or null | |

Rules: a line is never edited in place — supersede it with a new line whose
`notes` says `supersedes F-…`; `claim-lint` accepts a claim's evidence of the
form `valice-house/verified-facts/facts.jsonl#F-…` only if that id exists.
