# Factory Workflow

Staged-parallel production. A month's slate advances **together**; a stage runs as a batch
across every title in the slate; **no title enters the next stage until it has passed the
gate that guards it** (`gates.json`, `state-machine.json`). Ten titles may fail cheaply at
gate 3 together; they never fail expensively at gate 10 one by one.

## 1. Pipeline

```
SLATE → MARKET GATE(1) → RIGHTS GATE(2) → SPEC → DRAFT BATCH(4) → SIMILARITY(3)
      → FACT CHECK(5) → EDITORIAL(6) → DESIGN(7) → FORMAT(8) → METADATA(9)
      → COMPLIANCE(10) → UPLOAD / PROOF → WEB QA(11) → FOUNDER APPROVAL(12)
      → PUBLISH → MEASURE
```

| Stage | Input | Output | Role | Gate | Command |
|---|---|---|---|---|---|
| SLATE | series bibles, niche matrices, PD candidate DB | list of projects created from the template | R9 (creates), founder (chooses) | — | `node scripts/factory/new-project.mjs --slug <slug> --series <s> --lane <A/B/C>` |
| MARKET GATE | slate | `MARKET.md`, `QA/market.json` per title | R1 (once per slate) | 1 | `node scripts/factory/gate.mjs <p> set 1 passed --evidence MARKET.md --owner R1` |
| RIGHTS GATE | source lists | `RIGHTS.md`, ledger rows, `QA/rights-lint.json` | R6 → founder | 2 | `node scripts/factory/rights-lint.mjs <p>` · `gate.mjs <p> set 2 passed --owner founder --evidence RIGHTS.md` |
| SPEC | market + rights | `SPEC.md`, `OUTLINE.md`, config updates | R2 | — | `node scripts/strategy/price-engine.mjs …` (pasted into SPEC.md) · `state.mjs <p> to SPEC_READY` |
| DRAFT BATCH | spec | `CONTENT/`, `CLAIMS.jsonl`, `QA/draft-lint.json`, `QA/pilot.md` | R3 (3–4 titles in parallel, one context each) | 4 | `node scripts/factory/draft-lint.mjs <p>` |
| SIMILARITY | drafts + corpus | `QA/similarity.json` | R8 (corpus loaded once) | 3 | `node scripts/factory/similarity.mjs <p>` |
| FACT CHECK | drafts + claim list + house facts | `CLAIMS.jsonl` with verdicts, facts appended, `QA/claim-lint.json` | R4 (fresh session) → founder | 5 | `node scripts/factory/claim-lint.mjs <p>` · `state.mjs <p> to EDITING` (founder-only) |
| EDITORIAL | verified draft | edited `CONTENT/`, `QA/style-lint.json`, `QA/editorial-notes.md` | R5 | 6 | `node scripts/factory/style-lint.mjs <p>` · `claim-lint.mjs` re-run |
| DESIGN | edited text, spec | `ASSETS/cover/*`, `DESIGN/COVER_BRIEF.md`, illustrations, companion assets, `QA/cover-check.json` | R7 → founder | 7 | `node scripts/covers/generate-cover.mjs --project <p> --slot front` (dry-run default) · `node scripts/factory/cover-check.mjs <p>` |
| FORMAT | text + covers | `OUTPUT/<FORMAT>/*`, EPUB, digital edition, `QA/preflight.json` | R7 → founder (Previewer + proof) | 8 | `python3 preflight.py` · `scripts/catalog/build-digital-editions.mjs` |
| METADATA | built book | `METADATA.md`, `QA/metadata-lint.json` | R8 | 9 | `node scripts/factory/metadata-lint.mjs <p>` |
| COMPLIANCE | everything | `QA/compliance-lint.json`, AI-disclosure answer | R8 → founder | 10 | `node scripts/factory/compliance-lint.mjs <p>` |
| UPLOAD / PROOF | package | KDP draft, Previewer pass, proof id | founder (R9 prepares `OUTPUT/KDP_UPLOAD_PACKAGE.md`) | 8 evidence | — (KDP UI) |
| WEB QA | catalogue diff, assets | `QA/validate-catalog.json`, companion entry | R9 | 11 | `node scripts/covers/ingest-covers.mjs --slug <s>` · `node scripts/catalog/validate-catalog.mjs --slug <s>` |
| FOUNDER APPROVAL | the diff | commit hash, KDP submission id | founder | 12 | `gate.mjs <p> set 12 passed --owner founder --evidence <commit>` · `state.mjs <p> to APPROVED` |
| PUBLISH | approval | live listing, ASIN fetched 200, store entry | R9 | — | `load-catalog.mjs --commit --i-know-this-is-production` · `state.mjs <p> to PUBLISHED` |
| MEASURE | reports | `data/metrics/*.csv`, cost totals, status report | R9 | — | `scripts/analytics/*.mjs` · `node scripts/factory/cost-ledger.mjs summary` · `node scripts/factory/status.mjs` |

