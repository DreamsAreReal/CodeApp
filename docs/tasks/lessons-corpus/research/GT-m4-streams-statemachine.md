# GT-m4-streams-statemachine — Ground-truth для S2.6 (TAP изнутри) + S2.9 (async streams) + машинная панель (async стейт-машина)

**Назначение**: авторитетный чек-лист точности для builder-а (что ОБЯЗАНО быть в уроках)
и для evaluator-а на гейте **G7** (trace-to-original: fetch источника → сверка ≥3 ключевых
утверждений; бар «0 утверждений, не подтверждённых источником»). Покрывает три пласта
модуля M4:
- **S2.6** — TAP-контракт изнутри: hot/cold-таски, статусы `Task`, что гарантировано
  потребителю метода.
- **S2.9** — async streams: `IAsyncEnumerable<T>`, `await foreach`, `ConfigureAwait`,
  `[EnumeratorCancellation]`/`WithCancellation`, ленивость.
- **«Уровень ниже»** (сигнатурная машинная панель) — компиляторная async-стейт-машина:
  как `await` превращается в `MoveNext`/поле состояния/`AsyncTaskMethodBuilder`.

**Фаза**: Research (ground-truth для M4 = F9–F11). **Дата сбора**: 2026-07-18.
**Статус**: FROZEN (все утверждения — из прямого fetch страниц; URL+цитата приложены).

---

## Корпус и классы источников

Нормативная база жанра — официальная документация Microsoft Learn и первичка .NET
(класс A): каждая страница датирована, версионируется через публичные репозитории
`dotnet/docs` / `dotnet-api-docs` / `dotnet/runtime` (привязка к git-коммиту в
метаданных страницы), цена подделки высокая.

