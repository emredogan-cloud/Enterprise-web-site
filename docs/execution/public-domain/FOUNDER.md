# FOUNDER — public-domain factory action ledger

**The single common ledger for every phase.** Only genuine Founder or provider actions go
here: things an agent cannot do because they need a signature, an account, a payment
method, a physical object, or a judgement that is the Founder's to make.

Routine agent work never appears here. Neither does anything already finished.

**Severity:** **P0** prevents any safe continuation of that book · **P1** blocks a specific
output while other work continues · **P2** is an inconvenience and never stops a book.

---

## Open

### F-001 · P0 · Sign Gate 2 for Epictetus

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1, Epictetus: The Discourses and Enchiridion
- **Blocker:** The rights gate needs a founder signature. It has not been given.
- **Why the agent cannot do it:** `gate.mjs` refuses `passed` on a founder gate from any
  other owner, by design. The signature *is* the gate.
- **Already done:** `RIGHTS.md` written with all five layers assessed separately. Ledger rows
  RL-0028 … RL-0032 created and `rights-lint.mjs` passes on 31 rows. George Long's death year
  (1879) read from the Project Gutenberg authority record rather than inferred. The
  illustration layer checked and confirmed empty — the PG record lists no illustrator.
- **Exact action:**
  ```
  cd /home/emre/Downloads/Valice-Press-Site
  node scripts/factory/gate.mjs \
    /home/emre/Downloads/MY-DİGİTAL-BOOK/EPICTETUS-DISCOURSES-AND-ENCHIRIDION \
    set 2 passed --owner founder --evidence RIGHTS.md
  ```
  Then flip RL-0028 … RL-0032 from YELLOW to GREEN with `approved_by=founder` in
  `valice-house/rights/ledger.csv`.
- **Read first:** `MY-DİGİTAL-BOOK/EPICTETUS-DISCOURSES-AND-ENCHIRIDION/RIGHTS.md`
- **Consequence if unresolved:** The book cannot be published in any channel. It stays
  `websiteStatus: "draft"` and nothing is sold.

---

### F-002 · P0 · Decide the AI declaration for Epictetus

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** `compliance-lint` fails with one error: *disclosure recorded without
  `decidedBy=founder`*. That is correct behaviour — the answer is a judgement, not a fact.
- **Why the agent cannot do it:** KDP's declaration is a legal statement made by the
  publisher of record. The categories are Amazon's and they do not map cleanly onto this
  book.
- **What is actually true** (recorded in `project_config.json → compliance.aiDisclosure`):
  - **Text of Epictetus and George Long** — human, 1877, over an ancient original;
    transcribed by Project Gutenberg volunteers; mechanically parsed here. Not AI.
  - **Editorial apparatus** — 15,381 words, 20.0% of the volume — AI-assisted drafting under
    human editorial direction, written against the source, with 18 of 23 checkable claims
    evidenced from primary records.
  - **Images** — none. No image model was used, and none was available.
  - **Translation** — none made.
- **Exact action:** Decide, then set `compliance.aiDisclosure.decidedBy` to `"founder"` and
  `decidedAt` to the date in
  `MY-DİGİTAL-BOOK/EPICTETUS-DISCOURSES-AND-ENCHIRIDION/project_config.json`.
- **Note:** The Dudeney edition carries an unresolved conflict of exactly this shape
  (`compliance.aiDisclosure.textConflict`). Resolving it once, as a policy, would settle both
  and every public-domain book after them.
- **Consequence if unresolved:** Gate 10 stays failed. No KDP upload.

---

### F-003 · P1 · Take an Amazon market sample before the paperback price is fixed

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** Gate 1 has never been passed for this title. The state machine will not
  advance the project past `RESEARCH` without it.
- **Why the agent cannot do it:** It needs an Amazon account and a browser session on
  amazon.com. The research catalog was explicit that no marketplace sampling was performed.
- **Already done:** Price ladder computed with `price-engine.mjs`. The engine recommends
  $12.99 for a 176-page 6×9 public-domain paperback; the Valice Classics bible's band is
  $16.99–19.99 *once an edition has proved itself*. $16.99 is in the catalogue as a
  **proposal**, not a decision.
- **Exact action:** `node scripts/market/market-sample.mjs` (or a manual top-20 BSR sample
  for "Epictetus" and "Stoicism") → write `MARKET.md` → pass Gate 1.
- **Consequence if unresolved:** The paperback price is a guess. The direct ebook at $9.99
  is not affected — it matches the two live Valice Classics titles.

---

### F-004 · P1 · Provision Paddle for Epictetus

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** No Paddle product or price exists for this slug. `paddlePriceId` is null and
  the ebook sits at `coming_soon`.
- **Why the agent cannot do it:** The commit path was blocked by the tool-permission layer
  in Phase 2 for exactly this reason and the same constraint applies. `PADDLE_API_KEY` is
  present in the environment but the write is not the agent's to make.
- **Exact action:**
  ```
  node scripts/catalog/provision-paddle.mjs                       # dry run first, read it
  node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-production
  ```
  Then paste the returned `pri_…` into `paddlePriceId` in
  `scripts/catalog/valice-catalog.mjs` for `epictetus-discourses-and-enchiridion`.
