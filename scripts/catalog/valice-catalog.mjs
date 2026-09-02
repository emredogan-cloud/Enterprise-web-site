/**
 * The Valice Press catalog, as source-controlled data.
 *
 * Every field here was read out of the book production repositories under
 * `MY-DİGİTAL-BOOK/`, out of the built PDFs themselves, or off the live KDP
 * bookshelf. Nothing is invented. Where a value could not be established it
 * is `null`, and null renders as absent rather than as a guess.
 *
 * ── WHAT CHANGED, AND WHY IT CHANGED EVERYTHING ──────────────────────────
 * The previous revision of this file opened by stating that no Valice Press
 * book was published on Amazon, and set every `amazonAsin` to null on that
 * basis. That was true when it was written. It is no longer true.
 *
 * Verified against the KDP bookshelf and Author Central on 2026-08-31:
 * SIX of the seven titles are live on Amazon across nineteen editions, each
 * with a real ASIN, and all nineteen `/dp/` URLs were fetched and returned
 * 200. Those ASINs are recorded below and are the reason "Buy on Amazon" can
 * finally render — it is now a real destination rather than a fabrication.
 *
 * The same check produced the constraint that shapes direct sale:
 * **Codex Mythologica's Kindle edition is enrolled in KDP Select.** Select is
 * an exclusivity agreement. While it stands, that book's digital edition may
 * not be sold anywhere else — including here. It is the one title whose
 * ebook is deliberately not for sale on this site, and the reason is not a
 * missing file or an unset price but a contract.
 *
 * The old file's inverse claim — "nothing is enrolled in KDP Select, because
 * nothing is on KDP at all" — is therefore now wrong in both halves. This is
 * exactly why publication state is re-derived from the source of truth each
 * phase rather than inherited from the last report.
 *
 * ── HOW THE THREE STATUSES DIFFER ────────────────────────────────────────
 * `websiteStatus`   whether valicepress.com lists the book at all.
 * `format.kdp`      what Amazon currently holds for that edition.
 * `directSale`      whether we may sell the digital edition ourselves.
 * They move independently. A book can be live on Amazon and unsellable here
 * (Codex Mythologica), or sellable here and not on Amazon at all.
 *
 * Prices on Amazon-fulfilled formats are the ACTUAL live list prices read off
 * KDP — not the modelled ones the previous revision carried. Several differed
 * by several dollars, and a storefront quoting a price Amazon does not charge
 * is worse than quoting none.
 */

/** Prices are in minor units (cents). */
const usd = (dollars) => Math.round(dollars * 100);

/** Amazon product URL for a verified ASIN. Never call this with a guess. */
const amazon = (asin) => `https://www.amazon.com/dp/${asin}`;

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
  {
    // Holds the public-domain line. One real title today (Meditations);
    // it exists because that book exists, not to pad the navigation.
    slug: "classics-and-philosophy",
    name: "Classics & Philosophy",
    description:
      "Public-domain works reset and typeset as reading editions, with the translation and source edition stated plainly.",
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
  {
    slug: "marcus-aurelius",
    name: "Marcus Aurelius",
    bio: "Roman emperor from 161 to 180 and a Stoic. The twelve books collected as Meditations were written in Greek, for himself, and were never intended to be read by anyone else.",
  },
  {
    slug: "henry-dudeney",
    name: "Henry E. Dudeney",
    // Facts from the MacTutor biography (University of St Andrews), read
    // 2026-09-02; see the book project's CLAIMS.jsonl C-001…C-011.
    bio: "English puzzle-maker (1857–1930). A Civil Service clerk from the age of thirteen, he wrote puzzles for The Strand Magazine for more than thirty years and published The Canterbury Puzzles (1907) and Amusements in Mathematics (1917). The Haberdasher's four-piece triangle and the spider and the fly are his.",
  },
];

/**
 * @typedef {Object} FormatSpec
 * @property {'ebook'|'paperback'|'hardcover'|'large_print'} format
 * @property {'available'|'coming_soon'|'unavailable'} availability
 * @property {'direct'|'amazon'} fulfillment
 * @property {number|null} priceCents
 * @property {number|null} pageCount
 * @property {string|null} amazonAsin   Verified on the KDP bookshelf only.
 * @property {string|null} amazonUrl    Derived from a verified ASIN only.
 * @property {'live'|'in_review'|'not_created'|'not_applicable'} kdp
 * @property {string|null} masterFileKey
 * @property {string} priceBasis  Why this number is what it is.
 */