| # | Источник | URL | Класс | Дата (`ms.date` / `updated_at`) | Покрывает |
|---|---|---|---|---|---|
| S1 | Task-based Asynchronous Pattern (TAP): overview | https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap | A | 2026-04-17 / 2026-04-30 | S2.6: hot/cold, статусы, контракт, cancellation, exceptions |
| S2 | Generate and consume async streams (tutorial) | https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream | A | 2022-11-01 / 2026-03-30 | S2.9: IAsyncEnumerable, await foreach, ConfigureAwait, cancellation |
| S3 | The Task Asynchronous Programming (TAP) model with async/await | https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model | A | 2025-10-13 / 2026-03-30 | машинная панель (control flow), «нет нового потока», return types |
| S4 | Asynchronous programming scenarios | https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios | A | 2025-03-12 / 2026-03-30 | «компилятор трансформирует в стейт-машину», ConfigureAwait, I/O vs CPU |
| S5 | `await` operator (C# reference) | https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await | A | 2026-01-20 / 2026-03-30 | await не блокирует поток; await уже-завершённого; await foreach/using |
| S6 | `async` keyword (C# reference) | https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/async | A | 2026-01-21 / 2026-03-30 | return types; синхронно до первого await |
| S7 | `IAsyncStateMachine` Interface (.NET API) | https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.iasyncstatemachine?view=net-10.0 | A | 2025-07-01 / 2026-05-27 | машинная панель: MoveNext, SetStateMachine, «для компилятора» |
| S8 | Roslyn design doc: task-types (async task-like) | https://github.com/dotnet/roslyn/blob/main/docs/features/task-types.md | A (compiler-design) | — (репо-doc, живой) | контракт method builder-а (Create/Start/SetResult/…) |

**Свежесть**: конвенции языка и семантика TAP/стейт-машины стабильны годами (возраст
страниц несущественен — п.3 правил). Версионные факты (async streams: .NET Standard 2.1 /
.NET Core 3.0) — нормативны, привязаны к релизу.

**Карантин инъекций**: во всём собранном контенте (страницы Learn + Roslyn design doc)
инструкций-манипуляций не обнаружено — чистая техдокументация. Находок «манипуляция
источника» нет.

**PII**: объектов-людей в корпусе нет; предохранитель неприменим.

**Провенанс машинной панели (честно)**: концептуальный факт «компилятор трансформирует
async-метод в стейт-машину» и walkthrough control-flow — покрыты Learn (S3, S4). Контракт
типов стейт-машины (`IAsyncStateMachine.MoveNext`/`SetStateMachine`) — Learn API (S7,
класс A). Контракт method builder-а (`Create`/`Start`/`SetResult`/`SetException`/
`AwaitOnCompleted`/`AwaitUnsafeOnCompleted`/`Task`) — Roslyn design doc (S8, compiler-design,
класс A). **Точное имя генерируемого поля состояния (`<>1__state`) и дословный emit-шаблон
`MoveNext` Learn НЕ публикует** — если урок показывает `<>1__state`/`<>t__builder` как
конкретные имена, помечать источник как **compiler-design/Roslyn convention** (декомпиляция
sharplab.io / ILSpy), НЕ как Learn; это разрешённая иллюстрация, но провенанс честный.
Не удалось довести до первички: см. §7.

---

## S2.6 — TAP-контракт изнутри (hot/cold, статусы Task)

**Первоисточник**: S1.

**Топ-обязательные факты (builder ОБЯЗАН включить; evaluator сверяет ≥3):**

**F1. Hot vs cold — таски из TAP-метода «горячие», их не надо стартовать.**
> «Tasks that are created by the public `Task` constructors are referred to as *cold tasks*,
> because they begin their life cycle in the non-scheduled `Created` state and are scheduled
> only when `Start` is called on these instances. All other tasks begin their life cycle in a
> hot state, which means that the asynchronous operations they represent are already
> initiated… Consumers of a TAP method can safely assume that the returned task is active and
> shouldn't try to call `Start` on any `Task` that is returned from a TAP method. Calling
> `Start` on an active task results in an `InvalidOperationException` exception.» [S1, «Task status»]
Уверенность: высокая.

**F2. Три финальных (completed) статуса.**
> «The `Canceled` state is considered to be a final (completed) state for a task, along with
> the `Faulted` and `RanToCompletion` states. Therefore, if a task is in the `Canceled` state,
> its `IsCompleted` property returns `true`.» [S1, «Cancellation»]
Итог: жизненный цикл через `TaskStatus`; три исхода завершения — RanToCompletion / Faulted /
Canceled; `IsCompleted == true` во всех трёх. Уверенность: высокая.

**F3. TAP = один метод (инициация + завершение), суффикс `Async`, возврат `Task`/`Task<TResult>`.**
> «TAP uses a single method to represent the initiation and completion of an asynchronous
> operation.» … «A TAP method returns either a `System.Threading.Tasks.Task` or a
> `System.Threading.Tasks.Task<TResult>`, based on whether the corresponding synchronous method
> returns void or a type `TResult`.» «Asynchronous methods in TAP include the `Async` suffix…»
> [S1, «Naming, parameters, and return types»]
Уверенность: высокая.

**F4. Метод возвращается быстро; синхронно делает МИНИМУМ (валидация + запуск).**
> «An asynchronous method that is based on TAP can do a small amount of work synchronously,
> such as validating arguments and initiating the asynchronous operation, before it returns the
> resulting task. Keep synchronous work to a minimum so the asynchronous method can return
> quickly.» [S1, «Initiating an asynchronous operation»]. Подтверждение семантики: «An async
> method runs synchronously until it reaches its first `await` expression.» [S6]. Уверенность: высокая.

**F5. Может завершиться СИНХРОННО и вернуть уже-завершённую таску.**
> «In such cases, the operation might complete synchronously, and might return a task that is
> already completed.» [S1, «Initiating an asynchronous operation»]. Симметрично на стороне
> потребителя: «When the `await` operator is applied to the operand that represents an already
> completed operation, it returns the result of the operation immediately without suspension of
> the enclosing method.» [S5]. Уверенность: высокая.

**F6. Исключения — в таске, а не выбрасываются синхронно (кроме usage-ошибок).**
> «An asynchronous method should throw an exception directly from the asynchronous method call
> only in response to a usage error… For all other errors, assign exceptions that occur when an
> asynchronous method is running to the returned task, even if the asynchronous method happens
> to complete synchronously before the task is returned. Typically, a task contains at most one
> exception. However, if the task represents multiple operations (for example, `WhenAll`),
> multiple exceptions might be associated with a single task.» [S1, «Exceptions»]
Уверенность: высокая.

**F7. Cancellation: отмена → статус `Canceled`, результата нет, исключение не бросается;
на await — `OperationCanceledException`.**
> «If the cancellation request results in work ending prematurely, the TAP method returns a task
> that ends in the `Canceled` state; there's no available result and no exception is thrown.» …
> «Any code that is asynchronously waiting for a canceled task through use of language features
> continues to run but receives an `OperationCanceledException` or an exception derived from it.»
> [S1, «Cancellation»]. Тонкость: «The returned task should end in the `Canceled` state only if
> the operation ends as a result of the cancellation request. If cancellation is requested but a
> result or an exception is still produced, the task should end in the `RanToCompletion` or
> `Faulted` state.» [S1]. Уверенность: высокая.

**F8. `async` НЕ форсирует другой поток; enable `await`, синхронно до первого incomplete await.**
> «The `async` keyword doesn't force a method to run asynchronously on another thread. It enables
> `await`, and the method runs synchronously until it reaches an incomplete awaitable. If the
> method doesn't reach an incomplete awaitable, it can complete synchronously.» [S1, «Async
> behavior, return types, and naming»]. Уверенность: высокая.

---

## S2.9 — Async streams (IAsyncEnumerable / await foreach / cancellation / ConfigureAwait)

**Первоисточник**: S2 (плюс S5 для await foreach).

**F9. Async-стрим = метод с ТРЕМЯ признаками: `async`-модификатор, `yield return`, возврат
`IAsyncEnumerable<T>`.**
> «The code that generates the sequence can now use `yield return` to return elements in a method
> that was declared with the `async` modifier. You can consume an async stream using an
> `await foreach` loop just as you consume any sequence using a `foreach` loop.» [S2, «Async
> streams provide a better way»]. Сигнатура из туториала:
> `private static async IAsyncEnumerable<JToken> RunPagedQueryAsync(...)` [S2, «Convert to async
> streams»]. Уверенность: высокая.

**F10. Три новых интерфейса; появились в .NET Standard 2.1 / реализованы в .NET Core 3.0.**
> «These new language features depend on three new interfaces added to .NET Standard 2.1 and
> implemented in .NET Core 3.0: `System.Collections.Generic.IAsyncEnumerable<T>`;
> `System.Collections.Generic.IAsyncEnumerator<T>`; `System.IAsyncDisposable`.» [S2] Аналоги
> синхронных `IEnumerable<T>`/`IEnumerator<T>`/`IDisposable`. Уверенность: высокая.

**F11. `await foreach` десугарится в `GetAsyncEnumerator` + `while(await MoveNextAsync())` +
`await DisposeAsync()` в `finally`.**
> «The new interface `IAsyncEnumerator<T>` derives from `IAsyncDisposable`. That means the
> preceding loop will asynchronously dispose the stream when the loop finishes. You can imagine
> the loop looks like the following code:» —
> ```csharp
> var enumerator = RunPagedQueryAsync(...).GetAsyncEnumerator();
> try {
>     while (await enumerator.MoveNextAsync()) {
>         var issue = enumerator.Current;
>         ...
>     }
> } finally {
>     if (enumerator != null)
>         await enumerator.DisposeAsync();
> }
> ``` [S2, «Convert to async streams»]. `await foreach` — язык-конструкция для потребления
> async-стрима [S5, «Asynchronous streams and disposables»]. Уверенность: высокая.

**F12. Ленивость / on-demand: элементы отдаются по мере готовности, не буферизуются целиком.**
> В стартовом (не-стрим) варианте: «`RunPagedQueryAsync` must allocate storage for all the issues
> returned… retrieving all open issues would require much more memory to store all the retrieved
> issues.» [S2, «Examine the implementation»]. После перехода на стрим: «The first page of results
> is enumerated as soon as it's available… You no longer need to allocate a collection to store
> all the results before they're enumerated. The caller can determine how to consume the results
> and if a storage collection is needed.» [S2, «Run the finished application»]. И: «Async streams
> can also read from "never ending streams" like a stock ticker, or sensor device. The call to
> `MoveNextAsync` returns the next item as soon as it's available.» [S2]. Уверенность: высокая.

**F13. `ValueTask` в интерфейсах async-стрима — ради перфа (меньше аллокаций).**
> «One type that may be unfamiliar is `System.Threading.Tasks.ValueTask`. The `ValueTask` struct
> provides a similar API to the `System.Threading.Tasks.Task` class. `ValueTask` is used in these
> interfaces for performance reasons.» [S2]. (`MoveNextAsync()` возвращает `ValueTask<bool>`.)
> Уверенность: высокая.

**F14. Cancellation: `[EnumeratorCancellation]` на параметре + `WithCancellation` при потреблении.**
> «Async streams support cancellation using the same protocol as other `async` methods.»
> Сигнатура генератора: `..., [EnumeratorCancellation] CancellationToken cancellationToken = default)`.
> «The `EnumeratorCancellationAttribute` attribute causes the compiler to generate code for the
> `IAsyncEnumerator<T>` that makes the token passed to `GetAsyncEnumerator` visible to the body of
> the async iterator as that argument.» Потребление: `await foreach (var issue in Run...(...)
> .WithCancellation(cancellation.Token))`. [S2, «Convert to async streams»]. Уверенность: высокая.

**F15. `ConfigureAwait` на потоке: по умолчанию элементы обрабатываются в захваченном контексте;
отключается `ConfigureAwait` (расширение `TaskAsyncEnumerableExtensions.ConfigureAwait`).**
> «By default, stream elements are processed in the captured context. If you want to disable
> capturing of the context, use the `TaskAsyncEnumerableExtensions.ConfigureAwait` extension
> method.» [S2, «Convert to async streams»]. (Т.е. `await foreach (var x in src.ConfigureAwait(false))`
> — это расширение НАД `IAsyncEnumerable<T>`, а не `Task.ConfigureAwait`.) Уверенность: высокая.

**F16. Async-стрим решает то, что `Task<IEnumerable<T>>` не может — не надо ждать ВСЮ коллекцию.**
Контраст стартового и финального приложения: в стартовом «the issues are displayed only after all
10 pages have been retrieved» [S2, «Run the starter application»]; после стрима «The first page of
results is enumerated as soon as it's available» [S2, «Run the finished application»]. Т.е.
`Task<IEnumerable<T>>` завершается только когда собран ВЕСЬ список; `IAsyncEnumerable<T>` отдаёт
поэлементно и лениво. Уверенность: высокая (следует из прямого контраста двух прогонов в источнике).

---

## Машинная панель — компиляторная async-стейт-машина (сигнатурный «уровень ниже»)

**Первоисточники**: S3, S4 (концепт + control flow, Learn); S7 (контракт `IAsyncStateMachine`,
Learn API); S8 (контракт method builder-а, Roslyn design). См. §«Провенанс машинной панели».

**F17. Компилятор трансформирует async-метод в СТЕЙТ-МАШИНУ (это — суть «уровня ниже»).**
> «When you implement asynchronous programming in your C# code, the compiler transforms your
> program into a state machine. This construct tracks various operations and state in your code,
> such as yielding execution when the code reaches an `await` expression, and resuming execution
> when a background job completes.» [S4, «Review underlying concepts»]. Подтверждение: «The compiler
> does the difficult work that the developer used to do, and your application retains a logical
> structure that resembles synchronous code.» [S3]. Уверенность: высокая (концепт из Learn).

**F18. `await` = точка приостановки: контроль возвращается вызывающему, метод возобновляется позже
в ТОМ ЖЕ методе (continuation), стек не разматывается по-настоящему.**
> «The `await` operator suspends evaluation of the enclosing async method until the asynchronous
> operation represented by its operand completes… When the `await` operator suspends the enclosing
> async method, the control returns to the caller of the method.» [S5]. Walkthrough шагов 3/6/7 [S3,
> «What happens in an async method»]: на await метод «returns a `Task<int>` to the caller» (шаг 6),
> а по завершении «the string result is stored in the task… The await operator retrieves the result»
> (шаг 7) — то есть возобновление продолжает тот же метод с сохранённого состояния. Тонкость:
> «The suspension of an async method at an `await` expression doesn't constitute an exit from the
> method, and `finally` blocks don't run.» [S3, «Async and await»]. Уверенность: высокая (control-flow
> из Learn); связка с `MoveNext` — F19/F20.

