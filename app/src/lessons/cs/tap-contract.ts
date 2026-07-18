/**
 * Lesson: The TAP contract from the inside — hot/cold tasks, completion statuses, the compiler
 * async state machine (CS.S2.tap-contract) — expert density, 5 animated deep-dives. What a
 * TAP-method actually promises its consumer: it returns a HOT (already-running) task, runs
 * SYNCHRONOUSLY up to the first await, may complete synchronously, reports exactly one of three
 * COMPLETED statuses (RanToCompletion / Faulted / Canceled), and stores its exceptions in the task.
 *
 * SIGNATURE machine panel (s5) — the compiler async state machine: the `async` method is rewritten
 * by Roslyn into a struct `<GetValueAsync>d__0 : IAsyncStateMachine` with `<>1__state`,
 * `<>t__builder` (AsyncTaskMethodBuilder<int>), the hoisted local `<local>5__2`, and awaiter
 * `<>u__1`; `MoveNext()` switches on the state, and at an await it calls AwaitUnsafeOnCompleted and
 * RETURNS (does NOT unwind the stack), resuming into the same MoveNext later. REAL artifact:
 * evidence/F10/state-machine-decompile.txt (ilspycmd), corroborated live by reflection
 * (evidence/F10/tap-contract-exec.txt: "True True True True").
 *
 * PROVENANCE (GT-M4 §machine-panel, str:F21): the mangled field names (<>1__state, <>t__builder)
 * and the MoveNext skeleton are NOT printed verbatim by Learn — sourced as "Roslyn-generated,
 * ilspycmd decompilation", confidence "medium", shown as a below-the-abstraction illustration, not
 * as a Learn fact. The three consumer-facing behaviours (hot, sync-until-await, statuses) ARE
 * Learn-quoted and each proven by run-csharp.
 *
 * Accuracy contract (G4/G7/G8) — verified against TAP overview + async/await refs (fetch
 * 2026-07-18) + GT-M4-s2.md S2.6 (str:F1..F7):
 *   - card verify.expect is the REAL stdout of run-csharp (evidence/F10/tap-contract-exec.txt:
 *     "hot=True start=InvalidOperationException"; "ABC"; "RanToCompletion Faulted Canceled | completed=True");
 *   - NO GT-M4 myths: M-tap-3 (start a TAP-method task — no, it's hot, Start throws);
 *     M-async-9 (async ⇒ runs asynchronously — no, sync until first await, "ABC");
 *     M-cancel-4 (cancelled op throws from the method — no, status Canceled, no throw from the task).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.tap-contract/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the TAP contract shape.
const Z_TAP: Zone = { id: "tap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "TAP-контракт · один метод FooAsync", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "инициация + завершение · возврат Task/Task<T>", subCls: "vz-zsub good", subY: 47 };
const TAP_ZONES: Zone[] = [Z_TAP];

// s2: hot vs cold.
const Z_HOT: Zone = { id: "hot", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HOT · из TAP-метода", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "уже запущена · НЕ Start", subCls: "vz-zsub good", subY: 47 };
const Z_COLD: Zone = { id: "cold", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "COLD · new Task(...)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Created · нужен Start", subCls: "vz-zsub heap", subY: 47 };
const HOT_ZONES: Zone[] = [Z_HOT, Z_COLD];

// s3: synchronous until the first await.
const Z_SYNC: Zone = { id: "sync", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "до 1-го await", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "синхронно · в потоке вызвавшего", subCls: "vz-zsub", subY: 47 };
const Z_RESUME: Zone = { id: "resume", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "после await", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "возобновление · возможно др. поток", subCls: "vz-zsub good", subY: 47 };
const SYNC_ZONES: Zone[] = [Z_SYNC, Z_RESUME];

// s4: three completed statuses.
const Z_STATUS: Zone = { id: "status", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "три completed-статуса · IsCompleted == true", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "RanToCompletion · Faulted · Canceled", subCls: "vz-zsub", subY: 47 };
const STATUS_ZONES: Zone[] = [Z_STATUS];

// s5 (SIGNATURE): the compiler async state machine.
const Z_SM: Zone = { id: "sm", x: 14, y: 32, w: 312, h: 176, cls: "vz-zone good", label: "<GetValueAsync>d__0 : IAsyncStateMachine", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "Roslyn переписывает async в структуру-автомат", subCls: "vz-zsub good", subY: 45 };
const SM_ZONES: Zone[] = [Z_SM];

export const tapContract: LessonData = {
  id: "CS.S2.tap-contract",
  track: "CS",
  section: "CS.S2",
  module: "S2.6",
  lang: "csharp",
  title: "TAP-контракт изнутри: hot, статусы, автомат",
  kicker: "C# вглубь · S2 · уровень ниже",
  home: { subtitle: "hot task, sync до await, статусы, стейт-машина", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.return-types"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tap-ov", kind: "doc", org: "Microsoft Learn", title: "Task-based Asynchronous Pattern (TAP)", url: "https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap", date: "2023-03-13" },
    { id: "ms-async", kind: "doc", org: "Microsoft Learn", title: "async (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/async", date: "2024-09-01" },
    { id: "ms-sm", kind: "spike", org: "Roslyn / ilspycmd", title: "Compiler async state machine (decompiled)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2026-07-18" },
  ],

  spec: [
    { text: "«A method that supports TAP returns a task that represents the ongoing work.» — TAP-метод возвращает уже начатую (hot) задачу, представляющую выполняющуюся работу.", source: "ms-tap-ov" },
  ],
  edgeCases: [
    { text: "Задача из <b>публичного конструктора</b> <code>Task</code> — «cold» (стартует в <code>Created</code>, нужен <code>Start</code>). Задача из TAP-метода — «hot», уже запущена; звать <code>Start</code> на активной задаче — <code>InvalidOperationException</code>.", source: "ms-tap-ov" },
    { text: "Три <b>completed</b>-статуса: <code>RanToCompletion</code> / <code>Faulted</code> / <code>Canceled</code> — во всех трёх <code>IsCompleted == true</code>. Отмена даёт статус <code>Canceled</code>, результата нет, но <b>сам метод не бросает</b> — <code>OperationCanceledException</code> получит тот, кто <code>await</code>-ит.", source: "ms-tap-ov" },
    { text: "Исключения (кроме usage-ошибок) складываются <b>в задачу</b>, а не летят синхронно на месте вызова: usage-error (<code>ArgumentNullException</code>) — синхронно; прочие — в задачу; обычно ≤1, но <code>WhenAll</code> может нести несколько.", source: "ms-tap-ov" },
  ],

  misconceptions: [
    {
      wrong: "задачу из FooAsync надо стартовать; async ⇒ метод исполняется асинхронно; отменённая операция бросает из самого метода",
      hook: 'Три ошибки о контракте задачи. «<span class="wrong">надо стартовать</span>» — нет: задача из TAP-метода <span class="hl">уже hot</span> (запущена), <code>Start()</code> на ней — <code>InvalidOperationException</code>. «<span class="wrong">async ⇒ асинхронно</span>» — нет: async-метод «<span class="hl">runs synchronously</span> until it reaches its first <code>await</code>» — код до первого <code>await</code> выполняется в потоке вызвавшего (замер: <b>ABC</b>). «<span class="wrong">отмена бросает из метода</span>» — нет: отмена → статус <code>Canceled</code>, метод не бросает; исключение получает тот, кто <code>await</code>-ит. Ниже <b>пять разборов</b>: контракт, hot/cold, sync-до-await, три статуса, и <b>машинная панель</b> — реальный автомат, в который компилятор переписывает async.',
      source: "ms-tap-ov",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Контракт", title: "TAP — один метод FooAsync, возвращает уже начатую задачу",
      viewBox: "0 0 340 210", zones: TAP_ZONES,
      code: ["public Task<int> ComputeAsync(int n)   // один метод: инициация + завершение", "{ if (n < 0) throw new ArgumentException();  // usage-error: синхронно", "  return DoWorkAsync(n); }               // остальное — в задаче, задача уже hot"],
      scenes: [
        { codeLine: 0, caption: 'TAP = <span class="hl">один метод</span> (инициация + завершение), суффикс <code>Async</code>, возврат <code>Task</code>/<code>Task&lt;T&gt;</code> — представляет выполняющуюся работу.', nodes: [{ id: "m", kind: "chip", at: { zone: "tap", row: 0, col: 0 }, value: "ComputeAsync", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Метод возвращается <b>быстро</b>: синхронно — минимум (валидация + запуск). Usage-ошибка (<code>ArgumentException</code>) — бросается <span class="hl">синхронно</span>.', nodes: [{ id: "m", kind: "chip", at: { zone: "tap", row: 0, col: 0 }, value: "ComputeAsync" }, { id: "v", kind: "gate", at: { zone: "tap", row: 1, col: 0 }, state: "fail", label: "usage-error", detail: "синхронно", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Дальше — возврат уже <span class="hl">начатой (hot)</span> задачи; остальные ошибки уйдут в неё, не синхронно.', nodes: [{ id: "m", kind: "chip", at: { zone: "tap", row: 0, col: 0 }, value: "ComputeAsync" }, { id: "t", kind: "gate", at: { zone: "tap", row: 1, col: 1 }, state: "ok", label: "return Task", detail: "hot", accent: true }], edges: [] },
      ],
      explain: 'TAP-контракт (verbatim + GT str:F3/F4/F6): «A method that supports TAP returns a task that represents the ongoing work». Один метод инкапсулирует и запуск, и завершение; имя оканчивается на <code>Async</code>; возврат — <code>Task</code> (для <code>void</code>-аналога) или <code>Task&lt;TResult&gt;</code>. Метод обязан вернуться <b>быстро</b>: синхронно делает лишь минимум — валидацию аргументов и старт. <span class="hl">Usage-ошибки</span> (неверные аргументы, <code>ArgumentNullException</code>) бросаются <b>синхронно</b> на месте вызова; все прочие ошибки — складываются в задачу. Возвращаемая задача уже <b>hot</b> — работает (разбор 02).',
      sources: ["ms-tap-ov"],
    },
    {
      id: "s2", num: "02", kicker: "Hot vs cold", title: "TAP-задача уже запущена; Start() на ней бросает",
      viewBox: "0 0 340 210", zones: HOT_ZONES,
      code: ["Task<int> hot = ComputeAsync(5);   // hot: Status != Created, уже работает", "hot.Start();                        // ⛔ InvalidOperationException", "var cold = new Task(() => {}); cold.Start(); // cold: конструктор → Created → Start"],
      predictAt: 1, predictQ: '<code>var hot = Tap()</code> (async-метод). <code>hot.Status != Created</code>? И что бросит <code>hot.Start()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Задача из TAP/async-метода — <span class="hl">hot</span>: её <code>Status</code> уже не <code>Created</code>, работа идёт.', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "hot.Status", detail: "!= Created", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Звать <code>Start()</code> на уже активной задаче — <span class="hl">InvalidOperationException</span>. Потребитель TAP НЕ стартует задачу.', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "hot", detail: "running" }, { id: "s", kind: "gate", at: { zone: "hot", row: 1 }, state: "fail", label: "hot.Start()", detail: "InvalidOp", accent: true }], edges: [] },
        { codeLine: 2, out: "hot=True start=InvalidOperationException", caption: 'Печать: <b>hot=True start=InvalidOperationException</b> (реальный прогон). Только <code>new Task(...)</code> — cold (<code>Created</code>), его и стартуют.', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "hot", detail: "True" }, { id: "c", kind: "gate", at: { zone: "cold", row: 0 }, state: "", label: "new Task → Start", detail: "cold", accent: true }], edges: [] },
      ],
      explain: 'Hot vs cold (GT str:F1, M-tap-3): задачи из <b>публичных конструкторов</b> <code>Task</code> — «cold»: стартуют в состоянии <code>Created</code> и требуют явного <code>Start</code>. ВСЕ прочие задачи, включая возвращённые TAP-методом, — «hot»: уже запущены. Потребитель TAP-метода <b>НЕ должен</b> звать <code>Start</code>; на активной задаче это <code>InvalidOperationException</code>. Прогон: async-метод даёт <code>hot.Status != Created</code> → <b>True</b>, а <code>hot.Start()</code> → <b>InvalidOperationException</b> (печать «hot=True start=InvalidOperationException»). Практический вывод: получил задачу из <code>...Async()</code> — просто <code>await</code>, не стартуй.',
      sources: ["ms-tap-ov"],
    },
    {
      id: "s3", num: "03", kicker: "Sync до await", title: "async-метод синхронен до первого await",
      viewBox: "0 0 340 210", zones: SYNC_ZONES,
      code: ["async Task Work(){ Console.Write(\"A\"); await Task.Delay(10); Console.Write(\"C\"); }", "var t = Work();  Console.Write(\"B\");  await t;   // A (sync) → B (вызвавший) → C (resume)", "// печать: ABC — async НЕ значит «сразу в другом потоке»"],
      predictAt: 1, predictQ: '<code>Work()</code> печатает A перед await, C после; вызвавший печатает B, затем <code>await t</code>. Порядок печати?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Код <span class="hl">до первого <code>await</code></span> исполняется <b>синхронно</b>, в потоке вызвавшего: сначала печатается <b>A</b>.', nodes: [{ id: "a", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "A", detail: "sync · до await", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'На <code>await</code> метод <span class="hl">возвращает управление</span> вызвавшему — тот печатает <b>B</b>. Метод ещё не закончил.', nodes: [{ id: "a", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "A", detail: "sync" }, { id: "b", kind: "gate", at: { zone: "sync", row: 1 }, state: "ok", label: "B", detail: "вызвавший", accent: true }], edges: [] },
        { codeLine: 2, out: "ABC", caption: 'После <code>Delay</code> метод <span class="hl">возобновляется</span> и печатает <b>C</b>. Итог: <b>ABC</b> (реальный прогон) — async ≠ «сразу асинхронно/в другом потоке».', nodes: [{ id: "ab", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "A · B", detail: "sync" }, { id: "c", kind: "gate", at: { zone: "resume", row: 0 }, state: "ok", label: "C", detail: "resume", accent: true }], edges: [] },
      ],
      explain: 'Ключевой факт (verbatim, async ref + GT str:F4, M-async-9): «An async method runs <span class="hl">synchronously</span> until it reaches its first <code>await</code> expression, at which point the method is suspended until the awaited task is complete». То есть <code>async</code> НЕ означает «метод сразу уходит в другой поток». Прогон: <code>Work()</code> печатает <b>A</b> синхронно, на <code>await Task.Delay</code> отдаёт управление — вызвавший печатает <b>B</b>, — затем метод возобновляется и печатает <b>C</b>: итог <b>ABC</b>. Отсюда: «параллельность» и «поток» — не про <code>async</code> сам по себе (это S2.1/S2.3); <code>async</code> — про приостановку/возобновление без блокировки потока.',
      sources: ["ms-async"],
    },
    {
      id: "s4", num: "04", kicker: "Три статуса", title: "RanToCompletion / Faulted / Canceled — все completed",
      viewBox: "0 0 340 210", zones: STATUS_ZONES,
      code: ["Task.FromResult(1).Status         // RanToCompletion", "Task.FromException(e).Status      // Faulted", "Task.FromCanceled(ct).Status      // Canceled — отмена, НЕ бросок из метода"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Успех → <code>RanToCompletion</code>. Один из <span class="hl">трёх финальных</span> статусов; во всех <code>IsCompleted == true</code>.', nodes: [{ id: "r", kind: "gate", at: { zone: "status", row: 0 }, state: "ok", label: "RanToCompletion", detail: "успех", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Ошибка → <code>Faulted</code>: исключение <span class="hl">хранится в задаче</span>, перебросится на <code>await</code>.', nodes: [{ id: "r", kind: "gate", at: { zone: "status", row: 0 }, state: "ok", label: "RanToCompletion", detail: "ok" }, { id: "f", kind: "gate", at: { zone: "status", row: 1 }, state: "fail", label: "Faulted", detail: "исключение в задаче", accent: true }], edges: [] },
        { codeLine: 2, out: "RanToCompletion Faulted Canceled | completed=True", caption: 'Отмена → <code>Canceled</code>: результата нет, но <span class="hl">метод не бросает</span> — <code>OperationCanceledException</code> получит тот, кто <code>await</code>-ит. Печать: <b>RanToCompletion Faulted Canceled | completed=True</b>.', nodes: [{ id: "f", kind: "gate", at: { zone: "status", row: 0 }, state: "fail", label: "Faulted", detail: "в задаче" }, { id: "c", kind: "gate", at: { zone: "status", row: 1 }, state: "", label: "Canceled", detail: "нет броска из метода", accent: true }], edges: [] },
      ],
      explain: 'Три completed-статуса (GT str:F2/F7, M-cancel-4): задача заканчивается ровно в одном из <code>RanToCompletion</code>, <code>Faulted</code>, <code>Canceled</code> — во всех трёх <code>IsCompleted == true</code>. Прогон: <code>FromResult</code> → <b>RanToCompletion</b>, <code>FromException</code> → <b>Faulted</b> (исключение живёт в задаче), <code>FromCanceled</code> → <b>Canceled</b>. Про отмену важно: она даёт <b>статус</b> <code>Canceled</code>, у задачи нет результата, но <span class="hl">сам метод/задача не «бросает исключение наружу»</span> в момент отмены — <code>OperationCanceledException</code> увидит только тот, кто <code>await</code>-ит эту задачу (детали отмены — S2.8).',
      sources: ["ms-tap-ov"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · автомат", title: "Компилятор переписывает async в структуру-автомат",
      viewBox: "0 0 340 214", zones: SM_ZONES,
      code: ["// async Task<int> GetValueAsync(){ int local=41; await Task.Delay(1); return local+1; }", "struct <GetValueAsync>d__0 : IAsyncStateMachine {   // Roslyn генерирует", "  int <>1__state;  AsyncTaskMethodBuilder<int> <>t__builder;  int <local>5__2;  TaskAwaiter <>u__1;", "  void MoveNext(){ switch(<>1__state){ ... await → AwaitUnsafeOnCompleted; return; ... builder.SetResult(local+1); } } }"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Компилятор превращает <code>async</code>-метод в <span class="hl">структуру-автомат</span> <code>&lt;GetValueAsync&gt;d__0 : IAsyncStateMachine</code> (реальный ilspycmd-артефакт).', nodes: [{ id: "sm", kind: "obj", at: { zone: "sm", row: 0 }, typeTag: "IAsyncStateMachine", value: "struct-автомат", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Поля: <code>&lt;&gt;1__state</code> (номер шага), <code>&lt;&gt;t__builder</code> = <code>AsyncTaskMethodBuilder&lt;int&gt;</code> (строит/завершает Task), локал <code>local</code> <span class="hl">гоистится в поле</span> <code>&lt;local&gt;5__2</code> (переживает await), awaiter <code>&lt;&gt;u__1</code>.', nodes: [{ id: "sm", kind: "obj", at: { zone: "sm", row: 0 }, typeTag: "IAsyncStateMachine", value: "автомат" }, { id: "st", kind: "gate", at: { zone: "sm", row: 1 }, state: "ok", label: "поля", detail: "state · builder · local · awaiter", accent: true }], edges: [] },
        { codeLine: 3, out: "IAsyncStateMachine=True · state · builder · hoisted-local", caption: '<code>MoveNext()</code>: switch по <code>&lt;&gt;1__state</code>; на <code>await</code> — <code>AwaitUnsafeOnCompleted</code> + <span class="hl">return</span> (стек НЕ разматывается), позже — то же <code>MoveNext</code> и <code>builder.SetResult(local+1)</code>. Живой рефлексией: <b>True True True True</b>.', nodes: [{ id: "mn", kind: "gate", at: { zone: "sm", row: 0 }, state: "ok", label: "MoveNext", detail: "await → return; resume → SetResult" }, { id: "chk", kind: "gate", at: { zone: "sm", row: 1 }, state: "ok", label: "рефлексия", detail: "True×4", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — уровень ниже <code>async/await</code>. Компилятор (Roslyn) переписывает <code>async Task&lt;int&gt; GetValueAsync()</code> в <b>структуру</b> <code>&lt;GetValueAsync&gt;d__0</code>, реализующую <code>IAsyncStateMachine</code>. Поля (декомпиляция ilspycmd): <code>&lt;&gt;1__state</code> — номер состояния (−1 не начато/готово, 0 — ждём на await); <code>&lt;&gt;t__builder</code> — <code>AsyncTaskMethodBuilder&lt;int&gt;</code>, который строит и завершает возвращаемый <code>Task</code>; локальная <code>local</code> <span class="hl">гоистится</span> в поле <code>&lt;local&gt;5__2</code>, чтобы пережить приостановку; awaiter — в <code>&lt;&gt;u__1</code>. Метод <code>MoveNext()</code>: <code>switch</code> по состоянию; дойдя до <code>await</code>, зовёт <code>builder.AwaitUnsafeOnCompleted(...)</code> и <b>возвращается</b> — стек НЕ разматывается, поток свободен; когда awaited-задача готова, тот же <code>MoveNext</code> вызывается снова, доходит до <code>builder.SetResult(local + 1)</code>. Провенанс: манглированные имена и скелет — Roslyn-генерация (ilspycmd), не дословный Learn-текст; уверенность средняя. Живой замер рефлексией подтверждает инварианты: тип реализует <code>IAsyncStateMachine</code>, имеет поле состояния, <code>AsyncTaskMethodBuilder</code> и гоистнутый локал → <b>True True True True</b>.',
      sources: ["ms-sm"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; Tap(){ await Task.Delay(1); return 1; } var hot = Tap(); bool started = hot.Status != TaskStatus.Created; string err="none"; try { hot.Start(); } catch (InvalidOperationException){ err="InvalidOperationException"; } await hot; Console.WriteLine($"hot={started} start={err}");</code> — что напечатает?',
      options: ["hot=True start=InvalidOperationException", "hot=False start=none", "hot=True start=none", "hot=False start=InvalidOperationException"], correctIndex: 0, xp: 10,
      okText: 'Задача из TAP/async-метода <span class="hl">уже hot</span> (<code>Status != Created</code> → True), а <code>Start()</code> на активной задаче — <code>InvalidOperationException</code>. Печать: <b>hot=True start=InvalidOperationException</b>.',
      noText: 'TAP-задача уже запущена; <code>Start</code> на ней бросает. Реальный вывод: <b>hot=True start=InvalidOperationException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "hot=True start=InvalidOperationException" }, sourceRefs: ["ms-tap-ov"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task Work(){ Console.Write("A"); await Task.Delay(10); Console.Write("C"); } var t = Work(); Console.Write("B"); await t;</code> — что напечатает?',
      options: ["ABC", "BAC", "ACB", "BCA"], correctIndex: 0, xp: 10,
      okText: 'async-метод <span class="hl">синхронен до первого <code>await</code></span>: печатает <b>A</b>, на <code>await</code> отдаёт управление вызвавшему (<b>B</b>), затем возобновляется (<b>C</b>). Итог: <b>ABC</b> — async ≠ «сразу в другом потоке».',
      noText: '«runs synchronously until its first await»: A (sync) → B (вызвавший) → C (resume). Реальный вывод: <b>ABC</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ABC" }, sourceRefs: ["ms-async"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var ok = Task.FromResult(1); var fault = Task.FromException(new Exception("x")); var canc = Task.FromCanceled(new CancellationToken(true)); Console.WriteLine($"{ok.Status} {fault.Status} {canc.Status} | completed={ok.IsCompleted &amp;&amp; fault.IsCompleted &amp;&amp; canc.IsCompleted}");</code> — что напечатает?',
      options: ["RanToCompletion Faulted Canceled | completed=True", "Running Faulted Canceled | completed=False", "RanToCompletion Faulted Canceled | completed=False", "RanToCompletion Canceled Faulted | completed=True"], correctIndex: 0, xp: 10,
      okText: 'Три <span class="hl">completed</span>-статуса: успех → <code>RanToCompletion</code>, ошибка → <code>Faulted</code>, отмена → <code>Canceled</code>; во всех <code>IsCompleted == true</code>. Печать: <b>RanToCompletion Faulted Canceled | completed=True</b>.',
      noText: 'RanToCompletion/Faulted/Canceled — все три «completed». Реальный вывод: <b>RanToCompletion Faulted Canceled | completed=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "RanToCompletion Faulted Canceled | completed=True" }, sourceRefs: ["ms-tap-ov"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Контракт TAP", v: 'Один метод <code>FooAsync</code> возвращает <b>hot</b> (уже начатую) задачу; usage-ошибки — синхронно, прочие — в задачу. Потребитель <span class="hl">не стартует</span> задачу: <code>Start()</code> на ней — <code>InvalidOperationException</code> (замер: hot=True).' },
    { icon: "avoid", k: "sync до await", v: 'async-метод «<span class="hl">runs synchronously until its first await</span>» — код до <code>await</code> в потоке вызвавшего (замер: <b>ABC</b>). <code>async</code> ≠ «сразу асинхронно/другой поток».' },
    { icon: "cost", k: "статусы + автомат", v: 'Три completed-статуса: <code>RanToCompletion/Faulted/Canceled</code> (замер). Под капотом компилятор переписывает <code>async</code> в <b>структуру-автомат</b> <code>IAsyncStateMachine</code>: <code>MoveNext()</code> на <code>await</code> делает <code>return</code> (стек не разматывается) и возобновляется позже.' },
  ],

  foot: 'урок · <b>TAP-контракт + async state machine</b> · 5 анимир. разборов · панель Roslyn-автомата (ilspycmd) · дизайн <b>mid</b>',
};
