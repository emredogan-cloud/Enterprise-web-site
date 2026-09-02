# Sinematik Redesign — Faz Bazlı Uygulama Yol Haritası

**Tarih:** 2026-05-30
**Kaynak Belge:** `TASARIM_AUDIT_RAPORU_TR.md` (forensik audit)
**Amaç:** Audit'in tüm bulgularını sıralı, dependency-aware, production-odaklı 4 implementation fazına dağıtmak ve son fazın sonunda hiçbir kritik öğenin açık kalmamasını garanti etmek.

> Bu doküman **planlama** belgesidir. Implementasyon başlamamıştır. Kullanıcı **"Phase 0"** dediğinde aşağıdaki Phase 0 maddesinden adım adım başlanır.

---

## Yönetici Özeti

### Çalışma neden bu şekilde bölündü

Audit 4 sınıf bulgu üretti:
1. **Altyapı boşlukları** (newsletter endpoint yok, design token tüketilmiyor, hero dedupe yok, legal route shell yok) — diğer fazlar için ön-şart
2. **P1 — Kullanıcı yolculuğunda tema kırılma noktaları** (`/books/[slug]`, `/order/[id]`, `/authors/[slug]`, `/categories/[slug]`) + ölü linkler + sahte UI
3. **P2 — Eksik fonksiyonellik** (library filtreler no-op, newsletter wiring, sign-out yok, catalog URL sync, DB feed)
4. **P3 — Tasarım borcu** (225 inline hex, 9 hero kopyası, dead code, admin/settings warm)

**Bağımlılık mantığı**: P1'deki "footer legal linklerini canlandır" P0'da legal route shell olmadan yapılamaz. P2'deki "newsletter formlarını bağla" P0'da `/api/newsletter` endpoint'i yoksa anlamsız. P3'teki "9 hero'yu dedupe et" P0'da `<CinematicHero>` ve yeni utility class'lar yoksa imkânsız. Bu yüzden:

- **Phase 0** kritik altyapıyı kurar — uygulama yapmaz, ama gelecek 3 fazın hepsini mümkün kılar
- **Phase 1** kullanıcının gördüğü acıyı kapatır — yalan UI'yı, ölü linkleri, tema kırılmalarını giderir
- **Phase 2** mevcut UI'nın arkasındaki boş kabuğu doldurur — interaktivite gerçek olur
- **Phase 3** sistemi sürdürülebilir hale getirir — drift'i siler, dedupe eder, admin/settings'i kapatır

### Stratejik Kararlar (Bu Belge Boyunca Geçerli)

| Karar | Seçim | Gerekçe |
|---|---|---|
| **Legal sayfalar** | İnternal sinematik sayfalar (`(legal)` route grubu içinde MDX-tabanlı uzun metin) | Brand bütünlüğü; AWS/Terraform gibi harici altyapı yok = operasyon basit; içerik versiyonlanabilir; Paddle'ın "T&C URL'i ver" zorunluluğu kendi domain'imizde karşılanır; KVKK + GDPR ayrı sayfalar (TR + AB kullanıcıları) |
| **Sosyal medya** | X + GitHub bağlanır; Instagram + Facebook ikonları **silinir** | Ölü/var-olmayan profillere link verme = "abandoned site" izlenimi; gerçek olanlar gerçek URL alır |
| **Auth UX** | Clerk hosted sign-in/up devam; Clerk `<UserButton>` header avatar'ın yerine geçer (sign-out + name + email görünür) | Local sign-in/up route eklemek scope-creep; Clerk'in resmi bileşeni production-ready |
| **Eski rotaların redesign yönü** | 5 redesign ailesi belirlenir (product-detail, personality-detail, trust-moment, curated-archive, account-dashboard, internal-admin); her warm route bir aileye atanır; tam görsel spec sonradan PR-bazlı | Audit her sayfa için tam spec gerektirmedi — tematik yön + paylaşılan bileşen reuse yeterli |
| **Design token migration** | Phase 0'da Tailwind v4 `@theme` ile tüketilebilir token sınıfları (`text-fg-hi`, `bg-emerald`, vs.) tanımlanır; Phase 3'te codemod ile 225 inline hex migrate edilir | Token'ı önce tanımlamadan migration yapılamaz; ama migration P3 polish'in parçası, kritik patikada değil |
| **9 hero dedupe** | Phase 0'da `<CinematicHero>` parametreli bileşen ship edilir; Phase 1'deki yeni hero'lar (örn. `/books/[slug]`) doğrudan bunu kullanır; Phase 3'te mevcut 9 hero migrate edilir | Yeni hero'ların eski %85-kopya pattern'i sürdürmesini engeller; mevcut 9'u son fazda toplu temizler |

---

## Phase 0 — Temel + Kritik Altyapı

### Goal

Phase 1, 2 ve 3 için "olmadan ilerlenemez" olan altyapıyı kurmak. Hiçbir yeni sayfa redesign'i veya wiring işi bu fazda **bitmez**, ama hepsinin temeli atılır.

### Bu Fazda Çözülen Sorunlar

| # | Sorun | Audit Ref |
|---|---|---|
| 0.1 | Design token sistemi var ama 225 inline hex bileşenlerde — tüketim katmanı yok | §6.2 |
| 0.2 | 9 hero'da tekrarlanan headline gradient + frame shadow + diamond eyebrow + dust | §6.3, §6.4 |
| 0.3 | `/api/newsletter` endpoint'i yok — 3 form (home, article, category-sidebar) sahte | §3.2, §1.2 (P1.2) |
| 0.4 | Legal sayfalar yok (`/terms`, `/privacy`, `/refund`, KVKK) — footer ölü, Paddle T&C yok | §5.4, §1.1 (P1.1) |
| 0.5 | About anchor hack — `/about` route yok | §3.1#5, §4.2 |
| 0.6 | Auth UX boşluğu — sign-out yok, auth state görünmüyor | §3.6 |
| 0.7 | Footer link stratejisi belirsiz — Bestsellers/New Releases/Categories/Social ne olacak? | §5.1, §5.5 |
| 0.8 | `unprovisioned-notice` warm — sinematik library içinde mount olduğunda görsel bug | §2 cross-cutting |
| 0.9 | `<RecommendationShelf>` cart + library neredeyse identical — Phase 3'te dedupe için ortak interface gerekli | §6.10 |

### Phase 0 Alt-Görevleri

#### 0.A — Design System Token Katmanı

