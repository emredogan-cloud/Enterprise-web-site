# The source-claim checker

`scripts/factory/check_source_claims.py`

## What it is for

`check_quotes.py` proves that every passage the apparatus puts inside quotation marks is in
the source, word for word. Nothing proved that the apparatus's **statements about** the
source were true of it — and that is the gap eleven falsehoods walked through in *British
Goblins*, nine of them contradicted by text the same volume prints:

| printed | the book |
|---|---|
| "a figure whom Sikes does not name" | Gwyn ap Nudd, named eleven times |
| "which Sikes does not mention once" | a chapter section is *titled* after Rip Van Winkle |
| "Sikes stops marking him" | the Prophet Jones, named seventeen more times after that chapter |
| "Olaus Magnus … a source for Book II" | zero occurrences — the row came from another book |
| "W. Howell" | the book prints "W. Howells" |

Every one dies against a grep. The reason none of them did is that the facts *about* the
source came from a tertiary summary and were never put back against the parsed text.

**A negative claim about an author is the highest-risk sentence an editor can write**,
because it cannot be confirmed by reading around it — only by counting. This checker exists
to make writing one without a count impossible.

## Usage

```
python scripts/factory/check_source_claims.py <BOOK_DIR> \
    --claims SOURCE_CLAIMS.json \
    --source SOURCE/raw/pg34704.txt \
    --report QA/parse-report.json \
    --exclude-index
```

Exit 1 if any claim fails. Writes `QA/source-claims.json` either way.

`--exclude-index` cuts everything from the last INDEX heading. **Use it.** An index lists
every name in the book, so counting through it turns every absent-claim into a false pass.
It cuts at the last line that is exactly `INDEX`, not at the last literal occurrence of the
string — the difference is 126,000 characters in *British Goblins*, and getting it wrong is
how that book's county count was wrong twice.

## The claims file

```json
{"claims": [
  {"id": "SC-001", "check": "absent", "pattern": "Gwyn ap Nudd",
   "claim": "Sikes never names Gwyn ap Nudd",
   "where": "glossary; the register of beings"}
]}
```

`where` names the place in the apparatus that makes the claim, so a failure points at the
sentence to fix rather than at the checker.

## Checks

| check | meaning |
|---|---|
| `present` | at least once (`expect` sets the minimum) |
| `absent` | exactly zero — **negative claims live here** |
| `count` | exactly `expect` |
| `count_min` / `count_max` | at least / at most |
| `count_after` | occurrences after `after`; `after_occurrence` picks which hit of the marker — `"last"` (default, the body), `"first"`, or an index |
| `report` | a number at `path` in the parse report equals `expect` |

Patterns are regular expressions, case-insensitive unless `"case": true`, matched against the
source with whitespace collapsed — so a claim does not fail because the transcription wrapped
a name across two lines.

`after_occurrence` defaults to `"last"` for a reason: a chapter heading is printed in the
table of contents before it is printed in the body, so "after chapter VIII" measured from the
first hit silently measures from the contents page and counts the whole book.

## Tests

`scripts/factory/check_source_claims.test.py` — 15 tests. Five of them are regressions that
replay the actual *British Goblins* failures against source fragments that contradict them.
If any of those five stops failing, the checker has stopped working.

```
python scripts/factory/check_source_claims.test.py
```

## In use

- `PHASE-3-BOOK/04-BRITISH-GOBLINS/SOURCE_CLAIMS.json` — 20 claims, 5 of them negative.
  It found three live errors on its first run, including a county count that had been
  "corrected" twice and was still wrong.
