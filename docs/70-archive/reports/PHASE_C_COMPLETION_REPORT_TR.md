# Faz C — Fulfillment Hattı Tamamlanma Raporu

> **Faz:** C — Fulfillment Hattı (Watermark + Artifact + İş İzleme)
> **Tarih:** 2026-06-03 · **Branch:** `feat/fulfillment-hardening` (origin/main `3a55fc9` tabanlı)
> **Mod:** SANDBOX-only · **main'e merge:** YOK · **Mimari:** ADR-3 (async Social DRM) korundu, yeniden tasarım yok.
> **Kaynak plan:** `CUSTOMER_READY_EXECUTION_MASTERPLAN_TR.md` → FAZ C (+ MASTER PROMPT).

---

## 0. Sonuç (TL;DR)

| Boyut | Durum |
|------|-------|
| `watermark_jobs` yaşam döngüsü (queued→running→succeeded/failed) | ✅ devrede |
| attempts izleme | ✅ (her deneme +1; idempotent no-op deneme harcamaz) |
| error izleme | ✅ (başarısızlıkta kaydedilir, başarıda temizlenir) |
| artifactKey kalıcılığı | ✅ (`watermark_jobs.artifact_key` = `entitlements.watermarked_key`) |
| Fulfillment idempotency korunması | ✅ (mevcut morOrderRef UNIQUE + status short-circuit bozulmadı) |
| Entitlement durum geçişleri | ✅ (pending→ready başarıda; başarısızlıkta pending kalır) |
| Retry-tükenme alarmı | ✅ (`onFailure` → `logger.error` → Sentry/console) |
| Doğrulama kapıları (lint/tsc/build/test) | ✅ hepsi yeşil |
| Uçtan uca runtime (gerçek master + R2 + sandbox DB) | ✅ tüm senaryolar PASS |
| Şema değişikliği | ❌ YOK (idempotency mevcut kısıtlardan miras) |

**DoD karşılandı.** Sandbox satın alma → gerçek master'dan filigranlı artifact üretildi, entitlement `ready` oldu, `watermark_jobs` doğru durum geçişlerini izledi; kasıtlı başarısızlık `failed` + alarm üretti ve entitlement `pending` (indirme kapısı kapalı) kaldı.

---

## 1. Kapsam & Yönetişim

