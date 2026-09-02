# Metadata Standards

**Status:** ACTIVE · v1 (2026-09-02) · **Gate:** 9 (R8) · **Read by:** `scripts/factory/metadata-lint.mjs` (JSON block at the end)

## 1. Title and subtitle patterns

| Series | Title | Subtitle pattern | Live example |
|---|---|---|---|
| Codex | `Codex <Latin noun>` | `<N> <things> from <M> <Traditions/Civilizations> — <descriptor>` | *Codex Bestiarium — A World Bestiary: 112 Legendary Creatures from 40 Traditions — Beasts, Spirits, and Guardians of World Folklore* |
| The Great Book of… | `The Great Book of <Subject>` | `<N> <Stories/Games> from <scope> — <what the reader gets>, <promise only if measured>` | *56 Games from 4,600 Years of Human Play — Rules, Boards and Stories from 39 Cultures, Ready to Play Tonight* |
| Field Book | `The Myth Hunter's Field Book` (+ `, Vol. <n>`) | `A Screen-Free Quest Through <N> Cultures — <N> Puzzles… for Ages 8–12` | live |
| Valice Script | `<Language> <Script> Handwriting Workbook` | `Learn to write all <N> letters with correct stroke order, … and read your first <N> <Language> words` | Hangul (K42, final) |
| Valice Classics | `<Source title>` or `<Author>: <Work>` | `<Translator>'s translation of <year>, with <apparatus>`; KDP title field carries `(Annotated)` / `(Illustrated)` / `(Translated)` | *Meditations — The George Long translation of 1862, newly typeset* |

Rules:
- **Every integer in a subtitle is measured from the built artefact** (entries, cultures, letters, words, games). `metadata-lint` fails when a subtitle integer is not in `project_config.json → measured`.
- A promise in a subtitle ("Ready to Play Tonight") requires the recorded validation behind it (playtests); otherwise it is removed.
- KDP title ≤ 200 characters; subtitle ≤ 200; the title field never contains keywords, prices, "new", "edition 2026" or series numbering (series linking is a separate KDP field).
- Author: `Emre Doğan` (K38); publisher/imprint: the Founder's naming decision (*Vâliçe Press* on printed books, *Valice Press* on the site) is open and must be closed before the next print run.

## 2. The seven keywords

KDP rules [V, kdp.amazon.com G201298500]: up to seven keywords or phrases; not allowed — brands you do not own, subjective claims ("best novel ever"), time-sensitive words ("new", "on sale", "available now"), misrepresentative names, Amazon program names ("Kindle Unlimited", "KDP Select"), spelling errors, words already in the categories. Valice adds: ≤ 50 characters per slot; do not repeat title/subtitle words (slot waste — Bestiarium brief §5).

Per-series **candidate** lists (no volume data exists — validate with Amazon autocomplete and a top-20 BSR sample at Gate 1; these are starting points, not findings):

| Series | Candidates to validate |
|---|---|
| Codex (reference) | mythical creatures encyclopedia illustrated · folklore reference book for writers · comparative folklore motif index · line art bestiary gift book hardcover · world mythology reference illustrated · norse celtic japanese slavic creatures · gods heroes legends reference |
| Codex (puzzle) | puzzle book for adults hard · mythology puzzles ciphers riddles · cain's jawbone style puzzle book *(competitor name — NOT allowed; listed only to show the trap)* · logic puzzles codes and ciphers · escape room puzzle book adults |
| The Great Book of… (myths) | world mythology for kids 8-12 · myths and legends from around the world · norse egyptian japanese myths children · mythology book for middle grade readers · read aloud myths for families |
| The Great Book of… (games) | traditional board games book · world games rules and history · family games for adults and kids · mancala backgammon go rules · history of board games reference · games from around the world · classroom games activity book *(live set)* |
| Field Book | activity book ages 8-12 puzzles · screen free activities for kids · mythology activity book for kids · codes ciphers puzzles for children · educational puzzle book history cultures |
| Valice Script | korean handwriting practice workbook · learn hangul stroke order · greek alphabet handwriting practice · cyrillic handwriting workbook adults · japanese hiragana katakana writing practice · learn to write <script> for beginners |
| Valice Classics | stoic philosophy annotated edition · marcus aurelius meditations long translation · epictetus enchiridion annotated · victorian puzzle book annotated · classic games treatise modernized rules |

