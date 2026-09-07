# Valice AI Publishing Factory — Master Architecture

**Date:** 2026-09-02 · **Status:** design, nothing produced · **Supersedes:** the
topology section of `PUBLISHING_FACTORY_ARCHITECTURE.md` (which stays ACTIVE for
its lane economics and account-risk controls; this document is the operational
layer on top of it).

Evidence labels: **[V]** verified against a primary source · **[O]** observed in
the live system or the book repositories · **[A]** assumption · **[R]**
recommendation · **[S]** scenario.

The decisions this document implements are fixed in the master roadmap
(`VALICE_PRESS_MASTER_ROADMAP_TR.md`). Where the two disagree, the roadmap wins.

---

## 1. What already exists, and what the factory adds

The factory is not built from nothing. Nine book projects under
`MY-DİGİTAL-BOOK/` already share a production convention that was inherited
project-to-project and is recorded in each config's `architecturalDebtTo`
array [O]:

| Existing asset | Where | What it does |
|---|---|---|
| `project_config.json` as single source of truth | every KDP project | trim, ink, paper, prices, page targets, kill gates, AI-disclosure flags, series |
| `.gate` file + `kill_gate.py` + `selftest.py` (106–257 checks) | every KDP project | phase gating; tests that test the gates; CI fails on stale docs |
| `DECISIONS.md` with `K##` (decided) / `A#` (awaiting founder) | every KDP project | decision register; founder overrides recorded as overrides, never as passes |
| `PROJECT_CONTEXT.md`, `BRIEF.md`, `ROADMAP_PROGRESS.md`, `BOOK_STATS.md` (`update_docs.py --check`) | every KDP project | hand-over doc, locked spec, machine-generated progress |
| Python + ReportLab + pikepdf/pypdf + ebooklib build scripts, `qa_all.sh`, GitHub Actions `validate.yml` | every KDP project | interior, cover wrap, EPUB, A+ modules, preflight |
| `KDP_UPLOAD_HANDBOOK.md`, `KDP_MARGIN_FORENSIC_REPORT.md`, `KDP_PREVIEWER_CHECKLIST.md` | Games, Field Book, Enigmatica | upload-time runbooks |
| Storefront catalogue as data (`scripts/catalog/valice-catalog.mjs` + loader + 18 tests) | this repo | publication is a reviewable diff; ASIN/price/Select rules enforced |
| Companion registry (`src/lib/companions.ts`) and verification page pattern | this repo | the Amazon → Valice bridge |
| Economics scripts (`catalog-economics.mjs`, `price-engine.mjs`, `revenue-targets.mjs`) | this repo | every price is arithmetic over a verified rate card |

What is missing, and what this architecture adds [O gaps → R]:

1. **A house layer above the projects** — style guide, series bibles, verified-facts store, rights registry, rejected-claims log, cover standards, metadata standards. Today every project rediscovers these.
2. **A project template generator** so a new title starts from the convention instead of copying a sibling by hand.
3. **A cross-title similarity check** (Gate 3) — nothing today compares a new draft against the whole catalogue.
4. **A single, staged slate rhythm** with batch agents per stage instead of one agent per book.
5. **Automated website product QA** (Gate 11) that runs against production, not against the local catalogue file.
6. **A maintenance stock plan** — the thing that decides whether Year 2 is possible.

---

## 2. Topology: staged-parallel, batched by stage, verifier ≠ author

The seventeen candidate agents in the brief collapse into **nine roles**. Several
candidate roles are the same skill applied at a different stage (market and
keyword research; concept and outline; cover art director and cover prompt;
KDP QA and website QA), and running them as separate agents only multiplies
hand-off loss. The rule that matters more than the count: **the agent that
verifies a claim never drafted it.**

