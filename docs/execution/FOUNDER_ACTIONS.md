# Founder Actions — the canonical handbook

**Updated:** 2026-09-04, after the Greek workbook was built and adversarially reviewed. (Previous revision: 2026-09-03, the Phase 5 bridge pass.) This is the only list. Everything the agent could do with the repositories, the CLI, the Vercel / Paddle / R2 / Neon / Google APIs, the Amazon listings, the book build pipelines and the production runtime has been done and is **not** here — see `phase-5/PHASE_5_REPORT.md`.

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

### F2 · Dudeney paperback: the whole upload — **new cover, new handbook**
*≈ 30 minutes, plus a proof if you want one. Depends on F1.*

Your artwork of 2026-09-03 is now the production cover. Everything is prepared and checked:

| | |
|---|---|
| Interior | `OUTPUT/interior-main.pdf` — 144 pp, 6 × 9, white, ends on the companion page at p. 144 |
| Cover | `OUTPUT/KDP/PAPERBACK/cover.pdf` — **12.5743 × 9.2500 in, spine 0.3243 in**, built from your art |
| Price | $14.99 (nets $6.27, 41.8 %) |
| Hardcover | none — the arithmetic refuses it, and no hardcover art was supplied |

**Open it and follow it: `OUTPUT/KDP/KDP_UPLOAD_GUIDE.html`.** Turkish, step by step, with checkboxes that remember where you stopped, every checksum, every field to paste, and a list of six files that must **not** be uploaded (including the two PNGs you sent — those are the source art, not a print file).

Three decisions inside it are yours alone:
- **the AI declaration** (F1 — this is the real blocker);
- **the ISBN** — take KDP's free one, or tell me first if you want to use your own, because the copyright page has to be re-set;
- **the back cover.** Its last line reads *"Emre Doğan is a puzzle designer and archivist; this is the second Valice Classic."* That is your own cover copy — it has been in the build script since 2026-09-02 — and it differs from the approved biography in `founder.authorBio`. It was left exactly as you supplied it. Read it in the previewer and decide; nothing needs doing if you are happy with it.

**A proof is recommended, not required.** This is the first print of this artwork and it places at 113.8 PPI — above the 83–116 PPI this press has already accepted and written down for Hangul, Bestiarium and Mythologica, but worth seeing on paper once.

**One thing to notice:** the printed front is **cream**; the ebook and storefront front is **dark green**. Both are your files. A buyer sees green online and receives cream. If that is deliberate, nothing to do; if not, say so and it is one rebuild.

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

### F8 · The Greek Alphabet Handwriting Workbook — it exists now, and it needs one deploy and one upload
*≈ 30 minutes for the upload, plus a proof. The deploy is one command.*

**The book is built.** 100 pages, 32 lessons, all 24 letters in both cases plus five variant forms and every accent in both systems — 53 stroke diagrams, each labelled with where its order came from. Interior and cover both pass KDP preflight; the EPUB passes epubcheck at 0/0/0; the QR on page 99 decodes to the right address under an independent decoder at four resolutions and after a JPEG round trip. Full report: `phase-5/GREEK_WORKBOOK_PRODUCTION.md`. Upload handbook, in Turkish, with every checksum read off the files: `GREEK-ALPHABET-HANDWRITING-WORKBOOK/OUTPUT/KDP/KDP_UPLOAD_GUIDE.html`.

An independent agent was then told to prove it was not ready, and did: **7 blockers and 14 major defects**, including four stroke orders that contradicted the source they claimed to be transcribed from. All are fixed and the report names each one. That is why this item reads differently from the last handbook.

| | | Blocks |
|---|---|---|
| **G1** | **Deploy this branch.** `valicepress.com/companion/greek` returns **404** today. That address is printed on the copyright page, on page 6, in 24-point type on page 99, inside the QR code, and on the back cover — and a printed address cannot be edited. **Nothing may go to KDP before the page is live.** Everything behind it is committed: the page, the four sheets, the catalogue row. | the whole book |
| **G2** | **Upload the paperback.** KDP → Create → Paperback. 8.5 × 11, **white** paper, black ink, **No Bleed**, matte. Interior and cover both from `OUTPUT/KDP/PAPERBACK/`. Do **not** use Cover Creator — the wrap is computed for 100 pages. Order a proof: nobody has ever held this interior. | the listing |
| **G3** | **The AI declaration.** Every word of this book was drafted by a model, so the truthful KDP answers are text **generated**, images **none** (no image model was used — the 53 diagrams are vector output from coordinates and the letterforms are DejaVu Sans), translation **none**. The reasoning is written out in `project_config.json → compliance.aiDisclosure`. Only you can enter it. | Gate 10, any upload |
| **G4** | **Sign the rights.** Nine ledger rows, RL-0044 … RL-0052, all analysed, all YELLOW because a row goes GREEN when you sign it. The 48 source diagrams are now retained in `RESEARCH/foundalis-diagrams/`, so the position is checkable rather than asserted. | Gate 2 |
| **G5** | **A live Paddle key**, once, for the $6.99 direct edition (PDF + EPUB, both already in R2 and read back). The key in this environment is a sandbox key that returns 403 on every endpoint — verified, not assumed. One command: `node scripts/catalog/provision-paddle.mjs --env <live> --commit --i-know-this-is-live`. | the ebook |
| **G6** | *Optional, 10 minutes.* A Greek speaker on the 33 word glosses and 12 name glosses — the single `PENDING` row in `CLAIMS.jsonl`. I am confident in every one, and "confident" is not verification in a book whose whole argument is that the difference matters. | Gate 5 |

