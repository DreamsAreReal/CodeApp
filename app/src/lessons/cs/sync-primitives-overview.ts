/**
 * Lesson: Overview of synchronization primitives (CS.S8.sync-primitives-overview) — expert density,
 * 5 animated deep-dives. .NET's synchronization types fall into three categories the docs draw:
 * WaitHandle-derived (Mutex/Semaphore/EventWaitHandle — kernel handle, cross-process on Windows) vs
 * lightweight types (SemaphoreSlim/ManualResetEventSlim — no OS handle, better perf, in-process
 * only); primitives that guard access to a shared resource (Monitor/lock, Mutex, SpinLock,
 * ReaderWriterLockSlim, Semaphore(Slim)); and signaling constructs (EventWaitHandle + Auto/Manual
 * reset, CountdownEvent, Barrier). The unbreakable rule: use ONE primitive instance per resource.
 *
 * SIGNATURE machine panel (s5): Mutex and Semaphore derive from WaitHandle (True), SemaphoreSlim is
 * the lightweight alternative and does NOT (False) — REAL run-csharp measurement (this file's exec
 * cards): "True True False".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from overview-of-synchronization-primitives, fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (bounded/turnstile
 *     semantics + generous waits, WaitAll/Countdown before print): c1 "maxConcurrent=2" ·
 *     c2 "True True False" · c3 "afterOneSet=1 total=3".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.sync-primitives-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: three categories map.
const Z_MAP: Zone = { id: "map", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ПРИМИТИВЫ СИНХРОНИЗАЦИИ · три роли", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "доступ к ресурсу · сигналинг · WaitHandle vs lightweight", subCls: "vz-zsub", subY: 40 };
const MAP_ZONES: Zone[] = [Z_MAP];

// s2: WaitHandle-derived vs lightweight.
const Z_WH: Zone = { id: "wh", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "WaitHandle", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "OS handle · cross-process", subCls: "vz-zsub heap", subY: 47 };
const Z_LIGHT: Zone = { id: "light", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "LIGHTWEIGHT", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "без handle · быстрее · in-proc", subCls: "vz-zsub good", subY: 47 };
const WH_ZONES: Zone[] = [Z_WH, Z_LIGHT];

// s3: guard access — Monitor/Mutex/SpinLock/RWLockSlim/Semaphore.
const Z_GUARD: Zone = { id: "guard", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "ДОСТУП К ОБЩЕМУ РЕСУРСУ", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "Monitor/lock · Mutex · SpinLock · RWLockSlim · Semaphore", subCls: "vz-zsub good", subY: 40 };
const GUARD_ZONES: Zone[] = [Z_GUARD];

// s4: signaling — Auto vs Manual reset.
const Z_AUTO: Zone = { id: "auto", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AutoResetEvent", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "турникет · 1 поток / Set", subCls: "vz-zsub good", subY: 47 };
const Z_MANUAL: Zone = { id: "manual", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ManualResetEvent", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "ворота · открыты до Reset", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_AUTO, Z_MANUAL];

// s5 (SIGNATURE): WaitHandle subclass check.
const Z_DERIVE: Zone = { id: "derive", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "WaitHandle", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "Mutex · Semaphore", subCls: "vz-zsub heap", subY: 47 };
const Z_SLIM: Zone = { id: "slim", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "SemaphoreSlim", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "НЕ WaitHandle · lightweight", subCls: "vz-zsub good", subY: 47 };
const DERIVE_ZONES: Zone[] = [Z_DERIVE, Z_SLIM];

export const syncPrimitivesOverview: LessonData = {
  id: "CS.S8.sync-primitives-overview",
  track: "CS",
  section: "CS.S8",
  module: "S8.4",
  lang: "csharp",
  title: "Обзор примитивов синхронизации",
  kicker: "C# вглубь · S8 · карта примитивов",
  home: { subtitle: "WaitHandle vs lightweight, доступ к ресурсу, сигналинг", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.lock-statement"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-sync", kind: "doc", org: "Microsoft Learn", title: "Overview of synchronization primitives", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives", date: "2022-09-01" },
  ],

  spec: [
    { text: "Единственное общее правило: «Use the same synchronization primitive instance to protect access of a shared resource. If you use different synchronization primitive instances to protect the same resource, you'll circumvent the protection provided by a synchronization primitive». <span class=\"ru-tr\">«Используйте один и тот же экземпляр примитива синхронизации для защиты доступа к общему ресурсу. Если вы используете разные экземпляры примитивов синхронизации для защиты одного и того же ресурса, вы обойдёте защиту, обеспечиваемую примитивом синхронизации».</span>", source: "ms-sync" },
    { text: "Две большие группы: наследники «System.Threading.WaitHandle class, which encapsulates a native operating system synchronization handle» <span class=\"ru-tr\">«класс System.Threading.WaitHandle, который инкапсулирует нативный дескриптор синхронизации операционной системы»</span>, и lightweight-типы, что «don't rely on underlying operating system handles and typically provide better performance» <span class=\"ru-tr\">«не полагаются на нижележащие дескрипторы операционной системы и обычно обеспечивают лучшую производительность»</span>.", source: "ms-sync" },
  ],
  edgeCases: [
    { text: "Lightweight — только внутри процесса: «they cannot be used for the inter-process synchronization. Use those types for thread synchronization within one application» <span class=\"ru-tr\">«они не могут использоваться для межпроцессной синхронизации. Используйте эти типы для синхронизации потоков в пределах одного приложения»</span>. Пример: «SemaphoreSlim is a lightweight alternative to Semaphore» <span class=\"ru-tr\">«<code>SemaphoreSlim</code> — это облегчённая альтернатива <code>Semaphore</code>»</span>.", source: "ms-sync" },
    { text: "AutoReset — турникет на одного: «resets automatically after releasing a single waiting thread. It's like a turnstile that allows only one thread through each time it's signaled» <span class=\"ru-tr\">«сбрасывается автоматически после освобождения одного ждущего потока. Это как турникет, который пропускает только один поток за каждый сигнал»</span>. ManualReset — ворота: «remains signaled until its Reset method is called» <span class=\"ru-tr\">«остаётся в сигнальном состоянии, пока не будет вызван его метод <code>Reset</code>»</span>.", source: "ms-sync" },
    { text: "Monitor лучше звать через lock: «To synchronize access to a shared resource, use the lock statement in C# … instead of using the Monitor class directly» <span class=\"ru-tr\">«Чтобы синхронизировать доступ к общему ресурсу, используйте оператор <code>lock</code> в C# … вместо прямого использования класса <code>Monitor</code>»</span>.", source: "ms-sync" },
  ],

  misconceptions: [
    {
      wrong: "примитивы синхронизации — это «куча взаимозаменяемых замков», бери любой",
      hook: 'Они <b>не</b> взаимозаменяемы, и делятся на группы. Первая ось: наследники «<span class="hl">System.Threading.WaitHandle</span> class, which <b>encapsulates a native operating system synchronization handle</b>» <span class="ru-tr">«класс <code>System.Threading.WaitHandle</code>, который <b>инкапсулирует нативный дескриптор синхронизации операционной системы</b>»</span> (Mutex, Semaphore, EventWaitHandle — можно между процессами на Windows) против lightweight-типов, что «<span class="hl">don\'t rely on underlying operating system handles and typically provide better performance</span>» <span class="ru-tr">«не полагаются на нижележащие дескрипторы операционной системы и обычно обеспечивают лучшую производительность»</span> (SemaphoreSlim, ManualResetEventSlim — только внутри процесса). Вторая ось: одни защищают <b>доступ к ресурсу</b> (Monitor/lock, Mutex, SpinLock, ReaderWriterLockSlim, Semaphore), другие — <b>сигналинг</b> между потоками (EventWaitHandle, CountdownEvent, Barrier). И железное правило: «<span class="hl">Use the same synchronization primitive instance to protect access of a shared resource</span>» <span class="ru-tr">«Используйте один и тот же экземпляр примитива синхронизации для защиты доступа к общему ресурсу»</span>. Дальше <b>пять разборов</b>: карта ролей, WaitHandle vs lightweight, guard-примитивы, Auto vs Manual reset, и <b>машинная панель</b> — кто наследует WaitHandle реальным прогоном.',
      source: "ms-sync",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Карта · три роли", title: "Доступ к ресурсу · сигналинг · WaitHandle vs lightweight",
      viewBox: "0 0 340 210", zones: MAP_ZONES,
      code: ["// 1) защита доступа: Monitor/lock, Mutex, SpinLock, RWLockSlim, Semaphore", "// 2) сигналинг: EventWaitHandle, CountdownEvent, Barrier", "// ось реализации: WaitHandle (OS handle) vs lightweight"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Одни примитивы защищают <b>доступ к общему ресурсу</b>: только один (или N) потоков внутри. Основа — Monitor/<code>lock</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "map", row: 0 }, state: "ok", label: "доступ к ресурсу", detail: "Monitor · Mutex · Semaphore", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Другие — <b>сигналинг</b>: поток ждёт уведомления. «a thread must <span class="hl">wait for notification, or a signal</span>, from one or more threads in order to proceed». <span class="ru-tr">«поток должен ждать уведомления, или сигнала, от одного или нескольких потоков, чтобы продолжить работу».</span>', nodes: [{ id: "g", kind: "gate", at: { zone: "map", row: 0 }, state: "ok", label: "доступ к ресурсу", detail: "Monitor · Mutex · Semaphore" }, { id: "s", kind: "gate", at: { zone: "map", row: 1 }, state: "ok", label: "сигналинг", detail: "EventWaitHandle · Countdown · Barrier", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Поперёк — ось реализации: <span class="hl">WaitHandle</span> (OS-handle, межпроцессно) vs <span class="hl">lightweight</span> (без handle, быстрее). Разбор 02.', nodes: [{ id: "g", kind: "gate", at: { zone: "map", row: 0 }, state: "ok", label: "доступ", detail: "Monitor · Mutex" }, { id: "s", kind: "gate", at: { zone: "map", row: 1, col: 0 }, state: "ok", label: "сигналинг", detail: "Event · Barrier" }, { id: "impl", kind: "gate", at: { zone: "map", row: 1, col: 1 }, state: "", label: "WaitHandle vs lightweight", detail: "ось реализации", accent: true }], edges: [] },
      ],
      explain: '.NET даёт «a range of types that you can use to synchronize access to a shared resource or coordinate thread interaction» <span class="ru-tr">«набор типов, которые можно использовать для синхронизации доступа к общему ресурсу или координации взаимодействия потоков»</span>. Их удобно раскладывать по двум осям. По <b>роли</b>: guard-примитивы контролируют доступ («control access to a shared resource by multiple threads» <span class="ru-tr">«управляют доступом к общему ресурсу со стороны нескольких потоков»</span> — Monitor, Mutex, SpinLock, ReaderWriterLockSlim, Semaphore/SemaphoreSlim) и сигналинг-конструкции координируют потоки («<span class="hl">Thread interaction (or thread signaling) means that a thread must wait for notification, or a signal, from one or more threads in order to proceed</span>» <span class="ru-tr">«Взаимодействие потоков (или сигналинг потоков) означает, что поток должен ждать уведомления, или сигнала, от одного или нескольких потоков, чтобы продолжить работу»</span> — EventWaitHandle, CountdownEvent, Barrier). По <b>реализации</b>: WaitHandle-наследники против lightweight (разбор 02). Общее и нерушимое: «<span class="hl">Use the same synchronization primitive instance to protect access of a shared resource</span>» <span class="ru-tr">«Используйте один и тот же экземпляр примитива синхронизации для защиты доступа к общему ресурсу»</span>.',
      sources: ["ms-sync"],
    },
    {
      id: "s2", num: "02", kicker: "WaitHandle vs lightweight", title: "OS-handle и межпроцессность против скорости in-process",
      viewBox: "0 0 340 210", zones: WH_ZONES,
      code: ["Mutex, Semaphore, EventWaitHandle : WaitHandle   // OS handle", "SemaphoreSlim, ManualResetEventSlim              // lightweight", "// Slim быстрее, но только внутри одного процесса"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Наследники <code>WaitHandle</code> оборачивают <b>нативный OS-handle</b>: «encapsulates a native operating system synchronization handle». <span class="ru-tr">«инкапсулирует нативный дескриптор синхронизации операционной системы».</span>', nodes: [{ id: "w", kind: "obj", at: { zone: "wh", row: 0 }, typeTag: "WaitHandle", value: "OS handle", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Lightweight-типы OS-handle <span class="hl">не</span> держат: «don\'t rely on underlying operating system handles and typically provide better performance». <span class="ru-tr">«не полагаются на нижележащие дескрипторы операционной системы и обычно обеспечивают лучшую производительность».</span>', nodes: [{ id: "w", kind: "obj", at: { zone: "wh", row: 0 }, typeTag: "WaitHandle", value: "OS handle" }, { id: "l", kind: "obj", at: { zone: "light", row: 0 }, typeTag: "SemaphoreSlim", value: "без handle", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Плата за скорость — <b>только in-process</b>: «cannot be used for the inter-process synchronization». <span class="ru-tr">«не могут использоваться для межпроцессной синхронизации».</span> WaitHandle-типы (на Windows) — межпроцессны через имя.', nodes: [{ id: "w", kind: "gate", at: { zone: "wh", row: 0 }, state: "ok", label: "WaitHandle", detail: "cross-process (named)", accent: true }, { id: "l", kind: "gate", at: { zone: "light", row: 0 }, state: "", label: "lightweight", detail: "in-process only", accent: true }], edges: [] },
      ],
      explain: 'Первая ось выбора — тяжёлый OS-примитив или лёгкий CLR-примитив. «Multiple .NET synchronization primitives derive from the <code>System.Threading.WaitHandle</code> class, which <span class="hl">encapsulates a native operating system synchronization handle and uses a signaling mechanism for thread interaction</span>» <span class="ru-tr">«Несколько примитивов синхронизации .NET наследуются от класса <code>System.Threading.WaitHandle</code>, который инкапсулирует нативный дескриптор синхронизации операционной системы и использует механизм сигналинга для взаимодействия потоков»</span> — сюда входят Mutex, Semaphore, EventWaitHandle (+ Auto/ManualResetEvent). На Windows они «can represent named system synchronization handles… <span class="hl">for the inter-process synchronization</span>» <span class="ru-tr">«могут представлять именованные системные дескрипторы синхронизации… для межпроцессной синхронизации»</span>. Lightweight-типы иные: «<span class="hl">Lightweight synchronization types don\'t rely on underlying operating system handles and typically provide better performance. However, they cannot be used for the inter-process synchronization</span>. Use those types for thread synchronization within one application» <span class="ru-tr">«Облегчённые типы синхронизации не полагаются на нижележащие дескрипторы операционной системы и обычно обеспечивают лучшую производительность. Однако их нельзя использовать для межпроцессной синхронизации. Используйте эти типы для синхронизации потоков в пределах одного приложения»</span>. Прямая пара: «<span class="hl">SemaphoreSlim is a lightweight alternative to Semaphore</span>» <span class="ru-tr">«<code>SemaphoreSlim</code> — это облегчённая альтернатива <code>Semaphore</code>»</span>. Правило: не нужен межпроцессный сценарий — бери Slim.',
      sources: ["ms-sync"],
    },
    {
      id: "s3", num: "03", kicker: "Guard · доступ", title: "Monitor/lock, Mutex, SpinLock, RWLockSlim, Semaphore",
      viewBox: "0 0 340 210", zones: GUARD_ZONES,
      code: ["lock (x) { ... }              // Monitor — общий инструмент", "using(mutex) / mutex.WaitOne();  // Mutex — + межпроцессно", "rwLock.EnterReadLock();          // RWLockSlim — много читателей", "sem.Wait(); ... sem.Release();   // Semaphore(Slim) — не более N"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Monitor</b> — база: «grants mutually exclusive access… by acquiring or releasing a lock». <span class="ru-tr">«предоставляет взаимно исключающий доступ… через захват или освобождение блокировки».</span> Звать через <code>lock</code>, не напрямую.', nodes: [{ id: "mon", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "Monitor / lock", detail: "взаимное исключение", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Mutex</b> — как Monitor, но «can be used for <span class="hl">inter-process synchronization</span>» <span class="ru-tr">«может использоваться для межпроцессной синхронизации»</span> (named). Имеет thread affinity: освобождает владелец.', nodes: [{ id: "mon", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "Monitor / lock", detail: "взаимное исключение" }, { id: "mx", kind: "gate", at: { zone: "guard", row: 1 }, state: "ok", label: "Mutex", detail: "+ межпроцессно", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>ReaderWriterLockSlim</b> — «allows <span class="hl">multiple threads to access the resource simultaneously for reading</span>» <span class="ru-tr">«позволяет нескольким потокам обращаться к ресурсу одновременно для чтения»</span>, но writer эксклюзивен.', nodes: [{ id: "mon", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "Monitor", detail: "1 поток" }, { id: "rw", kind: "gate", at: { zone: "guard", row: 1 }, state: "ok", label: "RWLockSlim", detail: "N читателей / 1 писатель", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Semaphore(Slim)</b> — «<span class="hl">limit the number of threads that can access</span> a shared resource… concurrently» <span class="ru-tr">«ограничивают число потоков, которые могут одновременно обращаться к общему ресурсу»</span>: не более N. SpinLock крутится в цикле, не блокируя.', nodes: [{ id: "rw", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "RWLockSlim", detail: "чтение параллельно" }, { id: "sem", kind: "gate", at: { zone: "guard", row: 1 }, state: "ok", label: "Semaphore(Slim)", detail: "не более N", accent: true }], edges: [] },
      ],
      explain: 'Guard-семейство — по «форме» ограничения. <b>Monitor</b>: «grants mutually exclusive access to a shared resource by acquiring or releasing a lock» <span class="ru-tr">«предоставляет взаимно исключающий доступ к общему ресурсу через захват или освобождение блокировки»</span> — но «<span class="hl">use the lock statement in C#… instead of using the Monitor class directly</span>» <span class="ru-tr">«используйте оператор <code>lock</code> в C#… вместо прямого использования класса <code>Monitor</code>»</span>. <b>Mutex</b>: как Monitor, «has thread affinity» <span class="ru-tr">«имеет привязку к потоку»</span> и «<span class="hl">can be used for inter-process synchronization</span>» <span class="ru-tr">«может использоваться для межпроцессной синхронизации»</span> через named. <b>SpinLock</b>: «When <code>SpinLock</code> attempts to acquire a lock that is unavailable, it <span class="hl">waits in a loop, repeatedly checking</span> until the lock becomes available» <span class="ru-tr">«Когда <code>SpinLock</code> пытается захватить недоступную блокировку, он ждёт в цикле, повторно проверяя, пока блокировка не станет доступной»</span> — дёшево при коротком ожидании. <b>ReaderWriterLockSlim</b>: «grants exclusive access… for writing and <span class="hl">allows multiple threads to access the resource simultaneously for reading</span>» <span class="ru-tr">«предоставляет эксклюзивный доступ… для записи и позволяет нескольким потокам обращаться к ресурсу одновременно для чтения»</span>. <b>Semaphore/SemaphoreSlim</b>: «<span class="hl">limit the number of threads that can access a shared resource or a pool of resources concurrently</span>» <span class="ru-tr">«ограничивают число потоков, которые могут одновременно обращаться к общему ресурсу или пулу ресурсов»</span> — семафор без thread affinity: «a thread can acquire the semaphore and another one can release it» <span class="ru-tr">«один поток может захватить семафор, а другой — освободить его»</span>.',
      sources: ["ms-sync"],
    },
    {
      id: "s4", num: "04", kicker: "Сигналинг · reset-режим", title: "AutoReset — турникет на одного; ManualReset — ворота",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var are = new AutoResetEvent(false);   // турникет", "are.Set();   // пропускает РОВНО ОДИН ждущий поток, затем закрывается", "var mre = new ManualResetEvent(false); // ворота", "mre.Set();   // открыты, пока не позовёшь Reset() -> все проходят"],
      predictAt: 1, predictQ: 'Три потока ждут на <code>AutoResetEvent</code>. Сколько пройдёт после ОДНОГО <code>Set()</code>, и сколько всего после трёх <code>Set()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>AutoResetEvent</code> — «<span class="hl">turnstile that allows only one thread through</span> each time it\'s signaled» <span class="ru-tr">«турникет, который пропускает только один поток за каждый сигнал»</span>: сбрасывается автоматически.', nodes: [{ id: "a", kind: "gate", at: { zone: "auto", row: 0 }, state: "ok", label: "AutoReset", detail: "1 поток / Set", accent: true }], edges: [] },
        { codeLine: 1, out: "afterOneSet=1 total=3", caption: 'Один <code>Set()</code> → проходит <b>ровно один</b> ждущий (afterOneSet=1); чтобы пропустить троих, нужно три <code>Set()</code> (total=3). Реальный прогон.', nodes: [{ id: "a", kind: "gate", at: { zone: "auto", row: 0 }, state: "ok", label: "1 Set", detail: "→ 1 поток", accent: true }, { id: "a3", kind: "gate", at: { zone: "auto", row: 1 }, state: "ok", label: "3 Set", detail: "→ 3 потока", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>ManualResetEvent</code> — «<span class="hl">remains signaled until its <code>Reset</code> method is called</span>» <span class="ru-tr">«остаётся в сигнальном состоянии, пока не будет вызван его метод <code>Reset</code>»</span>: как ворота — открыл, и все ждущие проходят, пока не закроешь.', nodes: [{ id: "m", kind: "gate", at: { zone: "manual", row: 0 }, state: "ok", label: "ManualReset", detail: "открыт до Reset — все проходят", accent: true }], edges: [] },
      ],
      explain: 'Сигналинг через <code>EventWaitHandle</code> — событие с двумя состояниями: «When the state of an event is unsignaled, a thread that calls the event\'s <code>WaitOne</code> overload is <span class="hl">blocked until an event is signaled</span>. The <code>EventWaitHandle.Set</code> method sets the state of an event to signaled» <span class="ru-tr">«Когда состояние события несигнальное, поток, вызывающий перегрузку <code>WaitOne</code> события, блокируется до тех пор, пока событие не перейдёт в сигнальное состояние. Метод <code>EventWaitHandle.Set</code> переводит состояние события в сигнальное»</span>. Поведение после Set зависит от reset-режима: «An <code>EventWaitHandle</code> created with the <code>EventResetMode.AutoReset</code> flag <span class="hl">resets automatically after releasing a single waiting thread. It\'s like a turnstile that allows only one thread through each time it\'s signaled</span>» <span class="ru-tr">«<code>EventWaitHandle</code>, созданный с флагом <code>EventResetMode.AutoReset</code>, сбрасывается автоматически после освобождения одного ждущего потока. Это как турникет, который пропускает только один поток за каждый сигнал»</span> (класс <code>AutoResetEvent</code>). Против: «<code>EventResetMode.ManualReset</code>… <span class="hl">remains signaled until its <code>Reset</code> method is called. It\'s like a gate that is closed until signaled and then stays open</span>» <span class="ru-tr">«<code>EventResetMode.ManualReset</code>… остаётся в сигнальном состоянии, пока не будет вызван его метод <code>Reset</code>. Это как ворота, которые закрыты до сигнала, а затем остаются открытыми»</span> (класс <code>ManualResetEvent</code>; lightweight — <code>ManualResetEventSlim</code>). Реальный прогон подтверждает турникет: один <code>Set</code> пропускает одного (afterOneSet=1), три — троих (total=3).',
      sources: ["ms-sync"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · WaitHandle", title: "Mutex/Semaphore : WaitHandle; SemaphoreSlim — нет",
      viewBox: "0 0 340 210", zones: DERIVE_ZONES,
      code: ["typeof(Mutex).IsSubclassOf(typeof(WaitHandle))         // ?", "typeof(Semaphore).IsSubclassOf(typeof(WaitHandle))     // ?", "typeof(SemaphoreSlim).IsSubclassOf(typeof(WaitHandle)) // ?"],
      predictAt: 2, predictQ: '<code>IsSubclassOf(WaitHandle)</code> для <code>Mutex</code>, <code>Semaphore</code>, <code>SemaphoreSlim</code> — какая тройка?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Mutex</code> — наследник <code>WaitHandle</code> (OS-handle): <b>True</b>. Отсюда <code>WaitOne</code>/<code>WaitAll</code>/<code>WaitAny</code>.', nodes: [{ id: "mx", kind: "gate", at: { zone: "derive", row: 0 }, state: "ok", label: "Mutex", detail: "WaitHandle: True", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Semaphore</code> — тоже <code>WaitHandle</code> (тонкая обёртка над Win32-семафором): <b>True</b>.', nodes: [{ id: "mx", kind: "gate", at: { zone: "derive", row: 0 }, state: "ok", label: "Mutex", detail: "True" }, { id: "sm", kind: "gate", at: { zone: "derive", row: 1 }, state: "ok", label: "Semaphore", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "True True False", caption: 'А <code>SemaphoreSlim</code> — <span class="hl">не</span> <code>WaitHandle</code>: <b>False</b>. Панель: <b>True True False</b> (реальная рефлексия) — вот кто lightweight-альтернатива.', nodes: [{ id: "mx", kind: "gate", at: { zone: "derive", row: 0 }, state: "ok", label: "Mutex/Sem", detail: "True/True" }, { id: "sl", kind: "gate", at: { zone: "slim", row: 0 }, state: "fail", label: "SemaphoreSlim", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — граница WaitHandle рефлексией. Прогон: <code>Mutex</code> и <code>Semaphore</code> — <code>IsSubclassOf(WaitHandle) == True</code>, <code>SemaphoreSlim</code> — <code>False</code> (печать <b>True True False</b>). Это ровно та граница из доков: WaitHandle-наследники «<span class="hl">encapsulates a native operating system synchronization handle</span>» <span class="ru-tr">«инкапсулирует нативный дескриптор синхронизации операционной системы»</span> и (на Windows) годятся для межпроцессной синхронизации, а <code>SemaphoreSlim</code> — «<span class="hl">a lightweight alternative to Semaphore</span>» <span class="ru-tr">«облегчённая альтернатива <code>Semaphore</code>»</span> без OS-handle: «<span class="hl">SemaphoreSlim doesn\'t support named system semaphores</span>» <span class="ru-tr">«<code>SemaphoreSlim</code> не поддерживает именованные системные семафоры»</span>. Практический вывод: <code>WaitOne</code>/<code>WaitAll</code>/<code>WaitAny</code> (методы <code>WaitHandle</code>) есть только у WaitHandle-типов; у Slim — свои <code>Wait</code>/<code>WaitAsync</code>.',
      sources: ["ms-sync"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var sem = new SemaphoreSlim(2); int cur = 0, max = 0; object m = new object(); var tasks = new Task[8]; for (int i=0;i&lt;8;i++) tasks[i]=Task.Run(async ()=>{ await sem.WaitAsync(); lock(m){ cur++; if(cur&gt;max) max=cur; } await Task.Delay(20); lock(m){ cur--; } sem.Release(); }); Task.WaitAll(tasks); Console.WriteLine($"maxConcurrent={max}");</code> — что напечатает?',
      options: ["maxConcurrent=2", "maxConcurrent=8", "maxConcurrent=1", "maxConcurrent (непредсказуемо)"], correctIndex: 0, xp: 10,
      okText: '<code>SemaphoreSlim(2)</code> «limit the number of threads that can access… concurrently» <span class="ru-tr">«ограничивает число потоков, которые могут одновременно обращаться…»</span> — не более <b>2</b> в критической секции одновременно, сколько бы задач ни стартовало. Итог <b>maxConcurrent=2</b>.',
      noText: 'Семафор с ёмкостью 2 пропускает максимум 2 потока разом; 8 задач ждут очереди. Реальный вывод (ограничен сверху ёмкостью): <b>maxConcurrent=2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "maxConcurrent=2" }, sourceRefs: ["ms-sync"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool mutexWH = typeof(Mutex).IsSubclassOf(typeof(WaitHandle)); bool semWH = typeof(Semaphore).IsSubclassOf(typeof(WaitHandle)); bool slimWH = typeof(SemaphoreSlim).IsSubclassOf(typeof(WaitHandle)); Console.WriteLine($"{mutexWH} {semWH} {slimWH}");</code> — что напечатает?',
      options: ["True True False", "True True True", "False False True", "True False False"], correctIndex: 0, xp: 10,
      okText: '<code>Mutex</code> и <code>Semaphore</code> наследуют <code>WaitHandle</code> (OS-handle, межпроцессны) — True/True; <code>SemaphoreSlim</code> — «lightweight alternative» <span class="ru-tr">«облегчённая альтернатива»</span> без handle — False.',
      noText: 'WaitHandle «encapsulates a native operating system synchronization handle» <span class="ru-tr">«инкапсулирует нативный дескриптор синхронизации операционной системы»</span>; Mutex и Semaphore его наследуют, Slim — нет. Реальный вывод: <b>True True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True True False" }, sourceRefs: ["ms-sync"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var are = new AutoResetEvent(false); int passed = 0; var done = new CountdownEvent(3); for(int i=0;i&lt;3;i++){ var t = new Thread(()=>{ are.WaitOne(); Interlocked.Increment(ref passed); done.Signal(); }); t.Start(); } Thread.Sleep(50); int afterOneSet = 0; are.Set(); Thread.Sleep(50); afterOneSet = passed; are.Set(); are.Set(); done.Wait(); Console.WriteLine($"afterOneSet={afterOneSet} total={passed}");</code> — что напечатает?',
      options: ["afterOneSet=1 total=3", "afterOneSet=3 total=3", "afterOneSet=1 total=1", "afterOneSet=0 total=3"], correctIndex: 0, xp: 10,
      okText: '<code>AutoResetEvent</code> — «turnstile that allows only one thread through each time it\'s signaled» <span class="ru-tr">«турникет, который пропускает только один поток за каждый сигнал»</span>: один <code>Set</code> пропускает ровно одного (afterOneSet=1); чтобы пройти троим — три <code>Set</code> (total=3).',
      noText: 'AutoReset сбрасывается после освобождения одного ждущего; поэтому 1 Set → 1 поток, 3 Set → 3. Реальный вывод: <b>afterOneSet=1 total=3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "afterOneSet=1 total=3" }, sourceRefs: ["ms-sync"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Две оси", v: 'По роли: guard-примитивы (Monitor/lock, Mutex, SpinLock, RWLockSlim, Semaphore) vs сигналинг (EventWaitHandle, Countdown, Barrier). По реализации: WaitHandle (OS-handle) vs lightweight. Правило: «<span class="hl">Use the same synchronization primitive instance to protect access</span>» <span class="ru-tr">«Используйте один и тот же экземпляр примитива синхронизации для защиты доступа»</span>.' },
    { icon: "cost", k: "WaitHandle / Slim", v: 'WaitHandle «encapsulates a native operating system synchronization handle» <span class="ru-tr">«инкапсулирует нативный дескриптор синхронизации операционной системы»</span> → межпроцессно (named). Lightweight «don\'t rely on underlying operating system handles… <span class="hl">cannot be used for the inter-process synchronization</span>» <span class="ru-tr">«не полагаются на нижележащие дескрипторы операционной системы… не могут использоваться для межпроцессной синхронизации»</span> → быстрее, но in-process. Панель: True True False.' },
    { icon: "avoid", k: "reset-режим", v: 'AutoReset — «turnstile that allows only one thread through» <span class="ru-tr">«турникет, который пропускает только один поток»</span> (1 Set → 1 поток, afterOneSet=1 total=3). ManualReset — «gate… stays open» <span class="ru-tr">«ворота… остаются открытыми»</span> до <code>Reset</code>. Semaphore(Slim) ограничивает N разом (maxConcurrent=2).' },
  ],

  foot: 'урок · <b>обзор примитивов синхронизации</b> · 5 анимир. разборов · панель WaitHandle · дизайн <b>mid</b>',
};
