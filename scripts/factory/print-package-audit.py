#!/usr/bin/env python3
"""Measure a print package against KDP's own geometry (Gate 8 evidence).

  python3 scripts/factory/print-package-audit.py docs/30-kdp/PRINT_PACKAGE_SPEC.json out.json


Nothing here trusts a manifest. Page counts, page boxes and fonts come out of
the PDF; the spine comes from KDP's published multiplier, itself checked against
the sixteen page counts read off the official calculator in kdp_geometry.json.
"""
import hashlib, json, os, subprocess, sys

R = "/home/emre/Downloads/MY-DİGİTAL-BOOK"
GEO = json.load(open(f"{R}/COMMON-AREA/covers/kdp_geometry.json"))

# spine = pages * multiplier, white paper, black ink. Derived and cross-checked
# below against every verified row in the reference file.
MULT = 0.002252

def check_multiplier():
    worst = 0.0
    for pages, v in GEO["paperback"]["verified"].items():
        pred = int(pages) * MULT
        worst = max(worst, abs(pred - v["spineIn"]))
    return worst

def pdfinfo(path):
    try:
        out = subprocess.run(["pdfinfo", path], capture_output=True, text=True, timeout=60).stdout
    except Exception as e:
        return {"error": str(e)}
    d = {}
    for line in out.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            d[k.strip()] = v.strip()
    return d

def page_box(path):
    """Width/height in points of page 1, from the page-size line."""
    info = pdfinfo(path)
    ps = info.get("Page size", "")
    try:
        parts = ps.split()
        return float(parts[0]), float(parts[2])
    except Exception:
        return None, None

def fonts(path):
    try:
        out = subprocess.run(["pdffonts", path], capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return None
    lines = [l for l in out.splitlines()[2:] if l.strip()]
    embedded = sum(1 for l in lines if len(l.split()) > 3 and l.split()[3] == "yes")
    return {"total": len(lines), "embedded": embedded,
            "notEmbedded": [l.split()[0] for l in lines if len(l.split()) > 3 and l.split()[3] != "yes"]}

def sha(path, cap=None):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()

def measure(interior, cover, trim_w, trim_h, binding, cfg_calc=None):
    """Return a dict of measured facts plus the geometry verdict."""
    out = {}
    if not interior or not os.path.exists(interior):
        out["interior"] = {"present": False, "path": interior}
        return out
    ii = pdfinfo(interior)
    pages = int(ii.get("Pages", 0) or 0)
    iw, ih = page_box(interior)
    out["interior"] = {
        "present": True, "path": interior, "bytes": os.path.getsize(interior),
        "pages": pages, "pageWpt": iw, "pageHpt": ih,
        "trimIn": [round(iw / 72, 4) if iw else None, round(ih / 72, 4) if ih else None],
        "trimMatches": (abs(iw / 72 - trim_w) < 0.02 and abs(ih / 72 - trim_h) < 0.02) if iw else False,
        "fonts": fonts(interior), "sha256": sha(interior)[:16],
    }
    if not cover or not os.path.exists(cover):
        out["cover"] = {"present": False, "path": cover}
        return out
    cw, ch = page_box(cover)
    ci = pdfinfo(cover)
    if binding == "paperback":
        spine = pages * MULT
        want_w = 2 * (trim_w + 0.125) + spine
        want_h = trim_h + 0.25
    else:
        # A HARDCOVER WRAP IS READ, NEVER DERIVED. The house standard says so, and says
        # why: the derived spine on The Great Book of World Myths came out 0.129 in narrow
        # and would have been rejected. Deriving it here reproduced that same 0.128 in
        # error on two books whose wraps are in fact correct.
        #
        # KDP's own numbers, for the record: hardcover spine = pages * 0.002252 + 0.1888
        # (the case board), and full width = 2*wrapIn + 2*frontCoverWidthIn + spineWidthIn.
        # The constant is stated only so a future reader can SANITY-CHECK a calculator
        # block. It is not a licence to compute one.
        calc = cfg_calc
        if not calc:
            out["cover"] = {"present": True, "path": cover,
                            "verdict": "NO CALCULATOR BLOCK — a hardcover wrap cannot be "
                                       "checked without the numbers KDP's tool printed"}
            return out
        if calc.get("sourcePageCount") != pages:
            out["cover"] = {"present": True, "path": cover,
                            "verdict": f"CALCULATOR BLOCK IS STALE — it is for "
                                       f"{calc.get('sourcePageCount')} pages, the interior "
                                       f"measures {pages}. Re-run KDP's calculator."}
            return out
        want_w = calc["fullCoverWidthIn"]
        want_h = calc["fullCoverHeightIn"]
        spine = calc["spineWidthIn"]
    got_w, got_h = (cw / 72 if cw else 0), (ch / 72 if ch else 0)
    out["cover"] = {
        "present": True, "path": cover, "bytes": os.path.getsize(cover),
        "pages": int(ci.get("Pages", 0) or 0),
        "gotIn": [round(got_w, 4), round(got_h, 4)],
        "wantIn": [round(want_w, 4), round(want_h, 4)],
        "spineIn": round(spine, 4),
        "dWidthIn": round(got_w - want_w, 4), "dHeightIn": round(got_h - want_h, 4),
        # KDP rejects a wrap that is off by more than about 1/16 in.
        "withinTolerance": abs(got_w - want_w) < 0.0625 and abs(got_h - want_h) < 0.0625,
        "impliedPages": round((got_w - 2 * (trim_w + 0.125)) / MULT) if binding == "paperback" and got_w else None,
        "sha256": sha(cover)[:16],
    }
    return out

def load_calc(row):
    """The KDP calculator block this project recorded for this format, if any."""
    cfg = row.get("config")
    if not cfg or not os.path.exists(cfg):
        return None
    try:
        d = json.load(open(cfg))
    except Exception:
        return None
    for f in d.get("formats", []):
        if f.get("format") == row["format"]:
            return f.get("kdp_calculator")
    return None


if __name__ == "__main__":
    print(f"spine multiplier {MULT} — worst error against the 16 calculator rows: "
          f"{check_multiplier():.5f} in\n")
    spec = json.load(open(sys.argv[1]))
    results = {}
    for row in spec:
        key = f"{row['slug']}/{row['format']}"
        results[key] = {"spec": row, **measure(row.get("interior"), row.get("cover"),
                                               row["trimW"], row["trimH"], row["binding"],
                                               load_calc(row))}
    json.dump(results, open(sys.argv[2], "w"), indent=1)
    for key, r in results.items():
        i, c = r.get("interior", {}), r.get("cover", {})
        if not i.get("present"):
            print(f"  {key:<48} INTERIOR MISSING"); continue
        line = f"  {key:<48} {i['pages']:>4} pp  {i['trimIn'][0]}x{i['trimIn'][1]} in  " \
               f"trim={'ok' if i['trimMatches'] else 'WRONG'}  fonts={i['fonts']['embedded']}/{i['fonts']['total']} embedded"
        if not c.get("present"):
            print(line + "  COVER MISSING"); continue
        if "verdict" in c:
            print(line + f"\n      cover {c['verdict']}"); continue
        print(line + f"\n      cover {c['gotIn'][0]}x{c['gotIn'][1]} want {c['wantIn'][0]}x{c['wantIn'][1]} "
                     f"spine {c['spineIn']}  dW={c['dWidthIn']:+.4f} dH={c['dHeightIn']:+.4f}  "
                     f"{'OK' if c['withinTolerance'] else 'OUT OF TOLERANCE'}"
              + (f"  (wrap implies {c['impliedPages']} pp)" if c.get("impliedPages") else ""))
