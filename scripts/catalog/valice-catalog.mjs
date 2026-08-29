/**
 * The Valice Press catalog, as source-controlled data.
 *
 * Every field here was read out of the book production repositories under
 * `MY-DİGİTAL-BOOK/` — measured page counts, real subtitles, real BISAC
 * codes, real built artifacts. Nothing is invented. Where a value could not
 * be established from the files it is `null`, and null renders as absent
 * rather than as a guess.
 *
 * ── THE ONE FACT THAT SHAPES THIS WHOLE FILE ─────────────────────────────
 * No Valice Press book is published on Amazon. There is no ASIN anywhere in
 * any project, no live listing URL, no assigned ISBN, no KDP submission. So
 * every print format below carries `amazonAsin: null` and availability
 * `coming_soon`. A "Buy on Amazon" button cannot be rendered for a book
 * that is not on Amazon, and fabricating an ASIN to make the UI look
 * finished would produce a dead link on a real storefront.
 *
 * Consequently every book loads as `draft`. Draft is not a placeholder
 * state here — it is the accurate one. Publishing is a per-title decision
 * that depends on things only the founder can settle: the KDP AI-content
 * declaration, a confirmed price, a legal review where one is outstanding,
 * and in two cases external validation that has not happened. Those
 * conditions are recorded per book in `blockers` so the decision is made
 * with the reasons in view. See FOUNDER_OPERATIONS_MANUAL.md.
 *
 * `directSaleEligible` is tracked separately from Amazon status on purpose.
 * Nothing here is enrolled in KDP Select — because nothing is on KDP at all
 * — so no digital-exclusivity clause blocks selling these ebooks directly.
 * Direct sale is, unusually, the *less* encumbered channel today.
 */

/** Prices are in minor units (cents). */
const usd = (dollars) => Math.round(dollars * 100);

export const CATEGORIES = [
  {
    slug: "myth-and-folklore",
    name: "Myth & Folklore",
    description:
      "Myth, legend and bestiary — retold and referenced from the traditions that carried them.",
  },
  {
    slug: "puzzle-and-challenge",
    name: "Puzzle & Challenge",
    description:
      "Books that ask something of the reader: ciphers, enigmas, and problems set to be solved.",
  },
  {
    slug: "games-and-play",
    name: "Games & Play",
    description:
      "The rules people have played by, across cultures and centuries — written to be played from.",
  },
  {
    slug: "young-explorers",
    name: "Young Explorers",
    description:
      "Books made for readers aged 8–12, and for the adults reading alongside them.",
  },
  {
    slug: "language-and-learning",
    name: "Language & Learning",
    description:
      "Workbooks and companions for learning a script, a language, or a practice by doing it.",
  },
];

export const AUTHORS = [
  {
    slug: "emre-dogan",
    name: "Emre Doğan",
    // Deliberately null. The founder's author bio is an outstanding item in
    // the book projects themselves (KDP rejected a placeholder bio on one
    // submission), and inventing credentials for a real person is exactly
    // the failure this catalog exists to avoid. The author page renders
    // name and books until a real bio is written.
    bio: null,
  },
];

/**
 * @typedef {Object} FormatSpec
 * @property {'ebook'|'paperback'|'hardcover'|'large_print'} format
 * @property {'available'|'coming_soon'|'unavailable'} availability
 * @property {'direct'|'amazon'} fulfillment
 * @property {number|null} priceCents
 * @property {number|null} pageCount
 * @property {string|null} amazonAsin
 * @property {string|null} masterFileKey
 * @property {string} priceBasis  Why this number is what it is.
 */

