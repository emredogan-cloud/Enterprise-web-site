#!/usr/bin/env python3
"""
Render the Valice Press companion page and splice it into a built interior.

WHAT THIS IS FOR
A reader who bought a Valice book on Amazon is, commercially, a stranger:
Amazon does not share their address and never will. The one place we may speak
to them again is inside the book they already paid for. That only works if the
message is impossible to miss, so this script draws a *dedicated page* — a QR
occupying between a quarter and a third of the usable page height, the address
printed under it in type large enough to copy by hand, and a specific list of
what is waiting on the other side.

WHAT IT WILL NOT DO
  - It will not silently drop a glyph. Every character of every string is
    checked against the font's cmap before anything is drawn (the Hangul
    NotoSans-Bold incident of 2026-09-03, caught only by `pdffonts`).
  - It will not silently overflow. The layout is solved for the real page, and
    if the content cannot fit with the QR at 25 % of the usable height, it
    raises rather than printing something cramped.
  - It will not re-encode the book. Splicing goes through pikepdf, which
    copies page objects; a 108 MB illustrated interior comes out the far side
    byte-for-byte identical except for the page that changed.

USAGE
    companion-page.py --spec <spec.json> --out <interior.pdf> [--page-only <p.pdf>]

The spec is emitted by `build-companion-pages.mjs`; run that, not this.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pikepdf
import segno
from fontTools.ttLib import TTFont
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLTTFont
from reportlab.pdfgen import canvas

# ── Ink ──────────────────────────────────────────────────────────────────────
# Pure black for the code and the address (a QR wants maximum contrast); a
# near-black for running text, which is how every one of these books is set.
INK = Color(0.07, 0.07, 0.07)
INK_STRONG = Color(0, 0, 0)
INK_QUIET = Color(0.38, 0.38, 0.38)
RULE = Color(0.22, 0.22, 0.22)

# The QR block, as a fraction of the usable page height. The house floor is
# 0.25; anything smaller reads as a footnote and scans badly on cheap phones.
QR_TARGET = 0.30
QR_FLOOR = 0.25

# The smallest a printed QR module may be. KDP prints at 300 DPI on uncoated
# stock; below about 0.4 mm a module bleeds into its neighbour.
MIN_MODULE_MM = 0.5


# ── Fonts ────────────────────────────────────────────────────────────────────
class FontSet:
    """Registers a book's own faces and refuses to print a glyph it lacks."""

    def __init__(self, spec: dict, tag: str):
        self.tag = tag
        self.paths: dict[str, str] = {}
        self.cmaps: dict[str, set[int]] = {}
        for role in ("regular", "bold", "italic", "display"):
            path = spec.get(role)
            if not path:
                continue
            name = f"{tag}-{role}"
            if not Path(path).exists():
                raise SystemExit(f"font missing: {path}")
            pdfmetrics.registerFont(RLTTFont(name, path))
            self.paths[role] = name
            tt = TTFont(path, fontNumber=0, lazy=True)
            covered: set[int] = set()
            for table in tt["cmap"].tables:
                covered.update(table.cmap.keys())
            self.cmaps[role] = covered
            tt.close()
        if "regular" not in self.paths:
            raise SystemExit("font set needs at least a regular face")
        # Fall back rather than crash on a face a book does not have.
        self.paths.setdefault("bold", self.paths["regular"])
        self.paths.setdefault("italic", self.paths["regular"])
        self.paths.setdefault("display", self.paths["bold"])
        for role in ("bold", "italic", "display"):
            self.cmaps.setdefault(role, self.cmaps["regular"])

    def name(self, role: str) -> str:
        return self.paths[role]

    def check(self, text: str, role: str) -> None:
        missing = sorted(
            {ch for ch in text if ord(ch) not in self.cmaps[role] and ch not in "\n\t"}
        )
        if missing:
            codes = ", ".join(f"U+{ord(c):04X} {c!r}" for c in missing)
            raise SystemExit(
                f"font {self.paths[role]} cannot set {codes} — refusing to print "
                f"a page with missing glyphs"
            )


# ── Text measuring and wrapping ──────────────────────────────────────────────
def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    """Greedy wrap. Honours explicit newlines as hard breaks."""
    lines: list[str] = []
    for para in text.split("\n"):
        words, line = para.split(), ""
        for word in words:
            trial = f"{line} {word}".strip()
            if pdfmetrics.stringWidth(trial, font, size) <= width or not line:
                line = trial
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def tracked_width(text: str, font: str, size: float, tracking: float) -> float:
    return pdfmetrics.stringWidth(text, font, size) + tracking * max(len(text) - 1, 0)


