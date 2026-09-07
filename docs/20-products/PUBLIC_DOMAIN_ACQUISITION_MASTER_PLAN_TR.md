# Kamu Malı (Public Domain) Edinme Ana Planı — Valice Press

**Tarih:** 2 Eylül 2026 · **Faz:** Master Roadmap, Faz 5 / 5A / 5B / 5C / 6 / 22
**Bağlı belgeler:** `VALICE_PRESS_MASTER_ROADMAP_TR.md` · `PUBLIC_DOMAIN_BATCH_1_PLAN.md` (AKTİF; Batch 1 kapsamı değişmedi) · `BOOK_ACQUISITION_LEGAL_REPORT_TR.md` · `MEDITATIONS_EDITION_SOURCE_REPORT_TR.md` · `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` (bu planın makine-okunur aday havuzu, 94 satır)

Kanıt etiketleri: **[V]** birincil kaynaktan doğrulandı · **[O]** canlı sistemde gözlendi · **[A]** varsayım · **[R]** öneri · **[S]** senaryo. Doğrulanamayan her şey **DOĞRULANMADI** diye işaretlidir; tahmin yazılmamıştır.

> **Hukuki uyarı.** Bu belge hukuki görüş değildir. Her başlık, üretime girmeden önce Faz 22'deki haklar defterine (rights ledger) kaydedilir ve Founder tarafından imzalanır. Belirsiz kalan tek bir çeviri hakkı bile, `BOOK_ACQUISITION_LEGAL_REPORT_TR.md`'nin dediği gibi, tek kişilik bir yayıncı için "projenin sonu" olabilir.

---

## 0. Tek sayfada karar

1. **Kamu malı Valice için ikinci motor, birinci değil.** KDP, ağırlıklı kamu malı içeriği %35 telif dilimine kilitler [V]; Valice'in kendi mağazası aynı $9.99 edisyonda **$8.99** bırakır ($3.50 yerine, +%157) [V, CATALOG_ECONOMICS_FINAL]. Bu yüzden her PD edisyonu **önce doğrudan (direct-first)**, Amazon'a yalnızca keşif için ve yalnızca KDP farklılaştırma eşiğini geçtiğinde gider.
2. **"Eski" ≠ "kamu malı".** Metin, çeviri, illüstrasyon, editoryal aparat ve dizgi ayrı ayrı hak taşır. Haklar kapısı (§2) her katmanı ayrı ayrı sorar; GREEN olmayan hiçbir aday üretime girmez.
3. **Bir keşif motoru kurulur, tek seferlik bir liste değil.** Project Gutenberg ve Internet Archive shell'den sorgulanabilir (bu oturumda doğrulandı [O]); §3'teki dört küçük script adayları bulur, puanlar ve haklar defterine yazar. 94 satırlık aday havuzu (CSV) bu motorun ilk çıktısıdır.
4. **Batch sırası değişmedi:** Batch 1 = Dudeney · Kwaidan · Falkener (AKTİF plan). Batch 2 = Werner · Epictetus · Seneca. Batch 3 = Loyd · Topsell · Budge/Petrie. Culin **en son**, kültürel danışma yapılmadan başlamaz.
5. **Minimum farklılaştırma standardı** (§5) her PD edisyonu için zorunludur; Meditations bugün bu standardın **altındadır** ve Kitap 18 olarak yükseltilir.

---

## 1. Kaynak havuzları

