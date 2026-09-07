# Implementation Completion Report

> Session of 2026-08-29. Branch `feat/production-readiness`, four commits from `5d4b13d` to `0119055`. 106 files changed, +5,653 / −1,084.
>
> Verdict: **TECHNICALLY COMPLETE / EXTERNALLY BLOCKED.** Everything implementable without an external account, credential or legal judgment is done, deployed and verified. Nine items remain, all requiring the founder.

---

## The finding that shaped the whole session

**No Valice Press book is published on Amazon.**

Fourteen project directories under `MY-DİGİTAL-BOOK/` were audited. Across all of them there is no ASIN, no live Amazon listing URL, no assigned ISBN, no KDP submission record, no Previewer run, no proof copy ordered. Every apparent hit for "ASIN" or "published" turned out to be planning text, a JSON status enum, or a false-positive substring in a Turkish word.

One partial exception, flagged rather than accepted: *Codex Mythologica*'s docs state its paperback is live, but the same project's post-publication checklist item "record the ASIN" was never completed, and no ASIN, URL or date exists anywhere. Treated as **UNVERIFIED**.

**This inverted a core assumption of the brief.** The task asked for print formats linked to Amazon with correct ASINs. There are none to link. Fabricating an ASIN would have produced a dead "Buy on Amazon" button on a live storefront — so instead the session built the structure those links need, loaded the real books behind it, and recorded per title what each is still waiting on.

A second, more useful inversion follows from it: **nothing is enrolled in KDP Select, because nothing is on KDP.** No digital-exclusivity clause applies to any of these titles. Direct ebook sale on this site is currently the *less* encumbered channel, not the fallback.

---

## What was fixed

### A live integrity problem

`/books/the-midnight-library`, `/books/atomic-habits` and `/books/dune` were returning **200** on the public production site — full Valice Press product pages, with covers, categories, prices and calls to action, for books the press has no right to sell. The catalog index didn't list them, so this was invisible from the front page; the detail route had its own independent demo fallback.

They now return 404. This was the single most urgent thing found.

### Branding

"Digital Bookstore" appeared in 65 places: the `SITE_NAME` constant, page titles, the OG image, JSON-LD Organization and WebSite nodes, transactional email, the Turkish KVKK legal text, and the watermark stamped into every purchased PDF. All now Valice Press. The live homepage serves **zero** occurrences of the old name.

### Fabricated inventory, in three forms

1. **`DEMO_BOOKS`** — eleven hard-coded bestsellers rendering as inventory whenever the database was empty.
2. **`DEMO_AUTHORS`** — Yuval Noah Harari, Jane Austen, Dan Brown, George Orwell and J.K. Rowling, each with an invented role, invented "signature works" and an **invented follower count**, presented on a publisher's author page. Real named people, fabricated social proof. This was the worst of the three.
3. **Popular searches** — five more bestsellers, each linking to a search that returned nothing.

All removed, along with the fields that existed only to hold the invention (`followerCount`, `works`, `role`, `featured`) and the genre facet that filtered on them. Nineteen placeholder cover images deleted.

Every surface now reads real rows, with honest empty states: a catalog with no books says the first editions are still at the press; recommendation shelves render nothing rather than an empty rail; unknown slugs 404.

### Production database

Two migrations applied, both purely additive:

- **0004 `commerce_events`** — had **never been applied to production**. Phase F's refund and chargeback audit trail was silently writing nowhere, because `recordCommerceEvent` is best-effort and no-ops when the table is missing. Revocation worked; the audit did not.
- **0005 `book_formats`** — new this session.

Production had 0 orders, 0 entitlements and 1 user, so no commercial data was at risk. Verified after: 15 tables.

---

## What was built

**A multi-format catalog model.** One book, many editions. Each format row carries its own price, page count, ISBN, availability and — the load-bearing field — a `fulfillment` channel: `direct` (Paddle → entitlement → watermarked download) or `amazon` (link out). That field, not the format name, decides what the UI offers. A paperback is an Amazon link because Amazon fulfils it, which is data, not a rule about paperbacks.

**An Editions table** on book pages that renders the correct call to action per format and states plainly that Amazon prints and ships the print editions. No button renders without a destination.

**`/ebooks`** as its own destination in the primary nav, not a filter on `/books`. Ebooks are the only thing this site can sell; everything else links to Amazon. Burying that as a facet would hide the one thing the storefront actually does.

**The real catalog**, as source-controlled data (`scripts/catalog/`) plus an idempotent loader: seven books with measured page counts, real subtitles, real BISAC codes and factual descriptions written from the books' actual contents. Six real covers extracted and converted; the Myth Hunter's full-wrap cover cropped to its front panel using the documented spine geometry.