```
FOUNDER — editorial CEO. Approves gates 2, 5, 7, 8, 10, 12. Never drafts.
   │
   ├── STANDING CONTEXT (repo: valice-house/) ─────────────────────────────
   │     house-style.md · series-bibles/<series>.md · facts/verified.jsonl
   │     facts/rejected.jsonl · rights/ledger.csv · covers/standards.md
   │     metadata/standards.md · kdp/compliance-checklist.md · qa/checklist.md
   │     naming.md · templates/project-template/
   │
   ├── R1  SLATE RESEARCHER   (Gate 1)   market + keyword + competitor sweep for the
   │                                     whole month's slate, one context
   ├── R2  ARCHITECT          (—)        concept brief + outline + spec per title
   ├── R3  AUTHOR             (Gate 4)   drafting — one context per title, 3–4 in parallel
   ├── R4  VERIFIER           (Gate 5)   adversarial fact-check in a fresh context with
   │                                     the draft as untrusted input; writes the claim ledger
   ├── R5  EDITOR             (Gate 6)   line edit against house-style; never touches facts
   ├── R6  RIGHTS CLERK       (Gate 2)   prepares the rights ledger row + evidence; the
   │                                     FOUNDER signs
   ├── R7  DESIGNER           (Gates 7–8) interior build (ReportLab), cover brief + prompt,
   │                                     image QA (dimensions, DPI, colour space), EPUB
   ├── R8  METADATA + COMPLIANCE (Gates 9–10) title/subtitle/keywords/categories/
   │                                     description; KDP policy, AI disclosure, PD tags,
   │                                     ink, trim; similarity check (Gate 3)
   └── R9  PUBLISHER          (Gates 11–12) catalogue entry, companion registry, Paddle price,
                                         R2 upload, `validate:catalog`, launch checklist
```

**Why nine and not seventeen.** Market and keyword research share the same
competitive context and are cheaper as one pass over the slate. Concept and
outline are one deliverable (a spec). Source acquisition is part of drafting
for Lane A and part of the rights clerk's job for Lane C. Cover art direction,
cover prompt and image QA are one designer role because the person who writes
the prompt is the only one who can judge whether the output matched the brief.
KDP QA and website QA are one compliance pass because they read the same
metadata. What must **not** be merged: the author and the verifier, the
verifier and the editor (the editor would otherwise "fix" a flagged claim into
a fluent falsehood), and the designer and the compliance role (trim/ink/DPI
decisions need an independent reader).

### Serial vs parallel

| Mode | Throughput | Work in progress | Failure containment | Verdict |
|---|---|---|---|---|
| Serial (finish A, then B) | lowest | 1 | best | too slow for 5/month |
| Pure parallel (10 pipelines) | highest | 10 half-finished books | worst — a policy error found at gate 10 has contaminated ten books | rejected |
| **Staged-parallel** — the slate advances together; a stage runs as a batch; no title enters the next stage before clearing the gate | 5–8/month | one slate | a slate fails cheaply at gate 1–3, never expensively at gate 10 | **adopted** |

### Batching rules [R]

- R1 runs **once per slate**, not once per title. Its output (`slate-research.md`) is an input to every R2 brief.
- R3 (author) is the only role that runs one-context-per-title; three to four in parallel is the practical ceiling before the founder's gate-5 queue backs up.
- R4 (verifier) runs per title but is given **only** the draft and the verified-facts store — never the author's notes, never the brief's claims.
- R7, R8 and R9 run per title but can be batched by lane (all Lane A workbooks of the month share one interior template and one cover template).

---

## 3. The pipeline, step by step

Every step lists input · output · owner · human checkpoint · wall-clock · failure
condition · automated test. Times are for a Lane A title of ~120 pages [A]; Lane
C and B multipliers in §6.

