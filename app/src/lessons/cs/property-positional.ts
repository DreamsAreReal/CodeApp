/**
 * Lesson: Property & positional patterns, Deconstruct (CS.S5.property-positional) — expert
 * density. A property pattern matches an object's PROPERTIES/FIELDS against nested patterns
 * ({ Items: > 10, Cost: > 1000m }); a positional pattern DECONSTRUCTS the value and matches
 * the results by POSITION ((0, 0)). Both are recursive. The senior payoff a level below: the
 * positional pattern is a real Deconstruct method CALL, and member order in the pattern must
 * match the Deconstruct parameter order — the compiler emits that call.
 *
 * SIGNATURE machine panel (s5): the Deconstruct call — a readonly struct Point with
 * Deconstruct(out x, out y) feeds (0,0)/(1,0)/(3,4) into positional arms by position. REAL
 * run-csharp measurement (this file's exec cards, app backend :5080): Origin / positive X
 * basis end / Just a point.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn patterns + deconstruct pages
 *     (fetch-verified 2026-07-21);
 *   - every card's verify.expect is REAL stdout from the backend run-csharp endpoint
 *     (this file's exec cards, app backend :5080): "0.10\n0.05\n0.02" / "Origin\npositive X
 *     basis end\nJust a point" / "True\nFalse".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.property-positional/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: property pattern — object's properties matched against nested patterns.
const Z_OBJ: Zone = { id: "objz", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ОБЪЕКТ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "Order { Items, Cost }", subCls: "vz-zsub", subY: 47 };
const Z_PROPS: Zone = { id: "props", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "СВОЙСТВА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "вложенные паттерны", subCls: "vz-zsub heap", subY: 47 };
const PROP_ZONES: Zone[] = [Z_OBJ, Z_PROPS];

// s2: empty property pattern { } matches any non-null.
const Z_IN2: Zone = { id: "in2", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВХОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "возможно null", subCls: "vz-zsub", subY: 47 };
const Z_EMPTY: Zone = { id: "empty", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "is { }", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "любой non-null", subCls: "vz-zsub heap", subY: 47 };
const EMPTY_ZONES: Zone[] = [Z_IN2, Z_EMPTY];

// s3: extended property pattern — nested member path.
const Z_SEG: Zone = { id: "seg", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "Segment", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "Start / End : Point", subCls: "vz-zsub", subY: 47 };
const Z_PATH: Zone = { id: "path", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "{ Start.Y: 0 }", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "вложенный путь", subCls: "vz-zsub heap", subY: 47 };
const PATH_ZONES: Zone[] = [Z_SEG, Z_PATH];

// s4: tuple positional pattern — multiple inputs.
const Z_TUP: Zone = { id: "tup", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "КОРТЕЖ (groupSize, dayOfWeek)", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "один positional-паттерн — несколько входов", subCls: "vz-zsub", subY: 47 };
const TUP_ZONES: Zone[] = [Z_TUP];

// s5 (SIGNATURE): positional pattern -> Deconstruct call, by position.
const Z_DEC: Zone = { id: "dec", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "Point.Deconstruct(out x, out y)", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_POS: Zone = { id: "pos", x: 14, y: 130, w: 312, h: 100, cls: "vz-zone heap", label: "positional-РУКАВ · ПО ПОЗИЦИИ (x, y)", labelCls: "vz-zlabel heap sm", lx: 130, ly: 120 };
const POS_ZONES: Zone[] = [Z_DEC, Z_POS];

export const propertyPositional: LessonData = {
  id: "CS.S5.property-positional",
  track: "CS",
  section: "CS.S5",
  module: "S5.6",
  lang: "csharp",
  title: "Property и positional patterns, Deconstruct",
  kicker: "C# вглубь · S5 · паттерны по форме",
  home: { subtitle: "property {}, positional (), Deconstruct, extended", icon: "types", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
    { id: "ms-deconstruct", kind: "doc", org: "Microsoft Learn", title: "Deconstructing tuples and other types (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/deconstruct", date: "2024-11-22" },
  ],

  spec: [
    { text: "«Use a property pattern to match an expression's properties or fields against nested patterns, as the following example shows:» <span class=\"ru-tr\">«Используйте property-паттерн, чтобы сопоставить свойства или поля выражения с вложенными паттернами, как показано в следующем примере:»</span>", source: "ms-patterns" },
    { text: "«The order of members in a positional pattern must match the order of parameters in the Deconstruct method. The code generated for the positional pattern calls the Deconstruct method.» <span class=\"ru-tr\">«Порядок членов в positional-паттерне должен совпадать с порядком параметров в методе <code>Deconstruct</code>. Код, сгенерированный для positional-паттерна, вызывает метод <code>Deconstruct</code>.»</span>", source: "ms-patterns" },
  ],
  edgeCases: [
    { text: "Пустой property pattern <code>is { }</code> — «matches everything <b>non-null</b>» <span class=\"ru-tr\">«сопоставляется со всем <b>не-null</b>»</span>, и его можно использовать вместо <code>is not null</code> для создания переменной: <code>x is { } notNull</code>.", source: "ms-patterns" },
    { text: "Extended property pattern — вложенный путь: <code>{ Start.Y: 0 }</code> эквивалентно <code>{ Start: { Y: 0 } }</code>.", source: "ms-patterns" },
    { text: "Records с позиционными параметрами <b>неявно</b> дают <code>Deconstruct</code>: «the compiler creates a <code>Deconstruct</code> method with an <code>out</code> parameter for each positional parameter» <span class=\"ru-tr\">«компилятор создаёт метод <code>Deconstruct</code> с <code>out</code>-параметром для каждого позиционного параметра»</span>.", source: "ms-deconstruct" },
  ],

  misconceptions: [
    {
      wrong: "property pattern { X: 0 } и positional (0, 0) — просто два синтаксиса одного и того же",
      hook: 'Разница <span class="hl">механическая</span>, а не косметическая. Property pattern читает свойства/поля <b>по имени</b>: «Use a property pattern to match an expression\'s properties or fields against <b>nested patterns</b>» <span class="ru-tr">«Используйте property-паттерн, чтобы сопоставить свойства или поля выражения с <b>вложенными паттернами</b>»</span>. Positional pattern — <b>деконструирует</b> значение и матчит <b>по позиции</b>, и это реальный вызов метода: «The code generated for the positional pattern <b>calls the <code>Deconstruct</code> method</b>» <span class="ru-tr">«Код, сгенерированный для positional-паттерна, <b>вызывает метод <code>Deconstruct</code></b>»</span>. Ниже абстракции — жёсткое правило: «The order of members in a positional pattern <span class="hl">must match the order of parameters in the <code>Deconstruct</code> method</span>» <span class="ru-tr">«Порядок членов в positional-паттерне должен совпадать с порядком параметров в методе <code>Deconstruct</code>»</span>. Дальше <b>пять разборов</b> — property, пустой <code>{ }</code>, extended-путь, tuple-positional и <b>машинная панель</b> вызова Deconstruct.',
      source: "ms-patterns",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Property pattern · по имени", title: "{ Items: > 10, Cost: > 1000m } — свойства против вложенных паттернов",
      viewBox: "0 0 340 210", zones: PROP_ZONES,
      code: ["record Order(int Items, decimal Cost);", "order switch {", "  { Items: > 10, Cost: > 1000.00m } => 0.10m,", "  { Cost: > 250.00m } => 0.02m, ... };"],
      predictAt: 2, predictQ: 'Что вернёт <code>Discount</code> для <code>Order(12, 1200m)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Order</code> с двумя свойствами: <code>Items</code> и <code>Cost</code>. Хотим матчить по их значениям.', nodes: [{ id: "o", kind: "obj", at: { zone: "objz", row: 0 }, typeTag: "Order", value: "12 / 1200", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>{ Items: &gt; 10, Cost: &gt; 1000m }</code>: каждое свойство сверяется с <span class="hl">вложенным relational-паттерном</span>. Оба должны совпасть.', nodes: [{ id: "o", kind: "obj", at: { zone: "objz", row: 0 }, typeTag: "Order", value: "12 / 1200" }, { id: "pi", kind: "gate", at: { zone: "props", row: 0 }, state: "ok", label: "Items: >10", detail: "12 ✓" }, { id: "pc", kind: "gate", at: { zone: "props", row: 1 }, state: "ok", label: "Cost: >1000", detail: "1200 ✓", accent: true }], edges: [{ id: "e", from: "o", to: "pi" }] },
        { codeLine: 2, out: "0.10", caption: 'Оба вложенных паттерна истинны → рукав даёт <b>0.10</b> (реальный прогон). Матч — non-null И все вложенные совпали.', nodes: [{ id: "o", kind: "obj", at: { zone: "objz", row: 0 }, typeTag: "Order", value: "12 / 1200" }, { id: "pi", kind: "gate", at: { zone: "props", row: 0 }, state: "ok", label: "Items: >10", detail: "✓" }, { id: "r", kind: "chip", at: { zone: "props", row: 1 }, value: "→ 0.10", accent: true }], edges: [{ id: "e", from: "o", to: "pi" }] },
      ],
      explain: 'Property pattern читает члены по имени и сверяет с вложенными паттернами: «Use a property pattern to match an expression\'s <b>properties or fields</b> against nested patterns» <span class="ru-tr">«Используйте property-паттерн, чтобы сопоставить <b>свойства или поля</b> выражения с вложенными паттернами»</span>. Условие матча: «A property pattern matches an expression when the expression result is <span class="hl">non-null</span> and <b>every nested pattern matches</b> the corresponding property or field» <span class="ru-tr">«Property-паттерн сопоставляется с выражением, когда результат выражения не-null и <b>каждый вложенный паттерн совпадает</b> с соответствующим свойством или полем»</span>. Он рекурсивен — «You can use <b>any pattern</b> as a nested pattern» <span class="ru-tr">«В качестве вложенного паттерна можно использовать <b>любой паттерн</b>»</span>. Здесь <code>{ Items: &gt; 10, Cost: &gt; 1000.00m }</code> вкладывает два relational-паттерна; <code>Order(12, 1200m)</code> проходит оба → <code>0.10</code>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s2", num: "02", kicker: "Пустой { } · non-null + bind", title: "is { } матчит любой non-null и создаёт переменную",
      viewBox: "0 0 340 210", zones: EMPTY_ZONES,
      code: ["if (GetValue() is { } nonNull)", "  Use(nonNull);   // гарантированно не null", "// { } == is not null (+ переменная)"],
      scenes: [
        { codeLine: 0, caption: 'Пустой property pattern <code>{ }</code> не проверяет свойств — только <span class="hl">non-null</span>.', nodes: [{ id: "in", kind: "ref", at: { zone: "in2", row: 0 }, name: "value", value: "?" }, { id: "g", kind: "gate", at: { zone: "empty", row: 0 }, state: "ok", label: "is { }", detail: "non-null?", accent: true }], edges: [{ id: "e", from: "in", to: "g", accent: true }] },
        { codeLine: 0, caption: '«matches everything <b>non-null</b>» <span class="ru-tr">«сопоставляется со всем <b>не-null</b>»</span> — и связывает переменную <code>nonNull</code>, как declaration pattern.', nodes: [{ id: "in", kind: "ref", at: { zone: "in2", row: 0 }, name: "value", value: "obj" }, { id: "g", kind: "gate", at: { zone: "empty", row: 0 }, state: "ok", label: "is { } nonNull", detail: "матч" }, { id: "b", kind: "slot", at: { zone: "empty", row: 1 }, name: "nonNull", value: "не null", accent: true }], edges: [{ id: "e", from: "in", to: "g" }] },
        { codeLine: 2, caption: 'Итог: <code>x is { } y</code> — замена <code>is not null</code> с одновременным <span class="hl">созданием переменной</span>.', nodes: [{ id: "in", kind: "ref", at: { zone: "in2", row: 0 }, name: "value", value: "obj" }, { id: "g", kind: "gate", at: { zone: "empty", row: 0 }, state: "ok", label: "{ } ≈ not null", detail: "+ bind" }, { id: "b", kind: "slot", at: { zone: "empty", row: 1 }, name: "nonNull", value: "не null", accent: true }], edges: [{ id: "e", from: "in", to: "g" }] },
      ],
      explain: 'Пустой property pattern — особый и удобный случай: «This construct specifically means that the <b>empty property pattern</b> <code>is { }</code> <span class="hl">matches everything non-null</span>, and you can use it instead of <code>is not null</code> to create a variable: <code>somethingPossiblyNull is { } somethingDefinitelyNotNull</code>» <span class="ru-tr">«Эта конструкция означает, что <b>пустой property-паттерн</b> <code>is { }</code> сопоставляется со всем не-null, и его можно использовать вместо <code>is not null</code>, чтобы создать переменную: <code>somethingPossiblyNull is { } somethingDefinitelyNotNull</code>»</span>. То есть <code>{ }</code> не смотрит ни на одно свойство — он только гарантирует не-null и заодно связывает переменную. Это компактная замена связки «проверить не-null + завести локал».',
      sources: ["ms-patterns"],
    },
    {
      id: "s3", num: "03", kicker: "Extended property · вложенный путь", title: "{ Start.Y: 0 } читает свойство внутри свойства",
      viewBox: "0 0 340 210", zones: PATH_ZONES,
      code: ["record Point(int X, int Y);", "record Segment(Point Start, Point End);", "s is { Start.Y: 0 } or { End.Y: 0 }"],
      console: true,
      scenes: [
        { codeLine: 1, caption: '<code>Segment</code> держит два <code>Point</code>: <code>Start</code> и <code>End</code>. Хотим проверить <code>Y</code> внутри <code>Start</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "seg", row: 0 }, typeTag: "Segment", value: "Start·End", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>{ Start: { Y: 0 } }</code> — вложенный property pattern. Читаем <code>Start</code>, внутри — <code>Y: 0</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "seg", row: 0 }, typeTag: "Segment", value: "Start·End" }, { id: "n", kind: "gate", at: { zone: "path", row: 0 }, state: "ok", label: "Start: { Y: 0 }", detail: "вложенно", accent: true }], edges: [{ id: "e", from: "s", to: "n" }] },
        { codeLine: 2, caption: '<b>Extended property pattern</b> — тот же смысл короче: <code>{ Start.Y: 0 }</code>. Путь <span class="hl">через точку</span> к вложенному члену.', nodes: [{ id: "s", kind: "obj", at: { zone: "seg", row: 0 }, typeTag: "Segment", value: "Start·End" }, { id: "n", kind: "gate", at: { zone: "path", row: 0 }, state: "ok", label: "{ Start.Y: 0 }", detail: "extended" }, { id: "eq", kind: "chip", at: { zone: "path", row: 1 }, value: "= { Start: { Y: 0 } }", accent: true }], edges: [{ id: "e", from: "s", to: "n" }] },
      ],
      explain: 'Property pattern рекурсивен, поэтому путь можно углублять: «A property pattern is a <b>recursive pattern</b>. You can use any pattern as a nested pattern» <span class="ru-tr">«Property-паттерн — это <b>рекурсивный паттерн</b>. В качестве вложенного паттерна можно использовать любой паттерн»</span>. Дока даёт <code>segment is { Start: { Y: 0 } } or { End: { Y: 0 } }</code>. Есть и сокращение через точку — extended property pattern: «You can reference <b>nested properties or fields</b> within a property pattern. This capability is known as an <b>extended property pattern</b>» <span class="ru-tr">«Внутри property-паттерна можно ссылаться на <b>вложенные свойства или поля</b>. Эта возможность называется <b>расширенным property-паттерном</b>»</span> — то же самое как <code>segment is { Start.Y: 0 } or { End.Y: 0 }</code>. Прогон подтверждает: сегмент с <code>Start.Y == 0</code> даёт <code>True</code>, иначе <code>False</code>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s4", num: "04", kicker: "Tuple positional · много входов", title: "(groupSize, dayOfWeek) switch — positional по кортежу",
      viewBox: "0 0 340 210", zones: TUP_ZONES,
      code: ["(groupSize, visitDate.DayOfWeek) switch {", "  (<= 0, _) => throw ...,", "  (_, Saturday or Sunday) => 0.0m,", "  (>= 5 and < 10, Monday) => 20.0m, ... };"],
      scenes: [
        { codeLine: 0, caption: 'Кортеж <code>(groupSize, dayOfWeek)</code> — <span class="hl">несколько входов</span> под один positional-паттерн.', nodes: [{ id: "t", kind: "obj", at: { zone: "tup", row: 0 }, typeTag: "(size, day)", value: "кортеж", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>(&lt;= 0, _)</code>: первая позиция — relational, вторая — <b>discard</b>. Позиции матчатся <span class="hl">по порядку</span>.', nodes: [{ id: "t", kind: "obj", at: { zone: "tup", row: 0 }, typeTag: "(size, day)", value: "кортеж" }, { id: "a1", kind: "gate", at: { zone: "tup", row: 1 }, state: "ok", label: "(<= 0, _)", detail: "позиция 1 и 2", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Каждая позиция — свой вложенный паттерн (<code>Saturday or Sunday</code>, <code>&gt;= 5 and &lt; 10</code>). Один рукав проверяет <b>оба</b> входа сразу.', nodes: [{ id: "t", kind: "obj", at: { zone: "tup", row: 0 }, typeTag: "(size, day)", value: "кортеж" }, { id: "a2", kind: "gate", at: { zone: "tup", row: 1 }, state: "ok", label: "(>=5 and <10, Monday)", detail: "20.0m", accent: true }], edges: [] },
      ],
      explain: 'Positional pattern умеет и кортежи — это способ матчить несколько входов сразу: «You can also match expressions of <b>tuple types</b> against positional patterns. By using this approach, you can match <span class="hl">multiple inputs</span> against various patterns» <span class="ru-tr">«Выражения <b>кортежных типов</b> тоже можно сопоставлять с positional-паттернами. При таком подходе можно сопоставить <b>несколько входов</b> с различными паттернами»</span>. Каждая позиция несёт свой вложенный паттерн: <code>(&lt;= 0, _)</code>, <code>(_, DayOfWeek.Saturday or DayOfWeek.Sunday)</code>, <code>(&gt;= 5 and &lt; 10, DayOfWeek.Monday)</code>. Positional pattern рекурсивен: «you can use <b>any pattern</b> as a nested pattern» <span class="ru-tr">«в качестве вложенного паттерна можно использовать <b>любой паттерн</b>»</span>. Так один рукав закрывает комбинацию размера группы и дня недели.',
      sources: ["ms-patterns"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · вызов Deconstruct", title: "positional (x, y) — это реальный вызов Deconstruct, по позиции",
      viewBox: "0 0 340 238", zones: POS_ZONES,
      code: ["struct Point { int X,Y; void Deconstruct(out int x, out int y) => (x,y)=(X,Y); }", "pt switch { (0,0) => \"Origin\", (1,0) => \"positive X basis end\", _ => \"Just a point\" }", "Classify(new Point(0,0)); Classify(new Point(1,0)); Classify(new Point(3,4));"],
      predictAt: 1, predictQ: 'Куда уйдут <code>(0,0)</code>, <code>(1,0)</code>, <code>(3,4)</code>?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'У <code>Point</code> есть <code>Deconstruct(out x, out y)</code>. Positional pattern <b>вызывает</b> его, чтобы разложить значение на <code>x</code> и <code>y</code>.', nodes: [{ id: "d", kind: "gate", at: { zone: "dec", row: 0 }, state: "ok", label: "Deconstruct →", detail: "(x, y)", accent: true }], edges: [] },
        { codeLine: 1, out: "Origin", caption: '<code>(0, 0)</code>: Deconstruct даёт <code>x=0, y=0</code>; позиции матчатся <span class="hl">по порядку параметров</span> → рукав <code>(0,0)</code> → <b>Origin</b> (реальный прогон).', nodes: [{ id: "d", kind: "gate", at: { zone: "dec", row: 0 }, state: "ok", label: "Deconstruct", detail: "x=0 y=0" }, { id: "a1", kind: "gate", at: { zone: "pos", row: 0 }, state: "ok", label: "(0, 0) →", detail: "Origin", accent: true }], edges: [{ id: "e1", from: "d", to: "a1", accent: true }] },
        { codeLine: 2, out: "Origin\npositive X basis end\nJust a point", caption: '<code>(1,0)</code> → рукав <code>(1,0)</code> = <b>positive X basis end</b>; <code>(3,4)</code> не совпал ни с одним → discard → <b>Just a point</b>. Порядок членов = порядок out-параметров.', nodes: [{ id: "d", kind: "gate", at: { zone: "dec", row: 0 }, state: "ok", label: "Deconstruct", detail: "по позиции" }, { id: "a2", kind: "gate", at: { zone: "pos", row: 0 }, state: "ok", label: "(1,0)/(3,4)", detail: "posX / Just a point", accent: true }], edges: [{ id: "e2", from: "d", to: "a2", accent: true }] },
      ],
      explain: 'Это машинная панель урока — positional pattern как вызов Deconstruct, снятый прогоном. Дока прямо: «Use a positional pattern to <b>deconstruct an expression</b> and match the resulting values against the corresponding nested patterns… the type of an expression contains the <code>Deconstruct</code> method, which the pattern uses to deconstruct» <span class="ru-tr">«Используйте positional-паттерн, чтобы <b>деконструировать выражение</b> и сопоставить полученные значения с соответствующими вложенными паттернами… тип выражения содержит метод <code>Deconstruct</code>, который паттерн использует для деконструкции»</span>. И жёсткое правило порядка: «The order of members in a positional pattern <span class="hl">must match the order of parameters in the <code>Deconstruct</code> method</span>. <b>The code generated for the positional pattern calls the <code>Deconstruct</code> method</b>» <span class="ru-tr">«Порядок членов в positional-паттерне должен совпадать с порядком параметров в методе <code>Deconstruct</code>. <b>Код, сгенерированный для positional-паттерна, вызывает метод <code>Deconstruct</code></b>»</span>. То есть <code>(x, y)</code> в паттерне — это <code>Deconstruct(out x, out y)</code>. Прогон: <code>(0,0)→Origin</code>, <code>(1,0)→positive X basis end</code>, <code>(3,4)→Just a point</code>. Records дают <code>Deconstruct</code> неявно — по позиционным параметрам.',
      sources: ["ms-patterns", "ms-deconstruct"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>record Order(int Items, decimal Cost); static decimal Discount(Order o) => o switch { { Items: &gt; 10, Cost: &gt; 1000.00m } =&gt; 0.10m, { Items: &gt; 5, Cost: &gt; 500.00m } =&gt; 0.05m, { Cost: &gt; 250.00m } =&gt; 0.02m, null =&gt; throw new ArgumentNullException(), _ =&gt; 0m };</code><br/><code>WriteLine(Discount(new Order(12,1200m))); WriteLine(Discount(new Order(6,600m))); WriteLine(Discount(new Order(1,300m)));</code> — три строки?',
      options: ["0.10\\n0.05\\n0.02", "0.10\\n0.02\\n0.02", "0.05\\n0.05\\n0.02", "0.10\\n0.05\\n0"], correctIndex: 0, xp: 10,
      okText: 'Property pattern сверяет свойства с вложенными relational. <code>(12,1200)</code>: Items&gt;10 и Cost&gt;1000 → <b>0.10</b>. <code>(6,600)</code>: Items&gt;5 и Cost&gt;500 → <b>0.05</b>. <code>(1,300)</code>: только Cost&gt;250 → <b>0.02</b>.',
      noText: 'Каждый рукав — набор вложенных паттернов по свойствам; побеждает первый, где совпали все. Результаты: <code>0.10 / 0.05 / 0.02</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0.10\n0.05\n0.02" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>readonly struct Point { public int X {get;} public int Y {get;} public Point(int x,int y)=>(X,Y)=(x,y); public void Deconstruct(out int x,out int y)=>(x,y)=(X,Y); }</code><br/><code>static string Classify(Point p) => p switch { (0,0)=&gt;"Origin", (1,0)=&gt;"positive X basis end", (0,1)=&gt;"positive Y basis end", _=&gt;"Just a point" };</code><br/><code>WriteLine(Classify(new Point(0,0))); WriteLine(Classify(new Point(1,0))); WriteLine(Classify(new Point(3,4)));</code> — три строки?',
      options: ["Origin\\npositive X basis end\\nJust a point", "Origin\\nOrigin\\nJust a point", "Just a point\\npositive X basis end\\nOrigin", "Origin\\npositive Y basis end\\nJust a point"], correctIndex: 0, xp: 10,
      okText: 'Positional pattern <b>вызывает</b> <code>Deconstruct(out x, out y)</code> и матчит по позиции. <code>(0,0)</code>→Origin, <code>(1,0)</code>→positive X basis end, <code>(3,4)</code> ни с чем не совпал → discard → <b>Just a point</b>.',
      noText: '«The code generated for the positional pattern calls the Deconstruct method» <span class="ru-tr">«Код, сгенерированный для positional-паттерна, вызывает метод <code>Deconstruct</code>»</span>. Порядок членов = порядок out-параметров. Итог: <code>Origin / positive X basis end / Just a point</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Origin\npositive X basis end\nJust a point" }, sourceRefs: ["ms-patterns", "ms-deconstruct"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>record Point(int X, int Y); record Segment(Point Start, Point End); static bool OnXAxis(Segment s) => s is { Start.Y: 0 } or { End.Y: 0 };</code><br/><code>WriteLine(OnXAxis(new Segment(new Point(1,0), new Point(2,2)))); WriteLine(OnXAxis(new Segment(new Point(1,1), new Point(2,2))));</code> — обе строки?',
      options: ["True\\nFalse", "False\\nTrue", "True\\nTrue", "False\\nFalse"], correctIndex: 0, xp: 10,
      okText: '<b>Extended property pattern</b> <code>{ Start.Y: 0 }</code> читает <code>Y</code> внутри <code>Start</code>. Первый сегмент: <code>Start.Y == 0</code> → <b>True</b>. Второй: ни <code>Start.Y</code>, ни <code>End.Y</code> не 0 → <b>False</b>.',
      noText: '<code>{ Start.Y: 0 }</code> = <code>{ Start: { Y: 0 } }</code> — вложенный путь через точку. Первый Segment имеет <code>Start.Y==0</code> ⇒ True; второй — нет ⇒ False.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nFalse" }, sourceRefs: ["ms-patterns"],
    },
  ],

  takeaways: [
    { icon: "why", k: "По имени vs по позиции", v: 'Property pattern <code>{ X: 0 }</code> читает члены <b>по имени</b>; positional <code>(0, 0)</code> <span class="hl">деконструирует</span> и матчит <b>по позиции</b>. Оба рекурсивны — вкладывают паттерны.' },
    { icon: "cost", k: "Deconstruct вызывается", v: 'Positional pattern — реальный <b>вызов <code>Deconstruct(out …)</code></b>. Порядок членов в паттерне <span class="hl">обязан совпадать</span> с порядком out-параметров. Records дают Deconstruct неявно.' },
    { icon: "avoid", k: "Пустой и extended", v: '<code>is { }</code> — «любой non-null» + переменная (замена <code>is not null</code>). <code>{ Start.Y: 0 }</code> — extended-путь, короткая запись <code>{ Start: { Y: 0 } }</code>.' },
  ],

  foot: 'урок · <b>property и positional patterns</b> · 5 анимир. разборов · панель вызова Deconstruct (Origin / posX / Just a point) · дизайн <b>mid</b>',
};
