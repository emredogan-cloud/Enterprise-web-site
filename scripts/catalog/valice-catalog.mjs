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
/**
 * The plain product URL for a verified ASIN.
 *
 * AMAZON ATTRIBUTION. To measure how many of our own visitors go on to buy on
 * Amazon, replace this call on a single format with the tracking URL that
 * Amazon Attribution generates — `attributionUrl: "https://www.amazon.com/dp/…?maas=…"`
 * pasted whole, never assembled by hand, because the tag is signed. The
 * storefront already prefers `amazonUrl` over the ASIN fallback
 * (`src/components/book-detail/format-table.tsx` → `amazonHref`), so a pasted
 * URL takes effect on the next catalogue load with no code change. Keep the
 * ASIN in `amazonAsin` either way: it is what `verify-amazon.mjs` checks the
 * listing against, and a tracking URL that silently points at the wrong book
 * is exactly the failure this catalogue exists to prevent.
 */
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
    // Supplied verbatim by the Founder on 2026-09-02 and canonical from that
    // date. It is the only biography of him this repository may print: it
    // stays word-for-word wherever the full text fits, and where a provider
    // caps the field (Amazon Author Central, KDP), the shortened variant that
    // was actually used is recorded in docs/execution/phase-3/AUTHOR_BIO.md
    // rather than improvised at the point of use. Do not add credentials.
    bio: "Emre Doğan writes about the stories that cultures tell themselves in order to keep going.\n\nTrained as a software engineer, he came to mythology the way most people do — through a single story that would not leave him alone — and stayed for the pattern underneath. CODEX MYTHOLOGICA, his first book, gathers seventy-six myths from nineteen traditions and retells each one in full.\n\nHe reads in several languages, badly, and is grateful daily to the translators and ethnographers whose patient work made a book like this possible for someone who is neither.\n\nHe lives in Turkey.",
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
 * @property {string|null} [epubFileKey]  R2 key of the EPUB master, when the
 *   edition ships one. Absent or null means the buyer gets the PDF only, and
 *   the storefront must then say nothing about EPUB.
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_at_next_kdp_revision", why: "All three editions now carry a dedicated companion page (p. 330 / p. 330 / p. 579), and all three covers were rebuilt for the new page counts on 2026-09-03 — the files are finished and verified. They are held, not unfinished: KDP Select runs to 2026-11-03, and on that date the interiors are reopened anyway so the ebook can be sold here. Pulling three live editions through a review cycle before then buys nothing. Packages: docs/execution/phase-5/kdp-packages/codex-mythologica/." },
    // The exclusivity that decides this book's digital channel.
    kdpSelect: true,
    directSale: false,
    // Now a dated blocker rather than an open-ended one. The KDP promotion
    // manager, read 2026-09-02, states the term exactly: enrolled, started
    // 6 August 2026, **ends 3 November 2026**, auto-renew already unticked by
    // the Founder. Cancelling auto-renew does not end the current term — the
    // exclusivity runs to the end date and not a day earlier. So this is not
    // waiting on anybody; it is waiting on a calendar.
    directSaleBlockedBy:
      "KDP Select exclusivity on the Kindle edition. Term 2026-08-06 → " +
      "2026-11-03 (KDP promotion manager, read 2026-09-02); auto-renew is off, " +
      "so it lapses on that date and does not repeat. The digital edition may " +
      "not be sold outside Amazon before 2026-11-03. Nothing to do until then.",
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
        priceCents: usd(6.99),
        pageCount: 329,
        amazonAsin: "B0HD8121RR",
        amazonUrl: amazon("B0HD8121RR"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "$4.99 → $6.99, the Founder's change of 2026-09-02. Confirmed twice: the KDP bookshelf shows $6.99 USD, and the live format strip on the Amazon page now reads $6.99 (verify-amazon.mjs, 2026-09-02 evening). It read $4.99 that afternoon — KDP price changes take up to 72 hours to propagate, and the catalogue follows the shelf, not the dashboard.",
      },
      {
        format: "paperback",
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(21.99),
        pageCount: 329,
        pendingPageCount: 330,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
        pendingPageCount: 330,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
        pendingPageCount: 579,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_at_next_kdp_revision", why: "All three editions now carry a dedicated companion page (p. 436 / p. 436 / p. 600) and all three covers were rebuilt for the new page counts on 2026-09-03. Held for one reason: the four listings still claim '120 Legendary Creatures' where the book has 112 (handbook O4), and that correction needs a KDP visit for every edition. One review cycle, both jobs. Packages: docs/execution/phase-5/kdp-packages/codex-bestiarium/." },
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
        pendingPageCount: 436,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
        pendingPageCount: 436,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
        pendingPageCount: 600,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03: the half-page 'THE MAP, FULL SIZE' note on p. 233 — a one-inch code low on the page with a caption beside it — is now a dedicated companion page carrying a 2.1-inch code at 24 % of the page height. Still 234 pages, so the covers at KDP stay exactly valid. Interior swap only, both formats." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    // Replaced 2026-09-02 when the price moved $4.99 → $6.99. The old id
    // pri_01m1btjddes1p637hd78zsvczx is archived in Paddle, not deleted:
    // existing transactions must keep resolving to what was actually paid.
    paddlePriceId: "pri_01m1hjdhhvq98v2pdxxenh8q1z",
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
        priceCents: usd(6.99),
        pageCount: 234,
        amazonAsin: "B0HDQRPKST",
        amazonUrl: amazon("B0HDQRPKST"),
        kdp: "live",
        masterFileKey: "books/the-great-book-of-world-myths/master/v1/master.pdf",
        priceBasis:
          "$4.99 → $6.99 on 2026-09-02, following the Kindle edition. The Founder moved the Kindle list to $6.99 (KDP bookshelf, and the live format strip agrees); the house rule is that a direct price matches the Kindle list to the cent, so the direct price follows. This is the Phase 3 'scenario C' outcome arriving for free: $6.99 direct nets $6.14 against $4.24 at $4.99 — 45% more per copy — while staying at parity with Amazon, so it invites no price-matching and raises no question about why the publisher's own shop costs more.",
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03: the weak note of 09-02 — a text block at the top of an otherwise empty p. 160, with no code at all — is now a dedicated companion page with a 2.9-inch code. Still 160 pages, covers untouched. The large print is in KDP review; its invented author biography was corrected on p. 4 (page-neutral) and its companion page is built, but its cover cannot be rebuilt here — see the hold in companion-page-spec.mjs." },
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
        // preflight green — 08_OUTPUT/LARGEPRINT in the book project.
        // Uploaded by the Founder on 2026-09-02 and in KDP review since; not
        // on the shelf as of 2026-09-03 (author-wide Amazon search). The ASIN
        // lands here only when the listing is live, never before.
        format: "large_print",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(31.99),
        pageCount: 232,
        pendingPageCount: 233,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
        amazonAsin: null,
        amazonUrl: null,
        kdp: "in_review",
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03. The interior ended on two identical ruled 'Field Notes' pages; the second is now the companion page, so the reader keeps a notes page and gains a destination — 156 pages before, 156 after, cover untouched. The same pass set the PDF title and author, which had shipped as 'untitled / anonymous'." },
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
    // ── THE GREEK ALPHABET HANDWRITING WORKBOOK ────────────────────────────
    // Valice Script 2. Written, typeset, illustrated and validated on
    // 2026-09-04 from an empty scaffold. Nothing here is a plan: every number
    // below was measured off a built file on that date.
    //
    // The differentiator is the one thing every competing Greek alphabet
    // workbook leaves out. Greek has NO official stroke-order standard — a
    // 1998 study of 756 Greek schoolchildren recorded thirty-one different
    // ways of writing capital Δ — so this book prints, letter by letter,
    // whether its order was transcribed from a published Greek handwriting
    // reference, taken from the Latin letter the reader already writes, or
    // derived by a stated rule. That page is the product.
    slug: "greek-alphabet-handwriting-workbook",
    title: "The Greek Alphabet Handwriting Workbook",
    subtitle:
      "Write all 24 letters in the modern and the classical forms, with a sourced stroke order for every one",
    language: "en",
    pageCount: 100,
    categories: ["language-and-learning"],
    authors: ["emre-dogan"],
    bisac: ["FOR010000"],
    series: null,
    // PUBLISHED 2026-09-04. The condition was that a published page must be a
    // page a reader can act on, and it now is: the direct ebook is buyable
    // here against a live Paddle price, with both master files in R2.
    //
    // The earlier note said the price "cannot be created from this machine".
    // That was the observed behaviour and the wrong diagnosis: `.env` carries
    // TWO PADDLE_API_KEY lines and the second, live one is written with a
    // space before the `=`, so every loader's ^([A-Z0-9_]+)=(.*)$ skipped it
    // and a stale sandbox key won. The live key works.
    websiteStatus: "published",
    linkageDecision: {
      decision: "rebuild_now",
      why: "Built new on 2026-09-04 with the companion page in the typesetting rather than spliced on afterwards: page 99 is a dedicated leaf carrying a code at 30 % of the usable page height and valicepress.com/companion/greek beneath it. Nothing to retrofit.",
    },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    // Created against the LIVE Paddle account on 2026-09-04 by
    // provision-paddle.mjs and read back from the API: active, one-time,
    // 699 USD, custom_data.valice_slug matching this row.
    paddlePriceId: "pri_01m1pmtds9p93zm735432kv98x",
    onelinePromise:
      "Thirty-two lessons that take an adult from nothing to writing all 24 Greek letters, in both the modern and the classical forms, with a sourced stroke order for each.",
    description:
      "A 100-page handwriting workbook for adult English speakers learning to write Greek — the forms you will meet in Athens today and the ones you will meet in a Loeb. Thirty-two lessons cover all 24 letters in both cases, the final sigma, three variant letterforms a reader meets in print and the lunate sigma they meet on stone, and every accent in both the monotonic and the polytonic systems \u2014 53 stroke diagrams in all, 33 of them numbered. Each lesson is a spread: the left page shows the letter with a start dot and a numbered arrow for every stroke, then the same letter again for each stroke with the marks building up in order; the right page is ruled practice that moves trace \u2192 dot-start \u2192 free and, from Lesson 9 on, finishes on a real Greek word. Every letter also carries what it sounds like now and what it sounded like in the fifth century BC. A provenance page states plainly that Greek has no official stroke-order standard, cites the study of 756 schoolchildren that recorded up to thirty-one ways of writing one letter, and labels every sequence in the book with where it came from.",
    idealReader:
      "An adult beginner who wants to write Greek by hand before speaking it \u2014 for Modern Greek, for reading Attic or Koine, or because the names on the mythology shelf are worth reading in their own alphabet \u2014 and who would rather be told that a stroke order is recommended than be told to trust it.",
    formats: [
      {
        format: "paperback",
        // Built 2026-09-04 and preflighted; not yet uploaded. No ASIN is
        // invented while that is true.
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 100,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04 at the MEASURED 100 pages, 8.5 \u00d7 11 large trim, B&W, white: printing $2.84, KDP minimum list $4.74. $12.99 nets $4.95 (38.1 %), inside the Valice Script band of $12.99\u201314.99 and matched to the Hangul volume so the series does not price two comparable workbooks differently.",
      },
      {
        format: "hardcover",
        // NOT PRODUCED. KDP hardcover requires 75 pages minimum, which this
        // book clears at 100 \u2014 but the economics do not: see priceBasis.
        availability: "unavailable",
        fulfillment: "amazon",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "NOT PRODUCED. price-engine.mjs at 100 pp hardcover: a $19.99 list nets about 21 %, under the 35 % house floor, and a workbook is a consumable a reader writes in and finishes \u2014 the format a buyer wants for it is the cheap one they can replace. Revisit only if the paperback proves an audience.",
      },
      {
        format: "large_print",
        availability: "unavailable",
        fulfillment: "amazon",
        priceCents: null,
        pageCount: null,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "NOT PRODUCED \u2014 DUPLICATIVE. The book is already an 8.5 \u00d7 11 large trim with 44-point exemplars and four-line rules; a large-print edition of it would be the same book at the same size. Series bible; DECISIONS.md K4.",
      },
      {
        format: "ebook",
        // Two files, one purchase, and neither of them is "the workbook as
        // an ebook" \u2014 a workbook's value is the empty box, and an empty box
        // cannot be written in on a screen. The PDF is the workbook you can
        // reprint; the EPUB is the reference the screen is better at.
        //
        // AVAILABLE 2026-09-04: the price exists, is active, and was read back
        // from api.paddle.com before this line was changed.
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(6.99),
        pageCount: 100,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        // The print interior itself, screen-normalised \u2014 for a workbook that
        // is not a degraded paperback but the format that lets a reader print
        // page 31 again instead of writing in their only copy.
        masterFileKey: "books/greek-alphabet-handwriting-workbook/master/v1/master.pdf",
        // The second delivered file: the reflowable reference edition.
        epubFileKey: "books/greek-alphabet-handwriting-workbook/master/v1/master.epub",
        priceBasis:
          "$6.99 direct, netting $6.14 after Paddle (5 % + $0.50) = 87.8 %. Comparison set inside this catalogue: World Myths $6.99, Dudeney $9.99, Enigmatica $9.99, World Games $11.99, Bestiarium $12.99. Not matched to a Kindle price, because there is no Kindle edition to match. Two files for the one price \u2014 the 100-page workbook as a printable PDF and a 36-chapter reflowable reference with 77 vector diagrams \u2014 set at the foot of the range because it sits beside a $12.99 print book and the pair should cost under $20. EPUBCheck 5.1.0 on the EPUB: 0 fatals, 0 errors, 0 warnings.",
      },
      // NO `kindle` ROW. The decision not to make one is real and is recorded
      // in the project's DECISIONS.md (K5, K9) and project_config.json, which
      // is where a decision belongs. It was briefly written here as a format
      // row with availability "unavailable", and that broke the production
      // loader: `book_format` is a Postgres enum of ebook | paperback |
      // hardcover | large_print, so even the DELETE the loader runs for an
      // unavailable edition failed its enum cast. A catalogue format row is
      // for an edition the storefront reasons about, not for a note.
    ],
    blockers: [
      "COVER \u2014 the Founder supplied new artwork on 2026-09-04 and it is HELD, not live: its scroll prints a Greek alphabet with wrong letterforms (row 3 reads \u039d \u0395 \u039f \u03a0 \u03a1 \u03a3 for \u039d \u039e \u039f \u03a0 \u03a1 \u03a3, and \u0394 is an open \u039b with a detached bar). The artwork is upscaled, placed, preflighted and waiting at ASSETS/cover/front-ART-PENDING-GREEK-FIX.png; the vector cover stays canonical until corrected art arrives. See ASSETS/cover/README-COVERS.md.",
      "PADDLE TAX CATEGORY \u2014 the product was created as `standard` because this Paddle account is not approved for the `ebooks` category. That over-collects VAT where books are taxed at a reduced rate. Same pending request as the other six products.",
      "KDP UPLOAD \u2014 the paperback interior and cover are built, preflighted and packaged, but only the account holder can upload them. See OUTPUT/KDP/KDP_UPLOAD_GUIDE.html.",
      "AI DECLARATION \u2014 the manuscript text and the diagrams were produced by an AI agent; the fact is recorded in project_config.json \u2192 compliance.aiDisclosure with its evidence. Only the account holder can enter that declaration on the KDP form.",
      "ISBN \u2014 none assigned; the copyright page prints PENDING \u2014 KDP-PROVIDED ISBN until one is.",
      "NO PHYSICAL PROOF \u2014 first print of this interior and this cover. A proof copy is recommended before publishing.",
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
    // Published on 2026-09-02, after the paperback was found LIVE on Amazon
    // (B0HHHWXGG4, $12.99, 124 pp). The page links to a listing that already
    // sells to the public; withholding our own page does not withhold the
    // book, it only costs the sale. The rights remediation is complete in the
    // files (book project RIGHTS.md, decision K46): the CC BY-SA dictionaries
    // and the CC BY-NC phonetic chart were withdrawn, every word re-verified
    // against the National Institute of Korean Language's learner vocabulary
    // list (KOGL Type 1), every gloss rewritten, and the paperback, hardcover
    // and Kindle files rebuilt (09_OUTPUT/FINAL). What Gate 2 still gates is
    // the DIRECT sale — see directSaleBlockedBy; the ebook stays unavailable.
    websiteStatus: "published",
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03. The companion was a grey box at the foot of p. 122, the fourth thing on that page; it is now a dedicated page 125 with a 2.85-inch code. This is the one book where the page count had to move — 124 → 126 — because nothing on the closing pages could be given up. The paperback cover was rebuilt for the new spine (0.2792 → 0.2838 in); the hardcover wrap is a KDP-Cover-Calculator value only the account holder can re-run." },
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
        // LIVE. Read from the listing itself on 2026-09-02 with
        // scripts/market/verify-amazon.mjs: $12.99, 124 pages, 8.5 × 11 in,
        // ISBN 979-8170602360, published 29 August 2026. Nobody supplied this
        // ASIN — it was found by searching Amazon for the title and confirmed
        // against four catalogue facts before being written here.
        availability: "available",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 124,
        pendingPageCount: 126,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
        amazonAsin: "B0HHHWXGG4",
        amazonUrl: amazon("B0HHHWXGG4"),
        kdp: "live",
        masterFileKey: null,
        priceBasis:
          "FOUNDER-APPROVED (decision K43, 2026-08-29); the live listing charges exactly this.",
      },
      {
        format: "hardcover",
        // Not on the shelf: an author-wide Amazon search on 2026-09-02
        // returned the paperback and no hardcover. Still in KDP review, or
        // never submitted. No ASIN is invented while that is true.
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(21.99),
        pageCount: 124,
        pendingPageCount: 126,
        pendingPageCountReason: "the companion page of 2026-09-03; `pageCount` stays at what the listing sells until the file is uploaded",
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
      "KDP — the paperback went live as B0HHHWXGG4 on 29 August 2026, before the remediation. The Founder reports having replaced the interior with 09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_124pp.pdf; that cannot be confirmed from outside Amazon, because the pre- and post-remediation interiors are both 124 pages. Confirm inside KDP that the current interior is the remediated file. The hardcover is not on the shelf yet.",
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
    // PUBLISHED 2026-09-02 on the Founder's written approval: Gates 2 (rights),
    // 5 (facts), 8 (price) and 12 (publication) signed, prices $9.99 direct /
    // $14.99 paperback confirmed, AI declaration given. Gates 1, 3, 4, 6, 7, 9,
    // 10 and 11 were already passed. All twelve are recorded in the book
    // project's gates.json with their evidence.
    websiteStatus: "published",
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03. The book's only companion mention had been one line inside the imprint on p. 4; p. 144 was an empty page carrying a running head. That page is now the companion page. 144 before, 144 after — and this edition has not been uploaded yet, so nothing at KDP is affected." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1ha3tdx5bbyfqhe8k6qrep4",
    onelinePromise:
      "Dudeney's best puzzles in his own words, with a hint for every one, a difficulty mark, and the old money explained.",
    description:
      "One hundred and ten puzzles chosen from the five hundred and forty-four in Dudeney's two great books, arranged in seven parts by kind — money and markets, ages and clocks, digits and magic squares, cutting and fitting, counters and routes, combinations and the chessboard, and the tales of the Canterbury pilgrims. Every statement and every solution is Dudeney's own text from the 1907 and 1917 editions, with the original figures. Added: a 2,000-word introduction, an editor's hint for every puzzle that says where to look without giving the answer, a difficulty mark, editor's notes on the famous ones, a glossary of pounds, shillings and pence, a chronology of Dudeney's life, and a concordance back to the original numbering. 144 pages, 6 × 9 in.",
    idealReader:
      "Someone who has met the Haberdasher's puzzle or the spider and the fly and wants the rest, with enough help to finish and enough honesty to know what is Dudeney's and what is ours.",
    formats: [
      {
        format: "ebook",
        // ON SALE 2026-09-02. Gate 12 signed; the Paddle price below is the
        // live one provision-paddle.mjs created and verified against the live
        // account (active, 999 USD, one-time, quantity 1–1).
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 144,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/the-puzzles-of-henry-dudeney/master/v1/master.pdf",
        // The first Valice edition to deliver two files. One purchase, both:
        // the worker stamps the PDF page by page and appends a licence leaf to
        // the EPUB. Written here only because the object is actually in the
        // bucket and the worker actually reads it — see PHASE_4_REPORT §EPUB.
        epubFileKey: "books/the-puzzles-of-henry-dudeney/master/v1/master.epub",
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
          "price-engine.mjs 2026-09-02, 144 pp 6×9 B&W public domain: prints at $2.73; $12.99 nets $5.07 (39%), $14.99 nets $6.27 (41.8%), $16.99 nets $7.47. $14.99 proposed for a 144-page annotated edition; Founder decides at Gate 8. Interior and full-wrap cover are built (OUTPUT/interior-main.pdf, OUTPUT/KDP/PAPERBACK/cover.pdf \u2014 the cover was rebuilt from the Founder's artwork on 2026-09-04; the typographic one it replaced is in 09_ARCHIVE/covers-superseded-2026-09-04/).",
      },
    ],
    blockers: [
      "The paperback is built and preflight-clean but has never been uploaded to KDP — that is a Founder action, and it needs a physical proof copy first. The catalogue keeps it coming_soon with no ASIN until it is live.",
      "Before that upload, the KDP AI declaration must be re-decided. The Founder declared no AI use; the project records that the editorial apparatus — 28.1% of the words — was agent-drafted, which is 'AI-generated' under Amazon's own definition. It does not affect the direct ebook, which makes no declaration to anyone. See project_config.json → compliance.aiDisclosure.textConflict.",
      "The direct edition ships the watermarked PDF only. The EPUB is built and epubcheck-clean; nothing delivers it yet, so nothing advertises it.",
      "No Kindle edition planned: public-domain titles are capped at the 35% royalty on KDP and the Kindle store already carries the same text for free at BSR #193.",
    ],
  },

  {
    slug: "epictetus-discourses-and-enchiridion",
    title: "Epictetus: The Discourses and Enchiridion",
    subtitle:
      "The George Long Translation, Annotated — the Complete Enchiridion, 68 Discourses in Seven Thematic Parts, 120 Head-Notes, a Stoic Glossary and a Concordance to the Meditations",
    language: "en",
    pageCount: 176,
    categories: ["classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["PHI011000", "PHI002000"],
    series: { name: "Valice Classics", volume: 3 },
    // READY TO PUBLISH, HELD ON ONE DEPENDENCY. Gates 2 (rights) and 5 (facts)
    // are signed, compliance-lint is clean with the AI disclosure decided under
    // constitution Article 20, the R2 masters are uploaded and hash-verified,
    // and the preview pages are rendered.
    // ON SALE 2026-09-04. Paddle price provisioned live, R2 masters uploaded and
    // content-verified, fulfillment mapping in place. The blocker that held all five
    // was one malformed line in .env shadowing the live key; FOUNDER F-004 is closed.
    websiteStatus: "published",
    linkageDecision: { decision: "house_pipeline", why: "The dedicated companion page is built by scripts/factory/build-companion-pages.mjs — the house tool — not by this book\u2019s own typesetter. An earlier build authored the page natively; that was a parallel system with none of the house pipeline\u2019s verification, and it was removed. The pipeline appended the leaf (175 \u2192 176 pp), read the file back to confirm the page count and the printed address, and decoded the QR module-by-module against the URL it carries: p.176, QR 24% of page height, 1.696 mm per module against a 0.5 mm print floor. The wrap was already built at 176 pp and its spine agrees with the pipeline\u2019s arithmetic to four decimals, so no cover rebuild was needed." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1pttdvakbj8p0vb8tc86nj5",
    onelinePromise:
      "The book Marcus Aurelius read, in the same translator's English, with a head-note on every chapter and the passages he reused marked.",
    description:
      "Epictetus was born a slave and taught that nobody could govern a man who wanted nothing they controlled. He wrote none of it down; his student Arrian did. This edition prints Arrian's handbook \u2014 the complete Enchiridion, all fifty-two chapters \u2014 first, as the shorter way in, then the sixty-eight Discourses George Long selected in 1877, arranged into seven thematic parts instead of the unbroken sequence Long printed. The text is Long's, unaltered. Around it: a 3,000-word introduction, an introduction to each part, a head-note on every one of the 120 chapters, a glossary of the eighteen terms Epictetus uses technically and English hides, a biographical index of the people he names without introducing, a chronology, an index of thirty-four subjects generated from the text, and a concordance to the Meditations listing the four passages Marcus Aurelius demonstrably read \u2014 and the two George Long cites that turned out not to be in this selection. 176 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who read the Meditations, wanted the source, and would rather be told plainly which translation they are holding and what it leaves out.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 176,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/epictetus-discourses-and-enchiridion/master/v1/master.pdf",
        epubFileKey: "books/epictetus-discourses-and-enchiridion/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-04, direct ebook: $9.99 nets $8.99 after Paddle (90%). The Valice Classics bible allows $7.99\u20139.99 for the minimum apparatus standard and $12.99 for premium; this edition measures 20.0% original matter (QA/differentiation.json), which is the floor, not premium \u2014 so $9.99, the same as Meditations and Dudeney.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(16.99),
        pageCount: 176,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04, 176 pp 6\u00d79 B&W public domain: prints at $3.11, KDP minimum list $5.19. $16.99 nets $7.08 (41.7%); the engine's recommended list is $12.99 and the Valice Classics bible's band is $16.99\u201319.99 once an edition has proved itself. Proposed at $16.99; the Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "Not on KDP. These editions are built and packaged, and the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-1-REPORT. The direct ebook is on sale here regardless.",
      "Gates 7 (cover) and 8 (interior/proof) are unsigned, so the paperback list price is proposed rather than decided. Gates 2 (rights), 4 (content), 5 (facts) and 9 (metadata) are signed.",

      "No Kindle edition and no hardcover or large print are planned at launch; each decision is recorded below rather than assumed.",
      "No Kindle edition planned at launch: KDP caps public-domain content at the 35% royalty tier and the Kindle store already carries several free Epictetus editions. It is a discovery channel, not a revenue one, and the decision is recorded rather than assumed.",
      "No hardcover and no large print. 176 pages qualifies for KDP hardcover (75\u2013550), but a hardcover on an unproven public-domain title competes with established hardback classics series at a price this edition has not earned. Large print would push 176 pages to roughly 330 and the list to about $22.99 with no evidence of demand. Both are deferred until the paperback has sold; the reasons are written down so the decision can be revisited rather than re-derived.",
    ],
  },

  {
    slug: "seneca-selected-dialogues",
    title: "Seneca: Selected Dialogues",
    subtitle:
      "Five Dialogues Complete in Aubrey Stewart's Translation, Annotated — with an Argument Map of All 79 Chapters, a Glossary, a Biographical Index and a Chronology",
    language: "en",
    pageCount: 154,
    categories: ["classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["PHI011000", "PHI002000"],
    series: { name: "Valice Classics", volume: 4 },
    // READY TO PUBLISH, HELD ON ONE DEPENDENCY — identical position to volume 3.
    // Gates 2 and 5 signed, compliance clean, masters uploaded and hash-verified,
    // previews rendered. Held "draft" only because no live Paddle key exists in
    // this environment, and the catalogue refuses to publish a page for a book
    // that cannot be bought or linked. FOUNDER F-004.
    // ON SALE 2026-09-04. Paddle price provisioned live, R2 masters uploaded and
    // content-verified, fulfillment mapping in place. The blocker that held all five
    // was one malformed line in .env shadowing the live key; FOUNDER F-004 is closed.
    websiteStatus: "published",
    linkageDecision: { decision: "house_pipeline", why: "Dedicated companion page built by scripts/factory/build-companion-pages.mjs and appended as a leaf (155 \u2192 156 pp). The interior builder pads to an ODD count on purpose, because the companion leaf is what makes the final count even. Verified by reading the file back: p.154, QR 25% of page height, 1.947 mm per module. The wrap was built at 156 pp and agrees with the pipeline\u2019s spine arithmetic." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1pttekkh73w3rjewmv1p2cy",
    onelinePromise:
      "Nero's tutor on how to live, with the life told honestly beside the essays \u2014 including the twelve chapters where he defends being rich.",
    description:
      "In the spring of 65, on the emperor's orders, the richest private citizen in Rome opened his veins and took a very long time to die. He had been Nero's tutor, then his minister, then the man who drafted the public justification for matricide \u2014 and he had written, while doing all of it, the most quotable defence of the simple life in Latin.\n\nThis edition prints five of Seneca's twelve dialogues, complete and unabridged, in Aubrey Stewart's 1889 translation: On the Shortness of Life, On Peace of Mind, On the Happy Life, On Providence and On Leisure. They are the five about how to live, and they argue with each other.\n\nAround them: a 3,000-word introduction that takes up George Long's refusal to discuss Seneca at all \u2014 Long, who translated the Meditations Valice publishes, said only that his writings and his life must be taken together \u2014 an introduction to each dialogue, an argument map giving a line to every one of the 79 chapters (Seneca wrote no headings; the numbers were added by later editors), a glossary of 14 working terms, a biographical index, a chronology that sets the essays beside Nero's reign, and an index of 30 subjects generated from the text.\n\nTwo of the five are incomplete in the manuscripts. The edition says which, and where, and does not supply endings that do not exist.\n\n154 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who has met Seneca in quotation and wants the essays whole, with the life told honestly beside them.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 154,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/seneca-selected-dialogues/master/v1/master.pdf",
        epubFileKey: "books/seneca-selected-dialogues/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-04, direct ebook: $9.99 nets $8.99 after Paddle (90%). Measured 20.0% original apparatus (QA/differentiation.json) \u2014 the Valice Classics floor, not the premium tier \u2014 so $9.99, matching the other three Classics titles.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(15.99),
        pageCount: 154,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04, 154 pp 6\u00d79 B&W public domain: prints at $2.85, KDP minimum list $4.79. $15.99 nets $6.72 (42.0%); the engine's recommended list is $11.99. Set one dollar below the Epictetus paperback because the book is twenty pages shorter. Proposal \u2014 the Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "Not on KDP. These editions are built and packaged, and the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-1-REPORT. The direct ebook is on sale here regardless.",
      "Gates 7 (cover) and 8 (interior/proof) are unsigned, so the paperback list price is proposed rather than decided. Gates 2 (rights), 4 (content), 5 (facts) and 9 (metadata) are signed.",

      "Volume-mate note: this edition and the Epictetus volume share a translator-era and a price band; neither has market evidence yet, so Gate 1 is open for both.",
      "No Kindle edition planned at launch: KDP caps public-domain content at 35% and free Seneca editions already saturate the Kindle store.",
      "No hardcover and no large print. 154 pages qualifies for KDP hardcover, but a hardcover on an unproven public-domain title competes with Penguin and Everyman hardbacks at a price this edition has not earned. Large print would take 154 pages to roughly 285 and the list to about $21.99 with no demand evidence. Both deferred, with the reasons recorded so the decision can be revisited.",
      "Gate 5 is signed and all twelve claims are VERIFIED. The five that were PENDING were resolved by cutting or hedging: Gallio was confirmed at Acts 18:12 and in the source text itself, the Dio fortune figure and the Jerome attribution were cut, the nine-tragedies count was removed, and the cognitive-therapy resemblance was softened.",
    ],
  },

  {
    slug: "myths-and-legends-of-china",
    title: "Myths and Legends of China",
    subtitle:
      "Volume One: The Gods \u2014 8 Chapters Complete in the 1922 Text, Annotated, with a Register of the 9 Celestial Ministries, a Glossary of 25 Figures with Verified Chapter References and a Chronology",
    language: "en",
    pageCount: 108,
    categories: ["myth-and-folklore", "classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["SOC011000", "REL114000"],
    series: { name: "Valice Classics", volume: 5 },
    // SPLIT, DELIBERATELY. Werner's twelve narrative chapters measured 13.3%
    // original matter against a 20% floor, and the gap could only be closed by
    // padding \u2014 which the constitution forbids \u2014 or by choosing a smaller
    // subject. The eight chapters here are the ones in which Werner sets out the
    // divine order; the four long legend cycles (Kuan Yin, the Guardian, Monkey,
    // the fox-spirits) are 31,744 words and become volume two. This volume
    // measures 22.1%, above the floor with real margin and without a padded
    // sentence in it.
    // ON SALE 2026-09-04. Paddle price provisioned live, R2 masters uploaded and
    // content-verified, fulfillment mapping in place. The blocker that held all five
    // was one malformed line in .env shadowing the live key; FOUNDER F-004 is closed.
    websiteStatus: "published",
    linkageDecision: { decision: "house_pipeline", why: "The companion leaf is appended by scripts/factory/build-companion-pages.mjs \u2014 the house tool \u2014 not by this book\u2019s typesetter. The interior is built deliberately ODD (107 pp) so the appended leaf makes the final count even, as KDP requires." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1pttfb8fj469accf8znvjb7",
    onelinePromise:
      "The Chinese gods do not rule \u2014 they are posted, promoted and demoted. Eight chapters of Werner\u2019s 1922 classic, with the celestial civil service mapped from his own text.",
    description:
      "Thunder is a ministry. So are the waters, fire, epidemics, medicine and exorcism, each with a president, a staff and a jurisdiction; a dragon-king can be taken to court and usually loses. E. T. C. Werner spent thirty-three years as a British consul in China, retired to Peking and stayed, and he translated these myths from Chinese sources rather than from other Europeans. This first volume prints the eight chapters in which he sets out that divine order \u2014 the creation of the world from P\u2019an Ku\u2019s body, the archer who shot down nine of the ten suns, the ministries of the natural world, the Eight Immortals, and a war in heaven \u2014 complete and unaltered. The four long legend cycles (Kuan Yin, the Guardian of the Gate of Heaven, Monkey and the fox-spirits) are held for volume two, and the book says so on its first page rather than on its last. Around the text: an introduction, an introduction to each chapter, a register of the nine celestial ministries assembled from the printed chapters because Werner\u2019s own catalogue of them is not in this selection, a glossary of twenty-five figures whose chapter references were produced by searching the text, a note on the Wade-Giles romanisation, a chronology and an index of subjects. The 1922 colour plates are not reproduced: no source names their artist, so they cannot be cleared. 108 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who knows Greek or Norse myth and wants the Chinese material from a man who read the sources \u2014 with enough apparatus to keep several hundred Wade-Giles names straight.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 108,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/myths-and-legends-of-china/master/v1/master.pdf",
        epubFileKey: "books/myths-and-legends-of-china/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-04, direct ebook: $9.99 nets $8.99 after Paddle (90%). The Valice Classics bible allows $7.99\u20139.99 for the minimum apparatus standard and $12.99 for premium; this edition measures 22.1% original matter (QA/differentiation.json) \u2014 above the 20% floor but short of the 35% premium tier \u2014 so $9.99, the same as the other Classics.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(13.99),
        pageCount: 108,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04, 108 pp 6\u00d79 B&W public domain: prints at $2.30 (flat rate under 110 pp), KDP minimum list $3.84, recommended list $9.99. Proposed at $13.99, which nets $6.09 (43.6%). Deliberately below the $16.99 proposed for Epictetus: this is a 108-page book against a 176-page one, and pricing it level would be charging the same for less. The Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "Not on KDP. These editions are built and packaged, and the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-1-REPORT. The direct ebook is on sale here regardless.",

      "Gate 8 (interior) and Gate 7 (cover) are unsigned: the paperback list price is proposed, not decided, and the Founder signs the price.",
      "No Kindle edition planned at launch. KDP caps public-domain content at the 35% royalty tier and the Kindle store already carries free Werner editions; it is a discovery channel rather than a revenue one, and the decision is recorded rather than assumed.",
      "No hardcover and no large print. At 108 pages a hardcover is not offered by KDP below 75 pages but would compete with established mythology hardbacks at a price this edition has not earned; large print would roughly double the extent with no demand evidence. Both deferred with the reason recorded.",
      "Volume two (Kuan Yin, the Guardian of the Gate of Heaven, Monkey, Fox Legends \u2014 31,744 words) is scoped and unbuilt. The apparatus of this volume refers to it as forthcoming, which is a promise this house has to keep.",
    ],
  },

  {
    slug: "indian-myth-and-legend",
    title: "Indian Myth and Legend",
    subtitle:
      "Volume One: The Vedic Gods \u2014 5 Chapters Complete in the 1913 Text, Annotated, with a Register Grading the Author's Comparisons and a Who's-Who of 32 Figures with Verified Chapter References",
    language: "en",
    pageCount: 94,
    categories: ["myth-and-folklore", "classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["SOC011000", "REL032000"],
    series: { name: "Valice Classics", volume: 6 },
    // The Werner lesson applied BEFORE writing rather than after: the selection
    // was measured against the 20% floor at the outset. Mackenzie's 26 chapters
    // are ~140,000 words; the five printed here are the Vedic gods themselves,
    // and they measure 21.5%. The Mahabharata, Nala and Ramayana cycles are
    // roughly 100,000 words and become later volumes.
    // ON SALE 2026-09-04. Paddle price provisioned live, R2 masters uploaded and
    // content-verified, fulfillment mapping in place. The blocker that held all five
    // was one malformed line in .env shadowing the live key; FOUNDER F-004 is closed.
    websiteStatus: "published",
    linkageDecision: { decision: "house_pipeline", why: "The companion leaf is appended by scripts/factory/build-companion-pages.mjs. The interior is typeset deliberately ODD (93 pp) so the appended leaf makes 94, the even count KDP requires." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1pttg3r2nd796vhmh7t22j5",
    onelinePromise:
      "The Indian gods in their first form, before Hinduism demoted them \u2014 with a register telling you which of a 1913 author's comparisons still stand.",
    description:
      "The gods in this book lose. Indra opens it as king of heaven holding the thunderbolt, and Indian religion spends the next two thousand years demoting him; Varuna, the most morally serious god in the Vedic pantheon, all but disappears; and the two figures who get walk-on parts here \u2014 Vishnu, and Rudra who becomes Shiva \u2014 inherit everything. This is the pantheon in its first form, not its final one.\n\nDonald Mackenzie was a Scottish journalist rather than an orientalist, and this edition says so plainly: he worked from translations and from Macdonell, Oldenberg and Monier Williams, and what he supplied was arrangement and pace. Judged as that, it is very good. Five chapters are printed complete and unaltered \u2014 Indra; the great Vedic deities; Yama, the first man and king of the dead; the demons, giants and fairies; and the mysteries of creation, including the hymn that ends by allowing that possibly nobody knows how the world began.\n\nAround the text, and original to this edition: an introduction; an introduction to each chapter; a register grading Mackenzie's relentless comparisons \u2014 Indo-Iranian, wider Indo-European, Babylonian, decorative \u2014 by how much weight each still bears; a who's-who of 32 figures whose chapter references were produced by searching the text, which is how it was discovered that the book contains two different Savitris; a note on the Sanskrit names; a chronology; and an index of 34 subjects generated from the text.\n\nNone of the 1913 illustrations is reproduced. Two of those in these chapters are paintings by Nandalal Bose, who died in 1966 and whose work is in copyright until 2037; the rest name no creator. 94 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who knows Greek or Norse myth, wants the Indian material, and would rather be told which parts of a hundred-year-old book have not aged well than have them quietly cut.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 94,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/indian-myth-and-legend/master/v1/master.pdf",
        epubFileKey: "books/indian-myth-and-legend/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-04, direct ebook: $9.99 nets $8.99 after Paddle (90%). 21.5% original matter (QA/differentiation.json) is above the 20% floor and short of the 35% premium tier, so the same $9.99 as the other Valice Classics.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 94,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04, 94 pp 6\u00d79 B&W public domain: prints at $2.30 (flat rate under 110 pp), KDP minimum list $3.84, recommended $9.99. Proposed at $12.99, which nets $5.49 (42.3%). A dollar under the Werner volume because it is fourteen pages shorter, on the same principle that put Werner below Epictetus. The Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "Not on KDP. These editions are built and packaged, and the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-1-REPORT. The direct ebook is on sale here regardless.",

      "Gates 7 (cover) and 8 (interior/proof) are unsigned: the paperback list price is proposed, not decided.",
      "No Kindle edition planned at launch. KDP caps public-domain content at the 35% royalty tier and free Mackenzie editions already exist on Kindle.",
      "No hardcover and no large print. At 94 pages neither is a serious proposition for an unproven title; both deferred with the reason recorded.",
      "Volumes two to four (the Mahabharata cycle, the Nala romance and the Ramayana \u2014 roughly 100,000 words) are scoped and unbuilt. This volume's apparatus refers to them as forthcoming.",
      "Warwick Goble's eight colour plates ARE public domain (he died in 1943) but none falls in these five chapters. They are available to the epic volumes and are a real asset for them.",
    ],
  },

  {
    slug: "mythical-monsters",
    title: "Mythical Monsters",
    subtitle:
      "Volume One: The Dragon \u2014 3 Chapters Complete in the 1886 Text, Annotated, with a Register Setting Six of the Author's Claims Against What Is Established and His Sources Graded",
    language: "en",
    pageCount: 74,
    categories: ["myth-and-folklore", "classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["SOC011000", "NAT017000"],
    series: { name: "Valice Classics", volume: 7 },
    // The one book in Phase 1 whose central thesis is FALSE, and the apparatus
    // is built around saying so. Gould \u2014 first Government Geologist of
    // Tasmania \u2014 argued that dragons were real animals remembered. The
    // Register of Claims sets six assertions against what is established and
    // marks which is which, because publishing the thesis silently would be
    // dishonest and dropping it would remove half the interest.
    // ON SALE 2026-09-04. Paddle price provisioned live, R2 masters uploaded and
    // content-verified, fulfillment mapping in place. The blocker that held all five
    // was one malformed line in .env shadowing the live key; FOUNDER F-004 is closed.
    websiteStatus: "published",
    linkageDecision: { decision: "house_pipeline", why: "The companion leaf is appended by scripts/factory/build-companion-pages.mjs. The interior is typeset deliberately ODD (73 pp) so the appended leaf makes 74." },
    kdpSelect: false,
    directSale: true,
    directSaleBlockedBy: null,
    paddlePriceId: "pri_01m1pttgx4axvwt4tzkz73tz68",
    onelinePromise:
      "A trained geologist argues that dragons were real animals \u2014 carefully, from true premises, to a false conclusion. With a register saying exactly where it fails.",
    description:
      "Charles Gould believed that dragons were real animals: large reptiles that lived alongside early humans, were accurately described by them, and became extinct within historical memory. He was wrong.\n\nHe was also the first Government Geologist of Tasmania, trained at the Royal School of Mines, a veteran of the Geological Survey of Great Britain, and the son of John Gould the ornithologist. This is not a crank's book. It is a trained scientist applying a real method to a false hypothesis, and in 1886 nobody could yet tell him that the gap he needed to close was sixty-six million years wide.\n\nThree chapters are printed complete and unaltered \u2014 the dragon, the Chinese dragon, the Japanese dragon \u2014 which together are Gould's whole treatment of one creature. The Chinese chapter is the reason the book survives its own thesis: he reads the Shan Hai King, the Yih King and the 'Rh Ya as sources with dates and reliability, which almost no English writer on myth was doing then, and he reports \u2014 against his own case \u2014 that in the older and more credible layer, dragons are infrequent.\n\nAround the text, original to this edition: a Register of Claims setting six of his assertions beside what is actually established, with an editorial reading of each; a graded list of his sources, from the Chinese classics down to the Victorian newspapers he treats as comparable testimony; a glossary of eighteen dragon terms with chapter references produced by searching the text; a chronology whose first two rows are the whole answer to his thesis; and an index.\n\nNone of the 1886 figures is reproduced: the book names no illustrator, so they cannot be cleared. 74 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who enjoys watching a careful argument fail, and would rather be shown where it fails than have the failure quietly edited out.",
    formats: [
      {
        format: "ebook",
        availability: "available",
        fulfillment: "direct",
        priceCents: usd(9.99),
        pageCount: 74,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/mythical-monsters/master/v1/master.pdf",
        epubFileKey: "books/mythical-monsters/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-04, direct ebook: $9.99 nets $8.99 after Paddle (90%). 22.0% original matter (QA/differentiation.json), above the 20% floor and short of the 35% premium tier, so the same $9.99 as the other Valice Classics.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(11.99),
        pageCount: 74,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-04, 74 pp 6\u00d79 B&W public domain: prints at $2.30 (flat rate under 110 pp), KDP minimum list $3.84. Proposed at $11.99, which nets $4.89 (40.8%). A dollar under the Mackenzie volume because it is twenty pages shorter, on the same principle applied down the series. The Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "Not on KDP. These editions are built and packaged, and the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-1-REPORT. The direct ebook is on sale here regardless.",

      "Gates 7 (cover) and 8 (interior/proof) are unsigned: the paperback list price is proposed, not decided.",
      "No Kindle edition planned at launch. KDP caps public-domain content at the 35% royalty tier and free Gould editions already exist.",
      "No hardcover and no large print. At 74 pages neither is a serious proposition; both deferred with the reason recorded.",
      "Volume two (the sea-serpent, 25,000 words) and volume three (the unicorn and the Chinese phoenix) are scoped and unbuilt.",
      "Chapters I to V \u2014 Gould's geological argument \u2014 are not printed in any planned volume. The apparatus supplies what a reader needs of them, which is a deliberate choice and is recorded as one.",
    ],
  },

  {
    slug: "games-ancient-and-oriental",
    title: "Games Ancient and Oriental: The Egyptian Games",
    subtitle:
      "Edward Falkener's 1892 Reconstruction, Annotated \u2014 with Dr Samuel Birch's 1864 Paper, a Register of Reconstructions, Five Original Diagrams and the Move Tables Rebuilt from the Scan",
    language: "en",
    pageCount: 78,
    categories: ["games-and-play", "classics-and-philosophy"],
    authors: ["emre-dogan"],
    bisac: ["GAM001000", "HIS002030"],
    series: { name: "Valice Classics", volume: 8 },
    // PHASE 2, BOOK 1. Built from an Internet Archive SCAN rather than a proof-read
    // transcription, which is a different kind of source and is treated as one: the
    // running heads are found structurally, the 1892 folios are validated against a
    // physical constraint before being printed, every correction was read off the page
    // image, and the move tables are rebuilt from the OCR's own word coordinates.
    // What could not be read is marked, not smoothed. QA/parse-report.json has the counts.
    websiteStatus: "draft",
    linkageDecision: null,
    kdpSelect: false,
    directSale: true,
    // The product and price are written and priced; creating them on the live
    // Paddle account is a write this environment's permission layer does not
    // allow, and routing around that block would defeat it. FOUNDER F-019 holds
    // the one command. Until it runs the ebook is `coming_soon`, not `available`,
    // because a buy button with no price behind it is a lie.
    directSaleBlockedBy: "paddle-not-provisioned",
    paddlePriceId: null,
    onelinePromise:
      "The first serious attempt to make a dead game playable again \u2014 with the seam marked, for the first time, between what the evidence shows and what Falkener supplied.",
    description:
      "In 1892 an English architect did what no antiquary had done: he wrote down the rules. Two centuries of scholars had collected every classical passage about ancient board games and left them, as Falkener complained, a skeleton \u2014 \u201cthe bones of the entire skeleton have been put together, but there they remained; the game was not played.\u201d So he supplied the play. The ancient sources do not contain those rules. They are his, inferred from a board, a piece count and a few lines of Latin verse, and the book prints them in the imperative with worked games played to a finish and nothing marking where the evidence stops. This edition marks it. A Register of Reconstructions separates, for each of the three games, what the evidence shows, what Falkener supplies, and what is known now \u2014 which in every case includes that the rules are still not known. Sections I to VI complete: Falkener's introduction, the games of the ancient Egyptians, the Manchester relics, and Tau, Senat and Hab em Han. With the 1864 paper Dr Samuel Birch of the British Museum wrote for him \u2014 the best thing in the volume, and the place where a specialist marks his own uncertainty. Around them: five original diagrams, each marked EVIDENCE or RECONSTRUCTION on its face, a glossary of the terms, a chronology, an index of subjects generated from the text, and a note on the text that says exactly what a scan can and cannot give you. 78 pages, 6 \u00d7 9 in.",
    idealReader:
      "Someone who likes ancient games and would rather be told which parts of a reconstruction are evidence and which are the reconstructor.",
    formats: [
      {
        format: "ebook",
        availability: "coming_soon",
        fulfillment: "direct",
        priceCents: usd(7.99),
        pageCount: 78,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: "books/games-ancient-and-oriental/master/v1/master.pdf",
        epubFileKey: "books/games-ancient-and-oriental/master/v1/master.epub",
        priceBasis:
          "price-engine.mjs 2026-09-05, direct ebook, public domain: recommended $6.99, and $7.99 nets $7.09 after Paddle. The Valice Classics band is $7.99\u20139.99 for the minimum apparatus standard. This edition measures 28.0% original matter (QA/differentiation.json) \u2014 above the 20% floor \u2014 but it is 78 pages against the 154\u2013176 of the other Classics titles, so it is priced at the bottom of the band rather than at the $9.99 the longer volumes carry.",
      },
      {
        format: "paperback",
        availability: "coming_soon",
        fulfillment: "amazon",
        priceCents: usd(12.99),
        pageCount: 78,
        amazonAsin: null,
        amazonUrl: null,
        kdp: "not_created",
        masterFileKey: null,
        priceBasis:
          "price-engine.mjs 2026-09-05, 78 pp 6\u00d79 B&W: prints at $2.30 on the flat rate for 110 pages or under, KDP minimum list $3.84, recommended $9.99. $12.99 nets $5.49 (42.3%). The Classics band of $16.99\u201319.99 assumes a 150-page-plus volume and this is 78, so $12.99 is proposed instead. The Founder decides at Gate 8.",
      },
    ],
    blockers: [
      "The ebook is built, priced and ready but not yet on sale: creating the Paddle product and price is a live write that this environment's permission layer blocks, and working around it would defeat the block. One command, in FOUNDER F-019.",
      "Not on KDP. The interior and wrap are built and packaged; the print upload is a Founder action \u2014 see the KDP upload handbook in PHASE-2-REPORT.",
      "Nine of Falkener's tables are described rather than reproduced. The bowl game's form of throws and entries is read at 88% wrong or absent by the scan's text layer, and setting it would be worse than leaving it out. Each omission is marked in place with its size and its 1892 page. This is stated in the Note on the Text and in the product description's honesty, not hidden.",
      "This is a short volume \u2014 78 pages against 154\u2013176 for the other Classics titles \u2014 because sections I to VI are where the Egyptian argument ends and section VII changes subject to the Greek hiera gramme. Both prices are set for the length rather than for the series.",
      "No Kindle edition planned at launch: KDP caps public-domain content at the 35% royalty tier, and the Kindle store already carries free scans of this title. No hardcover: 78 pages is at the very bottom of KDP's 75\u2013550 hardcover range and would bind badly. No large print: the move tables do not enlarge usefully. Each decision is recorded rather than assumed.",
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
    // KDP → Valice Press linkage: what to do with the print interiors and why.
    // Read by scripts/factory/kdp-linkage-matrix.mjs; the audit itself is measured.
    linkageDecision: { decision: "rebuild_now", why: "Rebuilt 2026-09-03. The verification page already existed and already printed its address — it simply had no code and no presence. The paperback's p. 274 is now the house design with a 2.1-inch code; the hardcover's blank final leaf, p. 276, carries the same page while its original p. 275 stays as it is. No page count moved." },
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
        // 276, not 274: the live listing says so (verify-amazon.mjs,
        // 2026-09-02). The case binding adds two pages to the paperback's
        // 274; the catalogue had copied the paperback's count.
        pageCount: 276,
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
