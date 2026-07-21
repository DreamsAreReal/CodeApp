/**
 * Lesson: Async return types — Task / Task<T> / void / task-like (CS.S2.return-types) — expert
 * density, 5 animated deep-dives. Which type an async method returns and why: Task (no value,
 * awaitable), Task<T> (value via await; .Result is BLOCKING), void ONLY for event handlers (can't
 * be awaited; its exceptions escape the caller and crash the app), task-like / IAsyncEnumerable for
 * advanced/hot paths, and ValueTask<T> — a value type wrapping Task<T> OR T (S2.5).
 *
 * SIGNATURE machine panel (s5): Task<int> is a REFERENCE type (heap-allocated) while ValueTask<int>
 * is a VALUE type — a real typeof(...).IsValueType measurement (True False), the layout root of the
 * hot-path tradeoff. evidence/F10/return-types-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn async-return-types + TAP model (fetch
 * 2026-07-18) + GT-M4-s2.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../async-return-types and
 *     .../task-asynchronous-programming-model;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F10/return-types-exec.txt:
 *     "done 42"; "Task caught: boom"; "True False");
 *   - NO GT-M4 myths: async void != async Task (M-void-4; its exceptions are NOT caught by the
 *     caller and crash the app — shown as an in-lesson fact, not a runnable card); Task<T>.Result is
 *     BLOCKING and deadlock-prone (M-block-3).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.return-types/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the return-type map.
const Z_MAP: Zone = { id: "map", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ВОЗВРАЩАЕМЫЕ ТИПЫ async", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "Task · Task<T> · void · task-like", subCls: "vz-zsub", subY: 47 };
const MAP_ZONES: Zone[] = [Z_MAP];

// s2: Task vs Task<T>.
const Z_TASK: Zone = { id: "task", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Task", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "нет значения · await", subCls: "vz-zsub", subY: 47 };
const Z_TASKT: Zone = { id: "taskt", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Task<T>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "значение через await", subCls: "vz-zsub good", subY: 47 };
const TASK_ZONES: Zone[] = [Z_TASK, Z_TASKT];

// s3: async void — event handlers only, exceptions escape.
const Z_VOID: Zone = { id: "void", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "async void · ТОЛЬКО event handler", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "нельзя await · исключения обрушивают", subCls: "vz-zsub heap", subY: 47 };
const VOID_ZONES: Zone[] = [Z_VOID];

// s4: exceptions — Task caught, void escapes.
const Z_TASKEXC: Zone = { id: "taskexc", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "async Task", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "исключение в задаче · await ловит", subCls: "vz-zsub good", subY: 47 };
const Z_VOIDEXC: Zone = { id: "voidexc", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "async void", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "исключение escape · crash", subCls: "vz-zsub heap", subY: 47 };
const EXC_ZONES: Zone[] = [Z_TASKEXC, Z_VOIDEXC];

// s5 (SIGNATURE): Task<T> reference type vs ValueTask<T> value type.
const Z_REF: Zone = { id: "ref", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Task<int>", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "reference · аллокация кучи", subCls: "vz-zsub heap", subY: 47 };
const Z_VAL: Zone = { id: "val", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ValueTask<int>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "value type · struct", subCls: "vz-zsub good", subY: 47 };
const TYPE_ZONES: Zone[] = [Z_REF, Z_VAL];

export const returnTypes: LessonData = {
  id: "CS.S2.return-types",
  track: "CS",
  section: "CS.S2",
  module: "S2.4",
  lang: "csharp",
  title: "Async return types: Task, Task<T>, void",
  kicker: "C# вглубь · S2 · что возвращать",
  home: { subtitle: "Task/Task<T>/void, async void, task-like", icon: "async", estMinutes: 9 },
  prereqs: ["CS.S2.tap-model"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-return", kind: "doc", org: "Microsoft Learn", title: "Async return types (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-return-types", date: "2024-11-01" },
    { id: "ms-tap", kind: "doc", org: "Microsoft Learn", title: "The Task Asynchronous Programming (TAP) model (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2025-10-13" },
  ],

  spec: [
    { text: "«An async method that has a void return type can't be awaited, and the caller of a void-returning method can't catch any exceptions that the method throws.» <span class=\"ru-tr\">«Async-метод с типом возврата <code>void</code> нельзя дождаться через <code>await</code>, и вызывающий метод без возвращаемого значения не может поймать никакие исключения, которые этот метод бросает.»</span>", source: "ms-tap" },
  ],
  edgeCases: [
    { text: "<code>Task&lt;T&gt;.Result</code> — <b>БЛОКИРУЮЩЕЕ</b> свойство: доступ до завершения блокирует поток (и грозит дедлоком). Бери значение через <code>await</code>, не <code>.Result</code>.", source: "ms-tap" },
    { text: "Task-like (generalized) типы — любой тип с доступным <code>GetAwaiter</code> + builder через <code>AsyncMethodBuilderAttribute</code>; смысл — лёгкий value type вместо reference (горячие пути). По умолчанию — <code>Task</code>/<code>Task&lt;T&gt;</code>/<code>ValueTask&lt;T&gt;</code>.", source: "ms-return" },
    { text: "<code>IAsyncEnumerable&lt;T&gt;</code> — async stream: перечисление порциями через <code>await foreach</code> (подробно — S2.9). Async-метод не может иметь <code>in</code>/<code>ref</code>/<code>out</code>-параметров.", source: "ms-tap" },
  ],

  misconceptions: [
    {
      wrong: "async void == async Task, только имя короче; Result — норм способ взять значение",
      hook: 'Опасная путаница: «<span class="wrong">async void — то же, что async Task</span>». Нет: <code>async void</code> <b>нельзя await</b>, и его исключения вызывающий «<span class="hl">can\'t catch</span>» <span class="ru-tr">«не может поймать»</span> — они остаются необработанными и <b>обрушивают приложение</b>. <code>async void</code> оправдан ТОЛЬКО как обработчик события. И второй миф: «<span class="wrong">Result — норм способ взять значение</span>» — нет, <code>.Result</code> блокирует поток. Ниже <b>пять разборов</b>: карта return-типов, <code>Task</code> vs <code>Task&lt;T&gt;</code>, <code>async void</code>-ловушка, исключения (Task ловит / void escape), и <b>машинная панель</b> — <code>Task&lt;T&gt;</code> reference vs <code>ValueTask&lt;T&gt;</code> value type.',
      source: "ms-tap",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Карта return-типов", title: "Task, Task<T>, void, task-like — что когда",
      viewBox: "0 0 340 210", zones: MAP_ZONES,
      code: ["async Task M()            // нет return-значения", "async Task<int> M()       // return операнда типа T", "async void M()            // ТОЛЬКО event handler", "async ValueTask<int>/IAsyncEnumerable<T>  // task-like / stream"],
      scenes: [
        { codeLine: 0, caption: '<code>Task</code> — нет значения: метод без <code>return</code>-операнда; вызывающий может <code>await</code>.', nodes: [{ id: "t", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "Task", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Task&lt;T&gt;</code> — есть значение: <code>return</code> операнда типа <code>T</code>, результат через <code>await</code>.', nodes: [{ id: "t", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "Task" }, { id: "tt", kind: "chip", at: { zone: "map", row: 0, col: 1 }, value: "Task<T>", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>void</code> — <span class="hl">только event handler</span>. Плюс любой тип с <code>GetAwaiter</code> (<code>ValueTask&lt;T&gt;</code>) и <code>IAsyncEnumerable&lt;T&gt;</code> (stream).', nodes: [{ id: "t", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "Task" }, { id: "tt", kind: "chip", at: { zone: "map", row: 0, col: 1 }, value: "Task<T>" }, { id: "v", kind: "chip", at: { zone: "map", row: 1, col: 0 }, value: "void" }, { id: "l", kind: "chip", at: { zone: "map", row: 1, col: 1 }, value: "task-like / stream", accent: true }], edges: [] },
      ],
      explain: 'Полный список return-типов async-метода дословно: «<code>Task&lt;TResult&gt;</code> if your method has a return statement in which the operand has type <code>TResult</code>. <code>Task</code> if your method has no return statement or has a return statement with no operand. <code>void</code> if you\'re writing an async <b>event handler</b>. Any other type that has a <code>GetAwaiter</code> method» <span class="ru-tr">«<code>Task&lt;TResult&gt;</code>, если в методе есть оператор return, операнд которого имеет тип <code>TResult</code>. <code>Task</code>, если в методе нет оператора return или есть оператор return без операнда. <code>void</code>, если вы пишете async <b>обработчик события</b>. Любой другой тип, у которого есть метод <code>GetAwaiter</code>.»</span> (напр. <code>ValueTask&lt;TResult&gt;</code>). Плюс <code>IAsyncEnumerable&lt;T&gt;</code> для async-стримов. По умолчанию выбирай <code>Task</code>/<code>Task&lt;T&gt;</code>; <code>void</code> — исключение для событий, task-like — для горячих путей (разбор 05).',
      sources: ["ms-tap", "ms-return"],
    },
    {
      id: "s2", num: "02", kicker: "Task vs Task<T>", title: "Task — без значения, Task<T> — значение через await",
      viewBox: "0 0 340 210", zones: TASK_ZONES,
      code: ["async Task NoValue(){ await Task.Delay(1); }        // Task", "async Task<int> WithValue(){ await Task.Delay(1); return 42; }", "await NoValue(); int r = await WithValue();   // r == 42"],
      predictAt: 2, predictQ: '<code>await NoValue()</code> (печатает "done") и <code>int r = await WithValue()</code> (return 42). Что напечатает <code>r</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>async Task</code> — нет <code>return</code>-операнда: <code>await</code> просто дожидается завершения. У <code>Task</code> НЕТ <code>Result</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "task", row: 0 }, state: "ok", label: "await NoValue()", detail: "done", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>async Task&lt;int&gt;</code> — <code>return 42</code>: <code>await</code> достаёт значение <b>42</b> из задачи.', nodes: [{ id: "t", kind: "gate", at: { zone: "task", row: 0 }, state: "ok", label: "NoValue", detail: "done" }, { id: "tt", kind: "gate", at: { zone: "taskt", row: 0 }, state: "ok", label: "await WithValue()", detail: "42", accent: true }], edges: [] },
        { codeLine: 2, out: "done 42", caption: 'Печать: <b>done 42</b> — <code>Task</code> дал только «сделано», <code>Task&lt;int&gt;</code> дал значение через await (реальный прогон).', nodes: [{ id: "res", kind: "gate", at: { zone: "taskt", row: 0 }, state: "ok", label: "r", detail: "42", accent: true }], edges: [] },
      ],
      explain: 'Два основных типа: «You specify <code>Task&lt;TResult&gt;</code> as the return type if the method contains a <code>return</code> statement that specifies an operand of type <code>TResult</code>. You use <code>Task</code> as the return type if the method has no return statement or has a return statement that doesn\'t return an operand» <span class="ru-tr">«Вы указываете <code>Task&lt;TResult&gt;</code> как тип возврата, если метод содержит оператор <code>return</code>, задающий операнд типа <code>TResult</code>. Вы используете <code>Task</code> как тип возврата, если у метода нет оператора return или есть оператор return, не возвращающий операнд.»</span>. Прогон: <code>NoValue</code> (Task) даёт «done» через <code>await</code>, <code>WithValue</code> (Task&lt;int&gt;) даёт <b>42</b>. Ключ: <code>Task</code> — «дождись», <code>Task&lt;T&gt;</code> — «дождись и возьми значение», всегда через <code>await</code> (не <code>.Result</code> — разбор границ).',
      sources: ["ms-tap"],
    },
    {
      id: "s3", num: "03", kicker: "async void · ловушка", title: "void — только для event handlers, нельзя await",
      viewBox: "0 0 340 210", zones: VOID_ZONES,
      code: ["button.Click += async (s,e) => { ... };   // ОК: event handler", "async void DoWork(){ ... }                  // ловушка: нельзя await", "// исключение из async void: caller can't catch → unhandled → crash"],
      scenes: [
        { codeLine: 0, caption: '<code>async void</code> оправдан <span class="hl">только</span> как обработчик события (там <code>void</code> обязателен по контракту).', nodes: [{ id: "ok", kind: "gate", at: { zone: "void", row: 0 }, state: "ok", label: "event handler", detail: "async void OK", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Для прочих методов <code>async void</code> — ловушка: его <span class="hl">нельзя await</span>, вызывающий не отследит завершение.', nodes: [{ id: "ok", kind: "gate", at: { zone: "void", row: 0 }, state: "ok", label: "event handler", detail: "OK" }, { id: "no", kind: "gate", at: { zone: "void", row: 1 }, state: "fail", label: "async void метод", detail: "нельзя await", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Исключение из <code>async void</code> вызывающий <span class="hl">не может поймать</span> — оно остаётся необработанным и, «likely to cause your application to fail» <span class="ru-tr">«скорее всего приведёт к сбою вашего приложения»</span>, обрушивает приложение.', nodes: [{ id: "no", kind: "gate", at: { zone: "void", row: 0 }, state: "fail", label: "исключение", detail: "unhandled · crash", accent: true }], edges: [] },
      ],
      explain: 'Дословно про <code>void</code> (async-return-types): «You use the <code>void</code> return type in asynchronous event handlers, which require a <code>void</code> return type. For methods other than event handlers that don\'t return a value, you should return a <code>Task</code> instead, because <span class="hl">an async method that returns <code>void</code> can\'t be awaited</span>» <span class="ru-tr">«Вы используете тип возврата <code>void</code> в асинхронных обработчиках событий, которым нужен тип возврата <code>void</code>. Для методов, отличных от обработчиков событий, которые не возвращают значение, вам следует вместо этого возвращать <code>Task</code>, потому что async-метод, возвращающий <code>void</code>, нельзя дождаться через await.»</span>. И про исключения — дословно: «The caller of a void-returning async method <span class="hl">can\'t catch exceptions thrown from the method</span>. <span class="hl">Such unhandled exceptions are likely to cause your application to fail</span>» <span class="ru-tr">«Вызывающий async-метод без возвращаемого значения не может поймать исключения, брошенные из метода. Такие необработанные исключения скорее всего приведут к сбою вашего приложения.»</span> (проверено — такой сниппет реально роняет процесс, потому его нет в exec-карточках урока). Правило (тоже дословно): «Make sure that any async method that can produce an exception has a return type of <code>Task</code> or <code>Task&lt;TResult&gt;</code> and that calls to the method are awaited» <span class="ru-tr">«Убедитесь, что любой async-метод, способный породить исключение, имеет тип возврата <code>Task</code> или <code>Task&lt;TResult&gt;</code> и что вызовы этого метода дожидаются через await.»</span>; <code>void</code> — только для событий.',
      sources: ["ms-return"],
    },
    {
      id: "s4", num: "04", kicker: "Исключения · Task ловит, void нет", title: "async Task: исключение в задаче, await ловит",
      viewBox: "0 0 340 210", zones: EXC_ZONES,
      code: ["async Task Safe(){ await Task.Delay(1); throw new InvalidOperationException(\"boom\"); }", "try { await Safe(); } catch (InvalidOperationException e) { /* поймано! */ }", "// у async void этот catch НЕ сработал бы"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>async Task</code> метод бросает исключение — оно <span class="hl">складывается в задачу</span> (faulted), а не летит синхронно.', nodes: [{ id: "t", kind: "gate", at: { zone: "taskexc", row: 0 }, state: "fail", label: "Safe() throws", detail: "в задачу", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>await Safe()</code> перебрасывает исключение из задачи — <code>try/catch</code> вокруг <code>await</code> его <span class="hl">ловит</span>.', nodes: [{ id: "t", kind: "gate", at: { zone: "taskexc", row: 0 }, state: "ok", label: "await + catch", detail: "поймано", accent: true }, { id: "v", kind: "gate", at: { zone: "voidexc", row: 0 }, state: "fail", label: "async void", detail: "escape" }], edges: [] },
        { codeLine: 1, out: "Task caught: boom", caption: 'Печать: <b>Task caught: boom</b> — исключение из <code>async Task</code> поймано. У <code>async void</code> тот же <code>catch</code> не сработал бы (реальный прогон).', nodes: [{ id: "c", kind: "gate", at: { zone: "taskexc", row: 0 }, state: "ok", label: "catch", detail: "boom" }, { id: "v", kind: "gate", at: { zone: "voidexc", row: 0 }, state: "fail", label: "void", detail: "crash", accent: true }], edges: [] },
      ],
      explain: 'Разница async Task и async void в исключениях — ядро выбора типа. Дословно (async-return-types): «If a method that returns a <code>Task</code> or <code>Task&lt;TResult&gt;</code> throws an exception, <span class="hl">the exception is stored in the returned task. The exception is rethrown when the task is awaited</span>» <span class="ru-tr">«Если метод, возвращающий <code>Task</code> или <code>Task&lt;TResult&gt;</code>, бросает исключение, это исключение сохраняется в возвращённой задаче. Исключение перебрасывается, когда задача дожидается через await.»</span>. Поэтому <code>try/catch</code> вокруг <code>await Safe()</code> ловит исключение (прогон: <code>Task caught: boom</code>). А у <code>async void</code> ловить нечего: «The caller of a void-returning async method <span class="hl">can\'t catch exceptions thrown from the method</span>. Such unhandled exceptions are likely to cause your application to fail» <span class="ru-tr">«Вызывающий async-метод без возвращаемого значения не может поймать исключения, брошенные из метода. Такие необработанные исключения скорее всего приведут к сбою вашего приложения.»</span>. Вот почему для «fire-and-forget» с обработкой ошибок нужен <code>Task</code> (можно <code>await</code> и обернуть <code>try/catch</code>), а не <code>void</code>.',
      sources: ["ms-return"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · reference vs value", title: "Task<T> — reference type, ValueTask<T> — value type",
      viewBox: "0 0 340 210", zones: TYPE_ZONES,
      code: ["typeof(Task<int>).IsValueType         // False — reference type", "typeof(ValueTask<int>).IsValueType     // True  — value type", "// Task аллоцируется из кучи; ValueTask — struct на стеке"],
      predictAt: 1, predictQ: '<code>typeof(ValueTask&lt;int&gt;).IsValueType</code> и <code>typeof(Task&lt;int&gt;).IsValueType</code> — что даст пара?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Task&lt;int&gt;</code> — <b>reference type</b>: каждый экземпляр <span class="hl">аллоцируется из кучи</span>.', nodes: [{ id: "t", kind: "obj", at: { zone: "ref", row: 0 }, typeTag: "Task<int>", value: "куча", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>ValueTask&lt;int&gt;</code> — <b>value type</b> (struct): без аллокации кучи при синхронном завершении.', nodes: [{ id: "t", kind: "obj", at: { zone: "ref", row: 0 }, typeTag: "Task<int>", value: "куча" }, { id: "v", kind: "obj", at: { zone: "val", row: 0 }, typeTag: "ValueTask<int>", value: "struct", accent: true }], edges: [] },
        { codeLine: 2, out: "True False", caption: 'Панель: <code>ValueTask&lt;int&gt;.IsValueType</code>=<b>True</b>, <code>Task&lt;int&gt;.IsValueType</code>=<b>False</b> (реальный прогон). Это корень перф-компромисса.', nodes: [{ id: "tv", kind: "gate", at: { zone: "val", row: 0 }, state: "ok", label: "ValueTask IsValueType", detail: "True" }, { id: "tf", kind: "gate", at: { zone: "ref", row: 0 }, state: "fail", label: "Task IsValueType", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — тип-категория return-типов, снятая через рефлексию. Дословно (async-return-types): «Because <code>Task</code> and <code>Task&lt;TResult&gt;</code> are <span class="hl">reference types</span>, memory allocation in performance-critical paths, particularly when allocations occur in tight loops, can adversely affect performance. Support for generalized return types means that you can <span class="hl">return a lightweight value type instead of a reference type</span> to avoid more memory allocations» <span class="ru-tr">«Поскольку <code>Task</code> и <code>Task&lt;TResult&gt;</code> — ссылочные типы, выделение памяти на путях, критичных к производительности, особенно когда выделения происходят в плотных циклах, может неблагоприятно сказаться на производительности. Поддержка обобщённых типов возврата означает, что вы можете вернуть лёгкий значимый тип вместо ссылочного типа, чтобы избежать лишних выделений памяти.»</span>. Прогон: <code>ValueTask&lt;int&gt;.IsValueType</code> → <b>True</b> (struct), <code>Task&lt;int&gt;.IsValueType</code> → <b>False</b> (reference type). Отсюда весь смысл <code>ValueTask</code>: когда результат часто готов синхронно и метод в горячем цикле, value-обёртка избегает лишних аллокаций <code>Task</code>. Но это не «всегда быстрее» — трейдофы и ограничения в S2.5.',
      sources: ["ms-tap", "ms-return"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task NoValue(){ await Task.Delay(1); Console.Write("done "); } async Task&lt;int&gt; WithValue(){ await Task.Delay(1); return 42; } await NoValue(); int r = await WithValue(); Console.WriteLine(r);</code> — что напечатает?',
      options: ["done 42", "42 done", "done 0", "42"], correctIndex: 0, xp: 10,
      okText: '<code>Task</code> — без значения (просто «done»), <code>Task&lt;int&gt;</code> — значение <b>42</b> через <code>await</code>. Печать: <b>done 42</b>.',
      noText: '«Task<TResult> if… return… operand of type TResult; Task if… no return operand» <span class="ru-tr">«Task<TResult>, если… return… операнд типа TResult; Task, если… нет операнда return»</span>. Реальный вывод: <b>done 42</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "done 42" }, sourceRefs: ["ms-tap"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task Safe(){ await Task.Delay(1); throw new InvalidOperationException("boom"); } try { await Safe(); } catch (InvalidOperationException e) { Console.WriteLine($"Task caught: {e.Message}"); }</code> — что напечатает?',
      options: ["Task caught: boom", "(ничего, приложение падает)", "boom", "Task caught: "], correctIndex: 0, xp: 10,
      okText: 'У <code>async Task</code> исключение <span class="hl">хранится в задаче</span> и перебрасывается на <code>await</code>: <code>try/catch</code> его ловит → <b>Task caught: boom</b>. У <code>async void</code> — НЕ поймалось бы.',
      noText: 'Исключение из <code>async Task</code> всплывает на <code>await</code> — ловится обычным <code>catch</code>. Реальный вывод: <b>Task caught: boom</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Task caught: boom" }, sourceRefs: ["ms-tap"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine($"{typeof(ValueTask&lt;int&gt;).IsValueType} {typeof(Task&lt;int&gt;).IsValueType}");</code> — что напечатает?',
      options: ["True False", "False True", "True True", "False False"], correctIndex: 0, xp: 10,
      okText: '<code>ValueTask&lt;int&gt;</code> — <b>value type</b> (struct, True), <code>Task&lt;int&gt;</code> — <b>reference type</b> (False, аллоцируется из кучи). Это корень хот-пас-компромисса.',
      noText: '«Because <code>Task</code> and <code>Task&lt;TResult&gt;</code> are reference types» <span class="ru-tr">«Поскольку <code>Task</code> и <code>Task&lt;TResult&gt;</code> — ссылочные типы»</span>; <code>ValueTask&lt;T&gt;</code> — value type (struct). Реальный вывод: <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-return"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Карта типов", v: '<code>Task</code> — без значения, <code>Task&lt;T&gt;</code> — значение через <code>await</code>, <code>void</code> — <span class="hl">только event handler</span>, task-like/<code>IAsyncEnumerable</code> — advanced/stream. По умолчанию — Task/Task<T>.' },
    { icon: "cost", k: "async void опасен", v: '<code>async void</code> <b>нельзя await</b>, его исключения <span class="hl">не ловятся</span> вызывающим и обрушивают приложение. У <code>async Task</code> исключение живёт в задаче и ловится на <code>await</code> (замер: «Task caught: boom»).' },
    { icon: "avoid", k: "reference vs value", v: '<code>Task&lt;T&gt;</code> — <b>reference</b> (аллокация кучи), <code>ValueTask&lt;T&gt;</code> — <b>value type</b> (замер: True False). <code>Task&lt;T&gt;.Result</code> — <span class="hl">блокирующее</span> (дедлок), бери через <code>await</code>.' },
  ],

  foot: 'урок · <b>async return types</b> · 5 анимир. разборов · панель reference vs value type · дизайн <b>mid</b>',
};