# ── The layout ───────────────────────────────────────────────────────────────
@dataclass
class Block:
    """One horizontal band of the page. `gap` is the flexible space beneath."""

    height: float
    gap: float
    draw: object = None
    weight: float = 1.0
    meta: dict = field(default_factory=dict)


def solve(spec: dict, fonts: FontSet, page_w: float, page_h: float) -> tuple[list[Block], float, dict]:
    """
    Compose the page at a type scale that actually fits.

    The blocks are measured at scale 1.0 and the scale is walked down in 2 %
    steps until content + minimum gaps fit inside the usable height. The QR is
    solved last, against whatever the text left, and the whole thing is
    rejected if that lands under the house floor.
    """
    copy = spec["copy"]
    style = spec["style"]
    margin = style["marginIn"] * 72.0
    gutter = style.get("gutterShiftPt", 0.0)
    col_w = page_w - 2 * margin
    usable_h = page_h - 2 * margin

    for step in range(0, 26):
        s = 1.0 - step * 0.02
        blocks = compose(spec, fonts, col_w, usable_h, s)
        content = sum(b.height for b in blocks)
        gaps = sum(b.gap for b in blocks[:-1])
        if content + gaps <= usable_h:
            qr_side = next(b.meta["qr_side"] for b in blocks if "qr_side" in b.meta)
            if qr_side < QR_FLOOR * usable_h:
                raise SystemExit(
                    f"{spec['id']}: the QR would be {qr_side / usable_h:.1%} of the "
                    f"usable height, under the {QR_FLOOR:.0%} house floor"
                )
            slack = usable_h - content - gaps
            return blocks, slack, {
                "scale": s,
                "margin": margin,
                "gutter": gutter,
                "col_w": col_w,
                "usable_h": usable_h,
                "qr_side": qr_side,
                "qr_fraction": qr_side / usable_h,
            }
    raise SystemExit(f"{spec['id']}: content will not fit on {page_w:.0f}×{page_h:.0f} pt")


def compose(spec: dict, fonts: FontSet, col_w: float, usable_h: float, s: float) -> list[Block]:
    copy = spec["copy"]
    house = spec["house"]
    reg, bold, ital, disp = (fonts.name(r) for r in ("regular", "bold", "italic", "display"))
    blocks: list[Block] = []

    # 1 · Masthead — a rule, the standing line in letterspaced caps, a rule.
    eyebrow_size = 9.4 * s
    blocks.append(Block(height=eyebrow_size * 1.9 + 2, gap=17 * s, meta={"kind": "masthead", "size": eyebrow_size}))

    # 2 · The headline, in the book's display face.
    head_size = 18.5 * s
    head_lines = wrap(copy["headline"], disp, head_size, col_w * 0.94)
    blocks.append(Block(height=len(head_lines) * head_size * 1.22, gap=10 * s,
                        meta={"kind": "headline", "lines": head_lines, "size": head_size}))

    # 3 · One sentence saying what the reader gets and why it is worth a scan.
    promise_size = 10.4 * s
    promise_lines = wrap(copy["promise"], ital, promise_size, col_w * 0.86)
    blocks.append(Block(height=len(promise_lines) * promise_size * 1.36, gap=20 * s,
                        meta={"kind": "promise", "lines": promise_lines, "size": promise_size}))

    # 4 · The code. Everything else on the page exists to get the reader here.
    qr_side = QR_TARGET * usable_h * (0.55 + 0.45 * s)
    qr_side = min(qr_side, col_w * 0.62)
    pad = qr_side * 0.075
    blocks.append(Block(height=qr_side + 2 * pad, gap=10 * s,
                        meta={"kind": "qr", "qr_side": qr_side, "pad": pad}))

    # 5 · The address, printed. A reader must never decode a code to learn
    #     where it goes, and phones without a scanner still exist.
    scan_size = 8.8 * s
    url_role = spec["style"].get("urlFace", "bold")
    url_font = fonts.name(url_role)
    addr_size = (17.0 if url_role == "regular" else 15.5) * s
    while pdfmetrics.stringWidth(copy["printedUrl"], url_font, addr_size) > col_w * 0.95 and addr_size > 9:
        addr_size -= 0.4
    blocks.append(Block(height=scan_size * 1.5 + addr_size * 1.45, gap=19 * s,
                        meta={"kind": "address", "scan_size": scan_size, "addr_size": addr_size,
                              "url_role": url_role}))

    # 6 · What is actually on the other side, named specifically.
    list_head_size = 8.4 * s
    bullet_size = 9.4 * s
    inset = bullet_size * 1.25
    rows = []
    for b in copy["bullets"]:
        text = f"{b['term']} — {b['gloss']}" if b["gloss"] else b["term"]
        lines = wrap(text, reg, bullet_size, col_w - inset - 10 * s)
        rows.append({"term": b["term"], "lines": lines})
    rows_h = sum(len(r["lines"]) * bullet_size * 1.32 for r in rows) + (len(rows) - 1) * 5.5 * s
    blocks.append(Block(height=list_head_size * 2.6 + rows_h, gap=15 * s,
                        meta={"kind": "list", "head_size": list_head_size, "size": bullet_size,
                              "rows": rows, "inset": inset}))

    # 7 · The promise that makes the rest credible. Printed because it is true.
    free_size = 9.2 * s
    free_lines = wrap(copy.get("freeLine") or house["freeLine"], ital, free_size, col_w * 0.9)
    blocks.append(Block(height=len(free_lines) * free_size * 1.34, gap=16 * s,
                        meta={"kind": "free", "lines": free_lines, "size": free_size}))

    # 8 · The book itself, so the page belongs to it: its own cover, small,
    #     with its title and imprint set beside it.
    foot_h = 0.0
    if spec.get("coverImage"):
        foot_h = min(64 * s, usable_h * 0.13)
    else:
        foot_h = 22 * s
    blocks.append(Block(height=foot_h, gap=0, meta={"kind": "footer", "height": foot_h, "size": 8.6 * s}))
    return blocks


