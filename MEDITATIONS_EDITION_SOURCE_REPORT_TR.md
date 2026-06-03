# Meditations — Edisyon & Kaynak Raporu

> İlk kanonik **PD Spine** başlığı: Marcus Aurelius, *Meditations*.
> Çıktı: `meditations.pdf` (proje kökü). **Henüz yüklenmedi** — R2/DB'ye
> dokunulmadı, commit/push yapılmadı.
>
> **Tarih:** 2026-06-01

---

## 0. Özet

Kamu malı (public domain) bir **premium okuma edisyonu** sıfırdan üretildi.

| Alan | Değer |
|------|-------|
| Eser | *Meditations* (Τὰ εἰς ἑαυτόν, “To Himself”), Marcus Aurelius (M.S. 121–180) |
| Çeviri | **George Long** (1862), Yunancadan İngilizceye |
| Kaynak metin | **Project Gutenberg eBook #15877** (düz metin) |
| Sayfa sayısı | **148 sayfa** (6×9 inç) |
| Yapı | 12 kitap · 487 bölüm |
| Dosya | `meditations.pdf` · 380 KB · PDF-1.4 |
| SHA-256 | `f22d446e38d58a77a18bcdb994ec511be1825b34e784c012c922dd2b6d3eb7bd` |

---

## 1. Kullanılan Kaynak (Source Used)

- **Çeviri:** George Long, 1862 — *Meditations*'ın en yaygın okunan klasik
  İngilizce çevirisi.
- **Kaynak metin:** Project Gutenberg eBook **#15877**
  (“Thoughts of Marcus Aurelius Antoninus”, çevirmen: George Long), düz-metin
  sürümü (`pg15877.txt`) `gutenberg.org` üzerinden indirildi.
- Metnin yalnızca **on iki kitabı (çekirdek eser)** alındı. Tüm Project
  Gutenberg başlık/altbilgi, lisans metni ve ticari-marka kalıpları
  **tamamen çıkarıldı**; PDF'te yalnızca kamu malı çeviri ve özgün ön/künye
  maddesi yer alır.

---

## 2. Neden Hukuken Güvenli (Legal Safety)

1. **Orijinal eser** (~M.S. 180, Yunanca) — antik; tartışmasız kamu malı.
2. **Çeviri (George Long, 1862)** — çevirmen **1879'da öldü**. “Yaşam + 70”
   kuralını uygulayan tüm ülkelerde telif 1949'da doldu; ABD'de 1862 yayını
   olarak zaten kamu malı. Yani çeviri **dünya genelinde kamu malı**.
3. **Project Gutenberg metni** — Gutenberg lisansı yalnızca *kendi
   ticari-markasını ve kalıplarını* kapsar; **altta yatan PD çeviri serbesttir.**
   Marka/lisans/başlık apparatusu çıkarıldığı için Gutenberg lisansı dahi
   devreye girmez.
