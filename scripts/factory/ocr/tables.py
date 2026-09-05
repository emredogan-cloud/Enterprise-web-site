#!/usr/bin/env python3
"""tables.py — rebuild a printed table from OCR word coordinates.

WHY THIS EXISTS
Falkener prints his worked games as four-column move tables. An OCR reads a page in
lines, and a line crosses all four columns, so the text layer returns

    14—15 127—126 43—44 78—77 15—16 126—125 85—86 116—106 …

which is not a table, not prose, and not usable. On the Falkener scan sixteen
paragraphs — about an eighth of the source text — came out like that. Printing it
would have been the worst thing in the book; dropping it would have thrown away the
worked games the edition's own apparatus tells the reader to watch.

The coordinates are in the OCR. So the table is rebuilt from them: words are grouped
into rows by their vertical centre, columns are found by clustering left edges, and
each word is placed in the cell it was actually printed in. Nothing is inferred and
nothing is invented — this is the same ink, read in the right order.

Reusable across the Phase 2 books; Culin's Korean Games is full of tables too.
"""
from __future__ import annotations

import re
import statistics
from dataclasses import dataclass, field

# A move as this book sets it: "14—15", "66—88+87", "99a—99+88", "26—37+36, 46".
MOVE = re.compile(r"^\d{1,3}[a-z]?\s*[—–\-]+\s*\d{1,3}[a-z]?(?:\s*\+\s*\d{1,3}[a-z]?"
                  r"(?:\s*,\s*\d{1,3}[a-z]?)*)?[.,]?$")
# A column heading: "White.", "Black.", "Red.", "Throws.", "Enters."
HEADING = re.compile(r"^(White|Black|Red|Throws?|Enters?|Moves?|Takes?)\.?$", re.I)


@dataclass
class Cell:
    text: str
    x0: float
    x1: float


@dataclass
class Row:
    y: float
    cells: list[Cell] = field(default_factory=list)

    @property
    def tabular(self) -> int:
        return sum(1 for c in self.cells if is_tabular(c.text))

    @property
    def headings(self) -> int:
        return sum(1 for c in self.cells if HEADING.match(c.text.strip()))


def is_tabular(t: str) -> bool:
    """A cell that belongs in a move table rather than in a sentence.

    Deliberately wider than the move notation. Falkener sets three different kinds
    of table — move pairs for Tau, brace-joined pairs for Senat, and columns of bare
    throws for the bowl game — and a rule that only knew about "14—15" found the
    first and walked past the other two.
    """
    t = t.strip(" .,;|{}()")
    if not t or len(t) > 16:
        return False
    if MOVE.match(t):
        return True
    letters = sum(1 for c in t if c.isalpha())
    digits = sum(1 for c in t if c.isdigit())
    return digits >= 1 and letters <= 2


def _xy(w):
    """(left, right, vertical centre, height), tolerating either coordinate order."""
    x0, y0, x1, y1 = w.coords[:4]
    return min(x0, x1), max(x0, x1), (y0 + y1) / 2.0, abs(y1 - y0)


def group_rows(words, tol: float) -> list[Row]:
    """Words into the printed rows they sit on.

    Only the LEFT edge of a word is trusted. This encoder tiles its word boxes across
    the line — "14—16" is given a box 367 px wide, running all the way to the next
    word — so a right edge means "where the next word starts", and any attempt to
    merge words into cells by the gap between them merged the whole row into one.
    Cells are assembled instead by the column a word starts in, in `to_grid`.
    """
    got = sorted((_xy(w)[2], _xy(w)[0], _xy(w)[1], w.text) for w in words if w.coords)
    rows: list[Row] = []
    for y, x0, x1, t in got:
        if rows and abs(y - rows[-1].y) <= tol:
            rows[-1].cells.append(Cell(t, x0, x1))
        else:
            rows.append(Row(y, [Cell(t, x0, x1)]))
    for r in rows:
        r.cells.sort(key=lambda c: c.x0)
    return rows


def column_edges(rows: list[Row], tol: float, share: float = 0.5) -> list[float]:
    """Left edges of the columns, found by DENSITY rather than by gaps.

    A column start is a left edge that recurs on most of the rows. Splitting the
    sorted left edges wherever they jumped by more than a threshold was tried first
    and collapsed the table: a wide cell like "16—17+26" reaches the OCR as two words,
    and the second one sits between two columns, bridging the gap that was supposed
    to separate them. On one page that chained three columns into one.

    Counting instead is immune to it — a real column appears once per row, a stray
    tail appears once or twice in the whole table.
    """
    xs = sorted(c.x0 for r in rows for c in r.cells)
    if not xs:
        return []
    clusters, cur = [], [xs[0]]
    for a, b in zip(xs, xs[1:]):
        if b - a <= tol:
            cur.append(b)
        else:
            clusters.append(cur); cur = [b]
    clusters.append(cur)
    floor = max(2, len(rows) * share)
    return [min(c) for c in clusters if len(c) >= floor]