## 3. Categories and BISAC

| Series | Primary | Secondary | Tertiary | Source |
|---|---|---|---|---|
| Codex reference | SOC011000 Folklore & Mythology | REF000000 Reference/General | FIC010000 Fairy Tales, Folk Tales, Legends & Mythology | Bestiarium brief; Mythologica uses FIC010000 / SOC011000 / LIT004290 |
| Codex puzzle | GAM014000 Games/Puzzles | — | — | Enigmatica |
| Great Book — myths | JUV033010 (Juvenile Fiction / Legends, Myths, Fables / General) | — | — | World Myths |
| Great Book — games | GAM002000 Games/Board | REF000000 | HIS000000 | World Games |
| Field Book | JNF001000 (Juvenile Nonfiction / Activity Books) | JUV045000 | JNF025000 | Field Book |
| Valice Script | FOR008000 (Foreign Language Study / Korean) — assign per language | — | — | Hangul has **no BISAC yet** (open item) |
| Valice Classics | PHI011000 (Philosophy / Ancient) for Stoics; GAM007000 for puzzles; SOC011000 for folklore | — | — | Meditations |

KDP picks three categories from its own tree at upload; record the three chosen in `project_config.json → metadata.categories`. Age/grade range: **leave empty** unless the book is a children's title (Games handbook §11 — marking a family reference volume as a children's book drops it from adult searches).

## 4. Description template (≤ 4,000 characters, plain text)

1. One-line promise (the `onelinePromise` field).
2. What is inside — measured counts, structure, apparatus.
3. What it is not (one sentence).
4. Who it is for.
5. Sources/provenance sentence (Classics: source, translator, year).
6. Series line (only if the series exists on KDP).
No reviews, no prices, no competitor names, no superlatives (HOUSE_STYLE §9).

## 5. Series linking

KDP series metadata is opened **only when volume 2 actually exists** (Hangul decision: "Book 1 is positioned as such but the KDP series metadata is not opened until a second book is really planned"). The storefront `series` field in `valice-catalog.mjs` may be set earlier for navigation.

## 6. Public-domain tags

KDP [V, G200743940]: an edition qualifies only through original translation, original annotations (study guides, critiques, biographies, historical context) or ≥ 10 original illustrations, and **must include `(Translated)`, `(Annotated)` or `(Illustrated)` in the title field**. Not accepted: linked TOC, formatting, collections, sales rank, price, freely available internet content. Direct-store titles carry the apparatus level (MINIMUM/PREMIUM) in `editionNote` instead of a tag.

## 7. Storefront fields (`valice-catalog.mjs`)

`onelinePromise` (≤ 140 chars, measured claims only) · `description` · `idealReader` · `priceBasis` (why this number: "live Amazon list price read 2026-08-31", "price-engine recommended at 35 % target margin") · `blockers[]` (honest, never laundered) · `rights` block (see `valice-house/rights/SCHEMA.md`) · `editionNote` for Classics.

## 8. Machine-readable block

```json
{
  "version": 1,
  "keywordSlots": 7,
  "keywordMaxChars": 50,
  "titleMaxChars": 200,
  "subtitleMaxChars": 200,
  "descriptionMaxChars": 4000,
  "bannedKeywordTerms": [
    "kindle unlimited", "kdp select", "amazon", "bestseller", "best seller", "best",
    "new", "on sale", "available now", "free", "cheap", "discount", "2026", "2027",
    "cain's jawbone", "journal 29", "percy jackson", "d&d", "dungeons & dragons",
    "penguin", "dover", "wordsworth", "oxford", "guaranteed", "#1", "award-winning"
  ],
  "pdTitleTags": ["(Annotated)", "(Illustrated)", "(Translated)"],
  "subtitleIntegersMustMatchMeasured": true,
  "seriesMetadataRequiresVolumeTwo": true
}
```
