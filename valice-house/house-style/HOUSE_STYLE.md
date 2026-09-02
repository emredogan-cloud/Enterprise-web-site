# Valice House Style

Version 1 · 2026-09-02 · Owner: founder (edits are decisions; agents propose, never edit).

This file merges the conventions the existing Valice books already follow.
Where a series has its own rulebook (World Myths `CHILDREN_WRITING_STYLE.md`,
Bestiarium `SOURCING_STANDARD.md`, the Games `PLAYABILITY_STANDARD.md`), that
rulebook wins inside its series and this file only points at it — the
Bestiarium D17 lesson: two files stating the same rule differently is a
defect waiting to be discovered months later.

Evidence labels: [O] observed in a shipped Valice book · [R] house rule.

## 1. Voice

| Rule | Detail |
|---|---|
| Register | Calm, literary, first-person-credible. The reader should see the subject, never the author. [O World Myths "the child should see the scene, not the writer"] |
| Claims | Every checkable statement has a source (see §6). No claim is load-bearing unless it can survive Gate 5. |
| Marketing language | None inside a book. No "ultimate", "best", "essential", "must-have", "definitive", "comprehensive" (the Bestiarium brief explicitly renounces "comprehensive"). [R] |
| Self-reference to tooling | A book never mentions AI, models or prompts. Disclosure lives in the KDP form, not in the text. [R] |
| Counts | A number in a title, subtitle or introduction is a **measured** count from `project_config.json → measured`, never a target. Bestiarium's listing said 120; the book holds 112. [O] |
| Honesty about scope | Say what is left out and why (Bestiarium afterword; World Games "56 games, 39 cultures" after the 100/45 target was not reached). [O] |

## 2. Spelling and punctuation

- US English (color, catalog, traveled). Proper nouns keep their own spelling; transliterations follow the pronunciation guide of the series bible.
- Serial (Oxford) comma. Em dash without spaces in body text. Curly quotes and apostrophes in typeset output; straight in source files is fine — the build converts.
- Italics for titles of works and for the first appearance of a foreign term, which is then glossed once.
- Numbers: one to nine in words, 10 and above in figures, except in tables, measurements and counts that are the product's promise ("112 creatures").

## 3. Measurements and units

- KDP specifications in inches first, millimetres in parentheses: 6 × 9 in (15.24 × 22.86 cm). Page counts are integers. Prices in USD with two decimals.
- Historical measures stay as the source gives them, glossed once.
- Dates: 8 August 2026 in prose; ISO `2026-08-08` in data files.

## 4. Headings, captions, tables

- One H1 per manuscript file (the chapter or entry title). H2 for sections, H3 for sub-sections; never skip a level. `style-lint` fails a jump.
- Entry/lesson/story units follow the series bible's fixed template; do not add ad-hoc sub-headings inside a unit.
- Captions: `Figure N. ` + one sentence; plates in Codex volumes carry the creature/subject name only.
- Tables have a header row, a caption above, and units in the header cell, not in every cell.

## 5. References and bibliography

Adopted from Bestiarium/World Myths `SOURCING_STANDARD.md` [O]:

- Source layers: `primary`, `scholarly`, `reference`, `index`, `retelling`. A fact is verified only with **two independent sources, at least one primary or scholarly**. `index` (Thompson, ATU) and `retelling` (any other retelling, Wikipedia) are never counted as sources; reading them is fine, citing them is not.
- Citation form: author, *title*, edition/translator, year, page. **An unverified page number is an invented source.** No page number is written that was not seen.
- Every entry/story lists its sources; the back matter carries the full bibliography sorted by author.
- Public-domain editions state the source text, translator and translation year on the copyright page (Meditations: Long 1862, PG #15877). [O]

## 6. Accessibility and reading level

| Audience | Band | Rule |
|---|---|---|
| Young Explorers (8–12) | Flesch–Kincaid 4.0–6.5; sentences average 11–14 words, max 25; ≤ 7 new proper nouns per story | `CHILDREN_WRITING_STYLE.md` + `AGE_POLICY.md` (violence: consequences told, horror not depicted; no added happy endings; `ageAdaptationNote` when a source is softened) [O] |
| Adult reference (Codex, Classics) | no band; clarity over ornament | entries scannable: name, class, tradition visible at a glance [O Bestiarium] |
| Workbooks (Valice Script) | instructions ≤ 20 words per step; one action per line | a single human must be able to complete five pages from the book alone (Gate 4 pilot) |

Alt text for every image in EPUB/web; pronunciation guides use the series' fixed respelling scheme (World Myths/Bestiarium scheme, sourced).

## 7. Covers and metadata (pointers)

Cover rules: `valice-house/covers/COVER_STANDARDS.md`. Metadata rules:
`valice-house/metadata/METADATA_STANDARDS.md`. Both are enforced by
`cover-check.mjs` and `metadata-lint.mjs`.

## 8. Production rule of three

At most three stories/entries/lessons are drafted in one session before a
verification pass, so a drift is caught at unit 3, not unit 30. [O World Myths]

## 9. Machine-readable section

`scripts/factory/style-lint.mjs` reads the JSON block below. Keep it small.

```json
{
  "bannedPhrases": [
    "ultimate guide", "the best book", "best ever", "must-have", "must have",
    "definitive guide", "comprehensive guide", "essential guide", "as an ai",
    "as a language model", "in this article", "in this blog post", "delve into",
    "game-changer", "unlock the secrets", "everything you need to know",
    "you won't believe", "world's best", "number one", "#1 bestseller",
    "lorem ipsum", "[tbd]", "todo:", "placeholder"
  ],
  "headingLevels": { "max": 3, "requireSingleH1": true },
  "readingLevel": {
    "young-explorers": { "fkMin": 4.0, "fkMax": 6.5, "maxSentenceWords": 25 },
    "adult": { "fkMin": null, "fkMax": null, "maxSentenceWords": 45 }
  }
}
```
