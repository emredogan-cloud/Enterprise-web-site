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
    slug: "the-puzzles-of-henry-dudeney",
    source: `${BUILT}/the-puzzles-of-henry-dudeney.pdf`,
    // Part IV opens on the Haberdasher's puzzle with its figure; the next
    // page carries two more dissections. Statements only — no solutions.
    pages: [29, 30],
    note: "The Haberdasher's puzzle and two more dissections, in Dudeney's words with the original figures — puzzles only, no solutions.",
  },
  {
    slug: "the-great-book-of-world-myths",
    source: `${BUILT}/the-great-book-of-world-myths.pdf`,
    pages: [22, 25],
    note: "A full myth with its illustration, at the length a 9-year-old actually reads.",
  },
  {
    slug: "korean-hangul-handwriting-workbook",
    // The REMEDIATED interior of 2026-09-02, not the earlier build: this is
    // the file whose sources page reads "Korean Learner's Vocabulary List".
    //
    // 126pp, not the 124pp file this line used to name. Phase 5 APPENDED the
    // dedicated companion leaf, which renamed the old file to
    // `…_124pp.pre-companion.pdf` and left this path dangling — and because
    // build-previews.mjs used to drop a book from the manifest whenever its
    // source was missing, that silently deleted a live book's preview on the
    // next unrelated run. The path is corrected here and the builder now
    // keeps an already-rendered preview instead of dropping it.
    // The page range is unaffected: the leaf was appended after p.124.
    source: `${ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_126pp.pdf`,
    // Lesson 4 entire: the rule for where a letter goes inside the square,
    // the six words built from it, and both practice pages. It is the step
    // the book exists for, and the one a buyer wants to see done well before
    // paying for 124 pages of ruled boxes.
    pages: [13, 16],
    note: "Lesson 4 in full: where each letter goes inside the syllable block, six real words built from it, and the trace-then-write practice pages.",
  },
  {
    slug: "greek-alphabet-handwriting-workbook",
    source: `${ROOT}/GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/KDP/PAPERBACK/interior.pdf`,
    // Lesson 8, beta, as the spread is actually printed: teaching page on the
    // verso, practice on the recto. Beta is the deliberate choice rather than
    // the first letter — it is the letter the 1998 Travlos study found Greek
    // schoolchildren writing twenty-eight different ways, so it is where this
    // book's one real differentiator is visible: the stroke order is printed
    // WITH the note saying where it came from and that it is recommended, not
    // official. A buyer who is deciding between this and the other Greek
    // workbooks needs to see exactly that page.
    pages: [30, 31],
    note: "Lesson 8 as a full spread: beta taught stroke by stroke, then the trace-to-free practice page — with the provenance note that says where the stroke order came from.",
  },
  {
    slug: "epictetus-discourses-and-enchiridion",
    source: `${BUILT}/epictetus-discourses-and-enchiridion.pdf`,
    // Inside Part Two, where the head-notes are doing the work this edition is
    // bought for: a chapter title Long ran into his own prose, an editor's
    // orientation under it, and then Epictetus at full length.
    pages: [60, 63],
    note: "Two discourses with their head-notes — the apparatus and the text on the same page, which is what the edition is for.",
  },
  {
    slug: "mythical-monsters",
    source: `${BUILT}/mythical-monsters.pdf`,
    // The Register of Claims, which is the apparatus this volume exists for:
    // Gould's assertion, what is established, and an editorial reading.
    // Three pages, not four: at 74 pages this is the shortest book in the
    // series and the catalogue test caps a preview at 5% of the whole.
    pages: [55, 57],
    note: "The Register of Claims \u2014 six of Gould's assertions set beside what is actually established, with an editorial reading of each.",
  },
  {
    slug: "indian-myth-and-legend",
    source: `${BUILT}/indian-myth-and-legend.pdf`,
    // Inside chapter II, where the density of gods is highest and the editor's
    // chapter introduction is doing the work the volume is bought for.
    pages: [30, 33],
    note: "The great Vedic deities, with the editor's chapter introduction above them \u2014 the apparatus and the text on the same spread.",
  },
  {
    slug: "myths-and-legends-of-china",
    source: `${BUILT}/myths-and-legends-of-china.pdf`,
    // The chapter that makes the book's argument: the Ministry of Thunder, with
    // the editor's chapter introduction above it saying what to watch for, and
    // then Werner at full length.
    pages: [40, 43],
    note: "The Ministry of Thunder, opening with the editor's chapter introduction — the apparatus and the text on the same spread, which is what the edition is for.",
  },
  {
    slug: "seneca-selected-dialogues",
    source: `${BUILT}/seneca-selected-dialogues.pdf`,
    // On Peace of Mind opens with Serenus diagnosing himself and Seneca
    // answering; the argument-map lines sit under the chapter numbers Seneca
    // never wrote.
    pages: [45, 48],
    note: "The opening of On Peace of Mind, with the argument map that gives every unnumbered chapter a description Seneca never supplied.",
  },
  {
    slug: "the-myth-hunters-field-book",
    source: `${ROOT}/THE-MYTH-HUNTERS-FIELD-BOOK/08_OUTPUT/PAPERBACK/interior.pdf`,
    pages: [14, 17],
    note: "Two puzzle spreads as they are printed — deliberately without the answer key.",
  },
];
