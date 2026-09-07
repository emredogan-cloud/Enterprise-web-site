# Faz G1 — Production Readiness (Lansman Hazırlığı, CANLIYA ALMADAN)

> **Faz:** G1 — Production Readiness (yalnız HAZIRLIK + DENETİM; cutover YOK)
> **Tarih:** 2026-06-03 · **Branch:** `feat/production-readiness` (origin/main `d191a33` tabanlı)
> **Mod:** Salt-okunur denetim · **Prod cutover:** YOK · **Gerçek Paddle ürünü:** YOK · **Altyapı değişikliği:** YOK · **main'e merge:** YOK.
> **Not:** Eksik prod env'ler **bloklamadı** — tespit edildi, belgelendi, aksiyon maddesi çıkarıldı, devam edildi (talimat gereği).

---

## 0. Sonuç (TL;DR)

**KOD lansmana hazır; LANSMAN provizyon + prod-DB migrasyonu + canlı doğrulama bekliyor.** A–F'nin tamamı **main'e merge edildi** (`d191a33`, PR #21) → prod'a A–F kodu deploy edildi. Kalan iş **kod değil**: prod Paddle (live), prod env, prod-DB şema migrasyonu (özellikle `0004`), Inngest prod sync ve **canlı uçtan uca doğrulama**.

| Alan | Hazır mı? |
|------|-----------|
| Kod (A–F, prod build) | ✅ HAZIR (main `d191a33`, tüm kapılar yeşil) |
| İçerik (Meditations published) | ⚠️ KISMEN (gerçek kitap var; **fiyat SAHTE**) |
| Prod DB şeması | ⛔ DOĞRULANMADI + `commerce_events` (0004) **uygulanmadı** |
| Paddle (prod/live) | ⛔ YOK (sandbox + sahte price) |
| Webhook (canlı imzalı e2e) | ⛔ YAPILMADI |
| Fulfillment (Inngest prod) | ⛔ DEPLOY/SYNC EDİLMEDİ (sessiz kuyruk riski) |
| R2 | ✅ (master yüklü, bucket yazılabilir) — bucket isimleri `-dev` (§5) |
| Reader | ✅ kod hazır (gerçek satın alma ile doğrulanmalı) |
| Operasyon (Upstash/Resend/Sentry/Deployment Protection) | ⛔/⚠️ provizyon bekliyor |

---

## 1. Entegrasyon Durumu

- **`origin/main` = `d191a33`** = Faz **A–F tamamı merge'li** (A–E baseline `0c3b1c6` + Faz F PR #21). main = Vercel production → A–F kodu prod'a deploy edildi.
- Bu G1 dalı (`feat/production-readiness`) bu baseline'dan açıldı. **Kod değişikliği yok** (yalnız bu rapor) — "only prepare and audit".

---

## 2. Production DATABASE Audit

> **Yöntem:** Prod (`neondb`) canlı sorgulanmadı (yerelde prod kimlik bilgisi yok; prod sır çekmek "altyapı/launch" işidir — kapsam dışı). Denetim **kod + commit'li migration'lar + belgeli prod durumu** (faz raporları/memory) üzerinden; **canlı doğrulama için tam SQL §2.4'te** (G2'de çalıştırılacak).

### 2.1 Kodun gerektirdiği şema (migration 0000–0004)
**14 tablo:** users, books, authors, categories, book_authors, book_categories, orders, order_items, **entitlements**, **watermark_jobs**, **reading_progress**, **download_logs**, reviews, **commerce_events**.
**7 enum:** book_status, order_status, entitlement_status, read_status, watermark_job_status, review_status, **commerce_event_type**.
**Migration kökenleri:** watermark_jobs / reading_progress / download_logs → **0000**; `entitlements.read_status` + `last_downloaded_at` → sonraki ALTER; `categories.description` → **0003**; **commerce_events + commerce_event_type → 0004 (Faz F)**.

