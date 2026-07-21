/**
 * Lesson: default(T) и default-литерал (CS.S10.default-keyword) — expert density, 5 animated
 * deep-dives. The problem generics create: inside a generic you can't write `null` (T might be a
 * value type) or `0` (T might be a reference type) — you need the type-parameter-safe "zero" of T.
 * That is `default(T)`: null for reference types, the all-fields-zero value for value types. The
 * `default` LITERAL is the same value where the compiler can infer T (variable init, optional
 * parameter, return). Plus the three contexts of the `default` keyword (operator/literal, switch,
 * the `default` type-constraint).
 *
 * SIGNATURE machine panel (s5): default(T) is type-parameter-polymorphic, measured. default(int)=0,
 * default(bool)=False, default(string)=null, default(int?)=null — one expression, four correct
 * zeros. REAL run-csharp measurement (this file's exec cards): c1 "0|False|null|null" ·
 * c2 "0,0,0 | False,False" · c3 "Int32=0 Double=0".
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../operators/default and .../keywords/default (fetched + substring-checked
 * 2026-07-21, ms.date 2026-01-20 / 2026-01-21):
 *   - every English quote is VERBATIM from those two pages;
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "0|False|null|null" · c2 "0,0,0 | False,False" · c3 "Int32=0 Double=0".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.default-keyword/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the problem — inside a generic neither null nor 0 is safe.
const Z_PROB: Zone = { id: "prob", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПРОБЛЕМА В ДЖЕНЕРИКЕ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "null? 0? — не знаем", subCls: "vz-zsub heap", subY: 47 };
const Z_ANS: Zone = { id: "ans", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РЕШЕНИЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "default(T)", subCls: "vz-zsub good", subY: 47 };
const PROB_ZONES: Zone[] = [Z_PROB, Z_ANS];

// s2: value type default = zero-inited fields.
const Z_VAL: Zone = { id: "val", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "VALUE-ТИП · default = ноль по всем полям", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "int→0 · bool→False · Point→(0,0)", subCls: "vz-zsub good", subY: 47 };
const VAL_ZONES: Zone[] = [Z_VAL];

// s3: reference type default = null; Nullable<T> default = null.
const Z_REF: Zone = { id: "ref", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "REFERENCE · default", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "string→null", subCls: "vz-zsub", subY: 47 };
const Z_NUL: Zone = { id: "nul", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Nullable<T> · default", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "int?→null (не 0)", subCls: "vz-zsub heap", subY: 47 };
const REF_ZONES: Zone[] = [Z_REF, Z_NUL];

// s4: the default literal — inferred contexts.
const Z_LIT: Zone = { id: "lit", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "default-ЛИТЕРАЛ · тип выводится компилятором", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "init · optional param · return", subCls: "vz-zsub", subY: 40 };
const LIT_ZONES: Zone[] = [Z_LIT];

// s5 (SIGNATURE): one default(T), four correct zeros — measured.
const Z_ONE: Zone = { id: "one", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "ОДНО default(T)", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "var v = default(T)", subCls: "vz-zsub", subY: 47 };
const Z_FOUR: Zone = { id: "four", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone good", label: "ЧЕТЫРЕ НУЛЯ", labelCls: "vz-zlabel good sm", lx: 241, ly: 24, sub: "по типу аргумента", subCls: "vz-zsub good", subY: 47 };
const POLY_ZONES: Zone[] = [Z_ONE, Z_FOUR];

export const defaultKeyword: LessonData = {
  id: "CS.S10.default-keyword",
  track: "CS",
  section: "CS.S10",
  module: "S10.3",
  lang: "csharp",
  title: "default(T) и default-литерал для параметра типа",
  kicker: "C# вглубь · S10 · нейтральное значение T",
  home: { subtitle: "default(T): null для ref, ноль по полям для value; default-литерал", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-default-op", kind: "doc", org: "Microsoft Learn", title: "default value expressions - C# reference", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/default", date: "2026-01-20" },
    { id: "ms-default-kw", kind: "doc", org: "Microsoft Learn", title: "default keyword - C# reference", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/default", date: "2026-01-21" },
  ],

  spec: [
    { text: "«A default value expression produces the default value of a type. Two kinds of default value expressions exist: the default operator call and a default literal.» <span class=\"ru-tr\">«Выражение значения по умолчанию порождает значение по умолчанию для типа. Существует два вида выражений значения по умолчанию: вызов оператора default и литерал default.»</span>", source: "ms-default-op" },
  ],
  edgeCases: [
    { text: "Аргумент — <b>тип или параметр типа</b>: «The argument to the <code>default</code> operator must be the name of a <span class=\"hl\">type or a type parameter</span>». <span class=\"ru-tr\">«Аргументом оператора <code>default</code> должно быть имя типа или параметра типа».</span> Значит внутри дженерика законно <code>default(T)</code>.", source: "ms-default-op" },
    { text: "<code>default(int?)</code> — это <b>null</b>, а не 0: у <code>Nullable&lt;T&gt;</code> дефолт — «null» (собственный прогон: <code>System.Nullable`1[System.Int32] is null</code> из докового примера).", source: "ms-default-op" },
    { text: "<code>default</code>-<b>литерал</b> = то же значение, где тип выводим: «The <code>default</code> literal expression produces the <span class=\"hl\">same value as the <code>default(T)</code> expression</span> where <code>T</code> is the inferred type». <span class=\"ru-tr\">«Выражение-литерал <code>default</code> порождает то же значение, что и выражение <code>default(T)</code>, где <code>T</code> — выведенный тип».</span>", source: "ms-default-op" },
  ],

  misconceptions: [
    {
      wrong: "внутри дженерика можно вернуть null как нейтральное значение T — компилятор разберётся",
      hook: 'Нельзя: <code>null</code> не годится, если <code>T</code> — value-тип, а <code>0</code> не годится, если <code>T</code> — ссылочный. Нужен <b>тип-параметр-безопасный ноль</b>. Это <code>default(T)</code>: «A default value expression produces the <span class="hl">default value of a type</span>… the <code>default</code> operator call and a <code>default</code> literal». <span class="ru-tr">«Выражение значения по умолчанию порождает значение по умолчанию для типа… вызов оператора <code>default</code> и литерал <code>default</code>».</span> Аргумент может быть <b>параметром типа</b>: «The argument to the <code>default</code> operator must be the name of a type or a type parameter». <span class="ru-tr">«Аргументом оператора <code>default</code> должно быть имя типа или параметра типа».</span> Для value-типов это ноль по всем полям, для ссылочных — <code>null</code>, для <code>int?</code> — тоже <code>null</code> (не 0!). Дальше <b>пять разборов</b>: сама проблема, value-дефолт (ноль по полям), reference/Nullable-дефолт (null), <code>default</code>-литерал в выводимых контекстах, и <b>машинная панель</b> — одно <code>default(T)</code>, четыре правильных нуля по типу аргумента (реальный прогон: <code>0|False|null|null</code>).',
      source: "ms-default-op",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Проблема · ни null, ни 0", title: "Внутри дженерика нужен нейтральный «ноль» типа T",
      viewBox: "0 0 340 210", zones: PROB_ZONES,
      code: ["static T First<T>(T[] a) => a.Length > 0 ? a[0] : /* ??? */;", "//   return null;  — нельзя, если T — value-тип", "//   return 0;     — нельзя, если T — reference-тип", "static T First<T>(T[] a) => a.Length > 0 ? a[0] : default(T);"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Метод должен вернуть «пусто», когда массив пуст. Но <code>T</code> заранее неизвестен — какое значение <span class="hl">нейтрально</span>?', nodes: [{ id: "p", kind: "gate", at: { zone: "prob", row: 0 }, state: "fail", label: "return ???", detail: "T неизвестен", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>null</code> отпадает для value-типов, <code>0</code> — для ссылочных. Ни одно <b>литеральное</b> значение не подходит для любого <code>T</code>.', nodes: [{ id: "p", kind: "gate", at: { zone: "prob", row: 0 }, state: "fail", label: "null / 0", detail: "не универсальны", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>default(T)</code> — <span class="hl">тип-параметр-безопасный ноль</span>: null для ref, ноль-по-полям для value. Одно выражение на все случаи.', nodes: [{ id: "p", kind: "gate", at: { zone: "prob", row: 0 }, state: "fail", label: "null / 0", detail: "не годятся" }, { id: "a", kind: "gate", at: { zone: "ans", row: 0 }, state: "ok", label: "default(T)", detail: "универсально", accent: true }], edges: [{ id: "e", from: "p", to: "a", accent: true }] },
      ],
      explain: 'Дженерики создают конкретную проблему: у тебя нет универсального «пустого» значения, потому что <code>T</code> может быть и value-, и reference-типом. <code>default</code> решает это: «A default value expression produces the <span class="hl">default value of a type</span>. Two kinds of default value expressions exist: the <code>default</code> operator call and a <code>default</code> literal». <span class="ru-tr">«Выражение значения по умолчанию порождает значение по умолчанию для типа. Существует два вида выражений значения по умолчанию: вызов оператора <code>default</code> и литерал <code>default</code>».</span> Ключевое — аргументом может быть <b>параметр типа</b>: «The argument to the <code>default</code> operator must be the name of a <code>type</code> or a <code>type parameter</code>». <span class="ru-tr">«Аргументом оператора <code>default</code> должно быть имя <code>type</code> или <code>type parameter</code>».</span> Поэтому <code>default(T)</code> внутри <code>First&lt;T&gt;</code> легально и даёт корректный нейтральный элемент независимо от того, чем окажется <code>T</code>. Это стандартный паттерн для <code>TryGet</code>-подобных API и «нет результата».',
      sources: ["ms-default-op"],
    },
    {
      id: "s2", num: "02", kicker: "Value-тип · ноль по полям", title: "Для value-типа default = все поля в ноль",
      viewBox: "0 0 340 210", zones: VAL_ZONES,
      code: ["default(int)     // 0", "default(bool)    // False", "struct Point { public int X, Y; }", "default(Point)   // (0, 0) — каждое поле в свой default"],
      predictAt: 3, predictQ: 'Что напечатает <code>Console.WriteLine(default(Point))</code>, где <code>struct Point { public int X, Y; }</code> с <code>ToString() =&gt; "({X},{Y})"</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>default(int)</code> = <b>0</b>, <code>default(bool)</code> = <b>False</b>. Для встроенных value-типов дефолт — их нулевое значение.', nodes: [{ id: "i", kind: "gate", at: { zone: "val", row: 0, col: 0 }, state: "ok", label: "default(int)", detail: "0", accent: true }, { id: "b", kind: "gate", at: { zone: "val", row: 0, col: 1 }, state: "ok", label: "default(bool)", detail: "False" }], edges: [] },
        { codeLine: 3, out: "(0,0)", caption: 'Для <b>своего</b> struct дефолт — <span class="hl">каждое поле в свой default</span>: <code>Point</code> → <code>X=0, Y=0</code> → <b>(0,0)</b> (реальный прогон).', nodes: [{ id: "p", kind: "gate", at: { zone: "val", row: 0 }, state: "ok", label: "default(Point)", detail: "X=0, Y=0", accent: true }], edges: [] },
      ],
      explain: 'Для value-типа <code>default</code> — это <b>zero-initialized</b> значение: все поля выставлены в их собственные дефолты. Из докового примера видно, что дефолт печатается конкретным значением, а не «пусто»: <code>default(int)</code> даёт <code>0</code>, <code>default(System.Numerics.Complex)</code> даёт <code>(0, 0)</code>. Для собственного <code>struct Point { int X, Y; }</code> реальный прогон печатает <code>(0,0)</code>: рантайм обнуляет память под struct, и каждое поле получает свой default рекурсивно. Важное следствие: <code>default(T)</code> для value-типа — <b>не null</b>; это полноценное значение, которое можно использовать без <code>NullReferenceException</code>. Именно поэтому <code>default</code> лучше, чем «вернуть null»: он всегда даёт валидный экземпляр нужного вида.',
      sources: ["ms-default-op"],
    },
    {
      id: "s3", num: "03", kicker: "Reference и Nullable · null", title: "Для ссылочного типа и для int? default = null",
      viewBox: "0 0 340 210", zones: REF_ZONES,
      code: ["default(object) is null   // True", "default(string)           // null", "default(int?)             // null — НЕ 0! (Nullable<int>)"],
      predictAt: 2, predictQ: 'Внимание к <code>int?</code>: <code>default(int)</code> = 0, а чему равен <code>default(int?)</code> — 0 или null?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Для ссылочного типа дефолт — <span class="hl">null</span>: «<code>Console.WriteLine(default(object) is null);  // output: True</code>». Ссылка ни на что не указывает.', nodes: [{ id: "o", kind: "gate", at: { zone: "ref", row: 0 }, state: "ok", label: "default(string)", detail: "null", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Ловушка: <code>int?</code> — это <code>Nullable&lt;int&gt;</code>, и его дефолт — <span class="hl">null</span>, а не 0. Пустое nullable, а не ноль.', nodes: [{ id: "o", kind: "gate", at: { zone: "ref", row: 0 }, state: "ok", label: "default(string)", detail: "null" }, { id: "n", kind: "gate", at: { zone: "nul", row: 0 }, state: "ok", label: "default(int?)", detail: "null (не 0)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Доковый прогон: <code>default(int?)</code> → «<code>System.Nullable`1[System.Int32] is <span class="hl">null</span></code>». Тип есть, значение — пустое.', nodes: [{ id: "n", kind: "gate", at: { zone: "nul", row: 0 }, state: "ok", label: "Nullable<int>", detail: "= null", accent: true }], edges: [] },
      ],
      explain: 'Для ссылочных типов дефолт — <code>null</code>: доковый пример прямо это показывает — «<code>Console.WriteLine(default(object) is null);  // output: True</code>». Тонкость — <code>Nullable&lt;T&gt;</code>: хотя <code>int</code> — value-тип с дефолтом 0, <code>int?</code> (<code>Nullable&lt;int&gt;</code>) имеет собственный дефолт <b>null</b>, потому что «пустое» состояние Nullable — это отсутствие значения. Доковый вывод <code>DisplayDefaultOf&lt;int?&gt;()</code>: «<code>Default value of System.Nullable`1[System.Int32] is <b>null</b></code>». Практический вывод: <code>default(T)</code> корректно различает три случая — 0/False для value, null для reference, null для Nullable — не путай <code>default(int)</code> и <code>default(int?)</code>.',
      sources: ["ms-default-op"],
    },
    {
      id: "s4", num: "04", kicker: "default-литерал · вывод типа", title: "default без (T): тип выводит компилятор",
      viewBox: "0 0 340 276", zones: LIT_ZONES,
      code: ["T[] Init<T>(int n, T fill = default) { ... }   // 1) optional-параметр", "T Empty<T>() { return default; }               // 2) return", "int x = default;  Complex c = default;         // 3) init переменной"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>default</code>-<b>литерал</b> (без <code>(T)</code>) годится, где тип <span class="hl">выводим</span>. В optional-параметре <code>T fill = default</code> тип берётся из <code>T</code>.', nodes: [{ id: "p", kind: "gate", at: { zone: "lit", row: 0 }, state: "ok", label: "T fill = default", detail: "тип = T", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'В <code>return default;</code> тип выводится из <b>возвращаемого типа</b> метода. Тот же результат, что <code>default(T)</code>.', nodes: [{ id: "p", kind: "gate", at: { zone: "lit", row: 0 }, state: "ok", label: "T fill = default", detail: "тип = T" }, { id: "r", kind: "gate", at: { zone: "lit", row: 1 }, state: "ok", label: "return default", detail: "тип = возврат", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'При <b>инициализации</b> переменной тип известен из объявления: <code>int x = default;</code> → 0. «produces the <span class="hl">same value as the default(T) expression</span>». <span class="ru-tr">«порождает то же значение, что и выражение default(T)».</span>', nodes: [{ id: "p", kind: "gate", at: { zone: "lit", row: 0 }, state: "ok", label: "T fill = default", detail: "тип = T" }, { id: "r", kind: "gate", at: { zone: "lit", row: 1 }, state: "ok", label: "return default", detail: "тип = возврат" }, { id: "v", kind: "gate", at: { zone: "lit", row: 2 }, state: "ok", label: "int x = default", detail: "0", accent: true }], edges: [] },
      ],
      explain: 'Когда тип понятен из контекста, можно опустить <code>(T)</code> и писать просто <code>default</code>: «You can use the <code>default</code> literal to produce the default value of a type <span class="hl">when the compiler can infer the expression type</span>. The <code>default</code> literal expression produces the same value as the <code>default(T)</code> expression where <code>T</code> is the inferred type». <span class="ru-tr">«Литерал <code>default</code> можно использовать, чтобы получить значение по умолчанию для типа, когда компилятор способен вывести тип выражения. Выражение-литерал <code>default</code> порождает то же значение, что и выражение <code>default(T)</code>, где <code>T</code> — выведенный тип».</span> Контексты из доки: «In the assignment or initialization of a variable», <span class="ru-tr">«При присваивании или инициализации переменной»,</span> «In the declaration of the default value for an optional method parameter», <span class="ru-tr">«При объявлении значения по умолчанию для необязательного параметра метода»,</span> «In a method call to provide an argument value», <span class="ru-tr">«При вызове метода — чтобы передать значение аргумента»,</span> «In a <code>return</code> statement or as an expression in an expression-bodied member». <span class="ru-tr">«В операторе <code>return</code> или как выражение в члене с телом-выражением».</span> Самый частый — optional-параметр <code>T fill = default</code>: без <code>default</code>-литерала для обобщённого параметра дефолт не задать иначе.',
      sources: ["ms-default-op"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · один default, четыре нуля", title: "default(T) полиморфен по T: 0 | False | null | null",
      viewBox: "0 0 340 210", zones: POLY_ZONES,
      code: ["static string D<T>() { var v = default(T); return v == null ? \"null\" : v.ToString(); }", "D<int>()   D<bool>()   D<string>()   D<int?>()", "// один и тот же код default(T) — четыре разных правильных нуля"],
      predictAt: 1, predictQ: 'Метод <code>D&lt;T&gt;()</code> печатает <code>default(T)</code>. Что даст цепочка <code>D&lt;int&gt;()|D&lt;bool&gt;()|D&lt;string&gt;()|D&lt;int?&gt;()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В теле <code>D&lt;T&gt;</code> — <b>одно</b> выражение <code>default(T)</code>. Что оно вернёт, зависит от аргумента типа при вызове.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "D<T>", value: "default(T)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Value-типы дают ноль (<code>int</code>→0, <code>bool</code>→False), ссылочный — <span class="hl">null</span>, <code>int?</code> — тоже null. Одно выражение, четыре разных значения.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "D<T>", value: "default(T)" }, { id: "f0", kind: "chip", at: { zone: "four", row: 0 }, value: "int → 0" }, { id: "f1", kind: "chip", at: { zone: "four", row: 1 }, value: "bool → False", accent: true }], edges: [] },
        { codeLine: 2, out: "0|False|null|null", caption: 'Панель: <span class="hl">0|False|null|null</span> (реальный прогон). <code>default(T)</code> полиморфен по <code>T</code> — правильный ноль для каждого рода типа.', nodes: [{ id: "o", kind: "obj", at: { zone: "one", row: 0 }, typeTag: "default(T)", value: "полиморфен" }, { id: "r", kind: "gate", at: { zone: "four", row: 0 }, state: "ok", label: "результат", detail: "0|False|null|null", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — полиморфизм <code>default(T)</code> по типу-аргументу, снятый прогоном. Один и тот же исходник <code>var v = default(T)</code> внутри <code>D&lt;T&gt;()</code> при разных вызовах даёт разные значения: <code>default(int)</code> = <b>0</b>, <code>default(bool)</code> = <b>False</b>, <code>default(string)</code> = <b>null</b>, <code>default(int?)</code> = <b>null</b>. Реальный вывод — <code>0|False|null|null</code>. Это и есть причина существования <code>default</code>: «A default value expression produces the default value of a type», <span class="ru-tr">«Выражение значения по умолчанию порождает значение по умолчанию для типа»,</span> где «type» — это <b>подставленный</b> в рантайме аргумент <code>T</code>. Никакой литерал (<code>null</code> или <code>0</code>) так не умеет: только <code>default(T)</code> выбирает верный ноль автоматически.',
      sources: ["ms-default-op"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string D&lt;T&gt;() { var v = default(T); return v == null ? "null" : v.ToString(); } Console.WriteLine($"{D&lt;int&gt;()}|{D&lt;bool&gt;()}|{D&lt;string&gt;()}|{D&lt;int?&gt;()}");</code> — что напечатает?',
      options: ["0|False|null|null", "0|false|null|0", "null|null|null|null", "0|False||0"], correctIndex: 0, xp: 10,
      okText: '<code>default(T)</code> полиморфен: value → ноль (<code>int</code>→0, <code>bool</code>→False), reference → null, <code>int?</code> (<code>Nullable&lt;int&gt;</code>) → <span class="hl">null</span> (не 0). Вывод: <b>0|False|null|null</b>.',
      noText: 'Value-типы дают zero-inited значение, ссылочные и <code>Nullable&lt;T&gt;</code> — null. <code>default(int?)</code> — именно null, а не 0. Реальный вывод: <b>0|False|null|null</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0|False|null|null" }, sourceRefs: ["ms-default-op"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static T[] Init&lt;T&gt;(int n, T fill = default) { var a = new T[n]; for(int i=0;i&lt;n;i++) a[i]=fill; return a; } Console.WriteLine($"{string.Join(",", Init&lt;int&gt;(3))} | {string.Join(",", Init&lt;bool&gt;(2))}");</code> — что напечатает?',
      options: ["0,0,0 | False,False", "null,null,null | null,null", "0,0,0 | 0,0", ",, | ,"], correctIndex: 0, xp: 10,
      okText: '<code>default</code>-литерал в optional-параметре <code>T fill = default</code> = <code>default(T)</code>: <code>int</code>→0, <code>bool</code>→False. Массивы заполняются нулём типа. Вывод: <b>0,0,0 | False,False</b>.',
      noText: 'Литерал <code>default</code> «produces the same value as the <code>default(T)</code> expression». <span class="ru-tr">«порождает то же значение, что и выражение <code>default(T)</code>».</span> Для <code>int</code> это 0, для <code>bool</code> — False. Реальный вывод: <b>0,0,0 | False,False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0,0,0 | False,False" }, sourceRefs: ["ms-default-op"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string DD&lt;T&gt;() { var v = default(T); return $"{typeof(T).Name}={(v==null?"null":v.ToString())}"; } Console.WriteLine($"{DD&lt;int&gt;()} {DD&lt;double&gt;()}");</code> — что напечатает?',
      options: ["Int32=0 Double=0", "int=0 double=0", "Int32=null Double=null", "Int32=0 Double=0.0"], correctIndex: 0, xp: 10,
      okText: '<code>typeof(T).Name</code> даёт CLR-имя (<code>Int32</code>, <code>Double</code>), <code>default(T)</code> — их ноль. <code>double</code> печатается как <code>0</code> (не <code>0.0</code>). Вывод: <b>Int32=0 Double=0</b>.',
      noText: 'Реификация: <code>typeof(T)</code> знает реальный тип. <code>default(int)</code>=0, <code>default(double)</code>=0 (ToString даёт «0»). Реальный вывод: <b>Int32=0 Double=0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32=0 Double=0" }, sourceRefs: ["ms-default-op"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Зачем default(T)", v: 'Внутри дженерика нет универсального «пустого»: <code>null</code> не годится для value, <code>0</code> — для ref. «The argument to the <code>default</code> operator must be the name of a <span class="hl">type or a type parameter</span>» <span class="ru-tr">«Аргументом оператора <code>default</code> должно быть имя типа или параметра типа»</span> — <code>default(T)</code> даёт верный ноль.' },
    { icon: "cost", k: "Полиморфен по T", v: 'Value → ноль по полям (<code>int</code>→0, <code>Point</code>→(0,0)); reference → null; <code>int?</code> → <b>null</b>, не 0. Замер: одно <code>default(T)</code> → <code>0|False|null|null</code>.' },
    { icon: "avoid", k: "Литерал + три контекста", v: '<code>default</code>-литерал = «same value as the <code>default(T)</code> expression» <span class="ru-tr">«то же значение, что и выражение <code>default(T)</code>»</span> там, где тип выводим (init/optional-параметр/return). Ключевое слово <code>default</code> живёт и в <code>switch</code>, и как <b>type-constraint</b> на override.' },
  ],

  foot: 'урок · <b>default(T) и литерал</b> · 5 анимир. разборов · value/ref/Nullable · панель 0|False|null|null · дизайн <b>mid</b>',
};
