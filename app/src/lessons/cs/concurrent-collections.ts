/**
 * Lesson: Concurrent-коллекции — fine-grained, lock-free (CS.S17.concurrent-collections).
 * The axis is COST OF SYNCHRONIZATION. The old Synchronized wrapper locks the WHOLE
 * collection on every op (doesn't scale). Concurrent types use fine-grained locking, and
 * ConcurrentQueue/Stack use no locks at all (Interlocked). But GetOrAdd's valueFactory runs
 * OUTSIDE the lock -> not atomic, may run more than once under contention. Enumeration of a
 * ConcurrentQueue is a moment-in-time SNAPSHOT.
 *
 * SIGNATURE machine panel (s4): a live ConcurrentQueue enumeration snapshot — GetEnumerator,
 * then Enqueue AFTER: the enumerator counts 3, the queue has 4. The snapshot does not see
 * post-GetEnumerator writes. REAL, deterministic. And a race panel: 64 threads GetOrAdd a
 * fresh key -> exactly 1 pair added, factory ran (may run more than once). Evidence:
 * scratchpad l6snap.cs / l6panel.cs / l6c1.cs / l6iss.cs, backend run-csharp, 2026-07-21.
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from thread-safe/ + concurrentdictionary-2.getoradd +
 *     concurrentqueue-1.getenumerator (fetch-verified 2026-07-21) — GT F1–F4, F10, F12.
 *   - card verify.expect = REAL run-csharp stdout; anti-echo.
 *   - FINDING (recorded in progress.md): in .NET 10 the runtime THROWS NotSupportedException
 *     when SyncRoot is read on a concurrent collection — it does NOT "return null" as older
 *     docs describe. The lesson therefore does NOT claim SyncRoot==null as current runtime
 *     behaviour; it quotes IsSynchronized==false (verified, still true) and frames SyncRoot
 *     as "irrelevant / not usable for synchronization".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.concurrent-collections/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the sync-cost axis — whole-collection lock vs fine-grained/lock-free.
const Z_OLD: Zone = { id: "old", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Synchronized-обёртка", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "лок всей коллекции", subCls: "vz-zsub heap", subY: 47 };
const Z_CONC: Zone = { id: "conc", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Concurrent", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "fine-grained / lock-free", subCls: "vz-zsub good", subY: 47 };
const AXIS_ZONES: Zone[] = [Z_OLD, Z_CONC];

// s2: type roles.
const Z_ROLES: Zone = { id: "roles", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "System.Collections.Concurrent · роли типов", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "Dictionary · Queue · Stack · Bag · BlockingCollection", subCls: "vz-zsub", subY: 47 };
const ROLES_ZONES: Zone[] = [Z_ROLES];

// s3: GetOrAdd — factory outside the lock, not atomic.
const Z_LOCK: Zone = { id: "lock", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "под локом · запись", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "fine-grained", subCls: "vz-zsub good", subY: 47 };
const Z_FACT: Zone = { id: "fact", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "вне лока · valueFactory", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "не атомарно", subCls: "vz-zsub heap", subY: 47 };
const GETORADD_ZONES: Zone[] = [Z_LOCK, Z_FACT];

// s4 (SIGNATURE): snapshot enumeration.
const Z_ENUM: Zone = { id: "enum", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "энумератор · снимок", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "GetEnumerator()", subCls: "vz-zsub good", subY: 47 };
const Z_LIVE: Zone = { id: "live", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "живая очередь", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Enqueue после", subCls: "vz-zsub heap", subY: 47 };
const SNAP_ZONES: Zone[] = [Z_ENUM, Z_LIVE];

export const concurrentCollections: LessonData = {
  id: "CS.S17.concurrent-collections",
  track: "CS",
  section: "CS.S17",
  module: "S17.6",
  lang: "csharp",
  title: "Concurrent-коллекции: fine-grained, lock-free",
  kicker: "C# вглубь · S17 · цена синхронизации",
  home: { subtitle: "ConcurrentDictionary/Queue/Bag, GetOrAdd, снимок", icon: "collections", estMinutes: 11 },
  prereqs: ["CS.S17.dictionary-internals"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-threadsafe", kind: "doc", org: "Microsoft Learn", title: "Thread-Safe collections", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/thread-safe/", date: "2026-03-30" },
    { id: "ms-getoradd", kind: "doc", org: "Microsoft Learn", title: "ConcurrentDictionary<TKey,TValue>.GetOrAdd Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2.getoradd", date: "2026-07-01" },
    { id: "ms-queue-enum", kind: "doc", org: "Microsoft Learn", title: "ConcurrentQueue<T>.GetEnumerator Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentqueue-1.getenumerator", date: "2026-07-01" },
  ],

  spec: [
    { text: "«The System.Collections.Concurrent namespace includes several collection classes that are both thread-safe and scalable. Multiple threads can safely and efficiently add or remove items from these collections, without requiring additional synchronization in user code.»", source: "ms-threadsafe" },
    { text: "«The ConcurrentQueue&lt;T&gt; and ConcurrentStack&lt;T&gt; classes don't use locks at all. Instead, they rely on Interlocked operations to achieve thread safety.»", source: "ms-threadsafe" },
  ],
  edgeCases: [
    { text: "Старая <code>Synchronized</code>-обёртка «works by <b>locking the entire collection</b> on every add or remove operation» — не масштабируется и не защищена от гонок.", source: "ms-threadsafe" },
    { text: "Только чтение из общей коллекции? «If you're <b>only reading</b> from a shared collection, use the classes in the <code>System.Collections.Generic</code> namespace» — синхронизация не нужна.", source: "ms-threadsafe" },
    { text: "<code>IsSynchronized</code> у concurrent-типов — всегда <code>false</code>. В .NET 10 чтение <code>SyncRoot</code> <b>бросает</b> <code>NotSupportedException</code>: <code>lock(coll.SyncRoot)</code> её не синхронизирует.", source: "ms-threadsafe" },
  ],

  misconceptions: [
    {
      wrong: "GetOrAdd полностью атомарен — фабрика значения выполнится ровно один раз",
      hook: 'Соблазнительно считать <code>GetOrAdd</code> одной неделимой операцией с гарантией «фабрика вызовется один раз». Дока говорит обратное: «the <code>valueFactory</code> delegate is called <span class="wrong">outside the locks</span>… Therefore, <code>GetOrAdd</code> is <b>not atomic</b>». Под гонкой «<code>valueFactory</code> may be called <span class="hl">multiple times</span>, but only one key/value pair will be added». Concurrent-коллекции быстры не потому, что «lock вокруг обычной»: у части — fine-grained locking, а <code>ConcurrentQueue</code>/<code>Stack</code> «don\'t use locks at all… Interlocked». Дальше <b>четыре разбора</b> — до <b>машинной панели</b>: реальный снимок энумератора <code>ConcurrentQueue</code> — считает <b>3</b>, пока живая очередь уже <b>4</b>.',
      source: "ms-getoradd",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Ось · цена синхронизации", title: "Лок всей коллекции против fine-grained / lock-free",
      viewBox: "0 0 340 210", zones: AXIS_ZONES,
      code: ["// старый способ: Synchronized-обёртка", "Hashtable.Synchronized(ht);  // один лок на всё", "// новый: System.Collections.Concurrent", "new ConcurrentDictionary<K,V>(); // мелкозернисто"],
      scenes: [
        { codeLine: 1, caption: '<code>Synchronized</code>-обёртка «works by <span class="wrong">locking the entire collection</span> on every add or remove». Каждый поток ждёт <b>один</b> общий лок.', nodes: [{ id: "ht", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Synchronized", value: "1 лок на всё", accent: true }, { id: "wait", kind: "gate", at: { zone: "old", row: 1 }, state: "fail", label: "потоки", detail: "в очереди" }], edges: [] },
        { codeLine: 3, caption: '<code>Concurrent</code>-типы — «both thread-safe and <span class="hl">scalable</span>»: часть использует fine-grained locking (лок на сегмент, не на всё).', nodes: [{ id: "ht", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Synchronized", value: "1 лок" }, { id: "cd", kind: "obj", at: { zone: "conc", row: 0 }, typeTag: "ConcurrentDict", value: "лок на сегмент", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>ConcurrentQueue</code>/<code>ConcurrentStack</code> — <span class="hl">вообще без локов</span>: «rely on <code>Interlocked</code> operations». Атомарные CAS-операции вместо блокировок.', nodes: [{ id: "cd", kind: "obj", at: { zone: "conc", row: 0 }, typeTag: "ConcurrentDict", value: "fine-grained" }, { id: "cq", kind: "gate", at: { zone: "conc", row: 1 }, state: "ok", label: "Queue/Stack", detail: "Interlocked", accent: true }], edges: [] },
      ],
      explain: 'Ось урока — цена синхронизации. Старый путь: «These classes provide some thread safety through the <code>Synchronized</code> property… The wrapper works by <b>locking the entire collection</b> on every add or remove operation… This process isn\'t scalable». Новый: «The <code>System.Collections.Concurrent</code> namespace includes several collection classes that are both <b>thread-safe and scalable</b>… without requiring additional synchronization in user code». Внутри — «lightweight synchronization mechanisms such as <code>SpinLock</code>, <code>SpinWait</code>…» (busy-spinning вместо дорогого kernel-перехода), а <code>ConcurrentQueue&lt;T&gt;</code> и <code>ConcurrentStack&lt;T&gt;</code> «don\'t use locks at all. Instead, they rely on <code>Interlocked</code> operations». Миф «concurrent = lock вокруг обычной» — ровно то, чего эти типы избегают.',
      sources: ["ms-threadsafe"],
    },
    {
      id: "s2", num: "02", kicker: "Роли · какой тип для чего", title: "Dictionary, Queue, Stack, Bag, BlockingCollection",
      viewBox: "0 0 340 210", zones: ROLES_ZONES,
      code: ["ConcurrentDictionary<K,V> // потокобезоп. пары", "ConcurrentQueue<T>        // FIFO, lock-free", "ConcurrentStack<T>        // LIFO, lock-free", "ConcurrentBag<T>          // неупорядоч., дубли ок", "BlockingCollection<T>     // producer-consumer"],
      scenes: [
        { codeLine: 0, caption: '<code>ConcurrentDictionary</code> — «Thread-safe implementation of a dictionary». <code>ConcurrentQueue</code> — FIFO, <code>ConcurrentStack</code> — LIFO.', nodes: [{ id: "cd", kind: "chip", at: { zone: "roles", row: 0, col: 0 }, value: "Dictionary K/V" }, { id: "cq", kind: "chip", at: { zone: "roles", row: 0, col: 1 }, value: "Queue FIFO" }, { id: "cs", kind: "chip", at: { zone: "roles", row: 0, col: 2 }, value: "Stack LIFO", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>ConcurrentBag</code> — «unordered collection», <b>допускает дубликаты</b>; оптимизирован под «тот же поток и кладёт, и берёт».', nodes: [{ id: "cd", kind: "chip", at: { zone: "roles", row: 0, col: 0 }, value: "Dictionary" }, { id: "cq", kind: "chip", at: { zone: "roles", row: 0, col: 1 }, value: "Queue" }, { id: "cs", kind: "chip", at: { zone: "roles", row: 0, col: 2 }, value: "Stack" }, { id: "bag", kind: "obj", at: { zone: "roles", row: 1, col: 0 }, typeTag: "Bag", value: "дубли ок", accent: true }], edges: [] },
        { codeLine: 4, caption: '<code>BlockingCollection</code> — не хранилище, а <span class="hl">надстройка</span> producer-consumer над любым <code>IProducerConsumerCollection</code> (по умолчанию — <code>ConcurrentQueue</code>).', nodes: [{ id: "bag", kind: "obj", at: { zone: "roles", row: 0, col: 0 }, typeTag: "Bag", value: "дубли" }, { id: "bc", kind: "obj", at: { zone: "roles", row: 1, col: 0 }, typeTag: "BlockingCollection", value: "bounding/blocking", accent: true }, { id: "inner", kind: "chip", at: { zone: "roles", row: 1, col: 1 }, value: "→ ConcurrentQueue" }], edges: [{ id: "e1", from: "bc", to: "inner", accent: true }] },
      ],
      explain: 'Пять ролей в <code>System.Collections.Concurrent</code>: <code>ConcurrentDictionary&lt;TKey,TValue&gt;</code> — «Thread-safe implementation of a dictionary of key-value pairs»; <code>ConcurrentQueue&lt;T&gt;</code> — FIFO; <code>ConcurrentStack&lt;T&gt;</code> — LIFO; <code>ConcurrentBag&lt;T&gt;</code> — «unordered collection of elements» (допускает дубликаты, оптимизирован под «тот же поток produce+consume»); <code>BlockingCollection&lt;T&gt;</code> — «Provides bounding and blocking functionality for any type that implements <code>IProducerConsumerCollection&lt;T&gt;</code>». Важное уточнение: <code>BlockingCollection</code> — не самостоятельное хранилище, а обёртка над внутренней коллекцией (по умолчанию <code>ConcurrentQueue</code>, можно <code>ConcurrentStack</code>), добавляющая ёмкость и блокировку на пустой/полной.',
      sources: ["ms-threadsafe"],
    },
    {
      id: "s3", num: "03", kicker: "GetOrAdd · не атомарен", title: "valueFactory вызывается ВНЕ лока",
      viewBox: "0 0 340 210", zones: GETORADD_ZONES,
      code: ["cd.GetOrAdd(key, k => Compute(k));", "// запись в словарь — под fine-grained локом", "// НО Compute (valueFactory) — вне лока", "// под гонкой может вызваться несколько раз"],
      predictAt: 1, predictQ: 'Один поток: <code>GetOrAdd(2, k=>100)</code>, затем <code>GetOrAdd(2, k=>999)</code>. Сколько раз выполнится фабрика суммарно?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Свежий ключ: фабрика <code>k=>100</code> считает значение, оно вставляется под локом — вернулось <span class="hl">100</span>.', nodes: [{ id: "l", kind: "gate", at: { zone: "lock", row: 0 }, state: "ok", label: "insert 100", detail: "под локом", accent: true }, { id: "f1", kind: "chip", at: { zone: "fact", row: 0 }, value: "factory: run" }], edges: [] },
        { codeLine: 1, out: "", caption: 'Тот же ключ уже есть: <code>GetOrAdd(2, k=>999)</code> вернёт <span class="hl">существующее 100</span>, а фабрику <b>не вызовет</b> — «The existing value is returned».', nodes: [{ id: "l", kind: "gate", at: { zone: "lock", row: 0 }, state: "ok", label: "ключ есть", detail: "вернуть 100" }, { id: "f2", kind: "gate", at: { zone: "fact", row: 0 }, state: "fail", label: "factory", detail: "не вызвана", accent: true }], edges: [] },
        { codeLine: 3, out: "100 100 factoryRuns=1", caption: 'Итог одного потока: <b>100 100 factoryRuns=1</b>. Но фабрика <span class="wrong">вне лока</span> — под гонкой многих потоков может выполниться и несколько раз (реальный прогон).', nodes: [{ id: "r", kind: "gate", at: { zone: "lock", row: 0 }, state: "ok", label: "1 пара", detail: "в словаре", accent: true }, { id: "race", kind: "chip", at: { zone: "fact", row: 0 }, value: "гонка: N раз" }], edges: [] },
      ],
      explain: 'Тонкость <code>GetOrAdd</code>: «For modifications and write operations… <code>ConcurrentDictionary</code> uses <b>fine-grained locking</b>… However, the <code>valueFactory</code> delegate is called <b>outside the locks</b> to avoid the problems that can arise from executing unknown code under a lock. Therefore, <code>GetOrAdd</code> is <b>not atomic</b> with regards to all other operations». Следствие: «If you call <code>GetOrAdd</code> simultaneously on different threads, <code>valueFactory</code> may be called <b>multiple times</b>, but only <b>one</b> key/value pair will be added». В один поток всё просто: свежий ключ → фабрика выполняется, значение вставляется; существующий → «The existing value is returned», фабрика не зовётся (реальный прогон: <code>100 100 factoryRuns=1</code>). Практический вывод: фабрика должна быть <b>идемпотентной и дешёвой</b> — на неё нельзя вешать побочные эффекты «ровно один раз».',
      sources: ["ms-getoradd"],
    },
    {
      id: "s4", num: "04", kicker: "Машинная панель · реальный замер", title: "Энумератор ConcurrentQueue — снимок: 3, пока очередь 4",
      viewBox: "0 0 340 210", zones: SNAP_ZONES,
      code: ["q.Enqueue(1); q.Enqueue(2); q.Enqueue(3);", "var e = q.GetEnumerator();   // снимок здесь", "q.Enqueue(4);                // добавили ПОСЛЕ", "while (e.MoveNext()) count++; // снимок видит 1,2,3"],
      predictAt: 2, predictQ: 'После <code>GetEnumerator()</code> добавили 4-й элемент. Сколько насчитает энумератор?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'В очереди <b>1, 2, 3</b>. Вызов <code>GetEnumerator()</code> берёт <span class="hl">снимок</span> содержимого — «a moment-in-time snapshot».', nodes: [{ id: "e1", kind: "slot", at: { zone: "enum", row: 0 }, name: "снимок", value: "1 2 3", accent: true }, { id: "l1", kind: "slot", at: { zone: "live", row: 0 }, name: "очередь", value: "1 2 3" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>q.Enqueue(4)</code> <span class="wrong">после</span> <code>GetEnumerator()</code>: живая очередь стала <b>1,2,3,4</b>, но снимок не меняется.', nodes: [{ id: "e1", kind: "slot", at: { zone: "enum", row: 0 }, name: "снимок", value: "1 2 3 (заморожен)" }, { id: "l1", kind: "slot", at: { zone: "live", row: 0 }, name: "очередь", value: "1 2 3 4", accent: true }], edges: [] },
        { codeLine: 3, out: "snapshot-count=3 live-count=4", caption: 'Энумератор насчитал <span class="hl">3</span>, а <code>q.Count</code> = <b>4</b>: «It does <b>not reflect any updates</b> to the collection after <code>GetEnumerator</code> was called». Снимок ≠ живая коллекция (реальный прогон).', nodes: [{ id: "s", kind: "gate", at: { zone: "enum", row: 0 }, state: "ok", label: "snapshot", detail: "3", accent: true }, { id: "lv", kind: "gate", at: { zone: "live", row: 0 }, state: "fail", label: "live Count", detail: "4", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятое поведение энумерации. У <code>ConcurrentQueue&lt;T&gt;</code>: «The enumeration represents a <b>moment-in-time snapshot</b> of the contents of the queue. It does <b>not reflect any updates</b> to the collection after <code>GetEnumerator</code> was called. The enumerator is <b>safe to use concurrently</b> with reads from and writes to the queue». Реальный прогон: взяли энумератор на очереди <code>{1,2,3}</code>, добавили 4-й — энумератор насчитал <b>3</b>, а <code>Count</code> уже <b>4</b>. Важная асимметрия: у <code>ConcurrentQueue</code>/<code>ConcurrentBag</code> — снимок, а у <code>ConcurrentDictionary</code> — <b>наоборот</b>: энумератор не снимок и может отражать изменения после <code>GetEnumerator</code>. Поэтому «<code>foreach</code> по любой concurrent-коллекции даёт консистентный снимок» — миф: зависит от типа.',
      sources: ["ms-queue-enum"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Один поток: <code>int f=0; int v1=cd.GetOrAdd(2, k=>{f++; return 100;}); int v2=cd.GetOrAdd(2, k=>{f++; return 999;}); WriteLine($"{v1} {v2} factoryRuns={f}");</code> — что напечатает?',
      options: ["100 100 factoryRuns=1", "100 999 factoryRuns=2", "100 100 factoryRuns=2", "999 999 factoryRuns=1"], correctIndex: 0, xp: 10,
      okText: 'Свежий ключ 2 → фабрика даёт 100 (f=1). Второй вызов: ключ уже есть → «The existing value is returned» = 100, фабрика <b>не вызвана</b>. Итог: <b>100 100 factoryRuns=1</b>.',
      noText: 'Для существующего ключа <code>GetOrAdd</code> возвращает старое значение и фабрику не зовёт. v1=100 (фабрика), v2=100 (existing), factoryRuns=<b>1</b>. Вывод: <b>100 100 factoryRuns=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "100 100 factoryRuns=1" }, sourceRefs: ["ms-getoradd"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var q = new ConcurrentQueue&lt;int&gt;(); q.Enqueue(1); q.Enqueue(2); q.Enqueue(3); var e = q.GetEnumerator(); q.Enqueue(4); int c=0; while(e.MoveNext()) c++; WriteLine($"snapshot-count={c} live-count={q.Count}");</code> — что напечатает?',
      options: ["snapshot-count=3 live-count=4", "snapshot-count=4 live-count=4", "snapshot-count=3 live-count=3", "snapshot-count=4 live-count=3"], correctIndex: 0, xp: 10,
      okText: 'Энумератор — «moment-in-time snapshot»: заморожен на <b>3</b> элементах до <code>GetEnumerator</code>. <code>Enqueue(4)</code> после не виден → snapshot=3, а <code>Count</code>=<b>4</b>.',
      noText: 'Снимок «does not reflect any updates to the collection after GetEnumerator was called». 4-й элемент добавлен позже — энумератор его не видит (3), живая очередь — 4. Вывод: <b>snapshot-count=3 live-count=4</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "snapshot-count=3 live-count=4" }, sourceRefs: ["ms-queue-enum"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var cd = new ConcurrentDictionary&lt;int,int&gt;(); var q = new ConcurrentQueue&lt;int&gt;(); WriteLine($"dict.IsSynchronized={((ICollection)cd).IsSynchronized} queue.IsSynchronized={((ICollection)q).IsSynchronized}");</code> — что напечатает?',
      options: ["dict.IsSynchronized=False queue.IsSynchronized=False", "dict.IsSynchronized=True queue.IsSynchronized=True", "dict.IsSynchronized=True queue.IsSynchronized=False", "dict.IsSynchronized=False queue.IsSynchronized=True"], correctIndex: 0, xp: 10,
      okText: 'У concurrent-типов <code>IsSynchronized</code> — всегда <b>False</b>: свойство нерелевантно, синхронизация встроена иначе. <code>lock(coll.SyncRoot)</code> их не синхронизирует (в .NET 10 SyncRoot даже бросает).',
      noText: 'Концепт «эти свойства нерелевантны»: <code>IsSynchronized</code> всегда <code>false</code> для обоих. Итог: <b>dict.IsSynchronized=False queue.IsSynchronized=False</b>. Потокобезопасность у concurrent-типов не через ICollection-синхронизацию.',
      verify: { kind: "exec", run: "dotnet run", expect: "dict.IsSynchronized=False queue.IsSynchronized=False" }, sourceRefs: ["ms-threadsafe"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Цена синхронизации", v: 'Старая <code>Synchronized</code>-обёртка лочит <b>всю</b> коллекцию (не масштабируется). Concurrent-типы — fine-grained locking, а <code>ConcurrentQueue</code>/<code>Stack</code> «don\'t use locks at all… <code>Interlocked</code>». Только читаешь? Бери <code>System.Collections.Generic</code>.' },
    { icon: "cost", k: "GetOrAdd не атомарен", v: '<code>valueFactory</code> зовётся <b>вне лока</b>: «not atomic», под гонкой «may be called multiple times, but only one key/value pair will be added». Фабрика должна быть идемпотентной. В один поток: <b>100 100 factoryRuns=1</b>.' },
    { icon: "avoid", k: "Снимок зависит от типа", v: 'Энумератор <code>ConcurrentQueue</code>/<code>Bag</code> — «moment-in-time snapshot» (реальный замер: <b>3</b> vs live <b>4</b>). У <code>ConcurrentDictionary</code> — <b>не</b> снимок. <code>IsSynchronized</code>=false; <code>SyncRoot</code> в .NET 10 бросает.' },
  ],

  foot: 'урок · <b>Concurrent-коллекции</b> · 4 разбора · fine-grained/lock-free/GetOrAdd · панель снимка 3 vs 4 · дизайн <b>mid</b>',
};
