# Rights gate — GREEN / YELLOW / RED

Owner: R6 prepares the ledger rows; **the founder signs Gate 2**. This is an
operational rule set, not legal advice (see `BOOK_ACQUISITION_LEGAL_REPORT_TR.md`).

## The five layers that are checked separately

| Layer | Question | Typical trap |
|---|---|---|
| Work | Is the underlying work out of copyright in the US **and** in the markets we sell to? | "Old" ≠ public domain; URAA-restored foreign works |
| Translation | Is THIS translation out of copyright? (translator's death + 70; US publication year) | a 1990s translation of a 2,000-year-old text |
| Illustration | Are THESE plates out of copyright? (illustrator's death + 70) | first-edition plates by an artist who died after 1955 |
| Apparatus | Introductions, notes, indexes, chronologies of the edition used | copying a modern scholarly edition's notes |
| Data / fonts / images | Dictionaries, word lists, photographs, fonts, cover art, stock images | CC BY-NC dictionaries (Hangul S-0019); non-commercial stock; AI cover ownership terms |

## Rules

| # | Rule | Status it yields |
|---|---|---|
| 1 | US: first published before 1931 (as of 1 Jan 2026; the line moves every January) | GREEN for the US layer |
| 2 | US 1931–1963: public domain only if not renewed — check the Stanford renewal database / Copyright Office catalog and record the search | YELLOW until the search is recorded, then GREEN/RED |
| 3 | US 1964–1977: 95 years from publication → not public domain before 2060 | RED |
| 4 | Life + 70 (EU, UK, TR): the creator of THIS layer died before 1 Jan 1956 | GREEN for those markets |
| 5 | Rule of the shorter term / URAA: a foreign work that was in copyright in its home country on 1 Jan 1996 may have US copyright restored — check before assuming rule 1 | YELLOW |
| 6 | A modern translation or edition apparatus is a separate work: never assume it follows the original | RED unless licensed |
| 7 | Project Gutenberg text: public domain; the PG trademark/header/licence must be stripped from a commercial edition; no copyright may be claimed on the PD text itself | GREEN with the strip step recorded |
| 8 | Standard Ebooks: files are CC0; cover art is "believed" PD — verify each cover separately | GREEN (text) / YELLOW (cover) |
| 9 | Internet Archive: no guarantee; `possible-copyright-status: NOT_IN_COPYRIGHT` is a hint, not a determination; NC/attribution items exist | YELLOW until layers 1–4 are checked |
| 10 | Creative Commons: `CC0`, `CC BY`, `CC BY-ND` may be sold with attribution; `NC` never in a sold book; `SA` forces the derivative to be share-alike → not usable in a closed commercial book; `ND` conflicts with visible per-buyer watermarks | NC → RED; SA → YELLOW/RED; ND → YELLOW |
| 11 | Trademarked titles/characters can stay protected after the text enters the public domain | YELLOW; use the work, not the mark |
| 12 | AI-generated cover art: US Copyright Office does not register purely AI output; KDP requires disclosure; our defence is typography + brand, and the disclosure is recorded | GREEN with disclosure; the art itself is unprotectable |
| 13 | Founder attestation replaces no evidence: a GREEN row needs an evidence URL and a verification date | — |

## Evidence that counts
Archive item page, title-page scan, copyright-office catalogue entry, renewal
database search (with the query and date), authority record for a death
year (VIAF/LC/Wikidata with the source it cites), licence page of the data
source. A page number or date that was not seen is not evidence.

## What GREEN means operationally
Every layer the edition actually uses has a GREEN row **for every market we
sell in** (US + EU/UK + TR for the store; Amazon marketplaces per format),
signed by the founder. A YELLOW layer is either designed out (Kwaidan's
plates) or carries a written mitigation and stays YELLOW in the ledger until
resolved. A RED layer stops the edition.
