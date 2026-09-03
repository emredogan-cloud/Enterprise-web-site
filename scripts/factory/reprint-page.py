#!/usr/bin/env python3
"""
Re-set one page of a built interior, faithfully, changing only what must change.

WHY THIS EXISTS
Some defects are one paragraph deep. The Great Book of World Games large print
carries an invented author biography — "a puzzle designer, mythologist, and
game archivist" — on its copyright page: a claim about a real person that the
person did not make. Re-running that book's whole typesetting pipeline to fix
one paragraph would re-flow 232 pages and invalidate every measured page
number in the project's own reports. Editing the content stream in place is
worse: the text is justified, the fonts are subset, and the replacement is
longer than the original, so the line breaks move anyway.

So the page is re-set: same face, same size, same measure, same origin, same
leading — all four measured off the page being replaced with `pdftotext
-bbox`, never assumed — with the one paragraph corrected. The result is
compared back against the original line geometry, and a job that does not land
within a fraction of a point of where the original text sat is rejected.

Run through `reprint-page.mjs`, which holds the jobs and the measurements.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pikepdf
from fontTools.ttLib import TTFont
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLTTFont
from reportlab.pdfgen import canvas


def load_fonts(spec: dict, tag: str) -> dict[str, str]:
    names = {}
    for role, path in spec.items():
        name = f"{tag}-{role}"
        pdfmetrics.registerFont(RLTTFont(name, path))
        tt = TTFont(path, fontNumber=0, lazy=True)
        covered: set[int] = set()
        for table in tt["cmap"].tables:
            covered.update(table.cmap.keys())
        tt.close()
        names[role] = (name, covered)
    return names


def runs_width(runs: list[tuple[str, str]], fonts: dict, size: float) -> float:
    return sum(pdfmetrics.stringWidth(t, fonts[r][0], size) for r, t in runs)


def wrap_runs(runs: list[tuple[str, str]], fonts: dict, size: float, width: float):
    """Wrap a run-styled paragraph (bold lead-in, regular remainder)."""
    lines: list[list[tuple[str, str]]] = []
    current: list[tuple[str, str]] = []
    for role, text in runs:
        for word in text.split(" "):
            if not word:
                continue
            trial = current + [(role, (" " if current else "") + word)]
            if runs_width(trial, fonts, size) <= width or not current:
                current = trial
            else:
                lines.append(current)
                current = [(role, word)]
    if current:
        lines.append(current)
    return lines


def render(spec: dict, out: Path) -> dict:
    fonts = load_fonts(spec["fonts"], "rp")
    for role, text in [(r, t) for para in spec["paragraphs"] for r, t in (para or [])]:
        missing = sorted({c for c in text if ord(c) not in fonts[role][1]})
        if missing:
            raise SystemExit(f"font for role {role} cannot set {missing!r}")

    w, h = spec["pageWidthPt"], spec["pageHeightPt"]
    c = canvas.Canvas(str(out), pagesize=(w, h),
                      initialFontName=fonts["regular"][0], initialFontSize=spec["sizePt"])
    c.setFillColor(Color(0, 0, 0))
    size, leading = spec["sizePt"], spec["leadingPt"]
    x = spec["leftPt"]
    y = h - spec["firstBaselineFromTopPt"]
    measure = spec["measurePt"]
    drawn = 0
    for para in spec["paragraphs"]:
        if not para:                      # a blank line between blocks
            y -= leading
            continue
        for line in wrap_runs(para, fonts, size, measure):
            cx = x
            for role, text in line:
                c.setFont(fonts[role][0], size)
                c.drawString(cx, y, text)
                cx += pdfmetrics.stringWidth(text, fonts[role][0], size)
            y -= leading
            drawn += 1
    if spec.get("folio"):
        f = spec["folio"]
        c.setFont(fonts["regular"][0], f["size"])
        c.drawString(f["xPt"], f["baselineFromBottomPt"], str(f["number"]))
    c.showPage()
    c.save()
    return {"linesDrawn": drawn, "lastBaselineFromTopPt": h - y - leading}


def splice(interior: Path, page: int, page_pdf: Path, out: Path) -> dict:
    with pikepdf.open(interior) as pdf, pikepdf.open(page_pdf) as new:
        before = len(pdf.pages)
        pdf.pages.insert(page - 1, new.pages[0])
        del pdf.pages[page]
        pdf.save(out, linearize=False)
        return {"pages": before}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--page-only", action="store_true")
    args = ap.parse_args()
    spec = json.loads(Path(args.spec).read_text())

    with pikepdf.open(spec["interior"]) as ref:
        box = [float(v) for v in ref.pages[spec["page"] - 1].obj.MediaBox]
        spec["pageWidthPt"] = round(box[2] - box[0], 4)
        spec["pageHeightPt"] = round(box[3] - box[1], 4)

    page_pdf = Path(args.out).with_suffix(".page.pdf")
    report = render(spec, page_pdf)
    if not args.page_only:
        report.update(splice(Path(spec["interior"]), spec["page"], page_pdf, Path(args.out)))
        page_pdf.unlink(missing_ok=True)
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