**Welcome-email automation and a real consent record.** Every subscriber now stores `signup_purpose`, `consent_at` and `consent_text` — the sentence they actually agreed to, verbatim, because a stored code cannot answer the one question a consent record exists to answer. Written for every subscription, not only tagged ones.

**Safe operational scripts** that print their target database before acting and refuse to write to production without an explicit flag.

---

## What was deliberately NOT done, and why

| Not done | Reason |
|---|---|
| Any "Buy on Amazon" link | No ASIN exists for any title. A fabricated one is a dead link on a live store. |
| Publishing any of the seven books | Three are marked `directSaleEligible: false` for real reasons — an unresolved CC BY-NC content licence, a book whose subtitle promises "Ready to Play Tonight" with zero playtests behind it, and one that is 101 unverified drafts. Publishing is a commercial and legal act a script cannot weigh. |
| Writing any Paddle price | That value must come from a real Paddle price. Writing a plausible-looking fake is exactly how production acquired `pri_test_meditations_999` and a checkout that fails at the till. |
| Giving *Meditations* format rows | Keeps this a zero-visual-change deploy for the one published title. Add them when it has a real Paddle price. |
| Producing the ten public-domain editions | Section 34 asks for the editions to be *made*. That is a book-production project per title. What was delivered instead is the complete pre-production layer: rights cleared per edition, sources identified with verified Gutenberg/Archive identifiers, differentiation strategy per title, scoring and sequencing. |
| Marketplace, subscriptions, page-read billing, hard DRM | Out of scope per the brief and the locked ADRs. |

---

## Two policy findings that should change the public-domain plan

Both verified against Amazon's own documentation this session:

1. **KDP does not accept public-domain illustrations as differentiation.** It accepts an original translation, original annotations, or *"10 or more original illustrations"* — explicitly **not sourced from other public-domain material**. This kills the obvious "reprint the Rackham plates" strategy outright.
2. **Public-domain content is capped at the 35% royalty tier.** An introduction or notes is explicitly not enough to flip it; only substantial original content or an original translation does.

Together these mean the right selection criterion is **how much of the finished book is yours**, not how good the old book is. The plan is scored accordingly.

---

## Remaining blockers — all founder actions

| # | Item | Impact | Effort |
|---|---|---|---|
| **B0** | **Register `valicepress.com`** | ⚠️ **Most time-critical.** Codex Enigmatica's final answer is printed nowhere in the book; the reader is sent to `valicepress.com/codex-enigmatica/verify`, which currently does not resolve. If any copy is printed first, every copy ships with a dead address and the mechanic is unresolvable. Cannot be fixed after printing. | Minutes + registrar fee |
| **B2** | **Set `RESEND_AUDIENCE_ID`** | **Breaking newsletter signups right now.** Every signup on the live site returns 503. | ~10 minutes |
| B1 | Paddle production account, real prices, live webhook | No real sale is possible. Longest external lead time — merchant approval takes days. | Hours + days of waiting |
| B3 | Confirm Inngest production sync | **Fails silently.** Unsynced, a purchase leaves the buyer's entitlement `pending` forever with no error anywhere. | ~30 minutes |
| B6 | KDP AI-content declaration, per book | Blocks every KDP upload. A legal statement about your own process. | Per title |
| B7 | Korean Hangul CC BY-NC licence review | Blocks that title in **every** channel, not just KDP. | Legal review |
| — | Author bio | KDP already rejected one upload for a placeholder bio read as template text. `AUTHORS.bio` is deliberately null rather than invented. | Writing |
| — | Mobile + accessibility testing | Not tested this session. Inferred sound, not verified. | Testing |
| — | "Vâliçe Press" vs "Valice Press" | The books print one, the site now says the other. Nothing is printed yet, so both are still open — but pick one. | A decision |

---

## Final counts

| | |
|---|---|
| Books in catalog | 7 (+ *Meditations* = 8 rows) |
| Published | 1 (*Meditations*, pre-existing) |
| Draft | 7 |
| Format rows | 22 |
| **Formats with an ASIN** | **0** — correct; none exists |
| Direct-sale eligible | 3 of 7 |
| Buyable today | 0 (no production Paddle) |
| Public-domain titles researched | 12 assessed, 10 recommended, 0 produced |
| Real covers installed | 6 |
| Placeholder covers removed | 19 |
| Fake product pages killed | 3 verified 404 (were 200 in production) |

**Lint clean · TypeScript clean · 105/105 tests · build green · deployed and verified live.**
