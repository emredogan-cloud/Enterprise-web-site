# SEO Master Uygulama Planı — Valice Press

**Tarih:** 2 Eylül 2026 · **Faz:** 12 (12A denetim · 12B mimari · 12C Search Console · 12D içerik fabrikası) + Faz 20 SEO bakım kontrolleri
**Bağlı olduğu belgeler:** `VALICE_PRESS_MASTER_ROADMAP_TR.md` (ana yol haritası), `PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md` (içerik üretim hattı), `CATALOG_LIFECYCLE_AND_MAINTENANCE_TR.md` (bakım otomasyonu)
**Yerine geçtiği belge:** `docs/seo/00–11` (Haziran 2026, "The Builder's Library" markası için yazıldı — teknik altyapısı korunur, strateji ve anahtar kelime haritası bu belgeyle **geçersizdir**)

Kanıt etiketleri: **[V]** birincil kaynaktan doğrulandı · **[O]** canlı sistemde gözlemlendi · **[A]** varsayım · **[R]** öneri · **[S]** senaryo.

---

## 0. Bu belge neyi çözüyor

Valice Press'in SEO altyapısı Haziran 2026'da iyi kurulmuş, sonra üstüne farklı bir katalog konmuştur. `docs/seo/06-keyword-intent-map.md` sekiz kitabın **yalnızca birini** (Meditations) kapsıyor; "founder'ın sistem/AWS/AI anchor kitabı" diye üçüncü bir küme tanımlıyor ki böyle bir kitap yok [O]. Teknik katman (metadata fabrikası, canonical, JSON-LD, sitemap, robots) sağlam ve Google'ın güncel gereksinimleriyle büyük ölçüde uyumlu; **içerik katmanı sıfır**, **ölçüm katmanı hiç bağlanmamış** (Search Console'da 1 Eylül'e kadar tek bir mülk yoktu; Vercel Web Analytics açık değil) [O].

Bu plan üç şey yapar:

