# RS-10 — Контент-пайплайн + LESSON-AS-DATA схема (глубоко, точно, в масштабе)

Линза R10. Дата: 2026-07-08. Автор: researcher фазы 1. Языки: отчёт — RU; код/идентификаторы — EN.
Корпус правды: **мир** (офиц. доки NuGet/Microsoft Learn/1EdTech — первоисточники, доступны на дату) +
**данные/артефакты модальности** (реальные схемы assessment-стандартов, реальный ответ NuGet API,
реальный вывод `dotnet`/`node`) + **корпус пользователя** (RS-00…RS-07, brief.md, критика — прочитаны целиком).
Память модели источником НЕ является: все ключевые факты — из живого веба сейчас или из исполнения кода.

Условные обозначения: **[В]** высокая увер. (первоисточник/исполнение), **[С]** средняя (вторичка/один канал),
**[Н]** низкая (маркетинг/непрослежено). Классы источников: A первичка · B сообщество с историей ·
C авторская статья · D безавторный SEO.

> **Отношение к RS-05:** RS-05 доказал, что **точность контента — риск №1** (пакетные галлюцинации
> 19.7% в 2024 → 4.6–6.1% в 2026, но НЕ ноль; 58% галлюцинаций систематичны; LLM-судья 60–68% согласия
> + authority bias). RS-10 отвечает на вопрос «КАК авторить сотни уроков без галлюцинаций» —
> **детерминированными гейтами, которые НЕ спрашивают LLM, а исполняют/компилируют/HTTP-проверяют**,
> и **схемой урока, где источник — структурно обязательное поле каждого утверждения**, а не пожелание.

---

## 1. Вопросы линзы

1. Как **заземлять на первоисточник** без галлюцинаций: verification-pass, existence-check идентификаторов
   (NuGet/API), «источник на КАЖДОЕ утверждение», аккуратные edge-cases/gotchas.
2. **LESSON-AS-DATA JSON-схема**, кодирующая intuition/mechanics/spec/edge-cases/misconceptions/rationale/
   source И драйвящая (а) анимацию «живого диаграммного движка», (б) SRS-айтемы, (в) визуализацию.
3. Как **структурируют/секвенируют** контент Execute Program, Brilliant, roadmap.sh; версионирование
   волатильных тем (T6/T7).
4. **Пайплайн авторинга+верификации**: кто/что генерит, кто/что проверяет, детерминированные гейты.
5. **Конкретная схема + заполненный пример** (boxing + hash-таблица).

---

## 2. Корпусы и классы источников (что покрыто / нет)

| Под-тема | Где живёт правда | Покрыто | Класс лучших источников |
|---|---|---|---|
| Existence-check пакетов | NuGet Server API v3 (офдок + живой endpoint) | да, **исполнено** | A (learn.microsoft.com/nuget/api + api.nuget.org) |
| Existence-check типов/членов API | компиляция против реального .NET SDK | да, **исполнено** | A (dotnet 10.0.301 на машине) |
| Заземление факта (boxing и др.) | learn.microsoft.com (ms.date в метаданных) | да, **fetched** | A (learn.microsoft.com, ecma-334) |
| Стандарты модели контента / assessment | 1EdTech QTI 3.0, LRMI/schema.org, xAPI/cmi5 | да | A (imsglobal.org/1edtech.org) |
| Живой диаграммный движок (trace≠render) | деконструкция эталонов (RS-06) | да (наследуется) | A (Python Tutor UIST, algorithm-visualizer src) |
| Секвенирование (EP/Brilliant/roadmap.sh) | деконструкция эталонов (RS-03) | да (наследуется) | A/B (roadmap.sh src, практики EP) |
| SRS-айтемы из данных | RS-01 (типы карточек, FSRS) | да (наследуется) | A (ts-fsrs исполнено) |
| Verification-пайплайны LLM-контента | RS-05 (галлюцинации, LLM-судья) | да (наследуется) | A (arXiv, USENIX) |

**Не покрыто/слабо (см. §7):** нет рецензируемого «безопасного порога доли LLM без ревью» для тех.
контента (RS-05 §7.3 — его НЕТ, ответственность на человеке); нет публичного open-source эталона
именно «lesson-as-data, драйвящего анимацию+SRS одновременно» для программирования (execute-program
и Anki-note-types — ближайшие частичные аналоги, каждый покрывает половину). Схема §5 — синтез, а не
копия существующего стандарта; QTI/LRMI использованы как каркас-ориентир, не как готовое решение.

---

## 3. Находки по под-темам (утверждение → источник/артефакт → дата → уверенность)

### 3.1 Existence-check — детерминированный, ИСПОЛНЕННЫЙ (сердце анти-slop)

RS-05 назвал имена пакетов/NuGet/версии API темой №1 по цене ошибки (джун установит slopsquat-вредонос).
RS-10 доказывает, что existence-check делается **без LLM, двумя детерминированными уровнями**.

**Уровень A — пакет существует (NuGet flat container).** Офдок: service index `https://api.nuget.org/v3/index.json`;
ресурс **PackageBaseAddress** (flat container) даёт `…/v3-flatcontainer/{lower-id}/index.json` → **404, если пакета
нет** (learn.microsoft.com/nuget/api/package-base-address-resource, accessed 2026-07-08) **[В]**.

АРТЕФАКТ-СПАЙК (исполнено `curl`, 2026-07-08):
```
GET v3-flatcontainer/newtonsoft.json/index.json                        -> 200   (реальный пакет)
GET v3-flatcontainer/fsrs.core/index.json                              -> 200   (движок из RS-01; версии 1.0.0…1.0.7)
GET v3-flatcontainer/system.reflection.metadata.fastjson.helper/…      -> 404   (выдуманный / slopsquat)
```
Вывод: гейт `G-EXIST-PKG` = для каждого `nuget-package`-идентификатора карточки дёрнуть flat container;
любой не-200 → карточка НЕ публикуется. Заодно `index.json` отдаёт **список версий** → проверка «версия API
существует» (напр., `PriorityQueue` требует пакет .NET ≥6). Первичка исполнена, а не пересказана. **[В]**

