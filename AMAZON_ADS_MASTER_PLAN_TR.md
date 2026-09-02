# Amazon Ads — Ana Plan (Valice Press)

**Tarih:** 2 Eylül 2026 · **Kapsam:** Faz 13 (Amazon görünürlüğü + reklam), 13A (ürün seçimi), 13B (reklam ekonomisi), 13C (lansman sistemi), Faz 14'ün reklamla kesişen kısmı, Faz 16'nın Amazon ölçüm kısmı.
**Bağlı belgeler:** `VALICE_PRESS_MASTER_ROADMAP_TR.md` (omurga) · `CATALOG_ECONOMICS_FINAL.md` (birim ekonomi) · `scripts/strategy/price-engine.mjs` (başabaş ACOS / CPC tavanı) · `AMAZON_TO_VALICE_CUSTOMER_BRIDGE_TR.md` (köprü).

Kanıt etiketleri: **[V]** birincil kaynaktan doğrulandı (advertising.amazon.com, kdp.amazon.com; 1–2 Eylül 2026) · **[O]** canlı sistemde gözlendi · **[S]** ikincil / kendi beyanı (Ad Badger, Kindlepreneur, Reedsy, Vappingo; 2026) · **[A]** varsayım · **[R]** öneri. Araştırmanın doğrulayamadığı her madde **DOĞRULANMADI** diye işaretlidir.

---

## 0. Tek sayfada karar

1. **Reklam, Valice'de kalıcı bir edinim kanalı değil, bir lansman-sıralama aracıdır.** Baskı kitaplarda başabaş ACOS %31–44; Kindle'da %61–67. Bu bantlarda her tıklama marj yer; reklam ancak (a) sıralama kazanmak, (b) ilk yorumları toplamak, (c) bir başlığın dönüşüm oranını ölçmek için kullanılır. [R]
2. **Bugün ALWAYS-ON statüsünü hak eden hiçbir başlık yok.** Katalogda 0 yorum ve 1 sipariş var [O]. Yorumsuz bir ilanı reklamlamak, tıklamayı satın alıp dönüşümü satın alamamaktır. İlk 60 gün yalnızca **LAUNCH/TEST** kampanyaları çalışır.
3. **İlk reklam doları Codex Bestiarium ciltli + The Great Book of World Games ciltli'ye gider.** Kataloğun en yüksek birim katkılı (11,92 $ ve 12,62 $) ve en geniş başabaş ACOS'lu baskı ürünleri bunlar. Founder'ın kendi Ağustos 2026 analizi de Bestiarium'u 7,64 puanla birinci sıraya koymuştu. [O]
4. **$4,99'luk Kindle baskıları fiyat düzeltilmeden asla reklamlanmaz.** Birim net 3,04 $ → %8 dönüşümde CPC tavanı 0,24 $; gözlenen kitap CPC tabanı 0,35–0,55 $ [S]. Matematik kapalı.
5. **Toplam bütçe tavanı: Ay 1–2 için 150 $/ay, veri geldikçe 300 $/ay, Q4'te en fazla 600 $/ay.** Reklam bütçesi katkının %15'ini aşmaz (`revenue-targets.mjs` varsayımı). [R]
6. **Amazon'dan siteye trafik beklenmez.** Köprü ters yönde çalışır: Amazon alıcısı → basılı kitaptaki companion adresi → valicepress.com. Reklam yalnızca Amazon içi bir kaldıraçtır. [R]

---

## 1. Amazon Ads ürünleri ve KDP uygunluğu (2026)

### 1.1 Ne var, ne yok

| Ürün | KDP yayıncısı için durum | Kanıt |
|---|---|---|
| **Sponsored Products (SP)** | Herkese açık; başlık sayısı şartı yok. Yerleşim: Amazon arama sonuçları, ürün sayfaları, Kindle, **Goodreads**. | [V] |
| **Sponsored Brands (SB)** — Collections + Video | Author Central'da **aynı yazar adı altında 3+ uygun başlık** şart. **Brand Registry gerekmiyor.** Collections 3–10 kitap; custom image; video. Pazar: US/UK/DE/FR/IT/ES. | [V] |
| **Lockscreen ads** (Kindle e-okuyucu / Fire) | Tarihsel olarak yalnızca e-kitap, tür/ilgi hedeflemeli. 24 Nis 2026'da yerleşim **Amazon DSP**'ye açıldı (yalnızca US). Yazar konsolunda hâlâ görünüp görünmediği **DOĞRULANMADI**. "KDP Select şart" iddiası da **DOĞRULANMADI** (Amazon'un kendi PDF'i bunu söylemiyor). | [V] / DOĞRULANMADI |
| **Sponsored Display (SD)** | Amazon Ads SSS "KDP authors (Sponsored Products only)" diyor; kitap-*vendor* rehberi Display'i listeliyor. **Düz KDP hesabı için muhtemelen yok** — DOĞRULANMADI. | [V] çelişkili |
| Video ads | Yalnızca SB içinde. | [V] |
| DSP / Managed display / Audio | Teknik olarak açık; ~50.000 $ / ~25.000 $ minimumlar. Valice için kapsam dışı. | [V] |

### 1.2 Pazar yerleri

KDP başlıkları için reklam verilebilen 12 pazar: **US, CA, MX, UK, DE, IT, ES, FR, NL, IN, AU, JP** [V, KDP help G201499010]. Sesli kitap reklamı yalnızca US.

**[R] Sıra:** yalnızca **US** ile başla (kataloğun tamamı İngilizce, tüm ASIN'ler .com'da). **UK** ikinci (İngilizce, ayrı ilan/fiyat gerekmez ama ayrı kampanya gerekir). DE/FR/IT/ES ancak bir başlık US'de kârlı reklam kanıtı verdikten sonra; ve çeviri olmadan yalnızca İngilizce okuyan azınlığa satar.

### 1.3 Hesap kurulumu — Founder adımları

