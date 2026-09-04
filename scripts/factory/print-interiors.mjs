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
 */

const ROOT = "/home/emre/Downloads/MY-DİGİTAL-BOOK";

export const PRINT_INTERIORS = {
  "codex-mythologica": {
    paperback: `${ROOT}/CODEX_MYTHOLOGICA/04_PRINT/PAPERBACK/CODEX_MYTHOLOGICA_INTERIOR_PAPERBACK.pdf`,
    hardcover: `${ROOT}/CODEX_MYTHOLOGICA/04_PRINT/HARDCOVER/CODEX_MYTHOLOGICA_INTERIOR_HARDCOVER.pdf`,
    large_print: `${ROOT}/CODEX_MYTHOLOGICA/04_PRINT/LARGEPRINT/CODEX_MYTHOLOGICA_INTERIOR_LARGEPRINT.pdf`,
  },
  "codex-bestiarium": {
    paperback: `${ROOT}/CODEX_BESTIARIUM/04_PRINT/PAPERBACK/CODEX_BESTIARIUM_INTERIOR_PAPERBACK.pdf`,
    hardcover: `${ROOT}/CODEX_BESTIARIUM/04_PRINT/HARDCOVER/CODEX_BESTIARIUM_INTERIOR_HARDCOVER.pdf`,
    large_print: `${ROOT}/CODEX_BESTIARIUM/04_PRINT/LARGEPRINT/CODEX_BESTIARIUM_INTERIOR_LARGEPRINT.pdf`,
  },
  "codex-enigmatica": {
    paperback: `${ROOT}/CODEX-ENIGMATICA/08_OUTPUT/PAPERBACK/interior.pdf`,
    hardcover: `${ROOT}/CODEX-ENIGMATICA/08_OUTPUT/HARDCOVER/interior.pdf`,
  },
  "the-great-book-of-world-games": {
    paperback: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/PAPERBACK/GreatBookOfWorldGames_interior_paperback.pdf`,
    hardcover: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/HARDCOVER/GreatBookOfWorldGames_interior_hardcover.pdf`,
    large_print: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/LARGEPRINT/GreatBookOfWorldGames_interior_largeprint.pdf`,
  },
  "the-great-book-of-world-myths": {
    paperback: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-MYTHS/08_OUTPUT/paperback/interior.pdf`,
    hardcover: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-MYTHS/08_OUTPUT/hardcover/interior.pdf`,
  },
  "the-myth-hunters-field-book": {
    paperback: `${ROOT}/THE-MYTH-HUNTERS-FIELD-BOOK/08_OUTPUT/PAPERBACK/interior.pdf`,
  },
  "greek-alphabet-handwriting-workbook": {
    // Valice Script 2, built 2026-09-04. Paperback only: the hardcover is not
    // produced (economics, DECISIONS.md K8) and the large-print edition would
    // be this book at this size (K4).
    paperback: `${ROOT}/GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/KDP/PAPERBACK/interior.pdf`,
  },
  "korean-hangul-handwriting-workbook": {
    // The REMEDIATED interiors of 2026-09-02, rebuilt on 2026-09-03 with the
    // companion page on p.125. The filename carries the page count and was
    // renamed from _124pp when the count changed — a file whose name states a
    // page count it no longer has is how the wrong interior gets uploaded.
    paperback: `${ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_126pp.pdf`,
    hardcover: `${ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/09_OUTPUT/FINAL/hardcover/hardcover_interior_8.25x11_126pp.pdf`,
  },
  "the-puzzles-of-henry-dudeney": {
    paperback: `${ROOT}/THE-PUZZLES-OF-HENRY-DUDENEY/OUTPUT/interior-main.pdf`,
  },
  "epictetus-discourses-and-enchiridion": {
    // Valice Classics 3 (2026-09-04). The first build authored a companion page
    // inside the interior; that was a parallel system with none of the house
    // pipeline's verification and it was removed. The interior is now typeset
    // deliberately ODD (175 pp) and build-companion-pages.mjs appends the leaf
    // to make 176, which is the even count KDP requires.
    paperback: `${ROOT}/PHASE-1-BOOK/01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION/OUTPUT/interior-main.pdf`,
  },
  "seneca-selected-dialogues": {
    // Valice Classics 4 (2026-09-04). 156 pp — an odd 155 was padded to an even
    // count by the build, because KDP rejects an odd final page.
    paperback: `${ROOT}/PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pdf`,
  },
  "myths-and-legends-of-china": {
    // Valice Classics 5 (2026-09-04). Volume one of two. Typeset ODD (107 pp)
    // so the appended companion leaf makes 108.
    paperback: `${ROOT}/PHASE-1-BOOK/03-MYTHS-AND-LEGENDS-OF-CHINA/OUTPUT/interior-main.pdf`,
  },
  "indian-myth-and-legend": {
    // Valice Classics 6 (2026-09-04). Volume one of four. Typeset ODD (93 pp)
    // so the appended companion leaf makes 94.
    paperback: `${ROOT}/PHASE-1-BOOK/04-INDIAN-MYTH-AND-LEGEND/OUTPUT/interior-main.pdf`,
  },
  "mythical-monsters": {
    // Valice Classics 7 (2026-09-04). Volume one of three. Typeset ODD (73 pp)
    // so the appended companion leaf makes 74.
    paperback: `${ROOT}/PHASE-1-BOOK/05-MYTHICAL-MONSTERS/OUTPUT/interior-main.pdf`,
  },
};
