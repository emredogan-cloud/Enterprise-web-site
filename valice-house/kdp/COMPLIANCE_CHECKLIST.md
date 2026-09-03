# KDP Compliance Checklist — Gate 10

**Status:** ACTIVE · v2 (2026-09-03 — row 16, the companion-linkage review) · v1 (2026-09-02) · **Owner:** R8 prepares, **Founder signs** · **Read by:** `scripts/factory/compliance-lint.mjs`

Every row must be answered before upload. "How verified" names the mechanism; "Evidence" names the file the gate record points to. A row without evidence is not passed.

| # | Check | Rule [V = kdp.amazon.com, checked 2026-09-02] | How verified | Evidence |
|---|---|---|---|---|
| 1 | **AI-generated content declared** | "AI-generated" = text, images or translations created by an AI tool, even if substantially edited; must be disclosed at publish and republish. "AI-assisted" (you created it, AI edited/refined) needs no disclosure. | `project_config.json → founder.aiDisclosure.{text,images,translation}` each `generated` / `assisted` / `none`, and `founderConfirmed: true` with a date. `compliance-lint` fails on `null` or `false`. | `project_config.json`; KDP upload screenshot in `QA/` |
| 2 | **Public-domain differentiation** | undifferentiated PD is rejected when a free version exists; differentiation = original translation, original annotations or ≥ 10 original illustrations; title field carries `(Translated)`/`(Annotated)`/`(Illustrated)`. Not accepted: linked TOC, formatting, collections, price, freely available internet content. | `project_config.json → rights.publicDomain: true` ⇒ `metadata.title` contains a tag and `differentiation.originalShare ≥ 0.20` or `illustrations.original ≥ 10`. | `RIGHTS.md`, `QA/metadata-lint.json` |
| 3 | **Ink / trim / paper per edition** | hardcover: black ink only, white or cream, 75–550 pp, trims 5.5×8.5 / 6×9 / 6.14×9.21 / 7×10 / 8.25×11; paperback 24–828 pp (B&W); colour ink prints on white only; premium colour is a margin trap (never for Valice). | `project_config.json → formats[].{trim,ink,paper,pages}` within the ranges; `ink !== "colorPremium"`. | `project_config.json`, `QA/preflight.json` |
| 4 | **Bonus content** | at the end of the book, listed in the TOC, ≤ ~10 % of the book; no disruptive links; no promised gifts/rewards. | manuscript structure check: companion note ≤ 1 page, no reward language. | `QA/style-lint.json` |
| 5 | **Hyperlinks / printed URLs** | links only if they enhance the reader's experience; **no links to web forms that request customer information**; no links to other ebook stores. | `kdp-linkage-lint` reads the built PDF: the printed address is on the canonical host, is not a data wall, and is not another storefront. | `docs/execution/phase-5/KDP_VALICE_LINKAGE_MATRIX.csv` |
| 6 | **KDP Select conflict** | Select = 90-day digital exclusivity, auto-renews; print exempt. A Select-enrolled ebook may not be sold on valicepress.com. | `kdpSelect: true` ⇒ catalogue `directSale: false` (test enforced). Valice policy: **no new title enrols in Select**. | `valice-catalog.test.ts` |
| 7 | **Keywords** | ≤ 7; no unowned brands, subjective claims, time-sensitive words, Amazon program names, misrepresentation, category words. | `metadata-lint` banned-term list. | `QA/metadata-lint.json` |
| 8 | **Subtitle counts** | any integer in the subtitle equals the measured count. | `metadata-lint`. | `QA/metadata-lint.json` |
| 9 | **Author bio** | a real, verifiable bio; a placeholder was read as template text and rejected (World Myths, 2026-08-12). | bio text present and not matching `[`, `TBD`, `pending`. | `metadata.json → authorBio` |
| 10 | **ISBN** | KDP-provided free ISBN; never invented; copyright page prints `PENDING — KDP-PROVIDED ISBN` until assigned. | `founder.isbn.*` null or a 13-digit value read from KDP. | `project_config.json` |
| 11 | **Velocity** | KDP's observed allowance ≈ 10 new titles per format per week; Valice caps itself at **5 per format per week**. | `scripts/factory/status.mjs` counts uploads per week. | status report |
| 12 | **Proof ordered for a new trim/template** | proof copies ≤ 5 per order, draft status only; author copies ≤ 999, live only. First use of any trim/template/paper combination gets a physical proof. | proof order id recorded. | `QA/proof.md` |
| 13 | **Pre-order** | ebook only; ≤ 1 year ahead; ≤ 10 concurrent; final file > 72 h before release; a miss = 1-year ban. Print uses a scheduled release date. | launch plan. | `LAUNCH.md` |
| 14 | **Pricing inside the band** | Kindle 70 % band $2.99–12.99 (opt-in); print list ≥ printing ÷ royalty rate; never $4.99 ebooks. | `price-engine.mjs` output attached. | `QA/pricing.json` |
| 15 | **Content guidelines** | no misleading claims, no offensive content, no copied text blocks from sources (quotations are citations, not passages). | `similarity.mjs` vs sources; editorial read. | `QA/similarity.json` |

