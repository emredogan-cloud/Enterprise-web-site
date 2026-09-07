# Tasarım Düzeltme Yaması — Raporu (TR)

**Dal:** `fix/cinematic-design-correction-pass`
**Kapsam:** Cinematic UI hizalama + yönlendirme (routing) düzeltmeleri. Yeni tasarım değil; mevcut sistemi referans görsellere yaklaştıran, regresyon-güvenli düzeltme geçişi.
**Doğrulama (tümü temiz):** `npm run lint` (0 hata/0 uyarı) · `npx tsc --noEmit` (0) · `npm test` (35/35) · `npm run build` (başarılı, route sınıflandırmaları korundu) · çalışma-zamanı routing QA (dev sunucu + curl).

Her sayfanın sınıflandırması korundu: `/` ○ Static, `/books` ○ ISR, `/books/[slug]` ● SSG, `/authors/[slug]` ● SSG, `/categories/[slug]` ● SSG, `/account/*` ƒ Dynamic.

---

## Issue 1 — Anasayfa "yüzen kitaplar" eksik
- **Kök neden:** `hero-book.tsx` tek bir kitabı bir kaide (pedestal) üzerinde gösteriyor; arkadaki 3 öğe gerçek kitap değil, bulanık "kart"lardı. Uzay/atmosfer hissi yoktu.
- **Düzeltme:** Hero yeniden kurgulandı — **3 ayrı yüzen kitap** (büyük merkez + 2 yanda, farklı derinlik/ölçek/dönüş). Kozmik alan: emerald aura (nefes alan), bulanık "nebula şeridi" (cosmic shelf), yavaş **yörünge halkası + yörüngedeki ışık noktası**, yıldız alanı ve yükselen toz zerreleri. Kaide kaldırıldı; yerine kitapları "havada asılı" gösteren yumuşak emerald taban parıltısı kondu. Parallax için her kitap kendi hızında (`--bob-dur`) sallanır. Yeni keyframe'ler: `hero-bob` (saf dikey, dönüş dış sarmalda) ve `hero-orbit`. Tümü `prefers-reduced-motion` ile güvenli.
- **Doğrulama:** prerender HTML'de 3 başlık + 3 yazar (Forgotten Library/Ashford, Nightfall Atlas/Vesper, Quiet Hours/Solenne) ve `hero-bob`/`hero-orbit`/`home-hero-aura`/`home-particle` sınıfları mevcut.

## Issue 2 — Arka plan "yeşil duvar" gibi
- **Kök neden:** `.cinematic-root` taban rengi `#07110b` fazla açık/yeşildi → boşluk değil, boyalı yeşil panel hissi.
- **Düzeltme:** Taban `#050705`'e (derin siyah-yeşil "emerald void") düşürüldü; radyal emerald parıltılar yumuşatılıp ofsetlendi (vakum/derinlik hissi). Kartlar (`--home-bg-card`) artık zeminden net bir adım yukarıda. **Kontrast regresyonu yok** (açık metin daha koyu zeminde → daha yüksek kontrast). Tüm cinematic sayfalar (ortak taban olduğu için) bundan faydalanır.
- **Doğrulama:** Build temiz; metin/kart kontrastı korunuyor.

## Issue 3 — `/books` düzeni sıkışık
- **Kök neden:** `max-w-7xl` + `xl:grid-cols-5` + sabit (sticky olmayan) filtre + fazla hero üst boşluğu (`pt-28`).
- **Düzeltme:** Konteyner `max-w-[1440px]`'e genişletildi; grid daha büyük kartlar için `lg:3 / xl:4` sütun + `gap-6`; sayfa başına `PAGE_SIZE 12` (4×3); filtre paneli **sticky** (`lg:sticky lg:top-24 lg:self-start`); hero üst/alt boşluğu kısaldı (`pt-12 sm:pt-16`). Suspense fallback'i de aynı konteyner ölçüsüne hizalandı (layout shift yok). Responsive + filtre davranışı korundu.
- **Doğrulama:** prerender'da `max-w-[1440px]` mevcut; dev SSR'de 12 ürün kartı render ediliyor.

