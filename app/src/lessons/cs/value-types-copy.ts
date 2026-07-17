/**
 * Lesson: Семантика копирования value types (CS.S1.value-types-copy) — expert density,
 * 6 animated deep-dives. A struct assignment COPIES the value (never aliases): the whole
 * instance is duplicated inline; a reference-typed member is the one thing shared; the
 * copy costs 0 heap bytes where a class costs a real allocation; and passing a struct to a
 * method copies it too.
 *
 * SIGNATURE machine panel (tournament winner B, see evidence/F1/tournament-signature-panel.md):
 * a live GC.GetAllocatedBytesForCurrentThread() counter — struct copy = 0 bytes vs class new
 * = 24 bytes (REAL measurement, evidence/F1/value-types-copy-exec-il.txt).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../builtin-types/value-types
 *     (fetch-verified 2026-07-18);
 *   - every card's `verify.expect` is the REAL stdout of the backend run-csharp endpoint
 *     (evidence/F1/value-types-copy-exec-il.txt: a=(1,2) b=(99,2); struct copy: 0 bytes; …);
 *   - the s4 IL (ldarg.0/stloc.0/…) is a REAL Release-optimised compilation (ilspycmd 10.1.1);
 *   - the s5 machine-panel numbers (0 vs 24 bytes) are OWN GC.GetAllocatedBytesForCurrentThread
 *     measurements — same evidence log.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.value-types-copy/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1/s2/s6: stack (locals) beside heap — the shared memory-model backdrop.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "~1 МБ · Windows", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "общая · процесс", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_STACK, Z_HEAP];

// s3: value (struct) on the stack, its shared reference member on the heap.
const Z_VAL: Zone = { id: "val", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК · VALUE-КОПИИ", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "Number скопирован", subCls: "vz-zsub", subY: 47 };
const Z_SHARED: Zone = { id: "shared", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · ОБЩИЙ", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "List — одна на двоих", subCls: "vz-zsub heap", subY: 47 };
const REF_ZONES: Zone[] = [Z_VAL, Z_SHARED];

// s5 (SIGNATURE): the allocation counter panel — two lanes, struct vs class, one measured number each.
const Z_STRUCT_LANE: Zone = { id: "structLane", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "STRUCT · КОПИЯ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub good", subY: 47 };
const Z_CLASS_LANE: Zone = { id: "classLane", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CLASS · NEW", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub heap", subY: 47 };
const COUNTER_ZONES: Zone[] = [Z_STRUCT_LANE, Z_CLASS_LANE];

export const valueTypesCopy: LessonData = {
  id: "CS.S1.value-types-copy",
  track: "CS",
  section: "CS.S1",
  module: "S1.2",
  lang: "csharp",
  title: "Семантика копирования value types",
  kicker: "C# вглубь · S1 · стек/куча",
  home: { subtitle: "Копия при присваивании, layout, машинная панель", icon: "types", estMinutes: 9 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-value-types", kind: "doc", org: "Microsoft Learn", title: "Value types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types", date: "2026-03-20" },
    { id: "ms-alloc-bytes", kind: "doc", org: "Microsoft Learn", title: "GC.GetAllocatedBytesForCurrentThread Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.gc.getallocatedbytesforcurrentthread", date: "2025-07-01" },
    { id: "ms-il-ldloc", kind: "doc", org: "Microsoft Learn", title: "OpCodes.Stloc / Ldarg (IL)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.emit.opcodes.stloc", date: "2025-07-01" },
  ],

  spec: [
    { text: "«A variable of a value type contains an instance of the type.»", source: "ms-value-types" },
  ],
  edgeCases: [
    { text: "Ref-член внутри struct: копируется <b>только ссылка</b> — копия и оригинал видят <span class=\"hl\">один и тот же</span> объект в куче.", source: "ms-value-types" },
    { text: "Передача struct в метод — тоже копия: мутация параметра не видна снаружи (нет <code>ref</code>/<code>in</code>).", source: "ms-value-types" },
    { text: "Mutable struct — ловушка читаемости: <code>list[0].X = 1</code> над <code>List&lt;PointStruct&gt;</code> меняет копию, а не элемент. Дока советует иммутабельные value-типы.", source: "ms-value-types" },
  ],

  misconceptions: [
    {
      wrong: "b = a для структуры — это как для класса, обе смотрят на одно",
      hook: 'Для класса <code>b = a</code> даёт <span class="wrong">два имени одного объекта</span> — меняешь через одно, видно через другое. Для <b>структуры</b> процессор делает другое: <code>b = a</code> <span class="hl">копирует весь экземпляр</span> побайтово в свежий слот. Дословно: «A variable of a value type contains an instance of the type… In the case of value-type variables, you copy the corresponding type instances». Дальше <b>шесть разборов</b>: от layout на стеке и общего ref-члена до IL копии и <b>машинной панели</b> — реально снятого счётчика аллокаций (struct-копия <b>0 байт</b> против <b>24</b> у класса).',
      source: "ms-value-types",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Layout · значение inline", title: "Переменная value-типа держит сам экземпляр",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["struct Point { int X; int Y; }", "var a = new Point { X = 1, Y = 2 };"],
      scenes: [
        { codeLine: 0, caption: '<code>Point</code> — <b>value-тип</b>: у него нет заголовка объекта, он живёт там, где объявлен.', nodes: [{ id: "hint", kind: "chip", at: { zone: "stack", row: 0 }, value: "struct = value" }], edges: [] },
        { codeLine: 1, caption: 'Переменная <b>a</b> держит сам экземпляр <span class="hl">inline на стеке</span>: поля X и Y лежат прямо в слоте, без ссылки в кучу.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "X:1 Y:2", accent: true }, { id: "empty", kind: "chip", at: { zone: "heap", row: 0 }, value: "пусто" }], edges: [] },
      ],
      explain: 'Value-тип не отделяет «переменную» от «объекта»: «A variable of a value type <b>contains an instance</b> of the type. This behavior differs from a variable of a reference type, which contains a <span class="hl">reference to an instance</span> of the type». Поэтому поля структуры лежат <b>inline</b> — на стеке для локальной переменной, или внутри содержащего объекта для поля. Ни заголовка объекта, ни разыменования: адрес переменной — это и есть адрес данных.',
      sources: ["ms-value-types"],
    },
    {
      id: "s2", num: "02", kicker: "Присваивание · копия", title: "b = a копирует весь экземпляр",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["var a = new Point { X = 1, Y = 2 };", "var b = a;", "b.X = 99;", "Console.WriteLine($\"a=({a.X},{a.Y}) b=({b.X},{b.Y})\");"],
      predictAt: 2, predictQ: 'После <code>b.X = 99</code> — что напечатает строка про <code>a</code> и <code>b</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>b = a</b>: CLR <span class="hl">копирует</span> оба поля в новый слот. <b>b</b> — независимый экземпляр, не второе имя для <b>a</b>.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "X:1 Y:2" }, { id: "b", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point b", value: "X:1 Y:2", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>b.X = 99</b> меняет <span class="hl">только копию</span> b. Слот a не тронут — это отдельная память.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "X:1 Y:2" }, { id: "b", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point b", value: "X:99 Y:2", accent: true }], edges: [] },
        { codeLine: 3, out: "a=(1,2) b=(99,2)", caption: 'Печать: <b>a=(1,2)</b>, <b>b=(99,2)</b>. Копия объясняет всё — оригинал остался прежним (реальный прогон).', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "X:1 Y:2", accent: true }, { id: "b", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point b", value: "X:99 Y:2" }], edges: [] },
      ],
      explain: 'Присваивание value-типа копирует значение целиком: «By default, on <b>assignment</b>, passing an argument to a method, and returning a method result, you copy variable values. In the case of value-type variables, you copy the corresponding type instances». Поэтому <code>b.X = 99</code> трогает только b: «operations on a value-type variable affect <span class="hl">only that instance</span> of the value type, stored in the variable». Реальный вывод — <code>a=(1,2) b=(99,2)</code>: у класса тут было бы <code>a=(99,2)</code> — вот граница между value и reference.',
      sources: ["ms-value-types"],
    },
    {
      id: "s3", num: "03", kicker: "Ref-член · общий объект", title: "Копируется ссылка, а не то, на что она смотрит",
      viewBox: "0 0 340 210", zones: REF_ZONES,
      code: ["struct Tagged { int Number; List<string> Tags; }", "var n1 = new Tagged(0); n1.Tags.Add(\"A\");", "var n2 = n1;   // Number копия, Tags — общий", "n2.Number = 7; n2.Tags.Add(\"B\");"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>n1</b>: value <code>Number=0</code> на стеке, а <code>Tags</code> — <b>ссылка</b> на <code>List</code> в куче.', nodes: [{ id: "n1", kind: "ref", at: { zone: "val", row: 0 }, name: "n1", value: "N:0" }, { id: "list", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "List", value: "[A]", accent: true }], edges: [{ id: "e1", from: "n1", to: "list" }] },
        { codeLine: 2, out: "", caption: '<b>n2 = n1</b>: Number скопирован в отдельный слот, но <code>Tags</code>-ссылка <span class="hl">копирует адрес</span> — оба смотрят на <b>один</b> List.', nodes: [{ id: "n1", kind: "ref", at: { zone: "val", row: 0 }, name: "n1", value: "N:0" }, { id: "n2", kind: "ref", at: { zone: "val", row: 1 }, name: "n2", value: "N:0", accent: true }, { id: "list", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "List", value: "[A]" }], edges: [{ id: "e1", from: "n1", to: "list" }, { id: "e2", from: "n2", to: "list", accent: true }] },
        { codeLine: 3, out: "0 [A, B]\n7 [A, B]", caption: '<b>n2.Tags.Add(B)</b> добавляет в <span class="hl">общий</span> List — виден через n1. Печать: <b>0 [A, B]</b> / <b>7 [A, B]</b> (реальный прогон).', nodes: [{ id: "n1", kind: "ref", at: { zone: "val", row: 0 }, name: "n1", value: "N:0" }, { id: "n2", kind: "ref", at: { zone: "val", row: 1 }, name: "n2", value: "N:7", accent: true }, { id: "list", kind: "obj", at: { zone: "shared", row: 0 }, typeTag: "List", value: "[A,B]", accent: true }], edges: [{ id: "e1", from: "n1", to: "list" }, { id: "e2", from: "n2", to: "list" }] },
      ],
      explain: 'Копия value-типа <b>мелкая</b> (shallow) по построению: «If a value type contains a data member of a reference type, you copy <span class="hl">only the reference</span> to the instance of the reference type when you copy a value-type instance. Both the copy and original value-type instance have access to the <b>same reference-type instance</b>». Поэтому <code>Number</code> расходится (7 vs 0), а <code>Tags</code> — общий: <code>Add("B")</code> через n2 виден через n1. Реальный вывод — <code>0 [A, B]</code> и <code>7 [A, B]</code>: типичный источник «загадочных» мутаций в тестовых данных.',
      sources: ["ms-value-types"],
    },
    {
      id: "s4", num: "04", kicker: "IL · машинный уровень", title: "Копия — это ldarg / stloc, без newobj",
      viewBox: "0 0 340 200", zones: MM_ZONES,
      code: ["Point Copy(Point a) {", "  Point b = a;", "  b.X = 99;", "  return a.X + b.X; }"],
      il: [
        { off: "IL_0000", op: "ldarg.0", arg: "", cmt: "// a" },
        { off: "IL_0001", op: "stloc.0", arg: "", cmt: "// b = a · копия" },
        { off: "IL_0002", op: "ldloca.s", arg: "0", cmt: "// &b" },
        { off: "IL_0006", op: "stfld", arg: "Point::X", cmt: "// b.X = 99" },
        { off: "IL_000b", op: "ldarg.0", arg: "", cmt: "// a — не тронут" },
        { off: "IL_000c", op: "ldfld", arg: "Point::X", cmt: "// a.X" },
      ],
      scenes: [
        { codeLine: 1, ilLine: 0, caption: 'Аргумент <code>a</code> — сам struct на стеке вычислений (<code>ldarg.0</code>). Никаких ссылок.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "eval" }], edges: [] },
        { codeLine: 1, ilLine: 1, caption: '<span class="hl">stloc.0</span> — <code>Point b = a</code>: значение <b>копируется целиком</b> в локал. Нет <code>newobj</code>, нет <code>box</code>, куча не тронута.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "" }, { id: "b", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point b", value: "", accent: true }, { id: "none", kind: "chip", at: { zone: "heap", row: 0 }, value: "0 аллокаций" }], edges: [] },
        { codeLine: 3, ilLine: 4, caption: '<code>ldarg.0 / ldfld</code> читают <b>оригинал a</b> — он не менялся: копия и оригинал разошлись на уровне байткода.', nodes: [{ id: "a", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point a", value: "1", accent: true }, { id: "b", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point b", value: "99" }], edges: [] },
      ],
      explain: 'В IL копия структуры видна буквально — и по <b>отсутствию</b> опкода. <code>Point b = a;</code> компилируется в <code>ldarg.0 / <span class="hl">stloc.0</span></code>: значение кладётся на стек вычислений и сохраняется в локал целиком, без <code>newobj</code> и без <code>box</code>. Мутация <code>b.X = 99</code> идёт по <code>ldloca.s 0 / stfld</code> — по адресу <b>локальной копии</b>; чтение <code>a.X</code> — <code>ldarg.0 / ldfld</code> по нетронутому оригиналу. Копия структуры — это перенос байтов в свежий слот, а не создание объекта (реальный Release-IL, ilspycmd).',
      sources: ["ms-il-ldloc", "ms-value-types"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Счётчик аллокаций: копия 0 байт против 24 у класса",
      viewBox: "0 0 340 214", zones: COUNTER_ZONES,
      code: ["b0 = GC.GetAllocatedBytesForCurrentThread();", "var s2 = s1;              // struct copy", "b1 = GC.GetAllocatedBytesForCurrentThread();", "var c1 = new PointClass(); // heap", "b2 = GC.GetAllocatedBytesForCurrentThread();"],
      predictAt: 2, predictQ: 'Сколько байт кучи стоит <code>var s2 = s1</code> для <b>struct</b>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Замеряем аллокации <b>до и после</b> struct-копии живым счётчиком <code>GC.GetAllocatedBytesForCurrentThread()</code>.', nodes: [{ id: "sc", kind: "gate", at: { zone: "structLane", row: 0 }, state: "ok", label: "struct s2 = s1", detail: "замер…" }], edges: [] },
        { codeLine: 2, out: "struct copy: 0 bytes", caption: 'Struct-копия — <span class="hl">0 байт кучи</span>: значение живёт на стеке, GC вообще не участвует.', nodes: [{ id: "sc", kind: "gate", at: { zone: "structLane", row: 0 }, state: "ok", label: "struct copy", detail: "0 байт" }, { id: "s0", kind: "chip", at: { zone: "structLane", row: 1 }, value: "GC не тронут", accent: true }], edges: [] },
        { codeLine: 3, out: "class new: 24 bytes", caption: '<b>new PointClass</b> — <span class="hl">24 байта</span> в куче (заголовок объекта + поля): тот же «Point», но reference-тип платит аллокацией.', nodes: [{ id: "sc", kind: "gate", at: { zone: "structLane", row: 0 }, state: "ok", label: "struct copy", detail: "0 байт" }, { id: "cc", kind: "gate", at: { zone: "classLane", row: 0 }, state: "fail", label: "class new", detail: "24 байта" }, { id: "c0", kind: "chip", at: { zone: "classLane", row: 1 }, value: "gen0 аллокация", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятое число, не легенда. Табло: <code>GC.GetAllocatedBytesForCurrentThread()</code> вокруг двух операций даёт <b>struct copy: 0 bytes</b> и <b>class new: 24 bytes</b> (собственный прогон, evidence урока). Метод «returns the number of bytes allocated on the current managed thread» — прямой измеритель давления на кучу. Отсюда практический смысл value-типов: копия структуры не идёт в gen 0, тогда как каждый <code>new</code> класса — аллокация и будущая работа для сборщика. Тот же «Point», две разные цены.',
      sources: ["ms-alloc-bytes", "ms-value-types"],
    },
    {
      id: "s6", num: "06", kicker: "Передача в метод · снова копия", title: "Параметр-struct мутируется локально",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["void Mutate(Point p) { p.X = 100; }", "var q = new Point { X = 1, Y = 2 };", "Mutate(q);   // q не изменится", "// q всё ещё (1, 2)"],
      scenes: [
        { codeLine: 1, caption: '<b>q</b> на стеке вызывающего: <code>X=1, Y=2</code>.', nodes: [{ id: "q", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point q", value: "X:1 Y:2", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Mutate(q)</b>: аргумент <span class="hl">копируется</span> в параметр <code>p</code> — своя память в кадре метода (тоже на стеке).', nodes: [{ id: "q", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point q", value: "X:1 Y:2" }, { id: "p", kind: "obj", at: { zone: "stack", row: 1 }, typeTag: "Point p", value: "X:100 Y:2", accent: true }, { id: "frame", kind: "chip", at: { zone: "heap", row: 0 }, value: "куча пуста" }], edges: [] },
        { codeLine: 3, caption: '<code>p.X = 100</code> ушло вместе с кадром метода. <b>q по-прежнему (1, 2)</b> — мутация не выбралась наружу.', nodes: [{ id: "q", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Point q", value: "X:1 Y:2", accent: true }], edges: [] },
      ],
      explain: 'Передача аргумента — тот же копирующий механизм: «on assignment, <b>passing an argument to a method</b>, and returning a method result, you copy variable values». Дока показывает это прямо: после <code>MutateAndDisplay(p2)</code> вызывающий видит <code>p2</code> неизменным, хотя внутри метода <code>p.X = 100</code>. Значит struct-параметр — независимая копия в кадре метода; чтобы метод менял оригинал, нужен <code>ref</code>/<code>out</code>/<code>in</code>. Это и делает большие struct дорогими в передаче — копируется весь экземпляр.',
      sources: ["ms-value-types"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = new Point{X=1,Y=2}; var b = a; b.X = 99;</code><br/><code>Console.WriteLine($"a=({a.X},{a.Y}) b=({b.X},{b.Y})");</code> — что напечатает?',
      options: ["a=(1,2) b=(99,2)", "a=(99,2) b=(99,2)", "a=(99,2) b=(1,2)", "a=(1,2) b=(1,2)"], correctIndex: 0, xp: 10,
      okText: '<code>b = a</code> для структуры — <b>копия</b>: <code>b.X = 99</code> трогает только b. Оригинал <code>a</code> остался <span class="hl">(1,2)</span> — «separate memory locations».',
      noText: 'Ключ — value-семантика: присваивание копирует экземпляр целиком, а не даёт второе имя. У класса было бы <code>a=(99,2)</code>; у struct — <b>a=(1,2) b=(99,2)</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "a=(1,2) b=(99,2)" }, sourceRefs: ["ms-value-types"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>struct Tagged{int Number; List&lt;string&gt; Tags;}</code>: <code>n1.Tags.Add("A"); var n2 = n1; n2.Number = 7; n2.Tags.Add("B"); WriteLine(n1); WriteLine(n2);</code> (<code>ToString = "{Number} [{tags}]"</code>) — обе строки?',
      options: ["0 [A, B]\\n7 [A, B]", "0 [A]\\n7 [A, B]", "0 [A, B]\\n7 [B]", "7 [A, B]\\n7 [A, B]"], correctIndex: 0, xp: 10,
      okText: 'Копия <b>мелкая</b>: <code>Number</code> расходится (0 vs 7), но <code>Tags</code>-ссылка общая — <code>Add("B")</code> виден через оба. «Both … have access to the same reference-type instance».',
      noText: 'Копируется <span class="hl">только ссылка</span> на List, не сам список: n1 и n2 делят один <code>Tags</code>. Реальный вывод: <code>0 [A, B]</code>, затем <code>7 [A, B]</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0 [A, B]\n7 [A, B]" }, sourceRefs: ["ms-value-types"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Замер: <code>b0=GC.GetAllocatedBytesForCurrentThread(); var s2=s1; b1=GC.GetAllocatedBytesForCurrentThread(); WriteLine($"struct copy: {b1-b0} bytes");</code> (s1 — struct) — что напечатает?',
      options: ["struct copy: 0 bytes", "struct copy: 24 bytes", "struct copy: 8 bytes", "struct copy: 16 bytes"], correctIndex: 0, xp: 10,
      okText: 'Struct-копия живёт на стеке — <span class="hl">0 байт кучи</span>, GC не участвует. Именно поэтому value-типы не давят на сборщик там, где класс аллоцировал бы.',
      noText: 'Копия структуры — перенос байтов в слот стека, не аллокация: <code>0 bytes</code>. Аллокацию (24 байта) даёт <code>new</code> reference-типа, а не копия value-типа.',
      verify: { kind: "exec", run: "dotnet run", expect: "struct copy: 0 bytes" }, sourceRefs: ["ms-alloc-bytes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что происходит", v: '<code>b = a</code> для struct — <span class="hl">копия всего экземпляра</span> в свежий слот; для class — второе имя одного объекта. Мутация копии не видна оригиналу.' },
    { icon: "cost", k: "Цена и layout", v: 'Копия структуры — <b>0 байт кучи</b> (стек/inline), но копируется <span class="hl">весь</span> value: большие struct дороги в передаче. Класс платит аллокацией (замер: 24 байта).' },
    { icon: "avoid", k: "Ловушки", v: 'Ref-член копируется как <b>ссылка</b> — общий объект на двоих. Mutable struct + коллекция = «немая» мутация копии. Дока: делай value-типы <span class="hl">иммутабельными</span>.' },
  ],

  foot: 'урок · <b>копирование value types</b> · 6 анимир. разборов · IL <code>ldarg/stloc</code> · панель-счётчик 0 vs 24 байта · дизайн <b>mid</b>',
};
