# GT-M4-s2 — Сводка ground-truth для аудита M4 (async, уроки S2.1–S2.9)

**Назначение**: чек-лист точности для evaluator-а на гейте **G7** (trace-to-original,
аудит выборки уроков — fetch источника и сверка ≥3 ключевых утверждений; бар:
«0 утверждений, не подтверждённых источником»). Для КАЖДОЙ из 9 тем уроков — **топ-6
фактов, которые обязаны быть в уроке** (с URL первоисточника класса A) + отсылки на
дословные цитаты в GT-файлах тем. Единый агрегированный **список мифов async** (раздел
в конце) — самое ценное для этого модуля: async-мифы кочуют между темами, поэтому
собраны в один сквозной реестр «мисконцепция → опровержение → источник».

**Корпус**: нормативная база жанра — официальная документация Microsoft Learn
(C# asynchronous-programming / language-reference / .NET standard patterns / .NET API)
и compiler-design (Roslyn design doc). Первичка класса A: страницы датированы,
версионируются через публичные репозитории `dotnet/docs`, `dotnet-api-docs`,
`dotnet/runtime`, `dotnet/roslyn`; API-страницы ссылаются на исходник рантайма
(`ValueTask.cs`) — цена подделки высокая.

**Провенанс сводки**: агрегирует четыре GT-исследования, каждое собрано прямым fetch
страниц Learn 2026-07-18:
- `GT-m4-tap-model.md` (S2.1 TAP-модель, S2.2 обзор/WhenAll·WhenAny, S2.3 I/O-vs-CPU) —
  F1–F18, M1–M6.
- `GT-m4-return-types.md` (S2.4 return types, S2.5 ValueTask/ограничения) — F1–F18, M1–M6.
- `GT-m4-exceptions-cancel.md` (S2.7 исключения, S2.8 cancellation) — F1–F24, M1–M7.
- `GT-m4-streams-statemachine.md` (S2.6 TAP-контракт изнутри, S2.9 async streams,
  машинная панель) — F1–F22, M1–M9.
Ссылки F#/M# ниже указывают на соответствующий GT-файл темы (для быстрой навигации
evaluator-а к дословной цитате-источнику). Обозначение `[tap:F8]` = факт F8 в
GT-m4-tap-model.md; `[rt:F10]` = return-types; `[exc:F13]` = exceptions-cancel;
`[str:F9]` = streams-statemachine.

**Как пользоваться на G7**: для каждого урока выборки взять его тему ниже → fetch URL(ы)
темы → сверить, что ≥3 «обязательных» факта присутствуют и сформулированы верно →
проверить, что урок НЕ содержит ни одного мифа из сквозного реестра. Любой миф в тексте
урока = провал G7 (утверждение, опровергнутое источником).

**Свежесть**: семантика TAP / async-стейт-машины и конвенции языка стабильны годами
(возраст страниц несущественен, п.3 правил). Версионные факты нормативны и привязаны к
релизу: async streams — три интерфейса в .NET Standard 2.1 / реализованы в .NET Core 3.0
[str:F10]; `ValueTask`/`ValueTask<T>` — с C# 7.0, не поддерживаются VB [rt:F18]; единая
модель отмены — с .NET Framework 4 [exc:F13].

**Карантин инъекций**: во всём собранном внешнем контенте (страницы Learn + Roslyn
design doc) инструкций-манипуляций не обнаружено — чистая техдокументация. Находок
«манипуляция источника» нет.

**PII**: объектов-людей в корпусе нет; PII-предохранитель неприменим.

**Ограничение независимости (честно, §6)**: большинство страниц — из одного репозитория
`dotnet/docs` (один издатель-вендор). Для НОРМАТИВНОЙ семантики языка/рантайма первичка
вендора самодостаточна (иерархия провенанса, класс A). Часть страниц помечены
`ai-usage: ai-assisted` (common-async-bugs; cancellation-in-managed-threads) — факты с
них брались ТОЛЬКО как подтверждающий второй канал того, что дословно есть на не-ai
страницах. Два перф-утверждения без бенчмарка на странице (async/await vs ContinueWith)
в уроки как перф-факт НЕ брать без замера (уверенность низкая) — см. §Противоречия.

---

## S2.1 — TAP-модель: что это, async/await, state machine

**Первоисточники**:
- TAP model with async and await (C#): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model
- Asynchronous programming (обзор, breakfast): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/
- Async scenarios (state machine, Promise model): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-tap-model.md):
1. **TAP = слой абстракции**: код пишется как последовательность операторов, но
   исполняется в более сложном порядке — по готовности внешних ресурсов и завершению
   задач; `async`/`await` — «сердце» async-программирования, компилятор делает трудную
   работу, логическая структура остаётся похожей на синхронную. [tap:F1, tap:F2]
2. **Компилятор превращает async-метод в state machine**: отслеживает состояние, уступает
   исполнение на `await`, возобновляет при завершении фоновой работы; по теории —
   реализация Promise-модели асинхронности. [tap:F4], [str:F17]
3. **Что делает `await`** — точка приостановки: метод не может продолжиться до завершения
   ожидаемой операции, управление возвращается вызывающему. Приостановка на `await` — НЕ
   выход из метода, блоки `finally` при этом НЕ выполняются. `await` можно использовать
   только внутри async-метода. [tap:F5, tap:F6]
4. **Задача (`Task`/`Task<T>`) инкапсулирует** состояние асинхронного процесса и в итоге —
   либо результат, либо исключение при неуспехе; async-метод возвращает задачу в момент
   приостановки, результат кладётся в задачу позже. [tap:F7]
5. **Признаки async-метода**: модификатор `async`; по конвенции суффикс `Async`;
   возвращаемый тип — `Task<T>`/`Task`/`void` (только event handler)/любой тип с
   `GetAwaiter`; обычно хотя бы одно `await`. [tap:F3]
