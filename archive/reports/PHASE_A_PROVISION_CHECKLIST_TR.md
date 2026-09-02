# Faz A — Provizyon Kontrol Listesi (Paddle env + paddlePriceId)

> Faz A çıktısı (denetim). **Buradaki değerler bu fazda SET EDİLMEZ** —
> gerçek provizyon (sandbox-first) **Faz B**'nin işidir. Bu liste Faz B'nin
> giriş şartlarını netleştirir. Kaynak: `src/lib/paddle.ts`,
> `src/app/cart/actions.ts` (`createCheckoutSession`), `.env.example`.

---

## 1. Paddle ortam değişkenleri

| Değişken | Tür | Kod kullanımı | Durum / Not |
|----------|-----|---------------|-------------|
| `PADDLE_API_KEY` | server (gizli) | `getPaddleClient()` (`src/lib/paddle.ts`); checkout transaction oluşturur | **Checkout için ZORUNLU.** Unset ise `createCheckoutSession` → "Checkout is not configured yet (missing PADDLE_API_KEY)". `PADDLE_ENVIRONMENT`'a uygun (sandbox vs live) anahtar kullanılmalı. |
| `PADDLE_ENVIRONMENT` | server | `src/lib/paddle.ts` → `"production"` ise `Environment.production`, aksi halde sandbox | **Bilinçli set edilmeli.** Varsayılan güvenli (sandbox). Faz B = `"sandbox"`; Faz G cutover'da `"production"`. Sandbox anahtar+price'larının prod'a sızmadığı doğrulanmalı. |
| `PADDLE_WEBHOOK_SECRET` | server (gizli) | Webhook imza doğrulama (`src/app/api/webhooks/paddle/route.ts`, `unmarshal`) | Checkout'u etkilemez ama **fulfillment için zorunlu** (Faz B/C). Unset ise webhook 503 → sipariş işlenmez. Paddle dashboard'da webhook kaydı sonrası kopyalanır. |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | public | **Kod tarafından KULLANILMIYOR** | `.env.example`'da tanımlı ama akış sunucu-taraflı `transactions.create` + hosted-checkout redirect. Paddle.js (inline overlay) YOK; `@paddle/paddle-js` kurulu değil. **Yanıltıcı config** — Faz B'de ya kaldırılır ya da "ileride inline checkout için" notuyla bırakılır (Faz A kapsamı dışı, yalnızca işaretlendi). |

> Diğer fulfillment env'leri (R2, Inngest, Resend) Faz A kapsamında DEĞİL —
> Faz C provizyonunda ele alınır (bkz. ana plan).

---

## 2. Kitap başına `paddlePriceId` gereksinimi

- `books.paddlePriceId` **nullable**'dır (taslaklar fiyatsız var olabilsin diye).
- `createCheckoutSession`, sepetteki **herhangi bir** yayımlanmış kitabın
  `paddlePriceId`'i yoksa **fail-fast** eder ve eksik başlıkları **isimle**
  listeler ("Not ready for checkout — these titles have no Paddle price yet: …").
- Dolayısıyla **her yayımlanmış (published) kitabın** Paddle'da bir Price
  (`pri_…`) nesnesi olmalı ve bu id admin üzerinden `paddlePriceId`'e yazılmalı.

**Faz B giriş kontrolü (bu fazda yapılmaz, Faz B'de doğrulanır):**
- [ ] Sandbox Paddle hesabı + `PADDLE_API_KEY` (sandbox) + `PADDLE_ENVIRONMENT="sandbox"`.
- [ ] Her published kitap için sandbox Price oluşturuldu → `paddlePriceId` set.
- [ ] Webhook endpoint `{DEPLOY_URL}/api/webhooks/paddle` kayıtlı + `PADDLE_WEBHOOK_SECRET`.
- [ ] (Şu an: Meditations canlı tek published kitap; `masterFileKey` Faz 2'de set edildi, `paddlePriceId` Faz B'de set edilecek.)

---

## 3. Faz A'da ne DEĞİŞTİ (sahiplik farkındalığı)

- Giriş yapmış kullanıcı, **zaten sahip olduğu** (revoke edilmemiş entitlement)
  bir kitabı checkout'a götüremez: `createCheckoutSession`, eksik-priceId
  fail-fast'iyle aynı tarzda **net hata** döndürür ("Already in your library: …").
- `/cart` satırlarında ve (SSG güvenli, client tarafı) kitap-detay
  "Add to cart" düğmesinde sahiplik işareti gösterilir.
- Çözümleme **salt-okunur** (`getCurrentLocalUserIdReadOnly` — JIT upsert YOK).
- Anonim ziyaretçiler hiçbir şeye "sahip" değildir → akış değişmeden geçer.
- Ölü kod kaldırıldı: `checkout-button.tsx`, `cart-buttons.tsx` (sıfır importer).
