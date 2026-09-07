# ROADMAP TAMAMLANMA ÖZETİ — Digital Bookstore (Proje Yolculuğu)

> Nihai master özet. **Roadmap A–G2 boyunca tamamlandı.** Operasyonel detay:
> `FINAL_LAUNCH_READINESS_REPORT_TR.md`. Tarih: 2026-06-03 · prod main: `d191a33`.

---

## 1. Proje

**"The Builder's Library"** — premium, DRM-free, **sahip olunan** dijital kitap
mağazası. Tek seferlik à-la-carte **kalıcı (perpetual)** satın alma (abonelik yok).
Tüm kitaplar (PD dahil) **ücretli premium edisyon** olarak satılır. İlk kanonik
içerik: *Meditations* (Marcus Aurelius, George Long 1862 PD çevirisi).

**Stack:** Next.js 16 (App Router, SSG/ISR-first) · TypeScript · Tailwind/shadcn ·
Neon Postgres + Drizzle · Cloudflare R2 (zero-egress) · Clerk (auth) · **Paddle
(Merchant of Record)** · Inngest (async watermark) · pdf.js (reader). "Cinematic"
karanlık-zümrüt estetik.

---

## 2. Yolculuk — Faz Faz

- **Faz 0 — Temel:** Ingestion patch (book↔author/category atomik junction;
  Blocker #1). Meditations PD edisyonu üretimi + R2'ye yükleme. İlk gerçek kitap
  **prod smoke** (Meditations prod `neondb`'de published; katalog hattı kanıtlandı).
- **Faz A — Sahiplik-farkında sepet:** Giriş yapmış sahip, sahip olduğu kitabı
  tekrar satın alamaz (sakin hata). Salt-okunur ownership katmanı (`getOwnedBookIds`,
  `getCurrentLocalUserIdReadOnly` — JIT upsert yok, degrade-open). Ölü kod temizliği.
- **Faz B — Paddle checkout (sandbox):** Hosted checkout (`transactions.create`);
  Default Payment Link gotcha çözüldü; `payment_failed` + `customer.get` re-throw
  sağlamlaştırma; idempotency (`mor_order_ref` UNIQUE). İzole sandbox DB (`bookstore`).
- **Faz C — Fulfillment:** Ölü `watermark_jobs` tablosu yaşam döngüsüne bağlandı
  (queued→running→succeeded/failed + attempts/error/artifactKey); retry-tükenme
  alarmı (`onFailure`→Sentry); gerçek master'dan filigranlı artifact üretimi
  uçtan uca doğrulandı.
- **Faz D — Kütüphane & sahiplik:** İndirme + okuyucu ownership AuthZ'i tek
  `resolveEntitlementAccess` chokepoint'ine toplandı (drift önleme); güvenlik
  denetimi (cross-user/revoked/pending reddi); tekrar-indirme = sınırsız+audit.
- **Faz E — Okuma deneyimi:** Eksik **"Read" linki** (status-kapılı) eklendi;
  reader erişim/ilerleme/devam doğrulandı; reading-progress **ownership gate**
  (sahip olmayan yazamaz); pdf.js worker prod-güvenli (postinstall). Reader
  yeniden yazılmadı.
- **Faz F — Ticaret güvenliği:** Refund/chargeback (Paddle `adjustment.created`)
  → order `refunded` + entitlement'lar `revoked` (revoked gate D/E'de erişimi
  keser); `payment_failed` audit (order satırı yok — çakışma); **YENİ
  `commerce_events`** append-only audit (idempotent) + alarm. Audit/alarm/destek
  görünürlüğü.
- **Entegrasyon:** A–E ayrı `origin/main` tabanlı dallarda inşa edildi →
  `integration/commerce-phases-a-e`'de birleştirildi (1 çakışma: checkout-button
  modify/delete) → **main'e merge** (tag `POST_PHASE_E_BASELINE`, `0c3b1c6`) →
  Faz F PR #21 ile main'e (`d191a33`).
- **Faz G1 — Production readiness:** Tam hazırlık denetimi (şema/migration/
  Paddle/Inngest/Deployment Protection) + go-live checklist + smoke planı + blocker tespiti.
- **Faz G2 — Kapanış:** Bu özet + `FINAL_LAUNCH_READINESS_REPORT` (cutover/
  rollback/validation planları + hazırlık hükmü).

---

## 3. Mimari & Kilitli Kararlar (ADR'ler — `memory/PAST_DECISIONS.md`)

