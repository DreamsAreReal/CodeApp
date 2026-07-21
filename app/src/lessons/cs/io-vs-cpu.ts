/**
 * Lesson: I/O-bound vs CPU-bound — когда Task.Run (CS.S2.io-vs-cpu) — expert density,
 * 5 animated deep-dives. The decision every async developer must get right: I/O-bound work
 * (waiting for a DB/network/file) runs a Task INSIDE the async method WITHOUT Task.Run — there is
 * no thread while it waits; CPU-bound work (an expensive computation) is offloaded to a background
 * thread with Task.Run; Task.Run does NOT speed up I/O (a background thread doesn't help a process
 * that's just waiting); always measure (context-switch overhead may outweigh the work); and
 * ValueTask is for hot paths (S2.5).
 *
 * SIGNATURE machine panel (s1): the decision, proven by a thread-id measurement — Task.Run moves
 * work onto a POOL thread (id differs from the caller, IsThreadPoolThread True), while an I/O await
 * needs no thread while it waits. REAL run-csharp measurement, evidence/F9/io-vs-cpu-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn async-scenarios + TAP model (fetch
 * 2026-07-18) + GT-M4-s2.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../async-scenarios and
 *     .../task-asynchronous-programming-model;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F9/io-vs-cpu-exec.txt:
 *     "True True"; "True"; "same");
 *   - NO GT-M4 myths: Task.Run does NOT speed up I/O (M-async-3); await does NOT create a thread
 *     for I/O (M-async-2); a background thread doesn't help a process that's just waiting.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.io-vs-cpu/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): the decision panel — I/O lane (no thread) vs CPU lane (Task.Run -> pool thread).
const Z_IO: Zone = { id: "io", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "I/O-BOUND", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "await · БЕЗ Task.Run", subCls: "vz-zsub good", subY: 47 };
const Z_CPU: Zone = { id: "cpu", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CPU-BOUND", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Task.Run → пул", subCls: "vz-zsub heap", subY: 47 };
const DECISION_ZONES: Zone[] = [Z_IO, Z_CPU];

// s2: I/O-bound — no thread while waiting.
const Z_WAIT: Zone = { id: "wait", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "I/O · «ждёт результата»", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "ни одного потока на время ожидания", subCls: "vz-zsub good", subY: 47 };
const IO_ZONES: Zone[] = [Z_WAIT];

// s3: CPU-bound — Task.Run offloads to a pool thread.
const Z_CALLER: Zone = { id: "caller", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВЫЗЫВАЮЩИЙ · T", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "свободен", subCls: "vz-zsub", subY: 47 };
const Z_POOL: Zone = { id: "pool", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПУЛ ПОТОКОВ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Task.Run · другой поток", subCls: "vz-zsub heap", subY: 47 };
const CPU_ZONES: Zone[] = [Z_CALLER, Z_POOL];

// s4: Task.Run does NOT speed up I/O — wasted thread.
const Z_DIRECT: Zone = { id: "direct", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "await Io()", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "прямо · ~100мс", subCls: "vz-zsub good", subY: 47 };
const Z_WRAP: Zone = { id: "wrap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Task.Run(Io)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "~100мс + лишний поток", subCls: "vz-zsub heap", subY: 47 };
const WASTE_ZONES: Zone[] = [Z_DIRECT, Z_WRAP];

// s5: always measure — tradeoffs.
const Z_MEASURE: Zone = { id: "measure", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ВСЕГДА ЗАМЕРЯЙ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "у каждого выбора — компромиссы", subCls: "vz-zsub", subY: 47 };
const MEASURE_ZONES: Zone[] = [Z_MEASURE];

export const ioVsCpu: LessonData = {
  id: "CS.S2.io-vs-cpu",
  track: "CS",
  section: "CS.S2",
  module: "S2.3",
  lang: "csharp",
  title: "I/O-bound vs CPU-bound: когда Task.Run",
  kicker: "C# вглубь · S2 · решение о потоке",
  home: { subtitle: "await без Task.Run vs Task.Run на пул, замер", icon: "async", estMinutes: 9 },
  prereqs: ["CS.S2.tap-model"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-scenarios", kind: "doc", org: "Microsoft Learn", title: "Asynchronous programming scenarios (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios", date: "2025-03-12" },
    { id: "ms-tap", kind: "doc", org: "Microsoft Learn", title: "The Task Asynchronous Programming (TAP) model (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model", date: "2025-10-13" },
  ],

  spec: [
    { text: "«I/O-bound code starts an operation represented by a `Task` or `Task<T>` object within the `async` method. CPU-bound code starts an operation on a background thread with the `Task.Run` method.» <span class=\"ru-tr\">«I/O-bound-код запускает операцию, представленную объектом `Task` или `Task<T>`, внутри `async`-метода. CPU-bound-код запускает операцию на фоновом потоке с помощью метода `Task.Run`.»</span>", source: "ms-scenarios" },
  ],
  edgeCases: [
    { text: "<b>Всегда замеряй</b>: «You might discover that your CPU-bound work isn't <span class=\"hl\">costly enough</span> compared with the overhead of context switches when multithreading. Every choice has tradeoffs». <span class=\"ru-tr\">«Вы можете обнаружить, что ваша CPU-bound-работа недостаточно затратна по сравнению с накладными расходами на переключения контекста при многопоточности. У каждого выбора есть компромиссы».</span>", source: "ms-scenarios" },
    { text: "Блокирующее ожидание задачи может вести к <b>дедлокам</b> — предпочитай <code>await</code> по всему стеку. Вынужденно синхронно — <code>GetAwaiter().GetResult()</code> (не <code>.Result</code>/<code>.Wait</code>, они оборачивают в AggregateException).", source: "ms-scenarios" },
    { text: "<code>ValueTask</code> — для горячих путей: <code>Task</code> — reference type, аллоцируется из кучи; при частом синхронном завершении/кэше в тесных циклах лишние аллокации дороги (подробно — S2.5).", source: "ms-scenarios" },
  ],

  misconceptions: [
    {
      wrong: "Task.Run ускоряет I/O / оборачивай всё async в Task.Run",
      hook: 'Частая ошибка: «<span class="wrong">оберну I/O в <code>Task.Run</code> — будет быстрее</span>». Нет: <code>Task.Run</code> переносит <b>CPU-bound</b> работу на фоновый поток, но «a background thread <span class="hl">doesn\'t help</span> with a process that\'s just waiting for results» <span class="ru-tr">«фоновый поток не помогает процессу, который просто ждёт результатов»</span>. Для I/O-<code>await</code> потока на время ожидания <b>нет вообще</b> — оборачивать нечего. Решает один вопрос: <b>ждёшь результата</b> (I/O → без <code>Task.Run</code>) или <b>считаешь дорого</b> (CPU → <code>Task.Run</code>). Ниже <b>пять разборов</b>: <b>машинная панель</b> решения (замер: <code>Task.Run</code> → другой пул-поток), I/O без потока, CPU на пул, <code>Task.Run</code> НЕ ускоряет I/O, и «всегда замеряй».',
      source: "ms-scenarios",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · решение", title: "Task.Run уводит на ПУЛ-поток; I/O-await — нет",
      viewBox: "0 0 340 210", zones: DECISION_ZONES,
      code: ["int main = Thread.CurrentThread.ManagedThreadId;", "int poolId = await Task.Run(()=> Thread.CurrentThread.ManagedThreadId);", "bool onPool = await Task.Run(()=> Thread.CurrentThread.IsThreadPoolThread);", "// main != poolId  ·  onPool == true"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>CPU-путь</b>: <code>Task.Run(delegate)</code> ставит работу в <span class="hl">пул потоков</span> — она бежит на ДРУГОМ потоке, не на вызывающем.', nodes: [{ id: "m", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "Task.Run", detail: "→ пул-поток", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>I/O-путь</b>: <code>await httpClient.GetStringAsync</code> — <span class="hl">без Task.Run</span>; на время ожидания потока вообще нет.', nodes: [{ id: "m", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "Task.Run", detail: "пул" }, { id: "io", kind: "gate", at: { zone: "io", row: 0 }, state: "ok", label: "await I/O", detail: "0 потоков", accent: true }], edges: [] },
        { codeLine: 3, out: "True True", caption: 'Замер CPU-пути: <code>main != poolId</code> → <b>True</b> (другой поток), <code>IsThreadPoolThread</code> → <span class="hl">True</span> (реальный прогон).', nodes: [{ id: "d", kind: "gate", at: { zone: "cpu", row: 0 }, state: "ok", label: "другой поток", detail: "True" }, { id: "pool", kind: "gate", at: { zone: "cpu", row: 1 }, state: "ok", label: "IsThreadPoolThread", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — решение о потоке, снятое по thread-id. Дословно: «I/O-bound code starts an operation represented by a <code>Task</code>… within the async method. CPU-bound code starts an operation <span class="hl">on a background thread with the <code>Task.Run</code></span> method» <span class="ru-tr">«I/O-bound-код запускает операцию, представленную объектом <code>Task</code>… внутри async-метода. CPU-bound-код запускает операцию на фоновом потоке с помощью метода <code>Task.Run</code>»</span>. Прогон CPU-пути: работа в <code>Task.Run</code> идёт на ДРУГОМ потоке (<code>main != poolId</code> → True), и это поток пула (<code>IsThreadPoolThread</code> → True). А I/O-путь (<code>await GetStringAsync</code>) потока на время ожидания не берёт вообще. Отсюда правило: <code>Task.Run</code> — инструмент увести CPU-работу с текущего потока; для «просто подождать» он не нужен и вреден.',
      sources: ["ms-scenarios"],
    },
    {
      id: "s2", num: "02", kicker: "I/O-bound · ждёшь результата", title: "I/O — await без Task.Run, нет потока на ожидание",
      viewBox: "0 0 340 210", zones: IO_ZONES,
      code: ["// вопрос-триггер: код ЖДЁТ результата (БД, сеть, файл)?", "var data = await httpClient.GetStringAsync(url);   // БЕЗ Task.Run", "// избегать TPL для I/O"],
      scenes: [
        { codeLine: 0, caption: 'Вопрос-триггер: «код <span class="hl">ждёт результата/действия</span> — данные из БД?» → это <b>I/O-bound</b>.', nodes: [{ id: "q", kind: "gate", at: { zone: "wait", row: 0 }, state: "ok", label: "ждёшь результата?", detail: "I/O-bound", accent: true }], edges: [] },
        { codeLine: 1, caption: 'I/O запускает операцию-<code>Task</code> <b>внутри</b> async-метода — <span class="hl">без Task.Run</span>, без TPL.', nodes: [{ id: "q", kind: "gate", at: { zone: "wait", row: 0 }, state: "ok", label: "I/O-bound", detail: "await" }, { id: "a", kind: "chip", at: { zone: "wait", row: 1 }, value: "await, БЕЗ Task.Run", accent: true }], edges: [] },
        { codeLine: 2, caption: 'На время ожидания I/O <b>нет потока вообще</b> — поток вызывающего освобождён, не спит.', nodes: [{ id: "a", kind: "gate", at: { zone: "wait", row: 0 }, state: "ok", label: "await I/O", detail: "0 потоков ждут", accent: true }], edges: [] },
      ],
      explain: 'I/O-bound — «ждёшь результата». Решающая таблица дословно: «<i>Should the code wait for a result or action, such as data from a database?</i> → <b>I/O-bound</b> → Use the <code>async</code> modifier and <code>await</code> expression <span class="hl">without the <code>Task.Run</code> method</span>. Avoid using the Task Parallel Library» <span class="ru-tr">«<i>Должен ли код ждать результата или действия, например данных из базы данных?</i> → <b>I/O-bound</b> → Используйте модификатор <code>async</code> и выражение <code>await</code> без метода <code>Task.Run</code>. Избегайте Task Parallel Library»</span>. Механика: «I/O-bound code starts an operation represented by a <code>Task</code>… within the async method» <span class="ru-tr">«I/O-bound-код запускает операцию, представленную объектом <code>Task</code>… внутри async-метода»</span>. И ключевое из TAP-страницы: async-метод «doesn\'t run on its own thread» <span class="ru-tr">«не выполняется на собственном потоке»</span> — на время I/O-ожидания поток не занят. Оборачивать <code>GetStringAsync</code> в <code>Task.Run</code> — ошибка: нечего «уводить», работа и так не на потоке.',
      sources: ["ms-scenarios", "ms-tap"],
    },
    {
      id: "s3", num: "03", kicker: "CPU-bound · дорогое вычисление", title: "CPU — Task.Run уводит на фоновый поток",
      viewBox: "0 0 340 210", zones: CPU_ZONES,
      code: ["// вопрос-триггер: код делает ДОРОГОЕ вычисление?", "var result = await Task.Run(() => CalculateDamageDone());", "// вызывающий поток свободен, счёт идёт на пуле"],
      scenes: [
        { codeLine: 0, caption: 'Вопрос-триггер: «код <span class="hl">делает дорогое вычисление</span>?» → это <b>CPU-bound</b>.', nodes: [{ id: "q", kind: "gate", at: { zone: "caller", row: 0 }, state: "ok", label: "дорого считаешь?", detail: "CPU-bound", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Task.Run(() => Calculate())</code> уводит счёт на <span class="hl">фоновый поток пула</span>; <code>await</code> уступает control.', nodes: [{ id: "q", kind: "gate", at: { zone: "caller", row: 0 }, state: "ok", label: "caller", detail: "уступил control" }, { id: "p", kind: "gate", at: { zone: "pool", row: 0 }, state: "ok", label: "Task.Run", detail: "счёт на пуле", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Вызывающий поток <b>свободен</b> (UI отзывчив, сервис масштабируется), а вычисление завершается на пуле.', nodes: [{ id: "c", kind: "gate", at: { zone: "caller", row: 0 }, state: "ok", label: "caller свободен", detail: "не блокирован" }, { id: "p", kind: "gate", at: { zone: "pool", row: 0 }, state: "ok", label: "пул", detail: "работает", accent: true }], edges: [] },
      ],
      explain: 'CPU-bound — «дорого считаешь». Таблица: «<i>Should the code run an expensive computation?</i> → <b>CPU-bound</b> → Use the <code>async</code> modifier and <code>await</code>, but <span class="hl">spawn off the work on another thread with the <code>Task.Run</code></span> method… If the work is appropriate for concurrency and parallelism, also consider using the Task Parallel Library» <span class="ru-tr">«<i>Должен ли код выполнять затратное вычисление?</i> → <b>CPU-bound</b> → Используйте модификатор <code>async</code> и <code>await</code>, но вынесите работу на другой поток с помощью метода <code>Task.Run</code>… Если работа подходит для конкурентности и параллелизма, также рассмотрите Task Parallel Library»</span>. Механика: «CPU-bound code starts an operation on a <b>background thread</b> with the <code>Task.Run</code> method» <span class="ru-tr">«CPU-bound-код запускает операцию на <b>фоновом потоке</b> с помощью метода <code>Task.Run</code>»</span>. Прогон (разбор 01) это подтвердил: <code>Task.Run</code> уводит счёт на пул-поток, вызывающий поток свободен. Здесь <code>Task.Run</code> уместен — есть настоящая работа, которую надо снять с текущего потока.',
      sources: ["ms-scenarios"],
    },
    {
      id: "s4", num: "04", kicker: "Task.Run НЕ ускоряет I/O", title: "Обернуть I/O в Task.Run — то же время + лишний поток",
      viewBox: "0 0 340 210", zones: WASTE_ZONES,
      code: ["await Io();                    // прямо: ~100мс", "await Task.Run(async ()=> await Io());   // ~100мс + лишний поток", "// время ~то же — фоновый поток просто ждёт вместе с I/O"],
      predictAt: 1, predictQ: 'Обернём I/O-операцию (~100мс) в <code>Task.Run</code>. Время станет меньше, больше или таким же?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>await Io()</code> напрямую — <b>~100мс</b> (время самой I/O-операции).', nodes: [{ id: "d", kind: "gate", at: { zone: "direct", row: 0 }, state: "ok", label: "await Io()", detail: "~100мс", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Task.Run(async ()=> await Io())</code> — тот же <code>await Io()</code>, но <span class="hl">на лишнем пул-потоке</span>, который просто ждёт вместе с I/O.', nodes: [{ id: "d", kind: "gate", at: { zone: "direct", row: 0 }, state: "ok", label: "прямо", detail: "~100мс" }, { id: "w", kind: "gate", at: { zone: "wrap", row: 0 }, state: "fail", label: "Task.Run(Io)", detail: "~100мс + поток", accent: true }], edges: [] },
        { codeLine: 2, out: "same", caption: 'Замер: время <span class="hl">то же</span> («same») — <code>Task.Run</code> не ускорил I/O, только занял лишний поток впустую (реальный прогон).', nodes: [{ id: "d", kind: "gate", at: { zone: "direct", row: 0 }, state: "ok", label: "прямо", detail: "~100мс" }, { id: "w", kind: "gate", at: { zone: "wrap", row: 0 }, state: "fail", label: "обёрнуто", detail: "same · впустую", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «<code>Task.Run</code> ускоряет I/O». Дословно (TAP-страница): «You can use <code>Task.Run</code> to move CPU-bound work to a background thread, but a <span class="hl">background thread doesn\'t help with a process that\'s just waiting</span> for results to become available» <span class="ru-tr">«Вы можете использовать <code>Task.Run</code>, чтобы перенести CPU-bound-работу на фоновый поток, но фоновый поток не помогает процессу, который просто ждёт, пока результаты станут доступны»</span>. Прогон: <code>await Io()</code> и <code>await Task.Run(async ()=> await Io())</code> занимают <b>то же</b> время (~100мс, метка «same»), но обёртка дополнительно берёт пул-поток, который просто ждёт вместе с I/O — чистая трата ресурса. <code>Task.Run</code> оправдан только когда есть <b>реальная CPU-работа</b>, которую надо снять с текущего потока.',
      sources: ["ms-tap", "ms-scenarios"],
    },
    {
      id: "s5", num: "05", kicker: "Всегда замеряй · компромиссы", title: "CPU-работа может не окупить переключение контекста",
      viewBox: "0 0 340 210", zones: MEASURE_ZONES,
      code: ["// маленькая CPU-работа + Task.Run:", "// overhead переключения контекста может СЪЕСТЬ выигрыш", "// правило: измеряй до и после"],
      scenes: [
        { codeLine: 0, caption: 'Не вся CPU-работа окупает <code>Task.Run</code>: <span class="hl">переключение контекста</span> между потоками стоит.', nodes: [{ id: "m", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "маленькая работа", detail: "+ overhead", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Если работа <b>недостаточно дорогая</b> — overhead многопоточности может съесть выигрыш. «Every choice has tradeoffs» <span class="ru-tr">«У каждого выбора есть компромиссы»</span>.', nodes: [{ id: "m", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "работа мала", detail: "overhead > выигрыш" }, { id: "t", kind: "gate", at: { zone: "measure", row: 1 }, state: "fail", label: "tradeoff", detail: "context switch", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Правило: <span class="hl">всегда замеряй</span> исполнение до и после — не гадай, измеряй.', nodes: [{ id: "r", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "измеряй", detail: "до / после", accent: true }], edges: [] },
      ],
      explain: 'Выбор I/O vs CPU — не догма, а замер. Дословно: «<span class="hl">Always measure the execution of your code</span>. You might discover that your CPU-bound work isn\'t costly enough compared with the overhead of <b>context switches</b> when multithreading. Every choice has tradeoffs. Pick the correct tradeoff for your situation» <span class="ru-tr">«Всегда замеряйте исполнение вашего кода. Вы можете обнаружить, что ваша CPU-bound-работа недостаточно затратна по сравнению с накладными расходами на <b>переключения контекста</b> при многопоточности. У каждого выбора есть компромиссы. Выбирайте правильный компромисс для вашей ситуации»</span>. То есть даже для формально CPU-bound работы <code>Task.Run</code> окупается не всегда: если вычисление дешёвое, стоимость переключения между потоками пула перевесит выигрыш. И родственный перф-намёк из этой же страницы: для горячих путей с частым синхронным завершением рассмотри <code>ValueTask</code> (<code>Task</code> — reference type, аллоцируется из кучи) — тема S2.5. Инженерное правило: не гадай — измеряй.',
      sources: ["ms-scenarios"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int main = Thread.CurrentThread.ManagedThreadId; int poolId = await Task.Run(()=> Thread.CurrentThread.ManagedThreadId); bool onPool = await Task.Run(()=> Thread.CurrentThread.IsThreadPoolThread); Console.WriteLine($"{main != poolId} {onPool}");</code> — что напечатает?',
      options: ["True True", "False False", "True False", "False True"], correctIndex: 0, xp: 10,
      okText: '<code>Task.Run</code> уводит работу на <span class="hl">другой поток пула</span>: <code>main != poolId</code> → True (иной поток), <code>IsThreadPoolThread</code> → True. Это CPU-инструмент.',
      noText: '«CPU-bound code starts an operation on a background thread with Task.Run» <span class="ru-tr">«CPU-bound-код запускает операцию на фоновом потоке с помощью Task.Run»</span>. Другой поток, поток пула → <b>True True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True True" }, sourceRefs: ["ms-scenarios"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>long Compute(){ long s=0; for(long i=0;i&lt;50_000_000;i++) s+=i; return s; } int main=Thread.CurrentThread.ManagedThreadId; int t = await Task.Run(()=>{ Compute(); return Thread.CurrentThread.ManagedThreadId; }); Console.WriteLine(main != t);</code> — что напечатает?',
      options: ["True", "False", "0", "ошибка"], correctIndex: 0, xp: 10,
      okText: 'CPU-bound (<code>Compute</code>) через <code>Task.Run</code> уходит на <span class="hl">фоновый поток</span> — <code>main != t</code> → <b>True</b>. Вызывающий поток при этом свободен.',
      noText: '<code>Task.Run</code> «spawn off the work on another thread» <span class="ru-tr">«вынести работу на другой поток»</span> — счёт идёт на пуле, не на вызывающем. Реальный вывод: <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["ms-scenarios"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; Io(){ await Task.Delay(100); return 1; } var sw=Stopwatch.StartNew(); await Io(); long direct=sw.ElapsedMilliseconds; sw.Restart(); await Task.Run(async()=> await Io()); long wrapped=sw.ElapsedMilliseconds; Console.Write(Math.Abs(direct-wrapped) &lt; 40 ? "same" : "diff");</code> — что напечатает?',
      options: ["same", "diff", "faster", "0"], correctIndex: 0, xp: 10,
      okText: 'Обёртка I/O в <code>Task.Run</code> НЕ ускоряет — время <span class="hl">то же</span> («same»): «a background thread doesn\'t help with a process that\'s just waiting» <span class="ru-tr">«фоновый поток не помогает процессу, который просто ждёт»</span>. Лишний поток потрачен впустую.',
      noText: '<code>Task.Run</code> для I/O бесполезен: фоновый поток просто ждёт вместе с I/O. Реальный вывод: <b>same</b>. Оборачивать I/O не нужно.',
      verify: { kind: "exec", run: "dotnet run", expect: "same" }, sourceRefs: ["ms-tap"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Решение о потоке", v: 'Один вопрос: <b>ждёшь результата</b> (I/O → <code>await</code> <span class="hl">без Task.Run</span>) или <b>дорого считаешь</b> (CPU → <code>Task.Run</code> на пул). Замер: <code>Task.Run</code> уводит на другой пул-поток (True True).' },
    { icon: "cost", k: "Task.Run НЕ ускоряет I/O", v: 'Для I/O потока на ожидание нет вообще — оборачивать нечего. Обёртка <code>Task.Run(Io)</code> = <span class="hl">то же время</span> (same) + лишний поток впустую. «a background thread doesn\'t help… just waiting» <span class="ru-tr">«фоновый поток не помогает… просто ждёт»</span>.' },
    { icon: "avoid", k: "Всегда замеряй", v: 'Даже CPU-работа окупает <code>Task.Run</code> не всегда: маленькая работа + <span class="hl">overhead переключения контекста</span> = хуже. Измеряй до/после. Для горячих путей — <code>ValueTask</code> (S2.5).' },
  ],

  foot: 'урок · <b>I/O vs CPU</b> · 5 анимир. разборов · панель решения (пул-поток True True) · дизайн <b>mid</b>',
};
