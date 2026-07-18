/**
 * Lesson: Структуры — ловушки value-семантики (CS.S1.structs-traps) — expert density,
 * 5 animated deep-dives. What bites seniors about `struct`: mutation through an indexer or a
 * `readonly` field silently hits a COPY (defensive copy), `default(T)` ignores the parameterless
 * constructor, a `readonly` field of a reference type still lets the object mutate, and a struct
 * copies wholesale on every pass.
 *
 * SIGNATURE machine panel (s3): the DEFENSIVE COPY, proven by a real number — a `readonly` field
 * whose non-`readonly` method returns 11 while the field stays 10 (the compiler called the method
 * on a throwaway copy). REAL run-csharp measurement, evidence/F7/structs-traps-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against docs.microsoft (fetch 2026-07-18) + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../builtin-types/struct and
 *     .../advanced-topics/performance/ (defensive-copy wording);
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F7/structs-traps-exec.txt:
 *     mutable-struct-in-list 0; defensive copy "11 10"; default-vs-new "0 42");
 *   - NO GT-M3 red flags: struct CAN be immutable (readonly struct), readonly is shallow, readonly
 *     affects perf (defensive copy), default ignores the parameterless ctor.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.structs-traps/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the stack, where a struct variable holds its instance inline.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "экземпляр inline", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "общая · процесс", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_STACK, Z_HEAP];

// s2: the List's backing store beside the throwaway copy the indexer returns.
const Z_LIST: Zone = { id: "list", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "LIST<COUNTER>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "элемент в массиве", subCls: "vz-zsub", subY: 47 };
const Z_TMP: Zone = { id: "tmp", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ВРЕМЕННАЯ КОПИЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "list[0] возвращает копию", subCls: "vz-zsub heap", subY: 47 };
const LIST_ZONES: Zone[] = [Z_LIST, Z_TMP];

// s3 (SIGNATURE): the defensive-copy panel — the readonly field vs the copy the method mutates.
const Z_FIELD: Zone = { id: "field", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "readonly-ПОЛЕ V", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "оригинал · не тронут", subCls: "vz-zsub good", subY: 47 };
const Z_COPY: Zone = { id: "copy", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЗАЩИТНАЯ КОПИЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Bump() бежит здесь", subCls: "vz-zsub heap", subY: 47 };
const DEFCOPY_ZONES: Zone[] = [Z_FIELD, Z_COPY];

// s4: default vs new — two lanes, the zero pattern vs the constructed instance.
const Z_DEFAULT: Zone = { id: "def", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "default(P)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "0-бит · ctor ПРОПУЩЕН", subCls: "vz-zsub", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "new P()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ctor выполнен", subCls: "vz-zsub good", subY: 47 };
const DEFAULT_ZONES: Zone[] = [Z_DEFAULT, Z_NEW];

// s5: a readonly field of a reference type — the reference is frozen, the object is not.
const Z_REF: Zone = { id: "ref", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "readonly List Items", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "ссылку менять нельзя", subCls: "vz-zsub", subY: 47 };
const Z_OBJ: Zone = { id: "obj", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · List", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "содержимое меняется", subCls: "vz-zsub heap", subY: 47 };
const REFFIELD_ZONES: Zone[] = [Z_REF, Z_OBJ];

export const structsTraps: LessonData = {
  id: "CS.S1.structs-traps",
  track: "CS",
  section: "CS.S1",
  module: "S1.4",
  lang: "csharp",
  title: "Структуры: ловушки value-семантики",
  kicker: "C# вглубь · S1 · defensive copy",
  home: { subtitle: "readonly struct, защитная копия, мутабельные ловушки", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1.value-types-copy"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-struct", kind: "doc", org: "Microsoft Learn", title: "Structure types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct", date: "2026-01-14" },
    { id: "ms-readonly", kind: "doc", org: "Microsoft Learn", title: "readonly keyword (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly", date: "2025-07-01" },
    { id: "ms-perf", kind: "doc", org: "Microsoft Learn", title: "Avoid memory allocations and data copies (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/performance/", date: "2023-10-13" },
  ],

  spec: [
    { text: "«a `readonly` member can call a non-`readonly` member. In that case, the compiler creates a copy of the structure instance and calls the non-`readonly` member on that copy. As a result, the original structure instance isn't modified.»", source: "ms-struct" },
  ],
  edgeCases: [
    { text: "<code>default(T)</code> даёт <b>0-битный</b> паттерн и <span class=\"hl\">игнорирует</span> parameterless-конструктор; <code>new T()</code> — выполняет его. «the default value expression ignores a parameterless constructor».", source: "ms-struct" },
    { text: "В <code>readonly struct</code> член <b>мутабельного ссылочного типа</b> всё ещё может менять своё состояние: <code>List&lt;T&gt;</code> заменить нельзя, но добавить элементы — можно (иммутабельность shallow).", source: "ms-struct" },
    { text: "Структура не наследует класс/структуру и не может быть базой класса, <b>но реализует интерфейсы</b>; финализатора нет; конструктор обязан инициализировать все instance-поля.", source: "ms-struct" },
  ],

  misconceptions: [
    {
      wrong: "readonly struct полностью иммутабелен, а readonly — это чисто про корректность",
      hook: 'Две ложные интуиции разом. Первая — «<span class="wrong">readonly не влияет на перф</span>»: на деле <code>readonly</code>-член, зовущий не-<code>readonly</code> член, заставляет компилятор сделать <b>защитную копию</b> — «the compiler creates a copy of the structure instance and calls the non-<code>readonly</code> member on that copy». Вторая — «<span class="wrong">readonly struct иммутабелен насквозь</span>»: нет, <b>shallow</b> — ссылочный член внутри мутирует. Ниже <b>пять разборов</b>: мутация через индексатор бьёт в копию, <b>машинная панель</b> защитной копии (реально снятое 11 vs 10), <code>default</code> против <code>new</code>, и readonly-поле ссылочного типа.',
      source: "ms-struct",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Layout · экземпляр inline", title: "struct держит данные там, где объявлен",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["struct Counter { public int N; public void Inc() => N++; }", "var c = new Counter { N = 0 };"],
      scenes: [
        { codeLine: 0, caption: '<code>Counter</code> — <b>value-тип</b>: value-семантика, копируется целиком при присваивании/передаче.', nodes: [{ id: "hint", kind: "chip", at: { zone: "stack", row: 0 }, value: "struct = value" }], edges: [] },
        { codeLine: 1, caption: 'Переменная <b>c</b> держит экземпляр <span class="hl">inline на стеке</span>: поле N лежит в слоте, куча не тронута.', nodes: [{ id: "c", kind: "obj", at: { zone: "stack", row: 0 }, typeTag: "Counter c", value: "N:0", accent: true }, { id: "empty", kind: "chip", at: { zone: "heap", row: 0 }, value: "пусто" }], edges: [] },
      ],
      explain: 'Структуры имеют value-семантику дословно: «Structure types have <b>value semantics</b>. That is, a variable of a structure type <span class="hl">contains an instance</span> of the type. By default, the system copies variable values on assignment, when passing an argument to a method, and when returning a method result». Поэтому поле <code>N</code> живёт inline — на стеке для локальной переменной, внутри содержащего объекта для поля. И ровно из-за копирующей семантики офдок советует делать структуры иммутабельными: «Because structure types have value semantics, we recommend you define <b>immutable</b> structure types» — но сделать это правильно мешают ловушки ниже.',
      sources: ["ms-struct"],
    },
    {
      id: "s2", num: "02", kicker: "Ловушка · мутация через индексатор", title: "list[0].Inc() меняет копию, не элемент",
      viewBox: "0 0 340 210", zones: LIST_ZONES,
      code: ["var list = new List<Counter> { new Counter { N = 0 } };", "list[0].Inc();          // Inc() бежит на копии", "Console.WriteLine(list[0].N);"],
      predictAt: 1, predictQ: 'После <code>list[0].Inc()</code> — что напечатает <code>list[0].N</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В списке — элемент-структура <code>N=0</code>, хранится <span class="hl">по значению</span> в массиве List.', nodes: [{ id: "el", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "list[0]", value: "N:0", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>list[0]</b> — это индексатор: он <span class="hl">возвращает копию</span> элемента. <code>Inc()</code> инкрементит эту временную копию.', nodes: [{ id: "el", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "list[0]", value: "N:0" }, { id: "tmp", kind: "obj", at: { zone: "tmp", row: 0 }, typeTag: "копия", value: "N:1", accent: true }], edges: [] },
        { codeLine: 2, out: "0", caption: 'Копия выброшена — элемент в списке <b>по-прежнему N=0</b>. Печать: <span class="hl">0</span> (реальный прогон), а не 1.', nodes: [{ id: "el", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "list[0]", value: "N:0", accent: true }, { id: "gone", kind: "gate", at: { zone: "tmp", row: 0 }, state: "fail", label: "копия", detail: "выброшена" }], edges: [] },
      ],
      explain: 'Классическая ловушка mutable-структуры. Индексатор <code>List&lt;T&gt;.this[int]</code> возвращает <b>копию</b> value-элемента, а не ссылку на него; <code>Inc()</code> инкрементит эту копию, и она тут же уничтожается — элемент в списке остаётся <code>N=0</code> (реальный прогон: <b>0</b>). Это прямое следствие value-семантики: «For structure-type variables, the system copies an instance of the type». Именно такие «немые» мутации и есть причина рекомендации доки: делай структуры иммутабельными, тогда компилятор <span class="hl">запретит</span> <code>list[0].Inc()</code>, а не выполнит его вхолостую.',
      sources: ["ms-struct"],
    },
    {
      id: "s3", num: "03", kicker: "Машинная панель · защитная копия", title: "readonly-поле → метод бежит на копии (11 vs 10)",
      viewBox: "0 0 340 214", zones: DEFCOPY_ZONES,
      code: ["struct Val { public int N; public int Bump() { N++; return N; } }", "readonly struct Holder { public readonly Val V; ... }", "int Touch() => V.Bump();   // V — readonly, Bump — не readonly", "// Touch() вернёт 11, а V.N останется 10"],
      console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Поле <code>V</code> — <b>readonly</b>. Метод <code>Bump()</code> НЕ помечен readonly (меняет <code>N</code>). Компилятор не даст менять оригинал.', nodes: [{ id: "v", kind: "obj", at: { zone: "field", row: 0 }, typeTag: "V (readonly)", value: "N:10", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<span class="hl">Защитная копия</span>: компилятор копирует <code>V</code> и вызывает <code>Bump()</code> на копии — «creates a copy … and calls the non-<code>readonly</code> member on that copy».', nodes: [{ id: "v", kind: "obj", at: { zone: "field", row: 0 }, typeTag: "V (readonly)", value: "N:10" }, { id: "cp", kind: "obj", at: { zone: "copy", row: 0 }, typeTag: "копия V", value: "N:11", accent: true }], edges: [] },
        { codeLine: 3, out: "11 10", caption: '<code>Bump()</code> вернул <b>11</b> (инкремент копии), но <code>V.N</code> остался <b>10</b> — оригинал не тронут. Панель: <span class="hl">11 10</span> (реальный прогон).', nodes: [{ id: "v", kind: "obj", at: { zone: "field", row: 0 }, typeTag: "V.N", value: "10", accent: true }, { id: "cp", kind: "gate", at: { zone: "copy", row: 0 }, state: "ok", label: "Bump() →", detail: "вернул 11" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — защитная копия, снятая числом. Поле <code>V</code> — <code>readonly</code>, а <code>Bump()</code> — не-<code>readonly</code> (меняет <code>N</code>). Правило дословно: «a <code>readonly</code> member can call a non-<code>readonly</code> member. In that case, the compiler <span class="hl">creates a copy</span> of the structure instance and calls the non-<code>readonly</code> member <b>on that copy</b>. As a result, the original structure instance isn\'t modified». Прогон это подтверждает: <code>Touch()</code> вернул <b>11</b>, но <code>V.N == 10</code>. Практический вывод: скрытые defensive copies стоят перф; пометка <code>readonly struct</code>/<code>readonly</code>-члены их <b>устраняет</b> — «The compiler can make use of the <code>readonly</code> modifier for performance optimizations». Это и опровергает миф «readonly — чисто про корректность».',
      sources: ["ms-struct", "ms-perf"],
    },
    {
      id: "s4", num: "04", kicker: "default vs new · конструктор", title: "default(P) пропускает parameterless-конструктор",
      viewBox: "0 0 340 210", zones: DEFAULT_ZONES,
      code: ["struct P { public int X; public P() { X = 42; } }", "P a = default;    // 0-бит, ctor пропущен", "P b = new P();    // ctor выполнен → X=42", "Console.WriteLine($\"{a.X} {b.X}\");"],
      predictAt: 2, predictQ: 'У <code>P</code> есть <code>P(){X=42;}</code>. Что напечатает <code>a.X</code> (это <code>default</code>) и <code>b.X</code> (это <code>new P()</code>)?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>P a = default</code>: <span class="hl">0-битный паттерн</span>, parameterless-конструктор ПРОПУЩЕН → <code>X=0</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "a = default", value: "X:0", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>P b = new P()</code>: конструктор <b>выполняется</b> → <code>X=42</code>. Тот же тип, разный результат.', nodes: [{ id: "a", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "a = default", value: "X:0" }, { id: "b", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "b = new P()", value: "X:42", accent: true }], edges: [] },
        { codeLine: 3, out: "0 42", caption: 'Печать: <b>0 42</b> (реальный прогон). <code>default</code> ≠ <code>new T()</code>, когда есть parameterless-ctor.', nodes: [{ id: "a", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "a.X", value: "0", accent: true }, { id: "b", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "b.X", value: "42", accent: true }], edges: [] },
      ],
      explain: 'Тонкость, ломающая интуицию «default = new T()». Дословно: «the <span class="hl">default value expression ignores a parameterless constructor</span> and produces the default value of the structure type. Structure-type array instantiation also ignores a parameterless constructor». Прогон: <code>default</code> дал <code>X=0</code> (0-битный паттерн, ctor пропущен), <code>new P()</code> — <code>X=42</code> (ctor выполнен). Практическое следствие: <code>new P[10]</code> и <code>default(P)</code> НЕ вызывают твой parameterless-ctor — все поля обнуляются битово. «A struct assigned to its <code>default</code> value is initialized to the 0-bit pattern». Не полагайся на конструктор для инициализации в массивах структур.',
      sources: ["ms-struct"],
    },
    {
      id: "s5", num: "05", kicker: "readonly-поле ссылочного типа", title: "Ссылку заморозили — объект нет (shallow)",
      viewBox: "0 0 340 210", zones: REFFIELD_ZONES,
      code: ["class Box { public readonly List<int> Items = new(); }", "var box = new Box();", "box.Items.Add(5); box.Items.Add(9);  // ОК — мутируем объект", "// box.Items = new(); // ОШИБКА — подмена ссылки"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>readonly List&lt;int&gt; Items</code>: <b>ссылка</b> заморожена — на этот List указывает навсегда.', nodes: [{ id: "f", kind: "ref", at: { zone: "ref", row: 0 }, name: "Items", value: "readonly" }, { id: "list", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "List", value: "[]", accent: true }], edges: [{ id: "e", from: "f", to: "list" }] },
        { codeLine: 2, out: "", caption: '<code>Items.Add(5); Add(9)</code>: <span class="hl">содержимое объекта</span> меняется свободно — readonly не про это.', nodes: [{ id: "f", kind: "ref", at: { zone: "ref", row: 0 }, name: "Items", value: "readonly" }, { id: "list", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "List", value: "[5, 9]", accent: true }], edges: [{ id: "e", from: "f", to: "list" }] },
        { codeLine: 3, out: "2", caption: '<code>Count == 2</code>: объект изменился. А вот <code>Items = new()</code> — <span class="hl">ошибка компиляции</span>: подмену ссылки readonly запрещает.', nodes: [{ id: "f", kind: "ref", at: { zone: "ref", row: 0 }, name: "Items", value: "readonly" }, { id: "list", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "List", value: "[5, 9]" }, { id: "no", kind: "gate", at: { zone: "ref", row: 1 }, state: "fail", label: "Items = new()", detail: "CS0191" }], edges: [{ id: "e", from: "f", to: "list" }] },
      ],
      explain: '<code>readonly</code>-поле замораживает <b>ссылку</b>, а не объект за ней. Прогон: <code>Items.Add(5); Add(9)</code> прошли, <code>Count == 2</code> — содержимое List изменилось; а <code>Items = new()</code> не скомпилируется (подмена readonly-ссылки). Тот же shallow-принцип офдок формулирует для readonly struct: «In a <code>readonly</code> struct, a data member of a mutable reference type <span class="hl">still can mutate its own state</span>. For example, you can\'t replace a <code>List&lt;T&gt;</code> instance, but you can add new elements to it». Отсюда миф-ловушка: «readonly-поле ссылочного типа делает объект неизменяемым» — нет, оно запрещает лишь подмену ссылки.',
      sources: ["ms-struct"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>struct Counter{ public int N; public void Inc()=>N++; }</code><br/><code>var list = new List&lt;Counter&gt;{ new Counter{N=0} }; list[0].Inc(); Console.WriteLine(list[0].N);</code> — что напечатает?',
      options: ["0", "1", "ошибка компиляции", "2"], correctIndex: 0, xp: 10,
      okText: 'Индексатор <code>list[0]</code> возвращает <b>копию</b> value-элемента; <code>Inc()</code> инкрементит копию, которая тут же выбрасывается. Элемент в списке остаётся <span class="hl">N=0</span>.',
      noText: 'Value-семантика: <code>list[0]</code> — копия, не ссылка. Мутация не доходит до элемента — печатается <b>0</b>. Иммутабельный struct тут дал бы ошибку компиляции вместо тихого no-op.',
      verify: { kind: "exec", run: "dotnet run", expect: "0" }, sourceRefs: ["ms-struct"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>struct Val{ public int N; public int Bump(){ N++; return N; } }</code> · <code>readonly struct Holder{ public readonly Val V; public Holder(Val v){V=v;} public int Touch()=>V.Bump(); }</code><br/><code>var h=new Holder(new Val{N=10}); int r=h.Touch(); Console.WriteLine($"{r} {h.V.N}");</code> — что напечатает?',
      options: ["11 10", "11 11", "10 10", "10 11"], correctIndex: 0, xp: 10,
      okText: '<code>V</code> — readonly, <code>Bump()</code> — не readonly → компилятор делает <b>защитную копию</b> и зовёт <code>Bump()</code> на ней: <code>r=11</code>, а <code>V.N</code> остаётся <span class="hl">10</span>.',
      noText: '«the compiler creates a copy of the structure instance and calls the non-readonly member on that copy… the original isn\'t modified». Реальный вывод: <b>11 10</b> — метод инкрементил копию, поле цело.',
      verify: { kind: "exec", run: "dotnet run", expect: "11 10" }, sourceRefs: ["ms-struct"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>struct P{ public int X; public P(){ X=42; } }</code><br/><code>P a=default; P b=new P(); Console.WriteLine($"{a.X} {b.X}");</code> — что напечатает?',
      options: ["0 42", "42 42", "0 0", "42 0"], correctIndex: 0, xp: 10,
      okText: '<code>default</code> даёт <span class="hl">0-битный</span> паттерн и <b>пропускает</b> parameterless-конструктор → <code>a.X=0</code>. <code>new P()</code> выполняет ctor → <code>b.X=42</code>.',
      noText: '«the default value expression ignores a parameterless constructor». <code>default</code> ≠ <code>new T()</code>: реальный вывод <b>0 42</b>. Массивы структур (<code>new P[n]</code>) тоже обнуляются битово, минуя ctor.',
      verify: { kind: "exec", run: "dotnet run", expect: "0 42" }, sourceRefs: ["ms-struct"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Защитная копия", v: '<code>readonly</code>-член, зовущий не-<code>readonly</code> член, → компилятор делает <span class="hl">копию</span> и бежит на ней (замер: вернул 11, поле осталось 10). Помечай <code>readonly</code> — устраняет скрытые копии (перф).' },
    { icon: "cost", k: "Мутабельная ловушка", v: '<code>list[0].Inc()</code> над <code>List&lt;struct&gt;</code> меняет <b>копию</b> из индексатора, элемент цел (печатает 0). Иммутабельный struct превратил бы это в ошибку компиляции.' },
    { icon: "avoid", k: "default и shallow", v: '<code>default(T)</code> и <code>new T[n]</code> <b>пропускают</b> parameterless-ctor (0-бит). <code>readonly</code>-поле ссылочного типа замораживает ссылку, но не объект — иммутабельность структуры <span class="hl">shallow</span>.' },
  ],

  foot: 'урок · <b>структуры: ловушки</b> · 5 анимир. разборов · панель защитной копии 11 vs 10 · дизайн <b>mid</b>',
};
