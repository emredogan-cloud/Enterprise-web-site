# Faz 1 — Uygulama Tamamlama Raporu

**Tarih:** 1 Eylül 2026 · **Kapsam:** yalnızca UYGULAMA (Mode A)
**Araştırma çıktısı ayrı belgededir:** `docs/VALICE_PRESS_COMMERCE_AND_VISIBILITY_RESEARCH_TR.html`

> Bu rapor yalnızca **gerçekten yapılan** işi listeler. Doğrulanmamış hiçbir
> şey "tamamlandı" olarak işaretlenmemiştir; harici bloklayıcılar §9'da
> açıkça ayrılmıştır.

---

## 0. En önemli iki bulgu — okumadan devam etmeyin

### 🔴 BLOKLAYICI 1 — `valicepress.com` kayıtlı değil

```
valicepress.com  →  DNS'te çözümlenmiyor
vercel domains inspect valicepress.com  →  Domain not found
Canlı üretim sitesi  →  https://enterprise-web-site.vercel.app  (HTTP 200)
```

Strateji boyunca "valicepress.com" yazıyor. **Böyle bir alan adı yok.** Site,
eski proje adını taşıyan bir `.vercel.app` alt alan adında yayında.

Bu, companion köprüsünün tamamını bloke eder: **basılı bir kitaba kalıcı olarak
basılan bir QR kodu, sahibi olmadığınız bir alan adına işaret edemez.** Bir
`.vercel.app` adresi kiralanmıştır, sahiplenilmemiştir — ve kitaptaki kod
silinemez.

**Maliyet: yıllık $11.25.** Kontrol edildi ve müsait (Vercel Domains,
2026-09-01). `valicepress.net` $13.50, `valice.press` $66.07 — hepsi müsait.

**Bu satın alma yapılmadı** (para harcayan, dışa dönük bir işlem). Founder'ın
tek tıklık kararı: <https://vercel.com/domains/search?q=valicepress.com>

### 🔴 BLOKLAYICI 2 — Hangul kitabı hukuken satılamaz durumda ve KDP incelemesinde

Katalogdaki kendi kaydı: `directSaleBlockedBy` →

> "LEGAL, UNRESOLVED: a CC BY-NC licensed dictionary source (A7/S-0019) is used
> in a commercial book. Non-commercial licensing is incompatible with selling
> this title in ANY channel."

Ve aynı anda: paperback + hardcover **`kdp: "in_review"`** — yani soru
açıkken KDP incelemesinde. İnceleme geçerse kitap, lisans sorusu çözülmeden
satışa çıkar.

**Founder aksiyonu (acil):** ya CC BY-NC kaynağı temizleyin/değiştirin, ya da
KDP gönderimlerini geri çekin. Bu, bu fazda çözülemeyecek tek kritik iştir.

---

## 1. Fiyat değişiklikleri

**Hiçbir fiyat değiştirilmedi.** Brief açıkça "otomatik olarak 12.99'a taşıma,
değerlendirme olarak hazırla" dedi. Hazırlanan analiz:

| Başlık | Kanal | Mevcut | Net | Öneri | Yeni net | Başabaş hacim |
|---|---|---:|---:|---:|---:|---:|
| The Great Book of World Myths | direct | $4.99 | $4.24 | **$6.99** | $6.14 | mevcut hacmin **%69**'u |
| Codex Mythologica | amazon | $4.99 | $3.04 | **$6.99** | $4.44 | mevcut hacmin **%68**'i |

**Öneri: $9.99 değil, önce $6.99.** $6.99'da başlık hâlâ dürtüsel alım
aralığında ve yalnızca hacmin ~%69'unu koruması yeterli. 30 gün tutun, hacim
korunursa $9.99'a çıkın.

Tam tablo ve $9.99/$12.99 senaryoları: `CATALOG_ECONOMICS_FINAL.md` §4.

---

## 2. Format kayıtları

**Hiçbir format eklenmedi.** Bunun yerine gerçek ekonomiyle ölçülüp
önceliklendirildi (`FORMAT_LADDER_MATRIX.csv`):

| Kitap | Eksik format | Net/birim | Karar |
|---|---|---:|---|
| The Great Book of World Games | large print | **$12.86** | **EVET** |
| Codex Enigmatica | large print | $7.03 | **EVET** |
| The Myth Hunter's Field Book | large print | $6.50 | **EVET** |
| Korean Hangul Workbook | large print | $5.83 | TEST |
| The Myth Hunter's Field Book | hardcover | $5.19 | TEST |
| The Great Book of World Myths | large print | $4.17 | TEST |

