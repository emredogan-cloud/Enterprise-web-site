# Katalog Yaşam Döngüsü ve Bakım Otomasyonu

**Tarih:** 2 Eylül 2026 · **Durum:** tasarım · Phase 18, 20, 21, 22, 23 ve 24'ü
kapsar. Kararlar `VALICE_PRESS_MASTER_ROADMAP_TR.md`'de kilitlidir.

Kanıt etiketleri: **[V]** birincil kaynak · **[O]** canlı sistemde gözlendi ·
**[A]** varsayım · **[R]** öneri · **[S]** senaryo.

---

## 1. Neden bakım, üretimden önce tasarlanır

Yayın bir akış, bakım bir stoktur [O, `PUBLISHING_FACTORY_ARCHITECTURE.md`].
Başlık başına ayda ~0.5 saat bakım varsayımıyla [A]:

| Canlı başlık-format kaydı | Aylık bakım | Founder'ın ayı |
|---:|---:|---|
| 22 (bugün) | 11 h | fark edilmez |
| 60 (Yıl 1 sonu, 5/ay) | 30 h | üretimle yarışır |
| 110 (Yıl 1 sonu, kayıt bazında) | 55 h | **üretimi durdurur** |
| 275 (Yıl 2) | 137 h | imkânsız |
| 550 (Yıl 3) | 275 h | — |

Sonuç: **0.5 saat/başlık/ay elle bakımla Yıl 2 yoktur.** Bu belge bakımı 30
kayıtta 0.5'ten 250 kayıtta ~0.05 saate düşüren otomasyonu tanımlar; kalan
elle iş yalnızca karar (fiyat, reklam, arşiv) olur.

---

## 2. Yaşam döngüsü (Phase 18)

```
IDEA → VALIDATE → PRODUCE → LAUNCH → OPTIMIZE → SCALE → UPDATE → BUNDLE → ARCHIVE
```

| Aşama | Giriş ölçütü | Çıkış ölçütü | Süre | Kim |
|---|---|---|---|---|
| IDEA | seri bible'da yer var | `IDEA.md` | 1 gün | R1 |
| VALIDATE | Gate 1–2 | go/no-go | 1 hafta | R1/R6 + Founder |
| PRODUCE | spec onaylı | Gate 12 | 3–14 hafta (lane'e göre) | fabrika |
| LAUNCH | KDP live / site live | 7-gün kontrolü | 1 hafta | R9 + Founder |
| OPTIMIZE | 30-gün verisi | fiyat/metadata/A+ kararları uygulandı | 30–90 gün | Founder |
| SCALE | 90-gün: winner | reklam ALWAYS-ON, format merdiveni tam, seri devamı planlandı | sürekli | Founder |
| UPDATE | hata/eskime/yeni edisyon | v2 yüklendi; dijital sahiplere bildirildi | 1–2 hafta | R7/R9 |
| BUNDLE | ≥ 3 tutarlı başlık | Paddle paket ürünü | 1 gün | R9 |
| ARCHIVE | 2 çeyrek "weak"/"obsolete" | `websiteStatus: "archived"`; KDP'de düşük fiyat/unpublish kararı; companion sayfası **kalır** | çeyrek | Founder |

**Sınıflandırma** (çeyreklik, gerçek KDP raporu + doğrudan siparişlerle) [R]:

| Sınıf | Ölçüt (ay ortalaması, tüm formatlar) | Eylem |
|---|---|---|
| **Winner** | ≥ 30 adet/ay veya ≥ $250 katkı/ay | reklam ALWAYS-ON adayı; merdiven tam; seri devamı; A+ güncelle |
| **Average** | 5–29 adet | fiyat testi; metadata yenile; companion güçlendir; reklam TEST |
| **Weak** | 1–4 adet, ≥ 2 çeyrek | reklam yok; fiyat düşürme testi; 2. çeyrek sonunda ARCHIVE adayı |
| **Obsolete** | 0 adet 2 çeyrek veya içerik eskidi/politika riski | ARCHIVE; yeniden kullanılabilir içerik başka başlığa |

İlk sınıflandırma **veri yokken yapılamaz**: bugün 1 sipariş, 0 yorum, KDP
raporu dışa aktarılmamış [O]. İlk çeyrek raporu Aralık 2026'da (Phase 16
ölçümü kurulduktan 90 gün sonra).

