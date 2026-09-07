# Ingestion Pipeline Patch Raporu — Blocker #1 (Yazar/Koleksiyon İlişkilendirme)

> **Kapsam:** Yalnızca admin tarafı ingestion akışı. Halka açık (public) cinematic
> UI'a, katalog tasarımına dokunulmadı; hiçbir kitap ingest edilmedi; demo içerik
> üretilmedi. UI freeze korundu.
>
> **Tarih:** 2026-05-31 · **Dal:** `feat/visual-asset-inventory-pipeline`

---

## 1. Kök Neden (Root Cause)

Catalog Ingestion Phase 0 denetiminde tespit edilen **Blocker #1**: admin
ingestion akışı (`createBook`) yalnızca `books` tablosuna satır yazıyordu.
Many-to-many junction tabloları **hiçbir zaman doldurulmuyordu**:

- `book_authors` (bookId, authorId, position) → boş kalıyordu.
- `book_categories` (bookId, categoryId) → boş kalıyordu.

Sonuç: bir kitap "yaratılsa" bile **yazarsız ve koleksiyonsuz** bir kayıt
oluyordu. Bu da şu public yüzeyleri kırıyordu:

- `/authors/[slug]` — yazarın kitapları junction üzerinden çözüldüğü için kitap
  görünmüyordu.
- `/categories/[slug]` — koleksiyon/kategori sayfaları boş kalıyordu.
- Kitap detay sayfasında yazar atfı eksik kalıyordu.

Ek olarak, "Builder's Library" strateji koleksiyonları (PD Spine, Builder Core,
Deep Thinking, Speculative Shelf) için **kanonik kategori satırları yoktu** — yani
admin'in işaretleyebileceği bir hedef bile mevcut değildi.

**Önemli mimari karar:** Şema yeterliydi (junction tablolar + ilişkiler zaten
tanımlıydı). Eksik olan yalnızca **yazma yolu (write path)** ve **admin UX**'ti.
Bu yüzden **şema değişikliği / migration gerekmedi** — bu, drizzle journal'ını
elle düzenlemenin kırılganlığından da kaçınmamızı sağladı.

---

## 2. Uygulama (Implementation)

### 2.1 Atomik ilişkisel yazma — `src/app/admin/actions.ts`

Neon serverless sürücüsü (`drizzle-orm/neon-serverless` + WebSocket `Pool`)
**gerçek `db.transaction` desteği** sunuyor. Tüm ilişkisel yazmalar tek bir
transaction içinde yapıldı; herhangi bir adım başarısız olursa **tamamı geri
alınır** — yani asla yarım/yazarsız bir durum oluşmaz.

Yeni/değişen parçalar:

- **`slugify(input)`** — görünen adı slug'a çevirir (NFKD normalize → diakritik
  temizliği → küçük harf → tireleme → ≤200 char, `authors.slug`/`categories.slug`
  varchar sınırına uyumlu).
- **`syncBookRelations(tx, bookId, authorNames, categoryIds)`** — bir kitabın M:N
  ilişkilerini **replace semantiği** (önce sil, sonra ekle) ile `tx` içinde
  senkronlar:
  - **Yazarlar:** slug bazında *find-or-create* (`onConflictDoNothing({ target:
    authors.slug })`), girilen sıra `position` olarak korunur. Aynı isim/slug
    tekrarları ayıklanır.
  - **Kategoriler:** verilen id'ler mevcut satırlara karşı doğrulanır; bilinmeyen
    id'ler düşürülür (admin yalnızca gerçek checkbox seçebildiği için bu
    belt-and-suspenders korumadır).
- **`ensureCoreCollections()`** — 4 kanonik koleksiyonu *idempotent* olarak ekler
  (`onConflictDoNothing({ target: categories.slug })`). Tekrar tekrar çalıştırmak
  güvenli; var olan satırlara dokunulmaz, asla duplikat oluşmaz. Migration yerine
  admin butonuyla tetiklenir.
- **`createBook`** — kitap `INSERT ... RETURNING id` + `syncBookRelations` tek
  `db.transaction` bloğuna alındı.
- **`updateBook`** — `UPDATE books` + `syncBookRelations` tek `db.transaction`
  bloğuna alındı. `publishedAt` geçiş mantığı korundu.
- Form parsing genişletildi: `authorNames` (virgülle ayrılmış string → trim'li
  dizi), `categoryIds` (`formData.getAll("categoryIds")`).

### 2.2 Admin sorguları — `src/lib/db/queries/admin.ts`

- **`CORE_COLLECTIONS`** sabiti (slug + name): PD Spine, Builder Core, Deep
  Thinking, Speculative Shelf.
- **`AdminCategory`** arayüzü (`{ id, slug, name }`).
- **`listCategoriesForAdmin()`** — isme göre sıralı tüm kategoriler; checkbox'ları
  besler. `requireAdmin` + `safeQuery` disipliniyle.
