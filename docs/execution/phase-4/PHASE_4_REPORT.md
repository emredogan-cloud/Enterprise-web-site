# Phase 4 — First revenue, customer acquisition, KDP linkage: report

**Date:** 2026-09-02 (evening) · **Branch:** `feat/production-readiness` · **Production:** promoted from this branch four times

Statuses are used strictly. **DONE** = built, run and measured. **PARTIAL** = built, a step is missing, and the step is named. **BLOCKED** = named blocker, named owner. **DEFERRED** = deliberately not this phase, with the reason.

---

## 1. The short answer

**The Puzzles of Henry Dudeney is on sale. One purchase now delivers two files. And eleven live Amazon books were found carrying no route back to Valice Press at all — one of them printing a biography nobody wrote.**

Still zero orders, zero reviews, zero indexed pages. Phase 4 did not produce a customer. It produced the product a customer can buy, the second artifact that makes buying direct worth doing, and the audit that explains why eight books on Amazon have produced no audience.

---

## 2. Dudeney — DONE

| | |
|---|---|
| Gates | **12 of 12 recorded with evidence.** Founder signed 2, 5, 8, 12 and gave the AI declaration (10); 7 follows from the publication approval; 1 passed in Phase 3 on a live sample; 3, 4, 6, 9 already passed |
| Catalogue | `published`, ebook `available` |
| Paddle | `pri_01m1ha3tdx5bbyfqhe8k6qrep4`, $9.99 USD, one-time, active, live account |
| Rights ledger | RL-0024–26 **GREEN**, `approved_by: founder`, `approved_on: 2026-09-02` |
| Page | 200, leads with the apparatus, mentions "public domain" **zero times** above the fold |
| Delivery | PDF **and** EPUB, both proven in production on the real masters |

The product page follows §3: the first thing a visitor reads is a hint for every puzzle, a difficulty mark, the old money explained and the concordance — not that the source text is free. That distinction is the whole commercial argument, because the source text *is* free, on Kindle, at BSR #193 with 621 reviews.

Two things were corrected on the way through, both because a lint refused to pass:

- **"(Annotated)" added to the listing title.** KDP requires a differentiated public-domain edition to carry its tag; `compliance-lint` checks it. It is also the strongest word on the listing.
- **The author biography.** `metadata-lint` blocks Gate 9 on a null `authorBio`. The Founder's biography is now in all eight book projects — replacing an **invented one-liner** in three of them (§6).

---

## 3. Second-artifact delivery — DONE

The problem Phase 3 named: an epubcheck-clean EPUB that nothing shipped, and a Paddle description that promised it anyway.

**What was built.** `books.epub_file_key` and `entitlements.epub_key` (migration 0007, applied to production *and* the sandbox); an EPUB step in the fulfillment worker; a format-aware `downloadBook(bookId, "pdf" | "epub")`; EPUB buttons in the library and on the order page, rendered only when that order actually produced one; the master uploaded to R2.

**How an EPUB is watermarked.** Not by stamping — there are no pages. The stamp is a licence leaf appended last in the spine, the same line written into `dc:rights`, and machine-readable `valice:order` / `valice:book` metas, the counterpart of the PDF's XMP keywords. The book's own chapters are untouched: a watermark that edits the text someone paid for is a defect, not a deterrent.

**What the tests are for.** Fifteen of them, and the one that matters most is the OCF rule: `mimetype` must be the first entry in the zip and stored uncompressed. A naive re-zip breaks that silently and every reading system then rejects the file. Also covered: idempotency, re-stamping a different buyer without stacking licences, XML escaping of a name containing `<` and `&`, a non-standard OPF directory, and refusing a file that is not an EPUB rather than returning it unstamped. epubcheck on the stamped Dudeney: **0 fatals, 0 errors, 0 warnings.**

**Proven in production, on the real masters:**

```
/api/admin/fulfillment-check?slug=the-puzzles-of-henry-dudeney
  master 2.20 MB → watermark 442 ms → signed URL 200 → 2 195 284 bytes, is a PDF ✓
  epub   1.41 MB → watermark 330 ms → signed URL 200 → 1 412 617 bytes,
                   starts PK, first entry `mimetype`, byte-identical ✓
  no order, entitlement or transaction created
```

The Paddle description now names the EPUB, and it is true for the first time.

**The design rule that came out of it:** every line of the new `DirectEditionPanel` is derived from a column the fulfillment worker reads. There is no prop for "say we have an EPUB". The only way to make that line appear is to put an EPUB in the bucket.

---

## 4. The KDP linkage audit — DONE, and it is the finding of the phase

`scripts/factory/kdp-linkage-lint.mjs` reads the built interior of every print edition with `pdftotext` — what a KDP reviewer sees, not what the source claims.

| | |
|---|---|
| **COMPLETE** | 5 |
| **MISSING** | 11 |
| **NEEDS_REVISION** | 1 |
| **BLOCKED** | 1 |

At the start of the phase it was 3 / 14 / 0 / 1. **Eleven live Amazon editions carried no route back to Valice Press at all.**

