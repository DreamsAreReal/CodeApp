# GT-M3-s1 — Сводка ground-truth для аудита M3 (уроки S1.4–S1.10)

**Назначение**: чек-лист точности для evaluator-а на гейте **G7** (trace-to-original,
аудит выборки ≥20% уроков — fetch источника и сверка ≥3 ключевых утверждений; бар:
«0 утверждений, не подтверждённых источником»). Для КАЖДОЙ из 7 тем — **топ-6 фактов,
которые обязаны быть в уроке** (с URL первоисточника класса A) + **красные флаги/мифы,
которых урок содержать НЕ должен**.

**Корпус**: нормативная база жанра — официальная документация Microsoft Learn
(C# language reference / fundamentals / programming guide / .NET API), первичка класса A
(версионируется через публичные репозитории `dotnet/docs` и `dotnet-api-docs`, каждая
страница датирована, привязана к git-коммиту; цена подделки высокая).

**Провенанс сводки**: агрегирует четыре GT-исследования, каждое собрано прямым fetch
страниц Learn 2026-07-18:
- `GT-m3-structs-records.md` (S1.4 struct, S1.5 record) — F1–F30, M1–M11.
- `GT-m3-interfaces.md` (S1.6 interfaces/DIM) — F1–F24, 8 мифов.
- `GT-m3-enum-cast.md` (S1.7 enum/flags, S1.10 casts) — F1–F19, M1–M7.
- `GT-m3-generics-nullable.md` (S1.8 generics, S1.9 nullable) — F1–F21, M1–M6.
Ссылки F#/M# ниже указывают на соответствующий GT-файл темы (для быстрой навигации
evaluator-а к дословной цитате-источнику).

**Как пользоваться на G7**: для каждого урока выборки взять его тему ниже → fetch URL(ы)
темы → сверить, что ≥3 «обязательных» факта присутствуют и сформулированы верно →
проверить, что урок НЕ содержит ни одного «красного флага». Любой красный флаг в тексте
урока = провал G7 (утверждение, не подтверждённое / опровергнутое источником).

