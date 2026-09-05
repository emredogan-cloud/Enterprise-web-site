/**
 * Where each printed edition's built interior actually lives.
 *
 * The book projects grew at different times and none of them agree on a
 * layout — `04_PRINT/`, `08_OUTPUT/`, `09_OUTPUT/FINAL/`, `OUTPUT/`, with
 * three different capitalisations of "paperback". Rather than teach every tool
 * to guess, the paths are written down once, here, and checked by
 * `kdp-linkage-lint.mjs`, which fails loudly when one stops existing.
 *
 * A missing entry is not an omission to be filled in with a plausible path: it
 * means no interior for that format has been built, and the lint says so.
 *
 * The PARENT directory is no longer written down here. It moved twice on
 * 2026-09-05 alone — first into series folders, then into the PUBLİC-PHASE
 * and ROADMAP-BOOKS parents — and each move took twenty-odd editions to
 * BLOCKED until
 * somebody ran the lint. `bookPath` takes the book's own directory name, which
 * has been stable through both, and finds the parent; it throws when the name
 * matches nothing, and throws again when it matches two places.
 */
import { bookPath } from "./book-dirs.mjs";

export const PRINT_INTERIORS = {
  "codex-mythologica": {
    paperback: bookPath("CODEX-MYTHOLOGICA", "04_PRINT", "PAPERBACK", "CODEX_MYTHOLOGICA_INTERIOR_PAPERBACK.pdf"),
    hardcover: bookPath("CODEX-MYTHOLOGICA", "04_PRINT", "HARDCOVER", "CODEX_MYTHOLOGICA_INTERIOR_HARDCOVER.pdf"),
    large_print: bookPath("CODEX-MYTHOLOGICA", "04_PRINT", "LARGEPRINT", "CODEX_MYTHOLOGICA_INTERIOR_LARGEPRINT.pdf"),
  },
  "codex-bestiarium": {
    paperback: bookPath("CODEX-BESTIARIUM", "04_PRINT", "PAPERBACK", "CODEX_BESTIARIUM_INTERIOR_PAPERBACK.pdf"),
    hardcover: bookPath("CODEX-BESTIARIUM", "04_PRINT", "HARDCOVER", "CODEX_BESTIARIUM_INTERIOR_HARDCOVER.pdf"),
    large_print: bookPath("CODEX-BESTIARIUM", "04_PRINT", "LARGEPRINT", "CODEX_BESTIARIUM_INTERIOR_LARGEPRINT.pdf"),
  },
  "codex-enigmatica": {
    paperback: bookPath("CODEX-ENIGMATICA", "08_OUTPUT", "PAPERBACK", "interior.pdf"),
    hardcover: bookPath("CODEX-ENIGMATICA", "08_OUTPUT", "HARDCOVER", "interior.pdf"),
  },
  "the-great-book-of-world-games": {
    paperback: bookPath("THE-GREAT-BOOK-OF-WORLD-GAMES", "08_OUTPUT", "PAPERBACK", "GreatBookOfWorldGames_interior_paperback.pdf"),
    hardcover: bookPath("THE-GREAT-BOOK-OF-WORLD-GAMES", "08_OUTPUT", "HARDCOVER", "GreatBookOfWorldGames_interior_hardcover.pdf"),
    large_print: bookPath("THE-GREAT-BOOK-OF-WORLD-GAMES", "08_OUTPUT", "LARGEPRINT", "GreatBookOfWorldGames_interior_largeprint.pdf"),
  },
  "the-great-book-of-world-myths": {
    paperback: bookPath("THE-GREAT-BOOK-OF-WORLD-MYTHS", "08_OUTPUT", "paperback", "interior.pdf"),
    hardcover: bookPath("THE-GREAT-BOOK-OF-WORLD-MYTHS", "08_OUTPUT", "hardcover", "interior.pdf"),
  },
  "the-myth-hunters-field-book": {
    paperback: bookPath("THE-MYTH-HUNTERS-FIELD-BOOK", "08_OUTPUT", "PAPERBACK", "interior.pdf"),
  },
  "greek-alphabet-handwriting-workbook": {
    // Valice Script 2, built 2026-09-04; the hardcover added 2026-09-05.
    //
    // TWO SEPARATE BUILDS, not one file in two jackets. KDP has no 8.5 x 11
    // case-laminate trim, so the hardcover is typeset at 8.25 x 11 with a
    // 0.875 in gutter and measures its own page count (also 100 — the trim
    // loses the same 0.25 in of column the wider gutter takes). The
    // large-print edition would be this book at this size (DECISIONS.md K4)
    // and is not produced.
    paperback: bookPath("02-GREEK-ALPHABET-HANDWRITING-WORKBOOK", "OUTPUT", "KDP", "PAPERBACK", "interior.pdf"),
    hardcover: bookPath("02-GREEK-ALPHABET-HANDWRITING-WORKBOOK", "OUTPUT", "KDP", "HARDCOVER", "interior.pdf"),
  },
  "korean-hangul-handwriting-workbook": {
    // The REMEDIATED interiors of 2026-09-02, rebuilt on 2026-09-03 with the
    // companion page on p.125. The filename carries the page count and was
    // renamed from _124pp when the count changed — a file whose name states a
    // page count it no longer has is how the wrong interior gets uploaded.
    paperback: bookPath("01-KOREAN-HANGUL-HANDWRITING-WORKBOOK", "09_OUTPUT", "FINAL", "paperback", "paperback_interior_8.5x11_126pp.pdf"),
    hardcover: bookPath("01-KOREAN-HANGUL-HANDWRITING-WORKBOOK", "09_OUTPUT", "FINAL", "hardcover", "hardcover_interior_8.25x11_126pp.pdf"),
  },
  "the-puzzles-of-henry-dudeney": {
    paperback: bookPath("03-THE-PUZZLES-OF-HENRY-DUDENEY", "OUTPUT", "interior-main.pdf"),
  },
  "epictetus-discourses-and-enchiridion": {
    // Valice Classics 3 (2026-09-04). The first build authored a companion page
    // inside the interior; that was a parallel system with none of the house
    // pipeline's verification and it was removed. The interior is now typeset
    // deliberately ODD (175 pp) and build-companion-pages.mjs appends the leaf
    // to make 176, which is the even count KDP requires.
    paperback: bookPath("01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION", "OUTPUT", "interior-main.pdf"),
  },
  "traditional-games": {
    // PHASE 2, BOOK 5 (2026-09-06). Valice Classics 12, and the longest book of the
    // phase: 243 pp, typeset deliberately ODD so the companion leaf appended by
    // build-companion-pages.mjs makes the even 244 that KDP requires. Its 78 engraved
    // staves are vector, drawn into the page by the book's own engraver.
    paperback: bookPath("05-TRADITIONAL-GAMES", "OUTPUT", "interior-main.pdf"),
  },
  "chess-and-playing-cards": {
    // PHASE 2, BOOK 3 (2026-09-05). Valice Classics 10. Typeset deliberately ODD
    // (119 pp) so the companion leaf appended by build-companion-pages.mjs makes
    // the even 120 that KDP requires.
    paperback: bookPath("03-CHESS-AND-PLAYING-CARDS", "OUTPUT", "interior-main.pdf"),
  },
  "korean-games": {
    // PHASE 2, BOOK 2 (2026-09-05). Valice Classics 9. Typeset deliberately ODD
    // (143 pp) so the companion leaf appended by build-companion-pages.mjs makes
    // the even 144 that KDP requires.
    paperback: bookPath("02-KOREAN-GAMES", "OUTPUT", "interior-main.pdf"),
  },
  "games-ancient-and-oriental": {
    // PHASE 2, BOOK 1 (2026-09-05). Valice Classics 8. Typeset deliberately ODD
    // (77 pp) so the companion leaf appended by build-companion-pages.mjs makes
    // the even 78 that KDP requires.
    paperback: bookPath("01-GAMES-ANCIENT-AND-ORIENTAL", "OUTPUT", "interior-main.pdf"),
  },
  "seneca-selected-dialogues": {
    // Valice Classics 4 (2026-09-04). 156 pp — an odd 155 was padded to an even
    // count by the build, because KDP rejects an odd final page.
    paperback: bookPath("02-SENECA-SELECTED-DIALOGUES", "OUTPUT", "interior-main.pdf"),
  },
  "myths-and-legends-of-china": {
    // Valice Classics 5 (2026-09-04). Volume one of two. Typeset ODD (107 pp)
    // so the appended companion leaf makes 108.
    paperback: bookPath("03-MYTHS-AND-LEGENDS-OF-CHINA", "OUTPUT", "interior-main.pdf"),
  },
  "indian-myth-and-legend": {
    // Valice Classics 6 (2026-09-04). Volume one of four. Typeset ODD (93 pp)
    // so the appended companion leaf makes 94.
    paperback: bookPath("04-INDIAN-MYTH-AND-LEGEND", "OUTPUT", "interior-main.pdf"),
  },
  "codex-mythologica-the-puzzle-book": {
    // Roadmap book 4 (2026-09-05). TWO SEPARATE BUILDS: KDP has no 8.5 x 11
    // case laminate, so the hardcover is typeset at 8.25 x 11 with a 0.95 in
    // gutter and measures its own page count.
    paperback: bookPath("04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK", "OUTPUT", "PAPERBACK", "interior.pdf"),
    hardcover: bookPath("04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK", "OUTPUT", "HARDCOVER", "interior.pdf"),
  },
  "mythical-monsters": {
    // Valice Classics 7 (2026-09-04). Volume one of three. Typeset ODD (73 pp)
    // so the appended companion leaf makes 74.
    paperback: bookPath("05-MYTHICAL-MONSTERS", "OUTPUT", "interior-main.pdf"),
  },
};
