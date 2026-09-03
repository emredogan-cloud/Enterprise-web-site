# Founder Actions — the canonical handbook

**Updated:** 2026-09-03, end of the Phase 5 bridge pass. This is the only list. Everything the agent could do with the repositories, the CLI, the Vercel / Paddle / R2 / Neon / Google APIs, the Amazon listings, the book build pipelines and the production runtime has been done and is **not** here — see `phase-5/PHASE_5_REPORT.md`.

Each item is here for one reason: an account the agent cannot enter, a signature only a person can give, a **physical object**, a credential that must never pass through an agent, or a provider that answers "no" to anyone but the account holder.

---

# ▸ THE TWENTY MINUTES THAT MATTER

**Eight finished interiors. Interior file only. Do not touch a single cover — the page count did not change on any of these, so every wrap already at KDP is still exactly right, and uploading one you did not need to puts a valid listing back into review for nothing.**

Each of the eight now ends on a page a reader cannot miss: a code covering a quarter of the page, the address printed under it in display type, and a named list of what is waiting there. Four of them previously hid that message in a paragraph, a caption, or a single line inside the imprint.

For each: **Bookshelf → the book → the format → *Edit print manuscript* → upload → previewer → check the page named below shows the code and the address → save.**

| | Book | Format | Upload this file | Check page |
|---|---|---|---|---|
| **A1** | The Great Book of World Games | paperback | `THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/PAPERBACK/GreatBookOfWorldGames_interior_paperback.pdf` | **160** |
| **A2** | The Great Book of World Games | hardcover | `…/08_OUTPUT/HARDCOVER/GreatBookOfWorldGames_interior_hardcover.pdf` | **160** |
| **A3** | The Great Book of World Myths | paperback | `THE-GREAT-BOOK-OF-WORLD-MYTHS/08_OUTPUT/paperback/interior.pdf` | **233** |
| **A4** | The Great Book of World Myths | hardcover | `…/08_OUTPUT/hardcover/interior.pdf` | **233** |
| **A5** | The Myth Hunter's Field Book | paperback | `THE-MYTH-HUNTERS-FIELD-BOOK/08_OUTPUT/PAPERBACK/interior.pdf` | **156** |
| **A6** | Codex Enigmatica | paperback | `CODEX-ENIGMATICA/08_OUTPUT/PAPERBACK/interior.pdf` | **274** |
| **A7** | Codex Enigmatica | hardcover | `CODEX-ENIGMATICA/08_OUTPUT/HARDCOVER/interior.pdf` | **276** |

All paths are under `MY-DİGİTAL-BOOK/`. (A8, the Dudeney paperback, is rebuilt too but has never been uploaded — it waits on F1 and F2 below.)

**A5 carries a second fix:** that file used to tell every library catalogue it was *untitled*, by *anonymous*. It now carries its real title and author.

**Check any of them:** `node scripts/factory/kdp-linkage-lint.mjs --slug <slug>` — all read COMPLETE locally, with the code found and measured on the page. Per-edition detail, hashes and steps: `docs/execution/phase-5/kdp-packages/<slug>/<format>/UPLOAD.md`.

### B1 · Hangul paperback — the one that also needs its cover
*≈ 10 minutes. Interior **and** cover.*

- **Interior:** `KOREAN-HANGUL-HANDWRITING-WORKBOOK/09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_126pp.pdf`
- **Cover:** `…/05_APLUS_COVER/exports/paperback_cover.pdf` — **rebuilt for 126 pages.** Do not reuse the old wrap.
- **Why the count moved:** the companion was a grey box at the foot of p. 122, the fourth thing on that page. It is now a dedicated p. 125. Nothing on the closing pages could be given up, so this is the one book in the catalogue where the page count had to move: **124 → 126**, spine 0.2792 → 0.2838 in.
- **Check:** page 125 shows the code and `valicepress.com/companion/hangul`; the spine text still sits inside its safe zone in the previewer. Ordering a proof is worth it here — the block changed thickness.
- *(The filename says 126pp because the file is 126 pages. It was renamed from `_124pp` when the count changed; a file whose name states a page count it no longer has is how the wrong interior gets uploaded.)*

---

## REQUIRED