**Свежесть**: конвенции языка стабильны годами (возраст страниц несущественен, п.3);
версии языка/рантайма (DIM: C# 8.0 / .NET Core 3.0) — нормативный факт, привязан к релизу.

**Карантин инъекций**: во всём собранном внешнем контенте (страницы Learn) инструкций-
манипуляций не обнаружено — чистая техдокументация. Находок «манипуляция источника» нет.

**PII**: объектов-людей в корпусе нет; PII-предохранитель неприменим.

---

## S1.4 — struct (readonly, defensive copy, layout, value-семантика)

**Первоисточники**:
- Structure types (C# reference): https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct
- readonly keyword: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly
- Avoid memory allocations / write-safe-efficient-code: https://learn.microsoft.com/en-us/dotnet/csharp/write-safe-efficient-code

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-structs-records.md):
1. **struct — value type; копируется по значению** при присваивании, передаче аргумента,
   возврате из метода (копируется весь экземпляр). Офдок рекомендует определять
   иммутабельные структуры именно из-за value-семантики. [F1, F2, F14]
2. **`readonly struct` = иммутабельность**: ВСЕ члены-данные обязаны быть read-only
   (поля `readonly`; свойства read-only или `init`). Гарантия: ни один член не меняет
   состояние; все instance-члены кроме конструкторов неявно `readonly`. [F3, F4]
3. **Defensive copy (ядро урока)**: `readonly`-член МОЖЕТ вызвать не-`readonly` член — тогда
   компилятор создаёт КОПИЮ экземпляра и вызывает член на копии; оригинал не меняется.
   То же на стороне вызывающего для `in`/`ref readonly`-параметра. [F6, F15]
4. **`readonly` — это и про перф**: компилятор использует `readonly` для оптимизаций;
   пометка устраняет скрытые defensive copies. [F8]
5. **Layout / default**: переменная struct напрямую содержит данные; `default(T)` даёт
   нулевой битовый паттерн и ИГНОРИРУЕТ parameterless-конструктор (в отличие от `new T()`);
   все поля обязаны быть definitely assigned при создании. [F11, F12]
6. **Ограничения struct**: не наследуется от класса/структуры и не может быть базой (но
   реализует интерфейсы); нет финализатора; конструктор обязан инициализировать все
   instance-поля. Копию по значению больших структур избегают через `ref`/`out`/`in`/
   `ref readonly`. [F13, F14]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «struct нельзя сделать immutable» / «иммутабельность — только для class» — НЕВЕРНО:
  именно для struct офдок рекомендует иммутабельность и даёт `readonly struct`. [M2]
- «`readonly struct` полностью иммутабелен, включая вложенные объекты» — НЕВЕРНО (shallow):
  член мутабельного ссылочного типа может менять своё состояние (нельзя заменить `List<T>`,
  но можно добавить элементы). [M5, F5]
- «`readonly` не влияет на перф, это чисто про корректность» — НЕВЕРНО (defensive copy). [M6]
- «`default(MyStruct)` вызывает parameterless-конструктор» — НЕВЕРНО, игнорирует его. [M10]
- «`readonly`-поле ссылочного типа делает объект неизменяемым» — НЕВЕРНО: запрещает подмену
  ссылки, но не мутацию данных объекта через поле. [M9]

---

## S1.5 — record (value equality, with, синтез методов, record struct vs class)

**Первоисточник**: Records (C# reference):
https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-structs-records.md):
1. **record бывает class И struct**: `record class`/`record` — reference type; `record struct`
   — value type. `class` в `record class` необязателен. [F16]
2. **Value equality (ядро)**: для record-типов два объекта равны, если одного типа и хранят
   одинаковые значения (обычный `class` по умолчанию сравнивается по ссылке). [F18]
3. **Реализация равенства ≠ у struct**: у обычного `struct` — `ValueType.Equals` на РЕФЛЕКСИИ;
   у record — синтез компилятора по объявленным членам (быстрее/предсказуемее). [F19]
4. **Синтез методов**: компилятор синтезирует `Equals`/`GetHashCode`/`operator ==`/`!=`,
   `ToString`(+`PrintMembers`), `Deconstruct` (для позиционных), `EqualityContract` (при
   наследовании). Явно объявлять override `Object.Equals`, `==`/`!=`, `EqualityContract` —
   ОШИБКА компиляции; `Equals(R?)` и `GetHashCode` объявлять можно. [F20, F21, F22]
5. **`with` = nondestructive mutation**: создаёт НОВЫЙ экземпляр (копию с изменёнными полями),
   оригинал не меняется. Результат — SHALLOW copy (ссылочное свойство делит экземпляр). [F23, F24]
6. **Наследование только для `record class`**: record наследует record, но НЕ class (и class
   НЕ record); равенство требует совпадения runtime-типа (`EqualityContract`). Init-only
   свойства дают SHALLOW immutability. [F29, F28]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «record — это всегда class» — НЕВЕРНО: есть `record struct` (value type). [M1]
- «`with` мутирует оригинал» — НЕВЕРНО: создаёт новый экземпляр. [M3]
- «`with` делает глубокую (deep) копию» — НЕВЕРНО: shallow. [M4]
- «два разных типа record с одинаковыми полями равны» — НЕВЕРНО для `record class` (нужен
  совпадающий runtime-тип). [M8]
- «у record можно написать свой `Clone` / переопределить clone-метод» — НЕВЕРНО. [M11]
- «равенство `record struct` и `struct` реализовано одинаково» — определение одинаково,
  реализация разная (рефлексия vs синтез). [M7]

---

## S1.6 — interfaces / explicit vs implicit / Default Interface Methods (DIM)

**Первоисточники**:
- Interfaces (fundamentals): https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces
- Explicit interface implementation: https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation
- `interface` keyword: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface
- DIM tutorial: https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions
- C# version history: https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-interfaces.md):
1. **Интерфейс = контракт** (методы/свойства/события/индексаторы, которые тип обязан
   реализовать); позволяет множественную реализацию контрактов, т.к. C# не поддерживает
   множественное наследование классов. Нельзя инстанцировать. Члены `public` по умолчанию.
   НЕ может содержать instance-полей/instance-конструкторов/финализаторов. [F1, F2, F3]
2. **Explicit vs implicit**: implicit — обычная реализация всех членов; explicit —
   `void IControl.Paint()`, вызывается ТОЛЬКО через ссылку интерфейса, недоступна на
   экземпляре класса напрямую. [F5, F7]
3. **У explicit НЕТ модификатора доступа**: указание `public` → ошибка **CS0106**. [F9]
4. **Когда нужна explicit**: разные члены с одним именем в двух интерфейсах; internal-типы
   в сигнатуре; чтобы дать разные реализации / не засорять публичную поверхность. Одна общая
   реализация (implicit) годится, если устраивают оба интерфейса. [F6, F10, F11]
5. **DIM = тело метода в интерфейсе**: default implementation; появилось в **C# 8.0**
   (сентябрь 2019) и ТРЕБУЕТ поддержки рантайма — доработки CLR в **.NET Core 3.0**
   (не чисто компиляторная фича). [F14, F15, F16]
6. **DIM/explicit доступны ТОЛЬКО через ссылку интерфейса**: класс НЕ наследует члены
   интерфейса; чтобы вызвать default-метод, переменная должна быть типа интерфейса. При
   diamond без most specific implementation — ошибка **CS8705**, разрешает программист. [F8, F18, F22]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «интерфейс не может иметь тело метода» — НЕВЕРНО с C# 8.0 (DIM). [F14, F15]
- «DIM = наследование состояния / полное множественное наследование как в C++» — НЕВЕРНО:
  instance-поля и instance auto-properties в интерфейсах запрещены (только static-поля). [F17]
- «default-метод можно вызвать прямо на экземпляре класса» — НЕВЕРНО (только через
  ссылку интерфейса). [F8, F18]
- «explicit-реализацию надо помечать `public`» — НЕВЕРНО (CS0106). [F9]
- «при diamond компилятор сам выберет реализацию» — НЕВЕРНО (CS8705, разрешает
  программист). [F22]
- «для DIM достаточно C# 8.0, рантайм неважен» — НЕВЕРНО (нужен .NET Core 3.0+). [F16]
- «abstract-члены интерфейса можно сделать `private`/`protected`» — НЕВЕРНО (implicitly
  `public`); произвольные модификаторы только у членов С default-реализацией. [F20]

---

## S1.7 — enum + [Flags]

**Первоисточник**: Enumeration types (C# reference):
https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-enum-cast.md):
1. **enum — value type** из именованных констант **integral**-базового типа; `System.Enum`
   — абстрактный базовый класс всех enum; enum удовлетворяет `struct`-constraint
   (non-nullable value type). [F1, F7]
2. **По умолчанию `int`, старт с 0, +1 по порядку**; базовым можно ЯВНО указать любой другой
   integral-тип (`byte`, `ushort`, `long`…). [F2]
3. **default = `(E)0`** даже если нет члена со значением 0; неявная конверсия литерала/`const`
   `0` → любой enum (может дать невалидное значение; валидируй `Enum.IsDefined`). [F3, F4]
4. **`[Flags]` + степени двойки**: члены = битовые поля (1, 2, 4…), комбинируются `|`/`&`;
   проверка флага — `(x & Flag) == Flag`. [F5, F6]
5. **enum ↔ underlying — ЯВНЫЕ (explicit) касты в обе стороны**; `(int)e` даёт связанное
   целое; неявно конвертируется только `0`. [F8]
6. **enum боксится**: для любого enum существуют boxing/unboxing в/из `System.Enum`
   (enum — value type, боксинг реален). [F9]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «enum всегда `int`» — НЕВЕРНО (можно любой integral). [M1]
- «enum → int конвертируется неявно» — НЕВЕРНО (нужен `(int)`; неявно только `0`). [M6]
- «enum не боксится / это просто int» — НЕВЕРНО (боксинг реален). [M4]
- **Не заявлять фактов про `Enum.HasFlag`** без отдельного источника: страница enum метод
  НЕ упоминает (показывает `&`-паттерн). HasFlag/его перф-оверхед — вне этого источника,
  требует страницы `System.Enum.HasFlag`. [F6, раздел «границы»]

---

## S1.8 — generics (механика, constraints where)

**Первоисточники**:
- Generic types and methods (fundamentals): https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics
- Constraints on type parameters: https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters
- Generics in .NET (standard): https://learn.microsoft.com/en-us/dotnet/standard/generics/

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-generics-nullable.md):
1. **Type parameters + compile-time type safety**: одна версия кода с `T`; компилятор
   проверяет типы на компиляции → нет runtime-кастов и риска `InvalidCastException`. [F1]
