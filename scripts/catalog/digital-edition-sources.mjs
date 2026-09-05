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
 * silently skipping when a path is absent — which is how the 2026-09-05 pass
 * found that SIX of these paths had gone stale: the book repositories were
 * reorganised into CODEX-SERIES/, GAMES-PUZZLE/, LANGUAGE-SERIES/ and
 * PHASE-1-BOOK/ after these lines were written, and nothing had re-cut a
 * digital edition since. Every path below was checked against the filesystem
 * on 2026-09-05.
 */
import { bookPath } from "../factory/book-dirs.mjs";

export const DIGITAL_EDITION_SOURCES = [
  {
    slug: "codex-bestiarium",
    printInterior: bookPath("CODEX-BESTIARIUM", "04_PRINT", "PAPERBACK", "CODEX_BESTIARIUM_INTERIOR_PAPERBACK.pdf"),
  },
  {
    slug: "codex-enigmatica",
    printInterior: bookPath("CODEX-ENIGMATICA", "08_OUTPUT", "PAPERBACK", "interior.pdf"),
  },
  {
    slug: "the-great-book-of-world-games",
    printInterior: bookPath("THE-GREAT-BOOK-OF-WORLD-GAMES", "08_OUTPUT", "PAPERBACK", "GreatBookOfWorldGames_interior_paperback.pdf"),
  },
  {
    slug: "the-great-book-of-world-myths",
    printInterior: bookPath("THE-GREAT-BOOK-OF-WORLD-MYTHS", "08_OUTPUT", "paperback", "interior.pdf"),
  },
  {
    // Valice Classics 2 (2026-09-02). The 6 × 9 print interior is already
    // small (scan-resolution figures), so the /ebook pass mostly normalises.
    slug: "the-puzzles-of-henry-dudeney",
    printInterior: bookPath("03-THE-PUZZLES-OF-HENRY-DUDENEY", "OUTPUT", "interior-main.pdf"),
    // The second delivered artifact. One purchase, both files: the worker
    // watermarks the PDF page by page and the EPUB by appending a licence
    // leaf and writing the same line into the package metadata.
    epub: bookPath("03-THE-PUZZLES-OF-HENRY-DUDENEY", "OUTPUT", "the-puzzles-of-henry-dudeney-main.epub"),
  },
  {
    // Valice Classics 8 (2026-09-05), Phase 2 book 1. The interior carries five
    // raster plates and nineteen rebuilt move tables, so the /ebook pass does
    // downsample rather than merely normalise.
    slug: "games-ancient-and-oriental",
    printInterior: bookPath("01-GAMES-ANCIENT-AND-ORIENTAL", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("01-GAMES-ANCIENT-AND-ORIENTAL", "OUTPUT", "games-ancient-and-oriental.epub"),
  },
  {
    // Valice Classics 9 (2026-09-05). Phase 2 book 2. Five diagram plates and one
    // rebuilt move table; no photographic matter, so the /ebook pass normalises
    // rather than downsamples.
    slug: "korean-games",
    printInterior: bookPath("02-KOREAN-GAMES", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("02-KOREAN-GAMES", "OUTPUT", "korean-games.epub"),
  },
  {
    // Valice Classics 10 (2026-09-05). Phase 2 book 3. Five diagram plates, no
    // photographic matter, so the /ebook pass normalises rather than downsamples.
    slug: "chess-and-playing-cards",
    printInterior: bookPath("03-CHESS-AND-PLAYING-CARDS", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("03-CHESS-AND-PLAYING-CARDS", "OUTPUT", "chess-and-playing-cards.epub"),
  },
  {
    // Valice Classics 11 (2026-09-05). Phase 2 book 4, and the only one of the five not
    // built from a scan. EBOOK ONLY: at 37 pages there is no paperback, so this
    // interior is not a print master — it IS the ebook's PDF.
    slug: "mancala",
    printInterior: bookPath("04-MANCALA", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("04-MANCALA", "OUTPUT", "mancala.epub"),
  },
  {
    // Valice Classics 3 (2026-09-04). Text-only 6 × 9 interior with no plates,
    // so the /ebook pass is a normalising pass rather than a downsampling one.
    slug: "epictetus-discourses-and-enchiridion",
    printInterior: bookPath("01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION", "OUTPUT", "epictetus-discourses-and-enchiridion.epub"),
  },
  {
    // Valice Classics 5 (2026-09-04). Volume one of two.
    slug: "myths-and-legends-of-china",
    printInterior: bookPath("03-MYTHS-AND-LEGENDS-OF-CHINA", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("03-MYTHS-AND-LEGENDS-OF-CHINA", "OUTPUT", "myths-and-legends-of-china.epub"),
  },
  {
    // Valice Classics 6 (2026-09-04). Volume one of four.
    slug: "indian-myth-and-legend",
    printInterior: bookPath("04-INDIAN-MYTH-AND-LEGEND", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("04-INDIAN-MYTH-AND-LEGEND", "OUTPUT", "indian-myth-and-legend.epub"),
  },
  {
    // Valice Classics 7 (2026-09-04). Volume one of three.
    slug: "mythical-monsters",
    printInterior: bookPath("05-MYTHICAL-MONSTERS", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("05-MYTHICAL-MONSTERS", "OUTPUT", "mythical-monsters.epub"),
  },
  {
    // Valice Script 2 (2026-09-04). The only workbook in this list, and the
    // reason it belongs here is the reason the Hangul workbook does not: a
    // PDF of a handwriting workbook is not a degraded copy of the paperback,
    // it is the format that lets a reader print page 31 twenty times instead
    // of once. The interior is vector at 0.4 MB, so the /ebook pass
    // normalises rather than downsamples.
    slug: "greek-alphabet-handwriting-workbook",
    printInterior: bookPath("02-GREEK-ALPHABET-HANDWRITING-WORKBOOK", "OUTPUT", "KDP", "PAPERBACK", "interior.pdf"),
    // Not the workbook as an ebook — a workbook's value is the empty box, and
    // an empty box cannot be written in on a screen. This is the other half:
    // a reflowable reference edition of the same material, 36 chapters with
    // the stroke diagrams as scalable SVG. One purchase, both files.
    epub: bookPath("02-GREEK-ALPHABET-HANDWRITING-WORKBOOK", "OUTPUT", "EBOOK", "greek-alphabet-reference.epub"),
  },
  {
    // Roadmap book 4 (2026-09-05). Two files, and neither is the other:
    // the print interior screen-normalised, which for a puzzle book is the
    // format that lets a reader print puzzle 63 twice, and a reflowable EPUB
    // whose grids are SVG and whose three hint passes are three documents.
    slug: "codex-mythologica-the-puzzle-book",
    printInterior: bookPath("04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK", "OUTPUT", "PAPERBACK", "interior.pdf"),
    epub: bookPath("04-CODEX-MYTHOLOGICA-THE-PUZZLE-BOOK", "OUTPUT", "EBOOK", "codex-mythologica-the-puzzle-book.epub"),
  },
  {
    // Valice Classics 4 (2026-09-04).
    slug: "seneca-selected-dialogues",
    printInterior: bookPath("02-SENECA-SELECTED-DIALOGUES", "OUTPUT", "interior-main.pdf"),
    epub: bookPath("02-SENECA-SELECTED-DIALOGUES", "OUTPUT", "seneca-selected-dialogues.epub"),
  },
];

/** R2 masters key for a slug. Versioned so a re-cut edition never overwrites. */
export const masterKey = (slug, version = "v1") =>
  `books/${slug}/master/${version}/master.pdf`;

/** R2 masters key for the EPUB of a slug. Same version folder as the PDF. */
export const epubMasterKey = (slug, version = "v1") =>
  `books/${slug}/master/${version}/master.epub`;
