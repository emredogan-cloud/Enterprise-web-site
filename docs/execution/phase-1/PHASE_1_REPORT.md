# Phase 1 — Publishing Factory Foundation

**Date:** 2026-09-02 · **Branch:** `feat/production-readiness` · **Design implemented:** `PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md` · **Operator manual:** `docs/execution/phase-1/FACTORY_IMPLEMENTATION.md`

Status vocabulary: **DONE** = code exists and is tested · **PARTIAL** = some implementation exists · **BLOCKED** = external dependency · **NOT STARTED** = deferred on purpose.

---

## 1. What was built

| Item | Status | Evidence |
|---|---|---|
| `valice-house/` factory memory (13 directories, 34 files) | DONE | tree in FACTORY_IMPLEMENTATION.md §1 |
| House style with a machine-readable block | DONE | `house-style/HOUSE_STYLE.md`; read by `style-lint` |
| Five series bibles | DONE | `series-bibles/*.md` |
| Verified / rejected fact ledgers (schema + 8 / 4 real seed entries) | DONE | `verified-facts/facts.jsonl`, `rejected-facts/rejected.jsonl` |
| Rights ledger (20 rows: 8 live books, Batch 1–2 public-domain sources, Greek project) + rights gate rules | DONE | `rights/ledger.csv`, `RIGHTS_GATE.md`; `rights-lint` passes on the ledger |
| Metadata / cover / KDP compliance / preflight rules / QA / naming standards | DONE | `metadata/`, `covers/`, `kdp/`, `qa/`, `naming/` |
| Twelve quality gates (definition + per-project record + enforcement) | DONE | `workflows/gates.json`, `scripts/factory/gate.mjs`, tests |
| Book state machine (19 states, guarded transitions, never-skip 2/5/10/12) | DONE | `workflows/state-machine.json`, `scripts/factory/state.mjs`, tests |
| Format state (per-format readiness separate from the project) | DONE | `project_config.json → formats[].status`; enforced by `kill_gate.py` |
| Nine role contracts + standing-context policy + workflow + state/gate docs | DONE | `workflows/roles/R1…R9`, `STANDING_CONTEXT_POLICY.md`, `WORKFLOW.md`, `STATE_MACHINE.md`, `GATES.md` |
| Project template (DECISIONS, config, gates, state, kill_gate.py, selftest.py, MARKET/RIGHTS/SPEC/OUTLINE/CLAIMS, CONTENT/DESIGN/ASSETS/OUTPUT/QA) | DONE | `templates/project-template/`; instantiated twice today |
| Lints: rights, claim, draft, style, similarity, metadata, compliance, cover-check | DONE | `scripts/factory/*.mjs`; 25 tests |
| PDF preflight (fonts embedded, metadata, pages, trim, cover size) | DONE | `scripts/factory/preflight.py`; run on all 7 interiors |
| Catalogue validation against production (Gate 11) | DONE | `scripts/catalog/validate-catalog.mjs`; 18 pass today |
| Deterministic cover ingestion | DONE | `scripts/covers/ingest-covers.mjs`; synthetic 2400×3600 PNG → 1067×1600 webp proven, then removed |
| Budget-guarded image generation wrapper | DONE (dry-run + guard tested; no real call made — no key exists) | `scripts/covers/generate-cover.mjs`; refusal at $4 cap demonstrated |
| Cost ledger | DONE | `scripts/factory/cost-ledger.mjs`; tests |
| Factory status report | DONE | `scripts/factory/status.mjs`; `docs/execution/factory-status.json` |
| Greek template proof | DONE | `MY-DİGİTAL-BOOK/GREEK-ALPHABET-HANDWRITING-WORKBOOK/` (see §7) |

## 2. What was modified

- `package.json`: npm aliases `validate:catalog`, `factory:*`, `covers:*`.
- `.gitignore`: `/assets/*` (drop folder) except `.gitkeep`; image ledger.
- No existing book repository was modified; no existing catalogue row changed; no database write.

## 3. New directories / files