2. **Открытый vs закрытый тип**: generic type definition — шаблон с плейсхолдерами, экземпляр
   создать нельзя; constructed (closed) type — результат подстановки конкретных типов. [F2, F3, F4]
3. **Generic method + type inference**: метод обобщён ТОЛЬКО если имеет свой список
   параметров типа (не потому что в generic-типе); компилятор часто выводит `T`. [F5, F6]
4. **НЕТ type erasure**: дженерики C# — с полной runtime-информацией о типах, без стирания
   типов; для value-типов работают БЕЗ боксинга (перф). [F7, F8]
5. **`where`-constraints**: `struct` (non-nullable value type, подразумевает `new()`),
   `class` (reference type), `new()` (public parameterless ctor), базовый класс, интерфейс,
   `notnull` (нарушение → warning), `unmanaged`. Без constraint доступны только члены
   `System.Object`. [F9, F10, F11, F12]
6. **Порядок/взаимоисключение constraints**: максимум один из `struct`/`class`/`class?`/
   `notnull`/`unmanaged` — он первый; `new()` — последний. При `where T : class` избегай
   `==`/`!=` (только ссылочная идентичность). [F13, F14]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «дженерики C# = type erasure, как в Java» — НЕВЕРНО (full runtime type info, no
  erasure; `List<int>` без боксинга). [M3]
