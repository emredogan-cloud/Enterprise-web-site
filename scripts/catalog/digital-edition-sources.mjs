/**
 * Where each direct-sale digital edition comes from.
 *
 * Only titles that Valice Press may actually sell from its own store appear
 * here. Two are deliberately absent and the reason is recorded rather than
 * implied:
 *
 *   codex-mythologica            — the Kindle edition is enrolled in KDP
 *                                  Select (verified on the KDP bookshelf,
 *                                  2026-08-31). Select is exclusive: while
 *                                  enrolled, the digital edition may not be
 *                                  sold anywhere else, including here.
 *   korean-hangul-…-workbook     — unresolved CC BY-NC dictionary source
 *                                  (A7/S-0019). Non-commercial licensing
 *                                  blocks sale in every channel, not just
 *                                  Amazon's.
 *   the-myth-hunters-field-book  — no ebook exists by design. It is a
 *                                  write-in activity book.
 *
 * `printInterior` points into the book production repositories, which are
 * NOT part of this repository. The build script fails loudly rather than
 * silently skipping when a path is absent.
 */

const ROOT = "/home/emre/Downloads/MY-DİGİTAL-BOOK";

export const DIGITAL_EDITION_SOURCES = [
  {
    slug: "codex-bestiarium",
    printInterior: `${ROOT}/CODEX_BESTIARIUM/04_PRINT/PAPERBACK/CODEX_BESTIARIUM_INTERIOR_PAPERBACK.pdf`,
  },
  {
    slug: "codex-enigmatica",
    printInterior: `${ROOT}/CODEX-ENIGMATICA/08_OUTPUT/PAPERBACK/interior.pdf`,
  },
  {
    slug: "the-great-book-of-world-games",
    printInterior: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/PAPERBACK/GreatBookOfWorldGames_interior_paperback.pdf`,
  },
  {
    slug: "the-great-book-of-world-myths",
    printInterior: `${ROOT}/THE-GREAT-BOOK-OF-WORLD-MYTHS/08_OUTPUT/paperback/interior.pdf`,
  },
  {
    // Valice Classics 2 (2026-09-02). The 6 × 9 print interior is already
    // small (scan-resolution figures), so the /ebook pass mostly normalises.
    slug: "the-puzzles-of-henry-dudeney",
    printInterior: `${ROOT}/THE-PUZZLES-OF-HENRY-DUDENEY/OUTPUT/interior-main.pdf`,
  },
];

/** R2 masters key for a slug. Versioned so a re-cut edition never overwrites. */
export const masterKey = (slug, version = "v1") =>
  `books/${slug}/master/${version}/master.pdf`;
