/**
 * THE COMPANION PAGE — what a printed Valice book says to a reader who has
 * finished it, and where that reader goes next.
 *
 * ── WHY THIS FILE EXISTS ──────────────────────────────────────────────────
 * Until 2026-09-03 every printed book that mentioned valicepress.com did it
 * the same weak way: a line of text at the top of an otherwise blank page
 * (World Games p.160), a half-page note with a one-inch QR pushed into the
 * corner (World Myths p.233), a paragraph inside a grey box under two other
 * grey boxes (Hangul p.122), or a single line buried in the imprint on the
 * copyright page (Dudeney p.4). Each of those technically "carries the URL".
 * None of them is noticed by a reader holding the book.
 *
 * The bridge from Amazon to Valice Press is the only mechanism that converts
 * a customer Amazon owns into a reader we can reach again. If the reader does
 * not SEE it, it does not exist. So the house standard is now a **dedicated
 * page**: one destination per book, a QR that occupies a quarter of the page,
 * the address printed in type large enough to copy by hand, and a specific,
 * true list of what is waiting on the other side.
 *
 * ── THE RULES THIS FILE ENCODES ───────────────────────────────────────────
 *  1. One dedicated page. Not a paragraph, not a footer, not a box.
 *  2. The QR block is 25–35 % of the usable page height, in clear space, at
 *     full contrast, never over artwork. Drawn as vector, never rasterised.
 *  3. The human-readable address sits directly under the QR, large. A reader
 *     must never have to decode a QR to learn where it goes.
 *  4. The address is canonical: valicepress.com/... — never a preview host,
 *     never a shortener, never a tracking domain.
 *  5. No email wall, in the book or on the page it points at. The line
 *     "nothing to sign up for, no email asked" is printed, because it is true
 *     and because it is the reason a reader bothers.
 *  6. Every bullet names material that ACTUALLY EXISTS in
 *     `src/lib/companions.ts`. `companion-page.test.js` fails if a bullet
 *     names an asset the registry does not have.
 *  7. The page is set in the book's own fonts, at the book's own margins,
 *     with the book's own folio and the book's own spelling of the imprint.
 *     It should read as the last page of the book, not as an advertisement
 *     bound into it.
 *
 * ── PAGE-COUNT DISCIPLINE ─────────────────────────────────────────────────
 * `mode: "replace"` swaps a page that is blank or that already carries a weak
 * version of this message: the page count does not move and the covers at KDP
 * stay valid. `mode: "append"` adds a leaf: the page count moves, the spine
 * moves with it, and `spine-check.mjs` decides whether the cover must be
 * rebuilt. Neither mode is preferred on principle — the best book wins, and
 * the production package is recalculated around it.
 *
 * Consumed by `scripts/factory/build-companion-pages.mjs` (driver),
 * `scripts/factory/companion-page.py` (renderer) and
 * `scripts/factory/kdp-linkage-lint.mjs` (which checks the result).
 */

const BOOKS_ROOT = "/home/emre/Downloads/MY-DİGİTAL-BOOK";
const FONTS = "/usr/share/fonts/truetype";

/** The canonical host. Printed without a scheme; encoded in the QR with one. */
export const CANONICAL_HOST = "valicepress.com";

/** Copy that is identical in every book, because it is a house promise. */
export const HOUSE_COPY = {
  scanLine: "Scan the code, or type the address:",
  freeLine:
    "Free, and free of conditions: nothing to sign up for, no email asked, " +
    "no account needed.",
};

/**
 * Type. Each book is set from the fonts its own interior embeds — verified
 * with `pdffonts` against the built interior, not assumed. A page in a
 * different face announces itself as an insert.
 */
