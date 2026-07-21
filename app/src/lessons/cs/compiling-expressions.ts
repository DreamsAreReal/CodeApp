/**
 * Lesson: Compiling & executing expression trees (CS.S11.compiling-expressions) — expert density,
 * 5 animated deep-dives. An expression tree is DATA, not executable code — to run the .NET code it
 * represents you must convert it into IL. LambdaExpression.Compile() does exactly that: it produces
 * a Delegate you then invoke. Only trees that represent lambda expressions (LambdaExpression or
 * Expression<TDelegate>) can be executed. When the delegate type is known, Expression<TDelegate>.
 * Compile() returns the strongly-typed delegate; when only LambdaExpression is in hand, Compile()
 * returns the base Delegate and you call DynamicInvoke. The compiled delegate can be retained and
 * reused — no need to recompile the (immutable) tree each call.
 *
 * SIGNATURE machine panel (s5): an UNTYPED LambdaExpression (n => n * 3) — Compile() gives a base
 * Delegate, DynamicInvoke(7) yields 21 (REAL run-csharp measurement, this file's exec cards, :5080).
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../expression-trees/expression-trees-execution (ms.date 2023-03-06) and
 * learn.microsoft.com/.../api/system.linq.expressions.lambdaexpression.compile (ms.date 2025-07-01),
 * fetched + substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from one of those pages (per-item sources[] name each page);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "3" · c2 "True False" · c3 "21".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.compiling-expressions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: tree is data, not code — Compile converts to IL.
const Z_DATA: Zone = { id: "data", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕРЕВО = ДАННЫЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не исполняемо", subCls: "vz-zsub", subY: 47 };
const Z_IL: Zone = { id: "il", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Compile() → IL", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "делегат исполним", subCls: "vz-zsub good", subY: 47 };
const DATA_ZONES: Zone[] = [Z_DATA, Z_IL];

// s2: Compile -> delegate -> invoke (add example).
const Z_LAM: Zone = { id: "lam", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "Expression<Func<int>> → Compile() → invoke", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "add.Compile()()", subCls: "vz-zsub", subY: 47 };
const LAM_ZONES: Zone[] = [Z_LAM];

// s3: only lambda-expression trees can be executed.
const Z_YES: Zone = { id: "yes", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "МОЖНО ИСПОЛНИТЬ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Lambda / Expression<T>", subCls: "vz-zsub good", subY: 47 };
const Z_NO: Zone = { id: "no", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕЛЬЗЯ НАПРЯМУЮ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Constant, Binary…", subCls: "vz-zsub heap", subY: 47 };
const EXEC_ZONES: Zone[] = [Z_YES, Z_NO];

// s4: typed vs untyped — Compile() return, cast vs DynamicInvoke.
const Z_TYPED: Zone = { id: "typed", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Expression<TDelegate>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "типизированный делегат", subCls: "vz-zsub good", subY: 47 };
const Z_UNTYPED: Zone = { id: "untyped", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "LambdaExpression", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "Delegate → DynamicInvoke", subCls: "vz-zsub", subY: 47 };
const TYPE_ZONES: Zone[] = [Z_TYPED, Z_UNTYPED];

// s5 (SIGNATURE): untyped n => n*3, DynamicInvoke.
const Z_UT: Zone = { id: "ut", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЕЗ ТИПА ДЕЛЕГАТА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "LambdaExpression", subCls: "vz-zsub", subY: 47 };
const Z_DINV: Zone = { id: "dinv", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "DynamicInvoke(7)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "= 21", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_UT, Z_DINV];

export const compilingExpressions: LessonData = {
  id: "CS.S11.compiling-expressions",
  track: "CS",
  section: "CS.S11",
  module: "S11.3",
  lang: "csharp",
  title: "Компиляция и исполнение деревьев",
  kicker: "C# вглубь · S11 · дерево → делегат",
  home: { subtitle: "LambdaExpression.Compile() → делегат, invoke vs DynamicInvoke, что исполнимо", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-exec", kind: "doc", org: "Microsoft Learn", title: "Executing Expression Trees (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-execution", date: "2023-03-06" },
    { id: "ms-compile", kind: "doc", org: "Microsoft Learn", title: "LambdaExpression.Compile Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.linq.expressions.lambdaexpression.compile", date: "2025-07-01" },
  ],

  spec: [
    { text: "«An <i>expression tree</i> is a data structure that represents some code. <span class=\"hl\">It isn't compiled and executable code</span>. If you want to execute the .NET code represented by an expression tree, you must convert it into executable IL instructions.» <span class=\"ru-tr\">«Дерево выражения — это структура данных, представляющая некоторый код. Это не скомпилированный исполняемый код. Чтобы выполнить .NET-код, представленный деревом выражения, его нужно преобразовать в исполняемые IL-инструкции.»</span>", source: "ms-exec" },
  ],
  edgeCases: [
    { text: "Исполнимы <b>только</b> лямбда-деревья: «<span class=\"hl\">Only expression trees that represent lambda expressions can be executed</span>. Expression trees that represent lambda expressions are of type <code>LambdaExpression</code> or <code>Expression&lt;TDelegate&gt;</code>». <span class=\"ru-tr\">«Исполнить можно только деревья выражений, представляющие лямбда-выражения. Такие деревья имеют тип <code>LambdaExpression</code> или <code>Expression&lt;TDelegate&gt;</code>».</span>", source: "ms-exec" },
    { text: "<code>Compile</code> возвращает <b>слабо</b>типизированный делегат: «The <code>LambdaExpression.Compile()</code> method returns the <code>Delegate</code> type. You have to <span class=\"hl\">cast it to the correct delegate type</span> to have any compile-time tools check the argument list or return type». <span class=\"ru-tr\">«Метод <code>LambdaExpression.Compile()</code> возвращает тип <code>Delegate</code>. Его нужно привести к правильному типу делегата, чтобы инструменты этапа компиляции проверяли список аргументов и тип возврата».</span>", source: "ms-exec" },
    { text: "Компилируй <b>один раз</b>, храни делегат: «You can retain the handle to that delegate and invoke it later. <span class=\"hl\">You don't need to compile the expression tree each time</span> you want to execute the code it represents». <span class=\"ru-tr\">«Можно сохранить ссылку на этот делегат и вызывать его позже. Не нужно компилировать дерево выражения каждый раз, когда хотите выполнить код, который оно представляет».</span>", source: "ms-exec" },
  ],

  misconceptions: [
    {
      wrong: "дерево выражения — уже исполняемый код, его можно просто «вызвать» без всякой компиляции",
      hook: 'Ловушка: <span class="wrong">дерево = исполняемый код, вызывай напрямую</span>. Нет — дерево это <b>данные</b>: «An expression tree is a data structure that represents some code. <span class="hl">It isn\'t compiled and executable code</span>. If you want to execute the .NET code represented by an expression tree, you must convert it into executable IL instructions». <span class="ru-tr">«Дерево выражения — структура данных, представляющая код. Это не скомпилированный исполняемый код. Чтобы выполнить .NET-код, представленный деревом, его нужно преобразовать в исполняемые IL-инструкции».</span> Преобразует <code>Compile</code>: «To execute these expression trees, call the <span class="hl">Compile</span> method to create an executable delegate, and then invoke the delegate». <span class="ru-tr">«Чтобы исполнить эти деревья, вызовите метод <code>Compile</code>, чтобы создать исполняемый делегат, и затем вызовите делегат».</span> И исполнимы не любые деревья: «Only expression trees that represent lambda expressions can be executed». <span class="ru-tr">«Исполнить можно только деревья, представляющие лямбда-выражения».</span> Ниже <b>пять разборов</b> и <b>машинная панель</b>: <code>LambdaExpression</code> без типа делегата — <code>Compile()</code> даёт базовый <code>Delegate</code>, <code>DynamicInvoke(7)</code> = <code>21</code> (реальный прогон).',
      source: "ms-exec",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Данные, не код", title: "Дерево не исполняемо — Compile() переводит его в IL",
      viewBox: "0 0 340 210", zones: DATA_ZONES,
      code: ["Expression<Func<int>> add = () => 1 + 2;", "// add — ДАННЫЕ: дерево, не исполняемый код", "var func = add.Compile();  // дерево → IL → делегат"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>add</code> — это <span class="hl">структура-данные</span>, а не код. «It isn\'t compiled and executable code». <span class="ru-tr">«Это не скомпилированный исполняемый код».</span>', nodes: [{ id: "d", kind: "obj", at: { zone: "data", row: 0 }, typeTag: "Expression<Func>", value: "дерево", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Compile</code> «convert it into <span class="hl">executable IL instructions</span>» <span class="ru-tr">«преобразует его в исполняемые IL-инструкции»</span> — рождается делегат.', nodes: [{ id: "d", kind: "obj", at: { zone: "data", row: 0 }, typeTag: "дерево", value: "данные" }, { id: "il", kind: "gate", at: { zone: "il", row: 0 }, state: "ok", label: "Compile()", detail: "→ делегат", accent: true }], edges: [{ id: "e", from: "d", to: "il", accent: true }] },
        { codeLine: 2, out: "", caption: 'Только после этого код можно исполнить: делегат <code>func</code> держит скомпилированный IL. Дерево само по себе <b>не бежит</b>.', nodes: [{ id: "il", kind: "gate", at: { zone: "il", row: 0 }, state: "ok", label: "func = делегат", detail: "исполним", accent: true }], edges: [] },
      ],
      explain: 'Фундамент урока: дерево — не код. Дословно: «An <i>expression tree</i> is a data structure that represents some code. <span class="hl">It isn\'t compiled and executable code</span>. If you want to execute the .NET code represented by an expression tree, you must convert it into executable IL instructions». <span class="ru-tr">«Дерево выражения — структура данных, представляющая код. Это не скомпилированный исполняемый код. Чтобы выполнить .NET-код, представленный деревом, его нужно преобразовать в исполняемые IL-инструкции».</span> Инструмент преобразования — <code>Compile</code>: «The <code>Compile</code> method creates a delegate». <span class="ru-tr">«Метод <code>Compile</code> создаёт делегат».</span> Из справки API: «<span class="hl">Produces a delegate that represents the lambda expression</span>». <span class="ru-tr">«Порождает делегат, представляющий лямбда-выражение».</span> После <code>Compile()</code> в руках обычный .NET-делегат со скомпилированным IL — его и вызывают.',
      sources: ["ms-exec", "ms-compile"],
    },
    {
      id: "s2", num: "02", kicker: "Compile → invoke", title: "add.Compile() даёт делегат; func() исполняет код",
      viewBox: "0 0 340 210", zones: LAM_ZONES,
      code: ["Expression<Func<int>> add = () => 1 + 2;", "var func = add.Compile();  // Create Delegate", "var answer = func();       // Invoke Delegate", "Console.WriteLine(answer);"],
      predictAt: 1, predictQ: 'Дерево <code>add = () =&gt; 1 + 2</code> скомпилировано в делегат <code>func = add.Compile()</code>. Что напечатает <code>Console.WriteLine(func())</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>add.Compile()</code> — «Create Delegate»: <span class="hl">создаёт делегат</span> из дерева. Пока ничего не исполнено.', nodes: [{ id: "l", kind: "gate", at: { zone: "lam", row: 0 }, state: "ok", label: "add.Compile()", detail: "делегат func", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>func()</code> — «Invoke Delegate»: <span class="hl">вызов</span> исполняет скомпилированный код. <code>() =&gt; 1 + 2</code> → результат.', nodes: [{ id: "l", kind: "gate", at: { zone: "lam", row: 0 }, state: "ok", label: "func()", detail: "исполнение", accent: true }], edges: [] },
        { codeLine: 3, out: "3", caption: 'Панель: <span class="hl">3</span> (реальный прогон). «You execute the code by <span class="hl">invoking the delegate created when you called</span> <code>LambdaExpression.Compile()</code>». <span class="ru-tr">«Код исполняется вызовом делегата, созданного при вызове <code>LambdaExpression.Compile()</code>».</span>', nodes: [{ id: "r", kind: "gate", at: { zone: "lam", row: 0 }, state: "ok", label: "answer", detail: "3", accent: true }], edges: [] },
      ],
      explain: 'Два шага исполнения из доки: «You would convert an expression into a delegate <span class="hl">using the following code</span>:» <span class="ru-tr">«Преобразовать выражение в делегат можно следующим кодом:»</span> — а код там такой: <code>var func = add.Compile(); // Create Delegate</code> и <code>var answer = func(); // Invoke Delegate</code>. Явно про исполнение: «You execute the code by <span class="hl">invoking the delegate created when you called</span> <code>LambdaExpression.Compile()</code>. The preceding code, <code>add.Compile()</code>, returns a delegate. You invoke that delegate by calling <code>func()</code>, which executes the code». <span class="ru-tr">«Код исполняется вызовом делегата, созданного при вызове <code>LambdaExpression.Compile()</code>. Код <code>add.Compile()</code> возвращает делегат. Вы вызываете этот делегат через <code>func()</code>, что и исполняет код».</span> Для <code>() =&gt; 1 + 2</code> результат — <code>3</code>. Простая связка: скомпилировать → вызвать.',
      sources: ["ms-exec"],
    },
    {
      id: "s3", num: "03", kicker: "Что исполнимо", title: "Только лямбда-деревья; лист-константу не исполнить",
      viewBox: "0 0 340 210", zones: EXEC_ZONES,
      code: ["// исполнимо: LambdaExpression / Expression<TDelegate>", "Expression<Func<int,bool>> ok = num => num < 5;  // ✓", "// НЕ исполнимо напрямую: ConstantExpression, BinaryExpression…", "// оборачивай в лямбду: Expression.Lambda(body, params)"],
      scenes: [
        { codeLine: 1, out: "", caption: '«<span class="hl">Only expression trees that represent lambda expressions can be executed</span>». <span class="ru-tr">«Исполнить можно только деревья, представляющие лямбда-выражения».</span> Тип — <code>Lambda</code> или <code>Expression&lt;T&gt;</code>.', nodes: [{ id: "y", kind: "gate", at: { zone: "yes", row: 0 }, state: "ok", label: "Expression<Func>", detail: "исполним", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Лист сам по себе исполнить нельзя: <code>ConstantExpression</code>, <code>BinaryExpression</code> — не лямбды. «Other expression types <span class="hl">can\'t be directly converted into code</span>». <span class="ru-tr">«Другие типы выражений нельзя напрямую преобразовать в код».</span>', nodes: [{ id: "y", kind: "gate", at: { zone: "yes", row: 0 }, state: "ok", label: "Lambda", detail: "исполним" }, { id: "n", kind: "gate", at: { zone: "no", row: 0 }, state: "fail", label: "Constant / Binary", detail: "не лямбда", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Лечится обёрткой: «create a new lambda expression that has the original expression tree as its <span class="hl">body</span>» <span class="ru-tr">«создать новую лямбду, где исходное дерево — тело»</span> через <code>Expression.Lambda(body, params)</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "no", row: 0 }, state: "fail", label: "Binary" }, { id: "w", kind: "gate", at: { zone: "yes", row: 0 }, state: "ok", label: "Lambda(body)", detail: "обёртка → исполним", accent: true }], edges: [{ id: "e", from: "n", to: "w", accent: true }] },
      ],
      explain: 'Не любое дерево исполнимо — только лямбда. Дословно: «Only expression trees that represent lambda expressions can be executed. Expression trees that represent lambda expressions are of type <code>LambdaExpression</code> or <code>Expression&lt;TDelegate&gt;</code>». <span class="ru-tr">«Исполнить можно только деревья, представляющие лямбда-выражения. Такие деревья имеют тип <code>LambdaExpression</code> или <code>Expression&lt;TDelegate&gt;</code>».</span> Почему: «You can convert any <code>LambdaExpression</code>, or any type derived from <code>LambdaExpression</code> into executable IL. <span class="hl">Other expression types can\'t be directly converted into code</span>». <span class="ru-tr">«Любой <code>LambdaExpression</code> или производный тип можно преобразовать в исполняемый IL. Другие типы выражений нельзя напрямую преобразовать в код».</span> Если в руках, скажем, <code>BinaryExpression</code>, дока советует: «you can create a new lambda expression that has the original expression tree as its body, by calling the <code>Lambda&lt;TDelegate&gt;</code>… method». <span class="ru-tr">«можно создать новую лямбду, у которой исходное дерево — тело, вызвав метод <code>Lambda&lt;TDelegate&gt;</code>».</span> Обернул в <code>Lambda</code> — стало исполнимым.',
      sources: ["ms-exec"],
    },
    {
      id: "s4", num: "04", kicker: "Типизированный vs нет", title: "Expression<TDelegate> — cast готов; LambdaExpression — DynamicInvoke",
      viewBox: "0 0 340 210", zones: TYPE_ZONES,
      code: ["Expression<Func<int,bool>> t = num => num < 5;", "Func<int,bool> f = t.Compile();   // уже нужного типа", "LambdaExpression le = ...;         // тип делегата НЕизвестен", "le.Compile().DynamicInvoke(7);     // зовём DynamicInvoke"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>Expression&lt;Func&lt;int,bool&gt;&gt;.Compile()</code> возвращает уже <span class="hl">типизированный</span> <code>Func&lt;int,bool&gt;</code> — вызывай как <code>f(4)</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "typed", row: 0 }, state: "ok", label: "t.Compile()", detail: "Func<int,bool>", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>LambdaExpression.Compile()</code> возвращает базовый <code>Delegate</code>: «You have to <span class="hl">cast it to the correct delegate type</span>». <span class="ru-tr">«Его нужно привести к правильному типу делегата».</span>', nodes: [{ id: "t", kind: "gate", at: { zone: "typed", row: 0 }, state: "ok", label: "Func", detail: "готов" }, { id: "u", kind: "gate", at: { zone: "untyped", row: 0 }, state: "ok", label: "Compile()", detail: "Delegate", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Если тип неизвестен — «call the <code><span class="hl">DynamicInvoke</span></code> method on the delegate <b>instead of invoking it directly</b>». <span class="ru-tr">«вызовите <code>DynamicInvoke</code> вместо прямого вызова».</span>', nodes: [{ id: "u", kind: "gate", at: { zone: "untyped", row: 0 }, state: "ok", label: "DynamicInvoke(7)", detail: "поздний вызов", accent: true }], edges: [] },
      ],
      explain: 'Что вернёт <code>Compile()</code> — зависит от статического типа. У <code>Expression&lt;TDelegate&gt;</code> он вернёт нужный делегат (это его перегрузка <code>Compile()</code> в generic-типе). У безтипового <code>LambdaExpression</code> — базовый <code>Delegate</code>: «The <code>LambdaExpression.Compile()</code> method returns the <code>Delegate</code> type. You have to <span class="hl">cast it to the correct delegate type</span> to have any compile-time tools check the argument list or return type». <span class="ru-tr">«Метод <code>LambdaExpression.Compile()</code> возвращает тип <code>Delegate</code>. Его нужно привести к правильному типу делегата, чтобы инструменты этапа компиляции проверяли список аргументов и тип возврата».</span> А если тип делегата неизвестен вовсе: «If the type of the delegate is not known… call the <code>DynamicInvoke</code> method on the delegate <span class="hl">instead of invoking it directly</span>». <span class="ru-tr">«Если тип делегата неизвестен… вызовите метод <code>DynamicInvoke</code> вместо прямого вызова».</span> <code>DynamicInvoke</code> биндит аргументы в рантайме — медленнее, но не требует знать сигнатуру.',
      sources: ["ms-exec"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Безтиповый LambdaExpression: Compile() + DynamicInvoke(7) = 21",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var n = Expression.Parameter(typeof(int), \"n\");", "LambdaExpression le = Expression.Lambda(", "    Expression.Multiply(n, Expression.Constant(3)), n);", "Delegate d = le.Compile();      // базовый Delegate", "Console.WriteLine(d.DynamicInvoke(7));   // 21"],
      predictAt: 3, predictQ: 'Безтиповый <code>LambdaExpression</code> для <code>n =&gt; n * 3</code>. <code>Compile()</code> даёт <code>Delegate</code>. Что напечатает <code>d.DynamicInvoke(7)</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Собрано <code>n =&gt; n * 3</code> как <b>безтиповый</b> <code>LambdaExpression</code> (без <code>&lt;Func&lt;&gt;&gt;</code>) — тип делегата не задан.', nodes: [{ id: "u", kind: "obj", at: { zone: "ut", row: 0 }, typeTag: "LambdaExpression", value: "n => n * 3", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>le.Compile()</code> возвращает <span class="hl">базовый Delegate</span>, не <code>Func&lt;int,int&gt;</code>. Прямо вызвать типизированно нельзя.', nodes: [{ id: "u", kind: "obj", at: { zone: "ut", row: 0 }, typeTag: "LambdaExpression", value: "n => n * 3" }, { id: "d", kind: "gate", at: { zone: "dinv", row: 0 }, state: "ok", label: "Compile()", detail: "Delegate", accent: true }], edges: [{ id: "e", from: "u", to: "d", accent: true }] },
        { codeLine: 4, out: "21", caption: 'Панель: <span class="hl">21</span> (реальный прогон). <code>DynamicInvoke(7)</code> исполняет <code>7 * 3 = 21</code> — вызов без знания сигнатуры на компиляции.', nodes: [{ id: "d", kind: "gate", at: { zone: "dinv", row: 0 }, state: "ok", label: "DynamicInvoke(7)", detail: "21", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — <b>безтиповый</b> путь. Дерево <code>n =&gt; n * 3</code> собрано через <code>Expression.Lambda(body, n)</code> <b>без</b> <code>&lt;Func&lt;int,int&gt;&gt;</code>, поэтому статический тип — <code>LambdaExpression</code>, а <code>Compile()</code> отдаёт базовый <code>Delegate</code>. Здесь и применяется правило доки: «If the type of the delegate is not known… call the <code>DynamicInvoke</code> method on the delegate instead of invoking it directly». <span class="ru-tr">«Если тип делегата неизвестен… вызовите <code>DynamicInvoke</code> вместо прямого вызова».</span> Реальный вывод: <code>d.DynamicInvoke(7)</code> = <code>21</code>. Плюс важное свойство исполнения — <b>кешируемость</b>: «You can retain the handle to that delegate and invoke it later. <span class="hl">You don\'t need to compile the expression tree each time</span> you want to execute the code it represents». <span class="ru-tr">«Можно сохранить ссылку на делегат и вызывать позже. Не нужно компилировать дерево каждый раз».</span> Скомпилировал раз — вызывай сколько угодно.',
      sources: ["ms-exec"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int&gt;&gt; add = () =&gt; 1 + 2; var func = add.Compile(); var answer = func(); Console.WriteLine(answer);</code> — что напечатает?',
      options: ["3", "() => 1 + 2", "1 + 2", "0"], correctIndex: 0, xp: 10,
      okText: '<code>add.Compile()</code> создаёт делегат из дерева, <code>func()</code> исполняет его: <code>1+2</code> = <b>3</b>. «Create Delegate… Invoke Delegate». <span class="ru-tr">«Создать делегат… Вызвать делегат».</span>',
      noText: 'Дерево — данные; <code>Compile()</code> «convert it into executable IL». <span class="ru-tr">«преобразует в исполняемый IL».</span> Вызов делегата даёт <b>3</b>, а не строку.',
      verify: { kind: "exec", run: "dotnet run", expect: "3" }, sourceRefs: ["ms-exec"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; expr = num =&gt; num &lt; 5; Func&lt;int,bool&gt; result = expr.Compile(); Console.WriteLine($"{result(4)} {result(9)}");</code> — что напечатает?',
      options: ["True False", "False True", "4 9", "True True"], correctIndex: 0, xp: 10,
      okText: '<code>Expression&lt;Func&lt;int,bool&gt;&gt;.Compile()</code> возвращает уже типизированный <code>Func&lt;int,bool&gt;</code>. <code>result(4)</code> → <code>4&lt;5</code>=<b>True</b>, <code>result(9)</code> → <b>False</b>. Вывод: <b>True False</b>.',
      noText: 'У generic <code>Expression&lt;TDelegate&gt;</code> <code>Compile()</code> отдаёт нужный делегат без каста. <code>result(4)=True</code>, <code>result(9)=False</code> → <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-exec"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var n = Expression.Parameter(typeof(int), "n"); LambdaExpression le = Expression.Lambda(Expression.Multiply(n, Expression.Constant(3)), n); Delegate d = le.Compile(); Console.WriteLine(d.DynamicInvoke(7));</code> — что напечатает?',
      options: ["21", "n => (n * 3)", "10", "System.Delegate"], correctIndex: 0, xp: 10,
      okText: 'Безтиповый <code>LambdaExpression.Compile()</code> даёт базовый <code>Delegate</code>. Когда тип делегата неизвестен — зовут <code>DynamicInvoke</code>: <code>7 * 3</code> = <b>21</b>.',
      noText: '«If the type of the delegate is not known… call the <code>DynamicInvoke</code> method». <span class="ru-tr">«Если тип делегата неизвестен… вызовите <code>DynamicInvoke</code>».</span> <code>DynamicInvoke(7)</code> исполняет <code>7*3</code> → <b>21</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "21" }, sourceRefs: ["ms-exec"],
    },
  ],

  takeaways: [
    { icon: "why", k: "дерево → IL", v: '«It isn\'t compiled and executable code… you must convert it into <span class="hl">executable IL instructions</span>». <span class="ru-tr">«Это не исполняемый код… нужно преобразовать в исполняемые IL-инструкции».</span> <code>Compile</code> «Produces a delegate that represents the lambda expression». <span class="ru-tr">«Порождает делегат, представляющий лямбда-выражение».</span> Замер: <code>3</code>.' },
    { icon: "cost", k: "invoke vs DynamicInvoke", v: '<code>Expression&lt;TDelegate&gt;.Compile()</code> → типизированный делегат (замер <code>True False</code>). Безтиповый <code>LambdaExpression.Compile()</code> → базовый <code>Delegate</code>: «call the <code>DynamicInvoke</code> method… instead of invoking it directly». <span class="ru-tr">«вызовите <code>DynamicInvoke</code>… вместо прямого вызова».</span> Замер: <code>21</code>.' },
    { icon: "avoid", k: "только лямбды, кешируй", v: '«Only expression trees that represent lambda expressions can be executed». <span class="ru-tr">«Исполнимы только деревья лямбд».</span> Лист оборачивай в <code>Lambda(body)</code>. И «You don\'t need to compile the expression tree each time». <span class="ru-tr">«Не нужно компилировать дерево каждый раз».</span> — храни делегат.' },
  ],

  foot: 'урок · <b>компиляция и исполнение деревьев</b> · 5 анимир. разборов · панель DynamicInvoke = 21 · дизайн <b>mid</b>',
};
