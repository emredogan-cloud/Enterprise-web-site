# PADDLE REVIEW SNAPSHOT

**Taken:** 2026-09-12 15:46 UTC · **Domain:** valicepress.com · **Status:** `RE-REVIEW REQUESTED — NOT APPROVED`

> Paddle has **not** approved this account. This file records the state the domain
> was left in, so that whatever Paddle says next can be read against it.

---

## 1. The state Paddle is being asked to review

| | |
|---|---|
| Visible commercial titles | **12** — all original Valice Press publications |
| Of those, with a checkout | **9** |
| Public-domain titles on the storefront | **0** |
| Public-domain titles hidden (preserved) | **18** |
| Active Paddle products | **9** |
| Archived Paddle products | **18** |
| Active Paddle prices | **9** |
| Active Paddle discounts | **0** |
| Physical editions | Amazon only — never in Paddle checkout |

## 2. Visible products (12)

| Title | Slug | Paddle checkout | Amazon print editions |
|---|---|---|---|
| Codex Mythologica | `codex-mythologica` | no | ebook, paperback, hardcover, large_print |
| Codex Bestiarium | `codex-bestiarium` | **yes** | ebook, paperback, hardcover, large_print |
| The Great Book of World Myths | `the-great-book-of-world-myths` | **yes** | ebook, paperback, hardcover |
| The Great Book of World Games | `the-great-book-of-world-games` | **yes** | ebook, paperback, hardcover, large_print |
| The Myth Hunter's Field Book | `the-myth-hunters-field-book` | no | paperback |
| The Greek Alphabet Handwriting Workbook | `greek-alphabet-handwriting-workbook` | **yes** | — |
| Codex Mythologica: The Puzzle Book | `codex-mythologica-the-puzzle-book` | **yes** | paperback |
| Korean Hangul Handwriting Workbook | `korean-hangul-handwriting-workbook` | no | paperback, hardcover |
| Codex Enigmatica | `codex-enigmatica` | **yes** | ebook, paperback, hardcover |
| Pencil & Paper | `pencil-and-paper` | **yes** | — |
| How the World Began | `how-the-world-began` | **yes** | — |
| The Trickster's Table | `the-tricksters-table` | **yes** | — |

Three visible titles carry no checkout: `codex-mythologica` (its Kindle edition is
under KDP Select exclusivity until 2026-11-03), `the-myth-hunters-field-book` and
`korean-hangul-handwriting-workbook` (no digital edition exists). All three are
original Valice Press books that route to Amazon — the separation Paddle asked for.

## 3. Hidden products (18) — preserved, not deleted

| Title | Slug | Master file preserved | Carries a Paddle price |
|---|---|---|---|
| Meditations | `meditations` | yes | no |
| The Puzzles of Henry Dudeney | `the-puzzles-of-henry-dudeney` | yes | no |
| Epictetus: The Discourses and Enchiridion | `epictetus-discourses-and-enchiridion` | yes | no |
| Seneca: Selected Dialogues | `seneca-selected-dialogues` | yes | no |
| Myths and Legends of China | `myths-and-legends-of-china` | yes | no |
| Indian Myth and Legend | `indian-myth-and-legend` | yes | no |
| Mythical Monsters | `mythical-monsters` | yes | no |
| Games Ancient and Oriental: The Egyptian Games | `games-ancient-and-oriental` | yes | no |
| Korean Games: The Games of Chance and Divination | `korean-games` | yes | no |
| Kwaidan: Stories and Studies of Strange Things | `kwaidan` | yes | no |
| The Fairy Mythology, Volume I | `fairy-mythology-vol-1` | yes | no |
| The Fairy Mythology, Volume II | `fairy-mythology-vol-2` | yes | no |
| British Goblins | `british-goblins` | yes | no |
| The Book of Were-Wolves | `book-of-were-wolves` | yes | no |
| Sea Monsters Unmasked, and Sea Fables Explained | `sea-monsters-unmasked` | yes | no |
| The Singing Games of England, Scotland, and Ireland | `traditional-games` | yes | no |
| Chess and Playing Cards: The Chess, Divination and Card Collections | `chess-and-playing-cards` | yes | no |
| Mancala, the National Game of Africa | `mancala` | yes | no |

Every row keeps its title, description, categories, formats, ISBN and R2 master
key. Nothing was deleted. See `storefront-snapshot-2026-09-12-pre-isolation.json`
for the complete pre-change state.

## 4. Active Paddle catalogue

- The Trickster's Table: Eighteen Trickster Tales from Eleven Traditions, and What Each One Cost
- How the World Began: Thirty Creation Myths from Every Corner of the Earth, Told Whole
- Pencil & Paper: 60 Games That Need Nothing but a Pencil
- Codex Mythologica: The Puzzle Book
- The Greek Alphabet Handwriting Workbook
- The Great Book of World Myths
- The Great Book of World Games
- Codex Enigmatica: One Hundred Engraved Enigmas
- Codex Bestiarium: A World Bestiary

## 5. Verification performed

| Check | Result |
|---|---|
| Hidden product page | `404` — meditations, british-goblins, kwaidan, sea-monsters-unmasked, mancala, seneca-selected-dialogues |
| Hidden title in site search | absent — 5 queries |
| Hidden title in `/books` | absent — *"Showing 1-12 of 12 books"* |
| Hidden title on homepage shelf | absent — 12 covers, 0 hidden |
| Hidden title in `sitemap.xml` | absent |
| Hidden title in AI assistant inventory | absent — `listPublishedBooks` returns 12 |
| AI assistant offered a hidden title | **no** — 5 titles asked, none offered |
| AI assistant denied publication falsely | fixed — now says "not in the current storefront" |
| Original book page + checkout | works — codex-bestiarium, codex-enigmatica, the-great-book-of-world-games |
| Empty category shelf | repaired — `classics-and-philosophy` no longer listed |
| Broken covers | 0 — three thumbnails regenerated at 432px |
| Physical routing | 23 Amazon editions, ASIN-verified |

## 6. Paddle's review history

| Date (UTC) | Findings |
|---|---|
| 2026-09-09 16:10 | Physical goods |
| 2026-09-11 17:53 | Third-party content **+** physical goods |
| 2026-09-12 13:32 | Third-party content **only** — physical goods finding **cleared** |

The 13:32 review ran after the checkout separation deployed but **before** the
storefront isolation went live (~15:00 UTC), so it still saw the public-domain
titles listed. Paddle has named no specific product or URL in any of the three.

## 7. What has not happened

- **The "Resubmit domain for review" button has NOT been pressed.** It is behind
  the Paddle dashboard login at `vendors.paddle.com/onboarding/get-started`, which
  redirects to `login.paddle.com` and requires an email and password. No password
  was entered or requested. The Founder must press it.
- **Paddle has not approved the account.**
