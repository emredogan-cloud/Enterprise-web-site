# Valice Press — Ana Yayıncılık Stratejisi

**Tarih:** 31 Ağustos 2026 · **Durum:** Araştırma çıktısı, üretim yapılmadı
**Founder hedefi:** Valice Press'i ana gelir kaynağı yapmak

Destekleyici belgeler:
`KDP_BUSINESS_MODEL_COMPARISON.md` · `PUBLISHING_FACTORY_ARCHITECTURE.md` ·
`NICHE_OPPORTUNITY_MATRIX.csv` · `docs/VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.html`

Hesapların tamamı yeniden üretilebilir:
```bash
node scripts/strategy/unit-economics.mjs
node scripts/strategy/niche-matrix.mjs
```

Kanıt etiketleri: **[D]** doğrulanmış (birincil kaynak) · **[Ç]** çıkarım ·
**[Ö]** öneri.

---

## 01 — Yönetici Özeti

**Grok'un ana tezi kısmen doğru, ama yanlış nedenle.** "Niş workbook serisi"
iyi bir *üretim* modeli. Ama **workbook bir baskı ürünüdür ve baskı yalnızca
Amazon'da vardır.** Valice'in bütün teknik varlığı — filigran, online reader,
doğrudan ödeme, R2, müşteri kütüphanesi, e-posta — bir alıştırma kitabı için
**tamamen işlevsizdir**. Model A, şirketi hiçbir yapısal avantajının olmadığı
tek kanalda büyütür.

**Grok'un en düşük önceliklendirdiği model — public domain — Valice için
ikinci en iyi modeldir.** Sebep tek bir kural: KDP, ağırlıklı olarak public
domain içeren kitapları **yalnızca %35 telif** dilimine sokar. [D] Aynı
$9.99'luk edisyon Amazon'da **$3.50**, Valice'in kendi mağazasında **$8.99**
getirir — **%157 fark**. Bu üstünlük yalnızca mağaza inşa edildiği için var.

**Kazanan model hibrit.** Birim başına harmanlanmış katkı **$16.29**; saf
workbook fabrikasında **$6.97**, saf low-content'te **$5.35**. $10.000/ay için
hibritte **614 adet/ay**, low-content'te **1.868 adet/ay** gerekiyor.
**Hacim kaldıraç değil; birim başına katkı kaldıraçtır.**

### Bu ay yapılabilecek, kitap üretmeyen dört hamle

Bunlar mevcut 7 başlık üzerinde, yeni içerik yazmadan uygulanır:

| # | Hamle | Gerekçe |
|---|---|---|
| 1 | **$4.99 e-kitapları $9.99–$12.99'a test et** | 7 Temmuz 2026'da %70 bandı $12.99'a çıktı. [D] $4.99 → **$3.19**; $9.99 → **$6.69**; $12.99 → **$8.79**. Esneklik bilinmiyor, bu yüzden *test* — ama $4.99 artık kataloğun en kötü fiyat noktası. |
| 2 | **Her paperback'e hardcover + large print ekle** | Aynı iç blok, ~3 saat iş. Paperback $5.35 → hardcover **$10.75**. Marjinal saat başına **$3.59 vs $0.38** — 9 kat. Kataloğun en ucuz parası. |
| 3 | **Renkli baskıların mürekkep tipini denetle** | 200 sayfalık $24.99 kitap: standart renk **$8.89**, premium renk **$0.99**. Tek bir dropdown, 9 kat fark. Premium renkte hiçbir reklam kârlı olamaz (başabaş ACOS %4). |
| 4 | **PD edisyonlarını direct-first tut** | Zaten `PAST_DECISIONS.md`'de karar. Bu rapor niceliğini veriyor: **+%157**. |

Hamle 2 ve 3 tek başına mevcut kataloğun birim ekonomisini yeni bir kitap
yazmadan iyileştirir.

---

## 02 — Founder Hedefi

Valice Press bir yan gelir değil, **ana gelir** olacak. Bu rapor bunu tek bir
teste bağlar (§43): bir model ancak yeterli pazar, yeterli marj, tekrar
satın alma, ölçeklenebilir edinim, founder'ın yönetebileceği operasyon ve
**tek platforma bağımlı olmama** koşullarını birlikte sağlıyorsa ana gelir
olabilir.