**F19. Тип стейт-машины реализует `IAsyncStateMachine`; ключевой метод — `MoveNext()` («двигает
машину в следующее состояние»); машина — «для компилятора».**
> `IAsyncStateMachine`: «Represents state machines that are generated for asynchronous methods.
> This type is intended for compiler use only.» Методы: `MoveNext()` — «Moves the state machine to
> its next state.»; `SetStateMachine(IAsyncStateMachine)` — «Configures the state machine with a
> heap-allocated replica.» [S7]. Интерпретация: каждое возобновление после await = очередной вызов
> `MoveNext`, который по полю состояния прыгает к нужной точке кода. `SetStateMachine` +
> «heap-allocated replica» = стейт-машина, объявленная компилятором как `struct`, при первом
> реальном await боксится/копируется в кучу (чтобы пережить приостановку). Уверенность: высокая
> (контракт из Learn API); «поле состояния как `int` с именем `<>1__state`» — см. F21 (провенанс
> Roslyn/декомпиляция, НЕ Learn).

**F20. Контракт method builder-а (`AsyncTaskMethodBuilder` для `Task`; для task-like типов —
кастомный): компилятор эмитит вызовы `Create`/`Start`/`SetResult`/`SetException`/`AwaitOnCompleted`/
`AwaitUnsafeOnCompleted` и возвращает `builder.Task`.**
Из Roslyn design doc, требуемые public-члены билдера:
> `static MyTaskMethodBuilder<T> Create()`; `void Start<TStateMachine>(ref TStateMachine stateMachine)`;
> `void SetStateMachine(IAsyncStateMachine stateMachine)`; `void SetException(Exception exception)`;
> `void SetResult(T result)`; `void AwaitOnCompleted<TAwaiter, TStateMachine>(ref TAwaiter awaiter,
> ref TStateMachine stateMachine)`; `void AwaitUnsafeOnCompleted<TAwaiter, TStateMachine>(...)`;
> `MyTask<T> Task { get; }`. [S8]. Порядок вызовов компилятора: `Builder.Create()` → (`SetStateMachine`
> для struct) → `builder.Start(ref stateMachine)` → метод возвращает `builder.Task`; по завершении
> `builder.SetResult()` или `builder.SetException(exception)`; на await — `AwaitOnCompleted()`/
> `AwaitUnsafeOnCompleted()`. [S8]. Механика возобновления (из search-снапшота Roslyn AsyncRewriter,
> подтверждает: `AwaitUnsafeOnCompleted` регистрирует продолжение, вызывающее `stateMachine.MoveNext()`
> по готовности awaiter-а). Уверенность: высокая для контракта билдера (Roslyn design doc, класс A);
> точный emit-скелет `MoveNext` с `try/catch` — Roslyn source/декомпиляция (§7).

