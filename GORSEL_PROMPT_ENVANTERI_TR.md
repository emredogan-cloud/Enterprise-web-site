# 🎨 Görsel Prompt Envanteri — İKİNCİ PASS (forensic, asset-by-asset)

Tüm sinematik sayfalardaki **gerçek görsel varlıklar** için tek merkezî kaynak. Görselleri **biz üretmiyoruz**; her **ayrı** varlık için **GPT Image 2.0 promptu** + **dosya adı/yol** burada. Sen üretip doğru yola koyunca kod onu **otomatik** gösterir.

> **2. PASS notu:** 1. pass varlıkları gruplamıştı ("tek hero artwork", "kapaklar = R2"). Bu pass **her ayrık görsel katmanını** çözer: her kapak, her portre, her tür dünyası, her hero atmosferi, her çerçeveli illüstrasyon ve ikincil kompozisyon **kendi başına** bir satırdır. **Birleştirme/sıkıştırma yok.**

> Bu bir **redesign değildir.** Prosedürel sahneler (LanternScene, DeskScene, AboutScene, CategoryScene, yüzen kitaplar, gradient kapaklar) **kasıtlıdır** ve **fallback** olarak korunur. Bu katman üstlerine **opsiyonel gerçek görsel** ekler.

---

## 1. Mekanizma (Auto-Wiring + Güvenli Fallback)
- **Sunucu slotları:** `<AssetImage src alt fallback>` (`src/components/cinematic/asset-image.tsx`) → `/public<src>` varsa `next/image`, yoksa prosedürel fallback.
- **İstemci slotları** (katalog kartları, /genres & /authors kabukları): yol sunucuda `resolveAsset()` ile çözülür, `imageSrc`/`coverSrc`/`portraitSrc` prop'u olarak indirilir → bileşen `next/image`-veya-prosedürel render eder.
- **Prensip:** `image-first → cinematic-fallback`. Asla boş, asla kırık. Dosyayı bırak → sonraki build/ISR'de görünür.

## 2. Klasör & Adlandırma
Format **`.webp`** (kod uzantıyı `.webp` bekler) · **`snake_case`** · kök **`/public/images/`**.
Klasörler: `books/` · `genres/` · `authors/` · `homepage/` · `blog/` · `library/` · `about/` · `settings/` · `order/` · `search/`.

---

# ORTAK AİLE A — KİTAP KAPAKLARI (her başlık AYRI)
**Yol:** `/public/images/books/{slug}.webp` · **Görünür:** katalog (`/books`), anasayfa "Featured", sepet "You might like", kütüphane önerileri, arama "Popular searches", sipariş kalemleri, hesap-siparişleri kapak yığını. Hepsi aynı dosyayı slug ile paylaşır → bir kez üret, her yerde çıkar.

**Ortak kapak iskeleti** (her başlık için `[KONSEPT]` değişir):
> Original cinematic **book cover** design (NOT a replica of the real published edition), portrait 2:3, for **"[TITLE]"**. [KONSEPT]. Strong central motif, elegant serif title typography integrated into the art, deep cinematic lighting, premium publishing-house quality, subtle film grain. Cohesive with a dark emerald-accented bookstore. High contrast, legible at thumbnail size.
> **Negative:** exact copy of existing cover, photo of a real person, watermark, ui frame, blurry, low-res, cluttered.

