# OTURUM DEVİR HAFIZASI — BURADAN DEVAM ET

> **Bu dosya operasyonel hafızadır, pazarlama raporu değildir.** Yeni (kıdemli)
> bir mühendisin projeyi devraldığını varsay. Yalnızca bu dosyayı okuyarak;
> ne bittiğini, ne yarım kaldığını, sırada ne olduğunu, hangi kararların
> verildiğini, hangi branch/commit/DB/bucket/entegrasyonların kullanımda
> olduğunu ve hangi hataların TEKRARLANMAMASI gerektiğini anlayabilmelisin.
>
> **Tarih:** 2026-06-03 · **Son aktif branch:** `feat/paddle-checkout`
> **Repo:** `/home/emre/Downloads/enterprise-web-site` (git user: emredogan-cloud)
> **NOT:** Kullanıcı eşzamanlı olarak ayrı bir worktree'de SEO işi yapıyor:
> `/home/emre/Downloads/enterprise-seo-wt`. Paylaşılan çalışma ağacı zaman zaman
> başka branch'e geçebilir / index sıfırlanabilir (bkz. KNOWN PITFALLS).

---

# PROJECT OVERVIEW

- **Ne:** "Digital Bookstore" — premium, DRM-free, **sahip olunan** dijital kitap
  mağazası. Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui,
  "cinematic" karanlık zümrüt estetik.
- **İş modeli:** Tek seferlik à-la-carte **kalıcı (perpetual)** satın alma
  (abonelik yok). İlk konumlanma: **"The Builder's Library"** — kürasyonlu PD
  (kamu malı) klasikler + (ileride) teknik/indie kitaplar. **Tüm kitaplar (PD
  dahil) ÜCRETLİ premium edisyon olarak satılır** (ücretsiz/$0 yolu bilinçli
  olarak ertelendi).