6. **`async` НЕ форсирует другой поток**: включает `await` и выполняется синхронно до
   первого incomplete awaitable; без incomplete awaitable может завершиться синхронно;
   метод работает на текущем контексте синхронизации и занимает поток только когда активен.
   [str:F8], [tap:M2], [str:F22]

**Красные флаги / мифы**: M-async-1 (async = параллелизм), M-async-2 (await создаёт
поток), M-async-5 (async без await всё равно асинхронен), M-sm-6 (await разматывает стек
/ finally при приостановке) — см. сквозной реестр.

---

## S2.2 — Обзор композиции: старт задач, WhenAll / WhenAny

**Первоисточники**:
- Asynchronous programming (WhenAll/WhenAny, faulted, breakfast): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/
- Async scenarios (обработка по мере завершения, блокирующие→await): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-tap-model.md):
1. **Сначала СТАРТУЙ задачи, `await` — где нужен результат**: сохрани `Task`-объекты, а
   `await` применяй в точке, где результат нужен, — тогда задачи идут конкурентно и общее
   время сокращается. Пометить `async`+`await` подряд НЕ ускоряет (время как у
   синхронного варианта). [tap:F8]
2. **«Часть асинхронна → всё асинхронно»**: композиция асинхронной операции с последующей
   синхронной работой остаётся асинхронной (callout Important). [tap:F9]
3. **`Task.WhenAll`** возвращает `Task`, который завершается, когда завершены ВСЕ задачи
   из списка аргументов. [tap:F10]
4. **`Task.WhenAny`** возвращает `Task<Task>` — обёртку, завершающуюся при завершении
   ЛЮБОГО аргумента; чтобы получить результат/исключение завершившейся задачи, нужно
   дополнительно `await` уже её (`await finishedTask`). Паттерн «обработка по мере
   завершения»: `while` + `await Task.WhenAny(list)` + удаление задачи (`ToList()` для
   динамики WhenAny; `ToArray()` для WhenAll). [tap:F11, tap:F12]
5. **Исключения в задачах**: упавшая задача — «faulted», исключение в `Task.Exception`
   (тип `AggregateException`); при `await` faulted-задачи перебрасывается ПЕРВОЕ из
   `InnerExceptions`. Валидацию аргументов бросать синхронно. [tap:F14]
6. **Блокирующие API → `await`-эквиваленты**: `Task.Wait`/`Task.Result` → `await`;
   `Task.WaitAny` → `await Task.WhenAny`; `Task.WaitAll` → `await Task.WhenAll`;
   `Thread.Sleep` → `await Task.Delay`. Блокирующее ожидание задачи может вести к дедлокам.
   [tap:F13]

**Красные флаги / мифы**: M-async-1 (async = параллелизм — конкурентности не будет, если
`await` сразу после старта каждой задачи), M-exc-1 (await бросает AggregateException),
M-block-6 (.Result/.Wait безопасны) — см. сквозной реестр.

---

## S2.3 — I/O-bound vs CPU-bound (когда Task.Run, когда нет)

**Первоисточники**:
- Async scenarios (решающая таблица, ValueTask на hot-path): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios
- TAP model with async and await (Task.Run для CPU, не для I/O): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-tap-model.md):
1. **I/O-bound**: код запускает операцию, представленную `Task`/`Task<T>`, ВНУТРИ
   async-метода — БЕЗ `Task.Run`, избегать TPL. Вопрос-триггер: «код ждёт результат/
   действие, напр. данные из БД?». [tap:F15, tap:F16]
2. **CPU-bound**: код запускает дорогое вычисление на фоновом потоке через `Task.Run`
   (при пригодности к параллелизму — рассмотреть TPL). Вопрос-триггер: «код делает дорогое
   вычисление?». [tap:F15, tap:F16]
3. **`Task.Run` НЕ помогает I/O**: переносит CPU-bound работу на фоновый поток, но фоновый
   поток бесполезен для процесса, который просто ждёт результата. [tap:M3], [tap:F16]
4. **Всегда измеряй**: CPU-bound работа может оказаться недостаточно дорогой по сравнению с
   накладными расходами на переключение контекста; у каждого выбора — компромиссы. [tap:F17]
5. **`ValueTask`/`ValueTask<T>` для горячих путей**: `Task` — ссылочный тип, аллоцируется в
   куче; при частом синхронном завершении/кэшированном результате в тесных циклах лишние
   аллокации дают дорогую стоимость (подробности и трейдофы — тема S2.5). [tap:F18]
6. **`async` не про потоки** (связка с I/O): для I/O нет потока вообще на время ожидания;
   поток берётся из пула лишь для CPU-bound через `Task.Run`. [str:F22], [tap:M2]

**Красные флаги / мифы**: M-async-3 (Task.Run ускоряет I/O), M-async-2 (await создаёт
поток) — см. сквозной реестр.

---

## S2.4 — Async return types (Task / Task<T> / void / task-like / IAsyncEnumerable)

**Первоисточники**:
- Async return types (C#): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-return-types
- Common async/await bugs (2-й канал, ai-assisted): https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/common-async-bugs

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-return-types.md):
1. **Полный список return-типов**: `Task` (нет значения), `Task<TResult>` (значение),
   `void` (только event handler), любой тип с доступным `GetAwaiter` (awaiter реализует
   `ICriticalNotifyCompletion`), `IAsyncEnumerable<T>` (async stream). [rt:F1]
2. **`Task` — когда**: метод без `return`-операнда; позволяет вызывающему `await`; у `Task`
   НЕТ свойства `Result` (нет возвращаемого значения). [rt:F2]
3. **`Task<TResult>` — когда**: метод с `return`, операнд типа `TResult`; результат брать
   через `await`. Свойство `Result` — БЛОКИРУЮЩЕЕ: доступ до завершения задачи блокирует
   текущий поток. [rt:F3]
