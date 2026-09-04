/**
 * The physical facts of every printed edition: trim, binding and paper.
 *
 * Every number here was **measured** from the built interior's MediaBox
 * (`pdfinfo`) or read from the book project's own cover report, on
 * 2026-09-03. None is inferred from a listing page and none is a house
 * default. `companion-page.test.js` re-measures the trims and fails if a book
 * has been rebuilt at a different size — which is exactly how the World Games
 * 8.5 × 11 / 6 × 9 confusion was caught in Phase 4.
 *
 * ── ABOUT `paper` ─────────────────────────────────────────────────────────
 * The paper stock is a choice made *inside KDP*, not in these repositories,
 * and the agent has no read access to the listings' print options. Where a
 * project built exactly one wrap, that stock is recorded and `paperVerified`
 * is "project". Where a project built both a white and a cream wrap — the
 * Codex line does — the stock at KDP is genuinely unknown here and
 * `paperVerified` is false.
 *
 * That uncertainty does not change any decision in this phase: one added leaf
 * moves the spine by 0.00225 in on white and 0.0025 in on cream, and both are
 * two orders of magnitude inside KDP's ±0.0625 in tolerance. Where the answer
 * would matter, `spine-check.mjs` is run for both stocks and both are printed.
 */

export const EDITION_GEOMETRY = {
  "greek-alphabet-handwriting-workbook": {
    // Measured off OUTPUT/KDP/PAPERBACK/interior.pdf and confirmed against the
    // wrap the cover builder produced for 100 pages: white paper, 0.002252 in
    // per page, spine 0.2252 in.
    paperback: { trimWidthIn: 8.5, trimHeightIn: 11, binding: "paperback", paper: "white", paperVerified: true },
  },
  "codex-mythologica": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: false },
    hardcover: { trimWidthIn: 6, trimHeightIn: 9, binding: "hardcover", paper: "cream", paperVerified: false },
    large_print: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: false },
  },
  "codex-bestiarium": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: false },
    hardcover: { trimWidthIn: 6, trimHeightIn: 9, binding: "hardcover", paper: "cream", paperVerified: false },
    large_print: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: false },
  },
  "codex-enigmatica": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: false },
    hardcover: { trimWidthIn: 6, trimHeightIn: 9, binding: "hardcover", paper: "cream", paperVerified: false },
  },
  "the-great-book-of-world-games": {
    // Corrected in Phase 4: this book is 8.5 × 11, not the 6 × 9 an earlier
    // economics run assumed. The hardcover is 8.25 × 11, which is why its
    // interior MediaBox is 594 pt wide and the paperback's is 612.
    paperback: { trimWidthIn: 8.5, trimHeightIn: 11, binding: "paperback", paper: "white", paperVerified: "project" },
    hardcover: { trimWidthIn: 8.25, trimHeightIn: 11, binding: "hardcover", paper: "white", paperVerified: "project" },
    large_print: { trimWidthIn: 8.5, trimHeightIn: 11, binding: "paperback", paper: "white", paperVerified: "project" },
  },
  "the-great-book-of-world-myths": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "cream", paperVerified: "project" },
    hardcover: { trimWidthIn: 6, trimHeightIn: 9, binding: "hardcover", paper: "cream", paperVerified: "project" },
  },
  "the-myth-hunters-field-book": {
    paperback: { trimWidthIn: 8.5, trimHeightIn: 11, binding: "paperback", paper: "white", paperVerified: "project" },
  },
  "korean-hangul-handwriting-workbook": {
    paperback: { trimWidthIn: 8.5, trimHeightIn: 11, binding: "paperback", paper: "white", paperVerified: "project" },
    hardcover: { trimWidthIn: 8.25, trimHeightIn: 11, binding: "hardcover", paper: "white", paperVerified: "project" },
  },
  "the-puzzles-of-henry-dudeney": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "white", paperVerified: "project" },
  },
  "epictetus-discourses-and-enchiridion": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "white", paperVerified: "project" },
  },
  "seneca-selected-dialogues": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "white", paperVerified: "project" },
  },
  "myths-and-legends-of-china": {
    paperback: { trimWidthIn: 6, trimHeightIn: 9, binding: "paperback", paper: "white", paperVerified: "project" },
  },
};

/** Measured MediaBox of each edition's built interior, in points. */
export const MEASURED_MEDIABOX_PT = {
  "codex-mythologica": { paperback: [432, 648], hardcover: [432, 648], large_print: [432, 648] },
  "codex-bestiarium": { paperback: [432, 648], hardcover: [432, 648], large_print: [432, 648] },
  "codex-enigmatica": { paperback: [432, 648], hardcover: [432, 648] },
  "the-great-book-of-world-games": { paperback: [612, 792], hardcover: [594, 792], large_print: [612, 792] },
  "the-great-book-of-world-myths": { paperback: [432, 648], hardcover: [432, 648] },
  "the-myth-hunters-field-book": { paperback: [612, 792] },
  "korean-hangul-handwriting-workbook": { paperback: [612, 792], hardcover: [594, 792] },
  "the-puzzles-of-henry-dudeney": { paperback: [432, 648] },
  "epictetus-discourses-and-enchiridion": { paperback: [432, 648] },
  "seneca-selected-dialogues": { paperback: [432, 648] },
  "myths-and-legends-of-china": { paperback: [432, 648] },
};
