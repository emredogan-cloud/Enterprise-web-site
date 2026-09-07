# Müşteriye Hazır Ticaret & Okuma Hattı — Yürütme Ana Planı

> **Amaç:** Bu plandaki tüm fazlar tamamlandığında, kitap mağazası **ilk gerçek
> müşteriyi uçtan uca** taşıyabilir olacak: gözat → kitap detay → sepete ekle →
> Paddle checkout → ödeme → fulfillment → filigranlı kopya → kütüphanede görünme
> → oku/indir → sahiplik yönetimi → satın alma sonrası deneyim.
>
> **Bu belge bir uygulama (kod) görevi DEĞİLDİR.** Yürütme sırası ve operasyonel
> yol haritasıdır. Her fazın altında, bir terminal ajanının (Claude CLI)
> doğrudan kullanabileceği **MASTER PROMPT** bulunur.
>
> **Tarih:** 2026-06-02 · **Hedef mimari:** Neon (Postgres+Drizzle) · Cloudflare
> R2 · Clerk · Paddle (Merchant of Record) · Inngest · Next.js 16 App Router.

---

## 0. Yönetici Özeti

**En kritik gerçek:** Ticaret/fulfillment hattının **büyük kısmı zaten kodludur
ve birbirine bağlıdır.** Mutlu yol (sepete ekle → checkout → Paddle → webhook →
order/entitlement → watermark → artifact → kütüphane → indir → okuyucu) uçtan
uca **mevcuttur**. Dolayısıyla bu plan "sıfırdan inşa" değil:

> **PROVİZYON (env/dashboard) + BELİRLİ BOŞLUKLARI KAPATMA + UÇTAN UCA DOĞRULAMA.**

Bunu kabul etmek planın doğruluğu için şarttır; aksi halde zaten yazılmış kodu
yeniden yazma riski doğar (mimari kural: **mevcut sistemi yeniden tasarlama**).

### Yüksek seviyede DONE vs KALAN

| Alan | Durum | Kalan iş özü |
|------|-------|--------------|
| Sepet (cookie `dbs_cart`) | ✅ Çalışıyor | Sahiplik farkındalığı yok; ölü kod temizliği |
| Checkout (`createCheckoutSession` → Paddle hosted) | ✅ Çalışıyor | **Env provizyonu**; `paddlePriceId` backfill |
| Webhook (imza doğrulama + `transaction.completed`) | ✅ Çalışıyor | **Sadece tek event**; iade/başarısızlık eventleri YOK |
| Fulfillment (order+item+entitlement, atomik, idempotent) | ✅ Çalışıyor | `customer.get` hatasında sessiz düşme; Inngest deploy |
| Watermark worker (Inngest + pdf-lib, MASTERS→ARTIFACTS) | ✅ Çalışıyor | `watermark_jobs` tablosu **ölü**; başarısızlık alarmı yok |
| Kütüphane (`getUserLibrary` gerçek entitlement) | ✅ Çalışıyor | Kapak görseli prosedürel; öneri rafı demo |
| İndirme (`downloadBook` imzalı URL, audit) | ✅ Çalışıyor | Tekrar-indirme limiti ertelenmiş |
| Okuyucu (`/read/[bookId]` pdf.js, erişim kapısı) | ✅ Kodlu | **UI'da "Oku" linki YOK → okuyucuya erişilemiyor** |
| İade/başarısızlık durum yönetimi | ❌ Yok | `failed`/`refunded`/`revoked` durumları hiç set edilmiyor |
| Operasyon (log/alarm/destek görünürlüğü) | ⚠️ Kısmi | `fulfillment-log` placeholder; alarm yok |

### İlk müşteriyi engelleyen gerçek bloklayıcılar (özet)

1. **Provizyon:** `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENVIRONMENT`,
   R2, Inngest Cloud deploy, Resend domain — hiçbiri prod'da bağlı değil.
2. **`paddlePriceId` + `masterFileKey` her kitap için:** checkout, priceId
   yoksa fail-fast eder; worker, masterFileKey null ise hata fırlatır.
   (Meditations'ın `masterFileKey` **Phase 2'de set edildi**.)
3. **Okuyucuya giriş linki yok** (Faz E) — küçük ama bloklayıcı UI eksiği.
4. **İade/başarısızlık güvenlik açığı** (Faz F) — iade sonrası kopya hâlâ
   indirilebilir kalıyor; prod-güvenli değil.

---

## 1. Mevcut Sistem Envanteri (planın temeli)

Aşağıdaki tablo, dört alt-sistemin kod taramasına dayanır. **Master promptlar bu
envantere göre "kalan"ı hedefler; "DONE" olanı yeniden yazmaz.**

### 1.1 Sepet & Checkout (Faz A/B)
- `src/lib/cart.ts` — httpOnly cookie `dbs_cart`, `{items:[{bookId,addedAt}]}`,
  `safeParseCart`/`readCart`/`writeCart`. DB sepet tablosu yok (kasıtlı).