**Уровень B — тип/член API существует (компиляция против реального SDK).** Заявленные в карточке типы/методы
компилируются пробой против установленного .NET SDK (на машине **dotnet 10.0.301**, `dotnet run <file>.cs`,
file-based apps). Компилятор — идеальный оракул существования: несуществующий член = ошибка `CS1061`/`CS0117`.

АРТЕФАКТ-СПАЙК (исполнено `dotnet run`, 2026-07-08):
```csharp
// ok.cs — реальный API
var pq = new System.Collections.Generic.PriorityQueue<string,int>();  // .NET 6+
pq.Enqueue("a", 2); System.Console.WriteLine(pq.Count);               // -> 1   (компилируется, работает)

// bad.cs — галлюцинированный член
var d = new System.Collections.Generic.Dictionary<string,int>();
d.TryAddOrUpdate("x", 1);   // НЕ существует
// -> error CS1061: 'Dictionary<string,int>' does not contain a definition for 'TryAddOrUpdate'
```
Вывод: гейт `G-EXIST-API` = сгенерировать проба-файл, ссылающийся на каждый тип/член карточки, `dotnet build`;
любая `error CS…` → идентификатор не существует в целевой версии → блок. Это ловит именно «тонкую полу-правду»
из RS-05 (правдоподобный, но несуществующий метод) детерминированно, без мнения модели. **[В, исполнено]**

### 3.2 Заземление факта на первоисточник — «cite-then-write», не «write-then-cite»

RS-05 §3.3: RAG снижает галлюцинации, но не устраняет (legal-RAG до 33% остаточных — наличие пруфа в
контексте НЕ гарантирует верную интеграцию). Практический вывод для пайплайна: **инвертировать порядок**.
Сначала извлекается пассаж первоисточника (`sourceExcerpt`), потом генерация ОГРАНИЧЕНА этим пассажем, и
каждое утверждение несёт ссылку на конкретный excerpt. Это делает «источник на каждое утверждение»
не декларацией, а структурой (§5: `claim` = объект с обязательным `source`, не свободная проза).

АРТЕФАКТ (WebFetch learn.microsoft.com/…/boxing-and-unboxing, метаданные `ms.date: 2025-10-13`, accessed
2026-07-08) — дословно проверенные факты для примера §6.1 **[В]**:
- «Boxing is the process of converting a **value type** to the type `object`… wraps the value inside a
  `System.Object` instance and stores it on the **managed heap**.»
- «Boxing is **implicit**; unboxing is **explicit**.»
- «Boxing a value type **allocates an object instance on the heap and copies the value** into the new object.»
- «the original value type and the boxed object use **separate memory locations**» (i=123→o; i=456; o остаётся 123).
- «Attempting to unbox `null` causes a **NullReferenceException**. Attempting to unbox a reference to an
  **incompatible** value type causes an **InvalidCastException**.» (пример: `(short)o` на boxed `int` → throw).

Гейт `G-CITE`: каждое поле-утверждение схемы обязано иметь `source` → id из реестра источников, у источника
достижимый URL (HTTP 200) + `date`. Доля утверждений без source в проде = **0%** (это G3 из brief.md).
Ссылка ≠ верность (authority bias, RS-05 U12) — поэтому G-CITE проверяет НАЛИЧИЕ и ДОСТИЖИМОСТЬ, а
СОДЕРЖАТЕЛЬНОЕ соответствие ловят G-EXEC (для кода) и человек-ревью (для прозы «опасных тем», §4).

### 3.3 Answer-execution gate — «правильный ответ доказан исполнением, не мнением LLM»

Самый сильный анти-галлюцинационный гейт для карточек типа `predict-output` / `write-missing-method` /
`find-bug`: ответ карточки не «то, что сказала модель», а **то, что напечатала программа**.

АРТЕФАКТ-СПАЙК (исполнено `dotnet run box.cs`, 2026-07-08) — карточка boxing:
```csharp
int i = 123; object o = i;   // boxing (copy)
i = 456;
Console.WriteLine(o);              // -> 123    (копия, не 456)  ✔ совпало с заявленным ответом
Console.WriteLine((int)o == 123);  // -> True                    ✔
try { int j = (short)o; } catch (InvalidCastException){ Console.WriteLine("InvalidCast"); } // -> InvalidCast ✔
```
Все три заявленных ответа карточки совпали с реальным выводом рантайма И с документированным поведением
(learn.microsoft.com §Unboxing). Гейт `G-EXEC`:
1. `expectedOutput` карточки = `stdout` реального прогона (не текст из LLM);
2. для `write-missing-method` — hidden tests проходят на **reference solution** И **падают на seeded-wrong**
   solution (mutation-проверка: тест, который не отличает верное от неверного, бесполезен);
3. прогон детерминирован (фикс. seed, без сети, culture-invariant) — иначе карточка невоспроизводима.
Это семя «лестницы реконструкции» из brief.md (predict→bug→write на скрытых тестах). **[В, исполнено]**

### 3.4 Стандарты модели контента — что взять как каркас, чего избегать

- **1EdTech QTI 3.0** (Final 2022-05-11, imsglobal.org/spec/qti/v3p0) — индустриальный стандарт обмена
  «вопрос+тест+результат» между авторингом, item-bank и delivery. Модель ASI (Assessment/Section/Item),
  `response-declaration` + `outcome-declaration` + `response-processing` (правила грейдинга), HTML5/ARIA
  content model. **Взять как каркас идей** (разделение «стимул / ответная декларация / обработка ответа /
  фидбэк»), но **не как формат** — QTI XML-центричен, тяжёл, и не кодирует ни «слои глубины», ни параметры
  анимации. Наш JSON — легче и специфичнее. **[В]** (imsglobal.org/spec/qti/v3p0/oview, accessed 2026-07-08).
