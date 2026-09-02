# Publishing Factory Architecture

Operational design for Valice Press's parallel-agent production system.
Companion to `KDP_BUSINESS_MODEL_COMPARISON.md`.

---

## 1. The premise, tested

The founder's operating hypothesis is ~8–10 books/month via parallel terminal
agents. Two questions decide whether that is real: is it *permitted*, and is it
*absorbable*?

**Permitted — yes.** KDP allows roughly 10 new titles per format per week
(ebook / paperback / hardcover), so ~30 title-format records/week, ~130/month.
A 10-book month publishing three formats each consumes 30 records. **The
platform ceiling is at ~4× the plan and is not the binding constraint.** [V]

**Absorbable — this is where the hypothesis breaks.** Production is not the
bottleneck, and neither is Amazon. The constraints that actually bind, in
order:

| # | Constraint | Why it binds | Scales with |
|---|---|---|---|
| 1 | **Founder editorial attention** | Only the founder can approve a factual claim, a rights position, or a cover. Cannot be delegated to an agent without accepting account risk. | titles published |
| 2 | **Post-launch listing & ad management** | At ~0.5 h/title/month, 120 live titles = 60 h/month = 0.38 FTE. At 360 titles it exceeds one full-time person. | **cumulative catalogue**, not monthly output |
| 3 | **Illustration & interior art** | The only step with no fast, high-quality, rights-clean automated path for a distinctive house style. | illustrated titles |
| 4 | **KDP review + physical proof cycle** | 24–72 h review, plus days for a printed proof on any title where interior layout matters. Wall-clock, not effort. | titles published |
| 5 | **Factual verification** | The step whose failure ends the account. Irreducibly human at the sign-off. | content density |

Constraint #2 is the one that kills naive volume plans: it accumulates.
Publishing 10 books in month 1 costs 10 books of work. Publishing 10 books in
month 24 costs 10 books of work **plus maintenance on the 240 already live**.
Output is a flow; maintenance is a stock. Any plan that ignores the stock
collapses somewhere around month 18. [I]

**Conclusion:** 8–10 books/month is achievable, but **only for templated titles
inside an established series**, and only if maintenance is designed down from
the start. It is not achievable for original high-content books, and a single
throughput number for the whole business is the wrong target.

---

## 2. Three lanes, not one factory

A single pipeline forces every title through the slowest gate. Three lanes with
different speeds and different quality bars:

| | **Lane A — Franchise** | **Lane B — Flagship** | **Lane C — Public Domain** |
|---|---|---|---|
| Output | 4–6 titles/mo | 1 per quarter | 1–2/mo |
| Shape | Templated series entry (script workbook, themed puzzle book, folklore volume) | Original high-content illustrated reference or deep guide | Annotated / illustrated PD edition |
| Channel | **Amazon print-first** | **Direct-first**, Amazon later | **Direct-first** (KDP caps PD at 35%) |
| Price | $12.99 pb / $21.99 hc / $27.99 LP | $24.99–$79 | $9.99–$14.99 |
| Net/unit | $5.35 / $10.75 | $8.89–$74.55 | $8.99 |
| Human hours | 14 + 3/format | 90–220 | 25 |
| Purpose | Discovery, keyword coverage, cash | Brand, authority, margin | Margin, catalogue depth, SEO |
| Failure mode | Commoditisation | Too slow to matter | Undifferentiated → KDP rejection |

Lane A pays the bills and feeds the top of the funnel. Lane B is why anyone
trusts the imprint. Lane C converts free source material into 90%-margin
product on infrastructure that already exists.

**The bridge between them is the whole strategy.** Every Lane A print book
carries a QR code and short URL to a genuinely useful free digital companion —
answer key, stroke-order animations, printable extra sheets, a pronunciation
audio set. That lands the reader on valicepress.com, where email capture and
the direct catalogue live. Amazon rents the customer; the companion page buys
them. This is the only mechanism in the plan that converts Amazon's traffic
into an owned asset, and it is the reason the storefront exists.

---

## 3. Agent topology

Not one agent per pipeline stage — that serialises the work and multiplies
handoff loss. Organise by **batch across titles**, because the expensive
context (a niche's competitive landscape, a series' house style) is shared
across every title in a batch and should be loaded once.