```
valice-house/                        (34 files)
scripts/factory/                     lib/project.mjs lib/lint.mjs new-project.mjs gate.mjs state.mjs status.mjs
                                     cost-ledger.mjs rights-lint.mjs claim-lint.mjs draft-lint.mjs style-lint.mjs
                                     similarity.mjs metadata-lint.mjs compliance-lint.mjs cover-check.mjs preflight.py
                                     factory.test.js
scripts/covers/                      ingest-covers.mjs generate-cover.mjs
scripts/catalog/validate-catalog.mjs
assets/.gitkeep
docs/execution/                      FOUNDER_ACTIONS.md phase-0/PHASE_0_REPORT.md phase-1/PHASE_1_REPORT.md
                                     phase-1/FACTORY_IMPLEMENTATION.md factory-status.json validate-catalog.json
MY-DİGİTAL-BOOK/GREEK-ALPHABET-HANDWRITING-WORKBOOK/   (outside this repo; the template proof)
```

## 4. Agent roles implemented

R1 Slate Researcher · R2 Architect · R3 Author · R4 Verifier · R5 Editor · R6 Rights Clerk · R7 Designer · R8 Metadata + Compliance · R9 Publisher — each with inputs, outputs, allowed/forbidden context, gates, quality criteria, failure, handoff and a prompt skeleton. The verifier-is-never-the-author rule is enforced in code (`claim-lint`: `verifier === author` is an error) as well as in the contract.

## 5. Quality gates implemented

| Gate | Enforcement today |
|---|---|
| 1 Market fit | evidence required to pass (`MARKET.md` + BSR sample); gate record |
| 2 Rights | `rights-lint` (ledger + project sources GREEN); founder approval required; never-skip |
| 3 Originality | `similarity.mjs` (8-gram containment, 15 % threshold) |
| 4 Content quality | `draft-lint` (placeholders, budget, sections, sentence length, rejected facts) |
| 5 Facts | `claim-lint` (verifier ≠ author, evidence, fact ids, no PENDING/WRONG); founder sign-off; never-skip |
| 6 Editorial | `style-lint` (banned phrases, headings) |
| 7 Cover | `cover-check` (PNG/JPEG headers, ratio, colour chunk, wrap PDFs); founder approval |
| 8 Interior / proof | `preflight.py`; founder approval (Previewer/proof are human steps, recorded as evidence) |
| 9 Metadata | `metadata-lint` (measured counts, keyword rules, PD tag, description, author bio) |
| 10 KDP compliance | `compliance-lint` (AI disclosure decided, PD, ink, pages, Select, bonus, links, printed URL); founder; never-skip |
| 11 Website product QA | `validate-catalog.mjs` |
| 12 Founder publication approval | evidence = commit hash of the publication diff; founder; never-skip |

Every gate record carries status, evidence, owner, updatedAt, approvedBy, reason. `"passed"` without evidence is impossible through the tooling and is caught by `selftest.py` if edited by hand.

## 6. Automation implemented

Listed with what they check in FACTORY_IMPLEMENTATION.md §6. None returns success without running its checks; a check that cannot run is reported `SKIPPED`.

## 7. Tests executed

| Test | Result |
|---|---|
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| `npm test` | 175/175 (factory suite: 25 tests — template instantiation and refusal to overwrite, dry run, selftest/kill_gate on a fresh project, gate evidence/founder/waiver rules, state transitions incl. never-skip waiver refusal, BLOCKED/KILLED, rights ledger rules, claim self-verification, draft/style/metadata/compliance rules, similarity, PNG header parsing, budget guard, cost ledger) |
| `npm run build` | success |
| Template generation (dry run + commit) | scratch project `SMOKE-TEST-BOOK` and real project `GREEK-ALPHABET-HANDWRITING-WORKBOOK` |
| Gate transition / failed gate / blocked state | `gate.mjs set 1 passed` refused without evidence (exit 2), accepted with `MARKET.md`; `state.mjs to RIGHTS_APPROVED --by R6` refused (founder-only); tests cover BLOCKED and failed |
| Rights gate | `rights-lint` on the house ledger: 20 rows, ok; on the Greek project: YELLOW source → “Gate 2 not ready” |
| Output structure | tree listed in FACTORY_IMPLEMENTATION.md §10 |
| Asset validation | `cover-check` on an 800×1000 PNG: size + ratio errors; on a 2400×3600 PNG: pass |
| Cover ingestion dry run + commit | webp written 1067×1600, 5 KB; removed afterwards |
| Image budget guard | dry run prints estimate; `--commit` without key refused (exit 2); ledger at $3.99 + $0.25 call refused (exit 3) |
| Report generation | `status.mjs --out docs/execution/factory-status.json` (1 factory project + 6 legacy repos) |
| Preflight on all 7 real interiors | 6 ok; Field Book fails metadata (untitled/anonymous — a known, recorded defect) |

