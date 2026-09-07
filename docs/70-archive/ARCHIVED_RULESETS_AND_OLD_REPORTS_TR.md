# Arşivlenen Kural Setleri ve Eski Raporlar

**Tarih:** 1 Eylül 2026
**Yöntem:** `node scripts/strategy/archive-docs.mjs --commit`
**Üretilen dizin:** `RULE_SET_INDEX.md`

> **Hiçbir belge silinmedi.** Arşivleme bir taşıma işlemidir; dosyalar orijinal
> adlarıyla `archive/` altında durur ve `git mv` geçmişi korur. Herhangi biri
> tek komutla geri alınabilir.

---

## Özet

| Durum | Adet | Ne yapıldı |
|---|---:|---|
| **ACTIVE** | 34 | Yerinde bırakıldı |
| **CONFLICTING** | 1 | `archive/strategy/` |
| **SUPERSEDED** | 5 | `archive/{reports,strategy}/` |
| **HISTORICAL** | 22 | `archive/reports/` |
| **UNKNOWN** | 0 | — |

Kök dizindeki belge sayısı **38 → 19**'a indi.

**UNKNOWN sıfır olması bir tercih değil, bir sonuçtur:** her belgenin geçerliliği
tarihine, içeriğine ve onu geçersiz kılan daha yeni bir belgenin varlığına
bakılarak tek tek belirlendi. Geçerliliği belirlenemeyen bir belge olsaydı
**yerinde bırakılırdı** — çünkü durumu bilinmeyen bir şeyi arşivlemek, bu
scriptin önlemek için yazıldığı sessiz kaldırmanın ta kendisidir.

---

## 1. CONFLICTING — çelişen (1 belge)

Bu tek belge, yürürlükteki bir kuralla doğrudan çelişiyordu.

| Alan | Değer |
|---|---|
| **Dosya** | `docs/STRATEJI_VE_KITAP_FIKIRLERI.md` |
| **Orijinal tarih** | 2026-05-30 |
| **Yeni konum** | `archive/strategy/STRATEJI_VE_KITAP_FIKIRLERI.md` |
| **Geçersiz kılan** | `VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.md` (2026-08-31) |

**Çelişkinin içeriği.** Arşivlenen belge şunu söylüyordu:

> "Yılda 1–2 başlık. İlk yıl: 1 başlık. **5-6 başlıkta durursanız idealdir.**"
> Nişler: ileri mühendislik rehberleri, yönetici playbook'ları, $99–$399.

Yürürlükteki master strateji bunun tersini söylüyor:

- Yılda 4 başlık **ana gelir için çok yavaştır** — Founder'ın açık hedefi bu.
- Önerdiği iki niş, 30 nişlik matriste **en alttaki beş** arasında
  (mühendislik derin rehberleri 49.1, yönetici playbook'ları 43.1) — pazarları
  kötü olduğu için değil, **Valice'in orada hiçbir varlığı olmadığı için.**

**Founder aksiyonu:** Gerekmez. Master strateji yürürlüktedir. Arşivlenen
belgeyi yalnızca **fiyatlandırma (§8) ve lansman sıralaması (§9)** bölümleri
için okuyun — bu iki bölüm Lane B flagship başlıkları için hâlâ kullanışlıdır
ve master strateji onların yerine bir şey koymuyor.

**Neden silinmedi:** İçindeki değer-bazlı fiyatlandırma mantığı ve 12 aylık
lansman koreografisi hâlâ doğru; yanlış olan tek şey hangi nişe ve hangi
hızda uygulanacağıydı.

---

## 2. SUPERSEDED — yerine yenisi geçen (5 belge)

Hepsi kendi daha yeni sürümü tarafından değiştirildi. Provenans için saklandı.

| Arşivlenen | Tarih | Yerine geçen | Neden |
|---|---|---|---|
| `archive/reports/CATALOG_MASTER_INVENTORY.md` | 08-29 | `CATALOG_MASTER_INVENTORY_FINAL.md` | Envanterin FINAL revizyonu (08-31) |
| `archive/reports/PRODUCTION_VERIFICATION_REPORT.md` | 08-29 | `PRODUCTION_VERIFICATION_FINAL.md` | Doğrulamanın FINAL revizyonu |
| `archive/reports/IMPLEMENTATION_COMPLETION_REPORT.md` | 08-29 | `PHASE_4_COMPLETION_REPORT_TR.md` | Faz 4 tamamlama raporu |
| `archive/strategy/PUBLIC_DOMAIN_8_10_BOOK_PLAN.md` | 08-29 | `PUBLIC_DOMAIN_BATCH_1_PLAN.md` | Güncel kapsam Batch 1 |
| `archive/strategy/FINAL_VALICE_PRESS_BUSINESS_PLAN.html` | 08-29 | `docs/VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.html` | Master yayıncılık stratejisi (08-31) |

**Founder aksiyonu:** Gerekmez.

---

## 3. HISTORICAL — tamamlanmış faz kayıtları (22 belge)

Mayıs–Haziran 2026 inşa döneminin faz raporları. **Kural değil, kayıt.** Sistemin
nasıl bu hale geldiğini açıklarlar; ne yapılması gerektiğini değil.

`archive/reports/` altında:

`PHASE_A_PROVISION_CHECKLIST_TR` · `PHASE_C/D/E/F_COMPLETION_REPORT_TR` ·
`PHASE_G1_PRODUCTION_READINESS_REPORT_TR` · `PHASE_0/1/2/3_COMPLETION_REPORT_TR`
(docs/'tan) · `MAIN_MERGE_REPORT_TR` · `POST_MERGE_SYSTEM_AUDIT_TR` ·
`FINAL_LAUNCH_READINESS_REPORT_TR` · `ROADMAP_COMPLETION_SUMMARY_TR` ·
`CUSTOMER_READY_EXECUTION_MASTERPLAN_TR` · `DESIGN_CORRECTION_PATCH_REPORT_TR` ·
`FIRST_BOOK_INGESTION_REPORT_TR` · `INGESTION_PIPELINE_PATCH_REPORT_TR` ·
`GORSEL_PROMPT_ENVANTERI_TR` · `SESSION_MEMORY_CONTINUE_FROM_HERE_TR` ·
`SINEMATIK_REDESIGN_EXECUTION_PHASES_TR` · `TASARIM_AUDIT_RAPORU_TR`

**Founder aksiyonu:** Gerekmez.

---

## 4. Bilerek ARŞİVLENMEYENLER — ve nedeni

Bu bölüm, arşivleme kararı kadar önemlidir.

### 4.1 Hukuk ve provenans belgeleri — asla arşivlenmez

| Belge | Neden yerinde kaldı |
|---|---|
| `BOOK_ACQUISITION_LEGAL_REPORT_TR.md` | Haklar referansı. **Bir hukuki kayıt, strateji değiştiği için geçerliliğini yitirmez.** |
| `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md` | Yayımlanmış bir başlığın edisyon provenansı — George Long 1862 çevirisinin neden seçildiğinin kanıt zinciri. Arşivlemek, canlı bir ürünün arkasındaki kanıtı gözden kaldırmak olurdu. |

Bu ikisi tarih olarak eski (2026-06-03) ve mekanik bir "tarihe göre arşivle"
kuralı ikisini de taşırdı. **Bu, böyle bir kuralın neden yanlış olduğunun
örneğidir.**

### 4.2 01_REPORTS/ — 11 belgenin tamamı ACTIVE

Bunlar 2026-08-29 tarihli ticari araştırmalar ve master stratejinin **üzerine
inşa ettiği** kaynaklardır, onun yerine geçtiği değil. Özellikle:

- **`KDP_WEBSITE_POLICY_RESEARCH.md` şu anda en kritik aktif belgelerden
  biridir.** Bu fazda inşa edilen companion köprüsünü doğrudan kısıtlayan
  doğrulanmış kuralı içerir: KDP Hyperlink Guidelines, kitap içinden
  **"müşteri bilgisi isteyen web formlarına"** bağlantı vermeyi açıkça
  yasaklar. Companion sayfası tam olarak bu belgenin önerdiği güvenli kalıba
  göre inşa edildi (önce fayda, sonra opsiyonel e-posta).
- `DIRECT_SALES_BUSINESS_MODEL.md`, `EMAIL_LIST_STRATEGY.md`,
  `CUSTOMER_ACQUISITION_STRATEGY.md` — master stratejinin hibrit modeliyle
  tutarlı, çelişkili değil.

### 4.3 `sub-pr-report/` — 20 dosya, yerinde

Mayıs–Haziran döneminin PR bazlı inşa kayıtları. Tek bir tutarlı tarihsel blok
olarak yerinde bırakıldı: kodun provenansıdır, kural değildir, ve iki dizine
bölmek onları okumayı kolaylaştırmaz, zorlaştırır.

---

## 5. Bundan sonra "hangisi geçerli?" sorusu

`RULE_SET_INDEX.md` tek cevap kaynağıdır. Hiçbir şey okumayacaksanız, yürürlükte
olan beş belge şunlardır:

1. `memory/PAST_DECISIONS.md` — kilitli mimari + katalog anayasası
2. `VALICE_PRESS_MASTER_PUBLISHING_STRATEGY_TR.md` — iş modeli
3. `CATALOG_ECONOMICS_FINAL.md` — her başlığın gerçekte ne kazandırdığı
4. `CLAUDE.md` — ajanların bu repoda nasıl çalışacağı
5. `PHASE_4_COMPLETION_REPORT_TR.md` — sistemde şu anda ne olduğu

Dizin elle düzenlenmez; script yeniden çalıştırılarak üretilir:

```bash
node scripts/strategy/archive-docs.mjs          # dry run
node scripts/strategy/archive-docs.mjs --commit # uygula
```

---

## 6. Geri alma

Herhangi bir belge tek komutla geri gelir:

```bash
git mv archive/strategy/STRATEJI_VE_KITAP_FIKIRLERI.md docs/
```

Sonra `archive-docs.mjs` içindeki o satırın `status` alanını `ACTIVE` yapın ve
scripti yeniden çalıştırın — aksi hâlde bir sonraki çalıştırma dosyayı tekrar
arşivler.