- **ADR-1** SSG/ISR-first katalog (SEO); account/reader dinamik + auth-gated.
- **ADR-2** Paddle **Merchant of Record** (global vergi/PCI/chargeback'i devreder).
- **ADR-3** Async Social DRM: webhook → idempotent worker → order başına filigranlı
  PDF → private R2 → kısa-TTL imzalı URL. **Hard DRM yok.**
- **ADR-6** Cloudflare R2 (zero-egress), S3-uyumlu, private bucket.
- **ADR-8** Clerk auth + proxy route koruması (`/account`,`/admin`,`/order`,`/read`);
  Postgres `users` ticari ilişkiyi tutar.
- Tier-2 **modüler monolit** (mikroservis reddedildi). Tüm kararlar kilitli.

---

## 4. Veri Modeli (14 tablo / 7 enum)

users, books, authors, categories, book_authors, book_categories, **orders**
(`mor_order_ref` UNIQUE = idempotency), order_items, **entitlements**
(UNIQUE(user,book); status pending→ready→revoked; watermarkedKey; readStatus;
lastDownloadedAt), **watermark_jobs** (queued→running→succeeded/failed), reading_progress
(UNIQUE(user,book)), download_logs, reviews, **commerce_events** (Faz F append-only
audit). Enumlar: order_status, entitlement_status, watermark_job_status, read_status,
book_status, review_status, commerce_event_type.

---

## 5. Git / Branch Hikâyesi

- **Bağımsız faz dalları** (her biri `origin/main`'den) → faz sonu rapor + onay →
  entegrasyon dalı → main → tag. Vercel prod = main.
- **Discovery:** `feat/commerce-foundation` SEO'ya repurpose edilmişti; gerçek Faz A
  commit'i (`d2dc568`) gated SEO altında kaldığından **cherry-pick** edildi.
- **Recovery:** master plan + edisyon/legal raporları yalnız bir **git stash**'inde
  mahsurdu → salt-okunur kurtarıldı + commit edildi (`5b77691`).
- **Prod merge:** integration → main **fast-forward** (`3a55fc9→0c3b1c6`); sonra F
  PR #21 (`d191a33`). main SEO worktree'sinde checkout'luydu → push-refspec ile ff.
- **Etiket:** `POST_PHASE_E_BASELINE`.

---

## 6. Önemli Kararlar, Tuzaklar & Dersler

1. **PROD vs SANDBOX ayrımı** mutlak: `neondb` (prod) ≠ `bookstore` (sandbox).
   Her DB op'tan önce `current_database()` ASSERT; tüm faz e2e'leri sandbox'ta.
2. **`db:migrate` BOZUK** (prod `db:push`'lu, journal boş → 0000 replay). Şema
   DDL'i **neon sürücüsüyle DOĞRUDAN** uygulanır; CI migrate gate'i no-op.
3. **`payment_failed` order satırı YAZMAZ** — eventual `completed` ile
   `mor_order_ref` çakışır, fulfillment'ı bloklardı; failed durumu **audit**'te.
4. **Inngest "sessiz kuyruk"**: sync edilmezse event girer, hiçbir şey çalışmaz →
   `watermark_jobs` bunu görünür kılar; prod sync go-live şartı.
5. **Ownership chokepoint** (D) drift'i önler; `revoked` tek noktada erişimi keser;
   `getOwnedBookIds` revoked'ı dışlar (iade sonrası re-purchase serbest — perpetual).
6. **İkili `.env`/`.env.local`** ikisi de sandbox'a bakıyordu; `R2_BUCKET_ARTIFACTS`
   boştu → doğrulanıp dolduruldu. Sensitive env elle girilir, iş sonrası temizlenir.
7. **Faz başına: lint+tsc+test+build + sandbox e2e + Türkçe rapor + onay** disiplini.

---

## 7. Doğrulama Disiplini (her faz)

`npm run lint` · `npx tsc --noEmit` · `npm test` (53) · `npm run build` — her fazda
ve her entegrasyon merge'inde yeşil. Ayrıca her faz için **gerçek kod + sandbox +
gerçek R2** uçtan uca doğrulama harness'ı (geçici, sonra silindi). Regresyon yok.

---

## 8. Nihai Durum

- **Kod:** Faz **A–F prod main'de** (`d191a33`), build yeşil, sandbox e2e kanıtlı.
- **İçerik:** Meditations prod'da published (gerçek master + yazar + koleksiyon;
  fiyat henüz SAHTE — cutover'da gerçek live Price ile değişecek).
- **Hazırlık hükmü:** **Development Ready ✅ · Production (kod/deploy) ✅ ·
  Production (operasyonel) ⚠️ bloklu · Customer Ready ❌ bloklu.** Kalan: dış
  provizyon (Paddle live [kritik yol], Inngest prod sync, prod migration `0004`,
  Deployment Protection) + tek canlı doğrulama turu — hepsi **kod-dışı** (bkz.
  `FINAL_LAUNCH_READINESS_REPORT_TR.md` §4–§7).

---

## 9. Kapanış

Roadmap **Faz 0 → G2 boyunca tamamlandı**. Yazılım bitti, doğru ve prod'a
deploy'lu; canlı satış, belgelenen **B1–B5 operasyon adımları** (açık insan onayı)
ile açılır. **Yeni faz yok — roadmap burada biter.**
