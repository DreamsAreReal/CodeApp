/**
 * Lesson: Managed threading — basics (CS.S8.managed-threading-basics) — expert density, 5 animated
 * deep-dives. Managed threading is the CLR's abstraction over the operating-system thread: a Thread
 * is the basic unit the OS schedules, all threads of a process share its virtual address space (so
 * shared mutable state races), and the runtime hands you a Thread class plus a managed thread pool
 * and a family of synchronization primitives to keep shared state uncorrupted. It also gives you the
 * hazards you must design against: deadlocks and race conditions.
 *
 * SIGNATURE machine panel (s5): a dedicated `new Thread` is a FOREGROUND, NON-pool thread, while a
 * `ThreadPool.QueueUserWorkItem` callback runs on a BACKGROUND pool thread — REAL run-csharp
 * measurement (this file's exec cards): dedicated_pool=False poolthread_pool=True.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (managed-threading-basics,
 *     threads-and-threading, managed-threading-best-practices, foreground-and-background-threads,
 *     the-managed-thread-pool), fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (threads are JOINED
 *     before printing so output never depends on interleaving):
 *     c1 "result=42 background=False" · c2 "dedicated_pool=False poolthread_pool=True" · c3 "total=8000".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.managed-threading-basics/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the CLR abstraction — a managed Thread over the OS thread.
const Z_CLR: Zone = { id: "clr", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "MANAGED THREADING", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Thread · пул · примитивы", subCls: "vz-zsub good", subY: 47 };
const Z_OS: Zone = { id: "os", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОС", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "единица планирования", subCls: "vz-zsub heap", subY: 47 };
const CLR_ZONES: Zone[] = [Z_CLR, Z_OS];

// s2: one process, shared virtual address space — many threads.
const Z_PROC: Zone = { id: "proc", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ПРОЦЕСС · общее виртуальное адресное пространство", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "все потоки процесса делят память", subCls: "vz-zsub", subY: 40 };
const PROC_ZONES: Zone[] = [Z_PROC];

// s3: race condition on a shared field — outcome depends on order.
const Z_SHARED: Zone = { id: "shared", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОБЩЕЕ ПОЛЕ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "objCt++ · не атомарно", subCls: "vz-zsub heap", subY: 47 };
const Z_RACE: Zone = { id: "race", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ГОНКА", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "результат зависит от порядка", subCls: "vz-zsub", subY: 47 };
const RACE_ZONES: Zone[] = [Z_SHARED, Z_RACE];

// s4: synchronization keeps shared state uncorrupted — lock-guarded sum.
const Z_UNSYNC: Zone = { id: "unsync", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЕЗ СИНХРОНИЗАЦИИ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "corrupted / потерянные", subCls: "vz-zsub", subY: 47 };
const Z_SYNC: Zone = { id: "sync", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "lock", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "total = 8000 детерминирован", subCls: "vz-zsub good", subY: 47 };
const SYNC_ZONES: Zone[] = [Z_UNSYNC, Z_SYNC];

// s5 (SIGNATURE): dedicated Thread (foreground, non-pool) vs ThreadPool thread (background, pool).
const Z_DED: Zone = { id: "ded", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "new Thread(...)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "foreground · не пул", subCls: "vz-zsub", subY: 47 };
const Z_POOL: Zone = { id: "pool", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ThreadPool", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "background · пул", subCls: "vz-zsub heap", subY: 47 };
const KIND_ZONES: Zone[] = [Z_DED, Z_POOL];

export const managedThreadingBasics: LessonData = {
  id: "CS.S8.managed-threading-basics",
  track: "CS",
  section: "CS.S8",
  module: "S8.1",
  lang: "csharp",
  title: "Managed threading: что даёт CLR",
  kicker: "C# вглубь · S8 · поток как единица планирования",
  home: { subtitle: "Thread над ОС-потоком, общая память, гонки, примитивы", icon: "async", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-basics", kind: "doc", org: "Microsoft Learn", title: "Managed threading basics", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics", date: "2026-07-07" },
    { id: "ms-threads", kind: "doc", org: "Microsoft Learn", title: "Threads and threading", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/threads-and-threading", date: "2022-03-11" },
    { id: "ms-best", kind: "doc", org: "Microsoft Learn", title: "Managed threading best practices", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices", date: "2026-03-13" },
    { id: "ms-fgbg", kind: "doc", org: "Microsoft Learn", title: "Foreground and background threads", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/foreground-and-background-threads", date: "2021-09-15" },
    { id: "ms-pool", kind: "doc", org: "Microsoft Learn", title: "The managed thread pool", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool", date: "2026-03-19" },
  ],

  spec: [
    { text: "«A thread is the basic unit to which an operating system allocates processor time.» Каждый поток имеет приоритет планирования и хранит контекст (регистры CPU + стек) для возобновления.", source: "ms-threads" },
    { text: "«All threads of a process share its virtual address space.» — потому общее изменяемое состояние надо синхронизировать: «To keep the resource in an uncorrupted state and avoid race conditions, you must synchronize the thread access to it».", source: "ms-threads" },
  ],
  edgeCases: [
    { text: "«All threads generated by creating and starting a new Thread object are by default foreground threads» — а поток пула фоновый: «Threads that belong to the managed thread pool … are background threads».", source: "ms-fgbg" },
    { text: "Гонка — баг порядка: «A race condition is a bug that occurs when the outcome of a program depends on which of two or more threads reaches a particular block of code first».", source: "ms-best" },
    { text: "Дедлок — взаимная блокировка: «A deadlock occurs when each of two threads tries to lock a resource the other has already locked. Neither thread can make any further progress».", source: "ms-best" },
  ],

  misconceptions: [
    {
      wrong: "поток — это «магия параллелизма» от CLR, а общее состояние само собой безопасно",
      hook: 'Нет: поток — это <span class="hl">единица планирования ОС</span>, которую CLR лишь оборачивает. «<b>A thread is the basic unit to which an operating system allocates processor time</b>». И вот ловушка: «<b>All threads of a process share its virtual address space</b>» — общая память общая для всех, поэтому «<span class="hl">To keep the resource in an uncorrupted state and avoid race conditions, you must synchronize the thread access to it</span>». CLR даёт три вещи: класс <code>Thread</code>, управляемый пул (<code>ThreadPool</code>) и семейство примитивов синхронизации — и два новых риска: «<b>deadlocks and race conditions</b>». Дальше <b>пять разборов</b>: абстракция над ОС, общее адресное пространство, гонка на поле, синхронизация до детерминизма, и <b>машинная панель</b> — dedicated Thread (foreground, не пул) vs ThreadPool-поток (background, пул) реальным прогоном.',
      source: ["ms-threads", "ms-best"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Абстракция · над ОС", title: "Managed thread — обёртка CLR над ОС-потоком",
      viewBox: "0 0 340 210", zones: CLR_ZONES,
      code: ["using System.Threading;", "var t = new Thread(() => { /* работа */ });  // managed Thread", "t.Start();  // CLR отдаёт его планировщику ОС"],
      scenes: [
        { codeLine: 1, out: "", caption: 'CLR даёт класс <code>Thread</code> — <b>managed</b>-обёртку. Под ним — настоящая единица планирования <span class="hl">операционной системы</span>.', nodes: [{ id: "th", kind: "obj", at: { zone: "clr", row: 0 }, typeTag: "Thread", value: "managed", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'При <code>Start()</code> поток отдаётся планировщику ОС: «the basic unit to which an operating system <span class="hl">allocates processor time</span>».', nodes: [{ id: "th", kind: "obj", at: { zone: "clr", row: 0 }, typeTag: "Thread", value: "managed" }, { id: "os", kind: "obj", at: { zone: "os", row: 0 }, typeTag: "OS thread", value: "планируется", accent: true }], edges: [{ id: "e1", from: "th", to: "os", accent: true }] },
        { codeLine: 0, out: "", caption: 'Каждый поток хранит свой <b>контекст</b> — регистры CPU и <span class="hl">стек</span>, чтобы возобновиться с того же места. Первый управляемый поток — primary thread.', nodes: [{ id: "th", kind: "obj", at: { zone: "clr", row: 0 }, typeTag: "Thread", value: "managed" }, { id: "os", kind: "obj", at: { zone: "os", row: 0 }, typeTag: "OS thread", value: "планируется" }, { id: "ctx", kind: "chip", at: { zone: "os", row: 1 }, value: "регистры + стек", accent: true }], edges: [{ id: "e1", from: "th", to: "os" }] },
      ],
      explain: 'Managed threading — это <b>абстракция CLR над потоком ОС</b>, не отдельная сущность. Дословно: «<span class="hl">A thread is the basic unit to which an operating system allocates processor time</span>. Each thread has a scheduling priority and maintains a set of structures the system uses to save the thread context when the thread\'s execution is paused. The thread context includes all the information the thread needs to seamlessly resume execution, including the thread\'s set of CPU registers and stack». По умолчанию «a .NET program is started with a <span class="hl">single thread, often called the primary thread</span>», но может создавать worker-потоки. Класс <code>System.Threading.Thread</code> «represents a managed thread» — тонкая типизированная обёртка над этой ОС-единицей.',
      sources: ["ms-threads"],
    },
    {
      id: "s2", num: "02", kicker: "Общая память · процесс", title: "Все потоки процесса делят виртуальное адресное пространство",
      viewBox: "0 0 340 210", zones: PROC_ZONES,
      code: ["static int shared;                 // поле процесса — видно ВСЕМ потокам", "Thread a = new(() => shared++);    // поток A пишет то же поле", "Thread b = new(() => shared++);    // поток B пишет то же поле"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Процесс изолирует приложения друг от друга, но <b>внутри</b> него память общая: «All threads of a process <span class="hl">share its virtual address space</span>».', nodes: [{ id: "sh", kind: "obj", at: { zone: "proc", row: 0 }, typeTag: "shared", value: "int (общее)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поток A видит и меняет то же поле. «A thread can execute <span class="hl">any part of the program code</span>, including parts currently being executed by another thread».', nodes: [{ id: "sh", kind: "obj", at: { zone: "proc", row: 0 }, typeTag: "shared", value: "int" }, { id: "a", kind: "chip", at: { zone: "proc", row: 1, col: 0 }, value: "Thread A", accent: true }], edges: [{ id: "e1", from: "a", to: "sh", accent: true }] },
        { codeLine: 2, out: "", caption: 'Поток B — тоже. Два потока в одном адресном пространстве пишут <span class="hl">одно поле</span> — вот источник гонок (разбор 03).', nodes: [{ id: "sh", kind: "obj", at: { zone: "proc", row: 0 }, typeTag: "shared", value: "int" }, { id: "a", kind: "chip", at: { zone: "proc", row: 1, col: 0 }, value: "Thread A" }, { id: "b", kind: "chip", at: { zone: "proc", row: 1, col: 1 }, value: "Thread B", accent: true }], edges: [{ id: "e1", from: "a", to: "sh" }, { id: "e2", from: "b", to: "sh", accent: true }] },
      ],
      explain: 'Ключ к пониманию всех threading-багов — общая память. «A process is an executing program. An operating system uses processes to separate the applications that are being executed. … <span class="hl">Multiple threads can run in the context of a process. All threads of a process share its virtual address space</span>. A thread can execute any part of the program code, including parts currently being executed by another thread». Отсюда прямое следствие: «Multiple threads might need to access a shared resource. <span class="hl">To keep the resource in an uncorrupted state and avoid race conditions, you must synchronize the thread access to it</span>». Локальные переменные и стек у каждого потока свои; поля/куча — общие.',
      sources: ["ms-threads"],
    },
    {
      id: "s3", num: "03", kicker: "Гонка · порядок решает", title: "objCt++ на общем поле — read-modify-write не атомарен",
      viewBox: "0 0 340 210", zones: RACE_ZONES,
      code: ["objCt++;   // 3 шага: load -> increment -> store", "// поток может быть вытеснен МЕЖДУ шагами", "// другой поток проходит все 3 -> результат перезаписан"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>objCt++</code> — не одна операция: «loading the value from <code>objCt</code> into a register, <span class="hl">incrementing</span> the value, and storing it in <code>objCt</code>».', nodes: [{ id: "f", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "objCt", value: "load→inc→store", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поток может быть <b>вытеснен</b> после первых двух шагов — «a thread … might be preempted by another thread which performs all three steps».', nodes: [{ id: "f", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "objCt", value: "load→inc" }, { id: "p", kind: "gate", at: { zone: "race", row: 0 }, state: "fail", label: "preempt", detail: "между шагами", accent: true }], edges: [] },
        { codeLine: 2, out: "результат зависит от порядка", caption: 'Первый поток возобновляется и <span class="hl">перезаписывает</span> объект — инкремент второго потерян. Исход зависит от того, чей поток первым дошёл до блока.', nodes: [{ id: "f", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "objCt", value: "перезаписан" }, { id: "p", kind: "gate", at: { zone: "race", row: 0 }, state: "fail", label: "lost update", detail: "инкремент потерян", accent: true }], edges: [] },
      ],
      explain: 'Гонка — самый частый threading-баг: «<span class="hl">A race condition is a bug that occurs when the outcome of a program depends on which of two or more threads reaches a particular block of code first</span>. Running the program many times produces different results, and the result of any given run cannot be predicted». Простейший пример — инкремент поля: «This operation requires loading the value from <code>objCt</code> into a register, incrementing the value, and storing it in <code>objCt</code>». Если поток вытеснен между шагами, «when the first thread resumes execution and stores its value, it <span class="hl">overwrites <code>objCt</code></span> without taking into account the fact that the value has changed in the interim» — lost update. Лечится <code>Interlocked.Increment</code> или <code>lock</code> (разбор 04).',
      sources: ["ms-best"],
    },
    {
      id: "s4", num: "04", kicker: "Синхронизация · детерминизм", title: "lock делает сумму 8 потоков детерминированной: 8000",
      viewBox: "0 0 340 210", zones: SYNC_ZONES,
      code: ["long total = 0; object gate = new object();", "// 8 потоков, каждый: for (j<1000) lock(gate) total += 1;", "foreach(t) t.Start(); foreach(t) t.Join();  // ждём всех", "Console.WriteLine(total);   // 8 * 1000"],
      predictAt: 2, predictQ: '8 потоков, каждый под <code>lock</code> делает <code>total += 1</code> 1000 раз; после <code>Join</code> всех — что напечатает <code>total</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Без синхронизации <code>total += 1</code> из 8 потоков теряет инкременты — сумма меньше 8000 и <b>непредсказуема</b>.', nodes: [{ id: "u", kind: "gate", at: { zone: "unsync", row: 0 }, state: "fail", label: "total += 1", detail: "lost updates", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>lock (gate)</code> делает инкремент <span class="hl">критической секцией</span>: только один поток в теле в любой момент.', nodes: [{ id: "u", kind: "gate", at: { zone: "unsync", row: 0 }, state: "fail", label: "без lock", detail: "corrupted" }, { id: "s", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "lock (gate)", detail: "1 поток в теле", accent: true }], edges: [] },
        { codeLine: 3, out: "8000", caption: 'Все потоки <code>Join</code>-нуты до печати → результат <b>детерминирован</b>: <span class="hl">8000</span> = 8 × 1000 (реальный прогон).', nodes: [{ id: "s", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "lock (gate)", detail: "критическая секция" }, { id: "r", kind: "gate", at: { zone: "sync", row: 1 }, state: "ok", label: "total", detail: "8000", accent: true }], edges: [] },
      ],
      explain: 'Синхронизация превращает «непредсказуемо» в «детерминированно». «To keep the resource in an uncorrupted state and avoid race conditions, you must <span class="hl">synchronize the thread access to it</span>». <code>lock</code> — общий инструмент: пока поток держит блокировку, остальные ждут; тело исполняется по одному. Реальный прогон: 8 потоков × 1000 инкрементов под <code>lock</code>, все <code>Join</code>-нуты до печати → ровно <b>8000</b> каждый раз. Именно джойн-до-печати даёт детерминизм: мы не читаем состояние, пока все потоки не завершились. Для простого инкремента дешевле <code>Interlocked.Increment</code> — «the <code>Interlocked</code> class provides better performance for updates that must be atomic» (раздел про Interlocked дальше в S8).',
      sources: ["ms-threads", "ms-best"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · род потока", title: "new Thread — foreground, не пул; ThreadPool — background, пул",
      viewBox: "0 0 340 210", zones: KIND_ZONES,
      code: ["var t = new Thread(() => a = Thread.CurrentThread.IsThreadPoolThread);", "ThreadPool.QueueUserWorkItem(_ => b = Thread.CurrentThread.IsThreadPoolThread);", "// a = ? (dedicated)   b = ? (pool)"],
      predictAt: 2, predictQ: 'Внутри <code>new Thread</code> и внутри <code>ThreadPool.QueueUserWorkItem</code> читаем <code>IsThreadPoolThread</code>. Что за пара (dedicated, pool)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>new Thread(...)</code> — <b>выделенный</b> поток: «All threads generated by creating and starting a new <code>Thread</code> object are by default <span class="hl">foreground threads</span>».', nodes: [{ id: "d", kind: "obj", at: { zone: "ded", row: 0 }, typeTag: "new Thread", value: "foreground", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поток пула — <b>фоновый</b>: «Threads that belong to the managed thread pool … are <span class="hl">background threads</span>». Пул переиспользует потоки.', nodes: [{ id: "d", kind: "obj", at: { zone: "ded", row: 0 }, typeTag: "new Thread", value: "foreground" }, { id: "p", kind: "obj", at: { zone: "pool", row: 0 }, typeTag: "ThreadPool", value: "background", accent: true }], edges: [] },
        { codeLine: 2, out: "dedicated_pool=False poolthread_pool=True", caption: 'Панель: <b>dedicated=False, pool=True</b> (реальная рефлексия рантайма). Выделенный поток <span class="hl">не из пула</span>; callback пула — из пула. Foreground держит процесс живым, background — нет.', nodes: [{ id: "d", kind: "gate", at: { zone: "ded", row: 0 }, state: "ok", label: "IsThreadPoolThread", detail: "False", accent: true }, { id: "p", kind: "gate", at: { zone: "pool", row: 0 }, state: "fail", label: "IsThreadPoolThread", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — реально снятый род потока. Прогон: внутри <code>new Thread</code> → <code>IsThreadPoolThread == False</code>, внутри <code>ThreadPool.QueueUserWorkItem</code> → <code>True</code> (печать <b>dedicated_pool=False poolthread_pool=True</b>). Смысл: «<span class="hl">Threads that belong to the managed thread pool</span> … <span class="hl">are background threads</span>. … All threads generated by creating and starting a new <code>Thread</code> object are by default foreground threads». Разница foreground/background практична: «<span class="hl">a background thread does not keep the managed execution environment running</span>. Once all foreground threads have been stopped in a managed process … the system stops all background threads and shuts down». Про пул: «Thread pool threads are <span class="hl">background threads</span>» и «There is only one thread pool per process» — потому пул удобен для коротких задач, но не для того, что должно держать процесс живым.',
      sources: ["ms-fgbg", "ms-pool"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int result = 0; var t = new Thread(() => { result = 40 + 2; }); bool bg = t.IsBackground; t.Start(); t.Join(); Console.WriteLine($"result={result} background={bg}");</code> — что напечатает?',
      options: ["result=42 background=False", "result=42 background=True", "result=0 background=False", "result=0 background=True"], correctIndex: 0, xp: 10,
      okText: 'После <code>Join</code> рабочий поток завершён — <code>result=42</code> виден в общей памяти. А <code>new Thread</code> по умолчанию <b>foreground</b> (<code>IsBackground == False</code>): «All threads generated by … a new <code>Thread</code> object are by default foreground threads».',
      noText: 'Общее поле <code>result</code> записано рабочим потоком и после <code>Join</code> видно главному; <code>new Thread</code> — foreground. Реальный вывод: <b>result=42 background=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "result=42 background=False" }, sourceRefs: ["ms-fgbg", "ms-threads"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool a=false, b=false; var t=new Thread(()=>{ a = Thread.CurrentThread.IsThreadPoolThread; }); t.Start(); t.Join(); var done=new ManualResetEventSlim(false); ThreadPool.QueueUserWorkItem(_=>{ b = Thread.CurrentThread.IsThreadPoolThread; done.Set(); }); done.Wait(); Console.WriteLine($"dedicated_pool={a} poolthread_pool={b}");</code> — что напечатает?',
      options: ["dedicated_pool=False poolthread_pool=True", "dedicated_pool=True poolthread_pool=True", "dedicated_pool=False poolthread_pool=False", "dedicated_pool=True poolthread_pool=False"], correctIndex: 0, xp: 10,
      okText: 'Выделенный <code>new Thread</code> — <span class="hl">не из пула</span> (False); callback <code>ThreadPool.QueueUserWorkItem</code> бежит на пуловом (True). «Threads that belong to the managed thread pool … are background threads».',
      noText: '<code>new Thread</code> создаёт собственный поток вне пула; <code>ThreadPool</code> отдаёт пуловый. Реальный вывод: <b>dedicated_pool=False poolthread_pool=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "dedicated_pool=False poolthread_pool=True" }, sourceRefs: ["ms-fgbg", "ms-pool"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>long total = 0; object gate = new object(); var ts = new Thread[8]; for (int i = 0; i &lt; 8; i++) ts[i] = new Thread(() => { for (int j = 0; j &lt; 1000; j++) lock (gate) total += 1; }); foreach (var t in ts) t.Start(); foreach (var t in ts) t.Join(); Console.WriteLine($"total={total}");</code> — что напечатает?',
      options: ["total=8000", "total=1000", "total=8", "total (меньше 8000, непредсказуемо)"], correctIndex: 0, xp: 10,
      okText: 'Каждый инкремент под <code>lock (gate)</code> — критическая секция, потерянных обновлений нет; все потоки <code>Join</code>-нуты до печати → детерминированные <b>8 × 1000 = 8000</b>.',
      noText: 'Без <code>lock</code> сумма была бы меньше 8000 и непредсказуема; с <code>lock</code> и <code>Join</code> — ровно <b>8000</b> каждый раз. «you must synchronize the thread access to it».',
      verify: { kind: "exec", run: "dotnet run", expect: "total=8000" }, sourceRefs: ["ms-threads", "ms-best"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что даёт CLR", v: 'Managed threading = обёртка над <span class="hl">ОС-потоком</span> («the basic unit to which an operating system allocates processor time») + класс <code>Thread</code>, управляемый пул и примитивы синхронизации.' },
    { icon: "cost", k: "Общая память", v: '«All threads of a process <span class="hl">share its virtual address space</span>» — поля/куча общие. Отсюда гонки: <code>objCt++</code> = load→inc→store, вытеснение между шагами теряет обновление.' },
    { icon: "avoid", k: "Синхр. + род потока", v: 'Синхронизация даёт детерминизм (lock → <code>total=8000</code>). <code>new Thread</code> — foreground, не пул (dedicated_pool=False); <code>ThreadPool</code> — background, пул (True). Риски CLR: <b>deadlocks и race conditions</b>.' },
  ],

  foot: 'урок · <b>managed threading: основы</b> · 5 анимир. разборов · панель dedicated vs pool · дизайн <b>mid</b>',
};