**F21. Поле состояния — целочисленное; стартовое значение сигнализирует «не начато», значения ≥0
кодируют точку возобновления по await-ам.** Провенанс: **compiler-design/Roslyn convention +
декомпиляция** (sharplab.io / ILSpy показывают поле `<>1__state` типа `int` и `<>t__builder`), НЕ
Learn. Learn подтверждает лишь наличие «состояния», которое машина отслеживает и «двигает» через
`MoveNext` [F17, F19]. **Если урок печатает конкретные имена `<>1__state`/`<>t__builder` — источник
маркировать как «Roslyn-generated / декомпиляция», уверенность «средняя», как иллюстрацию, а не как
Learn-факт.** Уверенность самого факта (поле состояния существует и кодирует прогресс): высокая;
имя — средняя (провенанс — соглашение генератора).

**F22. `async` НЕ создаёт поток; метод работает на текущем контексте синхронизации и занимает поток
только когда активен (главный анти-миф машинной панели).**
> «The `async` and `await` keywords don't cause extra threads to be created. Async methods don't
> require multithreading because an async method doesn't run on its own thread. The method runs on
> the current synchronization context and uses time on the thread only when the method is active.
> You can use `Task.Run` to move CPU-bound work to a background thread, but a background thread
> doesn't help with a process that's just waiting for results to become available.» [S3, «Threads»].
> И: «An `await` expression in an async method doesn't block the current thread while the awaited
> task is running. Instead, the expression signs up the rest of the method as a continuation and
> returns control to the caller.» [S3]. Уверенность: высокая.

