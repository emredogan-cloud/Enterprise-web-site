# Kurucu kontrol listesi — müşteri edinme, 8 Eylül 2026 (akşam güncellemesi)

Ajanın **yapamadığı** ve yalnızca hesap sahibinin yapabileceği işler, önem sırasıyla.
Her satırın yanında süresi ve neden ajanın yapamadığı yazıyor. Ajanın bugün **yaptığı**
işler en altta, tekrar yapılmasın diye kanıtıyla listeli. Tam kronoloji: `EXECUTION_LOG.md`.

## Bugün (toplam ≈ 45 dakika)

| # | İş | Süre | Neden sen |
|---|---|---|---|
| 1 | **Clerk'i production instance'a taşı.** Üretim Vercel'de hâlâ `pk_test`/`sk_test` (development instance). Bu yüzden Googlebot 8 Eylül'e kadar tek sayfa bile alamadı ("redirect error", 0 dizinlenmiş sayfa). Ajan PR #39 ile tarayıcıların yolunu açtı (çerezsiz herkese açık GET'ler artık Clerk'e uğramıyor; kanıt: Googlebot/Bingbot `curl` → 200). Kalıcı çözüm senin: Clerk Dashboard → *Create production instance* → alan adı `valicepress.com` → verilen CNAME kayıtlarını DNS'e ekle (`clerk.`, `accounts.`, e-posta kayıtları) → Vercel Production env'de `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`=`pk_live_…`, `CLERK_SECRET_KEY`=`sk_live_…` → yeniden deploy → giriş/çıkışı bir kez dene. | 20 dk | Clerk hesabı + DNS |
| 2 | **Amazon Ads C1 bitiş tarihi: 4 Ekim 2026.** Kampanya `VP - world-games - pb - 01-auto - US` (id `A09619391W5FJBPWZEHY4`) 9 Eyl'de başlıyor, günlük 4,50 $, **bitiş tarihi yok** — 200 $ tavanı bugün yalnızca günlük bütçe koruyor. Ads console → kampanya → *Campaign settings* → *Schedule* → bitiş = 4 Ekim 2026. Ajanın tarayıcısında takvim Ocak 2027'den geriye gitmedi; alan için `form_input` sınıflandırıcı tarafından reddedildi. | 1 dk | Konsol kontrolü |
| 3 | **C2 exact kampanyasını aç** (`AMAZON_ADS_CAMPAIGN_SPEC_2026-09-08.md` → C2: 10 anahtar kelime, 0,50/0,40 $, günlük 3 $, sabit teklif, aynı negatifler, ad `VP - world-games - pb - 02-exact - US`, bitiş 4 Ekim 2026). Ajanın oturumunda Sponsored Products kampanya kurucusu dört farklı girişten de yalnızca bölüm başlıklarını çizdi; konsol hatası: `AtlasFormRenderer … Unexpected token '<' … is not valid JSON` (JSON beklenen çağrıya HTML döndü). Yeni bir oturumda büyük olasılıkla çalışır. | 10 dk | Kurucu arayüzü ajanın oturumunda bozuk |
| 4 | **A+ içeriğin durumunu 15 Eylül'de kontrol et.** Ajan A+ içeriğini KDP A+ Content Manager'da kurup gönderdi/göndermeye çalıştı — kesin durum `EXECUTION_LOG.md` son A+ satırında (SUBMITTED ≠ PUBLISHED; onay ≈ 7 gün). Reddedilirse gerekçe içerik yöneticisinde görünür; modül 05 görseli (`aplus-05-play-family-discovery.png`) hâlâ eksik, o modül bilerek atlandı. | 3 dk | Hesap |
| 5 | **11 Eylül'de amazon.com kategorisine bak.** KDP'de ciltsizin kategorileri artık `Humor & Entertainment › Puzzles & Games › Board Games › General` + `Reference › General` + `History › General` (ajan DOM'dan doğrulayıp yeniden yayınladı; raf "Live · Updates publishing"). 72 saat sonra ürün sayfası hâlâ *Teen & Young Adult* gösteriyorsa KDP destek talebi: "browse node update not reflected". | 2 dk | Süre |

## Bu hafta

| # | İş | Süre | Neden sen |
|---|---|---|---|
| 6 | **Bing Webmaster Tools** → "Import from Google Search Console". IndexNow anahtarı canlı; Bing/DDG siteyi zaten dizinliyor. | 5 dk | Microsoft hesabı |
| 7 | **Amazon Author Central**: yazar sayfasına `valicepress.com` ve blog akışını ekle — Google için en güçlü tek geri bağlantı. | 5 dk | Uzantı `author.amazon.com`'a izin vermiyor |
| 8 | **Vercel → Analytics'i aç** (API "Web Analytics not found" döndürüyor) ya da tarayıcında `/account/settings → Exclude my visits`'i aç. | 2 dk | Hesap |
| 9 | **Ortak e-postalarına cevap gelirse** (`OUTREACH_LOG.md`, üç e-posta 8 Eyl 15:33 UTC'de gönderildi): cevap veren her ortağa Attribution kampanyasında ayrı reklam grubu/etiket aç; ölçüm oradan. | 5 dk/cevap | Senin adına ilişki |
| 10 | **X paketini paylaş** (`X_POST_PACK_WORLD_GAMES.md`): sabitlenecek dizi + günde bir gönderi. Ajan bugün iki değer-öncelikli *yanıt* attı (@bvrakvs, @herseyindunyasi); paketin kendisi paylaşılmadı. | 5 dk/gün | Marka sesi senin |
| 11 | **Reddit**: `REDDIT_VALUE_FIRST_PLAN.md` — ajan r/abstractgames'te linksiz bir cevap yazdı; üç gönderi için önce üç hafta katkı. | 10 dk/hafta | Hesap itibarı |
| 12 | **Telegram/Discord**: `COMMUNITIES_TELEGRAM_DISCORD.md` — 20 topluluk, kuralları ve giriş sırası; ajan hiçbirine yazmadı (hesap gerekir). | 15 dk | Hesaplar senin |

## Ajanın bugün yaptıkları (tekrar yapma)
- **KDP kategori düzeltmesi** — ciltsiz yeniden yayınlandı (16:3x'teki ilk deneme yanlış alt ağaca — Teen & YA › … › Board Games — kaydetmişti; 17:5x'te DOM'dan doğrulanarak düzeltildi).
- **Üretim katalog yüklemesi** — `load-catalog.mjs --commit --i-know-this-is-production`: 27 kitap; World Games ciltsiz `amazon_url` Attribution etiketiyle. Canlı "Buy on Amazon" bağlantısı doğrulandı (`?maas=…&tag=maas`).
- **Kindle doğrudan fiyatları** — Bestiarium ve World Games 9,99 $ (DB 999 cent, Paddle `pri_01m1zbewy6v80k9r58qbsxz1r4` / `pri_01m1zbf17bapxg1hd2gtp1554a`); zaten yerinde, yeniden yazılmadı.
- **Amazon Ads C1** — `VP - world-games - pb - 01-auto - US`, otomatik hedefleme, sabit teklif 0,45/0,35/0,40/0,30 $, 25 negatif, 4,50 $/gün, 9 Eyl başlangıç, durum *Scheduled*.
- **Tarayıcı erişim düzeltmesi** — PR #39 (`99cc842`), 17:10 UTC'de canlı; `/`, `/sitemap.xml`, `/robots.txt` çerezsiz istekte 200.
- **GSC** — 6 öncelikli URL için dizine ekleme istendi (17:2x–17:4x). İSTENDİ ≠ DİZİNLENDİ; 15 Eylül'de kapsam raporuna bak.
- **Gmail** — 3 ortak e-postası gönderildi (Gaming with Science, Ludology, Multicultural Kid Blogs), taslaklar çöpe.
- **X** — 2 yanıt; **Reddit** — 1 yorum (linksiz). DM yok, spam yok.
- **A+** — bkz. madde 4.

## Yapılmayacaklar (bilinçli)
- Pinterest / Instagram / TikTok hesabı açmak: ajan hesap açmaz.
- Kindle baskılarına reklam: 70 % telif seçeneği doğrulanana kadar hayır.
- Fiyat değişikliği: ilk 200 $ boyunca hiçbir fiyat oynanmaz.
- Yorum/inceleme isteme, teşvikli yorum, sahte etkileşim: hiçbir koşulda.