4. **`void` — ТОЛЬКО обработчики событий**: `async void` НЕЛЬЗЯ await; для прочих методов
   без значения возвращать `Task`. Исключения из `async void` НЕ ловятся вызывающим и
   обрушивают приложение (уходят на `SynchronizationContext`); у `Task`-метода исключение
   сохраняется в задаче и перебрасывается при `await`. [rt:F4, rt:F5]
5. **Generalized (task-like) типы**: любой тип с `GetAwaiter` + сопоставленный через
   `AsyncMethodBuilderAttribute` builder (SetResult/Task); смысл — лёгкий value type вместо
   reference, чтобы избежать аллокаций в горячих путях. Написание своего task-like типа —
   advanced-сценарий; по умолчанию использовать `Task`/`Task<T>`/`ValueTask<T>`. [rt:F6, rt:F7]
6. **`IAsyncEnumerable<T>` — async stream**: перечисление элементов, генерируемых порциями
   повторными асинхронными вызовами; потребление через `await foreach` (подробно — S2.9).
   [rt:F8]

**Красные флаги / мифы**: M-void-4 (async void == async Task), M-block-3 (Task<T>.Result
безопасен) — см. сквозной реестр.

---

## S2.5 — ValueTask / ValueTask<T>: когда брать и ограничения

**Первоисточники**:
- ValueTask<TResult> Struct (.NET API, net-10.0): https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask-1
- ValueTask Struct (non-generic, .NET API): https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-return-types.md):
1. **`ValueTask<TResult>` — это `readonly struct` (value type)**: оборачивает `Task<TResult>`
   ИЛИ `TResult` (используется только одно из двух). Non-generic `ValueTask` —
   `readonly struct`, awaitable-результат async-операции. Оба ссылаются на исходник
   рантайма `ValueTask.cs`. [rt:F9]
2. **Дефолт async-метода — `Task`/`Task<T>`, НЕ ValueTask**: `ValueTask<T>` брать, ТОЛЬКО
   если анализ производительности это оправдал (2 канала — generic S2 + non-generic S3). [rt:F10]
3. **Условие применимости ValueTask**: результат вероятно доступен СИНХРОННО И метод
   вызывается настолько часто, что аллокация нового `Task<T>` на каждый вызов будет
   непозволительной. [rt:F11]
4. **Базовое ограничение**: экземпляр можно await РОВНО ОДИН раз; `Result`/`GetAwaiter()`
   читать только ПОСЛЕ завершения. Нужен повторно используемый результат — `AsTask()` или
   `Preserve()`. [rt:F12]
5. **Список «should never» (иначе UNDEFINED)**: await несколько раз; `AsTask` несколько раз;
   `.Result`/`.GetAwaiter().GetResult()` до завершения или повторно; комбинировать способы
   потребления. [rt:F13]
6. **Трейдофы (не бесплатно)**: ValueTask — struct с несколькими полями, его возврат
   копирует больше данных (Task — один ссылочный field), а стейт-машина await-ящего метода
   становится больше; вне «await результата» ValueTask добавляет аллокации через
   обязательный `AsTask`. Non-generic `ValueTask` «not recommended for most scenarios»;
   `default(ValueTask<T>)` = sync-completed с `default(TResult)`. [rt:F14, rt:F15, rt:F16, rt:F17]

**Красные флаги / мифы**: M-vt-7 (ValueTask всегда быстрее/лучше), M-vt-8 (ValueTask можно
await несколько раз), M-vt-9 (ValueTask.Result читаем сразу как у Task) — см. сквозной реестр.

---

## S2.6 — TAP-контракт изнутри (hot/cold, статусы Task, гарантии потребителю)