- «`where T : struct` разрешает и `Nullable<T>`» — НЕВЕРНО (нужен NON-nullable value
  type; `Nullable<Nullable<int>>` невозможен). [M4]
- Не заявлять как факт Learn про CLR-специализацию нативного кода (раздельная
  кодогенерация per value-type) — в этих страницах ДОСЛОВНО не сформулировано; держать
  тезис строго на «no type erasure» + «без боксинга». [раздел «Не удалось»]

---

## S1.9 — Nullable<T> (nullable value types)

**Первоисточники**:
- Nullable value types (C# reference): https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types
- Nullable<T> Struct (API): https://learn.microsoft.com/en-us/dotnet/api/system.nullable-1

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-generics-nullable.md):
1. **`T?` = `Nullable<T>`**: все значения `T` + `null`; формы взаимозаменяемы; базовый `T`
   сам не может быть nullable value type. [F15]
2. **`Nullable<T>` — это СТРУКТУРА (value type)**: `public struct Nullable<T> where T : struct`,
   наследует `System.ValueType`; «value type that can be assigned null». [F16]
3. **`HasValue` / `Value`**: `Value` при `HasValue == false` бросает
   `InvalidOperationException`; default nullable = `null` (`HasValue == false`). [F17]
4. **Боксинг nullable → `null` ИЛИ boxed `T`** (НЕ boxed `Nullable<T>`): `HasValue==false`
   → `null`; `HasValue==true` → боксится значение базового типа. Поэтому
   `((int?)17).GetType()` → `System.Int32`. Unboxing создаёт новый `Nullable<T>`. [F18, F19]
5. **Lifted operators**: `T?` поддерживает операторы `T`; возвращают `null`, если хоть один
   операнд `null`. Границы: `bool?` `&`/`|` — исключение; сравнения `<`/`>` с `null` → `false`
   (не выводить обратное); `==`/`!=` имеют свои правила. [F20]
6. **Извлечение значения**: `??` / `GetValueOrDefault()` / проверка `HasValue`; явный каст
   `(int)n` при `n==null` бросает `InvalidOperationException`; `T` неявно конвертируется в `T?`. [F21]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «`int?` — это reference type / class» — НЕВЕРНО (структура; `null` = состояние
  `HasValue==false`, не ссылка на кучу). [M1]
- «боксинг `Nullable<T>` даёт boxed `Nullable<T>`» — НЕВЕРНО (даёт `null` или boxed `T`). [M2]
- «`nullableVar.Value` безопасно всегда» — НЕВЕРНО (бросает при `HasValue==false`). [M5]
- «nullable reference types (`string?`) — то же, что nullable value types» — НЕВЕРНО (NRT —
  compile-time аннотации, не структура `Nullable<T>`). [M6]

---

## S1.10 — приведения типов: is / as / cast / typeof

**Первоисточники**:
- Type-testing operators and cast: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast
- Boxing and Unboxing: https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing

**Топ-6 «обязано быть в уроке»** (ref → GT-m3-enum-cast.md):
1. **`is`**: проверяет совместимость run-time типа и/или сопоставляет с паттерном; возвращает
   `bool` (`true` только когда результат non-null и выполнено условие совместимости).
   Не бросает исключение. [F10]
2. **`is` учитывает boxing/unboxing, но НЕ user-defined и НЕ numeric-конверсии**
   (`iBoxed is long` → `False`). Поддерживает pattern matching (`E is T v`). [F11, F12]
3. **`as`**: явно преобразует в reference/nullable value-тип; при неудаче возвращает `null`,
   НИКОГДА не бросает; учитывает только reference/nullable/boxing/unboxing (не user-defined). [F13, F14]
