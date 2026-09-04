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
    // The second delivered artifact. One purchase, both files: the worker
    // watermarks the PDF page by page and the EPUB by appending a licence
    // leaf and writing the same line into the package metadata.
    epub: `${ROOT}/THE-PUZZLES-OF-HENRY-DUDENEY/OUTPUT/the-puzzles-of-henry-dudeney-main.epub`,
  },
  {
    // Valice Classics 3 (2026-09-04). Text-only 6 × 9 interior with no plates,
    // so the /ebook pass is a normalising pass rather than a downsampling one.
    slug: "epictetus-discourses-and-enchiridion",
    printInterior: `${ROOT}/EPICTETUS-DISCOURSES-AND-ENCHIRIDION/OUTPUT/interior-main.pdf`,
    epub: `${ROOT}/EPICTETUS-DISCOURSES-AND-ENCHIRIDION/OUTPUT/epictetus-discourses-and-enchiridion.epub`,
  },
  {
    // Valice Classics 5 (2026-09-04). Volume one of two.
    slug: "myths-and-legends-of-china",
    printInterior: `${ROOT}/MYTHS-AND-LEGENDS-OF-CHINA/OUTPUT/interior-main.pdf`,
    epub: `${ROOT}/MYTHS-AND-LEGENDS-OF-CHINA/OUTPUT/myths-and-legends-of-china.epub`,
  },
  {
    // Valice Script 2 (2026-09-04). The only workbook in this list, and the
    // reason it belongs here is the reason the Hangul workbook does not: a
    // PDF of a handwriting workbook is not a degraded copy of the paperback,
    // it is the format that lets a reader print page 31 twenty times instead
    // of once. The interior is vector at 0.4 MB, so the /ebook pass
    // normalises rather than downsamples.
    slug: "greek-alphabet-handwriting-workbook",
    printInterior: `${ROOT}/GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/KDP/PAPERBACK/interior.pdf`,
    // Not the workbook as an ebook — a workbook's value is the empty box, and
    // an empty box cannot be written in on a screen. This is the other half:
    // a reflowable reference edition of the same material, 36 chapters with
    // the stroke diagrams as scalable SVG. One purchase, both files.
    epub: `${ROOT}/GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/EBOOK/greek-alphabet-reference.epub`,
  },
  {
    // Valice Classics 4 (2026-09-04).
    slug: "seneca-selected-dialogues",
    printInterior: `${ROOT}/SENECA-SELECTED-DIALOGUES/OUTPUT/interior-main.pdf`,
    epub: `${ROOT}/SENECA-SELECTED-DIALOGUES/OUTPUT/seneca-selected-dialogues.epub`,
  },
];

/** R2 masters key for a slug. Versioned so a re-cut edition never overwrites. */
export const masterKey = (slug, version = "v1") =>
  `books/${slug}/master/${version}/master.pdf`;

/** R2 masters key for the EPUB of a slug. Same version folder as the PDF. */
export const epubMasterKey = (slug, version = "v1") =>
  `books/${slug}/master/${version}/master.epub`;