Only one title got this right before today, and it did it well: **Codex Enigmatica** prints `valicepress.com/codex-enigmatica/verify` in both print editions — a page that checks the single word hidden in the book. Reader utility first, no email, no data wall. That is the pattern every other title should copy, and it was already sitting in the catalogue.

### What reading the PDFs found that nobody was looking for

> **"Emre is a puzzle designer, mythologist, and game archivist dedicated to preserving ancient cultures, codes, and stories for the next generation."**

A biography nobody authorised, naming three occupations the Founder has not claimed, printed on the imprint page **and the back cover** of three live World Games editions. It came from `02_MANUSCRIPT/frontmatter.json`, which nothing was checking. The lint now refuses it by name, along with the pre-rebrand imprint and placeholder text.

### World Games paperback and hardcover: fixed, still 160 pages

The interiors now end on a companion page — 31 board templates, culture cards, score sheets, the index of games, the URL, and one sentence saying nothing is asked in return — and carry the Founder's own biography.

**The page count is the point.** `section()` pads to a recto and took the book to 162, which changes the spine, invalidates a cover already at KDP, and turns a one-file update into a two-file revision with a new proof. Flowing onto the existing blank final page instead holds it at 160. Preflight clean; the project's own 229 checks green.

**The large print was deliberately left alone** and restored from backup. It is in KDP review right now, it has no blank final page so the companion adds two pages, and withdrawing a book mid-review to save a URL is the wrong trade. The lint reports it as outstanding rather than pretending.

### The decision for every book (§20)

| Book | Live editions | Decision | Why |
|---|---|---|---|
| World Games | 2 | **done** (paperback, hardcover) | companion existed, blank page available, ads about to point here |
| World Games large print | 0 (in review) | next revision | mid-review; adds 2 pages |
| Hangul | 1 | **update now** | companion live; the interior is being reopened anyway for F1a — one upload, two fixes |
| World Myths | 2 | with companion | strongest companion case in the catalogue: the book already has a world map, culture cards and a pronunciation guide, and its buyers are parents and teachers who print things |
| Codex Bestiarium | 3 | with companion | a printable Thompson-motif index for 112 creatures; nobody publishes one. Not urgent |
| Codex Mythologica | 3 | with companion | wait for the Select term to lapse **2026-11-03** and do the interior and the direct edition together |
| Field Book | 1 | with companion | the Enigmatica pattern — online answer-checking instead of a printed key — is a better product, and a rebuild rather than a back-matter page |
| Dudeney | 0 | already done | typeset after the companion existed; the template for the rest |
| Enigmatica | 2 | already done | the pattern |

Full per-edition detail: `KDP_VALICE_LINKAGE_MATRIX.csv` and `KDP_VALICE_LINKAGE_REPORT.md`.

---

## 5. Prices — two moved, both following Amazon

The Founder's KDP screenshots settled what Phase 3 could not read from the shelf.

- **Codex Mythologica Kindle is $6.99.** Phase 3 read $4.99 off the live page and reported the change as unconfirmed. It had simply not propagated; it has now. The catalogue was wrong and is fixed.
- **World Myths Kindle is $6.99 too**, which the catalogue did not know at all.

The house rule is that a direct price matches the Kindle list to the cent, so **World Myths direct moved $4.99 → $6.99**. That is Phase 3's "scenario C" arriving for free: **+45% contribution per copy** ($6.14 against $4.24) at *parity* rather than at a premium, so it invites no price-matching and raises no question about why the publisher's own shop costs more.

A Paddle price is immutable in amount, so `provision-paddle.mjs` now creates the new price and archives the old one in a single run — it used to print "do this manually", which is the shape of the mistake that once put a nonexistent price id into production.

**And the Select term is now a date.** The KDP promotion manager: enrolled 6 August 2026, **ends 3 November 2026**, auto-renew already off. Cancelling auto-renew does not end the current term. Codex Mythologica's ebook cannot be sold here before that date, and nothing is waiting on anybody — it is waiting on a calendar.

---

## 6. Corrections to Phase 3

Both came from reading files rather than re-reading reports.

**World Games is a large-trim book.** 8.5 × 11 paperback, 8.25 × 11 hardcover — read from the PDFs' own page size. Phase 3 costed it at 6 × 9.

| | Phase 3 said | Actually |
|---|---|---|
| Paperback print cost | $2.92 | **$3.72** |
| Paperback net @ $22.99 | $10.87 | **$10.07** (BE ACOS 43.8%) |
| Hardcover print cost | $7.57 | **$8.37** |
| Hardcover net @ $34.99 | $13.42 | **$12.62** (BE ACOS 36.1%) |

**The recommendation to test the hardcover at $29.99 is withdrawn.** At the true print cost, $29.99 returns 32.1% and misses the 35% house target; only $34.99 clears it — and $34.99 is the price the market says is too high against a 400-page Oxford hardcover at $24.95. The hardcover is squeezed from both sides. **The paperback is the ad target**, and the answer to §10 is *product-targeting only, do not lead with the hardcover*.

**The invented author biography** was in three live books and neither Phase 3's brand audit nor its Amazon verification found it, because both looked at the website and the listings and neither opened a PDF.

