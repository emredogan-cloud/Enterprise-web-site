# Founder Actions — the canonical handbook

**Updated:** 2026-09-02 after Phase 0 + Phase 1. This is the only list of
Founder actions. Everything the agent could do with the repository, the CLI,
the Vercel/Paddle/Inngest APIs and the browser has been done and is *not*
here (see `phase-0/PHASE_0_REPORT.md` §E for what was fixed). Each item below
is here for one reason only: it needs an account the agent cannot enter, a
legal decision, a physical object, or a credential that must never pass
through an agent.

Format: exact action · why · where · exact value · current state · expected
result · dependency · how to verify.

---

## URGENT

### U1 · Resolve the Hangul dictionary sources, or withdraw the KDP submissions
- **Action:** decide one of: (a) replace sources S-0017/S-0018 (CC BY-SA) and S-0019 (CC BY-NC) by re-deriving the 97-word list from a cited public list and writing original glosses, then rebuild and re-upload; or (b) withdraw the paperback and hardcover from KDP review until (a) is done.
- **Why:** the paperback and hardcover are in KDP review with a non-commercial licence in the book. If review passes, the book goes on sale with the question open. This is a rights decision; an agent may not make it.
- **Where:** KDP Bookshelf → Korean Hangul Handwriting Workbook; project `MY-DİGİTAL-BOOK/KOREAN-HANGUL-HANDWRITING-WORKBOOK` (A7).
- **Current state:** rights ledger rows RL-0011 (YELLOW) and RL-0012 (RED); catalogue `websiteStatus: "draft"`, `directSale: false`.
- **Expected result:** either the rows are superseded by GREEN rows with evidence and the book proceeds as Book 01, or the submissions are withdrawn.
- **Verify:** `node scripts/factory/rights-lint.mjs` shows no RED row for the slug; KDP Bookshelf status.

### U2 · Correct the Codex Bestiarium listings: 120 → 112
- **Action:** edit the title/subtitle on all four live listings (Kindle B0HDLS4W8Q, paperback B0HDLQHQ7H, hardcover B0HDLLPG5M, large print B0HDLT1V3P) to “112 Legendary Creatures”.
- **Why:** the book contains 112 entries (build reports + PDF metadata; verified fact F-2026-0006). A count in a title that is not measured is the metadata failure the factory now lints for.
- **Where:** KDP Bookshelf → each edition → Edit details.
- **Current state:** all four say “120”.
- **Expected result:** listings say 112; catalogue subtitle already says 112.
- **Verify:** `curl -s https://www.amazon.com/dp/B0HDLQHQ7H | grep -o "1[12][02] Legendary"`.

