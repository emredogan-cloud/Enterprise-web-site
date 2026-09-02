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
  // The paperback and hardcover are IN REVIEW at KDP with the pre-remediation
  // files; the corrected edition awaits the Founder's Gate 2 sign-off and a
  // file replacement. Purchasable nowhere until then. When that changes, this
  // one field changes with it.
  state: "book-not-yet-available",
  stateNote:
    "The workbook is not on sale yet. Everything on this page is free and " +
    "works on its own — you do not need the book to use it.",
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
 * Valice Classics 2. Built 2026-09-02; not yet on sale (Founder Gate 2 and
 * Gate 12 sign-off pending). The companion is live first, as the series rule
 * says: the puzzle sheets are Dudeney's own public-domain text and figures,
 * the hints booklet is Valice Press's editorial apparatus. Neither contains
 * a solution. Files are generated by the book project's
 * `BUILD/build_companion.py` into /public/companion/dudeney/.
 */
const DUDENEY: Companion = {
  slug: "dudeney",
  bookSlug: "the-puzzles-of-henry-dudeney",
  bookTitle: "The Puzzles of Henry Dudeney",
  state: "book-not-yet-available",
  stateNote:
    "The book is not on sale yet. The puzzle sheets and the hints on this page " +
    "are free and stand on their own; the solutions are in the book.",
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

const COMPANIONS: readonly Companion[] = [HANGUL, WORLD_GAMES, DUDENEY];

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