export const BOOKS = [
  {
    // The one title that was already published and already selling — except
    // that it carried `pri_test_meditations_999`, a Paddle price id that
    // never existed, so its checkout failed at the till for the entire time
    // it has been live. It is entered here so that it stops being an orphan
    // row that nothing in source control describes.
    slug: "meditations",
    title: "Meditations",
    subtitle: "The George Long translation of 1862, newly typeset",
    language: "en",
    pageCount: 148,
    categories: ["classics-and-philosophy"],
    authors: ["marcus-aurelius"],
    bisac: ["PHI011000"],
    // Valice Classics is the public-domain, direct-first series described in
    // valice-house/series-bibles/valice-classics.md; Meditations was its
    // first edition and Dudeney (2026-09-02) its second.
    series: { name: "Valice Classics", volume: 1 },
    websiteStatus: "published",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1btwjzqvest52bwde6mqqam",
    onelinePromise:
      "A Roman emperor's private notebook, in the translation that carried it into English, set as a book to actually read.",
    description:
      "Twelve books of private notes, written in Greek by a Roman emperor who never meant them to be read. This edition uses George Long's 1862 translation — the version through which most English readers have met the text — set from Project Gutenberg's transcription of it (ebook #15877) and typeset fresh at 148 pages across 487 numbered sections. The Gutenberg apparatus, licence text and headers are stripped entirely; what remains is the translation and Valice Press's own front matter, which states the source and the translator rather than leaving a reader to guess which Meditations they have bought.",
    idealReader:
      "Anyone who wants Long's Meditations as a book rather than as a wall of scanned text, and who would rather be told exactly which translation and which source they are reading.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 148,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/meditations/master/v1/master.pdf",
        priceBasis:
          "The figure already on the published production row. Carried forward rather than re-decided — but see the blocker: it is high for a public-domain reprint whose original contribution is currently front matter alone.",
      },
    ],
    blockers: [
      "CHECKOUT WAS BROKEN. This book has been published and advertised while pointing at `pri_test_meditations_999`, a Paddle price that does not exist. A real price (pri_01m1btwjzqvest52bwde6mqqam, $9.99) now replaces it. Nobody lost a purchase — production has zero orders — but the store's only buyable title could not be bought.",
      "PRICING / DIFFERENTIATION: $9.99 is at the top of the range for a public-domain text whose original contribution is, today, typesetting and a source note. Long's translation is free on Gutenberg and on Kindle at $0.99. Either add the original matter that justifies the price (introduction, notes, apparatus) or reprice. See PUBLIC_DOMAIN_BATCH_1_PLAN.md — this is the same decision every Batch 1 title faces.",
      "No print edition exists. Digital only.",
    ],
  },

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
    websiteStatus: "published",
    // The exclusivity that decides this book's digital channel.
    kdpSelect: true,
    directSale: false,
    directSaleBlockedBy:
      "KDP Select exclusivity on the Kindle edition (verified 2026-08-31). " +
      "The digital edition may not be sold outside Amazon while enrolled. " +
      "Enrolment renews automatically — to sell it here, turn off auto-renew " +
      "in KDP and wait out the current 90-day term.",
    paddlePriceId: null,
    onelinePromise:
      "Seventy-six myths from nineteen civilizations, told at full length and left unsoftened.",
    description:
      "Seventy-six myths from nineteen civilizations, retold at full narrative length rather than summarised into paragraphs. Greek, Norse, Egyptian, Mesopotamian, Chinese, Turkic, Inuit, Polynesian and Mesoamerican traditions sit side by side, each story given roughly a thousand words and left unsoftened. The arrangement is comparative by design: cultures that never met asked the same questions in the same images — a grieving spouse in Egypt and a grieving mother in Greece, the rabbit a Chinese poet saw in the moon sitting also in the Mexican account.",
    idealReader:
      "Readers who want the myths themselves rather than a commentary on them, and who are as interested in what the Turkic and Inuit traditions did with a story as in what Greece did with it.",
    formats: [
      {
        format: "ebook",
        // Available — just not from us. Selling it here would breach Select,
        // but the Kindle edition is on sale today, so the honest row is a
        // link to it rather than "not yet available" about a book that is.
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(4.99),
        pageCount: 329,
        amazonAsin: "B0HD8121RR",
        amazonUrl: amazon("B0HD8121RR"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Kindle list price, read from the KDP bookshelf 2026-08-31.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(21.99),
        pageCount: 329,
        amazonAsin: "B0HCY8KY3X",
        amazonUrl: amazon("B0HCY8KY3X"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "Live Amazon list price 2026-08-31. The previous modelled figure ($18.99) was $3 low.",
      },
      {
        format: "hardcover",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(32.99),
        pageCount: 329,
        amazonAsin: "B0HDBFZRQ4",
        amazonUrl: amazon("B0HDBFZRQ4"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "large_print",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(27.99),
        pageCount: 578,
        // Amazon carries the large print run as its own title, not as a
        // format of the main one. One ASIN, its own listing.
        amazonAsin: "B0HDDR84MF",
        amazonUrl: amazon("B0HDDR84MF"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "Live Amazon list price 2026-08-31. Paperback only: 578pp exceeds KDP's 550pp hardcover maximum.",
      },
    ],
    blockers: [
      "KDP Select enrolment blocks direct ebook sale. This is the only thing standing between this title and the Valice Press store.",
      "Cover art native resolution ~112 PPI (101 PPI on the hardcover canvas) — below the 300 PPI print target, accepted at publication.",
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
    websiteStatus: "published",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1btjb037st1aew8mt990htv",
    onelinePromise:
      "A reference bestiary of 112 creatures, organised by what a creature does rather than where it is from.",
    description:
      "A reference bestiary of 112 creatures drawn from 40 folk traditions, organised by what a creature does rather than where it comes from. The Irish each-uisce, the Icelandic nykur, the Finnish näkki and the Filipino tikbalang share a chapter because they share a behaviour. Six classes — Guardians, Devourers, Shape-Changers, Water-Dwellers, Sky and Storm, Restless Dead — hold entries of roughly 675 words, each carrying two independent sources, a Thompson motif code, pronunciation, cross-references and a line-engraved plate, closing with four indexes.",
    idealReader:
      "Anyone who reaches for a bestiary to look something up rather than to read it straight through — folklorists, worldbuilders, game masters, and readers who want the source cited.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(12.99),
        pageCount: 435,
        amazonAsin: "B0HDLS4W8Q",
        amazonUrl: amazon("B0HDLS4W8Q"),
        kdp: "live",
        masterFileKey: "books/codex-bestiarium/master/v1/master.pdf",
        priceBasis:
          "Matched to the live Kindle list price ($12.99, KDP 2026-08-31). Not in KDP Select, so direct sale is permitted.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(24.99),
        pageCount: 435,
        amazonAsin: "B0HDLQHQ7H",
        amazonUrl: amazon("B0HDLQHQ7H"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "hardcover",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(37.99),
        pageCount: 435,
        amazonAsin: "B0HDLLPG5M",
        amazonUrl: amazon("B0HDLLPG5M"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "large_print",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(29.99),
        pageCount: 599,
        amazonAsin: "B0HDLT1V3P",
        amazonUrl: amazon("B0HDLT1V3P"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "Live Amazon list price 2026-08-31. Listed on Amazon as its own title; paperback only.",
      },
    ],
    blockers: [
      "LISTING ERROR ON AMAZON: all four live listings are titled '120 Legendary Creatures'. The book contains 112 — confirmed by the build reports (`entries: 112`, 112 plates measured and accepted) and by the PDF's own metadata. The listing overstates the contents by eight entries and should be corrected in KDP.",
      "White-paper cover variants are defective (spine band overflows 1.10mm paperback / 0.41mm hardcover). Cream stock is correct and is the stock that was published.",
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
    websiteStatus: "published",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1btjddes1p637hd78zsvczx",
    onelinePromise:
      "Forty-five myths for ages 8–12, from twenty-two traditions — and no more than three of them Greek.",
    description:
      "Forty-five myths retold for readers aged 8 to 12, drawn from twenty-two traditions — Korean, Inuit, Māori, Hawaiian, Yoruba, Akan, Persian, Turkic, Greek, Norse, Irish, Finnish, Egyptian, Mesopotamian, Japanese, Chinese, Vietnamese, Hindu, Maya, Aztec, Andean and Zulu. It is built against the roughly eighty-percent-Greek children's mythology shelf: no culture gets more than four stories and Greece gets no more than three. Each story runs 900–1,000 words with one black-and-white illustration, and the back matter carries a hand-drawn world map, per-culture cards, a sourced pronunciation guide and a Who's Who. Australian Aboriginal material is deliberately excluded, and the book says so.",
    idealReader:
      "A confident 8–12 year old reader, and the parent or teacher who has noticed that most children's mythology is Greek mythology with a wider title.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(4.99),
        pageCount: 234,
        amazonAsin: "B0HDQRPKST",
        amazonUrl: amazon("B0HDQRPKST"),
        kdp: "live",
        masterFileKey: "books/the-great-book-of-world-myths/master/v1/master.pdf",
        priceBasis:
          "Matched to the live Kindle list price ($4.99, KDP 2026-08-31). Not in KDP Select.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(14.99),
        pageCount: 234,
        amazonAsin: "B0HDTL5V2H",
        amazonUrl: amazon("B0HDTL5V2H"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "Live Amazon list price 2026-08-31. The previous modelled figure ($16.99) was $2 high.",
      },
      {
        format: "hardcover",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(26.99),
        pageCount: 234,
        amazonAsin: "B0HDZJ4PHQ",
        amazonUrl: amazon("B0HDZJ4PHQ"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "large_print",
        availability: "unavailable",
        fulfillment: "amazon",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_applicable",
        masterFileKey: null,
        priceBasis: "Large print deliberately disabled by project decision K6/A6.",
      },
    ],
    blockers: [
      "Founder's KDP AI-content declaration: made at upload (the book is live), but not recorded anywhere in the project files. Record it for the audit trail.",
      "Cover art effective resolution 115/106 dpi.",
      "The two-parent-readings validation gate was closed by founder attestation only, with no per-reader log. The book makes no claim that depends on it.",
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
    websiteStatus: "published",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1btjcqgabh6v8rsxg85frxr",
    onelinePromise:
      "Fifty-six traditional games with complete rules and boards — arranged by how they play, not where they came from.",
    description:
      "Fifty-six traditional games from thirty-nine cultures spanning some 4,600 years, arranged by mechanic rather than by region into seven families — Sowing Games, Hunt and Siege, Race Home, Line and Territory and others. Each entry gives sourced provenance, complete playable rules and a deterministic vector board diagram, and the seven rule sets that are scholarly reconstructions say so in the prose. The oldest game in it is the Royal Game of Ur, at 2600 BCE. It aims at the gap between academic game history, which is authoritative but unplayable, and the cheap family-games listicle.",
    idealReader:
      "Someone who wants to actually play a 4,000-year-old game tonight, and wants to know which parts of the rules are attested and which are reconstruction.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(11.99),
        pageCount: 160,
        amazonAsin: "B0HG44FH1B",
        amazonUrl: amazon("B0HG44FH1B"),
        kdp: "live",
        masterFileKey: "books/the-great-book-of-world-games/master/v1/master.pdf",
        priceBasis:
          "Matched to the live Kindle list price ($11.99, KDP 2026-08-31). Not in KDP Select.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(22.99),
        pageCount: 160,
        amazonAsin: "B0HG3KMK9L",
        amazonUrl: amazon("B0HG3KMK9L"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "hardcover",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(34.99),
        pageCount: 160,
        amazonAsin: "B0HG41F21F",
        amazonUrl: amazon("B0HG41F21F"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        // Built 2026-09-02 (Phase 2 v3 pilot): 16 pt body, 232 pp, KDP
        // preflight green — 08_OUTPUT/LARGEPRINT in the book project. Not
        // uploaded; the Founder uploads and the ASIN lands here when live.
        format: "large_print",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(31.99),
        pageCount: 232,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-02 — 232 pp large trim B&W prints at $4.94; $31.99 nets $14.25 (44.5%), $3 under the hardcover. Founder may move it at Gate 8. See 06_REPORTS/LARGEPRINT_BUILD_REPORT.md.",
      },
    ],
    blockers: [
      "The subtitle promises 'Ready to Play Tonight' and `01_SOURCE/playtests/` is empty — no game in this book has been played by a human from the book's text alone. The book is nonetheless live on Amazon and selling; the claim is the founder's to stand behind. Running even a handful of playtests is the single highest-value thing that could be done for this title.",
      "Scope: 56 games written against a locked target of 100, and 39 cultures of 45. The published book does not claim 100, so this is a roadmap gap rather than a misstatement.",
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
    websiteStatus: "published",
    kdpSelect: false,
    directSale: false,
    directSaleBlockedBy:
      "No digital edition exists, by design. This is a write-in activity book; " +
      "the puzzles are solved on the page. An ebook of it would not work.",
    paddlePriceId: null,
    onelinePromise:
      "One hundred and twenty puzzles for ages 8–12, each built from something a real culture actually made.",
    description:
      "A screen-free activity book in which 120 puzzles across six world regions and twenty-two cultures are each built from something a people actually made. Children decode Younger Futhark and Inuktitut syllabics, count in Maya bars and dots, and trace the Red River delta. Answers are sourced to museums and archives rather than invented, and the quest is structured: six regional seals to earn and a completion certificate at the end. It is a book to be written in, which is why there is no ebook edition.",
    idealReader:
      "An 8–12 year old who has finished the puzzle books that repeat themselves, and an adult looking for a screen-free hour that teaches something real.",
    formats: [
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(14.99),
        pageCount: 156,
        amazonAsin: "B0HFP4KYX5",
        amazonUrl: amazon("B0HFP4KYX5"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "ebook",
        availability: "unavailable",
        fulfillment: "direct",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "Deliberately not produced. This is a write-in book; an e-reader edition would not work.",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: null,
        pageCount: 156,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "Not created on KDP. No price, because no price has been set — a hardcover of a write-in book is a real question, not a formality.",
      },
    ],
    blockers: [
      "Accepted risk on record: ZERO child testing (`externalValidation = overridden-zero-sessions`, explicitly not 'passed'). The project config permanently refuses to claim a child tested this book. It is live on Amazon regardless.",
      "Accepted risk on record: interior art resolution floor lowered from 300 to 150 dpi by founder decision rather than regenerating assets.",
      "The PDF carries no title or author metadata ('untitled' / 'anonymous'). Cosmetic, but it is what a library catalogue reads.",
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
    // Held back from the storefront until the Founder signs Gate 2 on the
    // remediated rights ledger. The rights problem itself was fixed on
    // 2026-09-02 (book project RIGHTS.md, decision K46): the CC BY-SA
    // dictionaries and the CC BY-NC phonetic chart were withdrawn, every word
    // re-verified against the National Institute of Korean Language's
    // learner vocabulary list (KOGL Type 1), every gloss rewritten, and the
    // paperback, hardcover and Kindle files rebuilt (09_OUTPUT/FINAL).
    websiteStatus: "draft",
    kdpSelect: false,
    directSale: false,
    directSaleBlockedBy:
      "GATE 2 PENDING: the rights remediation of 2026-09-02 (RIGHTS.md, K46) " +
      "replaced the CC BY-SA / CC BY-NC sources with a KOGL Type 1 word list " +
      "and a public-domain phonetics source; the Founder has not yet signed " +
      "the ledger (book_metadata.json → legal.a7_status is still " +
      "LEGAL_REVIEW_REQUIRED, now only for cover-art rights and the KDP AI " +
      "declaration). No direct sale until that signature.",
    paddlePriceId: null,
    onelinePromise:
      "Thirty lessons that take an adult beginner from nothing to writing all 40 Hangul letters in the correct stroke order.",
    description:
      "A 124-page handwriting workbook for adult English-speaking learners starting Korean from the script up. Thirty lessons cover all 40 letters plus 16 single batchim through 122 numbered stroke-order diagrams, moving trace → dot-start → empty box, then into syllable-block mechanics and 97 practice words with Revised Romanization, every one checked against the National Institute of Korean Language's learner vocabulary list. A provenance page states plainly that 28 of the 40 stroke sequences were transcribed from published diagrams and 12 derived from a rule.",
    idealReader:
      "An adult beginner who wants to learn to write Hangul by hand before learning to speak, and who would rather know where a stroke order came from than be told to trust it.",
    formats: [
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 124,
        amazonAsin: null,
        amazonUrl: null,
        // Submitted to KDP and awaiting review as of 2026-08-31. No ASIN is
        // issued until a title goes live, so there is nothing to link to.
        kdp: "in_review",
        masterFileKey: null,
        priceBasis:
          "FOUNDER-APPROVED (decision K43, 2026-08-29) and submitted to KDP at this price.",
      },
      {
        format: "hardcover",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(21.99),
        pageCount: 124,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "in_review",
        masterFileKey: null,
        priceBasis: "FOUNDER-APPROVED (K43, 2026-08-29) and submitted to KDP at this price.",
      },
      {
        format: "ebook",
        availability: "unavailable",
        fulfillment: "direct",
        priceCents: null,
        pageCount: 125,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "Not priced until the Founder signs Gate 2 (2026-09-02 remediation). The fixed-layout EPUB 3 was rebuilt on 2026-09-02 (13.4 MB) from the remediated content; it is a reference edition, not a reflowable one.",
      },
    ],
    blockers: [
      "GATE 2 — the rights remediation of 2026-09-02 (book project RIGHTS.md, DECISIONS.md K46) withdrew the CC BY-SA dictionaries and the CC BY-NC phonetic chart and re-verified all 97 words against the National Institute of Korean Language's learner list (KOGL Type 1). The Founder must sign the ledger (legal.a7_status) before any sale.",
      "KDP — the paperback and hardcover IN REVIEW at KDP are the pre-remediation files. The rebuilt interiors are in 09_OUTPUT/FINAL; the Founder must replace the files (or withdraw and resubmit) before the listings go live.",
      "Remaining A7 items (Founder): ownership terms of the AI-generated cover art, and the KDP AI declaration.",
      "Cover art measures ~83 DPI true resolution; no higher-resolution source exists anywhere in the project.",
      "No real human usability test: the Phase 4 pilot used an AI proxy and returned REVISE; closed by founder override.",
      "No BISAC code assigned.",
    ],
  },

  {
    // Valice Classics 2 — built 2026-09-02 (Phase 2 v3 pilot). Everything a
    // direct sale needs is staged (Paddle price, R2 master, previews, cover,
    // companion); the switch to "published" is the Founder's Gate 12 call
    // after Gate 2 (rights) and Gate 8 (price) sign-off. Facts below come
    // from the book project's QA/interior-main.json and CLAIMS.jsonl.
    slug: "the-puzzles-of-henry-dudeney",
    title: "The Puzzles of Henry Dudeney",
    subtitle:
      "110 Classic Problems from Amusements in Mathematics and The Canterbury Puzzles — Annotated, with Hints, a Glossary of Old Money and a Chronology",
    language: "en",
    pageCount: 144,
    categories: ["puzzle-and-challenge", "classics-and-philosophy"],
    authors: ["henry-dudeney", "emre-dogan"],
    bisac: ["GAM007000", "MAT025000"],
    series: { name: "Valice Classics", volume: 2 },
    websiteStatus: "draft",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: null,
    onelinePromise:
      "Dudeney's best puzzles in his own words, with a hint for every one, a difficulty mark, and the old money explained.",
    description:
      "One hundred and ten puzzles chosen from the five hundred and forty-four in Dudeney's two great books, arranged in seven parts by kind — money and markets, ages and clocks, digits and magic squares, cutting and fitting, counters and routes, combinations and the chessboard, and the tales of the Canterbury pilgrims. Every statement and every solution is Dudeney's own text from the 1907 and 1917 editions, with the original figures. Added: a 2,000-word introduction, an editor's hint for every puzzle that says where to look without giving the answer, a difficulty mark, editor's notes on the famous ones, a glossary of pounds, shillings and pence, a chronology of Dudeney's life, and a concordance back to the original numbering. 144 pages, 6 × 9 in.",
    idealReader:
      "Someone who has met the Haberdasher's puzzle or the spider and the fly and wants the rest, with enough help to finish and enough honesty to know what is Dudeney's and what is ours.",
    formats: [
      {
        format: "ebook",
        // Flipped to "available" by the Founder at Gate 12; the Paddle price
        // id is pasted here from provision-paddle.mjs at the same time.
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 144,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/the-puzzles-of-henry-dudeney/master/v1/master.pdf",
        priceBasis:
          "price-engine.mjs 2026-09-02, direct ebook: $9.99 nets $8.99 after Paddle (90%); the Valice Classics bible allows $7.99–9.99 and this edition carries a 28% original apparatus (QA/interior-main.json editorShare 0.279).",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(14.99),
        pageCount: 144,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-02, 144 pp 6×9 B&W public domain: prints at $2.73; $12.99 nets $5.07 (39%), $14.99 nets $6.27 (41.8%), $16.99 nets $7.47. $14.99 proposed for a 144-page annotated edition; Founder decides at Gate 8. Interior and full-wrap cover are built (OUTPUT/interior-main.pdf, OUTPUT/cover-paperback.pdf).",
      },
    ],
    blockers: [
      "Founder Gate 2: rights ledger RL-0024–RL-0026 (work public domain; Gutenberg transcriptions; original apparatus) awaits signature.",
      "Founder Gate 8/12: list prices and the switch to published. The direct ebook is fully staged; paperback upload to KDP is a Founder action.",
      "CLAIMS.jsonl C-014 (the 2014 Frame–Stewart proof) is UNVERIFIED and must be confirmed or cut before Gate 5.",
      "No Kindle edition planned for launch: public-domain titles are capped at 35% on KDP and the Kindle catalogue already carries free Dudeney texts.",
    ],
  },

  {
    slug: "codex-enigmatica",
    title: "Codex Enigmatica",
    subtitle:
      "One Hundred Engraved Enigmas and a Single Unbroken Mystery — A Puzzle Book Bound as a Grimoire",
    language: "en",
    pageCount: 274,
    categories: ["puzzle-and-challenge"],
    authors: ["emre-dogan"],
    bisac: ["GAM014000"],
    series: { name: "Codex", volume: 3 },
    websiteStatus: "published",
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1btjc0bp4phgs7vrqhq4g18",
    onelinePromise:
      "One hundred enigmas across five gates, converging on a single word that is printed nowhere in the book.",
    description:
      "One hundred engraved enigmas across five gates — The Threshold, The Menagerie, The Calendar, The Labyrinth, The Mirror — whose solutions converge on five sayings, and those five on a single word. That word is printed nowhere in the book. The reader enters it on a verification page whose address is printed on the last leaf, which levels case, spacing and punctuation before comparing. Built for the Cain's Jawbone and Journal 29 reader: 17 mechanism families, three tiers of hints, and self-referential puzzles in the final gate that bind to the book's own page count.",
    idealReader:
      "The reader who finished Cain's Jawbone or Journal 29 and wants the next one — and who would rather a puzzle book withhold its answer than print it upside down at the back.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 274,
        amazonAsin: "B0HGRZ3BRC",
        amazonUrl: amazon("B0HGRZ3BRC"),
        kdp: "live",
        masterFileKey: "books/codex-enigmatica/master/v1/master.pdf",
        priceBasis:
          "Matched to the live Kindle list price ($9.99, KDP 2026-08-31). Not in KDP Select.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(19.99),
        pageCount: 274,
        amazonAsin: "B0HGSVF15Q",
        amazonUrl: amazon("B0HGSVF15Q"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
      {
        format: "hardcover",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(29.99),
        pageCount: 274,
        amazonAsin: "B0HH3B4HQ7",
        amazonUrl: amazon("B0HH3B4HQ7"),
        kdp: "live",
        masterFileKey: null,
        priceBasis: "Live Amazon list price 2026-08-31 — matches the modelled figure.",
      },
    ],
    blockers: [
      "⚠ SHIPPING NOW WITH A DEAD ADDRESS. The paperback and hardcover went live on Amazon on 2026-08-27 and 2026-08-29. The last leaf directs the reader to valicepress.com/codex-enigmatica/verify to check the final answer. `valicepress.com` does not resolve — no DNS record exists. Every copy Amazon ships today carries an address that goes nowhere, and the book's central mechanic is unresolvable for that buyer. The page itself works, at the deployment hostname. This is now a live customer-facing failure rather than a pre-print risk, and registering the domain is the entire fix.",
      "The page count in the previous catalog revision (238) was wrong; the built interior is 274pp. Corrected from the PDF.",
      "The project's own kill gate (five external solvers, zero sessions recorded) was never passed. The book was published regardless. No puzzle in it has been solved by anyone other than its author.",
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
