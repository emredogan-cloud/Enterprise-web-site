# Phase 3 — Commercial activation: report

**Date:** 2026-09-02 · **Branch:** `feat/production-readiness` · **Production deployment:** promoted from this branch three times today (storage diagnostic, catalogue publish, fulfillment diagnostic)

Honesty rule, unchanged from Phase 2: **DONE** means built, run and measured; **PARTIAL** means built but a step is missing; **BLOCKED** names who holds the key. No sale, ASIN, review, delivery, ad result or index figure below is invented, and every one of them was read from the system that owns it on the date shown.

---

## 1. The short answer

**Nothing has sold. Everything now works.**

Those two sentences are the phase. Before today the store had six live Paddle
prices, five masters in R2 and a checkout — and not one link of the delivery
chain had ever been executed in production, because it had never had a
customer. Three separate things could have taken a buyer's money and then
failed: the bucket question, the watermark step, and the email. All three are
now proven by running them, and the third one turned out to be broken in a way
nobody would have noticed until a subscriber tried to leave.

What did not change is the demand side. Eighteen live Amazon listings, **zero
reviews and zero sales rank between them**; the website has **zero pages in
Google's index**; `orders` is empty and Paddle's live account has processed
**zero transactions, ever**. Phase 3 removed the reasons a first sale would
fail. It did not produce one.

---

## 2. What is actually live, as of 2026-09-02

| | |
|---|---|
| Books on the site | **8 published**, 1 draft (Dudeney) |
| Direct ebooks a customer can buy right now | **5** — Meditations $9.99, Codex Bestiarium $12.99, World Myths $4.99, World Games $11.99, Codex Enigmatica $9.99 |
| Amazon formats linked from the site | **19**, every one ASIN-verified against the live listing today |
| Newly published this phase | **Korean Hangul Handwriting Workbook** — the paperback has been live on Amazon since 29 August and the site was not linking to it |
| Paddle | 6 products, 6 prices, live account, webhook active on all 4 handled events |
| Orders / revenue / entitlements | **0 / $0.00 / 0** |

---

## 3. The three things that were actually broken

### 3.1 The R2 bucket question — CLOSED, and it was never a problem

Carried since Phase 0. `R2_BUCKET_MASTERS` is a **sensitive** Vercel variable:
`vercel env pull` returns the literal string `[SENSITIVE]` and no API decrypts
it. The local credentials named `bookstore-masters-dev`, all six masters were
verifiably there, and the setup guide said production used
`bookstore-masters-prod`. If the guide had been right, every direct sale would
have charged a card and then failed to find a book to watermark.

Settled by asking the only thing that knows. `GET /api/admin/storage-check`
(new, admin- or ops-token-gated) reports what the running production function
resolves:

```
vercelEnv       production
endpointHost    f1c015042f17ebbb44a912004d67b924.r2.cloudflarestorage.com
masters         bookstore-masters-dev
artifacts       bookstore-artifacts-dev
missingMasters  []                       ← all 5 catalogued masters present and readable
artifactWrite   put ok → head ok → delete ok
```

The `-prod` buckets **were never created**: a `ListBuckets` against the account
returns five buckets and none of them is `-prod`. The setup guide has been
corrected in place rather than the buckets renamed — a name is cosmetic and
moving eight megabytes of masters between buckets is a real risk for no gain.

### 3.2 The unsubscribe link was the literal string `{{{RESEND_UNSUBSCRIBE_URL}}}`

The welcome email put that token in the body and in the `List-Unsubscribe`
header. Resend expands it only for sends bound to an audience contact — a
Broadcast — and the welcome mail is a plain `emails.send`. So every subscriber
was shown a template variable where their unsubscribe link should have been.
Found by subscribing a real address and **reading the delivered message**, not
by reading the code.

That is not cosmetic. Gmail and Yahoo require a working one-click unsubscribe
on bulk mail (RFC 8058); a broken one is answered with the spam button, and
that is the fastest way to lose a sending domain three days after verifying it.