### F1 · Dudeney: settle the KDP AI declaration before the paperback is uploaded *(unchanged)*
Your wording "Yapay zeka kullanılmadı" is preserved verbatim; the repository records the editorial apparatus (28.1 % of the words) as agent-drafted, which is "AI-generated" under Amazon's definition. Decide the KDP form wording. Nothing about the direct sale depends on it.

### F2 · Dudeney paperback: order a proof, then upload *(unchanged)*
`OUTPUT/interior-main.pdf` (**144 pp**, 6 × 9) + `OUTPUT/cover-paperback.pdf`, $14.99. No hardcover (the arithmetic refuses it). Depends on F1. The interior now ends on a proper companion page at p. 144 — its only previous mention was one line inside the imprint on p. 4.

### F3 · Run the webhook end-to-end test once *(unchanged)*
Needs `PADDLE_WEBHOOK_SECRET`, which is correctly out of the agent's reach:
```
npx vercel env pull scripts/tmp/.env.production --environment=production
node scripts/tmp/e2e-fulfillment.mjs scripts/tmp/.env.production https://valicepress.com the-puzzles-of-henry-dudeney <your-email>
node scripts/tmp/e2e-cleanup.mjs
```

### F4 · Paddle: request the `ebooks` tax category *(unchanged)*
A per-seller approval Paddle grants by ticket. When granted: `node scripts/catalog/paddle-tax-category.mjs --env scripts/tmp/.env.production --commit`.

### F5 · Amazon Ads: the first campaign — and now, the API onboarding
*Re-verified 2026-09-03: still zero AMAZON/LWA/ADS variables anywhere; the token endpoint answers 400 for want of a client id; the Ads API answers 401.*

**The campaign needs no API. Forty minutes of console work gets you the API as well, and it is worth having.**

**Do A1 first.** An ad sends a stranger to a listing; the page in the book is what turns that buyer into someone you can reach again. The upload is ten minutes and free. The ad is not.

**The campaign — the PAPERBACK:**
```
Sponsored Products · AUTOMATIC targeting
Product    World Games paperback  B0HG3KMK9L
Budget     $5.00 / day
Bid        $0.35 default
Duration   14 days; review on day 7 and day 14
Purpose    harvest real search terms. Not to be profitable.
Stop       ACOS above 43.8% · $20 on a target with no order · 20 clicks, 0 orders
```

**The API, if you want the agent reading your campaign data:** `docs/execution/phase-5/AMAZON_ACCESS_AND_API_SETUP_2026.md` — six steps across three consoles, written from Amazon's own pages read on 2026-09-03, with the exact fields, the irreversible decisions (the developer email address is permanent; one client ID per company), and the sign-out warning that invalidates the approval link if ignored. Amazon's review takes **up to one business day**. Afterwards: three values into Vercel, and the agent takes over reporting.