def to_grid(rows: list[Row], edges: list[float]) -> list[list[str]]:
    """Place every cell in the column it was printed in."""
    grid = []
    for r in rows:
        cells = [""] * len(edges)
        for c in r.cells:
            i = max((i for i, e in enumerate(edges) if c.x0 >= e - 1), default=0)
            cells[i] = (cells[i] + " " + c.text).strip()
        grid.append(cells)
    return grid


def find_tables(page, min_rows: int = 4, min_cells: int = 3,
                narrow_rows: int = 6) -> list[dict]:
    """Every move table on the page, as {headings, rows, yFrom, yTo}.

    A table is a run of consecutive printed rows each carrying tabular cells: at
    least `min_cells` of them over `min_rows` rows, or two of them over `narrow_rows`
    — Falkener sets some games in two columns and some in four, and a flat rule of
    three cells walked past every two-column game in the book.
    """
    words = [w for l in page.lines for w in l.words if w.coords]
    if len(words) < 20:
        return []
    # SCALE FROM THE TYPE, NOT FROM THE GAPS. Taking the median gap between distinct
    # y centres gave 2 px here — the four cells of one printed row sit within about
    # 8 px of each other, so most "gaps" are intra-row jitter and the median measured
    # the jitter, not the leading. The word height is the stable ruler: rows on this
    # page are ~63 px apart and the type is ~37 px tall.
    heights = [_xy(w)[3] for w in words]
    em = statistics.median(heights) or 30
    rows = group_rows(words, tol=em * 0.55)

    out, i = [], 0
    while i < len(rows):
        if rows[i].tabular < 2:
            i += 1
            continue
        j = i
        while j + 1 < len(rows) and rows[j + 1].tabular >= 2:
            j += 1
        n = j - i + 1
        wide = min(r.tabular for r in rows[i:j + 1]) >= min_cells
        if n >= (min_rows if wide else narrow_rows):
            block = rows[i:j + 1]
            edges = column_edges(block, tol=em * 0.6)
            head = []
            if i > 0 and rows[i - 1].headings >= 2:
                head = to_grid([rows[i - 1]], edges)[0]
            out.append({"headings": head,
                        "rows": to_grid(block, edges),
                        "columns": len(edges),
                        "yFrom": block[0].y, "yTo": block[-1].y})
        i = j + 1
    return out


# ── repairing move cells ─────────────────────────────────────────────────────
# These are not guesses. Falkener numbers his board 10 to 129, and prints two
# overflow ranks as 19a..129a and 19b..129b. So a cell number above 129 is not a
# square on his board, and the only thing it can be is one of those two ranks with
# its letter misread. The OCR makes exactly that substitution, visibly and
# systematically: the board key on scan 71 comes back with its "a" rank as 190, 290,
# 390 … and its "b" rank as 193, 293, 393 …, which is a→0 and b→3.
#
# Every rule below is constrained by the numbering the page itself prints. Anything
# that does not resolve to a square on the board is left alone and counted, not
# quietly changed.
_CELL_MIN, _CELL_MAX = 10, 129


def _fix_cell_number(tok: str) -> str:
    if not re.fullmatch(r"\d{3,4}", tok):
        return tok
    if _CELL_MIN <= int(tok) <= _CELL_MAX:
        return tok
    head, tail = tok[:-1], tok[-1]
    if _CELL_MIN <= int(head) <= _CELL_MAX and tail in "03":
        return head + ("a" if tail == "0" else "b")
    return tok


def clean_move_cell(text: str) -> str:
    """Repair the character-level damage in one move cell."""
    t = text.strip().strip("-–—»«|>*")
    t = re.sub(r"^[Il|](?=\d)", "1", t)              # I9b -> 19b
    t = t.replace("«", "a").replace("<z", "a").replace("<Z", "a")
    # A digit broken by a stray hyphen, BEFORE the dashes are normalised — running
    # the dash rule first turned "2-5—26" into "2—5—26" instead of "25—26".
    t = re.sub(r"(?<=\d)-(?=\d\s*[—–_])", "", t)
    t = re.sub(r"(?<=\d)[_—–\-]+(?=\s*\d)", "—", t)  # 117_106 -> 117—106
    t = re.sub(r"\s*—\s*", "—", t)
    t = re.sub(r"\s*\+\s*", "+", t)
    t = re.sub(r"(?<=\d\d)[o0](?![\d])", "a", t)     # 39o -> 39a
    t = re.sub(r"\d{3}", lambda m: _fix_cell_number(m.group(0)), t)
    t = re.sub(r"^1\s+(?=\d{2}—)", "", t)            # a footnote marker before a move
    t = re.sub(r"\s+1$", "", t)                      # ... or after one
    return t.strip(" .,")


