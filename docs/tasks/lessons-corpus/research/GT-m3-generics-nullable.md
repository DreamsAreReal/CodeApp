# GT-m3 — Generics (S1.8) и Nullable<T> (S1.9): авторитетные факты

Линза: ground-truth факты для урока/корпуса по темам S1.8 (generics: базовая механика,
constraints) и S1.9 (Nullable<T> — nullable value types, боксинг nullable).

Корпус: **нормативная база жанра** — официальная документация Microsoft Learn
(C# fundamentals / language-reference / programming-guide / .NET standard / .NET API).
Первичка класса **A**: страницы поддерживаются мейнтейнером dotnet/docs (BillWagner,
adegeo, dotnet-bot), имеют git-историю коммитов, датированы; правки идут через PR в
открытые репозитории dotnet/docs и dotnet-api-docs. Цена подделки высокая.

Дата сбора: **2026-07-18**. Все URL — en-us Microsoft Learn. Каждый факт получен прямым
`fetch` соответствующей страницы (не из памяти модели).

## Источники и провенанс

| ID | Страница | URL | ms.date / updated | Класс | Заметки провенанса |
|----|----------|-----|-------------------|-------|--------------------|
| S1 | Generic types and methods (C# fundamentals) | https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics | ms.date 2026-04-10 / upd 2026-06-18 | A | dotnet/docs, git. **Флаг `ai-usage: ai-assisted`** → факты сверены с S3/S4 |
| S2 | Constraints on type parameters (C# programming guide) | https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters | ms.date 2025-11-25 / upd 2026-05-01 | A | dotnet/docs, git; не ai-assisted |
| S3 | Nullable value types (C# reference) | https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types | ms.date 2026-01-14 / upd 2026-03-30 | A | dotnet/docs, git; не ai-assisted |
| S4 | Generics in .NET (.NET standard) | https://learn.microsoft.com/en-us/dotnet/standard/generics/ | ms.date 2022-07-26 / upd 2026-03-30 | A | dotnet/docs, git; терминология CTS стабильна годами |
| S5 | Nullable<T> Struct (System, .NET API, net-10.0) | https://learn.microsoft.com/en-us/dotnet/api/system.nullable-1 | ms.date 2025-07-01 / upd 2026-07-01 | A | dotnet-api-docs; сигнатура структуры + ссылка на **исходник рантайма** `Nullable.cs` (dotnet/runtime) — очень высокая цена подделки |

**Независимость каналов.** Механика боксинга nullable подтверждается ДВУМЯ независимыми
каналами: S3 (C# language-reference) и S5 (.NET API remarks + сигнатура структуры со
ссылкой на исходный код рантайма). Терминология generics (type definition / constructed
type / type parameter) — S1 (fundamentals) и S4 (.NET standard) независимо. Constraints —
S2 (полная таблица) и S1 (сокращённая таблица «most common») пересекаются без противоречий.

---

## Находки — S1.8 Generics: базовая механика

**F1. Type parameters.** Generics позволяют написать одну версию кода с одним или
несколькими *параметрами типа* и указать конкретные типы при использовании; компилятор
проверяет типы на этапе компиляции, поэтому не нужны runtime-касты и нет риска
`InvalidCastException`.
> "*Generics* let you write code that works with any type while keeping full type safety.
> Instead of writing separate classes or methods for `int`, `string`, and every other type
> you need, write one version with one or more *type parameters* (such as `T`, or `TKey`
> and `TValue`) and specify the actual types when you use it. The compiler checks types at
> compile time, so you don't need runtime casts or risk `InvalidCastException`."
Источник: S1. Уверенность: **высокая**.

**F2. Generic type definition (открытый шаблон).** *Generic type definition* — это
объявление класса/структуры/интерфейса, работающее как шаблон с плейсхолдерами; так как
это только шаблон, создать его экземпляр нельзя.
> "A *generic type definition* is a class, structure, or interface declaration that
> functions as a template, with placeholders for the types that it can contain or use. ...
> Because a generic type definition is only a template, you cannot create instances of a
> class, structure, or interface that is a generic type definition."
Источник: S4. Уверенность: **высокая**.

**F3. Constructed / closed type (закрытый тип).** *Constructed generic type* — результат
подстановки конкретных типов вместо параметров типа; получается type-safe тип, «скроенный»
под выбранные типы.
> "A *constructed generic type*, or *constructed type*, is the result of specifying types
> for the generic type parameters of a generic type definition."
> "When you create an instance of a generic class, you specify the actual types to
> substitute for the type parameters. This establishes a new generic class, referred to as
> a constructed generic class, with your chosen types substituted everywhere that the type
> parameters appear."
Источник: S4. Уверенность: **высокая**. (Термины «open/closed» в S1/S4 выражены как
«generic type definition» = открытый шаблон и «constructed type» = закрытый; сам термин
«general term *generic type* includes both constructed types and generic type
definitions».)

**F4. Generic type argument.** *Generic type argument* — любой тип, подставляемый вместо
параметра типа.
> "A *generic type argument* is any type that is substituted for a generic type parameter."
Источник: S4. Уверенность: **высокая**.

**F5. Generic method и вывод типа (type inference).** Обобщённый метод объявляет свой
собственный параметр типа; компилятор часто *выводит* аргумент типа из переданных
значений.
> "A generic method declares its own type parameter. The compiler often *infers* the type
> argument from the values you pass, so you don't need to specify it explicitly"
> ("In the call `Print(42)`, the compiler infers `T` as `int` from the argument.")
Источник: S1. Уверенность: **высокая**.

**F6. Метод обобщён только если имеет свой список параметров типа.** Метод НЕ является
обобщённым лишь потому, что принадлежит обобщённому типу или имеет формальные параметры
типа-параметра охватывающего типа; он обобщён только если у него есть собственный список
параметров типа.
> "It's important to note that a method is not generic just because it belongs to a generic
> type, or even because it has formal parameters whose types are the generic parameters of
> the enclosing type. A method is generic only if it has its own list of type parameters."
Источник: S4. Уверенность: **высокая**.

**F7. Full runtime type information / НЕТ type erasure.** Дженерики C# похожи на дженерики
Java или шаблоны C++, но с полной runtime-информацией о типах и БЕЗ стирания типов.
> "C# generics are similar to generics in Java or templates in C++, but with full runtime
> type information and no type erasure."
Источник: S1. Уверенность: **высокая**. (Ключевой факт для мифа M3.)

**F8. Производительность на value-типах — без боксинга.** Обобщённые коллекции лучше
работают с value-типами именно потому, что не требуется боксинг value-типов.
> "Better performance. Generic collection types generally perform better for storing and
> manipulating value types because there is no need to box the value types."
> (S1: "These collections also avoid boxing for value types, which improves performance.")
Источник: S4 (+ S1). Уверенность: **высокая**.

---

## Находки — S1.8 Generics: constraints (where)

**F9. Что даёт constraint.** Без constraints аргумент типа может быть любым, и компилятор
предполагает только члены `System.Object`. Constraints задаются контекстным ключевым
словом `where`; нарушение constraint клиентским кодом → ошибка компиляции.
> "Constraints inform the compiler about the capabilities a type argument must have.
> Without any constraints, the type argument could be any type. The compiler can only
> assume the members of System.Object... Constraints are specified by using the `where`
> contextual keyword."
> (S1: "*Constraints* restrict which type arguments a generic type or method accepts.
> Constraints let you call methods or access properties on the type parameter that wouldn't
> be available on `object` alone".)
Источник: S2 (+ S1). Уверенность: **высокая**.

**F10. `where T : struct`.** Аргумент типа должен быть non-nullable value-типом (включая
`record struct`). `struct` подразумевает `new()` и не комбинируется с `new()`; не
комбинируется с `unmanaged`.
> "The type argument must be a non-nullable value type, which includes `record struct`
> types. ... Because all value types have an accessible parameterless constructor, either
> declared or implicit, the `struct` constraint implies the `new()` constraint and can't be
> combined with the `new()` constraint. You can't combine the `struct` constraint with the
> `unmanaged` constraint."
Источник: S2. Уверенность: **высокая**.

**F11. `where T : class`.** Аргумент типа должен быть reference-типом (в т.ч. любой class,
interface, delegate, array). В nullable-контексте `T` — non-nullable reference type.
> "The type argument must be a reference type. This constraint applies also to any class,
> interface, delegate, or array type. In a nullable context, `T` must be a non-nullable
> reference type."
Источник: S2. Уверенность: **высокая**.

**F12. `where T : new()`, базовый класс, интерфейс, `notnull`, `unmanaged`.** (открытый
список — цитаты из таблицы S2)
> `new()`: "The type argument must have a public parameterless constructor. When used
> together with other constraints, the `new()` constraint must be specified last."
> базовый класс: "The type argument must be or derive from the specified base class."
> интерфейс: "The type argument must be or implement the specified interface. Multiple
> interface constraints can be specified. The constraining interface can also be generic."
> `notnull`: "The type argument must be a non-nullable type. The argument can be a
> non-nullable reference type or a non-nullable value type." (нарушение → **warning**, а не
> error; действует только в nullable-контексте)
> `unmanaged`: "The type argument must be a non-nullable unmanaged type. The `unmanaged`
> constraint implies the `struct` constraint and can't be combined with either the `struct`
> or `new()` constraints."
Источник: S2. Уверенность: **высокая**.

**F13. Порядок и взаимоисключение constraints.** Не более одного из `struct` / `class` /
`class?` / `notnull` / `unmanaged`, и если он есть — он первый; `new()`, если есть, —
последний.
> "You can apply at most one of the `struct`, `class`, `class?`, `notnull`, and `unmanaged`
> constraints. If you supply any of these constraints, it must be the first constraint
> specified for that type parameter."
> "The `new()` constraint ... If you specify the `new()` constraint, it must be the last
> constraint for that type parameter."
Источник: S2. Уверенность: **высокая**.

**F14. Осторожно с `==`/`!=` при `where T : class`.** При constraint `class` следует
избегать `==`/`!=` на параметре типа — они проверяют только ссылочную идентичность, даже
если тип перегружает `==` (компилятор знает лишь, что `T` — reference type).
> "When applying the `where T : class` constraint, avoid the `==` and `!=` operators on the
> type parameter because these operators test for reference identity only, not for value
> equality. This behavior occurs even if these operators are overloaded in a type that is
> used as an argument."
Источник: S2. Уверенность: **высокая**.

---

## Находки — S1.9 Nullable<T> (nullable value types)

**F15. Что такое `T?` и `Nullable<T>`.** `T?` представляет все значения базового
value-типа `T` плюс дополнительное `null`. Любой nullable value type — это экземпляр
обобщённой структуры `System.Nullable<T>`; формы `Nullable<T>` и `T?` взаимозаменяемы.
Базовый тип `T` сам не может быть nullable value type.
> "A *nullable value type* `T?` represents all values of its underlying value type `T` and
> an additional null value. ... An underlying value type `T` can't be a nullable value type
> itself."
> "Any nullable value type is an instance of the generic System.Nullable<T> structure. You
> can refer to a nullable value type with an underlying type `T` in any of the following
> interchangeable forms: `Nullable<T>` or `T?`."
Источник: S3. Уверенность: **высокая**.

**F16. Nullable<T> — это СТРУКТУРА (value type) с constraint `where T : struct`.** Сигнатура
рантайма (со ссылкой на исходник `Nullable.cs` в dotnet/runtime):
> "`public struct Nullable<T> where T : struct`"
> "Represents a value type that can be assigned `null`."
> "The Nullable<T> structure supports using only a value type as a nullable type because
> reference types are nullable by design."
> Наследование: Object → ValueType → Nullable<T>.
Источник: S5. Уверенность: **высокая**. (Прямой контр-факт к мифу «int? — reference type».)

**F17. HasValue / Value.** `HasValue` показывает, есть ли значение базового типа; `Value`
возвращает значение, если `HasValue == true`, иначе бросает `InvalidOperationException`.
Значение по умолчанию nullable value type = `null` (экземпляр, у которого `HasValue`
возвращает `false`).
> "Nullable<T>.HasValue shows whether an instance of a nullable value type has a value of
> its underlying type."
> "Nullable<T>.Value gets the value of an underlying type if HasValue is `true`. If HasValue
> is `false`, the Value property throws an InvalidOperationException."
> "The default value of a nullable value type represents `null`. It's an instance whose
> Nullable<T>.HasValue property returns `false`."
Источник: S3 (+ S5, те же два fundamental members). Уверенность: **высокая**.

**F18. Боксинг nullable → `null` ИЛИ boxed `T` (НЕ boxed Nullable<T>).** Ключевое правило:
> "If HasValue returns `false`, the boxing operation returns the null reference."
> "If HasValue returns `true`, the boxing operation boxes the corresponding value of the
> underlying value type `T`, not the instance of Nullable<T>."
Подтверждение из второго канала (S5, remarks):
> "When a nullable type is boxed, the common language runtime automatically boxes the
> underlying value of the Nullable<T> object, not the Nullable<T> object itself. ... If the
> `HasValue` property of a nullable type is `false`, the result of a boxing operation is
> `null`."
Следствие (S3): `int? a = 17; a.GetType()` возвращает `System.Int32` (не Nullable), т.к.
`GetType()` боксит экземпляр, а боксинг non-null nullable эквивалентен боксингу базового
типа.
> "boxing a non-null instance of a nullable value type is equivalent to boxing a value of
> the underlying type, GetType returns a Type instance that represents the underlying type"
Источник: S3 + S5 (два независимых канала). Уверенность: **высокая**.

**F19. Unboxing → создаётся новый Nullable<T>.** Boxed value-типа `T` можно распаковать в
`T?`; при распаковке рантайм создаёт новую структуру Nullable<T>. При распаковке `null` в
nullable рантайм создаёт Nullable<T> с `HasValue == false`.
> "When the underlying value of a nullable type is unboxed, the common language runtime
> creates a new Nullable<T> structure initialized to the underlying value."
> "When `null` is unboxed into a nullable type, the common language runtime creates a new
> Nullable<T> structure and initializes its `HasValue` property to `false`."
Источник: S5. Уверенность: **высокая**.

**F20. Lifted operators (поднятые операторы).** `T?` поддерживает предопределённые и
перегруженные операторы, что поддерживает `T`; эти *lifted operators* возвращают `null`,
если хотя бы один операнд `null`, иначе считают по содержащимся значениям.
> "A nullable value type `T?` supports the predefined unary and binary operators or any
> overloaded operators that a value type `T` supports. These operators, also known as
> *lifted operators*, return `null` if one or both operands are `null`. Otherwise, the
> operator uses the contained values of its operands to calculate the result."
Границы (важно для урока): для `bool?` операторы `&`/`|` НЕ следуют этому правилу (результат
может быть non-null при одном null-операнде). Для сравнений `<`,`>`,`<=`,`>=`: если хотя бы
один операнд `null` → результат `false` (нельзя выводить противоположное сравнение). Для
`==`: оба `null` → `true`; один `null` → `false`. Для `!=`: оба `null` → `false`; один
`null` → `true`.
Источник: S3. Уверенность: **высокая**.

**F21. GetValueOrDefault / `??` / приведение.** Для замены `null` конкретным значением —
`??` или `Nullable<T>.GetValueOrDefault(T)`; для значения по умолчанию базового типа —
`GetValueOrDefault()`. Явный каст `(int)n` компилируется, но бросает
`InvalidOperationException`, если `n == null`. Non-nullable `T` неявно конвертируется в `T?`.
> "Use the null-coalescing operator `??` to do that. You can also use the
> Nullable<T>.GetValueOrDefault(T) method for the same purpose"
> "At run time, if the value of a nullable value type is `null`, the explicit cast throws an
> InvalidOperationException."
> "A non-nullable value type `T` is implicitly convertible to the corresponding nullable
> value type `T?`."
Источник: S3. Уверенность: **высокая**.

---

## Мифы (разоблачение с цитатами)

**M1. «`int?` — это reference type / class».** ЛОЖНО. `int?` = `Nullable<int>` — это
**структура** (value type), объявленная `public struct Nullable<T> where T : struct`,
наследует `System.ValueType`, «Represents a value type that can be assigned `null`»
(S5, F16). `null` у nullable value type — это не ссылка на кучу, а состояние
`HasValue == false` в самой value-структуре (S3, F17).

**M2. «Боксинг `Nullable<T>` даёт boxed `Nullable<T>`».** ЛОЖНО. Боксинг nullable даёт
либо `null` (если `HasValue == false`), либо boxed значение базового типа `T` — «not the
instance of Nullable<T>» / «not the Nullable<T> object itself» (S3 + S5, F18). Поэтому
`(int?)x` с `x==null` боксится в `null`, а `((int?)17).GetType()` возвращает `System.Int32`,
а не `Nullable<Int32>` (S3, F18). На кучу «упаковкой Nullable-обёртки» value не попадает.

**M3. «Дженерики C# = стирание типов (type erasure), как в Java».** ЛОЖНО. Официально:
дженерики C# — «with full runtime type information and no type erasure» (S1, F7). Runtime
хранит информацию о конструированном типе: constructed generic type — реальный тип с
подставленными аргументами (S4, F3), а `List<int>` работает с value-типами **без боксинга**
(S4/S1, F8) — что при стирании типов было бы невозможно. (Точная CLR-механика
«специализация нативного кода на каждый value-тип vs общий код для reference-типов» в
данных 3 страницах Learn дословно НЕ формулируется — см. раздел «Не удалось».)

**M4. «`where T : struct` разрешает и `Nullable<T>`».** ЛОЖНО. `struct`-constraint требует
**non-nullable** value type (S2, F10), а сам `Nullable<T>` объявлен `where T : struct` —
т.е. `T` в нём не может быть nullable value type (S3: «An underlying value type `T` can't be
a nullable value type itself», F15). Значит `Nullable<Nullable<int>>` невозможен.

**M5. «`nullableVar.Value` безопасно всегда».** ЛОЖНО. `Value` при `HasValue == false`
бросает `InvalidOperationException` (S3/S5, F17). Для безопасного извлечения — проверка
`HasValue` / сравнение с `null` / `is`-паттерн / `??` / `GetValueOrDefault`.

**M6. «Nullable reference types (`string?`) — то же, что nullable value types».** Разные
механизмы. Методы идентификации из S3 (Nullable.GetUnderlyingType, typeof) явно НЕ
применимы к nullable reference types: «The methods described in this section don't apply to
nullable reference types» (S3). NRT — это compile-time аннотации анализа потока, а не
структура `Nullable<T>`. Уверенность: **высокая** (по границе, зафиксированной в S3).

---

## Реестр покрытия (закрытый корпус: 3 канонические страницы ТЗ + 2 подтверждающие)

| Единица покрытия | Источник-первооткрыватель | Статус |
|------------------|---------------------------|--------|
| Type parameters / базовая механика | S1 | покрыто (F1, F5) |
| Generic type definition (открытый) | S4 | покрыто (F2) |
| Constructed / closed type | S4 | покрыто (F3, F4) |
| Generic method / метод обобщён только со своим списком | S1, S4 | покрыто (F5, F6) |
| where + смысл constraint | S2, S1 | покрыто (F9) |
| struct / class / new() / base / interface / notnull / unmanaged | S2 | покрыто (F10–F12) |
| Порядок и взаимоисключение constraints | S2 | покрыто (F13) |
| ==/!= при class | S2 | покрыто (F14) |
| no type erasure / full runtime type info | S1 | покрыто (F7) |
| value vs reference в generics (боксинг value-типов) | S4, S1 | покрыто частично (F8; CLR-специализация нативного кода — НЕ покрыто дословно) |
| Nullable<T> = struct, `where T : struct` | S5 | покрыто (F16) |
| HasValue / Value / default=null | S3, S5 | покрыто (F17) |
| Боксинг nullable → null / boxed T | S3, S5 | покрыто, 2 канала (F18) |
| Unboxing → новый Nullable<T> | S5 | покрыто (F19) |
| Lifted operators + границы (bool?, сравнения, ==/!=) | S3 | покрыто (F20) |
| GetValueOrDefault / ?? / каст | S3 | покрыто (F21) |
| Мифы M1–M6 | S1/S3/S4/S5 | покрыто |

Всего содержательных утверждений: **F1–F21 = 21** (>= требуемых 14–20) + 6 мифов.
Критерий остановки закрытого корпуса: все запрошенные ТЗ единицы (параметры типа,
constraints where, открытые/закрытые типы, value vs reference, layout Nullable<T>, боксинг
nullable, HasValue/Value, lifted-операторы) закрыты цитатами класса A → 100%.

## Противоречия источников

Не обнаружено. S1 (сокращённая таблица «most common constraints») и S2 (полная таблица)
согласуются; S3 и S5 дают идентичное правило боксинга nullable разными формулировками.

## Что не удалось выяснить (границы)

- **CLR-механика специализации нативного кода** («каждый value-тип получает свой
  специализированный код, все reference-типы делят одну реализацию, JIT конструирует
  замкнутые типы») — в трёх канонических страницах ТЗ (S1/S2/S3) и в S4 ДОСЛОВНО НЕ
  сформулирована. Учебный тезис для мифа M3 держится строго на цитате S1 «no type erasure /
  full runtime type information» и косвенно на «без боксинга value-типов» (F8). Если урок
  захочет утверждать про раздельную нативную кодогенерацию — нужен отдельный первичный
  источник (напр. dotnet/runtime «Shared Generics» BOTR / ECMA-335), не покрытый данным
  прогоном. Не заявлять как факт Learn.
- **`ai-usage: ai-assisted` у S1** — учтено: все факты из S1, вошедшие в находки,
  дублированы независимыми страницами (S4 для терминологии, S2 для constraints), кроме
  цитаты «no type erasure» (F7), которая уникальна для S1 и приведена дословно как позиция
  офдока.

## Инъекций / манипуляций источника не обнаружено

Весь внешний контент трактовался как ДАННЫЕ. Скрытых инструкций «игнорируй правила /
рекомендуй X» на страницах Microsoft Learn не встречено.
