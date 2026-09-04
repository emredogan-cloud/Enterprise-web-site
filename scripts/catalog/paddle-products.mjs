/**
 * The ebooks Valice Press sells directly, and what they cost.
 *
 * WHAT MAY BE SOLD HERE, AND WHY THE LIST IS SHORT
 * Verified against the KDP bookshelf on 2026-08-31. Every title below is
 * live on Amazon and NOT enrolled in KDP Select, so no exclusivity clause
 * applies to its digital edition. The four absent titles are absent for
 * reasons recorded in `digital-edition-sources.mjs`; the load-bearing one is
 * Codex Mythologica, whose Kindle edition IS in Select and therefore may not
 * be sold anywhere but Amazon while that enrolment stands.
 *
 * SIX TITLES BELOW ARE NOT ON AMAZON AT ALL
 * The Greek workbook and the five Valice Classics public-domain editions
 * (Epictetus, Seneca, Werner, Mackenzie, Gould) have no Kindle edition to
 * match and no KDP listing yet, so no Select exclusivity can apply to any of
 * them. Their prices come from `price-engine.mjs` rather than from a Kindle
 * list price, and each carries its measured apparatus share as the
 * justification — which is the only thing that distinguishes a Valice edition
 * of a free text from the free text.
 *
 * PRICING
 * Each price matches the book's own Kindle list price to the cent. That is a
 * deliberate choice rather than an oversight: undercutting Amazon on a title
 * Amazon also sells invites price-matching against the Kindle listing, and
 * overcutting makes the direct store the worse deal for no reason. What the
 * reader gets here that they do not get on Kindle is a DRM-free, watermarked
 * PDF of the print interior — the differentiator is the format, not the
 * price. Kindle prices verified from the KDP bookshelf on 2026-08-31.
 */

