/**
 * Lesson: The `is` operator & declaration patterns (CS.S5.is-declaration) — expert density.
 * `is` "checks if the result of an expression is compatible with a given type" and returns
 * a bool; with a declaration pattern (E is T v) it also binds the CONVERTED result to a new
 * variable scoped to the true branch. The senior payoff a level below: a declaration/type
 * pattern NEVER matches null, and one `is int` unwraps two different storage forms — a
 * boxed object AND a nullable value type — to the same underlying int.
 *
 * SIGNATURE machine panel (s5): the two-form unwrap — object iBoxed = 34 and int? j = 42
 * both match `is int` in one && chain and sum to 76. REAL run-csharp measurement
 * (this file's exec cards): 76.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn `is` operator page
 *     (fetch-verified 2026-07-21, ms.date 2026-01-20) + patterns page for scope rule;
 *   - every card's verify.expect is REAL stdout from the backend run-csharp exec cards
 *     (this file's exec cards): "76" / "False" / "True".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.is-declaration/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: is E T → bool (the type-test result lane).
const Z_EXPR: Zone = { id: "expr", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВЫРАЖЕНИЕ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "проверяемое", subCls: "vz-zsub", subY: 47 };
const Z_BOOL: Zone = { id: "bool", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "is → bool", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "true / false", subCls: "vz-zsub heap", subY: 47 };
const IS_BOOL_ZONES: Zone[] = [Z_EXPR, Z_BOOL];

// s2: declaration pattern — test type + bind converted variable.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИСТОЧНИК", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "object greeting", subCls: "vz-zsub", subY: 47 };
const Z_BIND: Zone = { id: "bind", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "СВЯЗАННАЯ ПЕРЕМ.", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "только в true-ветке", subCls: "vz-zsub heap", subY: 47 };
const BIND_ZONES: Zone[] = [Z_SRC, Z_BIND];

// s3: null → false (the declaration pattern rejects null).
const Z_NULLIN: Zone = { id: "nullin", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВХОД null", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "object o = null", subCls: "vz-zsub", subY: 47 };
const Z_NULLR: Zone = { id: "nullr", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "РЕЗУЛЬТАТ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "declaration → false", subCls: "vz-zsub heap", subY: 47 };
const NULL_ZONES: Zone[] = [Z_NULLIN, Z_NULLR];

// s4: scope — variable lives only in the true branch.
const Z_TRUE: Zone = { id: "truez", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "true-ВЕТКА", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "message доступна", subCls: "vz-zsub good", subY: 47 };
const Z_ELSE: Zone = { id: "elsez", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "else / после", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "ошибка компиляции", subCls: "vz-zsub heap", subY: 47 };
const SCOPE_ZONES: Zone[] = [Z_TRUE, Z_ELSE];

// s5 (SIGNATURE): two storage forms unwrapped by one `is int`.
const Z_FORMS: Zone = { id: "forms", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "ДВЕ ФОРМЫ ХРАНЕНИЯ int", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_UNWRAP: Zone = { id: "unwrap", x: 14, y: 130, w: 312, h: 100, cls: "vz-zone good", label: "is int РАСПАКОВЫВАЕТ → a + b", labelCls: "vz-zlabel good sm", lx: 120, ly: 120 };
const UNWRAP_ZONES: Zone[] = [Z_FORMS, Z_UNWRAP];

export const isDeclaration: LessonData = {
  id: "CS.S5.is-declaration",
  track: "CS",
  section: "CS.S5",
  module: "S5.4",
  lang: "csharp",
  title: "is-оператор и declaration patterns",
  kicker: "C# вглубь · S5 · тест типа + bind",
  home: { subtitle: "is bool, declaration/type pattern, null → false, scope", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-is", kind: "doc", org: "Microsoft Learn", title: "The is operator (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/is", date: "2026-01-20" },
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
    { id: "ms-pm-overview", kind: "doc", org: "Microsoft Learn", title: "Pattern matching overview (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching", date: "2025-11-18" },
  ],

  spec: [
    { text: "«The is operator checks if the result of an expression is compatible with a given type.» <span class=\"ru-tr\">«Оператор is проверяет, совместим ли результат выражения с заданным типом.»</span>", source: "ms-is" },
    { text: "«When a declaration pattern matches an expression, it assigns the variable to the converted expression result, as the following example shows:» <span class=\"ru-tr\">«Когда declaration pattern совпадает с выражением, он присваивает переменной приведённый результат выражения, как показано в следующем примере:»</span>", source: "ms-patterns" },
  ],
  edgeCases: [
    { text: "Declaration pattern с типом <code>T</code> матчит, только если результат <b>non-null</b>. <code>object o = null; o is string s</code> → <span class=\"hl\">false</span>.", source: "ms-patterns" },
    { text: "Проверить <b>только тип</b> (без переменной) — discard: <code>is Car _</code>; или type pattern без имени: <code>Car =&gt; ...</code>.", source: "ms-patterns" },
    { text: "<code>is</code> с <code>null</code>: «the compiler guarantees that no user-overloaded <code>==</code> or <code>!=</code> operator is invoked». <span class=\"ru-tr\">«компилятор гарантирует, что не вызывается ни один пользовательский перегруженный оператор <code>==</code> или <code>!=</code>».</span>", source: "ms-is" },
  ],

  misconceptions: [
    {
      wrong: "is TypeName v — это просто короткая запись каста (T)x с проверкой на null",
      hook: 'Каст бросает на несовпадении; <code>is</code> — <span class="hl">возвращает bool</span> и связывает уже <b>converted</b> переменную. Дословно: «The <code>is</code> operator checks if the result of an expression is <b>compatible with a given type</b>». <span class="ru-tr">«Оператор <code>is</code> проверяет, является ли результат выражения <b>совместимым с заданным типом</b>».</span> А declaration pattern связывает переменную уже с <span class="hl">приведённым (converted) результатом</span> — <code>message</code> уже <code>string</code>, без второго каста. И ключевое отличие от <code>as</code>/каста: declaration/type pattern <b>никогда не матчит null</b>. Дальше <b>пять разборов</b> — is→bool, связывание, null→false, область видимости и <b>машинная панель</b>: один <code>is int</code> распаковывает и boxed object, и nullable.',
      source: "ms-is",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "is → bool", title: "is проверяет совместимость типа, возвращает bool",
      viewBox: "0 0 340 210", zones: IS_BOOL_ZONES,
      code: ["object o = \"hi\";", "bool r = o is string;", "// r == true"],
      console: true,
      scenes: [
        { codeLine: 0, caption: '<code>o</code>: compile-time тип <b>object</b>, а фактически хранит <code>string</code>.', nodes: [{ id: "o", kind: "obj", at: { zone: "expr", row: 0 }, typeTag: "o", value: "object→str", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>o is string</code>: проверка <span class="hl">совместимости</span> run-time типа со <code>string</code>. Результат — <b>bool</b>, не значение.', nodes: [{ id: "o", kind: "obj", at: { zone: "expr", row: 0 }, typeTag: "o", value: "object→str" }, { id: "g", kind: "gate", at: { zone: "bool", row: 0 }, state: "ok", label: "is string", detail: "→ true" }], edges: [{ id: "e", from: "o", to: "g", accent: true }] },
        { codeLine: 1, caption: '<code>r == true</code>: <code>is</code> — булев тест типа. Это фундамент, поверх которого работают все паттерны.', nodes: [{ id: "o", kind: "obj", at: { zone: "expr", row: 0 }, typeTag: "o", value: "object→str" }, { id: "g", kind: "gate", at: { zone: "bool", row: 0 }, state: "ok", label: "is string", detail: "→ true" }, { id: "r", kind: "chip", at: { zone: "bool", row: 1 }, value: "bool r = true", accent: true }], edges: [{ id: "e", from: "o", to: "g" }] },
      ],
      explain: 'В основе — булев тест типа: «The <code>is</code> operator checks if the result of an expression is <b>compatible with a given type</b>». <span class="ru-tr">«Оператор <code>is</code> проверяет, является ли результат выражения <b>совместимым с заданным типом</b>».</span> Он же — вход в pattern matching: «You can also use the <code>is</code> operator to <b>match an expression against a pattern</b>». <span class="ru-tr">«Также можно использовать оператор <code>is</code>, чтобы <b>сопоставить выражение с паттерном</b>».</span> Самый частый сценарий — «To check the run-time type of an expression». <span class="ru-tr">«Чтобы проверить тип выражения во время выполнения».</span> Возвращает всегда <code>bool</code>: <code>o is string</code> — это <code>true</code>/<code>false</code>, а не приведённое значение. Значение появляется, когда добавляем declaration pattern (следующий разбор).',
      sources: ["ms-is"],
    },
    {
      id: "s2", num: "02", kicker: "Declaration pattern · bind", title: "is T v: тест типа + связывание converted-результата",
      viewBox: "0 0 340 210", zones: BIND_ZONES,
      code: ["object greeting = \"Hello, World!\";", "if (greeting is string message)", "  Console.WriteLine(message.ToLower());"],
      console: true,
      scenes: [
        { codeLine: 0, caption: '<code>greeting</code> объявлен как <b>object</b>, но хранит строку.', nodes: [{ id: "g", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "greeting", value: "object", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>is string message</code>: тест типа + <span class="hl">связывание</span> converted-результата в <code>message</code> — она уже <code>string</code>.', nodes: [{ id: "g", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "greeting", value: "object" }, { id: "m", kind: "slot", at: { zone: "bind", row: 0 }, name: "message", value: "string", accent: true }], edges: [{ id: "e", from: "g", to: "m", accent: true }] },
        { codeLine: 2, caption: '<code>message.ToLower()</code> зовётся <b>без второго каста</b> — переменная уже нужного типа.', nodes: [{ id: "g", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "greeting", value: "object" }, { id: "m", kind: "slot", at: { zone: "bind", row: 0 }, name: "message", value: "string" }, { id: "call", kind: "chip", at: { zone: "bind", row: 1 }, value: "message.ToLower()", accent: true }], edges: [{ id: "e", from: "g", to: "m" }] },
      ],
      explain: 'Declaration pattern делает два дела за раз: «Use declaration and type patterns to check if the run-time type of an expression is compatible with a given type. By using a declaration pattern, you can also declare a <b>new local variable</b>. When a declaration pattern matches an expression, it assigns the variable to the <span class="hl">converted expression result</span>». <span class="ru-tr">«Используйте declaration- и type-паттерны, чтобы проверить, совместим ли тип выражения во время выполнения с заданным типом. С помощью declaration pattern можно также объявить <b>новую локальную переменную</b>. Когда declaration pattern совпадает с выражением, он присваивает переменной приведённый результат выражения».</span> Отсюда <code>message</code> — уже <code>string</code>, без ручного <code>(string)greeting</code>. Это и безопаснее <code>as</code>: <code>as</code> вернул бы <code>null</code> при несовпадении и отложил NRE, а declaration pattern не входит в тело вовсе.',
      sources: ["ms-patterns", "ms-is"],
    },
    {
      id: "s3", num: "03", kicker: "null → false", title: "Declaration/type pattern не матчит null",
      viewBox: "0 0 340 210", zones: NULL_ZONES,
      code: ["object o = null;", "Console.WriteLine(o is string s);", "// False"],
      predictAt: 1, predictQ: 'Что напечатает <code>o is string s</code>, если <code>o == null</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>object o = null</code>. Проверяем declaration pattern <code>is string s</code>.', nodes: [{ id: "o", kind: "ref", at: { zone: "nullin", row: 0 }, name: "o", value: "null", accent: true }], edges: [] },
        { codeLine: 1, out: "False", caption: 'Паттерн требует <span class="hl">non-null</span> результат. <code>null</code> не совпадает ни с каким declaration/type pattern → <b>False</b> (реальный прогон).', nodes: [{ id: "o", kind: "ref", at: { zone: "nullin", row: 0 }, name: "o", value: "null" }, { id: "g", kind: "gate", at: { zone: "nullr", row: 0 }, state: "fail", label: "is string s", detail: "null → false" }], edges: [{ id: "e", from: "o", to: "g", accent: true }] },
        { codeLine: 1, out: "False", caption: 'Это делает <code>is T v</code> <b>само-охраняющим</b>: вошёл в тело — значит объект точно не null. Отдельная null-проверка не нужна.', nodes: [{ id: "o", kind: "ref", at: { zone: "nullin", row: 0 }, name: "o", value: "null" }, { id: "g", kind: "gate", at: { zone: "nullr", row: 0 }, state: "fail", label: "is string s", detail: "false" }, { id: "safe", kind: "chip", at: { zone: "nullr", row: 1 }, value: "guard от null встроен", accent: true }], edges: [{ id: "e", from: "o", to: "g" }] },
      ],
      explain: 'Ключевое свойство: «A <b>declaration pattern</b> with type <code>T</code> matches an expression when an expression result is <span class="hl">non-null</span>» <span class="ru-tr">«<b>Declaration pattern</b> с типом <code>T</code> совпадает с выражением, когда результат выражения не равен null».</span> — то есть <code>null</code> отсекается всегда. Обзор это подчёркивает: «The declaration pattern <b>doesn\'t match a null value</b>, regardless of the compile-time type of the variable». <span class="ru-tr">«Declaration pattern <b>не совпадает со значением null</b>, независимо от типа переменной во время компиляции».</span> Прогон подтверждает: <code>o is string s</code> при <code>o == null</code> → <code>False</code>. Практический вывод: <code>if (x is T v)</code> одновременно проверяет тип И не-null; попал в тело — <code>v</code> гарантированно не null.',
      sources: ["ms-patterns", "ms-pm-overview"],
    },
    {
      id: "s4", num: "04", kicker: "Область видимости", title: "Связанная переменная живёт только в true-ветке",
      viewBox: "0 0 340 210", zones: SCOPE_ZONES,
      code: ["if (greeting is string message)", "  Use(message);        // ok", "else Use(message);       // ошибка!", "Use(message);            // ошибка!"],
      scenes: [
        { codeLine: 1, caption: '<code>message</code> доступна и присвоена <span class="hl">только в true-ветке</span> if.', nodes: [{ id: "ok", kind: "gate", at: { zone: "truez", row: 0 }, state: "ok", label: "message", detail: "доступна" }], edges: [] },
        { codeLine: 2, caption: 'В <code>else</code> обращение к <code>message</code> — <b>ошибка компиляции</b>: там паттерн не совпал, значит переменная не присвоена.', nodes: [{ id: "ok", kind: "gate", at: { zone: "truez", row: 0 }, state: "ok", label: "message", detail: "доступна" }, { id: "no", kind: "gate", at: { zone: "elsez", row: 0 }, state: "fail", label: "else: message", detail: "не присвоена", }], edges: [] },
        { codeLine: 3, caption: 'После блока — тоже <b>ошибка</b>. Это языковое правило, «safer than many others» <span class="ru-tr">«безопаснее многих других»</span>: нельзя случайно прочитать неприсвоенную переменную.', nodes: [{ id: "ok", kind: "gate", at: { zone: "truez", row: 0 }, state: "ok", label: "message", detail: "true-ветка" }, { id: "no", kind: "gate", at: { zone: "elsez", row: 0 }, state: "fail", label: "after: message", detail: "compile error", accent: true }], edges: [] },
      ],
      explain: 'Область видимости связанной переменной — часть безопасности паттерна: «The language rules make this technique <b>safer than many others</b>. The variable <code>number</code> is only accessible and assigned in the <span class="hl">true portion</span> of the <code>if</code> clause. If you try to access it elsewhere, either in the <code>else</code> clause, or after the <code>if</code> block, the compiler issues an <b>error</b>». <span class="ru-tr">«Правила языка делают этот приём <b>безопаснее многих других</b>. Переменная <code>number</code> доступна и присвоена только в true-части предложения <code>if</code>. Если попытаться обратиться к ней где-либо ещё — в предложении <code>else</code> или после блока <code>if</code>, — компилятор выдаёт <b>ошибку</b>».</span> То есть компилятор не даст прочитать <code>message</code> там, где паттерн мог не совпасть. Это не стиль, а гарантия: переменная существует ровно там, где она точно присвоена и не-null.',
      sources: ["ms-pm-overview"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · две формы, один is int", title: "boxed object и nullable int — оба матчат is int",
      viewBox: "0 0 340 238", zones: UNWRAP_ZONES,
      code: ["int i = 34; object iBoxed = i;", "int? jNullable = 42;", "if (iBoxed is int a && jNullable is int b)", "  Console.WriteLine(a + b);   // 76"],
      predictAt: 2, predictQ: 'Что напечатает <code>a + b</code>, если <code>iBoxed</code> — boxed 34, а <code>jNullable</code> = 42?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>iBoxed</code> — <b>boxed int</b> в куче (object), <code>jNullable</code> — <b>Nullable&lt;int&gt;</b> со значением. Две разные формы хранения int.', nodes: [{ id: "bx", kind: "obj", at: { zone: "forms", row: 0, col: 0 }, typeTag: "iBoxed", value: "boxed 34", accent: true }, { id: "nl", kind: "obj", at: { zone: "forms", row: 0, col: 1 }, typeTag: "jNullable", value: "int? 42" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>iBoxed is int a</code>: unboxing-конверсия к <code>int</code> → матч, <code>a = 34</code>. Одна форма распакована.', nodes: [{ id: "bx", kind: "obj", at: { zone: "forms", row: 0, col: 0 }, typeTag: "iBoxed", value: "boxed 34", accent: true }, { id: "nl", kind: "obj", at: { zone: "forms", row: 0, col: 1 }, typeTag: "jNullable", value: "int? 42" }, { id: "a", kind: "gate", at: { zone: "unwrap", row: 0 }, state: "ok", label: "is int a", detail: "a = 34" }], edges: [{ id: "e1", from: "bx", to: "a", accent: true }] },
        { codeLine: 3, out: "76", caption: '<code>jNullable is int b</code>: <code>Nullable&lt;int&gt;</code> с <code>HasValue==true</code> → матч, <code>b = 42</code>. <span class="hl">Один <code>is int</code> распаковал обе формы</span> → <b>76</b> (реальный прогон).', nodes: [{ id: "bx", kind: "obj", at: { zone: "forms", row: 0, col: 0 }, typeTag: "iBoxed", value: "→ 34" }, { id: "nl", kind: "obj", at: { zone: "forms", row: 0, col: 1 }, typeTag: "jNullable", value: "→ 42", accent: true }, { id: "b", kind: "gate", at: { zone: "unwrap", row: 0 }, state: "ok", label: "a + b", detail: "34 + 42 = 76" }], edges: [{ id: "e2", from: "nl", to: "b", accent: true }] },
      ],
      explain: 'Это машинная панель урока — один declaration pattern распаковывает две формы хранения, снято прогоном. Правила матча <code>is T</code> покрывают обе: nullable — «The run-time type of an expression result is a <b>nullable value type</b> with the underlying type <code>T</code> and the <code>Nullable&lt;T&gt;.HasValue</code> is <code>true</code>» <span class="ru-tr">«Тип результата выражения во время выполнения — <b>nullable-значимый тип</b> с базовым типом <code>T</code>, и <code>Nullable&lt;T&gt;.HasValue</code> равно <code>true</code>».</span>; boxed — «A <b>boxing or unboxing conversion</b> exists from the run-time type of an expression result to type <code>T</code>». <span class="ru-tr">«Существует <b>преобразование упаковки или распаковки</b> из типа результата выражения во время выполнения в тип <code>T</code>».</span> Поэтому <code>iBoxed is int a</code> (unbox) и <code>jNullable is int b</code> (nullable→underlying) оба истинны, а <code>a + b = 76</code>. Один паттерн, две дороги к <code>int</code> — обе встроенные, без user-defined конверсий.',
      sources: ["ms-patterns", "ms-is"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int i = 34; object iBoxed = i; int? jNullable = 42;</code><br/><code>if (iBoxed is int a &amp;&amp; jNullable is int b) Console.WriteLine(a + b);</code> — что напечатает?',
      options: ["76", "34", "42", "0"], correctIndex: 0, xp: 10,
      okText: 'Один <code>is int</code> распаковывает <b>обе формы</b>: <code>iBoxed</code> — через unboxing-конверсию (a=34), <code>jNullable</code> — как <code>Nullable&lt;int&gt;</code> с <code>HasValue==true</code> (b=42). Сумма: <b>76</b>.',
      noText: 'Declaration pattern <code>is int</code> матчит и boxed object, и nullable value type (правила матча: boxing/unboxing + nullable underlying). <code>34 + 42 = <b>76</b></code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "76" }, sourceRefs: ["ms-patterns", "ms-is"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>object o = null; Console.WriteLine(o is string s);</code> — что напечатает?',
      options: ["False", "True", "null", "\"\""], correctIndex: 0, xp: 10,
      okText: 'Declaration/type pattern требует <span class="hl">non-null</span> результат. <code>o == null</code> не совпадает ни с каким declaration pattern → <b>False</b>. <code>is T v</code> само-охраняет от null.',
      noText: '«The declaration pattern doesn\'t match a null value, regardless of the compile-time type». <span class="ru-tr">«Declaration pattern не совпадает со значением null, независимо от типа во время компиляции».</span> <code>null is string s</code> ⇒ <b>False</b>. Именно поэтому вход в <code>if (x is T v)</code> гарантирует не-null.',
      verify: { kind: "exec", run: "dotnet run", expect: "False" }, sourceRefs: ["ms-pm-overview", "ms-patterns"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>object o = "hi"; bool r = o is string; Console.WriteLine(r);</code> — что напечатает?',
      options: ["True", "False", "hi", "string"], correctIndex: 0, xp: 10,
      okText: '<code>is</code> — булев тест совместимости типа. Run-time тип <code>o</code> — <code>string</code>, совместим со <code>string</code> → <b>True</b>. Результат <code>is</code> — всегда <code>bool</code>, не приведённое значение.',
      noText: '«The <code>is</code> operator checks if the result of an expression is compatible with a given type» <span class="ru-tr">«Оператор <code>is</code> проверяет, совместим ли результат выражения с заданным типом»</span> и возвращает <code>bool</code>. Здесь совместимо ⇒ <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["ms-is"],
    },
  ],

  takeaways: [
    { icon: "why", k: "is → bool + bind", v: '<code>is</code> проверяет <b>совместимость типа</b> и возвращает <code>bool</code>. Declaration pattern <code>is T v</code> добавляет связывание <span class="hl">converted-результата</span> — переменная уже нужного типа, без второго каста.' },
    { icon: "cost", k: "null никогда не матчит", v: 'Declaration/type pattern требует <b>non-null</b>: <code>null is string s</code> = <code>false</code>. Вошёл в <code>if (x is T v)</code> — объект гарантированно не null. Встроенный guard.' },
    { icon: "avoid", k: "Область видимости", v: 'Связанная переменная доступна <span class="hl">только в true-ветке</span>. В else и после блока — ошибка компиляции: нельзя прочитать возможно-неприсвоенную переменную.' },
  ],

  foot: 'урок · <b>is-оператор и declaration patterns</b> · 5 анимир. разборов · панель распаковки двух форм (76) · дизайн <b>mid</b>',
};
