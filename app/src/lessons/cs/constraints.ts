/**
 * Lesson: where-ограничения — полный словарь (CS.S10.constraints) — expert density, 6 animated
 * deep-dives. The COMPLETE constraint vocabulary a senior needs: what constraints buy you (member
 * access beyond System.Object), the type-category gates (class / struct / notnull / unmanaged),
 * new(), base-class and interface constraints, the naked type-parameter constraint (T : U), the
 * `default` disambiguation constraint, and the C# 11+ `allows ref struct` anti-constraint — plus
 * the ordering/exclusivity rules. This COMPLEMENTS CS.S1.generics-basics, which only touched
 * struct/class/new(); S10 covers the FULL table + the newer members (notnull, unmanaged, default,
 * allows ref struct) and the mutual-exclusion/ordering rules.
 *
 * SIGNATURE machine panel (s6): a base-class constraint UNLOCKS a member — without `where T :
 * Employee` the compiler can only assume System.Object; with it, `e.Name` compiles and runs. REAL
 * run-csharp measurement (this file's exec cards): base-constraint -> Ann; interface constraint ->
 * 9 / pear; unmanaged -> 4 8 16.
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../generics/constraints-on-type-parameters (fetched + substring-checked
 * 2026-07-21, ms.date 2025-11-25):
 *   - every English quote is VERBATIM from that page (constraint-table rows + the opening
 *     "Constraints inform the compiler…" clause + the `allows ref struct` anti-constraint text);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "Ann" (base-class constraint unlocks e.Name) · c2 "4 8 16" (unmanaged + sizeof) ·
 *     c3 "9 pear" (interface constraint unlocks CompareTo).
 *   - The `where T : struct` rejecting Nullable<T> (CS0453) is shown as a non-exec compile panel
 *     (a non-compiling snippet can't be a predict-output card).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.constraints/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: why constraints — without them only System.Object members are visible.
const Z_NONE: Zone = { id: "none", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЕЗ CONSTRAINT", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "только члены object", subCls: "vz-zsub", subY: 47 };
const Z_WITH: Zone = { id: "with", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "С CONSTRAINT", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "члены типа доступны", subCls: "vz-zsub good", subY: 47 };
const WHY_ZONES: Zone[] = [Z_NONE, Z_WITH];

// s2: type-category gates — class / struct / notnull / unmanaged.
const Z_CAT: Zone = { id: "cat", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ГЕЙТЫ КАТЕГОРИИ ТИПА (максимум ОДИН, первым)", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "class · struct · notnull · unmanaged", subCls: "vz-zsub", subY: 40 };
const CAT_ZONES: Zone[] = [Z_CAT];

// s3: base class + interface constraints.
const Z_BASE: Zone = { id: "base", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БАЗОВЫЙ ТИП", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "where T : Base", subCls: "vz-zsub", subY: 47 };
const Z_IFACE: Zone = { id: "iface", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ИНТЕРФЕЙС", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "where T : IComparable<T>", subCls: "vz-zsub good", subY: 47 };
const BI_ZONES: Zone[] = [Z_BASE, Z_IFACE];

// s4: new() + naked type parameter (T : U).
const Z_NEW: Zone = { id: "newc", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "new()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "public ctor · ПОСЛЕДНИМ", subCls: "vz-zsub", subY: 47 };
const Z_NAKED: Zone = { id: "naked", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "T : U", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "связь двух параметров", subCls: "vz-zsub good", subY: 47 };
const NN_ZONES: Zone[] = [Z_NEW, Z_NAKED];

// s5: allows ref struct anti-constraint + default constraint.
const Z_ALLOW: Zone = { id: "allow", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "allows ref struct", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "анти-ограничение (C# 13)", subCls: "vz-zsub good", subY: 47 };
const Z_DEFC: Zone = { id: "defc", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "default", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "снимает неоднозначность", subCls: "vz-zsub", subY: 47 };
const AD_ZONES: Zone[] = [Z_ALLOW, Z_DEFC];

// s6 (SIGNATURE): base-class constraint unlocks a member — measured.
const Z_LOCKED: Zone = { id: "locked", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "e.Name ЗАКРЫТ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "без constraint", subCls: "vz-zsub heap", subY: 47 };
const Z_OPEN: Zone = { id: "openz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "e.Name ОТКРЫТ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "where T : Employee", subCls: "vz-zsub good", subY: 47 };
const UNLOCK_ZONES: Zone[] = [Z_LOCKED, Z_OPEN];

export const constraints: LessonData = {
  id: "CS.S10.constraints",
  track: "CS",
  section: "CS.S10",
  module: "S10.2",
  lang: "csharp",
  title: "where-ограничения: полный словарь",
  kicker: "C# вглубь · S10 · гейты типа",
  home: { subtitle: "class/struct/notnull/unmanaged/new()/база/интерфейс/T:U/default/allows ref struct", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-constraints", kind: "doc", org: "Microsoft Learn", title: "Constraints on type parameters (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters", date: "2025-11-25" },
    { id: "ms-gen-classes", kind: "doc", org: "Microsoft Learn", title: "Generic Classes (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generic-classes", date: "2015-07-20" },
  ],

  spec: [
    { text: "«Constraints inform the compiler about the capabilities a type argument must have. Without any constraints, the type argument could be any type. The compiler can only assume the members of System.Object, which is the ultimate base class for any .NET type.» <span class=\"ru-tr\">«Ограничения сообщают компилятору о возможностях, которыми должен обладать аргумент типа. Без каких-либо ограничений аргумент типа может быть любым типом. Компилятор может рассчитывать только на члены System.Object — конечного базового класса для любого типа .NET.»</span>", source: "ms-constraints" },
  ],
  edgeCases: [
    { text: "Гейты категории взаимоисключающи и идут <b>первыми</b>: «You can apply at most one of the <code>struct</code>, <code>class</code>, <code>class?</code>, <code>notnull</code>, and <code>unmanaged</code> constraints. If you supply any of these constraints, it must be the <span class=\"hl\">first constraint</span> specified for that type parameter». <span class=\"ru-tr\">«Можно применить не более одного из ограничений <code>struct</code>, <code>class</code>, <code>class?</code>, <code>notnull</code> и <code>unmanaged</code>. Если задать любое из этих ограничений, оно должно быть первым ограничением, указанным для этого параметра типа».</span>", source: "ms-constraints" },
    { text: "<code>struct</code> подразумевает <code>new()</code>: «Because all value types have an accessible parameterless constructor… the <code>struct</code> constraint implies the <code>new()</code> constraint and can't be combined with the <code>new()</code> constraint». <span class=\"ru-tr\">«Поскольку все типы-значения имеют доступный конструктор без параметров… ограничение <code>struct</code> подразумевает ограничение <code>new()</code> и не может сочетаться с ограничением <code>new()</code>».</span> <code>unmanaged</code> подразумевает <code>struct</code>.", source: "ms-constraints" },
    { text: "<code>new()</code> — всегда последним: «the <code>new()</code> constraint must be specified last». <span class=\"ru-tr\">«ограничение <code>new()</code> должно быть указано последним».</span> А <code>allows ref struct</code> — анти-ограничение — «must follow all constraints for that type parameter». <span class=\"ru-tr\">«должно следовать за всеми ограничениями для этого параметра типа».</span>", source: "ms-constraints" },
  ],

  misconceptions: [
    {
      wrong: "constraints — это просто про null-безопасность (class/struct), а больше и знать нечего",
      hook: 'Constraints — это <b>гейт возможностей</b>, а не только про null. Без них компилятор бессилен: «Constraints inform the compiler about the capabilities a type argument must have. Without any constraints, the type argument could be any type. <span class="hl">The compiler can only assume the members of System.Object</span>». <span class="ru-tr">«Ограничения сообщают компилятору о возможностях, которыми должен обладать аргумент типа. Без каких-либо ограничений аргумент типа может быть любым типом. Компилятор может рассчитывать только на члены System.Object».</span> Как только ты добавляешь <code>where T : Employee</code> или <code>where T : IComparable&lt;T&gt;</code>, компилятор пускает вызовы членов этого типа. Полный словарь шире, чем <code>class</code>/<code>struct</code>/<code>new()</code> из базового урока: есть <code>notnull</code>, <code>unmanaged</code>, базовый тип, интерфейс, связка <code>T : U</code>, <code>default</code> и анти-ограничение <code>allows ref struct</code> (C# 13). Дальше <b>шесть разборов</b>: зачем constraints, гейты категории, база+интерфейс, <code>new()</code>+<code>T:U</code>, <code>allows ref struct</code>+<code>default</code>, и <b>машинная панель</b> — как базовый constraint <span class="hl">открывает</span> член <code>e.Name</code> (реальный прогон: Ann).',
      source: "ms-constraints",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Зачем · только object без них", title: "Без constraint видны только члены System.Object",
      viewBox: "0 0 340 210", zones: WHY_ZONES,
      code: ["static void Use<T>(T x) { /* x.Foo() — нельзя: доступны только члены object */ }", "static string Name<T>(T e) where T : Employee => e.Name; // теперь можно"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Без constraint <code>T</code> может быть <b>любым</b> типом, поэтому компилятор «can only assume the <span class="hl">members of System.Object</span>» <span class="ru-tr">«может рассчитывать только на члены System.Object»</span>: <code>ToString</code>, <code>Equals</code>, <code>GetHashCode</code> — и всё.', nodes: [{ id: "n", kind: "gate", at: { zone: "none", row: 0 }, state: "fail", label: "x.Foo()", detail: "нет доступа", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>where T : Employee</code> — гарантия: «only objects of this type or derived from this type can replace that type argument». <span class="ru-tr">«только объекты этого типа или производные от него могут подставляться вместо этого аргумента типа».</span> Теперь <span class="hl">члены Employee</span> доступны.', nodes: [{ id: "n", kind: "gate", at: { zone: "none", row: 0 }, state: "fail", label: "x.Foo()", detail: "нет доступа" }, { id: "w", kind: "gate", at: { zone: "with", row: 0 }, state: "ok", label: "e.Name", detail: "разблокирован", accent: true }], edges: [{ id: "e", from: "n", to: "w", accent: true }] },
      ],
      explain: 'Constraint — это <b>контракт возможностей</b> типа-аргумента. Дословно: «Constraints inform the compiler about the capabilities a type argument must have. Without any constraints, the type argument could be any type. <span class="hl">The compiler can only assume the members of System.Object</span>, which is the ultimate base class for any .NET type». <span class="ru-tr">«Ограничения сообщают компилятору о возможностях, которыми должен обладать аргумент типа. Без каких-либо ограничений аргумент типа может быть любым типом. Компилятор может рассчитывать только на члены System.Object — конечного базового класса для любого типа .NET».</span> Смысл прямой: «You apply constraints to the type parameter when your generic class or method uses any operation on the generic members beyond simple assignment, which includes calling any methods not supported by <code>System.Object</code>». <span class="ru-tr">«Ограничения применяют к параметру типа, когда обобщённый класс или метод выполняет над обобщёнными членами любую операцию сложнее простого присваивания, включая вызов любых методов, не поддерживаемых <code>System.Object</code>».</span> Пример базового constraint: «the base class constraint tells the compiler that only objects of this type or derived from this type can replace that type argument. Once the compiler has this guarantee, it can allow methods of that type to be called in the generic class». <span class="ru-tr">«ограничение базового класса сообщает компилятору, что только объекты этого типа или производные от него могут подставляться вместо этого аргумента типа. Получив эту гарантию, компилятор разрешает вызывать методы этого типа в обобщённом классе».</span> Дальше — весь словарь гейтов.',
      sources: ["ms-constraints"],
    },
    {
      id: "s2", num: "02", kicker: "Гейты категории", title: "class / struct / notnull / unmanaged — максимум один, первым",
      viewBox: "0 0 340 276", zones: CAT_ZONES,
      code: ["where T : class      // reference type (в nullable-контексте — non-nullable)", "where T : struct     // non-nullable value type; подразумевает new()", "where T : notnull    // non-nullable value ИЛИ reference type", "where T : unmanaged  // non-nullable unmanaged; подразумевает struct"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>class</code> — «The type argument must be a <span class="hl">reference type</span>». <span class="ru-tr">«Аргумент типа должен быть ссылочным типом».</span> Пускает класс, интерфейс, делегат, массив.', nodes: [{ id: "c", kind: "gate", at: { zone: "cat", row: 0 }, state: "ok", label: "class", detail: "reference type", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>struct</code> — «a <span class="hl">non-nullable value type</span>, which includes <code>record struct</code>». <span class="ru-tr">«non-nullable тип-значение, включая <code>record struct</code>».</span> <code>int?</code> отсекается (CS0453). Подразумевает <code>new()</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cat", row: 0 }, state: "ok", label: "class", detail: "reference type" }, { id: "s", kind: "gate", at: { zone: "cat", row: 1 }, state: "ok", label: "struct", detail: "non-nullable value", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>notnull</code> — «a <span class="hl">non-nullable type</span>» <span class="ru-tr">«non-nullable тип»</span>: либо non-nullable value, либо non-nullable reference. Нарушение — <b>warning</b>, не error.', nodes: [{ id: "c", kind: "gate", at: { zone: "cat", row: 0 }, state: "ok", label: "class", detail: "reference type" }, { id: "s", kind: "gate", at: { zone: "cat", row: 1 }, state: "ok", label: "struct", detail: "non-nullable value" }, { id: "nn", kind: "gate", at: { zone: "cat", row: 2, col: 0 }, state: "ok", label: "notnull", detail: "value или ref", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>unmanaged</code> — «a non-nullable <span class="hl">unmanaged type</span>» <span class="ru-tr">«non-nullable неуправляемый тип»</span>: блоки памяти без ссылок (int, Guid, свой struct из value-полей). Подразумевает <code>struct</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cat", row: 0 }, state: "ok", label: "class", detail: "reference type" }, { id: "s", kind: "gate", at: { zone: "cat", row: 1 }, state: "ok", label: "struct", detail: "non-nullable value" }, { id: "nn", kind: "gate", at: { zone: "cat", row: 2, col: 0 }, state: "ok", label: "notnull", detail: "value или ref" }, { id: "um", kind: "gate", at: { zone: "cat", row: 2, col: 1 }, state: "ok", label: "unmanaged", detail: "блок памяти", accent: true }], edges: [] },
      ],
      explain: 'Четыре <b>гейта категории</b> отвечают на вопрос «какого рода тип». <code>class</code>: «The type argument must be a reference type. This constraint applies also to any class, interface, delegate, or array type». <span class="ru-tr">«Аргумент типа должен быть ссылочным типом. Это ограничение распространяется также на любой класс, интерфейс, делегат или массив».</span> <code>struct</code>: «The type argument must be a non-nullable value type, which includes <code>record struct</code> types… the <code>struct</code> constraint implies the <code>new()</code> constraint». <span class="ru-tr">«Аргумент типа должен быть non-nullable типом-значением, включая типы <code>record struct</code>… ограничение <code>struct</code> подразумевает ограничение <code>new()</code>».</span> <code>notnull</code>: «The type argument must be a non-nullable type. The argument can be a non-nullable reference type or a non-nullable value type» <span class="ru-tr">«Аргумент типа должен быть non-nullable типом. Аргументом может быть non-nullable ссылочный тип или non-nullable тип-значение».</span> — причём нарушение даёт warning, не error. <code>unmanaged</code>: «The type argument must be a non-nullable unmanaged type… The <code>unmanaged</code> constraint implies the <code>struct</code> constraint». <span class="ru-tr">«Аргумент типа должен быть non-nullable неуправляемым типом… ограничение <code>unmanaged</code> подразумевает ограничение <code>struct</code>».</span> Правило комбинирования: «You can apply <b>at most one</b> of the <code>struct</code>, <code>class</code>, <code>class?</code>, <code>notnull</code>, and <code>unmanaged</code> constraints. If you supply any of these constraints, it must be the <span class="hl">first constraint</span> specified». <span class="ru-tr">«Можно применить <b>не более одного</b> из ограничений <code>struct</code>, <code>class</code>, <code>class?</code>, <code>notnull</code> и <code>unmanaged</code>. Если задать любое из этих ограничений, оно должно быть первым указанным ограничением».</span>',
      sources: ["ms-constraints"],
    },
    {
      id: "s3", num: "03", kicker: "База и интерфейс", title: "where T : Base и where T : IИнтерфейс разблокируют члены",
      viewBox: "0 0 340 210", zones: BI_ZONES,
      code: ["where T : Employee          // T — Employee или наследник → доступен e.Name", "where T : IComparable<T>    // T реализует интерфейс → доступен a.CompareTo(b)", "// интерфейсов можно несколько; constraining-интерфейс может быть generic"],
      predictAt: 1, predictQ: 'В <code>Max&lt;T&gt;(T a, T b) where T : IComparable&lt;T&gt;</code> тело зовёт <code>a.CompareTo(b)</code>. Что даст <code>Max(3, 9)</code> и <code>Max("apple", "pear")</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Базовый тип</b>: «The type argument must be <span class="hl">or derive from the specified base class</span>». <span class="ru-tr">«Аргумент типа должен быть указанным базовым классом или производным от него».</span> <code>where T : Employee</code> открывает <code>e.Name</code> для T и наследников.', nodes: [{ id: "b", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "T : Employee", detail: "e.Name открыт", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>Интерфейс</b>: «must be <span class="hl">or implement the specified interface</span>». <span class="ru-tr">«должен быть указанным интерфейсом или реализовывать его».</span> <code>where T : IComparable&lt;T&gt;</code> открывает <code>CompareTo</code>. «Multiple interface constraints can be specified». <span class="ru-tr">«Можно указать несколько интерфейсных ограничений».</span>', nodes: [{ id: "b", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "T : Employee", detail: "e.Name открыт" }, { id: "i", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "T : IComparable<T>", detail: "CompareTo открыт", accent: true }], edges: [] },
        { codeLine: 1, out: "9 pear", caption: 'Панель: <code>Max(3,9)</code>=<b>9</b>, <code>Max("apple","pear")</code>=<span class="hl">pear</span> (реальный прогон) — оба типа реализуют <code>IComparable&lt;T&gt;</code>, <code>CompareTo</code> доступен.', nodes: [{ id: "i", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "int, string", detail: "IComparable" }, { id: "r", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "Max", detail: "9 / pear", accent: true }], edges: [] },
      ],
      explain: 'Два самых практичных constraint — по <b>базовому типу</b> и по <b>интерфейсу</b>. Базовый: «The type argument must be or derive from the specified base class». <span class="ru-tr">«Аргумент типа должен быть указанным базовым классом или производным от него».</span> Интерфейс: «The type argument must be or implement the specified interface. <span class="hl">Multiple interface constraints can be specified</span>. The constraining interface can also be generic». <span class="ru-tr">«Аргумент типа должен быть указанным интерфейсом или реализовывать его. Можно указать несколько интерфейсных ограничений. Ограничивающий интерфейс тоже может быть обобщённым».</span> Именно интерфейсный constraint даёт типобезопасные сравнения: «If you must test for value equality, apply the <code>where T : IEquatable&lt;T&gt;</code> or <code>where T : IComparable&lt;T&gt;</code> constraint and implement the interface». <span class="ru-tr">«Если нужно проверять равенство по значению, примените ограничение <code>where T : IEquatable&lt;T&gt;</code> или <code>where T : IComparable&lt;T&gt;</code> и реализуйте интерфейс».</span> Реальный прогон <code>Max&lt;T&gt;</code>: <code>int</code> и <code>string</code> реализуют <code>IComparable&lt;T&gt;</code>, поэтому <code>a.CompareTo(b)</code> компилируется и работает — <code>9</code> и <code>pear</code>. Правило: базовый constraint нельзя комбинировать с гейтами категории.',
      sources: ["ms-constraints"],
    },
    {
      id: "s4", num: "04", kicker: "new() и T : U", title: "new() (ctor, последним) и связка двух параметров T : U",
      viewBox: "0 0 340 210", zones: NN_ZONES,
      code: ["where T : new()             // public parameterless ctor → можно T t = new();", "class EmployeeList<T> where T : notnull, Employee, IComparable<T>, new() { }", "public void Add<U>(List<U> items) where U : T { }  // U — это T или наследник"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>new()</code> — «The type argument must have a <span class="hl">public parameterless constructor</span>». <span class="ru-tr">«Аргумент типа должен иметь публичный конструктор без параметров».</span> Позволяет <code>T t = new();</code> внутри дженерика.', nodes: [{ id: "n", kind: "gate", at: { zone: "newc", row: 0 }, state: "ok", label: "new()", detail: "T t = new()", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Порядок жёсткий: гейт категории <b>первым</b>, <code>new()</code> — <span class="hl">последним</span>. «the <code>new()</code> constraint must be specified last». <span class="ru-tr">«ограничение <code>new()</code> должно быть указано последним».</span>', nodes: [{ id: "n", kind: "gate", at: { zone: "newc", row: 0 }, state: "ok", label: "new()", detail: "последним ✓", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<b>Naked</b> <code>T : U</code> — связывает два параметра: «must be <span class="hl">or derive from the argument supplied for U</span>». <span class="ru-tr">«должен быть аргументом, поданным для U, или производным от него».</span> <code>Add&lt;U&gt;</code> берёт только <code>U</code>, совместимые с <code>T</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "newc", row: 0 }, state: "ok", label: "new()", detail: "последним" }, { id: "u", kind: "gate", at: { zone: "naked", row: 0 }, state: "ok", label: "U : T", detail: "U ⊆ T", accent: true }], edges: [] },
      ],
      explain: '<code>new()</code> и naked-type-parameter constraint — про <b>создание</b> и <b>связь параметров</b>. <code>new()</code>: «The type argument must have a public parameterless constructor. When used together with other constraints, <span class="hl">the <code>new()</code> constraint must be specified last</span>». <span class="ru-tr">«Аргумент типа должен иметь публичный конструктор без параметров. При использовании вместе с другими ограничениями ограничение <code>new()</code> должно быть указано последним».</span> Он не комбинируется со <code>struct</code>/<code>unmanaged</code> (те его уже подразумевают). Naked <code>T : U</code>: «The type argument supplied for <code>T</code> must be or derive from the argument supplied for <code>U</code>» <span class="ru-tr">«Аргумент типа, поданный для <code>T</code>, должен быть аргументом, поданным для <code>U</code>, или производным от него»</span> — используется, «when a member function with its own type parameter has to constrain that parameter to the type parameter of the containing type» <span class="ru-tr">«когда функция-член со своим собственным параметром типа должна ограничить этот параметр параметром типа содержащего типа»</span>, как <code>Add&lt;U&gt;(List&lt;U&gt;) where U : T</code>. Полный пример из доки: <code>class EmployeeList&lt;T&gt; where T : notnull, Employee, IComparable&lt;T&gt;, new()</code> — категория, база, интерфейс, ctor в правильном порядке.',
      sources: ["ms-constraints"],
    },
    {
      id: "s5", num: "05", kicker: "allows ref struct и default", title: "Анти-ограничение allows ref struct и разрешение default",
      viewBox: "0 0 340 210", zones: AD_ZONES,
      code: ["where T : allows ref struct  // T МОЖЕТ быть ref struct (Span<T>) — C# 13", "//   → нельзя боксить T, действуют ref safety rules, после всех constraints", "where T : default            // на override/explicit impl: НИ class, НИ struct"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>allows ref struct</code> — <b>анти-ограничение</b>: «declares that the type argument for <code>T</code> <span class="hl">can be a <code>ref struct</code> type</span>» <span class="ru-tr">«объявляет, что аргумент типа для <code>T</code> может быть типом <code>ref struct</code>»</span> (например <code>Span&lt;T&gt;</code>). Расширяет, а не сужает.', nodes: [{ id: "a", kind: "gate", at: { zone: "allow", row: 0 }, state: "ok", label: "allows ref struct", detail: "T = Span<T> ок", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Цена: «The generic type or method must <span class="hl">obey ref safety rules</span>» <span class="ru-tr">«Обобщённый тип или метод должен соблюдать правила ref-безопасности»</span> — <code>T</code> нельзя боксить, нельзя класть в static-поля. Идёт «must follow all constraints». <span class="ru-tr">«должно следовать за всеми ограничениями».</span>', nodes: [{ id: "a", kind: "gate", at: { zone: "allow", row: 0 }, state: "ok", label: "allows ref struct", detail: "ref safety" }, { id: "r", kind: "gate", at: { zone: "allow", row: 1 }, state: "fail", label: "box(T)", detail: "запрещён", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>default</code> — тонкий: «resolves the ambiguity when you need to specify an <span class="hl">unconstrained type parameter</span> when you override a method or provide an explicit interface implementation». <span class="ru-tr">«снимает неоднозначность, когда нужно указать параметр типа без ограничений при переопределении метода или явной реализации интерфейса».</span> Ни <code>class</code>, ни <code>struct</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "allow", row: 0 }, state: "ok", label: "allows ref struct", detail: "ref safety" }, { id: "d", kind: "gate", at: { zone: "defc", row: 0 }, state: "ok", label: "default", detail: "снимает ambiguity", accent: true }], edges: [] },
      ],
      explain: 'Два новых члена словаря — часто пропускаемые. <code>allows ref struct</code> (C# 13) — это <b>анти-ограничение</b>: «This anti-constraint declares that the type argument for <code>T</code> can be a <code>ref struct</code> type. The generic type or method must <span class="hl">obey ref safety rules</span> for any instance of <code>T</code> because it might be a <code>ref struct</code>». <span class="ru-tr">«Это анти-ограничение объявляет, что аргумент типа для <code>T</code> может быть типом <code>ref struct</code>. Обобщённый тип или метод должен соблюдать правила ref-безопасности для любого экземпляра <code>T</code>, поскольку он может быть <code>ref struct</code>».</span> Правила для такого <code>T</code>: «It can\'t be boxed» <span class="ru-tr">«Его нельзя боксить»</span>, «Instances can\'t be used where a <code>ref struct</code> type isn\'t allowed, such as <code>static</code> fields» <span class="ru-tr">«Экземпляры нельзя использовать там, где тип <code>ref struct</code> не разрешён, например в <code>static</code>-полях»</span>, и оно «must follow all constraints for that type parameter» <span class="ru-tr">«должно следовать за всеми ограничениями для этого параметра типа»</span> и «can\'t be combined with the <code>class</code> or <code>class?</code> constraint» <span class="ru-tr">«не может сочетаться с ограничением <code>class</code> или <code>class?</code>»</span>. <code>default</code> — редкий: «This constraint resolves the ambiguity when you need to specify an unconstrained type parameter when you override a method or provide an explicit interface implementation… The <code>default</code> constraint implies the base method without either the <code>class</code> or <code>struct</code> constraint». <span class="ru-tr">«Это ограничение снимает неоднозначность, когда нужно указать параметр типа без ограничений при переопределении метода или явной реализации интерфейса… Ограничение <code>default</code> подразумевает базовый метод без ограничения <code>class</code> или <code>struct</code>».</span>',
      sources: ["ms-constraints"],
    },
    {
      id: "s6", num: "06", kicker: "Машинная панель · constraint открывает член", title: "Без where T:Employee — e.Name закрыт; с ним — работает",
      viewBox: "0 0 340 210", zones: UNLOCK_ZONES,
      code: ["// static string Name<T>(T e) => e.Name;   // ❌ CS1061 — object не знает Name", "static string Name<T>(T e) where T : Employee => e.Name;  // ✓", "Console.WriteLine(Name(new Manager(\"Ann\")));  // Ann"],
      predictAt: 1, predictQ: 'С <code>where T : Employee</code> метод возвращает <code>e.Name</code>. Что напечатает <code>Name(new Manager("Ann"))</code>, где <code>Manager : Employee</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Без constraint <code>e.Name</code> — <b>ошибка компиляции</b> CS1061: у <code>object</code> нет <code>Name</code>. Член <span class="hl">закрыт</span>.', nodes: [{ id: "l", kind: "gate", at: { zone: "locked", row: 0 }, state: "fail", label: "e.Name", detail: "CS1061", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>where T : Employee</code> даёт гарантию: «only objects of this type or derived from this type». <span class="ru-tr">«только объекты этого типа или производные от него».</span> Компилятор <span class="hl">открывает</span> <code>e.Name</code>.', nodes: [{ id: "l", kind: "gate", at: { zone: "locked", row: 0 }, state: "fail", label: "e.Name", detail: "CS1061" }, { id: "o", kind: "gate", at: { zone: "openz", row: 0 }, state: "ok", label: "e.Name", detail: "разблокирован", accent: true }], edges: [{ id: "e", from: "l", to: "o", accent: true }] },
        { codeLine: 2, out: "Ann", caption: 'Панель: <code>Name(new Manager("Ann"))</code> → <span class="hl">Ann</span> (реальный прогон). <code>Manager</code> — наследник <code>Employee</code>, поэтому проходит гейт и <code>e.Name</code> работает.', nodes: [{ id: "o", kind: "gate", at: { zone: "openz", row: 0 }, state: "ok", label: "Manager : Employee", detail: "проходит" }, { id: "r", kind: "gate", at: { zone: "locked", row: 0 }, state: "ok", label: "e.Name", detail: "Ann", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — constraint как <b>ключ к члену</b>, снятый прогоном. Без <code>where T : Employee</code> тело <code>e.Name</code> не компилируется: компилятор «can only assume the members of <code>System.Object</code>» <span class="ru-tr">«может рассчитывать только на члены <code>System.Object</code>»</span>, а у <code>object</code> нет <code>Name</code> (CS1061). С constraint появляется гарантия: «the base class constraint tells the compiler that only objects of this type or derived from this type can replace that type argument. <span class="hl">Once the compiler has this guarantee, it can allow methods of that type to be called</span> in the generic class». <span class="ru-tr">«ограничение базового класса сообщает компилятору, что только объекты этого типа или производные от него могут подставляться вместо этого аргумента типа. Получив эту гарантию, компилятор разрешает вызывать методы этого типа в обобщённом классе».</span> Реальный прогон: <code>Manager : Employee</code> проходит гейт, <code>e.Name</code> возвращает <code>Ann</code>. Практический вывод из доки: «apply the maximum constraints possible that will still let you handle the types you must handle» <span class="ru-tr">«применяйте максимум ограничений, которые всё ещё позволяют обрабатывать нужные вам типы»</span> — чем точнее гейт, тем больше операций разблокировано.',
      sources: ["ms-constraints", "ms-gen-classes"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string NameOf&lt;T&gt;(T e) where T : Employee =&gt; e.Name; Console.WriteLine(NameOf(new Manager("Ann")));</code> где <code>class Employee { public string Name; ... } class Manager : Employee { ... }</code> — что напечатает?',
      options: ["Ann", "Manager", "(ошибка компиляции)", "Employee"], correctIndex: 0, xp: 10,
      okText: '<code>where T : Employee</code> разблокирует <code>e.Name</code> (без него — CS1061: компилятор «can only assume the members of System.Object» <span class="ru-tr">«может рассчитывать только на члены System.Object»</span>). <code>Manager</code> — наследник, проходит гейт → <span class="hl">Ann</span>.',
      noText: 'Базовый constraint даёт компилятору гарантию, что <code>T</code> — <code>Employee</code> или наследник, и открывает <code>e.Name</code>. <code>Manager("Ann")</code> → <b>Ann</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Ann" }, sourceRefs: ["ms-constraints"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>unsafe static int Size&lt;T&gt;() where T : unmanaged =&gt; sizeof(T); Console.WriteLine($"{Size&lt;int&gt;()} {Size&lt;double&gt;()} {Size&lt;Guid&gt;()}");</code> — что напечатает?',
      options: ["4 8 16", "4 8 8", "8 8 16", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: '<code>where T : unmanaged</code> позволяет <code>sizeof(T)</code> в unsafe-контексте: «reusable routines to work with types that can be manipulated as <span class="hl">blocks of memory</span>». <span class="ru-tr">«переиспользуемые процедуры для работы с типами, которыми можно манипулировать как блоками памяти».</span> <code>int</code>=4, <code>double</code>=8, <code>Guid</code>=16.',
      noText: 'unmanaged-тип — блок памяти без ссылок; <code>sizeof</code> возвращает его размер в байтах. <code>int</code> 4, <code>double</code> 8, <code>Guid</code> 16 → <b>4 8 16</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "4 8 16" }, sourceRefs: ["ms-constraints"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static T Max&lt;T&gt;(T a, T b) where T : IComparable&lt;T&gt; =&gt; a.CompareTo(b) &gt;= 0 ? a : b; Console.WriteLine($"{Max(3, 9)} {Max("apple", "pear")}");</code> — что напечатает?',
      options: ["9 pear", "3 apple", "9 apple", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: '<code>where T : IComparable&lt;T&gt;</code> разблокирует <code>a.CompareTo(b)</code>. <code>int</code> и <code>string</code> реализуют интерфейс: <code>Max(3,9)</code>=<b>9</b>, <code>Max("apple","pear")</code>=<span class="hl">pear</span> (лексикографически больше).',
      noText: 'Интерфейсный constraint даёт доступ к <code>CompareTo</code>. Для строк сравнение лексикографическое: "pear" > "apple". Вывод: <b>9 pear</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "9 pear" }, sourceRefs: ["ms-constraints"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Гейт возможностей", v: 'Без constraint компилятор «can only assume the <span class="hl">members of System.Object</span>». <span class="ru-tr">«может рассчитывать только на члены System.Object».</span> Базовый/интерфейсный constraint разблокирует члены типа (замер: <code>e.Name</code> → Ann, <code>CompareTo</code> → 9/pear).' },
    { icon: "cost", k: "Полный словарь", v: 'Категория (<code>class</code>/<code>struct</code>/<code>notnull</code>/<code>unmanaged</code>) — макс. один, <b>первым</b>; база; интерфейс(ы); <code>new()</code> — <b>последним</b>; <code>T:U</code>; <code>default</code>; анти-ограничение <code>allows ref struct</code> (замер: unmanaged sizeof → 4 8 16).' },
    { icon: "avoid", k: "Импликации и порядок", v: '<code>struct</code> ⇒ <code>new()</code>, <code>unmanaged</code> ⇒ <code>struct</code> (не комбинировать). <code>allows ref struct</code> «must follow all constraints» <span class="ru-tr">«должно следовать за всеми ограничениями»</span>, запрещает боксинг T. Правило: «maximum constraints possible that will still let you handle the types you must handle». <span class="ru-tr">«максимум ограничений, которые всё ещё позволяют обрабатывать нужные вам типы».</span>' },
  ],

  foot: 'урок · <b>where-ограничения: словарь</b> · 6 анимир. разборов · category/base/iface/new()/T:U/default/allows ref struct · панель unlock e.Name · дизайн <b>mid</b>',
};