**Not — mevcut belgeyle çelişki.** `docs/STRATEJI_VE_KITAP_FIKIRLERI.md`
"yılda 1–2 başlık, $99–$399, mühendislik/yönetici nişi" diyor. Bu rapor buna
katılmıyor: o model yan gelir + prestij için doğru, **ana gelir için çok
yavaş** (yılda 4 başlıkla 24 ayda ana gelire ulaşılamaz) ve nişleri Valice'in
mevcut varlıklarıyla (mitoloji, bulmaca, klasikler, dil) hiç örtüşmüyor. Niş
matrisinde o iki niş **30 nişin en altında** yer alıyor — pazar cazibesi
yüksek olduğu için değil, **Valice'in orada hiçbir varlığı olmadığı için.**
Bu belge güncellenmeli.

---

## 03 — Mevcut Valice Press Avantajı

Her yetenek için tek soru: **bu bize hangi ticari avantajı sağlıyor?**

| Yetenek | Ticari avantaj | Gerçek değeri |
|---|---|---|
| First-party katalog | Müşteri ilişkisi bize ait | Amazon müşteriyi kiralar; biz sahibiz |
| Paddle (MoR) | Satışın ~%90'ı bizde kalır | Amazon'a karşı **+%34**, PD'de **+%157** |
| Filigran (Social DRM) | Kontrollü dijital dağıtım | Premium PDF'i sızıntı korkusu olmadan satmayı mümkün kılar |
| Online reader | Premium dijital ürün | PDF'i "dosya"dan "ürün"e çevirir |
| R2 (zero egress) | Sabit maliyetli dağıtım | Büyük görsel PDF'ler marjı yemez |
| E-posta / Resend | Tekrar satın alma, LTV | Amazon'un vermediği tek şey: müşteriye tekrar ulaşma |
| SSG / ISR + SEO | Ölçeklenebilir organik yüzey | Her başlık kalıcı bir arama varlığı |
| Inngest | Asenkron sipariş karşılama | Hacimde kırılmayan teslimat |
| Amazon bağlantılı baskı | Hibrit dağıtım | Keşif + fiziksel ürün, stoksuz |
| Admin/katalog yönetimi | Operasyonel hız | Yayın bir veri kararı (`valice-catalog.mjs`) |

**Kritik gözlem:** Bu yeteneklerin *hiçbiri* Amazon'da satılan bir paperback
workbook'a değer katmaz. Hepsi **dijital, doğrudan satılan** ürünlere değer
katar. Strateji bu gerçeğe uymak zorunda.

### Mevcut katalog — zaten doğru iskelet var

| Başlık | Format / fiyat | Durum | Yorum |
|---|---|---|---|
| Codex Mythologica | eb $4.99 · pb $21.99 · hc $32.99 · LP $27.99 | KDP Select | **Tam format merdiveni var** — model bu. Ama Select = münhasırlık. |
| Codex Bestiarium | eb $12.99 · pb $24.99 · hc $37.99 · LP $29.99 | Direct + Amazon | Doğru fiyatlanmış. **Mürekkep tipini denetle.** |
| The Great Book of World Myths | eb $4.99 · pb $14.99 · hc $26.99 | Direct + Amazon | e-kitap düşük fiyatlı; LP eksik |
| The Great Book of World Games | eb $11.99 · pb $22.99 · hc $34.99 | Direct + Amazon | LP eksik |
| The Myth Hunter's Field Book | pb $14.99 | Amazon | **Baskı-yerel companion — köprü modelinin kanıtı** |
| Meditations | eb $9.99 | Direct-only, KDP'de yok | **PD direct-first kalıbı, doğru uygulanmış** |
| Korean Hangul Handwriting Workbook | pb $12.99 · hc $21.99 | İncelemede | **Workbook tezinin tohumu** |

Founder farkında olmadan üç franchise tohumu ekmiş: **mitoloji referansı**,
**baskı-yerel companion**, **PD annotated direct**. Strateji sıfırdan
kurulmuyor — mevcut olan adlandırılıyor ve çoğaltılıyor.

---

## 04 — Grok Hipotezleri: Sonuçlar