- **LRMI / schema.org `LearningResource`** — метаданные обучающего ресурса (`educationalAlignment`,
  `teaches`, `assesses`, `competencyRequired`). Взять поля выравнивания на curriculum/DAG (концепт-теги).
- **xAPI / cmi5** — стандарт ТЕЛЕМЕТРИИ обучения (statements actor-verb-object). Релевантен не схеме урока,
  а сбору событий сессии (recall@interval, latency) — согласуется с метриками RS-05 §3.1; при GDPR-минимизации
  (RS-05 G7). Не тащить весь LRS; взять форму «verb(attempted/answered/mastered)» для клиентских событий.
Вывод: **свой JSON**, вдохновлённый разделением QTI (стимул/обработка) + выравниванием LRMI (teaches/assesses)
+ формой событий xAPI, но без их веса. Наша добавка, которой нет ни в одном стандарте: **слои глубины как
данные** и **параметры живого диаграммного движка как данные**.

### 3.5 Как эталоны структурируют и секвенируют контент (наследуется из RS-03, применено к схеме)

- **Execute Program** (RS-03 §2.1): курс = линейная последовательность коротких уроков; урок = набор
  ИНТЕРАКТИВНЫХ исполняемых примеров, «ответ = исполнить/предсказать код», НЕ узнавание; **общий code
  preamble** делит сетап между примерами; **дневной лимит нового** форсирует возврат; чувство прогресса —
  от НОВОГО контента, не от «доживания» интервала. → В схему: `codePreamble` на уровне topic (несколько
  карточек делят setup); `newPerDay` cap в секвенсоре; порядок в модуле — линейный «хребет».
- **Brilliant** (RS-03 §2.3): «learn by doing», progressive disclosure; но критика — «интерактив = только
  слайдеры» и «rote/shallow» на новых темах. → Анти-паттерн: каждый урок ОБЯЗАН иметь ≥1 карточку уровня
  engagement ≥ *responding* (Naps, RS-06) и все три `depth`-слоя (иначе — shallow). Слайдер без предсказания
  запрещён.
- **roadmap.sh** (RS-03 §2.6, самый starred OSS): интерактивный визуальный **граф** ролей; узел → курируемые
  ресурсы; прогресс `done/in-progress/skipped`; «большая картина → zoom-in». Контент — JSON граф узлов с
  рёбрами-пререквизитами. → Наш **concept-DAG**: `topic.prereqs[]` = рёбра; `topic.sources[]` = «узел →
  ресурсы»; состояние узла = FSRS-мастерство P(L)≥0.95 (RS-05 U6), не ручной чекбокс. Это же — P1-экран
  «созвездие» из brief.md.

**Версионирование волатильных тем (T6/T7)** — прямой запрос. RS-04 §7 и §9: версии тулинга/квантизаций
меняются, T6/T7 — «мода без пруфов» (RS-05 §3.3, «заучит вчерашние мифы»). Механика в схеме:
- `volatility: "stable" | "volatile"` на уровне topic; T1–T5 обычно stable, T6/T7 — volatile.
- каждое фактическое утверждение волатильной темы несёт `asOf` (дата факта) + `source.retrieved`;
- `sourceSnapshot` пинит версию первоисточника: `net-10.0`, PostgreSQL `v18`, конкретный `arXiv:id`;
- `reviewBy`: stable — ~12 мес; volatile — ~3–6 мес; при обновлении растёт `contentVersion` (semver),
  FSRS-история карточки НЕ обнуляется, если утверждение не изменилось (diff по `claim.id`).
- «латест»-ловушки (напр. FSRS-6 vs FSRS-7, RS-01 §6) кодируются как `status: "current-default"` vs
  `"experimental"` внутри `claim`, чтобы джун не заучил dev-версию как прод.

---

## 4. Пайплайн авторинга + верификации (кто/что генерит, кто/что проверяет, гейты)

Принцип: **генерация — дёшева и недоверенна; доверие создаётся детерминированными гейтами и человеком на
опасных темах.** LLM-судья как ЕДИНСТВЕННЫЙ гейт запрещён (RS-05 U12: 60–68% согласия, authority bias).