**Первоисточники**:
- Task-based Asynchronous Pattern (TAP) overview: https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap
- `async` keyword (C# reference): https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/async
- `await` operator (C# reference): https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-streams-statemachine.md):
1. **Hot vs cold**: таски из публичных `Task`-конструкторов — «cold» (стартуют в `Created`,
   нужен `Start`); ВСЕ остальные (в т.ч. из TAP-метода) — «hot», уже запущены. Потребитель
   TAP-метода НЕ должен звать `Start` — на активной таске это `InvalidOperationException`.
   [str:F1]
2. **Три финальных (completed) статуса**: `RanToCompletion` / `Faulted` / `Canceled` — во
   всех трёх `IsCompleted == true`. [str:F2]
3. **TAP = один метод** (инициация + завершение), суффикс `Async`, возврат `Task`/`Task<T>`
   в зависимости от void/`TResult` синхронного аналога. [str:F3]
4. **Метод возвращается быстро**: синхронно делает МИНИМУМ (валидация + запуск), затем
   возвращает таску; async-метод работает синхронно до первого `await`. [str:F4]
5. **Может завершиться СИНХРОННО** и вернуть уже-завершённую таску; на стороне потребителя
   `await` уже-завершённой операции возвращает результат немедленно без приостановки. [str:F5]
6. **Исключения — В таске, не синхронно** (кроме usage-ошибок): usage-error (напр.
   `ArgumentNullException`) бросать синхронно; прочие ошибки складывать в таску; обычно
   ≤1 исключение, но для `WhenAll` — несколько. Cancellation: отмена → статус `Canceled`,
   результата нет, исключение НЕ бросается; кто `await`-ит — получает
   `OperationCanceledException`. [str:F6, str:F7]

**Красные флаги / мифы**: M-tap-3 (таску из TAP-метода надо стартовать), M-cancel-4
(отменённая операция бросает исключение из самого метода), M-exc-5 (исключение вылетает
синхронно на месте вызова), M-async-9 (метод с `async` обязательно исполняется
асинхронно) — см. сквозной реестр.

---

## S2.7 — Исключения в async (AggregateException vs развёрнутое, WhenAll, faulted)

**Первоисточники**:
- Exception handling (TPL): https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library
- TAP model with async and await (механика await, async void): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-exceptions-cancel.md):
1. **ЯДРО УРОКА — синхронное ожидание vs await**: `Task.Wait`/`Task.Result`/`Task.WaitAll`
   оборачивают исключения в `AggregateException` (даже ОДНО исключение всё равно обёрнуто);
   а `await task` и `task.GetAwaiter().GetResult()` разворачивают и бросают САМО (первое)
   внутреннее исключение — «AggregateException cannot be explicitly caught when using
   `await task`». [exc:F2, exc:F3, exc:F6]
2. **`Task.WhenAll` следствие**: `await Task.WhenAll(...)` бросит лишь ОДНО (первое)
   исключение из агрегата; чтобы увидеть ВСЕ — читать `whenAllTask.Exception.InnerExceptions`
   (через `Task.Exception`). [exc:M1], [exc:F4]. (Дословной фразы про WhenAll на 4 страницах
   НЕТ — вывод из общей механики await/Exception, см. §Что не удалось.)
3. **Наблюдение исключения**: через `await`/`Wait`/`Result`/`GetAwaiter().GetResult()`
   (бросают), или без ожидания — через `Task.Exception` при `Status == Faulted`. Неотнаблю-
   дённое исключение эскалируется при GC (событие `TaskScheduler.UnobservedTaskException`).
   [exc:F1, exc:F4, exc:F5]
4. **`AggregateException.InnerExceptions` / `Handle` / `Flatten`**: `InnerExceptions`
   перечисляется; `Handle(Func<Exception,bool>)` фильтрует «обработанные» (false →
   переброс в новом агрегате); `Flatten` убирает вложенность (attached child → вложенные
   агрегаты). [exc:F2, exc:F7, exc:F9]
5. **attached vs detached child**: attached child — исключение всплывает в родителя (и
   вложенный агрегат); detached (по умолчанию) — исключения обрабатываются/перебрасываются
   в непосредственном родителе, не всплывают автоматически. [exc:F7, exc:F8]
6. **`async void` — исключения не ловятся**: метод с `void` нельзя ожидать, вызывающий не
   может поймать выброшенные исключения. Механика `await`: приостановка на `await` — не
   выход из метода, `finally` при приостановке не выполняется. [exc:F12], [exc:F11]

**Красные флаги / мифы**: M-exc-1 (await бросает AggregateException), M-void-4 (async void
== async Task), M-block-6 (.Result безопасен → deadlock) — см. сквозной реестр.

---

## S2.8 — Кооперативная отмена (CancellationToken, linked, OperationCanceledException)

**Первоисточники**:
- Cancellation in Managed Threads (ai-assisted, сверен с S4): https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads
- Task Cancellation (состояния Canceled/Faulted, TaskCanceledException): https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-exceptions-cancel.md):
1. **ЯДРО УРОКА — отмена КООПЕРАТИВНА, не форсируется**: только запрашивающий объект
   выдаёт запрос; каждый слушатель сам замечает его и «gracefully terminate»; фреймворк
   не убивает поток. С .NET Framework 4 — единая модель. Отмена не гарантирует немедленную
   остановку (задача может обработать ещё элементы). [exc:F13, exc:F24]
2. **Три типа фреймворка**: `CancellationTokenSource` (создаёт токен, выдаёт запрос для
   всех копий, реализует `IDisposable` → нужен `Dispose`); `CancellationToken` (лёгкий
   VALUE type, передаётся слушателям как параметр); `OperationCanceledException` (слушатели
   бросают, приняв токен). [exc:F14, exc:F16]
3. **Общий паттерн**: создать CTS → передать `Token` в задачи/потоки → обеспечить механизм
   реакции → вызвать `Cancel()`. Отмена относится к ОПЕРАЦИЯМ (не объектам); токен
   одноразовый — после `IsCancellationRequested == true` сбросить нельзя. [exc:F15, exc:F17]
4. **Три способа слушать**: polling (`IsCancellationRequested`, дёшево, для циклов/рекурсии);
   callback (`Register` → `CancellationTokenRegistration`, для заблокированных операций;
   колбэк синхронный — `Cancel` не вернётся, пока не завершится); wait handle
   (`CancellationToken.WaitHandle`). [exc:F18]
5. **`ThrowIfCancellationRequested` → `OperationCanceledException`**: правильный способ
   завершения делегата; библиотека ловит, сверяет токен исключения со своим — совпал и
   `IsCancellationRequested==true` → `Canceled`; иначе → `Faulted` (обычное исключение).
   [exc:F19, exc:F21, exc:F22]
6. **Итоговый статус и linked tokens**: просто `return` из делегата → `RanToCompletion` (НЕ
   `Canceled`); бросок `OperationCanceledException` с совпадающим токеном → `Canceled`.
   Ожидание Canceled-задачи → `TaskCanceledException` (в `AggregateException` при `Wait`),
   `Task.Exception == null` (успех, не сбой). Linked tokens — `CreateLinkedTokenSource`
   (объединить несколько токенов; linked CTS тоже `Dispose`). [exc:F21, exc:F23, exc:F20]

**Красные флаги / мифы**: M-cancel-2 (отмена убивает поток как Thread.Abort), M-cancel-3
(CancellationToken сам прерывает синхронный код), M-cancel-10 (cts.Cancel() бросает
исключение на потоке-запросчике), M-cancel-4/M-cancel-11 (return = Canceled;
отменённая = Faulted), M-token-12 (CancellationToken — reference type) — см. сквозной реестр.

---

## S2.9 — Async streams (IAsyncEnumerable, await foreach, cancellation, ConfigureAwait)

**Первоисточники**:
- Generate and consume async streams (tutorial): https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream
- `await` operator (await foreach/using): https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await

**Топ-6 «обязано быть в уроке»** (ref → GT-m4-streams-statemachine.md):
1. **Async-стрим = метод с ТРЕМЯ признаками**: `async`-модификатор + `yield return` +
   возврат `IAsyncEnumerable<T>`; потребляется через `await foreach`. Сигнатура:
   `async IAsyncEnumerable<T> ...`. [str:F9]
