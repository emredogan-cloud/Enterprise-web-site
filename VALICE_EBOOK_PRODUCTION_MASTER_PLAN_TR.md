# Valice Press — E-Kitap Üretim Ana Planı

**Tarih:** 2 Eylül 2026 · **Durum:** tasarım; bu fazda kitap üretilmedi ·
**Bağlı belgeler:** `VALICE_PRESS_MASTER_ROADMAP_TR.md` (kararlar),
`PUBLISHING_FACTORY_MASTER_ARCHITECTURE.md` (boru hattı),
`PUBLIC_DOMAIN_ACQUISITION_MASTER_PLAN_TR.md` (kaynaklar), `EBOOK_STORE_FINAL.md`
(mağazanın bugünkü hali).

Kanıt etiketleri: **[V]** birincil kaynaktan doğrulandı · **[O]** canlı sistemde
gözlendi · **[A]** varsayım · **[R]** öneri · **[S]** senaryo.

---

## 1. E-kitaplar nereden geliyor — üç kaynak, üç farklı hat

| Kaynak | Bugün ne var [O] | Fabrikadaki hat | Haklar |
|---|---|---|---|
| **A · Mevcut Valice orijinalleri** (`MY-DİGİTAL-BOOK/`) | Bestiarium (EPUB 4.96 MB + 150 DPI dijital PDF 4.62 MB), Enigmatica (EPUB 46 MB, dijital PDF 8.39 MB), World Games (EPUB 0.95 MB, dijital PDF 0.58 MB), World Myths (EPUB 2.94 MB, dijital PDF 3.72 MB), Mythologica (EPUB 0.27 MB — Select kilitli), Hangul (fixed-layout EPUB 13.9 MB — satış bloke), Field Book (bilerek e-kitap yok) | Yalnızca "dijital edisyon kesimi + yükleme"; içerik bitmiş | Tamamen Valice'in; AI beyanı KDP'de yapılır |
| **B · Yeni orijinal içerik** (fabrika Lane A/B) | — | Tam boru hattı (fabrika §3, adım 5–11) | Tamamen Valice'in |
| **C · Kamu malı kaynak eserler** (Lane C) | Meditations (148 s., Long 1862, PG #15877) | Kaynak → haklar → metin → temizlik → aparat → dizgi | Metin PD; **aparat, illüstrasyon ve dizgi Valice'in** |

Kural [O, `PAST_DECISIONS.md`]: **dijital edisyon, baskı iç bloğundan ayrı bir
artefakttır.** Baskı PDF'leri 40–121 MB; filigran işçisi dosyayı belleğe alır;
`build-digital-editions.mjs` Ghostscript `/ebook` profiliyle 150 DPI kesim yapar
(108 MB → 4.6 MB). `books.master_file_key` her zaman dijital edisyonu gösterir.

---

## 2. Valice Press Dijital Edisyon Standardı (Phase 7A)

Her doğrudan satılan e-kitabın **asgari** içeriği ve müşteri hakkı:

| Bileşen | Standart | Bugün [O] | Karar |
|---|---|---|---|
| Filigranlı PDF | 150 DPI renk/gri, 300 DPI mono; her sayfada "Licensed to ‹alıcı› · Order ‹id› · Valice Press" altbilgisi + metadata | ✅ 5 başlıkta | **ZORUNLU** |
| EPUB (reflowable ya da fixed-layout) | epubcheck temiz; kapak 1600×2560; Send-to-Kindle ile okunabilir | Kindle için var, doğrudan mağazada **yok** | **Yıl 1 Q2'de ekle** — PDF'nin yanına ikinci dosya; filigran EPUB'da metadata + kolofon satırı (görünür sayfa altbilgisi mümkün değil) [R] |
| Online reader | pdf.js, sahiplik kapılı, okuma ilerlemesi | ✅ | ZORUNLU |
| Müşteri kütüphanesi + sınırsız yeniden indirme | imzalı kısa ömürlü R2 URL'leri, indirme günlüğü | ✅ | ZORUNLU |
| Gelecek güncellemeler | yeni sürüm master yüklendiğinde mevcut hak sahipleri yeni dosyayı kütüphaneden alır | kısmen (master_key v2 ile mümkün) | **Yıl 1 Q1**: "Güncellendi — v2" rozeti + e-posta |
| Companion | kitabın companion sayfası kütüphaneden bir tık uzakta | Hangul için kod var, canlıda yok | Yıl 1 Q1 |
| Bonus materyal | basılabilir ekler (tahta şablonları, çalışma sayfaları) | yok | seri bazında |
| Aranabilir metin | PDF metin katmanı korunur; reader'da arama | ✅ (pdf.js) | ZORUNLU |
| Kaynak ve çeviri beyanı (PD) | künye sayfası kaynağı, çeviriyi, çevirmeni ve yılı söyler | ✅ Meditations | ZORUNLU |

**Amazon Kindle'a karşı doğrudan edisyonun farkı ürünün kendisidir, fiyatı
değil** [O, `EBOOK_STORE_FINAL.md`]: DRM'siz, cihaz kilidi yok, süresiz, yeniden
indirilebilir, güncellenir, companion'a bağlı. Fiyat Kindle liste fiyatına eşit
tutulur (fiyat eşleme riskini önlemek için) — ancak Kindle'da olmayan PD
edisyonları için fiyat aparatın değerine göre belirlenir.

---

## 3. E-kitap kaynak boru hattı (Phase 7B)

```
SOURCE → RIGHTS → TEXT → CLEANUP → EDITORIAL → DESIGN → PDF → EPUB → WATERMARK → PREVIEW → PRODUCT → PADDLE → LIBRARY → READER
```

| Adım | Girdi | Çıktı | Sorumlu | Süre (Lane C, 150–250 s.) | Başarısızlık | Otomatik test |
|---|---|---|---|---|---|---|
| SOURCE | aday kaydı (`PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv`) | kaynak dosya (PG txt/HTML, IA `_djvu.txt` + sayfa görüntüleri) + kaynak künyesi | R6 | 0.5 h | kaynak edisyon belirsiz | künye alanları dolu |
| RIGHTS | kaynak künyesi | `rights/ledger.csv` satırı; GREEN | R6 → **Founder** | 1–3 h | YELLOW/RED | `rights-lint` |
| TEXT | kaynak | UTF-8 düz metin; bölüm işaretleri | R3 | 0.5 h (PG) · 2 h (OCR) | OCR CER > %1 örnekte | 3 rastgele sayfa insan okuması; VLM ikinci görüş diff'i [R] |
| CLEANUP | metin | PG başlık/lisans/marka kalıntısı sıfır; dipnot işaretleri; tipografik tırnak; uzun-s düzeltmesi; bölüm numaraları kanonik | R3 | 1–2 h | PG kalıntısı; bölüm sayısı kanonla uyuşmuyor (Meditations: 17·17·16·51·36·59·75·61·42·38·39·36 [O]) | `cleanup-lint` (yasaklı dizgeler, bölüm sayısı) |
| EDITORIAL | temiz metin | özgün giriş, notlar, sözlük, kronoloji, kaynak notu (aparat) + claim ledger | R3 → R4 → R5 → **Founder (Gate 5)** | 15–40 h | aparat < minimum standart | `differentiation.mjs`: özgün kelime payı ≥ %20 (minimum) / ≥ %35 (premium) [R] |
| DESIGN | metin + aparat | ReportLab dizgi şablonu (6×9, Noto Serif), plakalar/diyagramlar (vektör) | R7 | 3–8 h | dul/yetim, taşan tablolar | `preflight.py` |
| PDF | dizgi | baskı PDF (300 DPI) **ve** dijital edisyon (150 DPI) | R7 | 0.5 h | dijital > 15 MB | `build-digital-editions.mjs` boyut kapısı |
| EPUB | dizgi kaynağı | EPUB 3; epubcheck 0 hata; kapak | R7 | 1 h | epubcheck hatası | `epubcheck` |
| WATERMARK | dijital PDF | sipariş başına filigran (Inngest işçisi) | otomasyon | 7 s [O] | job failed | `watermark_jobs` alarmı [O] |
| PREVIEW | dijital PDF | 4 gerçek sayfa (`build-previews.mjs`) — aparatı gösteren sayfalar seçilir | R9 | 0.2 h | uydurma örnek | önizleme sayfaları PDF'den render |
| PRODUCT | katalog | `valice-catalog.mjs` girdisi (rights, source, pageCount, priceBasis) | R9 | 0.3 h | test kırmızı | `valice-catalog.test.ts` |
| PADDLE | ürün | `provision-paddle.mjs --commit` ile ürün + fiyat; id aynı çalıştırmadan yazılır | R9 | 0.1 h | elle kopyalanan id | dry-run listesi diff'i |
| LIBRARY | entitlement | kütüphanede görünür; yeniden indirme | otomasyon | — | pending'de kalan hak | `entitlements.status` sorgusu |
| READER | master | `/read/[bookId]` açılır | otomasyon | — | 500 | smoke test |

**Meditations'ın mevcut durumu bu boru hattına göre** [O]: SOURCE/RIGHTS/TEXT/CLEANUP/DESIGN/PDF/WATERMARK/PRODUCT/PADDLE/LIBRARY/READER ✅; **EDITORIAL aparat = yalnızca kısa önsöz + kaynak notu → minimum standardın altında**; EPUB yok. Karar: Kitap 18 (Meditations — Valice Annotated Edition) bu aparatı ekler; o zamana kadar fiyat $9.99'da kalır ama ürün sayfası "okuma edisyonu, aparat yok" demeye devam eder (dürüstlük) ve Epictetus çıkınca Stoa paketiyle birlikte satılır [R].

---

## 4. Format kararları — hangi e-kitap hangi formatta

| Seri | Doğrudan PDF | Doğrudan EPUB | Kindle | Neden |
|---|---|---|---|---|
| Codex (referans, plakalı) | ✅ 150 DPI | Yıl 1 Q2 (reflowable; plakalar sabit) | ✅ (Bestiarium, Enigmatica: var; Mythologica Select) | plakalar PDF'de daha iyi; EPUB e-okuyucu talebi için |
| The Great Book of… (genç okur, çizimli) | ✅ | Yıl 1 Q2 | ✅ | aynı |
| Field Book / workbook (yazılan kitaplar) | **hayır** (tasarım gereği) | hayır | Hangul fixed-layout var; satış yok | yazılan kitabın e-kitabı işe yaramaz [O]; companion basılabilir sayfalar bu ihtiyacı karşılar |
| Valice Classics (PD) | ✅ | ✅ (metin ağırlıklı; EPUB birincil olabilir) | yalnız etiketli ve aparatlı ise (35 %) | metin ağırlıklı PD'de EPUB doğal format |
| Puzzle (Enigmatica, Dudeney, Loyd) | ✅ | fixed-layout değerlendir | ✅ | diyagram sadakati |
| Bundle'lar | PDF+EPUB paketi (zip değil; kütüphanede ayrı başlıklar) | — | — | Paddle çoklu ürün; entitlement per kitap |

**EPUB filigranı** [R]: görünür altbilgi mümkün olmadığı için (reflowable),
kolofon sayfasına "Licensed to ‹ad› · Order ‹id›" satırı + OPF `dc:identifier`
içine sipariş id'si; PDF ile aynı Inngest adımında üretilir. Kişisel veri:
yalnızca alıcı adı + sipariş id'si (e-posta gömülmez — KVKK/GDPR amaç
sınırlaması, `BOOK_ACQUISITION_LEGAL_REPORT_TR.md` §4).

