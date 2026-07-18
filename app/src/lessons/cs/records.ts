/**
 * Lesson: Records — value equality и синтез компилятора (CS.S1.records) — expert density,
 * 5 animated deep-dives. What a record actually IS under the hood: the compiler synthesizes
 * value-equality methods (Equals/GetHashCode/==/!=), ToString/PrintMembers, and Deconstruct;
 * `with` is nondestructive mutation that makes a SHALLOW copy; `record struct` is a value type;
 * and equality requires a matching runtime type (two different record types with the same fields
 * are not equal).
 *
 * SIGNATURE machine panel (s1): value equality vs reference equality, proven by a real number —
 * `r1 == r2` is True for a record but `c1 == c2` is False for a plain class (same fields). REAL
 * run-csharp measurement, evidence/F7/records-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn record (fetch 2026-07-18) + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../builtin-types/record;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F7/records-exec.txt:
 *     "True False"; the with-copy line; "False" for cross-type);
 *   - NO GT-M3 red flags: record can be struct (not always class), `with` creates a new instance
 *     (never mutates the original) and is shallow, two different record types are NOT equal, no
 *     user Clone method allowed.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.records/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): two lanes — record value equality vs class reference equality.
const Z_REC: Zone = { id: "rec", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "RECORD · r1 == r2", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "value equality", subCls: "vz-zsub good", subY: 47 };
const Z_CLS: Zone = { id: "cls", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CLASS · c1 == c2", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "reference equality", subCls: "vz-zsub heap", subY: 47 };
const EQ_ZONES: Zone[] = [Z_REC, Z_CLS];

// s2: the synthesized-members panel — one record declaration, the compiler-emitted members.
const Z_DECL: Zone = { id: "decl", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ТВОЙ КОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "record Point(int X,int Y)", subCls: "vz-zsub", subY: 47 };
const Z_SYNTH: Zone = { id: "synth", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "СИНТЕЗ КОМПИЛЯТОРА", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "эмитит за тебя", subCls: "vz-zsub heap", subY: 47 };
const SYNTH_ZONES: Zone[] = [Z_DECL, Z_SYNTH];

// s3: with — original beside the new copy it produces.
const Z_ORIG: Zone = { id: "orig", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОРИГИНАЛ p1", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не меняется", subCls: "vz-zsub", subY: 47 };
const Z_COPY: Zone = { id: "copy", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "НОВЫЙ p2", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "p1 with { X = 99 }", subCls: "vz-zsub good", subY: 47 };
const WITH_ZONES: Zone[] = [Z_ORIG, Z_COPY];

// s4: with is shallow — the copy shares the reference member.
const Z_TWO: Zone = { id: "two", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "b1 · b2", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "две записи", subCls: "vz-zsub", subY: 47 };
const Z_LIST: Zone = { id: "list", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · List", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "один на двоих", subCls: "vz-zsub heap", subY: 47 };
const SHALLOW_ZONES: Zone[] = [Z_TWO, Z_LIST];

// s5: runtime-type equality — two different record types, same fields.
const Z_A: Zone = { id: "a", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "record A(int X)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "EqualityContract = A", subCls: "vz-zsub", subY: 47 };
const Z_B: Zone = { id: "b", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "record B(int X)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "EqualityContract = B", subCls: "vz-zsub heap", subY: 47 };
const CONTRACT_ZONES: Zone[] = [Z_A, Z_B];

export const records: LessonData = {
  id: "CS.S1.records",
  track: "CS",
  section: "CS.S1",
  module: "S1.5",
  lang: "csharp",
  title: "Records: value equality и синтез компилятора",
  kicker: "C# вглубь · S1 · синтез методов",
  home: { subtitle: "Value equality, with, синтез Equals/Deconstruct", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-record", kind: "doc", org: "Microsoft Learn", title: "Records (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record", date: "2026-06-05" },
  ],

  spec: [
    { text: "«For `class` types, two objects are equal if they refer to the same object in memory… For types with the `record` modifier (`record class`, `record struct`, and `readonly record struct`), two objects are equal if they are of the same type and store the same values.»", source: "ms-record" },
  ],
  edgeCases: [
    { text: "У обычного <code>struct</code> равенство — <code>ValueType.Equals</code> на <b>рефлексии</b>; у record — <span class=\"hl\">синтез компилятора</span> по объявленным членам (быстрее и предсказуемее). Определение одинаковое, реализация — нет.", source: "ms-record" },
    { text: "Объявлять override <code>Object.Equals</code>, <code>==</code>/<code>!=</code>, <code>EqualityContract</code> — <b>ОШИБКА компиляции</b>; <code>Equals(R?)</code> и <code>GetHashCode</code> объявлять можно. Свой <code>Clone</code>/член с именем <code>Clone</code> — запрещён.", source: "ms-record" },
    { text: "Для <code>record class</code> равенство требует <b>совпадения runtime-типа</b>: две записи-переменные равны, только если реальный тип объекта совпадает («the run-time type must be equal»).", source: "ms-record" },
  ],

  misconceptions: [
    {
      wrong: "record — это всегда class, а with мутирует оригинал (глубоко)",
      hook: 'Три ложные интуиции разом. «<span class="wrong">record всегда class</span>» — нет: <code>record struct</code> — value type. «<span class="wrong">with мутирует оригинал</span>» — нет: создаёт <b>новый</b> экземпляр. «<span class="wrong">with делает глубокую копию</span>» — нет, <b>shallow</b>. Суть record — это не синтаксис, а <span class="hl">синтез компилятора</span>: он эмитит value-equality, <code>ToString</code>, <code>Deconstruct</code>. Ниже <b>пять разборов</b>: <b>машинная панель</b> value-vs-reference equality (реально снятое <code>True False</code>), какие методы синтезированы, <code>with</code> и его shallow-копия, и равенство по runtime-типу.',
      source: "ms-record",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · value equality", title: "record == сравнивает значения, class — ссылки",
      viewBox: "0 0 340 214", zones: EQ_ZONES,
      code: ["record Point(int X, int Y);", "class CPoint { public int X, Y; ... }", "var r1=new Point(1,2); var r2=new Point(1,2);", "var c1=new CPoint(1,2); var c2=new CPoint(1,2);"],
      predictAt: 2, predictQ: 'Одинаковые поля (1,2). Что даст <code>r1==r2</code> (record) и <code>c1==c2</code> (class)?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Два <b>record</b>-объекта <code>Point(1,2)</code>. Компилятор синтезировал <code>==</code> по <span class="hl">значениям</span>.', nodes: [{ id: "r1", kind: "obj", at: { zone: "rec", row: 0 }, typeTag: "r1", value: "1,2" }, { id: "r2", kind: "obj", at: { zone: "rec", row: 1 }, typeTag: "r2", value: "1,2", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Два <b>class</b>-объекта <code>CPoint(1,2)</code>. У класса <code>==</code> по умолчанию — <span class="hl">ссылочное</span> равенство.', nodes: [{ id: "c1", kind: "ref", at: { zone: "cls", row: 0 }, name: "c1", value: "→ obj1" }, { id: "c2", kind: "ref", at: { zone: "cls", row: 1 }, name: "c2", value: "→ obj2", accent: true }], edges: [] },
        { codeLine: 3, out: "True False", caption: 'Панель: <b>r1==r2 → True</b> (значения равны), <b>c1==c2 → False</b> (разные объекты в памяти). Реальный прогон.', nodes: [{ id: "rec", kind: "gate", at: { zone: "rec", row: 0 }, state: "ok", label: "record ==", detail: "True" }, { id: "cls", kind: "gate", at: { zone: "cls", row: 0 }, state: "fail", label: "class ==", detail: "False" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — равенство, снятое числом. Дословно из спеки: «For <code>class</code> types, two objects are equal if they refer to the <span class="hl">same object in memory</span>… For types with the <code>record</code> modifier…, two objects are equal if they are of the same type and <b>store the same values</b>». Прогон: <code>r1==r2</code> → <b>True</b> (одинаковые X,Y), <code>c1==c2</code> → <b>False</b> (разные объекты). Именно поэтому record удобен для data-моделей: два «одинаковых» объекта считаются равными без ручного <code>Equals</code>. Это ключевая фича, а не сахар.',
      sources: ["ms-record"],
    },
    {
      id: "s2", num: "02", kicker: "Синтез · что эмитит компилятор", title: "Одно объявление → набор методов",
      viewBox: "0 0 340 210", zones: SYNTH_ZONES,
      code: ["record Point(int X, int Y);", "// компилятор синтезирует:", "// Equals/GetHashCode/==/!=, ToString+PrintMembers,", "// Deconstruct, (при наследовании) EqualityContract"],
      scenes: [
        { codeLine: 0, caption: 'Ты пишешь <b>одну строку</b>: <code>record Point(int X, int Y)</code> — позиционные свойства <code>X</code>, <code>Y</code>.', nodes: [{ id: "src", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "record", value: "Point(X,Y)", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Компилятор эмитит <span class="hl">value-equality</span>: <code>Equals</code>, <code>GetHashCode</code>, <code>operator ==</code>/<code>!=</code>.', nodes: [{ id: "src", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "record", value: "Point(X,Y)" }, { id: "eq", kind: "chip", at: { zone: "synth", row: 0 }, value: "Equals/==/!=", w: 120, accent: true }], edges: [{ id: "e1", from: "src", to: "eq", accent: true }] },
        { codeLine: 3, caption: 'И ещё: <code>ToString</code>+<code>PrintMembers</code> (формат для дисплея), <code>Deconstruct</code> (для позиционных). <b>Объявлять их вручную — ошибка компиляции.</b>', nodes: [{ id: "src", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "record", value: "Point(X,Y)" }, { id: "eq", kind: "chip", at: { zone: "synth", row: 0 }, value: "Equals/==/!=", w: 120 }, { id: "ts", kind: "chip", at: { zone: "synth", row: 1 }, value: "ToString", w: 96 }, { id: "de", kind: "chip", at: { zone: "synth", row: 2 }, value: "Deconstruct", w: 110, accent: true }], edges: [] },
      ],
      explain: 'Суть record — <b>синтез компилятора</b>, не новый рантайм-механизм: «The features unique to record types are implemented by <span class="hl">compiler-synthesized methods</span>». Он эмитит override <code>Object.Equals</code>, <code>Equals(R?)</code> (реализует <code>IEquatable&lt;T&gt;</code>), <code>GetHashCode</code>, <code>operator ==</code>/<code>!=</code>, <code>ToString</code>+<code>PrintMembers</code>, <code>Deconstruct</code> (для позиционных). Важная граница: «It\'s an error if you declare the override [<code>Object.Equals</code>] explicitly» и то же для <code>==</code>/<code>!=</code>/<code>EqualityContract</code> — а вот <code>Equals(R?)</code> и <code>GetHashCode</code> ты объявить можешь. И нельзя создать член <code>Clone</code>: «you can\'t create a member named <code>Clone</code> in any record type».',
      sources: ["ms-record"],
    },
    {
      id: "s3", num: "03", kicker: "with · nondestructive mutation", title: "with создаёт НОВЫЙ экземпляр, оригинал цел",
      viewBox: "0 0 340 210", zones: WITH_ZONES,
      code: ["var p1 = new Point(1, 2);", "var p2 = p1 with { X = 99 };", "Console.WriteLine($\"{p1} {p2}\");"],
      predictAt: 1, predictQ: 'После <code>p2 = p1 with { X = 99 }</code> — что печатают <code>p1</code> и <code>p2</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>p1 = Point(1, 2)</code> — исходная запись.', nodes: [{ id: "p1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "p1", value: "X:1 Y:2", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>p1 with { X = 99 }</code>: компилятор <span class="hl">копирует</span> p1 и меняет X у копии → новый объект <b>p2</b>. Оригинал p1 не тронут.', nodes: [{ id: "p1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "p1", value: "X:1 Y:2" }, { id: "p2", kind: "obj", at: { zone: "copy", row: 0 }, typeTag: "p2", value: "X:99 Y:2", accent: true }], edges: [] },
        { codeLine: 2, out: "Point { X = 1, Y = 2 } Point { X = 99, Y = 2 }", caption: 'Печать (синтезированный <code>ToString</code>): <b>p1 = {X=1,Y=2}</b>, <b>p2 = {X=99,Y=2}</b>. with НЕ мутировал p1 (реальный прогон).', nodes: [{ id: "p1", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "p1", value: "X:1 Y:2", accent: true }, { id: "p2", kind: "obj", at: { zone: "copy", row: 0 }, typeTag: "p2", value: "X:99 Y:2" }], edges: [] },
      ],
      explain: 'Опровержение мифа «with мутирует оригинал». Дословно: «A <code>with</code> expression creates a <b>new record instance</b> that\'s a copy of an existing record instance, but with specified properties and fields modified». Прогон: p1 остался <code>{X=1,Y=2}</code>, а p2 — <code>{X=99,Y=2}</code>. Это <span class="hl">nondestructive mutation</span>: старый объект неизменен, изменения живут в копии. Для <code>record class</code> компилятор синтезирует clone-метод и copy-конструктор, а <code>with</code> зовёт clone и потом ставит указанные свойства. Печать даёт синтезированный <code>ToString</code> в формате <code>Type { Prop = val, … }</code>.',
      sources: ["ms-record"],
    },
    {
      id: "s4", num: "04", kicker: "with — SHALLOW", title: "Копия делит ссылочный член",
      viewBox: "0 0 340 210", zones: SHALLOW_ZONES,
      code: ["record Basket(List<int> Items);", "var b1 = new Basket(new List<int>{1});", "var b2 = b1 with { };   // shallow copy", "b2.Items.Add(2);"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>b1</b> держит ссылку на <code>List[1]</code> в куче.', nodes: [{ id: "b1", kind: "ref", at: { zone: "two", row: 0 }, name: "b1" }, { id: "list", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List", value: "[1]", accent: true }], edges: [{ id: "e1", from: "b1", to: "list" }] },
        { codeLine: 2, out: "", caption: '<code>b1 with { }</code> — <span class="hl">shallow</span>: копируется только ссылка <code>Items</code>. b1 и b2 смотрят на <b>один</b> List.', nodes: [{ id: "b1", kind: "ref", at: { zone: "two", row: 0 }, name: "b1" }, { id: "b2", kind: "ref", at: { zone: "two", row: 1 }, name: "b2", accent: true }, { id: "list", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List", value: "[1]" }], edges: [{ id: "e1", from: "b1", to: "list" }, { id: "e2", from: "b2", to: "list", accent: true }] },
        { codeLine: 3, out: "2 2 True", caption: '<code>b2.Items.Add(2)</code> виден через <b>оба</b>: <code>Count</code> 2 и 2, <code>ReferenceEquals</code> True. Копия мелкая (реальный прогон).', nodes: [{ id: "b1", kind: "ref", at: { zone: "two", row: 0 }, name: "b1" }, { id: "b2", kind: "ref", at: { zone: "two", row: 1 }, name: "b2" }, { id: "list", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List", value: "[1,2]", accent: true }], edges: [{ id: "e1", from: "b1", to: "list" }, { id: "e2", from: "b2", to: "list" }] },
      ],
      explain: 'Опровержение мифа «with делает deep-копию». Дословно: «The result of a <code>with</code> expression is a <b>shallow copy</b>. For a reference property, the expression copies only the reference to an instance. Both the original record and the copy end up with a <span class="hl">reference to the same instance</span>». Прогон: <code>b2.Items.Add(2)</code> изменил список, виден через <code>b1</code> — оба <code>Count == 2</code>, <code>ReferenceEquals(b1.Items, b2.Items)</code> == <b>True</b>. Тот же принцип, что shallow-иммутабельность init-свойств: заменить ссылку нельзя, а содержимое объекта за ней — можно.',
      sources: ["ms-record"],
    },
    {
      id: "s5", num: "05", kicker: "Runtime-тип · EqualityContract", title: "Два разных record с теми же полями НЕ равны",
      viewBox: "0 0 340 210", zones: CONTRACT_ZONES,
      code: ["record A(int X);", "record B(int X);", "object a = new A(1); object b = new B(1);", "Console.WriteLine(a.Equals(b));"],
      predictAt: 2, predictQ: '<code>A(1)</code> и <code>B(1)</code> — разные record-типы с одинаковым полем. <code>a.Equals(b)</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>A(1)</code> и <code>B(1)</code>: поля одинаковые (<code>X=1</code>), но типы <b>разные</b> — A и B.', nodes: [{ id: "a", kind: "obj", at: { zone: "a", row: 0 }, typeTag: "A", value: "X:1" }, { id: "b", kind: "obj", at: { zone: "b", row: 0 }, typeTag: "B", value: "X:1", accent: true }], edges: [] },
        { codeLine: 3, out: "False", caption: 'Синтезированное равенство сверяет <span class="hl">EqualityContract</span> (runtime-тип): A ≠ B → <b>False</b>, хотя <code>X</code> совпадает. Реальный прогон.', nodes: [{ id: "a", kind: "obj", at: { zone: "a", row: 0 }, typeTag: "A", value: "X:1" }, { id: "b", kind: "obj", at: { zone: "b", row: 0 }, typeTag: "B", value: "X:1" }, { id: "no", kind: "gate", at: { zone: "b", row: 1 }, state: "fail", label: "A.Equals(B)", detail: "False" }], edges: [] },
      ],
      explain: 'Опровержение мифа «два record с одинаковыми полями равны». Для <code>record class</code>: «For two record variables to be equal, the <span class="hl">run-time type must be equal</span>». Прогон: <code>A(1).Equals(B(1))</code> → <b>False</b>, потому что типы разные — компилятор синтезирует <code>EqualityContract</code> (возвращает <code>Type</code> записи) и «enables the equality methods to <b>compare the runtime type</b> of objects when they\'re checking for equality». Даже в иерархии: <code>Teacher</code> и <code>Student</code> с одинаковыми полями через ссылку <code>Person</code> не равны — «The equality test depends on the runtime type of the actual object, not the declared type of the variable». Равенство value-based, но с проверкой типа.',
      sources: ["ms-record"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>record Point(int X,int Y); class CPoint{ public int X,Y; public CPoint(int x,int y){X=x;Y=y;} }</code><br/><code>var r1=new Point(1,2); var r2=new Point(1,2); var c1=new CPoint(1,2); var c2=new CPoint(1,2); Console.WriteLine($"{r1==r2} {c1==c2}");</code> — что напечатает?',
      options: ["True False", "True True", "False False", "False True"], correctIndex: 0, xp: 10,
      okText: '<code>record</code> синтезирует <b>value equality</b>: <code>r1==r2</code> → <span class="hl">True</span> (X,Y равны). У <code>class</code> <code>==</code> — <b>ссылочное</b>: <code>c1==c2</code> → <span class="hl">False</span> (разные объекты).',
      noText: '«record… two objects are equal if… store the same values»; «class… equal if they refer to the same object in memory». Реальный вывод: <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-record"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>record Point(int X,int Y); var p1=new Point(1,2); var p2=p1 with { X=99 }; Console.WriteLine($"{p1} {p2}");</code> — что напечатает? (учти синтезированный ToString)',
      options: ["Point { X = 1, Y = 2 } Point { X = 99, Y = 2 }", "Point { X = 99, Y = 2 } Point { X = 99, Y = 2 }", "Point { X = 99, Y = 2 } Point { X = 1, Y = 2 }", "Point { X = 1, Y = 2 } Point { X = 1, Y = 2 }"], correctIndex: 0, xp: 10,
      okText: '<code>with</code> — <b>nondestructive</b>: создаёт НОВЫЙ экземпляр (копию с X=99), <code>p1</code> не тронут. Синтезированный <code>ToString</code> печатает <code>Type { Prop = val, … }</code>.',
      noText: '«A with expression creates a new record instance… with specified properties… modified». Оригинал цел: <b>p1={X=1,Y=2}</b>, копия <b>p2={X=99,Y=2}</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Point { X = 1, Y = 2 } Point { X = 99, Y = 2 }" }, sourceRefs: ["ms-record"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>record A(int X); record B(int X); object a=new A(1); object b=new B(1); Console.WriteLine(a.Equals(b));</code> — что напечатает?',
      options: ["False", "True", "ошибка компиляции", "null"], correctIndex: 0, xp: 10,
      okText: 'Разные record-типы (<code>A</code> и <code>B</code>) не равны, даже с одинаковым полем: синтезированное равенство сверяет <span class="hl">EqualityContract</span> (runtime-тип) → <b>False</b>.',
      noText: '«For two record variables to be equal, the run-time type must be equal». A ≠ B по типу, поэтому <code>a.Equals(b)</code> → <b>False</b>, хотя <code>X=1</code> совпадает.',
      verify: { kind: "exec", run: "dotnet run", expect: "False" }, sourceRefs: ["ms-record"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Value equality", v: '<code>record ==</code> сравнивает <span class="hl">значения</span> (синтез компилятора по членам), <code>class ==</code> — ссылки. Замер: <code>r1==r2</code> True, <code>c1==c2</code> False. У обычного struct равенство — рефлексия (<code>ValueType.Equals</code>), у record — синтез.' },
    { icon: "cost", k: "with = nondestructive + shallow", v: '<code>with</code> создаёт <b>новый</b> экземпляр (оригинал цел), но копия <span class="hl">мелкая</span>: ссылочный член общий (ReferenceEquals True). Глубокой копии нет.' },
    { icon: "avoid", k: "Типы и синтез", v: 'Два разных record с одинаковыми полями <b>не равны</b> (EqualityContract, runtime-тип). <code>record struct</code> — value type. Override <code>Equals</code>/<code>==</code>/<code>EqualityContract</code> вручную и член <code>Clone</code> — <span class="hl">ошибка</span>.' },
  ],

  foot: 'урок · <b>records</b> · 5 анимир. разборов · панель value-vs-reference equality · синтез методов · дизайн <b>mid</b>',
};
