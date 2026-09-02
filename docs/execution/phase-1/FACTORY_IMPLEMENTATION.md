# Valice Publishing Factory — Implementation (Phase 1)

Installed 2026-09-02. This is the operator's manual for what exists in the
repository today; the design it implements is
`PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md`, and the business rules it
enforces are in `valice-house/`.

## 1. Directory structure

```
valice-house/                       standing context + memory (committed)
  README.md                         what this is, who edits what
  house-style/HOUSE_STYLE.md        voice, spelling, headings, sourcing, reading levels + JSON for style-lint
  series-bibles/                    valice-script · codex · the-great-book-of · field-book · valice-classics
  verified-facts/facts.jsonl        append-only verified facts (schema in SCHEMA.md)
  rejected-facts/rejected.jsonl     append-only rejected claims
  rights/ledger.csv                 rights ledger, one row per work/translation/illustration/apparatus/data layer
  rights/RIGHTS_GATE.md             GREEN/YELLOW/RED rules; SCHEMA.md
  metadata/METADATA_STANDARDS.md    title/subtitle/keyword/category rules + JSON for metadata-lint
  covers/COVER_STANDARDS.md         slots, sizes, series identities
  kdp/COMPLIANCE_CHECKLIST.md       Gate 10 sheet; PREFLIGHT_RULES.md (the real KDP rejections as rules)
  qa/QA_CHECKLIST.md                Gate 8 / Gate 11 checklists
  naming/NAMING.md                  asset, key and directory naming
  workflows/gates.json              the 12 gates (source of truth)
  workflows/state-machine.json      the content-project states and transitions (source of truth)
  workflows/GATES.md · STATE_MACHINE.md · WORKFLOW.md · STANDING_CONTEXT_POLICY.md
  workflows/roles/R1…R9-*.md        the nine role contracts
  templates/project-template/       the new-book template (see §4)
  cost/ledger.jsonl                 per-project AI/API cost (created on first entry)

scripts/factory/                    Node ESM, no dependencies beyond the repo
  lib/project.mjs · lib/lint.mjs    shared helpers (project loading, evidence rules, report shape, CSV/JSONL)
  new-project.mjs                   instantiate a project from the template
  gate.mjs · state.mjs              gate evidence + state transitions (enforced)
  rights-lint.mjs · claim-lint.mjs · draft-lint.mjs · style-lint.mjs · similarity.mjs
  metadata-lint.mjs · compliance-lint.mjs · cover-check.mjs
  preflight.py                      PDF pre-upload checks (poppler)
  status.mjs                        machine-readable shelf status
  cost-ledger.mjs                   append/summarise cost entries
  factory.test.js                   25 vitest tests over all of the above
scripts/covers/
  ingest-covers.mjs                 assets/<slug>/cover/front-v<n>.png → public/images/books/<slug>.webp
  generate-cover.mjs                budget-guarded OpenAI image wrapper (dry-run default, $4 cap)
scripts/catalog/
  validate-catalog.mjs              Gate 11 / weekly catalogue integrity against production
assets/                             founder drop folder (gitignored except .gitkeep)
docs/execution/factory-status.json  last `status.mjs --out` snapshot
```

## 2. Agent roles

Nine roles, each with a contract in `valice-house/workflows/roles/`:
R1 Slate Researcher (Gate 1) · R2 Architect · R3 Author (Gate 4) · R4 Verifier
(Gate 5, never the author) · R5 Editor (Gate 6) · R6 Rights Clerk (Gate 2 →
founder) · R7 Designer (Gates 7–8) · R8 Metadata + Compliance (Gates 3, 9, 10)
· R9 Publisher (Gates 11–12). What each role may read is the matrix in
`STANDING_CONTEXT_POLICY.md`; R4 receives only the draft, `CLAIMS.jsonl` and
the two fact ledgers.

## 3. Gates and states

- Gate record per project: `gates.json` — `status` ∈ not_started · in_progress
  · passed · failed · waived; `passed` needs evidence (existing file, URL,
  `commit:<sha>` or `kdp:<id>`) and an owner; founder gates (2, 5, 7, 8, 10,
  12) need `--approved-by founder`; `waived`/`failed` need a reason.