Bunlar hesap gerektirir; ajan yapamaz.

| # | Adım | Nerede | Süre | Not |
|---|---|---|---|---|
| A1 | Amazon Ads hesabını **KDP oturumuyla** aç | advertising.amazon.com → "Register" → "Books / KDP author" | 10 dk | KDP ile aynı e-posta. Ayrı seller hesabı açma. |
| A2 | Ödeme yöntemi ekle; ülke/vergi bilgisi | Ads console → Billing | 10 dk | Reklam faturası KDP telifinden **düşülmez**, karta kesilir. |
| A3 | **Author Central** hesabı aç, 18 ASIN'i yazar adına claim et | author.amazon.com | 30 dk | SB için 3+ başlık şartının ön koşulu; ayrıca yazar sayfası + bio. Bio hâlâ yok (`AUTHORS.bio = null`) [O] — önce yazılmalı. |
| A4 | **Amazon Attribution**'a kaydol | Ads console → Measurement & Reporting → Amazon Attribution | 15 dk | KDP yazarları için ücretsiz; US/CA/DE/ES/FR/IT/UK [V]. Valice → Amazon linklerini ölçmenin tek yolu. |
| A5 | "Vâliçe Press / Valice Press" yazar adı kararını ver | — | karar | Author Central'daki ad ile ilan adı birebir aynı olmalı; SB'nin 3+ başlık sayımı bu ada bağlı. |
| A6 | Reklama başlamadan önce ilan hatalarını düzelt | KDP Bookshelf | 20 dk | Bestiarium "120" → **112** yaratık; $4,99 Kindle'lar → $6,99. Hatalı bir ilana tıklama satın alınmaz. |

Ad moderasyonu: genelde 24 saat, en çok 3 iş günü [V]. Reklam metninde **fiyat bilgisi ve müşteri yorumu yasak**; kapak PG-13 [V].

---

## 2. Reklam ürün seçimi (Faz 13A)

### 2.1 Karar kriterleri

Bir başlık-format ancak beşini birden sağlarsa ALWAYS-ON'a çıkar:

| Kriter | Eşik | Neden |
|---|---|---|
| Birim katkı | ≥ 7,50 $ | Altında CPC tavanı gözlenen CPC bandının altına düşer |
| Başabaş ACOS | ≥ %30 | Altında lansman bile marj yer |
| Yorum profili | ≥ 5 yorum, ≥ 4,3★ | Yorumsuz ilanın dönüşümü ölçülemez |
| Ölçülmüş dönüşüm | ≥ 60 gün, ≥ 100 tıklama, ACOS ≤ 0,7 × başabaş | Tahmin değil ölçüm |
| Seri/köprü rolü | Companion'u canlı veya serinin girişi | Reklam LTV'yi büyütmeli, sadece o kitabı değil |

### 2.2 Mevcut katalog — format bazında sınıflandırma