2. **Три интерфейса, версии**: `IAsyncEnumerable<T>`, `IAsyncEnumerator<T>`,
   `IAsyncDisposable` — добавлены в .NET Standard 2.1, реализованы в .NET Core 3.0
   (аналоги синхронных `IEnumerable<T>`/`IEnumerator<T>`/`IDisposable`). [str:F10]
3. **`await foreach` десугарится** в `GetAsyncEnumerator()` + `while(await MoveNextAsync())`
   + `await DisposeAsync()` в `finally` (`IAsyncEnumerator<T>` наследует `IAsyncDisposable`).
   [str:F11]
4. **Ленивость / on-demand**: элементы отдаются по мере готовности, не буферизуются целиком;
   можно читать «never ending streams» (`MoveNextAsync` отдаёт следующий, как только он
   доступен). Это то, что `Task<IEnumerable<T>>` не может — он ждёт ВСЮ коллекцию. [str:F12,
   str:F16]
5. **Cancellation стрима**: `[EnumeratorCancellation]` на параметре `CancellationToken`
   генератора + `WithCancellation(token)` при потреблении (`await foreach (var x in
   src.WithCancellation(t))`). Атрибут делает токен из `GetAsyncEnumerator` видимым телу
   итератора. [str:F14]
6. **`ConfigureAwait` для стрима — это НЕ `Task.ConfigureAwait`**: по умолчанию элементы
   обрабатываются в захваченном контексте; отключается расширением
   `TaskAsyncEnumerableExtensions.ConfigureAwait` НАД `IAsyncEnumerable<T>`. `ValueTask` в
   интерфейсах стрима (`MoveNextAsync()` → `ValueTask<bool>`) — ради перфа. [str:F15, str:F13]

**Красные флаги / мифы**: M-stream-13 (async-стрим буферизует всю последовательность),
M-stream-14 (await foreach — синхронный foreach над Task-ами / нужен Task<IEnumerable>),
M-stream-15 (ConfigureAwait для стрима == Task.ConfigureAwait) — см. сквозной реестр.

---

## Машинная панель (сигнатурный «уровень ниже», опционально к урокам S2.1/S2.6)

**Первоисточники**: TAP model (S3), Async scenarios (S4), `IAsyncStateMachine` API (S7),
Roslyn design doc task-types (S8) — см. GT-m4-streams-statemachine.md §«Провенанс машинной
панели».

**Ключевые факты** (ref → GT-m4-streams-statemachine.md):
- Компилятор трансформирует async-метод в state machine [str:F17]; `await` — точка
  приостановки, метод возобновляется в ТОМ ЖЕ методе (continuation), стек не разматывается
  [str:F18]; тип реализует `IAsyncStateMachine`, ключевой метод `MoveNext()` («для
  компилятора») [str:F19]; контракт method builder-а (`Create`/`Start`/`SetResult`/
  `SetException`/`AwaitOnCompleted`/`AwaitUnsafeOnCompleted`/`Task`) [str:F20].
- **ПРОВЕНАНС ЧЕСТНО**: точное имя поля `<>1__state` / `<>t__builder` и дословный
  emit-шаблон `MoveNext` Learn НЕ публикует — если урок печатает эти имена/скелет,
  помечать источник как «Roslyn-generated / декомпиляция (sharplab.io / ILSpy)»,
  уверенность «средняя», как иллюстрацию, а НЕ как Learn-факт. Рекомендация builder-у:
  приложить СПАЙК sharplab (реальный декомпилированный `MoveNext`), не рисовать из памяти.
  [str:F21], §7 GT-файла.

**Красные флаги / мифы**: M-async-1/M-async-2 (каждый await = новый поток), M-sm-6
(await разматывает стек / finally при приостановке) — см. сквозной реестр.

---

## СКВОЗНОЙ РЕЕСТР МИФОВ async (агрегат из 4 GT-файлов — главный артефакт для G7)

Async-мифы повторяются между темами; здесь единый дедуплицированный список «мисконцепция →
опровержение → источник (URL + ссылка на дословную цитату в GT-файле)». **Любой из этих
мифов в тексте урока = провал G7.** Колонка «темы» — где миф наиболее вероятен.

### Группа A — потоки/параллелизм/асинхронность

**M-async-1. «`async` делает код параллельным / async = многопоточность».** НЕВЕРНО.
Асинхронность ≠ параллелизм; один поток может вести все задачи (breakfast-аналогия).
Параллелизм требует нескольких потоков. Более того, даже конкурентности не будет, если
`await` стоит сразу после старта каждой задачи. Темы: S2.1, S2.2, машинная панель.
Источник: `.../asynchronous-programming/` [tap:M1], [str:M1].

**M-async-2. «`await` создаёт поток / async требует многопоточности».** НЕВЕРНО.
`async`/`await` НЕ создают потоков; async-метод не выполняется на своём потоке; `await` не
блокирует текущий поток — регистрирует остаток метода как continuation и возвращает
управление. Темы: S2.1, S2.3, машинная панель.
Источник: `.../task-asynchronous-programming-model` (Threads) [tap:M2], [str:F22, str:M1].

**M-async-3. «`Task.Run` ускоряет I/O».** НЕВЕРНО. `Task.Run` переносит CPU-bound работу на
фоновый поток, но фоновый поток НЕ помогает процессу, который просто ждёт результата (I/O).
Для I/O-bound — `await` без `Task.Run`. Темы: S2.3.
Источник: `.../task-asynchronous-programming-model` + `.../async-scenarios` (таблица) [tap:M3].

**M-async-5. «`async` без `await` всё равно работает асинхронно».** НЕВЕРНО. Без
`await`-точки приостановки метод исполняется как синхронный (несмотря на `async`);
компилятор выдаёт предупреждение; сгенерированная стейт-машина ничего не даёт. Темы: S2.1.
Источник: `.../task-asynchronous-programming-model` + `.../async-scenarios` [tap:M5].

