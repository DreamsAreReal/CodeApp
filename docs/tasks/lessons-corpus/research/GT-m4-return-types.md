# GT-m4 — Async return types (S2.4) и ValueTask/ValueTask<T> + ограничения (S2.5)

Линза: ground-truth факты для урока/корпуса по темам S2.4 (async return types: `Task`,
`Task<T>`, `void`, `ValueTask`, `ValueTask<T>`, generalized/task-like типы,
`IAsyncEnumerable<T>`) и S2.5 (когда брать `ValueTask` и его ограничения: нельзя await
дважды, нельзя блокировать/потреблять повторно; трейдофы против `Task`).

Корпус: **нормативная база жанра** — официальная документация Microsoft Learn (C#
asynchronous-programming / .NET API `System.Threading.Tasks` / .NET fundamentals async
patterns). Первичка класса **A**: страницы поддерживаются мейнтейнером dotnet/docs
(BillWagner) и dotnet-api-docs (dotnet-bot), имеют git-историю коммитов и даты; API-страницы
ссылаются на **исходник рантайма** `ValueTask.cs` в dotnet/runtime — очень высокая цена
подделки. Правки идут через открытые PR в dotnet/docs и dotnet-api-docs.

Дата сбора: **2026-07-18**. Все URL — en-us Microsoft Learn (moniker `net-10.0` для API).
Каждый факт получен прямым `fetch` соответствующей страницы (не из памяти модели).

## Источники и провенанс