- **`getBookForEdit`** genişletildi: `with: { bookAuthors (position asc, author.name),
  bookCategories (category.id) }`; dönüşte `authorNames` (virgül-join) ve
  `categoryIds` (dizi) üretilir — edit formunu önceden doldurmak için.

### 2.3 Admin UI — geriye uyumlu, yalnızca admin

- **`src/app/admin/page.tsx`** (create formu):
  - "Authors" metin alanı (`name="authorNames"`, virgülle ayrılmış).
  - "Collections / categories" checkbox grubu (`name="categoryIds"`,
    `allCategories`'ten). Boş durum mesajı mevcut.
  - "Ensure core collections" butonu (ayrı `<form action={ensureCoreCollections}>`
    — iç içe form geçersiz HTML olacağından header'a yerleştirildi).
- **`src/components/admin-edit-book-form.tsx`** (edit formu):
  - "Authors" alanı `defaultValue={book.authorNames}` ile önceden dolu.
  - Kategori checkbox'ları `defaultChecked={book.categoryIds.includes(c.id)}` ile
    mevcut ilişkilere göre işaretli.
- **`src/app/admin/books/[slug]/edit/page.tsx`**: `getBookForEdit` +
  `listCategoriesForAdmin` paralel çekilip forma prop olarak geçildi.

---

## 3. Geriye Uyumluluk (Compatibility)

- **Şema değişmedi** → migration yok, mevcut veriye dokunulmadı.
- `createBook`/`updateBook` imzaları aynı `FormData`/`UpdateBookInput` akışını
  kullanır; yeni alanlar opsiyonel davranır (yazar/kategori girilmezse junction'lar
  boş bırakılır, eski davranışla aynı — fakat artık **kasıtlı** ve düzeltilebilir).
- Public katalog projeksiyonları ve cinematic UI **değiştirilmedi**.
- ISR invalidation (`/authors/[slug]`, `/categories/[slug]`, `/books`, sitemap)
  zaten mevcut `invalidateCatalogPaths` ile tetikleniyor — ilişkiler değişince
  ilgili sayfalar tazeleniyor.

---

## 4. Doğrulama (Validation)

| Adım | Komut | Sonuç |
|------|-------|-------|
| Tip kontrolü | `npx tsc --noEmit` | ✅ temiz (0 hata) |
| Lint | `npm run lint` | ✅ temiz (slugify combining-char regex `no-misleading-character-class` uyarısı tetiklemedi) |
| Production build | `npm run build` | ✅ başarılı; `/admin` ve `/admin/books/[slug]/edit` doğru şekilde dinamik (ƒ) |

> Build sırasındaki "DB unavailable" mesajları beklenendir: build ortamında
> `DATABASE_URL` yok, `safeQuery` fallback'e düşüyor — bu, "katalog DB'siz de build
> alınabilir" disiplininin (ADR-1) çalıştığını gösterir.

**Atomiklik gerekçesi:** Tüm ilişkisel yazmalar `db.transaction` içinde; bir junction
insert'i patlarsa kitap satırı da geri alınır. Yarım/yazarsız kayıt imkânsız.

---

## 5. Kalan Riskler / Ertelenenler (Remaining Risks)

1. **Henüz kitap ingest edilmedi.** Bu patch yalnızca *boruyu* onarır. Gerçek
   katalog ingestion'ı (PD + premium başlıklar) ayrı, onaylı bir adımdır.
   Meditations dahil hiçbir başlık eklenmedi.
2. **`createBook` inline hata UI'sı yok.** Başarısızlık `logger.error` ile loglanıp
   yutulur (legacy davranış korundu). `updateBook` ise yapılandırılmış hata döndürür.
   İleride create formuna da inline hata gösterimi eklenebilir.
3. **Koleksiyon bootstrap manuel.** `ensureCoreCollections` admin butonuyla bir kez
   tetiklenmeli; otomatik seed (migration/seed script) bilinçli olarak ertelendi.
4. **Yazar zenginleştirme yok.** Yazarlar yalnızca `name`/`slug` ile *find-or-create*
   edilir; `bio` ve portre görseli (`/images/authors/{slug}.webp`) ayrı bir
   içerik/asset adımıdır (bkz. görsel envanter pipeline'ı).
5. **Kategori silme/yeniden adlandırma yolu yok.** Patch yalnızca ekleme/seçme
   sağlar; kategori yönetimi (rename/merge/delete) kapsam dışı.

---

## 6. Değişen Dosyalar

```
src/app/admin/actions.ts                 (+atomik tx, syncBookRelations, ensureCoreCollections, slugify)
src/lib/db/queries/admin.ts              (+CORE_COLLECTIONS, AdminCategory, listCategoriesForAdmin, getBookForEdit ilişkiler)
src/app/admin/page.tsx                   (create form: authors + kategoriler + bootstrap butonu)
src/components/admin-edit-book-form.tsx  (edit form: authors önceden dolu + kategori checkbox'ları)
src/app/admin/books/[slug]/edit/page.tsx (listCategoriesForAdmin prop threading)
```

Şema / migration değişikliği: **yok.**
