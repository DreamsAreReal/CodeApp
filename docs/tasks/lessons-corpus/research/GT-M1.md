# GT-M1 — Сводка ground-truth для аудита M1

Назначение: единый чек-лист точности для evaluator-а на гейте **G7 (trace-to-original)**.
Сводит четыре GT-файла корпуса `lessons-corpus` в: (1) оглавление источников,
(2) по каждой из 3 тем уроков — топ-8 «обязано быть в уроке» фактов с URL,
(3) чек-лист планки урока из шпаргалки движка, (4) красные флаги (мифы/ошибки,
которых в уроке быть НЕ должно).

Корпус: **закрытый** — 4 заданных GT-файла, все прочитаны целиком (100% скоупа).
Первичка внутри GT-файлов — класс **A** (Microsoft Learn / dotnet-docs, git-история;
код репозитория движка). Дата сборки сводки: 2026-07-18.

Важно (провенанс меток): каждый GT-файл использует СВОЮ локальную нумерацию источников
`S1..S5`. Здесь метки не переиспользуются — факты даны с ПРЯМЫМ URL, чтобы evaluator мог
делать trace-to-original без разрешения локальных алиасов. Метка `Fn` в скобках — номер
факта в исходном GT-файле (для обратной трассировки).

---

## 1. Оглавление четырёх источников (GT-файлы)

| GT-файл | Тема | Корпус / провенанс |
|---|---|---|
| `research/GT-s1-type-system.md` | Типовая система C#: CTS, value vs reference, compile-time vs run-time тип | Нормативная база (Microsoft Learn), первичка A; 20 фактов F1–F20 |
| `research/GT-s1-value-copy.md` | Value types: семантика копирования, layout, стек/куча, боксинг/распаковка | Нормативная база (Microsoft Learn), первичка A; 16 фактов F1–F16 |
| `research/GT-s1-virtual-dispatch.md` | Классы, наследование, virtual dispatch, new/override/sealed/abstract | Нормативная база (Microsoft Learn), первичка A; 21 факт F1–F21 |
| `research/GT-engine-cheatsheet.md` | Деконструкция ДВИЖКА авторинга уроков (тип-контракт `LessonData`, layout, планка плотности) | Код репозитория (первичка A); эталоны `boxing.ts`, `py-generators.ts` |

Базовые URL источников (Microsoft Learn, en-us), встречающиеся ниже:

- **[types]** https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/
- **[value-types]** https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types
- **[ref-types-kw]** https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types
- **[builtin-ref]** https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types
- **[CTS]** https://learn.microsoft.com/en-us/dotnet/standard/base-types/common-type-system
- **[boxing]** https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing
- **[inheritance]** https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance
- **[polymorphism]** https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism
- **[virtual]** https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual
- **[sealed]** https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed
- **[versioning]** https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/versioning-with-the-override-and-new-keywords

---

## 2. Топ-8 «обязано быть в уроке» по каждой из 3 тем

Критерий отбора: факт первичен для темы, подтверждён ≥1 страницей A (по возможности ≥2
независимыми подсекциями), высокая уверенность в исходном GT-файле. Evaluator на G7
сверяет утверждение урока с этим фактом → trace до указанного URL.

### Тема A — Типовая система: CTS, value vs reference, compile-time vs run-time

