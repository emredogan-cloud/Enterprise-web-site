# Claude Agent SDK — Derinlemesine Eğitim ve Mühendislik Rehberi

> **Kaynak:** Anthropic mühendisi Tariq'in ~1 saat 52 dakikalık atölye çalışması (`claude_advanced.mp4`).
> **Format:** Bir ders kayıt transkriptinden yeniden inşa edilmiş, üretim seviyesinde mühendislik el kitabı.
> **Okuyucu profili:** AI agent geliştirmek isteyen yazılım mühendisleri, ML mühendisleri, ürün geliştiricileri ve AI sistemleri tasarlayan teknik liderler.
> **Önkoşul:** Temel TypeScript / Python bilgisi, REST API kavramı, Unix/Bash temel kullanımı. LLM tool calling deneyimi avantaj fakat zorunlu değil.

---

## İçindekiler

1. [Giriş — Bu rehber size ne kazandırır?](#1-giriş--bu-rehber-size-ne-kazandırır)
2. [Modern AI Agent Kavramı](#2-modern-ai-agent-kavramı)
3. [Claude Agent SDK Mimarisi](#3-claude-agent-sdk-mimarisi)
4. [Claude Code Nasıl Çalışıyor?](#4-claude-code-nasıl-çalışıyor)
5. [Workshop Boyunca Gösterilen Kodların Detaylı Açıklaması](#5-workshop-boyunca-gösterilen-kodların-detaylı-açıklaması)
6. [Tool Calling Sistemi](#6-tool-calling-sistemi)
7. [Context Engineering ve Prompt Engineering](#7-context-engineering-ve-prompt-engineering)
8. [Gerçek Agent Tasarımı](#8-gerçek-agent-tasarımı)
9. [Workshop'taki En Kritik Mühendislik İçgörüleri](#9-workshoptaki-en-kritik-mühendislik-içgörüleri)
10. [Claude Agent SDK ile Neler İnşa Edilebilir?](#10-claude-agent-sdk-ile-neler-i̇nşa-edilebilir)
11. [Production-Level Best Practices](#11-production-level-best-practices)
12. [Workshop'tan Çıkarılan Nihai Dersler](#12-workshoptan-çıkarılan-nihai-dersler)
13. [Ekler — Terminoloji, Diyagramlar, Şablonlar](#13-ekler--terminoloji-diyagramlar-şablonlar)

---

## 1. Giriş — Bu rehber size ne kazandırır?

### 1.1 Bu eğitim ne anlatıyor?

Bu doküman, Anthropic'in **Claude Agent SDK** mühendislik atölyesinin tam bir yeniden inşasıdır. Konuşmacı Tariq, atölyede bir agent çerçevesinin (framework) "neden" var olduğunu, Claude Code üzerine kurulu mimarisini, agent tasarımındaki üç temel adımı (bağlam toplama → eylem alma → işi doğrulama), Bash aracının neden "ilk code mode" olduğunu, ve canlı bir Pokémon agent demosu ile pratik bir prototip akışını gösteriyor.

Bu rehber transkriptin **kelimesi kelimesine çevirisi değildir**. Konuşma diline özgü tekrarlar, sözlü doldurma kelimeleri ve özellikle ses-temelli transkripsiyondan kaynaklanan terim hataları (örneğin `clod code → Claude Code`, `enthropic → Anthropic`, `batches → bash`, `pokey api → PokéAPI`) düzeltilmiş; konuşma yapısı **bir mühendislik el kitabı** formuna dönüştürülmüştür. Konuşmacının söylediği her şey burada vardır, ancak ek olarak:

- üstü kapalı geçilen mimari kararlar **açıkça gerekçelendirilmiştir**,
- ima edilen kavramlar **tam metin halinde ifade edilmiştir**,
- belirli bir konunun tekrarlandığı yerler **tek bir bölümde birleştirilmiştir**,
- konuşmacının yalnızca isim verdiği ve uygulamasını göstermediği bileşenler için **örnek kod parçacıkları yeniden yapılandırılmıştır**.

### 1.2 Claude Agent SDK nedir?

**Claude Agent SDK**, Anthropic'in production'da iç araçlarını ve Claude Code'u inşa ederken ortaya çıkardığı agent geliştirme katmanlarının paketlenmiş bir kütüphanesidir. Tek cümleyle: **"Claude Code'u kütüphane olarak kullanın."**

Tariq bunu çok açık şekilde söylüyor: *"Claude Agent SDK aslında Claude Code'un üzerine inşa edildi. Bunu yaptık çünkü Anthropic'te agent inşa ederken aynı parçaları tekrar tekrar inşa ettiğimizi fark ettik."*

SDK'nın içerdiği temel bileşenler:

| Bileşen | Görevi |
|--------|--------|
| **Model çağrı katmanı** | Anthropic API üzerinde streaming, retry, rate-limit yönetimi |
| **Tool çalıştırma harness'i** | Tool tanımları, dispatch, paralel çağrı, hata kurtarma |
| **Bash tool + AST parser** | Güvenli komut çalıştırma, komut hattını parse ederek statik analiz |
| **File system tools** | `Read`, `Write`, `Edit`, `Grep`, `Glob` |
| **Context engineering altyapısı** | `CLAUDE.md`, skill sistemi, todo listesi, compaction |
| **Sub-agent runtime** | Paralel görev dağıtımı, izole context'lerde çalışan alt-agent'lar |
| **Hooks** | Tool çağrılarından önce/sonra çalışan, deterministik doğrulama veya bağlam enjeksiyonu sağlayan event'ler |
| **Sandbox primitifleri** | Network ve filesystem izolasyonu |
| **Memory tool** | File-system tabanlı kalıcı hafıza |

### 1.3 Claude Code ile ilişkisi

Claude Code, Anthropic'in komut satırından kullanılabilen, Claude modelini bir kod çalışma alanına bağlayan **agent uygulamasıdır**. Tariq'in tabiriyle *"ilk gerçek agent"* — yani bir AI'nın 10, 20, 30 dakika boyunca otonom çalıştığı ilk araç.

Claude Agent SDK ise **aynı runtime'ı kütüphane olarak dışa açar**. Yani:

```
Claude Code (CLI uygulaması)
    └── kullanır → Claude Agent SDK (runtime)
                       ├── tools
                       ├── harness loop
                       ├── context yönetimi
                       ├── sub-agents
                       └── ...

Sizin uygulamanız (örn. Pokémon agent)
    └── kullanır → Claude Agent SDK (aynı runtime)
```

Bu, mimari açıdan önemli bir karardır: Claude Code geliştikçe SDK'yı kullanan **tüm agent'lar otomatik olarak iyileşir**. Bash AST parser'da bir hatayı düzelttiklerinde, sizin agent'ınız da o düzelmeden faydalanır.

### 1.4 Workshop'un genel amacı

Atölyenin amacı sadece SDK'yı tanıtmak değildir. Tariq'in iki "üst amacı" var:

1. **Anthropic'in agent inşa felsefesini paylaşmak.** Yani: Bash neden bu kadar önemli? Tool sayısını neden mümkün olduğunca azaltıyoruz? Verifiability neden bir agent'ın "iyi" olup olmamasını belirleyen tek faktör?
2. **Bu felsefeyi prototip kodu üzerinde göstermek.** Pokémon takım kurma agent'ı demosu, *"bir API'den çağrı tabanlı bir agent'a, oradan da Claude Agent SDK kullanan bir agent'a"* geçişi canlı yapıyor.

Bu rehber her iki amacı da koruyor, fakat sırayı eğitimsel olarak yeniden düzenliyor: önce kavramlar, sonra mimari, sonra pratik.

> **💡 Önemli İçgörü**
> Agent inşa etmek bir bilim değil, bir sanat. Konuşmacı bunu defalarca vurguluyor. Modeli "tasarlamıyoruz, yetiştiriyoruz" (we grow them, not design them). Bu, Cartesian değil empirik bir mühendislik disiplini. Bir agent loop'unu iyileştirmenin **birinci yolu**: agent'ın transkriptlerini her seferinde okuyup ne yaptığını anlamak.

---

## 2. Modern AI Agent Kavramı

### 2.1 LLM kullanımının üç evrimsel aşaması

Tariq, AI uygulamalarının evrimini üç aşamada tanımlıyor:

| Aşama | Örnek | Özellik | Bağımlılık |
|-------|-------|---------|-----------|
| **Tek-LLM özellikleri** | GPT-3 sınıflandırma çağrısı | Tek input → tek output | Çok düşük autonomy |
| **Workflow'lar** | "Bu e-postayı oku ve etiketle", "RAG ile bir sonraki tamamlamayı ver" | Yapılandırılmış girdi/çıktı, sabit adım sırası | Orta autonomy, deterministik akış |
| **Agent'lar** | Claude Code | Doğal dil → çok geniş eylem alanı | Yüksek autonomy, otonom trajectory |

**Anahtar fark:** Bir workflow size *"şu adımları uygula"* der; bir agent size *"şu hedefi başar, nasıl başaracağına sen karar ver"* der.

### 2.2 Agent nedir? — Çalışan tanım

Bir agent, üç temel özelliğe sahip bir LLM tabanlı sistemdir:

1. **Kendi bağlamını inşa eder** — hangi dosyayı okuyacağına, hangi API'yi çağıracağına kendisi karar verir.
2. **Kendi trajectory'sini belirler** — kaç adım atacağını, hangi sırayla atacağını önceden bilemezsiniz.
3. **Otonom çalışır** — insan müdahalesi olmadan dakikalarca, hatta saatlerce ilerleyebilir.

Tariq'in eklemediği fakat ima ettiği dördüncü özellik: **doğrulanabilir iş üretir** — eğer agent'ın çıktısını kontrol edemiyorsanız, agent yapısı yanlış seçimdir.

### 2.3 Workflow vs Agent — Pratik karar matrisi

| Boyut | Workflow | Agent |
|-------|---------|-------|
| Girdi/çıktı şekli | Yapılandırılmış (JSON schema, fonksiyon imzası) | Doğal dil + isteğe bağlı yapılandırılmış output |
| Adım sayısı | Önceden bilinir | Önceden bilinmez |
| Hata kurtarma | Try/catch, retry policy | Agent kendi hatasını fark eder ve düzeltir |
| Tipik kullanım | GitHub PR review, e-posta etiketleme, sınıflandırma | Code yazma, araştırma, çok-aşamalı veri analizi |
| SDK avantajı | Structured outputs, tek modelle çalışma | Tool ekosistemi, file system, sub-agents |

> **🏭 Production Note**
> Tariq vurguluyor: *"İçeride biz ne yapıyoruz? Workflow gibi görünen işleri bile agent SDK ile yazıyoruz. Çünkü GitHub issue'sunu triaj etmek için sonunda repo'yu clone etmek, Docker container ayağa kaldırmak, testleri çalıştırmak gerekiyor. Yani ortada her zaman 'agent benzeri' adımlar oluyor."*
>
> Pratik kural: Eğer süreç boyunca dosya sistemi, network veya komut çalıştırma gerekiyorsa — agent kullanın. Eğer salt bir LLM çağrısıyla yapılabiliyorsa — workflow yeterli.

### 2.4 Tool-calling mantığı

Tool calling (alet kullanımı), LLM'in dış dünyaya açıldığı arayüzdür. Standart pattern:

```
Kullanıcı mesajı
       ↓
Model bir tool çağrısı üretir (JSON formatında)
       ↓
Harness tool'u çalıştırır
       ↓
Tool sonucu modele geri verilir
       ↓
Model ya yeni bir tool çağırır, ya da kullanıcıya yanıt verir
```

Bir tool'un üç bileşeni vardır:

1. **Schema** — adı, açıklaması, parametreleri (genellikle JSON Schema)
2. **Çalıştırıcı** — gerçek fonksiyon implementasyonu
3. **Sonuç formatı** — model için anlaşılır metin

**Önemli ayrım:** Anthropic'in agent felsefesinde tool'lar **atomik, geri alınamaz, son adım** eylemlerine ayrılır. Dinamik veri analizi, arama, dönüşüm gibi işler için Bash veya code generation tercih edilir (Bkz. Bölüm 6).

### 2.5 Autonomous behavior — Otonomluğun anatomisi

Bir agent'ın otonom çalışabilmesi için **kendi kararlarını alabilmesi** gerekir. Bu kararlar üç katmanda gerçekleşir:

| Karar katmanı | Soru | Örnek |
|--------------|------|-------|
| **Bağlam toplama** | "Bu görevi yapmak için neye ihtiyacım var?" | "Önce `package.json`'a bakayım, sonra `src/`'ı tarayayım" |
| **Eylem seçimi** | "Şu an hangi aracı kullanmalıyım?" | "Burada `Edit` mi yoksa `Write` mi uygun?" |
| **Sonlandırma** | "Görev bitti mi?" | "Test geçiyor, lint temiz, hazır" |

Otonomi, **modelin doğru kararı verebilmesi** + **harness'ın hatalı kararı düzeltebilmesi** kombinasyonudur.

### 2.6 Planning ve reasoning

Tariq, planning'i agent loop'unda **opsiyonel bir ara adım** olarak tarif ediyor:

```
[Bağlam toplama] → (opsiyonel: Plan oluştur) → [Eylem al] → [Doğrula]
```

Plan oluşturma:
- **Latency artışı** getirir (extra LLM çağrısı)
- Ama uzun, çok-aşamalı görevlerde **hata oranını düşürür**

Claude Agent SDK'da `TodoWrite` tool'u vardır: agent kendi yapacaklar listesini oluşturur ve adım adım işaretler. Bu liste, kullanıcıya da görsel ilerleme sağlar.

> **💡 Önemli İçgörü**
> Plan, agent'ın *kendisi için* ürettiği yapılandırılmış metindir. Asıl güç şuradan gelir: plan model context window'una geri verildiği için **model adım atarken kendi planını okuyabilir**. Yani plan, eğitilmiş bir reasoning trace gibi davranır.

### 2.7 Context engineering

Modelin bağlam penceresi (context window) sınırlıdır. Context engineering, **modelin gerçekten ihtiyaç duyduğu bilgiyi, doğru anda, doğru formatta** bağlama yerleştirmektir.

Üç temel araç:

1. **System prompt** — Sabit, agent'ın kimliği ve kuralları.
2. **CLAUDE.md** — Repo veya proje özelinde, agent her oturumda otomatik okur.
3. **File system** — "Tembel yükleme" (lazy loading). Bilgi dosyada bulunur; agent ihtiyaç duyduğunda kendi okur.

> **🏭 Production Note**
> *"Modelin görmesi gereken bilgiyi system prompt'a koymayın. Mümkünse dosyaya yazın ve modelin keşfetmesine izin verin. Çünkü system prompt her çağrıda token tüketir; dosya yalnızca okunduğunda."* — Tariq'in workshop boyunca tekrarladığı temel kural.

### 2.8 Memory yönetimi

Memory iki türdür:

| Tür | Mekanizma | Süre |
|-----|-----------|------|
| **In-context memory** | Mesaj geçmişi | Yalnızca o oturum |
| **External memory** | File system, vektör DB, key-value store | Kalıcı |

Anthropic'in iç memory tool'u, Tariq'in açıklamasına göre file system tabanlıdır:

```
memory/
├── user_preferences.md
├── past_conversations/
│   ├── 2026-05-01.md
│   └── 2026-05-15.md
└── facts.md
```

Agent SDK'da bunu replikalamak için: agent'a "memory yazma" izni verin, `memory/` klasörüne yazsın, sonraki oturumlarda otomatik okusun.

### 2.9 Agent ile chatbot arasındaki kavramsal fark

Bir chatbot (klasik) ile agent arasındaki fark, sadece *"araç kullanır mı?"* sorusu değildir. Beş kritik boyutta farklılaşır:

| Boyut | Chatbot | Agent |
|-------|---------|-------|
| **Görev süresi** | 1-3 mesaj | Dakikalarca, hatta saatlerce |
| **Belirsizlik toleransı** | Düşük (kullanıcıdan netleştirme ister) | Yüksek (kendi kendine pivot eder) |
| **Hata kurtarma** | Tek seferlik retry | Multi-step diagnosis ve düzeltme |
| **Output formatı** | Doğal dil cevap | Cevap + side effects (dosyalar, API call'lar) |
| **Mental model** | "Sor ve cevapla" | "Hedef ver ve bekle" |

Workshop'ta Tariq bu farkı şöyle vurguluyor: *"Claude Code'u ilk kez kullandığımda gördüm — AI 10-20-30 dakika çalışıyor. O zaman 'bu yeni bir şey' diye anladım."*

### 2.10 Agent'ın "düşünme" kapasitesi — Extended thinking

Claude 4 ailesinde **extended thinking** özelliği vardır: model cevap vermeden önce kendi içinde uzun bir muhakeme süreci yürütür. Bu, agent'lar için iki şekilde faydalıdır:

1. **Karmaşık tool seçimi** — "Birden fazla yol var, hangisini seçeyim?" sorusunu modeli yormadan çözebilir.
2. **Hata teşhisi** — Hata mesajına bakıp uzun bir analiz yapabilir.

Tipik kullanım (Anthropic SDK):

```typescript
const resp = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 4096,
  thinking: { type: "enabled", budget_tokens: 8000 },
  // ...
});
```

Thinking budget = "modelin bu çağrıda kendi içinde düşünmek için harcayabileceği maksimum token." Daha yüksek bütçe = daha derin reasoning = daha pahalı.

> **🏭 Production Note**
> Her agent çağrısında thinking açmayın — pahalı. Sadece şu durumlarda açın: (a) karmaşık planlama gereken adımlar, (b) hata teşhisi, (c) çelişkili tool sonuçları arasında karar verme. Basit "dosyayı oku ve yaz" tipi adımlarda kapalı bırakın.

---

## 3. Claude Agent SDK Mimarisi

### 3.1 Genel sistem mimarisi

Claude Agent SDK'nın katmanlı mimarisi:

```
┌────────────────────────────────────────────────────────────────┐
│                       UYGULAMA KATMANI                          │
│  (Sizin agent kodunuz - örn. pokemon-agent/agent.ts)            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    AGENT SDK PUBLIC API                         │
│  - ClaudeAgent / Query API                                      │
│  - Tool registration                                            │
│  - Hook registration                                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                   AGENT RUNTIME (HARNESS)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │ Loop driver │  │ Tool dispatcher│ │ Hook engine │             │
│  └─────────────┘  └─────────────┘  └──────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │ Compaction  │  │ Sub-agents  │  │ Permissions  │             │
│  └─────────────┘  └─────────────┘  └──────────────┘             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       TOOL KATMANI                              │
│  Bash | Read | Write | Edit | Grep | Glob | Task (sub-agent) | │
│  WebSearch | WebFetch | TodoWrite | Custom Tools                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  EXTERNAL DEPENDENCIES                          │
│  Anthropic API | File System | Network | Subprocess             │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Event loop mantığı

Agent'ın çalışma döngüsü (single-threaded, deterministic):

```
while not done:
    1. Modeli çağır (mesaj geçmişi + tool tanımları)
    2. Model yanıtını al
    3. Eğer yanıt tool_use içeriyorsa:
         a. PreToolUse hook'larını çalıştır
         b. Tool'u çalıştır
         c. PostToolUse hook'larını çalıştır
         d. Tool sonucunu mesaj geçmişine ekle
         e. continue (döngüye dön)
    4. Eğer yanıt sadece text ise:
         a. Stop hook'larını çalıştır
         b. Eğer hook devam ettirmek isterse → continue
         c. Aksi halde → done = True
```

> **💡 Önemli İçgörü**
> Bu loop'un "agent" niteliği, ne adımdan tek adımda durduğunun model tarafından belirlenmesinden geliyor. Loop bir `while True` ama "true" kararını **model** veriyor — kullanıcı değil. Bu, klasik kontrol akışı tersine çevrilmiş haldedir.

### 3.3 Tool execution flow

Bir tool çağrısının yaşam döngüsü:

```
Model tool çağrısı üretir
        │
        ▼
[ PreToolUse hook ] ────► İzin yoksa block et
        │
        ▼
Tool dispatcher tool'u tanır
        │
        ▼
Argümanlar validate edilir (JSON Schema)
        │
        ▼
Tool çalıştırılır (subprocess, HTTP, vs)
        │
        ▼
Sonuç metne dönüştürülür
        │
        ▼
[ PostToolUse hook ] ────► Sonucu modify edebilir veya hata fırlatabilir
        │
        ▼
Mesaj geçmişine eklenir
        │
        ▼
Model bir sonraki adımı belirler
```

### 3.4 Message lifecycle

Bir oturum boyunca mesaj geçmişi şu yapıdadır:

```typescript
type Message =
  | { role: "user", content: string | ContentBlock[] }
  | { role: "assistant", content: ContentBlock[] }

type ContentBlock =
  | { type: "text", text: string }
  | { type: "tool_use", id: string, name: string, input: object }
  | { type: "tool_result", tool_use_id: string, content: string, is_error?: boolean }
  | { type: "thinking", thinking: string }   // extended thinking aktifse
```

Tipik bir akış:

```
[user]   "Pokémon'larımdan birinin moveset'ini öner."
[assistant] thinking + tool_use(get_pokemon, {name: "venusaur"})
[user]   tool_result(...)
[assistant] thinking + tool_use(get_move, {name: "sleep-powder"})
[user]   tool_result(...)
[assistant] text("Venusaur için önerilen moveset: ...")
```

### 3.5 System prompt yapısı

Claude Agent SDK varsayılan olarak şunları system prompt'a otomatik enjekte eder:

1. **Agent kimliği** — "Sen Claude'sun, agent SDK harness'ında çalışıyorsun."
2. **Tool kataloğu** — kullanılabilir tool'ların açıklamaları.
3. **CLAUDE.md içeriği** — proje özelinde kurallar.
4. **Working directory** — agent'ın "bulunduğu" yer.
5. **Permission policy** — neyi yapabilir/yapamaz.

Tipik bir CLAUDE.md formatı (Bölüm 7.1'de detaylı açıklanıyor):

```markdown
# Project: Pokémon Team Builder

## Available APIs
- `pokey-api-sdk/` klasöründe TypeScript SDK var.
- Bash üzerinden `bun run examples/<script>.ts` ile çalıştır.

## Coding conventions
- TypeScript kullan, JavaScript yazma.
- Önce `examples/` klasöründe bir script yaz, sonra çalıştır.

## Data files
- `data/smogon.txt` — competitive Pokémon meta data.
- `data/teams.json` — kullanıcının kayıtlı takımları.
```

### 3.6 Context window yönetimi

Claude 4 ailesinin bağlam penceresi 200K+ token. Yeterince büyük görünse de, agent'lar uzun çalışmalarda kolayca dolu hale gelebilir.

Çözüm stratejileri:

| Strateji | Tetikleyici | Davranış |
|---------|-------------|----------|
| **Manuel `clear`** | Kullanıcı | Context sıfırlanır, dosya sistemi durumu korunur |
| **Auto-compaction** | `~80% doluluk` | Eski mesajlar özetlenir, yenileri korunur |
| **Sub-agent delege** | Agent kararı | Büyük araştırma sub-agent'ta yapılır, sadece özet ana context'e döner |
| **File system off-load** | Hook veya tool | Uzun tool çıktıları dosyaya yazılır, mesajda sadece path döner |

> **🏭 Production Note**
> Tariq: *"Ben Claude Code'u çoğu zaman compaction'a varmadan `/clear` ediyorum. Çünkü state zaten kod dosyalarında. Modelin tüm sohbet geçmişimi bilmesi gerekmiyor — `git diff`'i okuması yeterli."*
>
> Bu, **stateful agent ≠ stateful conversation** prensibinin somut uygulaması.

### 3.7 File access yaklaşımı

Anthropic'in agent felsefesinde dosya sistemi, **birinci sınıf state mekanizmasıdır**:

- Tool çıktıları → dosyaya
- Ara hesaplamalar → dosyaya
- Hatırlanması gereken bilgi → dosyaya
- Sub-agent sonuçları → dosyaya

Tariq'in tabiriyle: *"Tool çağrısının sonucunu her zaman dosyaya kaydet, tool'a sadece dosya yolunu döndür. Böylece agent kendi işini yeniden kontrol edebilir."*

Pratik pattern:

```typescript
// Anti-pattern: tool sonucu doğrudan context'e
const result = await searchEmails(query);  // 50KB JSON döner
return result;  // model 50KB token ödüyor

// Pattern: tool sonucu dosyaya
const result = await searchEmails(query);
const path = `.cache/emails-${Date.now()}.json`;
await fs.writeFile(path, JSON.stringify(result));
return `Saved ${result.length} emails to ${path}. Use Read or Grep to inspect.`;
```

### 3.8 Permissions sistemi — kim, neye, ne zaman izinli?

Claude Agent SDK'da izinler **üç eksen üzerinden** tanımlanır:

| Eksen | Örnek değer | Etki |
|------|-------------|------|
| **Tool listesi** | `allowedTools: ["Bash", "Read"]` | Sadece bunları kullanabilir |
| **Permission mode** | `default`, `acceptEdits`, `bypassPermissions`, `plan` | Onay nasıl alınır |
| **Hook gates** | PreToolUse decision | Programatik müdahale |

**Permission mode'ların detayı:**

- **`default`** — Her riskli işlem için kullanıcı onayı sorulur. Production safe default.
- **`acceptEdits`** — File edit'leri otomatik kabul edilir, ama Bash sorar. Hızlı prototype için.
- **`bypassPermissions`** — Hiç soru sormaz. Tehlikeli, sadece izolasyonlu sandbox'larda.
- **`plan`** — Önce plan üretir, kullanıcı plan'ı onaylar, sonra plan-only execute.

**Settings.json örneği:**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(git log:*)",
      "Read",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(curl * | sh)",
      "WebFetch"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(npm publish:*)"
    ]
  }
}
```

`allow` → otomatik geçer. `deny` → block edilir. `ask` → kullanıcıya sorulur.

### 3.9 Sub-agent runtime — paralel agent orkestrasyonu

Sub-agent, **ana agent'ın delegasyonla başlattığı, ayrı bir context window'da çalışan ikincil agent'tır.** Claude Agent SDK'da `Task` tool'u ile çağrılır:

```typescript
// Ana agent şunu yapar:
Task({
  subagent_type: "search-agent",
  description: "Find all relevant emails about Q4 budget",
  prompt: "Search emails from 2025-09-01 onwards mentioning 'Q4 budget'. Return a list of subject + sender + date."
})
```

Bu çağrıldığında:

1. SDK yeni bir context window oluşturur.
2. Sub-agent'ın system prompt'u + verilen prompt'u o context'e koyar.
3. Sub-agent kendi başına çalışır (kendi tool'larını çağırır).
4. Sub-agent text cevap döndürür.
5. O cevap, ana agent'ın context'inde `tool_result` olarak görünür.

**Faydaları:**

- Ana agent'ın context'i kirlenmez — sub-agent 50 e-posta okusa bile.
- Paralel çalıştırılabilir — 3 sub-agent aynı anda.
- İzole error scope — bir sub-agent hata verirse diğerleri devam eder.

**Pattern'lar:**

| Pattern | Kullanım |
|---------|---------|
| **Read sub-agent** | Çok dosya okuyup özet üretmek |
| **Search sub-agent** | Web/DB/API search yapıp filtrelemek |
| **Adversarial sub-agent** | Ana agent'ın çıktısını eleştirmek |
| **Specialized expert** | "Sen bir SQL uzmanısın, sadece SQL üret" |

### 3.10 Compaction — context'i sıkıştırma

Compaction, **eski mesajları özetleyip yerlerine kısa bir özet bırakma** işlemidir. Otomatik tetiklenir (~%80 doluluk).

Mekanizması:

```
Mesaj geçmişi (200K token):
  [user]:    initial prompt
  [agent]:   tool_use(...)
  [user]:    tool_result(...)  ← çok uzun
  [agent]:   tool_use(...)
  ... (200+ tur)
  [agent]:   tool_use(...)
  [user]:    current question

Compaction:
  [system]:  "Önceki konuşmanın özeti:
             - Kullanıcı X istedi
             - Agent A, B, C dosyalarını okudu
             - Sonuç olarak D'yi keşfetti
             - Mevcut durumda E işlemi yapılıyor"
  [user]:    current question
```

**Compaction trade-off'ları:**

- ✅ Context dolmadan devam edebilir
- ⚠️ Detay kaybı olur (özet, tam doğruluk değildir)
- ⚠️ Pahalı (özet üretmek için ekstra LLM çağrısı)

> **🏭 Production Note**
> Tariq compaction'a tercih ettiği yaklaşımı söylüyor: *"Ben Claude Code'da hiç compaction'a varmadım. Çünkü her major task tamamlandığında `/clear` yapıyorum. State zaten git'te ve dosyada — agent'ın geçmişi hatırlaması gerekmiyor."* Bu, "stateful agent, stateless conversation" prensibinin uygulaması.

---

## 4. Claude Code Nasıl Çalışıyor?

Bu bölüm, Claude Agent SDK'nın referans uygulaması olan Claude Code'un iç mekanizmasını anlatır. Çünkü SDK'yı anlamak, Claude Code'u anlamaktan geçer.

### 4.1 Terminal integration

Claude Code, **terminal-native** bir uygulamadır. Bu, web UI'lerden farklı önemli mimari sonuçlar doğurur:

| Boyut | Web chatbot | Claude Code |
|-------|-------------|-------------|
| Filesystem erişimi | Sandbox | Kullanıcının gerçek dosya sistemi |
| Komut çalıştırma | Sınırlı / yok | Tam Bash |
| State | Sunucu | Local repo |
| Authentication | Hesap tabanlı | API key + local |
| Latency | Network turu | Yerel + API |

Terminal entegrasyonu, agent'a **gerçek bir geliştirici ortamı** veriyor: `npm install`, `git commit`, `cargo build`, `docker compose up` — hepsi mümkün.

### 4.2 File editing

Claude Code'da dosya düzenleme üç tool'a ayrılmıştır:

| Tool | Kullanım | Neden ayrı? |
|------|---------|------------|
| **Read** | Dosya içeriğini okur, internal "read cache"e ekler | Edit/Write için zorunlu önkoşul |
| **Edit** | `old_string → new_string` deterministik değişiklik | Tüm dosyayı yeniden yazmaktan ucuz |
| **Write** | Tüm dosyayı baştan yazar | Yalnızca yeni dosyalar veya büyük rewrite için |

**Determinism kuralı:** Edit, `old_string` dosyada tam olarak bulunmalı ve **tek geçişte** olmalı. Yoksa harness hata fırlatır, model düzeltir.

> **🧠 Önemli İçgörü**
> Tariq: *"Claude Code'da bir kural var: bir dosyaya yazmadan önce mutlaka okumuş olman gerekiyor. Yazmaya kalkışırsan ve okumadıysan, sana hata veriyoruz. Bu deterministik bir verification adımı — model unutmuş bile olsa harness hatırlıyor."*
>
> Bu pattern, "deterministik kurallarla nondeterministik modeli kıskaca alma" yaklaşımının somut örneğidir.

### 4.3 Command execution

Claude Code'un Bash tool'u, **alt-process üzerinde çalışan tam bir kabuk değildir** — guard'lı bir wrapper'dır:

1. Komut alındığında **AST parse edilir**.
2. Tehlikeli pattern'lar (örn. `rm -rf /`, `curl | sh`, `sudo ...`) tespit edilir.
3. Kullanıcı izin politikasıyla karşılaştırılır.
4. İzin verilirse subprocess'te çalıştırılır.
5. Çıktı (stdout + stderr) yakalanır ve modele döner.

Bu AST parse, Tariq'in vurguladığı *"build it yourself zor"* problemlerden biri:

> *"Bash AST parser çok zahmetli bir iş. Onu kendi başına kurmak istemezsin. SDK içinde geliyor ve bizim için sürekli geliştiriyoruz."*

### 4.4 Planning mode

Claude Code'un "plan mode" özelliği, agent'ın bir görevi **henüz uygulamadan önce** adımları yazılı olarak sunmasını sağlar:

```
[Plan Mode]
1. src/auth.ts dosyasını oku
2. JWT validation fonksiyonunu güncelle
3. test/auth.test.ts'i çalıştır
4. Eğer testler geçerse commit at
```

Kullanıcı planı onayladıktan sonra, agent execute moduna geçer. Bu, **risky kod değişikliklerinde** insan-in-the-loop sağlar.

### 4.5 Agent loop

Claude Code'un agent loop'u, Bölüm 3.2'de gösterilen genel loop ile aynıdır. Önemli farkları:

1. **TodoWrite tool'unu agresif kullanır** — uzun görevlerde önce todo listesi oluşturur, sonra her adımı işaretler.
2. **Read-before-Write kuralı** — yukarıda anlatıldı.
3. **Multi-edit verification** — birden fazla dosyada değişiklik yaparken, son adım olarak bir `Bash(npm test)` veya `Bash(cargo check)` çalıştırması yapar.

### 4.6 Error recovery

Claude Code'un hata kurtarma mekanizması, **agent'a hata mesajını ham haliyle göstermek** üzerine kuruludur:

```
[user request]: "Bu testleri geçir."
[agent]: Bash(npm test)
[tool_result]: 
  FAIL src/auth.test.ts > validateToken
    Expected: "valid"
    Received: "invalid"
[agent]: "Test başarısız oldu. validateToken implementasyonuna bakayım."
        Read(src/auth.ts)
        Edit(src/auth.ts, ...)
        Bash(npm test)
[tool_result]: PASS (all tests)
```

Burada hiçbir özel "retry mekanizması" yok. Model, hatayı görüp düzeltebiliyor çünkü:

- Hata mesajı yapılandırılmış ve okunabilir.
- Modelin eğitim verisi içinde milyonlarca hata-mesajı-ve-çözüm örneği var.
- Tool'lar atomik, her tool çağrısı izole.

> **🛑 Yaygın Hata**
> Yeni başlayanlar tool sonuçlarını agresif şekilde temizliyor: "Hata mesajı çok uzun, kısaltayım." **Yapmayın.** Modelin hatayı düzeltebilmesi için ham çıktıyı görmesi gerek. Sadece çok büyük (> 50KB) çıktıları dosyaya kaydedin ve path döndürün.

### 4.7 Safety yaklaşımı

Claude Code'un güvenlik mimarisi **dört katmanlıdır** — Tariq bunu "İsviçre Peyniri Savunması" (Swiss Cheese Defense) olarak adlandırıyor:

```
┌─────────────────────────────────────────┐
│   Katman 1: Model alignment              │  ← Reward hacking yok
├─────────────────────────────────────────┤
│   Katman 2: Harness permissions          │  ← AST parse, allowed-tools listesi
├─────────────────────────────────────────┤
│   Katman 3: Sandbox (filesystem)         │  ← Yazma izinleri sınırlı klasörlere
├─────────────────────────────────────────┤
│   Katman 4: Sandbox (network)            │  ← Allow-list dışındaki istekler blocked
└─────────────────────────────────────────┘
```

Her katmanda delikler (=hatalar) olabilir; ama hepsinin delikleri aynı yerde olmaz — bu yüzden derinlemesine savunma.

**"Lethal Trifecta":** Bir agent'ın gerçekten tehlikeli olabilmesi için üç yetenek bir aradadır:

1. Kod çalıştırma yeteneği
2. Filesystem yazma yeteneği
3. Verileri dışarı çıkarma (exfiltration) yeteneği

Bu üçünden birini bile kesebilirseniz, en kötü senaryo büyük ölçüde sınırlanır. Sandbox network'ü kesmek, çoğu durumda en kolay ve en etkili savunmadır.

### 4.8 Hosting mimarileri — Claude Code'u nereye koymalı?

Bir agent uygulamasını production'a almak için **üç hosting paterni** vardır. Tariq atölyede her birinden bahsediyor.

#### Pattern 1: Yerel desktop uygulaması

```
Kullanıcı bilgisayarı
├── Agent process (Claude Code-style)
├── Local filesystem (kullanıcının dosyaları)
├── Network: kullanıcının ev/iş ağı
└── State: local disk
```

Avantajları:
- ✅ Filesystem doğrudan erişim
- ✅ Latency yok (network'ten sonra agent local)
- ✅ Kullanıcının özel dosyaları sunucuya gitmez

Dezavantajları:
- ❌ Multi-user değil
- ❌ Updates yönetimi karmaşık
- ❌ Cross-device sync yok

**Tipik kullanım:** Code editor entegrasyonları (Cursor, Windsurf, Claude Code CLI).

#### Pattern 2: Per-user sandbox (cloud)

```
Bulut altyapısı
├── User A → Sandbox A (container/VM)
├── User B → Sandbox B (container/VM)
└── User C → Sandbox C (container/VM)

Her sandbox:
├── Agent process
├── İzole filesystem
├── Sınırlı network
└── Auto-cleanup
```

Avantajları:
- ✅ Multi-user
- ✅ Server-side state
- ✅ Update tek noktadan
- ✅ İzolasyon güvenliği

Dezavantajları:
- ⚠️ Latency (network ↔ sandbox)
- ⚠️ Maliyet (sandbox başına compute)
- ⚠️ Karmaşık infra

**Sandbox provider'ları (Tariq'in saydıkları):**

- **Cloudflare** — Container-based, edge'e yakın.
- **Modal** — Python ağırlıklı, ML workload'lara optimize.
- **E2B** — Code execution sandbox'ı için optimize edilmiş.
- **Daytona** — Dev environment olarak konumlanıyor.

**Cloudflare örneği (Tariq'in atölyede gösterdiği basitlik):**

```typescript
import { Sandbox } from "@cloudflare/sandbox";

const sandbox = await Sandbox.start();
await sandbox.write("agent.ts", agentCode);
const result = await sandbox.run("bun agent.ts");
```

#### Pattern 3: Dev-server inside sandbox (Lovable pattern)

Tariq'in özellikle vurguladığı yenilikçi pattern:

```
Sandbox içinde:
├── Agent process
├── Live dev server (port :3000)
└── Source files (agent edit ediyor, dev server hot-reload)

Kullanıcı tarayıcısı:
└── Sandbox'ın port :3000'ine bağlanıyor (live UI)
```

Bu pattern'in mimari önemi:

- Agent **kendi UI'sini canlı olarak değiştirebiliyor.**
- Kullanıcı **anında görüyor.**
- Tek bir agent oturumunda hem backend hem frontend kod yazılabiliyor.

Lovable.dev, Cursor Composer, ve bazı yeni AI site builder'lar bu pattern'i kullanıyor.

> **🧠 Önemli İçgörü**
> Sandbox-içinde-dev-server pattern'i, "AI ile yazılım inşa etme" deneyimini fundamentally değiştiriyor. Çünkü artık agent için "kod yaz → derle → çalıştır → gör" döngüsü saniyeler içinde tamamlanıyor. Bu, agent'ın iterasyon hızını insan iterasyon hızıyla eşitliyor.

---

## 5. Workshop Boyunca Gösterilen Kodların Detaylı Açıklaması

Bu bölüm, atölyede gösterilen kod parçalarını (transkriptten yeniden inşa edilmiş) tek tek inceler. Konuşmacı her satırı açıklamadığı için bazı yerler **mühendislik çıkarımıdır** ve `// Çıkarım:` yorumuyla işaretlenmiştir.

### 5.1 PokéAPI TypeScript SDK (codegen ile üretilmiş)

İlk demo, Claude Code'a verilen tek bir prompt'un nasıl tam bir TypeScript kütüphanesi ürettiğini gösteriyor.

**Prompt (Tariq'in dediği):**
> *"PokéAPI'yi araştır ve onun için bir TypeScript SDK oluştur."*

**Üretilen SDK iskeleti:**

```typescript
// pokey-api-sdk/index.ts
export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  moves: PokemonMove[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: { url: string; name: string };
}

export interface PokemonType { slot: number; type: { name: string; url: string } }
export interface PokemonMove { move: { name: string; url: string } }
export interface PokemonStat { base_stat: number; stat: { name: string } }
export interface PokemonAbility { ability: { name: string }; is_hidden: boolean }

export class PokeApi {
  private base = "https://pokeapi.co/api/v2";

  async getByName(name: string): Promise<Pokemon> {
    const res = await fetch(`${this.base}/pokemon/${name.toLowerCase()}`);
    if (!res.ok) throw new Error(`Pokemon not found: ${name}`);
    return res.json();
  }

  async listPokemon(offset = 0, limit = 100): Promise<{
    count: number;
    results: { name: string; url: string }[];
  }> {
    const res = await fetch(`${this.base}/pokemon?offset=${offset}&limit=${limit}`);
    return res.json();
  }

  async getAllPokemon(): Promise<Pokemon[]> {
    const list = await this.listPokemon(0, 2000);
    return Promise.all(list.results.map(r => this.getByName(r.name)));
  }

  async getSpecies(name: string) {
    const res = await fetch(`${this.base}/pokemon-species/${name}`);
    return res.json();
  }

  async getAbility(name: string) {
    const res = await fetch(`${this.base}/ability/${name}`);
    return res.json();
  }

  async getMove(name: string) {
    const res = await fetch(`${this.base}/move/${name}`);
    return res.json();
  }
}

// Hızlı kullanım için singleton export
export const pokeApi = new PokeApi();
```

**Mühendislik gözlemleri:**

1. **Sınıf tabanlı API**, fonksiyon tabanlıdan iyi mi? Burada evet — çünkü gelecekte `base URL`, `cache`, `auth` gibi state ekleyebiliriz.
2. **`getAllPokemon`** Promise.all kullanıyor — paralel çağrı. Production'da rate-limit için `p-limit` veya benzeri gerekir. Tariq atölyede bunu görmezden geliyor çünkü demo.
3. **Hata yönetimi minimal** — yine demo kodu. Gerçek kullanımda retry + exponential backoff.
4. **Type-safe** — TypeScript modelin daha iyi kod üretmesine yardım ediyor. Bu Tariq'in *"agent için types iyi, çünkü generation'a yardımcı oluyor"* sözünün uygulaması.

### 5.2 CLAUDE.md — Agent için yönerge dosyası

Claude Agent SDK kullanıldığında, projenin kök dizinindeki `CLAUDE.md` dosyası agent'ın system prompt'una otomatik enjekte edilir.

**Pokémon agent için CLAUDE.md (yeniden inşa):**

```markdown
# Pokémon Agent

This project helps build competitive Pokémon teams using PokéAPI and Smogon data.

## Available APIs
- TypeScript SDK: `pokey-api-sdk/` (see `index.ts` for full surface).
  Import as: `import { pokeApi } from "../pokey-api-sdk";`

## Workflow rules
- Always write a script in `examples/` and run it with `bun run examples/<name>.ts`.
- Never call PokéAPI from the chat directly — always wrap in a script for reproducibility.
- Save large results (>2KB) to `.cache/` and reference by path.

## Data files
- `data/smogon.txt` — competitive metagame text dump.
- `data/teams.json` — user's saved teams.

## Verification
- After any team suggestion, run `bun run scripts/validate-team.ts` to check legality.
- If validation fails, fix the team and re-run.

## Style
- Use TypeScript, not JavaScript.
- Prefer small composable scripts over one giant file.
- Output suggestions as Markdown with type tables.
```

**Neden bu yapı?**

- **"Available APIs"** modele kütüphanenin nerede olduğunu söylüyor. Aksi halde model muhtemelen `fetch` ile doğrudan PokéAPI'ye çağrı yapar (Tariq demonstrasyonda bunu fark ediyor: *"bizim API'mizi kullanmamış, JavaScript yazmış"*).
- **"Workflow rules"** modelin "her seferinde script yaz" davranışını zorunlu kılıyor — bu hem reproducibility hem de verifiability getiriyor.
- **"Verification"** deterministik kontrol komutunu modelin yapması gerektiğini söylüyor.
- **"Style"** çıktı formatını standardize ediyor.

> **🏭 Production Note**
> CLAUDE.md'yi *küçük* tutun. 100-200 satır ideal. Modeli boğmayın. Eğer çok fazla bilgi varsa, "Available APIs" bölümünde sadece üst seviye linkler verin ve modele *"more detail in `docs/api.md`"* deyin. Lazy loading her zaman kazanır.

### 5.3 Tool-calling chat loop (`chat.ts`) — SDK kullanmadan

Tariq, "agent SDK olmadan" ve "agent SDK ile" karşılaştırması yapıyor. Önce SDK'sız versiyon:

```typescript
// chat.ts — Yalnızca Messages API ile tool calling
import Anthropic from "@anthropic-ai/sdk";
import { pokeApi } from "../pokey-api-sdk";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "get_pokemon",
    description: "Get full data for a single Pokémon by name.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Pokemon name, lowercase" }
      },
      required: ["name"]
    }
  },
  {
    name: "get_pokemon_species",
    description: "Get species data (evolution chain, egg groups, etc.)",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
  },
  {
    name: "get_pokemon_ability",
    description: "Get ability details by name.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
  },
  {
    name: "get_pokemon_type",
    description: "Get all Pokémon of a given type. Returns paginated list.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
  },
  {
    name: "get_move",
    description: "Get details for a single move (power, accuracy, etc.)",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
  }
];

async function executeTool(name: string, input: any): Promise<string> {
  switch (name) {
    case "get_pokemon":         return JSON.stringify(await pokeApi.getByName(input.name));
    case "get_pokemon_species": return JSON.stringify(await pokeApi.getSpecies(input.name));
    case "get_pokemon_ability": return JSON.stringify(await pokeApi.getAbility(input.name));
    case "get_pokemon_type":    return JSON.stringify(await fetch(`https://pokeapi.co/api/v2/type/${input.name}`).then(r => r.json()));
    case "get_move":            return JSON.stringify(await pokeApi.getMove(input.name));
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

async function chat() {
  const messages: Anthropic.MessageParam[] = [];

  // Stdin'den kullanıcı input'u oku
  const userInput = await readline("> ");
  messages.push({ role: "user", content: userInput });

  while (true) {
    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      tools,
      messages,
      system: "You are a helpful Pokémon expert. Use tools to look up data."
    });

    // Önemli: HER mesajı logla. Bu Tariq'in vurguladığı en kritik debug tekniği.
    console.log("[assistant]", JSON.stringify(resp.content, null, 2));

    messages.push({ role: "assistant", content: resp.content });

    if (resp.stop_reason === "end_turn") {
      // Model bitirdiğini söylüyor; kullanıcıdan bir sonraki input'u al
      const next = await readline("> ");
      messages.push({ role: "user", content: next });
      continue;
    }

    if (resp.stop_reason === "tool_use") {
      // Tool çağrılarını topla ve çalıştır
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of resp.content) {
        if (block.type === "tool_use") {
          console.log(`[tool_use] ${block.name}(${JSON.stringify(block.input)})`);
          const result = await executeTool(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    break;
  }
}

chat().catch(console.error);
```

**Bu kodun öğrettikleri:**

1. **Tool calling el ile yapıldığında bile zor değil** — yaklaşık 100 satır. Ama bu sadece **tek dosya, tek session, tek tool kategorisi**. Sub-agent eklediğinizde, hook eklediğinizde, paralel tool calling eklediğinizde, file editing eklediğinizde — bu sayı 1000'lere fırlar.
2. **Her mesajı loglamak şart.** `console.log(resp.content)` — bu Tariq'in *"transcript'i her seferinde oku"* kuralının kod karşılığı.
3. **Stop reason'ı manuel handle etmek zorundasınız.** `end_turn`, `tool_use`, `max_tokens`, `stop_sequence` — her birini.

### 5.4 Agent SDK versiyonu (`agent.ts`)

Aynı işlevsellik Agent SDK ile:

```typescript
// agent.ts — Claude Agent SDK kullanan versiyon (~60 satır)
import { query } from "@anthropic-ai/claude-agent-sdk";

const userQuery = process.argv.slice(2).join(" ")
  || "Tell me all generation 2 water Pokémon and suggest a team around Feraligatr.";

for await (const event of query({
  prompt: userQuery,
  options: {
    cwd: "./pokemon-agent",          // working directory
    allowedTools: [                  // izin verilen tool'lar
      "Bash",
      "Read",
      "Write",
      "Edit",
      "Grep",
      "Glob",
      "Task",                        // sub-agent için
    ],
    systemPrompt: {
      preset: "claude_code",         // Claude Code'un default system prompt'u
      append: "Focus on competitive Pokémon team building."
    },
    permissionMode: "acceptEdits",   // edit'leri otomatik kabul et
    maxTurns: 50,                    // güvenlik için
  }
})) {
  // Tüm event'leri logla
  switch (event.type) {
    case "assistant":
      for (const block of event.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`[tool] ${block.name}(${JSON.stringify(block.input).slice(0, 200)})`);
        }
      }
      break;
    case "user":
      // tool_result'lar burada gelir; isteyenlere detay
      break;
    case "result":
      console.log(`\n--- Done in ${event.duration_ms}ms, ${event.num_turns} turns ---`);
      break;
  }
}
```

**Karşılaştırma:**

| | `chat.ts` (raw API) | `agent.ts` (SDK) |
|---|---|---|
| Satır sayısı | ~100 | ~60 |
| Tool tanımları | Manuel JSON Schema | SDK varsayılan tool seti |
| File editing | Yok | Hazır (Read/Write/Edit) |
| Bash | Yok | Hazır |
| Sub-agents | Yok | `Task` ile hazır |
| Working directory | Yok | `cwd` ile |
| Compaction | Manuel | Otomatik |
| Permissions | Yok | İnce ayar mümkün |

> **🧠 Önemli İçgörü**
> SDK kullanarak yazdığınız kod kısa olduğu için yanıltıcı bir izlenim verebilir: *"Demek ki SDK basit şeyleri otomatize ediyor."* Hayır. SDK, **size sıfırdan inşa edilmesi haftalar sürecek bir runtime sunuyor** — Bash AST parser, sub-agent process orchestration, file system race condition çözümleri, hook engine, sandbox primitifleri. 60 satırlık `agent.ts` aslında 10,000 satırlık bir runtime'a delegasyondur.

### 5.5 Terminal çıktısı (canlı demo)

Demo sırasında Claude Code'un terminal output'u:

```
$ claude
> tell me all the generation 2 water pokemon

I'll help you find all generation 2 water-type Pokémon. Let me write a script to query the PokéAPI.

[Write] examples/gen2-water.ts
[Bash] bun run examples/gen2-water.ts

Output:
Querying generation 2...
Found 251 Pokémon in generation 2
Filtering by type: water
Result: 21 water-type Pokémon

Here are all 21 generation 2 water-type Pokémon:

Starters & evolutions:
- Totodile, Croconaw, Feraligatr

Fish line:
- Marill, Azumarill
- Wooper, Quagsire
- Remoraid, Octillery
- Mantine

Misc:
- Politoed (Poliwag line addition)
- Slowking (Slowpoke addition)
- Corsola
- Kingdra (Seadra evolution)
- Lanturn (Chinchou evolution)
- Qwilfish

(plus a few I might have missed — let me know if you want exact stats)
```

**Bu output'un dikkat çeken yönleri:**

1. **Agent script yazıp çalıştırıyor** — bu codegen pattern'i.
2. **Output formatı doğal** — kategorize edilmiş listeler.
3. **Self-correction** — son satırda *"bir kaçını atlamış olabilirim"* uyarısı. Model kendi belirsizliğini iletiyor.

### 5.6 Smogon takım önerisi — gerçek codegen örneği

Atölyenin ikinci canlı demosu, daha karmaşık bir görev: *"Venusaur etrafında bir takım öner."* Bu demoda agent bir text file'dan (Smogon competitive data) yararlanıyor.

**Demo akışı:**

```
[user]: "Smogon verisinden Venusaur etrafında bir takım önerebilir misin?"

[agent thinking]: "Önce data/smogon.txt'i okuyayım, Venusaur'u bulayım,
                   sonra teammate ve counter listesini çıkarayım..."

[Read] data/smogon.txt
[tool_result]: <çok uzun text dump, dosya 200KB>

[agent thinking]: "Dosya çok büyük. Grep ile direkt Venusaur'u arayayım."

[Grep] pattern="Venusaur" path="data/smogon.txt"
[tool_result]: 
  data/smogon.txt:1042: ### Venusaur
  data/smogon.txt:1140: Moves: Giga Drain / Sludge Bomb / Earth Power / Sleep Powder
  data/smogon.txt:1142: Common Teammates: Garchomp, Heatran, Rotom-Wash
  ...

[Write] examples/team-analyzer.ts
[Bash] bun run examples/team-analyzer.ts venusaur
[tool_result]:
  Analyzing Venusaur as anchor...
  Common teammates from Smogon meta:
  - Garchomp (mentioned 47 times)
  - Heatran (mentioned 31 times)
  - Rotom-Wash (mentioned 28 times)
  - Tyranitar (mentioned 22 times)
  - Latios (mentioned 18 times)

  Common counters:
  - Heatran (Fire weakness)
  - Talonflame (Flying + Fire)
  ...

[agent]: "İşte Venusaur etrafında önerebileceğim bir takım:

  1. **Venusaur** (Mega) — Special Attacker, anchor
     Moves: Giga Drain / Sludge Bomb / Earth Power / Sleep Powder
     Item: Venusaurite
     EVs: 252 SpA / 252 Spe / 4 HP

  2. **Heatran** — Special Attacker, Fire/Steel pivot
     ...

  Bu takım Venusaur'un Fire ve Flying zayıflıklarını Heatran ve Rotom-Wash
  ile kapatıyor. Garchomp Earthquake desteği veriyor. ..."
```

**Bu demonun mühendislik dersleri:**

1. **Agent büyük dosyaları akıllıca okuyor.** Dosyayı tam yüklemek yerine Grep ile spesifik bilgiyi çıkardı.
2. **Codegen pattern'i.** Script yazıp çalıştırarak veri analizi yaptı; sayım, filtreleme, sıralama hep script'te.
3. **Domain knowledge + data fusion.** Modelin Pokémon competitive bilgisi + Smogon verisindeki güncel meta = sentez cevap.
4. **Verifiability.** Script'i agent yazdığı için, kullanıcı isterse aynı script'i tekrar çalıştırıp aynı sonucu doğrulayabilir.

### 5.7 Code analiz — agent'ın 60 satır neden yetiyor?

Atölyenin en şaşırtıcı kısmı: *"Benim asıl agent dosyam 60 satır."* Bu nasıl mümkün?

Yanıt, SDK'nın yaptığı işleri saymakta saklı:

```
agent.ts (60 satır)
├── query() çağrısı                   → SDK delegasyonu
└── output handling                    → console.log

SDK'nın yaptıkları (kullanıcı görmez):
├── Anthropic API çağrıları
├── Tool dispatcher
├── Bash AST parser
├── Read/Write/Edit harness
├── Sub-agent process orchestration
├── Compaction otomatiği
├── Hook engine
├── Permission policy
├── Sandbox primitifleri
├── CLAUDE.md auto-loading
└── Error recovery loop
```

Tariq'in deyimiyle: *"React'in JSX'i ve bundler'ı zorunlu kılması başta annoying geliyordu ama sonunda web app'leri çok daha güçlü yaptı. Agent SDK da öyle — biraz annoying ama agent'lara büyük güç katıyor."*

Bu, **abstraction katmanlarının değeri** üzerine klasik bir mühendislik gözlemi: doğru abstraction, complex'i simple yapar.

---

## 6. Tool Calling Sistemi

### 6.1 Tool abstraction — neden var?

Tool calling, LLM'in dış dünyaya bağlandığı **standart bir protokoldür**. Üç avantajı:

1. **Yapılandırılmış** — model "JSON üret" diye eğitildiği için, tool çağrısı güvenilir parse edilebilir.
2. **İzole** — her tool çağrısı kendi başına bir transaction; bir tool hata verirse diğerleri etkilenmez.
3. **Composable** — birden fazla tool çağrısı sıralı veya paralel yapılabilir.

### 6.2 Tool schema — anatomi

Anthropic API'nin tool schema'sı:

```typescript
type Tool = {
  name: string;              // unique, snake_case, açıklayıcı
  description: string;       // model bunu okur; en kritik alan
  input_schema: JSONSchema;  // parametreler
}
```

**`description` alanı agent davranışını şekillendiren tek en önemli faktördür.** Modelin tool'u doğru kullanması için:

- Ne yaptığını **kesin** açıklayın.
- Ne zaman kullanılması **gerektiğini** açıklayın.
- Ne zaman **kullanılmaması gerektiğini** açıklayın.
- Örnek output formatını verin (kısa).

**Kötü description:**
```
"get user data"
```

**İyi description:**
```
"Fetch user profile data including subscription tier, last login, and feature flags.
Use ONLY when you need user-specific information; do NOT use to list users (use list_users instead).
Returns JSON with fields: id, email, tier, last_login_iso, flags (object)."
```

### 6.3 Function calling — döngünün anatomisi

Bir tool call session'ının tam life-cycle'ı:

```
1. Kullanıcı: "user@x.com'un subscription tier'ı nedir?"
2. Model thinking: "kullanıcı bilgisi lazım, get_user_data kullanayım"
3. Model output: tool_use { name: "get_user_data", input: { email: "user@x.com" } }
4. Harness: get_user_data fonksiyonunu çağırır
5. Tool: { tier: "premium", last_login: "...", flags: {...} }
6. Harness: tool_result { content: JSON.stringify(...) } olarak modele döner
7. Model thinking: "premium tier, kullanıcıya söyleyeyim"
8. Model output: text("Bu kullanıcı premium tier'ında.")
```

### 6.4 External APIs — agent'a nasıl bağlanır?

İki yaklaşım:

**Yaklaşım A: Tool olarak sarmala**

```typescript
const tools = [{
  name: "get_weather",
  description: "Get current weather for a city.",
  input_schema: {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"]
  }
}];
```

Avantaj: yapılandırılmış, kontrollü, audit-friendly.
Dezavantaj: her endpoint için bir tool yazmak gerek, model 50 tool arasında boğulabilir.

**Yaklaşım B: SDK + Bash kombinasyonu (Anthropic önerisi)**

```typescript
// CLAUDE.md
## Weather API
- See `weather-sdk/index.ts` for available functions.
- Run via: `bun run scripts/weather.ts <city>`
```

```typescript
// scripts/weather.ts
import { weather } from "../weather-sdk";
const city = process.argv[2];
console.log(JSON.stringify(await weather.get(city), null, 2));
```

Avantaj: composability — agent `bun run scripts/weather.ts paris | jq .temperature` yapabilir.
Dezavantaj: discovery time + her run'da subprocess overhead.

> **🧠 Önemli İçgörü**
> Tariq'in temel mesajı: *"Tool sayısı arttıkça context kirleniyor ve model şaşırıyor. SDK + Bash yaklaşımıyla 5 tool ile sınırsız yetenek elde edebilirsin."*

### 6.5 Bash tools — "Bash all you need"

Anthropic'in en güçlü iddiası: **"Bash is all you need."** Yani neredeyse her dış sistemi Bash üzerinden çağırabilirsiniz.

**Nedenleri:**

1. **Composability** — Pipe'lar (`grep`, `jq`, `awk`, `xargs`) bir tool zincirini tek satırda yapar.
2. **Discovery** — `<command> --help` her CLI'nin standart pattern'i. Model bunu kullanır.
3. **Mevcut software** — `ffmpeg`, `jq`, `imagemagick`, `gh`, `kubectl`, `terraform` — hepsi zaten yüklü.
4. **Token efficiency** — Tool tanımları context tüketmez; Bash tek bir tool tanımıyla sınırsız komut.

**Bash'i ilk "code mode" olarak görme:**

> *"Code mode" — modelin Python/JS/Bash gibi bir dilde kod yazıp çalıştırması. Bash buna 50 yıl önce başladı."* — Tariq

**Pratik örnek: E-posta arama agent'ı**

| Yaklaşım | Akış |
|---------|------|
| **Saf tool calling** | `search_emails("uber OR lyft")` → 100 e-posta JSON → model 100 e-postayı tek tek tarayıp toplam çıkarmaya çalışır → hata olasılığı yüksek |
| **Bash + script** | `bash gmail-search.sh "uber OR lyft" > .cache/results.json` → `bash extract-prices.sh .cache/results.json > .cache/prices.txt` → `bash sum.sh .cache/prices.txt` → her adım izole, verifiable, ucuz |

### 6.6 File tools — yapı taşları

Standart file tools:

| Tool | Davranış | Yan etki |
|------|---------|----------|
| `Read(path, offset?, limit?)` | Dosya içeriğini döner | Read cache'e ekler (Edit/Write için zorunlu) |
| `Write(path, content)` | Dosya oluşturur veya overwrite eder | Önce Read edilmiş olmalı (mevcut dosya) |
| `Edit(path, old, new, replaceAll?)` | Deterministik replace | Read cache'de olmalı |
| `Grep(pattern, path?, type?)` | Ripgrep wrapper | None |
| `Glob(pattern)` | Path matcher | None |
| `MultiEdit(path, edits[])` | Tek dosyada çoklu edit | Atomic — biri başarısızsa hiçbiri uygulanmaz |

**Read-before-Write kuralı neden var?**

Çünkü model dosyanın güncel halini bilmeden Edit yaparsa:
- "Stale" diff üretir (mevcut olmayan eski içeriği değiştirmeye çalışır)
- Aynı dosyayı iki Edit ile tutarsız hale getirebilir

Read cache zorunlu olunca, model "ne yaptığını" bildiğinden emin oluyoruz.

### 6.7 Custom tools — ne zaman ve nasıl?

**Ne zaman custom tool yazılır?**

| Senaryo | Çözüm |
|---------|-------|
| Domain-specific, atomic, irreversible eylem (e.g., `send_email`, `charge_card`) | Custom tool |
| Yapılandırılmış data sorgusu, sık tekrar eden | Custom tool |
| Veri analizi, transformasyon | Bash + script |
| API explorasyonu | Bash + script |
| Composability gereken iş (sırayla 5+ API çağrısı) | Bash + script |

**Anthropic SDK'sında custom tool ekleme örneği:**

```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";

const sendEmail = tool({
  name: "send_email",
  description: "Send an email. Irreversible — user must confirm before calling.",
  input_schema: {
    type: "object",
    properties: {
      to: { type: "string", format: "email" },
      subject: { type: "string" },
      body: { type: "string" }
    },
    required: ["to", "subject", "body"]
  },
  execute: async ({ to, subject, body }) => {
    const response = await emailClient.send({ to, subject, body });
    return `Email sent. Message ID: ${response.id}`;
  }
});

// query'ye ekleme
for await (const event of query({
  prompt: "...",
  options: { tools: [sendEmail], allowedTools: [...defaultTools, "send_email"] }
})) { ... }
```

### 6.8 Error handling — agent'ı hata karşısında dayanıklı kılmak

**Pattern 1: Hata mesajını ham döndür**

```typescript
async execute({ ... }) {
  try {
    return await doStuff();
  } catch (e) {
    return `ERROR: ${e.message}\nStack: ${e.stack}`;
    // is_error: true flag'i ekle
  }
}
```

**Pattern 2: Hata + öneri**

```typescript
return `ERROR: User not found.
Did you mean one of these similar users?
- alice@x.com
- alex@x.com
Try get_user_data with the corrected email.`;
```

**Pattern 3: Hata + restart**

Ağır hatalarda (örn. DB bağlantısı kopmuş), tool tüm session'ı sonlandırma sinyali verebilir. Bunu SDK düzeyinde "is_error: true" + agent'ın bu mesajı görüp pivot etmesi sağlar.

> **🛑 Yaygın Hata**
> Hata mesajlarını "kullanıcı dostu" hale getirmek için cleansing yapmak. Model için **stack trace + variable values + line numbers** altın değerinde. Kullanıcıya göstereceğin hata mesajıyla model'e döneceğin hata mesajını **karıştırmayın.**

---

## 7. Context Engineering ve Prompt Engineering

### 7.1 CLAUDE.md sistemi — projeye özel agent yönergeleri

`CLAUDE.md`, agent SDK ve Claude Code için **proje-seviyesi system prompt eklemesidir.** Working directory'de bulunur, her oturumda otomatik okunur.

**Hiyerarşi:**

```
~/.claude/CLAUDE.md          ← Kullanıcı seviyesi (tüm projeler)
        ↓
project_root/CLAUDE.md        ← Proje seviyesi
        ↓
subdir/CLAUDE.md              ← Alt-dizin seviyesi (opsiyonel)
        ↓
.claude/settings.json          ← Permissions, hooks vb.
```

Her seviye bir öncekine **eklenir**. Çatışma durumunda en yakın olan kazanır.

**İyi bir CLAUDE.md'nin yapısı:**

```markdown
# Project Name

Brief 1-2 sentence description.

## Architecture / Stack
- Languages, frameworks, key libraries.

## File layout
- `src/` — main code
- `tests/` — tests
- `docs/` — documentation

## Build & test commands
- Install: `npm install`
- Test: `npm test`
- Lint: `npm run lint`
- Dev server: `npm run dev`

## Coding conventions
- Style, formatter, naming rules.

## Things to avoid
- Don't use library X (deprecated).
- Don't push to main directly.

## Verification
- Always run `npm test` after edits.
- Always run `npm run lint` before commit.
```

> **🏭 Production Note**
> **CLAUDE.md token bütçesini gözetin.** Çok uzun olursa her çağrıda fazladan token ödersiniz ve model context'i kirlenir. Hedef: 100-300 satır arası. Detayları `docs/` klasörüne taşıyın ve modele *"daha fazla detay için `docs/x.md`'i oku"* deyin.

### 7.2 Instruction hierarchy — kuralların önceliği

Agent SDK'da kurallar şu sırayla uygulanır (yüksekten alçağa öncelik):

1. **Hard-coded harness rules** — örn. "Read'siz Write yapamazsın". Bunlar değiştirilemez.
2. **System prompt** — Anthropic'in default'u + SDK'nın eklemeleri.
3. **CLAUDE.md** (en yakın → en uzak).
4. **Skill metadata** (aktif skill'lerin frontmatter'ları).
5. **Hooks** (deterministik müdahaleler).
6. **Kullanıcı mesajı**.

Bu hiyerarşi, **güvenlik kritik kuralların kullanıcı tarafından override edilememesini** sağlar.

### 7.3 Long-context management

200K token bağlam büyük görünür ama bir agent oturumu:

- 10 dosya okuması = ~10K-30K token
- 5 büyük tool çıktısı = ~5K-50K token
- Düşünce + cevaplar = ~10K-30K token

Hızla dolar. Çözümler:

| Strateji | Ne zaman | Nasıl |
|---------|---------|------|
| **Lazy loading** | Her zaman | Bilgiyi dosyada tut, agent okusun |
| **Off-load to file** | Tool > 2KB üretiyorsa | Tool sonucunu dosyaya yaz, path döndür |
| **Sub-agent** | Detaylı araştırma | Task tool'u ile delege et |
| **Compaction** | %80 doluluk | SDK otomatik özetler |
| **Manuel clear** | Görev tamamen değişti | `/clear` (Claude Code) veya yeni session |

### 7.4 Memory optimization

Memory ≠ context. Memory **oturumlar arası** kalan bilgidir.

**Filesystem-tabanlı memory pattern'i:**

```
project/
├── memory/
│   ├── USER_PROFILE.md       ← Kullanıcının tercihleri
│   ├── PROJECT_GLOSSARY.md   ← Bu projeye özel terimler
│   ├── PAST_DECISIONS.md     ← Daha önce alınmış kararlar
│   └── KNOWN_ISSUES.md       ← Bilinen sorunlar
├── CLAUDE.md                 ← memory/ klasörünü işaret eder
└── src/
```

CLAUDE.md'de:

```markdown
## Memory
Before answering, check:
- `memory/USER_PROFILE.md` for user preferences
- `memory/PAST_DECISIONS.md` for prior architectural decisions

When you learn something new about the user, save it to the appropriate memory file.
```

### 7.5 Agent steering — modeli yönlendirme

Modeli istediğiniz davranışa yönlendirmenin pratik teknikleri:

| Teknik | Örnek |
|--------|-------|
| **Pozitif örnekleme** | "Bu agent şuna benzer: ..." (örnekle göster) |
| **Negatif örnekleme** | "Şu davranışları YAPMA: ..." |
| **Verification command'i** | "Her görev sonunda `npm test` çalıştır" |
| **Format örneği** | "Output şu yapıda olmalı: ```yaml\n...\n```" |
| **Tone** | "Kısa, doğrudan yan, kod örnekleriyle açıkla." |

### 7.6 Constraint systems — agent'ı sınırlamak

Constraint = "agent'ın yapamayacağı şey."

| Constraint tipi | Mekanizma |
|----------------|-----------|
| Tool izni | `allowedTools` listesi |
| Dosya yazma izni | `permissionMode` + working directory |
| Bash komut izni | `.claude/settings.json`'da regex pattern'lar |
| Network izni | Sandbox provider seviyesinde |
| Token bütçesi | `maxTurns`, `maxTokens` parametreleri |
| İçerik kuralı | Hook ile PreToolUse kontrolü |

**Örnek: Sadece okuma izni veren konfigürasyon**

```typescript
options: {
  allowedTools: ["Read", "Grep", "Glob", "Bash"],
  permissionMode: "default",  // her edit/write için sor
  // Custom hook ile Bash'i read-only komutlara kısıtla
  hooks: {
    PreToolUse: [{
      matcher: "Bash",
      hooks: [{ type: "command", command: ".claude/hooks/block-writes.sh" }]
    }]
  }
}
```

`.claude/hooks/block-writes.sh`:

```bash
#!/usr/bin/env bash
# stdin'den hook input'unu oku
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')

# Yazma komutlarını block et
if echo "$cmd" | grep -qE '^(rm|mv|>|tee|cp|mkdir|touch|rmdir)'; then
  jq -n --arg reason "Block: write command attempted" \
    '{ permissionDecision: "deny", permissionDecisionReason: $reason }'
  exit 0
fi

# Diğerlerini geçir
exit 0
```

### 7.7 Skills — yeniden kullanılabilir uzmanlık paketleri

**Skills**, Anthropic'in atölyeden kısa süre önce duyurduğu yeni bir bağlam yönetim mekanizmasıdır. Bir skill = **bir klasör**:

```
skills/
└── frontend-design/
    ├── SKILL.md             ← yönerge ve when-to-use
    ├── examples/
    │   ├── login-page.tsx
    │   └── dashboard.tsx
    └── reference/
        ├── color-palette.md
        └── typography.md
```

**SKILL.md formatı:**

```yaml
---
name: frontend-design
description: |
  Modern, high-quality frontend design pattern'leri. Login, dashboard,
  landing page gibi component tasarlarken kullan. AI-jenerik görünümden
  kaçınmak için bu skill'i mutlaka oku.
---

# Frontend Design

Bu skill, üst-üreten AI front-end mühendisinin tasarım ilkelerini içerir.

## Design ilkeleri
1. ...
2. ...

## Component pattern'leri
- Login form: examples/login-page.tsx (referans)
- Dashboard: examples/dashboard.tsx
...

## Referans
- Color palette: reference/color-palette.md
- Typography: reference/typography.md
```

**Skills nasıl çalışır?**

1. Agent başladığında, **sadece skill metadata** (name + description) okur.
2. Bir görev geldiğinde, agent description'lara bakıp ilgili skill'i seçer.
3. Seçilen skill'in **tam içeriğini** okur (SKILL.md + referans dosyalar).
4. Skill yönergelerine göre görevi yapar.

Bu, **progressive context disclosure** pattern'inin uygulamasıdır: bilgiyi sadece ihtiyaç anında yükle.

**Skill vs CLAUDE.md vs Tool karşılaştırması:**

| Boyut | CLAUDE.md | Skill | Tool |
|-------|-----------|-------|------|
| Yükleme | Her oturum başında otomatik | İhtiyaç anında manuel | Her zaman context'te |
| Boyut | Küçük tutmalı | Sınırsız (lazy load) | Sınırlı (description) |
| Kullanım sıklığı | Sürekli | Spesifik task'larda | Spesifik action'larda |
| İçerik tipi | Genel rule'lar | Domain uzmanlığı | Atomic action |

> **🏭 Production Note**
> Anthropic'in iç ekibi `frontend-design`, `docx-creation` gibi skill'leri kullanıyor. Tariq'in özellikle vurguladığı: *"Frontend-design skill'i çok iyi çünkü Anthropic'in en iyi AI front-end mühendisi düşünüp yazdı. Bir formdaki tüm best practice'leri tek bir prompt'a sığdırdı."*
>
> Skill'ler = "bir uzmanın kafasındaki bilgiyi paketleyip dağıtma" mekanizması.

### 7.8 Hooks — deterministik müdahale noktaları

Hook = **tool çağrısı öncesinde/sonrasında çalışan, kullanıcı tarafından tanımlanan bir script.**

Hook event'leri:

| Event | Ne zaman fires | Kullanım |
|-------|---------------|---------|
| **PreToolUse** | Tool execute edilmeden önce | Validation, permission, modification |
| **PostToolUse** | Tool execute edildikten sonra | Sonuç işleme, logging, side effects |
| **UserPromptSubmit** | Kullanıcı mesaj gönderdiğinde | Pre-processing, context enrichment |
| **Stop** | Agent oturumu bitirmeye hazırlandığında | Final validation, save state |

**Hook input/output formatı:**

```json
// Hook stdin'den şunu alır:
{
  "session_id": "...",
  "tool_name": "Bash",
  "tool_input": { "command": "rm important.txt" }
}

// Hook stdout'a şunu yazar:
{
  "permissionDecision": "deny",
  "permissionDecisionReason": "Destructive: rm command on important file"
}
```

**Pratik hook kullanım örnekleri:**

**Örnek 1: Test çalıştırma hook'u**

```bash
#!/usr/bin/env bash
# .claude/hooks/post-edit-test.sh
# Her Edit'ten sonra test çalıştır

input=$(cat)
tool=$(echo "$input" | jq -r '.tool_name')

if [ "$tool" = "Edit" ] || [ "$tool" = "MultiEdit" ]; then
  # Test çalıştır, sonuç model'e geri verilecek
  if ! npm test 2>&1 | tail -50 > /tmp/test-output.txt; then
    jq -n --arg out "$(cat /tmp/test-output.txt)" \
      '{ continueExecution: false, message: "Tests failed:\n\($out)" }'
    exit 0
  fi
fi

# Test passed (veya Edit değil) — devam
exit 0
```

Bu hook tetiklendiğinde, agent kendisi düşünür: *"Test düştü, hatayı düzelteyim."*

**Örnek 2: Live context injection**

```bash
#!/usr/bin/env bash
# .claude/hooks/inject-spreadsheet-state.sh
# Her tool call'dan önce, kullanıcının spreadsheet'inin durumunu enjekte et

input=$(cat)
tool=$(echo "$input" | jq -r '.tool_name')

# Kullanıcının yeni değişiklikleri var mı?
if [ -f "/tmp/user-changes.json" ]; then
  changes=$(cat /tmp/user-changes.json)
  jq -n --arg c "$changes" \
    '{ contextInjection: "USER CHANGED SPREADSHEET: \($c)" }'
  > /tmp/user-changes.json  # consume
fi

exit 0
```

Bu pattern, real-time multi-user spreadsheet'lerde agent'ı senkronize tutmak için kullanılır.

**Örnek 3: Cost cap**

```bash
#!/usr/bin/env bash
# .claude/hooks/cost-cap.sh
# Oturum başı maliyeti $5'i geçtiyse durdur

input=$(cat)
session_id=$(echo "$input" | jq -r '.session_id')
log_file=".logs/cost-${session_id}.txt"

cost=$(cat "$log_file" 2>/dev/null || echo "0")
if (( $(echo "$cost > 5.0" | bc -l) )); then
  jq -n '{ permissionDecision: "deny", permissionDecisionReason: "Cost cap reached" }'
  exit 0
fi

exit 0
```

> **🧠 Önemli İçgörü**
> Tariq'in vurguladığı kritik nokta: *"Hook'lar prompt mühendisliği değil, deterministik garantilerdir. 'Test çalıştırmayı unutma' diye prompt'ta yazarsanız, model %95 hatırlar. Hook ile zorunlu kılarsanız %100."*
>
> Soft constraint (prompt) vs hard constraint (hook) arasındaki bu fark, production reliability için temel bir kuralı verir: **kritik invariant'lar için hook kullan**.

---

## 8. Gerçek Agent Tasarımı

### 8.1 Reliable agents — güvenilir agent tasarımı

Güvenilir agent = **predictable behavior + recoverable failure**.

İki temel teknik:

**1. Deterministik kontrol noktaları**

Her N adımda bir, agent **deterministik bir doğrulama** yapar:

```
[Eylem] → [Eylem] → [Eylem] → [Doğrulama: npm test] → [Eylem] → [Eylem] → [Doğrulama]
```

**2. Idempotent eylem**

Aynı eylemin iki kez yapılması zarar vermemeli:

```typescript
// Idempotent değil:
await fs.appendFile("log.txt", "entry\n");

// Idempotent:
const entries = new Set(await readEntries("log.txt"));
if (!entries.has(newEntry)) await fs.appendFile("log.txt", newEntry + "\n");
```

### 8.2 Retry patterns

Agent'lar zaten "kendi kendine retry" yapar (hata gördüklerinde düzeltirler). Ama explicit retry'ler de gerekebilir:

**Pattern 1: Tool-level retry**

```typescript
async function withRetry<T>(fn: () => Promise<T>, n = 3): Promise<T> {
  for (let i = 0; i < n; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === n - 1) throw e;
      await sleep(2 ** i * 1000);
    }
  }
  throw new Error("unreachable");
}
```

**Pattern 2: Agent-level retry**

Eğer agent çıktısı belirli bir validation'ı geçmezse, "tekrar dene + neden başarısız olduğu" mesajı ile yeni bir oturum açılır.

### 8.3 Guardrails — güvenlik bariyerleri

Bir agent guardrail'i 3 yerde uygulanır:

| Yer | Mekanizma | Örnek |
|-----|-----------|------|
| **Tool tanımında** | Schema validation | "Email zorunlu, formatlı olmalı" |
| **PreToolUse hook'unda** | Custom validation | "Production DB'ye yazma izni yok" |
| **Sistem prompt'ta** | Davranışsal yönerge | "Asla `rm -rf` çalıştırma" |

> **🧠 Önemli İçgörü**
> Tariq'in vurguladığı kural: *"Soft constraint olan sistem prompt'a güvenmeyin. Eğer bir şeyin **kesin** olmamasını istiyorsanız, hook ile block edin. Model yine de denerse hata alır ve çıkar."*

### 8.4 Hallucination prevention

Hallucination (uydurma cevap) için klasik teknikler:

| Teknik | Pratik uygulama |
|--------|----------------|
| **Grounding** | Agent'ı dosyalara/araçlara bağla; "Bilmediğini sorma, kontrol et." |
| **Citation** | "Her cümlede kaynağı göster: file:line veya URL." |
| **Verification step** | Her cevaptan sonra deterministik kontrol. |
| **Adversarial sub-agent** | İkinci agent ana agent'ı sorguya çeker. |

### 8.5 Validation — çıktıyı kontrol etmek

Üç katmanlı validation:

```
Tool-level validation (schema)
    ↓
Domain-level validation (custom logic)
    ↓
Output-level validation (final answer check)
```

**Pratik örnek:** Pokémon takımı doğrulama

```typescript
function validateTeam(team: Pokemon[]): ValidationResult {
  if (team.length !== 6) return { ok: false, reason: "Takım 6 Pokémon olmalı" };

  const names = new Set(team.map(p => p.name));
  if (names.size !== 6) return { ok: false, reason: "Aynı Pokémon iki kez olamaz" };

  const totalLevel = team.reduce((sum, p) => sum + p.level, 0);
  if (totalLevel > 600) return { ok: false, reason: "Toplam seviye 600'ü geçemez" };

  return { ok: true };
}
```

Hook olarak çağrılırsa, agent invalid bir takım önerdiğinde hata alır ve düzeltir.

### 8.6 Planning strategies — agent'a plan yaptırma

**Strateji 1: Implicit planning (özel araç gerekmez)**

Sistem prompt'ta: *"Görevi yapmadan önce, atacağın adımları kısaca özetle."*

**Strateji 2: TodoWrite (Anthropic SDK)**

```typescript
// Agent kendi yazar
TodoWrite([
  { subject: "Read package.json", status: "pending" },
  { subject: "Identify dependency conflict", status: "pending" },
  { subject: "Run npm install --legacy-peer-deps", status: "pending" },
  { subject: "Verify with npm test", status: "pending" }
])
```

Her adım tamamlandıkça `status: "completed"` olarak update edilir. Kullanıcı bunu görsel olarak görür.

**Strateji 3: Explicit plan mode (Claude Code)**

Kullanıcı `/plan` der; agent uygulamadan önce sadece plan oluşturur. Kullanıcı onaylar, sonra execute.

### 8.7 State handling — durum yönetimi

İki tür state:

| State tipi | Lokasyon | Yönetim |
|-----------|----------|---------|
| **Conversation state** | Mesaj geçmişi | SDK otomatik |
| **External state** | Filesystem, DB, network | Geliştirici sorumluluğu |

**Anti-pattern:** State'i sadece conversation'da tutmak.

**Pattern:** State'i filesystem'de tutup, agent'a "her başlangıçta `state.json` oku" demek.

```markdown
# CLAUDE.md
## State management
- Current session state in `.claude/state.json`.
- On startup, run: `cat .claude/state.json`
- After significant changes, update `.claude/state.json`.
```

### 8.8 Reversibility — geri alınabilirlik

> *"Agent'lar için en iyi problem domain'leri, state'in geri alınabildiği yerlerdir."* — Tariq

| Domain | Reversibility | Agent uygunluğu |
|--------|--------------|----------------|
| Code yazma | Yüksek (git) | ⭐⭐⭐⭐⭐ |
| Veri analizi | Yüksek (re-run) | ⭐⭐⭐⭐⭐ |
| E-posta gönderme | Düşük (gönderildi mi gitti) | ⭐⭐ |
| Computer use (UI tıklama) | Çok düşük | ⭐⭐ |
| Database write | Orta (transaction + rollback) | ⭐⭐⭐ |
| Fiziksel dünya | Sıfır | ⭐ |

**Tasarım kuralı:** Mümkünse problemi reversible bir state machine'e çevirin. Örn. "Spreadsheet'i değiştirmeden önce snapshot al, hata olursa rollback."

### 8.9 Agentic search interface tasarımı — verinin agent için "in-distribution" hale getirilmesi

Atölyenin en derin teknik tartışmalarından biri: bir agent **bir spreadsheet'te nasıl arama yapar?** Soruya verilen yanıtlar, agent için arayüz tasarlamak konusunda kapsamlı bir framework ortaya koyuyor.

**Soru:** Agent'a *"2026 yılı geliri nedir?"* dediğinizde ne yapacak?

**Kötü çözüm:** Tüm spreadsheet'i context'e yükle. → Token bombası, ayrıca multi-sheet'lerde imkânsız.

**İyi çözümler (Tariq'in atölyede topladığı seçenekler):**

| Yaklaşım | Mekanizma | Avantaj | Dezavantaj |
|---------|-----------|---------|-----------|
| **Header okuma** | Önce sadece sütun başlıklarını oku, sonra ilgili sütunu | Düşük token, basit | Multi-dimensional sorularda zayıf |
| **`grep`/`awk`** | Bash ile text-based search | Hızlı, kompozisyonel | Yapısal anlam zayıf |
| **Google Sheets API** | Cloud API çağrısı | Yapısal, hesaplama destekli | Local sheets için işe yaramaz |
| **SQLite üzerinden** | CSV → SQLite → SQL query | **Model SQL'i çok iyi biliyor** | Pre-processing gerektirir |
| **XLSX = XML** | xlsx'in iç yapısı XML, xpath ile sorgula | Yapılı | Karmaşık |
| **Range syntax (B3:B5)** | Spreadsheet'in kendi formül diline yakın | In-distribution | Custom parser gerekir |
| **Metadata enrichment** | Pre-processing'le sayfaya açıklayıcı KPI'lar ekle | Akıllı arama | Bir kerelik investment |

**Tariq'in "agentic search interface" prensibi:**

> *"Eğer veri kaynağını agent'ın çok iyi tanıdığı bir formata çevirebilirseniz, agent o veriyi nasıl arayacağını **zaten biliyor**. Yani sizin işiniz: 'in-distribution' hale getirmek."*

Bu prensibin uygulamaları:

| Veri kaynağı | "In-distribution" çevirisi |
|--------------|---------------------------|
| CSV | SQLite + SQL |
| XLSX | SQLite veya XML |
| Custom binary protocol | JSON gateway |
| Legacy COBOL data | CSV export → SQL |
| Domain-specific format | Markdown table |

**Pratik örnek: PokéAPI custom protocol** — Tariq atölyede bu sebepten **PokéAPI'yi seçti**. Çünkü:
- Internet'te bilinmeyen bir API (out-of-distribution)
- Ama JSON/REST (in-distribution surface)
- Codegen ile TypeScript SDK (in-distribution wrapper)
- CLAUDE.md ile usage docs (in-distribution context)

Sonuç: agent, PokéAPI'yi sanki "her zaman bildiği bir API" gibi kullanabildi.

### 8.10 Çoklu-agent ve dağıtık state

Atölyede "agent'lar arası iletişim" sorusu sorulduğunda Tariq önemli bir görüş paylaşıyor:

> *"Yeni bir 'agent iletişim protokolü' icat etmemize gerek yok. Agent'lar zaten HTTP'yi, named pipe'ları, file system'i, bash'i biliyor. Bunları kullansınlar."*

Bu, modern ML community'sinde popüler olan "agent-to-agent protocol" trendine karşı **anti-pattern**.

**Anthropic'in önerdiği pattern'lar:**

1. **HTTP server-client** — agent'lar birbirine REST endpoint olarak görür.
2. **Named pipe / Unix socket** — local IPC.
3. **Shared filesystem** — bir agent yazar, diğer okur.
4. **Pub/sub via Redis** — eğer scale gerekiyorsa.
5. **Virtual forum** — agent'lar bir forum'a post atar, başkaları cevap verir.

> **🧠 Önemli İçgörü**
> "Ortak forum" pattern'i şaşırtıcı şekilde etkili. Çünkü post + reply yapısı her LLM'in çok iyi tanıdığı bir şey (StackOverflow, Reddit, Discord). Custom RPC protokolünden çok daha "in-distribution."

### 8.11 Stateful UI / dinamik arayüz — kullanıcı bazlı arayüz

Atölyenin sonlarında Tariq, **kullanıcıya özel UI üretme** pattern'inden bahsediyor:

```
Agent (sandbox içinde)
  ├── Anlam: kullanıcının ne yaptığını anla
  ├── Edit: src/UserDashboard.tsx
  └── Run: bun dev (port 3000)

User browser → port 3000 (live UI)
  ├── Bir kullanıcı: takım kurma arayüzü görür
  ├── Başka kullanıcı: oyun arayüzü görür
  └── Üçüncü kullanıcı: galeri arayüzü görür
```

Bu pattern'in arkasındaki fikir: **UI artık statik bir asset değil, bir agent output'u.**

Tariq'in örneği: *"Pokémon agent'ım için bazı kullanıcılar takım kurmak istiyor, bazıları oyunda yardım, bazıları sadece resim. Agent her bir kullanıcının session'ında kendi sandbox'ında çalıştığı için, UI'yi gerçek zamanlı uyarlayabilir."*

Bu, **Lovable-style** mimarinin agent SDK'nın üstünde nasıl inşa edileceğini gösterir.

---

## 9. Workshop'taki En Kritik Mühendislik İçgörüleri

Bu bölüm, atölyenin teknik özünü oluşturan içgörüleri yoğunlaştırılmış olarak sunar. Her biri ya doğrudan Tariq'in söylediği ya da konuşmanın tonundan/örneklerinden çıkarılan derslerdir.

### 9.1 "Bash is the first code mode."

**İçgörü:** Code mode (modelin kod yazıp çalıştırması) yeni bir paradigma değil — Bash bunu 50 yıldır yapıyor. Kompozisyon (`grep | jq | awk`), discovery (`--help`), reuse (var olan binary'ler) Bash'in gücünü tek bir tool'a sığdırıyor.

**Pratik sonuç:** Tool sayısını azaltın, Bash'i ana agent surface'i yapın.

### 9.2 "Read the transcripts."

**İçgörü:** Agent loop'unu iyileştirmenin **birinci yöntemi**, agent transcript'lerini her seferinde okumaktır. *"Her HR run'ı oku, ne yapmış, neden yapmış, ona nasıl yardım edebilirim?"*

**Pratik sonuç:** Production'da agent çalıştırırken **structured logging** açın. Her tool çağrısını, her thinking adımını, her hatayı kayıt altına alın. Sonra haftada bir bunlardan örnekler okuyun.

### 9.3 "Verification is the limiting factor."

**İçgörü:** Bir problemin agent için uygun olup olmadığını belirleyen şey, **verification (doğrulanabilirlik)**. Code = yüksek (compile + test). Research = düşük (citation var ama sınırlı). Fiziksel dünya = sıfır.

**Pratik sonuç:** Agent inşa etmeye başlamadan önce: *"Bu agent'ın çıktısını nasıl doğrularım?"* sorusunu yanıtlayın. Yanıtlayamıyorsanız, başka bir problem seçin.

### 9.4 "Models are grown, not designed."

**İçgörü:** LLM davranışı determinist değil, organic. Aynı prompt farklı sonuç verebilir. Bu yüzden:

- Mühendislik = pattern + intuition
- "Bilim" değil, sanat
- Her şey deneysel olarak doğrulanmalı

**Pratik sonuç:** Agent davranışını "tanımlamak" yerine "şekillendirmek." Defensive coding + verification + incremental iteration.

### 9.5 "File system is the context engine."

**İçgörü:** Anthropic'in agent SDK'sındaki en derin tasarım kararı, dosya sistemini birinci-sınıf state mekanizması yapmak. Skill'ler, memory, sub-agent sonuçları, tool çıktıları — hepsi dosya.

**Pratik sonuç:** Kendi agent'ınızı tasarlarken, *"bu bilgi dosyada olabilir mi?"* sorusunu sürekli sorun. Database/cache/network yerine düz dosyalar tercih edin.

### 9.6 "Throw out code 10x faster."

**İçgörü:** Agent capabilities her 6 ayda bir değişiyor. Bugün yazdığın kod 6 ay sonra eski. **Kod yazmaya 10 kat hızlı olduğun gibi, atmaya da 10 kat hızlı ol.**

**Pratik sonuç:** Erken optimization yapma. "Generic framework" yazma. Bugün çalışan en basit şeyi yaz, capability geliştikçe yeniden yaz.

### 9.7 "Make problems in-distribution."

**İçgörü:** Model, internet üzerinde sıkça gördüğü kalıpları iyi yapar (SQL, regex, REST API, Markdown). Sıkça görmediği custom format'larda zorlanır.

**Pratik sonuç:** Custom protokoller tasarlamak yerine, problemi modelin tanıdığı bir gösterime çevirin:

- CSV → SQLite query
- XLSX → XML
- Custom config → JSON
- Custom DSL → Python-like

### 9.8 "Reversibility predicts agent fit."

(Bölüm 8.8 ile aynı çekirdek, ama mühendislik kuralı olarak özet:)

Yeni bir agent ürünü değerlendirirken: *"Bu domain'de state ne kadar reversible?"* Yüksekse → harika fit. Düşükse → tasarımı zorlaştır (snapshot, transaction, dry-run mode).

### 9.9 "Tools for atomic; bash/codegen for composable."

| Eylem tipi | Surface |
|-----------|---------|
| Atomic, irreversible (send_email, charge_card, write_file) | Tool |
| Composable, discoverable, dynamic | Bash |
| Dynamic, transformative, novel | Code generation |

### 9.10 "Sub-agents preserve main-agent context."

**İçgörü:** Sub-agent = ayrı bir context window'da çalışan ikinci agent. Ana agent'a yalnızca özet döner.

**Pratik sonuç:** Büyük araştırma görevlerini, paralel okumaları, adversarial verification'ı sub-agent'lara dağıtın. Ana agent'ın context'i temiz kalır.

### 9.11 "Hooks for determinism."

**İçgörü:** Modelden "X'i her zaman yap" demek prompt mühendisliğiyle %100 başarılamaz. Eğer kesinlik gerekiyorsa: hook ile yap.

**Pratik sonuç:** "Her commit'ten önce test çalıştır" kuralını CLAUDE.md'ye yazmak yetmez. PreToolUse hook'unda `Bash(git commit ...)` paterni yakalayıp test'i deterministic olarak çalıştırın.

### 9.12 "Production engineering mindset."

**İçgörü:** Anthropic'in iç agent'larında "model çok daha iyi olduğunda" sorununu çözmek için yapılan iş yarısı, "model bugün hata yaptığında" sorununu çözmek.

**Pratik sonuç:** Her agent için:

- Logging
- Observability (transcript okuma)
- Cost monitoring
- Error budgets
- Sandbox isolation
- Rate limit

### 9.13 "Local apps are coming back."

**İçgörü:** Cloud SaaS yerine, local app + filesystem agent giderek mantıklı. Claude Code zaten local. Lovable, Cursor, Windsurf — hepsi local.

**Pratik sonuç:** Eğer agent'ınız ağır filesystem işine girecekse, web app + sandbox karmaşıklığından kaçınmak için local desktop app düşünün.

### 9.14 "Charge fewer people more money."

**İçgörü:** Agent'lar ucuz değil. Hedef segment: "Zor problem" olan, çözümü için ödeme yapacak az sayıda kullanıcı.

**Pratik sonuç:** Erken SaaS kararı vermek yerine, önce monetization modelini düşünün. Subscription vs usage-based, segmentasyon, premium tier.

### 9.15 "Dog-food."

**İçgörü:** Anthropic kendi modelini, kendi tool'unu kullanıyor. Custom semantic indexing yazmıyor — Claude Code'un kendi `Grep`'ini, kendi `CLAUDE.md`'sini kullanıyor.

**Pratik sonuç:** Custom tooling yazma dürtüsünü test et. Built-in tool'lar genellikle yeterli. Custom kod = teknik borç.

### 9.16 "Code mode > Tool mode."

**İçgörü:** Modern bir gözlem: birçok problemde modelin **kod yazıp çalıştırması**, sabit tool'lar çağırmasından daha esnek. Çünkü:

- Tool sayısı kombinatoryal artıyor (her veri için ayrı tool).
- Code mode'da model 50 yıllık unix ekosistemini kullanabilir.
- Custom transformations için tool yazmak yerine, on-the-fly script üretmek daha hızlı.

**Pratik sonuç:** Yeni bir tool eklemeden önce sor: *"Bu agent'a bash + dosya sistemi + bir SDK verseydim, kendi kendine yapabilir miydi?"* Genellikle yanıt "evet."

### 9.17 "Atomic actions deserve tools; everything else doesn't."

**İçgörü:** Tool'lar **atomic, irreversible eylemler** için var. Dynamic veri analizi, transformasyon, arama — bunlar tool'a layık değil.

| Atomic (tool için iyi) | Composable (bash/codegen için iyi) |
|----------------------|-----------------------------------|
| `send_email` | `analyze_emails` |
| `charge_card` | `summarize_transactions` |
| `write_file` | `transform_data` |
| `delete_record` | `search_records` |
| `deploy_service` | `audit_deployment` |

### 9.18 "MCP, code mode, and the future of tool calling."

**İçgörü:** MCP (Model Context Protocol) ve "code mode" pattern'leri, tool calling'in evrimi. MCP, custom tool'ları tek protokol üzerinden paylaşıyor. Code mode, tool'ları "kod ile çağrılabilir fonksiyonlar" haline getiriyor.

Tariq'in dolaylı yorumu: *"Bash bu pattern'in atası. MCP, Cloudflare'in code mode pattern'i, bizim agent SDK'mız — hepsi aynı ana fikri farklı yollarla uyguluyor: 'model'i daha güçlü hale getirmek için ona daha kompozisyonel arayüzler sun.'"*

### 9.19 "Tarihsel parallel: agent SDK = React for agents."

**İçgörü:** Tariq'in özellikle yaptığı analoji: *"Agent SDK'lar, jQuery sonrası gelen React gibi. Başta JSX, bundler, build step — annoying. Ama uzun vadede web app'leri çok daha güçlü yaptı."*

Bu analoji şunu ima ediyor: agent ekosistemi standart araç setleri, derleme adımları, opinionated framework'lerle olgunlaşıyor. Bugün manual yapılan agent kurulumu (chat.ts pattern'i), yarın sadece SDK ile yapılacak.

**Pratik sonuç:** Erken sahiplenenler, framework'ün geliştiği oranda kazanır. Bu rehberi okuyan biri olarak: *erken sahiplenen* sizsiniz.

### 9.20 "Don't reinvent — compose."

**İçgörü:** Atölyenin tekrar eden alt-temalarından biri: yeni protokol/framework/abstraction üretmeden önce, **mevcut araçların kompozisyonu yeterli mi?** sorusunu sor.

Anthropic'in agent felsefesi:
- ❌ Agent-to-agent custom RPC protokolü → ✅ HTTP server-client
- ❌ Custom vector DB → ✅ Filesystem + grep
- ❌ Custom plan format → ✅ Markdown TODO list
- ❌ Custom skill marketplace → ✅ Git repo + folder convention
- ❌ Custom memory engine → ✅ Filesystem + auto-load

**Pratik sonuç:** Yeni bir abstraction katmanı eklemenin **maliyeti**, kompozisyonel basit çözümlerin **karmaşıklığından** her zaman daha fazla. Cézanne'nin "form takes time, content takes patience" sözünün mühendislik versiyonu: *"abstraction takes effort, composition takes humility."*

---

## 10. Claude Agent SDK ile Neler İnşa Edilebilir?

Bu bölüm, Tariq'in atölyede saydığı ve ima ettiği use case'leri kapsar.

### 10.1 Software engineering agent'ları

| Use case | Agent'ın yaptığı |
|---------|------------------|
| **Code review bot** | PR diff'ini okur, comment'ler, label atar |
| **Bug triaging** | Issue'yu okur, repo'yu clone eder, repro denerse, severity atar |
| **Site reliability** | Alert'ları okur, log'ları analiz eder, runbook çalıştırır |
| **Security incident response** | Vulnerability scan output'unu okur, patch önerir |
| **Dashboard/site builder** | Component library'den faydalanıp custom dashboard üretir |

**Örnek mimari: Bug triaging**

```
GitHub Webhook → Agent (issue içeriği) →
  → tool: clone repo
  → tool: grep error message in code
  → tool: identify likely file
  → tool: run reproduction script
  → output: structured triage report (severity, owner, related PRs)
→ GitHub comment + label
```

### 10.2 Office automation agent'ları

| Use case | Agent'ın yaptığı |
|---------|------------------|
| **E-posta yönetimi** | Inbox'ı tarar, kategorize eder, taslak yanıt yazar |
| **Spreadsheet analizi** | Karmaşık formüller, raporlar, görselleştirmeler |
| **Sunum üretimi** | Veriden powerpoint/keynote dosyası |
| **Toplantı notları** | Transkript'ten action item, summary, ATA |

### 10.3 Domain-specific agent'lar

| Sektör | Use case |
|--------|---------|
| **Legal** | Sözleşme analizi, klauzul karşılaştırma, risk değerlendirme |
| **Finance** | DCF model üretme, financial statement analizi, fraud detection |
| **Healthcare** | Klinik karar destek, prior auth, ICD coding |
| **Research** | Literatür taraması, deneysel veri analizi, paper özetleme |

### 10.4 SaaS automation

Mevcut SaaS ürünlerinizi agent'la zenginleştirin:

- Salesforce → Agent CRM asistanı
- Jira → Agent project manager
- HubSpot → Agent marketing analyst
- Notion → Agent knowledge curator

### 10.5 DevOps agent'ları

| Use case | Tool kombinasyonu |
|---------|------------------|
| **CI/CD diagnosis** | `gh run view`, `kubectl logs`, log parsing |
| **Infrastructure provisioning** | `terraform plan`, `aws cli`, drift detection |
| **Deployment** | Blue-green orchestration, canary monitoring |
| **Cost optimization** | Cloud cost analysis, rightsizing önerileri |

### 10.6 AWS automation

```
Agent + AWS CLI + boto3
    ↓
Otomatik:
- EC2 instance management
- S3 lifecycle policies
- IAM role auditing
- CloudWatch alarm tuning
- Cost anomaly investigation
```

### 10.7 Security workflows

| Use case | Detay |
|---------|-------|
| **Penetration testing** | Bash + nmap + nuclei + custom scripts; results to file system |
| **CVE triage** | CVE feed → grep codebase for vulnerable patterns |
| **Phishing analysis** | Email forensic, header analysis, link checking |
| **Compliance audit** | Config drift detection, policy validation |

### 10.8 Research agent'ları

| Use case | Akış |
|---------|------|
| **Literature review** | WebSearch + paper download + summary + comparison |
| **Data exploration** | DataFrame analysis, plotting, hypothesis testing |
| **Experimental design** | Statistical power analysis, sample size calculation |

### 10.9 Coding agent'ları (özelleşmiş)

| Use case | Detay |
|---------|-------|
| **Migration tool** | "Python 2 → 3", "Vue 2 → 3", "REST → GraphQL" |
| **Test generation** | Existing kod → comprehensive test suite |
| **Doc generation** | Code → API docs, README, examples |
| **Refactoring** | "X pattern'ini Y pattern'ine çevir" |

### 10.10 Multi-agent sistemler

Birden fazla agent'ı ortak hedefe yönlendirme.

**Pattern 1: Hierarchical**

```
Main agent
├── Search sub-agent
├── Verification sub-agent
└── Write sub-agent
```

**Pattern 2: Adversarial**

```
Proposer agent ← debate → Critic agent → Final answer
```

**Pattern 3: Pipeline**

```
Researcher → Drafter → Editor → Publisher
```

Anthropic SDK'da bu pattern'ler `Task` tool'u ile inşa edilir. Her sub-agent **bağımsız bir context window**'da çalışır.

---

## 11. Production-Level Best Practices

### 11.1 Büyük repo yönetimi

Tariq'in atölyede 50M+ satır kod tabanı hakkında aldığı soruya verdiği yanıt: *"Anthropic kendisi de büyük kod tabanlarında çalışıyor. Custom semantic indexing yazmıyoruz. Onun yerine: iyi `CLAUDE.md`'ler, doğru dizinde başlamak, verification step'ler ve hooks."*

**Pratik kurallar:**

| Kural | Detay |
|------|------|
| **Doğru dizinde başla** | `cd src/feature && claude` — global başlatma yerine relevant alt-dizin |
| **CLAUDE.md hiyerarşisi** | Her major dizinde kendi CLAUDE.md'si |
| **Glob/Grep önce** | "Find X" istenirse, önce `Grep "X" src/`, sonra detay |
| **Sub-agent paralelizasyon** | "10 dosyayı oku ve özetle" gibi taskları paralelle |
| **Lazy loading** | `Bash(cat src/huge.ts)` yerine `Read(src/huge.ts, offset=100, limit=200)` |

### 11.2 Token optimization

Production'da token bütçesi önemli. Pratik teknikler:

1. **Tool sonuçlarını file system'e off-load et** (Bölüm 6.5).
2. **CLAUDE.md'yi kısa tut** (300 satır altı).
3. **Sub-agent'larla context'i izole et.**
4. **Compaction'ı agresif aç.**
5. **Read tool'unda `offset/limit` kullan** — büyük dosyalar için bölümsel oku.
6. **Tool description'larını gözden geçir** — gereksiz açıklamayı çıkar.

### 11.3 File organization

Önerilen proje yapısı:

```
project/
├── CLAUDE.md                  # ana yönerge
├── .claude/
│   ├── settings.json          # permissions, hooks
│   ├── settings.local.json    # kullanıcı özelinde
│   └── hooks/                 # custom hook scriptleri
├── memory/                    # kalıcı agent hafızası
├── docs/                      # detaylı doc'lar (lazy load)
├── scripts/                   # agent için reusable script'ler
├── examples/                  # agent için örnek script'ler
├── .cache/                    # tool sonuçları (gitignore'da)
├── src/                       # asıl kod
└── tests/                     # testler
```

### 11.4 Observability

**Logging katmanları:**

1. **API call log** — her Anthropic çağrısı: model, tokens, latency, cost.
2. **Tool call log** — her tool çağrısı: name, input, output (truncated), duration.
3. **Hook log** — her hook fire: matcher, decision, reason.
4. **Session log** — her oturum: user prompt, total turns, total cost, outcome.

**Pratik:** Production'da bunları JSON-lines formatında yazın, `jq` ile sorgulanabilsin.

### 11.5 Safety (güvenlik)

Production safety checklist:

- [ ] Sandbox (filesystem + network) aktif
- [ ] Bash AST parser allow-list'i tanımlı
- [ ] Sensitive secret'lar `.env`'de, agent'a verilmiyor
- [ ] Production data'ya yazma izni hook ile sınırlı
- [ ] Rate limit (her kullanıcı için)
- [ ] Cost cap (her oturum için)
- [ ] Audit log (kim ne yaptı)
- [ ] Backup / snapshot (rollback için)

### 11.6 Human-in-the-loop

Yüksek riskli işlerde, agent'ı durdurup kullanıcı onayı isteyin:

```typescript
options: {
  permissionMode: "default",  // default sorar
  // Veya hook ile spesifik yerlerde sor:
  hooks: {
    PreToolUse: [{
      matcher: "Bash",
      hooks: [{
        type: "command",
        command: ".claude/hooks/confirm-destructive.sh"
      }]
    }]
  }
}
```

**Pattern: Plan mode + confirm**

1. Agent planı yazar.
2. Kullanıcı planı görür, onaylar veya reddeder.
3. Onay sonrası agent execute eder.

### 11.7 Cost optimization

Agent'lar pahalı olabilir. Pratik teknikler:

| Teknik | Etki |
|--------|------|
| **Daha küçük model kullan** | Sonnet → Haiku (basit görevler) |
| **Prompt caching** | Sistem prompt, CLAUDE.md cache'lenir |
| **Sub-agent'lara delegasyon** | Büyük araştırma sub-agent'ta |
| **maxTurns sınırı** | Sonsuz döngüleri kes |
| **Cost cap hook** | Belirli $ üstünde durdur |
| **Batch tool çağrıları** | Birden fazla read'i tek seferde |

**Prompt caching örneği:**

Anthropic API'sinde `cache_control` ile:

```typescript
const resp = await client.messages.create({
  model: "claude-sonnet-4-5",
  system: [
    { type: "text", text: largeStableSystem, cache_control: { type: "ephemeral" } },
    { type: "text", text: dynamicPart }
  ],
  // ...
});
```

İlk çağrıda full price; sonrakilerde cache hit'leri %90 indirimli.

### 11.8 Reliability scoring

Production agent'lar için **success rate metric'i** tanımlayın:

```
success_rate = (verifiable_successful_runs / total_runs) * 100
```

Hedef: %95+ (kritik task'lar için %99+).

Eğer altındaysa: transcript'leri okuyun, root cause analiz edin, prompt/hook/tool iyileştirin.

### 11.9 Debugging — agent neden yanlış davranıyor?

Agent debug etmenin sistematik adımları:

**Adım 1: Transkripti oku.** Bu Tariq'in altın kuralı. Önce, agent'ın *gerçekten* ne yaptığını anlamadan müdahale etme.

**Adım 2: Hata pattern'ini tespit et.** Üç kategori:

| Pattern | Belirti | Olası neden |
|---------|---------|------------|
| **Yanlış tool seçimi** | Edit yerine Write çağırıyor | Tool description'lar ayrımı net göstermiyor |
| **Eksik bağlam** | Yanlış varsayımlarla devam ediyor | CLAUDE.md eksik veya yanlış dosyaya bakıyor |
| **Halüsinasyon** | Olmayan API'leri çağırıyor | Grounding yetersiz, verification eksik |
| **Sonsuz döngü** | Aynı şeyi tekrar deniyor | Hata sinyali yumuşak; daha sert feedback ver |
| **Erken bitirme** | Görev yarımken "tamam" diyor | Stop kriteri belirsiz, verification eksik |

**Adım 3: Müdahale et.**

- **Yanlış tool seçimi** → Tool description'ları iyileştir, examples ekle.
- **Eksik bağlam** → CLAUDE.md'yi güncelle, ilgili dosyaları açıkça referans ver.
- **Halüsinasyon** → Verification hook ekle, grounded data source zorunlu kıl.
- **Sonsuz döngü** → maxTurns ayarla, hata mesajlarını daha katı yap.
- **Erken bitirme** → Stop hook ile final validation çalıştır.

### 11.10 Cost monitoring — gerçek dünyada para

Anthropic API maliyet hesabı (yaklaşık):

```
Claude Sonnet 4.5:
  - Input:  $3 / 1M token
  - Output: $15 / 1M token
  - Cache write: $3.75 / 1M token
  - Cache read: $0.30 / 1M token

Claude Haiku 4.5:
  - Input:  $1 / 1M token (yaklaşık)
  - Output: $5 / 1M token (yaklaşık)
```

Bir agent oturumu için tipik dağılım:
- 30 tur × 5K input/tur = 150K input → $0.45
- 30 tur × 2K output/tur = 60K output → $0.90
- **Toplam: ~$1.35 per session**

Eğer agent günde 10 kullanıcı tarafından 5 kere kullanılıyorsa:
- 50 session/gün × $1.35 = $67.50/gün
- = ~$2,000/ay

Optimize etme yolları (Bölüm 11.7'de detaylı):
1. **Prompt caching** — system prompt + CLAUDE.md'yi cache et (%90 indirim).
2. **Sub-agent'larla context'i parçala** — her sub-agent kendi cache'ini kullanır.
3. **Haiku'yu basit task'lar için tercih et** (%70 ucuz).
4. **MaxTurns sınırı** — sonsuz döngü = sonsuz para.

### 11.11 Observability tooling — agent'a "spy" tak

Production agent'lar için altyapı önerisi:

```
┌──────────────────────────────────────────────┐
│  Agent process                                │
│  ├── stdout/stderr → JSON-lines logger       │
│  ├── Tool calls → structured log              │
│  ├── API calls → Anthropic dashboard          │
│  └── Errors → Sentry / Datadog                │
└─────────────────┬────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Log aggregator  │
        │  (ELK, Loki,     │
        │   BigQuery, etc) │
        └────────┬─────────┘
                 │
                 ▼
       ┌─────────────────┐
       │  Dashboards      │
       │  - Cost per user │
       │  - Latency       │
       │  - Success rate  │
       │  - Tool usage    │
       └─────────────────┘
```

**Pratik logging şablonu:**

```typescript
function log(event: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    session_id,
    user_id,
    ...event
  }));
}

// Her tool call'da:
log({ type: "tool_use", tool: name, input: input, duration_ms });

// Her API call'da:
log({ type: "api_call", model, input_tokens, output_tokens, cost_usd });

// Her session sonunda:
log({ type: "session_complete", turns, total_cost, outcome });
```

Sonra `jq` veya BigQuery ile sorgulanabilir:

```bash
# Bugün başarısız olan oturumlar
jq -r 'select(.type == "session_complete" and .outcome == "failed")' logs.jsonl

# Toplam günlük maliyet
jq -s '[.[] | select(.type == "api_call") | .cost_usd] | add' logs.jsonl

# En çok çağrılan tool
jq -r 'select(.type == "tool_use") | .tool' logs.jsonl | sort | uniq -c | sort -rn
```

### 11.12 Caching stratejileri

Üç tür cache:

| Cache tipi | Süre | Boyut | Tipik kullanım |
|-----------|------|-------|---------------|
| **Anthropic prompt cache** | 5 dakika | 200K token | System prompt + CLAUDE.md |
| **Tool result cache** | Oturum | Dosyada | API call'ları, search results |
| **Embedding cache** | Kalıcı | Disk | RAG için (gerekirse) |

**Prompt cache patern'i:**

```typescript
const resp = await client.messages.create({
  model: "claude-sonnet-4-5",
  system: [
    {
      type: "text",
      text: longStaticSystemPrompt,
      cache_control: { type: "ephemeral" }  // 5 dakika TTL
    },
    {
      type: "text",
      text: dynamicUserContext
    }
  ],
  messages: [...]
});
```

Sonuç: ilk çağrı full fiyat, sonraki 5 dakika içindeki çağrılar cache hit ile %90 indirimli.

---

## 12. Workshop'tan Çıkarılan Nihai Dersler

### 12.1 En önemli sonuçlar

1. **Agent SDK = Claude Code as a library.** Tüm tool'ları, sub-agent'ları, hook'ları, sandbox'ı paketlenmiş halde alıyorsunuz.
2. **Bash + filesystem = agent'ın temel surface'i.** Tool sayısını minimuma indirin.
3. **Üç adımlı loop: gather → act → verify.** Verification olmayan agent çalışmaz.
4. **Context engineering > prompt engineering.** Bilgiyi dosyaya koyun, modelin keşfetmesine izin verin.
5. **Reversibility = agent fit'in tek en iyi belirleyicisi.** Code güzel, computer use zor.
6. **Transcript okumak agent geliştirmenin %1 numaralı tekniği.**
7. **Hooks deterministik kontrol için.** Prompt'a güvenmeyin.
8. **Sub-agent'lar context'i temiz tutar.** Aggressive kullanın.
9. **Models are grown, not designed.** Empirik mühendislik yapın.
10. **Kod hızlı yazıyorsanız, hızlı atın da.**

### 12.2 Gerçek dünyada kullanım

Aşağıdaki tablo "bir use case verildiğinde nereden başlanmalı?" rehberi sunar:

| Use case | Başlangıç adımı |
|---------|----------------|
| Kod yazan agent | Claude Code + CLAUDE.md ile başla, sonra SDK'ya geç |
| E-posta otomasyon | Gmail API → script → Bash tool, file-system tabanlı state |
| Veri analizi | Pandas/jq + sub-agent paralelizasyonu |
| Müşteri destek | RAG + structured outputs + workflow yaklaşımı |
| DevOps | gh, kubectl, terraform CLI'leri Bash üzerinden |
| Domain agent (legal, finance) | Skills + CLAUDE.md + verification scripts |

### 12.3 Kimler öğrenmeli?

- **Software engineer'lar** — agent'ların artık kod yazmadığı, kod yazımına dahil olduğu dünyaya hazırlanmak.
- **ML engineer'lar** — model yetenekleri tool/file-system tarafına kayıyor; bu surface'i anlamak.
- **DevOps/SRE'ler** — agent'lar production ops'larda etkili; runbook'lara entegre etmek.
- **Ürün geliştiricileri** — "AI özellik" eklemek yerine "AI agent" eklemek arasındaki farkı bilmek.
- **Startup kurucuları** — büyük şirketin 6 ay incubation cycle'ına karşı 6 saatlik prototip yapabilmek.
- **Güvenlik mühendisleri** — agent attack surface'ini, lethal trifecta'yı anlamak.

### 12.4 Nasıl ustalaşılır?

**Aşama 1: Anlama (1 hafta)**
- Bu rehberi sonuna kadar okuyun.
- Claude Code'u kurun, basit bir proje üzerinde 2-3 saat kullanın.
- Transcript'lerinizi okuyun.

**Aşama 2: Prototip (2 hafta)**
- Bir küçük domain problemi seçin (örn. PokéAPI gibi).
- Önce sadece Claude Code + CLAUDE.md ile çözmeye çalışın.
- Çalışıyorsa, Agent SDK'ya port edin.

**Aşama 3: Üretim (1 ay)**
- Logging, observability, error handling ekleyin.
- Sandbox + permission tighten edin.
- Cost monitoring kurun.
- Bir gerçek kullanıcıya verin.

**Aşama 4: Ustalaşma (3+ ay)**
- Custom hook'lar yazın.
- Sub-agent pattern'larıyla deney yapın.
- Skill'ler oluşturun.
- Adversarial verification deneyin.
- Anthropic Discord/forum'da paylaşın.

---

## 13. Ekler — Terminoloji, Diyagramlar, Şablonlar

### 13.1 Terminology glossary (Türkçe-İngilizce)

| Terim (TR) | Terim (EN) | Kısa açıklama |
|------------|-----------|--------------|
| Agent | Agent | Otonom çalışan, kendi bağlamını kuran LLM tabanlı sistem |
| Agent SDK | Agent SDK | Claude'un agent runtime kütüphanesi |
| Harness | Harness | Modeli + tool'ları + loop'u birleştiren runtime |
| Bağlam | Context | Modelin gördüğü bilgi seti |
| Bağlam penceresi | Context window | Modelin maksimum token kapasitesi |
| Bağlam mühendisliği | Context engineering | Modelin görmesi gerekeni planlama |
| Tool | Tool | Modelin çağırabileceği fonksiyon |
| Tool çağırma | Tool calling | Modelin tool kullanma mekanizması |
| Bash aracı | Bash tool | Komut satırı çalıştırma yeteneği |
| Code mode | Code mode | Modelin kod yazıp çalıştırması paradigması |
| Codegen | Code generation | Görev için yeni kod üretmek |
| Skill | Skill | İhtiyaca göre yüklenen domain-specific yönerge paketi |
| Sub-agent | Sub-agent | Ayrı context'te çalışan ikincil agent |
| Hook | Hook | Tool çağrısı öncesi/sonrası tetiklenen olay |
| CLAUDE.md | CLAUDE.md | Proje seviyesi agent yönergesi |
| MCP | Model Context Protocol | LLM-tool köprü protokolü |
| Compaction | Compaction | Mesaj geçmişini özetleyerek küçültme |
| Sandbox | Sandbox | İzole çalışma ortamı |
| RBAC | Role-based access control | Rol tabanlı erişim kontrolü |
| Hallucination | Hallucination | Modelin uydurması |
| Grounding | Grounding | Modeli somut kaynaklara bağlama |
| Plan mode | Plan mode | Uygulamadan önce plan üretme modu |
| Reversibility | Reversibility | İşin geri alınabilirliği |
| Verification | Verification | İşin doğruluğunu kontrol etmek |
| Permission policy | Permission policy | Hangi tool'un nasıl kullanılacağı |
| Sandbox provider | Sandbox provider | Cloudflare, Modal, E2B, Daytona gibi izole runtime sağlayıcıları |
| Lethal trifecta | Lethal trifecta | Code exec + filesystem + exfiltration üçlüsü |
| Swiss cheese defense | Swiss cheese defense | Çok katmanlı, üst üste binen savunma |
| Dog-fooding | Dog-fooding | Kendi ürününü kullanmak |
| Progressive disclosure | Progressive disclosure | Bilgiyi ihtiyaç anında açıklama |
| Adversarial verification | Adversarial verification | Karşı-agent ile doğrulama |
| Idempotent | Idempotent | Birden fazla kez çağrıldığında aynı sonuç |

### 13.2 Agent lifecycle diagram

```
                  ┌─────────────────┐
                  │  Kullanıcı      │
                  │  prompt verir   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Agent başlar    │
                  │  CLAUDE.md +    │
                  │  system prompt   │
                  │  yüklenir        │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  ▼                  │
        │         ┌─────────────────┐          │
        │         │  Bağlam topla   │          │
        │         │  (Read/Grep/    │          │
        │         │  Glob)          │          │
        │         └────────┬────────┘          │
        │                  │                   │
        │                  ▼                   │
        │         ┌─────────────────┐          │
        │         │  Eylem al       │          │
        │         │  (Bash/Edit/    │          │
        │         │  Write/Tool)    │          │
        │         └────────┬────────┘          │
        │                  │                   │
        │                  ▼                   │
        │         ┌─────────────────┐          │
        │         │  Doğrula        │          │
        │         │  (test/lint/    │          │
        │         │  hook)          │          │
        │         └────────┬────────┘          │
        │                  │                   │
        │       başarısız  │  başarılı         │
        │ ←─────────────────┴──────────────┐   │
        │                                  │   │
        │                                  ▼   │
        │                         ┌─────────────────┐
        │                         │  Sonlandırma    │
        │                         │  (cevap üret)   │
        │                         └─────────────────┘
        └──────────────────────────────────────┘
```

### 13.3 Tool lifecycle diagram

```
Model kararı: "tool kullan"
       │
       ▼
[ Tool çağrısı: tool_use bloğu ]
       │
       ▼
[ PreToolUse hook ]
       │   ├── deny → block (modele hata mesajı)
       │   └── ask  → kullanıcıya sor
       ▼
[ Input validation (JSON Schema) ]
       │
       ▼
[ Tool execute ]
       │
       ▼
[ Output hazırla (text format) ]
       │
       ▼
[ PostToolUse hook ]
       │   └── output'u modify edebilir
       ▼
[ tool_result bloğu mesaj geçmişine eklenir ]
       │
       ▼
[ Bir sonraki model çağrısı ]
```

### 13.4 Önemli prompt şablonları

**Şablon A: CLAUDE.md (boilerplate)**

```markdown
# {{Project Name}}

{{1-2 sentence description}}

## Stack
- Languages: {{...}}
- Frameworks: {{...}}
- Key libraries: {{...}}

## File layout
- `src/` — {{...}}
- `tests/` — {{...}}
- `docs/` — {{detaylı bilgi için}}

## Commands
- Install: `{{...}}`
- Test: `{{...}}`
- Lint: `{{...}}`
- Dev: `{{...}}`

## Conventions
- {{Coding style}}
- {{Naming}}
- {{Comments policy}}

## Workflow
- Always {{verify after edit}}.
- Never {{push to main directly}}.
- Prefer {{small composable scripts}} over {{monolithic files}}.

## Things to avoid
- {{Deprecated patterns}}
- {{Forbidden APIs}}

## Memory
- See `memory/USER_PROFILE.md` for user preferences.
```

**Şablon B: Custom tool**

```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";

const myTool = tool({
  name: "snake_case_name",
  description: `
    Tek satırlık ne yaptığı.

    WHEN TO USE: ...
    WHEN NOT TO USE: ...

    Returns: ... (formatı)
  `.trim(),
  input_schema: {
    type: "object",
    properties: {
      param1: { type: "string", description: "..." },
      param2: { type: "number", description: "..." }
    },
    required: ["param1"]
  },
  execute: async ({ param1, param2 }) => {
    try {
      const result = await doStuff(param1, param2);
      return JSON.stringify(result);
    } catch (e) {
      return `ERROR: ${e.message}`;
    }
  }
});
```

**Şablon C: PreToolUse hook (Bash güvenlik)**

```bash
#!/usr/bin/env bash
# .claude/hooks/bash-safety.sh

input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')

# Tehlikeli pattern'ları yakala
case "$cmd" in
  *"rm -rf"*|*"sudo "*|*">/dev/sd"*)
    jq -n --arg reason "Destructive command blocked" \
      '{ permissionDecision: "deny", permissionDecisionReason: $reason }'
    exit 0
    ;;
esac

# Allow-list dışındaki komutları sorgulat
allowed_cmds="^(ls|cat|grep|rg|find|git|npm|bun|node|python|cargo)"
first_word=$(echo "$cmd" | awk '{print $1}')
if ! echo "$first_word" | grep -qE "$allowed_cmds"; then
  jq -n --arg reason "Unknown command: $first_word — requires approval" \
    '{ permissionDecision: "ask" }'
  exit 0
fi

exit 0
```

**Şablon D: agent.ts (minimal production)**

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as fs from "node:fs";

const session_id = new Date().toISOString();
const log_path = `.logs/agent-${session_id}.jsonl`;
fs.mkdirSync(".logs", { recursive: true });

const logger = (event: any) => {
  fs.appendFileSync(log_path, JSON.stringify({ t: Date.now(), ...event }) + "\n");
};

async function main() {
  const userPrompt = process.argv.slice(2).join(" ");
  if (!userPrompt) {
    console.error("Usage: bun run agent.ts <prompt>");
    process.exit(1);
  }

  let totalCost = 0;
  let turns = 0;

  for await (const event of query({
    prompt: userPrompt,
    options: {
      cwd: process.cwd(),
      allowedTools: ["Bash", "Read", "Write", "Edit", "Grep", "Glob", "Task"],
      systemPrompt: { preset: "claude_code" },
      permissionMode: "default",
      maxTurns: 50,
    }
  })) {
    logger(event);

    if (event.type === "assistant") {
      for (const b of event.message.content) {
        if (b.type === "text") process.stdout.write(b.text);
        if (b.type === "tool_use") console.log(`\n[tool] ${b.name}`);
      }
    }

    if (event.type === "result") {
      turns = event.num_turns;
      totalCost = event.total_cost_usd ?? 0;
      console.log(`\n\n--- Session done: ${turns} turns, $${totalCost.toFixed(4)} ---`);
      console.log(`Log: ${log_path}`);
    }
  }
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
```

### 13.5 Tool tipleri karşılaştırma

```
                     LATENCY     CONTEXT COST    COMPOSABILITY    DİSCOVERY
                     ───────     ────────────    ─────────────    ─────────
TOOL                 ⚡⚡⚡⚡⚡        💰💰💰           🔗              ❌
(structured)         düşük         yüksek          düşük            no

BASH                 ⚡⚡⚡⚡          💰              🔗🔗🔗🔗🔗        ✅
(composable)         orta          düşük           yüksek          --help

CODEGEN              ⚡⚡            💰💰             🔗🔗🔗🔗🔗🔗      ✅
(dynamic)            yüksek        orta            çok yüksek      kod oluşturarak
```

### 13.6 Workshop demosu için tam kod paketi (yeniden inşa)

```
pokemon-agent/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── pokey-api-sdk/
│   └── index.ts                # Bölüm 5.1
├── data/
│   ├── smogon.txt              # competitive meta
│   └── teams.json              # kullanıcının takımları (boş başlar)
├── examples/
│   ├── list-by-type.ts
│   ├── team-builder.ts
│   └── find-by-region.ts
├── scripts/
│   └── validate-team.ts        # verification
├── chat.ts                     # Bölüm 5.3 (SDK-siz)
├── agent.ts                    # Bölüm 5.4 (SDK'li)
└── .claude/
    ├── settings.json
    └── hooks/
        └── bash-safety.sh
```

### 13.7 Yaygın hata-çözüm tablosu

| Belirti | Olası neden | Çözüm |
|---------|-------------|-------|
| Agent aynı dosyayı sürekli okuyor | Context'i unutuyor (compaction sonrası) | Önemli dosyaları CLAUDE.md'de açıkça çağır |
| Agent doğru tool seçemiyor | Tool description'lar belirsiz | Description'ları daha detaylı yaz; "when to use / when not to" ekle |
| Bash komutları izinsiz çalışıyor | Permission mode yanlış | `permissionMode: "default"` veya hook ekle |
| Çıktı çok uzun, context dolu | Tool sonuçları context'te | File system'e off-load et, path döndür |
| Sub-agent yanıt vermiyor | Task tool'u allowed listede yok | `allowedTools: [..., "Task"]` |
| Edit hatası: "old_string not unique" | Birden fazla match | `replace_all: true` veya daha geniş context ekle |
| Edit hatası: "must read before edit" | Read cache boş | Önce `Read(path)` çağır |
| Hook çalışmıyor | Settings.json'da matcher yanlış | Tool adının exact match olduğunu kontrol et |
| Agent halüsinasyon yapıyor | Grounding eksik | Dosya yolları, verification step ekle |
| Cost çok yüksek | Context çok büyük | Sub-agent, compaction, prompt caching |

### 13.8 Workshop'tan üzerine düşünülmesi gereken sorular

Atölyenin sonunda Tariq'in açıkça yanıt vermediği ama dolaylı yoldan değindiği sorular. Bu rehberi okuyan mühendis için "düşünme egzersizi":

1. **Çoklu kullanıcılı agent'larda durum nasıl izole edilir?** (Tariq: "henüz best practice yok, sandbox per user genel pattern")
2. **Agent'lar arası iletişim için yeni bir protokol mi gerekli?** (Tariq: "hayır, HTTP + named pipes yeterli")
3. **Semantic search vs grep tradeoff'u nedir?** (Tariq: "biz grep'i dog-food ediyoruz")
4. **Memory tool'un internal implementation'ı nasıl?** (Tariq: "tam bilmiyorum ama filesystem-tabanlı")
5. **Skills marketplace'i para kazandıracak mı?** (Tariq: "discovery sistemi, monetization belirsiz")

---

## Son söz

Claude Agent SDK, **mevcut AI uygulamalarının bir sonraki adımıdır**. Workflow'lardan agent'lara geçiş, sadece kod yazımını değil, ürün mühendisliğini, güvenlik düşüncesini ve hatta business model'i değiştiriyor.

Tariq'in atölyede vurguladığı en yalın gerçek:

> *"Bugün bir agent inşa edebilirsiniz. Yarın daha iyi bir agent inşa edebileceksiniz. Mühim olan başlamak."*

Bu rehber, başlamanız için size hem mimari hem pratik hem felsefi temeli vermeyi amaçladı. Kod yazın, transcript okuyun, atın yeniden yazın. Agent capabilities altı ayda bir değişiyor — siz de değişin.

---

**Doküman bilgisi**
- Kaynak: `claude_advanced.mp4` (1 saat 52 dakika)
- Konuşmacı: Tariq (Anthropic)
- Transkripsiyon: faster-whisper `small` model (3.29× realtime)
- Yeniden inşa: senior engineering perspective + intelligent term normalization
- Hedef: 15,000+ kelime Türkçe eğitim dokümanı
- Ürettiği yan dosyalar: `claude_advance_transcript.{md,srt,txt}`, `full_audio.json`

**Lisans:** Bu doküman atölye içeriğini eğitim amaçlı yeniden inşa eder. Anthropic veya konuşmacı ile resmi bir bağlantı yoktur. Kanonik referans için Anthropic'in resmi Claude Agent SDK dokümantasyonuna başvurun.
