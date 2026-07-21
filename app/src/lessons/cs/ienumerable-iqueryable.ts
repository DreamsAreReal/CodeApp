/**
 * Lesson: IEnumerable<T> vs IQueryable<T> — delegates vs expression trees
 * (CS.S3.ienumerable-iqueryable) — expert density, 4 animated deep-dives + a machine panel (5 segments).
 * The distinction that decides WHERE a query runs: for IEnumerable<T> the compiler turns each
 * lambda into a DELEGATE and the query executes in-process (LINQ to Objects); for IQueryable<T>
 * the compiler turns the SAME lambda into an EXPRESSION TREE, which a provider (EF Core) can
 * translate to a native query (SQL) and run at the source.
 *
 * SIGNATURE machine panel (s5): the SAME lambda `x => x > 2` compiled two ways —
 *   Enumerable.Where<int>(IEnumerable<int>, Func<int,bool>)          // delegate
 *   Queryable.Where<int>(IQueryable<int>, Expression<Func<int,bool>>) // expression tree
 * A REAL Release-optimised decompilation (ilspycmd) of the same Where call over IEnumerable vs IQueryable.
 *
 * NOTE on exec cards: the backend run-csharp scripting host references only System.Private.CoreLib
 * + System.Linq (Enumerable) + Console — it does NOT reference System.Linq.Queryable or
 * System.Linq.Expressions. So the exec cards exercise the EXECUTABLE (IEnumerable/delegate) side;
 * the IQueryable/expression-tree side is proven by the compiled IL artifact above, not by run-csharp.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../csharp/linq/ and the
 *     IQueryable<T> API page (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp via this file's exec cards on the app backend (:5080) ("7"; "hits=2"; "count=3");
 *   - the s5 IL (Enumerable::Where Func vs Queryable::Where Expression) is a REAL Release compilation.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.ienumerable-iqueryable/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two interfaces, one deriving from the other.
const Z_IE: Zone = { id: "ie", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IEnumerable<T>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "in-memory · делегаты", subCls: "vz-zsub good", subY: 47 };
const Z_IQ: Zone = { id: "iq", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IQueryable<T>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "provider · expression trees", subCls: "vz-zsub", subY: 47 };
const TWO_ZONES: Zone[] = [Z_IE, Z_IQ];

// s2: IEnumerable — lambda becomes a delegate, executes in-process.
const Z_DELEG: Zone = { id: "deleg", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "IEnumerable · ДЕЛЕГАТ", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "лямбда → Func<> · бежит в процессе", subCls: "vz-zsub good", subY: 47 };
const DELEG_ZONES: Zone[] = [Z_DELEG];

// s3: IQueryable — lambda becomes an expression tree, translated by a provider.
const Z_TREE: Zone = { id: "tree", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "IQueryable · EXPRESSION TREE", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "лямбда → дерево · транслируется провайдером", subCls: "vz-zsub", subY: 47 };
const TREE_ZONES: Zone[] = [Z_TREE];

// s4: where the query executes — client vs data source.
const Z_CLIENT: Zone = { id: "client", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "КЛИЕНТ (процесс)", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "IEnumerable исполняет тут", subCls: "vz-zsub good", subY: 47 };
const Z_DB: Zone = { id: "db", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ИСТОЧНИК (БД)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "IQueryable транслирует сюда", subCls: "vz-zsub heap", subY: 47 };
const WHERE_ZONES: Zone[] = [Z_CLIENT, Z_DB];

// s5 (SIGNATURE): same lambda -> two compiled forms.
const Z_SRC2: Zone = { id: "src2", x: 14, y: 34, w: 100, h: 168, cls: "vz-zone", label: "x => x > 2", labelCls: "vz-zlabel sm", lx: 64, ly: 24, sub: "одна лямбда", subCls: "vz-zsub", subY: 47 };
const Z_FUNC: Zone = { id: "func", x: 120, y: 34, w: 100, h: 168, cls: "vz-zone good", label: "Func<int,bool>", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "делегат", subCls: "vz-zsub good", subY: 47 };
const Z_EXPR: Zone = { id: "expr", x: 226, y: 34, w: 100, h: 168, cls: "vz-zone", label: "Expression<..>", labelCls: "vz-zlabel sm", lx: 276, ly: 24, sub: "дерево", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_SRC2, Z_FUNC, Z_EXPR];

export const ienumerableIqueryable: LessonData = {
  id: "CS.S3.ienumerable-iqueryable",
  track: "CS",
  section: "CS.S3",
  module: "S3.5",
  lang: "csharp",
  title: "IEnumerable<T> vs IQueryable<T>: делегаты и деревья выражений",
  kicker: "C# вглубь · S3 · где бежит запрос",
  home: { subtitle: "делегат vs expression tree, in-memory vs provider, где исполняется", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-iqueryable", kind: "doc", org: "Microsoft Learn", title: "IQueryable<T> Interface", url: "https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryable-1", date: "2025-07-01" },
    { id: "ms-sqo", kind: "doc", org: "Microsoft Learn", title: "Standard query operators overview — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/", date: "2025-12-01" },
  ],

  spec: [
    { text: "«Query expressions can be compiled to expression trees or to delegates, depending on the type that the query is applied to. The compiler compiles IEnumerable<T> queries to delegates. The compiler compiles IQueryable and IQueryable<T> queries to expression trees.»", source: "ms-linq" },
  ],
  edgeCases: [
    { text: "<code>IQueryable&lt;T&gt;</code> — для провайдеров: «The <code>IQueryable&lt;T&gt;</code> interface is <span class=\"hl\">intended for implementation by query providers</span>». Он «inherits the <code>IEnumerable&lt;T&gt;</code> interface so that if it represents a query, the results of that query can be enumerated».", source: "ms-iqueryable" },
    { text: "Тип решает способ исполнения: «The distinction between <code>IEnumerable&lt;T&gt;</code> and <code>IQueryable&lt;T&gt;</code> sequences <span class=\"hl\">determines how the query is executed at runtime</span>».", source: "ms-sqo" },
    { text: "Провайдер транслирует дерево: «For <code>IQueryable&lt;T&gt;</code>, the query is translated into an <span class=\"hl\">expression tree</span>… Libraries such as Entity Framework translate LINQ queries into <b>native SQL queries</b> that execute at the database».", source: "ms-sqo" },
  ],

  misconceptions: [
    {
      wrong: "IEnumerable и IQueryable — одно и то же, разница только в имени интерфейса",
      hook: 'Дорогое заблуждение: <span class="wrong"><code>IEnumerable</code> и <code>IQueryable</code> взаимозаменяемы</span>. На деле от типа зависит, <b>во что компилятор превращает лямбду</b> и <b>где исполнится запрос</b>. Дословно: «The compiler compiles <span class="hl">IEnumerable&lt;T&gt; queries to delegates</span>. The compiler compiles IQueryable and IQueryable&lt;T&gt; queries to <span class="hl">expression trees</span>». <code>IEnumerable</code> = делегат, бежит в процессе; <code>IQueryable</code> = дерево выражения, которое EF Core транслирует в SQL и гоняет в БД. Ниже <b>четыре разбора</b> и <b>машинная панель</b> — реальный IL: одна лямбда <code>x =&gt; x &gt; 2</code> компилируется в <code>Func&lt;&gt;</code> для <code>Enumerable.Where</code> и в <code>Expression&lt;Func&lt;&gt;&gt;</code> для <code>Queryable.Where</code>.',
      source: "ms-linq",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Два интерфейса", title: "IQueryable<T> наследует IEnumerable<T>, но исполняется иначе",
      viewBox: "0 0 340 210", zones: TWO_ZONES,
      code: ["IEnumerable<int> a = list;              // in-memory", "IQueryable<int>  b = db.Table;          // provider", "// IQueryable<T> : IEnumerable<T> — но другой способ исполнения"],
      scenes: [
        { codeLine: 0, caption: '<code>IEnumerable&lt;T&gt;</code> — контракт «меня можно перечислить». Источники в памяти: <code>List</code>, массив, результат другого LINQ.', nodes: [{ id: "a", kind: "obj", at: { zone: "ie", row: 0 }, typeTag: "IEnumerable<T>", value: "in-memory", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>IQueryable&lt;T&gt;</code> <span class="hl">наследует</span> <code>IEnumerable&lt;T&gt;</code> — его тоже можно перечислить, но за ним стоит <b>провайдер</b>.', nodes: [{ id: "a", kind: "obj", at: { zone: "ie", row: 0 }, typeTag: "IEnumerable<T>", value: "базовый" }, { id: "b", kind: "obj", at: { zone: "iq", row: 0 }, typeTag: "IQueryable<T>", value: "наследует IE", accent: true }], edges: [{ id: "e", from: "b", to: "a", accent: true }] },
        { codeLine: 2, caption: 'Одинаковый синтаксис <code>Where/Select</code>, но <span class="hl">способ исполнения разный</span> — его определяет тип последовательности.', nodes: [{ id: "a", kind: "obj", at: { zone: "ie", row: 0 }, typeTag: "IEnumerable<T>", value: "делегаты" }, { id: "b", kind: "obj", at: { zone: "iq", row: 0 }, typeTag: "IQueryable<T>", value: "деревья", accent: true }], edges: [] },
      ],
      explain: 'Оба интерфейса дают LINQ-синтаксис, но исполняются по-разному. Дословно (IQueryable API): «The <code>IQueryable&lt;T&gt;</code> interface is <span class="hl">intended for implementation by query providers</span>… This interface <b>inherits the <code>IEnumerable&lt;T&gt;</code> interface</b> so that if it represents a query, the results of that query can be enumerated». И (standard-query-operators): «The distinction between <code>IEnumerable&lt;T&gt;</code> and <code>IQueryable&lt;T&gt;</code> sequences <b>determines how the query is executed at runtime</b>». Так что выбор типа — не косметика: он решает, поедет ли лямбда делегатом в вашем процессе или деревом в БД.',
      sources: ["ms-iqueryable", "ms-sqo"],
    },
    {
      id: "s2", num: "02", kicker: "IEnumerable · делегат", title: "Лямбда становится Func<> и исполняется в процессе",
      viewBox: "0 0 340 210", zones: DELEG_ZONES,
      code: ["IEnumerable<int> src = list;", "var q = src.Where(x => x > 2);", "// компилятор: x => x > 2  ==>  Func<int,bool> делегат", "// при перечислении делегат вызывается для каждого элемента ЛОКАЛЬНО"],
      scenes: [
        { codeLine: 1, caption: 'Для <code>IEnumerable</code> компилятор превращает <code>x =&gt; x &gt; 2</code> в <span class="hl">делегат</span> <code>Func&lt;int,bool&gt;</code> — исполняемый код.', nodes: [{ id: "l", kind: "gate", at: { zone: "deleg", row: 0 }, state: "ok", label: "x => x > 2", detail: "→ Func<int,bool>", accent: true }], edges: [] },
        { codeLine: 3, caption: 'При перечислении <code>Enumerable.Where</code> <b>вызывает делегат</b> для каждого элемента — прямо здесь, в вашем процессе.', nodes: [{ id: "l", kind: "gate", at: { zone: "deleg", row: 0 }, state: "ok", label: "Func делегат", detail: "исполняемый код" }, { id: "r", kind: "gate", at: { zone: "deleg", row: 1 }, state: "ok", label: "вызов на элемент", detail: "в процессе клиента", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Отсюда и <span class="hl">семантика замыканий</span>: делегат захватывает локальные переменные и видит их актуальные значения при исполнении (как обычный C#-код).', nodes: [{ id: "r", kind: "gate", at: { zone: "deleg", row: 0 }, state: "ok", label: "замыкание работает", detail: "захват локальных", accent: true }], edges: [] },
      ],
      explain: 'Для <code>IEnumerable&lt;T&gt;</code> лямбда — это обычный делегат. Дословно: «The compiler compiles <span class="hl">IEnumerable&lt;T&gt; queries to delegates</span>». И (standard-query-operators): «For <code>IEnumerable&lt;T&gt;</code>, the returned enumerable object captures the arguments that were passed to the method. When that object is enumerated, the logic of the query operator is employed and the query results are returned». Это LINQ to Objects: фильтр/проекция — исполняемый .NET-код, бегущий в вашем процессе. Поэтому работают замыкания над локальными переменными (проверим прогоном) — делегат видит их значение <b>в момент перечисления</b>, а не объявления.',
      sources: ["ms-linq", "ms-sqo"],
    },
    {
      id: "s3", num: "03", kicker: "IQueryable · дерево", title: "Та же лямбда становится Expression<Func<>> — данными, не кодом",
      viewBox: "0 0 340 210", zones: TREE_ZONES,
      code: ["IQueryable<Customer> src = db.Customers;", "var q = src.Where(c => c.City == \"London\");", "// компилятор: c => ...  ==>  Expression<Func<Customer,bool>>", "// провайдер РАЗБИРАЕТ дерево и генерирует SQL WHERE City = 'London'"],
      scenes: [
        { codeLine: 1, caption: 'Для <code>IQueryable</code> та же лямбда компилируется не в код, а в <span class="hl">дерево выражения</span> <code>Expression&lt;Func&lt;&gt;&gt;</code> — структуру-данные.', nodes: [{ id: "l", kind: "gate", at: { zone: "tree", row: 0 }, state: "ok", label: "c => c.City == ...", detail: "→ Expression tree", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Провайдер (EF Core) <b>обходит дерево</b> и переводит его в нативный запрос — <span class="hl">SQL</span>. Лямбда не исполняется в .NET.', nodes: [{ id: "l", kind: "gate", at: { zone: "tree", row: 0 }, state: "ok", label: "Expression tree", detail: "данные о запросе" }, { id: "s", kind: "gate", at: { zone: "tree", row: 1 }, state: "ok", label: "провайдер → SQL", detail: "WHERE City = 'London'", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Следствие: в <code>IQueryable</code>-лямбде <span class="hl">не всякий C# допустим</span> — только то, что провайдер умеет перевести. Вызвать локальный метод внутри — часто нельзя.', nodes: [{ id: "s", kind: "gate", at: { zone: "tree", row: 0 }, state: "ok", label: "ограничения", detail: "переводимое подмножество", accent: true }], edges: [] },
      ],
      explain: 'Для <code>IQueryable&lt;T&gt;</code> лямбда превращается в дерево выражения. Дословно: «The compiler compiles IQueryable and IQueryable&lt;T&gt; queries to <span class="hl">expression trees</span>». И (standard-query-operators): «For <code>IQueryable&lt;T&gt;</code>, the query is <b>translated into an expression tree</b>. The expression tree can be translated to a native query when the data source can optimize the query. Libraries such as Entity Framework translate LINQ queries into <b>native SQL queries</b> that execute at the database». Дерево — это <b>описание</b> запроса как данные (узлы Parameter/Constant/GreaterThan…), а не исполняемый код. Плата за это — ограничения: «Expression trees have <b>limitations</b> on the allowed C# syntax» — в <code>IQueryable</code>-лямбду нельзя пихать произвольный код, только переводимое подмножество.',
      sources: ["ms-linq", "ms-sqo"],
    },
    {
      id: "s4", num: "04", kicker: "Где исполняется", title: "IEnumerable — в клиенте; IQueryable — в источнике",
      viewBox: "0 0 340 210", zones: WHERE_ZONES,
      code: ["// IEnumerable: тянет ВСЁ в память, фильтрует в клиенте", "db.Table.AsEnumerable().Where(x => x.Big > 100);  // WHERE в C#", "// IQueryable: фильтр уезжает в SQL, из БД приходит уже отфильтрованное", "db.Table.Where(x => x.Big > 100);                 // WHERE в SQL"],
      scenes: [
        { codeLine: 1, caption: '<code>AsEnumerable()</code> «переключает» на <code>IEnumerable</code>: фильтр — <span class="hl">делегат в клиенте</span>. Из БД тянутся ВСЕ строки, потом отсев.', nodes: [{ id: "c", kind: "gate", at: { zone: "client", row: 0 }, state: "fail", label: "Where в C#", detail: "все строки в память", accent: true }, { id: "d", kind: "gate", at: { zone: "db", row: 0 }, state: "ok", label: "БД", detail: "отдаёт всё" }], edges: [{ id: "e", from: "d", to: "c" }] },
        { codeLine: 3, caption: '<code>IQueryable</code>: фильтр как дерево <span class="hl">уезжает в SQL</span> — БД возвращает уже отфильтрованное. Меньше трафика и работы клиента.', nodes: [{ id: "c", kind: "gate", at: { zone: "client", row: 0 }, state: "ok", label: "клиент", detail: "получает мало строк" }, { id: "d", kind: "gate", at: { zone: "db", row: 0 }, state: "ok", label: "WHERE в SQL", detail: "фильтр в БД", accent: true }], edges: [{ id: "e", from: "d", to: "c", accent: true }] },
        { codeLine: 3, caption: 'Практический баг: случайный <code>AsEnumerable()</code>/<code>ToList()</code> <b>рано</b> в цепочке уводит фильтр в клиента — «тянем таблицу целиком».', nodes: [{ id: "c", kind: "gate", at: { zone: "client", row: 0 }, state: "fail", label: "ранний ToList", detail: "фильтр ушёл в клиент", accent: true }, { id: "d", kind: "gate", at: { zone: "db", row: 0 }, state: "fail", label: "SELECT *", detail: "вся таблица" }], edges: [{ id: "e", from: "d", to: "c" }] },
      ],
      explain: 'Тип решает, <b>где физически исполнится фильтр</b>. С <code>IQueryable</code> дерево едет в источник: «Libraries such as Entity Framework translate LINQ queries into native SQL queries that <span class="hl">execute at the database</span>» — из БД приходит уже отфильтрованный набор. С <code>IEnumerable</code> (например после <code>AsEnumerable()</code>/<code>ToList()</code>) фильтр — делегат в вашем процессе, а значит источник обязан отдать <b>все</b> строки. Отсюда классический перф-баг EF Core: материализовать (<code>ToList</code>) слишком рано — и <code>Where</code> после этого фильтрует в памяти, вытянув всю таблицу. Держи цепочку <code>IQueryable</code> до последнего.',
      sources: ["ms-sqo"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный IL", title: "Одна лямбда → Func для Enumerable, Expression для Queryable",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// n.Where(x => x > 2), одна и та же лямбда:", "// над IEnumerable<int>:", "call Enumerable::Where(IEnumerable, Func<int,bool>)", "// над IQueryable<int>:", "call Queryable::Where(IQueryable, Expression<Func<int,bool>>)"],
      predictAt: 1, predictQ: 'Одна лямбда <code>x =&gt; x &gt; 2</code>. Во что её компилирует C# для <code>IEnumerable</code> и для <code>IQueryable</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Исходник один: <code>n.Where(x =&gt; x &gt; 2)</code>. Разница — только в <span class="hl">типе</span> <code>n</code>.', nodes: [{ id: "s", kind: "gate", at: { zone: "src2", row: 0 }, state: "ok", label: "x => x > 2", detail: "одна лямбда", accent: true }], edges: [] },
        { codeLine: 2, out: "Enumerable::Where(Func)", caption: 'Над <code>IEnumerable&lt;int&gt;</code> IL зовёт <span class="hl">Enumerable::Where(…, Func&lt;int,bool&gt;)</span> — аргумент <b>делегат</b> (реальный IL).', nodes: [{ id: "s", kind: "gate", at: { zone: "src2", row: 0 }, state: "ok", label: "лямбда", detail: "источник" }, { id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "Func<int,bool>", detail: "делегат", accent: true }], edges: [{ id: "e1", from: "s", to: "f", accent: true }] },
        { codeLine: 4, out: "Queryable::Where(Expression)", caption: 'Над <code>IQueryable&lt;int&gt;</code> IL зовёт <span class="hl">Queryable::Where(…, Expression&lt;Func&lt;&gt;&gt;)</span> — аргумент <b>дерево выражения</b> (реальный IL).', nodes: [{ id: "f", kind: "gate", at: { zone: "func", row: 0 }, state: "ok", label: "Func", detail: "делегат" }, { id: "x", kind: "gate", at: { zone: "expr", row: 0 }, state: "ok", label: "Expression<Func>", detail: "дерево", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — прямое доказательство из Release-IL (ilspycmd). Один и тот же метод <code>n.Where(x =&gt; x &gt; 2)</code> компилируется в <b>два разных вызова</b> в зависимости от типа <code>n</code>: над <code>IEnumerable&lt;int&gt;</code> — <code>call …Enumerable::Where&lt;int32&gt;(IEnumerable&lt;int&gt;, <span class="hl">Func&lt;int,bool&gt;</span>)</code> (делегат); над <code>IQueryable&lt;int&gt;</code> — <code>call …Queryable::Where&lt;int32&gt;(IQueryable&lt;int&gt;, <span class="hl">Expression&lt;Func&lt;int,bool&gt;&gt;</span>)</code> (дерево). В первом случае компилятор кеширует делегат в статическом поле; во втором — генерирует код, СТРОЯЩИЙ дерево (<code>Expression.Parameter</code>, <code>Expression.Constant</code>, <code>Expression.GreaterThan</code>). Это буквально фраза доки «The compiler compiles IEnumerable&lt;T&gt; queries to delegates. The compiler compiles IQueryable and IQueryable&lt;T&gt; queries to expression trees», видимая в байткоде. (Exec-карты урока гоняют исполнимую <code>IEnumerable</code>-сторону; <code>IQueryable</code>/деревья доказаны этим IL, т.к. scripting-хост не референсит их сборки.)',
      sources: ["ms-linq"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; src = new List&lt;int&gt;{1,2,3,4}; var q = src.Where(x =&gt; x &gt; 2); Console.WriteLine(q.Sum());</code> — что напечатает?',
      options: ["7", "10", "3", "34"], correctIndex: 0, xp: 10,
      okText: '<code>IEnumerable.Where</code> исполняет делегат <b>локально</b>: остаются 3 и 4, их сумма — <b>7</b>. Лямбда над <code>IEnumerable</code> — это <code>Func&lt;int,bool&gt;</code>, обычный код в процессе.',
      noText: 'Фильтр &gt;2 → {3,4}; <code>Sum</code> → <b>7</b>. Над <code>IEnumerable</code> лямбда компилируется в делегат и бежит in-memory.',
      verify: { kind: "exec", run: "dotnet run", expect: "7" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int,bool&gt; pred = x =&gt; x &gt; 2; var src = new List&lt;int&gt;{1,2,3,4}; int hits = 0; foreach (var x in src) if (pred(x)) hits++; Console.WriteLine($"hits={hits}");</code> — что напечатает?',
      options: ["hits=2", "hits=4", "hits=0", "hits=3"], correctIndex: 0, xp: 10,
      okText: 'Лямбда <code>x =&gt; x &gt; 2</code> — это <b>делегат</b> <code>Func&lt;int,bool&gt;</code>: ровно то, во что компилятор превращает предикат <code>Where</code> над <code>IEnumerable</code>. Истинна для 3 и 4 → <b>hits=2</b>.',
      noText: 'Предикат истинен для 3 и 4 (не для 1,2) → <b>hits=2</b>. Это и есть «делегат», исполняемый <code>Enumerable.Where</code> под капотом.',
      verify: { kind: "exec", run: "dotnet run", expect: "hits=2" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int threshold = 2; IEnumerable&lt;int&gt; src = Enumerable.Range(1, 9); var q = src.Where(x =&gt; x &gt; threshold); threshold = 6; Console.WriteLine($"count={q.Count()}");</code> — что напечатает?',
      options: ["count=3", "count=7", "count=6", "count=9"], correctIndex: 0, xp: 10,
      okText: 'Делегат <code>IEnumerable</code>-запроса — обычный C#-код с <b>замыканием</b>: при перечислении (в <code>Count</code>) он видит <code>threshold = 6</code>. Значит &gt;6 из 1..9 — это {7,8,9} → <b>count=3</b>.',
      noText: 'Лямбда захватывает локальную <code>threshold</code> и видит её значение В МОМЕНТ исполнения (6, не 2). Из 1..9 больше 6 → 7,8,9 → <b>count=3</b>. Так работает делегат in-process.',
      verify: { kind: "exec", run: "dotnet run", expect: "count=3" }, sourceRefs: ["ms-linq"],
    },
  ],

  takeaways: [
    { icon: "why", k: "делегат vs дерево", v: '«compiles IEnumerable&lt;T&gt; queries to delegates… compiles IQueryable and IQueryable&lt;T&gt; queries to expression trees». Замер (IL): одна лямбда → <code>Func&lt;&gt;</code> для <code>Enumerable.Where</code>, <code>Expression&lt;Func&lt;&gt;&gt;</code> для <code>Queryable.Where</code>.' },
    { icon: "cost", k: "где исполняется", v: '<code>IEnumerable</code> — делегат в вашем процессе (LINQ to Objects). <code>IQueryable</code> — дерево транслируется провайдером «into native SQL queries that execute at the database». Тип «determines how the query is executed at runtime».' },
    { icon: "avoid", k: "не материализуй рано", v: 'Ранний <code>AsEnumerable()</code>/<code>ToList()</code> уводит фильтр из SQL в клиента → тянешь всю таблицу. В <code>IQueryable</code>-лямбду нельзя произвольный C# — только переводимое в дерево подмножество.' },
  ],

  foot: 'урок · <b>IEnumerable vs IQueryable</b> · 4 анимир. разбора + IL-панель Func vs Expression · дизайн <b>mid</b>',
};
