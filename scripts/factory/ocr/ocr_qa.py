#!/usr/bin/env python3
"""ocr_qa.py — find where a scan's OCR is likely to be wrong, and say where.

Shared across every Phase 2 title. Nothing here corrects anything; it produces
a page-referenced list of places a human or a later correction pass has to
look, and a rate that can be tracked between books.

THE POINT OF THE SUBSTITUTION TEST
Confidence alone is close to useless on a book like this. The uncertain tail of
the Falkener scan is mostly Pachisi, Seega and Ludus — real words the OCR
dictionary has never seen. Meanwhile the *actual* errors sit at full
confidence, because the engine is certain it read a K:

    LATKUNCULOKUM   for  LATRUNCULORUM
    SQUAEES         for  SQUARES
    GEEEN           for  GREEN

These are one substitution away from a dictionary word. That is the signal.
A token that is not a word, and becomes a word if you undo a single
character confusion that this typeface is known to produce, is almost
certainly that error — and unlike a confidence score, it names the fix.

Usage:
    python3 ocr_qa.py <file_djvu.xml> [--json out.json] [--limit 40]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from djvu import read_pages, printed_folio  # noqa: E402

DICT_PATHS = ("/usr/share/dict/british-english", "/usr/share/dict/american-english",
              "/usr/share/dict/words")

# Character confusions a 19th-century letterpress scan actually produces.
# Each is (wrong, right); the test asks whether undoing it yields a real word.
CONFUSIONS = [
    ("K", "R"), ("E", "R"), ("R", "B"), ("I", "T"), ("O", "C"), ("C", "G"),
    ("U", "N"), ("N", "U"), ("S", "8"), ("l", "i"), ("i", "l"), ("rn", "m"),
    ("m", "rn"), ("cl", "d"), ("li", "h"), ("tt", "u"), ("vv", "w"), ("f", "s"),
]

TOKEN = re.compile(r"^[A-Za-z][A-Za-z'’-]*[A-Za-z]$")


def load_words() -> set[str]:
    for p in DICT_PATHS:
        f = Path(p)
        if f.exists():
            return {w.strip().lower() for w in f.read_text(
                encoding="utf-8", errors="ignore").splitlines() if w.strip()}
    return set()


ROMAN = re.compile(r"^[IVXLCDMivxlcdm]+$")


def _case_consistent(original: str, candidate: str) -> bool:
    """Reject a suggestion whose shape no printed word has.

    The first pass proposed `Tau → TaN`, `der → deB`, `sur → suB` and
    `Fac → FaG`: a capital dropped into the middle of a lower-case word. They
    scored because the substitution table is case-blind and the dictionary
    happens to contain the result. A real correction preserves the case
    pattern of the word it repairs.
    """
    if candidate.isupper() or candidate.islower():
        return True
    if candidate[0].isupper() and candidate[1:].islower():
        return original[0].isupper()
    return False


def single_fix(token: str, words: set[str]) -> str | None:
    """The word this token becomes under exactly one known confusion, if any.

    Deliberately conservative: it would rather miss a real error than propose
    a wrong repair, because a wrong repair silently rewrites the author.
    """
    if len(token) < 3 or ROMAN.match(token):
        return None                       # numerals are not misspelt words
    low = token.lower()
    if low in words:
        return None
    for wrong, right in CONFUSIONS:
        if wrong.lower() not in low:
            continue
        start = 0
        while True:
            i = low.find(wrong.lower(), start)
            if i < 0:
                break
            # keep the case of the character being replaced
            rep = right.upper() if token[i].isupper() else right.lower()
            cand = token[:i] + rep + token[i + len(wrong):]
            if (cand.lower() in words and cand.lower() != low
                    and _case_consistent(token, cand)):
                return cand
            start = i + 1
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("xml")
    ap.add_argument("--json")
    ap.add_argument("--limit", type=int, default=40)
    a = ap.parse_args()

    words = load_words()
    if not words:
        print("ocr_qa: no system word list found — refusing to guess", file=sys.stderr)
        return 2

    pages = read_pages(a.xml)
    conf = [w.confidence for p in pages for w in p.words if w.confidence is not None]
    ceiling = max(conf) if conf else 0

    total = 0
    unknown = 0
    findings: list[dict] = []
    by_fix: Counter[str] = Counter()

    for p in pages:
        folio = printed_folio(p)
        for w in p.words:
            t = w.text.strip(".,;:!?()[]\"'“”‘’")
            if not TOKEN.match(t):
                continue
            total += 1
            if t.lower() in words:
                continue
            unknown += 1
            fix = single_fix(t, words)
            if fix:
                by_fix[f"{t} → {fix}"] += 1
                findings.append({
                    "scanPage": p.number, "printedFolio": folio,
                    "token": t, "suggests": fix,
                    "confidence": w.confidence,
                    "inTail": w.low(ceiling) if ceiling else None,
                })

    rate = len(findings) / total * 100 if total else 0
    print(f"pages                 {len(pages)}")
    print(f"alphabetic tokens     {total:,}")
    print(f"not in the word list  {unknown:,} ({unknown/total*100:.1f}%)  "
          f"— mostly proper nouns and game names, not errors")
    print(f"ONE CONFUSION FROM A REAL WORD  {len(findings):,} ({rate:.2f}%)  "
          f"— these are the likely OCR errors")
    print()
    print(f"most frequent, with the substitution that explains them:")
    for k, n in by_fix.most_common(a.limit):
        print(f"    {n:>4}  {k}")

    if a.json:
        Path(a.json).write_text(json.dumps({
            "source": Path(a.xml).name,
            "pages": len(pages),
            "alphabeticTokens": total,
            "notInWordList": unknown,
            "oneConfusionFromAWord": len(findings),
            "ratePct": round(rate, 3),
            "confidenceCeiling": ceiling,
            "confusionsTested": [f"{w} -> {r}" for w, r in CONFUSIONS],
            "topSuggestions": by_fix.most_common(200),
            "findings": findings,
        }, indent=1), encoding="utf-8")
        print(f"\nwritten {a.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