---

## 3. Bakım otomasyonu eşikleri (Phase 20)

Her eşikte **neyin otomatik olması gerektiği**, aksi hâlde nerede kırılacağı:

| Kayıt | Otomatikleşmesi gereken | Araç | Aksi hâlde |
|---:|---|---|---|
| **30** | katalog bütünlüğü testleri (var: 18 test); ASIN 200 kontrolü; fiyat tutarlılığı (DB ↔ Paddle ↔ Amazon liste) ; kapak/master/önizleme varlığı; sitemap kapsama | `npm run validate:catalog` (yeni, aşağıda) haftalık GitHub Actions | ölü Amazon linki, "$0.00" hataları [O geçmiş] |
| **60** | SEO metadata lint (title uzunluğu, description, JSON-LD geçerliliği, Offer yalnız price>0); ilgili kitaplar otomatik (seri → kategori → yazar); duplicate detection (başlık/alt başlık/slug) | `validate:seo` (CoachScore kalıbı) CI | ince içerik, kopya sayfalar |
| **100** | KDP raporu içe aktarma + başlık P&L; reklam CSV arşivi (60–95 gün saklama [V]); e-posta etiket senkronu; stale ürün raporu (90 gün sıfır satış) | `scripts/analytics/*.mjs` aylık | veri kaybı, kör kararlar |
| **180** | fiyat testi takvimi ve otomatik hatırlatma; A+ ve metadata "son güncelleme" yaşı; companion rotası uptime izleme; QR çözülebilirlik testi (basılı adres listesi) | Vercel cron + Inngest | eskimiş listeler |
| **250** | Amazon liste fiyatı çekme (sayfa scrape değil — KDP raporundan) ve DB güncelleme; ISBN/ASIN/edisyon tablosu; otomatik arşiv adayları | aylık job | yanlış fiyat gösterimi |
| **500** | `/admin/metrics` panosu; seri sayfaları otomatik; katalog dosyasının bölünmesi (`valice-catalog/` dizini, seri başına dosya) ; loader'ın kısmi yükleme desteği | kod | 35 KB tek dosya yönetilemez |
| **1000** | veritabanı tabanlı katalog editörü (admin) + diff/onay akışı; DAM (asset registry tablosu); çoklu pazar fiyat matrisi | kod | — |

**İlk yapılacak script — `scripts/catalog/validate-catalog.mjs`** [R]:

```
--env scripts/tmp/.env.production   (varsayılan: yerel)
1. valice-catalog.mjs → test suite (mevcut)
2. her kdp:"live" format için amazon.com/dp/ASIN → HTTP 200 (HEAD/GET, 1 rps)
3. Paddle: her direct format için pri_ id var ve aktif (API)
4. R2: her direct format için master_file_key nesnesi var, boyut < 20 MB
5. public/images/books/<slug>.webp var, ≥ 1200 px yükseklik
6. önizleme sayfaları var (public/images/previews/<slug>/)
7. production: /books/<slug> 200; JSON-LD parse; Offer ⇔ price>0
8. sitemap.xml her published slug'ı içeriyor; companion rotaları 200
9. fiyat tutarlılığı: DB price_cents == catalog priceCents == Paddle unit_price
çıktı: tablo + sıfır olmayan çıkış kodu; GitHub Actions haftalık + her deploy
```

---

## 4. Operasyon ve Founder rolü (Phase 21)

