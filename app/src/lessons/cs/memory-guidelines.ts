/**
 * Lesson: Memory<T> and the ownership model — usage guidelines (CS.S7.memory-guidelines) — expert
 * density, 5 animated deep-dives. Because Span<T> is stack-only it can\'t be used in async; .NET 2.1
 * added Memory<T>, ReadOnlyMemory<T>, IMemoryOwner<T>, MemoryPool<T> — Memory<T> CAN be stored on the
 * managed heap. Buffers follow three concepts: Ownership (a single owner responsible for destruction,
 * transferable), Consumption (one consumer at a time without external synchronization), Lease (how
 * long a component may consume). Rule #1: in a synchronous API prefer Span<T> (Memory<T>.Span converts
 * one way; Span→Memory does not). Lease rules: a void-returning method must not use the Memory<T> after
 * it returns (#3); a Task-returning method must not use it after the Task reaches a terminal state (#4).
 * IMemoryOwner<T>: you must Dispose it OR transfer ownership, not both (#7); accepting it means
 * accepting ownership (#8); MemoryPool<T>.Rent makes the caller the owner (must Dispose).
 *
 * SIGNATURE machine panel (s5): REAL measurements — Memory<T> CAN be a class field (memoryAsClassField=True,
 * unlike Span<T>'s CS8345); Memory<T>.Span exists but Span→Memory does not (memoryHasSpanProp=True
 * spanHasToMemory=False); MemoryPool<T>.Rent gives a disposable IMemoryOwner<T>.
 * evidence/F14/memory-guidelines-exec.txt.
 *
 * Accuracy contract (G7) — verified against memory-t-usage-guidelines (fetch 2026-07-19) +
 * GT-M5-s7.md (SM F7..F14).
 *   - every English quote is VERBATIM from the memory-t-usage-guidelines page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F14/memory-guidelines-exec.txt:
 *     "memoryAsClassField=True"; "memoryHasSpanProp=True spanHasToMemory=False";
 *     "rentGivesDisposableOwner=True lenAtLeast100=True");
 *   - NO GT-M5 myths: MM19 (Span == Memory) — refuted, Memory<T> is the heap/async-capable one with a
 *     one-way Span conversion and an explicit ownership model.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.memory-guidelines/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: why Memory<T>.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Span<T> · только стек", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "непригоден для async", subCls: "vz-zsub heap", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Memory<T> · на куче", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: ".NET 2.1 · годен для async", subCls: "vz-zsub good", subY: 47 };
const WHY_ZONES: Zone[] = [Z_STACK, Z_HEAP];

// s2: ownership / consumption / lease.
const Z_CONCEPTS: Zone = { id: "concepts", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ТРИ КОНЦЕПТА буфера", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "Ownership · Consumption · Lease", subCls: "vz-zsub", subY: 47 };
const CONCEPTS_ZONES: Zone[] = [Z_CONCEPTS];

// s3: Rule #1.
const Z_SYNC: Zone = { id: "sync", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "sync API → Span<T>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Rule #1 · универсальнее, быстрее", subCls: "vz-zsub good", subY: 47 };
const Z_ONEWAY: Zone = { id: "oneway", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Memory.Span →", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "обратной Span→Memory НЕТ", subCls: "vz-zsub heap", subY: 47 };
const RULE1_ZONES: Zone[] = [Z_SYNC, Z_ONEWAY];

// s4: lease rules + IMemoryOwner.
const Z_LEASE: Zone = { id: "lease", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "аренда (lease)", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "void → после return нельзя · Task → после terminal", subCls: "vz-zsub heap", subY: 47 };
const Z_OWNER: Zone = { id: "owner", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IMemoryOwner<T>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Dispose ИЛИ передать (не оба)", subCls: "vz-zsub good", subY: 47 };
const LEASE_ZONES: Zone[] = [Z_LEASE, Z_OWNER];

// s5 (SIGNATURE): real measurement.
const Z_FIELD: Zone = { id: "field", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Memory поле class", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "OK (Span был CS8345)", subCls: "vz-zsub good", subY: 47 };
const Z_CONV: Zone = { id: "conv", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "конверсия односторонняя", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Memory.Span есть, обратно нет", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_FIELD, Z_CONV];

export const memoryGuidelines: LessonData = {
  id: "CS.S7.memory-guidelines",
  track: "CS",
  section: "CS.S7",
  module: "S7.9",
  lang: "csharp",
  title: "Memory<T>: владение, аренда, usage-guidelines",
  kicker: "C# вглубь · S7 · владение буфером",
  home: { subtitle: "Memory на куче, ownership/lease, Rule #1, IMemoryOwner", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.span-memory"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-memguide", kind: "doc", org: "Microsoft Learn", title: "Memory<T> and Span<T> usage guidelines", url: "https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines", date: "2025-04-09" },
  ],

  spec: [
    { text: "«Because these types can only be stored on the stack, they\'re unsuitable for scenarios such as asynchronous method calls. To address this problem, .NET 2.1 added some additional types, including Memory<T>, ReadOnlyMemory<T>, IMemoryOwner<T>, and MemoryPool<T>.»", source: "ms-memguide" },
  ],
  edgeCases: [
    { text: "Три концепта (verbatim): «<b>Ownership</b>. The owner of a buffer instance is responsible for lifetime management… <span class=\"hl\">All buffers have a single owner</span>… Ownership can also be transferred». «<b>Consumption</b>… <span class=\"hl\">Buffers can have one consumer at a time unless some external synchronization mechanism is provided</span>». «<b>Lease</b>. The lease is the length of time that a particular component is allowed to be the consumer of the buffer».", source: "ms-memguide" },
    { text: "Аренда void/Task (verbatim, Rule #3/#4): «If your method accepts <code>Memory<T></code> and returns <code>void</code>, you <span class=\"hl\">must not use the Memory<T> instance after your method returns</span>» и «…returns a Task, you <span class=\"hl\">must not use the Memory<T> instance after the Task transitions to a terminal state</span>».", source: "ms-memguide" },
    { text: "IMemoryOwner (verbatim, Rule #7/#8): «If you have an <code>IMemoryOwner<T></code> reference, you must at some point <span class=\"hl\">dispose of it or transfer its ownership (but not both)</span>»; «If you have an <code>IMemoryOwner<T></code> parameter in your API surface, you are <b>accepting ownership</b> of that instance». MemoryPool<T>.Rent → «The caller becomes the owner… and is responsible for disposing».", source: "ms-memguide" },
  ],

  misconceptions: [
    {
      wrong: "Memory<T> — то же, что Span<T>; можно свободно конвертировать туда-обратно и держать без правил владения",
      hook: 'Мифы про Memory. <span class="wrong">Memory = Span</span> — нет: <code>Span&lt;T&gt;</code> «<span class="hl">can only be stored on the stack</span>» → непригоден для async; <code>Memory&lt;T&gt;</code> — на куче, годен для async. «<span class="wrong">конвертировать туда-обратно</span>» — нет: <code>Memory&lt;T&gt;.Span</code> есть, а «<span class="hl">Span<T>-to-Memory<T> conversion isn\'t possible</span>» (потому Rule #1: в sync-API бери Span). «<span class="wrong">без правил владения</span>» — нет: есть <b>ownership/consumption/lease</b> и аренда (void/Task). Ниже <b>пять разборов</b>: зачем Memory, три концепта, Rule #1, аренда + IMemoryOwner, и <b>машинная панель</b> — реальный замер.',
      source: "ms-memguide",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Зачем Memory<T>", title: "Span стек-только → нельзя в async; Memory — на куче",
      viewBox: "0 0 340 210", zones: WHY_ZONES,
      code: ["// Span<T> can only be stored on the stack → не годен для async", "// .NET 2.1 добавил Memory<T>, ReadOnlyMemory<T>, IMemoryOwner<T>, MemoryPool<T>", "// Memory<T> МОЖНО хранить на managed heap (поле класса, пережить await)"],
      scenes: [
        { codeLine: 0, caption: '<code>Span&lt;T&gt;</code> «<span class="hl">can only be stored on the stack</span>» → «unsuitable for… asynchronous method calls».', nodes: [{ id: "s", kind: "gate", at: { zone: "stack", row: 0 }, state: "fail", label: "Span", detail: "стек · не async", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Чтобы решить это, <span class="hl">.NET 2.1 добавил</span> <code>Memory&lt;T&gt;</code>, <code>ReadOnlyMemory&lt;T&gt;</code>, <code>IMemoryOwner&lt;T&gt;</code>, <code>MemoryPool&lt;T&gt;</code>.', nodes: [{ id: "s", kind: "gate", at: { zone: "stack", row: 0 }, state: "fail", label: "Span", detail: "стек" }, { id: "m", kind: "gate", at: { zone: "heap", row: 0 }, state: "ok", label: ".NET 2.1", detail: "Memory<T> и др.", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>Memory&lt;T&gt;</code> «<span class="hl">can be stored on the managed heap</span>» → годен для async, полей класса; но с правилами владения (разборы 02–04).', nodes: [{ id: "m", kind: "gate", at: { zone: "heap", row: 0 }, state: "ok", label: "Memory<T>", detail: "куча · async OK", accent: true }], edges: [] },
      ],
      explain: 'Зачем нужен <code>Memory&lt;T&gt;</code> (verbatim): «<code>Span&lt;T&gt;</code> and <code>ReadOnlySpan&lt;T&gt;</code> are lightweight memory buffers that wrap references to managed or unmanaged memory. <span class="hl">Because these types can only be stored on the stack, they\'re unsuitable for scenarios such as asynchronous method calls</span>. To address this problem, .NET 2.1 added some additional types, including <code>Memory&lt;T&gt;</code>, <code>ReadOnlyMemory&lt;T&gt;</code>, <code>IMemoryOwner&lt;T&gt;</code>, and <code>MemoryPool&lt;T&gt;</code>… <span class="hl">Unlike <code>Span&lt;T&gt;</code>, <code>Memory&lt;T&gt;</code> can be stored on the managed heap</span>». То есть Memory — «heap-версия» вью: её можно положить в поле класса и пережить <code>await</code> (что Span не может — S7.8, CS8345). Замером в панели подтвердим: <code>Memory</code> как поле класса компилируется. Цена — модель владения (три концепта, разбор 02).',
      sources: ["ms-memguide"],
    },
    {
      id: "s2", num: "02", kicker: "Три концепта", title: "Ownership · Consumption · Lease",
      viewBox: "0 0 340 210", zones: CONCEPTS_ZONES,
      code: ["// Ownership — один владелец, отвечает за уничтожение; можно передать", "// Consumption — один потребитель за раз (без внешней синхронизации)", "// Lease — сколько времени компонент может быть потребителем"],
      scenes: [
        { codeLine: 0, caption: '<b>Ownership</b>: у буфера <span class="hl">единственный владелец</span>, отвечает за уничтожение; владение можно <b>передать</b> (тогда прежний больше не трогает).', nodes: [{ id: "o", kind: "gate", at: { zone: "concepts", row: 0, col: 0 }, state: "ok", label: "Ownership", detail: "1 владелец", accent: true }], edges: [] },
        { codeLine: 1, caption: '<b>Consumption</b>: <span class="hl">один потребитель за раз</span> (если нет внешней синхронизации). Потребитель ≠ обязательно владелец.', nodes: [{ id: "o", kind: "gate", at: { zone: "concepts", row: 0, col: 0 }, state: "ok", label: "Ownership", detail: "1 владелец" }, { id: "c", kind: "gate", at: { zone: "concepts", row: 0, col: 1 }, state: "ok", label: "Consumption", detail: "1 за раз", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Lease</b> (аренда): <span class="hl">сколько времени</span> компонент может быть потребителем. Ключ к правилам void/Task (разбор 04).', nodes: [{ id: "c", kind: "gate", at: { zone: "concepts", row: 0, col: 0 }, state: "ok", label: "Consumption", detail: "1 за раз" }, { id: "l", kind: "gate", at: { zone: "concepts", row: 1, col: 0 }, state: "ok", label: "Lease", detail: "срок потребления", accent: true }], edges: [] },
      ],
      explain: 'Три ядерных концепта (verbatim): «<b>Ownership</b>. The owner of a buffer instance is responsible for lifetime management, including destroying the buffer when it\'s no longer in use. <span class="hl">All buffers have a single owner</span>… Ownership can also be transferred; Component-A can relinquish control… Component-B becomes responsible…». «<b>Consumption</b>. The consumer… is allowed to use the buffer… <span class="hl">Buffers can have one consumer at a time unless some external synchronization mechanism is provided</span>. The active consumer of a buffer isn\'t necessarily the buffer\'s owner». «<b>Lease</b>. The lease is the length of time that a particular component is allowed to be the consumer of the buffer». Смысл: буфер разделяется между компонентами пайплайна, поэтому нужны явные правила «кто владеет / кто сейчас читает-пишет / как долго» — иначе гонки и порча данных.',
      sources: ["ms-memguide"],
    },
    {
      id: "s3", num: "03", kicker: "Rule #1", title: "В синхронном API предпочитай Span<T> (конверсия односторонняя)",
      viewBox: "0 0 340 210", zones: RULE1_ZONES,
      code: ["void Process(Span<int> data)   // Rule #1: sync API → Span<T>, не Memory<T>", "Span<int> s = memory.Span;     // Memory → Span: МОЖНО", "// Span → Memory: НЕЛЬЗЯ (обратной конверсии нет)"],
      predictAt: 1, predictQ: 'У <code>Memory&lt;T&gt;</code> есть <code>.Span</code> (Memory→Span). А есть ли обратная конверсия Span→Memory?', console: true,
      scenes: [
        { codeLine: 0, caption: '<b>Rule #1</b>: в синхронном API бери параметром <span class="hl"><code>Span&lt;T&gt;</code>, а не <code>Memory&lt;T&gt;</code></span> — он универсальнее и быстрее.', nodes: [{ id: "s", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "sync API", detail: "Span<T>", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Memory&lt;T&gt;.Span</code> конвертирует <span class="hl">Memory → Span</span>. Значит, у кого есть Memory, тот сможет вызвать твой Span-метод.', nodes: [{ id: "s", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "Span-параметр", detail: "универсально" }, { id: "o", kind: "gate", at: { zone: "oneway", row: 0 }, state: "ok", label: "Memory.Span", detail: "Memory→Span OK", accent: true }], edges: [] },
        { codeLine: 2, out: "memoryHasSpanProp=True spanHasToMemory=False", caption: 'Но <span class="hl">обратной конверсии Span→Memory НЕТ</span> (замер: memoryHasSpanProp=True spanHasToMemory=False). Потому Span-параметр — самый совместимый.', nodes: [{ id: "o", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "Memory→Span", detail: "True" }, { id: "n", kind: "gate", at: { zone: "oneway", row: 0 }, state: "fail", label: "Span→Memory", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Rule #1 и его обоснование (verbatim): «Rule #1: For a synchronous API, use <code>Span&lt;T&gt;</code> instead of <code>Memory&lt;T&gt;</code> as a parameter if possible». Почему: «<code>Span&lt;T&gt;</code> is more versatile than <code>Memory&lt;T&gt;</code>… also offers better performance… you can use the <code>Memory&lt;T&gt;.Span</code> property to convert a <code>Memory&lt;T&gt;</code> instance to a <code>Span&lt;T&gt;</code>, <span class="hl">although Span<T>-to-Memory<T> conversion isn\'t possible</span>. So if your callers happen to have a <code>Memory&lt;T&gt;</code> instance, they\'ll be able to call your methods with <code>Span&lt;T&gt;</code> parameters anyway». Замер (рефлексия): <code>Memory&lt;int&gt;</code> имеет свойство <code>Span</code>, а у <code>Span&lt;int&gt;</code> нет метода «в Memory» — <b>memoryHasSpanProp=True spanHasToMemory=False</b>. Плюс Span-параметр даёт compile-time-проверки аренды. Итог: <code>Memory</code> берут, когда нужен async / хранение (иначе — <code>Span</code>).',
      sources: ["ms-memguide"],
    },
    {
      id: "s4", num: "04", kicker: "Аренда + IMemoryOwner", title: "Аренда void/Task; IMemoryOwner: Dispose ИЛИ передать",
      viewBox: "0 0 340 210", zones: LEASE_ZONES,
      code: ["void M(Memory<T> b) { ... }   // Rule #3: после return b НЕ использовать (фоном тоже)", "Task M(Memory<T> b) { ... }   // Rule #4: после terminal-состояния Task — нельзя", "IMemoryOwner<T> o = MemoryPool<T>.Shared.Rent();  // caller владеет → o.Dispose()"],
      scenes: [
        { codeLine: 0, caption: '<b>Rule #3</b>: метод с <code>Memory&lt;T&gt;</code> → <code>void</code> <span class="hl">не должен использовать инстанс после return</span> (в т.ч. в фоне — иначе гонка/порча).', nodes: [{ id: "v", kind: "gate", at: { zone: "lease", row: 0 }, state: "fail", label: "void", detail: "после return — нельзя", accent: true }], edges: [] },
        { codeLine: 1, caption: '<b>Rule #4</b>: метод → <code>Task</code> <span class="hl">не должен использовать после terminal-состояния</span> Task (completed/faulted/canceled).', nodes: [{ id: "v", kind: "gate", at: { zone: "lease", row: 0 }, state: "fail", label: "void", detail: "return" }, { id: "t", kind: "gate", at: { zone: "lease", row: 1 }, state: "fail", label: "Task", detail: "после terminal — нельзя", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Rule #7/#8</b>: <code>IMemoryOwner&lt;T&gt;</code> — <span class="hl">Dispose ИЛИ передать владение (не оба)</span>; <code>Rent()</code> делает вызывающего владельцем (обязан Dispose).', nodes: [{ id: "t", kind: "gate", at: { zone: "lease", row: 0 }, state: "fail", label: "аренда", detail: "void/Task" }, { id: "o", kind: "gate", at: { zone: "owner", row: 0 }, state: "ok", label: "IMemoryOwner", detail: "Dispose XOR передать", accent: true }], edges: [] },
      ],
      explain: 'Правила аренды и владения (verbatim). Аренда (концепт lease): «Rule #3: If your method accepts <code>Memory&lt;T&gt;</code> and returns <code>void</code>, <span class="hl">you must not use the Memory<T> instance after your method returns</span>»; «Rule #4: …returns a Task, <span class="hl">you must not use the Memory<T> instance after the Task transitions to a terminal state</span>» (terminal = «completed, faulted, or canceled»). Владение через <code>IMemoryOwner&lt;T&gt;</code>: «Rule #7: If you have an <code>IMemoryOwner&lt;T&gt;</code> reference, you must at some point <span class="hl">dispose of it or transfer its ownership (but not both)</span>»; «Rule #8: If you have an <code>IMemoryOwner&lt;T&gt;</code> parameter in your API surface, you are <b>accepting ownership</b> of that instance». И про пул: «This rule also applies to code that calls factory methods like <code>MemoryPool&lt;T&gt;.Rent</code>. The caller becomes the owner… and is responsible for disposing». Нарушение аренды (напр. фоновая <code>Task.Run</code> с чужой Memory после return) → порча данных.',
      sources: ["ms-memguide"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Memory как поле class; конверсия односторонняя; Rent → owner",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["class Holder { public Memory<int> field; }  // OK (Span был бы CS8345)", "typeof(Memory<int>).GetProperty(\"Span\")  → есть;  Span→Memory → нет", "MemoryPool<int>.Shared.Rent(100)  → IMemoryOwner (IDisposable), caller.Dispose()"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Замер 1: <code>Memory&lt;int&gt;</code> <span class="hl">можно полем класса</span> — компилируется (memoryAsClassField=True). У Span тут был CS8345.', nodes: [{ id: "f", kind: "gate", at: { zone: "field", row: 0 }, state: "ok", label: "Memory поле", detail: "OK", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Замер 2: <code>Memory.Span</code> есть, обратной конверсии нет: <span class="hl">memoryHasSpanProp=True spanHasToMemory=False</span> — основа Rule #1.', nodes: [{ id: "f", kind: "gate", at: { zone: "field", row: 0 }, state: "ok", label: "поле", detail: "OK" }, { id: "c", kind: "gate", at: { zone: "conv", row: 0 }, state: "ok", label: "конверсия", detail: "односторонняя", accent: true }], edges: [] },
        { codeLine: 2, out: "memoryAsClassField=True · memoryHasSpanProp=True spanHasToMemory=False · Rent→disposable owner", caption: 'Замер 3: <code>MemoryPool.Rent</code> → <code>IMemoryOwner</code> (IDisposable), <span class="hl">caller владеет и обязан Dispose</span> (Rule #7). Три факта — реальный рантайм.', nodes: [{ id: "f", kind: "gate", at: { zone: "field", row: 0 }, state: "ok", label: "Memory поле", detail: "True" }, { id: "c", kind: "gate", at: { zone: "conv", row: 0 }, state: "ok", label: "Rent→owner", detail: "Dispose", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — три проверяемых факта про Memory, снятые в рантайме. (1) <b>Куча</b>: <code>class Holder { public Memory&lt;int&gt; field; }</code> компилируется и работает (<code>memoryAsClassField=True</code>, 3/3) — ровно «Memory<T> can be stored on the managed heap», в отличие от Span (там было <code>CS8345</code>). (2) <b>Односторонняя конверсия</b>: <code>typeof(Memory&lt;int&gt;).GetProperty("Span")</code> ≠ null, а у <code>Span&lt;int&gt;</code> нет метода «в Memory»: <code>memoryHasSpanProp=True spanHasToMemory=False</code> — исполняемое подтверждение «Span<T>-to-Memory<T> conversion isn\'t possible», обоснование Rule #1. (3) <b>Владение</b>: <code>MemoryPool&lt;int&gt;.Shared.Rent(100)</code> отдаёт <code>IMemoryOwner&lt;int&gt;</code>, который <code>is IDisposable</code> — «The caller becomes the owner… responsible for disposing» (<code>rentGivesDisposableOwner=True lenAtLeast100=True</code>). Числа реальны; Memory — heap/async-вариант вью с явной моделью владения и аренды.',
      sources: ["ms-memguide"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Holder { public Memory&lt;int&gt; field; } var h = new Holder(); h.field = new int[10]; Console.WriteLine($"memoryAsClassField={h.field.Length==10}");</code> — что напечатает (или ошибка компиляции, как у Span)?',
      options: ["memoryAsClassField=True", "memoryAsClassField=False", "(ошибка компиляции CS8345)", "0"], correctIndex: 0, xp: 10,
      okText: '<code>Memory&lt;T&gt;</code> «<span class="hl">can be stored on the managed heap</span>» → <b>можно полем класса</b> (в отличие от <code>Span&lt;T&gt;</code>, где был CS8345). Печать: <b>memoryAsClassField=True</b>.',
      noText: 'Memory<T> — heap-вариант, годна для полей класса и async. Реальный вывод: <b>memoryAsClassField=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "memoryAsClassField=True" }, sourceRefs: ["ms-memguide"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool memHasSpan = typeof(Memory&lt;int&gt;).GetProperty("Span") != null; bool spanHasAsMemory = typeof(Span&lt;int&gt;).GetMethods().Any(m =&gt; m.Name.Contains("Memory")); Console.WriteLine($"memoryHasSpanProp={memHasSpan} spanHasToMemory={spanHasAsMemory}");</code> — что напечатает?',
      options: ["memoryHasSpanProp=True spanHasToMemory=False", "memoryHasSpanProp=True spanHasToMemory=True", "memoryHasSpanProp=False spanHasToMemory=True", "memoryHasSpanProp=False spanHasToMemory=False"], correctIndex: 0, xp: 10,
      okText: '<code>Memory.Span</code> есть (Memory→Span), но «<span class="hl">Span<T>-to-Memory<T> conversion isn\'t possible</span>» → у Span нет обратного. Печать: <b>memoryHasSpanProp=True spanHasToMemory=False</b>. Отсюда Rule #1 (sync API → Span).',
      noText: 'Конверсия односторонняя: Memory→Span да, Span→Memory нет. Реальный вывод: <b>memoryHasSpanProp=True spanHasToMemory=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "memoryHasSpanProp=True spanHasToMemory=False" }, sourceRefs: ["ms-memguide"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>IMemoryOwner&lt;int&gt; owner = MemoryPool&lt;int&gt;.Shared.Rent(100); bool isOwner = owner is IDisposable; int len = owner.Memory.Length; owner.Dispose(); Console.WriteLine($"rentGivesDisposableOwner={isOwner} lenAtLeast100={len&gt;=100}");</code> — что напечатает?',
      options: ["rentGivesDisposableOwner=True lenAtLeast100=True", "rentGivesDisposableOwner=False lenAtLeast100=True", "rentGivesDisposableOwner=True lenAtLeast100=False", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>MemoryPool&lt;T&gt;.Rent</code> → <code>IMemoryOwner&lt;T&gt;</code> (это <code>IDisposable</code>): «<span class="hl">The caller becomes the owner… responsible for disposing</span>» (Rule #7). Печать: <b>rentGivesDisposableOwner=True lenAtLeast100=True</b>.',
      noText: 'Rent делает вызывающего владельцем IMemoryOwner (обязан Dispose). Реальный вывод: <b>rentGivesDisposableOwner=True lenAtLeast100=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "rentGivesDisposableOwner=True lenAtLeast100=True" }, sourceRefs: ["ms-memguide"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Memory на куче", v: 'Span «<span class="hl">can only be stored on the stack</span>» (не async); <b>.NET 2.1</b> добавил <code>Memory&lt;T&gt;</code> (+ReadOnlyMemory/IMemoryOwner/MemoryPool), который «can be stored on the managed heap» → поле класса, async (замер: memoryAsClassField=True).' },
    { icon: "cost", k: "Rule #1 · односторонняя конверсия", v: 'sync API → <b>Span<T></b> (универсальнее, быстрее). <code>Memory.Span</code> есть, но «<span class="hl">Span<T>-to-Memory<T> conversion isn\'t possible</span>» (замер: True/False). Memory берут для async/хранения.' },
    { icon: "avoid", k: "аренда + владение", v: 'Три концепта: ownership (1 владелец) · consumption (1 за раз) · lease. <code>void</code> → после return Memory не трогать (#3); <code>Task</code> → после terminal (#4). <code>IMemoryOwner</code>: <span class="hl">Dispose ИЛИ передать, не оба</span> (#7); <code>Rent</code> → caller владеет (замер).' },
  ],

  foot: 'урок · <b>Memory<T> · владение и аренда</b> · 5 анимир. разборов · панель реального замера (поле, конверсия, Rent) · дизайн <b>mid</b>',
};