---

## 7. Email — DONE

`consentRecorded: true`. The Resend audience properties are declared, so a signup now stores what the subscriber agreed to — the last open email defect from Phase 3, closed by the Founder and confirmed by measurement. Welcome mail still delivers from `hello@valicepress.com`; the signed one-click unsubscribe built in Phase 3 is unchanged and still works.

---

## 8. SEO — PARTIAL

Four utility pages live and in the sitemap, each built from something only these books contain: the board-game origin myths, Hangul stroke-order provenance, Dudeney's own Haberdasher construction, and the nineteen mythology traditions. Each ends at a product and a free companion rather than at a newsletter form.

**Still zero indexed.** Home is *"Discovered — currently not indexed, never crawled"*; the Dudeney page and the new posts are *"URL is unknown to Google"*. The sitemap was submitted this morning and has not been re-fetched. This is the expected state for a site whose first sitemap is fifteen hours old, and it is also why no organic visitor can arrive this month.

---

## 9. Amazon Ads — BLOCKED, and now verified

Phase 3 asserted the API was unreachable. §12 asked for that to be established rather than repeated. `scripts/tmp/ads-probe.mjs`:

- **zero** environment variables matching AMAZON / LWA / ADS / ATTRIBUTION;
- `POST https://api.amazon.com/auth/o2/token` → **400**, wanting a client id and secret;
- `GET https://advertising-api.amazon.com/v2/profiles` → **401**, wanting a bearer token.

The network path exists. The credentials do not, and they can only be minted by the account owner completing an OAuth consent against a Login-with-Amazon security profile, on top of a separately approved Ads API application. Founder action **F5**, with the exact campaign to create.

**Attribution** is plumbed and honestly labelled: the storefront prefers a format's `amazonUrl` over the `/dp/<ASIN>` fallback, so a tag pasted into the catalogue takes effect on the next load with no code change. **No tag exists, so no attribution is claimed.**

---

## 10. What is measured, right now

| | |
|---|---|
| Orders / revenue / contribution | **0 / $0.00 / $0.00** |
| Paddle transactions, live account, all time | **0** |
| Entitlements · watermark jobs | 0 · 0 |
| Funnel events, all time | 4 `view_item` |
| Amazon: reviews · sales rank | **0 · none**, across 18 live editions |
| Google: indexed pages · impressions · clicks | **0 · 0 · 0** |
| Direct ebooks buyable | **6** (Dudeney is new) |
| Books published on the site | 9 |
| Print editions that link home | 5 of 18, up from 3 |

Agent probe rows were deleted after each verification. Four page views is the entire measured history of this storefront.

---

## 11. Deferred, with reasons

- **Companions for World Myths, Bestiarium, Mythologica, the Field Book.** Four content projects. The audit establishes which are worth building and in what order; building one properly is a phase's work, and the interior revision they feed is the actual bottleneck.
- **Rebuilding the four other books' interiors.** Each needs a page added, which changes the spine and forces a cover re-upload and a new proof — a physical object, and therefore Gate 8, and therefore not an agent's to close.
- **The Dudeney paperback upload.** Built and preflight-clean; needs a proof copy and the AI declaration settled first.
- **Email flows beyond welcome and order-ready.** Two subscribers, both test aliases. Writing a re-engagement sequence for an empty list is theatre.

---

## 12. The one thing recorded against the Founder's instruction

The AI disclosure. "Yapay zeka kullanılmadı" is preserved verbatim and is **right** for images (the cover is typographic geometry; the cost ledger records $0 of image generation) and for translation (there is none).

For text it conflicts with what this repository records: the apparatus — the 2,000-word introduction, seven part introductions, 110 hints, the editor's notes, the glossary, the chronology and the concordance, **28.1% of the words** — was drafted by the agent. Amazon's published rule, re-read on 2026-09-02, discloses "AI-generated" text, defined as text an AI tool created from your prompts, and does not require disclosure of "AI-assisted" text, defined as text you wrote with AI help for brainstorming, outlining, editing or grammar. On that definition the apparatus is AI-generated, and undisclosed AI-generated content can block a title or suspend an account.

`compliance.aiDisclosure.text` therefore records `generated`, with the Founder's wording preserved beside it and the conflict spelled out in `textConflict`. **This has no bearing on the direct sale**, which declares nothing to anyone; it must be settled before any Dudeney upload to KDP. Founder action **F1**.

---

## 13. What should happen next

1. **Re-upload the two World Games interiors.** They are built, preflight-clean, 160 pages, and they fix an unauthorised biography as well as adding the companion. It is the only completed work in this phase that is sitting still.
2. **Create the $5/day automatic campaign** on the World Games **paperback**. It is the only channel that can put a Valice book in front of a stranger this week, and the corrected economics say paperback, not hardcover.
3. **Wait on Google.** Nothing to do but check in 72 hours. If "Discovered — not indexed" has not become "Crawled", that is a real finding worth chasing.
4. **Then one companion**, for World Myths, and the interior revision that carries its URL.

Do not start a ninth book. Nothing in the catalogue has sold a copy or earned a review, and the audit just explained one large reason why.