### U3 · Confirm the Resend sending domain is "Verified" and the welcome email arrives from @valicepress.com
- **Action:** open Resend → Domains → valicepress.com; confirm every record shows Verified. Then check the inbox of emre30283@gmail.com for the welcome email sent on 2026-09-01 (“You're on the Valice Press list”) and confirm the From address is on valicepress.com, not onboarding@resend.dev.
- **Why:** DNS shows `send.valicepress.com` as a CNAME to `send.forge.rmta.net` with MX `feedback.forge.rmta.net` — not the `amazonses.com` records Resend's public docs list. Only the dashboard can say whether Resend itself issued those records. The API key is a sensitive Vercel variable the agent cannot read.
- **Current state:** DKIM present at `resend._domainkey`; DMARC present (`v=DMARC1; p=none; rua=mailto:emre30283@gmail.com`); newsletter signup returns `consentRecorded: true`; sender status unknown.
- **Expected result:** domain Verified; welcome mail from `…@valicepress.com`.
- **Verify:** the email headers show `From: … <hello@valicepress.com>` (or whatever EMAIL_FROM is) and DKIM=pass.

---

## REQUIRED BEFORE PHASE 2

### R1 · Approve the two price tests
- **Action:** (a) World Myths ebook $4.99 → $6.99: create a new Paddle price of $6.99 on product `pro_01m1btjd7575dkfsff00zfvfjc`, then tell the agent the new `pri_…` id (it will be written into `valice-catalog.mjs` and loaded); (b) Codex Mythologica Kindle $4.99 → $6.99 in KDP Bookshelf.
- **Why:** $4.99 nets $4.24 direct / $3.04 on Kindle — the worst price points in the catalogue; a 30-day test at $6.99 breaks even at 69 % of current volume (CATALOG_ECONOMICS_FINAL.md §4). Prices are commercial decisions; Paddle prices are not edited in place.
- **Where:** Paddle → Catalog → product → New price; KDP Bookshelf → Codex Mythologica (Kindle) → Pricing.
- **Current state:** both at $4.99 (Paddle `pri_01m1btjddes1p637hd78zsvczx` active at 499 USD, verified today).
- **Expected result:** two new prices live for 30 days; decision at the first quarterly review.
- **Verify:** `npm run validate:catalog` shows the Paddle price equal to the catalogue after the id is loaded.

### R2 · Switch off KDP Select auto-renew for Codex Mythologica (Kindle)
- **Action:** KDP Bookshelf → Codex Mythologica → KDP Select → uncheck automatic renewal.
- **Why:** Select is digital exclusivity; the ebook cannot be sold in the Valice store until the current 90-day term ends without renewal.
- **Current state:** enrolled, auto-renew on (verified 2026-08-31); catalogue `kdpSelect: true`, `directSale: false`.
- **Expected result:** enrolment ends at the term date; the agent then flips `directSale` and provisions a Paddle price.
- **Verify:** Bookshelf shows “Enrolment ends on …” with no renewal.

### R3 · Approve production of the three large-print editions and answer the AI-disclosure question for each
- **Action:** approve typesetting + upload of large-print editions for The Great Book of World Games ($31.03), Codex Enigmatica ($26.98) and The Myth Hunter's Field Book ($20.23); at upload, answer KDP's AI-content questions; order a proof copy for each.
- **Why:** highest-contribution print units available without new writing (World Games LP nets $12.86/unit). The AI declaration and the proof order are founder-only in KDP.
- **Where:** KDP → Create → Paperback (large print as its own title, house convention).
- **Current state:** interiors exist for the base editions (preflight passed for World Games; see Phase 0 report §I for the others); no LP interiors typeset yet.
- **Expected result:** three new ASINs; the agent records them in the catalogue only after fetching a 200.
- **Verify:** `npm run validate:catalog` lists the new formats with ASINs.

### R4 · Request the Paddle `ebooks` tax category
- **Action:** Paddle support ticket asking to enable the `ebooks` tax category on the account; once enabled, tell the agent (products will be re-categorised by script).
- **Why:** products are `standard`; ebooks are taxed at reduced VAT in many jurisdictions, so every sale currently over-collects.
- **Where:** Paddle dashboard → Help/Support.
- **Current state:** `tax_category` allowed values include `ebooks`; "selected tax category must be enabled on your Paddle account" (Paddle API docs, 2026-09-02).
- **Expected result:** category enabled.
- **Verify:** the agent runs `provision-paddle.mjs` with the new category without an error.

### R5 · Write the author biography
- **Action:** write 80–150 words of verifiable biography (no invented credentials) and send it to the agent, who writes it into `valice-catalog.mjs` (`AUTHORS.bio`), `project_config.json → founder.authorBio` of each project, and Author Central.
- **Why:** KDP rejected a placeholder bio as template text (World Myths, 2026-08-12); `metadata-lint` blocks Gate 9 while the bio is null; the author page and ProfilePage schema need it.
- **Current state:** null everywhere.
- **Verify:** `node scripts/factory/metadata-lint.mjs --project …` no longer reports `author-bio`.

### R6 · Decide "Vâliçe Press" vs "Valice Press"
- **Action:** one word: which spelling is the imprint. The books print “Vâliçe Press”; the site, domain and Paddle say “Valice Press”.
- **Why:** metadata consistency across KDP, Author Central, the site and future covers.
- **Current state:** split.
- **Verify:** the agent updates `project_config.json → founder.publisher` in every project and the catalogue.

### R7 · Google Cloud service account for the Search Console export (credential stays with you)
- **Action:** console.cloud.google.com → create project `valice-press` → APIs & Services → Library → enable “Google Search Console API” → IAM & Admin → Service Accounts → create `gsc-export` → Keys → Add key → JSON (downloads once) → in Vercel → Settings → Environment Variables add `GSC_SA_KEY` (Sensitive, Production) with the file's contents → in Search Console → Settings → Users and permissions → add the service account email with **Full** permission.
- **Why:** the Search Console property is verified and the sitemap submitted (done by the agent today), but the monthly export script needs a credential; a JSON key is a secret an agent must not download or paste.
- **Current state:** no Google Cloud project; property `sc-domain:valicepress.com` verified; sitemap submitted 2026-09-02 (Search Console showed “Couldn't fetch” immediately after submission — normal within the first day; re-check after 48 h).
- **Expected result:** `scripts/seo/gsc-export.mjs` (Phase 2) can pull Search Analytics rows.
- **Verify:** Search Console → Users shows the service account; Vercel shows `GSC_SA_KEY`.

### R8 · Amazon Ads account, Author Central claim, Amazon Attribution
- **Action:** advertising.amazon.com → sign in with the KDP account → create the ads account (US marketplace); Author Central → claim all six live books under one author name; Amazon Ads → Attribution → register.
- **Why:** Sponsored Brands needs 3+ claimed titles; Attribution is the only way to measure clicks from valicepress.com to Amazon; account creation is a human sign-up.
- **Current state:** no ads account; no Attribution.
- **Verify:** the agent can be given read access to campaign CSV exports.

---

## OPTIONAL (improves the plan, not blocking)

### O1 · Five playtests for The Great Book of World Games
- **Action:** play five games from the book's text alone with another person; note which rules needed a re-read. Send the notes to the agent for `01_SOURCE/playtests/`.
- **Why:** the subtitle promises “Ready to Play Tonight” and `01_SOURCE/playtests/` is empty.

### O2 · Before You Cut: trademark clearance and testers
- **Action:** decide whether to commission a professional trademark clearance for the name and to hire three home sewers (paid testers) for the differentiation test — or to park the series.
- **Why:** Book 12 in the roadmap; both preconditions are human/legal.

### O3 · Verify the live Myth Hunter's Field Book interior
- **Action:** open a printed copy (or the KDP Previewer) and confirm the plates are finished art.
- **Why:** the repository records “0/~150 visual assets produced”, yet the book is live; the agent cannot see the printed object.

### O4 · Monthly KDP Reports export
- **Action:** on the 5th of each month, KDP Reports → download the previous month's CSV (all marketplaces) into `data/kdp/YYYY-MM.csv` in the repository (folder created by the Phase 2 import script).
- **Why:** the only source of Amazon sales data; nothing has ever been exported.

---

## Done by the agent today (for the record — no action needed)

Apex domain made primary in Vercel and www → apex 308 (Paddle webhook now reaches the app); `*.vercel.app` production aliases redirect in code; Web Analytics enabled; `begin_checkout` fires; sitemap complete and deterministic; Inngest re-registered at the apex; Search Console property verified and sitemap submitted; Paddle prices and R2 masters verified against the catalogue; companion page committed; factory foundation installed (see `phase-1/PHASE_1_REPORT.md`).
