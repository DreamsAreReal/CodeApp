/**
 * Lesson: Pattern matching — overview & null checks (CS.S5.pattern-overview) — expert
 * density, the entry lesson of section S5. Pattern matching is "a technique where you
 * test an expression to determine if it has certain characteristics": the `is` expression
 * tests-and-declares in one step, and the `switch` expression dispatches on the first
 * matching pattern. The senior payoff a lesson below the abstraction: the compiler turns
 * an EXHAUSTIVE match into a guarantee, and a NON-exhaustive `switch` expression throws a
 * real SwitchExpressionException at run time.
 *
 * SIGNATURE machine panel (s5): the exhaustiveness gate — a non-exhaustive `switch`
 * expression on int throws System.Runtime.CompilerServices.SwitchExpressionException; the
 * `_` discard arm removes the throw. REAL run-csharp measurements (:5102):
 *   n switch {1,2}      → threw: SwitchExpressionException
 *   n switch {1,2,_}    → other
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the two cited Learn pages
 *     (fetch-verified 2026-07-21: pattern-matching overview + switch-expression);
 *   - every card's verify.expect is REAL stdout from the backend run-csharp endpoint
 *     (:5102): "has value 12" / "liquid" / "threw: SwitchExpressionException".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.pattern-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two pattern-matching entry points — the `is` expression beside the `switch` expression.
const Z_IS: Zone = { id: "isz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "is-ВЫРАЖЕНИЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "тест + объявление", subCls: "vz-zsub", subY: 47 };
const Z_SWITCH: Zone = { id: "switchz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "switch-ВЫРАЖЕНИЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "первый матч", subCls: "vz-zsub heap", subY: 47 };
const TWO_ENTRY_ZONES: Zone[] = [Z_IS, Z_SWITCH];

// s2/s3: the input value on the left, the pattern test/binding on the right.
const Z_INPUT: Zone = { id: "input", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВХОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "проверяемое значение", subCls: "vz-zsub", subY: 47 };
const Z_MATCH: Zone = { id: "match", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ПАТТЕРН", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "тест → переменная", subCls: "vz-zsub heap", subY: 47 };
const MATCH_ZONES: Zone[] = [Z_INPUT, Z_MATCH];

// s4: the switch arms as an ordered ladder — first match wins.
const Z_ARMS: Zone = { id: "arms", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "switch-РУКАВА · ПО ПОРЯДКУ ТЕКСТА", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "первый совпавший → результат", subCls: "vz-zsub", subY: 47 };
const ARMS_ZONES: Zone[] = [Z_ARMS];

// s5 (SIGNATURE): the exhaustiveness gate — non-exhaustive throws vs discard covers all.
const Z_OPEN: Zone = { id: "open", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "БЕЗ _ · НЕ ПОЛНО", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "вход 3 не покрыт", subCls: "vz-zsub heap", subY: 47 };
const Z_CLOSED: Zone = { id: "closed", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "С _ · ПОЛНО", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "discard ловит всё", subCls: "vz-zsub good", subY: 47 };
const GATE_ZONES: Zone[] = [Z_OPEN, Z_CLOSED];

export const patternOverview: LessonData = {
  id: "CS.S5.pattern-overview",
  track: "CS",
  section: "CS.S5",
  module: "S5.1",
  lang: "csharp",
  title: "Pattern matching: обзор и null-проверки",
  kicker: "C# вглубь · S5 · тест по признакам",
  home: { subtitle: "is / switch, null-паттерны, exhaustiveness", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-pm-overview", kind: "doc", org: "Microsoft Learn", title: "Pattern matching overview (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching", date: "2025-11-18" },
    { id: "ms-switch-expr", kind: "doc", org: "Microsoft Learn", title: "switch expression (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression", date: "2026-03-20" },
    { id: "ms-switch-exc", kind: "doc", org: "Microsoft Learn", title: "SwitchExpressionException Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.switchexpressionexception", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Pattern matching is a technique where you test an expression to determine if it has certain characteristics.»", source: "ms-pm-overview" },
    { text: "«The result of a switch expression is the value of the expression of the first switch expression arm whose pattern matches the input expression and whose case guard, if present, evaluates to true. The switch expression arms are evaluated in text order.»", source: "ms-switch-expr" },
  ],
  edgeCases: [
    { text: "<code>if (maybe is int number)</code>: переменная <code>number</code> доступна и присвоена <b>только в true-ветке</b> if. Обращение в else или после блока — ошибка компиляции.", source: "ms-pm-overview" },
    { text: "<code>is not null</code> вместо <code>!= null</code>: «because you're not using the <code>==</code> operator, this pattern works when a type overloads the <code>==</code> operator».", source: "ms-pm-overview" },
    { text: "Пропустишь <code>_</code>-рукав — компилятор предупреждает «that your pattern expression doesn't handle all possible input values»; на непокрытом входе рантайм бросает <code>SwitchExpressionException</code>.", source: "ms-pm-overview" },
  ],

  misconceptions: [
    {
      wrong: "pattern matching — это синтаксический сахар над if/switch, ничего нового под ним нет",
      hook: 'Под pattern matching — не «сахар», а <span class="hl">машина проверки по признакам</span> плюс гарантия компилятора. Дословно: «Pattern matching is a technique where you test an expression to determine if it has <b>certain characteristics</b>». <code>is</code>-выражение тестирует И объявляет переменную одним шагом; <code>switch</code>-выражение выбирает <b>первый совпавший</b> паттерн. А ниже абстракции — <span class="hl">exhaustiveness</span>: полный <code>switch</code> компилятор превращает в гарантию, а неполный <b>бросает <code>SwitchExpressionException</code> в рантайме</b> (реальный прогон). Дальше <b>пять разборов</b> — от null-паттернов до <b>машинной панели</b> exhaustiveness.',
      source: "ms-pm-overview",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Две точки входа", title: "is-выражение и switch-выражение",
      viewBox: "0 0 340 210", zones: TWO_ENTRY_ZONES,
      code: ["// тест по признакам — два входа", "if (x is int n) { /* тест + n */ }", "var r = x switch { ... };"],
      scenes: [
        { codeLine: 1, caption: '<code>is</code>-выражение: <span class="hl">тестирует</span> выражение и условно объявляет новую переменную под результат.', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "ok", label: "x is int n", detail: "тест + n" }], edges: [] },
        { codeLine: 2, caption: '<code>switch</code>-выражение: выполняет действие по <span class="hl">первому совпавшему</span> паттерну для выражения.', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "ok", label: "x is int n", detail: "тест + n" }, { id: "sw", kind: "gate", at: { zone: "switchz", row: 0 }, state: "ok", label: "x switch {…}", detail: "первый матч", }], edges: [] },
        { codeLine: 2, caption: 'Оба входа опираются на богатый <b>словарь паттернов</b>: type, constant, relational, logical, property, list — общий язык для двух конструкций.', nodes: [{ id: "is", kind: "gate", at: { zone: "isz", row: 0 }, state: "ok", label: "is", detail: "тест + bind" }, { id: "sw", kind: "gate", at: { zone: "switchz", row: 0 }, state: "ok", label: "switch", detail: "первый матч" }, { id: "voc", kind: "chip", at: { zone: "switchz", row: 1 }, value: "общий словарь", accent: true }], edges: [] },
      ],
      explain: 'Pattern matching — это тест по признакам, а не по значению: «Pattern matching is a technique where you test an expression to determine if it has certain characteristics». Две конструкции его несут: «The "<code>is</code> expression" supports pattern matching to test an expression and conditionally declare a new variable to the result of that expression. The "<code>switch</code> expression" enables you to perform actions based on the <b>first matching pattern</b> for an expression». Обе опираются на один словарь: «These two expressions support a rich vocabulary of patterns». Дальше — как этот словарь ложится на null-проверки, порядок рукавов и exhaustiveness.',
      sources: ["ms-pm-overview"],
    },
    {
      id: "s2", num: "02", kicker: "Declaration pattern · null-safe", title: "is int number: тест типа + объявление, безопасно к null",
      viewBox: "0 0 340 210", zones: MATCH_ZONES,
      code: ["int? maybe = 12;", "if (maybe is int number)", "  WriteLine($\"has value {number}\");", "else WriteLine(\"no value\");"],
      predictAt: 1, predictQ: 'Что напечатает код при <code>int? maybe = 12</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>int? maybe = 12</code>: nullable value-тип. Хотим достать underlying <code>int</code>, попутно проверив на null.', nodes: [{ id: "in", kind: "obj", at: { zone: "input", row: 0 }, typeTag: "maybe", value: "int? 12", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>maybe is int number</code> — <b>declaration pattern</b>: проверяет тип и <span class="hl">присваивает</span> результат в новую переменную <code>number</code>.', nodes: [{ id: "in", kind: "obj", at: { zone: "input", row: 0 }, typeTag: "maybe", value: "int? 12" }, { id: "g", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "is int number", detail: "матч → 12" }], edges: [{ id: "e", from: "in", to: "g", accent: true }] },
        { codeLine: 2, out: "has value 12", caption: '<code>number</code> живёт <span class="hl">только в true-ветке</span> if. Печать: <b>has value 12</b> (реальный прогон).', nodes: [{ id: "in", kind: "obj", at: { zone: "input", row: 0 }, typeTag: "maybe", value: "int? 12" }, { id: "g", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "is int number", detail: "матч → 12" }, { id: "n", kind: "slot", at: { zone: "match", row: 1 }, name: "number", value: "12", accent: true }], edges: [{ id: "e", from: "in", to: "g" }] },
      ],
      explain: 'Самый частый сценарий pattern matching — гарантировать, что значение не <code>null</code>: «One of the most common scenarios for pattern matching is to ensure values aren\'t <code>null</code>». Здесь работает declaration pattern: «The preceding code is a declaration pattern to test the type of the variable, and assign it to a new variable». И это <b>безопаснее</b> обычной проверки: «The variable <code>number</code> is only accessible and assigned in the <span class="hl">true portion</span> of the <code>if</code> clause. If you try to access it elsewhere… the compiler issues an error». Реальный вывод при <code>maybe = 12</code> — <code>has value 12</code>.',
      sources: ["ms-pm-overview"],
    },
    {
      id: "s3", num: "03", kicker: "not-паттерн · non-null", title: "is not null безопаснее, чем != null",
      viewBox: "0 0 340 210", zones: MATCH_ZONES,
      code: ["string? message = ReadMessageOrDefault();", "if (message is not null)", "  Console.WriteLine(message);"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>message</code> может быть <code>null</code>. Проверяем «не null» через паттерн, а не оператор <code>!=</code>.', nodes: [{ id: "m", kind: "ref", at: { zone: "input", row: 0 }, name: "message", value: "string?" }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>is not null</code>: <span class="hl">constant pattern</span> <code>null</code> под <b>logical pattern</b> <code>not</code> — матч, когда отрицаемый паттерн НЕ совпал.', nodes: [{ id: "m", kind: "ref", at: { zone: "input", row: 0 }, name: "message", value: "string?" }, { id: "g", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "is not null", detail: "not(null)" }], edges: [{ id: "e", from: "m", to: "g", accent: true }] },
        { codeLine: 2, out: "", caption: 'Плюс: паттерн работает, даже если тип <span class="hl">перегрузил <code>==</code></span> — обычная проверка <code>!= null</code> могла бы уйти в чужой оператор.', nodes: [{ id: "m", kind: "ref", at: { zone: "input", row: 0 }, name: "message", value: "string?" }, { id: "g", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "is not null", detail: "not(null)" }, { id: "safe", kind: "chip", at: { zone: "match", row: 1 }, value: "минует == overload", accent: true }], edges: [{ id: "e", from: "m", to: "g" }] },
      ],
      explain: 'Проверка «не null» через паттерн собирается из двух: «The preceding example used a <b>constant pattern</b> to compare the variable to <code>null</code>. The <code>not</code> is a <b>logical pattern</b> that matches when the negated pattern doesn\'t match». Почему это лучше <code>!= null</code>: «because you\'re not using the <code>==</code> operator, this pattern works when a type <span class="hl">overloads the <code>==</code> operator</span>. That makes it an ideal way to check null reference values, adding the <code>not</code> pattern». То есть <code>is not null</code> — не стилистика, а обход возможной перегрузки равенства.',
      sources: ["ms-pm-overview"],
    },
    {
      id: "s4", num: "04", kicker: "Порядок рукавов · relational+logical", title: "switch по признакам: первый совпавший рукав, в порядке текста",
      viewBox: "0 0 340 210", zones: ARMS_ZONES,
      code: ["string WaterState(int t) => t switch {", "  < 32 => \"solid\",", "  (> 32) and (< 212) => \"liquid\",", "  > 212 => \"gas\" };  // WaterState(100)"],
      predictAt: 2, predictQ: 'Что вернёт <code>WaterState(100)</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Рукава проверяются <span class="hl">в порядке текста</span>. <code>100 &lt; 32</code>? Нет — идём дальше.', nodes: [{ id: "a1", kind: "gate", at: { zone: "arms", row: 0 }, state: "fail", label: "< 32", detail: "solid — мимо" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>(> 32) and (< 212)</code> — <b>relational</b> паттерны под conjunctive <code>and</code>. <code>100</code> в диапазоне → <span class="hl">матч</span>.', nodes: [{ id: "a1", kind: "gate", at: { zone: "arms", row: 0 }, state: "fail", label: "< 32", detail: "мимо" }, { id: "a2", kind: "gate", at: { zone: "arms", row: 1 }, state: "ok", label: "(>32) and (<212)", detail: "liquid ← матч", }], edges: [] },
        { codeLine: 3, out: "liquid", caption: 'Первый совпавший рукав даёт результат — остальные не проверяются. Печать: <b>liquid</b> (реальный прогон).', nodes: [{ id: "a2", kind: "gate", at: { zone: "arms", row: 0 }, state: "ok", label: "(>32) and (<212)", detail: "liquid" }, { id: "a3", kind: "gate", at: { zone: "arms", row: 1 }, state: "", label: "> 212", detail: "gas — не дошли" }], edges: [] },
      ],
      explain: 'Механика <code>switch</code>-выражения точная: «The result of a <code>switch</code> expression is the value of the expression of the <b>first switch expression arm</b> whose pattern matches the input expression and whose case guard, if present, evaluates to <code>true</code>. The <code>switch</code> expression arms are evaluated in <span class="hl">text order</span>». Тут <code>(> 32) and (< 212)</code> — «the conjunctive <code>and</code> logical pattern to check that both relational patterns match». <code>WaterState(100)</code> ловит второй рукав → <code>liquid</code>. Порядок рукавов — часть смысла: верхний матч закрывает нижние.',
      sources: ["ms-switch-expr", "ms-pm-overview"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · exhaustiveness", title: "Неполный switch бросает SwitchExpressionException",
      viewBox: "0 0 340 214", zones: GATE_ZONES,
      code: ["string Name(int n) => n switch {", "  1 => \"one\", 2 => \"two\" };   // без _", "Name(3);   // вход не покрыт", "// + _ => \"other\"  →  ловит всё"],
      predictAt: 2, predictQ: 'Что делает <code>Name(3)</code>, если у switch НЕТ <code>_</code>-рукава?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Рукава только <code>1</code> и <code>2</code>. Компилятор предупреждает: switch <span class="hl">не покрывает все входы</span>.', nodes: [{ id: "sw", kind: "gate", at: { zone: "open", row: 0 }, state: "ok", label: "n switch {1,2}", detail: "нет _" }], edges: [] },
        { codeLine: 2, out: "threw: SwitchExpressionException", caption: '<code>Name(3)</code>: ни один паттерн не совпал → рантайм <span class="hl">бросает</span> <code>SwitchExpressionException</code> (реальный прогон).', nodes: [{ id: "sw", kind: "gate", at: { zone: "open", row: 0 }, state: "fail", label: "Name(3)", detail: "нет матча" }, { id: "ex", kind: "chip", at: { zone: "open", row: 1 }, value: "throw!", accent: true }], edges: [] },
        { codeLine: 3, out: "other", caption: 'Добавили <code>_ => "other"</code> — <b>discard pattern</b> ловит любой вход. Switch стал <span class="hl">exhaustive</span>: <code>Name(3)</code> = <b>other</b>, без исключения.', nodes: [{ id: "sw", kind: "gate", at: { zone: "open", row: 0 }, state: "fail", label: "без _", detail: "throw" }, { id: "cl", kind: "gate", at: { zone: "closed", row: 0 }, state: "ok", label: "с _ => other", detail: "Name(3)=other" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — exhaustiveness, снятая реальным прогоном. Без <code>_</code>-рукава на непокрытом входе: «If none of a <code>switch</code> expression\'s patterns matches an input value, the runtime throws an exception. In .NET Core 3.0 and later versions, the exception is a <b>System.Runtime.CompilerServices.SwitchExpressionException</b>». Прогон подтверждает: <code>Name(3)</code> без <code>_</code> → <code>threw: SwitchExpressionException</code>. Лечит это <b>discard pattern</b>: «To guarantee that a <code>switch</code> expression handles all possible input values, provide a <code>switch</code> expression arm with a <span class="hl">discard pattern</span>» — с <code>_ => "other"</code> тот же <code>Name(3)</code> печатает <code>other</code>. Exhaustiveness — это контракт, который компилятор проверяет, а рантайм охраняет.',
      sources: ["ms-switch-expr", "ms-switch-exc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int? maybe = 12; if (maybe is int number) Console.WriteLine($"has value {number}"); else Console.WriteLine("no value");</code> — что напечатает?',
      options: ["has value 12", "no value", "12", "True"], correctIndex: 0, xp: 10,
      okText: '<b>Declaration pattern</b>: <code>is int number</code> тестирует тип nullable-значения и присваивает underlying <code>int</code> в <code>number</code> — доступный только в true-ветке. Печать: <b>has value 12</b>.',
      noText: 'Паттерн <code>is int number</code> одновременно проверяет на null и достаёт <code>int</code>. <code>maybe = 12</code> ⇒ матч ⇒ <code>has value 12</code>. (На <code>null</code> было бы <code>no value</code>.)',
      verify: { kind: "exec", run: "dotnet run", expect: "has value 12" }, sourceRefs: ["ms-pm-overview"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string WaterState(int t) => t switch { &lt; 32 =&gt; "solid", 32 =&gt; "solid/liquid transition", (&gt; 32) and (&lt; 212) =&gt; "liquid", 212 =&gt; "liquid / gas transition", &gt; 212 =&gt; "gas" };</code> — что вернёт <code>WaterState(100)</code>?',
      options: ["liquid", "solid", "gas", "solid/liquid transition"], correctIndex: 0, xp: 10,
      okText: 'Рукава проверяются <b>в порядке текста</b>. <code>100</code> минует <code>&lt; 32</code> и <code>32</code>, попадает в <code>(&gt; 32) and (&lt; 212)</code> — conjunctive <code>and</code> двух relational-паттернов. Результат: <b>liquid</b>.',
      noText: 'Первый совпавший рукав побеждает. <code>&lt; 32</code> и <code>== 32</code> для <code>100</code> ложны; <code>(&gt; 32) and (&lt; 212)</code> истинно ⇒ <b>liquid</b>. До <code>&gt; 212</code> дело не доходит.',
      verify: { kind: "exec", run: "dotnet run", expect: "liquid" }, sourceRefs: ["ms-switch-expr", "ms-pm-overview"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string Name(int n) => n switch { 1 =&gt; "one", 2 =&gt; "two" };</code> (без <code>_</code>-рукава). <code>try { Console.WriteLine(Name(3)); } catch (SwitchExpressionException e) { Console.WriteLine($"threw: {e.GetType().Name}"); }</code> — что напечатает?',
      options: ["threw: SwitchExpressionException", "one", "two", "threw: InvalidOperationException"], correctIndex: 0, xp: 10,
      okText: 'Неполный <code>switch</code>-выражение на непокрытом входе <span class="hl">бросает в рантайме</span>. В .NET Core 3.0+ это <b>SwitchExpressionException</b> — панель exhaustiveness.',
      noText: '<code>Name(3)</code> не совпадает ни с <code>1</code>, ни с <code>2</code>, и <code>_</code>-рукава нет ⇒ рантайм бросает <b>SwitchExpressionException</b> (в .NET Framework — InvalidOperationException, но здесь .NET Core).',
      verify: { kind: "exec", run: "dotnet run", expect: "threw: SwitchExpressionException" }, sourceRefs: ["ms-switch-expr", "ms-switch-exc"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что это", v: 'Pattern matching — <b>тест по признакам</b>, не по значению. <code>is</code> тестирует и объявляет переменную; <code>switch</code> выбирает <span class="hl">первый совпавший</span> паттерн в порядке текста.' },
    { icon: "cost", k: "null безопасно", v: '<code>is int n</code> и <code>is not null</code> — паттерны: минуют перегрузку <code>==</code>, а объявленная переменная живёт <span class="hl">только в true-ветке</span>. Безопаснее, чем <code>== / != null</code>.' },
    { icon: "avoid", k: "Exhaustiveness", v: 'Неполный <code>switch</code>-выражение бросает <b>SwitchExpressionException</b> в рантайме. Discard <code>_</code> делает его exhaustive — компилятор из полноты строит гарантию.' },
  ],

  foot: 'урок · <b>pattern matching: обзор</b> · 5 анимир. разборов · панель exhaustiveness (throw vs discard) · дизайн <b>mid</b>',
};
