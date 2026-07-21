/**
 * Lesson: Building expression trees (CS.S11.building-expressions) — expert density, 5 animated
 * deep-dives. When the C# compiler doesn't build the tree for you, you build it by hand with the
 * System.Linq.Expressions factory methods: Expression.Parameter / Expression.Constant create leaf
 * nodes, Expression.Add / Expression.LessThan compose them, and Expression.Lambda<TDelegate> caps
 * the tree. Because expression trees are IMMUTABLE you must build the tree from the leaves up to
 * the root — every factory method takes its children as arguments, so a parent can't exist before
 * its children do. The hand-built tree is a peer of the compiler-built one: it compiles and runs.
 *
 * SIGNATURE machine panel (s5): a hand-built `x => x + 1` — Parameter("x") + Constant(1) -> Add ->
 * Lambda<Func<int,int>> — printed as `x => (x + 1)` and compiled+invoked f(41)=42 (REAL run-csharp
 * measurement, this file's exec cards on the app backend :5080).
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../expression-trees/expression-trees-building (ms.date 2023-03-07),
 * fetched + substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from that page (per-segment/per-item sources[]);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "3" · c2 "x => (x + 1) 42" · c3 "LessThan True".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.building-expressions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: immutability -> build from the leaves up; factories take children as arguments.
const Z_LEAVES: Zone = { id: "leaves", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ЛИСТЬЯ СНАЧАЛА", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Constant / Parameter", subCls: "vz-zsub good", subY: 47 };
const Z_ROOT: Zone = { id: "root", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОРЕНЬ ПОТОМ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "родитель ← дети", subCls: "vz-zsub", subY: 47 };
const BUILD_ZONES: Zone[] = [Z_LEAVES, Z_ROOT];

// s2: the leaf factories — Constant + Parameter.
const Z_CONST: Zone = { id: "const", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Expression.Constant", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "значение + тип", subCls: "vz-zsub", subY: 47 };
const Z_PARAM: Zone = { id: "param", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Expression.Parameter", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тип + имя", subCls: "vz-zsub good", subY: 47 };
const LEAF_ZONES: Zone[] = [Z_CONST, Z_PARAM];

// s3: compose with Add, cap with Lambda — the 1+2 example bottom-up.
const Z_COMPOSE: Zone = { id: "compose", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "СБОРКА 1 + 2 СНИЗУ ВВЕРХ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Constant(1), Constant(2) → Add → Lambda", subCls: "vz-zsub", subY: 40 };
const COMPOSE_ZONES: Zone[] = [Z_COMPOSE];

// s4: the manual num < 5 tree (doc's Map-code-constructs example) with a parameter.
const Z_MANUAL: Zone = { id: "manual", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "РУЧНОЕ num < 5", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Parameter(num), Constant(5) → LessThan → Lambda", subCls: "vz-zsub", subY: 40 };
const MANUAL_ZONES: Zone[] = [Z_MANUAL];

// s5 (SIGNATURE): hand-built x => x + 1, printed and executed.
const Z_HAND: Zone = { id: "hand", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СОБРАНО РУКАМИ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "x => (x + 1)", subCls: "vz-zsub", subY: 47 };
const Z_RUN: Zone = { id: "run", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СКОМПИЛИРОВАНО", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Compile() → f(41)", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_HAND, Z_RUN];

export const buildingExpressions: LessonData = {
  id: "CS.S11.building-expressions",
  track: "CS",
  section: "CS.S11",
  module: "S11.2",
  lang: "csharp",
  title: "Программное построение деревьев",
  kicker: "C# вглубь · S11 · снизу вверх",
  home: { subtitle: "Expression.Parameter/Constant/Add/Lambda, неизменяемость, от листьев к корню", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-build", kind: "doc", org: "Microsoft Learn", title: "Building Expression Trees (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-building", date: "2023-03-07" },
  ],

  spec: [
    { text: "«Expression trees are immutable. Being immutable means that you must <i>build the tree from the leaves up to the root</i>. The APIs you use to build expression trees reflect this fact: <span class=\"hl\">The methods you use to build a node take all its children as arguments</span>.» <span class=\"ru-tr\">«Деревья выражений неизменяемы. Неизменяемость означает, что дерево нужно строить от листьев вверх к корню. API для построения деревьев отражают этот факт: методы построения узла принимают всех его детей как аргументы.»</span>", source: "ms-build" },
  ],
  edgeCases: [
    { text: "Листья — константы: «To construct that expression tree, you first construct the <span class=\"hl\">leaf nodes</span>. The leaf nodes are constants». <span class=\"ru-tr\">«Чтобы построить это дерево, сначала строят листовые узлы. Листовые узлы — это константы».</span> Их создаёт <code>Expression.Constant</code>.", source: "ms-build" },
    { text: "Параметры создают <b>заранее</b>: «you need to create the objects that represent parameters or local variables <span class=\"hl\">before you use them</span>. Once you've created those objects, you can use them in your expression tree wherever you need». <span class=\"ru-tr\">«нужно создать объекты, представляющие параметры или локальные переменные, до того как использовать их. Создав эти объекты, можно использовать их в дереве везде, где нужно».</span>", source: "ms-build" },
    { text: "Ручные деревья <b>мощнее</b> компиляторных: «By using the API, you can create expression trees that are <span class=\"hl\">more complex than those that can be created from lambda expressions</span> by the C# compiler». <span class=\"ru-tr\">«С помощью API можно создавать деревья выражений сложнее тех, что компилятор C# может создать из лямбд-выражений».</span> Компилятор не строит statement-лямбды, а API — строит.", source: "ms-build" },
  ],

  misconceptions: [
    {
      wrong: "дерево выражения строится сверху вниз — сначала корень (Lambda), потом ему навешиваешь тело и листья",
      hook: 'Естественная, но неверная модель: <span class="wrong">строим сверху вниз, от корня <code>Lambda</code> к листьям</span>. На деле — наоборот, и причина в неизменяемости. Дословно: «Expression trees are immutable. Being immutable means that you must <span class="hl">build the tree from the leaves up to the root</span>». <span class="ru-tr">«Деревья выражений неизменяемы. Неизменяемость означает, что дерево нужно строить от листьев вверх к корню».</span> Раз узлы нельзя менять после создания, родитель обязан получить готовых детей: «<span class="hl">The methods you use to build a node take all its children as arguments</span>». <span class="ru-tr">«Методы построения узла принимают всех его детей как аргументы».</span> Значит порядок жёсткий: сперва <code>Expression.Constant</code>/<code>Expression.Parameter</code> (листья), затем <code>Expression.Add</code>/<code>Expression.LessThan</code> над ними, и лишь потом <code>Expression.Lambda</code> над телом. Ниже <b>пять разборов</b> и <b>машинная панель</b>: руками собранный <code>x =&gt; x + 1</code>, распечатанный как <code>x =&gt; (x + 1)</code> и исполненный <code>f(41)=42</code> (реальный прогон).',
      source: "ms-build",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Порядок сборки", title: "Неизменяемость диктует: от листьев к корню",
      viewBox: "0 0 340 210", zones: BUILD_ZONES,
      code: ["// нельзя: сначала корень, потом добавить детей", "// узлы неизменяемы → родитель принимает готовых детей", "// значит: Constant/Parameter → Add → Lambda"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Деревья <span class="hl">неизменяемы</span>: узел нельзя достроить после создания. Поэтому родитель обязан получить <b>готовых</b> детей.', nodes: [{ id: "l", kind: "obj", at: { zone: "leaves", row: 0 }, typeTag: "листья", value: "готовы", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '«The methods you use to build a node <span class="hl">take all its children as arguments</span>». <span class="ru-tr">«Методы построения узла принимают всех его детей как аргументы».</span> Ребёнок должен уже существовать.', nodes: [{ id: "l", kind: "obj", at: { zone: "leaves", row: 0 }, typeTag: "листья", value: "готовы" }, { id: "r", kind: "obj", at: { zone: "root", row: 0 }, typeTag: "родитель", value: "← дети", accent: true }], edges: [{ id: "e", from: "l", to: "r", accent: true }] },
        { codeLine: 2, out: "", caption: 'Итог — жёсткий порядок снизу вверх: <span class="hl">Constant/Parameter → Add → Lambda</span>. Корень собирается последним.', nodes: [{ id: "c", kind: "chip", at: { zone: "leaves", row: 0 }, value: "1) Constant/Parameter" }, { id: "a", kind: "chip", at: { zone: "root", row: 0 }, value: "2) Add" }, { id: "lm", kind: "chip", at: { zone: "root", row: 1 }, value: "3) Lambda", accent: true }], edges: [] },
      ],
      explain: 'Ручная сборка подчиняется одному правилу — <b>снизу вверх</b>, и это следствие неизменяемости. Дословно: «Expression trees are immutable. Being immutable means that you must <span class="hl">build the tree from the leaves up to the root</span>. The APIs you use to build expression trees reflect this fact: The methods you use to build a node take all its children as arguments». <span class="ru-tr">«Деревья выражений неизменяемы. Неизменяемость означает, что дерево нужно строить от листьев вверх к корню. API для построения деревьев отражают этот факт: методы построения узла принимают всех его детей как аргументы».</span> Поскольку у <code>Expression.Add(left, right)</code> оба аргумента обязаны быть готовыми узлами, <code>left</code>/<code>right</code> (листья) создаются <b>первыми</b>. А <code>Expression.Lambda(body, params)</code> вызывается последним, когда тело уже собрано. Нельзя создать пустой <code>Lambda</code> и потом «дописать» тело — узел иммутабелен.',
      sources: ["ms-build"],
    },
    {
      id: "s2", num: "02", kicker: "Листья", title: "Expression.Constant и Expression.Parameter",
      viewBox: "0 0 340 210", zones: LEAF_ZONES,
      code: ["var one = Expression.Constant(1, typeof(int));      // константа-лист", "var x   = Expression.Parameter(typeof(int), \"x\");   // параметр-лист", "// оба — узлы без детей: строятся ПЕРВЫМИ"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Expression.Constant(value, type)</code> — <span class="hl">листовой узел</span>-константа. «The leaf nodes are constants». <span class="ru-tr">«Листовые узлы — это константы».</span>', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "Constant", value: "1 : int", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Expression.Parameter(type, name)</code> — лист-<b>параметр</b>: тип и имя. Его создают <span class="hl">заранее</span>, чтобы переиспользовать в теле и в <code>Lambda</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "Constant", value: "1 : int" }, { id: "p", kind: "obj", at: { zone: "param", row: 0 }, typeTag: "Parameter", value: "x : int", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Оба — узлы <b>без детей</b>. Строятся первыми: их потом примут родительские узлы <code>Add</code>/<code>LessThan</code> как аргументы.', nodes: [{ id: "c", kind: "obj", at: { zone: "const", row: 0 }, typeTag: "Constant", value: "1" }, { id: "p", kind: "obj", at: { zone: "param", row: 0 }, typeTag: "Parameter", value: "x", accent: true }], edges: [] },
      ],
      explain: 'Два вида листьев. <b>Константа</b>: «Use the <code>Constant</code> method to create the nodes». <span class="ru-tr">«Используйте метод <code>Constant</code>, чтобы создать узлы».</span> — <code>Expression.Constant(1, typeof(int))</code>. <b>Параметр</b> создаётся так же, но с типом и именем: <code>Expression.Parameter(typeof(int), "x")</code>. Важнейший нюанс параметров — их создают заранее и переиспользуют: «you need to create the objects that represent parameters or local variables <span class="hl">before you use them</span>. Once you\'ve created those objects, you can use them in your expression tree wherever you need». <span class="ru-tr">«нужно создать объекты, представляющие параметры или локальные переменные, до того как использовать их. Создав эти объекты, можно использовать их в дереве везде, где нужно».</span> Один и тот же объект <code>ParameterExpression x</code> должен встречаться и в теле (<code>x + 1</code>), и в списке параметров <code>Lambda</code> — иначе связь параметра с телом разорвётся.',
      sources: ["ms-build"],
    },
    {
      id: "s3", num: "03", kicker: "Композиция", title: "Expression.Add над листьями, Expression.Lambda над телом",
      viewBox: "0 0 340 276", zones: COMPOSE_ZONES,
      code: ["var one = Expression.Constant(1, typeof(int));", "var two = Expression.Constant(2, typeof(int));", "var addition = Expression.Add(one, two);   // родитель принимает листья", "var lambda = Expression.Lambda<Func<int>>(addition);  // корень над телом"],
      predictAt: 2, predictQ: 'Собрано снизу вверх: <code>Constant(1)</code>, <code>Constant(2)</code> → <code>Add</code> → <code>Lambda&lt;Func&lt;int&gt;&gt;</code>. Что напечатает <code>lambda.Compile()()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Сперва два листа-константы: <code>Constant(1)</code> и <code>Constant(2)</code>. Детей у них нет.', nodes: [{ id: "one", kind: "obj", at: { zone: "compose", row: 0, col: 0 }, typeTag: "Constant", value: "1", accent: true }, { id: "two", kind: "obj", at: { zone: "compose", row: 0, col: 1 }, typeTag: "Constant", value: "2", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Expression.Add(one, two)</code> — родитель <span class="hl">принимает готовые листья</span> как аргументы. Возникает узел <code>Add</code>.', nodes: [{ id: "add", kind: "obj", at: { zone: "compose", row: 0, col: 0 }, typeTag: "Add", value: "1 + 2", accent: true }, { id: "one", kind: "obj", at: { zone: "compose", row: 1, col: 0 }, typeTag: "Constant", value: "1" }, { id: "two", kind: "obj", at: { zone: "compose", row: 1, col: 1 }, typeTag: "Constant", value: "2" }], edges: [{ id: "e1", from: "one", to: "add" }, { id: "e2", from: "two", to: "add", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>Expression.Lambda&lt;Func&lt;int&gt;&gt;(addition)</code> — корень над телом. Дерево собрано: <span class="hl">Lambda → Add → (1, 2)</span>.', nodes: [{ id: "lam", kind: "obj", at: { zone: "compose", row: 0, col: 0 }, typeTag: "Lambda", value: "() => 1+2", accent: true }, { id: "add", kind: "obj", at: { zone: "compose", row: 1, col: 0 }, typeTag: "Add", value: "1 + 2" }], edges: [{ id: "e", from: "add", to: "lam", accent: true }] },
        { codeLine: 3, out: "3", caption: '<code>lambda.Compile()()</code> — компиляция в делегат и вызов: <span class="hl">3</span> (реальный прогон). Собранное руками дерево — исполнимо.', nodes: [{ id: "lam", kind: "obj", at: { zone: "compose", row: 0, col: 0 }, typeTag: "Lambda", value: "() => 1+2" }, { id: "r", kind: "gate", at: { zone: "compose", row: 1, col: 0 }, state: "ok", label: "Compile()()", detail: "3", accent: true }], edges: [] },
      ],
      explain: 'Композиция повторяет пример из доки — сложение <code>1 + 2</code>. «To construct that expression tree, you first construct the leaf nodes» <span class="ru-tr">«Чтобы построить это дерево, сначала строят листовые узлы»</span> (<code>one</code>, <code>two</code>), «Next, build the addition expression» <span class="ru-tr">«Затем строят выражение сложения»</span> — <code>Expression.Add(one, two)</code>, «Once you\'ve built the addition expression, you create the lambda expression» <span class="ru-tr">«Построив выражение сложения, создают лямбда-выражение»</span> — <code>Expression.Lambda(addition)</code>. Каждый шаг принимает готовые узлы. Собранное дерево — полноценное: <code>lambda.Compile()()</code> даёт <code>3</code>. Для простых деревьев дока разрешает слить всё в один вызов: «For expressions like this one, you may <span class="hl">combine all the calls into a single statement</span>». <span class="ru-tr">«Для выражений вроде этого можно объединить все вызовы в один оператор».</span>',
      sources: ["ms-build"],
    },
    {
      id: "s4", num: "04", kicker: "С параметром", title: "Ручное num < 5: Parameter → LessThan → Lambda с аргументом",
      viewBox: "0 0 340 276", zones: MANUAL_ZONES,
      code: ["ParameterExpression numParam = Expression.Parameter(typeof(int), \"num\");", "ConstantExpression five = Expression.Constant(5, typeof(int));", "BinaryExpression numLessThanFive = Expression.LessThan(numParam, five);", "var lambda1 = Expression.Lambda<Func<int,bool>>(numLessThanFive, new[]{numParam});"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Лист-параметр <code>num</code> создаём <span class="hl">первым</span> — его переиспользуем дважды: в теле и в списке параметров <code>Lambda</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "manual", row: 0, col: 0 }, typeTag: "Parameter", value: "num : int", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Лист-константа <code>5</code>. Теперь оба ребёнка бинарного узла готовы.', nodes: [{ id: "p", kind: "obj", at: { zone: "manual", row: 0, col: 0 }, typeTag: "Parameter", value: "num" }, { id: "c", kind: "obj", at: { zone: "manual", row: 0, col: 1 }, typeTag: "Constant", value: "5", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Expression.LessThan(numParam, five)</code> — бинарный узел <span class="hl">LessThan</span> над готовыми листьями.', nodes: [{ id: "lt", kind: "obj", at: { zone: "manual", row: 0, col: 0 }, typeTag: "LessThan", value: "num < 5", accent: true }, { id: "p", kind: "obj", at: { zone: "manual", row: 1, col: 0 }, typeTag: "Parameter", value: "num" }, { id: "c", kind: "obj", at: { zone: "manual", row: 1, col: 1 }, typeTag: "Constant", value: "5" }], edges: [{ id: "e1", from: "p", to: "lt" }, { id: "e2", from: "c", to: "lt", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>Lambda&lt;Func&lt;int,bool&gt;&gt;(body, [numParam])</code> — тот же <code>numParam</code> в списке параметров <span class="hl">связывает</span> его с телом. Дерево = компиляторному для <code>num =&gt; num &lt; 5</code>.', nodes: [{ id: "lam", kind: "obj", at: { zone: "manual", row: 0, col: 0 }, typeTag: "Lambda", value: "num => num<5", accent: true }, { id: "lt", kind: "obj", at: { zone: "manual", row: 1, col: 0 }, typeTag: "LessThan", value: "num < 5" }], edges: [{ id: "e", from: "lt", to: "lam", accent: true }] },
      ],
      explain: 'Дока показывает ровно этот ручной вариант <code>num =&gt; num &lt; 5</code>: «The following code example demonstrates an expression tree that represents the lambda expression <code>num =&gt; num &lt; 5</code> <span class="hl">by using the API</span>». <span class="ru-tr">«Следующий пример кода демонстрирует дерево выражения, представляющее лямбда-выражение <code>num =&gt; num &lt; 5</code>, с помощью API».</span> Ключевой момент — <b>один и тот же</b> <code>numParam</code> используется и внутри <code>Expression.LessThan(numParam, five)</code>, и в списке параметров <code>Expression.Lambda&lt;Func&lt;int,bool&gt;&gt;(numLessThanFive, new ParameterExpression[] { numParam })</code>. Это и есть «create the objects that represent parameters… before you use them» <span class="ru-tr">«создать объекты, представляющие параметры… до того как использовать их»</span> на практике: параметр — общий узел, связывающий тело с сигнатурой. Собранное дерево эквивалентно компиляторному: <code>NodeType == LessThan</code>, а <code>Compile()(3)</code> даёт <code>True</code>.',
      sources: ["ms-build"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Руками собранный x => x + 1: печать и исполнение",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var x = Expression.Parameter(typeof(int), \"x\");", "var body = Expression.Add(x, Expression.Constant(1));", "var lambda = Expression.Lambda<Func<int,int>>(body, x);", "var f = lambda.Compile();", "// lambda.ToString() == \"x => (x + 1)\";  f(41) == 42"],
      predictAt: 3, predictQ: 'Руками собрано <code>x =&gt; x + 1</code>: <code>Parameter("x")</code>, <code>Add(x, Constant(1))</code>, <code>Lambda</code>. Что даст <code>$"{lambda} {f(41)}"</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Параметр <code>x</code>, потом <code>Add(x, Constant(1))</code> — тело <code>x + 1</code>. Тот же <code>x</code> уйдёт и в параметры.', nodes: [{ id: "b", kind: "obj", at: { zone: "hand", row: 0 }, typeTag: "Add", value: "x + 1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Lambda&lt;Func&lt;int,int&gt;&gt;(body, x)</code> — корень. Дерево готово; печать даёт <span class="hl">x =&gt; (x + 1)</span>.', nodes: [{ id: "l", kind: "obj", at: { zone: "hand", row: 0 }, typeTag: "Lambda", value: "x => (x + 1)", accent: true }], edges: [] },
        { codeLine: 4, out: "x => (x + 1) 42", caption: 'Панель: <span class="hl">x =&gt; (x + 1) 42</span> (реальный прогон). Печать дерева + результат вызова <code>f(41)=42</code>. Ручное дерево <b>исполнимо</b>.', nodes: [{ id: "l", kind: "obj", at: { zone: "hand", row: 0 }, typeTag: "Lambda", value: "x => (x + 1)" }, { id: "r", kind: "gate", at: { zone: "run", row: 0 }, state: "ok", label: "f(41)", detail: "42", accent: true }], edges: [{ id: "e", from: "l", to: "r", accent: true }] },
      ],
      explain: 'Машинная панель — руками собранный <code>x =&gt; x + 1</code>. Порядок канонический: лист-параметр <code>x</code> → тело <code>Expression.Add(x, Expression.Constant(1))</code> → корень <code>Expression.Lambda&lt;Func&lt;int,int&gt;&gt;(body, x)</code>. Тот же <code>x</code> и в теле, и в параметрах — связка. <code>ToString()</code> дерева печатает <code>x =&gt; (x + 1)</code> (скобки — так рендерит <code>Expression</code> бинарный узел), а <code>lambda.Compile()(41)</code> даёт <code>42</code>. Реальный вывод: <code>x =&gt; (x + 1) 42</code>. Это подтверждает тезис доки, что через API можно собрать даже больше, чем компилятор: «you can create expression trees that are <span class="hl">more complex than those that can be created from lambda expressions</span> by the C# compiler» <span class="ru-tr">«можно создавать деревья выражений сложнее тех, что компилятор C# может создать из лямбд-выражений»</span> — тут же простой случай, но собранный вручную и полностью исполнимый.',
      sources: ["ms-build"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var one = Expression.Constant(1, typeof(int)); var two = Expression.Constant(2, typeof(int)); var addition = Expression.Add(one, two); var lambda = Expression.Lambda&lt;Func&lt;int&gt;&gt;(addition); Console.WriteLine(lambda.Compile()());</code> — что напечатает?',
      options: ["3", "1 + 2", "() => 1 + 2", "0"], correctIndex: 0, xp: 10,
      okText: 'Дерево собрано снизу вверх: два <code>Constant</code> → <code>Add</code> → <code>Lambda</code>. <code>Compile()()</code> компилирует в делегат и вызывает: <code>1+2</code> = <b>3</b>.',
      noText: '«The methods you use to build a node take all its children as arguments». <span class="ru-tr">«Методы построения узла принимают всех его детей как аргументы».</span> Собранное дерево исполнимо: <code>Compile()()</code> даёт <b>3</b>, а не строку.',
      verify: { kind: "exec", run: "dotnet run", expect: "3" }, sourceRefs: ["ms-build"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var x = Expression.Parameter(typeof(int),"x"); var body = Expression.Add(x, Expression.Constant(1)); var lambda = Expression.Lambda&lt;Func&lt;int,int&gt;&gt;(body, x); var f = lambda.Compile(); Console.WriteLine($"{lambda} {f(41)}");</code> — что напечатает?',
      options: ["x => (x + 1) 42", "x => x + 1 42", "(x + 1) 42", "x => (x + 1) 41"], correctIndex: 0, xp: 10,
      okText: 'Печать дерева — <code>x =&gt; (x + 1)</code> (так <code>Expression</code> рендерит бинарный узел в скобках), вызов <code>f(41)</code> = <b>42</b>. Вывод: <b>x => (x + 1) 42</b>.',
      noText: 'Тот же <code>x</code> — и в теле <code>Add</code>, и в параметрах <code>Lambda</code>. <code>ToString()</code> даёт <code>x =&gt; (x + 1)</code>, <code>f(41)=42</code>. Вывод: <b>x => (x + 1) 42</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "x => (x + 1) 42" }, sourceRefs: ["ms-build"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var numParam = Expression.Parameter(typeof(int), "num"); var five = Expression.Constant(5, typeof(int)); var numLessThanFive = Expression.LessThan(numParam, five); var lambda1 = Expression.Lambda&lt;Func&lt;int,bool&gt;&gt;(numLessThanFive, new[]{numParam}); Console.WriteLine($"{lambda1.Body.NodeType} {lambda1.Compile()(3)}");</code> — что напечатает?',
      options: ["LessThan True", "LessThan False", "Less True", "num < 5 True"], correctIndex: 0, xp: 10,
      okText: 'Ручное дерево <code>num =&gt; num &lt; 5</code>: тело — <code>BinaryExpression</code> с <code>NodeType=LessThan</code>; <code>Compile()(3)</code> → <code>3&lt;5</code> = <b>True</b>. Вывод: <b>LessThan True</b>.',
      noText: 'Один <code>numParam</code> и в <code>LessThan</code>, и в параметрах <code>Lambda</code> — связка. <code>NodeType</code> — <b>LessThan</b>, вызов на 3 → <b>True</b>. Вывод: <b>LessThan True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "LessThan True" }, sourceRefs: ["ms-build"],
    },
  ],

  takeaways: [
    { icon: "why", k: "снизу вверх", v: '«build the tree from the leaves up to the root… <span class="hl">The methods you use to build a node take all its children as arguments</span>». <span class="ru-tr">«строить от листьев вверх к корню… методы построения узла принимают всех его детей как аргументы».</span> Порядок: <code>Constant/Parameter</code> → <code>Add/LessThan</code> → <code>Lambda</code>.' },
    { icon: "cost", k: "параметр — заранее", v: 'Один <code>Expression.Parameter</code> создают «<span class="hl">before you use them</span>» <span class="ru-tr">«до того как использовать их»</span> и переиспользуют: и в теле, и в списке параметров <code>Lambda</code>. Это связывает сигнатуру с телом. Замер: <code>x => (x + 1) 42</code>.' },
    { icon: "avoid", k: "API мощнее компилятора", v: 'Через API «you can create expression trees that are <span class="hl">more complex than those that can be created from lambda expressions</span>». <span class="ru-tr">«можно создавать деревья сложнее тех, что компилятор создаёт из лямбд».</span> Statement-лямбды, циклы, блоки — только руками (следующие уроки — исполнение и обход).' },
  ],

  foot: 'урок · <b>программное построение деревьев</b> · 5 анимир. разборов · панель x => (x + 1) · дизайн <b>mid</b>',
};