- State record per project: `state.json` + `.gate` (lower-cased state, for
  the legacy convention). Transitions and the gates they require are in
  `state-machine.json`; never-skip gates 2, 5, 10, 12 cannot be satisfied by
  a waiver; founder-only transitions need `--by founder`; BLOCKED needs a
  reason and returns only to the previous state; KILLED is founder-only.
- Format readiness is separate: `project_config.json → formats[].status`
  (not_planned → planned → built → preflight_ok → uploaded → in_review →
  live → withdrawn); `kill_gate.py` refuses `uploaded`/`in_review`/`live`
  formats on a project that is not yet APPROVED.

## 4. Project lifecycle and template

```
node scripts/factory/new-project.mjs --slug <slug> --title "…" --series <valice-script|codex|the-great-book-of|field-book|valice-classics> --lane A|B|C [--dest <books-root>] --commit
```
creates `<books-root>/<SLUG-UPPER-KEBAB>/` with:

```
DECISIONS.md          K##/A# register (K1 instantiation; A1–A3 open)
project_config.json   single source of truth; `measured` written by scripts only
gates.json · state.json · .gate
kill_gate.py · selftest.py   (python3, no dependencies)
MARKET.md · RIGHTS.md · SPEC.md · OUTLINE.md · CLAIMS.md · CLAIMS.jsonl
CONTENT/ DESIGN/ ASSETS/{cover,interior,paperback,hardcover,large-print,ebook,kindle,companion}/ OUTPUT/ QA/
```
Every narrative file says NOT STARTED until a role fills it. Nothing in the
template invents content.

Stage order (WORKFLOW.md): SLATE → MARKET (gate 1) → RIGHTS (gate 2) → SPEC →
DRAFT (gates 3–4) → FACT CHECK (gate 5) → EDITORIAL (gate 6) → DESIGN (gate 7)
→ FORMAT (gate 8) → METADATA/COMPLIANCE (gates 9–10) → UPLOAD/PROOF → WEB QA
(gate 11) → FOUNDER APPROVAL (gate 12) → PUBLISH → MEASURE. Titles move in
parallel only when they are at the same stage and passed the previous gate.

## 5. Naming and assets

`valice-house/naming/NAMING.md`. Project directories UPPER-KEBAB under the
books root; slugs lower-kebab everywhere else; cover slots
`front-v<n>.png` (≥ 2400×3600, 1:1.5), `kindle-v<n>.jpg` (1600×2560),
`paperback-wrap-v<n>.pdf` / `hardcover-wrap-v<n>.pdf` (≤ 40 MB, one page);
versions are never overwritten. Storefront webp is derived, never hand-made.

## 6. Quality tooling — what each command actually checks

