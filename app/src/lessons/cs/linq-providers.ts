/**
 * Lesson: LINQ providers — in-memory vs remote (CS.S3.linq-providers) — expert density,
 * 5 animated deep-dives + a machine panel. The model a senior needs: LINQ is provider-based.
 * The in-memory provider (LINQ to Objects, the Enumerable implementations) runs delegates over
 * any IEnumerable<T> locally; remote providers implement IQueryable<T> and range from a simple
 * closed-type-system wrapper up to a complex one (EF Core) that translates whole LINQ queries to
 * SQL. The one thing every provider must honour: custom operators use deferred execution.
 *
 * SIGNATURE machine panel (s5): the in-memory provider STREAMS — it drives a lazy, INFINITE
 * source (yield while(true)) through Where + Take and pulls exactly 4 elements (3,6,9,12),
 * never touching the rest. A REAL run-csharp measurement on :5101. Only a streaming, deferred
 * in-memory provider can query an infinite sequence. See docs/evidence/S3/L6-linq-providers.txt.
 *
 * NOTE: the IQueryable / EF-Core translation path cannot be executed by the run-csharp scripting
 * host (it references neither System.Linq.Queryable nor a DB provider). The remote-provider claims
 * are sourced VERBATIM to the LINQ landing page; the executable panel demonstrates the in-memory
 * provider, which IS a LINQ provider (LINQ to Objects).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../csharp/linq/ (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp on :5101 ("3,4,5"; "3,6,9,12"; "55").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.linq-providers/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: LINQ is provider-based — the query pattern over a pluggable backend.
const Z_PATTERN: Zone = { id: "pattern", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОДИН LINQ-СИНТАКСИС", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "from · where · select", subCls: "vz-zsub", subY: 47 };
const Z_BACKENDS: Zone = { id: "backends", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "РАЗНЫЕ ПРОВАЙДЕРЫ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Objects · XML · EF Core", subCls: "vz-zsub good", subY: 47 };
const PATTERN_ZONES: Zone[] = [Z_PATTERN, Z_BACKENDS];

// s2: in-memory provider (LINQ to Objects) — Enumerable over IEnumerable<T>.
const Z_INMEM: Zone = { id: "inmem", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "LINQ to Objects · in-memory провайдер", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "Enumerable-методы над IEnumerable<T>", subCls: "vz-zsub good", subY: 47 };
const INMEM_ZONES: Zone[] = [Z_INMEM];

// s3: remote provider spectrum — simple / medium / complex (EF Core).
const Z_SPECTRUM: Zone = { id: "spectrum", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "IQueryable-ПРОВАЙДЕРЫ · спектр сложности", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "простой → средний → сложный (EF Core → SQL)", subCls: "vz-zsub", subY: 47 };
const SPECTRUM_ZONES: Zone[] = [Z_SPECTRUM];

// s4: enabling LINQ on your own type — implement IEnumerable<T> or custom operators (deferred).
const Z_ENABLE: Zone = { id: "enable", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "КАК ВКЛЮЧИТЬ LINQ НА СВОЁМ ТИПЕ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "IEnumerable<T> · либо кастомные операторы (deferred)", subCls: "vz-zsub", subY: 47 };
const ENABLE_ZONES: Zone[] = [Z_ENABLE];

// s5 (SIGNATURE): in-memory provider streams a lazy infinite source, takes 4.
const Z_INF: Zone = { id: "inf", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "БЕСКОНЕЧНЫЙ ИСТОЧНИК", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "yield while(true)", subCls: "vz-zsub good", subY: 47 };
const Z_TAKE: Zone = { id: "take", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Where + Take(4)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "провайдер тянет ровно 4", subCls: "vz-zsub good", subY: 47 };
const INF_ZONES: Zone[] = [Z_INF, Z_TAKE];

export const linqProviders: LessonData = {
  id: "CS.S3.linq-providers",
  track: "CS",
  section: "CS.S3",
  module: "S3.6",
  lang: "csharp",
  title: "LINQ-провайдеры: in-memory и удалённые",
  kicker: "C# вглубь · S3 · один синтаксис — разные бэкенды",
  home: { subtitle: "LINQ to Objects, IQueryable-провайдеры, спектр сложности, EF Core→SQL", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-intro", kind: "doc", org: "Microsoft Learn", title: "Introduction to LINQ Queries — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries", date: "2024-04-22" },
  ],

  spec: [
    { text: "«You use the same basic coding patterns to query and transform data in XML documents, SQL databases, .NET collections, and any other format when a LINQ provider is available.»", source: "ms-intro" },
  ],
  edgeCases: [
    { text: "In-memory: «If the data is of a type that implements <code>IEnumerable&lt;T&gt;</code>, <span class=\"hl\">query the data by using LINQ to Objects</span>».", source: "ms-linq" },
    { text: "Удалённый источник: «The best option for enabling LINQ querying of a <b>remote data source</b> is to implement the <span class=\"hl\">IQueryable&lt;T&gt;</span> interface».", source: "ms-linq" },
    { text: "Кастомные операторы обязаны быть отложенными: «Custom implementations of the standard query operators should use <span class=\"hl\">deferred execution</span> to return the results».", source: "ms-linq" },
  ],

  misconceptions: [
    {
      wrong: "LINQ — это про коллекции в памяти; SQL/XML/EF — отдельные технологии, не связанные с LINQ",
      hook: 'Узкое представление: <span class="wrong">LINQ работает только с коллекциями в памяти</span>. На деле LINQ — <b>провайдерная</b> модель: «You use the <span class="hl">same basic coding patterns</span> to query and transform data in XML documents, SQL databases, .NET collections, and any other format <b>when a LINQ provider is available</b>». Один синтаксис <code>from…where…select</code> — разные бэкенды: LINQ to Objects (память), LINQ to XML, EF Core (→ SQL). Ниже <b>пять разборов</b>: провайдерная модель, in-memory провайдер, спектр IQueryable-провайдеров (простой→EF Core), как включить LINQ на своём типе, и <b>машинная панель</b> — in-memory провайдер <span class="hl">потоково</span> тянет <b>бесконечный</b> источник и берёт ровно 4 элемента (реальный прогон).',
      source: "ms-intro",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Провайдерная модель", title: "Один LINQ-синтаксис — сменный бэкенд-провайдер",
      viewBox: "0 0 340 210", zones: PATTERN_ZONES,
      code: ["from x in source where ... select ...   // один синтаксис", "// source = List<T>  → LINQ to Objects", "// source = XElement → LINQ to XML", "// source = db.Set   → EF Core (SQL)"],
      scenes: [
        { codeLine: 0, caption: 'LINQ-синтаксис <span class="hl">один</span> для всех источников: те же <code>where/select/group</code>. Меняется лишь провайдер под ним.', nodes: [{ id: "p", kind: "obj", at: { zone: "pattern", row: 0 }, typeTag: "from…select", value: "единый", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Для <code>List&lt;T&gt;</code>/массива работает <b>LINQ to Objects</b> — in-memory провайдер (реализации <code>Enumerable</code>).', nodes: [{ id: "p", kind: "obj", at: { zone: "pattern", row: 0 }, typeTag: "from…select", value: "единый" }, { id: "o", kind: "chip", at: { zone: "backends", row: 0 }, value: "Objects (память)", accent: true }], edges: [{ id: "e1", from: "p", to: "o" }] },
        { codeLine: 3, caption: 'Тот же запрос над <code>db.Set</code> обслуживает <b>EF Core</b> — генерирует <span class="hl">SQL</span>. Синтаксис не изменился, провайдер — да.', nodes: [{ id: "p", kind: "obj", at: { zone: "pattern", row: 0 }, typeTag: "from…select", value: "единый" }, { id: "o", kind: "chip", at: { zone: "backends", row: 0 }, value: "Objects (память)" }, { id: "ef", kind: "chip", at: { zone: "backends", row: 1 }, value: "EF Core → SQL", accent: true }], edges: [{ id: "e2", from: "p", to: "ef", accent: true }] },
      ],
      explain: 'LINQ — это единый паттерн запроса поверх сменного провайдера. Дословно: «LINQ simplifies this situation by offering a <span class="hl">consistent C# language model</span> for kinds of data sources and formats… You use the same basic coding patterns to query and transform data in <b>XML documents, SQL databases, .NET collections, and any other format when a LINQ provider is available</b>». Провайдер — это то, что «понимает» источник: LINQ to Objects исполняет делегаты над коллекциями в памяти; LINQ to XML грузит документ в <code>XElement</code>; EF Core транслирует запрос в SQL. Вы пишете один и тот же <code>from…where…select</code> — провайдер решает, как его выполнить.',
      sources: ["ms-intro", "ms-linq"],
    },
    {
      id: "s2", num: "02", kicker: "In-memory провайдер", title: "LINQ to Objects: операторы Enumerable над IEnumerable<T>",
      viewBox: "0 0 340 210", zones: INMEM_ZONES,
      code: ["// любой тип, реализующий IEnumerable<T>, — источник LINQ to Objects", "IEnumerable<int> seq = customCollection;", "seq.Where(...).Select(...).OrderBy(...);", "// исполняют это реализации Enumerable — делегаты в процессе"],
      scenes: [
        { codeLine: 1, caption: 'Условие для LINQ to Objects: тип <span class="hl">реализует <code>IEnumerable&lt;T&gt;</code></span>. Тогда доступны все стандартные операторы.', nodes: [{ id: "s", kind: "gate", at: { zone: "inmem", row: 0 }, state: "ok", label: "IEnumerable<T>", detail: "любой такой тип", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Операторы обслуживают <b>реализации <code>Enumerable</code></b> — тот самый in-memory провайдер. Лямбды исполняются как делегаты <span class="hl">в вашем процессе</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "inmem", row: 0 }, state: "ok", label: "IEnumerable<T>", detail: "источник" }, { id: "e", kind: "gate", at: { zone: "inmem", row: 1 }, state: "ok", label: "Enumerable-реализации", detail: "делегаты in-process", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Даже <b>кастомная</b> коллекция (свой <code>IEnumerable</code>/итератор) мгновенно получает <code>Where/Distinct/OrderBy</code> — бесплатно.', nodes: [{ id: "s", kind: "gate", at: { zone: "inmem", row: 0 }, state: "ok", label: "свой итератор", detail: "yield return" }, { id: "ops", kind: "gate", at: { zone: "inmem", row: 1 }, state: "ok", label: "весь LINQ доступен", detail: "без доп. кода", accent: true }], edges: [] },
      ],
      explain: 'In-memory провайдер — это LINQ to Objects. Дословно: «"LINQ to Objects" refers to the use of LINQ queries with <span class="hl">any <code>IEnumerable</code> or <code>IEnumerable&lt;T&gt;</code> collection directly</span>. You can use LINQ to query any enumerable collections, such as <code>List&lt;T&gt;</code>, <code>Array</code>, or <code>Dictionary&lt;TKey,TValue&gt;</code>. The collection can be user-defined or a type returned by a .NET API». И способ включить его на своём типе: «If the data is of a type that implements <code>IEnumerable&lt;T&gt;</code>, <b>query the data by using LINQ to Objects</b>». Реализовал <code>IEnumerable&lt;T&gt;</code> (хоть через <code>yield return</code>) — получил весь набор операторов, исполняемых делегатами в процессе. Это докажет карточка с кастомным генератором.',
      sources: ["ms-intro", "ms-linq"],
    },
    {
      id: "s3", num: "03", kicker: "Спектр IQueryable", title: "Удалённые провайдеры: от простого до EF Core",
      viewBox: "0 0 340 210", zones: SPECTRUM_ZONES,
      code: ["// IQueryable-провайдеры варьируются по сложности:", "// простой:  один метод веб-сервиса, закрытый тип-систем", "// средний:  несколько методов, богаче типы, но фиксированные", "// сложный:  EF Core — весь LINQ → SQL, открытая тип-система"],
      scenes: [
        { codeLine: 1, caption: '<b>Простой</b> провайдер: обращается к одному методу веб-сервиса, «closed type system», часто исполняет запрос локально через <code>Enumerable</code>.', nodes: [{ id: "s", kind: "gate", at: { zone: "spectrum", row: 0 }, state: "ok", label: "простой", detail: "1 метод · closed types", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Средний</b>: несколько методов, <span class="hl">богаче тип-система</span>, но всё ещё фиксированная — без маппинга пользовательских типов.', nodes: [{ id: "s", kind: "gate", at: { zone: "spectrum", row: 0 }, state: "ok", label: "простой", detail: "1 метод" }, { id: "m", kind: "gate", at: { zone: "spectrum", row: 1 }, state: "ok", label: "средний", detail: "фиксированная тип-система", accent: true }], edges: [] },
        { codeLine: 3, caption: '<b>Сложный</b> (EF Core): транслирует <span class="hl">полные LINQ-запросы в SQL</span>, открытая тип-система, обширный маппинг. «significant amount of effort».', nodes: [{ id: "m", kind: "gate", at: { zone: "spectrum", row: 0 }, state: "ok", label: "средний", detail: "фиксир." }, { id: "c", kind: "gate", at: { zone: "spectrum", row: 1 }, state: "ok", label: "сложный · EF Core", detail: "весь LINQ → SQL", accent: true }], edges: [] },
      ],
      explain: 'Удалённые провайдеры реализуют <code>IQueryable&lt;T&gt;</code> и «can vary widely in their complexity». Дословно: простой — «A less complex <code>IQueryable</code> provider might access a single method from a Web service… It has a <span class="hl">closed type system</span>… Most of the execution of the query occurs locally, for example by using the <code>Enumerable</code> implementations»; средний — «has a richer type system than a simple provider, but it\'s still a <b>fixed type system</b>»; сложный — «A complex <code>IQueryable</code> provider, such as the <b>Entity Framework Core</b> provider, might <span class="hl">translate complete LINQ queries to an expressive query language, such as SQL</span>… It also has an <b>open type system</b>… Developing a complex provider requires a significant amount of effort». Отсюда практический вывод: возможности <code>IQueryable</code>-запроса ограничены тем, что провайдер умеет перевести.',
      sources: ["ms-linq"],
    },
    {
      id: "s4", num: "04", kicker: "Включить LINQ на своём типе", title: "Реализуй IEnumerable<T> или IQueryable<T> (для remote)",
      viewBox: "0 0 340 210", zones: ENABLE_ZONES,
      code: ["// in-memory: реализуй IEnumerable<T> → LINQ to Objects даёт всё", "// или определи кастомные операторы (extension) — ДОЛЖНЫ быть deferred", "// remote: реализуй IQueryable<T> (лучший вариант для удалённого источника)"],
      scenes: [
        { codeLine: 0, caption: 'Самый простой путь: <span class="hl">реализовать <code>IEnumerable&lt;T&gt;</code></span> — и LINQ to Objects обслужит запросы к твоим данным.', nodes: [{ id: "i", kind: "gate", at: { zone: "enable", row: 0 }, state: "ok", label: "IEnumerable<T>", detail: "→ LINQ to Objects", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Если перечисление не подходит — определи <b>кастомные операторы</b>. Требование: они <span class="hl">обязаны использовать deferred execution</span>.', nodes: [{ id: "i", kind: "gate", at: { zone: "enable", row: 0 }, state: "ok", label: "IEnumerable<T>", detail: "путь 1" }, { id: "c", kind: "gate", at: { zone: "enable", row: 1 }, state: "ok", label: "кастомные операторы", detail: "должны быть deferred", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Для <b>удалённого</b> источника лучший выбор — <span class="hl">реализовать <code>IQueryable&lt;T&gt;</code></span>: запрос уедет деревом на сторону источника.', nodes: [{ id: "c", kind: "gate", at: { zone: "enable", row: 0 }, state: "ok", label: "кастомные операторы", detail: "in-memory" }, { id: "q", kind: "gate", at: { zone: "enable", row: 1 }, state: "ok", label: "IQueryable<T>", detail: "для remote", accent: true }], edges: [] },
      ],
      explain: 'Как сделать свой источник LINQ-запрашиваемым — дословно: «You can enable LINQ querying of in-memory data in two ways. If the data is of a type that implements <code>IEnumerable&lt;T&gt;</code>, <span class="hl">query the data by using LINQ to Objects</span>. If it doesn\'t make sense to enable enumeration… define LINQ standard query operator methods either in that type or as <b>extension members</b> for that type. Custom implementations of the standard query operators should use <b>deferred execution</b> to return the results». А для удалённого: «The best option for enabling LINQ querying of a <b>remote data source</b> is to implement the <code>IQueryable&lt;T&gt;</code> interface». Итог: in-memory → <code>IEnumerable&lt;T&gt;</code> (или свои deferred-операторы); remote → <code>IQueryable&lt;T&gt;</code> (свой provider). Кастомные операторы — тема урока S3.8.',
      sources: ["ms-linq"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "In-memory провайдер потоково тянет бесконечный источник — берёт 4",
      viewBox: "0 0 340 210", zones: INF_ZONES,
      code: ["IEnumerable<int> Naturals() { int i = 1; while (true) yield return i++; }", "var r = Naturals().Where(x => x % 3 == 0).Take(4);", "// провайдер тянет из бесконечного источника ТОЛЬКО пока нужно"],
      predictAt: 1, predictQ: 'Источник <b>бесконечный</b> (<code>while(true) yield</code>). <code>Where(x%3==0).Take(4)</code> — зациклится или вернёт значения?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Источник <code>Naturals()</code> — <span class="hl">бесконечный</span> итератор: <code>while(true) yield return</code>. Материализовать его целиком нельзя.', nodes: [{ id: "n", kind: "gate", at: { zone: "inf", row: 0 }, state: "ok", label: "yield while(true)", detail: "1,2,3,4,…", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Take(4)</code> просит <b>4</b> элемента → in-memory провайдер тянет из источника ровно столько, сколько нужно, и <span class="hl">останавливается</span>.', nodes: [{ id: "n", kind: "gate", at: { zone: "inf", row: 0 }, state: "ok", label: "бесконечный", detail: "источник" }, { id: "t", kind: "gate", at: { zone: "take", row: 0 }, state: "ok", label: "Take(4)", detail: "тянет 4 и стоп", accent: true }], edges: [{ id: "e", from: "n", to: "t", accent: true }] },
        { codeLine: 2, out: "3,6,9,12", caption: 'Результат — <b>3,6,9,12</b> (первые 4 кратных 3), без зависания (реальный прогон). <span class="hl">Deferred + streaming</span> провайдера делают запрос к бесконечности конечным.', nodes: [{ id: "t", kind: "gate", at: { zone: "inf", row: 0 }, state: "ok", label: "результат", detail: "3,6,9,12" }, { id: "d", kind: "gate", at: { zone: "take", row: 0 }, state: "ok", label: "не завис", detail: "остальное не тронуто", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — доказательство природы in-memory провайдера, снятое прогоном. LINQ to Objects <b>ленив и потоков</b>: он не читает источник целиком, а тянет элементы по требованию. Поэтому запрос к <b>бесконечному</b> генератору <code>Naturals()</code> (<code>while(true) yield return i++</code>) через <code>Where(x =&gt; x % 3 == 0).Take(4)</code> не зависает, а возвращает <b>3,6,9,12</b>: провайдер запросил у источника ровно столько элементов, сколько понадобилось <code>Take(4)</code>, и остановился. Это прямое следствие двух свойств провайдера — <b>deferred</b> и <b>streaming</b> (урок S3.4): именно они позволяют запрашивать бесконечные и ленивые последовательности. Ни один буферизующий/материализующий провайдер так не смог бы.',
      sources: ["ms-linq", "ms-intro"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Gen(){ yield return 3; yield return 1; yield return 4; yield return 1; yield return 5; } var r = Gen().Where(x =&gt; x &gt; 1).Distinct().OrderBy(x =&gt; x); Console.WriteLine(string.Join(",", r));</code> — что напечатает?',
      options: ["3,4,5", "3,4,1,5", "1,3,4,5", "3,1,4,5"], correctIndex: 0, xp: 10,
      okText: 'Кастомный итератор <code>Gen()</code> — источник <b>LINQ to Objects</b>, получает все операторы. &gt;1 → {3,4,5}; <code>Distinct</code> убирает дубль; <code>OrderBy</code> → <b>3,4,5</b>.',
      noText: 'Свой <code>IEnumerable</code> (через yield) сразу запрашиваем LINQ. Фильтр &gt;1 → 3,4,5 (единицы ушли), Distinct, сортировка → <b>3,4,5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "3,4,5" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Naturals(){ int i = 1; while(true) yield return i++; } var r = Naturals().Where(x =&gt; x % 3 == 0).Take(4); Console.WriteLine(string.Join(",", r));</code> — что напечатает?',
      options: ["3,6,9,12", "(зависнет)", "3,6,9", "0,3,6,9"], correctIndex: 0, xp: 10,
      okText: 'In-memory провайдер <b>ленив и потоков</b>: тянет из бесконечного источника лишь до <code>Take(4)</code> кратных 3 → <b>3,6,9,12</b>, без зависания. Deferred+streaming делают запрос к бесконечности конечным.',
      noText: 'Провайдер запрашивает ровно 4 нужных элемента и останавливается — источник бесконечный, но перечисляется лениво. Реальный вывод: <b>3,6,9,12</b> (не зависание).',
      verify: { kind: "exec", run: "dotnet run", expect: "3,6,9,12" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var r = Enumerable.Range(1, 5).Select(x =&gt; x * x).Sum(); Console.WriteLine(r);</code> — что напечатает?',
      options: ["55", "15", "25", "225"], correctIndex: 0, xp: 10,
      okText: 'In-memory провайдер: <code>Select</code> проецирует 1..5 в квадраты {1,4,9,16,25}, <code>Sum</code> (immediate) считает сумму → <b>55</b>. Всё исполнено делегатами в процессе.',
      noText: 'Квадраты 1..5: 1+4+9+16+25 = <b>55</b>. <code>Sum</code> — скалярный, immediate-оператор LINQ to Objects.',
      verify: { kind: "exec", run: "dotnet run", expect: "55" }, sourceRefs: ["ms-linq"],
    },
  ],

  takeaways: [
    { icon: "why", k: "LINQ — провайдерная модель", v: '«same basic coding patterns to query… XML documents, SQL databases, .NET collections… when a LINQ provider is available». Один <code>from…select</code>, разные бэкенды: Objects / XML / EF Core.' },
    { icon: "cost", k: "in-memory vs remote", v: 'In-memory (LINQ to Objects) — <code>Enumerable</code> над любым <code>IEnumerable&lt;T&gt;</code>, делегаты в процессе. Remote — <code>IQueryable&lt;T&gt;</code>; спектр от простого (closed types) до EF Core (весь LINQ → SQL).' },
    { icon: "avoid", k: "включить на своём типе", v: 'In-memory: реализуй <code>IEnumerable&lt;T&gt;</code> (замер: кастомный/бесконечный итератор → весь LINQ работает, 3,6,9,12). Свои операторы «should use deferred execution». Remote → реализуй <code>IQueryable&lt;T&gt;</code>.' },
  ],

  foot: 'урок · <b>LINQ-провайдеры</b> · 5 анимир. разборов · панель: потоковый запрос к бесконечному источнику · дизайн <b>mid</b>',
};