| Kaynak | İçerik türü | Ticari kullanım koşulu | API / erişim | OCR / metin kalitesi | Metadata | Otomasyon kısıtı | Risk |
|---|---|---|---|---|---|---|---|
| **Project Gutenberg** | ~75.000 temiz metin (TXT/HTML/EPUB), çoğu gönüllü okunmuş (Distributed Proofreaders) | Metin PD, **satılabilir**. "Project Gutenberg" **markası** ticari kullanımda telif ister; başlık/lisans/marka kalıpları çıkarılırsa metin serbesttir [V, gutenberg.org/policy/permission] | `gutenberg.org/ebooks/search/?query=` HTML araması shell'den çalışıyor [O]; Gutendex API bu ortamdan boş döndü [O] → HTML parse | En yüksek (insan düzeltmeli); nadir OCR kalıntısı | Yazar, çevirmen (bazen eksik), yıl, LoC konu | 1 istek/sn nezaket sınırı [R]; toplu indirme için `gutenberg.org/policy/robot_access` [A] | Çevirmen adı/yılı bazen eksik → haklar defterine elle yazılır. "Herkeste bedava" → farklılaştırma şart |
| **Standard Ebooks** | ~1.000 PG metninin profesyonel dizgili EPUB'ı | **CC0** — dosyanın tamamı kamuya adanmış; ticari yeniden dağıtım serbest [V, standardebooks.org/about]. Kapaklar "ABD'de PD olduğuna inanılan" sanat eserleri [V] → **her kapak tek tek doğrulanır**; Valice zaten özgün kapak kullanır | OPDS akışı + GitHub repo'ları [A] | En yüksek (edisyonel düzeltme, modern imla) | Zengin (kaynak PG no, çevirmen, yıl) | Yok | Marka/logo kullanımı: DOĞRULANMADI → SE adını veya logosunu kullanma; yalnızca metin |
| **Internet Archive** | Taranmış kitaplar (PDF/DjVu), `_djvu.txt`, `_hocr.html`, `_chocr.html.gz` OCR katmanları | IA hak **garantisi vermez**; "kullanıcı kendi riskine ve hukuka uygun" kullanır [V, help.archive.org/help/rights]; çoğu öğe NC/atıf şartlı olabilir [V] → **öğe bazında** `possible-copyright-status: NOT_IN_COPYRIGHT` ve yayın yılı kontrolü | `archive.org/advancedsearch.php?...&output=json` ve `archive.org/metadata/<id>` shell'den çalışıyor [O] | `ocr` alanı motoru söyler: `tesseract 5.x` (yeni, iyi) vs `ABBYY FineReader 8–11` (eski) [O]; 19. yy antikua baskıda arama-kalitesi metin; Fraktur/erken modern imla için yeniden OCR | İyi (yıl, yayıncı, dijitalleştiren kütüphane) | Nezaket: 1 istek/sn [R]; toplu indirme için `ia` CLI [A] | Aynı eserin 1960'lı **telifli yeniden baskıları** da listede (örn. Falkener 1961) → yılı okumadan indirme |
| **HathiTrust** | 17M+ cilt; "Full view" PD ciltler | Tam görünüm indirme, **Google-digitized** ciltlerde kısıtlıdır (üye kurum gerekebilir) — bu oturumda DOĞRULANMADI (site Cloudflare challenge'a takıldı [O]) | Bibliographic API, Data API (anahtar gerekir) — DOĞRULANMADI | IA ile benzer | En iyi bibliyografik metadata | Erişim anahtarı | Google-digitized nüshalarda "ticari kullanmayın" ricası [A] → önce IA'daki aynı nüshayı ara |
| **Library of Congress** | Nadir kitaplar, haritalar, görseller; `loc.gov/...?fo=json` JSON API | Çoğu öğe "no known restrictions"; öğe bazında rights statement okunur — DOĞRULANMADI | JSON API (anahtar gerekmez) — DOĞRULANMADI | Değişken | Çok iyi | Rate limit [A] | Görsel kaynağı olarak değerli (haritalar, gravürler) |
| **Google Books** | PD tam görünüm PDF'leri | İndirilen PDF'lerde Google'ın **"ticari kullanmayın / filigranı koruyun" kullanım ricası** vardır — DOĞRULANMADI (metin bu oturumda alınamadı) → **kaynak olarak kullanma**; aynı tarama çoğunlukla IA'da (`bub_gb_…`, `…goog` öğeleri) | Books API (metadata) | IA ile aynı | İyi | — | Kullanım ricası ihlali riski; IA nüshasını tercih et |
| **Wikisource** | Transkribe edilmiş metinler, bazıları doğrulanmış | PD metin; site katkıları CC BY-SA olabilir (**editoryal notlar/dipnotlar BY-SA** → kullanma, yalnızca kaynak metin) [A] | MediaWiki API | Değişken (doğrulama rozeti var) | Orta | — | Katkıcı notlarını metinden ayır |
| **Distributed Proofreaders** | PG'ye giden okuma projeleri | PG ile aynı | — | En yüksek | — | — | Yeni tamamlanan projeler = rakiplerin henüz görmediği metinler [R] |
| **Wellcome Collection** | Tıp/doğa tarihi nadir kitapları (Topsell 1658: `b10180023`, Tesseract 5.3 OCR [O]) | Görseller genellikle **CC BY 4.0** (atıf zorunlu) — [A, öğe bazında doğrula] | IIIF + Catalogue API [A] | Yeni Tesseract taramaları | İyi | — | Atıf satırı zorunlu; CC BY görseli kapakta kullanma (özgün kapak ilkesi) |
| **Met Museum / Rijksmuseum / Smithsonian Open Access** | Yüksek çözünürlüklü sanat/gravür görselleri | **CC0** (ticari dahil serbest) — [A, genel bilgi; her öğe "Open Access/CC0" rozetiyle doğrulanır] | Met Collection API, Rijks API, Smithsonian API [A] | — | Çok iyi | Rate limit | Görsel kaynağı; PD görsel **KDP farklılaştırması SAYILMAZ** [V] → yalnızca bağlam görseli/iç süsleme, "10 özgün illüstrasyon" değil |

**Kural [R]:** Bir başlık için kaynak sırası **Standard Ebooks (varsa) → Project Gutenberg → Internet Archive `NOT_IN_COPYRIGHT` + yıl ≤ 1930 → Wellcome/LoC (görsel) → HathiTrust (yalnızca başka yerde yoksa) → Google Books (asla)**.

---

## 2. Haklar kapısı (Gate 2) — GREEN / YELLOW / RED

Her aday **beş katmanda** ayrı ayrı değerlendirilir: (1) eser metni, (2) çeviri, (3) illüstrasyon/plaka, (4) editoryal aparat (giriş, notlar, indeks), (5) baskı/dizgi. Bir katmanın GREEN olması diğerini GREEN yapmaz.

### 2.1 Kurallar ve Valice kontrol adımı

| # | Kural | Kanıt | Valice kontrol adımı | Haklar defterine yazılan |
|---|---|---|---|---|
| R1 | **ABD:** 1 Ocak 2026 itibarıyla **1931 öncesi** ABD'de yayımlanan eserler PD [V, Cornell/Hirtle] | copyright.cornell.edu/publicdomain | Yayın yılı < 1931 mi? Değilse R2 | `us_publication_year`, `us_status` |
| R2 | **ABD 1931–1963:** Bildirimle yayımlanıp **yenilenmediyse** PD; yenilendiyse 95 yıl [V] | Hirtle; Stanford Copyright Renewal DB [A, bu oturumda taranmadı] | Stanford yenileme veritabanında ara; sonuç yoksa YELLOW | `renewal_check_url`, `renewal_found` |
| R3 | **ABD 1964–1977:** 95 yıl [V] → RED (en erken 2060) | Hirtle | Otomatik RED | — |
| R4 | **Hayat+70** (AB, UK, TR — FSEK m.27) [V, LEGAL raporu] | WIPO Lex 5846 | Yazarın **ve** çevirmenin ölüm yılı ≤ 1955 mi? (2026'da) | `author_death`, `translator_death`, `eu_status` |
| R5 | **Çeviri ayrı eserdir** [V] | LEGAL raporu §1-G; Meditations raporu | Çevirmen adı + yılı + ölüm yılı bulunmadan başlık YELLOW'da kalır | `translator`, `translation_year`, `translator_death` |
| R6 | **İllüstrasyon/plaka ayrı eserdir** [V] | Kwaidan/Takénouchi örneği (Batch 1 planı) | Plaka sanatçısının ölüm yılı doğrulanmadıkça plakaları **kullanma**; özgün illüstrasyon üret | `plates_artist`, `plates_status` |
| R7 | **Editoryal aparat ayrıdır** (modern edisyonların girişleri, notları, indeksleri) [V] | LEGAL raporu | Yalnızca kaynak metni al; modern baskının notlarını **asla** | `apparatus_excluded: true` |
| R8 | **Tipografik düzen hakkı** — UK'de yayımlanmış edisyonun dizgisi 25 yıl korunur [A, UK CDPA s.15; ABD'de yok] | — | Yeni dizgi yapıldığı için sorun yok; taranmış sayfaları **olduğu gibi** basma | `retypeset: true` |
| R9 | **Marka/karakter istisnası** — metin PD olsa da bazı karakter/başlık adları marka olabilir [A] | (Sherlock Holmes/Pooh örnekleri, ikincil) | Kapak/başlıkta marka olabilecek adları kontrol et (USPTO TESS aramasi) | `trademark_check` |
| R10 | **URAA restorasyonu** — yabancı eserlerin ABD telifi 1996'da geri gelmiş olabilir (kaynak ülkede 1996'da telifliyse) [A] | 17 U.S.C. §104A | Yabancı yazar + ABD'de 1931 sonrası yayın → YELLOW; avukat | `uraa_flag` |
| R11 | **PG markası** — "Project Gutenberg" adı ve lisans metni çıkarılır [V] | gutenberg.org/policy/permission | Build scripti PG header/footer'ı siler; test eder (Meditations'ta yapıldı [O]) | `pg_header_stripped: true` |
| R12 | **IA öğe durumu** — `possible-copyright-status` + yıl + `licenseurl` [V] | archive.org rights | NC/BY-SA lisanslı öğeleri (kullanıcı yüklemeleri) kullanma | `ia_status`, `ia_licenseurl` |
| R13 | **Yerli/kutsal materyal** — hukuken PD olsa da **kültürel danışma** ön koşul [R] | Batch 1 planı (Culin) | Danışman onayı olmadan Gate 2 kapalı | `cultural_consultation` |

