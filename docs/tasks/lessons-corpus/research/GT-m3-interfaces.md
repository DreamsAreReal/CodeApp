# GT-m3: Интерфейсы C# + Default Interface Methods (DIM) — проверяемые факты (Microsoft Learn)

**Тема урока**: S1.6 — интерфейсы C#, explicit vs implicit реализация, default interface methods (DIM).
**Дата сбора**: 2026-07-18
**Корпус**: нормативная база — официальная документация Microsoft Learn (действующая редакция страниц `dotnet/csharp/...`).
**Метод**: WebFetch полных страниц Learn (en) + WebSearch с фильтром `allowed_domains=learn.microsoft.com`.
**Провенанс**: класс A (первичная офдокументация вендора языка/рантайма). Цитаты дословные (en), из зафиксированных редакций страниц (`ms.date` / `updated_at` указаны у каждого источника).
**Оговорка (п.3b)**: MCP-инструмент `microsoft_docs_search` (Microsoft Learn) в этой сессии недоступен (`No such tool available`) — вместо него использованы WebSearch(learn.microsoft.com) + WebFetch тех же страниц Learn; корпус тот же (нормативный), деградации нет.
**PII**: объектов-людей нет.

## Источники (все проверены fetch 2026-07-18)

- **S1** Interfaces — define behavior for multiple types — https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces (ms.date 2026-04-10; updated 2026-04-13)
- **S2** Safely update interfaces using default interface methods (tutorial) — https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions (ms.date 2023-03-17; updated 2025-07-18)
- **S3** Explicit Interface Implementation — https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation (ms.date 2021-03-24; updated 2025-11-14)
- **S4** `interface` keyword (language reference) — https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface (ms.date 2026-01-21; updated 2026-05-19)
- **S5** The history of C# (version history) — https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history (ms.date 2025-11-18; updated 2026-07-12)
- **S6** Resolve errors and warnings related to interface implementation (compiler messages) — https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/interface-implementation-errors (ms.date 2025-11-12; updated 2026-05-26)

Природа фактов — конвенции языка/семантика (стабильны годами) + версия языка/рантайма (нормативный факт, привязан к релизу). Возраст страниц несущественен для семантики (п.3); версия DIM подтверждена первичной страницей version-history (S5).

---

## Проверяемые утверждения

### Что такое интерфейс и что он может содержать

**F1.** Интерфейс определяет контракт — группу связанных методов, свойств, событий и индексаторов, которые класс или структура ОБЯЗАНЫ реализовать. Интерфейсы позволяют одному типу реализовать несколько контрактов, что важно, потому что C# НЕ поддерживает множественное наследование классов. Источник: S1.
> «An *interface* defines a contract: a group of related methods, properties, events, and indexers that a `class` or `struct` must implement. Interfaces let a single type implement multiple contracts, which is important because C# doesn't support multiple inheritance of classes.»
Уверенность: высокая.

**F2.** Интерфейс может содержать методы, свойства, события и индексаторы. Интерфейс НЕ может содержать instance-полей, instance-конструкторов или финализаторов. Члены `public` по умолчанию. Источник: S1.
> «Interfaces can contain methods, properties, events, and indexers. An interface can't contain instance fields, instance constructors, or finalizers. Members are `public` by default.»
Расширенный список членов (S4): методы, свойства, индексаторы, события, константы, операторы, статический конструктор, вложенные типы, статические поля/методы/свойства/индексаторы/события, явные модификаторы доступа.
Уверенность: высокая.

**F3.** Интерфейс нельзя инстанцировать напрямую. Класс/структура может реализовать несколько интерфейсов; класс может наследовать один базовый класс И одновременно реализовать один или несколько интерфейсов. Источник: S1 (раздел summary).
> «You can't instantiate an interface directly.» / «A class or struct can implement multiple interfaces. A class can inherit a base class and also implement one or more interfaces.»
Уверенность: высокая.

**F4.** Структуры не могут наследовать от других структур или классов, поэтому интерфейсы — единственный способ добавить общее поведение между типами-структурами. Источник: S1.
> «Structs can't inherit from other structs or classes, so interfaces are the only way to add shared behavior across struct types.»
Уверенность: высокая.

### Реализация: implicit vs explicit

**F5.** (Implicit / неявная реализация) Класс или структура перечисляет реализуемые интерфейсы после двоеточия и ОБЯЗАН предоставить реализацию для каждого объявленного члена интерфейса. Класс может реализовать несколько интерфейсов через запятую и обязан реализовать все члены каждого. Источник: S1.
> «The class must provide an implementation for every member declared in the interface» / «A class can implement multiple interfaces, separated by commas. It must provide implementations for all members from every interface it lists.»
Уверенность: высокая.