export const BOOKS = [
  {
    slug: "codex-mythologica",
    title: "Codex Mythologica",
    subtitle: "76 Myths from 19 Civilizations",
    language: "en",
    pageCount: 329,
    categories: ["myth-and-folklore"],
    authors: ["emre-dogan"],
    bisac: ["FIC010000", "SOC011000", "LIT004290"],
    series: { name: "Codex", volume: 1 },
    description:
      "Seventy-six myths from nineteen civilizations, retold at full narrative length rather than summarised into paragraphs. Greek, Norse, Egyptian, Mesopotamian, Chinese, Turkic, Inuit, Polynesian and Mesoamerican traditions sit side by side, each story given roughly a thousand words and left unsoftened. The arrangement is comparative by design: cultures that never met asked the same questions in the same images — a grieving spouse in Egypt and a grieving mother in Greece, the rabbit a Chinese poet saw in the moon sitting also in the Mexican account.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(8.99),
        pageCount: 329,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Project docs give a 4.99 launch → 8.99 standard Kindle price. README states 9.99; PROJECT_CONTEXT states 8.99. Unresolved contradiction — founder must settle before publish.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(18.99),
        pageCount: 329,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Modelled via editions.py from KDP cost tables (print $4.95, royalty ~$6.44). Project docs self-report the paperback as live, but record no ASIN, URL or publication date — treated here as unverified.",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(32.99),
        pageCount: 329,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled (print $9.60, royalty $10.19). Interior built, not uploaded.",
      },
      {
        format: "large_print",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(27.99),
        pageCount: 578,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Modelled (print $7.94, royalty $8.85). Cannot be offered as hardcover: 578pp exceeds KDP's 550pp hardcover maximum.",
      },
    ],
    directSaleEligible: true,
    blockers: [
      "Kindle price contradiction between README ($9.99) and PROJECT_CONTEXT ($8.99) — unresolved.",
      "Docs claim the paperback is live but record no ASIN, URL or date. Confirm actual KDP status before listing any Amazon link.",
      "Hardcover and large print built but never uploaded; no physical proof ordered for either.",
      "Cover art native resolution ~112 PPI (101 PPI on the hardcover canvas).",
    ],
  },

  {
    slug: "codex-bestiarium",
    title: "Codex Bestiarium",
    subtitle:
      "A World Bestiary: 112 Legendary Creatures from 40 Traditions — Beasts, Spirits, and Guardians of World Folklore",
    language: "en",
    pageCount: 435,
    categories: ["myth-and-folklore"],
    authors: ["emre-dogan"],
    bisac: ["SOC011000", "REF000000", "FIC010000"],
    series: { name: "Codex", volume: 2 },
    description:
      "A reference bestiary of 112 creatures drawn from 40 folk traditions, organised by what a creature does rather than where it comes from. The Irish each-uisce, the Icelandic nykur, the Finnish näkki and the Filipino tikbalang share a chapter because they share a behaviour. Six classes — Guardians, Devourers, Shape-Changers, Water-Dwellers, Sky and Storm, Restless Dead — hold entries of roughly 675 words, each carrying two independent sources, a Thompson motif code, pronunciation, cross-references and a line-engraved plate, closing with four indexes.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 435,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled Kindle price (~$5.94 royalty at 70%). EPUB built, 4.96 MB.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(24.99),
        pageCount: 435,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled from measured 435pp (print $6.23, royalty $8.76).",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(37.99),
        pageCount: 435,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled (print $10.88, royalty $11.91).",
      },
      {
        format: "large_print",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(29.99),
        pageCount: 599,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled (print $10.16, royalty $7.84).",
      },
    ],
    directSaleEligible: true,
    blockers: [
      "Production complete, publication blocked at the KDP account boundary: no proof copy ordered, Previewer never run, nothing uploaded.",
      "White-paper cover variants are defective (spine band overflows 1.10mm paperback / 0.41mm hardcover). Cream stock is correct and is the chosen stock.",
      "Cover art native resolution 103–116 PPI, upscaled to a 300 DPI canvas.",
    ],
  },

  {
    slug: "the-great-book-of-world-myths",
    title: "The Great Book of World Myths",
    subtitle:
      "45 Stories of Gods, Heroes, and Monsters from 22 Cultures — Retold for Young Readers (Ages 8–12)",
    language: "en",
    pageCount: 234,
    categories: ["myth-and-folklore", "young-explorers"],
    authors: ["emre-dogan"],
    bisac: ["JUV033010"],
    series: { name: "The Great Book of…", volume: 1 },
    description:
      "Forty-five myths retold for readers aged 8 to 12, drawn from twenty-two traditions — Korean, Inuit, Māori, Hawaiian, Yoruba, Akan, Persian, Turkic, Greek, Norse, Irish, Finnish, Egyptian, Mesopotamian, Japanese, Chinese, Vietnamese, Hindu, Maya, Aztec, Andean and Zulu. It is built against the roughly eighty-percent-Greek children's mythology shelf: no culture gets more than four stories and Greece gets no more than three. Each story runs 900–1,000 words with one black-and-white illustration, and the back matter carries a hand-drawn world map, per-culture cards, a sourced pronunciation guide and a Who's Who. Australian Aboriginal material is deliberately excluded, and the book says so.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(7.99),
        pageCount: 234,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled ($5.14 royalty at 70%, 3.0 MB delivery budget). EPUB built at 2.94 MB.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(16.99),
        pageCount: 234,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled from measured 234pp (print $3.76, royalty $6.43).",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(26.99),
        pageCount: 234,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Modelled (print $8.41, royalty $7.78).",
      },
      {
        format: "large_print",
        availability: "unavailable",
        fulfillment: "amazon",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Large print deliberately disabled by project decision K6/A6.",
      },
    ],
    directSaleEligible: true,
    blockers: [
      "A KDP upload was ATTEMPTED and REJECTED on 2026-08-12 — twice: a placeholder author bio on p.231 read as template text, and a '[QR CODE — Phase 6]' marker on p.233. Both were fixed and files rebuilt; there is no record of a successful resubmission.",
      "Founder's AI-content declaration not made.",
      "KDP Select / Kindle Unlimited decision open — this one materially affects whether the ebook can be sold direct.",
      "Cover art effective resolution 115/106 dpi; acceptance pending a physical proof.",
      "The two-parent-readings validation gate was closed by founder attestation only, with no per-reader log.",
    ],
  },

  {
    slug: "the-great-book-of-world-games",
    title: "The Great Book of World Games",
    subtitle:
      "56 Games from 4,600 Years of Human Play — Rules, Boards and Stories from 39 Cultures, Ready to Play Tonight",
    language: "en",
    pageCount: 160,
    categories: ["games-and-play"],
    authors: ["emre-dogan"],
    bisac: ["GAM002000", "REF000000", "HIS000000"],
    series: { name: "The Great Book of…", volume: 2 },
    description:
      "Fifty-six traditional games from thirty-nine cultures spanning some 4,600 years, arranged by mechanic rather than by region into seven families — Sowing Games, Hunt and Siege, Race Home, Line and Territory and others. Each entry gives sourced provenance, complete playable rules and a deterministic vector board diagram, and the seven rule sets that are scholarly reconstructions say so in the prose. The oldest game in it is the Royal Game of Ur, at 2600 BCE. It aims at the gap between academic game history, which is authoritative but unplayable, and the cheap family-games listicle.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(11.99),
        pageCount: 160,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Self-labelled 'hipotez' (hypothesis) in the project's own stats. Modelled royalty $7.19. EPUB 3 built, 948 KB, 50 SVG diagrams.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(22.99),
        pageCount: 160,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Hypothesis; recomputed at measured 160pp gives royalty ~$10.07.",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(34.99),
        pageCount: 160,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Hypothesis; royalty ~$12.62 at measured page count. Spine formula itself flagged as unverified pending a KDP template check.",
      },
    ],
    directSaleEligible: false,
    blockers: [
      "SCOPE INCOMPLETE: 56 of a locked 100 games written, 39 of 45 cultures. The project gate is deliberately held at phase1 and is described in its own docs as intentionally red.",
      "ZERO external playtesting. `01_SOURCE/playtests/` is empty; no game has been played by a human from the book's text alone. The subtitle promises 'Ready to Play Tonight' — that claim is currently unevidenced, which is why this title is marked not eligible for direct sale.",
      "Founder's AI declaration not made.",
      "One A+ content module (APLUS-05) has no artwork.",
    ],
  },

  {
    slug: "the-myth-hunters-field-book",
    title: "The Myth Hunter's Field Book",
    subtitle:
      "A Screen-Free Quest Through 22 Cultures — 120 Puzzles, Maps, Codes and Challenges for Ages 8–12",
    language: "en",
    pageCount: 156,
    categories: ["puzzle-and-challenge", "young-explorers"],
    authors: ["emre-dogan"],
    bisac: ["JNF001000", "JUV045000", "JNF025000"],
    series: null,
    description:
      "A screen-free activity book in which 120 puzzles across six world regions and twenty-two cultures are each built from something a people actually made. Children decode Younger Futhark and Inuktitut syllabics, count in Maya bars and dots, and trace the Red River delta. Answers are sourced to museums and archives rather than invented, and the quest is structured: six regional seals to earn and a completion certificate at the end. It is a book to be written in, which is why there is no ebook edition.",
    formats: [
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(14.99),
        pageCount: 156,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Modelled from measured 156pp (print $3.65, royalty $5.34). Never confirmed on Amazon's calculator. An A/B plan against $12.99 exists but has not run.",
      },
      {
        format: "ebook",
        availability: "unavailable",
        fulfillment: "direct",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Deliberately not produced. This is a write-in book; an e-reader edition would not work.",
      },
    ],
    directSaleEligible: false,
    blockers: [
      "Closest to market of the whole catalog: gate `release`, tag v1.0.0, preflight 61/61 green, interior + cover + A+ all built.",
      "Remaining work is four founder actions at the KDP panel: run Previewer, order and inspect a proof, make the AI-content declaration, upload.",
      "Accepted risk on record: ZERO child testing (`externalValidation = overridden-zero-sessions`, explicitly not 'passed'). The project config permanently refuses to claim a child tested this book.",
      "Accepted risk on record: interior art resolution floor lowered from 300 to 150 dpi by founder decision rather than regenerating assets.",
      "No ebook edition exists, so there is nothing to sell directly — this title is Amazon-print-only by design.",
    ],
  },

  {
    slug: "korean-hangul-handwriting-workbook",
    title: "Korean Hangul Handwriting Workbook",
    subtitle:
      "Learn to write all 40 letters with correct stroke order, build syllable blocks, and read your first 97 Korean words",
    language: "en",
    pageCount: 124,
    categories: ["language-and-learning"],
    authors: ["emre-dogan"],
    bisac: [],
    series: null,
    description:
      "A 124-page handwriting workbook for adult English-speaking learners starting Korean from the script up. Thirty lessons cover all 40 letters plus 16 single batchim through 122 numbered stroke-order diagrams, moving trace → dot-start → empty box, then into syllable-block mechanics and 97 dictionary-verified words with Revised Romanization. A provenance page states plainly that 28 of the 40 stroke sequences were transcribed from published diagrams and 12 derived from a rule.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: null,
        pageCount: 125,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "Price deliberately unset. The founder must choose within KDP's 2.99–9.99 70%-royalty band. Fixed-layout EPUB 3 built, 13.26 MB.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 124,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis:
          "FOUNDER-APPROVED (decision K43, 2026-08-29) — the only confirmed price in the catalog. Modelled royalty $5.31.",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(21.99),
        pageCount: 124,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "FOUNDER-APPROVED (K43, 2026-08-29). Modelled royalty $6.06.",
      },
    ],
    // Held back specifically on the licensing question below. This is not a
    // formatting gap; it is an unresolved right to sell.
    directSaleEligible: false,
    blockers: [
      "LEGAL — UNRESOLVED: an A7 review item flags a CC BY-NC licensed dictionary source (S-0019) used in a commercial book. Non-commercial licensing is incompatible with selling this title in any channel until cleared or the source is replaced. This blocks direct sale as much as it blocks KDP.",
      "Further A7 items: ownership terms of AI-generated cover art, and the KDP AI declaration.",
      "KDP Previewer never run.",
      "Cover art measures ~83 DPI true resolution; no higher-resolution source exists anywhere in the project.",
      "No real human usability test: the Phase 4 pilot used an AI proxy and returned REVISE; closed by founder override.",
      "No BISAC code assigned.",
    ],
  },

  {
    slug: "codex-enigmatica",
    title: "Codex Enigmatica",
    subtitle:
      "One Hundred Engraved Enigmas and a Single Unbroken Mystery — A Puzzle Book Bound as a Grimoire",
    language: "en",
    pageCount: 238,
    categories: ["puzzle-and-challenge"],
    authors: ["emre-dogan"],
    bisac: ["GAM014000"],
    series: { name: "Codex", volume: 3 },
    description:
      "One hundred engraved enigmas across five gates — The Threshold, The Menagerie, The Calendar, The Labyrinth, The Mirror — whose solutions converge on five sayings, and those five on a single word. That word is printed nowhere in the book. The reader enters it on a verification page whose address is printed on the last leaf, which levels case, spacing and punctuation before comparing. Built for the Cain's Jawbone and Journal 29 reader: 17 mechanism families, three tiers of hints, and self-referential puzzles in the final gate that bind to the book's own page count.",
    formats: [
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(29.99),
        pageCount: 238,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Hypothesis (royalty $9.49, print $8.51). Book is not finished.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(19.99),
        pageCount: 238,
        amazonAsin: null,
        masterFileKey: null,
        priceBasis: "Hypothesis (royalty $8.14, print $3.86). Book is not finished.",
      },
    ],
    directSaleEligible: false,
    blockers: [
      "IN PRODUCTION, NOT FINISHED: 101 puzzle drafts written, but 0 verified and 0 final. Project gate phase5.",
      "KILL GATE: HARD-STOP. Five external solvers identified, zero sessions recorded. The project's own docs call a zero-session pass 'not a pass but a gap'.",
      "The verification page this book depends on is live in this repository at /codex-enigmatica/verify — but the printed URL points at valicepress.com, and the project records `domainRegistered: false`. The domain must be registered and the site deployed there BEFORE any copy is printed, or every printed book ships with a dead address.",
    ],
  },
];