---

## 5. Fiyatlandırma ve paketler (doğrudan)

`node scripts/strategy/price-engine.mjs --format ebook --channel direct` [V hesap]:

| Liste | Net (Paddle 5 % + $0.50) | Marj |
|---:|---:|---:|
| $6.99 | $6.14 | 87.8 % |
| $8.99 | $8.04 | 89.4 % |
| $9.99 | $8.99 | 90.0 % |
| $12.99 | $11.84 | 91.2 % |
| $14.99 | $13.74 | 91.7 % |

Kurallar [R]: orijinal referans $11.99–12.99; orijinal genç okur $6.99–9.99;
PD annotated $7.99–9.99 (premium aparatlı $12.99); bundle = toplamın %70–75'i,
en az 3 başlık. İlk paketler: **The Stoic Library** (Meditations + Epictetus →
Seneca) $14.99 → $19.99 üç kitapta; **World Play** (World Games + Falkener)
$19.99; **The Codex Shelf** (Bestiarium + Enigmatica + Mythologica *Select
bittiğinde*) $29.99.

Paddle'da paket = tek ürün, tek fiyat; karşılama her kitap için ayrı entitlement
üretir (kod değişikliği: `order_items` çoklu kitap → mevcut şema destekliyor
[O `orders`/`order_items`]).