```
STAGE 0  CURRICULUM SPEC (заморожен из RS-04)
  Кто: человек (архитектор контента). Что: DAG topic-ов, prereqs, назначенный ПЕРВИЧНЫЙ источник на topic.
  Выход: topic-стабы (id, track/module, prereqs[], primarySource). Закрытый корпус → критерий остановки =
  100% тем среза покрыты (не «насыщение»): для среза A ~180–230 карточек / ~30 тем (brief P0).

STAGE 1  SOURCE EXTRACTION (grounding ПЕРЕД генерацией — инверсия cite/write)
  Кто: retrieval (MCP Microsoft Learn / прямой fetch офдока) + человек-куратор.
  Что: вытащить конкретный пассаж первоисточника -> topic.sourceExcerpt (+ url, section, date, retrieved).
  Гейт G-SRC-REACH: URL источника отдаёт HTTP 200; дата зафиксирована. RS-05: grounding обязателен, но НЕ достаточен.

STAGE 2  DRAFT GENERATION (LLM, ограничен excerpt-ом)
  Кто: LLM (генератор). Что: заполнить схему (§5) — intuition/mechanics/spec/edgeCases/misconceptions/
       cards/viz — КАЖДОЕ утверждение с source-ref на excerpt Stage 1. Генератор НЕ придумывает источники.
  Выход: draft lesson.json (status: "draft").

STAGE 3  ДЕТЕРМИНИРОВАННЫЕ ГЕЙТЫ (CI, без LLM — ядро анти-галлюцинации)  ← ИСПОЛНЕНО в §3
  G-SCHEMA    : JSON Schema валиден; обязательные поля есть.
  G-CITE      : 0 утверждений без source; каждый source резолвится в реестр + URL 200 + date (§3.2).
  G-EXIST-PKG : каждый nuget-package -> flat container 200 (§3.1 A, исполнено 200/404).
  G-EXIST-API : каждый тип/член -> compile-probe `dotnet build` без CS-error (§3.1 B, исполнено CS1061).
  G-EXEC      : каждая predict/bug/write-карточка -> реальный прогон; expectedOutput == stdout;
                hidden tests PASS на reference И FAIL на seeded-wrong (mutation) (§3.3, исполнено).
  G-VIZ       : trace-события валидны против vocab + инварианты (степпер монотонен; нет висячих указателей);
                trace детерминированно воспроизводит кадры (RS-06: trace ≠ render).
  G-DETERMINISM: прогоны culture-invariant, фикс. seed, offline — воспроизводимость.
  Любой FAIL -> карточка/урок не идёт дальше (fail-closed).

STAGE 4  CROSS-SOURCE / ENTAILMENT (полу-детерминированный, НЕ авто-пасс)
  Кто: ВТОРАЯ модель / NLI, ОТЛИЧНАЯ от генератора (не self-judge). Что: проверка entailment
       claim <- sourceExcerpt; расхождения ФЛАГ на человека. self-consistency прогонов -> отсев нестабильных.
  Ограничение: НЕ гейт-пропуск, только сигнал (RS-05: LLM-судья ненадёжен).

STAGE 5  HUMAN CENSUS-REVIEW «опасных тем» (100%, не выборка)
  Кто: человек-эксперт (.NET/CS). Что: census-ревью тем, ранжированных по ЦЕНЕ ошибки (RS-05 §3.3):
       async/ConfigureAwait, GC/struct-семантика, Big-O границы, изоляции SQL, квантизация T7.
  Порог (brief G3): аудит N≥60 по опасным темам, ошибок 0/N (≤2%); любая ошибка -> повторный проход темы.
  Нет «AI-исключения» (RS-05 §7.3): ответственность на человеке-ревьюере.

STAGE 6  SIGN-OFF -> status: "published"
  К уроку прикрепляется verificationRecord {existence:pass, cite:pass, exec:pass, viz:pass,
  humanReviewer, date, gatesCommit}. Только published-уроки видны пользователю.
```

**Кто что генерит / проверяет (матрица):**

| Артефакт | Генерирует | Проверяет (детерминированно) | Проверяет (человек) |
|---|---|---|---|
| sourceExcerpt | retrieval + куратор | G-SRC-REACH (HTTP 200) | куратор: релевантность |
| intuition/mechanics/spec | LLM (из excerpt) | G-CITE (source есть) | census на опасных темах |
| edgeCases/misconceptions | LLM + куратор | G-CITE | census (это самые «дорогие» ошибки) |
| identifiers (пакеты/API) | извлекаются из code | G-EXIST-PKG + G-EXIST-API | — (машина точнее) |
| predict/bug/write cards | LLM + reference solution | G-EXEC (+mutation) | спот-проверка формулировки |
| viz trace | LLM/генератор trace | G-VIZ (schema+инварианты) | глазами: педагогичность (RS-06) |
| FSRS-seed | детерминир. из типа карты | — | — |

---

## 5. LESSON-AS-DATA: JSON-схема (концептуальная, «драйвит анимацию+SRS+визуализацию»)

Принципы дизайна (все — из корпуса, не из головы):
- **Утверждение = объект с обязательным `source`** (RS-05 G1 «источник на каждое») — «источник» становится
  структурой, а не пожеланием; G-CITE проверяет механически.
- **Три слоя глубины как данные** (`depth.intuition/mechanics/spec`) — progressive disclosure = управление
  cognitive load, не упрощение (RS-01 §2.2 CLT + expertise reversal; RS-06 R5 Transformer-Explainer-паттерн).
- **Одна тема-данные фанится в урок / дрилл / карточку / анимацию** (RS-04 §7.1; RS-06 R2: trace ≠ render).
- **viz = декларативный trace** из малого словаря операций → детерминированный, тестируемый, отделён от
  рендера (RS-06: Python Tutor / algorithm-visualizer tracer-паттерн).
- **cards = SRS-айтемы** с типами и гейтами верификации (RS-01 §4: predict/bug/write/cloze/explain/compare;
  engagement-level по Naps, RS-06 §3.1).

