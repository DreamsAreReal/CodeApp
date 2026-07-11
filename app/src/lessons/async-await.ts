/**
 * Lesson: async/await в C# (T2.M1.async-await) — expert density, 5 animated
 * deep-dives. Ported from docs/research/concepts/lesson-async into the app
 * lesson-as-data format, rendered with the SHARED engine primitives
 * (slot/ref/obj/chip/gate) to draw the state-machine / timeline instead of
 * memory boxes: `obj` = the compiler state machine / Task, `ref` = the calling
 * thread / continuation, `chip` = timeline markers, `gate` = deadlock decision.
 *
 * Every claim carries a source id; all English quotes are verbatim from
 * learn.microsoft.com (TAP model, Consuming TAP, async keyword) and the archived
 * MSDN Magazine best-practices article, retrieved 2026-07-09.
 *
 * Ground truth for card `c1` is REAL execution via the backend
 * POST /api/authoring/run-csharp: the interleave snippet prints "ABC6".
 * Loop: card `c1` maps to backend review item `T2.M1.async-await/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Two horizontal "tracks": the caller thread (top) and the I/O driver (bottom).
// Not memory zones — reused as a timeline backdrop for the state machine.
const Z_TRACKS: Zone[] = [
  { x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "ВЫЗЫВАЮЩИЙ ПОТОК", labelCls: "vz-zlabel sm", lx: 170, ly: 24 },
  { x: 14, y: 120, w: 312, h: 82, cls: "vz-zone heap", label: "I/O · ДРАЙВЕР / IOCP", labelCls: "vz-zlabel heap sm", lx: 170, ly: 110 },
];
// Context-contrast backdrop: captured UI context vs the thread pool.
const Z_CTX: Zone[] = [
  { x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "UI-ПОТОК · захваченный контекст", labelCls: "vz-zlabel sm", lx: 170, ly: 24 },
  { x: 14, y: 120, w: 312, h: 82, cls: "vz-zone good", label: "ПУЛ ПОТОКОВ", labelCls: "vz-zlabel good sm", lx: 170, ly: 110 },
];

export const asyncAwait: LessonData = {
  id: "T2.M1.async-await",
  track: "T2",
  module: "M2.1",
  title: "async/await",
  kicker: "Ядро C# · асинхронность · нюанс",
  home: { subtitle: "Стейт-машина, await ≠ поток, контекст и дедлок", icon: "async", estMinutes: 12 },
  prereqs: ["T1.M3.boxing"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tap", kind: "doc", org: "Microsoft Learn", title: "The Task Asynchronous Programming (TAP) model", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2025-10-13" },
    { id: "ms-async-kw", kind: "doc", org: "Microsoft Learn", title: "async keyword (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/async", date: "2026-01-21" },
    { id: "ms-consume-tap", kind: "doc", org: "Microsoft Learn", title: "Consuming the Task-based Asynchronous Pattern", url: "https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/consuming-the-task-based-asynchronous-pattern", date: "2026-04-17" },
    { id: "ms-bestpractices", kind: "doc", org: "Microsoft Learn · MSDN Magazine", title: "Async/Await — Best Practices in Asynchronous Programming", url: "https://learn.microsoft.com/en-us/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming", date: "2013-03-01" },
  ],

  spec: [
    { text: "«An await expression in an async method doesn't block the current thread while the awaited task is running. Instead, the expression signs up the rest of the method as a continuation and returns control to the caller of the async method.»", source: "ms-tap" },
  ],
  edgeCases: [
    { text: "Блокировка <code>.Result</code> / <code>.Wait()</code> на захваченном контексте → <b>дедлок</b>: «that context already has a thread in it, which is (synchronously) waiting for the async method to complete. They're each waiting for the other, causing a deadlock».", source: "ms-bestpractices" },
    { text: "<code>ConfigureAwait(false)</code> велит await «not to capture and resume on the context, but to continue execution wherever the asynchronous operation… completed» — меньше хопов и <b>нет дедлока</b> для блокирующих вызывающих.", source: "ms-consume-tap" },
    { text: "<code>async void</code> нельзя <code>await</code>: «the caller of a void-returning method can't catch any exceptions that the method throws» — годится только для обработчиков событий.", source: "ms-tap" },
  ],

  misconceptions: [
    {
      wrong: "async раскручивает фоновый поток, а await блокирует его, пока идёт I/O",
      hook: 'Расхожая картинка: <code>async</code> «раскручивает поток», а <code>await</code> «сидит и держит его», пока летит запрос. Тогда вопрос на засыпку: если во время I/O <span class="wrong">никто не крутит поток</span> — кто ждёт? Дословно офдок: «The <code>async</code> and <code>await</code> keywords <span class="wrong">don\'t cause extra threads to be created</span>» и «an async method <span class="wrong">doesn\'t run on its own thread</span>». Ниже — <b>пять разборов</b> с анимацией стейт-машины: приостановка на <code>await</code>, отсутствие потока во время I/O, continuation, захваченный контекст vs <code>ConfigureAwait(false)</code> и механика дедлока.',
      source: "ms-tap",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Стейт-машина · компилятор", title: "async-метод синхронен до первого await",
      viewBox: "0 0 340 210", zones: Z_TRACKS,
      code: ["async Task<int> GetAsync() {", "  var s = await GetStringAsync(url);", "  return s.Length;", "}"],
      scenes: [
        { codeLine: 0, caption: 'Компилятор переписывает <code>async</code>-метод в <b>стейт-машину</b>. Пока это обычный код на <span class="hl">вызывающем потоке</span>.', nodes: [{ id: "sm", kind: "obj", x: 100, y: 56, w: 150, h: 40, typeTag: "state machine", value: "state -1" }, { id: "ctrl", kind: "chip", x: 105, y: 152, w: 168, h: 30, value: "поток → метод", accent: true }], edges: [] },
        { codeLine: 1, caption: '«An async method runs <span class="hl">synchronously</span> until it reaches its first <code>await</code> expression» — до этой точки всё как в обычном методе.', nodes: [{ id: "sm", kind: "obj", x: 100, y: 56, w: 150, h: 40, typeTag: "state machine", value: "state 0", accent: true }, { id: "ctrl", kind: "chip", x: 105, y: 152, w: 168, h: 30, value: "поток → метод" }, { id: "m", kind: "chip", x: 250, y: 62, w: 70, h: 28, value: "await", accent: true }], edges: [] },
      ],
      explain: 'Магии нет: «the compiler does the difficult work». Компилятор превращает <code>async</code>-метод в <b>стейт-машину</b>, где каждый <code>await</code> — точка возможной приостановки. Ключ к модели: «An async method runs synchronously until it reaches its first <code>await</code> expression. At that point, the method is suspended until the awaited task is complete. In the meantime, control returns to the caller of the method». Если <code>await</code> в теле нет, метод «executes as a synchronous method does, despite the <code>async</code> modifier» — и компилятор выдаёт предупреждение.',
      sources: ["ms-async-kw", "ms-tap"],
    },
    {
      id: "s2", num: "02", kicker: "await · приостановка", title: "await не блокирует — возвращает Task",
      viewBox: "0 0 340 210", zones: Z_TRACKS,
      code: ["var s = await GetStringAsync(url);", "// метод приостановлен, поток свободен"],
      predictAt: 0, predictQ: 'Дошли до <code>await</code>, I/O ещё летит. <b>Заблокирован</b> ли вызывающий поток?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'На <code>await</code> метод <span class="hl">приостановлен</span>; I/O стартует на драйвере, а метод <b>возвращает незавершённый Task</b>.', nodes: [{ id: "sm", kind: "obj", x: 74, y: 56, w: 130, h: 42, typeTag: "state machine", value: "⏸ await" }, { id: "task", kind: "chip", x: 258, y: 72, w: 128, h: 28, value: "Task<int> ⏳", accent: true }, { id: "io", kind: "chip", x: 120, y: 152, w: 130, h: 30, value: "I/O запущен" }], edges: [{ id: "r", from: "sm", to: "task", accent: true }] },
        { codeLine: 1, out: "не завершён", caption: '<b>await не блокирует</b>: «signs up the rest of the method as a <span class="hl">continuation</span> and returns control to the caller». Поток свободен для другой работы.', nodes: [{ id: "sm", kind: "obj", x: 74, y: 56, w: 130, h: 42, typeTag: "state machine", value: "⏸ await" }, { id: "ctrl", kind: "chip", x: 258, y: 72, w: 150, h: 30, value: "поток свободен", accent: true }, { id: "io", kind: "chip", x: 120, y: 152, w: 130, h: 30, value: "I/O летит", accent: true }], edges: [] },
      ],
      explain: 'Самый важный тезис: <code>await</code> — <b>не блокировка</b>. Дословно: «Async methods are intended to be non-blocking operations. An await expression in an async method doesn\'t block the current thread while the awaited task is running. Instead, the expression <span class="hl">signs up the rest of the method as a continuation and returns control to the caller</span> of the async method». Метод отдаёт вызывающему <b>незавершённый Task</b> — «an async method returns a task value when its work is suspended» — а поток освобождается и может делать что-то ещё.',
      sources: ["ms-tap"],
    },
    {
      id: "s3", num: "03", kicker: "I/O-bound · нить не занята", title: "Во время I/O поток не занят вообще",
      viewBox: "0 0 340 210", zones: Z_TRACKS,
      code: ["await httpClient.GetStringAsync(url);", "// ждёт драйвер/IOCP, не поток"],
      scenes: [
        { codeLine: 0, caption: 'I/O «в полёте», но <span class="hl">нить не занята</span>: ждёт драйвер/IOCP. «The <code>async</code> and <code>await</code> keywords <b>don\'t cause extra threads to be created</b>».', nodes: [{ id: "ctrl", kind: "chip", x: 100, y: 64, w: 150, h: 30, value: "поток свободен" }, { id: "io", kind: "obj", x: 100, y: 138, w: 140, h: 46, typeTag: "IOCP · драйвер", value: "нет потока", accent: true }], edges: [] },
        { codeLine: 0, caption: '<b>Task ≠ Thread</b>: «an async method <span class="hl">doesn\'t run on its own thread</span>»; «a background thread doesn\'t help with a process that\'s just waiting for results».', nodes: [{ id: "ctrl", kind: "chip", x: 92, y: 64, w: 150, h: 30, value: "поток свободен" }, { id: "io", kind: "obj", x: 100, y: 138, w: 140, h: 46, typeTag: "IOCP · драйвер", value: "нет потока", accent: true }, { id: "note", kind: "chip", x: 268, y: 64, w: 88, h: 28, value: "no thread", accent: true }], edges: [] },
      ],
      explain: 'Отсюда — почему асинхронность ≠ многопоточность. Для I/O-bound ожидания поток вообще не нужен: «Async methods don\'t require multithreading because an async method doesn\'t run on its own thread. The method runs on the current synchronization context and uses time on the thread only when the method is active». И явно про фоновый поток: «You can use <code>Task.Run</code> to move CPU-bound work to a background thread, but a <b>background thread doesn\'t help with a process that\'s just waiting for results to become available</b>». <code>Task</code> — это обещание результата, а не запущенный поток: во время сетевого ожидания потока действительно нет — известная формулировка «There Is No Thread» (Stephen Cleary, не офдок).',
      sources: ["ms-tap"],
    },
    {
      id: "s4", num: "04", kicker: "Continuation · захваченный контекст", title: "Куда возвращается продолжение",
      viewBox: "0 0 340 210", zones: Z_CTX,
      code: ["// UI: await захватывает контекст", "await Task.Delay(1000);            // → UI", "await Task.Delay(1).ConfigureAwait(false); // → пул"],
      scenes: [
        { codeLine: 1, caption: 'По умолчанию <code>await</code> <span class="hl">захватывает</span> текущий контекст и постит продолжение <b>обратно в UI-поток</b> через <code>Post</code>.', nodes: [{ id: "done", kind: "chip", x: 100, y: 150, w: 120, h: 30, value: "I/O готово" }, { id: "cont", kind: "chip", x: 108, y: 64, w: 184, h: 30, value: "→ продолжение · UI", accent: true }], edges: [{ id: "post", from: "done", to: "cont", accent: true }] },
        { codeLine: 2, caption: '<code>ConfigureAwait(false)</code>: продолжение остаётся на <span class="hl">пуле</span> — «not to capture and resume on the context, but to continue… wherever the asynchronous operation completed».', nodes: [{ id: "done", kind: "chip", x: 100, y: 64, w: 120, h: 30, value: "I/O готово" }, { id: "cont", kind: "chip", x: 108, y: 150, w: 184, h: 30, value: "→ продолжение · пул", good: true, accent: true }], edges: [{ id: "stay", from: "done", to: "cont" }] },
      ],
      explain: 'Когда I/O завершается, срабатывает <b>continuation</b>. По умолчанию он идёт на <span class="hl">захваченный контекст</span>: «If a synchronization context… is associated with the thread that was executing the asynchronous method at the time of suspension… the asynchronous method resumes on that same synchronization context by using the context\'s <code>Post</code> method. Otherwise, it relies on the task scheduler». В UI это <b>тот же UI-поток</b> (можно трогать элементы). <code>ConfigureAwait(false)</code> отключает захват: «use the <code>ConfigureAwait</code> method to inform the await operation <b>not to capture and resume on the context</b>, but to continue execution wherever the asynchronous operation… completed». В библиотеках это предпочтительно: «it avoids unnecessary context hops and reduces deadlock risk for callers that block».',
      sources: ["ms-consume-tap"],
    },
    {
      id: "s5", num: "05", kicker: "Дедлок · sync-over-async", title: ".Result на UI-контексте вешает приложение",
      viewBox: "0 0 340 210", zones: Z_CTX,
      code: ["// UI-поток:", "var t = DelayAsync();  // запускаем", "t.Wait();              // блокируем UI  ← дедлок"],
      scenes: [
        { codeLine: 2, caption: '<code>t.Wait()</code> <span class="hl">блокирует</span> UI-поток, ожидая задачу. Но continuation по умолчанию хочет вернуться <b>на этот же</b> контекст.', nodes: [{ id: "ui", kind: "chip", x: 100, y: 64, w: 170, h: 30, value: "UI: .Wait() ⏳", accent: true }, { id: "cont", kind: "chip", x: 100, y: 152, w: 176, h: 30, value: "continuation → UI?" }], edges: [] },
        { codeLine: 2, caption: '<b>Дедлок</b>: «that context already has a thread in it, which is (synchronously) waiting… They\'re each waiting for the other».', nodes: [{ id: "gate", kind: "gate", x: 170, y: 96, w: 230, h: 48, state: "fail", label: "UI занят ↔ continuation ждёт UI", detail: "deadlock" }], edges: [] },
        { codeLine: 2, caption: 'Выход: <b>await</b> вместо <code>.Result</code>/<code>.Wait()</code> («async all the way»), в библиотеках — <span class="hl">ConfigureAwait(false)</span> (continuation на пул, дедлока нет).', nodes: [{ id: "good", kind: "gate", x: 170, y: 158, w: 230, h: 48, state: "ok", label: "await / CA(false)", detail: "continuation → пул · нет дедлока" }], edges: [] },
      ],
      explain: 'Самый частый провал новичка — блокировать async синхронно. «It\'s usually a bad idea to block on async code by calling <code>Task.Wait</code> or <code>Task.Result</code>». Механика на UI/ASP.NET: контекст пропускает «only one chunk of code to run at a time». Дословно: «When the await completes, it attempts to execute the remainder of the async method within the captured context. But <span class="hl">that context already has a thread in it, which is (synchronously) waiting</span> for the async method to complete. They\'re each waiting for the other, causing a deadlock». В консоли дедлока нет — там пул-контекст. Лечение: «async all the way» (не мешать блокировку и async), а в библиотечном коде — <code>ConfigureAwait(false)</code>, который уводит continuation на пул.',
      sources: ["ms-bestpractices", "ms-consume-tap"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; W(){ Console.Write("A"); await Task.Yield(); Console.Write("C"); return 6; } var t=W(); Console.Write("B"); Console.Write(await t);</code> — что напечатает?',
      options: ["ABC6", "ACB6", "AB6C", "BAC6"], correctIndex: 0, xp: 10,
      okText: 'Метод синхронен до первого <code>await</code>: печатает <b>A</b>. На <code>await Task.Yield()</code> он <span class="hl">возвращает управление</span> вызывающему — печатается <b>B</b>. Потом continuation допечатывает <b>C</b>, а <code>await t</code> даёт <b>6</b> → <code>ABC6</code>. (Реальный прогон.)',
      noText: '<code>await</code> не создаёт поток и не блокирует. Метод бежит синхронно до <code>await</code> (печать <b>A</b>), затем <span class="hl">отдаёт управление</span> вызывающему (печать <b>B</b>); continuation допечатывает <b>C</b>, результат — <b>6</b>. Итог: <code>ABC6</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ABC6" }, sourceRefs: ["ms-tap"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что делает await", v: '<code>await</code> <span class="hl">не блокирует</span> и не создаёт поток: «signs up the rest of the method as a continuation and returns control to the caller». Метод — стейт-машина, синхронен до первого <code>await</code>.' },
    { icon: "cost", k: "Task ≠ Thread", v: 'I/O-bound ждёт драйвер/IOCP, а не поток: «an async method doesn\'t run on its own thread». Continuation по умолчанию — на <b>захваченном контексте</b>.' },
    { icon: "avoid", k: "Дедлок", v: 'Не мешай <code>.Result</code>/<code>.Wait()</code> с async на UI/ASP.NET → <b>дедлок</b>. «async all the way»; в библиотеках — <code>ConfigureAwait(false)</code>.' },
  ],

  foot: 'урок · <b>async/await</b> · 5 анимир. разборов · стейт-машина · await ≠ поток · контекст/дедлок · дизайн <b>mid</b>',
};