```
FOUNDER (editorial CEO — approves, does not produce)
  │
  ├─ STANDING CONTEXT  ── house style guide, series bible, template library,
  │                       verified-facts store, rejected-claims log
  │
  ├─ BATCH 1 · MARKET          2 agents  → niche + keyword + competitor sweep
  │                                        for the whole month's slate at once
  ├─ BATCH 2 · ARCHITECTURE    2 agents  → outline + spec per title
  ├─ BATCH 3 · CONTENT         4 agents  → drafting, one title each
  ├─ BATCH 4 · VERIFICATION    2 agents  → adversarial fact-check; the checking
  │                                        agent must NOT be the drafting agent
  ├─ BATCH 5 · EDITORIAL       2 agents  → line edit against the style guide
  ├─ BATCH 6 · DESIGN          2 agents  → interior layout + cover briefs
  ├─ BATCH 7 · METADATA        1 agent   → titles, subtitles, keywords, categories,
  │                                        descriptions, series linking
  └─ BATCH 8 · COMPLIANCE QA   1 agent   → KDP policy, AI disclosure, PD
                                           differentiation, trim/bleed/ink,
                                           duplicate-content check
```

Three rules that matter more than the topology:

1. **The verifier is never the author.** An agent asked to check its own work
   confirms it. Verification runs in a separate context with the draft as
   untrusted input.
2. **Batch by stage, not by book.** One market-research pass covering ten
   titles is cheaper and more coherent than ten passes covering one.
3. **The standing context is the compounding asset.** The style guide, series
   bible and verified-facts store are what make title #40 cheaper than title
   #4. Without them, throughput never improves and every book costs the same.

### Parallel vs serial

Serial (finish A, then B) minimises work-in-progress and context switching but
leaves every specialist idle most of the time. Pure parallel maximises
utilisation but creates ten simultaneous half-finished books, and a policy
problem discovered in batch 8 has then contaminated all ten.

**Use staged-parallel with a quality gate between stages:** the whole slate
advances together, and no title enters the next stage until it clears the gate.
Ten books fail cheaply at gate 3 together; they never fail expensively at gate
9 individually.

---

## 4. Quality gates

No title advances without clearing the gate ahead of it. Gates 2, 5 and 8 are
**founder sign-off and cannot be delegated** — they are the ones that carry
account-ending or legally material risk.

| Gate | Check | Owner | Kill criterion |
|---|---|---|---|
| 1 · Market fit | Demand exists; top-20 competitors sampled; keyword gap real | Agent | No gap, or top 20 all strong → drop |
| 2 · **Rights** | PD status proven, or all content original; licences for any third-party asset | **Founder** | Any unresolved claim → drop |
| 3 · Content quality | Meets series spec; no filler; genuinely useful | Agent | Below spec → rework |
| 4 · Originality | Not a near-duplicate of a Valice title or a competitor's | Agent | Overlap → rework |
| 5 · **Factual verification** | Every checkable claim sourced; adversarial pass by a non-author agent | **Founder signs off** | Any unverifiable load-bearing claim → cut the claim |
| 6 · Cover | Meets house identity; readable at thumbnail; no rights issue | Founder | Fail → rework |
| 7 · Metadata | No keyword stuffing, no misleading claims, correct categories, series linked | Agent | Fail → rework |
| 8 · **KDP policy** | AI disclosure correct; PD differentiation met **and tagged in the title**; not misleading; ink type correct | **Founder** | Fail → do not upload |
| 9 · Proof | Physical/digital proof reviewed; trim, bleed, gutter, ink | Founder | Fail → rework |
| 10 · Launch readiness | Price set inside the 70% band; formats laddered; companion page live; ads drafted | Agent | Fail → hold |

Gate 8 deserves special attention: **the AI disclosure is free to comply with
and fatal to skip.** Amazon states the disclosure is internal, does not appear
on the product page, and affects neither royalties nor ranking — while
non-disclosure escalates to account-level enforcement. There is no upside to
omitting it. Disclose on every title where an AI tool generated text, images or
translation, including titles that were then heavily edited. [V]

---

## 5. Single-title pipeline

| Stage | Owner | Input | Output | Gate | Est. hours (Lane A) |
|---|---|---|---|---|---:|
| Idea | Agent | Niche map | Concept brief | — | 0.3 |
| Market validation | Agent | Concept | Demand + keyword evidence | 1 | 1.0 |
| Rights check | **Founder** | Concept | Rights position | 2 | 0.3 |
| Outline | Agent | Brief + series bible | Chapter/section spec | — | 0.7 |
| Draft | Agent | Spec + template | Manuscript | 3, 4 | 3.0 |
| Fact-check | Agent (non-author) | Manuscript | Claim ledger | 5 | 1.5 |
| Edit | Agent | Manuscript + ledger | Final text | — | 1.5 |
| Interior | Agent | Final text + template | Print-ready PDF | — | 2.0 |
| Cover | Agent + Founder | Brief | Cover files | 6 | 1.5 |
| Metadata | Agent | All | Listing copy | 7 | 0.7 |
| Compliance QA | Agent + **Founder** | All | Pass/fail | 8 | 0.5 |
| Upload + proof | Founder | Files | Live listing | 9 | 1.0 |
| **Format ladder** | Agent | Same interior | hc + large-print | 9 | **3.0** |
| Website + companion | Automation | Catalogue entry | Live page, email hook | 10 | 0.3 |
| Launch + ads | Founder | Listing | Campaigns | — | 0.5 |