```jsonc
// JSON Schema (draft 2020-12), сокращённо — ключевые узлы. Идентификаторы EN.
{
  "$id": "https://<app>/schema/lesson.v1.json",
  "type": "object",
  "required": ["id","track","module","title","version","status","depth","sources","cards","verification"],
  "properties": {
    "id":        { "type": "string", "pattern": "^T[1-7]\\.M[0-9]+\\.[a-z0-9-]+$" }, // e.g. T1.M3.boxing
    "track":     { "enum": ["T1","T2","T3","T4","T5","T6","T7","M0"] },
    "module":    { "type": "string" },                 // e.g. "M1.3"
    "title":     { "type": "string" },                 // RU
    "prereqs":   { "type": "array", "items": { "type": "string" } }, // concept-DAG edges (roadmap.sh-style)
    "version":   { "type": "string" },                 // semver контента
    "volatility":{ "enum": ["stable","volatile"], "default": "stable" }, // T6/T7 -> volatile
    "sourceSnapshot": { "type": "object" },            // { "dotnet":"net-10.0" } | { "postgres":"v18" } | { "arxiv":"2306.00978" }
    "reviewBy":  { "type": "string", "format": "date" },// stable ~12мес / volatile ~3-6мес
    "status":    { "enum": ["draft","gated","human-review","published","deprecated"] },

    // ---- СЛОИ ГЛУБИНЫ: каждый claim НЕСЁТ source (structural citation) ----
    "depth": {
      "type": "object",
      "required": ["intuition","mechanics","spec"],
      "properties": {
        "intuition": { "$ref": "#/$defs/claimBlock" }, // «одним предложением, зачем/что»
        "mechanics": { "$ref": "#/$defs/claimBlock" }, // «как именно работает» (шаги)
        "spec":      { "$ref": "#/$defs/claimBlock" }  // «дословно из спеки/офдока» (нырнуть глубже)
      }
    },
    "edgeCases":    { "type": "array", "items": { "$ref": "#/$defs/claim" } },      // gotchas
    "misconceptions": { "type": "array", "items": { "$ref": "#/$defs/misconception" } }, // -> distractors
    "rationale":    { "$ref": "#/$defs/claim" },        // «почему так спроектировано» (design intent)

    // ---- РЕЕСТР ИСТОЧНИКОВ (единая точка; claims ссылаются по id) ----
    "sources": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id","kind","url","date"],
        "properties": {
          "id":   { "type": "string" },                // "ms-boxing"
          "kind": { "enum": ["microsoft-learn","ecma-334","clrs","ddia","arxiv","nuget","postgres","gof","rfc"] },
          "url":  { "type": "string", "format": "uri" },
          "section": { "type": "string" },
          "date":    { "type": "string", "format": "date" }, // ms.date первоисточника
          "retrieved": { "type": "string", "format": "date" }
        }
      }
    },

    // ---- EXISTENCE-CHECK: единицы для детерминированных гейтов (§3.1) ----
    "identifiers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["symbol","kind"],
        "properties": {
          "symbol": { "type": "string" },              // "System.Collections.Generic.PriorityQueue`2" | "FSRS.Core"
          "kind":   { "enum": ["nuget-package","type","member"] },
          "minTfm": { "type": "string" }               // "net6.0" — версия, где символ появился
        }
      }
    },

    // ---- ЖИВОЙ ДИАГРАММНЫЙ ДВИЖОК: декларативный trace (RS-06) ----
    "viz": {
      "type": "object",
      "properties": {
        "model": { "enum": ["boxes-and-arrows","stepper","swimlane","sankey","tree","hashtable"] }, // renderer
        "renderer": { "enum": ["svg","canvas"], "default": "svg" }, // RS-06: SVG default
        "entities": { "type": "array" },               // начальные узлы/ячейки/фреймы
        "trace": {                                     // ПОСЛЕДОВАТЕЛЬНОСТЬ шагов = кадры анимации
          "type": "array",
          "items": {
            "type": "object",
            "required": ["op"],
            "properties": {
              "op": { "enum": ["alloc","copy","move","highlight","compare","insert",
                                "resize","pointer","annotate","evict"] }, // малый словарь
              "target": { "type": "string" },          // id сущности
              "args":   { "type": "object" },
              "caption":{ "type": "string" },          // temporal contiguity: слово+картинка одновременно (Mayer)
              "signal": { "type": "string" }           // signaling: что подсветить (Mayer)
            }
          }
        },
        "interaction": { "enum": ["responding","changing","constructing"] }, // Naps >= responding обязателен
        "predictAt": { "type": "array", "items": { "type": "integer" } }     // индексы шагов «предскажи следующий»
      }
    },

    // ---- SRS-АЙТЕМЫ (карточки), выведенные из той же темы ----
    "codePreamble": { "type": "string" },              // общий setup (Execute Program pattern)
    "cards": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id","type","engagementLevel","verify","sourceRefs"],
        "properties": {
          "id":   { "type": "string" },
          "type": { "enum": ["predict-output","find-the-bug","write-missing-method",
                              "code-reading","compare","cloze","explain","calibrate"] },
          "engagementLevel": { "enum": ["responding","changing","constructing","presenting"] },
          "prompt": { "type": "string" },              // RU
          "code":   { "type": "string" },              // C# (EN)
          "expectedOutput": { "type": "string" },      // ЗАПОЛНЯЕТСЯ gate G-EXEC из реального stdout, не LLM
          "hiddenTests": { "type": "string" },         // xUnit (для write-missing-method)
          "referenceSolution": { "type": "string" },   // эталон -> тесты PASS
          "seededWrong": { "type": "string" },         // мутант -> тесты FAIL (проверка силы теста)
          "distractors": { "type": "array" },          // из misconceptions (для cloze/compare)
          "verify": { "enum": ["execute","compile","exact","self-graded"] }, // гейт грейдинга
          "sourceRefs": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
          "fsrsSeed": { "type": "object" }             // { "desiredRetention": 0.9 } — RS-01
        }
      }
    },

    // ---- ЗАПИСЬ ВЕРИФИКАЦИИ (прикрепляется на STAGE 6) ----
    "verification": {
      "type": "object",
      "required": ["gates","citationCoverage"],
      "properties": {
        "gates": { "type": "object" },                 // { "G-EXIST-PKG":"pass", "G-EXEC":"pass", ... }
        "citationCoverage": { "type": "number" },      // 1.0 == 100% claims с source (G3)
        "humanReviewer": { "type": "string" },
        "reviewDate": { "type": "string", "format": "date" },
        "gatesCommit": { "type": "string" }            // sha CI-прогона
      }
    }
  },

  "$defs": {
    "claim":  {                                        // АТОМ утверждения: текст + ОБЯЗАТЕЛЬНЫЙ источник
      "type": "object", "required": ["id","text","source"],
      "properties": {
        "id":     { "type": "string" },
        "text":   { "type": "string" },                // RU
        "source": { "type": "string" },                // -> sources[].id (G-CITE)
        "asOf":   { "type": "string", "format": "date" }, // для volatile
        "status": { "enum": ["fact","current-default","experimental"] } // анти-«латест»-ловушка
      }
    },
    "claimBlock": { "type": "array", "items": { "$ref": "#/$defs/claim" }, "minItems": 1 },
    "misconception": {
      "type": "object", "required": ["wrong","correction","source"],
      "properties": {
        "wrong":      { "type": "string" },            // распространённое заблуждение -> distractor
        "correction": { "type": "string" },
        "source":     { "type": "string" }
      }
    }
  }
}
```

**Как одна тема фанится в три деливерабла (single source of truth):**
- **Урок/чтение** = `depth.intuition → mechanics → spec` (progressive disclosure) + `viz` рядом (dual coding).
- **Дрилл/сессия** = `cards[]`, интерливинг типов (RS-01), FSRS планирует по `fsrsSeed`.
- **Карточка-повторение** = отдельный `card` с гейтом `verify`; `misconceptions[]` → `distractors`;
  `edgeCases[]` → `find-the-bug`; `viz.predictAt` → «предскажи следующий шаг» (responding, RS-06).
- **Анимация** = `viz.trace` проигрывается StepPlayer-ом (RS-06 R2); каждый `op` детерминирован → G-VIZ.

---

## 6. Заполненные примеры (в этой схеме)

### 6.1 Пример урока: `T1.M3.boxing` (заземлён на learn.microsoft.com, ИСПОЛНЕНО §3.1/3.3)

```jsonc
{
  "id": "T1.M3.boxing", "track": "T1", "module": "M1.3", "title": "Boxing и unboxing",
  "prereqs": ["T1.M2.value-vs-reference"], "version": "1.0.0", "volatility": "stable",
  "sourceSnapshot": { "dotnet": "net-10.0" }, "reviewBy": "2026-10-01", "status": "published",

  "depth": {
    "intuition": [
      { "id":"i1", "text":"Boxing — «завернуть» значимый тип в объект на куче, чтобы обращаться с ним как с object.",
        "source":"ms-boxing", "status":"fact" }
    ],
    "mechanics": [
      { "id":"m1", "text":"Boxing неявный: CLR оборачивает значение в System.Object и кладёт на управляемую кучу, копируя значение.",
        "source":"ms-boxing", "status":"fact" },
      { "id":"m2", "text":"Unboxing явный: проверяется тип boxed-значения, затем значение копируется в переменную значимого типа.",
        "source":"ms-boxing", "status":"fact" },
      { "id":"m3", "text":"Оригинал и boxed-объект — РАЗНЫЕ ячейки памяти: изменение i после boxing не меняет o.",
        "source":"ms-boxing", "status":"fact" }
    ],
    "spec": [
      { "id":"s1", "text":"«Boxing is implicit; unboxing is explicit… allocates an object instance on the heap and copies the value.» (дословно офдок)",
        "source":"ms-boxing", "status":"fact" }
    ]
  },
  "edgeCases": [
    { "id":"e1", "text":"Unbox null -> NullReferenceException.", "source":"ms-boxing" },
    { "id":"e2", "text":"Unbox в НЕсовместимый тип (напр. (short) от boxed int) -> InvalidCastException, а не тихое приведение.",
      "source":"ms-boxing" }
  ],
  "misconceptions": [
    { "wrong":"(short)o распакует boxed int с усечением.",
      "correction":"Нет: unboxing требует ТОЧНОГО совпадения типа; (short) от boxed int бросает InvalidCastException.",
      "source":"ms-boxing" },
    { "wrong":"Boxing бесплатен, это просто приведение.",
      "correction":"Boxing аллоцирует объект на куче + копирует значение — дороже присваивания; generics его избегают.",
      "source":"ms-boxing" }
  ],
  "rationale": { "id":"r1", "text":"Boxing существует ради унифицированной системы типов: значение любого типа можно трактовать как object.",
    "source":"ms-boxing" },

  "sources": [
    { "id":"ms-boxing", "kind":"microsoft-learn",
      "url":"https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing",
      "section":"Boxing / Unboxing / Performance", "date":"2025-10-13", "retrieved":"2026-07-08" }
  ],
  "identifiers": [
    { "symbol":"System.Object", "kind":"type", "minTfm":"net-1.0" },
    { "symbol":"System.InvalidCastException", "kind":"type", "minTfm":"net-1.0" }
  ],

  "viz": {
    "model":"boxes-and-arrows", "renderer":"svg", "interaction":"responding",
    "entities":[
      {"id":"stack.i","zone":"stack","label":"i:int","value":123},
      {"id":"stack.o","zone":"stack","label":"o:object"}
    ],
    "trace":[
      {"op":"annotate","target":"stack.i","caption":"int i = 123; — значение на стеке","signal":"stack.i"},
      {"op":"alloc","target":"heap.box","args":{"type":"int"},"caption":"object o = i; — boxing: аллокация на КУЧЕ","signal":"heap.box"},
      {"op":"copy","args":{"from":"stack.i","to":"heap.box"},"caption":"значение 123 КОПИРУЕТСЯ в объект","signal":"heap.box"},
      {"op":"pointer","args":{"from":"stack.o","to":"heap.box"},"caption":"o ссылается на boxed-объект","signal":"stack.o"},
      {"op":"annotate","target":"stack.i","args":{"value":456},"caption":"i = 456; — меняем ОРИГИНАЛ","signal":"stack.i"},
      {"op":"highlight","target":"heap.box","caption":"boxed-объект всё ещё 123 — разные ячейки памяти!","signal":"heap.box"}
    ],
    "predictAt":[4]   // «что напечатает Console.WriteLine(o) сейчас?» перед шагом 5
  },

  "codePreamble": "using System;",
  "cards": [
    { "id":"c1","type":"predict-output","engagementLevel":"responding",
      "prompt":"Что напечатает код?",
      "code":"int i = 123; object o = i; i = 456; Console.WriteLine(o);",
      "expectedOutput":"123",           // ЗАПОЛНЕНО G-EXEC из реального stdout (§3.3), не LLM
      "verify":"execute","sourceRefs":["ms-boxing"],"fsrsSeed":{"desiredRetention":0.9} },
    { "id":"c2","type":"find-the-bug","engagementLevel":"changing",
      "prompt":"Почему падает и как починить?",
      "code":"int i = 123; object o = i; int j = (short)o;",
      "expectedOutput":"System.InvalidCastException",
      "verify":"execute","sourceRefs":["ms-boxing"],
      "distractors":["Скомпилируется, j = 123","Усечёт до short молча"] },  // из misconceptions
    { "id":"c3","type":"explain","engagementLevel":"presenting",
      "prompt":"Своими словами: почему boxing дороже присваивания?",
      "verify":"self-graded","sourceRefs":["ms-boxing"] }
  ],

  "verification": {
    "gates": { "G-SCHEMA":"pass","G-CITE":"pass","G-EXIST-API":"pass","G-EXEC":"pass","G-VIZ":"pass" },
    "citationCoverage": 1.0, "humanReviewer":"<expert>", "reviewDate":"2026-07-08",
    "gatesCommit":"<ci-sha>" }
}
```
> Все `expectedOutput` (`123`, `InvalidCastException`) и `depth`/`edgeCases` — **проверены исполнением
> `dotnet run` и дословным офдоком** (§3.1, §3.3), а не сгенерированы моделью. citationCoverage = 1.0.

### 6.2 Пример viz-trace: `T2.M5.hashtable` (коллизии + resize; заземление CLRS ch.11 + .NET Dictionary)

Ключевая точность (RS-04 §4.1 + CLRS): hash-таблица — O(1) средн./O(n) худш.; коллизии решаются цепочками
(separate chaining) ИЛИ открытой адресацией; `Dictionary<K,V>`/`HashSet<T>` в .NET. Resize при факторе
загрузки → перехеширование. Источники карточки: `clrs-ch11` (kind:"clrs") + `ms-dictionary`
(learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2). `identifiers`:
`System.Collections.Generic.Dictionary`2` (type, net-1.0) — проверяется G-EXIST-API.