export const DIRECT_SALE_EBOOKS = [
  {
    slug: "codex-bestiarium",
    name: "Codex Bestiarium: A World Bestiary",
    description:
      "The complete 435-page bestiary as a DRM-free, watermarked PDF. 112 creatures from 40 folk traditions, each with sources, a Thompson motif code and a line-engraved plate.",
    priceCents: 1299, // Kindle list price, verified on KDP 2026-08-31
  },
  {
    slug: "codex-enigmatica",
    name: "Codex Enigmatica: One Hundred Engraved Enigmas",
    description:
      "The complete 274-page puzzle book as a DRM-free, watermarked PDF. One hundred enigmas across five gates, converging on a single word that is printed nowhere in the book.",
    priceCents: 999, // Kindle list price, verified on KDP 2026-08-31
  },
  {
    slug: "the-great-book-of-world-games",
    name: "The Great Book of World Games",
    description:
      "The complete 160-page games book as a DRM-free, watermarked PDF. 56 traditional games from 39 cultures with sourced provenance, playable rules and board diagrams.",
    priceCents: 1199, // Kindle list price, verified on KDP 2026-08-31
  },
  {
    slug: "meditations",
    name: "Meditations — Marcus Aurelius",
    description:
      "The George Long translation of 1862, newly typeset as a 148-page reading edition. DRM-free watermarked PDF.",
    // NOT a new price decision. $9.99 is the figure already carried on the
    // published production row; this only replaces the fake
    // `pri_test_meditations_999` with a Paddle price that actually exists,
    // so the one book the site has been advertising can finally be bought.
    // Whether $9.99 is the right price for a public-domain reprint with thin
    // original matter is a live question — see PUBLIC_DOMAIN_BATCH_1_PLAN.md.
    priceCents: 999,
  },
  {
    slug: "the-great-book-of-world-myths",
    name: "The Great Book of World Myths",
    description:
      "The complete 234-page collection as a DRM-free, watermarked PDF. 45 myths from 22 traditions retold for readers aged 8–12, with a world map, culture cards and a sourced pronunciation guide.",
    // $4.99 → $6.99 on 2026-09-02, following the Kindle edition after the
    // Founder raised it. A Paddle price is immutable in amount, so this makes
    // a NEW price and archives the old one — see provision-paddle.mjs.
    priceCents: 699,
  },
  {
    slug: "the-puzzles-of-henry-dudeney",
    name: "The Puzzles of Henry Dudeney — Annotated",
    description:
      // The EPUB is back in this sentence, and this time it is true. Phase 4
      // added `books.epub_file_key`, the worker's EPUB step and
      // `entitlements.epub_key`; a buyer gets both files from one purchase.
      // The rule stands: this sentence may only name a file the fulfillment
      // worker actually produces.
      "110 classic problems from Amusements in Mathematics and The Canterbury Puzzles in Dudeney's own words and with his own solutions, with a difficulty mark and a hint for every puzzle, a glossary of old money, a chronology and a concordance. 144 pages as a DRM-free watermarked PDF and a reflowable EPUB — both included, plus the online reader and a permanent library.",
    // price-engine.mjs 2026-09-02, direct ebook: $9.99 nets $8.99 after
    // Paddle (90%). Series bible range for Valice Classics is $7.99–9.99;
    // this edition carries a 28% original apparatus, so the top of it.
    priceCents: 999,
  },
  {
    slug: "greek-alphabet-handwriting-workbook",
    name: "The Greek Alphabet Handwriting Workbook",
    description:
      // Both files, and the sentence names only what the worker actually
      // produces: `master.pdf` from the print interior and `master.epub`
      // from the reference edition, both uploaded under
      // books/greek-alphabet-handwriting-workbook/master/v1/.
      "All 24 Greek letters in both cases, the final sigma, four historical variants and every accent in both the monotonic and the polytonic systems, through 53 numbered stroke diagrams — with a sourced stroke order for every one and a provenance page that says where each came from. Two files from one purchase: the complete 100-page workbook as a DRM-free watermarked PDF, printable at home as often as you need a page again, and a reflowable EPUB reference edition for the screen.",
    // NOT matched to a Kindle price, because there is no Kindle edition to
    // match — see the note at the top of this file. price-engine.mjs
    // 2026-09-04: $6.99 nets $6.14 after Paddle (87.8%). Sits at the foot of
    // this catalogue's range (World Myths $6.99 → Bestiarium $12.99) because
    // it is a focused reference beside a $12.99 print workbook, not a
    // full-length book, and the pair should cost under $20.
    priceCents: 699,
  },
  {
    slug: "epictetus-discourses-and-enchiridion",
    name: "Epictetus: The Discourses and Enchiridion (Annotated)",
    description:
      // Both files, and the sentence names only what the fulfillment worker
      // actually produces: `master.pdf` from the print interior and
      // `master.epub`, both uploaded and content-verified under
      // books/epictetus-discourses-and-enchiridion/master/v1/.
      "Arrian's complete Enchiridion — all fifty-two chapters — followed by the sixty-eight Discourses George Long selected in 1877, arranged into seven thematic parts. Around them, original to this edition: an introduction, a head-note on every one of the 120 chapters, a glossary of the eighteen terms Epictetus uses technically, a biographical index, a chronology, an index of subjects, and a concordance listing the four passages Marcus Aurelius demonstrably read — and the two Long cites that are not in this selection. 176 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99 after Paddle (90%). The
    // Valice Classics band is $7.99–9.99 for the minimum apparatus standard;
    // this edition measures 20.1% original matter, which is the floor rather
    // than premium, so the same $9.99 as Meditations and Dudeney.
    priceCents: 999,
  },
  {
    slug: "seneca-selected-dialogues",
    name: "Seneca: Selected Dialogues (Annotated)",
    description:
      "Five dialogues complete in Aubrey Stewart's 1889 translation — including On the Shortness of Life and On Anger — with an argument map of all seventy-nine chapters, a glossary of the working terms, a biographical index and a chronology. 154 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99. 20.0% original matter,
    // the floor, so the same as the other Classics at this standard.
    priceCents: 999,
  },
  {
    slug: "myths-and-legends-of-china",
    name: "Myths and Legends of China: Volume One, The Gods (Annotated)",
    description:
      "Thunder is a ministry. So are the waters, fire, epidemics and exorcism, each with a president and a jurisdiction. Eight chapters of E. T. C. Werner's 1922 classic — the creation of the world from P'an Ku's body, the archer who shot down nine of the ten suns, the ministries of the natural world, the Eight Immortals and a war in heaven — complete and unaltered, with a register of the nine celestial ministries assembled from the printed text, a glossary of twenty-five figures whose chapter references were produced by searching, a note on the Wade-Giles names, a chronology and an index. 108 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99. 22.4% original matter —
    // above the 20% floor and short of the 35% premium tier — so the same
    // $9.99 as the other Valice Classics.
    priceCents: 999,
  },
  {
    slug: "indian-myth-and-legend",
    name: "Indian Myth and Legend: Volume One, The Vedic Gods (Annotated)",
    description:
      "The gods in this book lose: Indra opens it as king of heaven, and Indian religion spends the next two thousand years demoting him. Five chapters of Donald Mackenzie's 1913 classic — Indra, the great Vedic deities, Yama who was the first man and therefore rules the dead, the demons and fairies, and the mysteries of creation — complete and unaltered, with a register grading his relentless comparisons by how much weight each still bears, a who's-who of thirty-two figures with references verified by search, a note on the Sanskrit names, a chronology and an index. 94 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99. 21.5% original matter,
    // above the floor and short of premium.
    priceCents: 999,
  },
  {
    slug: "mythical-monsters",
    name: "Mythical Monsters: Volume One, The Dragon (Annotated)",
    description:
      "Charles Gould, the first Government Geologist of Tasmania, believed dragons were real animals remembered. He was wrong, and the argument is worth following. Three chapters of his 1886 book — the dragon, the Chinese dragon, the Japanese dragon — complete and unaltered, with a register setting six of his claims against what is actually established, a graded list of his sources from the Shan Hai King to the Straits Times, a glossary of eighteen dragon terms with verified chapter references, a chronology and an index. 74 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99. 22.0% original matter,
    // above the floor and short of premium.
    priceCents: 999,
  },
];
