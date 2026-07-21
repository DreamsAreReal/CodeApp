/**
 * Lesson: ThreadLocal<T> and AsyncLocal<T> — per-thread vs per-async-flow ambient state
 * (CS.S8.thread-async-local) — expert density, 5 animated deep-dives. ThreadLocal<T> gives each
 * thread its OWN copy of a value (isolated storage, lazily initialized by an optional value factory,
 * IsValueCreated tells whether this thread initialized it). AsyncLocal<T> is different: it represents
 * ambient data local to a given asynchronous CONTROL FLOW, so it persists across an await / thread
 * hop where a ThreadLocal would be reset. Because the TAP model abstracts threads away, AsyncLocal is
 * the right per-request/ambient-context primitive for async code; ThreadLocal is for genuinely
 * thread-affine state.
 *
 * SIGNATURE machine panel (s5): an AsyncLocal value set before an await is still observable AFTER the
 * await (it flows with the async control flow) — REAL run-csharp measurement (this file's exec cards):
 * before=ctx after=ctx.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (ThreadLocal<T>, AsyncLocal<T>),
 *     fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (threads JOINED /
 *     async awaited synchronously before print): c1 "main=100 worker=100 mainAfter=100" ·
 *     c2 "before=False value=42 after=True" · c3 "before=ctx after=ctx".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.thread-async-local/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: ThreadLocal — each thread its own copy.
const Z_T1: Zone = { id: "t1", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОТОК A", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "своя копия", subCls: "vz-zsub good", subY: 47 };
const Z_T2: Zone = { id: "t2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПОТОК B", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "своя копия", subCls: "vz-zsub heap", subY: 47 };
const TL_ZONES: Zone[] = [Z_T1, Z_T2];

// s2: value factory + IsValueCreated.
const Z_FACTORY: Zone = { id: "factory", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ThreadLocal<T>(valueFactory) · лениво", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "первый доступ на потоке → фабрика; IsValueCreated", subCls: "vz-zsub", subY: 40 };
const FACT_ZONES: Zone[] = [Z_FACTORY];

// s3: AsyncLocal — ambient across the async flow.
const Z_FLOW: Zone = { id: "flow", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "AsyncLocal<T> · амбиентно по async-потоку управления", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "переживает await / смену потока", subCls: "vz-zsub good", subY: 40 };
const FLOW_ZONES: Zone[] = [Z_FLOW];

// s4: TAP abstracts threads -> why AsyncLocal.
const Z_TLBAD: Zone = { id: "tlbad", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ThreadLocal", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "сбросится после await", subCls: "vz-zsub heap", subY: 47 };
const Z_ALGOOD: Zone = { id: "algood", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AsyncLocal", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "переживёт await", subCls: "vz-zsub good", subY: 47 };
const CHOICE_ZONES: Zone[] = [Z_TLBAD, Z_ALGOOD];

// s5 (SIGNATURE): AsyncLocal survives await.
const Z_PRE: Zone = { id: "pre", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДО await", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "al.Value = ctx", subCls: "vz-zsub", subY: 47 };
const Z_POST: Zone = { id: "post", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОСЛЕ await", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "al.Value всё ещё ctx", subCls: "vz-zsub good", subY: 47 };
const SURV_ZONES: Zone[] = [Z_PRE, Z_POST];

export const threadAsyncLocal: LessonData = {
  id: "CS.S8.thread-async-local",
  track: "CS",
  section: "CS.S8",
  module: "S8.9",
  lang: "csharp",
  title: "ThreadLocal<T> / AsyncLocal<T>: контекст в async",
  kicker: "C# вглубь · S8 · амбиентное состояние",
  home: { subtitle: "per-thread vs per-async-flow, фабрика, поток управления", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.tap-model", "CS.S8.managed-threading-basics"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-threadlocal", kind: "doc", org: "Microsoft Learn", title: "ThreadLocal<T> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.threadlocal-1", date: "2026-01-20" },
    { id: "ms-asynclocal", kind: "doc", org: "Microsoft Learn", title: "AsyncLocal<T> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.asynclocal-1", date: "2026-01-20" },
  ],

  spec: [
    { text: "ThreadLocal<T> — per-thread хранилище: «Provides thread-local storage of data» <span class=\"ru-tr\">«Предоставляет потоко-локальное хранилище данных»</span>. Значение <code>Value</code> «is specific for the thread on which the property is accessed» <span class=\"ru-tr\">«специфично для потока, на котором происходит обращение к свойству»</span>.", source: "ms-threadlocal" },
    { text: "AsyncLocal<T> — амбиентное по async-потоку: «Represents ambient data that is local to a given asynchronous control flow, such as an asynchronous method» <span class=\"ru-tr\">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления, например для асинхронного метода»</span>.", source: "ms-asynclocal" },
  ],
  edgeCases: [
    { text: "Ленивая инициализация фабрикой: конструктор «Initializes the ThreadLocal<T> instance with the specified valueFactory function» <span class=\"ru-tr\">«Инициализирует экземпляр ThreadLocal<T> заданной функцией valueFactory»</span>; свойство IsValueCreated «Gets whether Value is initialized on the current thread» <span class=\"ru-tr\">«Возвращает, инициализировано ли Value на текущем потоке»</span>.", source: "ms-threadlocal" },
    { text: "AsyncLocal тянется через потоки: «Because the task-based asynchronous programming model tends to abstract the use of threads, AsyncLocal<T> instances can be used to persist data across threads» <span class=\"ru-tr\">«Поскольку основанная на задачах модель асинхронного программирования стремится абстрагировать использование потоков, экземпляры AsyncLocal<T> можно применять для сохранения данных между потоками»</span>.", source: "ms-asynclocal" },
    { text: "AsyncLocal умеет уведомлять об изменении: «provides optional notifications when the value associated with the current thread changes… or implicitly changed when the thread encountered an await or other context transition» <span class=\"ru-tr\">«предоставляет необязательные уведомления, когда значение, связанное с текущим потоком, меняется… или неявно изменяется, когда поток встречает await или другой переход контекста»</span>.", source: "ms-asynclocal" },
  ],

  misconceptions: [
    {
      wrong: "ThreadLocal и AsyncLocal — одно и то же «локальное хранилище», просто разные имена",
      hook: 'Это <b>разные оси</b> локальности. <code>ThreadLocal&lt;T&gt;</code> — <span class="hl">per-thread</span>: «Provides thread-local storage of data» <span class="ru-tr">«Предоставляет потоко-локальное хранилище данных»</span> — у каждого потока своя копия, и <code>Value</code> «is <span class="hl">specific for the thread</span> on which the property is accessed» <span class="ru-tr">«специфично для потока, на котором происходит обращение к свойству»</span>. <code>AsyncLocal&lt;T&gt;</code> — <span class="hl">per-async-flow</span>: «Represents <span class="hl">ambient data that is local to a given asynchronous control flow</span>, such as an asynchronous method» <span class="ru-tr">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления, например для асинхронного метода»</span> — оно <b>переживает</b> <code>await</code> и смену потока: «Because the task-based asynchronous programming model tends to abstract the use of threads, <code>AsyncLocal&lt;T&gt;</code> instances can be used to <span class="hl">persist data across threads</span>» <span class="ru-tr">«Поскольку основанная на задачах модель асинхронного программирования стремится абстрагировать использование потоков, экземпляры <code>AsyncLocal&lt;T&gt;</code> можно применять для сохранения данных между потоками»</span>. В async-коде поток под тобой меняется — <code>ThreadLocal</code> сбросится, а <code>AsyncLocal</code> дотечёт. Дальше <b>пять разборов</b>: ThreadLocal-изоляция, фабрика + IsValueCreated, AsyncLocal-поток управления, почему в async нужен AsyncLocal, и <b>машинная панель</b> — AsyncLocal переживает await реальным прогоном (before=ctx after=ctx).',
      source: ["ms-threadlocal", "ms-asynclocal"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "ThreadLocal · изоляция", title: "У каждого потока своя копия значения",
      viewBox: "0 0 340 210", zones: TL_ZONES,
      code: ["var tl = new ThreadLocal<int>(() => 100);", "// поток A: tl.Value -> 100 (своя копия)", "// поток B: tl.Value = 999 -> НЕ видно потоку A"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ThreadLocal&lt;T&gt;</code> — «<span class="hl">Provides thread-local storage of data</span>» <span class="ru-tr">«Предоставляет потоко-локальное хранилище данных»</span>: у каждого потока отдельная ячейка.', nodes: [{ id: "a", kind: "obj", at: { zone: "t1", row: 0 }, typeTag: "Thread A", value: "tl = 100", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поток B читает <code>tl.Value</code> — получает <b>свою</b> копию (100 из фабрики), не A. «specific for the thread on which the property is accessed» <span class="ru-tr">«специфично для потока, на котором происходит обращение к свойству»</span>.', nodes: [{ id: "a", kind: "obj", at: { zone: "t1", row: 0 }, typeTag: "Thread A", value: "tl = 100" }, { id: "b", kind: "obj", at: { zone: "t2", row: 0 }, typeTag: "Thread B", value: "tl = 100", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'B пишет <code>tl.Value = 999</code> — <span class="hl">только в свою ячейку</span>. У A по-прежнему 100. Полная изоляция.', nodes: [{ id: "a", kind: "obj", at: { zone: "t1", row: 0 }, typeTag: "Thread A", value: "tl = 100" }, { id: "b", kind: "obj", at: { zone: "t2", row: 0 }, typeTag: "Thread B", value: "tl = 999", accent: true }], edges: [] },
      ],
      explain: '<code>ThreadLocal&lt;T&gt;</code> даёт каждому потоку <b>изолированную</b> ячейку: «<span class="hl">Provides thread-local storage of data</span>» <span class="ru-tr">«Предоставляет потоко-локальное хранилище данных»</span>. Из раздела Thread Safety: «The value returned for the <code>Value</code> and <code>IsValueCreated</code> properties <span class="hl">is specific for the thread on which the property is accessed</span>» <span class="ru-tr">«Значение, возвращаемое для свойств <code>Value</code> и <code>IsValueCreated</code>, специфично для потока, на котором происходит обращение к свойству»</span>. То есть <code>tl.Value</code> — не общее поле, а «моё значение на этом потоке»: запись из одного потока не видна другому. Это удобно для не-thread-safe ресурсов (например, свой <code>Random</code> на поток) без блокировок. Реальный прогон (машинная база урока): main видит 100, worker видит 100 (своя копия из фабрики), и после записи worker\'ом 999 у main всё ещё 100 (main=100 worker=100 mainAfter=100).',
      sources: ["ms-threadlocal"],
    },
    {
      id: "s2", num: "02", kicker: "Фабрика · IsValueCreated", title: "Значение создаётся лениво при первом доступе на потоке",
      viewBox: "0 0 340 210", zones: FACT_ZONES,
      code: ["var tl = new ThreadLocal<int>(() => 42);  // valueFactory", "bool before = tl.IsValueCreated;  // False — ещё не трогали", "int v = tl.Value;                 // фабрика вызвана -> 42", "bool after = tl.IsValueCreated;   // True"],
      predictAt: 1, predictQ: 'До первого <code>tl.Value</code> — что вернёт <code>IsValueCreated</code>, каким будет первое <code>Value</code>, и <code>IsValueCreated</code> после?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Конструктор с <b>valueFactory</b>: «Initializes the <code>ThreadLocal&lt;T&gt;</code> instance with the specified <code>valueFactory</code> function» <span class="ru-tr">«Инициализирует экземпляр <code>ThreadLocal&lt;T&gt;</code> заданной функцией <code>valueFactory</code>»</span>.', nodes: [{ id: "f", kind: "gate", at: { zone: "factory", row: 0 }, state: "ok", label: "valueFactory: () => 42", detail: "ещё не вызвана", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'До доступа — <code>IsValueCreated == False</code>. Свойство «<span class="hl">Gets whether Value is initialized on the current thread</span>» <span class="ru-tr">«Возвращает, инициализировано ли Value на текущем потоке»</span>.', nodes: [{ id: "f", kind: "gate", at: { zone: "factory", row: 0 }, state: "ok", label: "valueFactory", detail: "не вызвана" }, { id: "b", kind: "gate", at: { zone: "factory", row: 1 }, state: "fail", label: "IsValueCreated", detail: "False", accent: true }], edges: [] },
        { codeLine: 2, out: "before=False value=42 after=True", caption: 'Первый <code>tl.Value</code> <span class="hl">лениво</span> зовёт фабрику → 42, и <code>IsValueCreated</code> становится True. Панель: <b>False 42 True</b>.', nodes: [{ id: "v", kind: "gate", at: { zone: "factory", row: 0 }, state: "ok", label: "Value = 42", detail: "фабрика вызвана" }, { id: "a", kind: "gate", at: { zone: "factory", row: 1 }, state: "ok", label: "IsValueCreated", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Инициализация ленива и — что важно — <b>по потоку</b>. Конструктор с фабрикой «<span class="hl">Initializes the ThreadLocal&lt;T&gt; instance with the specified valueFactory function</span>» <span class="ru-tr">«Инициализирует экземпляр <code>ThreadLocal&lt;T&gt;</code> заданной функцией <code>valueFactory</code>»</span>. Свойство контроля <code>IsValueCreated</code> «<span class="hl">Gets whether Value is initialized on the current thread</span>» <span class="ru-tr">«Возвращает, инициализировано ли Value на текущем потоке»</span>. На каждом новом потоке значение создаётся при <b>первом</b> обращении к <code>Value</code> — фабрика вызывается заново для этого потока. Реальный прогон: <code>IsValueCreated</code> до доступа — <b>False</b>, первое <code>Value</code> — <b>42</b> (фабрика), после — <b>True</b> (печать <b>before=False value=42 after=True</b>). Есть ещё <code>Values</code> — «<span class="hl">Gets a list containing the values stored by all threads</span> that have accessed this instance» <span class="ru-tr">«Возвращает список, содержащий значения, сохранённые всеми потоками, которые обращались к этому экземпляру»</span>. И <code>ThreadLocal</code> реализует <code>IDisposable</code>: освобождать через <code>Dispose()</code>.',
      sources: ["ms-threadlocal"],
    },
    {
      id: "s3", num: "03", kicker: "AsyncLocal · поток управления", title: "Амбиентные данные, локальные для async-потока управления",
      viewBox: "0 0 340 210", zones: FLOW_ZONES,
      code: ["var al = new AsyncLocal<string>();", "al.Value = \"ctx\";           // ставим в текущем async-потоке управления", "await SomethingAsync();     // поток МОГ смениться", "// al.Value всё ещё \"ctx\" — данные дотекли"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>AsyncLocal&lt;T&gt;</code> — «<span class="hl">Represents ambient data that is local to a given asynchronous control flow</span>» <span class="ru-tr">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления»</span>. Ставим значение в текущем потоке управления.', nodes: [{ id: "a", kind: "obj", at: { zone: "flow", row: 0 }, typeTag: "AsyncLocal", value: "= ctx", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'После <code>await</code> продолжение может выполниться на <b>другом</b> потоке пула. <code>ThreadLocal</code> бы сбросился.', nodes: [{ id: "a", kind: "obj", at: { zone: "flow", row: 0 }, typeTag: "AsyncLocal", value: "= ctx" }, { id: "aw", kind: "gate", at: { zone: "flow", row: 1 }, state: "ok", label: "await", detail: "поток мог смениться", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Но <code>AsyncLocal</code> <span class="hl">течёт по async-потоку управления</span>: «can be used to persist data across threads» <span class="ru-tr">«можно применять для сохранения данных между потоками»</span>. Значение сохраняется.', nodes: [{ id: "aw", kind: "gate", at: { zone: "flow", row: 0 }, state: "ok", label: "после await", detail: "другой поток" }, { id: "ok", kind: "gate", at: { zone: "flow", row: 1 }, state: "ok", label: "al.Value", detail: "всё ещё ctx", accent: true }], edges: [] },
      ],
      explain: '<code>AsyncLocal&lt;T&gt;</code> привязано не к потоку, а к <b>логическому потоку управления</b>: «<span class="hl">Represents ambient data that is local to a given asynchronous control flow, such as an asynchronous method</span>» <span class="ru-tr">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления, например для асинхронного метода»</span>. Ключевое свойство — оно течёт вместе с async-контекстом: «<span class="hl">Because the task-based asynchronous programming model tends to abstract the use of threads, AsyncLocal&lt;T&gt; instances can be used to persist data across threads</span>» <span class="ru-tr">«Поскольку основанная на задачах модель асинхронного программирования стремится абстрагировать использование потоков, экземпляры <code>AsyncLocal&lt;T&gt;</code> можно применять для сохранения данных между потоками»</span>. То есть значение, установленное до <code>await</code>, видно и после — даже если продолжение подхватил другой поток пула. Это делает <code>AsyncLocal</code> правильным носителем «амбиентного контекста» запроса (correlation id, культура, пользователь) в async-коде. Плюс есть уведомления: «provides optional notifications when the value… changes… or implicitly changed when the thread encountered an <code>await</code> or other context transition» <span class="ru-tr">«предоставляет необязательные уведомления, когда значение… меняется… или неявно изменяется, когда поток встречает <code>await</code> или другой переход контекста»</span>.',
      sources: ["ms-asynclocal"],
    },
    {
      id: "s4", num: "04", kicker: "Почему в async — AsyncLocal", title: "TAP прячет потоки: ThreadLocal сбросится, AsyncLocal — нет",
      viewBox: "0 0 340 210", zones: CHOICE_ZONES,
      code: ["// в async-методе поток под тобой меняется на await", "ThreadLocal<T>  — привязка к ПОТОКУ -> после await чужой поток -> сброс", "AsyncLocal<T>   — привязка к async-ПОТОКУ УПРАВЛЕНИЯ -> дотечёт"],
      predictAt: 2, predictQ: 'Почему для «контекста запроса» в async-коде берут <code>AsyncLocal</code>, а не <code>ThreadLocal</code>? Что случится с <code>ThreadLocal</code> после <code>await</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>ThreadLocal</code> привязан к <b>потоку</b>. После <code>await</code> продолжение — часто на <span class="hl">другом</span> потоке пула, где значение не установлено.', nodes: [{ id: "tl", kind: "gate", at: { zone: "tlbad", row: 0 }, state: "fail", label: "ThreadLocal", detail: "другой поток → сброс", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>AsyncLocal</code> привязан к <b>async-потоку управления</b> — переживает смену потока: «persist data across threads» <span class="ru-tr">«сохранять данные между потоками»</span>.', nodes: [{ id: "tl", kind: "gate", at: { zone: "tlbad", row: 0 }, state: "fail", label: "ThreadLocal", detail: "сброс" }, { id: "al", kind: "gate", at: { zone: "algood", row: 0 }, state: "ok", label: "AsyncLocal", detail: "дотечёт", accent: true }], edges: [] },
        { codeLine: 0, out: "async → AsyncLocal", caption: 'Правило: в async-коде для амбиентного контекста — <span class="hl">AsyncLocal</span>; <code>ThreadLocal</code> — для честно потоко-привязанного состояния (свой не-thread-safe ресурс на поток).', nodes: [{ id: "al", kind: "gate", at: { zone: "algood", row: 0 }, state: "ok", label: "AsyncLocal", detail: "ambient в async", accent: true }], edges: [] },
      ],
      explain: 'Выбор между ними диктует именно модель async. TAP «<span class="hl">tends to abstract the use of threads</span>» <span class="ru-tr">«стремится абстрагировать использование потоков»</span> — ты не управляешь, на каком потоке пойдёт продолжение после <code>await</code>. Поэтому состояние, привязанное к потоку (<code>ThreadLocal</code>), после <code>await</code> может «потеряться»: продолжение подхватит другой поток пула, где твоё значение не установлено. <code>AsyncLocal</code> решает это на уровне модели: оно живёт в async-потоке управления и «<span class="hl">can be used to persist data across threads</span>» <span class="ru-tr">«можно применять для сохранения данных между потоками»</span>. Отсюда практическое разделение: <code>AsyncLocal</code> — для <b>амбиентного контекста</b> async-запроса (пользователь, correlation id, культура), а <code>ThreadLocal</code> — для по-настоящему потоко-локального (буфер/ресурс, который не должен шариться между потоками и не переживает смену потока). Смешивать роли — источник тонких багов «контекст пропал после await».',
      sources: ["ms-asynclocal", "ms-threadlocal"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · переживает await", title: "AsyncLocal: значение до await == значение после await",
      viewBox: "0 0 340 210", zones: SURV_ZONES,
      code: ["var al = new AsyncLocal<string>(); al.Value = \"ctx\";", "string before = al.Value;   // \"ctx\"", "async Task<string> Inner(){ await Task.Delay(10); return al.Value; }", "string after = Inner().GetAwaiter().GetResult();  // \"ctx\"?"],
      predictAt: 3, predictQ: '<code>al.Value=\"ctx\"</code>; затем метод с <code>await Task.Delay</code> читает <code>al.Value</code>. Что за пара (before, after)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Ставим <code>al.Value = \"ctx\"</code> в текущем async-потоке управления.', nodes: [{ id: "p", kind: "gate", at: { zone: "pre", row: 0 }, state: "ok", label: "al.Value = ctx", detail: "до await", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Внутри метода — <code>await Task.Delay</code>: продолжение может выполниться на другом потоке пула.', nodes: [{ id: "p", kind: "gate", at: { zone: "pre", row: 0 }, state: "ok", label: "ctx", detail: "до" }, { id: "aw", kind: "gate", at: { zone: "post", row: 0 }, state: "ok", label: "await Delay", detail: "смена потока?", accent: true }], edges: [{ id: "e1", from: "p", to: "aw", accent: true }] },
        { codeLine: 3, out: "before=ctx after=ctx", caption: 'Панель: <b>before=ctx after=ctx</b> (реальный прогон) — <code>AsyncLocal</code> <span class="hl">дотёк</span> через await. Значение до == значение после.', nodes: [{ id: "b", kind: "gate", at: { zone: "pre", row: 0 }, state: "ok", label: "before", detail: "ctx" }, { id: "a", kind: "gate", at: { zone: "post", row: 0 }, state: "ok", label: "after", detail: "ctx", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — «переживает ли await» реальным прогоном. <code>al.Value = "ctx"</code>; затем async-метод с <code>await Task.Delay(10)</code> читает <code>al.Value</code> уже после точки приостановки. Печать — <b>before=ctx after=ctx</b>: значение сохранилось через <code>await</code>, хотя продолжение могло уйти на другой поток пула. Это прямое следствие определения: «<span class="hl">Represents ambient data that is local to a given asynchronous control flow</span>» <span class="ru-tr">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления»</span> + «<span class="hl">AsyncLocal&lt;T&gt; instances can be used to persist data across threads</span>» <span class="ru-tr">«экземпляры <code>AsyncLocal&lt;T&gt;</code> можно применять для сохранения данных между потоками»</span>. Контраст: <code>ThreadLocal</code> в той же схеме дал бы значение continuation-потока (часто дефолт/пусто), а не установленное до await. Вывод S8-раздела: атомарность и барьеры (Interlocked/Volatile) — про КОРРЕКТНОСТЬ разделяемого состояния; <code>ThreadLocal</code>/<code>AsyncLocal</code> — про ИЗОЛЯЦИЮ состояния по потоку или по async-потоку управления.',
      sources: ["ms-asynclocal"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var tl = new ThreadLocal&lt;int&gt;(() => 100); int mainVal = tl.Value; int workerVal = 0; var t = new Thread(() => { workerVal = tl.Value; tl.Value = 999; }); t.Start(); t.Join(); int mainAfter = tl.Value; Console.WriteLine($"main={mainVal} worker={workerVal} mainAfter={mainAfter}");</code> — что напечатает?',
      options: ["main=100 worker=100 mainAfter=100", "main=100 worker=100 mainAfter=999", "main=100 worker=999 mainAfter=999", "main=0 worker=0 mainAfter=0"], correctIndex: 0, xp: 10,
      okText: 'У каждого потока <span class="hl">своя копия</span>: main и worker оба получают 100 из фабрики; запись worker\'ом <code>tl.Value = 999</code> — только в его ячейку, у main остаётся <b>100</b>. Полная изоляция.',
      noText: '<code>ThreadLocal</code> «is specific for the thread on which the property is accessed» <span class="ru-tr">«специфично для потока, на котором происходит обращение к свойству»</span> — worker\'ова запись не видна main. Реальный вывод: <b>main=100 worker=100 mainAfter=100</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "main=100 worker=100 mainAfter=100" }, sourceRefs: ["ms-threadlocal"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var tl = new ThreadLocal&lt;int&gt;(() => 42); bool before = tl.IsValueCreated; int v = tl.Value; bool after = tl.IsValueCreated; Console.WriteLine($"before={before} value={v} after={after}");</code> — что напечатает?',
      options: ["before=False value=42 after=True", "before=True value=42 after=True", "before=False value=0 after=True", "before=False value=42 after=False"], correctIndex: 0, xp: 10,
      okText: 'Значение <span class="hl">лениво</span>: до первого <code>Value</code> — <code>IsValueCreated == False</code>; первый доступ зовёт фабрику → 42; после — True. «Gets whether Value is initialized on the current thread» <span class="ru-tr">«Возвращает, инициализировано ли Value на текущем потоке»</span>.',
      noText: 'Фабрика вызывается при первом обращении к <code>Value</code>, тогда же <code>IsValueCreated</code> становится True. Реальный вывод: <b>before=False value=42 after=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=False value=42 after=True" }, sourceRefs: ["ms-threadlocal"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var al = new AsyncLocal&lt;string&gt;(); al.Value = "ctx"; string beforeAwait = al.Value; async Task&lt;string&gt; Inner() { await Task.Delay(10); return al.Value; } string afterAwait = Inner().GetAwaiter().GetResult(); Console.WriteLine($"before={beforeAwait} after={afterAwait}");</code> — что напечатает?',
      options: ["before=ctx after=ctx", "before=ctx after=", "before= after=ctx", "before=ctx after=null"], correctIndex: 0, xp: 10,
      okText: '<code>AsyncLocal</code> — «ambient data that is local to a given asynchronous control flow» <span class="ru-tr">«амбиентные данные, локальные для заданного асинхронного потока управления»</span>: значение <span class="hl">переживает await</span> и смену потока. И до, и после — <b>ctx</b>.',
      noText: '«<code>AsyncLocal&lt;T&gt;</code> instances can be used to persist data across threads» <span class="ru-tr">«экземпляры <code>AsyncLocal&lt;T&gt;</code> можно применять для сохранения данных между потоками»</span> — значение дотекает через await. Реальный вывод: <b>before=ctx after=ctx</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=ctx after=ctx" }, sourceRefs: ["ms-asynclocal"],
    },
  ],

  takeaways: [
    { icon: "why", k: "ThreadLocal", v: '«<span class="hl">Provides thread-local storage of data</span>» <span class="ru-tr">«Предоставляет потоко-локальное хранилище данных»</span> — у каждого потока своя копия (<code>Value</code> «is specific for the thread» <span class="ru-tr">«специфично для потока»</span>). Лениво через <code>valueFactory</code>; <code>IsValueCreated</code> = «whether Value is initialized on the current thread» <span class="ru-tr">«инициализировано ли Value на текущем потоке»</span> (main=100 worker=100 mainAfter=100).' },
    { icon: "cost", k: "AsyncLocal", v: '«<span class="hl">Represents ambient data that is local to a given asynchronous control flow</span>» <span class="ru-tr">«Представляет амбиентные данные, локальные для заданного асинхронного потока управления»</span> — переживает <code>await</code>/смену потока: «persist data across threads» <span class="ru-tr">«сохранять данные между потоками»</span> (before=ctx after=ctx). Правильный носитель амбиентного контекста запроса.' },
    { icon: "avoid", k: "Выбор", v: 'В async-коде поток под тобой меняется → <code>ThreadLocal</code> сбросится после await, <code>AsyncLocal</code> — нет. Для ambient-контекста async — <b>AsyncLocal</b>; <code>ThreadLocal</code> — для честно потоко-привязанного ресурса.' },
  ],

  foot: 'урок · <b>ThreadLocal / AsyncLocal</b> · 5 анимир. разборов · панель AsyncLocal переживает await · дизайн <b>mid</b>',
};
