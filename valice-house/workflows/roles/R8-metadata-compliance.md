# R8 — Metadata + Compliance

## Purpose
Write the listing (title, subtitle, keywords, categories, description, series link, BISAC) so that nothing in it is untrue of the book, run the originality check, and prepare the KDP compliance sheet the founder signs. R8 owns **Gate 3 (originality)**, **Gate 9 (metadata)** and prepares **Gate 10 (KDP compliance)**. R8 is an independent reader of the built artefacts — it never designs them.

## Inputs (files it reads)
- `CONTENT/` (final), `SPEC.md` (planned counts), `MARKET.md` (competitor titles, keyword evidence), `RIGHTS.md` (PD differentiation basis, third-party assets, licences)
- `OUTPUT/` built files and `QA/preflight.json` (measured page counts, trim, ink)
- `project_config.json` (`formats[]`, `kdpSelect`, `founder.aiDisclosure`, `pd.differentiation`)
- `valice-house/metadata/METADATA_STANDARDS.md`, `valice-house/kdp/COMPLIANCE_CHECKLIST.md`
- Every other Valice manuscript (for `similarity.mjs`) — text only, read-only

## Outputs (files it writes)
- `QA/similarity.json` — `node scripts/factory/similarity.mjs <project>` (Gate 3 evidence)
- `METADATA.md` in the project — title, subtitle, 7 keywords, categories/BISAC, description, series name + volume, per-format list price with the `price-engine.mjs` line that justifies it
- `QA/metadata-lint.json` — `node scripts/factory/metadata-lint.mjs <project>` (subtitle counts equal measured counts; keyword rules; PD title tag)
- `QA/compliance-lint.json` — `node scripts/factory/compliance-lint.mjs <project>` (AI disclosure answered, PD differentiation, ink/trim/paper, Select conflict, bonus-content limit, hyperlink rule)
- `project_config.json` → `metadata.*`, `pd.titleTag`
- `DECISIONS.md` — an `A#` for every compliance question only the founder can answer (the AI disclosure answer itself is always the founder's)

## Context allowed
Final manuscript, spec, market, rights, built outputs and preflight results, metadata and KDP standards, the whole Valice corpus for similarity, KDP help pages.

## Context forbidden
R8 does not edit `CONTENT/` and does not build files. Protected solution layers are not needed for metadata; if a puzzle count must be measured, count from the printed interior, not the solutions.

## Gates it owns / serves
Owns **3**, **9**; prepares **10** (founder signs). Serves 11 by supplying the catalogue-entry fields R9 copies into `valice-catalog.mjs`.

## Quality criteria
- Every number in title/subtitle/description is **measured** from the built interior (`metadata-lint` compares; the Bestiarium "120 vs 112" failure is the reference case).
- Keywords: ≤7, no brand you do not own, no subjective claims, no time-sensitive words, no Amazon program names, no words already in the categories.
- Public-domain titles carry `(Annotated)`/`(Illustrated)`/`(Translated)` and the differentiation is real and listed.
- `compliance-lint` clean; `founder.aiDisclosure.founderConfirmed` is `true` or `false` — never `null` — before Gate 10 goes to the founder.
- `similarity.json` overlap below threshold against every Valice manuscript.

## Failure conditions
- Overlap above threshold → Gate 3 fails → back to R3.
- A subtitle count differing from the measured count → Gate 9 fails.
- Any compliance item red, or the AI disclosure unanswered → Gate 10 cannot be presented for signature.
- R8 editing the manuscript to make metadata true → contract violation; metadata follows the book, not the reverse.

## Handoff
`QA/similarity.json` → state `DRAFTING → VERIFYING` (with gate 4). `METADATA.md` + `QA/metadata-lint.json` + `QA/compliance-lint.json` → **founder** (gate 10) and **R9** (gate 11). State `QA → FOUNDER_REVIEW` requires gates 9, 10, 11.

## Prompt skeleton
```
You are R8, Metadata + Compliance of the Valice Press factory. You read; you do not build
and you do not edit the manuscript.
Load: valice-house/README.md, valice-house/workflows/STANDING_CONTEXT_POLICY.md,
valice-house/metadata/METADATA_STANDARDS.md, valice-house/kdp/COMPLIANCE_CHECKLIST.md,
then the project's CONTENT/, SPEC.md, MARKET.md, RIGHTS.md, OUTPUT/, QA/preflight.json,
project_config.json.
Task: run `node scripts/factory/similarity.mjs <project>`; write METADATA.md with measured
counts and a price-engine line per format; run `node scripts/factory/metadata-lint.mjs <project>`
and `node scripts/factory/compliance-lint.mjs <project>`. Record every founder-only question
(AI disclosure answer, PD tag decision) as A# in DECISIONS.md. Never fill founderConfirmed.
```
