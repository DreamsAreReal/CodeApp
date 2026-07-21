/**
 * Lesson: The lock statement + System.Threading.Lock (.NET 9+) (CS.S8.lock-statement) — expert
 * density, 5 animated deep-dives. lock acquires a mutual-exclusion lock, runs a block, releases it;
 * at most one thread is in the body at a time; a holder can re-enter (recursively); the lock is
 * released even on exception because it lowers to a try/finally. In .NET 9 / C# 13 a dedicated
 * System.Threading.Lock instance makes lock lower to Lock.EnterScope() (a ref-struct Scope), which
 * is faster and prevents locking the wrong object. You can't await inside a lock body.
 *
 * SIGNATURE machine panel (s5): a System.Threading.Lock reports IsHeldByCurrentThread as False
 * outside / True inside / False after — REAL run-csharp measurement (this file's exec cards):
 * "False True False".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (lock statement, Lock class),
 *     fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (all tasks
 *     WaitAll-ed before printing): c1 "balance=2000" · c2 "False True False" · c3 "depth=3 held=False".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.lock-statement/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: mutual exclusion — one thread in the body.
const Z_CRIT: Zone = { id: "crit", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "lock (x) { … } · КРИТИЧЕСКАЯ СЕКЦИЯ", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "не более одного потока в теле", subCls: "vz-zsub good", subY: 40 };
const CRIT_ZONES: Zone[] = [Z_CRIT];

// s2: lowering to Monitor.Enter/Exit in try/finally.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЧТО ПИШЕШЬ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "lock (x) { … }", subCls: "vz-zsub", subY: 47 };
const Z_LOW: Zone = { id: "low", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ВО ЧТО ЛОУЭРИТСЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Monitor + try/finally", subCls: "vz-zsub heap", subY: 47 };
const LOW_ZONES: Zone[] = [Z_SRC, Z_LOW];

// s3: System.Threading.Lock -> EnterScope (.NET 9+).
const Z_OBJLOCK: Zone = { id: "objlock", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "object (старое)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Monitor.Enter/Exit", subCls: "vz-zsub", subY: 47 };
const Z_TLOCK: Zone = { id: "tlock", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Lock (.NET 9+)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "EnterScope() · ref struct", subCls: "vz-zsub good", subY: 47 };
const TLOCK_ZONES: Zone[] = [Z_OBJLOCK, Z_TLOCK];

// s4: what NOT to lock on.
const Z_BAD: Zone = { id: "bad", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕ БЛОКИРУЙ НА", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "this / typeof / string", subCls: "vz-zsub heap", subY: 47 };
const Z_GOOD: Zone = { id: "good", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "БЛОКИРУЙ НА", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "выделенном Lock", subCls: "vz-zsub good", subY: 47 };
const BAD_ZONES: Zone[] = [Z_BAD, Z_GOOD];

// s5 (SIGNATURE): IsHeldByCurrentThread outside/inside/after.
const Z_STATE: Zone = { id: "state", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "IsHeldByCurrentThread · до / внутри / после", labelCls: "vz-zlabel sm", lx: 170, ly: 22, sub: "владение потока входит и выходит", subCls: "vz-zsub", subY: 40 };
const STATE_ZONES: Zone[] = [Z_STATE];

export const lockStatement: LessonData = {
  id: "CS.S8.lock-statement",
  track: "CS",
  section: "CS.S8",
  module: "S8.3",
  lang: "csharp",
  title: "lock и System.Threading.Lock (.NET 9+)",
  kicker: "C# вглубь · S8 · взаимное исключение",
  home: { subtitle: "lock → Monitor/EnterScope, реентерабельность, что не лочить", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.managed-threading-basics"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-lock", kind: "doc", org: "Microsoft Learn", title: "The lock statement", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock", date: "2026-01-20" },
    { id: "ms-locktype", kind: "doc", org: "Microsoft Learn", title: "Lock Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.lock", date: "2026-01-20" },
    { id: "ms-basics", kind: "doc", org: "Microsoft Learn", title: "Managed threading basics", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics", date: "2026-07-07" },
  ],

  spec: [
    { text: "«The lock statement acquires the mutual-exclusion lock for a given object, executes a statement block, and then releases the lock.» <span class=\"ru-tr\">«Оператор <code>lock</code> захватывает взаимно-исключающую блокировку для заданного объекта, выполняет блок операторов, а затем освобождает блокировку.»</span> — «The lock statement ensures that at most only one thread executes its body at any moment in time». <span class=\"ru-tr\">«Оператор <code>lock</code> гарантирует, что в любой момент времени его тело выполняет не более одного потока».</span>", source: "ms-lock" },
    { text: "Реентерабельность: «While a lock is held, the thread that holds the lock can acquire and release the lock multiple times.» <span class=\"ru-tr\">«Пока блокировка удерживается, поток, который её держит, может захватывать и освобождать блокировку многократно.»</span> Держатель может входить рекурсивно.", source: "ms-lock" },
  ],
  edgeCases: [
    { text: "Внутри тела lock нельзя await: «You can't use the await expression in the body of a lock statement». <span class=\"ru-tr\">«Нельзя использовать выражение <code>await</code> в теле оператора <code>lock</code>».</span>", source: "ms-lock" },
    { text: "Не блокируй на общедоступных объектах: «as callers might also lock this» <span class=\"ru-tr\">«так как вызывающий код тоже может залочить <code>this</code>»</span>, «Type instances, as they might be obtained by the typeof operator or reflection» <span class=\"ru-tr\">«экземпляры <code>Type</code>, так как их можно получить оператором <code>typeof</code> или через рефлексию»</span>, «string instances, including string literals, as they might be interned» <span class=\"ru-tr\">«экземпляры <code>string</code>, включая строковые литералы, так как они могут быть интернированы»</span>. Держи блокировку как можно короче.", source: "ms-lock" },
    { text: "Дедлок при разном порядке захвата: «ensure that all code paths that might enter any two of those locks on the same thread enter them in the same order. Otherwise, it could lead to deadlocks». <span class=\"ru-tr\">«убедитесь, что все пути кода, которые могут войти в любые две из этих блокировок на одном потоке, входят в них в одном и том же порядке. Иначе это может привести к взаимоблокировкам».</span>", source: "ms-locktype" },
  ],

  misconceptions: [
    {
      wrong: "lock — это какой-то рантайм-примитив, и лочить можно на чём угодно, хоть на this",
      hook: '<code>lock</code> — синтаксический сахар: «<span class="hl">The lock statement acquires the mutual-exclusion lock for a given object, executes a statement block, and then releases the lock</span>». <span class="ru-tr">«Оператор <code>lock</code> захватывает взаимно-исключающую блокировку для заданного объекта, выполняет блок операторов, а затем освобождает блокировку».</span> Гарантия: «The lock statement ensures that <span class="hl">at most only one thread executes its body at any moment in time</span>». <span class="ru-tr">«Оператор <code>lock</code> гарантирует, что в любой момент времени его тело выполняет не более одного потока».</span> Оно <b>лоуэрится</b> в <code>Monitor.Enter/Exit</code> (или в <code>Lock.EnterScope()</code> для типа <code>System.Threading.Lock</code>) внутри <code>try/finally</code> — потому «the lock is released <span class="hl">even if an exception is thrown</span>». <span class="ru-tr">«блокировка освобождается даже если выброшено исключение».</span> И объект блокировки важен: «avoid using the following instances as lock objects: <code>this</code>… <code>Type</code> instances… <code>string</code> instances». <span class="ru-tr">«избегайте использования следующих экземпляров как объектов блокировки: <code>this</code>… экземпляры <code>Type</code>… экземпляры <code>string</code>».</span> Дальше <b>пять разборов</b>: взаимное исключение, лоуэринг в Monitor+try/finally, тип <code>Lock</code>→<code>EnterScope</code> (.NET 9), что не лочить, и <b>машинная панель</b> — <code>IsHeldByCurrentThread</code> до/внутри/после реальным прогоном.',
      source: ["ms-lock", "ms-locktype"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Взаимное исключение", title: "lock (x) { … } — не более одного потока в теле",
      viewBox: "0 0 340 210", zones: CRIT_ZONES,
      code: ["lock (_balanceLock)", "{", "    _balance += amount;   // только один поток здесь", "}"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>lock (x)</code> берёт <b>взаимно-исключающую</b> блокировку объекта <code>x</code>. Поток, взявший её, «is said to hold or own the lock». <span class="ru-tr">«о нём говорят, что он держит или владеет блокировкой».</span>', nodes: [{ id: "l", kind: "gate", at: { zone: "crit", row: 0 }, state: "ok", label: "поток A", detail: "держит lock", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Пока A в теле, B <b>ждёт</b>: «Any other thread is <span class="hl">blocked</span> from acquiring the lock and waits until the lock is released». <span class="ru-tr">«Любой другой поток блокируется от захвата этой блокировки и ждёт, пока она не будет освобождена».</span>', nodes: [{ id: "l", kind: "gate", at: { zone: "crit", row: 0 }, state: "ok", label: "поток A", detail: "в теле" }, { id: "b", kind: "gate", at: { zone: "crit", row: 1 }, state: "fail", label: "поток B", detail: "ждёт", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'A выходит — блокировка освобождается, входит B. Гарантия: «<span class="hl">at most only one thread executes its body at any moment in time</span>». <span class="ru-tr">«в любой момент времени тело выполняет не более одного потока».</span>', nodes: [{ id: "b", kind: "gate", at: { zone: "crit", row: 0 }, state: "ok", label: "поток B", detail: "теперь держит", accent: true }], edges: [] },
      ],
      explain: 'Базовый контракт: «<span class="hl">The lock statement acquires the mutual-exclusion lock for a given object, executes a statement block, and then releases the lock</span>. While a lock is held, the thread that holds the lock can acquire and release the lock multiple times. Any other thread is blocked from acquiring the lock and waits until the lock is released. <span class="hl">The lock statement ensures that at most only one thread executes its body at any moment in time</span>». <span class="ru-tr">«Оператор <code>lock</code> захватывает взаимно-исключающую блокировку для заданного объекта, выполняет блок операторов, а затем освобождает блокировку. Пока блокировка удерживается, поток, который её держит, может захватывать и освобождать блокировку многократно. Любой другой поток блокируется от захвата этой блокировки и ждёт, пока она не будет освобождена. Оператор <code>lock</code> гарантирует, что в любой момент времени его тело выполняет не более одного потока».</span> Это и есть «критическая секция»: код, в котором в любой момент — не более одного потока. Объект блокировки — не данные, а «замок»: все потоки, защищающие один и тот же ресурс, должны брать <b>одну и ту же</b> инстанцию.',
      sources: ["ms-lock", "ms-locktype"],
    },
    {
      id: "s2", num: "02", kicker: "Лоуэринг · Monitor", title: "lock (object) → Monitor.Enter/Exit в try/finally",
      viewBox: "0 0 340 210", zones: LOW_ZONES,
      code: ["lock (x) { /* ... */ }   // что ты пишешь", "// ↓ компилятор разворачивает в ↓", "Monitor.Enter(x, ref taken);", "try { /* ... */ } finally { if (taken) Monitor.Exit(x); }"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Пишешь <code>lock (x) { … }</code> над <code>object</code> (или reference type до C# 13).', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "lock (x)", value: "sugar", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Компилятор разворачивает в <code>Monitor.Enter(x, ref taken)</code> — захват — внутри <code>try</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "lock (x)", value: "sugar" }, { id: "e", kind: "obj", at: { zone: "low", row: 0 }, typeTag: "Monitor.Enter", value: "try {", accent: true }], edges: [{ id: "e1", from: "s", to: "e", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>finally</code> зовёт <code>Monitor.Exit</code> — потому «the lock is released <span class="hl">even if an exception is thrown</span> within the body». <span class="ru-tr">«блокировка освобождается даже если в теле выброшено исключение».</span>', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "lock (x)", value: "sugar" }, { id: "e", kind: "obj", at: { zone: "low", row: 0 }, typeTag: "Monitor.Enter", value: "try {" }, { id: "x", kind: "gate", at: { zone: "low", row: 1 }, state: "ok", label: "finally: Monitor.Exit", detail: "всегда", accent: true }], edges: [] },
      ],
      explain: 'Для reference-объекта <code>lock</code> — это макрос над <code>Monitor</code>: компилятор оборачивает тело в <code>Monitor.Enter(__lockObj, ref __lockWasTaken)</code> внутри <code>try</code>, а в <code>finally</code> зовёт <code>Monitor.Exit</code>. Ключевое следствие <code>try/finally</code>: «<span class="hl">the lock is released even if an exception is thrown within the body of a lock statement</span>». <span class="ru-tr">«блокировка освобождается даже если в теле оператора <code>lock</code> выброшено исключение».</span> Поэтому руками <code>Monitor</code> почти не пишут — <code>lock</code> гарантирует <code>Exit</code> без утечки. И жёсткое ограничение: «<span class="hl">You can\'t use the await expression in the body of a lock statement</span>» <span class="ru-tr">«Нельзя использовать выражение <code>await</code> в теле оператора <code>lock</code>».</span> — блокировка привязана к потоку, а после await код может продолжиться на другом.',
      sources: ["ms-lock"],
    },
    {
      id: "s3", num: "03", kicker: "System.Threading.Lock · .NET 9", title: "Тип Lock → lock лоуэрится в EnterScope() (быстрее)",
      viewBox: "0 0 340 210", zones: TLOCK_ZONES,
      code: ["private readonly System.Threading.Lock _lock = new();  // .NET 9 / C# 13", "lock (_lock) { /* ... */ }", "// ↓ равносильно ↓", "using (_lock.EnterScope()) { /* ... */ }"],
      scenes: [
        { codeLine: 0, out: "", caption: 'В .NET 9 / C# 13 — выделенный <code>System.Threading.Lock</code>: «lock a dedicated object instance of the <code>System.Threading.Lock</code> type for <span class="hl">best performance</span>». <span class="ru-tr">«блокируйте на выделенном экземпляре объекта типа <code>System.Threading.Lock</code> для наилучшей производительности».</span>', nodes: [{ id: "o", kind: "obj", at: { zone: "objlock", row: 0 }, typeTag: "object", value: "Monitor", }, { id: "t", kind: "obj", at: { zone: "tlock", row: 0 }, typeTag: "Lock", value: "new()", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Когда компилятор знает, что <code>x</code> — тип <code>Lock</code>, <code>lock (x)</code> лоуэрится в <code>using (x.EnterScope())</code> — <span class="hl">другой путь</span>, не Monitor.', nodes: [{ id: "t", kind: "obj", at: { zone: "tlock", row: 0 }, typeTag: "Lock", value: "lock (x)" }, { id: "es", kind: "obj", at: { zone: "tlock", row: 1 }, typeTag: "EnterScope()", value: "ref struct Scope", accent: true }], edges: [{ id: "e1", from: "t", to: "es", accent: true }] },
        { codeLine: 3, out: "", caption: 'Возвращённый <code>Scope</code> — <b>ref struct</b> с <code>Dispose()</code>; сгенерированный <code>using</code> освобождает даже при исключении. Тип надо знать <span class="hl">точно</span>: иначе возьмётся Monitor.', nodes: [{ id: "es", kind: "obj", at: { zone: "tlock", row: 0 }, typeTag: "EnterScope()", value: "ref struct Scope" }, { id: "d", kind: "gate", at: { zone: "tlock", row: 1 }, state: "ok", label: "using → Dispose", detail: "release", accent: true }], edges: [] },
      ],
      explain: 'С .NET 9 / C# 13 появился специализированный тип <code>System.Threading.Lock</code>. «<span class="hl">The variable x is an expression of System.Threading.Lock type, or a reference type</span>… it\'s precisely equivalent to: <code>using (x.EnterScope())</code>». <span class="ru-tr">«Переменная x — это выражение типа <code>System.Threading.Lock</code> или ссылочного типа… это в точности равносильно: <code>using (x.EnterScope())</code>».</span> Что возвращает EnterScope: «<span class="hl">The object returned by <code>Lock.EnterScope()</code> is a ref struct that includes a <code>Dispose()</code> method</span>. The generated using statement ensures the scope is released even if an exception is thrown within the body of the lock statement». <span class="ru-tr">«Объект, возвращаемый <code>Lock.EnterScope()</code>, — это ref struct, включающий метод <code>Dispose()</code>. Сгенерированный оператор <code>using</code> гарантирует, что область освобождается даже если в теле оператора <code>lock</code> выброшено исключение».</span> Тип должен совпадать буквально: «<span class="hl">the type of the expression must be precisely System.Threading.Lock</span>… <span class="hl">If the type of the expression is anything else, such as Object or a generic type like T</span>… <span class="hl">a different implementation that is not interchangeable can be used instead</span>». <span class="ru-tr">«тип выражения должен быть в точности <code>System.Threading.Lock</code>… Если тип выражения любой другой, например <code>Object</code> или обобщённый тип вроде <code>T</code>… может быть использована другая, невзаимозаменяемая реализация».</span> Отсюда предупреждение компилятора при касте <code>Lock</code> к другому типу.',
      sources: ["ms-lock", "ms-locktype"],
    },
    {
      id: "s4", num: "04", kicker: "Что НЕ лочить", title: "Не this / typeof / string — только выделенный замок",
      viewBox: "0 0 340 210", zones: BAD_ZONES,
      code: ["lock (this)          // ⛔ вызывающий тоже может лочить this", "lock (typeof(Foo))   // ⛔ один Type на домен", "lock (\"key\")         // ⛔ строки интернируются", "lock (_dedicatedLock) // ✅ приватный выделенный"],
      predictAt: 3, predictQ: 'Почему <code>lock(this)</code>, <code>lock(typeof(Foo))</code> и <code>lock("key")</code> опасны, а <code>lock(_dedicatedLock)</code> — правильно?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>lock (this)</code> — плохо: «<span class="hl">as callers might also lock this</span>» <span class="ru-tr">«так как вызывающий код тоже может залочить <code>this</code>»</span> → чужой код может взять ту же блокировку и словить дедлок.', nodes: [{ id: "t", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "this", detail: "чужой lock", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>typeof</code> — плохо: «<span class="hl">Type instances</span>, as they might be obtained by the <code>typeof</code> operator or reflection» <span class="ru-tr">«экземпляры <code>Type</code>, так как их можно получить оператором <code>typeof</code> или через рефлексию»</span> → глобально доступен.', nodes: [{ id: "t", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: "this", detail: "чужой lock" }, { id: "ty", kind: "gate", at: { zone: "bad", row: 1 }, state: "fail", label: "typeof(Foo)", detail: "один на домен", accent: true }], edges: [] },
        { codeLine: 3, out: "используй _dedicatedLock", caption: 'Строки интернируются (общие); правильно — <span class="hl">приватный выделенный</span> замок, ни для чего другого. «Avoid using the same lock object instance for different shared resources». <span class="ru-tr">«Избегайте использования одного и того же экземпляра объекта блокировки для разных разделяемых ресурсов».</span>', nodes: [{ id: "s", kind: "gate", at: { zone: "bad", row: 0 }, state: "fail", label: '"key" string', detail: "interned" }, { id: "d", kind: "gate", at: { zone: "good", row: 0 }, state: "ok", label: "_dedicatedLock", detail: "private", accent: true }], edges: [] },
      ],
      explain: 'Объект блокировки должен быть приватным и «ничьим больше»: «<span class="hl">lock on a dedicated object instance that isn\'t used for another purpose</span>. <span class="hl">Avoid using the same lock object instance for different shared resources</span>, as it might result in deadlock or lock contention». <span class="ru-tr">«блокируйте на выделенном экземпляре объекта, который не используется для другой цели. Избегайте использования одного и того же экземпляра объекта блокировки для разных разделяемых ресурсов, так как это может привести к взаимоблокировке или конкуренции за блокировку».</span> Конкретный список: «as callers might also lock this» <span class="ru-tr">«так как вызывающий код тоже может залочить <code>this</code>»</span>, «Type instances, as they might be obtained by the typeof operator or reflection» <span class="ru-tr">«экземпляры <code>Type</code>, так как их можно получить оператором <code>typeof</code> или через рефлексию»</span>, «string instances, including string literals, as they might be interned» <span class="ru-tr">«экземпляры <code>string</code>, включая строковые литералы, так как они могут быть интернированы»</span>. Все три «плохих» варианта <b>публично достижимы</b> — чужой код может взять ту же блокировку. Ещё правило: «<span class="hl">Hold a lock for as short time as possible to reduce lock contention</span>». <span class="ru-tr">«Удерживайте блокировку как можно меньшее время, чтобы снизить конкуренцию за блокировку».</span> В .NET 9 берут <code>System.Threading.Lock</code>, до — приватный <code>object</code>.',
      sources: ["ms-lock"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · владение", title: "IsHeldByCurrentThread: False до, True внутри, False после",
      viewBox: "0 0 340 210", zones: STATE_ZONES,
      code: ["var l = new Lock();", "bool outside = l.IsHeldByCurrentThread;   // до входа", "lock (l) { bool inside = l.IsHeldByCurrentThread; }  // внутри", "bool after = l.IsHeldByCurrentThread;     // после выхода"],
      predictAt: 3, predictQ: 'Тройка <code>IsHeldByCurrentThread</code> у <code>Lock</code> в точках «до / внутри / после <code>lock</code>» — что напечатает?',  console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'До входа поток блокировку <b>не</b> держит: <code>IsHeldByCurrentThread == False</code>.', nodes: [{ id: "o", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "fail", label: "до lock", detail: "False", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Внутри тела <code>lock (l)</code> поток <span class="hl">владеет</span>: <code>True</code>. «A thread that enters a lock is said to hold or own the lock until it exits the lock». <span class="ru-tr">«О потоке, вошедшем в блокировку, говорят, что он держит или владеет ею, пока не выйдет из блокировки».</span>', nodes: [{ id: "o", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "fail", label: "до", detail: "False" }, { id: "i", kind: "gate", at: { zone: "state", row: 0, col: 1 }, state: "ok", label: "внутри lock", detail: "True", accent: true }], edges: [] },
        { codeLine: 3, out: "False True False", caption: 'После выхода снова <b>False</b>. Панель: <span class="hl">False True False</span> (реальный прогон) — владение входит и выходит ровно на границах <code>lock</code>.', nodes: [{ id: "o", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "fail", label: "до", detail: "False" }, { id: "i", kind: "gate", at: { zone: "state", row: 0, col: 1 }, state: "ok", label: "внутри", detail: "True" }, { id: "a", kind: "gate", at: { zone: "state", row: 0, col: 2 }, state: "fail", label: "после", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — владение блокировкой во времени, снятое <code>IsHeldByCurrentThread</code>. Прогон печатает <b>False True False</b>: до <code>lock</code> поток не владеет, в теле — владеет, после — снова нет. Определение из доков: «<span class="hl">A thread that enters a lock is said to hold or own the lock until it exits the lock. At most one thread can hold a lock at any given time</span>», <span class="ru-tr">«О потоке, вошедшем в блокировку, говорят, что он держит или владеет ею, пока не выйдет из блокировки. В любой заданный момент времени блокировку может держать не более одного потока».</span> а свойство <code>IsHeldByCurrentThread</code> «<span class="hl">Gets a value that indicates whether the lock is held by the current thread</span>». <span class="ru-tr">«Возвращает значение, указывающее, держит ли блокировку текущий поток».</span> Реентерабельность отсюда же: «A thread can <span class="hl">enter a lock multiple times before exiting it, such as recursively</span>» <span class="ru-tr">«Поток может входить в блокировку несколько раз до выхода из неё, например рекурсивно».</span> — но «must exit the lock the same number of times to fully exit the lock». <span class="ru-tr">«должен выйти из блокировки столько же раз, чтобы полностью выйти из неё».</span> Оттого вложенный <code>lock (l)</code> на том же потоке не блокирует сам себя.',
      sources: ["ms-locktype"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>object gate = new object(); decimal balance = 1000; void Credit(decimal a){ lock(gate){ balance += a; } } var tasks = new Task[100]; for (int i=0;i&lt;100;i++) tasks[i]=Task.Run(()=>{ Credit(10); }); Task.WaitAll(tasks); Console.WriteLine($"balance={balance}");</code> — что напечатает?',
      options: ["balance=2000", "balance=1000", "balance (меньше 2000, непредсказуемо)", "balance=100"], correctIndex: 0, xp: 10,
      okText: '100 задач, каждая под <code>lock (gate)</code> добавляет 10; критическая секция исключает lost updates, <code>Task.WaitAll</code> ждёт всех → <b>1000 + 100·10 = 2000</b>.',
      noText: 'Без <code>lock</code> сумма была бы меньше и непредсказуема; с <code>lock</code> «at most only one thread executes its body» <span class="ru-tr">«не более одного потока выполняет его тело»</span> → детерминированные <b>2000</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "balance=2000" }, sourceRefs: ["ms-lock"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var l = new Lock(); bool outside = l.IsHeldByCurrentThread; bool inside; lock(l){ inside = l.IsHeldByCurrentThread; } bool afterr = l.IsHeldByCurrentThread; Console.WriteLine($"{outside} {inside} {afterr}");</code> — что напечатает?',
      options: ["False True False", "False False False", "True True True", "False True True"], correctIndex: 0, xp: 10,
      okText: '<code>IsHeldByCurrentThread</code>: до входа — не владеет (False), в теле <code>lock (l)</code> — владеет (True), после выхода — снова False. Владение ровно на границах <code>lock</code>.',
      noText: 'Поток «<span class="hl">is said to hold or own the lock until it exits the lock</span>». <span class="ru-tr">«о нём говорят, что он держит или владеет блокировкой, пока не выйдет из неё».</span> До/после — False, внутри — True. Реальный вывод: <b>False True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False True False" }, sourceRefs: ["ms-locktype"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var l = new Lock(); int depth = 0; lock(l){ depth++; lock(l){ depth++; lock(l){ depth++; } } } Console.WriteLine($"depth={depth} held={l.IsHeldByCurrentThread}");</code> — что напечатает?',
      options: ["depth=3 held=False", "depth=1 held=False", "depth=3 held=True", "(дедлок / зависает)"], correctIndex: 0, xp: 10,
      okText: '<code>Lock</code> реентерабельна: «A thread can enter a lock multiple times before exiting it, such as recursively» <span class="ru-tr">«Поток может входить в блокировку несколько раз до выхода из неё, например рекурсивно»</span> — вложенные <code>lock (l)</code> на том же потоке не блокируют; <code>depth=3</code>. После полного выхода не удерживается: <b>held=False</b>.',
      noText: 'Тот же поток входит рекурсивно (реентерабельность), не самоблокируясь; выйдя столько же раз — освобождает. Реальный вывод: <b>depth=3 held=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "depth=3 held=False" }, sourceRefs: ["ms-locktype"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что это", v: '<code>lock (x)</code> — «acquires the mutual-exclusion lock … executes a statement block … releases the lock» <span class="ru-tr">«захватывает взаимно-исключающую блокировку … выполняет блок операторов … освобождает блокировку»</span>; «<span class="hl">at most only one thread executes its body</span>». <span class="ru-tr">«не более одного потока выполняет его тело».</span> Лоуэрится в <code>Monitor.Enter/Exit</code> в <code>try/finally</code> (release даже при исключении).' },
    { icon: "cost", k: ".NET 9 Lock", v: 'Выделенный <code>System.Threading.Lock</code> → <code>lock</code> лоуэрится в <code>using (x.EnterScope())</code> (ref struct <code>Scope</code>) — быстрее и «<span class="hl">reduces mistakes from locking the wrong object</span>». <span class="ru-tr">«снижает число ошибок из-за блокировки не того объекта».</span> Тип должен быть «<span class="hl">precisely System.Threading.Lock</span>». <span class="ru-tr">«в точности <code>System.Threading.Lock</code>».</span>' },
    { icon: "avoid", k: "Ловушки", v: 'Не лочь на <code>this</code>/<code>typeof</code>/<code>string</code> (публично достижимы). Нельзя <code>await</code> в теле <code>lock</code>. Реентерабельна (depth=3), владение: <code>IsHeldByCurrentThread</code> = False True False. Разный порядок захвата → дедлок.' },
  ],

  foot: 'урок · <b>lock и System.Threading.Lock</b> · 5 анимир. разборов · панель IsHeldByCurrentThread · дизайн <b>mid</b>',
};