| # | Step | Input | Output | Owner | Human checkpoint | Time | Failure condition | Automated test |
|---|---|---|---|---|---|---|---|---|
| 1 | Idea | series bible, niche matrix, GSC/Amazon gap data | `IDEA.md` (one page: promise, reader, adjacency, lane) | R1 | none | 0.5 h | no adjacency to an existing Valice asset | `idea-lint`: required fields present; series exists in bible |
| 2 | Market validation (Gate 1) | idea, Amazon search sample, BSR sample of top 20, keyword autocomplete | `MARKET.md` with go/no-go, price band, format band, 5 competitor ASINs | R1 | founder reads the no-go list only | 1.5 h per slate title | top 20 all ≥ 4.5★ with ≥ 500 reviews and no gap; or no measurable demand | schema check; BSR sample must have ≥ 20 rows with timestamps |
| 3 | Rights (Gate 2) | idea + source list | `rights/ledger.csv` row(s) with evidence URLs; GREEN/YELLOW/RED | R6 prepares, **founder signs** | **yes** | 0.5 h (Lane A) · 2–4 h (Lane C) | any RED, or a YELLOW without a written mitigation | `rights-lint`: every source has status, evidence, approver, date |
| 4 | Concept + outline | idea, market, series bible | `SPEC.md`: TOC, learning progression, page budget, illustration list, companion asset list | R2 | none | 1 h | page budget outside trim/ink economics (price-engine says no viable price) | `spec-lint`; `price-engine.mjs` dry run must return a recommended price |
| 5 | Draft (Gate 4) | spec, house style, template | manuscript (`02_MANUSCRIPT/`), claim list (`claims.jsonl`: every checkable statement with a source pointer) | R3 | none | 3–6 h agent time | below spec (word budget, missing sections, filler detected) | `draft-lint`: section coverage, word budget ±10 %, claim list non-empty, no placeholder tokens (`[TBD]`, `lorem`) |
| 6 | Similarity (Gate 3) | manuscript | overlap report vs all Valice manuscripts + top competitor blurbs | R8 | none | 0.2 h | > 15 % 8-gram overlap with any existing Valice title, or a competitor's structure reproduced | `similarity.mjs` (shingle overlap); threshold in config |
| 7 | Fact-check (Gate 5) | manuscript + `claims.jsonl` + `facts/verified.jsonl` (no brief, no author notes) | claim ledger with VERIFIED / UNVERIFIABLE / WRONG per claim; proposed cuts | R4 (fresh context) → **founder signs** | **yes** | 1.5–3 h | any load-bearing claim WRONG or UNVERIFIABLE and not cut | `ledger-lint`: every claim has a verdict; no WRONG remains in the manuscript (diff check) |
| 8 | Edit (Gate 6) | manuscript + ledger | final text | R5 | none | 1.5 h | style-guide violations; a cut claim re-introduced | `style-lint` (banned phrases, heading hierarchy, reading level for Young Explorers); ledger diff |
| 9 | Interior (Gate 8 prep) | final text + template | print-ready PDF (paperback, hardcover, large print), preflight report | R7 | none | 2 h | fonts not embedded; missing glyphs; page count outside range; blank/placeholder pages | `preflight.py` (from Enigmatica's KDP rejection: fonts embedded on every page, glyph coverage, safe area from outer edge, hardcover page count read from the hardcover build) |
| 10 | Cover (Gate 7) | cover brief, series standard, spine width from measured page count | cover wraps (pb, hc), Kindle cover, storefront webp | R7 → **founder approves** | **yes** | 1.5 h | thumbnail unreadable; wrong spine; < 300 DPI; text on the wrong panel | `cover-check.mjs`: dimensions vs KDP calculator, DPI, colour space, file size ≤ 40 MB |
| 11 | EPUB + digital edition | final text / print PDF | reflowable or fixed-layout EPUB (Kindle); 150-DPI digital PDF (direct) | R7 | none | 1 h | epubcheck errors; digital PDF > 15 MB | `epubcheck`; `build-digital-editions.mjs` size gate |
| 12 | Metadata (Gate 9) | spec, manuscript, market | title/subtitle/keywords (≤ 7)/categories/description/series link/BISAC | R8 | none | 0.7 h | banned keyword terms; claim not true of the book; subtitle overstates count (the "120 vs 112" failure) | `metadata-lint`: counts in the subtitle equal counts measured from the manuscript |
| 13 | Compliance (Gate 10) | everything | pass/fail sheet: AI disclosure answer, PD differentiation + title tag, ink/trim/paper, bonus-content limit, hyperlink rule, Select conflict | R8 → **founder signs** | **yes** | 0.5 h | any fail | `compliance-lint` reads `project_config.json` flags |
| 14 | Upload + Previewer + proof | files | KDP draft; Previewer pass; proof ordered for any new trim/template | founder | **yes** | 1 h + 5–10 days wall-clock for a proof | Previewer rejects; proof shows a defect | none possible — founder eyes on KDP's UI |
| 15 | Website product (Gate 11) | catalogue entry, cover webp, master in R2, Paddle price, companion entry | published product page; companion page live | R9 | none | 0.5 h | any `validate:catalog` failure | `valice-catalog.test.ts` + `validate:catalog` against production URLs |
| 16 | Founder approval (Gate 12) | the diff that sets `websiteStatus: "published"` | merged diff, loader run | **founder** | **yes** | 0.2 h | — | loader refuses a catalogue that fails tests |
| 17 | Publish | KDP live; site live | ASINs recorded only after fetched with 200 | R9 | none | 0.3 h | ASIN not live | ASIN fetch test |
| 18 | Launch | listing, companion, email, ads | launch checklist complete; 7/30/90-day reviews scheduled | R9 + founder | founder sets ad budget | 0.5 h | — | checklist as tests |
| 19 | Measure | KDP reports, ads CSV, GSC export, site events | title metrics row per month | R9 | none | 0.2 h/title/month | missing data month | `import-kdp.mjs` schema |
| 20 | Update / scale / archive | 90-day metrics | decision: winner / average / weak / obsolete | founder | **yes** (quarterly) | — | — | lifecycle report script |

**Founder minutes per Lane A title** (gates 2, 5, 7, 10, 12, 14): ~3.5 h plus the
proof turnaround, which is wall-clock not effort [A]. That figure is the binding
constraint on monthly output and is why the sustainable rate is five projects a
month, not ten.

---

## 4. The twelve quality gates

| Gate | Check | Owner | Kill criterion | Where it is enforced |
|---|---|---|---|---|
| 1 Market fit | demand evidence; competitor gap; price band viable | R1 | no gap → drop | `MARKET.md` schema + price-engine dry run |
| 2 Rights | every source GREEN; translation/illustration/apparatus rights separately recorded | **founder** | any RED → drop | `rights/ledger.csv` + `rights-lint` |
| 3 Originality | not a near-duplicate of a Valice title or a competitor | R8 | overlap > threshold → rework | `similarity.mjs` |
| 4 Content quality | meets spec; no filler; genuinely useful | R3 + `draft-lint` | below spec → rework | `draft-lint` |
| 5 Factual accuracy | every checkable claim verified by a non-author | R4 → **founder** | unverifiable load-bearing claim → cut | claim ledger |
| 6 Editorial | house style; coherence; reading level | R5 | violations → rework | `style-lint` |
| 7 Cover | series identity; thumbnail legibility; specs | **founder** | fail → rework | `cover-check.mjs` |
| 8 Interior / proof | preflight; Previewer; physical proof for new templates | R7 → **founder** | fail → rework | `preflight.py` |
| 9 Metadata | truthful counts; keyword rules; categories | R8 | fail → rework | `metadata-lint` |
| 10 KDP policy | AI disclosure; PD tag; ink; bonus content; links; Select | **founder** | fail → do not upload | `compliance-lint` |
| 11 Website product QA | catalogue integrity; cover; master; price; companion; SEO fields | R9 | fail → hold | `validate:catalog` |
| 12 Final approval | the publication diff | **founder** | — | loader + tests |

Gates 2, 5, 10 and 12 are the ones that can end the account or expose the
company legally; they are founder sign-offs and are not delegated. Gate 7 is a
founder sign-off because the brand is the founder's taste. Gate 8 needs a human
at KDP's Previewer; the tool has no API [O].

**Lane-specific additions.** Lane C adds a *differentiation measurement* to Gate
9 (share of original words; count of original illustrations; presence of the
`(Annotated)/(Illustrated)` tag when the edition goes to KDP) [V rule]. Lane A
workbooks add a *usability pilot* to Gate 4 (one human doing five pages from the
book alone — the Hangul project's "AI proxy is not a human" lesson [O]). Young
Explorers titles add an *age-appropriateness read* to Gate 6.

---

## 5. Factory memory — the compounding asset

A new repository, `valice-house/`, versioned, read by every agent at the start
of every stage. Nothing here is generated per book; everything here makes the
next book cheaper without making it worse.

| File | Content | Owner | Updated when |
|---|---|---|---|
| `house-style.md` | voice (calm, literary, first-person-credible), banned phrases, heading rules, reading-level bands (Young Explorers 8–12; adult), citation format, pronunciation-guide format, the "state the source and the translator" rule | founder | quarterly |
| `series-bibles/codex.md` · `the-great-book-of.md` · `field-book.md` · `valice-script.md` · `valice-classics.md` | series promise, structure template, entry length, apparatus checklist, cover identity, trim/ink, price ladder, companion template, cross-reference conventions | R2 proposes, founder approves | when a series ships a volume |
| `facts/verified.jsonl` | one line per verified claim: text, sources (≥ 2 independent for folklore per Bestiarium's standard [O]), verifier, date, books using it | R4 appends | every gate 5 |
| `facts/rejected.jsonl` | claims that failed verification, with why — so no future draft re-introduces them | R4 appends | every gate 5 |
| `rights/ledger.csv` | source, edition, translator, translation year, translator death year, jurisdiction checks, evidence URLs, status, approver, date, books | R6 | every gate 2 |
| `covers/standards.md` | per-series palette, typography, hierarchy, engraving idiom, thumbnail rules, file naming, DPI, spine text rules | founder | when a series identity changes |
| `metadata/standards.md` | title/subtitle patterns per series, keyword lists per series (7 slots), category maps, description template, series-linking rules, the "counts in the subtitle are measured" rule | R8 | monthly |
| `kdp/compliance-checklist.md` | the Gate 10 sheet, including the five preflight rules from Enigmatica's real KDP rejection [O] | R8 | when KDP changes a rule |
| `qa/checklist.md` | Gates 8 and 11 as a checklist | R7/R9 | as needed |
| `naming.md` | asset naming: `<slug>/<edition>/<artifact>-v<n>.<ext>`; cover slots; R2 keys `books/<slug>/master/v<n>/master.pdf` [O] | R9 | rarely |
| `templates/project-template/` | the numbered-directory convention, `project_config.json` skeleton with every flag, `DECISIONS.md` skeleton, CI workflow, `selftest.py` base | R9 | when the convention changes |

**Naming convention (asset slots).** Filesystem convention, no database [R]:

```
assets/<slug>/
  interior/paperback-v3.pdf   interior/hardcover-v3.pdf   interior/large-print-v1.pdf
  cover/paperback-wrap-v3.pdf cover/hardcover-wrap-v3.pdf cover/front-v3.png (≥ 2400×3600 px)
  kindle/<slug>-v3.epub       kindle/cover-v3.jpg (1600×2560)
  digital/<slug>-v3.pdf       (150 DPI direct edition → R2 books/<slug>/master/v3/master.pdf)
  aplus/module-01..06.png
  companion/<asset-id>.pdf
```

The storefront reads `public/images/books/<slug>.webp`, derived from
`cover/front-v<n>.png` by `scripts/covers/ingest-covers.mjs` (designed in the
roadmap's Phase 8B, not yet built). A missing file is a failing test, not a
placeholder image.

---

## 6. Lanes, hours and rhythm

| | Lane A — Franchise | Lane B — Flagship | Lane C — Public Domain |
|---|---|---|---|
| Shape | templated series entry (script workbook, puzzle book, folklore volume for young readers) | original high-content reference (Codex Heroica, Before You Cut) | annotated / illustrated PD edition |
| Output | 3–4 / month | 1 / quarter | 1–2 / month |
| Agent hours (all roles) | 12–18 | 80–150 | 30–60 |
| Founder hours | 3.5 + proof | 15–25 | 5–8 |
| Wall-clock | 3–4 weeks (proof included) | 10–14 weeks | 4–6 weeks |
| Channel | Amazon print-first; companion → site | direct-first, Amazon 4–8 weeks later | direct-first; Amazon only with the tag and ≥ 10 illustrations or annotation |
| Human pilot | 1 usability session (workbook) or 3 solvers (puzzle) | 3 external readers | 1 reader of the apparatus |

**Monthly rhythm** (wall-clock; stages overlap because they are batched):

| Week | Lane A slate (3–4) | Lane C (1–2) | Lane B (quarterly) | Founder |
|---|---|---|---|---|
| 1 | R1 slate research; R6 rights; R2 specs | source selection; rights ledger; OCR pull | research block | Gates 1–2 |
| 2 | R3 drafts; R4 fact-check | apparatus drafting | draft block | Gate 5 sign-offs |
| 3 | R5 edit; R7 interiors + covers; R8 metadata | edit; illustrations; interior | illustration | Gate 7 covers |
| 4 | Gate 10; upload; Previewer; proof orders; ladder | direct publish; companion | review | Gates 10, 12; launch |
| continuous | maintenance on the live catalogue (Phase 20 automation keeps this ≤ 10 h/month until ~150 records) | | | ads, pricing, quarterly portfolio review |

**Capacity, honestly** [A on founder hours; O on the toolchain]:

| Capacity | Projects / month | Why |
|---|---|---|
| Technical | 8–10 | agents draft in parallel; proven by the founder's own experiment |
| Quality-controlled | 6–8 (templated Lane A only) | every gate run, verifier separate |
| Founder-approved | 5–6 | ~3.5 h of gates per Lane A title, 5–8 for Lane C, inside ~45–60 founder hours/month |
| **Sustainable** | **5** (A 3 + C 1–2) + 1 B per quarter | maintenance stock grows ~0.5 h per live title per month; Year 2 needs Phase 20 automation |
| Peak | 8–10 for ≤ 2 consecutive months | only inside an established template, followed by a recovery month |

---

## 7. Model cost and the real cost

Per Lane A title, batched research and a separate verification context [A,
carried from `PUBLISHING_FACTORY_ARCHITECTURE.md` §7]: ~1.0 M input / ~0.35 M
output tokens → low tens of dollars on a frontier model, single digits on a
mid-tier model; recovered inside the first ~5 units. Lane C adds OCR: $0 when
the Internet Archive already carries `_djvu.txt` for the source [V], $0.45 per
300-page book on Google Document AI otherwise [V]. Image generation for covers:
no API key exists in this repository today [O]; the roadmap's Phase 8 caps the
first spend at $4.

Model spend is not the cost of a book. Founder hours are, by two orders of
magnitude. Every rule above exists to spend fewer founder hours per published
title.

---

## 8. Account-risk controls (unchanged, restated)

| Risk | Control | Gate |
|---|---|---|
| Undisclosed AI-generated content | disclosure answered at every upload; the answer recorded in `project_config.json` (`founder.aiDisclosure`) so it stops being `false` in every project [O] | 10 |
| Undifferentiated public domain | original apparatus measured; `(Annotated)` / `(Illustrated)` in the title; never a bare reprint | 2, 9, 10 |
| Near-duplicate titles across the catalogue | shingle-overlap check against every Valice manuscript | 3 |
| Misleading metadata | subtitle counts equal measured counts; no banned keyword terms | 9 |
| Select conflict | a Select-enrolled ebook is never flagged for direct sale — enforced by test [O] | 11 |
| Velocity flags | ≤ 5 new titles per format per week, half of KDP's observed allowance [V earlier research] | 17 |
| Single point of failure | storefront revenue must remain material (Lanes B + C) so a KDP suspension is a bad quarter, not the end | strategy |

---

## 9. What is deliberately not in this design

- No orchestration framework, no queue, no agent platform. Stages are directories and gates are files; a stage is "run" by opening a terminal with the role's prompt and the standing context. This matches the founder's demonstrated way of working and keeps the factory portable across models [R].
- No automatic publishing. Every publish is a founder-signed diff [O rule].
- No per-book bespoke tooling. If a title needs a new build script, the script goes into the template so the next title gets it free.
- No fabricated test records. A gate that was not measured is recorded as not measured; a founder override is recorded as an override. This is the rule already written into seven `DECISIONS.md` files [O], and the factory keeps it.
