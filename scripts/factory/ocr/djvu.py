#!/usr/bin/env python3
"""djvu.py — read an Internet Archive `_djvu.xml` into pages, lines and words.

Phase 2 is the first scan-sourced phase, and every title in it comes from an
Internet Archive scan rather than a proof-read Gutenberg transcription. This is
the shared reader for all of them: one parser, five books.

WHY THE XML AND NOT THE .txt
`_djvu.txt` is the same OCR flattened. It loses two things this house needs:

  * the page boundary, so a quotation can no longer be cited to the page of the
    scan it came from — and a Valice edition that cannot point at its own
    source page has no way to answer "where does this text come from?";
  * `x-confidence` per word, which is the only signal available for finding
    the places where the OCR is likely to be wrong without reading 400 pages.

Both matter more here than in Phase 1, where the source was already proof-read
by volunteers. Nothing in this module corrects anything: it reads what the OCR
says, with its own uncertainty attached, and hands it on.

Usage as a module:

    from djvu import read_pages
    pages = read_pages("…_djvu.xml")      # -> [Page, Page, …]

Usage from the command line:

    python3 djvu.py <file_djvu.xml> --stats
    python3 djvu.py <file_djvu.xml> --page 42
"""
from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Word:
    text: str
    confidence: int | None
    coords: tuple[int, ...] | None

    def low(self, ceiling: int) -> bool:
        """Is this word in the uncertain tail, given the file's own scale?

        MEASURE THE SCALE, DO NOT ASSUME IT. `x-confidence` is not a percentage
        and its range differs between derives. On the Falkener scan the values
        run 0–30 with the mass at 28–30, so a fixed "< 40" threshold flagged
        100% of the words and told us nothing. `ceiling` is the highest value
        actually observed in the file; a word is in the tail if it sits below a
        third of it.

        A word in the tail is *unusual*, not wrong. On this book the tail is
        full of Pachisi, Seega and Ludus — proper nouns no OCR dictionary
        carries. Treat it as a place to look, never as a verdict.
        """
        return self.confidence is not None and self.confidence < ceiling / 3


@dataclass
class Line:
    words: list[Word] = field(default_factory=list)

    @property
    def text(self) -> str:
        return " ".join(w.text for w in self.words)


@dataclass
class Page:
    number: int              # 1-based index of the scanned image
    image: str               # the page file the OCR came from
    width: int | None
    height: int | None
    lines: list[Line] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "\n".join(l.text for l in self.lines)

    @property
    def words(self) -> list[Word]:
        return [w for l in self.lines for w in l.words]

    @property
    def mean_confidence(self) -> float | None:
        vals = [w.confidence for w in self.words if w.confidence is not None]
        return sum(vals) / len(vals) if vals else None


def _int(value: str | None) -> int | None:
    try:
        return int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def read_pages(path: str | Path) -> list[Page]:
    """Parse the whole file. Streamed, because these run to 200 MB."""
    pages: list[Page] = []
    page = None
    line = None
    n = 0

    for event, el in ET.iterparse(str(path), events=("start", "end")):
        if event == "start" and el.tag == "OBJECT":
            n += 1
            image = ""
            for p in el.findall("PARAM"):
                if p.get("name") == "PAGE":
                    image = p.get("value") or ""
            page = Page(number=n, image=image,
                        width=_int(el.get("width")), height=_int(el.get("height")))
        elif event == "start" and el.tag == "LINE":
            line = Line()
        elif event == "end" and el.tag == "WORD" and line is not None:
            coords = el.get("coords")
            line.words.append(Word(
                text=(el.text or "").strip(),
                confidence=_int(el.get("x-confidence")),
                coords=tuple(int(x) for x in coords.split(",")) if coords else None,
            ))
        elif event == "end" and el.tag == "LINE" and page is not None and line is not None:
            if line.words:
                page.lines.append(line)
            line = None
        elif event == "end" and el.tag == "OBJECT" and page is not None:
            # The PAGE param is only readable once the OBJECT's children exist.
            for p in el.findall("PARAM"):
                if p.get("name") == "PAGE":
                    page.image = p.get("value") or page.image
            pages.append(page)
            page = None
            el.clear()

    return pages


# ── printed page numbers ─────────────────────────────────────────────────────
# The scan's Nth image is not the book's page N: front matter, plates and the
# scanning of the boards all shift it. A citation has to name the number the
# reader can see, so it is read off the page rather than counted.
_FOLIO = re.compile(r"^\s*(\d{1,4})\s*$")


def printed_folio(page: Page, band: float = 0.12) -> int | None:
    """The page number printed on the leaf, if one is legible.

    Looks only in the top and bottom bands, where a folio can be, and only at
    lines that are nothing but digits. Returns None rather than guessing — a
    wrong page reference is worse than an absent one.
    """
    if not page.height:
        return None
    top = page.height * band
    bottom = page.height * (1 - band)
    for l in page.lines:
        m = _FOLIO.match(l.text)
        if not m:
            continue
        ys = [w.coords[1] for w in l.words if w.coords and len(w.coords) >= 2]
        if not ys:
            continue
        y = sum(ys) / len(ys)
        if y <= top or y >= bottom:
            return int(m.group(1))
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("xml")
    ap.add_argument("--stats", action="store_true")
    ap.add_argument("--page", type=int)
    a = ap.parse_args()

    pages = read_pages(a.xml)

    if a.page:
        p = pages[a.page - 1]
        print(f"# scan page {p.number}  image={p.image}  "
              f"printed folio={printed_folio(p)}  mean confidence={p.mean_confidence:.1f}"
              if p.mean_confidence else f"# scan page {p.number}")
        print(p.text)
        return 0

    words = [w for p in pages for w in p.words]
    conf = [w.confidence for w in words if w.confidence is not None]
    folios = sum(1 for p in pages if printed_folio(p) is not None)
    print(f"pages          {len(pages)}")
    print(f"words          {len(words):,}")
    if conf:
        conf_sorted = sorted(conf)
        ceiling = conf_sorted[-1]
        tail = sum(1 for c in conf if c < ceiling / 3)
        print(f"confidence     mean {sum(conf)/len(conf):.1f}  "
              f"median {conf_sorted[len(conf_sorted)//2]}  "
              f"min {conf_sorted[0]}  max {ceiling}   (scale read from the file)")
        print(f"uncertain tail {tail:,} ({tail/len(conf)*100:.1f}%) below {ceiling/3:.0f}")
    print(f"printed folios {folios} of {len(pages)} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
