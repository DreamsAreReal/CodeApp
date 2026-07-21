/**
 * Lesson: How a LINQ query executes — the three parts (CS.S3.linq-execution) — expert density,
 * 5 animated deep-dives + a machine panel. The mental model a senior must internalise: every
 * LINQ query operation is THREE distinct actions — obtain the data source, create the query,
 * execute the query — and creating the query retrieves NOTHING. The query variable stores the
 * recipe, not the results; execution happens later, at iteration.
 *
 * SIGNATURE machine panel (s5): the query variable holds NO data — proven by mutating the
 * SOURCE after the query is created and observing the count change between two executions of
 * the SAME query variable (2 -> 4). A REAL run-csharp measurement on :5101.
 * See docs/evidence/S3/L2-linq-execution.txt.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from
 *     learn.microsoft.com/.../csharp/linq/get-started/introduction-to-linq-queries (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp on :5101
 *     (evidence/S3/L2-linq-execution.txt: "0 2 4 6"; "2,5,9"; "2 4").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.linq-execution/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the three distinct actions of a query operation, stacked.
const Z_PARTS: Zone = { id: "parts", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "QUERY OPERATION · 3 ДЕЙСТВИЯ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "источник → запрос → исполнение", subCls: "vz-zsub", subY: 47 };
const PARTS_ZONES: Zone[] = [Z_PARTS];

// s2/s3: the query variable (left) vs where the data actually is (right, the source).
const Z_QVAR: Zone = { id: "qvar", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "QUERY-ПЕРЕМЕННАЯ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "хранит РЕЦЕПТ, не данные", subCls: "vz-zsub", subY: 47 };
const Z_SRC: Zone = { id: "src", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ИСТОЧНИК", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "здесь живут данные", subCls: "vz-zsub good", subY: 47 };
const QVAR_ZONES: Zone[] = [Z_QVAR, Z_SRC];

// s4: execution happens in the foreach — the timeline of declare vs run.
const Z_TL: Zone = { id: "tl", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "КОГДА ИСПОЛНЯЕТСЯ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "не при объявлении — при итерации", subCls: "vz-zsub", subY: 47 };
const TL_ZONES: Zone[] = [Z_TL];

// s5 (SIGNATURE): two executions of the same query variable straddling a source mutation.
const Z_RUN1: Zone = { id: "run1", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ИСПОЛНЕНИЕ #1", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "src = {2,4}", subCls: "vz-zsub good", subY: 47 };
const Z_RUN2: Zone = { id: "run2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ИСПОЛНЕНИЕ #2", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "src += {6,8}", subCls: "vz-zsub good", subY: 47 };
const RUN_ZONES: Zone[] = [Z_RUN1, Z_RUN2];

export const linqExecution: LessonData = {
  id: "CS.S3.linq-execution",
  track: "CS",
  section: "CS.S3",
  module: "S3.2",
  lang: "csharp",
  title: "Как выполняется LINQ-запрос: три части",
  kicker: "C# вглубь · S3 · объявить ≠ исполнить",
  home: { subtitle: "три действия, query-переменная = рецепт, исполнение при итерации", icon: "collections", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-intro", kind: "doc", org: "Microsoft Learn", title: "Introduction to LINQ Queries — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries", date: "2024-04-22" },
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
  ],

  spec: [
    { text: "«All LINQ query operations consist of three distinct actions: Obtain the data source. Create the query. Execute the query.»", source: "ms-intro" },
  ],
  edgeCases: [
    { text: "Query-переменная <b>ничего не делает и не возвращает данные</b>: «the query variable itself takes no action and returns no data. It just stores the information that is required to produce the results when the query is executed at some later point».", source: "ms-intro" },
    { text: "Исполнение отделено от объявления: «In LINQ, the execution of the query is <span class=\"hl\">distinct from the query itself</span>. In other words, you don't retrieve any data by creating a query variable».", source: "ms-intro" },
    { text: "Результат зависит от <b>момента</b> исполнения: «The results of executing the query <span class=\"hl\">depend on the contents of the data source when the query is executed</span> rather than when the query is defined».", source: "ms-intro" },
  ],

  misconceptions: [
    {
      wrong: "создание query-переменной уже выполняет запрос и «забирает» данные из источника",
      hook: 'Частая ошибка: <span class="wrong">строка <code>var q = from x in src …</code> уже выполнила запрос</span> и <code>q</code> держит результат. Нет: создание запроса <b>не забирает</b> никаких данных. Дословно: «In LINQ, the <span class="hl">execution of the query is distinct from the query itself</span>. In other words, you don\'t retrieve any data by creating a query variable». <code>q</code> хранит только <b>рецепт</b>. Ниже <b>пять разборов</b>: три действия запроса, query-переменная как рецепт, где данные на самом деле, момент исполнения (foreach), и <b>машинная панель</b> — один и тот же <code>q</code>, исполненный дважды вокруг мутации источника, даёт <b>2, потом 4</b> (реальный замер).',
      source: "ms-intro",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три действия", title: "Любая LINQ-операция — это три отдельных шага",
      viewBox: "0 0 340 210", zones: PARTS_ZONES,
      code: ["int[] numbers = [0,1,2,3,4,5,6];      // 1. источник", "var numQuery = from num in numbers", "               where (num % 2) == 0", "               select num;             // 2. запрос", "foreach (int num in numQuery) { ... }   // 3. исполнение"],
      scenes: [
        { codeLine: 0, caption: 'Шаг 1 — <b>получить источник</b>: массив, коллекция, БД. Он должен быть «queryable» (<code>IEnumerable&lt;T&gt;</code> или производный).', nodes: [{ id: "d", kind: "chip", at: { zone: "parts", row: 0 }, value: "1 · источник данных", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Шаг 2 — <b>создать запрос</b>: описать, что и как извлечь. Данные <span class="hl">не читаются</span> — это только описание.', nodes: [{ id: "d", kind: "chip", at: { zone: "parts", row: 0 }, value: "1 · источник данных" }, { id: "q", kind: "chip", at: { zone: "parts", row: 1 }, value: "2 · создать запрос (описание)", accent: true }], edges: [] },
        { codeLine: 4, caption: 'Шаг 3 — <b>исполнить</b>: в <code>foreach</code> запрос реально бежит по источнику. Только здесь появляются данные.', nodes: [{ id: "d", kind: "chip", at: { zone: "parts", row: 0 }, value: "1 · источник данных" }, { id: "q", kind: "chip", at: { zone: "parts", row: 1 }, value: "2 · создать запрос (описание)" }, { id: "e", kind: "chip", at: { zone: "parts", row: 2 }, value: "3 · исполнить (foreach)", accent: true }], edges: [] },
      ],
      explain: 'Каркас любой LINQ-операции — дословно: «All LINQ query operations consist of <span class="hl">three distinct actions: Obtain the data source. Create the query. Execute the query</span>». Первый шаг — источник, поддерживающий <code>IEnumerable&lt;T&gt;</code>: «a LINQ data source is any object that supports the generic <code>IEnumerable&lt;T&gt;</code> interface, or an interface that inherits from it». Второй — описание запроса. Третий — исполнение. Критично: «the <b>execution of the query is distinct from the query itself</b>. In other words, you don\'t retrieve any data by creating a query variable». Разделение «объявить/исполнить» — фундамент всего раздела.',
      sources: ["ms-intro", "ms-linq"],
    },
    {
      id: "s2", num: "02", kicker: "Query-переменная = рецепт", title: "Переменная запроса хранит описание, а не результат",
      viewBox: "0 0 340 210", zones: QVAR_ZONES,
      code: ["var q = from num in numbers", "        where (num % 2) == 0", "        select num;", "// q — это рецепт; данные всё ещё в numbers"],
      scenes: [
        { codeLine: 0, caption: '<code>q</code> получает <b>описание</b> запроса: «какие элементы взять и как их преобразовать». Ни одного числа пока не прочитано.', nodes: [{ id: "q", kind: "obj", at: { zone: "qvar", row: 0 }, typeTag: "q", value: "рецепт", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Данные <span class="hl">по-прежнему в источнике</span> <code>numbers</code>. <code>q</code> лишь ссылается на него и знает фильтр/проекцию.', nodes: [{ id: "q", kind: "obj", at: { zone: "qvar", row: 0 }, typeTag: "q", value: "рецепт" }, { id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "numbers", value: "[0..6]", accent: true }], edges: [{ id: "e", from: "q", to: "s", accent: true }] },
        { codeLine: 3, caption: 'Итог: «<b>the query variable itself takes no action and returns no data</b>» — рецепт хранит инфо, но не запускает чтение.', nodes: [{ id: "q", kind: "obj", at: { zone: "qvar", row: 0 }, typeTag: "q", value: "takes no action", accent: true }, { id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "numbers", value: "[0..6]" }], edges: [{ id: "e", from: "q", to: "s" }] },
      ],
      explain: 'Что физически держит query-переменная — дословно: «A query is stored in a query variable and initialized with a query expression… the <span class="hl">query variable itself takes no action and returns no data</span>. It just stores the information that is required to produce the results when the query is executed at some later point». То есть <code>q</code> — это упакованный рецепт: ссылка на источник + цепочка операций (фильтр, проекция). Никакого буфера с результатом внутри нет. Данные остаются в источнике до момента исполнения — что делает возможным трюк из машинной панели (мутируешь источник — меняется результат).',
      sources: ["ms-intro"],
    },
    {
      id: "s3", num: "03", kicker: "Range-переменная", title: "from вводит range-переменную — она не итерируется сразу",
      viewBox: "0 0 340 210", zones: QVAR_ZONES,
      code: ["var q = from student in students   // range-переменная", "        select student;", "// student НЕ существует в рантайме как цикл —", "// это ссылка на «каждый элемент» при исполнении"],
      scenes: [
        { codeLine: 0, caption: '<code>from student in students</code> вводит <span class="hl">range-переменную</span> student — как переменная цикла, но <b>итерации здесь нет</b>.', nodes: [{ id: "r", kind: "chip", at: { zone: "qvar", row: 0 }, value: "range var: student", accent: true }, { id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "students", value: "источник" }], edges: [{ id: "e", from: "r", to: "s" }] },
        { codeLine: 2, caption: 'В query-выражении <b>реальной итерации не происходит</b>: range-переменная — лишь ссылка на «каждый следующий элемент» при будущем исполнении.', nodes: [{ id: "r", kind: "chip", at: { zone: "qvar", row: 0 }, value: "range var: ссылка" }, { id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "students", value: "источник", accent: true }], edges: [{ id: "e", from: "r", to: "s", accent: true }] },
        { codeLine: 3, caption: 'Тип <code>student</code> компилятор <span class="hl">выводит сам</span> из источника — явно указывать не нужно (кроме non-generic источников вроде ArrayList).', nodes: [{ id: "r", kind: "chip", at: { zone: "qvar", row: 0 }, value: "тип выведен", accent: true }, { id: "s", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "students", value: "источник" }], edges: [{ id: "e", from: "r", to: "s" }] },
      ],
      explain: 'Range-переменная — это НЕ переменная цикла в привычном смысле. Дословно (standard-query-operators): «The <b>range variable</b> is like the iteration variable in a <code>foreach</code> loop except that <span class="hl">no actual iteration occurs in a query expression</span>. When the query is executed, the range variable serves as a reference to each successive element». И тип выводится: «Because the compiler can infer the type of <code>student</code>, you don\'t have to specify it explicitly». Смысл: <code>from x in src</code> объявляет «имя для каждого элемента», а перебор элементов случится позже, при исполнении — снова граница «объявить ≠ исполнить».',
      sources: ["ms-intro"],
    },
    {
      id: "s4", num: "04", kicker: "Момент исполнения", title: "Запрос бежит в foreach, а не в строке объявления",
      viewBox: "0 0 340 210", zones: TL_ZONES,
      code: ["var q = from x in src where x > 1 select x;  // объявили — 0 чтений", "// ... другой код ...", "foreach (int x in q) { ... }   // ЗДЕСЬ запрос исполняется", "// именно foreach вытягивает элементы из источника"],
      scenes: [
        { codeLine: 0, caption: 'Строка <code>var q = …</code> — <span class="hl">0 чтений</span> источника. Запрос только описан.', nodes: [{ id: "d", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "var q = …", detail: "объявление · 0 чтений", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>foreach (x in q)</code> — <b>точка исполнения</b>: здесь запрос впервые бежит по источнику и выдаёт элементы.', nodes: [{ id: "d", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "var q = …", detail: "объявление" }, { id: "f", kind: "gate", at: { zone: "tl", row: 1 }, state: "ok", label: "foreach (x in q)", detail: "исполнение · читает источник", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Именно <code>foreach</code> «is also where the query results are retrieved»: <code>x</code> держит каждое значение по одному за раз.', nodes: [{ id: "f", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "foreach", detail: "retrieves results" }, { id: "x", kind: "gate", at: { zone: "tl", row: 1 }, state: "ok", label: "x", detail: "по одному элементу", accent: true }], edges: [] },
      ],
      explain: 'Где именно исполняется — дословно: «A query isn\'t executed until you <span class="hl">iterate over the query variable</span>, for example in a <code>foreach</code> statement». И далее: «The <code>foreach</code> statement is also where the query results are retrieved. For example, in the previous query, the iteration variable <code>num</code> holds each value (one at a time) in the returned sequence». То есть строка объявления запроса не трогает источник вовсе; чтение начинается на <code>foreach</code> (или на <code>ToList/Count</code> — они тоже итерируют внутри). Практическое следствие: тяжёлый запрос, объявленный, но не итерированный, ничего не стоит — цена появляется на перечислении.',
      sources: ["ms-intro"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Один запрос, два исполнения вокруг мутации: 2 → 4",
      viewBox: "0 0 340 210", zones: RUN_ZONES,
      code: ["var src = new List<int>{2, 4};", "var q = from x in src where x % 2 == 0 select x;", "int a = q.Count();          // исполнение #1: src = {2,4}", "src.Add(6); src.Add(8);     // мутируем ИСТОЧНИК", "int b = q.Count();          // исполнение #2: src = {2,4,6,8}"],
      predictAt: 2, predictQ: 'Один и тот же <code>q</code>: <code>a = q.Count()</code>, потом <code>src.Add(6); src.Add(8)</code>, потом <code>b = q.Count()</code>. Что напечатает <code>a b</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Исполнение #1 при <code>src = {2,4}</code>: <code>q.Count()</code> реально бежит по источнику сейчас → <b>a = 2</b>.', nodes: [{ id: "r1", kind: "gate", at: { zone: "run1", row: 0 }, state: "ok", label: "q.Count() #1", detail: "src = {2,4}", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Мутируем <span class="hl">источник</span>, не <code>q</code>: <code>src.Add(6); src.Add(8)</code>. Рецепт <code>q</code> не менялся.', nodes: [{ id: "r1", kind: "gate", at: { zone: "run1", row: 0 }, state: "ok", label: "q.Count() #1", detail: "= 2" }, { id: "mut", kind: "chip", at: { zone: "run1", row: 1 }, value: "src += {6,8}", accent: true }], edges: [] },
        { codeLine: 4, out: "2 4", caption: 'Исполнение #2 тем же <code>q</code>: он <span class="hl">заново читает</span> обновлённый источник → <b>b = 4</b>. Печать: <b>2 4</b> (реальный прогон).', nodes: [{ id: "r1", kind: "gate", at: { zone: "run1", row: 0 }, state: "ok", label: "#1", detail: "= 2" }, { id: "r2", kind: "gate", at: { zone: "run2", row: 0 }, state: "ok", label: "q.Count() #2", detail: "= 4", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — прямое доказательство «query-переменная не хранит данные». Один и тот же <code>q</code> исполнен дважды: между вызовами мутируем <b>источник</b> (не запрос). Реальный вывод — <code>2 4</code>: второй <code>Count()</code> увидел добавленные элементы. Дословно: «The results of executing the query <span class="hl">depend on the contents of the data source when the query is executed rather than when the query is defined</span>. If the query variable is enumerated multiple times, the results might differ every time». И: «Because the <b>query variable itself never holds the query results</b>, you can execute it repeatedly to retrieve updated data». Если бы <code>q</code> держал снимок результата — было бы <code>2 2</code>. Он держит рецепт — поэтому <code>2 4</code>.',
      sources: ["ms-intro"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int[] numbers = [0,1,2,3,4,5,6]; var numQuery = from num in numbers where (num % 2) == 0 select num; Console.WriteLine(string.Join(" ", numQuery));</code> — что напечатает?',
      options: ["0 2 4 6", "1 3 5", "0 1 2 3 4 5 6", "2 4 6"], correctIndex: 0, xp: 10,
      okText: 'Исполнение в <code>foreach</code>/<code>Join</code> проходит по источнику: чётные из [0..6] — <b>0 2 4 6</b> (0 % 2 == 0 тоже). Три части запроса отработали: источник → запрос → исполнение.',
      noText: '<code>where (num % 2) == 0</code> оставляет 0, 2, 4, 6 (ноль чётный). Порядок источника сохранён. Реальный вывод: <b>0 2 4 6</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "0 2 4 6" }, sourceRefs: ["ms-intro"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var list = new List&lt;int&gt;{1,2}; var q = from x in list where x &gt; 1 select x; list.Add(5); list.Add(9); Console.WriteLine(string.Join(",", q));</code> — что напечатает?',
      options: ["2,5,9", "2", "1,2,5,9", "5,9"], correctIndex: 0, xp: 10,
      okText: 'Запрос создан при <code>list = {1,2}</code>, но исполнен в <code>Join</code> уже <span class="hl">после</span> добавления 5 и 9. Результат зависит от источника В МОМЕНТ исполнения → <b>2,5,9</b> (все &gt; 1).',
      noText: '«you don\'t retrieve any data by creating a query variable». К моменту итерации <code>list = {1,2,5,9}</code>; фильтр &gt;1 → <b>2,5,9</b>. Снимка на строке объявления нет.',
      verify: { kind: "exec", run: "dotnet run", expect: "2,5,9" }, sourceRefs: ["ms-intro"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var src = new List&lt;int&gt;{2,4}; var q = from x in src where x % 2 == 0 select x; int a = q.Count(); src.Add(6); src.Add(8); int b = q.Count(); Console.WriteLine($"{a} {b}");</code> — что напечатает?',
      options: ["2 4", "2 2", "4 4", "2 6"], correctIndex: 0, xp: 10,
      okText: 'Тот же <code>q</code> исполнен дважды. #1 при <code>src = {2,4}</code> → <b>2</b>; после мутации источника #2 читает заново <code>{2,4,6,8}</code> → <b>4</b>. Печать <b>2 4</b>. <code>q</code> хранит рецепт, не снимок.',
      noText: '«the query variable itself never holds the query results, you can execute it repeatedly to retrieve updated data». #1 → 2, источник += {6,8}, #2 → 4. Реальный вывод: <b>2 4</b> (не 2 2).',
      verify: { kind: "exec", run: "dotnet run", expect: "2 4" }, sourceRefs: ["ms-intro"],
    },
  ],

  takeaways: [
    { icon: "why", k: "три отдельных действия", v: '«three distinct actions: Obtain the data source. Create the query. Execute the query». Создание запроса — только описание; данные извлекаются на исполнении.' },
    { icon: "cost", k: "переменная = рецепт", v: '«the query variable itself takes no action and returns no data» — <code>q</code> хранит ссылку на источник + операции, не буфер результата. Объявить тяжёлый запрос без итерации — бесплатно.' },
    { icon: "avoid", k: "результат — от момента исполнения", v: 'Замер: тот же <code>q</code>, мутируем источник между исполнениями → <b>2, потом 4</b>. «results … depend on the contents of the data source when the query is executed». Держишь свежесть — не кешируй.' },
  ],

  foot: 'урок · <b>как исполняется LINQ-запрос</b> · 5 анимир. разборов · панель «один q, два исполнения: 2→4» · дизайн <b>mid</b>',
};
