# RS-03: Реестр документации C# (Microsoft Learn) — v2 после критики

**Дата первичного сбора**: 2026-07-17
**Дата перепроверки всех URL**: 2026-07-17 (та же сессия, после замечаний критика)
**Корпус**: Официальная документация Microsoft Learn (https://learn.microsoft.com/en-us/dotnet/)
**Цель**: Полный реестр тем трека C# «сеньор, вглубь» для пересборки с нуля.

---

## 0. Методика верификации URL (артефакты проверки)

Каждый URL реестра проверен тремя независимыми каналами:

1. **HTTP-статус (curl, 2026-07-17)**: 141 URL → 65×200, 8×404, 68×429 (rate-limit Learn).
2. **Дерево репозитория `dotnet/docs`** (генерирует сайт Learn; ветка `main`, 28 097 файлов,
   получено `gh api repos/dotnet/docs/git/trees/main?recursive=1` 2026-07-17):
   101 концептуальный URL подтверждён наличием `docs/<path>.md|/index.md|/index.yml`;
   17 путей отсутствовали (8 = curl-404 + 9 битых из 429-партии) — все заменены живыми.
3. **Репозиторий `dotnet/dotnet-api-docs`** (генерирует /dotnet/api/): 23 API-страницы
   подтверждены наличием XML типа/неймспейса (Func`2, Type, String, StringBuilder,
   StringComparison, Volatile, Interlocked, ThreadLocal`1, AsyncLocal`1,
   BlockingCollection`1, Dictionary`2, List`1, HashSet`1, LambdaExpression,
   ValueTask`1, Stream, Marshal, IEnumerable`1, Lock, DispatchProxy, WeakReference,
   ns-System.Collections.Immutable, ns-System.Threading.Channels).

**Исправленные битые URL (17)**:

| Было (404/нет в дереве) | Стало (подтверждено деревом) |
|---|---|
| /dotnet/standard/threading/async-programming/ | /dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model |
| /dotnet/csharp/fundamentals/types/delegates | /dotnet/csharp/delegates-overview |
| /dotnet/standard/events/weak-event-patterns | /dotnet/standard/events/ (weak-event — WPF-специфика, из реестра убрана) |
| /dotnet/standard/reflection/ | /dotnet/fundamentals/reflection/overview |
| /dotnet/fundamentals/reflection/emit | /dotnet/fundamentals/reflection/emitting-dynamic-methods-and-assemblies |
| /dotnet/standard/reflection/dynamically-loading-and-using-types | /dotnet/fundamentals/reflection/dynamically-loading-and-using-types |
| /dotnet/standard/reflection/reflection-and-generic-types | /dotnet/fundamentals/reflection/reflection-and-generic-types |
| /dotnet/standard/garbage-collection/generations | /dotnet/standard/garbage-collection/fundamentals |
| /dotnet/standard/parallel-programming/parallel-linq-plinq | /dotnet/standard/parallel-programming/introduction-to-plinq |
| /dotnet/standard/generics/performance | /dotnet/standard/generics |
| /dotnet/standard/base-types/string-comparison-net-5-plus | /dotnet/standard/base-types/best-practices-strings |
| /dotnet/core/extensions/dependency-injection | /dotnet/core/extensions/dependency-injection/overview |
| /dotnet/csharp/nullable-references | /dotnet/csharp/fundamentals/null-safety/nullable-reference-types |
| /dotnet/csharp/language-reference/proposals/csharp-9.0/records | убран; тема покрыта /dotnet/csharp/language-reference/builtin-types/record |
| /dotnet/csharp/tutorials/async-return-types | /dotnet/csharp/asynchronous-programming/async-return-types |
| /dotnet/api/system.linq.expressions.expression.compile | /dotnet/api/system.linq.expressions.lambdaexpression.compile |
| обзорные «зонтичные» ссылки на /dotnet/csharp/asynchronous-programming/ у частных тем | заменены точными страницами (async-scenarios, async-return-types и т.д.) |

**Особый случай**: /dotnet/csharp/language-reference/language-specification/readme —
генерится из сабмодуля `dotnet/csharpstandard` (в дереве docs его нет); подтверждён
косвенно: ссылка присутствует на живой хаб-странице C# (fetch 2026-07-17).

Все URL ниже — из проверенного множества. База: `https://learn.microsoft.com/en-us/`.

---

## 1. Структура корпуса (верхний уровень)

1. **Fundamentals** — Types, OOP, Functional, Exceptions — dotnet/csharp/fundamentals/…
2. **Language Concepts** — LINQ, Async — dotnet/csharp/linq/, dotnet/csharp/asynchronous-programming/
3. **Advanced Topics** — Reflection, Expression trees, Interop, Performance — dotnet/csharp/advanced-topics/…
4. **Language Reference** — Keywords, Operators, Statements, Built-in types, Unsafe — dotnet/csharp/language-reference/…
5. **.NET Runtime** — GC, Memory/Span, Threading, Collections, Serialization, IO — dotnet/standard/…, dotnet/fundamentals/…, dotnet/core/extensions/…

---

## 2. Реестр разделов и уроков (все URL проверены 2026-07-17)

### РАЗДЕЛ 1: Типовая система (Core, 10 уроков)
1. Обзор типовой системы, CTS, compile-time vs run-time тип — dotnet/csharp/fundamentals/types/
2. Value types: семантика копирования, layout — dotnet/csharp/language-reference/builtin-types/value-types
3. Классы, наследование, virtual dispatch — dotnet/csharp/fundamentals/object-oriented/
4. Структуры: readonly, mutable-ловушки — dotnet/csharp/language-reference/builtin-types/struct
5. Records: value equality, with, синтез методов компилятором — dotnet/csharp/language-reference/builtin-types/record
6. Интерфейсы, default interface methods — dotnet/csharp/fundamentals/types/interfaces + dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions
7. Enum и флаги — dotnet/csharp/language-reference/builtin-types/enum
8. Generics: базовая механика — dotnet/csharp/fundamentals/types/generics
9. Nullable value types (Nullable<T>, боксинг nullable) — dotnet/csharp/language-reference/builtin-types/nullable-value-types
10. Приведения типов, is/as/typeof — dotnet/csharp/language-reference/operators/type-testing-and-cast

### РАЗДЕЛ 2: Async/Await и Task (Core, 9 уроков)
1. Модель TAP, зачем и как — dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model
2. Обзор async: композиция, WhenAll/WhenAny — dotnet/csharp/asynchronous-programming/
3. Async-сценарии (I/O-bound vs CPU-bound) — dotnet/csharp/asynchronous-programming/async-scenarios
4. Async return types (Task, Task<T>, ValueTask, void) — dotnet/csharp/asynchronous-programming/async-return-types
5. ValueTask<T>: когда и почему — dotnet/api/system.threading.tasks.valuetask-1
6. TAP-паттерн изнутри (контракт, статусы) — dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap
7. Исключения в async, AggregateException — dotnet/standard/parallel-programming/exception-handling-task-parallel-library
8. Cancellation: кооперативная отмена, linked tokens — dotnet/standard/threading/cancellation-in-managed-threads
9. Async streams: IAsyncEnumerable, await foreach — dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream

### РАЗДЕЛ 3: LINQ (Core, 8 уроков)
1. Query expressions, две формы синтаксиса — dotnet/csharp/linq/
2. Введение в LINQ-запросы, выполнение — dotnet/csharp/linq/get-started/introduction-to-linq-queries
3. Standard query operators (обзор + Select/Where/GroupBy/Join) — dotnet/csharp/linq/standard-query-operators/
4. Deferred execution, streaming vs buffering — dotnet/csharp/linq/get-started/introduction-to-linq-queries
5. IEnumerable<T> vs IQueryable<T>: делегаты vs expression trees — dotnet/csharp/linq/ + dotnet/api/system.collections.generic.ienumerable-1
6. LINQ-провайдеры (простые/средние/EF Core) — dotnet/csharp/linq/
7. PLINQ: параллельные запросы, ordering, partitioning — dotnet/standard/parallel-programming/introduction-to-plinq
8. Кастомные операторы и extension methods — dotnet/csharp/programming-guide/classes-and-structs/extension-methods

### РАЗДЕЛ 4: Делегаты и события (Core, 7 уроков)
1. Обзор делегатов (type-safe function pointers) — dotnet/csharp/delegates-overview
2. Делегаты: объявление, multicast, инстанцирование — dotnet/csharp/programming-guide/delegates/
3. Лямбды и замыкания (capture семантика, компиляторные классы) — dotnet/csharp/language-reference/operators/lambda-expressions
4. Func/Action/Predicate — dotnet/api/system.func-2
5. События: event keyword, паттерн EventHandler — dotnet/csharp/language-reference/keywords/event + dotnet/standard/events/
6. Вариантность делегатов — dotnet/csharp/programming-guide/concepts/covariance-contravariance/
7. Async event handlers и ловушки async-лямбд — dotnet/standard/asynchronous-programming-patterns/ (async-lambda-pitfalls)

### РАЗДЕЛ 5: Pattern Matching (Core, 7 уроков)
1. Обзор pattern matching, null-checks — dotnet/csharp/fundamentals/functional/pattern-matching
2. Полный словарь паттернов — dotnet/csharp/language-reference/operators/patterns
3. Switch expressions, exhaustiveness — dotnet/csharp/language-reference/operators/switch-expression
4. is-оператор, declaration patterns — dotnet/csharp/language-reference/operators/is
5. Relational/logical patterns — dotnet/csharp/language-reference/operators/patterns
6. Positional/property patterns, Deconstruct — dotnet/csharp/language-reference/operators/patterns
7. List patterns, slice — dotnet/csharp/language-reference/operators/patterns

### РАЗДЕЛ 6: Reflection и атрибуты (Core, 7 уроков)
1. Обзор reflection — dotnet/fundamentals/reflection/overview
2. Type и метаданные членов — dotnet/api/system.type + dotnet/fundamentals/reflection/get-type-member-information
3. Динамическая загрузка и использование типов — dotnet/fundamentals/reflection/dynamically-loading-and-using-types
4. Атрибуты: создание и чтение — dotnet/csharp/advanced-topics/reflection-and-attributes/
5. Reflection.Emit, DynamicMethod — dotnet/fundamentals/reflection/emitting-dynamic-methods-and-assemblies
6. Reflection и generics — dotnet/fundamentals/reflection/reflection-and-generic-types
7. Source generators (компайл-тайм альтернатива) — dotnet/csharp/roslyn-sdk/

### РАЗДЕЛ 7: Память и GC (Core, 10 уроков)
1. Обзор GC — dotnet/standard/garbage-collection/
2. Фундамент GC: поколения, managed heap, сегменты — dotnet/standard/garbage-collection/fundamentals
3. Workstation vs Server GC — dotnet/standard/garbage-collection/workstation-server-gc
4. Latency-режимы GC — dotnet/standard/garbage-collection/latency
5. Large Object Heap — dotnet/standard/garbage-collection/large-object-heap
6. Финализаторы, Dispose pattern — dotnet/standard/garbage-collection/implementing-dispose
7. Weak references — dotnet/standard/garbage-collection/weak-references + dotnet/api/system.weakreference
8. Span<T>/Memory<T>: устройство и ограничения — dotnet/standard/memory-and-spans/
9. Memory<T> usage guidelines (ownership, pipelines) — dotnet/standard/memory-and-spans/memory-t-usage-guidelines
10. stackalloc, ref struct — dotnet/csharp/language-reference/operators/stackalloc + dotnet/csharp/language-reference/builtin-types/ref-struct

### РАЗДЕЛ 8: Threading и синхронизация (Core, 9 уроков)
1. Основы managed threading — dotnet/standard/threading/managed-threading-basics
2. Threads and threading (пул, foreground/background) — dotnet/standard/threading/threads-and-threading
3. lock statement и System.Threading.Lock (.NET 9+) — dotnet/csharp/language-reference/statements/lock + dotnet/api/system.threading.lock
4. Обзор примитивов синхронизации — dotnet/standard/threading/overview-of-synchronization-primitives
5. Threading objects and features (Mutex/Semaphore/Events) — dotnet/standard/threading/threading-objects-and-features
6. Volatile и модель памяти — dotnet/api/system.threading.volatile
7. Interlocked, lock-free паттерны — dotnet/api/system.threading.interlocked
8. TPL: Parallel.For/ForEach, TaskScheduler — dotnet/standard/parallel-programming/task-parallel-library-tpl
9. ThreadLocal/AsyncLocal (контекст в async) — dotnet/api/system.threading.threadlocal-1 + dotnet/api/system.threading.asynclocal-1

### РАЗДЕЛ 9: Исключения (Core, 7 уроков)
1. Обзор исключений, unwinding стека — dotnet/csharp/fundamentals/exceptions/
2. try/catch/finally/throw statements — dotnet/csharp/language-reference/statements/exception-handling-statements
3. Exception filters (when) — dotnet/csharp/language-reference/statements/exception-handling-statements
4. Best practices (что бросать, что ловить) — dotnet/standard/exceptions/best-practices-for-exceptions
5. Исключения в task-returning методах — dotnet/csharp/fundamentals/exceptions/
6. AggregateException и TPL — dotnet/standard/parallel-programming/exception-handling-task-parallel-library
7. SEH-подложка Win32 (упомянута в overview) — dotnet/csharp/fundamentals/exceptions/

### РАЗДЕЛ 10: Generics вглубь (Core, 8 уроков)
1. Generics в рантайме (.NET-уровень, JIT-специализация) — dotnet/standard/generics
2. Constraints (where, unmanaged, notnull, allows ref struct) — dotnet/csharp/programming-guide/generics/constraints-on-type-parameters
3. default(T) и default-выражения — dotnet/csharp/language-reference/keywords/default
4. Ковариантность/контравариантность (in/out) — dotnet/csharp/programming-guide/concepts/covariance-contravariance/
5. out/ref/in параметры и generics — dotnet/csharp/language-reference/keywords/out
6. Type inference у generic-методов — dotnet/csharp/language-reference/language-specification/readme (спека)
7. Generic-коллекции vs объектные (боксинг) — dotnet/standard/generics
8. Reflection над generic-типами — dotnet/fundamentals/reflection/reflection-and-generic-types

### РАЗДЕЛ 11: Expression Trees (Optional, 6 уроков)
1. Обзор expression trees — dotnet/csharp/advanced-topics/expression-trees/
2. Построение деревьев (Expression classes) — dotnet/csharp/advanced-topics/expression-trees/ (expression-trees-building)
3. Выполнение: LambdaExpression.Compile — dotnet/api/system.linq.expressions.lambdaexpression.compile
4. Интерпретация и трансформация (visitors) — dotnet/csharp/advanced-topics/expression-trees/ (expression-trees-execution)
5. Отладка деревьев (DebugView) — dotnet/csharp/advanced-topics/expression-trees/ (debugview-syntax)
6. IQueryable-провайдер на деревьях — dotnet/csharp/linq/

### РАЗДЕЛ 12: Строки и интернирование (Optional, 6 уроков)
1. System.String: иммутабельность, аллокации — dotnet/api/system.string
2. String.Intern и пул интернирования — dotnet/api/system.string.intern
3. StringBuilder — dotnet/api/system.text.stringbuilder
4. Best practices сравнения строк (ordinal vs culture) — dotnet/standard/base-types/best-practices-strings + dotnet/api/system.stringcomparison
5. Кодировки, UTF-16, Rune — dotnet/standard/base-types/character-encoding-introduction
6. Regex (компилируемые, source-generated) — dotnet/standard/base-types/regular-expressions

### РАЗДЕЛ 13: DI и конфигурация (Optional, 5 уроков)
1. DI в .NET: обзор — dotnet/core/extensions/dependency-injection/overview
2. Lifetimes (Singleton/Scoped/Transient) — dotnet/core/extensions/dependency-injection/overview
3. Guidelines и анти-паттерны — dotnet/core/extensions/dependency-injection/overview
4. DispatchProxy: динамические прокси — dotnet/api/system.reflection.dispatchproxy
5. Фабрики, Func<T>-инъекции — dotnet/core/extensions/dependency-injection/overview

### РАЗДЕЛ 14: Современный C# 8–15 (Core, 7 уроков)
1. Nullable reference types — dotnet/csharp/fundamentals/null-safety/nullable-reference-types
2. NRT в language reference (аннотации, контекст) — dotnet/csharp/language-reference/builtin-types/nullable-reference-types
3. init-only свойства, required — dotnet/csharp/language-reference/keywords/init + dotnet/csharp/language-reference/keywords/required
4. Top-level statements — dotnet/csharp/fundamentals/program-structure/top-level-statements
5. История версий C# (карта фич) — dotnet/csharp/whats-new/csharp-version-history
6. C# 15: union types, closed hierarchies — dotnet/csharp/whats-new/csharp-15
7. C# 15: memory safety evolution — dotnet/csharp/whats-new/csharp-15

### РАЗДЕЛ 15: Unsafe и Interop (Optional, 6 уроков)
1. Unsafe code, указатели, function pointers — dotnet/csharp/language-reference/unsafe-code
2. fixed statement, пиннинг — dotnet/csharp/language-reference/statements/fixed
3. P/Invoke — dotnet/standard/native-interop/pinvoke
4. Маршалинг типов — dotnet/standard/native-interop/type-marshalling + dotnet/api/system.runtime.interopservices.marshal
5. COM interop — dotnet/standard/native-interop/cominterop
6. Обзор native interop + C#-сторона — dotnet/standard/native-interop/ + dotnet/csharp/advanced-topics/interop/

### РАЗДЕЛ 16: Спецификация, CLR и Roslyn (Optional, 5 уроков)
1. CLR: managed execution process — dotnet/standard/clr + dotnet/standard/managed-execution-process
2. Assemblies: устройство, загрузка — dotnet/standard/assembly/
3. Спецификация языка (структура, нормативные ответы) — dotnet/csharp/language-reference/language-specification/readme (см. «особый случай» в §0)
4. Performance engineering (advanced topics) — dotnet/csharp/advanced-topics/performance/
5. Roslyn SDK: syntax/semantic model, генераторы — dotnet/csharp/roslyn-sdk/

### РАЗДЕЛ 17: Внутренности коллекций (Core, 7 уроков) — НОВЫЙ
Тема удаляемого урока `hashtable` сохраняется здесь (урок 3) — регрессии нет.
1. Обзор коллекций .NET — dotnet/standard/collections/
2. Выбор коллекции (характеристики сложности) — dotnet/standard/collections/selecting-a-collection-class
3. Hashtable и Dictionary: бакеты, коллизии, resize — dotnet/standard/collections/hashtable-and-dictionary-collection-types + dotnet/api/system.collections.generic.dictionary-2
4. List<T>: массив под капотом, Capacity/рост — dotnet/api/system.collections.generic.list-1
5. HashSet<T>, generic vs non-generic — dotnet/api/system.collections.generic.hashset-1 + dotnet/standard/collections/commonly-used-collection-types
6. Thread-safe коллекции (Concurrent*, BlockingCollection) — dotnet/standard/collections/thread-safe/ + dotnet/api/system.collections.concurrent.blockingcollection-1
7. Immutable-коллекции — dotnet/api/system.collections.immutable

### РАЗДЕЛ 18: Итераторы и yield (Core, 4 урока) — НОВЫЙ
1. Iterators: обзор, ленивость — dotnet/csharp/iterators
2. yield statement: контракт — dotnet/csharp/language-reference/statements/yield
3. Стейт-машина итератора (компиляторная трансформация) — dotnet/csharp/programming-guide/concepts/iterators + dotnet/api/system.collections.generic.ienumerable-1
4. Async streams: IAsyncEnumerable как стейт-машина — dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream

### РАЗДЕЛ 19: System.Text.Json (Core, 5 уроков) — НОВЫЙ
1. Обзор сериализации STJ — dotnet/standard/serialization/system-text-json/overview
2. Serialize/deserialize how-to — dotnet/standard/serialization/system-text-json/how-to
3. Source generation (режимы, AOT) — dotnet/standard/serialization/system-text-json/source-generation
4. Кастомные конвертеры — dotnet/standard/serialization/system-text-json/converters-how-to
5. Отличия от Newtonsoft.Json (семантика) — dotnet/standard/serialization/system-text-json/migrate-from-newtonsoft

### РАЗДЕЛ 20: System.Threading.Channels (Core, 3 урока) — НОВЫЙ
1. Channels: обзор, зачем — dotnet/core/extensions/channels
2. Bounded/unbounded, backpressure — dotnet/core/extensions/channels
3. Producer/consumer поверх каналов — dotnet/core/extensions/channels + dotnet/api/system.threading.channels
(якорь один — раздел документируется одной большой статьёй + API ns; отмечено честно)

### РАЗДЕЛ 21: IO, Streams и Pipelines (Optional, 5 уроков) — НОВЫЙ
1. File and stream I/O: обзор — dotnet/standard/io/
2. Stream API: контракт, async IO — dotnet/api/system.io.stream
3. System.IO.Pipelines: зачем и как — dotnet/standard/io/pipelines
4. Буферы: ArrayPool, IBufferWriter, ReadOnlySequence — dotnet/standard/io/buffers
5. Каналы vs pipelines vs streams (выбор) — dotnet/standard/io/pipelines + dotnet/core/extensions/channels

---

## 3. Итоговая таблица: раздел → уроков → якорные URL

База URL: `https://learn.microsoft.com/en-us/`

| № | Раздел | Уроков | Класс | Якорные URL (проверены 2026-07-17) |
|---|--------|--------|-------|-------------------------------------|
| 1 | Типовая система | 10 | Core | dotnet/csharp/fundamentals/types/ · dotnet/csharp/language-reference/builtin-types/value-types |
| 2 | Async/Await & Task | 9 | Core | dotnet/csharp/asynchronous-programming/ · dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap |
| 3 | LINQ | 8 | Core | dotnet/csharp/linq/ · dotnet/csharp/linq/standard-query-operators/ |
| 4 | Делегаты и события | 7 | Core | dotnet/csharp/delegates-overview · dotnet/csharp/programming-guide/delegates/ |
| 5 | Pattern Matching | 7 | Core | dotnet/csharp/fundamentals/functional/pattern-matching · dotnet/csharp/language-reference/operators/patterns |
| 6 | Reflection и атрибуты | 7 | Core | dotnet/fundamentals/reflection/overview · dotnet/csharp/advanced-topics/reflection-and-attributes/ |
| 7 | Память и GC | 10 | Core | dotnet/standard/garbage-collection/fundamentals · dotnet/standard/memory-and-spans/ |
| 8 | Threading и синхронизация | 9 | Core | dotnet/standard/threading/managed-threading-basics · dotnet/standard/threading/overview-of-synchronization-primitives |
| 9 | Исключения | 7 | Core | dotnet/csharp/fundamentals/exceptions/ · dotnet/standard/exceptions/best-practices-for-exceptions |
| 10 | Generics вглубь | 8 | Core | dotnet/standard/generics · dotnet/csharp/programming-guide/generics/constraints-on-type-parameters |
| 11 | Expression Trees | 6 | Optional | dotnet/csharp/advanced-topics/expression-trees/ |
| 12 | Строки и интернирование | 6 | Optional | dotnet/api/system.string · dotnet/standard/base-types/best-practices-strings |
| 13 | DI и конфигурация | 5 | Optional | dotnet/core/extensions/dependency-injection/overview |
| 14 | Современный C# 8–15 | 7 | Core | dotnet/csharp/whats-new/csharp-15 · dotnet/csharp/fundamentals/null-safety/nullable-reference-types |
| 15 | Unsafe и Interop | 6 | Optional | dotnet/csharp/language-reference/unsafe-code · dotnet/standard/native-interop/pinvoke |
| 16 | Спецификация, CLR, Roslyn | 5 | Optional | dotnet/standard/clr · dotnet/csharp/roslyn-sdk/ |
| 17 | Внутренности коллекций | 7 | Core | dotnet/standard/collections/hashtable-and-dictionary-collection-types · dotnet/api/system.collections.generic.dictionary-2 |
| 18 | Итераторы и yield | 4 | Core | dotnet/csharp/iterators · dotnet/csharp/language-reference/statements/yield |
| 19 | System.Text.Json | 5 | Core | dotnet/standard/serialization/system-text-json/overview · …/source-generation |
| 20 | System.Threading.Channels | 3 | Core | dotnet/core/extensions/channels |
| 21 | IO, Streams, Pipelines | 5 | Optional | dotnet/standard/io/ · dotnet/standard/io/pipelines |

**Пересчёт (исправляет и внутреннее противоречие v1, где заявленные «72 core» не бились с собственной таблицей)**:
- **Core: 15 разделов = 10+9+8+7+7+7+10+9+7+8+7+7+4+5+3 = 108 уроков**
- **Optional: 6 разделов = 6+6+5+6+5+5 = 33 урока**
- **ИТОГО: 141 урок** (v1: 117; добавлено 24 урока в 5 новых разделах: коллекции 7, итераторы 4, System.Text.Json 5, Channels 3, IO/Pipelines 5)

---

## 4. Покрытие тем удаляемых уроков (анти-регрессия)

| Старый урок | Куда лёг в новом реестре |
|---|---|
| async-await | Раздел 2 (уроки 1–6) |
| boxing | Раздел 1 (урок 2) + Раздел 10 (урок 7) |
| closures | Раздел 4 (урок 3) |
| gc | Раздел 7 (уроки 1–7) |
| hashtable | **Раздел 17 (урок 3)** — сохранён явно |
| value-vs-reference | Раздел 1 (уроки 1–2) |

---

## 5. Реестр покрытия и остановка

Корпус — открытый (веб), скоуп заморожен структурой TOC Learn: концептуальные разделы
csharp/* и standard/*/fundamentals/* уровня сеньора. Покрыто фетчем/деревом: hub C#,
fundamentals (types, OOP, exceptions, pattern matching), asynchronous-programming, linq,
language-reference (keywords, builtin-types), whats-new (C# 15), standard:
garbage-collection, memory-and-spans, threading, parallel-programming, collections,
serialization/system-text-json, io, native-interop, generics, base-types;
fundamentals/reflection; core/extensions (DI, channels). Последние проходы по дереву
новых разделов уровня реестра не дали → насыщение по замороженному скоупу.

Сознательно вне скоупа (не «C# вглубь»): ASP.NET Core, EF Core, MAUI/desktop, Azure,
ML.NET — фреймворки (частично лягут в RS-04 «инструменты бэкенда»).

## 6. Противоречия источников
Не обнаружено: корпус один (Microsoft Learn), внутренние ссылки согласованы.
Зона неопределённости — страница языковой спеки (сабмодуль, не в дереве docs).

## 7. Что не удалось выяснить
- Финальный HTTP-статус 60 URL из 429-партии (rate-limit Learn в момент проверки);
  компенсировано проверкой по деревьям `dotnet/docs` / `dotnet-api-docs` — провенанс
  сильнее (сайт генерится из этих репо), но пост-публикационные редиректы дерево не
  отражает. Риск низкий: дерево ветки main от 2026-07-17.
- Достаточность единственного якоря для раздела Channels (3 урока на одну статью +
  API ns) — при билде добирать фактуру из API-доков System.Threading.Channels.

## 8. Рекомендация
Строить трек по 15 Core-разделам (108 уроков) волнами; Optional (33) — хвост.
Волна 1 (паритет+ с удаляемым треком): разделы 1, 2, 7, 17, 18 — 40 уроков.
Обоснование: закрывают все 6 удаляемых уроков (см. §4) + главные сеньор-темы
(память/GC, async-стейт-машины, коллекции), 100% якорей проверено артефактами §0.