| # | Обязательный факт | URL (trace-to-original) | GT-ссылка |
|---|---|---|---|
| A1 | Каждый тип в C# — либо value type, либо reference type; это деление определяет, КАК переменная хранит данные и как работает присваивание. | [types] + подтв. [CTS], [ref-types-kw] | type-system F1 |
| A2 | Все типы в итоге наследуют от `System.Object`; value-типы — от `System.ValueType` (который сам от `object`). Единая иерархия = Common Type System (CTS). | [types] + подтв. [builtin-ref], [CTS] | type-system F2 |
| A3 | Переменная value-типа СОДЕРЖИТ сам экземпляр (данные напрямую); переменная reference-типа содержит ССЫЛКУ на экземпляр. | [value-types] + подтв. [types], [ref-types-kw] | type-system F5 / value-copy F1 |
| A4 | По умолчанию при присваивании, передаче аргумента и возврате КОПИРУЮТСЯ значения; для value-типа копируется сам экземпляр — изменения одной переменной не трогают другую. | [value-types] + подтв. [types], [CTS] | type-system F6 / value-copy F4,F5 |
| A5 | Присваивание reference-типа новой переменной: обе переменные указывают на ОДИН объект в managed heap; изменения через одну видны через другую. | [types] + подтв. [ref-types-kw], [CTS] | type-system F12 |
| A6 | Compile-time тип = объявленный/выведенный в исходнике; run-time тип = фактический тип экземпляра. Run-time тип совпадает с compile-time или является производным/реализующим. | [types] | type-system F16 |
| A7 | Compile-time тип управляет overload resolution и доступными преобразованиями; run-time тип управляет virtual dispatch, `is`- и `switch`-выражениями. | [types] + подтв. [CTS] (виртуальный вызов по run-time типу) | type-system F17 |
| A8 | `object` конвертирует value-тип в ссылку → boxing; обратно → unboxing. `string` — reference-тип, НО `==`/`!=` сравнивают значения; строки immutable. | [builtin-ref] + подтв. [CTS] | type-system F14, F15 |

### Тема B — Value types: копирование, боксинг, распаковка

| # | Обязательный факт | URL (trace-to-original) | GT-ссылка |
|---|---|---|---|
| B1 | Переменная value-типа содержит сам экземпляр (не ссылку); `null` нельзя присвоить value-типу, кроме nullable `T?`. | [value-types] | value-copy F1, F2 |
| B2 | Виды value-типов: `struct`, `enum`, union; все простые типы (integral, floating-point, `bool`, `char`) — struct-типы; value tuple — value type, но не простой. | [value-types] | value-copy F3 |
| B3 | Если value-тип содержит поле reference-типа — при копировании копируется ТОЛЬКО ссылка; копия и оригинал делят один reference-экземпляр (shallow copy). | [value-types] | value-copy F6 |
| B4 | Boxing = конвертация value-типа в `object`/интерфейс: CLR оборачивает значение в `System.Object` и кладёт в managed heap; выделяет новый объект и КОПИРУЕТ значение. | [boxing] | value-copy F8, F10 |
| B5 | Boxing неявный, unboxing явный. `object o = i;` — ссылка `o` (на стеке в этом примере) на копию значения `int` в куче. | [boxing] | value-copy F9, F11 |
| B6 | Оригинал и боксированный объект — РАЗНЫЕ области памяти: после `object o = i; i = 456;` значение `o` остаётся `123`. | [boxing] | value-copy F12 |
| B7 | Unboxing = явное преобразование `object`→value-тип: проверка, что это боксированное значение ИМЕННО этого типа, + копирование. `null` → `NullReferenceException`; несовместимый тип → `InvalidCastException` (требуется точный тип, не «совместимый по конверсии»). | [boxing] | value-copy F14, F15 |
| B8 | Boxing/unboxing вычислительно дороги относительно простых присваиваний (новая аллокация + конструирование объекта; каст при распаковке тоже дорог). Конкретных чисел офдок НЕ даёт — только качественно. | [boxing] | value-copy F16 |

### Тема C — Классы, наследование, virtual dispatch

