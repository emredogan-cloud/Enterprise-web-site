#!/usr/bin/env python3
"""
Tests for check_source_claims.py.

The first group is the regression group, and it is the point of the file: each case is a
sentence that actually reached print in British Goblins and a source fragment that
contradicts it. If any of these stops failing, the checker has stopped doing its job.

    python check_source_claims.test.py
"""
from __future__ import annotations
import json, sys, tempfile, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_source_claims import run, load_source                        # noqa: E402


class HistoricalFailures(unittest.TestCase):
    """Sentences that shipped, against the text that contradicts them."""

    def test_negative_claim_about_a_name_that_is_present(self):
        src = ("The sovereign of the fairies, and their especial guardian and protector, "
               "was one Gwyn ap Nudd. His name often occurs in ancient Welsh poetry.")
        rows = run([{"id": "R1", "claim": "Sikes does not name Gwyn ap Nudd",
                     "where": "glossary", "check": "absent", "pattern": "Gwyn ap Nudd"}],
                   src, None)
        self.assertFalse(rows[0]["ok"])
        self.assertEqual(rows[0]["found"], 1)
        self.assertIn("NEGATIVE CLAIM", rows[0]["$risk"])

    def test_negative_claim_when_the_thing_is_a_chapter_heading(self):
        src = "Iago ap Dewi--The Original of Rip van Winkle 65 CHAPTER VII."
        rows = run([{"id": "R2", "claim": "Sikes does not mention Rip Van Winkle once",
                     "where": "head-note I.VII", "check": "absent",
                     "pattern": "Rip van Winkle"}], src, None)
        self.assertFalse(rows[0]["ok"])

    def test_a_source_imported_from_another_book_appears_nowhere(self):
        src = "Welsh folk-lore, fairy mythology, legends and traditions."
        rows = run([{"id": "R3", "claim": "Olaus Magnus is a source for Book II",
                     "where": "chronology", "check": "present", "pattern": "Olaus Magnus"}],
                   src, None)
        self.assertFalse(rows[0]["ok"])
        self.assertEqual(rows[0]["found"], 0)

    def test_a_name_spelled_the_way_a_summary_spells_it(self):
        src = "the work of W. Howells, a lad of nineteen"
        rows = run([{"id": "R4", "claim": "the book names W. Howell", "where": "who's-who",
                     "check": "present", "pattern": r"W\. Howell\b"}], src, None)
        self.assertFalse(rows[0]["ok"], "W. Howell must not match W. Howells")

    def test_stops_marking_him_after_a_chapter(self):
        src = ("CHAPTER VIII. Fairy Rings--The Prophet Jones and his Works "
               "... says the Prophet Jones ... the Prophet Jones tells of ... "
               "observes the Prophet Jones in telling the story")
        rows = run([{"id": "R5", "claim": "Sikes stops naming Jones after Book I ch VIII",
                     "where": "the register", "check": "count_after", "pattern": "Prophet Jones",
                     "after": "CHAPTER VIII. Fairy Rings", "expect": 0}], src, None)
        self.assertFalse(rows[0]["ok"])
        # four, not three: the marker ends at "Fairy Rings", so the rest of that same
        # heading — "The Prophet Jones and his Works" — is already after it.
        self.assertEqual(rows[0]["found"], 4)


