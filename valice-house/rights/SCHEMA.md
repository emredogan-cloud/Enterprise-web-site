# Rights ledger — schema

`ledger.csv` is the reusable rights record for every source a Valice book
uses. **Work rights and edition/translation/illustration/apparatus rights
are separate rows**: a public-domain work with a 2002 translation is two
rows, one GREEN and one RED. Rows are never deleted; a superseding row
carries `supersedes=<row_id>`.

| Column | Meaning |
|---|---|
| `row_id` | `RL-NNNN`, unique |
| `book_slug` | the Valice project using the source (empty for a pool entry not yet assigned) |
| `layer` | `work` · `translation` · `edition` · `illustration` · `apparatus` · `data` · `font` · `image` · `cover-art` |
| `title` | the source's title |
| `author` | creator of THIS layer (translator for a translation row, illustrator for an illustration row) |
| `author_death_year` | integer or empty; drives life+70 |
| `original_publication_year` | first publication of this layer |
| `edition` | edition/publisher used |
| `source_repository` | `PG#…` · `IA:<identifier>` · `HathiTrust:…` · `Wellcome:…` · `original` · other |
| `license` | `public-domain` · `CC0` · `CC-BY` · `CC-BY-SA` · `CC-BY-NC` · `proprietary` · `valice-original` · `unknown` |
| `jurisdictions_checked` | e.g. `US:pre-1931;EU:life+70=1949` |
| `evidence_url` | archive/publisher/registry URL (required for GREEN) |
| `verification_date` | ISO date |
| `status` | `GREEN` · `YELLOW` · `RED` |
| `approved_by` | `founder` (required for GREEN) or empty |
| `approved_on` | ISO date or empty |
| `supersedes` | previous row_id or empty |
| `notes` | mitigation for YELLOW, reason for RED |

Gate rules (`rights-lint.mjs`): GREEN requires `evidence_url`, `verification_date`,
`approved_by=founder`; `CC-BY-NC` can never be GREEN for a sold book;
`CC-BY-SA` is YELLOW at best for a closed commercial book; `unknown` is RED;
a `translation`/`illustration` row with `author_death_year` empty and
`license=public-domain` is YELLOW unless `original_publication_year` < 1931
and the row is US-only in `jurisdictions_checked`.