const TYPE = {
  liberationSerif: {
    regular: `${FONTS}/liberation/LiberationSerif-Regular.ttf`,
    bold: `${FONTS}/liberation/LiberationSerif-Bold.ttf`,
    italic: `${FONTS}/liberation/LiberationSerif-Italic.ttf`,
  },
  dejavuSerif: {
    regular: `${FONTS}/dejavu/DejaVuSerif.ttf`,
    bold: `${FONTS}/dejavu/DejaVuSerif-Bold.ttf`,
    italic: `${FONTS}/dejavu/DejaVuSerif-Italic.ttf`,
  },
  dejavuSans: {
    regular: `${FONTS}/dejavu/DejaVuSans.ttf`,
    bold: `${FONTS}/dejavu/DejaVuSans-Bold.ttf`,
    italic: `${FONTS}/dejavu/DejaVuSans-Oblique.ttf`,
  },
  /**
   * The workbook's page has to set three scripts at once: English, the
   * Hangul phrase 원고지, and the â and ç of "Vâliçe Press". IBM Plex Sans KR
   * sets the book's headings but has neither â nor ç, and Noto Sans has no
   * Hangul — the renderer's cmap check refuses both, which is the whole point
   * of that check (the NotoSans-Bold incident of 2026-09-03, where a rebuild
   * dropped the imprint's glyphs and only `pdffonts` noticed). Noto Sans KR
   * covers all three and is already embedded in this interior.
   */
  notoKR: {
    regular: `${BOOKS_ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/03_VISUAL/fonts/NotoSansKR-Regular.ttf`,
    bold: `${BOOKS_ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/03_VISUAL/fonts/NotoSansKR-Bold.ttf`,
    italic: `${BOOKS_ROOT}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/03_VISUAL/fonts/NotoSansKR-Regular.ttf`,
  },
  codexBestiarium: {
    regular: `${BOOKS_ROOT}/CODEX_BESTIARIUM/07_ASSETS/fonts/static/garamond-400.ttf`,
    bold: `${BOOKS_ROOT}/CODEX_BESTIARIUM/07_ASSETS/fonts/static/cinzel-500.ttf`,
    italic: `${BOOKS_ROOT}/CODEX_BESTIARIUM/07_ASSETS/fonts/static/garamond-italic-400.ttf`,
    display: `${BOOKS_ROOT}/CODEX_BESTIARIUM/07_ASSETS/fonts/static/cinzel-400.ttf`,
  },
  codexMythologica: {
    regular: `${BOOKS_ROOT}/CODEX_MYTHOLOGICA/07_ASSETS/fonts/static/garamond-400.ttf`,
    bold: `${BOOKS_ROOT}/CODEX_MYTHOLOGICA/07_ASSETS/fonts/static/cinzel-500.ttf`,
    italic: `${BOOKS_ROOT}/CODEX_MYTHOLOGICA/07_ASSETS/fonts/static/garamond-italic-400.ttf`,
    display: `${BOOKS_ROOT}/CODEX_MYTHOLOGICA/07_ASSETS/fonts/static/cinzel-400.ttf`,
  },
};

/**
 * What each book's page says. Every bullet's `asset` is the `id` of a real
 * entry in `src/lib/companions.ts`; the test asserts it resolves. The prose
 * is written for a reader holding the printed book, not for a web page.
 */