| Hipotez | Karar | Gerekçe |
|---|---|---|
| **A · Niş workbook serisi** | **Kısmen doğru** | İyi üretim ve keşif motoru. Çekirdek model olamaz: baskı tezidir, Amazon'a kilitlidir, Valice'in hiçbir varlığını kullanmaz. |
| **B · Micro-niche low/medium factory** | **Reddedildi (çekirdek olarak)** | Jenerik köşe doymuş [D]; Amazon hız sınırı getirdi [D]; "AI slop" tepkisi belgelenmiş; en düşük birim katkı ($5.35); en yüksek hesap riski. **Yalnızca test laboratuvarı.** |
| **C · Original high-content** | **Doğru ama motor değil** | En iyi marj ($74.55/birim, %94), en iyi web uyumu. ~220 saat/başlık. Yılda 4 başlık ana gelir yapmaz. **Marj ve otorite katmanı.** |
| **D · Differentiated public domain** | **Grok yanılıyor — Valice özelinde** | KDP-only yayıncı için Grok haklı (%35 tavanı). Mağazası olan yayıncı için **yanlış**: $3.50 → $8.99, **+%157**. Kanal seçimi sonucu tersine çeviriyor. |

**Grok'un asıl hatası:** modelleri genel bir KDP yayıncısı için sıraladı.
Valice genel bir KDP yayıncısı değil — **kendi ödeme altyapısı olan bir
yayıncı.** Bu tek fark D'yi sondan ikinciye değil, ikinciliğe taşıyor.

---

## 05 — KDP Pazar ve Politika Araştırması

Tümü birincil kaynaktan doğrulandı **[D]** (kaynak tablosu HTML raporunda):

- **%70 telif bandı $2.99–$12.99'a çıktı (7 Temmuz 2026).** 2007'den beri ilk
  değişiklik. $9.99 tavanı artık yok.
- **Teslimat maliyeti** %70 diliminde $0.15/MB (ABD).
- **Public domain ağırlıklı kitaplar yalnızca %35.** Aynen: *"Books that
  consist primarily of public domain content are only eligible for the 35%
  Royalty Option."*
- **PD farklılaştırma:** çeviri, özgün annotation, **veya 10+ özgün
  illüstrasyon**; başlıkta `(Annotated)` / `(Translated)` / `(Illustrated)`
  etiketi zorunlu.
- **Paperback:** Amazon pazaryerlerinde listenin %50 veya %60'ı (fiyat
  bandına göre), Expanded Distribution'da **%40**; baskı maliyeti düşülür.
- **ABD baskı maliyeti:** sabit $1.00 + sayfa başına — S/B $0.012, standart
  renk $0.0255, **premium renk $0.065**.
- **Yükleme sınırı:** Eylül 2023'te günde 3 başlık; 2025 sonunda **format
  başına haftada ~10 yeni başlık**. → Ayda ~130 başlık-format kaydı.
  **8–10 kitap/ay planı tavanın ~4 katı altında. Platform sınırı bağlayıcı
  değil.**
- **AI beyanı:** AI ile *üretilmiş* metin/görsel/çeviri için zorunlu, sonradan
  ağır düzenlense bile. Beyan Amazon'a özel, ürün sayfasında görünmez,
  **telifi ve sıralamayı etkilemez.** Beyan etmemek hesap kapatmaya kadar
  gider. → **Beyan etmemenin hiçbir getirisi yok.**
- **Low-content:** jenerik köşe (mandala, temel planner, tek kullanımlık
  sezonluk) doymuş; büyük puntolu word search / sudoku "evergreen" ama
  komodite; 2026'da pazar **hacim ve hızı değil, özgüllük ve kaliteyi**
  ödüllendiriyor.

---

## 06–08 — Niş Matrisi ve İlk Üç

30 niş, ağırlıklı puanla değerlendirildi. **Ağırlıklar bilerek değiştirildi:**
Politika/Risk %5 → %10, Talep %20 → %15. Gerekçe: 2026 kanıtı, bu
kategorilerde kıt kaynağın talep değil **hayatta kalma** olduğunu gösteriyor.
Güvenle yayınlanamayan bir nişin beklenen değeri, talebi ne olursa olsun,
sıfırdır.

### Metodolojik dürüstlük uyarısı

