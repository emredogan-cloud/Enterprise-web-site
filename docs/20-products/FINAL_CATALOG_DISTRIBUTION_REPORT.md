# Final catalogue distribution report — 2026-09-07

**27 books · 73 (book, format) rows · 25 local projects, all on one gate model · 16 books live
on valicepress.com · 23 live KDP listings · 8 print packages validated and ready · zero UNKNOWN
rows.**

Nothing was published, activated or signed in this pass. What changed is that the release
system now describes the catalogue accurately, and four things that were quietly wrong are not.

---

## 1. What this pass actually changed

| | Before | After |
|---|---|---|
| Projects with a gate record | 13 | **25** |
| Gate cells passed | 64 | **146** |
| Projects passing `metadata-lint` | 5 | **25** |
| Dangling paths in the KDP package index | 35 | 0 |
| Covers `cover-check` had never read | 3 | 0 |
| Live listings checked against measured counts | 0 | **23** |

## 2. The four things that were wrong

**Codex Bestiarium sells under a title that overstates its contents.** Four live Amazon
listings say *"120 Legendary Creatures"*. The manuscript holds 112 entries with 112 distinct
names, the catalogue says 112, and the printed interior prints *"112 legendary creatures"* in
its own front matter. The book contradicts its own listing. Recorded as **F-052**; the title is
past KDP's 72-hour lock, so it is a new edition or a decision to live with it.

**Seneca's cover was built for 156 pages against a 154-page interior** — found in the previous
pass, and this pass found why it could happen: the cover builder read a page count out of a
config instead of measuring the interior. It measures now and refuses when the two disagree.

**Three staged masters were about to overwrite newer ones in R2.** The Puzzle Book's PDF and
both Seneca files were staged on 09-06; R2 already held 09-07 builds, Seneca's from the same
afternoon its interior was corrected. Every existing check passed — content genuinely differed —
because none of them asked which was newer. `upload-masters` now refuses to downgrade.

**Four Phase-3 public-domain titles carried the wrong KDP title.** KDP requires a public-domain
edition to be differentiated in the title field; theirs had lost the `(Annotated)` tag.
Restored from each project's own upload handbook. A fifth, Fairy Mythology, passed that check
only because its `differentiation` was null — it was never asked. Now recorded.

## 3. The seven sets

| Set | Meaning | Count |
|---|---|---|
| **D** | Live on Valice **and** KDP | 9 |
| **B** | Live on Valice, no Amazon edition | 7 |
| **C** | Live on KDP, not on Valice | **0** |
| **A** | Local only | 11 |
| **E** | Ready for both | **0** — see §5 |
| **F** | Not ready | 11 |
| **G** | Blocked | 1 |

## 4. F-049 — final state

| 1 | `the-myth-hunters-field-book`/hardcover | 8.25×11 in | — | — | **BLOCKED** |
| 2 | `greek-alphabet-handwriting-workbook`/paperback | 8.5×11 in | 100 | `3230cc14bda3f366` | **READY** |
| 3 | `greek-alphabet-handwriting-workbook`/hardcover | 8.25×11 in | 100 | `133fd418c0f4c8bb` | **READY** |
| 4 | `codex-mythologica-the-puzzle-book`/hardcover | 8.25×11 in | 156 | `e73a2a6a7840bf00` | **READY** |
| 5 | `epictetus-discourses-and-enchiridion`/paperback | 6×9 in | 176 | `e1a3940ffdddf100` | **READY** |
| 6 | `seneca-selected-dialogues`/paperback | 6×9 in | 154 | `f06fea37a5d083f0` | **READY** |
| 7 | `myths-and-legends-of-china`/paperback | 6×9 in | 108 | `f4738f2a4e0474bb` | **READY** |
| 8 | `indian-myth-and-legend`/paperback | 6×9 in | 94 | `0ac86524968a8782` | **READY** |
| 9 | `mythical-monsters`/paperback | 6×9 in | 74 | `a97c3e4abbd3e7c1` | **READY** |

Each of the eight passes three independent checks: KDP geometry (spine read from the
calculator for hardcovers, never derived), `preflight.py` (fonts embedded, metadata present,
trim, page count), and `cover-check.mjs`. Text layers carry zero U+FFFD replacement characters,
so nothing was dropped in rendering.

The ninth is `the-myth-hunters-field-book/hardcover`, and it is blocked on a decision rather
than a build — the project records single-format by design and decision A5 as open with
assumption *no*, while the page advertises the hardcover anyway. Recorded on the catalogue row
itself and as **F-051**. Neither inventing the hardcover nor silently withdrawing the promise is
an agent's call.

## 5. Why set E is empty