- `src/app/cart/actions.ts` — `addToCart` (idempotent, qty=1), `removeFromCart`,
  `clearCart`, `createCheckoutSession` (sahiplik kontrolü **yok**; eksik
  `paddlePriceId`'de fail-fast, etkilenen kitapları isimle döndürür).
- `src/lib/paddle.ts` — `getPaddleClient()` (lazy), `isPaddleConfigured()`,
  sandbox/production-aware (`PADDLE_ENVIRONMENT`).
- `src/lib/db/queries/catalog.ts` — `getCartBooks` (:368), `getCheckoutItems`/
  `CheckoutItem` (:413/:421).
- `src/components/cart/cart-summary.tsx` — **canlı checkout butonu burada**.
- **Ölü kod:** `src/components/checkout-button.tsx`, `src/components/cart-buttons.tsx`
  (hiçbir yerde import edilmiyor).

### 1.2 Webhook & Fulfillment (Faz B/C)
- `src/app/api/webhooks/paddle/route.ts` — `webhooks.unmarshal` ile imza
  doğrulama (eksik/geçersiz imza → 401, secret yok → 503); **yalnızca**
  `transaction.completed`.
- `src/lib/fulfillment.ts` — `processCompletedTransaction`: tek `db.transaction`
  içinde orders (`onConflictDoNothing` on `morOrderRef` = Paddle tx id =
  idempotency) + orderItems + entitlements(`pending`); commit sonrası
  `inngest.send`. **`customer.get` hatasında null email → sessizce fulfillment
  yapmadan 200 döner.**
- `src/inngest/functions/watermark.ts` — `processFulfillment` (retries:3):
  MASTERS'tan `masterFileKey` ile çek → `pdf-lib` her sayfayı damgala →
  ARTIFACTS'a `"{orderId}/{bookId}.pdf"` yaz → entitlement `ready` +
  `watermarkedKey` → order-ready email. Katmanlı idempotency (L1 morOrderRef,
  L2 step.run, L3 status short-circuit, L4 Resend idempotencyKey).
- `src/lib/inngest/client.ts`, `src/app/api/inngest/route.ts` — app id
  `"digital-bookstore"`, fonksiyon `process-fulfillment-transaction`.
- `src/lib/email.ts` + `src/emails/order-ready.tsx` — Resend; `EMAIL_FROM` yoksa
  sessiz no-op (bloklamaz).
- **Ölü tablo:** `watermark_jobs` (schema'da var, hiçbir yerde yazılmıyor).

### 1.3 Kütüphane & Sahiplik (Faz D)
- `src/app/account/library/page.tsx` → `getUserLibrary(userId)`
  (`src/lib/db/queries/account.ts`) — gerçek `entitlements`.
- `src/components/library/library-books-grid.tsx` — `status==="ready"` ise
  `<DownloadButton>`; kapak **prosedürel gradyan** (gerçek `coverKey` kullanılmıyor);
  **tile `/books/[slug]`'a linkliyor, `/read/[bookId]`'a değil**.
- `src/app/account/library/actions.ts` — `downloadBook` (AuthN→entitlement
  AuthZ→`status==="ready" && watermarkedKey`→`download_logs`→imzalı ARTIFACTS
  URL→`lastDownloadedAt`), `updateReadStatus`.
- `src/components/library/library-recommendation-shelf.tsx` — **demo (`DEMO_BOOKS`)**.

### 1.4 Okuma & Teslim (Faz E)
- `src/app/read/[bookId]/page.tsx` — AuthN + entitlement AuthZ + status kapısı →
  imzalı ARTIFACTS URL → `reading_progress`'ten devam. **Fonksiyonel ama
  yetim: hiçbir UI buraya link vermiyor.**
- `src/components/reader-shell.tsx` — pdf.js (range request, zoom, klavye,
  ilerleme senkronu). Worker: `public/pdf.worker.min.mjs` (postinstall:
  `scripts/copy-pdf-worker.mjs`).
- `src/lib/storage/index.ts` — `generateSignedDownloadUrl` (TTL 600s, tavan 900s).
- `src/proxy.ts` — Clerk: `/account`, `/admin`, `/order`, `/read` korumalı.

### 1.5 Veri modeli (özet)
Enumlar: `order_status`(pending|paid|failed|refunded),
`entitlement_status`(pending|ready|revoked), `read_status`,
`watermark_job_status`, `book_status`. Anahtar tablolar: `orders`
(`morOrderRef` UNIQUE), `order_items` (`priceCentsAtPurchase`), `entitlements`
(UNIQUE(user,book), `watermarkedKey`, `lastDownloadedAt`), `watermark_jobs`
(ölü), `reading_progress` (UNIQUE(user,book)), `download_logs`. onDelete:
kişisel/türev veride cascade; order/entitlement zincirinde **restrict** (ticari
kayıt silinmez). Migrationlar: `drizzle/` 0000–0002 commit'li; `db:generate`/
`db:migrate`.

> **Şube notu:** Bazı önceki yamalar (örn. admin ilişkisel yazma yolu —
> `book_authors`/`book_categories`) birleşmemiş feature branch'lerde olabilir.
> Mevcut çalışma ağacında SEO çalışması da açık. **Her fazın başında ilgili
> kodun gerçekten mevcut branch'te olduğunu doğrula** (varsayma).

---

## 2. Mimari İlkeler & Yönetişim Kuralları (tüm fazlar için bağlayıcı)

**Mimari (ADR'lere saygı — `memory/PAST_DECISIONS.md` + `roadmap/WEB_SITE_ROADMAP.md`):**
- ADR-2 **Paddle MoR**: kart verisi sunucumuza değmez; VAT/sales-tax MoR'da.
- ADR-3 **Async Social DRM**: order başına filigranlı PDF, kısa-TTL imzalı URL.
- ADR-4 **Okuyucu = PDF.js**. ADR-6 **R2 zero-egress**. ADR-8 **Clerk** + sunucu
  tarafı `Entitlement(user,book).status='ready'` kontrolü.
- **UI/cinematic yeniden tasarımı YOK.** Mevcut akış/şema korunur. Yeni mimari
  icat edilmez.

**Yönetişim / çalışma kuralları (her master prompt bunlara uyar):**
- **Branch→PR→main**; `main` = Vercel production. Ajan feature branch'e push
  eder, **main'e merge için açık insan onayı gerekir**.
- **Prod/durum-değiştiren her aksiyon öncesi açıklama + onay** (kullanıcı temkinli;
  varsayılan: salt-okunur teşhis).
- **Doğrulama kapıları:** her yapısal değişiklikten sonra `npm run lint`,
  `npx tsc --noEmit`, `npm run build`; **şema değişiminde** ayrıca
  `npm run db:generate` + migration review (asla elle `drizzle/meta` düzenleme).
- **Sırlar:** `.env.local` gitignore'da; **asla commit edilmez**. `vercel env pull`
  Sensitive değişkenleri boş çeker; R2/Paddle sırları elle sağlanır ve iş bitince
  diskten temizlenir.
- **Sandbox-first:** Paddle önce **sandbox** ortamında; gerçek kart ile test
  yapılmaz. Prod'a geçiş ayrı, onaylı bir adımdır.
- **Stop-and-report:** gerçek bir hata/bloklayıcı olunca DUR ve raporla; tahmin
  ederek ilerleme.
- **Temizlik:** geçici scriptler iş bitince silinir; yetim obje/dosya bırakılmaz.
- `prompt.txt` ve geçici dosyalar asla commit edilmez.

---

## 3. Faz Bağımlılık Grafiği & Yürütme Sırası

```
A (Ticaret Temeli)
      │  cart doğru + sahiplik + Paddle config hazır
      ▼
B (Paddle Checkout)  ── sandbox uçtan uca satın alma ──┐
      │  paddlePriceId eşleme + webhook + idempotency   │
      ▼                                                 │
C (Fulfillment)  ── Inngest deploy + gerçek master ─────┤
      │  watermark + artifact + job izleme              │
      ▼                                                 │
D (Kütüphane)  ◄── entitlement → owned books ───────────┤
      │                                                 │
      ▼                                                 │
E (Okuma)  ── "Oku" linki + erişim + ilerleme ──────────┘
      │
      ▼
F (Güvenlik & Operasyon)  ── iade/başarısızlık + alarm + destek
      │
      ▼
G (Lansman Hazırlığı)  ── smoke + QA + prod cutover + go-live kapısı
```

- **Sıkı sıra:** A→B→C zorunlu (her biri öncekinin çıktısına dayanır).
- **Paralelleştirilebilir:** D ve E, C tamamlandıktan sonra büyük ölçüde paralel
  (ikisi de entitlement+artifact'e dayanır, birbirine değil).
- **F**, A–E'nin üstüne biner (mutlu yol önce sandbox'ta kanıtlanır, sonra
  sertleştirilir). **G**, F'siz başlatılamaz (iade/güvenlik kapısı go-live şartı).
- **Kritik kural:** Hiçbir faz, kendi "Doğrulama" ve "DoD" maddeleri yeşil
  olmadan bir sonrakini başlatamaz.

---

# 4. FAZLAR

---

## FAZ A — Ticaret Temeli (Cart Correctness & Checkout Hazırlığı)

**Faz hedefi.** Sepet→checkout yolunu doğruluk, sahiplik mantığı ve ölü-kod
temizliği açısından sertleştirmek; Paddle yapılandırmasını **denetlemek** ve
provizyon ön-koşullarını netleştirmek (henüz canlı satın alma yok).

**Neden var.** Hat kodlu ama iki mantık boşluğu var: (1) giriş yapmış bir
kullanıcı **zaten sahip olduğu kitabı** tekrar sepete ekleyip "satın alabilir"
(çift tahsilat, sıfır yeni değer); (2) yetim `checkout-button.tsx`/`cart-buttons.tsx`
kafa karıştırır. Ayrıca Paddle'ın sandbox/prod modu ve `paddlePriceId`
gereksinimi netleşmeden B fazı başlatılamaz.

**Bağımlılıklar.** Yok (hattın giriş kapısı). Sadece mevcut kod taraması.

**Riskler.** • Sahiplik kontrolünü checkout'a eklerken yanlışlıkla yasal
yeniden-satın-almayı (örn. farklı kitap) engellemek. • Ölü kodu silerken canlı
bir referansı kırmak (önce grep ile importer doğrula). • UI'a dokunma yasağını
ihlal etmek (sahiplik rozetini eklemek minimal olmalı, redesign değil).

**Doğrulama gereksinimleri.** `npm run lint`, `npx tsc --noEmit`, `npm run build`
yeşil. Birim/davranış testi: "owned book → addToCart engellenir/işaretlenir" ve
"missing paddlePriceId → checkout calm error". Ölü kod silindikten sonra grep ile
sıfır importer teyidi.

**Tamamlanma tanımı (DoD).**
- `addToCart`/checkout, giriş yapmış kullanıcı için entitlement'e sahip kitabı
  **çift satın almaya götürmez** (sepette "zaten sahipsin" işareti veya engel).
- Eksik `paddlePriceId` davranışı korunur (fail-fast, isimle).
- Ölü `checkout-button.tsx` ve `cart-buttons.tsx` kaldırıldı (veya bilinçli
  bırakıldıysa belgelendi).
- `PADDLE_*` env değişkenlerinin tam listesi ve her kitabın `paddlePriceId`
  ihtiyacı bir **provizyon kontrol listesi** olarak yazıldı (B fazı girişi).
- Lint/tsc/build yeşil; UI görsel olarak değişmedi (yalnızca sahiplik işareti).

**Tahmini kapsam / karmaşıklık.** **S–M.** Çoğunlukla 1 server action + 1 sorgu
(entitlement lookup) + minimal UI işareti + ölü-kod silme + doküman.

**Kesin yürütme sırası.** 1) Kod taraması + provizyon listesi yaz. 2) Sahiplik
sorgusu (mevcut entitlement lookup desenini yeniden kullan). 3) `addToCart`/cart
sayfasına sahiplik işareti/engel. 4) Ölü kodu sil. 5) Doğrula. 6) Feature branch
+ PR (main'e merge insan onayı).

### MASTER PROMPT — FAZ A

```
GÖREV: Ticaret Temeli — sepet doğruluğu + sahiplik mantığı + Paddle config denetimi.

BAĞLAM: Sepet/checkout hattı zaten kodlu (src/lib/cart.ts, src/app/cart/actions.ts,
src/lib/paddle.ts, src/components/cart/cart-summary.tsx). Bu görev sıfırdan inşa
DEĞİL; mantık boşluklarını kapatma + temizlik.

ÖN-OKUMA (değiştirmeden):
- src/lib/cart.ts, src/app/cart/actions.ts, src/app/cart/page.tsx
- src/lib/paddle.ts, src/lib/db/queries/catalog.ts (getCartBooks, getCheckoutItems)
- src/lib/db/queries/account.ts (entitlement/library sorguları)
- src/components/cart/*, src/components/book-detail/book-add-to-cart.tsx
- memory/PAST_DECISIONS.md (ADR-2 Paddle MoR)

DO:
- Giriş yapmış kullanıcı için "kullanıcı bu kitaba sahip mi?" kontrolünü, MEVCUT
  entitlement lookup desenini yeniden kullanarak ekle (yeni helper makul).
- Sahip olunan kitap için: /cart ve book-detail add-to-cart yüzeyinde "Zaten
  sahipsin — Kütüphane" işareti göster; createCheckoutSession sahip olunan
  kalemleri checkout'tan dışla VEYA net hata ver (çift tahsilatı engelle).
- Eksik paddlePriceId fail-fast davranışını KORU.
- Ölü kodu sil: önce `grep -rn "checkout-button\|cart-buttons" src` ile sıfır
  importer doğrula; doğrulanırsa src/components/checkout-button.tsx ve
  src/components/cart-buttons.tsx sil.
- PADDLE_API_KEY/PADDLE_WEBHOOK_SECRET/PADDLE_ENVIRONMENT/NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  kullanım durumunu ve her published kitabın paddlePriceId ihtiyacını
  PHASE_A_PROVISION_CHECKLIST_TR.md olarak yaz.

DO NOT:
- UI/cinematic tasarımı YENİDEN TASARLAMA. Sadece minimal sahiplik işareti.
- Paddle'a CANLI çağrı yapma, gerçek ödeme/checkout başlatma.
- Şemayı değiştirme (bu faz şema gerektirmez). DB'ye yazma.
- Anonim sepet → DB merge gibi kapsam dışı özellik ekleme.

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build (hepsi yeşil).
- Davranış kontrolü: owned-book senaryosu (sahiplik işareti/engel) + missing
  paddlePriceId calm error; mümkünse vitest ile saf mantık testi.
- Silinen dosyalar için grep ile sıfır kalan referans.

STOP-AND-REPORT: Sahiplik kontrolü için entitlement sorgusunda belirsizlik
(hangi status sayılır?) veya bir importer'ın gerçekten canlı olması gibi gerçek
bir engelde DUR ve raporla.

COMMIT/PUSH: feat/commerce-foundation branch'ine commit + push.
main'e MERGE ETME (insan onayı gerekir). Mesaj:
"feat(commerce): ownership-aware cart + dead checkout-code cleanup".

CLEANUP: Geçici script bırakma. PHASE_A_PROVISION_CHECKLIST_TR.md kalsın.
RAPOR: değişen dosyalar, sahiplik mantığı, doğrulama sonuçları, provizyon listesi,
açık riskler. Sonra DUR.
```

---

## FAZ B — Paddle Checkout Entegrasyonu (Canlı Checkout — önce Sandbox)

**Faz hedefi.** Paddle'ı (önce sandbox) uçtan uca çalışır hale getirmek:
ürün/fiyat eşleme (`paddlePriceId`), webhook kaydı + imza doğrulama, ödeme
başarı/başarısızlık durumları ve çift-satın-alma koruması — **gerçek bir
sandbox satın almasıyla kanıtlanmış** olarak.

**Neden var.** Kod hazır ama Paddle tarafı (API key, fiyat nesneleri, webhook
endpoint + secret) bağlı değil. "Bir paying customer ama kitap yok" en kötü hata
(ADR/§9); bu yüzden hat **canlı parayla değil, sandbox'ta** önce kanıtlanmalı.

**Bağımlılıklar.** Faz A (sahiplik + fail-fast). Paddle sandbox hesabı (İNSAN
dashboard işi). En az bir published kitap (`paddlePriceId` + `masterFileKey` —
Meditations hazır).

**Riskler.** • **İnsan-dashboard adımları** (Paddle ürün/fiyat oluşturma, webhook
kaydı, secret kopyalama) ajan tarafından yapılamaz → açık stop-and-report
gerekir. • Yanlış `PADDLE_ENVIRONMENT` ile sandbox priceId'lerin prod'a sızması.
• Webhook secret yanlışsa sessiz 401/503 (fulfillment olmaz). • `customer.get`
geçici hatasında siparişin sessizce düşmesi (kod boşluğu — bu fazda en azından
loglanmalı/retry edilmeli).

**Doğrulama gereksinimleri.** Sandbox'ta gerçek uçtan uca: sepet → checkout URL →
Paddle sandbox ödeme → webhook 200 → `orders`/`order_items`/`entitlements`
satırları oluştu. İmza doğrulama negatif testi (geçersiz imza → 401).
İdempotency: aynı webhook iki kez → tek order (morOrderRef UNIQUE). Eksik
priceId → checkout calm error.

**Tamamlanma tanımı (DoD).**
- Sandbox'ta tam bir satın alma `entitlements(status='pending')` üretir ve
  webhook idempotent davranır (tekrar → no-op).
- Tüm published kitapların `paddlePriceId`'i set (admin üzerinden) ve checkout
  hiçbir kalemde fail-fast etmiyor.
- `payment_failed` (veya `transaction.payment_failed`) eventi en azından
  **order.status='failed'** olarak işleniyor (sessiz yutma yok).
- `customer.get` hatasında sipariş **düşmüyor** (retry/log/yeniden işleme).
- Sandbox→prod geçişi için net bir "cutover" notu yazıldı (gizli; G fazında
  uygulanır).

**Tahmini kapsam / karmaşıklık.** **M.** Kod tarafı küçük (failure event +
robustness); ağırlık Paddle dashboard provizyonu + uçtan uca sandbox QA'da.

**Kesin yürütme sırası.** 1) Sandbox env doğrula/iste (insan). 2) Her kitap için
`paddlePriceId` set (admin) + doğrula. 3) Webhook'u Paddle sandbox'ta `/api/
webhooks/paddle`'a kaydet + secret. 4) Sandbox satın alma → DB doğrula. 5)
İmza/idempotency/failed-event testleri. 6) `customer.get` robustness. 7) Branch+PR.

