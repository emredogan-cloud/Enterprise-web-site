# Dijital Kitabevi — Strateji ve İçerik Rehberi

> **Birincil hedef:** Güçlü bir **yan gelir** (side income).
> **İkincil hedef:** **Tanınırlık ve prestij** (recognition / prestige).
>
> Bu rehber; mevcut mimarinin (first-party, watermark, online reader,
> Paddle MoR, Vercel/Next.js SSG) hangi içerik nişlerinde **doğal bir
> avantaja** dönüştüğünü açıklar ve ilk 12 ayda izlenmesi gereken somut
> bir yol haritası sunar.

---

## 0. Belge Kapsamı

| Bölüm | İçerik |
|---|---|
| 1 | Mimari → Strateji bağlantısı (neden premium info-product için biçilmiş kaftan) |
| 2 | Konumlandırma ilkesi (premium-first, hacim-reddi) |
| 3 | **Niş 1** — İleri seviye mühendislik & teknik derinlik rehberleri |
| 4 | **Niş 2** — Yönetici (executive) playbook + framework'leri |
| 5 | **Niş 3** — Notion / Linear / Figma şablonu + e-kitap karma paketleri |
| 6 | **Niş 4** — Uzmanlaşmış mülakat ve sertifikasyon hazırlığı |
| 7 | **Niş 5** — Görsel-yoğun yaratıcı meslek rehberleri |
| 8 | Fiyatlandırma stratejisi |
| 9 | Lansman taktikleri (12 aylık plan) |
| 10 | İçerik üretim disiplini ve katalog hijyeni |
| 11 | Birinci 90 günlük somut aksiyon listesi |

---

## 1. Mimari → Strateji Bağlantısı

Bu projenin teknik tercihleri (Roadmap §2.1 ve `memory/PAST_DECISIONS.md`)
düşük-marjlı hacim modeline değil, **yüksek-değerli az-sayıda
ürün** modeline doğrudan hizmet eder. Beş tane teknik karar bunu mümkün
kılar:

| Teknik Karar | Strateji Karşılığı |
|---|---|
| **First-party katalog** (vendor marketplace değil) | Her başlık üzerinde **editöryal kalite kontrolü**; markanın bizimle eşleşmesi → prestij birikir |
| **Social DRM (filigran)** — sert kilit değil | Müşteriye saygı sinyali. Premium fiyatlandırmaya **uyumlu** (B2B alıcısı hard-DRM'i kaldırmaz) |
| **Online reader + PDF indirme ikiliği** | "Aldığın senindir" vaadi; B2B alıcısının ofis kuralları (PDF arşivleme) ile uyumlu |
| **Paddle (MoR)** — Stripe direct değil | Küresel KDV/satış vergisini Paddle yüklenir; **kurumsal alıcıyı kabul edebilirsiniz** (sandbox'tan üretime tek anahtar değişikliği) |
| **SSG + ISR + dinamik sitemap** | Long-tail SEO mimarisi; **bir-iki başlık** yıllarca organik trafik çekebilir |

Bu beş karar birlikte tek bir cümle söyler: **az sayıda, pahalı, derin
ve kalıcı içerik satmak için optimize edilmiş bir altyapı.**

Yani: $10'luk 1.000 kopya değil, **$150'lik 100 kopya**. Aynı gelir,
çok daha az operasyonel gürültü, çok daha hızlı prestij birikimi.

---

## 2. Konumlandırma İlkesi — Premium-First, Hacim Reddi

Şu üç şeyi **yapmamak** stratejik bir tercihtir:

1. **"Sınırsız e-kitap aboneliği" benzeri Scribd modelleri** — abonelik
   mekanikleri bu mimaride yok ve **eklenmemeli**. Her başlık tek seferlik,
   kalıcı sahiplik.
2. **Black Friday / Cyber Monday %70 indirimleri** — kataloğun algılanan
   değerini ucuzlatır. Bir kez yapıldığında müşteri "şimdi alma, indirim
   bekle" davranışını öğrenir.
3. **Çok kategorili genel katalog** ("teknik + iş + sağlık + yemek...")
   — niş otoritesi parçalanır. **Tek bir niş, tek bir ses**.

Bunların yerine üç şeyi **mutlaka** yapın:

1. **Her başlığı bir "büyük taahhüt" gibi konumlandırın** — okur 5 dakikada
   tüketebileceği bir blog yazısı değil, **8-30 saatlik** ciddi bir kaynak
   alıyor.
2. **Sosyal kanıtı (social proof) ürün sayfasının üstüne çıkarın** —
   SUB-PR 3.3 ile gelen review/rating altyapısı buna birebir uygundur.
   Anasayfada "23 mühendis 4.7★ verdi" görmek dönüşümü ikiye katlar.
3. **Örnek bölümü (sample) cömertçe verin** — SUB-PR 1.3'teki sample
   viewer altyapısı SEO'ya da hizmet eder, alıcıya kalite kanıtı olarak
   da. İlk 20-40 sayfayı tam HTML olarak yayınlayın.

---

## 3. Niş 1 — İleri Seviye Mühendislik & Teknik Derinlik Rehberleri

### 3.1. Hedef Kitle ve Acı Noktası

**Kim:** Senior, staff, principal seviye mühendisler; tech leads; sistem
mimarları. Genellikle Twitter/X, LinkedIn, Hacker News, lobste.rs aktif
kullanıcısı. Kitap için **kişisel kredi kartı** (şirket parası değil)
kullanmaya istekli — çünkü kariyerine yatırım yapıyor.

**Acı noktası:** İnternette dağınık 50 blog yazısı / 20 konferans videosu
yerine **tek bir derli toplu derin kaynak** arıyorlar. Junior-friendly
materyalden bıkmışlar; resmi belgelerden öteye geçmek istiyorlar.

### 3.2. Örnek Başlıklar

| Başlık | Sayfa | Fiyat | Tahmini WTP* |
|---|---|---|---|
| "Production-Grade PostgreSQL: Tuning, Replication, Disaster Recovery" | ~250 | **$129** | Yüksek |
| "Advanced React Server Components Patterns" | ~180 | **$89** | Yüksek |
| "Distributed Systems for Working Engineers: A Practitioner's Reference" | ~320 | **$179** | Çok yüksek |
| "The TypeScript Compiler API Field Guide" | ~150 | **$69** | Orta |
| "Rust Async in Production: lessons from rewriting it 4 times" | ~200 | **$99** | Yüksek |

*WTP = Willingness To Pay (ödemeye razı olma seviyesi)*

### 3.3. Neden Mimari Avantaj

- **Filigran ile uyumlu kitle:** Mühendisler kendi adlarının ucundan
  yayılmış bir PDF'in itibarlarına zarar vereceğini bilir. Filigran
  burada "soft deterrent" olarak güçlü çalışır.
- **Online reader + indirme:** Mühendisin laptopundaki referans + tablette
  okuma + kod editörü yanında PDF açık → üç farklı bağlamda kullanım.
- **Long-tail SEO:** Konu başlıkları (örn. "postgres bgwriter tuning")
  arama hacmi düşük ama dönüşüm oranı yüksek terimlerdir. SSG mimarisi
  bunu doğal olarak yakalar.

### 3.4. İlk 12 Ayda Yapılacak Şey

**Tek bir başlığa odaklanın.** "Distributed Systems for Working Engineers"
gibi geniş bir konuyu seçin → 6 ay boyunca her hafta bir blog yazısı
(her biri bir konferans talk'unun PDF'i hâline gelecek bölüm taslağıdır)
→ 6. ayda kitabın bekleme listesi açın → 9. ayda lansman.

---

## 4. Niş 2 — Yönetici (Executive) Playbook ve Framework'leri

### 4.1. Hedef Kitle ve Acı Noktası

**Kim:** CFO, CTO, VP Engineering, VP Product, COO, kurucu/CEO. Şirket
ya da masraf hesabı kullanır → fiyat duyarlılığı **dramatik biçimde**
düşüktür. Şirket için $250 harcamak için çoğunun onay almaya gereği
yok.

**Acı noktası:** Yeni bir göreve geçtiklerinde (yeni şirket, yeni
pozisyon, M&A, IPO öncesi) **birinci 90 günde ne yapacaklarını adım adım
anlatan dokümana** ihtiyaçları var. McKinsey raporları $50.000.
Bizim PDF'imiz $399. Yüz kat daha ucuz, 0 saatte ulaşılabilir.

### 4.2. Örnek Başlıklar

| Başlık | Sayfa | Fiyat | Hedef Kitle |
|---|---|---|---|
| "The New VP of Engineering's First 90 Days: A Playbook" | ~120 | **$249** | Yeni VP'ler / direktörler |
| "The CFO's Quarter-Close Reference: Process, Pitfalls, Templates" | ~80 | **$199** | CFO / finans direktörleri |
| "M&A Due Diligence Checklist Suite (Tech + Org + Legal)" | ~60 + Notion | **$399** | M&A danışmanları + alıcı şirketler |
| "Series A to Series B: The Founder's Operating Manual" | ~200 | **$299** | Seri A-B kurucular |
| "The Board Pack Playbook: Templates + Frameworks for First-Time CEOs" | ~100 + Notion | **$349** | İlk kez halka açılan / VC-backed kurucular |

### 4.3. Neden Mimari Avantaj

- **Filigran maksimum etkide:** Yönetici alıcı, içeriği şirket
  intranet'ine yüklediğinde **kendi adıyla** yüklemiş olur. Hukuk
  açısından "lisanslı olmadığı" açıktır. Bu nedenle organik olarak
  paylaşmazlar — şirket başına "tek kopya satışı" değil, **kişi başına
  tek kopya** olur.
- **Hedef pazar küçük + ödeme kapasitesi yüksek:** Türkiye'de bile 5.000
  CFO/VP-level alıcıya ulaşırsanız ve her birinin 1-2 yılda bir kez
  $300'lük kitabınızı alma şansı **%5** olsa, yıllık $150K. Bu seviyedeki
  alıcılara nasıl ulaşılır? LinkedIn + sektörel etkinlikler + tavsiye
  zinciri.
- **Paddle MoR ile kurumsal fatura:** Şirket adına fatura kesilebilir;
  alıcının LinkedIn ya da konferansta bahsetmesi prestijinizi kabartır.

### 4.4. Üstün Strateji

Bu segmentteki müşteriler **karar verdikten sonra** araştırma yapmaz —
karar **bir başkasının tavsiyesi** ile gelir. Bir başlığa LinkedIn'de
12-15 saygın isim referans verirse o başlık 2 ay içinde **kendi başına**
satar.

Yani: önce 10-15 saygın isme bedava nüsha gönderin → onlardan **kısa
public quote** isteyin → bu quote'ları başlığın sayfa üstüne koyun → para
o noktadan sonra kendi kendine gelir.

---

## 5. Niş 3 — Notion / Linear / Figma Şablonu + E-kitap Karma Paketleri

### 5.1. Hedef Kitle ve Acı Noktası

**Kim:** Operasyon yöneticileri, ürün müdürleri, indie maker'lar, küçük
takım liderleri. Notion/Linear/Figma'yı **günlük olarak** kullanıyorlar.

**Acı noktası:** İyi bir Notion/Linear şablonu **işyerindeki bir araç
kadar değerlidir** — ama tek başına şablon "boş bir form" gibi gelir.
İçindeki düşünceyi anlatan **uzun-form bir kitap** ile birlikte sunduğunuzda
şablon birden değerli hale gelir.

### 5.2. Örnek Başlıklar

| Paket | Bileşenler | Fiyat |
|---|---|---|
| **The Solo Founder's OS** | 100-sayfa PDF + 12 Notion şablonu (CRM, finans, OKR, roadmap, kişisel sistem) | **$199** |
| **The Engineering Manager's Toolkit** | 80-sayfa PDF (1:1 kültürü, performans, terfi) + Notion 1:1 şablonu + Linear weekly-review şablonu | **$149** |
| **The Product Discovery Workbook** | 120-sayfa PDF + 8 Figma framework dosyası (jobs-to-be-done, opportunity tree, RICE) | **$229** |
| **The Indie SaaS Pricing Playbook** | 60-sayfa PDF + 1 dinamik Notion fiyat-modelleme şablonu + örnek pricing-page Figma | **$179** |

### 5.3. Neden Mimari Avantaj

- **PDF tarafı bizim mimarimizin sweet spot'u** — filigran + reader, hepsi
  doğru. Şablonlar Notion/Figma'nın kendi paylaşım mekanizmaları ile
  verilir (PDF'in içinde paylaşım linki olur).
- **Algılanan değer ikiye katlanır** — okuyucu sadece "bilgi" almıyor,
  hemen kullanılabilir bir **araç** alıyor. Tek başına PDF $99 ise,
  PDF + Notion paketi $199 olarak satılır (ve daha hızlı satar).
- **İade oranı düşer** — şablonu indirip kurduğu için satın alma "geriye
  alınması zor" hale gelir.

### 5.4. Uygulama Notu

Notion şablonunu paylaşmak için "Duplicate" link kullanın (kullanıcı
kendi workspace'ine kopyalar). Şablonun URL'sini PDF'in sonuncu sayfasına
koyun → filigran şablona da uygulanmış olur (PDF'in içinde olduğu için).

Figma için: **Community link** ile paylaşın; alıcı kendi Figma hesabına
dosyayı çekebilir. Aynı şekilde URL PDF içinde.

---

## 6. Niş 4 — Uzmanlaşmış Mülakat ve Sertifikasyon Hazırlığı

### 6.1. Hedef Kitle ve Acı Noktası

**Kim:** Belirli bir kariyer adımına geçmek isteyen profesyoneller.
Staff Engineer / Principal Engineer / Senior PM seviyesine yükselmek
isteyen mid-career insanlar.

**Acı noktası:** "Cracking the Coding Interview" gibi entry-level
kitaplar var. "Designing Data-Intensive Applications" gibi ders kitapları
var. Ama **belirli bir şirketin / belirli bir seviyenin mülakatına özel
hazırlık materyali** çoğunlukla pahalı 1:1 koçluğa ($1.000-$5.000) sıkışmış.

### 6.2. Örnek Başlıklar

| Başlık | Sayfa | Fiyat | Hedef |
|---|---|---|---|
| "Staff Engineer System Design Interview: A Field Guide" | ~280 | **$149** | Senior → Staff terfi adayları |
| "FAANG Product Manager Case Interview Bible" | ~220 | **$129** | PM mülakatlarına hazırlık |
| "AWS Solutions Architect Professional Cheat Sheet" | ~100 | **$79** | AWS SAP-C02 adayları |
| "The Tech-Lead Behavioral Interview Playbook" | ~120 | **$99** | EM/TL mülakatları |
| "Engineering Manager → Director Interview Workbook" | ~180 | **$179** | Mid-management terfi adayları |

### 6.3. Neden Mimari Avantaj

- **Filigran tam burada zirvedir:** Alıcı, mülakat hazırlığını r/cscareerquestions,
  Telegram coaching grupları, "leetcode discuss" forumlarına yüklemek
  **istemez** — çünkü kendi adı stamp'lı. Bu kitle özellikle bu tür
  forumlara sızdırma eğilimi yüksek; filigran bunu ciddi biçimde caydırır.
- **Online reader cep telefonunda mükemmel:** Mülakata gitmeden önce
  metroda bir kez daha okuma, sonuç sayfasında flashcard mantığı çalışır.
- **Kariyer ROI'si net:** Alıcı "$149 kitap + yeni iş 30K-100K maaş zammı"
  matematiğini saniyede yapar. WTP yüksek.

### 6.4. Uyarı

Bu nişte **güncel tutmak zorunludur**. Mülakat soruları, sistem tasarımı
trendleri, AWS sınav konuları değişir. Yılda en az bir güncelleme
çıkarmaya hazır olun (eskimiş kitap **negatif** itibar yapar). Bu
güncelleme döngüsü mevcut alıcılara "ücretsiz minor revizyon" olarak
verilirse — müşteri sadakati ve tavsiye zinciri ciddi şekilde artar.

---

## 7. Niş 5 — Görsel-Yoğun Yaratıcı Meslek Rehberleri

### 7.1. Hedef Kitle ve Acı Noktası

**Kim:** Type designer, cinematographer, illustrator, brand designer,
typographer, motion designer. Görsel referansa, lookbook'a, "öğrenilmiş
göz"e yatırım yapan profesyoneller.

**Acı noktası:** Bu disiplinlerde iyi referans materyali **basılı kitapta**
genellikle $100-$300 arası — ama bu kitaplar Türkiye'ye getirildiğinde
kargo + gümrük → $400+ olur. Dijital, yüksek-çözünürlüklü PDF eşdeğeri
**daha ucuz, anında ulaşılabilir, kelime arama yapılabilir**.

### 7.2. Örnek Başlıklar

| Başlık | Sayfa | Fiyat | Notlar |
|---|---|---|---|
| "The Cinematographer's Lookbook: 200 Stills + Technical Notes" | ~250 (yoğun görsel) | **$249** | Renk paleti + lens + ışık metadata'sı her sayfada |
| "Type Design Fundamentals: From Sketch to OpenType" | ~180 | **$199** | Font örnekleri PDF'in içinde + ayrı `.otf` dosyaları |
| "Brand Identity Systems: A Reference of 40 Case Studies" | ~300 | **$179** | Pantone değerleri + yüksek-çözünürlüklü görseller |
| "The Editorial Designer's Grid Reference" | ~150 | **$149** | InDesign grid template'leri de pakette |
| "Light Studio for Photographers: A Visual Vocabulary" | ~200 | **$199** | Set diagram'ları + sonuç fotoğrafları yan yana |

### 7.3. Neden Mimari Avantaj

- **PDF görsel sadakati en yüksek format:** Web sayfasından çok daha
  yüksek çözünürlük, çok daha kontrollü tipografi. Apple Books / Kindle
  da görsel-yoğun içeriği iyi göstermez. PDF tek alternatif.
- **R2 zero-egress mimarisi**: 50-100 MB PDF'ler düzenli indirilse bile
  egress maliyeti yok. AWS S3 üzerinde aynı senaryo $30-50/ay ek maliyet.
- **Yaratıcı portfolyo görünürlüğü:** Bu kitle Instagram/Behance'de
  görünür. Filigranlı bir leak portfolyoları ile eşleşir → caydırıcı.

### 7.4. Bonus: Online Reader Sınırlılığı

Çok büyük, görsel-yoğun PDF'lerde pdf.js okuyucusu yavaşlayabilir.
**Reader sayfasında "Yüksek çözünürlükte indirin" CTA'sı** koyarak
beklentiyi yönlendirin. Buyer "okurken küçük versiyon, masaüstüne
indirince tam çözünürlük" mantığını anlar.

---

## 8. Fiyatlandırma Stratejisi

Bütün öneriler **değer-bazlı (value-based)** fiyatlandırmaya dayanır.
Maliyet-bazlı (cost-plus) ya da pazarda-ne-var-bazlı (competitor-anchored)
**değildir**.

### 8.1. Temel İlkeler

1. **Ürünün adı "200 sayfa PDF" değildir — ürünün adı "alıcının
   kazandığı sonuçtur".**
   - Yanlış: "200 sayfa, 12 bölüm, kod örnekleriyle dolu"
   - Doğru: "Bir staff engineer mülakatında 20 saatlik hazırlığı 4 saate
     indir, soruları önceden tanı."
2. **İlk fiyatı yüksek belirleyin** ($99-$300). İnerken pazarlama
   indiriminizi alıcılar bekleyebilir; çıkarken hiç kimse şikayet etmez.
3. **Üç-seviyeli paket modeli her zaman daha iyi satar:**

| Seviye | İçerik | Tipik Fiyat |
|---|---|---|
| **Solo** | Sadece PDF | $99 |
| **Toolkit** | PDF + Notion/Figma şablonu | $149 |
| **Studio** | PDF + şablon + 30-dk 1:1 görüşme | $349 |

   En çok satan genellikle **orta paket** olur (anchor effect). Studio'nun
   varlığı orta paketin "değerli" görünmesini sağlar. Solo'nun varlığı
   "uygun bütçe" alıcısını yakalar.

4. **İndirimi sadece bekleme listesine yapın.** "Launch week %20"
   herkese değil, "waitlist'tekilere ilk hafta %20" — bu, e-posta listesini
   büyütme aracına dönüşür.
5. **Para birimi:** USD birincil, Paddle çoklu para birimini halleder.
   EUR/GBP fiyatlarını manuel ayarlamayın — Paddle dönüştürme yapar.
   TRY için ayrı bir fiyat noktası belirleyebilirsiniz (Paddle multi-
   currency price tanımlamaya izin verir); Türk pazarı için $99'u
   ₺2.000 yapmak hem WTP'ye uygun hem prestij sinyali.

### 8.2. Kaçınılması Gerekenler

- **"99% indirim, sadece 24 saat" tipi sahte aciliyet** — bir kez yapıldığında
  marka değeri zarar görür. Tek-yönlü kapı.
- **Aylık indirim mailleri** — `unsubscribe` oranını uçurur, alıcı eğitimi
  bozulur.
- **Lifetime bundle ("tüm geçmiş + tüm gelecek kitaplar $99")** — gelecek
  başlığın doğal momentumunu yok eder. İlk başta cazip görünür, üçüncü
  başlıktan sonra pişman olursunuz.

### 8.3. Bir Kez Düşünülmesi Gereken: B2B "Team License"

Şirketler kitabı **takım için** almak isteyebilir. Bunun için ayrı bir
SKU yaratın:

| | Solo | Team-5 | Team-25 |
|---|---|---|---|
| Fiyat | $149 | **$499** | **$1,499** |
| Lisans | 1 kişi | 5 kişi (her birine ayrı watermark) | 25 kişi |

Bu segment otomatik kupon kodu ile uygulanabilir (Paddle destekliyor) ve
gelir potansiyelinizi 5-10x'e çıkarabilir. İlk yıl şart değil — ikinci
yılda 1-2 referans kurumsal alıcı geldikten sonra ekleyin.

---

## 9. Lansman Taktikleri — 12 Aylık Yol Haritası

Lansman bir **gün** değil, bir **süreçtir**. Kitabı yayınladığınız gün
satışların büyük kısmını **o güne kadar inşa ettiğiniz şey** belirler.

### 9.1. Ay 1-3 — Konum Seçimi ve Sezi İnşası

- **Bir tek niş seçin** (yukarıdaki 5'ten biri).
- **Bir tek Twitter/LinkedIn hesabı** üzerinden o nişte düzenli yazmaya
  başlayın (haftada 3 post). Konu **kitabın olası içeriği** olsun —
  yani küçük parçalar.
- **`/blog` rotasını kullanın.** SUB-PR 3.2'de inşa ettiğimiz blog'a
  haftada bir uzun-form yazı koyun. Bu yazılar zaman içinde kitabın
  ana bölümleri için "kaba taslak" olacak; sitemap'e otomatik düşecek.

### 9.2. Ay 3-6 — Bekleme Listesi (Waitlist)

- **E-posta listesi** açın. Beehiiv / ConvertKit / Substack — birini
  seçin. Eğer Substack'i Resend ile aynı altyapıya çekmek isterseniz
  basit bir `/api/subscribe` endpoint'i sonraki bir SUB-PR'da eklenebilir.
- Blog'a "Bekleme listesine katıl, lansman fiyatı %20" CTA'sı ekleyin.
- **Hedef:** 6. ay sonunda **500-1.500 abone**. Bu sayıyı tutturursanız
  $149'luk bir kitabın lansman haftası satışı $5-15K aralığında
  geleceğini bekleyebilirsiniz (tipik %3-7 dönüşüm).

### 9.3. Ay 6-9 — Kitabı Yazma

- **Tek başınıza yazın.** Eş-yazar koordinasyon maliyetini ilk başlıkta
  almayın.
- **Önce iskelet (TOC + her bölüm için 1 paragraf özeti)** → bekleme
  listesine e-posta gönderip geri bildirim isteyin → sonra yazmaya başlayın.
- **Düzenleme (editing) için bütçe ayırın** — kendi adınızı koymadan
  önce kitabı en az 2 kişiye okutun. Hatalı bir teknik kitap itibarınıza
  geri-alınamaz zarar verir.

### 9.4. Ay 9 — Tanıtım Stratejisi (Soft Launch)

- **10-15 saygın isme tam kopya** gönderin (filigransız, alfa nüsha).
  Onlardan 2-3 cümlelik **public quote** isteyin.
- **2-3 podcast'e konuk olun.** Kitabı *anlatın*, satmayın. Tanıdıklar
  satar; yabancılar ürkütülmeyi sevmez.
- Twitter/LinkedIn'de **kitabın bir bölümünün özetini** ücretsiz yayınlayın
  (full markdown thread). "Daha fazlası kitapta" CTA'sı.

### 9.5. Ay 10 — Hard Launch

Lansman günü için sıra:

```
Sabah 09:00 TR — Bekleme listesine launch e-postası (%20 indirimle)
Sabah 10:00 TR — Twitter/X "I shipped" post + 15-quote thread
Öğle 13:00 TR  — LinkedIn long-form post (kitabın bir bölümünü neredeyse tamamen yayınlayın)
Akşam 18:00 TR — Hacker News'e "Show HN" gönderin (uygun bir başlık seçin)
                — Reddit'in ilgili subreddit'ine (örn. r/programming, r/devops) gönderin
                — İlgili Discord/Slack topluluklarına haber verin
```

İlk hafta sonu **20-50 satış** beklemek makul. Daha az gelirse — paniklemeyin,
ay 11-12'de sürekli pazarlama ile rakam artar.

### 9.6. Ay 11-12 — Sürekli Pazarlama (Drip)

- Blog'a her hafta bir yazı eklemeye devam edin (SEO compound interest
  burada başlar).
- Her ay 1-2 podcast / panel / konferans için başvurun.
- E-posta listesine her 2 haftada bir kısa bir öğretici e-posta gönderin
  (satış için değil — sadakat için).
- 6 ay sonra **ikinci bir başlık** için aynı döngü.

---

## 10. İçerik Üretim Disiplini ve Katalog Hijyeni

Bu mimaride **birkaç çok-iyi başlık**, **çok sayıda orta başlıktan**
katalog değeri açısından daha kıymetlidir. Üç kural:

### 10.1. Kural — Yılda 1-2 Başlık

İlk yıl: 1 başlık. İkinci yıl: 2. Üçüncü yıl: 2-3.
**5-6 başlıkta** dururseniz idealdir.

Neden? Çünkü **her başlığın bağımsız bir marka inşası** vardır. 20 başlık
yayımlayan bir yayınevi olmak istemiyorsunuz — 5 başlık yayımlayan,
hepsi kategori-tanımlayan referanslar olan bir **niş otoritesi**
olmak istiyorsunuz.

### 10.2. Kural — Eski Başlığı Güncelleyin

Her yıl en az bir başlığa **küçük revizyon** (typo, güncel referanslar,
yeni bir bölüm) yapın. Mevcut alıcılara ücretsiz indirme hakkı verin
(SUB-PR 4.4 admin paneli ile yeni `masterFileKey`'i değiştirmek ve
re-watermark trigger'lamak yeterli).

Bu, "sahip olduğun yenilenir" hissi yaratır. Premium fiyat noktasındaki
müşteri için kritik.

### 10.3. Kural — Başarısız Başlığı Arşivleyin (Hard-Delete Değil)

Bir başlık 18 ayda 50 satışın altında kaldıysa **bunu hata olarak
kabul edin** — SUB-PR 4.4'teki "archive" status'üne çekin. Katalogtan
kalkar ama satın almışların kütüphanesinde kalmaya devam eder.

Marka, **vasat olduğunu kabul ettiği** yerlerde güçlenir.

---

## 11. Birinci 90 Günlük Somut Aksiyon Listesi

Bu rehberi okuyunca yapılacak şeyler — sırayla, denetlenebilir.

### Ay 1

- [ ] **Niş seç.** Yukarıdaki 5'ten birini, **tek bir cümlede** yazıp
      `memory/PAST_DECISIONS.md`'a ekle ("**Niş kararı:** ..."). Bu
      seçim 12 ay boyunca değişmez.
- [ ] **İlk başlığı seç.** Tek bir başlık. Çalışma adı yeterli.
      `books` tablosuna draft olarak ekle (admin paneli üzerinden).
- [ ] **`NEXT_PUBLIC_APP_URL`'i Vercel production ortamına bağla**
      (`vercel env add NEXT_PUBLIC_APP_URL production` → değer:
      `https://enterprise-web-site.vercel.app` ya da kendi custom
      domain'in).
- [ ] **Bir Twitter/X hesabı** kurun (eğer hâlâ yoksa) ve niş hakkında
      ilk 5 post'u atın.
- [ ] **Bir e-posta listesi platformu** seçin (Beehiiv önerilir — Resend
      ile aynı zihinsel modelde, ücretsiz başlangıç).

### Ay 2

- [ ] **Blog'a 4 yazı** ekleyin (`src/content/blog/`'a markdown koyup
      deploy etmeniz yeterli).
- [ ] **İlk 100 e-posta abonesi** hedefi (mevcut Twitter takipçilerinden
      başlayın).
- [ ] **Kitabın iskeletini** Notion ya da `.md` olarak çıkarın
      (10-15 bölüm, her birine 1 paragraf özet).
- [ ] **`paddle_price_id`** boş olan tüm kitapları kontrol edin; ilk
      başlık için **Paddle sandbox'ta** Product + Price oluşturun ve
      ID'yi `books.paddle_price_id`'ye yazın (admin edit form).

### Ay 3

- [ ] **Blog'da 8-12 yazı toplam** olmalı.
- [ ] **Abone sayısı 250-500** civarı (organik büyüme).
- [ ] **İlk başlığın ilk 3 bölümünü** yazmaya başlayın (haftada 1 bölüm).
- [ ] **Bekleme listesi sayfası** açın (basit bir landing — `/lansman`
      gibi yeni bir SSG sayfası eklemek 1 saatlik iş, blog yazısı
      pattern'i takip eder).
- [ ] **Paddle production hesabı** başvurusu yapın. Onay 1-3 hafta
      alabilir; şimdiden başlayın.

---

## 12. Kapanış

Bu altyapı bir **yayınevi** değil, bir **niş otoritesi** kurmak için
inşa edildi. Bir başlığa odaklanın, derin yazın, az satın, hızlı bir
prestij birikimi gözleyin.

**Yan gelir** ve **prestij** çoğunlukla aynı yerden gelir: tek bir
başlığa altı ay süren dikkatli çalışma. Mimari sizin için her şeyi
hazır; geri kalan zaman + odak.

İyi şanslar. 🟢

---

*Bu belge yaşayan bir doküman. Niş seçimi, fiyat noktaları, lansman
deneyimleri zamanla biraz farklı şekilleneceği için her 6 ayda bir
gözden geçirin ve gerçek satış verisiyle güncelleyin. İlk başlık
çıktıktan sonra "Aksiyon Listesi"ni yeniden tasarlamak iyi olur.*