**M-async-9. «Метод, помеченный `async`, обязательно исполняется асинхронно / на другом
потоке».** НЕВЕРНО. Без incomplete awaitable метод завершается СИНХРОННО и может вернуть
уже-завершённую таску; без `await` вовсе — исполняется как синхронный + warning. Темы:
S2.1, S2.6. Источник: TAP overview + `async` keyword [str:M9], [str:F8, str:F5].

### Группа B — исключения / блокировка / async void

**M-exc-1. «`await` бросает `AggregateException`».** НЕВЕРНО. `AggregateException`
оборачивают синхронные `Task.Wait()`/`Task.Result`/`Task.WaitAll` (даже одно исключение).
`await task` и `task.GetAwaiter().GetResult()` разворачивают и бросают САМО (первое)
внутреннее исключение — «AggregateException cannot be explicitly caught when using
`await task`». Следствие для `WhenAll`: `await` бросит лишь первое, остальные — в
`Task.Exception.InnerExceptions`. Темы: S2.2, S2.7. Два канала.
Источник: `.../exception-handling-task-parallel-library` + `.../task-cancellation`
[exc:M1], [exc:F6, exc:F2, exc:F3].

**M-void-4. «`async void` == `async Task`, только имя короче».** НЕВЕРНО. `async void`
НЕЛЬЗЯ await; вызывающий не может отследить завершение; исключения не ловятся вызывающим и
обрушивают приложение (уходят на `SynchronizationContext`); труден для тестирования. У
`async Task` исключение сохраняется в задаче и перебрасывается при `await`. `async void`
оправдан ТОЛЬКО как обработчик события. Темы: S2.1, S2.4, S2.7.
Источник: `.../async-return-types` + `.../task-asynchronous-programming-model`
(+ common-async-bugs, ai, 2-й канал) [rt:M4], [tap:M4], [exc:F12].

**M-block-6. «Блокировать задачу (`.Result`/`.Wait`) — безопасно».** НЕВЕРНО. Синхронная
блокировка на async-операции может вести к ДЕДЛОКАМ (особенно на single-threaded
`SynchronizationContext`) и её следует избегать; `.Wait()`/`.Result` дополнительно
оборачивают исключение в `AggregateException`. Предпочтительно `async`/`await` по всему
стеку; вынужденно — `GetAwaiter().GetResult()`. `Task<T>.Result` — блокирующее свойство.
Темы: S2.2, S2.4, S2.7. Источник: `.../async-scenarios` (Warning) + `.../async-return-types`
[tap:M6], [rt:F3, rt:M6].

**M-exc-5. «Исключение из async/TAP-метода вылетает синхронно на месте вызова».** НЕВЕРНО
(кроме usage-ошибок). Ошибки складываются В таску и всплывают на `await`; синхронно
бросаются только usage-ошибки (напр. `ArgumentNullException`). Темы: S2.6, S2.7.
Источник: TAP overview [str:M5], [str:F6].

### Группа C — ValueTask

**M-vt-7. «`ValueTask` всегда быстрее `Task` / всегда лучше».** ЛОЖНО. Дефолт —
`Task`/`Task<T>`; `ValueTask` — ТОЛЬКО когда анализ перфа доказал. ValueTask — struct с
несколькими полями: возврат копирует больше данных, стейт-машина await-ящего метода
больше; non-generic `ValueTask` «not recommended for most scenarios»; вне «await
результата» добавляет аллокации через `AsTask`. Темы: S2.3, S2.5.
Источник: `.../api/system.threading.tasks.valuetask-1` [rt:M1], [rt:F10, rt:F14, rt:F16].

**M-vt-8. «`ValueTask` можно await несколько раз / потреблять повторно».** ЛОЖНО. Await
РОВНО один раз; запрещено: await дважды, `AsTask` дважды, `.Result`/`.GetResult()` до
завершения/повторно, комбинировать способы — иначе UNDEFINED. Нужен повтор — `AsTask()`/
`Preserve()`. Темы: S2.5. Источник: `.../api/system.threading.tasks.valuetask-1` (+ non-
generic) [rt:M2], [rt:F12, rt:F13].

**M-vt-9. «`ValueTask.Result` можно читать сразу, как у `Task`».** ЛОЖНО. Потребители не
могут читать `Result`(generic)/`GetAwaiter()`(non-generic) ДО завершения; до завершения —
UNDEFINED (у `Task<T>` до завершения — блокирующий, но определённый). Темы: S2.5.
Источник: `.../api/system.threading.tasks.valuetask-1` + non-generic [rt:M3], [rt:F12, rt:F13].

**M-block-3. «`Task<T>.Result` — безопасный способ получить значение».** ЛОЖНО/опасно.
`Result` — блокирующее свойство; блокировка на async-коде даёт DEADLOCK. Брать через
`await`. Темы: S2.4. (Пересекается с M-block-6.) Источник: `.../async-return-types`
[rt:M6], [rt:F3].

### Группа D — отмена

**M-cancel-2. «Отмена убивает/прерывает поток (как `Thread.Abort`)».** ЛОЖНО. Модель
КООПЕРАТИВНА: «Cancellation is cooperative and is not forced on the listener». Запрос лишь
ставит `IsCancellationRequested`; слушатель сам «gracefully terminate», может обработать
ещё элементы. Темы: S2.8. Источник: `.../cancellation-in-managed-threads` + `.../task-
cancellation` [exc:M2], [exc:F13, exc:F24].

**M-cancel-3. «`CancellationToken` сам прерывает синхронный код».** ЛОЖНО. Токен ничего не
прерывает — слушатель ОБЯЗАН опрашивать / регистрировать колбэк / ждать на wait handle и
сам звать `ThrowIfCancellationRequested`. Без явной проверки длинный синхронный цикл
продолжит выполняться. Темы: S2.8. Источник: `.../cancellation-in-managed-threads`
[exc:M3], [exc:F18, exc:F19, exc:F13].