| Founder'a ait (devredilmez) | AI/otomasyona ait |
|---|---|
| strateji ve seri kararları; niş onayı | pazar taraması, anahtar kelime, rakip örnekleme |
| haklar onayı (Gate 2) | haklar kaydı hazırlığı, kanıt toplama |
| olgu doğrulama imzası (Gate 5) | taslak, çapraz doğrulama, claim ledger |
| kapak onayı (Gate 7) | kapak brief'i, prompt, görsel QA |
| KDP politika beyanı (Gate 10) — AI beyanı dahil | uyumluluk kontrol listesi |
| yayın onayı (Gate 12) | katalog satırı, Paddle, R2, önizleme |
| fiyat kararı | fiyat motoru çıktısı, test takvimi |
| reklam bütçesi ve kill/scale kararı | rapor içe aktarma, ACOS hesabı, öneri |
| çeyreklik arşiv kararı | sınıflandırma raporu |

**Founder saat bütçesi** [A]: Yıl 1'de aylık ~45–60 saat (kapılar 18–25, yükleme
8, bakım kararları 6–10, strateji 8). Bakım otomasyonu olmadan Yıl 2'de 90+.

---

## 5. Hukuk / haklar / politika sistemi (Phase 22)

Her kitap için tek satır **rights ledger** (`valice-house/rights/ledger.csv`) ve
katalog dosyasında `rights` bloğu [R]; `valice-catalog.test.ts`'e iki test:
PD kitaplarda `rights.evidence` zorunlu; `kdpSelect: true` ise `directSale:
false` (var).

| Alan | Örnek (Meditations) |
|---|---|
| `source` | Project Gutenberg #15877 (düz metin) |
| `edition` | George Long, *Thoughts of Marcus Aurelius Antoninus*, 1862 |
| `translator` / `translationYear` / `translatorDeath` | George Long / 1862 / 1879 |
| `jurisdictions` | US: PD (1862 yayını); life+70: 1949'da doldu |
| `thirdPartyAssets` | yok (PG başlık/lisans çıkarıldı) |
| `licenses` | — |
| `restrictions` | PG markası kullanılmaz |
| `aiDisclosure` | metin: hayır; kapak: **kaydedilmeli** |
| `evidence` | PG sayfası URL; MEDITATIONS_EDITION_SOURCE_REPORT_TR.md |
| `status` / `approver` / `date` | GREEN / Founder / 2026-06-01 |

Takip edilen politikalar: KDP içerik kuralları (AI beyanı, PD farklılaştırma,
bonus content, hyperlink), KDP Select münhasırlığı, Paddle içerik politikası,
CC lisansları (NC/ND yasak; SA türev lisansı sorunu — Hangul S-0017/18 [O]),
Türkiye FSEK hayat+70 ve bandrol belirsizliği (dijital) [O
`BOOK_ACQUISITION_LEGAL_REPORT_TR.md`], ABD Telif Ofisi'nin AI görsellerine
telif vermemesi (kapaklar korunamaz — marka/dizgi ile savunulur) [A: rapor Ocak
2025; güncel kontrol gerekli].

**Hangul (S-0017/18 CC BY-SA, S-0019 CC BY-NC) için yol** [R]: 97 kelimeyi ve
glosslarını bu kaynaklardan bağımsız yeniden türet (kelime listeleri olgu; gloss
metinleri özgün yazılır; kaynak olarak TOPIK I resmî kelime listesi gibi kamu
listeleri **atıfla** kullanılır — lisansı Founder doğrular), S-0017/18/19'u
kaynak listesinden sil, provenans sayfasını güncelle, KDP'de yeniden yükle. Bu
bir hukuki görüş değildir; Founder kararıdır.

---

## 6. Kalite güvence sistemi (Phase 23)

| Otomatik | Araç | Nerede |
|---|---|---|
| dosya bütünlüğü (PDF açılıyor, sayfa sayısı, font gömme, glif kapsamı) | `preflight.py` (kitap repo) | Gate 8 |
| EPUB | `epubcheck` | Gate 8 |
| metadata (PDF Title/Author; alt başlık sayıları = ölçülen) | `metadata-lint` | Gate 9 |
| linkler ve basılı adresler | `validate:catalog` adım 7–8 | haftalık |
| görsel boyutları/DPI/renk uzayı | `cover-check.mjs` | Gate 7 |
| duplicate content | `similarity.mjs` | Gate 3 |
| eksik alanlar / fiyat / ASIN / SEO / rota / ürün erişilebilirliği | `valice-catalog.test.ts` + `validate:catalog` + `validate:seo` | CI |