**F6.** (Коллизия имён без explicit) Если класс реализует два интерфейса с членом с одинаковой сигнатурой, то реализация этого члена на классе заставит ОБА интерфейса использовать эту реализацию (все вызовы `Paint` идут в один метод). Источник: S3.
> «If a class implements two interfaces that contain a member with the same signature, then implementing that member on the class will cause both interfaces to use that member as their implementation.»
Уверенность: высокая.

**F7.** (Explicit / явная реализация) Явная реализация интерфейса — это член класса, который вызывается ТОЛЬКО через указанный интерфейс. Имя члена префиксируется именем интерфейса и точкой (`void IControl.Paint()`). Реализации разных интерфейсов раздельны, и НИ ОДНА не доступна напрямую на классе. Источник: S3.
> «An explicit interface implementation is a class member that is only called through the specified interface. Name the class member by prefixing it with the name of the interface and a period.»
> «The class member `IControl.Paint` is only available through the `IControl` interface, and `ISurface.Paint` is only available through `ISurface`. Both method implementations are separate, and neither are available directly on the class.»
Пример-ловушка (S3): `sample.Paint();` → **compiler error**; но `control.Paint();` и `surface.Paint();` вызывают соответствующие explicit-реализации.
Уверенность: высокая.

**F8.** (Доступ через интерфейс-ссылку) Явно реализованный член нельзя получить через экземпляр класса — только через экземпляр (ссылку) интерфейса. То же для default-членов интерфейса: default interface members доступны ТОЛЬКО через ссылку типа интерфейса. Источник: S4.
> «An explicitly implemented member can't be accessed through a class instance, but only through an instance of the interface. In addition, default interface members can only be accessed through an instance of the interface.»
Уверенность: высокая.

**F9.** (Нет модификатора доступа у explicit) У явной реализации НЕТ модификатора доступа, потому что она недоступна как член содержащего типа; она доступна только при вызове через экземпляр интерфейса. Указание модификатора доступа → ошибка компилятора **CS0106**. Источники: S3, S6.
> S3: «An explicit interface implementation doesn't have an access modifier since it isn't accessible as a member of the type it's defined in. Instead, it's only accessible when called through an instance of the interface. If you specify an access modifier for an explicit interface implementation, you get compiler error CS0106.»
> S6 (CS0106): «Remove the `public` modifier from explicit interface implementations. Explicit interface implementations are implicitly public when accessed through the interface type, making the `public` keyword redundant and not allowed in this context.»
Уверенность: высокая.

**F10.** (Когда нужна explicit) Явная реализация используется, когда два интерфейса объявляют РАЗНЫЕ члены с одинаковым именем (например свойство `P` и метод `P()`) — чтобы реализовать оба, класс обязан использовать explicit хотя бы для одного, иначе ошибка компилятора. Также — чтобы иметь разные реализации для одноимённых членов и чтобы не засорять публичную поверхность класса. Источники: S3, S1.
> S3: «Explicit implementation is also used to resolve cases where two interfaces each declare different members of the same name such as a property and a method. To implement both interfaces, a class has to use explicit implementation either for the property `P`, or the method `P`, or both, to avoid a compiler error.»
> S1: «Explicit implementation is useful when two interfaces declare members with the same name, or when you want to keep the class's public surface clean.»
Уверенность: высокая.

**F11.** (Internal-типы в сигнатуре) Когда интерфейс использует internal-типы в сигнатурах своих членов, реализовать такой член нужно ЯВНО (explicit), потому что реализующий член не может быть `public`, раскрывая internal-типы. Источник: S1.
> «When an interface uses internal types in its member signatures, you must use explicit implementation because the implementing member can't be public while exposing internal types.»
Уверенность: высокая.

### Наследование интерфейсов

**F12.** Интерфейс может наследовать от одного или нескольких других интерфейсов. Класс, реализующий производный интерфейс, обязан реализовать все члены производного интерфейса И всех его базовых интерфейсов. Класс, реализующий `IShape : IDrawable`, неявно конвертируется в `IDrawable`. Источники: S1, S4.
> S1: «Interfaces can inherit from one or more other interfaces. A class that implements a derived interface must implement all members from the derived interface and all of its base interfaces.» / «A class that implements `IShape` can be implicitly converted to `IDrawable`, because `IShape` inherits from it.»
Уверенность: высокая.

