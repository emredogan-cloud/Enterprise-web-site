# Faz F — Ticaret Güvenliği & Operasyon Tamamlanma Raporu

> **Faz:** F — Ticaret Güvenliği & Operasyon (İade/Başarısızlık + Revocation + Denetlenebilirlik)
> **Tarih:** 2026-06-03 · **Branch:** `feat/commerce-operations` (origin/main `0c3b1c6` = POST_PHASE_E_BASELINE tabanlı)
> **Mod:** SANDBOX-only · **main'e merge:** YOK · **UI redesign:** YOK · **Faz G/cutover:** YOK.
> **Kaynak plan:** `CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md` → FAZ F (+ MASTER PROMPT).

---

## 0. Sonuç (TL;DR)

**Hedef karşılandı:** Satın alınan bir kitap artık **paid / failed / refunded / revoked** olabiliyor ve **her geçiş GÖRÜNÜR, DENETLENEBİLİR ve KURTARILABİLİR** (idempotent + sorgulanabilir audit trail).

| Boyut | Durum |
|------|-------|
| payment_failed / canceled | ✅ denetime kaydediliyor (order satırı YOK — çakışma önlendi) |
| refund (Paddle `adjustment.created`) | ✅ order `refunded` + entitlement'lar `revoked` |
| chargeback (Paddle `adjustment.created`/action) | ✅ order `refunded` + `revoked` + alarm |
| revocation lifecycle | ✅ `revoked` set ediliyor; download+reader gate erişimi reddediyor |
| denetim (audit) | ✅ append-only `commerce_events` (idempotent, sorgulanabilir) |
| alarm | ✅ refund/chargeback → `logger.error` (Sentry varsa capture) |
| idempotency | ✅ çift event → tek geçiş (providerEventId UNIQUE) |
| kapılar (lint/tsc/test/build) | ✅ hepsi yeşil |

---

## 1. Kapsam & Yönetişim

- **Yalnız SANDBOX:** `current_database()='bookstore'` her runtime adımında ASSERT. Prod'a yazma YOK. **main'e merge YOK. Faz G/cutover YOK. UI redesign YOK.**
- **Refund'ı kendimiz TETİKLEMİYORUZ** — yalnız Paddle'dan gelen `adjustment.created` event'ini işliyoruz (masterplan kuralı).
- İmza doğrulama (webhook) **değiştirilmedi** (önce-imza ilkesi korundu).

---

## 2. Yapılan Değişiklikler (tam dosya listesi)