class Checks(unittest.TestCase):
    def test_present_and_absent(self):
        rows = run([{"id": "A", "claim": "", "where": "", "check": "present", "pattern": "fairy"},
                    {"id": "B", "claim": "", "where": "", "check": "absent", "pattern": "dragon"}],
                   "A fairy tale, and a fairy ring.", None)
        self.assertTrue(rows[0]["ok"]); self.assertTrue(rows[1]["ok"])

    def test_counts(self):
        src = "elf elf elf"
        specs = [("count", 3, True), ("count", 2, False),
                 ("count_min", 2, True), ("count_max", 2, False)]
        for check, expect, ok in specs:
            r = run([{"id": check, "claim": "", "where": "", "check": check,
                      "pattern": "elf", "expect": expect}], src, None)[0]
            self.assertEqual(r["ok"], ok, f"{check} {expect}")

    def test_case_sensitivity_is_opt_in(self):
        r = run([{"id": "c", "claim": "", "where": "", "check": "present", "pattern": "GOBLIN"}],
                "goblin", None)[0]
        self.assertTrue(r["ok"], "case-insensitive by default")
        r = run([{"id": "c", "claim": "", "where": "", "check": "present",
                  "pattern": "GOBLIN", "case": True}], "goblin", None)[0]
        self.assertFalse(r["ok"])

    def test_whitespace_is_collapsed_so_a_wrapped_name_still_matches(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "s.txt").write_text("was one Gwyn ap\nNudd. He was also ruler", encoding="utf-8")
            text = load_source(root, "s.txt", False)
        r = run([{"id": "w", "claim": "", "where": "", "check": "present",
                  "pattern": "Gwyn ap Nudd"}], text, None)[0]
        self.assertTrue(r["ok"], "a name wrapped across lines must still be found")

    def test_index_exclusion(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "s.txt").write_text("The body has no such name.\nINDEX.\nGwyn ap Nudd, 19\n",
                                        encoding="utf-8")
            kept = load_source(root, "s.txt", False)
            cut = load_source(root, "s.txt", True)
        self.assertTrue(run([{"id": "i", "claim": "", "where": "", "check": "absent",
                              "pattern": "Gwyn ap Nudd"}], cut, None)[0]["ok"])
        self.assertFalse(run([{"id": "i", "claim": "", "where": "", "check": "absent",
                               "pattern": "Gwyn ap Nudd"}], kept, None)[0]["ok"],
                         "without --exclude-index the index makes every absent-claim pass")

    def test_after_marker_missing_is_an_error_not_a_pass(self):
        r = run([{"id": "m", "claim": "", "where": "", "check": "count_after",
                  "pattern": "x", "after": "NOT PRESENT", "expect": 0}], "abc", None)[0]
        self.assertFalse(r["ok"]); self.assertIn("not in the source", r["error"])

    def test_unknown_check_is_an_error_not_a_pass(self):
        r = run([{"id": "u", "claim": "", "where": "", "check": "vibes", "pattern": "x"}],
                "x", None)[0]
        self.assertFalse(r["ok"]); self.assertIn("unknown check", r["error"])

    def test_report_check(self):
        rep = {"footnotes": {"placedWithTheirSection": 604}}
        ok = run([{"id": "r", "claim": "", "where": "", "check": "report",
                   "path": "footnotes.placedWithTheirSection", "expect": 604}], "", rep)[0]
        self.assertTrue(ok["ok"])
        bad = run([{"id": "r", "claim": "", "where": "", "check": "report",
                    "path": "footnotes.nope", "expect": 1}], "", rep)[0]
        self.assertFalse(bad["ok"]); self.assertIn("no such path", bad["error"])




class AfterOccurrence(unittest.TestCase):
    """A chapter heading is printed in the contents before it is printed in the body."""

    SRC = ("CONTENTS ... CHAPTER VIII. The Prophet Jones and his Works 104 ... "
           "body body body ... CHAPTER VIII. The Prophet Jones and his Works ... "
           "says the Prophet Jones ... the Prophet Jones tells")

    def _run(self, **kw):
        spec = {"id": "ao", "claim": "", "where": "", "check": "count_after",
                "pattern": "Prophet Jones", "after": r"CHAPTER VIII\.", "expect": 0}
        spec.update(kw)
        return run([spec], self.SRC, None)[0]

    def test_last_is_the_default_and_measures_from_the_body(self):
        r = self._run()
        self.assertEqual(r["found"], 3)
        self.assertIn("last", r["afterOccurrence"])

    def test_first_would_measure_from_the_contents(self):
        r = self._run(after_occurrence="first")
        self.assertEqual(r["found"], 4, "measuring from the contents counts the contents entry too")

if __name__ == "__main__":
    unittest.main(verbosity=2)