| Command | Checks | Output |
|---|---|---|
| `gate.mjs <dir> set <id> <status> …` | evidence exists; founder gates; reasons | gates.json |
| `state.mjs <dir> to <STATE> --by …` | transition allowed; gates satisfied; never-skip | state.json, .gate |
| `rights-lint.mjs [--project]` | ledger columns/ids/statuses; GREEN needs evidence+date+founder; NC never GREEN; SA ≤ YELLOW; project sources resolve and are GREEN | QA/rights-lint.json |
| `claim-lint.mjs --project` | fields; verifier ≠ author; VERIFIED has evidence; fact ids exist; rejected-fact matches; gate-5 readiness | QA/claim-lint.json |
| `draft-lint.mjs --project` | placeholders; word budget from SPEC.md; required sections; sentence length by audience; rejected statements; measured words | QA/draft-lint.json |
| `style-lint.mjs --project\|--file` | banned phrases (HOUSE_STYLE JSON); single H1; no heading skips; max depth | QA/style-lint.json |
| `similarity.mjs --project` | 8-gram containment vs other manuscripts and the blog; threshold 15 % | QA/similarity.json |
| `metadata-lint.mjs --project` | numbers in title/subtitle must be measured; ≤ 7 keywords ≤ 50 chars, banned terms, no category words; PD title tag; description 200–4000; author bio present | QA/metadata-lint.json |
| `compliance-lint.mjs --project` | AI disclosure decided by founder; PD differentiation; ink/hardcover; page ranges; Select vs direct; bonus ≤ 10 %; no form links; printed URL shape | QA/compliance-lint.json |
| `cover-check.mjs <path>\|--project` | PNG/JPEG headers: size, ratio, colour chunk; wrap PDFs one page ≤ 40 MB; slot naming | QA/cover-check.json |
| `preflight.py <pdf> [--expect-pages --trim --kind]` | opens; every font embedded (pdffonts); Title/Author metadata; page count/range; trim; cover ≤ 40 MB | --json file |
| `validate-catalog.mjs [--env]` | catalogue invariants; covers/previews; ASIN 200; page 200 + canonical + JSON-LD; sitemap coverage; Paddle price active and equal; R2 master exists | docs/execution/validate-catalog.json |
| `status.mjs [--root] [--out]` | one row per project: stage, next gate, owner, status, blocked reason, founder action | JSON + table |
| `cost-ledger.mjs add\|summary` | append-only cost per project; summary by kind | valice-house/cost/ledger.jsonl |
| `ingest-covers.mjs --slug [--commit]` | latest front-v<n>.png → validated → webp 1600 px q82 ≤ 400 KB | public/images/books/<slug>.webp |
| `generate-cover.mjs --slug --prompt [--commit]` | $4 cap from ledger + estimate; dry-run default; key only from env; output to generated/, never a slot | assets/.image-ledger.json + cost ledger |

A lint never reports success it did not measure: a check that cannot run is
`SKIPPED` and shown.

## 7. Failure handling

A failed lint or a `failed` gate leaves the state unchanged; the operator
records the reason (`gate.mjs … failed --reason`), the project moves to
BLOCKED with a reason if work cannot continue, and returns to the previous
state when the blocker is cleared. A founder override is a `waived` gate
with a reason — visible as such in `status.mjs`, never displayed as a pass —
and cannot satisfy gates 2, 5, 10 or 12.

## 8. Founder checkpoints

Gate 2 (rights), Gate 5 (facts), Gate 7 (cover), Gate 8 (Previewer/proof),
Gate 10 (KDP compliance incl. AI disclosure), Gate 12 (publication diff).
`status.mjs` prints the pending founder action per project.

## 9. Commands (npm aliases)

```
npm run factory:new -- --slug … --title "…" --series … --lane … --commit
npm run factory:gate -- <dir> show | set <id> <status> --evidence … --owner … [--approved-by founder]
npm run factory:state -- <dir> show | to <STATE> --by …
npm run factory:status -- [--root <books-root>] [--out docs/execution/factory-status.json]
npm run validate:catalog -- [--env scripts/tmp/.env.production]
npm run covers:ingest -- --slug <slug> [--commit]
npm run covers:generate -- --slug <slug> --prompt "…" [--commit]
node scripts/factory/<lint>.mjs --project <dir>
python3 scripts/factory/preflight.py <pdf> --expect-pages N --trim WxH
python3 <dir>/selftest.py · python3 <dir>/kill_gate.py
```

## 10. Worked example — the Greek workbook proof

```
node scripts/factory/new-project.mjs --slug greek-alphabet-handwriting-workbook \
  --title "The Greek Alphabet Handwriting Workbook: Modern and Classical" --series valice-script --lane A --commit
node scripts/factory/state.mjs "$B/GREEK-ALPHABET-HANDWRITING-WORKBOOK" to RESEARCH --by R1 --reason "template proof"
python3 "$B/GREEK-ALPHABET-HANDWRITING-WORKBOOK/selftest.py"      # ok
python3 "$B/GREEK-ALPHABET-HANDWRITING-WORKBOOK/kill_gate.py"     # BLOCKED — never-skip gates not passed (correct)
node scripts/factory/rights-lint.mjs --project …                  # RL-0020 YELLOW → Gate 2 not ready (correct)
node scripts/factory/status.mjs                                   # stage RESEARCH · next gate 1 · owner R1
```
The project holds plan values (trim, ink, price band from the price engine,
companion slug) and no measured counts, no market data, no content: exactly
the state a real project is in before R1 starts.