4. **Telifli çevirilerden bilinçli olarak kaçınıldı.** Örn. Gregory Hays
   çevirisi (2002) **telif altındadır** → kullanılmadı. Meric Casaubon
   çevirisi (1634, Gutenberg #2680) de kamu malıdır fakat **arkaiktir**
   (“shamefastness”, “manlike behaviour”); okunabilirlik gerekçesiyle Long
   tercih edildi.

> Not: Bu rapor hukuki danışmanlık değildir; ticari kullanımdan önce nihai bir
> kamu-malı teyidi (özellikle hedef pazarların yerel kuralları) önerilir —
> ancak Long/1862 seçimi bilinen en güvenli PD yollarından biridir.

---

## 3. Editöryal Kararlar (Editorial Decisions)

**İçerik**
- **Kapsam:** yalnızca on iki kitap (Meditations'ın kanonik metni). Long'un
  uzun bilimsel **girişi, dipnotları ve indeksleri çıkarıldı** → temiz bir
  *okuma* edisyonu (eleştirel/akademik edisyon değil).
- **Dipnot işaretleri** ([A], [B] …) gövdeden temizlendi; çevirmenin köşeli
  parantezli **anlam tamamlamaları korundu** (ör. “From my grandfather Verus
  [I learned] …”).
- Long'un dipnotları orijinalde **sayfa sonlarına serpiştirilmişti**; bu
  bloklar çıkarıldı, bir dipnotun böldüğü bölümler **yeniden birleştirildi**
  (bölüm numaraları “N.” işaretiyle hizalanarak — kayıp/yanlış bölünme yok;
  bölüm sayıları kanonik yapıyla bire bir: 17·17·16·51·36·59·75·61·42·38·39·36).

**Tipografi & tasarım** (“cinematic but restrained”)
- Gövde: **Noto Serif**; başlıklar: **Noto Serif Display**. Sayfa: **6×9 inç**
  (premium ticari kitap formatı), iki yana yaslı dizgi, klasik paragraf girintisi.
- **Sinematik kapak** (koyu zümrüt-siyah zemin, ince zümrüt iç çerçeve, büyük
  display başlık) + **açık/okunabilir iç sayfalar** — markanın zümrüt aksanı
  ölçülü kullanıldı (bölüm numaraları ve ince çizgilerde).
- **Ön/künye maddesi:** başlık sayfası · edisyon/künye sayfası (PD beyanı +
  kaynak künyesi) · gerçek sayfa-numaralı **içindekiler** · kısa **özgün
  önsöz** (“BEFORE YOU BEGIN” — tarafımdan yazıldı, telif sorunsuz) · 12 kitap.
- **Sayfa numaralandırma:** ön madde numarasız; gövde **1'den** başlar; üst
  bilgide ince “Meditations” başlığı, alt bilgide ortalı sayfa numarası.
  İçindekiler ↔ altbilgi numaraları **tutarlı**.

**Üretim**
- Metin işleme + dizgi tek seferlik bir Python (**reportlab**) betiğiyle yapıldı;
  betik repoya **konmadı** (`/tmp` içinde tutuldu). Üretilen tek kalıcı
  çıktılar: `meditations.pdf` ve bu rapor.

---

## 4. Sayfa Sayısı (Page Count)

- **148 sayfa**, 6×9 inç (432×648 pt).
- 12 kitap · 487 bölüm.
- Açılış (“From my grandfather Verus …”) ve kapanış (“… Depart then satisfied,
  for he also who releases thee is satisfied.”) **eksiksiz**; doğrulama:
  metinde sızmış dipnot işareti **0**, Gutenberg kalıp/lisans sızıntısı **0**.

---

## 5. Sınırlamalar (Limitations)

1. **Akademik aparat yok:** çevirmenin girişi, dipnotları ve indeksleri dahil
   değil. Bu bir okuma edisyonudur; eleştirel/şerhli edisyon değildir.
2. **Olası nadir paragraf birleşmeleri:** Long'un sayfa-sonu dipnotları metne
   serpiştirilmişti; çok nadiren, bir bölümün dipnot düşen yerinde paragraf
   akışında ufak bir birleşme olabilir (içerik tam — yalnızca biçimsel).
3. **Dil:** İngilizce (Long çevirisi). Türkçe çeviri içermez.
4. **Kapak görseli yok:** kapak tipografiktir. Mağaza kapak görseli
   (`/images/books/meditations.webp`) ayrı bir görsel katmandır; bu PDF'in
   içeriğiyle ilgisizdir.
5. **Otomatik dizgi:** dul/yetim satır, manuel kerning gibi ince mizanpaj
   düzeltmeleri yapılmadı — yine de tutarlı ve okunabilir.
6. **Henüz yüklenmedi:** `masterFileKey` hâlâ NULL; R2 ve DB'ye dokunulmadı
   (Phase 2 — Master File Ingestion ayrı bir adımdır).

---

## 6. Durum

- `meditations.pdf` proje kökünde hazır (untracked).
- Geçici dizgi betiği repo dışında (`/tmp`), kalıcı yardımcı betik bırakılmadı.
- **R2/DB'ye dokunulmadı. Commit/push yapılmadı.**
- Hazır: doğrulanmış kanonik master, Phase 2 yüklemesini bekliyor.
