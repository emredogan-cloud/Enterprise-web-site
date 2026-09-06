# PHASE 3 — Codex Bestiarium expansion

**Status: INITIALISED. Not started.** · **Branch:** `feature/public-domain-phase-3`
(from `origin/main` @ `415a1d5`) · **Opened:** 2026-09-06

The Master Roadmap marks this phase **LOCKED — planning only**, and its last line is
*"This phase is LOCKED. Do not execute."* This document is the phase environment and
nothing else. **No manuscript, no parse, no cover and no catalogue row exists for any of
these five books, and none should be made until the Founder unlocks the phase.**

---

## 1. The five books

Taken from `PUBLIC_DOMAIN_MASTER_ROADMAP.md` §PHASE 3, not chosen here.

| # | Title | Author | Pub. | Source | Score / Tier | ROI |
|---|---|---|---|---|---|---|
| 1 | **Kwaidan: Stories and Studies of Strange Things** | Lafcadio Hearn | 1904 | PG 1210 · IA `kwaidanstoriesst00hearuoft` | 83.0 · **TIER S** | 1.201 MEDIUM |
| 2 | **Sea Monsters Unmasked, and Sea Fables Explained** | Henry Lee | 1883/1884 | PG 36677 | 81.3 · TIER A | 1.029 LOW |
| 3 | **The Book of Were-Wolves** | Sabine Baring-Gould | 1865 | PG 5324 | 77.4 · TIER A | 0.998 LOW |
| 4 | **British Goblins: Welsh Folk-lore, Fairy Mythology, Legends and Traditions** | Wirt Sikes | 1880 | PG 34704 | 79.1 · TIER A | 1.139 MEDIUM |
| 5 | **The Fairy Mythology: Illustrative of the Romance and Superstition of Various Countries** | Thomas Keightley | 1828 (1850 rev.) | PG 41006 | 83.8 · **TIER S** | 1.393 HIGH |

**Phase objective (roadmap):** extend a live, selling product. Codex Bestiarium is already
in the catalogue; these five are its public-domain ancestors and its natural companion
shelf. Two ship with usable period illustrations, which is rare and worth taking.

**Expected outputs (roadmap):** five editions and a Bestiarium companion shelf.

---

## 2. Source type — this phase is not Phase 2

Every one of the five is a **Project Gutenberg proof-read HTML transcription**. Not one is
an Internet Archive OCR layer.

That is the single most important fact about this phase, and it is good news. Phase 2 spent
most of its engineering on reading `_djvu.xml` — type-size separation, debris detection,
paragraph rejoining, folio markers, a script marker, tables read from OCR word coordinates.
**None of that is needed here.** The nearest precedent is Phase 2 book 4 (Mancala), the only
one built from a PG transcription, and it was the fastest book of the phase.

The work moves from *recovering the text* to *the apparatus*, which is where the editorial
burden sits: **HIGH on three of five** (Kwaidan, Sea Monsters, The Fairy Mythology).

---

## 3. Rights

All five are **GREEN** in the research catalog of 2026-09-03. That is a research finding and
**it is not a Gate 2 signature** — Gate 2 is re-verified per book before its build, from the
Project Gutenberg bibrec page, which `pd-discovery` established as the rights instrument.

Two rights facts already need carrying forward:

- **Kwaidan's illustration layer is not cleared.** The Takénouchi plates are unattributed;
  the roadmap says they are *designed out*. Kwaidan therefore ships with no reproduced
  illustration, exactly as Korean Games ships without Ki San's drawings.
- **The Fairy Mythology is an 1828 text in an 1850 revision.** Which printing the PG file
  actually carries decides the differentiation claim and must be established before a word
  of apparatus is written, not after.

---

## 4. Planned pipeline

Phase 2's shape, minus the OCR half:

1. **Gate 2** — rights re-verified per book from the PG bibrec page; `RIGHTS.md` layer table.
2. **Parse** — PG HTML to structured JSON; boilerplate, licence and trademark stripped at
   parse time; digests in `QA/source-digests.json`.