### 2.2 Renk tanımları

- **GREEN:** R1 (veya R2 yenilenmemiş) ✓ **ve** R4 ✓ (yazar + çevirmen ölüm ≤ 1955) **ve** kullanılacak her plaka/aparat ayrı ayrı ✓. Üretime girebilir.
- **YELLOW:** ABD'de PD ama hayat+70 ülkelerinde belirsiz/telifli (örn. Brodeur'un Prose Edda'sı 2042'ye kadar [A]; Lorimer'in Persian Tales'i 2033 [A]); ya da çevirmen/sanatçı ölüm yılı DOĞRULANMADI; ya da 1931–1963 yenileme taraması yapılmadı. Ek inceleme veya GREEN alternatif (Anderson yerine Brodeur değil, Brodeur yerine Anderson) gerekir.
- **RED:** Herhangi bir katman telifli (modern çeviri — Hays'in Meditations'ı; Coxeter'in Rouse Ball baskıları; T. H. White'ın Bestiary'si; Bell'in Board and Table Games'i; Ryder dışı Panchatantra çevirileri) → kullanılmaz.

### 2.3 Haklar defteri (rights ledger) — kayıt şeması

Her kitap projesinin `project_config.json` içine `rights` bloğu ve kökte `RIGHTS.md`:

```
rights:
  work:         { title, author, author_death, first_publication_year, country }
  edition:      { source_edition, publisher, year, why_this_edition }
  translation:  { translator, translation_year, translator_death, jurisdiction_checks: {us, eu_uk, tr} }
  plates:       { artist, artist_death, used: false|true, replacement: "original illustrations" }
  apparatus:    { modern_apparatus_excluded: true }
  sources:      [ { kind: pg|ia|se|wellcome|loc, id, url, status_field, fetched_at, sha256 } ]
  trademark_check: { done, result, url }
  uraa_flag:    false|true
  cultural_consultation: n/a | required | done(by, date)
  decision:     GREEN|YELLOW|RED
  approver:     "Founder"   date: YYYY-MM-DD   evidence_urls: [...]
```

`scripts/pd/rights-ledger.mjs` bu bloğu doğrular: **GREEN kararı olmadan `.gate` `phase2`'yi geçemez**; `valice-catalog.test.ts`'e "PD başlıkların `rights.decision === 'GREEN'` olması" testi eklenir [R].

---

## 3. Keşif motoru (Discovery Engine)

### 3.1 Bileşenler — `scripts/pd/` (hepsi dry-run varsayılan, tek amaçlı, bağımlılıksız)

| Script | Girdi | Çıktı | Not |
|---|---|---|---|
| `discover-gutenberg.mjs --query "…"` | Arama terimi / yazar / konu | `pg_id`, başlık, yazar, (varsa) çevirmen, dil, yıl | PG arama HTML'ini parse eder (bu oturumda 68 sorgu başarıyla çalıştı [O]); 1 sn/istek; `--top100` ile `gutenberg.org/browse/scores/top` indirme listesini talep vekili olarak çeker |
| `discover-ia.mjs --query "title:(…) AND creator:(…)"` | Lucene sorgusu | `identifier`, `title`, `year`, `possible-copyright-status`, `ocr`, `licenseurl` | `advancedsearch.php` JSON [O]; `--metadata <id>` ile dosya listesini (`_djvu.txt`, `_hocr.html`) getirir |
| `score-candidates.mjs --in candidates.csv` | CSV (bu belgenin şeması) | Puan + sıralama | Ağırlıklar §3.2; `--weights` ile değiştirilebilir; determinist |
| `rights-ledger.mjs --project <path> [--check]` | `project_config.json` | GREEN/YELLOW/RED + eksik alan listesi | Gate 2 doğrulayıcı; CI'da `--check` |
| `fetch-text.mjs --pg 27635 | --ia <id>` | Kimlik | `01_SOURCE/raw/…txt` + sha256 + kaynak notu | PG header/footer'ı siler ve sildiğini test eder (R11) |

Bu scriptler mevcut `scripts/catalog/*` ile aynı disiplindedir: küçük, birleştirilebilir, dry-run, üretime dokunmaz [USER_PROFILE].

### 3.2 Puanlama şeması (0–100)

| Ölçüt | Ağırlık | 5 puan ne demek |
|---|---:|---|
| Haklar (GREEN 5 / YELLOW 3 / RED 0) | 0.15 | Beş katman GREEN |
| Ticari değer | 0.15 | Kanıtlanmış talep (PG top-100, Amazon'da satılan modern edisyonlar, Dover/Wordsworth kataloğunda var) |
| Katalog uyumu | 0.15 | Mevcut bir Valice serisine doğrudan bağlanır (Codex, Great Book, Classics, Script) |
| Görsel potansiyel | 0.08 | Diyagram/plaka/harita gerektirir → "10 özgün illüstrasyon" eşiğini doğal olarak geçer |
| Farklılaştırma | 0.12 | Valice'in ekleyebileceği aparat gerçek bir okur sorununu çözer (çözüm yeniden yazımı, kural modernizasyonu, saha rehberi) |
| Üretim zorluğu (ters) | 0.08 | ≤ 100 saat |
| Doğrudan satış ekonomisi | 0.10 | Direct $9.99+ mantıklı; PDF/EPUB formunda değer kazanan aparat (yazdırılabilir şablon, arama) |
| Amazon ekonomisi | 0.05 | %35 tavanına rağmen keşif değeri; baskı edisyonu mantıklı |
| SEO | 0.07 | "hangi çeviri / nasıl oynanır / kim kimdir" sorgu alanı var |
| Bundle | 0.05 | ≥ 2 mevcut/planlı başlıkla koherent paket kurar |

`score = Σ(ağırlık × puan) × 20`. CSV'de hesaplanmış hâli var; ilk on: Werner (Çin mitleri) · Kwaidan · Dudeney ×2 · Falkener · Topsell · Loyd · Gould (Mythical Monsters) · Korean Games (Culin) · Korean Folk Tales (Gale). **Sıralama bir bulgu değil, doğrulanacak bir hipotezdir** [A]: talep ölçümü (Amazon top-20 BSR örneklemesi, PG indirme sayıları) Gate 1'de yapılır.

### 3.3 Talep vekilleri [R]

- **PG top-100 indirmeleri** (`gutenberg.org/browse/scores/top`): aylık indirme sayısı, "bedava hâlini bile arayan var mı" sorusunun cevabıdır. Meditations, Enchiridion, Grimm, Aesop, Bulfinch her yıl listede [A — bu oturumda liste çekilmedi; `discover-gutenberg.mjs --top100` ile ölçülür].
- **Amazon top-20 BSR örneklemesi** (aynı saatte, 3 gün): rakip edisyon sayısı, fiyat bandı ve yorum sayısı → "modern annotated edisyon satıyor mu?" (Dover/Penguin/Wordsworth varlığı = talep var; yalnızca $0.99 KDP klonları = ölü köşe).
- **Google Search Console** (mülk doğrulandıktan sonra): "best translation of X", "how to play Y", "Z myth explained" sorguları → T2 karşılaştırma içeriği + edisyon.

### 3.4 OCR / metin edinme (OCR araştırma raporundan, 2026-09-01 [V])

1. **Önce IA'nın `_djvu.txt` dosyasına bak** — bedava, anında; `ocr` alanı `tesseract 5.x` ise arama-kalitesi metin hazırdır. ABBYY 8–9 çıktıları (Topsell `historyoffourfoo00tops`, Loyd) yeniden OCR ister.
2. **Antikua (roman) baskı** → Tesseract 5.5.3, ≥ 400 DPI, Sauvola binarizasyon + deskew, `--oem 1 --psm 4`, hOCR çıktısı; arkaik imla için `load_system_dawg=0` [V].
3. **Fraktur/erken modern** → Kraken 7.1 + dönem modeli (Reul 2018: Calamari ABBYY'ye göre %70+ daha az hata [V]); Topsell 1658 buraya girer.
4. **Acele/karışık tarama** → Google Document AI $1.50 / 1.000 sayfa (300 sayfa ≈ $0.45) [V].
5. **Yayın kalitesi metin** → Tesseract ⊕ VLM diff, yalnızca uyuşmayan satırlar insana; VLM'yi **asla tek başına** kullanma (sessiz uydurma riski) [V/R].
6. Transkribus baskı için pahalı (~€71/300 sayfa) → kullanma [V].
7. Her metin `01_SOURCE/raw/` altında sha256 ile saklanır; düzeltilmiş metin `02_MANUSCRIPT/`; diff raporu `06_REPORTS/ocr-diff.md`.

---

## 4. Aday havuzu — seri bazında

Tam liste ve puanlar: `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` (94 satır: 85 GREEN · 9 YELLOW · 0 RED aday olarak listelendi — RED örnekler §2.2'de; 42 satır kanalı "future", 46 satır "both", 6 satır "web-only"). Aşağıda seri bazında **karar verilmiş** kısım.

### 4.1 Batch 1 — AKTİF plan, değişmedi (kimlikler yeniden doğrulandı 2026-09-02 [O])

| Aday | Kimlik | Haklar | Kanal | Karar |
|---|---|---|---|---|
| Dudeney — *Canterbury Puzzles* (1907) + *Amusements in Mathematics* (1917) | PG **27635**, **16713** | GREEN (ö.1930) | both (direct $9.99 → Kindle 35% → pb 6×9 $16.99) | **Kitap 03.** Seçki + çözümler yeniden yazılır + diyagramlar yeniden çizilir (≥ 10 → Illustrated etiketi) |
| Hearn — *Kwaidan* (1904) | PG **1210** · IA `kwaidanstoriesst00hearuoft` | GREEN metin; Takénouchi plakaları DOĞRULANMADI → **özgün illüstrasyon** | both (direct $8.99) | **Kitap 06.** Yōkai saha rehberi ↔ Codex Bestiarium |
| Falkener — *Games Ancient and Oriental* (1892) | IA **`gamesancientorie00falkuoft`** (NOT_IN_COPYRIGHT) · `in.ernet.dli.2015.281418`; **PG'de YOK** | GREEN (ö.1896) | both (direct $12.99) | **Kitap 09.** Tahtalar yeniden çizilir, kurallar modernize edilir |

### 4.2 Batch 2 — Classics/Stoa + Çin flagship

| Aday | Kimlik | Haklar | Kanal | Karar |
|---|---|---|---|---|
| Epictetus — *Enchiridion* + *Seçme Söylevler* (Long) | PG **45109**, **10661** (alt. Crossley **871**, Rolleston **39855**) | GREEN | both (direct $8.99; "The Stoic Library" bundle $14.99) | **Kitap 05.** En ucuz Lane C başlığı; Meditations fiyat sorusunu bundle ile cevaplar |
| Werner — *Myths and Legends of China* (1922) | PG **15250** | **GREEN** — Werner ö.1954 → hayat+70 **1 Ocak 2025'te doldu** [V]; ACTIVE plan yazıldığında YELLOW'du | both (direct $12.99 / pb $19.99 / hc) | **Kitap 13**, Lane C flagship. Sözlük + kaynak notu + özgün illüstrasyon + Codex çapraz referans |
| Seneca — *Ad Lucilium Epistulae Morales* (Gummere, Loeb 1917–25) | IA **`adluciliumepistu02sene`** (NOT_IN_COPYRIGHT) · `…03sene`; PG'de yok | GREEN (Gummere ö.1919 [A]) | both (direct $9.99) | **Kitap 14.** "Seçme Mektuplar": 40–50 mektup, tematik sıra, notlar |

### 4.3 Batch 3 — Bulmaca, bestiary, Mısır

| Aday | Kimlik | Haklar | Kanal | Karar |
|---|---|---|---|---|
| Loyd — *Cyclopedia of 5000 Puzzles* (1914) | IA **`CyclopediaOfPuzzlesLoyd`** (ABBYY 11 OCR) | GREEN (US 1914; Loyd Jr. ö.1934 [A]) | both (direct $9.99) | **Kitap 19.** "En iyi 120" seçkisi; diyagramlar yeniden çizilir |
| Topsell — *History of Four-Footed Beasts* (1607/1658) | IA **`historyoffourfoo00tops`** (ABBYY 9) · Wellcome **`b10180023`** (Tesseract 5.3) | GREEN metin; Wellcome görselleri CC BY [A] → atıf; kapakta kullanma | both | Bestiarium'un atası; seçki + modern imla + çapraz referans; erken modern OCR ağır (Kraken) |
| Budge — *Legends of the Gods* (1912) **veya** Petrie — *Egyptian Tales* (1895) | PG **9411** · PG **7386/7413** | GREEN | both | Petrie daha kısa ve temiz → önce Petrie [R]; Budge'ın hiyeroglif bölümleri atlanır |

### 4.4 Batch 4+ (puan sırasıyla, kanal kararıyla)

- **Bestiary hattı:** Gould *Mythical Monsters* (PG 40972, GREEN) · Baring-Gould *Curious Myths* (36127) ve *Book of Were-Wolves* (5324) · *Old English Physiologus* (14529, web-only) · Pliny VIII–XI seçkisi (57493…) · Ingersoll *Dragons and Dragon Lore* (1928; kimlik DOĞRULANMADI) · Willoughby-Meade *Chinese Ghouls and Goblins* (IA `chinese-ghouls-and-goblins`; **YELLOW** — yazar ölüm yılı yok).
- **Norse/Kelt (Kitap 11 ve 21–50 için):** Guerber (28497) · Anderson *Younger Edda* (18947, GREEN) — **Brodeur'un Prose Edda'sı YELLOW (2042'ye kadar AB/UK/TR telifli [A]) → kullanma** · Bellows *Poetic Edda* (73533) · Keary (41283) · Dasent (8933) · Rolleston (34081) · Gregory (14465) · Yeats (33887, 10459) · Jacobs Celtic (7885, 34453) · Mabinogion (5160) · Kalevala (25953/33089).
- **Asya:** Korean Folk Tales/Gale (51002) ve Griffis (67180) — **Hangul serisiyle köprü**; Culin *Korean Games* (IA `koreangameswith00culigoog`) — World Games + Hangul köprüsü; Ozaki (4018), Mitford (13015), Kotto (55473); Davis (45723, YELLOW); Chinese Fairy Book (29939); Nihongi (IA `nihongi1asto`/`2asto`); Kojiki (kimlik DOĞRULANMADI); Fansler (8299); Bengal (38488); Jataka (62514/7518, YELLOW); Panchatantra Ryder (kimlik DOĞRULANMADI); Turkish Fairy Tales/Kúnos (64807) — **Founder'ın kültürel avantajı**.
- **Slav:** Ralston (22373), Curtin (50011), Cossack (29672); Chodzko (25555, YELLOW — çevirmen ölüm yılı yok).
- **Mezopotamya/Mısır/Mezoamerika:** Mackenzie *Babylonia* (16653), Petrie, Budge, Spence *Popol Vuh* (56550), Spence *North American Indians* (42390 — danışma).
- **Oyunlar:** Hoyle's Modernized (39445), Foster's Hoyle (53881) → World Games cilt 2 kaynakları (web-only); Murray *History of Chess* (IA `historyofchess0000hjrm`; Murray ö.1955 → **2026'da GREEN oldu**) → yalnızca seçki; Fiske (IA); Smith *Go* (66632, YELLOW); Newell (45762).
- **Hayalet:** M. R. James (8486), Le Fanu (37172…), Bierce (4366) → yalnızca "Valice Ghosts" bundle'ı için, kalabalık köşe.
- **Genç okur klasikleri:** Hawthorne (35377), Kingsley (677), Peabody (9313), Nesbit *Book of Dragons* (23661), Mabie (16537), Aesop/Jacobs (28), Lang *Blue* (503), Grimm/Hunt (5314) — **en kalabalık PD köşesi** [S]: yalnızca güçlü aparat + özgün illüstrasyonla; aksi hâlde "future".
- **Culin — Games of the North American Indians** (IA `gamesofnorthamer00culirich`, NOT_IN_COPYRIGHT): **en son** ve yalnızca kültürel danışma tamamlanınca (Batch 1 planındaki karar korunur).

### 4.5 Format kararı — kanal matrisi

| Kanal | Ne zaman | Örnek |
|---|---|---|
| **web-only** (direct PDF/EPUB) | Aparatı dijitalde daha değerli (yazdırılabilir şablon, arama), KDP'de rakip bedava, baskı marjı ince | Physiologus, Hoyle kaynakları, Celtic Twilight, Casaubon karşılaştırması |
| **both** (direct-first, sonra Amazon) | KDP farklılaştırma eşiği (≥ 10 özgün illüstrasyon **veya** özgün annotation + başlıkta etiket) doğal olarak geçiliyor; baskı 6×9 ≤ 300 sayfa | Dudeney, Kwaidan, Falkener, Werner, Epictetus, Seneca, Loyd, Topsell, Gould |
| **amazon-only** | **Hiçbir zaman** (PAST_DECISIONS: PD editions are direct-first; %35 tavanı) | — |
| **future** | Kimlik/haklar DOĞRULANMADI, kalabalık köşe, veya kültürel danışma bekliyor | Ingersoll, Kojiki, Panchatantra, Culin, Lang/Grimm |

Amazon'a giden her PD edisyonu için: Kindle %35 (liste $9.99 → $3.50) yalnızca keşif; asıl gelir baskı (pb $16.99–19.99, %60 − baskı maliyeti) ve direct. Fiyat kararı `scripts/strategy/price-engine.mjs --pd` ile hesaplanır [O].

---

## 5. PD → Valice Edisyonu: farklılaştırma çerçevesi (Faz 6)

### 5.1 Neden bir standart gerekir

KDP'nin kabul ettiği farklılaştırma **yalnızca** özgün çeviri, özgün annotation (çalışma rehberi, eleştiri, biyografi, tarihsel bağlam) veya **≥ 10 özgün illüstrasyon**dur; bağlantılı içindekiler, biçim iyileştirmesi, derleme, fiyat ve "internette serbest içerik" **sayılmaz**; başlıkta **(Annotated)/(Illustrated)/(Translated)** etiketi zorunludur [V, KDP "Publishing Public Domain Content"]. Valice'in kendi mağazasında bu kural geçerli değildir; ama **okurun neden Gutenberg yerine $9.99 ödediği** sorusu geçerlidir. Standart bu soruya cevaptır.

### 5.2 MINIMUM standart (her PD edisyonu; direct-only olsa bile)

1. **Özgün giriş ≥ 1.500 kelime** — eser, yazar, neden bu çeviri/edisyon, nasıl okunmalı.
2. **Kaynak ve haklar notu** — kaynak edisyon, çevirmen, PG/IA kimliği, ne çıkarıldı (Meditations'taki gibi [O]).
3. **Sözlük veya kronoloji** (en az biri; ≥ 60 madde).
4. **Yeni dizgi** — 6×9, house tipografi, gerçek içindekiler, koşu başlıkları.
5. **Özgün kapak** — PD görsel **kapakta kullanılmaz** (ilke; ayrıca KDP bunu farklılaştırma saymaz).
6. **Özgün pay ölçümü:** `özgün_kelime / toplam_kelime ≥ %15` (giriş + notlar + sözlük). Build scripti hesaplar ve `BOOK_STATS.md`'ye yazar.
7. **KDP'ye gidiyorsa ek olarak:** ≥ 10 özgün illüstrasyon **veya** ≥ %25 özgün annotation; başlıkta etiket; AI beyanı kararı (Founder).

### 5.3 PREMIUM standart (flagship PD: Werner, Falkener, Topsell)

Minimum + **çalışma/okuma rehberi** (bölüm soruları, okuma sırası) + **harita/diyagram/tablo** (yeniden çizilmiş; ≥ 10) + **karşılaştırmalı notlar** ("1892'den beri arkeoloji ne düzeltti", "Long ve Hays nerede ayrılır") + **companion sayfası** (yazdırılabilir tahta/şablon, telaffuz tablosu, sözlük indirmesi — Faz 10 şablonu "classics") + **özgün pay ≥ %35**.

### 5.4 Meditations — bugünkü durum ve yükseltme

| Ölçüt | Bugün [O] | Standart | Kitap 18 planı |
|---|---|---|---|
| Giriş | ~1 sayfa "Before You Begin" | ≥ 1.500 kelime | Stoacılığa giriş + Marcus'un hayatı + Long'un çevirisi neden (Hays/Casaubon karşılaştırması) |
| Kaynak notu | ✓ | ✓ | korunur |
| Sözlük/kronoloji | ✗ | ≥ 60 madde | Stoa terimleri sözlüğü (~80) + Marcus kronolojisi |
| Notlar | ✗ (Long'un notları bilinçli çıkarılmış) | annotation | Kitap başına özgün 8–12 not (kişiler, olaylar, kavramlar) |
| Özgün pay | ~%3 [A] | ≥ %15 | ~%20 |
| Fiyat | $9.99 direct | — | $9.99 korunur; "The Stoic Library" bundle (Meditations + Epictetus + Seneca) $19.99 |
| Amazon | yok | — | Kindle **(Annotated)** $9.99 (%35, keşif); pb 6×9 ~200 s. $14.99 |

Yükseltme 40–60 saat; mevcut alıcılar (0 sipariş [O]) etkilenmez; `masterFileKey` v2'ye döner, kütüphanede "güncellendi" bildirimi (Faz 7A "future updates" standardı).

---

## 6. Faz kapıları (Faz 32) ve Founder aksiyonları

### 6.1 Faz 5 — Keşif motoru

| | |
|---|---|
| Amaç | Tekrarlanabilir aday üretimi; 94 satırlık havuz → aylık +20 aday |
| Girdi | §1 kaynaklar; §3.2 ağırlıklar; GSC sorguları (mülk doğrulanınca) |
| Çıktı | `scripts/pd/*.mjs` (4 script), `PUBLIC_DOMAIN_CANDIDATE_DATABASE.csv` güncel, aylık keşif raporu |
| Bağımlılık | Yok (shell erişimi yeterli [O]) |
| Ajanlar | MARKET+KEYWORD ajanı (Gate 1), RIGHTS ajanı (ön tarama; karar Founder) |
| İnsan kapısı | Founder: Gate 2 imzası; kültürel danışma kararı |
| Süre | 2 hafta kurulum; sonra 2 saat/ay |
| Başarı | Her aday için kimlik + beş katman haklar kaydı; Gate 2'de sıfır "bilmiyoruz" |
| Başarısızlık | Kimliği doğrulanmamış aday üretime girer → **kırmızı çizgi** |
| KPI | GREEN aday sayısı; kimlik doğrulama oranı %100 |
| Sonraki faz | Faz 6 üretim standardı; Faz 7B pipeline |

### 6.2 Faz 5B — Haklar kapısı

Her başlık için `rights` bloğu + `RIGHTS.md` + Founder imzası. **Devredilemez.** Kill kriteri: herhangi bir katman YELLOW iken Amazon'a yükleme.

### 6.3 Faz 6 — Edisyon standardı

`build` scripti özgün payı ölçer; `%15` altı `.gate` `phase5`'i geçemez. Founder Gate 7 (kapak) ve Gate 10 (KDP politikası, etiket, AI beyanı).

### 6.4 Founder'ın yapması gerekenler (yalnızca gerçekten Founder'a düşenler)

| # | Aksiyon | Neden | Nerede | Süre | Bağımlılık |
|---|---|---|---|---|---|
| F1 | Batch 1 sırasını onayla (Dudeney → Kwaidan → Falkener) | Üretim tahsisi | Bu belge | 10 dk | — |
| F2 | Kwaidan için "yalnızca özgün illüstrasyon" kararını onayla | Takénouchi hakları DOĞRULANMADI | Batch 1 planı §B1-2 | 5 dk | — |
| F3 | Meditations yükseltmesini (Kitap 18) ve bundle fiyatını onayla | Fiyat/aparat kararı | §5.4 | 15 dk | Epictetus (Kitap 05) |
| F4 | Kültürel danışma politikasını yaz (yerli/kutsal materyal) | Culin, Spence, Eastman bekliyor | `memory/PAST_DECISIONS.md` ek | 1 saat | — |
| F5 | Her PD başlığı için AI beyanı kararı (özgün notlar AI ile yazıldıysa "AI-generated" [V]) | KDP hesap riski | KDP yükleme akışı | başlık başına 5 dk | Gate 10 |
| F6 | Yazar/editör biyografisi (PD edisyonları "kim düzenledi" ile satar) | `AUTHORS.bio` null [O] | katalog | 1 saat | — |
| F7 | Standard Ebooks adı/logosu ve Wellcome CC BY atıf satırı için kullanım kuralını onayla | DOĞRULANMADI alanlar | §1 | 15 dk | — |

---

## 7. Belirsizlikler (saklanmadı)

- HathiTrust indirme kısıtları, LoC API sınırları, Google Books kullanım ricasının tam metni, Standard Ebooks marka kuralı: **bu oturumda DOĞRULANMADI** (web arama bütçesi tükendi; siteler challenge/404 döndü [O]).
- Çevirmen/yazar ölüm yılları için "[A]" işaretli her satır ikincil kaynaklara dayanır; haklar defteri birincil kaynak (VIAF/Wikidata/nekroloji) ister.
- PG top-100 ve Amazon BSR örneklemesi yapılmadı → puanlar **sıralama hipotezidir**.
- Talep verisi: Meditations'ın 0 siparişi [O] PD-direct kanalının çalıştığını **kanıtlamaz**; Faz 12 (SEO/GSC) ve Faz 14 (köprü) trafik getirmeden ölçülemez.
