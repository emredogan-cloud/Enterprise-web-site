/**
 * Digital companions — the bridge from a printed book to an owned reader.
 *
 * A companion is a free web page whose address is printed inside a physical
 * book (as a short URL and a QR code). It carries material that genuinely
 * belongs off the page — practice sheets a reader will reprint, a tracker,
 * reference tables — and it is the ONLY mechanism that turns an Amazon buyer,
 * whom Amazon owns, into a Valice reader, whom we do.
 *
 * ── THE RULE THAT SHAPES THIS FILE ────────────────────────────────────────
 * A QR code printed in a paperback is permanent. It cannot be edited, and it
 * will be scanned years after the edition it appears in has changed, been
 * repriced, or been withdrawn. Therefore:
 *
 *   **A companion route must never 404, and must never depend on the book
 *   being on sale.**
 *
 * Every companion resolves to a real page in every state — before the book is
 * listed, while it is in review, after it is live, and after it has been
 * withdrawn. What changes is the `state` below, which controls what the page
 * says about buying, never whether the page exists. A reader who scans a code
 * and lands on a 404 has been told the publisher is unreliable, and that is a
 * far more expensive outcome than a page that says "not on sale yet".
 *
 * ── CONSENT ───────────────────────────────────────────────────────────────
 * Every companion asset is free and ungated. The email field is genuinely
 * optional and is never a condition of access: the download links work
 * whether or not anyone subscribes. This is deliberate. Gating a promised
 * bonus behind an address is the dark pattern the strategy explicitly
 * rejects, and it also converts worse than the honest version — a reader who
 * subscribes after finding the material useful is worth more than one who
 * subscribed to get past a wall.
 *
 * We also never imply Amazon shared anything. The reader typed the URL or
 * scanned the code themselves; that is the only relationship that exists.
 */

import type { CompanionNewsletterSource } from "@/lib/newsletter-client";

/**
 * Where a companion is in its lifecycle. This mirrors the book's real
 * commercial state and is the single field a founder edits when that changes.
 */
export type CompanionState =
  /** Book is on sale somewhere; show buying options. */
  | "book-available"
  /** Book is submitted/in review or otherwise not yet purchasable anywhere. */
  | "book-not-yet-available"
  /** Book has been withdrawn. Material stays up for existing owners. */
  | "book-withdrawn";

export type CompanionAsset = {
  /** Stable id — also the download route segment. */
  id: string;
  title: string;
  /** What it is and why a reader would want it. No marketing adjectives. */
  description: string;
  /** `generated` assets are produced by a route; `static` live in /public. */
  kind: "generated" | "static";
  /** Href to fetch it. */
  href: string;
  /** Shown next to the link so nobody downloads a surprise. */
  meta: string;
};

export type Companion = {
  slug: string;
  /** Slug of the book in the `books` table this companion belongs to. */
  bookSlug: string;
  bookTitle: string;
  state: CompanionState;
  /**
   * Why the state is what it is. Rendered to the reader in plain language
   * when the book is not purchasable — an honest sentence beats silence.
   */
  stateNote: string;
  /** One line, printed under the heading. */
  intro: string;
  /** The newsletter tag this page's signups carry. */
  newsletterSource: CompanionNewsletterSource;
  /** Heading over the download list; defaults to "Practice material". */
  assetsHeading?: string;
  assets: CompanionAsset[];
  /**
   * Rights position for the companion's OWN content, tracked separately from
   * the book's. A companion can be clean while its book is not.
   */
  rightsNote: string;
};

/**
 * ── KOREAN HANGUL HANDWRITING WORKBOOK ────────────────────────────────────
 *
 * Until 2026-09-02 the book carried an unresolved licensing question on the
 * dictionary sources behind its 97 vocabulary words (CC BY-SA / CC BY-NC).
 * That was remediated on 2026-09-02: the sources were withdrawn, every word
 * re-verified against the National Institute of Korean Language's learner
 * vocabulary list (KOGL Type 1), and every gloss rewritten — see the book
 * project's RIGHTS.md. The Founder's Gate 2 sign-off and the KDP file
 * replacement are still pending, so the book is not on sale yet.
 *
 * This companion was built to be independent of the old sources and stays
 * that way: it contains no vocabulary list and no dictionary-derived
 * material. Its assets are:
 *   - practice grids, which are our own geometry and carry no third-party
 *     rights at all;
 *   - a lesson tracker, which is a checklist of the book's own structure;
 *   - a jamo reference using Revised Romanization, the South Korean
 *     government's official public romanization standard, not a dictionary.
 *
 * That separation is the point: the companion can go live and start building
 * the list while the book's rights question is still being resolved.
 */