| 16 | **Companion-linkage review** | **No new physical edition passes this gate with a bridge a reader would not notice.** An address printed somewhere in the book is not enough — see below. | `compliance-lint.mjs → lintBuiltInterior`, which fails the gate rather than warning. | `docs/execution/phase-5/kdp-packages/<slug>/<format>/manifest.json` |

---

## Row 16 in full — the companion-linkage review

**Added 2026-09-03.** Four live editions passed row 5 while carrying a bridge nobody would ever have noticed: a text block at the top of an otherwise empty page with no code on it, a one-inch code pushed into a corner under a map caption, a grey box that was the fourth thing on its page, and one line buried inside the imprint on the copyright page. Every one of them "printed the URL". None of them worked.

Amazon does not give us the buyer's address and never will. The printed page is the entire bridge from a customer Amazon owns to a reader we can reach again. If the reader does not see it, it does not exist — so the gate now checks the page, not the string.

Every check below is **measured off the built PDF**, and every one of them **fails the gate**, not warns:

| Check | Floor | How it is measured |
|---|---|---|
| The companion exists | a real entry in `src/lib/companions.ts` with real assets | registry lookup |
| It is a **dedicated page** | the page carrying the address also carries the standing line `CONTINUE WITH <IMPRINT>` | `pdftotext` per page |
| A code is actually printed | found in the raster | `measure-qr.py` — the 1:1:3:1:1 finder signature, the same one a scanner looks for |
| The code is large enough | **≥ 20 % of page height**, which is the house's 25 % of *usable* height read off the only surface a measurement can reach | measured from the finder positions |
| The code will scan in print | **≥ 0.5 mm per module** on uncoated stock | measured module pitch |
| The code carries the right address | every module matched against the code the URL produces | 300 dpi read-back |
| The address is printed in type | the canonical `valicepress.com/…`, directly under the code | text match |
| No data wall | the page asks for nothing; the line "nothing to sign up for, no email asked" is printed because it is true | phrase check, with the house promise excluded first |
| Canonical host | never a preview host, localhost, an IP, or `valice-press.com` | pattern check |
| Fonts embedded | every face on the page | `pdffonts` |
| PDF metadata | a real title and author, never *untitled / anonymous* | `pdfinfo` |

**Exempt:** an edition at KDP in review (its file cannot be replaced) and an edition with no built interior (there is nothing to check). Both are reported as such rather than passed.

**Build the page rather than hand-setting it:** `node scripts/factory/build-companion-pages.mjs --commit --slug <slug>`. It sets the page in the book's own faces at the book's own margins with the book's own folio, refuses to draw a glyph the font lacks, refuses to overflow, recalculates the spine, and writes the upload package.

**When the page count moves,** `spine-check.mjs` decides whether the cover must be rebuilt, and the package names the rebuilt wrap or says why there is none. A hardcover wrap is **read from KDP's Cover Calculator, never derived** — that rule is older than this row and it is why two wraps in the current package are Founder actions.

---

Founder signature block (copied into `gates.json` gate 10 evidence): `signedBy`, `date`, `aiDisclosureAnswer`, `notes`.