Every one of the eight ready packages fails the same three gates — 7 (Cover), 8 (Interior /
proof), 10 (KDP compliance). All three are Founder sign-offs, and gate 8's evidence is a
**physical proof copy**. No amount of tooling produces one.

That is the whole distance between eight finished, validated print packages and a KDP upload.

## 6. Commerce, verified against the live accounts

| Check | Result |
|---|---|
| Paddle webhook | active, 4 of 4 events subscribed |
| Active products / prices | 19 / 19 |
| Direct-sold books price-matched | **14 of 14**, to the cent |
| KDP prices vs catalogue | **23 of 23**, zero drift |
| KDP titles vs measured counts | 19 of 23 clean; **4 are the Bestiarium listings** |
| R2 masters | all present; three stale staging files refused |
| Live product pages | **27 of 27** pass, 16 of 16 of the books meant to be on sale |

## 7. The full matrix

| `meditations`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | **no** |
| `codex-mythologica`/ebook | LIVE | LIVE | B0HD8121RR | $6.99 | amazon | yes |
| `codex-mythologica`/paperback | LIVE | LIVE | B0HCY8KY3X | $21.99 | amazon | yes |
| `codex-mythologica`/hardcover | LIVE | LIVE | B0HDBFZRQ4 | $32.99 | amazon | yes |
| `codex-mythologica`/large_print | LIVE | LIVE | B0HDDR84MF | $27.99 | amazon | yes |
| `codex-bestiarium`/ebook | LIVE | LIVE | B0HDLS4W8Q | $12.99 | direct | yes |
| `codex-bestiarium`/paperback | LIVE | LIVE | B0HDLQHQ7H | $24.99 | amazon | yes |
| `codex-bestiarium`/hardcover | LIVE | LIVE | B0HDLLPG5M | $37.99 | amazon | yes |
| `codex-bestiarium`/large_print | LIVE | LIVE | B0HDLT1V3P | $29.99 | amazon | yes |
| `the-great-book-of-world-myths`/ebook | LIVE | LIVE | B0HDQRPKST | $6.99 | direct | yes |
| `the-great-book-of-world-myths`/paperback | LIVE | LIVE | B0HDTL5V2H | $14.99 | amazon | yes |
| `the-great-book-of-world-myths`/hardcover | LIVE | LIVE | B0HDZJ4PHQ | $26.99 | amazon | yes |
| `the-great-book-of-world-myths`/large_print | LIVE | NOT APPLICABLE (edition not planned) | — | — | amazon | yes |
| `the-great-book-of-world-games`/ebook | LIVE | LIVE | B0HG44FH1B | $11.99 | direct | yes |
| `the-great-book-of-world-games`/paperback | LIVE | LIVE | B0HG3KMK9L | $22.99 | amazon | yes |
| `the-great-book-of-world-games`/hardcover | LIVE | LIVE | B0HG41F21F | $34.99 | amazon | yes |
| `the-great-book-of-world-games`/large_print | LIVE | LIVE · Updates in review | B0HHNCVQVX | $31.99 | amazon | yes |
| `the-myth-hunters-field-book`/paperback | LIVE | LIVE | B0HFP4KYX5 | $14.99 | amazon | yes |
| `the-myth-hunters-field-book`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | — | direct | yes |
| `the-myth-hunters-field-book`/hardcover | LIVE | BLOCKED | — | — | amazon | yes |
| `greek-alphabet-handwriting-workbook`/paperback | LIVE | READY TO UPLOAD | — | $12.99 | amazon | yes |
| `greek-alphabet-handwriting-workbook`/hardcover | LIVE | READY TO UPLOAD | — | $24.99 | amazon | yes |
| `greek-alphabet-handwriting-workbook`/large_print | LIVE | NOT IN KDP | — | — | amazon | yes |
| `greek-alphabet-handwriting-workbook`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $6.99 | direct | yes |
| `codex-mythologica-the-puzzle-book`/paperback | LIVE | LIVE | B0HJ2TPX4T | $16.99 | amazon | yes |
| `codex-mythologica-the-puzzle-book`/hardcover | LIVE | READY TO UPLOAD | — | $33.99 | amazon | yes |
| `codex-mythologica-the-puzzle-book`/large_print | LIVE | NOT IN KDP | — | — | amazon | yes |
| `codex-mythologica-the-puzzle-book`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $11.99 | direct | yes |
| `korean-hangul-handwriting-workbook`/paperback | LIVE | LIVE | B0HHHWXGG4 | $12.99 | amazon | yes |
| `korean-hangul-handwriting-workbook`/hardcover | LIVE | LIVE · Updates in review | B0HHLZ31CV | $21.99 | amazon | yes |
| `korean-hangul-handwriting-workbook`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | — | direct | yes |
| `the-puzzles-of-henry-dudeney`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `the-puzzles-of-henry-dudeney`/paperback | LIVE | LIVE | B0HHS2JW9N | $14.99 | amazon | yes |
| `epictetus-discourses-and-enchiridion`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `epictetus-discourses-and-enchiridion`/paperback | LIVE | READY TO UPLOAD | — | $16.99 | amazon | yes |
| `seneca-selected-dialogues`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `seneca-selected-dialogues`/paperback | LIVE | READY TO UPLOAD | — | $15.99 | amazon | yes |
| `myths-and-legends-of-china`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `myths-and-legends-of-china`/paperback | LIVE | READY TO UPLOAD | — | $13.99 | amazon | yes |
| `indian-myth-and-legend`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `indian-myth-and-legend`/paperback | LIVE | READY TO UPLOAD | — | $12.99 | amazon | yes |
| `mythical-monsters`/ebook | LIVE | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `mythical-monsters`/paperback | LIVE | READY TO UPLOAD | — | $11.99 | amazon | yes |
| `games-ancient-and-oriental`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $7.99 | direct | yes |
| `games-ancient-and-oriental`/paperback | DRAFT | NOT IN KDP | — | $12.99 | amazon | yes |
| `korean-games`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $8.99 | direct | yes |
| `korean-games`/paperback | DRAFT | NOT IN KDP | — | $16.99 | amazon | yes |
| `kwaidan`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $8.99 | direct | yes |
| `kwaidan`/paperback | DRAFT | NOT IN KDP | — | $14.99 | amazon | yes |
| `kwaidan`/hardcover | DRAFT | NOT IN KDP | — | $29.99 | amazon | yes |
| `fairy-mythology-vol-1`/ebook | DRAFT | NOT APPLICABLE (edition not planned) | — | $9.99 | direct | yes |
| `fairy-mythology-vol-1`/paperback | DRAFT | NOT IN KDP | — | $19.99 | amazon | yes |
| `fairy-mythology-vol-1`/hardcover | DRAFT | NOT IN KDP | — | $38.99 | amazon | yes |
| `fairy-mythology-vol-2`/ebook | DRAFT | NOT APPLICABLE (edition not planned) | — | $9.99 | direct | yes |
| `fairy-mythology-vol-2`/paperback | DRAFT | NOT IN KDP | — | $19.99 | amazon | yes |
| `fairy-mythology-vol-2`/hardcover | DRAFT | NOT IN KDP | — | $38.99 | amazon | yes |
| `british-goblins`/ebook | DRAFT | NOT APPLICABLE (edition not planned) | — | $11.99 | direct | yes |
| `british-goblins`/paperback | DRAFT | NOT IN KDP | — | $22.99 | amazon | yes |
| `british-goblins`/hardcover | DRAFT | NOT IN KDP | — | $41.99 | amazon | yes |
| `book-of-were-wolves`/ebook | DRAFT | NOT APPLICABLE (edition not planned) | — | $8.99 | direct | yes |
| `book-of-were-wolves`/paperback | DRAFT | NOT IN KDP | — | $15.99 | amazon | yes |
| `book-of-were-wolves`/hardcover | DRAFT | NOT IN KDP | — | $32.99 | amazon | yes |
| `sea-monsters-unmasked`/ebook | DRAFT | NOT APPLICABLE (edition not planned) | — | $9.99 | direct | yes |
| `sea-monsters-unmasked`/paperback | DRAFT | NOT IN KDP | — | $16.99 | amazon | yes |
| `sea-monsters-unmasked`/hardcover | DRAFT | NOT IN KDP | — | $33.99 | amazon | yes |
| `traditional-games`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $9.99 | direct | yes |
| `traditional-games`/paperback | DRAFT | NOT IN KDP | — | $16.99 | amazon | yes |
| `chess-and-playing-cards`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $7.99 | direct | yes |
| `chess-and-playing-cards`/paperback | DRAFT | NOT IN KDP | — | $14.99 | amazon | yes |
| `mancala`/ebook | DRAFT | NOT APPLICABLE (Valice-only format) | — | $4.99 | direct | yes |
| `codex-enigmatica`/ebook | LIVE | LIVE | B0HGRZ3BRC | $9.99 | direct | yes |
| `codex-enigmatica`/paperback | LIVE | LIVE | B0HGSVF15Q | $19.99 | amazon | yes |
| `codex-enigmatica`/hardcover | LIVE | LIVE · Updates in review | B0HH3B4HQ7 | $29.99 | amazon | yes |

---

*Every status measured: Valice from HTTP requests to production, KDP from the Bookshelf read in
a browser, Paddle and R2 from the live accounts, page counts and fonts out of the PDFs.
Machine-readable: `scripts/tmp/matrix.json`.*
