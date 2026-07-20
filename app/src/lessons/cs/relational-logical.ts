/**
 * Lesson: Relational & logical patterns (CS.S5.relational-logical) — expert density.
 * A relational pattern compares an expression result with a CONSTANT using `< > <= >=`;
 * the `not`/`and`/`or` combinators build logical patterns and are RECURSIVE. The senior
 * payoff a level below: the combinators have a FIXED binding order — `not` binds first,
 * then `and`, then `or` — so `not >= 'a' and <= 'z'` parses as `((not >= 'a') and <= 'z')`
 * and quietly means the wrong thing.
 *
 * SIGNATURE machine panel (s5): the precedence trap — for input '{' (just past 'z'),
 * the un-parenthesized `not >= 'a' and <= 'z'` returns False while the intended
 * `not (>= 'a' and <= 'z')` returns True. REAL run-csharp measurement (:5102): False / True.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn patterns reference page
 *     (fetch-verified 2026-07-21, ms.date 2026-06-05);
 *   - every card's verify.expect is REAL stdout from the backend run-csharp endpoint
 *     (:5102): "High\nToo low\nAcceptable" / "True\nFalse" / "False\nTrue".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.relational-logical/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: relational operators compare against a constant.
const Z_VAL: Zone = { id: "val", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ЗНАЧЕНИЕ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "measurement", subCls: "vz-zsub", subY: 47 };
const Z_CONST: Zone = { id: "constz", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "КОНСТАНТА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "< > <= >=", subCls: "vz-zsub heap", subY: 47 };
const REL_ZONES: Zone[] = [Z_VAL, Z_CONST];

// s2: and — conjunctive range.
const Z_RANGE: Zone = { id: "range", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "and · ОБА ПАТТЕРНА", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "диапазон = нижняя and верхняя граница", subCls: "vz-zsub", subY: 47 };
const RANGE_ZONES: Zone[] = [Z_RANGE];

// s3: or / not — disjunction and negation.
const Z_OR: Zone = { id: "orz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "or · ЛЮБОЙ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "хотя бы один матч", subCls: "vz-zsub", subY: 47 };
const Z_NOT: Zone = { id: "notz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "not · ОТРИЦАНИЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "негируемый не совпал", subCls: "vz-zsub heap", subY: 47 };
const ORNOT_ZONES: Zone[] = [Z_OR, Z_NOT];

// s4: binding order not -> and -> or. Three stacked gate rows need ~188u of content, so
// the zone is 216u tall (inner 200) and the viewBox grows to 260 to fit — the engine
// rejects any tighter frame (viz-fit AUTHORING-PROOF: rows must fit the inner height).
const Z_BIND: Zone = { id: "bindz", x: 14, y: 34, w: 312, h: 216, cls: "vz-zone", label: "ПОРЯДОК СВЯЗЫВАНИЯ", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "not → and → or", subCls: "vz-zsub", subY: 47 };
const BIND_ORDER_ZONES: Zone[] = [Z_BIND];

// s5 (SIGNATURE): the precedence trap — buggy vs parenthesized for input '{'.
const Z_BUG: Zone = { id: "bug", x: 14, y: 34, w: 150, h: 180, cls: "vz-zone heap", label: "БЕЗ СКОБОК", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "(not >='a') and <='z'", subCls: "vz-zsub heap", subY: 47 };
const Z_FIX: Zone = { id: "fix", x: 176, y: 34, w: 150, h: 180, cls: "vz-zone good", label: "СО СКОБКАМИ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "not (>='a' and <='z')", subCls: "vz-zsub good", subY: 47 };
const TRAP_ZONES: Zone[] = [Z_BUG, Z_FIX];

export const relationalLogical: LessonData = {
  id: "CS.S5.relational-logical",
  track: "CS",
  section: "CS.S5",
  module: "S5.5",
  lang: "csharp",
  title: "Relational и logical patterns",
  kicker: "C# вглубь · S5 · диапазоны и комбинаторы",
  home: { subtitle: "< > <= >=, not/and/or, precedence, скобки", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
  ],

  spec: [
    { text: "«Use a relational pattern to compare an expression result with a constant, as the following example shows:»", source: "ms-patterns" },
    { text: "«The pattern combinators check expressions in this order, based on the binding order of expressions:» (not, and, or)", source: "ms-patterns" },
  ],
  edgeCases: [
    { text: "Правая часть relational-паттерна — <b>константа</b> целого/floating/char/enum-типа. С <code>null</code> или неудачной конверсией relational-паттерн <span class=\"hl\">не матчит</span>.", source: "ms-patterns" },
    { text: "Диапазон — conjunctive <code>and</code>: <code>&gt;= 3 and &lt; 6</code>. Открытый список значений — <code>or</code>: <code>3 or 4 or 5</code>.", source: "ms-patterns" },
    { text: "Порядок компилятора среди паттернов одного binding order <b>не определён</b>: «The order in which the compiler checks patterns that have the same binding order is undefined».", source: "ms-patterns" },
  ],

  misconceptions: [
    {
      wrong: "not/and/or в паттернах связываются как обычные && / ||, слева направо",
      hook: 'У комбинаторов <span class="hl">фиксированный порядок связывания</span>, и он не «слева направо»: «The pattern combinators check expressions in this order… <b>not</b>, <b>and</b>, <b>or</b>». <code>not</code> цепляется к операнду первым, <code>and</code> — после <code>not</code>, <code>or</code> — последним. Поэтому <code>c is not &gt;= \'a\' and &lt;= \'z\'</code> означает <span class="wrong">((not &gt;= \'a\') and &lt;= \'z\')</span> — не то, что задумано. Ниже абстракции это <b>тихий баг</b>: на входе <code>\'{\'</code> версия без скобок даёт <code>False</code>, а со скобками — <code>True</code> (реальный прогон). Дальше <b>пять разборов</b> — relational, and-диапазон, or/not, порядок связывания и <b>машинная панель</b> ловушки скобок.',
      source: "ms-patterns",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Relational · сравнение с константой", title: "< > <= >= сравнивают с константой",
      viewBox: "0 0 340 210", zones: REL_ZONES,
      code: ["measurement switch {", "  < -40.0 => \"Too low\",", "  >= 20.0 => \"Too high\",", "  double.NaN => \"Unknown\", ... };"],
      scenes: [
        { codeLine: 1, caption: 'Relational pattern <code>&lt; -40.0</code>: сравнивает значение с <span class="hl">константой</span> <code>-40.0</code> оператором <code>&lt;</code>.', nodes: [{ id: "v", kind: "slot", at: { zone: "val", row: 0 }, name: "m", value: "-100", accent: true }, { id: "c", kind: "gate", at: { zone: "constz", row: 0 }, state: "ok", label: "< -40.0", detail: "Too low" }], edges: [{ id: "e", from: "v", to: "c", accent: true }] },
        { codeLine: 2, caption: 'Правая часть <b>обязана</b> быть константой: integer, floating, <code>char</code> или enum. Переменную туда нельзя.', nodes: [{ id: "v", kind: "slot", at: { zone: "val", row: 0 }, name: "m", value: "-100" }, { id: "c", kind: "gate", at: { zone: "constz", row: 0 }, state: "ok", label: ">= 20.0", detail: "константа справа", accent: true }], edges: [{ id: "e", from: "v", to: "c" }] },
        { codeLine: 3, caption: 'С <code>null</code> или неудачной конверсией relational-паттерн <span class="hl">не матчит</span> — потому <code>NaN</code> ловят явным <code>double.NaN</code>.', nodes: [{ id: "v", kind: "slot", at: { zone: "val", row: 0 }, name: "m", value: "NaN" }, { id: "c", kind: "gate", at: { zone: "constz", row: 0 }, state: "fail", label: "все < >", detail: "NaN мимо", accent: true }], edges: [{ id: "e", from: "v", to: "c" }] },
      ],
      explain: 'Relational pattern — сравнение с константой на языке паттернов: «Use a relational pattern to <b>compare an expression result with a constant</b>… In a relational pattern, use any of the relational operators <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, or <code>&gt;=</code>. The right-hand part of a relational pattern must be a <b>constant expression</b>. The constant expression can be of an integer, floating-point, char, or enum type». Ограничение на null/конверсию: «If an expression result is <code>null</code> or fails to convert… a relational pattern <span class="hl">doesn\'t match</span>». Отсюда классическая ловушка <code>NaN</code> — ни одно <code>&lt;/&gt;</code> его не поймает.',
      sources: ["ms-patterns"],
    },
    {
      id: "s2", num: "02", kicker: "and · диапазон", title: "Conjunctive and: диапазон из двух границ",
      viewBox: "0 0 340 210", zones: RANGE_ZONES,
      code: ["date.Month switch {", "  >= 3 and < 6 => \"spring\",", "  >= 6 and < 9 => \"summer\", ... };"],
      predictAt: 1, predictQ: 'Что даст <code>Classify(13)</code> при рукаве <code>&gt;= 10.0 and &lt; 20.0</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Диапазон — это <b>conjunctive and</b> двух relational-паттернов: нижняя <span class="hl">и</span> верхняя граница.', nodes: [{ id: "lo", kind: "gate", at: { zone: "range", row: 0, col: 0 }, state: "ok", label: ">= 3", detail: "нижняя" }, { id: "hi", kind: "gate", at: { zone: "range", row: 0, col: 1 }, state: "ok", label: "< 6", detail: "верхняя", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>and</code> матчит, только когда <span class="hl">оба</span> паттерна совпали. Одна граница мимо — весь рукав мимо.', nodes: [{ id: "lo", kind: "gate", at: { zone: "range", row: 0, col: 0 }, state: "ok", label: ">= 3", detail: "✓" }, { id: "and", kind: "chip", at: { zone: "range", row: 1 }, value: "and → оба", accent: true }, { id: "hi", kind: "gate", at: { zone: "range", row: 0, col: 1 }, state: "ok", label: "< 6", detail: "✓" }], edges: [] },
        { codeLine: 1, out: "High", caption: 'Для <code>Classify(13)</code> рукав <code>&gt;= 10.0 and &lt; 20.0</code> истинен → <b>High</b> (реальный прогон).', nodes: [{ id: "lo", kind: "gate", at: { zone: "range", row: 0, col: 0 }, state: "ok", label: ">= 10.0", detail: "13 ✓" }, { id: "hi", kind: "gate", at: { zone: "range", row: 0, col: 1 }, state: "ok", label: "< 20.0", detail: "13 ✓" }, { id: "r", kind: "chip", at: { zone: "range", row: 1 }, value: "→ High", accent: true }], edges: [] },
      ],
      explain: 'Диапазон в паттернах собирается через conjunctive <code>and</code>: «To check if an expression result is in a certain range, match it against a <b>conjunctive <code>and</code> pattern</b>». Дословно про сам комбинатор: «<b>Conjunctive</b> <code>and</code> pattern that matches an expression when <span class="hl">both patterns match</span> the expression». Так <code>&gt;= 10.0 and &lt; 20.0</code> — это полуинтервал [10, 20); <code>Classify(13)</code> в него попадает → <code>High</code>. <code>and</code> здесь — не булев оператор над bool, а комбинатор над <b>паттернами</b>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s3", num: "03", kicker: "or / not · дизъюнкция и негация", title: "or — любой из; not — когда не совпал",
      viewBox: "0 0 340 210", zones: ORNOT_ZONES,
      code: ["3 or 4 or 5 => \"spring\",", "input is not null", "input is not (float or double)"],
      scenes: [
        { codeLine: 0, caption: '<b>Disjunctive or</b>: <code>3 or 4 or 5</code> — матч, если <span class="hl">любой</span> из паттернов совпал. Открытый список значений.', nodes: [{ id: "o1", kind: "chip", at: { zone: "orz", row: 0 }, value: "3 or 4 or 5" }, { id: "o2", kind: "chip", at: { zone: "orz", row: 1 }, value: "→ любой матч", accent: true }], edges: [] },
        { codeLine: 1, caption: '<b>Negation not</b>: <code>is not null</code> — матч, когда негируемый паттерн <span class="hl">НЕ совпал</span>.', nodes: [{ id: "o1", kind: "chip", at: { zone: "orz", row: 0 }, value: "3 or 4 or 5" }, { id: "n1", kind: "gate", at: { zone: "notz", row: 0 }, state: "ok", label: "not null", detail: "не-null", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Комбинаторы применяются <b>повторно</b>: <code>not (float or double)</code> — «не float и не double». Скобки задают группировку.', nodes: [{ id: "o1", kind: "chip", at: { zone: "orz", row: 0 }, value: "float or double" }, { id: "n1", kind: "gate", at: { zone: "notz", row: 0 }, state: "ok", label: "not (…)", detail: "ни один", accent: true }], edges: [] },
      ],
      explain: 'Два оставшихся комбинатора. Disjunctive: «<b>Disjunctive</b> <code>or</code> pattern that matches an expression when <span class="hl">either pattern matches</span> the expression». Negation: «<b>Negation</b> <code>not</code> pattern that matches an expression when the negated pattern <span class="hl">doesn\'t match</span> the expression». Их можно применять сколько нужно: «you can use the pattern combinators <b>repeatedly</b> in a pattern». Скобки — для группировки: <code>not (float or double)</code> отрицает объединение. Но у комбинаторов есть неочевидный порядок связывания — следующий разбор.',
      sources: ["ms-patterns"],
    },
    {
      id: "s4", num: "04", kicker: "Порядок связывания", title: "not связывается первым, потом and, потом or",
      viewBox: "0 0 340 260", zones: BIND_ORDER_ZONES,
      code: ["// связывание, НЕ слева-направо:", "not   // цепляется к операнду первым", "and   // после всех not", "or    // после всех not и and"],
      scenes: [
        { codeLine: 1, caption: '<code>not</code> «binds to its operand <span class="hl">first</span>» — прежде всех прочих комбинаторов.', nodes: [{ id: "n", kind: "gate", at: { zone: "bindz", row: 0 }, state: "ok", label: "1. not", detail: "к операнду", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>and</code> связывается <b>после</b> любого <code>not</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "bindz", row: 0 }, state: "ok", label: "1. not", detail: "" }, { id: "a", kind: "gate", at: { zone: "bindz", row: 1 }, state: "ok", label: "2. and", detail: "после not", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>or</code> связывается <b>последним</b> — после всех <code>not</code> и <code>and</code>. Итог: <code>not → and → or</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "bindz", row: 0 }, state: "ok", label: "1. not", detail: "" }, { id: "a", kind: "gate", at: { zone: "bindz", row: 1 }, state: "ok", label: "2. and", detail: "" }, { id: "o", kind: "gate", at: { zone: "bindz", row: 2 }, state: "ok", label: "3. or", detail: "последним", accent: true }], edges: [] },
      ],
      explain: 'Порядок связывания комбинаторов — фиксированный и не «слева направо»: «The pattern combinators check expressions in this order, based on the binding order of expressions: <b>not</b>, <b>and</b>, <b>or</b>. The <code>not</code> pattern binds to its operand <span class="hl">first</span>. The <code>and</code> pattern binds <b>after</b> any <code>not</code> pattern expression binding. The <code>or</code> pattern binds <b>after all</b> <code>not</code> and <code>and</code> patterns bind to operands». Есть и оговорка про равный порядок: «The order in which the compiler checks patterns that have the same binding order is <b>undefined</b>». Именно из этого правила растёт ловушка следующего разбора.',
      sources: ["ms-patterns"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · ловушка скобок", title: "not >= 'a' and <= 'z' значит не то — прогон на '{'",
      viewBox: "0 0 340 240", zones: TRAP_ZONES,
      code: ["bool Wrong(char c) => c is not >= 'a' and <= 'z';", "bool Right(char c) => c is not (>= 'a' and <= 'z');", "Wrong('{');  // '{' идёт сразу за 'z'", "Right('{');"],
      predictAt: 2, predictQ: 'Что вернут <code>Wrong(\'{\')</code> и <code>Right(\'{\')</code>?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Без скобок <code>not</code> связывается первым → парсится как <span class="wrong">(not &gt;= \'a\') and &lt;= \'z\'</span>. Это «не буква <b>и</b> ≤ z».', nodes: [{ id: "b1", kind: "gate", at: { zone: "bug", row: 0 }, state: "fail", label: "(not >='a')", detail: "and <='z'" }], edges: [] },
        { codeLine: 2, out: "False", caption: '<code>Wrong(\'{\')</code>: <code>\'{\' &gt;= \'a\'</code> истинно → <code>not(true)=false</code> → весь <code>and</code> = <b>False</b> (реальный прогон). Символ прошёл как «буква», хотя это не буква.', nodes: [{ id: "b1", kind: "gate", at: { zone: "bug", row: 0 }, state: "fail", label: "Wrong('{')", detail: "→ False", accent: true }], edges: [] },
        { codeLine: 3, out: "False\nTrue", caption: 'Со скобками <code>not (&gt;= \'a\' and &lt;= \'z\')</code> — «не в [a,z]». <code>Right(\'{\')</code> = <span class="hl">True</span>: <code>\'{\'</code> вне диапазона. Скобки исправили смысл.', nodes: [{ id: "b1", kind: "gate", at: { zone: "bug", row: 0 }, state: "fail", label: "Wrong('{')", detail: "False" }, { id: "f1", kind: "gate", at: { zone: "fix", row: 0 }, state: "ok", label: "Right('{')", detail: "→ True", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — ловушка приоритета, снятая прогоном. Дока приводит именно этот баг: «The following example tries to match all characters that aren\'t lowercase letters… It has an <b>error</b>, because the <code>not</code> pattern binds before the <code>and</code> pattern» — <code>c is not &gt;= \'a\' and &lt;= \'z\'</code> «is parsed as… <code>c is ((not &gt;= \'a\') and &lt;= \'z\')</code>». Починка — скобки: «To fix the error, specify that you want the <code>not</code> pattern to bind to the <code>&gt;= \'a\' and &lt;= \'z\'</code> expression» → <code>c is not (&gt;= \'a\' and &lt;= \'z\')</code>. Прогон на <code>\'{\'</code> (сразу за <code>\'z\'</code>) обнажает разницу: <code>Wrong=False</code>, <code>Right=True</code>. Мораль доки: «use parentheses to <span class="hl">clarify your patterns</span>».',
      sources: ["ms-patterns"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Classify(double m) => m switch { &lt; -40.0 =&gt; "Too low", &gt;= -40.0 and &lt; 0 =&gt; "Low", &gt;= 0 and &lt; 10.0 =&gt; "Acceptable", &gt;= 10.0 and &lt; 20.0 =&gt; "High", &gt;= 20.0 =&gt; "Too high", double.NaN =&gt; "Unknown" };</code><br/><code>Console.WriteLine(Classify(13)); Console.WriteLine(Classify(-100)); Console.WriteLine(Classify(5.7));</code> — три строки?',
      options: ["High\\nToo low\\nAcceptable", "High\\nLow\\nAcceptable", "Too high\\nToo low\\nLow", "High\\nToo low\\nLow"], correctIndex: 0, xp: 10,
      okText: 'Каждый диапазон — <b>conjunctive and</b> двух границ. <code>13</code> ∈ [10,20) → <b>High</b>; <code>-100</code> &lt; -40 → <b>Too low</b>; <code>5.7</code> ∈ [0,10) → <b>Acceptable</b>.',
      noText: '<code>and</code> требует обе границы. <code>13</code>: <code>&gt;=10 and &lt;20</code> → High. <code>-100</code>: <code>&lt; -40.0</code> → Too low. <code>5.7</code>: <code>&gt;=0 and &lt;10</code> → Acceptable.',
      verify: { kind: "exec", run: "dotnet run", expect: "High\nToo low\nAcceptable" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static bool IsLetter(char c) => c is (&gt;= \'a\' and &lt;= \'z\') or (&gt;= \'A\' and &lt;= \'Z\');</code><br/><code>Console.WriteLine(IsLetter(\'Q\')); Console.WriteLine(IsLetter(\'7\'));</code> — обе строки?',
      options: ["True\\nFalse", "False\\nTrue", "True\\nTrue", "False\\nFalse"], correctIndex: 0, xp: 10,
      okText: 'Два диапазона (<code>and</code>) объединены <code>or</code>. <code>\'Q\'</code> ∈ [A,Z] → правая ветка истинна → <b>True</b>. <code>\'7\'</code> вне обоих диапазонов → <b>False</b>.',
      noText: 'Скобки группируют каждый диапазон, <code>or</code> — «любой из». <code>\'Q\'</code> — заглавная буква → True; <code>\'7\'</code> — цифра, вне [a,z] и [A,Z] → False.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nFalse" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static bool Wrong(char c) => c is not &gt;= \'a\' and &lt;= \'z\'; static bool Right(char c) => c is not (&gt;= \'a\' and &lt;= \'z\');</code><br/><code>Console.WriteLine(Wrong(\'{\')); Console.WriteLine(Right(\'{\'));</code> (<code>\'{\'</code> идёт сразу за <code>\'z\'</code>) — обе строки?',
      options: ["False\\nTrue", "True\\nFalse", "True\\nTrue", "False\\nFalse"], correctIndex: 0, xp: 10,
      okText: 'Приоритет <code>not → and → or</code>: без скобок парсится как <code>(not &gt;=\'a\') and &lt;=\'z\'</code>. Для <code>\'{\'</code> (≥\'a\') это <code>false and …</code> → <b>False</b>. Со скобками — «не в [a,z]» → <b>True</b>.',
      noText: '<code>not</code> связывается первым, поэтому <code>Wrong</code> означает не то. На <code>\'{\'</code> (сразу за <code>\'z\'</code>): <code>Wrong=False</code> (считает буквой), <code>Right=True</code> (правильно — вне диапазона).',
      verify: { kind: "exec", run: "dotnet run", expect: "False\nTrue" }, sourceRefs: ["ms-patterns"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Relational + диапазон", v: 'Relational pattern <code>&lt; &gt; &lt;= &gt;=</code> сравнивает с <b>константой</b>. Диапазон — <span class="hl">conjunctive and</span> двух границ (<code>&gt;=10 and &lt;20</code>); открытый список — <code>or</code>.' },
    { icon: "cost", k: "Порядок связывания", v: 'Комбинаторы связываются <b>not → and → or</b>, не слева-направо. <code>not</code> цепляется к операнду первым, <code>or</code> — последним.' },
    { icon: "avoid", k: "Ловушка скобок", v: '<code>not &gt;=\'a\' and &lt;=\'z\'</code> = <span class="wrong">(not &gt;=\'a\') and &lt;=\'z\'</span> — тихий баг. Нужно <code>not (&gt;=\'a\' and &lt;=\'z\')</code>. На <code>\'{\'</code>: <code>False</code> vs <code>True</code>. Ставь скобки.' },
  ],

  foot: 'урок · <b>relational и logical patterns</b> · 5 анимир. разборов · панель ловушки приоритета (False / True на \'{\') · дизайн <b>mid</b>',
};