| Slug (dosya) | Başlık | [KONSEPT] |
|---|---|---|
| `the-midnight-library.webp` | The Midnight Library | infinite glowing library shelves bending into a starlit midnight sky, single warm doorway |
| `the-silent-patient.webp` | The Silent Patient | a fractured portrait silhouette over cold grey-blue, a single red brushstroke |
| `atomic-habits.webp` | Atomic Habits | bold orange field, a stylized atom/orbit motif made of tiny dots compounding |
| `the-psychology-of-money.webp` | The Psychology of Money | minimalist cream cover, a single coin casting a long psychological shadow |
| `dune.webp` | Dune | vast amber desert dunes, two tiny figures, a colossal sandworm shadow, twin suns |
| `1984.webp` | 1984 | a single watching eye dissolving into pixels, oppressive dark slab, cold red |
| `sapiens.webp` | Sapiens | a red field, a thumbprint that morphs from ape to human silhouettes |
| `thinking-fast-and-slow.webp` | Thinking, Fast and Slow | a sharpened pencil splitting into a fast scribble and a slow precise line, pale cover |
| `the-subtle-art-of-not-giving-a-fck.webp` | The Subtle Art… | bold orange, a calm minimalist mark amid chaotic scribbles |
| `brave-new-world.webp` | Brave New World | sterile rows of identical glowing pods, one tinted red, cold utopian light |
| `the-pragmatic-programmer.webp` | The Pragmatic Programmer | emerald terminal glow, a craftsman's tools merged with code glyphs |
| `meditations.webp` | Meditations | a weathered marble Roman bust in warm torchlight, deep stoic shadow |
| `designing-data-intensive-applications.webp` | Designing Data-Intensive Applications | interlocking data-pipeline nodes glowing teal on deep blue, blueprint feel |
| `zero-to-one.webp` | Zero to One | a single seedling of light rising from a flat line, clean pale cover |
| `the-foundation-trilogy.webp` | The Foundation Trilogy | a spiral galaxy encoded as a vast equation, violet cosmic depth |
| `the-art-of-war.webp` | The Art of War | a lone ink-brush general silhouette on a blood-red banner, gold seal |

**Yalnız anasayfa "Featured" / öneri raflarında görünen ek başlıklar** (aynı iskelet):
`the-seven-husbands-of-evelyn-hugo.webp` (glamorous golden Hollywood-era portrait silhouette, emerald dress) · `rich-dad-poor-dad.webp` (two contrasting houses, gold vs grey) · `anil-mary.webp` (warm red literary cover, two intertwined names motif).

> Kitap kapakları AYRICA R2 hattından da gelebilir (`coverKey`, `/admin`). Kod önceliği: `/images/books/{slug}.webp` (katalogda wire edildi) → R2 → gradient placeholder.

---

# ORTAK AİLE B — TÜR / KATEGORİ GÖRSELLERİ (her tür AYRI)
**Yol:** `/public/images/genres/{slug}.webp` · **Görünür:** anasayfa kategori kartları, `/genres` kartları, `/categories` galeri kartları, arama "browse by category". Slug ile paylaşılır.