| İnsan | Kim | Ne zaman |
|---|---|---|
| editoryal kalite | R5 + Founder okuması (Lane B tam; Lane A örnek bölüm) | Gate 6 |
| olgusal doğruluk | Founder imzası | Gate 5 |
| kapak | Founder | Gate 7 |
| okur değeri (pilot) | 1 gerçek kullanıcı (workbook) / 3 çözücü (puzzle) / 3 okur (flagship) | Gate 4 |
| haklar | Founder | Gate 2 |
| yayın | Founder | Gate 12 |

Kural [O]: ölçülmeyen kapı "geçti" olarak kaydedilmez; override, override
olarak kalır.

---

## 7. Lansman sistemi (Phase 24)

```
BOOK READY → WEBSITE READY → AMAZON READY → COMPANION READY → EMAIL READY → ANALYTICS READY → ADS READY → LAUNCH → 7-DAY → 30-DAY → 90-DAY
```

| Adım | Kontrol listesi (hepsi test edilebilir) |
|---|---|
| BOOK READY | Gate 12 imzası; `.gate = release`; proof onayı (yeni şablon ise) |
| WEBSITE READY | katalog satırı; kapak webp; master R2; Paddle fiyat; önizleme; `validate:catalog` yeşil; seri sayfası güncel |
| AMAZON READY | KDP live; ASIN 200; A+ yüklendi; Author Central'da claim; Look Inside aktif; fiyat bandı içinde |
| COMPANION READY | rota 200; QR çözüldü; varlıklar indiriliyor; `source` etiketi allow-list'te |
| EMAIL READY | new-release broadcast taslağı; companion dizisi aktif; DMARC/SPF/DKIM yeşil |
| ANALYTICS READY | `view_item`/`begin_checkout`/`purchase` event'leri; Amazon Attribution etiketi "Buy on Amazon" linkinde; GSC sitemap gönderildi; KDP rapor takvimi |
| ADS READY | portföy + 2 kampanya taslağı (auto + exact), günlük $10, negatif liste; başabaş ACOS hesaplandı |
| LAUNCH | broadcast gönder; ads başlat; IndexNow ping |
| 7-DAY | Amazon listeleme hatası taraması; ads impressions > 0; companion ziyaret > 0; sipariş/hak eşleşmesi |
| 30-DAY | fiyat testi kararı; ACOS; keyword harvest; yorum sayısı; ilk sınıflandırma taslağı |
| 90-DAY | winner/average/weak; merdiven tamamlama; seri devamı; arşiv adayı |

---

## 8. Phase 32 kapı yapısı — Bakım

| Alan | İçerik |
|---|---|
| Amaç | Katalog büyürken Founder'ın bakım saatinin sabit kalması |
| Girdiler | mevcut testler; Paddle/R2/Amazon erişimi; KDP raporları; Vercel cron |
| Çıktılar | `validate:catalog`, `validate:seo`, `import-kdp.mjs`, `title-pnl.mjs`, lifecycle raporu |
| Bağımlılıklar | Phase 16 analitik |
| Ajanlar | R9 |
| İnsan kontrol noktaları | çeyreklik sınıflandırma ve arşiv kararı (Founder) |
| Süre | 30-kayıt paketi 1 hafta (Ay 1); 100-kayıt paketi 2 hafta (Ay 4–5) |
| Başarı | haftalık CI yeşil; bakım ≤ 10 h/ay 100 kayıtta; sıfır ölü Amazon linki; sıfır fiyat tutarsızlığı |
| Başarısızlık | elle SQL ile yayın/fiyat değişikliği; ölçülmemiş kapı "geçti" |
| KPI | bakım saati/ay; validate hataları; stale ürün sayısı; arşivlenen zayıf başlık |
| Sonraki faz | Phase 19 ölçekleme |