**Bu alt puanlar yapılandırılmış yargıdır, ölçülmüş Amazon verisi değildir.**
Bu geçişte BSR, arama hacmi veya anahtar kelime rekabeti API'si yoktu. Puanlar
doğrulanan gerçeklerle (telif bantları, politika sınırları, belgelenmiş
doygunluk, reklam CPC aralıkları) kalibre edildi ve kendi içinde tutarlıdır —
ama **doğrulanacak bir sıralamadır, bir bulgu değildir.** Bir seriye
bağlanmadan önce ilk üç adayı gerçek pazar verisiyle (Publisher Rocket, KDSPY,
Helium 10 veya ilk 20 sonucun manuel BSR örneklemesi) doğrulayın.

### Bulgu: genel niş cazibesi karar değişkeni değil

Ham pazar puanı 30 nişin tamamını **63.5–73.3** arasına yerleştirdi. Bu
düzlük bir kusur değil, sonucun kendisi: iyi ve kötü nişler **farklı
eksenlerde** takas yapıyor (kalabalık olanlar üretmesi kolay, savunulabilir
olanlar yavaş). Herkes bu nişlerin herhangi birine girebilir.

Ayrıştıran şey **Valice varlık uyumu**: mevcut katalog, ~%90 tutan mağaza,
filigran+reader hattı, e-posta listesi. Bu eksen eklendiğinde aralık
**42.1–84.1**'e açılıyor.

### İlk 10 (Valice Önceliği)

| # | Niş | Pazar | Uyum | Öncelik |
|---|---|---:|---:|---:|
| 1 | Korece Hangul yazı çalışma kitapları | 73.3 | 95 | **84.1** |
| 2 | Mitoloji temalı bulmaca kitapları | 68.0 | 92 | **80.0** |
| 3 | Çocuklar için mitoloji aktivite / field book | 68.0 | 92 | **80.0** |
| 4 | Annotated Stoacı / felsefe edisyonları | 69.1 | 90 | **79.6** |
| 5 | Bestiary / yaratık külliyatı | 63.9 | 88 | 76.0 |
| 6 | İllüstrasyonlu dünya mitolojisi referansı | 63.5 | 88 | 75.7 |
| 7 | Bölgesel / ulusal folklor koleksiyonları | 65.9 | 82 | 74.0 |
| 8 | Yunan alfabesi (modern + klasik) | 69.3 | 78 | 73.6 |
| 9 | Karşılaştırmalı mitoloji çalışma rehberleri | 66.6 | 75 | 70.8 |
| 10 | Klasik okurlar için Latince | 67.2 | 68 | 67.6 |

**En alttaki beş** — mühendislik derin rehberleri (49.1), yaratıcı görsel
referanslar (46.2), sertifikasyon test-prep (43.9), yönetici playbook'ları
(43.1), sınıf düzeyi matematik (42.1). Pazarları kötü olduğu için değil,
**Valice'in orada hiçbir kaldıracı olmadığı için.**

### İlk 3 — ürün mimarisi (üretim yapılmadı, yalnızca mimari)

**1 · Yazı & alfabe çalışma kitapları — Lane A, Amazon baskı-öncelikli**
Hangul zaten incelemede. Tek şablon, çok dil.
Kitap 1 Hangul temel · 2 Hangul kelime & ifade · 3 Yunan alfabesi (mitoloji
kataloğuna çapraz satış) · 4 Kiril · 5 Kana.
Her biri: pb $12.99 → hc $21.99 → large print $27.99.
**Farklılaştırıcı:** her kitapta ücretsiz dijital companion (vuruş sırası
animasyonları, telaffuz sesi, ek yazdırılabilir sayfalar) → valicepress.com →
e-posta.

**2 · Mitoloji franchise genişlemesi — Lane A/B karması**
Codex Mythologica, Bestiarium, World Myths, Myth Hunter's Field Book zaten var.
Kitap 1 Mitoloji bulmaca kitabı (Codex evreninde) · 2 Çocuk field book cilt 2 ·
3 Bölgesel folklor cilt 1 (İskandinav) · 4 cilt 2 (Japon) · 5 Karşılaştırmalı
mitoloji çalışma rehberi.
**Savunulabilirlik:** hem mit içeriğine hem bulmaca zanaatına sahip başka
kimse yok.

**3 · Annotated public domain — Lane C, direct-first**
Meditations kalıbı zaten çalışıyor.
Kitap 1 Epictetus · 2 Seneca mektupları · 3 Marcus Aurelius genişletilmiş ·
4 Stoacı derleme cilt · 5 mitolojik kaynak metinler (Hesiodos, Ovidius).
Direct $9.99–$14.99 (**$8.99–$13.39 net**). Amazon'a yalnızca farklılaştırma
gerçek ve etiketliyse, keşif için.