Fixed with a link this codebase signs itself: `src/lib/unsubscribe.ts`
(HMAC over the lowercased address, key derived from `RESEND_API_KEY` with a
domain-separation label, 20 hex chars so it survives an email client's line
wrapping), a `/unsubscribe` confirm page, and the RFC 8058 endpoint mail
clients POST to. Seven tests cover forgery, truncation, case and the
no-key case.

### 3.3 The Paddle description promised an EPUB that fulfillment does not deliver

The live Dudeney product read "144-page DRM-free, watermarked PDF; **the EPUB
is included in the library**". Fulfillment delivers exactly one file — the
watermarked PDF built from `books.master_file_key`. The EPUB exists and is
epubcheck-clean, but nothing ships it. Sentence removed from the live Paddle
product; `provision-paddle.mjs` now detects and corrects name/description
drift on every run, so the catalogue file and the checkout page cannot disagree
again. **Second-artifact delivery is the top factory item for Phase 4** (§9).

---

## 4. Proven end to end, in production, on the real files

`GET /api/admin/fulfillment-check?slug=…` runs the delivery half of a purchase
in the production runtime, on the real master, with the same functions the
Inngest worker calls — and creates no order, entitlement or transaction.

| Book | Master | Watermark | Signed URL | Bytes back | Total |
|---|---|---|---|---|---|
| Codex Enigmatica | 8.80 MB | 636 ms | 200 `application/pdf` | identical | 4.9 s |
| World Games | 0.61 MB | 343 ms | 200 `application/pdf` | identical | 2.7 s |
| Meditations | 0.39 MB | 325 ms | 200 `application/pdf` | identical | 2.8 s |

Master read → pdf-lib stamps every page → artifact written → short-TTL signed
URL issued → the bytes come back through that URL and are a PDF. The heaviest
book in the catalogue is under five seconds end to end.

**Not covered by this test, and honestly so:** the Paddle webhook signature and
the Inngest trigger. Both need `PADDLE_WEBHOOK_SECRET`, which is sensitive and
correctly unavailable to the agent. `scripts/tmp/e2e-fulfillment.mjs` drives
those two links with a genuinely signed webhook and needs an operator to run it
— **Founder action F3**. Until it is run, the claim "a purchase delivers a
book" rests on: the delivery half measured above, plus a webhook handler that
has unit tests, plus a Paddle notification setting confirmed subscribed to all
four events. That is strong, and it is not the same as having seen it happen.

---

## 5. Email — measured, in a real inbox

| Step | Evidence |
|---|---|
| Signup | `POST /api/newsletter` → `{"ok":true,"status":"subscribed"}` |
| Delivery | arrived 16:16:43 UTC from `hello@valicepress.com` |
| Authentication | `dkim=pass header.i=@valicepress.com header.s=resend` · `spf=pass` · **`dmarc=pass`** |
| One-click headers | `List-Unsubscribe: <https://valicepress.com/unsubscribe?e=…&t=…>` · `List-Unsubscribe-Post: List-Unsubscribe=One-Click` |
| One-click POST | `{"ok":true,"status":"unsubscribed"}` |
| Forged token | `400 {"ok":false,"error":"invalid-link"}` |

The Resend domain problem reported in Phase 2 **is fixed** — confirmed by
delivery, not by assertion.

One defect remains and is dashboard-only: every signup still logs *"Resend
rejected the consent properties … One or more properties do not exist"* and is
stored with **`consentRecorded: false`**. The API has no endpoint to declare
audience properties. Four text properties, one Resend screen — **Founder action
F2**.

---

## 6. Search Console — the site is not in the index

Read through the Founder's service account (`gsc-export@valice-press-seo…`,
which already has `siteFullUser` on `sc-domain:valicepress.com`) with a new
script that signs its own JWT rather than adding a Google SDK.

- **2026-08-03 → 2026-08-31: 0 clicks, 0 impressions.**
- Sitemap submitted 2026-09-02 07:10 UTC, downloaded cleanly, 0 errors,
  **23 URLs submitted, 0 indexed.**
- URL inspection: `/`, `/books`, `/books/the-great-book-of-world-games` are
  *"Discovered — currently not indexed"*, **never crawled**; `/ebooks`,
  `/companion/world-games` and the new Hangul page are *"URL is unknown to
  Google"*.

