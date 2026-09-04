#!/usr/bin/env python3
"""crop.py — put a suspect OCR token in front of a human, on its own page.

The correction rule for Phase 2 is that a token is only corrected once the
printed page has been looked at. That is impossible at 150 dpi across a whole
leaf, so this crops the band around the word using the coordinates the OCR
itself recorded, and scales it up.

    python3 crop.py <file_djvu.xml> <scan.pdf> --page 28 --token Eoman --out /tmp/x.png

The coordinates in `_djvu.xml` are in the DjVu page's own pixel space, which is
not the PDF's point space, so they are converted by ratio rather than assumed
to match. Nothing here decides anything; it produces the picture.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from djvu import read_pages  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("xml")
    ap.add_argument("pdf")
    ap.add_argument("--page", type=int, required=True, help="1-based scan page")
    ap.add_argument("--token", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--dpi", type=int, default=400)
    ap.add_argument("--pad", type=int, default=90, help="extra pixels of context")
    a = ap.parse_args()

    pages = read_pages(a.xml)
    page = pages[a.page - 1]
    hit = next((w for w in page.words
                if w.text.strip(".,;:!?()[]\"'“”‘’") == a.token and w.coords), None)
    if not hit:
        print(f"crop: {a.token!r} not found on scan page {a.page}", file=sys.stderr)
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-f", str(a.page), "-l", str(a.page),
                        "-r", str(a.dpi), "-png", a.pdf, f"{tmp}/pg"],
                       check=True, capture_output=True)
        rendered = next(Path(tmp).glob("pg*.png"))
        from PIL import Image
        im = Image.open(rendered)

        # djvu coords are in the djvu page's pixel space; scale to the render
        sx = im.width / (page.width or im.width)
        sy = im.height / (page.height or im.height)
        x0, y0, x1, y1 = hit.coords[:4]
        left, right = sorted((x0, x1))
        top, bottom = sorted((y0, y1))
        box = (max(0, int(left * sx) - a.pad), max(0, int(top * sy) - a.pad),
               min(im.width, int(right * sx) + a.pad),
               min(im.height, int(bottom * sy) + a.pad))
        crop = im.crop(box)
        if crop.width < 900:                      # make it legible
            f = 900 / max(crop.width, 1)
            crop = crop.resize((int(crop.width * f), int(crop.height * f)), Image.LANCZOS)
        crop.save(a.out)
        print(f"crop: scan page {a.page}, token {a.token!r}, "
              f"confidence {hit.confidence} -> {a.out} ({crop.width}x{crop.height})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
