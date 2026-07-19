/**
 * Lesson: TAP-модель — async/await как слой абстракции (CS.S2.tap-model) — expert density,
 * 5 animated deep-dives. The mental model a senior must get right: async/await is a compiler
 * abstraction, not threads. An async method runs SYNCHRONOUSLY on the caller's thread up to its
 * first await; at await it suspends (control returns to the caller — but this is NOT an exit,
 * finally doesn't run) and resumes later as a continuation; a Task encapsulates the state and
 * eventually the result-or-exception; async WITHOUT await runs synchronously (with a warning);
 * and — the myth this lesson kills — async/await do NOT create threads.
 *
 * SIGNATURE machine panel (s1): the execution TIMELINE, proven by a real thread-id measurement —
 * caller T, before-await T (SAME thread — the synchronous prefix always runs on the caller's
 * thread; deterministic), control returns, resume. After the await the continuation runs on the
 * CURRENT SYNCHRONIZATION CONTEXT: with a captured context (UI/legacy ASP.NET) the original thread,
 * with NO captured context (console/ASP.NET Core) a pool thread that MAY DIFFER from the caller.
 * await creates NO new thread and does not block either way. REAL run-csharp measurement,
 * evidence/F9/tap-model-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn TAP model (fetch 2026-07-18) + GT-M4-s2.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../task-asynchronous-programming-model;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F9/tap-model-exec.txt);
 *   - NO GT-M4 myths: async is NOT parallelism (M-async-1); await does NOT create a thread
 *     (M-async-2); async without await is synchronous (M-async-5); await is not an exit / finally
 *     does not run at suspension (M-sm-6).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.tap-model/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): the timeline — caller thread vs the async method's synchronous prefix + resume.
const Z_CALLER: Zone = { id: "caller", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВЫЗЫВАЮЩИЙ · поток T", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "один поток", subCls: "vz-zsub", subY: 47 };
const Z_ASYNC: Zone = { id: "asyncm", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ASYNC-МЕТОД", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тот же поток до await", subCls: "vz-zsub good", subY: 47 };
const TIMELINE_ZONES: Zone[] = [Z_CALLER, Z_ASYNC];

// s2: what await does — suspend + control returns, not an exit.
const Z_METHOD: Zone = { id: "method", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "await · ТОЧКА ПРИОСТАНОВКИ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "не выход из метода · finally не бежит", subCls: "vz-zsub", subY: 47 };
const AWAIT_ZONES: Zone[] = [Z_METHOD];

// s3: Task encapsulates state + result-or-exception.
const Z_TASK: Zone = { id: "task", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Task<T> · ОБЕЩАНИЕ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "state + результат позже", subCls: "vz-zsub heap", subY: 47 };
const Z_RESULT: Zone = { id: "result", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РЕЗУЛЬТАТ / ИСКЛЮЧЕНИЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "кладётся в Task позже", subCls: "vz-zsub good", subY: 47 };
const TASK_ZONES: Zone[] = [Z_TASK, Z_RESULT];

// s4: async without await = synchronous (+ warning).
const Z_NOAWAIT: Zone = { id: "noawait", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "async БЕЗ await", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "исполняется синхронно + warning", subCls: "vz-zsub", subY: 47 };
const NOAWAIT_ZONES: Zone[] = [Z_NOAWAIT];

// s5: threads — async doesn't create threads (the myth).
const Z_ONETHREAD: Zone = { id: "onethread", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "async ≠ поток", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "не создаёт потоков · не блокирует", subCls: "vz-zsub good", subY: 47 };
const THREAD_ZONES: Zone[] = [Z_ONETHREAD];

export const tapModel: LessonData = {
  id: "CS.S2.tap-model",
  track: "CS",
  section: "CS.S2",
  module: "S2.1",
  lang: "csharp",
  title: "TAP-модель: async/await как абстракция",
  kicker: "C# вглубь · S2 · async ≠ поток",
  home: { subtitle: "async/await, приостановка, Task, без потоков", icon: "async", estMinutes: 10 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tap", kind: "doc", org: "Microsoft Learn", title: "The Task Asynchronous Programming (TAP) model with async and await (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2025-10-13" },
    { id: "ms-async-over", kind: "doc", org: "Microsoft Learn", title: "Asynchronous programming (C# overview)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/", date: "2024-11-01" },
  ],

  spec: [
    { text: "«The `async` and `await` keywords don't cause extra threads to be created. Async methods don't require multithreading because an async method doesn't run on its own thread.»", source: "ms-tap" },
  ],
  edgeCases: [
    { text: "Приостановка на <code>await</code> — <b>НЕ выход</b> из метода: «doesn't constitute an exit from the method, and <code>finally</code> blocks <span class=\"hl\">don't run</span>». Метод возобновится в той же точке.", source: "ms-tap" },
    { text: "<code>async</code> <b>без</b> <code>await</code> исполняется <span class=\"hl\">синхронно</span> (несмотря на модификатор), компилятор выдаёт warning. <code>await</code> — только внутри async-метода.", source: "ms-tap" },
    { text: "Async-метод возвращает <code>Task</code> в момент <b>приостановки</b>, а не завершения; результат кладётся в задачу позже. Признаки: <code>async</code> + суффикс <code>Async</code> + <code>Task</code>/<code>Task&lt;T&gt;</code>/<code>void</code>(event) + обычно ≥1 <code>await</code>.", source: "ms-tap" },
  ],

  misconceptions: [
    {
      wrong: "async делает код параллельным / await создаёт поток",
      hook: 'Самый живучий миф: «<span class="wrong">async делает код параллельным</span>» и «<span class="wrong">await создаёт поток</span>». На деле <code>async</code>/<code>await</code> — это <b>компиляторная абстракция</b>, не потоки: async-метод бежит <span class="hl">синхронно на потоке вызывающего</span> до первого <code>await</code>, а «The <code>async</code> and <code>await</code> keywords don\'t cause extra threads to be created». Ниже <b>пять разборов</b>: <b>машинная панель</b> — реально снятый таймлайн (до <code>await</code> — поток вызывающего; после — текущий sync-context, в консоли может отличаться, но нового потока НЕТ), что делает <code>await</code> (приостановка, не выход), <code>Task</code> как обещание, <code>async</code> без <code>await</code> = синхронно, и почему «async ≠ поток».',
      source: "ms-tap",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · таймлайн", title: "Async бежит синхронно до первого await (один поток)",
      viewBox: "0 0 340 210", zones: TIMELINE_ZONES,
      code: ["async Task<int> Work() {", "  // ← до await: тот же поток T, синхронно", "  await Task.Delay(10);   // приостановка, control → caller", "  return 42; }            // возобновление позже"],
      predictAt: 1, predictQ: 'Вызвали <code>Work()</code> из потока T. На каком потоке исполняется код <b>до</b> первого <code>await</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "before await == caller: true", caption: 'Вызывающий на некотором потоке <b>A</b> зовёт <code>Work()</code>. Код async-метода до <code>await</code> бежит <span class="hl">синхронно на том же потоке</span> — <code>before await == caller</code> (замер: 5/5 верно).', nodes: [{ id: "c", kind: "gate", at: { zone: "caller", row: 0 }, state: "ok", label: "caller", detail: "поток A" }, { id: "a", kind: "gate", at: { zone: "asyncm", row: 0 }, state: "ok", label: "before await", detail: "поток A", accent: true }], edges: [] },
        { codeLine: 2, out: "before await == caller: true\ngot task, result later", caption: 'На <code>await</code> метод <b>приостановлен</b>, <span class="hl">control возвращается вызывающему</span> — тот получает <code>Task</code> и идёт дальше («got task, result later»).', nodes: [{ id: "c", kind: "gate", at: { zone: "caller", row: 0 }, state: "ok", label: "caller продолжает", detail: "task на руках", accent: true }, { id: "a", kind: "gate", at: { zone: "asyncm", row: 0 }, state: "fail", label: "await", detail: "приостановлен" }], edges: [] },
        { codeLine: 3, out: "before await == caller: true\ngot task, result later\nafter await == caller: MAYBE\n42", caption: 'Возобновление: continuation бежит <span class="hl">на текущем sync-context</span>. В консоли контекста нет → <b>поток пула, МОЖЕТ отличаться</b> от вызвавшего (в замере встречается и совпадение, и другой поток); новый поток не создавался. Затем <code>return 42</code>.', nodes: [{ id: "a1", kind: "gate", at: { zone: "asyncm", row: 0 }, state: "ok", label: "after await", detail: "поток A или B" }, { id: "a2", kind: "gate", at: { zone: "asyncm", row: 1 }, state: "ok", label: "result", detail: "42", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — таймлайн исполнения, снятый по <code>Thread.CurrentThread.ManagedThreadId</code>. Что <b>детерминированно верно</b> (замер 5/5): <code>before await</code> == <code>caller</code> — async-метод исполняется <span class="hl">синхронно на потоке вызывающего</span> до первого <code>await</code>. Про поток <b>после</b> <code>await</code> важно не соврать: дословно «The method <span class="hl">runs on the current synchronization context</span> and uses time on the thread only when the method is active». То есть continuation возобновляется на <b>текущем контексте синхронизации</b>: при <b>захваченном</b> контексте (UI, legacy ASP.NET) — на исходном потоке; <b>без</b> контекста (консоль, ASP.NET Core) — на потоке пула, который <b>МОЖЕТ отличаться</b> от вызвавшего (в замере встречается и <code>same=False</code>). Ключевое, что верно всегда: «The <code>async</code> and <code>await</code> keywords <b>don\'t cause extra threads to be created</b>» и «an async method <span class="hl">doesn\'t run on its own thread</span>» — <code>await</code> не создаёт поток и не блокирует. Миф «await держит тот же поток» верен лишь при захваченном контексте, а не как общая истина.',
      sources: ["ms-tap"],
    },
    {
      id: "s2", num: "02", kicker: "await · приостановка, не выход", title: "await приостанавливает, control → caller (finally не бежит)",
      viewBox: "0 0 340 210", zones: AWAIT_ZONES,
      code: ["async Task M() {", "  try { await Slow(); }        // приостановка ЗДЕСЬ", "  finally { Cleanup(); } }     // НЕ выполнится при приостановке", "// await ≠ return: метод возобновится в той же точке"],
      scenes: [
        { codeLine: 1, caption: '<code>await Slow()</code> — <span class="hl">точка приостановки</span>: метод не может продолжиться, пока задача не завершится.', nodes: [{ id: "s", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "await Slow()", detail: "приостановка", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Control <b>возвращается вызывающему</b> — но это <span class="hl">НЕ выход</span> из метода: continuation зарегистрирован, метод «на паузе».', nodes: [{ id: "s", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "await", detail: "control → caller" }, { id: "c", kind: "chip", at: { zone: "method", row: 1 }, value: "continuation зарегистрирован", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Поэтому <code>finally</code> при приостановке <span class="hl">НЕ выполняется</span> — он отработает только когда метод реально завершится/выбросит.', nodes: [{ id: "s", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "await", detail: "пауза" }, { id: "f", kind: "gate", at: { zone: "method", row: 1 }, state: "fail", label: "finally", detail: "не бежит при паузе", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «await разматывает стек / это return». Дословно: «The <code>await</code> operator tells the compiler that the async method can\'t continue past that point until the awaited asynchronous process is complete. In the meantime, control returns to the caller». И критично: «The suspension of an async method at an <code>await</code> expression <span class="hl">doesn\'t constitute an exit from the method, and <code>finally</code> blocks don\'t run</span>». То есть <code>await</code> — не выход: компилятор регистрирует остаток метода как continuation, метод возобновится в той же точке. <code>finally</code> отработает только при реальном завершении/исключении, не при паузе.',
      sources: ["ms-tap"],
    },
    {
      id: "s3", num: "03", kicker: "Task · обещание результата", title: "Task инкапсулирует state и результат-или-исключение",
      viewBox: "0 0 340 210", zones: TASK_ZONES,
      code: ["Task<int> t = Work();   // задача возвращена в момент ПРИОСТАНОВКИ", "// ...результат кладётся в t ПОЗЖЕ, при завершении", "int r = await t;        // await достаёт результат из t"],
      scenes: [
        { codeLine: 0, caption: '<code>Work()</code> вернул <code>Task&lt;int&gt;</code> <span class="hl">в момент приостановки</span>, а не завершения — «a promise to produce an integer result».', nodes: [{ id: "t", kind: "obj", at: { zone: "task", row: 0 }, typeTag: "Task<int>", value: "не готов", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Когда фоновая работа завершится, результат <b>кладётся в задачу</b> — либо значение, либо исключение при неуспехе.', nodes: [{ id: "t", kind: "obj", at: { zone: "task", row: 0 }, typeTag: "Task<int>", value: "готов" }, { id: "r", kind: "obj", at: { zone: "result", row: 0 }, typeTag: "результат", value: "42", accent: true }], edges: [{ id: "e", from: "r", to: "t", accent: true }] },
        { codeLine: 2, caption: '<code>await t</code> достаёт результат из задачи. Если задача упала — <code>await</code> перебросит исключение (не блокируя поток).', nodes: [{ id: "t", kind: "obj", at: { zone: "task", row: 0 }, typeTag: "Task<int>", value: "готов · 42" }, { id: "g", kind: "gate", at: { zone: "result", row: 0 }, state: "ok", label: "await t", detail: "→ 42", accent: true }], edges: [] },
      ],
      explain: 'Задача — это обещание: «an async method returns a task value when its work is <b>suspended</b>… When the async method eventually completes its work, the task is marked as completed and the result, if any, is stored in the task». Дословно про содержимое: «A task <span class="hl">encapsulates information about the state</span> of the asynchronous process and, eventually, either the final result from the process or the <b>exception</b> that the process raises if it doesn\'t succeed». Отсюда две вещи: (1) задача возвращается рано (на паузе), результат появляется позже; (2) исключение живёт В задаче и всплывает на <code>await</code> — фундамент урока про исключения (S2.7).',
      sources: ["ms-tap"],
    },
    {
      id: "s4", num: "04", kicker: "async без await = синхронно", title: "Нет await → метод исполняется как синхронный (+warning)",
      viewBox: "0 0 340 210", zones: NOAWAIT_ZONES,
      code: ["async Task<int> NoAwait() {    // async, но БЕЗ await", "  return Compute();  }         // исполнится СИНХРОННО", "// компилятор: warning CS1998"],
      scenes: [
        { codeLine: 0, caption: 'Метод помечен <code>async</code>, но внутри <span class="hl">нет <code>await</code></span> — нет точки приостановки.', nodes: [{ id: "m", kind: "obj", at: { zone: "noawait", row: 0 }, typeTag: "async NoAwait", value: "нет await", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Тело исполняется <b>синхронно</b>, как обычный метод — <code>async</code> не делает его асинхронным сам по себе.', nodes: [{ id: "m", kind: "obj", at: { zone: "noawait", row: 0 }, typeTag: "async NoAwait", value: "нет await" }, { id: "s", kind: "gate", at: { zone: "noawait", row: 1 }, state: "ok", label: "тело", detail: "синхронно", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Компилятор выдаёт <span class="hl">warning</span> CS1998 — о том, что метод без <code>await</code>-операторов будет исполняться синхронно.', nodes: [{ id: "m", kind: "obj", at: { zone: "noawait", row: 0 }, typeTag: "async NoAwait", value: "нет await" }, { id: "w", kind: "gate", at: { zone: "noawait", row: 1 }, state: "fail", label: "CS1998", detail: "warning · синхронно", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «async без await всё равно асинхронен». Дословно: «the absence of <code>await</code> expressions doesn\'t cause a compiler error. If an async method <b>doesn\'t use an <code>await</code></b> operator to mark a suspension point, the method <span class="hl">executes as a synchronous method does, despite the <code>async</code> modifier</span>. The compiler issues a warning for such methods». То есть <code>async</code> сам по себе ничего не «распараллеливает» и не делает асинхронным: он лишь <b>включает</b> <code>await</code> (и позволяет ждать этот метод). Асинхронность создаёт именно <code>await</code> на незавершённой операции.',
      sources: ["ms-tap"],
    },
    {
      id: "s5", num: "05", kicker: "Потоки · async ≠ поток", title: "async/await не создают потоков и не блокируют",
      viewBox: "0 0 340 210", zones: THREAD_ZONES,
      code: ["await client.GetStringAsync(url);   // I/O: НИ ОДНОГО потока на время ожидания", "// await не блокирует текущий поток — регистрирует continuation", "// Task.Run — только для CPU-bound (S2.3)"],
      scenes: [
        { codeLine: 0, caption: 'Для I/O-<code>await</code> на время ожидания <span class="hl">нет потока вообще</span> — не «поток спит», а его просто нет.', nodes: [{ id: "io", kind: "gate", at: { zone: "onethread", row: 0 }, state: "ok", label: "await I/O", detail: "0 потоков ждут", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>await</code> <b>не блокирует</b> текущий поток: «signs up the rest of the method as a continuation and returns control».', nodes: [{ id: "io", kind: "gate", at: { zone: "onethread", row: 0 }, state: "ok", label: "await", detail: "не блокирует" }, { id: "c", kind: "chip", at: { zone: "onethread", row: 1 }, value: "continuation вместо блокировки", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Поток из пула берётся <span class="hl">только для CPU-bound</span> через <code>Task.Run</code> — но не для «просто ждать результата».', nodes: [{ id: "io", kind: "gate", at: { zone: "onethread", row: 0 }, state: "ok", label: "async", detail: "≠ поток" }, { id: "cpu", kind: "gate", at: { zone: "onethread", row: 1 }, state: "ok", label: "Task.Run", detail: "только CPU-bound", accent: true }], edges: [] },
      ],
      explain: 'Ядро анти-мифа. Дословно: «An <code>await</code> expression in an async method <span class="hl">doesn\'t block the current thread</span> while the awaited task is running. Instead, the expression signs up the rest of the method as a continuation and returns control to the caller». И прямо: «The <code>async</code> and <code>await</code> keywords <b>don\'t cause extra threads to be created</b>. Async methods don\'t require multithreading because an async method <span class="hl">doesn\'t run on its own thread</span>. The method runs on the current synchronization context and uses time on the thread only when the method is active». Для CPU-bound работы поток берут явно через <code>Task.Run</code>, «but a background thread doesn\'t help with a process that\'s just waiting» (детали — S2.3). Асинхронность — про освобождение потока на время ожидания, а не про добавление потоков.',
      sources: ["ms-tap"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; Work(){ Console.Write(Thread.CurrentThread.ManagedThreadId==caller?"same ":"diff "); await Task.Delay(10); return 42; }</code> — вызвали из потока caller. Что выведет метка перед <code>await</code> (тот же поток, что у вызывающего, или другой)?',
      options: ["same", "diff", "ошибка компиляции", "0"], correctIndex: 0, xp: 10,
      okText: 'Async-метод бежит <span class="hl">синхронно на потоке вызывающего</span> до первого <code>await</code> — тот же поток («same»). Новый поток НЕ создаётся.',
      noText: '«an async method doesn\'t run on its own thread. The method runs on the current synchronization context and uses time on the thread only when the method is active». До <code>await</code> — тот же поток, что у caller. Реальный вывод: <b>same</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "same" }, sourceRefs: ["ms-tap"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; Slow(int ms,int v){ await Task.Delay(ms); return v; }</code><br/>Старт обеих ДО await: <code>var a=Slow(100,1); var b=Slow(100,2); await Task.WhenAll(a,b);</code> — сколько времени ~ относительно одной задачи (1x конкурентно или 2x последовательно)?',
      options: ["1x", "2x", "4x", "0x"], correctIndex: 0, xp: 10,
      okText: 'Задачи <b>стартованы обе</b>, потом <code>WhenAll</code> — идут <span class="hl">конкурентно</span> (~1x времени одной). Это конкурентность, НЕ параллелизм и НЕ потоки.',
      noText: 'Стартуй задачи, <code>await</code> — где нужен результат: обе <code>Delay</code> идут одновременно → ~1x. Последовательный <code>await Slow(); await Slow();</code> дал бы ~2x.',
      verify: { kind: "exec", run: "dotnet run", expect: "1x" }, sourceRefs: ["ms-tap"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; Fast(){ await Task.CompletedTask; return 7; } var t = Fast(); Console.WriteLine($"{t.IsCompleted} {t.Result}");</code> — что напечатает?',
      options: ["True 7", "False 7", "True 0", "False 0"], correctIndex: 0, xp: 10,
      okText: 'Нет незавершённого awaitable (<code>Task.CompletedTask</code> уже готов) → метод завершается <span class="hl">синхронно</span>: <code>IsCompleted</code>=True сразу, <code>Result</code>=7. «async» не гарантирует асинхронность.',
      noText: 'Без incomplete awaitable async-метод завершается синхронно и возвращает уже-готовую задачу. Реальный вывод: <b>True 7</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True 7" }, sourceRefs: ["ms-tap"],
    },
  ],

  takeaways: [
    { icon: "why", k: "async ≠ поток", v: 'Async-метод бежит <span class="hl">синхронно на потоке вызывающего</span> до первого <code>await</code>; «The <code>async</code> and <code>await</code> keywords don\'t cause extra threads to be created». Замер: caller и before-await — один поток T. Асинхронность освобождает поток на время ожидания, а не добавляет его.' },
    { icon: "cost", k: "await — приостановка, не выход", v: '<code>await</code> возвращает control вызывающему, но это <b>не выход</b> из метода: <code>finally</code> при паузе не бежит, метод возобновится в той же точке. Стартуй задачи, <code>await</code> — где нужен результат → конкурентность (~1x).' },
    { icon: "avoid", k: "Task и async без await", v: '<code>Task</code> — обещание: state + результат-или-исключение, возвращается на паузе. <code>async</code> <b>без</b> <code>await</code> исполняется <span class="hl">синхронно</span> (warning CS1998) — сам <code>async</code> ничего не распараллеливает.' },
  ],

  foot: 'урок · <b>TAP-модель</b> · 5 анимир. разборов · панель таймлайна потоков (без нового потока) · дизайн <b>mid</b>',
};