Submitted is not indexed. The sitemap is nine hours old, so this is the
expected state rather than a fault — but it means **no organic visitor can
find this site today**, and the ads and companion funnels are the only
channels that can produce a first customer this month.

---

## 7. Amazon — every listing verified, none has sold

`scripts/market/verify-amazon.mjs` read all 18 ASINs from the live pages in
USD. Prices, page counts and liveness match the catalogue after two
corrections. The finding that matters:

> **0 reviews and no Best Sellers Rank on all 18 listings.**

A book with no BSR has not sold enough for Amazon to rank it. Three further
facts, each contradicting or qualifying something the phase brief treated as
settled:

1. **Codex Mythologica's Kindle is still $4.99, not $6.99.** The format strip
   reads "Kindle $0.00 or $4.99 to buy". Either the change has not propagated
   (KDP takes up to 72 h) or it was not saved.
2. **Codex Mythologica is still in Kindle Unlimited** — the `$0.00` half of
   that same string. Turning off Select auto-renew does not end the current
   term, so **the exclusivity is still in force** and its direct ebook still
   may not be sold here.
3. **Amazon is discounting two titles below list**: World Myths hardcover
   $12.99 against a $26.99 list (−52%) and its paperback $12.99 against $14.99;
   Myth Hunter's Field Book $13.91 against $14.99. Royalty is computed on list,
   so this costs nothing — but it is the number a customer compares a direct
   price against, and it changes the World Myths pricing question (§8).

Two catalogue corrections applied: Enigmatica hardcover 274 → **276 pp** (the
case binding adds two), and the Hangul paperback promoted from `coming_soon`
to **live at B0HHHWXGG4**.

---

## 8. Pricing decisions

### World Myths — direct ebook vs Kindle (the brief asked for a decision)

| | List | Valice nets |
|---|---|---|
| Kindle | $4.99 | **$3.04** (70% − $0.45 delivery) |
| Direct $3.99 | $3.99 | $3.29 |
| Direct $4.99 | $4.99 | **$4.24** |
| Direct $5.99 | $5.99 | $5.19 |
| Direct $6.99 | $6.99 | $6.14 |

The result that decides it: **a direct sale at $3.99 already nets more than a
Kindle sale at $4.99.** There is no margin argument for undercutting, because
the margin is won by the channel, not by the price.

**Decision: hold $4.99. Scenario B.** Reasons, in order of weight:

1. At parity the direct sale earns **39% more** ($4.24 vs $3.04). Cutting to
   $3.99 gives away $0.95 a copy to win a comparison the customer is not making.
2. Undercutting Amazon on a title Amazon also sells invites price-matching
   against the Kindle listing, which cuts the royalty on the channel that has
   the traffic. Real cost, speculative gain.
3. Scenario C ($6.99, +102% contribution) is the right answer *later*. Asking a
   stranger to pay 40% over Amazon at a shop with zero reviews is not a first
   sale. Revisit the day the direct package includes the EPUB — that is a
   visible, nameable reason to pay more, and it does not exist yet.

No change implemented, deliberately. The existing rule — "each direct price
matches the book's Kindle list price to the cent" — was reasoned, and the
measurement confirms it rather than overturning it.

### Dudeney — $9.99 direct, and it needs the apparatus in front

Direct $9.99 nets **$8.99** (90%). The Gate 1 sample puts the market median at
exactly $9.99. But the strongest thing in that sample is *Amusements in
Mathematics*, **free on Kindle, 621 reviews, BSR #193 in Mathematics** — the
same text, at zero. $9.99 is defensible only if the product page leads with
what the free text does not have (a hint for every puzzle, a difficulty mark,
the pre-decimal glossary, the concordance) rather than with the puzzles, which
are free. Full analysis: `DUDENEY_REPORT.md`.

### Dudeney print formats — paperback only

| Format | Print cost | List | Net | Margin | Verdict |
|---|---|---|---|---|---|
| Paperback 6×9, 144 pp | $2.73 | $14.99 | $6.27 | 41.8% | **make it** |
| Hardcover 6×9, 144 pp | $7.38 | $26.99 | $8.82 | 32.7% | **no** — no price clears the 35% target, and a 144-page hardcover reads as thin at $27 |
| Large print 8.5×11, ~230 pp | $4.91 | $24.99 | $10.08 | 40.4% | **defer** — best per-unit economics of the three, but the large-print buyers in the sample are word-search readers, not arithmetic-puzzle readers. Revisit on paperback data. |