4. **cast `(T)E`**: нет явного преобразования → ошибка компилятора; в run-time может НЕ
   удаться и БРОСИТЬ (обычно `InvalidCastException`). Только cast выполняет user-defined
   конверсии; `is`/`as`/`typeof` перегрузить нельзя. [F15, F16]
5. **`typeof`**: возвращает `System.Type`; аргумент — ИМЯ типа/параметра типа, НЕ выражение;
   для run-time типа значения — `Object.GetType()`. `typeof(T)` даёт ТОЧНОЕ совпадение (без
   наследования), `is` учитывает наследование. [F17, F18]
6. **Boxing/unboxing**: boxing неявный (аллоцирует на куче + копирует), unboxing явный
   (требует каст, проверяет тип); unbox `null` → `NullReferenceException`, unbox в
   несовместимый тип → `InvalidCastException`. [F19]

**Красные флаги / мифы (урок НЕ должен содержать)**:
- «`as` бросает исключение» — НЕВЕРНО (возвращает `null`; бросает cast `(T)E`). [M2]
- «`is` возвращает приведённый объект» / «`is` бросает» — НЕВЕРНО (`bool`, не бросает,
  `false` при несовместимости/null). [M3]
- «`typeof(x)` работает с переменной/экземпляром» — НЕВЕРНО (аргумент — имя типа;
  для значения — `GetType()`). [M7]
- Не утверждать «`is` всегда боксит» / «`is` никогда не боксит» без IL-артефакта — уровень
  реализации, страница Learn такого не даёт (непроверено на уровне IL). [M5]

---

## Реестр покрытия сводки (закрытый корпус: 7 тем)

| Тема | URL(ы) первоисточника | Топ-6 | Красные флаги | Статус |
|---|---|---|---|---|
| S1.4 struct | struct + readonly + write-safe-efficient-code | да (F1,F2,F3,F4,F6,F8,F11–F14) | да (M2,M5,M6,M9,M10) | закрыто |
| S1.5 record | record | да (F16,F18,F19,F20,F23,F24,F28,F29) | да (M1,M3,M4,M7,M8,M11) | закрыто |
| S1.6 interfaces/DIM | interfaces + explicit + interface kw + DIM tutorial + version-history | да (F1–F3,F5,F7,F9,F10,F14–F16,F18,F22) | да (7 мифов) | закрыто |
| S1.7 enum/flags | enum | да (F1–F9) | да (M1,M4,M6 + HasFlag-граница) | закрыто |
| S1.8 generics | generics + constraints + standard | да (F1–F14) | да (M3,M4 + CLR-граница) | закрыто |
| S1.9 nullable | nullable-value-types + Nullable`<T>` API | да (F15–F21) | да (M1,M2,M5,M6) | закрыто |
| S1.10 casts | type-testing-and-cast + boxing | да (F10–F19) | да (M2,M3,M7 + IL-граница) | закрыто |

Все 7 запрошенных тем закрыты (100% замороженного скоупа): у каждой ≥6 обязательных
фактов с URL + список красных флагов. Критерий остановки закрытого корпуса выполнен.

## Границы / что осознанно вне сводки (для evaluator-а — НЕ требовать в уроках)

- `Enum.HasFlag` (S1.7): факты не собраны — источник enum метод не упоминает; если урок
  утверждает про HasFlag, evaluator обязан требовать отдельный источник
  (`System.Enum.HasFlag`), иначе — красный флаг.
- Низкоуровневый `StructLayout`/`Pack`/выравнивание (S1.4): вне страницы struct
  (отдельный API `StructLayoutAttribute`).
- CLR-специализация нативного кода дженериков (S1.8) и IL-уровень боксинга при `is` (S1.10):
  дословно не в страницах Learn — требуют IL-артефакта/BOTR-источника; в уроке допустимы
  только как явно помеченный «уровень ниже» с отдельным источником, не как факт Learn.
- Точная лестница приоритетов «most specific implementation» (S1.6): в утверждениях —
  только формулировка со страницы compiler-messages; полная спецификация — отдельный fetch
  language-specification/interfaces.

## Противоречия источников

Не обнаружено. Все страницы одного издателя (Microsoft Learn / dotnet/docs / dotnet-api-docs),
взаимно согласованы; ключевые факты (боксинг nullable, версия DIM) подтверждены ≥2
независимыми типами страниц.
