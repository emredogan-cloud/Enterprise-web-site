# Kurucu kontrol listesi — müşteri edinme, 8 Eylül 2026

Ajanın **yapamadığı** ve yalnızca hesap sahibinin yapabileceği işler, önem sırasıyla.
Her satırın yanında süresi ve neden ajanın yapamadığı yazıyor. Yapılanlar
`VALICE_AUTONOMOUS_CUSTOMER_ACQUISITION_90D_REPORT_TR.html` içinde.

## Bugün (toplam ≈ 45 dakika)

| # | İş | Süre | Neden sen |
|---|---|---|---|
| 1 | **World Games ciltsiz kategorisini düzelt.** amazon.com kitabı *Teen & Young Adult › Hobbies & Games* rafına koymuş; "ilgili ürünler" şeridi çocuk uyku kitapları. KDP → Bookshelf → World Games → Manage title → *Edit paperback details* → Categories → *Humor & Entertainment › Puzzles & Games › Board Games* + *Reference › General* (+ *History › General*); "çocuk kitabı" işaretli olmadığını doğrula. Aynı düzeltmeyi ciltli ve Kindle için yap. | 10 dk | Canlı ilan metadata değişikliği — KDP kapısı senin |
| 2 | **Amazon Ads kampanyasını aç.** Hesap var, US aktif, ürün seçili taslak `advertising.amazon.com/cb/sp` sekmesinde açık duruyor. Girilecek her değer `AMAZON_ADS_CAMPAIGN_SPEC_2026-09-08.md` içinde: önce **Portfolio 200 $ tavan**, sonra C1 (auto, grup bazlı 0,45/0,35/0,40/0,30 $, negatifler, 4,50 $/gün, sabit teklif, yerleşim %0, "ek ülke" KAPALI), sonra C2 (exact, 10 terim, 3 $/gün). | 15 dk | Bu ortamın izin sınıflandırıcısı teklif ve bütçe alanlarına yazmayı engelledi; ajan tekrar denemedi |
| 3 | **A+ içeriği yayınla.** Sekiz modül görseli ve metni hazır: `THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/APLUS/` (`aplus_content.json` metinleri taşır). KDP → Marketing → A+ Content → B0HG3KMK9L. Canlı sayfada bugün A+ yok. Onay ≈ 7 gün; reklam A+ onayını beklemek zorunda değil, kategoriyi beklemeli. | 15 dk | Hesap |
| 4 | **Amazon Attribution etiketi.** Ads console → Amazon Attribution → Create campaign → "Valice site → World Games pb"; üretilen URL'yi `scripts/catalog/valice-catalog.mjs` → World Games paperback `amazonUrl` alanına yapıştır (ASIN aynı kalır). Site → Amazon → satış zincirini gören tek ölçüm. | 5 dk | Hesap |

## Bu hafta

| # | İş | Süre | Neden sen |
|---|---|---|---|
| 5 | **X gönderilerini paylaş.** `X_POST_PACK_WORLD_GAMES.md` — önce sabitlenecek 6'lık dizi, sonra günde bir gönderi. Görseller `docs/growth/assets/`. | 5 dk/gün | Tarayıcı uzantısı `x.com`'a izin vermiyor; X API anahtarı yok |
| 6 | **Google Search Console → URL denetimi → "Dizine eklenmesini iste"** şu 6 adres için: `/`, `/books/the-great-book-of-world-games`, `/companion/world-games`, `/blog/royal-game-of-ur-rules`, `/blog/senet-rules-reconstruction`, `/blog/mancala-which-game-to-start-with`. Google ana sayfayı bile hiç taramamış ("URL is unknown to Google", 8 Eylül). | 5 dk | Uzantı `search.google.com`'a izin vermiyor; servis hesabı yalnızca okuyor |
| 7 | **Bing Webmaster Tools** → "Import from Google Search Console". Bing siteyi zaten dizinlemiş; IndexNow anahtarı deploy'la canlıya çıktı. | 5 dk | Microsoft hesabı |
| 8 | **Üç e-posta taslağını gözden geçir ve gönder** (Gmail → Taslaklar): Gaming with Science podcast, Ludology podcast, Multicultural Kid Blogs. Hiçbiri gönderilmedi. `OUTREACH_LOG.md` erişilemeyen dört hedefi ve tekrar denenecekleri listeler. | 10 dk | Üçüncü kişilere senin adına e-posta |
| 9 | **Amazon Author Central**: yazar sayfasına `valicepress.com` adresini ve blog akışını ekle. Google'ın ana sayfayı keşfetmesi için en güçlü tek geri bağlantı. | 5 dk | Uzantı `author.amazon.com`'a izin vermiyor |
| 10 | Vercel → Analytics'i aç (proje için "Web Analytics not found" döndü) ya da tarayıcılarında `/account/settings → Exclude my visits`'i aç; bugünkü 34 `view_item` olayının çoğu büyük olasılıkla iç trafik. | 2 dk | Hesap |

## Yapılmayacaklar (bilinçli)
- Pinterest / Instagram / TikTok hesabı açmak: ajan hesap açmaz; sen açarsan Pinterest, tahta paketinin doğal mecrası (`REDDIT_VALUE_FIRST_PLAN.md`'deki ölçüm kuralı aynen geçerli).
- Reddit'te yeni hesapla link bırakmak: `REDDIT_VALUE_FIRST_PLAN.md` — önce üç hafta katkı, sonra üç gönderi.
- Kindle baskılarına reklam: 70 % telif seçeneği doğrulanana kadar hayır (KDP rafında World Games Kindle bugün **9,99 $**, katalogda 11,99 $ — fiyat değişmiş; katalog bir sonraki yüklemede güncellenmeli).
- Fiyat değişikliği: ilk 200 $ boyunca hiçbir fiyat oynanmaz.