Başabaş ACOS = net ÷ liste (`CATALOG_ECONOMICS_FINAL.csv`, 1 Eylül 2026). CPC tavanı = net × CVR. İki CVR gösteriliyor: %8 (temkinli, founder'ın Ağustos analizi) ve %18 (Ad Badger 2026 kitap ortalaması [S]).

| Başlık · format | Liste | Net | Başabaş ACOS | CPC tavanı @8% / @18% | **Sınıf** | Gerekçe |
|---|---:|---:|---:|---:|---|---|
| **Codex Bestiarium · hardcover** | 37,99 | 11,92 | **%31,4** | 0,95 / 2,15 | **LAUNCH → ALWAYS-ON adayı** | En yüksek birim katkı; 4 formatlı tam merdiven; founder skoru 7,64 [O]. İlan hatası (120→112) önce düzeltilir. |
| Codex Bestiarium · paperback | 24,99 | 8,77 | %35,1 | 0,70 / 1,58 | **LAUNCH** | Aynı kampanyada hc ile birlikte; hangisinin döndüğünü 30 günde gör. |
| Codex Bestiarium · Kindle ($12,99) | 12,99 | 8,64 | %66,5 | 0,69 / 1,56 | TEST (ay 3+) | 70% bandında; ama e-kitap Valice'de de satılıyor — Amazon'a reklamla itmek direct marjı yer. Yalnızca sıralama için düşük bütçe. |
| Codex Bestiarium · large print | 29,99 | 6,81 | %22,7 | 0,54 / 1,23 | **DO NOT ADVERTISE** | 599 sayfa marjı yemiş; önce $34,99'a yeniden fiyatla. |
| **The Great Book of World Games · hardcover** | 34,99 | 12,62 | **%36,1** | 1,01 / 2,27 | **LAUNCH → ALWAYS-ON adayı** | Kataloğun en geniş CPC alanı; founder'ın Ağustos raporu "tek büyüyen yetişkin kurgu-dışı cebi" dedi [O]. |
| World Games · paperback | 22,99 | 10,07 | **%43,8** | 0,81 / 1,81 | **LAUNCH** | En yüksek başabaş ACOS'lu baskı formatı. |
| World Games · Kindle ($11,99) | 11,99 | 7,94 | %66,2 | 0,64 / 1,43 | TEST (ay 3+) | Bestiarium Kindle ile aynı mantık. |
| Codex Mythologica · hardcover | 32,99 | 10,20 | %30,9 | 0,82 / 1,84 | **TEST (ay 2)** | Founder skoru 6,65 (ikinci) [O]. Select'te olan Kindle'ı değil, ciltliyi reklamla. |
| Codex Mythologica · paperback | 21,99 | 8,25 | %37,5 | 0,66 / 1,49 | TEST (ay 2) | |
| Codex Mythologica · Kindle ($4,99) | 4,99 | 3,04 | %61,0 | 0,24 / 0,55 | **DO NOT ADVERTISE** | $6,99'a çıkana kadar CPC tavanı gözlenen banda giremiyor. |
| Codex Mythologica · large print | 27,99 | 5,97 | %21,3 | 0,48 / 1,07 | DO NOT ADVERTISE | Founder'ın Ağustos raporu LP'yi "gizli varlık" saydı; ama gerçek sayfa sayısıyla marj %21. Reklamsız organik. |
| Codex Enigmatica · hardcover | 29,99 | 9,06 | %30,2 | 0,72 / 1,63 | TEST (ay 2) | Bulmaca nişi CPC'si düşük (0,20–0,50 $ [S, zayıf kaynak]); köprü sayfası canlı → reklam LTV'ye bağlanıyor. |
| Codex Enigmatica · paperback | 19,99 | 7,71 | %38,5 | 0,62 / 1,39 | TEST (ay 2) | |
| Codex Enigmatica · Kindle ($9,99) | 9,99 | 6,54 | %65,5 | 0,52 / 1,18 | TEST (ay 3+) | |
| The Great Book of World Myths · pb/hc | 14,99 / 26,99 | 5,19 / 7,74 | %34,6 / %28,7 | 0,42 / 0,62 | **HENÜZ DEĞİL** | Founder skoru 5,72: en dar marj, markalı tam renkli rakip rafı [O]. Kanal: okul/kütüphane + organik hediye. $4,99 Kindle: asla. |
| The Myth Hunter's Field Book · pb | 14,99 | 5,34 | %35,6 | 0,43 / 0,96 | TEST (ay 4+, yalnızca Q4) | Çocuk aktivite rafı; hediye sezonunda (Ekim–Kasım) tek test. Sıfır çocuk testi riski önce kapatılmalı. |
| Korean Hangul Workbook · pb / hc | 12,99 / 21,99 | 4,69 / 5,44 | %36,1 / %24,7 | 0,38 / 0,44 | pb: TEST (yayına çıkınca) · hc: DO NOT | Hakların çözümü ön koşul. Hc marjı ince. |
| Meditations | direct | — | — | — | **ASLA** | Amazon'da yok; direct-only PD. Amazon'a taşınsa bile %35 tavanı ($3,50) reklamı imkânsız kılar. |

**Özet:** Ay 1'de reklam gören yalnızca **4 ürün**: Bestiarium hc+pb, World Games hc+pb. Ay 2'de +4: Mythologica hc+pb, Enigmatica hc+pb. Diğerleri koşula bağlı.

### 2.3 İlk 20 kitap için ön sınıflandırma

Omurgadaki ilk 20 (bkz. `VALICE_PRESS_MASTER_ROADMAP_TR.md` §Faz 26). Ön sınıf; gerçek net/liste yayında hesaplanır.

| # | Kitap | Şerit | Ön sınıf | Neden |
|---|---|---|---|---|
| 01 | Hangul Workbook | A | TEST (pb) | 36% başabaş; hc yok |
| 02 | Greek Alphabet Workbook | A | LAUNCH (pb) | Mitoloji kataloğuyla çapraz; ASIN targeting hedefi hazır (kendi Codex'lerimiz) |
| 03 | Dudeney (Annotated) | C | **DO NOT** (Amazon'da PD %35) | Direct-first; Amazon yalnızca keşif |
| 04 | Codex Puzzle Book | A/B | LAUNCH (pb+hc) | Enigmatica alıcısını hedefle (ASIN targeting) |
| 05 | Epictetus (Annotated) | C | DO NOT | PD %35 |
| 06 | Kwaidan (Annotated) | C | DO NOT | PD %35 |
| 07 | Hangul 2 | A | LAUNCH (pb) | Seri; kitap 1 alıcısına ASIN targeting |
| 08 | Field Book Vol. 2 | A | TEST (Q4) | Çocuk rafı |
| 09 | Falkener (Annotated) | C | DO NOT (Amazon) | PD |
| 10 | Cyrillic Workbook | A | LAUNCH (pb) | |
| 11 | Great Book of Norse Myths | A/B | TEST (hc) | Markalı çocuk mit rafı, World Myths dersi |
| 12 | Before You Cut 1 | B | LAUNCH (pb, $26,99 → net ~11 $) | En yüksek birim katkılı Lane B; "The Fitting Book" ASIN targeting |
| 13 | Werner China (Annotated) | C | DO NOT (Amazon) | PD |
| 14 | Seneca (Annotated) | C | DO NOT | PD |
| 15 | Kana Workbook | A | LAUNCH (pb) | En kalabalık script rafı; companion ses farkı |
| 16 | Codex Heroica | B | LAUNCH → ALWAYS-ON adayı (hc) | Codex serisinin 4. cildi; seri sayfası + ASIN targeting |
| 17 | World Games Vol. 2 | A | LAUNCH (hc+pb) | Vol. 1 alıcısı |
| 18 | Meditations Annotated | C | DO NOT | direct |
| 19 | Loyd (Annotated) | C | DO NOT | PD |
| 20 | Codex Enigmatica II | A/B | LAUNCH (hc+pb) | Verify köprüsü + Cilt I alıcısı |

**Kural [R]:** Lane C (PD) başlıkları Amazon'da hiç reklamlanmaz. %35 tavanı $9,99'da 3,50 $ net → CPC tavanı 0,28 $. Amazon'daki PD ilanı yalnızca keşif ve "Valice'de daha iyi baskısı var" arka kapak notu içindir.

---

## 3. Reklam ekonomisi (Faz 13B)

### 3.1 Formüller

```
Başabaş ACOS   = net telif ÷ liste fiyatı                     [V, Vappingo/Kindlepreneur formülü]
CPC tavanı     = net telif × dönüşüm oranı (CVR)               [S]
Hedef ACOS     = lansmanda ≤ başabaş; sürdürmede ≤ 0,7 × başabaş; ölçeklemede ≤ 0,5 × başabaş   [R]
TACOS          = reklam harcaması ÷ TOPLAM satış (Amazon'un tanımı)   [V]
```

**Uyarı:** Uygulayıcıların "hedef ACOS = başabaşın %30–40'ı" kuralı [S] **e-kitap** için yazılmıştır (başabaş ~%70 → hedef %21–28). Baskıda başabaş %31–44 iken %30–40'ı = %10–17 olur; bu, 2026 kitap ortalaması %19 ACOS'un [S] altındadır ve pratikte ulaşılmaz. Bu yüzden Valice kuralı yukarıdaki üç kademedir.

`node scripts/strategy/price-engine.mjs --pages 435 --format hardcover --hours 3` bu tabloyu her başlık için üretir.

### 3.2 Başabaş ve tavan tablosu (özet)

| Format | Liste | Net | Başabaş ACOS | Hedef (sürdür) | CPC tavanı @8% | @18% |
|---|---:|---:|---:|---:|---:|---:|
| Bestiarium hc | 37,99 | 11,92 | 31,4% | 22% | 0,95 | 2,15 |
| World Games hc | 34,99 | 12,62 | 36,1% | 25% | 1,01 | 2,27 |
| World Games pb | 22,99 | 10,07 | 43,8% | 31% | 0,81 | 1,81 |
| Mythologica hc | 32,99 | 10,20 | 30,9% | 22% | 0,82 | 1,84 |
| Enigmatica pb | 19,99 | 7,71 | 38,5% | 27% | 0,62 | 1,39 |
| Lane A workbook pb ($12,99, 124p) | 12,99 | 4,69 | 36,1% | 25% | 0,38 | 0,84 |
| Kindle orijinal $9,99 | 9,99 | 6,54 | 65,5% | 46% | 0,52 | 1,18 |
| Kindle $4,99 | 4,99 | 3,04 | 61,0% | 43% | **0,24** | 0,55 |
| PD Kindle $9,99 (35%) | 9,99 | 3,50 | 35,0% | 24% | **0,28** | 0,63 |

**Okuma:** Gözlenen kitap CPC'si 0,38 $ ortalama [S, Ad Badger 2026], aralık 0,15–0,75 $ [S], puzzle 0,20–0,50 $ [S]. Ciltli Codex/World Games sınıfı %8 dönüşümde bile bandın üstünde yer bırakıyor; $12,99 workbook %8'de tam bandın içinde (0,38), yani hata payı yok — ancak %18 dönüşümde rahat. **Dönüşüm oranı Valice'in ölçmesi gereken tek sayıdır**; ilk 100 tıklama bunun için harcanır.

### 3.3 Benchmark'lar — hepsi ikincil, hepsi şüpheyle

| Metrik | Değer | Kaynak |
|---|---|---|
| Kitap CTR | %0,22 | Ad Badger, Oca–Ağu 2026, kendi uygulama verisi, örneklem açıklanmamış [S] |
| Kitap CPC | 0,38 $ (diğer kaynaklar 0,35–0,55; 0,85–1,00; 0,15–0,75) — **3× yayılım** | [S] |
| Kitap CVR | %18,0 | [S] |
| Kitap ACOS ort. | %19 | [S] |
| Satış başına tıklama | 5,6 | [S] |
| Tüm kategoriler CPC | 1,18–1,21 $; 2023→2026 +%35 | [S] |
| Alt kategori CPC (mitoloji, dil, çocuk) | **DOĞRULANMADI** — hiçbir kaynak bu ayrıntıda yayınlamıyor | — |
| Founder senaryoları (Ağu 2026) | temkinli CPC 0,65 / CVR %5 / satış maliyeti 13 $; taban 0,45; iyimser 0,35 / %13 / 2,69 $ | [O] |
| Dinamik bid motoru Nis–May 2026 | rekabetçi kategorilerde CPC +%18–27 → ilk testte **fixed bids** | [O, founder raporu] |
| Q4 | CPC +%20–30 (bazı kaynaklar +40–70), gösterim +%125'e kadar | [O, founder raporu; S] |

### 3.4 Bütçe

Amazon'un tavsiyesi 10 $/gün/kampanya [V]; minimum 1 $/gün [V]; günlük bütçe **aylık ortalamalanır, herhangi bir günde %25 aşılabilir** [V]. Reedsy: küçük bütçelerde Amazon "under-delivers" [S] — 2 $/gün'lük kampanya hiç harcamayabilir.

| Faz | Süre | Kampanya | Günlük | Aylık tavan | Koşul |
|---|---|---|---|---|---|
| **Test** | Ay 1–2 | 2 başlık × (Auto + Exact) = 4 kampanya | 5 $ (auto), 3 $ (exact)... toplam ~5 $/gün | **150 $** | İlan hataları düzeltilmiş; A+ yüklü |
| **Lansman/ölçek** | Ay 3–6 | +Mythologica, +Enigmatica; kazanan kampanyalar 10 $/gün | ~10 $/gün | **300 $** | En az bir kampanya ACOS ≤ başabaş |
| **Q4 pozisyon** | Ekim | Kazananlar 10–15 $/gün | | 450 $ | Founder onayı |
| **Q4 ölçek** | Kasım–Aralık | Kazananlar 20 $/gün, marka savunma 20–30 $/gün | | **600 $** | ACOS ≤ 0,7 × başabaş 30 gün |
| **Yeni başlık lansmanı** | ilk 30 gün | Auto 10 $ + Exact 5 $ + ASIN 5 $ | 20 $/gün | başlık başına 600 $ | Lane A/B yalnızca; PD hariç |

Reklam bütçesi ≤ katkının %15'i. Aylık toplam katkı 1.000 $'ın altındayken tavan 150 $'da kalır.

### 3.5 Deney tasarımı — ilk 30 gün

1. **Bir değişken:** hardcover vs paperback aynı başlıkta, aynı hedeflerde, aynı bid. Hangisi dönüyor?
2. **Fixed bids** (dinamik değil) — founder raporunun Nis–May 2026 bulgusu [O].
3. Auto kampanya: 4 eşleşme grubu ayrı bidli: close 0,45 / loose 0,40 / substitutes 0,40 / complements 0,35 $ (Kindlepreneur 0,54–0,58'in [S] altı; CPC tavanı düşünülerek).
4. **Off-Amazon spend limiti AÇIK** — 10 Ağu 2026'dan beri SP kampanyaları "creator" yerleşimlerine otomatik giriyor [O, founder raporu]. Discovery kampanyası "Limit off-Amazon spend" ile açılır.
5. Yargı anı: **2 hafta VEYA 100 tıklama**, hangisi önce. 10 tıklamayla hiçbir şey bilinmez.
6. Başarısızlık tanımı: her iki formatta ACOS > %62 (founder raporu eşiği) → kampanya durdurulur, ilan/fiyat/kapak gözden geçirilir.

### 3.6 Kill / scale kuralları

| Sinyal | Aksiyon | Kaynak |
|---|---|---|
| Anahtar kelime/ASIN: 25–35 tıklama, 0 sipariş | **Durdur** (negatif exact'e ekle) | Reedsy Mar 2026 [S]; %10 CVR altında 25 tıklamada 0 sipariş ~%7 olasılık |
| Anahtar kelime CPC ortalamanın %40 üstü | Durdur | [S] |
| 1 satış ama ACOS > %60 | Bid −%25 | founder raporu [O] |
| 3+ satış ve ACOS < %25 | Bid +%15 | founder raporu [O] |
| Kampanya 30 gün ACOS > başabaş | Kampanyayı kapat; başlığı ALWAYS-ON'dan düşür | [R] |
| Kampanya 60 gün ACOS ≤ 0,7 × başabaş ve ≥ 5 yorum | ALWAYS-ON'a terfi; bütçe ×1,5 | [R] |
| Search term raporunda 2+ sipariş getiren terim | Exact kampanyaya taşı, auto'da negatifle | standart döngü [S] |

### 3.7 Q4 stratejisi

- **Ekim:** kazanan kampanyaları 10–15 $/gün'e çıkar, bidleri sabit tut, negatifleri temizle. Reklam sıralaması Ekim'de kazanılır [O, founder raporu].
- **Kasım (1–25):** bütçe 20 $/gün; Field Book ve Norse Myths gibi çocuk/hediye başlıkları yalnızca bu pencerede test edilir.
- **Aralık 15 sonrası:** POD teslimat süresi hediye tarihini kaçırır → 15 Aralık'ta bütçeleri Ekim seviyesine indir.
- CPC +%30 varsayımıyla: World Myths pb (net 5,19 $) sıfırın altına düşer [O]; Bestiarium hc hâlâ pozitif. Q4'te yalnızca net ≥ 9 $ formatlar reklam görür.

### 3.8 Rapor arşivi — kalıcı veri kaybını önlemek

Amazon Ads raporları **SP v3'te 95 gün, SB/SD'de 60 gün** geriye gider [S, Intentwise]. Arşivlenmeyen veri kalıcı olarak kaybolur.

- Her ayın 3'ünde: Ads console → Reports → Sponsored Products **Campaign**, **Search term**, **Targeting**, **Placement** raporları (önceki ay, günlük) → CSV → `data/ads/sp-YYYY-MM-<report>.csv`.
- Aynı gün KDP Reports → **Prior Months' Royalties** (kesinleşmiş belge [V]) → `data/metrics/kdp-YYYY-MM.csv`.
- Kesinleşmiş veri sadece bu rapordadır; dashboard "estimated" [V]. Muhasebe dashboard'a bağlanmaz.

---

## 4. Kampanya şablonları

### 4.1 Portföy yapısı

Her başlık = bir **Portfolio** (portföy bütçe tavanı + tarih aralığı; dolduğunda kampanyalar otomatik durur [S]). Portföy adı: `VP · <slug> · <format>`.

| Kampanya | Amaç | Hedefleme | Bid stratejisi | Başlangıç bid | Günlük |
|---|---|---|---|---|---|
| `01 Discovery Auto` | Arama terimi keşfi | Auto (4 grup ayrı bid) | Fixed | close 0,45 · loose 0,40 · subs 0,40 · comp 0,35 $ | 5 $ |
| `02 Exact Keyword` | Kanıtlanmış terimler | Manual keyword, **exact** | Fixed | terim başına 0,30–0,50 $ | 3–5 $ |
| `03 ASIN Targeting` | Rakip/komşu ürün sayfaları | Product targeting, tekil ASIN | Fixed | 0,35–0,45 $ | 3–5 $ |
| `04 Category` | Raf kapsaması | Category + refinement: fiyat ≥ liste ×0,8, ★ ≥ 4, Prime | Fixed | **0,32 $** (Amazon'un önerdiği 0,80 $+'ı reddet [S]) | 3 $ |
| `05 Brand Defense` | Kendi adımızı savun | Exact: "valice press", "codex bestiarium", seri adları | Fixed | 0,88–1,00 $ [S] | 2 $ (ay 6+, marka aramaları görünmeye başlayınca) |

Kampanya adlandırma: `VP · codex-bestiarium · hc · 01-auto · US`.

### 4.2 Negatif listeler (tüm kampanyalara)

- **Negative exact:** `free`, `pdf`, `download`, `kindle unlimited`, `summary`, `cliff notes`, `study guide` (kendi ürünümüz değilse), rakip marka adları (`dover`, `dk`, `usborne`), `coloring`.
- **Negative phrase:** `for toddlers`, `kids under 5` (Codex sınıfında), `answer key` (Enigmatica'da — kitap cevabı basmaz).
- Auto'da kazanan terimler exact'e taşındıkça auto'da negatiflenir (çift ödeme yok).

### 4.3 Hedefleme kaynakları (ücretsiz)

1. **Amazon autocomplete**: Books/Kindle Store departmanında kök terim + a–z ekleri. Örn. `mythology encyclopedia`, `bestiary book`, `world games book`, `korean handwriting workbook`.
2. **"Customers also bought" / "Products related"**: rakip ürün sayfalarından ASIN listesi → `03 ASIN Targeting`. Amazon'un kendi rehberi ürün hedeflemenin bu davranış verisinden geldiğini söylüyor [V].
3. **Kategori BSR örneklemesi**: hedef kategoride ilk 20'nin BSR'ını 3 farklı gün aynı saatte kaydet (`data/market/bsr-<kategori>-<tarih>.csv`). Raf girilebilir mi, sorusunu yanıtlar.
4. **Search Term Report**: gerçek dönüşen sorgular. Tek gerçek veri.
5. Ücretli araçlar [S, 2026]: Publisher Rocket 199–299 $ tek seferlik (kitap odaklı; ilk üç niş doğrulaması için **tek makul satın alma** [R]); KDSPY 79–197 $; Helium 10 / Jungle Scout / DataDive abonelik, retail için — gereksiz. **Brand Analytics / Search Query Performance KDP hesabına açık değil** [S, kuvvetli çıkarım].

### 4.4 Başlık bazlı ilk hedefler (Ay 1)

| Başlık | Exact keyword tohumları | ASIN hedef tohumları |
|---|---|---|
| Codex Bestiarium hc/pb | `bestiary book`, `mythical creatures encyclopedia`, `monsters of folklore book`, `world mythology creatures reference` | Rakip bestiary/creature ansiklopedileri (illüstrasyonlu, ★≥4,3, 4.000+ yorum sınıfı); kendi Codex Mythologica ASIN'leri (çapraz) |
| World Games hc/pb | `traditional board games book`, `ancient games rules book`, `board games history book`, `mancala rules` | Parlett/Bell sınıfı oyun tarihi kitapları; "family board game book" rafı |
| (Ay 2) Mythologica hc/pb | `world mythology book`, `myths from around the world adults`, `comparative mythology` | Bulfinch, Hamilton, "Norse Mythology" sınıfı |
| (Ay 2) Enigmatica hc/pb | `puzzle book adults hard`, `cain's jawbone`, `journal 29`, `escape room puzzle book` | Cain's Jawbone, Journal 29, "The Master Theorem" ASIN'leri |

Kural: rakip **marka** adı anahtar kelime olarak kullanılabilir (hedefleme), ama **ilan metadata'sına yazılamaz** [V, keyword kuralları].

---

## 5. Lansman sistemi (Faz 13C)

### 5.1 Sıra

```
PRE-LAUNCH → RELEASE → ADS TEST → PRICE TEST → REVIEW BUILD → CONVERSION → SCALE / CUT
```

| Adım | Ne | Kurallar | Süre |
|---|---|---|---|
| **PRE-LAUNCH** | Kindle **pre-order** (yalnızca e-kitap; ≤ 1 yıl önce; ≤ 10 eşzamanlı; dosya yayından **72 saat** önce; kaçırırsan 1 yıl pre-order yasağı) [V]. Paperback pre-order **yok** → "Schedule a Release Date" [V]. Pre-order'lar sıralamaya **geldikçe** sayılır [V]; ikinci bir yayın günü etkisi DOĞRULANMADI. | Companion sayfası canlı; A+ modülleri hazır; Author Central ilanı; e-posta listesine "çıkıyor" duyurusu (Resend Broadcast). | Yayından 14–30 gün önce |
| **RELEASE** | Tüm formatlar aynı hafta; ciltli önce görünür (fiyat çıpası). | KDP AI beyanı yapıldı; PD etiketi başlıkta. | Gün 0 |
| **ADS TEST** | Portföy açılır (auto + exact + ASIN). Fixed bids. Off-Amazon limit açık. | 2 hafta / 100 tıklama kuralı. | Gün 0–14 |
| **PRICE TEST** | Yalnızca tek değişken: e-kitap $6,99→$9,99 veya pb ±2 $. 30 gün. | Direct fiyat = Kindle fiyatı (eşitlik kuralı, `EBOOK_STORE_FINAL`). Paddle'da yeni `pri_` gerekir. | Gün 15–45 |
| **REVIEW BUILD** | ARC listesi (Resend segmenti "arc"): ücretsiz kopya + "dürüst yorum memnuniyetle" — **koşul yok**. | **Yasak:** yorum takası (Amazon'un kendi örneği) [V*]; aile/arkadaş/yazar grubu yorumları; kopya dışında herhangi bir bedel. **Vine düz KDP hesabına kapalı** [S]. | Gün 0–60 |
| **CONVERSION** | A+ Content 5–6 modül (var: Bestiarium 5, Mythologica 5, Enigmatica 6, Games 6 (5'i görselli), Myths 10, Field Book 7, Hangul 6 [O]); Look Inside doğru sayfalar; Author Central bio + fotoğraf; seri sayfası. | A+ modüllerinde de fiyat/yorum yok. | Gün 0–30 |
| **SCALE / CUT** | 60. günde karar: ACOS ≤ 0,7×başabaş ve ≥ 5 yorum → ALWAYS-ON; değilse kampanyayı kapat, organik bırak. | Karar `data/ads/decisions.md`'ye yazılır. | Gün 60 |

### 5.2 7 / 30 / 90 gün kontrol listesi

**Gün 7**
- [ ] Tüm formatlar canlı, ASIN'ler kataloğa yazıldı (`valice-catalog.mjs` → loader)
- [ ] Look Inside doğru; A+ yayınlandı
- [ ] Auto kampanya gösterim alıyor (≥ 1.000 gösterim); almıyorsa bid +%20
- [ ] Companion QR'ı gerçek kitapta okundu (proof kopyadan)
- [ ] İlk arama terimi raporu indirildi

**Gün 30**
- [ ] ≥ 100 tıklama toplandı → CVR ölçüldü (ilk gerçek Valice sayısı)
- [ ] Kazanan terimler exact'e taşındı; 25–35/0 kuralı uygulandı
- [ ] Fiyat testi sonucu: hacim ≥ başabaş hacminin %69'u (CATALOG_ECONOMICS §4) korunuyor mu?
- [ ] ARC yorumları: ≥ 3 (hedef), hiçbiri koşullu değil
- [ ] KDP Reports CSV → `data/metrics/`

**Gün 90**
- [ ] TACOS hesaplandı (reklam ÷ toplam Amazon telifi + direct net)
- [ ] ALWAYS-ON / CUT kararı yazıldı
- [ ] Companion kaynaklı e-posta kayıtları sayıldı (`source=<slug>-companion`)
- [ ] Bir sonraki serinin ASIN hedefleri bu kitaptan türetildi

---

## 6. Amazon → Valice köprüsüyle ilişki

Reklamın tek işi Amazon içinde sıralama ve satış. **Amazon reklamından siteye trafik beklenmez** [R]: Amazon platformdan çıkan trafiği finanse etmek istemez ve ölçümü sunmaz (`CUSTOMER_ACQUISITION_STRATEGY.md` §3). Köprü şu yönde çalışır:

```
Amazon reklamı → Amazon satışı → basılı kitapta companion adresi/QR
   → valicepress.com/companion/<slug> → ücretsiz fayda → opsiyonel e-posta
   → sonraki kitap direct (Paddle ~%90 net)
```

Reklamın LTV'ye katkısı bu zincirle ölçülür: `source=<slug>-companion` etiketli kayıt sayısı ÷ o ayın Amazon birim satışı = **köprü oranı**. Bu oran, reklam bütçesini "birim başına net" yerine "birim başına net + köprü değeri" ile yargılamayı mümkün kılar — ama yalnızca ölçüldükten sonra; varsayılmaz.

**Ters yön (Valice → Amazon):** her "Buy on Amazon" düğmesi `/go/amazon/<slug>` üzerinden **Amazon Attribution** etiketli URL'ye yönlenir. Attribution KDP yazarlarına ücretsiz, 14 gün pencere, DPV/sepet/satış ve **KENP + telif** raporlar [V]. Böylece sitenin Amazon'a kaç baskı sattığı ilk kez görünür olur. Bu, "Amazon'un kendi tıklaması" sayılmadığı için organik BSR'ı da besler.

---

## 7. Ölçüm ve script tasarımı (Faz 16 — Amazon kısmı)

### 7.1 `scripts/analytics/import-kdp.mjs` (tasarım)

- Girdi: KDP Reports → "Prior Months' Royalties" dosyası (xlsx/csv), aylık.
- Çıktı: `data/metrics/kdp-YYYY-MM.csv` — kolonlar: `month, asin, title, format(ebook|paperback|hardcover|large_print), marketplace, units_sold, units_refunded, kenp_read, royalty_usd, currency_original, fx_rate`.
- Eşleme: ASIN → `slug` (`valice-catalog.mjs` içindeki ASIN'lerden; bilinmeyen ASIN hata verir — uydurma yok).
- Dry-run varsayılan; `--commit` ile yazar; idempotent (aynı ay tekrar yüklenirse üzerine yazar, ekleme yapmaz).

### 7.2 `scripts/analytics/import-ads.mjs` (tasarım)

- Girdi: Ads console CSV'leri (`campaign`, `search-term`, `targeting`, `placement`).
- Çıktı: `data/ads/sp-YYYY-MM-<report>.csv` + normalize edilmiş `data/ads/summary-YYYY-MM.csv`: `campaign, portfolio, slug, format, impressions, clicks, ctr, cpc, spend, orders_14d, sales_14d, kenp_14d, acos, cvr`.
- Attribution raporu ayrı: `data/ads/attribution-YYYY-MM.csv` (`tag, clicks, dpv, atc, purchases, sales, kenp, royalty`).

### 7.3 `scripts/analytics/title-pnl.mjs` (tasarım)

Başlık bazlı aylık P&L; kolonlar:

| Kolon | Kaynak |
|---|---|
| slug, title, month | katalog |
| amazon_units (format bazında), amazon_royalty | import-kdp |
| direct_units, direct_net | Postgres `orders`/`order_items` (Paddle net = liste − %5 − 0,50) |
| ad_spend, ad_orders, acos | import-ads |
| **contribution_after_ads** = amazon_royalty + direct_net − ad_spend | hesap |
| **tacos** = ad_spend ÷ (amazon_royalty + direct_net) | hesap |
| reviews, rating, bsr_snapshot | manuel/aylık örnekleme (`data/market/`) |
| companion_signups, verify_attempts | Resend (source), Vercel events |
| founder_hours_maintenance | manuel |

Bu tablo `/admin/metrics` sayfasının veri kaynağı olur (Faz 16); ilk 6 ay CSV yeterlidir.

---

## 8. Faz kapıları (Faz 32 formatı)

### Faz 13 — Amazon Ads

| | |
|---|---|
| **Objective** | Bestiarium ve World Games ciltlilerinde ölçülmüş CVR ve ACOS elde etmek; kataloğun ilk gerçek dönüşüm sayısını üretmek |
| **Inputs** | Düzeltilmiş ilanlar (112; $6,99), A+ yüklü, Author Central bio, Ads hesabı, 150 $/ay bütçe onayı |
| **Outputs** | 4 portföy; `data/ads/*.csv`; `data/ads/decisions.md`; ölçülmüş CVR/CPC; ALWAYS-ON/CUT kararları |
| **Dependencies** | Faz 3 (katalog düzeltmeleri), Faz 16 (import scriptleri), Founder A1–A6 |
| **Agents** | Keyword/ASIN research agent (autocomplete + also-bought + BSR örnekleme); rapor import/analiz agent; **bid değişikliği ve bütçe = Founder** |
| **Human checkpoints** | Bütçe tavanı (aylık); kill/scale kararları (haftalık 15 dk); Q4 ölçek onayı |
| **Expected time** | Kurulum 2 saat; haftalık 30 dk; aylık rapor 1 saat |
| **Success** | 60 günde en az 1 kampanya ACOS ≤ başabaş ve ölçülmüş CVR ≥ %8 |
| **Failure** | 2 ay sonra tüm kampanyalar ACOS > %62 → reklam durdurulur; sorun ilan/kapak/fiyattır, reklam değil |
| **KPI** | CVR, ACOS, TACOS, birim satış (reklamlı vs organik), yorum sayısı, köprü oranı |
| **Next phase** | Faz 13C lansman sistemi yeni başlıklara uygulanır; ALWAYS-ON listesi Faz 18 portföy yönetimine girer |

### Faz 13C — Lansman sistemi

Objective: her yeni Lane A/B başlığı için tekrarlanabilir 90 günlük lansman. Inputs: §5.1 kontrol listesi. Success: 90. günde ≥ 5 yorum ve ölçülmüş TACOS; Failure: 90. günde 0 yorum → seri stratejisi gözden geçirilir. KPI: gün-30 CVR, gün-90 yorum, gün-90 TACOS.

---

## 9. Founder aksiyonları (yalnızca Founder'ın yapabileceği)

| # | Aksiyon | Neden Founder | Süre | Bağımlılık |
|---|---|---|---|---|
| 1 | Amazon Ads hesabı + ödeme yöntemi | hesap/kart | 20 dk | — |
| 2 | Author Central: 18 ASIN'i claim et, **gerçek bio** yaz | kimlik beyanı; bio uydurulmaz | 45 dk | Vâliçe/Valice ad kararı |
| 3 | Bestiarium ilanlarını 112'ye düzelt; Kindle $4,99'ları $6,99 yap | KDP Bookshelf | 20 dk | — |
| 4 | Amazon Attribution kaydı | hesap | 15 dk | 1 |
| 5 | Aylık bütçe tavanını onayla (150 $) | para | 1 dk | 1 |
| 6 | Haftalık 15 dk: kill/scale kurallarını uygula (ajan hazırlar, Founder tıklar) | reklam konsolunda bid değişikliği | 15 dk/hafta | 5 |
| 7 | Her ayın 3'ü: 4 Ads CSV + KDP royalties dosyasını `data/` altına indir | hesap | 15 dk/ay | — |
| 8 | ARC listesi için 10–20 gerçek okur (arkadaş/aile değil) | ilişki | sürekli | Resend "arc" segmenti |
| 9 | Q4 ölçek onayı (Ekim başı) | para | 5 dk | 30/60 gün verisi |

---

## 10. Belirsizlikler — saklanmadı

| Konu | Durum |
|---|---|
| Alt kategori bazında CPC (mitoloji, dil, çocuk, bulmaca) | **DOĞRULANMADI** — hiçbir güvenilir kaynak yok; ilk auto kampanya Valice'in kendi verisini üretir |
| Lockscreen ads'in yazar konsolunda hâlâ var olup olmadığı; Select şartı; 100 $ minimum | DOĞRULANMADI — canlı konsol kontrolü (Founder, 2 dk) |
| Sponsored Display'in KDP hesabına açıklığı | Amazon sayfaları çelişkili — muhtemelen yok |
| SP minimum bid (0,02 $ efsanesi) | DOĞRULANMADI |
| 2026 kitap-özel CPC trendi | Yalnızca tüm-kategori verisi var (+%35 2023→2026) |
| Pre-order'ın yayın gününde ikinci sıralama etkisi | DOĞRULANMADI |
| Ads API "significant ecommerce business" dışlaması — kendi mağazası olan yayıncıya uygulanır mı | DOĞRULANMADI; zaten API yerine CSV kullanılıyor |
| KENP telif tahmini US dışı pazarlarda | DOĞRULANMADI |
| Amazon Community Guidelines tam metni | 503 verdi; alıntılar arama dizininden — kullanmadan önce yeniden doğrula |
| Valice'in kendi CVR/CPC'si | **Ölçülmedi.** Bu belgenin bütün tabloları ilk 100 tıklamadan sonra yeniden yazılır. |

---

## Kaynaklar (araştırma raporundan; 1 Eylül 2026'da kontrol edildi)

KDP help G201499010 (reklam, 12 pazar, 14 gün atıf, KENP) · advertising.amazon.com/library/guides/advertising-books-on-amazon-authors · …/sponsored-brand-authors (3+ başlık, 100 $ lifetime) · …/authors-guide-to-sponsored-products (bid stratejileri, TACOS tanımı) · advertising.amazon.com/resources/faq (1 $ minimum, "SP only" satırı) · …/sponsored-products-budget-best-practices (10 $/gün, aylık ortalama, +%25) · …/targeting-with-sponsored-products · …/book-ad-moderation-and-approval · advertising.amazon.com/solutions/products/amazon-attribution ve …/whats-new/amazon-attribution-kdp-authors · advertising.amazon.com/about-api · KDP help G201499380 (pre-order) · G200798990 (Select) · GVTTXHKHVPAPBEDQ (raporlar) · Amazon Community Guidelines GLHXEX85MENUE4XF (503; arama dizini) · Ad Badger 2026 · Kindlepreneur (27 Mar 2026) · Reedsy (10 Mar 2026) · Vappingo (Nis 2026) · Written Word Media 2026 mid-year survey · Intentwise (rapor saklama) · `MY-DİGİTAL-BOOK/KDP_ADVERTISING_STRATEGY_2026.html` (11 Ağu 2026, founder) · `AMAZON-KDP-2026-MARKET-OPPORTUNITY-REPORT.html` (12 Ağu 2026, founder).