1. Canlı sitedeki gerçek SEO kusurlarını dosya yolu ve düzeltme süresiyle listeler (12A).
2. Gerçek kataloğa — mitoloji referansı, bestiary, bulmaca, dünya oyunları, Stoa klasikleri, Hangul/Yunan alfabesi çalışma kitapları — göre sayfa tipi mimarisi ve anahtar kelime haritası kurar (12B).
3. Search Console → Google Cloud API → içerik boşluğu döngüsünü (seo.png'deki fikir) tekrarlanabilir bir fabrika hâline getirir (12C, 12D).

**Tek cümlelik tez [R]:** Valice'in SEO kaldıracı programatik sayfa hacmi değil, **zaten sahip olduğu benzersiz veriden** (112 yaratık girişi, 56 oyun kuralı, 76 mit, kaynak notlu edisyonlar, stroke-order tabloları) türeyen, insan editörlü, gerçekten faydalı referans ve karşılaştırma sayfalarıdır. Google'ın 28 Ağustos 2026 tarihli spam politikası "sıralamayı manipüle etmek amacıyla çok sayıda sayfa üretmeyi" yasaklar, "kullanıcıya değer katan" sayfaları değil [V] — savunma hattı bu ayrımdır ve kod seviyesinde (`validate:seo`) zorunlu kılınır.

---

## 1. Faz 12A — Mevcut site SEO denetimi

Canlı ortam: `https://valicepress.com` (1 Eylül 2026'da bağlandı) · Vercel projesi `valicepress-book-site` · son üretim dağıtımı commit `3d3a022` (2026-09-01 21:38 UTC) [O].

### 1.1 Bulgu tablosu

Önem: **P0** = müşteri/gelir etkisi veya indeks bütünlüğü · **P1** = sıralama/keşif etkisi · **P2** = hijyen.

| # | Bulgu | Kanıt | Önem | Düzeltme | Süre |
|---|---|---|---|---|---|
| 1 | **Canonical apex, sunucu www.** `https://valicepress.com/*` → 308 → `https://www.valicepress.com/*`. Canonical, `og:url`, sitemap `<loc>`, robots `Host:` ve Paddle webhook hedefi apex'i işaret ediyor; apex ise 200 dönmüyor. Google 301/308'i eşdeğer kalıcı yönlendirme sayar ve "yönlendirme hedefinin canonical olması gerektiğini" sinyal olarak kullanır [V] — yani Google canonical'ı www'ye çekecek, biz apex diyeceğiz. | `curl -I https://valicepress.com/` → 308; `src/app/robots.ts` `host: baseUrl`; `NEXT_PUBLIC_APP_URL=https://valicepress.com` [O] | **P0** | Vercel → Domains → `valicepress.com` birincil, `www` → apex'e 308 (basılı kitaplar ve tüm belgeler apex diyor). Alternatif (kötü): `NEXT_PUBLIC_APP_URL`'i www yapmak — basılı `valicepress.com/codex-enigmatica/verify` adresini yönlendirmeye mahkûm eder. | 5 dk (Founder, dashboard) |
| 2 | **`enterprise-web-site.vercel.app` 200 dönüyor, yönlendirmiyor.** Vercel üretim alias'ına `X-Robots-Tag: noindex` koymaz [V]; canonical apex'e işaret ettiği için kısmen korunuyor ama bütün katalog ikinci bir host'ta indekslenebilir durumda. | `curl -I https://enterprise-web-site.vercel.app/books/codex-bestiarium` → 200 [O] | **P0** | `src/proxy.ts` içinde host kontrolü: `host !== canonicalHost` ise 308 → canonical origin + path (bkz. §3.1). Vercel dashboard'da alias'ı yönlendirmek de mümkün; kodda olması taşınabilir. | 30 dk + deploy |
| 3 | **Sitemap eksik rotalar.** Sitemap'te yalnızca `/`, `/books`, `/books/[slug]`, `/categories/[slug]`, `/authors/[slug]`, `/blog`, `/blog/[slug]`, `/blog/category/[slug]` var. Eksik: `/ebooks` (satın alınabilen tek raf!), `/about`, `/categories`, `/authors`, `/blog/tag/*`, `/companion/*`, `/privacy` `/terms` `/refund` `/kvkk`. | `src/app/sitemap.ts` [O] | **P1** | `sitemap.ts`'e statik rota listesi + companion + seri sayfaları ekle; legal sayfalar `priority` düşük (Google priority'yi zaten yok sayar [V]). | 1 sa |
| 4 | **`lastModified = new Date()`.** Ana sayfa, `/books`, her kategori ve her yazar sayfası her ISR yenilemesinde "değişti" diyor. Google `<lastmod>`'u yalnızca "tutarlı ve doğrulanabilir şekilde doğruysa" kullanır, `<priority>` ve `<changefreq>`'i tamamen yok sayar [V]. Yalan `lastmod` = sinyalin tümünü kaybetmek. | `src/app/sitemap.ts` `generatedAt` [O] | **P1** | `src/lib/seo/freshness.ts`: içerikten türetilen deterministik tarih (kitap → `updatedAt`; kategori → en yeni kitabının `updatedAt`; statik sayfa → sabit `CONTENT_REVISION_DATE`). CoachScore'un `freshness.ts` kalıbı [O]. | 2 sa |
| 5 | **JSON-LD eksikleri.** Kitap sayfasında `Book` ve `Product` ayrı düğümler; Google "ISBN yalnızca `Book` üzerinde geçerlidir, ISBN-13 kullanın, `Product` ile co-type edin" der [V]; **merchant listing** için `Product.name`, `image`, `offers.price`, `offers.priceCurrency` zorunlu [V]. Şu an: co-typing yok, ISBN yok (KDP-free ISBN'ler kataloğa yazılmamış), format varyantları için `ProductGroup` yok, `Organization` üzerinde `logo`/`sameAs` yok, founder için `Person`+`sameAs` yok, `/ebooks`, `/books`, `/categories`, `/authors`, `/companion/*`, `/about` hiç JSON-LD vermiyor. | `src/lib/seo.ts:114–201` (`buildBookJsonLd`), `:230` (logo/sameAs bilinçli boş) [O] | **P1** | §3.5. `["Product","Book"]` co-typing; `isbn` katalogdan (yalnız gerçek ISBN); `ProductGroup`+`hasVariant` (ebook/pb/hc/LP); `Offer` yalnız `priceCents > 0` (mevcut kural korunur); `Organization.logo` gerçek kare logo dosyası eklenince; `sameAs` env ile (`NEXT_PUBLIC_FOUNDER_X`, `…_GITHUB`, Amazon Author Central URL). | 4 sa |
| 6 | **`Book actions` ve `FAQPage` beklentisi.** `docs/seo/` FAQPage planlıyor. Google FAQ zengin sonucunu **7 Mayıs 2026'da kaldırdı**; Haziran'da Search Console raporu, Ağustos'ta API desteği gitti [V]. `Book` actions yalnızca "geniş seçkiye sahip kitap sağlayıcılarına", feed ile [V]. | Google Search Central changelog 2026-05-08 [V] | P2 | FAQPage ve Book-actions yatırımı **yapılmaz**. Kitap sayfasının zengin sonucu = merchant listing (`Product`). | 0 |
| 7 | **noindex haritası** doğru; iki istisna: `/blog/tag/[slug]` indekslenebilir (kategori hub'larıyla ince kopya riski); `/companion/[slug]` bilinmeyen slug için `robots: {index:false}` ama `follow:false` yok. | `src/app/blog/tag/[slug]/page.tsx`, `src/app/companion/[slug]/page.tsx:43` [O] | P2 | Tag hub'larına `noindex, follow`; companion'a `dynamicParams = false` (bilinmeyen slug 404). | 30 dk |
| 8 | **OG görseli** varsayılan üretici sağlam (`/opengraph-image`, 1200×630); kitap kapağı override'ı **`R2_PUBLIC_BASE_URL` ve `coverKey` gerektiriyor** — kapaklar `public/images/books/<slug>.webp` altında, `coverKey` boş → kitap sayfaları markalı jenerik OG gösteriyor, kapağı değil. | `src/app/books/[slug]/page.tsx:93–95`, `src/lib/seo.ts:42` `getCoverImageUrl` [O] | P1 | `getCoverImageUrl` → `coverKey` yoksa `/images/books/<slug>.webp` varsa onu döndür (dosya mevcutsa). Kapak OG'si sosyal paylaşımda CTR'nin ana sürücüsüdür [A]. | 1 sa |
| 9 | **ISR/render haritası** tutarlı: katalog rotaları `revalidate = 3600` + `generateStaticParams`; blog deploy-pinned; özel rotalar `force-dynamic`. `/authors`, `/blog`, `/about` tamamen statik (revalidate yok) — kabul. | `src/app/**/page.tsx` [O] | — | Değişiklik yok; mutasyonlarda `revalidatePath` var. | 0 |
| 10 | **hreflang/lang yok.** `/kvkk` tamamen Türkçe, `<html lang="en">` sabit, `og:locale en_US`. | `src/app/(legal)/kvkk/page.tsx`, `src/app/layout.tsx:87` [O] | P2 | KVKK sayfasına `lang="tr"` (segment layout) ve `alternates.languages` altyapısı (`metadata.ts`); site tek dilli kaldığı sürece hreflang **gerekmez**. | 45 dk |
| 11 | **Blog içeriği eski jenerik kitapçı metni.** Üç yazı (Mayıs 2026) hiçbir Valice kitabından bahsetmiyor; "how-to-choose-your-next-book" romanlar öneriyor, katalogda roman yok; `/search` sorgu örnekleri kataloğa uymuyor. | `src/content/blog/*.md` [O] | **P1** | Üçünü de kaldır veya yeniden yaz (§5 takvim ay 1). "why-we-built-valice-press" tek kalıcı aday: gövdesi DRM'siz manifestosu → `/about`'a taşınıp blogdan çekilebilir. | 3 sa (yazım founder) |
| 12 | **`begin_checkout` eventi hiç ateşlenmiyor.** `src/lib/analytics.ts` union'ında var, hiçbir bileşen çağırmıyor; huni "niyet → checkout" adımı ölçülemiyor. | grep sonucu [O] | P1 | `src/components/cart/checkout-button.tsx` (veya eşdeğeri) `trackEvent("begin_checkout", {value, currency, items})`. | 30 dk |
| 13 | **Vercel Web Analytics kapalı.** API `Web Analytics not found` [O]. Custom event'ler (`track()`) yalnızca Pro planda; Hobby'de 50k event/ay, custom event yok [V]. | Vercel API [O]; vercel.com/docs/analytics/limits-and-pricing [V] | **P0** (ölçüm) | Dashboard → Analytics → Enable. Plan Hobby ise: pageview'lar çalışır, `track()` çağrıları sessizce düşer → Pro'ya geçiş kararı Founder'ın (aylık $20 seat) [R]. | 2 dk + karar |
| 14 | **Kategori açıklaması meta'ya gitmiyor.** `categories.description` sayfada render ediliyor ama `generateMetadata` `Browse ${name} on Valice Press.` yazıyor. | `src/app/categories/[slug]/page.tsx:60` [O] | P2 | `description: category.description ?? fallback`. | 10 dk |
| 15 | **RSS yok.** `docs/seo/10` planladı, kod yok. | grep `feed.xml` boş [O] | P2 | `src/app/feed.xml/route.ts` (RSS 2.0, `revalidate = 3600`, `<link rel="alternate">`). | 1 sa |
| 16 | **AI crawler politikası yazılmamış.** `robots.ts` tek wildcard kural. Karar (izin/ret) belgelenmemiş. | `src/app/robots.ts` [O] | P2 | Karar [R]: **izin** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) — referans sayfaları AI cevaplarında alıntılanmak için var; ret yalnızca `/read`, `/account`, `/api`. | 20 dk |
| 17 | **`GSC_VERIFICATION` env'i gereksiz.** Domain property DNS TXT ile doğrulanır; meta etiketi URL-prefix içindir. | `src/app/layout.tsx:38` [O] | — | Kod kalsın (zararsız), env eklenmez. | 0 |
| 18 | **`/companion/hangul` üretimde 404.** Kod dalda commit edilmemiş; sitemap'te de yok. | `curl https://www.valicepress.com/companion/hangul` → 404 [O] | P1 | Commit + deploy; sitemap'e ekle; `dynamicParams=false`. | 30 dk |
| 19 | **Search Console mülkü** 1 Eylül 2026 gecesi oluşturuldu (Domain property), **doğrulanmadı** — DNS TXT Founder'da. Öncesinde hesapta sıfır mülk vardı → tarihsel arama verisi yok. | GSC ekran [O] | **P0** (ölçüm) | §4.1. | 5 dk (Founder) |
| 20 | **Test fikstürleri eski marka** (`kitabevi.com.tr`, `enterprise-web-site.vercel.app`) — işlevsel değil, hijyen. | `src/lib/seo.test.ts`, `src/lib/site-url.test.ts` [O] | P2 | Fikstürleri `valicepress.com`'a çevir. | 15 dk |

### 1.2 Doğru olan ve dokunulmayacak şeyler [O]

- `metadataBase` = `getSiteUrl()` (`src/app/layout.tsx:34`); canonical/OG/JSON-LD/robots/sitemap **tek origin**den türer. Bu, Faz 0'daki `new URL("")` → site geneli 500 tuzağının kalıcı çözümüdür.
- `buildPageMetadata` düşürülemez `siteName`/`locale`/`canonical`/OG görseli; `twitter.images` bilinçli boş (Next OG'den türetir).
- Tek `Organization @id` (`${base}/#organization`) tüm grafiklerde; site grafiği yalnızca ana sayfada (mükerrer varlık yok).
- `AggregateRating` yalnızca `reviewCount > 0` — Google'ın "puanlar doğrudan kullanıcıdan gelmeli; kendi kuruluşunu değerlendiren sayfa yıldız alamaz" kuralıyla birebir [V].
- `/search` crawlable + sayfa seviyesi `noindex` (SearchAction hedefi çözülsün diye) — doğru.
- `Offer` yalnızca `price_cents > 0` — Google merchant listing için `price` zorunlu; sıfır fiyat "ücretsiz ürün" iddiasıdır. Kural korunur.

### 1.3 Denetim sonucu — puan

| Boyut | Haziran 2026 (`docs/seo/11`) | Eylül 2026 (bu denetim) | Neden |
|---|---|---|---|
| Teknik SEO | 9.5 | **7.0** | apex/www çelişkisi, `.vercel.app` kopyası, sahte `lastmod`, sitemap boşlukları |
| Yapısal veri | 8.5 | **7.0** | Sağlam iskelet; merchant-listing co-typing ve ProductGroup eksik |
| İçerik SEO | 5 | **2.0** | Anahtar kelime haritası yanlış kataloğa ait; 3 jenerik yazı; 0 referans sayfası |
| Ölçüm | 8 | **1.0** | GSC mülkü doğrulanmamış, Analytics kapalı, `begin_checkout` yok — kodda var, gerçekte hiçbir şey ölçülmüyor |
| Otorite | 4.5 | **3.0** | 18 Amazon ilanı gerçek varlık; sıfır dış link, sıfır sameAs, yazar biyografisi yok |

---

## 2. Faz 12B — SEO mimarisi

### 2.1 İlkeler

1. **Bir sorgu, bir sahip sayfa.** `docs/seo/06`'daki tek-sahip kuralı korunur; kanibalizasyon `validate:seo`'da (aynı `<title>`/H1/description tespiti) test edilir.
2. **Niyet-sayfa eşleşmesi.** Bilgi sorgusu → referans/rehber; karşılaştırma sorgusu → T2 edisyon sayfası; satın alma sorgusu → kitap/`/ebooks`; navigasyon → seri/yazar.
3. **Kamu malı "free pdf" niyeti hedeflenmez.** "Meditations pdf free" arayan kişi ücretsiz istiyor; ona satış sayfası göstermek hem kaybettirir hem güven bozar. Bu niyete tek cevap: "Hangi çeviri?" karşılaştırması (bilgi verir, edisyonu tanıtır, satış zorlamaz).
4. **Programatik hacim yok; benzersiz veri var.** Her referans sayfası (a) kitapta olmayan bir yararı olan, (b) kitaptan türeyen ama kitabın yerine geçmeyen, (c) insan editörün okuduğu bir sayfadır. Eşikler kodda: giriş ≥ 120 karakter, gövde ≥ 600 karakter, ≥ 2 bölüm, ≥ 3 veri noktası, benzersiz başlık/description/H1, ≥ 1 gelen iç link (yetim yok).
5. **Seri = SEO hub'ı.** Amazon'da seri sayfası varsa (KDP series) sitede de olmalı; "Codex" araması hem Amazon hem Valice'te aynı hiyerarşiyi bulmalı.

### 2.2 Sayfa tipleri

| Tip | Rota | Amaç / niyet | Şablon (zorunlu bloklar) | Yapısal veri | İç link kuralı | İnce içerik koruması |
|---|---|---|---|---|---|---|
| **Kitap** | `/books/[slug]` | TXN + NAV | Hero + gerçek kapak · tek satır vaat · ne içerir · formatlar & fiyatlar (direct/Amazon ayrımı net) · 4 gerçek önizleme · companion linki · seri şeridi · ilgili kitaplar · edisyon/kaynak notu (PD) | `@graph`: Organization · BreadcrumbList · `["Product","Book"]` (isbn ISBN-13 varsa, `bookFormat`, `numberOfPages`, `inLanguage`, `author` → Person@id) · `Offer` yalnız direct fiyat>0 · `ProductGroup` (formatlar `hasVariant`, `variesBy: bookFormat`) | Seri sayfasına yukarı; 3–5 ilgili kitap; companion; referans sayfalarından gelen linkler | Katalog metni zaten benzersiz (`valice-catalog.mjs` `description`, `idealReader`) |
| **Ebook rafı** | `/ebooks` | TXN ("drm-free ebook", "buy pdf book direct") | "Bought here. Yours to keep." + 5 kitap + neden direct (EPUB/PDF, filigran, yeniden indirme) | `CollectionPage` + `ItemList` (kitap URL'leri) | Her kitaba; `/about` DRM manifestosuna | Statik açıklama ≥ 250 kelime |
| **Seri** | `/series/codex` · `/series/the-great-book-of` · `/series/valice-script` · `/series/valice-classics` | NAV + COMM ("codex mythologica series", "valice classics") | Serinin tezi (≥ 300 kelime, founder sesi) · ciltler sırayla · okuma sırası · hangi cilt kime · Amazon seri sayfası linki | `CollectionPage` + `ItemList` (`BookSeries` yalnızca `Book.isPartOf` ile) + Breadcrumb | Her cilt yukarı-aşağı; kategori ↔ seri çapraz | Seri metni elle yazılır; 4 sayfa |
| **Kategori** | `/categories/[slug]` | INFO/NAV | Küratörlük metni **≥ 250 kelime** (şu an `categories.description` kısa) · kitaplar · ilgili referans/rehber linkleri | BreadcrumbList + `CollectionPage`/`ItemList` | Kategori → seri → kitap; referans dizinlerine | 6 kategori, hepsi dolu; boş kategori açılmaz (kural zaten var) |
| **Yazar** | `/authors/[slug]` | NAV + E-E-A-T | Gerçek biyografi (Founder yazacak — B6/K bio), yayın listesi, Amazon Author Central linki, `sameAs` | `ProfilePage` + `Person` (`sameAs`, `description`) — Google author sayfaları için açıkça geçerli [V] | Her kitap `author.url` ile buraya | Biyografi yoksa sayfa yine var ama `Person.description` boş (uydurma yok) |
| **Companion** | `/companion/[slug]` | INFO ("hangul practice sheets pdf") — **indekslenebilir**, sitemap'te | Ücretsiz materyal (PDF'ler) · kitaba bağlam · opsiyonel e-posta (utility-first, KDP hyperlink kuralı [V]) | `WebPage` + `ItemList` (asset'ler `DigitalDocument`) + Breadcrumb | Kitap ↔ companion çift yönlü; rehber sayfalarından | Her companion ≥ 3 gerçek asset; `dynamicParams=false` |
| **Edisyon / provenans (T2)** | `/editions/[work]` (örn. `/editions/meditations-translations`) | COMM ("best translation of meditations", "enchiridion which translation") | Karşılaştırma tablosu (çeviri · yıl · okunabilirlik · sadakat · telif durumu · fiyat/format) · "biz neden X'i seçtik" · kaynak numaraları (PG #15877) · kitaba tek CTA | `Article` (author → Person) + Breadcrumb; **FAQPage değil** | Kitap sayfasına ve seri sayfasına | Tablo = bilgi kazancı; her satır kaynaklı |
| **Referans — bestiary dizini** | `/bestiary` + `/bestiary/[creature]` (112 giriş) | INFO ("each-uisce", "tikbalang meaning", "rokurokubi") | ≤ 200 kelime özet · telaffuz · köken/gelenek · sınıf (Guardian/Devourer…) · Thompson motif kodu · "Codex Bestiarium'da tam giriş, plaka ve iki kaynak" CTA · 3 ilgili yaratık | `DefinedTerm` içinde `DefinedTermSet` + Breadcrumb (+ `Article` değil) | Kitap sayfasına; yaratıklar arası çapraz (kitaptaki 181 çapraz referans zaten var [O]) | Girişler kitabın 675 kelimelik metninin **yerine geçmez**; kitaptan türetilen, insan editörün onayladığı özet; validate:seo eşikleri |
| **Referans — oyun dizini** | `/games` + `/games/[game]` (56 giriş) | INFO ("royal game of ur rules", "mancala rules") | Tarih/köken · oyuncu sayısı · süre · kurallar **özeti** (tam kurallar kitapta) · basılabilir tahta (companion asset) · "hangi kurallar rekonstrüksiyon" notu | `DefinedTerm`/`Article` + Breadcrumb | World Games kitabına; Falkener edisyonuna (çıkınca) | Her sayfa basılabilir tahta PDF'i taşır → gerçek fayda |
| **Referans — mit dizini** | `/myths/[culture]` (19 uygarlık) | INFO ("turkic mythology", "inuit myths") | Uygarlık kartı · 3–5 mit özeti (Mythologica'dan) · Who's Who · kaynaklar · kitap CTA | `Article` + Breadcrumb | Mythologica, World Myths (çocuk) ve Bestiarium'a | 19 sayfa; her biri ≥ 600 kelime, founder editli |
| **Rehber (T1 pillar / T4 how-to)** | `/guides/[slug]` | INFO ("how to learn hangul stroke order", "stoic reading order") | Cevap-önce açılış · adımlar · görsel · companion asset · ilgili kitap tek CTA · e-posta ikincil | `Article` (+ `HowTo` **değil** — HowTo zengin sonucu galeriden çıktı [V]) | Companion ↔ kitap ↔ seri | 1.500–2.500 kelime; founder sesi |
| **Editoryal** | `/blog/[slug]` | INFO/COMM | Mevcut şablon | `BlogPosting` + Breadcrumb | Pillar → spoke → kitap | Anti-pattern: SERP özetleme, toplu AI yazı |
| **PD edisyon sayfası** | `/books/[slug]` (aynı kitap şablonu, "Edition note" bloğu zorunlu) | COMM | Kaynak edisyon · çevirmen · yıl · PG/IA kimliği · orijinal katkı listesi (annotation, illüstrasyon sayısı) · "(Annotated)" etiketi | `Book.isBasedOn` (orijinal eser) + `translator` Person | Edisyon (T2) sayfasından | Bkz. `PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md` |
| **Destek** | `/about`, legal | NAV | — | `Organization` (about'ta, ana sayfadaki @id'ye referans) | Footer | — |

**Ölçek:** 8 kitap + 4 seri + 6 kategori + 2 yazar + 5 companion + ~6 edisyon + 112 yaratık + 56 oyun + 19 mit + ~12 rehber ≈ **230 indekslenebilir sayfa** 12. ayda; katalog 40 kitaba çıktığında ~350. Hepsi tek düz sitemap'e sığar (limit 50.000 URL [V]); segmentasyon gereksiz.

### 2.3 Anahtar kelime / niyet haritası — gerçek katalog

Hacim verisi **yok** (GSC doğrulanmamış, üçüncü parti araç yok) — tüm satırlar niyet ve sahiplik atamasıdır [A]; 90 gün sonra GSC verisiyle yeniden sıralanır. Niyet: INFO bilgi · COMM karşılaştırma/seçim · TXN satın alma · NAV marka.

| # | Sorgu (örnek) | Niyet | Sahip sayfa | CTA |
|---|---|---|---|---|
| 1 | valice press | NAV | `/` | — |
| 2 | codex bestiarium / codex mythologica / codex enigmatica | NAV | `/books/[slug]` | direct/Amazon |
| 3 | bestiary book mythical creatures | COMM | `/series/codex` | Bestiarium |
| 4 | each-uisce, nykur, tikbalang, yuki-onna, rokurokubi, mujina… (112) | INFO | `/bestiary/[creature]` | Bestiarium |
| 5 | thompson motif index creatures | INFO | `/bestiary` | Bestiarium |
| 6 | world mythology book for adults comparative | COMM | `/books/codex-mythologica` | Amazon (Select) |
| 7 | turkic mythology / inuit myths / polynesian creation myth | INFO | `/myths/[culture]` | Mythologica |
| 8 | mythology books for kids 8-12 not greek | COMM | `/books/the-great-book-of-world-myths` | direct/Amazon |
| 9 | norse myths for kids book | COMM | (Kitap 11 çıkınca) `/books/the-great-book-of-norse-myths` | — |
| 10 | screen-free activity book ages 8-12 puzzles | COMM | `/books/the-myth-hunters-field-book` | Amazon |
| 11 | royal game of ur rules / how to play senet / mancala rules / hnefatafl rules | INFO | `/games/[game]` | World Games |
| 12 | ancient board games book with rules | COMM | `/books/the-great-book-of-world-games` | direct/Amazon |
| 13 | printable board game boards ancient games | INFO | `/companion/world-games` | World Games |
| 14 | puzzle book like cain's jawbone / journal 29 similar | COMM | `/books/codex-enigmatica` | direct/Amazon |
| 15 | codex enigmatica answer / verify | NAV | `/codex-enigmatica/verify` (noindex, bilerek) | — |
| 16 | dudeney canterbury puzzles solutions explained | INFO/COMM | `/editions/dudeney` (T2) → Kitap 03 | direct |
| 17 | sam loyd puzzles book | COMM | (Kitap 19) | — |
| 18 | best translation of meditations marcus aurelius | COMM | `/editions/meditations-translations` | `/books/meditations` |
| 19 | george long meditations 1862 | INFO | `/books/meditations` (provenans bloğu) | direct |
| 20 | meditations pdf free download | INFO/"free" | **HEDEFLENMEZ** — T2 sayfası doğal olarak yakalarsa CTA zorlanmaz | — |
| 21 | enchiridion epictetus which translation / long vs higginson vs oldfather | COMM | `/editions/enchiridion-translations` → Kitap 05 | direct |
| 22 | stoicism reading order where to start | INFO | `/guides/stoic-reading-order` (pillar) | Stoic Library bundle |
| 23 | seneca letters best translation | COMM | (Kitap 14) `/editions/seneca-letters` | — |
| 24 | kwaidan yokai list / hoichi the earless story | INFO | (Kitap 06) `/bestiary/[creature]` çaprazı | Kwaidan |
| 25 | hangul handwriting practice sheets pdf | INFO | `/companion/hangul` | Hangul workbook |
| 26 | hangul stroke order chart | INFO | `/guides/hangul-stroke-order` | companion + kitap |
| 27 | korean handwriting workbook for adults | COMM | `/books/korean-hangul-handwriting-workbook` | Amazon (yayınlanınca) |
| 28 | learn to write hangul before speaking | INFO | `/guides/learn-to-write-hangul` | kitap |
| 29 | greek alphabet practice sheets printable | INFO | `/companion/greek` (Kitap 02) | kitap |
| 30 | greek alphabet handwriting workbook modern ancient | COMM | (Kitap 02) | Amazon |
| 31 | drm-free ebooks pdf buy direct from publisher | COMM/TXN | `/ebooks` | direct |
| 32 | what is social drm watermarked pdf | INFO | `/about` (manifesto bölümü) | `/ebooks` |
| 33 | large print mythology book | COMM | `/books/codex-bestiarium` (LP formatı) | Amazon LP |
| 34 | mythology puzzle book | COMM | (Kitap 04) — **Kapı 1 doğrulaması önce** | — |
| 35 | myth hunter field book answers | INFO | `/companion/myth-hunters` (cevap anahtarı değil, ipuçları) | — |
| 36 | public domain annotated editions publisher | COMM | `/series/valice-classics` | — |
| 37 | "[herhangi klasik] free pdf / epub download" | "free" | **HEDEFLENMEZ** | — |

**Kanibalizasyon kuralları:** `/books` (katalog) ≠ `/ebooks` (satın alınabilir raf) ≠ `/categories/[slug]` (küratörlü) ≠ `/series/[slug]` (marka hattı). `/books` "all books" niyetine, `/ebooks` "buy ebook" niyetine, kategori "konu" niyetine, seri "marka" niyetine sahip. Blog tag hub'ları noindex.

### 2.4 İç link mimarisi

```
/                ──► /ebooks ──► /books/[slug] ◄──► /companion/[slug]
│                                   ▲   ▲   ▲
├─► /series/[slug] ─────────────────┘   │   └── /bestiary/[creature] · /games/[game] · /myths/[culture]
├─► /categories/[slug] ─────────────────┘                     ▲
└─► /guides/[slug] ─► /editions/[work] ─► /books/[slug]      │
                     (T2 karşılaştırma)                      /bestiary · /games · /myths (dizin hub'ları)
/authors/[slug] ◄── her kitap, her makale (author.url)
```

Kurallar: (1) her referans sayfası **tam olarak bir** kitaba birincil CTA verir; (2) her kitap sayfası kendi referans setine link verir ("Bu kitaptaki 112 yaratık" → `/bestiary`); (3) yetim sayfa CI'da hata; (4) footer'da seri ve dizin hub'ları; (5) Amazon'a giden her link `/go/amazon/[slug]` üzerinden (Amazon Attribution etiketi + event) — bkz. `AMAZON_ADS_MASTER_PLAN_TR.md`.

---

## 3. Teknik uygulama listesi (kod seviyesi)

Sıra = bağımlılık sırası. Her madde `npm run lint && npx tsc --noEmit && npm test && npm run build` kapısından geçer; SEO değişiklikleri ayrıca **metadata regresyon anlık görüntüsü** ile doğrulanır (`docs/seo/02` WS-B kalıbı: "grep yetmez, render edilmiş `<head>`'i karşılaştır").

### 3.1 Host kanonikleştirme — `src/proxy.ts`

```ts
// canonical host = new URL(getSiteUrl()).host  (NEXT_PUBLIC_APP_URL'den)
// İstek host'u farklıysa (enterprise-web-site.vercel.app, *.vercel.app önizleme HARİÇ) → 308 aynı path+query
// VERCEL_ENV === "production" && host !== canonicalHost && !host.endsWith(".vercel.app") koşulu YANLIŞ:
// tam olarak eski production alias'ı da yönlendirilmeli; önizleme dağıtımları yönlendirilmemeli.
// Kural: production'da host ∉ {canonicalHost} ve host === "enterprise-web-site.vercel.app" || host === VERCEL_PROJECT_PRODUCTION_URL → 308.
```

Vercel dashboard'da apex/www birincil seçimi bunu tamamlar (Bulgu 1 Founder'ın). Google için 308 = 301 [V]; Change of Address aracı www↔apex için **kullanılmaz** [V]; `.vercel.app` → alan adı taşıması için de büyük ihtimalle gerekmez — yönlendirme yeterli, redirect ≥ 1 yıl kalır [V].

### 3.2 Sitemap — `src/app/sitemap.ts` + `src/lib/seo/freshness.ts`

- Statik rotalar: `/`, `/books`, `/ebooks`, `/categories`, `/authors`, `/about`, `/blog`, legal.
- Dinamik: kitaplar (`published`), kategoriler, yazarlar, blog, **companion** (`listCompanions()`), **seri**, **edisyon**, **referans** dizinleri (yayınlandıkça).
- `lastModified`: `freshness.ts` → kitap `updatedAt`; kategori/seri → içindeki en yeni `updatedAt`; statik → `CONTENT_REVISION_DATE` sabiti (deploy'da elle güncellenir); referans → içerik dosyasının `updated` alanı. **Asla `new Date()`.**
- `changeFrequency`/`priority` bırakılabilir (Google yok sayar [V]); Bing için zararsız.
- Saf builder + ince route: `src/lib/seo/sitemap.ts` (`buildSitemap(entries)`) test edilebilir; `app/sitemap.ts` 15 satır.

### 3.3 robots — `src/app/robots.ts`

```
User-agent: *            Allow: /   Disallow: /api/ /admin/ /account/ /order/ /read/ /cart
User-agent: GPTBot | ClaudeBot | PerplexityBot | Google-Extended | anthropic-ai | CCBot
  Allow: /  (referans sayfaları alıntılanabilir olsun — karar [R]; Founder onayı)
  Disallow: /read/ /account/ /api/
Sitemap: https://valicepress.com/sitemap.xml
Host: https://valicepress.com
```

### 3.4 Metadata — `src/lib/metadata.ts`

- `alternates.languages` desteği (`{ en: url, "x-default": url }`; TR sayfa açılırsa `tr`).
- KVKK segment layout'unda `<html lang>` override edilemez (root'ta) → KVKK içeriğini `<div lang="tr">` ile sar + `og:locale` `tr_TR` (segment metadata). Tek dilli site kaldığı sürece hreflang gerekmez.
- Kategori `description` meta'ya.

### 3.5 JSON-LD — `src/lib/seo.ts`

- `buildBookJsonLd`: `Book` + `Product` → **tek düğüm `"@type": ["Product","Book"]`**; `isbn` yalnızca katalogda gerçek ISBN-13 varsa (KDP-atanan ISBN'ler kataloğa `isbn` alanı olarak yazılır — `valice-catalog.mjs` format satırlarında `isbn: null` mevcut); `bookFormat` formatına göre (`EBook`/`Paperback`/`Hardcover`); `Offer` yalnız direct ve `priceCents > 0`; Amazon formatları için `Offer` **yok** (fiyatı Amazon belirler; `url` Amazon'a giden bir Offer, merchant listing "bu sayfada satın alınabilir" kuralını ihlal eder [V]).
- `ProductGroup`: `productGroupID = slug`, `variesBy: ["https://schema.org/bookFormat"]`, `hasVariant` = format satırları.
- `Organization`: `logo` (gerçek kare PNG `public/images/brand/logo-512.png` eklenince), `sameAs` env'den (`NEXT_PUBLIC_SAMEAS` virgüllü), `url`, `name`, `foundingDate` (Founder verir). Yalnızca `/` ve `/about`.
- `WebSite` + `SearchAction` mevcut; `alternateName` "Vâliçe Press" (Founder isim kararına göre).
- Yazar: `ProfilePage` + `Person` (`sameAs`: Amazon Author Central, X, GitHub); `Article.author.url` → `/authors/emre-dogan`.
- `/ebooks`, `/series/*`, `/categories/*`: `CollectionPage` + `ItemList`.
- Referans: `DefinedTermSet`/`DefinedTerm` (bestiary), `Article` (mit/oyun).
- Bileşen: `src/components/seo/json-ld.tsx` (tek/çoklu blob) — altı ayrı `dangerouslySetInnerHTML` çağrısı yerine.
- Breadcrumb: JSON-LD + görünür nav **aynı `items` dizisinden** (`src/components/seo/breadcrumbs.tsx` CoachScore kalıbı) — şema ile görünür iz ayrışamaz.

### 3.6 RSS — `src/app/feed.xml/route.ts`

RSS 2.0, `revalidate = 3600`, `atom:link rel="self"`, `<link rel="alternate" type="application/rss+xml">` root layout'ta; footer linki. Blog + edisyon + rehber yazıları.

### 3.7 `validate:seo` — `scripts/seo/validate-seo.mjs` + CI

Girdi: katalog (`valice-catalog.mjs`), içerik dosyaları (`src/content/**`), companion kayıtları, referans veri dosyaları (`src/content/reference/{bestiary,games,myths}/*.json`). Kontroller:

| Kontrol | Hata | Uyarı |
|---|---|---|
| Başlık/description/H1 benzersizliği (site geneli) | mükerrer | — |
| Description 70–160 karakter | eksik | uzun |
| İnce içerik: giriş ≥ 120 kr, gövde ≥ 600 kr, ≥ 2 bölüm, ≥ 3 veri noktası | referans/rehber sayfalarında | kitap sayfaları muaf (katalog metni) |
| Yetim: gelen iç link = 0 | hata | — |
| Kırık iç link | hata | — |
| Sitemap kapsamı: her indekslenebilir sayfa sitemap'te; noindex sayfa sitemap'te değil | hata | — |
| `lastModified` `YYYY-MM-DD` ve ≤ bugün | hata | — |
| JSON-LD: `Offer` yalnız price>0; `AggregateRating` yalnız reviewCount>0; `isbn` 13 hane | hata | — |
| Görsel `alt` | eksik | — |
| Canonical = kendi URL'i, apex | hata | — |

`package.json`: `"validate:seo": "node scripts/seo/validate-seo.mjs"`; `.github/workflows/ci.yml`'e adım; hata → build kırmızı. Bu, Google'ın "scaled content abuse" tanımına karşı **mekanik** savunmadır: eşikleri geçmeyen sayfa yayınlanamaz.

### 3.8 Ölçüm

- **Vercel Web Analytics**: Dashboard'da Enable (Founder). Plan Hobby ise `track()` çalışmaz [V] → ya Pro ($20/ay) ya da custom event'ler için alternatif (PostHog free tier, cookieless mod) — karar Founder'ın; öneri **Pro** [R] çünkü aynı hesapta Speed Insights ve deployment koruması da var.
- `begin_checkout` eventini bağla; `purchase` eventini `transaction_id` ile tekilleştir (order sayfası yenilemede çift sayım [O]).
- **GA4 ertelendi [R]**: Vercel (cookieless) + GSC ihtiyacı karşılıyor; GA4 = consent banner + Consent Mode v2 işi. Merchant Center/Google Ads'e girilirse yeniden değerlendirilir. Girilirse: `@next/third-parties/google` + `gtag('consent','default',…)` **script'ten önce** [V].
- **IndexNow (Bing/Yandex/Naver)**: `public/<key>.txt` + yayın hook'unda `POST https://api.indexnow.org/indexnow` (≤ 10.000 URL) [V]. Google IndexNow'u desteklemiyor [V]; Google için tek kaldıraç sitemap + iç link.
- **Merchant Center free listings (sonra, ay 4+)**: fiziksel kitaplar tam uygun; ebook'lar **free listings'te** uygun, reklamda değil [V]; `gtin` = ISBN-13 [V]; feed = sayfadaki `Product` markup'ı (website crawl) [V] → ikinci bir feed formatı yok. Ön koşul: iade politikası sayfası, kargo ayarı (fiziksel için "Amazon'da satılır" → free listing yalnızca direct ebook'lar için mantıklı).

### 3.9 Sıra ve süre

| Hafta | İş | Süre |
|---|---|---|
| 1 | Bulgu 1 (Founder), 3.1 host redirect, 3.2 sitemap+freshness, 3.7 validate:seo iskeleti, Analytics enable, `begin_checkout`, companion commit | ~10 sa |
| 2 | 3.5 JSON-LD (co-typing, ProductGroup, CollectionPage), OG kapak fallback, kategori meta, tag noindex, KVKK lang | ~8 sa |
| 3 | Seri sayfaları (4), `/about` Organization, RSS, robots AI politikası, test fikstürleri | ~8 sa |
| 4 | Referans dizini altyapısı (`src/content/reference/*.json` + `/bestiary/[creature]` şablonu) + ilk 20 yaratık (editörlü) | ~12 sa |

---

## 4. Faz 12C — Google Search Console ve Google Cloud

### 4.1 Search Console — durum ve adımlar

**Durum [O]:** 1 Eylül 2026 gecesi, `emre30283@gmail.com` hesabında **Domain property `valicepress.com`** oluşturuldu (hesapta daha önce hiç mülk yoktu). Doğrulama TXT kaydı henüz DNS'te değil; mülk "daha sonra doğrula" durumunda.

Domain property seçildi çünkü apex + www + http/https'i tek mülkte toplar [V] ve apex/www kararından bağımsız çalışır; URL-prefix mülkü 308 yönlendirmede doğrulanamazdı.

**Founder adımları (≈ 5 dakika + DNS yayılımı):**

1. Namecheap → Domain List → `valicepress.com` → **Manage** → **Advanced DNS** → **Add New Record**.
2. Type `TXT Record` · Host `@` · Value: `google-site-verification=o99ifmNUCFgIatG65vnRUxQ-2yMAIDo-xj805KnpUWU` · TTL Automatic → Save. (Namecheap: "genelde 30 dakikada yayılır"; Google: 2–3 güne kadar sürebilir [V]. Kayıt doğrulama sonrası **silinmez** [V].)
3. `dig TXT valicepress.com +short` çıktısında token görününce: search.google.com/search-console → `valicepress.com` → **Verify**.
4. **Sitemaps** → `https://valicepress.com/sitemap.xml` → Submit (Bulgu 1 düzeltilmeden önce gönderilirse apex URL'leri 308 döner; **önce apex birincil**).
5. **URL Inspection**: `/`, `/ebooks`, `/books/codex-bestiarium`, `/companion/hangul`, bir kategori — "Test live URL" ile fetch+render; yalnızca bu 5 için "Request indexing" (kotalı [V]).
6. **Bing Webmaster Tools** → Import from GSC (doğrulama ve sitemap devralınır [V]) → Settings → API → IndexNow key.
7. **Ayarlar → Kullanıcılar**: §4.2'deki service account e-postasını **Full** olarak ekle.

Yeni alan adında indeksleme "bir–iki günden birkaç haftaya" [V]; CrUX alan verisi aylarca boş kalır (eşik açıklanmıyor [V]) → Core Web Vitals raporu boş görünecek, panik yok; Speed Insights gerçek kullanıcıyı ölçer.

### 4.2 Google Cloud — Search Console API (Founder, ≈ 20 dakika)

Kimlik bilgisi içerdiği için ajan **yapmaz**; adımlar Google belgeleriyle doğrulandı [V]:

1. console.cloud.google.com → yeni proje `valice-press-seo`.
2. **APIs & Services → Library** → "Google Search Console API" → Enable. (Indexing API **enable edilmez**: yalnızca `JobPosting`/`BroadcastEvent` sayfaları için [V]; kötüye kullanım erişim iptali.)
3. **IAM & Admin → Service Accounts → Create**: `gsc-export@valice-press-seo.iam.gserviceaccount.com`; IAM rolü vermeyin (yetki GSC tarafında verilir).
4. Service account → **Keys → Add key → JSON** → indir. Kişisel/organizasyonsuz projelerde anahtar oluşturma varsayılan olarak açık [V]. Anahtar **git'e girmez**; Vercel env `GSC_SA_KEY` (Sensitive) — yalnızca script/cron kullanır; `.gitignore`'a `*.json` anahtar deseni.
5. Search Console → Ayarlar → Kullanıcılar → service account e-postası → **Full**.
6. Kotalar [V]: Search Analytics 1.200 sorgu/dk/site; URL Inspection 2.000/gün/site; veri **16 ay** saklanır → aylık dışa aktarım zorunlu.

### 4.3 `scripts/seo/gsc-export.mjs`

```
node scripts/seo/gsc-export.mjs --month 2026-10            # data/gsc/2026-10.queries.csv + .pages.csv
node scripts/seo/gsc-export.mjs --month 2026-10 --dimensions query,page
```

- `googleapis` (npm) · `GoogleAuth` · scope `webmasters.readonly` · `siteUrl: "sc-domain:valicepress.com"` · `rowLimit 25000` + `startRow` sayfalama [V] · `dataState: "all"`.
- Çıktı `data/gsc/YYYY-MM.{queries,pages,query-page}.csv` (repo'ya commit — küçük, kalıcı, 16 ay sınırını aşar).
- GitHub Actions aylık cron (ayın 3'ü) → PR açar.

### 4.4 Diğer Google yüzeyleri

- **Merchant Center**: ay 4+ (§3.8).
- **Google Business Profile**: fiziksel adres yok → kullanılmaz.
- **Knowledge panel / site name**: `WebSite` markup'ı ana sayfada + `og:site_name` tutarlı "Valice Press" → Google site adı otomatik [V].

---

## 5. Faz 12D — SEO içerik fabrikası

### 5.1 Döngü (seo.png'deki fikrin ajanlaştırılmış hâli)

```
[1] gsc-export.mjs (aylık)  ─► data/gsc/YYYY-MM.*.csv
[2] content-gaps.mjs        ─► impressions ≥ 50 · CTR < %2 · pozisyon 8–30 · sahip sayfa YOK (URL eşleşmesi + niyet sınıflandırması)
                              + "sahip sayfa var ama pozisyon > 10" (iyileştirme listesi)
                              ─► docs/seo/gaps/YYYY-MM.md (brief adayları, niyet, önerilen sayfa tipi)
[3] Editör ajanı            ─► brief → taslak (T1/T2/T4 şablonu, founder ses rehberi, kaynak listesi)  [ajan]
[4] Founder                 ─► okur, düzeltir, imzalar (E-E-A-T: byline gerçek kişi)                   [insan, ≤ 30 dk/parça]
[5] validate:seo            ─► eşikler + yetim + kanibalizasyon                                         [CI]
[6] Yayın                   ─► sitemap otomatik · IndexNow POST · iç link ekleme (kaynak sayfalardan)
[7] 30 gün sonra            ─► [1]'de sorgu bazında tıklama/pozisyon farkı → docs/seo/gaps/ kapanış notu
```

İlk 3 ay GSC verisi zayıf olacağı için [2] yerine §2.3 haritası kullanılır; 4. aydan itibaren döngü veriyle döner.

**Ajan kuralları (fabrika mimarisiyle uyumlu):** taslağı yazan ajan doğrulayan ajan olamaz; her olgusal iddia kaynaklı; kitaptan alıntı ≤ %10; "AI yazdı" değil, "Emre Doğan yazdı, ajan araştırdı" — byline gerçek insan (Google: `author` `Person`, `Thing` değil [V]); AI kullanımı `/about`'ta "nasıl üretiyoruz" bölümünde açıklanır (Google "How" ilkesi [V]).

### 5.2 İçerik takvimi — ilk 6 ay (ayda 4 parça)

| Ay | T2 karşılaştırma / edisyon | Pillar / rehber | Companion / referans seti | Provenans / marka |
|---|---|---|---|---|
| **1 (Eyl–Eki 2026)** | *Which Meditations translation should you read? Long, Casaubon, Hays, Waterfield compared* → `/editions/meditations-translations` | *How to learn Hangul stroke order (and why to write before you speak)* → `/guides/hangul-stroke-order` | Bestiary dizini: ilk **20 yaratık** (Guardians sınıfı) → `/bestiary/*` | Blog temizliği: 3 jenerik yazı kaldırılır; *Why we built Valice Press* → `/about`'a taşınır |
| **2** | *The Enchiridion: Long vs Higginson vs Oldfather — which Epictetus to buy* → `/editions/enchiridion-translations` | *A Stoic reading order for first-time readers* → `/guides/stoic-reading-order` | Oyun dizini: ilk **12 oyun** (Race Home ailesi: Ur, Senet, Hounds & Jackals…) + basılabilir tahtalar → `/games/*` | *How we choose a public-domain edition* (kaynak, çeviri, telif kontrolü — süreç sayfası) → `/about/editions` |
| **3** | *Cain's Jawbone, Journal 29, Codex Enigmatica: how "unsolved" puzzle books differ* → `/editions/puzzle-books-compared` | *How to play Mancala (Oware) — rules, history, a printable board* → `/guides/how-to-play-mancala` | Bestiary **+20** (Devourers) · Mit dizini ilk **5 uygarlık** (Turkic, Inuit, Polynesian, Mesopotamian, Egyptian) | *Codex series: what the three volumes are and how they connect* → `/series/codex` metni |
| **4** | *Dudeney's puzzles: which edition, and what the annotated edition adds* → `/editions/dudeney` (Kitap 03 lansmanı) | *Greek alphabet for mythology readers: 24 letters, 2 hours* → `/guides/greek-alphabet-basics` (Kitap 02) | Oyun **+12** (Hunt & Siege) · Bestiary **+20** (Shape-Changers) | *The Great Book of… series* → `/series/the-great-book-of` |
| **5** | *Kwaidan: Hearn's sources and the yōkai behind each story* → `/editions/kwaidan` (Kitap 06) | *Screen-free puzzles for 8–12s: what actually holds attention* → `/guides/screen-free-puzzles` | Mit **+5** · Bestiary **+20** (Water-Dwellers) | *Valice Script: why handwriting first* → `/series/valice-script` |
| **6** | *Falkener's Games Ancient and Oriental: what archaeology corrected since 1892* → `/editions/falkener` | *Large print editions: who they are for and how we set them* → `/guides/large-print` | Oyun **+12** · Bestiary **+32** (kalanı) → 112 tamam | *Valice Classics standard: minimum vs premium edition* → `/series/valice-classics` |

Altı ayın sonunda: 6 T2 edisyon sayfası, 6 rehber, 112 yaratık, 36 oyun, 10 mit sayfası, 4 seri sayfası, 2 süreç sayfası ≈ **176 yeni indekslenebilir sayfa**, hepsi kitaptan türeyen benzersiz veriyle ve insan editörlü. Aylık founder yükü ≈ 6–8 saat (imza + düzeltme) [A].

### 5.3 Ton ve anti-pattern

- Cevap önce; tablo = bilgi kazancı; "biz seçtik çünkü" cümlesi; kaynak numarası görünür.
- **Yapılmaz:** SERP özeti, "ultimate guide" başlıkları, toplu AI yazı, anahtar kelime yığma, uydurma S-C-S (FAQPage zaten ölü), "free pdf" avı, üçüncü taraf içerikle host itibarı kullanımı (site reputation abuse [V]).

---

## 6. KPI'lar ve hedefler

Ölçüm kaynakları: GSC (Performance, Pages), Vercel Analytics (pageview, `view_item`, `sample_read`, `add_to_cart`, `begin_checkout`, `purchase`, `newsletter_signup` + `source`), Bing WMT, `data/gsc/*.csv`.

| KPI | Bugün [O] | 30 gün [A] | 90 gün [A] | 180 gün [A] |
|---|---|---|---|---|
| GSC'de indeksli sayfa | 0 (mülk doğrulanmamış) | 40 | 150 | 250 |
| Aylık impressions (web) | ölçülmüyor | 1.000 | 8.000 | 30.000 |
| Aylık tıklama | ölçülmüyor | 30 | 300 | 1.200 |
| İlk 10'da sorgu sayısı (marka dışı) | — | 5 | 40 | 150 |
| Kitap sayfası CTR (GSC) | — | — | ≥ %2 | ≥ %3 |
| Companion ziyareti/ay | 0 (404) | 50 | 300 | 1.000 |
| Newsletter kaynak dağılımı | tek kaynak | `hangul-companion` ilk kayıtlar | ≥ 3 kaynak aktif | companion kaynakları ≥ %40 |
| Organik → `/ebooks` → `begin_checkout` oranı | ölçülmüyor | ölçülüyor | ≥ %1.5 | ≥ %2 |
| CWV (Speed Insights p75) | ? | LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 [V eşikler] | aynı | aynı |

Rakamlar **hedef değil sıra büyüklüğüdür**; 90. günde ilk gerçek GSC verisiyle yeniden yazılır. "Ölçülmüyor" satırlarını "0" saymak yasaktır.

---

## 7. Faz 20 — SEO bakım kontrolleri (katalog büyüdükçe)

`validate:seo` + `validate:catalog` haftalık GitHub Actions'ta; eşikler katalog boyutuna göre:

| Katalog kaydı | Otomatik kontrol | Ek |
|---|---|---|
| 30 | sitemap kapsamı, kırık iç link, canonical=apex, JSON-LD geçerliliği, yetim | GSC aylık export |
| 60 | + kanibalizasyon (benzer başlıklar), OG kapak varlığı, referans sayfası eşikleri | + Bing import kontrolü |
| 100 | + "Discovered – not indexed" sayfaları listesi (GSC Pages API) → iç link görevi | + Merchant Center feed sağlığı |
| 180 | + Amazon URL 200 kontrolü (ASIN 404 → `availability` düşür), fiyat tutarlılığı (Paddle ↔ katalog) | + CWV sayfa grubu raporu |
| 250 | + eski içerik: 12 aydır tıklama almayan referans sayfası → "birleştir/yenile/kaldır" kararı | + sitemap index'e geçiş kararı (hâlâ gerekmez) |
| 500–1000 | + otomatik iç link öneri motoru (`internal-links.ts` kalıbı), image sitemap, hreflang (TR açılırsa) | — |

---

## 8. Kapılar (Faz 32) ve Founder aksiyonları

### 8.1 Kapı yapısı

| Alan | Değer |
|---|---|
| **Hedef** | Google ve Bing'in kataloğu doğru host'ta, doğru yapısal veriyle indekslemesi; 6 ayda ~250 gerçek fayda sayfası; GSC → içerik döngüsünün aylık dönmesi |
| **Girdiler** | Bu belge; `valice-catalog.mjs`; `book.json` (Bestiarium 112 giriş), `project_config.json` (Games 56 oyun), Mythologica `book.json` (76 mit); GSC erişimi |
| **Çıktılar** | proxy host redirect; sitemap+freshness; validate:seo (CI); JSON-LD co-typing/ProductGroup; seri/edisyon/referans rotaları; gsc-export + content-gaps scriptleri; 6 aylık içerik |
| **Bağımlılıklar** | Bulgu 1 (apex birincil) → sitemap gönderimi; DNS TXT → GSC; Analytics enable → huni KPI; author bio → ProfilePage |
| **Ajanlar** | teknik SEO ajanı (kod), referans-veri ajanı (JSON çıkarımı + özet), editör ajanı (taslak), doğrulayıcı ajan (kaynak/olgu, taslağı yazandan farklı) |
| **İnsan kontrol noktaları** | Founder: apex kararı, DNS, GCP anahtarı, AI-crawler politikası, her yayın imzası, biyografi |
| **Süre** | Teknik: 4 hafta (≈ 40 sa ajan + 2 sa founder). İçerik: sürekli, ayda 4 parça |
| **Başarı** | 30 gün: GSC doğrulandı, sitemap "Success", 0 kırmızı validate:seo, `.vercel.app` 308. 90 gün: ≥ 150 indeksli sayfa, ≥ 40 top-10 sorgu, huni event'leri akıyor |
| **Başarısızlık** | 90 günde "Discovered – not indexed" > %40 → içerik derinliği sorunu; kanibalizasyon uyarısı > 5 → mimari sorunu; manuel aksiyon → dur, gözden geçir |
| **KPI** | §6 |
| **Sonraki faz bağımlılığı** | Faz 13 (Ads) `/go/amazon/*` attribution linklerini; Faz 11 (e-posta) companion kaynaklarını; Faz 16 (analitik) event setini bu fazdan alır |

### 8.2 Founder'ın yapması gerekenler (yalnızca gerçekten Founder gerektirenler)

| # | Aksiyon | Neden | Nerede | Süre | Bağımlılık |
|---|---|---|---|---|---|
| 1 | `valicepress.com`'u birincil yap, `www` → apex 308 | Canonical/sitemap/webhook/basılı adres apex; şu an ters | Vercel → Project → Settings → Domains | 5 dk | — |
| 2 | DNS TXT `@` = `google-site-verification=o99ifmNUCFgIatG65vnRUxQ-2yMAIDo-xj805KnpUWU` | GSC doğrulaması; hesapta başka mülk yok | Namecheap Advanced DNS | 5 dk | — |
| 3 | GSC → Verify → sitemap gönder | Ölçümün başlangıcı | search.google.com/search-console | 5 dk | #1, #2 |
| 4 | Vercel Web Analytics → Enable; plan kontrolü (Hobby/Pro) | Custom event'ler Pro'da [V] | Vercel → Analytics | 2 dk + karar | — |
| 5 | GCP projesi + Search Console API + service account JSON → Vercel `GSC_SA_KEY` | Aylık dışa aktarım; 16 ay sınırı | console.cloud.google.com | 20 dk | #3 |
| 6 | Bing Webmaster Tools → GSC'den içe aktar → IndexNow key | Bing/Yandex/Naver tazeliği | bing.com/webmasters | 10 dk | #3 |
| 7 | AI crawler politikası kararı (izin [R] / ret) | robots.ts | — | 5 dk | — |
| 8 | Yazar biyografisi (gerçek, 120–200 kelime) + sameAs (Author Central, X, GitHub) | ProfilePage/E-E-A-T; KDP bir kez placeholder bio reddetti [O] | `valice-catalog.mjs` `AUTHORS.bio` | 30 dk | — |
| 9 | Her içerik parçasına imza (aylık ≈ 6–8 sa) | Byline gerçek kişi olmalı | PR review | sürekli | — |

---

## 9. Kaynaklar (2026-09-01/02'de kontrol edildi)

- Google Search Central — redirects (301/308 eşdeğer): developers.google.com/search/docs/crawling-indexing/301-redirects [V]
- Google — canonicalization (rel=canonical "hint"): …/crawling-indexing/canonicalization [V]
- Google — sitemap build (priority/changefreq yok sayılır; lastmod doğruysa kullanılır; 50.000 URL): …/crawling-indexing/sitemaps/build-sitemap [V]
- Google — Change of Address (www için değil; 180 gün): support.google.com/webmasters/answer/9370220 [V]
- Google — site verification (DNS TXT `@`): support.google.com/webmasters/answer/9008080 [V]
- Google — Search Console API limits (1.200 QPM; URL Inspection 2.000/gün): developers.google.com/webmaster-tools/limits [V]
- Google — Indexing API yalnızca JobPosting/BroadcastEvent: developers.google.com/search/apis/indexing-api/v3/quickstart (2026-07-16) [V]
- Google — merchant listing (Product zorunlu alanlar; ISBN yalnız Book, co-type): developers.google.com/search/docs/appearance/structured-data/merchant-listing [V]
- Google — product variants (ProductGroup): …/structured-data/product-variants [V]
- Google — Book actions partner-only: …/structured-data/book [V]
- Google — review snippet (self-serving ineligible; ratings from users): …/structured-data/review-snippet [V]
- Google — profile page (author pages valid): …/structured-data/profile-page [V]
- Google — search gallery 2026-06-15 (FAQ/HowTo yok): …/structured-data/search-gallery [V]; changelog 2026-05-08 FAQ discontinued [V]
- Google — spam policies (scaled content abuse, site reputation abuse) 2026-08-28: developers.google.com/search/docs/essentials/spam-policies [V]
- Google — helpful content / gen-AI guidance: …/fundamentals/creating-helpful-content, …/using-gen-ai-content [V]
- Google — Core Web Vitals thresholds: web.dev/articles/vitals [V]; CrUX methodology (eşik açıklanmaz) [V]
- Google Merchant Center — digital books free listings exception; ISBN-13 as gtin: support.google.com/merchants/answer/14183113, answer/6324461 [V]
- Vercel — Web Analytics pricing/custom events (Pro): vercel.com/docs/analytics/limits-and-pricing [V]; preview/production noindex davranışı: vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines [V]
- IndexNow — participating engines (Google yok): indexnow.org [V]
- Namecheap — TXT record how-to: namecheap.com/support/knowledgebase/article.aspx/317/2237/ [V]
- Public Suffix List — `vercel.app` (satır 16190): publicsuffix.org [V]
- Repo — `docs/seo/00–11` (Haziran 2026), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts`, `src/lib/metadata.ts`, `src/lib/site-url.ts`, `src/lib/analytics.ts` [O]
- Referans projeler — `/home/emre/Downloads/OTHER-RESEARCH/CoachScore-app/coachscore/lib/seo/{validate,freshness,internal-links}.ts` (kopyalanacak kalıplar); `/home/emre/Downloads/enterprise-seo-wt/docs/seo/` (metadata fabrikası, tek-sahip kuralı) [O]
