# Faz 4 — Tamamlanma Raporu

> 2026-08-31. Dal: `feat/production-readiness`. Bu faz, kurulmuş olan
> platformu **doğrulanmış, gerçek, çalışan bir kitapçıya** dönüştürmek için
> yapıldı.
>
> Durum sözlüğü: **TAMAMLANDI** · **TAMAMLANDI — DIŞ İŞLEM KALDI** ·
> **ENGELLİ** · **ERTELENDİ** · **BAŞARISIZ**. Hiçbiri "bitti" diye
> birleştirilmedi.

---

## Tek cümleyle

Faz başında mağaza para alamıyordu ve e-posta bile toplayamıyordu. Şu anda
**gerçek bir e-kitap satın alma işlemi üretimde uçtan uca 7 saniyede
tamamlanıyor**, alıcı filigranlı PDF'ini ve e-postasını alıyor, iade erişimi
geri alıyor. Yedi kitap yayında, 18 doğrulanmış Amazon bağlantısıyla.

---

## Fazı şekillendiren bulgu

Bir önceki envanter şöyle açılıyordu: *"Hiçbir Valice Press kitabı Amazon'da
yayımlanmadı. Hiçbir projede ASIN yok."* Yazıldığında doğruydu.

**Yedi başlığın altısı Amazon'da yayında — on sekiz baskı, hepsi gerçek
ASIN'lerle.** Her `/dp/` adresi tek tek çekildi, on sekizi de 200 döndü.

