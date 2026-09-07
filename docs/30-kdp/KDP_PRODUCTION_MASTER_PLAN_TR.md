# KDP Üretim Ana Planı — Valice Press

**Tarih:** 2 Eylül 2026 · **Kapsam:** Faz 4 / 4A / 4B / 17 (Amazon baskı üretimi, format merdiveni, KDP iş akışı, fiyat motoru)
**Bağlı olduğu belgeler:** `VALICE_PRESS_MASTER_ROADMAP_TR.md` (karar omurgası) · `CATALOG_ECONOMICS_FINAL.md` · `FORMAT_LADDER_MATRIX.csv` · `scripts/strategy/price-engine.mjs` · `PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md`

Kanıt etiketleri: **[V]** birincil kaynaktan doğrulandı (URL ve tarih tabloda) · **[O]** canlı sistemde gözlendi · **[A]** varsayım · **[R]** öneri · **[S]** senaryo. Doğrulanamayan her şey **DOĞRULANMADI** olarak işaretlenir.

> **Bu belge ne değildir:** yeni kitap üretmez, hiçbir KDP kaydını değiştirmez. Her başlık için hangi formatın, hangi trimde, hangi mürekkeple, hangi fiyata ve hangi pazarda *üretilmesi gerektiğini* — ve hangisinin **üretilmemesi** gerektiğini — ekonomiye dayanarak yazar.

---

## 0. Tek sayfa özet

| Karar | Değer | Dayanak |
|---|---|---|
| Baskı kanalı | Yalnızca Amazon KDP (POD). Web sitesi baskı satmaz, Amazon'a yönlendirir. | `PAST_DECISIONS.md`; KDP web sitesi siparişi karşılayamaz [V, KDP_WEBSITE_POLICY_RESEARCH §5] |
| Mürekkep | **Her zaman siyah**; premium renk yasak; standart renk yalnızca 8.5×11 dışı, ≤200 sayfa ve tek tek onaylı | 9× marj farkı [V rate card]; katalogda zaten hiç renkli baskı yok [O] |
| Format merdiveni | **Kitap başına karar, kural değil.** LP yalnızca 6×9 tabanlı ve ≥150 sayfa referans kitaplarda; hc her başlıkta TEST | Hardcover sabit maliyeti $5.65 kısa kitapta marjı yer [V] |
| En yüksek katkılı eksik format | **World Games Large Print — $31.03 liste, $12.86/adet** | `FORMAT_LADDER_MATRIX.csv` |
| E-kitap fiyat tabanı | **$4.99 yok.** $6.99 → 30 gün → $9.99; %70 bandı $2.99–12.99 (7 Tem 2026) | [V KDP fiyat sayfası, önceki araştırma] |
| PD e-kitap Amazon'da | Yalnızca keşif için (%35). Doğrudan satış birincil. | KDP PD kuralı [V] |
| Yeni başlık hızı | Ayda 5 içerik projesi ≈ 14 başlık-format kaydı; KDP tavanı ~10/format/hafta bağlayıcı değil | [V önceki araştırma, Publishers Weekly/KDP Help] |
| AI beyanı | Her yüklemede founder yapar; ajan yapamaz. Beyan kamuya görünmez, telifi etkilemez, atlanması hesap riski | [V KDP Content Guidelines] |

---

## 1. Güncel KDP kuralları (2 Eylül 2026 doğrulaması)

### 1.1 Trim, sayfa, mürekkep, kâğıt [V]