**ISBN:** none assigned; the copyright page prints `PENDING — KDP-PROVIDED ISBN`. Choose KDP's free ISBN and the file is already right; use your own and give me the number, and I will re-cut it.

**Not produced, with reasons on record:** no hardcover (21 % net at 100 pages, under the 35 % floor — K8), no large print (the book is already 8.5 × 11 — K4), no Kindle edition (K5/K9).

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
- **O6b · Dudeney's two front covers.** The paperback prints a cream front; the ebook and storefront show a dark green one. Both are yours; flagged in case only one was intended.
- **O6 · A photograph of you.** No real portrait has ever been supplied. Drop a real photo at `public/images/authors/emre-dogan.webp` (3:4, ≥ 900 px tall) and every author surface uses it. Without one the designed **ED** monogram stays, which is honest. **This is the one image on the site that must not be generated** — a synthetic portrait of a real person, presented as that person, is exactly what was removed in Phase 4.
- **O7 · Three images, if you want them.** `docs/execution/phase-5/VALICE_PRESS_REFERENCE_ASSET_PROMPTS.html` — open it in a browser, copy a prompt, generate, save under the exact filename, run `node scripts/assets/asset-manifest.mjs --write`. No code changes. One is recommended (the `/authors` hero), one is useful (a share card for the seven companion pages, which currently share as bare links), and five are optional and deliberately abstract.
- **O8 · Five playtests for World Games** *(unchanged)*.
- **O9 · Before You Cut: trademark clearance and testers** *(unchanged)*.
- **O10 · The Field Book hardcover** has never had an interior built. It is listed as coming soon. Either build it or take the listing down — a "coming soon" with no file behind it is a promise with no date.
- **O11 · DMARC `p=NONE` → `p=quarantine`** once a few weeks of clean sends accumulate.
- **O12 · Deploy branch.** Production is deployed from `feat/production-readiness` by CLI; Vercel's production branch is still `main`.

---

## Closed since the last handbook — do not ask again

**By the agent on 2026-09-04 (Greek workbook):** the book written, typeset, illustrated and built from an empty scaffold — 100 pages, 32 lessons, 53 sourced stroke diagrams, an epubcheck-clean reference EPUB, a cover whose barcode zone is now measured rather than asserted, four companion sheets, a catalogue row, a preview, a KDP package and a Turkish upload handbook; then an independent adversarial review that found 7 blockers and 14 major defects, every one of them fixed — including four stroke orders that contradicted the source they claimed to transcribe, an annotation layer that was cutting holes in the letterforms it annotated, a barcode zone 18.7 % covered in ink, an EPUB with no cover image, and a back-cover claim about other publishers' books that no survey supported. Two defects outside this book were found on the way and fixed: `build-previews.mjs` had silently deleted the live Hangul book's storefront preview, and four upload packages told you *"do not touch the cover"* for editions that have no cover at KDP at all.

**By the agent on 2026-09-04 (Dudeney):** the Dudeney covers replaced with your artwork, placed into real KDP geometry (three regions, nothing stretched, spine set in type, frame moved back inside the trim after the first build put it 0.110 in outside); the old typographic covers and the raw PNGs archived out of the production path; the storefront cover regenerated; a Dudeney KDP handbook written on the Enigmatica pattern; the Greek workbook's true state established and its specification and outline written.

**By the agent on 2026-09-03:** the companion page rebuilt to a dedicated-page standard in **seventeen editions** (a QR at a quarter to a third of the usable page height, the address in display type beneath it, a true list of what is there); nine editions' spines recalculated and **six covers rebuilt** for their new page counts; the **invented author biography removed** from the World Games large print on a page re-set to 0.001 pt of the original; the Field Book's *untitled / anonymous* PDF metadata fixed; the catalogue's placeholder-cover loading state fixed; printed addresses made case-insensitive; the Amazon Ads and Attribution access path researched from Amazon's own documentation and written out; the fifteen reference images audited against production route by route; the analytics exclusion verified end to end with its one gap named; seventeen KDP upload packages generated with hashes and per-edition instructions; the linkage lint taught to **find and measure the code on the page** instead of trusting a caption; Gate 10 taught to fail a new edition whose bridge is a mention rather than a page.

**Superseded:** the old **U1 / U2 / U3** are now **A1–A5 and B1** — the files are different files (rebuilt today), so upload the ones named above, not the ones the previous handbook named.

**Never ask again:** Resend domain verification or audience properties · Google service account · Amazon Ads account creation · Author Central · Attribution registration · KDP Select cancellation · the Hangul paperback file replacement of 2026-09-02 · Dudeney Gates 2 / 5 / 8 / 12 · the Codex Mythologica Kindle price change.
