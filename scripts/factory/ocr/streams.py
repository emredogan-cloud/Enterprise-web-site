#!/usr/bin/env python3
"""
streams.py — separating what a scanned page actually contains.

A page of OCR is one stream of lines in the order they happen to sit. A printed page is
not: it is body text, footnotes and figure captions, sometimes side by side, sometimes
wrapped around a figure, with the occasional patch that is not text at all but the
scanner's reading of a drawing or of the ghost a tissue guard prints onto the facing
page. Read as one stream, all of that arrives spliced through the author's sentences.

These are the instruments the Phase 2 books needed for that, extracted here after the
second book so the third does not reimplement them. Each one was written against a
specific failure and the comment on it names that failure, because the failure is the
argument for the rule.

  line_metrics / size_class   body, footnote and caption, told apart by type size
  is_junk / split_debris      prose against the reading of a picture
  rejoin                      paragraphs the parse cut at the foot of a page
  dehyphenate                 words the compositor broke across a line

Used by the Valice public-domain factory. Nothing here is specific to one book; the
thresholds are fractions of a page's own measurements, never absolute sizes.
"""
from __future__ import annotations

import re
import statistics

MARK = "[Korean, Chinese or Japanese script]"
BREAK_MARK = "[the scan breaks off here]"

# ── the three sizes of type on Culin's page ──────────────────────────────────
# Culin sets figures INTO the text and the text wraps round them, so a caption's lines
# share their vertical position with body lines beside them. Read in y-order — which is
# what a page of OCR gives you — the caption is spliced through the sentence:
#
#   "…the Chinese form of the Sanskrit Bodhisattva, Fig. 3.— Dogu, or Ancient In Madrid,
#    Spain, it Earthen Idol. Japan. is sold with other chil-"
#
# and on leaf 196 the caption's last word was even hyphen-joined to the body's next one,
# giving "From a native drawinKsize and the Pawns". Twenty-one leaves are affected, nine
# of them in Culin's introduction, which is the argument the whole book is evidence for.
#
# SIZE SETTLES IT, and it is measured rather than assumed: on these pages the body runs
# about 63 units, Culin's footnotes about 49, and the figure captions about 39. The
# thresholds below are fractions of the page's OWN median, so a differently scanned leaf
# scales with it. Note that "Fig. 6." set INSIDE a sentence as a cross-reference is body
# height and stays where it is — which is the distinction a word-list would have missed.
CAPTION_MAX = 0.74      # below this share of the body size, it is a figure caption
FOOTNOTE_MAX = 0.88     # between the two, it is one of Culin's footnotes


def book_body_height(pages) -> float:
    """The body size of the WHOLE volume, measured once over every leaf in scope."""
    hs = [abs(w.coords[3] - w.coords[1]) for p in pages for w in p.words
          if w.coords and len(w.coords) >= 4]
    return statistics.median(hs) if hs else 0.0


def line_metrics(page, book: float = 0.0) -> tuple[float, dict]:
    """(the body size to judge this page by, per-line median height).

    A PAGE THAT IS MOSTLY CAPTION HAS A CAPTION-SIZED MEDIAN, and judged against itself
    every caption on it reads as body: leaf 56 is a sheet of figures with a few lines of
    text, and its captions were set as Culin's prose, one after another, "Fig. 5. Fig. 8.
    Fig. 6. Fig. 7." So the page's own median is used only when the page is mostly body;
    otherwise the volume's median stands in for it.
    """
    hs = [abs(w.coords[3] - w.coords[1]) for w in page.words
          if w.coords and len(w.coords) >= 4]
    med = statistics.median(hs) if hs else 0.0
    if book and med < book * 0.9:
        med = book
    per = {}
    for i, l in enumerate(page.lines):
        ws = [abs(w.coords[3] - w.coords[1]) for w in l.words
              if w.coords and len(w.coords) >= 4]
        if ws:
            per[i] = statistics.median(ws)
    return med, per


def size_class(h: float, body: float) -> str:
    if not body or not h:
        return "body"
    r = h / body
    if r < CAPTION_MAX:
        return "caption"
    if r < FOOTNOTE_MAX:
        return "footnote"
    return "body"


# ── what is prose and what is a picture ──────────────────────────────────────
# Culin's pages carry line figures, and the plates are interleaved with tissue guards
# that print a ghost of the facing page onto the scan. The OCR reads both. Some of it is
# obvious rubbish — "o "o GO GO o tit '^ o o" is the domino figure on leaf 236 — and
# some of it is worse than obvious: leaf 227 returns ": ' ■ H'VrU'AI — TABLETS. IS the
# name ^ivcn to the most popular", which is the tissue ghost of the sentence printed
# properly two leaves earlier, and reads like something Culin wrote. Neither may be set
# as his prose.
WORDY = re.compile(r"^[A-Za-z][A-Za-z'\u2019-]*$")