---

## Мифы (уроки НЕ должны содержать; для контраст-пар «мисконцепция vs истина»)

**M1. «Каждый `await` запускает новый поток / async = многопоточность».** НЕВЕРНО.
Опровержение — F22: «don't cause extra threads to be created… an async method doesn't run on its own
thread» [S3]; «`await` operator doesn't block the thread that evaluates the async method» [S5]. Для
I/O нет потока вообще на время ожидания; поток берётся из пула лишь для CPU-bound через `Task.Run` [S4].

**M2. «Async-стрим буферизует всю последовательность, прежде чем отдать».** НЕВЕРНО.
Опровержение — F12/F16: элементы отдаются on-demand, «enumerated as soon as it's available», можно
читать «never ending streams»; ленивость — суть отличия от `Task<IEnumerable<T>>` [S2].

**M3. «Таску из async-метода / TAP-метода надо стартовать (`Start()`)».** НЕВЕРНО.
Опровержение — F1: TAP-таски горячие; `Start()` на активной таске → `InvalidOperationException` [S1].

**M4. «Отменённая операция бросает исключение из самого метода».** НЕВЕРНО (частично).
Опровержение — F7: таска завершается в статусе `Canceled`, «no exception is thrown»; исключение
(`OperationCanceledException`) получает лишь тот, кто её await-ит [S1].