| Format | Trim seçenekleri | Sayfa aralığı | Mürekkep / kâğıt |
|---|---|---|---|
| Paperback | 5×8 · **6×9 (varsayılan)** · özel 4–8.5 in genişlik × 6–11.69 in yükseklik · geniş trimler **6.14×9.21 · 7×10 · 8.25×11 · 8.5×11** | S/B: 24–828 · Std renk: 72–600 · Premium renk: 24–828 | Siyah: beyaz/krem/groundwood · Renk: **yalnızca beyaz** |
| Hardcover | **5.5×8.5 · 6×9 · 6.14×9.21 · 7×10 · 8.25×11** (8.5×11 YOK → Hangul/Games hc'si 8.25×11) | **75–550** (75–108 S/B: yalnızca sabit maliyet) | **Yalnızca siyah mürekkep, beyaz veya krem kâğıt.** Standart/premium renk hardcover'da "Not available" |

Sonuçlar: Mythologica LP (578 s) ve Bestiarium LP (599 s) hardcover **olamaz** (550 tavanı) → LP her zaman paperback [O + V]. Renkli hardcover diye bir seçenek 2026'da **yoktur**; ileride renkli bir flagship planlanırsa ya paperback standart renk ya da siyah mürekkep.

### 1.2 Baskı maliyeti — Amazon.com rate card [V, `scripts/strategy/catalog-economics.mjs` içinde kodlu]

| Mürekkep / trim | Paperback | Hardcover |
|---|---|---|
| S/B regular (≤ 6.12×9 sınıfı) | 24–110 s: **$2.30 sabit** · 110–828 s: **$1.00 + $0.012/s** | **$5.65 + $0.012/s** (75–108 s: $5.65) |
| S/B large (6.14×9.21 ve üstü) | 24–110 s: $2.84 sabit · 110–828 s: $1.00 + $0.017/s | $5.65 + $0.017/s |
| Standart renk regular / large | $1.00 + $0.0255/s · $1.00 + $0.0402/s | — (yok) |
| Premium renk regular / large | $1.00 + $0.065/s · $1.00 + $0.080/s | $5.65 + $0.065/s · $5.65 + $0.080/s (**kullanılmaz**) |

Diğer pazarların (.co.uk, .de, .co.jp…) maliyet katsayıları bu belgede **DOĞRULANMADI**; `.com` tablosu tek referanstır. Founder KDP "Printing cost & royalty calculator" ile pazar başına doğrular.

### 1.3 Telif oranları ve eşikler [V, KDP "Paperback Royalty"]

| Pazar | %50 | %60 |
|---|---|---|
| Amazon.com | ≤ $9.98 | **≥ $9.99** |
| .de .fr .it .es .nl .ie .com.be | ≤ €9.98 | ≥ €9.99 |
| .co.uk | ≤ £7.98 | ≥ £7.99 |
| .ca | ≤ CA$13.98 | ≥ CA$13.99 |
| .com.au | ≤ AU$13.98 | ≥ AU$13.99 |
| .co.jp | ≤ ¥999 | ≥ ¥1000 |
| .pl / .se | ≤ 39 PLN / ≤ 109 SEK | ≥ 40 PLN / ≥ 110 SEK |

- Telif = **oran × liste − baskı maliyeti**. Expanded Distribution: **%40** − baskı.
- **Minimum liste fiyatı** = baskı maliyeti ÷ oran (KDP zorunlu kılar; 599 sayfalık LP $18.64 altına inemez). Maksimum liste $250 (.com).
- Kindle: **%70 bandı $2.99–$12.99** (7 Temmuz 2026'dan itibaren, **opt-in**: fiyatı yükseltip %70'i işaretlemeyen %35'e düşer [V önceki araştırma, KDP_ADVERTISING_STRATEGY_2026]); teslimat $0.15/MB; **ağırlıklı PD içerik yalnızca %35 ve Select'e uygun değil** [V].

### 1.4 Kapak spesifikasyonu [V, KDP "Create a Paperback Cover"]

| Kural | Değer |
|---|---|
| Dosya | Tek PDF, **≥300 DPI**, CMYK önerilir, **≤ 40 MB**, spot renk yok |
| Bleed | **0.125"** (3.2 mm) üst/alt/dış |
| Güvenli alan | Metin trim çizgisinden ≥ 0.125" içeride; sırt metni her iki yanda ≥ 0.0625" |
| Sırt metni | **≥ 79 sayfa** gerekir |
| Sırt genişliği | sayfa × **0.002252"** (beyaz S/B ve standart renk) · × **0.0025"** (krem) · × 0.002347" (premium renk) |
| Hardcover | KDP Print Cover Calculator'dan **okunur, türetilmez** (Enigmatica reddi ve World Myths K39 kararı) [O] |

### 1.5 Metadata, içerik ve politika kuralları [V]

| Konu | Kural |
|---|---|
| Anahtar kelime | **En fazla 7**; sahibi olmadığınız marka adı, "best" gibi öznel iddia, "new/on sale" gibi zamana bağlı ifade, Amazon program adı (Kindle Unlimited), kategoride zaten geçen kelime ve yazım hatası yasak |
| Kategori | Sayı bu geçişte **DOĞRULANMADI** (2024'te 3'e indirildiği biliniyor [S]); founder yükleme ekranında görür |
| Public domain | Farklılaştırma = **özgün çeviri** · **özgün annotation** (çalışma rehberi, eleştiri, biyografi, tarihsel bağlam) · **≥10 özgün illüstrasyon**; başlık alanında **(Translated)/(Annotated)/(Illustrated)** zorunlu; kabul edilmeyen: bağlantılı içindekiler, biçimlendirme, derleme, sıralama, fiyat, "serbestçe erişilebilir internet içeriği" |
| AI beyanı | **AI-generated** = metin/görsel/çeviriyi AI aracı üretti (sonradan ağır düzenlense bile) → yeni yayında ve her yeniden yayında beyan **zorunlu**. **AI-assisted** = siz yazdınız, AI düzeltti/iyileştirdi → beyan gerekmez. Beyanı yalnızca founder yapar (tüm projelerde `founderConfirmed: false` [O]) |
| Bonus içerik | Kitabın **sonunda**, içindekilerde listeli, kitabın **~%10'unu aşmaz**, "rahatsız edici bağlantı" yok, hediye/ödül vaadi yok |
| Hyperlink | Okur deneyimini doğrudan iyileştiren bağlantılar serbest; **müşteri bilgisi isteyen web formlarına** ve diğer e-kitap mağazalarına bağlantı yasak (KDP_WEBSITE_POLICY_RESEARCH) → companion sayfası "önce fayda, sonra opsiyonel e-posta" kalıbıyla uyumlu |
| KDP Select | 90 gün dijital münhasırlık, otomatik yenilenir, baskı muaf; Countdown Deal yalnızca US/UK ve $2.99–9.99; ücretsiz promosyon 5 gün/dönem |
| Pre-order | **Yalnızca e-kitap**; ≤ 1 yıl önce; ≤ 10 eşzamanlı; dosya yayından >72 saat önce; kaçırma = 1 yıl yasak. **Paperback pre-order yok** → "Schedule a release date" |
| Proof / author copy | Proof: taslak durumunda, **≤ 5/sipariş**; author copy: canlı başlıkta **≤ 999/sipariş**; ücretsiz/Prime kargo yok; .com/.ca/.co.uk/.fr/.it/.es/.de/.com.au/.co.jp'den gönderim |
| Hız sınırı | Eylül 2023: 3 başlık/gün → 2025 sonu: **~10 yeni başlık/format/hafta** [V önceki araştırma]; ayda 5 projenin ~14 kaydı tavanın çok altında |

### 1.6 Kaynak tablosu

| Kaynak | Ne doğruladı | Tarih |
|---|---|---|
| kdp.amazon.com/en_US/help/topic/G201834180 — Print Options | Paperback/hardcover trim listeleri, sayfa aralıkları, kâğıt/mürekkep | 2026-09-02 |
| …/GVBQ3CMEQW3W2VL6 — Set Trim Size, Bleed, and Margins | Hardcover 75–550 s, hc yalnızca siyah mürekkep | 2026-09-02 |
| …/G201834330 — Paperback Royalty | Telif formülü, ülke eşikleri, ED %40, minimum liste kuralı, $250 tavanı | 2026-09-02 |
| …/G201953020 — Create a Paperback Cover | Bleed, güvenli alan, sırt formülü, 300 DPI, 40 MB, 79 sayfa | 2026-09-02 |
| …/G201298500 — Keywords | 7 anahtar kelime ve yasaklar | 2026-09-02 |
| …/G200672390 — Content Guidelines | AI-generated / AI-assisted tanımı, PD "undifferentiated" yasağı | 2026-09-02 |
| …/G200743940 — Publishing Public Domain Content | Farklılaştırma üçlüsü, başlık etiketi, kabul edilmeyenler | 2026-09-02 |
| …/G202018960 — Bonus Content | Sonda, TOC'ta, ~%10, bağlantı/ödül yasağı | 2026-09-02 |
| …/GVEG4YA9G2T7N6DR — Proof/author copies | 5 / 999 limitleri, pazarlar | 2026-09-02 |
| …/G201499380 — Kindle eBook Pre-Order · …/G200798990 — KDP Select | Pre-order ve Select şartları | 2026-09-01 (Ads araştırması) |
| …/GQ6JQ7FM6C72HE4X — Hyperlink Guidelines | Form/mağaza bağlantı yasağı | 2026-08-29 (KDP_WEBSITE_POLICY_RESEARCH) |
| Rate card (paperback/hardcover baskı maliyeti, Kindle bandı) | `catalog-economics.mjs` başlığındaki doğrulama | 2026-09-01 |

---

## 2. Format merdiveni — ekonomiye göre kurallar

### 2.1 Beş kural

1. **Katkı sayfa başına fiyatla belirlenir, formatla değil.** 160 sayfalık World Games paperback'i ($22.99) 435 sayfalık Bestiarium'dan ($24.99) daha çok kazandırır ($10.07 vs $8.77) [O, CATALOG_ECONOMICS_FINAL §3].
2. **Hardcover otomatik değil, test.** Sabit $5.65 kısa kitapta farkı yutar: 124 sayfalık Hangul hc'si $21.99'da yalnızca **$5.44** (paperback $4.69). Fark $0.75/adet; ~3 saatlik iş için kabul edilebilir ama "9 kat" değil [V arithmetic].
3. **Large print yalnızca 6×9 tabanlı, ≥150 sayfalık okuma kitaplarında.** Zaten geniş trim olan workbook'larda (8.5×11) LP anlamsız; LP sayfa sayısı ~1.75× şiştiği için **fiyat sayfa başına (~$0.055–0.06/s) konur, paperback oranıyla değil**. Aksi halde LP her kitabın en kötü marjı olur (Bestiarium LP %22.7, Mythologica LP %21.3) [O].
4. **Renk = vergi.** 8.5×11 premium renk 256 sayfa = $21.48 baskı; "satılamaz" (World Games project_config) [O]. Standart renk yalnızca ≤200 sayfa, 6×9 ve founder onayıyla; hardcover'da renk yok [V].
5. **Amazon e-kitabı yalnızca %70 bandında, asla $4.99.** $4.99 → $3.04; $6.99 → $4.44; $9.99 → $6.54 net [V arithmetic]. PD e-kitap Amazon'da %35 → yalnızca keşif.

### 2.2 Mevcut 8 kitap — format karar tablosu

`FORMAT_LADDER_MATRIX.csv` ve `CATALOG_ECONOMICS_FINAL.csv` ile birebir tutarlıdır.

| Kitap (trim, sayfa) | ebook | paperback | hardcover | large print | Karar / aksiyon |
|---|---|---|---|---|---|
| **Codex Mythologica** (6×9, 329) | Kindle $4.99 **Select** | $21.99 canlı ($8.25) | $32.99 canlı ($10.20) | $27.99 canlı, 578 s ($5.97, %21.3) | **Select auto-renew KAPAT** → dönem bitince direct $9.99. Kindle $4.99 → **$6.99** testi. LP 578 s: $31.99'a yeniden fiyat düşün ($0.055/s) [R] |
| **Codex Bestiarium** (6×9, 435) | direct $12.99 ($11.84) | $24.99 canlı ($8.77) | $37.99 canlı ($11.92) | $29.99 canlı, 599 s ($6.81, %22.7) | **LP $29.99 → $34.99** ($9.81, %28) [R]. **İlan 120 → 112 yaratık** düzeltmesi (4 kayıt) |
| **Codex Enigmatica** (6×9, 274) | direct $9.99 ($8.99) | $19.99 canlı ($7.71) | $29.99 canlı ($9.06) | **YOK → EVET** ~480 s, $26.98 ($7.03) | LP üret (6 saat). Kindle dosyası 46 MB → teslimat ücreti $6.9! **Kindle EPUB'ı ≤3 MB'a düşür** (yeniden dizgi) [O boyut, V ücret] |
| **World Myths** (6×9, 234) | direct $4.99 ($4.24) | $14.99 canlı ($5.19) | $26.99 canlı ($7.74) | K6/A6 ile kapalı; TEST ($20.23, $4.17) | **$4.99 → $6.99** testi (30 gün, hacmin %69'u korunursa kâr). LP: TEST, düşük öncelik |
| **World Games** (8.5×11, 160) | direct $11.99 ($10.89) | $22.99 canlı ($10.07) | $34.99 canlı ($12.62) | **YOK → EVET** ~280 s 6×9? Hayır: LP 8.5×11'de büyük punto yeniden dizgi, ~280 s, **$31.03 ($12.86)** | **Kataloğun en yüksek katkılı baskı birimi.** Ay 1 işi |
| **Myth Hunter's Field Book** (8.5×11, 156) | yok (tasarım gereği) | $14.99 canlı ($5.34) | coming_soon, TEST ($22.48, $5.19) | EVET ($20.23, $6.50) | Yazılan bir kitapta LP: büyük punto = daha büyük yazma alanı, mantıklı [R]. hc TEST |
| **Korean Hangul Workbook** (8.5×11, 124) | fixed-layout EPUB var, satılmaz | $12.99 incelemede ($4.69) | $21.99 incelemede ($5.44) | **HAYIR** (zaten large trim, workbook) | **A7 lisans sorusu çözülene kadar hiçbir kanalda satılmaz.** hc'yi koru (TEST) |
| **Meditations** (dijital, 148) | direct $9.99 ($8.99) | yok | yok | yok | Annotated edisyona yükselt (#18) → sonra pb 6×9 $14.99 (baskı $2.78, net $6.21) ve Kindle (Annotated) %35 keşif |

### 2.3 İlk 20 kitap — format / trim / mürekkep / fiyat / pazar

Fiyatlar `price-engine.mjs` ile %35 hedef marja göre; **[A]** sayfa sayıları tahmin, üretim sonrası yeniden hesaplanır. Hepsi siyah mürekkep, krem (okuma) / beyaz (workbook).

| # | Kitap | Şerit | Trim | Sayfa [A] | Paperback | Hardcover | Large print | E-kitap | Pazar |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Korean Hangul Workbook (unblock) | A | 8.5×11 / hc 8.25×11 | 124 | $12.99 ($4.69) | $21.99 TEST ($5.44) | HAYIR | Kindle fixed-layout (satış kararı A7 sonrası) | .com + .co.uk/.ca/.com.au |
| 02 | Greek Alphabet Workbook | A | 8.5×11 | ~120 | $12.99 ($4.69) | $21.99 TEST | HAYIR | yok | .com + AB |
| 03 | Dudeney Puzzles (Annotated · Illustrated) | C | 6×9 | ~240 | sonra $16.99 ($6.33) | HAYIR (ilk yıl) | sonra TEST | **direct $9.99 birincil**; Kindle $9.99 (%35, keşif) | direct; .com |
| 04 | Codex Mythologica: The Puzzle Book | A/B | 8.5×11 | ~140 | $14.99 ($5.75) | $24.99 TEST | HAYIR (write-in, zaten large) | yok | .com |
| 05 | Epictetus: Enchiridion + Discourses (Annotated) | C | 6×9 | ~160 | sonra $12.99 ($4.87) | HAYIR | HAYIR | **direct $8.99**; Kindle (Annotated) %35 keşif | direct |
| 06 | Kwaidan (Annotated · Illustrated) | C | 6×9 | ~200 | sonra $14.99 ($5.59) | HAYIR | HAYIR | **direct $8.99** | direct |
| 07 | Hangul Book 2: Words & Phrases | A | 8.5×11 | ~130 | $12.99 | $21.99 TEST | HAYIR | yok | .com |
| 08 | Myth Hunter's Field Book Vol. 2 | A | 8.5×11 | ~160 | $14.99 ($5.27) | $24.99 TEST | EVET (#1 satarsa) | yok | .com |
| 09 | Falkener, Games Ancient and Oriental (Annotated · Illustrated) | C | 8.5×11 (tahta diyagramları) | ~220 | sonra $22.99 | HAYIR | HAYIR | **direct $12.99** | direct |
| 10 | Cyrillic Workbook | A | 8.5×11 | ~120 | $12.99 | $21.99 TEST | HAYIR | yok | .com + .de |
| 11 | Great Book of Norse Myths & Legends (young) | A/B | 6×9 | ~240 | $14.99 ($5.31) | $26.99 ($7.81) | HAYIR (çocuk) | direct $6.99→$9.99; Kindle aynı | .com + .co.uk |
| 12 | Before You Cut, Book 1 | B | 8.5×11 | 259 | $26.99 ($11.79) | HAYIR (ilk yıl; 8.25×11 hc P6) | HAYIR | yok (diyagram kitabı) — ileride direct PDF | .com; **ön koşullar: marka izni, dış test, kapak** |
| 13 | Werner, Myths and Legends of China (Annotated · Illustrated) | C | 6×9 | ~380 | $19.99 ($6.43) | $32.99 ($9.60) | sonra TEST | **direct $12.99** | direct; .com |
| 14 | Seneca Letters, Selected (Annotated) | C | 6×9 | ~200 | sonra $14.99 | HAYIR | HAYIR | **direct $9.99** | direct |
| 15 | Kana Workbook | A | 8.5×11 | ~130 | $12.99 | $21.99 TEST | HAYIR | yok | .com + **.co.jp değerlendir** |
| 16 | Codex Heroica (flagship) | B | 6×9 | ~400 | $24.99 ($9.19) | $37.99 ($12.34) | EVET ~700 s $38.99 ($10.79) | direct $12.99; Kindle $12.99 (%70) | .com + AB + ED TEST |
| 17 | Great Book of World Games Vol. 2 | A | 8.5×11 | ~160 | $22.99 ($10.07) | $34.99 ($12.62) | EVET ($31.03) | direct $11.99 | .com |
| 18 | Meditations — Valice Annotated Edition | C | 6×9 | ~220 | $14.99 ($5.75) | HAYIR | HAYIR | direct $9.99 (mevcut); Kindle (Annotated) | direct |
| 19 | Loyd's Cyclopedia — Best 120 (Annotated · Illustrated) | C | 6×9 | ~260 | sonra $16.99 | HAYIR | HAYIR | **direct $9.99** | direct |
| 20 | Codex Enigmatica II | A/B | 6×9 | ~280 | $19.99 ($7.63) | $29.99 ($8.98) | EVET ($26.98) | direct $9.99 | .com |

"sonra" = doğrudan e-kitap kanıtlandıktan (≥ 20 satış) sonra baskı. "HAYIR" bir kural değil, o kitabın ekonomisidir; sayfa sayısı ölçülünce `price-engine.mjs` ile yeniden bakılır.

---

## 3. Hangi Amazon pazarları

| Pazar | Karar | Gerekçe |
|---|---|---|
| **Amazon.com** | Birincil; tüm formatlar | İngilizce katalog; rate card ve reklam yalnızca burada doğrulandı |
| .co.uk / .de / .fr / .it / .es / .ca / .com.au | Otomatik dağıtım açık (KDP varsayılanı); fiyat eşikleri §1.3'e göre %60 bandında tut | Ek iş sıfır; yerel fiyatı KDP'nin dönüşümüne bırakma, eşik üstüne elle koy |
| Expanded Distribution (%40) | **Yalnızca 6×9 referans kitaplarda TEST** (Codex serisi, Heroica); workbook ve LP'de kapalı | %40'ta 435 sayfalık Bestiarium $24.99 → $3.78; kütüphane/kitapçı kanalı için düşük fiyat toleransı yok |
| .co.jp | Kana Workbook (#15) için değerlendir; ¥1000 eşiği | Hedef kitle kısmen Japonya'daki İngilizce konuşan öğrenciler [A] |
| .com.tr | **Hayır** | "KDP için anlamlı bir kanal değil" [O, AMAZON-KDP-2026-MARKET-OPPORTUNITY-REPORT] |

---

## 4. KDP üretim iş akışı

Mevcut boru hattı (ReportLab, `project_config.json`, `.gate`, `kill_gate.py`, `selftest.py`, `KDP_UPLOAD_HANDBOOK.md`) korunur; bu bölüm onu **adım/girdi/çıktı/sorumlu/süre/başarısızlık/otomatik test** düzeyinde standardize eder.

| Adım | Girdi | Çıktı | Sorumlu | Süre (Lane A) | Başarısızlık koşulu | Otomatik test |
|---|---|---|---|---|---|---|
| **SOURCE** | Onaylı manuscript (kapı 1–6 geçmiş), `project_config.json` | Kilitli `01_SOURCE/` + hak kaydı (`rights` bloğu) | Ajan | 0.5 s | Kaynakta lisansı belirsiz varlık (S-0019 gibi) | `validate_structure.py` — her kaynak `license` alanı dolu |
| **INTERIOR** | Kaynak + seri şablonu (trim, mürekkep, kâğıt) | `08_OUTPUT/<format>/interior.pdf` + SHA256 | Ajan | 2 s (şablonlu) | Font gömülmemiş; eksik glif; boş sayfa; yer tutucu metin; sayfa ≥ 550 hc | `qa_all.sh`: font embedding 100%, glif kapsaması, `[PLACEHOLDER]` taraması, sayfa aralığı |
| **COVER** | Ölçülen sayfa sayısı, kâğıt tipi, KDP calculator ekran görüntüsü | `cover.pdf` (pb), `cover.pdf` (hc — calculator'dan okunan geometri) | Ajan + **Founder** (calculator çalıştırır) | 1.5 s | Sırt toleransı ±0.0625" aşıldı; güvenli alan dış kenardan ölçülmedi; kâğıt–kapak uyumsuz | `qa_cover.py`: sırt = sayfa × katsayı, bleed 0.125", safe 0.125"/0.0625", ≤40 MB, 300 DPI |
| **UPLOAD** | Interior + cover + metadata (`book_metadata.json`) | KDP taslağı; ISBN KDP'den | **Founder** | 0.5 s | Metadata alanı boş; anahtar kelime yasağı ihlali; AI beyanı yapılmadı | `qa_metadata.py`: 7 anahtar kelime kuralı, başlık ≤ 200 karakter, PD etiketi, BISAC |
| **PREVIEWER** | KDP Print Previewer | "Approve" | **Founder** (KDP arayüzü) | 0.3 s | Previewer uyarısı (margin, resolution) | — (insan gözü) |
| **PROOF** | Yeni trim/seri için basılı proof (≤5) | Fiziksel onay notu (`06_REPORTS/proof.md`) | **Founder** | 5–10 gün bekleme | Yeni trim/kâğıt/seri ilk kitabında atlanmış | `kill_gate.py` yeni trim için `proofOrdered: true` ister |
| **FINAL APPROVAL** | Kapı 7–10 kayıtları | `.gate = release` | **Founder** | 0.3 s | Herhangi bir kapı UNMEASURED | `selftest.py` — kapı alanları ölçülmüş mü |
| **PUBLISH** | Fiyat (§5), pazarlar (§3), Select kararı | Canlı ASIN | Founder | KDP incelemesi 24–72 s | ASIN çıkmadan kataloğa yazıldı | `valice-catalog.test.ts`: ASIN yalnızca `kdp:"live"` |
| **PRICE TEST** | Liste fiyatı, 30 günlük satış | Fiyat kararı | Founder (ajan hesaplar) | 30 gün | Hacim başabaş yüzdesinin altına düştü | `price-engine.mjs` başabaş tablosu |
| **ADS** | Lansman kampanyası ($5–10/gün) | 2 hafta / 100 tık verisi | Founder (ajan taslak) | 14 gün | 25–35 sıfır-siparişli tık | AMAZON_ADS_MASTER_PLAN_TR |
| **REVIEW** | 7/30/90 gün | Keep / update / reprice / archive kararı | Founder | — | 90 günde 0 satış ve 0 yorum | `title-pnl.mjs` |

### 4.1 Enigmatica reddinden çıkan kalıcı ön-kontrol (her yüklemeden önce) [O, CODEX-ENIGMATICA CHANGELOG 1.4.0]

| # | Kök neden (28 Ağu 2026 gerçek ret) | Kalıcı kontrol |
|---|---|---|
| 1 | Helvetica 274 sayfanın tamamında gömülü değildi | `pdffonts` çıktısında her font `emb=yes`; ReportLab'da yalnızca TTF gömme; sistem fontu yasak |
| 2 | `⚠` (U+26A0) serif fontta yoktu | Manuscript'teki her kod noktası için font kapsama testi; eksikse fallback font veya karakter değişimi |
| 3 | Kapak güvenli alanı trim'den (0.375") değil **dış kenardan (0.716")** ölçülmeliydi | Kapak QA'da güvenli alan dış kenar referanslı; KDP şablonuyla piksel karşılaştırması |
| 4 | Ölçme ve çizme kodu ayrıydı, kusur gizlendi | Tek geometri kaynağı (`coverspec`), çizim aynı nesneden okur |
| 5 | Hardcover kapağı paperback sayfa sayısını okudu (0.8058" vs 0.8103") | Format başına ölçülen sayfa sayısı; hc geometrisi calculator çıktısından, türetme yok |
| + | World Myths: yer tutucu yazar biyografisi KDP tarafından şablon metni sayıldı [O] | `[PLACEHOLDER]`, `pending`, `TBD` taraması; boş bio yayına giremez |
| + | World Myths: "[QR CODE — Phase 6]" yer tutucusu nedeniyle ret [O] | QR/URL basılacaksa **canlı ve doğrulanmış** adres; aksi halde vaat kaldırılır |

### 4.2 Aylık ritim (Lane A slate = 3 + Lane C 1–2)

| Hafta | Ajan işi | Founder işi (saat) |
|---|---|---|
| 1 | Slate için pazar/hak/outline (kapı 1–3) | Kapı 2 hak imzası (1.5) |
| 2 | Taslak + çapraz doğrulama (kapı 4–6) | Kapı 5 imzası (3) |
| 3 | Interior + kapak + metadata (kapı 7–9) | Kapak onayı, calculator (2) |
| 4 | Upload paketi + companion + katalog satırı | Previewer + upload + AI beyanı (3), proof siparişi |
| sürekli | Bakım scriptleri (`validate:catalog`) | Fiyat testi, reklam, 30/90 gün incelemesi (4 → büyür) |

---

## 5. Fiyatlandırma motoru

`scripts/strategy/price-engine.mjs` — doğrulanmış rate card üzerinde saf aritmetik. Talep modeli **yok**; "bu fiyat ne kazandırır" der, "kaç satar" demez.

### 5.1 Üç gerçek çağrı

**A — Lane A workbook, 160 s, 8.5×11, 14 saat üretim**

```
node scripts/strategy/price-engine.mjs --pages 160 --trim large --ink bw --format paperback --hours 14 --candidates 12.99,14.99,19.99
```
```
printing cost $3.72 · KDP minimum list $6.20 · önerilen $14.99 · minimum uygulanabilir $12.99
 $12.99 → net $4.07 (%31.4) · BE ACOS %31.4 · max CPC $0.33 · 14 saati 86 adet kurtarır
 $14.99 → net $5.27 (%35.2) · BE ACOS %35.2 · max CPC $0.42 · 67 adet  ✓
 $19.99 → net $8.27 (%41.4) · max CPC $0.66 · 43 adet  ✓
```
Yorum: $12.99 hedef marjı kaçırır; **Lane A varsayılan fiyatı $14.99** [R], $12.99 yalnızca Hangul gibi 124 sayfalık kısa kitaplarda.

**B — Large print, 280 s (Enigmatica LP)**

```
node scripts/strategy/price-engine.mjs --pages 280 --format large_print --hours 6 --candidates 24.99,26.98,29.99,31.03
```
```
printing $5.76 · min list $9.61 · önerilen $24.99
 $24.99 → $9.23 (%37) · $26.98 → $10.43 (%38.7) · $29.99 → $12.23 (%40.8) · $31.03 → $12.86 (%41.4)
```
Yorum: LP'de her $1 fiyat $0.60 nete gider; sayfa başına $0.06–0.11 aralığında fiyatlayın.

**C — Hardcover 124 s, 8.25×11 (Hangul)**

```
node scripts/strategy/price-engine.mjs --pages 124 --trim large --format hardcover --candidates 19.99,21.99,24.99
```
```
printing $7.76 · min list $12.94 · hiçbir aday %35'i geçmiyor
 $19.99 → $4.24 (%21.2) · $21.99 → $5.43 (%24.7) · $24.99 → $7.23 (%28.9)
```
Yorum: kısa workbook hc'si düşük marjlı → **TEST**; $24.99 denenmeye değer, $19.99 değmez.

### 5.2 E-kitap fiyat testi protokolü

| Adım | Kural |
|---|---|
| Başlangıç | $4.99 olan her başlık **$6.99**'a (Amazon'da %70 opt-in işaretli). Başabaş: eski hacmin **%69**'u |
| 30 gün | Hacim ≥ %69 korunduysa **$9.99** (başabaş: %47). Aksi halde $6.99'da kal |
| 30 gün daha | $9.99 tuttuysa $12.99 değerlendir (yalnızca 250+ sayfalık referanslar) |
| Direct = Kindle | Doğrudan fiyat Kindle liste fiyatına **eşit** (fiyat eşleştirme riski); farklılaştırıcı format/companion, fiyat değil |
| Paddle | Fiyat yerinde düzenlenmez; yeni `pri_…` oluştur, `valice-catalog.mjs`'e yaz, `load-catalog.mjs --commit`, eskisini arşivle |

### 5.3 Large print fiyatı sayfa başına

LP liste ≈ **max(paperback × 1.35, sayfa × $0.055)**; 599 sayfa → $32.95 → **$34.99**; 578 sayfa → $31.79 → **$31.99**; 280 sayfa → $15.40 → merdiven kuralı $26.98 ağır basar.

---

## 6. Faz kapısı (Phase 32 formatı)

| Alan | Değer |
|---|---|
| **Amaç** | Her başlığın format setini ekonomiyle seçmek; KDP yüklemesinin ilk seferde geçmesi |
| **Girdiler** | Onaylı manuscript, `project_config.json`, ölçülen sayfa sayısı, rate card, `price-engine.mjs` |
| **Çıktılar** | Interior/cover PDF'leri (SHA256), metadata JSON, format kararı tablosu, canlı ASIN, fiyat kaydı |
| **Bağımlılıklar** | Kapı 1–6 (içerik), kapak fabrikası (Faz 8), companion adresi canlı (Faz 10), AI beyanı |
| **Ajanlar** | INTERIOR ajanı (ReportLab), COVER ajanı (spec + QA), METADATA ajanı, KDP-QA ajanı (önkontrol listesi §4.1) |
| **İnsan kontrol noktaları** | Calculator, Previewer, proof, AI beyanı, fiyat, yayın (5 nokta) |
| **Süre** | Lane A: 5 iş günü ajan + 4 saat founder + KDP 24–72 s + proof 5–10 gün (yeni trimde) |
| **Başarı ölçütü** | İlk yüklemede ret yok; her format `price-engine` hedef marjını (%35 baskı) sağlıyor; ASIN 7 gün içinde canlı |
| **Başarısızlık ölçütü** | KDP reddi; marj < %25; kapı UNMEASURED iken yayın |
| **KPI** | Yükleme başına ret sayısı (hedef 0), format başına net/adet, LP payı, ilk 30 gün satış |
| **Sonraki faz** | Faz 13 (Ads) yalnızca canlı ASIN + fiyat kararı sonrası; Faz 9 katalog satırı ASIN ile |

---

## 7. Founder'ın yapması gerekenler (bu belgeye özgü)

| # | Aksiyon | Nerede | Süre | Neden founder |
|---|---|---|---|---|
| 1 | **AI beyanı** — her yeni ve yeniden yüklemede; projelerde `founderConfirmed: true` olarak kaydet | KDP yükleme akışı + `project_config.json` | 2 dk/başlık | Hukuki beyan; ajan yapamaz [V] |
| 2 | **Codex Bestiarium ilanı: "120" → "112 Legendary Creatures"** (4 kayıt) | KDP Bookshelf → Edit details | 10 dk | Yanlış iddia canlıda |
| 3 | **Codex Mythologica KDP Select auto-renew KAPAT** | KDP Bookshelf → KDP Select | 2 dk | Dönem sonunda direct satış açılır |
| 4 | **Fiyat düzenlemeleri:** Mythologica Kindle $4.99 → $6.99 (%70 işaretli), Bestiarium LP $29.99 → $34.99 | KDP Bookshelf → Pricing | 10 dk | Ticari karar |
| 5 | **World Games Large Print** üretimini onayla (ay 1) | Proje repo `.gate` + KDP yeni başlık | 6 saat üretim (ajan) + upload | $12.86/adet — kataloğun en iyi baskı birimi |
| 6 | **Proof siparişi** — LP ve her yeni trimin ilk kitabı | KDP → Order proof | 5–10 gün | Fiziksel onay devredilemez |
| 7 | **Author Central** yazar biyografisi (gerçek, doğrulanabilir) ve seri sayfaları (Codex, The Great Book of…) | author.amazon.com | 30 dk | Bio yer tutucusu zaten bir ret üretti [O] |
| 8 | **Hangul A7 kararı:** S-0017/18 (CC BY-SA) ve S-0019 (CC BY-NC) kaynaklarını temizle/değiştir **veya** KDP gönderimlerini geri çek | Proje + KDP | Hukuki | Kitap incelemede; geçerse satışa çıkar |
| 9 | Enigmatica Kindle dosyasını ≤3 MB'a düşürme işini onayla (teslimat ücreti $6.9 → $0.45) | Proje | 4 saat (ajan) | Telifi doğrudan etkiler |

---

## 8. Bu belgede DOĞRULANMAYANLAR

- Amazon.com dışı pazarların baskı maliyeti katsayıları.
- Kategori sayısı (3?) ve "large print" kutucuğunun 2026 yükleme ekranındaki adı.
- Hız sınırının güncel değeri (önceki araştırmada ~10/format/hafta; KDP bunu resmi bir sayfada yayımlamıyor).
- Fiyat testlerinin sonucu — talep esnekliği bilinmiyor; katalogda 1 sipariş, 0 yorum var. Bu belgedeki her "önerilen fiyat" **marj** hesabıdır, satış tahmini değildir.