**World Games large print, $12.86 ile kataloğun en yüksek katkılı baskı birimi
olurdu** — mevcut hiçbir kitabın hiçbir formatından yüksek.

Format eklemek yeni bir iç blok dizgisi ve KDP yüklemesi gerektirir; bu bir
üretim işidir ve bu faz "yeni kitap üretme" dedi. Sıradaki fazın ilk işi.

---

## 3. Baskı mürekkep değişiklikleri

**Değişiklik gerekmedi — ve bu, Faz 0'ın bir uyarısının düzeltilmesidir.**

Faz 0, premium renk marj tuzağını "en acil aksiyon" olarak işaretlemişti.
Denetim yapıldı: **katalogda premium renk yok.** Yedi baskı başlığının tamamı
siyah mürekkep, kaynak proje dosyalarından doğrulandı:

| Başlık | Kanıt |
|---|---|
| Codex Mythologica | `CASE_LAMINATE_6.000x9.000_329_BW_CREAM_en_US` (KDP kapak şablonu dosya adı) |
| Codex Bestiarium | `book.json` → "black and white"; `plates.yml` → "black ink" |
| Codex Enigmatica | `project_config.json` → `ink:"black"`, `trimClass:"regular"` |
| World Myths | `colorMode:"bw"`; 432×648pt = 6×9in |
| World Games | `ink:"black"`, `trimClass:"large"` |
| Myth Hunter's Field Book | `ink:"black"`, `trimClass:"large"` |
| Korean Hangul | 8.5×11in (large trim), BW |

Risk gerçekti ve doğru teşhis edilmişti; sadece zaten kaçınılmıştı.
Gate 8 mürekkep kontrolü gelecek başlıklar için korunmalı.

---

## 4. Companion sayfası — İNŞA EDİLDİ VE DOĞRULANDI ✅

Bu fazın gerçek uygulama çıktısı.

### Ne inşa edildi

| Dosya | İş |
|---|---|
| `src/lib/companions.ts` | Companion kayıt defteri, yaşam döngüsü durumu, haklar notu |
| `src/lib/companion-sheets.ts` | pdf-lib ile üretilen yazdırılabilir sayfalar |
| `src/app/companion/[slug]/page.tsx` | SSG companion sayfası |
| `src/app/companion/[slug]/sheets/[sheet]/route.ts` | PDF servis rotası |
| `src/components/companion/companion-signup.tsx` | Opsiyonel e-posta formu |
| `src/lib/companions.test.ts` | 13 test |

### Tasarımı belirleyen kural

> **Basılı bir QR kodu kalıcıdır. Companion rotası asla 404 vermemeli ve asla
> kitabın satışta olmasına bağlı olmamalıdır.**

Sayfa veritabanına hiç dokunmaz — sabitten render edilir. Kitap yayında olsun,
incelemede olsun, geri çekilmiş olsun sayfa çalışır. Değişen tek şey ne
söylediğidir, var olup olmadığı değil.

### İçerik — üç gerçek, üretilmiş PDF

| Sayfa | Doğrulanan |
|---|---|
| Hangul practice grid (원고지 tarzı) | 4 sayfa, 12.604 B |
| Stroke-order practice boxes | 2 sayfa, 14.859 B |
| Thirty-lesson progress tracker | 1 sayfa, 2.901 B |

**Hepsi kendi geometrimiz.** Üçüncü taraf hak yok, font lisansı yok, CC BY-NC
kaynağından hiçbir şey yok. Bu bilinçli: **kitabın hukuki sorunu companion'ı
bloke etmiyor**, çünkü companion o kaynaktan bağımsız inşa edildi. Kelime
listesi yok — ve bir test bunu kalıcı olarak zorunlu kılıyor
(`ships no vocabulary/dictionary-derived asset for hangul`).

### KDP politika uyumu

`01_REPORTS/KDP_WEBSITE_POLICY_RESEARCH.md`'deki doğrulanmış kural: KDP
Hyperlink Guidelines, kitap içinden **"müşteri bilgisi isteyen web
formlarına"** bağlantıyı yasaklar.

Companion sayfası bu belgenin önerdiği güvenli kalıba göre yapılandırıldı:
**önce fayda (ücretsiz indirmeler), sonra opsiyonel e-posta.** İndirmeler
hiçbir şekilde e-postaya bağlı değil — abone olmasanız da çalışırlar.