const HANGUL: Companion = {
  slug: "hangul",
  bookSlug: "korean-hangul-handwriting-workbook",
  bookTitle: "Korean Hangul Handwriting Workbook",
  // The paperback is live on Amazon (B0HHHWXGG4, found and verified
  // 2026-09-02). The direct ebook still waits on the Founder's Gate 2
  // signature, so the book page — not this note — is where the formats live.
  state: "book-available",
  stateNote:
    "The workbook is on sale as a paperback on Amazon. Everything on this " +
    "page is free and works on its own — you do not need the book to use it.",
  intro:
    "Free practice material for learning to write Hangul by hand. Reprint the " +
    "grids as often as you like; handwriting is a volume exercise.",
  newsletterSource: "hangul-companion",
  rightsNote:
    "Everything on this page is Valice Press's own work. The practice grids " +
    "are generated geometry. Romanization follows Revised Romanization, the " +
    "official South Korean standard.",
  assets: [
    {
      id: "practice-grid",
      title: "Hangul practice grid (원고지 style)",
      description:
        "Square writing grid with faint quarter-guides, the standard shape for " +
        "practising syllable blocks. Blank, so it works for any lesson and at " +
        "any stage. Print it as many times as you need.",
      kind: "generated",
      href: "/companion/hangul/sheets/practice-grid.pdf",
      meta: "PDF · US Letter · 4 pages",
    },
    {
      id: "stroke-boxes",
      title: "Stroke-order practice boxes",
      description:
        "Larger boxes with a dotted start-corner marker, for drilling a single " +
        "letter until the stroke order is automatic. Twelve boxes per row.",
      kind: "generated",
      href: "/companion/hangul/sheets/stroke-boxes.pdf",
      meta: "PDF · US Letter · 2 pages",
    },
    {
      id: "lesson-tracker",
      title: "Thirty-lesson progress tracker",
      description:
        "One page listing all thirty lessons with a box for each of the three " +
        "passes the book asks for — trace, dot-start, empty box. Pin it up and " +
        "mark it off; it is the only honest way to see whether you are actually " +
        "practising or just re-reading.",
      kind: "generated",
      href: "/companion/hangul/sheets/lesson-tracker.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── THE GREAT BOOK OF WORLD GAMES ─────────────────────────────────────────
 *
 * The book is live on Amazon (paperback, hardcover, Kindle) and sold here as
 * a direct ebook, so the page shows buying options. Every file is generated
 * by the book project's own `04_BUILD/companion_pack.py` from the manuscript
 * data — the index, the cards and the score sheets restate what the printed
 * book says (players, time, age, materials, objective, page), and the boards
 * are the book's own vector diagrams scaled to a Letter sheet. Nothing here
 * reveals a game's full rules; the book stays the product.
 *
 * Files live in /public/companion/world-games/ and are regenerated, never
 * hand-edited. The manifest next to them carries the measured page counts.
 */
const WORLD_GAMES: Companion = {
  slug: "world-games",
  bookSlug: "the-great-book-of-world-games",
  bookTitle: "The Great Book of World Games",
  state: "book-available",
  stateNote:
    "The book is on sale: paperback, hardcover and Kindle on Amazon, and a " +
    "DRM-free PDF here. Everything on this page is free either way.",
  intro:
    "Free table-side material for the book: a one-glance index of all fifty-six " +
    "games, cut-out reference cards, score sheets, and thirty-one printable " +
    "boards drawn from the book's own diagrams.",
  newsletterSource: "world-games-companion",
  assetsHeading: "Table-side material",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's manuscript data: the boards are the book's own vector diagrams, and " +
    "the cards and index restate the book's player counts, times, ages and " +
    "page numbers. The full rules and the stories stay in the book.",
  assets: [
    {
      id: "game-index",
      title: "Game index",
      description:
        "Every game in the book on three pages: players, time, age, where it " +
        "comes from and the page it starts on, in the book's own order. Use it " +
        "to pick tonight's game before you open the book.",
      kind: "static",
      href: "/companion/world-games/game-index.pdf",
      meta: "PDF · US Letter · 3 pages",
    },
    {
      id: "quick-reference-cards",
      title: "Quick-reference cards",
      description:
        "One cut-out card for each of the fifty-six games, with the players, " +
        "time, age, materials and the objective, and the page where the full " +
        "rules are. Four to a sheet with cut lines, so nobody has to hold the " +
        "book open at the table.",
      kind: "static",
      href: "/companion/world-games/quick-reference-cards.pdf",
      meta: "PDF · US Letter · 14 pages",
    },
    {
      id: "score-sheets",
      title: "Score sheets",
      description:
        "A general score grid for two to six players, a match record, and " +
        "tally sheets for the games whose rules actually call for a count. " +
        "Print as many as you need.",
      kind: "static",
      href: "/companion/world-games/score-sheets.pdf",
      meta: "PDF · US Letter · 8 pages",
    },
    {
      id: "boards-pack",
      title: "Boards pack",
      description:
        "Thirty-one printable boards drawn from the book's own diagrams, one " +
        "to a page and scaled up to fill a Letter sheet. Print on card or slip " +
        "the page under glass, add counters, and the game is ready to play.",
      kind: "static",
      href: "/companion/world-games/boards-pack.pdf",
      meta: "PDF · US Letter · 32 pages",
    },
  ],
};

/**
 * ── THE PUZZLES OF HENRY DUDENEY ──────────────────────────────────────────
 *
 * Valice Classics 2. Built 2026-09-02 and on sale the same day, after the
 * Founder signed Gates 2, 5, 8 and 12. The companion went live first, as the
 * series rule says: the puzzle sheets are Dudeney's own public-domain text and figures,
 * the hints booklet is Valice Press's editorial apparatus. Neither contains
 * a solution. Files are generated by the book project's
 * `BUILD/build_companion.py` into /public/companion/dudeney/.
 */
const DUDENEY: Companion = {
  slug: "dudeney",
  bookSlug: "the-puzzles-of-henry-dudeney",
  bookTitle: "The Puzzles of Henry Dudeney",
  // On sale since 2026-09-02: the direct ebook (PDF + EPUB) at $9.99. The
  // paperback follows when the Founder has a proof in hand.
  state: "book-available",
  stateNote:
    "The book is on sale here as a DRM-free PDF and EPUB. The puzzle sheets " +
    "and the hints on this page are free and stand on their own; the " +
    "solutions are in the book.",
  intro:
    "Free material for Henry Dudeney's puzzles: twelve puzzles to work on paper, " +
    "in his own words and with his own figures, and a hint for every one of the " +
    "110 puzzles in the Valice edition.",
  newsletterSource: "dudeney-companion",
  assetsHeading: "Puzzle material",
  rightsNote:
    "Dudeney's puzzle texts and figures are in the public domain (he died in " +
    "1930; the sources are Project Gutenberg #16713 and #27635). The hints are " +
    "Valice Press's own writing. Nothing on this page gives an answer.",
  assets: [
    {
      id: "puzzle-sheets",
      title: "Twelve puzzle sheets",
      description:
        "Twelve of the book's puzzles, one to a Letter page in Dudeney's own " +
        "words with the original figure and room to work. No answers on the " +
        "sheet.",
      kind: "static",
      href: "/companion/dudeney/puzzle-sheets.pdf",
      meta: "PDF · US Letter · 13 pages",
    },
    {
      id: "hints",
      title: "Hints booklet",
      description:
        "One hint for every one of the 110 puzzles, numbered as in the book. " +
        "A hint says where to look and never gives the answer.",
      kind: "static",
      href: "/companion/dudeney/hints.pdf",
      meta: "PDF · US Letter · 7 pages",
    },
  ],
};


/**
 * ── THE GREAT BOOK OF WORLD MYTHS ─────────────────────────────────────────
 *
 * The strongest companion case in the catalogue, and until 2026-09-03 the
 * one that did not exist: the book already carries a hand-drawn world map,
 * a card per culture, a sourced pronunciation guide and a Who's Who, and its
 * buyers are parents and teachers, who print things. Every file is generated
 * by the book project's `04_BUILD/companion_pack.py` from the same research
 * indexes the interior is typeset from; the page numbers are measured from
 * the built paperback. No retelling is reproduced — the stories stay in the
 * book. Files live in /public/companion/world-myths/.
 */
const WORLD_MYTHS: Companion = {
  slug: "world-myths",
  bookSlug: "the-great-book-of-world-myths",
  bookTitle: "The Great Book of World Myths",
  state: "book-available",
  stateNote:
    "The book is on sale: paperback, hardcover and Kindle on Amazon, and a " +
    "DRM-free PDF here. Everything on this page is free either way.",
  intro:
    "Free material for the book: the twenty-two-culture map at full size, a " +
    "cut-out card for every culture, every pronunciation in one list, and a " +
    "Who's Who of every god, hero and monster with the page to find them on.",
  newsletterSource: "world-myths-companion",
  assetsHeading: "Classroom and table material",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's research indexes: the map and the culture vignettes are the " +
    "book's own artwork, and the cards, names and Who's Who restate the " +
    "book's own back matter. The stories themselves stay in the book.",
  assets: [
    {
      id: "world-map",
      title: "The world map, full size",
      description:
        "The book's hand-drawn twenty-two-culture map on one landscape sheet, " +
        "with the same numbered markers and key as the opening spread. Pin it " +
        "up beside the book.",
      kind: "static",
      href: "/companion/world-myths/world-map.pdf",
      meta: "PDF · US Letter landscape · 1 page",
    },
    {
      id: "culture-cards",
      title: "Culture cards",
      description:
        "Twenty-two cut-out cards, two to a sheet: who tells each culture's " +
        "stories, where they are set, what survives of them today, and the " +
        "stories from that culture in the book with their page numbers.",
      kind: "static",
      href: "/companion/world-myths/culture-cards.pdf",
      meta: "PDF · US Letter · 11 pages",
    },
    {
      id: "say-these-names",
      title: "Say these names",
      description:
        "Every pronunciation in the book in one alphabetical list, with the " +
        "story each name comes from. Capitals mark the stressed syllable.",
      kind: "static",
      href: "/companion/world-myths/say-these-names.pdf",
      meta: "PDF · US Letter · 5 pages",
    },
    {
      id: "whos-who",
      title: "Who's who",
      description:
        "Every god, hero, monster and mortal with a glossary entry, " +
        "alphabetically: what they are, their other names, and the story and " +
        "page where each appears.",
      kind: "static",
      href: "/companion/world-myths/whos-who.pdf",
      meta: "PDF · US Letter · 4 pages",
    },
  ],
};

/**
 * ── CODEX BESTIARIUM ──────────────────────────────────────────────────────
 *
 * A reference book earns a printable reference sheet. The four files are the
 * book's own four indexes — Thompson motif codes, creatures, kin families,
 * traditions — generated by `08_BUILD/companion_pack.py` from
 * 01_SOURCE/spec.json and indexes.json, page numbers included. Nobody else
 * publishes a printable motif index for a bestiary. No entry text is
 * reproduced. Files live in /public/companion/codex-bestiarium/.
 */
const CODEX_BESTIARIUM: Companion = {
  slug: "codex-bestiarium",
  bookSlug: "codex-bestiarium",
  bookTitle: "Codex Bestiarium",
  state: "book-available",
  stateNote:
    "The book is on sale: paperback, hardcover, large print and Kindle on " +
    "Amazon, and a DRM-free PDF here. Everything on this page is free either way.",
  intro:
    "Free reference sheets for the bestiary: the Thompson motif index, an " +
    "alphabetical creature index with pronunciations and pages, the eight " +
    "kin families, and the forty traditions — the book's own indexes, " +
    "printable.",
  newsletterSource: "codex-bestiarium-companion",
  assetsHeading: "Reference sheets",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's research data. Motif codes follow the Motif-Index of " +
    "Folk-Literature, a scholarly classification; the entries themselves " +
    "stay in the book.",
  assets: [
    {
      id: "motif-index",
      title: "Motif index",
      description:
        "Every Thompson motif code the book cites, in index order, with the " +
        "creatures filed under each code and their page numbers. Take a code " +
        "to the Motif-Index and the regional collections open up.",
      kind: "static",
      href: "/companion/codex-bestiarium/motif-index.pdf",
      meta: "PDF · US Letter · 2 pages",
    },
    {
      id: "creature-index",
      title: "Creature index",
      description:
        "All 112 creatures in one alphabetical list: how to say the name, " +
        "class, tradition, kin family, other names, and the page.",
      kind: "static",
      href: "/companion/codex-bestiarium/creature-index.pdf",
      meta: "PDF · US Letter · 4 pages",
    },
    {
      id: "kin-chart",
      title: "Kin chart",
      description:
        "The eight kin families — one image told by several traditions that " +
        "never met — with every member, its tradition and page, and how the " +
        "tellings diverge.",
      kind: "static",
      href: "/companion/codex-bestiarium/kin-chart.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "traditions-index",
      title: "Traditions index",
      description:
        "The forty traditions with their creatures, each creature's class and page.",
      kind: "static",
      href: "/companion/codex-bestiarium/traditions-index.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── CODEX MYTHOLOGICA ─────────────────────────────────────────────────────
 *
 * The widest audience and the least obvious free artefact — until the
 * book's own tags are read as an index. Its seventy-six myths carry theme
 * tags (the underworld, sacrifice, creation, the trickster…); sorted by
 * theme they become the comparative reading tool the book is built for.
 * Generated by `08_BUILD/companion_pack.py` from 01_SOURCE/book-edited.json,
 * page numbers measured from the built paperback. The Kindle edition is in
 * KDP Select until 2026-11-03, so no ebook is sold here — the note says so.
 * Files live in /public/companion/codex-mythologica/.
 */
const CODEX_MYTHOLOGICA: Companion = {
  slug: "codex-mythologica",
  bookSlug: "codex-mythologica",
  bookTitle: "Codex Mythologica",
  state: "book-available",
  stateNote:
    "The book is on sale on Amazon: paperback, hardcover, large print and " +
    "Kindle. Its ebook is not sold here. Everything on this page is free either way.",
  intro:
    "Free reading material for the book: the nineteen traditions with every " +
    "myth and its page, and the seventy-six myths re-sorted by theme so one " +
    "question — the underworld, the trickster, creation — can be followed " +
    "across the traditions that asked it.",
  newsletterSource: "codex-mythologica-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's own manuscript data: titles, subtitles, epochs and theme tags. " +
    "The retellings stay in the book.",
  assets: [
    {
      id: "reading-companion",
      title: "Reading companion",
      description:
        "The nineteen traditions in the book's order, each with its epoch, " +
        "the book's own one-line description, and every myth from that " +
        "tradition with its subtitle and page.",
      kind: "static",
      href: "/companion/codex-mythologica/reading-companion.pdf",
      meta: "PDF · US Letter · 4 pages",
    },
    {
      id: "theme-index",
      title: "Theme index",
      description:
        "The seventy-six myths re-sorted by theme, most-shared first, each " +
        "line with its tradition and page — the list for reading cultures " +
        "that never met side by side.",
      kind: "static",
      href: "/companion/codex-mythologica/theme-index.pdf",
      meta: "PDF · US Letter · 14 pages",
    },
  ],
};

/**
 * ── THE MYTH HUNTER'S FIELD BOOK ──────────────────────────────────────────
 *
 * A write-in book whose answer key is printed inside it, so the companion is
 * not an answer service: it is what a family needs to FINISH the book. A
 * quest log of all 120 pages with tick boxes and seal rings, cut-out cards
 * for the twenty-two peoples, and a spare completion certificate for the
 * second child who shares the copy. Generated by `04_BUILD/companion_pack.py`
 * from book.json and the 01_SOURCE indexes, page numbers measured from the
 * built paperback. No answer and no seal word appears in any file — printing
 * a seal word would remove the book's only self-check. Files live in
 * /public/companion/myth-hunters-field-book/.
 */
const MYTH_HUNTERS: Companion = {
  slug: "myth-hunters-field-book",
  bookSlug: "the-myth-hunters-field-book",
  bookTitle: "The Myth Hunter's Field Book",
  state: "book-available",
  stateNote:
    "The book is on sale as a paperback on Amazon. It is a write-in book, so " +
    "there is no ebook. Everything on this page is free.",
  intro:
    "Free material for finishing the book: a quest log of all 120 pages with " +
    "tick boxes and a ring for each region's seal, cut-out cards for the " +
    "twenty-two peoples on the route, and a spare Field Researcher " +
    "certificate. No answers are printed here — they are in the book.",
  newsletterSource: "myth-hunters-companion",
  assetsHeading: "Expedition material",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's manuscript data: mission lines, page numbers and the route. " +
    "No answer and no seal word appears in any file.",
  assets: [
    {
      id: "quest-log",
      title: "Quest log",
      description:
        "The whole route on six sheets: every page in book order with its " +
        "mission line, page number and a box to tick, the star-box pages " +
        "marked, and a ring to draw each region's seal into.",
      kind: "static",
      href: "/companion/myth-hunters-field-book/quest-log.pdf",
      meta: "PDF · US Letter · 6 pages",
    },
    {
      id: "culture-cards",
      title: "Culture cards",
      description:
        "Twenty-two cut-out cards, one per people the route meets, in route " +
        "order: name, region, whether the tradition is living today, and " +
        "which pages in the book are theirs.",
      kind: "static",
      href: "/companion/myth-hunters-field-book/culture-cards.pdf",
      meta: "PDF · US Letter · 4 pages",
    },
    {
      id: "field-researcher-certificate",
      title: "Spare certificate",
      description:
        "A clean copy of the Field Researcher certificate from the back of " +
        "the book, with the six seal rings — for a second reader sharing the " +
        "book, or a second run through it.",
      kind: "static",
      href: "/companion/myth-hunters-field-book/field-researcher-certificate.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── EPICTETUS: THE DISCOURSES AND ENCHIRIDION ─────────────────────────────
 *
 * Valice Classics 3, built 2026-09-04 as Book 1 of the public-domain factory's
 * Phase 1. The book is NOT on sale: Gate 2 (rights) is prepared but unsigned
 * and no Paddle product exists, so the state below is honest about that.
 *
 * The companion is deliberately independent of the book's sale state, which is
 * the standing rule in this file: a QR printed in a paperback is permanent and
 * must never 404. All four assets here are built from the same content files as
 * the book and stand on their own — the Enchiridion is public domain in full,
 * and the glossary, reading paths and concordance are Valice's own writing.
 */
const EPICTETUS: Companion = {
  slug: "epictetus",
  bookSlug: "epictetus-discourses-and-enchiridion",
  bookTitle: "Epictetus: The Discourses and Enchiridion",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built and validated but not yet on sale — the " +
    "rights gate is signed by a person, not a script, and that signature is " +
    "outstanding. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Epictetus: the complete Enchiridion to print, the " +
    "eighteen working terms on one sheet, four ways into the Discourses, and " +
    "the passages Marcus Aurelius demonstrably read.",
  newsletterSource: "epictetus-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "Epictetus died around 135 and George Long, whose translation this is, " +
    "died in 1879, so the text on these sheets is in the public domain " +
    "everywhere (source: Project Gutenberg #10661). The glossary, the reading " +
    "paths and the concordance are Valice Press's own writing.",
  assets: [
    {
      id: "enchiridion-card",
      title: "The Enchiridion, complete",
      description:
        "All fifty-two chapters of Arrian's handbook in George Long's 1877 " +
        "translation, set two columns to a page. The whole of Stoicism's " +
        "best-known short text, free to print and keep.",
      kind: "static",
      href: "/companion/epictetus/enchiridion-card.pdf",
      meta: "PDF · US Letter · 7 pages",
    },
    {
      id: "glossary-sheet",
      title: "The working terms",
      description:
        "The eighteen words Epictetus uses technically and English hides — " +
        "will, appearance, assent, preconception, the ruling faculty — each " +
        "with Long's own rendering and where to find it.",
      kind: "static",
      href: "/companion/epictetus/glossary-sheet.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "reading-paths",
      title: "Four ways in",
      description:
        "Where to start depending on why you picked the book up, with the " +
        "chapter numbers so it works with any edition, and what is in each of " +
        "the seven thematic parts.",
      kind: "static",
      href: "/companion/epictetus/reading-paths.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "concordance",
      title: "What Marcus Aurelius read",
      description:
        "Marcus thanks Junius Rusticus for lending him Epictetus. George Long " +
        "translated both books and marked where they touch. Four passages " +
        "verified present, and the two Long cites that are not in his own " +
        "selection — listed, because a table that hides its gaps is worth less.",
      kind: "static",
      href: "/companion/epictetus/concordance.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── GAMES ANCIENT AND ORIENTAL ────────────────────────────────────────────
 *
 * Valice Classics 8, built 2026-09-05 as Book 1 of the public-domain factory's
 * Phase 2 — the first Valice edition made from a SCAN rather than from a
 * proof-read transcription.
 *
 * The boards are the point of this companion. Falkener's complaint about two
 * centuries of antiquarian scholarship was that the game was never played; the
 * one thing a reader of this edition can do that his readers could not is print
 * the board and play on it. They are drawn by the same code path as the figures
 * in the book, so the sheet and the diagram cannot disagree, and each carries
 * the same EVIDENCE or RECONSTRUCTION mark.
 */
const GAMES_ANCIENT: Companion = {
  slug: "games-ancient-and-oriental",
  bookSlug: "games-ancient-and-oriental",
  bookTitle: "Games Ancient and Oriental: The Egyptian Games",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built, validated and priced but not yet on sale — " +
    "creating the payment product is a live write that is held behind a " +
    "founder action. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Falkener's Egyptian games: three boards at playing " +
    "size to print, the register that separates the evidence from the " +
    "reconstruction, the terms, and the three timelines this volume keeps apart.",
  newsletterSource: "games-ancient-and-oriental-companion",
  assetsHeading: "Print and play",
  rightsNote:
    "Edward Falkener died in 1896 and Dr Samuel Birch, whose 1864 paper the " +
    "book prints, died in 1885, so their text is in the public domain " +
    "everywhere (source: Internet Archive, gamesancientorie00falkuoft). None " +
    "of the 1892 engravings is reproduced: they are unsigned, no illustrator " +
    "is named, and an image with no identified creator has no death year to " +
    "clear it with. Every board on these sheets was drawn for this edition " +
    "from the descriptions in the text.",
  assets: [
    {
      id: "boards",
      title: "Three boards to print and play on",
      description:
        "The board of thirty compartments, Senat at five squares each way, " +
        "and the concentric rings of Hab em Han — at playing size, on US " +
        "Letter. Each carries the same mark it carries in the book: EVIDENCE " +
        "where an ancient source describes the board, RECONSTRUCTION where " +
        "Falkener inferred it. Counters or coins will do for men.",
      kind: "static",
      href: "/companion/games-ancient-and-oriental/boards.pdf",
      meta: "PDF · US Letter · 3 pages",
    },
    {
      id: "register-card",
      title: "The Register of Reconstructions",
      description:
        "For each of the three games: what the evidence shows, what Falkener " +
        "supplies, and what is known now — which in every case includes that " +
        "the rules are still not known. The instrument the book is built " +
        "around, on one sheet.",
      kind: "static",
      href: "/companion/games-ancient-and-oriental/register-card.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "the-terms",
      title: "The terms",
      description:
        "The games, dynasties and seventeenth-century antiquaries Falkener " +
        "assumes you already know — sent, senet, mehen, latrunculi, Seega, " +
        "Hyde, Birch — with what each one is and, where it differs, what it " +
        "is called now.",
      kind: "static",
      href: "/companion/games-ancient-and-oriental/the-terms.pdf",
      meta: "PDF · US Letter · 2 pages",
    },
    {
      id: "chronology",
      title: "Three timelines",
      description:
        "The Egyptian, which is deep and imprecise; the classical, which is " +
        "shallow and better dated; and the antiquarian, which runs from " +
        "Salmasius in 1620 to Falkener in 1892. Keeping them apart is most of " +
        "what makes the book readable.",
      kind: "static",
      href: "/companion/games-ancient-and-oriental/chronology.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── SENECA: SELECTED DIALOGUES ────────────────────────────────────────────
 *
 * Valice Classics 4, built 2026-09-04 as Book 2 of the public-domain factory's
 * Phase 1. Not on sale: Gate 2 prepared but unsigned, no Paddle product.
 *
 * This book exists because the 2026-09-03 research pass found that the source
 * the previous candidate pool had chosen for Seneca — the Loeb/Gummere text —
 * could not be cleared: the pool recorded "Gummere d.1919" where 1919 was the
 * imprint year of one volume of a series whose next volume appeared in 1925.
 * Aubrey Stewart (d. 1918) is the verified substitute, and this companion's
 * material is drawn from his translation, which is clear everywhere.
 */
const SENECA: Companion = {
  slug: "seneca",
  bookSlug: "seneca-selected-dialogues",
  bookTitle: "Seneca: Selected Dialogues",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built and validated but not yet on sale — the " +
    "rights gate is signed by a person, not a script, and that signature is " +
    "outstanding. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Seneca: On the Shortness of Life complete, a line on " +
    "every one of the seventy-nine chapters, the working terms on one sheet, " +
    "and four ways into the dialogues.",
  newsletterSource: "seneca-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "Seneca died in 65 and Aubrey Stewart, whose translation this is, died in " +
    "1918, so the text on these sheets is in the public domain everywhere " +
    "(source: Project Gutenberg #64576). The argument map, the glossary and " +
    "the reading paths are Valice Press's own writing.",
  assets: [
    {
      id: "shortness-of-life",
      title: "On the Shortness of Life",
      description:
        "Seneca's most famous essay, complete and unabridged, in Aubrey " +
        "Stewart's 1889 translation. Twenty chapters on why life is not short " +
        "and we are simply wasteful with it.",
      kind: "static",
      href: "/companion/seneca/shortness-of-life.pdf",
      meta: "PDF · US Letter · 5 pages",
    },
    {
      id: "argument-map",
      title: "What is in every chapter",
      description:
        "Seneca wrote no headings; the chapter numbers were added by later " +
        "editors and tell you nothing. A line for each of the seventy-nine, so " +
        "you can find a passage again.",
      kind: "static",
      href: "/companion/seneca/argument-map.pdf",
      meta: "PDF · US Letter · 3 pages",
    },
    {
      id: "glossary-sheet",
      title: "The working terms",
      description:
        "The fourteen words Seneca uses technically and plain English hides — " +
        "happy, virtue, indifferent, leisure, the wise man — each with the " +
        "Latin and where to find it.",
      kind: "static",
      href: "/companion/seneca/glossary-sheet.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "reading-paths",
      title: "Four ways in",
      description:
        "Where to start depending on why you picked Seneca up — including the " +
        "one for readers who want to know whether he can be trusted.",
      kind: "static",
      href: "/companion/seneca/reading-paths.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

/**
 * ── THE GREEK ALPHABET HANDWRITING WORKBOOK ───────────────────────────────
 *
 * Valice Script 2. Built 2026-09-04. The page exists before the book does,
 * which is the rule: the address `valicepress.com/companion/greek` is printed
 * on page 99 of an edition that cannot be edited once it is printed, so the
 * material behind it has to be there first and has to stay there.
 *
 * Every sheet is generated by the book project's `BUILD/build_companion.py`
 * from `BUILD/greek_data.py` — the same file the book itself is typeset from
 * — so the chart cannot drift from the book, and the stroke boxes cannot
 * teach an order the book does not.
 *
 * The stroke-boxes sheet is the one that justifies the page. The book has
 * room to drill each letter once; this is all forty-eight forms, one to a
 * page, with the start dots printed and the boxes empty. That is a thing a
 * reader reprints, not a thing they download once.
 */
const GREEK: Companion = {
  slug: "greek",
  bookSlug: "greek-alphabet-handwriting-workbook",
  bookTitle: "The Greek Alphabet Handwriting Workbook",
  // Not on sale anywhere yet: the paperback is built and packaged but not
  // uploaded, and the direct ebook waits on a Paddle price that cannot be
  // created from this environment. The page says so plainly rather than
  // showing a buy button that goes nowhere.
  state: "book-not-yet-available",
  stateNote:
    "The workbook is not on sale yet. Everything on this page is free and " +
    "works on its own \u2014 you do not need the book to use any of it.",
  intro:
    "Free practice material for learning to write the Greek alphabet by hand. " +
    "Reprint the grids as often as you like: handwriting is a volume exercise, " +
    "and one page of a bound book is never enough of it.",
  newsletterSource: "greek-companion",
  rightsNote:
    "Everything on this page is Valice Press's own work, generated from the " +
    "book's own data. The letterforms are set in DejaVu Sans, a Bitstream Vera " +
    "derivative that may be redistributed; the stroke marks are drawn from " +
    "coordinates, not traced from anyone's diagram. Greek has no official " +
    "stroke-order standard, and the orders shown here are the ones the book " +
    "recommends, with their provenance printed in the book.",
  assets: [
    {
      id: "stroke-sheets",
      title: "Stroke-order practice sheets \u2014 all 53 forms",
      description:
        "One page for every form the book teaches \u2014 24 letters in both cases " +
        "and the five variants: the letter with its numbered stroke marks, the " +
        "same letter again for each stroke with the marks building up in order, " +
        "and then ruled lines carrying only the start dots. This is the drill " +
        "the book has room to do once and you will want to do twenty times.",
      kind: "static",
      href: "/companion/greek/stroke-sheets.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 53 pages",
    },
    {
      id: "practice-grid",
      title: "Four-line practice grid",
      description:
        "The book's own writing rule \u2014 four lines, so a \u03b2 has somewhere to put " +
        "its descender and a \u03a0 has somewhere to reach \u2014 blank, at four sizes from " +
        "large to word-sized. Works at any stage and for any letter.",
      kind: "static",
      href: "/companion/greek/practice-grid.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 4 pages",
    },
    {
      id: "alphabet-chart",
      title: "The alphabet on one page",
      description:
        "All 24 letters with their Greek names, their English names, what they " +
        "sound like, and the number of strokes in each case. One sheet, for the " +
        "wall next to the desk.",
      kind: "static",
      href: "/companion/greek/alphabet-chart.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "lesson-tracker",
      title: "Thirty-two-lesson progress tracker",
      description:
        "Every lesson with a box for each of the three passes the book asks for " +
        "\u2014 trace, dot-start, free. Pin it up and mark it off; it is the only " +
        "honest way to see whether you are practising or re-reading.",
      kind: "static",
      href: "/companion/greek/lesson-tracker.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
  ],
};

const CHINA_GODS: Companion = {
  slug: "china-gods",
  bookSlug: "myths-and-legends-of-china",
  bookTitle: "Myths and Legends of China: Volume One, The Gods",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built and validated but not yet on sale — the " +
    "rights gate is signed by a person, not a script, and that signature is " +
    "outstanding. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Werner's Myths and Legends of China: the celestial " +
    "ministries on one sheet, the twenty-five figures with the chapters they " +
    "appear in, four ways into the book, and what the marks in the names mean.",
  newsletterSource: "china-gods-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "E. T. C. Werner died in 1954, so his 1922 text is in the public domain " +
    "in the United States and, since 1 January 2025, in the UK, the EU and " +
    "Türkiye (source: Project Gutenberg #15250). The register, the glossary, " +
    "the reading paths and the note on the names are Valice Press's own " +
    "writing. The 1922 colour plates are not reproduced anywhere here: no " +
    "source names their artist, so they cannot be cleared.",
  assets: [
    {
      id: "ministries",
      title: "The ministries of heaven",
      description:
        "The Chinese gods hold posts. Thunder, the waters, fire, epidemics, " +
        "medicine, exorcism, smallpox and time are ministries with presidents " +
        "and staff. Werner catalogues them in a chapter this edition does not " +
        "print, so the register was rebuilt from the chapters it does — nine " +
        "ministries, the officers he names, and the chapter to read.",
      kind: "static",
      href: "/companion/china-gods/ministries.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "who-is-who",
      title: "Who is who",
      description:
        "Twenty-five figures — P'an Ku, Shên I the archer, Lei Kung the Duke " +
        "of Thunder, the Eight Immortals — each with the chapters they appear " +
        "in and how often. Every reference was produced by searching the text, " +
        "so nothing points at a chapter that does not contain the name.",
      kind: "static",
      href: "/companion/china-gods/who-is-who.pdf",
      meta: "PDF · US Letter · 2 pages",
    },
    {
      id: "reading-paths",
      title: "Four ways in",
      description:
        "Where to start depending on why you picked the book up, with Werner's " +
        "own chapter numbers so it works with any edition of the 1922 text, and " +
        "how long each of the eight chapters runs.",
      kind: "static",
      href: "/companion/china-gods/reading-paths.pdf",
      meta: "PDF · US Letter · 1 page",
    },
    {
      id: "the-names",
      title: "The names",
      description:
        "Wade-Giles has two marks that do most of the work and almost nobody " +
        "is told what they are for. Once you know that t' and t are different " +
        "consonants, several hundred names stop being noise.",
      kind: "static",
      href: "/companion/china-gods/the-names.pdf",
      meta: "PDF · US Letter · 1 page",
    },
  ],
};

const VEDIC_GODS: Companion = {
  slug: "vedic-gods",
  bookSlug: "indian-myth-and-legend",
  bookTitle: "Indian Myth and Legend: Volume One, The Vedic Gods",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built and validated but not yet on sale \u2014 the " +
    "rights gate is signed by a person, not a script, and that signature is " +
    "outstanding. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Mackenzie's Indian Myth and Legend: which of his " +
    "comparisons still stand, the thirty-two figures with the chapters they " +
    "appear in, four ways into the book, and how to read the Sanskrit names.",
  newsletterSource: "vedic-gods-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "Donald A. Mackenzie died in 1936, so his 1913 text is in the public " +
    "domain in the United States and, since 1 January 2007, in the UK, the EU " +
    "and T\u00fcrkiye (source: Project Gutenberg #47228). The register, the " +
    "who's-who, the reading paths and the note on the names are Valice " +
    "Press's own writing. None of the 1913 illustrations is reproduced: two of " +
    "those in these chapters are paintings by Nandalal Bose, who died in 1966 " +
    "and whose work is still in copyright, and the rest name no creator at all.",
  assets: [
    {
      id: "comparisons",
      title: "Which comparisons still stand",
      description:
        "Mackenzie compares Indra to Thor, Agni to Heimdal and half the " +
        "pantheon to something Babylonian, in the same tone whether the " +
        "parallel is a proven cognate or a theory nobody now defends. Four " +
        "kinds, graded by how much weight each will bear.",
      kind: "static",
      href: "/companion/vedic-gods/comparisons.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "who-is-who",
      title: "Who is who",
      description:
        "Thirty-two gods, demons and mortals \u2014 Indra, Agni, Varuna, Yama " +
        "who was the first man, the dragon Vritra \u2014 each with the chapters " +
        "they appear in and how often. Note that there are two Savitris: a " +
        "solar deity and a princess, and they are not the same figure.",
      kind: "static",
      href: "/companion/vedic-gods/who-is-who.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 2 pages",
    },
    {
      id: "reading-paths",
      title: "Four ways in",
      description:
        "Where to start depending on why you picked the book up, with " +
        "Mackenzie's own chapter numbers so it works with any edition of the " +
        "1913 text, and how long each of the five chapters runs.",
      kind: "static",
      href: "/companion/vedic-gods/reading-paths.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "the-names",
      title: "The names",
      description:
        "Sanskrit has three s-sounds, a set of long vowels Mackenzie usually " +
        "does not mark, and a final -a that is pronounced. Four things worth " +
        "knowing before several hundred proper names start arriving.",
      kind: "static",
      href: "/companion/vedic-gods/the-names.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
  ],
};

const THE_DRAGON: Companion = {
  slug: "the-dragon",
  bookSlug: "mythical-monsters",
  bookTitle: "Mythical Monsters: Volume One, The Dragon",
  state: "book-not-yet-available",
  stateNote:
    "The Valice edition is built and validated but not yet on sale \u2014 the " +
    "rights gate is signed by a person, not a script, and that signature is " +
    "outstanding. Everything on this page is free and works today regardless.",
  intro:
    "Free material for Gould's Mythical Monsters: six of his claims set " +
    "against what is actually established, his sources graded from the Shan " +
    "Hai King to the Straits Times, the dragon vocabulary, and three ways in.",
  newsletterSource: "the-dragon-companion",
  assetsHeading: "Reading material",
  rightsNote:
    "Charles Gould died in 1893, so his 1886 text has been in the public " +
    "domain everywhere Valice sells since 1 January 1964 (source: Project " +
    "Gutenberg #40972). The register of claims, the graded source list, the " +
    "glossary and the reading paths are Valice Press's own writing. None of " +
    "the 1886 figures is reproduced: the book names no illustrator, so they " +
    "cannot be cleared.",
  assets: [
    {
      id: "claims",
      title: "Six claims, and what is actually known",
      description:
        "Gould believed dragons were real animals. His prose is equally " +
        "confident whether he is reporting a text, reporting a fact, or " +
        "drawing a conclusion, and he never marks the transitions. This sheet " +
        "sets six of his claims beside what is established, and says which is " +
        "which.",
      kind: "static",
      href: "/companion/the-dragon/claims.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "sources",
      title: "His sources, graded",
      description:
        "The Chinese classics, which are genuinely old and honestly used; the " +
        "classical authors, mostly quoting one another; the Renaissance " +
        "naturalists, compiling from those; and the Victorian newspapers, " +
        "which are not evidence of anything.",
      kind: "static",
      href: "/companion/the-dragon/sources.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "vocabulary",
      title: "The dragon vocabulary",
      description:
        "Eighteen terms \u2014 lung and ying-lung, the Shan Hai King and the " +
        "Yih King, the real gliding lizard Draco that Gould presses into " +
        "service \u2014 each with the chapters it appears in.",
      kind: "static",
      href: "/companion/the-dragon/vocabulary.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
    {
      id: "reading-paths",
      title: "Three ways in",
      description:
        "Where to start, with Gould's own chapter numbers so it works with any " +
        "edition of the 1886 text \u2014 including the twenty-minute route for " +
        "readers who want the measure of the book before committing to it.",
      kind: "static",
      href: "/companion/the-dragon/reading-paths.pdf",
      meta: "PDF \u00b7 US Letter \u00b7 1 page",
    },
  ],
};

const COMPANIONS: readonly Companion[] = [
  HANGUL,
  WORLD_GAMES,
  DUDENEY,
  WORLD_MYTHS,
  CODEX_BESTIARIUM,
  CODEX_MYTHOLOGICA,
  MYTH_HUNTERS,
  EPICTETUS,
  GAMES_ANCIENT,
  SENECA,
  GREEK,
  CHINA_GODS,
  VEDIC_GODS,
  THE_DRAGON,
];

export function listCompanions(): readonly Companion[] {
  return COMPANIONS;
}

export function getCompanion(slug: string): Companion | undefined {
  return COMPANIONS.find((c) => c.slug === slug);
}

/** The companion for a book, if it has one. Keyed on the BOOK's slug. */
export function getCompanionForBook(bookSlug: string): Companion | undefined {
  return COMPANIONS.find((c) => c.bookSlug === bookSlug);
}

export function getCompanionAsset(
  companionSlug: string,
  assetId: string,
): CompanionAsset | undefined {
  return getCompanion(companionSlug)?.assets.find((a) => a.id === assetId);
}