/**
 * Titles deliberately NOT loaded into the storefront, and why. Kept here so
 * the omission is a recorded decision rather than an oversight.
 */
export const EXCLUDED = [
  {
    title: "Before You Cut — Book 1: Measure & Diagnose",
    reason:
      "255-page interior exists but has no cover, no title page, no copyright page and no bibliography. Substantively: 0 of 43 fit signs and 0 of 129 cause claims are verified, and the series kill-gate fails by design on two hard stops (0/3 home sewers, 0/19 physical validations). Not a sellable product.",
  },
  {
    title: "Before You Cut — Books 2 and 3",
    reason: "Empty scaffolds — four and five files respectively, zero content.",
  },
  {
    title: "License & Launch: California Life & Health",
    reason:
      "Scaffolding only: 0 questions written, 0 manuscript words, 0 built files, no author name. Structurally unpublishable under its own architecture while decision K9 forbids hiring an SME and the SME kill-gate remains unpassable.",
  },
  {
    title:
      "Turkish web projects (tuzun-hafizasi, intikam-yemini, mendiran-vakayinamesi, solgun-kitabe, Fabl)",
    reason:
      "Web reader applications, not typeset books — no PDF or EPUB output exists for any of them. `tuzun-hafizasi` (63,541 words, v1.0 locked) is genuinely publication-grade prose and is the strongest future candidate, but would need a full typesetting pass first. All dormant since May–June 2026.",
  },
];
