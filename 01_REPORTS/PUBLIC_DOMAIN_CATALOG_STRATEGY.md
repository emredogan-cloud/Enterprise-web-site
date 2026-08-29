# Public-Domain Catalog Strategy

## 1. "Old" is not "public domain" — treat as a per-edition legal check, not a genre

FACT/RECOMMENDATION baseline: public-domain status is jurisdiction- and edition-specific. The *underlying work* (e.g., Marcus Aurelius's original text) being ancient does not make every *edition* of it free to use — a specific **translation** (e.g., a 1980s translation) can still be under copyright even when the source text is millennia old. The codebase already gets this right: `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md` explicitly chose the George Long 1862 translation (via Project Gutenberg #15877) *specifically because* a competing modern translation (Hays) is copyrighted and unusable, while another older option (Casaubon) was rejected as archaic/less readable. That is exactly the right diligence pattern — repeat it per title, every time.

## 2. Category-by-category legal map

| Category | Copyright status of the idea | What must be checked per book |
|---|---|---|
| Original Valice Press books | Fully owned | N/A — full rights by authorship |
| Original illustrated editions | Owned (illustrations) + PD or licensed (text) | Illustrations = new copyrightable work; underlying text must independently clear PD/license |
| Original puzzle books | Fully owned | N/A |
| Public-domain source texts, as-is | PD if the *specific edition/translation* is confirmed PD in the target market | Translator, translation date, first-publication jurisdiction, translator's death date (life+70 in most Berne countries) |
| Annotated/edited/redesigned PD editions | PD text + owned annotations/design | The *new* annotations/typography/design are separately copyrightable and are the actual moat — do this deliberately |
| New translations (rights owned) | Owned, if truly commissioned/original | Contract must confirm the translator assigned or licensed rights to Valice Press |
| PD classics + original commentary | PD text + owned commentary | Same as annotated editions |
| Source text + original introduction | Same pattern | Introduction is the value-add and the copyrightable asset |
| Original educational companions | Fully owned | N/A |
| Journals/workbooks | Fully owned | N/A (watch for any embedded PD imagery needing its own clearance) |

**KDP eligibility, INFERENCE from general KDP content policy:** Amazon requires that a public-domain submission be **differentiated** — a bare re-upload of a freely available PD text with no added value is a known KDP rejection/quality-flag pattern (undifferentiated PD content is explicitly discouraged in KDP's content-quality guidance). This directly supports the strategy below: never publish a commodity PD reprint.

## 3. Recommended catalog architecture (differentiated, not commodity)

**RECOMMENDATION — do not fill categories with random PD titles.** Build depth, not breadth, guided by what the brand already proves it can do well: *Meditations* (careful translation selection, real typesetting) and *Codex Enigmatica* (original puzzle IP, back-matter mechanic). The natural throughline is **"classic material, made newly worth owning."**

Top-level groups, prioritized:

| Group | Fit | Rationale |
|---|---|---|
| **Puzzle & Challenge (original)** | A — highest | Proven IP (Codex Enigmatica), zero legal complexity (fully original), highest differentiation, naturally generates its own funnel mechanic (verification pages) |
| **Classics — curated PD, annotated** | A | Matches the *Meditations* precedent exactly; deep public-domain philosophy/classics pool with real translation-selection diligence as the moat |
| **Myth & Folklore — PD + original framing** | B | Aligns with the Founder's stated working titles (World Myths, Myth Hunter); large PD corpus (Bulfinch, Lang's Fairy books, etc.) exists, needs real curation/illustration work to differentiate |
| **Games & Strategy — original** | B | Matches "World Games" interest; likely original content (game rules/puzzles are not usually PD-sourceable), so this is closer to the Original Books bucket than PD |
| **Reference / Digital Editions / Collections** | C | Useful as a wrapper (bundles), not a standalone acquisition category |
| **Children's Learning, Natural History** | C–D | No evidence of founder expertise or existing IP here yet — don't start a new category without a reason |

## 4. Priority matrix

| Tier | Categories |
|---|---|
| **A — high opportunity / high fit** | Original puzzle books (Codex line); curated/annotated PD classics (Meditations line) |
| **B — good opportunity / moderate fit** | Myth & folklore (PD-sourced, original framing); original games/strategy content |
| **C — experimental** | Reference/collections/bundles built from A+B content, not a new acquisition category |
| **D — avoid for now** | Any category with no existing IP, translation, or design asset already in hand — starting a brand-new vertical (children's books, natural history) competes for the same limited production time as the two categories that already have proof of execution |

## 5. Marketplace question (§34 of the master prompt) — direct answer

**RECOMMENDATION: (A) sell only Valice Press's own books, expanding via (B) curated public-domain editions.** Do **not** pursue (C) inviting third-party publishers or (D) a full marketplace — this directly conflicts with the locked architectural decision in `memory/PAST_DECISIONS.md` ("Supply model: First-party catalog — we own/license the titles. No multi-vendor marketplace.") Reopening that would mean rebuilding catalog ownership, contributor payouts, content moderation, and multi-party legal review — a different, much larger business, not a catalog-expansion decision.

**Lowest-complexity model that can become profitable:** stay first-party, grow via curated PD editions in the A/B categories above. This requires zero new architecture — it's the same book/author/category schema already built, populated with more real rows.