Gate ids are from `gates.json`; state names from `state-machine.json`. Every gate command
refuses `passed` without `--evidence` and `--owner`, and refuses a founder gate from a
non-founder owner.

## 2. Parallelism rule

Titles run in parallel **only** when they are at the same stage and have all passed the
previous gate. A title that fails a gate leaves the batch (state `BLOCKED`, reason
recorded) and rejoins the next slate at the stage it failed. A stage never waits for a
blocked title.

## 3. Monthly rhythm (wall-clock; stages overlap because they are batched)

| Week | Lane A slate (3–4) | Lane C (1–2) | Lane B (quarterly) | Founder |
|---|---|---|---|---|
| 1 | slate created; R1 market pass; R6 rights; R2 specs | source selection, rights, OCR pull | research block | gates 1–2; niche decisions |
| 2 | R3 drafts; R8 similarity; R4 verification | apparatus drafting; R4 | draft block | gate 5 signatures |
| 3 | R5 edit; R7 interiors + covers; R8 metadata | edit; illustrations; interior | illustration | gate 7 covers |
| 4 | gate 10; upload; Previewer; proof orders; format ladder | direct publish; companion | review | gates 10, 12; launch |
| continuous | maintenance on the live catalogue (`validate:catalog` weekly, metrics monthly) | | | ads, pricing, quarterly portfolio review |

## 4. Lane multipliers (wall-clock and hours)

| | Lane A — Franchise | Lane B — Flagship | Lane C — Public Domain |
|---|---|---|---|
| Output | 3–4 / month | 1 / quarter | 1–2 / month |
| Agent hours | 12–18 | 80–150 | 30–60 |
| Founder hours | ~3.5 + proof turnaround | 15–25 | 5–8 |
| Wall-clock | 3–4 weeks | 10–14 weeks | 4–6 weeks |
| Extra gate checks | usability pilot (gate 4) | 3 external readers (gate 4) | differentiation measure (gate 9), PD title tag (gate 10) |

Sustainable rate: 5 content projects per month (A 3 + C 1–2) plus one B per quarter. Peaks of
8–10 are allowed for at most two consecutive months inside an established template, then a
recovery month.

## 5. Failure handling

- A lint or check that is red → the gate stays `failed` with the tool's output as evidence;
  the owning role reworks; nothing downstream starts.
- A gate whose kill criterion fires → `node scripts/factory/state.mjs <p> to BLOCKED --reason "<text>"`;
  the reason names the gate and the criterion. Unblocking (`state.mjs <p> to <previous>`) needs
  a reason too, and re-runs the gate.
- A title that cannot be fixed → `KILLED` (founder-only, with reason). Killed titles keep
  their directory; their rights rows and facts stay in the house memory.
- A founder waiver is `gate.mjs <p> waive <id> --reason …` (never for gates 2, 5, 10, 12) and
  is recorded as an override in `DECISIONS.md`.
- A stage that found a defect in the house files (a wrong fact, a stale rule) fixes the house
  file first, then the title — that is what makes the next book cheaper.

## 6. Where things live

Project directories follow the existing convention under `MY-DİGİTAL-BOOK/<NAME>/` with the
template's files added (`MARKET.md`, `RIGHTS.md`, `SPEC.md`, `OUTLINE.md`, `CLAIMS.jsonl`,
`CONTENT/`, `DESIGN/`, `ASSETS/`, `OUTPUT/`, `QA/`, `gates.json`, `.gate`, `DECISIONS.md`,
`project_config.json`, `kill_gate.py`, `selftest.py`, `preflight.py`). Storefront assets are
derived into this repository by the ingestion scripts; the catalogue is
`scripts/catalog/valice-catalog.mjs`.