**~14 hours for the paperback, +3 for each derived format.** Those 3 hours are
the highest-return labour in the business: $10.75/unit versus $5.35, for a
fifth of the work. **Never publish a Lane A paperback without laddering it.**

---

## 6. Monthly rhythm

Wall-clock, not effort. Weeks overlap because stages are batched across titles.

| Week | Lane A (slate of 5) | Lane B | Lane C | Founder's job |
|---|---|---|---|---|
| 1 | Market + rights + outlines for the slate | Research block | Source selection, PD proof | Gate 1–2 approvals; niche decisions |
| 2 | Draft + fact-check | Draft block | Annotation drafting | Gate 5 sign-offs |
| 3 | Edit + interior + covers | Illustration | Edit + interior | Gate 6 cover approvals |
| 4 | Metadata, compliance, upload, **ladder** | Review | Publish direct | Gate 8–9; launch |
| Continuous | — | — | — | Ads + listing maintenance on the live catalogue |

The last row is the one that grows without bound. Budget it explicitly from
month one, and treat any month where maintenance is skipped as a month that
borrowed from the catalogue's future.

---

## 7. Cost per finished book

Token volumes are estimates for a ~120-page Lane A title with batched research
and an adversarial verification pass. **Rates change; recompute before relying
on the totals** — the useful part is the volume, not the dollar figure.

| Stage | Input tokens | Output tokens |
|---|---:|---:|
| Market research (amortised across a slate of 5) | ~150k | ~30k |
| Outline | ~80k | ~25k |
| Draft | ~300k | ~150k |
| Fact-check (separate context, re-reads the draft) | ~200k | ~50k |
| Edit | ~180k | ~60k |
| Metadata + compliance | ~120k | ~25k |
| **Total** | **~1.03M** | **~340k** |

Cost per book ≈ `1.03 × (input $/M) + 0.34 × (output $/M)`, plus cover image
generation. On a frontier-tier model this lands in the low tens of dollars; on
a mid-tier model, single digits. **Against $5.35–$10.75 contribution per unit,
model cost is recovered inside the first ~5 copies sold.**

**Model spend is not the real cost of a book.** Founder hours are. At 14 hours
per Lane A title, the founder's time is the scarce input by two orders of
magnitude, and every architectural decision above exists to spend fewer of
those hours per published title — not fewer tokens.

---

## 8. Founder as editorial CEO

**Does:** niche approval, rights, factual sign-off, cover approval, publish
approval, pricing, and the quarterly decision about what to stop doing.

**Does not:** draft, research, lay out, or write metadata.

**Monthly budget at a 5-title Lane A slate + Lane C:**

| Activity | Hours/mo |
|---|---:|
| Gate approvals (1, 2, 5, 6, 8, 9) across the slate | ~18 |
| Upload, proof, launch | ~8 |
| Catalogue maintenance + ads (grows with catalogue) | ~10 → 60 |
| Strategy, pricing, portfolio review | ~8 |
| **Total** | **~44 → ~94** |

That is the honest shape of the job: it starts near half-time and drifts toward
full-time purely through catalogue accumulation. When maintenance passes ~40
h/month, the choice is to hire it out or to prune the catalogue. **Archiving
weak titles is a throughput decision, not just a brand one.**

---

## 9. Account-risk controls

The factory's failure mode is not a bad book; it is a terminated account. What
gets flagged, and the control:

| Risk | Control |
|---|---|
| Undisclosed AI content | Disclose at Gate 8, always. Free to comply with, fatal to skip. [V] |
| Repetitive / near-duplicate titles | Gate 4 similarity check against the whole Valice catalogue, not just the slate |
| Undifferentiated public domain | Gate 2 + 8: proven differentiation (translation, original annotation, or 10+ original illustrations) **and** the `(Annotated)`/`(Illustrated)` tag in the title field [V] |
| Misleading metadata / keyword stuffing | Gate 7; no claim in metadata that is not true of the book |
| Low quality at volume | Gates 3 and 5; the slate fails together rather than shipping individually |
| Velocity flags | Stay well inside the ~10/format/week ceiling; a 5-title slate uses half of one format's allowance |
| Single point of failure | The storefront. A KDP suspension must not be able to stop revenue — which is the strategic argument for Lanes B and C |

The last row is the deepest one. A publisher whose entire business is on KDP
has handed an outside party the power to end it without appeal. Valice's
storefront means an Amazon suspension is a bad quarter, not a bankruptcy. That
optionality is worth real money and should be treated as a reason to keep the
direct channel materially large — not as a hedge to be quietly abandoned when
Amazon is going well.