## Issue 4 — `/books` kart tıklaması / ürün detayı
- **Kök neden:** İKİ sorun: (a) `CatalogBookCard`'da hiç bağlantı yoktu (kart tıklanamıyordu); (b) `/books/[slug]` yalnızca gerçek DB kaydını çözüyor, demo başlıklar `notFound()` → 404.
- **Düzeltme:** (a) Karta, tüm kartı tıklanabilir yapan bir **overlay `<Link href="/books/[slug]">`** eklendi (wishlist butonu geçerli HTML için daha yüksek z-index'te ayrı tutuldu). (b) `/books/[slug]` DB boş/eşleşmiyorsa **demo kataloğa fallback** yapar: `BookHero` `preview` modunda (yazar düz metin, sahte sepet yerine "Browse the catalog" CTA) + örnek bölüm + kapanış. Gerçekten bilinmeyen slug yine 404.
- **Doğrulama:** `/books/the-midnight-library` → 200 (başlık/yazar/"Preview listing"/"Browse the catalog"); `/books/this-slug-does-not-exist` → 404 (doğru).

## Issue 5 — `/authors` yönlendirmesi 404
- **Kök neden:** `/authors/[slug]` yalnızca DB yazarını çözüyor; demo yazarlar → `notFound()` → 404.
- **Düzeltme:** DB eşleşmezse **demo yazar roster'ına fallback** (kendi portre temasıyla). İsim, `role` + `works`'ten türetilen biyografi, boş yayın listesi ve demo'nun `portrait` teması kullanılır. Bilinmeyen slug yine 404.
- **Doğrulama:** `/authors/jane-austen` → 200 ("Jane Austen", "Novelist", "Pride & Prejudice", boş-yayın durumu).

## Issue 6 — `/genres` kategori yönlendirmesi 404
- **Kök neden:** `/genres` kartları `/categories/[slug]`'e gidiyor; demo tür slug'ları DB'de yok → `notFound()` → 404.
- **Düzeltme:** `/categories/[slug]` DB eşleşmezse slug'ı **demo tür/kategori setlerinden** çözer (`resolveDemoCategoryName`) ve sayfayı zaten var olan **sinematik boş-durum** ("No published titles in this genre yet") ile render eder. Bilinmeyen slug yine 404.
- **Doğrulama:** `/categories/fantasy`, `/categories/science-fiction` → 200 (tür adı + boş durum).

## Issue 7 — `/settings` profil alanı / avatar / "Edit profile"
- **Kök neden:** `profile-identity-card.tsx`'te "Edit profile" CTA'sı sabit `href="/account/library"`'ye gidiyordu (yanlış); avatar yalnızca statik degrade harf, yükleme yok.
- **Düzeltme (ADR-8: profil yönetimi Clerk'in sorumluluğu):** Yeni `profile-actions.tsx` istemci adası eklendi. Avatar ve "Edit profile" artık Clerk'in barındırılan **`UserProfile` modal'ını** (`openUserProfile()`) açar — fotoğraf yükleme + isim/e-posta yönetimi buradadır. Avatar gerçek Clerk fotoğrafını gösterir (varsa; CSS background ile, `next/image` remote-pattern gerektirmeden), üzerine gelince "fotoğrafı değiştir" (kamera) katmanı çıkar; yoksa marka degrade harfi. Clerk yapılandırılmamışsa (yerel dev) hook çağrılmadan güvenli fallback (devre dışı buton) — cinematic-header'daki yerleşik kalıbın aynısı. Yanlış `/account/library` bağlantısı tamamen kaldırıldı.
- **Doğrulama:** Build/lint/tsc temiz. Çalışma-zamanı görsel doğrulama Clerk oturumu gerektirir (aşağıdaki Riskler).

---

## Kalan Riskler / Notlar
- **Görsel piksel doğrulaması:** Bu ortamda başsız (headless) tarayıcı yok; doğrulama prerender HTML denetimi + dev-sunucu `curl` (HTTP durum + içerik) ile yapıldı. Anasayfa hero kümesinin, emerald-void zemininin ve hover hareketlerinin göz kontrolü için `npm run dev` ile bakılması önerilir.
- **Issue 7 oturum-bağımlı:** `/settings` kimlik-doğrulama kapılı; avatar/edit akışı yalnızca gerçek Clerk oturumunda görünür. Kod yolu doğru ve mevcut Clerk kalıbıyla aynı, ama canlı modal yalnızca girişli kullanıcıda görülebilir.
- **Demo fallback'ler kasıtlı:** Yalnızca DB boş/eşleşmediğinde devreye girer (üretimde gerçek kayıtlar önceliklidir). Demo kitap detayında satın alma kapalıdır ("Preview listing") — sahte kitap için FK hatası önlenir.
- **Sahte veri yok:** Demo yazar biyografisi gerçek `role`/`works`'ten türetilir; demo kitap detayında uydurma ISBN/sayfa sayısı yoktur.
- **`prompt.txt`** commit'e dâhil edilmedi.
