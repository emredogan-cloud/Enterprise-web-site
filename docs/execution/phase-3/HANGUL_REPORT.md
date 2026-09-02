# Korean Hangul Handwriting Workbook — Phase 3

**The paperback has been on sale on Amazon since 29 August. The site was not
linking to it.** That is the finding of this phase, and it was found by
searching Amazon for the title rather than by waiting to be told an ASIN.

---

## 1. What is live

| | |
|---|---|
| ASIN | **B0HHHWXGG4** |
| Price | **$12.99** — exactly the Founder-approved figure (decision K43) |
| Pages | **124** |
| Trim | 8.5 × 11 in |
| ISBN | 979-8170602360 |
| Published | 29 August 2026 |
| Reviews / rank | 0 reviews, no Best Sellers Rank |

Read from the live listing on 2026-09-02 with
`scripts/market/verify-amazon.mjs`. Four independent facts — title, price, page
count and trim — match the catalogue, which is why this ASIN was written into
the catalogue rather than merely reported.

**Hardcover: not on the shelf.** An author-wide Amazon search returns the
paperback and no hardcover. Either still in KDP review or never submitted. No
ASIN is invented while that is true; the catalogue keeps it at `coming_soon`.

---

## 2. Published on the site today

`websiteStatus` moved `draft` → `published`. The reasoning, recorded in the
catalogue file next to the change:

> The page links to a listing that already sells to the public. Withholding our
> own page does not withhold the book; it only costs the sale.

What Gate 2 gates is the **direct ebook**, and that stays `unavailable` with
`directSaleBlockedBy` naming the pending signature. The Founder can reverse the
publication with a one-word edit if they read it differently — that is what
`websiteStatus` being data rather than a side effect is for.

The page carries a **four-page preview**: Lesson 4 entire — where each letter
goes inside the syllable block, the six real words built from it, and both
trace-then-write practice pages. It is the step the book exists for and the one
a buyer wants to see done well before paying for 124 pages of ruled boxes.
Rendered from the **remediated** interior, not the earlier build.

---

## 3. Rights — remediated in the files, one thing unverifiable from outside

The K46 remediation of 2026-09-02 is complete in the project: the CC BY-SA
dictionaries and the CC BY-NC phonetic chart withdrawn (not relabelled), all 97
words re-verified against the National Institute of Korean Language's learner
vocabulary list (KOGL Type 1), one word replaced, every gloss rewritten, every
edition rebuilt. Confirmed locally: the sources page of
`09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_124pp.pdf` reads *"Korean
Learner's Vocabulary List"* and cites the National Institute throughout.

`rights-lint` reports 26 ledger rows, no RED, and three YELLOW rows whose only
defect is the missing signature.

**What cannot be verified from outside Amazon:** whether the interior currently
uploaded to KDP is the remediated file. The Founder reports having replaced it.
The stated verification — page count 124 — does not discriminate, because the
pre- and post-remediation interiors are **both** 124 pages, and Amazon exposes
no other way to read the file. The catalogue's blocker list now says this
plainly instead of implying the check was made. **One look inside KDP settles
it** (handbook F1a).

---

## 4. Remaining gates

| | Holder | What |
|---|---|---|
| Gate 2 | Founder | Sign the ledger: `05_APLUS_COVER/book_metadata.json → legal.a7_status` = `FOUNDER_REVIEWED_CLEARED`, with `reviewed_on` / `reviewed_by`. Two open A7 items: the cover-art commercial licence and the KDP AI declaration. |
| Direct ebook | follows Gate 2 | The fixed-layout EPUB 3 was rebuilt on 2026-09-02 (13.4 MB) from the remediated content. It is a **reference** edition, not reflowable, and the direct channel currently ships PDFs only — so this format needs a decision about what is actually delivered, not just a price. |
| Hardcover | Amazon | In review, or not submitted. |

---

## 5. Funnel

`Amazon → book → companion → email → series` is built and none of it has been
walked by a real person. `/companion/hangul` is live. The printed interior does
**not** carry the companion URL — it predates the companion — so the only way a
reader of the paperback reaches the site today is by searching for the
publisher's name. That URL belongs in the next interior revision, alongside the
remediated-file confirmation, so the two changes ride one KDP upload rather
than two.

---

## 6. Price

Unchanged and correct: paperback **$12.99** (live and charging exactly that),
hardcover **$21.99** when it appears. Both Founder-approved under K43. Nothing
in this phase argues for moving either — the book has no sales data at all, and
changing a price with no data is not a decision, it is a coin toss.
