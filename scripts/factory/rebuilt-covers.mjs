/**
 * Covers rebuilt on 2026-09-03 because the block changed thickness.
 *
 * A cover is listed here only when it was actually produced and its wrap width
 * was checked against `spine-check.mjs`. Where an edition's wrap could NOT be
 * rebuilt from this machine, the entry says so and why, because "no file" and
 * "file not needed" are different answers and a package that confuses them is
 * how a book ships with a spine that does not fit its block.
 */
const BOOKS = "/home/emre/Downloads/MY-DİGİTAL-BOOK";

export const REBUILT_COVERS = {
  "greek-alphabet-handwriting-workbook": {
    paperback: {
      built: true,
      path: `${BOOKS}/GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/KDP/PAPERBACK/cover.pdf`,
      pageCount: 100, spineIn: 0.2252, wrapIn: "17.4752 × 11.2500 (white)",
      note: "Not rebuilt — built once, at the final page count, by the project's own BUILD/build_cover.py. Nothing was spliced into this book, so the block never changed thickness. It is listed here because this is where the packaging pipeline looks for a wrap, and an edition that has never been uploaded needs its cover NAMED rather than left null: `coverAction` says the Founder must upload one, and this is the file. Spine and wrap agree with spine-check.mjs to four decimal places, and `preflight.py --kind cover` passes 6/6. No spine text: 0.2252 in leaves a 0.100 in safe zone, which cannot carry legible type on a perfect-bound book.",
    },
    hardcover: {
      built: false,
      reason: "NOT PRODUCED, and not a gap. A $19.99 hardcover at 100 pages nets about 21 %, under the 35 % house floor, and a workbook is a consumable a reader writes in and finishes — the format a buyer wants for it is the cheap one they can replace. DECISIONS.md K8.",
    },
  },
  "korean-hangul-handwriting-workbook": {
    paperback: {
      built: true,
      path: `${BOOKS}/KOREAN-HANGUL-HANDWRITING-WORKBOOK/05_APLUS_COVER/exports/paperback_cover.pdf`,
      pageCount: 126, spineIn: 0.283752, wrapIn: "17.5338 × 11.2500",
      note: "internal KDP formula, white paper — the same arithmetic spine-check.mjs runs, and the two agree",
    },
    hardcover: {
      built: false,
      reason: "this project pins the hardcover wrap to a value the Founder read out of KDP's Cover Calculator, and that value is page-count independent — re-running the builder at 126 pp reproduces the 124 pp wrap. The house standard forbids deriving a hardcover wrap. Founder action: run the calculator at 126 pp / 8.25 × 11 / white, paste the three numbers into project_config.json → formats.hardcover.kdp_calculator, re-run 06_BUILD/build_cover.py --format hardcover.",
    },
  },
  "codex-bestiarium": {
    paperback: { built: true, path: `${BOOKS}/CODEX_BESTIARIUM/03_COVER/PAPERBACK/exports/`, pageCount: 436, spineIn: 1.09, wrapIn: "13.3400 × 9.2500 (cream) · 13.2319 × 9.2500 (white)", note: "both paper stocks built; take the one the listing uses" },
    hardcover: { built: true, path: `${BOOKS}/CODEX_BESTIARIUM/03_COVER/HARDCOVER/exports/`, pageCount: 436, spineIn: null, wrapIn: "14.8508 × 10.4167 (cream) · 14.7427 × 10.4167 (white)", note: "this project carries a calibrated hardcover profile with a measured board allowance, so its wrap IS derivable and was rebuilt" },
    large_print: { built: true, path: `${BOOKS}/CODEX_BESTIARIUM/03_COVER/LARGEPRINT/exports/`, pageCount: 600, spineIn: 1.5, wrapIn: "13.7500 × 9.2500 (cream)", note: "cream only, as the large print is printed" },
  },
  "codex-mythologica": {
    paperback: { built: true, path: `${BOOKS}/CODEX_MYTHOLOGICA/03_COVER/PAPERBACK/exports/`, pageCount: 330, spineIn: 0.825, wrapIn: "13.0750 × 9.2500 (cream) · 12.9932 × 9.2500 (white)", note: "both paper stocks built" },
    hardcover: { built: true, path: `${BOOKS}/CODEX_MYTHOLOGICA/03_COVER/HARDCOVER/exports/`, pageCount: 330, spineIn: null, wrapIn: "14.5858 × 10.4167 (cream) · 14.5040 × 10.4167 (white)", note: "calibrated hardcover profile" },
    large_print: { built: true, path: `${BOOKS}/CODEX_MYTHOLOGICA/03_COVER/LARGEPRINT/exports/`, pageCount: 579, spineIn: 1.4475, wrapIn: "13.6975 × 9.2500 (cream)", note: "cream only" },
  },
  "epictetus-discourses-and-enchiridion": {
    paperback: {
      built: true,
      path: `${BOOKS}/PHASE-1-BOOK/01-EPICTETUS-DISCOURSES-AND-ENCHIRIDION/ASSETS/cover/paperback-wrap-v1.pdf`,
      pageCount: 176, spineIn: 0.3964, wrapIn: "12.6464 × 9.2500 (white)",
      note: "built 2026-09-04 by the project's own BUILD/build_cover.py at the FINAL page count of 176 — that is, after the companion leaf. Its spine and wrap agree with this pipeline's own arithmetic to four decimal places (0.396352 / 12.646352), so nothing had to be rebuilt after the splice.",
    },
  },
  "mythical-monsters": {
    paperback: {
      built: true,
      path: `${BOOKS}/PHASE-1-BOOK/05-MYTHICAL-MONSTERS/ASSETS/cover/paperback-wrap-v1.pdf`,
      pageCount: 74, spineIn: 0.1666, wrapIn: "12.4166 × 9.2500 (white)",
      note: "built 2026-09-04 by the project's own BUILD/build_cover.py at the FINAL page count of 74 — after the companion leaf — so its spine agrees with this pipeline's arithmetic.",
    },
  },
  "indian-myth-and-legend": {
    paperback: {
      built: true,
      path: `${BOOKS}/PHASE-1-BOOK/04-INDIAN-MYTH-AND-LEGEND/ASSETS/cover/paperback-wrap-v1.pdf`,
      pageCount: 94, spineIn: 0.2117, wrapIn: "12.4617 × 9.2500 (white)",
      note: "built 2026-09-04 by the project's own BUILD/build_cover.py at the FINAL page count of 94 — after the companion leaf — so its spine agrees with this pipeline's arithmetic and nothing had to be rebuilt after the splice.",
    },
  },
  "myths-and-legends-of-china": {
    paperback: {
      built: true,
      path: `${BOOKS}/PHASE-1-BOOK/03-MYTHS-AND-LEGENDS-OF-CHINA/ASSETS/cover/paperback-wrap-v1.pdf`,
      pageCount: 108, spineIn: 0.2432, wrapIn: "12.4932 × 9.2500 (white)",
      note: "built 2026-09-04 by the project's own BUILD/build_cover.py at the FINAL page count of 108 — that is, after the companion leaf. Its spine and wrap agree with this pipeline's own arithmetic to four decimal places (0.243216 / 12.493216), so nothing had to be rebuilt after the splice.",
    },
  },
  "seneca-selected-dialogues": {
    paperback: {
      built: true,
      path: `${BOOKS}/PHASE-1-BOOK/02-SENECA-SELECTED-DIALOGUES/ASSETS/cover/paperback-wrap-v1.pdf`,
      pageCount: 154, spineIn: 0.3468, wrapIn: "12.5968 × 9.2500 (white)",
      note: "rebuilt 2026-09-04 at the final page count of 154, after the companion leaf. The count moved 156 -> 154 when a markdown-bold rendering defect was fixed and the text reflowed; the cover was rebuilt rather than reused.",
    },
  },
  "the-great-book-of-world-games": {
    large_print: {
      built: false,
      reason: "the block moved 232 → 233 pp, so the wrap needs a new spine, but this project's covers.py takes the page count from 06_REPORTS/interior-largeprint.json, which has recorded 234 pages since before this phase while the built block was 232. Only re-running 04_BUILD/interior.py regenerates that report and its pagemap. Do it at the first revision after this edition leaves KDP review, then run covers.py.",
    },
  },
};

export function coverFor(bookSlug, format) {
  return REBUILT_COVERS[bookSlug]?.[format] ?? null;
}
