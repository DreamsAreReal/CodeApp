/**
 * Lesson: IQueryable providers translate the tree (CS.S11.iqueryable-and-expressions) — expert
 * density, 5 animated deep-dives. This ties the whole section back to LINQ: the compiler compiles
 * IQueryable / IQueryable<T> queries to EXPRESSION TREES, and an IQueryable provider walks that tree
 * to translate it to a native query. A complex provider (EF Core) translates complete LINQ queries
 * to SQL; a simple provider might examine only one method-call node. The mechanism that makes this
 * possible: capturing the lambda as Expression<Func<>> gives a NAVIGABLE tree (Body/Left/Right/
 * Constant.Value), whereas a Func<> is opaque — only its result is observable.
 *
 * This lesson goes DEEPER than CS.S3.ienumerable-iqueryable (which named the delegate-vs-tree split
 * and where the query runs): here the focus is HOW a provider reads the tree node-by-node to emit a
 * query, proven by capturing and walking the tree.
 *
 * SIGNATURE machine panel (s5): the same lambda x => x > 2 — Func is opaque (only del(5)=True), the
 * Expression exposes the tree a provider reads: NodeType=GreaterThan, right leaf Constant 2, so a
 * mini "provider" emits WHERE x GreaterThan 2 (REAL run-csharp measurement, this file's exec cards).
 *
 * NOTE on runnability: a full custom IQueryable provider (or AsQueryable / System.Linq.Queryable)
 * is NOT referenced by the run-csharp scripting host, so it can't run — the provider spectrum
 * (EF Core -> SQL) is taught conceptually from the docs. What DOES run deterministically, and what
 * the exec cards prove, is the enabling mechanism: Expression<Func<int,bool>> captures a navigable
 * TREE (.Body/.NodeType/Constant.Value) while Func<int,bool> is opaque.
 *
 * Accuracy contract (G4/G7/G8) — verified against
 * learn.microsoft.com/.../csharp/linq/ (ms.date 2025-12-01) and
 * learn.microsoft.com/.../advanced-topics/expression-trees/ (ms.date 2025-10-13), fetched +
 * substring-checked 2026-07-22:
 *   - every English quote is VERBATIM from one of those pages (per-item sources[] name each page);
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "del:True tree.NodeType:GreaterThan right:2" · c2 "WHERE x GreaterThan 2" ·
 *     c3 "Lambda|x|GreaterThan|Boolean".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S11.iqueryable-and-expressions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: compiler compiles IQueryable queries to expression trees.
const Z_Q: Zone = { id: "q", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IQueryable-запрос", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Where(x => …)", subCls: "vz-zsub", subY: 47 };
const Z_ET: Zone = { id: "et", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "EXPRESSION TREE", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "компилятор строит дерево", subCls: "vz-zsub good", subY: 47 };
const Q_ZONES: Zone[] = [Z_Q, Z_ET];

// s2: provider walks the tree -> native query.
const Z_TREE: Zone = { id: "tree", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕРЕВО ЗАПРОСА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "узлы: Where, >, 2", subCls: "vz-zsub", subY: 47 };
const Z_NATIVE: Zone = { id: "native", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ПРОВАЙДЕР → SQL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "обходит и транслирует", subCls: "vz-zsub heap", subY: 47 };
const XLATE_ZONES: Zone[] = [Z_TREE, Z_NATIVE];

// s3: the provider complexity spectrum.
const Z_SPECTRUM: Zone = { id: "spectrum", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "СПЕКТР СЛОЖНОСТИ ПРОВАЙДЕРОВ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "один узел → … → полный LINQ в SQL (EF Core)", subCls: "vz-zsub", subY: 40 };
const SPEC_ZONES: Zone[] = [Z_SPECTRUM];

// s4: Func opaque vs Expression navigable — the enabling mechanism.
const Z_FUNC: Zone = { id: "func", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Func — НЕПРОЗРАЧЕН", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "виден только результат", subCls: "vz-zsub good", subY: 47 };
const Z_EXPR: Zone = { id: "expr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Expression — ДЕРЕВО", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "Body / Left / Right", subCls: "vz-zsub", subY: 47 };
const OPAQUE_ZONES: Zone[] = [Z_FUNC, Z_EXPR];

// s5 (SIGNATURE): mini-provider emits WHERE from the tree.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "x => x > 2", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "как дерево", subCls: "vz-zsub", subY: 47 };
const Z_WHERE: Zone = { id: "where", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "WHERE x GreaterThan 2", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "мини-провайдер по узлам", subCls: "vz-zsub heap", subY: 47 };
const SIG_ZONES: Zone[] = [Z_SRC, Z_WHERE];

export const iqueryableAndExpressions: LessonData = {
  id: "CS.S11.iqueryable-and-expressions",
  track: "CS",
  section: "CS.S11",
  module: "S11.6",
  lang: "csharp",
  title: "IQueryable-провайдеры транслируют дерево",
  kicker: "C# вглубь · S11 · дерево → SQL",
  home: { subtitle: "компилятор → дерево, провайдер обходит узлы, спектр сложности, EF Core → SQL", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S3", "CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-et", kind: "doc", org: "Microsoft Learn", title: "Expression Trees (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/", date: "2025-10-13" },
  ],

  spec: [
    { text: "«The compiler compiles <code>IEnumerable&lt;T&gt;</code> queries to delegates. <span class=\"hl\">The compiler compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to expression trees</span>.» <span class=\"ru-tr\">«Запросы <code>IEnumerable&lt;T&gt;</code> компилятор компилирует в делегаты. Запросы <code>IQueryable</code> и <code>IQueryable&lt;T&gt;</code> компилятор компилирует в деревья выражений.»</span>", source: "ms-linq" },
  ],
  edgeCases: [
    { text: "Удалённый источник → реализуй <code>IQueryable</code>: «<span class=\"hl\">The best option for enabling LINQ querying of a remote data source is to implement the <code>IQueryable&lt;T&gt;</code> interface</span>». <span class=\"ru-tr\">«Лучший способ включить LINQ-запросы к удалённому источнику данных — реализовать интерфейс <code>IQueryable&lt;T&gt;</code>».</span>", source: "ms-linq" },
    { text: "Провайдеры разной сложности: «<code>LINQ</code> providers that implement <code>IQueryable&lt;T&gt;</code> can <span class=\"hl\">vary widely in their complexity</span>». <span class=\"ru-tr\">«LINQ-провайдеры, реализующие <code>IQueryable&lt;T&gt;</code>, могут сильно различаться по сложности».</span> Простой смотрит один узел, EF Core транслирует весь запрос.", source: "ms-linq" },
    { text: "Деревья ты уже используешь: «You already write code that uses Expression trees. Entity Framework's LINQ APIs <span class=\"hl\">accept Expression trees as the arguments for the LINQ Query Expression Pattern</span>». <span class=\"ru-tr\">«Вы уже пишете код, использующий деревья выражений. LINQ-API Entity Framework принимают деревья выражений как аргументы шаблона LINQ Query Expression Pattern».</span>", source: "ms-et" },
  ],

  misconceptions: [
    {
      wrong: "EF Core как-то «магически» превращает мою C#-лямбду в SQL, исполняя её и подсматривая",
      hook: 'Никакой магии и никакого исполнения лямбды: провайдер <span class="hl">читает дерево</span>, в которое компилятор превратил запрос. «<span class="hl">The compiler compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to expression trees</span>». <span class="ru-tr">«Запросы <code>IQueryable</code> и <code>IQueryable&lt;T&gt;</code> компилятор компилирует в деревья выражений».</span> Провайдер обходит узлы этого дерева и транслирует их: «A complex <code>IQueryable</code> provider, such as the <span class="hl">Entity Framework Core provider, might translate complete LINQ queries to an expressive query language, such as SQL</span>». <span class="ru-tr">«Сложный провайдер <code>IQueryable</code>, например Entity Framework Core, может транслировать полные LINQ-запросы в выразительный язык запросов, такой как SQL».</span> Механизм, который это включает: лямбда, пойманная как <code>Expression&lt;Func&lt;&gt;&gt;</code>, — это навигируемое дерево (<code>Body</code>, <code>Left</code>, <code>Right</code>), а <code>Func</code> непрозрачен. Ниже <b>пять разборов</b> и <b>машинная панель</b>: мини-«провайдер» по дереву <code>x =&gt; x &gt; 2</code> выдаёт <code>WHERE x GreaterThan 2</code> (реальный прогон).',
      source: ["ms-linq", "ms-et"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Компилятор → дерево", title: "IQueryable-запрос компилируется в expression tree",
      viewBox: "0 0 340 210", zones: Q_ZONES,
      code: ["IQueryable<Customer> src = db.Customers;", "var q = src.Where(c => c.City == \"London\");", "// c => ...  над IQueryable  ==>  Expression<Func<Customer,bool>>", "// компилятор строит ДЕРЕВО, а не делегат"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Над <code>IQueryable</code> лямбда <code>c =&gt; c.City == ...</code> — не делегат. Компилятор <span class="hl">строит дерево</span>.', nodes: [{ id: "q", kind: "obj", at: { zone: "q", row: 0 }, typeTag: "Where(c => …)", value: "IQueryable", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '«<span class="hl">The compiler compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to expression trees</span>». <span class="ru-tr">«Запросы <code>IQueryable</code> компилятор компилирует в деревья выражений».</span>', nodes: [{ id: "q", kind: "obj", at: { zone: "q", row: 0 }, typeTag: "Where(…)", value: "запрос" }, { id: "e", kind: "obj", at: { zone: "et", row: 0 }, typeTag: "Expression<Func>", value: "дерево", accent: true }], edges: [{ id: "ed", from: "q", to: "e", accent: true }] },
        { codeLine: 3, out: "", caption: 'Дерево описывает запрос как <b>данные</b> — его получает провайдер, чтобы затем перевести. Лямбда в .NET <span class="hl">не исполняется</span>.', nodes: [{ id: "e", kind: "obj", at: { zone: "et", row: 0 }, typeTag: "Expression tree", value: "данные о запросе", accent: true }], edges: [] },
      ],
      explain: 'Вся секция сходится здесь: над <code>IQueryable</code> запрос становится деревом. Дословно (LINQ overview): «Query expressions can be compiled to expression trees or to delegates, depending on the type that the query is applied to. The compiler compiles <code>IEnumerable&lt;T&gt;</code> queries to delegates. <span class="hl">The compiler compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to expression trees</span>». <span class="ru-tr">«Запросы-выражения компилируются в деревья выражений или в делегаты — в зависимости от типа, к которому применён запрос. Запросы <code>IEnumerable&lt;T&gt;</code> — в делегаты. Запросы <code>IQueryable</code> и <code>IQueryable&lt;T&gt;</code> — в деревья выражений».</span> И чтобы включить LINQ к удалённому источнику: «<span class="hl">The best option for enabling LINQ querying of a remote data source is to implement the <code>IQueryable&lt;T&gt;</code> interface</span>». <span class="ru-tr">«Лучший способ включить LINQ-запросы к удалённому источнику — реализовать интерфейс <code>IQueryable&lt;T&gt;</code>».</span> Дерево — вход для провайдера. (Детали «делегат vs дерево, где бежит» — в CS.S3.ienumerable-iqueryable; тут фокус на том, как провайдер дерево <b>читает</b>.)',
      sources: ["ms-linq"],
    },
    {
      id: "s2", num: "02", kicker: "Провайдер обходит дерево", title: "EF Core читает узлы и генерирует SQL",
      viewBox: "0 0 340 210", zones: XLATE_ZONES,
      code: ["// дерево: Where( GreaterThan( Column(x), Constant(2) ) )", "// провайдер обходит узлы (как ExpressionVisitor из урока 4)", "// Column x + оператор > + константа 2  ==>  WHERE x > 2", "// SQL исполняется в БД, не в вашем процессе"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Провайдер получает дерево запроса: узел <code>Where</code>, внутри — <code>GreaterThan</code> над колонкой и константой.', nodes: [{ id: "t", kind: "obj", at: { zone: "tree", row: 0 }, typeTag: "Where", value: "GreaterThan(x, 2)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Он <b>обходит узлы</b> (тем же приёмом, что <code>ExpressionVisitor</code>) и сопоставляет каждый со своим SQL-фрагментом.', nodes: [{ id: "t", kind: "obj", at: { zone: "tree", row: 0 }, typeTag: "дерево", value: "узлы" }, { id: "n", kind: "gate", at: { zone: "native", row: 0 }, state: "ok", label: "обход узлов", detail: "→ SQL", accent: true }], edges: [{ id: "e", from: "t", to: "n", accent: true }] },
        { codeLine: 3, out: "", caption: 'Результат — нативный <span class="hl">SQL</span>, исполняемый в БД. EF Core «translate the query you wrote in C# into SQL that executes in the database engine». <span class="ru-tr">«переводит запрос на C# в SQL, исполняемый в движке БД».</span>', nodes: [{ id: "n", kind: "gate", at: { zone: "native", row: 0 }, state: "ok", label: "WHERE x > 2", detail: "SQL в БД", accent: true }], edges: [] },
      ],
      explain: 'Провайдер — это, по сути, специализированный обходчик дерева (как <code>ExpressionVisitor</code> из урока 4), который каждому узлу сопоставляет фрагмент целевого языка. «You already write code that uses Expression trees. Entity Framework\'s LINQ APIs <span class="hl">accept Expression trees as the arguments for the LINQ Query Expression Pattern</span>. That enables Entity Framework to <span class="hl">translate the query you wrote in C# into SQL that executes in the database engine</span>». <span class="ru-tr">«Вы уже пишете код, использующий деревья выражений. LINQ-API Entity Framework принимают деревья выражений как аргументы шаблона LINQ Query Expression Pattern. Это позволяет Entity Framework перевести запрос, написанный на C#, в SQL, исполняемый в движке БД».</span> Ключевое — лямбда <b>не исполняется</b> в .NET: провайдер лишь читает её форму (узел <code>GreaterThan</code>, колонку слева, константу справа) и строит эквивалентный <code>WHERE</code>. Поэтому в <code>IQueryable</code>-лямбду проходит только переводимое подмножество C#.',
      sources: ["ms-et"],
    },
    {
      id: "s3", num: "03", kicker: "Спектр провайдеров", title: "От одного узла до полного LINQ→SQL",
      viewBox: "0 0 340 276", zones: SPEC_ZONES,
      code: ["// простой провайдер: смотрит ОДИН узел method-call в дереве", "// средний: несколько методов веб-сервиса по форме запроса", "// сложный (EF Core): весь LINQ → выразительный язык (SQL)", "// у всех вход один — дерево выражения запроса"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Провайдеры «<span class="hl">vary widely in their complexity</span>». <span class="ru-tr">«сильно различаются по сложности».</span> Простой — «examine only <b>one</b> method call expression in the expression tree». <span class="ru-tr">«смотрит лишь один вызов метода в дереве».</span>', nodes: [{ id: "s", kind: "gate", at: { zone: "spectrum", row: 0, col: 0 }, state: "ok", label: "простой", detail: "1 узел", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Средний — «target a data source that has a partially expressive query language». <span class="ru-tr">«целится в источник с частично выразительным языком запросов».</span> Выбирает метод по форме запроса.', nodes: [{ id: "s", kind: "gate", at: { zone: "spectrum", row: 0, col: 0 }, state: "ok", label: "простой", detail: "1 узел" }, { id: "m", kind: "gate", at: { zone: "spectrum", row: 1, col: 0 }, state: "ok", label: "средний", detail: "часть языка", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Сложный (EF Core) — «<span class="hl">translate complete LINQ queries to an expressive query language, such as SQL</span>». <span class="ru-tr">«транслирует полные LINQ-запросы в выразительный язык, такой как SQL».</span>', nodes: [{ id: "m", kind: "gate", at: { zone: "spectrum", row: 0, col: 0 }, state: "ok", label: "средний", detail: "часть" }, { id: "c", kind: "gate", at: { zone: "spectrum", row: 1, col: 0 }, state: "ok", label: "EF Core", detail: "весь LINQ → SQL", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Вход у всех <b>один</b> — дерево выражения запроса. Различается лишь, <span class="hl">насколько глубоко</span> провайдер его разбирает.', nodes: [{ id: "in", kind: "obj", at: { zone: "spectrum", row: 0, col: 0 }, typeTag: "общий вход", value: "expression tree", accent: true }], edges: [] },
      ],
      explain: 'Провайдеры образуют спектр — от тривиального до EF Core, но вход у всех один (дерево). «LINQ providers that implement <code>IQueryable&lt;T&gt;</code> can <span class="hl">vary widely in their complexity</span>». <span class="ru-tr">«LINQ-провайдеры, реализующие <code>IQueryable&lt;T&gt;</code>, могут сильно различаться по сложности».</span> Простой конец: «A less complex provider might <span class="hl">examine only one method call expression in the expression tree that represents the query</span> and let the remaining logic of the query be handled elsewhere». <span class="ru-tr">«Менее сложный провайдер может рассмотреть лишь один вызов метода в дереве запроса, а остальную логику отдать в другое место».</span> Сложный конец: «A complex <code>IQueryable</code> provider, such as the Entity Framework Core provider, might <span class="hl">translate complete LINQ queries to an expressive query language, such as SQL</span>». <span class="ru-tr">«Сложный провайдер, например Entity Framework Core, может транслировать полные LINQ-запросы в выразительный язык, такой как SQL».</span> «Developing a complex provider requires a significant amount of effort». <span class="ru-tr">«Разработка сложного провайдера требует значительных усилий».</span> — вся сложность в том, сколько узлов дерева провайдер умеет перевести.',
      sources: ["ms-linq"],
    },
    {
      id: "s4", num: "04", kicker: "Механизм захвата", title: "Func непрозрачен; Expression<Func> ловит навигируемое дерево",
      viewBox: "0 0 340 210", zones: OPAQUE_ZONES,
      code: ["Func<int,bool>             del  = x => x > 2;   // делегат — код", "Expression<Func<int,bool>> tree = x => x > 2;   // дерево — данные", "del(5)          // True — но внутрь заглянуть НЕЛЬЗЯ", "tree.Body.NodeType // GreaterThan — дерево ЧИТАЕТСЯ провайдером"],
      predictAt: 1, predictQ: 'Та же лямбда <code>x =&gt; x &gt; 2</code> как <code>Func</code> и как <code>Expression&lt;Func&lt;&gt;&gt;</code>. Что можно узнать о каждой — только результат или структуру?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>Func</code> — <span class="hl">непрозрачен</span>: можно только вызвать (<code>del(5)</code>=True). Провайдер по нему построить SQL не сможет — структуры не видно.', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "del(5)", detail: "True (и всё)", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>Expression&lt;Func&lt;&gt;&gt;</code> — <b>дерево</b>: <code>tree.Body.NodeType</code> = <code>GreaterThan</code>, дальше <code>.Left</code>/<code>.Right</code>. Провайдер это <span class="hl">читает</span>.', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "Func", detail: "результат" }, { id: "e", kind: "gate", at: { zone: "expr", row: 0 }, state: "ok", label: "Body.NodeType", detail: "GreaterThan", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Вот почему провайдеру нужен именно <code>Expression&lt;Func&lt;&gt;&gt;</code>, а не <code>Func</code>: <span class="hl">только дерево</span> можно разобрать на колонку, оператор и значение.', nodes: [{ id: "e", kind: "gate", at: { zone: "expr", row: 0 }, state: "ok", label: "Left/Right/Value", detail: "разбираемо", accent: true }], edges: [] },
      ],
      explain: 'Всё держится на разнице «код vs данные». <code>Func&lt;int,bool&gt;</code> — исполняемый делегат: у него нет свойств <code>.Body</code>/<code>.Left</code>, наблюдаем только результат вызова. <code>Expression&lt;Func&lt;int,bool&gt;&gt;</code> — дерево: <code>.Body.NodeType</code> даёт <code>GreaterThan</code>, <code>.Left</code> — параметр (колонка), <code>.Right</code> — <code>ConstantExpression</code> со значением. Провайдер <b>обязан</b> принимать именно <code>Expression&lt;Func&lt;&gt;&gt;</code>, потому что только тогда «Entity Framework\'s LINQ APIs <span class="hl">accept Expression trees as the arguments</span>» <span class="ru-tr">«LINQ-API Entity Framework принимают деревья выражений как аргументы»</span> — и запрос можно разобрать. Реальный прогон (карта c1) подтверждает: <code>del(5)</code> отдаёт лишь <code>True</code>, а <code>tree</code> раскрывает <code>NodeType=GreaterThan</code> и правый лист-константу <code>2</code>. Опаковый делегат в SQL не перевести; навигируемое дерево — можно.',
      sources: ["ms-et"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · прогон", title: "Мини-провайдер по дереву: WHERE x GreaterThan 2",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["Expression<Func<int,bool>> tree = x => x > 2;", "var b   = (BinaryExpression)tree.Body;", "var col = ((ParameterExpression)b.Left).Name;   // x", "var op  = b.NodeType;                           // GreaterThan", "var val = ((ConstantExpression)b.Right).Value;  // 2", "// => WHERE x GreaterThan 2"],
      predictAt: 1, predictQ: 'Мини-«провайдер» разбирает дерево <code>x =&gt; x &gt; 2</code> на колонку (<code>Left.Name</code>), оператор (<code>NodeType</code>) и значение (<code>Right.Value</code>) и печатает <code>$"WHERE {col} {op} {val}"</code>. Что выйдет?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Берём <code>tree.Body</code> — бинарный узел. Из него провайдер извлекает три части, как EF Core для <code>WHERE</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "Body", value: "GreaterThan", accent: true }], edges: [] },
        { codeLine: 4, out: "", caption: '<code>Left.Name</code>=<code>x</code> (колонка), <code>NodeType</code>=<code>GreaterThan</code> (оператор), <code>Right.Value</code>=<code>2</code> (значение). Три узла → <span class="hl">три части SQL</span>.', nodes: [{ id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "дерево", value: "x / > / 2" }, { id: "w", kind: "gate", at: { zone: "where", row: 0 }, state: "ok", label: "col/op/val", detail: "x · GreaterThan · 2", accent: true }], edges: [{ id: "e", from: "s", to: "w", accent: true }] },
        { codeLine: 5, out: "WHERE x GreaterThan 2", caption: 'Панель: <span class="hl">WHERE x GreaterThan 2</span> (реальный прогон). Мини-провайдер собрал запрос <b>из узлов дерева</b>, не исполняя лямбду.', nodes: [{ id: "w", kind: "gate", at: { zone: "where", row: 0 }, state: "ok", label: "результат", detail: "WHERE x GreaterThan 2", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — <b>мини-провайдер</b> в миниатюре. Из дерева <code>x =&gt; x &gt; 2</code> он вытаскивает три части: левый лист <code>ParameterExpression.Name</code> = <code>x</code> (колонка), <code>BinaryExpression.NodeType</code> = <code>GreaterThan</code> (оператор), правый лист <code>ConstantExpression.Value</code> = <code>2</code> (значение) — и складывает <code>WHERE x GreaterThan 2</code>. Реальный вывод: <code>WHERE x GreaterThan 2</code>. Это ровно то, что делает EF Core, только он знает маппинг <code>GreaterThan</code> → <code>&gt;</code> и имена реальных колонок. Лямбда при этом <b>не исполнялась</b> — провайдер лишь прочёл форму дерева. (Полный кастомный <code>IQueryable</code>-провайдер или <code>AsQueryable</code> в песочнице урока не запускается — <code>System.Linq.Queryable</code> не подключён; но <b>механизм</b>, который всё включает, — захват навигируемого дерева <code>Expression&lt;Func&lt;&gt;&gt;</code> — доказан реальным прогоном.)',
      sources: ["ms-et", "ms-linq"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int,bool&gt; del = x =&gt; x &gt; 2; Expression&lt;Func&lt;int,bool&gt;&gt; tree = x =&gt; x &gt; 2; var b=(BinaryExpression)tree.Body; Console.WriteLine($"del:{del(5)} tree.NodeType:{tree.Body.NodeType} right:{((ConstantExpression)b.Right).Value}");</code> — что напечатает?',
      options: ["del:True tree.NodeType:GreaterThan right:2", "del:True tree.NodeType:Lambda right:2", "del:True tree.NodeType:GreaterThan right:x", "del:5 tree.NodeType:GreaterThan right:2"], correctIndex: 0, xp: 10,
      okText: '<code>Func</code> непрозрачен — виден только результат <code>del(5)=True</code>. <code>Expression&lt;Func&lt;&gt;&gt;</code> — дерево: <code>Body.NodeType=GreaterThan</code>, правый лист-константа <code>2</code>. Вывод: <b>del:True tree.NodeType:GreaterThan right:2</b>.',
      noText: 'Провайдеру нужен именно <code>Expression&lt;Func&lt;&gt;&gt;</code>: его дерево навигируемо (<code>.Body</code>, <code>.Right</code>). Func даёт лишь <code>True</code>. Вывод: <b>del:True tree.NodeType:GreaterThan right:2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "del:True tree.NodeType:GreaterThan right:2" }, sourceRefs: ["ms-et"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; tree = x =&gt; x &gt; 2; var b=(BinaryExpression)tree.Body; var col=((ParameterExpression)b.Left).Name; var op=b.NodeType; var val=((ConstantExpression)b.Right).Value; Console.WriteLine($"WHERE {col} {op} {val}");</code> — что напечатает?',
      options: ["WHERE x GreaterThan 2", "WHERE x > 2", "WHERE 2 GreaterThan x", "WHERE x GreaterThan x"], correctIndex: 0, xp: 10,
      okText: 'Мини-провайдер читает дерево: <code>Left.Name</code>=<code>x</code> (колонка), <code>NodeType</code>=<code>GreaterThan</code> (оператор), <code>Right.Value</code>=<code>2</code> (значение). Собирает: <b>WHERE x GreaterThan 2</b>.',
      noText: 'Так провайдер строит запрос из узлов дерева, не исполняя лямбду. <code>NodeType</code> — это <b>GreaterThan</b>, не символ <code>&gt;</code>. Вывод: <b>WHERE x GreaterThan 2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "WHERE x GreaterThan 2" }, sourceRefs: ["ms-et", "ms-linq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Expression&lt;Func&lt;int,bool&gt;&gt; tree = x =&gt; x &gt; 2; Console.WriteLine($"{tree.NodeType}|{tree.Parameters[0].Name}|{tree.Body.NodeType}|{tree.ReturnType.Name}");</code> — что напечатает?',
      options: ["Lambda|x|GreaterThan|Boolean", "GreaterThan|x|Lambda|Boolean", "Lambda|x|GreaterThan|Bool", "Lambda|2|GreaterThan|Boolean"], correctIndex: 0, xp: 10,
      okText: 'Корень дерева — <code>Lambda</code>; единственный параметр — <code>x</code>; тело — <code>GreaterThan</code>; тип возврата — <code>Boolean</code>. Всё, что провайдеру нужно для трансляции. Вывод: <b>Lambda|x|GreaterThan|Boolean</b>.',
      noText: '<code>Expression&lt;Func&lt;int,bool&gt;&gt;</code> открывает полную структуру: корень <code>Lambda</code>, параметр <code>x</code>, тело <code>GreaterThan</code>, <code>ReturnType.Name</code>=<code>Boolean</code>. Вывод: <b>Lambda|x|GreaterThan|Boolean</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Lambda|x|GreaterThan|Boolean" }, sourceRefs: ["ms-et"],
    },
  ],

  takeaways: [
    { icon: "why", k: "запрос → дерево", v: '«<span class="hl">The compiler compiles <code>IQueryable</code> and <code>IQueryable&lt;T&gt;</code> queries to expression trees</span>». <span class="ru-tr">«Запросы <code>IQueryable</code> компилятор компилирует в деревья выражений».</span> Дерево — вход для провайдера. Удалённый источник → «implement the <code>IQueryable&lt;T&gt;</code> interface». <span class="ru-tr">«реализовать интерфейс <code>IQueryable&lt;T&gt;</code>».</span>' },
    { icon: "cost", k: "провайдер обходит узлы", v: 'Провайдеры «<span class="hl">vary widely in their complexity</span>» <span class="ru-tr">«сильно различаются по сложности»</span>: от одного узла до EF Core, что «translate complete LINQ queries to… SQL». <span class="ru-tr">«транслирует полные LINQ-запросы в… SQL».</span> Замер мини-провайдера: <code>WHERE x GreaterThan 2</code>.' },
    { icon: "avoid", k: "Func opaque, дерево читаемо", v: 'SQL строится <b>из узлов</b>, лямбда не исполняется. <code>Func</code> непрозрачен (только результат), <code>Expression&lt;Func&lt;&gt;&gt;</code> навигируем (<code>.Body</code>/<code>.Left</code>/<code>.Right</code>). Замер структуры: <code>Lambda|x|GreaterThan|Boolean</code>. Потому провайдеры принимают именно дерево.' },
  ],

  foot: 'урок · <b>IQueryable-провайдеры транслируют дерево</b> · 5 анимир. разборов · панель WHERE x GreaterThan 2 · дизайн <b>mid</b>',
};