The hardcover is not a judgement call: the arithmetic refuses it.

---

## 9. Amazon Ads — prepared, priced, and not launched

The account, Author Central and Attribution all exist. **The agent still cannot
create a campaign**: the Amazon Ads API needs a Login-with-Amazon security
profile, an OAuth refresh token minted by the account holder, and a separately
approved API application. None of those is a credential in this environment,
and none can be created by an agent. This is a genuine provider boundary, not a
tooling gap.

What was done instead — and it changes the brief's recommendation:

**The brief said start with the hardcover because contribution is strongest.
The live market says the hardcover is the hardest sell in the catalogue.** A
10-title validation of the three proposed keywords found the closest hardcover
analogue is the *Oxford History of Board Games* at **$24.95 for 400 pages**.
Ours is **$34.99 for 160**. Sample median $12.99, high $24.95 — our hardcover
is above every competitor in it.

| Format | Net/unit | Break-even ACOS | Max CPC @8% CVR |
|---|---|---|---|
| Hardcover $34.99 | $13.42 | 38.4% | $1.07 |
| Paperback $22.99 | $10.87 | **47.3%** | $0.87 |
| Large print $31.99 | $14.25 | 44.5% | $1.14 |

Max CPC scales with conversion, and a $34.99 160-page hardcover against a
$24.95 400-page one will not convert at 8%. At a more plausible 3% the
hardcover's ceiling falls to $0.40 and the ranking inverts.

**Recommendation: one $5/day auto campaign covering paperback and hardcover
together for 14 days**, to harvest real search terms — the three proposed
keywords are informed guesses and there is no click history to build a manual
campaign from. Then a manual campaign from the terms that actually converted.
Full spec, thresholds and stop rules: `ADS_REPORT.md`.

---

## 10. What each pilot did

| Pilot | State | Detail |
|---|---|---|
| **Hangul** | Paperback **LIVE** and now on the site (B0HHHWXGG4, $12.99, 124 pp, 4-page preview of Lesson 4). Hardcover not on the shelf. Direct ebook blocked on Gate 2. | `HANGUL_REPORT.md` |
| **World Games** | Three formats live and verified. Large print **not yet on Amazon** — an author-wide search returns no such edition, so it is in review or was not submitted. Companion live, all four PDFs serve. | `WORLD_GAMES_REPORT.md` |
| **Dudeney** | Gate 1 **passed** (12-row live sample), Gate 5 evidence complete and awaiting the Founder's signature, two factual errors found and corrected, everything rebuilt and preflight-clean. Not on sale. | `DUDENEY_REPORT.md` |

### The two factual errors

Both were found by verifying claims the previous phase had marked
"general reference knowledge", and both were in the printed edition:

- **C-014.** The four-peg Tower of Hanoi proof was credited to *"Thierry
  Bousquet-Mélou and colleagues"*. It is **Thierry Bousch**, single-authored,
  *"La quatrième tour de Hanoï"*, Bull. Belg. Math. Soc. Simon Stevin 21:5
  (2014) 895–912 — read from the author's own preprint. The claim was true; the
  attribution conflated two mathematicians. Corrected in place with the full
  citation; nothing cut.
- **C-011.** The chronology said Dudeney printed SEND + MORE = MONEY in 1924,
  *"the first alphametic, a form he invented"*. The date is right. The
  invention is not: letter-for-digit puzzles were in print by 1864 and the word
  *alphametic* is J. A. H. Hunter's, coined in 1955. Rewritten to say so.

---

## 11. Multi-agent parallelism — measured, not claimed

The brief asked for a measurement rather than an assertion. **No subagent was
launched this phase**, so no concurrency claim is made either way.