# ── Drawing ──────────────────────────────────────────────────────────────────
def draw_qr(c: canvas.Canvas, url: str, x: float, y: float, side: float) -> dict:
    """
    Draw the code as vector rectangles. Never as an image: a rasterised code
    picks up resampling artefacts at the printer's RIP, and the edges of the
    finder patterns are exactly what a phone looks for.
    """
    qr = segno.make(url, error="m")
    matrix = [list(row) for row in qr.matrix]
    n = len(matrix)
    module = side / n
    module_mm = module / 72.0 * 25.4
    if module_mm < MIN_MODULE_MM:
        raise SystemExit(
            f"QR module would print at {module_mm:.2f} mm, under the "
            f"{MIN_MODULE_MM} mm floor — enlarge the block or shorten the URL"
        )
    c.setFillColor(INK_STRONG)
    for r, row in enumerate(matrix):
        run = 0
        for col in range(n + 1):
            on = col < n and row[col]
            if on:
                run += 1
                continue
            if run:
                c.rect(x + (col - run) * module, y + side - (r + 1) * module,
                       run * module, module, stroke=0, fill=1)
                run = 0
    return {"modules": n, "module_pt": module, "module_mm": module_mm,
            "version": qr.version, "error": "M"}


def centred(c: canvas.Canvas, text: str, font: str, size: float, cx: float, y: float,
            tracking: float = 0.0) -> None:
    if tracking:
        w = tracked_width(text, font, size, tracking)
        x = cx - w / 2
        c.setFont(font, size)
        for ch in text:
            c.drawString(x, y, ch)
            x += pdfmetrics.stringWidth(ch, font, size) + tracking
    else:
        c.setFont(font, size)
        c.drawCentredString(cx, y, text)


