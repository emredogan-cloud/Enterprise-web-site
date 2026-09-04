# VALICE PRESS — PUBLIC DOMAIN CANDIDATE CATALOG

> **This is a research and acquisition catalog, not a legal opinion.** Every rights
> conclusion below is an operational classification for internal triage, recorded with
> the evidence it rests on. Nothing here has been approved for production. Every
> candidate that moves forward must still pass Gate 2 in `valice-house/rights/RIGHTS_GATE.md`
> with a founder-signed rights-ledger row.

---

## 1. Executive Summary

This pass discovered, verified and scored **144 public-domain candidates** for Valice
Press: **90 newly discovered**, **51 imported from the existing 94-row pool and
re-verified**, and **3 recorded as traps rather than candidates**.

Identifiers were not taken on trust. **205 Project Gutenberg bibliographic records and 30
Internet Archive item records were fetched and parsed during this pass**, and every author,
translator and illustrator death year quoted below was read from the fetched record rather
than recalled. That produced findings the existing pool did not contain.

### What the revalidation changed

The existing `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` lists 94 candidates, 85 of them GREEN.
Re-checking them against primary records found **eight material defects**, four of which
change a rights conclusion:

| # | Finding | Effect |
|---|---|---|
| 1 | **Seneca / Gummere is not clearable.** The pool records the Loeb translator as "d. 1919 → cleared 1990, GREEN". 1919 is the publication year of volume 2; volume 3 appeared in 1925, so the translator was demonstrably alive after 1919. His authority record reads `Gummere, Richard M. (Richard Mott), 1883- ` — birth year only, no death. | Batch 2's Seneca source **fails**. A verified GREEN substitute was found: the **Aubrey Stewart** translation (d. 1918), on PG and CC0 on Standard Ebooks. |
| 2 | **Maxfield Parrish plates in *A Wonder Book*.** The pool lists this GREEN with no illustrator recorded. PG's record names `Parrish, Maxfield, 1870-1966`. | Plates in copyright in EU/UK/TR **until 2037**, and commercially licensed. |
| 3 | **Evelyn Paul plates in two Lewis Spence volumes.** No illustrator was recorded in the pool. PG names `Paul, Evelyn, 1883-1963`. | Text cleared worldwide 1 Jan 2026; plates blocked in EU/UK/TR **until 2034**. |
| 4 | **Noel L. Nisbet plates in *Cossack Fairy Tales*.** Not recorded in the pool. PG names `Nisbet, Noel L., 1887-1956`. | Plates blocked in EU/UK/TR **until 1 Jan 2027**. |
| 5 | **PG 45109 is not the George Long *Enchiridion*.** The pool attributes it to Long. PG's record names `Higginson, Thomas Wentworth, 1823-1911`. Long's Enchiridion is inside **PG 10661**. | Still public domain; the attribution was simply wrong. |
| 6 | **Hastings Crossley died 1926, not 1914** (`Crossley, Hastings, 1846-1926`). | Still GREEN; the recorded datum was wrong. |
| 7 | **F. Hadland Davis died 1956**, which the pool marked UNVERIFIED. | Resolved — and resolved to **blocked**: EU/UK/TR clears only on 1 Jan 2027. |
| 8 | **Sam Loyd's *Cyclopedia* source is a user upload.** IA collection is `opensource; community` with a self-applied Public Domain Mark, not a library scan with a rights determination. | Evidence grade downgraded; the compiler's death year is also unverified. |

Three identifiers the pool marked "not confirmed" were **resolved**: Ingersoll's *Dragons and
Dragon Lore* (found — but only as a Singing Tree Press reprint in a lending collection, so
still unusable), the Ryder *Panchatantra* (`panchatantra035159mbp`, 1925), and Mackenzie's
*Indian Myth and Legend* (`indianmythlegend00mack`, NOT_IN_COPYRIGHT). One remains
**unresolved**: no clean public-domain scan of Chamberlain's *Kojiki* was located.

A **date conflict** was opened, not closed: Dudeney's *Puzzles and Curious Problems* is
recorded in the pool as 1931 (US PD on 1 Jan 2027), but the Internet Archive item's date
field says 1929. Both are plausible. It is recorded as HOLD rather than resolved in the
convenient direction.

### What the discovery found

123 subject queries against Project Gutenberg returned 1,556 unique records, filtered to 329
Valice-relevant candidates, of which the strongest 111 were fetched and verified in full.
Targeted Internet Archive searches added scanned works Gutenberg does not hold. The
strongest new material clusters in three places:

- **Games.** Gomme's *Traditional Games of England, Scotland and Ireland* (2 vols) and two
  further Culin titles — *Chess and Playing Cards* and *Mancala* — join the already-planned
  Falkener and Korean Games. This is enough for a genuine World Games programme rather than
  a single volume.
- **Puzzles.** Hoffmann's *Puzzles Old and New* (1893) is the highest-scoring newly
  discovered candidate: a 418-page illustrated corpus of mechanical puzzles with no modern
  edition, by an author whose death year (1919) is verified, and who also wrote *Modern
  Magic* — two books from one cleared author.
- **Script.** Isaac Taylor's *The Alphabet* and Clodd's *The Story of the Alphabet* supply
  the historical spine that would turn Valice's two isolated script workbooks (Hangul, Greek)
  into a series.

The single largest differentiation opportunity found is **Édouard Lucas's *Récréations
mathématiques*** — the French counterpart to Dudeney, verified clear, and with **no
public-domain English translation**. An original translation is the highest grade of
differentiation KDP recognises, and would create a book that does not currently exist in English.

### Distribution

| Tier | Count | | Rights | Count | | Provenance | Count |
|---|---:|---|---|---:|---|---|---:|
| Tier S | 14 | | GREEN | 106 | | Newly discovered | 90 |
| Tier A | 28 | | YELLOW | 33 | | Old, revalidated | 51 |
| Tier B | 41 | | RED | 5 | | Trap / reference | 3 |
| Tier C | 22 | | | | | | |
| Hold | 34 | | | | | | |
| Rejected | 5 | | | | | | |

**No production has begun. This phase ends at the catalog.**

---

## 2. Research Date

**Research performed and all records fetched: 3 September 2026.**

Every "VERIFIED" claim in this document was read from a record retrieved on that date.
Public-domain status is time-dependent: the US pre-1931 line and the life+70 line both move
every 1 January. Conclusions here are stated **as of 1 January 2026** and must be re-checked
if acted on after 1 January 2027 — several HOLD entries clear on exactly that date.

---

## 3. Discovery Methodology

Four passes, in order.

**Pass 1 — Read the existing research.** `RULE_SET_INDEX.md`, `CLAUDE.md`, `AGENTS.md`,
`memory/PAST_DECISIONS.md`, `PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md`,
`PUBLIC_DOMAIN_BATCH_1_PLAN.md`, `PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md`,
`KDP_PRODUCTION_MASTER_PLAN_TR.md`, `VALICE_EBOOK_PRODUCTION_MASTER_PLAN_TR.md`,
`valice-house/rights/RIGHTS_GATE.md` and `SCHEMA.md`, the Phase 0–5 reports, and
`PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` (94 rows). The existing source hierarchy and rights
gate were adopted, not replaced.

**Pass 2 — Revalidate the existing pool.** 92 PG identifiers and 18 IA identifiers were
extracted from the CSV and every one was fetched. Zero fetch errors. Each record's author,
translator and illustrator rows were parsed for death years and reconciled against the CSV's
claims by script. That reconciliation produced the eight defects in §1.

**Pass 3 — Discover.** 123 subject queries were run against Gutenberg's search across every
area named in the brief plus reverse-adjacency queries derived from each live Valice product.
1,556 unique records were returned; a keyword-relevance filter reduced them to 329
Valice-relevant candidates not already in the pool; the strongest 111 were fetched and parsed
in full. Targeted Internet Archive searches (by exact title, restricted to library
collections and to `year:[1500 TO 1930]`) covered scanned works Gutenberg does not hold.

**Pass 4 — Verify, score, tier.** Each candidate's rights layers were assessed separately,
scored on ten axes, and tiered. Tiering is rights-capped: a YELLOW candidate cannot reach
Tier S or A regardless of score, and a candidate behind a cultural-consultation gate is
forced to HOLD regardless of score.

**Instrumentation.** Four scripts were written for this pass (a PG bibrec parser, a PG search
harvester, an IA metadata/search client, and a scoring model). They cache every fetch, so the
evidence behind this document is reproducible. They live in the session scratchpad rather
than the repository, because this phase produces a catalog, not tooling — but they implement
the `scripts/pd/` design already specified in `PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md` §3.1
and should be moved there if the discovery engine is made permanent.

### What "verified" means here

| Label | Meaning |
|---|---|
| **VERIFIED** | Read from a primary record fetched on 2026-09-03 (PG bibrec table, IA metadata API, Standard Ebooks page). |
| **LIKELY** | Strong but incomplete — e.g. a death year recorded in the existing pool but not independently re-fetched in this pass. |
| **UNVERIFIED** / **NOT FOUND** | No evidence located. Never silently upgraded. |
| **CONTESTED** | Two sources disagree and neither was preferred (only *Puzzles and Curious Problems*). |

---

## 4. Source Hierarchy

The order in `PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md` was followed and tested.

| Rank | Source | Reachable in this session | What it is good for | Caution |
|---|---|---|---|---|
| 1 | **Standard Ebooks** | Yes (HTTP 200; CC0 dedication read on the Seneca page) | CC0 files, professional typesetting, clean translator attribution | Small catalog; cover art only "believed" PD — verify separately |
| 2 | **Project Gutenberg** | Yes — bibrec pages and search HTML both parsed | Best metadata in the field: author/translator/illustrator **with death years**, LoC class, subjects, and a 30-day download count usable as a demand proxy | PG trademark and licence header must be stripped from any sold edition |
| 3 | **Internet Archive** | Yes — `/metadata/` and `advancedsearch.php` both returned JSON | Scanned works PG does not hold; OCR engine and collection are exposed | `possible-copyright-status` is a hint, not a determination. **Collection matters**: `americana`/library scans ≫ `opensource; community` uploads ≫ `internetarchivebooks` (lending, not free) |
| 4 | **Library of Congress / Smithsonian / institutional** | Indirectly, via IA rights statements | Strongest rights language encountered (`chessplayingcard00culi`) | — |
| 5 | **Wellcome Collection** | Not re-tested this pass | Early-modern scans with modern OCR | Images CC BY 4.0 → attribution required; unusable on covers |
| 6 | **HathiTrust** | Not tested (previously blocked by a Cloudflare challenge) | Best bibliographic metadata | Access restrictions on Google-digitised volumes |
| — | **Gutendex API** | **No — HTTP 503** | — | Confirms the existing plan's note; PG HTML was used instead |
| — | **Google Books** | Not used as a source, by standing rule | Discovery only | Usage terms conflict with commercial reuse |

**Verified trap, worth stating plainly:** searching Internet Archive by title surfaces modern
reprints *above* the public-domain original. Searching `"games ancient and oriental"` returned
three 1961 reprints before the 1892 first edition; `"traditional games of england"` returned
1964 Dover reprints alongside the 1894 original. The year field must be read every time.

---

## 5. Rights Method

Five layers are assessed separately, per `valice-house/rights/RIGHTS_GATE.md`. A GREEN layer
never implies a GREEN neighbour.