### 2.2 Bilinen prod (`neondb`) durumu (raporlar/memory)
- Prod **`db:push`** ile kuruldu → `__drizzle_migrations` **BOŞ** → `db:migrate` BOZUK (0000'i replay eder). Migration SQL'leri **bilgilendirici**; prod'a DDL **doğrudan neon sürücüsüyle** uygulanır (bkz. [[prod-migration-journal-empty]]).
- **Mevcut (kesin):** çekirdek tablolar + Meditations (`a61cb09d…`, published, `masterFileKey` set, **`paddlePriceId=pri_test_meditations_999` SAHTE**), 4 koleksiyon, Marcus Aurelius; `categories.description` (0003) doğrudan uygulandı.
- **DOĞRULANMADI (canlı kontrol şart):** watermark_jobs, reading_progress, download_logs (0000'de — db:push tam şemadan yapıldıysa muhtemelen var, ama teyit edilmeli), `entitlements.read_status` + `last_downloaded_at` (sonraki ALTER — prod push'unda var mı belirsiz).
- **KESİN YOK:** **`commerce_events` + `commerce_event_type`** (0004, Faz F; prod'a hiç uygulanmadı).

### 2.3 Entitlement / Fulfillment / Reader audit (prod)
- **Entitlement:** model + revocation kodu prod'da (A–F). Prod'da canlı entitlement YOK (gerçek satın alma yapılmadı). Sandbox'ta tüm geçişler doğrulandı.
- **Fulfillment:** worker kodu + watermark_jobs prod'da; **Inngest prod'a sync EDİLMEDİ** → gerçek satın almada event kuyruğa girer, worker çalışmaz → entitlement `pending` takılır → "paying customer, no book". **EN KRİTİK fulfillment riski.**
- **Reader:** kod + pdf.js worker (postinstall) hazır; `ready` entitlement + ARTIFACTS artifact gerektirir (fulfillment'a bağlı).
- **commerce_events no-op zarif düşüş:** prod'da tablo yokken refund/chargeback **revocation YİNE çalışır** (orders/entitlements mevcut); yalnız audit satırı sessizce yazılmaz (`recordCommerceEvent` best-effort). 0004 uygulanınca audit de kalıcı olur.

### 2.4 Prod şema DOĞRULAMA SQL'i (G2'de, salt-okunur)
```sql
-- 14 tablo mevcut mu?
select table_name from information_schema.tables
 where table_schema='public' order by 1;
-- entitlements kolonları (watermarked_key, read_status, last_downloaded_at olmalı)
select column_name from information_schema.columns where table_name='entitlements' order by 1;
-- Faz F tablosu var mı? (NULL ise 0004 UYGULANMALI)
select to_regclass('public.commerce_events') as commerce_events,
       to_regclass('public.watermark_jobs')  as watermark_jobs,
       to_regclass('public.reading_progress') as reading_progress,
       to_regclass('public.download_logs')   as download_logs;
```

---

## 3. Production ARCHITECTURE Audit (hazırlık)

| Bileşen | Durum | Aksiyon (G2) |
|--------|-------|--------------|
| **Paddle** | sandbox key + `PADDLE_ENVIRONMENT=sandbox` + SAHTE prod price | Prod: live API key, **her published kitap için gerçek Price**, `PADDLE_ENVIRONMENT=production`, Default Payment Link, Meditations `paddlePriceId`'i gerçek live id'ye GÜNCELLE. |
| **Webhook** | kod tüm event'leri işliyor (completed/payment_failed/canceled/**adjustment.created**); prod URL erişilebilir; prod secret (memory) | Prod live webhook'u Paddle live'a kaydet + `PADDLE_WEBHOOK_SECRET` (prod) teyit; **canlı imzalı e2e** çalıştır. |
| **Fulfillment (Inngest)** | worker + watermark_jobs kodlu; **prod'a sync EDİLMEDİ** | `INNGEST_EVENT_KEY`/`SIGNING_KEY` (prod) + fonksiyonu Inngest Cloud'a **deploy/sync** (`process-fulfillment-transaction` görünür olmalı). |
| **R2** | master yüklü (`books/meditations/master/v1/master.pdf`), ARTIFACTS yazılabilir; Object R/W token | Bucket isimleri **`-dev`** (masters-dev/artifacts-dev) → prod için ayrım kararı (yeni prod bucket mı, yoksa bilinçli reuse mu) — §5. |
| **Reader** | kod + pdf.js worker hazır | Gerçek `ready` entitlement ile prod'da bir tur. |
| **Auth (Clerk)** | prod anahtarları prod env'de (memory) | `ADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL` (boş değil — layout 500 tuzağı) teyit. |
| **Rate-limit (Upstash)** | sağlanmamış → limiter fail-open | `UPSTASH_REDIS_REST_URL/TOKEN` (opsiyonel ama önerilir). |
| **E-posta (Resend)** | sağlanmamış → order-ready email no-op | `RESEND_API_KEY` + `EMAIL_FROM` (doğrulanmış domain) — bloklamaz. |
| **Alarm (Sentry)** | DSN yok → alarmlar yalnız console | `SENTRY_DSN` (önerilir — refund/chargeback/stuck-job görünürlüğü). |
| **Destek görünürlüğü** | `src/app/admin/*` + `queries/admin.ts` mevcut; commerce_events sorgu fonksiyonları var | Minimal salt-okunur admin order/entitlement+event görünümü (küçük takip işi). |
| **Deployment Protection** | prod URL daha önce 401 (Vercel SSO) döndü (memory §5.5) | Public erişim için protection/özel domain DOĞRULA. |

---

## 4. Env / Provizyon Tespiti (detect → document → action; durdurma YOK)

Yerel (`.env`/`.env.local`, sandbox geliştirme): **present** → DATABASE_URL (sandbox), PADDLE_API_KEY (sandbox), PADDLE_ENVIRONMENT=sandbox, INNGEST_*, R2_* (dev bucket'lar). **ABSENT (yerelde)** → PADDLE_WEBHOOK_SECRET, UPSTASH_*, RESEND_API_KEY/EMAIL_FROM, SENTRY_DSN, Clerk anahtarları, ADMIN_EMAILS, NEXT_PUBLIC_APP_URL.

> Yereldeki "ABSENT", prod'da yok demek değildir (bazıları Vercel prod env'de — Clerk, NEXT_PUBLIC_APP_URL, webhook secret). **Prod env tamlığı G2'de `vercel env ls --environment=production` ile teyit edilmeli.** Bu rapor prod sır ÇEKMEDİ.

**Prod için EKSİK/teyit gereken (aksiyon maddeleri):** (a) Paddle **live** key+price+env+webhook secret; (b) Inngest **prod** key + sync; (c) Upstash; (d) Resend domain+EMAIL_FROM; (e) Sentry DSN; (f) Clerk prod + ADMIN_EMAILS + NEXT_PUBLIC_APP_URL teyit; (g) prod DB'ye **0004** + eksik kolon migrasyonu.

---

## 5. NE HAZIR vs NE HAZIR DEĞİL

### ✅ Hazır
- **Kod:** A–F main'de, prod build yeşil; tam mutlu yol + güvenlik (refund/revoke/audit/alarm).
- **İçerik:** Meditations prod'da published (gerçek master + yazar + koleksiyon).
- **R2:** master yüklü; artifacts yazılabilir.
- **Migration SQL'leri:** 0000–0004 commit'li (prod'a uygulanmaya hazır).
- **Sandbox:** her fazın uçtan uca + güvenlik doğrulaması geçti.

### ⛔ Hazır Değil → LANSMAN BLOKLAYICILARI
1. **Prod Paddle yok / fiyat SAHTE** (`pri_test_meditations_999`) → gerçek checkout imkânsız.
2. **Inngest prod'a sync edilmedi** → satın alma sonrası watermark çalışmaz (entitlement `pending` takılır, indirme/okuma yok). *(En kritik.)*
3. **Prod DB şeması doğrulanmadı + `commerce_events` (0004) uygulanmadı** (+ olası eksik `read_status`/`last_downloaded_at`).
4. **Canlı imzalı webhook e2e yapılmadı** (fulfillment + refund prod'da kanıtlanmadı).
5. **Deployment Protection (Vercel SSO)** public erişimi engelliyor olabilir → doğrula.

### ⚠️ Önerilen (bloklamaz)
- Upstash (rate-limit fail-open), Resend (email no-op), Sentry (alarm görünürlüğü), R2 bucket isim ayrımı (`-dev`), minimal admin destek görünümü.

---

## 6. Go-Live Checklist (master)

**Provizyon:** ☐ Paddle live (key, **her kitap için price**, webhook+secret, env=production) ☐ R2 (MASTERS+ARTIFACTS, R/W token) ☐ Inngest (key + **prod sync**) ☐ Resend (domain+EMAIL_FROM) ☐ Clerk prod + ADMIN_EMAILS + NEXT_PUBLIC_APP_URL ☐ Neon prod **migration'lar uygulanmış (0004 dahil)** ☐ Upstash ☐ Sentry.
**İçerik:** ☐ Meditations `paddlePriceId` = **gerçek live id** + `masterFileKey` (hazır).
**Kod (A–F merge'li, build yeşil):** ☑ (main `d191a33`).
**Uçtan uca prod:** ☐ gözat→detay→sepet→checkout→ödeme→webhook→fulfillment→kütüphane→indir→oku ☐ refund→revoked ☐ idempotency (çift webhook→tek order) ☐ stuck-job alarmı.
**Operasyon:** ☐ log/denetim+Sentry ☐ rollback planı ☐ destek görünürlüğü ☐ go-live kapısı (insan onayı).

---

## 7. Production Smoke-Test Planı (G2'de yürütülür)

1. **Erişim:** prod URL public mi? (Deployment Protection kapalı / domain ayarlı). `/`, `/books`, `/books/meditations` → 200.
2. **Provizyon ön-kontrol:** `vercel env ls --environment=production` ile (a)–(g) tam; prod DB şema SQL'i (§2.4) yeşil; Inngest panosunda `process-fulfillment-transaction` görünür.
3. **Tek gerçek tur** (insan, düşük tutar / Paddle test kartı): detay → sepet → checkout → ödeme → webhook 200.
4. **Doğrula (§8 sorguları):** order `paid` → entitlement `pending`→`ready` → watermark_jobs `succeeded` → ARTIFACTS'ta artifact → kütüphane `ready` → indir (imzalı URL 200, %PDF) → `/read/[id]` açılır + ilerleme kaydı → `commerce_events` `paid`.
5. **Refund testi** (düşük tutar): Paddle'dan refund → webhook `adjustment.created` → order `refunded` + entitlement `revoked` → indir/oku **reddediliyor** → `commerce_events` `refunded`+`revoked` → alarm.
6. **İdempotency:** webhook'u tekrar gönder → tek order/tek geçiş.
7. **Rollback hazır:** sorun olursa Deployment Protection'ı geri aç / `paddlePriceId`'i sahteye çevir (satışı durdur) / önceki prod deploy'a dön.

---

## 8. EXACT — Cutover Adımları (G2, her biri İNSAN ONAYI ile)

1. **Onay + dondurma:** go-live kararı; eşzamanlı git churn'ü durdur.
2. **Prod env provizyonu** (Vercel dashboard / `vercel env add ... production`): Paddle live key/secret, `PADDLE_ENVIRONMENT=production`, Inngest prod keys, (ops.) Upstash/Resend/Sentry; Clerk/NEXT_PUBLIC_APP_URL/ADMIN_EMAILS teyit. **Sandbox sırlarının prod'a sızmadığını doğrula.**
3. **Paddle live kurulum:** prod hesabı + Meditations için **gerçek Price** + Default Payment Link + live webhook `{PROD_URL}/api/webhooks/paddle` + secret.
4. **Prod DB migrasyonu** (neon sürücüsüyle DOĞRUDAN — `db:migrate` KULLANMA): §2.4 SQL ile şemayı doğrula; **`drizzle/0004` (commerce_events)** ve eksikse `read_status`/`last_downloaded_at`/`categories.description` DDL'ini uygula; (önerilir) journal'ı baseline'la. CI `db:migrate` gate'i no-op kalmalı (secret SET ETME).
5. **Meditations fiyatı:** prod `books.paddlePriceId`'i **gerçek live Price id**'ye güncelle (sahte `pri_test_…`'i kaldır).
6. **Inngest prod sync:** fonksiyonu deploy/sync et; panoda görünür olduğunu doğrula.
7. **Deployment Protection:** public erişim için ayarla/doğrula.
8. **Smoke + first-purchase doğrulama** (§7, §9).
9. **Go-live kapısı:** insan imzası → satış açık.

---

## 9. EXACT — İlk Gerçek Satın Alma Doğrulaması (G2)

**A. Satın alma (insan):** `/books/meditations` → sepete ekle → checkout → Paddle live ödeme (düşük tutar/test kartı).
**B. Prod DB doğrula** (sipariş sonrası, salt-okunur — `txn` = Paddle transaction id):
```sql
select id,status,total_cents,currency from orders where mor_order_ref = '<txn>';            -- status='paid'
select e.status, e.watermarked_key from entitlements e join orders o on o.id=e.order_id
  where o.mor_order_ref='<txn>';                                                           -- 'pending'→'ready', key set
select status,attempts,artifact_key from watermark_jobs w join entitlements e on e.id=w.entitlement_id
  join orders o on o.id=e.order_id where o.mor_order_ref='<txn>';                          -- 'succeeded'
select type,created_at from commerce_events where mor_order_ref='<txn>' order by created_at; -- 'paid'
```
**C. Teslim:** kütüphanede `ready` görünür → **Download** (imzalı URL → 200, `%PDF`) → **Read** (`/read/[bookId]` pdf.js render + ilerleme kaydı/devam).
**D. Refund→revoke (düşük tutar):** Paddle'dan refund → webhook → tekrar sorgula: order `refunded`, entitlement `revoked`, `commerce_events` `refunded`+`revoked`; **indir/oku artık reddediliyor**; alarm log'da.
**E. Temizlik/karar:** test order'ı işaretle; sonuçları kaydet; go-live kapısı.

---

## 10. Doğrulama (G1)

| Kapı | Sonuç |
|------|-------|
| `npm run lint` | (aşağıda) |
| `npx tsc --noEmit` | (aşağıda) |
| `npm test` | (aşağıda) |
| `npm run build` | (aşağıda) |

*(G1 kod değiştirmez; kapılar `d191a33` baseline + bu raporu doğrular — sonuçlar commit mesajında/oturum çıktısında.)*

---

## 11. Sonraki Adım

**STOP.** Faz **G2 (Production Cutover & Go-Live)** **başlatılmadı** — onay bekleniyor. G2'deki her prod-etkili adım (env, Paddle live, prod migration, canlı satış) **ayrı açık insan onayı** gerektirir; bu rapor yalnız HAZIRLIK + DENETİM'dir (cutover yok, gerçek Paddle ürünü yok, altyapı değişikliği yok).
