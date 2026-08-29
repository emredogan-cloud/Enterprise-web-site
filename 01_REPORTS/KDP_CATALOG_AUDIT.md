# KDP Catalog Audit

> Method: live web search for each title named as a candidate Valice Press / Emre Doğan KDP catalog item, plus author-page searches for "Valice Press" and "Emre Doğan" on Amazon. **This tool cannot browse Amazon's own site search or your KDP Bookshelf directly** — it uses general web search, which is a real limitation, stated explicitly below rather than papered over.

## 1. Verification result — do not assume, verify

Per instruction, none of the following were assumed live. Each was searched individually:

| Candidate title | Search result | Status |
|---|---|---|
| Codex Enigmatica | No matching Amazon listing found. Unrelated books share partial title overlap (*Codex Enigmatum* by Rami Hansenne, *Codex Mysterium*, *Codex Esoterica*) — different authors, different publishers. | **NOT VERIFIED LIVE** |
| The Great Book of World Myths | No matching listing. | **NOT VERIFIED LIVE** |
| The Great Book of World Games | No matching listing. | **NOT VERIFIED LIVE** |
| The Myth Hunter's Field Book | No matching listing (an unrelated *Myth Hunter* fiction series by Percival Constantine exists — different book, different author). | **NOT VERIFIED LIVE** |
| Codex Bestiarium | No matching listing. | **NOT VERIFIED LIVE** |
| Codex Mythologica | No matching listing. | **NOT VERIFIED LIVE** |
| "Valice Press" as Amazon publisher/author-page | No Amazon Author Page or storefront found under this name. | **NOT FOUND** |
| "Emre Doğan" as KDP author | No Amazon listing found under this name; unrelated people with the same name appear (a researcher, a Dynatrace blog author) but no publishing connection. | **NOT FOUND** |

## 2. What this does — and does not — mean

**INFERENCE, not fact.** A "not found" web-search result does not prove non-existence. Plausible explanations, in order of likelihood given the codebase evidence:

1. **The book(s) are real but very new / thin SEO footprint.** The codebase's `/codex-enigmatica/verify` page is strong internal evidence that *Codex Enigmatica* is a real, physically printed book — the page's copy explicitly quotes back-matter text ("the address is printed on the last leaf of this book") and treats a specific puzzle mechanic as already fixed and shipped. A brand-new KDP title can take days to weeks to be indexed by general web search engines (as opposed to Amazon's own on-site search).
2. **Published under a different exact title, subtitle, or pen name** than the working titles used internally.
3. **Genuinely not yet published** — written/designed but not submitted to KDP, or submitted and pending review.
4. **Tool limitation** — general web search is a weak proxy for Amazon's internal catalog; it under-indexes low-review-count KDP titles especially in non-fiction/puzzle niches.

## 3. What could NOT be audited (and must come from the Founder or KDP Bookshelf directly)

Because no listing was located, none of the following could be collected for any candidate title: subtitle, format, list/Kindle/paperback/hardcover price, page count, category, age range, description, review count, rating, publication status, A+ content presence, series info, author-page position, cover positioning.

**RECOMMENDATION:** The single highest-leverage next step for this audit is not more web search — it is 10 minutes of the Founder pulling screenshots or exports from **KDP Bookshelf** (kdp.amazon.com → Bookshelf) directly: title, ASIN, status (live/draft/in review), format(s), price(s), and pasting the *exact* live title strings and ASINs back into this repo (e.g., `memory/kdp-catalog-snapshot.md`). Every downstream section of this business plan that references "the catalog" (pricing strategy, bundles, Amazon→website funnel, back-matter QR/URL placement) is currently working from the working titles in your own master prompt, not confirmed live data, and should be re-verified against that snapshot once available.

## 4. What the codebase confirms independently of Amazon

Regardless of Amazon status, the codebase proves:
- *Codex Enigmatica* exists as a physical product with a 100-puzzle mechanic and a single final answer that is deliberately withheld from the printed pages and validated only via `/codex-enigmatica/verify` on this website. This is a genuine, already-shipped **Amazon → website funnel mechanism** (see `CUSTOMER_ACQUISITION_STRATEGY.md` §Amazon funnel) — independent of whether the book is currently live on Amazon.
- No other candidate title (World Myths, World Games, Myth Hunter, Bestiarium, Mythologica) has any trace in the codebase — no verification page, no content stub, no catalog entry, no reference anywhere in `src/`.

## 5. Immediate action for the Founder

1. Export the current KDP Bookshelf list (title, ASIN, format, price, status) — 5 minutes.
2. Paste real Amazon product-page URLs for anything live — this audit (and the funnel/back-matter recommendations in later reports) becomes exact rather than inferred the moment that exists.
3. If *Codex Enigmatica* is live, add its ASIN to the site (product page, footer, or the verify page itself) so its own back-matter funnel doesn't dead-end without a "buy the next book" link.