| Layer | Question |
|---|---|
| Work | Is the underlying text out of copyright in the US **and** in every market Valice sells to? |
| Translation | Is *this* translation out of copyright? (translator's death + 70; US publication year) |
| Illustration | Are *these* plates out of copyright? (illustrator's death + 70) |
| Apparatus | Introductions, notes, indexes of the edition used |
| Source scan | Who scanned it, under what collection and licence? |

**Classification.**

- **GREEN** — every layer the edition would actually use is evidenced clear in every market
  Valice sells to. Strong evidence supports commercial reuse.
- **YELLOW** — likely public domain, but at least one material question is open: a missing
  death year, an unresolved illustrator, a contested publication date, or a weak source
  provenance. **YELLOW is not publication-ready.**
- **RED** — commercial reuse should not proceed without further clearance.

The commonest YELLOW cause in this catalog is not the work — it is a **missing death year for
a translator or illustrator**. Twenty-four candidates are YELLOW purely on that basis. A work
published in 1900 is unambiguously US-PD; whether it is clear in the EU, UK and Türkiye
depends on a date that is often simply unrecorded.

**Illustrations were treated as a first-class layer**, which is where four of this pass's
findings came from. The existing pool recorded illustrators for almost no candidate; PG
records them as a distinct agent role with dates, and reading that row changed the
conclusion for *A Wonder Book*, both Spence volumes, and *Cossack Fairy Tales*.

**A layer that is legally clear may still be gated.** Indigenous and living-culture material
is held behind a cultural-consultation gate, following the existing decision on Culin's
*Games of the North American Indians*. Seven candidates are forced to HOLD on that basis
regardless of score — including *Myths of the Cherokee*, which would otherwise be a strong
Tier A on 6,312 verified downloads a month.

---

## 6. Jurisdiction Method

Jurisdiction is recorded explicitly per candidate. No candidate is described as "public
domain" without saying where.

| Rule | Test | As of 1 Jan 2026 |
|---|---|---|
| US, pre-1931 | First US publication before 1931 | PD |
| US, 1931–1963 | PD only if the copyright was not renewed — a renewal search must be recorded | YELLOW until searched |
| US, 1964–1977 | 95 years from publication | RED until 2060+ |
| EU / UK / TR | Life + 70 for the creator of **that layer** | Clear if that creator died before 1 Jan 1956 |
| URAA restoration | A foreign work in copyright at home on 1 Jan 1996 may have restored US copyright | YELLOW; check before relying on the pre-1931 rule |

**The 1931–1963 US renewal window was not searched in this pass.** No candidate in this
catalog is classified GREEN on the strength of an unrenewed US copyright; candidates in that
window are YELLOW or excluded. This is a stated limitation, not an omission (§25).

**The line moves.** Several candidates cleared very recently or clear shortly:

| Candidate | Layer | Clears in EU/UK/TR |
|---|---|---|
| Werner, *Myths and Legends of China* | text (d. 1954) | 1 Jan 2025 — **already clear** |
| Murray, *A History of Chess*; Spence titles; Parker, *Seneca Myths* | text (d. 1955) | 1 Jan 2026 — **just cleared** |
| Davis, *Myths & Legends of Japan* | text (d. 1956) | 1 Jan 2027 |
| *Cossack Fairy Tales* | plates (Nisbet d. 1956) | 1 Jan 2027 |
| Barnett, *Hindu Gods and Heroes* | text (d. 1960) | 1 Jan 2031 |
| Spence, Egypt / Babylonia | plates (Paul d. 1963) | 1 Jan 2034 |
| Masters, *Romance of Excavation* | text (d. 1965) | 1 Jan 2036 |
| Hawthorne, *A Wonder Book* | plates (Parrish d. 1966) | 1 Jan 2037 |
| Brodeur, *Prose Edda* | translation (d. 1971) | 1 Jan 2042 |

---

## 7. Scoring Formula

The weights specified in the discovery brief were used unchanged. All axes are 0–100.

| Axis | Weight |
|---|---:|
| Rights confidence | 20% |
| Commercial potential | 15% |
| Valice catalog fit | 15% |
| Differentiation potential | 15% |
| Direct ebook potential | 10% |
| Amazon print potential | 10% |
| SEO / content potential | 5% |
| Visual potential | 5% |
| Bundle / series potential | 3% |
| Production practicality | 2% |
| **Total** | **100%** |

`composite = Σ(axis × weight)`

**Production practicality is inverted relative to difficulty: a higher score means easier and
more practical.** Topsell (1658 blackletter, needs re-OCR with a period model) scores 22;
Mancala (36 clean pages) scores 74.

**Tier assignment is rights-capped, not purely score-driven.**

| Tier | Rule |
|---|---|
| **Tier S** | GREEN **and** score ≥ 82 |
| **Tier A** | GREEN **and** score ≥ 75 |
| **Tier B** | GREEN and score ≥ 68, **or** YELLOW and score ≥ 70 |
| **Tier C** | GREEN and score < 68 |
| **HOLD** | YELLOW and score < 70, **or** any candidate behind a cultural gate or an unresolved source, at any score |
| **REJECTED** | RED on any layer the edition would use |

This is why *Myths of the Cherokee* (78.2) and Fox-Davies' *Complete Guide to Heraldry* (78.9,
4,843 downloads/month) do not appear in Tier A. The cap is the point: a strong commercial
score must not launder an unresolved rights or ethics question.

**Fame was deliberately not rewarded.** Saturated corners were scored down on differentiation
and commercial potential regardless of renown — Lang's *Blue Fairy Book*, Jacobs' *English
Fairy Tales*, Grimm and Aesop all land in Tier C. *Ghost Stories of an Antiquary* records
**61,805 downloads in 30 days**, the second-highest demand in the entire pool, and still sits
in Tier C on a differentiation score of 36: enormous demand, no Valice series to receive it,
and a market already saturated with editions.

---

## 8. Candidate Statistics

| Metric | Value |
|---|---|
| Total candidates cataloged | **144** |
| Newly discovered this pass | **90** |
| Imported from the 94-row pool and re-verified | **51** |
| Recorded as traps / never-use references | 3 |
| PG bibliographic records fetched and parsed | **205** |
| IA item records fetched and parsed | **30** |
| PG search queries run | 123 (1,556 unique records returned) |
| Fetch errors | **0** |
| GREEN / YELLOW / RED | 106 / 33 / 5 |
| Behind a cultural-consultation gate | 7 |
| YELLOW solely from a missing death year | 24 |
| Material defects found in the existing pool | **8** |
| Previously "unconfirmed" identifiers resolved | 3 of 4 |

---

## 9. Tier S — Outstanding Valice Press Opportunities

GREEN on every layer the edition would use, and scoring 82 or above. Full structured records.

### The Canterbury Puzzles + Amusements in Mathematics

| Field | Value |
|---|---|
| Author | Henry Ernest Dudeney |
| Death year | 1930 (VERIFIED — PG authority: 'Dudeney, Henry Ernest, 1857-1930') |
| Original publication year | 1907 / 1917 |
| Original language | English |
| Category | Puzzle / Mathematics |
| Valice series fit | Valice Classics (vol. 2) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2001 |
| Edition | London: Thomas Nelson (1907); London: Nelson (1917) |
| Edition year | 1907 / 1917 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Diagrams integral; Valice redraws them |
| Illustration status | GREEN — Valice originals used |
| Primary source | Project Gutenberg 27635 and 16713 (both VERIFIED) |
| Secondary source | NOT FOUND / not needed |
| Source quality | A |
| Identifiers | PG 27635 · PG 16713 (Amusements in Mathematics) |
| Evidence links | [PG 27635](https://www.gutenberg.org/ebooks/27635) · [PG 16713](https://www.gutenberg.org/ebooks/16713) |
| Demand proxy | 2,516 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | ALREADY SHIPPING as *The Puzzles of Henry Dudeney*. Verified demand: 2,516 + 4,429 downloads/30d. |
| Competition / saturation | Moderate (Dover editions). |
| Free-edition pressure | MEDIUM |
| Editorial expansion | MEDIUM |
| Existing Valice adjacency | Codex Enigmatica; the puzzle lane generally |
| Strongest opportunity | Included for completeness as the revalidation benchmark — this is what a fully cleared, fully produced candidate looks like. |
| Main risk | None outstanding on rights. |
| Recommended future edition direction | No new action. Volume 2 source is *Puzzles and Curious Problems* — see the HOLD entry for its date conflict. |
| Rights notes | GREEN, re-verified 2026-09-03. |
| Evidence notes | PG 27635 and 16713 fetched 2026-09-03; both 'Public domain in the USA.', author 1857-1930. |
| Provenance in this catalog | OLD / REVALIDATED — already in production as Valice Book 03 |

**Scores** — rights confidence 95 · commercial potential 82 · valice fit 96 · differentiation 84 · direct ebook 90 · amazon print 84 · seo 80 · visual 74 · bundle series 88 · production practicality 72

**Composite 87.5 · TIER S**

### Puzzles Old and New

| Field | Value |
|---|---|
| Author | Professor Hoffmann (Angelo John Lewis) |
| Death year | 1919 (VERIFIED — IA creator authority: 'Hoffmann, Professor, 1839-1919') |
| Original publication year | 1893 |
| Original language | English |
| Category | Puzzle / Mathematics; Games; Reference |
| Valice series fit | Codex (Enigmatica); The Great Book of… |
| Work public-domain status | VERIFIED — 1893 London publication; author died 1919 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1990 |
| Edition | London: Frederick Warne, 1893 |
| Edition year | 1893 |
| Translation | n/a — English original |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Engravings integral to the 1893 edition; individual engraver NOT FOUND |
| Illustration status | YELLOW — engraver unattributed in the source record; treat plates as UNVERIFIED and redraw |
| Primary source | Internet Archive: puzzlesoldnew00hoff (Boston Public Library scan, 418 images) |
| Secondary source | NOT FOUND on Project Gutenberg (searched) |
| Source quality | A |
| Identifiers | IA `puzzlesoldnew00hoff` |
| Evidence links | [IA puzzlesoldnew00hoff](https://archive.org/details/puzzlesoldnew00hoff) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | The canonical Victorian mechanical-puzzle reference; the modern puzzle-collecting field (Slocum/Hoffmann bibliography) still cites it. No mainstream trade edition in print. |
| Competition / saturation | Low. Facsimile/POD scans exist; no typeset, solved, modernised edition. |
| Free-edition pressure | MEDIUM — scan is free, but it is an unindexed 418-page ABBYY-free scan; a solved, redrawn edition is a genuinely different product. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Enigmatica (direct); The Great Book of World Games (mechanical/dexterity puzzles) |
| Strongest opportunity | A 400-page illustrated corpus of mechanical puzzles nobody has re-engineered. Every puzzle wants a redrawn diagram — which clears the KDP ≥10-original-illustration bar as a by-product. |
| Main risk | Production weight: several hundred engravings need redrawing, and Victorian solution prose needs rewriting. This is a 200h+ book, not a 60h one. |
| Recommended future edition direction | Selected 'best 120' with redrawn diagrams, modern solution notes, difficulty ratings, and a materials appendix. Direct-first at $12.99; paperback follows. |
| Rights notes | Work layer GREEN. Do not reproduce the source engravings without attribution research — redraw instead (also the differentiation route). |
| Evidence notes | IA metadata fetched 2026-09-03: title/creator/date/collection confirmed; _djvu.txt present; no possible-copyright-status field set (BPL scan, not a rights determination). |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 88 · commercial potential 78 · valice fit 96 · differentiation 93 · direct ebook 88 · amazon print 84 · seo 74 · visual 94 · bundle series 88 · production practicality 45

**Composite 86.8 · TIER S**

### Myths and Legends of China

| Field | Value |
|---|---|
| Author | E. T. C. Werner |
| Death year | 1954 (VERIFIED — PG authority: 'Werner, E. T. C. (Edward Theodore Chalmers), 1864-1954') |
| Original publication year | 1922 |
| Original language | English |
| Category | Mythology; Folklore |
| Valice series fit | The Great Book of… ; Codex Mythologica |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: 1922 → PD · EU/UK/TR: life+70 expired 1 Jan 2025 (VERIFIED from death year 1954) |
| Edition | London: George G. Harrap, 1922 |
| Edition year | 1922 |
| Translation | Werner translated the Chinese sources himself |
| Translator | E. T. C. Werner (d. 1954) |
| Translation status | GREEN — expired 2025 |
| Illustrator | Colour plates in the 1922 edition; plate artist NOT FOUND |
| Illustration status | YELLOW — plate artist unattributed in the PG record; do not reproduce, commission original art |
| Primary source | Project Gutenberg 15250 (VERIFIED, 6,808 downloads/30d — highest of any mythology candidate in this pass) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 15250 |
| Evidence links | [PG 15250](https://www.gutenberg.org/ebooks/15250) |
| Demand proxy | 6,808 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 6,808 PG downloads in 30 days. The standard English-language Chinese mythology compendium. |
| Competition / saturation | Moderate — several cheap PD reprints; no strong annotated edition. |
| Free-edition pressure | MEDIUM-HIGH — well known and freely available; differentiation must be substantial. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Mythologica (Chinese entries); The Great Book of World Myths |
| Strongest opportunity | Highest verified demand in the mythology lane, and the life+70 clock has only just expired (Jan 2025) — competitors working from older rights guidance may still believe it is encumbered. |
| Main risk | Free-edition pressure is real. Needs glossary, pinyin normalisation, source notes and original art to justify $12.99. |
| Recommended future edition direction | Confirmed Batch 2 flagship: glossary, character-name normalisation, source notes, original illustration, Codex cross-references. |
| Rights notes | GREEN as of 1 Jan 2025 worldwide on the text layer. Plates remain YELLOW. |
| Evidence notes | PG 15250 fetched 2026-09-03: 'Werner, E. T. C. …, 1864-1954' confirmed; 6,808 downloads/30d. |
| Provenance in this catalog | OLD / REVALIDATED (Batch 2 flagship) |

**Scores** — rights confidence 94 · commercial potential 80 · valice fit 94 · differentiation 84 · direct ebook 88 · amazon print 82 · seo 80 · visual 82 · bundle series 86 · production practicality 66

**Composite 86.5 · TIER S**

### Korean Games, with Notes on the Corresponding Games of China and Japan

| Field | Value |
|---|---|
| Author | Stewart Culin |
| Death year | 1929 (VERIFIED — IA creator authority: 'Culin, Stewart, 1858-1929') |
| Original publication year | 1895 |
| Original language | English |
| Category | Games; Anthropology; Language / Culture |
| Valice series fit | The Great Book of… (World Games); Hangul line |
| Work public-domain status | VERIFIED — 1895 University of Pennsylvania publication; author died 1929 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2000 |
| Edition | Philadelphia: University of Pennsylvania, 1895 |
| Edition year | 1895 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Plates and figures integral; separate illustrator NOT FOUND |
| Illustration status | GREEN (work layer), pre-1931 US |
| Primary source | Internet Archive: koreangameswith00culigoog — possible-copyright-status NOT_IN_COPYRIGHT (VERIFIED) |
| Secondary source | NOT FOUND on Project Gutenberg |
| Source quality | A |
| Identifiers | IA `koreangameswith00culigoog` |
| Evidence links | [IA koreangameswith00culigoog](https://archive.org/details/koreangameswith00culigoog) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | The single most-cited source on Korean traditional games; also the standard comparative source for East Asian game families. |
| Competition / saturation | Very low. No modern trade edition. Dover reprinted Culin's *Games of the North American Indians*, not this. |
| Free-edition pressure | MEDIUM — scan is free; no playable modern edition exists in any language sold in the West. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | THE bridge title: joins the Hangul line to The Great Book of World Games. No other candidate connects two live Valice series. |
| Strongest opportunity | Uniquely Valice: the existing Korean-language audience and the existing games audience buy the same book. Boards and pieces all want redrawing. |
| Main risk | Cultural-accuracy obligation on Korean material (romanisation, terminology) — needs a Korean-reading check, which the Founder can supply. |
| Recommended future edition direction | 'Korean Games': ~60 games, modernised rules, redrawn boards, hangul + revised-romanisation terms, cross-referenced to China/Japan variants. Direct-first $12.99. |
| Rights notes | GREEN. Note the IA item is a Google-digitised scan re-hosted in the americana collection; NOT_IN_COPYRIGHT is IA's field, not a legal determination (Gate rule 9). |
| Evidence notes | IA metadata fetched 2026-09-03: NOT_IN_COPYRIGHT confirmed, _djvu.txt present, 1895 date confirmed. |
| Provenance in this catalog | OLD / REVALIDATED |

**Scores** — rights confidence 90 · commercial potential 72 · valice fit 98 · differentiation 92 · direct ebook 86 · amazon print 80 · seo 76 · visual 92 · bundle series 95 · production practicality 46

**Composite 86.1 · TIER S**

### The Traditional Games of England, Scotland, and Ireland (2 vols)

| Field | Value |
|---|---|
| Author | Alice Bertha Gomme |
| Death year | 1938 (VERIFIED — PG authority: 'Gomme, Alice Bertha, 1853-1938') |
| Original publication year | 1894 (vol 1) / 1898 (vol 2) |
| Original language | English |
| Category | Games; Folklore; Children's; Reference |
| Valice series fit | The Great Book of… (World Games); Field Book |
| Work public-domain status | VERIFIED — 1894/1898 publication; author died 1938 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2009 |
| Edition | London: David Nutt (Dictionary of British Folk-Lore, Part I) |
| Edition year | 1894/1898 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Diagrams and tune notation integral to the text; separate illustrator NOT FOUND |
| Illustration status | GREEN (work layer) — figures are Gomme's own diagrams/notations |
| Primary source | Project Gutenberg 41727 (vol 1) and 41728 (vol 2) |
| Secondary source | Internet Archive: traditionalgames02gomm_0 (1894) |
| Source quality | A |
| Identifiers | PG 41727 · IA `traditionalgames02gomm_0` · PG 41728 (vol 2) |
| Evidence links | [PG 41727](https://www.gutenberg.org/ebooks/41727) · [IA traditionalgames02gomm_0](https://archive.org/details/traditionalgames02gomm_0) · [PG 41728](https://www.gutenberg.org/ebooks/41728) |
| Demand proxy | 1,520 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | The standard reference for English-language traditional children's games; continuously cited in play-scholarship. Verified demand: 1,520 + 1,043 PG downloads in the last 30 days. |
| Competition / saturation | Low-to-moderate. A 1964 Dover reprint exists (IA traditionalgames0002gomm) — note that reprint is NOT the rights source. |
| Free-edition pressure | MEDIUM — free text exists, but it is an 800-page two-volume alphabetical dictionary with no playable modernisation. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | The Great Book of World Games (direct — the British/Irish chapter Valice does not yet have); Codex; young-reader line |
| Strongest opportunity | 800 pages of games recorded from living informants, with rhymes, tunes and regional variants. Valice's World Games format (modernised rules + redrawn boards) is exactly the missing product. |
| Main risk | Alphabetical dictionary structure and dialect transcription need heavy editorial restructuring into playable rules. Two volumes → selection is mandatory. |
| Recommended future edition direction | 'The Traditional Games of the British Isles': ~90 playable games, modernised rules, redrawn diagrams, tunes retypeset, regional-variant notes. Direct + paperback. |
| Rights notes | Both volumes GREEN on every layer. Avoid the 1964 Dover reprint apparatus entirely. |
| Evidence notes | PG records fetched 2026-09-03: both volumes confirm author dates 1853-1938 and 'Public domain in the USA.' |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 94 · commercial potential 74 · valice fit 95 · differentiation 90 · direct ebook 85 · amazon print 81 · seo 78 · visual 76 · bundle series 92 · production practicality 52

**Composite 85.8 · TIER S**

### Games Ancient and Oriental and How to Play Them

| Field | Value |
|---|---|
| Author | Edward Falkener |
| Death year | 1896 (VERIFIED — IA creator authority: 'Falkener, Edward, 1814-1896') |
| Original publication year | 1892 |
| Original language | English |
| Category | Games; History; Archaeology |
| Valice series fit | The Great Book of… (World Games) |
| Work public-domain status | VERIFIED — 1892 Longmans publication; author died 1896 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1967 |
| Edition | London: Longmans, 1892 |
| Edition year | 1892 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Board diagrams integral to the work |
| Illustration status | GREEN (work layer) |
| Primary source | Internet Archive: gamesancientorie00falkuoft — NOT_IN_COPYRIGHT (VERIFIED), 412 images |
| Secondary source | Internet Archive: in.ernet.dli.2015.281418 (Digital Library of India, ABBYY 11) |
| Source quality | A |
| Identifiers | IA `gamesancientorie00falkuoft` |
| Evidence links | [IA gamesancientorie00falkuoft](https://archive.org/details/gamesancientorie00falkuoft) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | Already the basis of a planned Valice Book 09; the senet/latrunculi/oriental-chess reconstruction chapters have no rival in print. |
| Competition / saturation | Low. **Trap confirmed**: IA also holds 1961 reprints (gamesancientorie0000falk, gamesancientorie0000edwa, gamesancientorie0000unse_b7n6) — those are NOT the rights source. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | The Great Book of World Games (Batch 1 title) |
| Strongest opportunity | Reconstructed ancient games with boards that must be redrawn to be playable — differentiation is structural, not cosmetic. |
| Main risk | Falkener's reconstructions are Victorian conjecture; presenting them as settled fact would be a claim failure. Needs explicit 'reconstruction, not evidence' framing. |
| Recommended future edition direction | Confirmed Batch 1 scope: redrawn boards, modernised rules, scholarly caveats on each reconstruction. |
| Rights notes | GREEN, all layers. Verified again 2026-09-03. |
| Evidence notes | IA metadata fetched 2026-09-03: NOT_IN_COPYRIGHT, creator dates 1814-1896, 412 images, _djvu.txt present. |
| Provenance in this catalog | OLD / REVALIDATED (in Batch 1) |

**Scores** — rights confidence 93 · commercial potential 74 · valice fit 95 · differentiation 88 · direct ebook 86 · amazon print 82 · seo 74 · visual 90 · bundle series 86 · production practicality 50

**Composite 85.7 · TIER S**

### The Alphabet: An Account of the Origin and Development of Letters (2 vols)

| Field | Value |
|---|---|
| Author | Isaac Taylor |
| Death year | 1901 (VERIFIED — IA creator authority: 'Taylor, Isaac, 1829-1901') |
| Original publication year | 1883 (1899 rev. ed.) |
| Original language | English |
| Category | Language; History; Reference; Art |
| Valice series fit | Valice Script (foundation title) |
| Work public-domain status | VERIFIED — 1883/1899 publication; author died 1901 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1972 |
| Edition | London: Kegan Paul, Trench, 1883; New York: Scribner, 1899 (rev.) |
| Edition year | 1883 / 1899 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Script tables and letterform charts integral to the work |
| Illustration status | GREEN (work layer) |
| Primary source | Internet Archive: alphabetaccounto01tayluoft (1883) — NOT_IN_COPYRIGHT (VERIFIED), 434 images |
| Secondary source | Internet Archive: historyofalphabe02tayluoft (1899) — NOT_IN_COPYRIGHT (VERIFIED) |
| Source quality | A |
| Identifiers | IA `alphabetaccounto01tayluoft` · historyofalphabe02tayluoft (vol 2, 1899) |
| Evidence links | [IA alphabetaccounto01tayluoft](https://archive.org/details/alphabetaccounto01tayluoft) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | Valice already sells two script workbooks (Hangul, Greek Alphabet). This is the historical spine that a 'Valice Script' series needs and does not have. |
| Competition / saturation | Moderate — modern popular books on alphabet history exist and sell; none is a public-domain reissue. |
| Free-edition pressure | MEDIUM — the scan is free but typographically unusable; the value is in re-set script tables. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Hangul Handwriting Workbook, Greek Alphabet Workbook — converts two isolated workbooks into a series with a flagship |
| Strongest opportunity | Turns Valice's two script workbooks into 'Valice Script'. Every script table is a redrawing job → differentiation is automatic and visual. |
| Main risk | Taylor's 1883 comparative philology is superseded in places (esp. on Semitic origins); publishing it without correcting apparatus would breach the no-invented-facts standard in the other direction — repeating disproven claims. |
| Recommended future edition direction | Heavily apparatus-led: re-set script tables, a modern 'what we now know' sidebar per chapter, and a chronology. Direct-first; print viable at 6×9. |
| Rights notes | GREEN. Two separate editions verified; prefer the 1883 first edition for text and the 1899 for revised tables. |
| Evidence notes | Both IA items fetched 2026-09-03: NOT_IN_COPYRIGHT, creator 'Taylor, Isaac, 1829-1901', _djvu.txt present on both. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 70 · valice fit 94 · differentiation 90 · direct ebook 86 · amazon print 78 · seo 80 · visual 84 · bundle series 88 · production practicality 44

**Composite 84.2 · TIER S**

### Mythical Monsters

| Field | Value |
|---|---|
| Author | Charles Gould |
| Death year | 1893 (VERIFIED — PG authority: 'Gould, Charles, 1834-1893') |
| Original publication year | 1886 |
| Original language | English |
| Category | Mythology; Nature; Reference |
| Valice series fit | Codex (Bestiarium) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1964 |
| Edition | London: W. H. Allen, 1886 |
| Edition year | 1886 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Plates integral to the 1886 edition; engraver NOT FOUND |
| Illustration status | YELLOW — engraver unattributed; redraw rather than reproduce |
| Primary source | Project Gutenberg 40972 (VERIFIED, 1,227 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 40972 |
| Evidence links | [PG 40972](https://www.gutenberg.org/ebooks/40972) |
| Demand proxy | 1,227 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | The Victorian 'were dragons real animals?' classic; the direct literary ancestor of Codex Bestiarium's dragon and sea-serpent sections. |
| Competition / saturation | Moderate — cheap PD reprints exist; none annotated. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Bestiarium (direct) |
| Strongest opportunity | A companion or source volume for a Valice book already on sale, with a built-in editorial hook: Gould's cryptozoological argument is wrong in an interesting, documentable way. |
| Main risk | Gould argues dragons were real surviving animals. Publishing without correcting apparatus would put a false claim in a Valice book — the apparatus is mandatory, not optional. |
| Recommended future edition direction | Annotated edition: Gould's text plus a 'what he got wrong and why it mattered' apparatus. Direct-first. |
| Rights notes | GREEN on the work layer; plates YELLOW pending engraver attribution. |
| Evidence notes | PG 40972 fetched 2026-09-03. |
| Provenance in this catalog | OLD / REVALIDATED |

**Scores** — rights confidence 93 · commercial potential 70 · valice fit 94 · differentiation 84 · direct ebook 84 · amazon print 76 · seo 78 · visual 86 · bundle series 88 · production practicality 62

**Composite 83.9 · TIER S**

### The Fairy Mythology: Illustrative of the Romance and Superstition of Various Countries

| Field | Value |
|---|---|
| Author | Thomas Keightley |
| Death year | 1872 (VERIFIED — PG authority: 'Keightley, Thomas, 1789-1872') |
| Original publication year | 1828 (1850 rev. ed.) |
| Original language | English |
| Category | Folklore; Mythology; Reference |
| Valice series fit | Codex (Mythologica / Bestiarium) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1943 |
| Edition | London: H. G. Bohn, 1850 (revised) |
| Edition year | 1828 / 1850 |
| Translation | Keightley translated the Continental material himself |
| Translator | Thomas Keightley (d. 1872) |
| Translation status | GREEN — translator is the author |
| Illustrator | NOT FOUND |
| Illustration status | n/a — text-led |
| Primary source | Project Gutenberg 41006 (VERIFIED, 2,173 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 41006 |
| Evidence links | [PG 41006](https://www.gutenberg.org/ebooks/41006) |
| Demand proxy | 2,173 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 2,173 downloads/30d. The first systematic comparative survey of European fairy belief and the source most later folklorists worked from. |
| Competition / saturation | Moderate. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Mythologica; Codex Bestiarium (the non-monstrous supernatural); The Great Book of World Myths |
| Strongest opportunity | A ready-made comparative structure (by country) that maps directly onto the Codex format Valice already ships. |
| Main risk | Long, and the 1828 and 1850 texts differ — the edition used must be stated and held to. |
| Recommended future edition direction | Codex-format reissue: country chapters, cross-referenced creature index, redrawn map. Strong bundle partner for Codex Mythologica. |
| Rights notes | GREEN on every layer, including translation (author-translated). |
| Evidence notes | PG 41006 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 93 · commercial potential 72 · valice fit 92 · differentiation 86 · direct ebook 84 · amazon print 78 · seo 78 · visual 74 · bundle series 90 · production practicality 60

**Composite 83.8 · TIER S**

### Seneca: Minor Dialogues and On Benefits (Aubrey Stewart translation)

| Field | Value |
|---|---|
| Author | Lucius Annaeus Seneca |
| Death year | 65 CE |
| Original publication year | c. 65 CE (translation 1889/1900) |
| Original language | Latin (original) |
| Category | Philosophy; Classics |
| Valice series fit | Valice Classics (The Stoic Library) |
| Work public-domain status | VERIFIED — ancient work |
| Rights confidence | **GREEN** |
| Jurisdiction | US: translation pre-1931 → PD · EU/UK/TR: translator died 1918 → life+70 expired 1989 |
| Edition | London: George Bell (Bohn's Classical Library) |
| Edition year | 1889 / 1900 |
| Translation | Aubrey Stewart's English prose translation |
| Translator | Aubrey Stewart — died 1918 (VERIFIED — PG authority: 'Stewart, Aubrey, 1844-1918') |
| Translation status | GREEN — VERIFIED clear worldwide |
| Illustrator | n/a |
| Illustration status | n/a |
| Primary source | Project Gutenberg 64576 (Minor Dialogues) and 3794 (On Benefits) — both VERIFIED |
| Secondary source | Standard Ebooks: /ebooks/seneca/dialogues/aubrey-stewart — CC0 1.0 Universal (VERIFIED on the page) |
| Source quality | A |
| Identifiers | PG 64576 · PG 3794 (On Benefits) |
| Evidence links | [PG 64576](https://www.gutenberg.org/ebooks/64576) · [PG 3794](https://www.gutenberg.org/ebooks/3794) · [Standard Ebooks](https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart) |
| Demand proxy | 3,529 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 3,529 + 3,438 PG downloads in 30 days. Stoicism is the single best-performing PD philosophy market and Valice already sells Meditations. |
| Competition / saturation | High on Stoicism generally; LOW on Seneca's dialogues specifically (the *Letters* dominate the market). |
| Free-edition pressure | HIGH — but Valice already proved a $9.99 Stoic edition sells at all. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Meditations (live product); Epictetus; 'The Stoic Library' bundle |
| Strongest opportunity | **This entry exists because the old pool's Seneca source failed revalidation.** The existing CSV recorded the Loeb/Gummere translation as GREEN on a death year of 1919 — which is the volume's publication year, not a death year. Gummere's authority record reads '1883- ' (born 1883, death not recorded), so the Loeb text cannot be cleared for EU/UK/TR on the evidence held. Stewart (d. 1918) is a fully verified GREEN substitute, and Standard Ebooks already publishes it CC0. |
| Main risk | Stewart's 1889 prose is more Victorian than Gummere's; readability work is real editorial labour. |
| Recommended future edition direction | 'Seneca: Selected Dialogues' — On Anger, On the Shortness of Life, On Tranquillity, plus selections from On Benefits. Light modernisation, notes, chronology. Anchors the Stoic Library bundle. |
| Rights notes | GREEN on all layers. **Use Stewart, not Gummere**, until Gummere's death year is verified. |
| Evidence notes | PG 64576 and 3794 fetched 2026-09-03 (translator 'Stewart, Aubrey, 1844-1918'); Standard Ebooks page fetched and CC0 dedication confirmed; IA adluciliumepistu03sene fetched and shows 'Gummere, Richard M. …, 1883- , tr.' |
| Provenance in this catalog | NEW — replaces a RED/YELLOW entry in the old pool |

**Scores** — rights confidence 94 · commercial potential 74 · valice fit 92 · differentiation 82 · direct ebook 88 · amazon print 76 · seo 76 · visual 56 · bundle series 92 · production practicality 76

**Composite 83.3 · TIER S**

### A Selection from the Discourses of Epictetus with the Encheiridion (George Long translation)

| Field | Value |
|---|---|
| Author | Epictetus |
| Death year | c. 135 CE |
| Original publication year | c. 108 CE (translation 1877) |
| Original language | Greek (original) |
| Category | Philosophy; Classics |
| Valice series fit | Valice Classics (The Stoic Library) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: translation pre-1931 → PD · EU/UK/TR: translator died 1879 → life+70 long expired |
| Edition | London: George Bell (Bohn's), 1877 |
| Edition year | 1877 |
| Translation | George Long's English prose — the same translator as Valice's live *Meditations* |
| Translator | George Long — died 1879 (VERIFIED — PG authority: 'Long, George, 1800-1879') |
| Translation status | GREEN |
| Illustrator | n/a |
| Illustration status | n/a |
| Primary source | Project Gutenberg 10661 (VERIFIED, 4,783 downloads/30d) |
| Secondary source | Standard Ebooks: /ebooks/epictetus/short-works/george-long and /ebooks/epictetus/discourses/george-long (CC0) |
| Source quality | A |
| Identifiers | PG 10661 |
| Evidence links | [PG 10661](https://www.gutenberg.org/ebooks/10661) · [Standard Ebooks](https://standardebooks.org/ebooks/epictetus/discourses/george-long) |
| Demand proxy | 4,783 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 4,783 downloads/30d; 35,691/30d for the separate Enchiridion (PG 45109). Valice's Meditations already uses Long, so house voice is consistent. |
| Competition / saturation | High. |
| Free-edition pressure | HIGH |
| Editorial expansion | MEDIUM |
| Existing Valice adjacency | Meditations (live, same translator); Seneca; 'The Stoic Library' bundle |
| Strongest opportunity | Translator continuity with the live Meditations is a real editorial asset: one voice across the Stoic Library. |
| Main risk | Crowded market; only the bundle and the apparatus justify the price. |
| Recommended future edition direction | 'Epictetus: Discourses & Enchiridion (Annotated)' in the Long voice, matching the Meditations edition. Bundle at $14.99. |
| Rights notes | GREEN. **Identifier correction:** the existing pool records PG 45109 as the George Long *Enchiridion*. PG 45109 is the **Thomas Wentworth Higginson** translation (d. 1911). Long's Enchiridion is inside PG 10661. Both are PD; the attribution in the pool was wrong. |
| Evidence notes | PG 10661 and 45109 both fetched 2026-09-03; agent roles read directly from the bibrec table. |
| Provenance in this catalog | OLD / REVALIDATED — with a corrected identifier |

**Scores** — rights confidence 94 · commercial potential 78 · valice fit 92 · differentiation 78 · direct ebook 88 · amazon print 74 · seo 78 · visual 52 · bundle series 92 · production practicality 82

**Composite 83.1 · TIER S**

### Kwaidan: Stories and Studies of Strange Things

| Field | Value |
|---|---|
| Author | Lafcadio Hearn |
| Death year | 1904 (VERIFIED — PG authority: 'Hearn, Lafcadio, 1850-1904') |
| Original publication year | 1904 |
| Original language | English |
| Category | Folklore; Classics |
| Valice series fit | Codex (Bestiarium — yōkai); Valice Classics |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1975 |
| Edition | Boston: Houghton Mifflin, 1904 |
| Edition year | 1904 |
| Translation | Hearn's own retellings from Japanese sources |
| Translator | Lafcadio Hearn |
| Translation status | GREEN |
| Illustrator | Takénouchi plates in the 1904 edition — artist death year NOT FOUND |
| Illustration status | YELLOW — unresolved; the existing Batch 1 plan already designs them out in favour of original art |
| Primary source | Project Gutenberg 1210 (VERIFIED — 2,918 downloads/30d) |
| Secondary source | Internet Archive: kwaidanstoriesst00hearuoft — NOT_IN_COPYRIGHT (VERIFIED) |
| Source quality | A |
| Identifiers | PG 1210 · IA `kwaidanstoriesst00hearuoft` |
| Evidence links | [PG 1210](https://www.gutenberg.org/ebooks/1210) · [IA kwaidanstoriesst00hearuoft](https://archive.org/details/kwaidanstoriesst00hearuoft) |
| Demand proxy | 2,918 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | Confirmed Batch 1 title; the best-known Western source on Japanese ghost tradition. |
| Competition / saturation | Moderate-high — many editions. |
| Free-edition pressure | MEDIUM-HIGH |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Bestiarium (yōkai field guide); Hearn's *Kotto* and *Glimpses* make a three-book set |
| Strongest opportunity | Already-planned title; the yōkai field-guide apparatus is the differentiator. |
| Main risk | Crowded; plates unusable. |
| Recommended future edition direction | Confirmed Batch 1 scope unchanged: original illustration, yōkai field-guide apparatus. |
| Rights notes | Text GREEN; plates YELLOW and designed out. Re-verified 2026-09-03. |
| Evidence notes | PG 1210 and IA kwaidanstoriesst00hearuoft both fetched 2026-09-03. |
| Provenance in this catalog | OLD / REVALIDATED (Batch 1) |

**Scores** — rights confidence 93 · commercial potential 74 · valice fit 88 · differentiation 82 · direct ebook 84 · amazon print 78 · seo 74 · visual 80 · bundle series 84 · production practicality 68

**Composite 83.0 · TIER S**

### Indian Myth and Legend

| Field | Value |
|---|---|
| Author | Donald A. Mackenzie |
| Death year | 1936 (VERIFIED — PG and IA authority agree: 'Mackenzie, Donald Alexander, 1873-1936') |
| Original publication year | 1913 |
| Original language | English |
| Category | Mythology; Folklore |
| Valice series fit | Codex Mythologica; The Great Book of… |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2007 |
| Edition | London: Gresham Publishing, 1913 |
| Edition year | 1913 |
| Translation | n/a — retold from translations |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Warwick Goble — death year 1943 (VERIFIED — PG authority: 'Goble, Warwick, 1862-1943') |
| Illustration status | GREEN — Goble's plates cleared worldwide on 1 Jan 2014 (life+70) |
| Primary source | Project Gutenberg 47228 (VERIFIED, 1,592 downloads/30d) |
| Secondary source | Internet Archive: indianmythlegend00mack — NOT_IN_COPYRIGHT (VERIFIED) |
| Source quality | A |
| Identifiers | PG 47228 · IA `indianmythlegend00mack` |
| Evidence links | [PG 47228](https://www.gutenberg.org/ebooks/47228) · [IA indianmythlegend00mack](https://archive.org/details/indianmythlegend00mack) |
| Demand proxy | 1,592 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | The existing Valice pool flagged Mackenzie's other volumes as 'identifier UNVERIFIED'. This one is now verified on both PG and IA, with usable plates. |
| Competition / saturation | Moderate. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Mythologica (Vedic/Hindu entries — a gap in the current 19-civilisation set); The Great Book of World Myths |
| Strongest opportunity | **Rare case: the illustrations are usable.** Goble is a first-rank golden-age illustrator whose plates are cleared worldwide — most candidates in this catalog need original art commissioned instead. |
| Main risk | Mackenzie's Edwardian racial framing (Aryan migration theory) is pervasive and needs an editorial statement, not silent deletion. |
| Recommended future edition direction | Annotated edition with Goble's plates restored, a framing preface on Mackenzie's assumptions, and a pronunciation glossary. |
| Rights notes | GREEN on all four layers including illustration — verified separately for author and illustrator. |
| Evidence notes | PG 47228 and IA indianmythlegend00mack both fetched 2026-09-03; Goble dates from the PG agent record. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 72 · valice fit 90 · differentiation 82 · direct ebook 84 · amazon print 78 · seo 76 · visual 80 · bundle series 86 · production practicality 62

**Composite 82.4 · TIER S**

### Ancient Legends, Mystic Charms & Superstitions of Ireland

| Field | Value |
|---|---|
| Author | Lady Wilde ('Speranza') |
| Death year | 1896 (VERIFIED — PG authority: 'Wilde, Lady (Jane Francesca Agnes), 1821-1896') |
| Original publication year | 1887 |
| Original language | English |
| Category | Folklore; Mythology |
| Valice series fit | Codex Mythologica; The Great Book of… |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1967 |
| Edition | London: Ward and Downey, 1887 |
| Edition year | 1887 |
| Translation | Collected from Irish-language informants; Wilde's own English |
| Translator | Lady Wilde (d. 1896) |
| Translation status | GREEN |
| Illustrator | NOT FOUND |
| Illustration status | n/a |
| Primary source | Project Gutenberg 61436 (VERIFIED, 1,460 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 61436 |
| Evidence links | [PG 61436](https://www.gutenberg.org/ebooks/61436) |
| Demand proxy | 1,460 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | A named-author Irish folklore collection (Oscar Wilde's mother) with a marketable byline — unusual in this field. |
| Competition / saturation | Moderate — Irish folklore is a crowded PD corner (Yeats, Gregory, Jacobs). |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Mythologica (Celtic); The Great Book of World Myths |
| Strongest opportunity | The byline is the differentiator: 'collected by Oscar Wilde's mother' is a real hook that the Yeats/Gregory competition cannot claim. |
| Main risk | Crowded corner; the charms/cures material needs a clear 'historical record, not medical advice' note. |
| Recommended future edition direction | Annotated edition leaning on the Wilde connection, with a charms/cures apparatus and Irish-language term glossary. |
| Rights notes | GREEN. |
| Evidence notes | PG 61436 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 93 · commercial potential 70 · valice fit 88 · differentiation 84 · direct ebook 84 · amazon print 76 · seo 78 · visual 70 · bundle series 84 · production practicality 68

**Composite 82.2 · TIER S**

---

## 10. Tier A — Strong Candidates

GREEN, scoring 75–81. Full structured records for the newly discovered and decision-relevant entries; the remainder follow in the summary table at the end of this section.

### Chess and Playing Cards

| Field | Value |
|---|---|
| Author | Stewart Culin |
| Death year | 1929 (VERIFIED — IA creator authority) |
| Original publication year | 1898 |
| Original language | English |
| Category | Games; Anthropology; History |
| Valice series fit | The Great Book of… (World Games, vol. 3: cards & chess families) |
| Work public-domain status | VERIFIED — 1898 US National Museum publication; author died 1929 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD; US Government publication · EU/UK/TR: life+70 expired 2000 |
| Edition | Washington: US National Museum Annual Report, 1898 |
| Edition year | 1898 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Catalogue plates integral |
| Illustration status | GREEN |
| Primary source | Internet Archive: chessplayingcard00culi — rights field reads 'The Library of Congress is unaware of any copyright restrictions for this item' (VERIFIED), 400 images |
| Secondary source | NOT FOUND on Project Gutenberg |
| Source quality | A |
| Identifiers | IA `chessplayingcard00culi` |
| Evidence links | [IA chessplayingcard00culi](https://archive.org/details/chessplayingcard00culi) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | Culin's comparative catalogue of chess- and card-game families across Asia, Europe and the Americas; still the reference for game-family diffusion. |
| Competition / saturation | Very low. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | World Games vol. 3; pairs with Korean Games and Mancala into a Culin collection |
| Strongest opportunity | Completes a three-book Culin set that no publisher has ever assembled as a modern reading edition. |
| Main risk | Museum-catalogue structure (object lists) reads badly as a trade book without heavy restructuring. |
| Recommended future edition direction | Merge with Mancala and selected Korean Games material into 'Culin: The World's Games' — or use as World Games vol. 3 source. |
| Rights notes | GREEN. US Government publication strengthens the US layer. |
| Evidence notes | IA metadata fetched 2026-09-03; LoC rights statement captured verbatim. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 88 · commercial potential 66 · valice fit 92 · differentiation 88 · direct ebook 82 · amazon print 76 · seo 70 · visual 88 · bundle series 90 · production practicality 48

**Composite 81.9 · TIER A**

### Sea Monsters Unmasked, and Sea Fables Explained

| Field | Value |
|---|---|
| Author | Henry Lee |
| Death year | 1888 (VERIFIED — PG authority: 'Lee, Henry, 1826-1888') |
| Original publication year | 1883/1884 |
| Original language | English |
| Category | Nature; Mythology; History |
| Valice series fit | Codex (Bestiarium) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1959 |
| Edition | London: William Clowes (International Fisheries Exhibition handbooks) |
| Edition year | 1883/1884 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Figures integral |
| Illustration status | GREEN (work layer) |
| Primary source | Project Gutenberg 36677 (VERIFIED, 917 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 36677 |
| Evidence links | [PG 36677](https://www.gutenberg.org/ebooks/36677) |
| Demand proxy | 917 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | The Victorian debunking of the kraken/sea-serpent, by the Brighton Aquarium naturalist — the counterpart argument to Gould. |
| Competition / saturation | Very low. |
| Free-edition pressure | LOW — short and obscure. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Bestiarium; pairs directly against Mythical Monsters as a two-sided volume |
| Strongest opportunity | Short, cheap, and it creates a genuinely original Valice product: Gould's credulity and Lee's scepticism bound together with modern apparatus. |
| Main risk | Too short to stand alone in print; must be paired. |
| Recommended future edition direction | Bind with *Mythical Monsters* as 'Monsters: The Case For and Against (1883–1886)'. Direct-first; paperback viable once paired. |
| Rights notes | GREEN. |
| Evidence notes | PG 36677 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 92 · commercial potential 62 · valice fit 92 · differentiation 88 · direct ebook 82 · amazon print 62 · seo 74 · visual 88 · bundle series 84 · production practicality 78

**Composite 81.3 · TIER A**

### Modern Magic: A Practical Treatise on the Art of Conjuring

| Field | Value |
|---|---|
| Author | Professor Hoffmann (Angelo John Lewis) |
| Death year | 1919 (VERIFIED — PG authority: 'Hoffmann, Professor, 1839-1919') |
| Original publication year | 1876 |
| Original language | English |
| Category | Games; Education; Reference |
| Valice series fit | Codex (Enigmatica); The Great Book of… |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1990 |
| Edition | London: George Routledge, 1876 |
| Edition year | 1876 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Explanatory engravings integral |
| Illustration status | YELLOW — engraver unattributed; redraw |
| Primary source | Project Gutenberg 58057 (VERIFIED — 1,955 downloads/30d) |
| Secondary source | Related: PG 55279 (*Latest Magic*), PG 60687 (*The Magician's Own Book*) |
| Source quality | A |
| Identifiers | PG 58057 |
| Evidence links | [PG 58057](https://www.gutenberg.org/ebooks/58057) |
| Demand proxy | 1,955 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | The foundational English conjuring manual; still cited by working magicians. Same author as *Puzzles Old and New* — a two-book author asset. |
| Competition / saturation | Low for a modern typeset edition. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Enigmatica; pairs with *Puzzles Old and New* into a Hoffmann set |
| Strongest opportunity | Hoffmann gives Valice a second strong title from one verified-clear author — the cheapest kind of series to build. |
| Main risk | Victorian apparatus (many tricks need equipment nobody has) limits practical usefulness; selection is essential. |
| Recommended future edition direction | Selected tricks that still work with modern objects, redrawn diagrams. Bundle with *Puzzles Old and New* as 'The Hoffmann Library'. |
| Rights notes | GREEN on the work layer. |
| Evidence notes | PG 58057 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 92 · commercial potential 68 · valice fit 84 · differentiation 82 · direct ebook 82 · amazon print 76 · seo 72 · visual 82 · bundle series 84 · production practicality 58

**Composite 80.7 · TIER A**

### The History of Four-Footed Beasts and Serpents

| Field | Value |
|---|---|
| Author | Edward Topsell |
| Death year | 1625? (VERIFIED — IA creator authority: 'Topsell, Edward, 1572-1625?') |
| Original publication year | 1607 (1658 ed.) |
| Original language | English (early modern) |
| Category | Bestiary; Nature; History |
| Valice series fit | Codex (Bestiarium) |
| Work public-domain status | VERIFIED — 17th-century work |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 long expired |
| Edition | London: E. Cotes for G. Sawbridge, 1658 |
| Edition year | 1658 |
| Translation | Topsell compiled from Gesner's Latin; his own English |
| Translator | Edward Topsell |
| Translation status | GREEN |
| Illustrator | Woodcuts derive from Gesner (d. 1565) via the 1658 printing |
| Illustration status | GREEN on copyright — but scan-provider terms differ (see rights notes) |
| Primary source | Internet Archive: historyoffourfoo00tops (Duke Libraries scan, ABBYY 9 OCR — VERIFIED) |
| Secondary source | Wellcome Collection b10180023 (Tesseract 5.3 OCR) — recorded in the existing plan, NOT re-verified in this pass |
| Source quality | A |
| Identifiers | IA `historyoffourfoo00tops` |
| Evidence links | [IA historyoffourfoo00tops](https://archive.org/details/historyoffourfoo00tops) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | The most visually distinctive bestiary source available; the direct ancestor of Codex Bestiarium, which Valice already sells. |
| Competition / saturation | Low for a modernised edition; facsimiles exist. |
| Free-edition pressure | LOW — the barrier is legibility, and that is exactly what a Valice edition removes. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Bestiarium (direct ancestor) |
| Strongest opportunity | Highest visual score in the catalog. Modern-spelling transcription is a real, defensible product: nobody sells a readable Topsell. |
| Main risk | **Production is the blocker, not rights.** 1658 blackletter/early-modern orthography defeats ABBYY 9; the existing OCR research prescribes Kraken with a period model. Budget accordingly — this is the hardest book in the catalog. |
| Recommended future edition direction | Selected bestiary (~60 beasts), modern-spelling transcription facing the original woodcut, Codex cross-references. |
| Rights notes | Work and illustration layers GREEN. Wellcome images are CC BY 4.0 per the existing plan — attribution required, and CC BY images must not be used on the cover under the original-cover rule. |
| Evidence notes | IA metadata fetched 2026-09-03: 1658, Duke Libraries, ABBYY FineReader 9.0, _djvu.txt present. |
| Provenance in this catalog | OLD / REVALIDATED |

**Scores** — rights confidence 80 · commercial potential 66 · valice fit 94 · differentiation 92 · direct ebook 80 · amazon print 72 · seo 74 · visual 96 · bundle series 82 · production practicality 22

**Composite 80.4 · TIER A**

### The Complete Herbal

| Field | Value |
|---|---|
| Author | Nicholas Culpeper |
| Death year | 1654 (VERIFIED — PG authority: 'Culpeper, Nicholas, 1616-1654') |
| Original publication year | 1653 |
| Original language | English |
| Category | Nature; Reference; History |
| Valice series fit | Field Book; standalone |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 long expired |
| Edition | London, 1653 (with later added matter) |
| Edition year | 1653 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Botanical plates vary by edition; the PG text's plate source NOT FOUND |
| Illustration status | YELLOW — plate provenance varies by printing; verify before reproducing any |
| Primary source | Project Gutenberg 49513 (VERIFIED — 6,812 downloads/30d, the highest of any newly discovered candidate) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 49513 |
| Evidence links | [PG 49513](https://www.gutenberg.org/ebooks/49513) |
| Demand proxy | 6,812 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 6,812 downloads in 30 days — the strongest raw demand signal in the entire new-discovery set. Culpeper is continuously in print in multiple competing editions. |
| Competition / saturation | HIGH — many editions, from cheap POD to illustrated hardbacks. |
| Free-edition pressure | HIGH. |
| Editorial expansion | MEDIUM |
| Existing Valice adjacency | Weak to current Valice series (no herbal/nature line exists yet); would need a new lane. |
| Strongest opportunity | Demand is unambiguous and measured. If Valice ever opens a nature/field lane, this is its anchor. |
| Main risk | **Safety framing is mandatory.** Culpeper prescribes treatments; a modern edition must be unambiguously historical. Also a crowded market and weak fit with the current catalog. |
| Recommended future edition direction | Not near-term. If pursued: strictly historical framing, astrological-botanical apparatus, modern plant-name concordance. |
| Rights notes | Text GREEN. Plates YELLOW pending edition-specific verification. |
| Evidence notes | PG 49513 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 92 · commercial potential 78 · valice fit 74 · differentiation 78 · direct ebook 84 · amazon print 76 · seo 82 · visual 80 · bundle series 70 · production practicality 56

**Composite 80.2 · TIER A**

### The Grammar of Ornament

| Field | Value |
|---|---|
| Author | Owen Jones |
| Death year | 1874 (VERIFIED — IA creator authority: 'Jones, Owen, 1809-1874') |
| Original publication year | 1856 (1868 ed.) |
| Original language | English |
| Category | Art; Reference; Design |
| Valice series fit | standalone / future 'Valice Design' line |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1945; co-authors Waring d.1875, Westwood d.1893 |
| Edition | London: Bernard Quaritch, 1868 |
| Edition year | 1856 / 1868 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | 112 chromolithographic plates; Jones, Waring and Westwood credited on the IA record |
| Illustration status | GREEN — all three credited creators died before 1900 |
| Primary source | Internet Archive: grammarofornamen00joneuoft — NOT_IN_COPYRIGHT (VERIFIED), OCAD/Toronto scan |
| Secondary source | NOT FOUND on Project Gutenberg |
| Source quality | A |
| Identifiers | IA `grammarofornamen00joneuoft` |
| Evidence links | [IA grammarofornamen00joneuoft](https://archive.org/details/grammarofornamen00joneuoft) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | A design-reference perennial: modern facsimile editions from Princeton Architectural Press and others sell continuously at $40–60. |
| Competition / saturation | HIGH — this is the one candidate in the catalog with strong, well-funded competing editions. |
| Free-edition pressure | LOW on price, HIGH on quality: buyers of this book are buying colour reproduction, and that is expensive to match. |
| Editorial expansion | LOW |
| Existing Valice adjacency | Weak to current Valice series; would open a new design lane rather than extend an existing one. |
| Strongest opportunity | Unmatched visual asset if colour print economics can be made to work. |
| Main risk | **Colour plate reproduction is the whole product.** KDP colour printing at this quality is costly and the incumbents are strong. Listed for completeness; not recommended for near-term production. |
| Recommended future edition direction | Do not attempt a full facsimile. If used at all, mine selected plates as design reference for other Valice covers and interiors. |
| Rights notes | GREEN on every layer. |
| Evidence notes | IA metadata fetched 2026-09-03: NOT_IN_COPYRIGHT, three creators with death years all pre-1900, 182 images in this scan. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 70 · valice fit 82 · differentiation 84 · direct ebook 78 · amazon print 74 · seo 70 · visual 98 · bundle series 74 · production practicality 20

**Composite 79.6 · TIER A**

### British Goblins: Welsh Folk-lore, Fairy Mythology, Legends and Traditions

| Field | Value |
|---|---|
| Author | Wirt Sikes |
| Death year | 1883 (VERIFIED — PG authority: 'Sikes, Wirt, 1836-1883') |
| Original publication year | 1880 |
| Original language | English |
| Category | Folklore; Mythology |
| Valice series fit | Codex (Mythologica / Bestiarium) |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1954; illustrator d.1915 → cleared 1986 |
| Edition | London: Sampson Low, 1880 |
| Edition year | 1880 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | T. H. Thomas — died 1915 (VERIFIED — PG authority: 'Thomas, T. H. (Thomas Henry), 1839-1915') |
| Illustration status | GREEN — cleared worldwide 1986; **plates are usable** |
| Primary source | Project Gutenberg 34704 (VERIFIED — 2,545 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 34704 |
| Evidence links | [PG 34704](https://www.gutenberg.org/ebooks/34704) |
| Demand proxy | 2,545 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 2,545 downloads/30d. The standard English-language Welsh folklore collection. |
| Competition / saturation | Low-moderate — Welsh material is much less worked than Irish. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Bestiarium (Welsh creatures); Codex Mythologica (Celtic); complements the Mabinogion |
| Strongest opportunity | **Usable illustrations** — a rarity in this catalog — plus an under-served national folklore. |
| Main risk | Welsh-language orthography needs care. |
| Recommended future edition direction | Annotated edition with Thomas's plates restored, Welsh term glossary, creature index cross-referenced to Codex Bestiarium. |
| Rights notes | GREEN on all four layers, illustration included — separately verified. |
| Evidence notes | PG 34704 fetched 2026-09-03; both author and illustrator dates read from the bibrec table. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 66 · valice fit 86 · differentiation 80 · direct ebook 80 · amazon print 72 · seo 74 · visual 72 · bundle series 80 · production practicality 68

**Composite 79.1 · TIER A**

### Mancala, the National Game of Africa

| Field | Value |
|---|---|
| Author | Stewart Culin |
| Death year | 1929 (VERIFIED — PG and IA authority agree) |
| Original publication year | 1896 |
| Original language | English |
| Category | Games; Anthropology |
| Valice series fit | The Great Book of… (World Games) |
| Work public-domain status | VERIFIED — 1896 US Government Printing Office; author died 1929 |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD; US Government publication · EU/UK/TR: life+70 expired 2000 |
| Edition | Washington: Govt. Print. Off., 1896 |
| Edition year | 1896 |
| Translation | n/a |
| Translator | n/a |
| Translation status | n/a |
| Illustrator | Board figures integral |
| Illustration status | GREEN |
| Primary source | Project Gutenberg 66220 (VERIFIED, 'Public domain in the USA.') |
| Secondary source | Internet Archive: mancalanationalg00culi (Boston University scan, 36 images) |
| Source quality | A |
| Identifiers | PG 66220 · IA `mancalanationalg00culi` |
| Evidence links | [PG 66220](https://www.gutenberg.org/ebooks/66220) · [IA mancalanationalg00culi](https://archive.org/details/mancalanationalg00culi) |
| Demand proxy | 493 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | Mancala remains one of the most-played board-game families worldwide; 493 PG downloads in the last 30 days for a 36-page government pamphlet is a real signal. |
| Competition / saturation | Low for the historical treatment; high for 'how to play mancala' generally. |
| Free-edition pressure | LOW as a standalone (too short to sell alone) — HIGH value as a chapter. |
| Editorial expansion | MEDIUM |
| Existing Valice adjacency | World Games African chapter; Culin collection |
| Strongest opportunity | Short, clean, fully verified, trivially cheap to produce. Ideal companion/bundle filler rather than a standalone edition. |
| Main risk | 36 pages — cannot carry a standalone paid edition. Print economics do not work alone. |
| Recommended future edition direction | Chapter inside World Games vol. 3, or a free companion PDF that feeds the email list. |
| Rights notes | GREEN on every layer; both PG and IA records agree on dates. |
| Evidence notes | PG 66220 fetched 2026-09-03: author 'Culin, Stewart, 1858-1929', 493 downloads/30d. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 60 · valice fit 90 · differentiation 84 · direct ebook 78 · amazon print 64 · seo 70 · visual 80 · bundle series 88 · production practicality 74

**Composite 78.9 · TIER A**

### Hero-Myths & Legends of the British Race

| Field | Value |
|---|---|
| Author | M. I. Ebbutt |
| Death year | 1934 (VERIFIED — PG authority: 'Ebbutt, M. I. (Maud Isabel), 1867-1934') |
| Original publication year | 1910 |
| Original language | English |
| Category | Mythology; Folklore |
| Valice series fit | Codex (Heroica); The Great Book of… |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2005 |
| Edition | London: George G. Harrap, 1910 |
| Edition year | 1910 |
| Translation | Retold from Old and Middle English sources |
| Translator | M. I. Ebbutt |
| Translation status | GREEN |
| Illustrator | NOT FOUND |
| Illustration status | n/a |
| Primary source | Project Gutenberg 25502 (VERIFIED — 2,999 downloads/30d) |
| Secondary source | NOT FOUND in this pass |
| Source quality | A |
| Identifiers | PG 25502 |
| Evidence links | [PG 25502](https://www.gutenberg.org/ebooks/25502) |
| Demand proxy | 2,999 downloads / 30 days (VERIFIED) |
| Commercial-use evidence | 2,999 downloads/30d. Beowulf, Hereward, Havelok, Roland — the hero-cycle material a Codex Heroica would need. |
| Competition / saturation | Moderate. |
| Free-edition pressure | MEDIUM |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex (a Heroica volume does not exist yet — this is its natural spine); The Great Book of World Myths |
| Strongest opportunity | Opens a fourth Codex volume with verified-clear source material and measured demand. |
| Main risk | 'British race' framing is of its period and needs an editorial note. |
| Recommended future edition direction | Source spine for a future *Codex Heroica*; hero-cycle chapters with genealogy diagrams and a timeline. |
| Rights notes | GREEN on all layers. |
| Evidence notes | PG 25502 fetched 2026-09-03. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 66 · valice fit 84 · differentiation 78 · direct ebook 80 · amazon print 74 · seo 72 · visual 68 · bundle series 80 · production practicality 66

**Composite 78.3 · TIER A**

### Récréations mathématiques (4 vols)

| Field | Value |
|---|---|
| Author | Édouard Lucas |
| Death year | 1891 (VERIFIED — IA creator authority: 'Lucas, Edouard, 1842-1891') |
| Original publication year | 1882–1894 |
| Original language | French |
| Category | Puzzle / Mathematics |
| Valice series fit | Codex (Enigmatica); Valice Classics |
| Work public-domain status | VERIFIED |
| Rights confidence | **GREEN** |
| Jurisdiction | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1962 |
| Edition | Paris: Gauthier-Villars et fils, 1891–96 |
| Edition year | 1891–96 |
| Translation | **No public-domain English translation identified.** A Valice edition would require an ORIGINAL translation. |
| Translator | NOT FOUND — would be Valice-original |
| Translation status | n/a — original translation required |
| Illustrator | Figures integral |
| Illustration status | GREEN |
| Primary source | Internet Archive: recretionmatedou03lucarich — NOT_IN_COPYRIGHT (VERIFIED) |
| Secondary source | NOT FOUND on Project Gutenberg |
| Source quality | A |
| Identifiers | IA `recretionmatedou03lucarich` |
| Evidence links | [IA recretionmatedou03lucarich](https://archive.org/details/recretionmatedou03lucarich) |
| Demand proxy | not measurable (no PG record) |
| Commercial-use evidence | Lucas invented the Tower of Hanoi and named the Fibonacci sequence; his *Récréations* is the French counterpart to Dudeney and Rouse Ball and has never had a full English trade translation. |
| Competition / saturation | VERY LOW in English — effectively an open field. |
| Free-edition pressure | LOW — the French scan does not compete with an English edition. |
| Editorial expansion | HIGH |
| Existing Valice adjacency | Codex Enigmatica; The Puzzles of Henry Dudeney (same reader) |
| Strongest opportunity | **The strongest differentiation case in the catalog.** An original English translation is, under KDP's own rules, the highest grade of public-domain differentiation — and it creates a book that does not currently exist in English. |
| Main risk | Translation of technical 19th-century French mathematics is expensive and slow, and Valice has no verified translation capacity. This is the gating question, not rights. |
| Recommended future edition direction | Selected translation ('Lucas: Mathematical Recreations, Selected and Translated'), one volume, with redrawn figures. Only if translation capacity is real. |
| Rights notes | Source GREEN. A Valice translation would be Valice's own copyright — an asset, not a liability. |
| Evidence notes | IA metadata fetched 2026-09-03: NOT_IN_COPYRIGHT, creator 'Lucas, Edouard, 1842-1891', dated 1891-96. |
| Provenance in this catalog | NEW |

**Scores** — rights confidence 90 · commercial potential 62 · valice fit 86 · differentiation 86 · direct ebook 78 · amazon print 70 · seo 62 · visual 78 · bundle series 80 · production practicality 34

**Composite 78.0 · TIER A**

### Tier A — remaining candidates

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Twentieth Century Standard Puzzle Book** | A. Cyril Pearson (ed.) · d. 1916 | 1907 | PG 63884 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 79.6 | Codex Enigmatica | Three-part compilation; heavy selection needed to avoid a shapeless book. |
| 2 | **Meditations (George Long translation)** | Marcus Aurelius · d. 1879 ✓ | 1862 | PG 15877 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared long ago | 79.2 | Valice Classics — ALREADY LIVE at $9.99 | Already published and, by the existing plan's own assessment, **below the differentiation standard**. The upgrade is the action, not acquisition. |
| 3 | **Myths of the Norsemen: From the Eddas and Sagas** | H. A. Guerber · d. 1929 | 1908 | PG 28497 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2000 | 78.2 | Codex Mythologica (Norse); World Myths | Very crowded Norse corner. |
| 4 | **The Enchiridion (Thomas Wentworth Higginson translation)** | Epictetus · d. 1911 ✓ | 1865 | PG 45109 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1982 | 77.5 | Valice Classics; Stoic Library bundle | **Identifier correction:** the existing pool labels PG 45109 'George Long'. It is Higginson's translation. |
| 5 | **The Book of Were-Wolves** | Sabine Baring-Gould · d. 1924 | 1865 | PG 5324 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 77.4 | Codex Bestiarium (shape-changers) | Contains grim true-crime material needing an editorial note. |
| 6 | **The Handbook to English Heraldry** | Charles Boutell · d. 1877 ✓ | 1863 | PG 23186 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1948 | 77.4 | Codex Bestiarium (heraldic beasts) | Later editions were revised by Fox-Davies — use the Boutell text only. |
| 7 | **Myths & Legends of the Celtic Race** | T. W. Rolleston · d. 1920 | 1911 | PG 34081 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 77.1 | Codex Mythologica (Celtic) | Crowded corner. |
| 8 | **Myths of China and Japan** | Donald A. Mackenzie · d. 1936 | 1923 | PG 67344 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 76.8 | Codex Mythologica; Werner companion | Overlaps Werner; use as corroboration. |
| 9 | **The Younger Edda (Rasmus B. Anderson translation)** | Snorri Sturluson · d. 1936 ✓ | 1880 | PG 18947 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2007 | 76.6 | Codex Mythologica (Norse) | Use Anderson, **not** Brodeur — see the REJECTED entry. |
| 10 | **Curious Myths of the Middle Ages** | Sabine Baring-Gould · d. 1924 | 1866 | PG 36127 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 76.6 | Codex Bestiarium/Heroica (Wandering Jew, Prester John, Tannh |  |
| 11 | **Korean Folk Tales: Imps, Ghosts and Fairies (Gale translation)** | Im Bang & Yi Ryuk · d. 1937 ✓ | 1913 | PG 51002 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2008 | 76.6 | Hangul line ↔ Codex Bestiarium (Korean creatures) | Short. |
| 12 | **Myths of Babylonia and Assyria** | Donald A. Mackenzie · d. 1936 | 1915 | PG 16653 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 76.4 | Codex Mythologica (Mesopotamia) | Overlaps Spence's Babylonia volume; Mackenzie is the GREEN choice because Spence's plates are blocked. |
| 13 | **The Story of the Alphabet** | Edward Clodd · d. 1930 | 1900 | PG 46388 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2001 | 76.3 | Valice Script (with Taylor); Hangul + Greek workbooks | Popular-level and shorter than Taylor; better as a companion than a flagship. |
| 14 | **An Introduction to the Study of the Maya Hieroglyphs** | Sylvanus Griswold Morley · d. 1948 | 1915 | PG 43491 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2019 | 75.9 | Valice Script (non-alphabetic writing) | Morley's decipherment is substantially superseded — apparatus must say so plainly. |
| 15 | **Mathematical Recreations and Essays (4th ed.)** | W. W. Rouse Ball · d. 1925 | 1905 | PG 26839 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1996 | 75.7 | Codex Enigmatica; Dudeney/Loyd set | **Edition trap:** Coxeter's revisions (1939+) are in copyright. Use the 4th edition (1905) only. |
| 16 | **The Poetic Edda (Henry Adams Bellows translation)** | anonymous · d. 1939 ✓ | 1923 | PG 73533 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2010 | 75.6 | Codex Mythologica (Norse) | Bellows' own notes are extensive — a Valice edition must add different apparatus, not duplicate his. |
| 17 | **Turkish Fairy Tales and Folk Tales** | Ignácz Kúnos · d. 1945/1909 ✓ | 1896 | PG 64807 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2016 | 75.4 | World Myths; the Founder's own cultural ground | Bain translated from Kúnos's Hungarian, not from Turkish — a two-step transmission to disclose. |
| 18 | **Birds in Legend, Fable and Folklore** | Ernest Ingersoll · d. 1946 | 1923 | PG 59598 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2017 | 75.1 | Codex Bestiarium (avian) | Ingersoll's *Dragons and Dragon Lore* is the better-known title but its clean scan is unconfirmed — this one is verified and available. |

---

## 11. Tier B — Promising Candidates

GREEN and scoring 68–74, **or** YELLOW and scoring 70+. A YELLOW entry here is promising *and* blocked: the open rights question must close before it can move.

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Fictitious & Symbolic Creatures in Art, with Special Reference to Their Us** | John Vinycomb · d. NOT FOUND | 1906 | PG 40825 · IA `fictitioussymbol00vinyuoft` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — author death year NOT FOUND | 82.9 | Codex Bestiarium (direct — griffin, wyvern, cockatrice, unic | **Rights, not commerce.** One missing death year blocks EU/UK/TR. Resolve via a UK probate/obituary or a national library authority record before Gate… |
| 2 | **A Complete Guide to Heraldry** | Arthur Charles Fox-Davies · d. 1928 ✓ | 1909 | PG 41617 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 1999; ILLUSTRATOR death year NOT FOUND | 78.9 | Codex Bestiarium (heraldic beasts overlap directly with Viny | Illustrator clearance unresolved — and in a heraldry book the illustrations are most of the product. |
| 3 | **Myths and Legends of Ancient Egypt / Myths & Legends of Babylonia & Assyri** | Lewis Spence · d. 1955 ✓ | 1915 / 1916 | PG 43662 · PG 45137 (Babylonia & Assyria) | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 1 Jan 2026; ILLUSTRATOR blocked to 2034 | 76.4 | Codex Mythologica (Egyptian and Mesopotamian entries) | **Illustration trap, newly identified in this pass.** Evelyn Paul's colour plates stay in copyright in EU/UK/TR until 2034. The existing pool did not … |
| 4 | **Sam Loyd's Cyclopedia of 5000 Puzzles, Tricks and Conundrums** | Sam Loyd (comp. Sam Loyd Jr.) · d. 1911 ✓ (+1 NOT FOUND) | 1914 | IA `CyclopediaOfPuzzlesLoyd` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: compiler's death year UNVERIFIED | 76.4 | Codex Enigmatica; Dudeney reader | Source is a **user upload** (IA collection 'opensource; community') with a self-applied PD Mark, not a library scan — weaker evidence than the pool as… |
| 5 | **The Evolution of the Dragon** | Grafton Elliot Smith · d. 1937 | 1919 | PG 22038 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2008 | 74.9 | Codex Bestiarium (dragons) | Elliot Smith's hyperdiffusionism is thoroughly discredited — apparatus must frame it as history of ideas. |
| 6 | **The Consolation of Philosophy (H. R. James translation)** | Boethius · d. 1931 ✓ | 1897 | PG 14328 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 74.3 | Valice Classics | The pool marked James's death year as a secondary-source assumption; the PG authority record confirms 1931. |
| 7 | **Korean Fairy Tales** | William Elliot Griffis · d. 1928 | 1922 | PG 67180 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1999 | 73.2 | Hangul line | Griffis worked from secondary sources; accuracy caveats needed. |
| 8 | **The Popol Vuh (Lewis Spence)** | Lewis Spence · d. 1955 | 1908 | PG 56550 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1 Jan 2026 | 73.0 | Codex Mythologica (Mesoamerica) | Spence's is a summary, not a translation of the Popol Vuh. |
| 9 | **Writing & Illuminating, & Lettering** | Edward Johnston · d. 1944 | 1906 | PG 47089 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 2015; ILLUSTRATOR dates NOT FOUND | 72.5 | Valice Script; the calligraphy reader | The foundational modern calligraphy manual — but the illustrator's dates are unrecorded and the plates are much of the value. |
| 10 | **The Golden Sayings of Epictetus (Hastings Crossley translation)** | Epictetus · d. 1926 ✓ | 1903 | PG 871 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1997 | 72.4 | Stoic Library bundle | The pool recorded Crossley's death as 1914; the PG authority record says **1926**. Still GREEN, but the datum was wrong. |
| 11 | **Hoyle's Games Modernized** | Professor Hoffmann (Angelo Lewis) · d. 1919 | 1909 | PG 39445 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 72.3 | World Games vol. 2 (cards/dice) | Rules reference, not a reading book; value is as source material, not as an edition. |
| 12 | **Children's Rhymes, Children's Games, Children's Songs, Children's Stories** | Robert Ford · d. 1905 | 1904 | PG 24271 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1976 | 72.3 | World Games (Scottish); Gomme companion | Overlaps Gomme heavily; use as corroboration rather than a separate edition. |
| 13 | **The Book of Talismans, Amulets and Zodiacal Gems** | W. T. & K. Pavitt · d. 1937/1949 ✓ | 1914 | PG 78789 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2020 | 72.2 | Codex (esoterica); weak to current series | Occult-claims framing needed. |
| 14 | **A History of Chess** | H. J. R. Murray · d. 1955 | 1913 | IA `AHistoryOfChessHJRMurray` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1 Jan 2026 — newly available | 71.4 | World Games (chess chapter) | 900 pages; only a selection is feasible. Note `historyofchess0000hjrm` is in `internetarchivebooks` (lending), not a free PD download — use the `AHist… |
| 15 | **A History of the Old English Letter Foundries** | Talbot Baines Reed · d. 1893 | 1887 | PG 54365 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1964 | 71.4 | Valice Script (typography) | Specialist. |
| 16 | **Athletics and Games of the Ancient Greeks** | Edward Marwick Plummer · d. NOT FOUND | 1898 | PG 64627 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 71.3 | World Games (Greek chapter) | Death year unresolved blocks EU/UK/TR. |
| 17 | **Omens and Superstitions of Southern India** | Edgar Thurston · d. 1935 ✓ | 1912 | PG 35690 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2006 | 71.2 | Codex; World Myths (South Asia) | Colonial-ethnographic framing needs an editorial note. |
| 18 | **Superstitions of the Highlands & Islands of Scotland** | John Gregorson Campbell · d. 1891 ✓ | 1900 | PG 61730 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1962 | 71.2 | Codex Mythologica (Gaelic); pairs with British Goblins |  |
| 19 | **The Golden Maiden and Other Folk Tales and Fairy Stories Told in Armenia** | A. G. Seklemian · d. 1920 | 1898 | PG 46944 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 71.1 | World Myths (Armenian); regional pairing with Turkish/Georgi | Small corpus. |
| 20 | **Legends of Old Honolulu / Hawaiian Legends of Volcanoes** | W. D. Westervelt · d. 1939 | 1915/1916 | PG 66547 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2010 | 70.9 | Codex Mythologica (Polynesian — a current gap) | Native Hawaiian material: the cultural-consultation rule should be considered here too. |
| 21 | **The Mabinogion (Lady Charlotte Guest translation)** | anonymous · d. 1895 ✓ | 1849 | PG 5160 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1966 | 70.9 | Codex Mythologica (Welsh); pairs with British Goblins | Guest's Victorian English is heavy going; competing modern translations dominate. |
| 22 | **The Folk-Tales of the Magyars** | Kriza, Erdélyi, Pap, Benedek · d. 1931 ✓ | 1889 | PG 42981 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 70.8 | World Myths (Hungarian); pairs with the Turkish volume | Multiple contributors; the editor's dates are NOT FOUND — check before Gate 2. |
| 23 | **The Curiosities of Heraldry** | Mark Antony Lower · d. 1876 ✓ | 1845 | PG 38951 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1947 | 70.6 | Codex Bestiarium | Anecdotal rather than systematic. |
| 24 | **Foster's Complete Hoyle** | R. F. Foster · d. 1945 | 1897 | PG 53881 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2016 | 70.5 | World Games vol. 2 | Same as above: source, not edition. |
| 25 | **Myths and Myth-Makers** | John Fiske · d. 1901 | 1872 | PG 1061 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1972 | 70.5 | Codex Mythologica (comparative apparatus) | Comparative-mythology theory now superseded. |
| 26 | **A Primer of Mayan Hieroglyphics / The Ancient Phonetic Alphabet of Yucatan** | Daniel G. Brinton · d. 1899 | 1894/1870 | PG 57540 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1970 | 70.4 | Valice Script | Short and technical. |
| 27 | **Old-World Japan: Legends of the Land of the Gods** | Frank Rinder · d. 1945/1954 ✓ | 1895 | PG 46863 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 2016; plates cleared 1 Jan 2025 | 70.2 | Codex Mythologica (Japan) | **Illustrations usable** — Robinson's plates cleared on 1 Jan 2025. A GREEN Japanese alternative to the blocked Hadland Davis. |
| 28 | **Printers' Marks: A Chapter in the History of Typography** | W. Roberts · d. 1940 | 1893 | PG 25663 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2011 | 70.0 | Valice Script | Specialist; strong visual. |
| 29 | **Heraldry for Craftsmen & Designers** | W. H. St. John Hope · d. 1919 ✓ | 1913 | PG 45181 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 70.0 | Codex; design line | Practitioner manual. |
| 30 | **On the Nature of Things (William Ellery Leonard translation)** | Lucretius · d. 1944 ✓ | 1916 | PG 785 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2015 | 69.7 | Valice Classics (Epicurean counterpoint to the Stoics) | The pool listed Leonard's death year as an assumption; PG confirms it. |
| 31 | **The Popular Religion and Folk-Lore of Northern India (2 vols)** | William Crooke · d. 1923 ✓ | 1896 | PG 43681 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1994 | 69.6 | Codex Mythologica; World Myths (South Asia) | Two dense volumes of colonial ethnography; framing note required. |
| 32 | **The Natural History of Pliny (Bostock & Riley)** | Pliny the Elder · d. 1846/1878 ✓ | 1855 | PG 57493 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 69.4 | Codex Bestiarium (Books VIII–XI, animals) | Six volumes; only a tight animal-books selection is feasible. |
| 33 | **The Magic of the Horse-shoe, with Other Folk-lore Notes** | Robert Means Lawrence · d. 1935 ✓ | 1898 | PG 57411 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2006 | 69.4 | Codex (superstition/charms) |  |
| 34 | **Curious Facts in the History of Insects** | Frank Cowan · d. 1905 ✓ | 1865 | PG 41625 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1976 | 69.1 | Codex Bestiarium (invertebrates — an unworked corner) | Anecdotal Victorian compilation. |
| 35 | **The Folk-lore of the Isle of Man** | A. W. Moore · d. 1909 ✓ | 1891 | PG 77469 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1980 | 68.6 | Codex Mythologica (Manx — genuinely under-served) | Small corpus; pair with the Welsh and Gaelic volumes. |
| 36 | **Folk-Lore of West and Mid-Wales** | Jonathan Ceredig Davies · d. 1932 ✓ | 1911 | PG 53915 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2003 | 68.6 | Codex Mythologica (Welsh); companion to British Goblins |  |
| 37 | **'Gombo Zhèbes': Little Dictionary of Creole Proverbs** | Lafcadio Hearn · d. 1904 | 1885 | PG 44866 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1975 | 68.3 | Hearn set (with Kwaidan, Kotto) | Very short; only viable inside a Hearn collection. |
| 38 | **Comparative Studies in Nursery Rhymes** | Lina Eckenstein · d. 1931 ✓ | 1906 | PG 40457 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 68.3 | World Games (singing/counting games); Gomme companion | Scholarly rather than popular. |
| 39 | **Proverbs of All Nations / Proverb Lore** | Walter K. Kelly; F. Edward Hulme · d. 1867/1909 ✓ | 1859/1902 | PG 63190 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 68.2 | weak — no current Valice series fits | No natural home in the catalog. |
| 40 | **Kalevala: The Land of the Heroes (W. F. Kirby translation)** | Elias Lönnrot · d. 1912 ✓ | 1907 | PG 25953 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1983 | 68.2 | Codex Mythologica (Finnish) | Two volumes of verse; Standard Ebooks offers the Crawford translation CC0 as an alternative. |
| 41 | **A Little Book of Filipino Riddles** | Frederick Starr (ed.) · d. 1933 | 1909 | PG 14358 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2004 | 68.1 | Codex Enigmatica; World Myths (SE Asia) | Short; needs pairing. |

---

## 12. Tier C — Interesting but Weaker or Harder

Clear on rights, but weak on differentiation, catalog fit, or production economics. Several are extremely well known — that is precisely why they score badly (§7).

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Strange Survivals: Some Chapters in the History of Man** | S. Baring-Gould · d. 1924 ✓ | 1892 | PG 52024 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 67.9 | Codex; the Baring-Gould set (with Were-Wolves, Curious Myths | Third Baring-Gould title — good for a single-author collection. |
| 2 | **Current Superstitions** | Fanny D. Bergen (ed.) · d. 1924 ✓ | 1896 | PG 28841 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 67.5 | Codex (superstition) | List-form; needs restructuring. |
| 3 | **Astronomical Myths** | Camille Flammarion & J. F. Blake · d. 1925/1906 ✓ | 1877 | PG 36495 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1996 | 67.2 | Codex Mythologica (star lore) | Adaptation rather than translation. |
| 4 | **Manual of Egyptian Archaeology** | G. Maspero · d. 1916/1892 ✓ | 1895 | PG 14400 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 66.1 | Codex Mythologica (Egypt) | Dated archaeology. |
| 5 | **Kaffir Folk-lore** | George McCall Theal · d. 1919 ✓ | 1882 | PG 71335 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 66.0 | World Myths (southern Africa) | The title is a racial slur in modern usage and cannot be reproduced as-is; the collection also needs Xhosa-language review. |
| 6 | **Guernsey Folk Lore** | Sir Edgar MacCulloch · d. 1896 ✓ | 1903 | PG 52834 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1967 | 65.9 | Codex Mythologica (Channel Islands) | Very niche. |
| 7 | **Mathematical Essays and Recreations** | Hermann Schubert · d. 1911/1932 ✓ | 1898 | PG 25387 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 65.8 | Codex Enigmatica | Short and technical; a supporting source rather than an edition. |
| 8 | **Chess in Iceland and in Icelandic Literature** | Willard Fiske · d. 1904 | 1905 | IA `chessinicelandin00fiskuoft` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1975 | 65.2 | World Games; Norse line | Very niche. |
| 9 | **A History of Sumer and Akkad / Legends of Babylon and Egypt** | L. W. King · d. 1919 | 1910/1918 | PG 49345 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 64.4 | Codex Mythologica (Mesopotamia) | Superseded scholarship. |
| 10 | **Traditions, Superstitions and Folk-lore (chiefly Lancashire)** | Charles Hardwick · d. 1889 ✓ | 1872 | PG 39934 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1960 | 64.4 | Codex Mythologica (English regional) |  |
| 11 | **Ghost Stories of an Antiquary** | M. R. James · d. 1936 | 1904 | PG 8486 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 64.0 | no current Valice ghost line | 61,805 downloads/30d — huge demand, but an extremely crowded market and weak catalog fit. |
| 12 | **A Manual of Historic Ornament** | Richard Glazier · d. 1918 | 1899 | PG 53373 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1989 | 63.2 | weak to current series; cheaper alternative to Owen Jones | No Valice design line exists to receive it. |
| 13 | **The Sacred Dance: A Study in Comparative Folklore** | W. O. E. Oesterley · d. 1950 ✓ | 1923 | PG 71153 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2021 | 63.0 | weak series fit | Academic. |
| 14 | **Primitive Culture (2 vols)** | Edward B. Tylor · d. 1917 | 1871 | PG 70458 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1988 | 62.3 | weak — foundational anthropology, not a Valice product | Two dense theoretical volumes; scholarly, not trade. |
| 15 | **A Manual of the Art of Bookbinding** | James B. Nicholson · d. 1901 ✓ | 1856 | PG 55056 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1972 | 62.2 | weak — but methodologically interesting for a publisher | No line receives it. |
| 16 | **A History of Mourning** | Richard Davey · d. 1915 ✓ | 1889 | PG 44379 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1986 | 62.0 | weak series fit | Trade-published promotional volume; short. |
| 17 | **The History of Silhouettes** | Emily Jackson · d. 1947 ✓ | 1911 | PG 69273 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2018 | 61.8 | weak series fit; strong visual | No Valice line receives it. |
| 18 | **The Blue Fairy Book** | Andrew Lang · d. 1912 | 1889 | PG 503 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1983 | 61.2 | young-reader line | **The most saturated corner in public-domain publishing.** Free everywhere, hundreds of editions. |
| 19 | **English Fairy Tales / More English Fairy Tales** | Joseph Jacobs · d. 1916 | 1890 | PG 26460 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 60.8 | young-reader line | Same saturation problem as Lang. |
| 20 | **The Fables of Aesop (Joseph Jacobs)** | Aesop / Joseph Jacobs · d. 1916 ✓ | 1894 | PG 28 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 59.9 | young-reader line | Saturated beyond rescue. |
| 21 | **Household Tales (Margaret Hunt translation)** | J. & W. Grimm · d. 1912 ✓ | 1884 | PG 5314 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1983 | 59.8 | young-reader line | Saturated. |
| 22 | **The Ideal Book, or Book Beautiful** | T. J. Cobden-Sanderson · d. 1922 ✓ | 1900 | PG 72320 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1993 | 59.3 | weak series fit | Very short essay. |

---

## 13. Hold / Rights Uncertain

Nothing here may enter production. Four causes, kept distinct because they need different work to resolve:

1. **Missing death year** — resolvable by a records search (national library authority file, probate index, obituary).
2. **Blocked by a known date** — nothing to research; the date is verified and the market is simply closed until it passes.
3. **Cultural consultation required** — legally clear, ethically gated. Resolvable only by consultation, never by a document.
4. **Source unusable or contested** — the rights may be fine but no clean source exists, or two sources disagree.

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Picture-Writing of the American Indians** | Garrick Mallery · d. 1894 ✓ | 1893 | PG 54653 | **GREEN** | US: pre-1931 → PD; US Government work · EU/UK/TR: life+70 expired 1965 | 80.3 | Valice Script (non-alphabetic writing); Codex | **Cultural consultation is a precondition**, on the same rule the existing plan applies to Culin's *Games of the North American Indians*. Legal PD sta… |
| 2 | **Myths of the Cherokee** | James Mooney · d. 1921 ✓ | 1900 | PG 45634 | **GREEN** | US: pre-1931 → PD; US Government (BAE) publication · EU/UK/TR: life+70 expired 1992 | 78.2 | Codex Mythologica (a North American gap in the current 19 ci | **Cultural gate.** The Cherokee Nation is a living government with an active cultural-preservation office. The existing Valice rule (applied to Culin'… |
| 3 | **Games of the North American Indians** | Stewart Culin · d. 1929 | 1907 | IA `gamesofnorthamer00culirich` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2000 | 78.1 | World Games; Culin set | 846 pages. **Cultural consultation is a precondition** — the existing plan puts this title last deliberately, and that decision stands. |
| 4 | **Puzzles and Curious Problems** | Henry Ernest Dudeney · d. 1930 ✓ | 1931 — CONTESTED, see notes | IA `in.ernet.dli.2015.219121` | **YELLOW** | US: DISPUTED — 1931 (blocked to 1 Jan 2027) vs 1929 (already PD) · EU/UK/TR: GREEN (author d.1930) | 71.5 | The Puzzles of Henry Dudeney vol. 2 | **Date conflict found in this pass.** The pool records first publication as 1931 (→ US PD on 1 Jan 2027). The Internet Archive item's date field says … |
| 5 | **Dragons and Dragon Lore** | Ernest Ingersoll · d. 1946 ✓ | 1928 | IA `dragonsdragonlor0000erne` | **YELLOW** | US: 1928 → PD (VERIFIED) · EU/UK/TR: cleared 2017 (author d.1946) | 70.3 | Codex Bestiarium (dragons) | **Identifier now confirmed to exist — but it is not usable.** The only IA copy found is a *Singing Tree Press* reprint in the `internetarchivebooks` l… |
| 6 | **Indian Games: An Historical Research** | Andrew McFarland Davis · d. 1920 | 1885 | PG 6857 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 69.7 | World Games | Short; North American Indigenous games — the **cultural consultation rule applies**, as for Culin. |
| 7 | **The Myths of the New World** | Daniel G. Brinton · d. 1899 | 1868 | PG 19347 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1970 | 69.0 | Codex Mythologica (Americas) | Indigenous material + dated theory; consultation ADVISED. |
| 8 | **Manual for the Solution of Military Ciphers** | Parker Hitt · d. NOT FOUND | 1916 | PG 48871 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 68.1 | Codex Enigmatica (cipher section) | Death year unresolved. If Hitt died after 1955 the EU/UK/TR block could run decades — do not assume. |
| 9 | **Myths & Legends of Japan** | F. Hadland Davis · d. 1956 ✓ | 1912 | PG 45723 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: **BLOCKED to 1 Jan 2027** (author d.1956); plates blocked to 2034 (Ev | 67.4 | Codex Mythologica (Japan) | The pool marked the death year 'UNVERIFIED'. It is now verified as **1956** — one year too late. Blocked in EU/UK/TR until 1 Jan 2027. |
| 10 | **Seneca Myths and Folk Tales / Seneca Fiction, Legends and Myths** | Arthur C. Parker; Jeremiah Curtin & J. N · d. 1955/1906/1937 ✓ | 1923/1918 | PG 61477 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: latest cleared 1 Jan 2026 | 67.3 | Codex Mythologica (Haudenosaunee) | Haudenosaunee material — **cultural consultation applies**, as for Mooney and Culin. |
| 11 | **Chinese Ghouls and Goblins** | G. Willoughby-Meade · d. NOT FOUND | 1928 | IA `chinese-ghouls-and-goblins` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 67.0 | Codex Bestiarium (Chinese creatures) | Death year unresolved AND the source is a **user upload** (IA collection 'opensource'), not a library scan. |
| 12 | **Seneca: Ad Lucilium Epistulae Morales (Richard M. Gummere, Loeb)** | Seneca · d. NOT FOUND | 1917–1925 | IA `adluciliumepistu02sene` | **YELLOW** | US: 1917–1925 → PD (VERIFIED) · EU/UK/TR: **UNVERIFIED — translator's death year unknown** | 66.9 | Stoic Library | **This is the single most consequential correction in the revalidation.** The existing pool records 'Gummere d.1919 → cleared 1990' as GREEN. 1919 is … |
| 13 | **The Folk-lore of Plants / Plant Lore, Legends and Lyrics** | T. F. Thiselton-Dyer; Richard Folkard · d. 1923 ✓ (+1 NOT FOUND) | 1889/1884 | PG 10118 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: one author's dates NOT FOUND | 65.9 | Field Book; no herbal line exists yet | Folkard's dates unresolved; Thiselton-Dyer alone is GREEN. |
| 14 | **The Panchatantra (Arthur W. Ryder translation)** | Vishnu Sharma (attrib.) · d. 1938 ✓ | 1925 | IA `panchatantra035159mbp` | **YELLOW** | US: 1925 → PD (VERIFIED) · EU/UK/TR: translator's death year NOT VERIFIED in this pass | 65.9 | Codex; World Myths (South Asia) | Identifier now confirmed (1925, universallibrary collection). Ryder's death year still rests on the pool's secondary-source claim. |
| 15 | **The Myth of Hiawatha, and Other Oral Legends** | Henry Rowe Schoolcraft · d. 1864 ✓ | 1856 | PG 21620 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1935 | 65.8 | Codex Mythologica (Anishinaabe) | Indigenous material — **cultural consultation applies**. Schoolcraft's editorial reshaping is also historically contested. |
| 16 | **A Book of Giants** | Henry Wysham Lanier · d. NOT FOUND | 1922 | PG 48763 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 65.1 | Codex Bestiarium (giants) | Death year unresolved. |
| 17 | **Japanese Fairy Tales (Grace James)** | Grace James · d. NOT FOUND | 1912 | PG 35853 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND; plates cleared 2014 | 64.9 | Codex Mythologica (Japan); young-reader line | Goble's plates are cleared and excellent; the author's dates are not recorded. |
| 18 | **The Magician's Own Book** | George Arnold & Frank Cahill · d. 1865 ✓ (+1 NOT FOUND) | 1857 | PG 60687 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: one author's dates NOT FOUND | 64.8 | Codex Enigmatica; Hoffmann set | Co-author's dates unresolved. |
| 19 | **Conundrums, Riddles and Puzzles / The Book of Riddles / The Handbook of Co** | Dean Rivers; Anonymous; Edith B. Ordway · d. 1944 ✓ (+1 NOT FOUND) | 1900s | PG 52598 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: mixed — one author's dates NOT FOUND | 63.4 | Codex Enigmatica (riddle section) | Thin, repetitive Victorian riddle books; filler at best. |
| 20 | **The Game of Go: The National Game of Japan** | Arthur Smith · d. NOT FOUND | 1908 | PG 66632 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 62.4 | World Games (Go chapter) | Death year unresolved. |
| 21 | **On American Lot-games, as Evidence of Asiatic Intercourse before the Time ** | Edward Burnett Tylor · d. NOT FOUND | 1896 | IA `onamericanlotga00tylogoog` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND in the fetched record | 62.3 | World Games; Culin set | 29 pages — a paper, not a book. Also touches Indigenous material. |
| 22 | **Cossack Fairy Tales and Folk Tales** | R. Nisbet Bain (translator) · d. 1909 ✓ | 1894 | PG 29672 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: text GREEN, **plates blocked to 1 Jan 2027** (Noel L. Nisbet d.1956) | 60.9 | World Myths (Slavic) | **Newly identified illustration trap.** The pool listed this as GREEN with no illustrator recorded. |
| 23 | **The Book of Christmas** | Thomas K. Hervey · d. NOT FOUND | 1836 | PG 42622 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND; illustrator cleared 1907 | 60.9 | Codex (calendar custom) | Author's dates unresolved despite an 1836 publication. |
| 24 | **Hindu Gods and Heroes** | Lionel D. Barnett · d. 1960 ✓ | 1922 | PG 22885 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: **BLOCKED to 1 Jan 2031** (author d.1960) | 60.0 | Codex Mythologica (Hindu) | Newly discovered and immediately blocked outside the US. Use Mackenzie's *Indian Myth and Legend* instead — verified GREEN with usable Goble plates. |
| 25 | **An Illustrated Dictionary of Words used in Art and Archaeology** | John W. Mollett · d. NOT FOUND | 1883 | PG 67629 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 59.9 | reference shelf; weak series fit | Death year unresolved. |
| 26 | **Kojiki (Basil Hall Chamberlain translation)** | anonymous · d. 1935 | 1882 | NOT FOUND | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: UNVERIFIED | 59.6 | Codex Mythologica (Japan) | Searched Internet Archive; results were modern editions, unrelated media and a Japanese commentary. **No usable public-domain scan identified.** |
| 27 | **The Illustrated Key to the Tarot** | L. W. De Laurence · d. 1936/1951 ✓ | 1918 | PG 43548 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: cleared 2022 (latest death 1951) | 59.6 | weak to current series | **Provenance problem, not a date problem.** This is De Laurence's notorious unauthorised reissue of A. E. Waite's *Pictorial Key to the Tarot*. The da… |
| 28 | **Witchcraft and Superstitious Record in the South-Western District of Scotl** | J. Maxwell Wood · d. NOT FOUND | 1911 | PG 43966 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND | 59.2 | Codex (witchcraft) | Author's dates unresolved. |
| 29 | **Ancient Calendars and Constellations** | Emmeline M. Plunket · d. NOT FOUND | 1903 | PG 70052 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 58.7 | Codex Mythologica (astronomical myth) | Death year unresolved; theories superseded. |
| 30 | **Archaic England** | Harold Bayley · d. NOT FOUND | 1919 | PG 41785 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 55.6 | weak series fit | Bayley's etymological method is pseudo-scholarship; would need heavy framing. |
| 31 | **Storyology: Essays in Folk-Lore, Sea-Lore and Plant-Lore** | Benjamin Taylor · d. NOT FOUND | 1900 | PG 29921 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 55.6 | Codex | Death year unresolved. |
| 32 | **The Romance of Excavation** | David Masters · d. 1965 ✓ | 1923 | PG 70981 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: **BLOCKED to 1 Jan 2036** | 54.5 | Field Book (archaeology) | Blocked outside the US for a decade. |
| 33 | **A Wonder Book and Tanglewood Tales** | Nathaniel Hawthorne · d. 1864 ✓ | 1852 | PG 35377 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: text GREEN, **plates blocked to 1 Jan 2037** (Maxfield Parrish d.1966) | 54.3 | young-reader line | **Newly identified illustration trap, and a costly one.** The pool listed this GREEN with no illustrator. The plates are Maxfield Parrish's — among th… |
| 34 | **Folk-Lore and Legends: Oriental / Scotland / North American Indian** | various (anonymous editor) · d. NOT FOUND | 1889–1890 | PG 35334 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: editor unidentified; death year NOT FOUND | 53.7 | World Myths | Anonymous compilations with no identifiable editor — provenance too thin for a rights row. |

---

## 14. Rejected

Two kinds of entry. The first three are **traps**: modern editions that sit next to the public-domain original in search results and would be catastrophic to use by mistake. They are recorded here so the mistake cannot be made quietly. The rest are candidates whose rights genuinely bar commercial use.

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **The Prose Edda (Arthur Gilchrist Brodeur translation)** | Snorri Sturluson · d. 1971 | 1916 | IA `proseedda01brodgoog` | **RED** | US: 1916 → PD (VERIFIED) · EU/UK/TR: **IN COPYRIGHT to 2042** | 53.5 | Codex Mythologica (Norse) | Translator's copyright runs to 2042 in every life+70 market Valice sells into. The Anderson translation (PG 18947) is the GREEN substitute and is alre… |
| 2 | **Persian Tales (D. L. R. & E. O. Lorimer)** | D. L. R. & E. O. Lorimer · d. 1962 | 1919 | NOT FOUND | **RED** | US: 1919 → PD · EU/UK/TR: **IN COPYRIGHT to 2033** | 49.6 | World Myths (Persian) | Blocked outside the US until 2033, and no verified source identifier exists. |
| 3 | **Mathematical Recreations and Essays — Coxeter revisions (1939+)** | W. W. Rouse Ball & H. S. M. Coxeter · d. 2003 | 1939–1974 | — | **RED** | IN COPYRIGHT worldwide | 43.2 | — | Listed explicitly as a trap: the 1905 4th edition is PD, later Coxeter revisions are not. Confusing them is an easy and expensive mistake. |
| 4 | **Games ancient and oriental — 1961 reprints** | Edward Falkener (reprint) · d. NOT FOUND | 1961 | — | **RED** | IN COPYRIGHT (reprint edition) | 38.2 | — | **Confirmed trap.** Three separate 1961 reprint scans sit alongside the 1892 original in Internet Archive search results. Only `gamesancientorie00falk… |
| 5 | **Traditional Games — 1964 Dover reprint** | Alice Bertha Gomme (reprint) · d. NOT FOUND | 1964 | — | **RED** | IN COPYRIGHT (reprint apparatus) | 38.0 | — | Same trap pattern: the 1964 Dover reprint carries new apparatus. Use PG 41727/41728 (1894/1898). |

---

## 15. Top 25

Ranked by composite score across every non-rejected candidate. Tier is shown honestly: a HOLD entry can rank high and still be unusable, and saying so is the point of the column.

| # | Title | Author | Year | Category | Rights | Primary source | Score | Tier | Strongest commercial reason | Largest risk |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **The Canterbury Puzzles + Amusements in Mathematics** | Henry Ernest Dudeney | 1907 / 1917 | Puzzle / Mathematics | **GREEN** | [PG 27635](https://www.gutenberg.org/ebooks/27635) · [PG 16713](https://www.gutenberg.org/ebooks/16713) | **87.5** | TIER S | Included for completeness as the revalidation benchmark — this is what a fully cleared, fully produced candidate looks like. | None outstanding on rights. |
| 2 | **Puzzles Old and New** | Professor Hoffmann (Angelo J | 1893 | Puzzle / Mathematics; Game | **GREEN** | [IA puzzlesoldnew00hoff](https://archive.org/details/puzzlesoldnew00hoff) | **86.8** | TIER S | A 400-page illustrated corpus of mechanical puzzles nobody has re-engineered. Every puzzle wants a redrawn diagram — which clears the KDP ≥10-original-illustration b… | Production weight: several hundred engravings need redrawing, and Victorian solution prose needs rewriting. This is a 200h+ book, not a 60h one. |
| 3 | **Myths and Legends of China** | E. T. C. Werner | 1922 | Mythology; Folklore | **GREEN** | [PG 15250](https://www.gutenberg.org/ebooks/15250) | **86.5** | TIER S | Highest verified demand in the mythology lane, and the life+70 clock has only just expired (Jan 2025) — competitors working from older rights guidance may still beli… | Free-edition pressure is real. Needs glossary, pinyin normalisation, source notes and original art to justify $12.99. |
| 4 | **Korean Games, with Notes on the Corresponding Games of China** | Stewart Culin | 1895 | Games; Anthropology; Langu | **GREEN** | [IA koreangameswith00culigoog](https://archive.org/details/koreangameswith00culigoog) | **86.1** | TIER S | Uniquely Valice: the existing Korean-language audience and the existing games audience buy the same book. Boards and pieces all want redrawing. | Cultural-accuracy obligation on Korean material (romanisation, terminology) — needs a Korean-reading check, which the Founder can supply. |
| 5 | **The Traditional Games of England, Scotland, and Ireland (2 v** | Alice Bertha Gomme | 1894 (vol 1) / 1898 (vol 2) | Games; Folklore; Children' | **GREEN** | [PG 41727](https://www.gutenberg.org/ebooks/41727) · [IA traditionalgames02gomm_0](https://archive.org/details/traditionalgames02gomm_0) · [PG 41728](https://www.gutenberg.org/ebooks/41728) | **85.8** | TIER S | 800 pages of games recorded from living informants, with rhymes, tunes and regional variants. Valice's World Games format (modernised rules + redrawn boards) is exac… | Alphabetical dictionary structure and dialect transcription need heavy editorial restructuring into playable rules. Two volumes → selection is mandato… |
| 6 | **Games Ancient and Oriental and How to Play Them** | Edward Falkener | 1892 | Games; History; Archaeolog | **GREEN** | [IA gamesancientorie00falkuoft](https://archive.org/details/gamesancientorie00falkuoft) | **85.7** | TIER S | Reconstructed ancient games with boards that must be redrawn to be playable — differentiation is structural, not cosmetic. | Falkener's reconstructions are Victorian conjecture; presenting them as settled fact would be a claim failure. Needs explicit 'reconstruction, not evi… |
| 7 | **The Alphabet: An Account of the Origin and Development of Le** | Isaac Taylor | 1883 (1899 rev. ed.) | Language; History; Referen | **GREEN** | [IA alphabetaccounto01tayluoft](https://archive.org/details/alphabetaccounto01tayluoft) | **84.2** | TIER S | Turns Valice's two script workbooks into 'Valice Script'. Every script table is a redrawing job → differentiation is automatic and visual. | Taylor's 1883 comparative philology is superseded in places (esp. on Semitic origins); publishing it without correcting apparatus would breach the no-… |
| 8 | **Mythical Monsters** | Charles Gould | 1886 | Mythology; Nature; Referen | **GREEN** | [PG 40972](https://www.gutenberg.org/ebooks/40972) | **83.9** | TIER S | A companion or source volume for a Valice book already on sale, with a built-in editorial hook: Gould's cryptozoological argument is wrong in an interesting, documen… | Gould argues dragons were real surviving animals. Publishing without correcting apparatus would put a false claim in a Valice book — the apparatus is … |
| 9 | **The Fairy Mythology: Illustrative of the Romance and Superst** | Thomas Keightley | 1828 (1850 rev. ed.) | Folklore; Mythology; Refer | **GREEN** | [PG 41006](https://www.gutenberg.org/ebooks/41006) | **83.8** | TIER S | A ready-made comparative structure (by country) that maps directly onto the Codex format Valice already ships. | Long, and the 1828 and 1850 texts differ — the edition used must be stated and held to. |
| 10 | **Seneca: Minor Dialogues and On Benefits (Aubrey Stewart tran** | Lucius Annaeus Seneca | c. 65 CE (translation 1889/1900) | Philosophy; Classics | **GREEN** | [PG 64576](https://www.gutenberg.org/ebooks/64576) · [PG 3794](https://www.gutenberg.org/ebooks/3794) · [Standard Ebooks](https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart) | **83.3** | TIER S | **This entry exists because the old pool's Seneca source failed revalidation.** The existing CSV recorded the Loeb/Gummere translation as GREEN on a death year of 19… | Stewart's 1889 prose is more Victorian than Gummere's; readability work is real editorial labour. |
| 11 | **A Selection from the Discourses of Epictetus with the Enchei** | Epictetus | c. 108 CE (translation 1877) | Philosophy; Classics | **GREEN** | [PG 10661](https://www.gutenberg.org/ebooks/10661) · [Standard Ebooks](https://standardebooks.org/ebooks/epictetus/discourses/george-long) | **83.1** | TIER S | Translator continuity with the live Meditations is a real editorial asset: one voice across the Stoic Library. | Crowded market; only the bundle and the apparatus justify the price. |
| 12 | **Kwaidan: Stories and Studies of Strange Things** | Lafcadio Hearn | 1904 | Folklore; Classics | **GREEN** | [PG 1210](https://www.gutenberg.org/ebooks/1210) · [IA kwaidanstoriesst00hearuoft](https://archive.org/details/kwaidanstoriesst00hearuoft) | **83.0** | TIER S | Already-planned title; the yōkai field-guide apparatus is the differentiator. | Crowded; plates unusable. |
| 13 | **Fictitious & Symbolic Creatures in Art, with Special Referen** | John Vinycomb | 1906 | Art; Mythology; Reference; | **YELLOW** | [PG 40825](https://www.gutenberg.org/ebooks/40825) · [IA fictitioussymbol00vinyuoft](https://archive.org/details/fictitioussymbol00vinyuoft) | **82.9** | TIER B | The closest public-domain ancestor to a Valice product that already exists and sells. Excellent visual density and a natural companion volume. | **Rights, not commerce.** One missing death year blocks EU/UK/TR. Resolve via a UK probate/obituary or a national library authority record before Gate… |
| 14 | **Indian Myth and Legend** | Donald A. Mackenzie | 1913 | Mythology; Folklore | **GREEN** | [PG 47228](https://www.gutenberg.org/ebooks/47228) · [IA indianmythlegend00mack](https://archive.org/details/indianmythlegend00mack) | **82.4** | TIER S | **Rare case: the illustrations are usable.** Goble is a first-rank golden-age illustrator whose plates are cleared worldwide — most candidates in this catalog need o… | Mackenzie's Edwardian racial framing (Aryan migration theory) is pervasive and needs an editorial statement, not silent deletion. |
| 15 | **Ancient Legends, Mystic Charms & Superstitions of Ireland** | Lady Wilde ('Speranza') | 1887 | Folklore; Mythology | **GREEN** | [PG 61436](https://www.gutenberg.org/ebooks/61436) | **82.2** | TIER S | The byline is the differentiator: 'collected by Oscar Wilde's mother' is a real hook that the Yeats/Gregory competition cannot claim. | Crowded corner; the charms/cures material needs a clear 'historical record, not medical advice' note. |
| 16 | **Chess and Playing Cards** | Stewart Culin | 1898 | Games; Anthropology; Histo | **GREEN** | [IA chessplayingcard00culi](https://archive.org/details/chessplayingcard00culi) | **81.9** | TIER A | Completes a three-book Culin set that no publisher has ever assembled as a modern reading edition. | Museum-catalogue structure (object lists) reads badly as a trade book without heavy restructuring. |
| 17 | **Sea Monsters Unmasked, and Sea Fables Explained** | Henry Lee | 1883/1884 | Nature; Mythology; History | **GREEN** | [PG 36677](https://www.gutenberg.org/ebooks/36677) | **81.3** | TIER A | Short, cheap, and it creates a genuinely original Valice product: Gould's credulity and Lee's scepticism bound together with modern apparatus. | Too short to stand alone in print; must be paired. |
| 18 | **Modern Magic: A Practical Treatise on the Art of Conjuring** | Professor Hoffmann (Angelo J | 1876 | Games; Education; Referenc | **GREEN** | [PG 58057](https://www.gutenberg.org/ebooks/58057) | **80.7** | TIER A | Hoffmann gives Valice a second strong title from one verified-clear author — the cheapest kind of series to build. | Victorian apparatus (many tricks need equipment nobody has) limits practical usefulness; selection is essential. |
| 19 | **The History of Four-Footed Beasts and Serpents** | Edward Topsell | 1607 (1658 ed.) | Bestiary; Nature; History | **GREEN** | [IA historyoffourfoo00tops](https://archive.org/details/historyoffourfoo00tops) | **80.4** | TIER A | Highest visual score in the catalog. Modern-spelling transcription is a real, defensible product: nobody sells a readable Topsell. | **Production is the blocker, not rights.** 1658 blackletter/early-modern orthography defeats ABBYY 9; the existing OCR research prescribes Kraken with… |
| 20 | **Picture-Writing of the American Indians** | Garrick Mallery | 1893 | Language; Anthropology; Ar | **GREEN** | [PG 54653](https://www.gutenberg.org/ebooks/54653) | **80.3** | HOLD | Extraordinary visual potential — thousands of glyphs, ready-made for a designed reference. | **Cultural consultation is a precondition**, on the same rule the existing plan applies to Culin's *Games of the North American Indians*. Legal PD sta… |
| 21 | **The Complete Herbal** | Nicholas Culpeper | 1653 | Nature; Reference; History | **GREEN** | [PG 49513](https://www.gutenberg.org/ebooks/49513) | **80.2** | TIER A | Demand is unambiguous and measured. If Valice ever opens a nature/field lane, this is its anchor. | **Safety framing is mandatory.** Culpeper prescribes treatments; a modern edition must be unambiguously historical. Also a crowded market and weak fit… |
| 22 | **The Grammar of Ornament** | Owen Jones | 1856 (1868 ed.) | Art; Reference; Design | **GREEN** | [IA grammarofornamen00joneuoft](https://archive.org/details/grammarofornamen00joneuoft) | **79.6** | TIER A | Unmatched visual asset if colour print economics can be made to work. | **Colour plate reproduction is the whole product.** KDP colour printing at this quality is costly and the incumbents are strong. Listed for completene… |
| 23 | **Twentieth Century Standard Puzzle Book** | A. Cyril Pearson (ed.) | 1907 | Puzzle / Mathematics | **GREEN** | [PG 63884](https://www.gutenberg.org/ebooks/63884) | **79.6** | TIER A | NOT FOUND | Three-part compilation; heavy selection needed to avoid a shapeless book. |
| 24 | **Meditations (George Long translation)** | Marcus Aurelius | 1862 | Philosophy | **GREEN** | [PG 15877](https://www.gutenberg.org/ebooks/15877) | **79.2** | TIER A | NOT FOUND | Already published and, by the existing plan's own assessment, **below the differentiation standard**. The upgrade is the action, not acquisition. |
| 25 | **British Goblins: Welsh Folk-lore, Fairy Mythology, Legends a** | Wirt Sikes | 1880 | Folklore; Mythology | **GREEN** | [PG 34704](https://www.gutenberg.org/ebooks/34704) | **79.1** | TIER A | **Usable illustrations** — a rarity in this catalog — plus an under-served national folklore. | Welsh-language orthography needs care. |

---

## 16. Top 50

Positions 26–50 continue the same ranking. Same minimum data.

| # | Title | Author (death) | Year | Category | Rights | Identifiers | Score | Tier | Adjacency |
|---|---|---|---|---|---|---|---|---|---|
| 1 | The Canterbury Puzzles + Amusements in Mathematics | Henry Ernest Dudeney · d. 1930 ✓ | 1907 / 1917 | Puzzle / Mathematics | **GREEN** | PG 27635 · PG 16713 (Amusements in Mathematics) | **87.5** | TIER S | Codex Enigmatica; the puzzle lane generally |
| 2 | Puzzles Old and New | Professor Hoffmann (Angelo Joh · d. 1919 ✓ | 1893 | Puzzle / Mathematics; Ga | **GREEN** | IA `puzzlesoldnew00hoff` | **86.8** | TIER S | Codex Enigmatica (direct); The Great Book of W |
| 3 | Myths and Legends of China | E. T. C. Werner · d. 1954 ✓ | 1922 | Mythology; Folklore | **GREEN** | PG 15250 | **86.5** | TIER S | Codex Mythologica (Chinese entries); The Great |
| 4 | Korean Games, with Notes on the Corresponding Games of China a | Stewart Culin · d. 1929 ✓ | 1895 | Games; Anthropology; Lan | **GREEN** | IA `koreangameswith00culigoog` | **86.1** | TIER S | THE bridge title: joins the Hangul line to The |
| 5 | The Traditional Games of England, Scotland, and Ireland (2 vol | Alice Bertha Gomme · d. 1938 ✓ | 1894 (vol 1) / 1898 (vol 2) | Games; Folklore; Childre | **GREEN** | PG 41727 · IA `traditionalgames02gomm_0` · PG 41728 (vol 2) | **85.8** | TIER S | The Great Book of World Games (direct — the Br |
| 6 | Games Ancient and Oriental and How to Play Them | Edward Falkener · d. 1896 ✓ | 1892 | Games; History; Archaeol | **GREEN** | IA `gamesancientorie00falkuoft` | **85.7** | TIER S | The Great Book of World Games (Batch 1 title) |
| 7 | The Alphabet: An Account of the Origin and Development of Lett | Isaac Taylor · d. 1901 ✓ | 1883 (1899 rev. ed.) | Language; History; Refer | **GREEN** | IA `alphabetaccounto01tayluoft` · historyofalphabe02tayluoft (vol 2, 1899) | **84.2** | TIER S | Hangul Handwriting Workbook, Greek Alphabet Wo |
| 8 | Mythical Monsters | Charles Gould · d. 1893 ✓ | 1886 | Mythology; Nature; Refer | **GREEN** | PG 40972 | **83.9** | TIER S | Codex Bestiarium (direct) |
| 9 | The Fairy Mythology: Illustrative of the Romance and Superstit | Thomas Keightley · d. 1872 ✓ | 1828 (1850 rev. ed.) | Folklore; Mythology; Ref | **GREEN** | PG 41006 | **83.8** | TIER S | Codex Mythologica; Codex Bestiarium (the non-m |
| 10 | Seneca: Minor Dialogues and On Benefits (Aubrey Stewart transl | Lucius Annaeus Seneca · d. NOT FOUND | c. 65 CE (translation 1889/1900) | Philosophy; Classics | **GREEN** | PG 64576 · PG 3794 (On Benefits) | **83.3** | TIER S | Meditations (live product); Epictetus; 'The St |
| 11 | A Selection from the Discourses of Epictetus with the Encheiri | Epictetus · d. NOT FOUND | c. 108 CE (translation 1877) | Philosophy; Classics | **GREEN** | PG 10661 | **83.1** | TIER S | Meditations (live, same translator); Seneca; ' |
| 12 | Kwaidan: Stories and Studies of Strange Things | Lafcadio Hearn · d. 1904 ✓ | 1904 | Folklore; Classics | **GREEN** | PG 1210 · IA `kwaidanstoriesst00hearuoft` | **83.0** | TIER S | Codex Bestiarium (yōkai field guide); Hearn's  |
| 13 | Fictitious & Symbolic Creatures in Art, with Special Reference | John Vinycomb · d. NOT FOUND | 1906 | Art; Mythology; Referenc | **YELLOW** | PG 40825 · IA `fictitioussymbol00vinyuoft` | **82.9** | TIER B | Codex Bestiarium (direct — griffin, wyvern, co |
| 14 | Indian Myth and Legend | Donald A. Mackenzie · d. 1936 ✓ | 1913 | Mythology; Folklore | **GREEN** | PG 47228 · IA `indianmythlegend00mack` | **82.4** | TIER S | Codex Mythologica (Vedic/Hindu entries — a gap |
| 15 | Ancient Legends, Mystic Charms & Superstitions of Ireland | Lady Wilde ('Speranza') · d. 1896 ✓ | 1887 | Folklore; Mythology | **GREEN** | PG 61436 | **82.2** | TIER S | Codex Mythologica (Celtic); The Great Book of  |
| 16 | Chess and Playing Cards | Stewart Culin · d. 1929 ✓ | 1898 | Games; Anthropology; His | **GREEN** | IA `chessplayingcard00culi` | **81.9** | TIER A | World Games vol. 3; pairs with Korean Games an |
| 17 | Sea Monsters Unmasked, and Sea Fables Explained | Henry Lee · d. 1888 ✓ | 1883/1884 | Nature; Mythology; Histo | **GREEN** | PG 36677 | **81.3** | TIER A | Codex Bestiarium; pairs directly against Mythi |
| 18 | Modern Magic: A Practical Treatise on the Art of Conjuring | Professor Hoffmann (Angelo Joh · d. 1919 ✓ | 1876 | Games; Education; Refere | **GREEN** | PG 58057 | **80.7** | TIER A | Codex Enigmatica; pairs with *Puzzles Old and  |
| 19 | The History of Four-Footed Beasts and Serpents | Edward Topsell · d. 1625 ✓ | 1607 (1658 ed.) | Bestiary; Nature; Histor | **GREEN** | IA `historyoffourfoo00tops` | **80.4** | TIER A | Codex Bestiarium (direct ancestor) |
| 20 | Picture-Writing of the American Indians | Garrick Mallery · d. 1894 ✓ | 1893 | Language; Anthropology;  | **GREEN** | PG 54653 | **80.3** | HOLD | Valice Script (non-alphabetic writing); Codex |
| 21 | The Complete Herbal | Nicholas Culpeper · d. 1654 ✓ | 1653 | Nature; Reference; Histo | **GREEN** | PG 49513 | **80.2** | TIER A | Weak to current Valice series (no herbal/natur |
| 22 | The Grammar of Ornament | Owen Jones · d. 1874 ✓ | 1856 (1868 ed.) | Art; Reference; Design | **GREEN** | IA `grammarofornamen00joneuoft` | **79.6** | TIER A | Weak to current Valice series; would open a ne |
| 23 | Twentieth Century Standard Puzzle Book | A. Cyril Pearson (ed.) · d. 1916 | 1907 | Puzzle / Mathematics | **GREEN** | PG 63884 | **79.6** | TIER A | Codex Enigmatica |
| 24 | Meditations (George Long translation) | Marcus Aurelius · d. 1879 ✓ | 1862 | Philosophy | **GREEN** | PG 15877 | **79.2** | TIER A | Valice Classics — ALREADY LIVE at $9.99 |
| 25 | British Goblins: Welsh Folk-lore, Fairy Mythology, Legends and | Wirt Sikes · d. 1883 ✓ | 1880 | Folklore; Mythology | **GREEN** | PG 34704 | **79.1** | TIER A | Codex Bestiarium (Welsh creatures); Codex Myth |
| 26 | Mancala, the National Game of Africa | Stewart Culin · d. 1929 ✓ | 1896 | Games; Anthropology | **GREEN** | PG 66220 · IA `mancalanationalg00culi` | **78.9** | TIER A | World Games African chapter; Culin collection |
| 27 | A Complete Guide to Heraldry | Arthur Charles Fox-Davies · d. 1928 ✓ | 1909 | Reference; Art; History | **YELLOW** | PG 41617 | **78.9** | TIER B | Codex Bestiarium (heraldic beasts overlap dire |
| 28 | Hero-Myths & Legends of the British Race | M. I. Ebbutt · d. 1934 ✓ | 1910 | Mythology; Folklore | **GREEN** | PG 25502 | **78.3** | TIER A | Codex (a Heroica volume does not exist yet — t |
| 29 | Myths of the Cherokee | James Mooney · d. 1921 ✓ | 1900 | Mythology; Anthropology; | **GREEN** | PG 45634 | **78.2** | HOLD | Codex Mythologica (a North American gap in the |
| 30 | Myths of the Norsemen: From the Eddas and Sagas | H. A. Guerber · d. 1929 | 1908 | Mythology | **GREEN** | PG 28497 | **78.2** | TIER A | Codex Mythologica (Norse); World Myths |
| 31 | Games of the North American Indians | Stewart Culin · d. 1929 | 1907 | Games; Anthropology | **GREEN** | IA `gamesofnorthamer00culirich` | **78.1** | HOLD | World Games; Culin set |
| 32 | Récréations mathématiques (4 vols) | Édouard Lucas · d. 1891 ✓ | 1882–1894 | Puzzle / Mathematics | **GREEN** | IA `recretionmatedou03lucarich` | **78.0** | TIER A | Codex Enigmatica; The Puzzles of Henry Dudeney |
| 33 | The Enchiridion (Thomas Wentworth Higginson translation) | Epictetus · d. 1911 ✓ | 1865 | Philosophy | **GREEN** | PG 45109 | **77.5** | TIER A | Valice Classics; Stoic Library bundle |
| 34 | The Book of Were-Wolves | Sabine Baring-Gould · d. 1924 | 1865 | Folklore; Bestiary | **GREEN** | PG 5324 | **77.4** | TIER A | Codex Bestiarium (shape-changers) |
| 35 | The Handbook to English Heraldry | Charles Boutell · d. 1877 ✓ | 1863 | Reference; Art | **GREEN** | PG 23186 | **77.4** | TIER A | Codex Bestiarium (heraldic beasts) |
| 36 | Myths & Legends of the Celtic Race | T. W. Rolleston · d. 1920 | 1911 | Mythology | **GREEN** | PG 34081 | **77.1** | TIER A | Codex Mythologica (Celtic) |
| 37 | Myths of China and Japan | Donald A. Mackenzie · d. 1936 | 1923 | Mythology | **GREEN** | PG 67344 | **76.8** | TIER A | Codex Mythologica; Werner companion |
| 38 | The Younger Edda (Rasmus B. Anderson translation) | Snorri Sturluson · d. 1936 ✓ | 1880 | Mythology | **GREEN** | PG 18947 | **76.6** | TIER A | Codex Mythologica (Norse) |
| 39 | Curious Myths of the Middle Ages | Sabine Baring-Gould · d. 1924 | 1866 | Folklore; Mythology | **GREEN** | PG 36127 | **76.6** | TIER A | Codex Bestiarium/Heroica (Wandering Jew, Prest |
| 40 | Korean Folk Tales: Imps, Ghosts and Fairies (Gale translation) | Im Bang & Yi Ryuk · d. 1937 ✓ | 1913 | Folklore | **GREEN** | PG 51002 | **76.6** | TIER A | Hangul line ↔ Codex Bestiarium (Korean creatur |
| 41 | Myths and Legends of Ancient Egypt / Myths & Legends of Babylo | Lewis Spence · d. 1955 ✓ | 1915 / 1916 | Mythology | **YELLOW** | PG 43662 · PG 45137 (Babylonia & Assyria) | **76.4** | TIER B | Codex Mythologica (Egyptian and Mesopotamian e |
| 42 | Sam Loyd's Cyclopedia of 5000 Puzzles, Tricks and Conundrums | Sam Loyd (comp. Sam Loyd Jr.) · d. 1911 ✓ (+1 NOT FOUND) | 1914 | Puzzle / Mathematics | **YELLOW** | IA `CyclopediaOfPuzzlesLoyd` | **76.4** | TIER B | Codex Enigmatica; Dudeney reader |
| 43 | Myths of Babylonia and Assyria | Donald A. Mackenzie · d. 1936 | 1915 | Mythology | **GREEN** | PG 16653 | **76.4** | TIER A | Codex Mythologica (Mesopotamia) |
| 44 | The Story of the Alphabet | Edward Clodd · d. 1930 | 1900 | Language; History | **GREEN** | PG 46388 | **76.3** | TIER A | Valice Script (with Taylor); Hangul + Greek wo |
| 45 | An Introduction to the Study of the Maya Hieroglyphs | Sylvanus Griswold Morley · d. 1948 | 1915 | Language; Archaeology | **GREEN** | PG 43491 | **75.9** | TIER A | Valice Script (non-alphabetic writing) |
| 46 | Mathematical Recreations and Essays (4th ed.) | W. W. Rouse Ball · d. 1925 | 1905 | Puzzle / Mathematics | **GREEN** | PG 26839 | **75.7** | TIER A | Codex Enigmatica; Dudeney/Loyd set |
| 47 | The Poetic Edda (Henry Adams Bellows translation) | anonymous · d. 1939 ✓ | 1923 | Mythology | **GREEN** | PG 73533 | **75.6** | TIER A | Codex Mythologica (Norse) |
| 48 | Turkish Fairy Tales and Folk Tales | Ignácz Kúnos · d. 1945/1909 ✓ | 1896 | Folklore | **GREEN** | PG 64807 | **75.4** | TIER A | World Myths; the Founder's own cultural ground |
| 49 | Birds in Legend, Fable and Folklore | Ernest Ingersoll · d. 1946 | 1923 | Folklore; Nature | **GREEN** | PG 59598 | **75.1** | TIER A | Codex Bestiarium (avian) |
| 50 | The Evolution of the Dragon | Grafton Elliot Smith · d. 1937 | 1919 | Mythology; Bestiary | **GREEN** | PG 22038 | **74.9** | TIER B | Codex Bestiarium (dragons) |

---

## 17. Top 10 Valice Press Opportunities

These are the strongest **production** candidates, not merely the highest scores. The filter is deliberate: GREEN on every layer, Tier S or A, no cultural gate, no unresolved source, and not already shipping. A candidate that scores well but cannot be produced is not an opportunity — and neither is a book Valice already sells.

Every entry below carries evidence links.

### 1. Puzzles Old and New

- **Author / dates:** Professor Hoffmann (Angelo John Lewis) — 1919 (VERIFIED — IA creator authority: 'Hoffmann, Professor, 1839-1919')
- **Year:** 1893 · **Category:** Puzzle / Mathematics; Games; Reference
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 1990
- **Source:** Internet Archive: puzzlesoldnew00hoff (Boston Public Library scan, 418 images)
- **Evidence:** [IA puzzlesoldnew00hoff](https://archive.org/details/puzzlesoldnew00hoff)
- **Score / tier:** **86.8 · TIER S**
- **Valice adjacency:** Codex Enigmatica (direct); The Great Book of World Games (mechanical/dexterity puzzles)
- **Why this one:** A 400-page illustrated corpus of mechanical puzzles nobody has re-engineered. Every puzzle wants a redrawn diagram — which clears the KDP ≥10-original-illustration bar as a by-product.
- **Largest risk:** Production weight: several hundred engravings need redrawing, and Victorian solution prose needs rewriting. This is a 200h+ book, not a 60h one.
- **Direction:** Selected 'best 120' with redrawn diagrams, modern solution notes, difficulty ratings, and a materials appendix. Direct-first at $12.99; paperback follows.

### 2. Myths and Legends of China

- **Author / dates:** E. T. C. Werner — 1954 (VERIFIED — PG authority: 'Werner, E. T. C. (Edward Theodore Chalmers), 1864-1954')
- **Year:** 1922 · **Category:** Mythology; Folklore
- **Rights:** **GREEN** — US: 1922 → PD · EU/UK/TR: life+70 expired 1 Jan 2025 (VERIFIED from death year 1954)
- **Source:** Project Gutenberg 15250 (VERIFIED, 6,808 downloads/30d — highest of any mythology candidate in this pass)
- **Evidence:** [PG 15250](https://www.gutenberg.org/ebooks/15250)
- **Verified demand:** 6,808 downloads / 30 days
- **Score / tier:** **86.5 · TIER S**
- **Valice adjacency:** Codex Mythologica (Chinese entries); The Great Book of World Myths
- **Why this one:** Highest verified demand in the mythology lane, and the life+70 clock has only just expired (Jan 2025) — competitors working from older rights guidance may still believe it is encumbered.
- **Largest risk:** Free-edition pressure is real. Needs glossary, pinyin normalisation, source notes and original art to justify $12.99.
- **Direction:** Confirmed Batch 2 flagship: glossary, character-name normalisation, source notes, original illustration, Codex cross-references.

### 3. Korean Games, with Notes on the Corresponding Games of China and Japan

- **Author / dates:** Stewart Culin — 1929 (VERIFIED — IA creator authority: 'Culin, Stewart, 1858-1929')
- **Year:** 1895 · **Category:** Games; Anthropology; Language / Culture
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 2000
- **Source:** Internet Archive: koreangameswith00culigoog — possible-copyright-status NOT_IN_COPYRIGHT (VERIFIED)
- **Evidence:** [IA koreangameswith00culigoog](https://archive.org/details/koreangameswith00culigoog)
- **Score / tier:** **86.1 · TIER S**
- **Valice adjacency:** THE bridge title: joins the Hangul line to The Great Book of World Games. No other candidate connects two live Valice series.
- **Why this one:** Uniquely Valice: the existing Korean-language audience and the existing games audience buy the same book. Boards and pieces all want redrawing.
- **Largest risk:** Cultural-accuracy obligation on Korean material (romanisation, terminology) — needs a Korean-reading check, which the Founder can supply.
- **Direction:** 'Korean Games': ~60 games, modernised rules, redrawn boards, hangul + revised-romanisation terms, cross-referenced to China/Japan variants. Direct-first $12.99.

### 4. The Traditional Games of England, Scotland, and Ireland (2 vols)

- **Author / dates:** Alice Bertha Gomme — 1938 (VERIFIED — PG authority: 'Gomme, Alice Bertha, 1853-1938')
- **Year:** 1894 (vol 1) / 1898 (vol 2) · **Category:** Games; Folklore; Children's; Reference
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 2009
- **Source:** Project Gutenberg 41727 (vol 1) and 41728 (vol 2)
- **Evidence:** [PG 41727](https://www.gutenberg.org/ebooks/41727) · [IA traditionalgames02gomm_0](https://archive.org/details/traditionalgames02gomm_0) · [PG 41728](https://www.gutenberg.org/ebooks/41728)
- **Verified demand:** 1,520 downloads / 30 days
- **Score / tier:** **85.8 · TIER S**
- **Valice adjacency:** The Great Book of World Games (direct — the British/Irish chapter Valice does not yet have); Codex; young-reader line
- **Why this one:** 800 pages of games recorded from living informants, with rhymes, tunes and regional variants. Valice's World Games format (modernised rules + redrawn boards) is exactly the missing product.
- **Largest risk:** Alphabetical dictionary structure and dialect transcription need heavy editorial restructuring into playable rules. Two volumes → selection is mandatory.
- **Direction:** 'The Traditional Games of the British Isles': ~90 playable games, modernised rules, redrawn diagrams, tunes retypeset, regional-variant notes. Direct + paperback.

### 5. Games Ancient and Oriental and How to Play Them

- **Author / dates:** Edward Falkener — 1896 (VERIFIED — IA creator authority: 'Falkener, Edward, 1814-1896')
- **Year:** 1892 · **Category:** Games; History; Archaeology
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 1967
- **Source:** Internet Archive: gamesancientorie00falkuoft — NOT_IN_COPYRIGHT (VERIFIED), 412 images
- **Evidence:** [IA gamesancientorie00falkuoft](https://archive.org/details/gamesancientorie00falkuoft)
- **Score / tier:** **85.7 · TIER S**
- **Valice adjacency:** The Great Book of World Games (Batch 1 title)
- **Why this one:** Reconstructed ancient games with boards that must be redrawn to be playable — differentiation is structural, not cosmetic.
- **Largest risk:** Falkener's reconstructions are Victorian conjecture; presenting them as settled fact would be a claim failure. Needs explicit 'reconstruction, not evidence' framing.
- **Direction:** Confirmed Batch 1 scope: redrawn boards, modernised rules, scholarly caveats on each reconstruction.

### 6. The Alphabet: An Account of the Origin and Development of Letters (2 vols)

- **Author / dates:** Isaac Taylor — 1901 (VERIFIED — IA creator authority: 'Taylor, Isaac, 1829-1901')
- **Year:** 1883 (1899 rev. ed.) · **Category:** Language; History; Reference; Art
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 1972
- **Source:** Internet Archive: alphabetaccounto01tayluoft (1883) — NOT_IN_COPYRIGHT (VERIFIED), 434 images
- **Evidence:** [IA alphabetaccounto01tayluoft](https://archive.org/details/alphabetaccounto01tayluoft)
- **Score / tier:** **84.2 · TIER S**
- **Valice adjacency:** Hangul Handwriting Workbook, Greek Alphabet Workbook — converts two isolated workbooks into a series with a flagship
- **Why this one:** Turns Valice's two script workbooks into 'Valice Script'. Every script table is a redrawing job → differentiation is automatic and visual.
- **Largest risk:** Taylor's 1883 comparative philology is superseded in places (esp. on Semitic origins); publishing it without correcting apparatus would breach the no-invented-facts standard in the other direction — repeating disproven claims.
- **Direction:** Heavily apparatus-led: re-set script tables, a modern 'what we now know' sidebar per chapter, and a chronology. Direct-first; print viable at 6×9.

### 7. Mythical Monsters

- **Author / dates:** Charles Gould — 1893 (VERIFIED — PG authority: 'Gould, Charles, 1834-1893')
- **Year:** 1886 · **Category:** Mythology; Nature; Reference
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 1964
- **Source:** Project Gutenberg 40972 (VERIFIED, 1,227 downloads/30d)
- **Evidence:** [PG 40972](https://www.gutenberg.org/ebooks/40972)
- **Verified demand:** 1,227 downloads / 30 days
- **Score / tier:** **83.9 · TIER S**
- **Valice adjacency:** Codex Bestiarium (direct)
- **Why this one:** A companion or source volume for a Valice book already on sale, with a built-in editorial hook: Gould's cryptozoological argument is wrong in an interesting, documentable way.
- **Largest risk:** Gould argues dragons were real surviving animals. Publishing without correcting apparatus would put a false claim in a Valice book — the apparatus is mandatory, not optional.
- **Direction:** Annotated edition: Gould's text plus a 'what he got wrong and why it mattered' apparatus. Direct-first.

### 8. The Fairy Mythology: Illustrative of the Romance and Superstition of Various Countries

- **Author / dates:** Thomas Keightley — 1872 (VERIFIED — PG authority: 'Keightley, Thomas, 1789-1872')
- **Year:** 1828 (1850 rev. ed.) · **Category:** Folklore; Mythology; Reference
- **Rights:** **GREEN** — US: pre-1931 → PD · EU/UK/TR: life+70 expired 1943
- **Source:** Project Gutenberg 41006 (VERIFIED, 2,173 downloads/30d)
- **Evidence:** [PG 41006](https://www.gutenberg.org/ebooks/41006)
- **Verified demand:** 2,173 downloads / 30 days
- **Score / tier:** **83.8 · TIER S**
- **Valice adjacency:** Codex Mythologica; Codex Bestiarium (the non-monstrous supernatural); The Great Book of World Myths
- **Why this one:** A ready-made comparative structure (by country) that maps directly onto the Codex format Valice already ships.
- **Largest risk:** Long, and the 1828 and 1850 texts differ — the edition used must be stated and held to.
- **Direction:** Codex-format reissue: country chapters, cross-referenced creature index, redrawn map. Strong bundle partner for Codex Mythologica.

### 9. Seneca: Minor Dialogues and On Benefits (Aubrey Stewart translation)

- **Author / dates:** Lucius Annaeus Seneca — 65 CE
- **Year:** c. 65 CE (translation 1889/1900) · **Category:** Philosophy; Classics
- **Rights:** **GREEN** — US: translation pre-1931 → PD · EU/UK/TR: translator died 1918 → life+70 expired 1989
- **Source:** Project Gutenberg 64576 (Minor Dialogues) and 3794 (On Benefits) — both VERIFIED
- **Evidence:** [PG 64576](https://www.gutenberg.org/ebooks/64576) · [PG 3794](https://www.gutenberg.org/ebooks/3794) · [Standard Ebooks](https://standardebooks.org/ebooks/seneca/dialogues/aubrey-stewart)
- **Verified demand:** 3,529 downloads / 30 days
- **Score / tier:** **83.3 · TIER S**
- **Valice adjacency:** Meditations (live product); Epictetus; 'The Stoic Library' bundle
- **Why this one:** **This entry exists because the old pool's Seneca source failed revalidation.** The existing CSV recorded the Loeb/Gummere translation as GREEN on a death year of 1919 — which is the volume's publication year, not a death year. Gummere's authority record reads '1883- ' (born 1883, death not recorded), so the Loeb text cannot be cleared for EU/UK/TR on the evidence held. Stewart (d. 1918) is a fully verified GREEN substitute, and Standard Ebooks already publishes it CC0.
- **Largest risk:** Stewart's 1889 prose is more Victorian than Gummere's; readability work is real editorial labour.
- **Direction:** 'Seneca: Selected Dialogues' — On Anger, On the Shortness of Life, On Tranquillity, plus selections from On Benefits. Light modernisation, notes, chronology. Anchors the Stoic Library bundle.

### 10. A Selection from the Discourses of Epictetus with the Encheiridion (George Long translation)

- **Author / dates:** Epictetus — c. 135 CE
- **Year:** c. 108 CE (translation 1877) · **Category:** Philosophy; Classics
- **Rights:** **GREEN** — US: translation pre-1931 → PD · EU/UK/TR: translator died 1879 → life+70 long expired
- **Source:** Project Gutenberg 10661 (VERIFIED, 4,783 downloads/30d)
- **Evidence:** [PG 10661](https://www.gutenberg.org/ebooks/10661) · [Standard Ebooks](https://standardebooks.org/ebooks/epictetus/discourses/george-long)
- **Verified demand:** 4,783 downloads / 30 days
- **Score / tier:** **83.1 · TIER S**
- **Valice adjacency:** Meditations (live, same translator); Seneca; 'The Stoic Library' bundle
- **Why this one:** Translator continuity with the live Meditations is a real editorial asset: one voice across the Stoic Library.
- **Largest risk:** Crowded market; only the bundle and the apparatus justify the price.
- **Direction:** 'Epictetus: Discourses & Enchiridion (Annotated)' in the Long voice, matching the Meditations edition. Bundle at $14.99.

---

## 18. Existing Candidate Pool — Revalidated

The existing `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` holds 94 rows. All 92 distinct Project
Gutenberg identifiers and all 18 Internet Archive identifiers in it were fetched and parsed
on 2026-09-03. **Every identifier resolved — there were no fabricated or dead identifiers in
the existing pool**, which is worth saying plainly, because it is the part that was done well.

What was not done well was the layer separation. The pool records a translator for some rows
and an illustrator for almost none, and several death years were carried as assumptions
marked `[A]` that turn out to be wrong rather than merely unproven.

### Rows whose status changed

| Candidate | Was | Now | What changed |
|---|---|---|---|
| Seneca, *Ad Lucilium Epistulae Morales* (Gummere) | GREEN | **HOLD** | Translator's recorded death year (1919) is the publication year of vol. 2; vol. 3 appeared 1925. Authority record gives `1883- ` — birth only. EU/UK/TR cannot be cleared. |
| Hawthorne, *A Wonder Book* | GREEN | **HOLD** | Illustrator not recorded in the pool. Is Maxfield Parrish (d. 1966) — plates blocked in EU/UK/TR to 2037. |
| Spence, *Myths of Ancient Egypt* / *Babylonia* | not in pool | **Tier B (YELLOW)** | Newly discovered, and immediately flagged: Evelyn Paul plates (d. 1963) blocked to 2034. |
| *Cossack Fairy Tales* | GREEN | **HOLD** | Illustrator not recorded. Noel L. Nisbet (d. 1956) — plates blocked to 1 Jan 2027. |
| Davis, *Myths & Legends of Japan* | YELLOW (death year unknown) | **HOLD (resolved to blocked)** | Death year resolved to 1956 — EU/UK/TR clears 1 Jan 2027. Illustrator Evelyn Paul blocks plates to 2034. |
| Epictetus, *The Enchiridion* (PG 45109) | GREEN, 'George Long' | **GREEN, corrected attribution** | PG 45109 is the Higginson translation (d. 1911). Long's Enchiridion is in PG 10661. |
| *The Golden Sayings of Epictetus* | GREEN, Crossley d. 1914 | **GREEN, corrected datum** | Crossley died 1926, not 1914. |
| Loyd, *Cyclopedia of 5000 Puzzles* | GREEN | **Tier B (YELLOW)** | Source is an `opensource; community` user upload with a self-applied PD Mark, not a library scan. Compiler's death year unverified. |
| Dudeney, *Puzzles and Curious Problems* | YELLOW (US PD in 2027) | **HOLD (contested date)** | IA item's date field says 1929, not 1931. Not resolved in the convenient direction. |
| Ingersoll, *Dragons and Dragon Lore* | YELLOW, 'identifier not confirmed' | **HOLD (identifier found, source unusable)** | `dragonsdragonlor0000erne` exists but is a Singing Tree Press reprint in the lending collection. |
| Ryder, *Panchatantra* | GREEN, 'identifier not confirmed' | **HOLD (identifier resolved)** | `panchatantra035159mbp` (1925) confirmed. Translator's death year still unverified. |
| Mackenzie, *Indian Myth and Legend* | listed as unverified in the plan | **Tier S (GREEN)** | `indianmythlegend00mack` NOT_IN_COPYRIGHT confirmed; PG 47228 confirmed; Goble plates (d. 1943) usable. |
| Chamberlain, *Kojiki* | GREEN, 'identifier not confirmed' | **HOLD (still unresolved)** | No clean public-domain scan located. Status unchanged after searching. |
| Brodeur, *Prose Edda* | YELLOW | **REJECTED** | Confirmed: in copyright in EU/UK/TR to 2042. Anderson (PG 18947) is the substitute. |
| Murray, *A History of Chess* | GREEN (2026) | **Tier B, confirmed** | Murray d. 1955 → cleared 1 Jan 2026. Note the `historyofchess0000hjrm` copy is lending-only; use `AHistoryOfChessHJRMurray`. |

### Rows confirmed unchanged

The remaining revalidated rows were confirmed as recorded. Notably, every one of these
had its author or translator death year read from a primary authority record and matched:
Dudeney (1930), Falkener (1896), Culin (1929), Hearn (1904), Werner (1954), Gould (1893),
Long (1879), Anderson (1936), Bellows (1939), Gale (1937), Guerber (1929), Rolleston (1920),
Baring-Gould (1924), Mackenzie (1936), Spence (1955), Topsell (1625?), Jacobs (1916),
Lang (1912), Hunt (1912), Guest/Schreiber (1895), Kirby (1912), Leonard (1944), James (1931).

One apparent discrepancy resolved in the pool's favour: PG credits the *Mabinogion*
translator as "Schreiber, Charlotte, Lady, 1812-1895" — Lady Charlotte Guest's remarried
name. Same person; the pool's attribution is correct.

### Full revalidated set

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Korean Games, with Notes on the Corresponding Games of China and Japan** | Stewart Culin · d. 1929 ✓ | 1895 | IA `koreangameswith00culigoog` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2000 | 86.1 | THE bridge title: joins the Hangul line to The Great Book of | Cultural-accuracy obligation on Korean material (romanisation, terminology) — needs a Korean-reading check, which the Founder can supply. |
| 2 | **Games Ancient and Oriental and How to Play Them** | Edward Falkener · d. 1896 ✓ | 1892 | IA `gamesancientorie00falkuoft` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1967 | 85.7 | The Great Book of World Games (Batch 1 title) | Falkener's reconstructions are Victorian conjecture; presenting them as settled fact would be a claim failure. Needs explicit 'reconstruction, not evi… |
| 3 | **Mythical Monsters** | Charles Gould · d. 1893 ✓ | 1886 | PG 40972 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1964 | 83.9 | Codex Bestiarium (direct) | Gould argues dragons were real surviving animals. Publishing without correcting apparatus would put a false claim in a Valice book — the apparatus is … |
| 4 | **Myths and Legends of China** | E. T. C. Werner · d. 1954 ✓ | 1922 | PG 15250 | **GREEN** | US: 1922 → PD · EU/UK/TR: life+70 expired 1 Jan 2025 (VERIFIED from death year 1954) | 86.5 | Codex Mythologica (Chinese entries); The Great Book of World | Free-edition pressure is real. Needs glossary, pinyin normalisation, source notes and original art to justify $12.99. |
| 5 | **A Selection from the Discourses of Epictetus with the Encheiridion (George** | Epictetus · d. NOT FOUND | c. 108 CE (translation 1877) | PG 10661 | **GREEN** | US: translation pre-1931 → PD · EU/UK/TR: translator died 1879 → life+70 long expired | 83.1 | Meditations (live, same translator); Seneca; 'The Stoic Libr | Crowded market; only the bundle and the apparatus justify the price. |
| 6 | **The Canterbury Puzzles + Amusements in Mathematics** | Henry Ernest Dudeney · d. 1930 ✓ | 1907 / 1917 | PG 27635 · PG 16713 (Amusements in Mathematics) | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2001 | 87.5 | Codex Enigmatica; the puzzle lane generally | None outstanding on rights. |
| 7 | **The History of Four-Footed Beasts and Serpents** | Edward Topsell · d. 1625 ✓ | 1607 (1658 ed.) | IA `historyoffourfoo00tops` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 long expired | 80.4 | Codex Bestiarium (direct ancestor) | **Production is the blocker, not rights.** 1658 blackletter/early-modern orthography defeats ABBYY 9; the existing OCR research prescribes Kraken with… |
| 8 | **Kwaidan: Stories and Studies of Strange Things** | Lafcadio Hearn · d. 1904 ✓ | 1904 | PG 1210 · IA `kwaidanstoriesst00hearuoft` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1975 | 83.0 | Codex Bestiarium (yōkai field guide); Hearn's *Kotto* and *G | Crowded; plates unusable. |
| 9 | **Sam Loyd's Cyclopedia of 5000 Puzzles, Tricks and Conundrums** | Sam Loyd (comp. Sam Loyd Jr.) · d. 1911 ✓ (+1 NOT FOUND) | 1914 | IA `CyclopediaOfPuzzlesLoyd` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: compiler's death year UNVERIFIED | 76.4 | Codex Enigmatica; Dudeney reader | Source is a **user upload** (IA collection 'opensource; community') with a self-applied PD Mark, not a library scan — weaker evidence than the pool as… |
| 10 | **Mathematical Recreations and Essays (4th ed.)** | W. W. Rouse Ball · d. 1925 | 1905 | PG 26839 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1996 | 75.7 | Codex Enigmatica; Dudeney/Loyd set | **Edition trap:** Coxeter's revisions (1939+) are in copyright. Use the 4th edition (1905) only. |
| 11 | **Games of the North American Indians** | Stewart Culin · d. 1929 | 1907 | IA `gamesofnorthamer00culirich` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2000 | 78.1 | World Games; Culin set | 846 pages. **Cultural consultation is a precondition** — the existing plan puts this title last deliberately, and that decision stands. |
| 12 | **Hoyle's Games Modernized** | Professor Hoffmann (Angelo Lewis) · d. 1919 | 1909 | PG 39445 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 72.3 | World Games vol. 2 (cards/dice) | Rules reference, not a reading book; value is as source material, not as an edition. |
| 13 | **Foster's Complete Hoyle** | R. F. Foster · d. 1945 | 1897 | PG 53881 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2016 | 70.5 | World Games vol. 2 | Same as above: source, not edition. |
| 14 | **A History of Chess** | H. J. R. Murray · d. 1955 | 1913 | IA `AHistoryOfChessHJRMurray` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1 Jan 2026 — newly available | 71.4 | World Games (chess chapter) | 900 pages; only a selection is feasible. Note `historyofchess0000hjrm` is in `internetarchivebooks` (lending), not a free PD download — use the `AHist… |
| 15 | **Chess in Iceland and in Icelandic Literature** | Willard Fiske · d. 1904 | 1905 | IA `chessinicelandin00fiskuoft` | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1975 | 65.2 | World Games; Norse line | Very niche. |
| 16 | **Myths of the Norsemen: From the Eddas and Sagas** | H. A. Guerber · d. 1929 | 1908 | PG 28497 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2000 | 78.2 | Codex Mythologica (Norse); World Myths | Very crowded Norse corner. |
| 17 | **The Younger Edda (Rasmus B. Anderson translation)** | Snorri Sturluson · d. 1936 ✓ | 1880 | PG 18947 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2007 | 76.6 | Codex Mythologica (Norse) | Use Anderson, **not** Brodeur — see the REJECTED entry. |
| 18 | **The Poetic Edda (Henry Adams Bellows translation)** | anonymous · d. 1939 ✓ | 1923 | PG 73533 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2010 | 75.6 | Codex Mythologica (Norse) | Bellows' own notes are extensive — a Valice edition must add different apparatus, not duplicate his. |
| 19 | **Myths & Legends of the Celtic Race** | T. W. Rolleston · d. 1920 | 1911 | PG 34081 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 77.1 | Codex Mythologica (Celtic) | Crowded corner. |
| 20 | **Myths of Babylonia and Assyria** | Donald A. Mackenzie · d. 1936 | 1915 | PG 16653 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 76.4 | Codex Mythologica (Mesopotamia) | Overlaps Spence's Babylonia volume; Mackenzie is the GREEN choice because Spence's plates are blocked. |
| 21 | **Curious Myths of the Middle Ages** | Sabine Baring-Gould · d. 1924 | 1866 | PG 36127 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 76.6 | Codex Bestiarium/Heroica (Wandering Jew, Prester John, Tannh |  |
| 22 | **The Book of Were-Wolves** | Sabine Baring-Gould · d. 1924 | 1865 | PG 5324 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 77.4 | Codex Bestiarium (shape-changers) | Contains grim true-crime material needing an editorial note. |
| 23 | **Korean Folk Tales: Imps, Ghosts and Fairies (Gale translation)** | Im Bang & Yi Ryuk · d. 1937 ✓ | 1913 | PG 51002 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 2008 | 76.6 | Hangul line ↔ Codex Bestiarium (Korean creatures) | Short. |
| 24 | **Korean Fairy Tales** | William Elliot Griffis · d. 1928 | 1922 | PG 67180 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1999 | 73.2 | Hangul line | Griffis worked from secondary sources; accuracy caveats needed. |
| 25 | **Turkish Fairy Tales and Folk Tales** | Ignácz Kúnos · d. 1945/1909 ✓ | 1896 | PG 64807 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2016 | 75.4 | World Myths; the Founder's own cultural ground | Bain translated from Kúnos's Hungarian, not from Turkish — a two-step transmission to disclose. |
| 26 | **The Popol Vuh (Lewis Spence)** | Lewis Spence · d. 1955 | 1908 | PG 56550 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1 Jan 2026 | 73.0 | Codex Mythologica (Mesoamerica) | Spence's is a summary, not a translation of the Popol Vuh. |
| 27 | **Meditations (George Long translation)** | Marcus Aurelius · d. 1879 ✓ | 1862 | PG 15877 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared long ago | 79.2 | Valice Classics — ALREADY LIVE at $9.99 | Already published and, by the existing plan's own assessment, **below the differentiation standard**. The upgrade is the action, not acquisition. |
| 28 | **The Enchiridion (Thomas Wentworth Higginson translation)** | Epictetus · d. 1911 ✓ | 1865 | PG 45109 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1982 | 77.5 | Valice Classics; Stoic Library bundle | **Identifier correction:** the existing pool labels PG 45109 'George Long'. It is Higginson's translation. |
| 29 | **The Golden Sayings of Epictetus (Hastings Crossley translation)** | Epictetus · d. 1926 ✓ | 1903 | PG 871 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1997 | 72.4 | Stoic Library bundle | The pool recorded Crossley's death as 1914; the PG authority record says **1926**. Still GREEN, but the datum was wrong. |
| 30 | **The Consolation of Philosophy (H. R. James translation)** | Boethius · d. 1931 ✓ | 1897 | PG 14328 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 74.3 | Valice Classics | The pool marked James's death year as a secondary-source assumption; the PG authority record confirms 1931. |
| 31 | **On the Nature of Things (William Ellery Leonard translation)** | Lucretius · d. 1944 ✓ | 1916 | PG 785 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2015 | 69.7 | Valice Classics (Epicurean counterpoint to the Stoics) | The pool listed Leonard's death year as an assumption; PG confirms it. |
| 32 | **The Blue Fairy Book** | Andrew Lang · d. 1912 | 1889 | PG 503 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1983 | 61.2 | young-reader line | **The most saturated corner in public-domain publishing.** Free everywhere, hundreds of editions. |
| 33 | **English Fairy Tales / More English Fairy Tales** | Joseph Jacobs · d. 1916 | 1890 | PG 26460 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 60.8 | young-reader line | Same saturation problem as Lang. |
| 34 | **Household Tales (Margaret Hunt translation)** | J. & W. Grimm · d. 1912 ✓ | 1884 | PG 5314 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1983 | 59.8 | young-reader line | Saturated. |
| 35 | **The Fables of Aesop (Joseph Jacobs)** | Aesop / Joseph Jacobs · d. 1916 ✓ | 1894 | PG 28 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 59.9 | young-reader line | Saturated beyond rescue. |
| 36 | **The Mabinogion (Lady Charlotte Guest translation)** | anonymous · d. 1895 ✓ | 1849 | PG 5160 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1966 | 70.9 | Codex Mythologica (Welsh); pairs with British Goblins | Guest's Victorian English is heavy going; competing modern translations dominate. |
| 37 | **Kalevala: The Land of the Heroes (W. F. Kirby translation)** | Elias Lönnrot · d. 1912 ✓ | 1907 | PG 25953 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: translator cleared 1983 | 68.2 | Codex Mythologica (Finnish) | Two volumes of verse; Standard Ebooks offers the Crawford translation CC0 as an alternative. |
| 38 | **The Natural History of Pliny (Bostock & Riley)** | Pliny the Elder · d. 1846/1878 ✓ | 1855 | PG 57493 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 69.4 | Codex Bestiarium (Books VIII–XI, animals) | Six volumes; only a tight animal-books selection is feasible. |
| 39 | **Ghost Stories of an Antiquary** | M. R. James · d. 1936 | 1904 | PG 8486 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 64.0 | no current Valice ghost line | 61,805 downloads/30d — huge demand, but an extremely crowded market and weak catalog fit. |
| 40 | **Puzzles and Curious Problems** | Henry Ernest Dudeney · d. 1930 ✓ | 1931 — CONTESTED, see notes | IA `in.ernet.dli.2015.219121` | **YELLOW** | US: DISPUTED — 1931 (blocked to 1 Jan 2027) vs 1929 (already PD) · EU/UK/TR: GREEN (author d.1930) | 71.5 | The Puzzles of Henry Dudeney vol. 2 | **Date conflict found in this pass.** The pool records first publication as 1931 (→ US PD on 1 Jan 2027). The Internet Archive item's date field says … |
| 41 | **Chinese Ghouls and Goblins** | G. Willoughby-Meade · d. NOT FOUND | 1928 | IA `chinese-ghouls-and-goblins` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 67.0 | Codex Bestiarium (Chinese creatures) | Death year unresolved AND the source is a **user upload** (IA collection 'opensource'), not a library scan. |
| 42 | **Dragons and Dragon Lore** | Ernest Ingersoll · d. 1946 ✓ | 1928 | IA `dragonsdragonlor0000erne` | **YELLOW** | US: 1928 → PD (VERIFIED) · EU/UK/TR: cleared 2017 (author d.1946) | 70.3 | Codex Bestiarium (dragons) | **Identifier now confirmed to exist — but it is not usable.** The only IA copy found is a *Singing Tree Press* reprint in the `internetarchivebooks` l… |
| 43 | **The Panchatantra (Arthur W. Ryder translation)** | Vishnu Sharma (attrib.) · d. 1938 ✓ | 1925 | IA `panchatantra035159mbp` | **YELLOW** | US: 1925 → PD (VERIFIED) · EU/UK/TR: translator's death year NOT VERIFIED in this pass | 65.9 | Codex; World Myths (South Asia) | Identifier now confirmed (1925, universallibrary collection). Ryder's death year still rests on the pool's secondary-source claim. |
| 44 | **Kojiki (Basil Hall Chamberlain translation)** | anonymous · d. 1935 | 1882 | NOT FOUND | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: UNVERIFIED | 59.6 | Codex Mythologica (Japan) | Searched Internet Archive; results were modern editions, unrelated media and a Japanese commentary. **No usable public-domain scan identified.** |
| 45 | **Myths & Legends of Japan** | F. Hadland Davis · d. 1956 ✓ | 1912 | PG 45723 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: **BLOCKED to 1 Jan 2027** (author d.1956); plates blocked to 2034 (Ev | 67.4 | Codex Mythologica (Japan) | The pool marked the death year 'UNVERIFIED'. It is now verified as **1956** — one year too late. Blocked in EU/UK/TR until 1 Jan 2027. |
| 46 | **Cossack Fairy Tales and Folk Tales** | R. Nisbet Bain (translator) · d. 1909 ✓ | 1894 | PG 29672 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: text GREEN, **plates blocked to 1 Jan 2027** (Noel L. Nisbet d.1956) | 60.9 | World Myths (Slavic) | **Newly identified illustration trap.** The pool listed this as GREEN with no illustrator recorded. |
| 47 | **A Wonder Book and Tanglewood Tales** | Nathaniel Hawthorne · d. 1864 ✓ | 1852 | PG 35377 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: text GREEN, **plates blocked to 1 Jan 2037** (Maxfield Parrish d.1966) | 54.3 | young-reader line | **Newly identified illustration trap, and a costly one.** The pool listed this GREEN with no illustrator. The plates are Maxfield Parrish's — among th… |
| 48 | **The Game of Go: The National Game of Japan** | Arthur Smith · d. NOT FOUND | 1908 | PG 66632 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 62.4 | World Games (Go chapter) | Death year unresolved. |
| 49 | **Seneca: Ad Lucilium Epistulae Morales (Richard M. Gummere, Loeb)** | Seneca · d. NOT FOUND | 1917–1925 | IA `adluciliumepistu02sene` | **YELLOW** | US: 1917–1925 → PD (VERIFIED) · EU/UK/TR: **UNVERIFIED — translator's death year unknown** | 66.9 | Stoic Library | **This is the single most consequential correction in the revalidation.** The existing pool records 'Gummere d.1919 → cleared 1990' as GREEN. 1919 is … |
| 50 | **The Prose Edda (Arthur Gilchrist Brodeur translation)** | Snorri Sturluson · d. 1971 | 1916 | IA `proseedda01brodgoog` | **RED** | US: 1916 → PD (VERIFIED) · EU/UK/TR: **IN COPYRIGHT to 2042** | 53.5 | Codex Mythologica (Norse) | Translator's copyright runs to 2042 in every life+70 market Valice sells into. The Anderson translation (PG 18947) is the GREEN substitute and is alre… |
| 51 | **Persian Tales (D. L. R. & E. O. Lorimer)** | D. L. R. & E. O. Lorimer · d. 1962 | 1919 | NOT FOUND | **RED** | US: 1919 → PD · EU/UK/TR: **IN COPYRIGHT to 2033** | 49.6 | World Myths (Persian) | Blocked outside the US until 2033, and no verified source identifier exists. |

---

## 19. Newly Discovered Candidates

**90 candidates** not present in the existing pool. They came from three distinct discovery routes, and the route matters because it says where more would come from if this were run again:

- **Subject sweep of Project Gutenberg** (123 queries → 1,556 records → 329 relevant → 111 fully verified). Produced most of the folklore, heraldry, script and reference material.
- **Reverse adjacency from live Valice products** — asking, for each existing book, what sits next to it. Produced the Gomme, Culin and Hoffmann clusters, which are the most commercially useful finds in this pass.
- **Targeted Internet Archive title searches** for works Gutenberg does not hold. Produced *Puzzles Old and New*, *Chess and Playing Cards*, Taylor's *Alphabet*, the *Grammar of Ornament* and Lucas's *Récréations mathématiques*.

| # | Title | Author (death) | Year | Source ID | Rights | Jurisdiction | Score | Adjacency | Main risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Puzzles Old and New** | Professor Hoffmann (Angelo John Lewis) · d. 1919 ✓ | 1893 | IA `puzzlesoldnew00hoff` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1990 | 86.8 | Codex Enigmatica (direct); The Great Book of World Games (me | Production weight: several hundred engravings need redrawing, and Victorian solution prose needs rewriting. This is a 200h+ book, not a 60h one. |
| 2 | **The Traditional Games of England, Scotland, and Ireland (2 vols)** | Alice Bertha Gomme · d. 1938 ✓ | 1894 (vol 1) / 1898 (vol 2) | PG 41727 · IA `traditionalgames02gomm_0` · PG 41728 (vol 2) | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2009 | 85.8 | The Great Book of World Games (direct — the British/Irish ch | Alphabetical dictionary structure and dialect transcription need heavy editorial restructuring into playable rules. Two volumes → selection is mandato… |
| 3 | **Chess and Playing Cards** | Stewart Culin · d. 1929 ✓ | 1898 | IA `chessplayingcard00culi` | **GREEN** | US: pre-1931 → PD; US Government publication · EU/UK/TR: life+70 expired 2000 | 81.9 | World Games vol. 3; pairs with Korean Games and Mancala into | Museum-catalogue structure (object lists) reads badly as a trade book without heavy restructuring. |
| 4 | **Mancala, the National Game of Africa** | Stewart Culin · d. 1929 ✓ | 1896 | PG 66220 · IA `mancalanationalg00culi` | **GREEN** | US: pre-1931 → PD; US Government publication · EU/UK/TR: life+70 expired 2000 | 78.9 | World Games African chapter; Culin collection | 36 pages — cannot carry a standalone paid edition. Print economics do not work alone. |
| 5 | **The Alphabet: An Account of the Origin and Development of Letters (2 vols)** | Isaac Taylor · d. 1901 ✓ | 1883 (1899 rev. ed.) | IA `alphabetaccounto01tayluoft` · historyofalphabe02tayluoft (vol 2, 1899) | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1972 | 84.2 | Hangul Handwriting Workbook, Greek Alphabet Workbook — conve | Taylor's 1883 comparative philology is superseded in places (esp. on Semitic origins); publishing it without correcting apparatus would breach the no-… |
| 6 | **Picture-Writing of the American Indians** | Garrick Mallery · d. 1894 ✓ | 1893 | PG 54653 | **GREEN** | US: pre-1931 → PD; US Government work · EU/UK/TR: life+70 expired 1965 | 80.3 | Valice Script (non-alphabetic writing); Codex | **Cultural consultation is a precondition**, on the same rule the existing plan applies to Culin's *Games of the North American Indians*. Legal PD sta… |
| 7 | **Fictitious & Symbolic Creatures in Art, with Special Reference to Their Us** | John Vinycomb · d. NOT FOUND | 1906 | PG 40825 · IA `fictitioussymbol00vinyuoft` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — author death year NOT FOUND | 82.9 | Codex Bestiarium (direct — griffin, wyvern, cockatrice, unic | **Rights, not commerce.** One missing death year blocks EU/UK/TR. Resolve via a UK probate/obituary or a national library authority record before Gate… |
| 8 | **The Fairy Mythology: Illustrative of the Romance and Superstition of Vario** | Thomas Keightley · d. 1872 ✓ | 1828 (1850 rev. ed.) | PG 41006 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1943 | 83.8 | Codex Mythologica; Codex Bestiarium (the non-monstrous super | Long, and the 1828 and 1850 texts differ — the edition used must be stated and held to. |
| 9 | **Sea Monsters Unmasked, and Sea Fables Explained** | Henry Lee · d. 1888 ✓ | 1883/1884 | PG 36677 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1959 | 81.3 | Codex Bestiarium; pairs directly against Mythical Monsters a | Too short to stand alone in print; must be paired. |
| 10 | **Indian Myth and Legend** | Donald A. Mackenzie · d. 1936 ✓ | 1913 | PG 47228 · IA `indianmythlegend00mack` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2007 | 82.4 | Codex Mythologica (Vedic/Hindu entries — a gap in the curren | Mackenzie's Edwardian racial framing (Aryan migration theory) is pervasive and needs an editorial statement, not silent deletion. |
| 11 | **Ancient Legends, Mystic Charms & Superstitions of Ireland** | Lady Wilde ('Speranza') · d. 1896 ✓ | 1887 | PG 61436 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1967 | 82.2 | Codex Mythologica (Celtic); The Great Book of World Myths | Crowded corner; the charms/cures material needs a clear 'historical record, not medical advice' note. |
| 12 | **Seneca: Minor Dialogues and On Benefits (Aubrey Stewart translation)** | Lucius Annaeus Seneca · d. NOT FOUND | c. 65 CE (translation 1889/1900) | PG 64576 · PG 3794 (On Benefits) | **GREEN** | US: translation pre-1931 → PD · EU/UK/TR: translator died 1918 → life+70 expired 1989 | 83.3 | Meditations (live product); Epictetus; 'The Stoic Library' b | Stewart's 1889 prose is more Victorian than Gummere's; readability work is real editorial labour. |
| 13 | **The Grammar of Ornament** | Owen Jones · d. 1874 ✓ | 1856 (1868 ed.) | IA `grammarofornamen00joneuoft` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1945; co-authors Waring d.1875, Westwood d.1893 | 79.6 | Weak to current Valice series; would open a new design lane  | **Colour plate reproduction is the whole product.** KDP colour printing at this quality is costly and the incumbents are strong. Listed for completene… |
| 14 | **Récréations mathématiques (4 vols)** | Édouard Lucas · d. 1891 ✓ | 1882–1894 | IA `recretionmatedou03lucarich` | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1962 | 78.0 | Codex Enigmatica; The Puzzles of Henry Dudeney (same reader) | Translation of technical 19th-century French mathematics is expensive and slow, and Valice has no verified translation capacity. This is the gating qu… |
| 15 | **The Complete Herbal** | Nicholas Culpeper · d. 1654 ✓ | 1653 | PG 49513 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 long expired | 80.2 | Weak to current Valice series (no herbal/nature line exists  | **Safety framing is mandatory.** Culpeper prescribes treatments; a modern edition must be unambiguously historical. Also a crowded market and weak fit… |
| 16 | **Myths of the Cherokee** | James Mooney · d. 1921 ✓ | 1900 | PG 45634 | **GREEN** | US: pre-1931 → PD; US Government (BAE) publication · EU/UK/TR: life+70 expired 1992 | 78.2 | Codex Mythologica (a North American gap in the current 19 ci | **Cultural gate.** The Cherokee Nation is a living government with an active cultural-preservation office. The existing Valice rule (applied to Culin'… |
| 17 | **Modern Magic: A Practical Treatise on the Art of Conjuring** | Professor Hoffmann (Angelo John Lewis) · d. 1919 ✓ | 1876 | PG 58057 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1990 | 80.7 | Codex Enigmatica; pairs with *Puzzles Old and New* into a Ho | Victorian apparatus (many tricks need equipment nobody has) limits practical usefulness; selection is essential. |
| 18 | **A Complete Guide to Heraldry** | Arthur Charles Fox-Davies · d. 1928 ✓ | 1909 | PG 41617 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 1999; ILLUSTRATOR death year NOT FOUND | 78.9 | Codex Bestiarium (heraldic beasts overlap directly with Viny | Illustrator clearance unresolved — and in a heraldry book the illustrations are most of the product. |
| 19 | **Myths and Legends of Ancient Egypt / Myths & Legends of Babylonia & Assyri** | Lewis Spence · d. 1955 ✓ | 1915 / 1916 | PG 43662 · PG 45137 (Babylonia & Assyria) | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 1 Jan 2026; ILLUSTRATOR blocked to 2034 | 76.4 | Codex Mythologica (Egyptian and Mesopotamian entries) | **Illustration trap, newly identified in this pass.** Evelyn Paul's colour plates stay in copyright in EU/UK/TR until 2034. The existing pool did not … |
| 20 | **Hero-Myths & Legends of the British Race** | M. I. Ebbutt · d. 1934 ✓ | 1910 | PG 25502 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 2005 | 78.3 | Codex (a Heroica volume does not exist yet — this is its nat | 'British race' framing is of its period and needs an editorial note. |
| 21 | **British Goblins: Welsh Folk-lore, Fairy Mythology, Legends and Traditions** | Wirt Sikes · d. 1883 ✓ | 1880 | PG 34704 | **GREEN** | US: pre-1931 → PD · EU/UK/TR: life+70 expired 1954; illustrator d.1915 → cleared 1986 | 79.1 | Codex Bestiarium (Welsh creatures); Codex Mythologica (Celti | Welsh-language orthography needs care. |
| 22 | **Twentieth Century Standard Puzzle Book** | A. Cyril Pearson (ed.) · d. 1916 | 1907 | PG 63884 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1987 | 79.6 | Codex Enigmatica | Three-part compilation; heavy selection needed to avoid a shapeless book. |
| 23 | **Athletics and Games of the Ancient Greeks** | Edward Marwick Plummer · d. NOT FOUND | 1898 | PG 64627 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 71.3 | World Games (Greek chapter) | Death year unresolved blocks EU/UK/TR. |
| 24 | **Indian Games: An Historical Research** | Andrew McFarland Davis · d. 1920 | 1885 | PG 6857 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 69.7 | World Games | Short; North American Indigenous games — the **cultural consultation rule applies**, as for Culin. |
| 25 | **Children's Rhymes, Children's Games, Children's Songs, Children's Stories** | Robert Ford · d. 1905 | 1904 | PG 24271 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1976 | 72.3 | World Games (Scottish); Gomme companion | Overlaps Gomme heavily; use as corroboration rather than a separate edition. |
| 26 | **On American Lot-games, as Evidence of Asiatic Intercourse before the Time ** | Edward Burnett Tylor · d. NOT FOUND | 1896 | IA `onamericanlotga00tylogoog` | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND in the fetched record | 62.3 | World Games; Culin set | 29 pages — a paper, not a book. Also touches Indigenous material. |
| 27 | **Conundrums, Riddles and Puzzles / The Book of Riddles / The Handbook of Co** | Dean Rivers; Anonymous; Edith B. Ordway · d. 1944 ✓ (+1 NOT FOUND) | 1900s | PG 52598 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: mixed — one author's dates NOT FOUND | 63.4 | Codex Enigmatica (riddle section) | Thin, repetitive Victorian riddle books; filler at best. |
| 28 | **A Little Book of Filipino Riddles** | Frederick Starr (ed.) · d. 1933 | 1909 | PG 14358 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2004 | 68.1 | Codex Enigmatica; World Myths (SE Asia) | Short; needs pairing. |
| 29 | **Manual for the Solution of Military Ciphers** | Parker Hitt · d. NOT FOUND | 1916 | PG 48871 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 68.1 | Codex Enigmatica (cipher section) | Death year unresolved. If Hitt died after 1955 the EU/UK/TR block could run decades — do not assume. |
| 30 | **Myths of China and Japan** | Donald A. Mackenzie · d. 1936 | 1923 | PG 67344 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2007 | 76.8 | Codex Mythologica; Werner companion | Overlaps Werner; use as corroboration. |
| 31 | **The Folk-Tales of the Magyars** | Kriza, Erdélyi, Pap, Benedek · d. 1931 ✓ | 1889 | PG 42981 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 70.8 | World Myths (Hungarian); pairs with the Turkish volume | Multiple contributors; the editor's dates are NOT FOUND — check before Gate 2. |
| 32 | **The Golden Maiden and Other Folk Tales and Fairy Stories Told in Armenia** | A. G. Seklemian · d. 1920 | 1898 | PG 46944 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1991 | 71.1 | World Myths (Armenian); regional pairing with Turkish/Georgi | Small corpus. |
| 33 | **Legends of Old Honolulu / Hawaiian Legends of Volcanoes** | W. D. Westervelt · d. 1939 | 1915/1916 | PG 66547 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2010 | 70.9 | Codex Mythologica (Polynesian — a current gap) | Native Hawaiian material: the cultural-consultation rule should be considered here too. |
| 34 | **Myths and Myth-Makers** | John Fiske · d. 1901 | 1872 | PG 1061 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1972 | 70.5 | Codex Mythologica (comparative apparatus) | Comparative-mythology theory now superseded. |
| 35 | **The Myths of the New World** | Daniel G. Brinton · d. 1899 | 1868 | PG 19347 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1970 | 69.0 | Codex Mythologica (Americas) | Indigenous material + dated theory; consultation ADVISED. |
| 36 | **The Story of the Alphabet** | Edward Clodd · d. 1930 | 1900 | PG 46388 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2001 | 76.3 | Valice Script (with Taylor); Hangul + Greek workbooks | Popular-level and shorter than Taylor; better as a companion than a flagship. |
| 37 | **An Introduction to the Study of the Maya Hieroglyphs** | Sylvanus Griswold Morley · d. 1948 | 1915 | PG 43491 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2019 | 75.9 | Valice Script (non-alphabetic writing) | Morley's decipherment is substantially superseded — apparatus must say so plainly. |
| 38 | **A Primer of Mayan Hieroglyphics / The Ancient Phonetic Alphabet of Yucatan** | Daniel G. Brinton · d. 1899 | 1894/1870 | PG 57540 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1970 | 70.4 | Valice Script | Short and technical. |
| 39 | **Writing & Illuminating, & Lettering** | Edward Johnston · d. 1944 | 1906 | PG 47089 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 2015; ILLUSTRATOR dates NOT FOUND | 72.5 | Valice Script; the calligraphy reader | The foundational modern calligraphy manual — but the illustrator's dates are unrecorded and the plates are much of the value. |
| 40 | **A History of the Old English Letter Foundries** | Talbot Baines Reed · d. 1893 | 1887 | PG 54365 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1964 | 71.4 | Valice Script (typography) | Specialist. |
| 41 | **Printers' Marks: A Chapter in the History of Typography** | W. Roberts · d. 1940 | 1893 | PG 25663 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2011 | 70.0 | Valice Script | Specialist; strong visual. |
| 42 | **Proverbs of All Nations / Proverb Lore** | Walter K. Kelly; F. Edward Hulme · d. 1867/1909 ✓ | 1859/1902 | PG 63190 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 68.2 | weak — no current Valice series fits | No natural home in the catalog. |
| 43 | **'Gombo Zhèbes': Little Dictionary of Creole Proverbs** | Lafcadio Hearn · d. 1904 | 1885 | PG 44866 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1975 | 68.3 | Hearn set (with Kwaidan, Kotto) | Very short; only viable inside a Hearn collection. |
| 44 | **Birds in Legend, Fable and Folklore** | Ernest Ingersoll · d. 1946 | 1923 | PG 59598 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2017 | 75.1 | Codex Bestiarium (avian) | Ingersoll's *Dragons and Dragon Lore* is the better-known title but its clean scan is unconfirmed — this one is verified and available. |
| 45 | **The Evolution of the Dragon** | Grafton Elliot Smith · d. 1937 | 1919 | PG 22038 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2008 | 74.9 | Codex Bestiarium (dragons) | Elliot Smith's hyperdiffusionism is thoroughly discredited — apparatus must frame it as history of ideas. |
| 46 | **A Book of Giants** | Henry Wysham Lanier · d. NOT FOUND | 1922 | PG 48763 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: UNVERIFIED — death year NOT FOUND | 65.1 | Codex Bestiarium (giants) | Death year unresolved. |
| 47 | **The Book of Talismans, Amulets and Zodiacal Gems** | W. T. & K. Pavitt · d. 1937/1949 ✓ | 1914 | PG 78789 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2020 | 72.2 | Codex (esoterica); weak to current series | Occult-claims framing needed. |
| 48 | **The Folk-lore of Plants / Plant Lore, Legends and Lyrics** | T. F. Thiselton-Dyer; Richard Folkard · d. 1923 ✓ (+1 NOT FOUND) | 1889/1884 | PG 10118 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: one author's dates NOT FOUND | 65.9 | Field Book; no herbal line exists yet | Folkard's dates unresolved; Thiselton-Dyer alone is GREEN. |
| 49 | **Primitive Culture (2 vols)** | Edward B. Tylor · d. 1917 | 1871 | PG 70458 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1988 | 62.3 | weak — foundational anthropology, not a Valice product | Two dense theoretical volumes; scholarly, not trade. |
| 50 | **A Manual of Historic Ornament** | Richard Glazier · d. 1918 | 1899 | PG 53373 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1989 | 63.2 | weak to current series; cheaper alternative to Owen Jones | No Valice design line exists to receive it. |
| 51 | **Manual of Egyptian Archaeology** | G. Maspero · d. 1916/1892 ✓ | 1895 | PG 14400 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 66.1 | Codex Mythologica (Egypt) | Dated archaeology. |
| 52 | **A History of Sumer and Akkad / Legends of Babylon and Egypt** | L. W. King · d. 1919 | 1910/1918 | PG 49345 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 64.4 | Codex Mythologica (Mesopotamia) | Superseded scholarship. |
| 53 | **Hindu Gods and Heroes** | Lionel D. Barnett · d. 1960 ✓ | 1922 | PG 22885 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: **BLOCKED to 1 Jan 2031** (author d.1960) | 60.0 | Codex Mythologica (Hindu) | Newly discovered and immediately blocked outside the US. Use Mackenzie's *Indian Myth and Legend* instead — verified GREEN with usable Goble plates. |
| 54 | **The Romance of Excavation** | David Masters · d. 1965 ✓ | 1923 | PG 70981 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: **BLOCKED to 1 Jan 2036** | 54.5 | Field Book (archaeology) | Blocked outside the US for a decade. |
| 55 | **The Illustrated Key to the Tarot** | L. W. De Laurence · d. 1936/1951 ✓ | 1918 | PG 43548 | **YELLOW** | US: pre-1931 → PD · EU/UK/TR: cleared 2022 (latest death 1951) | 59.6 | weak to current series | **Provenance problem, not a date problem.** This is De Laurence's notorious unauthorised reissue of A. E. Waite's *Pictorial Key to the Tarot*. The da… |
| 56 | **The Handbook to English Heraldry** | Charles Boutell · d. 1877 ✓ | 1863 | PG 23186 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1948 | 77.4 | Codex Bestiarium (heraldic beasts) | Later editions were revised by Fox-Davies — use the Boutell text only. |
| 57 | **The Curiosities of Heraldry** | Mark Antony Lower · d. 1876 ✓ | 1845 | PG 38951 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1947 | 70.6 | Codex Bestiarium | Anecdotal rather than systematic. |
| 58 | **Heraldry for Craftsmen & Designers** | W. H. St. John Hope · d. 1919 ✓ | 1913 | PG 45181 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 70.0 | Codex; design line | Practitioner manual. |
| 59 | **An Illustrated Dictionary of Words used in Art and Archaeology** | John W. Mollett · d. NOT FOUND | 1883 | PG 67629 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 59.9 | reference shelf; weak series fit | Death year unresolved. |
| 60 | **Comparative Studies in Nursery Rhymes** | Lina Eckenstein · d. 1931 ✓ | 1906 | PG 40457 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2002 | 68.3 | World Games (singing/counting games); Gomme companion | Scholarly rather than popular. |
| 61 | **The Magic of the Horse-shoe, with Other Folk-lore Notes** | Robert Means Lawrence · d. 1935 ✓ | 1898 | PG 57411 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2006 | 69.4 | Codex (superstition/charms) |  |
| 62 | **Current Superstitions** | Fanny D. Bergen (ed.) · d. 1924 ✓ | 1896 | PG 28841 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 67.5 | Codex (superstition) | List-form; needs restructuring. |
| 63 | **Omens and Superstitions of Southern India** | Edgar Thurston · d. 1935 ✓ | 1912 | PG 35690 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2006 | 71.2 | Codex; World Myths (South Asia) | Colonial-ethnographic framing needs an editorial note. |
| 64 | **Strange Survivals: Some Chapters in the History of Man** | S. Baring-Gould · d. 1924 ✓ | 1892 | PG 52024 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1995 | 67.9 | Codex; the Baring-Gould set (with Were-Wolves, Curious Myths | Third Baring-Gould title — good for a single-author collection. |
| 65 | **The Sacred Dance: A Study in Comparative Folklore** | W. O. E. Oesterley · d. 1950 ✓ | 1923 | PG 71153 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2021 | 63.0 | weak series fit | Academic. |
| 66 | **Superstitions of the Highlands & Islands of Scotland** | John Gregorson Campbell · d. 1891 ✓ | 1900 | PG 61730 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1962 | 71.2 | Codex Mythologica (Gaelic); pairs with British Goblins |  |
| 67 | **The Folk-lore of the Isle of Man** | A. W. Moore · d. 1909 ✓ | 1891 | PG 77469 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1980 | 68.6 | Codex Mythologica (Manx — genuinely under-served) | Small corpus; pair with the Welsh and Gaelic volumes. |
| 68 | **Folk-Lore of West and Mid-Wales** | Jonathan Ceredig Davies · d. 1932 ✓ | 1911 | PG 53915 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2003 | 68.6 | Codex Mythologica (Welsh); companion to British Goblins |  |
| 69 | **Guernsey Folk Lore** | Sir Edgar MacCulloch · d. 1896 ✓ | 1903 | PG 52834 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1967 | 65.9 | Codex Mythologica (Channel Islands) | Very niche. |
| 70 | **Kaffir Folk-lore** | George McCall Theal · d. 1919 ✓ | 1882 | PG 71335 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1990 | 66.0 | World Myths (southern Africa) | The title is a racial slur in modern usage and cannot be reproduced as-is; the collection also needs Xhosa-language review. |
| 71 | **The Popular Religion and Folk-Lore of Northern India (2 vols)** | William Crooke · d. 1923 ✓ | 1896 | PG 43681 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1994 | 69.6 | Codex Mythologica; World Myths (South Asia) | Two dense volumes of colonial ethnography; framing note required. |
| 72 | **Seneca Myths and Folk Tales / Seneca Fiction, Legends and Myths** | Arthur C. Parker; Jeremiah Curtin & J. N · d. 1955/1906/1937 ✓ | 1923/1918 | PG 61477 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: latest cleared 1 Jan 2026 | 67.3 | Codex Mythologica (Haudenosaunee) | Haudenosaunee material — **cultural consultation applies**, as for Mooney and Culin. |
| 73 | **Curious Facts in the History of Insects** | Frank Cowan · d. 1905 ✓ | 1865 | PG 41625 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1976 | 69.1 | Codex Bestiarium (invertebrates — an unworked corner) | Anecdotal Victorian compilation. |
| 74 | **Ancient Calendars and Constellations** | Emmeline M. Plunket · d. NOT FOUND | 1903 | PG 70052 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 58.7 | Codex Mythologica (astronomical myth) | Death year unresolved; theories superseded. |
| 75 | **Astronomical Myths** | Camille Flammarion & J. F. Blake · d. 1925/1906 ✓ | 1877 | PG 36495 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1996 | 67.2 | Codex Mythologica (star lore) | Adaptation rather than translation. |
| 76 | **A History of Mourning** | Richard Davey · d. 1915 ✓ | 1889 | PG 44379 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1986 | 62.0 | weak series fit | Trade-published promotional volume; short. |
| 77 | **The History of Silhouettes** | Emily Jackson · d. 1947 ✓ | 1911 | PG 69273 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 2018 | 61.8 | weak series fit; strong visual | No Valice line receives it. |
| 78 | **A Manual of the Art of Bookbinding** | James B. Nicholson · d. 1901 ✓ | 1856 | PG 55056 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1972 | 62.2 | weak — but methodologically interesting for a publisher | No line receives it. |
| 79 | **The Ideal Book, or Book Beautiful** | T. J. Cobden-Sanderson · d. 1922 ✓ | 1900 | PG 72320 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1993 | 59.3 | weak series fit | Very short essay. |
| 80 | **Mathematical Essays and Recreations** | Hermann Schubert · d. 1911/1932 ✓ | 1898 | PG 25387 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: both cleared | 65.8 | Codex Enigmatica | Short and technical; a supporting source rather than an edition. |
| 81 | **The Magician's Own Book** | George Arnold & Frank Cahill · d. 1865 ✓ (+1 NOT FOUND) | 1857 | PG 60687 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: one author's dates NOT FOUND | 64.8 | Codex Enigmatica; Hoffmann set | Co-author's dates unresolved. |
| 82 | **The Book of Christmas** | Thomas K. Hervey · d. NOT FOUND | 1836 | PG 42622 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND; illustrator cleared 1907 | 60.9 | Codex (calendar custom) | Author's dates unresolved despite an 1836 publication. |
| 83 | **Old-World Japan: Legends of the Land of the Gods** | Frank Rinder · d. 1945/1954 ✓ | 1895 | PG 46863 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author cleared 2016; plates cleared 1 Jan 2025 | 70.2 | Codex Mythologica (Japan) | **Illustrations usable** — Robinson's plates cleared on 1 Jan 2025. A GREEN Japanese alternative to the blocked Hadland Davis. |
| 84 | **Japanese Fairy Tales (Grace James)** | Grace James · d. NOT FOUND | 1912 | PG 35853 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND; plates cleared 2014 | 64.9 | Codex Mythologica (Japan); young-reader line | Goble's plates are cleared and excellent; the author's dates are not recorded. |
| 85 | **The Myth of Hiawatha, and Other Oral Legends** | Henry Rowe Schoolcraft · d. 1864 ✓ | 1856 | PG 21620 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1935 | 65.8 | Codex Mythologica (Anishinaabe) | Indigenous material — **cultural consultation applies**. Schoolcraft's editorial reshaping is also historically contested. |
| 86 | **Archaic England** | Harold Bayley · d. NOT FOUND | 1919 | PG 41785 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 55.6 | weak series fit | Bayley's etymological method is pseudo-scholarship; would need heavy framing. |
| 87 | **Storyology: Essays in Folk-Lore, Sea-Lore and Plant-Lore** | Benjamin Taylor · d. NOT FOUND | 1900 | PG 29921 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: death year NOT FOUND | 55.6 | Codex | Death year unresolved. |
| 88 | **Traditions, Superstitions and Folk-lore (chiefly Lancashire)** | Charles Hardwick · d. 1889 ✓ | 1872 | PG 39934 | **GREEN** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: cleared 1960 | 64.4 | Codex Mythologica (English regional) |  |
| 89 | **Witchcraft and Superstitious Record in the South-Western District of Scotl** | J. Maxwell Wood · d. NOT FOUND | 1911 | PG 43966 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: author's death year NOT FOUND | 59.2 | Codex (witchcraft) | Author's dates unresolved. |
| 90 | **Folk-Lore and Legends: Oriental / Scotland / North American Indian** | various (anonymous editor) · d. NOT FOUND | 1889–1890 | PG 35334 | **YELLOW** | US: pre-1931 → PD (VERIFIED) · EU/UK/TR: editor unidentified; death year NOT FOUND | 53.7 | World Myths | Anonymous compilations with no identifiable editor — provenance too thin for a rights row. |

---

## 20. Catalog Synergy

Every candidate was tested against the live catalog. The question was not "is this a good
book" but "which Valice product does this make stronger".

| Live Valice product | Public-domain candidates that connect to it | Strength |
|---|---|---|
| **The Great Book of World Games** | Gomme *Traditional Games* (2 vols) · Culin *Korean Games* · Culin *Chess and Playing Cards* · Culin *Mancala* · Falkener *Games Ancient and Oriental* · Murray *History of Chess* · Plummer *Athletics and Games of the Ancient Greeks* · Ford *Children's Rhymes and Games* · Hoyle's Modernized · Foster's Hoyle · Fiske *Chess in Iceland* · Tylor *Lot-games* · Davis *Indian Games* | **Strongest cluster in the catalog** — enough verified material for World Games vols. 2 and 3 plus a British Isles volume |
| **Codex Bestiarium** | Vinycomb *Fictitious & Symbolic Creatures* · Gould *Mythical Monsters* · Lee *Sea Monsters Unmasked* · Topsell *Four-Footed Beasts* · Keightley *Fairy Mythology* · Baring-Gould *Were-Wolves* · Elliot Smith *Evolution of the Dragon* · Ingersoll *Birds in Legend* · Sikes *British Goblins* · Cowan *Curious Facts in the History of Insects* | Very strong; Vinycomb is the closest ancestor but is rights-blocked on one missing date |
| **Codex Mythologica** | Werner (China) · Mackenzie (India, China/Japan, Babylonia) · Spence (Egypt, Babylonia, Popol Vuh) · Lady Wilde (Ireland) · Sikes (Wales) · Campbell (Gaelic) · Moore (Manx) · Davies (Wales) · Rinder (Japan) · Westervelt (Hawaii) · Crooke (N. India) · Seklemian (Armenia) · Kúnos (Türkiye) | Fills real gaps in the existing 19-civilisation set — Vedic, Manx, Welsh, Polynesian, Armenian |
| **Codex Enigmatica** | Hoffmann *Puzzles Old and New* · Hoffmann *Modern Magic* · Loyd *Cyclopedia* · Rouse Ball *Mathematical Recreations* · Lucas *Récréations mathématiques* · Pearson *Twentieth Century Standard Puzzle Book* · Schubert · Hitt *Military Ciphers* · Starr *Filipino Riddles* | Strong, and Hoffmann alone supports two volumes |
| **The Puzzles of Henry Dudeney** | *Puzzles and Curious Problems* (vol. 2 source — date contested) · Loyd · Lucas · Rouse Ball | Volume 2 is blocked on the date question, not on interest |
| **Korean Hangul Handwriting Workbook** | Culin *Korean Games* · Gale *Korean Folk Tales* · Griffis *Korean Fairy Tales* | Culin bridges Hangul and World Games — the only candidate joining two live series |
| **Greek Alphabet Workbook** | Taylor *The Alphabet* · Clodd *Story of the Alphabet* · Johnston *Writing & Illuminating* · Morley/Brinton (Maya) · Mallery (pictography) | Would convert two isolated workbooks into a **Valice Script** series |
| **Meditations (live)** | Epictetus/Long (PG 10661) · Seneca/Stewart · Boethius · Lucretius | The Stoic Library bundle is buildable today from verified-GREEN sources |
| **The Myth Hunter's Field Book** | Keightley · Baring-Gould *Strange Survivals* · Lawrence *Magic of the Horse-shoe* · Bergen *Current Superstitions* · Thurston | Good supporting material, no flagship |

### Where the synergy is weakest

Several high-demand candidates have **no Valice home at all**: *Ghost Stories of an Antiquary*
(61,805 downloads/month), Culpeper's *Complete Herbal* (6,812), *The Grammar of Ornament*,
*Primitive Culture*, and the proverb dictionaries. They are recorded honestly rather than
forced into a series they do not fit. Acquiring any of them means opening a new lane, and
that is a strategy decision, not an acquisition one.

---

## 21. Series Opportunities

| Proposed collection | Volumes | Rights position | Note |
|---|---|---|---|
| **The World's Games** (Culin) | *Korean Games* · *Chess and Playing Cards* · *Mancala* | All three GREEN, all three verified | One author, one cleared death year (1929), three books. The cheapest series in the catalog to clear. |
| **The Hoffmann Library** | *Puzzles Old and New* · *Modern Magic* (· *Latest Magic*) | GREEN (author d. 1919) | Two strong volumes from one cleared author; the third is thinner. |
| **Valice Script** | Taylor *The Alphabet* · Clodd *Story of the Alphabet* · Johnston *Writing & Illuminating* · Morley/Brinton Maya · Mallery pictography | Taylor and Clodd GREEN; Johnston YELLOW (illustrator); Mallery gated | Would give the two existing script workbooks a spine. Start with Taylor. |
| **The Stoic Library** | Meditations (live) · Epictetus/Long · Seneca/Stewart · Boethius · Lucretius (counterpoint) | All GREEN and verified | Buildable now. The Seneca volume must use **Stewart, not Gummere**. |
| **Monsters: The Case For and Against** | Gould *Mythical Monsters* + Lee *Sea Monsters Unmasked* | Both GREEN | A single book from two opposed 1880s voices — an original editorial idea, not a reprint. |
| **The Celtic Fringe** | Sikes (Wales) · Campbell (Gaelic) · Moore (Manx) · Davies (Wales) · MacCulloch (Guernsey) · Lady Wilde (Ireland) | All GREEN | Under-served next to the saturated Irish corner; Manx and Guernsey are genuinely rare. |
| **The Baring-Gould Collection** | *Book of Were-Wolves* · *Curious Myths of the Middle Ages* · *Strange Survivals* | All GREEN (d. 1924) | Three verified volumes, one cleared author. |
| **The Hearn Collection** | *Kwaidan* · *Kotto* · *Gombo Zhèbes* · *Glimpses of Unfamiliar Japan* | All GREEN (d. 1904) | Text clear throughout; Kwaidan's plates are designed out. |
| **The British Isles Games Book** | Gomme vols 1–2 · Ford · Eckenstein | All GREEN | Gomme is the spine; Ford and Eckenstein corroborate. |

---

## 22. Market / Saturation Notes

Discovery-stage intelligence only. **No Amazon marketplace sampling was performed in this
pass** — the demand figures below are Project Gutenberg 30-day download counts, read from the
fetched records, and they measure interest in the free text, not willingness to pay.

### Verified demand — the top of the pool

| Candidate | PG downloads / 30 days | Saturation | Read |
|---|---:|---|---|
| *Meditations* (Long) | 74,795 | Extreme | Already a Valice product; demand is not the problem, differentiation is |
| *Ghost Stories of an Antiquary* | 61,805 | Extreme | Huge demand, no Valice fit, saturated market → Tier C |
| *The Enchiridion* (Higginson) | 35,691 | High | Feeds the Stoic Library |
| *Apology* (Jowett) | 33,992 | Extreme | Saturated |
| *Metamorphoses* (Riley) | 33,149 | High | Codex cross-reference material |
| *Consolation of Philosophy* (James) | 29,364 | Moderate | Genuine Valice Classics candidate |
| *On the Nature of Things* (Leonard) | 27,987 | Moderate | Epicurean counterpoint in the Stoic bundle |
| *Hesiod / Homeric Hymns* (Evelyn-White) | 27,927 | High | Codex source text |
| **Culpeper, *Complete Herbal*** | **6,812** | High | Highest of any *newly discovered* candidate — but no Valice lane |
| **Mooney, *Myths of the Cherokee*** | **6,312** | Moderate | Second-highest new — behind a cultural gate |
| **Werner, *Myths and Legends of China*** | **6,808** | Moderate | Batch 2 flagship; demand confirmed |
| **Fox-Davies, *Complete Guide to Heraldry*** | **4,843** | Moderate | Blocked on an unresolved illustrator |
| Anderson *Younger Edda* / Bellows *Poetic Edda* | 4,303 / 4,210 | High | Norse is crowded |
| **Vinycomb, *Fictitious & Symbolic Creatures*** | **2,245** | Low | Best demand-to-saturation ratio in the bestiary lane |
| **Gomme, *Traditional Games*** | 1,520 + 1,043 | Low | Reference-grade demand for a two-volume dictionary |

### Free-edition pressure

| Level | Meaning | Candidates |
|---|---|---|
| **HIGH** | A free edition dominates and a paid one is hard to justify | Lang, Jacobs, Grimm, Aesop, Meditations, Apology, the Stoic texts generally |
| **MEDIUM** | Free text exists but is unusable as a reading or working edition | Most of the catalog — Gomme (800-page dictionary), Hoffmann (unindexed scan), Topsell (illegible), Culin (museum catalogue) |
| **LOW** | Free competition is weak or absent | Lucas (no English translation at all), Lee *Sea Monsters*, Moore *Isle of Man*, MacCulloch *Guernsey*, Mancala |

The pattern that matters commercially: **the best Valice candidates are not the ones with no
free version — they are the ones whose free version is unusable.** A 418-page unindexed scan
of Victorian puzzle engravings and a redrawn, solved, typeset edition are not the same
product competing on price. They are different products.

### Competition observed

Modern competing editions were recorded as market evidence only; none was used as a rights
source. Dover reprints exist for Culin's *Games of the North American Indians*, Rouse Ball
and Gomme; Princeton Architectural Press and others publish *The Grammar of Ornament*;
Penguin, Oxford and Wordsworth cover the classics heavily. **The Grammar of Ornament is the
only candidate in this catalog facing well-funded competition on its own ground**, which is
why it scores below its visual quality.

---

## 23. Key Risks

**1. Illustrations are where the rights fail, not the text.** Four of this pass's eight
findings are illustration-layer failures on candidates the existing pool had marked GREEN.
The text of *A Wonder Book* is clear; Maxfield Parrish's plates are not, and will not be
until 2037. Any future pass must read the illustrator row for every candidate — Project
Gutenberg records it as a distinct agent role with dates, and it costs nothing to check.

**2. A publication year is not a death year.** The Gummere error is the most instructive
defect found: a plausible-looking four-digit year in the right column, carried forward as
GREEN, that was actually the volume's imprint date. The reconciliation that caught it was
mechanical — compare the recorded death year against the authority record — and should be a
standing check.

**3. Modern reprints sit above originals in search results.** Verified three times: 1961
Falkener reprints, 1964 Gomme reprints, and a Singing Tree Press Ingersoll. Reading the year
field is not optional, and the `internetarchivebooks` collection means lending, not free.

**4. Source provenance is a rights signal.** An IA item in `americana` or a named university
library carries a library's rights determination. An item in `opensource; community` carries
a self-applied Public Domain Mark from an anonymous uploader. Both display similar-looking
licence text. The Loyd *Cyclopedia* is the second kind, and the pool treated it as the first.

**5. Legally clear is not the same as ethically clear.** Seven candidates are held behind a
cultural-consultation gate. Three of them — Mooney's *Myths of the Cherokee*, Mallery's
*Picture-Writing*, and Culin's *Games of the North American Indians* — are among the most
commercially attractive material found. The gate exists precisely because commercial pressure
is where it would otherwise be quietly skipped.

**6. The catalog decays on a schedule.** Everything here is stated as of 1 January 2026. Nine
candidates change status on a known future date. This document should be re-run, not amended,
each January.

**7. Differentiation debt.** The existing plan already records that Valice's live *Meditations*
sits below the house differentiation standard. Adding public-domain titles faster than they
can be given real apparatus reproduces that problem at scale. The candidates with the highest
differentiation scores here (Hoffmann, Lucas, Gomme, Topsell) are also the most expensive to
produce — that correlation is not a coincidence, and it is the real constraint on this
programme.

**8. This is not legal advice.** The GREEN/YELLOW/RED classifications are operational triage
against the house rules in `valice-house/rights/RIGHTS_GATE.md`. Nothing here substitutes for
the founder-signed Gate 2 rights-ledger row that production requires.

---

## 24. Sources

### Repositories queried, with what each returned

| Source | Endpoint used | Result in this session |
|---|---|---|
| Project Gutenberg | `https://www.gutenberg.org/ebooks/<id>` (bibrec) | **205 records fetched and parsed, 0 errors** |
| Project Gutenberg | `https://www.gutenberg.org/ebooks/search/?query=…` | 123 queries, 1,556 unique records |
| Internet Archive | `https://archive.org/metadata/<identifier>` | **30 item records fetched, 0 errors** |
| Internet Archive | `https://archive.org/advancedsearch.php?…&output=json` | ~25 searches (title-targeted and collection-scoped) |
| Standard Ebooks | `https://standardebooks.org/ebooks?query=…` and item pages | HTTP 200; CC0 dedication read directly on the Seneca page |
| Gutendex | `https://gutendex.com/books/?search=…` | **HTTP 503 — unavailable**; PG HTML used instead |

### Internal Valice documents consulted

`RULE_SET_INDEX.md` · `CLAUDE.md` · `AGENTS.md` · `memory/PAST_DECISIONS.md` ·
`memory/USER_PROFILE.md` · `PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md` ·
`PUBLIC_DOMAIN_BATCH_1_PLAN.md` · `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` ·
`BOOK_ACQUISITION_LEGAL_REPORT_TR.md` · `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md` ·
`PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md` · `KDP_PRODUCTION_MASTER_PLAN_TR.md` ·
`VALICE_EBOOK_PRODUCTION_MASTER_PLAN_TR.md` · `CATALOG_ECONOMICS_FINAL.md` ·
`valice-house/rights/RIGHTS_GATE.md` · `valice-house/rights/SCHEMA.md` ·
`valice-house/series-bibles/*` · `scripts/catalog/valice-catalog.mjs` ·
Phase 0–5 execution reports under `docs/execution/`.

### Rights authorities relied on

US term rules and the pre-1931 line follow the Hirtle/Cornell chart as recorded in the
existing legal report. Life+70 for EU/UK/TR follows the existing house rule (TR: FSEK m.27).
**Death years in this catalog come from Project Gutenberg and Internet Archive bibliographic
authority records** — these derive from library authority files and are good evidence, but
they are not the copyright registers themselves. Where a candidate proceeds to Gate 2, the
death year should be confirmed against a national library authority file or probate record,
and that confirmation recorded in the ledger row.

---

## 25. Research Limitations

Stated plainly, because a catalog that hides its gaps is worse than a shorter one.

1. **The US 1931–1963 renewal window was not searched.** The Stanford Copyright Renewal
   Database and the Catalog of Copyright Entries were not queried. No candidate is GREEN on
   the strength of a non-renewal; anything in that window is YELLOW or excluded. This is the
   largest single gap, and it is the reason *Puzzles and Curious Problems* stays HOLD.

2. **URAA restoration was not checked per candidate.** Foreign works first published abroad
   may have had US copyright restored in 1996. The pre-1931 rule was applied without a
   per-candidate URAA check. This mostly affects the non-English originals (Lucas, Kúnos,
   Grimm, the Magyar and Armenian collections).

3. **HathiTrust and Wellcome were not queried in this pass.** Both are in the house source
   hierarchy. Wellcome's Topsell scan is carried forward from the existing plan rather than
   re-verified.

4. **No Amazon marketplace sampling.** Competition, price bands, review moats and BSR were
   not measured. Saturation ratings here are judgements from publishing knowledge plus PG
   download counts, not measurements. The existing plan's Gate 1 market sample
   (`scripts/market/market-sample.mjs`) remains the right instrument and has not been run
   against these candidates.

5. **PG download counts measure interest in a free file.** They are a real signal — they are
   observed, not estimated — but they are not evidence that anyone will pay. *Ghost Stories
   of an Antiquary* at 61,805/month is the clearest illustration: enormous free demand,
   saturated paid market.

6. **Death years come from library authority records, not registers.** Good evidence,
   not conclusive evidence. See §24.

7. **Twenty-four candidates are YELLOW solely for a missing death year.** Most would probably
   resolve to GREEN with a genealogical or national-library search that was not performed
   here. Several of them — Vinycomb especially — would move straight into Tier S if resolved.
   This is the highest-value follow-up work available.

8. **Illustration attribution is incomplete where the source does not record it.** Where PG
   or IA names no illustrator, this catalog says NOT FOUND rather than assuming the plates
   are clear. Several Victorian works with unattributed engravings are marked YELLOW on the
   illustration layer for that reason alone; the recommendation in each case is to redraw,
   which also satisfies the KDP differentiation rule.

9. **Scores below the top tiers are coarse.** Tier S and A candidates were assessed
   individually across all ten axes. Tier C and the weaker HOLD entries were scored more
   quickly, on the same axes but with less scrutiny. Do not read a 2-point difference in the
   lower half of the ranking as meaningful.

10. **Nothing here has been read.** Rights, identifiers, metadata and demand were verified;
    the actual texts were not read end to end. Content suitability, internal quality and the
    true extent of dated or offensive material are assessed from bibliographic evidence and
    subject knowledge, and must be confirmed during editorial work.

---

**PUBLIC-DOMAIN DISCOVERY COMPLETE — PRODUCTION NOT STARTED.**