### MASTER PROMPT — FAZ B

```
GÖREV: Paddle Checkout entegrasyonunu SANDBOX'ta uçtan uca çalışır + doğrulanmış
hale getir; payment-failed durumunu işle; customer.get hatasını sağlamlaştır.

BAĞLAM: Webhook + fulfillment kodlu (src/app/api/webhooks/paddle/route.ts,
src/lib/fulfillment.ts, src/lib/paddle.ts). Yalnızca transaction.completed
işleniyor. Bu görev: provizyon + sandbox QA + eksik failure event.

ÖN-OKUMA: yukarıdaki 3 dosya + src/lib/inngest/client.ts + memory/PAST_DECISIONS.md.

İNSAN ÖN-KOŞULLARI (ajan yapamaz — eksikse DUR ve iste):
- Paddle SANDBOX hesabı; PADDLE_API_KEY (sandbox), PADDLE_WEBHOOK_SECRET,
  PADDLE_ENVIRONMENT="sandbox" .env.local'e eklenmiş.
- Paddle'da her published kitap için Price (pri_...) oluşturulmuş.
- Webhook endpoint Paddle sandbox'ta {DEPLOY_URL}/api/webhooks/paddle olarak
  kayıtlı (transaction.completed + transaction.payment_failed abonelikleri).

DO:
- Her published kitabın paddlePriceId'ini set et/doğrula (mevcut admin update
  yolu; salt-okunur teyit + gerekiyorsa tek tek). Eksik kalan listesini raporla.
- transaction.payment_failed (ve ilgili başarısızlık eventi) için handler ekle:
  ilgili order'ı status='failed' yap VEYA failed order kaydı oluştur; idempotent.
- customer.get başarısızlığını sağlamlaştır: sessiz 200 + düşme YERİNE hatayı
  fırlat (Paddle retry'ı tetiklensin) ya da en azından yapılandırılmış log +
  yeniden işleme kuyruğu. Mevcut idempotency'yi (morOrderRef) bozma.
- SANDBOX'ta uçtan uca satın alma gerçekleştir (insan ödeme adımını yaparsa onu
  bekle) ve DB'de orders/order_items/entitlements satırlarını DOĞRULA.

DO NOT:
- PRODUCTION Paddle anahtarı/fiyatı kullanma. Gerçek kart ile test etme.
- main'e merge etme. UI redesign yapma.
- İmza doğrulama akışını zayıflatma (unmarshal her side-effect'ten ÖNCE kalır).
- Şema değişikliği gerekiyorsa (failed order için) önce db:generate + migration
  review; elle drizzle/meta düzenleme YOK.

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build.
- Sandbox uçtan uca: webhook 200 + DB satırları (orders.status='paid',
  entitlements 'pending'). İmza negatif testi → 401. Çift webhook → tek order.
  payment_failed → order 'failed'. Eksik priceId → calm error.

STOP-AND-REPORT: Paddle dashboard ön-koşulları eksikse, webhook secret/endpoint
doğrulanamıyorsa, ya da uçtan uca sandbox akışı tamamlanamıyorsa DUR ve net
talimatla raporla (hangi dashboard adımı gerekli).

COMMIT/PUSH: feat/paddle-checkout branch'i. main'e MERGE YOK.
Mesaj: "feat(checkout): payment-failed handling + webhook robustness; sandbox e2e verified".
.env.local ASLA commit edilmez.

CLEANUP: Sandbox test verisi DB'de kalabilir (ayrı not düş); geçici script silinir.
RAPOR: sandbox akış sonucu, eklenen failure handling, paddlePriceId durumu,
sandbox→prod cutover notu, açık riskler. Sonra DUR.
```

