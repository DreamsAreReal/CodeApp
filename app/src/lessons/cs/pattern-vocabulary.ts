/**
 * Lesson: The full pattern vocabulary (CS.S5.pattern-vocabulary) — expert density.
 * The `is` and `switch` constructs "match an input expression against any number of
 * characteristics"; C# ships a fixed set of patterns — declaration, type, constant,
 * relational, logical, property, positional, var, discard, list — and four of them
 * (logical/property/positional/list) are RECURSIVE (they nest other patterns). The
 * senior payoff a level below: a type/declaration pattern dispatches on the RUN-TIME
 * type through implicit reference conversions, and it never matches null.
 *
 * SIGNATURE machine panel (s5): the GetSourceLabel dispatch — the same generic method,
 * int[] routes to arm 1 (derives from Array), List<char> routes to arm 2 (implements
 * ICollection<T>). REAL run-csharp measurement (this file's exec cards): 1 / 2.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn patterns reference page
 *     (fetch-verified 2026-07-21, ms.date 2026-06-05);
 *   - every card's verify.expect is REAL stdout from the backend run-csharp endpoint
 *     (this file's exec cards): "1\n2" / "27.0" / "Too high\nUnknown\nAcceptable".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.pattern-vocabulary/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the vocabulary map — the flat patterns beside the recursive ones.
const Z_FLAT: Zone = { id: "flat", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПРОСТЫЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не вкладывают", subCls: "vz-zsub", subY: 47 };
const Z_REC: Zone = { id: "rec", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "РЕКУРСИВНЫЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "вкладывают паттерны", subCls: "vz-zsub heap", subY: 47 };
const VOCAB_ZONES: Zone[] = [Z_FLAT, Z_REC];

// s2/s3: the input value on the left, the matched arm on the right.
const Z_IN: Zone = { id: "inp", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВХОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "run-time тип", subCls: "vz-zsub", subY: 47 };
const Z_ARM: Zone = { id: "arm", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "РУКАВ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "совпавший паттерн", subCls: "vz-zsub heap", subY: 47 };
const IN_ARM_ZONES: Zone[] = [Z_IN, Z_ARM];

// s4: constant/relational arms ladder.
const Z_LADDER: Zone = { id: "ladder", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "РУКАВА · КОНСТАНТА / RELATIONAL", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "равенство или сравнение с константой", subCls: "vz-zsub", subY: 47 };
const LADDER_ZONES: Zone[] = [Z_LADDER];

// s5 (SIGNATURE): the GetSourceLabel run-time dispatch panel — two inputs, two arms.
const Z_INPUTS: Zone = { id: "inputs", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "ВХОД · RUN-TIME ТИП", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_ARMS2: Zone = { id: "arms2", x: 14, y: 130, w: 312, h: 100, cls: "vz-zone heap", label: "СОВПАВШИЙ РУКАВ (switch по типу)", labelCls: "vz-zlabel heap sm", lx: 130, ly: 120 };
const DISPATCH_ZONES: Zone[] = [Z_INPUTS, Z_ARMS2];

export const patternVocabulary: LessonData = {
  id: "CS.S5.pattern-vocabulary",
  track: "CS",
  section: "CS.S5",
  module: "S5.2",
  lang: "csharp",
  title: "Словарь паттернов: полный набор",
  kicker: "C# вглубь · S5 · карта паттернов",
  home: { subtitle: "declaration/type/constant/relational/logical/property/positional/list", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
  ],

  spec: [
    { text: "«Use the is expression, the switch statement, and the switch expression to match an input expression against any number of characteristics.» <span class=\"ru-tr\">«Используйте выражение is, оператор switch и выражение switch, чтобы сопоставить входное выражение с любым числом характеристик.»</span>", source: "ms-patterns" },
    { text: "«Logical, property, positional, and list patterns are recursive patterns. That is, they can contain nested patterns.» <span class=\"ru-tr\">«Логические, свойственные, позиционные и списочные паттерны — рекурсивные паттерны. То есть они могут содержать вложенные паттерны.»</span>", source: "ms-patterns" },
  ],
  edgeCases: [
    { text: "Declaration/type pattern матчит, когда результат <b>non-null</b> и его run-time тип совместим с <code>T</code> (identity / наследование / интерфейс / boxing). <span class=\"hl\">null не матчит никогда.</span>", source: "ms-patterns" },
    { text: "Constant pattern — «an alternative syntax for <code>==</code> when the right operand is a constant» <span class=\"ru-tr\">«альтернативный синтаксис для <code>==</code>, когда правый операнд — константа»</span>; при <code>x is null</code> компилятор гарантирует, что <b>не вызовет</b> перегруженный <code>==</code>.", source: "ms-patterns" },
    { text: "«Declaration patterns don't consider user-defined conversions or implicit span conversions» <span class=\"ru-tr\">«Declaration-паттерны не учитывают пользовательские преобразования или неявные span-преобразования»</span> — только встроенные преобразования ссылок/boxing.", source: "ms-patterns" },
  ],

  misconceptions: [
    {
      wrong: "«паттерн» — это просто проверка типа через is; остальное — необязательный синтаксис",
      hook: 'Паттернов <span class="hl">десять видов</span>, и это фиксированный словарь: «C# supports multiple patterns, including declaration, type, constant, relational, property, list, var, and discard». <span class="ru-tr">«C# поддерживает множество паттернов, включая declaration, type, constant, relational, property, list, var и discard».</span> Четыре из них <b>рекурсивны</b> — вкладывают другие паттерны: «Logical, property, positional, and list patterns are <span class="hl">recursive patterns</span>». <span class="ru-tr">«Логические, свойственные, позиционные и списочные паттерны — рекурсивные паттерны».</span> А ниже абстракции — маршрутизация: declaration/type pattern выбирает рукав по <b>run-time типу</b> через встроенные преобразования ссылок и <span class="hl">никогда не матчит null</span>. Дальше <b>пять разборов</b> — карта словаря, declaration/type, constant, relational, и <b>машинная панель</b> диспетчеризации по типу.',
      source: "ms-patterns",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Карта словаря", title: "Десять паттернов; четыре рекурсивны",
      viewBox: "0 0 340 210", zones: VOCAB_ZONES,
      code: ["// один вход — любой из паттернов:", "declaration/type · constant · relational", "logical · property · positional · list · var · _"],
      scenes: [
        { codeLine: 1, caption: '<b>Простые</b> паттерны проверяют один признак: тип (<code>declaration/type</code>), равенство (<code>constant</code>), сравнение (<code>relational</code>).', nodes: [{ id: "d", kind: "chip", at: { zone: "flat", row: 0 }, value: "declaration" }, { id: "c", kind: "chip", at: { zone: "flat", row: 1 }, value: "constant" }, { id: "r", kind: "chip", at: { zone: "flat", row: 2 }, value: "relational", accent: true }], edges: [] },
        { codeLine: 2, caption: '<span class="hl">Рекурсивные</span> вкладывают другие паттерны: <code>logical</code>, <code>property</code>, <code>positional</code>, <code>list</code>.', nodes: [{ id: "d", kind: "chip", at: { zone: "flat", row: 0 }, value: "declaration" }, { id: "c", kind: "chip", at: { zone: "flat", row: 1 }, value: "constant" }, { id: "r", kind: "chip", at: { zone: "flat", row: 2 }, value: "relational" }, { id: "l", kind: "chip", at: { zone: "rec", row: 0 }, value: "logical" }, { id: "p", kind: "chip", at: { zone: "rec", row: 1 }, value: "property" }, { id: "ps", kind: "chip", at: { zone: "rec", row: 2 }, value: "positional / list", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Плюс два «универсальных»: <code>var</code> (матчит всё + связывает) и <code>discard _</code> (матчит всё). Один вход — любой из словаря.', nodes: [{ id: "r", kind: "chip", at: { zone: "flat", row: 0 }, value: "простые: 3+" }, { id: "l", kind: "chip", at: { zone: "rec", row: 0 }, value: "рекурсив: 4" }, { id: "u", kind: "chip", at: { zone: "rec", row: 1 }, value: "var · _", accent: true }], edges: [] },
      ],
      explain: 'Словарь паттернов — закрытый список, общий для трёх конструкций: «Use the <code>is</code> expression, the <code>switch</code> statement, and the <code>switch</code> expression to match an input expression against <b>any number of characteristics</b>. C# supports multiple patterns, including declaration, type, constant, relational, property, list, var, and discard». <span class="ru-tr">«Используйте выражение <code>is</code>, оператор <code>switch</code> и выражение <code>switch</code>, чтобы сопоставить входное выражение с <b>любым числом характеристик</b>. C# поддерживает множество паттернов, включая declaration, type, constant, relational, property, list, var и discard».</span> Ключевое свойство четырёх из них — вложенность: «Logical, property, positional, and list patterns are <span class="hl">recursive patterns</span>. That is, they can contain nested patterns». <span class="ru-tr">«Логические, свойственные, позиционные и списочные паттерны — рекурсивные паттерны. То есть они могут содержать вложенные паттерны».</span> Отсюда выразительность: <code>{ Start: { Y: 0 } }</code> — паттерн внутри паттерна внутри паттерна.',
      sources: ["ms-patterns"],
    },
    {
      id: "s2", num: "02", kicker: "Declaration/type · run-time", title: "Проверка совместимости run-time типа с T",
      viewBox: "0 0 340 210", zones: IN_ARM_ZONES,
      code: ["object greeting = \"Hello, World!\";", "if (greeting is string message)", "  Console.WriteLine(message.ToLower());"],
      console: true,
      scenes: [
        { codeLine: 0, caption: '<code>greeting</code>: compile-time тип <b>object</b>, run-time — <b>string</b>. Хотим проверить именно run-time тип.', nodes: [{ id: "g", kind: "obj", at: { zone: "inp", row: 0 }, typeTag: "greeting", value: "object→str", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>is string message</code>: <b>declaration pattern</b> проверяет совместимость run-time типа с <code>string</code> и <span class="hl">связывает</span> converted-результат.', nodes: [{ id: "g", kind: "obj", at: { zone: "inp", row: 0 }, typeTag: "greeting", value: "object→str" }, { id: "gt", kind: "gate", at: { zone: "arm", row: 0 }, state: "ok", label: "is string", detail: "матч" }], edges: [{ id: "e", from: "g", to: "gt", accent: true }] },
        { codeLine: 2, caption: '<code>message</code> — уже <code>string</code>: «assigns the variable to the <span class="hl">converted expression result</span>». <span class="ru-tr">«присваивает переменной результат преобразованного выражения».</span> <code>ToLower()</code> зовётся без каста.', nodes: [{ id: "g", kind: "obj", at: { zone: "inp", row: 0 }, typeTag: "greeting", value: "object→str" }, { id: "gt", kind: "gate", at: { zone: "arm", row: 0 }, state: "ok", label: "is string", detail: "матч" }, { id: "m", kind: "slot", at: { zone: "arm", row: 1 }, name: "message", value: "string", accent: true }], edges: [{ id: "e", from: "g", to: "gt" }] },
      ],
      explain: 'Declaration и type pattern проверяют run-time тип: «Use declaration and type patterns to check if the <b>run-time type</b> of an expression is compatible with a given type. By using a declaration pattern, you can also declare a new local variable. When a declaration pattern matches an expression, it assigns the variable to the <span class="hl">converted expression result</span>». <span class="ru-tr">«Используйте declaration- и type-паттерны, чтобы проверить, совместим ли <b>run-time тип</b> выражения с заданным типом. С помощью declaration-паттерна можно также объявить новую локальную переменную. Когда declaration-паттерн сопоставляется с выражением, он присваивает переменной результат преобразованного выражения».</span> Матч случается, когда результат «is <b>non-null</b>» <span class="ru-tr">«не <b>null</b>»</span> и выполнено одно из: identity-конверсия к <code>T</code>, наследование/реализация интерфейса (implicit reference conversion), boxing/unboxing. Важное ограничение: «Declaration patterns don\'t consider <b>user-defined conversions</b> or implicit span conversions». <span class="ru-tr">«Declaration-паттерны не учитывают <b>пользовательские преобразования</b> или неявные span-преобразования».</span>',
      sources: ["ms-patterns"],
    },
    {
      id: "s3", num: "03", kicker: "Constant · равенство без ==", title: "Constant pattern: альтернатива == для константы",
      viewBox: "0 0 340 210", zones: IN_ARM_ZONES,
      code: ["visitorCount switch {", "  1 => 12.0m, 2 => 20.0m,", "  3 => 27.0m, 4 => 32.0m, 0 => 0.0m,", "  _ => throw ... };  // count = 3"],
      predictAt: 2, predictQ: 'Что вернёт <code>GetGroupTicketPrice(3)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Вход <code>visitorCount = 3</code>. Constant pattern — «an alternative syntax for <code>==</code> when the right operand is a constant». <span class="ru-tr">«альтернативный синтаксис для <code>==</code>, когда правый операнд — константа».</span>', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "count", value: "3", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Рукав <code>3 => 27.0m</code>: <span class="hl">равенство с константой</span> <code>3</code>. Матч.', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "count", value: "3" }, { id: "g", kind: "gate", at: { zone: "arm", row: 0 }, state: "ok", label: "is 3", detail: "27.0m" }], edges: [{ id: "e", from: "in", to: "g", accent: true }] },
        { codeLine: 2, out: "27.0", caption: 'Результат рукава — <b>27.0</b> (реальный прогон). При <code>x is null</code> компилятор гарантирует, что <span class="hl">не вызовет</span> перегруженный <code>==</code>.', nodes: [{ id: "in", kind: "slot", at: { zone: "inp", row: 0 }, name: "count", value: "3" }, { id: "g", kind: "gate", at: { zone: "arm", row: 0 }, state: "ok", label: "is 3", detail: "27.0m" }, { id: "out", kind: "chip", at: { zone: "arm", row: 1 }, value: "→ 27.0", accent: true }], edges: [{ id: "e", from: "in", to: "g" }] },
      ],
      explain: 'Constant pattern — это равенство с константой на языке паттернов: «The <b>constant pattern</b> is an alternative syntax for <code>==</code> when the right operand is a constant. Use a constant pattern to test if an expression result <b>equals a specified constant</b>». <span class="ru-tr">«<b>Constant pattern</b> — альтернативный синтаксис для <code>==</code>, когда правый операнд — константа. Используйте constant pattern, чтобы проверить, <b>равен ли результат выражения указанной константе</b>».</span> Константой может быть число, <code>char</code>, строковый литерал, <code>true</code>/<code>false</code>, значение enum, <code>const</code>-поле/локал или <code>null</code>. Особый бонус для null: «The compiler guarantees that it <span class="hl">doesn\'t invoke a user-overloaded equality operator</span> <code>==</code> when it evaluates expression <code>x is null</code>». <span class="ru-tr">«Компилятор гарантирует, что он не вызовет пользовательский перегруженный оператор равенства <code>==</code>, когда вычисляет выражение <code>x is null</code>».</span> <code>GetGroupTicketPrice(3)</code> ловит рукав <code>3</code> → <code>27.0</code>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s4", num: "04", kicker: "Relational · сравнение", title: "Relational pattern: < > <= >= с константой",
      viewBox: "0 0 340 210", zones: LADDER_ZONES,
      code: ["measurement switch {", "  < -4.0 => \"Too low\",", "  > 10.0 => \"Too high\",", "  double.NaN => \"Unknown\", _ => \"Acceptable\" };"],
      console: true,
      scenes: [
        { codeLine: 2, out: "Too high", caption: '<code>Classify(13)</code>: <code>13 &lt; -4.0</code>? нет. <code>13 &gt; 10.0</code>? <span class="hl">да</span> → <b>Too high</b> (реальный прогон).', nodes: [{ id: "a1", kind: "gate", at: { zone: "ladder", row: 0 }, state: "fail", label: "< -4.0", detail: "мимо" }, { id: "a2", kind: "gate", at: { zone: "ladder", row: 1 }, state: "ok", label: "> 10.0", detail: "Too high", }], edges: [] },
        { codeLine: 3, out: "Too high\nUnknown", caption: '<code>Classify(double.NaN)</code>: relational-паттерны с <code>NaN</code> <b>не матчат</b> (сравнение false) → ловит constant <code>double.NaN</code> → <b>Unknown</b>.', nodes: [{ id: "a2", kind: "gate", at: { zone: "ladder", row: 0 }, state: "fail", label: "> 10.0", detail: "NaN мимо" }, { id: "a3", kind: "gate", at: { zone: "ladder", row: 1 }, state: "ok", label: "double.NaN", detail: "Unknown", accent: true }], edges: [] },
        { codeLine: 3, out: "Too high\nUnknown\nAcceptable", caption: '<code>Classify(2.4)</code>: не &lt;-4, не &gt;10, не NaN → <b>discard</b> <code>_</code> ловит → <b>Acceptable</b>.', nodes: [{ id: "a3", kind: "gate", at: { zone: "ladder", row: 0 }, state: "fail", label: "все relational", detail: "мимо" }, { id: "a4", kind: "gate", at: { zone: "ladder", row: 1 }, state: "ok", label: "_", detail: "Acceptable", accent: true }], edges: [] },
      ],
      explain: 'Relational pattern сравнивает с константой: «Use a relational pattern to <b>compare an expression result with a constant</b>… In a relational pattern, use any of the relational operators <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, or <code>&gt;=</code>. The right-hand part of a relational pattern must be a <b>constant expression</b>». <span class="ru-tr">«Используйте relational-паттерн, чтобы <b>сравнить результат выражения с константой</b>… В relational-паттерне используйте любой из операторов сравнения <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> или <code>&gt;=</code>. Правая часть relational-паттерна должна быть <b>константным выражением</b>».</span> С <code>NaN</code> — ловушка, которую дока фиксирует: «If an expression result is <code>null</code> or fails to convert… a relational pattern <span class="hl">doesn\'t match</span>» <span class="ru-tr">«Если результат выражения — <code>null</code> или его не удаётся преобразовать… relational-паттерн не совпадает».</span> — поэтому <code>NaN</code> проскакивает мимо <code>&gt; 10.0</code> и ловится явным <code>double.NaN</code>. Прогон: <code>Too high / Unknown / Acceptable</code>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · диспетчеризация по типу", title: "Один generic-метод: int[] → рукав 1, List<char> → рукав 2",
      viewBox: "0 0 340 238", zones: DISPATCH_ZONES,
      code: ["static int GetSourceLabel<T>(IEnumerable<T> s) => s switch {", "  Array array => 1,", "  ICollection<T> collection => 2, _ => 3 };", "GetSourceLabel(new int[]{...}); GetSourceLabel(new List<char>{...});"],
      predictAt: 1, predictQ: 'Какие рукава поймают <code>int[]</code> и <code>List&lt;char&gt;</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Два входа. <code>int[]</code> — его run-time тип <span class="hl">наследует Array</span>. Рукав <code>Array array</code> проверяется первым.', nodes: [{ id: "arr", kind: "obj", at: { zone: "inputs", row: 0, col: 0 }, typeTag: "int[]", value: "→ Array", accent: true }, { id: "lst", kind: "obj", at: { zone: "inputs", row: 0, col: 1 }, typeTag: "List<char>", value: "→ ICol<T>" }], edges: [] },
        { codeLine: 1, out: "1", caption: '<code>GetSourceLabel(int[])</code>: run-time тип <code>int[]</code> derives from <code>Array</code> → рукав 1 → печать <b>1</b> (реальный прогон).', nodes: [{ id: "arr", kind: "obj", at: { zone: "inputs", row: 0, col: 0 }, typeTag: "int[]", value: "→ Array", accent: true }, { id: "lst", kind: "obj", at: { zone: "inputs", row: 0, col: 1 }, typeTag: "List<char>", value: "→ ICol<T>" }, { id: "a1", kind: "gate", at: { zone: "arms2", row: 0 }, state: "ok", label: "Array array →", detail: "1" }], edges: [{ id: "e1", from: "arr", to: "a1", accent: true }] },
        { codeLine: 2, out: "1\n2", caption: '<code>List&lt;char&gt;</code> НЕ наследует Array, но <span class="hl">реализует ICollection&lt;T&gt;</span> → рукав 2 → печать <b>2</b>. Маршрут решил run-time тип.', nodes: [{ id: "arr", kind: "obj", at: { zone: "inputs", row: 0, col: 0 }, typeTag: "int[]", value: "→1" }, { id: "lst", kind: "obj", at: { zone: "inputs", row: 0, col: 1 }, typeTag: "List<char>", value: "→ ICol<T>", accent: true }, { id: "a2", kind: "gate", at: { zone: "arms2", row: 0 }, state: "ok", label: "ICollection<T> →", detail: "2" }], edges: [{ id: "e2", from: "lst", to: "a2", accent: true }] },
      ],
      explain: 'Это машинная панель урока — диспетчеризация по run-time типу, снятая прогоном. Дока показывает ровно этот механизм: «at the first call… the first pattern matches an argument value because the argument\'s run-time type <code>int[]</code> <b>derives from</b> the <code>Array</code> type. At the second call… the argument\'s run-time type <code>List&lt;T&gt;</code> doesn\'t derive from the <code>Array</code> type but <span class="hl">implements the <code>ICollection&lt;T&gt;</code> interface</span>». <span class="ru-tr">«при первом вызове… первый паттерн сопоставляется со значением аргумента, потому что run-time тип аргумента <code>int[]</code> <b>наследуется от</b> типа <code>Array</code>. При втором вызове… run-time тип аргумента <code>List&lt;T&gt;</code> не наследуется от типа <code>Array</code>, но реализует интерфейс <code>ICollection&lt;T&gt;</code>».</span> То есть один <code>switch</code> по типу маршрутизирует два разных объекта в разные рукава по их фактическому типу и цепочке наследования/интерфейсов. Прогон: <code>1</code>, затем <code>2</code>. Type pattern — это switch по метаданным типа, а не по значению.',
      sources: ["ms-patterns"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static int GetSourceLabel&lt;T&gt;(IEnumerable&lt;T&gt; s) => s switch { Array array =&gt; 1, ICollection&lt;T&gt; collection =&gt; 2, _ =&gt; 3 };</code><br/><code>Console.WriteLine(GetSourceLabel(new int[]{10,20,30})); Console.WriteLine(GetSourceLabel(new List&lt;char&gt;{\'a\',\'b\'}));</code> — обе строки?',
      options: ["1\\n2", "2\\n2", "1\\n1", "3\\n2"], correctIndex: 0, xp: 10,
      okText: 'Type pattern маршрутизирует по <b>run-time типу</b>: <code>int[]</code> derives from <code>Array</code> → рукав 1; <code>List&lt;char&gt;</code> не Array, но реализует <code>ICollection&lt;T&gt;</code> → рукав 2. Печать: <b>1</b>, затем <b>2</b>.',
      noText: 'Рукава проверяются по порядку. <code>int[]</code> ловит <code>Array</code> (наследование) → 1. <code>List&lt;char&gt;</code> минует Array, но реализует <code>ICollection&lt;T&gt;</code> → 2. Итог: <code>1</code> / <code>2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1\n2" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static decimal GetGroupTicketPrice(int c) => c switch { 1 =&gt; 12.0m, 2 =&gt; 20.0m, 3 =&gt; 27.0m, 4 =&gt; 32.0m, 0 =&gt; 0.0m, _ =&gt; throw new ArgumentException("bad") };</code><br/><code>Console.WriteLine(GetGroupTicketPrice(3));</code> — что напечатает?',
      options: ["27.0", "27", "27.0m", "32.0"], correctIndex: 0, xp: 10,
      okText: '<b>Constant pattern</b> — равенство с константой. Вход <code>3</code> ловит рукав <code>3 =&gt; 27.0m</code>. <code>Console.WriteLine(decimal)</code> печатает <b>27.0</b> (суффикс <code>m</code> — синтаксис, не вывод).',
      noText: 'Constant pattern <code>3</code> совпадает с входом <code>3</code> ⇒ значение рукава <code>27.0m</code>. При печати decimal выводится как <b>27.0</b> — без литерального суффикса <code>m</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "27.0" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Classify(double m) => m switch { &lt; -4.0 =&gt; "Too low", &gt; 10.0 =&gt; "Too high", double.NaN =&gt; "Unknown", _ =&gt; "Acceptable" };</code><br/><code>Console.WriteLine(Classify(13)); Console.WriteLine(Classify(double.NaN)); Console.WriteLine(Classify(2.4));</code> — три строки?',
      options: ["Too high\\nUnknown\\nAcceptable", "Too high\\nAcceptable\\nAcceptable", "Too high\\nUnknown\\nToo low", "Acceptable\\nUnknown\\nAcceptable"], correctIndex: 0, xp: 10,
      okText: '<code>13</code> &gt; 10 → <b>Too high</b>. <code>NaN</code>: relational-паттерны с NaN дают false, ловит constant <code>double.NaN</code> → <b>Unknown</b>. <code>2.4</code> минует всё → discard <code>_</code> → <b>Acceptable</b>.',
      noText: 'Ловушка — <code>NaN</code>: любое relational-сравнение с ним ложно, поэтому <code>&gt; 10.0</code> его не ловит, а явный <code>double.NaN</code>-рукав — да. Итог: <code>Too high / Unknown / Acceptable</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Too high\nUnknown\nAcceptable" }, sourceRefs: ["ms-patterns"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Закрытый словарь", v: 'Паттернов десять: declaration/type, constant, relational, logical, property, positional, var, discard, list. <span class="hl">Четыре рекурсивны</span> (logical/property/positional/list) — вкладывают паттерны.' },
    { icon: "cost", k: "Тип vs значение", v: 'Declaration/type pattern матчит по <b>run-time типу</b> через встроенные преобразования (наследование, интерфейс, boxing) и <span class="hl">никогда не матчит null</span>. Constant — равенство без вызова перегруженного <code>==</code>.' },
    { icon: "avoid", k: "NaN-ловушка", v: 'Relational-паттерн с <code>NaN</code> всегда false (сравнение не проходит). Ловить <code>NaN</code> нужно <b>явным</b> <code>double.NaN</code>-рукавом, иначе он уйдёт в discard.' },
  ],

  foot: 'урок · <b>словарь паттернов</b> · 5 анимир. разборов · панель диспетчеризации по run-time типу (1 / 2) · дизайн <b>mid</b>',
};
