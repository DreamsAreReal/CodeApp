/**
 * Lesson: AggregateException — Flatten / Handle / TPL (CS.S9.aggregate-exception) — expert density, 5
 * animated deep-dives. AggregateException consolidates multiple failures into ONE throwable object;
 * the TPL wraps task exceptions in it — and even a SINGLE exception is still wrapped. InnerExceptions
 * is the read-only collection of the real causes. Attached child tasks produce NESTED aggregates;
 * Flatten() collapses them so InnerExceptions holds the real exceptions. Handle(Func<Exception,bool>)
 * filters: return true = handled, false = rethrown in a NEW AggregateException after Handle returns.
 *
 * This is the S9 OBJECT-level treatment (the AggregateException class, Handle, Flatten, TPL wrapping),
 * complementing CS.S2.exceptions which is about the async CONSUMPTION split (await unwraps vs .Wait
 * wraps). The two share the topic but not the cards: S2 numbers are before=2/after=3 & innerCount=3;
 * S9 numbers here are count=1/inner=InvalidOperationException, handled=1 rethrown=1, count=2/anyNested=False.
 *
 * SIGNATURE machine panel (s5): Handle's boolean contract — true consumes an inner, false rethrows the
 * rest in a new aggregate. REAL run-csharp measurement (this file's exec cards): "handled=1 rethrown=1".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from standard/parallel-programming/exception-handling-task-
 *     parallel-library and the AggregateException API Remarks (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1
 *     "AggregateException|count=1|inner=InvalidOperationException" (a single task exception is still
 *     wrapped) · c2 "handled=1 rethrown=1" (Handle true=handled/false=rethrown) · c3
 *     "count=2 anyNested=False" (Flatten collapses a nested aggregate to real inners).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.aggregate-exception/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: consolidate many failures into one object.
const Z_MANY: Zone = { id: "many", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МНОГО ОШИБОК", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "из задач", subCls: "vz-zsub heap", subY: 47 };
const Z_ONE: Zone = { id: "one", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОДИН ОБЪЕКТ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "AggregateException", subCls: "vz-zsub", subY: 47 };
const CONS_ZONES: Zone[] = [Z_MANY, Z_ONE];

// s2: even a single exception is wrapped by .Wait().
const Z_TASK: Zone = { id: "task", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОДНА задача бросает", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "task.Wait()", subCls: "vz-zsub heap", subY: 47 };
const Z_WRAP: Zone = { id: "wrap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "всё равно ОБЁРНУТО", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "InnerExceptions[0]", subCls: "vz-zsub", subY: 47 };
const WRAP_ZONES: Zone[] = [Z_TASK, Z_WRAP];

// s3: nested aggregates from attached child tasks + Flatten.
const Z_NESTED: Zone = { id: "nested", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ВЛОЖЕННЫЕ агрегаты", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "attached child tasks", subCls: "vz-zsub heap", subY: 47 };
const Z_FLAT: Zone = { id: "flat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Flatten()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "плоский список причин", subCls: "vz-zsub good", subY: 47 };
const FLAT_ZONES: Zone[] = [Z_NESTED, Z_FLAT];

// s4: don't just catch-and-ignore aggregate.
const Z_BAD: Zone = { id: "bad", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "catch без разбора", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "= catch (Exception)", subCls: "vz-zsub heap", subY: 47 };
const Z_GOOD: Zone = { id: "good", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "перебери InnerExceptions", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "handle each individually", subCls: "vz-zsub good", subY: 47 };
const OBS_ZONES: Zone[] = [Z_BAD, Z_GOOD];

// s5 (SIGNATURE): Handle boolean contract.
const Z_HANDLE: Zone = { id: "handle", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "Handle(ex => bool) · true=обработано · false=переброс", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "false → new AggregateException с необработанными", subCls: "vz-zsub", subY: 40 };
const HANDLE_ZONES: Zone[] = [Z_HANDLE];

export const aggregateException: LessonData = {
  id: "CS.S9.aggregate-exception",
  track: "CS",
  section: "CS.S9",
  module: "S9.7",
  lang: "csharp",
  title: "AggregateException: Flatten, Handle, TPL",
  kicker: "C# вглубь · S9 · агрегат ошибок",
  home: { subtitle: "consolidate в один объект, .Wait оборачивает, Flatten, Handle", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S9.custom-exceptions"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tplexc", kind: "doc", org: "Microsoft Learn", title: "Exception handling (Task Parallel Library)", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library", date: "2022-06-08" },
    { id: "ms-aggapi", kind: "doc", org: "Microsoft Learn", title: "AggregateException Class (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.aggregateexception", date: "2025-07-01" },
  ],

  spec: [
    { text: "«AggregateException is used to consolidate multiple failures into a single, throwable exception object.» <span class=\"ru-tr\">«AggregateException используется, чтобы объединить несколько сбоев в один бросаемый объект-исключение.»</span>", source: "ms-aggapi" },
    { text: "«To propagate all the exceptions back to the calling thread, the Task infrastructure wraps them in an AggregateException instance.» <span class=\"ru-tr\">«Чтобы вернуть все исключения обратно в вызывающий поток, инфраструктура Task оборачивает их в экземпляр AggregateException.»</span> — «Even if only one exception is thrown, it is still wrapped in an AggregateException». <span class=\"ru-tr\">«Даже если брошено всего одно исключение, оно всё равно обёрнуто в AggregateException».</span>", source: "ms-tplexc" },
  ],
  edgeCases: [
    { text: "<code>InnerExceptions</code> — «a <b>read-only collection</b> of the <code>Exception</code> instances that caused the current exception» <span class=\"ru-tr\">«<b>коллекция только для чтения</b> экземпляров <code>Exception</code>, которые вызвали текущее исключение»</span>; его «can be enumerated to examine all the original exceptions that were thrown» <span class=\"ru-tr\">«можно перечислить, чтобы изучить все исходные брошенные исключения»</span>.", source: ["ms-aggapi", "ms-tplexc"] },
    { text: "Вложенность от attached child: «the <code>InnerExceptions</code> property… contains <b>one or more <code>AggregateException</code> instances, not the original exceptions</b>» <span class=\"ru-tr\">«свойство <code>InnerExceptions</code>… содержит <b>один или несколько экземпляров <code>AggregateException</code>, а не исходные исключения</b>»</span>; <code>Flatten</code> «Flattens an <code>AggregateException</code> instances into a single, new instance». <span class=\"ru-tr\">«Распрямляет экземпляры <code>AggregateException</code> в один новый экземпляр».</span>", source: ["ms-tplexc", "ms-aggapi"] },
    { text: "Не глотай агрегат целиком: «To catch an exception without taking specific actions to recover from it can <b>leave your program in an indeterminate state</b>». <span class=\"ru-tr\">«Поймать исключение, не предпринимая конкретных действий для восстановления, может <b>оставить вашу программу в неопределённом состоянии</b>».</span>", source: "ms-tplexc" },
    { text: "Не наблюдено → эскалация: «If you do not wait on a task that propagates an exception, or access its <code>Exception</code> property, the exception is <b>escalated</b>… when the task is garbage-collected». <span class=\"ru-tr\">«Если вы не дождётесь задачи, которая распространяет исключение, или не обратитесь к её свойству <code>Exception</code>, исключение <b>эскалируется</b>… когда задача собирается сборщиком мусора».</span>", source: "ms-tplexc" },
  ],

  misconceptions: [
    {
      wrong: "AggregateException — это одно исключение; catch (AggregateException) достаточно, чтобы «обработать» группу",
      hook: '<code>AggregateException</code> — <b>контейнер</b> многих ошибок в одном объекте: «<span class="hl">AggregateException is used to consolidate multiple failures into a single, throwable exception object</span>». <span class="ru-tr">«AggregateException используется, чтобы объединить несколько сбоев в один бросаемый объект-исключение».</span> TPL кладёт в него исключения задач: «To propagate all the exceptions back to the calling thread, the Task infrastructure <span class="hl">wraps them in an AggregateException instance</span>» <span class="ru-tr">«Чтобы вернуть все исключения обратно в вызывающий поток, инфраструктура Task оборачивает их в экземпляр AggregateException».</span> — и «<span class="hl">Even if only one exception is thrown, it is still wrapped</span>». <span class="ru-tr">«Даже если брошено всего одно исключение, оно всё равно обёрнуто».</span> Просто поймать агрегат и не смотреть внутрь — плохо: «To catch an exception without taking specific actions to recover from it can <span class="hl">leave your program in an indeterminate state</span>». <span class="ru-tr">«Поймать исключение, не предпринимая конкретных действий для восстановления, может оставить вашу программу в неопределённом состоянии».</span> Настоящие причины — в <code>InnerExceptions</code>; <code>Flatten()</code> распрямляет вложенность, <code>Handle</code> фильтрует. Дальше <b>пять разборов</b>: консолидация в один объект, обёртка даже одного, вложенность + <code>Flatten</code>, наблюдение через <code>InnerExceptions</code>, и <b>машинная панель</b> — булев контракт <code>Handle</code> (реальный прогон: handled=1 rethrown=1).',
      source: ["ms-aggapi", "ms-tplexc"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Консолидация", title: "AggregateException собирает много ошибок в один объект",
      viewBox: "0 0 340 210", zones: CONS_ZONES,
      code: ["// три задачи бросают три разных исключения", "// Task.WaitAll собирает их все в ОДИН AggregateException", "catch (AggregateException ae) { foreach (var e in ae.InnerExceptions) … }"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Параллельно бегущие задачи могут упасть <b>каждая по-своему</b> — несколько исключений сразу. Как отдать их одним броском?', nodes: [{ id: "m1", kind: "obj", at: { zone: "many", row: 0 }, typeTag: "task1", value: "IOException" }, { id: "m2", kind: "obj", at: { zone: "many", row: 1 }, typeTag: "task2", value: "ArgumentException", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>AggregateException</code> — «<span class="hl">consolidate multiple failures into a single, throwable exception object</span>». <span class="ru-tr">«объединить несколько сбоев в один бросаемый объект-исключение».</span> Обёртка над списком настоящих причин.', nodes: [{ id: "m1", kind: "obj", at: { zone: "many", row: 0 }, typeTag: "task1", value: "IOException" }, { id: "m2", kind: "obj", at: { zone: "many", row: 1 }, typeTag: "task2", value: "ArgumentException" }, { id: "a", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "AggregateException", value: "InnerExceptions", accent: true }], edges: [{ id: "e1", from: "m1", to: "a" }, { id: "e2", from: "m2", to: "a", accent: true }] },
        { codeLine: 2, out: "", caption: 'Перебираешь <code>InnerExceptions</code> — «<span class="hl">a read-only collection of the Exception instances that caused the current exception</span>» <span class="ru-tr">«коллекция только для чтения экземпляров Exception, которые вызвали текущее исключение».</span> — и обрабатываешь каждую.', nodes: [{ id: "a", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "AggregateException", value: "InnerExceptions" }, { id: "i", kind: "chip", at: { zone: "one", row: 1 }, value: "[IOException, ArgumentException]", accent: true }], edges: [] },
      ],
      explain: '<code>AggregateException</code> решает проблему «много ошибок — один канал возврата». «<span class="hl">AggregateException is used to consolidate multiple failures into a single, throwable exception object</span>. It is used extensively in the Task Parallel Library (TPL) and Parallel LINQ (PLINQ)». <span class="ru-tr">«AggregateException используется, чтобы объединить несколько сбоев в один бросаемый объект-исключение. Он широко применяется в Task Parallel Library (TPL) и Parallel LINQ (PLINQ)».</span> Когда «you are waiting on multiple tasks, <span class="hl">multiple exceptions could be thrown</span>» <span class="ru-tr">«вы ожидаете несколько задач, может быть брошено несколько исключений».</span> — TPL не может бросить их по одному, поэтому «the Task infrastructure <span class="hl">wraps them in an AggregateException instance</span>». <span class="ru-tr">«инфраструктура Task оборачивает их в экземпляр AggregateException».</span> Реальные причины лежат в <code>InnerExceptions</code> — «a <span class="hl">read-only collection of the Exception instances that caused the current exception</span>» <span class="ru-tr">«коллекция только для чтения экземпляров Exception, которые вызвали текущее исключение»</span>, которую «can be enumerated to examine all the original exceptions that were thrown, and handle (or not handle) each one individually». <span class="ru-tr">«можно перечислить, чтобы изучить все исходные брошенные исключения и обработать (или не обработать) каждое по отдельности».</span> То есть агрегат — не «ошибка», а <b>перечислимый контейнер</b> ошибок.',
      sources: ["ms-aggapi", "ms-tplexc"],
    },
    {
      id: "s2", num: "02", kicker: "Даже одно — обёрнуто", title: ".Wait() оборачивает даже единственное исключение",
      viewBox: "0 0 340 210", zones: WRAP_ZONES,
      code: ["var task = Task.Run(() => throw new InvalidOperationException(\"boom\"));", "try { task.Wait(); }", "catch (AggregateException ae) { /* ae.InnerExceptions.Count == 1 */ }"],
      predictAt: 1, predictQ: '<b>Одна</b> задача бросает <code>InvalidOperationException</code>; ловим через <code>task.Wait()</code>. Какой тип у пойманного, сколько в <code>InnerExceptions</code> и какой там внутренний?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Всего <b>одна</b> задача и <b>одно</b> исключение <code>InvalidOperationException</code>. Логично ждать именно его в <code>catch</code>?', nodes: [{ id: "t", kind: "obj", at: { zone: "task", row: 0 }, typeTag: "Task.Run", value: "throw InvalidOp", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Нет: <code>.Wait()</code> всё равно оборачивает. «<span class="hl">Even if only one exception is thrown, it is still wrapped in an AggregateException</span>». <span class="ru-tr">«Даже если брошено всего одно исключение, оно всё равно обёрнуто в AggregateException».</span> Ловишь <code>AggregateException</code>.', nodes: [{ id: "t", kind: "obj", at: { zone: "task", row: 0 }, typeTag: "Task.Run", value: "throw InvalidOp" }, { id: "a", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "AggregateException", value: "Count=1", accent: true }], edges: [{ id: "e1", from: "t", to: "a", accent: true }] },
        { codeLine: 2, out: "AggregateException|count=1|inner=InvalidOperationException", caption: 'Панель: <span class="hl">AggregateException|count=1|inner=InvalidOperationException</span> (реальный прогон) — обёртка есть, а настоящий тип — в <code>InnerExceptions[0]</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "AggregateException", value: "Count=1" }, { id: "i", kind: "obj", at: { zone: "wrap", row: 1 }, typeTag: "InnerExceptions[0]", value: "InvalidOperationException", accent: true }], edges: [] },
      ],
      explain: 'Синхронное ожидание задачи всегда даёт агрегат — даже на одном исключении. «Exceptions are propagated when you use one of the static or instance <code>Task.Wait</code> methods, and you handle them by enclosing the call in a <code>try</code>/<code>catch</code> statement… To propagate all the exceptions back to the calling thread, the Task infrastructure <span class="hl">wraps them in an AggregateException instance</span>. … <span class="hl">Even if only one exception is thrown, it is still wrapped in an AggregateException exception</span>». <span class="ru-tr">«Исключения распространяются, когда вы используете один из статических методов или методов экземпляра <code>Task.Wait</code>, и вы обрабатываете их, заключая вызов в оператор <code>try</code>/<code>catch</code>… Чтобы вернуть все исключения обратно в вызывающий поток, инфраструктура Task оборачивает их в экземпляр AggregateException. … Даже если брошено всего одно исключение, оно всё равно обёрнуто в исключение AggregateException».</span> Реальный прогон подтверждает: <code>Count == 1</code>, а <code>InnerExceptions[0]</code> — исходный <code>InvalidOperationException</code>. Контраст с async: «The <code>AggregateException</code> <b>cannot be explicitly caught</b> when using… <code>await task</code>… <code>task.GetAwaiter().GetResult()</code>» <span class="ru-tr">«<code>AggregateException</code> <b>нельзя явно поймать</b> при использовании… <code>await task</code>… <code>task.GetAwaiter().GetResult()</code>»</span> — там первое внутреннее разворачивается (см. раздел про async). Здесь, при <code>.Wait()</code>, ловишь именно обёртку и лезешь в <code>InnerExceptions</code>.',
      sources: ["ms-tplexc"],
    },
    {
      id: "s3", num: "03", kicker: "Вложенность · Flatten", title: "Attached child → вложенные агрегаты; Flatten() распрямляет",
      viewBox: "0 0 340 210", zones: FLAT_ZONES,
      code: ["var inner = new AggregateException(new Exception(\"x\"), new Exception(\"y\"));", "var outer = new AggregateException(inner);   // агрегат ВНУТРИ агрегата", "var flat = outer.Flatten();   // распрямить в один уровень"],
      predictAt: 1, predictQ: '<code>outer</code> содержит один вложенный <code>inner</code>-агрегат (x, y). После <code>outer.Flatten()</code> — сколько в <code>InnerExceptions</code> и остались ли там вложенные агрегаты?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Attached child tasks строят <span class="hl">агрегат в агрегате</span>: «the <code>InnerExceptions</code> property… contains <b>one or more <code>AggregateException</code> instances, not the original exceptions</b>». <span class="ru-tr">«свойство <code>InnerExceptions</code>… содержит <b>один или несколько экземпляров <code>AggregateException</code>, а не исходные исключения</b>».</span>', nodes: [{ id: "o", kind: "obj", at: { zone: "nested", row: 0 }, typeTag: "outer", value: "→ inner (агрегат)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Flatten()</code> — «<span class="hl">Flattens an AggregateException instances into a single, new instance</span>» <span class="ru-tr">«Распрямляет экземпляры AggregateException в один новый экземпляр».</span> — убирает вложенные агрегаты, оставляя настоящие причины.', nodes: [{ id: "o", kind: "obj", at: { zone: "nested", row: 0 }, typeTag: "outer", value: "агрегат внутри" }, { id: "f", kind: "obj", at: { zone: "flat", row: 0 }, typeTag: "Flatten()", value: "x, y", accent: true }], edges: [{ id: "e1", from: "o", to: "f", accent: true }] },
        { codeLine: 2, out: "count=2 anyNested=False", caption: 'Панель: <span class="hl">count=2 anyNested=False</span> (реальный прогон) — два настоящих <code>Exception</code>, ни одного вложенного агрегата. Один цикл вместо спуска по дереву.', nodes: [{ id: "f", kind: "obj", at: { zone: "flat", row: 0 }, typeTag: "Flatten().Inner", value: "count=2" }, { id: "n", kind: "gate", at: { zone: "flat", row: 1 }, state: "ok", label: "anyNested", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Вложенность агрегатов — норма при иерархии задач. «If a task has an attached child task that throws an exception, that exception is <span class="hl">wrapped in an AggregateException before it is propagated to the parent task</span>, which wraps that exception in its own <code>AggregateException</code>» <span class="ru-tr">«Если у задачи есть присоединённая дочерняя задача, которая бросает исключение, это исключение оборачивается в AggregateException, прежде чем распространиться в родительскую задачу, которая оборачивает это исключение в собственный <code>AggregateException</code>».</span>; поэтому «the <code>InnerExceptions</code> property… <span class="hl">contains one or more AggregateException instances, not the original exceptions</span>». <span class="ru-tr">«свойство <code>InnerExceptions</code>… содержит один или несколько экземпляров AggregateException, а не исходные исключения».</span> Чтобы не спускаться по дереву руками — «you can use the <span class="hl">Flatten method to remove all the nested AggregateException exceptions</span>, so that the <code>AggregateException.InnerExceptions</code> property contains the original exceptions». <span class="ru-tr">«можно использовать метод Flatten, чтобы удалить все вложенные исключения AggregateException, так что свойство <code>AggregateException.InnerExceptions</code> будет содержать исходные исключения».</span> API формулирует то же: <code>Flatten()</code> «<span class="hl">Flattens an AggregateException instances into a single, new instance</span>». <span class="ru-tr">«Распрямляет экземпляры AggregateException в один новый экземпляр».</span> Реальный прогон: после <code>Flatten()</code> — <code>count=2</code> настоящих исключения, <code>anyNested=False</code>. Обрабатывай в один цикл.',
      sources: ["ms-tplexc", "ms-aggapi"],
    },
    {
      id: "s4", num: "04", kicker: "Наблюдение", title: "Не глотай агрегат — перебирай InnerExceptions; иначе эскалация",
      viewBox: "0 0 340 210", zones: OBS_ZONES,
      code: ["catch (AggregateException) { }   // ⛔ поймал и НЕ смотрел внутрь — как catch(Exception)", "catch (AggregateException ae) { foreach (var e in ae.InnerExceptions) Handle(e); }  // ✅", "// а если вообще не наблюдать задачу — эскалация при GC"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Поймать агрегат и <b>не</b> разбирать — плохо: «analogous to <span class="hl">catching the base Exception type in non-parallel scenarios</span>» <span class="ru-tr">«аналогично перехвату базового типа Exception в непараллельных сценариях».</span> — прячет реальные ошибки.', nodes: [{ id: "b", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "catch без разбора", detail: "indeterminate state", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Правильно — перебрать <code>InnerExceptions</code> и «<span class="hl">handle (or not handle) each one individually</span>» <span class="ru-tr">«обработать (или не обработать) каждое по отдельности»</span>, или отдать в <code>Handle</code>. Настоящие причины — внутри.', nodes: [{ id: "b", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "catch без разбора", detail: "плохо" }, { id: "g", kind: "gate", at: { zone: "good", row: 0 }, state: "ok", label: "foreach InnerExceptions", detail: "разобрать", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'А совсем не наблюдать задачу — ошибка всплывёт поздно: «the exception is <span class="hl">escalated</span>… when the task is garbage-collected». <span class="ru-tr">«исключение эскалируется… когда задача собирается сборщиком мусора».</span> «Забыл дождаться» = скрытый сбой.', nodes: [{ id: "g", kind: "gate", at: { zone: "good", row: 0 }, state: "ok", label: "наблюдай", detail: "InnerExceptions" }, { id: "e", kind: "gate", at: { zone: "bad", row: 1 }, state: "fail", label: "не наблюдал", detail: "эскалация @ GC", accent: true }], edges: [] },
      ],
      explain: 'Агрегат надо <b>наблюсти по существу</b>, а не просто поймать. «You could avoid an unhandled exception by just catching the <code>AggregateException</code> and not observing any of the inner exceptions. However, we <span class="hl">recommend that you do not do this</span> because it is analogous to catching the base <code>Exception</code> type in non-parallel scenarios. To catch an exception without taking specific actions to recover from it can <span class="hl">leave your program in an indeterminate state</span>». <span class="ru-tr">«Вы могли бы избежать необработанного исключения, просто перехватив <code>AggregateException</code> и не наблюдая ни одно из внутренних исключений. Однако мы рекомендуем не делать так, потому что это аналогично перехвату базового типа <code>Exception</code> в непараллельных сценариях. Поймать исключение, не предпринимая конкретных действий для восстановления, может оставить вашу программу в неопределённом состоянии».</span> Наблюдать можно и без ожидания — «you can also retrieve the <code>AggregateException</code>… from the task\'s <code>Exception</code> property» <span class="ru-tr">«можно также получить <code>AggregateException</code>… из свойства <code>Exception</code> задачи»</span> при <code>TaskStatus.Faulted</code>. А полное игнорирование опасно: «If you do <span class="hl">not wait on a task that propagates an exception, or access its Exception property, the exception is escalated</span>… when the task is garbage-collected». <span class="ru-tr">«Если вы не дождётесь задачи, которая распространяет исключение, или не обратитесь к её свойству Exception, исключение эскалируется… когда задача собирается сборщиком мусора».</span> Правило: перебери <code>InnerExceptions</code> (или зови <code>Handle</code>), обработай каждую причину, неизвестное — переброс.',
      sources: ["ms-tplexc"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · Handle", title: "Handle(ex => bool): true = обработано, false = переброс в новом агрегате",
      viewBox: "0 0 340 210", zones: HANDLE_ZONES,
      code: ["var ae = new AggregateException(new C(\"a\"), new InvalidOperationException(\"b\"));", "ae.Handle(ex => ex is C);   // C → true (обработано), InvalidOp → false (переброс)", "// необработанные летят в НОВОМ AggregateException после возврата Handle"],
      predictAt: 1, predictQ: 'В агрегате две ошибки: <code>C</code> и <code>InvalidOperationException</code>. <code>Handle</code> возвращает <code>true</code> для <code>C</code>, <code>false</code> для остального. Сколько обработано и сколько переброшено?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Handle</code> зовёт делегат на <b>каждую</b> внутреннюю. Вернул <code>true</code> для <code>C</code> — «<span class="hl">treat as handled</span>» <span class="ru-tr">«считать обработанным»</span>: одна обработана.', nodes: [{ id: "h", kind: "gate", at: { zone: "handle", row: 0, col: 0 }, state: "ok", label: "C → true", detail: "обработано", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Для <code>InvalidOperationException</code> делегат вернул <code>false</code>: «Any exceptions for which the delegate returns <code>false</code> are <span class="hl">rethrown in a new AggregateException instance</span>». <span class="ru-tr">«Любые исключения, для которых делегат возвращает <code>false</code>, перебрасываются в новом экземпляре AggregateException».</span>', nodes: [{ id: "h", kind: "gate", at: { zone: "handle", row: 0, col: 0 }, state: "ok", label: "C → true", detail: "обработано" }, { id: "f", kind: "gate", at: { zone: "handle", row: 0, col: 1 }, state: "fail", label: "InvalidOp → false", detail: "переброс", accent: true }], edges: [] },
        { codeLine: 2, out: "handled=1 rethrown=1", caption: 'Панель: <span class="hl">handled=1 rethrown=1</span> (реальный прогон) — одна съедена (<code>true</code>), одна улетела в новом агрегате (<code>false</code>). Булев контракт <code>Handle</code>.', nodes: [{ id: "h", kind: "gate", at: { zone: "handle", row: 0, col: 0 }, state: "ok", label: "handled", detail: "1" }, { id: "f", kind: "gate", at: { zone: "handle", row: 0, col: 1 }, state: "fail", label: "rethrown", detail: "1", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — булев контракт <code>AggregateException.Handle</code>. «You can use the <code>AggregateException.Handle</code> method to <span class="hl">filter out exceptions that you can treat as "handled"</span>… In the user delegate… you can examine the exception type, its <code>Message</code> property, or any other information… <span class="hl">Any exceptions for which the delegate returns false are rethrown in a new AggregateException instance immediately after the Handle method returns</span>». <span class="ru-tr">«Можно использовать метод <code>AggregateException.Handle</code>, чтобы отфильтровать исключения, которые можно считать "обработанными"… В пользовательском делегате… можно исследовать тип исключения, его свойство <code>Message</code> или любую другую информацию… Любые исключения, для которых делегат возвращает false, перебрасываются в новом экземпляре AggregateException сразу после того, как метод Handle возвращает управление».</span> То есть <code>true</code> — «это я разрулил», <code>false</code> — «не моё, пусть летит дальше». API: <code>Handle</code> «<span class="hl">Invokes a handler on each Exception contained by this AggregateException</span>». <span class="ru-tr">«Вызывает обработчик на каждом Exception, содержащемся в этом AggregateException».</span> Реальный прогон: из двух внутренних одна (<code>C</code>) обработана (<code>true</code>), другая (<code>InvalidOperationException</code>) переброшена в новом агрегате (<code>false</code>) — печать <code>handled=1 rethrown=1</code>. Так <code>Handle</code> заменяет ручной <code>foreach</code> с <code>if</code>-фильтром и повторным <code>throw</code>.',
      sources: ["ms-tplexc", "ms-aggapi"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var task = Task.Run(() => throw new InvalidOperationException("boom")); string r; try { task.Wait(); r="none"; } catch (AggregateException ae) { r = $"{ae.GetType().Name}|count={ae.InnerExceptions.Count}|inner={ae.InnerExceptions[0].GetType().Name}"; } Console.WriteLine(r);</code> — что напечатает?',
      options: ["AggregateException|count=1|inner=InvalidOperationException", "InvalidOperationException|count=1|inner=InvalidOperationException", "AggregateException|count=0|inner=", "InvalidOperationException|count=0|inner=InvalidOperationException"], correctIndex: 0, xp: 10,
      okText: '«<span class="hl">Even if only one exception is thrown, it is still wrapped in an AggregateException</span>» <span class="ru-tr">«Даже если брошено всего одно исключение, оно всё равно обёрнуто в AggregateException»</span>: <code>.Wait()</code> ловится как агрегат, <code>Count==1</code>, а настоящий тип — в <code>InnerExceptions[0]</code>. Печать: <b>AggregateException|count=1|inner=InvalidOperationException</b>.',
      noText: '<code>.Wait()</code> оборачивает даже единственное исключение. Пойман <code>AggregateException</code>, внутри — один <code>InvalidOperationException</code>. Реальный вывод: <b>AggregateException|count=1|inner=InvalidOperationException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "AggregateException|count=1|inner=InvalidOperationException" }, sourceRefs: ["ms-tplexc"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class C : Exception { public C(string m):base(m){} } var ae = new AggregateException(new C("a"), new InvalidOperationException("b")); int handled=0; string r; try { ae.Handle(ex => { if (ex is C) { handled++; return true; } return false; }); r="all-handled"; } catch (AggregateException rethrown) { r = $"handled={handled} rethrown={rethrown.InnerExceptions.Count}"; } Console.WriteLine(r);</code> — что напечатает?',
      options: ["handled=1 rethrown=1", "all-handled", "handled=2 rethrown=0", "handled=1 rethrown=2"], correctIndex: 0, xp: 10,
      okText: '<code>Handle</code> зовёт делегат на каждую: <code>C</code>→<code>true</code> (обработано, handled=1), <code>InvalidOp</code>→<code>false</code>. «Any exceptions for which the delegate returns <code>false</code> are <span class="hl">rethrown in a new AggregateException</span>» <span class="ru-tr">«Любые исключения, для которых делегат возвращает <code>false</code>, перебрасываются в новом AggregateException»</span> → 1 переброшена. Печать: <b>handled=1 rethrown=1</b>.',
      noText: '<code>true</code> = обработано, <code>false</code> = переброс в новом агрегате. Одна съедена, одна улетела. Реальный вывод: <b>handled=1 rethrown=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "handled=1 rethrown=1" }, sourceRefs: ["ms-tplexc"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var inner = new AggregateException(new Exception("x"), new Exception("y")); var outer = new AggregateException(inner); var flat = outer.Flatten(); bool anyNested = false; foreach (var e in flat.InnerExceptions) if (e is AggregateException) anyNested = true; Console.WriteLine($"count={flat.InnerExceptions.Count} anyNested={anyNested}");</code> — что напечатает?',
      options: ["count=2 anyNested=False", "count=1 anyNested=True", "count=2 anyNested=True", "count=1 anyNested=False"], correctIndex: 0, xp: 10,
      okText: '<code>outer</code> держит один вложенный агрегат (x, y). <code>Flatten()</code> «<span class="hl">Flattens an AggregateException instances into a single, new instance</span>» <span class="ru-tr">«Распрямляет экземпляры AggregateException в один новый экземпляр»</span>: 2 настоящих <code>Exception</code>, вложенных агрегатов нет. Печать: <b>count=2 anyNested=False</b>.',
      noText: '<code>Flatten()</code> убирает вложенные агрегаты, оставляя реальные причины. После него — 2 обычных исключения, <code>anyNested=False</code>. Реальный вывод: <b>count=2 anyNested=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "count=2 anyNested=False" }, sourceRefs: ["ms-tplexc", "ms-aggapi"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Контейнер, не ошибка", v: '«<span class="hl">AggregateException is used to consolidate multiple failures into a single, throwable exception object</span>». <span class="ru-tr">«AggregateException используется, чтобы объединить несколько сбоев в один бросаемый объект-исключение».</span> TPL «<span class="hl">wraps them in an AggregateException</span>» <span class="ru-tr">«оборачивает их в AggregateException»</span> — «even if only one» <span class="ru-tr">«даже если всего одно»</span> (замер: AggregateException|count=1). Причины — в <code>InnerExceptions</code>.' },
    { icon: "cost", k: "Flatten", v: 'Attached child → «<span class="hl">one or more AggregateException instances, not the original exceptions</span>». <span class="ru-tr">«один или несколько экземпляров AggregateException, а не исходные исключения».</span> <code>Flatten()</code> «<span class="hl">Flattens… into a single, new instance</span>» <span class="ru-tr">«Распрямляет… в один новый экземпляр»</span> → один цикл (замер: count=2 anyNested=False).' },
    { icon: "avoid", k: "Handle / наблюдай", v: '<code>Handle(ex=>bool)</code>: <code>true</code>=обработано, <code>false</code>=«<span class="hl">rethrown in a new AggregateException</span>» <span class="ru-tr">«переброшено в новом AggregateException»</span> (замер: handled=1 rethrown=1). Не глотай агрегат целиком (indeterminate state); не наблюдёно → эскалация при GC.' },
  ],

  foot: 'урок · <b>AggregateException: Flatten, Handle</b> · 5 анимир. разборов · панель контракт Handle · дизайн <b>mid</b>',
};
