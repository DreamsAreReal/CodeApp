/**
 * Lesson: LINQ query syntax vs method syntax (CS.S3.linq-query-syntax) — expert density,
 * 5 animated deep-dives + a machine panel. The entry lesson of the LINQ section. The mental
 * model a senior must lock: a query expression written in declarative query syntax is NOT a
 * second language — at compile time the compiler rewrites it into standard-query-operator
 * method calls. Query syntax and method syntax are the SAME thing after lowering; some
 * operators (Count/Max) have no query keyword and force method syntax.
 *
 * SIGNATURE machine panel (s5): the Release IL of `from x in n where x>3 select x*10` — it
 * lowers to `Enumerable.Where<int>(...)` then `Enumerable.Select<int,int>(...)`, the exact
 * method-syntax calls. A REAL Release-optimised decompilation (ilspycmd 10.x).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../csharp/linq/ (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL run-csharp measurement (this file's exec cards on the
 *     app backend :5080): c1 "97 92 81"; c2 "50,80,90"; c3 "10";
 *   - the s5 IL (Enumerable::Where/Select) is a REAL Release compilation (ilspycmd).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.linq-query-syntax/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the query expression laid out clause by clause (from/where/select).
const Z_QUERY: Zone = { id: "query", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "QUERY EXPRESSION", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "декларативный синтаксис запроса", subCls: "vz-zsub", subY: 47 };
const QUERY_ZONES: Zone[] = [Z_QUERY];

// s2/s3: two lanes — query syntax on the left, the equivalent method chain on the right.
const Z_QS: Zone = { id: "qs", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "QUERY-СИНТАКСИС", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "from · where · select", subCls: "vz-zsub", subY: 47 };
const Z_MS: Zone = { id: "ms", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "METHOD-СИНТАКСИС", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Where().Select()", subCls: "vz-zsub good", subY: 47 };
const TWO_FORM_ZONES: Zone[] = [Z_QS, Z_MS];

// s4: operators WITHOUT a query keyword (Count/Max) — must be method syntax.
const Z_NOKW: Zone = { id: "nokw", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "НЕТ QUERY-КЛАУЗЫ · только метод", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "Count · Max · Average · First", subCls: "vz-zsub", subY: 47 };
const NOKW_ZONES: Zone[] = [Z_NOKW];

// s5 (SIGNATURE): the IL panel — query expression -> Enumerable.Where/Select calls.
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "QUERY EXPRESSION", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "from x where select", subCls: "vz-zsub", subY: 47 };
const Z_IL: Zone = { id: "il", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "RELEASE IL", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Enumerable::Where/Select", subCls: "vz-zsub good", subY: 47 };
const IL_ZONES: Zone[] = [Z_SRC, Z_IL];

export const linqQuerySyntax: LessonData = {
  id: "CS.S3.linq-query-syntax",
  track: "CS",
  section: "CS.S3",
  module: "S3.1",
  lang: "csharp",
  title: "LINQ: query-синтаксис и method-синтаксис",
  kicker: "C# вглубь · S3 · две формы — один запрос",
  home: { subtitle: "query expression, лоуэринг в методы, где метод обязателен", icon: "collections", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-sqo", kind: "doc", org: "Microsoft Learn", title: "Standard query operators overview — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/", date: "2025-12-01" },
    { id: "ms-il-ldloc", kind: "doc", org: "Microsoft Learn", title: "System.Linq.Enumerable (Where / Select)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable", date: "2025-07-01" },
  ],

  spec: [
    { text: "«At compile time, the compiler converts query expressions to standard query operator method calls according to the rules defined in the C# specification. You can express any query that uses query syntax by using method syntax.» <span class=\"ru-tr\">«Во время компиляции компилятор преобразует query-выражения в вызовы методов стандартных операторов запроса согласно правилам, определённым в спецификации C#. Любой запрос, использующий query-синтаксис, можно выразить с помощью method-синтаксиса.»</span>", source: "ms-linq" },
  ],
  edgeCases: [
    { text: "Обе формы эквивалентны: «There's no <span class=\"hl\">semantic or performance difference</span> between the two different forms» <span class=\"ru-tr\">«Между двумя разными формами нет семантической разницы или разницы в производительности».</span> Компилятор переписывает query в те же вызовы методов.", source: "ms-linq" },
    { text: "Некоторые операции не имеют query-клаузы: «Some query operations, such as <code>Count</code> or <code>Max</code>, have <b>no equivalent query expression clause</b> and must be expressed as a <span class=\"hl\">method call</span>». <span class=\"ru-tr\">«Некоторые операции запроса, такие как <code>Count</code> или <code>Max</code>, <b>не имеют эквивалентной клаузы query-выражения</b> и должны быть выражены как вызов метода».</span>", source: "ms-linq" },
    { text: "Формы можно смешивать: «You can <b>combine method syntax with query syntax</b> in various ways» <span class=\"ru-tr\">«Вы можете <b>сочетать method-синтаксис с query-синтаксисом</b> различными способами»</span> — обернуть query в скобки и позвать <code>.Count()</code>.", source: "ms-linq" },
  ],

  misconceptions: [
    {
      wrong: "query-синтаксис — это отдельный «язык запросов» внутри C#, отличный от вызовов методов LINQ",
      hook: 'Ходовое заблуждение: <span class="wrong">query-синтаксис (<code>from…where…select</code>) — это отдельный «мини-язык»</span>, работающий иначе, чем <code>.Where().Select()</code>. Нет: query-выражение — это <b>синтаксический сахар</b>, который компилятор переписывает в вызовы стандартных операторов. Дословно: «At compile time, the compiler <span class="hl">converts query expressions to standard query operator method calls</span>… There\'s no semantic or performance difference between the two different forms». <span class="ru-tr">«Во время компиляции компилятор преобразует query-выражения в вызовы методов стандартных операторов запроса… Между двумя разными формами нет семантической разницы или разницы в производительности».</span> Ниже <b>пять разборов</b>: анатомия query-выражения, эквивалентность двум формам, где смешивать, где метод обязателен, и <b>машинная панель</b> — реальный Release-IL, в котором <code>from x where select</code> превращается в <code>Enumerable.Where</code> + <code>Enumerable.Select</code>.',
      source: "ms-linq",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Анатомия · три клаузы", title: "Query-выражение: from вводит источник, where фильтрует, select проецирует",
      viewBox: "0 0 340 210", zones: QUERY_ZONES,
      code: ["int[] scores = [97, 92, 81, 60];", "IEnumerable<int> q =", "    from s in scores    // источник + range-переменная", "    where s > 80        // фильтр", "    select s;           // проекция"],
      scenes: [
        { codeLine: 2, caption: '<code>from s in scores</code> — <b>первая</b> клауза: вводит источник и <span class="hl">range-переменную</span> s (в SQL порядок обратный — там select первый).', nodes: [{ id: "f", kind: "chip", at: { zone: "query", row: 0 }, value: "from s in scores → источник", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>where s > 80</code> — <span class="hl">фильтр</span>: применяется к каждому элементу через range-переменную. Ещё ничего не выполнилось.', nodes: [{ id: "f", kind: "chip", at: { zone: "query", row: 0 }, value: "from s in scores → источник" }, { id: "w", kind: "chip", at: { zone: "query", row: 1 }, value: "where s > 80 → фильтр", accent: true }], edges: [] },
        { codeLine: 4, caption: '<code>select s</code> — <b>проекция</b>: задаёт форму результата. Переменная <code>q</code> лишь <span class="hl">хранит запрос</span>, данных пока нет.', nodes: [{ id: "f", kind: "chip", at: { zone: "query", row: 0 }, value: "from s in scores → источник" }, { id: "w", kind: "chip", at: { zone: "query", row: 1 }, value: "where s > 80 → фильтр" }, { id: "s", kind: "chip", at: { zone: "query", row: 2 }, value: "select s → проекция", accent: true }], edges: [] },
      ],
      explain: 'Query-выражение читается почти как SQL, но с обратным порядком клауз. Дословно: «You write query expressions in a declarative <i>query syntax</i>. By using query syntax, you perform <span class="hl">filtering, ordering, and grouping</span> operations on data sources with a minimum of code». <span class="ru-tr">«Query-выражения пишутся в декларативном <i>query-синтаксисе</i>. Используя query-синтаксис, вы выполняете операции фильтрации, упорядочивания и группировки над источниками данных с минимумом кода».</span> Клаузы: <code>from</code> вводит источник и range-переменную, <code>where</code> фильтрует, <code>select</code> проецирует. Важно: «The variables in a query expression are all <b>strongly typed</b>» <span class="ru-tr">«Все переменные в query-выражении <b>строго типизированы</b>»</span> — тип элементов выводится компилятором, IntelliSense работает. И ключ к разделу: «A query isn\'t executed until you <b>iterate over the query variable</b>» <span class="ru-tr">«Запрос не выполняется, пока вы не <b>пройдёте по переменной запроса в цикле</b>»</span> — переменная <code>q</code> держит только описание запроса (детально — урок S3.2).',
      sources: ["ms-linq"],
    },
    {
      id: "s2", num: "02", kicker: "Эквивалентность · сахар", title: "Компилятор переписывает query в вызовы Where/Select",
      viewBox: "0 0 340 210", zones: TWO_FORM_ZONES,
      code: ["// query-синтаксис:", "from x in n where x > 3 orderby x select x*10", "// компилятор превращает в method-синтаксис:", "n.Where(x => x > 3).OrderBy(x => x).Select(x => x*10)"],
      scenes: [
        { codeLine: 1, caption: 'Слева — то, что пишет разработчик: <code>from…where…orderby…select</code> в <b>query-форме</b>.', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "from…select", detail: "как пишем", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Компилятор <span class="hl">переписывает</span> каждую клаузу в вызов метода: <code>where→Where</code>, <code>orderby→OrderBy</code>, <code>select→Select</code>.', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "from…select", detail: "как пишем" }, { id: "m", kind: "gate", at: { zone: "ms", row: 0 }, state: "ok", label: "Where·OrderBy·Select", detail: "во что компилит", accent: true }], edges: [{ id: "e", from: "q", to: "m", accent: true }] },
        { codeLine: 3, caption: 'Итог: две формы дают <b>идентичный</b> результат — <code>SequenceEqual → True</code> (реальный прогон). «There\'s no semantic or performance difference between the two different forms». <span class="ru-tr">«Между двумя разными формами нет семантической разницы или разницы в производительности».</span>', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "query", detail: "50,80,90" }, { id: "m", kind: "gate", at: { zone: "ms", row: 0 }, state: "ok", label: "method", detail: "50,80,90", accent: true }], edges: [{ id: "e", from: "q", to: "m" }] },
      ],
      explain: 'Ключевой факт: query-синтаксис — это <b>синтаксический сахар</b> над вызовами методов. Дословно: «At compile time, the compiler <span class="hl">converts query expressions to standard query operator method calls</span> according to the rules defined in the C# specification. You can express any query that uses query syntax by using method syntax. In some cases, query syntax is more readable and concise. In others, method syntax is more readable. <b>There\'s no semantic or performance difference between the two different forms</b>». <span class="ru-tr">«Во время компиляции компилятор преобразует query-выражения в вызовы методов стандартных операторов запроса согласно правилам, определённым в спецификации C#. Любой запрос, использующий query-синтаксис, можно выразить с помощью method-синтаксиса. В некоторых случаях query-синтаксис читается яснее и лаконичнее. В других — понятнее method-синтаксис. <b>Между двумя разными формами нет семантической разницы или разницы в производительности</b>».</span> Проверка: тот же запрос в обеих формах даёт <code>50,80,90</code> и <code>SequenceEqual == True</code> (реальный прогон). Выбор формы — вопрос читаемости, не поведения.',
      sources: ["ms-linq"],
    },
    {
      id: "s3", num: "03", kicker: "Смешивание форм", title: "Query можно обернуть и продолжить методами",
      viewBox: "0 0 340 210", zones: TWO_FORM_ZONES,
      code: ["// query-часть в скобках, дальше — метод:", "var evenCount = (from x in n where x % 2 == 0 select x)", "                .Count();", "// или method-цепочка целиком: n.Where(...).Count()"],
      scenes: [
        { codeLine: 1, caption: 'Query-выражение в <span class="hl">скобках</span> — это обычное <code>IEnumerable&lt;int&gt;</code>, к нему применимы методы.', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "(from…select)", detail: "IEnumerable<int>", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Дальше цепляем <code>.Count()</code> — <b>метод</b> поверх query-части. Формы <span class="hl">комбинируются</span> в одном выражении.', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "(from…select)", detail: "query-часть" }, { id: "c", kind: "gate", at: { zone: "ms", row: 0 }, state: "ok", label: ".Count()", detail: "метод-часть", accent: true }], edges: [{ id: "e", from: "q", to: "c", accent: true }] },
        { codeLine: 3, caption: 'Тот же результат method-цепочкой целиком: <code>n.Where(...).Count()</code>. Обе легальны — выбор за читаемостью.', nodes: [{ id: "q", kind: "gate", at: { zone: "qs", row: 0 }, state: "ok", label: "query + метод", detail: "смешанно" }, { id: "c", kind: "gate", at: { zone: "ms", row: 0 }, state: "ok", label: "чистый метод", detail: "n.Where().Count()", accent: true }], edges: [] },
      ],
      explain: 'Query и method-синтаксис свободно комбинируются. Дословно: «You can <span class="hl">combine method syntax with query syntax</span> in various ways». <span class="ru-tr">«Вы можете сочетать method-синтаксис с query-синтаксисом различными способами».</span> Практический приём: пишешь фильтрацию/проекцию в читаемой query-форме, оборачиваешь в скобки и продолжаешь методом-агрегатом — <code>(from x in n where … select x).Count()</code>. Причина, почему это вообще нужно, — в следующем разборе: у ряда операций <b>нет</b> query-клаузы, поэтому чистой query-формой их не выразить.',
      sources: ["ms-linq"],
    },
    {
      id: "s4", num: "04", kicker: "Где метод обязателен", title: "Count / Max / First не имеют query-клаузы",
      viewBox: "0 0 340 210", zones: NOKW_ZONES,
      code: ["var n = Enumerable.Range(1, 20);", "// нет клаузы 'count' — только метод:", "int c = (from x in n where x % 2 == 0 select x).Count();", "// Count / Max / Average / First — всегда метод-вызов"],
      scenes: [
        { codeLine: 1, caption: 'У клауз <code>from/where/select/orderby/group/join</code> есть ключевые слова. У <span class="hl">Count/Max/Average/First</span> — нет.', nodes: [{ id: "kw", kind: "gate", at: { zone: "nokw", row: 0 }, state: "ok", label: "есть клаузы", detail: "where·select·orderby", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Хочешь <code>Count</code> — обязан <b>метод</b>: query-клаузы «count» не существует в языке.', nodes: [{ id: "kw", kind: "gate", at: { zone: "nokw", row: 0 }, state: "ok", label: "клаузы", detail: "6 ключевых слов" }, { id: "no", kind: "gate", at: { zone: "nokw", row: 1 }, state: "fail", label: ".Count()", detail: "нет query-клаузы", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Результат <code>.Count()</code> над чётными из <code>Range(1,20)</code> — <b>10</b> (реальный прогон). Скалярные операции возвращают значение, не последовательность.', nodes: [{ id: "no", kind: "gate", at: { zone: "nokw", row: 0 }, state: "fail", label: ".Count()", detail: "= 10" }, { id: "r", kind: "gate", at: { zone: "nokw", row: 1 }, state: "ok", label: "скаляр", detail: "не IEnumerable", accent: true }], edges: [] },
      ],
      explain: 'Не всё выразимо query-синтаксисом. Дословно: «Some query operations, such as <code>Count</code> or <code>Max</code>, have <span class="hl">no equivalent query expression clause</span> and must be expressed as a method call. You can combine method syntax with query syntax in various ways». <span class="ru-tr">«Некоторые операции запроса, такие как <code>Count</code> или <code>Max</code>, не имеют эквивалентной клаузы query-выражения и должны быть выражены как вызов метода. Вы можете сочетать method-синтаксис с query-синтаксисом различными способами».</span> Причина: query-клаузы покрывают преобразование последовательности (фильтр/сортировка/группировка/проекция), а <code>Count/Max/Average/First</code> сворачивают её в <b>одно значение</b> — для них в языке нет ключевого слова. Поэтому даже адепты query-стиля вынуждены переходить на метод для агрегатов. Реальный <code>.Count()</code> над чётными из <code>Enumerable.Range(1, 20)</code> = <b>10</b>.',
      sources: ["ms-linq", "ms-sqo"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный IL", title: "from x where select компилируется в Enumerable.Where + Select",
      viewBox: "0 0 340 210", zones: IL_ZONES,
      code: ["// исходник (Release):", "from x in n where x > 3 select x * 10", "// IL (ilspycmd, оптимизированная сборка):", "call Enumerable::Where<int32>(...)", "call Enumerable::Select<int32,int32>(...)"],
      predictAt: 1, predictQ: 'Во что компилятор превращает <code>from x in n where x&gt;3 select x*10</code> на уровне IL?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Исходник — query-выражение <code>from x in n where x &gt; 3 select x*10</code> в Release-сборке.', nodes: [{ id: "s", kind: "gate", at: { zone: "src", row: 0 }, state: "ok", label: "from…select", detail: "query expr", accent: true }], edges: [] },
        { codeLine: 3, out: "call Enumerable::Where", caption: 'В IL <code>where</code> становится <span class="hl">call Enumerable::Where&lt;int32&gt;</span> — вызов стандартного оператора, не «магия языка».', nodes: [{ id: "s", kind: "gate", at: { zone: "src", row: 0 }, state: "ok", label: "where", detail: "клауза" }, { id: "w", kind: "gate", at: { zone: "il", row: 0 }, state: "ok", label: "Where<int32>", detail: "call", accent: true }], edges: [{ id: "e1", from: "s", to: "w", accent: true }] },
        { codeLine: 4, out: "call Enumerable::Select", caption: '<code>select</code> → <span class="hl">call Enumerable::Select&lt;int32,int32&gt;</span>. Две клаузы — два вызова методов. Query-синтаксис <b>и есть</b> method-синтаксис (реальный IL).', nodes: [{ id: "w", kind: "gate", at: { zone: "il", row: 0 }, state: "ok", label: "Where", detail: "call" }, { id: "sel", kind: "gate", at: { zone: "il", row: 1 }, state: "ok", label: "Select<int32,int32>", detail: "call", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реальный Release-IL: query-выражение <b>исчезает</b> к моменту исполнения, остаются вызовы <code>Enumerable</code>. Декомпиляция (ilspycmd) метода с <code>from x in n where x &gt; 3 select x*10</code>: <code>call …Enumerable::Where&lt;int32&gt;(…, Func&lt;int,bool&gt;)</code>, затем <code>call …Enumerable::Select&lt;int32,int32&gt;(…, Func&lt;int,int&gt;)</code>. Ровно то, что дал бы <code>n.Where(x =&gt; x &gt; 3).Select(x =&gt; x*10)</code>. Это и есть смысл фразы «converts query expressions to standard query operator method calls» <span class="ru-tr">«преобразует query-выражения в вызовы методов стандартных операторов запроса»</span>: на уровне байткода двух форм не существует — есть одна, method-форма. Отсюда и «no semantic or performance difference» <span class="ru-tr">«нет семантической разницы или разницы в производительности»</span> — сравнивать нечего, IL один.',
      sources: ["ms-linq", "ms-il-ldloc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int[] scores = [97, 92, 81, 60]; var q = from s in scores where s &gt; 80 select s; Console.WriteLine(string.Join(" ", q));</code> — что напечатает?',
      options: ["97 92 81", "97 92 81 60", "60", "81 92 97"], correctIndex: 0, xp: 10,
      okText: '<code>where s &gt; 80</code> оставляет 97, 92, 81 (60 отсеян), <code>select s</code> сохраняет порядок источника → <b>97 92 81</b>. Query-форма фильтрует и проецирует.',
      noText: 'Фильтр <code>&gt; 80</code> отбрасывает 60; порядок — как в источнике (LINQ to Objects стабилен). Реальный вывод: <b>97 92 81</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "97 92 81" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int[] n = [5,3,8,1,9,2]; var q = from x in n where x &gt; 3 orderby x select x*10; Console.WriteLine(string.Join(",", q));</code> — что напечатает?',
      options: ["50,80,90", "80,50,90", "50,30,80,10,90,20", "90,80,50"], correctIndex: 0, xp: 10,
      okText: '<code>where x &gt; 3</code> оставляет 5, 8, 9; <code>orderby x</code> сортирует → 5,8,9; <code>select x*10</code> → <b>50,80,90</b>. Та же цепочка, что <code>Where().OrderBy().Select()</code>.',
      noText: 'Фильтр &gt;3 → {5,8,9}, сортировка → 5,8,9, *10 → <b>50,80,90</b>. Идентично method-форме (SequenceEqual = True).',
      verify: { kind: "exec", run: "dotnet run", expect: "50,80,90" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var n = Enumerable.Range(1, 20); var q = from x in n where x % 2 == 0 select x; Console.WriteLine(q.Count());</code> — что напечатает?',
      options: ["10", "20", "11", "9"], correctIndex: 0, xp: 10,
      okText: 'Чётных в <code>Range(1, 20)</code> ровно половина: 2, 4, …, 20 → <code>Count()</code> = <b>10</b>. У <code>Count</code> нет query-клаузы — он всегда метод-вызов поверх query-части.',
      noText: 'Операции вроде <code>Count</code> «have no equivalent query expression clause and must be expressed as a method call». <span class="ru-tr">«не имеют эквивалентной клаузы query-выражения и должны быть выражены как вызов метода».</span> Чётных в 1..20 — десять → <b>10</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "10" }, sourceRefs: ["ms-linq"],
    },
  ],

  takeaways: [
    { icon: "why", k: "две формы — один запрос", v: 'Query-синтаксис (<code>from…where…select</code>) — сахар: компилятор «converts query expressions to standard query operator method calls» <span class="ru-tr">«преобразует query-выражения в вызовы методов стандартных операторов запроса»</span>. <b>No semantic or performance difference</b> с <code>.Where().Select()</code>.' },
    { icon: "cost", k: "выбор — читаемость", v: 'В IL остаётся только method-форма (реальный замер: <code>Enumerable::Where</code> + <code>Select</code>). Форму выбираешь по читаемости; смешивать формы можно в одном выражении.' },
    { icon: "avoid", k: "агрегаты — только метод", v: '<code>Count/Max/Average/First</code> «have no equivalent query expression clause» <span class="ru-tr">«не имеют эквивалентной клаузы query-выражения»</span> — оборачивай query в скобки и зови метод: <code>(from…select).Count()</code>. Скаляр ≠ последовательность.' },
  ],

  foot: 'урок · <b>query vs method синтаксис LINQ</b> · 5 анимир. разборов · IL-панель <code>Where/Select</code> · дизайн <b>mid</b>',
};