---

## 09–13 — Modeller (özet)

Tam analiz: `KDP_BUSINESS_MODEL_COMPARISON.md`.

| Model | Birim katkı | Karar |
|---|---:|---|
| E · **Hibrit** | **$16.29** | **Kazanan (7.7/10)** |
| D · PD direct-first | $8.99 | İkinci (7.0) — Grok'un en düşük önceliği |
| A · Niş workbook serisi | $6.97 | Keşif motoru (6.2), çekirdek değil |
| B · High-content | $87.85 | Marj katmanı (5.8), motor değil |
| C · Micro-niche factory | $5.35 | Test laboratuvarı (5.2) |
| D′ · PD Amazon-only | $3.50 | Kaçınılacak (4.6) |

D ve D′ **aynı içerik stratejisi**, yalnızca kanal farkı — ve 2.4 puan arayla.

---

## 14 — Büyük Katalog Araştırması

**Dürüst sonuç:** Bu geçişte, 500+ başlıklı belirli yayıncıların kataloglarını
açıp yapılarını ayrıştıramadım. Aşağıdaki yapısal bulgular doğrulandı, ama
**adlandırılmış vaka incelemesi yapılmadı** — bu raporun en zayıf bölümü.

Doğrulanan yapısal gerçekler [D]:
- Bir kişi/şirket **birden çok imprint** işletebilir (Penguin Random House'un
  250 imprint'i var); self-publisher'lar da tür/kitle ayrımı için bunu yapar.
- **Pen name ≠ imprint ≠ tüzel kişilik.** Üçü ayrı katmandır; ISBN meta
  verisinde pen name yazar, imprint yayıncı olarak görünür.
- Self-publishing imprint'lerinin ISBN kayıtları 2008–2017 arasında **%205**
  arttı.

Çıkarım [Ç]: **500+ başlıklı bir "yazar" neredeyse kesinlikle bir yazar
değildir.** Şu bileşenlerin bir karmasıdır: çoklu pen name, çoklu imprint,
şablonlanmış seriler, format çoğaltma (aynı iç blok pb/hc/LP), public domain
edisyonları, derlemeler, çeviriler, dış katkıcılar/ghostwriter'lar.

**Founder'a doğrudan cevap (§45):** Amazon'da 500 başlık gördüğünüzde,
gördüğünüz şey 500 özgün kitap değil; **bir yayıncılık operasyonudur**.
Ve Valice için kritik olan çıkarım şu: **format çoğaltma bu sayının büyük
kısmını açıklar.** Valice'in kendi kataloğu bunu zaten gösteriyor — Codex
Mythologica tek bir içerik, **dört başlık-format kaydı**. 90 içerik projesi
üç formatta 270 kayıt eder.

**[Ö] Yapılacak iş:** bu bölümü kapatmak için 5–10 gerçek büyük kataloğun
manuel incelemesi ayrı bir görev olarak yapılmalı. Kararı değiştirmez ama
doğrular.

---

## 15 — Amazon Ads Ekonomisi

Kitap Sponsored Products CPC'si **$0.15–$0.45**, rekabetçi kategorilerde
$0.60+. [D] Hesap ortalaması ACOS ~%32 (çoğu %25–36). [D]

Başabaş ACOS = net ÷ liste:

| Ürün | Başabaş ACOS | %8 CVR'de max kârlı CPC |
|---|---:|---:|
| e-kitap Amazon $12.99 | %67.7 | $0.70 |
| Workbook hardcover $21.99 | %48.9 | $0.86 |
| Workbook paperback $12.99 | %41.2 | $0.43 |
| İllüstrasyonlu std. renk $24.99 | %35.6 | $0.71 |
| Annotated PD Amazon $9.99 | %35.0 | $0.28 |
| İllüstrasyonlu **premium** renk | **%4.0** | $0.08 — **asla reklam verme** |

**Sonuç [Ç]:** $12.99 paperback'in $0.43 max CPC'si gözlenen CPC bandının
**tepesinde**. Reklam verilebilir ama hata payı yok — ve kurguyu finanse eden
Kindle Unlimited read-through'ı burada yok. **Reklam kalıcı edinim kanalı
değil, lansman sıralama aracıdır.** Hardcover'ın $0.86'lık alanı çok daha
rahat — merdiveni kurmanın bir başka nedeni.

---

## 16 — Seri Ekonomisi

**Uyarı [Ç]:** Bulunan %35–50 read-through rakamlarının tamamı forumlarda
**kurgu** yazarlarının kendi beyanı. Kurgu read-through'ını anlatı momentumu
sürükler; bir alıştırma kitabında bu yok. **Workbook serisi için güvenilir
kamuya açık kıyas yok.**

Bir workbook serisi **read-through ile değil, anahtar kelime ve marka
kapsamıyla** birleşir: 5 kitap 5 kat arama yüzeyi, paylaşılan seri sayfası,
paylaşılan şablon (marjinal maliyet düşer), paylaşılan kapak kimliği. Faydası
gerçek ama **kurgu benzetmesiyle modellenmemeli.**

---

## 17 — E-posta / Web Sitesi Ekonomisi

Kıyaslar [D]: otomatik akışlar %42+ açılma, %5.58 tıklama, **%2.11 sipariş
oranı**; kampanyalar %31 / %1.69 / %0.16. Otomatik e-posta başına $3.41 gelir,
kampanyada $0.155.

Valice için model [Ç]:

```
Amazon baskı kitabı → QR / kısa URL → ücretsiz dijital companion
   → e-posta kaydı → hoş geldin akışı → seri önerisi → direct katalog
```

Bir Amazon alıcısını e-posta abonesine çevirmek onu **CAC'siz** hale getirir;
sonraki her satış Amazon'un %40–50'si yerine Paddle'ın %5+$0.50'siyle gelir.
**Bu, planın Amazon trafiğini sahip olunan varlığa çeviren tek mekanizmasıdır
ve mağazanın varlık sebebidir.**

---

## 18–21 — Fabrika ve Kalite

Tam tasarım: `PUBLISHING_FACTORY_ARCHITECTURE.md`. Özet:

**8–10 kitap/ay izinli mi?** Evet — KDP tavanı planın ~4 katı. [D]
**Emilebilir mi?** Yalnızca **yerleşik bir seri içindeki şablonlanmış
başlıklar** için. Özgün high-content için hayır.

**Asıl darboğaz üretim değil, birikimli bakım.** Yayın bir *akış*, bakım bir
*stok*. Ayda 10 kitap, 24. ayda 10 kitaplık iş **artı 240 canlı başlığın
bakımı** demektir. Başlık başına ayda 0.5 saat varsayımıyla: 120 başlık = 60
saat/ay = 0.38 FTE; 360 başlık = bir tam zamanlı kişiyi aşar.

**Üç şerit:** Lane A Franchise (4–6/ay, Amazon baskı-öncelikli) · Lane B
Flagship (çeyrekte 1, direct-first) · Lane C Public Domain (1–2/ay,
direct-first).

**10 kalite kapısı**; 2 (haklar), 5 (olgu doğrulama), 8 (KDP politikası)
**founder imzası, devredilemez** — hesabı bitirebilecek olanlar bunlar.

**İki kural:** doğrulayıcı ajan asla yazan ajan olamaz; kitap bazında değil
**aşama bazında** paketle (10 kitap 3. kapıda birlikte ucuza düşsün, 9.
kapıda tek tek pahalıya değil).

**Kitap başına model maliyeti** ~1.03M girdi / ~340k çıktı token. Birim
katkıya karşı ilk ~5 kopyada geri kazanılır. **Asıl maliyet token değil,
founder saati.**

---

## 22–24 — Finansal Senaryolar

$X/ay için gereken aylık adet:

| Model | $/birim | $5k | $10k | $20k | $50k |
|---|---:|---:|---:|---:|---:|
| C · Low-content | $5.35 | 934 | 1.868 | 3.736 | 9.339 |
| A · Workbook fabrikası | $6.97 | 717 | 1.434 | 2.868 | 7.170 |
| D′ · PD Amazon-only | $3.50 | 1.431 | 2.861 | 5.721 | 14.301 |
| D · PD direct-first | $8.99 | 557 | 1.113 | 2.225 | 5.562 |
| **E · Hibrit** | **$16.29** | **307** | **614** | **1.228** | **3.070** |
| B · High-content | $87.85 | 57 | 114 | 228 | 570 |

Portföy dağılımı (20/30/50 kazanan/ortalama/zayıf; 3.0/0.7/0.1 satış/gün —
**bu rakamlar illüstratif, ölçülmemiş**):

| Katalog | Adet/ay | Katkı/ay |
|---:|---:|---:|
| 10 | 261 | $4.259 |
| 30 | 784 | $12.777 |
| 50 | 1.307 | $21.295 |
| 100 | 2.614 | $42.591 |

Her seviyede **başlıkların %20'si gelirin ~%70'ini taşıyor.** [Ç]

**Bu modelin en kırılgan varsayımı budur** ve hiçbir kamuya açık veri kümesi
bu kategori için güvenilir başlık başına satış hızı vermiyor. **Şekli**
(beşte bir başlık ~%70 geliri taşır) bulgu olarak alın; mutlak rakamları
Valice'in kendi ilk 12 aylık verisiyle değiştirin. **10 başlığın bir yıllık
geçmişi olduğunda yapılacak o tek ölçüm, bu raporun bütün kıyaslarından daha
değerlidir.**

### Aylık üretim senaryoları

| Senaryo | Kitap/ay | 12 ay | 24 ay | 36 ay | Gerçekçilik |
|---|---:|---:|---:|---:|---|
| A | 1 | 12 | 24 | 36 | Çok yavaş (mevcut belgenin modeli) |
| B | 3 | 36 | 72 | 108 | Sürdürülebilir, Lane A+C ile |
| C | 5 | 60 | 120 | 180 | **Önerilen hedef** |
| D | 8 | 96 | 192 | 288 | Yalnızca şablonlu; bakım 1 FTE'ye yaklaşır |
| E | 10 | 120 | 240 | 360 | Bakım stoğu founder'ı boğar |

**Katalog büyüklüğünü gelirle eşitlemeyin.** 10 kitap ≠ 10 başarılı kitap.

---

## 25 — Sürdürülebilirlik

| Ufuk | Lane A (workbook) | Lane B (flagship) | Lane C (PD direct) |
|---|---|---|---|
| 1 yıl | Güçlü | Zayıf (henüz yok) | Güçlü |
| 3 yıl | Orta — kopyalanır | Güçlü | Güçlü |
| 5 yıl | Zayıf — komodite | Güçlü | Orta — kaynaklar tükenir |

Lane A tek başına 5 yıl dayanmaz: şablon kopyalanabilir, AI üretimi
maliyeti sıfıra iter, reklam maliyeti şişer. **Hibridin sürdürülebilirliği
Lane A'dan değil, Lane A'nın beslediği e-posta listesinden gelir.**

---

## 26 — Riskler

| Risk | Seviye | Kontrol |
|---|---|---|
| KDP hesap kapatma | 🔴 | AI beyanı her zaman; kapı 4 mükerrerlik; kapı 8 politika |
| Premium renk marj tuzağı | 🔴 | Mürekkep denetimi (**bu ay**) |
| Bakım stoğu founder'ı boğar | 🔴 | Şerit disiplini; zayıf başlıkları arşivle |
| Niş doygunluğu | 🟡 | Varlık uyumu yüksek nişlerde kal |
| Reklam maliyeti enflasyonu | 🟡 | Reklamı lansman aracı olarak kullan |
| Tek platform bağımlılığı | 🟡 | Lane B + C'yi maddi olarak büyük tut |
| PD farklılaştırma reddi | 🟡 | Kapı 2 + 8; etiketi başlığa koy |
| Read-through varsayımı yanlış | 🟡 | Seriyi anahtar kelime kapsamıyla modelle |
| Ölçülmemiş satış hızı | 🔴 | **Kendi verini topla — en yüksek değerli iş** |

---

## 27 — Marka Mimarisi

**[Ö] Tek marka, tematik seri kimlikleri.** Ayrı imprint/pen name **hayır**.

Gerekçe: Valice'in kaldıracı **birikmiş marka + e-posta listesi + SEO
otoritesi**. Bunları ikiye bölmek her ikisini de yarıya indirir. Bir mitoloji
alıcısını bir Hangul workbook'una taşıyan şey ortak markadır.

Ayrı imprint yalnızca **ton çatışması** olursa gerekir (ör. yetişkin içerik
veya tamamen ilgisiz bir dikey). Bugün böyle bir çatışma yok.

Seri kimlikleri marka altında: **Codex** (mitoloji referansı) · **Field Book**
(aktivite/companion) · **Valice Script** (dil workbook'ları) · **Valice
Classics** (annotated PD).

---

## 28 — Nihai Strateji Kararı

**Çekirdek model:** Hibrit — Amazon keşif ve baskı için, Valice mağazası marj
ve sahiplik için; ikisini **ücretsiz dijital companion köprüsü** bağlar.

**İkincil:** Annotated public domain, direct-first (Grok'un en düşük
önceliği; burada ikinci).

**Deneysel:** Micro-niche low-content — yalnızca talep sondajı için, ayda
1–2, asla ana hat.

**Yapılmayacak:** Premium renkte baskı · PD'yi Amazon-only satmak ·
$4.99 e-kitap · ayrı imprint/pen name · Valice'in hiçbir varlığının olmadığı
nişler (mühendislik derin rehberleri, yönetici playbook'ları, sınıf matematiği).

**Katalog hedefi:** Yıl 1 **30–40** (niş portföyü) · Yıl 2 **90–110**
(yayıncılık makinesi) · Yıl 3 **180–220** içerik projesi. Format çoğaltmayla
başlık-format kaydı bunun ~2.5–3 katı.

**Üretim hızı:** ayda 5 içerik projesi (Lane A 3–4 + Lane C 1–2), çeyrekte
1 Lane B. **8–10 değil** — 8–10 yalnızca şablonlu Lane A için ve yalnızca
bakım stoğu çözüldüyse.

---

## 29 — Tam Olarak Bir Sonraki Adım

**Hiçbir kitap üretmeyin.** Sıra:

**Hafta 1 — mevcut kataloğu düzelt (yeni içerik yok)**
1. Codex Bestiarium ve tüm renkli iç bloklarda **mürekkep tipini denetle**.
   Premium ise standarda geçir. Tek başına birim katkıyı 9 kata kadar değiştirir.
2. $4.99 e-kitaplar için **fiyat testi** başlat ($6.99 → $9.99).
3. LP/hardcover eksik her paperback için **format merdiveni** planla
   (World Myths, World Games, Myth Hunter's Field Book).

**Hafta 2 — ilk üç nişi gerçek veriyle doğrula**
4. Publisher Rocket / KDSPY / manuel BSR örneklemesiyle ilk 3 nişi doğrula.
   **Matris bir sıralamadır, bir bulgu değildir.**

**Hafta 3 — köprüyü inşa et**
5. Hangul workbook için **dijital companion sayfası** (vuruş sırası, ses,
   ek sayfalar) + e-posta kaydı. Baskı kitaba QR koy.
   Bu, bütün stratejinin tek mekanizması.

**Hafta 4 — ölçüm altyapısı**
6. Başlık başına aylık satış takibi kur. **20/30/50 varsayımını kendi verinle
   değiştirmek, bu rapordaki her kıyastan daha değerli.**

Ancak bundan sonra üretim başlasın — ilk slate: Hangul kitap 2 + mitoloji
bulmaca kitabı + Epictetus (annotated, direct-first).

---

## Nihai Founder Hükmü

**Valice Press'in gerçek varlığı katalog değil, mağazadır.** Rakiplerin
kopyalayamadığı tek şey, bir Amazon alıcısını sahip olunan bir müşteriye
çevirme yeteneğidir — ve bu yetenek zaten inşa edilmiş, henüz
kullanılmıyor.

**En büyük risk:** Amazon'da hacim kovalayıp mağazayı boş bırakmak. O yolda
Valice, hiçbir yapısal avantajı olmayan binlerce KDP yayıncısından biri olur.

**En büyük moat:** baskı kitaptan dijital companion'a, oradan e-postaya giden
köprü. Bunu kuran yayıncı sayısı çok az; çünkü çoğunun mağazası yok.

**Asla yapılmayacak şey:** kitap sayısını iş çıktısıyla karıştırmak.
En kârlı, yüksek kaliteli, tekrarlanabilir, ölçeklenebilir, politikaya uyumlu
yayıncılık makinesini istiyoruz — en büyük kitap yığınını değil.