Sayfa ayrıca açıkça şunu yazıyor: *"We only ever get your address because you
typed it here. Amazon does not share customer details with publishers."*

### Uçtan uca doğrulama (çalıştırıldı, iddia edilmedi)

```
/companion/hangul                          HTTP 200
  içerik: "Free companion", "Practice material", "not on sale yet",
          "Hangul practice grid", "Thirty-lesson", "Keep me posted"
/companion/hangul/sheets/practice-grid.pdf   HTTP 200  application/pdf  4 sayfa
/companion/hangul/sheets/stroke-boxes.pdf    HTTP 200  application/pdf  2 sayfa
/companion/hangul/sheets/lesson-tracker.pdf  HTTP 200  application/pdf  1 sayfa
/companion/hangul/sheets/evil.pdf            HTTP 404  ✅
/companion/nope                              HTTP 404  ✅
```

Build çıktısı: `● /companion/[slug]` → `/companion/hangul` (SSG, önceden render).

---

## 5. E-posta entegrasyonu

| İş | Durum |
|---|---|
| `hangul-companion` kaynağı `NewsletterSource` union'ına eklendi | ✅ |
| `/api/newsletter` allow-list'ine eklendi | ✅ |
| Endpoint yeni kaynağı kabul ediyor | ✅ doğrulandı |

```
POST /api/newsletter {"email":"probe@example.com","source":"hangul-companion"}
  → HTTP 503 provider-unavailable   ← doğrulamayı GEÇTİ, sağlayıcıda durdu
POST /api/newsletter {"email":"nope","source":"hangul-companion"}
  → HTTP 400 invalid-email          ← kontrol testi
```

503, yerel ortamda `RESEND_API_KEY` olmamasından kaynaklanıyor (§9). Kaynak
etiketi doğrulamadan geçti — istenen şey buydu.

**Tek master liste korundu.** Ayrı liste açılmadı: ikinci bir liste ikinci bir
abonelikten çıkma yüzeyidir.

**Otomatik akışlar (welcome / post-purchase / series) kurulmadı.** Resend
kimlik bilgileri yerelde okunamadığı için akış tanımlamak, doğrulanamayacak
bir şey inşa etmek olurdu. §9'da bloklayıcı olarak listelendi.

---

## 6. Veritabanı değişiklikleri

**Yok.** Şema değişmedi, migration üretilmedi, hiçbir satır yazılmadı.
Companion katmanı bilinçli olarak veritabanından bağımsızdır (§4).

Veritabanı yalnızca **okundu** (ekonomi analizi için).

---

## 7. Doküman arşivi

| | |
|---|---|
| Sınıflandırılan belge | 62 |
| Taşınan | 28 (1 CONFLICTING, 5 SUPERSEDED, 22 HISTORICAL) |
| Silinen | **0** |
| Kök dizin belge sayısı | 38 → **19** |
| Üretilen dizin | `RULE_SET_INDEX.md` |

Detay: `ARCHIVED_RULESETS_AND_OLD_REPORTS_TR.md`

---

## 8. Testler ve QA

| Kontrol | Sonuç |
|---|---|
| `npm run lint` | ✅ temiz |
| `npx tsc --noEmit` | ✅ temiz |
| `npm test` | ✅ **143 test / 12 dosya** (companion için +13) |
| `npm run build` | ✅ başarılı |
| Companion sayfası | ✅ HTTP 200, içerik doğrulandı |
| 3 PDF rotası | ✅ HTTP 200, geçerli PDF, sayfa sayıları doğru |
| Negatif rotalar | ✅ 404 |
| Newsletter yeni kaynak | ✅ doğrulamadan geçiyor |
| Paddle (canlı, dry-run) | ✅ LIVE, webhook `subscribed=4 missing=0`, 5 ürün+fiyat |
| Veritabanı | ✅ 8 kitap / 22 format okundu |

### Doğrulanmayanlar — açıkça

| | Neden |
|---|---|
| **Mobil viewport** | Gerçek cihaz/viewport testi yapılmadı. **Doğrulandı diye iddia edilmiyor.** |
| Checkout / Paddle ödeme akışı | Gerçek ödeme gerektirir |
| Watermark / Inngest / R2 fulfillment | `INNGEST_*` ve `R2_*` sırları yerelde okunamıyor (§9) |
| Welcome e-postası gönderimi | `RESEND_API_KEY` okunamıyor (§9) |
| Refund / revoke | Gerçek sipariş gerektirir (üretimde 1 sipariş var) |
| Library / reader | Kimlik doğrulamalı oturum gerektirir |

