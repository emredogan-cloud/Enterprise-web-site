# KDP Compliance Checklist — Gate 10

**Status:** ACTIVE · v1 (2026-09-02) · **Owner:** R8 prepares, **Founder signs** · **Read by:** `scripts/factory/compliance-lint.mjs`

Every row must be answered before upload. "How verified" names the mechanism; "Evidence" names the file the gate record points to. A row without evidence is not passed.

| # | Check | Rule [V = kdp.amazon.com, checked 2026-09-02] | How verified | Evidence |
|---|---|---|---|---|
| 1 | **AI-generated content declared** | "AI-generated" = text, images or translations created by an AI tool, even if substantially edited; must be disclosed at publish and republish. "AI-assisted" (you created it, AI edited/refined) needs no disclosure. | `project_config.json → founder.aiDisclosure.{text,images,translation}` each `generated` / `assisted` / `none`, and `founderConfirmed: true` with a date. `compliance-lint` fails on `null` or `false`. | `project_config.json`; KDP upload screenshot in `QA/` |
| 2 | **Public-domain differentiation** | undifferentiated PD is rejected when a free version exists; differentiation = original translation, original annotations or ≥ 10 original illustrations; title field carries `(Translated)`/`(Annotated)`/`(Illustrated)`. Not accepted: linked TOC, formatting, collections, price, freely available internet content. | `project_config.json → rights.publicDomain: true` ⇒ `metadata.title` contains a tag and `differentiation.originalShare ≥ 0.20` or `illustrations.original ≥ 10`. | `RIGHTS.md`, `QA/metadata-lint.json` |
| 3 | **Ink / trim / paper per edition** | hardcover: black ink only, white or cream, 75–550 pp, trims 5.5×8.5 / 6×9 / 6.14×9.21 / 7×10 / 8.25×11; paperback 24–828 pp (B&W); colour ink prints on white only; premium colour is a margin trap (never for Valice). | `project_config.json → formats[].{trim,ink,paper,pages}` within the ranges; `ink !== "colorPremium"`. | `project_config.json`, `QA/preflight.json` |
| 4 | **Bonus content** | at the end of the book, listed in the TOC, ≤ ~10 % of the book; no disruptive links; no promised gifts/rewards. | manuscript structure check: companion note ≤ 1 page, no reward language. | `QA/style-lint.json` |
| 5 | **Hyperlinks / printed URLs** | links only if they enhance the reader's experience; **no links to web forms that request customer information**; no links to other ebook stores. | last-leaf text is the companion/verification address with utility first; no "sign up" wording; no store links. | back-matter text in `CONTENT/backmatter.md` |
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

Founder signature block (copied into `gates.json` gate 10 evidence): `signedBy`, `date`, `aiDisclosureAnswer`, `notes`.