---

## FAZ C — Fulfillment Hattı (Watermark + Artifact + İş İzleme)

**Faz hedefi.** Ödeme sonrası asenkron fulfillment'ı gerçek master dosyaya karşı
çalışır kılmak: Inngest'i deploy/senkronize etmek, watermark worker'ını gerçek
Meditations master'ıyla doğrulamak, ve **`watermark_jobs` tablosunu** başarısızlık
izleme + tükenen retry alarmı için devreye almak.

**Neden var.** Worker kodlu ama (1) Inngest Cloud'a deploy edilmezse eventler
kuyruğa girer, hiçbir şey çalışmaz; (2) başarısızlık görünürlüğü yok — 3 retry
tükenince entitlement sonsuza dek `pending` kalır, order sayfası sonsuz poll
eder, alarm yoktur; (3) `watermark_jobs` ölü.

**Bağımlılıklar.** Faz B (gerçek `entitlements(pending)` üreten satın alma).
`masterFileKey` set (Meditations hazır). R2 MASTERS/ARTIFACTS env (İNSAN).
Inngest hesabı + signing/event key (İNSAN).

**Riskler.** • Inngest deploy edilmezse "sessiz kuyruk" (en sinsi hata). • R2
ARTIFACTS bucket veya creds eksikse worker imzalı URL/putObject'te patlar. •
`watermark_jobs` wiring'i mevcut entitlement-status idempotency'siyle çelişebilir
(ikisi tutarlı olmalı). • pdf-lib büyük dosyada bellek/timeout (Meditations 380KB
sorun değil; ileride büyük PDF'ler için not).

**Doğrulama gereksinimleri.** Sandbox satın alma → Inngest fonksiyonu tetiklenir →
ARTIFACTS'ta `{orderId}/{bookId}.pdf` oluşur → entitlement `ready` +
`watermarkedKey` → order-ready email (Resend varsa). `watermark_jobs` satırı
`queued→running→succeeded` izler. Kasıtlı başarısızlık (örn. masterFileKey'i
geçici boz) → job `failed` + alarm/log + entitlement `pending` kalır (download
gate kapalı).

**Tamamlanma tanımı (DoD).**
- Sandbox satın alma, gerçek master'dan **filigranlı artifact** üretir ve
  entitlement `ready` olur; indirme imzalı URL ile çalışır.
- `watermark_jobs` artık **yazılıyor** (queued/running/succeeded/failed +
  attempts + error + artifactKey); başarısızlıkta DB-sorgulanabilir durum var.
- Retry tükenince **alarm/log** (Sentry/console + DB `failed`) — sessiz sonsuz
  pending yok.
- `customer.get`/boş bookIds gibi erken-dönüş yolları artık sessizce düşmüyor
  (Faz B ile tutarlı).
- Inngest fonksiyonu Inngest Cloud'da kayıtlı/senkronize (deploy doğrulandı).

**Tahmini kapsam / karmaşıklık.** **M–L.** Worker mevcut; `watermark_jobs`
wiring + alarm + Inngest deploy doğrulama + uçtan uca QA.

**Kesin yürütme sırası.** 1) R2/Inngest env doğrula (insan). 2) Inngest deploy/
sync doğrula. 3) Sandbox satın alma → artifact + entitlement ready doğrula. 4)
`watermark_jobs` lifecycle wiring (worker içinde). 5) Retry-exhaustion alarmı.
6) Kasıtlı başarısızlık testi. 7) Branch+PR.

