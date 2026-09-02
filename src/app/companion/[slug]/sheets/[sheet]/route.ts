import { NextResponse } from "next/server";

import { getCompanion } from "@/lib/companions";
import { renderCompanionSheet } from "@/lib/companion-sheets";
import { logger } from "@/lib/logger";

/**
 * GET /companion/[slug]/sheets/[sheet].pdf — a free, generated practice sheet.
 *
 * Ungated on purpose: no auth, no email, no token. These are the assets the
 * printed book promises, and a reader who scanned a QR code out of a
 * paperback must reach them in one hop. Requiring a subscription first would
 * be the dark pattern the companion exists to avoid.
 *
 * The `.pdf` suffix in the URL is cosmetic — it exists so the link looks like
 * a file to a human and so a browser's "Save as" offers a sensible name — and
 * is stripped before the sheet id is resolved.
 *
 * Generated per request rather than stored: the documents are a few
 * kilobytes of vector drawing, and generating them removes any possibility of
 * a stored asset drifting out of sync with the page that offers it.
 */

/** Sheets are pure functions of their id, so they cache hard and publicly. */
const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; sheet: string }> },
) {
  const { slug, sheet } = await params;

  const companion = getCompanion(slug);
  if (!companion) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  // "practice-grid.pdf" -> "practice-grid"
  const sheetId = sheet.replace(/\.pdf$/i, "");

  // Only serve a sheet this companion actually advertises. Rendering an
  // arbitrary id would let one companion's URL space reach another's.
  const asset = companion.assets.find(
    (a) => a.kind === "generated" && a.href.endsWith(`/${sheetId}.pdf`),
  );
  if (!asset) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  try {
    const bytes = await renderCompanionSheet(sheetId);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="valice-${slug}-${sheetId}.pdf"`,
        "Cache-Control": CACHE,
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch (error) {
    logger.error("companion.sheet.render_failed", { slug, sheetId, error });
    return NextResponse.json({ error: "render-failed" }, { status: 500 });
  }
}
