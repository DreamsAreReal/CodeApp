# GT-m3 — Enum + [Flags] (S1.7) и приведения типов is/as/typeof/cast (S1.10)

Ground-truth факты для сверки будущих уроков с первоисточником. Корпус — **нормативная
база жанра**: официальная документация Microsoft Learn (C# language reference /
programming guide). Первичка класса **A** (офдок, версионируется через git-репозиторий
dotnet/docs, каждая страница привязана к публичному коммиту, датирована, указан автор).

Дата сбора: 2026-07-18. Все URL — en-us Microsoft Learn. Способ добычи: прямой
`microsoft_docs_fetch` (WebFetch) трёх целевых страниц; frontmatter (ms.date,
updated_at, gitcommit, author) получен вместе с телом — провенанс наблюдаемый, не «из памяти».

## Классы источников и провенанс

| Источник | URL | ms.date / updated_at | автор | git_commit_id | Класс |
|---|---|---|---|---|---|
| S1 Enumeration types (C# reference) | learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum | ms.date 2026-01-14, updated 2026-06-18 | BillWagner | 2438a1ad… | A |
| S2 Type-testing operators and cast expressions | learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast | ms.date 2026-01-20, updated 2026-04-14 | pkulikov | 4257ed85… | A |
| S3 Boxing and Unboxing (C# programming guide) | learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing | ms.date 2025-10-13, updated 2025-10-17 | BillWagner | 817cee9a… | A |

Независимость каналов: S1/S2 — две разные подсекции C# language reference; S3 —
programming guide. Ключевые «мифы» опираются на ≥1 явную цитату из S1/S2; там, где факт
уходит в C# language specification, ссылка на спеку указана как деривация офдока (сама
спека не фетчилась в этом прогоне — помечено ниже).

Свежесть: конвенции языка стабильны годами; все три редакции актуальны (<12 мес). Цена
подделки высокая (правки идут PR в открытый репозиторий dotnet/docs).

Карантин инъекций: внешний контент (страницы Learn) — чистые данные, командных
инструкций «игнорируй правила / рекомендуй X» не содержал. Манипуляций не обнаружено.

---

## Часть A. Enum + [Flags] (S1.7)

**F1.** Enum (перечислимый тип) — это **value type**, определённый набором именованных
констант **целочисленного** (integral numeric) базового типа. [S1]
> "An *enumeration type* (or *enum type*) is a [value type] defined by a set of named
> constants of the underlying [integral numeric] type."
Уверенность: **высокая**.

**F2.** По умолчанию связанные константы членов enum имеют тип **`int`**; они начинаются
с нуля и увеличиваются на единицу в порядке текста определения. Базовым можно явно
указать любой другой integral-тип. [S1]
> "By default, the associated constant values of enum members are of type `int`. They
> start with zero and increase by one following the definition text order. You can
> explicitly specify any other [integral numeric] type as an underlying type of an
> enumeration type."
Артефакт в документе: `enum ErrorCode : ushort { None = 0, Unknown = 1, ConnectionLost = 100, ... }`.
Уверенность: **высокая**. (Разрушает миф «enum всегда int» — см. M1.)

**F3.** Значение по умолчанию enum-типа `E` — это результат выражения `(E)0`, **даже
если** нулю не соответствует ни один член enum. [S1]
> "The default value of an enumeration type `E` is the value produced by expression
> `(E)0`, even if zero doesn't have the corresponding enum member."
Уверенность: **высокая**.

**F4.** C# допускает **неявное** преобразование литерала `0` (и `const`, равных нулю) в
любой enum-тип; это может создать невалидное значение enum, если у типа нет члена со
значением 0. [S1]
> "C# allows implicit conversions from the literal value `0` to any enum type, and from
> `const` values equal to zero."
Артефакт: `GpioPort port1 = (GpioPort)0;` компилируется без предупреждения, но
`Enum.IsDefined(typeof(GpioPort), port1)` → `False`. Совет офдока: «почти всегда
определяйте член со значением 0» и валидируйте через `Enum.IsDefined`.
Уверенность: **высокая**.

**F5.** Чтобы enum представлял **комбинацию** выборов, задайте членам значения как
степени двойки (битовые поля) и комбинируйте побитовыми `|`/`&`; для пометки битовых
полей примените атрибут **`[Flags]`** (`System.FlagsAttribute`). [S1]
> "If you want an enumeration type to represent a combination of choices, define enum
> members for those choices so that an individual choice is a bit field. That is, use
> the associated values of those enum members as the powers of two. Then, use the
> [bitwise logical operators `|` or `&`] to combine choices... To indicate that an
> enumeration type declares bit fields, apply the [Flags] attribute to it."
Артефакт: `[Flags] enum Days { None=0, Monday=1, Tuesday=2, ... , Weekend = Saturday | Sunday }`;
`Days.Monday | Days.Wednesday | Days.Friday` печатается как `Monday, Wednesday, Friday`;
`(Days)37` → `Monday, Wednesday, Saturday`.
Уверенность: **высокая**.

**F6.** Проверка наличия флага в документе делается через побитовое `&`:
`(meetingDays & Days.Tuesday) == Days.Tuesday`. [S1]
(Замечание по границам: страница S1 демонстрирует именно `&`-паттерн; метод
`Enum.HasFlag` в тексте S1 НЕ упоминается — см. «Что не покрыто» ниже. Не утверждать,
что офдок enum-страницы рекомендует `HasFlag`, без отдельной сверки страницы
`System.Enum.HasFlag`.)
Уверенность: **высокая** (для `&`-паттерна); **непроверено** для `HasFlag`.

**F7.** `System.Enum` — **абстрактный базовый класс** всех enum-типов. Любой enum
удовлетворяет также ограничению `struct` (non-nullable value type). [S1]
> "The [System.Enum] type is the abstract base class of all enumeration types."
> "Any enumeration type also satisfies the `struct` constraint, which is used to specify
> that a type parameter is a non-nullable value type."
Уверенность: **высокая**. (Следствие: обычный enum — non-nullable value type, `null` ему
присвоить нельзя без `E?`.)

**F8.** Между enum-типом и его базовым integral-типом существуют **явные** (explicit)
преобразования в обе стороны; каст enum→базовый тип даёт связанное целое значение. [S1]
> "For any enumeration type, explicit conversions exist between the enumeration type and
> its underlying integral type. If you [cast] an enum value to its underlying type, the
> result is the associated integral value of an enum member."
Артефакт: `Season a = Season.Autumn; (int)a` → `2`; `(Season)1` → `Summer`;
`(Season)4` → печатает `4` (нет члена).
Уверенность: **высокая**. (Разрушает миф «enum→int неявно» — нужен явный каст; исключение
— только неявный `0`, см. F4.)

**F9.** Для любого enum-типа существуют преобразования **boxing и unboxing** в/из типа
`System.Enum`. [S1]
> "For any enumeration type, [boxing and unboxing] conversions to and from the
> [System.Enum] type exist, respectively."
Уверенность: **высокая**. (Boxing enum РЕАЛЕН — enum это value type; см. M4.)

---

## Часть B. Приведения типов: is / as / cast / typeof (S1.10)

**F10.** Оператор **`is`** проверяет, совместим ли **run-time тип** результата выражения
с заданным типом, и/или сопоставляет результат с паттерном. Возвращает `true`, когда
результат **не-null** и выполнено одно из условий совместимости (identity conversion,
наследование/реализация интерфейса, nullable value type с `HasValue==true`,
boxing/unboxing conversion). [S2]
> "The `is` operator checks if the run-time type of an expression result is compatible
> with a given type. The `is` operator also tests an expression result against a pattern."
> "The `is` operator returns `true` when an expression result is non-null and any of the
> following conditions are true..."
Уверенность: **высокая**. (`is` возвращает `bool`, НЕ бросает исключение — см. M2.)

**F11.** Оператор `is` **учитывает** boxing/unboxing-конверсии, но **не учитывает**
пользовательские (user-defined) конверсии, implicit span conversions и числовые
(numeric) конверсии. [S2]
> "The `is` operator doesn't consider user-defined conversions or implicit span conversions."
Артефакты: `int i = 27; i is System.IFormattable` → `True`; `object iBoxed = i;
iBoxed is int` → `True`, `iBoxed is long` → `False` (numeric-конверсия не учитывается).
Уверенность: **высокая**.

**F12.** `is` поддерживает pattern matching — например declaration pattern
`E is T variable`: проверяет run-time тип и, при успехе, присваивает результат новой
переменной. [S2]
> "The `is` operator also tests an expression result against a pattern."
Артефакт: `if (iBoxed is int a && jNullable is int b) { ... a + b ... }`.
Уверенность: **высокая**.

**F13.** Оператор **`as`** явно преобразует результат выражения в заданный **reference-
или nullable value-тип**. Если преобразование **невозможно — возвращает `null`**. В
отличие от каста, `as` **никогда не бросает исключение**. [S2]
> "Use the `as` operator to explicitly convert the result of an expression to a given
> reference or nullable value type. If the conversion isn't possible, the `as` operator
> returns `null`. Unlike a cast expression, the `as` operator never throws an exception."
Уверенность: **высокая**. (Прямое опровержение мифа «as бросает исключение» — M2.)

**F14.** `E as T` эквивалентно `E is T ? (T)(E) : (T)null`, кроме того что `E`
вычисляется один раз. `as` рассматривает только reference-, nullable-, boxing- и
unboxing-конверсии; **пользовательские конверсии `as` НЕ выполняет** — для них нужен
каст. [S2]
> "produces the same result as `E is T ? (T)(E) : (T)null` Except that `E` is only
> evaluated once."
> "The `as` operator considers only reference, nullable, boxing, and unboxing
> conversions. You can't use the `as` operator to perform a user-defined conversion. To
> perform a user-defined conversion, use a cast expression."
Замечание офдока: результат `as` нужно сравнивать с `null`, чтобы понять успех; `is`
умеет и проверить, и присвоить.
Уверенность: **высокая**.

**F15.** **Cast-выражение** `(T)E` явно преобразует результат `E` в тип `T`. Если
явного преобразования из типа `E` в `T` нет — **ошибка компилятора**. В run-time явное
преобразование может не удаться и cast **может бросить исключение**. [S2]
> "A cast expression of the form `(T)E` explicitly converts the result of expression `E`
> to type `T`. If no explicit conversion exists from the type of `E` to type `T`, the
> compiler issues an error. At run time, an explicit conversion might not succeed and a
> cast expression might throw an exception."
Артефакт: `double x = 1234.7; int a = (int)x;` → `1234`.
Уверенность: **высокая**. (Именно cast, не `as`, бросает — обычно `InvalidCastException`,
см. M2 и F18.)

**F16.** Только cast-выражение (не `is`/`as`) выполняет **пользовательские** (user-
defined) преобразования; тип может определить их, но перегрузить `()`-оператор нельзя.
Операторы `is`, `as`, `typeof` перегрузить **нельзя**. [S2]
> "A user-defined type can't overload the `()` operator, but it can define custom type
> conversions that a cast expression performs."
> "You can't overload the `is`, `as`, and `typeof` operators."
Уверенность: **высокая**.

**F17.** Оператор **`typeof`** возвращает экземпляр **`System.Type`** для типа; его
аргумент — **имя типа или параметра типа**, НЕ выражение/экземпляр. Для run-time типа
результата выражения используйте **`Object.GetType()`**. [S2]
> "The `typeof` operator gets the [System.Type] instance for a type. The argument to the
> `typeof` operator must be the name of a type or a type parameter..."
> "An expression can't be an argument of the `typeof` operator. To get the [System.Type]
> instance for the run-time type of an expression result, use the [Object.GetType] method."
Уверенность: **высокая**.

**F18.** Разница `typeof` vs `is` vs `GetType`: `typeof(T)` даёт **точное** совпадение
типа (без учёта наследования), тогда как `is` учитывает наследование/реализацию
интерфейса. [S2]
> "Use the `typeof` operator to check if the run-time type of the expression result
> exactly matches a given type."
Артефакт: для `object b = new Giraffe();` (`Giraffe : Animal`):
`b is Animal` → `True`, но `b.GetType() == typeof(Animal)` → `False`;
`b is Giraffe` → `True`, `b.GetType() == typeof(Giraffe)` → `True`.
Уверенность: **высокая**.

**F19.** (Boxing-подпора для enum и cast) Boxing — **неявная** конверсия value-типа в
`object`/интерфейс: аллоцирует объект в куче и **копирует** значение; unboxing —
**явная** конверсия, требует каста. Unboxing проверяет тип; попытка unbox `null` →
`NullReferenceException`, unbox в несовместимый value-тип → **`InvalidCastException`**. [S3]
> "Boxing is implicit; unboxing is explicit."
> "Attempting to unbox `null` causes a [NullReferenceException]. Attempting to unbox a
> reference to an incompatible value type causes an [InvalidCastException]."
Артефакт: `int j = (short)o;` где `o` бокс `int` → бросает `InvalidCastException`
("Specified cast is not valid."); `(int)o` — OK.
Уверенность: **высокая**.

---

## Раздел «Мифы» (опровергнуто первоисточником)

**M1. Миф «enum всегда int».** НЕВЕРНО. По умолчанию — `int`, но базовым можно явно
указать любой integral-тип (`byte`, `ushort`, `long`, …). [S1, F2]
> "You can explicitly specify any other [integral numeric] type as an underlying type."

**M2. Миф «`as` бросает исключение».** НЕВЕРНО — с точностью до наоборот. `as` при
неудаче **возвращает `null`** и **никогда не бросает**; бросает (обычно
`InvalidCastException`) именно **cast-выражение `(T)E`**. [S2, F13/F15]
> "Unlike a cast expression, the `as` operator never throws an exception."

**M3. Миф «`is` возвращает приведённый объект» / «`is` бросает».** НЕВЕРНО. `is`
возвращает `bool` (или, с pattern, присваивает переменную и возвращает `bool`), не
бросает. Возвращает `false` (а не исключение) при несовместимости и при **null**. [S2, F10]
> "The `is` operator returns `true` when an expression result is non-null and any of the
> following conditions are true..."

**M4. Миф «enum не боксится» / «enum — это просто int, боксинга нет».** НЕВЕРНО. Enum —
value type; для любого enum существуют boxing/unboxing-конверсии в/из `System.Enum`;
боксинг аллоцирует объект в куче и копирует значение. [S1 F9, S3 F19]
> "For any enumeration type, [boxing and unboxing] conversions to and from the
> [System.Enum] type exist."

**M5. Миф «`is` делает боксинг / всегда боксит value-тип».** ЧАСТИЧНО НЕВЕРНО / требует
нюанса. `is` **учитывает** boxing/unboxing-конверсии при проверке совместимости, но сам
факт `x is T` — это проверка типа, а не операция, гарантированно аллоцирующая объект;
`is` НЕ учитывает numeric-конверсии (`iBoxed is long` → `False`). Формулировка офдока —
про «учёт конверсий», а не про «выполнение боксинга как побочный эффект». [S2, F11]
> "The next example shows that the `is` operator takes into account boxing and unboxing
> conversions but doesn't consider numeric conversions."
(Осторожно: точное поведение «боксит ли JIT при `is` для конкретного value-типа» — это
уже уровень реализации/IL, страница S2 такого утверждения не даёт. Не заявлять «is
всегда боксит» и «is никогда не боксит» без IL-артефакта. → **непроверено на уровне IL**.)

**M6. Миф «enum→int конвертируется неявно».** В целом НЕВЕРНО: между enum и базовым
типом — **явные** преобразования (нужен `(int)`). Единственное неявное исключение —
литерал/const `0` → любой enum-тип. [S1, F4/F8]

**M7. Миф «`typeof(x)` работает с переменной/экземпляром».** НЕВЕРНО. Аргумент `typeof`
— имя типа, НЕ выражение; для run-time типа значения используется `GetType()`. [S2, F17]

---

## Что не покрыто в этом прогоне (границы)

- **`Enum.HasFlag`**: страница S1 (enum) метод не упоминает — показывает `&`-паттерн
  (F6). Чтобы дать авторитетный факт про `HasFlag` (в т.ч. про его перф-оверхед из-за
  боксинга аргумента), нужен отдельный fetch страницы `System.Enum.HasFlag`
  (learn.microsoft.com/dotnet/api/system.enum.hasflag). → **ДЕГРАДИРОВАНО: страница
  HasFlag не фетчилась**. Не заявлять фактов про HasFlag без неё.
- **IL-уровень боксинга при `is`** (M5): требует спайка с реальной компиляцией и
  дизассемблером (`ildasm`/sharplab). Страницы Learn такого не утверждают. → **непроверено**.
- **C# language spec** (Enums §20.6, is/as §12.15): даёт нормативные формулировки, на
  которые S1/S2 ссылаются; сама спека в этом прогоне не фетчилась. Для урока текущих
  цитат из S1/S2/S3 достаточно; спека — при необходимости точных нормативных
  формулировок.

## Реестр покрытия (закрытый корпус: 3 целевые страницы)

| Единица | Источник | Статус |
|---|---|---|
| enum: базовый тип / default int / start at 0 | S1 | покрыто (F2) |
| enum: явный underlying type | S1 | покрыто (F2, M1) |
| enum: default value (E)0 | S1 | покрыто (F3) |
| enum: неявная конверсия 0 | S1 | покрыто (F4, M6) |
| [Flags] + битовые комбинации | S1 | покрыто (F5) |
| HasFlag | — | НЕ покрыто (нужна отд. страница) |
| enum = value type / System.Enum база | S1 | покрыто (F1, F7) |
| enum: null / non-nullable | S1 | покрыто (F7) |
| enum↔underlying explicit cast | S1 | покрыто (F8, M6) |
| enum boxing/unboxing | S1, S3 | покрыто (F9, M4) |
| is: bool, non-null, условия | S2 | покрыто (F10, M3) |
| is: user-defined / numeric не учитывает | S2 | покрыто (F11) |
| is: pattern matching | S2 | покрыто (F12) |
| as: возвращает null, не бросает | S2 | покрыто (F13, M2) |
| as: только ref/nullable/box, не user-defined | S2 | покрыто (F14) |
| cast (T)E: бросает InvalidCastException | S2, S3 | покрыто (F15, F19) |
| cast: user-defined conversions | S2 | покрыто (F16) |
| typeof: System.Type, имя типа, compile-time | S2 | покрыто (F17) |
| typeof vs GetType vs is | S2 | покрыто (F18, M7) |
| boxing/unboxing: implicit/explicit, исключения | S3 | покрыто (F19) |

Остановка: закрытый корпус из 3 запрошенных страниц — прочитаны целиком (100% целевых
единиц ТЗ, кроме HasFlag, требующего страницы вне исходного списка). 19 фактов + 7 мифов.

## Ссылки (первоисточники)

- S1: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum (ms.date 2026-01-14, updated 2026-06-18, BillWagner, gitcommit 2438a1ad)
- S2: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast (ms.date 2026-01-20, updated 2026-04-14, pkulikov, gitcommit 4257ed85)
- S3: https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing (ms.date 2025-10-13, updated 2025-10-17, BillWagner, gitcommit 817cee9a)
