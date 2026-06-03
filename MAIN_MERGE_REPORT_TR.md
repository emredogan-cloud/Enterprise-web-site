# Production Merge Raporu — Faz A–E → `main`

> **Tarih:** 2026-06-03 · **Kaynak:** `integration/commerce-phases-a-e` · **Hedef:** `main` (= Vercel production)
> **Yöntem:** fast-forward (origin/main `3a55fc9` entegrasyon dalının atasıdır) · **Çakışma:** YOK
> **Baseline etiketi:** `POST_PHASE_E_BASELINE`

---

## 0. Neden onaylandı (iş kararı)

Kullanıcı açıkça onayladı: mevcut `main` **eksik bir temeldi ve gerçek müşterilere
hizmet etmiyordu**; `integration/commerce-phases-a-e` artık **otoritatif kod tabanıdır**.
Production merge bu temelde onaylandı. (Önceki fazlardaki "main'e merge yok" kuralı,
bu açık production-merge onayıyla geçersiz kılındı.)

---

## 1. Birleştirilen dallar

| Faz | Kaynak | Entegrasyona giriş yöntemi |
|-----|--------|----------------------------|
| A — Sahiplik-farkında sepet | `d2dc568` | cherry-pick (commerce-foundation SEO'ya repurpose edilmişti) |
| B — Paddle checkout | `feat/paddle-checkout` | merge --no-ff |
| C — Fulfillment | `feat/fulfillment-hardening` | merge --no-ff |
| D — Kütüphane sahipliği | `feat/library-ownership` | merge --no-ff |
| E — Okuma deneyimi | `feat/reader-experience` | merge --no-ff |

Hepsi önce `integration/commerce-phases-a-e`'de birleştirildi (bkz. `POST_MERGE_SYSTEM_AUDIT_TR.md`), sonra bu dal `main`'e fast-forward edildi.

## 2. Birleştirilen commit'ler (`main`'in kazandığı)

```
0a5ba6e feat(commerce): ownership-aware cart + dead checkout-code cleanup   [Phase A]
334ed64 feat(checkout): payment_failed handler + customer.get webhook robustness   [Phase B]
5b77691 docs: recover Phase A-G masterplan + edition/legal reports from stash
e7fd654 feat(fulfillment): wire watermark_jobs + retry-exhaustion alerting; verified e2e   [Phase C]
6cf0525 feat(library): ownership AuthZ consolidation + repeat-download policy   [Phase D]
90ec4fd feat(reader): status-gated Read entry-point + reading-progress ownership gate   [Phase E]
f765ff6 / 6ca2608 / f02dd8e / 7cb7927  — entegrasyon merge commit'leri (B/C/D/E)
0d15828 docs(integration): post-merge system audit
<bu commit> docs(main-merge): main merge report + POST_PHASE_E_BASELINE
```

## 3. Merge mekaniği (önemli)

- `origin/main` (`3a55fc9`), entegrasyon dalının **atasıdır** → **fast-forward** (gerçek merge/çakışma yok). `main`, entegrasyon ucuna ilerletildi; **tüm faz commit'leri + entegrasyon merge commit'leri korunur**.
- `main` SEO worktree'sinde (`/home/emre/Downloads/enterprise-seo-wt`) checkout'lu olduğundan bu worktree'de `git switch main` mümkün değil; merge, `origin/main`'i entegrasyon ucuna ilerleten bir **push refspec** ile gerçekleştirildi.
- **Aksiyon (insan):** SEO worktree'sindeki yerel `main` artık geride; orada `git pull` (fast-forward) ile güncellenmeli. (Otomatik dokunmadım — kullanıcının aktif worktree'si.)
- **Vercel:** `main`'e push → **production deploy tetiklenir.**

## 4. Doğrulama sonuçları

| Aşama | lint | tsc | test (vitest) | build |
|-------|------|-----|------|-------|
| Pre-merge (`0d15828`) | ✅ 0 | ✅ | ✅ 53/53 | ✅ EXIT 0 |
| Post-merge (`main` içeriği = bu rapor commit'i) | ✅ 0 | ✅ | ✅ 53/53 | ✅ EXIT 0 |

Ek olarak (entegrasyon sırasında) her faz birleştirmesinden sonra dört kapı da yeşildi (bkz. `POST_MERGE_SYSTEM_AUDIT_TR.md`) ve uçtan uca sandbox smoke tüm yolculuğun birlikte çalıştığını kanıtladı.

## 5. Kod kaybı yok (doğrulama)

- Push sonrası `origin/main` == entegrasyon ucu (içerik farkı YOK; `git diff origin/main <tip>` boş).
- Faz A–E'nin tüm iş commit'leri `origin/main` geçmişinde mevcut (§2).

## 6. Bilinen kalan boşluklar (⚠️ prod KOD'da, ama henüz LAUNCH-hazır DEĞİL)

Bu merge **kodu** prod'a taşır; **canlı ticareti açmaz**. Faz G (cutover) öncesi:

1. **PROD Paddle fiyatı yok:** prod `neondb`'de Meditations'ın `paddlePriceId`'i hâlâ **sahte** (`pri_test_meditations_999`) → gerçek checkout bu id ile başarısız olur. Gerçek PRODUCTION Paddle Price + env gerekir.
2. **Inngest deploy edilmemiş** (prod) → satın alma olsa bile watermark worker tetiklenmez ("sessiz kuyruk"; `watermark_jobs` artık bunu görünür kılar).
3. **Upstash sağlanmamış** → perimeter rate-limiter fail-open.
4. **Canlı imzalı webhook e2e yapılmadı.**
5. **PROD DB şeması doğrulanmalı:** entegre kod `watermark_jobs`, `reading_progress`, `download_logs` ve `entitlements.watermarked_key/read_status/last_downloaded_at` kolonlarını kullanır. Prod `db:push` ile kuruldu (`__drizzle_migrations` boş; bkz. [[prod-migration-journal-empty]]) → bu tablo/kolonların prod'da **var olduğu DOĞRULANMALI** (yoksa auth-gated commerce/reader yolları runtime'da hata verir). Public katalog (SSG, `safeQuery`) etkilenmez. **Gerçek müşteri yok**, bu yüzden şu an müşteri etkisi yok.
6. **İade/revocation/operasyon** (Faz F) ve **prod cutover/QA/go-live kapısı** (Faz G) henüz yapılmadı.

> **Özet:** Public katalog ve marka sayfaları prod'da güvenle yayınlanır; **ticaret/okuma akışları yalnız sandbox'ta doğrulandı** ve Faz F (güvenlik/operasyon) + Faz G (prod provizyon + cutover) tamamlanana kadar canlı müşteriye açılmamalıdır.

## 7. Baseline etiketi

`POST_PHASE_E_BASELINE` → bu merge sonrası `main` ucuna işaretlendi (git tag; ayrıca burada belgelendi). Faz F bundan dallanır.

## 8. Sonraki adım

**STOP.** Faz F (`feat/commerce-operations`) **başlatılmadı** — onay bekleniyor.