def render(spec: dict, out_path: Path) -> dict:
    page_w, page_h = spec["pageWidthPt"], spec["pageHeightPt"]
    fonts = FontSet(spec["style"]["fonts"], spec["id"].replace("/", "-"))
    copy, house = spec["copy"], spec["house"]

    # Refuse before drawing, not after.
    for role, strings in (
        ("display", [copy["headline"]]),
        ("bold", [house["eyebrow"], copy["listHeading"]] + [b["term"] for b in copy["bullets"]]),
        (spec["style"].get("urlFace", "bold"), [copy["printedUrl"]]),
        ("italic", [copy["promise"], copy.get("freeLine") or house["freeLine"]]),
        ("regular", [house["scanLine"], copy["footerTitle"], copy["imprint"]]
                    + [f"{b['term']} — {b['gloss']}" for b in copy["bullets"]]),
    ):
        for text in strings:
            fonts.check(text, role)

    blocks, slack, geo = solve(spec, fonts, page_w, page_h)
    reg, bold, ital, disp = (fonts.name(r) for r in ("regular", "bold", "italic", "display"))

    # ReportLab writes an initial `BT /F1 12 Tf` into every content stream, and
    # F1 defaults to Helvetica — a base-14 face that is NOT embedded and that
    # KDP flags on upload. Naming one of the book's own faces as the initial
    # font is the only way to keep it off the page; `pdffonts` on the finished
    # interior is what catches a regression.
    c = canvas.Canvas(str(out_path), pagesize=(page_w, page_h),
                      initialFontName=fonts.name("regular"), initialFontSize=10)
    c.setTitle(f"{copy['footerTitle']} — companion page")
    c.setAuthor(spec.get("pdfAuthor", ""))
    margin, col_w, gutter = geo["margin"], geo["col_w"], geo["gutter"]
    left = margin + gutter
    cx = left + col_w / 2
    # A little of the slack goes above the masthead so the page is optically
    # centred rather than glued to the top margin.
    y = page_h - margin - slack * 0.34
    extra = slack * 0.66 / max(len(blocks) - 1, 1)
    report: dict = {}

    for i, b in enumerate(blocks):
        m = b.meta
        kind = m["kind"]
        top = y

        if kind == "masthead":
            size = m["size"]
            c.setStrokeColor(RULE)
            c.setLineWidth(spec["style"].get("rule", 0.7))
            c.line(left, top - 1, left + col_w, top - 1)
            tracking = size * 0.19
            centred(c, house["eyebrow"], bold, size, cx, top - size * 1.55, tracking)
            c.setLineWidth(spec["style"].get("rule", 0.7) * 0.6)
            c.line(left, top - b.height, left + col_w, top - b.height)

        elif kind == "headline":
            c.setFillColor(INK)
            yy = top - m["size"] * 0.96
            for line in m["lines"]:
                centred(c, line, disp, m["size"], cx, yy)
                yy -= m["size"] * 1.22

        elif kind == "promise":
            c.setFillColor(INK)
            yy = top - m["size"] * 1.02
            for line in m["lines"]:
                centred(c, line, ital, m["size"], cx, yy)
                yy -= m["size"] * 1.36

        elif kind == "qr":
            side, pad = m["qr_side"], m["pad"]
            box = side + 2 * pad
            bx = cx - box / 2
            by = top - box
            # A hairline panel with generous quiet space inside it: the code
            # must sit on white, never on a rule and never on artwork.
            c.setFillColor(Color(1, 1, 1))
            c.setStrokeColor(RULE)
            c.setLineWidth(spec["style"].get("rule", 0.7))
            c.rect(bx, by, box, box, stroke=1, fill=1)
            report["qr"] = draw_qr(c, copy["qrUrl"], bx + pad, by + pad, side)
            report["qr"]["side_pt"] = side
            report["qr"]["fraction_of_usable_height"] = side / geo["usable_h"]
            # Kept so the code can be read back off the finished page and
            # compared with the URL it is meant to carry.
            report["qr"]["x_pt"] = bx + pad
            report["qr"]["y_pt"] = by + pad

        elif kind == "address":
            c.setFillColor(INK_QUIET)
            centred(c, house["scanLine"], reg, m["scan_size"], cx, top - m["scan_size"] * 1.05)
            c.setFillColor(INK_STRONG)
            centred(c, copy["printedUrl"], fonts.name(m["url_role"]), m["addr_size"],
                    cx, top - m["scan_size"] * 1.5 - m["addr_size"] * 1.02)

        elif kind == "list":
            c.setStrokeColor(RULE)
            c.setLineWidth(spec["style"].get("rule", 0.7) * 0.6)
            c.line(left, top - 1, left + col_w, top - 1)
            c.setFillColor(INK_QUIET)
            centred(c, copy["listHeading"], bold, m["head_size"], cx,
                    top - m["head_size"] * 2.0, m["head_size"] * 0.17)
            yy = top - m["head_size"] * 2.6
            for row in m["rows"]:
                first = True
                for line in row["lines"]:
                    yy -= m["size"] * 1.06
                    if first:
                        c.setFillColor(INK_QUIET)
                        c.setFont(reg, m["size"])
                        c.drawString(left, yy, "·")
                        # The term is set bold inside the running line, so the
                        # reader can scan the four nouns without reading prose.
                        term = row["term"]
                        c.setFillColor(INK)
                        c.setFont(bold, m["size"])
                        c.drawString(left + m["inset"], yy, term)
                        rest = line[len(term):]
                        c.setFont(reg, m["size"])
                        c.drawString(left + m["inset"] + pdfmetrics.stringWidth(term, bold, m["size"]),
                                     yy, rest)
                        first = False
                    else:
                        c.setFillColor(INK)
                        c.setFont(reg, m["size"])
                        c.drawString(left + m["inset"], yy, line)
                    yy -= m["size"] * 0.26
                yy -= 5.5 * geo["scale"]

        elif kind == "free":
            c.setFillColor(INK)
            yy = top - m["size"] * 1.04
            for line in m["lines"]:
                centred(c, line, ital, m["size"], cx, yy)
                yy -= m["size"] * 1.34

        elif kind == "footer":
            size = m["size"]
            h = m["height"]
            if spec.get("coverImage"):
                from reportlab.lib.utils import ImageReader

                img = ImageReader(spec["coverImage"])
                iw, ih = img.getSize()
                ch_ = h
                cw = ch_ * iw / ih
                gapx = 11 * geo["scale"]
                text_w = max(
                    pdfmetrics.stringWidth(copy["footerTitle"], reg, size),
                    pdfmetrics.stringWidth(copy["imprint"], reg, size * 0.92),
                )
                total = cw + gapx + text_w
                fx = cx - total / 2
                fy = top - h
                c.drawImage(img, fx, fy, cw, ch_, mask=None)
                c.setStrokeColor(RULE)
                c.setLineWidth(0.4)
                c.rect(fx, fy, cw, ch_, stroke=1, fill=0)
                c.setFillColor(INK)
                c.setFont(reg, size)
                c.drawString(fx + cw + gapx, fy + ch_ / 2 + 1, copy["footerTitle"])
                c.setFillColor(INK_QUIET)
                c.setFont(reg, size * 0.92)
                c.drawString(fx + cw + gapx, fy + ch_ / 2 - size * 1.05, copy["imprint"])
            else:
                c.setFillColor(INK_QUIET)
                centred(c, copy["imprint"], reg, size, cx, top - h * 0.6, size * 0.1)

        y = top - b.height - b.gap - (extra if i < len(blocks) - 1 else 0)

    # The folio, in the book's own position, face and size. A page without one
    # in a book that numbers its pages announces itself as an insert.
    folio = spec.get("folio")
    if folio:
        num = str(folio["number"])
        size = folio["size"]
        c.setFillColor(INK)
        yy = folio["baselineFromBottomPt"]
        if folio["style"] == "outer":
            outer = folio["outerMarginPt"]
            if spec["recto"]:
                c.setFont(reg, size)
                c.drawRightString(page_w - outer, yy, num)
            else:
                c.setFont(reg, size)
                c.drawString(outer, yy, num)
        else:
            shift = folio.get("gutterShiftPt", 0.0)
            centred(c, num, reg, size, page_w / 2 + (shift if spec["recto"] else -shift), yy)

    c.showPage()
    c.save()
    report["layout"] = {
        "pageWidthPt": page_w, "pageHeightPt": page_h,
        "marginPt": margin, "usableHeightPt": geo["usable_h"],
        "typeScale": round(geo["scale"], 3),
    }
    return report


