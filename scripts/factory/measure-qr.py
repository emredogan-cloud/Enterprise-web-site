#!/usr/bin/env python3
"""
Find and measure the QR code on a page of a built interior.

WHY MEASURE RATHER THAN ASSERT
The linkage audit used to answer "is there a QR?" by looking for the sentence
"Scan the code, or type the address" in the extracted text. That is a proxy for
a proxy: it proves a caption was typeset, not that a code was drawn, not that
it is large enough to scan, and not that it points anywhere in particular. A
book that printed the caption and lost the code would have passed.

So this reads the page as a scanner does. The page is rasterised, and the
image is searched for the 1:1:3:1:1 dark-light run signature of a QR finder
pattern — the same signature every decoder looks for. Three finders give the
code's position, its side in points, and therefore its module pitch in
millimetres and its share of the usable page height, which are the two numbers
the house standard is written in.

    measure-qr.py <interior.pdf> <page> [--dpi 200] [--json]

Exit 0 with `{"found": false}` when there is no code; that is an answer, not
an error.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

# A finder pattern is 7 modules wide: 1 dark, 1 light, 3 dark, 1 light, 1 dark.
FINDER_RATIO = (1, 1, 3, 1, 1)
# How far a run may stray from its ideal share before the candidate is dropped.
TOLERANCE = 0.55


def runs(row: list[bool]) -> list[tuple[bool, int, int]]:
    """(is_dark, start, length) for each run in a scanline."""
    out, start = [], 0
    for i in range(1, len(row) + 1):
        if i == len(row) or row[i] != row[start]:
            out.append((row[start], start, i - start))
            start = i
    return out


def finder_hits(row: list[bool]) -> list[tuple[float, float]]:
    """Centres and module sizes of finder-like signatures in one scanline."""
    hits, r = [], runs(row)
    for i in range(len(r) - 4):
        window = r[i:i + 5]
        if not window[0][0]:                       # must start dark
            continue
        lengths = [w[2] for w in window]
        total = sum(lengths)
        if total < 21:                             # 7 modules × 3 px minimum
            continue
        unit = total / 7.0
        if any(abs(l - ideal * unit) > TOLERANCE * unit
               for l, ideal in zip(lengths, FINDER_RATIO)):
            continue
        centre = window[0][1] + total / 2.0
        hits.append((centre, unit))
    return hits


def measure(pdf: Path, page: int, dpi: int = 200) -> dict:
    with tempfile.TemporaryDirectory() as td:
        stem = Path(td) / "p"
        subprocess.run(
            ["pdftoppm", "-f", str(page), "-l", str(page), "-r", str(dpi),
             "-gray", "-png", "-singlefile", str(pdf), str(stem)],
            check=True, capture_output=True,
        )
        img = Image.open(f"{stem}.png").convert("L")
        w, h = img.size
        px = img.load()
        dark = [[px[x, y] < 128 for x in range(w)] for y in range(h)]

    # Horizontal pass, then confirm each candidate vertically. A caption, a
    # rule or a barcode survives one pass; only a finder pattern survives both.
    confirmed: list[tuple[float, float, float]] = []
    for y in range(0, h, 2):
        for cx, unit in finder_hits(dark[y]):
            col = [dark[yy][int(cx)] for yy in range(h)]
            for cy, vunit in finder_hits(col):
                if abs(cy - y) <= unit * 3 and abs(vunit - unit) <= unit * 0.5:
                    confirmed.append((cx, cy, (unit + vunit) / 2))
                    break

    # Collapse the cluster of hits each finder produces into one point.
    centres: list[tuple[float, float, float]] = []
    for cx, cy, unit in confirmed:
        for i, (ox, oy, ounit, n) in enumerate(
                [(c[0], c[1], c[2], c[3]) for c in centres]):
            if abs(cx - ox) < unit * 4 and abs(cy - oy) < unit * 4:
                centres[i] = ((ox * n + cx) / (n + 1), (oy * n + cy) / (n + 1),
                              (ounit * n + unit) / (n + 1), n + 1)
                break
        else:
            centres.append((cx, cy, unit, 1))

    if len(centres) < 3:
        return {"found": False, "findersFound": len(centres), "dpi": dpi}

    # Exactly three finders define a code. Stray candidates do occur — a
    # timing pattern crossing a scanline, or type that happens to run 1:1:3:1:1
    # — and including one inflates the measured side, so keep the three
    # clusters with the most confirmed hits and check they form the L that
    # three finders must: two equal sides meeting at a right angle.
    centres.sort(key=lambda c: -c[3])
    best, best_err = None, None
    from itertools import combinations
    for trio in combinations(centres[:6], 3):
        d = sorted(
            ((trio[i][0] - trio[j][0]) ** 2 + (trio[i][1] - trio[j][1]) ** 2) ** 0.5
            for i, j in ((0, 1), (0, 2), (1, 2))
        )
        if d[0] <= 0:
            continue
        err = abs(d[1] - d[0]) / d[0] + abs(d[2] - d[0] * 2 ** 0.5) / d[0]
        if best_err is None or err < best_err:
            best, best_err = trio, err
    if best is None or best_err > 0.3:
        return {"found": False, "findersFound": len(centres), "dpi": dpi,
                "note": "candidates did not form a finder triangle"}
    centres = list(best)

    xs = [c[0] for c in centres]
    ys = [c[1] for c in centres]
    unit_px = sum(c[2] for c in centres) / len(centres)
    # Finder centres sit 3.5 modules in from each edge of the code.
    left, right = min(xs) - 3.5 * unit_px, max(xs) + 3.5 * unit_px
    top, bottom = min(ys) - 3.5 * unit_px, max(ys) + 3.5 * unit_px
    side_px = max(right - left, bottom - top)
    pt_per_px = 72.0 / dpi
    side_pt = side_px * pt_per_px
    module_mm = unit_px * pt_per_px / 72.0 * 25.4
    return {
        "found": True,
        "dpi": dpi,
        "finders": len(centres),
        "sidePt": round(side_pt, 2),
        "sideIn": round(side_pt / 72.0, 3),
        "modulePx": round(unit_px, 2),
        "moduleMm": round(module_mm, 3),
        "modules": int(round(side_px / unit_px)),
        "pageWidthPt": round(w * pt_per_px, 2),
        "pageHeightPt": round(h * pt_per_px, 2),
        "fractionOfPageHeight": round(side_pt / (h * pt_per_px), 4),
    }


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    pdf, page = Path(sys.argv[1]), int(sys.argv[2])
    dpi = int(sys.argv[sys.argv.index("--dpi") + 1]) if "--dpi" in sys.argv else 200
    print(json.dumps(measure(pdf, page, dpi)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
