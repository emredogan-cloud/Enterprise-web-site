# Phase 5 — the bridge a reader actually sees: report

**Date:** 2026-09-03 (second pass) · **Branch:** `feat/production-readiness` · **Entered from:** `phase-4/PHASE_4_FINALIZATION_REPORT.md` §10.

Statuses are strict. **VERIFIED** = measured on the system that owns the fact, in this session. **DOCUMENTED** = stated by the provider in a page read today, URL cited. **OBSERVED** = seen, not measured. **BLOCKED** = named blocker, named owner. **HELD** = finished, deliberately not shipped yet, reason and date given. **UNVERIFIED** = could not be established from here and is not claimed.

**Nothing has sold. No ad has run. Nothing is indexed. No companion has been visited.** Every zero in this phase is still zero, and that sentence is first so nothing below can be read as if it were not.

---

## 1. What this pass was for

Phase 4 could say "every printed book carries the URL" and be telling the truth. Opening the books settled what that was worth:

| Book | What "carries the URL" meant | |
|---|---|---|
| World Games p. 160 | a text block at the top of an otherwise empty page. **No code at all.** | two-thirds of the leaf blank |
| World Myths p. 233 | a one-inch code low-left under a map caption, with 8-pt text beside it | half the page empty |
| Hangul p. 122 | a grey box — the fourth thing on a page of grey boxes | no code |
| Dudeney p. 4 | **one line inside the imprint**, between the ISBN and the typeface note | no code |

Four editions that passed the audit and that no reader holding the book would ever have noticed. Amazon does not give us the buyer's address and never will; the printed page is the entire bridge. If the reader does not see it, it does not exist.

So the house standard changed, and seventeen editions were rebuilt to it.

---

## 2. THE BRIDGE — done

### The standard

A **dedicated page**. Not a paragraph, not a footer, not a box. A QR occupying a quarter to a third of the usable page height, in clear space, drawn as vector; the address printed directly beneath it in display type large enough to copy by hand; a specific, true list of what is waiting; the line *"nothing to sign up for, no email asked"*, because it is true and because it is the reason anyone bothers. Set in the book's own faces, at its own margins, with its own folio and its own spelling of the imprint — it should read as the last page of the book, not as an advert bound into it.

### The result, VERIFIED

| | Before | After |
|---|---|---|
| Editions whose address is on a dedicated page | **0** | **17** |
| Editions carrying a QR at all | 2 | **17** |
| Smallest code in the catalogue | ~1.0 in, in a corner | **2.06 in**, centred |
| `kdp-linkage-lint` NEEDS_REVISION | 2 | **0** |
| `kdp-linkage-lint` COMPLETE | 8 | **15** (+2 in review, +1 never built) |

Eighteen print editions audited by reading their built PDFs. Seventeen rebuilt. **Zero defects remain** except two editions sitting in KDP review and one hardcover that has never been built.

### Page counts moved where the book was better for it, and not otherwise

The rule this pass worked to: *optimise for the best book, then recalculate the production package.* Not *avoid work by keeping the page count.*

- **Eight editions** replaced a blank page or a weak note → **page count unchanged, covers at KDP still exactly valid.** Upload the interior alone; touching the cover would put a valid listing back into review for nothing.
- **Nine editions** added a leaf → spine recomputed against KDP's published per-page thickness, and **six covers rebuilt** (Hangul paperback; Bestiarium ×3; Mythologica ×3 — both paper stocks each).
- **Two wraps could not be built here**, and the packages say so plainly rather than implying a file exists. §6.

Full table, with spines to four decimal places and the upload order: `KDP_UPDATE_PACKAGE.md`. Per-edition files: `kdp-packages/<slug>/<format>/`.

### Two defects closed that had nothing to do with QR codes

**The invented author biography is gone.** *"Emre is a puzzle designer, mythologist, and game archivist dedicated to preserving ancient cultures, codes, and stories for the next generation"* — a claim about a real person that the person did not make — has been printed on the World Games large print's copyright page and open in the matrix since 2026-09-02. It is now the Founder's own approved text, on a page re-set to land **within 0.001 pt** of the original line geometry, at an unchanged page count. `reprint-page.mjs --check` asserts it stays gone.