**F13.** Когда интерфейс ПЕРЕОПРЕДЕЛЯЕТ метод, реализованный в базовом интерфейсе, он ОБЯЗАН использовать синтаксис явной реализации интерфейса. Когда в списке базовых типов есть и базовый класс, и интерфейсы — базовый класс идёт ПЕРВЫМ. Источник: S4.
> «When an interface overrides a method implemented in a base interface, it must use the explicit interface implementation syntax.» / «When a base type list contains a base class and interfaces, the base class must come first in the list.»
Уверенность: высокая.

### Default Interface Methods (DIM) — тело метода в интерфейсе

**F14.** (Интерфейс МОЖЕТ иметь тело метода) Объявление члена обычно НЕ содержит тела, ОДНАКО член интерфейса МОЖЕТ объявить тело. Тела членов интерфейса — это *реализация по умолчанию* (default implementation): интерфейс предоставляет реализацию для классов и структур, которые не дают собственную переопределяющую реализацию. Источник: S4.
> «Member declarations typically don't contain a body. However, an interface member can declare a body. Member bodies in an interface are the *default implementation*. By using members with bodies, the interface can provide a default implementation for classes and structs that don't provide an overriding implementation.»
Уверенность: высокая.

**F15.** (Версия языка) Default interface members появились в **C# 8.0** (выпущен сентябрь 2019). До C# 8.0 члены интерфейса НЕ могли содержать реализацию. Источники: S5, S6.
> S5 (раздел «C# version 8.0», *Released September 2019*): среди фич — «[Default interface members]».
> S6 (CS0531): «Before C# 8.0, interface members can't contain implementations; starting with C# 8.0, you can provide default interface methods using specific syntax.»
Уверенность: высокая.

**F16.** (Версия рантайма) Default interface members ТРЕБУЮТ доработок в CLR; эти возможности были добавлены в CLR для **.NET Core 3.0**. То есть DIM — это НЕ чисто компиляторная фича, ей нужна поддержка рантайма (в отличие, например, от nullable reference types). Источник: S5.
> «Default interface members require enhancements in the CLR. Those features were added in the CLR for .NET Core 3.0.»
Уверенность: высокая. (Первичный факт версии — со страницы version-history вендора, S5; согласуется с прерогативой S4/S1 о «advanced features».)

**F17.** (DIM НЕ добавляет состояние) Интерфейсы НЕ могут содержать instance state. Хотя статические поля теперь разрешены, instance-поля в интерфейсах НЕ разрешены. Instance auto-properties в интерфейсах НЕ поддерживаются, так как неявно объявили бы скрытое поле. Источник: S4.
> «Interfaces can't contain instance state. While static fields are now permitted, instance fields aren't permitted in interfaces. Instance auto-properties aren't supported in interfaces, as they would implicitly declare a hidden field.»
Уверенность: высокая. (Ключевой анти-миф: DIM даёт тело метода, но НЕ добавляет per-instance состояние — это не «полное множественное наследование с состоянием».)

**F18.** (Класс НЕ наследует члены интерфейса как свои — вызов только через интерфейс) Класс, реализующий интерфейс с default-членом, НЕ обязан давать свою реализацию (её даёт интерфейс), но класс НЕ наследует члены от своих интерфейсов — чтобы вызвать метод, объявленный и реализованный в интерфейсе, переменная должна быть типа интерфейса. Источник: S2.
> «The `SampleCustomer` class doesn't need to provide an implementation for `ComputeLoyaltyDiscount`; that's provided by the `ICustomer` interface. However, the `SampleCustomer` class doesn't inherit members from its interfaces. That rule hasn't changed. In order to call any method declared and implemented in the interface, the variable must be the type of the interface, `ICustomer` in this example.»
Подтверждение (S3, пример): `//sample.Paint();// "Paint" isn't accessible.` → вызвать можно только через `sample as IControl`.
Уверенность: высокая.

**F19.** (Мотивация DIM — безопасная эволюция) Основной сценарий default-члена — БЕЗОПАСНО добавить члены в уже выпущенный интерфейс, используемый множеством клиентов, не ломая существующих реализаторов. Пользователи библиотеки принимают дефолт как не-ломающее изменение или переопределяют его. Источник: S2.
> «The most common scenario is to safely add members to an interface already released and used by innumerable clients.»
> «Default interface implementations enable developers to upgrade an interface while still enabling any implementors to override that implementation. Users of the library can accept the default implementation as a non-breaking change. If their business rules are different, they can override.»
Уверенность: высокая.

**F20.** (Модификаторы доступа default-членов) Члены интерфейса БЕЗ реализации (abstract) неявно `public` и не могут иметь другого модификатора. Члены интерфейса С реализацией по умолчанию (default implementation) по умолчанию `private`, если модификатор не указан, но можно объявить любой (`public`, `private`, `protected`, `internal`). Интерфейсы могут включать статические члены, в т.ч. поля и методы, с любыми модификаторами. Источники: S4, S2.
> S4: «Interface members *without* an implementation (abstract members) are implicitly `public` and can't have any other access modifier. Interface members *with* a default implementation are `private` by default if you don't specify an access modifier, but you can declare any access modifier.»
> S2: «Interfaces can now include static members, including fields and methods. Different access modifiers are also enabled... Any of the modifiers are allowed on interface members.»
Уверенность: высокая.

**F21.** (Переопределение default-члена) Любой класс, реализующий интерфейс с default-методом, может ПЕРЕОПРЕДЕЛИТЬ его — либо как public-метод, либо как явную реализацию интерфейса. Источник: S3.
> «Any class that implements the `IControl` interface can override the default `Paint` method, either as a public method, or as an explicit interface implementation.»
Уверенность: высокая.

### Diamond / разрешение при DIM (most specific implementation)

**F22.** (Diamond → CS8705) Если член интерфейса не имеет НАИБОЛЕЕ СПЕЦИФИЧНОЙ реализации (ни одна не является most specific) — ошибка компилятора **CS8705**: *«Interface member does not have a most specific implementation. Neither member is most specific.»* Возникает типично при diamond-наследовании, когда класс реализует несколько интерфейсов, каждый из которых даёт default-реализацию одного и того же члена. Разрешается программистом явно: нужно предоставить собственную реализацию в реализующем классе/структуре, разрешающую неоднозначность. Источник: S6.
> «CS8705: Interface member 'member' does not have a most specific implementation. Neither is most specific.»
> «Provide an explicit implementation in the implementing class or struct that resolves the ambiguity between multiple default implementations (CS8705). This error typically occurs with diamond inheritance patterns where a class implements multiple interfaces that each provide default implementations for the same member. The compiler needs you to explicitly specify which implementation to use, or provide your own implementation.»
Уверенность: высокая.

**F23.** (Ветка static abstract/virtual — разрешение в compile-time) `static abstract` и `static virtual` члены интерфейса разрешаются компилятором в COMPILE-TIME по компайл-тайм-типу выражения; у них НЕТ рантайм-механизма диспетчеризации, аналогичного `virtual`/`abstract` в классах. Если рантайм-тип выражения производен от иного компайл-тайм-типа, вызываются статические методы БАЗОВОГО (компайл-тайм) типа. Источник: S4.
> «The `static virtual` and `static abstract` methods declared in interfaces don't have a runtime dispatch mechanism analogous to `virtual` or `abstract` methods declared in classes. Instead, the compiler uses type information available at compile time.»
> «Method dispatch for `static abstract` and `static virtual` methods declared in interfaces is resolved by using the compile-time type of an expression.»
Контраст-пара с обычными DIM (которым нужна рантайм-диспетчеризация через ссылку интерфейса, F16/F18): static abstract/virtual — компайл-тайм. Уверенность: высокая. Примечание границы: это сопутствующая фича (C# 11 «generic math»), не основная тема S1.6 DIM; включено для разграничения от diamond-разрешения обычных DIM.

**F24.** (ref struct + DIM) Если добавить default interface members, любой `ref struct`, реализующий интерфейс, ОБЯЗАН явно объявить этот член (default для него не применяется автоматически). Источник: S4.
> «If you add default interfaces members, any `ref struct` that implements the interface must explicitly declare that member.»
Уверенность: высокая. Примечание: краевой случай; полезен как «граница дефолта».

---

## Раздел «Мифы» (анти-паттерны понимания, опровергнуты первичкой)

| Миф | Реальность | Опора |
|---|---|---|
| «Интерфейс не может иметь тело метода» | Может, начиная с C# 8.0 — это default implementation. Член интерфейса МОЖЕТ объявить тело. | F14, F15 (S4, S5, S6) |
| «DIM = наследование состояния / полное множественное наследование как в C++» | DIM даёт тело метода, но НЕ добавляет instance-состояние: instance-поля и instance auto-properties в интерфейсах запрещены. Разрешены только static-поля. | F17 (S4) |
| «Реализовав интерфейс с default-методом, я могу вызвать этот метод прямо на экземпляре класса» | Нет: класс не наследует члены интерфейса; default-член (как и explicit-реализация) доступен ТОЛЬКО через ссылку типа интерфейса. `instance.Method()` → недоступно/ошибка. | F8, F18 (S2, S3, S4) |
| «Явную реализацию интерфейса надо помечать `public`» | Нет: у explicit-реализации НЕТ модификатора доступа; `public` → ошибка CS0106. | F9 (S3, S6) |
| «При diamond-наследовании с двумя default-реализациями компилятор сам выберет одну» | Нет: если нет most specific implementation — ошибка CS8705; неоднозначность разрешает программист явной реализацией в классе. | F22 (S6) |
| «C# 8.0 достаточно, рантайм неважен» (для DIM) | DIM требует доработок CLR, добавленных в .NET Core 3.0; на более старом рантайме не заработает. | F16 (S5) |
| «Абстрактные члены интерфейса можно сделать `private`/`protected`» | Abstract-члены (без тела) неявно `public` и не могут иметь другой модификатор; произвольные модификаторы возможны только у членов С default-реализацией. | F20 (S4) |
| «Два интерфейса с одинаковой сигнатурой всегда требуют explicit» | Нет: если устраивает ОДНА общая реализация — достаточно одного implicit-члена, который удовлетворит оба интерфейса; explicit нужен, только когда требуются РАЗНЫЕ реализации или разные члены с одним именем. | F6, F10 (S3) |

---

## Реестр покрытия (закрытый набор запрошенных подтем)

| Подтема (из запроса) | Утверждения | Источник(и) | Покрыто |
|---|---|---|---|
| explicit vs implicit реализация | F5, F6, F7, F9, F10, F11 | S1, S3, S6 | да |
| разрешение при DIM (diamond, most specific) | F21, F22 | S3, S6 | да |
| версия языка для DIM | F15 | S5, S6 | да |
| версия рантайма для DIM | F16 | S5 | да |
| diamond / множественные default-реализации | F22 | S6 | да |
| доступ через интерфейс-ссылку | F8, F18 | S2, S3, S4 | да |
| что интерфейс может/не может содержать | F1, F2, F3, F4, F14, F17 | S1, S4 | да |
| наследование интерфейсов | F12, F13 | S1, S4 | да |
| модификаторы доступа (abstract vs default) | F9, F20 | S3, S4, S6 | да |
| краевые случаи (static abstract, ref struct) | F23, F24 | S4 | да (сопутствующе) |

**Критерий остановки (закрытый корпус)**: все 5 явно запрошенных подтем (explicit/implicit; разрешение при DIM; версия языка/рантайма; diamond; доступ через интерфейс-ссылку) адресованы; извлечено 24 утверждения (запрошено 12–18 → перевыполнено), каждое с URL и дословной цитатой; раздел «мифы» — 8 позиций с опорой на первичку. Ключевые факты подтверждены ≥2 независимыми типами страниц Learn: концептуальная (S1) + language-reference (S4) + tutorial (S2) + programming-guide (S3) + version-history (S5) + compiler-messages (S6), не цитирующими друг друга по этим утверждениям.

## Противоречия источников
Противоречий между источниками не обнаружено. Формулировки согласованы: «члены доступны только через интерфейс-ссылку» повторяется в S2, S3, S4 независимо; версия DIM (C# 8.0 / .NET Core 3.0) согласована S5 и S6.

## Что не удалось / границы
- MCP `microsoft_docs_search`/`microsoft_docs_fetch` недоступны в сессии → тот же нормативный корпус взят через WebSearch(learn.microsoft.com)+WebFetch (не деградация корпуса, п.3b).
- Точный алгоритм «most specific implementation» (полная лестница приоритетов: тип объявляет реализацию → наиболее производный базовый класс → более производный интерфейс → иначе ошибка) присутствовал в WebSearch-дайджесте страницы language-specification/interfaces, но НЕ извлекался прямым fetch — в утверждения (F22) внесена только формулировка со страницы compiler-messages (S6, прямой fetch). Для урока при необходимости точной лестницы приоритетов — отдельный fetch `.../language-reference/language-specification/interfaces` (первичка спецификации).
- Уровень IL/метаданных DIM (как именно CLR .NET Core 3.0 реализует диспетчеризацию default-членов в слотах интерфейса) — вне целевого корпуса C# fundamentals; для «уровня ниже абстракции» — отдельная линза по ECMA-335 / dotnet-runtime BOTR (не покрыто, зафиксировано).
- F23 (static abstract/virtual) и F24 (ref struct) — сопутствующие фичи (C# 11 / краевой случай), включены для разграничения от diamond-разрешения обычных DIM; для урока S1.6 — второстепенны.
