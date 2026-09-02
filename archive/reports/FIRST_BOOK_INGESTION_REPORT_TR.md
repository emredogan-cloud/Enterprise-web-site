# İlk Gerçek Kitap Ingestion Raporu — Phase 1 Smoke Test (Meditations)

> **Amaç:** Tek gerçek kitapla TÜM katalog hattını uçtan uca doğrulamak.
> Toplu ingestion DEĞİL — sistem doğrulaması.
>
> **Tarih:** 2026-05-31 · **Hedef DB:** Neon **Production**
> (`ep-hidden-rice-...eu-central-1` — pooled; app runtime ile birebir aynı).
> **Commit/Push:** YAPILMADI (insan onayı bekleniyor).

---

## 0. Sonuç (TL;DR)

| Boyut | Durum |
|------|-------|
| DB ingestion (book satırı) | ✅ |
| İlişkiler (book_authors / book_categories) | ✅ |
| Atomiklik / orphan / duplicate | ✅ (tek transaction, 0 orphan, 0 dup) |
| Detay routing (`/books/[slug]`) | ✅ |
| Kapak (katalog grid) | ✅ gerçek `meditations.webp` |
| Kapak (detay hero) | ⚠️ placeholder (bilinen wiring boşluğu, kusur değil) |
| Yazar atfı | ✅ |
| Koleksiyon linkajı (PD Spine + Deep Thinking) | ✅ |
| Tam metin arama (FTS) | ✅ (`stoicism` → Meditations) |
| Checkout uyumluluğu | ✅ (paddle id mevcut, fail-fast yok) |
| Runtime hatası | ✅ yok (tüm rotalar 200) |

**Smoke test başarı koşulu KARŞILANDI:** *"Meditations exists and the full
bookstore pipeline is proven healthy."* — Meditations prod DB'de yaşıyor ve
pipeline sağlıklı.

**Pipeline, katalog genişlemesine veri katmanı düzeyinde HAZIR.** Canlı yayın /
ticaret için birkaç koşul §5–§6'da.

---

## 1. Ingestion Yöntemi

**Tercih edilen yol (admin UI) kullanılamadı:** admin server action'ları
(`createBook` / `ensureCoreCollections`) `requireAdmin()` çağırıyor → Clerk
oturumu (tarayıcı session) gerekiyor. Otomatik ajan headless ortamda Clerk
oturumu üretemez. Bu yüzden prompt'un önceden onayladığı **fallback** kullanıldı.

**Kullanılan yol (geçici script):** tek seferlik `tsx` script. Server
action'ların AYNI veri mantığını birebir yansıttı:
- `ensureCoreCollections` → `categories.slug` üzerinde `onConflictDoNothing`
- `syncBookRelations` → slug ile find-or-create yazar + replace-semantics junction
- hepsi tek `db.transaction` içinde (kısmi/yazarsız durum imkânsız)
- prod `DATABASE_URL` (pooled Neon, app runtime ile aynı driver/endpoint)

Script yalnızca **auth sarmalayıcısı** bakımından server action'dan ayrılır.
Çalıştıktan sonra **silindi** (kalıcı helper yok); `.env.local` orijinaline
döndürüldü (prod secret diskte kalmadı).

---

## 2. DB Doğrulama (script çıktısı, prod)

```
book.id            : a61cb09d-08d6-4659-8c0b-a77d716b4504
book.slug          : meditations
book.title         : Meditations
book.subtitle      : The Private Diary of the Roman Emperor
book.status        : published
book.priceCents    : 999 USD
book.paddlePriceId : pri_test_meditations_999
book.pageCount     : 254
book.language      : en        (ISO 639-1; admin form default. "English" = insan etiketi)
book.coverKey      : null      (kapak public asset katmanından slug ile gelir)
book.publishedAt   : 2026-05-31T17:18:47Z
authors linked     : Marcus Aurelius [marcus-aurelius] pos=0
categories linked  : PD Spine [pd-spine], Deep Thinking [deep-thinking]
--- integrity ---
total books        : 1
total authors      : 1
total categories   : 4  (pd-spine=1 builder-core=1 deep-thinking=1 speculative-shelf=1)
dup meditations    : 1  OK
dup marcus-aurelius: 1  OK
author link count  : 1  OK
category link count: 2  OK
=== SMOKE TEST DB STATE: PASS ✅ ===
```