### MASTER PROMPT — FAZ C

```
GÖREV: Fulfillment hattını gerçek master'a karşı doğrula; watermark_jobs tablosunu
devreye al; retry-tükenme alarmı ekle; Inngest deploy'unu doğrula.

BAĞLAM: Worker kodlu (src/inngest/functions/watermark.ts), gerçek pdf-lib
filigranı, MASTERS→ARTIFACTS, entitlement 'ready'. watermark_jobs tablosu ölü.
Meditations masterFileKey set (Phase 2).

ÖN-OKUMA: src/inngest/functions/watermark.ts, src/lib/inngest/client.ts,
src/app/api/inngest/route.ts, src/lib/storage/index.ts, src/lib/db/schema.ts
(watermark_jobs), src/lib/email.ts.

İNSAN ÖN-KOŞULLARI (eksikse DUR ve iste):
- R2 env: R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY + R2_BUCKET_MASTERS +
  R2_BUCKET_ARTIFACTS (Object Read&Write yetkili token).
- Inngest: INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY; fonksiyon Inngest Cloud'a
  deploy/sync edilmiş (process-fulfillment-transaction görünür).
- (Opsiyonel) Resend: RESEND_API_KEY + EMAIL_FROM (yoksa email no-op, bloklamaz).

DO:
- watermark_jobs lifecycle'ını worker'a bağla: iş başında 'queued/running',
  başarıda 'succeeded'+artifactKey, hata/attempts artışında 'failed'+error.
  MEVCUT entitlement-status idempotency'sini bozmadan, onunla TUTARLI tut.
- Retry tükenmesinde (Inngest 3 deneme) yapılandırılmış alarm/log üret (Sentry
  varsa capture; ayrıca watermark_jobs 'failed' kalıcı kayıt). Order sayfası
  sonsuz poll etmesin diye bir 'failed' sinyali görünür olsun.
- Sandbox satın alma ile uçtan uca DOĞRULA: ARTIFACTS'ta artifact, entitlement
  'ready', indirme imzalı URL çalışıyor.
- Kasıtlı başarısızlık senaryosu kur (örn. geçici geçersiz key) ve job 'failed' +
  entitlement 'pending' kaldığını + download gate kapalı olduğunu doğrula; sonra
  ortamı geri al.

DO NOT:
- Filigran/teslim mimarisini DEĞİŞTİRME (ADR-3 social DRM korunur). MASTERS'ı
  asla public yapma; imzalı URL TTL tavanını (900s) aşma.
- main'e merge etme. UI redesign yapma. Büyük refaktör yapma.
- Şema değişikliği gerekiyorsa db:generate + migration review; elle meta YOK.

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build.
- Uçtan uca: artifact üretildi, entitlement 'ready', watermark_jobs satırları
  doğru durum geçişi, başarısızlık senaryosu 'failed' + alarm.
- Inngest dashboard'da run görünür (deploy doğrulandı).

STOP-AND-REPORT: Inngest deploy/sync doğrulanamıyorsa, R2 ARTIFACTS erişimi
yoksa, ya da artifact üretilemiyorsa DUR ve raporla.

COMMIT/PUSH: feat/fulfillment-hardening branch'i. main'e MERGE YOK.
Mesaj: "feat(fulfillment): wire watermark_jobs + retry-exhaustion alerting; verified e2e".

CLEANUP: Test artifact'ları ARTIFACTS'ta kalabilir (not düş) ya da test order'ı
işaretle; geçici script silinir; bozulan env geri alınır.
RAPOR: artifact doğrulama, watermark_jobs durumları, alarm davranışı, Inngest
deploy durumu, açık riskler. Sonra DUR.
```

---

## FAZ D — Kütüphane & Sahiplik Sistemi (Entitlement → Owned Books)

**Faz hedefi.** Satın alma → entitlement → kütüphane görünürlüğü zincirini
doğrulamak ve sertleştirmek: sahiplik doğrulaması, tekrar-indirme politikası ve
(kozmetik) kapak görseli.

**Neden var.** `getUserLibrary` gerçek entitlement'leri döndürüyor ve indirme
çalışıyor; ama (1) tekrar-indirme limiti yok (audit var, limiter yok); (2)
kütüphane kapakları prosedürel (gerçek `coverKey` kullanılmıyor); (3) öneri rafı
demo. Bunlar lansmanı bloklamaz ama "müşteriye hazır" deneyim için kapatılmalı.

**Bağımlılıklar.** Faz C (gerçek `ready` entitlement + artifact). Mevcut
`download_logs` audit (limiter'ın veri kaynağı).

**Riskler.** • Tekrar-indirme limiti çok katı olursa meşru sahibi engeller
(perpetual ownership ilkesi). • Kapak görseli için R2/asset katmanına dokunurken
UI redesign'a kaymak. • Öneri rafını "gerçek"e çevirmek kapsam kayması olabilir
(lansman için demo kabul edilebilir — netleştir).

**Doğrulama gereksinimleri.** Sahip olunan kitap kütüphanede `ready` ve indiriliyor;
sahip olunmayan kitap için indirme/okuma reddediliyor (AuthZ). Tekrar-indirme
politikası (örn. makul pencere/limit) `download_logs` üzerinden çalışıyor ve
meşru sahibi engellemiyor.

**Tamamlanma tanımı (DoD).**
- Kütüphane gerçek owned books'u doğru durumlarla (pending/ready/revoked) gösterir.
- Sahiplik doğrulaması indirme + okuma + read-status yollarında tutarlı (mevcut
  4-yer deseni korunur veya tek helper'a toplanır — davranış aynı).
- Tekrar-indirme politikası tanımlı ve uygulanıyor (limiter veya bilinçli "sınırsız
  + audit" kararı yazılı).
- (Kozmetik, opsiyonel-onaylı) kütüphane kapağı gerçek `coverKey`/asset kullanır
  ya da bilinçli prosedürel bırakılır (belgelenir).

**Tahmini kapsam / karmaşıklık.** **S–M.** Çoğu zaten var; limiter + doğrulama +
(ops.) kapak.

**Kesin yürütme sırası.** 1) Sahiplik/indirme yollarını doğrula. 2) Tekrar-indirme
politikası kararı + uygulama (Upstash ratelimit zaten var). 3) (Ops.) kapak. 4)
Doğrula. 5) Branch+PR.

### MASTER PROMPT — FAZ D

```
GÖREV: Kütüphane & sahiplik sistemini doğrula + sertleştir: ownership AuthZ,
tekrar-indirme politikası, (opsiyonel) gerçek kapak.

ÖN-OKUMA: src/app/account/library/page.tsx, src/lib/db/queries/account.ts
(getUserLibrary), src/app/account/library/actions.ts (downloadBook,
updateReadStatus), src/components/library/*, src/lib/storage/index.ts,
src/proxy.ts; mevcut Upstash ratelimit kullanımları.

DO:
- Sahiplik doğrulamasını indirme + (Faz E ile uyumlu) okuma yollarında doğrula;
  istersen tek `userOwnsBook(userId, bookId)` helper'ına topla — DAVRANIŞ AYNI
  kalmalı (status='ready' && watermarkedKey).
- Tekrar-indirme politikası: download_logs + Upstash ile makul bir per-entitlement
  hız limiti uygula VEYA "sınırsız + audit" kararını gerekçesiyle yaz. Meşru
  perpetual sahibi ASLA kalıcı engelleme.
- (Opsiyonel, ONAY iste) Kütüphane tile kapağını gerçek coverKey/asset ile bağla;
  yoksa prosedürel bırak ve belgele. Öneri rafının demo olduğu lansman için
  kabul; raporda belirt.

DO NOT:
- Perpetual ownership ilkesini bozma (kalıcı kilitleme yok). UI redesign yapma.
- Sahip olunmayan kitaba erişim açma. main'e merge etme.
- Öneri motorunu "gerçek kişiselleştirme"ye dönüştürme (kapsam dışı).

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build.
- AuthZ: sahip olunan kitap indirilir/okunur; sahip olunmayan reddedilir.
- Rate-limit: meşru tekrar-indirme çalışır; aşırı hız sınırlanır (varsa).

STOP-AND-REPORT: Sahiplik durumlarının belirsizliği veya rate-limit eşik kararı
gibi iş-kararı gerektiren noktada DUR ve sor.

COMMIT/PUSH: feat/library-ownership branch'i. main'e MERGE YOK.
Mesaj: "feat(library): ownership AuthZ consolidation + repeat-download policy".
CLEANUP: geçici script yok. RAPOR: doğrulama + politika kararı + açık konular. DUR.
```