3. **Scope decided BEFORE apparatus.** The recorded Phase 1 lesson, and it is expensive to
   get wrong: decide the selection size first, then write to it.
4. **Apparatus** — 20% editor share is the floor; every checkable statement into
   `CLAIMS.jsonl` and verified before Gate 5.
5. **Interior → companion leaf → `seal_interior.py`** so the QA record describes the file
   that exists, because the cover's spine arithmetic reads it.
6. **Covers** — see §5.
7. **Adversarial review, then Gates 7/8/9/10.**

---

## 5. Reusable instruments

**Copy from `COMMON-AREA`, never import from it** (its own standing rule: a finished book
must still build in five years).

| Instrument | Where | Use in Phase 3 |
|---|---|---|
| `checks/check_quotes.py` | Phase 2 COMMON-AREA | **Mandatory.** It exists because a fabricated quotation shipped. Adapt `SOURCE_FILES`/`EXTERNAL` per book. |
| `interior/seal_interior.py` | Phase 2 COMMON-AREA | **Mandatory** wherever a companion leaf is spliced. |
| `covers/founder_cover_pipeline.py` | Phase 2 COMMON-AREA | Founder artwork → KDP slots: 4× Real-ESRGAN, spine rebuilt in type, sRGB embedded. |
| `covers/build_book_covers.py` | Phase 2 COMMON-AREA | The per-book driver. Reads `kdp_geometry.json`; refuses to interpolate a hardcover it has no calculator run for. |
| `covers/kdp_geometry.json` | Phase 2 COMMON-AREA | KDP calculator values read 2026-09-06. **Add a row per new page count — do not interpolate.** |
| `covers/epub_cover.py` | Phase 2 COMMON-AREA | Puts the current cover into a built EPUB and keeps EPUBCheck clean. |
| `covers/build_handbook.py` | Phase 2 COMMON-AREA | The KDP handbook, from measured data only. |
| `music/` | Phase 2 COMMON-AREA | **Not expected.** None of the five carries a tune. |
| `scripts/factory/ocr/*` | site repo | **Not expected.** No OCR layer in this phase. |

---

## 6. Dependencies

- **The Bestiarium cross-reference index** and **the creature-entry template** (roadmap,
  "shared production dependencies"). Neither exists yet; both are shared across all five and
  should be built once, first, in a Phase 3 `COMMON-AREA`.
- **Codex Bestiarium itself is live**, so the companion shelf must not contradict the
  product already on sale.

---

## 7. Known blockers, carried in before the phase starts

| | |
|---|---|
| **Kwaidan plates** | Unattributed; designed out. No illustration is reproduced. |
| **Wrong-but-confident sources** | The roadmap names Gould's cryptozoology and Elliot Smith's diffusionism: *"both wrong in ways that need apparatus, not silence."* Phase 1's Mythical Monsters already built the instrument for this — a register setting the author's claims against what is established. Reuse the pattern. |
| **The Fairy Mythology printing** | 1828 vs 1850 revision must be settled at Gate 2. |
| **Paddle products** | The classifier has refused the live-payment write in three consecutive sessions. Phase 3 will hit it too. Assume every book ends at a Founder one-liner (**F-028**) and plan the phase to end `draft`. |
| **Two databases** | The site reads Neon `neondb`, **not** `bookstore`; `load-catalog` defaults to the wrong one. |
| **Hardcover floor** | KDP refuses a 6 × 9 hardcover under **76 pages**. Phase 1 lost one hardcover to a 74-page block. If a hardcover is wanted, the page count is a design input, not an outcome. |
| **Barcode box** | KDP prints a white 2.0 × 1.2 in box at the lower right of the back cover. Eight of Phase 1/2's ten comps put lettering in it (**F-029**). Reserve it in the comp brief from the start. |

---

## 8. What this branch contains

Only this file. No book directory tree has been created under
`MY-DİGİTAL-BOOK/PUBLIC-BOOKS/`, because the roadmap locks the phase and scaffolding five
projects is the first step of executing it.

**Phase 3 production has NOT started.**
