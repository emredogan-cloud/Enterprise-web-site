# The Puzzles of Henry Dudeney — Phase 3

**State: production-ready, not on sale.** Gate 1 passed today with a live
market sample; Gate 5's evidence is complete and needs the Founder's signature;
Gates 2, 8, 10 and 12 are founder gates by house rule. The Paddle price exists
in the live account. Nothing else is missing.

---

## 1. Gate 1 — market fit: **PASSED**

Twelve titles, three queries (`dudeney puzzles`, `mathematical puzzles
classic`, `amusements in mathematics`), amazon.com US in USD, page counts and
sales ranks read from the product pages themselves. Full table in the book
project's `MARKET.md`; raw rows in `QA/market-sample-2026-09-02.json`.

**What the sample says, in the order it matters:**

1. **The whole text is already free, and people read it.** *Amusements in
   Mathematics* (B00849DX3U) is **$0.00 on Kindle, 621 reviews at 3.9★, BSR
   #193 in Mathematics** — by far the strongest performer in the sample and the
   only title inside the top thousand of any category. Every paid edition of
   this text competes with a free copy that is easy to find and demonstrably
   read.
2. **The market still pays ten to fifteen dollars for the same words, typeset.**
   Dover's *536 Puzzles and Curious Problems* ($9.99 Kindle, 448 pp, 29
   reviews, 4.3★) and *The Canterbury Puzzles* ($14.76 paperback, 256 pp, 9
   reviews, 4.5★) are the same public-domain author, edited, and they sell.
3. **Nobody in the sample sells the apparatus.** Not one competing edition
   carries a hint, a difficulty mark, a glossary of pre-decimal money or a
   concordance. The two "Modern Edition" volumes ($13.99 and $6.99) split the
   book into parts and carry no reviews at all.
