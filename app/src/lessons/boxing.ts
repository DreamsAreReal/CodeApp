/**
 * Lesson: Boxing и unboxing (T1.M3.boxing) — expert density, 7 animated deep-dives.
 * Ported verbatim from docs/research/concepts/lesson-boxing (the LOCKED density
 * exemplar). Every claim carries a source id; all facts verified word-for-word
 * against learn.microsoft.com + the IL OpCodes reference (see `sources`).
 *
 * Loop: card `c1` maps to backend review item `T1.M3.boxing/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Shared stack / heap backdrops reused across the memory-model segments.
const Z_STACK: Zone = { x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "~1 МБ · Windows", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "общая · процесс", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_STACK, Z_HEAP];

export const boxing: LessonData = {
  id: "T1.M3.boxing",
  track: "T1",
  module: "M1.3",
  title: "Boxing и unboxing",
  kicker: "Ядро C# · память · нюанс",
  home: { subtitle: "Упаковка, IL, куча и цена в цикле", icon: "types", estMinutes: 9 },
  prereqs: ["T1.M2.value-vs-reference"],
  depth: 4,
  version: "3",
  status: "self-pass",

  sources: [
    { id: "ms-boxing", kind: "doc", org: "Microsoft Learn", title: "Boxing and unboxing (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing", date: "2025-10-13" },
    { id: "ms-gc", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22" },
    { id: "ms-generics", kind: "doc", org: "Microsoft Learn", title: "Generics in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/", date: "2022-07-26" },
    { id: "ms-struct", kind: "doc", org: "Microsoft Learn", title: "Choosing between class and struct", url: "https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct", date: "2008-10-22" },
    { id: "ms-thread-stack", kind: "doc", org: "Microsoft Learn", title: "Thread Stack Size (Win32)", url: "https://learn.microsoft.com/en-us/windows/win32/procthread/thread-stack-size", date: "2025-07-14" },
    { id: "ms-thread-ctor", kind: "doc", org: "Microsoft Learn", title: "Thread(ThreadStart, Int32) — maxStackSize", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread.-ctor", date: "2025-07-01" },
    { id: "ms-il-box", kind: "doc", org: "Microsoft Learn", title: "OpCodes.Box (box, IL 0x8C)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.emit.opcodes.box", date: "2025-07-01" },
    { id: "ms-il-unbox", kind: "doc", org: "Microsoft Learn", title: "OpCodes.Unbox_Any (unbox.any, IL 0xA5)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.emit.opcodes.unbox_any", date: "2025-07-01" },
  ],

  spec: [{ text: "«Boxing is implicit; unboxing is explicit.»", source: "ms-boxing" }],
  edgeCases: [
    { text: "Unbox <code>null</code> → <code>NullReferenceException</code>.", source: "ms-boxing" },
    { text: "Unbox в несовместимый тип → <code>InvalidCastException</code> (не тихое приведение).", source: "ms-boxing" },
  ],

  misconceptions: [
    {
      wrong: "boxing — это просто каст, дешёвая операция",
      hook: '«<code>object o = i</code> — просто каст» — процессор видит другое. Boxing — это <span class="wrong">аллокация на куче + копия</span>: упакованный <code>int</code> становится отдельным объектом, независимым от слота <code>i</code>, а в IL это отдельный опкод <code>box</code>. Ниже — <b>семь разборов</b>, каждый со своей анимацией и разбором механизма: от трёх действий упаковки и IL-байткода до размещения в памяти, давления на GC и <b>скрытого</b> boxing.',
      source: "ms-boxing",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Механика · три действия", title: "Как CLR упаковывает значение",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["int i = 123;", "object o = i;"],
      scenes: [
        { codeLine: 0, caption: 'Значение <b>123</b> лежит прямо в слоте <b>i</b> на <b>стеке</b> — value-тип живёт inline.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "123" }], edges: [] },
        { codeLine: 1, caption: 'Действие 1 — <span class="hl">аллокация</span>: CLR создаёт пустую обёртку <code>System.Object</code> на управляемой <b>куче</b>.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "123" }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "", accent: true }, { id: "cp", kind: "chip", x: 83, y: 88, value: "123" }], edges: [] },
        { codeLine: 1, caption: 'Действие 2 — <span class="hl">копия</span>: значение переносится со стека <b>внутрь</b> нового объекта (у value-типа семантика значения).', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "123" }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "", accent: true }, { id: "cp", kind: "chip", x: 257, y: 120, value: "123" }], edges: [] },
        { codeLine: 1, caption: 'Действие 3 — на стеке появляется <b>ссылка</b> <code>o</code> на объект. <code>o</code> хранит ссылку, а не копию значения.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "123" }, { id: "o", kind: "ref", x: 83, y: 160, name: "o", accent: true }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "123", accent: true }], edges: [{ id: "r", from: "o", to: "obj", accent: true }] },
      ],
      explain: 'Упаковка — не каст. CLR <b>аллоцирует новый объект-обёртку на управляемой куче</b> и <span class="hl">копирует</span> в него значение со стека, дословно: «Boxing a value type allocates an object instance on the heap and copies the value into the new object». На стеке остаётся только <b>ссылка</b> <code>o</code>: «an object reference <code>o</code>, on the stack, that references a value of the type <code>int</code>, on the heap … a copy of the value-type value». Копия — потому что у value-типов семантика значения: обёртка обязана владеть собственными данными, а не смотреть на чужой слот.',
      sources: ["ms-boxing"],
    },
    {
      id: "s2", num: "02", kicker: "Identity · копия ≠ ссылка", title: "Упакованная копия независима",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["int i = 123;", "object o = i;", "i = 456;", "Console.WriteLine(o);"],
      predictAt: 2, predictQ: 'Что напечатает <code>Console.WriteLine(o)</code> после <code>i = 456</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'После упаковки <b>o</b> ссылается на <span class="hl">независимую копию</span> 123 на куче.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "123" }, { id: "o", kind: "ref", x: 83, y: 160, name: "o" }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "123" }], edges: [{ id: "r", from: "o", to: "obj" }] },
        { codeLine: 2, out: "", caption: '<b>i = 456</b> меняет только слот на <b>стеке</b>; упакованная копия на куче <span class="hl">не трогается</span>.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "456", accent: true }, { id: "o", kind: "ref", x: 83, y: 160, name: "o" }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "123" }], edges: [{ id: "r", from: "o", to: "obj" }] },
        { codeLine: 3, out: "123", caption: '<b>WriteLine(o)</b> читает объект на куче → печатает <b>123</b>, а не 456.', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "i", value: "456" }, { id: "o", kind: "ref", x: 83, y: 160, name: "o" }, { id: "obj", kind: "obj", x: 257, y: 120, typeTag: "[int]", value: "123", accent: true }], edges: [{ id: "r", from: "o", to: "obj", accent: true }] },
      ],
      explain: 'Раз обёртка держит <b>копию</b>, оригинал и упаковка независимы. Меняем <code>i</code> на 456 — слот на стеке обновился, а объект на куче остался 123: «the original value type and the boxed object use <span class="hl">separate memory locations</span>, and therefore can store different values». Поэтому <code>WriteLine(o)</code> читает кучу и печатает <b>123</b>. Это identity: у boxed-значения своя ячейка, а не алиас переменной.',
      sources: ["ms-boxing"],
    },
    {
      id: "s3", num: "03", kicker: "Unboxing · гейт проверки типа", title: "Распаковка проверяет тип строго",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["object o = 123;", "int   n = (int)o;", "short s = (short)o;", "int   b = (int)null;"],
      scenes: [
        { codeLine: 0, caption: '<b>o</b> ссылается на boxed <code>int</code> на куче. Дальше распаковываем его тремя способами.', nodes: [{ id: "o", kind: "ref", x: 83, y: 88, name: "o" }, { id: "obj", kind: "obj", x: 257, y: 96, typeTag: "[int]", value: "123" }], edges: [{ id: "r", from: "o", to: "obj" }] },
        { codeLine: 1, caption: '<b>(int)o</b>: гейт проверяет тип — <span class="hl">int == int ✓</span> — и копирует значение наружу в <code>n</code>.', nodes: [{ id: "n", kind: "slot", x: 83, y: 88, name: "n", value: "123", accent: true }, { id: "gate", kind: "gate", x: 170, y: 168, state: "ok", label: "проверка типа", detail: "int == int  ✓" }, { id: "obj", kind: "obj", x: 257, y: 96, typeTag: "[int]", value: "123" }, { id: "cp", kind: "chip", x: 257, y: 96, value: "123" }], edges: [] },
        { codeLine: 2, caption: '<b>(short)o</b>: запрошен <code>short</code>, а в коробке <code>int</code> → <span class="hl">гейт закрыт</span>. Не тихое сужение, а исключение.', nodes: [{ id: "o", kind: "ref", x: 83, y: 88, name: "o" }, { id: "gate", kind: "gate", x: 170, y: 168, state: "fail", label: "short ≠ int", detail: "InvalidCastException" }, { id: "obj", kind: "obj", x: 257, y: 96, typeTag: "[int]", value: "123" }], edges: [{ id: "r", from: "o", to: "obj" }] },
        { codeLine: 3, caption: 'Распаковка <b>null</b>: разыменовывать нечего → <span class="hl">гейт закрыт</span>.', nodes: [{ id: "o", kind: "ref", x: 83, y: 88, name: "o", value: "null" }, { id: "gate", kind: "gate", x: 170, y: 168, state: "fail", label: "unbox null", detail: "NullReferenceException" }], edges: [] },
      ],
      explain: 'Распаковка строгая. Рантайм сначала <b>проверяет</b>, что объект — boxed-значение <span class="hl">ровно того же типа</span>, и только потом копирует значение наружу: «An unboxing operation consists of: Checking the object instance to make sure that it\'s a boxed value of the given value type. Copying the value from the instance into the value-type variable». Несовпадение типа — не тихое сужение, а <code>InvalidCastException</code>; распаковка <code>null</code> — <code>NullReferenceException</code>: «Attempting to unbox <code>null</code> causes a NullReferenceException. Attempting to unbox a reference to an incompatible value type causes an InvalidCastException». Строго — потому что boxed-объект хранит только точный тип, без правил конверсии.',
      sources: ["ms-boxing"],
    },
    {
      id: "s4", num: "04", kicker: "IL · машинный уровень", title: "box и unbox.any в байткоде",
      viewBox: "0 0 340 200", zones: MM_ZONES,
      code: ["object o = 123;", "int n = (int)o;"],
      il: [
        { off: "IL_0000", op: "ldc.i4.s", arg: "123", cmt: "// push int" },
        { off: "IL_0002", op: "box", arg: "int32", cmt: "// 0x8C" },
        { off: "IL_0007", op: "stloc.0", arg: "", cmt: "// o" },
        { off: "IL_0008", op: "ldloc.0", arg: "", cmt: "" },
        { off: "IL_0009", op: "unbox.any", arg: "int32", cmt: "// 0xA5" },
        { off: "IL_000e", op: "stloc.1", arg: "", cmt: "// n" },
      ],
      scenes: [
        { codeLine: 0, ilLine: 0, caption: 'Компилятор кладёт значение на стек вычислений (<code>ldc.i4.s 123</code>).', nodes: [{ id: "i", kind: "slot", x: 83, y: 88, name: "eval", value: "123" }], edges: [] },
        { codeLine: 0, ilLine: 1, caption: 'Опкод <span class="hl">box int32</span> создаёт новый объект и копирует в него данные value-типа.', nodes: [{ id: "i", kind: "slot", x: 83, y: 80, name: "eval", value: "123" }, { id: "o", kind: "ref", x: 83, y: 152, name: "o", accent: true }, { id: "obj", kind: "obj", x: 257, y: 116, typeTag: "[int]", value: "123", accent: true }], edges: [{ id: "r", from: "o", to: "obj", accent: true }] },
        { codeLine: 1, ilLine: 4, caption: 'Каст <code>(int)o</code> эмитит <span class="hl">unbox.any int32</span> — извлекает значение из коробки в <code>n</code>.', nodes: [{ id: "n", kind: "slot", x: 83, y: 80, name: "n", value: "123", accent: true }, { id: "o", kind: "ref", x: 83, y: 152, name: "o" }, { id: "obj", kind: "obj", x: 257, y: 116, typeTag: "[int]", value: "123" }, { id: "cp", kind: "chip", x: 257, y: 116, value: "123" }], edges: [{ id: "r", from: "o", to: "obj" }] },
      ],
      explain: 'На уровне IL упаковка видна буквально. Для <code>object o = i</code> компилятор эмитит опкод <code>box</code> (hex <b>0x8C</b>, формат «box valTypeToken»): «Convert a value type … to a true object reference … creating a new object and copying the data from the value type into the newly allocated object». Для каста <code>(int)o</code> эмитится <code>unbox.any</code> (hex <b>0xA5</b>): «Converts the boxed representation … to its unboxed form», причём «equivalent to <code>unbox</code> followed by <code>ldobj</code>». Операнд обоих — метадата-токен value-типа; эти две инструкции — «отпечаток» упаковки в байткоде.',
      sources: ["ms-il-box", "ms-il-unbox"],
    },
    {
      id: "s5", num: "05", kicker: "Размещение · три случая", title: "Где на самом деле живёт значение",
      viewBox: "0 0 340 214", zones: MM_ZONES,
      code: ["int x = 7;", "class N { int F; }", "object o = 7;"],
      scenes: [
        { codeLine: 0, caption: 'Случай 1 — <b>локальная value-переменная</b>: живёт в стеке своего потока (и это GC-root).', nodes: [{ id: "x", kind: "slot", x: 83, y: 88, name: "x", value: "7", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Случай 2 — <b>value-поле</b> объекта: лежит <span class="hl">inline внутри</span> содержащего объекта на куче, отдельно не аллоцируется.', nodes: [{ id: "x", kind: "slot", x: 83, y: 88, name: "x", value: "7" }, { id: "objN", kind: "obj", x: 257, y: 96, h: 60, typeTag: "class N", value: "", accent: true }, { id: "F", kind: "slot", x: 257, y: 100, name: "F", value: "7" }], edges: [] },
        { codeLine: 2, caption: 'Случай 3 — <b>boxed</b>-значение: отдельный объект на <span class="hl">общей куче</span> (одна на процесс, видна всем потокам).', nodes: [{ id: "x", kind: "slot", x: 83, y: 88, name: "x", value: "7" }, { id: "objN", kind: "obj", x: 257, y: 96, h: 60, typeTag: "class N", value: "" }, { id: "F", kind: "slot", x: 257, y: 100, name: "F", value: "7" }, { id: "box", kind: "obj", x: 257, y: 180, typeTag: "[int] boxed", value: "7", accent: true }], edges: [] },
      ],
      explain: 'Одно значение живёт в трёх разных местах. <b>Локальная</b> value-переменная — на стеке своего потока (дефолт ~1 МБ, Windows: «The default stack reservation size used by the linker is 1 MB»), и это GC-root: «local variables on a thread\'s stack». Value-<b>поле</b> — <span class="hl">inline внутри</span> содержащего объекта на куче: «value types are allocated either on the stack or inline in containing types». А <b>boxed</b>-значение — отдельный объект на общей куче: «There\'s a managed heap for each managed process. All threads in the process allocate memory for objects on the same heap».',
      sources: ["ms-thread-stack", "ms-gc", "ms-struct"],
    },
    {
      id: "s6", num: "06", kicker: "Цена · давление на GC", title: "Упаковка в цикле кормит сборщик",
      viewBox: "0 0 340 196",
      zones: [{ x: 14, y: 34, w: 312, h: 150, cls: "vz-zone heap", label: "GC-КУЧА · GEN 0", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "новые объекты · короткоживущие", subCls: "vz-zsub heap", subY: 47 }],
      code: ["for (int k = 0; k < N; k++)", "    object box = k;"],
      scenes: [
        { codeLine: 1, caption: 'Каждая итерация боксит <code>k</code> — это <span class="hl">новая аллокация</span>. Новые объекты идут в поколение 0.', nodes: [{ id: "b0", kind: "obj", x: 64, y: 104, typeTag: "[int]", value: "0", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Боксы <b>накапливаются</b> в gen 0 — «youngest … short-lived objects». Сборка тут случается чаще всего.', nodes: [{ id: "b0", kind: "obj", x: 64, y: 104, typeTag: "[int]", value: "0" }, { id: "b1", kind: "obj", x: 136, y: 104, typeTag: "[int]", value: "1" }, { id: "b2", kind: "obj", x: 208, y: 104, typeTag: "[int]", value: "2", accent: true }, { id: "b3", kind: "obj", x: 280, y: 104, typeTag: "[int]", value: "3", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Gen 0 заполнилась → срабатывает <span class="hl">gen 0 collection</span>: сборщик освобождает место под новый объект.', nodes: [{ id: "gc", kind: "gate", x: 170, y: 104, state: "ok", label: "gen 0 полна →", detail: "GC · collect gen 0" }], edges: [] },
      ],
      explain: 'В цикле каждая упаковка — <b>новая аллокация</b>. Новые объекты идут в поколение 0: «The garbage collector stores new objects in generation 0», а gen 0 — «the youngest and contains short-lived objects … Garbage collection occurs most frequently in this generation». Когда gen 0 заполняется, срабатывает сборка: «If an application attempts to create a new object when generation 0 is full, the garbage collector performs a collection to free address space for the object». Отсюда цена boxing: «too much boxing and unboxing can have a negative impact on the heap, the garbage collector, and ultimately the performance».',
      sources: ["ms-gc", "ms-struct"],
    },
    {
      id: "s7", num: "07", kicker: "Generics · и скрытый boxing", title: "Как убрать упаковку — и где она прячется",
      viewBox: "0 0 340 214",
      zones: [
        { x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СТЕК · INLINE", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "0 боксов", subCls: "vz-zsub good", subY: 47 },
        { x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "N аллокаций", subCls: "vz-zsub heap", subY: 47 },
      ],
      code: ["List<object> a = [];   // boxes", "List<int>    b = [];   // no box", "IComparable  c = p;    // hidden"],
      scenes: [
        { codeLine: 0, caption: '<code>List&lt;object&gt;.Add(1..3)</code>: каждый <code>int</code> <span class="hl">упакован</span> → N объектов на куче.', nodes: [{ id: "o1", kind: "obj", x: 251, y: 72, typeTag: "[int]", value: "1", accent: true }, { id: "o2", kind: "obj", x: 251, y: 116, typeTag: "[int]", value: "2", accent: true }, { id: "o3", kind: "obj", x: 251, y: 160, typeTag: "[int]", value: "3", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>List&lt;int&gt;</code>: элементы хранятся <span class="hl">inline</span>, <b>0 боксов</b> — обобщения снимают упаковку по построению.', nodes: [{ id: "c1", kind: "slot", x: 89, y: 72, name: "[0]", value: "1" }, { id: "c2", kind: "slot", x: 89, y: 116, name: "[1]", value: "2" }, { id: "c3", kind: "slot", x: 89, y: 160, name: "[2]", value: "3" }], edges: [] },
        { codeLine: 2, caption: '<b>Скрытый boxing</b>: <code>IComparable c = p</code> над <code>struct p</code> молча упаковывает его — интерфейс это ссылочный тип.', nodes: [{ id: "p", kind: "slot", x: 89, y: 106, name: "p", value: "struct" }, { id: "hb", kind: "obj", x: 251, y: 118, typeTag: "boxed p", value: "⇢", accent: true }], edges: [{ id: "e", from: "p", to: "hb", accent: true }] },
      ],
      explain: 'Обобщения убирают упаковку по построению: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box</span> the value types» — <code>List&lt;int&gt;</code> хранит <code>int</code> inline, <code>List&lt;object&gt;</code> боксит каждый элемент. Опасность — <b>скрытый</b> boxing: «Boxing is the process of converting a value type to the type <code>object</code> or to <span class="hl">any interface type</span> implemented by this value type» — то есть <code>IComparable c = p;</code> над struct упакует его молча: «Value types get boxed when cast to a reference type or one of the interfaces they implement».',
      sources: ["ms-generics", "ms-boxing", "ms-struct"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'После <code>i = 456</code> — что напечатает <code>Console.WriteLine(o)</code>?',
      options: ["123", "456", "0", "ошибка компиляции"], correctIndex: 0, xp: 10,
      okText: '<code>o</code> держит ссылку на упакованную <b>копию</b> 123. Изменение <code>i</code> на <span class="hl">456</span> трогает только слот на стеке — «separate memory locations».',
      noText: 'Оригинал и упаковка — <span class="hl">разные ячейки памяти</span>. <code>o</code> ссылается на копию 123, поэтому печатается <b>123</b>, а не 456.',
      verify: { kind: "exec", run: "dotnet run", expect: "123" }, sourceRefs: ["ms-boxing"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Зачем boxing", v: 'Единая система типов: значение любого value-типа можно трактовать как <code>object</code> или интерфейс.' },
    { icon: "cost", k: "Цена", v: '<span class="hl">Аллокация</span> в gen 0 + копия; в цикле — давление на GC и лишние сборки.' },
    { icon: "avoid", k: "Как избегают", v: 'Обобщения (<code>generics</code>), <code>Span&lt;T&gt;</code>; следить за <span class="hl">скрытым</span> boxing (интерфейсы, <code>object</code>-параметры).' },
  ],

  foot: 'урок · <b>boxing</b> · 7 анимир. разборов + IL · формат <b>lesson-as-data</b> · дизайн <b>mid</b>',
};
