# KDP / Amazon Policy Research — Current, Sourced

> Every claim below is labeled FACT (sourced, checked 2026-08-29), INFERENCE, or RECOMMENDATION. Primary sources prioritized per instructions.

## 1. External links / website mentions inside a Kindle book — FACT

Source: KDP Hyperlink Guidelines (`kdp.amazon.com/en_US/help/topic/GQ6JQ7FM6C72HE4X`) and Content Guidelines (`kdp.amazon.com/en_US/help/topic/G200672390`), checked 2026-08-29.

- Links inside book content are allowed **only if they directly enhance the reader's experience** of that specific title, as judged by Amazon.
- Explicitly **prohibited**: links to other commercial ebook stores, links to web forms that request customer information (email, address, etc.), links to illegal/harmful/infringing content, malicious links (phishing/malware).
- An **"About the Author"** back-matter page linking to the author's own website is standard, accepted practice — it is a live hyperlink in the ebook, plain (non-clickable) text in a print edition.
- Amazon's own guidance and community discussion both stress the book itself must stand on its own merit — "excessive marketing" content whose primary purpose is driving traffic elsewhere risks rejection.

**RECOMMENDATION:** A back-matter mention of the Valice Press website — framed as reader value ("verify your Codex Enigmatica answer," "download bonus material," "see the full catalog") rather than as a bare marketing link — is squarely inside what KDP already accepts. This is exactly the pattern the codebase already implements for Codex Enigmatica.

## 2. A form collecting customer info, linked from inside a book — CAUTION, FACT

The Hyperlink Guidelines explicitly prohibit linking to **"web forms that request customer information (e.g., email address, physical address or similar)."**

**INFERENCE with a safe workaround:** A literal email-capture form linked directly from inside the book's own pages is the kind of thing this rule targets. The **codex-verify pattern already avoids this** — the linked page's stated purpose is answer verification (a reader-value utility), and email capture happens as an *optional secondary action* on that page (or on a followup page), not as the page's sole purpose or headline CTA. This is the safer structure and should be the template for any future back-matter URL: **utility first, opt-in email capture second, never the reverse.**

## 3. KDP Select / Kindle Unlimited exclusivity — FACT, do not conflate with plain KDP publication

Source: KDP Select terms (`kdp.amazon.com/en_US/select`), checked 2026-08-29.

- **Publishing a Kindle ebook via KDP** (the base program) carries **no exclusivity obligation** by itself.
- **Enrolling that ebook in KDP Select** is a *separate, opt-in* decision that grants Amazon **exclusive digital distribution rights** for the enrollment term: the ebook cannot be sold or given away in digital form anywhere else — not Apple Books, not Kobo, not Gumroad, **not your own website** — for as long as it's enrolled.
- Enrollment term is 90 days, auto-renewing unless the publisher opts out before renewal.
- Violation risk is account-level: Amazon actively checks, and a caught violation risks the whole KDP account and accrued royalties, not just that one title.
- **Print formats are explicitly exempt** from KDP Select's digital exclusivity — a paperback/hardcover can be sold anywhere (including your own site, subject to §5 below) even while the ebook edition of the same title is enrolled in Select.

**RECOMMENDATION:** Before selling any ebook directly from the Valice Press website, check that title's current KDP Select enrollment status in KDP Bookshelf. If enrolled, either (a) let enrollment lapse (stop auto-renew) before offering it directly, or (b) sell a **differentiated direct edition** — see `DIRECT_SALES_BUSINESS_MODEL.md` §10 — is not a safe workaround for the *same* ISBN/content; exclusivity attaches to the *work*, not the file, so a "different file, same book" edition sold elsewhere while Select is active is still a violation. The clean paths are: opt out of Select, or don't enroll new titles you intend to also sell directly.

## 4. Does Amazon give KDP publishers customer email addresses? — NOT DIRECTLY SOURCED; treat as NO

No official KDP page was found stating this explicitly either way in this research pass. This is consistent with Amazon's general posture across all its first-party and marketplace programs (Amazon retail sellers, Audible, Amazon Associates): **Amazon does not hand buyer PII to the seller/publisher.** Treat this as a **high-confidence inference**, not a hard-sourced fact, and design the whole email-list strategy assuming **zero KDP buyer data is available** — which is exactly what §6/§7 of the business plan below already does (reader must opt in voluntarily on the website).

## 5. Can Amazon fulfill an order that originated on the Valice Press website? — FACT: NO

- Amazon's KDP print-on-demand pipeline (paperback/hardcover) **only triggers on orders placed through Amazon's own marketplace** (amazon.com, and other Amazon storefronts where the title is distributed). There is no API or mechanism for a third-party website to submit an order that Amazon's KDP print system fulfills and ships on the publisher's behalf.
- The only KDP-adjacent path to "print without self-fulfillment" is: the publisher orders discounted **author copies** in bulk (up to 999 copies per order per KDP's author-copy terms) and self-fulfills website orders from that inventory — i.e., normal small-publisher warehousing/shipping, not Amazon fulfillment.
- Alternative: use a *separate* print-on-demand service with its own website/API integration (e.g., Lulu Direct, IngramSpark) for a print edition sold directly — this is a parallel print supply chain, not "the KDP paperback sold via the website."

**RECOMMENDATION:** For print, the only low-friction, zero-inventory option today is **"Buy on Amazon" links from book pages** (see `DIRECT_SALES_BUSINESS_MODEL.md` §9 for the full model comparison). Direct-website print sales require either self-fulfillment from bulk author copies or a second POD vendor relationship — both real operational commitments, not a code change.

## 6. Kindle Unlimited page-read (KENP) economics — FACT

Source: multiple 2026 tracking sites cross-referencing Amazon's published Global Fund; rate is not a single official number Amazon publishes as a constant, it floats monthly.

- The KENP per-normalized-page rate has run roughly **$0.0042–$0.0050** through 2026 (e.g., ~$0.0048 in April/May 2026), computed as that month's **Global Fund ÷ total KENP pages read platform-wide**.
- This rate and the entire KU program are **Amazon-internal mechanics of KDP Select enrollment** — they have no bearing on, and impose no constraint on, a wholly separate metered-reading product built on the Valice Press website, **provided** the titles offered there are not simultaneously locked into KDP Select's digital exclusivity (§3).

**INFERENCE/RECOMMENDATION:** "Can our site do what Amazon does with page reads" is really two unrelated questions collapsed into one: (a) is a Valice Press-native metered/subscription reading product technically and economically viable — a build/business decision, analyzed independently in `DIRECT_SALES_BUSINESS_MODEL.md` §11–12 — and (b) does Amazon's KU program constrain it — answered here: **no, as long as the relevant ebooks are not KDP-Select-enrolled.** See that report for whether it's actually worth building.

## 7. Sources
- KDP Hyperlink Guidelines — https://kdp.amazon.com/en_US/help/topic/GQ6JQ7FM6C72HE4X
- KDP Content Guidelines — https://kdp.amazon.com/en_US/help/topic/G200672390
- KDP Community Guidelines — https://kdp.amazon.com/en_US/help/topic/GPSDSZJL9RFMKK3W
- KDP Select — https://kdp.amazon.com/en_US/select
- KDP Terms and Conditions — https://kdp.amazon.com/terms-and-conditions
- KDP Author Copy / proof ordering — https://kdp.amazon.com/en_US/help/topic/GVEG4YA9G2T7N6DR
- 2026 KENP-rate tracking (secondary, cross-referenced across multiple independent trackers, not a single official Amazon page): authorsgame.com, kdptools.io, profitable.app
