# Sinematik Tasarım Sistemi — Forensik Audit Raporu

**Tarih:** 2026-05-30
**Kapsam:** Tüm uygulama (route, bileşen, etkileşim, tasarım sistemi, footer, navigation)
**Yöntem:** Statik kod incelemesi + bileşen izleme + handler/state denetimi + design token taraması
**Amaç:** Mevcut sinematik premium redesign sisteminin gerçek kapsamını, eksik/sahte etkileşimleri ve tutarsızlıkları tespit edip bir sonraki polish/cleanup fazı için tek doğruluk kaynağı (source-of-truth) belge üretmek.

---

## Yönetici Özeti (3 Dakikalık Okuma)

- **10 route** tam sinematik dark tema kullanıyor; **10 route** hâlâ eski warm/light tasarımda.
- Sinematik header'daki `About` linki **gerçek bir About sayfasına gitmiyor** — sadece footer'ın `id="about"` anchor'una scroll yapıyor.
- Footer'da **6 ölü `href="#"`** linki var: Terms, Privacy, Refund Policy + Twitter, Instagram, Facebook.
- Footer "Shop" sütunundaki **4 linkten 3'ü aynı `/books` URL'sine gidiyor** (Bestsellers, New Releases, Categories) — kullanıcıyı yanıltıyor.
- **3 newsletter formu da sahte**: `/api/newsletter` endpoint'i yok; `setStatus("ok")` ile "teşekkürler" yalan mesajı gösteriyor.
- `/account/library` sayfasındaki **filtre + sort + view toggle çubuğu** tamamen no-op — local state'i hiç kullanılmıyor.
- Sinematik header'daki **yeşil sepet noktası daima açık** — sepet boş olsa bile yanıyor.
- **`GenreCard` → `/categories/[slug]`** (warm tema) gidiyor; **`AuthorCard` → `/authors/[slug]`** (warm tema) gidiyor — cinematic discovery → warm detay kırılması.
- Ödeme sonrası gösterilen **`/order/[id]` sayfası warm tema** — markanın "güven anı" en kötü tema kırılmasını yaşıyor.
- Tasarım sistemi: 9 hero bileşeni birbirinin %85 kopyası (~400 satır tekrar); emerald hex'leri **225 yerde inline yazılı**, sadece 4 utility class CSS değişkenlerini okuyor.

Detay aşağıda.

---

## 1. Yeni Tasarıma Geçen Sayfalar

`.cinematic-root` + `CinematicHeader` + `HomeFooter` üçlüsünü kullanan tüm rotalar:

| # | Route | Amaç | Durum | Paylaşılan Bileşenler | Notlar |
|---|---|---|---|---|---|
| 1 | `/` | Ana sayfa — hero + featured books + kategoriler + neden biz + newsletter | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `Hero`, `HeroBook`, `FeaturedBooksSection`, `CategoriesSection`, `WhyReadersSection`, `NewsletterSection`, `TrustRow`, `RevealOnScroll`, `ScrollCue`, `StatsCard` | Featured books + kategoriler **hard-coded demo data**; DB'ye bağlı değil |
| 2 | `/books` | Katalog index — filtre + sort + sayfa | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `CatalogHero`, `CatalogShell`, `CatalogToolbar`, `FilterSidebar`, `Pagination`, `CatalogBookCard` | Filtreler client-side; DB boş geldiğinde demo set ile çalışıyor; toolbar'da `"50,231"` sahte global sayı |
| 3 | `/authors` | Yazar discovery hub — filtre, sort, search | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `AuthorsHero`, `AuthorsShell`, `StatsStrip`, `AuthorCard`, `AuthorPortrait` | "View all authors" CTA **ölü anchor** (`#all` hiçbir yere işaret etmiyor) |
| 4 | `/genres` | Tür/genre discovery hub | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `GenresHero`, `GenresShell`, `GenreCard`, `GenreArtwork`, `ExploreStrip` | `GenreCard` → `/categories/[slug]` (warm tema) — kırılma noktası |
| 5 | `/blog` | Blog index — kategori pills + post listesi | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `BlogHero`, `BlogShell`, `TopicPills`, `ArticleRow`, `ArticleImage` | Tüm interaktivite çalışıyor |
| 6 | `/blog/[slug]` | Blog detay — sticky TOC + share | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `ArticleHero`, `ArticleBody`, `ReadingSidebar`, `SharePanel`, `AuthorNewsletterStrip` | TOC intersection observer **doğru çalışıyor**; share buttons gerçek; newsletter stub |
| 7 | `/blog/category/[slug]` | Blog kategori arşivi (Reading Guides, Behind the Scenes) | ✅ Tam sinematik (en yeni — bu PR) | `CinematicHeader`, `HomeFooter`, `CategoryHero`, `CategoryStats`, `CategoryArticleCard`, `CategorySidebar`, `EditorialStrip`, `ReadingRoomScene` | Sidebar topic pills **`onClick` yok** — sadece görsel |
| 8 | `/cart` | Sepet — boş + dolu | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `CartHero`, `CartLine`, `CartSummary`, `EmptyCartCard`, `RecommendationShelf`, `RecommendationCard` | Checkout, remove, clear, add-to-cart tamamı çalışıyor |
| 9 | `/search` | Arama — büyük input + öneri panel + sonuçlar | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `SearchHero`, `LargeSearchInput`, `SuggestionPills`, `PopularSearchesPanel`, `CategoryDiscoveryPanel`, `SearchResults`, `EmptySearchCard` | "Popular searches" sayıları **sahte** (12.4K vb.); search sonuç rating'i hard-coded 4.7 |
| 10 | `/account/library` | Kişisel kütüphane | ✅ Tam sinematik | `CinematicHeader`, `HomeFooter`, `LibraryHero`, `LibraryStats`, `LibraryFilters`, `LibraryBooksGrid`, `LibraryEmptyPanel`, `LibraryRecommendationShelf` | **Filter / sort / view toggle bar tamamen no-op**; stats'in 3/4'ü hard-coded `0` |

**Toplam: 10/20 (≈%50) route sinematik temada.**

---

## 2. Hâlâ Eski Tasarım Kullanan Alanlar