```jsonc
"viz": {
  "model":"hashtable", "renderer":"svg", "interaction":"changing",
  "entities":[ {"id":"buckets","type":"array","size":8},
               {"id":"keys","type":"stream","values":["cat","dog","fox","owl","ant"]} ],
  "trace":[
    {"op":"insert","target":"buckets","args":{"key":"cat","hash":3},"caption":"hash(cat)%8=3 -> bucket 3","signal":"b3"},
    {"op":"insert","target":"buckets","args":{"key":"dog","hash":6},"caption":"hash(dog)%8=6 -> bucket 6","signal":"b6"},
    {"op":"insert","target":"buckets","args":{"key":"fox","hash":3},"caption":"КОЛЛИЗИЯ в bucket 3 -> цепочка","signal":"b3"},
    {"op":"compare","args":{"key":"fox","against":"cat"},"caption":"идём по цепочке, сравниваем ключи","signal":"b3.chain"},
    {"op":"resize","target":"buckets","args":{"newSize":16},"caption":"load factor высок -> resize x2 + rehash","signal":"buckets"}
  ],
  "predictAt":[2]   // «в какой bucket попадёт fox?» -> покажет коллизию (responding)
}
```
Тот же `viz.trace` → карточка `predict-output` («в какой bucket?»), карточка `compare` (hash vs BST vs
B-tree, RS-04 §4.1), анимация StepPlayer. Один источник данных, три деливеравла. G-VIZ проверяет инвариант
«resize сохраняет все ключи» и «цепочка непуста при коллизии».