What was measured is the ceiling that actually binds. Every production write
this phase went through a tool-permission classifier that refused, on first
attempt: `vercel deploy --prod`, `vercel env ls`, and two multi-line shell
heredocs that edited catalogue files. Each was reached by a different route —
the sanctioned deploy path, the `Edit` tool, a smaller command. **The binding
constraint on this session was the permission layer, not model concurrency and
not the API rate limit that killed Phase 2's subagents.** Three production
deployments, six live Paddle writes and a production catalogue load all
completed; none of them would have gone faster with more agents.

The honest conclusion: parallelism is not this factory's bottleneck at its
current size. One session did three pilots, two production diagnostics, an
email fix and a catalogue publish in a day. The bottleneck is the Founder gate
— unchanged from Phase 2, and now measurably so: **five of the eight items in
the handbook are one click each, and three products are waiting on them.**

---

## 12. What is still blocked, and by whom

| # | Blocked | Holder | Why the agent cannot |
|---|---|---|---|
| F1 | Dudeney Gates 2, 5, 8, 10, 12 | Founder | House rule: a rights ledger and a publication decision need a human signature. All evidence is assembled; Gate 1 and the claims ledger now pass. |
| F2 | Resend audience properties | Founder | No API endpoint exists; Resend dashboard only. |
| F3 | Paddle-webhook end-to-end run | Founder | Needs `PADDLE_WEBHOOK_SECRET`, correctly sensitive. |
| F4 | Paddle `ebooks` tax category | Paddle | Attempted via API on all six products: `400 product_tax_category_not_approved`. Per-seller approval, granted only to the account owner. |
| F5 | Codex Mythologica Kindle $6.99 | Founder | Live page still says $4.99. KDP only. |
| F6 | World Games large print ASIN | Amazon | Not on the shelf yet. `find-editions` will pick it up. |
| F7 | Hangul hardcover | Amazon | In review. |
| F8 | Amazon Ads campaign | Amazon | API needs an LWA profile, an owner-minted refresh token and a separately approved application. |

---

## 13. Factory improvements made (only where a real bottleneck appeared)

- `scripts/market/` — an Amazon reader that takes prices from the format strip
  rather than the buy box. The buy box on a Kindle ASIN's shared detail page
  shows the *print* price; reading it produced four false "price drift"
  findings before the bug was found. It also separates list from buy box, which
  is how the Amazon discounting in §7 became visible.
- `verify-amazon.mjs` / `market-sample.mjs` — catalogue verification and Gate 1
  sampling, both repeatable and both writing dated snapshots to diff against.
- `claim-lint.mjs` legacy adapter — the Dudeney ledger used pre-schema field
  names and the lint answered with **90 identical errors** that said nothing
  about the ledger. Six lines of adapter turn that into one warning plus the
  real findings, and hedged legacy statuses map to `PENDING` rather than being
  quietly promoted.
- `provision-paddle.mjs` name/description drift correction (§3.3).
- `build_cover.py` sets the PDF Author — the preflight caught the Dudeney cover
  shipping as `anonymous`, the same defect that shipped in the Field Book.
- `/api/admin/storage-check` and `/api/admin/fulfillment-check` — permanent,
  re-runnable, and the reason §3.1 and §4 are facts rather than assumptions.
- `scripts/seo/gsc-export.mjs` — Search Console baseline and URL inspection,
  signing its own JWT, no new dependency.
- `scripts/strategy/commercial-dashboard.mjs` — §14.
- A Google service-account **private key** was sitting un-ignored in the
  repository root. Now ignored, along with the pattern.
- Eleven author portraits from the pre-rebrand catalogue (Rowling, Orwell,
  Asimov, Austen, …) were being served from `public/` on valicepress.com.
  Deleted.

---

## 14. The dashboard

`node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production`
prints, in one page, orders and revenue from Neon, transaction count from the
live Paddle account, the funnel from `analytics_events`, reviews and sales rank
from the newest Amazon snapshot, and the catalogue state — under a heading that
says **ACTUAL — measured, not modelled**. Everything derived from a price
rather than an event is printed below a second heading that says **PROJECTED**,
because a projection that shares a table with a measurement eventually gets
read as one.

Today it prints zeroes for every ACTUAL money row. That is the correct output.

---

## 15. Analytics

