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
    name: "Epictetus: The Discourses and Enchiridion",
    description:
      // Both files, and the sentence names only what the fulfillment worker
      // actually produces: `master.pdf` from the print interior and
      // `master.epub`, both uploaded and content-verified under
      // books/epictetus-discourses-and-enchiridion/master/v1/.
      "Arrian's complete Enchiridion — all fifty-two chapters — followed by the sixty-eight Discourses George Long selected in 1877, arranged into seven thematic parts. Around them, original to this edition: an introduction, a head-note on every one of the 120 chapters, a glossary of the eighteen terms Epictetus uses technically, a biographical index, a chronology, an index of subjects, and a concordance listing the four passages where George Long's two translations touch — and the two he cites that are not in this selection. 176 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-04: $9.99 nets $8.99 after Paddle (90%). The
    // Valice Classics band is $7.99–9.99 for the minimum apparatus standard;
    // this edition measures 20.18% original matter (re-measured 2026-09-06 against the printed interior), the floor rather
    // than premium, so the same $9.99 as Meditations and Dudeney.
    priceCents: 999,
  },
  {
    // Roadmap book 4 (2026-09-05). NOT on Amazon and never enrolled in KDP
    // Select: this book's whole companion bridge depends on the direct edition
    // existing, and Select would forbid it. Codex Mythologica — a different
    // book with a confusingly similar name — is the cautionary case, and its
    // Kindle enrolment is why IT is absent from this list.
    slug: "codex-mythologica-the-puzzle-book",
    name: "Codex Mythologica: The Puzzle Book",
    description:
      "A hundred myth puzzles from nineteen civilizations, as two files: the 156-page interior as a DRM-free watermarked PDF, which is what lets you print puzzle 63 again instead of writing in your only copy, and a reflowable EPUB whose grids are scalable drawings and whose three hint passes are three separate documents. Every puzzle was solved by a program that saw only the printed page and had to reach exactly one answer; every factual premise points at a field or a sentence in Codex Mythologica or Codex Bestiarium, and all 516 of them are re-read from the source on every build.",
    // price-engine.mjs 2026-09-05: the Codex bible sets a direct ebook at the
    // Kindle list price, $9.99–12.99. There is no Kindle edition to match, so
    // this takes the price of the closest comparable in the catalogue — The
    // Great Book of World Games, the same shape of large-format book you work
    // through rather than read. $11.99 nets $10.89 after Paddle (90.8%).
    priceCents: 1199,
  },
  {
    // PHASE 2, BOOK 1 (2026-09-05). Valice Classics 8.
    slug: "games-ancient-and-oriental",
    name: "Games Ancient and Oriental: The Egyptian Games (Annotated)",
    description:
      "Falkener's 1892 reconstruction of the ancient Egyptian games, sections I to VI complete, with the 1864 paper Dr Samuel Birch of the British Museum wrote for him. Original to this edition: a Register of Reconstructions separating, for each game, what the evidence shows, what Falkener supplies and what is known now; five diagrams drawn from the descriptions in the text, each marked EVIDENCE or RECONSTRUCTION on its face; a glossary, a chronology and an index of subjects. Falkener's move tables are rebuilt from the scan's own word coordinates, with every reading that could not be made out marked rather than guessed. 78 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-05, direct ebook, public domain: recommended
    // $6.99; $7.99 nets $7.09 after Paddle. The Classics band is $7.99–9.99 for
    // the minimum apparatus standard. This edition measures 28.0% original
    // matter — above the floor — but runs 78 pages against 154–176 for the other
    // Classics titles, so it sits at the bottom of the band, not at $9.99.
    priceCents: 799,
  },
  {
    slug: "korean-games",
    name: "Korean Games: The Games of Chance and Divination (Annotated)",
    description:
      "Culin's 1895 survey of Korean games of chance, strategy and divination \u2014 his introduction and games LXX to XCVII complete, in six parts, including W. H. Wilkinson's chapter on Korean chess. Original to this edition: a Register of Record and Inference separating, part by part, what Culin sets down at first hand from what he was told and what he concluded; a Note on the Spellings bridging his 1895 romanisation to the two in use today; a playing guide that says which games can actually be played from the book and which cannot; five diagrams drawn from the descriptions in the text, each marked EVIDENCE or RECONSTRUCTION on its face; a who's-who, a glossary, a chronology and an index of subjects. Wilkinson's thirty-move illustrative game is rebuilt from the position of every word on the page \u2014 read as prose, as every other digital text of this book reads it, that page is gibberish. 144 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-05, direct ebook, public domain: recommended
    // $6.99; $8.99 nets $8.04 after Paddle. The Classics band is $7.99\u20139.99.
    // Volume 8 took the floor because it is 78 pages; this is 144 with 23.0%
    // original matter, five diagrams and a rebuilt game table, so it sits in the
    // middle of the band.
    priceCents: 899,
  },
  {
    // PHASE 3, BOOK 1 (2026-09-06). Valice Classics 13, the first of the Bestiarium
    // expansion. No Kindle edition and no KDP listing, so no Select exclusivity can
    // apply; the price comes from price-engine.mjs and the apparatus share is the
    // justification, measured at 21.0% by COMMON-AREA/checks/differentiation.py.
    slug: "kwaidan",
    name: "Kwaidan: Stories and Studies of Strange Things (Annotated)",
    description:
      "Lafcadio Hearn's 1904 collection complete \u2014 seventeen Japanese ghost stories and three essays on insects \u2014 with both of Takeuchi Keish\u016b's original plates. Original to this edition: an introduction; a head-note before every piece; a Register of Provenance separating the three pieces whose origin Hearn states from the sixteen he leaves open, instead of guessing; a glossary of all 45 Japanese terms he italicises; a Y\u014dkai Register naming the creatures by what folklore calls them rather than by his titles; a gazetteer of the ten old provinces against the modern prefectures, which catches an error the text has carried for a century; a chronology; and an account of which of his claims have not survived and which one was right. 138 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    priceCents: 899,
    priceBasis:
      "price-engine.mjs 2026-09-06, direct ebook, public domain: recommended $6.99; $8.99 nets $8.04 after Paddle at an 89.4% margin. Mid-band for Valice Classics \u2014 45,900 words, between Chess and Playing Cards at the floor and The Singing Games at the top.",
  },
  {
    slug: "traditional-games",
    name: "The Singing Games of England, Scotland, and Ireland (Annotated)",
    description:
      "Alice Gomme's 1894 singing games, annotated: 43 games, 209 versions with their counties and collectors, and 78 tunes engraved for this edition from the notes.",
    priceCents: 999,
    priceBasis:
      "The top of the Valice Classics band. 244 pages and 78 pieces of engraved music; $9.99 nets $8.99 after Paddle.",
  },
  {
    slug: "chess-and-playing-cards",
    name: "Chess and Playing Cards: The Chess, Divination and Card Collections (Annotated)",
    description:
      "Culin's 1898 catalogue of the chess, divination and playing-card collections he showed at the World's Columbian Exposition \u2014 his introduction and entries 45 to 120 complete, in four parts. Original to this edition: a Register of Object and Argument separating, part by part, what the objects are from what Culin says they show and what the claim actually rests on; a table comparing the nine forms of chess he catalogues, drawn entirely from his own descriptions; an account of how the divining procedures work; a playing guide; five diagrams drawn from the text, each marked EVIDENCE or RECONSTRUCTION on its face; a who's-who, a glossary, a chronology, a note on tracing an object today, and an index of subjects. 120 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included.",
    // price-engine.mjs 2026-09-05, direct ebook, public domain: recommended
    // $6.99; $7.99 nets $7.09 after Paddle. The Classics band is $7.99\u20139.99, and
    // at 120 pages this sits at its floor, below volume 9's $8.99 at 144 pages.
    priceCents: 799,
  },
  {
    slug: "mancala",
    name: "Mancala, the National Game of Africa (Annotated)",
    description:
      "Culin's 1894 paper, the first serious study of mancala in English, entire. Original to this edition: a playing guide setting out the THREE complete games the paper contains \u2014 the Syrian crazy and rational games and Chuba, the four-row version already on sale in America by 1891 \u2014 in a form you can play from; a Register of Record and Inference separating what Culin watched from what he was told and what he read; three diagrams drawn from his descriptions, one of them three panels showing how a move works; a who's-who of his named informants, one of whom became the first African diplomat in modern Europe; an account of what has been established since 1894; a glossary, a chronology and an index. 37 pages as a DRM-free watermarked PDF and a reflowable EPUB, both included. It is a short book and it says so.",
    // price-engine.mjs 2026-09-05: recommended $6.99; $4.99 nets $4.24 at an 85%
    // margin. Priced BELOW the Classics band on purpose \u2014 at a quarter the length
    // of the other volumes, band price would be band price for a pamphlet.
    priceCents: 499,
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
