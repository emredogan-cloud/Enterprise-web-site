# Final KDP distribution report — 2026-09-07

**12 titles · 23 live listings · 8 print packages validated and ready to upload · 0 uploaded
this pass, and the reason is a signature, not a file.**

No KDP API was called. Everything below was read through the normal browser workflow, and no
button that submits anything to Amazon was pressed.

---

## 1. The shelf, as read

| ASIN | Format | Price | Status | Submitted |
|---|---|---|---|---|
| `B0HHNCVQVX` | Paperback | $31.99 | Live · Updates in review | 2026-09-03 |
| `B0HJ2TPX4T` | Paperback | $16.99 | Live | 2026-09-07 |
| `B0HDDR84MF` | Paperback | $27.99 | Live | 2026-08-07 |
| `B0HD8121RR` | Kindle eBook | $6.99 | Live | 2026-08-06 |
| `B0HCY8KY3X` | Paperback | $21.99 | Live | 2026-08-05 |
| `B0HDBFZRQ4` | Hardcover | $32.99 | Live | 2026-08-07 |
| `B0HFP4KYX5` | Paperback | $14.99 | Live | 2026-08-18 |
| `B0HDQRPKST` | Kindle eBook | $6.99 | Live | 2026-08-10 |
| `B0HDTL5V2H` | Paperback | $14.99 | Live | 2026-08-11 |
| `B0HDZJ4PHQ` | Hardcover | $26.99 | Live | 2026-08-12 |
| `B0HGRZ3BRC` | Kindle eBook | $9.99 | Live | 2026-08-27 |
| `B0HGSVF15Q` | Paperback | $19.99 | Live | 2026-08-27 |
| `B0HH3B4HQ7` | Hardcover | $29.99 | Live · Updates in review | 2026-08-29 |
| `B0HDLT1V3P` | Paperback | $29.99 | Live | 2026-08-09 |
| `B0HG44FH1B` | Kindle eBook | $11.99 | Live | 2026-08-22 |
| `B0HG3KMK9L` | Paperback | $22.99 | Live | 2026-08-21 |
| `B0HG41F21F` | Hardcover | $34.99 | Live | 2026-08-22 |
| `B0HHHWXGG4` | Paperback | $12.99 | Live | 2026-09-02 |
| `B0HHLZ31CV` | Hardcover | $21.99 | Live · Updates in review | 2026-09-03 |
| `B0HDLS4W8Q` | Kindle eBook | $12.99 | Live | 2026-08-09 |
| `B0HDLQHQ7H` | Paperback | $24.99 | Live | 2026-08-09 |
| `B0HDLLPG5M` | Hardcover | $37.99 | Live | 2026-08-09 |
| `B0HHS2JW9N` | Paperback | $14.99 | Live | 2026-09-04 |

Three carry a pending metadata update (*Live · Updates in review*): Codex Enigmatica hardcover,
Hangul hardcover, World Games large print. Unchanged since the previous pass.

## 2. Reconciliation against the catalogue

| Check | Result |
|---|---|
| Prices, both directions | **23 of 23**, zero drift |
| Listings with no catalogue row | 0 |
| Catalogue ASINs absent from the shelf | 0 |
| Malformed or invented ASINs | 0 |
| **Numbers in the title vs the book's measured counts** | **4 mismatches** |

### The four mismatches

All four are Codex Bestiarium, and they are the same defect on four formats:

| ASIN | Format | Title claims | The book has |
|---|---|---|---|
| `B0HDLS4W8Q` | Kindle | 120 creatures | **112** |
| `B0HDLQHQ7H` | paperback | 120 creatures | **112** |
| `B0HDLLPG5M` | hardcover | 120 creatures | **112** |
| `B0HDLT1V3P` | large print | 120 creatures | **112** |

The manuscript holds 112 entries with 112 distinct names, and the printed interior prints
*"112 legendary creatures"* in its own front matter. 112 + 8 `kinOpenings` = 120, which is
exactly the coincidence that makes a wrong number look explained — but those are the essay
openings for the eight kin families, not creatures.

This check did not exist before today. `metadata-lint` refuses an unbacked number in a title and
is not weak — it found and fixed real gaps across seven books this pass — but it compares the
project config's title to the project config's counts, so both sides can be right while what a
customer reads is wrong. `kdp-reconcile.mjs` now joins the **live shelf titles** to the measured
counts. Recorded as **F-052**.

## 3. Ready to upload — eight editions

| Book | Format | Trim | Pages | Geometry | Preflight | cover-check |
|---|---|---|---|---|---|---|
| Greek Alphabet Workbook | paperback | 8.5×11 | 100 | ok | ok | ok |
| Greek Alphabet Workbook | hardcover | 8.25×11 | 100 | ok | ok | ok |
| Codex Mythologica: The Puzzle Book | hardcover | 8.25×11 | 156 | ok | ok | ok |
| Epictetus | paperback | 6×9 | 176 | ok | ok | ok |
| Seneca | paperback | 6×9 | 154 | ok | ok | ok |
| Myths and Legends of China | paperback | 6×9 | 108 | ok | ok | ok |
| Indian Myth and Legend | paperback | 6×9 | 94 | ok | ok | ok |
| Mythical Monsters | paperback | 6×9 | 74 | ok | ok | ok |

Hardcover spine widths are **read** from KDP's Cover Calculator block in each project config,
never derived — the house standard forbids deriving them, and deriving them reproduced the exact
0.128 in error that standard documents.

**None was uploaded.** Each fails gates 7, 8 and 10, all Founder sign-offs, and gate 8's
evidence is a physical proof copy. Uploading past three unrun compliance gates is the trade the
gate system exists to prevent.

## 4. The KDP Previewer loop

**Not entered, because nothing was uploaded.** The loop is defined and ready — upload, launch
Previewer, fix the local source on any error, rebuild, re-upload — and the local checks that
precede it all pass. The Previewer is the one instrument that finds what local checks cannot;
this catalogue has been bitten by that before, when it printed a table off the page and dropped
three entries with every local check green. That is a reason to run it, not to skip it.

## 5. Formats not on KDP

28 Amazon-fulfilled formats carry no ASIN. Eighteen belong to draft books a visitor cannot see.
Of the ten on published books, **eight are the ready packages above**, one is the Myth Hunter's
hardcover (**F-051** — a format decision, not a build), and one is a large print marked
not-applicable.

## 6. Quality queue

0 suppressed · 0 quality warnings · 1 open recommendation, unchanged: Codex Enigmatica's Kindle
edition is asked for a reading interest age because Amazon has it shelved under *Teen & Young
Adult*. Answering the prompt would entrench the wrong shelf — that is **F-048**, and the fix is
to move the categories, not to fill in an age.

---

*Read through the KDP web UI on 2026-09-07. No private or undocumented API was used, and no
account-owner confirmation was bypassed.*
