/**
 * Which real pages of each book the storefront shows as its preview.
 *
 * WHAT THIS REPLACES
 * Every book page on this site used to render the same invented sample
 * prose — a first-person passage about buying a DRM'd ebook — under the
 * heading "A taste of the writing / Read the opening pages before you buy".
 * It was a placeholder that shipped. On `/books/meditations` it presented
 * modern invented text as an excerpt from Marcus Aurelius.
 *
 * The replacement is not better invented text. It is the actual pages,
 * rendered as images from the same PDF the buyer receives. For a bestiary,
 * a puzzle book and a workbook, an image is also the only honest preview:
 * their pages are plates, grids and diagrams, and a text extraction of them
 * is not what the reader would be buying.
 *
 * CHOOSING THE RANGE
 * Front matter is skipped — a title page and a copyright notice tell a
 * reader nothing about whether they want the book. Each range starts where
 * the book's actual work starts and covers a contiguous run, so the reader
 * sees how a real spread is built rather than four cherry-picked highlights.
 * Every range was read before it was chosen.
 *
 * HOW MUCH
 * Four pages each, out of 148–435. Enough to judge the typography, the
 * illustration standard and the voice; far short of the ~5% that would make
 * the preview a substitute for the book. The Myth Hunter's Field Book gets
 * puzzle pages WITHOUT their answer key, which is printed elsewhere.
 */

const ROOT = "/home/emre/Downloads/MY-DİGİTAL-BOOK";
const BUILT = "scripts/tmp/digital-editions";

export const PREVIEW_PAGES = [
  {
    slug: "meditations",
    // Fetched from R2 — this book has no source project on disk; the master
    // in the bucket is the only copy.
    source: `${BUILT}/meditations.pdf`,
    pages: [21, 24],
    note: "Book Two, mid-argument — Long's prose doing the thing it is bought for.",
  },
  {
    slug: "codex-mythologica",
    source: `${ROOT}/CODEX_MYTHOLOGICA/04_PRINT/PAPERBACK/CODEX_MYTHOLOGICA_INTERIOR_PAPERBACK.pdf`,
    pages: [24, 27],
    note: "Inside the Greek sequence, mid-retelling, at full narrative length.",
  },
  {
    slug: "codex-bestiarium",
    source: `${BUILT}/codex-bestiarium.pdf`,
    pages: [39, 42],
    note: "Two complete creature entries with their line-engraved plates.",
  },
  {
    slug: "codex-enigmatica",
    source: `${BUILT}/codex-enigmatica.pdf`,
    pages: [24, 27],
    note: "The first gate's opening puzzles — clues, constraints and answer form, no solutions.",
  },
  {
    slug: "the-great-book-of-world-games",
    source: `${BUILT}/the-great-book-of-world-games.pdf`,
    pages: [16, 19],
    note: "A complete game entry: provenance, rules and the board diagram you play from.",
  },
  {
    slug: "the-great-book-of-world-myths",
    source: `${BUILT}/the-great-book-of-world-myths.pdf`,
    pages: [22, 25],
    note: "A full myth with its illustration, at the length a 9-year-old actually reads.",
  },
  {
    slug: "the-myth-hunters-field-book",
    source: `${ROOT}/THE-MYTH-HUNTERS-FIELD-BOOK/08_OUTPUT/PAPERBACK/interior.pdf`,
    pages: [14, 17],
    note: "Two puzzle spreads as they are printed — deliberately without the answer key.",
  },
];