| # | Обязательный факт | URL (trace-to-original) | GT-ссылка |
|---|---|---|---|
| C1 | Производный класс имеет только ОДИН прямой базовый класс, но наследование транзитивно; наследуются все члены базового КРОМЕ конструкторов и финализаторов. | [inheritance] | virtual-dispatch F1, F2 |
| C2 | По умолчанию методы НЕ виртуальны; невиртуальный метод переопределить нельзя. | [virtual] + [versioning] | virtual-dispatch F4 |
| C3 | Переопределить член можно ТОЛЬКО если он `virtual`/`abstract`, и переопределяющий член ОБЯЗАН иметь `override`. Виртуальными могут быть методы/свойства/события/индексаторы — поля НЕ могут. | [polymorphism] | virtual-dispatch F5, F6 |
| C4 | (Ядро dispatch) В рантайме CLR смотрит на РАН-ТАЙМ тип объекта и вызывает соответствующий override — вызов метода на базовом типе может выполнить версию производного класса. | [polymorphism] + [virtual] | virtual-dispatch F7, F8, F9 |
| C5 | `new` СКРЫВАЕТ (hides), а не переопределяет: при скрытии вызванный метод зависит от КОМПАЙЛ-ТАЙМ (объявленного) типа переменной, а не от рантайм-типа объекта. Контраст-пара с override. | [polymorphism] | virtual-dispatch F12, F13 |
| C6 | Если метод в производном классе не помечен ни `new`, ни `override` → предупреждение компилятора CS0108, поведение как при `new` (скрытие — дефолт). | [versioning] + [inheritance] | virtual-dispatch F15 |
| C7 | `sealed` на классе запрещает наследование; `sealed override` на члене останавливает дальнейшее переопределение (ставится перед `override`), класс при этом наследовать можно; попытка override → CS0239. | [sealed] + [polymorphism] | virtual-dispatch F18, F19 |
| C8 | `abstract`-член ОБЯЗАН быть переопределён в любом не-абстрактном прямом наследнике; абстрактный класс нельзя инстанцировать через `new`. Структуры не поддерживают наследование (неявно `sealed`), но реализуют интерфейсы. | [inheritance] + [sealed] | virtual-dispatch F21, F3 |

---

## 3. Чек-лист планки урока (из GT-engine-cheatsheet)

Источник истины: код репозитория движка + LOCKED-эталоны `app/src/lessons/boxing.ts`
(7 разборов + IL) и `app/src/lessons/py-generators.ts` (6 разборов). Первичка A.
Это то, чему деливерабл-урок ОБЯЗАН соответствовать, чтобы пройти планку жанра (G7 плотность).

**Счётчики (планка плотности):**
- [ ] Сегментов (анимир. разборов): флагман **≥6** (boxing=7, py-generators=6); стандартный ≥2–3. Один нюанс/мисконцепция = ОДИН сегмент.
- [ ] Сцен на сегмент: **2–4**, и КАЖДЫЙ переход между сценами содержателен (реальное Δ графа, не косметика).
- [ ] `takeaways`: ровно **3** — по одному `why` / `cost` / `avoid`.
- [ ] `misconceptions`: ≥1, с HTML-`hook` (секция 1 урока = refutation мисконцепции сеньора).
- [ ] `spec` + `edgeCases`: непустые; каждый `Claim` со `source`.
- [ ] Карточки: тип `predict-output` с непустым `verify.expect` → текстовый ввод (генерация вывода, не выбор); лесенка `predict → modify → explain`.

**Динамичность сегмента (критерий G7 `density.mjs`):**
- [ ] `scenes.length ≥ 2` И ≥1 признак Δ между соседними кадрами: Δ множества узлов (enter/exit) · Δ рёбер · Δ размещения `at` (FLIP) · Δ полей узла (`value`/`state`/`accent`/`ghost`/`typeTag`).
- [ ] Сегмент с 1 сценой ИЛИ идентичными кадрами → флаг «статичный / провал плотности».
- [ ] У каждого сегмента непустой `explain` с ДОСЛОВНОЙ цитатой первоисточника (`«…»`) и ≥1 `sources[]`; непустой `caption` у КАЖДОГО кадра.