- **Yalnız SANDBOX:** `DATABASE_URL` → `bookstore` (her işlemden önce `current_database()='bookstore'` ASSERT edildi; aksi halde abort). Storage yalnız `bookstore-artifacts-dev` / `bookstore-masters-dev`.
- **Prod'a yazma YOK.** UI redesign YOK. Faz D işi YOK. `main`'e merge YOK.
- **Filigran/teslim mimarisi (ADR-3) değiştirilmedi** — MASTERS→ARTIFACTS akışı, imzalı-URL TTL tavanı (900s), private bucket politikası aynen korundu.
- **Branch:** `feat/fulfillment-hardening`, `origin/main` (`3a55fc9`) tabanlı. Faz B'nin webhook kodu bu branch'te DEĞİL (bilinçli — her faz main'den dallanır).

---

## 2. Ön-Koşul Doğrulaması (varsayım değil, kanıt)

Tüm kontroller gerçek sandbox/servislere karşı koşuldu:

| Kontrol | Sonuç |
|--------|-------|
| `current_database()` | **`bookstore`** (SANDBOX guard ✅) |
| Meditations kitabı | `08eb819e-…` published, `masterFileKey=books/meditations/master/v1/master.pdf`, paddlePriceId mevcut |
| Bekleyen entitlement | 1 adet PENDING mevcuttu (`e7548256-…`) — worker girdisi var |
| `watermark_jobs` (Faz C öncesi) | 0 satır (ölü tablo doğrulandı) |
| R2 master OKUMA | 386.249 bayt, `%PDF-` başlığı (`bookstore-masters-dev`) |
| R2 artifacts YAZMA→OKUMA→SİLME | OK (`bookstore-artifacts-dev`, Object R/W token doğrulandı) |
| Inngest event backbone | erişilebilir (event id döndü); `INNGEST_SIGNING_KEY` mevcut |

---

## 3. Yapılan Kod Değişiklikleri (2 dosya, additive)

### 3.1 `src/lib/fulfillment.ts` — `queued` iş kaydı oluşturma
- `processCompletedTransaction` artık her **yeni** entitlement için (atomik tx içinde, `entitlements ... returning(id)` ile koşullu) bir `watermark_jobs` satırı `queued` durumunda yaratır.
- **Neden burada:** Worker'a hiç ulaşmayan bir fulfillment (Inngest sessiz kuyruk) artık **asla ilerlemeyen bir `queued` satırı** olarak GÖRÜNÜR → "takılan hat" teşhisi (Roadmap §6 / ADR-3). Ölü tablo böylece canlı bir alarm sinyaline dönüşür.
- **Idempotency:** Paddle retry'inde order insert no-op olur ve tx erken döner → iş kaydı **iki kez yaratılmaz**.

### 3.2 `src/inngest/functions/watermark.ts` — yaşam döngüsü + alarm
- **`beginWatermarkJob(entitlementId)`**: `queued|failed → running`, `attempts += 1` (atomik `sql` artışı). İş kaydı yoksa defansif find-or-create.
- **Başarı:** entitlement `ready` + `watermarkedKey` ve iş kaydı `succeeded` + `artifactKey` **tek transaction'da** yazılır → durum ile denetim satırı asla çelişemez.
- **Başarısızlık:** `markWatermarkJobFailed` (`failed` + `error`, ≤1000 char) sonra **re-throw** → Inngest retry. Entitlement bilinçli olarak `pending` kalır (indirme kapısı kapalı).
- **Idempotency short-circuit önce:** entitlement zaten `ready`+`watermarkedKey` ise **deneme harcanmadan** dönülür (re-trigger attempts'i şişirmez); iş kaydı tutarlılık için `succeeded`'e uzlaştırılır.
- **`onFailure` (retry tükenme alarmı):** 3 deneme bitince **bir kez** `logger.error(...)` ile yapılandırılmış ALARM üretir (DSN varsa Sentry'ye `captureException`, her halükârda runtime log). Sessiz sonsuz `pending` yok.
- **`watermarkOneBook` export edildi** — yalnızca test/e2e koşumu için (davranış değişmedi).

> Filigran üretimi (pdf-lib), R2 I/O, e-posta adımı, Inngest step-dedupe **DEĞİŞTİRİLMEDİ**.

---

## 4. `watermark_jobs` Yaşam Döngüsü (durum makinesi)

```
processCompletedTransaction (enqueue)         watermarkOneBook (worker, her deneme)
        │                                              │
        ▼                                              ▼
     [queued] ──────────────────────────────► [running] (attempts += 1)
   (entitlement: pending)                          │
                                          ┌─────────┴──────────┐
                                       başarı                başarısızlık
                                          │                     │
                                          ▼                     ▼
                                    [succeeded]             [failed] (+error)
                          (tx: entitlement ready          (entitlement pending kalır;
                           + artifactKey)                  re-throw → Inngest retry)
                                                                  │
                                                       3 retry tükenince → onFailure ALARM
```

- **Tek satır / entitlement.** `attempts` bir sayaç (satır-başına-deneme değil). Idempotency, üstdeki `orders.mor_order_ref` UNIQUE + entitlement-status short-circuit'ten **miras** alınır → **yeni şema kısıtı / migration gerekmedi** (kırılgan prod migration journal'ına dokunulmadı; bkz. [[prod-migration-journal-empty]]).

---

## 5. Doğrulama Kanıtları

### 5.1 Doğrulama kapıları
| Kapı | Sonuç |
|------|-------|
| `npm run lint` | ✅ 0 uyarı / 0 hata |
| `npx tsc --noEmit` | ✅ PASS |
| `npm test` (vitest) | ✅ 53/53 (6 dosya) |
| `npm run build` | ✅ EXIT 0 (SSG prerender, `/books/meditations` dahil) |

### 5.2 Uçtan uca runtime (gerçek master + R2 + sandbox DB)

**PATH 1 — Başarı + Idempotency**
| İddia | Sonuç |
|------|-------|
| entitlement `pending`, iş kaydı `queued` (attempts=0) | ✅ |
| worker `watermarked` döndü; entitlement `pending→ready` | ✅ |
| iş kaydı `running→succeeded`, attempts=1, artifactKey kalıcı, error=null | ✅ |
| `entitlement.watermarkedKey === watermark_jobs.artifact_key` | ✅ tutarlı |
| Artifact R2 ARTIFACTS'ta geçerli PDF (405.139 B) — master'dan (386.249 B) farklı = filigran uygulandı | ✅ |
| Re-trigger → `already-ready`, attempts **hâlâ 1** (deneme harcamadı), `succeeded` kalıyor | ✅ |

**PATH 2 — Başarısızlık + Retry + Kurtarma** (master anahtarı geçici bozuldu, sonra geri alındı)
| İddia | Sonuç |
|------|-------|
| worker fırlattı (Inngest retry için re-throw) | ✅ |
| iş kaydı `failed`, attempts=1, error=`"The specified key does not exist."` | ✅ |
| entitlement **`pending` kaldı** (indirme kapısı kapalı), watermarkedKey yok | ✅ |
| Retry #2 → attempts=2, hâlâ `failed` | ✅ |
| Master geri alındı → re-run → `failed→succeeded`, attempts=**3**, error temizlendi, entitlement `ready` | ✅ |

**Temizlik:** master anahtarı geri yüklendi; e2e test verisi (2 kullanıcı/order/entitlement/job) + R2 artifact'ları silindi (`watermark_jobs` kalan = 0); Faz B'nin önceden var olan `e7548256` entitlement'ı **dokunulmadan** (`pending`) bırakıldı.

> **Hermetiklik notu:** e2e sırasında enqueue (`inngest.send`) bilinçli olarak no-op'a düşürüldü (cloud koşumu ile yarış olmasın diye) ve worker DOĞRUDAN çağrıldı. Tam-kesin attempts sayıları (1 ve 3) ve dokunulmamış önceki entitlement, dışarıdan paralel bir işleme OLMADIĞINI kanıtlar.

---

## 6. `R2_BUCKET_ARTIFACTS` Bulgusu ve Çözümü (kanıta dayalı)

- **Bulgu:** `.env`'de `R2_BUCKET_ARTIFACTS` **boş** idi; `resolveBucketName()` (`src/lib/storage/index.ts`) bu boşsa fallback OLMADAN hata fırlatır → artifact upload başarısız olurdu.
- **Kanıt:** Bucket `bookstore-artifacts-dev`'in **var olduğu ve yazılabilir olduğu** (PUT/GET/DELETE probe) ön-koşul aşamasında doğrulandı.
- **Çözüm:** `R2_BUCKET_ARTIFACTS=bookstore-artifacts-dev` değeri `.env.local`'e eklendi (gitignored; `.env`'i geçersiz kılar). Yeni gizli anahtar İSTENMEDİ — boş bir değer, doğrulanmış doğru isimle dolduruldu. `R2_ACCOUNT_ID` (kullanıcı listesindeydi) **koda referanslı değil** (`getClient()` yalnız `R2_ENDPOINT/ACCESS/SECRET` kullanır) → eksikliği sorun değil.

---

## 7. Branch / Commit Durumu

- Branch: **`feat/fulfillment-hardening`** (`origin/main` tabanlı), push edildi, **main'e merge YOK**.
- Commit'ler:
  1. `5b77691` — `docs:` stash'te mahsur kalan Faz A–G masterplan + edisyon/legal raporlarının kurtarılması (planlama tarihçesi güvenceye alındı).
  2. `feat(fulfillment): wire watermark_jobs + retry-exhaustion alerting; verified e2e` — bu fazın uygulama commit'i (2 kaynak dosya + bu rapor).

---

## 8. Açık Riskler & Notlar

1. **Inngest CLOUD sync deploy-zamanı kontrolüdür.** Lokal olarak fonksiyon doğru kayıtlı/serve ediliyor (`process-fulfillment-transaction`) ve event backbone erişilebilir; ancak fonksiyonun Inngest Cloud uygulama panosunda görünmesi **dağıtılmış (deployed) bir endpoint** gerektirir → preview/prod deploy'da (Faz G) doğrulanmalı. Worker mantığı bu fazda DOĞRUDAN ve uçtan uca kanıtlandı (transport'tan bağımsız).
2. **Faz B canlı imzalı webhook e2e hâlâ açık** (preview-deploy + webhook-hedefi kararı) — Faz C'yi bloklamadı ama go-live öncesi gerekli.
3. **Idempotency tasarımı şemasız:** iş-kaydı tekilliği üstdeki `mor_order_ref` UNIQUE'ten miras. İleride doğrudan DB-seviyesi garanti istenirse `watermark_jobs.entitlement_id` üzerine UNIQUE index opsiyonel bir sertleştirmedir (bu fazda gereksiz görüldü).
4. **Büyük PDF profili:** pdf-lib Meditations (~377KB) için sorunsuz; çok büyük kitaplar için bellek/timeout profili ileride gözden geçirilmeli (plan §6).

---

## 9. Sonraki Adım

**Faz D (Kütüphane & Sahiplik)** — bu rapor onaylanana kadar **BAŞLANMAYACAK**. Faz C burada **DURUYOR**.

---

## 10. Temizlik Durumu

- Geçici doğrulama/e2e scriptleri **silindi** (`scripts/` → yalnız `copy-pdf-worker.mjs`).
- Sandbox master anahtarı geri yüklendi; e2e test verisi + artifact'ları temizlendi.
- `.env.local`'e yalnız `R2_BUCKET_ARTIFACTS` (gizli değil) eklendi; gizli anahtar commit/log edilmedi.
- Kod değişikliği: 2 kaynak dosya (`fulfillment.ts`, `watermark.ts`) + bu rapor. **main'e merge YOK.**
