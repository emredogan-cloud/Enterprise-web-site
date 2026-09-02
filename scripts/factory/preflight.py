#!/usr/bin/env python3
"""Pre-upload checks for a print-ready PDF (Gate 8), using poppler's pdfinfo
and pdffonts — no Python PDF library required.

  python3 scripts/factory/preflight.py <pdf> [--expect-pages N] [--trim WxH]
         [--kind interior|cover] [--json <out.json>] [--min-pages N] [--max-pages N]

Checks (each is a real measurement; a check that cannot run is reported as
SKIPPED, never as passed):
  1. the file opens and pdfinfo can read it;
  2. every font is embedded (Enigmatica's real KDP rejection: Helvetica was
     not embedded on all 274 pages);
  3. Title and Author metadata are present (Field Book shipped as
     'untitled'/'anonymous');
  4. page count matches --expect-pages / lies inside --min/--max (KDP:
     paperback 24–828, hardcover 75–550);
  5. page size matches --trim (inches, e.g. 6x9 or 8.5x11) within 0.01 in;
  6. for covers: file size ≤ 40 MB (KDP limit).
Exit 0 = all ran checks passed · 1 = a check failed · 2 = tool/file missing.
"""
import json
import os
import re
import shutil
import subprocess
import sys

PT_PER_IN = 72.0


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False)


def parse_args(argv):
    args = {"_": []}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a.startswith("--"):
            key = a[2:]
            if i + 1 < len(argv) and not argv[i + 1].startswith("--"):
                args[key] = argv[i + 1]
                i += 2
            else:
                args[key] = True
                i += 1
        else:
            args["_"].append(a)
            i += 1
    return args


def main():
    args = parse_args(sys.argv[1:])
    if not args["_"]:
        print(__doc__)
        sys.exit(2)
    pdf = args["_"][0]
    if not os.path.exists(pdf):
        print(f"preflight: no such file {pdf}", file=sys.stderr)
        sys.exit(2)
    for tool in ("pdfinfo", "pdffonts"):
        if not shutil.which(tool):
            print(f"preflight: {tool} not found (install poppler-utils)", file=sys.stderr)
            sys.exit(2)

    results = []

    def record(name, status, detail=""):
        results.append({"check": name, "status": status, "detail": detail})

    info = run(["pdfinfo", pdf])
    if info.returncode != 0:
        record("opens", "FAIL", info.stderr.strip()[:200])
        finish(results, args)
        return
    record("opens", "PASS", "")
    fields = {}
    for line in info.stdout.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fields[k.strip()] = v.strip()

    # 2. fonts embedded
    fonts = run(["pdffonts", pdf])
    if fonts.returncode != 0:
        record("fonts_embedded", "SKIPPED", "pdffonts failed")
    else:
        lines = fonts.stdout.splitlines()[2:]
        not_embedded = []
        total = 0
        for line in lines:
            if not line.strip():
                continue
            total += 1
            cols = line.split()
            # pdffonts columns: name type encoding emb sub uni <object> <gen>
            # → emb is the 5th field from the end (object id is two tokens).
            try:
                emb = cols[-5]
            except IndexError:
                emb = "?"
            if emb != "yes":
                not_embedded.append(cols[0])
        if total == 0:
            record("fonts_embedded", "PASS", "no fonts (image-only PDF)")
        elif not_embedded:
            record("fonts_embedded", "FAIL", f"{len(not_embedded)}/{total} not embedded: {', '.join(not_embedded[:8])}")
        else:
            record("fonts_embedded", "PASS", f"{total} fonts, all embedded")

    # 3. metadata
    title = fields.get("Title", "")
    author = fields.get("Author", "")
    if title and title.lower() not in ("untitled",) and author and author.lower() not in ("anonymous",):
        record("metadata", "PASS", f"Title='{title[:60]}' Author='{author}'")
    else:
        record("metadata", "FAIL", f"Title='{title}' Author='{author}'")

    # 4. pages
    pages = int(fields.get("Pages", "0") or 0)
    expect = args.get("expect-pages")
    kind = args.get("kind", "interior")
    lo = int(args.get("min-pages", 24 if kind == "interior" else 1))
    hi = int(args.get("max-pages", 828 if kind == "interior" else 4))
    if expect and str(expect).isdigit():
        if pages == int(expect):
            record("page_count", "PASS", f"{pages} pages")
        else:
            record("page_count", "FAIL", f"{pages} pages, expected {expect}")
    elif lo <= pages <= hi:
        record("page_count", "PASS", f"{pages} pages within {lo}–{hi}")
    else:
        record("page_count", "FAIL", f"{pages} pages outside {lo}–{hi}")

    # 5. trim
    trim = args.get("trim")
    size = fields.get("Page size", "")
    m = re.match(r"([\d.]+) x ([\d.]+) pts", size)
    if trim and m:
        tw, th = [float(x) for x in str(trim).lower().split("x")]
        w_in, h_in = float(m.group(1)) / PT_PER_IN, float(m.group(2)) / PT_PER_IN
        if abs(w_in - tw) <= 0.01 and abs(h_in - th) <= 0.01:
            record("trim", "PASS", f"{w_in:.3f} x {h_in:.3f} in")
        else:
            record("trim", "FAIL", f"{w_in:.3f} x {h_in:.3f} in, expected {tw} x {th}")
    elif trim:
        record("trim", "SKIPPED", "page size unreadable")
    else:
        record("trim", "SKIPPED", "no --trim given" + (f" (page size {size})" if size else ""))

    # 6. cover size
    if kind == "cover":
        mb = os.path.getsize(pdf) / (1024 * 1024)
        record("cover_file_size", "PASS" if mb <= 40 else "FAIL", f"{mb:.1f} MB (KDP limit 40 MB)")

    finish(results, args)


def finish(results, args):
    failed = [r for r in results if r["status"] == "FAIL"]
    for r in results:
        print(f"  {r['status']:<8} {r['check']:<18} {r['detail']}")
    out = args.get("json")
    if out:
        with open(out, "w", encoding="utf-8") as f:
            json.dump({"tool": "preflight.py", "results": results, "ok": not failed}, f, indent=2)
    print("preflight: " + ("FAIL" if failed else "ok"))
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
