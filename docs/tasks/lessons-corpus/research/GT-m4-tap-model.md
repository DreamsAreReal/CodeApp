# GT-m4: TAP-модель (async/await, WhenAll/WhenAny, I/O-bound vs CPU-bound) — проверяемые факты (Microsoft Learn)

**Тема (для сверки уроков S2.1–S2.3)**: модель TAP (task-asynchronous programming), обзор async/await, композиция задач (WhenAll/WhenAny), различие I/O-bound vs CPU-bound (когда `Task.Run`, когда нет).
**Дата сбора**: 2026-07-18.
**Корпус**: нормативная база — официальная документация Microsoft Learn (действующая редакция страниц `dotnet/csharp/asynchronous-programming/...`). Это первичный источник семантики языка/рантайма от вендора (класс A по иерархии провенанса).
**Метод**: `WebFetch` полных страниц Learn (en). Все цитаты дословные (en), из зафиксированных редакций (`ms.date` / `updated_at` указаны у каждого источника).
**Оговорка (п.3b, инструменты)**: MCP-инструменты Microsoft Learn (`microsoft_docs_search` / `microsoft_docs_fetch`) в этой сессии в списке доступных tools отсутствуют — задача просила «ToolSearch query select:...». Вместо них использован `WebFetch` тех же самых канонических URL Learn, указанных в ТЗ. Корпус ИДЕНТИЧЕН нормативному (те же страницы Learn, en), деградации корпуса нет; отличается только транспорт извлечения. Помечаю как отклонение от буквы инструмента, но не по существу источника.
**PII**: объектов-людей нет.

## Источники (все проверены fetch 2026-07-18)

