# Amazon → Valice Press Müşteri Köprüsü

**Tarih:** 2 Eylül 2026 · **Durum:** tasarım · Bu belge Phase 10, 10A, 11, 14 ve
15'i kapsar. Kararlar `VALICE_PRESS_MASTER_ROADMAP_TR.md`'de kilitlidir.

Kanıt etiketleri: **[V]** birincil kaynak · **[O]** canlı sistemde gözlendi ·
**[A]** varsayım · **[R]** öneri · **[S]** senaryo.

---

## 1. Köprü neden şirketin çekirdek sistemidir

Amazon müşteriyi kiralar; e-posta adresini, tekrar ulaşma hakkını ve ikinci
satışı vermez [V, KDP politika araştırması §4 — yüksek güvenle çıkarım].
Valice'in tek yapısal avantajı, bir Amazon alıcısını **kendi rızasıyla** sahip
olunan bir okura çevirebilmesidir. Bunu yapan mekanizma tek: **basılı kitabın
içinde, okura gerçek fayda sağlayan ücretsiz bir dijital companion sayfasının
adresi.**

Bugün [O]:

| Parça | Durum |
|---|---|
| Codex Enigmatica doğrulama sayfası (`/codex-enigmatica/verify`) | canlı; kitabın son yaprağında basılı; `valicepress.com` artık çözümleniyor (apex → www 308) — endpoint 200 döndürüyor |
| Hangul companion (`/companion/hangul`, 3 üretilmiş PDF) | kod yazıldı, **production'da 404** (dalda commit edilmemiş) |
| Newsletter kaynak etiketleri (`home`, `article`, `category`, `codex-verify`, `hangul-companion`) | çalışıyor; rıza kaydı `consentRecorded: true` |
| Hoş geldin e-postası | Resend üzerinden gidiyor; gönderici alan adı doğrulaması Founder tarafından kontrol edilecek |
| World Myths QR vaadi | K-QR kararıyla **kaldırıldı** (KDP `[QR CODE — Phase 6]` yer tutucusunu reddetti) [O] |

---

## 2. KDP kuralları ve güvenli kalıp

| Kural [V] | Sonuç |
|---|---|
| Kitap içi bağlantılar yalnızca okur deneyimini doğrudan iyileştiriyorsa; **müşteri bilgisi isteyen web formlarına bağlantı yasak**; başka e-kitap mağazalarına bağlantı yasak | Companion sayfasının **birincil amacı fayda**, e-posta formu ikincil ve isteğe bağlı; indirmeler forma bağlı değil |
| "About the author" arka sayfasında yazarın web sitesi kabul edilir (baskıda düz metin) | Her kitapta bir "Valice Press" arka sayfası: companion adresi + katalog adresi, pazarlama dili yok |
| Bonus content: kitabın sonunda, TOC'de, ≤ ~%10, "disruptive links" ve ödül vaadi yasak | Companion "bonus" değil, "ek çalışma materyali" olarak sunulur; hediye/ödül vaadi asla |
| Select kitaplarda dijital münhasırlık | Companion'da o kitabın e-kitabını doğrudan satmaya yönlendirme yok (Mythologica) |
| Kapakta QR kod Amazon'un istemediği unsurlar arasında (Hangul metadata notu [O]) | QR yalnızca iç sayfada (son yaprak), asla kapakta |

Güvenli kalıp (zaten uygulanan) [O]: **önce fayda → sonra isteğe bağlı e-posta →
sonra ilgili ürünler.** Sayfa "We only ever get your address because you typed
it here. Amazon does not share customer details with publishers." cümlesini
taşır.

---

## 3. Companion şablonları (Phase 10)

Her şablon: varlıklar (ücretsiz), sayfa yapısı, e-posta kaynağı etiketi, ilgili
ürün kuralı, basılı kitaptaki metin.

