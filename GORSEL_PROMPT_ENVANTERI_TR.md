# 🎨 Görsel Prompt Envanteri (Visual Asset Source-of-Truth)

Bu dosya, tüm sinematik sayfalardaki **gerçek görsel varlıklar** için tek merkezî kaynaktır. Görselleri **biz üretmiyoruz**; her eksik görsel için **GPT Image 2.0 üretim promptu** + **kaydedilecek dosya adı/yol** burada tanımlıdır. Sen görseli üretip doğru yola koyunca, kod onu **otomatik** gösterir.

> Bu bir **redesign değildir**. Mevcut sinematik prosedürel sahneler (LanternScene, DeskScene, AboutScene, CategoryScene, anasayfa yüzen kitaplar, gradient kapak placeholder'ları) **kasıtlıdır** ve **fallback** olarak korunur. Bu hat, üstlerine **opsiyonel gerçek görsel katmanı** ekler.

---

## 1. Çalışma Mantığı (Auto-Wiring + Güvenli Fallback)

- **Mekanizma:** `src/components/cinematic/asset-image.tsx` → `<AssetImage>`. Sunucuda `/public<src>` dosyasının var olup olmadığını kontrol eder (`src/lib/assets.ts`).
  - Dosya **varsa** → optimize `next/image` gösterilir.
  - Dosya **yoksa** → mevcut **prosedürel sahne / placeholder** (fallback) gösterilir.
- **Prensip:** `image-first → cinematic-fallback`. Slot **asla boş**, **asla kırık** olmaz.
- **Görsel ekleyince:** Aynı ad/yola `.webp` koy → **bir sonraki build / ISR yenilenmesinde** otomatik görünür. Ek kod gerekmez.
  - `○ Static` sayfalar build anında kontrol eder → görsel ekledikten sonra **redeploy** gerekir.
  - `ƒ Dynamic` sayfalar her istekte kontrol eder → anında görünür.
- **İstemci (client) bileşenleri** (örn. `/genres`, `/authors` filtre kabukları) dosya sistemine erişemez; oralarda yol sunucuda çözülüp `imageSrc` prop'u olarak aşağıya geçirilir (aynı güvenli fallback davranışı).

## 2. Adlandırma & Klasör Kuralları

- Format: **`.webp`** (gerekirse `.jpg`/`.png` da çalışır — kod uzantıyı `.webp` bekler; farklı uzantı kullanacaksan envanterdeki dosya adını ona göre güncelle).
- İsimlendirme: **`snake_case`**, stabil, tahmin edilebilir.
- Kök klasör: **`/public/images/`** → URL'de `/images/...`.
- Alt klasörler:
  - `/public/images/homepage/`
  - `/public/images/genres/`  → tür/kategori görselleri (slug bazlı, **tüm sayfalarda paylaşılır**)
  - `/public/images/authors/` → yazar portreleri (slug bazlı, **paylaşılır**)
  - `/public/images/blog/`
  - `/public/images/library/`
  - `/public/images/search/`
  - `/public/images/cart/`

## 3. Kapsam Notu — Kitap Kapakları (R2 hattı, bu envanterin DIŞINDA)

Kitap kapakları bu statik `/public` hattına **dahil değildir**. Kapaklar zaten ayrı bir boru hattına sahip: **Cloudflare R2** + admin yükleme (`books.coverKey` → `getCoverImageUrl`). Kapak görseli yoksa kod zaten sinematik **gradient/tipografik placeholder**'a düşer (`CoverImage`, `BookCover`, `OrderCoverStack`, katalog kart kapağı). Yani:
- Gerçek kapak istiyorsan → `/admin` üzerinden ilgili kitabın `coverKey`'ini yükle (R2).
- Üretim promptu istiyorsan → §"Ortak Aile: Kitap Kapağı Şablonu" altındaki şablonu kullan, üretip R2'ye yükle.

---

## ORTAK AİLELER (slug bazlı, çok sayfada paylaşılır)

### Aile A — Tür / Kategori Görselleri
**Yol:** `/public/images/genres/{slug}.webp` · **Kullanım:** `/genres` kartları, `/categories` galeri kartları, anasayfa "Browse by category" kartları, `/categories/[slug]` hero. Hepsi aynı dosyayı paylaşır.

Ortak prompt iskeleti (her tür için `[SAHNE]` ve `[PALET]` değişir):
> Cinematic, atmospheric establishing shot representing the **[GENRE]** book genre as a "world". [SAHNE]. Painterly digital matte-painting, volumetric god-rays, deep shadows, fine film grain, subtle emerald rim-light accent (#33f0aa) blended into the scene's own palette ([PALET]). No text, no people's faces, no logos, no watermark. 3:2 landscape, premium editorial book-cover-art quality, moody, mysterious, expensive.
> **Negative:** text, typography, watermark, ui, frame, border, low-res, cartoonish, stock-photo cliché.

| Slug (dosya) | Tür | [SAHNE] | [PALET] |
|---|---|---|---|
| `fantasy.webp` | Fantasy | a dark castle on a misty mountain ridge under a moon, distant spires | deep violet/indigo + moonlit silver |
| `science-fiction.webp` | Science Fiction | a neon megacity skyline at night, holographic haze, a distant ringed planet | cyan/electric-blue + magenta glow |
| `mystery.webp` | Mystery | a foggy cobblestone night street, a single lit lamppost, long shadows | slate-teal + cold amber lamp |
| `historical-fiction.webp` | Historical Fiction | weathered classical stone columns / a candlelit study with old maps | warm sepia/amber + parchment |
| `romance.webp` | Romance | rolling warm hills at golden hour, soft bokeh, a low setting sun | rose/peach + warm gold |
| `horror.webp` | Horror | a bare dead forest under a dim blood-moon, low mist, heavy vignette | blood-red + near-black |
| `adventure.webp` | Adventure | a layered mountain range at dawn with a faint trail and big sky | teal-green + sunrise gold |
| `literary-fiction.webp` | Literary Fiction | a quiet desk by a rain window, an open book in soft lamplight | warm neutral + emerald lamp |
| `poetry.webp` | Poetry | an ink-blue desk with an inkwell, a quill and a single sheet of paper | deep indigo + soft moonlight |
| `young-adult.webp` | Young Adult | a vast starry sky over a low horizon, a lone small figure, aurora band | violet/pink + starlight |

`/genres` keşif sayfasındaki **geniş türler** de aynı klasörü kullanır (dosya = slug): `fiction.webp`, `personal-growth.webp`, `business.webp`, `history.webp`, `technology.webp`, `philosophy.webp`, `arts-photography.webp`. Aynı iskelet; sırasıyla: açık kitap/hikâye atmosferi · filizlenen bitki & sabah ışığı · minimalist kule/satranç şahı & altın · antik sütunlar & zaman · devre kartı/çip & emerald veri ışığı · klasik büst & sis · objektif/kamera & sıcak ışık.

### Aile B — Yazar Portreleri
**Yol:** `/public/images/authors/{slug}.webp` · **Kullanım:** `/authors` kartları + `/authors/[slug]` hero paneli. Paylaşılır.

Ortak portre promptu (her yazar için `[İSİM-TANIM]` ve `[MIZAÇ/PALET]` değişir):
> Cinematic chiaroscuro studio portrait of **[İSİM-TANIM]**, three-quarter view, looking slightly off-camera, dramatic single-source rim light, deep shadow background, shallow depth of field, fine grain, subtle emerald edge-light accent (#33f0aa). Mood: [MIZAÇ/PALET]. Photoreal, editorial author-portrait quality, dignified, literary. Square 1:1, head-and-shoulders. No text, no logo, no watermark, no extra people.
> **Negative:** text, watermark, deformed hands, extra fingers, multiple faces, cartoon, oversaturated, stock-photo.

| Slug (dosya) | Yazar | [İSİM-TANIM] | [MIZAÇ/PALET] |
|---|---|---|---|
| `yuval-noah-harari.webp` | Yuval Noah Harari | a thoughtful contemporary historian | cool sage-green, intellectual calm |
| `jane-austen.webp` | Jane Austen | a refined early-19th-century English novelist | warm candlelit sepia, period elegance |
| `dan-brown.webp` | Dan Brown | a modern thriller novelist | tense cold blue, cinematic suspense |
| `george-orwell.webp` | George Orwell | a mid-20th-century essayist in muted tweed | grey, austere, smoky |
| `j-k-rowling.webp` | J. K. Rowling | a contemporary storyteller | soft warm amber, imaginative |
| `robert-kiyosaki.webp` | Robert Kiyosaki | a confident business author | gold-accented charcoal, assured |
| `isaac-asimov.webp` | Isaac Asimov | a visionary 20th-century sci-fi author | deep blue, futurist |
| `frank-herbert.webp` | Frank Herbert | a contemplative sci-fi author | desert-amber + dark, epic |
| `james-clear.webp` | James Clear | a clean modern self-improvement author | bright minimal emerald, focused |
| `marcus-aurelius.webp` | Marcus Aurelius | a Roman emperor-philosopher (classical bust feel) | marble + warm torchlight, stoic |
| `martin-kleppmann.webp` | Martin Kleppmann | a modern software/systems author | cool teal, precise, technical |
| `daniel-kahneman.webp` | Daniel Kahneman | a wise behavioural-science author | warm neutral, perceptive |

---

## SAYFA SAYFA ENVANTER

> Aşağıdaki tablolar **planlanan slotları + promptları** listeler. **Gerçek wiring durumu** için dosyanın sonundaki **"WIRING DURUMU (Özet)"** bölümü esastır — bazı slotlar bilinçli ertelendi (metin-hero / ikon boş-durum / istemci kabuğu) ve orada açıkça işaretlidir.

### 1) Homepage (`/`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Hero artwork (sağ) | Hero'daki yüzen-kitap kümesinin yerine sinematik okuma-odası kompozisyonu | `homepage_hero_reading_room.webp` | `/public/images/homepage/` | AI | `Hero` → `<AssetImage>` fallback=`<HeroBook/>` |
| Kategori kartı görseli (×5) | "Browse by category" kartlarının arka planı | `genres/{slug}.webp` (Aile A) | `/public/images/genres/` | AI | `CategoriesSection` → `<AssetImage>` fallback=gradient |
| Featured kapaklar (×6) | Öne çıkan kitap kapakları | (R2 `coverKey`) | — | R2 | Kapak hattı (§3) |

**Hero prompt (`homepage_hero_reading_room.webp`):**
> Cinematic wide hero artwork: a luxurious late-night private reading room floating in an emerald-tinted void — a leather armchair, a tall glowing bookshelf, a single warm reading lamp, an open book emitting soft emerald light, fine dust motes in god-rays. Deep blacks (#050705) with emerald atmosphere (#16c784/#33f0aa), volumetric depth, premium A24/editorial mood, painterly matte-painting realism. No text, no logo, no watermark, no readable faces. 4:5 portrait composition, focal subject centered, dark negative space at edges for UI overlay.
> **Negative:** text, ui, watermark, busy, neon-cyberpunk, low-res, flat.

### 2) Books (`/books`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Katalog kart kapakları | Her kitabın kapağı | (R2 `coverKey`) | — | R2 | Kapak hattı (§3). Yoksa gradient placeholder. |
| Ürün detay kapağı (`/books/[slug]`) | Detay hero kapağı | (R2 `coverKey`) | — | R2 | `BookCover` zaten R2-or-placeholder |

Not: Katalog hero'su (eyebrow + "All books" + toz) **kasıtlı prosedürel** — gerçek görsel slotu yok. Kapaklar R2 hattından gelir.

### 3) Blog (`/blog`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Blog hero görseli | Editöryel hero atmosferi | `blog_hero_editorial.webp` | `/public/images/blog/` | AI | `BlogHero` → `<AssetImage>` fallback=mevcut sahne |
| Makale satırı görselleri | Liste öğesi kapak/önizleme | `blog/{post-slug}.webp` | `/public/images/blog/` | AI | `article-row`/`article-image` → `<AssetImage>` fallback |

**Blog hero prompt (`blog_hero_editorial.webp`):**
> Cinematic editorial header image: an antique writing desk at night with an open journal, a fountain pen, scattered manuscript pages and a warm lamp, emerald dust in the air, deep black-green background. Painterly, moody, premium magazine feel. No text, no faces, no watermark. 3:1 wide banner, subject left, dark space right for headline overlay.

**Makale görseli iskeleti (`blog/{post-slug}.webp`):** her yazının konusuna uygun, emerald-tinted, metinsiz, 3:2, painterly editorial illustration. (Mevcut yazılar: `why-we-built-a-digital-bookstore`, `how-to-choose-your-next-book`, `designing-for-readers-not-algorithms`.)

### 4) Blog Article (`/blog/[slug]`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Makale hero görseli | Yazı başı büyük görsel | `blog/{slug}.webp` (yukarıdakiyle aynı) | `/public/images/blog/` | AI | `ArticleHero`/`LibraryScene` → `<AssetImage>` fallback |
| Gömülü kütüphane atmosferi | Yazı içi atmosfer (`library-scene`) | `blog/article_library_atmosphere.webp` | `/public/images/blog/` | AI | `LibraryScene` (article) → `<AssetImage>` fallback |

**Gömülü atmosfer prompt (`article_library_atmosphere.webp`):**
> Cinematic wide shot of a vast dim library reading hall at night, tall shelves vanishing into emerald shadow, a few warm desk lamps, dust in light shafts. Painterly, atmospheric, deep #050705 blacks + emerald glow. No text, no faces. 16:9.

### 5) Reading Guides (`/blog/category/reading-guides`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Reading-guides hero | Rehber atmosferi | `blog/reading_guides_hero.webp` | `/public/images/blog/` | AI | kategori hero → `<AssetImage>` fallback |

**Prompt (`reading_guides_hero.webp`):**
> Cinematic image: a curated reading nook — a stack of books, a steaming cup, a soft blanket, a window with rain at night, warm lamp + emerald ambient glow. Cozy, premium, editorial. No text, no faces. 3:1 wide.

### 6) Cart (`/cart`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Öneri kitap kapakları | Recommendation shelf kapakları | (R2 `coverKey`) | — | R2 | Kapak hattı |
| Boş sepet görseli | Empty-cart atmosferi | `cart_empty_scene.webp` | `/public/images/cart/` | AI | `empty-cart-card` → `<AssetImage>` fallback |

**Boş sepet prompt (`cart_empty_scene.webp`):**
> Cinematic still life: a single empty woven basket beside a small stack of books on a dark table, soft emerald rim-light, dust motes, deep black-green background. Quiet, premium, inviting. No text, no faces. 4:3.

### 7) Authors (`/authors` + `/authors/[slug]`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Yazar portreleri | Kart + detay hero portresi | `authors/{slug}.webp` (Aile B) | `/public/images/authors/` | AI | `AuthorPortrait` → `imageSrc` (server-resolved), fallback=prosedürel portre |

### 8) Genres (`/genres`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Tür kartı görselleri | Keşif kartı görseli | `genres/{slug}.webp` (Aile A) | `/public/images/genres/` | AI | `GenreArtwork` → `imageSrc` (server-resolved), fallback=SVG sembol |

### 9) Search (`/search`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Boş-durum / öneri görseli | Sorgu yokken atmosfer | `search_discovery_scene.webp` | `/public/images/search/` | AI | search empty paneli → `<AssetImage>` fallback |

**Prompt (`search_discovery_scene.webp`):**
> Cinematic image: a glowing magnifying glass hovering over an open book, emerald light beams forming constellations of tiny letters rising into a dark void. Magical discovery mood, premium. No text, no faces. 3:2.

### 10) Library (`/account/library`)
| Slot | Amaç | Dosya | Yol | Tür | Wiring |
|---|---|---|---|---|---|
| Kütüphane atmosfer görseli | Hero/atmosfer | `library/library_atmosphere.webp` | `/public/images/library/` | AI | library hero/scene → `<AssetImage>` fallback |
| Boş kütüphane illüstrasyonu | Hiç kitap yokken | `library/library_empty_scene.webp` | `/public/images/library/` | AI | empty-state → `<AssetImage>` fallback |
| Kitap kapakları | Sahip olunan kitaplar | (R2 `coverKey`) | — | R2 | Kapak hattı |

**Atmosfer prompt (`library_atmosphere.webp`):**
> Cinematic personal home library at night: floor-to-ceiling shelves, a rolling ladder, a warm reading lamp, an armchair, emerald moonlight through a tall window, dust in light. Premium, intimate, deep #050705 + emerald. No text, no faces. 16:9.

**Boş kütüphane prompt (`library_empty_scene.webp`):**
> Cinematic image: a single empty wooden bookshelf softly lit by emerald light in a dark room, one lonely book on the shelf, dust motes, inviting negative space. Quiet, premium, hopeful. No text, no faces. 4:3.

### 11) Kalan sinematik rotalar (atmosfer sahneleri — WIRE EDİLDİ ✓)
Bu sahneler **kasıtlı prosedüreldir** ama `<AssetImage>` ile augment edildi (sahne fallback olarak korunur):
| Sayfa | Slot | Dosya | Yol | Wiring |
|---|---|---|---|---|
| `/about` | Hero atmosferi (AboutScene) | `about_hero_scene.webp` | `/public/images/about/` | ✓ `about-hero` |
| `/account/settings` | Desk sahnesi (DeskScene) | `settings_desk_scene.webp` | `/public/images/settings/` | ✓ `settings-hero` |
| `/order/[id]` + `/account/orders` | Lantern sahnesi (LanternScene) | `order_lantern_scene.webp` | `/public/images/order/` | ✓ `order-hero` + `orders-hero` (aynı dosya) |

**Prompt (`about_hero_scene.webp`):** açık kitap + üstünde havada asılı emerald kristal + fener, gece okuma masası; cinematic, emerald void, painterly, metinsiz, 4:5.
**Prompt (`settings_desk_scene.webp`):** gece çalışma masası, emerald masa lambası bloom'u, küçük kristal süs; cinematic, sakin, metinsiz, 4:3.
**Prompt (`order_lantern_scene.webp`):** sıcak fener + emerald kristal + raf üstü kitap silüetleri, gece okuma köşesi; cinematic, metinsiz, 4:3.

---

## WIRING DURUMU (Özet — orphan kontrolü)

**Wire edilmiş yollar** (kod `<AssetImage>`/`imageSrc` ile bu dosyaları bekler; bırakınca otomatik görünür):
| Yol | Nerede kullanılır | Fallback |
|---|---|---|
| `/images/homepage/hero_reading_room.webp` | Homepage hero | yüzen-kitap kümesi |
| `/images/genres/{slug}.webp` | Homepage kategori kartları · `/genres` kartları · `/categories` galeri | gradient / SVG sembol / CategoryScene |
| `/images/authors/{slug}.webp` | `/authors` kartları · `/authors/[slug]` hero | prosedürel portre |
| `/images/blog/{slug}.webp` | `/blog/[slug]` makale hero | LibraryScene |
| `/images/library/library_atmosphere.webp` | `/account/library` hero | LibraryScene |
| `/images/library/library_empty_scene.webp` | `/account/library` boş durum | StackedBooksAndPlantScene |
| `/images/about/about_hero_scene.webp` | `/about` hero | AboutScene |
| `/images/settings/settings_desk_scene.webp` | `/account/settings` hero | DeskScene |
| `/images/order/order_lantern_scene.webp` | `/order/[id]` + `/account/orders` hero | LanternScene |

**Kitap kapakları:** R2 hattı (`coverKey`) — `/admin` üzerinden yüklenir, bu envanterin dışında (§3). Kapak yoksa sinematik gradient/tipografik placeholder gösterilir.

**Wire EDİLMEDİ (gelecek/opsiyonel — kod referansı yok, orphan değil; bilinçli ertelendi):**
- `blog_hero_editorial.webp`, `reading_guides_hero.webp` — bunlar **metin hero** (`CinematicHero`), görsel çerçevesi yok; eklemek layout değişikliği gerektirir.
- Blog liste satırı görselleri (`ArticleImage`) — istemci kabuğu (`blog-shell`) içinde; `server-only AssetImage` kullanılamaz. (Aynı `blog/{slug}.webp` zaten makale hero'da gösterilir.)
- `cart_empty_scene.webp`, `search_discovery_scene.webp` — bunlar **ikon tabanlı** boş-durumlar; sahne/görsel slotu yok.
- `article_library_atmosphere.webp` — yazı-içi gömülü atmosfer; şu an ayrı slot olarak wire edilmedi.

> İleride bu ertelenmiş slotlar istenirse aynı `<AssetImage>` desenleriyle eklenebilir; ilgili promptlar yukarıda hazır.

## Doğrulama
- [x] `AssetImage` + `assets.ts` altyapısı (image-first → güvenli fallback).
- [x] Sayfa sayfa wiring (yukarıdaki tablo).
- [x] Wire edilen her yol ↔ prompt eşleşti; ertelenenler açıkça işaretlendi (orphan yok).
- [x] `npm run lint` · `npx tsc --noEmit` · `npm run build` temiz; fallback'ler kırılmadan render ediliyor.
