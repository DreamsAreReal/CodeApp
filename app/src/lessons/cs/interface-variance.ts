/**
 * Lesson: Вариантность ИНТЕРФЕЙСОВ (CS.S10.interface-variance) — expert density, 6 animated
 * deep-dives. Covariance/contravariance of GENERIC INTERFACES (out T / in T), a DISTINCT topic
 * from CS.S4.delegate-variance (which is about delegates): why List<T> is invariant by default,
 * how `out T` makes IEnumerable<out T> covariant (assign IEnumerable<Derived> to IEnumerable<Base>),
 * how `in T` makes IComparer<in T> contravariant, the out-only-in-return / in-only-in-parameter
 * rule, that variance is reference-types-only, and how to declare your OWN variant interface.
 *
 * SIGNATURE machine panel (s5): a custom covariant interface IProducer<out T> converts
 * IProducer<Dog> to IProducer<Animal>, and the produced value is really a Dog. REAL run-csharp
 * measurement (this file's exec cards): custom covariance -> woof / True; custom contravariance ->
 * consumed: animal; BCL covariance IEnumerable<string>->IEnumerable<object> -> 3 / a.
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../concepts/covariance-contravariance/ (ms-var-cs) and
 * learn.microsoft.com/.../standard/generics/covariance-and-contravariance (ms-var-std)
 * (both fetched + substring-checked 2026-07-21):
 *   - every English quote is VERBATIM from the EXACT page listed in that segment's/item's sources;
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "3 a" (BCL covariance) · c2 "woof True" (custom out T) · c3 "consumed: animal"
 *     (custom in T).
 *   - Invariance (List<string> -> List<object>, CS0029) is a non-exec compile panel.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.interface-variance/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: invariant by default — List<Derived> and List<Base> are unrelated.
const Z_DER: Zone = { id: "der", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "List<string>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "более производный аргумент", subCls: "vz-zsub", subY: 47 };
const Z_BAS: Zone = { id: "bas", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List<object>", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "менее производный аргумент", subCls: "vz-zsub heap", subY: 47 };
const INV_ZONES: Zone[] = [Z_DER, Z_BAS];

// s2: covariance via out T — IEnumerable<Derived> -> IEnumerable<Base>.
const Z_ENUD: Zone = { id: "enud", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IEnumerable<string>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "out T · covariant", subCls: "vz-zsub good", subY: 47 };
const Z_ENUB: Zone = { id: "enub", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "→ IEnumerable<object>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "присваивание ок", subCls: "vz-zsub", subY: 47 };
const COV_ZONES: Zone[] = [Z_ENUD, Z_ENUB];

// s3: contravariance via in T — IComparer<Base> used where IComparer<Derived> expected.
const Z_CMPB: Zone = { id: "cmpb", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IComparer<Shape>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "in T · contravariant", subCls: "vz-zsub good", subY: 47 };
const Z_CMPD: Zone = { id: "cmpd", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "→ IComparer<Circle>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "менее произв. компаратор", subCls: "vz-zsub", subY: 47 };
const CONTRA_ZONES: Zone[] = [Z_CMPB, Z_CMPD];

// s4: the rule — out only in return position, in only in parameter position; ref-types only.
const Z_OUTPOS: Zone = { id: "outpos", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "out T", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "только ВОЗВРАТ метода", subCls: "vz-zsub good", subY: 47 };
const Z_INPOS: Zone = { id: "inpos", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "in T", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "только ПАРАМЕТР метода", subCls: "vz-zsub", subY: 47 };
const RULE_ZONES: Zone[] = [Z_OUTPOS, Z_INPOS];

// s5 (SIGNATURE): custom variant interface IProducer<out T> — measured conversion.
const Z_PROD: Zone = { id: "prod", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IProducer<Dog>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "DogFarm", subCls: "vz-zsub good", subY: 47 };
const Z_PRODA: Zone = { id: "proda", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "→ IProducer<Animal>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "out T · covariant", subCls: "vz-zsub", subY: 47 };
const CUSTOM_ZONES: Zone[] = [Z_PROD, Z_PRODA];

// s6: contrast — interface variance is compile-time-proven; array covariance is not.
const Z_SAFE: Zone = { id: "safe", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ИНТЕРФЕЙС · type safe", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "проверяет компилятор", subCls: "vz-zsub good", subY: 47 };
const Z_ARR: Zone = { id: "arr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МАССИВ · НЕ safe", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "падает в рантайме", subCls: "vz-zsub", subY: 47 };
const SAFE_ZONES: Zone[] = [Z_SAFE, Z_ARR];

export const interfaceVariance: LessonData = {
  id: "CS.S10.interface-variance",
  track: "CS",
  section: "CS.S10",
  module: "S10.4",
  lang: "csharp",
  title: "Ковариантность интерфейсов: out T / in T",
  kicker: "C# вглубь · S10 · вариантность интерфейсов",
  home: { subtitle: "out T (IEnumerable<out T>), in T (IComparer<in T>), инвариантность по умолчанию", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-var-cs", kind: "doc", org: "Microsoft Learn", title: "Covariance and Contravariance (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/", date: "2015-07-20" },
    { id: "ms-var-std", kind: "doc", org: "Microsoft Learn", title: "Covariance and Contravariance in Generics", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance", date: "2026-03-09" },
  ],

  spec: [
    { text: "«Variance is a property of a generic interface or delegate type's type parameter, and it controls which implicit conversions exist between constructed types that use different type arguments.» <span class=\"ru-tr\">«Вариантность — это свойство параметра типа обобщённого интерфейса или делегата, которое управляет тем, какие неявные преобразования существуют между сконструированными типами, использующими разные аргументы типа.»</span>", source: "ms-var-std" },
  ],
  edgeCases: [
    { text: "По умолчанию — <b>инвариантно</b>: «By default, generic type parameters are <span class=\"hl\">invariant</span>—even if one type argument derives from another, the corresponding constructed generic types, such as <code>List&lt;Derived&gt;</code> and <code>List&lt;Base&gt;</code>, are unrelated». <span class=\"ru-tr\">«По умолчанию параметры обобщённого типа инвариантны — даже если один аргумент типа наследуется от другого, соответствующие сконструированные обобщённые типы, такие как <code>List&lt;Derived&gt;</code> и <code>List&lt;Base&gt;</code>, неродственны».</span>", source: "ms-var-std" },
    { text: "Вариантность — <b>только для ссылочных</b> типов: «Variance applies only to reference types; if you specify a value type for a variant type parameter, that type parameter is <span class=\"hl\">invariant</span> for the resulting constructed type». <span class=\"ru-tr\">«Вариантность применяется только к ссылочным типам; если вы укажете значимый тип для вариантного параметра типа, то этот параметр типа будет инвариантным для получаемого сконструированного типа».</span>", source: "ms-var-std" },
    { text: "<code>out</code> — только в позиции возврата, <code>in</code> — только в позиции параметра: «covariant type parameters can be used as the return types of the interface's methods, and contravariant type parameters can be used as the <span class=\"hl\">parameter types</span> of the interface's methods». <span class=\"ru-tr\">«ковариантные параметры типа могут использоваться как типы возвращаемых значений методов интерфейса, а контравариантные параметры типа могут использоваться как типы параметров методов интерфейса».</span>", source: "ms-var-std" },
  ],

  misconceptions: [
    {
      wrong: "IEnumerable<string> и List<string> одинаково приводятся к <...object>: раз string : object, значит и обёртки совместимы",
      hook: 'Нет — по умолчанию дженерик-типы <b>инвариантны</b>: «By default, generic type parameters are <span class="hl">invariant</span>—even if one type argument derives from another, the corresponding constructed generic types, such as <code>List&lt;Derived&gt;</code> and <code>List&lt;Base&gt;</code>, are unrelated». <span class="ru-tr">«По умолчанию параметры обобщённого типа инвариантны — даже если один аргумент типа наследуется от другого, соответствующие сконструированные обобщённые типы, такие как <code>List&lt;Derived&gt;</code> и <code>List&lt;Base&gt;</code>, неродственны».</span> <code>List&lt;string&gt;</code> к <code>List&lt;object&gt;</code> <b>не</b> приводится (CS0029). А вот <code>IEnumerable&lt;string&gt;</code> к <code>IEnumerable&lt;object&gt;</code> — <b>да</b>, потому что <code>IEnumerable&lt;out T&gt;</code> объявлен <span class="hl">ковариантным</span>. Разница — в модификаторе <code>out</code>/<code>in</code> на параметре интерфейса. Это отдельная тема от вариантности <b>делегатов</b> (соседний трек S4). Дальше <b>шесть разборов</b>: инвариантность по умолчанию, ковариантность <code>out T</code> (IEnumerable), контравариантность <code>in T</code> (IComparer), правило позиций (<code>out</code>=возврат, <code>in</code>=параметр), <b>машинная панель</b> — свой ковариантный <code>IProducer&lt;out T&gt;</code> (реальный прогон), и контраст с небезопасной вариантностью массивов.',
      source: "ms-var-std",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Инвариантность по умолчанию", title: "List<Derived> и List<Base> — неродственные типы",
      viewBox: "0 0 340 210", zones: INV_ZONES,
      code: ["List<string> s = new();", "List<object> o = s;   // ❌ CS0029 — инвариантность", "// хотя string : object, обёртки List<> несовместимы"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>string</code> — наследник <code>object</code>. Кажется, что <code>List&lt;string&gt;</code> «это» <code>List&lt;object&gt;</code>. Но нет.', nodes: [{ id: "d", kind: "obj", at: { zone: "der", row: 0 }, typeTag: "List<string>", value: "string : object", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>List&lt;object&gt; o = s;</code> — <span class="hl">ошибка компиляции</span> CS0029. По умолчанию параметр типа <b>инвариантен</b>: обёртки неродственны.', nodes: [{ id: "d", kind: "obj", at: { zone: "der", row: 0 }, typeTag: "List<string>", value: "string : object" }, { id: "b", kind: "gate", at: { zone: "bas", row: 0 }, state: "fail", label: "List<object> = s", detail: "CS0029", accent: true }], edges: [{ id: "e", from: "d", to: "b", accent: true }] },
        { codeLine: 2, out: "", caption: 'Почему запрет разумен: в <code>List&lt;object&gt;</code> можно было бы <code>Add(42)</code>, но исходный список — <code>List&lt;string&gt;</code>. Инвариантность закрывает эту дыру <span class="hl">на компиляции</span>.', nodes: [{ id: "b", kind: "gate", at: { zone: "bas", row: 0 }, state: "fail", label: "o.Add(42)", detail: "было бы небезопасно", accent: true }], edges: [] },
      ],
      explain: 'Стартовая точка: дженерик-типы <b>инвариантны</b>. Дословно: «By default, generic type parameters are <span class="hl">invariant</span>—even if one type argument derives from another, the corresponding constructed generic types, such as <code>List&lt;Derived&gt;</code> and <code>List&lt;Base&gt;</code>, are unrelated unless the type parameter is explicitly declared as covariant or contravariant». <span class="ru-tr">«По умолчанию параметры обобщённого типа инвариантны — даже если один аргумент типа наследуется от другого, соответствующие сконструированные обобщённые типы, такие как <code>List&lt;Derived&gt;</code> и <code>List&lt;Base&gt;</code>, неродственны, если только параметр типа явно не объявлен ковариантным или контравариантным».</span> Определение вариантности: «Variance is a property of a generic interface or delegate type\'s type parameter, and it <span class="hl">controls which implicit conversions exist</span> between constructed types that use different type arguments». <span class="ru-tr">«Вариантность — это свойство параметра типа обобщённого интерфейса или делегата, которое управляет тем, какие неявные преобразования существуют между сконструированными типами, использующими разные аргументы типа».</span> Инвариантность <code>List&lt;T&gt;</code> — не каприз: список читают <b>и</b> пишут, поэтому ни ковариантность (только чтение), ни контравариантность (только запись) не безопасны. Вариантность включается лишь явным <code>out</code>/<code>in</code> на интерфейсе.',
      sources: ["ms-var-std"],
    },
    {
      id: "s2", num: "02", kicker: "Ковариантность · out T", title: "IEnumerable<out T>: Derived-последовательность как Base",
      viewBox: "0 0 340 210", zones: COV_ZONES,
      code: ["IEnumerable<string> strings = new List<string>{\"a\",\"bb\",\"ccc\"};", "IEnumerable<object> objects = strings;   // out T → covariance ✓", "Console.WriteLine($\"{objects.Count()} {objects.First()}\");  // 3 a"],
      predictAt: 1, predictQ: '<code>IEnumerable&lt;object&gt; objects = strings;</code> где <code>strings</code> — <code>IEnumerable&lt;string&gt;</code> из <code>{"a","bb","ccc"}</code>. Что даст <code>objects.Count()</code> и <code>objects.First()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>IEnumerable&lt;out T&gt;</code> объявлен <b>ковариантным</b> (<code>out</code>). Поэтому <code>IEnumerable&lt;string&gt;</code> <span class="hl">присваивается</span> к <code>IEnumerable&lt;object&gt;</code>.', nodes: [{ id: "d", kind: "obj", at: { zone: "enud", row: 0 }, typeTag: "IEnumerable<string>", value: "3 строки", accent: true }, { id: "b", kind: "gate", at: { zone: "enub", row: 0 }, state: "ok", label: "IEnumerable<object>", detail: "присвоено ✓" }], edges: [{ id: "e", from: "d", to: "b", accent: true }] },
        { codeLine: 1, out: "", caption: 'Безопасно, потому что <code>IEnumerable</code> только <b>отдаёт</b> элементы (позиция возврата). Читать строки как object можно всегда — «Assignment compatibility is preserved». <span class="ru-tr">«Совместимость присваивания сохраняется».</span>', nodes: [{ id: "d", kind: "obj", at: { zone: "enud", row: 0 }, typeTag: "IEnumerable<string>", value: "3 строки" }, { id: "b", kind: "gate", at: { zone: "enub", row: 0 }, state: "ok", label: "только читаем", detail: "string как object", accent: true }], edges: [] },
        { codeLine: 2, out: "3 a", caption: 'Панель: <code>objects.Count()</code>=<b>3</b>, <code>objects.First()</code>=<span class="hl">a</span> (реальный прогон). Тот же список, вид через базовый интерфейс.', nodes: [{ id: "b", kind: "gate", at: { zone: "enub", row: 0 }, state: "ok", label: "Count / First", detail: "3 / a", accent: true }], edges: [] },
      ],
      explain: 'Ковариантность интерфейса включается модификатором <code>out</code>. Дословно: «<i>Covariant</i> type parameters let you substitute a more derived type for the original type argument. For example, you can assign an instance of <code>IEnumerable&lt;Derived&gt;</code> to a variable of type <code>IEnumerable&lt;Base&gt;</code>». <span class="ru-tr">«<i>Ковариантные</i> параметры типа позволяют подставить более производный тип вместо исходного аргумента типа. Например, можно присвоить экземпляр <code>IEnumerable&lt;Derived&gt;</code> переменной типа <code>IEnumerable&lt;Base&gt;</code>».</span> Из C#-обзора — тот же приём с сохранением совместимости: «Covariance… Assignment compatibility is preserved» <span class="ru-tr">«Ковариантность… Совместимость присваивания сохраняется».</span> и прямой пример «<code>IEnumerable&lt;object&gt; objects = strings;</code>». Почему безопасно: «All the type parameters of these interfaces are covariant, so the type parameters are used <span class="hl">only for the return types</span> of the members» <span class="ru-tr">«Все параметры типа этих интерфейсов ковариантны, поэтому параметры типа используются только для типов возвращаемых значений членов».</span> — интерфейс лишь отдаёт <code>T</code>, никогда не принимает, поэтому расширение <code>string</code>→<code>object</code> не создаёт дыры. Реальный прогон подтверждает: элементы те же (3, «a»), меняется только статический тип ссылки.',
      sources: ["ms-var-std", "ms-var-cs"],
    },
    {
      id: "s3", num: "03", kicker: "Контравариантность · in T", title: "IComparer<in T>: компаратор базы сортирует наследника",
      viewBox: "0 0 340 210", zones: CONTRA_ZONES,
      code: ["IComparer<Shape> byArea = new ShapeAreaComparer();", "// SortedSet<Circle> ждёт IComparer<Circle>, но:", "var set = new SortedSet<Circle>(byArea);  // in T → contravariance ✓"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ShapeAreaComparer</code> реализует <code>IComparer&lt;Shape&gt;</code> — умеет сравнивать <b>любые</b> Shape.', nodes: [{ id: "b", kind: "obj", at: { zone: "cmpb", row: 0 }, typeTag: "IComparer<Shape>", value: "по площади", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Конструктор <code>SortedSet&lt;Circle&gt;</code> ждёт <code>IComparer&lt;Circle&gt;</code>. Но <code>in T</code> позволяет <span class="hl">передать более общий</span> <code>IComparer&lt;Shape&gt;</code>.', nodes: [{ id: "b", kind: "obj", at: { zone: "cmpb", row: 0 }, typeTag: "IComparer<Shape>", value: "по площади" }, { id: "d", kind: "gate", at: { zone: "cmpd", row: 0 }, state: "ok", label: "IComparer<Circle>", detail: "принял Shape ✓", accent: true }], edges: [{ id: "e", from: "b", to: "d", accent: true }] },
        { codeLine: 2, out: "", caption: 'Безопасно: тот, кто сравнивает любые Shape, <span class="hl">тем более</span> сравнит Circle (Circle — это Shape). «Assignment compatibility is reversed». <span class="ru-tr">«Совместимость присваивания обращается».</span>', nodes: [{ id: "d", kind: "gate", at: { zone: "cmpd", row: 0 }, state: "ok", label: "Shape ⊇ Circle", detail: "контравариантно", accent: true }], edges: [] },
      ],
      explain: 'Контравариантность включается модификатором <code>in</code>. Дословно: «<i>Contravariant</i> type parameters let you substitute a base type for a derived type argument instead of the original. For example, you can assign an instance of <code>Action&lt;Base&gt;</code> to a variable of type <code>Action&lt;Derived&gt;</code>». <span class="ru-tr">«<i>Контравариантные</i> параметры типа позволяют подставить базовый тип вместо производного аргумента типа, а не исходный. Например, можно присвоить экземпляр <code>Action&lt;Base&gt;</code> переменной типа <code>Action&lt;Derived&gt;</code>».</span> Для интерфейсов пример из доки — сортировка: «The example can pass a comparer of a less derived type (<code>Shape</code>) when the code calls for a comparer of a more derived type (<code>Circle</code>), because the type parameter of the <code>IComparer&lt;T&gt;</code> generic interface is <span class="hl">contravariant</span>». <span class="ru-tr">«В этом примере можно передать компаратор менее производного типа (<code>Shape</code>), когда код требует компаратор более производного типа (<code>Circle</code>), потому что параметр типа обобщённого интерфейса <code>IComparer&lt;T&gt;</code> контравариантен».</span> Почему безопасно: контравариантные параметры «are used only as parameter types in the members of the interfaces» <span class="ru-tr">«используются только как типы параметров в членах интерфейсов»</span> — интерфейс только <b>принимает</b> <code>T</code>, поэтому сужение <code>Shape</code>→<code>Circle</code> при вызове всегда корректно (Circle можно передать как Shape). Контравариантные интерфейсы BCL: <code>IComparer&lt;T&gt;</code>, <code>IComparable&lt;T&gt;</code>, <code>IEqualityComparer&lt;T&gt;</code>.',
      sources: ["ms-var-std", "ms-var-cs"],
    },
    {
      id: "s4", num: "04", kicker: "Правило позиций", title: "out — только в возврате, in — только в параметре",
      viewBox: "0 0 340 210", zones: RULE_ZONES,
      code: ["interface IProducer<out T> { T Produce(); }        // out → T в ВОЗВРАТЕ", "interface IConsumer<in T>  { void Consume(T item); } // in  → T в ПАРАМЕТРЕ", "// out в параметре или in в возврате → ошибка компиляции", "// вариантность — только для ссылочных типов"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>out T</code> можно ставить <b>только там, где T «выходит»</b> — в возврате метода. «covariant type parameters can be used as the <span class="hl">return types</span>». <span class="ru-tr">«ковариантные параметры типа могут использоваться как типы возвращаемых значений».</span>', nodes: [{ id: "o", kind: "gate", at: { zone: "outpos", row: 0 }, state: "ok", label: "T Produce()", detail: "возврат ✓", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>in T</code> — <b>только там, где T «входит»</b> — в параметре. «contravariant type parameters can be used as the <span class="hl">parameter types</span>». <span class="ru-tr">«контравариантные параметры типа могут использоваться как типы параметров».</span>', nodes: [{ id: "o", kind: "gate", at: { zone: "outpos", row: 0 }, state: "ok", label: "T Produce()", detail: "возврат ✓" }, { id: "i", kind: "gate", at: { zone: "inpos", row: 0 }, state: "ok", label: "Consume(T)", detail: "параметр ✓", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Два ограничения: нарушение позиции → ошибка компиляции; и «Variance applies <span class="hl">only to reference types</span>» <span class="ru-tr">«Вариантность применяется только к ссылочным типам»</span> — для value-аргумента параметр снова инвариантен.', nodes: [{ id: "o", kind: "gate", at: { zone: "outpos", row: 0 }, state: "ok", label: "out", detail: "возврат" }, { id: "i", kind: "gate", at: { zone: "inpos", row: 0 }, state: "ok", label: "in", detail: "параметр" }, { id: "v", kind: "gate", at: { zone: "inpos", row: 1 }, state: "fail", label: "value-тип", detail: "инвариант", accent: true }], edges: [] },
      ],
      explain: 'Компилятор проверяет вариантность <b>структурно</b> по позициям. Дословно: «For an interface, <span class="hl">covariant type parameters can be used as the return types of the interface\'s methods, and contravariant type parameters can be used as the parameter types</span> of the interface\'s methods». <span class="ru-tr">«Для интерфейса ковариантные параметры типа могут использоваться как типы возвращаемых значений методов интерфейса, а контравариантные параметры типа могут использоваться как типы параметров методов интерфейса».</span> Отсюда мнемоника: <code>out</code> — тип «выходит» (возврат, ковариант), <code>in</code> — тип «входит» (параметр, контравариант); поставить <code>out T</code> в параметр или <code>in T</code> в возврат нельзя — компилятор откажет. Плюс два жёстких факта: «<span class="hl">Only interface types and delegate types</span> can have variant type parameters» <span class="ru-tr">«Только типы интерфейсов и типы делегатов могут иметь вариантные параметры типа»</span> (у классов вариантности нет) и «Variance applies only to reference types; if you specify a value type for a variant type parameter, that type parameter is invariant» <span class="ru-tr">«Вариантность применяется только к ссылочным типам; если вы укажете значимый тип для вариантного параметра типа, то этот параметр типа будет инвариантным»</span> — <code>IEnumerable&lt;int&gt;</code> к <code>IEnumerable&lt;object&gt;</code> не приводится, потому что <code>int</code> — value-тип.',
      sources: ["ms-var-std"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · свой out-интерфейс", title: "Свой IProducer<out T>: IProducer<Dog> → IProducer<Animal>",
      viewBox: "0 0 340 210", zones: CUSTOM_ZONES,
      code: ["interface IProducer<out T> { T Produce(); }", "IProducer<Dog> pd = new DogFarm();", "IProducer<Animal> pa = pd;   // out T covariance ✓", "Console.WriteLine($\"{pa.Produce().Sound} {pa.Produce() is Dog}\");"],
      predictAt: 2, predictQ: '<code>IProducer&lt;Animal&gt; pa = pd;</code> где <code>pd</code> — <code>IProducer&lt;Dog&gt;</code> (<code>DogFarm</code>). Что даст <code>pa.Produce().Sound</code> и <code>pa.Produce() is Dog</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Свой интерфейс с <code>out T</code>: <code>T</code> только в возврате <code>Produce()</code> — значит его можно объявить <span class="hl">ковариантным</span>.', nodes: [{ id: "p", kind: "obj", at: { zone: "prod", row: 0 }, typeTag: "IProducer<out T>", value: "T Produce()", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>IProducer&lt;Dog&gt;</code> присваивается к <code>IProducer&lt;Animal&gt;</code> — компилятор <span class="hl">разрешает</span> (out-ковариантность), как у BCL <code>IEnumerable</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "prod", row: 0 }, typeTag: "IProducer<Dog>", value: "DogFarm" }, { id: "a", kind: "gate", at: { zone: "proda", row: 0 }, state: "ok", label: "IProducer<Animal>", detail: "присвоено ✓", accent: true }], edges: [{ id: "e", from: "p", to: "a", accent: true }] },
        { codeLine: 3, out: "woof True", caption: 'Панель: <code>Produce().Sound</code>=<span class="hl">woof</span>, <code>is Dog</code>=<b>True</b> (реальный прогон). В куче — реальный <code>Dog</code>; вариантность сменила лишь статический тип.', nodes: [{ id: "a", kind: "obj", at: { zone: "proda", row: 0 }, typeTag: "в куче", value: "Dog", accent: true }, { id: "r", kind: "gate", at: { zone: "prod", row: 0 }, state: "ok", label: "результат", detail: "woof / True" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — <b>своя</b> вариантность, снятая прогоном. Вариантность — не только у BCL: «C# enables you to <span class="hl">create your own variant interfaces</span> and delegates». <span class="ru-tr">«C# позволяет создавать собственные вариантные интерфейсы и делегаты».</span> Правило простое: если <code>T</code> в интерфейсе стоит <b>только в возврате</b>, помечай его <code>out</code> — интерфейс станет ковариантным. <code>IProducer&lt;out T&gt; { T Produce(); }</code> удовлетворяет условию, поэтому <code>IProducer&lt;Dog&gt;</code> присваивается к <code>IProducer&lt;Animal&gt;</code>. Реальный прогон: <code>pa.Produce().Sound</code> = <code>woof</code>, <code>pa.Produce() is Dog</code> = <code>True</code> — фабрика по-прежнему создаёт настоящих <code>Dog</code>, вариантность изменила только тип ссылки <code>pa</code>. Это ровно тот же механизм, что делает <code>IEnumerable&lt;out T&gt;</code> ковариантным в стандартной библиотеке.',
      sources: ["ms-var-std", "ms-var-cs"],
    },
    {
      id: "s6", num: "06", kicker: "Контраст · массивы не safe", title: "Вариантность интерфейса безопасна; ковариантность массива — нет",
      viewBox: "0 0 340 210", zones: SAFE_ZONES,
      code: ["object[] array = new String[10];  // ковариантность массива — компилируется", "array[0] = 10;                    // но 10 не строка → бросок В РАНТАЙМЕ", "// IEnumerable<out T> так подставить нельзя: интерфейс только читает"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Массивы ковариантны, но <b>не типобезопасно</b>: <code>object[] array = new String[10];</code> <span class="hl">компилируется</span>, хотя массив — реально <code>String[]</code>.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "IEnumerable<out T>", detail: "проверен ✓" }, { id: "a", kind: "obj", at: { zone: "arr", row: 0 }, typeTag: "object[]", value: "= String[10]", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Запись <code>array[0] = 10;</code> кладёт <b>int</b> в массив строк. Компилятор <span class="hl">пропускает</span>, проверка уходит в рантайм.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "интерфейс", detail: "safe" }, { id: "a", kind: "gate", at: { zone: "arr", row: 0 }, state: "fail", label: "array[0] = 10", detail: "run-time exception", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Интерфейсная вариантность так <b>не ломается</b>: <code>IEnumerable&lt;out T&gt;</code> только читает (<code>out</code> в возврате), записать нечего. Компилятор доказывает безопасность <span class="hl">статически</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "out T", detail: "только чтение" }, { id: "a", kind: "gate", at: { zone: "arr", row: 0 }, state: "fail", label: "массив", detail: "run-time throw", accent: true }], edges: [] },
      ],
      explain: 'Разбор, отделяющий безопасную вариантность от опасной. Массивы ковариантны исторически, но небезопасно: «Covariance for arrays enables implicit conversion of an array of a more derived type to an array of a less derived type. <span class="hl">But this operation is not type safe</span>», <span class="ru-tr">«Ковариантность для массивов позволяет неявно преобразовать массив более производного типа в массив менее производного типа. Но эта операция не типобезопасна»,</span> и доковый пример <code>object[] array = new String[10];</code> с комментарием «The following statement produces a run-time exception» <span class="ru-tr">«Следующая инструкция порождает исключение времени выполнения»</span> на <code>array[0] = 10;</code>. Интерфейсная вариантность фундаментально безопаснее: она даёт лишь <b>implicit reference conversion</b>, а направление доказывает компилятор по позициям (<code>out</code> — возврат/чтение, <code>in</code> — параметр/запись). Ковариантный <code>IEnumerable&lt;out T&gt;</code> нельзя «сломать» записью, потому что записывать через него нечего. Правило: предпочитай вариантные интерфейсы массивной ковариантности.',
      sources: ["ms-var-cs"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;string&gt; strings = new List&lt;string&gt;{"a","bb","ccc"}; IEnumerable&lt;object&gt; objects = strings; Console.WriteLine($"{objects.Count()} {objects.First()}");</code> — что напечатает?',
      options: ["3 a", "3 object", "(ошибка компиляции)", "0 null"], correctIndex: 0, xp: 10,
      okText: '<code>IEnumerable&lt;out T&gt;</code> ковариантен: <code>IEnumerable&lt;string&gt;</code> присваивается к <code>IEnumerable&lt;object&gt;</code>. Список тот же: <code>Count()</code>=<b>3</b>, <code>First()</code>=<span class="hl">a</span>.',
      noText: 'Ковариантность интерфейса (out T) сохраняет присваивание Derived→Base. Элементы не меняются: <code>3</code> и <code>a</code>. (Для <code>List&lt;T&gt;</code> это было бы CS0029 — он инвариантен.)',
      verify: { kind: "exec", run: "dotnet run", expect: "3 a" }, sourceRefs: ["ms-var-std"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IProducer&lt;out T&gt; { T Produce(); } class Animal { public virtual string Sound =&gt; "..."; } class Dog : Animal { public override string Sound =&gt; "woof"; } class DogFarm : IProducer&lt;Dog&gt; { public Dog Produce() =&gt; new Dog(); } IProducer&lt;Dog&gt; pd = new DogFarm(); IProducer&lt;Animal&gt; pa = pd; Console.WriteLine($"{pa.Produce().Sound} {pa.Produce() is Dog}");</code> — что напечатает?',
      options: ["woof True", "... False", "woof False", "... True"], correctIndex: 0, xp: 10,
      okText: '<code>out T</code> делает <code>IProducer&lt;T&gt;</code> ковариантным → <code>IProducer&lt;Dog&gt;</code> присваивается к <code>IProducer&lt;Animal&gt;</code>. Фабрика создаёт настоящий <code>Dog</code>: <code>Sound</code>=<span class="hl">woof</span>, <code>is Dog</code>=<b>True</b>.',
      noText: 'Свой ковариантный интерфейс (T только в возврате) ведёт себя как <code>IEnumerable&lt;out T&gt;</code>. В куче — Dog, вариантность сменила лишь тип ссылки. Вывод: <b>woof True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "woof True" }, sourceRefs: ["ms-var-std"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IConsumer&lt;in T&gt; { void Consume(T item); } class Animal { public string Kind = "animal"; } class Dog : Animal { } class AnimalPrinter : IConsumer&lt;Animal&gt; { public void Consume(Animal a) =&gt; Console.WriteLine("consumed: " + a.Kind); } IConsumer&lt;Animal&gt; ca = new AnimalPrinter(); IConsumer&lt;Dog&gt; cd = ca; cd.Consume(new Dog());</code> — что напечатает?',
      options: ["consumed: animal", "consumed: dog", "consumed: ", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: '<code>in T</code> делает <code>IConsumer&lt;T&gt;</code> контравариантным → <code>IConsumer&lt;Animal&gt;</code> присваивается к <code>IConsumer&lt;Dog&gt;</code>. <code>a.Kind</code> — поле базы → <span class="hl">consumed: animal</span>.',
      noText: 'Контравариантность интерфейса (in T) позволяет передать более общий консьюмер туда, где ждут <code>IConsumer&lt;Dog&gt;</code>. Метод берёт Animal, <code>a.Kind</code> = <code>"animal"</code>. Вывод: <b>consumed: animal</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "consumed: animal" }, sourceRefs: ["ms-var-std"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Инвариантно по умолчанию", v: '«By default, generic type parameters are <span class="hl">invariant</span>… such as <code>List&lt;Derived&gt;</code> and <code>List&lt;Base&gt;</code>, are unrelated». <span class="ru-tr">«По умолчанию параметры обобщённого типа инвариантны… такие как <code>List&lt;Derived&gt;</code> и <code>List&lt;Base&gt;</code>, неродственны».</span> <code>List&lt;string&gt;</code> → <code>List&lt;object&gt;</code> = CS0029. Вариантность включает только явный <code>out</code>/<code>in</code>.' },
    { icon: "cost", k: "out T / in T", v: '<code>out T</code> — ковариант (T только в <b>возврате</b>): <code>IEnumerable&lt;string&gt;</code>→<code>IEnumerable&lt;object&gt;</code> (замер: 3/a). <code>in T</code> — контравариант (T только в <b>параметре</b>): <code>IComparer&lt;Shape&gt;</code> сортирует <code>Circle</code> (замер: consumed: animal).' },
    { icon: "avoid", k: "Только ref, только интерфейс/делегат", v: '«Variance applies only to <span class="hl">reference types</span>» <span class="ru-tr">«Вариантность применяется только к ссылочным типам»</span> (<code>IEnumerable&lt;int&gt;</code>↛<code>IEnumerable&lt;object&gt;</code>); «Only interface types and delegate types can have variant type parameters» <span class="ru-tr">«Только типы интерфейсов и типы делегатов могут иметь вариантные параметры типа»</span> — у классов вариантности нет. Замер своего <code>IProducer&lt;out T&gt;</code>: woof/True.' },
  ],

  foot: 'урок · <b>вариантность интерфейсов</b> · 6 анимир. разборов · out T / in T · панель свой IProducer<out T> · дизайн <b>mid</b>',
};
