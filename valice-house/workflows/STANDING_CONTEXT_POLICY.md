# Standing Context Policy

What each role may load into its working context, what it may never load, and how the
house memory stays honest. The policy exists to prevent five failures: hidden
contamination (an agent "confirming" what it was told), circular verification, stale
context, rights leakage, and unnecessary token cost.

## 1. Matrix — roles × files

`✓` may load · `○` may load only the named subset · `✗` forbidden.

| File / directory | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 |
|---|---|---|---|---|---|---|---|---|---|
| `valice-house/README.md`, `workflows/*` | ✓ | ✓ | ✓ | ○ (this policy only) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `house-style/HOUSE_STYLE.md` | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ○ (typography) | ○ (naming) | ✗ |
| `series-bibles/<series>.md` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ○ (cross-sell rules) |
| `verified-facts/facts.jsonl` | ○ (read) | ✗ | ○ (read, reuse by id) | ✓ (read + append) | ✗ | ✗ | ✗ | ✗ | ✗ |
| `rejected-facts/rejected.jsonl` | ✓ (read + append) | ✗ | ✓ (read) | ✓ (read + append) | ✗ | ✗ | ✗ | ✗ | ✗ |
| `rights/*` | ✗ | ○ (RIGHTS.md of the project) | ○ (RIGHTS.md of the project) | ✗ | ✗ | ✓ | ○ (image/font rows) | ○ (PD/asset rows) | ✗ |
| `metadata/METADATA_STANDARDS.md` | ✗ | ✓ | ✗ | ✗ | ○ (heading forms) | ✗ | ✗ | ✓ | ✓ |
| `covers/COVER_STANDARDS.md` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ○ (thumbnail rule) | ✗ |
| `kdp/*` | ✗ | ○ (page ranges) | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ○ (upload package) |
| `qa/QA_CHECKLIST.md`, `naming/NAMING.md` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| project `MARKET.md`, `QA/market.json` | ✓ (writes) | ✓ | ✗ | ✗ | ✗ | ○ (competitor editions) | ✗ | ✓ | ✗ |
| project `RIGHTS.md` | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ (writes) | ✓ | ✓ | ✗ |
| project `SPEC.md`, `OUTLINE.md` | ✗ | ✓ (writes) | ✓ | ✗ | ○ (budget + audience) | ✗ | ✓ | ✓ | ✗ |
| project `CONTENT/` | ✗ | ✗ | ✓ (writes) | ✓ (untrusted input) | ✓ (writes) | ✗ | ✓ (read) | ✓ (read) | ✗ |
| project `CLAIMS.jsonl` | ✗ | ✗ | ✓ (writes claims; never verdicts) | ✓ (writes verdicts) | ✓ (read) | ✗ | ✗ | ✗ | ✗ |
| author notes / author session transcript | ✗ | ✗ | own | **✗ never** | ✗ | ✗ | ✗ | ✗ | ✗ |
| project `QA/*.json` | own | ✗ | own | own | own | own | own | own | ✓ |
| project `OUTPUT/`, `ASSETS/` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (writes) | ✓ (read) | ✓ |
| protected solution layers (e.g. `01_SOURCE/solutions/`) | ✗ | ✗ | own title only | ○ (only to verify a printed answer) | ✗ | ✗ | ○ (only the plates the interior prints) | ✗ | ✗ |
| production env (`scripts/tmp/.env.production`) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (pull, use, delete) |

## 2. The verifier rule (the one that matters most)

R4 receives exactly four things: `CONTENT/`, `CLAIMS.jsonl`, `facts.jsonl`, `rejected.jsonl`
— plus whatever primary sources it opens itself. It never receives the brief, the market
file, the author's notes, the author's reasoning, or a conversation with the author. If the
same session, agent run or model context that drafted a title is asked to verify it, the
verification is void: `claim-lint` rejects verdicts whose `verifier` equals the claim's
`author`, and the founder re-runs R4 in a new session.

## 3. Freshness

- Every role re-reads its allowed house files **at the start of every stage**. A cached
  copy from an earlier stage is a defect; the house files change between stages (R4 appends
  facts, R6 supersedes ledger rows).
- A role that loaded a file before another role appended to it must reload before writing.
- `status.mjs` records `updatedAt` per gate; a gate whose evidence predates a later change
  to its inputs is flagged `stale` and must be re-run.

## 4. Rights leakage

- Protected layers (puzzle solutions, answer keys, unreleased plates, the Enigmatica final
  word) never enter a prompt except for R4 verifying a printed answer or R7 building the
  page that physically prints it — and only the specific file, named in `DECISIONS.md`.
- Third-party source texts enter a context only if `RIGHTS.md` lists them. An agent that
  needs a source not in `RIGHTS.md` stops and files an `A#`; it does not "just read it".
- CC `NC`/`ND` material never enters a commercial project's context at all.
- Production secrets are pulled by R9 only, into `scripts/tmp/`, and deleted after use.
  Nothing under `valice-house/` may contain a credential.

## 5. Token cost

- **Batch by stage, not by book.** R1 runs once per slate; R8's similarity check loads the
  corpus once for the whole slate; R7 reuses the series build scripts rather than
  reconstructing them per title.
- Load only the matrix's `✓`/`○` files. `README.md` is short by design; do not load the
  master roadmap or strategy documents into production sessions.
- Every model call attributable to a project is appended to `valice-house/cost/ledger.jsonl`
  by `scripts/factory/cost-ledger.mjs` (tokens, images, OCR, dollars), so cost per content
  project is a number, not a feeling.

## 6. Founder overrides

A founder may waive a gate. The record is `status: "waived"` in the project's `gates.json`
with `owner: "founder"`, a reason, and a timestamp — written by `gate.mjs waive`. A waiver is
never rewritten as `passed`, never changes a measurement (`0 external solvers` stays `0`),
and is carried into `DECISIONS.md` as a `K##` whose text begins with `FOUNDER OVERRIDE`.
Gates 2, 5, 10 and 12 cannot be waived; they are passed by the founder or not at all.
