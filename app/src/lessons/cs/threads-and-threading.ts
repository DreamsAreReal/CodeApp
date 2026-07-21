/**
 * Lesson: Threads and threading — Thread, foreground/background, ThreadPool
 * (CS.S8.threads-and-threading) — expert density, 5 animated deep-dives. Three ways to run code
 * off the primary thread, in order of preference the docs give: TPL/PLINQ (highest level),
 * ThreadPool worker threads, and the raw System.Threading.Thread class (lowest level). The
 * foreground/background distinction decides whether a thread keeps the process alive; pool threads
 * are background and reused; you create your own Thread only for the specific cases the docs list.
 *
 * SIGNATURE machine panel (s5): a dedicated `new Thread` runs on a DIFFERENT managed thread than the
 * primary one and is NOT a pool thread — REAL run-csharp measurement (this file's exec cards):
 * different=True worker_is_pool=False.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (threads-and-threading,
 *     foreground-and-background-threads, the-managed-thread-pool), fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (threads JOINED /
 *     CountdownEvent-awaited before printing): c1 "different=True worker_is_pool=False" ·
 *     c2 "before=False after=True" · c3 "done=5".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.threads-and-threading/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: primary thread + worker threads.
const Z_PRIM: Zone = { id: "prim", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "PRIMARY THREAD", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "с ним стартует .NET", subCls: "vz-zsub good", subY: 47 };
const Z_WORK: Zone = { id: "work", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "WORKER THREADS", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "созданы дополнительно", subCls: "vz-zsub heap", subY: 47 };
const PRIM_ZONES: Zone[] = [Z_PRIM, Z_WORK];

// s2: three levels of the API — TPL/PLINQ, ThreadPool, Thread. Tall zone (h=234 → inner 218u)
// so three stacked gate rows (measured ~212u total) fit with PAD≥8.
const Z_LADDER: Zone = { id: "ladder", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "КАК ЗАПУСТИТЬ КОД ПАРАЛЛЕЛЬНО · три уровня", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "от рекомендованного к низкоуровневому", subCls: "vz-zsub", subY: 40 };
const LADDER_ZONES: Zone[] = [Z_LADDER];

// s3: foreground vs background — keeping the process alive.
const Z_FG: Zone = { id: "fg", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "FOREGROUND", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "держит процесс живым", subCls: "vz-zsub good", subY: 47 };
const Z_BG: Zone = { id: "bg", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "BACKGROUND", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "НЕ держит · умрёт с процессом", subCls: "vz-zsub heap", subY: 47 };
const FGBG_ZONES: Zone[] = [Z_FG, Z_BG];

// s4: the managed thread pool — reuse, one per process.
const Z_QUEUE: Zone = { id: "queue", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОЧЕРЕДЬ РАБОТ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "QueueUserWorkItem", subCls: "vz-zsub", subY: 47 };
const Z_POOL2: Zone = { id: "pool2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ThreadPool", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "один пул на процесс · reuse", subCls: "vz-zsub good", subY: 47 };
const POOL_ZONES: Zone[] = [Z_QUEUE, Z_POOL2];

// s5 (SIGNATURE): dedicated Thread is a distinct managed thread, not from the pool.
const Z_MAIN: Zone = { id: "main", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "PRIMARY", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "ManagedThreadId", subCls: "vz-zsub good", subY: 47 };
const Z_DED2: Zone = { id: "ded2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "new Thread", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "другой id · не пул", subCls: "vz-zsub heap", subY: 47 };
const DED_ZONES: Zone[] = [Z_MAIN, Z_DED2];

export const threadsAndThreading: LessonData = {
  id: "CS.S8.threads-and-threading",
  track: "CS",
  section: "CS.S8",
  module: "S8.2",
  lang: "csharp",
  title: "Thread, foreground/background, ThreadPool",
  kicker: "C# вглубь · S8 · три уровня запуска",
  home: { subtitle: "primary/worker, TPL→ThreadPool→Thread, fg/bg, пул", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.managed-threading-basics"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-threads", kind: "doc", org: "Microsoft Learn", title: "Threads and threading", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/threads-and-threading", date: "2022-03-11" },
    { id: "ms-fgbg", kind: "doc", org: "Microsoft Learn", title: "Foreground and background threads", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/foreground-and-background-threads", date: "2021-09-15" },
    { id: "ms-pool", kind: "doc", org: "Microsoft Learn", title: "The managed thread pool", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool", date: "2026-03-19" },
  ],

  spec: [
    { text: "«By default, a .NET program is started with a single thread, often called the primary thread.» Дополнительные потоки — worker threads.", source: "ms-threads" },
    { text: "Рекомендованный путь — TPL/PLINQ поверх пула: «Both TPL and PLINQ rely on the ThreadPool threads.» Низкоуровневый — «the System.Threading.Thread class that represents a managed thread».", source: "ms-threads" },
  ],
  edgeCases: [
    { text: "Фоновый поток не держит процесс: «a background thread does not keep the managed execution environment running». Все foreground остановились → рантайм гасит background и завершается.", source: "ms-fgbg" },
    { text: "Пул — фоновый и один на процесс: «Thread pool threads are background threads» и «There is only one thread pool per process». После задачи поток возвращается в очередь ожидания и переиспользуется.", source: "ms-pool" },
    { text: "Свой Thread — только для особых случаев: «You require a foreground thread», «You require a thread to have a particular priority», задачи с длинными блокировками, STA-апартамент, «a stable identity associated with the thread».", source: "ms-pool" },
  ],

  misconceptions: [
    {
      wrong: "чтобы что-то запустить параллельно, всегда создают new Thread",
      hook: 'Почти никогда. Порядок предпочтения в доках обратный: сначала <b>TPL/PLINQ</b>, потом <b>ThreadPool</b>, и только потом сырой <code>Thread</code>. «By default, a .NET program is started with a single thread, often called the <span class="hl">primary thread</span>» — остальное создают как нужно. «Both TPL and PLINQ <span class="hl">rely on the <code>ThreadPool</code> threads</span>. … At last, you can use the <code>System.Threading.Thread</code> class that represents a managed thread». Свой <code>Thread</code> нужен для узкого списка причин: «You require a <span class="hl">foreground thread</span>», особый приоритет, долгие блокировки, STA, стабильная идентичность. Дальше <b>пять разборов</b>: primary/worker, лестница TPL→ThreadPool→Thread, foreground vs background (кто держит процесс), пул (reuse, один на процесс), и <b>машинная панель</b> — dedicated Thread = другой managed id и не из пула, реальным прогоном.',
      source: ["ms-threads", "ms-pool"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Primary · worker", title: ".NET стартует с одним потоком; остальные создаёшь сам",
      viewBox: "0 0 340 210", zones: PRIM_ZONES,
      code: ["// программа стартует на ОДНОМ потоке (primary)", "var worker = new Thread(DoWork);   // дополнительный поток", "worker.Start();                    // теперь их два"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Старт — один поток: «a .NET program is started with a <span class="hl">single thread, often called the primary thread</span>».', nodes: [{ id: "p", kind: "obj", at: { zone: "prim", row: 0 }, typeTag: "primary", value: "1 поток", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Создаём <b>worker</b>: «it can create additional threads to execute code in parallel or concurrently with the primary thread».', nodes: [{ id: "p", kind: "obj", at: { zone: "prim", row: 0 }, typeTag: "primary", value: "1 поток" }, { id: "w", kind: "obj", at: { zone: "work", row: 0 }, typeTag: "worker", value: "создан", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'После <code>Start()</code> оба бегут в одном процессе, деля память. «These threads are often called <span class="hl">worker threads</span>».', nodes: [{ id: "p", kind: "obj", at: { zone: "prim", row: 0 }, typeTag: "primary", value: "работает" }, { id: "w", kind: "obj", at: { zone: "work", row: 0 }, typeTag: "worker", value: "работает", accent: true }], edges: [] },
      ],
      explain: 'База threading-модели: «<span class="hl">By default, a .NET program is started with a single thread, often called the primary thread. However, it can create additional threads to execute code in parallel or concurrently with the primary thread. These threads are often called worker threads</span>». Зачем вообще много потоков: «You use multiple threads to <span class="hl">increase the responsiveness</span> of your application and to take advantage of a multiprocessor or multi-core system to <span class="hl">increase the application\'s throughput</span>». Отзывчивость (UI-поток не занят долгой операцией) и пропускная способность (работа параллелится по ядрам) — это разные цели, и второй выигрыш есть только на многоядерной машине.',
      sources: ["ms-threads"],
    },
    {
      id: "s2", num: "02", kicker: "Три уровня · предпочтение", title: "TPL/PLINQ → ThreadPool → Thread (сверху вниз)",
      viewBox: "0 0 340 276", zones: LADDER_ZONES,
      code: ["Parallel.ForEach(items, Process);   // 1) TPL — рекомендовано", "ThreadPool.QueueUserWorkItem(Work);  // 2) пул worker-потоков", "new Thread(Work).Start();            // 3) сырой Thread — низкий уровень"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Верх лестницы — <b>TPL/PLINQ</b>: «the recommended way to utilize multithreading is to use <span class="hl">Task Parallel Library (TPL) and Parallel LINQ (PLINQ)</span>».', nodes: [{ id: "tpl", kind: "gate", at: { zone: "ladder", row: 0 }, state: "ok", label: "TPL / PLINQ", detail: "рекомендовано", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Под ним — <b>пул</b>: «Both TPL and PLINQ <span class="hl">rely on the <code>ThreadPool</code> threads</span>». Можно звать пул и напрямую.', nodes: [{ id: "tpl", kind: "gate", at: { zone: "ladder", row: 0 }, state: "ok", label: "TPL / PLINQ", detail: "рекомендовано" }, { id: "pool", kind: "gate", at: { zone: "ladder", row: 1 }, state: "ok", label: "ThreadPool", detail: "worker threads", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Низ — сырой <code>Thread</code>: «At last, you can use the <code>System.Threading.Thread</code> class that <span class="hl">represents a managed thread</span>». Самый низкий уровень.', nodes: [{ id: "tpl", kind: "gate", at: { zone: "ladder", row: 0 }, state: "ok", label: "TPL / PLINQ", detail: "рекомендовано" }, { id: "pool", kind: "gate", at: { zone: "ladder", row: 1 }, state: "ok", label: "ThreadPool", detail: "worker threads" }, { id: "thr", kind: "gate", at: { zone: "ladder", row: 2 }, state: "", label: "new Thread", detail: "низкий уровень", accent: true }], edges: [] },
      ],
      explain: 'Три уровня API, в порядке предпочтения из доков: «<span class="hl">Starting with .NET Framework 4, the recommended way to utilize multithreading is to use Task Parallel Library (TPL) and Parallel LINQ (PLINQ)</span>… Both TPL and PLINQ rely on the <code>ThreadPool</code> threads. The <code>System.Threading.ThreadPool</code> class provides a .NET application with a <span class="hl">pool of worker threads</span>. You can also use thread pool threads. … At last, you can use the <code>System.Threading.Thread</code> class that represents a managed thread». Идёшь снизу вверх только когда верхний уровень не подходит: TPL прячет партиционирование и планирование, пул прячет создание/переиспользование потоков, а голый <code>Thread</code> оставляет всё это на тебе.',
      sources: ["ms-threads"],
    },
    {
      id: "s3", num: "03", kicker: "Foreground vs background", title: "Foreground держит процесс живым; background — нет",
      viewBox: "0 0 340 210", zones: FGBG_ZONES,
      code: ["var t = new Thread(Work);   // по умолчанию FOREGROUND", "t.IsBackground = true;      // сделали BACKGROUND", "// Main вернулся -> foreground кончились -> процесс гаснет"],
      predictAt: 1, predictQ: 'Только что созданный <code>new Thread</code>: чему равно <code>IsBackground</code>, и что станет после <code>t.IsBackground = true</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>new Thread</code> — <b>foreground</b>: пока он жив, процесс не завершится. «a background thread <span class="hl">does not keep</span> the managed execution environment running» — а foreground держит.', nodes: [{ id: "f", kind: "gate", at: { zone: "fg", row: 0 }, state: "ok", label: "IsBackground", detail: "False (fg)", accent: true }], edges: [] },
        { codeLine: 1, out: "before=False after=True", caption: '<code>t.IsBackground = true</code> переводит его в <b>background</b>: теперь он <span class="hl">не</span> держит процесс. «A thread can be changed to a background thread at any time by setting its <code>IsBackground</code> property to <code>true</code>».', nodes: [{ id: "f", kind: "gate", at: { zone: "fg", row: 0 }, state: "", label: "было", detail: "False" }, { id: "b", kind: "gate", at: { zone: "bg", row: 0 }, state: "ok", label: "стало", detail: "True (bg)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Когда все foreground остановились — рантайм <span class="hl">гасит все background</span> и завершается. Без исключения в потоке.', nodes: [{ id: "b", kind: "gate", at: { zone: "bg", row: 0 }, state: "fail", label: "процесс завершён", detail: "bg остановлены", accent: true }], edges: [] },
      ],
      explain: 'Единственное отличие двух родов потока — влияние на завершение процесса: «<span class="hl">Background threads are identical to foreground threads with one exception: a background thread does not keep the managed execution environment running</span>. Once all foreground threads have been stopped in a managed process … <span class="hl">the system stops all background threads and shuts down</span>». Переключение: «Use the <code>Thread.IsBackground</code> property to determine whether a thread is a background or a foreground thread, or to change its status. A thread can be changed to a background thread at any time by setting its <code>IsBackground</code> property to <code>true</code>». Важная оговорка: «The foreground or background status of a thread <span class="hl">does not affect the outcome of an unhandled exception</span>» — необработанное исключение в любом роде потока валит приложение.',
      sources: ["ms-fgbg"],
    },
    {
      id: "s4", num: "04", kicker: "Пул · reuse", title: "Один пул на процесс; поток переиспользуется после задачи",
      viewBox: "0 0 340 210", zones: POOL_ZONES,
      code: ["ThreadPool.QueueUserWorkItem(Work);  // в очередь", "// пул сам выделит фоновый поток и выполнит", "// поток вернётся в пул -> переиспользуется"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>QueueUserWorkItem</code> кладёт работу в <b>очередь</b> пула. Число задач в очереди ограничено только памятью.', nodes: [{ id: "q", kind: "obj", at: { zone: "queue", row: 0 }, typeTag: "work item", value: "в очереди", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Пул выделяет <b>фоновый</b> поток: «Thread pool threads are <span class="hl">background threads</span>». Он выполняет задачу.', nodes: [{ id: "q", kind: "obj", at: { zone: "queue", row: 0 }, typeTag: "work item", value: "взят" }, { id: "p", kind: "obj", at: { zone: "pool2", row: 0 }, typeTag: "pool thread", value: "выполняет", accent: true }], edges: [{ id: "e1", from: "q", to: "p", accent: true }] },
        { codeLine: 2, out: "", caption: 'После задачи поток <span class="hl">возвращается в очередь ожидания</span> и переиспользуется — «avoid the cost of creating a new thread for each task». Пул — <b>один на процесс</b>.', nodes: [{ id: "p", kind: "obj", at: { zone: "pool2", row: 0 }, typeTag: "pool thread", value: "свободен · reuse", accent: true }], edges: [] },
      ],
      explain: 'Пул — про амортизацию стоимости потока: «Once a thread in the thread pool completes its task, it\'s returned to a queue of waiting threads. From this moment it can be reused. This <span class="hl">reuse enables applications to avoid the cost of creating a new thread for each task</span>». Характеристики: «Thread pool threads are <span class="hl">background threads</span>. Each thread uses the default stack size, runs at the default priority, and is in the multithreaded apartment» и «<span class="hl">There is only one thread pool per process</span>». Число активных потоков пул регулирует сам под пропускную способность. Когда пул НЕ подходит: «You require a foreground thread», «You require a thread to have a particular priority», задачи с долгими блокировками, STA-апартамент, «a stable identity associated with the thread» — тогда создают свой <code>Thread</code>.',
      sources: ["ms-pool"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · id и пул", title: "Свой Thread — другой ManagedThreadId и не из пула",
      viewBox: "0 0 340 210", zones: DED_ZONES,
      code: ["int mainId = Thread.CurrentThread.ManagedThreadId;", "var t = new Thread(() => { workerId = ...ManagedThreadId; pool = ...IsThreadPoolThread; });", "t.Start(); t.Join();  // different? worker_is_pool?"],
      predictAt: 2, predictQ: 'Сравниваем <code>ManagedThreadId</code> primary и своего <code>new Thread</code>, плюс <code>IsThreadPoolThread</code> у него. Что за пара (different, worker_is_pool)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'У primary свой <code>ManagedThreadId</code>. Каждый managed-поток имеет уникальный id в процессе.', nodes: [{ id: "m", kind: "obj", at: { zone: "main", row: 0 }, typeTag: "primary", value: "id = M", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Свой <code>new Thread</code> — <b>отдельный</b> managed-поток с другим id, и он <span class="hl">не из пула</span>.', nodes: [{ id: "m", kind: "obj", at: { zone: "main", row: 0 }, typeTag: "primary", value: "id = M" }, { id: "d", kind: "obj", at: { zone: "ded2", row: 0 }, typeTag: "new Thread", value: "id = W ≠ M", accent: true }], edges: [] },
        { codeLine: 2, out: "different=True worker_is_pool=False", caption: 'Панель: <b>different=True, worker_is_pool=False</b> (реальный прогон). Свой поток — <span class="hl">отдельная сущность</span>, не пуловый worker. Вот почему пул дешевле для мелких задач.', nodes: [{ id: "diff", kind: "gate", at: { zone: "main", row: 0 }, state: "ok", label: "id разный", detail: "True", accent: true }, { id: "np", kind: "gate", at: { zone: "ded2", row: 0 }, state: "fail", label: "IsThreadPoolThread", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — свой поток против primary и против пула. Прогон: <code>mainId != workerId</code> → <code>True</code> (это разные managed-потоки), <code>worker.IsThreadPoolThread</code> → <code>False</code> (свой поток не пуловый). Печать <b>different=True worker_is_pool=False</b>. Смысл в контрасте: пуловый поток фоновый и переиспользуется, а свой <code>Thread</code> — отдельная foreground-сущность, которую ты создал и которой владеешь. Именно поэтому доки советуют брать пул/TPL для коротких работ («avoid the cost of creating a new thread for each task») и оставлять сырой <code>Thread</code> для случаев, где нужна foreground-семантика, приоритет, STA или стабильная идентичность потока.',
      sources: ["ms-threads", "ms-pool"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int mainId = Thread.CurrentThread.ManagedThreadId; int workerId = 0; bool pool = true; var t = new Thread(() => { workerId = Thread.CurrentThread.ManagedThreadId; pool = Thread.CurrentThread.IsThreadPoolThread; }); t.Start(); t.Join(); Console.WriteLine($"different={mainId != workerId} worker_is_pool={pool}");</code> — что напечатает?',
      options: ["different=True worker_is_pool=False", "different=False worker_is_pool=False", "different=True worker_is_pool=True", "different=False worker_is_pool=True"], correctIndex: 0, xp: 10,
      okText: 'Свой <code>new Thread</code> — <b>отдельный</b> managed-поток (<code>ManagedThreadId</code> ≠ primary → True) и <span class="hl">не пуловый</span> (False). После <code>Join</code> оба значения детерминированы.',
      noText: '<code>new Thread</code> создаёт новый managed-поток вне пула. Реальный вывод: <b>different=True worker_is_pool=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "different=True worker_is_pool=False" }, sourceRefs: ["ms-threads", "ms-pool"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var t = new Thread(() => {}); bool before = t.IsBackground; t.IsBackground = true; bool after = t.IsBackground; Console.WriteLine($"before={before} after={after}");</code> — что напечатает?',
      options: ["before=False after=True", "before=True after=True", "before=False after=False", "before=True after=False"], correctIndex: 0, xp: 10,
      okText: '<code>new Thread</code> по умолчанию <b>foreground</b> (<code>IsBackground == False</code>); «A thread can be changed to a background thread at any time by setting its <code>IsBackground</code> property to <code>true</code>» → после присваивания True.',
      noText: 'Свой поток стартует foreground; <code>IsBackground = true</code> переводит его в background. Реальный вывод: <b>before=False after=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=False after=True" }, sourceRefs: ["ms-fgbg"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int done = 0; var cde = new CountdownEvent(5); for (int i = 0; i &lt; 5; i++) ThreadPool.QueueUserWorkItem(_ => { Interlocked.Increment(ref done); cde.Signal(); }); cde.Wait(); Console.WriteLine($"done={done}");</code> — что напечатает?',
      options: ["done=5", "done=0", "done (меньше 5, непредсказуемо)", "done=1"], correctIndex: 0, xp: 10,
      okText: '5 work items ставим в пул; <code>CountdownEvent(5)</code> ждёт, пока все просигналят, а <code>Interlocked.Increment</code> атомарен — итог детерминирован: <b>done=5</b>.',
      noText: '<code>cde.Wait()</code> блокирует, пока все 5 задач не выполнят <code>Signal</code>; атомарный инкремент даёт ровно <b>done=5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "done=5" }, sourceRefs: ["ms-pool"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Три уровня", v: 'Порядок предпочтения: <b>TPL/PLINQ → ThreadPool → Thread</b>. «Both TPL and PLINQ rely on the <code>ThreadPool</code> threads»; сырой <code>Thread</code> «represents a managed thread» — низший уровень. .NET стартует с одного primary-потока.' },
    { icon: "cost", k: "fg / bg", v: 'Единственная разница: «a background thread <span class="hl">does not keep</span> the managed execution environment running». <code>new Thread</code> — foreground; пуловый — background. Переключение через <code>IsBackground</code> (before=False after=True).' },
    { icon: "avoid", k: "Пул vs свой", v: 'Пул: «Thread pool threads are background threads», «only one thread pool per process», reuse. Свой <code>Thread</code> — другой id, не из пула (different=True worker_is_pool=False) — только для foreground/priority/STA/долгих блокировок.' },
  ],

  foot: 'урок · <b>Thread, fg/bg, ThreadPool</b> · 5 анимир. разборов · панель id и пул · дизайн <b>mid</b>',
};
