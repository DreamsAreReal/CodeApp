# GT-m4 — Исключения в async (S2.7) и кооперативная отмена (S2.8): авторитетные факты

Линза: ground-truth факты для урока/корпуса по темам **S2.7** (исключения в async: как
всплывают, `AggregateException` при `Wait`/`WaitAll`/`WhenAll` vs `await`, первое
исключение) и **S2.8** (кооперативная отмена: `CancellationToken`, linked tokens,
`OperationCanceledException`, `ThrowIfCancellationRequested`).

Корпус: **нормативная база жанра** — официальная документация Microsoft Learn (.NET
standard / C# asynchronous-programming). Первичка класса **A**: страницы поддерживаются
мейнтейнерами dotnet/docs (BillWagner, adegeo), имеют git-историю коммитов и `git_commit_id`,
датированы (`ms.date`), правки идут через PR в открытый репозиторий dotnet/docs. Цена
подделки высокая.

Дата сбора: **2026-07-18**. Все URL — en-us Microsoft Learn. Каждый факт получен прямым
`fetch` соответствующей страницы (не из памяти модели). Значения `ms.date`/`updated_at`
взяты из front-matter полученных страниц.

## Источники и провенанс

| ID | Страница | URL | ms.date / updated_at | Класс | Заметки провенанса |
|----|----------|-----|----------------------|-------|--------------------|
| S1 | Exception handling (Task Parallel Library) | https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library | ms.date 2022-06-08 / upd 2026-03-30 | A | dotnet/docs, author adegeo, `git_commit_id 156931bb…`. Каноническая страница ТЗ по S2.7. Терминология TPL/AggregateException стабильна годами |
| S2 | Cancellation in Managed Threads | https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads | ms.date 2026-03-17 / upd 2026-03-30 | A | dotnet/docs, author BillWagner, `git_commit_id 156931bb…`. Каноническая страница ТЗ по S2.8. **Флаг `ai-usage: ai-assisted`** → все факты сверены со вторым каналом (S4) |
| S3 | The Task Asynchronous Programming (TAP) model with async and await | https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model | ms.date 2025-10-13 / upd 2026-03-30 | A | dotnet/docs, author BillWagner. Второй канал для механики `await` (suspension, где всплывает исключение) |
| S4 | Task Cancellation | https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation | ms.date 2025-10-20 / upd 2026-03-30 | A | dotnet/docs, author adegeo. Второй канал для отмены на уровне Task: состояния Canceled/Faulted, `TaskCanceledException`, обёртка в AggregateException при Wait |

**Независимость каналов (разные ТИПЫ страниц, не цитируют друг друга дословно).**
- Ключевой факт «`await` НЕ бросает `AggregateException`, а разворачивает одно исключение»
  подтверждён ДВУМЯ независимыми каналами: S1 (важная нота «AggregateException cannot be
  explicitly caught when using `await task`» + список выражений, бросающих исключение) и
  S4 (Wait/WaitAll оборачивают в AggregateException, тогда как в примере с `await task`
  ловится сам `OperationCanceledException`, а не AggregateException).
- Кооперативность отмены: S2 (общая модель) и S4 (Task-уровень: «cancellation involves
  cooperation between the user delegate … and the code that requested the cancellation»)
  независимо. Это гасит риск `ai-assisted`-флага S2.
- `OperationCanceledException` + сверка токена: S1 (раздел «cooperative cancellation»), S2
  и S4 — три канала.

---

## Находки — S2.7 Исключения в async / TPL

**F1. Исключения из задачи всплывают в вызывающий поток при наблюдении.** Необработанные
исключения из пользовательского кода внутри задачи распространяются обратно в вызывающий
поток (кроме описанных отдельно сценариев) — при использовании `Task.Wait` и обрабатываются
через `try`/`catch`.
> "Unhandled exceptions that are thrown by user code that is running inside a task are
> propagated back to the calling thread, except in certain scenarios that are described
> later in this topic. Exceptions are propagated when you use one of the static or instance
> Task.Wait methods, and you handle them by enclosing the call in a `try`/`catch` statement.
> If a task is the parent of attached child tasks, or if you are waiting on multiple tasks,
> multiple exceptions could be thrown."
Источник: S1. Уверенность: **высокая**.

**F2. `Wait`/`WaitAll`/`Result` оборачивают исключения в `AggregateException`.** Чтобы
пробросить ВСЕ исключения в вызывающий поток, инфраструктура Task оборачивает их в один
`AggregateException`; его `InnerExceptions` перечисляется для доступа к оригинальным
исключениям.
> "To propagate all the exceptions back to the calling thread, the Task infrastructure
> wraps them in an AggregateException instance. The AggregateException exception has an
> InnerExceptions property that can be enumerated to examine all the original exceptions
> that were thrown, and handle (or not handle) each one individually."
Источник: S1. Уверенность: **высокая**.

**F3. ДАЖЕ ОДНО исключение оборачивается в `AggregateException` (при Wait/Result).** Даже
если брошено единственное исключение, оно всё равно обёрнуто в `AggregateException`.
> "Even if only one exception is thrown, it is still wrapped in an AggregateException
> exception, as the following example shows."
(В примере: `task.Wait()` в `catch (AggregateException ae)` → `foreach (var ex in
ae.InnerExceptions)`.)
Источник: S1. Уверенность: **высокая**. Граница: это относится к `Wait`/`Result`/`WaitAll`
— НЕ к `await` (см. F6).

**F4. Наблюдение без ожидания — через `Task.Exception`.** Если не вызывать `Task.Wait`,
`AggregateException` можно получить из свойства `Task.Exception` (напр., когда
`task.Status == TaskStatus.Faulted`).
> "If you do not want to call the Task.Wait method to wait for a task's completion, you can
> also retrieve the AggregateException exception from the task's Exception property"
> "If a task completes in the TaskStatus.Faulted state, its Exception property can be
> examined to discover which specific exception caused the fault."
Источник: S1. Уверенность: **высокая**.

**F5. Неотнаблюдённое исключение эскалируется при сборке мусора.** Если задачу не ожидают
и не читают её `Exception`, исключение эскалируется по политике исключений .NET при
garbage-collection задачи; можно перехватить событие
`TaskScheduler.UnobservedTaskException`.
> "If you do not wait on a task that propagates an exception, or access its Exception
> property, the exception is escalated according to the .NET exception policy when the task
> is garbage-collected."
> "you can handle the TaskScheduler.UnobservedTaskException event. The … UnobservedTask
> ExceptionEventArgs instance that is passed to your handler can be used to prevent the
> unobserved exception from being propagated back to the joining thread."
Источник: S1. Уверенность: **высокая**.

**F6. КЛЮЧЕВОЕ: `await` / `GetAwaiter().GetResult()` бросают само исключение, `AggregateException`
поймать нельзя.** При сбое задачи исключение бросают выражения `await task`, `task.Wait()`,
`task.Result`, `task.GetAwaiter().GetResult()`. Но `AggregateException` НЕЛЬЗЯ явно поймать
при `await task` и `task.GetAwaiter().GetResult()` — там всплывает развёрнутое (первое)
внутреннее исключение.
> "If a task faults, the following expressions throw the exception:
> - `await task`
> - `task.Wait()`
> - `task.Result`
> - `task.GetAwaiter().GetResult()`"
> "**Important** The AggregateException cannot be explicitly caught when using the following
> expressions:
> - `await task`
> - `task.GetAwaiter().GetResult()`"
Источник: S1. Уверенность: **высокая**. Второй канал — S4 (F13: в примере `await task` в
`catch (OperationCanceledException)`, а не `AggregateException`). Это прямое опровержение
мифа M1.

**F7. Вложенные `AggregateException` от attached child tasks; `Flatten`.** Исключение из
attached child task оборачивается в `AggregateException`, а родитель оборачивает это в свой
`AggregateException` — получаются вложенные агрегаты. `Flatten` убирает вложенность, оставляя
в `InnerExceptions` оригинальные исключения.
> "If a task has an attached child task that throws an exception, that exception is wrapped
> in an AggregateException before it is propagated to the parent task, which wraps that
> exception in its own AggregateException before it propagates it back to the calling thread."
> "you can use the Flatten method to remove all the nested AggregateException exceptions, so
> that the AggregateException.InnerExceptions property contains the original exceptions."
Источник: S1. Уверенность: **высокая**.

**F8. Detached child tasks — по умолчанию, исключения НЕ всплывают автоматически.** По
умолчанию дочерние задачи создаются detached; их исключения должны быть обработаны или
переброшены в непосредственном родителе — они не всплывают в вызывающий поток как у
attached.
> "By default, child tasks are created as detached. Exceptions thrown from detached tasks
> must be handled or rethrown in the immediate parent task; they are not propagated back to
> the calling thread in the same way as attached child tasks propagated back."
Источник: S1. Уверенность: **высокая**.

**F9. `AggregateException.Handle` — фильтр «обработанных» исключений.** `Handle(Func<Exception,
bool>)` вызывается для каждого внутреннего исключения; исключения, для которых делегат вернул
`false`, перебрасываются в новом `AggregateException` сразу после возврата `Handle`.
> "Any exceptions for which the delegate returns `false` are rethrown in a new
> AggregateException instance immediately after the AggregateException.Handle method returns."
Источник: S1. Уверенность: **высокая**.

**F10. Наблюдение через continuation `OnlyOnFaulted`.** Хороший способ наблюдать `Exception` —
continuation, который выполняется только если предшествующая задача упала
(`TaskContinuationOptions.OnlyOnFaulted`); там доступен `t.Exception.InnerException`.
> "A good way to observe the Exception property is to use a continuation that runs only if
> the antecedent task faults"
Источник: S1. Уверенность: **высокая**.

**F11. Механика `await`: где всплывает исключение (второй канал).** Задача инкапсулирует
состояние асинхронного процесса и в итоге либо результат, либо исключение, которое процесс
бросил при неуспехе; `await` извлекает результат из задачи (а при сбое — соответственно
бросает исключение из неё).
> "Each returned task represents ongoing work. A task encapsulates information about the
> state of the asynchronous process and, eventually, either the final result from the
> process or the exception that the process raises if it doesn't succeed."
> "The await operator retrieves the result from `getStringTask`."
Граница из S3 (важно для урока): «The suspension of an async method at an `await` expression
doesn't constitute an exit from the method, and `finally` blocks don't run» — т.е. приостановка
на await это не выход, `finally` не выполняется в момент приостановки.
Источник: S3. Уверенность: **высокая**.

**F12. `async void` — исключения поймать нельзя.** Async-метод с `void` нельзя ожидать, и
вызывающий не может поймать исключения, которые метод бросает.
> "An async method that has a void return type can't be awaited, and the caller of a
> void-returning method can't catch any exceptions that the method throws."
Источник: S3. Уверенность: **высокая**.

---

## Находки — S2.8 Кооперативная отмена

**F13. Отмена КООПЕРАТИВНА и НЕ навязывается слушателю.** С .NET Framework 4 действует
единая модель кооперативной отмены на основе лёгкого объекта — cancellation token. Только
запрашивающий объект может выдать запрос, каждый слушатель сам отвечает за то, чтобы заметить
запрос и отреагировать своевременно.
> "Starting with .NET Framework 4, .NET uses a unified model for cooperative cancellation of
> asynchronous or long-running synchronous operations."
> "Only the requesting object can issue the cancellation request, and each listener is
> responsible for noticing the request and responding to it in an appropriate and timely
> manner."
> "Cancellation is cooperative and is not forced on the listener. The listener determines how
> to gracefully terminate in response to a cancellation request."
Источник: S2. Второй канал S4: «cancellation involves cooperation between the user delegate …
and the code that requested the cancellation.» Уверенность: **высокая**. Прямое опровержение
мифов M2 и M4.

**F14. Три типа фреймворка отмены.** `CancellationTokenSource` создаёт токен и выдаёт запрос
отмены для всех копий токена; `CancellationToken` — лёгкий value type, передаётся слушателям
(обычно как параметр метода); `OperationCanceledException` — исключение, которое слушатели
могут бросить, приняв в конструктор токен.
> "CancellationTokenSource | Object that creates a cancellation token, and also issues the
> cancellation request for all copies of that token."
> "CancellationToken | Lightweight value type passed to one or more listeners, typically as a
> method parameter. Listeners monitor the value of the `IsCancellationRequested` property of
> the token by polling, callback, or wait handle."
Источник: S2. Уверенность: **высокая**. (Заметка для урока: `CancellationToken` — value type;
согласуется с общей темой value/reference в S1-модуле.)

**F15. Общий паттерн: создать CTS → передать `Token` → реагировать → `Cancel()`.**
> "Instantiate a CancellationTokenSource object … Pass the token returned by the
> CancellationTokenSource.Token property to each task or thread that listens for cancellation.
> Provide a mechanism for each task or thread to respond to cancellation. Call the
> CancellationTokenSource.Cancel method to provide notification of cancellation."
Источник: S2. Уверенность: **высокая**.

**F16. `CancellationTokenSource` реализует `IDisposable` — нужно `Dispose()`.**
> "The CancellationTokenSource class implements the IDisposable interface. You should be sure
> to call the CancellationTokenSource.Dispose method when you have finished using the
> cancellation token source to free any unmanaged resources it holds."
Источник: S2. Уверенность: **высокая**.

**F17. Отмена относится к ОПЕРАЦИЯМ, токен одноразовый.** Отмена относится к операциям, не к
объектам; после установки `IsCancellationRequested` в `true` его нельзя сбросить в `false` —
токен нельзя переиспользовать после отмены.
> "In the cooperative cancellation framework, cancellation refers to operations, not objects."
> "After the IsCancellationRequested property of the token has been set to `true`, it cannot
> be reset to `false`. Therefore, cancellation tokens cannot be reused after they have been
> canceled."
Источник: S2. Уверенность: **высокая**.

**F18. Три способа слушать отмену: polling, callback, wait handle.**
> "Listeners can be notified of cancellation requests by polling, callback registration, or
> waiting on wait handles."
- **Polling**: периодически проверять `CancellationToken.IsCancellationRequested`; «Polling
  itself does not significantly impact performance.»
- **Callback**: `CancellationToken.Register(...)` возвращает `CancellationTokenRegistration`;
  используется, когда операция заблокирована и не может вовремя проверить токен. Колбэк
  вызывается синхронно, и `Cancel` не вернётся, пока колбэк не завершится: «The callback
  method should be fast because it is called synchronously and therefore the call to Cancel
  does not return until the callback returns.»
- **Wait handle**: `CancellationToken.WaitHandle` становится сигнальным при запросе отмены;
  `ManualResetEventSlim`/`SemaphoreSlim` принимают токен в `Wait` и бросают
  `OperationCanceledException` при отмене.
Источник: S2. Уверенность: **высокая**.

**F19. `ThrowIfCancellationRequested` → `OperationCanceledException`.** Когда делегату нужно
уведомить библиотечный код об отмене, правильный способ завершения — вызвать
`ThrowIfCancellationRequested`, что бросит `OperationCanceledException`; библиотека ловит его
и сверяет токен, чтобы отличить кооперативную отмену от иной исключительной ситуации.
> "the correct way to terminate the operation is for the delegate to call the
> ThrowIfCancellationRequested, method, which will cause an OperationCanceledException to be
> thrown. Library code can catch this exception on the user delegate thread and examine the
> exception's token to determine whether the exception indicates cooperative cancellation or
> some other exceptional situation."
Источник: S2. Уверенность: **высокая**.

**F20. Linked tokens: `CreateLinkedTokenSource`.** Слушатель может слушать несколько токенов
сразу, объединив их в один linked token. Дочерний linked-токен отменяется при отмене родителя;
дочерний CTS можно отменить и независимо. Linked CTS нужно `Dispose`.
> "A listener can listen to multiple tokens simultaneously by joining them into one linked
> token."
> "create a linked token source that can join two or more tokens into one token."
> (пример: `CancellationTokenSource.CreateLinkedTokenSource(parentToken)`; вывод показывает,
> что при `parentCts.Cancel()` и `parentToken`, и `childToken` становятся отменёнными.)
> "you must call `Dispose` on the linked token source when you're done with it."
Источник: S2. Уверенность: **высокая**.

**F21. Task-уровень: отмена = кооперация; способ завершения меняет итоговое состояние.** В
классах Task отмена требует кооперации user delegate и запрашивающего кода. Способ завершения
делегата определяет итоговый статус:
> "By returning from the delegate. … However, a task instance that's canceled in this way
> transitions to the TaskStatus.RanToCompletion state, not to the TaskStatus.Canceled state."
> "By throwing an OperationCanceledException and passing it the token on which cancellation
> was requested. The preferred way to perform is to use the ThrowIfCancellationRequested
> method. A task that's canceled in this way transitions to the Canceled state"
Источник: S4. Уверенность: **высокая**. (Важно для урока: просто `return` из делегата НЕ даёт
статус Canceled — задача считается RanToCompletion.)

**F22. Сверка токена определяет Canceled vs Faulted.** Когда задача видит
`OperationCanceledException` из user code, она сравнивает токен исключения со своим
ассоциированным токеном. Совпали и `IsCancellationRequested == true` → Canceled. Иначе (токен
не совпал или запроса не было) → это трактуется как обычное исключение → Faulted.
> "When a task instance observes an OperationCanceledException thrown by the user code, it
> compares the exception's token to its associated token … If the tokens are same and the
> token's IsCancellationRequested property returns `true`, the task interprets this as
> acknowledging cancellation and transitions to the Canceled state."
> "If the token's IsCancellationRequested property returns `false` or if the exception's token
> doesn't match the Task's token, the OperationCanceledException is treated like a normal
> exception, causing the Task to transition to the Faulted state."
Источник: S4. Уверенность: **высокая**.

**F23. Ожидание отменённой задачи → `TaskCanceledException` (в AggregateException при Wait),
`Exception == null`.** При ожидании задачи, перешедшей в Canceled, бросается
`TaskCanceledException`, обёрнутый в `AggregateException`; это успешная отмена, не сбой,
поэтому `Task.Exception` возвращает `null`.
> "If you're waiting on a Task that transitions to the Canceled state, a
> System.Threading.Tasks.TaskCanceledException exception (wrapped in an AggregateException
> exception) is thrown. This exception indicates successful cancellation instead of a faulty
> situation. Therefore, the task's Exception property returns `null`."
Источник: S4. Уверенность: **высокая**. Согласуется с S1: «the task propagates a
TaskCanceledException wrapped in the AggregateException» (раздел «Exceptions that indicate
cooperative cancellation»). В примере S4 с `await task` ловится сам
`catch (OperationCanceledException)` (TaskCanceledException наследует OperationCanceledException) —
то есть при `await` обёртка AggregateException не всплывает (согласуется с F6).

**F24. Отмена НЕ гарантирует немедленную остановку.** Возможно, что задача продолжит
обрабатывать элементы уже после запроса отмены.
> "It's possible that a task might continue to process some items after cancellation is
> requested."
Источник: S4 (и аналогично S1 про исключения: «a task may continue to process some items
after the exception is raised»). Уверенность: **высокая**. Подкрепляет кооперативность (F13).

---

## Мифы (разоблачение с цитатами)

**M1. «`await` бросает `AggregateException`».** ЛОЖНО. `AggregateException` в `AggregateException`
оборачивают синхронные `Task.Wait()`/`Task.Result`/`Task.WaitAll` (F2, F3). А `await task` и
`task.GetAwaiter().GetResult()` разворачивают и бросают САМО (первое) внутреннее исключение —
«The AggregateException cannot be explicitly caught when using … `await task` … `task.GetAwaiter().
GetResult()`» (S1, F6). Отсюда практическое следствие для `Task.WhenAll`: `await Task.WhenAll(...)`
бросит лишь ОДНО (первое) исключение из агрегата; чтобы увидеть все — читать
`whenAllTask.Exception.InnerExceptions` (через `Task.Exception`, F4). Уверенность: **высокая**,
два канала (S1 + S4).

**M2. «Отмена убивает/прерывает поток (как `Thread.Abort`)».** ЛОЖНО. Модель КООПЕРАТИВНА:
«Cancellation is cooperative and is not forced on the listener» (S2, F13). Запрос лишь
устанавливает `IsCancellationRequested`; слушатель сам решает, как «gracefully terminate», и
может даже продолжить обработку части элементов после запроса (S4, F24). Никакого форсированного
прерывания потока фреймворк отмены не делает.

**M3. «`CancellationToken` сам прерывает синхронный код».** ЛОЖНО. Токен ничего не прерывает
сам — слушатель ОБЯЗАН его опрашивать/регистрировать колбэк/ждать на wait handle (S2, F18) и
сам вызывать `ThrowIfCancellationRequested`, чтобы бросить `OperationCanceledException` (S2, F19).
Без явной проверки в пользовательском коде длинный синхронный цикл продолжит выполняться —
«each listener is responsible for noticing the request» (S2, F13). Метод `IsCancellationRequested`
только читается кодом операции; отмена — это установка флага, а не инъекция исключения в чужой код.

**M4. «`cts.Cancel()` бросает исключение на потоке, который запросил отмену».** ЛОЖНО. Запрос и
прослушивание разделены: «Requesting is distinct from listening» (S2). `Cancel()` лишь уведомляет
все копии токена; `OperationCanceledException` возникает на потоке СЛУШАТЕЛЯ при
`ThrowIfCancellationRequested` (S2, F19), а на запрашивающем потоке исключение отмены проявится
только если он ОЖИДАЕТ задачу (`await`/`Wait`) — тогда прилетит `TaskCanceledException`/
`OperationCanceledException` (S4, F23). (Побочно: колбэки из `Register` выполняются синхронно
внутри `Cancel`, F18 — но это исполнение колбэка, а не «исключение отмены».)

**M5. «`return;` из делегата задачи = отменённая задача (статус Canceled)».** ЛОЖНО. Простой
`return` из делегата переводит задачу в `RanToCompletion`, НЕ в `Canceled` (S4, F21). Чтобы
задача стала `Canceled`, нужно бросить `OperationCanceledException` с СОВПАДАЮЩИМ токеном
(предпочтительно через `ThrowIfCancellationRequested`) — и токен должен быть запрошен (F21, F22).

**M6. «Отменённая задача = упавшая (Faulted), `Task.Exception` содержит исключение».** ЛОЖНО.
Корректная отмена (совпадающий токен) → статус `Canceled`, это успех, а не сбой: `Task.Exception`
возвращает `null` (S4, F23). В Faulted задача перейдёт, только если токен НЕ совпал / запроса не
было, либо было иное исключение (S4, F22).

**M7. «`CancellationToken` — reference type / класс».** ЛОЖНО. Официально: `CancellationToken` —
«Lightweight value type» (S2, F14). Управляющий объект-владелец — `CancellationTokenSource`
(class, `IDisposable`, F16); сам токен копируется по значению и раздаётся слушателям.

---

## Варианты и трейдофы (для авторинга урока)

- Способ реакции на отмену — трейдофф **простота vs наблюдаемость статуса**: `return` из делегата
  проще, но теряет статус `Canceled` (задача выглядит как успешно завершённая, F21); бросок
  `OperationCanceledException` через `ThrowIfCancellationRequested` даёт корректный `Canceled` и
  возможность вызывающему коду отличить отмену от сбоя (F21, F22). Рекомендация Learn — второй
  вариант («preferred way»).
- Способ прослушивания (F18) — трейдофф **отзывчивость vs применимость**: polling дёшев и подходит
  для циклов/рекурсии, но бесполезен для заблокированных операций; callback/wait handle
  разблокируют заблокированный код, но требуют осторожности (колбэк синхронный, риск дедлока при
  `Dispose` под локом).
- Ожидание задачи: `await` (одно развёрнутое исключение, чище для типичного кода) vs
  `Wait`/`WaitAll` (`AggregateException` со всеми внутренними, нужно когда важны ВСЕ исключения из
  нескольких задач). Кандидатов-инструментов нет → спайк (п.5) не требуется; всё проверяется
  цитатами первички.

## Реестр покрытия (закрытый корпус: 2 канонические страницы ТЗ + 2 подтверждающие)

Замороженный скоуп единиц по ТЗ (S2.7: исключения/AggregateException/WhenAll vs await/первое
исключение; S2.8: CancellationToken/linked tokens/OperationCanceledException/ThrowIfCancellationRequested).

| Единица покрытия (из ТЗ) | Источник-первооткрыватель | Статус |
|--------------------------|---------------------------|--------|
| Как исключения всплывают из async/task | S1, S3 | покрыто (F1, F11) |
| `AggregateException` при `Wait`/`WaitAll`/`Result` (в т.ч. одно исключение) | S1 | покрыто (F2, F3) |
| `await` vs `AggregateException` (первое/развёрнутое исключение) | S1 (+S4) | покрыто, 2 канала (F6, M1) |
| `Task.WhenAll` и AggregateException / первое исключение при await | S1 (F6) + S1 (F4 Exception.InnerExceptions) | покрыто через общий механизм await/Exception (см. «Не удалось» — отдельной дословной страницы про WhenAll нет) |
| Первое исключение при await | S1 | покрыто (F6, M1) |
| `AggregateException.InnerExceptions`/`Handle`/`Flatten`, вложенность | S1 | покрыто (F2, F7, F9) |
| attached vs detached child, unobserved | S1 | покрыто (F5, F7, F8) |
| Кооперативная отмена (не форсируется) | S2, S4 | покрыто, 2 канала (F13, M2) |
| `CancellationToken` / `CancellationTokenSource` (роли, value type, IDisposable) | S2 | покрыто (F14, F16, M7) |
| Способы слушать (polling / callback / wait handle) | S2 | покрыто (F18) |
| `OperationCanceledException` | S2, S4 | покрыто (F19, F22, F23) |
| `ThrowIfCancellationRequested` | S2, S4 | покрыто (F19, F21) |
| linked tokens / `CreateLinkedTokenSource` | S2 | покрыто (F20) |
| Canceled vs Faulted vs RanToCompletion, сверка токена, `TaskCanceledException` | S4 | покрыто (F21, F22, F23) |

Критерий остановки (закрытый корпус): 100% единиц замороженного скоупа ТЗ покрыты первичкой
класса A. Формула насыщения открытого корпуса не применяется. 24 находки + 7 мифов, каждый —
с URL и дословной цитатой (требование ТЗ «12–18 утверждений» перевыполнено).

## Противоречия источников

Не обнаружено. S1 и S4 согласованно описывают обёртку `TaskCanceledException` в
`AggregateException` при `Wait`, и разворачивание при `await`. S2 (ai-assisted) не противоречит
S4 (не ai-assisted) по кооперативности и `ThrowIfCancellationRequested`.

## Что не удалось выяснить

- **`Task.WhenAll` — отдельной дословной фразы «при await бросается ТОЛЬКО первое исключение,
  остальные в task.Exception.InnerExceptions» на этих 4 страницах НЕТ.** Вывод сделан из общего
  механизма: `await` не бросает `AggregateException` (S1, F6) → всплывает одно исключение; все
  исключения агрегата остаются доступны через `Task.Exception.InnerExceptions` (S1, F4). Для
  урока, если нужна дословная первичка именно про WhenAll, добрать страницу
  `dotnet/api/system.threading.tasks.task.whenall` (remarks) отдельным прогоном — не входила в
  канонический список ТЗ.
- Точная внутренняя механика `ExceptionDispatchInfo` (сохранение стек-трейса при перебросе через
  `await`) на этих страницах дословно не формулируется — тема соседнего уровня, вне скоупа S2.7/S2.8.

## Рекомендация (для builder/evaluator)

Строить урок S2.7 вокруг центрального различения (F2/F3 vs F6): **синхронное ожидание
(`Wait`/`Result`/`WaitAll`) → `AggregateException`; `await` → развёрнутое (первое) исключение**.
Это самый частый миф (M1) и главный «aha». Урок S2.8 строить вокруг F13 (кооперативность, не
форсирование) как корня, из которого следуют F18 (слушатель обязан проверять), F19/F21
(`ThrowIfCancellationRequested` → Canceled) и F22/F23 (сверка токена решает Canceled vs Faulted).
Мифы M2–M6 — готовый материал для карточек «разоблачение». Все пороги/факты — из первички A,
human-in-loop не требуется (тема не safety-критична), но каждое утверждение в уроке должно
сохранять привязку к цитате из этого файла.