def is_junk(tok: str) -> bool:
    """Is this token a piece of a picture rather than a word?

    A LONE LETTER IS THE SIGNATURE OF ILLUSTRATION OCR. Culin's prose uses exactly two
    one-letter words; every other single letter on these pages is a fragment of a
    drawing. Numbers and Culin's roman numerals are always real.
    """
    core = tok.strip(".,;:!?()[]\"'\u201c\u201d\u2018\u2019\u2014-*")
    if not core:
        return True
    if re.fullmatch(r"[0-9]+([.,-][0-9]+)*", core):
        return False
    if re.fullmatch(r"[IVXLC]+\.?", core):
        return False
    letters = sum(c.isalpha() for c in core)
    if letters == 0:
        return True
    if len(core) == 1:
        return core not in ("a", "A", "I")
    if not WORDY.fullmatch(core) and letters / len(core) < 0.8:
        return True
    return any(1 for c in core if not c.isalnum() and c not in "-'\u2019")


# A run of this many unreadable tokens together is a figure, not a stumble.
DEBRIS_RUN = 6
# A segment this junk-ridden is a ghost even when the junk is spread through it.
DEBRIS_SHARE, DEBRIS_TOKENS = 0.28, 12
DEBRIS_SHARE_SHORT, DEBRIS_TOKENS_SHORT = 0.60, 4


def _measure(toks: list[str]) -> tuple[float, int]:
    real = [t for t in toks if t != MARK]
    j = sum(1 for t in real if is_junk(t))
    return (j / len(real) if real else 0.0), j


def split_debris(body: str) -> list[tuple[str, object]]:
    """A paragraph into the parts that can be read and the parts that cannot.

    Splitting INSIDE a paragraph rather than judging the whole of it matters: leaf 224
    opens with a clause of Culin's on how the domino pieces are reckoned and then runs
    into the OCR of Figure 109. Marking the paragraph would have thrown his sentence
    away with the picture.
    """
    toks: list[str] = []
    raw = body.split()
    i = 0
    while i < len(raw):
        if raw[i] == "[Korean," and " ".join(raw[i:i + 5]) == MARK:
            toks.append(MARK); i += 5
        else:
            toks.append(raw[i]); i += 1

    runs, i = [], 0
    while i < len(toks):
        if is_junk(toks[i]):
            j = i
            while j < len(toks) and (is_junk(toks[j]) or toks[j] == MARK):
                j += 1
            while j > i and toks[j - 1] == MARK:      # do not eat a trailing marker
                j -= 1
            if j - i >= DEBRIS_RUN:
                runs.append((i, j))
            # ALWAYS ADVANCE. The script marker counts as unreadable, so a run made only
            # of markers had its end rolled back onto its start by the trim above, and
            # the parse never finished the paragraph.
            i = max(j, i + 1)
        else:
            i += 1

    out: list[tuple[str, object]] = []
    cut = 0
    for a, b in runs + [(len(toks), len(toks))]:
        if a > cut:
            out.append(("para", toks[cut:a]))
        if b > a:
            out.append(("debris", toks[a:b]))
        cut = b

    final: list[tuple[str, object]] = []
    for kind, seg in out:
        if kind == "debris":
            final.append(("debris", seg)); continue
        share, j = _measure(seg)
        long_bad = share >= DEBRIS_SHARE and j >= DEBRIS_TOKENS
        short_bad = share >= DEBRIS_SHARE_SHORT and j >= DEBRIS_TOKENS_SHORT
        final.append((("debris" if (long_bad or short_bad) else "para"), seg))
    return final


# A paragraph runs across the foot of a page; the parse sees each leaf separately and
# so cuts it in two. On this book that put 23 false paragraph breaks into the text, one
# of them splitting "seldom carried beyond the eighth" from "rank, his strongest
# position." The halves are joined again, but only on evidence:
#   - the leaves are consecutive, so nothing was skipped between them;
#   - the first half ends with a plain lower-case word, not with a stop and not with the
#     tail of a figure caption ("Museum,", "No. 570,", "x6,8|" all end a leaf here);
#   - the second half opens lower-case, so it is not a new sentence.
# Every join is written to QA/joins.json with both halves, so the operation can be
# checked rather than trusted.
OPEN_END = re.compile(r"""[.!?:;”"'\)\]]\s*$""")
PLAIN_WORD = re.compile(r"[a-z][a-z'\u2019-]*,?$")