Bu rotalar `.cinematic-root` kullanmıyor → `src/app/layout.tsx:88`'deki `<SiteHeader />` üstte görünüyor (warm tema), `<HomeFooter />` ise hiç yok — sayfa kapanışsız bitiyor.

| # | Route | Eski Olan | Tutarsızlık Sebebi | Öncelik | Kanıt (dosya:satır) |
|---|---|---|---|---|---|
| 1 | `/books/[slug]` | Tüm sayfa: warm container, `text-muted-foreground`, `text-foreground`, `border-border`; `AddToCartButton`, `CoverImage`, `ReviewForm`, `ReviewsList`, `SampleViewer`, `StarRating` warm bileşenleri | Sinematik `/books` katalog → click → warm detay. En çok trafiği alan ürün sayfası | **P1 — Kritik** | `src/app/books/[slug]/page.tsx:151,176,181,186,211,217-235,246,261,270,304` |
| 2 | `/authors/[slug]` | `<main class="max-w-5xl py-16">`, warm typography, warm `BookCard` grid, warm `EmptyState` | Sinematik `/authors` discovery → ilk tıkta tema kırılması | **P1 — Kritik** | `src/app/authors/[slug]/page.tsx:56,58,61,65,78-81` |
| 3 | `/order/[id]` | "Thank you" overline `text-muted-foreground`, warm card border'lar, pending pulse `bg-primary/60` (warm yeşil, sinematik emerald değil), `text-destructive` revoked state, `text-primary` library link (warm) | **Ödeyen müşteri**nin gördüğü ilk sayfa. Sinematik cart → checkout → **warm receipt** → sinematik library zinciri. Markanın en kötü tema kırılması | **P1 — Kritik** | `src/app/order/[id]/page.tsx:49,53,56,59,72,86,107-111,115,130` |
| 4 | `/categories/[slug]` | Warm `<main>`, warm `BookCard` grid, warm `EmptyState` | `<GenreCard>` buraya yönlendiriyor (sinematik `/genres` → warm `/categories/[slug]`) | **P1 — Kritik** (genres ile gizli bağ var) | `src/app/categories/[slug]/page.tsx:54,56,59,70-75` |
| 5 | `/account/orders` | Warm centered header, warm `EmptyState`, `OrderCard` `rounded-lg border border-border p-5`, `text-muted-foreground` / `text-foreground` her yerde | Sinematik header'daki "Library" nav'dan dolaylı erişim — kullanıcı sinematik library → orders'a geçtiğinde tema kırılıyor | **P2 — Önemli** | `src/app/account/orders/page.tsx:47-60,62-65,83,86,91,97,100` |
| 6 | `/read/[bookId]` | `<ReaderShell>` warm tokenlar (`bg-background`, `bg-muted/40`, `bg-white` PDF wrapper), fallback "still preparing" + "could not start" sayfaları tamamen warm | Happy path PDF reader'ı `fixed inset-0 z-50` overlay ile SiteHeader'ı kapatıyor — odak modu için savunulabilir. Ama 2 fallback sayfası warm tema açıkça görüyor | **P2 — Önemli** (fallback'ler) | `src/app/read/[bookId]/page.tsx:58-76,99-115`; `src/components/reader-shell.tsx:273,275,311,338,356` |
| 7 | `/account/settings` | Warm typography, section divider'lar `border-t border-border`, `DeleteAccountButton` + `ExportDataButton` warm `ui/button` kullanıyor | Düşük trafikli ama yine tema kırılması | **P3 — Polish** | `src/app/account/settings/page.tsx:43,48,54,58,75,76,79,85,88,97,100` |
| 8 | `/admin` | Tüm sayfa warm: `StatCard` `bg-card`, table headers `bg-muted/40`, `STATUS_BADGE_CLASSES` warm token map, `<Button size="lg">`, `<code class="bg-muted">` | Sadece admin (allowlist) görüyor — müşteri etkisi yok | **P3 — Polish** | `src/app/admin/page.tsx:155,157,160,165,242,275,284,303,353-358,406,415,434,464,506,509,542,563,575,619,628` |
| 9 | `/admin/books/[slug]/edit` | Warm `AdminEditBookForm` (border-input fieldsets, warm error/success notice), warm "Danger zone" `border-destructive/30` | Sadece admin görüyor | **P3 — Polish** | `src/app/admin/books/[slug]/edit/page.tsx:110,114,116,124,128-129,144,149`; `AdminEditBookForm:185,210,223,264,272` |
| 10 | `/error.tsx` (global error boundary) | Warm `<main>`, warm typography, warm `<Button size="lg">` | Yalnızca render hatasında görülüyor | **P3 — Polish** | `src/app/error.tsx:29,30,33,36,43,49` |

### Cross-cutting (eski tema artıkları)

| Bileşen | Sorun | Etki |
|---|---|---|
| `src/components/site-header.tsx` | Warm; sadece 2 nav (Books, Blog); Authors/Genres/Library/Search yok; ⌘K yok | `body:has(.cinematic-root) > header { display: none }` ile sinematik sayfalarda gizleniyor — ama eski rotalar bu thinner header'ı görüyor |
| `src/components/unprovisioned-notice.tsx` | Warm typography & border; `account/library` sinematik shell içinde mount olduğunda **warm panel sinematik içinde gözüküyor** — şimdiden görsel bug | Auth env yoksa her sayfada görünür |
| `src/components/blog-card.tsx` | Warm — ve **orphan** (`grep` ile başka tüketici yok) | Silinebilir |
| `src/components/empty-state.tsx` | Warm — sinematik sayfalar kendi empty card'larını kullanıyor (`library-empty-panel`, `empty-cart-card`, `empty-search-card`) | `authors/[slug]`, `categories/[slug]`, `account/orders` bunu kullanıyor → o sayfalar warm |
| `src/components/ui/button.tsx` | Warm shadcn (`bg-primary text-primary-foreground` warm token) | Sadece warm sayfalarda kullanılıyor — sinematik sayfalar `.home-cta-primary` / `.home-cta-secondary` ile kendi CTA'larını render ediyor. Tüm warm sayfalar `<Button>`'a bağımlı |

---

## 3. Bağlanmayan / Eksik Çalışan Buton ve Etkileşimler

### 3.1 Tamamen No-Op (Görsel Var, Fonksiyon Yok)

| # | Route / Bileşen | Element | Şu an ne yapıyor | Beklenen | Kök neden | Düzeltme |
|---|---|---|---|---|---|---|
| 1 | `/account/library` → `library/library-filters.tsx:44-58` | "All Books / Downloaded / Reading / Want to Read / Finished" tab buttons | `setActiveTab(tab)` — sadece local state | Library grid'ini status'a göre filtrelemeli | `LibraryEntry` schema'sında read state yok; `activeTab` parent'a hiç gitmiyor | (a) Schema'ya `read_status` kolonu ekle; (b) State'i `library/page.tsx`'e lift et; (c) `LibraryBooksGrid`'e filtreli liste pas |
| 2 | `/account/library` → `library/library-filters.tsx:72-83` | "Sort by" `<select>` | `setSort(value)` — local state | Library grid'ini sıralamalı | State parent'a hiç gitmiyor | Lift state + grid'i `useMemo` ile resort |
| 3 | `/account/library` → `library/library-filters.tsx:91-113` | View toggle (Grid / Shelf / List) | `setView(mode)` — local state | Layout değiştirmeli | `LibraryBooksGrid` daima aynı grid render ediyor | Lift state + `<LibraryBooksGrid view={...}>` |
| 4 | `/blog/category/[slug]` → `category/category-sidebar.tsx:92-98` | "Popular topics" pill buttons | **`onClick` handler yok** — saf görsel | Feed'i tag'e göre filtrelemeli veya tag URL'sine gitmeli | Blog post frontmatter'ında tag schema yok (sadece `category`) | (a) Frontmatter'a `tags` alanı ekle, `BlogPostMeta`'yı genişlet; (b) Pills'i `<Link>`'e çevir veya parent callback'i pas |
| 5 | `/` → `home/cinematic-header.tsx:105-114` | "About" `<a href="#about">` | Footer'ın `id="about"` anchor'una scroll yapıyor | Gerçek About sayfası | `/about` route'u yok — sadece footer id'si | **Karar**: ya `/about/page.tsx` oluştur ve `href`'i değiştir, ya footer-jump'ı kabul et (sadece `/` sayfasında anlamlı; diğer sayfalarda hâlâ footer'a scroll yapıyor — yarı bozuk) |
| 6 | `/` → `home/cinematic-header.tsx:147-150` | Sepet ikonundaki yeşil nokta | **Daima açık** — sepet durumuyla ilgisi yok | Sepet boş değilse yanmalı | `/api/cart/count` endpoint'i var ama header çağırmıyor | `fetch("/api/cart/count")` → `count > 0` ise göster; `cart-changed` event'iyle refresh et (RecommendationCard zaten dispatch ediyor) |
| 7 | `/authors` → `authors/authors-shell.tsx:191-203` | "View all authors" CTA `<Link href="#all">` | URL'ye `#all` ekliyor, hiçbir yere scroll yapmıyor | Tüm yazarları göster | `id="all"` hiçbir elementte yok | (a) CTA'yı tamamen kaldır (grid zaten filtered tüm yazarları gösteriyor); (b) `/authors/all` ayrı route oluştur; (c) "Reset filters" alias yap |

### 3.2 Sahte/Eksik Backend (Görsel + Local State Var, Gerçek Aksiyon Yok)

| # | Route / Bileşen | Element | Şu an ne yapıyor | Beklenen | Kök neden | Düzeltme |
|---|---|---|---|---|---|---|
| 8 | `/` → `home/newsletter-section.tsx:19-25,62-85` | "Subscribe" form | `setStatus("success")` — local state; "Thanks — you'll hear from us soon" YALAN mesajı | E-mail'i bir provider'a POST etmeli | `/api/newsletter` endpoint'i yok; explicit `// TODO: POST to /api/newsletter` comment | Provider seç (Beehiiv/Resend); `src/app/api/newsletter/route.ts` oluştur; 3 form da aynı endpoint'i çağırsın |
| 9 | `/blog/[slug]` → `article/author-newsletter-strip.tsx:28-33,102-124` | "Subscribe" form | `setStatus("ok")` — local; sahte teşekkür | Aynı | Aynı endpoint yok | Aynı çözüm |
| 10 | `/blog/category/[slug]` → `category/category-sidebar.tsx:60-66,133-152` | "Subscribe" form | `setStatus("ok")` — local; sahte teşekkür | Aynı | Aynı endpoint yok | Aynı çözüm |

### 3.3 Yanıltıcı Linkler

| # | Route / Bileşen | Element | Şu an ne yapıyor | Beklenen | Düzeltme |
|---|---|---|---|---|---|
| 11 | `home/home-footer.tsx:52-58` | "Shop" sütunu: Bestsellers, New Releases, Categories | 4 link de `/books`'a gidiyor — etiket kullanıcıyı yanıltıyor | Farklı sürede curate edilmiş listeler | `/books?sort=bestselling`, `/books?sort=new`, `/categories` (yeni index route) — veya etiketleri kaldır |
| 12 | `home/home-footer.tsx:77-83` | "Legal" sütunu: Terms, Privacy, Refund Policy | **`href="#"`** — sayfa başına scroll | Gerçek hukuki sayfalar | Üç route oluştur (aşağıda Part 5'te detay) |
| 13 | `home/home-footer.tsx:138-159` | Social ikonlar: Twitter, Instagram, Facebook | **`href="#"`** — sayfa başına scroll | Gerçek sosyal profiller | Gerçek URL'leri ver veya ikonları sil |

### 3.4 Bağlantı Sağlam Ama Yan Etki Sahte/Hard-Coded

| # | Route / Bileşen | Element | Sorun |
|---|---|---|---|
| 14 | `catalog/catalog-shell.tsx:168-172` | Toolbar "Showing X-Y of **50,231**" | **`"50,231"` sahte global sayı** — comment "marketing label" diyor. Gerçek toplam DB sayısı olmalı |
| 15 | `search/popular-searches-panel.tsx:99-104` | "12.4K searches" badges | Sahte sayılar — analytics endpoint yok |
| 16 | `search/search-results.tsx` | Result card rating | **Hard-coded 4.7** sarı yıldız (oysa `featured-books-section` yeşil yıldız) — drift |
| 17 | `home/featured-books-section.tsx` | 6 featured book card | Tamamen **hard-coded demo** — DB'ye bağlı değil; her kart `/books`'a gidiyor (kendi slug'ına değil) |
| 18 | `home/categories-section.tsx` | 5 kategori kartı | `count: "12.4K books"` **sahte**; kart `/books`'a gidiyor (`/categories/<slug>`'a değil) |
| 19 | `home/stats-card.tsx` | "50K+ / 10K+ / 25K+" | Hard-coded |
| 20 | `library/library-stats.tsx` | 4 stat (Bookmarks, Hours, Highlights, Books) | Sadece `booksOwned` gerçek; diğer 3'ü hard-coded `0` — inline comment'lerle belgeli |
| 21 | `category/category-stats.tsx` | 4 stat (Articles, Avg Read, Rating, Readers) | Articles + Avg Read gerçek; Rating (4.9) + Readers (3.1k) hard-coded placeholder |

### 3.5 CSS Bug'ları (Görsel İçinde Çalışmayan Microanimation)

| # | Dosya:satır | Sorun |
|---|---|---|
| 22 | `library/library-empty-panel.tsx:48-53` | `group-hover:translate-x-1` arrow span'i var ama parent `<Link>`'te `group` className yok → arrow **asla hareket etmiyor** |
| 23 | `authors/authors-shell.tsx:196-201` | Aynı bug — `group` parent yok |
| 24 | `cart/empty-cart-card.tsx` (benzer pattern) | `group-hover:translate-x-1` arrow — parent kontrol edilmeli |
| 25 | `cart/cart-line.tsx` | `data-[pending=true]:opacity-50` style hook var; **`data-pending` attribute hiç set edilmiyor** → pending visual asla görünmüyor. Eklenmesi: `<article data-pending={pending ? "true" : "false"}>` |

### 3.6 Auth UX Boşlukları

| # | Sorun | Detay |
|---|---|---|
| 26 | Sinematik header'da **Sign in / Sign up butonu yok** | Avatar daima `/account/library`'ye link; auth değilse `proxy.ts` Clerk hosted sign-in'e redirect; auth durumu görünür değil |
| 27 | **Sign out butonu hiçbir yerde yok** | Kullanıcı Clerk hosted portal'dan çıkmak zorunda; uygulama içinde affordance yok |
| 28 | `<UserButton>` kullanılmıyor | Clerk'ın resmi `<UserButton>` bileşeni avatar + menü + sign-out içeriyor — entegre değil |
| 29 | `/sign-in` ve `/sign-up` env vars var ama local route yok | `.env.example` bunları gösteriyor; uygulama Clerk hosted'a yönlendiriyor — kasti olabilir ama belgelenmeli |

### 3.7 Doğru Çalışan Etkileşimler (Doğrulandı)

Aşağıdakiler **kanıtlanmış olarak doğru çalışıyor** — refactor planlarında bunlara dokunmamalı:

- `cart/recommendation-card.tsx` "+" butonu → `addToCart` server action + `cart-changed` event + 2s green check
- `cart/cart-line.tsx` "✕" remove + `cart/cart-summary.tsx` "Checkout" + "Clear cart"
- `catalog/filter-sidebar.tsx` tüm filtreler (search, category, format, price, rating) — `CatalogShell` `useMemo`'da gerçekten filtreliyor
- `catalog/catalog-toolbar.tsx` sort + view toggle — gerçekten sort/render değiştiriyor
- `catalog/pagination.tsx` — gerçekten slice ediyor (ama URL `?page=` sync **yok**)
- `blog/topic-pills.tsx` + `blog/blog-shell.tsx` — gerçekten filtreliyor
- `genres/genres-shell.tsx` + `authors/authors-shell.tsx` search/sort/filter — hepsi gerçek
- `search/large-search-input.tsx` — `router.push("/search?q=…")` gerçek FTS
- `search/suggestion-pills.tsx`, `popular-searches-panel.tsx`, `category-discovery-panel.tsx` linkleri — gerçek
- `article/share-panel.tsx` Twitter/Facebook/LinkedIn/Copy — gerçek (intent URL + clipboard API)
- `article/reading-sidebar.tsx` TOC IntersectionObserver — temiz, leak-yok
- `reader-shell.tsx` PDF kontrolleri (prev/next, zoom, ←/→/Esc, resume from `initialPage`, debounced progress sync) — kalite yüksek
- `cinematic-header.tsx` ⌘K shortcut + tüm nav linkleri (About hariç)

---

## 4. Navigation ve Route Audit

### 4.1 Header Navigation (`cinematic-header.tsx`)

| Element | Hedef | Durum |
|---|---|---|
| Logo `digital bookstore` | `/` | ✅ Çalışıyor |
| Books | `/books` | ✅ Çalışıyor |
| Authors | `/authors` | ✅ Çalışıyor |
| Genres | `/genres` | ✅ Çalışıyor |
| Blog | `/blog` | ✅ Çalışıyor |
| Library | `/account/library` | ✅ Çalışıyor (auth değilse Clerk redirect) |
| **About** | `#about` | ❌ Anchor hack — sadece footer'a scroll yapıyor; gerçek About sayfası yok |
| Search pill (⌘K) | `/search` | ✅ Çalışıyor |
| Cart icon | `/cart` | ✅ Çalışıyor — ama yeşil nokta her zaman yanıyor (state'siz) |
| Avatar | `/account/library` | ⚠️ Auth state göstermiyor; sign-in/out affordance yok |

### 4.2 Erişilemeyen / Orphan Rotalar

| Route | Var mı? | UI'dan erişim | Sorun |
|---|---|---|---|
| `/genres/[slug]` | ❌ Yok | — | `<GenreCard>` `/categories/[slug]`'a gidiyor (warm tema) — sinematik genres'in detay sayfası yok |
| `/categories` (index) | ❌ Yok | — | Footer "Categories" linki `/books`'a gidiyor; header'da nav yok |
| `/about` | ❌ Yok | — | Header + footer `#about` anchor'a yönlendiriyor |
| `/terms`, `/privacy`, `/refund` | ❌ Yok | — | Footer'da `href="#"` |
| `/bestsellers`, `/new-releases` | ❌ Yok | — | Footer linkleri `/books`'a redirect (etiket yalan) |
| `/sign-in`, `/sign-up` | ❌ Yok | — | `.env.example` set ediyor ama Clerk hosted kullanılıyor |
| `/order/[id]` | ✅ Var | Paddle redirect'i sonrası | UI'da link yok — sadece dış sistemden gelir |
| `/read/[bookId]` | ✅ Var | Library'den `DownloadButton`/cover link'inden | OK |
| `/admin/*` | ✅ Var | UI nav yok — direkt URL ile | Sadece allowlist user; OK |

### 4.3 Sinematik → Warm Geçişleri (Tema Kırılma Noktaları)

```
SINEMATIK                          WARM (kırılma)
─────────────────────────────────  ─────────────────────────────────
/books      (catalog)         →    /books/[slug]      (detay)        🔴 P1
/authors    (discovery)       →    /authors/[slug]    (yazar detay)  🔴 P1
/genres     (discovery)       →    /categories/[slug] (genre detay)  🔴 P1
/cart       (checkout flow)   →    /order/[id]        (receipt)      🔴 P1
/account/library              →    /account/orders    (siparişler)   🟠 P2
/account/library              →    /account/settings  (ayarlar)      🟡 P3
/account/library              →    /admin             (admin only)   🟡 P3
herhangi bir sayfa            →    /error.tsx         (hata)         🟡 P3
```

`<SiteHeader>` global mount'u `body:has(.cinematic-root) > header { display: none }` ile gizleniyor → warm sayfalar **eski thinner header'ı görüyor**, footer hiç yok.

### 4.4 Duplicate Navigation

- **Search**: header pill + header mobile icon + `/search` sayfası (`LargeSearchInput`). 3 farklı entry — kasti, sorun değil.
- **Library**: header nav + footer "Support" sütunu + avatar — 3 entry, kasti.
- **Blog kategorileri**: footer "Discover" sütunu hard-code 2 kategori (Reading Guides, Behind the Scenes); blog index `TopicPills` ise dinamik tüm kategoriler. Yeni kategori eklenirse footer **el ile güncellenmek zorunda** — bug magnet.

---

## 5. Footer Audit ve İçerik Önerileri

### 5.1 SHOP Sütunu

| Link | Şu anki state | Çalışıyor mu | Route var mı | Stratejik Öneri |
|---|---|---|---|---|
| All Books | `/books` | ✅ Aktif | ✅ | İyi — tut |
| **Bestsellers** | `/books` | ❌ Passif | ❌ (route yok) | `/books?sort=bestselling` query param ekle ve `CatalogShell`'in mevcut sort'unu pre-select et; veya `/bestsellers` ayrı SSG sayfası (curated 12 kitap, hero ile) |
| **New Releases** | `/books` | ❌ Passif | ❌ | `/books?sort=newest` veya `/new-releases` curated sayfa (son 30 günde eklenenler, "Bu ay" tarzı editorial intro) |
| **Categories** | `/books` | ❌ Passif | ❌ (sadece `/categories/[slug]`, index yok) | `/categories` index sayfası oluştur — tüm kategorilerin sinematik card grid'i; veya footer'dan kaldır (header'da `/genres` zaten var) |

### 5.2 DISCOVER Sütunu

| Link | Şu anki state | Çalışıyor mu | Route var mı | Stratejik Öneri |
|---|---|---|---|---|
| Blog | `/blog` | ✅ Aktif | ✅ | İyi |
| Reading Guides | `/blog/category/reading-guides` | ✅ Aktif | ✅ | İyi |
| Behind the Scenes | `/blog/category/behind-the-scenes` | ✅ Aktif | ✅ | İyi |
| _(yok)_ — | — | — | — | **Öneri**: "Book Lists" (curated tematik listeler) veya "Newsletter Archive" (gönderilmiş newsletter'ların arşivi) eklenebilir |

### 5.3 SUPPORT Sütunu

| Link | Şu anki state | Çalışıyor mu | Route var mı | Stratejik Öneri |
|---|---|---|---|---|
| Library | `/account/library` | ✅ Aktif | ✅ | İyi |
| Orders | `/account/orders` | ⚠️ Çalışıyor ama warm tema | ✅ | Sayfa P2 redesign'e geçtikten sonra OK |
| Settings | `/account/settings` | ⚠️ Çalışıyor ama warm tema | ✅ | Sayfa P3 redesign'e geçtikten sonra OK |
| _(yok)_ — | — | — | — | **Öneri**: "Contact Support" (e-mail mailto: veya iletişim formu), "FAQ" (statik faq sayfası), "Help Center" eklenmeli — bir kullanıcı sorun yaşadığında nereye gideceği belirsiz |

### 5.4 LEGAL Sütunu

| Link | Şu anki state | Çalışıyor mu | Route var mı | Stratejik Öneri |
|---|---|---|---|---|
| **Terms** | `#` | ❌ Ölü | ❌ | `/terms/page.tsx` — statik MDX/markdown; premium editorial layout (sinematik glass card içinde uzun form); EU/TR satışı için zorunlu. **Paddle/Stripe checkout için genelde gerekli** |
| **Privacy** | `#` | ❌ Ölü | ❌ | `/privacy/page.tsx` — GDPR/KVKK uyumu için zorunlu; Clerk + Paddle + R2 + Inngest data flow'unu açıkla; veri saklama süreleri |
| **Refund Policy** | `#` | ❌ Ölü | ❌ | `/refund/page.tsx` — dijital kitap için iade prosedürü; "buy once, yours to keep" sözünü güçlendir; satış sonrası güven |
| _(yok)_ — | — | — | — | **Öneri**: "Cookie Policy", "Acceptable Use" (DRM, paylaşım sınırları), "DMCA" (telif şikayet) eklenebilir |

### 5.5 Social İkonlar (Bottom Bar)

| Element | Şu anki | Öneri |
|---|---|---|
| Twitter / X | `href="#"` | Gerçek profil URL'i veya ikonu kaldır |
| Instagram | `href="#"` | Aynı |
| Facebook | `href="#"` | Aynı |
| _(yok)_ — | — | LinkedIn, YouTube, Substack (newsletter eko-sistemi varsa) eklenebilir |

### 5.6 Brand Sütunu

`"A first-party bookstore for digital books. Buy once, download, and read anywhere. Yours to keep — never locked."` — **iyi** copy, koru.

### 5.7 Dark Indicator Chip (Sağ Alt)

- Şu an pure visual; pill chrome'a sahip ama buton değil
- **Öneri**: Ya gerçek tema toggle yap (sinematik / warm switch), ya chip chrome'unu sadeleştir (afford confusion). Şu an "tıklanır gibi durup tıklanmıyor"

---

## 6. Tasarım Sistemi Tutarlılık Audit

### 6.1 Utility Class Kapsamı

Sinematik utility class'lar (`src/app/globals.css` içinde `.cinematic-root *`):

| Class | Kullanım yeri | Reuse seviyesi |
|---|---|---|
| `.home-glass` | Glassmorphism panel | **38 yer** — kanonik |
| `.home-card-hover` | Hover lift + glow | **17+ yer** — kanonik |
| `.home-cta-primary` | Emerald gradient pill | 11 yer |
| `.home-cta-secondary` | White-on-glass pill | 8 yer |
| `.catalog-diamond` | Diamond pulse ornament | 9 hero |
| `.catalog-dust` | Drifting dust particles | 7 hero |
| `.home-hero-book`, `.home-hero-pedestal`, `.home-hero-aura`, `.home-particle`, `.home-scroll-cue-glyph` | Home hero specific | 1-3 yer |
| `.catalog-range` | Price slider | 1 yer |
| `.cart-shelf-track` | Carousel scrollbar hide | 2 yer |
| `.cinematic-prose` | Markdown article typography | 1 yer (article-body) |

### 6.2 Design Token Kullanımı (Kritik)

`.cinematic-root` 12 CSS variable tanımlıyor (`--home-emerald`, `--home-text-hi` vb.). **Ama bileşenler bunları kullanmıyor.**

| Hex değer | Inline kullanım sayısı (components/ içinde) |
|---|---|
| `#33f0aa` (emerald-bright) | **~80 yer** |
| `#1ddf8f` (emerald) | ~40 yer |
| `#16c784` (emerald-deep) | ~30 yer |
| `#e6e6e0` (text-hi) | her bileşende |
| `#a7a7a0` (text-mid) | her bileşende |
| `#88918a` (text-muted) | her bileşende |
| `#5d675f` (text-fade) | onlarca yer |
| **TOPLAM** | **225 yerde inline hex** |

**Etki**: Bir rebrand veya accessibility (kontrast) güncelleme bugün 225 yerde search-and-replace gerektiriyor. Token sistemi var ama anti-pattern olarak Tailwind arbitrary values (`text-[#33f0aa]`) ile delik açılmış.

**Öneri**: Tailwind v4 `@theme` ile `--color-emerald-bright`, `--color-text-hi` vb. tanımla → `text-emerald-bright`, `text-fg-hi` gibi tüketilebilir class'lar oluştur. Mevcut inline hex'leri codemod'la migrate et.

### 6.3 Tekrarlanan Patternler (Utility'leştirilmeli)

| Pattern | Kaç yer | Öneri |
|---|---|---|
| Headline last-word emerald gradient (6 satırlık inline style: `linear-gradient(135deg, #33f0aa 0%, #1ddf8f 60%, #16c784 100%)` + `WebkitBackgroundClip: "text"`) | **10 hero** | `.home-headline-accent` utility |
| Hero panel frame shadow (`0 28px 60px -22px rgba(0,0,0,0.8), 0 0 0 1px rgba(51,240,170,0.05) inset, 0 0 36px -12px rgba(22,199,132,0.35)`) | **3 hero** (library, category, article) — alpha drift 0.32/0.35 | `.home-hero-frame` utility |
| Icon tile chrome (`bg-[#16c784]/10 border-[#16c784]/30 rounded-lg shadow-[0_0_10px_-2px_rgba(51,240,170,0.4)]`) | **6+ yer** (library-stats, why-readers, category-sidebar, category-stats, recommendation-card, genre-card) | `.home-icon-tile` utility |
| Pill hover (`hover:-translate-y-0.5 hover:border-[#33f0aa]/30 hover:bg-[#33f0aa]/8 hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.3)]`) | **3 yer** (category-discovery-panel, suggestion-pills, category-sidebar) | `.home-pill-hover` utility |
| Avatar gradient (`linear-gradient(135deg, #1ddf8f 0%, #0e7f54 100%)`) | **3 yer** (article-hero, author-newsletter-strip, category-article-card) | `.home-avatar-gradient` utility |
| 9 hero bileşeni (`*-hero.tsx`) | %85 benzer DNA: eyebrow + diamond + dust + headline + subtitle | **`<CinematicHero>` parametreli bileşen** — ~400 satır dedupe |

### 6.4 Typography Drift

**H1 hero başlıkları** — 6 farklı boyut skalası, aynı kavramsal rol için:

```
hero.tsx (homepage):    56/68/80/88     ← biggest
catalog/cart/blog/authors/search-hero:  52/64/72   ← canonical "X"
library/genres-hero:    48/58/64/72
category-hero:          44/56/62/68
article-hero:           40/56/64/72
```

5 hero `52/64/72` paylaşıyor, 4'ü kendi skalasında. Hero tipiyle korelasyon var (full vs panelli vs küçük), ama yine de drift.

**Eyebrow tracking**:
- `tracking-[0.3em]` — 15 yer (kanonik hero eyebrow)
- `tracking-[0.22em]` — 5 yer
- `tracking-[0.18em]` — 12 yer
- `tracking-[0.2em]` — 8 yer (**`0.18` + `0.22` ile overlap** — kazara drift)
- `tracking-[0.15em]`, `tracking-[0.12em]` — küçük labellar

**Öneri**: 3 seviye hierarchy: `tracking-[0.3em]` (hero), `tracking-[0.2em]` (section eyebrow), `tracking-[0.12em]` (caption). 0.22 ve 0.18'leri tekleştir.

### 6.5 Border-Radius Drift

| Değer | Kullanım | Yorum |
|---|---|---|
| `rounded-[32px]` | 8 yer | Hero frame — tutarlı |
| `rounded-[28px]` | 4 yer | Wide horizontal card |
| `rounded-[24px]` | 7 yer | Side panel |
| `rounded-[22px]` | 6 yer | Library stats card |
| `rounded-[18px]` | 1+ yer | Category stats card |
| `rounded-3xl` (Tailwind native = 24px) | 17 yer | **`rounded-[24px]` ile fiziksel olarak aynı ama farklı yazılmış** — confusion |
| `rounded-2xl`, `rounded-xl` | onlarca | OK |

**Öneri**: 4 token belirle — `rounded-[18px]` (sm card), `rounded-[24px]` (md panel), `rounded-[28px]` (lg horizontal), `rounded-[32px]` (xl hero frame). Diğerlerini migrate et veya CSS var ile tanımla.

### 6.6 Glass Implementasyonları

- `.home-glass` — kanonik (38 yer)
- Ad-hoc `backdrop-blur` — 16 yer / 11 dosya — çoğunlukla kasti (sticky header, pill chrome, inner ring) ama 2 utility daha olsa daha net olur: `.home-glass-subtle` (inner ring için), `.home-pill` (badge için)

### 6.7 Hover State

- `.home-card-hover` — 18 yer, kanonik
- Ad-hoc `transition-all hover:-translate-y-…` — 3 pill yerinde — `.home-pill-hover` utility'leştirilmeli (yukarıda)

### 6.8 Animation Keyframes

| Keyframe | Kullanılıyor mu |
|---|---|
| `home-float`, `home-breathe`, `home-pedestal-pulse`, `home-particle-drift`, `home-scroll-pulse` | ✅ kullanılıyor |
| `catalog-diamond-pulse`, `catalog-dust-drift` | ✅ 9 + 7 yerde |
| **`home-fade-up`** | ❌ **Dead code** — global'de tanımlı ama hiçbir yer referans vermiyor. `[data-reveal]` inline `transition` kullanıyor. Sil. |

### 6.9 Responsive

- Tüm sinematik sayfalar `sm:`, `md:`, `lg:`, `xl:` breakpoint'leri kullanıyor — tutarlı
- 9 hero'da grid breakpoint farklılıkları var (`lg:grid-cols-[45%_1fr]` vs `lg:grid-cols-[5fr_4fr]` vs `lg:grid-cols-2`) — `<CinematicHero>` bileşeniyle standartlaştırılabilir

### 6.10 Component Reuse vs One-Off

| Reuse seviyesi | Bileşenler |
|---|---|
| **Çok yüksek** (3+ yer) | `RevealOnScroll`, `ArticleImage`, `CinematicHeader`, `HomeFooter`, `LibraryScene` (cinematic'te 2 yer), `RecommendationShelf` pattern (cart + library — neredeyse identical) |
| **Tekrar fırsatı** | `RecommendationShelf` cart + library aynı — bir parametreli bileşene indirgenebilir; `EmptyCardCenter` (empty-cart, empty-search benzer DNA) |
| **One-off ama OK** | `ReadingRoomScene`, `LibraryScene`, `CatalogScene`, `BlogScene` (her hero'nun kendi atmosferi olmalı — kasti) |

---

## 7. Önerilen Sonraki Adımlar

### Priority 1 — Kritik (kullanıcı güveni + production zorunluluk)

| # | İş | Kapsam | Tahmini Etki |
|---|---|---|---|
| 1.1 | **`/terms`, `/privacy`, `/refund` sayfalarını oluştur** | `src/app/(legal)/{terms,privacy,refund}/page.tsx` — sinematik shell + `cinematic-prose` long form; footer linklerini güncelle | Hukuki zorunluluk; Paddle/Stripe checkout için bazı bölgelerde mecbur |
| 1.2 | **Newsletter `/api/newsletter` endpoint'i** | Beehiiv/Resend entegrasyonu; 3 form da (home, article, category) aynı endpoint'i çağırsın; gerçek success/error state | Sahte başarı mesajı = kullanıcıya yalan; brand güveni |
| 1.3 | **`/books/[slug]` cinematic redesign** | Cinematic book detail (hero, sample viewer, reviews, related — hepsi dark) | En çok tıklanan sayfa; catalog → detail tema kırılması |
| 1.4 | **`/order/[id]` cinematic redesign** | Cinematic post-checkout sayfası; sinematik download butonu | Ödeyen müşterinin gördüğü ilk sayfa; "trust moment" |
| 1.5 | **`/authors/[slug]` cinematic redesign** | Cinematic author profile (portrait + bio + book grid) | `/authors` discovery → bu sayfa = tema kırılması |
| 1.6 | **`/genres/[slug]` route oluştur VEYA `/categories/[slug]` cinematic redesign** | `GenreCard` cinematic detaya gitsin; ya `/genres/[slug]` yeni route ya da mevcut `/categories/[slug]`'ı cinematic'e çevir | Genre discovery'nin sonu; tema kırılması |
| 1.7 | **Footer dead linkleri temizle** | Bestsellers/New Releases/Categories: ya farklı route ya etiket düzelt; Twitter/IG/FB: gerçek URL veya kaldır | Yanıltıcı UX |
| 1.8 | **`/about` sayfası oluştur veya header "About" linkini kaldır** | `src/app/about/page.tsx` — cinematic; veya nav'dan sil | Anchor hack = yarı bozuk UX |
| 1.9 | **Header sepet noktası state-driven yap** | `/api/cart/count` çağır; `cart-changed` event dinle; count > 0 ise göster | Daima yanan nokta = yalan UI |

### Priority 2 — Önemli (UX bütünlüğü + eksik fonksiyon)

| # | İş | Kapsam |
|---|---|---|
| 2.1 | **`/account/orders` cinematic redesign** | Cinematic order list (`OrderCard` glass + cinematic typography) |
| 2.2 | **`/categories` index sayfası** | Cinematic kategori grid; footer "Categories" linki buraya bağlansın |
| 2.3 | **Library filter/sort/view toggle'ı bağla** | `LibraryEntry` schema'sına `read_status` ekle; state'i `library/page.tsx`'e lift et; grid'i filtrele |
| 2.4 | **`/read/[bookId]` fallback sayfaları cinematic'leştir** | "Still preparing" + "Could not start" sayfaları sinematik shell'e |
| 2.5 | **Sign-in / Sign-up / Sign-out UX** | Clerk `<UserButton>` header'a ekle; auth state'i göster; sign-out affordance |
| 2.6 | **Catalog `?page=`, `?sort=`, `?filter=` URL sync** | `useSearchParams`/`router.replace` ile — back/forward + share-link |
| 2.7 | **`featured-books-section` + `categories-section` DB'den feed** | Hard-coded demo'yu gerçek `getFeaturedBooks` + `getAllCategories` ile değiştir |
| 2.8 | **Category sidebar "Popular topics" pills'leri bağla** | Frontmatter'a `tags`; pills'i `<Link>`'e veya filter callback'ine çevir |
| 2.9 | **Unprovisioned notice'i cinematic'leştir** | Auth/env gate panelini cinematic-shell ile yeniden yaz (şu an sinematik library içinde warm panel görünüyor) |

### Priority 3 — Polish / Nice-to-have

| # | İş | Kapsam |
|---|---|---|
| 3.1 | **`/account/settings` cinematic redesign** | Düşük trafik; brand bütünlüğü için |
| 3.2 | **`/admin` + `/admin/books/[slug]/edit` cinematic** | Internal-only ama brand bütünlüğü |
| 3.3 | **`/error.tsx` cinematic** | Hata sayfası; render hatasında görülüyor |
| 3.4 | **Design system refactor (CSS var migration)** | 225 inline hex → 4 yeni utility (`.home-headline-accent`, `.home-hero-frame`, `.home-icon-tile`, `.home-pill-hover`); Tailwind v4 `@theme` ile token consume |
| 3.5 | **`<CinematicHero>` parametreli bileşen** | 9 hero'yu tek bileşene indirge (~400 satır dedupe); 3 farklı H1 skalasını tek `size="xl\|lg\|md"` prop'una bağla |
| 3.6 | **`<RecommendationShelf>` cart + library tek bileşene** | İkisi neredeyse identical |
| 3.7 | **Dead keyframe sil** | `@keyframes home-fade-up` referanssız |
| 3.8 | **Orphan bileşen sil** | `src/components/blog-card.tsx` — tüketici yok |
| 3.9 | **CSS bug fixleri** | `library-empty-panel`, `authors-shell`, `empty-cart-card` arrow hover (`group` ekle); `cart-line.tsx` `data-pending` attribute ekle |
| 3.10 | **Hard-coded sahte sayıları kaldır veya gerçeklik kazandır** | Catalog `"50,231"`, popular searches `"12.4K"`, home stats card | 
| 3.11 | **Web Share API entegrasyonu (mobile)** | `article/share-panel.tsx` `navigator.share` fallback |
| 3.12 | **Border-radius standardizasyonu** | `rounded-3xl` ↔ `rounded-[24px]` kafa karıştırıcı; 4 token belirle |
| 3.13 | **Tracking hierarchy temizle** | `0.18`/`0.2`/`0.22` overlap; 3 seviye belirle |
| 3.14 | **Dark indicator chip karar** | Tema toggle olsun ya chrome'u sadeleştir |

---

## 8. Risk ve İzleme

### 8.1 Şu Anki Production Riskleri

1. **Yasal risk**: `/terms`, `/privacy`, `/refund` yok → KVKK/GDPR riski; Paddle'ın T&C zorunluluğu
2. **Brand risk**: Footer'da 6 ölü link → "abandoned site" izlenimi
3. **UX risk**: Newsletter'a abone olduğunu sanan kullanıcı = data toplanmıyor; "Subscribe" butonu = yalan
4. **Auth risk**: Sign-out olmaması → kullanıcı paylaşımlı bilgisayardan çıkamıyor
5. **Tema kırılma riski**: 4 P1 transition noktası ödeyen müşteri yolculuğunda → brand güveni

### 8.2 Test Edilmemiş Davranışlar

- Mobile responsive — kapsamlı QA yok
- Reduced-motion preference — keyframe'lere `@media (prefers-reduced-motion)` guard'ı eksik
- A11y — focus ring, aria-current, screen reader testi yapılmamış
- Empty state'ler: `/blog` 0 post, `/authors` 0 yazar — kontrol edilmedi

### 8.3 Test Edilmiş ve OK Davranışlar

- Sinematik header `body:has(.cinematic-root)` hack — Chromium 105+, Safari 15.4+, Firefox 121+ — modern tarayıcılarda çalışıyor
- Reading sidebar IntersectionObserver — leak yok, ResizeObserver fallback var
- Reader shell PDF kontrolleri — pages, zoom, keyboard, resume, debounced sync — hepsi gerçek
- Cart actions — addToCart, removeFromCart, clearCart, createCheckoutSession — server actions ile gerçek
- Build classification — son redesign sonrası `● SSG`, `○ Static`, `ƒ Dynamic` dağılımı korunmuş

---

## 9. Sonuç

**Sinematik sistem güzel ama yarım.**

- **Görsel kalite**: 10 sinematik sayfa premium, atmosferik, tutarlı bir dil konuşuyor.
- **Etkileşim derinliği**: Catalog, cart, search, blog filtreleri **gerçekten çalışıyor** — visual değil functional.
- **Boşluklar**: 10 warm sayfa, 3 sahte newsletter, 6 ölü footer linki, 1 ölü About anchor, 1 ölü authors CTA, 1 daima yanan sepet noktası, 1 tamamen no-op library filter bar.
- **Tasarım borcu**: 9 hero %85 kopya; 225 inline hex; 1 dead keyframe; 1 orphan bileşen.

P1 listesinin tamamı yapılırsa kullanıcı ilk **"warm"** sayfayı görmeden satın alma yolculuğunu tamamlayabilir. P2 listesi UX bütünlüğünü kapatır. P3 listesi tasarım sistemini sürdürülebilir hale getirir.

Sonraki sub-PR önerisi: **`/books/[slug]` cinematic redesign** (P1.3) — en çok tıklanan ve en görünür tema kırılma noktası.

---

_Bu rapor `/home/emre/Downloads/enterprise-web-site/TASARIM_AUDIT_RAPORU_TR.md` adresinde saklıdır. Polish/cleanup fazı için tek doğruluk kaynağıdır._
