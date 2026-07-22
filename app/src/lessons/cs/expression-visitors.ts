/**
 * Lesson: ExpressionVisitor — traversal & transformation (CS.S11.expression-visitors) — expert
 * density, 5 animated deep-dives. Every node in an expression tree derives from Expression, so
 * walking a tree is a straightforward recursive operation: start at the root, determine the node
 * kind, recurse into children. The built-in ExpressionVisitor (System.Linq.Expressions) is the
 * production implementation that handles all node types; you override VisitBinary/VisitConstant/etc
 * to inspect or REWRITE. Because trees are immutable, a transforming visitor doesn't mutate — it
 * builds a NEW tree, copying the old and replacing nodes (e.g. Add -> Multiply). The rewritten tree
 * compiles and runs like any other.
 *
 * SIGNATURE machine panel (s5): an ExpressionVisitor that rewrites every Add into Multiply — the
 * SAME source x => x + x yields 10 (original) and 25 (rewritten x*x) at x=5 (REAL run-csharp
 * measurement, this file's exec cards on the app backend :5080).
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../expression-trees/expression-trees-interpreting (ms.date 2023-03-06) and
 * learn.microsoft.com/.../advanced-topics/expression-trees/ (ms.date 2025-10-13), fetched +
 * substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from one of those pages (per-item sources[] name each page);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "Decomposed expression: num => num LessThan 5" · c2 "10 25" · c3 "5".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.expression-visitors/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: every node derives from Expression -> recursive traversal.
const Z_ROOT: Zone = { id: "root", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТАРТ = КОРЕНЬ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "определи вид узла", subCls: "vz-zsub", subY: 47 };
const Z_CHILD: Zone = { id: "child", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РЕКУРСИЯ В ДЕТЕЙ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "повтори на каждом", subCls: "vz-zsub good", subY: 47 };
const REC_ZONES: Zone[] = [Z_ROOT, Z_CHILD];

// s2: decompose num < 5 by hand (doc example).
const Z_DEC: Zone = { id: "dec", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "РАЗБОР num < 5 ПО СВОЙСТВАМ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Parameters[0], Body, .Left, .Right", subCls: "vz-zsub", subY: 40 };
const DEC_ZONES: Zone[] = [Z_DEC];

// s3: built-in ExpressionVisitor — override VisitXxx.
const Z_BASE: Zone = { id: "base", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ExpressionVisitor", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "готовый обходчик", subCls: "vz-zsub", subY: 47 };
const Z_OVR: Zone = { id: "ovr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "override VisitBinary", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "перехват узла", subCls: "vz-zsub good", subY: 47 };
const VISIT_ZONES: Zone[] = [Z_BASE, Z_OVR];

// s4: immutable -> transform builds a NEW tree.
const Z_OLD: Zone = { id: "old", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТАРОЕ ДЕРЕВО", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "неизменяемо", subCls: "vz-zsub", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "НОВОЕ ДЕРЕВО", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "копия + замена узлов", subCls: "vz-zsub good", subY: 47 };
const XFORM_ZONES: Zone[] = [Z_OLD, Z_NEW];

// s5 (SIGNATURE): Add -> Multiply rewrite, same source two results.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "x => x + x", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "исходник", subCls: "vz-zsub", subY: 47 };
const Z_REW: Zone = { id: "rew", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Add → Multiply", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "x * x после обхода", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_SRC, Z_REW];

export const expressionVisitors: LessonData = {
  id: "CS.S11.expression-visitors",
  track: "CS",
  section: "CS.S11",
  module: "S11.4",
  lang: "csharp",
  title: "ExpressionVisitor: обход и трансформация",
  kicker: "C# вглубь · S11 · обход дерева",
  home: { subtitle: "рекурсивный обход, override VisitBinary, immutable → новое дерево", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-interp", kind: "doc", org: "Microsoft Learn", title: "Interpret Expressions (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/expression-trees-interpreting", date: "2023-03-06" },
    { id: "ms-et", kind: "doc", org: "Microsoft Learn", title: "Expression Trees (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/", date: "2025-10-13" },
  ],

  spec: [
    { text: "«Every node in an expression tree is <span class=\"hl\">an object of a class that is derived from <code>Expression</code></span>. That design makes visiting all the nodes in an expression tree a relatively straightforward recursive operation.» <span class=\"ru-tr\">«Каждый узел дерева выражения — объект класса, производного от <code>Expression</code>. Такой дизайн делает обход всех узлов дерева относительно простой рекурсивной операцией.»</span>", source: "ms-interp" },
  ],
  edgeCases: [
    { text: "Стратегия обхода: «The general strategy is to <span class=\"hl\">start at the root node and determine what kind of node it is</span>. If the node type has children, recursively visit the children». <span class=\"ru-tr\">«Общая стратегия — начать с корневого узла и определить, что это за узел. Если у узла есть дети, рекурсивно посетить их».</span>", source: "ms-interp" },
    { text: "В .NET уже есть готовый обходчик: «A full implementation is included in .NET Standard under the name <code>ExpressionVisitor</code> and <span class=\"hl\">can handle all the possible node types</span>». <span class=\"ru-tr\">«Полная реализация включена в .NET Standard под именем <code>ExpressionVisitor</code> и умеет обрабатывать все возможные типы узлов».</span> Свой visitor из статьи — лишь учебный.", source: "ms-interp" },
    { text: "Трансформация не мутирует — строит <b>новое</b> дерево: «you must <span class=\"hl\">construct a new expression tree by copying the existing one and replacing nodes in it</span>. You use an expression tree visitor to traverse the existing expression tree». <span class=\"ru-tr\">«нужно построить новое дерево, скопировав существующее и заменив в нём узлы. Для обхода существующего дерева используют посетителя дерева выражений».</span>", source: "ms-et" },
  ],

  misconceptions: [
    {
      wrong: "чтобы изменить дерево, находишь нужный узел и мутируешь его на месте — как поле объекта",
      hook: 'Заблуждение: <span class="wrong">нашёл узел — поменял его на месте</span>. Деревья <b>неизменяемы</b>, поэтому трансформация — это <span class="hl">построение нового</span> дерева: «you must <span class="hl">construct a new expression tree by copying the existing one and replacing nodes in it</span>. You use an expression tree visitor to traverse the existing expression tree». <span class="ru-tr">«нужно построить новое дерево, скопировав существующее и заменив в нём узлы. Для обхода существующего дерева используют посетителя дерева выражений».</span> Обход прост, потому что «Every node in an expression tree is <span class="hl">an object of a class that is derived from <code>Expression</code></span>. That design makes visiting all the nodes in an expression tree a relatively straightforward recursive operation». <span class="ru-tr">«Каждый узел — объект класса, производного от <code>Expression</code>. Такой дизайн делает обход относительно простой рекурсивной операцией».</span> В .NET готовый обходчик — <code>ExpressionVisitor</code>. Ниже <b>пять разборов</b> и <b>машинная панель</b>: visitor, переписывающий каждый <code>Add</code> в <code>Multiply</code> — из одного <code>x =&gt; x + x</code> два результата: <code>10</code> (исходник) и <code>25</code> (переписан в <code>x * x</code>) при <code>x=5</code> (реальный прогон).',
      source: ["ms-et", "ms-interp"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Почему рекурсия", title: "Каждый узел — Expression → обход = рекурсия",
      viewBox: "0 0 340 210", zones: REC_ZONES,
      code: ["// каждый узел : Expression → однородный обход", "// 1) старт с корня, определи вид узла", "// 2) есть дети? рекурсивно обойди детей", "// 3) на каждом ребёнке — то же самое"],
      scenes: [
        { codeLine: 0, out: "", caption: '«Every node in an expression tree is <span class="hl">an object of a class that is derived from <code>Expression</code></span>». <span class="ru-tr">«Каждый узел — объект класса, производного от <code>Expression</code>».</span> Общий базовый тип.', nodes: [{ id: "r", kind: "obj", at: { zone: "root", row: 0 }, typeTag: "Expression", value: "корень", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '«start at the <span class="hl">root node</span> and determine what kind of node it is». <span class="ru-tr">«начать с корневого узла и определить, что это за узел».</span> Вид узла — по <code>NodeType</code>.', nodes: [{ id: "r", kind: "obj", at: { zone: "root", row: 0 }, typeTag: "root", value: "какой вид?" }, { id: "q", kind: "gate", at: { zone: "root", row: 1 }, state: "ok", label: "NodeType", detail: "Lambda / Add / …", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '«If the node type has children, <span class="hl">recursively visit the children</span>». <span class="ru-tr">«Если у узла есть дети, рекурсивно посетить их».</span> На каждом ребёнке — та же процедура.', nodes: [{ id: "r", kind: "obj", at: { zone: "root", row: 0 }, typeTag: "root", value: "Add" }, { id: "l", kind: "obj", at: { zone: "child", row: 0 }, typeTag: "Left", value: "рекурсия", accent: true }, { id: "rt", kind: "obj", at: { zone: "child", row: 1 }, typeTag: "Right", value: "рекурсия", accent: true }], edges: [{ id: "e1", from: "l", to: "r" }, { id: "e2", from: "rt", to: "r", accent: true }] },
      ],
      explain: 'Обход дерева — рекурсия, и это следствие общего базового типа. Дословно: «Every node in an expression tree is <span class="hl">an object of a class that is derived from <code>Expression</code></span>. That design makes visiting all the nodes in an expression tree a relatively straightforward recursive operation». <span class="ru-tr">«Каждый узел дерева выражения — объект класса, производного от <code>Expression</code>. Такой дизайн делает обход всех узлов относительно простой рекурсивной операцией».</span> Алгоритм: «The general strategy is to <span class="hl">start at the root node and determine what kind of node it is</span>. If the node type has children, recursively visit the children. At each child node, repeat the process used at the root node». <span class="ru-tr">«Общая стратегия — начать с корневого узла и определить, что это за узел. Если у узла есть дети, рекурсивно посетить их. На каждом дочернем узле повторить процедуру, применённую к корню».</span> Определяешь вид (по <code>NodeType</code>), спускаешься в детей (<code>.Left</code>/<code>.Right</code>/<code>.Body</code>), повторяешь.',
      sources: ["ms-interp"],
    },
    {
      id: "s2", num: "02", kicker: "Ручной разбор", title: "Декомпозиция num < 5 по свойствам узлов",
      viewBox: "0 0 340 276", zones: DEC_ZONES,
      code: ["Expression<Func<int,bool>> exprTree = num => num < 5;", "var param = (ParameterExpression)exprTree.Parameters[0];", "var operation = (BinaryExpression)exprTree.Body;", "var left = (ParameterExpression)operation.Left; var right = (ConstantExpression)operation.Right;"],
      predictAt: 1, predictQ: 'Декомпозиция дерева <code>num =&gt; num &lt; 5</code> печатает <code>"Decomposed expression: " + param.Name + " =&gt; " + left.Name + " " + operation.NodeType + " " + right.Value</code>. Что выйдет?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>exprTree.Parameters[0]</code> — параметр <code>num</code>. Спускаемся по <span class="hl">свойствам</span> узлов, приводя к конкретному типу выражения.', nodes: [{ id: "p", kind: "obj", at: { zone: "dec", row: 0, col: 0 }, typeTag: "Parameter", value: "num", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>exprTree.Body</code> — <code>BinaryExpression</code>. Его <code>NodeType</code> — <span class="hl">LessThan</span>.', nodes: [{ id: "b", kind: "obj", at: { zone: "dec", row: 0, col: 0 }, typeTag: "Binary", value: "LessThan", accent: true }, { id: "p", kind: "obj", at: { zone: "dec", row: 1, col: 0 }, typeTag: "Parameter", value: "num" }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>operation.Left</code> — параметр <code>num</code>, <code>operation.Right</code> — константа <code>5</code>. Два листа бинарного узла.', nodes: [{ id: "b", kind: "obj", at: { zone: "dec", row: 0, col: 0 }, typeTag: "Binary", value: "LessThan" }, { id: "l", kind: "obj", at: { zone: "dec", row: 1, col: 0 }, typeTag: "Left", value: "num" }, { id: "r", kind: "obj", at: { zone: "dec", row: 1, col: 1 }, typeTag: "Right", value: "5", accent: true }], edges: [{ id: "e1", from: "l", to: "b" }, { id: "e2", from: "r", to: "b", accent: true }] },
        { codeLine: 3, out: "Decomposed expression: num => num LessThan 5", caption: 'Панель: <span class="hl">Decomposed expression: num =&gt; num LessThan 5</span> (реальный прогон). Дерево прочитано целиком по свойствам.', nodes: [{ id: "res", kind: "gate", at: { zone: "dec", row: 0, col: 0 }, state: "ok", label: "результат", detail: "num => num LessThan 5", accent: true }], edges: [] },
      ],
      explain: 'Прежде чем автоматизировать обход, дока показывает <b>ручной</b> разбор — как декомпозируется <code>num =&gt; num &lt; 5</code>: «The following code example demonstrates how the expression tree that represents the lambda expression <code>num =&gt; num &lt; 5</code> <span class="hl">can be decomposed into its parts</span>». <span class="ru-tr">«Следующий пример показывает, как дерево, представляющее лямбду <code>num =&gt; num &lt; 5</code>, можно разложить на части».</span> Спускаешься по свойствам: <code>Parameters[0]</code> → <code>num</code>; <code>Body</code> → <code>BinaryExpression</code>; <code>.Left</code> → параметр <code>num</code>; <code>.Right</code> → константа <code>5</code>. Печать даёт <code>Decomposed expression: num =&gt; num LessThan 5</code> (реальный прогон совпадает с выводом доки). Каждое приведение (<code>(ParameterExpression)</code>, <code>(BinaryExpression)</code>) — знание вида узла заранее; visitor это делает через <code>NodeType</code>-диспетчеризацию.',
      sources: ["ms-interp"],
    },
    {
      id: "s3", num: "03", kicker: "Встроенный обходчик", title: "ExpressionVisitor: override VisitBinary/VisitConstant",
      viewBox: "0 0 340 210", zones: VISIT_ZONES,
      code: ["class ToMul : ExpressionVisitor {", "  protected override Expression VisitBinary(BinaryExpression n) {", "    if (n.NodeType == ExpressionType.Add)", "      return Expression.Multiply(Visit(n.Left), Visit(n.Right));", "    return base.VisitBinary(n); } }"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ExpressionVisitor</code> — <span class="hl">готовый</span> рекурсивный обходчик из <code>System.Linq.Expressions</code>. Наследуешься и переопределяешь нужный <code>VisitXxx</code>.', nodes: [{ id: "b", kind: "obj", at: { zone: "base", row: 0 }, typeTag: "ExpressionVisitor", value: "обходит всё", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>override VisitBinary</code> — перехватываешь <b>бинарные</b> узлы (<code>Add</code>, <code>LessThan</code>…). Base-обход детей — через <code>Visit(...)</code>.', nodes: [{ id: "b", kind: "obj", at: { zone: "base", row: 0 }, typeTag: "ExpressionVisitor", value: "база" }, { id: "o", kind: "gate", at: { zone: "ovr", row: 0 }, state: "ok", label: "VisitBinary", detail: "перехват", accent: true }], edges: [{ id: "e", from: "b", to: "o", accent: true }] },
        { codeLine: 4, out: "", caption: 'Не свой узел — <code>base.VisitBinary(n)</code>: <span class="hl">штатный обход</span> детей. Так visitor покрывает всё дерево, а ты правишь лишь интересное.', nodes: [{ id: "o", kind: "gate", at: { zone: "ovr", row: 0 }, state: "ok", label: "мой Add", detail: "→ Multiply" }, { id: "d", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "остальное", detail: "base.Visit", accent: true }], edges: [] },
      ],
      explain: 'Писать рекурсию руками не нужно — в .NET есть готовый обходчик: «A full implementation is included in .NET Standard under the name <code>ExpressionVisitor</code> and <span class="hl">can handle all the possible node types</span>». <span class="ru-tr">«Полная реализация включена в .NET Standard под именем <code>ExpressionVisitor</code> и умеет обрабатывать все возможные типы узлов».</span> Наследуешься от <code>ExpressionVisitor</code> и переопределяешь метод под нужный вид узла: <code>VisitBinary</code> для бинарных, <code>VisitConstant</code> для констант, <code>VisitParameter</code> для параметров и т.д. Внутри вызываешь <code>Visit(child)</code>, чтобы рекурсивно обойти детей, или <code>base.VisitBinary(node)</code>, чтобы отдать узел штатному обходу. Это ровно тот учебный «recursive algorithm», что дока строит вручную, но промышленный: «you can visit and process many more different types of expressions». <span class="ru-tr">«можно посещать и обрабатывать намного больше разных типов выражений».</span>',
      sources: ["ms-interp"],
    },
    {
      id: "s4", num: "04", kicker: "Трансформация", title: "Immutable → visitor строит НОВОЕ дерево, не мутирует",
      viewBox: "0 0 340 210", zones: XFORM_ZONES,
      code: ["// дерево неизменяемо: узел на месте не поменять", "// трансформация = копия старого + замена узлов", "return Expression.Multiply(Visit(n.Left), Visit(n.Right));", "// старое дерево цело; visitor вернул НОВОЕ поддерево"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Узел дерева <span class="hl">неизменяем</span> — «поменять на месте» нельзя. Значит трансформация не мутирует исходник.', nodes: [{ id: "o", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Add", value: "исходный", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '«construct a <span class="hl">new expression tree by copying the existing one and replacing nodes</span>». <span class="ru-tr">«построить новое дерево, скопировав существующее и заменив узлы».</span> Visitor возвращает новые узлы.', nodes: [{ id: "o", kind: "obj", at: { zone: "old", row: 0 }, typeTag: "Add", value: "цел" }, { id: "n", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "Multiply", value: "новый узел", accent: true }], edges: [{ id: "e", from: "o", to: "n", accent: true }] },
        { codeLine: 3, out: "", caption: 'Возврат нового узла из <code>VisitBinary</code> вплетается в <span class="hl">новое</span> дерево. Старое остаётся исполнимым как было.', nodes: [{ id: "o", kind: "gate", at: { zone: "old", row: 0 }, state: "ok", label: "старое", detail: "x + x" }, { id: "n", kind: "gate", at: { zone: "new", row: 0 }, state: "ok", label: "новое", detail: "x * x", accent: true }], edges: [] },
      ],
      explain: 'Раз узлы неизменяемы, трансформирующий visitor <b>строит новое</b> дерево, а не правит старое. Дословно: «Expression trees are immutable. If you want to modify an expression tree, you must <span class="hl">construct a new expression tree by copying the existing one and replacing nodes in it</span>. You use an expression tree visitor to traverse the existing expression tree». <span class="ru-tr">«Деревья выражений неизменяемы. Чтобы изменить дерево, нужно построить новое, скопировав существующее и заменив в нём узлы. Для обхода существующего дерева используют посетителя дерева выражений».</span> Механика: в <code>VisitBinary</code> ты вызываешь <code>Visit(node.Left)</code>/<code>Visit(node.Right)</code> (они рекурсивно вернут — возможно новые — поддеревья) и собираешь новый узел, например <code>Expression.Multiply(...)</code> вместо <code>Add</code>. Возвращённый узел встраивается в новое дерево. Исходное дерево не тронуто — его всё ещё можно скомпилировать и получить прежний результат.',
      sources: ["ms-et"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Visitor Add→Multiply: один исходник, два результата",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["Expression<Func<int,int>> e = x => x + x;   // Add", "var e2 = (Expression<Func<int,int>>)new ToMul().Visit(e);", "// ToMul переписал Add → Multiply, вернул НОВОЕ дерево", "e.Compile()(5)    // 10  (x + x)", "e2.Compile()(5)   // 25  (x * x)"],
      predictAt: 2, predictQ: 'Visitor <code>ToMul</code> переписывает каждый <code>Add</code> в <code>Multiply</code>. Из <code>x =&gt; x + x</code> получены <code>e</code> и <code>e2</code>. Что даст <code>$"{e.Compile()(5)} {e2.Compile()(5)}"</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Исходник <code>x =&gt; x + x</code> — тело <code>Add</code>. <code>e.Compile()(5)</code> = <code>5 + 5</code> = <span class="hl">10</span>.', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Add", value: "x + x", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>ToMul.Visit(e)</code> обходит дерево и переписывает <code>Add</code> в <span class="hl">Multiply</span>, возвращая <b>новое</b> дерево <code>e2</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Add", value: "x + x" }, { id: "m", kind: "obj", at: { zone: "rew", row: 0 }, typeTag: "Multiply", value: "x * x", accent: true }], edges: [{ id: "e", from: "s", to: "m", accent: true }] },
        { codeLine: 4, out: "10 25", caption: 'Панель: <span class="hl">10 25</span> (реальный прогон). Исходное дерево — <code>10</code>, переписанное — <code>25</code>. Одна лямбда, два поведения.', nodes: [{ id: "o", kind: "gate", at: { zone: "src", row: 0 }, state: "ok", label: "e(5)", detail: "10" }, { id: "r", kind: "gate", at: { zone: "rew", row: 0 }, state: "ok", label: "e2(5)", detail: "25", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — трансформация в действии. Visitor <code>ToMul : ExpressionVisitor</code> переопределяет <code>VisitBinary</code>: если <code>node.NodeType == ExpressionType.Add</code>, возвращает <code>Expression.Multiply(Visit(node.Left), Visit(node.Right))</code>, иначе — <code>base.VisitBinary(node)</code>. Применённый к <code>x =&gt; x + x</code>, он строит <b>новое</b> дерево <code>x =&gt; x * x</code> (исходное не тронуто — «construct a new expression tree… replacing nodes» <span class="ru-tr">«построить новое дерево… заменив узлы»</span>). Оба компилируются и исполняются: при <code>x=5</code> исходник даёт <code>10</code> (<code>5+5</code>), переписанный — <code>25</code> (<code>5*5</code>). Реальный вывод: <code>10 25</code>. Это и есть суть visitor-трансформации: обойти дерево, подменить узлы, получить новую — исполнимую — программу из старой. Так работают перезаписи запросов в ORM и оптимизаторы деревьев.',
      sources: ["ms-et", "ms-interp"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; exprTree = num =&gt; num &lt; 5; var param=(ParameterExpression)exprTree.Parameters[0]; var operation=(BinaryExpression)exprTree.Body; var left=(ParameterExpression)operation.Left; var right=(ConstantExpression)operation.Right; Console.WriteLine($"Decomposed expression: {param.Name} =&gt; {left.Name} {operation.NodeType} {right.Value}");</code> — что напечатает?',
      options: ["Decomposed expression: num => num LessThan 5", "Decomposed expression: num => num < 5", "Decomposed expression: num LessThan 5", "num => num LessThan 5"], correctIndex: 0, xp: 10,
      okText: 'Дерево разбирается по свойствам: параметр <code>num</code>, тело <code>BinaryExpression</code> с <code>NodeType=LessThan</code>, листья — <code>num</code> и <code>5</code>. Вывод: <b>Decomposed expression: num => num LessThan 5</b> (как в доке).',
      noText: '«start at the root node and determine what kind of node it is». <span class="ru-tr">«начать с корня и определить вид узла».</span> <code>operation.NodeType</code> — это <b>LessThan</b>, не <code>&lt;</code>. Вывод: <b>Decomposed expression: num => num LessThan 5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Decomposed expression: num => num LessThan 5" }, sourceRefs: ["ms-interp"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class ToMul : ExpressionVisitor { protected override Expression VisitBinary(BinaryExpression n){ if(n.NodeType==ExpressionType.Add) return Expression.Multiply(Visit(n.Left), Visit(n.Right)); return base.VisitBinary(n);} } Expression&lt;Func&lt;int,int&gt;&gt; e = x =&gt; x + x; var e2 = (Expression&lt;Func&lt;int,int&gt;&gt;)new ToMul().Visit(e); Console.WriteLine($"{e.Compile()(5)} {e2.Compile()(5)}");</code> — что напечатает?',
      options: ["10 25", "25 10", "10 10", "25 25"], correctIndex: 0, xp: 10,
      okText: 'Visitor строит <b>новое</b> дерево, переписав <code>Add</code>→<code>Multiply</code>. Исходное: <code>5+5=10</code>. Переписанное: <code>5*5=25</code>. Исходник не тронут (immutable). Вывод: <b>10 25</b>.',
      noText: '«construct a new expression tree by copying the existing one and replacing nodes». <span class="ru-tr">«построить новое дерево, заменив узлы».</span> <code>e</code> остаётся <code>x+x</code> (=10), <code>e2</code> становится <code>x*x</code> (=25). Вывод: <b>10 25</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "10 25" }, sourceRefs: ["ms-et", "ms-interp"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Counter : ExpressionVisitor { public int N; public override Expression Visit(Expression n){ if(n!=null) N++; return base.Visit(n);} } Expression&lt;Func&lt;int,int&gt;&gt; e = a =&gt; a + 3; var c = new Counter(); c.Visit(e); Console.WriteLine(c.N);</code> — сколько узлов обойдёт?',
      options: ["5", "3", "4", "2"], correctIndex: 0, xp: 10,
      okText: '<code>Visit</code> рекурсивно обходит всё: <b>Lambda</b>, тело <b>Add</b>, параметр <b>a</b> в теле, константа <b>3</b>, и <b>a</b> в списке параметров лямбды → <b>5</b> узлов.',
      noText: 'Обход покрывает и тело, и список параметров: Lambda + Add + Parameter(a в теле) + Constant(3) + Parameter(a в сигнатуре) = <b>5</b>. «visiting all the nodes… a relatively straightforward recursive operation». <span class="ru-tr">«обход всех узлов… относительно простая рекурсивная операция».</span>',
      verify: { kind: "exec", run: "dotnet run", expect: "5" }, sourceRefs: ["ms-interp"],
    },
  ],

  takeaways: [
    { icon: "why", k: "обход = рекурсия", v: '«Every node… is <span class="hl">an object of a class that is derived from <code>Expression</code></span>… a relatively straightforward recursive operation». <span class="ru-tr">«Каждый узел — объект класса, производного от <code>Expression</code>… относительно простая рекурсивная операция».</span> Старт с корня, вниз по детям. Замер обхода: <code>5</code> узлов.' },
    { icon: "cost", k: "ExpressionVisitor готов", v: '«A full implementation is included in .NET Standard under the name <code>ExpressionVisitor</code> and <span class="hl">can handle all the possible node types</span>». <span class="ru-tr">«Полная реализация — <code>ExpressionVisitor</code>, обрабатывает все типы узлов».</span> Наследуйся, override <code>VisitBinary</code>/…, зови <code>base.Visit</code> для остального.' },
    { icon: "avoid", k: "трансформация = новое дерево", v: 'Immutable: «construct a <span class="hl">new expression tree by copying the existing one and replacing nodes</span>». <span class="ru-tr">«построить новое дерево, заменив узлы».</span> Замер: visitor <code>Add→Multiply</code> из <code>x+x</code> даёт <code>10 25</code> — исходник цел, переписанное дерево исполнимо.' },
  ],

  foot: 'урок · <b>ExpressionVisitor: обход и трансформация</b> · 5 анимир. разборов · панель Add→Multiply 10/25 · дизайн <b>mid</b>',
};
