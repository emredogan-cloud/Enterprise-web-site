# valice-house — the factory's standing context and memory

`valice-house/` is what every agent in the Valice Press publishing factory loads before it
works, and what it writes back to when it learns something. It is the compounding asset:
the style guide, the series bibles, the verified and rejected facts, the rights ledger, the
cover and metadata standards, the KDP compliance rules and the project template are what
make title #40 cheaper than title #4 without making it worse.

It sits above the individual book projects (`MY-DİGİTAL-BOOK/<NAME>/`), which keep their
own `project_config.json`, `.gate`, `DECISIONS.md`, `kill_gate.py` and `selftest.py`.
Nothing here replaces those; this directory is the layer they were missing.

## Directory map

| Directory | One line |
|---|---|
| `house-style/` | voice, spelling, punctuation, measurement, headings, captions, references, accessibility — the rules every manuscript is edited against |
| `series-bibles/` | one file per series (Valice Script, Codex, The Great Book of…, Field Book, Valice Classics): purpose, audience, identity, structures, formats, pricing, companion and cross-sell rules, prohibited drift |
| `verified-facts/` | `facts.jsonl` — machine-readable facts with source, date, confidence, verifier; append-only |
| `rejected-facts/` | `rejected.jsonl` — claims and demand assumptions that failed verification, so they are never reintroduced; append-only |
| `rights/` | `ledger.csv` (one row per source per book; work, edition, translation, illustration, apparatus rights kept separate), `SCHEMA.md`, `RIGHTS_GATE.md` (GREEN/YELLOW/RED rules) |
| `metadata/` | title/subtitle patterns, keyword rules, category maps, description template, series linking, the "counts are measured" rule |
| `covers/` | per-series cover identity, typography, thumbnail rules, file specs, image-generation rules |
| `kdp/` | the Gate 10 compliance checklist and the preflight rules (including the five from Enigmatica's real KDP rejection) |
| `qa/` | the human + automated QA checklist used at gates 8 and 11 |
| `naming/` | deterministic asset slots (`assets/<slug>/…`), R2 keys, output layout |
| `workflows/` | `gates.json`, `state-machine.json` (sources of truth), `GATES.md`, `STATE_MACHINE.md`, `WORKFLOW.md`, `STANDING_CONTEXT_POLICY.md`, and `roles/R1…R9` contracts |
| `templates/project-template/` | the new-book skeleton that `scripts/factory/new-project.mjs` instantiates |
| `cost/` | `ledger.jsonl` — token, image, OCR and API cost per project, written by `scripts/factory/cost-ledger.mjs` |

## How agents load it

1. Read this file, then `workflows/STANDING_CONTEXT_POLICY.md` — it says which files your
   role may load and which it must never see.
2. Read your role contract in `workflows/roles/`.
3. Load the house files your role is allowed, **at the start of every stage** (they change
   between stages).
4. Work in the project directory; write only the outputs your contract lists.
5. Record gate results with `scripts/factory/gate.mjs`, state changes with
   `scripts/factory/state.mjs`, and cost with `scripts/factory/cost-ledger.mjs`.

## Update rules

| File | Who may edit | How |
|---|---|---|
| `house-style/`, `covers/`, `metadata/`, `series-bibles/` | founder decides; R2/R5/R7/R8 propose via a `K##` in the affected project's `DECISIONS.md` | edit in place; keep a `Changed` line at the top |
| `verified-facts/facts.jsonl` | R4 appends; anyone may read | append-only; a fact that turns out wrong is not deleted — a new record with `status: REJECTED` supersedes it and a line goes to `rejected-facts/` |
| `rejected-facts/rejected.jsonl` | R1, R4 append | append-only |
| `rights/ledger.csv` | R6 appends; founder approval column is the founder's | rows are never deleted; a superseding row references the old one |
| `kdp/`, `qa/`, `naming/` | R8/R9 propose; founder approves | edit in place |
| `workflows/gates.json`, `state-machine.json` | founder only (they are enforced by code; a change is a policy change) | edit + bump `version` |
| `templates/project-template/` | R9 | edit; every existing project keeps its own copy |
| `cost/ledger.jsonl` | scripts only | append-only |

No file in this directory may contain a credential, a customer's personal data, or a
protected solution layer.

## Founder için kısa özet (TR)

`valice-house/`, yayın fabrikasının ortak hafızasıdır: yazım kuralları, seri kimlikleri,
doğrulanmış ve reddedilmiş olgular, haklar defteri, kapak/metadata standartları, KDP uyum
listesi ve yeni kitap şablonu burada durur. Her ajan işe başlamadan önce buradan kendi
rolüne izin verilen dosyaları okur; öğrendiği doğrulanmış olguyu ve reddedilen iddiayı
buraya yazar. Amaç, her sonraki kitabın daha hızlı ama daha kötü olmadan çıkmasıdır.
Kapı tanımları (`workflows/gates.json`) ve durum makinesi (`workflows/state-machine.json`)
kodla uygulanır; 2 (haklar), 5 (olgu), 10 (KDP politikası) ve 12 (yayın) kapılarını
yalnızca siz geçirebilirsiniz ve bunlar asla es geçilemez.
