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
  newsletterSource: "hangul-companion";
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
 * The book carries an UNRESOLVED CC BY-NC licensing question on a dictionary
 * source used for its 97 vocabulary words (catalog blocker A7/S-0019). That
 * blocks commercial sale of the book in every channel until cleared.
 *
 * This companion is therefore built to be **independent of that source**. It
 * contains no vocabulary list and no dictionary-derived material. Its assets
 * are:
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
  // The paperback and hardcover are IN REVIEW at KDP and the CC BY-NC
  // question is open, so the book is purchasable nowhere. When that changes,
  // this one field changes with it.
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

const COMPANIONS: readonly Companion[] = [HANGUL];

export function listCompanions(): readonly Companion[] {
  return COMPANIONS;
}

export function getCompanion(slug: string): Companion | undefined {
  return COMPANIONS.find((c) => c.slug === slug);
}

export function getCompanionAsset(
  companionSlug: string,
  assetId: string,
): CompanionAsset | undefined {
  return getCompanion(companionSlug)?.assets.find((a) => a.id === assetId);
}