---

## 7. Что НЕ удалось выяснить / открытые вопросы

1. **Нет валидированного порога доли LLM-генерации без ревью** для тех.контента (RS-05 §7.3 подтверждает:
   его НЕТ). Следствие: census-ревью опасных тем (Stage 5) — обязателен, не опционален; «AI-исключения» нет.
2. **Нет готового OSS-эталона lesson-as-data**, который одновременно драйвит анимацию И SRS для
   программирования. Схема §5 — синтез (QTI-каркас + LRMI-выравнивание + Anki-note-types + RS-06 trace);
   её нужно валидировать сборкой ≥1 полного модуля и sim-harness пейсинга (пересекается с RS-05 G6).
2a. **Cross-source entailment (Stage 4)** — точность NLI/второй модели на .NET-фактах не измерена; беру как
   сигнал-флаг, не гейт (консервативно). Нужен спайк на 20–30 карточках.
3. **G-VIZ инварианты** для каждого `model` (boxes-and-arrows/stepper/hashtable/swimlane/sankey) прописаны
   концептуально; полный формальный набор инвариантов — задача фазы DESIGN.
4. **write-missing-method в браузере**: hidden tests исполняются в CI (`dotnet`, доказано §3.3), но
   исполнение C# в TMA-WebView — P2 (brief: нужен доп. спайк раннера); в волне 1 write-карточки
   верифицируются на этапе авторинга, у пользователя — как code-reading/предсказание результата тестов.
5. **Версионный diff по `claim.id`** (не обнулять FSRS при неизменном утверждении) — механику пересчёта
   мастерства при апдейте volatile-темы надо спроектировать (пересекается с FSRS-персистентностью RS-01/RS-06).

---

## 8. Реестр покрытия (единицы линзы × статус)

| # | Единица (вопрос ТЗ) | Покрыто | Первоисточник / артефакт |
|---|---|---|---|
| Q1a | Existence-check пакетов | да, исполнено | NuGet flat container 200/404 (spike §3.1) |
| Q1b | Existence-check типов/API | да, исполнено | `dotnet build` CS1061 на выдуманном члене (spike §3.1) |
| Q1c | Заземление факта (cite-then-write) | да, fetched | learn.microsoft.com/boxing ms.date 2025-10-13 (§3.2) |
| Q1d | Answer-execution gate | да, исполнено | `dotnet run box.cs` -> 123/True/InvalidCast (§3.3) |
| Q1e | Edge-cases/misconceptions как данные | да | §5 схема + §6.1 boxing |
| Q2  | LESSON-AS-DATA схема (anim+SRS+viz) | да | JSON Schema §5 |
| Q3a | Секвенирование EP/Brilliant/roadmap.sh | да (наследие RS-03) | §3.5 |
| Q3b | Версионирование T6/T7 | да | §3.5 (volatility/asOf/sourceSnapshot/reviewBy) |
| Q4  | Пайплайн авторинга+верификации + гейты | да | §4 (6 стадий, матрица кто/что) |
| Q5a | Заполненный пример boxing | да | §6.1 |
| Q5b | Заполненный пример hash-таблица (viz) | да | §6.2 |
| Std | Стандарты контента (QTI/LRMI/xAPI) | да | §3.4 (imsglobal.org) |