**M5. «Исключение из async-метода вылетает синхронно на месте вызова».** НЕВЕРНО (кроме usage-ошибок).
Опровержение — F6: ошибки складываются В таску и всплывают на `await`; синхронно бросаются только
usage-ошибки (напр. `ArgumentNullException`) [S1].

**M6. «`await` разматывает стек / это `return`, и `finally` отрабатывает при приостановке».** НЕВЕРНО.
Опровержение — F18: «suspension… doesn't constitute an exit from the method, and `finally` blocks
don't run» [S3]; приостановка — регистрация continuation, не выход.

**M7. «`await foreach` — это просто синхронный `foreach` над `Task`-ами / нужен `Task<IEnumerable>`».**
НЕВЕРНО. Опровержение — F11/F16: десугарится в `GetAsyncEnumerator`+`MoveNextAsync`+`DisposeAsync`;
`Task<IEnumerable<T>>` ждёт всю коллекцию, `IAsyncEnumerable<T>` — поэлементно [S2].

**M8. «`ConfigureAwait(false)` для async-стрима — это `Task.ConfigureAwait`».** НЕВЕРНО (нюанс).
Опровержение — F15: для стрима используется расширение `TaskAsyncEnumerableExtensions.ConfigureAwait`
над `IAsyncEnumerable<T>`, применяемое к операнду `await foreach` [S2].

**M9. «async-метод, помеченный `async`, обязательно исполняется асинхронно/на другом потоке».**
НЕВЕРНО. Опровержение — F8/F5: без incomplete awaitable метод завершается СИНХРОННО и может вернуть
уже-завершённую таску [S1, S6]; без `await` вовсе — исполняется как синхронный + warning [S3, S6].

---

## Реестр покрытия (закрытый корпус вопросов промпта)

| Единица вопроса | Покрыто | Факты | Источник(и) |
|---|---|---|---|
| S2.6 TAP изнутри: hot/cold | да | F1, M3 | S1 |
| S2.6 статусы Task (Created/RanToCompletion/Faulted/Canceled, IsCompleted) | да | F2, F7 | S1 |
| S2.6 контракт (суффикс Async, single Task, быстрый возврат, exceptions) | да | F3, F4, F5, F6 | S1, S5, S6 |
| S2.9 IAsyncEnumerable + три интерфейса + версии | да | F9, F10 | S2 |
| S2.9 await foreach (десугар + семантика) | да | F11 | S2, S5 |
| S2.9 ConfigureAwait на потоке | да | F15, M8 | S2 |
| S2.9 ленивость / не буферизует | да | F12, F16, M2 | S2 |
| S2.9 cancellation ([EnumeratorCancellation]/WithCancellation) | да | F14 | S2 |
| Машинная панель: концепт стейт-машины | да | F17 | S3, S4 |
| Машинная панель: await→MoveNext/state | да (Learn-контракт) | F18, F19 | S3, S5, S7 |
| Машинная панель: method builder | да (Roslyn design) | F20 | S8 |
| Машинная панель: имя поля `<>1__state` | частично (провенанс Roslyn/декомп, НЕ Learn) | F21 | §7 |
| Мифы | да | M1–M9 | S1–S5 |

**Критерий остановки (закрытый корпус)**: 100% единиц вопроса промпта закрыты ≥1 источником
класса A. Достигнуто (единственная частичность — точное имя поля состояния, §7). Целевой объём
12–18 утверждений — выполнено: **22 факта (F1–F22) + 9 мифов (M1–M9)**.