- **Mimari (ADR'ler — `memory/PAST_DECISIONS.md`, `roadmap/WEB_SITE_ROADMAP.md`):**
  Neon (Postgres + Drizzle ORM) · Cloudflare R2 (zero-egress, private buckets) ·
  Clerk (auth) · **Paddle (Merchant of Record)** · Inngest (async watermark) ·
  SSG/ISR-first katalog · PDF.js okuyucu · Async Social DRM (order başına
  filigranlı PDF + kısa-TTL imzalı URL). `main` = Vercel production.
- **Lansman hedefi:** Tek gerçek müşteriyi uçtan uca taşıyabilmek
  (gözat → detay → sepet → Paddle checkout → ödeme → fulfillment → filigranlı
  kopya → kütüphane → oku/indir). Yol haritası:
  **`CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md`** (Fazlar A–G). **Şu an Faz B
  bitti; sırada Faz C (Fulfillment).**

---

# WHAT HAS BEEN COMPLETED (kronolojik)

> Önemli: Hattın BÜYÜK KISMI zaten kodluydu (M1 commerce core). Bu oturumdaki iş
> çoğunlukla **provizyon + boşluk kapatma + doğrulama** idi, sıfırdan inşa değil.

## PHASE 0 — Temel (içerik + ingestion + master dosya)

**0.1 — Ingestion Pipeline Patch (Blocker #1)**
- Amaç: admin `createBook`/`updateBook`'un `book_authors`/`book_categories`
  junction'larını atomik yazması; `ensureCoreCollections` ile 4 koleksiyonun
  idempotent seed'i. (Öncesinde yazar/kategori bağlanmıyordu → kitaplar yazarsız.)
- Commit: **`abb404f`** · Branch: `feat/visual-asset-inventory-pipeline`
  (sonra PR #16 ile **main'e merge edildi**, merge commit `1910842`).
- Doğrulama: lint/tsc/build yeşil. Rapor: `INGESTION_PIPELINE_PATCH_REPORT_TR.md`.

**0.2 — Meditations PD edisyonu üretimi**
- Amaç: ilk kanonik PD kitabı. **George Long (1862) çevirisi**, Project Gutenberg
  **#15877**'den (Hays = telifli → KULLANMA; Casaubon #2680 = PD ama arkaik).
- Çıktı: 148 sayfa, 6×9", reportlab ile dizgi (Noto Serif). SHA-256
  `f22d446e38d58a77a18bcdb994ec511be1825b34e784c012c922dd2b6d3eb7bd`.
- Rapor: `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md`. (Yerel `meditations.pdf`
  Phase 2'de R2'ye yüklenip silindi.)

**0.3 — Phase 1: İlk Gerçek Kitap Smoke Test (PROD'a ingest)**
- Amaç: tek kitapla tüm katalog hattını doğrulamak. Meditations **PROD DB
  (`neondb`)**'ye ingest edildi (admin UI headless çalışmaz — Clerk; temp tsx
  script ile, `vercel env pull production` DATABASE_URL ile).
- PROD'daki Meditations: `status=published`, fiyat 999 USD, **paddlePriceId =
  `pri_test_meditations_999` (SAHTE test id — gerçek Paddle fiyatı DEĞİL)**,
  yazar Marcus Aurelius, koleksiyonlar PD Spine + Deep Thinking. Prod book id:
  `a61cb09d-08d6-4659-8c0b-a77d716b4504`.
- Ek: `layout.tsx` `??`→`||` env-guard düzeltmesi (boş string → site geneli 500
  tuzağı). Commit (smoke raporu + fix): **`874952c`** · Branch:
  `feat/visual-asset-inventory-pipeline`. Prod redeploy ile canlıya alındı
  (Meditations canlı `/books`'ta; demo katalog devre dışı).
- Rapor: `FIRST_BOOK_INGESTION_REPORT_TR.md`.

**0.4 — UI düzeltmeleri (kapak + sahte kategori)**
- Detay sayfası kapağı (slug-bazlı `coverSrc`), katalog kartındaki sabit
  "Fiction" yerine gerçek `primaryCategory`. Commit: **`dbbac2b`** · Branch:
  `feat/visual-asset-inventory-pipeline`.

**0.5 — Phase 2: Master File Ingestion (R2)**
- Amaç: gerçek `meditations.pdf`'i private R2'ye yükleyip **PROD DB
  (`neondb`)**'de `masterFileKey`'e bağlamak.
- R2 anahtarı: **`books/meditations/master/v1/master.pdf`** (bucket
  `bookstore-masters-dev`). Content-Type `application/pdf`, Cache-Control
  `private,no-store`, metadata fileRole/bookSlug/uploadedAt. Anonim erişim
  reddediliyor (400/Authorization). PROD `books.masterFileKey` set edildi.
- Commit YOK (R2 + DB op). Rapor: yok (inline). Temp scriptler silindi.

## PHASE A — Ticaret Temeli (roadmap Faz A)

- Amaç: sahiplik-farkında sepet/checkout + ölü kod temizliği + Paddle env denetimi.
- İş: `createCheckoutSession` artık giriş yapmış sahibin **revoke-olmamış
  entitlement'lı** kitabı tekrar almasını engelliyor (sakin hata). `/cart` ve
  SSG ürün sayfası add-to-cart adası "owned" işareti gösteriyor (yeni salt-okunur
  `GET /api/entitlement` + client fetch → sayfa SSG kalır). Yeni salt-okunur
  sahiplik katmanı: `getOwnedBookIds`, `findLocalUserIdByEmail`,
  `getCurrentLocalUserIdReadOnly` (**JIT upsert YOK**). Ölü kod silindi
  (`checkout-button.tsx`, `cart-buttons.tsx`). `PHASE_A_PROVISION_CHECKLIST_TR.md`.
- Commit: **`d2dc568`** · Branch: **`feat/commerce-foundation`** (origin/main
  tabanlı). **PUSH edildi, main'e MERGE EDİLMEDİ.**
- Doğrulama: lint/tsc/build yeşil; `/books/[slug]` SSG, `/cart` dinamik korundu.
- Önemli: şema/UI/mimari değişikliği YOK. Kullanıcı-yüzü metinler İngilizce.

## PHASE B — Paddle Checkout (roadmap Faz B, SANDBOX)

- Amaç: Paddle'ı sandbox'ta çalışır kılmak + payment_failed + customer.get
  sağlamlaştırma + idempotency, gerçek sandbox doğrulamasıyla.
- **İzole sandbox DB kuruldu (`bookstore`):** boş Neon DB'ye kanonik migrationlar
  (`drizzle/0000–0003.sql`) **neon sürücüsüyle doğrudan** uygulandı (13 tablo);
  Meditations + Marcus Aurelius + koleksiyonlar seed edildi; sandbox **paddlePriceId
  = `pri_01kt6fc4e6szzydjsp6nzstjbr`** + masterFileKey set. Sandbox book id:
  `08eb819e-3168-482a-b30c-c93142105c65`.
- **Kod (`src/app/api/webhooks/paddle/route.ts`):** `transaction.payment_failed`
  artık `logger.warn` ile kayda alınıyor (**order satırı YAZILMIYOR** —
  mor_order_ref çakışması, aşağı bkz.); `customer.get` hatası artık null e-mail'e
  yutulmuyor, **yeniden fırlatılıyor → 500 → Paddle retry**.
- Commit: **`334ed64`** · Branch: **`feat/paddle-checkout`** (origin/main
  tabanlı). **PUSH edildi, main'e MERGE EDİLMEDİ.**
- Doğrulama: lint/tsc/build yeşil. **Sandbox runtime:** checkout URL üretimi
  PASS; `processCompletedTransaction` order+entitlement oluşturuyor ve idempotent
  (çift işleme → tek order) PASS. Rapor: bu oturumda inline (Faz B raporu).

---

# CURRENT SYSTEM STATE (alt-sistem alt-sistem)

| Alt-sistem | Durum | Tamamlanan | Eksik / Risk |
|---|---|---|---|
| **Catalog** | ✅ Çalışıyor | listPublishedBooks/by-slug/category/author/FTS/sitemap, hepsi `safeQuery` | Filtre facet'leri (format/rating) sentetik (kolon yok) |
| **Books** | ✅ | Meditations prod + sandbox'ta published | Tek kitap; başka içerik yok |
| **Authors** | ✅ | Marcus Aurelius (her iki DB) | `/authors` bazı yüzeyler hâlâ demo; bio/portre yok |
| **Categories** | ✅ | 4 çekirdek koleksiyon (pd-spine, builder-core, deep-thinking, speculative-shelf) | Sidebar filtresi demo taksonomi (`getCategoryCounts`) |
| **Cart** | ✅ | Cookie `dbs_cart`, addToCart idempotent, **Faz A: sahiplik-farkında** | Anonim-only (DB merge yok) — Faz A branch'inde, main'de DEĞİL |
| **Checkout** | ✅ (sandbox) | `createCheckoutSession` → Paddle hosted URL; eksik-priceId + owned fail-fast | Faz A sahiplik bloğu `feat/commerce-foundation`'da (unmerged) |
| **Paddle** | ⚠️ Sandbox | sandbox key, env=sandbox, Default Payment Link set, fiyat eşlendi (sandbox) | PROD Paddle yok; canlı webhook e2e yapılmadı |
| **Webhook** | ⚠️ | imza doğrulama + completed + **Faz B: payment_failed + customer.get fix** | Yeni kod yalnız `feat/paddle-checkout`'ta; prod/main eski kodu çalıştırır |
| **Orders** | ✅ | order+order_items, morOrderRef UNIQUE idempotency | failed/refunded durum yaşam döngüsü yok (Faz F) |
| **Entitlements** | ✅ | pending→ready; UNIQUE(user,book); revoked yolu var ama set edilmiyor | revocation (iade) yok (Faz F) |
| **Library** | ✅ | getUserLibrary gerçek entitlement, indirme imzalı URL + audit | kapak prosedürel; öneri rafı demo; tekrar-indirme limiti yok |
| **Reader** | ⚠️ | `/read/[bookId]` pdf.js TAM kodlu + erişim kapısı | **UI'da "Oku" linki YOK** (yetim) — Faz E işi |
| **Fulfillment** | ⚠️ | Inngest worker `processFulfillment` (pdf-lib, MASTERS→ARTIFACTS) gerçek | **Inngest deploy/sync edilmemiş** → enqueue düşüyor (zarif); watermark_jobs tablosu ÖLÜ — **Faz C** |
| **R2** | ✅ | masters+artifacts bucket; Meditations master yüklü, private | tokenlar bucket+izin scoped |
| **Neon** | ⚠️ | PROD `neondb` + SANDBOX `bookstore` (KARIŞTIRMA!) | prod migration journal boş (db:migrate bozuk) |
| **Clerk** | ✅ | auth + proxy koruması (/account,/admin,/order,/read) | headless admin UI çalışmaz (Clerk session) |
| **Inngest** | ❌ (sandbox) | kod hazır, app id "digital-bookstore" | **deploy/sync edilmedi; INNGEST_*_KEY yok** — Faz C |

---

# REAL ASSETS CURRENTLY IN THE SYSTEM

- **Kitap:** *Meditations* — Marcus Aurelius, George Long (1862) çevirisi.
  - PROD (`neondb`) book id: `a61cb09d-08d6-4659-8c0b-a77d716b4504`
  - SANDBOX (`bookstore`) book id: `08eb819e-3168-482a-b30c-c93142105c65`
  - slug `meditations`, published, 999 USD, pageCount 254.
- **Yazar:** Marcus Aurelius (slug `marcus-aurelius`) — her iki DB'de.
- **Koleksiyonlar:** PD Spine (`pd-spine`) + Deep Thinking (`deep-thinking`)
  Meditations'a bağlı; ayrıca Builder Core, Speculative Shelf seed'li.
- **masterFileKey (HER İKİ DB):** `books/meditations/master/v1/master.pdf`
- **paddlePriceId:**
  - PROD `neondb`: **`pri_test_meditations_999`** ⚠️ **SAHTE test id** (gerçek
    Paddle fiyatı değil; prod checkout bu id ile başarısız olur).
  - SANDBOX `bookstore`: **`pri_01kt6fc4e6szzydjsp6nzstjbr`** (GERÇEK Paddle
    **sandbox** Price; `prices.get` ile doğrulandı).
- **Sandbox test order'ı:** `bookstore`'da etiketli test kaydı
  `txn_sandbox_phaseb_verify_001` (user `sandbox-phaseb@example.test`,
  status `paid`, entitlement `pending`) — Faz B idempotency testinden kaldı;
  zararsız, silinebilir.

---

# DATABASE STATE (ASLA KARIŞTIRMA)

Her ikisi de aynı Neon endpoint'inde:
`ep-hidden-rice-alr797di-pooler.c-3.eu-central-1.aws.neon.tech`

## PRODUCTION DB = `neondb`
- Gerçek/canlı veri. Meditations (id `a61cb09d…`) + masterFileKey + **SAHTE**
  paddlePriceId (`pri_test_meditations_999`). Canlı `/books`'ta görünür.
- Prod commerce için: gerçek **PRODUCTION** Paddle fiyatı gerekir (Faz G).

## SANDBOX DB = `bookstore`
- Faz B için kuruldu; izole. Şema (13 tablo) + Meditations (id `08eb819e…`) +
  **gerçek SANDBOX** paddlePriceId (`pri_01kt6fc4e6szzydjsp6nzstjbr`) + test order.
- **Sandbox/test yazmaları YALNIZCA buraya gider.**

> **`.env.local` `DATABASE_URL` ŞU AN `bookstore` (SANDBOX)'a işaret ediyor**
> (Faz B'de ayarlandı). Prod işi için `neondb`'ye çevrilmeli. **ASLA** sandbox
> test verisini prod'a, prod verisini sandbox'a yazma. Karıştırma riski = en
> yüksek operasyonel risk.

---

# STORAGE STATE (Cloudflare R2)

- **Bucketlar (private):** `bookstore-masters-dev` (kaynak master PDF'ler),
  `bookstore-artifacts-dev` (order başına filigranlı kopyalar).
- **Kanonik master anahtarı (TAM):**
  **`books/meditations/master/v1/master.pdf`** (bucket `bookstore-masters-dev`).
- **Gizlilik:** Her iki bucket private; erişim yalnız SigV4 kimlikli + kısa-TTL
  imzalı URL (600s vars / 900s tavan). Public domain yok (masters için
  `R2_PUBLIC_BASE_URL` boş). Anonim S3 isteği → 400/Authorization (reddedilir).
- **R2_PUBLIC_BASE_URL** = artifacts/cover yüzeyi içindir, masters DEĞİL.
- Tokenlar **bucket + izin scoped**: master yazmak için `bookstore-masters-dev`
  üzerinde **Object Read & Write** gerekir (`ListBuckets` scoped token'da reddedilir).

---

# PADDLE STATE

- **Sandbox durumu:** Hesap + **sandbox** API key (`PADDLE_API_KEY=pdl_sdb…`),
  `PADDLE_ENVIRONMENT=sandbox`, `.env.local`'de `meditations_price_id=
  pri_01kt6fc4e6szzydjsp6nzstjbr`. PRODUCTION Paddle YOK.
- **Checkout durumu:** ✅ `paddle.transactions.create` hosted-checkout URL
  üretiyor (host `enterprise-web-site.vercel.app`). **Default Payment Link**
  Paddle dashboard → Checkout settings'te ayarlı (bu ayar yapılmadan
  transactions.create HATA verir — bu çözüldü).
- **Webhook durumu:** Paddle sandbox webhook'u **PROD URL**'ye kayıtlı:
  `https://enterprise-web-site.vercel.app/api/webhooks/paddle`. Endpoint erişilebilir
  (imzasız POST → `401 "Missing Paddle-Signature header"`; prod'da bir webhook
  secret var). `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` kodda KULLANILMIYOR (hosted
  checkout, Paddle.js yok).
- **Bilinen sınırlamalar / yarım doğrulama:**
  - **Canlı imzalı webhook e2e YAPILMADI.** Webhook prod'a (= `main`'in ESKİ
    kodu, payment_failed yok) bakıyor → Faz B kodunu canlı doğrulamak için
    `feat/paddle-checkout`'un bir **preview deploy**'una (sandbox env + webhook
    oraya yönlendirilmiş) ihtiyaç var. **Webhook-hedefi kararı (prod vs preview)
    HÂLÂ AÇIK.**
  - `payment_failed` gerçek tetikleme yapılmadı (kod + lint/tsc/build ile doğru).
  - Sandbox checkout URL'leri `enterprise-web-site.vercel.app` host'unu kullanır;
    canlıya geçişte prod Default Payment Link netleştirilmeli (Faz G).

---

# WHAT THE CURRENT AGENT WAS DOING

**Şu an ne yapıyorum?** — Faz B'yi **bitirdim** (commit `334ed64`,
`feat/paddle-checkout` push edildi) ve **Faz C onayı için durdum**. Ardından
kullanıcı bu devir-hafıza dosyasını istedi; onu yazıyorum. **Kod yazmıyorum,
Faz C'ye başlamadım, commit/push yapmıyorum.**

**İşin tam olarak durduğu nokta:** Faz B'nin KODU tamam + sandbox-doğrulandı
(checkout URL + idempotency). Geriye kalan tek doğrulama boşluğu: **canlı imzalı
webhook e2e** (preview deploy + webhook-hedefi kararı gerektirir). Faz C'ye
geçilmedi.

---

# WHAT THE NEXT AGENT MUST DO (tek yol — alternatif verme)

1. Kullanıcıdan **açık Faz C onayı** al (mevcut protokol: faz başına onay).
2. **Faz C — Fulfillment Hattı**'na, `CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md`
   "FAZ C" MASTER PROMPT'una göre başla.
3. Faz C'yi **SANDBOX** `bookstore` DB'sine + R2 `bookstore-artifacts-dev`'e karşı
   yürüt; **prod'a yazma**. Ayrı branch `feat/fulfillment-hardening`
   (origin/main tabanlı), main'e merge YOK.

> Faz B'nin canlı webhook e2e boşluğu Faz C'yi **bloklamaz** (Faz C worker'ı
> doğrudan/Inngest ile test edilir). Ama kullanıcıya hatırlat: tam canlı e2e
> hâlâ preview-deploy kararına bağlı.

---

# PHASE C START INSTRUCTIONS

**Ön-koşullar (İNSAN — eksikse DUR ve iste):**
- `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` `.env.local`'de; Inngest fonksiyonu
  Inngest Cloud'a deploy/sync edilmiş (`process-fulfillment-transaction` görünür).
- R2 `R2_BUCKET_ARTIFACTS` + Object R/W token (artifact yazımı için).
- `DATABASE_URL` **SANDBOX `bookstore`**'a işaret etmeli (Faz C sandbox).

**Önce okunacak dosyalar:**
- `CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md` (FAZ C bölümü + MASTER PROMPT)
- `src/inngest/functions/watermark.ts` (worker), `src/lib/inngest/client.ts`,
  `src/app/api/inngest/route.ts`
- `src/lib/fulfillment.ts` (enqueue), `src/lib/storage/index.ts`
- `src/lib/db/schema.ts` → `watermark_jobs` tablosu (ŞU AN ÖLÜ)
- `memory/paddle-sandbox-commerce-setup.md`, `memory/prod-migration-journal-empty.md`

**Doğrulanacak varsayımlar:**
- Inngest gerçekten deploy/sync mi? (Aksi halde event kuyruğa girer, hiçbir şey
  çalışmaz — "sessiz kuyruk".)
- Sandbox `bookstore`'da `entitlements(pending)` var mı (test order'dan) ve
  Meditations `masterFileKey` set mi? (Worker null masterFileKey'de hata fırlatır.)
- R2 master `books/meditations/master/v1/master.pdf` okunabiliyor mu (Object Read)?

**İlk uygulama görevi:** `watermark_jobs` tablosunu worker yaşam döngüsüne bağla
(queued/running/succeeded/failed + attempts + error + artifactKey), mevcut
entitlement-status idempotency'siyle TUTARLI; retry tükenince alarm/log; sonra
sandbox satın alma → artifact üretimi → entitlement `ready` uçtan uca doğrula.
**Filigran/teslim mimarisini DEĞİŞTİRME (ADR-3).**

---

# KNOWN PITFALLS (yaşanmış dersler)

1. **PROD vs SANDBOX ayrımı:** `neondb` (prod) ≠ `bookstore` (sandbox). `.env.local`
   `DATABASE_URL` şu an sandbox'a bakıyor. Her DB işleminden önce hedefi DOĞRULA
   (`select current_database()`).
2. **Webhook hedefi:** sandbox webhook PROD URL'sine kayıtlı; prod `main`'in eski
   kodunu çalıştırır → feature-branch webhook kodu canlı doğrulanamaz. Preview
   deploy gerekir.
3. **Env yönetimi:** `vercel env pull` **Sensitive** değişkenleri BOŞ çeker
   (R2_*, PADDLE_*). Bunları elle `.env.local`'e koy; iş bitince temizle. Sırlar
   asla commit edilmez (`.env*` gitignore).
4. **Migration workflow:** Boş bir DB'ye şema kurmak için **commit'li migration
   SQL'lerini (`drizzle/0000–0003.sql`) neon sürücüsüyle DOĞRUDAN uygula**
   (`--> statement-breakpoint`'te böl, `db.execute(sql.raw(stmt))`).
5. **db:migrate caveats:** `db:migrate` BOZUK (prod `__drizzle_migrations` boş →
   0000'i replay eder, çakışır). `db:push` interaktif **TTY** ister (config
   `strict:true`; `yes |` TTY'yi karşılamaz) → otomasyonda kullanma.
6. **R2 token izinleri:** tokenlar bucket + izin scoped. Master yazmak için
   `bookstore-masters-dev` üzerinde **Object Read & Write** şart. Scoped token
   `ListBuckets`/yanlış-bucket'ta `AccessDenied` verir.
7. **Sahiplik mantığı:** sahiplik kontrolü **salt-okunur** olmalı (JIT upsert
   YOK — `getCurrentLocalUserIdReadOnly`), hata durumunda **degrade-open** (asla
   yanlış sebeple checkout'u bloklama). Anonim = hiçbir şeye sahip değil.
8. **Idempotency:** webhook idempotency `orders.mor_order_ref` UNIQUE +
   `onConflictDoNothing`'e dayanır. **`payment_failed` order satırı YAZMAMALI** —
   başarısız deneme, completed ile aynı tx id'sini paylaşır; 'failed' order o
   idempotent insert'le çakışır ve fulfillment'ı bloklar.
9. **Eşzamanlı git churn:** Kullanıcı paylaşılan ağaçta eşzamanlı çalışıyor
   (branch geçişleri, staged taxonomy işi). Index sıfırlanabilir. **Açık dosya
   bazlı `git add` + leak-guard + atomik commit** kullan; faz branch'ini
   `origin/main`'den aç.
10. **Stale `.next`:** Branch geçişinden sonra `.next/types/...` eski rotalara
    referans verip tsc'yi bozabilir → `rm -rf .next` sonra tekrar tsc.
11. **`layout.tsx` env-guard:** `process.env.X ?? "..."` boş string'i yakalamaz →
    `new URL("")` site geneli 500. `||` kullan (düzeltildi).
12. **Inngest sessiz kuyruk:** deploy/sync edilmezse event kuyruğa girer, hiçbir
    şey çalışmaz. Faz C'de deploy'u DOĞRULA.

---

# DO NOT REPEAT (yapma)

- ❌ Sandbox commerce'i PROD `neondb`'ye yazma. Test order'larını prod'a sokma.
- ❌ `feat/*` branch'ini açık insan onayı olmadan **`main`'e merge etme** (main = prod).
- ❌ Gizli anahtarları commit/log etme; `vercel env pull`'un boş Sensitive
  değerlerini "yok" sanma (elle gir).
- ❌ `db:push`/`db:migrate`'i otomasyonda kullanma; migration SQL'ini doğrudan uygula.
- ❌ `payment_failed`'de order satırı yazma (mor_order_ref çakışması).
- ❌ UI'ı yeniden tasarlama; cinematic dili/akışı/şemayı değiştirme; filigran/teslim
  mimarisini (ADR-3) değiştirme.
- ❌ PROD Meditations'ın `pri_test_meditations_999`'unu gerçek fiyat sanma (sahte).
- ❌ Admin UI'ı headless çalıştırmaya çalışma (Clerk session yok) — temp tsx script kullan.
- ❌ Sahiplik kontrolünü yazma yoluna (upsert) çevirme; degrade-open kalmalı.

---

# WHEN A NEW AGENT ARRIVES (yürütme devamı)

Sırasıyla:

1. **Bu dosyayı oku:** `SESSION_MEMORY_CONTINUE_FROM_HERE_TR.md`.
2. **Yol haritasını oku:** `CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md` (özellikle
   "FAZ C" bölümü + MASTER PROMPT). (Not: bu dosya bir önceki oturumda untracked
   idi ve çalışma ağacından kaybolmuş olabilir — yoksa `feat/commerce-foundation`
   ya da git history'den kurtar / kullanıcıdan iste.)
3. **Son faz raporlarını oku:** `PHASE_A_PROVISION_CHECKLIST_TR.md`
   (`feat/commerce-foundation`'da), `FIRST_BOOK_INGESTION_REPORT_TR.md`,
   `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md`; ve `memory/` altındaki ilgili
   notlar (`paddle-sandbox-commerce-setup`, `prod-migration-journal-empty`,
   `meditations-pd-edition`, `admin-ingestion-relational-writes`).
4. **Branch durumunu doğrula:**
   - `git fetch origin`; `feat/commerce-foundation` (Faz A, `d2dc568`) ve
     `feat/paddle-checkout` (Faz B, `334ed64`) push'lu ve **unmerged** mi?
   - `origin/main` tip'ini kontrol et; ne Faz A ne Faz B main'de.
   - `.env.local` `DATABASE_URL` hangi DB? (`current_database()` ile DOĞRULA —
     sandbox işi için `bookstore` olmalı.)
5. **YALNIZCA Faz C ile devam et** (Fulfillment), açık kullanıcı onayından sonra.
   Faz D+ veya prod cutover'a (Faz G) geçme. Ayrı branch, sandbox-first,
   main'e merge yok, faz sonunda Türkçe rapor + onay bekle.

> **Mevcut konum:** Faz A ✅ (unmerged), Faz B ✅ (unmerged, canlı webhook e2e
> hariç). **Sıradaki:** Faz C — Fulfillment. Başlamadan onay al.