**Машинный слой (глубина «сеньор»):**
- [ ] Для C#: байткод-панель `il[]` (`{off, op, arg, cmt}`), опкоды/hex — РЕАЛЬНЫЕ из первоисточника (напр. `box` 0x8C, `unbox.any` 0xA5), НЕ выдуманы; синхронна через `scene.ilLine`.
- [ ] Для Python: dis/байткод-панель (badge по `lang`).
- [ ] Консоль-панель (`console:true` + `scene.out`) в predict-разборах; gate-узел = «машинный вердикт» (`state:"ok"/"fail"` + `label` + `detail`, напр. `InvalidCastException`).

**Тон и провенанс:**
- [ ] Тон СЕНЬОР, без азов/сюсюканья; глубина на машинный уровень (IL, память, GC), вплетена в поток (НЕ отдельный аккордеон «копнуть глубже»).
- [ ] Все числа/опкоды/цитаты — из первоисточника/исполнения (не из памяти). `status:"verified"` ставится ТОЛЬКО после зелёного G2/G-EXEC (иначе `self-pass`).
- [ ] Дизайн-токены mid (cream/coral/sage/amber; Rubik+Onest+JetBrains Mono; line-SVG иконки, НЕ эмодзи; без золота/тёмного-кино/Inter).

---

## 4. Красные флаги — чего в уроке быть НЕ должно

Типичные мифы/ошибки по этим темам. Каждый флаг обоснован границей из GT-файла с URL для
trace. Если урок содержит утверждение из этого списка как ФАКТ — провал точности на G7.

### По памяти/layout (типовая система, value types)

- [ ] **«Value-типы ВСЕГДА живут на стеке» / «value → stack, reference → heap» как закон.**
  НЕВЕРНО как универсальное правило. Microsoft НЕ формулирует это как язык-гарантию:
  офдок говорит лишь «value-типы hold their data directly», reference-ОБЪЕКТ живёт «on the
  managed heap». Value-тип может жить inline в поле объекта на куче, в боксе, в замыкании,
  в `async`-стейт-машине. Формулировка «на стеке» в [boxing] относится к КОНКРЕТНОМУ
  примеру локальной переменной, не к закону. Trace: [types], [value-types], [boxing] (F11),
  [CTS]. (Границы: type-system B1; value-copy «что не удалось»/F11.)

- [ ] **«Строки — value type».** НЕВЕРНО: `string` — REFERENCE-тип. Ловушка в том, что
  `==`/`!=` сравнивают ЗНАЧЕНИЯ, а строки immutable — но это не делает тип value-типом.
  Trace: [builtin-ref] (F15), [types] (F13).

- [ ] **«При копировании struct с полем-списком/массивом копируется и содержимое (deep copy)».**
  НЕВЕРНО: копируется только ССЫЛКА на reference-поле; копия и оригинал делят один
  reference-экземпляр (shallow). Trace: [value-types] (F6). (value-copy F6.)

- [ ] **«Оригинал и боксированный объект — одна память / мутация оригинала меняет бокс».**
  НЕВЕРНО: разные области памяти; после боксинга изменение оригинала не трогает копию в куче.
  Trace: [boxing] (F12). (value-copy F12.)

- [ ] **«Unbox работает по совместимости типов (напр. `int`→`short`)».** НЕВЕРНО: распаковка
  требует ТОЧНОГО типа; `(short)o` где `o` боксит `int` → `InvalidCastException`, а не тихая
  конверсия. `null` → `NullReferenceException`. Trace: [boxing] (F15). (value-copy F15.)

- [ ] **Конкретные числа стоимости боксинга (нс, байты), выданные за факт из офдока.**
  Офдок даёт ТОЛЬКО качественную оценку «дорого + новая аллокация». Любые числа обязаны
  идти из бенчмарк-артефакта (исполнение), не из памяти/офдока. Trace: [boxing] (F16). (value-copy F16.)

### По наследованию/dispatch