**M-cancel-10. «`cts.Cancel()` бросает исключение на потоке, который запросил отмену».**
ЛОЖНО. Запрос и прослушивание разделены; `Cancel()` лишь уведомляет копии токена;
`OperationCanceledException` возникает на потоке СЛУШАТЕЛЯ при `ThrowIfCancellationRequested`,
а на запрашивающем — только если он ОЖИДАЕТ задачу (`await`/`Wait`). Темы: S2.8.
Источник: `.../cancellation-in-managed-threads` + `.../task-cancellation` [exc:M4].

**M-cancel-4. «Отменённая операция бросает исключение из самого метода / `return` из
делегата = статус `Canceled`».** ЛОЖНО. Таска завершается в `Canceled` без исключения из
метода; исключение (`OperationCanceledException`) получает лишь тот, кто `await`-ит. Просто
`return` из делегата → `RanToCompletion`, НЕ `Canceled`; для `Canceled` нужно бросить
`OperationCanceledException` с совпадающим токеном (через `ThrowIfCancellationRequested`).
Темы: S2.6, S2.8. Источник: TAP overview + `.../task-cancellation` [str:M4], [exc:M5],
[str:F7], [exc:F21, exc:F22].

**M-cancel-11. «Отменённая задача = упавшая (Faulted), `Task.Exception` содержит
исключение».** ЛОЖНО. Корректная отмена (совпадающий токен) → `Canceled`, это успех:
`Task.Exception == null`. В `Faulted` — только если токен НЕ совпал / запроса не было /
иное исключение. Темы: S2.8. Источник: `.../task-cancellation` [exc:M6], [exc:F23, exc:F22].

**M-token-12. «`CancellationToken` — reference type / класс».** ЛОЖНО. `CancellationToken`
— «Lightweight value type»; управляющий владелец — `CancellationTokenSource` (class,
`IDisposable`); токен копируется по значению. Темы: S2.8.
Источник: `.../cancellation-in-managed-threads` [exc:M7], [exc:F14].

### Группа E — async streams / state machine