**Amazon Attribution — 5 minutes, high value.** KDP authors are eligible (confirmed on Amazon's own launch page, 30 Sep 2022, US included, free). Create one tag for the World Games paperback and paste the whole tracking URL into `scripts/catalog/valice-catalog.mjs → amazonUrl` for that format, keeping the ASIN. It takes effect at the next catalogue load with no code change. It is the only thing that can show you whether valicepress.com sends anyone to Amazon who then buys.

### F6 · Turn on the analytics exclusion in each browser you use — 1 minute, still not done
Sign in → `https://valicepress.com/account/settings` → **Analytics** → **Exclude my visits.** Repeat in every browser profile you check the site from, phone included.

This is the only exclusion Vercel supports — a `beforeSend` opt-out held in the browser. There is no IP setting to flip and the agent cannot press the button in your browser. **Thirteen first-party events are recorded and almost all of them are you**, which is why the number the reports watch is `begin_checkout` (0), not page views. It has a bonus: when the agent drives your Chrome, it inherits the same exclusion.

### F7 · Two watching briefs
- **World Games large print** — in KDP review since 2026-09-02. When it appears on the shelf, say "check". Its invented biography **is now fixed** and that fix is page-neutral. Its companion page is built but adds a leaf (232 → 233), and its cover cannot be rebuilt here — see B9 in `phase-5/KDP_UPDATE_PACKAGE.md`; the right move is one pipeline run at its first revision, and the agent will do it.
- **Hangul hardcover** — in review. When it is live: it needs **five minutes in KDP's Cover Calculator** at 126 pp / 8.25 × 11 / white. This project pins the hardcover wrap to a calculator value you supplied, and that value does not vary with page count, so nobody can derive the new one — the house standard forbids guessing it. Paste the three numbers into `project_config.json → formats.hardcover.kdp_calculator`, tell the agent, and the wrap rebuilds itself.

---

## OPTIONAL — improves the plan, blocks nothing

- **O1 · One review.** Nineteen live editions, zero reviews between them. Ads send traffic to a page with no social proof, which is the most expensive traffic there is.
- **O2 · World Games back cover** still carries the invented biography. The *interior* is fixed on all three editions; the cover is a separate rebuild.
- **O3 · Monthly KDP report export** → `data/kdp/YYYY-MM.csv`. Still the only way the agent can see Amazon units — **the Ads API does not change this.** It reports advertising, not sales; KDP's own reports have no public API.
- **O4 · Codex Bestiarium 120 → 112** on all four listings. **When you do it, three finished interiors and three rebuilt covers ride along** — the companion pages are built and verified and are waiting only for this trip. `phase-5/kdp-packages/codex-bestiarium/`.
- **O5 · Codex Mythologica, 3 November 2026.** Select ends; the ebook becomes sellable here; **three finished interiors and three rebuilt covers go up in the same pass.** One calendar entry, three jobs.
- **O6 · A photograph of you.** No real portrait has ever been supplied. Drop a real photo at `public/images/authors/emre-dogan.webp` (3:4, ≥ 900 px tall) and every author surface uses it. Without one the designed **ED** monogram stays, which is honest. **This is the one image on the site that must not be generated** — a synthetic portrait of a real person, presented as that person, is exactly what was removed in Phase 4.
- **O7 · Three images, if you want them.** `docs/execution/phase-5/VALICE_PRESS_REFERENCE_ASSET_PROMPTS.html` — open it in a browser, copy a prompt, generate, save under the exact filename, run `node scripts/assets/asset-manifest.mjs --write`. No code changes. One is recommended (the `/authors` hero), one is useful (a share card for the seven companion pages, which currently share as bare links), and five are optional and deliberately abstract.
- **O8 · Five playtests for World Games** *(unchanged)*.
- **O9 · Before You Cut: trademark clearance and testers** *(unchanged)*.
- **O10 · The Field Book hardcover** has never had an interior built. It is listed as coming soon. Either build it or take the listing down — a "coming soon" with no file behind it is a promise with no date.
- **O11 · DMARC `p=NONE` → `p=quarantine`** once a few weeks of clean sends accumulate.
- **O12 · Deploy branch.** Production is deployed from `feat/production-readiness` by CLI; Vercel's production branch is still `main`.

---

## Closed since the last handbook — do not ask again

**By the agent this pass:** the companion page rebuilt to a dedicated-page standard in **seventeen editions** (a QR at a quarter to a third of the usable page height, the address in display type beneath it, a true list of what is there); nine editions' spines recalculated and **six covers rebuilt** for their new page counts; the **invented author biography removed** from the World Games large print on a page re-set to 0.001 pt of the original; the Field Book's *untitled / anonymous* PDF metadata fixed; the catalogue's placeholder-cover loading state fixed; printed addresses made case-insensitive; the Amazon Ads and Attribution access path researched from Amazon's own documentation and written out; the fifteen reference images audited against production route by route; the analytics exclusion verified end to end with its one gap named; seventeen KDP upload packages generated with hashes and per-edition instructions; the linkage lint taught to **find and measure the code on the page** instead of trusting a caption; Gate 10 taught to fail a new edition whose bridge is a mention rather than a page.

**Superseded:** the old **U1 / U2 / U3** are now **A1–A5 and B1** — the files are different files (rebuilt today), so upload the ones named above, not the ones the previous handbook named.

**Never ask again:** Resend domain verification or audience properties · Google service account · Amazon Ads account creation · Author Central · Attribution registration · KDP Select cancellation · the Hangul paperback file replacement of 2026-09-02 · Dudeney Gates 2 / 5 / 8 / 12 · the Codex Mythologica Kindle price change.
