# GT-s1: Value types — семантика копирования, layout, стек vs куча, боксинг

Линза: авторитетные факты по value types для урока/корпуса.
Корпус: **нормативная база жанра** — официальная документация Microsoft Learn (C# reference / programming guide). Это первичка класса **A** (офдок, автор BillWagner, версионируется через git репозиторий dotnet/docs).
Дата сбора: 2026-07-18.

## Источники (первичка, класс A)

- **S1** — Value types (C# reference), дата документа **2026-03-20**, слов ~705.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types
  git-источник: dotnet/docs `docs/csharp/language-reference/builtin-types/value-types.md`
- **S2** — Boxing and Unboxing (C# programming guide), дата документа **2025-10-13**, слов ~1146.
  URL: https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing
  git-источник: dotnet/docs `docs/csharp/programming-guide/types/boxing-and-unboxing.md`

Провенанс: оба — официальные страницы Microsoft Learn, привязаны к публичному git-коммиту в dotnet/docs, датированы, с указанным автором. Цена подделки высокая (правки идут через PR в открытый репозиторий). Свежесть для конвенций языка — стабильна годами; обе редакции актуальны (<18 мес). Оба факта-документа независимо получены прямым fetch.

---

## Находки (утверждение · цитата (en) · источник · уверенность)

### A. Что такое value type и что хранит переменная

**F1.** Value types и reference types — две главные категории типов C#; переменная value-типа содержит сам экземпляр типа, а не ссылку на него.
> "*Value types* and reference types are the two main categories of C# types. A variable of a value type contains an instance of the type. This behavior differs from a variable of a reference type, which contains a reference to an instance of the type."
Источник: S1. Уверенность: **высокая**.

**F2.** Value-тип нельзя присвоить `null`, если это не nullable value type; `T?` представляет все значения `T` плюс дополнительное значение `null`.
> "A nullable value type `T?` represents all values of its underlying value type `T` and an additional null value. You can't assign `null` to a variable of a value type, unless it's a nullable value type."
Источник: S1. Уверенность: **высокая**.

**F3.** Виды value-типов: структура (`struct`), перечисление (`enum`), union-объявление. Все встроенные простые типы (integral, floating-point, `bool`, `char`) — это struct-типы. Value tuple — тоже value type, но не простой тип.
> "All simple types are struct types." / "A value tuple is a value type, but not a simple type."
Источник: S1. Уверенность: **высокая**.

### B. Семантика копирования (что именно копируется)

**F4.** По умолчанию при присваивании, передаче аргумента в метод и возврате результата метода копируются значения переменных; для value-типов копируется сам экземпляр типа.
> "By default, on assignment, passing an argument to a method, and returning a method result, you copy variable values. In the case of value-type variables, you copy the corresponding type instances."
Источник: S1. Уверенность: **высокая**.

**F5.** Операции над переменной value-типа влияют только на тот экземпляр, что хранится в этой переменной (мутация копии не трогает оригинал).
> "operations on a value-type variable affect only that instance of the value type, stored in the variable."
Проверочный артефакт в документе: `p2 = p1; p2.Y = 200;` → `p1` остаётся `(1, 2)`, `p2` = `(1, 200)`; передача в метод `MutateAndDisplay(p2)` не меняет исходный `p2`.
Источник: S1. Уверенность: **высокая**.

**F6.** Если value-тип содержит поле ссылочного типа, при копировании экземпляра копируется ТОЛЬКО ссылка на экземпляр ссылочного типа; и копия, и оригинал получают доступ к ОДНОМУ И ТОМУ ЖЕ экземпляру ссылочного типа (мелкое/поверхностное копирование).
> "If a value type contains a data member of a reference type, you copy only the reference to the instance of the reference type when you copy a value-type instance. Both the copy and original value-type instance have access to the same reference-type instance."
Проверочный артефакт: `struct TaggedInteger` с полем `List<string> tags`; после `n2 = n1; n2.AddTag("B")` вывод `n1` = `0 [A, B]` (тег виден в обеих копиях, т.к. список общий).
Источник: S1. Уверенность: **высокая**.

**F7.** (Рекомендация офдока, не механика языка) Чтобы код был менее ошибкоопасным и более надёжным — определяйте и используйте неизменяемые (immutable) value-типы; мутабельные используются в примерах лишь для демонстрации.
> "To make your code less error-prone and more robust, define and use immutable value types."
Источник: S1. Уверенность: **высокая** (как позиция офдока).

### C. Что такое боксинг и когда value-тип попадает на кучу

**F8.** Boxing — процесс конвертации value-типа в тип `object` или в любой интерфейсный тип, реализуемый этим value-типом. При боксинге CLR оборачивает значение в экземпляр `System.Object` и хранит его в управляемой куче (managed heap).
> "Boxing is the process of converting a value type to the type `object` or to any interface type implemented by this value type. When the common language runtime (CLR) boxes a value type, it wraps the value inside a System.Object instance and stores it on the managed heap."
Источник: S2. Уверенность: **высокая**.

**F9.** Боксинг — неявное преобразование; распаковка (unboxing) — явное. Явный боксинг возможен, но никогда не требуется.
> "Boxing is implicit; unboxing is explicit." / "It is also possible to perform the boxing explicitly ... but explicit boxing is never required."
Источник: S2. Уверенность: **высокая**.

**F10.** Боксинг value-типа выделяет экземпляр объекта на куче и КОПИРУЕТ значение в новый объект. Боксинг используется для хранения value-типов в куче со сборкой мусора.
> "Boxing a value type allocates an object instance on the heap and copies the value into the new object." / "Boxing is used to store value types in the garbage-collected heap."
Источник: S2. Уверенность: **высокая**.

**F11.** Результат `object o = i;` — на СТЕКЕ создаётся ссылка на объект `o`, которая указывает на значение типа `int` на КУЧЕ; это значение — копия value-значения переменной `i`.
> "The result of this statement is creating an object reference `o`, on the stack, that references a value of the type `int`, on the heap. This value is a copy of the value-type value assigned to the variable `i`."
Источник: S2. Уверенность: **высокая**.
> Замечание корпуса (границы): формулировка «на стеке» описывает конкретный пример с локальной переменной; сама доктрина «value → stack, reference → heap» имеет исключения (поля объектов, замыкания, `async`). Офдок здесь говорит именно про этот пример, не даёт универсального правила размещения. Для урока подавать как «в этом сценарии», а не как закон.

**F12.** Оригинальный value-тип и его боксированный объект используют РАЗНЫЕ области памяти и потому могут хранить разные значения (мутация оригинала после боксинга не меняет боксированную копию).
> "the original value type and the boxed object use separate memory locations, and therefore can store different values."
Проверочный артефакт: `int i = 123; object o = i;` затем `i = 456;` → `o` остаётся `123`.
Источник: S2. Уверенность: **высокая**.

**F13.** Типичные неявные боксинги в реальном коде: добавление `int` в `List<object>` боксит каждый элемент; передача value-типов в перегрузку с `object`-параметрами (напр. `String.Concat("Answer", 42, true)` боксит `42` и `true`).
> "Each element j is boxed when you add j to mixedList." / "Both 42 and true must be boxed."
Источник: S2. Уверенность: **высокая**.

### D. Распаковка (unboxing) и её требования

**F14.** Unboxing — явное преобразование из `object` (или из интерфейсного типа) в value-тип; операция состоит из проверки, что экземпляр — боксированное значение данного value-типа, и копирования значения из экземпляра в переменную value-типа.
> "An unboxing operation consists of: Checking the object instance to make sure that it's a boxed value of the given value type. Copying the value from the instance into the value-type variable."
Источник: S2. Уверенность: **высокая**.

**F15.** Чтобы распаковка прошла в рантайме, распаковываемый элемент должен быть ссылкой на объект, ранее созданный боксингом экземпляра именно этого value-типа. Распаковка `null` → `NullReferenceException`; распаковка ссылки на несовместимый value-тип → `InvalidCastException`.
> "the item being unboxed must be a reference to an object that was previously created by boxing an instance of that value type. Attempting to unbox `null` causes a NullReferenceException. Attempting to unbox a reference to an incompatible value type causes an InvalidCastException."
Проверочный артефакт: `object o = i;` (где `i` — `int`), затем `int j = (short)o;` → `InvalidCastException` («Specified cast is not valid»), т.к. распаковка требует ТОЧНОГО типа, а не совместимого по конверсии.
Источник: S2. Уверенность: **высокая**.

### E. Стоимость боксинга (перф)

**F16.** Относительно простых присваиваний боксинг и распаковка — вычислительно дорогие процессы. При боксинге должен быть выделен и сконструирован новый объект; каст при распаковке тоже дорог (в меньшей степени).
> "In relation to simple assignments, boxing and unboxing are computationally expensive processes. When a value type is boxed, a new object must be allocated and constructed. To a lesser degree, the cast required for unboxing is also expensive computationally."
Источник: S2. Уверенность: **высокая**.
> Границы: конкретных чисел (нс, байты аллокации) офдок здесь НЕ даёт — только качественная оценка «дорого + новая аллокация». Для количественных порогов урока нужен отдельный бенчмарк-артефакт (не покрыто этим корпусом).

---

## Реестр покрытия (закрытый корпус: 2 заданных документа)

| # | Аспект вопроса | Покрыто | Утверждения |
|---|---|---|---|
| 1 | Что копируется при присваивании | да | F1, F4, F5 |
| 2 | Что копируется при передаче в метод / возврате | да | F4, F5 |
| 3 | Копирование при вложенном reference-поле (shallow) | да | F6 |
| 4 | Layout struct (состав, поля) | частично | F3 (виды), примеры struct в F5/F6 |
| 5 | Стек vs куча (где живёт value) | частично | F1, F11 (+ граница о неуниверсальности) |
| 6 | Когда value-тип попадает на кучу (боксинг) | да | F8, F10, F11, F13 |
| 7 | Механика боксинга (аллокация + копия) | да | F10, F11, F12 |
| 8 | Механика/требования распаковки | да | F14, F15 |
| 9 | Стоимость боксинга | да (качественно) | F16 |
| 10 | Nullable value types | да | F2 |

Оба заданных документа прочитаны целиком (100% замороженного скоупа) → остановка по критерию закрытого корпуса.

## Противоречия источников
Не обнаружено. S1 и S2 согласованы (S2 ссылается на S1 для определения value type). Взаимные ссылки внутри одного офдок-домена — это одна первичка, не два независимых канала.

## Что НЕ удалось выяснить (границы этого корпуса)
- **Детальный физический layout struct** (порядок полей, паддинг, `StructLayout`, размер в байтах) — на заданных двух страницах нет. Живёт в других разделах (`System.Runtime.InteropServices.StructLayoutAttribute`, спецификация памяти). Требует отдельного источника.
- **Универсальное правило размещения стек/куча** — офдок сознательно не формулирует его как закон; распространённое утверждение «value types всегда на стеке» НЕ подтверждается этими страницами (они говорят только про конкретный пример боксинга, F11). Для урока: не подавать «всегда на стеке» как факт.
- **Количественные метрики стоимости боксинга** (нс/аллокации) — офдок даёт только качественную оценку (F16); числа требуют бенчмарк-артефакта.

## Рекомендация для builder/evaluator
Все 16 утверждений подтверждены первичкой класса A с дословными цитатами и датами. Для урока безопасно строить на F1–F16. Два места требуют аккуратной формулировки (пометки в F11 и в «что не удалось»): (1) не абсолютизировать «стек vs куча»; (2) стоимость боксинга подавать качественно либо добавить отдельный бенчмарк-спайк. Для темы «layout struct» — при необходимости добрать отдельный офдок (StructLayout / спецификация), текущие 2 страницы этот аспект покрывают лишь косвенно.