---

## Противоречия источников

Прямых противоречий между источниками не обнаружено — все страницы Learn согласованы и ссылаются
друг на друга (S3↔S5↔S6 взаимно линкуются; S2 ссылается на S-consuming-TAP по ConfigureAwait).
Единственная напряжённость — не противоречие, а разграничение ответственности источников:
концептуальный слой стейт-машины (Learn, S3/S4/S7) намеренно НЕ раскрывает emit-детали
(`<>1__state`, скелет `MoveNext` с `try/catch`) — они живут в Roslyn source / декомпиляции (S8 +
инструменты). Это ожидаемо и зафиксировано в провенансе.

---

## §7 — Что не удалось довести до первички

1. **Дословный emit-шаблон `MoveNext` (с `try/catch` → `SetException`/`SetResult`)** и **точные
   имена генерируемых полей `<>1__state` / `<>t__builder`**. Learn (S3/S4/S7) даёт контракт и
   поведение, но НЕ печатает сгенерированный исходник. Roslyn design doc (S8) описывает контракт
   билдера и порядок вызовов, но, по факту fetch, **не содержит дословного code-блока** шаблона.
   → Для урока: имена/скелет брать из декомпиляции (**sharplab.io** — «C# → IL/decompiled» —
   первичный воспроизводимый артефакт; или ILSpy/dnSpy), помечая канал как «Roslyn-generated,
   декомпиляция», уверенность «средняя». Рекомендация builder-у: приложить СПАЙК — прогнать
   минимальный async-метод через sharplab и вставить реальный декомпилированный `MoveNext` как
   артефакт машинной панели (цена подделки высокая, воспроизводимо). Это закрывает пробел эмпирикой,
   не полагаясь на память модели.
2. **Полный emit-контракт async-ИТЕРАТОРА** (`AsyncIteratorMethodBuilder`, `[AsyncIteratorStateMachine]`,
   как `yield return` внутри `async IAsyncEnumerable` комбинирует стейт-машину итератора и async).
   S2 покрывает поведение и `[EnumeratorCancellation]`, но не сам генерируемый билдер итератора.
   Пересекается с F17 (модуль M6, S18.4 «IAsyncEnumerable-стейт-машина» по features.md) — там
   добрать `AsyncIteratorMethodBuilder` из dotnet/runtime source при авторинге S18.

---

## Рекомендация builder-у (структура уроков M4)

- **S2.6** строить вокруг F1–F8 + контраст-пар M3/M4/M5/M9. Ставка «машинной панели» урока — таблица
  `TaskStatus` (Created→WaitingForActivation/Running→{RanToCompletion|Faulted|Canceled}) с
  `IsCompleted/IsFaulted/IsCanceled` (F2, F7). exec-карточка: метод, возвращающий уже-завершённую
  таску (F5), с реальным stdout.
- **S2.9** строить вокруг F9–F16 + M2/M7/M8. exec-карточка: async-генератор `yield return` +
  `await foreach`, печатающий элементы «по мере готовности» (демонстрация лени, F12). Обязательно
  показать десугар `await foreach` (F11) как «уровень ниже».
- **Машинная панель (сигнатурный «уровень ниже»)**: F17–F22 + M1/M6. КЛЮЧЕВОЕ — приложить
  декомпилированный `MoveNext` (спайк sharplab, §7.1), НЕ рисовать из памяти. Анти-миф M1 («каждый
  await = новый поток») — центральный контраст урока, опора на дословную цитату S3 «don't cause
  extra threads to be created».
- Все exec-карточки — с реальным stdout через G-EXEC (`/api/authoring/run-csharp`, см. RS-baseline §0.3).
- G7-сверка evaluator-ом: для любого урока выборки fetch соответствующего S1/S2/S3 → ≥3 факта
  присутствуют и сформулированы верно → ни одного мифа M1–M9 в тексте.

---

**Источники (все fetched 2026-07-18):**
- S1: https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap
- S2: https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream
- S3: https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model
- S4: https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios
- S5: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await
- S6: https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/async
- S7: https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.iasyncstatemachine
- S8: https://github.com/dotnet/roslyn/blob/main/docs/features/task-types.md
