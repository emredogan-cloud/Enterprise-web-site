/**
 * When the page count moves, what else must move with it?
 *
 * A page added to an interior is not a change to the interior. It is a change
 * to the spine, therefore to the wrap width, therefore to the position of
 * every element measured from the wrap's outer edge, therefore to the cover
 * file, therefore to KDP's acceptance of that file. This module does that
 * arithmetic once so that no report has to do it in prose.
 *
 * SOURCES — `valice-house/covers/COVER_STANDARDS.md` §4, itself taken from
 * KDP's printing specification G201953020 and verified against the cover
 * geometry the book projects wrote for their own live editions.
 *
 * The recorded reason this file exists: Codex Enigmatica's hardcover cover was
 * once computed from the *paperback's* page count (0.8058 in against the
 * 0.8103 in it needed), and a wrap was once built on white-paper arithmetic
 * for a cream-paper book — a 0.068 in error, outside tolerance, on a file that
 * had already been reported clean.
 *
 *   node scripts/factory/spine-check.mjs --pages 124:126 --trim 8.5x11 --paper white
 *   node scripts/factory/spine-check.mjs --plan          # every planned edition
 */

/** Spine width contributed by one page. [V, KDP G201953020] */
export const SPINE_PER_PAGE_IN = {
  white: 0.002252,
  cream: 0.0025,
  "premium-color": 0.002347,
};

/**
 * KDP accepts a cover whose dimensions are within this of the calculated
 * template. It is not a licence to skip the recalculation — it is the number
 * that decides whether a rebuild is *required* or merely *correct*.
 */
export const KDP_TOLERANCE_IN = 0.0625;

/** Spine text needs a spine to sit on. */
export const SPINE_TEXT_MIN_PAGES = 79;

export const BLEED_IN = 0.125;

export function spineWidthIn(pages, paper = "white") {
  const per = SPINE_PER_PAGE_IN[paper];
  if (!per) throw new Error(`unknown paper: ${paper}`);
  return pages * per;
}

/**
 * Full paperback wrap geometry. Hardcover case wraps are NOT derived here:
 * the house standard requires them to be read from KDP's own calculator for
 * the hardcover page count and paper, because the case adds hinge and
 * wrap-around allowances that no formula in this repository owns.
 */
export function wrapIn({ pages, trimWidthIn, trimHeightIn, paper = "white" }) {
  const spine = spineWidthIn(pages, paper);
  return {
    spineWidthIn: round(spine),
    wrapWidthIn: round(2 * BLEED_IN + 2 * trimWidthIn + spine),
    wrapHeightIn: round(trimHeightIn + 2 * BLEED_IN),
    spineTextAllowed: pages >= SPINE_TEXT_MIN_PAGES,
  };
}

/**
 * The whole question, answered for one edition.
 *
 * `coverRebuildRequired` is true when the old cover falls outside KDP's
 * tolerance and would be rejected. `coverRebuildCorrect` is true whenever the
 * page count moved at all: the spine is a measured quantity and a cover that
 * states the wrong one is wrong even when it is accepted.
 */
export function assess({ pagesBefore, pagesAfter, trimWidthIn, trimHeightIn, paper = "white", binding = "paperback" }) {
  const before = wrapIn({ pages: pagesBefore, trimWidthIn, trimHeightIn, paper });
  const after = wrapIn({ pages: pagesAfter, trimWidthIn, trimHeightIn, paper });
  const deltaSpine = round(after.spineWidthIn - before.spineWidthIn);
  const deltaWrap = round(after.wrapWidthIn - before.wrapWidthIn);
  const changed = pagesAfter !== pagesBefore;
  return {
    pagesBefore,
    pagesAfter,
    paper,
    binding,
    trim: `${trimWidthIn}×${trimHeightIn} in`,
    before,
    after,
    deltaSpineIn: deltaSpine,
    deltaWrapWidthIn: deltaWrap,
    withinKdpTolerance: Math.abs(deltaWrap) <= KDP_TOLERANCE_IN,
    coverRebuildRequired: changed && Math.abs(deltaWrap) > KDP_TOLERANCE_IN,
    coverRebuildCorrect: changed,
    // Hardcover geometry is never derived — it is read from KDP's calculator.
    hardcoverGeometryMustBeRead: binding === "hardcover" && changed,
    barcodeZoneAffected: false,
    verdict: !changed
      ? "no page-count change: spine, wrap, cover and ISBN placement are untouched"
      : Math.abs(deltaWrap) > KDP_TOLERANCE_IN
        ? `wrap width moves ${deltaWrap} in — outside KDP's ±${KDP_TOLERANCE_IN} in tolerance; the cover MUST be rebuilt`
        : `wrap width moves ${deltaWrap} in — inside KDP's ±${KDP_TOLERANCE_IN} in tolerance, so the existing cover would be accepted, but the spine it states is now wrong by ${deltaSpine} in and the house rule is that each edition's cover reads its own page count`,
  };
}

function round(n) {
  return Math.round(n * 1e6) / 1e6;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const arg = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? undefined : argv[i + 1];
  };
  if (argv.includes("--plan")) {
    const { EDITION_GEOMETRY } = await import("./edition-geometry.mjs");
    const { COMPANION_PAGE_PLAN } = await import("./companion-page-spec.mjs");
    const rows = [];
    for (const [slug, book] of Object.entries(COMPANION_PAGE_PLAN)) {
      for (const [format, ed] of Object.entries(book.editions)) {
        const geo = EDITION_GEOMETRY[slug]?.[format];
        if (!geo) continue;
        rows.push({
          edition: `${slug}/${format}`,
          ...assess({ pagesBefore: ed.pagesBefore, pagesAfter: ed.pagesAfter, ...geo }),
        });
      }
    }
    if (argv.includes("--json")) {
      console.log(JSON.stringify(rows, null, 2));
    } else {
      for (const r of rows) {
        const flag = r.coverRebuildRequired ? "COVER REBUILD REQUIRED" : r.coverRebuildCorrect ? "cover rebuild correct" : "cover unchanged";
        console.log(`${r.edition.padEnd(46)} ${String(r.pagesBefore).padStart(4)} → ${String(r.pagesAfter).padEnd(4)}  spine ${r.before.spineWidthIn.toFixed(4)} → ${r.after.spineWidthIn.toFixed(4)} in  ${flag}`);
        console.log(`  ${r.verdict}`);
      }
    }
  } else {
    const [a, b] = (arg("pages") ?? "").split(":").map(Number);
    const [w, h] = (arg("trim") ?? "6x9").split("x").map(Number);
    console.log(JSON.stringify(assess({
      pagesBefore: a, pagesAfter: b, trimWidthIn: w, trimHeightIn: h,
      paper: arg("paper") ?? "white", binding: arg("binding") ?? "paperback",
    }), null, 2));
  }
}