export const COMPANION_PAGE_COPY = {
  "the-great-book-of-world-games": {
    companionSlug: "world-games",
    imprint: "Vâliçe Press",
    headline: "The boards, the cards and the\nscore sheets — free to print",
    promise:
      "Everything in this book that works better on loose paper than bound " +
      "into a spine is waiting for you online, at full playing size, free to " +
      "print as often as you like.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "boards-pack", term: "Thirty-one boards", gloss: "drawn from this book's own diagrams, one to a page and scaled to fill a sheet" },
      { asset: "quick-reference-cards", term: "Fifty-six cut-out cards", gloss: "players, time, age, materials, objective, and the page with the full rules" },
      { asset: "score-sheets", term: "Score sheets", gloss: "a grid for two to six players, a match record, and tallies for the games that count" },
      { asset: "game-index", term: "The index of games", gloss: "all fifty-six on three pages, by family, region and number of players" },
    ],
  },

  "the-great-book-of-world-myths": {
    companionSlug: "world-myths",
    imprint: "Vâliçe Press",
    headline: "The map at full size, and\neverything else worth printing",
    promise:
      "The twenty-two-culture map from the opening pages is free to print on " +
      "one sheet, with the same numbered key — and so is the rest of this " +
      "book's back matter.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "world-map", term: "The world map, full size", gloss: "the book's own hand-drawn map on one sheet, key and markers unchanged" },
      { asset: "culture-cards", term: "Twenty-two culture cards", gloss: "who tells each culture's stories, where they are set, and what survives today" },
      { asset: "say-these-names", term: "Say these names", gloss: "every pronunciation in the book in one alphabetical list, stress marked" },
      { asset: "whos-who", term: "Who's who", gloss: "every god, hero, monster and mortal, with the story and page to find them" },
    ],
  },

  "korean-hangul-handwriting-workbook": {
    companionSlug: "hangul",
    imprint: "Vâliçe Press",
    headline: "Keep practising after the last\nbox in this book is full",
    promise:
      "Handwriting is a volume exercise, and a workbook runs out of empty " +
      "boxes long before your hand is sure. These sheets do not run out.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "practice-grid", term: "Practice grids", gloss: "blank 원고지-style squares with faint quarter-guides, for any lesson at any stage" },
      { asset: "stroke-boxes", term: "Stroke-order boxes", gloss: "larger boxes with a dotted start-corner marker, twelve to a row" },
      { asset: "lesson-tracker", term: "Thirty-lesson tracker", gloss: "one page, three boxes a lesson — trace, dot-start, empty box" },
    ],
  },

  "the-puzzles-of-henry-dudeney": {
    companionSlug: "dudeney",
    imprint: "Valice Press",
    headline: "Twelve puzzles to work on paper,\nand a hint for every one of the 110",
    promise:
      "Dudeney's puzzles were made to be worked with a pencil. These sheets " +
      "give you the room this page cannot, in his own words and with his own " +
      "figures.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "puzzle-sheets", term: "Twelve puzzle sheets", gloss: "one puzzle to a page, the original figure, and room to work. No answers on the sheet" },
      { asset: "hints", term: "A hints booklet", gloss: "one hint for every one of the 110 puzzles. A hint says where to look; it never gives the answer" },
    ],
  },

  "the-myth-hunters-field-book": {
    companionSlug: "myth-hunters-field-book",
    imprint: "Vâliçe Press",
    headline: "Spare sheets for the expedition",
    promise:
      "A field book gets written in, and some pages you will want twice. " +
      "These are free to print as many times as the expedition needs.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "quest-log", term: "The quest log", gloss: "the whole route on six sheets: every page in book order with its task and its stamp" },
      { asset: "culture-cards", term: "Twenty-two culture cards", gloss: "one per people the route meets, in route order" },
      { asset: "field-researcher-certificate", term: "A spare certificate", gloss: "a clean copy of the Field Researcher certificate from the back of this book" },
    ],
  },

  "codex-bestiarium": {
    companionSlug: "codex-bestiarium",
    imprint: "Vâliçe Press",
    headline: "This book's four indexes,\nprintable",
    promise:
      "A reference book earns a reference sheet. All four of this volume's " +
      "indexes are free to print, with the page numbers of this edition.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "motif-index", term: "The motif index", gloss: "every Thompson motif code this book cites, in index order, with its creatures" },
      { asset: "creature-index", term: "The creature index", gloss: "all 112 creatures alphabetically — how to say the name, its class, its tradition, its page" },
      { asset: "kin-chart", term: "The kin chart", gloss: "the eight families: one image told by several traditions that never met" },
      { asset: "traditions-index", term: "The traditions index", gloss: "the forty traditions with their creatures, each creature's class and page" },
    ],
  },

  "codex-mythologica": {
    companionSlug: "codex-mythologica",
    imprint: "Vâliçe Press",
    headline: "A reading companion for the\nnineteen traditions",
    promise:
      "Seventy-six myths is a great many to hold in the head at once. These " +
      "two sheets are the map of them, free to print.",
    listHeading: "WHAT IS WAITING FOR YOU",
    bullets: [
      { asset: "reading-companion", term: "The reading companion", gloss: "the nineteen traditions in the book's order, each with its epoch and every myth" },
      { asset: "theme-index", term: "The theme index", gloss: "the seventy-six myths re-sorted by theme, most-shared first, with their pages" },
    ],
  },

  /**
   * Enigmatica has no companion and needs none: its bridge is the
   * verification page, which checks the one answer that is written nowhere in
   * the book. That page already existed and already printed its address — it
   * simply had no code and no presence. This entry rebuilds it to the house
   * standard rather than adding a second, competing destination.
   */
  "codex-enigmatica": {
    companionSlug: null,
    destinationPath: "/codex-enigmatica/verify",
    imprint: "Vâliçe Press",
    headline: "The verification page",
    promise:
      "The last question's answer is written nowhere in this book. When you " +
      "have it, this is where you enter it.",
    listHeading: "WHAT IT DOES, AND DOES NOT DO",
    bullets: [
      { asset: null, term: "It levels case, spacing and punctuation", gloss: "before it compares. Only the letters matter" },
      { asset: null, term: "It asks you for nothing else", gloss: "no name, no address, no account — and it keeps no record of who you are" },
      { asset: null, term: "The hundred answers are not there", gloss: "those are in the back matter of this book, to read at your own pace" },
    ],
    freeLineOverride:
      "Free, and free of conditions: nothing to sign up for, no email asked, " +
      "no account needed.",
  },
};