## 8. Test results (numbers)

175 tests green; 0 lint errors; 0 type errors; build green; validate-catalog 18 pass / 2 warn (sitemap routes awaiting deploy) / 0 error.

## 9. Existing projects affected

None modified. `status.mjs` reads the six legacy repositories that carry `project_config.json` and lists them as `legacy:<.gate>`; Codex Bestiarium and Codex Mythologica (which use `book.json`) are not listed — a Phase 2 adapter can read them. The new project `GREEK-ALPHABET-HANDWRITING-WORKBOOK` was created next to them from the template.

## 10. Risks

- The lints check structure and rules, not truth: a wrong fact with a plausible citation passes `claim-lint` — Gate 5 remains a human verification step by design.
- `similarity.mjs` compares only markdown/text sources; the legacy repositories keep manuscripts in JSON (`book.json`) — an adapter is needed before Gate 3 covers the Codex line.
- `generate-cover.mjs` estimates cost from unverified tokens-per-image figures until the first real response fills in `usage`; the cap is enforced on estimates, so the first calls will be conservative.
- `status.mjs` legacy rows use each repository's own `project.slug`, which differs from the storefront slug for two titles.

## 11. Founder actions

See `docs/execution/FOUNDER_ACTIONS.md` (URGENT U1–U3, REQUIRED R1–R8, OPTIONAL O1–O4). Nothing that the agent completed is listed there.

## 12. What remains for Phase 2

- Fill the Greek project: R1 market sample (Gate 1), source selection and ledger rows (Gate 2), SPEC and lesson template, then the first real slate.
- `scripts/seo/gsc-export.mjs` (needs R7), `scripts/analytics/import-kdp.mjs` (needs O4 exports), Amazon Attribution links (needs R8).
- Adapter so `similarity.mjs`/`status.mjs` read `book.json` repositories.
- EPUB check (`epubcheck`) in preflight; `differentiation.mjs` for public-domain editions.
- Weekly CI job running `validate:catalog` and the lints on every factory project.

## 13. Exact commands for operating the factory

```
# create a project
npm run factory:new -- --slug the-puzzles-of-henry-dudeney --title "The Puzzles of Henry Dudeney" --series valice-classics --lane C --commit

# move and gate
npm run factory:state -- "$B/THE-PUZZLES-OF-HENRY-DUDENEY" to RESEARCH --by R1
npm run factory:gate  -- "$B/THE-PUZZLES-OF-HENRY-DUDENEY" set 1 passed --owner R1 --evidence MARKET.md
npm run factory:gate  -- "$B/THE-PUZZLES-OF-HENRY-DUDENEY" set 2 passed --owner R6 --evidence RIGHTS.md --evidence valice-house/rights/ledger.csv --approved-by founder
npm run factory:state -- "$B/THE-PUZZLES-OF-HENRY-DUDENEY" to RIGHTS_APPROVED --by founder

# lints (each writes QA/<tool>.json)
node scripts/factory/rights-lint.mjs --project "$B/…"
node scripts/factory/draft-lint.mjs --project "$B/…"
node scripts/factory/similarity.mjs --project "$B/…"
node scripts/factory/claim-lint.mjs --project "$B/…"
node scripts/factory/style-lint.mjs --project "$B/…"
node scripts/factory/metadata-lint.mjs --project "$B/…"
node scripts/factory/compliance-lint.mjs --project "$B/…"
node scripts/factory/cover-check.mjs --project "$B/…"
python3 scripts/factory/preflight.py "$B/…/OUTPUT/paperback/interior.pdf" --expect-pages 220 --trim 6x9
python3 "$B/…/selftest.py" && python3 "$B/…/kill_gate.py"

# covers and catalogue
npm run covers:ingest -- --slug the-puzzles-of-henry-dudeney --commit
npm run covers:generate -- --slug the-puzzles-of-henry-dudeney --prompt-file "$B/…/DESIGN/cover-prompt.md"   # dry run; add --commit to spend
npm run validate:catalog -- --env scripts/tmp/.env.production
npm run factory:status -- --out docs/execution/factory-status.json
node scripts/factory/cost-ledger.mjs add --project the-puzzles-of-henry-dudeney --kind tokens --usd 12.40 --units 1030000 --stage draft
```
(`B=/home/emre/Downloads/MY-DİGİTAL-BOOK`)
