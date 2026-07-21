/**
 * Lesson: Threading objects — Mutex / Semaphore(Slim) / EventWaitHandle (CS.S8.threading-objects) —
 * expert density, 5 animated deep-dives. Three concrete WaitHandle-family objects and their exact
 * contracts: a Mutex grants exclusive access and has THREAD AFFINITY (only the owner releases it) and
 * can be named for inter-process use; a Semaphore/SemaphoreSlim caps concurrency at N and has NO
 * thread affinity (one thread acquires, another may release); an EventWaitHandle signals threads and,
 * by its reset mode, releases one (AutoReset) or all (ManualReset) waiters.
 *
 * SIGNATURE machine panel (s5): a Mutex has thread affinity — a thread that does NOT own it throws
 * ApplicationException on ReleaseMutex, while the owner releases fine — REAL run-csharp measurement
 * (this file's exec cards): nonOwnerThrew=True.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (Mutexes, Semaphore and
 *     SemaphoreSlim, EventWaitHandle, Overview of synchronization primitives), fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (Join / Countdown /
 *     bounded before print): c1 "nonOwnerThrew=True" · c2 "c1=0 prev=0 c2=1" · c3 "passed=4 signaled=True".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.threading-objects/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: three objects map.
const Z_OBJMAP: Zone = { id: "objmap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ТРИ ОБЪЕКТА · их контракты", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "Mutex · Semaphore(Slim) · EventWaitHandle", subCls: "vz-zsub", subY: 40 };
const OBJMAP_ZONES: Zone[] = [Z_OBJMAP];

// s2: Mutex — exclusive + thread affinity + named.
const Z_MTX: Zone = { id: "mtx", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Mutex", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "эксклюзив · thread affinity", subCls: "vz-zsub good", subY: 47 };
const Z_NAMED: Zone = { id: "named", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "named Mutex", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "между процессами", subCls: "vz-zsub heap", subY: 47 };
const MTX_ZONES: Zone[] = [Z_MTX, Z_NAMED];

// s3: Semaphore — count N, no affinity.
const Z_SEM: Zone = { id: "sem", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Semaphore(Slim) · счётчик доступа", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "не более N разом · без thread affinity", subCls: "vz-zsub good", subY: 40 };
const SEM_ZONES: Zone[] = [Z_SEM];

// s4: EventWaitHandle — AutoReset vs ManualReset.
const Z_EAUTO: Zone = { id: "eauto", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AutoReset", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "1 waiter / Set", subCls: "vz-zsub good", subY: 47 };
const Z_EMANUAL: Zone = { id: "emanual", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ManualReset", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "все waiters / Set до Reset", subCls: "vz-zsub", subY: 47 };
const EVENT_ZONES: Zone[] = [Z_EAUTO, Z_EMANUAL];

// s5 (SIGNATURE): Mutex thread affinity.
const Z_OWNER: Zone = { id: "owner", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ВЛАДЕЛЕЦ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "взял → может release", subCls: "vz-zsub good", subY: 47 };
const Z_NONOWNER: Zone = { id: "nonowner", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДРУГОЙ ПОТОК", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "release → бросает", subCls: "vz-zsub heap", subY: 47 };
const AFFINITY_ZONES: Zone[] = [Z_OWNER, Z_NONOWNER];

export const threadingObjects: LessonData = {
  id: "CS.S8.threading-objects",
  track: "CS",
  section: "CS.S8",
  module: "S8.5",
  lang: "csharp",
  title: "Mutex / Semaphore(Slim) / EventWaitHandle",
  kicker: "C# вглубь · S8 · три WaitHandle-объекта",
  home: { subtitle: "Mutex (affinity), Semaphore (N), EventWaitHandle (сигнал)", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.sync-primitives-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-mutex", kind: "doc", org: "Microsoft Learn", title: "Mutexes", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/mutexes", date: "2022-03-11" },
    { id: "ms-sem", kind: "doc", org: "Microsoft Learn", title: "Semaphore and SemaphoreSlim", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/semaphore-and-semaphoreslim", date: "2026-03-16" },
    { id: "ms-ewh", kind: "doc", org: "Microsoft Learn", title: "EventWaitHandle", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/eventwaithandle", date: "2021-09-15" },
    { id: "ms-sync", kind: "doc", org: "Microsoft Learn", title: "Overview of synchronization primitives", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives", date: "2022-09-01" },
  ],

  spec: [
    { text: "Mutex — эксклюзив с thread affinity: «Mutexes have thread affinity; that is, the mutex can be released only by the thread that owns it. If a thread releases a mutex it does not own, an ApplicationException is thrown in the thread».", source: "ms-mutex" },
    { text: "Semaphore — счётчик без affinity: «Because the semaphore doesn't have thread affinity, a thread can acquire the semaphore and another one can release it». Ограничивает число потоков, входящих одновременно.", source: "ms-sync" },
  ],
  edgeCases: [
    { text: "Брошенный мьютекс: «If a thread terminates without releasing a Mutex… the mutex is said to be abandoned… An AbandonedMutexException is thrown in the next thread that acquires the mutex».", source: "ms-mutex" },
    { text: "Пере-release семафора: «Ensure that a thread doesn't release the semaphore too many times» — иначе «a SemaphoreFullException is thrown».", source: "ms-sem" },
    { text: "EventWaitHandle — не .NET-события: «Event wait handles are not .NET events… There are no delegates or event handlers involved». AutoReset освобождает одного, ManualReset — всех до Reset.", source: "ms-ewh" },
  ],

  misconceptions: [
    {
      wrong: "Mutex, Semaphore и Event — примерно одно и то же, «замок с флажком»",
      hook: 'У каждого <b>свой жёсткий контракт</b>. <code>Mutex</code>: эксклюзивный доступ с <span class="hl">thread affinity</span> — «the mutex can be released <b>only by the thread that owns it</b>. If a thread releases a mutex it does not own, an ApplicationException is thrown». <code>Semaphore</code>: счётчик на N, и <span class="hl">без</span> affinity — «a thread can acquire the semaphore and another one can release it». <code>EventWaitHandle</code>: сигнал, и это <b>не</b> .NET-события — «Event wait handles are <span class="hl">not .NET events</span>… There are no delegates or event handlers involved»; AutoReset пускает одного, ManualReset — всех. Дальше <b>пять разборов</b>: карта трёх контрактов, Mutex (affinity + named), Semaphore (N, без affinity), EventWaitHandle (Auto vs Manual), и <b>машинная панель</b> — thread affinity Mutex реальным прогоном.',
      source: ["ms-mutex", "ms-sync", "ms-ewh"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три контракта", title: "Mutex (affinity) · Semaphore (N) · Event (сигнал)",
      viewBox: "0 0 340 210", zones: OBJMAP_ZONES,
      code: ["Mutex        — эксклюзив, thread affinity, можно named", "Semaphore    — не более N разом, БЕЗ affinity", "EventWaitHandle — сигнал: AutoReset(1) / ManualReset(все)"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Mutex</code> — эксклюзивный доступ: «provide exclusive access to a resource». Ключевая черта — <span class="hl">thread affinity</span> (разбор 05).', nodes: [{ id: "m", kind: "gate", at: { zone: "objmap", row: 0 }, state: "ok", label: "Mutex", detail: "эксклюзив · affinity", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Semaphore</code> — «<span class="hl">limit the number of threads</span> that can access a shared resource… concurrently»: пускает N, а не одного.', nodes: [{ id: "m", kind: "gate", at: { zone: "objmap", row: 0 }, state: "ok", label: "Mutex", detail: "эксклюзив" }, { id: "s", kind: "gate", at: { zone: "objmap", row: 1, col: 0 }, state: "ok", label: "Semaphore", detail: "не более N", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>EventWaitHandle</code> — <b>сигналинг</b>: «allows threads to <span class="hl">communicate with each other by signaling</span> and by waiting for signals».', nodes: [{ id: "m", kind: "gate", at: { zone: "objmap", row: 0 }, state: "ok", label: "Mutex", detail: "эксклюзив" }, { id: "s", kind: "gate", at: { zone: "objmap", row: 1, col: 0 }, state: "ok", label: "Semaphore", detail: "N" }, { id: "e", kind: "gate", at: { zone: "objmap", row: 1, col: 1 }, state: "ok", label: "EventWaitHandle", detail: "сигнал", accent: true }], edges: [] },
      ],
      explain: 'Три WaitHandle-объекта — три разных контракта, не синонимы. <code>Mutex</code>: «You can use a <code>Mutex</code> object to <span class="hl">provide exclusive access to a resource</span>» — по одному потоку, с thread affinity. <code>Semaphore</code>/<code>SemaphoreSlim</code>: «<span class="hl">limit the number of threads that can access a shared resource or a pool of resources concurrently</span>» — до N. <code>EventWaitHandle</code>: «The <code>EventWaitHandle</code> class allows threads to communicate with each other by signaling and by waiting for signals» — координация, а не защита данных. Выбор: нужен «один за раз» и, возможно, между процессами → Mutex; «не более N» → Semaphore; «дождись сигнала» → EventWaitHandle.',
      sources: ["ms-mutex", "ms-sync", "ms-ewh"],
    },
    {
      id: "s2", num: "02", kicker: "Mutex · affinity + named", title: "Владелец освобождает; named — между процессами",
      viewBox: "0 0 340 210", zones: MTX_ZONES,
      code: ["mutex.WaitOne();   // запрос владения (блокирует, пока занят)", "// ... работа под эксклюзивным доступом ...", "mutex.ReleaseMutex();   // ТОЛЬКО владелец", "new Mutex(false, \"Global\\\\MyApp\");  // named -> межпроцессно"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Поток берёт владение через <code>WaitOne</code>: «A thread calls the <code>WaitOne</code> method of a mutex to <span class="hl">request ownership</span>. The call blocks until the mutex is available».', nodes: [{ id: "w", kind: "gate", at: { zone: "mtx", row: 0 }, state: "ok", label: "WaitOne()", detail: "владение", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Освобождает <span class="hl">только владелец</span>: «the mutex can be released only by the thread that owns it». Чужой release → ApplicationException.', nodes: [{ id: "w", kind: "gate", at: { zone: "mtx", row: 0 }, state: "ok", label: "WaitOne", detail: "владеет" }, { id: "r", kind: "gate", at: { zone: "mtx", row: 1 }, state: "ok", label: "ReleaseMutex", detail: "только владелец", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Named</b> Mutex виден всей ОС: «Named system mutexes are <span class="hl">visible throughout the operating system and can be used to synchronize the activities of processes</span>».', nodes: [{ id: "r", kind: "gate", at: { zone: "mtx", row: 0 }, state: "ok", label: "local Mutex", detail: "в процессе" }, { id: "n", kind: "gate", at: { zone: "named", row: 0 }, state: "ok", label: "named Mutex", detail: "между процессами", accent: true }], edges: [] },
      ],
      explain: 'Использование: «A thread calls the <code>WaitOne</code> method of a mutex to request ownership. The call blocks until the mutex is available, or until the optional timeout interval elapses». Освобождение с affinity: «A thread releases a mutex by calling its <code>ReleaseMutex</code> method. <span class="hl">Mutexes have thread affinity; that is, the mutex can be released only by the thread that owns it. If a thread releases a mutex it does not own, an ApplicationException is thrown in the thread</span>». Реентерабельность: «that thread can specify the same <code>Mutex</code> in repeated wait-request calls without blocking… however, it must release the <code>Mutex</code> as many times to release ownership». Named — межпроцессный: «If you create a <code>Mutex</code> object using a constructor that accepts a name, it is associated with an operating-system object of that name. <span class="hl">Named system mutexes are visible throughout the operating system and can be used to synchronize the activities of processes</span>». Опасность: брошенный мьютекс → <code>AbandonedMutexException</code> в следующем владельце.',
      sources: ["ms-mutex"],
    },
    {
      id: "s3", num: "03", kicker: "Semaphore · N, без affinity", title: "Считает вход/выход; любой поток может Release",
      viewBox: "0 0 340 210", zones: SEM_ZONES,
      code: ["var s = new SemaphoreSlim(0, 3);   // initial=0, max=3", "s.Release();   // возвращает ПРЕДЫДУЩИЙ count, инкремент", "// вход: Wait() -> count--; выход: Release() -> count++", "// поток A может Wait, поток B может Release (нет affinity)"],
      predictAt: 1, predictQ: '<code>new SemaphoreSlim(0, 3)</code>; затем <code>CurrentCount</code>, потом <code>Release()</code> (что вернёт?), потом снова <code>CurrentCount</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Семафор считает: вход декрементирует счётчик, выход инкрементирует. «When the call returns, the count on the semaphore is <span class="hl">decremented</span>».', nodes: [{ id: "c", kind: "gate", at: { zone: "sem", row: 0 }, state: "ok", label: "CurrentCount = 0", detail: "нет свободных мест", accent: true }], edges: [] },
        { codeLine: 1, out: "c1=0 prev=0 c2=1", caption: '<code>Release()</code> возвращает <b>прежний</b> count (0) и увеличивает до 1. «As threads release the semaphore… <span class="hl">blocked threads can enter</span>».', nodes: [{ id: "c", kind: "gate", at: { zone: "sem", row: 0 }, state: "" , label: "было 0" }, { id: "r", kind: "gate", at: { zone: "sem", row: 1 }, state: "ok", label: "Release() → 0, стало 1", detail: "prev=0 c2=1", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Нет thread affinity: «a thread can <span class="hl">acquire the semaphore and another one can release it</span>» — классический producer/consumer.', nodes: [{ id: "a", kind: "gate", at: { zone: "sem", row: 0 }, state: "ok", label: "поток A: Wait", detail: "count--" }, { id: "b", kind: "gate", at: { zone: "sem", row: 1 }, state: "ok", label: "поток B: Release", detail: "count++", accent: true }], edges: [] },
      ],
      explain: 'Семафор — «умный счётчик». Вход: «Threads enter the semaphore by calling… the <code>WaitOne</code> method… For a <code>SemaphoreSlim</code> object, call the <code>SemaphoreSlim.Wait</code> or <code>SemaphoreSlim.WaitAsync</code> method. <span class="hl">When the call returns, the count on the semaphore is decremented. When a thread requests entry and the count is zero, the thread blocks</span>». Отсутствие affinity — фича: «<span class="hl">Because the semaphore doesn\'t have thread affinity, a thread can acquire the semaphore and another one can release it</span>» — «<span class="hl">a common usage scenario for semaphores involves a producer thread and a consumer thread</span>». Реальный прогон: у <code>SemaphoreSlim(0,3)</code> сначала <code>CurrentCount==0</code>, <code>Release()</code> возвращает <b>0</b> (прежний счётчик) и делает count <b>1</b> (печать <b>c1=0 prev=0 c2=1</b>). Ловушка симметрии: «Ensure that a thread doesn\'t release the semaphore too many times» — иначе <code>SemaphoreFullException</code>.',
      sources: ["ms-sem", "ms-sync"],
    },
    {
      id: "s4", num: "04", kicker: "EventWaitHandle · reset", title: "AutoReset пускает одного; ManualReset — всех до Reset",
      viewBox: "0 0 340 210", zones: EVENT_ZONES,
      code: ["new EventWaitHandle(false, EventResetMode.AutoReset);   // 1 waiter / Set", "new EventWaitHandle(false, EventResetMode.ManualReset); // все до Reset", "// ManualResetEventSlim mre; mre.Set() -> 4 ждущих проходят"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>AutoReset</b>: «resets automatically when signaled, after <span class="hl">releasing a single waiting thread</span>». Один <code>Set</code> → один поток.', nodes: [{ id: "a", kind: "gate", at: { zone: "eauto", row: 0 }, state: "ok", label: "Set()", detail: "→ 1 waiter", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>ManualReset</b> — «gate of a corral»: «When the event is signaled… <span class="hl">all waiting threads are free to proceed</span>. The event remains signaled until its <code>Reset</code> method is called».', nodes: [{ id: "a", kind: "gate", at: { zone: "eauto", row: 0 }, state: "ok", label: "AutoReset", detail: "1 waiter" }, { id: "m", kind: "gate", at: { zone: "emanual", row: 0 }, state: "ok", label: "ManualReset", detail: "все waiters", accent: true }], edges: [] },
        { codeLine: 2, out: "passed=4 signaled=True", caption: 'Реальный прогон: 4 потока ждут <code>ManualResetEventSlim</code>; один <code>Set()</code> открывает ворота — <span class="hl">проходят все 4</span> (passed=4, IsSet=True).', nodes: [{ id: "m", kind: "gate", at: { zone: "emanual", row: 0 }, state: "ok", label: "Set()", detail: "открыл" }, { id: "p", kind: "gate", at: { zone: "emanual", row: 1 }, state: "ok", label: "4 waiters", detail: "passed=4", accent: true }], edges: [] },
      ],
      explain: 'Событие-сигнал с двумя режимами. AutoReset: «this synchronization event <span class="hl">resets automatically when signaled, after releasing a single waiting thread</span>. Signal the event by calling its <code>Set</code> method» — «Automatic reset events are usually used to provide exclusive access to a resource for a single thread at a time». ManualReset: «A manual reset event acts like the <span class="hl">gate of a corral</span>. When the event is not signaled, threads that wait on it block, like horses in a corral. When the event is signaled, by calling its <code>Set</code> method, <span class="hl">all waiting threads are free to proceed</span>. The event remains signaled until its <code>Reset</code> method is called». Реальный прогон подтверждает ворота: один <code>Set</code> у <code>ManualResetEventSlim</code> пропускает все 4 ждущих (passed=4). И важно: «Event wait handles are <b>not .NET events</b>… There are no delegates or event handlers involved».',
      sources: ["ms-ewh"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · affinity", title: "Mutex: release не-владельцем бросает ApplicationException",
      viewBox: "0 0 340 210", zones: AFFINITY_ZONES,
      code: ["var mtx = new Mutex(); mtx.WaitOne();   // владеет главный поток", "new Thread(() => { try { mtx.ReleaseMutex(); } catch(ApplicationException){ ... } });", "mtx.ReleaseMutex();   // владелец — ОК"],
      predictAt: 2, predictQ: 'Главный поток владеет <code>Mutex</code>; другой поток зовёт <code>ReleaseMutex()</code>. Бросит ли это исключение (<code>nonOwnerThrew</code>)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Главный поток берёт владение через <code>WaitOne</code> — теперь он <b>владелец</b> мьютекса.', nodes: [{ id: "o", kind: "gate", at: { zone: "owner", row: 0 }, state: "ok", label: "владелец", detail: "WaitOne()", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Другой поток пытается <code>ReleaseMutex()</code> — он <span class="hl">не владелец</span>: «the mutex can be released only by the thread that owns it».', nodes: [{ id: "o", kind: "gate", at: { zone: "owner", row: 0 }, state: "ok", label: "владелец", detail: "WaitOne" }, { id: "n", kind: "gate", at: { zone: "nonowner", row: 0 }, state: "fail", label: "другой поток", detail: "ReleaseMutex()", accent: true }], edges: [] },
        { codeLine: 2, out: "nonOwnerThrew=True", caption: 'Панель: <b>nonOwnerThrew=True</b> (реальный прогон) — чужой release бросил <code>ApplicationException</code>, а владелец освободил нормально. Вот <span class="hl">thread affinity</span> в железе.', nodes: [{ id: "o", kind: "gate", at: { zone: "owner", row: 0 }, state: "ok", label: "владелец release", detail: "OK" }, { id: "n", kind: "gate", at: { zone: "nonowner", row: 0 }, state: "fail", label: "чужой release", detail: "throws · True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — thread affinity <code>Mutex</code> в действии. Прогон: главный поток владеет мьютексом; попытка <code>ReleaseMutex()</code> из <b>другого</b> потока бросает <code>ApplicationException</code> (ловим → <code>nonOwnerThrew=True</code>), а владелец освобождает без ошибки. Это ровно контракт: «<span class="hl">Mutexes have thread affinity; that is, the mutex can be released only by the thread that owns it. If a thread releases a mutex it does not own, an ApplicationException is thrown in the thread</span>». Практическое следствие — <code>Mutex</code> нельзя «отпустить с другого потока», в отличие от <code>Semaphore</code> («a thread can acquire the semaphore and another one can release it»). Именно affinity делает <code>Mutex</code> и Monitor непригодными там, где владение переходит между потоками, — там берут семафор.',
      sources: ["ms-mutex"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var mtx = new Mutex(); mtx.WaitOne(); bool nonOwnerThrew = false; var t = new Thread(() => { try { mtx.ReleaseMutex(); } catch (ApplicationException) { nonOwnerThrew = true; } }); t.Start(); t.Join(); mtx.ReleaseMutex(); Console.WriteLine($"nonOwnerThrew={nonOwnerThrew}");</code> — что напечатает?',
      options: ["nonOwnerThrew=True", "nonOwnerThrew=False", "(AbandonedMutexException)", "(SemaphoreFullException)"], correctIndex: 0, xp: 10,
      okText: '<code>Mutex</code> имеет <b>thread affinity</b>: «the mutex can be released only by the thread that owns it. If a thread releases a mutex it does not own, an ApplicationException is thrown» → чужой release бросил, <b>nonOwnerThrew=True</b>.',
      noText: 'Владеет главный поток; release из другого потока бросает <code>ApplicationException</code> (thread affinity). Реальный вывод: <b>nonOwnerThrew=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "nonOwnerThrew=True" }, sourceRefs: ["ms-mutex"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var s = new SemaphoreSlim(0, 3); s.Wait(0); int c1 = s.CurrentCount; int prev = s.Release(); int c2 = s.CurrentCount; Console.WriteLine($"c1={c1} prev={prev} c2={c2}");</code> — что напечатает?',
      options: ["c1=0 prev=0 c2=1", "c1=0 prev=1 c2=1", "c1=1 prev=0 c2=0", "c1=0 prev=0 c2=0"], correctIndex: 0, xp: 10,
      okText: '<code>SemaphoreSlim(0,3)</code> стартует с count 0 (<code>Wait(0)</code> не входит — мест нет); <code>Release()</code> возвращает <b>прежний</b> count (0) и увеличивает до 1. Итог <b>c1=0 prev=0 c2=1</b>.',
      noText: '<code>Release</code> возвращает count ДО инкремента (0), а <code>CurrentCount</code> после — 1. Реальный вывод: <b>c1=0 prev=0 c2=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "c1=0 prev=0 c2=1" }, sourceRefs: ["ms-sem"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var mre = new ManualResetEventSlim(false); int passed = 0; var done = new CountdownEvent(4); for(int i=0;i&lt;4;i++){ var t = new Thread(()=>{ mre.Wait(); Interlocked.Increment(ref passed); done.Signal(); }); t.Start(); } Thread.Sleep(50); mre.Set(); done.Wait(); Console.WriteLine($"passed={passed} signaled={mre.IsSet}");</code> — что напечатает?',
      options: ["passed=4 signaled=True", "passed=1 signaled=True", "passed=4 signaled=False", "passed=0 signaled=True"], correctIndex: 0, xp: 10,
      okText: '<code>ManualReset</code> — «gate of a corral»: один <code>Set()</code> открывает ворота, «all waiting threads are free to proceed» → проходят все <b>4</b>; остаётся signaled до Reset (<b>IsSet=True</b>).',
      noText: 'ManualReset пропускает всех ждущих одним Set и остаётся открытым. Реальный вывод: <b>passed=4 signaled=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "passed=4 signaled=True" }, sourceRefs: ["ms-ewh"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Mutex", v: '«provide exclusive access» + <span class="hl">thread affinity</span>: «the mutex can be released only by the thread that owns it… an ApplicationException is thrown» (nonOwnerThrew=True). Named → межпроцессно. Брошенный → <code>AbandonedMutexException</code>.' },
    { icon: "cost", k: "Semaphore", v: '«limit the number of threads that can access… concurrently» до N; <span class="hl">без affinity</span>: «a thread can acquire the semaphore and another one can release it». <code>Release()</code> возвращает прежний count (c1=0 prev=0 c2=1). Пере-release → <code>SemaphoreFullException</code>.' },
    { icon: "avoid", k: "EventWaitHandle", v: 'Сигнал, не .NET-события. AutoReset — «releasing a single waiting thread»; ManualReset — «all waiting threads are free to proceed» до <code>Reset</code> (passed=4). «Event wait handles are <span class="hl">not .NET events</span>».' },
  ],

  foot: 'урок · <b>Mutex / Semaphore / EventWaitHandle</b> · 5 анимир. разборов · панель thread affinity · дизайн <b>mid</b>',
};
