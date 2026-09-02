#!/usr/bin/env python3
"""Kill-gate check for a Valice factory project (same role as the kill_gate.py
in every existing book repository, but driven by gates.json + state.json).

Exit 0  — the requested level is allowed by the recorded evidence.
Exit 1  — a never-skip gate (2 rights, 5 facts, 10 KDP compliance, 12 founder
          approval) is not passed with evidence and founder approval, or a
          format is marked uploaded/live before the project is APPROVED.
Exit 2  — files missing or malformed.

Usage: python3 kill_gate.py [--level release|approved]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NEVER_SKIP = {"2", "5", "10", "12"}
ORDER = ["IDEA", "RESEARCH", "MARKET_VALIDATED", "RIGHTS_PENDING", "RIGHTS_APPROVED",
         "SPEC_READY", "DRAFTING", "VERIFYING", "EDITING", "DESIGNING", "FORMATTING",
         "QA", "FOUNDER_REVIEW", "APPROVED", "PUBLISHED", "OPTIMIZE", "ARCHIVE"]


def load(name):
    p = ROOT / name
    if not p.exists():
        print(f"kill_gate: missing {name}", file=sys.stderr)
        sys.exit(2)
    return json.loads(p.read_text(encoding="utf-8"))


def main():
    level = "release"
    if "--level" in sys.argv:
        level = sys.argv[sys.argv.index("--level") + 1]
    gates = load("gates.json")["gates"]
    state = load("state.json")
    config = load("project_config.json")
    problems = []
    for gid in sorted(gates, key=int):
        g = gates[gid]
        ok = g["status"] == "passed" and len(g.get("evidence") or []) > 0
        if g.get("founderSignoff") and ok and g.get("approvedBy") != "founder":
            ok = False
        flag = "PASS" if ok else ("WAIVED" if g["status"] == "waived" else "----")
        print(f"  gate {gid:>2} {g['name']:<32} {flag:<7} {', '.join(g.get('evidence') or [])}")
        if gid in NEVER_SKIP and not ok:
            problems.append(f"gate {gid} ({g['name']}) is a never-skip gate and is not passed with evidence + founder approval")
        elif level == "release" and not ok and g["status"] != "waived":
            problems.append(f"gate {gid} ({g['name']}) not passed")
    st = state.get("state")
    print(f"  state: {st}")
    if st in ORDER and ORDER.index(st) < ORDER.index("APPROVED"):
        for f in config.get("formats", []):
            if f.get("status") in ("uploaded", "in_review", "live"):
                problems.append(f"format {f['format']} is {f['status']} but project is {st} (< APPROVED)")
    if problems:
        print("\nKILL GATE — BLOCKED")
        for p in problems:
            print(f"  ✗ {p}")
        sys.exit(1)
    print(f"\nKILL GATE — level '{level}' allowed by recorded evidence")


if __name__ == "__main__":
    main()