**M-stream-13. «Async-стрим буферизует всю последовательность, прежде чем отдать».**
НЕВЕРНО. Элементы отдаются on-demand («enumerated as soon as it's available»), можно
читать «never ending streams». Ленивость — суть отличия от `Task<IEnumerable<T>>`. Темы:
S2.9. Источник: `.../generate-consume-asynchronous-stream` [str:M2], [str:F12, str:F16].

**M-stream-14. «`await foreach` — это синхронный `foreach` над `Task`-ами / нужен
`Task<IEnumerable<T>>`».** НЕВЕРНО. Десугарится в `GetAsyncEnumerator` + `MoveNextAsync` +
`DisposeAsync`; `Task<IEnumerable<T>>` ждёт всю коллекцию, `IAsyncEnumerable<T>` отдаёт
поэлементно. Темы: S2.9. Источник: `.../generate-consume-asynchronous-stream` [str:M7],
[str:F11, str:F16].

**M-stream-15. «`ConfigureAwait(false)` для async-стрима — это `Task.ConfigureAwait`».**
НЕВЕРНО (нюанс). Для стрима — расширение `TaskAsyncEnumerableExtensions.ConfigureAwait` над
`IAsyncEnumerable<T>`, применяемое к операнду `await foreach`. Темы: S2.9.
Источник: `.../generate-consume-asynchronous-stream` [str:M8], [str:F15].

**M-tap-3. «Таску из async-метода / TAP-метода надо стартовать (`Start()`)».** НЕВЕРНО.
TAP-таски горячие; `Start()` на активной таске → `InvalidOperationException`. Темы: S2.6.
Источник: TAP overview [str:M3], [str:F1].

**M-sm-6. «`await` разматывает стек / это `return`, и `finally` отрабатывает при
приостановке».** НЕВЕРНО. Приостановка на `await` — НЕ выход из метода (регистрация
continuation), `finally` при приостановке не выполняется. Темы: S2.1, S2.7, машинная
панель. Источник: `.../task-asynchronous-programming-model` [str:M6], [str:F18], [tap:F5],
[exc:F11].

**Итого мифов: 24** (после дедупликации; в 4 GT-файлах суммарно 28 записей M#, из них
слиты дубликаты: async≠потоки, async void, .Result/deadlock, await≠AggregateException,
отмена-кооперативна фигурировали в нескольких файлах). Группировка A–E облегчает
evaluator-у выбор релевантных мифов под тему урока.

---

## Реестр покрытия (закрытый корпус: 9 тем уроков S2)

| # | Тема урока | GT-файл (первоисточник) | Топ-6 фактов | Мифы (группы) |
|---|-----------|-------------------------|--------------|----------------|
| S2.1 | TAP-модель (что это, async/await, state machine) | tap-model, streams-sm | tap:F1–F7, str:F17 | A: 1,2,5; E: sm-6 |
| S2.2 | Обзор / композиция / WhenAll·WhenAny | tap-model | tap:F8–F14 | A:1; B:exc-1; B:block-6 |
| S2.3 | I/O-bound vs CPU-bound (Task.Run) | tap-model | tap:F15–F18 | A:3; A:2 |
| S2.4 | Async return types | return-types | rt:F1–F8 | B:void-4; C:block-3 |
| S2.5 | ValueTask / ограничения | return-types | rt:F9–F18 | C:vt-7,8,9 |
| S2.6 | TAP-контракт изнутри (hot/cold, статусы) | streams-sm | str:F1–F8 | E:tap-3; D:cancel-4; B:exc-5; A:async-9 |
| S2.7 | Исключения (AggregateException vs await) | exceptions-cancel | exc:F1–F12 | B:exc-1; B:void-4; B:block-6 |
| S2.8 | Cancellation (CancellationToken, linked) | exceptions-cancel | exc:F13–F24 | D:cancel-2,3,4,10,11; D:token-12 |
| S2.9 | Async streams (IAsyncEnumerable) | streams-sm | str:F9–F16 | E:stream-13,14,15 |
| (доп.) | Машинная панель (уровень ниже) | streams-sm | str:F17–F22 | A:1,2; E:sm-6 |

**Критерий остановки (закрытый корпус)**: все 9 тем уроков S2 закрыты ≥1 источником класса
A из 4 предварительно собранных FROZEN GT-файлов; для каждой темы выведены топ-6 «обязано
быть» + релевантные мифы. Формула насыщения открытого корпуса не применяется (корпус
закрыт списком тем модуля M4). **Итог агрегата: 9 тем × топ-6 фактов = 54 обязательных
факта (со ссылками на F# в GT-файлах) + 24 дедуплицированных мифа (группы A–E).**

## Противоречия источников

Прямых противоречий между 4 GT-файлами не обнаружено (один издатель `dotnet/docs`,
согласовано by design; ai-assisted страницы использованы лишь как 2-й канал и не
противоречат не-ai). Единственный нюанс: качественное утверждение «компилятор оптимизирует
`async`/`await` лучше ручных `ContinueWith`-цепочек» (S2 tap-model) — БЕЗ бенчмарка на
странице → в уроки как перф-факт НЕ брать (уверенность низкая), как мотивацию читаемости —
можно.

## Что не удалось довести до первички (границы для evaluator-а)

1. **`Task.WhenAll` — дословной фразы «при await бросается ТОЛЬКО первое исключение,
   остальные в `task.Exception.InnerExceptions`» на 4 страницах НЕТ** — вывод из общей
   механики await/Exception (exc:F6 + exc:F4). Если уроку нужна дословная первичка про
   WhenAll — добрать `.../api/system.threading.tasks.task.whenall` (remarks) отдельным
   прогоном. [exc §Что не удалось]
2. **Дословный emit-шаблон `MoveNext` и точные имена `<>1__state`/`<>t__builder`** Learn/
   Roslyn design НЕ печатают — брать из декомпиляции (sharplab.io / ILSpy), помечая канал
   как «Roslyn-generated, декомпиляция», уверенность «средняя». Рекомендация builder-у —
   СПАЙК sharplab. [str §7]
3. **M-async-9 / часть механики «async ≠ фоновый поток»** имеет дословный источник в т.ч.
   на ai-assisted common-async-bugs (rt:M5) — но факт продублирован не-ai страницами
   (str:F8, str:F22), потому уверенность высокая.
4. Точные числовые пороги «когда ValueTask окупается», тайминги state-machine,
   `ExceptionDispatchInfo`, полный emit-контракт async-ИТЕРАТОРА
   (`AsyncIteratorMethodBuilder`) — вне скоупа S2, на страницах даны качественно/тезисно.

---

## Инструкция evaluator-у (гейт G7, trace-to-original)

**Что делает G7 для модуля M4**: аудит выборки уроков S2 — для каждого урока выборки
подтвердить, что его факты прослеживаются до первички класса A и что урок не содержит
мифов. Бар прохождения: **0 утверждений, не подтверждённых источником; 0 мифов из
сквозного реестра**.

**Процедура на каждый урок выборки**:
1. Определи тему урока (S2.1–S2.9) → открой соответствующий раздел этого файла → получи
   список URL первоисточников и «топ-6 обязано быть».
2. **Fetch первоисточник(и) темы** (предпочтительно MCP `microsoft_docs_fetch` по URL из
   раздела; при недоступности — `WebFetch` тех же URL: корпус идентичен нормативному, это
   отклонение транспорта, не источника). НЕ проверять по памяти модели (п.3b).
3. **Сверка фактов**: ≥3 из «топ-6 обязательных» фактов темы должны присутствовать в уроке
   и быть сформулированы верно (проверять по дословной цитате в GT-файле темы через ссылку
   `[xxx:F#]`). Отсутствие обязательного факта или искажение = замечание.
4. **Сверка мифов**: пройди мифы, помеченные для темы урока (колонка «Мифы» в реестре
   покрытия + группы A–E). Наличие ЛЮБОГО мифа в тексте урока (как утверждение, не как
   явно разбираемая «мисконцепция vs истина») = ПРОВАЛ G7.
5. **Провенанс машинной панели**: если урок печатает `<>1__state`/`<>t__builder` или
   emit-скелет `MoveNext` — проверь, что источник помечен как «Roslyn-generated /
   декомпиляция (sharplab/ILSpy)», а НЕ как Learn-факт, и что приложен спайк (§7). Иначе —
   замечание «провенанс машинной панели».
6. **Числа/stdout exec-карточек**: любые числа/вывод в уроке должны быть из реально
   исполненного кода через G-EXEC (`/api/authoring/run-csharp`), не display-only и не из
   памяти. Display-only «результат» = замечание (инвариант «готово только с исполняемым
   доказательством»).
7. **Перф-утверждения без бенчмарка** (напр. «async/await быстрее ContinueWith») в уроке —
   замечание, если поданы как факт без замера (см. §Противоречия).

**Приоритетные «aha»-различения, которые урок ОБЯЗАН передать верно** (частые точки
провала):
- S2.7: синхронное ожидание (`Wait`/`Result`/`WaitAll`) → `AggregateException`; `await` →
  развёрнутое (первое) исключение (M-exc-1).
- S2.8: отмена КООПЕРАТИВНА (слушатель обязан проверять), `return` ≠ `Canceled`, сверка
  токена решает Canceled vs Faulted (M-cancel-2/3/4/11).
- S2.3: `Task.Run` — для CPU-bound, НЕ для I/O (M-async-3).
- S2.5: дефолт = `Task`; ValueTask await ровно раз (M-vt-7/8).
- S2.1/машинная панель: `async`/`await` НЕ создают потоков (M-async-1/2).

**SAFETY-флаг**: не выставлен — тема техническая (не мед/юр/фин). Human-in-loop по
существу контента не требуется; но каждое утверждение урока должно сохранять привязку к
цитате первички через этот GT-файл.