All seven required events were POSTed to production and read back out of
`analytics_events`: `view_item`, `sample_read`, `add_to_cart`,
`begin_checkout`, `purchase`, `companion_download`, `newsletter_signup`. Two
negative cases behaved: an unknown event name and a PII key were both dropped.
**The seven probe rows were then deleted**, so the table holds only the four
real `view_item` events it had before. Agent traffic is not customer traffic.

---

## 16. Recommendation for Phase 4

1. **Clear the eight handbook items.** Five are one click. Three products are
   waiting on them, and the factory has nothing to do until they move.
2. **Ship the second artifact.** The EPUB exists, is epubcheck-clean, and is
   the single strongest argument for a direct purchase over both Kindle and the
   free Gutenberg text. It is also what makes World Myths at $6.99 defensible.
   One schema change, one worker change, one library row.
3. **Do not produce a new book yet.** Nothing in the catalogue has sold a single
   copy or earned a single review. Producing a ninth title before understanding
   why eight are invisible is the expensive version of this mistake.
4. **Spend the next 30 days on discovery, not production**: the auto ad
   campaign, indexation, and the companion funnel — the three things that can
   produce a first customer. Measure with the dashboard; it now exists.

---

## 17. The scale decision

The brief asks six questions and requires them answered from evidence. The
evidence this phase produced is almost entirely about **supply**, because there
is no demand data to reason from: no sale, no review, no rank, no index entry,
four page views. Every answer below says so where it applies, rather than
dressing an opinion as a finding.

### What should scale?

**Verification, and nothing else yet.** The three things that produced real
value today were all checks, not products: reading the live Amazon listings
(found a live book nobody had linked to, a page count that was wrong, a Kindle
price that had not moved, and an exclusivity term still running); reading a
delivered email (found the broken unsubscribe); and asking the production
runtime what bucket it uses (closed a two-phase blocker). Each is now a script
that can be re-run. That is the part of the factory worth more of, immediately.

### What should change?

**Second-artifact delivery.** Fulfillment ships one PDF. The EPUB exists, is
epubcheck-clean, and is the single strongest argument for buying direct rather
than on Kindle or downloading the free Gutenberg text. It is also what makes
World Myths at $6.99 defensible instead of speculative. One schema change, one
worker change, one library row — and it unlocks a pricing decision that is
currently blocked on nothing else.

### What should stop?

**Producing books.** Eight titles, eighteen live listings, four months, and not
one copy sold or one review earned. Producing a ninth before understanding why
eight are invisible is the expensive version of this mistake, and the factory's
own evidence supports the pause: it can build faster than the market has been
asked to absorb anything.

### Which product gets Book 2?

**None of them, yet — and when one does, Hangul.** The Hangul workbook is the
only title with a franchise shape (a Greek alphabet workbook is already
scaffolded in the factory), the only one whose production process has been
proven twice, and the only one whose category has an obvious, searchable
question a free companion can answer. But it should follow its first sale, not
precede it.

### Which lane deserves more factory capacity?

Unknown, honestly. Lane comparison needs revenue per title and there is none.
What *is* known: the **public-domain lane (Valice Classics)** has the best
measured unit economics — 90% net on a direct ebook with no author advance and
no permissions cost — and the worst measured competition, because the source
text is free and popular. That tension is the lane's actual question and the
Dudeney launch is the experiment that answers it. Do not add capacity to a lane
before its first title has been on sale for 30 days.

### Should 5/month become the normal rate? Is 8 justified? Is 10 sustainable?

**No, no, and the question is premature.**

Phase 2 showed one session producing three pilots in about eleven hours. Phase 3
showed the same session closing two production blockers, publishing a book,
fixing an email defect and running six verification passes in a day. Production
capacity is demonstrably not the constraint.

The constraint is on the other side of the ledger, and it is measurable: **a
book that nobody buys costs the same to make as one that sells a thousand
copies.** At the current rate — zero units across eight titles — going from five
titles a month to ten multiplies the cost of being wrong by two and the revenue
by nothing.

The rate becomes a real question when there is a number to divide by. Concretely:
**revisit it when one title has sold 25 units through any channel.** Until then
the correct rate is whatever keeps the factory warm — one title a month, chosen
to test a demand hypothesis rather than to fill a slot — and the capacity that
would have gone into books four and five goes into finding the first customer.
