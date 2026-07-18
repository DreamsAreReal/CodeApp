/**
 * Lesson: Приведения — is / as / cast / typeof (CS.S1.casts) — expert density, 5 animated
 * deep-dives. The four type operators and how they DIFFER at runtime: `is` returns a bool and
 * never throws; `as` returns null on failure and never throws; a `(T)` cast can throw
 * InvalidCastException and is the ONLY one doing user-defined conversions; `typeof` is an exact
 * type match on a type NAME while `GetType()`/`is` follow inheritance. And `is` considers
 * boxing/unboxing but NOT numeric or user-defined conversions.
 *
 * SIGNATURE machine panel (s1): the same object through all three operators — `o is int` (False,
 * bool), `o as string` ("hello"), `(int)o` (throws InvalidCastException) — a REAL run-csharp
 * measurement, evidence/F8/casts-exec.txt. The three behaviors side by side is the machine truth.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn type-testing-and-cast (fetch 2026-07-18)
 * + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../operators/type-testing-and-cast;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F8/casts-exec.txt:
 *     "False hello InvalidCastException"; "True False"; "True False True");
 *   - NO GT-M3 red flags: `as` NEVER throws (returns null); the cast throws; `is` returns a bool
 *     (not the object, never throws); `typeof` takes a type NAME not an expression (GetType for a
 *     value); no unsourced IL-level boxing claim about `is`.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.casts/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): three lanes — is / as / cast over one object.
const Z_IS: Zone = { id: "isz", x: 12, y: 34, w: 104, h: 168, cls: "vz-zone", label: "is", labelCls: "vz-zlabel", lx: 64, ly: 24, sub: "bool · не бросает", subCls: "vz-zsub", subY: 47 };
const Z_AS: Zone = { id: "asz", x: 122, y: 34, w: 104, h: 168, cls: "vz-zone good", label: "as", labelCls: "vz-zlabel good", lx: 174, ly: 24, sub: "null · не бросает", subCls: "vz-zsub good", subY: 47 };
const Z_CAST: Zone = { id: "castz", x: 232, y: 34, w: 96, h: 168, cls: "vz-zone heap", label: "(T)cast", labelCls: "vz-zlabel heap sm", lx: 280, ly: 24, sub: "бросает", subCls: "vz-zsub heap", subY: 47 };
const TRIO_ZONES: Zone[] = [Z_IS, Z_AS, Z_CAST];

// s2: is — bool + pattern, boxing but not numeric.
const Z_ISCONV: Zone = { id: "isconv", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "is · ЧТО УЧИТЫВАЕТ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "boxing/unboxing · НЕ numeric", subCls: "vz-zsub", subY: 47 };
const ISCONV_ZONES: Zone[] = [Z_ISCONV];

// s3: as — returns null, never throws.
const Z_ASOK: Zone = { id: "asok", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "as · успех", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "возвращает объект", subCls: "vz-zsub good", subY: 47 };
const Z_ASFAIL: Zone = { id: "asfail", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "as · неудача", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "возвращает null", subCls: "vz-zsub", subY: 47 };
const AS_ZONES: Zone[] = [Z_ASOK, Z_ASFAIL];

// s4: typeof (exact) vs is (inheritance).
const Z_TYPEOF: Zone = { id: "typeofz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "typeof · ТОЧНО", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "имя типа · без наследования", subCls: "vz-zsub", subY: 47 };
const Z_ISINH: Zone = { id: "isinh", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "is · НАСЛЕДОВАНИЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "учитывает базовый", subCls: "vz-zsub good", subY: 47 };
const TYPEOF_ZONES: Zone[] = [Z_TYPEOF, Z_ISINH];

// s5: cast is the only user-defined-conversion path; unbox gates.
const Z_ONLYCAST: Zone = { id: "onlycast", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ТОЛЬКО CAST", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "user-defined конверсии · unbox", subCls: "vz-zsub", subY: 47 };
const CAST_ZONES: Zone[] = [Z_ONLYCAST];

export const casts: LessonData = {
  id: "CS.S1.casts",
  track: "CS",
  section: "CS.S1",
  module: "S1.10",
  lang: "csharp",
  title: "Приведения: is / as / cast / typeof",
  kicker: "C# вглубь · S1 · три поведения",
  home: { subtitle: "is (bool), as (null), cast (бросает), typeof", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-cast", kind: "doc", org: "Microsoft Learn", title: "Type-testing operators and cast expressions (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast", date: "2026-01-20" },
    { id: "ms-boxing", kind: "doc", org: "Microsoft Learn", title: "Boxing and unboxing (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing", date: "2025-10-13" },
  ],

  spec: [
    { text: "«If the conversion isn't possible, the `as` operator returns null. Unlike a cast expression, the `as` operator never throws an exception.»", source: "ms-cast" },
  ],
  edgeCases: [
    { text: "<code>is</code> учитывает <b>boxing/unboxing</b>, но НЕ numeric и НЕ user-defined конверсии: <code>iBoxed is long</code> → <span class=\"hl\">False</span>. Поддерживает pattern matching (<code>o is T v</code>).", source: "ms-cast" },
    { text: "<code>typeof</code> берёт <b>ИМЯ типа</b>, не выражение; даёт <span class=\"hl\">точное</span> совпадение (без наследования). Для run-time типа значения — <code>Object.GetType()</code>. <code>is</code> учитывает наследование.", source: "ms-cast" },
    { text: "<b>Только cast</b> выполняет user-defined конверсии; <code>is</code>/<code>as</code>/<code>typeof</code> перегрузить нельзя. Unbox <code>null</code> → <code>NullReferenceException</code>, unbox в несовместимый тип → <code>InvalidCastException</code>.", source: "ms-boxing" },
  ],

  misconceptions: [
    {
      wrong: "as бросает исключение, а is возвращает приведённый объект",
      hook: 'Две ложные интуиции про поведение. «<span class="wrong">as бросает исключение</span>» — нет: <code>as</code> при неудаче возвращает <b>null</b> и <span class="hl">никогда не бросает</span>; бросает <code>(T)cast</code>. «<span class="wrong">is возвращает приведённый объект / бросает</span>» — нет: <code>is</code> отдаёт <b>bool</b> и тоже не бросает. Один и тот же объект через три оператора ведёт себя <b>по-разному</b>. Ниже <b>пять разборов</b>: <b>машинная панель</b> трёх поведений (реально снятое <code>False hello InvalidCastException</code>), что учитывает <code>is</code>, null от <code>as</code>, <code>typeof</code> vs наследование, и cast как единственный путь user-defined.',
      source: "ms-cast",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · три поведения", title: "Один объект: is → bool, as → null, cast → бросает",
      viewBox: "0 0 340 210", zones: TRIO_ZONES,
      code: ["object o = \"hello\";", "bool isInt = o is int;      // False (bool)", "string asStr = o as string;  // \"hello\"", "int n = (int)o;              // InvalidCastException"],
      predictAt: 1, predictQ: '<code>object o = "hello"</code>. Что дадут <code>o is int</code>, <code>o as string</code>, <code>(int)o</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>o is int</code>: тип не совпал → <b>False</b>. Это <span class="hl">bool</span>, оператор не бросает.', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "fail", label: "o is int", detail: "False", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>o as string</code>: тип совпал → <b>"hello"</b>. При неудаче вернул бы <code>null</code>, но <span class="hl">не бросил</span> бы.', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "fail", label: "o is int", detail: "False" }, { id: "as", kind: "gate", at: { zone: "asz", row: 0 }, state: "ok", label: "o as string", detail: "hello", accent: true }], edges: [] },
        { codeLine: 3, out: "False hello InvalidCastException", caption: '<code>(int)o</code>: несовместимый тип → <span class="hl">InvalidCastException</span>. Только cast бросает. Панель: <b>False hello InvalidCastException</b> (реальный прогон).', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "fail", label: "is", detail: "False" }, { id: "as", kind: "gate", at: { zone: "asz", row: 0 }, state: "ok", label: "as", detail: "hello" }, { id: "cast", kind: "gate", at: { zone: "castz", row: 0 }, state: "fail", label: "(int)o", detail: "throws", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — три оператора, три поведения, снятые на одном объекте. Дословно: «The <code>is</code> operator checks if the run-time type… is <b>compatible</b>» — возвращает <code>bool</code> (<code>o is int</code> → False), не бросает. «Use the <code>as</code> operator to explicitly convert… If the conversion isn\'t possible, the <code>as</code> operator returns <code>null</code>. Unlike a cast expression, the <code>as</code> operator <span class="hl">never throws</span>» (<code>o as string</code> → "hello"). А cast: «At run time, an explicit conversion might not succeed and a cast expression <b>might throw</b> an exception» — <code>(int)o</code> над строкой даёт <code>InvalidCastException</code>. Выбор оператора — это выбор поведения при несовпадении: тихий bool, тихий null или исключение.',
      sources: ["ms-cast"],
    },
    {
      id: "s2", num: "02", kicker: "is · что учитывает", title: "boxing/unboxing — да, numeric — нет",
      viewBox: "0 0 340 210", zones: ISCONV_ZONES,
      code: ["object iBoxed = 42;", "iBoxed is int    // True  — unboxing к точному типу", "iBoxed is long   // False — numeric-конверсию is НЕ делает", "if (o is string s) use(s);   // pattern matching"],
      predictAt: 1, predictQ: '<code>object iBoxed = 42</code>. Что дадут <code>iBoxed is int</code> и <code>iBoxed is long</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>iBoxed is int</code>: <span class="hl">unboxing</span> к точному типу int → <b>True</b>. is учитывает boxing/unboxing.', nodes: [{ id: "i", kind: "gate", at: { zone: "isconv", row: 0, col: 0 }, state: "ok", label: "is int", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>iBoxed is long</code>: int → long это <b>numeric</b>-конверсия, а её <code>is</code> <span class="hl">не делает</span> → <b>False</b>.', nodes: [{ id: "i", kind: "gate", at: { zone: "isconv", row: 0, col: 0 }, state: "ok", label: "is int", detail: "True" }, { id: "l", kind: "gate", at: { zone: "isconv", row: 0, col: 1 }, state: "fail", label: "is long", detail: "False", accent: true }], edges: [] },
        { codeLine: 3, out: "True False", caption: 'Панель: <b>True False</b>. И бонус — <code>is</code> умеет pattern matching: <code>o is string s</code> проверяет И присваивает (реальный прогон).', nodes: [{ id: "i", kind: "gate", at: { zone: "isconv", row: 0 }, state: "ok", label: "is int", detail: "True" }, { id: "l", kind: "gate", at: { zone: "isconv", row: 1 }, state: "fail", label: "is long", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Границы <code>is</code> точные. Дословно: «the <code>is</code> operator takes into account <b>boxing and unboxing conversions</b> but doesn\'t consider <span class="hl">numeric conversions</span>». Прогон: <code>(object)42 is int</code> → True (unbox к точному типу), <code>… is long</code> → False (int→long это numeric, <code>is</code> её не делает). Плюс: «The <code>is</code> operator <b>doesn\'t consider user-defined conversions</b>». А главный бонус — pattern matching: «The <code>is</code> operator also tests an expression result against a <b>pattern</b>» — <code>o is string s</code> проверяет тип И объявляет <code>s</code>, заменяя связку <code>as</code>+<code>!= null</code>.',
      sources: ["ms-cast"],
    },
    {
      id: "s3", num: "03", kicker: "as · null, а не исключение", title: "as при неудаче возвращает null (не бросает)",
      viewBox: "0 0 340 210", zones: AS_ZONES,
      code: ["object o = 42;", "string s = o as string;   // не string → null (не бросок!)", "if (s != null) use(s);     // проверяй на null", "// E as T  ≡  E is T ? (T)E : (T)null"],
      scenes: [
        { codeLine: 1, caption: '<code>o</code> — <code>int</code>, а просим <code>string</code>. Несовместимо → <code>as</code> возвращает <span class="hl">null</span>, а не бросает.', nodes: [{ id: "n", kind: "gate", at: { zone: "asfail", row: 0 }, state: "fail", label: "42 as string", detail: "null", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Проверяй результат на <code>null</code>: <code>as</code> не даст исключения, но и не гарантирует объект.', nodes: [{ id: "n", kind: "gate", at: { zone: "asfail", row: 0 }, state: "fail", label: "as → null" }, { id: "chk", kind: "chip", at: { zone: "asfail", row: 1 }, value: "if (s != null)", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>as</code> эквивалентен <code>E is T ? (T)E : (T)null</code>, но E вычисляется <b>один раз</b>. Только reference/nullable/boxing — <span class="hl">не user-defined</span>.', nodes: [{ id: "ok", kind: "gate", at: { zone: "asok", row: 0 }, state: "ok", label: "успех", detail: "объект" }, { id: "no", kind: "gate", at: { zone: "asfail", row: 0 }, state: "fail", label: "неудача", detail: "null", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «as бросает». Дословно: «If the conversion isn\'t possible, the <code>as</code> operator returns <code>null</code>. <span class="hl">Unlike a cast expression, the <code>as</code> operator never throws an exception</span>». Прогон: <code>42 as string</code> → <code>null</code> (не исключение). Формально <code>E as T</code> ≡ <code>E is T ? (T)E : (T)null</code>, но <code>E</code> вычисляется один раз. Ограничение: «The <code>as</code> operator considers only reference, nullable, boxing, and unboxing conversions. You <b>can\'t use</b> the <code>as</code> operator to perform a <b>user-defined conversion</b>». Поэтому после <code>as</code> обязательно проверяй на <code>null</code> — или используй <code>is T v</code>, который совмещает проверку и присваивание.',
      sources: ["ms-cast"],
    },
    {
      id: "s4", num: "04", kicker: "typeof · точно vs наследование", title: "typeof — точное имя типа, is — с наследованием",
      viewBox: "0 0 340 210", zones: TYPEOF_ZONES,
      code: ["class Animal {} class Dog : Animal {}", "object d = new Dog();", "d.GetType() == typeof(Dog)     // True  — точный тип", "d.GetType() == typeof(Animal)  // False — без наследования", "d is Animal                    // True  — is учитывает базовый"],
      predictAt: 2, predictQ: '<code>object d = new Dog()</code>. Что дадут <code>d.GetType()==typeof(Dog)</code>, <code>==typeof(Animal)</code>, <code>d is Animal</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>d.GetType() == typeof(Dog)</code> → <b>True</b>: <code>typeof</code> даёт <span class="hl">точное</span> совпадение по run-time типу.', nodes: [{ id: "t1", kind: "gate", at: { zone: "typeofz", row: 0 }, state: "ok", label: "== typeof(Dog)", detail: "True", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>== typeof(Animal)</code> → <b>False</b>: точный тип объекта — Dog, а не Animal. <code>typeof</code> <span class="hl">не учитывает</span> наследование.', nodes: [{ id: "t1", kind: "gate", at: { zone: "typeofz", row: 0 }, state: "ok", label: "typeof(Dog)", detail: "True" }, { id: "t2", kind: "gate", at: { zone: "typeofz", row: 1 }, state: "fail", label: "typeof(Animal)", detail: "False", accent: true }], edges: [] },
        { codeLine: 4, out: "True False True", caption: '<code>d is Animal</code> → <b>True</b>: <code>is</code> <span class="hl">учитывает наследование</span> (Dog derives Animal). Панель: True False True (реальный прогон).', nodes: [{ id: "t1", kind: "gate", at: { zone: "typeofz", row: 0 }, state: "ok", label: "typeof(Dog)", detail: "True" }, { id: "t2", kind: "gate", at: { zone: "typeofz", row: 1 }, state: "fail", label: "typeof(Animal)", detail: "False" }, { id: "is", kind: "gate", at: { zone: "isinh", row: 0 }, state: "ok", label: "is Animal", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Разница <code>typeof</code> и <code>is</code> — про наследование. «Use the <code>typeof</code> operator to check if the run-time type… <span class="hl">exactly matches</span> a given type». Прогон (пример прямо из доки): <code>d.GetType() == typeof(Dog)</code> → True, <code>== typeof(Animal)</code> → False, а <code>d is Animal</code> → True. Ключевое про аргумент: «The argument to the <code>typeof</code> operator must be the <b>name of a type</b>… An expression can\'t be an argument of the <code>typeof</code> operator. To get the <code>System.Type</code>… for the run-time type of an expression, use <code>Object.GetType</code>». Отсюда правило: <code>typeof</code> — для точного типа по имени, <code>GetType()</code> — для типа значения, <code>is</code> — для проверки «is-a» с учётом иерархии.',
      sources: ["ms-cast"],
    },
    {
      id: "s5", num: "05", kicker: "Только cast · user-defined", title: "Единственный путь для user-defined конверсий",
      viewBox: "0 0 340 210", zones: CAST_ZONES,
      code: ["// cast — единственный, кто делает user-defined конверсии", "MyType m = (MyType)other;   // зовёт operator MyType", "double x=1234.7; int a=(int)x;  // явная numeric — тоже cast", "// is/as/typeof перегрузить НЕЛЬЗЯ"],
      scenes: [
        { codeLine: 1, caption: '<b>Только cast</b> вызывает <span class="hl">user-defined</span> конверсии (<code>operator T</code>). <code>as</code> этого не умеет.', nodes: [{ id: "c", kind: "gate", at: { zone: "onlycast", row: 0 }, state: "ok", label: "(MyType)other", detail: "operator MyType", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Явные numeric-конверсии (<code>double</code>→<code>int</code>) — тоже cast: <code>(int)1234.7</code> → <b>1234</b>.', nodes: [{ id: "c", kind: "gate", at: { zone: "onlycast", row: 0 }, state: "ok", label: "user-defined", detail: "cast" }, { id: "num", kind: "gate", at: { zone: "onlycast", row: 1 }, state: "ok", label: "(int)1234.7", detail: "1234", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>is</code>/<code>as</code>/<code>typeof</code> <span class="hl">перегрузить нельзя</span>; cast — можно (через <code>operator</code>). Unbox null → NullReferenceException.', nodes: [{ id: "c", kind: "gate", at: { zone: "onlycast", row: 0 }, state: "ok", label: "cast · user-defined", detail: "можно" }, { id: "no", kind: "gate", at: { zone: "onlycast", row: 1 }, state: "fail", label: "is/as/typeof", detail: "нельзя перегрузить", accent: true }], edges: [] },
      ],
      explain: 'Cast — не просто «строже as», а единственный путь для user-defined конверсий. Из <code>as</code>: «You can\'t use the <code>as</code> operator to perform a user-defined conversion. To perform a user-defined conversion, <span class="hl">use a cast expression</span>». А перегрузка: «You <b>can\'t overload</b> the <code>is</code>, <code>as</code>, and <code>typeof</code> operators. A user-defined type… can define custom type conversions that a <b>cast expression performs</b>». Плюс cast делает явные numeric-конверсии (<code>(int)1234.7</code> → 1234), которые <code>is</code>/<code>as</code> игнорируют. И помни про unboxing (разбор boxing): unbox <code>null</code> → <code>NullReferenceException</code>, unbox в несовместимый тип → <code>InvalidCastException</code>. Выбор: нужна user-defined/numeric конверсия или строгая проверка с исключением — cast; безопасно — <code>is</code>/<code>as</code>.',
      sources: ["ms-cast", "ms-boxing"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>object o = "hello"; bool isInt = o is int; string asStr = o as string; string r; try { int n=(int)o; r=n.ToString(); } catch(InvalidCastException){ r="InvalidCastException"; } Console.WriteLine($"{isInt} {asStr} {r}");</code> — что напечатает?',
      options: ["False hello InvalidCastException", "False hello 0", "True hello InvalidCastException", "False null InvalidCastException"], correctIndex: 0, xp: 10,
      okText: '<code>is</code> → <b>False</b> (bool, не бросает). <code>as string</code> → <b>hello</b> (совпал; иначе null, не бросок). <code>(int)o</code> → <span class="hl">InvalidCastException</span> (только cast бросает).',
      noText: 'Три поведения: <code>is</code>=bool, <code>as</code>=null-или-объект, <code>(T)</code>=бросок. Реальный вывод: <b>False hello InvalidCastException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False hello InvalidCastException" }, sourceRefs: ["ms-cast"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>object iBoxed = 42; Console.WriteLine($"{iBoxed is int} {iBoxed is long}");</code> — что напечатает?',
      options: ["True False", "True True", "False False", "False True"], correctIndex: 0, xp: 10,
      okText: '<code>iBoxed is int</code> → <b>True</b> (unboxing к точному типу). <code>iBoxed is long</code> → <span class="hl">False</span>: int→long это numeric-конверсия, а её <code>is</code> НЕ делает.',
      noText: '«is takes into account boxing and unboxing conversions but doesn\'t consider numeric conversions». Реальный вывод: <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-cast"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Animal{} class Dog:Animal{} object d=new Dog(); Console.WriteLine($"{d.GetType()==typeof(Dog)} {d.GetType()==typeof(Animal)} {d is Animal}");</code> — что напечатает?',
      options: ["True False True", "True True True", "True False False", "False False True"], correctIndex: 0, xp: 10,
      okText: '<code>typeof</code> — <b>точный</b> тип: <code>==typeof(Dog)</code> True, <code>==typeof(Animal)</code> False (без наследования). <code>is Animal</code> → <span class="hl">True</span> (is учитывает базовый).',
      noText: '«typeof… exactly matches»; <code>is</code> учитывает наследование. Dog is-a Animal, но GetType()==Dog. Реальный вывод: <b>True False True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False True" }, sourceRefs: ["ms-cast"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Три поведения", v: '<code>is</code> → <b>bool</b>, не бросает. <code>as</code> → объект или <b>null</b>, <span class="hl">никогда не бросает</span>. <code>(T)cast</code> → может <b>бросить</b> InvalidCastException. Панель: False hello InvalidCastException.' },
    { icon: "cost", k: "Что учитывает is", v: '<code>is</code> — boxing/unboxing, наследование, интерфейсы; <b>НЕ</b> numeric (<code>iBoxed is long</code> → False) и <b>НЕ</b> user-defined. Умеет pattern matching (<code>o is T v</code>).' },
    { icon: "avoid", k: "typeof и cast", v: '<code>typeof</code> — <b>точное</b> совпадение по имени типа (не наследование); для значения — <code>GetType()</code>, для «is-a» — <code>is</code>. <span class="hl">Только cast</span> делает user-defined/numeric конверсии; <code>is</code>/<code>as</code>/<code>typeof</code> не перегружаются.' },
  ],

  foot: 'урок · <b>is / as / cast / typeof</b> · 5 анимир. разборов · панель трёх поведений · дизайн <b>mid</b>',
};