- [ ] **«Все методы в C# виртуальны по умолчанию» (как в Java).** НЕВЕРНО: по умолчанию
  методы НЕ виртуальны; переопределение требует `virtual`/`abstract` + `override`.
  Trace: [virtual], [versioning] (F4), [polymorphism] (F5).

- [ ] **«`new` переопределяет метод» / «override и new — одно и то же».** НЕВЕРНО: `new`
  СКРЫВАЕТ (по компайл-тайм типу переменной), `override` переопределяет (по рантайм-типу
  объекта). Использовать `new` и `override` вместе на одном члене — ошибка (взаимоисключающие).
  Trace: [polymorphism] (F12, F13), [versioning]. (virtual-dispatch F12, F14.)

- [ ] **«Виртуальный вызов разрешается по типу ПЕРЕМЕННОЙ (компайл-тайм)».** НЕВЕРНО для
  override: `BaseClass A = derived; A.DoWork()` вызывает ПЕРЕОПРЕДЕЛЁННУЮ версию (рантайм-тип).
  По компайл-тайм типу разрешается только скрытие (`new`). Trace: [polymorphism] (F7, F9, F12).

- [ ] **«Структуры можно наследовать» / «от struct можно унаследоваться».** НЕВЕРНО:
  структуры неявно `sealed`, наследование не поддерживают (реализуют интерфейсы).
  Trace: [inheritance], [sealed] (F3).

- [ ] **«Поля могут быть virtual».** НЕВЕРНО: виртуальными могут быть только методы,
  свойства, события, индексаторы. Trace: [polymorphism] (F6).

- [ ] **Термин «method table / vtable» приписан документации C# fundamentals.** На страницах
  Learn C# fundamentals этого термина НЕТ — механика формулируется как «CLR looks up the
  run-time type… invokes that override». Заявлять vtable как факт из этих страниц нельзя
  (требует отдельной линзы ECMA-335 §I.8.10 / dotnet BOTR). Trace: virtual-dispatch F7 прим.,
  реестр «НЕПОКРЫТО».

### По движку/планке (провенанс)

- [ ] **Выдуманные опкоды/hex/числа/цитаты** (не из первоисточника или реального исполнения).
  Trace: engine-cheatsheet §4 «Провалы планки».
- [ ] **`status:"verified"` без зелёного G2/G-EXEC.** Trace: engine-cheatsheet §1.1, §4.
- [ ] **«1 анимация + буллеты с нюансами»** вместо сегмента-на-нюанс; нюанс «упомянут строкой»,
  а не ПОКАЗАН анимацией; отдельный аккордеон «копнуть глубже»; азы/сюсюканье. Trace: §4.

---

## 5. Реестр покрытия сводки

Закрытый корпус: 4 заданных GT-файла, все прочитаны целиком (100%). Извлечено:
- Оглавление: 4/4 источника.
- Топ-8 фактов × 3 темы = 24 обязательных факта, каждый с прямым URL trace-to-original
  и обратной ссылкой на `Fn` исходного GT-файла.
- Чек-лист планки: сведён из engine-cheatsheet §1–§4 (счётчики, динамичность, машинный
  слой, тон, провенанс).
- Красные флаги: 15 мифов/ошибок, каждый с URL-обоснованием границы.

Границы сводки:
- Метки `S1..S5` в исходных GT-файлах локальны и НЕ едины между файлами — здесь заменены
  прямыми URL, чтобы избежать циркулярности алиасов на G7.
- Факт «compile-time vs run-time тип» (A6, A7) в type-system опирается преимущественно на
  ОДНУ страницу A ([types], помеченную `ai-usage: ai-assisted`), частично подтверждён [CTS].
  Исходный GT рекомендует при спорных формулировках доп. сверку с C# language specification §8.2 —
  перенесено сюда как оговорка для evaluator-а.
- «Layout struct (паддинг/`StructLayout`/размер)» и количественные метрики боксинга —
  вне заданного корпуса; в уроке подавать только с отдельным артефактом-исполнением.