def is_prose(text: str) -> bool:
    """A cell that is really running prose — a footnote under the last row of a
    table, or a line of Falkener's commentary between two games."""
    t = re.sub(r"\b\d{1,3}[ab]?\b", " ", text)      # cell numbers are not words
    return bool(re.search(r"[A-Za-z]{2,}", t))


VALID_MOVE = re.compile(r"^\d{1,3}[ab]?—\d{1,3}[ab]?"
                        r"(?:\+\d{1,3}[ab]?(?:,\s*\d{1,3}[ab]?)*)?$")


def split_double(cell: str) -> list[str]:
    """Two moves that landed in one cell because a column edge was missed."""
    parts = [p for p in re.split(r"\s{1,}", cell.strip()) if p]
    if len(parts) == 2 and all(VALID_MOVE.match(clean_move_cell(p)) for p in parts):
        return [clean_move_cell(p) for p in parts]
    return [cell]


def valid_square(tok: str) -> bool:
    """A square on Falkener's board: 10 to 129, with an optional a or b rank.

    The range matters. A bare "^\\d{1,3}[ab]?$" passed 891 and 991 — misreadings of
    89b and 99b — as good cells, which is a silent error and worse than a marked one.
    """
    m = re.fullmatch(r"(\d{1,3})([ab]?)", tok)
    return bool(m) and _CELL_MIN <= int(m.group(1)) <= _CELL_MAX


class _SquareMatcher:
    match = staticmethod(lambda t: valid_square(t) or None)


VALID_SQUARE = _SquareMatcher()


def table_kind(table: dict) -> str:
    """What sort of table this is, from what its cells look like.

    Falkener sets three: `moves`, the worked games in move-pair notation; `grid`,
    the numbered boards that those games refer to; and `other`, which here is the
    bowl game's throw-and-enter form, which the OCR does not read well enough to
    reproduce. Validating a grid against the move notation marked every one of its
    cells unreadable, which is how this function came to exist.
    """
    cells = [c for r in table["rows"] for c in r if c.strip() and not is_prose(c)]
    if not cells:
        return "empty"
    clean = [clean_move_cell(c) for c in cells]
    moves = sum(1 for c in clean if VALID_MOVE.match(c))
    squares = sum(1 for c in clean if VALID_SQUARE.match(c))
    if moves / len(cells) >= 0.5:
        return "moves"
    if squares / len(cells) >= 0.5:
        return "grid"
    return "other"


def tidy(table: dict) -> dict:
    """Clean a reconstructed table and mark what could not be read.

    Every cell is repaired by the rules above and then checked against Falkener's
    own numbering. A cell that still does not resolve to a move on his board is
    KEPT AND MARKED, never silently corrected and never quietly dropped: the reader
    is told which readings this edition could not make out, and can go to the scan.
    """
    kind = table_kind(table)
    valid = VALID_SQUARE if kind == "grid" else VALID_MOVE
    headings = [h.strip(" .") for h in table.get("headings", [])]
    rows, flagged, prose = [], 0, 0
    for r in table["rows"]:
        out = []
        for c in r:
            c = c.strip()
            if not c:
                out.append({"t": ""}); continue
            if is_prose(c):
                prose += 1
                out.append({"t": ""}); continue
            parts = split_double(c) if kind == "moves" else [c]
            if len(parts) == 2 and len(out) + 1 < len(r):
                out.append({"t": parts[0]})
                c = parts[1]
            cc = clean_move_cell(c)
            ok = bool(valid.match(cc))
            if not ok:
                flagged += 1
            out.append({"t": cc} if ok else {"t": cc, "unread": True})
        while len(out) > len(r):
            out.pop()
        rows.append(out)
    # drop columns that ended up empty everywhere
    keep = [i for i in range(len(rows[0]))
            if any(i < len(r) and r[i]["t"] for r in rows)]
    rows = [[r[i] if i < len(r) else {"t": ""} for i in keep] for r in rows]
    if len(headings) == len(keep):
        pass
    elif headings:
        headings = headings[:len(keep)] + [""] * max(0, len(keep) - len(headings))
    cells = sum(1 for r in rows for c in r if c["t"])
    return {"kind": kind, "headings": headings, "rows": rows, "columns": len(keep),
            "cells": cells, "unread": flagged, "proseDropped": prose}
