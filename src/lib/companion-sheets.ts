/**
 * Printable companion sheets, generated with pdf-lib.
 *
 * These are drawn rather than stored because a drawn sheet is (a) exactly
 * right at any paper size, (b) free of any third-party rights — the geometry
 * is ours — and (c) impossible to get out of sync with the book, since there
 * is no binary asset to forget to update.
 *
 * Deliberately typeface-free where Korean glyphs would be needed. Embedding a
 * CJK font would add several megabytes to every request and drag a font
 * licence into a free download; the grids are for the reader's own
 * handwriting, so they need no Korean type at all. Latin labels use the
 * standard PDF base fonts, which need no embedding or licence.
 */

import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

/** US Letter in points. Letter, not A4 — the primary market is the US. */
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;

const INK = rgb(0.09, 0.09, 0.11);
const GUIDE = rgb(0.72, 0.72, 0.74);
const FAINT = rgb(0.87, 0.87, 0.89);
const ACCENT = rgb(0.08, 0.42, 0.28);

type Ctx = { doc: PDFDocument; regular: PDFFont; bold: PDFFont };

/** Shared page furniture: title, subtitle, and a quiet footer credit. */
function frame(page: PDFPage, ctx: Ctx, title: string, subtitle: string) {
  page.drawText(title, {
    x: MARGIN,
    y: PAGE_H - MARGIN - 12,
    size: 15,
    font: ctx.bold,
    color: INK,
  });
  page.drawText(subtitle, {
    x: MARGIN,
    y: PAGE_H - MARGIN - 30,
    size: 9,
    font: ctx.regular,
    color: rgb(0.42, 0.42, 0.46),
  });
  page.drawText("Valice Press · valicepress.com/companion/hangul · free to print", {
    x: MARGIN,
    y: 30,
    size: 7.5,
    font: ctx.regular,
    color: rgb(0.55, 0.55, 0.58),
  });
}

/**
 * 원고지-style square grid: heavy cell borders with faint quarter-guides, the
 * conventional shape for practising Hangul syllable blocks.
 */
function drawPracticeGrid(page: PDFPage, ctx: Ctx, pageNo: number, pages: number) {
  frame(
    page,
    ctx,
    "Hangul practice grid",
    `Write one syllable block per square. Sheet ${pageNo} of ${pages}.`,
  );

  const cols = 10;
  const top = PAGE_H - MARGIN - 58;
  const bottom = MARGIN + 46;
  const cell = (PAGE_W - MARGIN * 2) / cols;
  const rows = Math.floor((top - bottom) / cell);
  const gridTop = top;
  const gridLeft = MARGIN;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gridLeft + c * cell;
      const y = gridTop - (r + 1) * cell;

      // Quarter guides first, so the cell border draws over them.
      page.drawLine({
        start: { x: x + cell / 2, y },
        end: { x: x + cell / 2, y: y + cell },
        thickness: 0.4,
        color: FAINT,
        dashArray: [2, 3],
      });
      page.drawLine({
        start: { x, y: y + cell / 2 },
        end: { x: x + cell, y: y + cell / 2 },
        thickness: 0.4,
        color: FAINT,
        dashArray: [2, 3],
      });
      page.drawRectangle({
        x,
        y,
        width: cell,
        height: cell,
        borderColor: GUIDE,
        borderWidth: 0.7,
      });
    }
  }
}

/**
 * Big boxes for drilling one letter. A small marker in the top-left corner
 * shows where a stroke starts, which is the thing beginners most often get
 * wrong and the reason the book teaches order before speed.
 */
