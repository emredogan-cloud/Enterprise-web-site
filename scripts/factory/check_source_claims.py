#!/usr/bin/env python3
"""
check_source_claims.py — hold the apparatus's claims ABOUT the source against the source.

WHY THIS EXISTS
---------------
`check_quotes.py` proves that every passage the apparatus puts inside quotation marks is in
the source, word for word. Nothing proved that the apparatus's *statements about* the source
were true of it, and British Goblins shipped eleven of those, nine contradicted by text the
same volume prints:

  - "a figure whom Sikes does not name"        — named twelve times
  - "which Sikes does not mention once"        — a chapter section is titled after it
  - "Sikes stops marking him"                  — named eleven more times after that chapter
  - "Olaus Magnus ... a source for Book II"    — appears zero times in the book
  - "W. Howell"                                — the book prints "W. Howells"

Every one of them dies against a grep. The reason none of them did is that the facts about
the source came from a tertiary summary and were never put back against the parsed text.

A NEGATIVE CLAIM ABOUT AN AUTHOR IS THE HIGHEST-RISK SENTENCE AN EDITOR CAN WRITE, because
it cannot be confirmed by reading around — only by counting. This checker exists to make
writing one without a count impossible.

THE CLAIMS FILE
---------------
A JSON list. Each entry names the assertion, the kind of check, and where in the apparatus
the claim is made, so a failure points at the sentence to fix:

  [
    {"id": "SC-001",
     "claim": "Sikes never names Gwyn ap Nudd",
     "where": "glossary; the register of beings",
     "check": "absent",
     "pattern": "Gwyn ap Nudd"},

    {"id": "SC-002",
     "claim": "Keightley divides the work by country, and GREAT BRITAIN is one of them",
     "where": "the note on this edition",
     "check": "present",
     "pattern": "GREAT BRITAIN"},

    {"id": "SC-003",
     "claim": "Sikes names the Prophet Jones eleven times after Book I chapter VIII",
     "where": "the editorial note on the debt to Edmund Jones",
     "check": "count_after",
     "pattern": "Prophet Jones",
     "after": "CHAPTER VIII. Fairy Rings",
     "expect": 11},

    {"id": "SC-004",
     "claim": "the volume prints 604 of Keightley's footnotes",
     "where": "A Note on This Edition",
     "check": "report",
     "path": "footnotes.placedWithTheirSection",
     "expect": 604}
  ]

CHECKS
------
  present      the pattern occurs at least once            (`expect` optional: minimum)
  absent       the pattern occurs exactly zero times       — negative claims live here
  count        the pattern occurs exactly `expect` times
  count_min    at least `expect`
  count_max    at most `expect`
  count_after  occurrences after `after`, exactly `expect`. `after_occurrence` picks which
               hit of the marker to measure from: "last" (the default — the body, not the
               table of contents), "first", or an integer index.
  report       a number in QA/parse-report.json equals `expect`

Patterns are regular expressions, matched case-insensitively by default (`"case": true`
makes one case-sensitive), against the source with whitespace collapsed — so a claim does
not fail because the transcription wrapped a line in the middle of a name.

USAGE
-----
    python check_source_claims.py <BOOK_DIR> --claims SOURCE_CLAIMS.json \
        --source SOURCE/raw/pg34704.txt [--exclude-index] [--report QA/parse-report.json]

Exit 1 if any claim fails. Writes QA/source-claims.json either way, because a checker that
leaves no record is a checker nobody can audit.
"""
from __future__ import annotations
import argparse, json, re, sys
from pathlib import Path

CHECKS = {"present", "absent", "count", "count_min", "count_max", "count_after", "report"}


def load_source(root: Path, spec: str, exclude_index: bool) -> str:
    """Concatenate the source file(s), whitespace collapsed.

    `--exclude-index` cuts everything from the last INDEX heading. An index is a list of
    every name in the book, so counting names through it turns every absent-claim into a
    false pass and every count into nonsense."""
    parts = []
    for rel in spec.split(","):
        t = (root / rel.strip()).read_text(encoding="utf-8", errors="replace")
        if exclude_index:
            m = None
            for m in re.finditer(r"^\s*INDEX\.?\s*$", t, re.M):
                pass
            if m:
                t = t[:m.start()]
        parts.append(t)
    return re.sub(r"\s+", " ", "\n".join(parts))


def dig(obj, path: str):
    for k in path.split("."):
        if isinstance(obj, list):
            k = int(k)
        obj = obj[k]
    return obj


