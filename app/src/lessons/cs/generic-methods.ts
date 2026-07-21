/**
 * Lesson: Generic-методы и вывод типов (CS.S10.generic-methods) — expert density, 5 animated
 * deep-dives. A method is generic only if it has its OWN type-parameter list; the compiler INFERS
 * the type arguments from the method arguments you pass, so you rarely write <T> explicitly.
 * The precise rule: inference works from ARGUMENTS, never from a constraint or a return value alone
 * (so a no-parameter generic method needs explicit <T>); inference runs at compile time BEFORE
 * overload resolution, across all same-named generic methods. This COMPLEMENTS CS.S1.generics-basics
 * (which mentioned the "own type-parameter list" rule) by making inference and overloading the whole
 * subject, with the failure modes.
 *
 * SIGNATURE machine panel (s5): inference is per-argument and reified — Echo(42)/Echo("hi")/Echo(3.5)
 * infer int/string/double and typeof(T) proves it. REAL run-csharp measurement (this file's exec
 * cards): c1 "42:Int32 hi:String 3.5:Double" · c2 "Int32->String | Boolean->Double" · c3 "int generic".
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../generics/generic-methods (fetched + substring-checked 2026-07-21,
 * ms.date 2015-07-20):
 *   - every English quote is VERBATIM from that page (the inference paragraph + the "not generic
 *     just because it belongs to a generic type" clause + the CS0693 warning clause);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "42:Int32 hi:String 3.5:Double" · c2 "Int32->String | Boolean->Double" ·
 *     c3 "int generic".
 *   - The no-inference-from-return-type case (Make<T>(), CS0411) is a non-exec compile panel.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.generic-methods/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: a method is generic ONLY if it has its own <T> — not because it's in a generic type.
const Z_OWN: Zone = { id: "own", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СВОЙ <T> → generic", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "T G<T>(T x)", subCls: "vz-zsub good", subY: 47 };
const Z_NOTOWN: Zone = { id: "notown", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "T от класса → НЕ generic", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "T M(T x) в Class<T>", subCls: "vz-zsub", subY: 47 };
const OWN_ZONES: Zone[] = [Z_OWN, Z_NOTOWN];

// s2: inference from arguments — Echo(42) -> T=int, no explicit <int>.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВЫЗОВ БЕЗ <T>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Echo(42)", subCls: "vz-zsub", subY: 47 };
const Z_INFER: Zone = { id: "infer", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ВЫВОД T", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "T = int", subCls: "vz-zsub good", subY: 47 };
const INFER_ZONES: Zone[] = [Z_CALL, Z_INFER];

// s3: multi-parameter inference Pair<K,V>.
const Z_ARGS: Zone = { id: "args", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Pair(1, \"x\")", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "два аргумента", subCls: "vz-zsub", subY: 47 };
const Z_KV: Zone = { id: "kv", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "K=int, V=string", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "каждый выведен", subCls: "vz-zsub good", subY: 47 };
const KV_ZONES: Zone[] = [Z_ARGS, Z_KV];

// s4: the limits — no inference from return type / constraint; runs before overload resolution.
const Z_NOINF: Zone = { id: "noinf", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕТ ВЫВОДА", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "нет параметров → <T> явно", subCls: "vz-zsub heap", subY: 47 };
const Z_BEFORE: Zone = { id: "before", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДО OVERLOAD", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "вывод → потом резолв", subCls: "vz-zsub", subY: 47 };
const LIMIT_ZONES: Zone[] = [Z_NOINF, Z_BEFORE];

// s5 (SIGNATURE): per-argument inference, reified — Echo of int/string/double.
const Z_ONE: Zone = { id: "one", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "ОДИН Echo<T>", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "T x", subCls: "vz-zsub", subY: 47 };
const Z_THREE: Zone = { id: "three", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone good", label: "ТРИ T ПО ВЫЗОВУ", labelCls: "vz-zlabel good sm", lx: 241, ly: 24, sub: "int · string · double", subCls: "vz-zsub good", subY: 47 };
const POLY_ZONES: Zone[] = [Z_ONE, Z_THREE];

export const genericMethods: LessonData = {
  id: "CS.S10.generic-methods",
  track: "CS",
  section: "CS.S10",
  module: "S10.5",
  lang: "csharp",
  title: "Generic-методы и вывод типов",
  kicker: "C# вглубь · S10 · type inference",
  home: { subtitle: "свой <T>, вывод из аргументов, границы вывода, overload-резолв", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-gen-methods", kind: "doc", org: "Microsoft Learn", title: "Generic Methods (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generic-methods", date: "2015-07-20" },
  ],

  spec: [
    { text: "«The compiler can infer the type parameters based on the method arguments you pass in; it cannot infer the type parameters only from a constraint or return value.»", source: "ms-gen-methods" },
  ],
  edgeCases: [
    { text: "Метод обобщён <b>только своим</b> списком <code>&lt;T&gt;</code>: «A generic method is a method that is <span class=\"hl\">declared with type parameters</span>» — не потому что лежит в generic-типе.", source: "ms-gen-methods" },
    { text: "Вывод <b>не работает без параметров</b>: «type inference does not work with methods that have <span class=\"hl\">no parameters</span>» — тогда пиши <code>Make&lt;int&gt;()</code> явно (иначе CS0411).", source: "ms-gen-methods" },
    { text: "Вывод идёт <b>до</b> резолва перегрузок: «Type inference occurs at compile time <span class=\"hl\">before the compiler tries to resolve overloaded method signatures</span>».", source: "ms-gen-methods" },
  ],

  misconceptions: [
    {
      wrong: "раз метод внутри generic-класса, он уже generic; и <T> всегда надо писать явно",
      hook: 'Оба тезиса неверны. Во-первых, метод обобщён <b>только своим</b> списком параметров типа: «A generic method is a method that is <span class="hl">declared with type parameters</span>» — не потому, что лежит в <code>Class&lt;T&gt;</code>. Во-вторых, <code>&lt;T&gt;</code> почти всегда писать <b>не надо</b>: «You can also omit the type argument and the <span class="hl">compiler will infer it</span>». Компилятор выводит <code>T</code> из аргументов: «The compiler can infer the type parameters based on the <b>method arguments</b> you pass in; it cannot infer the type parameters only from a constraint or return value». Отсюда границы: без параметров вывода нет, а идёт он <b>до</b> резолва перегрузок. Дальше <b>пять разборов</b>: что делает метод обобщённым, вывод из аргументов, вывод нескольких <code>&lt;K,V&gt;</code>, границы вывода (нет параметров / до overload), и <b>машинная панель</b> — один <code>Echo&lt;T&gt;</code>, три вывода по вызову (реальный прогон: <code>42:Int32 hi:String 3.5:Double</code>).',
      source: "ms-gen-methods",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что делает метод generic", title: "Метод обобщён своим <T>, а не расположением в классе",
      viewBox: "0 0 340 210", zones: OWN_ZONES,
      code: ["static void Swap<T>(ref T a, ref T b) { ... }   // generic — свой <T>", "class Sample<T> { void M(T x) { } }              // M НЕ generic:", "//   T взят у класса, у метода СВОЕГО списка параметров типа нет"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Swap&lt;T&gt;</code> обобщён, потому что <span class="hl">объявлен с параметрами типа</span> — свой список <code>&lt;T&gt;</code> после имени.', nodes: [{ id: "o", kind: "obj", at: { zone: "own", row: 0 }, typeTag: "Swap<T>", value: "свой <T>", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>M(T x)</code> в <code>Sample&lt;T&gt;</code> использует <code>T</code> <b>класса</b>, но своего списка <code>&lt;T&gt;</code> у метода нет → метод <span class="hl">не generic</span>.', nodes: [{ id: "o", kind: "obj", at: { zone: "own", row: 0 }, typeTag: "Swap<T>", value: "свой <T>" }, { id: "n", kind: "gate", at: { zone: "notown", row: 0 }, state: "fail", label: "M(T x)", detail: "T от класса", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Итог: generic-метод определяется <b>наличием собственного</b> списка параметров типа — независимо от того, generic ли содержащий тип.', nodes: [{ id: "o", kind: "gate", at: { zone: "own", row: 0 }, state: "ok", label: "есть <T>", detail: "generic" }, { id: "n", kind: "gate", at: { zone: "notown", row: 0 }, state: "fail", label: "нет <T>", detail: "не generic", accent: true }], edges: [] },
      ],
      explain: 'Точное определение: «A generic method is a method that is <span class="hl">declared with type parameters</span>». Ключевой нюанс — обобщённость не наследуется от содержащего типа: метод обобщён только тем, что имеет <b>свой</b> список <code>&lt;T&gt;</code>. Внутри generic-класса «non-generic methods can access the class-level type parameters» — то есть <code>M(T x)</code> может использовать <code>T</code> класса, оставаясь необобщённым методом. А если объявить у метода параметр с тем же именем, что у класса, будет предупреждение: «the compiler generates warning <span class="hl">CS0693</span> because within the method scope, the argument supplied for the inner <code>T</code> hides the argument supplied for the outer <code>T</code>». Практика: дай методу своё имя параметра (<code>&lt;U&gt;</code>), если он должен быть обобщён отдельно от класса.',
      sources: ["ms-gen-methods"],
    },
    {
      id: "s2", num: "02", kicker: "Вывод из аргументов", title: "Echo(42): компилятор выводит T=int без явного <int>",
      viewBox: "0 0 340 210", zones: INFER_ZONES,
      code: ["static string Echo<T>(T x) => $\"{x}:{typeof(T).Name}\";", "Echo<int>(42)   // можно явно", "Echo(42)        // но обычно — вывод: T = int"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Можно указать <code>&lt;int&gt;</code> явно: <code>Echo&lt;int&gt;(42)</code>. Но это <b>избыточно</b> — тип очевиден из аргумента.', nodes: [{ id: "c", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "Echo<int>(42)", value: "явно", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Echo(42)</code> без <code>&lt;int&gt;</code>: «the <span class="hl">compiler will infer it</span>». Из аргумента <code>42</code> компилятор выводит <code>T=int</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "Echo(42)", value: "без <T>" }, { id: "i", kind: "gate", at: { zone: "infer", row: 0 }, state: "ok", label: "вывод", detail: "T = int", accent: true }], edges: [{ id: "e", from: "c", to: "i", accent: true }] },
        { codeLine: 2, out: "", caption: 'Вывод — только из <b>аргументов</b>: «based on the <span class="hl">method arguments you pass in</span>; it cannot infer… only from a constraint or return value». Тип аргумента → тип параметра.', nodes: [{ id: "i", kind: "gate", at: { zone: "infer", row: 0 }, state: "ok", label: "42 → int", detail: "из аргумента", accent: true }], edges: [] },
      ],
      explain: 'Type inference убирает шум явных <code>&lt;T&gt;</code>: «You can also omit the type argument and the <span class="hl">compiler will infer it</span>. The following call to <code>Swap</code> is equivalent to the previous call:» — то есть <code>Swap(ref a, ref b)</code> без явного <code>&lt;T&gt;</code>. Источник вывода строго один — аргументы: «The compiler can infer the type parameters based on the <b>method arguments</b> you pass in; it cannot infer the type parameters only from a constraint or return value». Поэтому <code>Echo(42)</code> даёт <code>T=int</code>, <code>Echo("hi")</code> — <code>T=string</code>: тип берётся из фактического аргумента, а <code>typeof(T)</code> в теле это подтверждает (реификация из первого урока секции). Правило одинаково для статических и инстансных методов: «The same rules for type inference apply to static methods and instance methods».',
      sources: ["ms-gen-methods"],
    },
    {
      id: "s3", num: "03", kicker: "Вывод нескольких параметров", title: "Pair<K,V>(1, \"x\"): каждый параметр выводится отдельно",
      viewBox: "0 0 340 210", zones: KV_ZONES,
      code: ["static string Pair<K,V>(K k, V v) => $\"{typeof(K).Name}->{typeof(V).Name}\";", "Pair(1, \"x\")      // K=int,  V=string", "Pair(true, 2.0)   // K=bool, V=double"],
      predictAt: 1, predictQ: '<code>Pair&lt;K,V&gt;(K k, V v)</code> печатает <code>typeof(K)-&gt;typeof(V)</code>. Что даст <code>Pair(1, "x")</code> и <code>Pair(true, 2.0)</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Pair(1, "x")</code>: компилятор выводит <b>каждый</b> параметр по своему аргументу — <code>K=int</code> из <code>1</code>, <code>V=string</code> из <code>"x"</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "args", row: 0 }, typeTag: "Pair(1, \"x\")", value: "int, string", accent: true }, { id: "kv", kind: "gate", at: { zone: "kv", row: 0 }, state: "ok", label: "K=int, V=string", detail: "выведены" }], edges: [{ id: "e", from: "a", to: "kv", accent: true }] },
        { codeLine: 2, out: "", caption: 'Другой вызов — другие типы: <code>Pair(true, 2.0)</code> → <code>K=bool</code>, <code>V=double</code>. Вывод <span class="hl">независим</span> для каждого параметра.', nodes: [{ id: "a", kind: "obj", at: { zone: "args", row: 0 }, typeTag: "Pair(true, 2.0)", value: "bool, double" }, { id: "kv", kind: "gate", at: { zone: "kv", row: 0 }, state: "ok", label: "K=bool, V=double", detail: "выведены", accent: true }], edges: [] },
        { codeLine: 2, out: "Int32->String | Boolean->Double", caption: 'Панель: <span class="hl">Int32->String | Boolean->Double</span> (реальный прогон) — CLR-имена выведенных типов. Ни одного явного <code>&lt;K,V&gt;</code>.', nodes: [{ id: "kv", kind: "gate", at: { zone: "kv", row: 0 }, state: "ok", label: "результат", detail: "Int32->String / Boolean->Double", accent: true }], edges: [] },
      ],
      explain: 'Вывод масштабируется на несколько параметров типа: каждый выводится из своего аргумента независимо. <code>Pair&lt;K,V&gt;(1, "x")</code> даёт <code>K=int</code>, <code>V=string</code>; <code>Pair(true, 2.0)</code> — <code>K=bool</code>, <code>V=double</code>. Это прямое следствие правила «based on the method arguments you pass in»: позиционное соответствие «аргумент → параметр типа». Метод при этом может быть перегружен по числу параметров типа: «Generic methods can be overloaded on several type parameters. For example, the following methods can all be located in the same class:» — <code>void DoWork()</code>, <code>void DoWork&lt;T&gt;()</code> и <code>void DoWork&lt;T, U&gt;()</code> сосуществуют. Реальный прогон <code>Pair</code> печатает CLR-имена (<code>Int32</code>/<code>String</code>/<code>Boolean</code>/<code>Double</code>) — вывод состоялся полностью без явных аргументов типа.',
      sources: ["ms-gen-methods"],
    },
    {
      id: "s4", num: "04", kicker: "Границы вывода", title: "Нет параметров — нет вывода; вывод идёт ДО overload-резолва",
      viewBox: "0 0 340 210", zones: LIMIT_ZONES,
      code: ["static T Make<T>() => default(T);", "var x = Make();      // ❌ CS0411 — вывести T не из чего", "var y = Make<int>(); // ✓ явный аргумент типа", "// вывод идёт ДО резолва перегрузок; overload-резолв берёт удачные"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Make&lt;T&gt;()</code> без параметров: выводить <code>T</code> <b>не из чего</b>. «type inference does not work with methods that have <span class="hl">no parameters</span>» → CS0411.', nodes: [{ id: "n", kind: "gate", at: { zone: "noinf", row: 0 }, state: "fail", label: "Make()", detail: "CS0411", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Лечится <b>явным</b> аргументом типа: <code>Make&lt;int&gt;()</code>. Возврат <code>T</code> для вывода не используется — только параметры.', nodes: [{ id: "n", kind: "gate", at: { zone: "noinf", row: 0 }, state: "fail", label: "Make()", detail: "CS0411" }, { id: "e", kind: "gate", at: { zone: "noinf", row: 1 }, state: "ok", label: "Make<int>()", detail: "явно ✓", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Порядок фаз: «Type inference occurs at compile time <span class="hl">before the compiler tries to resolve overloaded method signatures</span>». Сначала вывод, потом выбор перегрузки.', nodes: [{ id: "e", kind: "gate", at: { zone: "noinf", row: 0 }, state: "ok", label: "Make<int>()", detail: "явно" }, { id: "b", kind: "gate", at: { zone: "before", row: 0 }, state: "ok", label: "вывод → overload", detail: "два шага", accent: true }], edges: [] },
      ],
      explain: 'Две границы, которые ловят на собеседованиях. Первая — <b>нет вывода без параметров</b>: «it cannot infer the type parameters only from a constraint or return value. Therefore <span class="hl">type inference does not work with methods that have no parameters</span>». <code>Make&lt;T&gt;()</code> нельзя вызвать как <code>Make()</code> — компилятор бросает CS0411, надо писать <code>Make&lt;int&gt;()</code>. Вторая — <b>порядок фаз</b>: «Type inference occurs at compile time before the compiler tries to resolve overloaded method signatures. The compiler applies type inference logic to <span class="hl">all generic methods that share the same name</span>. In the overload resolution step, the compiler includes only those generic methods on which type inference succeeded». То есть сначала для каждой одноимённой обобщённой перегрузки проверяется, выводится ли <code>T</code>; те, где вывод провалился, из резолва выбрасываются.',
      sources: ["ms-gen-methods"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · вывод по вызову", title: "Один Echo<T>, три вывода: int / string / double",
      viewBox: "0 0 340 210", zones: POLY_ZONES,
      code: ["static string Echo<T>(T x) => $\"{x}:{typeof(T).Name}\";", "Echo(42)   Echo(\"hi\")   Echo(3.5)", "// один метод — три выведенных T, каждый реален в рантайме"],
      predictAt: 1, predictQ: 'Один <code>Echo&lt;T&gt;(T x)</code> печатает <code>x:typeof(T).Name</code>. Что даст цепочка <code>Echo(42) Echo("hi") Echo(3.5)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Один</b> метод <code>Echo&lt;T&gt;</code>. Что за <code>T</code> — определит компилятор в каждом вызове по типу аргумента.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Echo<T>", value: "T x", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Три вызова — три вывода: <code>42</code>→<code>int</code>, <code>"hi"</code>→<code>string</code>, <code>3.5</code>→<code>double</code>. Явных <code>&lt;T&gt;</code> <span class="hl">ни одного</span>.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Echo<T>", value: "T x" }, { id: "a", kind: "chip", at: { zone: "three", row: 0 }, value: "42 → int" }, { id: "b", kind: "chip", at: { zone: "three", row: 1 }, value: "\"hi\" → string", accent: true }], edges: [] },
        { codeLine: 2, out: "42:Int32 hi:String 3.5:Double", caption: 'Панель: <span class="hl">42:Int32 hi:String 3.5:Double</span> (реальный прогон). <code>typeof(T)</code> подтверждает: выведенный тип <b>реален</b> в рантайме.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "Echo<T>", value: "вывод × 3" }, { id: "r", kind: "gate", at: { zone: "three", row: 0 }, state: "ok", label: "результат", detail: "Int32/String/Double", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — вывод <code>T</code> по каждому вызову, снятый прогоном. Один исходник <code>Echo&lt;T&gt;(T x)</code> при трёх вызовах даёт три разных <code>T</code>: <code>Echo(42)</code>→<code>int</code>, <code>Echo("hi")</code>→<code>string</code>, <code>Echo(3.5)</code>→<code>double</code>. Реальный вывод — <code>42:Int32 hi:String 3.5:Double</code>: значение плюс <b>реальное</b> имя выведенного типа (<code>typeof(T)</code> реифицирован, как в первом уроке секции). Это и есть суть вывода: «The compiler can infer the type parameters based on the method arguments you pass in» — тип аргумента становится типом параметра, автоматически и на компиляции. Явные <code>&lt;int&gt;</code>/<code>&lt;string&gt;</code>/<code>&lt;double&gt;</code> не нужны, но были бы эквивалентны.',
      sources: ["ms-gen-methods"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Echo&lt;T&gt;(T x) =&gt; $"{x}:{typeof(T).Name}"; Console.WriteLine($"{Echo(42)} {Echo("hi")} {Echo(3.5)}");</code> — что напечатает?',
      options: ["42:Int32 hi:String 3.5:Double", "42:T hi:T 3.5:T", "42:Object hi:Object 3.5:Object", "42:int hi:string 3.5:double"], correctIndex: 0, xp: 10,
      okText: 'Вывод из аргумента: <code>Echo(42)</code>→<code>T=int</code>, <code>Echo("hi")</code>→<code>string</code>, <code>Echo(3.5)</code>→<code>double</code>. <code>typeof(T)</code> даёт реальные CLR-имена. Вывод: <b>42:Int32 hi:String 3.5:Double</b>.',
      noText: 'Компилятор выводит <code>T</code> по каждому аргументу без явного <code>&lt;T&gt;</code>. Тип реален в рантайме (реификация). Реальный вывод: <b>42:Int32 hi:String 3.5:Double</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "42:Int32 hi:String 3.5:Double" }, sourceRefs: ["ms-gen-methods"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Pair&lt;K,V&gt;(K k, V v) =&gt; $"{typeof(K).Name}-&gt;{typeof(V).Name}"; Console.WriteLine($"{Pair(1, "x")} | {Pair(true, 2.0)}");</code> — что напечатает?',
      options: ["Int32->String | Boolean->Double", "K->V | K->V", "Object->Object | Object->Object", "int->string | bool->double"], correctIndex: 0, xp: 10,
      okText: 'Каждый параметр типа выводится из своего аргумента: <code>Pair(1,"x")</code>→<code>K=int,V=string</code>; <code>Pair(true,2.0)</code>→<code>K=bool,V=double</code>. CLR-имена: <b>Int32->String | Boolean->Double</b>.',
      noText: 'Вывод «based on the method arguments you pass in» работает позиционно для каждого параметра. Реальный вывод: <b>Int32->String | Boolean->Double</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32->String | Boolean->Double" }, sourceRefs: ["ms-gen-methods"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Which&lt;T&gt;(T x) =&gt; "generic"; static string Which(int x) =&gt; "int"; Console.WriteLine($"{Which(5)} {Which("s")}");</code> — что напечатает?',
      options: ["int generic", "generic generic", "int int", "generic int"], correctIndex: 0, xp: 10,
      okText: 'Overload-резолв предпочитает <b>более точную</b> необобщённую перегрузку: <code>Which(5)</code>→<code>Which(int)</code>=<span class="hl">int</span>. Для <code>"s"</code> подходит только generic → <b>generic</b>. Вывод: <b>int generic</b>.',
      noText: 'Для <code>int</code>-аргумента точная <code>Which(int)</code> выигрывает у обобщённой; для <code>string</code> — только <code>Which&lt;T&gt;</code>. Вывод: <b>int generic</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "int generic" }, sourceRefs: ["ms-gen-methods"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Свой <T> = generic", v: '«A generic method is a method that is <span class="hl">declared with type parameters</span>» — обобщённость от собственного списка <code>&lt;T&gt;</code>, не от класса. Одинаковое имя с параметром класса → <b>CS0693</b>.' },
    { icon: "cost", k: "Вывод из аргументов", v: '«compiler will infer it» из аргументов: <code>Echo(42)</code>→int, <code>Pair(1,"x")</code>→(int,string). Явный <code>&lt;T&gt;</code> обычно не нужен. Замер: <code>42:Int32 hi:String 3.5:Double</code>.' },
    { icon: "avoid", k: "Границы вывода", v: 'Вывод только из аргументов — «cannot infer the type parameters only from a constraint or return value», значит без параметров <b>CS0411</b> (нужен явный <code>&lt;T&gt;</code>). Идёт <b>до</b> резолва перегрузок; точная перегрузка бьёт generic (замер: <code>int generic</code>).' },
  ],

  foot: 'урок · <b>generic-методы и вывод типов</b> · 5 анимир. разборов · inference из аргументов · панель Echo × 3 · дизайн <b>mid</b>',
};