---

## FAZ E — Okuma Deneyimi (Reader Erişimi + Teslim + Kalıcılık)

**Faz hedefi.** Sahip olunan kitabın tarayıcıda okunabilmesini sağlamak: **eksik
"Oku" giriş linkini eklemek** (tek gerçek bloklayıcı), erişim kontrollerini
doğrulamak, okuma ilerlemesi kalıcılığını ve indirme/okuma UX'ini bütünlemek.

**Neden var.** `/read/[bookId]` okuyucusu (pdf.js, erişim kapısı, ilerleme
senkronu) **tamamen kodlu ama yetim** — hiçbir UI ona link vermiyor; müşteri
ancak URL'i elle yazarak erişebilir. İndirme çalışıyor; online okuma erişilemiyor.

**Bağımlılıklar.** Faz C (`ready` entitlement + ARTIFACTS artifact). Faz D
(sahiplik doğrulaması). `public/pdf.worker.min.mjs` (postinstall).

**Riskler.** • "Oku" linkini eklerken status kapısını unutmak (pending/revoked'da
gösterme). • UI'a dokunurken redesign'a kaymak — link minimal olmalı. • pdf.js
worker prod'da yoksa okuyucu patlar (postinstall doğrula).

**Doğrulama gereksinimleri.** Kütüphaneden `ready` kitapta "Oku" → `/read/[bookId]`
açılır, pdf.js artifact'ı imzalı URL ile render eder, ilerleme kaydedilir ve
yeniden açışta devam eder. Sahip olunmayan/`pending` kitapta okuyucu reddeder
(notFound/calm). İndirme yolu bozulmamış.

**Tamamlanma tanımı (DoD).**
- Kütüphane tile/list `status==='ready'` için **"Oku" linki** (`/read/[bookId]`)
  gösterir; pending/revoked'da göstermez.
- Okuyucu erişim kapısı (AuthN+entitlement+status) ve imzalı ARTIFACTS teslimi
  doğrulandı; MASTERS asla okuyucuya gitmez.
- Okuma ilerlemesi (`reading_progress`) kaydediliyor ve devam ediyor.
- İndirme + okuma birlikte tutarlı UX (ikisi de `ready`'ye bağlı).

**Tahmini kapsam / karmaşıklık.** **S.** Esas iş tek link + status kapısı +
doğrulama. Okuyucunun kendisi hazır.

**Kesin yürütme sırası.** 1) `library-books-grid.tsx`'e status-kapılı "Oku" linki.
2) Okuyucu erişim + ilerleme uçtan uca doğrula. 3) pdf.js worker prod kontrolü.
4) Branch+PR.

### MASTER PROMPT — FAZ E

```
GÖREV: Okuma deneyimini erişilebilir kıl — eksik "Oku" linkini ekle, okuyucu
erişim + ilerleme + teslimi doğrula.

BAĞLAM: /read/[bookId] okuyucusu TAM kodlu ama YETİM (UI linki yok). Bu görev
küçük: status-kapılı link + uçtan uca doğrulama. Okuyucuyu YENİDEN YAZMA.

ÖN-OKUMA: src/app/read/[bookId]/page.tsx, src/components/reader-shell.tsx,
src/app/read/[bookId]/actions.ts (syncReadingProgress),
src/components/library/library-books-grid.tsx, src/app/account/library/actions.ts,
scripts/copy-pdf-worker.mjs, src/proxy.ts.

DO:
- library-books-grid.tsx (grid + list + shelf görünümleri) içinde,
  entry.status==='ready' için `/read/{entry.bookId}` linkli minimal bir "Oku"
  aksiyonu ekle (mevcut DownloadButton'ın yanında). pending/revoked'da gösterme.
- Stil mevcut cinematic dil ile UYUMLU ve MİNİMAL olsun (yeni bileşen/redesign yok).
- Okuyucu erişimini doğrula: sahip + ready → açılır; sahip değil/pending →
  notFound/calm. İlerleme kaydı + devam çalışıyor.
- public/pdf.worker.min.mjs'in prod build'de mevcut olduğunu doğrula (postinstall).

DO NOT:
- Okuyucuyu (reader-shell) yeniden tasarlama/yeniden yazma. Yeni reader rotası
  ekleme. MASTERS'ı okuyucuya bağlama (yalnız ARTIFACTS imzalı URL).
- UI redesign. main'e merge. Erişim kapısını gevşetme.

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build.
- Uçtan uca: ready kitapta "Oku" → render + ilerleme + devam; pending/non-owned →
  ret. İndirme yolu hâlâ çalışıyor.

STOP-AND-REPORT: Okuyucu erişim kapısında beklenmedik davranış veya pdf.js worker
prod'da eksikse DUR ve raporla.

COMMIT/PUSH: feat/reading-access branch'i. main'e MERGE YOK.
Mesaj: "feat(reader): add status-gated Read entry-point into the library".
CLEANUP: geçici script yok. RAPOR: link + doğrulama + worker durumu. DUR.
```

---

## FAZ F — Ticaret Güvenliği & Operasyon (İade/Başarısızlık + Denetlenebilirlik)

**Faz hedefi.** Hattı **prod-güvenli** yapmak: iade/dispute/başarısızlık event
yönetimi + entitlement iptali (`revoked`), webhook denetlenebilirliği, fulfillment
log'unun üretimleştirilmesi, takılan fulfillment alarmı, destek görünürlüğü ve
kötüye kullanım önleme.

**Neden var.** En yüksek-etkili güvenlik açığı: **iade sonrası müşteri kalıcı
indirilebilir kopyaya sahip kalıyor** (revocation yok). Sadece
`transaction.completed` işleniyor; MoR olarak Paddle `payment_failed`,
`adjustment`/refund, dispute eventleri gönderir — hepsi yok sayılıyor. UI zaten
`refunded`/`revoked` göstermeye HAZIR ama hiçbir kod bu durumları set etmiyor.
`fulfillment-log` "PLACEHOLDER"; takılan iş için alarm yok.

**Bağımlılıklar.** Faz B (webhook + payment_failed temeli), Faz C (job izleme +
alarm zemini). Şema yeterli (`order_status`/`entitlement_status` enumları mevcut).