4. **The category is a long tail, not a contested list.** Only three of twelve
   rank better than #400,000. Median review count 64; the one title over 500
   reviews (*The Moscow Puzzles*, 939, #10,598) is Russian recreational maths,
   not Dudeney.

Kill criterion (no gap, or top-20 all ≥ 4.5★ with ≥ 500 reviews) **not met**.
Gate 1 recorded with both evidence files.

---

## 2. Gate 5 — factual verification: evidence complete, signature pending

The ledger was rewritten into the house schema (18 claims:
`text`/`location`/`author`/`verdict`/`verifier`/`evidence`/`verifiedAt`) and
`claim-lint` now passes clean: **18 claims, none pending, none wrong**.

Two claims changed substance, and both were wrong in the printed edition.

### C-014 — the Frame–Stewart proof. Verified, and re-attributed.

The edition's Note on the Text credited the 2014 proof to *"Thierry
Bousquet-Mélou and colleagues"*. That conflates two mathematicians and invents
a co-authorship.

The proof is **Thierry Bousch's**, single-authored: *"La quatrième tour de
Hanoï"*, Bulletin of the Belgian Mathematical Society — Simon Stevin **21:5
(2014), 895–912**, doi:10.36045/bbms/1420071861. Verified by fetching the
author's own preprint (dated 15 June 2014) and reading the abstract, which
states that the Frame–Stewart move count "is indeed" the minimum possible for
four pegs. Five pegs and above remain open, and the edition does not claim
otherwise.

The claim was **true**; only the name was wrong. Nothing cut. The full citation
now stands where the wrong name was, and the fact is recorded house-wide as
`F-2026-0009` so no future book can repeat it.

### C-011 — Dudeney did not invent verbal arithmetic.

The chronology read: *"1924 — Prints SEND + MORE = MONEY in the Strand — the
first alphametic, a form he invented."*

The July 1924 Strand date is correct. The invention claim is not: letter-for-
digit puzzles were in print by **1864** (an example in *The American
Agriculturist* that also disposes of the popular attribution to Sam Loyd), the
inventor is unknown, and the word *alphametic* is **J. A. H. Hunter's**, coined
in 1955. Rewritten to say exactly that.

The interior and the EPUB were rebuilt after both corrections: **144 pages, 110
puzzles, 28.1% original apparatus**, epubcheck 0 fatals / 0 errors / 0 warnings.

---

## 3. Preflight — one real defect found and fixed

| File | Result |
|---|---|
| `OUTPUT/interior-main.pdf` | **pass** — 4 fonts all embedded, title and author present, 144 pages, 6.000 × 9.000 in |
| `OUTPUT/cover-paperback.pdf` | **was FAIL** — `Author='anonymous'` |

The cover builder set a title and no author. That is the exact defect that
shipped in the Myth Hunter's Field Book and the reason the preflight has a
metadata check at all. `build_cover.py` now sets Author, Subject and Creator;
the cover passes.

---

## 4. Price

### Direct ebook — $9.99, conditionally

$9.99 nets **$8.99** (90% after Paddle's 5% + $0.50). The sample median is
exactly $9.99, and Dover's 448-page Kindle sits on it.

The comparison that decides the product page is not Dover, though — it is the
**free** text at BSR #193. Ours is 144 pages against 544 puzzles' worth of free
material. The price is defensible only if the first thing a visitor sees is
what the free copy does not have:

> a hint for every puzzle · a difficulty mark on every puzzle · pounds,
> shillings and pence explained · a concordance back to the original numbering
> · 110 chosen out of 544 · Dudeney's own words and his own solutions

Selling "110 Dudeney puzzles" at $9.99 against a free 544 is a losing sentence.
Selling "Dudeney, finished" is not.

Dropping to $6.99 would cost $2.85 a copy — meaning $9.99 needs only 68% of
$6.99's volume to earn the same. Given that the competing product is free, a
32% volume difference is not what decides this sale. **Hold $9.99.**

### Print — paperback only

| Format | Print cost | List | Net | Margin | Decision |
|---|---|---|---|---|---|
| Paperback 6×9, 144 pp | $2.73 | **$14.99** | $6.27 | 41.8% | **build** |
| Hardcover 6×9, 144 pp | $7.38 | $26.99 | $8.82 | 32.7% | **no** |
| Large print 8.5×11, ~230 pp | $4.91 | $24.99 | $10.08 | 40.4% | **defer** |

- **Paperback** is anchored by Dover's *Canterbury Puzzles* at $14.76 with 9
  reviews. $14.99 for a 144-page annotated selection sits on that anchor.
- **Hardcover** is not a judgement call. Printing is $7.38 against a $12.30 KDP
  minimum, and **no price in the band clears the 35% margin target** — $26.99
  reaches 32.7%. A 144-page case-bound book is also physically thin, and no
  hardcover Dudeney appears anywhere in the sample. Do not make it.
- **Large print** has the best per-unit economics of the three, but the
  large-print buyers the sample surfaced are word-search and brain-games
  readers, not arithmetic-puzzle readers, and it would compete with the
  paperback for the same reader. Revisit after 30 days of paperback data.

---

## 5. What a direct customer would receive

Verified in production today against the real master
(`/api/admin/fulfillment-check`): watermarked PDF, permanent library,
unlimited re-download through signed URLs, the online reader, and the free
companion at `/companion/dudeney` (12 puzzle sheets, hints booklet).

**Not the EPUB.** It exists and is clean, but fulfillment delivers one file.
The live Paddle description promised it; the sentence has been removed. It goes
back the day a second artifact ships — and it is the strongest thing this
edition could add, because it is exactly what neither the free Gutenberg text
nor Dover's Kindle gives a reader who wants both a printable PDF and a
reflowable book.

---

## 6. Gates

| # | Gate | State |
|---|---|---|
| 1 | Market fit | **passed 2026-09-02** — 12-row live sample |
| 2 | Rights | founder — ledger RL-0024–26 GREEN pending signature |
| 3 | Originality | passed |
| 4 | Content quality | passed |
| 5 | Factual verification | **evidence complete**, founder signature required (`--approved-by founder`) |
| 6 | Editorial | passed |
| 7 | Cover | founder — preflight now clean |
| 8 | Interior / price | founder — $9.99 / $14.99 proposed with the arithmetic above |
| 9 | Metadata | passed |
| 10 | KDP compliance | founder — AI declaration |
| 11 | Website product QA | pending publication |
| 12 | Publication approval | founder |

Everything the agent can do is done. The Paddle price
`pri_01m1ha3tdx5bbyfqhe8k6qrep4` is live at $9.99, the master is in the bucket
production reads, the previews are rendered, the companion is live, and the
catalogue entry is written and staged at `websiteStatus: "draft"`. One word
from the Founder turns it on.