**The Myth Hunter's Field Book no longer ships as *untitled / anonymous*.** Its PDF metadata — what a library catalogue reads — is now its real title and author.

### What the tooling refuses to do

- **print a glyph a font does not have.** Every string is checked against the font's cmap before anything is drawn. It caught two real cases this pass: IBM Plex Sans KR has no *â* or *ç* for "Vâliçe Press", and Noto Sans has no Hangul for 원고지. This is the 2026-09-03 NotoSans-Bold incident, made impossible rather than remembered.
- **ship a page with a non-embedded font.** `pdffonts` on the finished page caught ReportLab quietly writing a Helvetica reference into every content stream via its initial-font preamble. KDP would have flagged it at upload.
- **claim a code is right because one was drawn.** The finished page is rasterised at 300 dpi and read back **module by module** against the code the URL produces. One flipped module fails the build.
- **shrink the code below the house floor,** or overflow the page. The layout is solved for the real trim and raises rather than printing something cramped.
- **overwrite an interior without keeping the previous build** beside it as `*.pre-companion.pdf`.

### One thing a printed address needed that no PDF could fix

Two of these books are set in Cinzel, whose lowercase glyphs are small caps. A reader copying what they see types `VALICEPRESS.COM/COMPANION/CODEX-BESTIARIUM` — and Next.js paths are case-sensitive, so that was a 404. Printed addresses in the wrong case now 308 to their canonical form (`src/lib/printed-address.ts`, five tests). Narrow by design: only paths that are actually printed in books, so a real broken link elsewhere still fails loudly.

---

## 3. AMAZON — mapped, still BLOCKED at the same place

Re-probed today, VERIFIED: **no Amazon credential of any kind in this environment** — zero matching variables in the repository or Vercel production, LWA token endpoint **400**, Ads API **401**. Identical to Phase 3 and Phase 4.

What is new is that the boundary is now written out rather than only re-confirmed. `AMAZON_ACCESS_AND_API_SETUP_2026.md`, from Amazon's own pages read in a browser today: the six Founder steps across three consoles, the one approval Amazon controls (**up to 1 business day**, DOCUMENTED), the exact environment-variable names, the 400/401/403 troubleshooting table, and the split between what only a person can do and what the agent takes over the moment a refresh token exists.

Three findings worth the read:

1. **Refresh tokens issued on or after 30 July 2026 expire 365 days from consent.** [DOCUMENTED] A token minted today dies in September 2027, silently. It goes in the calendar the day it is created.
2. **The first campaign does not need the API.** It is created by hand in the ad console. The API buys automated reporting, programmatic bids and Attribution tags — worth having, not blocking. So F5 is not waiting on an approval; it is waiting on someone opening a browser.
3. **Amazon Attribution is available to KDP authors** — Amazon's own launch announcement, 30 September 2022, US among the markets, free, with pages read and royalty in its reporting. [DOCUMENTED] It is the only mechanism that can close the loop **site → Amazon → sale**, which is exactly the leg this phase cannot see. Five minutes creates one tag.

A widely repeated third-party claim of a **10 % bonus** on Attribution-driven KDP sales appears on neither Amazon page read today. **Not claimed; nothing is planned around it.**

---

## 4. THE STOREFRONT — one real defect found and fixed

The Founder supplied fifteen reference images and seven screenshots of the live site. Both sets were opened rather than assumed, and they resolved in opposite directions.

**The references are an AI mockup of a fictional shop called "Digital Bookstore".** They carry other publishers' covers (Dune, Atomic Habits, The Midnight Library…), synthetic portraits of real living authors with follower counts, 4.8 ★ ratings on books with no reviews, and 50K+/10K+/2M+/120+ counters — the same fabricated strip Phase 4 removed. They are a **layout** reference and are used as one. Route-by-route comparison, with every "deliberately different" row reasoned: `REFERENCE_ASSET_MAP.md`.

