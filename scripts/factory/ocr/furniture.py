#!/usr/bin/env python3
"""furniture.py — tell a page's furniture from its text, structurally.

A printed page carries things that are not the text: a running head, a folio, and
on a Google scan a "Digitized by Google" footer on all 313 leaves. They must come
out, and they are the worst-OCR'd lines on the page, so they cannot be removed by a
list of the spellings you expect. On Falkener that was tried first and quietly
failed — LUDUS LATRUNCULORUM comes back as LTJDUS, LUDDS, LDDUS and LATBUNCULORUM,
and every variant the list had not anticipated was printed mid-sentence.

So furniture is found by what it IS:

  * a short run of lines at the top (or bottom) of the page,
  * set clear of the text block by more than a line and a bit,
  * mostly capitals or a bare number,
  * RECURRING across the volume — which is what separates a running head from a
    section's display title, since the title sits in the same place, looks the same,
    and occurs once.

Nothing here is tuned to one book. Falkener is a 3198-px-tall scan whose heads sit
at 9% of page height; Culin's Korean Games is 5925 px tall with heads at 14% and a
Google footer at 95%. A fixed band fitted neither, which is why there is not one.
"""
from __future__ import annotations

import re
from difflib import SequenceMatcher

HEAD_BAND = 0.22          # a head must at least START in the top fifth
FOOT_BAND = 0.86          # a footer must start below this
HEAD_GAP = 1.30           # measured: the gap under a head runs ~1.5x the leading
HEAD_MAX_LINES = 3        # furniture is never taller than this
MIN_PAGES = 2             # a short chapter shows its head on only two rectos
SIMILARITY = 0.72         # OCR variance between two printings of the same head
MIN_KEY = 4               # letters in a head, once the folio is stripped

BARE_NUMBER = re.compile(r"^\s*[\dIVXLCivxlc]{1,6}\s*$")


def head_key(line: str) -> str:
    """Letters only, uppercased — what two printings of one head share."""
    return re.sub(r"[^A-Z]", "", line.upper())


def _similar(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def strip_folio(text: str) -> str:
    return re.sub(r"^\s*[\dIVXLCivxlc]{1,6}\s+|\s+[\dIVXLCivxlc]{1,6}\s*$", " ", text)


def is_furniture_line(t: str) -> bool:
    """Could this line be part of a head or footer? Caps, or a bare folio."""
    if BARE_NUMBER.match(t):
        return True
    letters = [c for c in t if c.isalpha()]
    return len(letters) >= 2 and sum(1 for c in letters if c.isupper()) / len(letters) >= 0.7


def line_ys(page):
    """(y, text) for every non-empty line that has coordinates, top to bottom."""
    got = []
    for l in page.lines:
        ys = [w.coords[1] for w in l.words if w.coords and len(w.coords) >= 2]
        if ys and l.text.strip():
            got.append((sum(ys) / len(ys), l.text.strip()))
    return sorted(got)


def _run(ys, gaps, idx, body, limit, forward: bool, caps: bool = True):
    """The shortest prefix (or suffix) of furniture lines with white space beyond it.

    `caps` gates on the line looking like a head. It is right at the top of a page,
    where a line of prose would otherwise be swallowed, and wrong at the foot: the
    Google scans end every leaf with "Digitized by / Google", which is not capitals
    at all. At the foot, recurrence across the volume is evidence enough on its own.
    """
    run, fallback = [], None
    for k, i in enumerate(idx):
        y, t = ys[i]
        if caps and not is_furniture_line(t):
            break
        run.append(t)
        g = gaps[i] if forward else gaps[i - 1]
        if g is None or g <= body * HEAD_GAP:
            continue
        # It must contain letters. On a verso the folio is its own OCR line, and
        # stopping at the first gap returned "53" while leaving LUDUS LATBUNCULORUM
        # in the prose; taking the longest run instead swallowed a plate caption.
        if any(c.isalpha() for c in " ".join(run)):
            return list(reversed(run)) if not forward else run
        fallback = list(run)
        if k + 1 >= limit:
            break
    return (list(reversed(fallback)) if fallback and not forward else fallback) or []


def band_lines(page, foot: bool = False) -> list[str]:
    """The lines of furniture at the top (or bottom) of the page, if any."""
    ys = line_ys(page)
    if len(ys) < 3:
        return []
    gaps = [ys[i + 1][0] - ys[i][0] for i in range(len(ys) - 1)] + [None]
    body = sorted(g for g in gaps if g is not None)[len(gaps) // 2] or 1
    h = page.height or 1
    if foot:
        idx = [i for i in range(len(ys) - 1, -1, -1)][:HEAD_MAX_LINES]
        idx = [i for i in idx if ys[i][0] >= h * FOOT_BAND]
        return _run(ys, gaps, idx, body, HEAD_MAX_LINES, forward=False, caps=False)
    idx = [i for i in range(min(HEAD_MAX_LINES, len(ys))) if ys[i][0] <= h * HEAD_BAND]
    return _run(ys, gaps, idx, body, HEAD_MAX_LINES, forward=True)


def furniture_pages(pages, foot: bool = False) -> set[int]:
    """Which pages open (or close) with furniture rather than text.

    Counted across the WHOLE scope, not per section: a head belongs to the book. On
    Falkener, counting within a section saw "THE GAMES OF THE ANCIENT EGYPTIANS"
    twice at the end of section III and left it in the prose.
    """
    band = {p.number: " ".join(band_lines(p, foot)) for p in pages}
    keys = {n: head_key(strip_folio(t)) for n, t in band.items()
            if t and (foot or is_furniture_line(t))}
    out = set()
    for n, k in keys.items():
        # An 8-letter minimum was tried and silently dropped every short head:
        # Culin's recto head over the chess chapter is "CHESS." — five letters —
        # so thirty leaves of the chapter kept their furniture. Position, the white
        # space under the run and recurrence do the work; length adds nothing.
        if len(k) < MIN_KEY:
            continue
        if sum(1 for k2 in keys.values() if _similar(k, k2) >= SIMILARITY) >= MIN_PAGES:
            out.add(n)
    return out


_FOLIO_IN_HEAD = re.compile(r"^\s*(\d{1,4})\b|\b(\d{1,4})\s*$")


def folio_from_head(lines: list[str]) -> int | None:
    """The arabic folio printed at either end of a running head, if there is one."""
    for t in lines:
        if BARE_NUMBER.match(t) and t.strip().isdigit():
            return int(t.strip())
    for t in lines:
        m = _FOLIO_IN_HEAD.search(t)
        if m:
            v = m.group(1) or m.group(2)
            if v and len(t.split()) >= 2:
                return int(v)
    return None