---

## 9. Harici bloklayıcılar

### 9.1 Vercel "Sensitive" env değişkenleri yerelde okunamıyor

`vercel env pull` bunları `[SENSITIVE]` olarak indiriyor:

```
RESEND_API_KEY · RESEND_AUDIENCE_ID · EMAIL_FROM
INNGEST_EVENT_KEY · INNGEST_SIGNING_KEY · PADDLE_WEBHOOK_SECRET
ADMIN_EMAILS · NEXT_PUBLIC_APP_URL · CODEX_VERIFY_*
```

Bu, Resend/Inngest/R2'nin **kullanarak doğrulanmasını yerelde imkânsız
kılıyor** — CLAUDE.md'nin "varlık kontrolü yalan söyler" kuralı gereği
bunları "yapılandırılmış" olarak işaretlemiyorum. Yalnızca Vercel'de
**tanımlı** olduklarını gördüm.

**Founder aksiyonu (isteğe bağlı):** doğrulama için anahtarları yerel
`.env.local`'a koyun, ya da bu doğrulamaları bir preview deployment üzerinde
çalıştırın.

### 9.2 Paddle fiyat değişikliği manuel

Paddle fiyatları yerinde düzenlenmez. World Myths $4.99 → $6.99 için:

1. Paddle Dashboard → Catalog → `pro_01m1btjd7575dkfsff00zfvfjc` (World Myths)
2. Yeni Price oluştur: $6.99 USD, one-time
3. Yeni `pri_…` id'sini `scripts/catalog/valice-catalog.mjs` → `paddlePriceId`
4. `node scripts/catalog/load-catalog.mjs` ile uygula
5. Eski fiyatı arşivle (silme — mevcut siparişler ona referans verir)

### 9.3 KDP manuel işlemler

| İş | Nerede |
|---|---|
| Codex Mythologica Kindle $4.99 → $6.99 | KDP Bookshelf → fiyat düzenle |
| Hangul gönderimlerini geri çek **veya** lisansı temizle | KDP Bookshelf (ACİL) |
| World Games large print edisyonu | Yeni başlık + iç blok dizgisi |
| AI beyanı — her yeni gönderimde | KDP yükleme akışı |

### 9.4 Domain

`valicepress.com` satın alınmalı — §0.

---

## 10. Kalan Founder kararları

| # | Karar | Neden Founder'ın |
|---|---|---|
| 1 | `valicepress.com` satın al ($11.25/yıl) | Para harcar; companion/QR stratejisini bloke ediyor |
| 2 | Hangul CC BY-NC: temizle mi, geri çek mi? | Hukuki risk kabulü |
| 3 | Fiyat testini onayla ($6.99) | Ticari karar; geri alınabilir ama görünür |
| 4 | World Games large print üretimini onayla | Üretim kapasitesi tahsisi |
| 5 | Bestiarium large print'i $29.99 → ~$34.99 yeniden fiyatla | 599 sayfada %22.7 marj çok ince |
| 6 | Companion sayfası canlıya çıksın mı? | Kod hazır; kitap satışta değil. `state` alanı tek satırlık değişiklik. |

---

## 11. Değişen dosyalar

**Yeni**
```
src/lib/companions.ts
src/lib/companion-sheets.ts
src/lib/companions.test.ts
src/app/companion/[slug]/page.tsx
src/app/companion/[slug]/sheets/[sheet]/route.ts
src/components/companion/companion-signup.tsx
scripts/strategy/catalog-economics.mjs
scripts/strategy/archive-docs.mjs
CATALOG_ECONOMICS_FINAL.md / .csv
FORMAT_LADDER_MATRIX.csv
NICHE_VALIDATION_MATRIX.csv
AMAZON_CATALOG_CASE_STUDIES.csv
RULE_SET_INDEX.md
ARCHIVED_RULESETS_AND_OLD_REPORTS_TR.md
PHASE_1_EXECUTION_COMPLETION_TR.md
docs/VALICE_PRESS_COMMERCE_AND_VISIBILITY_RESEARCH_TR.html
```

**Değiştirilen**
```
src/lib/newsletter-client.ts        + "hangul-companion" kaynağı
src/app/api/newsletter/route.ts     + allow-list girişi
```

**Taşınan:** 28 belge → `archive/` · **Silinen:** 0