Ve bundan çıkan kısıt, önceki raporun açıkça elediği kısıt:
**Codex Mythologica'nın Kindle baskısı KDP Select'e kayıtlı.** Select
münhasırlıktır. O kitabın dijital baskısı, kayıt sürdüğü sürece Amazon
dışında hiçbir yerde satılamaz — burada da. Eski sonuç ("hiçbiri KDP Select'te
değil, çünkü hiçbiri KDP'de değil") artık iki yarısında da yanlış.

---

## Testin bulduğu, kodun bulamayacağı yedi kusur

Hepsi canlıydı. Hiçbiri kaynak kodda görünmüyordu.

| # | Kusur | Sonucu ne olurdu |
|---|---|---|
| 1 | `PADDLE_WEBHOOK_SECRET` imza sırrı değil, bildirim ayarının **kimliği**ydi | Her gerçek webhook 401 alırdı. **Müşteri öder, hiçbir şey almaz, kaydı da bulunmaz.** |
| 2 | Üretimde `entitlements` tablosunda 0002 göçü eksikti | Doğru imzayla bile karşılama çökerdi |
| 3 | `INNGEST_SIGNING_KEY` geçersizdi; uygulama hiç kaydolmamıştı | Satın alma sonsuza dek `pending` kalırdı, **hiçbir log düşmeden** |
| 4 | R2 kimlik bilgileri yanlıştı | Filigran adımı `SignatureDoesNotMatch` ile başarısız |
| 5 | `RESEND_AUDIENCE_ID` Resend'in **dokümantasyon örneğinden** kopyalanmıştı | Her kayıt 500 |
| 6 | `@react-email/render` hiç kurulmamıştı | **Hiçbir işlemsel e-posta gönderilemiyordu** — hoş geldin *ve* sipariş hazır |
| 7 | Hoş geldin e-postası `void promise` ile gönderiliyordu | Sunucusuz işlev donuyor, gönderim düşüyor, **hata bile loglanmıyordu** |

Ortak nokta: dördü, varlık kontrolünün kabul ettiği **makul görünen yanlış bir
değerdi**. Bu yüzden artık kural şu: sağlayıcılar kullanılarak doğrulanır,
`process.env.X` dolu mu diye bakılarak değil.

---

## Yapılan işler

### 1. Ödeme → teslimat zinciri — **TAMAMLANDI**

Üretimde, canlı Paddle hesabına karşı, SDK'nın doğruladığı gerçek HMAC imzayla:

```
imzalı webhook → sipariş → hak → Inngest → filigran → R2 → hazır → e-posta
                                                              7 saniye
```

İade yolu da yürütüldü: sipariş `refunded`, hak `revoked`, üç denetim kaydı.
Tüm test verisi sonradan silindi.

### 2. Gerçek katalog — **TAMAMLANDI**

- 18 doğrulanmış ASIN, gerçek Amazon liyat fiyatlarıyla (modellenmiş fiyatların
  bazıları 2–3 dolar sapıyordu)
- Yayın artık **veri**: `websiteStatus`, diff'te incelenebilir
- Sayfa sayıları kaynaktan düzeltildi (Codex Enigmatica 238 değil **274**)
- **Codex Bestiarium'un dört Amazon ilanı "120 yaratık" diyor; kitapta 112 var**
- Meditations kataloğa alındı: var olmayan bir Paddle fiyatına
  (`pri_test_meditations_999`) bağlı olduğu için **ödeme adımı baştan beri
  kırıktı**

### 3. Dijital baskılar ve karşılama — **TAMAMLANDI**

Baskı iç dosyaları 40–121 MB; sunucusuz bir işlevde filigranlanamaz.
Ghostscript ile ayrı dijital baskı üretildi (108 MB → 4.6 MB) ve R2'ye yüklendi.

### 4. Gerçek önizlemeler — **TAMAMLANDI**

Her kitap sayfası aynı **uydurma örnek metni** gösteriyordu — DRM'li e-kitap
satın almaya dair birinci tekil şahıs bir pasaj, "satın almadan önce ilk
sayfaları okuyun" başlığı altında. `/books/meditations` sayfasında modern
uydurma bir metni Marcus Aurelius'a atfediyordu.

Yerine **kitapların kendi PDF'lerinden render edilmiş 28 gerçek sayfa** kondu.

### 5. Kalan uydurmaların temizliği — **TAMAMLANDI**

- `/genres` sekiz tür ve **~44.000 uydurma kitap sayısı** ilan ediyordu; gerçek
  katalog sekiz kitap. Sayfa kaldırıldı, `/categories`'e yönlendirildi.
- Arama önerileri ("Atomic Habits", "George Orwell", …) bu katalogda **%0
  isabetliydi**; artık gerçek kategorilerden geliyor.
- Ana sayfa her kitaba **4.8 yıldız** basıyordu; katalogdaki hiçbir kitabın
  yorumu yok.
- Katalog kartları yorumu olmayan kitaba **0.0 yıldız** gösteriyordu.
- Boş kategoriler ("Builder Core", "Speculative Shelf") kaldırıldı.

### 6. Görsel kusurlar — **TAMAMLANDI**

- Gerçek kapakların **üzerine ikinci bir başlık** basılıyordu
- "Sort by" etiketi sayfada görünür bir yere düşüyordu
- Hiç eşleşemeyecek EPUB/MOBI ve yıldız filtreleri

---

## Kalan dış işlemler

| # | İş | Neden önemli | Süre |
|---|---|---|---|
| **B0** | **`valicepress.com` alın** | Codex Enigmatica'nın **basılı kopyaları şu anda Amazon'da satılıyor** ve son yaprağı okuyucuyu `valicepress.com/codex-enigmatica/verify` adresine yolluyor. Alan adı çözülmüyor. Bugün giden her kopyada **ölü bir adres** var ve o okuyucu için kitabın ana mekaniği çözümsüz. | Dakikalar |
| B1 | Resend'de 4 özellik tanımlayın | Rıza kaydı geri gelir | ~5 dk |
| B2 | Paddle `ebooks` vergi kategorisi | Aksi halde her e-kitap satışında KDV fazla tahsil ediliyor | Destek talebi |
| B3 | Bestiarium ilanını düzeltin | 120 değil **112** yaratık | ~10 dk |
| B4 | Hangul CC BY-NC lisansı | Kitap **şu anda KDP incelemesinde**; geçerse soru açıkken satışa çıkar | Hukuki |
| B5 | *World Games* için oyun testi | Alt başlık "Ready to Play Tonight" diyor, hiç test yok | Kitabın kendisi |

---

## Test matrisi

| Kontrol | Sonuç |
|---|---|
| `npm run lint` | temiz |
| `npx tsc --noEmit` | temiz |
| `npm test` | **130/130** (bu fazda +25) |
| `npm run build` | başarılı |
| Üretim dağıtımı | başarılı, doğrulandı |
| `/`, `/books`, `/ebooks`, `/categories`, `/search` | 200 |
| `/genres` | 308 → `/categories` |
| Taslak kitap (`korean-hangul…`) | 404 |
| Newsletter: geçerli / tekrar / bozuk / hatalı JSON | 200 / 200 / 400 / 400 |
| Webhook: imzalı / imzasız | 200 / 401 |
| `PUT /api/inngest` | `Successfully registered` |

---

## Bilinçli olarak yapılmayanlar

| Yapılmadı | Neden |
|---|---|
| Pazar yeri, abonelik, sayfa-okuma, sert DRM | Kilitli kararlar (ADR); kapsam dışı |
| Kamu malı kitapların üretimi | Batch 1 **ön üretime** kadar götürüldü; üretim başlık başına bir kitap projesi — `PUBLIC_DOMAIN_BATCH_1_PLAN.md` |
| Hangul'un yayımlanması | Hukuki soru açık |
| Mobil cihaz testi | Otomasyon tarayıcısına dar bir viewport verilemedi. **"Mobil doğrulandı" denmedi** — masaüstünde erişilebilirlik geçti, mobil test edilmedi. |
| Inngest uygulama kimliğinin yeniden adlandırılması | `digital-bookstore`; değiştirmek çalışan geçmişini sıfırlar. Belgelendi. |
| "Vâliçe Press" / "Valice Press" seçimi | Kitaplar birincisini basıyor, site ikincisini diyor. **Founder kararı.** |