# ── Splicing ─────────────────────────────────────────────────────────────────
def blank_page_like(pdf: pikepdf.Pdf, model: pikepdf.Page) -> pikepdf.Page:
    page = pikepdf.Dictionary(
        Type=pikepdf.Name.Page,
        MediaBox=model.obj.MediaBox,
        Resources=pikepdf.Dictionary(),
        Contents=pdf.make_stream(b""),
    )
    return pikepdf.Page(pdf.make_indirect(page))


def splice(spec: dict, page_pdf: Path, out_path: Path) -> dict:
    src = Path(spec["interior"])
    with pikepdf.open(src) as pdf, pikepdf.open(page_pdf) as new:
        before = len(pdf.pages)
        if spec["mode"] == "replace":
            idx = spec["page"] - 1
            pdf.pages.insert(idx, new.pages[0])
            del pdf.pages[idx + 1]
            at = spec["page"]
        else:
            pdf.pages.append(new.pages[0])
            at = len(pdf.pages)
            if spec.get("trailingBlank"):
                pdf.pages.append(blank_page_like(pdf, pdf.pages[at - 1]))
        # Metadata is what a library catalogue reads. The Field Book shipped
        # "untitled / anonymous"; nothing leaves here that way again.
        meta = spec.get("docInfo") or {}
        if meta:
            with pdf.open_metadata(set_pikepdf_as_editor=False) as xmp:
                if meta.get("title"):
                    xmp["dc:title"] = meta["title"]
                if meta.get("author"):
                    xmp["dc:creator"] = [meta["author"]]
            if meta.get("title"):
                pdf.docinfo["/Title"] = meta["title"]
            if meta.get("author"):
                pdf.docinfo["/Author"] = meta["author"]
        out_path.parent.mkdir(parents=True, exist_ok=True)
        pdf.save(out_path, linearize=False)
        return {"pagesBefore": before, "pagesAfter": len(pdf.pages), "companionPage": at}