**Riskler.** • İade akışında entitlement'ı iptal ederken meşru erişimi yanlışlıkla
kesmek (yalnız ilgili order'a bağlı entitlement). • İdempotency: aynı refund eventi
iki kez → tek iptal. • MoR semantiği: kısmi iade vs tam iade ayrımı. • Destek
görünürlüğü için admin'e veri eklerken UI redesign'a kaymak.

**Doğrulama gereksinimleri.** Sandbox'ta refund/adjustment eventi simüle →
`order.status='refunded'` + ilgili `entitlement.status='revoked'` + indirme/okuma
artık reddediliyor (revoked gate). `payment_failed` → `order.status='failed'`.
İdempotent (çift event → tek geçiş). Takılan fulfillment senaryosunda alarm/log
üretiliyor ve DB'de görülebiliyor. Webhook event'leri denetlenebilir biçimde
kaydediliyor.

**Tamamlanma tanımı (DoD).**
- Refund/dispute eventleri işleniyor: order `refunded`, entitlement `revoked`;
  download + reader **revoked**'da erişimi reddediyor.
- `payment_failed` → order `failed` (Faz B ile tutarlı/tamamlanmış).
- `fulfillment-log` üretim seviyesinde (yapılandırılmış log + kalıcı denetim;
  Vercel'de no-op dosya yazımı yerine DB/Sentry).
- Takılan fulfillment (retry tükenmiş) için alarm + DB'den sorgulanabilir durum.
- Destek görünürlüğü: admin bir order/entitlement'ın durumunu (paid/refunded/
  ready/revoked, job durumu) görebiliyor (mevcut admin yüzeyini genişleterek,
  redesign etmeden).
- Kötüye kullanım: indirme hız limiti + webhook replay koruması (idempotency)
  doğrulanmış.

**Tahmini kapsam / karmaşıklık.** **L.** En büyük kod fazı (yeni event handler'lar
+ revocation + denetim + alarm + destek görünürlüğü). Şema gerekmeyebilir
(enumlar var); gerekirse migration.

**Kesin yürütme sırası.** 1) Refund/dispute handler + revocation. 2) revoked
gate'in download+reader'da etkinliğini doğrula. 3) fulfillment-log üretimleştir.
4) Takılan-iş alarmı (Faz C ile). 5) Webhook denetim kaydı. 6) Destek görünürlüğü
(admin). 7) Sandbox simülasyon QA. 8) Branch+PR.

### MASTER PROMPT — FAZ F

```
GÖREV: Ticaret güvenliği & operasyon — iade/dispute/başarısızlık event yönetimi +
entitlement revocation, denetlenebilirlik, takılan-iş alarmı, destek görünürlüğü.

BAĞLAM: Yalnızca transaction.completed işleniyor; refund/dispute/payment_failed YOK.
UI revoked/refunded göstermeye hazır ama hiçbir kod bu durumları set etmiyor.
fulfillment-log placeholder. order_status/entitlement_status enumları zaten mevcut.

ÖN-OKUMA: src/app/api/webhooks/paddle/route.ts, src/lib/fulfillment.ts,
src/lib/fulfillment-log.ts, src/lib/db/schema.ts (order/entitlement enumları),
src/app/account/library/actions.ts (download gate), src/app/read/[bookId]/page.tsx,
src/components/order/order-items-panel.tsx + library-books-grid.tsx (revoked/refunded UI),
admin yüzeyleri (src/app/admin/*, src/lib/db/queries/admin.ts).

DO:
- Webhook'a refund/adjustment ve dispute eventlerini ekle (Paddle MoR event
  adlarını doğrula): ilgili order'ı 'refunded' yap ve o order'a bağlı
  entitlement'ları 'revoked' yap. İdempotent (çift event → tek geçiş).
- payment_failed → order 'failed' (Faz B'de başlandıysa tamamla).
- revoked gate'i doğrula/güçlendir: download + reader, entitlement 'revoked' ise
  erişimi reddetsin (zaten status='ready' şartı var; revoked'ın bunu engellediğini
  teyit et).
- fulfillment-log'u üretimleştir: yapılandırılmış log + kalıcı denetim (Sentry +
  watermark_jobs/DB). Vercel'de sessiz no-op dosya yazımına güvenme.
- Takılan fulfillment alarmı (Faz C ile tutarlı): retry tükenince Sentry capture +
  DB 'failed'.
- Destek görünürlüğü: admin'de bir order/entitlement'ın durum + job durumunu
  gösteren MİNİMAL salt-okunur görünüm (mevcut admin tablosunu genişlet; redesign
  YOK).

DO NOT:
- Meşru perpetual erişimi yanlışlıkla iptal etme (yalnız iade edilen order'ın
  entitlement'ı). İmza doğrulamayı zayıflatma. UI redesign. main'e merge.
- Refund'ı kendi başına Paddle'da TETİKLEME (yalnız Paddle'dan gelen eventi işle).
- Şema değişikliği gerekiyorsa db:generate + migration review; elle meta YOK.

VALIDATION:
- npm run lint && npx tsc --noEmit && npm run build.
- Sandbox: refund eventi → order 'refunded' + entitlement 'revoked' + download/
  reader reddediyor. payment_failed → 'failed'. Çift event → tek geçiş (idempotent).
- Takılan-iş senaryosu → alarm + DB 'failed'. Admin order durumu görünür.

STOP-AND-REPORT: Paddle'ın gerçek refund/dispute event adları/şeması belirsizse,
ya da revocation'ın kapsamı (kısmi iade) iş-kararı gerektiriyorsa DUR ve sor.

COMMIT/PUSH: feat/commerce-safety branch'i. main'e MERGE YOK.
Mesaj: "feat(safety): refund/dispute handling + entitlement revocation + auditability".
CLEANUP: sandbox simülasyon notu; geçici script silinir.
RAPOR: işlenen eventler, revocation davranışı, denetim/alarm, destek görünürlüğü,
açık riskler. Sonra DUR.
```

---

## FAZ G — Lansman Hazırlığı (Smoke + QA + Prod Cutover + Go-Live Kapısı)

**Faz hedefi.** Tüm hattı **production**'da, ilk gerçek müşteri için, kontrollü
biçimde canlıya almak: sandbox→prod cutover, uçtan uca smoke test, QA kontrol
listesi, prod doğrulama ve **go-live kapısı**.

**Neden var.** A–F mutlu yolu + güvenliği sağlar; G bunların **production'da
gerçekten** çalıştığını kanıtlar ve geri-dönülmez "canlı satış" anahtarını
sorumlu biçimde çevirir. "Paying customer ama kitap yok" felaketini önlemenin son
kapısı budur.

**Bağımlılıklar.** A–F tamamlanmış ve doğrulanmış (sandbox). Tüm feature
branch'lerin main'e merge'ü (Vercel prod = main) — **açık insan onayıyla**. Prod
Paddle (live) hesabı + canlı price'lar + canlı webhook + secret. Prod R2/Inngest/
Resend bağlı.

**Riskler.** • Prod'a geçişte env karışması (sandbox priceId/secret prod'a sızması).
• Deployment Protection (Vercel SSO) public erişimi engelliyor olabilir
(doğrula). • İlk gerçek ödeme öncesi geri-alma planı olmaması. • Birden çok
feature branch'i main'e merge ederken çakışma/regresyon.

**Doğrulama gereksinimleri.** Prod'da (mümkünse düşük tutarlı gerçek ya da Paddle
"live sandbox"/test kart imkânı ile) **tek tam tur**: gözat → detay → sepet →
checkout → ödeme → webhook → fulfillment → kütüphane → indir → oku. Refund testi
(düşük tutar) → revoked. Smoke + QA listesi tamamen yeşil. Rollback planı yazılı.

**Tamamlanma tanımı (DoD).**
- Tüm A–F branch'leri main'e merge edildi (onaylı) ve prod build yeşil.
- Prod env tam (Paddle live, R2, Inngest sync, Resend domain doğrulanmış).
- Prod'da tam uçtan uca tur **gerçekten** tamamlandı (order→entitlement→artifact→
  indir→oku) ve denetim/log'da görülüyor.
- İade testi → revocation prod'da çalışıyor.
- **First-customer checklist** ve **rollback planı** yazılı; go-live kapısı
  imzalandı (insan).