/**
 * Per-edition production plan.
 *
 * `mode`      replace | append
 * `page`      1-based PDF page to replace (replace mode only)
 * `folio`     how this book prints a page number: null when it prints none.
 *             `offset` is printedFolio − pdfPage, measured from the built
 *             file, because Bestiarium and Mythologica both carry front
 *             matter that is not counted.
 * `recto`     true when the new page falls on a right-hand page; decides
 *             which outer margin a shoulder folio hangs on.
 * `hold`      why this edition's file must not be uploaded yet, when that is
 *             the case. A hold is a business decision, never "not built" —
 *             every file below is produced.
 */
export const COMPANION_PAGE_PLAN = {
  "the-great-book-of-world-games": {
    style: { fonts: TYPE.liberationSerif, marginIn: 0.62, rule: 0.7 },
    editions: {
      paperback: {
        mode: "replace", page: 160, pagesBefore: 160, pagesAfter: 160, recto: false,
        folio: { style: "outer", offset: 0, size: 8.6, baselineFromBottomPt: 22.95, outerMarginPt: 36 },
        replacing: "the weak companion note of 2026-09-02 — a text block at the top of an otherwise empty page, no code",
      },
      hardcover: {
        mode: "replace", page: 160, pagesBefore: 160, pagesAfter: 160, recto: false,
        folio: { style: "outer", offset: 0, size: 8.6, baselineFromBottomPt: 22.95, outerMarginPt: 36 },
        replacing: "the weak companion note of 2026-09-02 — a text block at the top of an otherwise empty page, no code",
      },
      large_print: {
        mode: "append", page: null, pagesBefore: 232, pagesAfter: 233, recto: false,
        folio: { style: "outer", offset: 0, size: 8.6, baselineFromBottomPt: 22.95, outerMarginPt: 36 },
        replacing: null,
        hold: "IN KDP REVIEW since 2026-09-02, and the cover cannot be rebuilt from here. The block moves 232 → 233 pages, so the wrap needs a new spine — but this project's cover pipeline reads `06_REPORTS/interior-largeprint.json`, which has recorded 234 pages since before this phase while the built block was 232 (a pre-existing divergence, reported as a finding). Only re-running `04_BUILD/interior.py` regenerates that report and its pagemap. So: at the first revision after this edition goes live, run interior.py → covers.py, and take the companion page through the pipeline's own companion block rather than as a splice. The invented biography, which was the other defect, is already fixed and is page-neutral.",
      },
    },
  },

  "the-great-book-of-world-myths": {
    style: { fonts: TYPE.liberationSerif, marginIn: 0.75, rule: 0.7 },
    editions: {
      paperback: {
        mode: "replace", page: 233, pagesBefore: 234, pagesAfter: 234, recto: true,
        folio: { style: "center", offset: 0, size: 8.2, baselineFromBottomPt: 30.06, gutterShiftPt: 4.5 },
        replacing: "the half-page 'THE MAP, FULL SIZE' note of 2026-09-03 — a one-inch code low on the page with a caption beside it",
      },
      hardcover: {
        mode: "replace", page: 233, pagesBefore: 234, pagesAfter: 234, recto: true,
        folio: { style: "center", offset: 0, size: 8.2, baselineFromBottomPt: 30.06, gutterShiftPt: 4.5 },
        replacing: "the half-page 'THE MAP, FULL SIZE' note of 2026-09-03 — a one-inch code low on the page with a caption beside it",
      },
    },
  },

  "korean-hangul-handwriting-workbook": {
    style: { fonts: TYPE.notoKR, marginIn: 0.75, rule: 0.7, sans: true },
    editions: {
      paperback: {
        mode: "append", page: null, pagesBefore: 124, pagesAfter: 126, recto: true,
        folio: { style: "center", offset: 0, size: 8, baselineFromBottomPt: 19.04, gutterShiftPt: 2.7 },
        replacing: "the grey box at the foot of p.122, which was the fourth thing on that page",
        trailingBlank: true,
      },
      hardcover: {
        mode: "append", page: null, pagesBefore: 124, pagesAfter: 126, recto: true,
        folio: { style: "center", offset: 0, size: 8, baselineFromBottomPt: 19.04, gutterShiftPt: 2.7 },
        replacing: "the grey box at the foot of p.122, which was the fourth thing on that page",
        trailingBlank: true,
        hold: "In KDP review, and its wrap geometry is not derivable here. This project records the hardcover wrap as a value the Founder read out of KDP's own Cover Calculator (`project_config.json → formats.hardcover.kdp_calculator`), pinned and independent of page count — so re-running the builder at 126 pages reproduces the 124-page wrap rather than a new one. The house standard says a hardcover wrap is read from the calculator and never derived, so this one needs five minutes in the calculator at 126 pp / 8.25 × 11 / white before it can be rebuilt. The paperback has no such dependency and its cover was rebuilt.",
      },
    },
  },

  "the-puzzles-of-henry-dudeney": {
    style: { fonts: TYPE.liberationSerif, marginIn: 0.66, rule: 0.7 },
    editions: {
      paperback: {
        mode: "replace", page: 144, pagesBefore: 144, pagesAfter: 144, recto: false,
        folio: { style: "outer", offset: 0, size: 8.6, baselineFromBottomPt: 26.35, outerMarginPt: 39.6 },
        replacing: "an empty page carrying only a running head; the book's single companion mention was one line inside the imprint on p.4",
      },
    },
  },

  "the-myth-hunters-field-book": {
    style: { fonts: TYPE.dejavuSans, marginIn: 0.7, rule: 0.8, sans: true },
    editions: {
      paperback: {
        mode: "replace", page: 156, pagesBefore: 156, pagesAfter: 156, recto: false,
        folio: null,
        replacing: "the second of two identical ruled 'Field Notes' pages — the reader keeps one and gains a destination",
      },
    },
  },

  "codex-enigmatica": {
    style: { fonts: TYPE.dejavuSerif, marginIn: 0.8, rule: 0.7 },
    editions: {
      paperback: {
        mode: "replace", page: 274, pagesBefore: 274, pagesAfter: 274, recto: false,
        folio: { style: "center", offset: 0, size: 8, baselineFromBottomPt: 25.44 },
        replacing: "the existing verification page, which printed the address in body type and carried no code",
      },
      hardcover: {
        mode: "replace", page: 276, pagesBefore: 276, pagesAfter: 276, recto: false,
        folio: { style: "center", offset: 0, size: 8, baselineFromBottomPt: 25.44 },
        replacing: "an empty final leaf; the hardcover's verification page is p.275 and stays as it is",
      },
    },
  },

  "codex-bestiarium": {
    style: { fonts: TYPE.codexBestiarium, marginIn: 0.8, rule: 0.6, codex: true, urlFace: "regular" },
    editions: {
      paperback: {
        mode: "append", page: null, pagesBefore: 435, pagesAfter: 436, recto: false,
        folio: { style: "center", offset: -9, size: 9, baselineFromBottomPt: 25.34 },
        replacing: null,
        hold: "Four live listings whose 'Legendary Creatures' count still reads 120 and must read 112 (handbook O4). That correction needs a KDP visit for every edition anyway; this interior and its rebuilt cover ride along with it, one review cycle instead of two.",
      },
      hardcover: {
        mode: "append", page: null, pagesBefore: 435, pagesAfter: 436, recto: false,
        folio: { style: "center", offset: -9, size: 9, baselineFromBottomPt: 25.34 },
        replacing: null,
        hold: "Four live listings whose 'Legendary Creatures' count still reads 120 and must read 112 (handbook O4). That correction needs a KDP visit for every edition anyway; this interior and its rebuilt cover ride along with it, one review cycle instead of two.",
      },
      large_print: {
        mode: "append", page: null, pagesBefore: 599, pagesAfter: 600, recto: false,
        folio: { style: "center", offset: -11, size: 10, baselineFromBottomPt: 22.33 },
        replacing: null,
        hold: "Four live listings whose 'Legendary Creatures' count still reads 120 and must read 112 (handbook O4). That correction needs a KDP visit for every edition anyway; this interior and its rebuilt cover ride along with it, one review cycle instead of two.",
      },
    },
  },

  "codex-mythologica": {
    style: { fonts: TYPE.codexMythologica, marginIn: 0.8, rule: 0.6, codex: true, urlFace: "regular" },
    editions: {
      paperback: {
        mode: "append", page: null, pagesBefore: 329, pagesAfter: 330, recto: false,
        folio: { style: "center", offset: -14, size: 9, baselineFromBottomPt: 25.34 },
        replacing: null,
        hold: "KDP Select runs to 2026-11-03 (handbook O5). On that date the interiors are reopened anyway so the ebook can be sold here; these files go up in the same pass. Pulling three live editions before then buys nothing.",
      },
      hardcover: {
        mode: "append", page: null, pagesBefore: 329, pagesAfter: 330, recto: false,
        folio: { style: "center", offset: -14, size: 9, baselineFromBottomPt: 25.34 },
        replacing: null,
        hold: "KDP Select runs to 2026-11-03 (handbook O5). On that date the interiors are reopened anyway so the ebook can be sold here; these files go up in the same pass. Pulling three live editions before then buys nothing.",
      },
      large_print: {
        mode: "append", page: null, pagesBefore: 578, pagesAfter: 579, recto: false,
        folio: { style: "center", offset: -20, size: 10, baselineFromBottomPt: 22.33 },
        replacing: null,
        hold: "KDP Select runs to 2026-11-03 (handbook O5). On that date the interiors are reopened anyway so the ebook can be sold here; these files go up in the same pass. Pulling three live editions before then buys nothing.",
      },
    },
  },
};

/** The address a reader types. Never carries a scheme; never carries a tag. */
export function printedUrl(bookSlug) {
  const copy = COMPANION_PAGE_COPY[bookSlug];
  if (!copy) throw new Error(`no companion page copy for ${bookSlug}`);
  const path = copy.destinationPath ?? `/companion/${copy.companionSlug}`;
  return `${CANONICAL_HOST}${path}`;
}

/** What the QR encodes. Always with the scheme, so every scanner opens it. */
export function qrUrl(bookSlug) {
  return `https://${printedUrl(bookSlug)}`;
}

/** Every edition in the plan, flattened, in a stable order. */
export function editions() {
  const out = [];
  for (const [bookSlug, book] of Object.entries(COMPANION_PAGE_PLAN)) {
    for (const [format, edition] of Object.entries(book.editions)) {
      out.push({ bookSlug, format, style: book.style, ...edition });
    }
  }
  return out;
}