# ── Reading the code back off the finished page ──────────────────────────────
def verify_qr(pdf: Path, page: int, box: tuple[float, float, float], url: str, dpi: int = 300) -> dict:
    """
    Render the finished page and read the code module by module.

    A printed QR is permanent. "We drew one" is not evidence that it carries
    the right address, and no decoder is installed on this machine — so the
    page is rasterised at print resolution, each module's centre is sampled,
    and the resulting bit matrix is compared with the matrix the URL produces.
    A single flipped module fails the check.
    """
    import subprocess
    import tempfile

    from PIL import Image

    x, y, side = box
    expected = [list(row) for row in segno.make(url, error="m").matrix]
    n = len(expected)
    with tempfile.TemporaryDirectory() as td:
        stem = Path(td) / "page"
        subprocess.run(
            ["pdftoppm", "-f", str(page), "-l", str(page), "-r", str(dpi), "-gray", "-png",
             "-singlefile", str(pdf), str(stem)],
            check=True, capture_output=True,
        )
        img = Image.open(f"{stem}.png").convert("L")
        px_w, px_h = img.size
        scale = dpi / 72.0
        page_h_pt = px_h / scale
        module = side / n
        mismatches = 0
        got = []
        for r in range(n):
            row = []
            for col in range(n):
                cx_pt = x + (col + 0.5) * module
                cy_pt = y + side - (r + 0.5) * module
                px = int(round(cx_pt * scale))
                py = int(round((page_h_pt - cy_pt) * scale))
                px = max(0, min(px_w - 1, px))
                py = max(0, min(px_h - 1, py))
                dark = img.getpixel((px, py)) < 128
                row.append(dark)
                if dark != bool(expected[r][col]):
                    mismatches += 1
            got.append(row)
    return {
        "matches": mismatches == 0,
        "modules": n,
        "mismatchedModules": mismatches,
        "url": url,
        "dpi": dpi,
        "detail": (
            f"{n}×{n} modules read off the printed page at {dpi} dpi and matched "
            f"the code for {url}"
            if mismatches == 0
            else f"{mismatches} of {n * n} modules differ from the code for {url}"
        ),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--page-only")
    ap.add_argument("--verify", type=int, help="read the code back off page N of --out")
    ap.add_argument("--qr-box", help="x,y,side in points, from the render report")
    args = ap.parse_args()

    spec = json.loads(Path(args.spec).read_text())

    if args.verify:
        x, y, side = (float(v) for v in args.qr_box.split(","))
        print(json.dumps(verify_qr(Path(args.out), args.verify, (x, y, side),
                                   spec["copy"]["qrUrl"]), ensure_ascii=False))
        return 0

    # The new leaf is cut to the size of the leaf it joins, read from the file
    # rather than from a table: three of these books are 6×9, three are 8.5×11
    # and two hardcovers are 8.25×11, and a guess would print a page that KDP
    # rejects at upload.
    with pikepdf.open(spec["interior"]) as ref:
        model = ref.pages[(spec["page"] - 1) if spec["mode"] == "replace" else -1]
        box = [float(v) for v in model.obj.MediaBox]
        if int(model.obj.get("/Rotate", 0)) % 360:
            raise SystemExit(f"{spec['id']}: reference page is rotated; not handled")
        spec["pageWidthPt"] = round(box[2] - box[0], 4)
        spec["pageHeightPt"] = round(box[3] - box[1], 4)
        if abs(box[0]) > 0.01 or abs(box[1]) > 0.01:
            raise SystemExit(f"{spec['id']}: MediaBox origin is not 0,0; not handled")
    page_pdf = Path(args.page_only or args.out).with_suffix(".page.pdf")
    report = render(spec, page_pdf)
    if args.page_only:
        print(json.dumps({"page": str(page_pdf), **report}, ensure_ascii=False))
        return 0
    report.update(splice(spec, page_pdf, Path(args.out)))
    page_pdf.unlink(missing_ok=True)
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