- **Consequence if unresolved:** The direct ebook cannot be bought even after Gate 2 is
  signed.

---

### F-005 · P1 · Upload the digital-edition masters to R2

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** `masterFileKey` and `epubFileKey` are null in the catalogue because nothing
  has been uploaded. Fulfillment has nothing to serve.
- **Already done:** Digital edition cut (0.59 MB, 176 pp) and the EPUB built
  (epubcheck 0/0/0). Both are registered in `scripts/catalog/digital-edition-sources.mjs`.
- **Exact action:** `node scripts/catalog/upload-masters.mjs epictetus-discourses-and-enchiridion`
  (dry run first), then write the two keys into the catalogue entry.
- **Consequence if unresolved:** A purchase would complete and the entitlement would stick
  at `pending` forever. Nothing on the page currently claims a download, which is why this
  is P1 and not P0.

---

### F-006 · P1 · Deploy, so the companion URL resolves

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** `validate-catalog` reports `/companion/epictetus` and its four assets as 404.
  That is accurate: they exist in the repository and in the build output, but production has
  not been deployed since they were added.
- **Already done:** Companion registered in `src/lib/companions.ts`, page prerendered by
  `npm run build`, four PDFs written to `public/companion/epictetus/`, QR decode verified
  against the printed URL with an independent decoder.
- **Exact action:** Deploy. Then re-run
  `node scripts/catalog/validate-catalog.mjs --slug epictetus-discourses-and-enchiridion`.
- **Consequence if unresolved:** A QR printed in a paperback is permanent. **Do not print
  before the URL resolves.** This is the one item on this page that becomes unfixable after
  the fact.

---

### F-007 · P2 · Confirm or cut five hedged claims (Gate 5)

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** `CLAIMS.jsonl` holds 23 claims: 18 VERIFIED, 5 PENDING. `claim-lint` passes
  with a warning. Gate 5 needs a founder signature and no PENDING left.
- **The five, each already hedged in the printed text:**

  | id | Claim | If it cannot be confirmed |
  |---|---|---|
  | C-011 | Elizabeth Carter's translation is dated 1758 | The chronology row reads "eighteenth century" |
  | C-014 | Domitian expelled the philosophers in the late 80s / early 90s | Already a range; the text says the sources conflict |
  | C-020 | *Enchiridion* 5 is an acknowledged antecedent of cognitive therapy | Soften to "is often cited as" or cut the sentence |
  | C-021 | Nicopolis was founded by Augustus to commemorate Actium | Cut the clause; nothing depends on it |
  | C-022 | Epictetus died around 135 | Already "around" and "seems to have" |

- **Why it is P2:** every one is stated with a hedge and each has a written fallback, so the
  book is not making a false claim today. It still needs signing off.

---

### F-009 · P0 · Sign Gate 2 for Seneca

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 2, Seneca: Selected Dialogues
- **Blocker:** Rights gate needs a founder signature.
- **Already done:** `RIGHTS.md` written, ledger **RL-0033 … RL-0039**, `rights-lint` passes on
  38 rows. Aubrey Stewart's death year (1918) read from the PG authority record and
  independently confirmed on a second PG record.
- **Why this one matters more than usual:** this book replaces a source the previous candidate
  pool had wrong. The pool recorded Seneca's Loeb translator as "d. 1919" — which is the
  imprint year of one volume of a series whose next volume appeared in 1925. Stewart is the
  verified substitute. Reading `RIGHTS.md` here is worth the ten minutes.
- **Exact action:**
  ```
  node scripts/factory/gate.mjs \
    /home/emre/Downloads/MY-DİGİTAL-BOOK/SENECA-SELECTED-DIALOGUES \
    set 2 passed --owner founder --evidence RIGHTS.md
  ```
- **Consequence if unresolved:** the book cannot be published in any channel.

---

### F-010 · P0 · One AI-disclosure policy, not one per book

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Books:** 1 and 2, and every public-domain
  title after them
- **Blocker:** `compliance-lint` fails on both books with the same error — the disclosure is
  recorded but has no `decidedBy=founder`.
- **Why it is now one item rather than two:** the shape is identical for every book this
  factory will produce — a fully human public-domain text, no AI images at all, and an
  editorial apparatus of roughly 20% that was AI-assisted. Answering it twice invites two
  different answers. The Dudeney edition already carries an unresolved conflict of exactly
  this shape.
- **Exact action:** decide once, write it into
  `docs/execution/public-domain/PUBLIC_DOMAIN_PUBLISHING_CONSTITUTION.md` as house policy,
  then set `compliance.aiDisclosure.decidedBy` and `decidedAt` in each
  `project_config.json`.
- **Consequence if unresolved:** Gate 10 stays failed for the whole phase. No KDP upload.

---

### F-011 · P1 · Provision Paddle and upload masters for Seneca

Same shape as F-004 and F-005, for `seneca-selected-dialogues`. The digital edition (0.53 MB,
156 pp) and the EPUB (epubcheck 0/0/0) are built and registered in
`scripts/catalog/digital-edition-sources.mjs`. `paddlePriceId` and both master keys are null,
and nothing on the page claims a download.

