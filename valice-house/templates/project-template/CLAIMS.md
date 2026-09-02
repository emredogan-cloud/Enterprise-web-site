# Claims ledger — how CLAIMS.jsonl works (Gate 5)

Every checkable statement in the manuscript is one line in `CLAIMS.jsonl`:

```json
{"id":"C-0001","text":"…","location":"CONTENT/ch01.md#L12","author":"R3","source":null,"verdict":"PENDING","verifier":null,"evidence":[],"verifiedAt":null}
```

- `author` is the role/session that wrote the claim. `verifier` must differ.
- `verdict`: PENDING → VERIFIED | WRONG | UNVERIFIABLE. VERIFIED needs
  `evidence` (URLs or `valice-house/verified-facts/facts.jsonl#<fact_id>`).
- A WRONG or UNVERIFIABLE load-bearing claim is cut from the manuscript
  before gate 5 can pass. `scripts/factory/claim-lint.mjs` enforces all of this.