| ID | Страница | URL | ms.date / updated_at | git_commit_id | Класс | Заметки провенанса |
|----|----------|-----|----------------------|---------------|-------|--------------------|
| S1 | Async return types (C# asynchronous-programming) | https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-return-types | ms.date 2024-11-22 / upd 2026-03-30 | 156931bb | A | dotnet/docs, author BillWagner; **НЕ** ai-assisted. Каноническая страница ТЗ №1 |
| S2 | ValueTask<TResult> Struct (System.Threading.Tasks, net-10.0) | https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask-1 | ms.date 2025-07-01 / upd 2026-05-27 | 6dac9a9f | A | dotnet-api-docs; Remarks + ссылка на исходник рантайма `ValueTask.cs` (dotnet/runtime). Каноническая страница ТЗ №2 |
| S3 | ValueTask Struct (non-generic, net-10.0) | https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask | ms.date 2025-07-01 / upd 2026-05-27 | 6dac9a9f | A | dotnet-api-docs; тот же исходник рантайма. Для полноты набора типов и мифа «ValueTask всегда лучше» |
| S4 | Common async/await bugs (.NET fundamentals) | https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/common-async-bugs | ms.date 2026-04-09 / upd 2026-04-30 | bb5e5b83 | A/ai | dotnet/docs, author BillWagner. **Флаг `ai-usage: ai-assisted`** → факты берутся ТОЛЬКО как подтверждающий второй канал того, что дословно есть в S1/S2/S3 |

**Независимость каналов.** Правило «ValueTask нельзя await дважды / потреблять повторно /
блокировать» подтверждается ДВУМЯ независимыми каналами: S2 (Remarks generic) и S3
(Remarks non-generic) — плюс оба ссылаются на исходник рантайма. Проблемы `async void`
(нельзя await, исключения не ловятся вызывающим) — S1 (C# reference, не ai) и S4
(.NET fundamentals, ai-assisted, как подтверждение). Рекомендация «дефолт = `Task`/`Task<T>`»
— S2 и S3 (обе API-страницы) независимо от S1.

**Карантин инъекций.** Внешнего пользовательского контента в источниках нет; страницы
Learn — доверенная нормативная база. Манипулятивных инструкций в теле страниц не встречено.

---

## Находки — S2.4 Async return types

**F1. Полный список return-типов async-метода.** Async-метод может иметь типы:
`Task` (операция без значения), `Task<TResult>` (возвращает значение), `void` (для
обработчика события), любой тип с доступным `GetAwaiter`, объект которого реализует
`ICriticalNotifyCompletion`, и `IAsyncEnumerable<T>` (async stream).
> "Async methods can have the following return types:
> - Task, for an async method that performs an operation but returns no value.
> - Task<TResult>, for an async method that returns a value.
> - `void`, for an event handler.
> - Any type that has an accessible `GetAwaiter` method. The object returned by the
>   `GetAwaiter` method must implement the
>   `System.Runtime.CompilerServices.ICriticalNotifyCompletion` interface.
> - IAsyncEnumerable<T>, for an async method that returns an *async stream*."
Источник: S1. Уверенность: **высокая**. (Плюс Windows-специфичные типы: `DispatcherOperation`,
UWP `IAsyncAction`/`IAsyncActionWithProgress<TProgress>`/`IAsyncOperation<TResult>`/
`IAsyncOperationWithProgress<TResult,TProgress>` — S1, для полноты, вне ядра урока.)

**F2. `Task` — когда.** Тип `Task` — для async-метода без `return`-операнда (нет значения).
Возврат `Task` позволяет вызывающему `await`-ить метод; при синхронном выполнении такой
метод «returns `void`». У `Task` НЕТ свойства `Result` (нет возвращаемого значения).
> "Async methods that don't contain a `return` statement or that contain a `return`
> statement that doesn't return an operand usually have a return type of Task. ... The Task
> type doesn't include a `Result` property because it has no return value."
Источник: S1. Уверенность: **высокая**.

**F3. `Task<TResult>` — когда, и `Result` блокирует.** `Task<TResult>` — для метода с
`return`, операнд которого имеет тип `TResult`; тип метода — `Task<int>` и т.п. Результат
достаётся через `await`. Свойство `Result` — блокирующее: обращение до завершения задачи
блокирует текущий поток.
> "The Task<TResult> return type is used for an async method that contains a return
> statement in which the operand is `TResult`."
> "The Result property is a blocking property. If you try to access it before its task is
> finished, the thread that's currently active is blocked until the task completes and the
> value is available. In most cases, you should access the value by using `await` instead of
> accessing the property directly."
Источник: S1. Уверенность: **высокая**.

**F4. `void` — ТОЛЬКО обработчики событий.** `void` используется в асинхронных обработчиках
событий (им нужен `void`). Для прочих методов без значения нужно возвращать `Task`, потому
что `async void` НЕЛЬЗЯ await-ить.
> "You use the `void` return type in asynchronous event handlers, which require a `void`
> return type. For methods other than event handlers that don't return a value, you should
> return a Task instead, because an async method that returns `void` can't be awaited. Any
> caller of such a method must continue to completion without waiting for the called async
> method to finish."
Источник: S1. Подтверждение (2-й канал, S4): «Async void methods serve a specific purpose:
top-level event handlers in UI frameworks. Outside of event handlers, always return `Task`
or `Task<T>` from async methods.» Уверенность: **высокая**.

**F5. `async void` — исключения не ловятся вызывающим и роняют приложение.** Вызывающий
`void`-возвращающего async-метода НЕ может поймать выброшенные исключения; такие
необработанные исключения, скорее всего, обрушат приложение. У метода, возвращающего
`Task`/`Task<TResult>`, исключение сохраняется в задаче и перебрасывается при `await`.
> "The caller of a void-returning async method can't catch exceptions thrown from the
> method. Such unhandled exceptions are likely to cause your application to fail. If a
> method that returns a Task or Task<TResult> throws an exception, the exception is stored
> in the returned task. The exception is rethrown when the task is awaited."
Источник: S1. Подтверждение (2-й канал, S4): «Exceptions thrown in an async void method
propagate to the SynchronizationContext that was active when the method started. The caller
can't catch these exceptions.» + «Callers can't track completion.» + «Testing is difficult.»
Уверенность: **высокая**.

**F6. Generalized async return types (task-like типы) — механика.** Async-метод может
вернуть любой тип с доступным `GetAwaiter`, возвращающим *awaiter type*; возвращаемый тип
должен совпадать с типом параметра `SetResult` и типом свойства `Task` у типа, указанного
атрибутом `AsyncMethodBuilderAttribute` (Task type builder pattern). Смысл фичи — вернуть
лёгкий value type вместо reference type и избежать аллокаций в горячих путях.
> "An async method can return any type that has an accessible `GetAwaiter` method that
> returns an instance of an *awaiter type*. In addition, the returned type must match the
> type of the parameter of `SetResult` and returned type of the `Task` property on the type
> specified by the ... AsyncMethodBuilderAttribute attribute."
> "Because Task and Task<TResult> are reference types, memory allocation in
> performance-critical paths, particularly when allocations occur in tight loops, can
> adversely affect performance. Support for generalized return types means that you can
> return a lightweight value type instead of a reference type to avoid more memory
> allocations."
Источник: S1. Уверенность: **высокая**.

**F7. Написание своего task-like типа — advanced, по умолчанию не нужно.** Явно:
> "Writing a generalized async return type is an advanced scenario, and is targeted for use
> in specialized environments. Consider using the `Task`, `Task<T>`, and `ValueTask<T>`
> types instead, which cover most scenarios for asynchronous code."
Также можно применить атрибут `AsyncMethodBuilder` к самому async-методу, чтобы переопределить
builder для типа. Источник: S1. Уверенность: **высокая**.

**F8. `IAsyncEnumerable<T>` — async stream.** Async-метод может вернуть *async stream* —
`IAsyncEnumerable<T>`: способ перечислять элементы, генерируемые порциями через повторные
асинхронные вызовы; потребитель обходит их через `await foreach`.
> "An async method might return an *async stream*, represented by IAsyncEnumerable<T>. An
> async stream provides a way to enumerate items read from a stream when elements are
> generated in chunks with repeated asynchronous calls."
Источник: S1 (метод с `yield return` + `await`). Уверенность: **высокая**.

---

## Находки — S2.5 ValueTask / ValueTask<T> и ограничения

**F9. `ValueTask<TResult>` — это `readonly struct` (value type).** Сигнатура (net-10.0):
`public readonly struct ValueTask<TResult> : IEquatable<ValueTask<TResult>>`, наследует
`System.ValueType`. Описание: «Provides a value type that wraps a `Task<TResult>` and a
`TResult`, only one of which is used.» Non-generic `ValueTask` —
`public readonly struct ValueTask : IEquatable<ValueTask>`, «Provides an awaitable result of
an asynchronous operation.» Оба типа ссылаются на исходник рантайма `ValueTask.cs`
(dotnet/runtime, System.Private.CoreLib). Источник: S2, S3. Уверенность: **высокая**.

**F10. Дефолт async-метода — `Task`/`Task<T>`, НЕ ValueTask.** Прямая рекомендация: по
умолчанию любой async-метод должен возвращать `Task`/`Task<TResult>`; `ValueTask<TResult>`
брать, только если анализ производительности это оправдал.
> "As such, the default choice for any asynchronous method should be to return a Task or
> Task<TResult>. Only if performance analysis proves it worthwhile should a
> ValueTask<TResult> be used instead of a Task<TResult>."
Источник: S2. Подтверждение (2-й канал, S3, для метода без значения): «the default choice
for any asynchronous method that does not return a result should be to return a Task. Only
if performance analysis proves it worthwhile should a `ValueTask` be used instead of a
Task.» Уверенность: **высокая**.

**F11. Когда `ValueTask<T>` оправдан (условие применимости).** Метод может вернуть этот
value type, когда результат вероятно доступен СИНХРОННО и метод вызывается настолько часто,
что стоимость аллокации нового `Task<TResult>` на каждый вызов будет непозволительной.
> "A method may return an instance of this value type when it's likely that the result of
> its operation will be available synchronously, and when it's expected to be invoked so
> frequently that the cost of allocating a new Task<TResult> for each call will be
> prohibitive."
Источник: S2. Уверенность: **высокая**.

**F12. Базовое ограничение: await РОВНО ОДИН РАЗ; `Result` — только после завершения.**
> "A ValueTask<TResult> instance may only be awaited once, and consumers may not read
> Result until the instance has completed. If these limitations are unacceptable, convert
> the ValueTask<TResult> to a Task<TResult> by calling AsTask."
Источник: S2. Аналог для non-generic (S3): «A `ValueTask` instance may only be awaited once,
and consumers may not call `GetAwaiter()` until the instance has completed.» Уверенность:
**высокая**.

**F13. Список запрещённых операций над `ValueTask<T>` (нарушение → undefined behavior).**
> "The following operations should never be performed on a ValueTask<TResult> instance:
> - Awaiting the instance multiple times.
> - Calling AsTask multiple times.
> - Using `.Result` or `.GetAwaiter().GetResult()` when the operation hasn't yet completed,
>   or using them multiple times.
> - Using more than one of these techniques to consume the instance.
> If you do any of the above, the results are undefined."
Источник: S2. Для non-generic `ValueTask` (S3) список короче (нет строки про `.Result`,
т.к. у неё нет результата): «Awaiting the instance multiple times. / Calling AsTask multiple
times. / Using more than one of these techniques to consume the instance. If you do any of
the above, the results are undefined.» Уверенность: **высокая**.

**F14. Трейдофы `ValueTask<T>` против `Task<T>` (не бесплатно).** ValueTask экономит
аллокацию при синхронно доступном результате, НО содержит несколько полей (Task — один
ссылочный field), поэтому возврат ValueTask копирует больше данных; а если await-ить
ValueTask внутри async-метода — стейт-машина этого метода становится больше (хранит struct
с несколькими полями вместо одной ссылки).
> "while a ValueTask<TResult> can help avoid an allocation in the case where the successful
> result is available synchronously, it also contains multiple fields, whereas a
> Task<TResult> as a reference type is a single field. This means that returning a
> ValueTask<TResult> from a method results in copying more data. It also means, that if a
> method that returns a ValueTask<TResult> is awaited within an async method, the state
> machine for that async method will be larger ..."
Источник: S2 (то же для non-generic — S3: «Using a `ValueTask` instead of a `Task`
introduces some overhead ... returning it from the method results in copying more data
compared to returning a single Task reference.»). Уверенность: **высокая**.

**F15. ValueTask вне «потребить через await» — усложняет модель и добавляет аллокации.**
Для сценариев кроме потребления результата через `await` ValueTask ведёт к более
запутанной модели с бОльшим числом аллокаций: чтобы отдать его в `Task.WhenAll`/`WhenAny`,
ValueTask сначала надо конвертировать в `Task<TResult>` через `AsTask`, что даёт аллокацию,
которой не было бы у кэшированного `Task<TResult>`.
> "For uses other than consuming the result of an asynchronous operation using await,
> ValueTask<TResult> can lead to a more convoluted programming model that requires more
> allocations. ... the ValueTask<TResult> must first be converted to a Task<TResult> using
> AsTask, leading to an allocation that would have been avoided if a cached Task<TResult>
> had been used in the first place."
Источник: S2. Уверенность: **высокая**.

**F16. Non-generic `ValueTask` — «не рекомендуется для большинства сценариев».**
> "The non generic version of ValueTask is not recommended for most scenarios."
Для синхронно и успешно завершившегося `Task`-метода отдавать singleton `Task.CompletedTask`
(а не `ValueTask`): «The CompletedTask property should be used to hand back a successfully
completed singleton in the case where a method returning a Task completes synchronously and
successfully.» Источник: S2 (та же формулировка про `Task.CompletedTask` — в S3).
Уверенность: **высокая**.

**F17. `default(ValueTask<T>)` = синхронно успешно завершённая операция.** Экземпляр,
созданный беспараметренным конструктором или `default(ValueTask<TResult>)`
(zero-initialized struct), представляет синхронно и успешно завершённую операцию с
результатом `default(TResult)`.
> "An instance created with the parameterless constructor or by the
> `default(ValueTask<TResult>)` syntax (a zero-initialized structure) represents a
> synchronously, successfully completed operation with a result of `default(TResult)`."
Источник: S2 (для non-generic — то же без результата, S3). Уверенность: **высокая**.

**F18. Версии/языки.** `ValueTask`/`ValueTask<TResult>` поддерживаются начиная с C# 7.0 и
НЕ поддерживаются ни одной версией Visual Basic. Мониторы API — netcore-2.1+ / netstandard-2.1
/ net-5.0…net-11.0 (для `ValueTask<T>` также netcore-1.0+).
> "The use of the ValueTask<TResult> type is supported starting with C# 7.0, and is not
> supported by any version of Visual Basic."
Источник: S2, S3. Уверенность: **высокая**.

---

## Мифы (разоблачение с цитатами)

**M1. «`ValueTask` всегда быстрее `Task` / всегда лучше».** ЛОЖНО. Дефолт — `Task`/`Task<T>`;
`ValueTask` берут ТОЛЬКО когда анализ производительности это доказал (S2, F10). ValueTask —
struct с несколькими полями: возврат копирует больше данных, а стейт-машина await-ящего
метода становится больше (S2, F14). Non-generic `ValueTask` вообще «not recommended for most
scenarios» (S2, F16), а вне «await результата» ValueTask добавляет аллокации через
обязательный `AsTask` (S2, F15). Уверенность: **высокая**.

**M2. «`ValueTask` можно await несколько раз / потреблять повторно».** ЛОЖНО. Экземпляр
можно await-ить РОВНО ОДИН раз (S2/S3, F12). Запрещено: await дважды, `AsTask` дважды,
`.Result`/`.GetAwaiter().GetResult()` до завершения или повторно, комбинировать способы
потребления — иначе поведение UNDEFINED (S2, F13). Нужен повторно используемый результат —
конвертируй в `Task<TResult>` через `AsTask` (S2, F12) или вызови `Preserve()` (метод в
таблице S2/S3). Уверенность: **высокая**.

**M3. «`ValueTask.Result` можно читать сразу, как у `Task`».** ЛОЖНО. Потребители не могут
читать `Result` (generic) / вызывать `GetAwaiter()` (non-generic) ДО завершения экземпляра
(S2/S3, F12); использование `.Result`/`.GetAwaiter().GetResult()` до завершения или повторно
— в списке «should never» с undefined-результатом (S2, F13). (У самого `Task<T>` доступ к
`Result` до завершения — блокирующий, F3; у ValueTask до завершения — undefined.)
Уверенность: **высокая**.

**M4. «`async void` — то же самое, что `async Task`, только имя короче».** ЛОЖНО. `async void`
НЕЛЬЗЯ await-ить (S1, F4; S4: «can't be awaited»); вызывающий не может отследить завершение;
исключения из `async void` НЕ ловятся вызывающим и обрушивают приложение / уходят на
`SynchronizationContext` (S1+S4, F5). У `async Task` исключение сохраняется в задаче и
перебрасывается при `await` (S1, F5). `async void` оправдан ТОЛЬКО как обработчик события
(S1, F4). Уверенность: **высокая**.

**M5. «`async` делает метод фоновым / многопоточным».** ЛОЖНО (2-й канал, S4). `async` лишь
разрешает `await` в теле и оборачивает результат в `Task`; метод выполняется СИНХРОННО до
первого `await` над незавершённым awaitable; без `await` завершается целиком на вызывающем
потоке. Для CPU-bound-работы — `Task.Run`, а не `async`.
> "Adding the `async` keyword to a method doesn't make the method run on a background
> thread. ... When you invoke an async method, it runs synchronously until it reaches the
> first `await` on an incomplete awaitable."
Источник: S4 (ai-assisted, но факт согласуется с механикой из S1). Уверенность: **средняя**
(единственный дословный источник — ai-assisted-страница; механика не противоречит S1).

**M6. «`Task<T>.Result` — безопасный способ получить значение».** ЛОЖНО/опасно. `Result` —
блокирующее свойство (S1, F3); блокировка на async-коде на single-threaded
`SynchronizationContext` даёт DEADLOCK (S4, «Deadlocks from blocking on async code»). Брать
значение через `await`, не через `.Result`/`.Wait()`. Источник: S1 (блокировка) + S4
(deadlock, ai-assisted как иллюстрация). Уверенность: **высокая** (по факту блокировки —
S1, не ai).

---

## Реестр покрытия (закрытый корпус: 2 канонические страницы ТЗ + 2 подтверждающие)

| Единица покрытия | Источник-первооткрыватель | Статус |
|------------------|---------------------------|--------|
| Полный список async return-типов | S1 | покрыто (F1) |
| `Task` — когда, нет `Result` | S1 | покрыто (F2) |
| `Task<TResult>` — когда, `Result` блокирует | S1 | покрыто (F3) |
| `void` — только event handler, нельзя await | S1 (+S4) | покрыто (F4) |
| `async void` — исключения не ловятся, роняют апп | S1 (+S4) | покрыто (F5) |
| Generalized/task-like типы + AsyncMethodBuilder | S1 | покрыто (F6, F7) |
| `IAsyncEnumerable<T>` / async stream | S1 | покрыто (F8) |
| `ValueTask`/`ValueTask<T>` = readonly struct, сигнатура | S2, S3 | покрыто (F9) |
| Дефолт = `Task`/`Task<T>`, ValueTask по анализу | S2, S3 | покрыто, 2 канала (F10) |
| Условие применимости ValueTask (sync + hot path) | S2 | покрыто (F11) |
| await ровно 1 раз, Result только после завершения | S2, S3 | покрыто, 2 канала (F12) |
| Список «should never» + undefined behavior | S2, S3 | покрыто, 2 канала (F13) |
| Трейдофы ValueTask vs Task (копирование, стейт-машина) | S2, S3 | покрыто (F14) |
| ValueTask вне await → AsTask → аллокации | S2 | покрыто (F15) |
| non-generic ValueTask не рекомендуется; CompletedTask | S2, S3 | покрыто (F16) |
| `default(ValueTask<T>)` = sync-completed | S2, S3 | покрыто (F17) |
| Версии/языки (C# 7.0+, не VB) | S2, S3 | покрыто (F18) |
| Миф «ValueTask всегда быстрее» | S2 | покрыто (M1) |
| Миф «await дважды можно» | S2, S3 | покрыто (M2) |
| Миф «Result читаем сразу» | S2, S3 | покрыто (M3) |
| Миф «async void == async Task» | S1, S4 | покрыто (M4) |
| Миф «async == фоновый поток» | S4 | покрыто частично (M5; только ai-канал) |
| Миф «.Result безопасен» | S1, S4 | покрыто (M6) |

Критерий остановки (закрытый корпус): 2 канонические страницы ТЗ (S1, S2) прочитаны
целиком + добраны 2 подтверждающих канала разных типов (S3 non-generic API, S4 .NET
patterns) для независимости ключевых правил → 100% единиц скоупа ТЗ покрыто. Насыщение
открытого корпуса не применяется (корпус закрыт списком страниц из ТЗ).

## Противоречия источников

Противоречий между S1–S4 не выявлено. Различия — только по объёму списка «should never»
между generic `ValueTask<T>` (есть строка про `.Result`) и non-generic `ValueTask` (нет,
т.к. нет результата) — это не конфликт, а следствие наличия/отсутствия `TResult` (F13).

## Что не удалось выяснить / границы

- CLR-механика пула `IValueTaskSource` (как именно рантайм переиспользует backing-объекты
  без аллокаций) на канонических страницах дана лишь тезисно (S3 отсылает к devblog
  «Understanding the Whys, Whats, and Whens of ValueTask» — devblogs, класс C, в отчёт как
  факты НЕ берётся, только как наводка). Для урока достаточно F9–F16.
- M5 («async ≠ фоновый поток») дословно есть только на ai-assisted-странице S4; факт
  согласуется с общей механикой S1, но единственный прямой источник — ai-assisted →
  уверенность «средняя». Если нужен не-ai первоисточник — брать из language-reference
  `async` keyword (в скоуп S2.4–S2.5 не входит, не фетчил).

## Дайджест (≤8 строк)
1. Async return-типы (S1): `Task`, `Task<T>`, `void` (только event handler), task-like типы
   с `GetAwaiter` + `AsyncMethodBuilder`, `IAsyncEnumerable<T>`.
2. `Task` без `Result`; `Task<T>.Result` — блокирующий (брать через `await`).
3. `async void` нельзя await; исключения не ловятся вызывающим и роняют апп (S1+S4).
4. Дефолт async = `Task`/`Task<T>`; `ValueTask<T>` — ТОЛЬКО когда анализ перфа доказал (S2/S3).
5. `ValueTask<T>` — readonly struct; условие: результат часто доступен синхронно + горячий путь.
6. Ограничения: await РОВНО раз; `Result`/`GetResult` только после завершения; иначе UNDEFINED (S2/S3).
7. Мифы разоблачены: «ValueTask всегда быстрее», «await много раз», «async void == async Task».
8. 4 первички класса A (2 канонические ТЗ + 2 подтверждающих канала), дата сбора 2026-07-18.