| Dosya | Değişiklik |
|------|-----------|
| `src/lib/db/schema.ts` | **YENİ** `commerce_event_type` enum + **`commerce_events`** tablosu (append-only denetim; `provider_event_id` UNIQUE → idempotency). |
| `drizzle/0004_whole_karma.sql` (+ meta) | Üretilen migration (db:generate). **SANDBOX'a neon sürücüsüyle uygulandı** (db:migrate bozuk — bkz. [[prod-migration-journal-empty]]). |
| `src/lib/commerce/events.ts` | **YENİ** `recordCommerceEvent` (idempotent, best-effort) + `getCommerceEventsForOrder`/`ForRef` (destek görünürlüğü, salt-okunur). |
| `src/lib/commerce/lifecycle.ts` | **YENİ** `handleRefundOrChargeback` (order→refunded + entitlement→revoked + audit + alarm; idempotent; full-refund), `revokeEntitlementsForOrder` (yeniden kullanılabilir revocation), `handlePaymentFailure` (audit-only). |
| `src/lib/fulfillment.ts` | `processCompletedTransaction`'a `paid` denetim event'i eklendi (additive; tam yaşam döngüsü trail'i). |
| `src/app/api/webhooks/paddle/route.ts` | `adjustment.created` (refund/chargeback), `transaction.canceled` eklendi; `payment_failed` audit'e bağlandı. `event.eventId` idempotency için iletiliyor. |

---

## 3. İşlenen Eventler & Davranış

| Paddle event | Davranış |
|--------------|----------|
| `transaction.completed` | order `paid` + entitlement `pending` + watermark_jobs `queued` + **`paid` audit** (mevcut + Faz F audit eklendi) |
| `transaction.payment_failed` | **audit `payment_failed`** + `logger.warn`. **Order satırı YAZILMAZ** (başarısız deneme, eventual `completed` ile aynı txn id'sini paylaşır → `mor_order_ref` çakışması fulfillment'ı bloklardı — Faz B bulgusu). Failed durumu audit trail'de görünür/sorgulanabilir. |
| `transaction.canceled` | aynı (audit `transaction_canceled`) |
| `adjustment.created` (action=`refund`) | order → **`refunded`**, o order'ın entitlement'ları → **`revoked`**; audit (`refunded` + `revoked`); **alarm** |
| `adjustment.created` (action=`chargeback`/`chargeback_warning`) | aynı; audit `chargeback` + `revoked`; **alarm** |
| `adjustment.created` (action=`credit`/reversal) | revoke YOK; yalnız audit (no-revoke) |

**Revocation kapsamı:** **Full-refund → ilgili order'ın TÜM entitlement'ları revoke** (tek-ürün katalog için doğru). Yalnızca **iade edilen order'ın** entitlement'ları (aynı kitabın başka bir order'dan meşru grant'ı korunur). **Kısmi/satır-bazlı iade** ertelendi (iş-kararı; bkz. §6).

**revoked gate:** Faz D (download) + Faz E (reader) zaten `status==='ready'` şartı koyuyor → `revoked` erişimi otomatik reddediyor. Faz A `getOwnedBookIds` `revoked`'ı dışlıyor → iade sonrası **yeniden satın alma serbest** (perpetual ownership ilkesiyle tutarlı). Runtime'da doğrulandı.

---

## 4. Denetlenebilirlik, Alarm & Destek Görünürlüğü

- **`commerce_events`** (append-only): her geçiş bir satır. `provider_event_id` (Paddle `evt_…`) **UNIQUE** → webhook re-delivery **tek satır** (idempotent). Order satırı olmayan event'ler (payment_failed) `mor_order_ref` ile sorgulanabilir.
- **Alarm:** refund/chargeback → `logger.error` → DSN varsa Sentry `captureException`, her halükârda runtime log (`[commerce] ALERT: …`). payment_failed → `logger.warn` (beklenen/gürültüsüz).
- **Destek görünürlüğü:** `getCommerceEventsForOrder(orderId)` / `getCommerceEventsForRef(txn)` salt-okunur sorgu katmanı — bir order/entitlement'ın tam zaman çizelgesi (paid→refunded→revoked) sorgulanabilir. **Admin UI yüzeyi eklenmedi** (governance: UI redesign yok); audit tablosu + sorgu fonksiyonları destek verisini sağlar. Minimal admin görünümü ileriye bırakıldı (§6).
- **`recordCommerceEvent` best-effort:** audit yazımı asla webhook/revocation yolunu kırmaz (try/catch). Tablo yoksa (örn. prod'da 0004 uygulanana dek) sessizce no-op döner; revocation (orders/entitlements) yine çalışır.

---

## 5. Doğrulama Kanıtları

### 5.1 Kapılar
| Kapı | Sonuç |
|------|-------|
| `npm run lint` | ✅ 0 |
| `npx tsc --noEmit` | ✅ PASS |
| `npm test` (vitest) | ✅ 53/53 |
| `npm run build` | ✅ EXIT 0 |

### 5.2 Runtime (gerçek handler'lar + sandbox)
| Senaryo | Sonuç |
|--------|-------|
| payment_failed → audit; **order satırı YOK**; re-delivery → tek event | ✅ |
| paid order + 'paid' audit | ✅ |
| (refund öncesi) ready → gate erişim VERİYOR; getOwnedBookIds owns | ✅ |
| **refund** → order `refunded`, entitlement `revoked` | ✅ |
| (refund sonrası) gate erişimi **REDDEDİYOR** (`not-ready`) | ✅ |
| (refund sonrası) getOwnedBookIds revoked'ı dışlıyor (re-purchase serbest) | ✅ |
| **alarm** üretildi | ✅ |
| audit trail = paid → refunded → revoked | ✅ |
| refund re-delivery → **idempotent no-op** (tekrar revoke yok; audit deduped) | ✅ |
| **chargeback** → revoked + audit [paid, chargeback, revoked] | ✅ |

**Temizlik:** test user/order/event'leri + R2 test artifact'ı silindi; önceki `e7548256` entitlement'ı **dokunulmadı**.

---

## 6. Açık Riskler & Kararlar

1. **Şema (0004) prod'da YOK:** `commerce_events` yalnız sandbox'a uygulandı. **Faz G cutover'da prod'a 0004 uygulanmalı** (`db:migrate` bozuk → neon sürücüsüyle doğrudan, bkz. [[prod-migration-journal-empty]]). O zamana dek prod'da audit yazımı sessizce no-op olur (revocation yine çalışır — orders/entitlements mevcut).
2. **Kısmi/satır-bazlı iade ertelendi (iş-kararı):** Şu an full-refund → order'ın tüm entitlement'larını revoke. Tek-ürün katalog için doğru; çok-ürünlü order'larda kısmi iade için satır eşleme gerekir (masterplan STOP-AND-REPORT konusu).
3. **Destek admin UI ertelendi:** Görünürlük veri/sorgu katmanında sağlandı; minimal salt-okunur admin görünümü "UI redesign yok" kuralı gereği eklenmedi (ayrı, küçük bir takip işi).
4. **Paddle adjustment `action` adları** (`refund`/`chargeback`/`chargeback_warning`) SDK enum'una göre ele alındı; ilk CANLI iade/dispute event'inde action değeri teyit edilmeli (sandbox simülasyonu kod + tip ile doğrulandı).
5. **Canlı imzalı webhook e2e** hâlâ açık (Faz G/preview-deploy) — refund/chargeback handler'ları gerçek Paddle imzalı event'le henüz tetiklenmedi.

---

## 7. Branch / Commit / Sonraki Adım

- Branch: **`feat/commerce-operations`** (`origin/main` `0c3b1c6` tabanlı), push edilecek, **main'e merge YOK**.
- Commit: `feat(safety): refund/chargeback handling + entitlement revocation + commerce audit/alerting`.
- Geçici scriptler silindi (`scripts/` → yalnız `copy-pdf-worker.mjs`); `drizzle/0004` migration korundu.
- **STOP.** Faz G (Lansman/Cutover) **başlatılmadı** — onay bekleniyor.