- **Çekirdek koleksiyonlar idempotent seed edildi** (4 adet, her biri tek satır).
- **Orphan yok** (composite PK + FK kısıtları orphan'ı zaten imkânsız kılar; link
  sayıları birebir tutuyor).
- **Kısmi yazım yok** (tek atomik transaction commit edildi).
- `masterFileKey` / `sampleKey` / `isbn` = **null** (sadece metadata; teslim
  edilebilir dosya henüz yüklenmedi — bkz. §5.4).

---

## 3. Runtime QA (taze dev server, prod DB)

Pre-flight: prod katalog **tamamen boştu** (0 kitap/yazar/kategori) → temiz ilk
ingestion. Tüm rotalar **HTTP 200**, 0 runtime hatası.

| # | Kontrol | Rota | Sonuç |
|---|---------|------|-------|
| A | Katalogda görünüyor | `/books` | ✅ Meditations kartı, link, yazar, gerçek kapak, fiyat |
| A | Demo katalog devralındı | `/books` | ✅ demo kitaplar (Midnight Library/Atomic Habits) artık YOK — gerçek kitap devraldı (tasarım gereği) |
| B | Detay çalışıyor | `/books/meditations` | ✅ başlık + alt başlık + açıklama + 254 sayfa |
| C | Kapak — katalog | `/books` | ✅ `next/image` → `/images/books/meditations.webp` |
| C | Kapak — detay hero | `/books/meditations` | ⚠️ tipografik placeholder (bkz. §5.3) |
| D | Yazar atfı | `/books/meditations` | ✅ Marcus Aurelius |
| E | Koleksiyon linkajı | `/categories/pd-spine` | ✅ Meditations listeleniyor |
| E | Koleksiyon linkajı | `/categories/deep-thinking` | ✅ Meditations listeleniyor |
| E | Yazar sayfası | `/authors/marcus-aurelius` | ✅ Meditations listeleniyor |
| F | Konsol/runtime hatası | tümü | ✅ yok (0 hata; sadece benign tailwind ESM uyarısı) |
| G | Arama — başlık | `/search?q=meditations` | ✅ |
| G | Arama — açıklama (FTS) | `/search?q=stoicism` | ✅ (generated `search_tsv` + GIN çalışıyor) |
| G | Katalog/arama regresyonu | `/books`, `/search` | ✅ yok |

---

## 4. Checkout Uyumluluğu (satın alma yapılmadı)

- ✅ **Paddle test id mevcut** (`pri_test_meditations_999`) → `getCheckoutItems`
  bu id'yi döndürür; eksik-id fail-fast'i **tetiklenmez**.
- ✅ **Sepet yolu uyumlu** — detay sayfasında add-to-cart kontrolü gerçek kitap
  id'siyle render ediliyor (preview modu değil).
- ⚠️ **Ownership** yapısal olarak sağlam; ancak `masterFileKey=null` →
  satın alma sonrası teslim edilecek dosya yok (bkz. §5.4).
- ℹ️ `pri_test_meditations_999` sahte bir **test** id'sidir; gerçek bir Paddle
  çağrısı bu id ile başarısız olur (beklenen — bu test satın alma gerektirmiyordu).

---

## 5. Kritik Bulgular / Kalan Sorunlar

### 5.1 (YÜKSEK) `layout.tsx` — boş `NEXT_PUBLIC_APP_URL` site genelinde 500
`src/app/layout.tsx:32` →
`const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";`
`??` yalnızca `null`/`undefined`'ı yakalar, **boş string'i değil**. Değer `""`
olursa `new URL("")` → `ERR_INVALID_URL` → kök layout her sayfayı 500'ler.
QA sırasında lokal olarak tam olarak bu yaşandı.
- `src/lib/seo.ts:getBaseUrl` bunu **doğru** yapıyor (`if (!fromEnv) ...`).
- **Prod risk düşük ama gerçek:** prod build "Ready" (boş olsaydı prerender
  çökerdi) → prod'da değer dolu. Yine de tek satırlık **sertleştirme önerilir:**
  `??` → `||` (veya truthiness guard). Düşük risk, yüksek koruma. (Kod
  değişikliği = kapsam dışı; onay bekliyor.)

