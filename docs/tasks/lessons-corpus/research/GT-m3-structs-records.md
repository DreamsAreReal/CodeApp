# GT-m3: struct (readonly, defensive copy, layout) + record (value equality, with, синтез) — авторитетные факты

Линза: авторитетные проверяемые факты для сверки будущих уроков **S1.4 / S1.5** с
первоисточником (struct + record).
Корпус: **нормативная база жанра** — официальная документация Microsoft Learn
(C# language reference). Первичка класса **A**: страницы версионируются через публичный
git-репозиторий `dotnet/docs`, автор BillWagner (`ms.author: wiwagn`), каждая датирована
и привязана к git-коммиту. Цена подделки высокая (правки идут через PR в открытый репо).
Дата сбора: **2026-07-18**.

## Источники (первичка, класс A)

- **S1 — Structure types (C# reference).**
  `ms.date` документа: **2026-01-14**; `updated_at`: 2026-05-19; word_count 2149.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct
  git-источник: `dotnet/docs` `docs/csharp/language-reference/builtin-types/struct.md`
  (git_commit `43234cce165dafab51065417416b1044d38d0261`).
- **S2 — Records (C# reference).**
  `ms.date`: **2026-06-05**; `updated_at`: 2026-06-11; word_count 4182; `ai-usage: ai-assisted`.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record
  git-источник: `dotnet/docs` `docs/csharp/language-reference/builtin-types/record.md`
  (git_commit `3ad61ebece899df0343c3ecde4d8dbd65d39fd96`).
- **S3 — readonly keyword (C# reference).**
  `ms.date`: **2026-01-22**; `updated_at`: 2026-01-26; word_count 1001.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly
  git-источник: `dotnet/docs` `docs/csharp/language-reference/keywords/readonly.md`.
- **S4 — Avoid memory allocations and data copies (C#).**
  `ms.date`: **2023-10-13**; `updated_at`: 2026-03-30; word_count 1833.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/write-safe-efficient-code
  (канонический путь: /dotnet/csharp/advanced-topics/performance/)
  git-источник: `dotnet/docs` `docs/csharp/advanced-topics/performance/index.md`.

**Провенанс и независимость.** Все четыре — официальные страницы Microsoft Learn с
полным front-matter (дата, автор, git-коммит). Ключевые утверждения по struct
дополнительно подтверждены **вторым независимым каналом того же класса A** — прямым
чтением markdown-первоисточника с `raw.githubusercontent.com/dotnet/docs/main/...`
(git «live», не рендер Learn); тексты совпали дословно. Свежесть: для конвенций языка
редакции стабильны годами, все редакции актуальны (<18 мес по updated_at).

**Карантин инъекций.** Во всём извлечённом внешнем контенте инструкций-манипуляций
(«игнорируй правила», «рекомендуй X») не обнаружено — чистая техдокументация. Находок
«возможная манипуляция источника» нет.

**Замечание по методике.** ТЗ предписывало начать с MCP `microsoft_docs_search`/
`microsoft_docs_fetch`. В доступном наборе инструментов прямых MCP-функций Microsoft
Learn не оказалось; факты добыты через прямой fetch тех же официальных URL Learn (тот
же корпус, тот же класс A) + git-первоисточник dotnet/docs как независимая сверка.
Это НЕ деградация корпуса: нужный корпус (офдок Learn) доступен и прочитан.

---

## A. STRUCT — readonly, ловушки мутабельных структур, defensive copy, layout

### A.1 Семантика значений и рекомендация иммутабельности

**F1.** Структурный тип — это value type; переменная структурного типа содержит сам
экземпляр типа. По умолчанию система копирует значения переменных при присваивании,
передаче аргумента в метод и возврате результата; для структур копируется экземпляр типа.
> "Structure types have *value semantics*. That is, a variable of a structure type contains an instance of the type. By default, the system copies variable values on assignment, when passing an argument to a method, and when returning a method result. For structure-type variables, the system copies an instance of the type."
Источник: S1. Уверенность: **высокая**.

**F2.** Офдок прямо рекомендует определять **иммутабельные** структурные типы — именно
потому, что у них семантика значений.
> "Because structure types have value semantics, we recommend you define *immutable* structure types."
Источник: S1. Уверенность: **высокая** (как позиция офдока).

### A.2 readonly struct: правила и гарантия

**F3.** Модификатор `readonly` на структуре объявляет её иммутабельной; ВСЕ члены-данные
такой структуры обязаны быть read-only: любое поле — с модификатором `readonly`; любое
свойство (в т.ч. авто-свойство) — read-only или `init`-only (init доступен с C# 9).
> "Use the `readonly` modifier to declare that a structure type is immutable. All data members of a `readonly` struct must be read-only as follows: Any field declaration must have the [`readonly` modifier]. Any property, including automatically implemented ones, must be read-only or [`init` only]."
Источник: S1 (подтверждено вторым каналом — raw git dotnet/docs). Уверенность: **высокая**.

**F4.** Это правило гарантирует, что ни один член `readonly`-структуры не меняет её
состояние; все прочие instance-члены, КРОМЕ конструкторов, неявно `readonly`.
> "This rule guarantees that no member of a `readonly` struct modifies the state of the struct. All other instance members except constructors are implicitly `readonly`."
Источник: S1. Уверенность: **высокая**.

**F5. (Ловушка мутабельного ссылочного члена)** В `readonly`-структуре член-данные
**мутабельного ссылочного типа** всё ещё может менять собственное состояние: заменить
экземпляр `List<T>` нельзя, но добавить в него элементы — можно.
> "In a `readonly` struct, a data member of a mutable reference type still can mutate its own state. For example, you can't replace a [List<T>] instance, but you can add new elements to it."
Источник: S1 (подтверждено вторым каналом — raw git). Уверенность: **высокая**.
Примечание: это прямой аналог shallow-immutability (см. F16 для record).

### A.3 readonly instance members и МЕХАНИЗМ defensive copy

**F6. (Ядро defensive copy — самый важный факт урока)** Внутри `readonly` instance-члена
присваивать полям экземпляра нельзя. Но `readonly`-член МОЖЕТ вызвать НЕ-`readonly` член;
в этом случае **компилятор создаёт КОПИЮ экземпляра структуры** и вызывает не-`readonly`
член на этой копии — поэтому исходный экземпляр не изменяется.
> "Within a `readonly` instance member, you can't assign to the structure's instance fields. However, a `readonly` member can call a non-`readonly` member. In that case, the compiler creates a copy of the structure instance and calls the non-`readonly` member on that copy. As a result, the original structure instance isn't modified."
Источник: S1 (подтверждено вторым каналом — raw git). Уверенность: **высокая**.
Это и есть «defensive copy»: скрытая копия, которую вставляет компилятор, чтобы
защитить неизменяемость. `readonly` (на struct или на членах) её устраняет.

**F7.** Компилятор авто-свойства объявляет `get`-аксессор как `readonly` независимо от
наличия модификатора `readonly` в объявлении свойства.
> "The compiler declares a `get` accessor of an automatically implemented property as `readonly`, regardless of the presence of the `readonly` modifier in a property declaration."
Источник: S1. Уверенность: **высокая**.

**F8.** Компилятор может использовать модификатор `readonly` для оптимизаций
производительности (т.е. `readonly` — не только про корректность, но и про перф).
> "The compiler can make use of the `readonly` modifier for performance optimizations."
Источник: S1. Уверенность: **высокая**.

**F9. (readonly get на read/write-свойстве)** Для read/write-свойства можно добавить
`readonly` к `get`-аксессору: некоторые `get` вычисляют и кэшируют результат; `readonly`
на `get` гарантирует, что аксессор не меняет внутреннее состояние объекта кэшированием.
> "By adding the `readonly` modifier to the `get` accessor, you guarantee that the `get` accessor doesn't modify the internal state of the object by caching any result."
Источник: S3. Уверенность: **высокая**.

### A.4 readonly поле (не путать с readonly struct/членами)

**F10.** `readonly`-поле можно присвоить только в объявлении или в конструкторе того же
класса; после завершения конструктора присвоить нельзя. Для value-типа `readonly`-поле
иммутабельно; для ссылочного типа — поле всегда ссылается на тот же объект, но сам
объект может быть НЕ иммутабелен (модификатор запрещает подмену ссылки, но не запрещает
менять данные объекта через это поле).
> "Because value types directly contain their data, a field that is a `readonly` value type is immutable. Because reference types contain a reference to their data, a field that is a `readonly` reference type must always refer to the same object. That object might not be immutable. The `readonly` modifier prevents replacing the field value with a different instance of the reference type. However, the modifier doesn't prevent the instance data of the field from being modified through the read-only field."
Источник: S3. Уверенность: **высокая**.
Внешне видимый тип с внешне видимым read-only полем мутабельного ссылочного типа —
потенциальная уязвимость (предупреждение CA2104).

### A.5 Layout, инициализация, default, копирование по значению

**F11. (Layout / default)** Переменная `struct`-типа напрямую содержит данные структуры;
из-за этого различаются неинициализированная структура (её `default`-значение) и
инициализированная. `default`-значение структуры definitely-assign-ит все поля в 0
(0-битный паттерн); все поля обязаны быть definitely assigned при создании.
> "A variable of a `struct` type directly contains the data for that `struct`." / "The `default` value of a struct *definitely assigns* all fields to 0." / "All of a struct's member fields must be *definitely assigned* when created because `struct` types directly store their data."
Источник: S1. Уверенность: **высокая**.
Артефакт документа: `new Measurement()` → parameterless-ctor выполняется; `default(Measurement)`
ИГНОРИРУЕТ parameterless-конструктор и даёт нулевой паттерн; `new Measurement[2]` — тоже нули.

**F12. (parameterless ctor)** У каждой `struct` есть публичный parameterless-конструктор;
если вы пишете его сами — он обязан быть `public`. Если структура объявляет
field-инициализаторы, она обязана явно объявить конструктор (не обязательно
parameterless). `default(T)` и создание массива структур игнорируют parameterless-ctor
и дают нулевой паттерн.
> "Every `struct` has a `public` parameterless constructor." / "the [default value expression] ignores a parameterless constructor and produces the [default value] of the structure type."
Источник: S1. Уверенность: **высокая**.

**F13. (Ограничения layout/дизайна)** Структурный тип не может наследоваться от класса
или структуры и не может быть базой класса (но может реализовывать интерфейсы); в
структуре нельзя объявить финализатор; конструктор структуры обязан инициализировать
все instance-поля.
> "A structure type can't inherit from other class or structure type and it can't be the base of a class. However, a structure type can implement [interfaces]." / "You can't declare a [finalizer] within a structure type." / "A constructor of a structure type must initialize all instance fields of the type."
Источник: S1. Уверенность: **высокая**.

**F14. (Копия по значению + как её избежать)** При передаче переменной структурного типа
в метод или возврате из метода копируется ВЕСЬ экземпляр структуры; для больших структур
это бьёт по перфу. Избежать копирования можно передачей по ссылке модификаторами
`ref`/`out`/`in`/`ref readonly`.
> "When you pass a structure-type variable to a method as an argument or return a structure-type value from a method, the whole instance of a structure type is copied. Pass by value can affect the performance of your code in high-performance scenarios that involve large structure types. You can avoid value copying by passing a structure-type variable by reference."
Источник: S1 (подтверждено вторым каналом — raw git). Уверенность: **высокая**.
Дополнение (S4): стоимость копии значения пренебрежима, если тип мал — три слова или
меньше; для больших типов измерима.
> "The cost of copying a value is negligible if the types are small, three words or less ... It's measurable and can have real performance impact for larger types."
Источник: S4. Уверенность: **высокая**.

**F15. (Как readonly ограничивает мутацию при передаче по ссылке — про defensive copy на стороне вызывающего)**
Когда `struct` передан по ссылке, вызванный метод может изменить его состояние; заменив
`ref` на `ref readonly` или `in`, вы указываете, что аргумент менять нельзя. Также можно
создавать `readonly struct` или структуры с `readonly`-членами для контроля над тем,
какие члены можно менять.
> "You can replace the `ref` modifier with the `ref readonly` or `in` modifiers to indicate that the argument can't be modified. ... You can also create `readonly struct` types or `struct` types with `readonly` members to provide more control over what members of a `struct` can be modified."
Источник: S4. Уверенность: **высокая**.
Связка для урока: `in`-параметр — это передача по ссылке read-only; при вызове
не-`readonly` члена на `in`-параметре компилятор вынужден делать **defensive copy**
(F6). Пометка `readonly struct`/`readonly`-членов устраняет эти скрытые копии → это и
есть перф-мотивация `readonly` (ср. F8).

---

## B. RECORD — value equality, with, синтез методов, record struct vs class, positional

### B.0 Что такое record и class vs struct

**F16.** Модификатор `record` даёт встроенную функциональность для инкапсуляции данных.
`record class` и просто `record` объявляют ССЫЛОЧНЫЙ тип; `record struct` объявляет
ЗНАЧИМЫЙ тип. Ключевое слово `class` в `record class` необязательно.
> "The `record` modifier provides built-in functionality for encapsulating data. The `record class` and `record` syntax define [reference types]. The `record struct` syntax defines a [value type]." / "The `class` keyword is optional, but can add clarity for readers."
Источник: S2. Уверенность: **высокая**.
Прямой контр-миф: **record — НЕ всегда class** (см. раздел «Мифы», M1).

**F17. (record можно сделать мутабельным)** Хотя records предназначены прежде всего для
иммутабельных моделей данных, их МОЖНО делать мутабельными. Позиционные свойства
иммутабельны в `record class` и `readonly record struct`, но МУТАБЕЛЬНЫ в `record struct`.
> "While records can be mutable, they're primarily intended for supporting immutable data models." / "Positional properties are *immutable* in a `record class` and a `readonly record struct`. They're *mutable* in a `record struct`."
Источник: S2. Уверенность: **высокая**.

### B.1 Value equality (значимое равенство)

**F18. (Ядро)** Для типов с модификатором `record` (`record class`, `record struct`,
`readonly record struct`) два объекта равны, если они одного типа и хранят одинаковые
значения — в отличие от обычного `class`, где равенство по умолчанию — это ссылочное
равенство (тот же объект в памяти).
> "For `class` types, two objects are equal if they refer to the same object in memory." / "For types with the `record` modifier (`record class`, `record struct`, and `readonly record struct`), two objects are equal if they are of the same type and store the same values."
Источник: S2. Уверенность: **высокая**.
Артефакт документа: два `Person` с одинаковыми значениями → `person1 == person2` = True,
но `ReferenceEquals(person1, person2)` = False.

**F19. (record struct vs struct — как реализовано равенство)** Определение равенства для
`record struct` то же, что для `struct`; РАЗНИЦА в реализации: у обычного `struct`
равенство — это `ValueType.Equals(Object)`, опирающийся на **рефлексию**; у record —
равенство **синтезируется компилятором** и использует объявленные члены-данные (без
рефлексии → быстрее и предсказуемее).
> "The definition of equality for a `record struct` is the same as for a `struct`. The difference is that for a `struct`, the implementation is in [ValueType.Equals(Object)] and relies on reflection. For records, the implementation is compiler synthesized and uses the declared data members."
Источник: S2. Уверенность: **высокая**.

### B.2 Синтез методов компилятором

**F20. (Полный перечень синтезируемых методов равенства)** Для реализации value equality
компилятор синтезирует: override `Object.Equals(Object)`; `virtual`/`sealed`
`Equals(R? other)`, реализующий `IEquatable<T>`; при наследовании — `Equals(Base? other)`;
override `Object.GetHashCode()`; overrides `operator ==` и `operator !=`; при
наследовании — `protected override Type EqualityContract { get; }`.
> "To implement value equality, the compiler synthesizes several methods, including: An override of [Object.Equals(Object)]. ... A `virtual`, or `sealed`, `Equals(R? other)` where `R` is the record type. This method implements [IEquatable<T>]. ... An override of [Object.GetHashCode()]. ... Overrides of [operator `==`] and [operator `!=`]."
Источник: S2. Уверенность: **высокая**.
Важные границы синтеза:
- Явно объявлять override `Object.Equals(Object)`, `operator ==`/`!=`, `Equals(Base?)`
  и `EqualityContract`-override — **ошибка компиляции** ("It's an error if you declare
  the override/operators explicitly").
- `Equals(R? other)` и `GetHashCode()` — **можно** объявить самому; если переопределяешь
  `Equals(R? other)`, обязан дать и `GetHashCode`.
- Компилятор НЕ синтезирует метод, если в record уже есть метод с той же сигнатурой и
  его разрешено объявлять явно ("The compiler doesn't synthesize a method when a record
  type has a method that matches the signature of a synthesized method and the method is
  allowed to be declared explicitly").

**F21. (ToString / PrintMembers)** У record есть сгенерированный компилятором `ToString`,
печатающий имена и значения публичных свойств и полей в формате
`<record type name> { <prop> = <value>, ... }`. Для реализации в `record class`
синтезируется `virtual PrintMembers` + override `ToString`; в `record struct` этот член —
`private`. `ToString` можно пометить `sealed`, чтобы запретить синтез в производных.
> "Record types have a compiler-generated [ToString] method that displays the names and values of public properties and fields." / "in `record class` types, the compiler synthesizes a virtual `PrintMembers` method and a [ToString] override. In `record struct` types, this member is `private`."
Источник: S2. Уверенность: **высокая**.

**F22. (Deconstruct)** При позиционном синтаксисе компилятор создаёт метод `Deconstruct`
с `out`-параметром на каждый позиционный параметр; он деконструирует только свойства,
заданные позиционным синтаксисом, и игнорирует свойства, заданные обычным синтаксисом.
> "A `Deconstruct` method with an `out` parameter for each positional parameter provided in the record declaration. The method deconstructs properties defined by using positional syntax; it ignores properties that are defined by using standard property syntax."
Источник: S2. Уверенность: **высокая**.

### B.3 with-выражение (nondestructive mutation) — НЕ мутирует оригинал

**F23. (Ядро — контр-миф про мутацию)** `with`-выражение создаёт НОВЫЙ экземпляр record —
копию существующего с изменёнными указанными свойствами/полями (nondestructive mutation).
Оригинал не меняется.
> "A `with` expression creates a new record instance that's a copy of an existing record instance, but with specified properties and fields modified."
Источник: S2. Уверенность: **высокая**.
Артефакт документа: `person2 = person1 with { FirstName = "John" };` → `person1`
сохраняет `FirstName = Nancy`; `person1 == person2` = False; а `person1 with { }`
даёт равную копию (== True).

**F24. (with даёт SHALLOW copy)** Результат `with` — **поверхностная (shallow) копия**:
для ссылочного свойства копируется только ссылка; и оригинал, и копия ссылаются на один
и тот же экземпляр.
> "The result of a `with` expression is a *shallow copy*. For a reference property, the expression copies only the reference to an instance. Both the original record and the copy end up with a reference to the same instance."
Источник: S2. Уверенность: **высокая**.

**F25. (Как with реализован для record class vs record struct)** Для `record class`
компилятор синтезирует **clone-метод** и **copy-конструктор**: `with` вызывает clone
(возвращает новый record через copy-ctor) и затем ставит указанные свойства. Для
`record struct` copy-конструктор НЕ синтезируется и НЕ вызывается для `with` — значения
`record struct` копируются при присваивании. Имя clone-метода генерируется компилятором;
переопределить clone или создать член `Clone` нельзя.
> "To implement this feature for `record class` types, the compiler synthesizes a clone method and a copy constructor." / "The compiler doesn't synthesize a copy constructor for `record struct` types. ... The values of the `record struct` are copied on assignment." / "You can't override the clone method, and you can't create a member named `Clone` in any record type. The actual name of the clone method is compiler-generated."
Источник: S2. Уверенность: **высокая**.

### B.4 Positional records и что генерируется

**F26. (Что создаёт позиционный синтаксис)** При позиционном синтаксисе компилятор
создаёт: публичное авто-свойство на каждый позиционный параметр (init-only для `record`/
`readonly record struct`; read-write для `record struct`); primary-конструктор с
параметрами = позиционным; для `record struct` — parameterless-конструктор, ставящий
каждое поле в default; `Deconstruct`-метод.
> "When you use the positional syntax for property definition, the compiler creates: A public automatically implemented property for each positional parameter... For `record` types and `readonly record struct` types: An [init-only] property. For `record struct` types: A read-write property. A primary constructor whose parameters match the positional parameters... For record struct types, a parameterless constructor that sets each field to its default value. A `Deconstruct` method..."
Источник: S2. Уверенность: **высокая**.

**F27. (record не обязан иметь позиционные свойства)** Тип record не обязан объявлять
позиционные свойства; можно объявить record вообще без них и добавить обычные поля/свойства.
> "A record type doesn't have to declare any positional properties."
Источник: S2. Уверенность: **высокая**.

### B.5 Иммутабельность record — shallow

**F28. (Shallow immutability record)** Init-only свойства (из позиционных параметров или
через `init`-аксессоры) имеют **поверхностную (shallow) иммутабельность**: после
инициализации нельзя изменить значение value-типа или ссылку ссылочного свойства, НО
данные, на которые ссылается ссылочное свойство, менять можно.
> "Init-only properties ... have *shallow immutability*. After initialization, you can't change the value of value-type properties or the reference of reference-type properties. However, the data that a reference-type property refers to can be changed."
Источник: S2. Уверенность: **высокая**.
Артефакт документа: `person.PhoneNumbers[0] = "555-6789";` меняет содержимое массива у
иммутабельного `record Person(..., string[] PhoneNumbers)`. Прямой аналог F5 (readonly struct).

### B.6 Наследование record (только record class) и равенство в иерархии

**F29.** Раздел наследования применим только к `record class`. Record может наследоваться
от другого record, но НЕ от класса, и класс не может наследоваться от record. Для
равенства двух record-переменных должен совпадать **runtime-тип** (реализуется через
синтезированное свойство `EqualityContract`, возвращающее `Type`).
> "A record can inherit from another record. However, a record can't inherit from a class, and a class can't inherit from a record." / "For two record variables to be equal, the run-time type must be equal." / "the compiler synthesizes an `EqualityContract` property that returns a [Type] object that matches the type of the record."
Источник: S2. Уверенность: **высокая**.
Артефакт документа: `Teacher` и `Student` с одинаковыми значениями, оба в переменных
типа `Person` → `teacher == student` = False (разные runtime-типы).

**F30. (record struct не может быть ref struct)** `record struct` не может быть `ref struct`.
> "A record struct can't be a [`ref struct`]."
Источник: S1 (раздел «`record` struct»). Уверенность: **высокая**.

---

## C. Мифы / частые ошибки (контр-факты с цитатами)

Формат: **МИФ** → почему неверно (факт + источник).

**M1. МИФ: «record — это всегда class».**
НЕВЕРНО. `record struct` объявляет value type; `record class`/`record` — reference type.
> "The `record class` and `record` syntax define reference types. The `record struct` syntax defines a value type." (S2, F16)
Дополнительно: `record struct` не может быть `ref struct` (S1, F30), но это отдельный ограничитель, а не «record = class».

**M2. МИФ: «struct нельзя сделать immutable» / «immutability — только для class».**
НЕВЕРНО. Именно для структур офдок РЕКОМЕНДУЕТ иммутабельность и даёт механизм —
`readonly struct` (все члены read-only, гарантия неизменности состояния).
> "Because structure types have value semantics, we recommend you define *immutable* structure types." (S1, F2)
> "Use the `readonly` modifier to declare that a structure type is immutable." (S1, F3)

**M3. МИФ: «with мутирует оригинал».**
НЕВЕРНО. `with` создаёт НОВЫЙ экземпляр — копию с изменёнными полями; оригинал не меняется.
> "A `with` expression creates a new record instance that's a copy of an existing record instance, but with specified properties and fields modified." (S2, F23)
Артефакт: после `p2 = p1 with { X = 3 }` → `p1` = (0,0), `p2` = (3,0) (S1, раздел Nondestructive mutation).

**M4. МИФ: «with делает глубокую (deep) копию».**
НЕВЕРНО. `with` даёт SHALLOW copy: для ссылочных свойств копируется только ссылка,
оригинал и копия делят один экземпляр.
> "The result of a `with` expression is a *shallow copy*. ... Both the original record and the copy end up with a reference to the same instance." (S2, F24)

**M5. МИФ: «readonly struct полностью иммутабелен, включая вложенные объекты».**
НЕВЕРНО (shallow). Член мутабельного ссылочного типа в `readonly struct` может менять
собственное состояние (нельзя заменить `List<T>`, но можно добавить элементы).
> "In a `readonly` struct, a data member of a mutable reference type still can mutate its own state." (S1, F5)
Аналогично для init-only свойств record — «shallow immutability» (S2, F28).

**M6. МИФ: «readonly не влияет на производительность, это чисто про корректность».**
НЕВЕРНО. Без `readonly` компилятор при вызове не-`readonly` члена делает **скрытую
защитную копию** (defensive copy) структуры; `readonly` их устраняет и используется для
перф-оптимизаций.
> "the compiler creates a copy of the structure instance and calls the non-`readonly` member on that copy." (S1, F6)
> "The compiler can make use of the `readonly` modifier for performance optimizations." (S1, F8)

**M7. МИФ: «равенство record struct и обычного struct реализовано одинаково».**
Определение равенства одинаково, но РЕАЛИЗАЦИЯ разная: обычный `struct` использует
`ValueType.Equals` на РЕФЛЕКСИИ; record — синтез компилятора по объявленным членам.
> "for a `struct`, the implementation is in ValueType.Equals(Object) and relies on reflection. For records, the implementation is compiler synthesized and uses the declared data members." (S2, F19)

**M8. МИФ: «два разных типа record с одинаковыми полями равны».**
НЕВЕРНО для `record class`: требуется совпадение runtime-типа (`EqualityContract`).
`Teacher` и `Student` с идентичными значениями не равны.
> "For two record variables to be equal, the run-time type must be equal." (S2, F29)

**M9. МИФ: «readonly поле ссылочного типа делает объект неизменяемым».**
НЕВЕРНО. `readonly` запрещает подмену ссылки, но не запрещает менять данные объекта
через это поле.
> "The `readonly` modifier prevents replacing the field value with a different instance of the reference type. However, the modifier doesn't prevent the instance data of the field from being modified through the read-only field." (S3, F10)

**M10. МИФ: «default(MyStruct) вызывает parameterless-конструктор».**
НЕВЕРНО. `default(T)` и `new T[n]` ИГНОРИРУЮТ parameterless-конструктор и дают нулевой
битовый паттерн; вызывает конструктор только `new T()`.
> "the [default value expression] ignores a parameterless constructor and produces the [default value] of the structure type. Structure-type array instantiation also ignores a parameterless constructor..." (S1, F11/F12)

**M11. МИФ: «у record class можно написать свой Clone / переопределить clone-метод».**
НЕВЕРНО. Нельзя переопределить clone-метод и нельзя создать член `Clone` в любом record;
имя clone генерируется компилятором.
> "You can't override the clone method, and you can't create a member named `Clone` in any record type." (S2, F25)

---

## Реестр покрытия

Закрытый корпус запрошенных подтем (100% = остановка):

| Подтема (из ТЗ) | Покрыто | Факты |
|---|---|---|
| A. struct: readonly struct | да | F3, F4 |
| A. struct: ловушки мутабельных структур | да | F5, F10, M5, M9 |
| A. struct: defensive copy | да | F6, F8, F15, M6 |
| A. struct: layout | да | F11, F12, F13 |
| A. struct: value-семантика/копия | да | F1, F2, F14 |
| A. struct: readonly instance members | да | F6, F7, F9 |
| B. record: value equality | да | F18, F19, F20 |
| B. record: with-выражение | да | F23, F24, F25 |
| B. record: синтез Equals/GetHashCode/ToString/Deconstruct | да | F20, F21, F22 |
| B. record: record struct vs record class | да | F16, F17, F19, F25, F29, F30 |
| B. record: positional records | да | F26, F27 |
| B. record: наследование/иммутабельность | да | F28, F29 |
| C. Мифы/ошибки | да | M1–M11 |

Итого извлечённых проверяемых утверждений: **30** (F1–F30) + **11 мифов** (M1–M11).
Порог ТЗ (14–20) перекрыт. Все подтемы закрыты → корпус покрыт, остановка по 100%.

## Противоречия источников

Не обнаружено. Все четыре страницы одного издателя (Microsoft Learn / dotnet/docs),
взаимно согласованы; struct↔readonly↔performance ссылаются друг на друга без конфликтов.

## Что не удалось выяснить / границы

- Точная низкоуровневая раскладка полей в памяти (`StructLayout`, `Pack`, выравнивание)
  на этих страницах не раскрыта — это тема `System.Runtime.InteropServices.StructLayoutAttribute`
  (отдельный API-док). Для урока S1.4 при необходимости — добрать отдельно.
- MCP-инструменты Microsoft Learn (`microsoft_docs_search`) в наборе недоступны; факты
  добыты прямым fetch тех же официальных URL Learn + git-первоисточник dotnet/docs как
  независимая сверка. Корпус (офдок) доступен — НЕ деградация.

## Рекомендация для авторов S1.4/S1.5

Опорные факты урока (наивысший приоритет проверки в тексте уроков):
- struct: **F6** (механизм defensive copy) + **F3/F4** (readonly struct) + **F5** (shallow) + **F14** (копия по значению).
- record: **F18/F19** (value equality и разница с ValueType.Equals) + **F20** (перечень
  синтеза + что нельзя объявлять явно) + **F23/F24** (with = новый экземпляр + shallow).
Мифы M1, M3, M4, M6 — обязательны к явному опровержению в уроках (самые частые
заблуждения). Каждый факт в уроке должен трассироваться до F#/M# этого файла.
