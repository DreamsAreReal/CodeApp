# GT-s1 — Типовая система C#: CTS, value vs reference, compile-time vs run-time тип

Ground-truth факты для сверки будущего урока с первоисточником. Корпус — **нормативная
база жанра** (официальная документация Microsoft Learn / dotnet-docs). Все страницы
поддерживаются мейнтейнером dotnet/docs (BillWagner / adegeo), имеют git-историю
коммитов и свежие даты обновления — первичка класса **A**.

Дата сбора: 2026-07-18. Все URL — en-us Microsoft Learn.

## Классы источников и провенанс

| Источник | URL | ms.date / updated | Класс | Провенанс |
|---|---|---|---|---|
| S1 The C# type system | learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/ | ms.date 2026-03-24, updated 2026-04-06 | A | dotnet/docs, git-история; **флаг `ai-usage: ai-assisted`** — факты сверены с S2/S3 |
| S2 Value types (C# reference) | learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types | ms.date 2026-03-20, updated 2026-03-24 | A | dotnet/docs, git-история; не ai-assisted |
| S3 Reference types (keyword) | learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types | ms.date 2026-01-22, updated 2026-01-26 | A | dotnet/docs, git-история |
| S4 Built-in reference types | learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types | ms.date 2026-01-14, updated 2026-05-19 | A | dotnet/docs, git-история |
| S5 Common Type System (.NET) | learn.microsoft.com/en-us/dotnet/standard/base-types/common-type-system | ms.date 2024-01-03, updated 2026-03-30 | A | dotnet/docs, git-история; norма CTS стабильна годами |

Независимость каналов: value/reference-семантика подтверждается S1 (fundamentals),
S2/S3 (C# language reference) и S5 (.NET standard) — три разные подсекции документации,
не цитирующие друг друга дословно. Ключевые утверждения опираются на ≥2 независимых
страницы.

---

## Проверяемые факты (утверждение → источник → цитата)

### Блок A. CTS и единая иерархия типов

**F1.** Каждый тип в C# — это либо value type, либо reference type; это деление
определяет, как переменные хранят данные и как работает присваивание. [S1]
> "Every type in C# is either a *value type* or a *reference type*. This distinction
> determines how variables store data and how assignment works."
Подтверждение: [S5] "All types in .NET are either value types or reference types.";
[S3] "C# has two kinds of types: reference types and value types."

**F2.** Все типы в конечном счёте наследуются от `System.Object`; value-типы
наследуются от `System.ValueType`, который наследуется от `object`. Эта единая иерархия
называется Common Type System (CTS). [S1]
> "All types ultimately derive from System.Object. Value types derive from
> System.ValueType, which derives from `object`. This unified hierarchy is called the
> Common Type System (CTS)."
Подтверждение: [S4] "all types, predefined and user-defined, reference types and value
types, inherit directly or indirectly from System.Object."; [S5] "A structure is a
value type that derives implicitly from System.ValueType, which in turn is derived from
System.Object."

**F3.** CTS выполняет кросс-языковую интеграцию, type safety и высокопроизводительное
исполнение; задаёт правила, которым языки должны следовать, чтобы объекты на разных
языках взаимодействовали. [S5]
> "Establishes a framework that helps enable cross-language integration, type safety,
> and high-performance code execution."
> "Defines rules that languages must follow, which helps ensure that objects written in
> different languages can interact with each other."

**F4.** CTS поддерживает пять категорий типов: классы, структуры, перечисления,
интерфейсы, делегаты. [S5]
> "The common type system in .NET supports the following five categories of types:
> Classes, Structures, Enumerations, Interfaces, Delegates."

### Блок B. Value types — что хранится, что копируется, где живёт

**F5.** Переменная value-типа СОДЕРЖИТ сам экземпляр типа (данные напрямую), в отличие
от переменной reference-типа, которая содержит ссылку на экземпляр. [S2]
> "A variable of a value type contains an instance of the type. This behavior differs
> from a variable of a reference type, which contains a reference to an instance of the
> type."
Подтверждение: [S3] "variables of value types directly contain their data.";
[S1] "**Value types** hold their data directly."

**F6.** По умолчанию при присваивании, передаче аргумента в метод и возврате результата
значения переменных КОПИРУЮТСЯ; для value-типа копируется сам экземпляр. Изменения одной
переменной не затрагивают другую. [S2]
> "By default, on assignment, passing an argument to a method, and returning a method
> result, you copy variable values. In the case of value-type variables, you copy the
> corresponding type instances."
> "operations on a value-type variable affect only that instance of the value type,
> stored in the variable."
Подтверждение: [S1] "When you assign a value type to a new variable, the runtime copies
the data. Changes to one variable don't affect the other."; [S5] "If an instance of a
value type is assigned to a variable, that variable is given a fresh copy of the value."

**F7.** Если value-тип содержит поле reference-типа, то при копировании экземпляра
value-типа копируется ТОЛЬКО ссылка; и копия, и оригинал получают доступ к тому же
самому reference-экземпляру. [S2]
> "If a value type contains a data member of a reference type, you copy only the
> reference to the instance of the reference type when you copy a value-type instance.
> Both the copy and original value-type instance have access to the same reference-type
> instance."

**F8.** Value-тип может быть: структурой (`struct`), перечислением (`enum`) или union.
Nullable value type `T?` добавляет значение `null`; `null` нельзя присвоить переменной
value-типа, если это не nullable value type. [S2]
> "A [nullable value type] `T?` represents all values of its underlying value type `T`
> and an additional `null` value. You can't assign `null` to a variable of a value type,
> unless it's a nullable value type."

**F9.** Встроенные простые типы (integral, floating-point, `bool`, `char`) — все
являются struct-типами; они value-типы. [S2]
> "All simple types are struct types."
Подтверждение: [S5] "In .NET, all primitive data types (Boolean, Byte, Char, DateTime,
Decimal, Double, Int16, Int32, ...) are defined as structures."

**F10.** Все value-типы sealed: от них нельзя наследовать; они неявно наследуют от
`System.ValueType`, но не могут напрямую наследовать от другого типа. [S5]
> "although they implicitly inherit from System.ValueType, they cannot directly inherit
> from any type. Similarly, all value types are sealed, which means that no other type
> can be derived from them."

**F11.** Все value-типы имеют неявный конструктор без параметров, реализованный CLR,
который инициализирует все поля значениями по умолчанию. [S5]
> "All value types do have an implicit parameterless constructor. This constructor is
> implemented by the common language runtime and initializes all fields of the structure
> to their default values."

### Блок C. Reference types — ссылка vs объект, куча

**F12.** Переменная reference-типа содержит ССЫЛКУ на объект в managed heap. При
присваивании reference-типа новой переменной обе переменные указывают на ОДИН объект;
изменения через одну видны через другую. [S1]
> "**Reference types** hold a reference to an object on the managed heap. When you
> assign a reference type to a new variable, both variables point to the same object.
> Changes through one variable are visible through the other."
Подтверждение: [S3] "Variables of reference types store references to their data
(objects) ... two variables can reference the same object. Therefore, operations on one
variable can affect the object referenced by the other variable."; [S5] "Reference types
are data types whose objects are represented by a reference (similar to a pointer) to the
object's actual value. ... that variable references (points to) the original value. No
copy is made."

**F13.** Классы, массивы, делегаты и строки — reference-типы. Ключевые слова для
объявления reference-типов: `class`, `interface`, `delegate`, `record`. Встроенные
reference-типы: `dynamic`, `object`, `string`. [S1] / [S3]
> [S1] "Classes, arrays, delegates, and strings are reference types."
> [S3] "Use the following keywords to declare reference types: class, interface,
> delegate, record. C# also provides the following built-in reference types: dynamic,
> object, string."

**F14.** `object` — псевдоним для `System.Object`. При конвертации переменной value-типа
в `object` значение УПАКОВЫВАЕТСЯ (boxed); при обратной конвертации — распаковывается
(unboxed). [S4]
> "The `object` type is an alias for System.Object in .NET. ... When you convert a value
> type variable to `object`, the value is *boxed*. When you convert a variable of type
> `object` to a value type, the value is *unboxed*."
Подтверждение: [S5] "For each value type, the common language runtime supplies a
corresponding boxed type, which is a class that has the same state and behavior as the
value type. An instance of a value type is boxed when it is passed to a method that
accepts a parameter of type System.Object."

**F15.** `string` — reference-тип, НО операторы `==`/`!=` сравнивают ЗНАЧЕНИЯ строк, а
не ссылки (value-based equality). Строки immutable: содержимое нельзя изменить после
создания — компилятор создаёт новый string-объект. [S4]
> "Although `string` is a reference type, the equality operators `==` and `!=` compare
> the values of `string` objects, not references."
> "Strings are *immutable* - you can't change the contents of a string object after you
> create it. ... the compiler actually creates a new string object to hold the new
> sequence of characters."

### Блок D. Compile-time тип vs run-time тип — что делает компилятор

**F16.** Переменная может иметь РАЗНЫЕ типы в compile time и run time. Compile-time тип
— объявленный или выведенный тип в исходнике; run-time тип — фактический тип экземпляра,
на который ссылается переменная. Run-time тип должен совпадать с compile-time типом или
быть производным/реализующим его. [S1]
> "The *compile-time type* is the declared or inferred type in source code. The
> *run-time type* is the actual type of the instance the variable refers to. The
> run-time type must be the same as the compile-time type, or a type that derives from
> it or implements it."

**F17.** Compile-time тип управляет разрешением перегрузок (overload resolution) и
доступными преобразованиями; run-time тип управляет диспетчеризацией виртуальных методов,
`is`- и `switch`-выражениями. [S1]
> "The compile-time type controls overload resolution and available conversions. The
> run-time type controls virtual method dispatch, `is` expressions, and `switch`
> expressions."
Подтверждение (виртуальный вызов по run-time типу): [S5] "If dynamic invocation is used,
the type of the instance that makes the call at runtime (rather than the type known at
compile time) determines which implementation of the method is called."

**F18.** Компилятор обеспечивает type safety, проверяя корректность операций на этапе
компиляции (до запуска); он встраивает информацию о типах в исполняемый файл как
метаданные, которые CLR использует для доп. проверок в run time. [S1]
> "The compiler enforces *type safety* by checking that every operation in your code is
> valid for the types involved."
> "Type safety catches errors at compile time, before your code runs. The compiler also
> embeds type information into the executable as metadata, which the common language
> runtime (CLR) uses for additional safety checks at run time."

**F19.** `dynamic` обходит проверку типов на этапе компиляции — операции разрешаются в
run time. Переменные `dynamic` компилируются в переменные типа `object`; тип `dynamic`
существует только в compile time, но не в run time. [S4]
> "The `dynamic` type indicates that the variable and references to its members bypass
> compile-time type checking. Instead, these operations are resolved at run time."
> "variables of type `dynamic` are compiled into variables of type `object`. Therefore,
> type `dynamic` exists only at compile time, not at run time."

**F20.** Присваивание допустимо только когда существует НЕЯВНОЕ преобразование от
run-time типа к compile-time типу (identity, reference, boxing или numeric conversion).
Пример: `object boxed = "..."` — compile-time тип `object`, run-time тип `string`. [S1]
> "An assignment is only valid when an implicit conversion exists from the run-time type
> to the compile-time type, such as an identity, reference, boxing, or numeric
> conversion."
> "`boxed` has a compile-time type of `object` but a run-time type of `string`. The
> assignment works because `string` derives from `object`."

---

## Границы и предостережения (для автора урока)

- **B1. «Stack vs heap» — осторожно.** Microsoft НЕ формулирует value-типы как «всегда
  на стеке». S1/S3 говорят лишь, что value-типы «hold their data directly / directly
  contain their data», а reference-объект живёт «on the managed heap» [S1]. S5 описывает
  value-тип через «represented by the object's actual value», без слова stack. То есть
  первоисточник фиксирует: reference-ОБЪЕКТ на managed heap; про «стек» для value-типов —
  документация умалчивает (value-тип может жить inline внутри объекта на куче, в поле, в
  боксе). Урок НЕ должен приписывать первоисточнику тезис «value types live on the stack».
- **B2. `ai-usage: ai-assisted` на S1.** Индексная страница помечена как
  AI-ассистированная. Поэтому её факты в этом отчёте дополнительно сверены с
  не-AI-страницами S2/S3/S5 (см. «Подтверждение» под F1, F2, F5, F6, F12). Уникальные
  формулировки только из S1 (F16, F17, F20 — про compile-time/run-time тип) частично
  подкреплены S5 (F17) и S4 (F19/F20 через boxing), но детализация «overload resolution
  vs virtual dispatch» встречается только в S1 — помечено ниже как уверенность «высокая
  (одна страница A, механизм согласуется со спецификацией CTS)».
- **B3.** `in`/`ref`/`out` — исключение из «копирования»: операции над одной переменной
  МОГУТ влиять на другую [S3]. Урок про «value-типы всегда независимы» должен оговорить
  ref-параметры.

---

## Уверенность по фактам

- **Высокая (≥2 независимых страницы A):** F1, F2, F5, F6, F9, F12, F13, F14, F17, F18.
- **Высокая (1 страница A, норма стабильна / согласуется со спецификацией):** F3, F4,
  F7, F8, F10, F11, F15, F16, F19, F20. Для F16/F20 (уникальная формулировка S1 про
  compile-time/run-time тип) — при написании урока желательна доп. сверка с C# language
  specification §8.2 (ссылки на спецификацию есть внизу S4).

## Реестр покрытия

Запрошено 12–18 фактов — извлечено **20** (F1–F20), сгруппированы по 4 блокам
(CTS / value / reference / compile-vs-run-time). Закрытый скоуп страниц из ТЗ
(types/ + value-types + reference-types) покрыт полностью; добавлены S4 (built-in
reference types — boxing/string/dynamic) и S5 (CTS-норма) для перекрёстной проверки и
покрытия boxing. Насыщение по скоупу ТЗ: 100% запрошенных страниц прочитано целиком.

## Что не удалось / вне скоупа

- Точная модель размещения памяти (stack/heap/registers) первоисточником намеренно НЕ
  фиксируется как язык-гарантия — см. B1. Не выдавать за факт из Microsoft.
- Спецификация ECMA-334 / C# language specification §8 не прочитана целиком (ссылки
  зафиксированы внизу S2/S4); при спорных формулировках compile-time/run-time тип —
  следующий шаг.