def rejoin(blocks: list[dict], joins: list[dict]) -> list[dict]:
    out: list[dict] = []
    for b in blocks:
        prev = out[-1] if out else None
        # Compare against the leaf the joined block now ENDS on. A paragraph that runs
        # over three leaves joined once and then stopped, because the merged block still
        # carried the number of the first of them.
        end = prev.get("scanPageEnd", prev["scanPage"]) if prev else None
        if (prev is not None and prev["kind"] == "para" and b["kind"] == "para"
                and b["scanPage"] - end == 1
                and not OPEN_END.search(prev["text"].rstrip())
                and PLAIN_WORD.fullmatch(prev["text"].split()[-1])
                and re.match(r"[a-z]", b["text"].lstrip())):
            joins.append({"leaves": [end, b["scanPage"]],
                          "endOf": " ".join(prev["text"].split()[-9:]),
                          "startOf": " ".join(b["text"].split()[:9])})
            prev["text"] = prev["text"].rstrip() + " " + b["text"].lstrip()
            prev["scanPageEnd"] = b["scanPage"]
            continue
        out.append(b)
    return out


def dehyphenate(lines: list[str]) -> list[str]:
    out: list[str] = []
    for l in lines:
        if out and out[-1].endswith("-") and l[:1].islower():
            out[-1] = out[-1][:-1] + l
        else:
            out.append(l)
    return out


def _load_words() -> set[str]:
    try:
        with open("/usr/share/dict/british-english", encoding="utf-8", errors="ignore") as fh:
            return {w.strip().lower() for w in fh}
    except OSError:
        return set()


WORDS = _load_words()


def _is_word(t: str) -> bool:
    t = t.lower()
    return bool(t) and (t in WORDS or t.rstrip("s") in WORDS)


def mark_script(text: str, tally: dict) -> str:
    """Replace runs the OCR could not read with one marker.

    A token qualifies when it carries no vowel and no digit, is not a word, and is not a
    romanised Korean syllable — Culin's transliterations (nyout, ssang-ryouk, tjyang-keui)
    must survive, and they always carry vowels.
    """
    out = []
    for tok in text.split():
        core = tok.strip(".,;:!?()[]\"'“”‘’")
        if not core:
            out.append(tok); continue
        letters = [c for c in core if c.isalpha()]
        # THE DICTIONARY IS DOING REAL WORK HERE, not decorating the rule. "by" has no
        # vowel and only two letters, and the third book of this phase adapted this
        # function by hand, dropped the dictionary test, and replaced every "by" in a
        # 400-page catalogue with the marker for unreadable script: "Collected by Dr.
        # A. H. Hoff" came out as "Collected [...script] Dr. A. H. Hoff".
        # Counting y as a vowel would also fix that, and was tried — but it then keeps
        # -j^y, YY, Ytng and d'y, which are exactly the garbage this marker exists for.
        # The dictionary is the better instrument: it knows "by" and does not know those.
        vowels = sum(1 for c in core.lower() if c in "aeiou")
        odd = sum(1 for c in core if not c.isalnum() and c not in "-'’.,")
        unreadable = (len(letters) >= 2 and vowels == 0 and not _is_word(core)) or odd >= 2
        if unreadable and not core[0].isdigit():
            # TWO NUMBERS, because they are two facts. `marked` is how many tokens
            # the OCR could not read; `runs` is how many markers the page carries,
            # which is smaller because a run of unreadable tokens collapses into one.
            # The source note claims runs; an earlier draft printed the token count
            # under the word "runs" and would have overstated the page by a fifth.
            tally["marked"] = tally.get("marked", 0) + 1
            if out and out[-1] == MARK:
                continue
            tally["runs"] = tally.get("runs", 0) + 1
            out.append(MARK)
        else:
            out.append(tok)
    return " ".join(out)


# ── leaves whose table was rebuilt from the coordinates ──────────────────────
# A printed table read as prose comes out as "takes takes 7 h" and "to I e to". Where a
# table has been rebuilt properly the fragments are suppressed and the rebuilt block
# stands in their place; `resumesAt` is the first words of the prose that follows the
# table on the same leaf, so the parse knows where Culin starts again.
REBUILT = {
    202: {"file": "CONTENT/chess-game.json", "kind": "chess-game",
          "resumesAt": '" Check " in Korean is tjyang',
          # Culin's note crediting Wilkinson runs under the table, and the rebuilt
          # block sets it there. Left in the prose as well it printed twice.
          "alreadyIn": ["* Mr. Wilkinson is to be credited"]},
}
