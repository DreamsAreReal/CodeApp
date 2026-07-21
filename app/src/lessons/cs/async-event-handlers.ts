/**
 * Lesson: Async event handlers (CS.S4.async-event-handlers) — expert density, 6 animated
 * deep-dives. Event handlers must return void, so an asynchronous handler is the one legitimate
 * `async void`: you cannot return Task from a handler. That forces `async void`, whose failure
 * mode is severe — an exception that escapes an async void is NOT caught by the code that raised
 * the event; it is posted to the SynchronizationContext / thread pool and, unhandled, CRASHES
 * the process. Hence two rules: return `async void` ONLY from event handlers, and make an async
 * handler catch its OWN exceptions internally. Raising an event does not await the handler:
 * Click() returns at the handler's first await, so the handler is effectively fire-and-forget.
 *
 * SIGNATURE machine panel (s5): raising an event returns BEFORE the async handler finishes —
 * Click() prints "Click returned" first, the awaited handler resumes and prints after. And an
 * async void that catches its own exception is safe; one that lets an exception escape a
 * background continuation tears down the process (a MEASURED sandbox observation — that exact
 * pattern crashed the run-csharp host, which is precisely the danger the docs warn about; it is
 * therefore NOT shipped as a runnable card). REAL run-csharp measurement (this file's exec
 * cards): c1 caught: boom / after; c2 handler caught: boom / done; c3 Click returned / async
 * handler ran / handler finished.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the EXACT page in sources[] (fetched + substring-
 *     checked 2026-07-21):
 *       · async-scenarios (ms-async-void): the "Event handlers must declare void return types
 *         and can't use or return Task and Task<T>…", "you need to use the async modifier on a
 *         void returning method for the handlers", the three async-void challenge bullets, and
 *         the async-lambda-in-LINQ deferred-execution / deadlock caution;
 *       · asynchronous-programming index (ms-async): the TAP-model / await-nonblocking clauses.
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app
 *     backend (c1: caught: boom / after · c2: handler caught: boom / done · c3: Click returned /
 *     async handler ran / handler finished);
 *   - the s5 machine-panel ordering + the "uncaught async void crashes the host" fact are OWN
 *     measurements of the run-csharp endpoint.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.async-event-handlers/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: a handler must return void — so async handler = async void.
const Z_CONTRACT: Zone = { id: "contract", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОНТРАКТ ОБРАБОТЧИКА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "void (object, EventArgs)", subCls: "vz-zsub", subY: 47 };
const Z_ASYNCVOID: Zone = { id: "av", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "async void", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "единственный законный", subCls: "vz-zsub heap", subY: 47 };
const CONTRACT_ZONES: Zone[] = [Z_CONTRACT, Z_ASYNCVOID];

// s2: async Task exception is caught by the awaiter.
const Z_AWAITED: Zone = { id: "awaited", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "await Boom()", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "async Task", subCls: "vz-zsub good", subY: 47 };
const Z_CATCH: Zone = { id: "catch", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "try/catch ВОКРУГ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "ловит исключение", subCls: "vz-zsub", subY: 47 };
const TASK_ZONES: Zone[] = [Z_AWAITED, Z_CATCH];

// s3: async void exception escapes the caller's try/catch.
const Z_VOIDCALL: Zone = { id: "voidcall", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "async void бросает", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "после await", subCls: "vz-zsub", subY: 47 };
const Z_ESCAPE: Zone = { id: "escape", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "try/catch БЕССИЛЕН", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "→ падает процесс", subCls: "vz-zsub", subY: 47 };
const ESCAPE_ZONES: Zone[] = [Z_VOIDCALL, Z_ESCAPE];

// s4: the safe pattern — the handler catches its own exceptions.
const Z_HANDLER: Zone = { id: "handler", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "async void OnClick", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "try внутри обработчика", subCls: "vz-zsub good", subY: 47 };
const Z_INTERNAL: Zone = { id: "internal", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "catch ВНУТРИ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "исключение не утекает", subCls: "vz-zsub good", subY: 47 };
const SAFE_ZONES: Zone[] = [Z_HANDLER, Z_INTERNAL];

// s5 (SIGNATURE): raising returns before the async handler finishes.
const Z_RAISE: Zone = { id: "raise", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "b.Click()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "поднимает событие", subCls: "vz-zsub", subY: 47 };
const Z_TIMELINE: Zone = { id: "tl", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПОРЯДОК ВО ВРЕМЕНИ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "handler завершится позже", subCls: "vz-zsub heap", subY: 47 };
const ORDER_ZONES: Zone[] = [Z_RAISE, Z_TIMELINE];

// s6: async lambdas in LINQ — deferred execution + deadlock caution.
const Z_LINQ: Zone = { id: "linq", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "async λ в LINQ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "deferred execution", subCls: "vz-zsub", subY: 47 };
const Z_TRAP: Zone = { id: "trap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЛОВУШКА", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "неожиданное время + deadlock", subCls: "vz-zsub", subY: 47 };
const LINQ_ZONES: Zone[] = [Z_LINQ, Z_TRAP];

export const asyncEventHandlers: LessonData = {
  id: "CS.S4.async-event-handlers",
  track: "CS",
  section: "CS.S4",
  module: "S4.7",
  lang: "csharp",
  title: "Async event handlers: async void и его ловушки",
  kicker: "C# вглубь · S4 · async void",
  home: { subtitle: "async void только для обработчиков, исключения, fire-and-forget, async-λ в LINQ", icon: "async", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-async-void", kind: "doc", org: "Microsoft Learn", title: "Asynchronous programming scenarios (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios", date: "2024-11-20" },
    { id: "ms-async", kind: "doc", org: "Microsoft Learn", title: "Asynchronous programming (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/", date: "2023-03-14" },
  ],

  spec: [
    { text: "«Event handlers must declare <code>void</code> return types and can't use or return <code>Task</code> and <code>Task&lt;T&gt;</code> objects as other methods do.»", source: "ms-async-void" },
  ],
  edgeCases: [
    { text: "Исключение из <code>async void</code> не поймать снаружи: «Exceptions thrown in an <code>async void</code> method <b>can't be caught outside of that method</b>» — реальный прогон: незакрытое исключение из async void <b>роняет процесс</b>.", source: "ms-async-void" },
    { text: "<code>async void</code> трудно тестировать: «<code>async void</code> methods are difficult to test».", source: "ms-async-void" },
    { text: "<code>async void</code> может дать скрытые эффекты: «<code>async void</code> methods can cause negative side effects if the caller isn't expecting them to be asynchronous».", source: "ms-async-void" },
  ],

  misconceptions: [
    {
      wrong: "async void — это просто async-метод без результата, использовать его можно везде",
      hook: '<code>async void</code> — это <b>не</b> «async без результата»; это опасная форма, законная лишь в одном месте — в обработчике события. «<span class="hl">Return \'async void\' only from event handlers</span>». Причина — контракт обработчика: «Event handlers must declare <code>void</code> return types and can\'t use or return <code>Task</code> and <code>Task&lt;T&gt;</code> objects as other methods do. When you write asynchronous event handlers, you need to use the <code>async</code> modifier on a <code>void</code> returning method for the handlers». А цена — исключения: «Exceptions thrown in an <code>async void</code> method <b>can\'t be caught outside of that method</b>» (реальный прогон: незакрытое исключение из async void роняет процесс). Дальше <b>шесть разборов</b>: контракт void, ловля исключения у <code>async Task</code>, утечка исключения у <code>async void</code>, безопасный паттерн (catch внутри), <b>машинная панель</b> — raise возвращается <b>до</b> завершения async-обработчика (реальный прогон), и ловушка async-лямбд в LINQ.',
      source: "ms-async-void",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Контракт · handler = void", title: "Обработчик обязан вернуть void — потому async void",
      viewBox: "0 0 340 210", zones: CONTRACT_ZONES,
      code: ["// делегат EventHandler: void (object? sender, EventArgs e)", "b.Clicked += async (s, e) => {   // async + void", "    await LoadAsync();           // внутри можно await", "};   // вернуть Task нельзя — сигнатура требует void"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Делегат <code>EventHandler</code> требует <span class="hl">void</span>-возврат. Обработчик <b>не может</b> вернуть <code>Task</code> — сигнатура это запрещает.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "EventHandler", value: "→ void", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Но обработчику нужен <code>await</code>. Единственный выход — <code>async</code> поверх <b>void</b>-метода: получается <code>async void</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "EventHandler", value: "→ void" }, { id: "av", kind: "gate", at: { zone: "av", row: 0 }, state: "ok", label: "async void", detail: "await внутри", accent: true }], edges: [{ id: "e", from: "c", to: "av", accent: true }] },
        { codeLine: 3, out: "", caption: 'Именно потому <code>async void</code> законен <span class="hl">только</span> для обработчиков: везде ещё нужно возвращать <code>Task</code>, чтобы вызывающий мог <code>await</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "EventHandler", value: "→ void" }, { id: "av", kind: "gate", at: { zone: "av", row: 0 }, state: "ok", label: "async void", detail: "только handler", accent: true }], edges: [] },
      ],
      explain: 'Обработчики событий — исключение из правила «async всегда возвращает Task». Дословно: «Event handlers must declare <code>void</code> return types and can\'t use or return <code>Task</code> and <code>Task&lt;T&gt;</code> objects as other methods do. When you write asynchronous event handlers, you need to use the <code>async</code> modifier on a <code>void</code> returning method for the handlers». Отсюда правило-заголовок из доков: «<b>Return \'async void\' only from event handlers</b>». Причина проста: делегат события (<code>EventHandler</code>) объявляет возврат <code>void</code>, а метод обязан иметь совместимый возврат — <code>Task</code> вернуть нельзя. Во всех прочих async-методах возвращают <code>Task</code>/<code>Task&lt;T&gt;</code>, чтобы вызывающий мог дождаться (<code>await</code>) и увидеть исключения. У <code>async void</code> этой ручки нет — что и создаёт ловушки следующих разборов.',
      sources: ["ms-async-void"],
    },
    {
      id: "s2", num: "02", kicker: "async Task · исключение ловится", title: "У async Task исключение ловит тот, кто await",
      viewBox: "0 0 340 210", zones: TASK_ZONES,
      code: ["async Task Boom() { await Task.Yield(); throw new InvalidOperationException(\"boom\"); }", "try { await Boom(); }", "catch (InvalidOperationException ex) { Console.WriteLine(\"caught: \" + ex.Message); }", "Console.WriteLine(\"after\");"],
      predictAt: 2, predictQ: 'Метод <code>async Task Boom()</code> бросает исключение. Ловит ли его <code>try { await Boom(); } catch</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>async Task Boom()</code> после <code>await</code> бросает исключение. Task <b>запоминает</b> его как faulted-результат.', nodes: [{ id: "b", kind: "obj", at: { zone: "awaited", row: 0 }, typeTag: "async Task", value: "throw boom", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>await Boom()</code> <span class="hl">разворачивает</span> сохранённое исключение обратно в вызывающий код — прямо в точке <code>await</code>.', nodes: [{ id: "b", kind: "obj", at: { zone: "awaited", row: 0 }, typeTag: "async Task", value: "faulted" }, { id: "c", kind: "gate", at: { zone: "catch", row: 0 }, state: "ok", label: "await → throw", detail: "в caller", accent: true }], edges: [{ id: "e", from: "b", to: "c", accent: true }] },
        { codeLine: 2, out: "caught: boom\nafter", caption: '<code>catch</code> вокруг <code>await</code> <span class="hl">ловит</span> исключение → <code>caught: boom</code>, затем <code>after</code> (реальный прогон). Так работает нормальный async.', nodes: [{ id: "b", kind: "obj", at: { zone: "awaited", row: 0 }, typeTag: "async Task", value: "faulted" }, { id: "c", kind: "obj", at: { zone: "catch", row: 0 }, typeTag: "catch", value: "поймал boom", accent: true }], edges: [] },
      ],
      explain: 'Нормальный async-метод возвращает <code>Task</code>, и <code>await</code> — та самая ручка, что доставляет исключение вызывающему. Модель TAP строит код как последовательность, где <code>await</code> «продолжает исполнение по завершении задачи»: «The <code>await</code> keyword provides a <b>nonblocking</b> way to start a task, then continue execution when the task completes». Исключение из <code>async Task</code> сохраняется в задаче и <b>перевыбрасывается</b> в точке <code>await</code> — поэтому обычный <code>try/catch</code> вокруг <code>await Boom()</code> его ловит (реальный прогон: <code>caught: boom</code>, затем <code>after</code>). Это контраст к следующему разбору: у <code>async void</code> задачи нет, ждать нечего — и ловить исключение вызывающему нечем.',
      sources: ["ms-async", "ms-async-void"],
    },
    {
      id: "s3", num: "03", kicker: "async void · исключение утекает", title: "У async void исключение не поймать снаружи — процесс падает",
      viewBox: "0 0 340 210", zones: ESCAPE_ZONES,
      code: ["async void FireAndForget() { await Task.Yield(); throw new InvalidOperationException(\"boom\"); }", "try { FireAndForget(); }         // возвращает СРАЗУ (на первом await)", "catch { /* сюда исключение НЕ придёт */ }", "// исключение постится в контекст → unhandled → падение процесса"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>FireAndForget()</code> — <code>async void</code>: на первом <code>await</code> он <span class="hl">возвращает управление</span>. <code>try</code> уже завершился успешно, до <code>throw</code> дело не дошло.', nodes: [{ id: "call", kind: "obj", at: { zone: "voidcall", row: 0 }, typeTag: "async void", value: "return на await", accent: true }, { id: "esc", kind: "gate", at: { zone: "escape", row: 0 }, state: "ok", label: "try прошёл", detail: "нет исключения" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Позже <code>throw</code> срабатывает в <b>продолжении</b> — но задачи, которую можно было бы <code>await</code>, <span class="hl">нет</span>. Ловить исключение вызывающему нечем.', nodes: [{ id: "call", kind: "obj", at: { zone: "voidcall", row: 0 }, typeTag: "async void", value: "throw позже" }, { id: "esc", kind: "gate", at: { zone: "escape", row: 0 }, state: "fail", label: "catch бессилен", detail: "нет Task", accent: true }], edges: [{ id: "e", from: "call", to: "esc", accent: true }] },
        { codeLine: 3, out: "", caption: 'Исключение постится в <code>SynchronizationContext</code> / пул. Необработанное — <span class="hl">роняет процесс</span> (реальный прогон подтвердил: такой код завершил хост).', nodes: [{ id: "call", kind: "obj", at: { zone: "voidcall", row: 0 }, typeTag: "async void", value: "unhandled" }, { id: "esc", kind: "gate", at: { zone: "escape", row: 0 }, state: "fail", label: "процесс", detail: "падает", accent: true }], edges: [] },
      ],
      explain: 'Это ядро опасности <code>async void</code>: «Exceptions thrown in an <code>async void</code> method <span class="hl">can\'t be caught outside of that method</span>». Механика: <code>async void</code> не возвращает <code>Task</code>, поэтому на первом <code>await</code> он отдаёт управление вызывающему (<code>try</code> вокруг вызова успешно завершается ещё до <code>throw</code>). Когда исключение всё же возникает в продолжении, ждать/наблюдать его нечем — оно постится в <code>SynchronizationContext</code> (или на пул потоков) и, необработанное, <b>роняет процесс</b>. Собственное наблюдение прямо в этом окружении: код с незакрытым исключением из <code>async void</code> завершил backend-хост run-csharp — ровно то, о чём предупреждают доки. Поэтому: «<code>async void</code> methods can cause negative side effects if the caller isn\'t expecting them to be asynchronous».',
      sources: ["ms-async-void"],
    },
    {
      id: "s4", num: "04", kicker: "Безопасный паттерн · catch внутри", title: "Async-обработчик обязан ловить свои исключения сам",
      viewBox: "0 0 340 210", zones: SAFE_ZONES,
      code: ["async void OnClick(object s, EventArgs e) {", "    try { await LoadAsync(); throw new InvalidOperationException(\"boom\"); }", "    catch (Exception ex) { Console.WriteLine(\"handler caught: \" + ex.Message); }", "}   // исключение не утекает наружу"],
      predictAt: 3, predictQ: '<code>async void</code>, где <code>try/catch</code> <b>внутри</b> ловит своё исключение. Что напечатает вызов + завершение?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Раз исключение из <code>async void</code> не поймать снаружи — обработчик <span class="hl">оборачивает своё тело</span> в <code>try/catch</code> сам.', nodes: [{ id: "h", kind: "obj", at: { zone: "handler", row: 0 }, typeTag: "async void", value: "try { await… }", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>catch</code> <b>внутри</b> обработчика перехватывает исключение <span class="hl">до</span> того, как оно уйдёт в контекст. Процесс в безопасности.', nodes: [{ id: "h", kind: "obj", at: { zone: "handler", row: 0 }, typeTag: "async void", value: "try/catch" }, { id: "in", kind: "gate", at: { zone: "internal", row: 0 }, state: "ok", label: "catch внутри", detail: "поймал", accent: true }], edges: [{ id: "e", from: "h", to: "in", accent: true }] },
        { codeLine: 3, out: "handler caught: boom\ndone", caption: 'Реальный прогон: <span class="hl">handler caught: boom</span>, затем <code>done</code>. Исключение обработано <b>внутри</b> — никакого падения. Это обязательный паттерн для async-обработчиков.', nodes: [{ id: "h", kind: "obj", at: { zone: "handler", row: 0 }, typeTag: "async void", value: "safe" }, { id: "in", kind: "obj", at: { zone: "internal", row: 0 }, typeTag: "handled", value: "boom", accent: true }], edges: [] },
      ],
      explain: 'Практический вывод из невозможности поймать исключение снаружи: async-обработчик должен ловить свои исключения <b>внутри себя</b>. Раз «Exceptions thrown in an <code>async void</code> method can\'t be caught outside of that method», единственная безопасная стратегия — <code>try/catch</code> вокруг всего тела обработчика (или маршалинг ошибки в свой канал логирования/UI). Реальный прогон подтверждает: <code>async void</code> с внутренним <code>catch</code> печатает <code>handler caught: boom</code> и спокойно доходит до <code>done</code> — процесс жив. Сравните с разбором 03, где то же исключение <b>без</b> внутреннего <code>catch</code> уронило хост. Отсюда и мотив «трудно тестировать» — «<code>async void</code> methods are difficult to test»: у них нет <code>Task</code>, за который можно ухватиться в тесте, поэтому логику выносят в отдельный <code>async Task</code>-метод, а обработчик делают тонкой обёрткой.',
      sources: ["ms-async-void"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · порядок во времени", title: "Raise возвращается ДО завершения async-обработчика",
      viewBox: "0 0 340 210", zones: ORDER_ZONES,
      code: ["b.Clicked += async (s, e) => { await Task.Delay(10); Console.WriteLine(\"async handler ran\"); tcs.SetResult(); };", "b.Click();                       // поднимает событие", "Console.WriteLine(\"Click returned\");   // печатается ПЕРВЫМ", "await tcs.Task; Console.WriteLine(\"handler finished\");"],
      predictAt: 2, predictQ: 'Async-обработчик делает <code>await Task.Delay(10)</code>. Что напечатается раньше — <code>async handler ran</code> или <code>Click returned</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>b.Click()</code> поднимает событие → вызывает async-обработчик. Тот доходит до <code>await Task.Delay</code> и <span class="hl">возвращает управление</span> в <code>Click()</code>.', nodes: [{ id: "r", kind: "obj", at: { zone: "raise", row: 0 }, typeTag: "Click()", value: "→ handler", accent: true }, { id: "t1", kind: "chip", at: { zone: "tl", row: 0 }, value: "1. handler → await", w: 156 }], edges: [] },
        { codeLine: 2, out: "Click returned", caption: 'Раз обработчик — <code>async void</code>, <code>Click()</code> <b>не ждёт</b> его. Печатается <span class="hl">Click returned</span> — раньше, чем обработчик доработал.', nodes: [{ id: "r", kind: "obj", at: { zone: "raise", row: 0 }, typeTag: "Click()", value: "вернулся" }, { id: "t1", kind: "chip", at: { zone: "tl", row: 0 }, value: "1. handler → await", w: 156 }, { id: "t2", kind: "chip", at: { zone: "tl", row: 1 }, value: "2. Click returned", w: 156, accent: true }], edges: [] },
        { codeLine: 3, out: "Click returned\nasync handler ran\nhandler finished", caption: 'Позже <code>Delay</code> завершается, обработчик допечатывает <span class="hl">async handler ran</span>, и только потом — <code>handler finished</code> (реальный прогон). Обработчик — <b>fire-and-forget</b>.', nodes: [{ id: "r", kind: "obj", at: { zone: "raise", row: 0 }, typeTag: "порядок", value: "returned → ran → fin" }, { id: "t3", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "3. handler ran", detail: "позже", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятый порядок во времени. Поднятие события <b>не дожидается</b> async-обработчика: на первом <code>await</code> обработчик отдаёт управление, <code>Click()</code> завершается, и продолжение обработчика выполняется <b>позже</b>. Реальный прогон (детерминированно ×3): <code>Click returned</code> → <code>async handler ran</code> → <code>handler finished</code>. Практический смысл: издатель не знает и не контролирует, когда async-обработчик <b>реально</b> закончит — это fire-and-forget с точки зрения raise. Отсюда «<code>async void</code> methods can cause negative side effects if the caller isn\'t expecting them to be asynchronous»: код после raise выполняется, пока обработчик ещё «в полёте», и рассчитывать на его завершение сразу после <code>Click()</code> нельзя. Если нужно дождаться — применяют другие механизмы (например, async-совместимые паттерны событий), а не обычный <code>EventHandler</code>.',
      sources: ["ms-async-void"],
    },
    {
      id: "s6", num: "06", kicker: "Ловушка · async-λ в LINQ", title: "Async-лямбды в LINQ: отложенное выполнение и риск deadlock",
      viewBox: "0 0 340 210", zones: LINQ_ZONES,
      code: ["// осторожно: async-лямбда внутри LINQ", "var q = items.Select(async x => await ProcessAsync(x));", "// deferred execution: код побежит в НЕОЖИДАННЫЙ момент", "// блокирующее ожидание тут → возможен deadlock"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Async-лямбда в <code>Select</code> под <b>deferred execution</b>: сам <code>Select</code> ничего не выполняет — только <span class="hl">описывает</span> запрос.', nodes: [{ id: "l", kind: "obj", at: { zone: "linq", row: 0 }, typeTag: "Select(async λ)", value: "рецепт", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Код лямбды побежит <span class="hl">в неожиданный момент</span> — при перечислении, возможно далеко от места объявления. За async это трудно уследить.', nodes: [{ id: "l", kind: "obj", at: { zone: "linq", row: 0 }, typeTag: "deferred", value: "исполнится позже" }, { id: "t", kind: "gate", at: { zone: "trap", row: 0 }, state: "fail", label: "unexpected time", detail: "трудно понять", accent: true }], edges: [{ id: "e", from: "l", to: "t", accent: true }] },
        { codeLine: 3, out: "", caption: 'Ввод <b>блокирующего</b> ожидания в такой сценарий легко даёт <span class="hl">deadlock</span>. Async + LINQ — мощно, но требует аккуратности.', nodes: [{ id: "l", kind: "obj", at: { zone: "linq", row: 0 }, typeTag: "deferred", value: "async λ" }, { id: "t", kind: "gate", at: { zone: "trap", row: 0 }, state: "fail", label: "blocking wait", detail: "deadlock", accent: true }], edges: [] },
      ],
      explain: 'Финальная ловушка — async-лямбды в LINQ. Дословно: «It\'s important to use caution when you implement asynchronous lambdas in LINQ expressions. <b>Lambda expressions in LINQ use deferred execution, which means the code can execute at an unexpected time</b>. The introduction of blocking tasks into this scenario can easily result in a <span class="hl">deadlock</span>, if the code isn\'t written correctly. Moreover, the nesting of asynchronous code can also make it difficult to reason about the execution of the code». Две беды складываются: отложенное выполнение LINQ (запрос — рецепт, исполняется при перечислении, см. урок про deferred execution) плюс async-лямбда, чей тип возврата — <code>Task</code>/<code>async void</code> в неожиданном контексте. Итог доков трезвый: «Async and LINQ are powerful, but these techniques should be used together as carefully and clearly as possible». На практике: не прячьте <code>await</code> внутрь <code>Select</code>/<code>Where</code>; материализуйте данные и обрабатывайте их асинхронно явно.',
      sources: ["ms-async-void"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task Boom() { await Task.Yield(); throw new InvalidOperationException("boom"); } try { await Boom(); } catch (InvalidOperationException ex) { Console.WriteLine("caught: " + ex.Message); } Console.WriteLine("after");</code> — обе строки?',
      options: ["caught: boom\\nafter", "after", "boom\\nafter", "caught: boom"], correctIndex: 0, xp: 10,
      okText: 'У <code>async Task</code> исключение сохраняется в задаче и <b>перевыбрасывается на <code>await</code></b> — обычный <code>try/catch</code> его ловит: <span class="hl">caught: boom</span>, затем <code>after</code>.',
      noText: 'Нормальный async возвращает <code>Task</code>; <code>await</code> доставляет исключение в вызывающий код. <code>catch</code> ловит → <code>caught: boom</code>, потом <code>after</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "caught: boom\nafter" }, sourceRefs: ["ms-async", "ms-async-void"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async void OnClick() { try { await Task.Yield(); throw new InvalidOperationException("boom"); } catch (Exception ex) { Console.WriteLine("handler caught: " + ex.Message); } } OnClick(); await Task.Delay(100); Console.WriteLine("done");</code> — обе строки?',
      options: ["handler caught: boom\\ndone", "done", "boom\\ndone", "handler caught: boom"], correctIndex: 0, xp: 10,
      okText: 'Раз исключение из <code>async void</code> не поймать снаружи, обработчик ловит его <b>внутри себя</b> → <span class="hl">handler caught: boom</span>, затем <code>done</code>. Обязательный паттерн для async-обработчиков.',
      noText: 'Безопасный <code>async void</code> оборачивает тело в <code>try/catch</code> — иначе исключение уронило бы процесс. Здесь catch внутри → <code>handler caught: boom</code>, потом <code>done</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "handler caught: boom\ndone" }, sourceRefs: ["ms-async-void"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Button { public event EventHandler Clicked; public void Click() =&gt; Clicked?.Invoke(this, EventArgs.Empty); } var b = new Button(); var tcs = new TaskCompletionSource(); b.Clicked += async (s,e) =&gt; { await Task.Delay(10); Console.WriteLine("async handler ran"); tcs.SetResult(); }; b.Click(); Console.WriteLine("Click returned"); await tcs.Task; Console.WriteLine("handler finished");</code> — три строки?',
      options: ["Click returned\\nasync handler ran\\nhandler finished", "async handler ran\\nClick returned\\nhandler finished", "Click returned\\nhandler finished\\nasync handler ran", "async handler ran\\nhandler finished\\nClick returned"], correctIndex: 0, xp: 10,
      okText: 'Async-обработчик на первом <code>await</code> возвращает управление, поэтому <code>Click()</code> <b>не ждёт</b> его: <span class="hl">Click returned</span> печатается раньше, обработчик доигрывает позже. Fire-and-forget.',
      noText: 'Поднять событие ≠ дождаться async-обработчика. <code>Click()</code> возвращается на первом <code>await</code> → <code>Click returned</code>, затем <code>async handler ran</code>, затем <code>handler finished</code>. Реальный прогон.',
      verify: { kind: "exec", run: "dotnet run", expect: "Click returned\nasync handler ran\nhandler finished" }, sourceRefs: ["ms-async-void"],
    },
  ],

  takeaways: [
    { icon: "why", k: "async void = только handler", v: 'Обработчик обязан вернуть <code>void</code>, потому async-обработчик = <code>async void</code>: «Event handlers must declare <code>void</code> return types and can\'t use or return <code>Task</code>…». Правило: «<span class="hl">Return \'async void\' only from event handlers</span>».' },
    { icon: "avoid", k: "Исключения утекают", v: 'Исключение из <code>async void</code> <b>не поймать снаружи</b>: «can\'t be caught outside of that method» — необработанное <span class="hl">роняет процесс</span> (реальный прогон уронил хост). Обработчик обязан ловить свои исключения <b>внутри</b> (реальный прогон: <code>handler caught: boom</code>).' },
    { icon: "cost", k: "Fire-and-forget + LINQ", v: 'Raise <b>не ждёт</b> async-обработчик: <code>Click()</code> возвращается на первом <code>await</code> (реальный прогон: <code>Click returned</code> раньше). А async-λ в LINQ — deferred execution + риск <span class="hl">deadlock</span>: «can easily result in a deadlock».' },
  ],

  foot: 'урок · <b>async event handlers: async void</b> · 6 анимир. разборов · исключения · fire-and-forget · панель порядка · async-λ в LINQ · дизайн <b>mid</b>',
};
