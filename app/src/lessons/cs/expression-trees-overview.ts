/**
 * Lesson: Expression trees — обзор (CS.S11.expression-trees-overview) — expert density, 5 animated
 * deep-dives. An expression tree is CODE AS DATA: the same lambda `num => num < 5` assigned to a
 * Func<> becomes an opaque executable delegate, but assigned to Expression<Func<>> the compiler
 * emits code that BUILDS a data structure whose every node is an expression (a tree you can walk,
 * with .Body.NodeType == LessThan). This is why LINQ providers (Entity Framework) can translate the
 * query into SQL — they inspect the tree, not run the delegate. This section goes DEEPER than
 * CS.S3.ienumerable-iqueryable (which named the delegate-vs-tree split): here the tree itself is
 * the subject — its shape, immutability, compilation and traversal.
 *
 * SIGNATURE machine panel (s5): the SAME lambda two ways — Func<int,bool> is opaque (only del(4) is
 * observable), Expression<Func<int,bool>> exposes NodeType=Lambda, Body=LessThan (REAL run-csharp
 * measurement, this file's exec cards on the app backend :5080).
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../advanced-topics/expression-trees/ (ms.date 2025-10-13) and
 * learn.microsoft.com/.../csharp/linq/ (ms.date 2025-12-01), fetched + substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from one of those pages (per-segment sources[] name every
 *     page its own quotes come from);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "del=True exp.NodeType=Lambda exp.Body=LessThan" · c2 "True False" ·
 *     c3 "num => num LessThan 5".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.expression-trees-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what an expression tree is — a tree-like data structure of nodes.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "КОД", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "num => num < 5", subCls: "vz-zsub good", subY: 47 };
const Z_TREE1: Zone = { id: "tree1", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕРЕВО-ДАННЫЕ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "узлы = выражения", subCls: "vz-zsub", subY: 47 };
const CODE_ZONES: Zone[] = [Z_CODE, Z_TREE1];

// s2: Func vs Expression<Func> — the type at assignment decides code vs data.
const Z_FUNC: Zone = { id: "func", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Func<int,bool>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "исполняемый делегат", subCls: "vz-zsub good", subY: 47 };
const Z_EXPR: Zone = { id: "expr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Expression<Func<>>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "структура-данные", subCls: "vz-zsub", subY: 47 };
const TWO_ZONES: Zone[] = [Z_FUNC, Z_EXPR];

// s3: the tree shape — Lambda root, Body = LessThan, Parameter + Constant leaves.
const Z_SHAPE: Zone = { id: "shape", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ФОРМА ДЕРЕВА num < 5", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Lambda → LessThan → (Parameter, Constant)", subCls: "vz-zsub", subY: 40 };
const SHAPE_ZONES: Zone[] = [Z_SHAPE];

// s4: providers translate the tree (EF Core -> SQL).
const Z_CS: Zone = { id: "cs", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕРЕВО В C#", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Expression<Func<>>", subCls: "vz-zsub", subY: 47 };
const Z_SQL: Zone = { id: "sql", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ТРАНСЛЯЦИЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "EF Core → SQL", subCls: "vz-zsub heap", subY: 47 };
const XLATE_ZONES: Zone[] = [Z_CS, Z_SQL];

// s5 (SIGNATURE): opaque delegate vs inspectable tree.
const Z_OPAQUE: Zone = { id: "opaque", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Func — НЕПРОЗРАЧЕН", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "виден только результат", subCls: "vz-zsub good", subY: 47 };
const Z_INSPECT: Zone = { id: "inspect", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Expression — ВИДЕН", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "NodeType, Body", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_OPAQUE, Z_INSPECT];

export const expressionTreesOverview: LessonData = {
  id: "CS.S11.expression-trees-overview",
  track: "CS",
  section: "CS.S11",
  module: "S11.1",
  lang: "csharp",
  title: "Деревья выражений: код как данные",
  kicker: "C# вглубь · S11 · code as data",
  home: { subtitle: "Expression<Func<>> vs Func<>, узел = выражение, зачем провайдерам", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-et", kind: "doc", org: "Microsoft Learn", title: "Expression Trees (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/", date: "2025-10-13" },
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-interpreting", kind: "doc", org: "Microsoft Learn", title: "Interpret Expressions (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-interpreting", date: "2023-03-06" },
  ],

  spec: [
    { text: "«<i>Expression trees</i> represent code in a tree-like data structure, where each node is an expression, for example, a method call or a binary operation such as <code>x &lt; y</code>.» <span class=\"ru-tr\">«Деревья выражений представляют код в древовидной структуре данных, где каждый узел — это выражение, например вызов метода или бинарная операция вроде <code>x &lt; y</code>.»</span>", source: "ms-et" },
  ],
  edgeCases: [
    { text: "Присваивание типу решает всё: «When a lambda expression is assigned to a variable of type <code>Expression&lt;TDelegate&gt;</code>, the compiler <span class=\"hl\">emits code to build an expression tree</span> that represents the lambda expression». <span class=\"ru-tr\">«Когда лямбда-выражение присваивается переменной типа <code>Expression&lt;TDelegate&gt;</code>, компилятор порождает код, строящий дерево выражения, которое представляет это лямбда-выражение».</span>", source: "ms-et" },
    { text: "Деревья <b>неизменяемы</b>: «Expression trees are immutable. If you want to modify an expression tree, you must <span class=\"hl\">construct a new expression tree</span> by copying the existing one and replacing nodes in it». <span class=\"ru-tr\">«Деревья выражений неизменяемы. Чтобы изменить дерево выражения, нужно построить новое дерево, скопировав существующее и заменив в нём узлы».</span>", source: "ms-et" },
    { text: "Не всякий C# ложится в дерево: «The C# compiler generates expression trees <span class=\"hl\">only from expression lambdas</span> (or single-line lambdas). It can\'t parse statement lambdas (or multi-line lambdas)». <span class=\"ru-tr\">«Компилятор C# порождает деревья выражений только из лямбд-выражений (однострочных лямбд). Он не может разобрать лямбды-операторы (многострочные лямбды)».</span>", source: "ms-et" },
  ],

  misconceptions: [
    {
      wrong: "Expression<Func<>> — это просто «типизированный Func», такой же исполняемый делегат, только с лишней обёрткой",
      hook: 'Дорогое заблуждение: <span class="wrong"><code>Expression&lt;Func&lt;&gt;&gt;</code> = красиво завёрнутый <code>Func&lt;&gt;</code></span>. На деле тип при присваивании превращает <b>один и тот же</b> исходник в две разные сущности. Лямбда, присвоенная <code>Func&lt;&gt;</code>, — исполняемый делегат. Присвоенная <code>Expression&lt;TDelegate&gt;</code> — <span class="hl">данные</span>: «the compiler <b>emits code to build an expression tree</b> that represents the lambda expression». <span class="ru-tr">«компилятор порождает код, строящий дерево выражения, которое представляет это лямбда-выражение».</span> А дерево — это «code in a <b>tree-like data structure</b>, where each node is an expression». <span class="ru-tr">«код в древовидной структуре данных, где каждый узел — это выражение».</span> Именно поэтому «Expression Trees represent code as a structure that you <b>examine, modify, or execute</b>» <span class="ru-tr">«деревья выражений представляют код как структуру, которую можно исследовать, изменять или исполнять»</span> — и на этом стоит EF Core, транслируя дерево в SQL. Ниже <b>пять разборов</b> и <b>машинная панель</b>: одна лямбда <code>num =&gt; num &lt; 5</code> как непрозрачный <code>Func</code> (виден только <code>del(4)</code>) и как дерево (<code>NodeType=Lambda</code>, <code>Body=LessThan</code>, реальный прогон).',
      source: "ms-et",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что это", title: "Дерево выражения = код в древовидной структуре данных",
      viewBox: "0 0 340 210", zones: CODE_ZONES,
      code: ["// один и тот же исходник num => num < 5", "// как ДЕРЕВО: каждый узел — выражение", "//   Lambda → LessThan → (num: Parameter, 5: Constant)"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Слева — привычный код <code>num =&gt; num &lt; 5</code>. Справа то же самое компилятор способен представить как <span class="hl">структуру-данные</span>.', nodes: [{ id: "c", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "лямбда", value: "num < 5", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '«represent code in a <span class="hl">tree-like data structure</span>, where each node is an expression». <span class="ru-tr">«представляют код в древовидной структуре данных, где каждый узел — выражение».</span> Корень — <code>Lambda</code>.', nodes: [{ id: "c", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "лямбда", value: "num < 5" }, { id: "l", kind: "obj", at: { zone: "tree1", row: 0 }, typeTag: "Lambda", value: "корень", accent: true }], edges: [{ id: "e", from: "c", to: "l", accent: true }] },
        { codeLine: 2, out: "", caption: 'Тело — узел <code>LessThan</code>, у него два ребёнка: параметр <code>num</code> и константа <code>5</code>. Дерево <span class="hl">полностью описывает</span> выражение.', nodes: [{ id: "l", kind: "obj", at: { zone: "tree1", row: 0 }, typeTag: "Lambda", value: "корень" }, { id: "lt", kind: "obj", at: { zone: "tree1", row: 1, col: 0 }, typeTag: "LessThan", value: "num < 5" }, { id: "p", kind: "chip", at: { zone: "tree1", row: 2, col: 0 }, value: "num: Parameter" }, { id: "k", kind: "chip", at: { zone: "tree1", row: 2, col: 1 }, value: "5: Constant", accent: true }], edges: [{ id: "e1", from: "lt", to: "l" }, { id: "e2", from: "p", to: "lt" }, { id: "e3", from: "k", to: "lt", accent: true }] },
      ],
      explain: 'Дословное определение: «<i>Expression trees</i> represent code in a <span class="hl">tree-like data structure</span>, where each node is an expression, for example, a method call or a binary operation such as <code>x &lt; y</code>». <span class="ru-tr">«Деревья выражений представляют код в древовидной структуре данных, где каждый узел — выражение, например вызов метода или бинарная операция вроде <code>x &lt; y</code>».</span> Ключевая мысль — <b>код как данные</b>: «Expression Trees represent code as a structure that you <b>examine, modify, or execute</b>. These tools give you the power to <span class="hl">manipulate code during run time</span>». <span class="ru-tr">«Деревья выражений представляют код как структуру, которую можно исследовать, изменять или исполнять. Эти инструменты дают возможность манипулировать кодом во время выполнения».</span> Для <code>num =&gt; num &lt; 5</code> дерево — это корневой <code>LambdaExpression</code>, чьё тело — <code>BinaryExpression</code> вида <code>LessThan</code> с двумя листьями: <code>ParameterExpression num</code> и <code>ConstantExpression 5</code>. Это не строка и не байткод — это связанный объектный граф из <code>System.Linq.Expressions</code>.',
      sources: ["ms-et"],
    },
    {
      id: "s2", num: "02", kicker: "Func vs Expression", title: "Тип при присваивании решает: делегат или дерево",
      viewBox: "0 0 340 210", zones: TWO_ZONES,
      code: ["Func<int,bool>            del = num => num < 5;  // делегат", "Expression<Func<int,bool>> exp = num => num < 5;  // дерево", "// один исходник — тип переменной выбирает семантику"],
      predictAt: 1, predictQ: 'Одна и та же лямбда <code>num =&gt; num &lt; 5</code> присвоена <code>Func&lt;int,bool&gt;</code> и <code>Expression&lt;Func&lt;int,bool&gt;&gt;</code>. Что за сущность получится в каждом случае?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Присвоена <code>Func&lt;int,bool&gt;</code> — компилятор строит <span class="hl">делегат</span>: исполняемый код, который можно вызвать как <code>del(4)</code>.', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "num => num < 5", detail: "→ делегат", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Присвоена <code>Expression&lt;Func&lt;&gt;&gt;</code> — компилятор <span class="hl">emits code to build an expression tree</span>: <span class="ru-tr">порождает код, строящий дерево выражения:</span> структуру-данные, а не исполняемый код.', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "Func", detail: "делегат" }, { id: "e", kind: "gate", at: { zone: "expr", row: 0 }, state: "ok", label: "Expression<Func>", detail: "дерево-данные", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Исходник <b>идентичен</b> посимвольно — различается лишь тип переменной. Он и определяет: <code>Func</code> исполнить, <code>Expression</code> разобрать.', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "исполнить", detail: "del(4)" }, { id: "e", kind: "gate", at: { zone: "expr", row: 0 }, state: "ok", label: "разобрать", detail: "exp.Body", accent: true }], edges: [] },
      ],
      explain: 'Одна и та же лямбда компилируется по-разному в зависимости от <b>целевого типа</b>. Присвоенная делегату — это исполняемый код. Присвоенная <code>Expression&lt;TDelegate&gt;</code> — дерево: «When a lambda expression is assigned to a variable of type <code>Expression&lt;TDelegate&gt;</code>, the compiler <span class="hl">emits code to build an expression tree</span> that represents the lambda expression». <span class="ru-tr">«Когда лямбда-выражение присваивается переменной типа <code>Expression&lt;TDelegate&gt;</code>, компилятор порождает код, строящий дерево выражения, которое представляет это лямбда-выражение».</span> Дока прямо приводит пример: «The following code examples <span class="hl">demonstrate how to have the C# compiler create an expression tree</span> that represents the lambda expression <code>num =&gt; num &lt; 5</code>». <span class="ru-tr">«Следующие примеры кода демонстрируют, как заставить компилятор C# создать дерево выражения, представляющее лямбда-выражение <code>num =&gt; num &lt; 5</code>».</span> Итог: <code>Func</code>-переменную ты <b>вызываешь</b>, <code>Expression</code>-переменную <b>инспектируешь</b> — свойства <code>.NodeType</code>, <code>.Body</code>, <code>.Parameters</code>.',
      sources: ["ms-et"],
    },
    {
      id: "s3", num: "03", kicker: "Форма дерева", title: "Lambda → LessThan → (Parameter, Constant)",
      viewBox: "0 0 340 276", zones: SHAPE_ZONES,
      code: ["Expression<Func<int,bool>> exprTree = num => num < 5;", "var op    = (BinaryExpression)exprTree.Body;   // LessThan", "var left  = (ParameterExpression)op.Left;      // num", "var right = (ConstantExpression)op.Right;      // 5"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Корень дерева — <code>LambdaExpression</code>. Его <code>.Body</code> — <span class="hl">тело</span> справа от <code>=&gt;</code>.', nodes: [{ id: "lam", kind: "obj", at: { zone: "shape", row: 0 }, typeTag: "Lambda", value: "корень", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>.Body</code> — это <code>BinaryExpression</code> с <code>NodeType == <span class="hl">LessThan</span></code>. У бинарного узла всегда два ребёнка.', nodes: [{ id: "lam", kind: "obj", at: { zone: "shape", row: 0 }, typeTag: "Lambda", value: "корень" }, { id: "lt", kind: "obj", at: { zone: "shape", row: 1, col: 0 }, typeTag: "LessThan", value: "Body", accent: true }], edges: [{ id: "e1", from: "lt", to: "lam", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>op.Left</code> — <code>ParameterExpression</code> с именем <code>num</code>. Это лист: детей нет.', nodes: [{ id: "lam", kind: "obj", at: { zone: "shape", row: 0 }, typeTag: "Lambda", value: "корень" }, { id: "lt", kind: "obj", at: { zone: "shape", row: 1, col: 0 }, typeTag: "LessThan", value: "Body" }, { id: "p", kind: "obj", at: { zone: "shape", row: 2, col: 0 }, typeTag: "Parameter", value: "num", accent: true }], edges: [{ id: "e1", from: "lt", to: "lam" }, { id: "e2", from: "p", to: "lt", accent: true }] },
        { codeLine: 3, out: "", caption: '<code>op.Right</code> — <code>ConstantExpression</code> со значением <code>5</code>. Второй лист. Дерево собрано: <span class="hl">Lambda → LessThan → (num, 5)</span>.', nodes: [{ id: "lam", kind: "obj", at: { zone: "shape", row: 0 }, typeTag: "Lambda", value: "корень" }, { id: "lt", kind: "obj", at: { zone: "shape", row: 1, col: 0 }, typeTag: "LessThan", value: "Body" }, { id: "p", kind: "obj", at: { zone: "shape", row: 2, col: 0 }, typeTag: "Parameter", value: "num" }, { id: "k", kind: "obj", at: { zone: "shape", row: 2, col: 1 }, typeTag: "Constant", value: "5", accent: true }], edges: [{ id: "e1", from: "lt", to: "lam" }, { id: "e2", from: "p", to: "lt" }, { id: "e3", from: "k", to: "lt", accent: true }] },
      ],
      explain: 'Раз узлы — это выражения, к дереву можно спуститься навигацией по свойствам. Для <code>num =&gt; num &lt; 5</code>: корень — <code>LambdaExpression</code>; <code>.Body</code> — <code>BinaryExpression</code> с <code>NodeType == LessThan</code>; <code>.Left</code> — <code>ParameterExpression</code> (имя <code>num</code>); <code>.Right</code> — <code>ConstantExpression</code> (значение <code>5</code>). Проверяется реальным прогоном (карта c3): вывод <code>num =&gt; num LessThan 5</code>. Заметь, что скобки и приоритеты <b>не</b> хранятся отдельными узлами — «There are no nodes in the expression tree that represent the parentheses… The structure of the expression tree contains <span class="hl">all the information necessary to communicate the precedence</span>». <span class="ru-tr">«В дереве выражения нет узлов, представляющих скобки… Структура дерева содержит всю информацию, необходимую для передачи приоритета».</span> Приоритет закодирован самой формой дерева.',
      sources: ["ms-et", "ms-interpreting"],
    },
    {
      id: "s4", num: "04", kicker: "Зачем это", title: "Провайдеры читают дерево и транслируют его — EF Core в SQL",
      viewBox: "0 0 340 210", zones: XLATE_ZONES,
      code: ["// EF Core принимает дерево как аргумент LINQ-запроса", "db.Customers.Where(c => c.City == \"London\")", "// c => ... это Expression<Func<Customer,bool>> — ДЕРЕВО", "// EF Core разбирает дерево ⇒ SQL: WHERE City = 'London'"],
      scenes: [
        { codeLine: 1, out: "", caption: 'В <code>Where</code> над <code>IQueryable</code> лямбда — это <span class="hl">дерево</span>, а не делегат. EF Core получает его как данные.', nodes: [{ id: "t", kind: "obj", at: { zone: "cs", row: 0 }, typeTag: "Expression<Func>", value: "c.City == ...", accent: true }, { id: "db", kind: "chip", at: { zone: "sql", row: 0 }, value: "ждёт запрос" }], edges: [] },
        { codeLine: 3, out: "", caption: 'EF Core <b>обходит узлы</b> дерева и переводит их в SQL: «translate the query you wrote in C# <span class="hl">into SQL that executes in the database engine</span>». <span class="ru-tr">«перевести запрос, написанный на C#, в SQL, исполняемый в движке БД».</span>', nodes: [{ id: "t", kind: "obj", at: { zone: "cs", row: 0 }, typeTag: "Expression<Func>", value: "дерево" }, { id: "sql", kind: "gate", at: { zone: "sql", row: 0 }, state: "ok", label: "WHERE City = 'London'", detail: "нативный SQL", accent: true }], edges: [{ id: "e", from: "t", to: "sql", accent: true }] },
        { codeLine: 3, out: "", caption: 'Дерево «you examine, modify, or execute» — <span class="hl">инспекция</span> вместо исполнения. Библиотека читает форму запроса, не запуская вашу лямбду в .NET.', nodes: [{ id: "sql", kind: "gate", at: { zone: "sql", row: 0 }, state: "ok", label: "инспекция дерева", detail: "→ другой язык", accent: true }], edges: [] },
      ],
      explain: 'Дерево ценно тем, что его можно <b>прочитать</b>, а не только исполнить — на этом стоят ORM и мок-фреймворки. Дословно: «Entity Framework\'s LINQ APIs accept Expression trees as the arguments… That enables Entity Framework to <span class="hl">translate the query you wrote in C# into SQL that executes in the database engine</span>». <span class="ru-tr">«LINQ-API Entity Framework принимают деревья выражений в качестве аргументов… Это позволяет Entity Framework перевести запрос, написанный на C#, в SQL, который исполняется в движке базы данных».</span> И (LINQ overview): компилятор «compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to <span class="hl">expression trees</span>». <span class="ru-tr">«компилирует запросы <code>IQueryable</code> и <code>IQueryable&lt;T&gt;</code> в деревья выражений».</span> Провайдер обходит узлы (<code>Where</code> → <code>LessThan</code> → …) и генерирует нативный запрос. Ограничение — обратная сторона: «Expression trees can\'t contain <code>await</code> expressions, or <code>async</code> lambda expressions». <span class="ru-tr">«Деревья выражений не могут содержать <code>await</code>-выражения или <code>async</code>-лямбды».</span> В <code>IQueryable</code>-лямбду идёт только переводимое подмножество.',
      sources: ["ms-et", "ms-linq"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Одна лямбда: Func непрозрачен, Expression виден",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["Func<int,bool>             del = num => num < 5;", "Expression<Func<int,bool>> exp = num => num < 5;", "del(4)          // True — но внутрь не заглянуть", "exp.NodeType    // Lambda", "exp.Body.NodeType // LessThan — дерево видно"],
      predictAt: 2, predictQ: 'Для <code>Func del</code> и <code>Expression exp</code> из одной лямбды <code>num =&gt; num &lt; 5</code>: что даст <code>del(4)</code>, <code>exp.NodeType</code> и <code>exp.Body.NodeType</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>del</code> — делегат: можно <span class="hl">вызвать</span> (<code>del(4)</code> = <code>True</code>), но структуру не увидеть. Он <b>непрозрачен</b>.', nodes: [{ id: "d", kind: "gate", at: { zone: "opaque", row: 0 }, state: "ok", label: "del(4)", detail: "True", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>exp</code> — дерево: у корня <code>NodeType == <span class="hl">Lambda</span></code>. Его можно инспектировать без исполнения.', nodes: [{ id: "d", kind: "gate", at: { zone: "opaque", row: 0 }, state: "ok", label: "del(4)", detail: "True" }, { id: "n", kind: "gate", at: { zone: "inspect", row: 0 }, state: "ok", label: "exp.NodeType", detail: "Lambda", accent: true }], edges: [] },
        { codeLine: 4, out: "del=True exp.NodeType=Lambda exp.Body=LessThan", caption: 'Панель: <span class="hl">del=True exp.NodeType=Lambda exp.Body=LessThan</span> (реальный прогон). Делегат отдал результат, дерево — свою форму.', nodes: [{ id: "d", kind: "gate", at: { zone: "opaque", row: 0 }, state: "ok", label: "результат", detail: "del=True" }, { id: "b", kind: "gate", at: { zone: "inspect", row: 0 }, state: "ok", label: "Body", detail: "LessThan", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — доказательство прогоном. Из <b>одной</b> лямбды <code>num =&gt; num &lt; 5</code> получаем две сущности: <code>Func</code>-делегат отдаёт только результат вызова (<code>del(4)</code> → <code>True</code>), заглянуть в его тело нельзя. <code>Expression&lt;Func&lt;&gt;&gt;</code> открыт для инспекции: <code>NodeType == Lambda</code>, <code>Body.NodeType == LessThan</code>. Реальный вывод: <code>del=True exp.NodeType=Lambda exp.Body=LessThan</code>. Это буквально фраза «code as a structure that you <b>examine, modify, or execute</b>» <span class="ru-tr">«код как структура, которую можно исследовать, изменять или исполнять»</span>, видимая в свойствах объекта: делегат — исполнить, дерево — исследовать (а исполнить его можно потом, через <code>Compile()</code> — это следующие уроки секции).',
      sources: ["ms-et"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int,bool&gt; del = num =&gt; num &lt; 5; Expression&lt;Func&lt;int,bool&gt;&gt; exp = num =&gt; num &lt; 5; Console.WriteLine($"del={del(4)} exp.NodeType={exp.NodeType} exp.Body={exp.Body.NodeType}");</code> — что напечатает?',
      options: ["del=True exp.NodeType=Lambda exp.Body=LessThan", "del=True exp.NodeType=LessThan exp.Body=Lambda", "del=4 exp.NodeType=Func exp.Body=Bool", "del=True exp.NodeType=Lambda exp.Body=Lambda"], correctIndex: 0, xp: 10,
      okText: 'Из <b>одной</b> лямбды: <code>Func</code> — делегат (<code>del(4)=True</code>), <code>Expression</code> — дерево (корень <code>Lambda</code>, тело <code>LessThan</code>). Вывод: <b>del=True exp.NodeType=Lambda exp.Body=LessThan</b>.',
      noText: 'Тип при присваивании решает: <code>Func</code> исполним, <code>Expression&lt;Func&lt;&gt;&gt;</code> — «code in a tree-like data structure». <span class="ru-tr">«код в древовидной структуре данных».</span> Корень — <code>Lambda</code>, тело — <code>LessThan</code>. Вывод: <b>del=True exp.NodeType=Lambda exp.Body=LessThan</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "del=True exp.NodeType=Lambda exp.Body=LessThan" }, sourceRefs: ["ms-et"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; exp = num =&gt; num &lt; 5; Func&lt;int,bool&gt; f = exp.Compile(); Console.WriteLine($"{f(4)} {f(9)}");</code> — что напечатает?',
      options: ["True False", "False True", "4 9", "True True"], correctIndex: 0, xp: 10,
      okText: 'Дерево <b>можно исполнить</b>, скомпилировав в делегат: <code>exp.Compile()</code> даёт <code>Func&lt;int,bool&gt;</code>. <code>f(4)</code> → <code>4&lt;5</code> = <b>True</b>, <code>f(9)</code> → <b>False</b>. Вывод: <b>True False</b>.',
      noText: '«code as a structure that you examine, modify, or <b>execute</b>». <span class="ru-tr">«код как структура, которую можно исследовать, изменять или исполнять».</span> После <code>Compile()</code> дерево становится делегатом: <code>f(4)=True</code>, <code>f(9)=False</code> → <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-et"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; exprTree = num =&gt; num &lt; 5; var param=(ParameterExpression)exprTree.Parameters[0]; var op=(BinaryExpression)exprTree.Body; var left=(ParameterExpression)op.Left; var right=(ConstantExpression)op.Right; Console.WriteLine($"{param.Name} =&gt; {left.Name} {op.NodeType} {right.Value}");</code> — что напечатает?',
      options: ["num => num LessThan 5", "num => num < 5", "num => LessThan num 5", "x => x LessThan 5"], correctIndex: 0, xp: 10,
      okText: 'Дерево разбирается по свойствам: параметр <code>num</code>, тело <code>BinaryExpression</code> с <code>NodeType=LessThan</code>, левый лист — параметр <code>num</code>, правый — константа <code>5</code>. Вывод: <b>num => num LessThan 5</b>.',
      noText: '«Every node in an expression tree is an object of a class that is derived from <code>Expression</code>». <span class="ru-tr">«Каждый узел дерева выражения — объект класса, производного от <code>Expression</code>».</span> <code>op.NodeType</code> — это <b>LessThan</b>, не символ <code>&lt;</code>. Вывод: <b>num => num LessThan 5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "num => num LessThan 5" }, sourceRefs: ["ms-et", "ms-interpreting"],
    },
  ],

  takeaways: [
    { icon: "why", k: "код как данные", v: '«represent code in a <span class="hl">tree-like data structure</span>, where each node is an expression». <span class="ru-tr">«представляют код в древовидной структуре данных, где каждый узел — выражение».</span> Дерево — объектный граф из <code>System.Linq.Expressions</code>, не строка и не байткод.' },
    { icon: "cost", k: "Func vs Expression", v: 'Тип при присваивании решает: <code>Func</code> = делегат (исполнить), <code>Expression&lt;Func&lt;&gt;&gt;</code> = дерево (<code>emits code to build an expression tree</code>). <span class="ru-tr">(порождает код, строящий дерево).</span> Замер: одна лямбда → <code>del=True</code>, <code>exp.Body=LessThan</code>.' },
    { icon: "avoid", k: "зачем и лимиты", v: 'Дерево «examine, modify, or execute» <span class="ru-tr">«исследовать, изменять или исполнять»</span> — EF Core транслирует его «into SQL that executes in the database engine». <span class="ru-tr">«в SQL, исполняемый в движке БД».</span> Но только expression-лямбды, без statement-лямбд, <code>await</code>, <code>async</code>.' },
  ],

  foot: 'урок · <b>деревья выражений: код как данные</b> · 5 анимир. разборов · панель Func vs Expression · дизайн <b>mid</b>',
};