---

## 6. Kapasite ve takvim

| | Ay/adet | Saat/adet (ajan) | Founder |
|---|---|---|---|
| A · mevcut orijinallerin EPUB'larını doğrudan mağazaya eklemek | 5 başlık, tek seferlik (Q2) | 1–2 | 0.5 |
| B · yeni orijinal (fabrikadan gelen) | 3–4 | fabrika saati içinde | fabrika kapıları |
| C · PD edisyonu | 1–2 | 30–60 | 5–8 |

İlk 12 ayda doğrudan mağazaya eklenecek dijital ürün: **~28 başlık + 3 paket**
[S, roadmap §25]. Depolama: R2 sıfır çıkış maliyeti [V], 150 DPI edisyonlar
0.5–15 MB → 100 başlık < 1 GB.

---

## 7. Kalite kapıları (e-kitaba özgü ekler)

| Kapı | E-kitap kontrolü | Araç |
|---|---|---|
| 8 İç blok | dijital edisyonda plakalar okunaklı (150 DPI örnek sayfa inceleme); metin katmanı aranabilir; sayfa sayısı katalogla eşit | `pdfinfo`, örnek render |
| 9 Metadata | PDF Title/Author/Producer dolu (Field Book'un `untitled/anonymous` hatası [O] bir daha olmasın) | `pdf-meta-lint` |
| 11 Web ürün | master R2'de; `books.master_file_key` dolu; Paddle fiyat id gerçek; önizleme 4 sayfa; kapak webp | `validate:catalog` |
| 12 Onay | `websiteStatus: "published"` diff'i | loader |

---

## 8. Phase 32 kapı yapısı — E-kitap üretimi

| Alan | İçerik |
|---|---|
| Amaç | Her onaylı başlık için doğrudan satılabilir, filigranlı, kütüphaneye bağlı bir dijital edisyon; PD hattı için aparatlı edisyon |
| Girdiler | fabrika çıktısı (final metin/dizgi) veya PD kaynak; haklar kaydı; Paddle hesabı; R2 |
| Çıktılar | dijital PDF (+EPUB), önizleme, katalog satırı, Paddle fiyatı, companion bağlantısı |
| Bağımlılıklar | P0 alan adı/webhook düzeltmesi (aksi hâlde satın alma karşılanmaz); Paddle `ebooks` vergi kategorisi (KDV doğru tahsil için) |
| Ajanlar | R3/R4/R5 (aparat), R7 (dizgi/EPUB), R9 (ürün) |
| İnsan kontrol noktaları | Gate 2 haklar, Gate 5 olgu, Gate 12 yayın |
| Süre | orijinal: 2 saat/başlık (dijital kesim + ürün); PD: 4–6 hafta/başlık |
| Başarı | satın alma → 60 s içinde kütüphanede; epubcheck 0; `validate:catalog` yeşil; PD aparatı ≥ minimum standart |
| Başarısızlık | pending'de kalan entitlement; uydurma önizleme; PD çıplak yeniden basım |
| KPI | doğrudan e-kitap adet/ay, AOV, yeniden indirme sayısı, iade oranı, PD edisyon özgün payı |
| Sonraki faz | Phase 9 (UI/katalog yayını) ve Phase 15 (doğrudan değer önerisi) |

---

## 9. Founder aksiyonları (bu belgeye özgü)

1. Paddle `ebooks` vergi kategorisini destek talebiyle açtırın (`tax_category` hesapta etkin olmalı [V]); açılınca ürünler yeniden kategorilenir.
2. Meditations için karar: aparat eklenene kadar $9.99 mu, $6.99 mu? Öneri: **$9.99 kalsın, Epictetus ile paket** [R].
3. EPUB'ın doğrudan mağazaya eklenmesini onaylayın (Q2 işi; ~10 saat geliştirme: kütüphanede ikinci dosya, EPUB filigran adımı).
4. Hangul e-kitabının satılıp satılmayacağı hak kararına bağlı (Kitap 01).