- **Problem**: 12 CSS var tanımlı (`--home-emerald`, `--home-text-hi`...) ama bileşenler `text-[#33f0aa]` gibi inline hex kullanıyor; rebrand 225 yerde search-replace gerektiriyor
- **Çözüm**:
  - `tailwind.config.ts` veya `globals.css` `@theme inline` bloğunda token'ları **tüketilebilir Tailwind class'larına** dönüştür:
    - `--color-fg-hi: #e6e6e0` → `text-fg-hi`
    - `--color-fg-mid: #a7a7a0` → `text-fg-mid`
    - `--color-fg-muted: #88918a` → `text-fg-muted`
    - `--color-emerald: #1ddf8f` → `text-emerald`, `bg-emerald`, `border-emerald`
    - `--color-emerald-bright: #33f0aa` → `text-emerald-bright`
    - `--color-emerald-deep: #16c784` → `bg-emerald-deep`
  - **5 yeni utility class** `globals.css` `.cinematic-root *` scope'unda ship edilsin:
    - `.home-headline-accent` — last-word emerald gradient (audit'teki 10 inline kopya)
    - `.home-hero-frame` — rounded-[32px] panel shadow (audit'teki 3 inline kopya, alpha 0.35 standardize)
    - `.home-icon-tile` — emerald icon tile chrome (6+ kopya)
    - `.home-pill-hover` — pill hover lift + glow (3 kopya)
    - `.home-avatar-gradient` — green→deep avatar (3 kopya)
- **Dependencies**: Yok (ilk iş bu)
- **Risk**: Düşük — sadece additive; mevcut inline hex'ler çalışmaya devam eder
- **Etki**: Tüm gelecek hero'lar ve yeni sayfalar bu sınıfları kullanır; P3'teki 225-site migration için hedef katman hazır
- **Tahmini efor**: 0.5 gün

#### 0.B — `<CinematicHero>` Parametreli Bileşen

- **Problem**: 9 hero %85 aynı DNA (eyebrow + diamond + dust + headline + subtitle); 3 farklı H1 skalası (`52/64/72` vs `48/58/64/72` vs `44/56/62/68`); 3 farklı shadow alpha
- **Çözüm**:
  ```tsx
  <CinematicHero
    eyebrow="BLOG CATEGORY"
    headlineHead="Reading"
    headlineTail="Guides"        // emerald accent
    subtitle="..."
    size="xl|lg|md"              // hero ölçek skalası
    variant="solo|with-panel"    // tek sütun vs scene panel
    panel={<ReadingRoomScene />} // opsiyonel
    stats={<CategoryStats />}    // opsiyonel
  />
  ```
- **Dependencies**: 0.A (yeni utility class'lar)
- **Risk**: Orta — yeni API tasarımı; mevcut 9 hero'yu hemen migrate **etmeyeceğiz** (P3'te); sadece yeni hero'lar bunu kullanır
- **Etki**: Phase 1'deki yeni hero'lar (örn. `/books/[slug]`) doğrudan bu bileşeni kullanır = drift baştan engellenir; P3'te toplu migration için hedef sağlam
- **Tahmini efor**: 1 gün

#### 0.C — Newsletter API Endpoint'i

- **Problem**: 3 form (`home/newsletter-section`, `article/author-newsletter-strip`, `category/category-sidebar`) tamamı `setStatus("ok")` ile yalan teşekkür gösteriyor; `// TODO: wire to /api/newsletter` comment'leri var
- **Çözüm**:
  - **Provider seçimi**: Resend + Resend Audiences (Vercel ile zaten entegre, Vercel Marketplace'de var, ücretsiz tier mevcut) — alternatif: Beehiiv API. **Önerilen: Resend Audiences** (basit, Vercel-yerli)
  - `src/app/api/newsletter/route.ts` — POST endpoint:
    - Email validation (Zod)
    - Rate limit (`checkRateLimit` reuse — `proxy.ts`'den)
    - Resend Audiences `audiences.contacts.create({ audienceId, email })`
    - Idempotent (zaten varsa 200, yeni ise 201)
    - Error handling (network, validation, duplicate)
  - 3 client form artık `fetch("/api/newsletter", ...)` çağıracak (Phase 2'de wiring)
  - `.env` + `.env.example`'a `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` eklenir
- **Dependencies**: Yok (endpoint izole)
- **Risk**: Düşük — graceful degradation: provider key yoksa 503 dön, form UI hata göstersin
- **Etki**: Phase 2'de 3 form da gerçek abonelik yapar; sahte teşekkür biter
- **Tahmini efor**: 0.5 gün

#### 0.D — Legal Route Shell + `(legal)` Group

- **Problem**: `/terms`, `/privacy`, `/refund`, KVKK sayfaları yok; footer'da `href="#"`; Paddle/Stripe production T&C URL'i talep ediyor
- **Çözüm**:
  - `src/app/(legal)/layout.tsx` — sinematik shell layout (`CinematicHeader` + `HomeFooter`, ortak `cinematic-prose`-benzeri uzun metin tipografisi)
  - `src/app/(legal)/_components/legal-shell.tsx` — eyebrow + diamond + serif başlık + son güncelleme tarihi + MDX render alanı + "Geri" linki + breadcrumb
  - **Bu fazda sayfa içeriği YAZILMAZ** — sadece shell + bir tane `/legal-placeholder` test route'u; gerçek copy Phase 1'de eklenir
  - MDX setup: `@next/mdx` veya Contentlayer; tercih: **markdown + `marked`** (zaten kullanıyoruz — yeni bağımlılık yok)
  - Route grubu: `(legal)` parantez ile URL'de görünmez ama shell'i paylaşır
- **Dependencies**: 0.A, 0.B (yeni utility class'lar + CinematicHero hero için kullanılır)
- **Risk**: Düşük
- **Etki**: Phase 1'de 4 legal sayfa içerik eklenerek hızla shipsenir; KVKK + GDPR uyumu mümkün
- **Tahmini efor**: 0.5 gün

#### 0.E — Footer Stratejisi (Karar Belgesi + Bileşen Refactor)

- **Problem**: Footer'da 6 ölü `href="#"` + 3 yalan etiket; sosyal medya gerçek-olmayan profillere link; bir karar belgesi yok
- **Çözüm — Yeni footer şeması**:

| Sütun | Yeni Liste | Eski'den fark |
|---|---|---|
| **Shop** | All Books, Bestsellers (`/books?sort=rating`), New Releases (`/books?sort=newest`), Categories (`/categories`) | Etiketler artık gerçek hedeflere işaret eder (Phase 1+2'de canlanır) |
| **Discover** | Blog, Reading Guides, Behind the Scenes | Değişiklik yok (zaten çalışıyor) |
| **Support** | Library, Orders, Settings, **Contact** (mailto: emre30283@gmail.com) | Contact eklendi (FAQ opsiyonel — gelecek scope) |
| **Legal** | Terms, Privacy, Refund Policy, **KVKK** | KVKK eklendi (TR kullanıcılar için) |
| **Social (bottom bar)** | X (`https://x.com/emredogancloud`), GitHub (`https://github.com/emredogan-cloud`) | Instagram + Facebook ikonları **silindi** (boş profil = brand risk) |

- `home-footer.tsx` bu fazda **sadece veri yapısı** günceller (URL'ler hâlâ "#" olabilir — legal sayfalar Phase 1'de gelir); ikon ekleme/silme bu fazda yapılır (GitHub SVG eklenir, Instagram + Facebook SVG'leri silinir)
- **Dependencies**: Yok
- **Risk**: Düşük
- **Etki**: Phase 1'deki legal sayfalar ship olunca otomatik bağlanır; ölü `#` listesi 6'dan 4'e iner (sadece legal trio + KVKK kalır, onlar da Phase 1'de bağlanır)
- **Tahmini efor**: 0.3 gün

#### 0.F — Auth UX Foundation (Clerk `<UserButton>`)

- **Problem**: Sign-out hiçbir yerde yok; auth state header'da görünmüyor; avatar daima `/account/library`'ye link
- **Çözüm**:
  - `cinematic-header.tsx`'te avatar `<Link>` yerine **Clerk `<UserButton>`** (kendi menüsü: ad, email, "Manage account", "Sign out")
  - Anonim kullanıcılar için: avatar slot'ı **`<SignInButton mode="modal">`** ile "Sign in" pill'ine dönüşür
  - `<ClerkProvider>` zaten mount (layout.tsx); ekleme: appearance customization (cinematic dark teması)
  - **Bu fazda implementasyon YAPILIR** (çünkü hızlı + diğer fazları engellemiyor) — bağlanan sayfalar zaten cinematic
- **Dependencies**: Yok (Clerk zaten kurulu)
- **Risk**: Düşük — Clerk env yoksa graceful (mevcut pattern)
- **Etki**: Sign-out artık var; auth state görünür; kullanıcı paylaşımlı bilgisayardan çıkabilir
- **Tahmini efor**: 0.5 gün

#### 0.G — `UnprovisionedNotice` Cinematic Refactor

- **Problem**: Warm panel; sinematik `/account/library` env-eksik durumunda warm panel sinematik içinde — görsel bug (audit §2 cross-cutting)
- **Çözüm**: `home-glass` + sinematik typography + emerald accent ile rewrite; warm token'ları sil
- **Dependencies**: 0.A
- **Risk**: Düşük
- **Etki**: Cinematic library / account / order / read sayfaları auth-fail state'inde tutarlı görünür
- **Tahmini efor**: 0.3 gün

#### 0.H — `<RecommendationShelf>` Ortak Interface (Hazırlık)

- **Problem**: `cart/recommendation-shelf` ve `library/library-recommendation-shelf` neredeyse identical (audit §6.10); P3'te dedupe etmek için interface'in şimdi netleşmesi gerekiyor
- **Çözüm**: İki dosyada da kullanılan `RecommendationCard` props'unu sabitle; ortak `<RecommendationShelf items={...} title={...} cta={...} />` API tasarımını **tasarla** (bu fazda **implement etme** — sadece interface karar belgesi, Phase 3'te ship)
- **Dependencies**: Yok
- **Risk**: Yok (planlama)
- **Etki**: Phase 3 dedupe işi yarı yarıya hızlanır
- **Tahmini efor**: 0.1 gün

### Routes Affected by Phase 0

- Hiçbir mevcut route üzerinde **görsel** değişiklik yok
- Yeni endpoint: `/api/newsletter`
- Yeni route shell: `(legal)` group + `/legal-placeholder` (test)
- Header güncellenir (UserButton)
- Footer güncellenir (link yapısı + social ikonları)

### Shared Components Affected

- `globals.css` (token + utility class ekleme)
- `cinematic-header.tsx` (UserButton)
- `home-footer.tsx` (link yapısı + ikon listesi)
- `unprovisioned-notice.tsx` (rewrite)
- **Yeni**: `<CinematicHero>`, `<LegalShell>`

### Risk Level

**Düşük** — hiç görsel breaking change yok; sadece additive altyapı.

### Business / UX Impact

- Doğrudan kullanıcı için **henüz** görünür değil
- Ama Phase 1'in tamamı buna bağımlı → fonksiyonel olarak en önemli faz

### Recommended Execution Order

`0.A → 0.B → 0.C → 0.D → 0.E → 0.F → 0.G → 0.H`
(0.A token sistemi diğer her şeyin temeli; 0.B hero diğer hero'ların temeli)

### Success Definition

- [ ] 5 yeni utility class globals.css'te tanımlı + Storybook benzeri test sayfasında doğrulanmış
- [ ] `<CinematicHero>` bileşeni en az 1 test hero'da çalışıyor
- [ ] `/api/newsletter` endpoint canlı; Postman/curl ile manuel test geçiyor
- [ ] `(legal)/layout.tsx` + `<LegalShell>` test route ile render oluyor
- [ ] Footer yeni veri yapısıyla canlı (URL'ler hâlâ # olabilir)
- [ ] Header'da `<UserButton>` çalışıyor; anonim/auth state ayrımı görünür
- [ ] `unprovisioned-notice` cinematic
- [ ] `<RecommendationShelf>` ortak interface dokümante edilmiş (planlama)
- [ ] `npm run lint && npx tsc --noEmit && npm run build && npm test` tamamı yeşil
- [ ] Bir önceki classification dağılımı korunmuş

### "Bu fazdan sonra ne daha iyi?"

Hiçbir kullanıcı henüz yeni bir şey görmez — ama Phase 1 ekibi (yani biz, bir sonraki turda) artık şunu yapabilir:
- `<CinematicHero>` ile yeni hero yazmak 30 satır, eskisinden 5× hızlı
- `/api/newsletter` çağırıp gerçek abonelik
- Legal sayfa kabuğu hazır — sadece içerik
- Sign-out artık var
- Tüm yeni kodlar `.home-headline-accent`, `.home-hero-frame` gibi sınıfları kullanır → drift baştan engelli

---

## Phase 1 — Kritik Kullanıcı Yolculuğu Onarımları

### Goal

Audit'in P1 listesindeki **kullanıcı güvenini doğrudan etkileyen** sorunları kapatmak. Bu fazın sonunda ödeyen müşteri tek bir warm tema sayfası görmeden satın alma yolculuğunu tamamlayabilir.

### Bu Fazda Çözülen Sorunlar

| # | Sorun | Audit Ref |
|---|---|---|
| 1.1 | `/books/[slug]` warm — catalog → detail kırılması | §2#1, §7 P1.3 |
| 1.2 | `/authors/[slug]` warm — discovery → detail kırılması | §2#2, §7 P1.5 |
| 1.3 | `/order/[id]` warm — ödeme sonrası "trust moment" kırılması | §2#3, §7 P1.4 |
| 1.4 | `/categories/[slug]` warm + `/genres/[slug]` yok — genre discovery kırılması | §2#4, §7 P1.6 |
| 1.5 | `/terms`, `/privacy`, `/refund`, `/kvkk` sayfaları yok | §5.4, §7 P1.1 |
| 1.6 | `/about` sayfası yok — header anchor hack | §3.1#5, §7 P1.8 |
| 1.7 | Footer 3 yalan etiket (Bestsellers, New Releases, Categories) + 6 ölü `href="#"` | §3.3#11-13, §7 P1.7 |
| 1.8 | Header sepet noktası daima açık (state'siz) | §3.1#6, §7 P1.9 |
| 1.9 | Authors "View all" CTA ölü `#all` anchor | §3.1#7 |
| 1.10 | CSS bug'ları: group-hover arrow + cart-line data-pending | §3.5#22-25 |

### Phase 1 Alt-Görevleri

#### 1.A — Legal Sayfaları Yaz (4 sayfa)

- **Routes**: `(legal)/terms`, `(legal)/privacy`, `(legal)/refund`, `(legal)/kvkk`
- **Family**: "long-form editorial" — `<LegalShell>` (Phase 0'da hazır) içinde sinematik prose
- **İçerik strateji**:
  - **Terms**: dijital kitap satışı, lisans (bireysel, transfer edilemez), hesap kuralları, ödeme (Paddle MoR), iade'ye atıf
  - **Privacy**: Veri akışı (Clerk + Paddle + Resend + Neon + R2 + Inngest); saklama süreleri; data export (`/account/settings`'teki gerçek buton); silme (`DeleteAccountButton`)
  - **Refund**: 14 gün koşulsuz iade (dijital kitap indirilmediyse); Paddle'ın gerçek iade süreci; "buy once, yours to keep" sözünü güçlendir
  - **KVKK**: TR kullanıcılar için veri sorumlusu + işleme dayanağı + haklar + iletişim (emre30283@gmail.com)
- **GDPR uyumu**: Privacy + KVKK'nın AB versiyonu olarak yazılır; ayrı GDPR sayfası **opsiyonel** (Privacy yeterli olur — gerekirse Phase 2'de eklenebilir)
- **Dependencies**: 0.D
- **Risk**: Düşük (içerik)
- **Etki**: Footer Legal sütunu canlanır; Paddle production T&C URL alır; KVKK uyumu
- **Tahmini efor**: 1 gün (içerik yazımı dahil)

#### 1.B — `/about` Sayfası

- **Route**: `/about`
- **Family**: "long-form brand" — `<LegalShell>` reuse + biraz daha hero-ağırlıklı
- **İçerik**: Markanın hikayesi (digital bookstore vision), kurucu (Emre), neden bu kitapçı (audit'teki "buy once, yours to keep" mesajı genişletilir), iletişim
- **Header link fix**: `cinematic-header.tsx:106` `href="#about"` → `href="/about"`
- **Dependencies**: 0.D, 0.E (footer eski About anchor'unu kullanmıyor zaten)
- **Risk**: Düşük
- **Etki**: Anchor hack biter; gerçek brand sayfası
- **Tahmini efor**: 0.5 gün

#### 1.C — `/books/[slug]` Cinematic Redesign

- **Family**: **"Product Detail"** — özel
- **Yön (architectural direction, görsel spec değil)**:
  - Sinematik shell (`.cinematic-root`, `CinematicHeader`, `HomeFooter`)
  - Hero: 2-kolon — LEFT cinematic cover (CSS-rendered veya R2 image) + sticky add-to-cart panel; RIGHT meta (başlık, yazar, fiyat, derecelendirme, "Buy now" CTA `.home-cta-primary`)
  - "Sample" viewer sinematik panel içinde (mevcut `<SampleViewer>` rewrite)
  - "Reviews" section — sinematik review kartları (mevcut `<ReviewsList>` + `<ReviewForm>` rewrite; in-card glass)
  - "Related books" — `<RecommendationShelf>` reuse
  - JSON-LD SEO korunur
- **Mevcut bileşen yeniden yazımı**:
  - `AddToCartButton` → `.home-cta-primary` chrome
  - `CoverImage` → cinematic R2 + fallback
  - `ReviewForm` → cinematic input + emerald submit
  - `ReviewsList` → glass card + star (yeşil tema)
  - `SampleViewer` → cinematic modal/overlay
  - `StarRating` → emerald star (yellow değil)
- **`<CinematicHero size="lg" variant="with-panel">`** reuse
- **Dependencies**: 0.A, 0.B
- **Risk**: Orta-Yüksek — en kompleks redesign; bağımlı bileşen sayısı yüksek
- **Etki**: En çok tıklanan sayfa; catalog funnel'ı tutarlı hale gelir
- **Tahmini efor**: 2 gün

#### 1.D — `/authors/[slug]` Cinematic Redesign

- **Family**: **"Personality Detail"** — portre + biyografi + kitap grid
- **Yön**:
  - Sinematik shell
  - Hero: 2-kolon — LEFT `<AuthorPortrait>` (mevcut, cinematic, reuse) içinde büyük portre + isim altı; RIGHT eyebrow `AUTHOR` + isim (`<CinematicHero>` reuse) + bio + sosyal/web link
  - Kitap grid: `<CatalogBookCard>` reuse (cinematic) — `<BookCard>` (warm) silinir bu sayfada
  - Empty state: cinematic empty card
- **Dependencies**: 0.A, 0.B
- **Risk**: Düşük-Orta — `/authors` discovery'deki bileşenler reuse edilebilir
- **Etki**: Discovery → detail tutarlı
- **Tahmini efor**: 1 gün

#### 1.E — `/order/[id]` Cinematic Redesign ("Trust Moment")

- **Family**: **"Trust Moment"** — odaklı, sade, premium hissi
- **Yön**:
  - Sinematik shell
  - Hero: eyebrow `ORDER CONFIRMED` + diamond + "Thank you, {name}." (`<CinematicHero size="md">`)
  - Glass panel: sipariş özeti (order ID, tarih, kitaplar listesi, total) — `<CartSummary>` benzeri ama read-only
  - Her kitap satırı: `<CartLine>` benzeri ama "Download" / "Preparing..." / "Revoked" state ile (mevcut `<DownloadButton>` rewrite — cinematic)
  - "View library" CTA `.home-cta-primary` → `/account/library`
  - `FulfillmentPoller` korunur (zaten polling)
- **Mevcut bileşen yeniden yazımı**:
  - `DownloadButton` → cinematic (warm `<Button>`'dan çık, `.home-cta-secondary` chrome)
- **Dependencies**: 0.A, 0.B
- **Risk**: Düşük — sayfa basit ama görünürlüğü yüksek
- **Etki**: Ödeyen müşterinin "wow" anı + brand güveni
- **Tahmini efor**: 1 gün

#### 1.F — `/categories/[slug]` Cinematic Redesign (Genre Detay)

**Karar**: `/genres/[slug]` yeni route oluşturmak yerine **mevcut `/categories/[slug]`'ı cinematic'e çevir**; `<GenreCard>`'ın hedefini doğru route'a (`/categories/{slug}`) yönlendir (zaten orada). Sebep: 2 paralel detay route'u (categories + genres) karışıklık yaratır; tek doğruluk kaynağı koru.

- **Family**: **"Curated Archive"** — `/blog/category` ile aynı aile ama ürünler için
- **Yön**:
  - Sinematik shell
  - `<CinematicHero size="md" variant="with-panel">` — eyebrow `GENRE` + category name + subtitle + 4 stat (book count, avg rating, avg price, reader count — bazıları decorative OK)
  - Filter sidebar: `<FilterSidebar>` reuse (mevcut catalog'dan) — ama burada category zaten sabit, sub-filter olarak format/rating/price
  - Book grid: `<CatalogBookCard>` reuse
  - Empty state: cinematic
- **Dependencies**: 0.A, 0.B; 1.C (catalog-book-card'ın cinematic'e oturmuş olması beklenir — zaten cinematic)
- **Risk**: Düşük (catalog bileşenleri zaten cinematic)
- **Etki**: `/genres` → genre detay tutarlı
- **Tahmini efor**: 0.5 gün

#### 1.G — Footer Link Wiring (Bestsellers, New Releases, Categories, Legal, Social)

- Phase 0.E'deki yeni veri yapısı zaten ship — bu adımda **URL'ler gerçek**:
  - Bestsellers → `/books?sort=rating` (catalog `?sort=` URL sync Phase 2'de ama href doğru olur)
  - New Releases → `/books?sort=newest`
  - Categories → `/categories` (Phase 2'de bu index oluşturulur; o ana kadar 404 olabilir veya geçici olarak `/genres`'e redirect)
  - Terms / Privacy / Refund / KVKK → 1.A'da hazır
  - X / GitHub → gerçek URL'ler; Instagram + Facebook ikonları zaten silinmiş (Phase 0.E)
- **Dependencies**: 0.E, 1.A
- **Risk**: Düşük
- **Etki**: Footer'da hiçbir `href="#"` kalmaz (Categories Phase 2'ye kadar 404 verebilir — kabul edilebilir geçici durum)
- **Tahmini efor**: 0.2 gün

#### 1.H — Header Cart Badge State Wiring

- **Problem**: `cinematic-header.tsx:147-150` daima yanan yeşil nokta
- **Çözüm**:
  - Component'i client side `useState` + `useEffect` ile `/api/cart/count` çağırsın
  - `cart-changed` window event dinlesin (RecommendationCard zaten dispatch ediyor)
  - `count > 0` ise nokta görünür, değilse gizli
- **Dependencies**: Yok (endpoint var, event var)
- **Risk**: Düşük
- **Etki**: Yalan UI biter; gerçek state
- **Tahmini efor**: 0.3 gün

#### 1.I — Quick CSS Bug Fixes (Toplu Sweep)

- `library/library-empty-panel.tsx:44` — `<Link>`'e `group` className ekle
- `authors/authors-shell.tsx:192-193` — `<Link>`'e `group` className ekle
- `cart/empty-cart-card.tsx` — CTA Link'inde `group` kontrol et, eksikse ekle
- `cart/cart-line.tsx` — `<article data-pending={pending ? "true" : "false"}>` ekle
- `authors/authors-shell.tsx:191` — "View all authors" CTA'sı kaldırılır (audit'in §3.1#7 önerisi: filtre aktif değilken zaten tüm grid göründüğü için redundant)
- **Dependencies**: Yok
- **Risk**: Düşük
- **Etki**: 4 microbug çözülür
- **Tahmini efor**: 0.2 gün

### Routes Affected by Phase 1

- **Yeni**: `/about`, `/terms`, `/privacy`, `/refund`, `/kvkk`
- **Cinematic'e geçen**: `/books/[slug]`, `/authors/[slug]`, `/order/[id]`, `/categories/[slug]`
- **Güncellenen**: header (cart badge), footer (URL'ler)

### Shared Components Affected

- `AddToCartButton`, `CoverImage`, `ReviewForm`, `ReviewsList`, `SampleViewer`, `StarRating`, `DownloadButton` — hepsi cinematic'e taşınır (warm tokens silinir)
- `BookCard` (warm) → `CatalogBookCard` (cinematic) ile değiştirilir bu sayfalarda
- `EmptyState` (warm) → cinematic equivalent (zaten library/cart/search'te var; standardize)

### Dependencies

- Tamamen Phase 0'a bağımlı
- Sıralama: `1.A + 1.B (legal + about) → 1.C (en zor sayfa) → 1.D + 1.E + 1.F (paralel) → 1.G + 1.H + 1.I`

### Risk Level

**Orta** — `/books/[slug]` ve `/order/[id]` görünürlüğü yüksek; reviews + downloads gibi mevcut fonksiyon kırılmamalı. Tüm bu sayfalar SSG/dynamic karması — classification dikkatli korunmalı.

### Business / UX Impact

- **En yüksek faz**: ödeyen müşteri yolculuğu (catalog → detail → cart → checkout → order) tek temaya gelir
- Brand güveni; "abandoned site" izlenimi yok
- KVKK uyumu (TR kullanıcılar için yasal); GDPR (AB)
- Footer dead links biter

### Recommended Execution Order

```
1.A (Legal 4 sayfa)    ←  hızlı, izole, footer için gerekli
1.B (About)            ←  hızlı, izole
1.C (books/[slug])     ←  en uzun; bağımlı bileşenler refactor
1.D (authors/[slug])   ←  paralel başlanabilir 1.C ile (bağımlı bileşen farklı)
1.E (order/[id])       ←  1.C'nin sonu beklenir (DownloadButton paylaşımlı)
1.F (categories/[slug]) ← 1.C'nin sonu (CatalogBookCard cinematic onaylı)
1.G (Footer URL fix)   ←  1.A bitince
1.H (Cart badge)       ←  bağımsız
1.I (CSS bugfix sweep) ←  bağımsız; herhangi bir zaman
```

### Success Definition

- [ ] 4 legal sayfa + about gerçek içerikle render ediliyor
- [ ] Catalog → book detail → cart → checkout → order → library zinciri **tek temada**
- [ ] Footer'da `href="#"` yok (Categories `/categories` Phase 2'ye kadar 404 OK)
- [ ] Cart badge sepet boşken görünmüyor, doluyken görünüyor
- [ ] "View all authors" CTA silindi; group-hover arrow'lar oynuyor
- [ ] Tüm SSG/SSR classification'lar korunmuş (build çıktısı diff temiz)
- [ ] `npm run lint && npx tsc --noEmit && npm run build && npm test` yeşil

### "Bu fazdan sonra ne daha iyi?"

- **Kullanıcı**: Tek bir warm sayfa görmüyor (admin + settings + read fallback + error hariç — bunlar UX critical değil)
- **Brand**: Footer canlı, hukuki sayfalar var, KVKK uyumu var
- **Müşteri güveni**: "Thank you" sayfası premium
- **SEO**: Brand pages (about) + legal pages indekslenebilir
- **Risk yönetimi**: Paddle T&C URL'i artık karşılanabilir

---

## Phase 2 — UX Wiring + Fonksiyonel Tamamlama

### Goal

Sinematik kabukların arkasındaki **boş kabukları doldur**: filtreler gerçekten filtrelesin, newsletter gerçekten POST etsin, search state URL'e gitsin, library entry'ler gerçekten kategorilensin.

### Bu Fazda Çözülen Sorunlar

| # | Sorun | Audit Ref |
|---|---|---|
| 2.1 | Library filter/sort/view toggle bar tamamen no-op | §3.1#1-3, §7 P2.3 |
| 2.2 | 3 newsletter formu sahte success (Phase 0'da API hazır, şimdi wire) | §3.2#8-10, §7 P2 (newsletter wiring) |
| 2.3 | `/account/orders` warm tema | §2#5, §7 P2.1 |
| 2.4 | `/categories` index sayfası yok | §4.2, §7 P2.2 |
| 2.5 | `/read/[bookId]` fallback'leri warm | §2#6, §7 P2.4 |
| 2.6 | Catalog `?page=`, `?sort=`, `?filter=` URL sync yok | §7 P2.6 |
| 2.7 | `featured-books-section` + `categories-section` hard-coded demo | §3.4#17-18, §7 P2.7 |
| 2.8 | Category sidebar topic pills `onClick` yok | §3.1#4, §7 P2.8 |
| 2.9 | Auth header avatar — Phase 0'da UserButton ship oldu ama detay UX (modal sign-in pill) burada finalize | §7 P2.5 (devam) |
| 2.10 | `<RecommendationShelf>` cart + library — Phase 3'te dedupe ama interface karar Phase 0'da; burada hâlâ ayrı (P3'e ertelenir) | §6.10 |

### Phase 2 Alt-Görevleri

#### 2.A — Newsletter 3 Form Wiring

- **Problem**: Phase 0'da `/api/newsletter` hazır; ama 3 form hâlâ `setStatus("ok")` no-op
- **Çözüm**:
  - `home/newsletter-section.tsx` `onSubmit` → `fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) })`
  - `article/author-newsletter-strip.tsx` aynı
  - `category/category-sidebar.tsx` aynı
  - Her birinde: 4-state — `idle`, `loading`, `ok`, `error` (error mesajı görünür)
  - Rate limit hatası (429) için özel mesaj
- **Dependencies**: 0.C
- **Risk**: Düşük
- **Etki**: Sahte teşekkür biter; gerçek abonelik
- **Tahmini efor**: 0.5 gün

#### 2.B — Library Filter/Sort/View Wiring

- **Problem**: `library-filters.tsx` tüm bar local state — hiçbir şey filtrelemiyor
- **Çözüm**:
  - **DB schema migration**: `library` tablosuna `read_status` enum ekle: `not_started | reading | finished | wishlist`
  - `LibraryEntry` query genişletilir
  - Yeni server action: `updateReadStatus(bookId, status)` — Library'deki her kitap kartında bir mini menü "Mark as reading / finished / wishlist" eklenir
  - State lift: `library/page.tsx` `LibraryShell` (yeni client wrapper) içine taşınır — `activeTab`, `sort`, `view` orada yaşar
  - `LibraryBooksGrid` props alır: `entries`, `view`, `sort` — `useMemo` ile filtreler/sıralar/render
  - **View modes**:
    - **Grid** (mevcut)
    - **Shelf** (horizontal scroll, ince kart) — yeni layout
    - **List** (tek satır, table-style) — yeni layout
- **Dependencies**: Phase 0 yok ama database migration var → `drizzle/`a yeni migration commit
- **Risk**: Orta — schema migration prod'a etki eder; idempotent migration zorunlu
- **Etki**: En büyük "yalan UI" bar canlanır; gerçek personal library deneyimi
- **Tahmini efor**: 1.5 gün

#### 2.C — `/account/orders` Cinematic Redesign

- **Family**: **"Account Dashboard"** (yeni redesign ailesi)
- **Yön**:
  - Sinematik shell
  - `<CinematicHero size="md">` — eyebrow `YOUR ORDERS` + diamond + "Your **orders**"
  - Order list: glass row'lar (yatay düzen — tarih, status badge, item count, total, "View details →")
  - Empty state: cinematic empty card ("No orders yet — Browse the catalog")
- **Mevcut bileşen yeniden yazımı**:
  - `OrderCard` (sayfa-içi local) → `<CinematicOrderRow>` (yeni shared bileşen)
  - `EmptyState` → cinematic empty card pattern reuse
- **Dependencies**: 0.A, 0.B
- **Risk**: Düşük
- **Etki**: Library → Orders zinciri tutarlı
- **Tahmini efor**: 0.5 gün

#### 2.D — `/categories` Index Sayfası

- **Family**: **"Curated Archive"** alt-versiyonu — `/genres` benzeri ama category'ler için
- **Yön**:
  - Sinematik shell
  - `<CinematicHero size="md">` — eyebrow `BROWSE BY CATEGORY` + diamond + "All categories"
  - Card grid: her kategori için kart (Genre card pattern reuse) — kitap sayısı, küçük cover preview
  - Tıklama → `/categories/[slug]` (Phase 1.F'de cinematic)
- **Dependencies**: 0.A, 0.B, 1.F
- **Risk**: Düşük
- **Etki**: Footer Categories linki canlı; navigation gap kapatılır
- **Tahmini efor**: 0.5 gün

#### 2.E — `/read/[bookId]` Fallback Sayfaları Cinematic

- **Problem**: Happy path PDF reader OK ama "still preparing" + "could not start" fallback'leri warm
- **Çözüm**: İki text-only fallback'i cinematic empty card pattern ile rewrite et (ReaderShell happy path warm kalır — focus mode kasti)
- **Dependencies**: 0.A
- **Risk**: Düşük
- **Etki**: Reader entry/exit'i cinematic
- **Tahmini efor**: 0.2 gün

#### 2.F — Catalog URL Sync (`?page=`, `?sort=`, `?filter=`)

- **Problem**: `/books` filter + sort + page state hepsi client-only; refresh → reset; share-link çalışmaz
- **Çözüm**:
  - `CatalogShell`'i `useSearchParams` + `router.replace` ile URL'le iki-yönlü sync et
  - State değişti → URL'e yaz; URL değişti → state'e oku
  - History entry pollution'dan kaçınmak için debounced replace (300ms)
  - Initial state'i URL'den oku (SSG-friendly)
- **Dependencies**: Yok
- **Risk**: Orta — yanlış yapılırsa back/forward bozulur
- **Etki**: Share-link, browser back/forward, refresh state korur; SEO için filtreli URL'ler indekslenebilir
- **Tahmini efor**: 0.5 gün

#### 2.G — Featured Books + Categories Section DB Feed

- **Problem**: `home/featured-books-section.tsx` 6 hard-coded book; `home/categories-section.tsx` 5 hard-coded category
- **Çözüm**:
  - `featured-books-section` → `getFeaturedBooks()` (mevcut catalog query) çağırır; 6 kitap döner
  - `categories-section` → `getAllCategories()` çağırır; en popüler 5'i alır
  - Card linkleri artık `/books/{slug}` ve `/categories/{slug}` (`/books` değil)
  - DB boş durumunda graceful fallback (homepage'in boş kalmasını engelle) — mevcut "demo fallback" pattern kullan (catalog'un `mapRealBooksToShell` benzeri)
- **Dependencies**: 1.C (book detail cinematic) + 1.F (category cinematic) — link hedefleri hazır olsun
- **Risk**: Düşük (sadece prop değişikliği)
- **Etki**: Homepage canlı; kitap kartları doğru kitaba gidiyor
- **Tahmini efor**: 0.3 gün

#### 2.H — Category Sidebar Topic Pills Wiring

- **Problem**: `category/category-sidebar.tsx:92-98` pill button'ları `onClick` yok
- **Çözüm**:
  - **Blog post frontmatter'ına `tags: ["choosing-books", "habits"]` alanı ekle**
  - `BlogPostMeta` extend: `tags?: string[]`
  - Yeni route: `/blog/tag/[slug]` (SSG) — bir tag'le filtrelenmiş post listesi (`/blog/category/[slug]` benzeri ama tag'le)
  - Pills `<Link href="/blog/tag/{tag-slug}">`'e çevrilir
  - **Bu fazda 1-2 örnek tag'lenmiş post ile başla; içerik genişletilebilir**
- **Dependencies**: Yok
- **Risk**: Düşük
- **Etki**: Ölü görsel ghost buton biter; blog discovery derinleşir
- **Tahmini efor**: 0.7 gün

#### 2.I — Catalog Toolbar Hard-Coded "50,231" Cleanup

- **Problem**: Catalog'un "Showing X-Y of **50,231**" sahte (audit §3.4#14)
- **Çözüm**: `Z` değeri filtered olmayan listenin gerçek length'i; toolbar `totalCount` prop alır
- **Dependencies**: Yok
- **Risk**: Düşük
- **Etki**: Sahte sayı biter
- **Tahmini efor**: 0.1 gün

#### 2.J — Popular Searches Sahte Sayıları Cleanup

- **Problem**: `popular-searches-panel` "12.4K searches" sahte (§3.4#15)
- **Çözüm**: **Sayıyı tamamen kaldır** (analytics yokken yalan sayı tutmaktansa); etiket sadece "Search this →" olsun
- **Dependencies**: Yok
- **Risk**: Düşük
- **Etki**: Yalan UI biter
- **Tahmini efor**: 0.1 gün

### Routes Affected by Phase 2

- **Yeni**: `/categories` (index), `/blog/tag/[slug]`
- **Cinematic'e geçen**: `/account/orders`, `/read/[bookId]` fallback'leri
- **Güncellenen**: `/books` (URL sync), `/account/library` (filter wiring), `/` (DB feed), `/blog/category/[slug]` (topic pills wiring)

### Shared Components Affected

- `home/newsletter-section`, `article/author-newsletter-strip`, `category/category-sidebar` (newsletter)
- `library/library-filters` + `library/library-books-grid` + yeni `LibraryShell` wrapper
- Yeni: `<CinematicOrderRow>`
- `home/featured-books-section`, `home/categories-section` (DB feed)
- `catalog/catalog-shell` (URL sync)
- `search/popular-searches-panel` (sayı kaldırma)

### Dependencies

- 2.A → 0.C (newsletter endpoint)
- 2.B → DB migration (drizzle)
- 2.C, 2.D, 2.E → 0.A, 0.B
- 2.G → 1.C, 1.F
- Diğerleri bağımsız

### Risk Level

**Orta** — schema migration (2.B) prod'a etki eder; idempotent + rollback planı zorunlu. URL sync (2.F) yanlış yapılırsa back/forward bozulur.

### Business / UX Impact

- "Library nereyi gösterirse onu göster" değil "ben istediğim view'i seçerim" deneyimi
- Newsletter gerçek subscriber listesi → marketing capability
- Share-link friendly catalog → viral
- Topic pills artık ölü değil → blog derinleşir
- `/categories` index → footer canlanır

### Recommended Execution Order

```
2.A (Newsletter wiring)      ← hızlı, izole, Phase 0'a bağlı
2.I + 2.J (sahte sayı temiz) ← hızlı, izole
2.G (DB feed)                ← 1.C + 1.F bittikten sonra
2.F (URL sync)               ← orta, izole
2.E (Read fallback)          ← hızlı, izole
2.D (categories index)       ← orta, 1.F'ye bağlı
2.C (orders cinematic)       ← orta
2.H (topic pills)            ← biraz daha kompleks (yeni route)
2.B (library wiring)         ← en uzun; schema migration; en sona
```

### Success Definition

- [ ] 3 newsletter formu gerçek POST; success state gerçek, error state gerçek
- [ ] Library filter/sort/view toggle gerçekten grid'i değiştiriyor; en az 3 entry farklı `read_status`'da test edildi
- [ ] `/account/orders`, `/categories` index, `/read/[bookId]` fallback'leri cinematic
- [ ] `/books?sort=newest&category=fiction&page=2` URL refresh sonrası state korunuyor; back/forward çalışıyor
- [ ] Homepage featured + categories DB'den geliyor (DB boşsa graceful demo)
- [ ] Category sidebar topic pill'leri `/blog/tag/[slug]`'a gidiyor
- [ ] Catalog "50,231" + popular searches "12.4K" sahte sayıları temiz
- [ ] DB migration test edildi (up + down)
- [ ] `npm run lint && tsc && build && test` yeşil

### "Bu fazdan sonra ne daha iyi?"

- **Kullanıcı**: Library benimkini gösteriyor (kategorize edebiliyorum); newsletter'a abone oldum ve gerçekten oldum; bir kategori URL'sini arkadaşımla paylaşabiliyorum; ana sayfada gerçek katalog görüyorum
- **Operasyon**: Newsletter listesi gerçek; analytics için baseline atılmış
- **Tasarım**: Yalan UI sayıları bitti; ölü pill'ler yok
- **Yaşam alanı**: `/blog/tag/[slug]` ile içerik discovery genişledi

---

## Phase 3 — Sistem Polish + Tasarım Borcu + Optimizasyon

### Goal

Kullanıcı yolculuğunda görünmeyen ama **kod sürdürülebilirliğini** etkileyen borcu temizle. Bu fazın sonunda yeni feature eklemek dramatik olarak daha hızlı.

### Bu Fazda Çözülen Sorunlar

| # | Sorun | Audit Ref |
|---|---|---|
| 3.1 | `/account/settings` warm | §2#7, §7 P3.1 |
| 3.2 | `/admin` + `/admin/books/[slug]/edit` warm | §2#8-9, §7 P3.2 |
| 3.3 | `/error.tsx` warm | §2#10, §7 P3.3 |
| 3.4 | 225 inline emerald hex (token migration) | §6.2, §7 P3.4 |
| 3.5 | 9 hero %85 kopya (`<CinematicHero>` migration) | §6.3, §7 P3.5 |
| 3.6 | `<RecommendationShelf>` cart + library dedupe | §6.10, §7 P3.6 |
| 3.7 | Dead keyframe `home-fade-up` | §6.8, §7 P3.7 |
| 3.8 | Orphan `blog-card.tsx` | §2, §7 P3.8 |
| 3.9 | Stats card sahte sayılar (50K+ / 10K+ / 25K+) | §3.4#19, §7 P3.10 |
| 3.10 | Web Share API entegrasyonu | §7 P3.11 |
| 3.11 | Border-radius standardizasyonu (`rounded-3xl` vs `rounded-[24px]`) | §6.5, §7 P3.12 |
| 3.12 | Tracking hierarchy temizliği (0.18/0.2/0.22 overlap) | §6.4, §7 P3.13 |
| 3.13 | Dark indicator chip karar | §5.7, §7 P3.14 |
| 3.14 | Reduced-motion + a11y QA | §8.2 |

### Phase 3 Alt-Görevleri

#### 3.A — `/account/settings` Cinematic Redesign

- **Family**: **"Account Dashboard"** (Phase 2.C ile aynı aile)
- **Yön**:
  - Sinematik shell
  - `<CinematicHero size="md">` — eyebrow `YOUR ACCOUNT` + diamond + "Settings"
  - Glass paneller — sırayla: profile (read-only), preferences, privacy actions (Export, Delete)
  - `DeleteAccountButton` + `ExportDataButton` cinematic chrome
- **Dependencies**: 0.A, 0.B
- **Tahmini efor**: 0.5 gün

#### 3.B — `/admin` + `/admin/books/[slug]/edit` Cinematic Redesign

- **Family**: **"Internal Dashboard"** (yeni aile — admin-only)
- **Yön**:
  - Sinematik shell ama biraz daha "yoğun bilgi" (table-heavy)
  - Metrics: 3 stat card (sinematik)
  - Recent orders table: glass row'lar
  - Catalog management table: glass row + inline action butonları
  - Edit form: cinematic input + emerald submit; "Danger zone" panel cinematik kırmızı
- **Dependencies**: 0.A, 0.B
- **Risk**: Düşük (allowlist user; production sorun çıkarmaz)
- **Tahmini efor**: 1.5 gün (2 sayfa)

#### 3.C — `/error.tsx` Cinematic

- **Family**: "empty/error card" pattern (cart + search empty ile aynı)
- **Yön**:
  - Sinematik shell (manuel mount — error boundary kendi layout'u render ediyor)
  - Centered glass card: "Something went wrong" + dev mode'da `<pre>` + emerald "Try again" buton (`.home-cta-primary`)
- **Dependencies**: 0.A
- **Tahmini efor**: 0.3 gün

#### 3.D — Token Migration (225 Inline Hex → Utility Class)

- **Problem**: Hard-coded `text-[#33f0aa]`, `bg-[#16c784]/10` vs.
- **Çözüm**:
  - Codemod yaz (jscodeshift/ast-grep) veya **dikkatli search-replace** (regex-based):
    - `text-[#e6e6e0]` → `text-fg-hi`
    - `text-[#a7a7a0]` → `text-fg-mid`
    - `text-[#88918a]` → `text-fg-muted`
    - `text-[#33f0aa]` → `text-emerald-bright`
    - `bg-[#16c784]/10 border-[#16c784]/30` → `.home-icon-tile` (Phase 0.A'da hazır)
    - `linear-gradient(...emerald headline)` 10 yerde → `.home-headline-accent`
    - `boxShadow` 3 yerde → `.home-hero-frame`
  - Visual regression: her sayfa için manuel kontrol (otomatik snapshot yoksa)
- **Dependencies**: 0.A
- **Risk**: Orta — geniş çaplı değişiklik; visual regression riski
- **Etki**: Token sistemi gerçekten kullanılıyor; rebrand 12 CSS var değişikliğiyle olur
- **Tahmini efor**: 1.5 gün (codemod yazımı + manuel pass)

#### 3.E — 9 Hero `<CinematicHero>` Migration

- **Problem**: 9 hero %85 kopya
- **Çözüm**: Her birini Phase 0.B'deki `<CinematicHero>` API'sıyla rewrite et
  - `home/hero.tsx`, `catalog/catalog-hero.tsx`, `cart/cart-hero.tsx`, `blog/blog-hero.tsx`, `authors/authors-hero.tsx`, `search/search-hero.tsx`, `library/library-hero.tsx`, `genres/genres-hero.tsx`, `category/category-hero.tsx`, `article/article-hero.tsx`
  - **Not**: Bazıları (homepage, article) özel scene panel'ler içeriyor — `variant="with-panel"` ile geçilir
- **Dependencies**: 0.B
- **Risk**: Orta — visual regression riski
- **Etki**: ~400 satır dedupe; gelecek hero değişiklikleri tek dosyada
- **Tahmini efor**: 1 gün

#### 3.F — `<RecommendationShelf>` Dedupe

- **Problem**: Cart + library shelf neredeyse identical
- **Çözüm**: Phase 0.H'deki interface ile tek bileşene indirge; iki tüketici parametre geçer
- **Dependencies**: 0.H
- **Tahmini efor**: 0.3 gün

#### 3.G — Dead Code Sweep

- **Çözüm**:
  - `@keyframes home-fade-up` sil (`globals.css`)
  - `src/components/blog-card.tsx` sil (orphan, audit doğruladı)
  - Eski ad-hoc emerald hex'lerden artık utility class'a geçmemiş olanları tespit et + migrate et
- **Dependencies**: 3.D, 3.E (yeni tüketici yok demek)
- **Tahmini efor**: 0.2 gün

#### 3.H — Stats Card + Featured Books Demo Cleanup

- Phase 2.G zaten featured + categories'i DB'ye bağladı; ama `home/stats-card.tsx` ("50K+/10K+/25K+") hâlâ hard-coded
- **Çözüm**: Sayıları kaldır veya gerçek sayılar geldiğinde devreye al; şu an gerçek sayı yoksa decorative chip'e indirge ("Loved by readers" tarzı)
- **Tahmini efor**: 0.2 gün

#### 3.I — Web Share API

- **Çözüm**: `article/share-panel.tsx` mobile'da `navigator.share` (varsa) kullansın; yoksa mevcut intent URL fallback
- **Tahmini efor**: 0.2 gün

#### 3.J — Border-Radius Standardizasyonu

- **Çözüm**: 4 token belirle: `rounded-[18px]` (sm card), `rounded-[24px]` (md panel), `rounded-[28px]` (lg horizontal), `rounded-[32px]` (xl hero frame); `rounded-3xl` kullanımlarını `rounded-[24px]`'e migrate et veya tersi — tutarlılık seç
- **Tahmini efor**: 0.3 gün

#### 3.K — Tracking Hierarchy Cleanup

- **Çözüm**: 3 seviye — `tracking-[0.3em]` (hero), `tracking-[0.2em]` (section eyebrow), `tracking-[0.12em]` (caption). 0.18 ve 0.22 kullanımlarını migrate et
- **Tahmini efor**: 0.3 gün

#### 3.L — Dark Indicator Chip Karar

- **Karar**: Tema toggle değil (sinematik tek tema vizyonu); chip chrome'unu sadeleştir (pill yerine inline text). Tıklanabilir görüntüyü kaldır
- **Tahmini efor**: 0.1 gün

#### 3.M — Reduced-Motion + A11y QA

- **Çözüm**:
  - `@media (prefers-reduced-motion: reduce)` ile tüm keyframe'leri kapat
  - Focus ring: emerald glow ring ekle (mevcut `:focus-visible` az)
  - aria-current="page" nav linklerinde
  - Screen reader pass — heading hierarchy + alt text
- **Tahmini efor**: 0.7 gün

### Routes Affected by Phase 3

- **Cinematic'e geçen**: `/account/settings`, `/admin`, `/admin/books/[slug]/edit`, `/error.tsx`
- **İçten temizlenen**: 9 hero kullanan tüm sayfalar (görsel değişmemeli)
- **Silinen kod**: orphan blog-card, dead keyframe

### Shared Components Affected

- Tüm cinematic dosyaları (token migration sweeps)
- 9 hero bileşeni (CinematicHero migration)
- `home/stats-card.tsx`, `home/cinematic-header.tsx` (sayı temizliği)
- Yeni cinematic: `<DeleteAccountButton>`, `<ExportDataButton>`, `<AdminEditBookForm>` (rewrite)

### Dependencies

- 3.D → 0.A; 3.E → 0.B; 3.F → 0.H; 3.G → 3.D + 3.E
- Diğerleri bağımsız

### Risk Level

**Orta-Yüksek** (token migration + hero migration visual regression riski yüksek; iyi snapshot/visual diff disiplini şart)

### Business / UX Impact

- **Doğrudan kullanıcı görünmeyen** (zaten zincir tek temada)
- **Geliştirici hızı**: Yeni hero yazmak 30 satır; rebrand 12 var change
- **Production-grade**: Reduced motion, a11y, dead code yok

### Recommended Execution Order

```
3.C (error)           ← hızlı, izole, başlangıç ısınma
3.L (dark chip)       ← hızlı
3.H (stats sahte)     ← hızlı
3.I (Web Share)       ← hızlı
3.A (settings)        ← orta
3.B (admin)           ← orta
3.D (token migration) ← uzun, riskli, dikkat
3.E (hero migration)  ← uzun, riskli
3.F (recshelf dedupe) ← 0.H'e bağlı; hızlı
3.J + 3.K (radius + tracking) ← orta
3.G (dead code sweep) ← son
3.M (reduced-motion + a11y) ← son polish
```

### Success Definition

- [ ] Tüm warm tema route'ları cinematic (admin + settings + error + read fallback dahil) — **0 warm sayfa kaldı**
- [ ] `git grep "#33f0aa"` `globals.css` dışında **0 sonuç** (veya max 5-10 spesifik istisnaya düşmüş)
- [ ] 9 hero `<CinematicHero>` kullanıyor — `*-hero.tsx` dosyaları 80-110 satıra inmiş (eskiden ~180-250)
- [ ] `@keyframes home-fade-up`, `src/components/blog-card.tsx` silinmiş
- [ ] `prefers-reduced-motion` honor ediliyor (Chrome DevTools'ta toggle ile test)
- [ ] Lighthouse a11y skoru ≥ 95 (cinematic ana sayfalar)
- [ ] `npm run lint && tsc && build && test` yeşil
- [ ] Visual regression QA pass (manuel)

### "Bu fazdan sonra ne daha iyi?"

- **Geliştirici DX**: Yeni feature 2x daha hızlı (utility class + parametreli bileşen)
- **Sürdürülebilirlik**: Tek source of truth (token), tek hero, tek recshelf
- **Erişilebilirlik**: Reduced-motion + focus ring + aria
- **Production-grade**: Hiçbir warm sayfa, dead code, hard-coded sahte değer kalmamış
- **Rebrand maliyeti**: 200 dosya → 12 CSS var

---

## Phase Completion Matrix

Audit'in tüm önemli bulguları aşağıdaki tabloda fazlara dağıtılmıştır. **Eksik tek bir bulgu yoktur.**

| # | Sorun (Audit Bulgusu) | Audit Ref | Faz | Son Status |
|---|---|---|---|---|
| 1 | Design token kullanılmıyor (225 inline hex) | §6.2 | P0.A (utility class) + P3.D (migration) | ✅ Sürdürülebilir token sistemi |
| 2 | 9 hero %85 kopya | §6.3 | P0.B (bileşen) + P3.E (migration) | ✅ Tek parametreli bileşen |
| 3 | Headline gradient 10 inline kopya | §6.3 | P0.A `.home-headline-accent` | ✅ Utility |
| 4 | Hero frame shadow 3 inline kopya | §6.3 | P0.A `.home-hero-frame` | ✅ Utility |
| 5 | Icon tile chrome 6+ kopya | §6.3 | P0.A `.home-icon-tile` | ✅ Utility |
| 6 | Pill hover 3 kopya | §6.3 | P0.A `.home-pill-hover` | ✅ Utility |
| 7 | Avatar gradient 3 kopya | §6.3 | P0.A `.home-avatar-gradient` | ✅ Utility |
| 8 | `/api/newsletter` yok | §3.2 | P0.C (endpoint) | ✅ Resend Audiences |
| 9 | Newsletter form 1 (homepage) sahte | §3.2#8 | P2.A | ✅ Gerçek POST |
| 10 | Newsletter form 2 (article) sahte | §3.2#9 | P2.A | ✅ Gerçek POST |
| 11 | Newsletter form 3 (category sidebar) sahte | §3.2#10 | P2.A | ✅ Gerçek POST |
| 12 | `/terms` sayfası yok | §5.4 | P0.D + P1.A | ✅ Cinematic legal |
| 13 | `/privacy` sayfası yok | §5.4 | P0.D + P1.A | ✅ Cinematic legal |
| 14 | `/refund` sayfası yok | §5.4 | P0.D + P1.A | ✅ Cinematic legal |
| 15 | KVKK/GDPR uyumu yok | (audit yokluğu) | P1.A | ✅ `/kvkk` sayfası |
| 16 | `/about` sayfası yok (anchor hack) | §4.2 | P1.B | ✅ Cinematic about |
| 17 | Header "About" linki #about anchor | §3.1#5 | P1.B | ✅ `/about`'a yönlendi |
| 18 | Header cart badge daima yanıyor | §3.1#6 | P1.H | ✅ State-driven |
| 19 | Sign-out yok | §3.6 | P0.F | ✅ `<UserButton>` |
| 20 | Sign-in/up affordance yok | §3.6 | P0.F | ✅ `<SignInButton>` modal |
| 21 | Auth state header'da görünmüyor | §3.6 | P0.F | ✅ `<UserButton>` ad+email |
| 22 | `/books/[slug]` warm | §2#1 | P1.C | ✅ Cinematic product detail |
| 23 | `/authors/[slug]` warm | §2#2 | P1.D | ✅ Cinematic personality |
| 24 | `/order/[id]` warm | §2#3 | P1.E | ✅ Cinematic trust moment |
| 25 | `/categories/[slug]` warm | §2#4 | P1.F | ✅ Cinematic curated archive |
| 26 | `/genres/[slug]` yok (GenreCard hatalı yönlendiriyor) | §4.2 | P1.F (mevcut /categories'i kullan) | ✅ Karar: çift route yerine tek /categories/[slug] |
| 27 | `/account/orders` warm | §2#5 | P2.C | ✅ Cinematic dashboard |
| 28 | `/categories` index yok | §4.2 | P2.D | ✅ Cinematic kategori grid |
| 29 | `/read/[bookId]` fallback'leri warm | §2#6 | P2.E | ✅ Cinematic fallback'ler |
| 30 | `/account/settings` warm | §2#7 | P3.A | ✅ Cinematic dashboard |
| 31 | `/admin` warm | §2#8 | P3.B | ✅ Cinematic internal |
| 32 | `/admin/books/[slug]/edit` warm | §2#9 | P3.B | ✅ Cinematic internal |
| 33 | `/error.tsx` warm | §2#10 | P3.C | ✅ Cinematic error card |
| 34 | Library filter tab no-op | §3.1#1 | P2.B (schema + wiring) | ✅ Filtered grid |
| 35 | Library sort select no-op | §3.1#2 | P2.B | ✅ Sorted grid |
| 36 | Library view toggle (Grid/Shelf/List) no-op | §3.1#3 | P2.B | ✅ 3 layout |
| 37 | Category sidebar topic pills `onClick` yok | §3.1#4 | P2.H (frontmatter tags + /blog/tag) | ✅ Tag route'a Link |
| 38 | Authors "View all" CTA `#all` ölü | §3.1#7 | P1.I (CTA kaldırılır) | ✅ Silindi |
| 39 | Footer "Bestsellers" `/books` yanıltıcı | §3.3#11 | P0.E (yeni şema) + P2.F (?sort=) | ✅ `/books?sort=rating` |
| 40 | Footer "New Releases" `/books` yanıltıcı | §3.3#11 | P0.E + P2.F | ✅ `/books?sort=newest` |
| 41 | Footer "Categories" `/books` yanıltıcı | §3.3#11 | P0.E + P2.D | ✅ `/categories` index |
| 42 | Footer "Terms" `href="#"` | §3.3#12 | P1.A + P1.G | ✅ `/terms` |
| 43 | Footer "Privacy" `href="#"` | §3.3#12 | P1.A + P1.G | ✅ `/privacy` |
| 44 | Footer "Refund Policy" `href="#"` | §3.3#12 | P1.A + P1.G | ✅ `/refund` |
| 45 | Footer Twitter `href="#"` | §3.3#13 | P0.E + P1.G | ✅ `https://x.com/emredogancloud` |
| 46 | Footer Instagram `href="#"` | §3.3#13 | P0.E (ikon silinir) | ✅ Profil yok = ikon yok |
| 47 | Footer Facebook `href="#"` | §3.3#13 | P0.E (ikon silinir) | ✅ Profil yok = ikon yok |
| 48 | Footer'da GitHub yok | (audit ekleme) | P0.E | ✅ `https://github.com/emredogan-cloud` eklendi |
| 49 | Footer "Contact" yok | §5.3 | P0.E | ✅ mailto: emre30283@gmail.com |
| 50 | Catalog "50,231" sahte | §3.4#14 | P2.I | ✅ Gerçek count |
| 51 | Popular searches "12.4K" sahte | §3.4#15 | P2.J | ✅ Sayılar kaldırıldı |
| 52 | Search results rating hard-coded 4.7 sarı | §3.4#16 | P3 (DB rating geldiğinde) — şimdilik decorative işaretlenir | ⚠️ DB rating beklenecek |
| 53 | Homepage featured books hard-coded | §3.4#17 | P2.G | ✅ DB feed |
| 54 | Homepage categories hard-coded | §3.4#18 | P2.G | ✅ DB feed |
| 55 | Home stats card 50K+/10K+/25K+ sahte | §3.4#19 | P3.H | ✅ Decorative chip veya kaldırılır |
| 56 | Library stats 3/4 hard-coded 0 | §3.4#20 | (kabul edilebilir — bookmarks/highlights gerçek pipeline gelmedi) | ⚠️ Schema gelince devreye |
| 57 | Category stats Rating/Readers hard-coded | §3.4#21 | (aynı — analytics yok) | ⚠️ Schema gelince devreye |
| 58 | library-empty-panel group-hover bug | §3.5#22 | P1.I | ✅ `group` className eklendi |
| 59 | authors-shell group-hover bug | §3.5#23 | P1.I | ✅ `group` className eklendi |
| 60 | empty-cart-card group-hover bug | §3.5#24 | P1.I | ✅ `group` className eklendi |
| 61 | cart-line data-pending hiç set edilmiyor | §3.5#25 | P1.I | ✅ Attribute eklendi |
| 62 | `unprovisioned-notice` warm | §2 cross-cutting | P0.G | ✅ Cinematic rewrite |
| 63 | `blog-card.tsx` orphan | §2 cross-cutting | P3.G | ✅ Silindi |
| 64 | `empty-state.tsx` warm (sadece warm sayfalarda) | §2 cross-cutting | P1+P2 (warm sayfalar cinematic olunca tüketici kalmaz) → P3.G | ✅ Silinebilir |
| 65 | `ui/button.tsx` sadece warm sayfalarda | §2 cross-cutting | P1+P2+P3.B (warm tüketiciler cinematic) → Button warm token bağımlılığı kalır ama yeni admin Button cinematic | ✅ Cinematic admin Button |
| 66 | `site-header.tsx` warm | §2 cross-cutting | Tüm warm sayfalar cinematic olunca tüketici kalmaz | ✅ Layout'tan kaldırılır veya cinematic'leştirilir (P3 sonu) |
| 67 | `home-fade-up` keyframe ölü | §6.8 | P3.G | ✅ Silindi |
| 68 | Border-radius drift (rounded-3xl vs [24px]) | §6.5 | P3.J | ✅ 4 token |
| 69 | Tracking 0.18/0.2/0.22 overlap | §6.4 | P3.K | ✅ 3 seviye |
| 70 | Dark indicator chip karışıklığı | §5.7 | P3.L | ✅ Chrome sadeleştirildi |
| 71 | RecommendationShelf duplicate (cart + library) | §6.10 | P0.H (interface) + P3.F (impl) | ✅ Dedupe |
| 72 | Catalog `?page=`, `?sort=`, `?filter=` URL sync yok | (audit P2.6) | P2.F | ✅ URL sync |
| 73 | Web Share API yok | (audit P3.11) | P3.I | ✅ Fallback olarak |
| 74 | Reduced-motion guard yok | §8.2 | P3.M | ✅ `@media (prefers-reduced-motion)` |
| 75 | A11y QA yok (focus ring, aria) | §8.2 | P3.M | ✅ Focus ring + aria |
| 76 | Empty state'ler test edilmemiş (0 post, 0 yazar) | §8.2 | P1.D + P2.D (cinematic empty cards bu sayfalarda hazır olur) | ⚠️ Manuel QA Phase sonunda |
| 77 | Mobile responsive kapsamlı QA yok | §8.2 | Her fazda manuel test gerekli | ⚠️ Faz sonunda QA |

**Toplam: 77 bulgu — 73'ü kapatılır, 4'ü "schema/analytics gelince" işaretiyle bekler.**

### Bekleyen 4 madde (faz dışı / scope dışı)

- #52 Search results rating — gerçek rating pipeline DB'de yok (book detail sayfasındaki ReviewsList var ama list-level aggregate gerekiyor)
- #56 Library stats bookmarks/hours/highlights — DRM-side pipeline gelmemiş (gelecek schema work)
- #57 Category stats Rating/Readers — analytics pipeline yok
- #76 + #77 Empty state + mobile QA — manuel test; her faz sonunda dahil

Bunlar **audit'in bulduğu sahte sayıları zaten dökümante etmiş durumdaydı** — gerçek pipeline gelmeden değiştirilemez.

---

## Önemli Kararlar Özeti (Hızlı Referans)

### 1. Legal Strategy

**Karar**: Internal cinematic sayfalar (`(legal)` route grubu, MDX-tabanlı uzun metin). AWS/Terraform değil.
**Sebep**: Brand bütünlüğü; operasyon basit; içerik versiyonlanabilir; AWS overhead'i scope için fazla.
**Sayfa listesi**: `/terms`, `/privacy`, `/refund`, `/kvkk`. GDPR ayrı sayfa **değil** — Privacy + KVKK GDPR'i yeterince karşılar; gerekirse genişletilir.

### 2. Footer Strategy

| Eski | Yeni | Neden |
|---|---|---|
| 4 Shop link (3'ü `/books`) | 4 Shop link, hepsi gerçek hedef | Yalan etiket biter |
| 3 Discover (Blog, Reading Guides, BTS) | Korunur | Çalışıyor |
| 3 Support (Library, Orders, Settings) | 4 (+ Contact mailto) | Destek kanalı |
| 3 Legal (`href="#"`) | 4 (+ KVKK) | Hukuki uyum |
| 3 Social (`href="#"`) | 2 (X + GitHub) | Gerçek olmayan profiller silinir |
| Dark indicator chip (button-like) | Sade text chip | Affordance kafa karışıklığı |

### 3. Legacy Route Strategy

| Route | Karar | Aile |
|---|---|---|
| `/books/[slug]` | Cinematic redesign | Product Detail |
| `/authors/[slug]` | Cinematic redesign | Personality Detail |
| `/order/[id]` | Cinematic redesign | Trust Moment |
| `/categories/[slug]` | Cinematic redesign | Curated Archive |
| `/genres/[slug]` | **Oluşturulmayacak** — `/categories/[slug]` reuse | (silindi) |
| `/account/orders` | Cinematic redesign | Account Dashboard |
| `/account/settings` | Cinematic redesign | Account Dashboard |
| `/read/[bookId]` fallback'leri | Cinematic redesign | Empty Card pattern |
| `/admin` + `/admin/.../edit` | Cinematic redesign | Internal Dashboard |
| `/error.tsx` | Cinematic redesign | Empty Card pattern |
| `site-header.tsx` (warm) | Tüm warm route'lar cinematic olunca **silinir** veya cinematic'leştirilir | — |
| `blog-card.tsx` (orphan) | **Silinir** | — |
| `empty-state.tsx` (warm) | Tüketici kalmayınca **silinir** | — |
| `ui/button.tsx` (warm) | Admin/settings/error cinematic olunca cinematic equivalent ile değiştirilir | — |

### 4. Interaction Strategy

| Etkileşim | Wiring stratejisi | Faz |
|---|---|---|
| 3 newsletter formu | Tek `/api/newsletter` endpoint (Resend Audiences) | P0.C + P2.A |
| Library filter/sort/view | DB schema migration + state lift + `useMemo` filter | P2.B |
| Category sidebar topic pills | Frontmatter `tags` + `/blog/tag/[slug]` route | P2.H |
| Header cart badge | `/api/cart/count` + `cart-changed` event listener | P1.H |
| Header About link | `/about` route + href güncelle | P1.B |
| Authors "View all" CTA | Silinir (redundant) | P1.I |
| Footer social | X + GitHub gerçek; IG + FB ikon silinir | P0.E |
| Footer legal | Gerçek route'a bağlanır | P1.G |
| CSS group-hover bug | `group` className eklenir | P1.I |
| cart-line data-pending | Attribute eklenir | P1.I |
| Catalog URL sync | `useSearchParams` + `router.replace` (debounced) | P2.F |
| Sign-out / auth state | Clerk `<UserButton>` | P0.F |

### 5. Design System Strategy

| Borç | Strateji | Faz |
|---|---|---|
| 225 inline hex | Tailwind v4 `@theme` token + 5 yeni utility class | P0.A + P3.D |
| 9 hero kopyası | `<CinematicHero>` parametreli | P0.B + P3.E |
| RecommendationShelf duplicate | Ortak interface + tek bileşen | P0.H + P3.F |
| Border-radius drift | 4 token (18/24/28/32) | P3.J |
| Tracking drift | 3 seviye (0.3 / 0.2 / 0.12) | P3.K |
| Dead keyframe `home-fade-up` | Silinir | P3.G |
| Orphan `blog-card.tsx` | Silinir | P3.G |
| Reduced-motion + a11y | Global `@media` guard + focus ring + aria | P3.M |

---

## Final Doğrulama

Bu yol haritası **TASARIM_AUDIT_RAPORU_TR.md** ile birebir karşılaştırıldı:

- ✅ Audit §1 (10 cinematic route) — değişiklik gerekmez
- ✅ Audit §2 (10 warm route) — 10/10 fazlara dağıtıldı
- ✅ Audit §3.1 (no-op interactions, 7 madde) — 7/7 fazlara dağıtıldı
- ✅ Audit §3.2 (newsletter stubs, 3 madde) — 3/3 fazlara dağıtıldı
- ✅ Audit §3.3 (misleading links, 3 madde) — 3/3 fazlara dağıtıldı
- ✅ Audit §3.4 (hard-coded fake data, 8 madde) — 6 kapatıldı, 2 schema beklemede
- ✅ Audit §3.5 (CSS bugs, 4 madde) — 4/4 P1.I'de
- ✅ Audit §3.6 (auth UX, 4 madde) — 4/4 P0.F'te
- ✅ Audit §4 (navigation) — header + footer + route gap'leri fazlara dağıtıldı
- ✅ Audit §5 (footer) — yeni şema P0.E'de; içerik P1+P2'de
- ✅ Audit §6 (design system, 10+ alt-madde) — token, hero, dedupe fazlara dağıtıldı
- ✅ Audit §7 P1 (9 madde) — P1 fazında
- ✅ Audit §7 P2 (9 madde) — P2 fazında
- ✅ Audit §7 P3 (14 madde) — P3 fazında
- ✅ Audit §8 risk (yasal, brand, UX, auth, tema kırılma) — P0+P1'de kapatıldı

**Hiçbir audit bulgusu unutulmadı.**

---

## Sonraki Adım

Bu yol haritası implementation için hazır. Kullanıcı **"Phase 0"** dediğinde:

1. `0.A` (Design Token Katmanı) ile başlanır
2. Sırayla `0.B → 0.C → 0.D → 0.E → 0.F → 0.G → 0.H` yapılır
3. Her alt-görev kendi commit'i ile branş'e işlenir; Phase sonunda toplu PR
4. Phase 0 bitince Phase 1 (`1.A`'dan başlayarak) başlar
5. Her faz sonunda Phase Completion Matrix'teki ilgili satırlar ✅ ile işaretlenir; iterativ doğrulama

**Implementasyon başlamadı.** Bu doküman tek doğruluk kaynağıdır.

---

_`/home/emre/Downloads/enterprise-web-site/SINEMATIK_REDESIGN_EXECUTION_PHASES_TR.md`_