| Seri / tür | Ücretsiz varlıklar (gerçek fayda) | Sayfa yapısı | `source` etiketi | İlgili ürün kuralı |
|---|---|---|---|---|
| **Workbook** (Valice Script: Hangul, Greek, Cyrillic, Kana) | basılabilir pratik ızgaraları, vuruş sırası kutuları, ilerleme takipçisi, **telaffuz sesi** (Yıl 1 Q2: kendi kaydımız), ek 10 sayfa | 1 · indirmeler · 2 · "sıradaki kitap" · 3 · isteğe bağlı e-posta | `hangul-companion`, `greek-companion`… | serinin 2. kitabı + mitoloji kataloğu (Greek için) |
| **Puzzle** (Enigmatica, Dudeney, Loyd, Codex Puzzle Book) | 3 kademeli ipucu sistemi, doğrulama (final cevap), basılabilir ek bulmacalar, çözüm oturumu kayıt sayfası | doğrulama formu → sonuç → ipuçları → e-posta | `codex-verify`, `dudeney-companion` | diğer bulmaca kitapları + Bestiarium (Menagerie kapısı için) |
| **Mythology** (Codex, Great Book of…) | telaffuz sesi/rehberi, kültür kartları PDF, dünya haritası (World Myths'in kaldırılan harita vaadi burada gerçekleşir — yeni baskıda adres basılır), "Who's Who" | referans → indirmeler → e-posta | `world-myths-companion` | Field Book, Bestiarium |
| **Classics** (Valice Classics PD) | okuma rehberi (12 kitap / 487 bölüm haritası), sözlük PDF, kronoloji, "hangi çeviri?" karşılaştırması | rehber → indirmeler → e-posta | `meditations-companion` | Stoic Library paketi |
| **Reference** (Bestiarium, Heroica, Games) | yaratık/oyun dizini (kısa girişler), basılabilir tahta şablonları, kaynak listesi | dizin → indirmeler → e-posta | `bestiarium-companion`, `games-companion` | Falkener, Great Book of World Games |
| **Kids (Field Book)** | tamamlama sertifikası PDF, bölge mühürleri, ebeveyn rehberi | sertifika → indirmeler → e-posta (ebeveyn) | `field-book-companion` | World Myths, Field Book 2 |

Teknik kural [O, `companions.ts`]: companion rotası **asla 404 vermez** ve
kitabın satışta olmasına bağlı değildir; `state` alanı yalnızca sayfanın ne
söylediğini değiştirir. Yeni şablonlar aynı kayıt defterine girer;
`newsletterSource` union'ı ve `/api/newsletter` allow-list'i genişletilir.

---

## 4. QR / URL stratejisi (Phase 10A)

| Karar | Kural | Gerekçe |
|---|---|---|
| Basılı adres = **insan yazımlı, kısa, kalıcı**: `valicepress.com/companion/‹slug›` | slug asla değişmez; kitap geri çekilse de sayfa kalır | basılı bir adres düzeltilemez [O World Myths dersi] |
| QR kodu **aynı adresi** kodlar, `?src=qr` ile | QR → `https://valicepress.com/companion/‹slug›?src=qr`; sayfa `src`'yi analitik event'e yazar | iki farklı adres kafa karıştırır; izleme parametre ile |
| Kısa yönlendirme rotası `/q/‹slug›` **ikincil** | yalnızca kapak içi küçük QR için; 302 → companion; event `qr_scan` | daha küçük QR, aynı kalıcılık |
| QR doğrulaması | her QR **çözülerek** kanıtlanır (zxing + OpenCV, 300/300) — World Myths'in QR üreteci `09_ARCHIVE/qr-generator-2026-08-12/` [O] geri alınır | MSB/LSB format-bit hatası dersi |
| Üçüncü taraf dinamik QR servisi | **asla** | servis kapanırsa kitap ölür |
| Alan adı bağımlılığı | `valicepress.com` apex birincil (www → apex 308); DNS Namecheap'te; alan adı otomatik yenileme açık; takvim uyarısı | apex/www çelişkisi giderilmeden **yeni QR basılmaz** |
| `.vercel.app` | hiçbir basılı materyalde yok; proxy host kontrolü ile 308 → apex | kiralık adres |
| Yedek | Vercel çökse bile companion PDF'leri R2 public bucket'tan sunulabilir (Phase 20 DR maddesi) [R] | — |

Basılı metin şablonu (arka sayfa, düz metin, pazarlama yok) [R]:

> Free practice sheets and the lesson tracker for this book are at
> **valicepress.com/companion/hangul**. Nothing on that page requires an account.

---

## 5. Amazon → kitap → companion → site → e-posta → tekrar satın alma (Phase 14)

Ürün türüne göre akış ve ölçüm noktaları:

| Tür | Amazon'da | Kitapta | Companion | Site | E-posta | Tekrar satın alma | Ölçüm |
|---|---|---|---|---|---|---|---|
| Workbook | pb/hc | son yaprak adres + QR | pratik sayfaları | seri sayfası `/series/valice-script` | `‹slug›-companion` → 3 e-posta (hoş geldin; 7. gün "ilerleme"; 21. gün "sıradaki kitap") | seri 2. kitap (Amazon) + Greek/Kana çapraz | `qr_scan`, `companion_download`, `newsletter_signup{source}`, Amazon Attribution tıklaması |
| Puzzle | pb/hc/ebook | son yaprak doğrulama adresi | doğrulama + ipucu | `/books/‹slug›` | `codex-verify` → "tebrikler" + sıradaki bulmaca kitabı | Dudeney/Loyd doğrudan e-kitap | `codex_verify_success`, doğrudan satın alma |
| Mythology | pb/hc/ebook | arka sayfa | telaffuz/kartlar | `/series/codex` | `‹slug›-companion` → seri akışı | Bestiarium ↔ Mythologica ↔ Field Book | aynı |
| Classics | doğrudan (Amazon yok) | — | okuma rehberi | `/series/valice-classics` | satın alma sonrası (opt-in ile) | Stoic Library | doğrudan |
| Flagship | direct-first, sonra Amazon | arka sayfa | ekler | kitap sayfası | lansman broadcast | paket | doğrudan |

**Dönüşüm varsayımları** [A, ölçülünce değiştirilecek]: tarama/ziyaret oranı
basılı kopya başına %3–8; companion → e-posta %10–20; e-posta → 12 ayda ikinci
satın alma %10–15. Bu üç oran, roadmap'in en değerli ilk yıl ölçümüdür.

---

## 6. E-posta / CRM fabrikası (Phase 11)

**Tek master audience** (Resend "General") + `source` etiketi + üç rıza
özelliği [O]. İkinci liste açılmaz.

| Akış | Tetikleyici | İçerik | Mekanizma | Durum |
|---|---|---|---|---|
| Welcome | herhangi bir abonelik | "You're on the Valice Press list" | Resend, `after()` | ✅ canlı |
| Companion (kaynağa özgü) | `source = ‹slug›-companion` | 3 e-posta: kaynak materyal hatırlatması → 7. gün pratik ipucu → 21. gün seri/ilgili kitap | Inngest zamanlanmış fonksiyon (`companion-sequence`), Resend gönderim, idempotency key | Yıl 1 Q1 |
| Post-purchase (işlemsel) | entitlement `ready` | "Your digital book is ready" | Inngest step | ✅ canlı |
| Post-purchase (pazarlama) | `/order/[id]` sayfasında **açık opt-in** kutucuğu → `source=post-purchase` | 14. gün: "ilgili kitap / companion"; 45. gün: paket önerisi | Inngest | Yıl 1 Q1 — **satın alma abonelik değildir** [O kural] |
| New release | katalog `websiteStatus` → published | Broadcast (Resend Broadcasts), segment: `source` + `owned_book_slugs` | manuel gönderim, şablon | Yıl 1 Q1 |
| Series | seri N+1 yayınlandığında, N'in sahiplerine (entitlement) — yalnızca opt-in olanlara | tek e-posta | Inngest | Yıl 1 Q2 |
| Re-engagement | 90 gün açılış yok | tek e-posta "hâlâ ilgileniyor musunuz?" → tıklanmazsa 180 günde liste temizliği | Inngest + Resend events | Yıl 1 Q3 |

Segmentler (Resend contact properties; hepsi rızaya bağlı) [R]: `source`
(companion kaynağı), `owned_book_slugs` (yalnızca post-purchase opt-in ile
yazılır), `series_interest` (ziyaret edilen seri sayfası — **yazılmaz**; Vercel
event olarak kalır), `repeat_customer` (≥ 2 sipariş, opt-in ile).

Teslimat ön koşulları [V Resend docs]: gönderici alan adı doğrulanmış; **DMARC
kaydı** (`_dmarc` → `v=DMARC1; p=none; rua=mailto:…` ile başla); tek tıkla
abonelikten çıkma başlıkları (var [O]); spam oranı < %0.3.

Kapasite [V Resend pricing]: Free 3.000 e-posta/ay, 100/gün, 1.000 pazarlama
kişisi → **1.000 aboneden sonra Pro** ($20/ay + pazarlama kişi başı kademesi).

---

## 7. Doğrudan dijital değer önerisi (Phase 15)

| Boyut | Amazon Kindle | Valice doğrudan | Kim kazanır |
|---|---|---|---|
| Keşif | arama, "also bought", reklam | yok (SEO + companion) | **Amazon** |
| Cihaz | Kindle ekosistemi, senkron | PDF/EPUB, her cihaz; Send-to-Kindle ile Kindle'a da | eşit; Kindle sahibi için **Amazon** |
| Sahiplik | lisans, geri alınabilir | DRM'siz dosya, süresiz, yeniden indirilebilir | **Valice** |
| Sadakat/görsel | reflow; plakalar küçülür | 150 DPI sabit dizgi; plakalar niyet edildiği gibi | **Valice** (Codex, Games) |
| Güncelleme | Kindle güncellemesi Amazon'a bağlı | kütüphanede v2 | **Valice** |
| Companion | yok | doğrudan bağlı | **Valice** |
| Fiyat | eşit (eşleme) | eşit | eşit |
| Paketler | yok | seri paketleri | **Valice** |
| PD edisyonları | 35 % → düşük fiyat baskısı; bedava kopyalar | aparat için fiyat; %90 marj | **Valice** (satıcı için); okur için **Amazon** daha ucuz olabilir |
| Yazılan kitaplar | — | — | ne Amazon ne Valice: **baskı** |

Dürüst sonuç [R]: Kindle Unlimited okuru, cihaz-senkron isteyen okur ve
"keşfettim, hemen aldım" okuru Amazon'da kalır. Valice'i tercih eden okur: dosya
sahipliği isteyen, plakalı referansı tam sadakatle isteyen, companion kullanan,
seri paketi alan ve PD aparatını ödemeye değer bulan okurdur. Site bunu
söyler; "Amazon'dan iyi" demez.

---

## 8. Phase 32 kapı yapısı — Köprü

| Alan | İçerik |
|---|---|
| Amaç | Her basılı Valice kitabında çalışan bir companion adresi; her companion'da ölçülen ziyaret → indirme → rıza → ikinci satın alma zinciri |
| Girdiler | P0 alan adı düzeltmesi; companion kayıt defteri; Resend DMARC; Inngest zamanlanmış fonksiyonlar; analitik event'leri |
| Çıktılar | 6 companion şablonu; ilk 5 kitap için canlı companion; 4 e-posta akışı; QR üretim + çözme testi |
| Bağımlılıklar | Phase 9 (ürün sayfaları), Phase 16 (analitik), Phase 4B (yeni baskılarda arka sayfa) |
| Ajanlar | R7 (varlıklar), R9 (kayıt defteri, rotalar), editör (e-posta metinleri) |
| İnsan kontrol noktaları | Founder: basılı arka sayfa metni onayı; e-posta metni onayı; DMARC DNS |
| Süre | şablonlar 2 hafta; kitap başına companion 2–4 saat; akışlar 1 hafta |
| Başarı | companion rotaları 200; QR 300/300 çözülüyor; `newsletter_signup{source}` akıyor; ilk 90 günde ölçülmüş tarama oranı |
| Başarısızlık | 404 veren basılı adres; forma bağlı indirme (politika ihlali); ikinci liste |
| KPI | tarama/kopya, companion indirme, kaynak bazlı abone, e-postadan doğrudan sipariş, tekrar satın alma oranı |
| Sonraki faz | Phase 24 lansman sistemi |

---

## 9. Founder aksiyonları

1. **P0:** Vercel → Domains → `valicepress.com` birincil, `www` → apex 308 (dakikalar). Aksi hâlde basılı adresler yönlendirmeyle çalışır ama Paddle webhook'u çalışmaz.
2. Hangul companion'ı canlıya alma onayı (kod hazır; `state` alanı tek satır).
3. `_dmarc.valicepress.com` TXT kaydı (Namecheap): `v=DMARC1; p=none; rua=mailto:emre30283@gmail.com`.
4. Resend → Domains → `valicepress.com` durumu **Verified** mi? 1 Eylül'de gönderilen hoş geldin e-postası `@valicepress.com` göndericiden geldi mi?
5. Basılı arka sayfa metnini onaylayın (§4 şablonu); yeni baskılarda (World Games LP, Enigmatica LP, Field Book LP) uygulanır.
6. Post-purchase pazarlama opt-in kutucuğunun metnini onaylayın (rıza cümlesi verbatim saklanır).