**Of the two "the site looks broken" screenshots, one was real and one was stale.**

- **Real, reproducible, now fixed:** `/books` painted the per-book gradient stand-in beneath every card and laid the real cover on top as a lazy-loaded image. Until the image arrived — the length of a slow connection — a visitor saw a grid of saturated coloured rectangles. Phase 4 removed the placeholder as the *final* state and left it as the *first* one. Now: a book with real art gets a neutral dark ground (an empty frame says *loading*; a coloured panel says *this is the cover*, and that is a lie), and the first row loads eagerly. The gradient and the typographic stand-in remain exactly as designed for a book that genuinely has no art.
- **Stale:** the `/authors` screenshot showing **10K+ AUTHORS · 50K+ BOOKS · 2M+ READERS** and "Apply Now" is of a cached page from before this morning's deployment. Production carries none of it — checked in a browser and in the served HTML. Phase 4's claim holds.

**Assets:** every storefront slot resolves — 9 of 9 covers, 7 of 7 article images, 2 of 3 author portraits (the third must be a real photograph, handbook **O6**), 34 preview pages. **Nothing 404s.** Three genuinely missing assets, with model-agnostic prompts, exact filenames and negative constraints: `VALICE_PRESS_REFERENCE_ASSET_PROMPTS.html`. **None was generated — no `OPENAI_API_KEY` in this environment, $0.00 spent, as in Phase 4.**

**One thing the reference is right about and we are not:** density. The live homepage puts a quarter-screen of empty ground between sections and runs about a third longer than it needs to. Spacing, not assets; not fixed this pass, and recorded so it is not lost.

---

## 5. ANALYTICS — verified, with one gap named

The mechanism is the one Vercel documents and no other: `beforeSend` returning `null` on `<Analytics>` and `<SpeedInsights>`, keyed on the `va-disable` localStorage key Vercel's own opt-out example reads plus a first-party `vp_internal` cookie; and a server-side drop in `POST /api/events` for that cookie or an `x-valice-internal` header. Verified in the source today (`src/lib/internal-traffic.ts`, `analytics-gate.tsx`, `api/events/route.ts`). No invented IP block: **Vercel offers no IP or account exclusion**, and none is implied anywhere.

| Traffic | Excluded? | How |
|---|---|---|
| Agent `fetch` probes (validator, linkage lint, dashboards) | **yes** | every probe sends `x-valice-internal: 1` |
| Founder's browsers | **once F6 is pressed** | `/account/settings` → Analytics → *Exclude my visits*, per browser profile, one year |
| **A browser the agent drives** | **only if F6 was pressed in that browser** | it is an ordinary browser session; it carries no header |
| Purchase telemetry | never touched | a real order is recorded whoever places it |

That third row is a real gap and it is stated rather than glossed. It has a convenient property: Claude-in-Chrome drives **the Founder's own Chrome**, so pressing F6 once in that browser covers the agent's browser-driven visits too. Until then, agent page views land in Vercel Analytics as ordinary ones. This session opened `/`, `/books` and `/authors` on production; those page views are internal traffic and are not customers.

**Measured:** 13 first-party events, all time — 8 `view_item`, 3 `search`, 2 `sample_read`. `begin_checkout` **0**. `purchase` **0**. `companion_download` **0**. Phase 4 recorded 7 and called them probably internal; the six since should be read the same way until F6 is on.

---

## 6. WHAT IS BLOCKED, AND ON WHOM

| # | Blocked | On whom | Why |
|---|---|---|---|
| A1–A8 | eight finished interiors, no cover work | Founder, ~20 min | uploads |
| B1 | Hangul paperback + rebuilt cover | Founder, ~10 min | upload |
| B2 | Hangul hardcover cover | Founder, 5 min | this project pins the hardcover wrap to a **KDP Cover Calculator** value that is page-count independent, so rebuilding at 126 pp reproduces the 124-pp wrap. The house standard forbids deriving a hardcover wrap. Only the account holder can run the calculator. Edition is in review anyway |
| B9 | World Games large print cover | pipeline run | the block moved 232 → 233, but `covers.py` reads `06_REPORTS/interior-largeprint.json`, which has said **234 pages since before this phase while the built block was 232**. A pre-existing divergence; only re-running `interior.py` regenerates that report and its page map. Edition is in review |
| B3–B8 | six finished files | calendar | **HELD, not unfinished** — Bestiarium rides with the O4 listing correction; Mythologica with the 2026-11-03 Select lapse. One review cycle each instead of two, on books with zero sales |
| F5 | the first ad campaign | Founder | no credential exists; re-verified today |
| — | Field Book hardcover | book production | no interior has ever been built |

