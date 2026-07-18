/**
 * Lesson: Exceptions in async — await vs .Wait/.Result, WhenAll, AggregateException (CS.S2.exceptions)
 * — expert density, 5 animated deep-dives. The core split: `await task` UNWRAPS and throws the first
 * inner exception (you catch InvalidOperationException, NOT AggregateException), whereas
 * `.Wait()`/`.Result`/`.WaitAll` WRAP every exception — even a single one — in an AggregateException.
 * Consequence for `await Task.WhenAll(...)`: it throws only ONE inner, but `task.Exception.
 * InnerExceptions` carries them all. Plus AggregateException.Flatten() collapses nested aggregates.
 *
 * SIGNATURE machine panel (s5): the two consumption paths side by side — await -> ExceptionDispatchInfo
 * unwraps the first inner and rethrows it with the original stack; .Wait/.Result -> AggregateException
 * wrapper. A real run-csharp measurement (await=InvalidOperationException wait=AggregateException).
 * evidence/F11/exceptions-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against TPL exception handling + TAP model (fetch
 * 2026-07-18) + GT-M4-s2.md S2.7 (exc:F2..F9):
 *   - card verify.expect is the REAL stdout of run-csharp (evidence/F11/exceptions-exec.txt:
 *     "await=InvalidOperationException wait=AggregateException"; "awaitThrew=InvalidOperationException
 *     innerCount=3"; "before=2 after=3");
 *   - NO GT-M4 myths: M-exc-1 (await throws AggregateException) — no, await unwraps the first inner;
 *     M-block-6 (.Result is safe) — .Result blocks + wraps in AggregateException (deadlock-prone).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.exceptions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two consumption paths.
const Z_AWAIT: Zone = { id: "await", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "await task", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "разворачивает · бросает первое", subCls: "vz-zsub good", subY: 47 };
const Z_WAIT: Zone = { id: "wait", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: ".Wait() / .Result", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "оборачивает в AggregateException", subCls: "vz-zsub heap", subY: 47 };
const PATH_ZONES: Zone[] = [Z_AWAIT, Z_WAIT];

// s2: WhenAll — one via await, all via .Exception.
const Z_ONE: Zone = { id: "one", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "await WhenAll", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "бросает ОДНО (первое)", subCls: "vz-zsub good", subY: 47 };
const Z_ALL: Zone = { id: "all", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: ".Exception.InnerExceptions", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "содержит ВСЕ", subCls: "vz-zsub", subY: 47 };
const WHENALL_ZONES: Zone[] = [Z_ONE, Z_ALL];

// s3: observing — throw-on-consume vs Task.Exception; unobserved escalation.
const Z_OBS: Zone = { id: "obs", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "наблюдение", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "await/Wait/Result · Task.Exception", subCls: "vz-zsub good", subY: 47 };
const Z_UNOBS: Zone = { id: "unobs", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "не наблюдено", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "эскалация · UnobservedTaskException", subCls: "vz-zsub heap", subY: 47 };
const OBS_ZONES: Zone[] = [Z_OBS, Z_UNOBS];

// s4: AggregateException tools — Flatten / Handle.
const Z_NESTED: Zone = { id: "nested", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "вложенный агрегат", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "AggregateException в AggregateException", subCls: "vz-zsub heap", subY: 47 };
const Z_FLAT: Zone = { id: "flat", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Flatten()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "плоский список · Handle фильтрует", subCls: "vz-zsub good", subY: 47 };
const FLAT_ZONES: Zone[] = [Z_NESTED, Z_FLAT];

// s5 (SIGNATURE): await unwrap vs Wait wrap.
const Z_UNWRAP: Zone = { id: "unwrap", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "await → разворот", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "InvalidOperationException", subCls: "vz-zsub good", subY: 47 };
const Z_WRAP: Zone = { id: "wrap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: ".Wait → обёртка", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "AggregateException", subCls: "vz-zsub heap", subY: 47 };
const SIG_ZONES: Zone[] = [Z_UNWRAP, Z_WRAP];

export const exceptions: LessonData = {
  id: "CS.S2.exceptions",
  track: "CS",
  section: "CS.S2",
  module: "S2.7",
  lang: "csharp",
  title: "Исключения в async: await vs .Wait, WhenAll",
  kicker: "C# вглубь · S2 · ошибки в задаче",
  home: { subtitle: "await разворачивает, .Wait оборачивает, WhenAll, Flatten", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.tap-contract"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tpl-exc", kind: "doc", org: "Microsoft Learn", title: "Exception handling (Task Parallel Library)", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library", date: "2023-05-24" },
    { id: "ms-tap", kind: "doc", org: "Microsoft Learn", title: "The Task Asynchronous Programming (TAP) model (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2025-10-13" },
  ],

  spec: [
    { text: "«AggregateException cannot be explicitly caught when using await task» — await разворачивает и бросает само (первое) внутреннее исключение, а не AggregateException.", source: "ms-tap" },
  ],
  edgeCases: [
    { text: "<code>Task.Wait</code>/<code>Task.Result</code>/<code>Task.WaitAll</code> оборачивают исключения в <code>AggregateException</code> — <b>даже одно</b> исключение всё равно обёрнуто. <code>await</code> и <code>GetAwaiter().GetResult()</code> — разворачивают и бросают само (первое) внутреннее.", source: "ms-tpl-exc" },
    { text: "Неотнаблюдённое (unobserved) исключение задачи эскалируется при GC-финализации через событие <code>TaskScheduler.UnobservedTaskException</code>. Наблюдать можно и без ожидания — <code>Task.Exception</code> при <code>Status == Faulted</code>.", source: "ms-tpl-exc" },
    { text: "<code>AggregateException.Handle(Func&lt;Exception,bool&gt;)</code> — фильтр «обработанных» (вернул <code>false</code> → переброс в новом агрегате); <code>Flatten()</code> убирает вложенность агрегатов (напр. от attached child tasks).", source: "ms-tpl-exc" },
  ],

  misconceptions: [
    {
      wrong: "await бросает AggregateException; .Result безопасен и удобен для взятия значения",
      hook: 'Две ловушки обработки ошибок. «<span class="wrong">await бросает AggregateException</span>» — нет: «<span class="hl">AggregateException cannot be explicitly caught when using await</span>»; <code>await</code> <b>разворачивает</b> и бросает само (первое) внутреннее исключение — ловишь <code>InvalidOperationException</code>, а не агрегат. «<span class="wrong">.Result удобен</span>» — <code>.Result</code>/<code>.Wait()</code> не только блокируют поток (дедлок), но и <b>оборачивают</b> исключение в <code>AggregateException</code>, даже если оно одно. Ниже <b>пять разборов</b>: два пути (await/Wait), <code>WhenAll</code> (одно vs все), наблюдение/эскалация, <code>Flatten</code>, и <b>машинная панель</b> — разворот vs обёртка на реальном замере.',
      source: "ms-tap",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Два пути", title: "await разворачивает первое; .Wait оборачивает в AggregateException",
      viewBox: "0 0 340 210", zones: PATH_ZONES,
      code: ["async Task Boom(){ await Task.Delay(1); throw new InvalidOperationException(\"x\"); }", "try { await Boom(); } catch (Exception e) { /* e — InvalidOperationException */ }", "try { taskThatThrows.Wait(); } catch (Exception e) { /* e — AggregateException */ }"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>await</code> <span class="hl">разворачивает</span> задачу и бросает <b>само</b> (первое) внутреннее исключение — <code>catch</code> ловит <code>InvalidOperationException</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "await", row: 0 }, state: "ok", label: "catch(await)", detail: "InvalidOp", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>.Wait()</code>/<code>.Result</code> <span class="hl">оборачивают</span> исключение в <code>AggregateException</code> — <b>даже если оно одно</b>.', nodes: [{ id: "a", kind: "gate", at: { zone: "await", row: 0 }, state: "ok", label: "await", detail: "InvalidOp" }, { id: "w", kind: "gate", at: { zone: "wait", row: 0 }, state: "fail", label: "catch(.Wait)", detail: "Aggregate", accent: true }], edges: [] },
        { codeLine: 0, out: "await=InvalidOperationException wait=AggregateException", caption: 'Печать: <b>await=InvalidOperationException wait=AggregateException</b> (реальный прогон). Один и тот же сбой — разный тип пойманного исключения.', nodes: [{ id: "a", kind: "gate", at: { zone: "await", row: 0 }, state: "ok", label: "await", detail: "InvalidOp" }, { id: "w", kind: "gate", at: { zone: "wait", row: 0 }, state: "fail", label: ".Wait", detail: "Aggregate", accent: true }], edges: [] },
      ],
      explain: 'Главный факт (verbatim + GT exc:F2/F3/F6): «<code>AggregateException</code> cannot be explicitly caught when using <code>await task</code>». <code>await</code> и <code>GetAwaiter().GetResult()</code> <b>разворачивают</b> задачу и бросают само (первое) внутреннее исключение, поэтому обычный <code>catch (InvalidOperationException)</code> вокруг <code>await</code> работает. А синхронное ожидание — <code>Task.Wait</code>/<code>Task.Result</code>/<code>Task.WaitAll</code> — <b>оборачивает</b> исключения в <code>AggregateException</code>, даже если оно одно. Прогон: <code>await</code> → <b>InvalidOperationException</b>, <code>.Wait()</code> → <b>AggregateException</b>. Практика: в async-коде обрабатывай ошибки через <code>await</code> + обычный <code>catch</code>; синхронные <code>.Wait/.Result</code> дают и дедлок, и неудобный агрегат.',
      sources: ["ms-tap", "ms-tpl-exc"],
    },
    {
      id: "s2", num: "02", kicker: "WhenAll", title: "await WhenAll бросает одно; .Exception содержит все",
      viewBox: "0 0 340 210", zones: WHENALL_ZONES,
      code: ["var all = Task.WhenAll(Fail(\"a\"), Fail(\"b\"), Fail(\"c\"));   // три сбоя", "try { await all; } catch (Exception e) { /* одно: InvalidOperationException */ }", "int n = all.Exception.InnerExceptions.Count;             // 3 — все три"],
      predictAt: 1, predictQ: 'Три задачи бросают. <code>await Task.WhenAll(...)</code> в <code>catch</code> — какой тип? И сколько в <code>all.Exception.InnerExceptions</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Три задачи, каждая бросает. <code>Task.WhenAll</code> собирает их все — задача становится <code>Faulted</code>.', nodes: [{ id: "w", kind: "gate", at: { zone: "one", row: 0 }, state: "fail", label: "WhenAll(a,b,c)", detail: "Faulted", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>await all</code> разворачивает и бросает <span class="hl">ОДНО</span> (первое) исключение — <code>catch</code> видит <code>InvalidOperationException</code>, не агрегат.', nodes: [{ id: "w", kind: "gate", at: { zone: "one", row: 0 }, state: "fail", label: "await all", detail: "бросает 1", accent: true }, { id: "e", kind: "gate", at: { zone: "all", row: 0 }, state: "ok", label: ".Exception", detail: "хранит все" }], edges: [] },
        { codeLine: 2, out: "awaitThrew=InvalidOperationException innerCount=3", caption: 'Чтобы увидеть ВСЕ — читай <code>all.Exception.InnerExceptions</code>: их <b>3</b>. Печать: <b>awaitThrew=InvalidOperationException innerCount=3</b> (реальный прогон).', nodes: [{ id: "w", kind: "gate", at: { zone: "one", row: 0 }, state: "fail", label: "await", detail: "1" }, { id: "e", kind: "gate", at: { zone: "all", row: 0 }, state: "ok", label: "InnerExceptions", detail: "3", accent: true }], edges: [] },
      ],
      explain: 'Следствие для <code>WhenAll</code> (GT exc:F4/M1): поскольку <code>await</code> разворачивает лишь первое исключение, <code>await Task.WhenAll(...)</code> при нескольких сбоях бросит <b>только одно</b> (первое). Сама задача <code>WhenAll</code> при этом <code>Faulted</code> и держит агрегат: чтобы увидеть <b>все</b> исключения, читай <code>all.Exception.InnerExceptions</code> (свойство <code>Task.Exception</code> — это <code>AggregateException</code>). Прогон: <code>await</code> бросил <b>InvalidOperationException</b> (одно), а <code>InnerExceptions.Count</code> == <b>3</b>. Правило: для «покажи все ошибки из группы задач» — не полагайся на <code>catch</code> вокруг <code>await WhenAll</code>, а инспектируй <code>Exception.InnerExceptions</code> у самой задачи.',
      sources: ["ms-tpl-exc"],
    },
    {
      id: "s3", num: "03", kicker: "Наблюдение", title: "Наблюсти через await/Exception — иначе эскалация при GC",
      viewBox: "0 0 340 210", zones: OBS_ZONES,
      code: ["await t;  t.Wait();  var r = t.Result;         // наблюдают (бросают)", "if (t.Status == TaskStatus.Faulted) log(t.Exception);  // наблюсти БЕЗ ожидания", "// НИКТО не наблюдал → эскалация: TaskScheduler.UnobservedTaskException при GC"],
      scenes: [
        { codeLine: 0, caption: 'Исключение <span class="hl">наблюдают</span>, потребляя результат: <code>await</code>/<code>Wait</code>/<code>Result</code>/<code>GetAwaiter().GetResult()</code> — они бросают.', nodes: [{ id: "o", kind: "gate", at: { zone: "obs", row: 0 }, state: "ok", label: "await / Wait / Result", detail: "наблюдено", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Можно наблюсти <span class="hl">без ожидания</span> — прочитать <code>Task.Exception</code> при <code>Status == Faulted</code> (не бросает).', nodes: [{ id: "o", kind: "gate", at: { zone: "obs", row: 0 }, state: "ok", label: "потребление", detail: "бросает" }, { id: "e", kind: "gate", at: { zone: "obs", row: 1 }, state: "ok", label: "Task.Exception", detail: "без броска", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Если <span class="hl">никто</span> не наблюдал — исключение эскалируется при GC через <code>TaskScheduler.UnobservedTaskException</code>. «Забыл await» = скрытая ошибка.', nodes: [{ id: "u", kind: "gate", at: { zone: "unobs", row: 0 }, state: "fail", label: "не наблюдено", detail: "эскалация @ GC", accent: true }], edges: [] },
      ],
      explain: 'Наблюдение исключений (GT exc:F1/F4/F5): исключение задачи «наблюдается» одним из способов — <code>await</code>, <code>Wait</code>, <code>Result</code>, <code>GetAwaiter().GetResult()</code> (все они <b>перебрасывают</b> его), либо <b>без ожидания</b> — чтением <code>Task.Exception</code> (это <code>AggregateException</code>) при <code>Status == Faulted</code>, что не бросает. Если исключение <b>никто</b> не наблюдал, оно считается unobserved и <b>эскалируется</b> при финализации задачи сборщиком мусора — через событие <code>TaskScheduler.UnobservedTaskException</code>. Отсюда практическое правило: не запускай задачу «в никуда» без <code>await</code>/обработки — забытая ошибка всплывёт позже и в неожиданном месте.',
      sources: ["ms-tpl-exc"],
    },
    {
      id: "s4", num: "04", kicker: "Flatten · Handle", title: "AggregateException.Flatten() распрямляет вложенность",
      viewBox: "0 0 340 210", zones: FLAT_ZONES,
      code: ["var inner = new AggregateException(new Exception(\"a\"), new Exception(\"b\"));", "var outer = new AggregateException(inner, new Exception(\"c\"));   // 2 «верхних»", "int before = outer.InnerExceptions.Count;  int after = outer.Flatten().InnerExceptions.Count;"],
      predictAt: 2, predictQ: '<code>outer</code> держит <code>inner</code>-агрегат (a,b) + один Exception (c). <code>InnerExceptions.Count</code> до и после <code>Flatten()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>outer</code> прямо содержит <b>2</b> элемента: вложенный агрегат <code>inner</code> и одно <code>Exception("c")</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "nested", row: 0 }, state: "fail", label: "outer.InnerExceptions", detail: "2 (агрегат + c)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Flatten()</code> <span class="hl">распрямляет</span> вложенные агрегаты в один плоский список настоящих исключений.', nodes: [{ id: "n", kind: "gate", at: { zone: "nested", row: 0 }, state: "fail", label: "до Flatten", detail: "2" }, { id: "f", kind: "gate", at: { zone: "flat", row: 0 }, state: "ok", label: "Flatten()", detail: "разворачивает", accent: true }], edges: [] },
        { codeLine: 2, out: "before=2 after=3", caption: 'Печать: <b>before=2 after=3</b> (реальный прогон): a, b, c — три плоских исключения. Полезно для вложенных агрегатов от attached child tasks.', nodes: [{ id: "n", kind: "gate", at: { zone: "nested", row: 0 }, state: "fail", label: "before", detail: "2" }, { id: "f", kind: "gate", at: { zone: "flat", row: 0 }, state: "ok", label: "after", detail: "3", accent: true }], edges: [] },
      ],
      explain: 'Инструменты <code>AggregateException</code> (GT exc:F2/F7/F9): <code>InnerExceptions</code> — перечисление вложенных; <code>Handle(Func&lt;Exception,bool&gt;)</code> — «обработать» отдельные (вернул <code>true</code> — обработано; хоть один <code>false</code> — переброс нового агрегата с необработанными); <code>Flatten()</code> — <b>распрямляет вложенность</b>: агрегат, содержащий агрегаты (типичный случай — attached child tasks), превращается в один плоский <code>AggregateException</code> с настоящими (не-агрегатными) исключениями. Прогон: <code>outer</code> прямо содержит 2 элемента (вложенный агрегат + <code>c</code>), после <code>Flatten()</code> — <b>3</b> (a, b, c). Печать «before=2 after=3». Используй <code>Flatten()</code> перед перебором, чтобы не спускаться по дереву агрегатов вручную.',
      sources: ["ms-tpl-exc"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · разворот vs обёртка", title: "await → само исключение, .Wait → AggregateException",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// одна и та же faulted-задача, два потребителя:", "await task            → бросает InvalidOperationException (развёрнуто)", "task.Wait()/.Result   → бросает AggregateException (обёрнуто, +блокировка)"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Потребитель через <code>await</code> получает <span class="hl">развёрнутое</span> исключение — <code>InvalidOperationException</code> с исходным стеком (через <code>ExceptionDispatchInfo</code>).', nodes: [{ id: "u", kind: "obj", at: { zone: "unwrap", row: 0 }, typeTag: "await", value: "InvalidOp", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Потребитель через <code>.Wait()</code>/<code>.Result</code> получает <span class="hl">обёрнутое</span> в <code>AggregateException</code> — и вдобавок <b>блокирует</b> поток (дедлок-риск).', nodes: [{ id: "u", kind: "obj", at: { zone: "unwrap", row: 0 }, typeTag: "await", value: "InvalidOp" }, { id: "w", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: ".Wait", value: "Aggregate", accent: true }], edges: [] },
        { codeLine: 0, out: "await=InvalidOperationException wait=AggregateException", caption: 'Панель: одна faulted-задача → <b>два разных типа</b> пойманного исключения: <b>await=InvalidOperationException wait=AggregateException</b> (реальный прогон). Выбор способа потребления меняет, что ты ловишь.', nodes: [{ id: "u", kind: "gate", at: { zone: "unwrap", row: 0 }, state: "ok", label: "await", detail: "InvalidOp" }, { id: "w", kind: "gate", at: { zone: "wrap", row: 0 }, state: "fail", label: ".Wait/.Result", detail: "Aggregate", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — как способ потребления задачи определяет форму исключения. Один и тот же faulted-<code>Task</code>: через <code>await</code> механизм <code>ExceptionDispatchInfo</code> <b>разворачивает</b> первое внутреннее исключение и перебрасывает его с сохранённым исходным стеком — ты ловишь настоящий <code>InvalidOperationException</code>; через <code>.Wait()</code>/<code>.Result</code> ты получаешь <code>AggregateException</code>-обёртку (и синхронную блокировку потока — дедлок-риск на UI/ASP.NET-контексте). Прогон подтверждает: <b>await=InvalidOperationException wait=AggregateException</b>. Отсюда единое правило раздела: в async-коде потребляй задачи через <code>await</code> — и обработка исключений становится обычным <code>try/catch</code> по конкретному типу, без агрегатов и без блокировок.',
      sources: ["ms-tap", "ms-tpl-exc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task Boom(){ await Task.Delay(1); throw new InvalidOperationException("x"); } var t = Boom(); string viaAwait, viaWait; try { await t; viaAwait="none"; } catch (Exception e){ viaAwait = e.GetType().Name; } var t2 = Task.Run(() =&gt; throw new InvalidOperationException("y")); try { t2.Wait(); viaWait="none"; } catch (Exception e){ viaWait = e.GetType().Name; } Console.WriteLine($"await={viaAwait} wait={viaWait}");</code> — что напечатает?',
      options: ["await=InvalidOperationException wait=AggregateException", "await=AggregateException wait=AggregateException", "await=InvalidOperationException wait=InvalidOperationException", "await=AggregateException wait=InvalidOperationException"], correctIndex: 0, xp: 10,
      okText: '<code>await</code> <span class="hl">разворачивает</span> и бросает само исключение (<code>InvalidOperationException</code>); <code>.Wait()</code> <b>оборачивает</b> в <code>AggregateException</code>, даже если оно одно. Печать: <b>await=InvalidOperationException wait=AggregateException</b>.',
      noText: '«AggregateException cannot be caught when using await»: await разворачивает, .Wait оборачивает. Реальный вывод: <b>await=InvalidOperationException wait=AggregateException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "await=InvalidOperationException wait=AggregateException" }, sourceRefs: ["ms-tap"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task Fail(string m){ await Task.Delay(1); throw new InvalidOperationException(m); } var all = Task.WhenAll(Fail("a"), Fail("b"), Fail("c")); string type; try { await all; type="none"; } catch (Exception e){ type = e.GetType().Name; } int count = all.Exception!.InnerExceptions.Count; Console.WriteLine($"awaitThrew={type} innerCount={count}");</code> — что напечатает?',
      options: ["awaitThrew=InvalidOperationException innerCount=3", "awaitThrew=AggregateException innerCount=3", "awaitThrew=InvalidOperationException innerCount=1", "awaitThrew=AggregateException innerCount=1"], correctIndex: 0, xp: 10,
      okText: '<code>await WhenAll</code> бросает <span class="hl">одно</span> (первое) → <code>InvalidOperationException</code>; но <code>all.Exception.InnerExceptions</code> держит <b>все 3</b>. Печать: <b>awaitThrew=InvalidOperationException innerCount=3</b>.',
      noText: 'await разворачивает лишь первое; все — в <code>Exception.InnerExceptions</code>. Реальный вывод: <b>awaitThrew=InvalidOperationException innerCount=3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "awaitThrew=InvalidOperationException innerCount=3" }, sourceRefs: ["ms-tpl-exc"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var inner = new AggregateException(new Exception("a"), new Exception("b")); var outer = new AggregateException(inner, new Exception("c")); int before = outer.InnerExceptions.Count; int after = outer.Flatten().InnerExceptions.Count; Console.WriteLine($"before={before} after={after}");</code> — что напечатает?',
      options: ["before=2 after=3", "before=3 after=3", "before=2 after=2", "before=3 after=2"], correctIndex: 0, xp: 10,
      okText: '<code>outer</code> прямо держит <b>2</b> (вложенный агрегат + <code>c</code>); <code>Flatten()</code> <span class="hl">распрямляет</span> в <b>3</b> плоских (a, b, c). Печать: <b>before=2 after=3</b>.',
      noText: '<code>Flatten()</code> убирает вложенность агрегатов. Реальный вывод: <b>before=2 after=3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=2 after=3" }, sourceRefs: ["ms-tpl-exc"],
    },
  ],

  takeaways: [
    { icon: "why", k: "await vs .Wait", v: '<code>await</code> <span class="hl">разворачивает</span> и бросает первое внутреннее исключение (ловишь <code>InvalidOperationException</code>); <code>.Wait()</code>/<code>.Result</code> <b>оборачивают</b> в <code>AggregateException</code> даже одно + блокируют (замер: await=InvalidOperationException wait=AggregateException).' },
    { icon: "cost", k: "WhenAll", v: '<code>await Task.WhenAll(...)</code> бросает <b>лишь одно</b>; все — в <code>task.Exception.InnerExceptions</code> (замер: innerCount=3). <code>Flatten()</code> распрямляет вложенные агрегаты (2→3).' },
    { icon: "avoid", k: "наблюдай", v: 'Исключение надо <b>наблюсти</b> (<code>await</code>/<code>Wait</code>/<code>Result</code> или <code>Task.Exception</code> при <code>Faulted</code>). Иначе — эскалация при GC (<code>UnobservedTaskException</code>). «Забыл await» = скрытая ошибка.' },
  ],

  foot: 'урок · <b>исключения в async</b> · 5 анимир. разборов · панель разворот vs обёртка · дизайн <b>mid</b>',
};