### 5.2 Canlı sitede gecikme (ISR / Data Cache)
Script `revalidatePath` / `revalidateTag` **çağırmadı** (admin action çağırırdı —
otomatik ajan request context'i dışında bu mümkün değil). `/books` SSG + 1 saat
ISR + `unstable_cache` (1 saat). Sonuç: **Meditations prod DB'de, ama canlı
`/books` sayfasına ≤1 saat içinde** (veya bir redeploy ile) yansır — anında
değil. **Öneri:** redeploy tetikle ya da bir sonraki ISR döngüsünü bekle. (İnsan
admin UI üzerinden ingest edilseydi `revalidatePath` otomatik çalışırdı.)

> Not: gerçek kitap göründüğünde `/books` **yalnızca** gerçek kitapları gösterir;
> 16 demo kitap kaybolur (`mapRealBooksToShell` devralır — tasarım gereği).

### 5.3 Detay hero kapağı gerçek görseli göstermiyor
`BookCover` yalnızca R2 `coverKey` yolunu kullanıyor ve **slug almıyor**, bu
yüzden `/images/books/meditations.webp`'i çözemez → tipografik placeholder.
Katalog grid'i (slug bazlı `coverSrc`) gerçek görseli gösteriyor. Bu, bilinen
"detay kapak henüz public-asset katmanına wire edilmemiş" durumudur — **ingestion
kusuru değil**. Düzeltme = küçük kod değişikliği (slug'ı `BookCover`'a geçir),
kapsam dışı.

### 5.4 Teslim edilebilir dosya yok (`masterFileKey=null`)
Satın alma sonrası `/read` veya indirme için içerik yok. Gerçek EPUB/PDF'in R2'ye
yüklenmesi ayrı bir adımdır (DRM-free premium edisyon vaadi bunu gerektirir).

### 5.5 Deployment Protection (Vercel SSO)
Prod deployment URL'i **401** döndürüyor (Vercel Authentication). Canlı public
erişimin durumu (ayrı/özel domain, protection ayarı) **doğrulanmalı** — aksi
halde ziyaretçiler de SSO duvarına çarpar.

### 5.6 Ingestion mekanizması kararı
Admin UI headless çalışmıyor (Clerk). Bir **insan admin tarayıcıda** UI'ı
kullanabilir (kod patch'li — bkz. Blocker #1 raporu — ama bu akış burada test
EDİLMEDİ). Toplu genişleme için karar gerekli: insan-admin UI mı, yoksa güvenli
script mi (script seçilirse revalidation'ı da tetiklemeli — §5.2).

---

## 6. Tavsiye: Ready / Not Ready

- **Katalog pipeline (veri katmanı): HAZIR ✅.** Ingestion, ilişkiler, atomiklik,
  detay routing, katalog kapağı, yazar/koleksiyon linkajı, FTS arama ve
  checkout-uyumu uçtan uca kanıtlandı. Daha fazla kitap eklemek teknik olarak
  güvenli.

- **Canlı ürün (launch / commerce): KOŞULLU.** Genişlemeden önce:
  1. `layout.tsx` `NEXT_PUBLIC_APP_URL` guard'ını sertleştir (§5.1).
  2. Ingestion sonrası revalidation stratejisini netleştir (§5.2 / §5.6).
  3. Detay kapak wiring + master dosya yükleme (deliverability) (§5.3 / §5.4).
  4. Deployment Protection / public domain durumunu netleştir (§5.5).

**Önerilen sıradaki adım:** Yukarıdaki §6.1–§6.2 (düşük efor, yüksek etki) ele
alınıp tek bir redeploy ile Meditations canlıda doğrulandıktan **sonra** kontrollü
katalog genişlemesine geçilmesi. Tek-kitap smoke test'i amacına ulaştı.

---

## 7. Temizlik & Durum

- Geçici scriptler **silindi** (`scripts/` → yalnızca `copy-pdf-worker.mjs`).
- `.env.local` **orijinaline döndürüldü** (pulled prod secret diskte kalmadı).
- Dev server **durduruldu**.
- **Kod değişikliği YOK.** **Commit/Push YOK** — insan onayı bekleniyor.
- **DB değişti (kalıcı, prod):** Meditations (published) + 4 çekirdek koleksiyon +
  Marcus Aurelius yazarı + ilişkiler. Bu, smoke test'in amaçlanan çıktısıdır
  (Meditations anchor başlık olarak kalır).
- Bu raporun kendisi (`FIRST_BOOK_INGESTION_REPORT_TR.md`) eklenen tek dosyadır.
