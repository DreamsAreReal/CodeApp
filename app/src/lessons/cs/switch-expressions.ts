/**
 * Lesson: Switch expressions & exhaustiveness (CS.S5.switch-expressions) — expert density.
 * A `switch` expression evaluates one expression from a list of candidates by pattern
 * match. Its anatomy: an input expression, comma-separated ARMS, each with a pattern, an
 * optional CASE GUARD (`when`), the `=>` token, and a result expression; arms are evaluated
 * in TEXT ORDER and the FIRST matching arm (whose guard is true) wins. The senior payoff
 * a level below: a case guard — not just the pattern — decides which arm fires, and a
 * non-exhaustive switch is a runtime landmine (SwitchExpressionException).
 *
 * SIGNATURE machine panel (s5): the case-guard router — one `var (a, b)` pattern, three
 * `when` guards (a<b / a>b / else) route (1,2)/(5,2)/(3,3) to three different arms. REAL
 * run-csharp measurement (this file's exec cards, app backend :5080): a<b / a>b / equal.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn switch-expression page
 *     (fetch-verified 2026-07-21, ms.date 2026-03-20);
 *   - every card's verify.expect is REAL stdout from the run-csharp exec cards in this
 *     file (app backend :5080): "East" / "a<b\na>b\nequal" / "summer\nwinter".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.switch-expressions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: anatomy of one arm — pattern · guard · => · result.
const Z_ARM1: Zone = { id: "arm1", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "АНАТОМИЯ РУКАВА", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "pattern · when-guard · => · expression", subCls: "vz-zsub", subY: 47 };
const ANATOMY_ZONES: Zone[] = [Z_ARM1];

// s2: arms ladder evaluated in text order.
const Z_ORDER: Zone = { id: "order", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "РУКАВА · ПОРЯДОК ТЕКСТА", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "первый совпавший → результат", subCls: "vz-zsub", subY: 47 };
const ORDER_ZONES: Zone[] = [Z_ORDER];

// s3: input on the left, matched arm on the right (or/and ranges).
const Z_INP: Zone = { id: "inp", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВХОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "date.Month", subCls: "vz-zsub", subY: 47 };
const Z_HIT: Zone = { id: "hit", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "РУКАВ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "совпавший", subCls: "vz-zsub heap", subY: 47 };
const IN_HIT_ZONES: Zone[] = [Z_INP, Z_HIT];

// s4: exhaustiveness — with vs without discard.
const Z_NO: Zone = { id: "no", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕПОЛНЫЙ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "warning + throw", subCls: "vz-zsub heap", subY: 47 };
const Z_YES: Zone = { id: "yes", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОЛНЫЙ (discard)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "гарантия компилятора", subCls: "vz-zsub good", subY: 47 };
const EXH_ZONES: Zone[] = [Z_NO, Z_YES];

// s5 (SIGNATURE): case-guard router — one pattern, three guards, three routes.
const Z_PAT: Zone = { id: "pat", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "ОДИН ПАТТЕРН · var (a, b)", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_GUARDS: Zone = { id: "guards", x: 14, y: 130, w: 312, h: 100, cls: "vz-zone heap", label: "when-GUARD РЕШАЕТ РУКАВ", labelCls: "vz-zlabel heap sm", lx: 130, ly: 120 };
const GUARD_ZONES: Zone[] = [Z_PAT, Z_GUARDS];

export const switchExpressions: LessonData = {
  id: "CS.S5.switch-expressions",
  track: "CS",
  section: "CS.S5",
  module: "S5.3",
  lang: "csharp",
  title: "Switch expressions и exhaustiveness",
  kicker: "C# вглубь · S5 · рукава и полнота",
  home: { subtitle: "рукава, case guard when, порядок текста, полнота", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-switch-expr", kind: "doc", org: "Microsoft Learn", title: "switch expression (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression", date: "2026-03-20" },
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
  ],

  spec: [
    { text: "«Each switch expression arm contains a pattern, an optional case guard, the => token, and an expression.»", source: "ms-switch-expr" },
    { text: "«The result of a switch expression is the value of the expression of the first switch expression arm whose pattern matches the input expression and whose case guard, if present, evaluates to true. The switch expression arms are evaluated in text order.»", source: "ms-switch-expr" },
  ],
  edgeCases: [
    { text: "Case guard — «another condition that must be satisfied together with a matched pattern. A case guard <b>must be a Boolean expression</b>» после <code>when</code>.", source: "ms-switch-expr" },
    { text: "«The compiler generates an error when a lower switch expression arm can't be chosen because a higher switch expression arm <span class=\"hl\">matches all its values</span>» — недостижимый рукав ловится на компиляции.", source: "ms-switch-expr" },
    { text: "«List patterns don't generate a warning when all possible inputs aren't handled» — исключение из общего правила проверки полноты.", source: "ms-switch-expr" },
  ],

  misconceptions: [
    {
      wrong: "switch-выражение — это тот же switch-statement, только короче",
      hook: 'Это <span class="hl">выражение</span>, а не оператор: оно <b>возвращает значение</b>, а не выполняет ветки. Рукав — не <code>case</code>: «Each switch expression arm contains a <b>pattern</b>, an optional <b>case guard</b>, the <code>=&gt;</code> token, and an <b>expression</b>». Результат — «the value of the expression of the <span class="hl">first</span> switch expression arm whose pattern matches… and whose case guard, if present, evaluates to <code>true</code>», причём рукава «are evaluated in <b>text order</b>». А ниже абстракции живёт exhaustiveness: неполный switch — рантайм-мина. Дальше <b>пять разборов</b> — анатомия рукава, порядок текста, or/and-диапазоны, полнота и <b>машинная панель</b> when-guard.',
      source: "ms-switch-expr",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Анатомия рукава", title: "pattern · when-guard · => · expression",
      viewBox: "0 0 340 210", zones: ANATOMY_ZONES,
      code: ["direction switch {", "  Direction.Up => Orientation.North,", "  { X: var x } when x > 0 => Result,", "  _ => throw ... };"],
      scenes: [
        { codeLine: 1, caption: 'Рукав начинается с <b>паттерна</b> (тут constant <code>Direction.Up</code>) и <code>=&gt;</code>-токена.', nodes: [{ id: "p", kind: "chip", at: { zone: "arm1", row: 0 }, value: "pattern", accent: true }, { id: "arrow", kind: "chip", at: { zone: "arm1", row: 1 }, value: "=> expression" }], edges: [] },
        { codeLine: 2, caption: 'Между паттерном и <code>=&gt;</code> может стоять <span class="hl">case guard</span> — булево условие после <code>when</code>.', nodes: [{ id: "p", kind: "chip", at: { zone: "arm1", row: 0, col: 0 }, value: "pattern" }, { id: "w", kind: "chip", at: { zone: "arm1", row: 0, col: 1 }, value: "when guard", accent: true }, { id: "arrow", kind: "chip", at: { zone: "arm1", row: 1 }, value: "=> expression" }], edges: [] },
        { codeLine: 3, caption: 'Целое — <b>выражение</b>: возвращает значение. Рукава разделены запятыми, финальный <code>_</code> закрывает остаток.', nodes: [{ id: "p", kind: "chip", at: { zone: "arm1", row: 0, col: 0 }, value: "pattern" }, { id: "w", kind: "chip", at: { zone: "arm1", row: 0, col: 1 }, value: "when guard" }, { id: "arrow", kind: "chip", at: { zone: "arm1", row: 1 }, value: "=> result" }, { id: "ret", kind: "chip", at: { zone: "arm1", row: 2 }, value: "→ возвращает значение", accent: true }], edges: [] },
      ],
      explain: 'Switch-выражение — «Use the <code>switch</code> expression to evaluate a single expression from a list of candidate expressions. The evaluation is based on a <b>pattern match</b> with an input expression». Его строительный блок — рукав, а не <code>case</code>: «The switch expression arms, separated by commas. Each switch expression arm contains a <b>pattern</b>, an optional <b>case guard</b>, the <code>=&gt;</code> token, and an <b>expression</b>». Отличие от statement принципиальное: switch-выражение <span class="hl">возвращает значение</span>, поэтому его можно присвоить или вернуть из метода (как <code>=&gt;</code> тело).',
      sources: ["ms-switch-expr"],
    },
    {
      id: "s2", num: "02", kicker: "Порядок текста · первый матч", title: "Первый совпавший рукав в порядке текста",
      viewBox: "0 0 340 210", zones: ORDER_ZONES,
      code: ["Direction.Right switch {", "  Direction.Up => North,", "  Direction.Right => East,", "  Direction.Down => South, ... };"],
      predictAt: 1, predictQ: 'Что вернёт <code>ToOrientation(Direction.Right)</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Вход <code>Direction.Right</code>. Рукав <code>Up</code> проверяется <span class="hl">первым</span> (порядок текста) — мимо.', nodes: [{ id: "a1", kind: "gate", at: { zone: "order", row: 0 }, state: "fail", label: "Direction.Up", detail: "North — мимо" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Второй рукав <code>Direction.Right</code> — <span class="hl">матч</span>. Дальше рукава не проверяются.', nodes: [{ id: "a1", kind: "gate", at: { zone: "order", row: 0 }, state: "fail", label: "Direction.Up", detail: "мимо" }, { id: "a2", kind: "gate", at: { zone: "order", row: 1 }, state: "ok", label: "Direction.Right", detail: "East ← матч", }], edges: [] },
        { codeLine: 2, out: "East", caption: 'Результат — значение выражения совпавшего рукава: <b>East</b> (реальный прогон).', nodes: [{ id: "a2", kind: "gate", at: { zone: "order", row: 0 }, state: "ok", label: "Direction.Right", detail: "East" }, { id: "a3", kind: "gate", at: { zone: "order", row: 1 }, state: "", label: "Direction.Down", detail: "не дошли" }], edges: [] },
      ],
      explain: 'Правило выбора рукава — дословно: «The result of a switch expression is the value of the expression of the <b>first</b> switch expression arm whose pattern matches the input expression and whose case guard, if present, evaluates to <code>true</code>. The switch expression arms are evaluated in <span class="hl">text order</span>». Порядок — это семантика: верхний рукав может закрыть все входы нижнего. Компилятор это охраняет: «The compiler generates an <b>error</b> when a lower switch expression arm can\'t be chosen because a higher switch expression arm matches all its values». <code>ToOrientation(Direction.Right)</code> → <code>East</code>.',
      sources: ["ms-switch-expr"],
    },
    {
      id: "s3", num: "03", kicker: "or / and · диапазоны", title: "or и and комбинируют рукава по месяцу",
      viewBox: "0 0 340 210", zones: IN_HIT_ZONES,
      code: ["date.Month switch {", "  >= 3 and < 6 => \"spring\",", "  >= 6 and < 9 => \"summer\",", "  12 or (>= 1 and < 3) => \"winter\", ... };"],
      console: true,
      scenes: [
        { codeLine: 1, out: "summer", caption: '<code>Month = 7</code>: <code>&gt;= 6 and &lt; 9</code> — <b>conjunctive and</b> двух relational-паттернов. Матч → <b>summer</b> (реальный прогон).', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "Month", value: "7", accent: true }, { id: "g", kind: "gate", at: { zone: "hit", row: 0 }, state: "ok", label: ">=6 and <9", detail: "summer" }], edges: [{ id: "e", from: "in", to: "g", accent: true }] },
        { codeLine: 3, out: "summer\nwinter", caption: '<code>Month = 1</code>: <code>12 or (&gt;= 1 and &lt; 3)</code> — <b>disjunctive or</b>. Правая ветка истинна → <b>winter</b>.', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "Month", value: "1", accent: true }, { id: "g", kind: "gate", at: { zone: "hit", row: 0 }, state: "ok", label: "12 or (>=1 and <3)", detail: "winter" }], edges: [{ id: "e", from: "in", to: "g", accent: true }] },
        { codeLine: 3, out: "summer\nwinter", caption: '<code>or</code> матчит, когда <span class="hl">любой</span> из паттернов совпал; <code>and</code> — когда <b>оба</b>. Скобки задают порядок связывания явно.', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "Month", value: "1" }, { id: "g", kind: "gate", at: { zone: "hit", row: 0 }, state: "ok", label: "or/and", detail: "winter" }, { id: "note", kind: "chip", at: { zone: "hit", row: 1 }, value: "скобки = ясность", accent: true }], edges: [{ id: "e", from: "in", to: "g" }] },
      ],
      explain: 'Логические комбинаторы собирают диапазоны прямо в рукаве. Conjunctive: «<b>Conjunctive</b> <code>and</code> pattern that matches an expression when <span class="hl">both patterns match</span> the expression». Disjunctive: «<b>Disjunctive</b> <code>or</code> pattern that matches an expression when <span class="hl">either pattern matches</span> the expression». Отсюда <code>&gt;= 6 and &lt; 9</code> — диапазон лета, <code>12 or (&gt;= 1 and &lt; 3)</code> — зима через декабрь + янв/фев. Прогон: <code>summer</code>, <code>winter</code>. Скобки нужны для ясности связывания (детальнее — урок relational/logical).',
      sources: ["ms-patterns"],
    },
    {
      id: "s4", num: "04", kicker: "Exhaustiveness · гарантия и мина", title: "Полнота: warning на компиляции, throw в рантайме",
      viewBox: "0 0 340 210", zones: EXH_ZONES,
      code: ["// без _ на всех входах:", "//   compiler warning", "//   + SwitchExpressionException", "// с _ => ... : exhaustive"],
      scenes: [
        { codeLine: 0, caption: 'Неполный switch: компилятор <span class="hl">предупреждает</span>, что не все входы покрыты (кроме list-паттернов).', nodes: [{ id: "w", kind: "gate", at: { zone: "no", row: 0 }, state: "fail", label: "нет _", detail: "warning" }], edges: [] },
        { codeLine: 2, caption: 'На непокрытом входе рантайм <span class="hl">бросает</span> <code>SwitchExpressionException</code> — тихая мина в проде.', nodes: [{ id: "w", kind: "gate", at: { zone: "no", row: 0 }, state: "fail", label: "нет _", detail: "warning" }, { id: "t", kind: "chip", at: { zone: "no", row: 1 }, value: "throw в рантайме", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Discard <code>_</code>-рукав делает switch <b>exhaustive</b>: компилятор из полноты строит <span class="hl">гарантию</span>, throw невозможен.', nodes: [{ id: "w", kind: "gate", at: { zone: "no", row: 0 }, state: "fail", label: "нет _", detail: "мина" }, { id: "y", kind: "gate", at: { zone: "yes", row: 0 }, state: "ok", label: "_ => ...", detail: "покрыто всё" }], edges: [] },
      ],
      explain: 'Exhaustiveness — обещание, которое проверяет компилятор и охраняет рантайм: «If none of a <code>switch</code> expression\'s patterns matches an input value, the runtime <b>throws an exception</b>. In .NET Core 3.0 and later versions, the exception is a <code>System.Runtime.CompilerServices.SwitchExpressionException</code>. … In most cases, the compiler generates a <span class="hl">warning</span> if a switch expression doesn\'t handle all possible input values». Исключение: «List patterns don\'t generate a warning». Совет доки прямой: «To guarantee that a switch expression handles all possible input values, provide a switch expression arm with a <b>discard pattern</b>». <code>_</code> закрывает дыру.',
      sources: ["ms-switch-expr"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · when-guard решает", title: "Один паттерн var (a,b), три when-guard — три рукава",
      viewBox: "0 0 340 238", zones: GUARD_ZONES,
      code: ["(x, y) switch {", "  (0, 0) => \"origin\",", "  var (a, b) when a < b => \"a<b\",", "  var (a, b) when a > b => \"a>b\", _ => \"equal\" };"],
      predictAt: 1, predictQ: 'Куда уйдут <code>(1,2)</code>, <code>(5,2)</code>, <code>(3,3)</code>?',
      console: true,
      scenes: [
        { codeLine: 2, out: "a<b", caption: '<code>(1, 2)</code>: паттерн <code>var (a, b)</code> матчит всё, но <span class="hl">решает guard</span> <code>when a &lt; b</code> — истинно → <b>a&lt;b</b> (реальный прогон).', nodes: [{ id: "p", kind: "obj", at: { zone: "pat", row: 0 }, typeTag: "(1, 2)", value: "var (a,b)", accent: true }, { id: "g1", kind: "gate", at: { zone: "guards", row: 0 }, state: "ok", label: "when a < b", detail: "a<b" }], edges: [{ id: "e1", from: "p", to: "g1", accent: true }] },
        { codeLine: 3, out: "a<b\na>b", caption: '<code>(5, 2)</code>: тот же паттерн, но <code>a &lt; b</code> ложно → следующий рукав <code>when a &gt; b</code> истинно → <b>a&gt;b</b>.', nodes: [{ id: "p", kind: "obj", at: { zone: "pat", row: 0 }, typeTag: "(5, 2)", value: "var (a,b)", accent: true }, { id: "g2", kind: "gate", at: { zone: "guards", row: 0 }, state: "ok", label: "when a > b", detail: "a>b" }], edges: [{ id: "e2", from: "p", to: "g2", accent: true }] },
        { codeLine: 3, out: "a<b\na>b\nequal", caption: '<code>(3, 3)</code>: <code>a&lt;b</code> и <code>a&gt;b</code> оба ложны → <b>discard</b> <code>_</code> → <b>equal</b>. Guard, а не паттерн, развёл три входа.', nodes: [{ id: "p", kind: "obj", at: { zone: "pat", row: 0 }, typeTag: "(3, 3)", value: "var (a,b)" }, { id: "g3", kind: "gate", at: { zone: "guards", row: 0 }, state: "ok", label: "_ (guards ложны)", detail: "equal", accent: true }], edges: [{ id: "e3", from: "p", to: "g3", accent: true }] },
      ],
      explain: 'Это машинная панель урока — case guard как разветвитель, снятый прогоном. Дока: «A pattern might not be expressive enough to specify the condition… In such a case, use a <b>case guard</b>. A case guard is <span class="hl">another condition that must be satisfied together with a matched pattern</span>. A case guard must be a Boolean expression. Specify a case guard after the <code>when</code> keyword». Здесь три рукава несут <b>один и тот же</b> паттерн <code>var (a, b)</code>, а различает их только <code>when</code>: <code>(1,2)→a&lt;b</code>, <code>(5,2)→a&gt;b</code>, <code>(3,3)→equal</code>. Прогон подтверждает. Значит выбор рукава — это «pattern <b>И</b> guard», а не только паттерн.',
      sources: ["ms-switch-expr"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>enum Direction { Up, Down, Right, Left } enum Orientation { North, South, East, West }</code><br/><code>static Orientation ToOrientation(Direction d) => d switch { Direction.Up =&gt; Orientation.North, Direction.Right =&gt; Orientation.East, Direction.Down =&gt; Orientation.South, Direction.Left =&gt; Orientation.West, _ =&gt; throw new ArgumentOutOfRangeException() };</code><br/><code>Console.WriteLine(ToOrientation(Direction.Right));</code> — что напечатает?',
      options: ["East", "North", "Right", "South"], correctIndex: 0, xp: 10,
      okText: 'Рукава — по <b>порядку текста</b>, первый совпавший побеждает. <code>Direction.Right</code> ловит рукав <code>Direction.Right =&gt; Orientation.East</code>. Печать enum-значения: <b>East</b>.',
      noText: '<code>Direction.Up</code> мимо, <code>Direction.Right</code> — матч ⇒ результат <code>Orientation.East</code>. <code>Console.WriteLine</code> печатает имя члена enum: <b>East</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "East" }, sourceRefs: ["ms-switch-expr"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string T(int x, int y) => (x, y) switch { (0, 0) =&gt; "origin", var (a, b) when a &lt; b =&gt; "a&lt;b", var (a, b) when a &gt; b =&gt; "a&gt;b", _ =&gt; "equal" };</code><br/><code>Console.WriteLine(T(1, 2)); Console.WriteLine(T(5, 2)); Console.WriteLine(T(3, 3));</code> — три строки?',
      options: ["a<b\\na>b\\nequal", "a<b\\na>b\\norigin", "equal\\nequal\\nequal", "a>b\\na<b\\nequal"], correctIndex: 0, xp: 10,
      okText: 'Паттерн <code>var (a, b)</code> одинаков — различает <b>case guard</b> <code>when</code>. <code>(1,2)</code>: a&lt;b; <code>(5,2)</code>: a&gt;b; <code>(3,3)</code>: оба guard ложны → discard <code>_</code> → <b>equal</b>.',
      noText: 'Case guard — «another condition that must be satisfied together with a matched pattern». Три рукава с одним паттерном разводит <code>when</code>: <code>a&lt;b / a&gt;b / equal</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "a<b\na>b\nequal" }, sourceRefs: ["ms-switch-expr"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Season(int m) => m switch { &gt;= 3 and &lt; 6 =&gt; "spring", &gt;= 6 and &lt; 9 =&gt; "summer", &gt;= 9 and &lt; 12 =&gt; "autumn", 12 or (&gt;= 1 and &lt; 3) =&gt; "winter", _ =&gt; "?" };</code><br/><code>Console.WriteLine(Season(7)); Console.WriteLine(Season(1));</code> — обе строки?',
      options: ["summer\\nwinter", "summer\\nspring", "autumn\\nwinter", "summer\\n?"], correctIndex: 0, xp: 10,
      okText: '<code>7</code>: <code>&gt;= 6 and &lt; 9</code> (conjunctive <code>and</code>) → <b>summer</b>. <code>1</code>: <code>12 or (&gt;= 1 and &lt; 3)</code> (disjunctive <code>or</code>) — правая ветка истинна → <b>winter</b>.',
      noText: '<code>and</code> требует оба паттерна, <code>or</code> — любой. <code>7</code> в диапазоне лета, <code>1</code> — в <code>&gt;= 1 and &lt; 3</code> внутри <code>or</code>. Итог: <code>summer / winter</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "summer\nwinter" }, sourceRefs: ["ms-patterns"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Это выражение", v: 'Switch-выражение <b>возвращает значение</b>. Рукав = pattern · optional <code>when</code>-guard · <code>=&gt;</code> · expression. Результат — <span class="hl">первый совпавший</span> рукав в порядке текста.' },
    { icon: "cost", k: "Guard решает", v: 'Case guard <code>when</code> — булево условие поверх паттерна; выбор рукава — это <b>pattern И guard</b>. Один паттерн + разные <code>when</code> = разные рукава.' },
    { icon: "avoid", k: "Exhaustiveness", v: 'Неполный switch → warning на компиляции + <b>SwitchExpressionException</b> в рантайме (кроме list-паттернов). Discard <code>_</code> делает его exhaustive и снимает мину.' },
  ],

  foot: 'урок · <b>switch expressions</b> · 5 анимир. разборов · панель when-guard (a&lt;b / a&gt;b / equal) · дизайн <b>mid</b>',
};
