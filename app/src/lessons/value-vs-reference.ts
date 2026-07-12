/**
 * Lesson: Значение vs ссылка (T1.M2.value-vs-reference) — the prerequisite of boxing.
 * Standard density (4 animated deep-dives) — flagged for later expert-density
 * expansion. Every claim is verified verbatim against learn.microsoft.com
 * (quotes retrieved 2026-07-09). Loop: card `c1` -> `T1.M2.value-vs-reference/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Auto-layout v2: zones carry an `id`; nodes declare only `at:{zone,row}` and the
// engine computes every x/y/w/h — no crooked frame is authorable.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "value · inline", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "reference · объект", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_STACK, Z_HEAP];

export const valueVsReference: LessonData = {
  id: "T1.M2.value-vs-reference",
  track: "T1",
  module: "M1.2",
  title: "Значение и ссылка",
  kicker: "Ядро C# · память · механика",
  home: { subtitle: "Стек и куча, копия по значению vs по ссылке", icon: "types", estMinutes: 7 },
  prereqs: [],
  depth: 3,
  version: "1",
  status: "self-pass",

  // COMPOSITE-QUOTES (frozen — do NOT extend, see types.ts):
  //   spec[0] (cs-value-types) · seg "contains-instance" explain · seg copy explain
  //   · seg struct-vs-class explain. Each stitches non-adjacent source sentences via «…».
  sources: [
    { id: "cs-value-types", kind: "doc", org: "Microsoft Learn", title: "Value types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types", date: "2024-09-27", archived: "https://web.archive.org/web/20240926112528/https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types" },
    { id: "cs-reference-types", kind: "doc", org: "Microsoft Learn", title: "Reference types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types", date: "2023-03-13", archived: "https://web.archive.org/web/20230319064757/https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types" },
    { id: "cs-classes", kind: "doc", org: "Microsoft Learn", title: "Classes (C# fundamentals)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes", date: "2024-11-06", archived: "https://web.archive.org/web/20241119160107/https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes" },
    { id: "cs-struct", kind: "doc", org: "Microsoft Learn", title: "Structure types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct", date: "2024-11-06", archived: "https://web.archive.org/web/20241116062207/https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct" },
    { id: "ms-gc", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22", archived: "https://web.archive.org/web/20251030225000/https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals" },
    { id: "ms-struct-guidelines", kind: "doc", org: "Microsoft Learn", title: "Choosing between class and struct", url: "https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct", date: "2008-10-22", archived: "https://web.archive.org/web/20220918192058/https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct" },
  ],

  spec: [{ text: "«A variable of a value type contains an instance of the type… [a] reference type… contains a reference to an instance of the type.»", source: "cs-value-types" }],
  edgeCases: [
    { text: "<code>struct</code> — value-тип: <code>var b = a</code> копирует данные целиком; мутация <code>b</code> не трогает <code>a</code>.", source: "cs-struct" },
    { text: "<code>class</code> — reference-тип: <code>var b = a</code> копирует ссылку; <code>a</code> и <code>b</code> смотрят на ОДИН объект.", source: "cs-classes" },
  ],

  misconceptions: [
    {
      wrong: "var b = a — это всегда копия данных",
      hook: '«<code>var b = a</code> — это копия» — верно <span class="wrong">только для value-типов</span>. У <code>struct</code> копируется значение целиком; у <code>class</code> копируется лишь <b>ссылка</b>, и оба имени указывают на <span class="wrong">один и тот же объект</span> на куче. Ниже — <b>четыре разбора</b> с анимацией: где живёт значение, копия по значению, копия по ссылке и почему один и тот же код даёт разный результат для struct и class.',
      source: "cs-value-types",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Две категории · где живёт", title: "Значение inline, ссылка — на куче",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["int   x = 5;", "Point a = new Point();"],
      scenes: [
        { codeLine: 0, caption: '<b>Value</b>-тип: переменная <span class="hl">содержит сам экземпляр</span> — значение 5 лежит прямо в слоте <code>x</code> на стеке.', nodes: [{ id: "x", kind: "slot", at: { zone: "stack", row: 0 }, name: "x", value: "5", accent: true }], edges: [] },
        { codeLine: 1, caption: '<b>Reference</b>-тип: <code>a</code> держит <span class="hl">ссылку</span> на объект на <b>куче</b>, а не сами данные.', nodes: [{ id: "x", kind: "slot", at: { zone: "stack", row: 0 }, name: "x", value: "5" }, { id: "a", kind: "ref", at: { zone: "stack", row: 1 }, name: "a", accent: true }, { id: "objA", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class Point", value: "X=1", accent: true }], edges: [{ id: "r", from: "a", to: "objA", accent: true }] },
      ],
      explain: 'C# делит все типы на две категории. <b>Value</b>-тип: «A variable of a value type <span class="hl">contains an instance</span> of the type». <b>Reference</b>-тип: «…which contains a <span class="hl">reference</span> to an instance of the type». Для класса дословно: «the variable holds a reference to an object <b>on the managed heap</b>. The variable doesn\'t hold the object data itself». Локальное значение живёт в стеке потока, а объект класса — в общей управляемой куче: «There\'s a managed heap for each managed process».',
      sources: ["cs-value-types", "cs-classes", "ms-gc"],
    },
    {
      id: "s2", num: "02", kicker: "struct · копия по значению", title: "Присваивание копирует значение",
      viewBox: "0 0 340 200", zones: MM_ZONES,
      code: ["var a = new P { X = 1 };", "var b = a;   // копия значения", "b.X = 9;", "Console.WriteLine(a.X);"],
      predictAt: 3, predictQ: 'Что напечатает <code>Console.WriteLine(a.X)</code> после <code>b.X = 9</code>, если <code>P</code> — это <code>struct</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>P</code> — <b>struct</b> (value-тип). <code>a</code> содержит собственный экземпляр: X = 1.', nodes: [{ id: "a", kind: "slot", at: { zone: "stack", row: 0 }, name: "a.X", value: "1" }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>var b = a</code> — копируется <span class="hl">значение целиком</span>: <code>b</code> получает независимую копию.', nodes: [{ id: "a", kind: "slot", at: { zone: "stack", row: 0 }, name: "a.X", value: "1" }, { id: "b", kind: "slot", at: { zone: "stack", row: 1 }, name: "b.X", value: "1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>b.X = 9</code> меняет только <span class="hl">копию</span> <code>b</code>; <code>a</code> не трогается.', nodes: [{ id: "a", kind: "slot", at: { zone: "stack", row: 0 }, name: "a.X", value: "1" }, { id: "b", kind: "slot", at: { zone: "stack", row: 1 }, name: "b.X", value: "9", accent: true }], edges: [] },
        { codeLine: 3, out: "1", caption: '<code>a.X</code> читает свой экземпляр → печатает <b>1</b>.', nodes: [{ id: "a", kind: "slot", at: { zone: "stack", row: 0 }, name: "a.X", value: "1", accent: true }, { id: "b", kind: "slot", at: { zone: "stack", row: 1 }, name: "b.X", value: "9" }], edges: [] },
      ],
      explain: 'Присваивание value-типа копирует данные целиком: «on assignment… you copy variable values. In the case of value-type variables, you copy the <span class="hl">corresponding type instances</span>». У struct семантика значения: «Structure types have <b>value semantics</b>… the system copies variable values on assignment». Поэтому «each variable has its own copy of the data. Operations on one variable [don\'t affect] the other» — <code>b.X = 9</code> не меняет <code>a</code>.',
      sources: ["cs-value-types", "cs-struct", "cs-reference-types"],
    },
    {
      id: "s3", num: "03", kicker: "class · копия по ссылке", title: "Присваивание копирует ссылку",
      viewBox: "0 0 340 200", zones: MM_ZONES,
      code: ["var a = new C { X = 1 };", "var b = a;   // копия ссылки", "b.X = 9;", "Console.WriteLine(a.X);"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>C</code> — <b>class</b> (reference-тип). <code>a</code> ссылается на объект на куче: X = 1.', nodes: [{ id: "a", kind: "ref", at: { zone: "stack", row: 0 }, name: "a" }, { id: "obj", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class C", value: "X=1" }], edges: [{ id: "ra", from: "a", to: "obj" }] },
        { codeLine: 1, out: "", caption: '<code>var b = a</code> — копируется <span class="hl">ссылка</span>: <code>b</code> указывает на ТОТ ЖЕ объект.', nodes: [{ id: "a", kind: "ref", at: { zone: "stack", row: 0 }, name: "a" }, { id: "b", kind: "ref", at: { zone: "stack", row: 1 }, name: "b", accent: true }, { id: "obj", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class C", value: "X=1" }], edges: [{ id: "ra", from: "a", to: "obj" }, { id: "rb", from: "b", to: "obj", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>b.X = 9</code> меняет <span class="hl">общий объект</span> — изменение видно и через <code>a</code>.', nodes: [{ id: "a", kind: "ref", at: { zone: "stack", row: 0 }, name: "a" }, { id: "b", kind: "ref", at: { zone: "stack", row: 1 }, name: "b" }, { id: "obj", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class C", value: "X=9", accent: true }], edges: [{ id: "ra", from: "a", to: "obj" }, { id: "rb", from: "b", to: "obj" }] },
        { codeLine: 3, out: "9", caption: '<code>a.X</code> читает тот же объект → печатает <b>9</b>.', nodes: [{ id: "a", kind: "ref", at: { zone: "stack", row: 0 }, name: "a", accent: true }, { id: "b", kind: "ref", at: { zone: "stack", row: 1 }, name: "b" }, { id: "obj", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class C", value: "X=9", accent: true }], edges: [{ id: "ra", from: "a", to: "obj", accent: true }, { id: "rb", from: "b", to: "obj" }] },
      ],
      explain: 'Класс — ссылочный тип: «Assigning a class variable to another variable <span class="hl">copies the reference</span>, so both variables point to the same object». Значит «two variables can reference the same object. Therefore, operations on one variable can <b>affect the object referenced by the other variable</b>». <code>b.X = 9</code> меняет общий объект — <code>a.X</code> тоже становится 9.',
      sources: ["cs-classes", "cs-reference-types"],
    },
    {
      id: "s4", num: "04", kicker: "struct vs class · один код", title: "Почему результат разный",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["struct SP { int X; }  // value", "class  CP { int X; }  // reference"],
      scenes: [
        { codeLine: 0, caption: '<b>struct</b> (value): <code>var y = x; y.X = 9;</code> — <code>y</code> это копия, <code>x.X</code> остаётся <b>1</b>.', nodes: [{ id: "x", kind: "slot", at: { zone: "stack", row: 0 }, name: "x.X", value: "1", accent: true }, { id: "y", kind: "slot", at: { zone: "stack", row: 1 }, name: "y.X", value: "9" }], edges: [] },
        { codeLine: 1, caption: '<b>class</b> (reference): та же строка — <code>x</code> и <code>y</code> делят объект, <code>x.X</code> становится <b>9</b>.', nodes: [{ id: "x", kind: "ref", at: { zone: "stack", row: 0 }, name: "x", accent: true }, { id: "y", kind: "ref", at: { zone: "stack", row: 1 }, name: "y" }, { id: "obj", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "class CP", value: "X=9", accent: true }], edges: [{ id: "e1", from: "x", to: "obj", accent: true }, { id: "e2", from: "y", to: "obj", accent: true }] },
      ],
      explain: '«A structure type… is a <b>value type</b>», а «A class is a <b>reference type</b>» — отсюда разное поведение при копировании. И размещение разное: «reference types are allocated on the heap… whereas value types are allocated either on the <span class="hl">stack</span> or <span class="hl">inline</span> in containing types». Один и тот же <code>var y = x; y.X = 9;</code> даёт <code>x.X == 1</code> для struct и <code>x.X == 9</code> для class.',
      sources: ["cs-struct", "cs-classes", "ms-struct-guidelines"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>struct P { public int X; }</code> · <code>var a = new P{X=1}; var b = a; b.X = 9;</code> — что напечатает <code>Console.WriteLine(a.X)</code>?',
      options: ["1", "9", "0", "ошибка компиляции"], correctIndex: 0, xp: 10,
      okText: '<code>P</code> — <b>value</b>-тип: <code>var b = a</code> копирует значение целиком, <code>b</code> — независимая копия. Мутация <code>b.X</code> не трогает <code>a</code> → <b>1</b>.',
      noText: '<b>9</b> было бы для <code>class</code> (общий объект по ссылке). Здесь <code>P</code> — <b>struct</b>: копия по значению, <code>a.X</code> остаётся <b>1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1" }, sourceRefs: ["cs-value-types", "cs-struct"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Две категории", v: 'Value содержит <span class="hl">сам экземпляр</span>; reference — <span class="hl">ссылку</span> на объект в куче.' },
    { icon: "cost", k: "Семантика копии", v: '<code>struct</code> копируется по значению (независимо); <code>class</code> делит один объект по ссылке.' },
    { icon: "avoid", k: "Когда что", v: 'Мелкое неизменяемое значение → <code>struct</code>; нужна идентичность / общий объект → <code>class</code>.' },
  ],

  foot: 'урок · value vs reference · 4 анимир. разбора · <b>стандартная плотность</b> (помечено для доводки) · дизайн <b>mid</b>',
};