**Критерий остановки (закрытый корпус вопросов):** 5 под-вопросов линзы × под-единицы — 100% адресованы;
3 из них (existence-check пакет, existence-check API, answer-execution) закрыты ИСПОЛНЕНИЕМ, не описанием.
Открытые единицы (§7) — вынесены, не замолчаны.

---

## 9. Противоречия источников

- **QTI как формат vs каркас:** стандарт полон и авторитетен (1EdTech), но XML-центричен и не кодирует
  «слои глубины» / «параметры анимации». Разрешение: берём ИДЕИ разделения (стимул/обработка/фидбэк), не
  формат. Не конфликт данных, а выбор инструмента.
- **RAG «решает» галлюцинации vs остаточные до 33%** (RS-05): grounding обязателен, но недостаточен →
  поэтому answer-execution + existence-check (детерминированные), а не только «дали источник в контекст».
- **«FSRS −20…30%»** (RS-03/04/05) — уже помечено критиком как непрослеженная модельная оценка; RS-10 её
  НЕ использует: опора на точность (log loss) и на детерминированные гейты, не на объём повторов.
- Инъекций/манипуляций в источниках (NuGet/Microsoft Learn/1EdTech) не обнаружено; все — офиц. первички.

---

## 10. Рекомендация (почему лучше альтернатив, со ссылками)

**Строить контент как LESSON-AS-DATA (§5), где источник — обязательное поле каждого утверждения, и
пропускать каждый урок через 6-стадийный пайплайн (§4) с детерминированными гейтами G-EXIST-PKG /
G-EXIST-API / G-EXEC / G-CITE / G-VIZ, а человека тратить только на census-ревью опасных тем (§4 Stage 5).**

Почему это лучше альтернатив:
- **Против «LLM генерит карточки как есть»:** измеренные 5–20% галлюцинаций + authority bias LLM-судей
  (RS-05) → джун заучит уверенную ошибку, а гиперкоррекция дорогая (RS-05 U4). Наши гейты НЕ спрашивают
  модель «верно ли», а **исполняют** (`dotnet run`), **компилируют** (`dotnet build` → CS1061) и
  **HTTP-проверяют** (NuGet 404) — доказано исполнением в §3, не заявлено.
- **Против «просто Markdown-уроки + отдельные карточки»:** дублирование → рассинхрон факта и его источника.
  Схема с единым `sources`-реестром и `claim.source` даёт **один источник правды**, фанящийся в урок/дрилл/
  карточку/анимацию (RS-04 §7.1; RS-06 R2), и делает «источник на каждое утверждение» механически
  проверяемым (G-CITE, citationCoverage=1.0 = G3 из brief).
- **Против «готовый QTI/LMS-стек»:** QTI не кодирует слои глубины и параметры живого диаграммного движка —
  а именно они закрывают North Star «глубоко, но понятно» (progressive disclosure = CLT, не упрощение) и
  «живая визуализация» (trace ≠ render, RS-06). Свой лёгкий JSON точнее ложится на TMA-бюджет и на FSRS.
- **Против «единоразовой генерации»:** `volatility/asOf/sourceSnapshot/reviewBy` (§3.5) удерживают T6/T7
  от устаревания (RS-04 §7), а diff по `claim.id` не рушит FSRS-историю при апдейте.

Итог: этот пайплайн — прямой ответ на риск №1 (RS-05). Он масштабируется на сотни уроков, потому что
доверие создаётся МАШИНОЙ (детерминированные, воспроизводимые гейты) на 95% объёма и ЧЕЛОВЕКОМ — только
на самых дорогих по цене ошибки темах.

---

## 11. Источники (URL + дата доступа 2026-07-08)

Existence-check / NuGet (A):
- Service Index — https://learn.microsoft.com/en-us/nuget/api/service-index
- Package Content (flat container, 404-семантика) — https://learn.microsoft.com/en-us/nuget/api/package-base-address-resource
- Registration Base URL — https://learn.microsoft.com/en-us/nuget/api/registration-base-url-resource
- Search — https://learn.microsoft.com/en-us/nuget/api/search-query-service-resource
- Живой endpoint (исполнено): https://api.nuget.org/v3-flatcontainer/{id}/index.json

Заземление C#/.NET (A, Microsoft Learn):
- Boxing and Unboxing (ms.date 2025-10-13) — https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing
- Dictionary<TKey,TValue> — https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2
- PriorityQueue<TElement,TPriority> — https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2

Стандарты модели контента / assessment (A):
- QTI 3.0 Overview — https://www.imsglobal.org/spec/qti/v3p0/oview
- QTI 3.0 Info Model (ASI) — https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/imsqti_asi_v3p0p1_infomodel_v1p0.html
- QTI Spec index — https://www.1edtech.org/standards/qti/index
- LRMI / schema.org LearningResource — https://schema.org/LearningResource

CS-каноника (A/B) — для §6.2:
- CLRS «Introduction to Algorithms», 4th ed. 2022, ch.11 (hash tables), ISBN 9780262046305

Наследуемые линзы (корпус пользователя, прочитаны целиком):
- RS-01 (FSRS/типы карточек), RS-03 (EP/Brilliant/roadmap.sh деконструкция), RS-04 (curriculum-дерево),
  RS-05 (риск №1 точность, гейты G1–G8), RS-06 (trace≠render, StepPlayer, SVG), brief.md (G1–G9, срез A).

Артефакты-спайки (исполнено 2026-07-08, вывод в §3):
- NuGet existence-check: `curl` flat container (200 newtonsoft.json/fsrs.core, 404 выдуманный) — §3.1
- API existence-check: `dotnet run ok.cs`/`bad.cs` (CS1061 на Dictionary.TryAddOrUpdate) — §3.1
- Answer-execution: `dotnet run box.cs` → `123 / True / InvalidCast` — §3.3
  (среда: dotnet 10.0.301, node v26.4.0, macOS Darwin 25.5.0)
```