**Tahmini kapsam / karmaşıklık.** **M (ops-ağırlıklı).** Kod az; merge + prod
provizyon + uçtan uca prod QA + dokümantasyon.

**Kesin yürütme sırası.** 1) Branch merge sırası + regresyon doğrulama (onaylı).
2) Prod env/Paddle-live/webhook cutover (insan). 3) Inngest prod sync. 4) Prod
uçtan uca smoke. 5) Refund/revoke prod testi. 6) QA + first-customer checklist +
rollback. 7) Go-live kapısı (insan onayı).

### MASTER PROMPT — FAZ G

```
GÖREV: Lansman hazırlığı — sandbox→prod cutover, uçtan uca prod smoke, QA listesi,
first-customer checklist, go-live kapısı.

BAĞLAM: A–F sandbox'ta doğrulandı. Bu faz production'a kontrollü geçiş + doğrulama.
main = Vercel production. Tüm prod-etkili adımlar AÇIK İNSAN ONAYI gerektirir.

ÖN-OKUMA: tüm faz raporları (PHASE_*_TR.md), memory/PAST_DECISIONS.md,
mevcut deployment/branch durumu (git + vercel).

İNSAN ÖN-KOŞULLARI (eksikse DUR ve iste):
- A–F feature branch'lerini main'e merge ONAYI (sıra + PR review).
- Paddle PRODUCTION (live) hesabı; live price'lar; live webhook {PROD_URL}/api/
  webhooks/paddle + PADDLE_WEBHOOK_SECRET (prod); PADDLE_ENVIRONMENT="production".
- Prod R2 (MASTERS+ARTIFACTS), Inngest prod sync, Resend domain doğrulanmış.
- Prod'da gerçek/test ödeme yapma yöntemi (düşük tutar ya da Paddle test imkânı).

DO:
- Merge öncesi her branch'i main'e karşı rebase/regresyon kontrolü; lint/tsc/build
  yeşil. Merge'leri ONAYLA-DUR protokolüyle, sırayla yap.
- Prod env tamlığını doğrula (sandbox sırlarının prod'a sızmadığını teyit et).
- PRODUCTION_GO_LIVE_CHECKLIST_TR.md yaz: smoke adımları, QA listesi,
  first-customer checklist, rollback planı, go-live kapısı kriterleri.
- Prod'da TEK tam uçtan uca tur (insan ödeme adımını yapar): order→entitlement→
  artifact→indir→oku; sonra düşük tutarlı refund → revoked doğrula.

DO NOT:
- İnsan onayı olmadan main'e merge ETME, prod env DEĞİŞTİRME, canlı satışı AÇMA.
- Gerçek müşteri verisini test için kullanma. UI redesign. Gizli anahtarları
  commit etme/loglama.
- Sandbox ve prod ortamını karıştırma.

VALIDATION:
- Prod build yeşil; prod uçtan uca tur tamamlandı ve denetim/log'da görünür.
- Refund→revoke prod'da çalışıyor. Tüm checklist maddeleri imzalı.
- Vercel Deployment Protection / public erişim durumu doğrulandı.

STOP-AND-REPORT: Her prod-etkili adımdan ÖNCE (merge, env, canlı satış) DUR,
açıkla, onay iste. Prod tur başarısızsa DUR ve rollback öner.

COMMIT/PUSH: Merge'ler onaylı PR'lar üzerinden. Doküman feat/launch-readiness'te.
CLEANUP: geçici test verisi işaretlenir; .env.local sırları iş sonrası diskten
temizlenir. RAPOR: prod tur sonucu, checklist durumu, go-live kararı, rollback
planı. Sonra DUR (go-live anahtarı insanda).
```

---

# 5. İlk Müşteri Go-Live Kontrol Listesi (özet master checklist)

**Provizyon (insan + dashboard):**
- [ ] Paddle live: API key, price'lar (her published kitap), webhook + secret,
      `PADDLE_ENVIRONMENT=production`.
- [ ] R2: MASTERS + ARTIFACTS bucket, Object Read&Write token, endpoint/keys.
- [ ] Inngest: event+signing key, fonksiyon prod'a sync.
- [ ] Resend: domain doğrulanmış, `EMAIL_FROM` set.
- [ ] Clerk: prod anahtarları, `ADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL` (boş değil).
- [ ] Neon prod DB; migrationlar uygulanmış.

**İçerik:**
- [ ] En az 1 published kitap: `paddlePriceId` + `masterFileKey` (Meditations hazır),
      yazar + koleksiyon ilişkili.

**Kod (A–F merge'li, prod build yeşil):**
- [ ] Sahiplik-farkında sepet (A). [ ] Sandbox+prod checkout (B). [ ] Watermark +
      job izleme (C). [ ] Kütüphane + indirme politikası (D). [ ] "Oku" linki +
      okuyucu (E). [ ] İade/revocation + denetim + alarm (F).

**Uçtan uca prod doğrulama:**
- [ ] gözat→detay→sepet→checkout→ödeme→webhook→fulfillment→kütüphane→indir→oku.
- [ ] Refund→revoked (download+reader reddediyor).
- [ ] İdempotency (çift webhook → tek order). [ ] Takılan-iş alarmı.

**Operasyon:**
- [ ] Log/denetim + Sentry. [ ] Rollback planı. [ ] Destek görünürlüğü (admin).
- [ ] Go-live kapısı insan onayı.

---

# 6. Çapraz-Kesen Riskler & Açık Kararlar

1. **Birleşmemiş branch'ler:** Bazı tamamlanmış işler feature branch'lerde olabilir
   (admin ilişkisel yazma, önceki UI düzeltmeleri). G fazından önce hepsi main'e
   düzenli merge edilmeli; **her fazın başında ilgili kodun mevcut branch'te
   olduğunu doğrula.**
2. **Free/$0 yolu yok (bilinçli):** Tüm kitaplar (PD dahil) **paid premium** olarak
   satılır (strateji + Phase-0 kararı). Free fulfillment yolu kapsam dışı/ertelenmiş.
3. **`watermark_jobs` ölü → izlenebilirlik:** Faz C/F'de devreye alınmazsa takılan
   fulfillment görünmez. Bu, "paying customer, no book" riskinin ana kaynağı.
4. **İade güvenlik açığı:** Faz F bitene kadar iade sonrası kopya iptal edilmiyor —
   **prod-güvenli değil**; go-live kapısı bunu şart koşar.
5. **Deployment Protection (Vercel SSO):** Prod deployment URL'leri 401 dönebilir;
   public erişim için ayrı domain/protection ayarı doğrulanmalı (G).
6. **Sensitive env davranışı:** `vercel env pull` R2/Paddle gibi Sensitive
   değişkenleri boş çeker; bunlar elle sağlanır ve iş sonrası diskten temizlenir.
7. **Kozmetik borç:** Kütüphane kapakları prosedürel, öneri rafı demo, katalog
   filtre facet'leri sentetik (format/rating kolonu yok). Lansmanı bloklamaz;
   lansman-sonrası kuyruğa alınır.
8. **Büyük PDF/perf:** pdf-lib filigranı küçük dosyada sorunsuz; ileride büyük
   teknik kitaplar için worker bellek/timeout profili gözden geçirilmeli.

---

> **Yürütme disiplini:** Her faz, kendi MASTER PROMPT'u ile, kendi feature
> branch'inde, kendi doğrulama kapıları yeşil olarak yürütülür; main'e merge ve
> prod-etkili her adım açık insan onayı ister. Sıra A→B→C→(D∥E)→F→G; hiçbir adım
> atlanmaz. Bu belge tek otoritedir; sapma gerekirse önce belge güncellenir.