- **S1** The Task Asynchronous Programming (TAP) model with async and await (C#) — https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model (ms.date 2025-10-13; updated_at 2026-03-30; git_commit 156931b)
- **S2** Asynchronous programming (обзор, breakfast-аналогия) — https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/ (ms.date 2025-03-10; updated_at 2026-03-30; git_commit 156931b)
- **S3** Asynchronous programming scenarios (I/O-bound vs CPU-bound, WhenAll/WhenAny) — https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios (ms.date 2025-03-12; updated_at 2026-03-30; git_commit 156931b)

Природа фактов: семантика языка/рантайма и конвенции TAP — стабильны годами (п.3, конвенции жанра стабильны). Возраст страниц несущественен для семантики. Все три страницы — из одного репозитория `dotnet/docs` (один git_commit), поэтому это ОДИН издатель-первоисточник; независимость «по каналам» здесь ограничена (см. §6 «Ограничение независимости»). Для нормативной семантики языка первичка вендора самодостаточна (SAFETY-флаг не выставлен: тема техническая, не мед/юр/фин).

---

## Проверяемые утверждения (факт → источник → цитата → уверенность)

### Что такое TAP-модель и async-метод

**F1.** TAP-модель даёт слой абстракции: код пишется как последовательность операторов, но исполняется в более сложном порядке — по мере готовности внешних ресурсов и завершения задач. Компилятор выполняет множество преобразований. Источник: S2.
> «The [Task asynchronous programming (TAP) model] provides a layer of abstraction over typical asynchronous coding. In this model, you write code as a sequence of statements, the same as usual. […] The goal of task asynchronous programming is to enable code that reads like a sequence of statements, but executes in a more complicated order. Execution is based on external resource allocation and when tasks complete.»
Уверенность: высокая.

**F2.** Ключевые слова `async` и `await` — сердце асинхронного программирования; компилятор делает трудную работу, а структура кода остаётся похожей на синхронную. Источник: S1.
> «The [async] and [await] keywords in C# are the heart of async programming.» / «The compiler does the difficult work that the developer used to do, and your application retains a logical structure that resembles synchronous code.»
Уверенность: высокая.

**F3.** Признаки async-метода: сигнатура содержит модификатор `async`; имя по конвенции оканчивается на «Async»; возвращаемый тип — `Task<TResult>` (если есть `return` с операндом типа `TResult`), `Task` (если нет `return` или `return` без операнда), `void` (для async-обработчика событий) либо любой другой тип с методом `GetAwaiter`. Обычно есть хотя бы одно `await`-выражение. Источник: S1.
> «The method signature includes an `async` modifier.» / «The name of an async method, by convention, ends with an "Async" suffix.» / «`Task<TResult>` […] if your method has a return statement in which the operand has type `TResult`. […] `Task` […] if your method has no return statement or has a return statement with no operand. […] `void` if you're writing an async event handler. […] Any other type that has a `GetAwaiter` method.»
Уверенность: высокая.

**F4.** Компилятор превращает async-программу в конечный автомат (state machine): он отслеживает состояние, уступает исполнение на `await` и возобновляет при завершении фоновой работы. По теории CS это реализация «Promise model of asynchrony». Источник: S3.
> «When you implement asynchronous programming in your C# code, the compiler transforms your program into a state machine. This construct tracks various operations and state in your code, such as yielding execution when the code reaches an `await` expression, and resuming execution when a background job completes.» / «asynchronous programming is an implementation of the Promise model of asynchrony.»
Уверенность: высокая.

### Что делает `await` (поток управления)

**F5.** `await` — точка приостановки: async-метод не может продолжиться до завершения ожидаемой операции; в это время управление возвращается вызывающему. Приостановка на `await` НЕ является выходом из метода, и блоки `finally` при этом НЕ выполняются. Источники: S1, S3.
> S1: «The `await` operator tells the compiler that the async method can't continue past that point until the awaited asynchronous process is complete. In the meantime, control returns to the caller of the async method.» / «The suspension of an async method at an `await` expression doesn't constitute an exit from the method, and `finally` blocks don't run.»
> S3: «When you apply the `await` keyword, the code suspends the calling method and yields control back to its caller until the task completes.»
Уверенность: высокая.

**F6.** `await` можно использовать ТОЛЬКО внутри async-метода. Источник: S3.
> «You can only use the `await` expression in an asynchronous method.»
Уверенность: высокая.

**F7.** Задача (`Task` / `Task<TResult>`) инкапсулирует состояние асинхронного процесса и в итоге либо финальный результат, либо исключение, если процесс не удался. Синхронный метод возвращает управление по завершении работы; async-метод возвращает задачу в момент приостановки, а результат кладётся в задачу позже. Источник: S1.
> «A task encapsulates information about the state of the asynchronous process and, eventually, either the final result from the process or the exception that the process raises if it doesn't succeed.» / «A synchronous method returns when its work is complete […], but an async method returns a task value when its work is suspended. When the async method eventually completes its work, the task is marked as completed and the result, if any, is stored in the task.»
Уверенность: высокая.

### Композиция: старт задач, WhenAll, WhenAny

**F8.** Композиция независимых задач: сначала СТАРТУЙ задачи (сохранив `Task`-объекты), а `await` применяй только тогда, когда нужен результат — тогда задачи идут конкурентно и общее время сокращается. Источник: S2.
> «For most operations, you want to start several independent tasks immediately.» / «The first step is to store the tasks for operations when they start, rather than using the `await` expression» / «The total cook time is reduced because some tasks run concurrently.»
Уверенность: высокая.
Примечание (S2): просто пометить методы `async` и добавить `await` подряд НЕ ускоряет — «The code processes the tasks in roughly the same amount of time as the initial synchronous version» (пока `await` стоит сразу после старта каждой задачи). Ускорение даёт именно перенос `await` к точке, где результат нужен.

**F9.** «Если любая часть операции асинхронна — вся операция асинхронна.» Композиция асинхронной операции с последующей синхронной работой остаётся асинхронной. Источник: S2 (callout **Important**).
> «Important: The composition of an asynchronous operation followed by synchronous work is an asynchronous operation. Stated another way, if any portion of an operation is asynchronous, the entire operation is asynchronous.»
Уверенность: высокая.

**F10.** `Task.WhenAll` возвращает `Task`, который завершается, когда завершены ВСЕ задачи из списка аргументов. Источник: S2.
> «One API is the [WhenAll] method, which returns a [Task] object that completes when all the tasks in its argument list are complete.»
Уверенность: высокая.

**F11.** `Task.WhenAny` возвращает `Task<Task>`, который завершается, когда завершается ЛЮБОЙ из аргументов. Возвращённая обёртка содержит завершившуюся задачу; чтобы получить её результат/исключение, нужно дополнительно `await` уже этой завершившейся задачи (`await finishedTask`). Источник: S2.
> «[…] the [WhenAny] method, which returns a `Task<Task>` object that completes when any of its arguments complete.» / «`Task.WhenAny` returns a `Task<Task>` - a wrapper task that contains the completed task. […] to retrieve that task's result or ensure any exceptions are properly thrown, you must `await` the completed task itself (stored in `finishedTask`).»
Уверенность: высокая.

**F12.** Паттерн «обработка по мере завершения»: цикл `while` с `await Task.WhenAny(list)`, затем удаление завершившейся задачи из списка (используй `ToList()`, а не `ToArray()`, чтобы поддержать `Remove`). Для `Task.WhenAll` подходит `ToArray()`. Источник: S3.
> «Use `ToArray()` when you plan to process all tasks together, such as with `Task.WhenAll`. […] Use `ToList()` when you need to dynamically manage tasks, such as with `Task.WhenAny` where you might remove completed tasks from the collection as they finish.»
Уверенность: высокая.

**F13.** Замена блокирующих API на неблокирующие `await`-эквиваленты (таблица S3): `Task.Wait`/`Task.Result` → `await`; `Task.WaitAny` → `await Task.WhenAny`; `Task.WaitAll` → `await Task.WhenAll`; `Thread.Sleep` → `await Task.Delay`. Блокирующее ожидание задачи может привести к дедлокам. Источник: S3.
> «Blocking the current thread as a means to wait synchronously for a `Task` item to complete can result in deadlocks and blocked context threads.»
Уверенность: высокая.

**F14.** Исключения в задачах: упавшая задача — «faulted», исключение хранится в `Task.Exception` (тип `AggregateException`, т.к. исключений может быть несколько). При `await` faulted-задачи перебрасывается ПЕРВОЕ из `InnerExceptions` (поэтому наружу видно, напр., `InvalidOperationException`, а не `AggregateException`). Источник: S2.
> «When a task that runs asynchronously throws an exception, that task is **faulted**. The `Task` object holds the exception thrown in the [Task.Exception] property.» / «The [Task.Exception] property is a [System.AggregateException] object because more than one exception might be thrown during asynchronous work.» / «When your code waits on a faulted task, it rethrows the first [AggregateException.InnerExceptions] exception in the collection.»
Уверенность: высокая.
Примечание (S2, Tip): исключения валидации аргументов рекомендуется выбрасывать СИНХРОННО из task-возвращающих методов.

### I/O-bound vs CPU-bound (когда `Task.Run`, когда нет)

**F15.** Внутри async-метода: **I/O-bound** код запускает операцию, представленную `Task`/`Task<T>`, ВНУТРИ async-метода (без `Task.Run`); **CPU-bound** код запускает операцию на фоновом потоке через `Task.Run`. Источник: S3.
> «I/O-bound code starts an operation represented by a `Task` or `Task<T>` object within the `async` method.» / «CPU-bound code starts an operation on a background thread with the [Task.Run] method.»
Уверенность: высокая.

**F16.** Решающая таблица (S3): вопрос «код ждёт результат/действие, напр. данные из БД?» → **I/O-bound** → использовать `async`/`await` БЕЗ `Task.Run`, избегать TPL. Вопрос «код делает дорогое вычисление?» → **CPU-bound** → `async`/`await`, но вынести работу на другой поток через `Task.Run`; при пригодности к параллелизму рассмотреть TPL. Источник: S3.
> «Should the code wait for a result or action, such as data from a database? → I/O-bound → Use the `async` modifier and `await` expression *without* the `Task.Run` method. Avoid using the Task Parallel Library.»
> «Should the code run an expensive computation? → CPU-bound → Use the `async` modifier and `await` expression, but spawn off the work on another thread with the `Task.Run` method.»
Уверенность: высокая.

**F17.** Всегда измеряй. CPU-bound работа может оказаться недостаточно дорогой по сравнению с накладными расходами на переключение контекста при многопоточности. У каждого выбора — компромиссы. Источник: S3.
> «Always measure the execution of your code. You might discover that your CPU-bound work isn't costly enough compared with the overhead of context switches when multithreading. Every choice has tradeoffs.»
Уверенность: высокая.

**F18.** `ValueTask`/`ValueTask<T>` — вариант для «горячих» путей: `Task` — ссылочный тип, аллоцируется в куче; если async-метод часто завершается синхронно или возвращает кэшированный результат (особенно в тесных циклах), лишние аллокации накапливаются в дорогое время. Источник: S3.
> «Because `Task` is a reference type, a `Task` object is allocated from the heap. If a method declared with the `async` modifier returns a cached result or completes synchronously, the extra allocations can accrue significant time costs in performance critical sections of code.»
Уверенность: высокая.

---

## Мифы и точные опровержения (ОБЯЗАТЕЛЬНЫЙ раздел)

Каждый миф → дословная цитата-опровержение из первички.

**M1. «async делает код параллельным».** НЕВЕРНО. Асинхронность ≠ параллелизм; один поток может вести все задачи, начиная следующую до завершения предыдущей. Параллелизм требует нескольких потоков/исполнителей. Источник: S2.
> «Cooking breakfast is a good example of asynchronous work that isn't parallel. One person (or thread) can handle all the tasks. One person can make breakfast asynchronously by starting the next task before the previous task completes.» / «For a parallel algorithm, you need multiple people who cook (or multiple threads).»
Дополнение (F8): и даже конкурентности не будет, если `await` стоит сразу после старта каждой задачи — тогда время как у синхронного варианта.

**M2. «await создаёт поток» / «async требует многопоточности».** НЕВЕРНО. `async`/`await` НЕ создают дополнительных потоков; async-метод не выполняется на собственном потоке; `await` не блокирует текущий поток. Источник: S1.
> «The `async` and `await` keywords don't cause extra threads to be created. Async methods don't require multithreading because an async method doesn't run on its own thread. The method runs on the current synchronization context and uses time on the thread only when the method is active.»
> «An `await` expression in an async method doesn't block the current thread while the awaited task is running. Instead, the expression signs up the rest of the method as a continuation and returns control to the caller of the async method.»

**M3. «Task.Run ускоряет I/O».** НЕВЕРНО. `Task.Run` переносит CPU-bound работу на фоновый поток, но фоновый поток НЕ помогает процессу, который просто ждёт результата (I/O). Для I/O-bound — `await` без `Task.Run`. Источники: S1, S3.
> S1: «You can use [Task.Run] to move CPU-bound work to a background thread, but a background thread doesn't help with a process that's just waiting for results to become available.»
> S3 (таблица): I/O-bound → «Use the `async` modifier and `await` expression *without* the `Task.Run` method.»

**M4. «async void нормально для не-обработчиков».** НЕВЕРНО. `async void` — только для обработчиков событий. Прочие `async void` не следуют модели TAP и опасны: их нельзя `await`; вызывающий не может поймать их исключения; их трудно тестировать; они дают побочные эффекты, если вызывающий не ждёт асинхронности. Источники: S1, S3.
> S1: «An async method that has a `void` return type can't be awaited, and the caller of a void-returning method can't catch any exceptions that the method throws.»
> S3: «Other implementations of `async void` returning methods don't follow the TAP model and can present challenges: — Exceptions thrown in an `async void` method can't be caught outside of that method — `async void` methods are difficult to test — `async void` methods can cause negative side effects if the caller isn't expecting them to be asynchronous.»

**M5. «async без await всё равно работает асинхронно».** НЕВЕРНО. Если в async-методе нет `await`-точки приостановки, метод исполняется как синхронный (несмотря на модификатор `async`); компилятор выдаёт предупреждение. Источники: S1, S3.
> S1: «If an async method doesn't use an `await` operator to mark a suspension point, the method executes as a synchronous method does, despite the `async` modifier. The compiler issues a warning for such methods.»
> S3: «If the compiler doesn't encounter an `await` expression, the method fails to yield. […] The state machine generated by the C# compiler for the asynchronous method doesn't accomplish anything, so the entire process is highly inefficient.»

**M6. «блокировать задачу (.Result/.Wait) — безопасно».** НЕВЕРНО (в общем случае). Синхронная блокировка на асинхронной операции может вести к дедлокам и её следует избегать. `.Wait()`/`.Result` дополнительно оборачивают исключение в `AggregateException`. Предпочтительно `async`/`await` по всему стеку вызовов; при вынужденной блокировке наименее плохой вариант — `GetAwaiter().GetResult()`. Источник: S3 (callout **Warning**).
> «Warning: Synchronous blocking on asynchronous operations can lead to deadlocks and should be avoided whenever possible. The preferred solution is to use `async`/`await` throughout your call stack.»
> «You can use a blocking approach by calling Wait() and Result. However, this approach is discouraged because it wraps exceptions in AggregateException.»

---

## Реестр покрытия (закрытый корпус: 3 страницы ТЗ + подтемы)

| Единица (подтема ТЗ) | Покрыта | Источник-первооткрыватель |
| --- | --- | --- |
| Модель TAP (что это, слой абстракции, state machine) | да | S1/F1–F2, S3/F4 |
| async/await overview (что делает await, поток управления) | да | S1/F5, S3/F5–F6 |
| Возвращаемые типы (Task/Task<T>/void/ValueTask, GetAwaiter) | да | S1/F3, S3/F18 |
| Композиция WhenAll | да | S2/F10, S3 (пример GetUsersAsync) |
| Композиция WhenAny (Task<Task>, обработка по мере завершения) | да | S2/F11, S3/F12 |
| Старт задач конкурентно (не await подряд) | да | S2/F8 |
| «часть асинхронна → всё асинхронно» | да | S2/F9 |
| I/O-bound vs CPU-bound (когда Task.Run) | да | S3/F15–F16 |
| «Измеряй, есть tradeoff» | да | S3/F17 |
| Исключения в задачах (faulted, AggregateException, первое InnerException) | да | S2/F14 |
| Блокирующие → await эквиваленты (таблица) | да | S3/F13 |
| Мифы M1–M6 | да | S1/S2/S3 |

Все единицы замороженного скоупа ТЗ (3 страницы + требуемые подтемы + обязательный раздел мифов) покрыты — 100%. Критерий остановки закрытого корпуса (п.3a) выполнен. 18 пронумерованных утверждений (F1–F18) + 6 мифов (M1–M6) с дословными цитатами и URL — в пределах запрошенных 14–18.

## Противоречия источников

Прямых противоречий между S1/S2/S3 не обнаружено (один издатель, один git_commit — согласованы by design). Единственный нюанс согласованности: S2 в разделе «Async/await vs ContinueWith» утверждает «Performance: The compiler optimizations for `async`/`await` are more sophisticated than manual `ContinueWith` chains» — это качественное утверждение БЕЗ бенчмарка на странице. В уроки как перф-факт не брать без замера; как мотивацию читаемости/поддерживаемости — брать (это на странице обосновано примерами). Уверенность по перф-утверждению: низкая (нет артефакта замера).

## Что не удалось выяснить / вне скоуса

- MCP-инструменты Microsoft Learn в сессии недоступны — извлечение через `WebFetch` тех же URL (см. оговорку выше); на достоверность фактов не влияет (тот же нормативный корпус).
- Точные тайминги state-machine и стоимость аллокаций `Task` vs `ValueTask` в числах — на страницах даны качественно (F17/F18); численные пороги требуют собственного бенчмарка (в скоуп не входит, для уроков достаточно качественной формулировки + указания «измеряй»).
- `ConfigureAwait(false)`, `IAsyncEnumerable`, отмена (CancellationToken) — упомянуты на S3 вскользь, отдельные страницы Learn; в ТЗ этих подтем нет, не раскрывал.

## §6 Ограничение независимости источников (честная оговорка)

Все три страницы — из репозитория `dotnet/docs`, один `git_commit_id` (156931b), один автор-владелец (BillWagner). Это ОДИН издатель-первоисточник, а не 2–3 независимых канала. Для НОРМАТИВНОЙ семантики языка/рантайма первичная документация вендора самодостаточна и является каноном (иерархия провенанса, класс A) — это допустимо. Но для уроков, где захочется «мнение практиков» о ловушках (дедлоки sync-over-async, async void), стоит при желании добавить независимый канал класса B (напр. Stephen Toub / devblogs — на них ссылается сама S3: «ConfigureAwait FAQ», «Should I expose synchronous wrappers…»). В рамках этой задачи (сбор авторитетных нормативных фактов для сверки) канон Learn достаточен.