def run(claims: list, text: str, report: dict | None) -> list:
    rows = []
    for c in claims:
        kind = c.get("check")
        row = {"id": c.get("id"), "claim": c.get("claim"), "where": c.get("where"),
               "check": kind, "ok": False}
        if kind not in CHECKS:
            row["error"] = f"unknown check {kind!r}; use one of {sorted(CHECKS)}"
            rows.append(row); continue

        if kind == "report":
            if report is None:
                row["error"] = "check 'report' needs --report"
            else:
                try:
                    got = dig(report, c["path"])
                    row.update(found=got, expected=c["expect"], ok=got == c["expect"])
                except (KeyError, IndexError, TypeError) as e:
                    row["error"] = f"no such path {c.get('path')!r}: {e}"
            rows.append(row); continue

        flags = 0 if c.get("case") else re.I
        pat = c["pattern"]
        hay = text
        if kind == "count_after":
            # WHICH occurrence of the marker. A chapter heading appears in the table of
            # contents before it appears in the body, so "after chapter VIII" measured from
            # the first hit silently measures from the contents page and counts the whole
            # book. Default is the last occurrence, which is the body one; "first" and an
            # integer index are available for the cases where it is not.
            ms = list(re.finditer(c["after"], text, flags))
            if not ms:
                row["error"] = f"the 'after' marker {c['after']!r} is not in the source"
                rows.append(row); continue
            which = c.get("after_occurrence", "last")
            m = ms[0] if which == "first" else ms[-1] if which == "last" else ms[int(which)]
            row["afterOccurrence"] = f"{which} of {len(ms)}"
            hay = text[m.end():]
        n = len(re.findall(pat, hay, flags))
        row["pattern"] = pat
        row["found"] = n
        if kind == "present":
            row["expected"] = f">= {c.get('expect', 1)}"; row["ok"] = n >= c.get("expect", 1)
        elif kind == "absent":
            row["expected"] = 0; row["ok"] = n == 0
            row["$risk"] = ("A NEGATIVE CLAIM. If this fails, the apparatus states that "
                            "something is not in the book and the book contains it.")
        elif kind == "count":
            row["expected"] = c["expect"]; row["ok"] = n == c["expect"]
        elif kind == "count_min":
            row["expected"] = f">= {c['expect']}"; row["ok"] = n >= c["expect"]
        elif kind == "count_max":
            row["expected"] = f"<= {c['expect']}"; row["ok"] = n <= c["expect"]
        elif kind == "count_after":
            row["expected"] = c["expect"]; row["after"] = c["after"]; row["ok"] = n == c["expect"]
        rows.append(row)
    return rows


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("book")
    ap.add_argument("--claims", required=True)
    ap.add_argument("--source", required=True)
    ap.add_argument("--report", default=None)
    ap.add_argument("--exclude-index", action="store_true")
    a = ap.parse_args()
    root = Path(a.book)

    claims = json.loads((root / a.claims).read_text(encoding="utf-8"))
    if isinstance(claims, dict):
        claims = claims.get("claims", [])
    text = load_source(root, a.source, a.exclude_index)
    report = json.loads((root / a.report).read_text(encoding="utf-8")) if a.report else None

    rows = run(claims, text, report)
    bad = [r for r in rows if not r["ok"]]
    negatives = [r for r in rows if r["check"] == "absent"]
    rec = {"checked": len(rows), "failed": len(bad),
           "negativeClaims": len(negatives),
           "sourceChars": len(text), "indexExcluded": a.exclude_index,
           "detail": rows,
           "$why": "check_quotes.py proves the quotations are the author's. This proves the "
                   "statements ABOUT the author are true of the book. Eleven falsehoods "
                   "reached print in British Goblins through that gap, nine of them "
                   "contradicted by text the same volume prints."}
    (root / "QA").mkdir(exist_ok=True)
    json.dump(rec, open(root / "QA" / "source-claims.json", "w"), indent=1, ensure_ascii=False)
    print(json.dumps({k: v for k, v in rec.items() if k != "detail"}, indent=1, ensure_ascii=False))
    for r in bad:
        print(f"  FAIL {r['id']}  [{r['check']}] {r['claim']}")
        print(f"       where: {r['where']}")
        if "error" in r:
            print(f"       error: {r['error']}")
        else:
            print(f"       pattern {r.get('pattern')!r}: found {r.get('found')}, expected {r.get('expected')}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