---

## 7. TESTS AND VERIFICATION, run today

`npm run lint` clean · `npx tsc --noEmit` clean · `npm test` **319 passed** across 21 files (+93 companion-page tests, +5 printed-address tests) · `npm run build` clean · `validate-catalog` against production **28 pass · 0 warn · 0 error · 2 skipped** · `kdp-linkage-lint --check-urls` — every printed address answers 200 · `reprint-page.mjs --check` pass · seventeen packages regenerate byte-identical.

The companion-page suite skips loudly rather than passing when the book repositories are not mounted: an absent book is a different fact from a defective one, and a green run over an empty directory would be the most expensive lie available here.

---

## 8. THE SIX FIRSTS

| First | State | What it is waiting on |
|---|---|---|
| First direct sale | **none** | traffic. Nothing arrives |
| First Amazon sale | **none** — no BSR on 19 listings | F5, after A1 |
| First review | **none** | a sale |
| First companion visitor | **none** | A1–A5, B1. **No interior carrying a code has reached a reader yet** |
| First real email subscriber | **none** | a companion visitor |
| First repeat customer | **none** | a first customer |

Every zero above measures the upload queue and the ad console, not the reader. That distinction is the whole of this phase's position.

---

## 9. WHAT THE AGENT WILL DO NEXT

1. **2026-09-06 and 2026-09-10:** re-read Search Console. If the Dudeney pages still read *Discovered — currently not indexed* on 09-10, that is a finding and gets diagnosed, not waited out.
2. **When A1–A5 ship:** confirm the KDP previewer state per edition, mark them uploaded in the matrix, and start the companion observation window.
3. **When F5 ships:** take the Ads console export, compute ACOS against the stop rules, write `ADS_RESULTS.md` from measurements.
4. **When a credential exists:** the reading half of the Ads API — profiles, campaigns, reports, Attribution — is written the same day. Spending stays manual until there is a number to optimise against.
5. **Only if a pilot reads SCALE at 30 days:** propose the second book in that series. **Not before.** The factory amplifies proven demand; it does not manufacture supply into an empty market.

---

## THE EXIT STATEMENT

**WHAT CHANGED TODAY** — seventeen printed editions now end on a page a reader cannot miss: a 2.1–2.9 inch code, the address in display type, a true list of what is on the other side. Four of them previously hid it in a paragraph. An invented biography of a real person is out of a live-pending book. A library catalogue will no longer read one of these books as *untitled / anonymous*. The catalogue stopped showing placeholder covers while real ones loaded. A printed address typed in capitals now works.

**WHAT A CUSTOMER CAN BUY** — six direct ebooks: Dudeney $9.99, Bestiarium $12.99, Enigmatica $9.99, World Games $11.99, World Myths $6.99, Meditations $9.99. Nineteen Amazon listings.

**WHAT SOLD** — nothing. **WHAT DID NOT SELL** — everything.

**WHAT TRAFFIC EXISTS** — Google: 0 clicks, 0 impressions, 41 URLs submitted, 0 indexed. First-party: 13 events, almost all internal, 0 checkouts. Amazon: no sales rank anywhere.

**WHAT WAS GENERATED** — no image. $0.00.

**WHAT ADS RAN** — none.

**THE SHORTEST PATH FROM HERE** — eight uploads, twenty minutes, no cover work (A1–A8). Then one campaign. In that order, because an ad before the upload buys a stranger who reaches the last page of the book and is told nothing.