function drawStrokeBoxes(page: PDFPage, ctx: Ctx, pageNo: number, pages: number) {
  frame(
    page,
    ctx,
    "Stroke-order practice boxes",
    `One letter per row. The dot marks where the first stroke begins. Sheet ${pageNo} of ${pages}.`,
  );

  const cols = 12;
  const top = PAGE_H - MARGIN - 62;
  const bottom = MARGIN + 46;
  const cell = (PAGE_W - MARGIN * 2) / cols;
  const rowGap = 14;
  const rows = Math.floor((top - bottom) / (cell + rowGap));

  for (let r = 0; r < rows; r++) {
    const y = top - r * (cell + rowGap) - cell;

    // Label gutter so the learner can write which letter the row drills.
    page.drawLine({
      start: { x: MARGIN, y: y - 4 },
      end: { x: MARGIN + 26, y: y - 4 },
      thickness: 0.6,
      color: FAINT,
    });

    for (let c = 0; c < cols; c++) {
      const x = MARGIN + c * cell;
      page.drawRectangle({
        x,
        y,
        width: cell,
        height: cell,
        borderColor: c === 0 ? ACCENT : GUIDE,
        borderWidth: c === 0 ? 1.1 : 0.7,
      });
      // Start-corner marker.
      page.drawCircle({
        x: x + cell * 0.22,
        y: y + cell * 0.78,
        size: 1.3,
        color: c === 0 ? ACCENT : FAINT,
      });
    }
  }
}

/**
 * Thirty rows, three checkboxes each — the book's own trace / dot-start /
 * empty-box progression. No lesson titles: those are the book's content, and
 * a free sheet that reproduced them would be giving the book away rather
 * than supporting it.
 */
function drawLessonTracker(page: PDFPage, ctx: Ctx) {
  frame(
    page,
    ctx,
    "Thirty-lesson progress tracker",
    "Three passes per lesson: trace, dot-start, empty box. Mark a pass only when you did it without looking.",
  );

  const headerY = PAGE_H - MARGIN - 56;
  const labels = ["trace", "dots", "blank"];
  const boxW = 13;
  const boxGap = 7;
  const colX = PAGE_W - MARGIN - (boxW + boxGap) * 3;

  labels.forEach((l, i) => {
    page.drawText(l, {
      x: colX + i * (boxW + boxGap) - 2,
      y: headerY + 4,
      size: 6.5,
      font: ctx.regular,
      color: rgb(0.5, 0.5, 0.54),
    });
  });

  const rows = 30;
  const top = headerY - 8;
  const bottom = MARGIN + 46;
  const step = (top - bottom) / rows;

  for (let i = 0; i < rows; i++) {
    const y = top - (i + 1) * step;
    const n = String(i + 1).padStart(2, "0");

    page.drawText(n, {
      x: MARGIN,
      y: y + 3,
      size: 8.5,
      font: ctx.bold,
      color: i % 5 === 4 ? ACCENT : INK,
    });
    // Writing rule for the learner's own note on what the lesson covered.
    page.drawLine({
      start: { x: MARGIN + 22, y: y },
      end: { x: colX - 12, y },
      thickness: 0.4,
      color: FAINT,
    });
    for (let b = 0; b < 3; b++) {
      page.drawRectangle({
        x: colX + b * (boxW + boxGap),
        y: y + 0.5,
        width: boxW,
        height: boxW,
        borderColor: GUIDE,
        borderWidth: 0.7,
      });
    }
  }
}

const BUILDERS: Record<string, (ctx: Ctx) => void> = {
  "practice-grid": (ctx) => {
    const pages = 4;
    for (let i = 1; i <= pages; i++) {
      drawPracticeGrid(ctx.doc.addPage([PAGE_W, PAGE_H]), ctx, i, pages);
    }
  },
  "stroke-boxes": (ctx) => {
    const pages = 2;
    for (let i = 1; i <= pages; i++) {
      drawStrokeBoxes(ctx.doc.addPage([PAGE_W, PAGE_H]), ctx, i, pages);
    }
  },
  "lesson-tracker": (ctx) => {
    drawLessonTracker(ctx.doc.addPage([PAGE_W, PAGE_H]), ctx);
  },
};

/** Ids this module can build — used to validate a route param. */
export const COMPANION_SHEET_IDS = Object.keys(BUILDERS);

/**
 * Render a companion sheet to PDF bytes. Throws on an unknown id so a route
 * cannot silently serve an empty document.
 */
export async function renderCompanionSheet(id: string): Promise<Uint8Array> {
  const build = BUILDERS[id];
  if (!build) throw new Error(`Unknown companion sheet: ${id}`);

  const doc = await PDFDocument.create();
  doc.setTitle(`Valice Press — Hangul companion: ${id}`);
  doc.setProducer("Valice Press");
  doc.setCreator("valicepress.com");

  const ctx: Ctx = {
    doc,
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  build(ctx);
  return doc.save();
}
