/**
 * Lesson: Generic math — static abstract члены и INumber<T> (CS.S10.generic-math) — expert density,
 * 6 animated deep-dives. The C# 11 / .NET 7 capstone of the section: before generic math you needed
 * one overload per numeric type; now an interface can declare `static abstract`/`static virtual`
 * members (operators, T.Zero, T.One), a type parameter can be constrained to INumber<T>, and ONE
 * generic method works for every numeric type. Covers what static abstract members are, why they
 * need the self-constraint (T : INumber<T>), that dispatch is COMPILE-TIME (not runtime virtual),
 * and INumber<T> in the interface hierarchy.
 *
 * SIGNATURE machine panel (s6): one Add<T> where T : INumber<T> works for int / double / long — a
 * single generic method replacing per-type overloads. REAL run-csharp measurement (this file's exec
 * cards): c1 "7 4 30" · c2 "10 7" (T.Zero + operator over int[] and double[]) · c3 "0" (a custom
 * static-abstract interface member on your own struct).
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../keywords/interface
 * (ms-iface, the static-abstract-and-virtual-members section) and .../standard/generics/math
 * (ms-math) (both fetched + substring-checked 2026-07-21):
 *   - every English quote is VERBATIM from the EXACT page listed in that segment's/item's sources;
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "7 4 30" · c2 "10 7" · c3 "0".
 *   - .NET 10 backend runs INumber<T>/static-abstract members; ALL cards run in the Roslyn
 *     CSharpScript sandbox — no non-runnable card in this lesson.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.generic-math/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the problem — one overload per numeric type.
const Z_OLD: Zone = { id: "old", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "РАНЬШЕ · перегрузка на тип", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "Add(int) · Add(float) · …", subCls: "vz-zsub heap", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ТЕПЕРЬ · один generic", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Add<T> where T:INumber<T>", subCls: "vz-zsub good", subY: 47 };
const PROB_ZONES: Zone[] = [Z_OLD, Z_NEW];

// s2: static abstract members in interfaces.
const Z_IFACE: Zone = { id: "iface", x: 14, y: 34, w: 312, h: 210, cls: "vz-zone", label: "ИНТЕРФЕЙС С static abstract / static virtual", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "операторы, T.Zero, T.One — обязан реализовать тип", subCls: "vz-zsub", subY: 47 };
const IFACE_ZONES: Zone[] = [Z_IFACE];

// s3: the self-constraint T : INumber<T>.
const Z_SELF: Zone = { id: "self", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "T : INumber<T>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "self-constraint (CRTP)", subCls: "vz-zsub", subY: 47 };
const Z_RESOLVE: Zone = { id: "resolve", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "T = int → int.op_Addition", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "члены int", subCls: "vz-zsub good", subY: 47 };
const SELF_ZONES: Zone[] = [Z_SELF, Z_RESOLVE];

// s4: compile-time dispatch, not runtime virtual.
const Z_COMPILE: Zone = { id: "compile", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РАЗРЕШЕНИЕ · компиляция", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "по типу-аргументу", subCls: "vz-zsub good", subY: 47 };
const Z_NOVTABLE: Zone = { id: "novtable", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "НЕТ runtime-vtable", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "не как class virtual", subCls: "vz-zsub", subY: 47 };
const DISPATCH_ZONES: Zone[] = [Z_COMPILE, Z_NOVTABLE];

// s5: INumber<T> in the interface hierarchy.
const Z_HIER: Zone = { id: "hier", x: 14, y: 34, w: 312, h: 210, cls: "vz-zone", label: "ИЕРАРХИЯ ЧИСЛОВЫХ ИНТЕРФЕЙСОВ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "INumber<T> ← IAdditionOperators, INumberBase …", subCls: "vz-zsub", subY: 47 };
const HIER_ZONES: Zone[] = [Z_HIER];

// s6 (SIGNATURE): one Add<T> works for int/double/long — measured.
const Z_ONE: Zone = { id: "one", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "ОДИН Add<T>", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "where T:INumber<T>", subCls: "vz-zsub", subY: 47 };
const Z_MANY: Zone = { id: "many", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone good", label: "ВСЕ ЧИСЛА", labelCls: "vz-zlabel good sm", lx: 241, ly: 24, sub: "int · double · long", subCls: "vz-zsub good", subY: 47 };
const ADD_ZONES: Zone[] = [Z_ONE, Z_MANY];

export const genericMath: LessonData = {
  id: "CS.S10.generic-math",
  track: "CS",
  section: "CS.S10",
  module: "S10.8",
  lang: "csharp",
  title: "Generic math: static abstract члены и INumber<T>",
  kicker: "C# вглубь · S10 · static abstract (C# 11)",
  home: { subtitle: "static abstract/virtual в интерфейсе, INumber<T>, один generic на все числа", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-iface", kind: "doc", org: "Microsoft Learn", title: "interface keyword - C# reference", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface", date: "2026-01-21" },
    { id: "ms-math", kind: "doc", org: "Microsoft Learn", title: "Generic math - .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/math", date: "2022-08-12" },
  ],

  spec: [
    { text: "«An interface can declare static abstract and static virtual members for all member types except fields. By declaring these members, an interface can require that implementing types define operators or other static members.» <span class=\"ru-tr\">«Интерфейс может объявлять static abstract и static virtual члены для всех видов членов, кроме полей. Объявляя эти члены, интерфейс может требовать, чтобы реализующие типы определяли операторы или другие static-члены.»</span>", source: "ms-iface" },
  ],
  edgeCases: [
    { text: "Диспетчер — <b>компиляция</b>, не runtime-vtable: «The <code>static virtual</code> and <code>static abstract</code> methods declared in interfaces <span class=\"hl\">don't have a runtime dispatch mechanism</span> analogous to <code>virtual</code> or <code>abstract</code> methods declared in classes. Instead, the compiler uses type information available at compile time». <span class=\"ru-tr\">«Методы <code>static virtual</code> и <code>static abstract</code>, объявленные в интерфейсах, не имеют механизма диспетчеризации во время выполнения, аналогичного методам <code>virtual</code> или <code>abstract</code>, объявленным в классах. Вместо этого компилятор использует информацию о типах, доступную во время компиляции».</span>", source: "ms-iface" },
    { text: "Self-constraint обязателен: «most interfaces that declare <code>static virtual</code> or <code>static abstract</code> methods declare that <span class=\"hl\">one of the type parameters must implement the declared interface</span>. For example, the <code>INumber&lt;T&gt;</code> interface declares that <code>T</code> must implement <code>INumber&lt;T&gt;</code>». <span class=\"ru-tr\">«большинство интерфейсов, объявляющих методы <code>static virtual</code> или <code>static abstract</code>, объявляют, что один из типов-параметров обязан реализовать объявленный интерфейс. Например, интерфейс <code>INumber&lt;T&gt;</code> объявляет, что <code>T</code> обязан реализовать <code>INumber&lt;T&gt;</code>».</span>", source: "ms-iface" },
    { text: "Один generic на все числа: «Now you can write a <b>single, generic method</b>, where the type parameter is constrained to be a number-like type» <span class=\"ru-tr\">«Теперь можно написать <b>один обобщённый метод</b>, где тип-параметр ограничен числоподобным типом»</span> — «any of .NET's built-in numeric types, because they've all been updated to implement <code>INumber&lt;TSelf&gt;</code> in .NET 7». <span class=\"ru-tr\">«любой из встроенных числовых типов .NET, поскольку все они были обновлены для реализации <code>INumber&lt;TSelf&gt;</code> в .NET 7».</span>", source: "ms-math" },
  ],

  misconceptions: [
    {
      wrong: "чтобы написать обобщённый Sum/Add, приходится делать отдельную перегрузку на каждый числовой тип — по-другому никак",
      hook: 'Так было <b>до C# 11</b>. Раньше: «previously you had to add an overload of the method <span class="hl">for each type</span> (for example, <code>static int Add(int first, int second)</code> and <code>static float Add(float first, float second)</code>)». <span class="ru-tr">«раньше приходилось добавлять перегрузку метода для каждого типа (например, <code>static int Add(int first, int second)</code> и <code>static float Add(float first, float second)</code>)».</span> Теперь интерфейс умеет объявлять <code>static abstract</code>-члены (в т.ч. операторы), а тип-параметр можно ограничить <code>INumber&lt;T&gt;</code> — и «Now you can write a <span class="hl">single, generic method</span>». <span class="ru-tr">«Теперь можно написать один обобщённый метод».</span> Ключ — <code>static abstract</code>: «An interface can declare <code>static abstract</code> and <code>static virtual</code> members… an interface can <b>require that implementing types define operators</b> or other static members». <span class="ru-tr">«Интерфейс может объявлять <code>static abstract</code> и <code>static virtual</code> члены… интерфейс может <b>требовать, чтобы реализующие типы определяли операторы</b> или другие static-члены».</span> Дальше <b>шесть разборов</b>: проблема перегрузок, что такое static abstract, self-constraint <code>T : INumber&lt;T&gt;</code>, compile-time диспетчер, иерархия числовых интерфейсов, и <b>машинная панель</b> — один <code>Add&lt;T&gt;</code> на int/double/long (реальный прогон: 7 4 30).',
      source: ["ms-math", "ms-iface"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Проблема · перегрузка на тип", title: "До C# 11: свой Add на каждый числовой тип",
      viewBox: "0 0 340 210", zones: PROB_ZONES,
      code: ["static int   Add(int a, int b)     => a + b;   // до C# 11 —", "static float Add(float a, float b) => a + b;   // копия на КАЖДЫЙ тип", "static T Add<T>(T a, T b) where T : INumber<T> => a + b;  // C# 11: один"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Раньше нельзя было написать <code>a + b</code> для абстрактного <code>T</code>: <code>+</code> — <b>static</b>-оператор, а constraint не давал его вызвать. Приходилось <span class="hl">дублировать</span> метод.', nodes: [{ id: "o", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Add(int)", value: "копия" }, { id: "o2", kind: "obj", at: { zone: "old", row: 1 }, typeTag: "Add(float)", value: "копия", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'C# 11 + .NET 7: <code>where T : INumber&lt;T&gt;</code> разблокирует <code>+</code> для <code>T</code> — <b>один</b> обобщённый метод на все числа.', nodes: [{ id: "o", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Add(int)", value: "копия" }, { id: "n", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "Add<T>", value: "INumber<T>", accent: true }], edges: [{ id: "e", from: "o", to: "n", accent: true }] },
      ],
      explain: 'Отправная точка — старая боль: обобщить арифметику было нельзя, потому что операторы — <b>static</b>-члены, а до C# 11 интерфейс не мог их требовать. Дословно: «if you wanted to write a method that adds two numbers, previously you had to add an overload of the method <span class="hl">for each type</span> (for example, <code>static int Add(int first, int second)</code> and <code>static float Add(float first, float second)</code>)». <span class="ru-tr">«если вы хотели написать метод, складывающий два числа, раньше приходилось добавлять перегрузку метода для каждого типа (например, <code>static int Add(int first, int second)</code> и <code>static float Add(float first, float second)</code>)».</span> Решение — два нововведения вместе: «.NET 7 introduces new math-related generic interfaces… C# 11 and later lets you define <code>static virtual</code> interface members. Because operators must be declared as <code>static</code>, this new C# feature lets operators be declared in the new interfaces for number-like types». <span class="ru-tr">«.NET 7 вводит новые обобщённые интерфейсы, связанные с математикой… C# 11 и новее позволяет определять <code>static virtual</code> члены интерфейса. Поскольку операторы должны объявляться как <code>static</code>, эта новая возможность C# позволяет объявлять операторы в новых интерфейсах для числоподобных типов».</span> Итог: «Now you can write a <span class="hl">single, generic method</span>, where the type parameter is constrained to be a number-like type». <span class="ru-tr">«Теперь можно написать один обобщённый метод, где тип-параметр ограничен числоподобным типом».</span>',
      sources: ["ms-math"],
    },
    {
      id: "s2", num: "02", kicker: "static abstract · члены", title: "Интерфейс требует static-члены: операторы, T.Zero",
      viewBox: "0 0 340 252", zones: IFACE_ZONES,
      code: ["interface IAddable<T> where T : IAddable<T> {", "  static abstract T operator +(T a, T b);   // ОБЯЗАН реализовать тип", "  static abstract T Zero { get; }            // static-свойство тоже", "}"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>static abstract T operator +</code> — интерфейс <b>требует</b>, чтобы реализующий тип определил <span class="hl">оператор</span>. Раньше static-члены в контракт не выносились.', nodes: [{ id: "op", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "static abstract operator +", detail: "тип обязан", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Не только операторы: <code>static abstract T Zero</code> — тип обязан дать свой <b>ноль</b>. «for all member types except fields». <span class="ru-tr">«для всех видов членов, кроме полей».</span>', nodes: [{ id: "op", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "operator +", detail: "тип обязан" }, { id: "z", kind: "gate", at: { zone: "iface", row: 1 }, state: "ok", label: "static abstract Zero", detail: "T.Zero", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Это и есть механизм generic math: интерфейс <span class="hl">требует</span> набор static-членов, а обобщённый код вызывает их через <code>T</code>.', nodes: [{ id: "op", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "operator +", detail: "требование" }, { id: "z", kind: "gate", at: { zone: "iface", row: 1 }, state: "ok", label: "Zero / One", detail: "требование" }, { id: "u", kind: "chip", at: { zone: "iface", row: 2 }, value: "T.Zero, a + b — доступны в generic", accent: true }], edges: [] },
      ],
      explain: 'Фундамент — <code>static abstract</code>/<code>static virtual</code> члены интерфейса (C# 11). Дословно: «An interface can declare <code>static abstract</code> and <code>static virtual</code> members <span class="hl">for all member types except fields</span>. By declaring these members, an interface can <b>require that implementing types define operators or other static members</b>. This feature enables generic algorithms to specify number-like behavior». <span class="ru-tr">«Интерфейс может объявлять <code>static abstract</code> и <code>static virtual</code> члены для всех видов членов, кроме полей. Объявляя эти члены, интерфейс может <b>требовать, чтобы реализующие типы определяли операторы или другие static-члены</b>. Эта возможность позволяет обобщённым алгоритмам задавать числоподобное поведение».</span> Обычно такие члены — операторы: «Typically, <code>static virtual</code> methods declare that an implementation must define a set of overloaded operators». <span class="ru-tr">«Как правило, методы <code>static virtual</code> объявляют, что реализация обязана определить набор перегруженных операторов».</span> Разница <code>abstract</code> vs <code>virtual</code>: <code>static abstract</code> обязателен к реализации, <code>static virtual</code> может иметь дефолт. Именно на этом стоит <code>INumber&lt;T&gt;</code>: он объявляет операторы и константы (<code>Zero</code>, <code>One</code>) как static-члены, которые каждый числовой тип реализует, а обобщённый код вызывает через <code>T</code>.',
      sources: ["ms-iface"],
    },
    {
      id: "s3", num: "03", kicker: "Self-constraint · T : INumber<T>", title: "Тип-параметр обязан реализовать сам интерфейс",
      viewBox: "0 0 340 210", zones: SELF_ZONES,
      code: ["public interface INumber<TSelf> where TSelf : INumber<TSelf> { ... }", "static T Add<T>(T a, T b) where T : INumber<T> => a + b;", "Add(3, 4)   // T=int → int реализует INumber<int> → зовётся int.op_Addition"],
      predictAt: 1, predictQ: '<code>Add&lt;T&gt;(T a, T b) where T : INumber&lt;T&gt;</code> с <code>=&gt; a + b</code>. Что даст <code>Add(3, 4)</code>? Откуда компилятор берёт оператор <code>+</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>INumber&lt;TSelf&gt; where TSelf : INumber&lt;TSelf&gt;</code> — <b>self-constraint</b> (CRTP): тип обязан реализовать <span class="hl">сам</span> интерфейс, параметризованный собой.', nodes: [{ id: "s", kind: "gate", at: { zone: "self", row: 0 }, state: "ok", label: "T : INumber<T>", detail: "self-constraint", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'При <code>Add(3,4)</code> компилятор знает <code>T=int</code>, а <code>int</code> реализует <code>INumber&lt;int&gt;</code> → <code>+</code> берётся из <span class="hl">int.op_Addition</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "self", row: 0 }, state: "ok", label: "T = int", detail: "int : INumber<int>" }, { id: "r", kind: "gate", at: { zone: "resolve", row: 0 }, state: "ok", label: "int.op_Addition", detail: "3 + 4", accent: true }], edges: [{ id: "e", from: "s", to: "r", accent: true }] },
        { codeLine: 2, out: "7", caption: 'Панель: <code>Add(3,4)</code> = <span class="hl">7</span> (реальный прогон). Обобщённый <code>+</code> разрешён в конкретный <code>int</code>-оператор по типу-аргументу.', nodes: [{ id: "r", kind: "gate", at: { zone: "resolve", row: 0 }, state: "ok", label: "Add(3,4)", detail: "7", accent: true }], edges: [] },
      ],
      explain: 'Почему сигнатура именно <code>T : INumber&lt;T&gt;</code>, а не <code>T : INumber</code>. Дословно: «most interfaces that declare <code>static virtual</code> or <code>static abstract</code> methods declare that <span class="hl">one of the type parameters must implement the declared interface</span>. For example, the <code>INumber&lt;T&gt;</code> interface declares that <code>T</code> must implement <code>INumber&lt;T&gt;</code>». <span class="ru-tr">«большинство интерфейсов, объявляющих методы <code>static virtual</code> или <code>static abstract</code>, объявляют, что один из типов-параметров обязан реализовать объявленный интерфейс. Например, интерфейс <code>INumber&lt;T&gt;</code> объявляет, что <code>T</code> обязан реализовать <code>INumber&lt;T&gt;</code>».</span> Это self-constraint (шаблон CRTP): он даёт компилятору <b>конкретный тип</b>, на котором объявлены static-операторы. Как разрешается вызов: «The compiler uses the type argument to resolve calls to the methods and operators declared in the interface declaration. For example, the <code>int</code> type implements <code>INumber&lt;int&gt;</code>. When the type parameter <code>T</code> denotes the type argument <code>int</code>, the <span class="hl">static members declared on <code>int</code> are invoked</span>». <span class="ru-tr">«Компилятор использует тип-аргумент, чтобы разрешить вызовы методов и операторов, объявленных в объявлении интерфейса. Например, тип <code>int</code> реализует <code>INumber&lt;int&gt;</code>. Когда тип-параметр <code>T</code> обозначает тип-аргумент <code>int</code>, вызываются static-члены, объявленные на <code>int</code>».</span> Поэтому <code>Add(3,4)</code> вызывает именно <code>int</code>-оператор сложения и даёт <code>7</code>.',
      sources: ["ms-iface"],
    },
    {
      id: "s4", num: "04", kicker: "Диспетчер · компиляция", title: "static abstract разрешается на компиляции, не через vtable",
      viewBox: "0 0 340 210", zones: DISPATCH_ZONES,
      code: ["// class virtual: диспетчер в РАНТАЙМЕ по типу объекта (vtable)", "// interface static abstract: разрешается на КОМПИЛЯЦИИ по типу-аргументу T", "Add(3, 4)   // компилятор уже знает T=int → прямой вызов int.op_Addition"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Не как <code>virtual</code> в классе: у static abstract <span class="hl">нет runtime-диспетчера</span>. Метод выбирается компилятором по типу-аргументу <code>T</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "compile", row: 0 }, state: "ok", label: "compile-time", detail: "по T", accent: true }, { id: "n", kind: "gate", at: { zone: "novtable", row: 0 }, state: "fail", label: "runtime vtable", detail: "нет" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Раз <code>T=int</code> известен на компиляции, вызов <code>+</code> <span class="hl">инлайнится</span> в конкретный <code>int</code>-оператор — быстро, без косвенности vtable.', nodes: [{ id: "c", kind: "gate", at: { zone: "compile", row: 0 }, state: "ok", label: "T = int", detail: "прямой вызов", accent: true }, { id: "n", kind: "gate", at: { zone: "novtable", row: 0 }, state: "fail", label: "vtable", detail: "не нужен" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Следствие: диспетчер по <b>compile-time</b> типу выражения — не по runtime-типу. Другой тип аргумента → другой разрешённый оператор.', nodes: [{ id: "c", kind: "gate", at: { zone: "compile", row: 0 }, state: "ok", label: "compile-time тип", detail: "решает", accent: true }], edges: [] },
      ],
      explain: 'Важное отличие от классической виртуальности: static abstract <b>не</b> использует runtime-vtable. Дословно: «The compiler must resolve calls to <code>static virtual</code> and <code>static abstract</code> methods at compile time. The <code>static virtual</code> and <code>static abstract</code> methods declared in interfaces <span class="hl">don\'t have a runtime dispatch mechanism</span> analogous to <code>virtual</code> or <code>abstract</code> methods declared in classes. Instead, the compiler uses type information available at compile time». <span class="ru-tr">«Компилятор обязан разрешать вызовы методов <code>static virtual</code> и <code>static abstract</code> во время компиляции. Методы <code>static virtual</code> и <code>static abstract</code>, объявленные в интерфейсах, не имеют механизма диспетчеризации во время выполнения, аналогичного методам <code>virtual</code> или <code>abstract</code>, объявленным в классах. Вместо этого компилятор использует информацию о типах, доступную во время компиляции».</span> Отсюда и требование self-constraint, и то, что «<code>static virtual</code> methods are almost exclusively declared in generic interfaces». <span class="ru-tr">«методы <code>static virtual</code> почти исключительно объявляются в обобщённых интерфейсах».</span> Практический нюанс (из important-блока): «Method dispatch for <code>static abstract</code> and <code>static virtual</code> methods declared in interfaces is resolved by using the <span class="hl">compile-time type</span> of an expression» <span class="ru-tr">«Диспетчеризация методов <code>static abstract</code> и <code>static virtual</code>, объявленных в интерфейсах, разрешается по compile-time типу выражения»</span> — если runtime-тип отличается от compile-time типа, вызовется static-метод базового (compile-time) типа. Плюс к производительности: обобщённый оператор разрешается в прямой вызов, без косвенности.',
      sources: ["ms-iface"],
    },
    {
      id: "s5", num: "05", kicker: "Иерархия · INumber<T>", title: "INumber<T> собран из мелких операторных интерфейсов",
      viewBox: "0 0 340 252", zones: HIER_ZONES,
      code: ["INumber<TSelf>       // real-числа: сравнимы, есть знак", "  : INumberBase<TSelf>  // общее для всех чисел: Zero, One, Radix", "IAdditionOperators<TSelf,TOther,TResult>  // оператор x + y", "// int, double, long, decimal, … реализуют INumber<TSelf>"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>INumber&lt;TSelf&gt;</code> — «APIs common to <span class="hl">comparable number types</span> (effectively the "real" number domain)». <span class="ru-tr">«API, общие для сравнимых числовых типов (по сути домен "вещественных" чисел)».</span> Самый частый constraint.', nodes: [{ id: "n", kind: "obj", at: { zone: "hier", row: 0 }, typeTag: "INumber<TSelf>", value: "real-числа", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Он собран из <b>мелких</b> интерфейсов: <code>IAdditionOperators</code> даёт <code>x + y</code>, <code>INumberBase</code> — <code>Zero</code>/<code>One</code>/<code>Radix</code>. Гранулярно.', nodes: [{ id: "n", kind: "obj", at: { zone: "hier", row: 0 }, typeTag: "INumber<TSelf>", value: "real-числа" }, { id: "a", kind: "chip", at: { zone: "hier", row: 1, col: 0 }, value: "IAdditionOperators: x+y", accent: true }, { id: "b", kind: "chip", at: { zone: "hier", row: 1, col: 1 }, value: "INumberBase: Zero/One" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Все встроенные числовые типы реализуют <code>INumber&lt;TSelf&gt;</code> — <span class="hl">int, double, long, decimal…</span> — потому обобщённый <code>Add&lt;T&gt;</code> работает для каждого.', nodes: [{ id: "n", kind: "obj", at: { zone: "hier", row: 0 }, typeTag: "INumber<TSelf>", value: "real-числа" }, { id: "t", kind: "chip", at: { zone: "hier", row: 2 }, value: "int · double · long · decimal", accent: true }], edges: [] },
      ],
      explain: 'Интерфейсы generic math спроектированы <b>гранулярно</b>: «fine-grained enough that users can define their own interfaces on top, while also being granular enough that they\'re easy to consume». <span class="ru-tr">«достаточно мелкозернистые, чтобы пользователи могли определять поверх свои собственные интерфейсы, и при этом достаточно гранулярные, чтобы их было легко использовать».</span> Самый ходовой — <code>INumber&lt;TSelf&gt;</code>, «APIs common to <span class="hl">comparable number types</span> (effectively the "real" number domain)». <span class="ru-tr">«API, общие для сравнимых числовых типов (по сути домен "вещественных" чисел)».</span> Он агрегирует мелкие операторные интерфейсы: «<code>INumber&lt;TSelf&gt;</code> implements the <code>IAdditionOperators&lt;TSelf,TOther,TResult&gt;</code> interface, which contains the <code>+</code> operator. That allows the method to generically add the two numbers». <span class="ru-tr">«<code>INumber&lt;TSelf&gt;</code> реализует интерфейс <code>IAdditionOperators&lt;TSelf,TOther,TResult&gt;</code>, который содержит оператор <code>+</code>. Это позволяет методу обобщённо складывать два числа».</span> Плюс <code>INumberBase&lt;TSelf&gt;</code> даёт <code>Zero</code>, <code>One</code>, <code>Radix</code>. Ключ к универсальности: «The method can be used with <span class="hl">any of .NET\'s built-in numeric types, because they\'ve all been updated to implement <code>INumber&lt;TSelf&gt;</code></span> in .NET 7» <span class="ru-tr">«Метод можно использовать с любым из встроенных числовых типов .NET, поскольку все они были обновлены для реализации <code>INumber&lt;TSelf&gt;</code> в .NET 7»</span> — <code>int</code>, <code>double</code>, <code>long</code>, <code>decimal</code> и другие.',
      sources: ["ms-math"],
    },
    {
      id: "s6", num: "06", kicker: "Машинная панель · один метод — все числа", title: "Один Add<T> работает для int, double и long",
      viewBox: "0 0 340 210", zones: ADD_ZONES,
      code: ["static T Add<T>(T a, T b) where T : INumber<T> => a + b;", "Add(3, 4)      // int    → 7", "Add(2.5, 1.5)  // double → 4", "Add(10L, 20L)  // long   → 30"],
      predictAt: 1, predictQ: 'Один <code>Add&lt;T&gt;(T,T) where T:INumber&lt;T&gt;</code>. Что даст <code>Add(3,4)</code>, <code>Add(2.5,1.5)</code>, <code>Add(10L,20L)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Один</b> метод <code>Add&lt;T&gt;</code> с <code>=&gt; a + b</code>. Раньше нужно было три перегрузки — теперь одна на все числовые типы.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Add<T>", value: "a + b", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Каждый вызов разрешает <code>+</code> в оператор <span class="hl">конкретного</span> типа: <code>int</code>→7, <code>double</code>→4, <code>long</code>→30. Без единой перегрузки.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Add<T>", value: "a + b" }, { id: "i", kind: "chip", at: { zone: "many", row: 0 }, value: "int → 7" }, { id: "d", kind: "chip", at: { zone: "many", row: 1 }, value: "double → 4", accent: true }], edges: [] },
        { codeLine: 3, out: "7 4 30", caption: 'Панель: <span class="hl">7 4 30</span> (реальный прогон) — <code>Add(2.5,1.5)</code>=4.0 печатается как 4. Один обобщённый метод обслужил три числовых типа.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Add<T>", value: "один метод" }, { id: "r", kind: "gate", at: { zone: "many", row: 0 }, state: "ok", label: "результат", detail: "7 · 4 · 30", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — обобщённая арифметика, снятая прогоном. Один <code>static T Add&lt;T&gt;(T a, T b) where T : INumber&lt;T&gt; =&gt; a + b</code> работает для любого числа: <code>Add(3,4)</code>=7 (int), <code>Add(2.5,1.5)</code>=4 (double, печатается без дробной части), <code>Add(10L,20L)</code>=30 (long). Реальный вывод — <code>7 4 30</code>. Механика ровно как в документации: constraint <code>INumber&lt;T&gt;</code> тянет <code>IAdditionOperators</code>, «which contains the <code>+</code> operator. That allows the method to generically add the two numbers», <span class="ru-tr">«который содержит оператор <code>+</code>. Это позволяет методу обобщённо складывать два числа»,</span> а компилятор разрешает <code>+</code> в static-оператор конкретного типа по <code>T</code>. Итог секции: reified generics + constraints + static abstract члены складываются в <b>generic math</b> — одну обобщённую реализацию на все числовые типы, без перегрузок и без боксинга.',
      sources: ["ms-math"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static T Add&lt;T&gt;(T a, T b) where T : INumber&lt;T&gt; =&gt; a + b; Console.WriteLine($"{Add(3, 4)} {Add(2.5, 1.5)} {Add(10L, 20L)}");</code> — что напечатает?',
      options: ["7 4 30", "7 4.0 30", "7 3 30", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: 'Один <code>Add&lt;T&gt;</code> с <code>T : INumber&lt;T&gt;</code> работает для всех чисел: <code>int</code>→7, <code>double</code>→4 (2.5+1.5=4.0, печатается как <code>4</code>), <code>long</code>→30. Вывод: <b>7 4 30</b>.',
      noText: 'Constraint <code>INumber&lt;T&gt;</code> тянет <code>IAdditionOperators</code> → <code>+</code> доступен. Компилятор разрешает оператор по типу-аргументу. Реальный вывод: <b>7 4 30</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "7 4 30" }, sourceRefs: ["ms-math"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static T Sum&lt;T&gt;(T[] xs) where T : INumber&lt;T&gt; { T acc = T.Zero; foreach (var x in xs) acc += x; return acc; } Console.WriteLine($"{Sum(new[]{1,2,3,4})} {Sum(new[]{1.5,2.5,3.0})}");</code> — что напечатает?',
      options: ["10 7", "10 7.0", "0 0", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: '<code>T.Zero</code> — static abstract-член <code>INumberBase&lt;T&gt;</code>: даёт ноль нужного типа. Сумма int-массива=10, double-массива=7 (1.5+2.5+3.0=7.0, печатается «7»). Вывод: <b>10 7</b>.',
      noText: '<code>T.Zero</code> и <code>+=</code> — static-члены, требуемые интерфейсом. Обобщённая свёртка работает для int и double одинаково. Реальный вывод: <b>10 7</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "10 7" }, sourceRefs: ["ms-math", "ms-iface"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IZero&lt;T&gt; where T : IZero&lt;T&gt; { static abstract T Zero { get; } } static T Id&lt;T&gt;() where T : IZero&lt;T&gt; =&gt; T.Zero; struct Money : IZero&lt;Money&gt; { public int Cents; public static Money Zero =&gt; new Money{Cents=0}; } Console.WriteLine($"{Id&lt;Money&gt;().Cents}");</code> — что напечатает?',
      options: ["0", "(ошибка компиляции)", "null", "Money"], correctIndex: 0, xp: 10,
      okText: 'Свой <code>static abstract T Zero</code>: <code>Money</code> обязан реализовать его (self-constraint <code>T : IZero&lt;T&gt;</code>). <code>Id&lt;Money&gt;()</code> зовёт <code>Money.Zero</code> → <code>Cents</code>=<span class="hl">0</span>.',
      noText: 'static abstract-член работает и на своём типе: <code>Money</code> реализует <code>IZero&lt;Money&gt;.Zero</code>, компилятор разрешает <code>T.Zero</code> в <code>Money.Zero</code>. Реальный вывод: <b>0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0" }, sourceRefs: ["ms-iface"],
    },
  ],

  takeaways: [
    { icon: "why", k: "static abstract члены", v: '«An interface can declare <span class="hl">static abstract and static virtual members</span>… require that implementing types define operators or other static members». <span class="ru-tr">«Интерфейс может объявлять static abstract и static virtual члены… требовать, чтобы реализующие типы определяли операторы или другие static-члены».</span> Это выносит операторы и <code>Zero</code>/<code>One</code> в контракт (C# 11).' },
    { icon: "cost", k: "Один generic на все числа", v: 'Раньше — перегрузка на каждый тип; теперь «a <span class="hl">single, generic method</span>» <span class="ru-tr">«один обобщённый метод»</span> с <code>where T : INumber&lt;T&gt;</code>. Работает для всех встроенных чисел (замер: <code>Add&lt;T&gt;</code> → 7 4 30; <code>Sum</code> с <code>T.Zero</code> → 10 7).' },
    { icon: "avoid", k: "Диспетчер — компиляция", v: 'static abstract «<span class="hl">don\'t have a runtime dispatch mechanism</span>» <span class="ru-tr">«не имеют механизма диспетчеризации во время выполнения»</span>: разрешается по compile-time типу-аргументу, не через vtable. Нужен self-constraint <code>T : INumber&lt;T&gt;</code> (замер своего <code>IZero&lt;Money&gt;</code>: 0).' },
  ],

  foot: 'урок · <b>generic math</b> · 6 анимир. разборов · static abstract · INumber<T> · панель один Add<T> на int/double/long · дизайн <b>mid</b>',
};