---

### F-012 · P2 · Confirm or cut five hedged claims for Seneca (Gate 5)

`CLAIMS.jsonl`: 12 claims, 7 VERIFIED, 5 PENDING. Each pending claim is hedged in the printed
text and carries a written fallback:

| id | Claim | Fallback if unconfirmed |
|---|---|---|
| C-007 | Gallio is the proconsul who appears in Acts 18 | cut the Acts sentence; the brotherhood is separately attested |
| C-008 | The death scene, from Tacitus | cut the detail, keep the date and manner |
| C-009 | The three-hundred-million-sesterce fortune, from Dio | cut the figure, keep "he was among the richest men in the empire" |
| C-010 | The forged Seneca–Paul correspondence and Jerome | reduce to "a forgery circulated and was widely believed" |
| C-011 | Nine tragedies | change to "a set of tragedies" |

---

### F-013 · P0 · Decide the scope of the Werner volume

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 3, Myths and Legends of China
- **Blocker:** The book is parsed, rights-cleared and has a written apparatus of 9,797 words.
  Against 63,857 words of Werner that is **13.3%**, below the 20% series floor. Closing the gap
  means changing what the book is.
- **Why the agent stopped rather than deciding:** both available fixes are forbidden by the
  constitution written for this factory. Padding the apparatus to reach a number is forbidden
  outright. Cutting chapters *because* they close a ratio makes the selection arithmetic rather
  than editorial, which is also forbidden. Which Werner book Valice publishes is a product
  decision with commercial consequences, and it is yours.
- **The options, measured** (full table in the book report):

  | Option | Source words | Editor share | |
  |---|---:|---:|---|
  | A — all twelve chapters | 63,857 | 13.3% | fails |
  | B — drop the two Ming-novel extracts | 47,193 | 17.2% | fails |
  | C — the pantheon only | 32,113 | **23.4%** | passes |
  | D — pantheon + Goddess of Mercy | 42,500 | 18.7% | fails |
  | E — pantheon + fox legends | 36,806 | **21.0%** | passes |

- **The agent's recommendation, offered as a recommendation:** **split it into two volumes.**
  The seam is real. Chapters III and V–IX plus XI and XIII are the pantheon — the ministries,
  the officials, the system the introduction is built around — and they come to 32,113 words,
  which the existing apparatus carries at 23.4%. Chapters X, XII, XIV and XV are long
  narratives, three of them extracted from Ming novels, and they are a different kind of book
  that deserves its own apparatus as a Phase 2 title. This is better publishing than either
  passing option, and it turns a blocked book into two good ones.
- **Consequence if unresolved:** no interior, cover, companion, catalogue entry or KDP package
  can be built, because all of them encode a page count and a price that depend on the scope.
  Everything already done — the parse, the rights ledger, the glossary with verified references,
  the chronology, the romanisation note — survives any option and none of it is wasted.

---

### F-014 · P1 · Books 4 and 5 of Phase 1 are specified but not built

- **Date raised:** 2026-09-04 · **Phase:** 1
- **State:** The roadmap assigns Mackenzie's *Indian Myth and Legend* and Gould's *Mythical
  Monsters* as Books 4 and 5. Neither has been started.
- **Why:** Phase 1 was scoped as five books and delivered two complete ones plus a third that
  hit a real scoping decision. The brief for this factory is explicit that the requirement is
  **one book complete, then the next** — never five half-finished. Starting two more books
  while a third waits on your decision would have produced exactly that.
- **What makes them cheaper now:** the pipeline is proven end to end on two books. Source
  parser, interior typesetter with the KDP parity rule, EPUB builder, typographic cover builder,
  subject-index generator, differentiation measurement, the house companion pipeline, and a
  reusable KDP handbook generator all exist and all pass. A book that clears the apparatus
  question is now roughly a day's work rather than a week's.
- **The one thing to check first:** Mackenzie's *Indian Myth and Legend* is 90,000+ words in the
  source. It will meet the same ratio question Werner did, and the answer should be decided at
  selection time rather than discovered at measurement time. Gould's *Mythical Monsters* is
  about 100,000 and has the same shape.
- **Consequence if unresolved:** Phase 1 is 2 of 5 complete. Phase 2 stays locked either way.

---

## Standing items — not book-specific

### F-008 · P2 · Resolve the highest-value rights unblocking work

The research catalog holds **24 candidates that are YELLOW solely because a translator's or
illustrator's death year is unrecorded**. A records search — a national library authority
file, a probate index, an obituary — would move most of them to GREEN and into production
slots.

The single most valuable is **John Vinycomb, *Fictitious & Symbolic Creatures in Art***
(score 82.9, 2,245 Gutenberg downloads a month, the closest public-domain ancestor to the
live *Codex Bestiarium*). Neither Project Gutenberg nor the Internet Archive records his
death year. **One date moves it straight into Tier S.**

This is research, not production, and it does not block Phase 1.

---

## Closed

*(nothing yet)*