**İskelet:** Cinematic atmospheric "world" for the **[GENRE]** genre. [SAHNE]. Painterly matte-painting, volumetric light, deep shadow, fine grain, subtle emerald rim accent (#33f0aa) within the scene's palette ([PALET]). No text, no faces, no watermark. 3:2.

**B1 — Kurgu alt türleri (`/categories`, 10):**
| Dosya | Tür | [SAHNE] / [PALET] |
|---|---|---|
| `fantasy.webp` | Fantasy | dark castle on a misty moonlit ridge / violet-indigo + silver |
| `science-fiction.webp` | Science Fiction | neon megacity skyline, ringed planet / cyan-blue + magenta |
| `mystery.webp` | Mystery | foggy lamplit cobblestone street / slate-teal + amber |
| `historical-fiction.webp` | Historical Fiction | candlelit study, old maps, stone columns / sepia-amber |
| `romance.webp` | Romance | rolling golden-hour hills, soft bokeh, low sun / rose-peach + gold |
| `horror.webp` | Horror | bare dead forest under a dim blood-moon, mist / blood-red + near-black |
| `adventure.webp` | Adventure | layered mountains at dawn, faint trail / teal-green + sunrise gold |
| `literary-fiction.webp` | Literary Fiction | quiet desk by a rain window, open book / warm neutral + emerald |
| `poetry.webp` | Poetry | ink-blue desk, inkwell, quill, single sheet / indigo + moonlight |
| `young-adult.webp` | Young Adult | vast starry sky, lone figure, aurora / violet-pink + starlight |

**B2 — Geniş türler (`/genres`, 8):**
| Dosya | Tür | [SAHNE] |
|---|---|---|
| `fiction.webp` | Fiction | open book emitting story-light, drifting pages |
| `personal-growth.webp` | Personal Growth | a glowing sprout breaking through stacked books at sunrise |
| `business.webp` | Business | a minimalist chess king / rising glass tower at dusk |
| `history.webp` | History | weathered ancient columns and an unrolled timeline scroll |
| `technology.webp` | Technology | a glowing emerald microchip city, data traces |
| `philosophy.webp` | Philosophy | a classical marble bust half-lit in fog |
| `arts-photography.webp` | Arts & Photography | a vintage camera lens refracting warm light into color |

---

# ORTAK AİLE C — YAZAR PORTRELERİ (her yazar AYRI)
**Yol:** `/public/images/authors/{slug}.webp` · **Görünür:** `/authors` kartları + `/authors/[slug]` hero. (WIRE EDİLDİ.)

**İskelet:** Cinematic chiaroscuro portrait of **[TANIM]**, three-quarter view, single-source rim light, deep shadow bg, shallow DoF, fine grain, subtle emerald edge accent. Mood: [MIZAÇ]. Editorial author-portrait quality, dignified. 1:1 head-and-shoulders. No text/logo/watermark/extra people.

| Dosya | Yazar / [TANIM] | [MIZAÇ] |
|---|---|---|
| `yuval-noah-harari.webp` | contemporary historian | sage-green, intellectual calm |
| `jane-austen.webp` | refined early-1800s English novelist | candlelit sepia, period elegance |
| `dan-brown.webp` | modern thriller novelist | cold blue, suspense |
| `george-orwell.webp` | mid-20th-c essayist in tweed | grey, austere, smoky |
| `j-k-rowling.webp` | contemporary storyteller | warm amber, imaginative |
| `robert-kiyosaki.webp` | confident business author | gold-charcoal, assured |
| `isaac-asimov.webp` | visionary sci-fi author | deep blue, futurist |
| `frank-herbert.webp` | contemplative sci-fi author | desert-amber, epic |
| `james-clear.webp` | clean self-improvement author | bright emerald, focused |
| `marcus-aurelius.webp` | Roman emperor-philosopher (bust) | marble + torchlight, stoic |
| `martin-kleppmann.webp` | software/systems author | cool teal, precise |
| `daniel-kahneman.webp` | behavioural-science author | warm neutral, perceptive |

---

# SAYFA SAYFA — HER AYRI GÖRSEL KATMANI

> Wiring sütunu: ✓ = kod bu yolu bekler (bırak → çıkar). "convention" = aynı aile yolu, ilgili sayfada henüz wire edilmedi. "deferred" = bilinçli ertelendi (sebebi yazılı).

### 1) Homepage `/`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero — birleşik kompozisyon (pedestaldeki ana kitap + 2 yüzen kitap + okuma odası) | `homepage_hero_reading_room.webp` | `homepage/` | ✓ (fallback=yüzen-kitap kümesi) |
| 1a | Hero ana kitap kapağı "The Luminous Library" (yüzen, yüzlü amblem) | `homepage_hero_main_cover.webp` | `homepage/` | enumerated (alternatif; #1 birleşik slot wire) |
| 1b–c | Hero arka 2 yüzen kitap kapağı | `homepage_hero_back_cover_1/2.webp` | `homepage/` | enumerated |
| 2 | Kategori kartı görselleri ×5 | `genres/{slug}.webp` (Aile B) | `genres/` | ✓ |
| 3 | Featured kapaklar ×6 | `books/{slug}.webp` (Aile A) | `books/` | convention (sunucu; AssetImage ile eklenebilir) |
*Pedestal aurası, "Why readers" ikonları = prosedürel/ikon, görsel slotu yok.*

**Hero birleşik prompt (`homepage_hero_reading_room.webp`):**
> Cinematic hero artwork: three premium books floating/suspended in an emerald-tinted cosmic void above a soft glowing pedestal, a faint nebula band, dust motes in god-rays; the central book larger and lit, two smaller behind at depth. Deep #050705 + emerald (#16c784/#33f0aa). Painterly, A24/editorial, dark negative space at edges for UI. 4:5. No text, no readable faces, no watermark.
> Ayrı kapak isteyenler için 1a: *original cover for "The Luminous Library" — a glowing library reflected inside a single open book, a luminous face-emblem medallion, emerald + gold.*

### 2) Books `/books`
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | Katalog kapakları ×10 (Midnight Library, Silent Patient, Atomic Habits, Psychology of Money, Dune, 1984, Sapiens, Thinking Fast&Slow, Subtle Art, Brave New World, …) | `books/{slug}.webp` (Aile A) | ✓ (sunucu-resolved `coverSrc` → katalog kartı) |
*Katalog hero'su = metin + toz (prosedürel).*

### 3) Blog index `/blog` ("Notes from the bookstore")
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | Makale satırı önizleme ×3 (warm-library / emerald-portal / open-book) | `blog/{post-slug}.webp` | deferred (satırlar `blog-shell` istemci kabuğunda; `server-only AssetImage` kullanılamaz — aynı dosya makale hero'da gösterilir) |
*Hero = metin + toz.*

### 4) Blog Article `/blog/[slug]`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Makale hero görseli (gece kütüphane/masa, yeşil lamba, pencere) | `blog/{slug}.webp` | `blog/` | ✓ (fallback=LibraryScene) |
| 2 | Yazar byline + bio avatarı (Eleanor Page) | `blog/author_eleanor_page.webp` | `blog/` | deferred (byline gradient avatar; eklenebilir) |
| 3 | Gövde içi gömülü görsel(ler) | `blog/{slug}_inline_1.webp` … | `blog/` | deferred (markdown gövdesi; ileride) |

**Hero prompt (`blog/{slug}.webp`):** her yazının konusuna uygun, gece kütüphane/masa atmosferi, emerald lamba, metinsiz, 21:9 geniş. Örn `blog/how-to-choose-your-next-book.webp`: *a desk at night, an open book under a green banker's lamp, a rain window, shelves behind.*

### 5) Reading Guides `/blog/category/reading-guides`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero atmosferi (rahat okuma köşesi: koltuk, battaniye, lamba, bitki, gece) | `blog/reading_guides_hero.webp` | `blog/` | deferred (kategori metin-hero'su) |
| 2 | Satır önizleme ×N | `blog/{slug}.webp` | `blog/` | deferred (bkz. §3) |

### 6) Cart `/cart`
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | "You might like" öneri kapakları ×6 | `books/{slug}.webp` (Aile A) | convention |
*Boş sepet = ikon (görsel slotu yok).*

### 7) Authors `/authors` + `/authors/[slug]`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero atmosferi (emerald kapı/portal içinde okuyucu silüeti, raflar) | `authors/authors_hero_atmosphere.webp` | `authors/` | ✓ (fallback=portal sahnesi) |
| 2 | Yazar portreleri ×12 | `authors/{slug}.webp` (Aile C) | `authors/` | ✓ |

**Hero prompt:** *Cinematic dim library hall, a lone reader silhouette standing in a glowing emerald archway/portal, tall shelves fading into shadow, dust in light. Mysterious, premium. No text/face detail. 21:9, dark edges for overlay.*

### 8) Genres `/genres`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero atmosferi (emerald kemer/portal + raflar) | `genres/genres_hero_atmosphere.webp` | `genres/` | deferred (GenresShell istemci kabuğunda; prop-thread ile eklenebilir) |
| 2 | Tür kartı artwork ×8 | `genres/{slug}.webp` (Aile B2) | `genres/` | ✓ |
| 3 | Alt "Not sure where to start?" sahnesi (yığılı kitaplar + filiz) | `genres/genres_explore_scene.webp` | `genres/` | ✓ (fallback=ExploreScene) |

**Explore prompt (`genres_explore_scene.webp`):** *a tidy stack/row of book spines on a shelf with a small glowing emerald sprout growing from them, soft bloom, dark bg. 16:9, mask-fades right.*

### 9) Search `/search`
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | "Popular searches" kapak küçük resimleri | `books/{slug}.webp` (Aile A) | convention |
| 2 | "Browse by category" tür ikon-artwork ×8 | `genres/{slug}.webp` (Aile B) | convention |
*Hero = metin + toz; boş kart = ikon.*

### 10) Library `/account/library`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero atmosferi (gece kütüphane rafı + sıcak fener) | `library/library_atmosphere.webp` | `library/` | ✓ |
| 2 | Boş kütüphane sahnesi (yığılı kitaplar + emerald parıltı) | `library/library_empty_scene.webp` | `library/` | ✓ |
| 3 | "Discover next favorite" öneri kapakları ×5 | `books/{slug}.webp` (Aile A) | convention |

### 11) Categories `/categories`
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | Tür dünyası sahneleri ×10 | `genres/{slug}.webp` (Aile B1) | ✓ |
*Hero = metin; bildirim şeridi = cam.*

### 12) Order `/order/[id]`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero fener sahnesi (fener + emerald kristal + raf kitapları, gece) | `order/order_lantern_scene.webp` | `order/` | ✓ |
| 2 | Sipariş kalemi kapakları | `books/{slug}.webp` (Aile A) | convention |

### 13) Account Orders `/account/orders`
| # | Ayrı görsel | Dosya | Wiring |
|---|---|---|---|
| 1 | Hero fener sahnesi | `order/order_lantern_scene.webp` (paylaşılır) | ✓ |
| 2 | Sipariş kartı kapak yığını mini kapakları | `books/{slug}.webp` (Aile A) | convention |

### 14) Settings `/account/settings`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero desk sahnesi (emerald masa lambası + kristal) | `settings/settings_desk_scene.webp` | `settings/` | ✓ |
| 2 | "Export your data" parıltılı sandık/veri illüstrasyonu | `settings/settings_export_chest.webp` | `settings/` | deferred (eklenebilir) |
| 3 | "Delete account" kırmızı parçacık patlaması | `settings/settings_danger_burst.webp` | `settings/` | deferred (prosedürel kırmızı burst yeterli) |
*Profil avatarı = Clerk fotoğrafı (statik asset değil).*

**Export prompt (`settings_export_chest.webp`):** *a glowing emerald data-chest/portable archive box opening with light streams of JSON glyphs, dark bg, premium. 4:3.*

### 15) About `/about`
| # | Ayrı görsel | Dosya | Yol | Wiring |
|---|---|---|---|---|
| 1 | Hero sahnesi (açık kitap + havada emerald kristal + fener) | `about/about_hero_scene.webp` | `about/` | ✓ |
| 2 | Kurucu portresi ("Who built it") | `about/founder_portrait.webp` | `about/` | ✓ (fallback=ED baş harfleri) |
*"What we believe" = 4 ikon; manifesto = metin.*

---

## WIRING DURUMU (Özet — orphan kontrolü)

**Wire edilmiş yollar** (kod bekler → bırak → çıkar; yoksa prosedürel/gradient):
`books/{slug}.webp` (katalog) · `genres/{slug}.webp` (anasayfa kat. + /genres kart + /categories) · `authors/{slug}.webp` (/authors kart+detay) · `authors/authors_hero_atmosphere.webp` · `genres/genres_explore_scene.webp` · `blog/{slug}.webp` (makale hero) · `library/library_atmosphere.webp` · `library/library_empty_scene.webp` · `about/about_hero_scene.webp` · `about/founder_portrait.webp` · `settings/settings_desk_scene.webp` · `order/order_lantern_scene.webp` (order+orders) · `homepage/hero_reading_room.webp`.

**convention** (aynı aile, sunucu slotunda AssetImage ile kolayca eklenir): featured/cart/library/search/order kapakları, search tür ikonları.

**deferred** (sebebi yazılı): istemci-kabuğu slotları (blog satırları, /genres hero), metin-hero'lar (blog/reading-guides), ikon boş-durumlar (cart/search), settings export-chest & danger-burst, blog yazar avatarı & gövde-içi görseller, homepage ayrık hero kapakları.

## Doğrulama
- [x] 15 referans görseli **ayrı-ayrı** forensic tarandı (kapak/portre/tür/hero/illüstrasyon/atmosfer katmanları).
- [x] Her ayrık varlık → kendi dosya adı + yol + prompt (gruplama yok).
- [x] Wire edilen yollar ↔ kod; convention/deferred açıkça işaretli (orphan yok).
- [x] `lint` · `tsc` · `build` temiz; görsel yokken tüm slotlar prosedürel sahneye düşer.
