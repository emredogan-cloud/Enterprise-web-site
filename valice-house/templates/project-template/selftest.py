#!/usr/bin/env python3
"""Self-test for a Valice factory project: the tests that test the gates.

Checks the structural invariants every project must hold regardless of stage:
  - project_config.json parses and carries the required top-level blocks;
  - gates.json has exactly the twelve gates with valid statuses; no gate is
    `passed` without evidence; founder gates that are passed carry approvedBy;
  - state.json holds a known state; `.gate` mirrors it;
  - no placeholder token ({{...}}, [TBD], TODO, lorem) survives in metadata or
    the printed companion URL;
  - every rights source id in project_config.json appears in RIGHTS.md.
Exit 0 on success, 1 on failure, 2 on missing files.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATUSES = {"not_started", "in_progress", "passed", "failed", "waived"}
PLACEHOLDER = re.compile(r"\{\{[^}]+\}\}|\[TBD\]|\bTODO\b|lorem ipsum", re.I)
STATES = {"IDEA", "RESEARCH", "MARKET_VALIDATED", "RIGHTS_PENDING", "RIGHTS_APPROVED", "SPEC_READY",
          "DRAFTING", "VERIFYING", "EDITING", "DESIGNING", "FORMATTING", "QA", "FOUNDER_REVIEW",
          "APPROVED", "PUBLISHED", "OPTIMIZE", "ARCHIVE", "BLOCKED", "KILLED"}


def fail(msg):
    print(f"  ✗ {msg}")
    return 1


def main():
    errors = 0
    for name in ("project_config.json", "gates.json", "state.json", "DECISIONS.md", "RIGHTS.md", "SPEC.md"):
        if not (ROOT / name).exists():
            print(f"selftest: missing {name}", file=sys.stderr)
            sys.exit(2)
    cfg = json.loads((ROOT / "project_config.json").read_text(encoding="utf-8"))
    for block in ("project", "founder", "scope", "measured", "production", "formats", "rights", "metadata", "compliance"):
        if block not in cfg:
            errors += fail(f"project_config.json lacks `{block}`")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", cfg.get("project", {}).get("slug", "")):
        errors += fail("project.slug is not lower-kebab-case")
    meta_text = json.dumps(cfg.get("metadata", {})) + json.dumps(cfg.get("companion", {}))
    if PLACEHOLDER.search(meta_text):
        errors += fail("placeholder token in metadata/companion")
    gates = json.loads((ROOT / "gates.json").read_text(encoding="utf-8"))["gates"]
    if sorted(gates, key=int) != [str(i) for i in range(1, 13)]:
        errors += fail("gates.json must contain gates 1..12")
    for gid, g in gates.items():
        if g["status"] not in STATUSES:
            errors += fail(f"gate {gid} has invalid status {g['status']}")
        if g["status"] == "passed" and not g.get("evidence"):
            errors += fail(f"gate {gid} is passed without evidence")
        if g["status"] == "passed" and g.get("founderSignoff") and g.get("approvedBy") != "founder":
            errors += fail(f"gate {gid} is a founder gate passed without approvedBy=founder")
        if g["status"] in ("failed", "waived") and not g.get("reason"):
            errors += fail(f"gate {gid} is {g['status']} without a reason")
    state = json.loads((ROOT / "state.json").read_text(encoding="utf-8"))
    if state.get("state") not in STATES:
        errors += fail(f"state.json has unknown state {state.get('state')}")
    gate_file = (ROOT / ".gate").read_text(encoding="utf-8").strip() if (ROOT / ".gate").exists() else ""
    if gate_file != str(state.get("state", "")).lower():
        errors += fail(f".gate ({gate_file}) does not mirror state.json ({state.get('state')})")
    rights_md = (ROOT / "RIGHTS.md").read_text(encoding="utf-8")
    for src in cfg.get("rights", {}).get("sources", []):
        if src.get("id") and src["id"] not in rights_md:
            errors += fail(f"rights source {src['id']} is in project_config.json but not in RIGHTS.md")
    checks = 8
    if errors:
        print(f"selftest: {errors} problem(s)")
        sys.exit(1)
    print(f"selftest: ok ({checks} invariant groups)")


if __name__ == "__main__":
    main()
