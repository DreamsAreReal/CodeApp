/**
 * Lesson: Deferred execution — streaming vs nonstreaming (CS.S3.deferred-execution) — expert
 * density, 6 animated deep-dives + a machine panel. The section's flagship. What a senior must
 * be able to reason about precisely: a LINQ operator returning IEnumerable<T> does NOTHING at
 * the declaration site (deferred); it runs only when enumerated. Among deferred operators,
 * STREAMING ones (Where, Select, Take) yield per element as read; NONSTREAMING ones (OrderBy,
 * GroupBy, Reverse) must read the WHOLE source before yielding the first result. Scalar
 * operators (Count, First, Max, ToList) execute immediately.
 *
 * SIGNATURE machine panel (s6): a live iteration COUNTER proves exactly when the query runs:
 *   - deferred: a side-effecting Select fires 0 times before ToList, 3 after (before=0 after=3);
 *   - streaming: Where(...).First() over Range(1,100) reads only 7 elements (first=7 seen=7);
 *   - nonstreaming: OrderByDescending over Range(1,10) reads ALL 10 before the first yield
 *     (first=10 seen=10).
 * REAL run-csharp measurements on :5101. See docs/evidence/S3/L4-deferred-execution.txt.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from
 *     learn.microsoft.com/.../csharp/linq/get-started/introduction-to-linq-queries (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp on :5101
 *     (evidence: "before=0 after=3"; "first=7 seen=7"; "first=10 seen=10").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.deferred-execution/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: immediate vs deferred split by return type.
const Z_IMM: Zone = { id: "imm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IMMEDIATE", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "скаляр · сразу", subCls: "vz-zsub", subY: 47 };
const Z_DEF: Zone = { id: "def", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "DEFERRED", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "IEnumerable<T> · потом", subCls: "vz-zsub good", subY: 47 };
const SPLIT_ZONES: Zone[] = [Z_IMM, Z_DEF];

// s2: the declaration-vs-iteration timeline (nothing runs at declaration).
const Z_TL: Zone = { id: "tl", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "DEFERRED · когда бежит", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "объявление → 0 работы · итерация → работа", subCls: "vz-zsub", subY: 47 };
const TL_ZONES: Zone[] = [Z_TL];

// s3: streaming — yield per element as read.
const Z_STREAM: Zone = { id: "stream", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "STREAMING · по одному", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "Where · Select · Take · Skip", subCls: "vz-zsub good", subY: 47 };
const STREAM_ZONES: Zone[] = [Z_STREAM];

// s4: nonstreaming — must read all before first yield.
const Z_NONS: Zone = { id: "nons", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "NONSTREAMING · читает всё", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "OrderBy · GroupBy · Reverse", subCls: "vz-zsub heap", subY: 47 };
const NONS_ZONES: Zone[] = [Z_NONS];

// s5: multiple-enumeration trap (re-runs each iteration).
const Z_TRAP: Zone = { id: "trap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ЛОВУШКА · повторное перечисление", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "каждый foreach = новый прогон источника", subCls: "vz-zsub", subY: 47 };
const TRAP_ZONES: Zone[] = [Z_TRAP];

// s6 (SIGNATURE): the iteration counter — three measured cases.
const Z_C1: Zone = { id: "c1", x: 14, y: 34, w: 100, h: 168, cls: "vz-zone good", label: "DEFERRED", labelCls: "vz-zlabel good sm", lx: 64, ly: 24, sub: "Select+ToList", subCls: "vz-zsub good", subY: 47 };
const Z_C2: Zone = { id: "c2", x: 120, y: 34, w: 100, h: 168, cls: "vz-zone good", label: "STREAMING", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "Where.First", subCls: "vz-zsub good", subY: 47 };
const Z_C3: Zone = { id: "c3", x: 226, y: 34, w: 100, h: 168, cls: "vz-zone heap", label: "NONSTREAM", labelCls: "vz-zlabel heap sm", lx: 276, ly: 24, sub: "OrderBy", subCls: "vz-zsub heap", subY: 47 };
const COUNTER_ZONES: Zone[] = [Z_C1, Z_C2, Z_C3];

export const deferredExecution: LessonData = {
  id: "CS.S3.deferred-execution",
  track: "CS",
  section: "CS.S3",
  module: "S3.4",
  lang: "csharp",
  title: "Отложенное выполнение: streaming vs buffering",
  kicker: "C# вглубь · S3 · когда РЕАЛЬНО бежит",
  home: { subtitle: "deferred, streaming/nonstreaming, immediate, счётчик итераций", icon: "collections", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-intro", kind: "doc", org: "Microsoft Learn", title: "Introduction to LINQ Queries — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries", date: "2024-04-22" },
  ],

  spec: [
    { text: "«Deferred execution means that the operation isn't performed at the point in the code where the query is declared. The operation is performed only when the query variable is enumerated, for example by using a foreach statement.»", source: "ms-intro" },
  ],
  edgeCases: [
    { text: "Immediate = скаляр: «All the standard query operators that <b>return a scalar result execute immediately</b>. Examples of such queries are <code>Count</code>, <code>Max</code>, <code>Average</code>, and <code>First</code>».", source: "ms-intro" },
    { text: "Streaming не читает всё: «<span class=\"hl\">Streaming operators don't have to read all the source data</span> before they yield elements… a streaming operator performs its operation on each source element as it is read and yields the element if appropriate».", source: "ms-intro" },
    { text: "Nonstreaming читает всё: «Nonstreaming operators <span class=\"hl\">must read all the source data before they can yield a result element</span>. Operations such as sorting or grouping fall into this category».", source: "ms-intro" },
  ],

  misconceptions: [
    {
      wrong: "LINQ-запрос выполняется на строке, где он написан, и результат кешируется в переменной",
      hook: 'Опасное заблуждение: <span class="wrong">запрос выполняется там, где написан</span>, и переменная держит закешированный результат. Нет: операторы, возвращающие <code>IEnumerable&lt;T&gt;</code>, <b>откладывают</b> работу. Дословно: «<span class="hl">Deferred execution</span> means that the operation isn\'t performed at the point in the code where the query is declared. The operation is performed <b>only when the query variable is enumerated</b>». И есть два вида отложенных: <b>streaming</b> (по элементу) и <b>nonstreaming</b> (сначала читает весь источник). Ниже <b>шесть разборов</b> и <b>машинная панель</b> — живой счётчик итераций: deferred <b>0→3</b>, streaming <b>читает 7 из 100</b>, nonstreaming <b>читает все 10</b> до первого результата (реальные замеры).',
      source: "ms-intro",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Immediate vs Deferred", title: "Тип возврата решает: скаляр — сразу, последовательность — потом",
      viewBox: "0 0 340 210", zones: SPLIT_ZONES,
      code: ["src.Count();      // скаляр → IMMEDIATE (бежит сразу)", "src.Max();        // скаляр → IMMEDIATE", "src.Where(...);   // IEnumerable<T> → DEFERRED", "src.Select(...);  // IEnumerable<T> → DEFERRED"],
      scenes: [
        { codeLine: 0, caption: '<code>Count/Max/Average/First</code> возвращают <span class="hl">одно значение</span> → исполняются <b>немедленно</b>: чтобы вернуть число, надо пройти источник сейчас.', nodes: [{ id: "c", kind: "gate", at: { zone: "imm", row: 0 }, state: "ok", label: "Count()", detail: "скаляр · сразу", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>Where/Select</code> возвращают <code>IEnumerable&lt;T&gt;</code> → <b>откладываются</b>: возвращают объект-запрос, ничего не читая.', nodes: [{ id: "c", kind: "gate", at: { zone: "imm", row: 0 }, state: "ok", label: "Count()", detail: "immediate" }, { id: "w", kind: "gate", at: { zone: "def", row: 0 }, state: "ok", label: "Where()", detail: "IEnumerable · defer", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Правило: <span class="hl">возврат — скаляр</span> → immediate; <span class="hl">возврат — последовательность</span> → deferred. <code>ToList/ToArray</code> тоже форсируют сразу.', nodes: [{ id: "c", kind: "gate", at: { zone: "imm", row: 0 }, state: "ok", label: "скаляр", detail: "Count·Max·First" }, { id: "w", kind: "gate", at: { zone: "def", row: 0 }, state: "ok", label: "последовательность", detail: "Where·Select", accent: true }], edges: [] },
      ],
      explain: 'Способ исполнения оператора определяется его типом возврата. Дословно: «The LINQ to Objects implementations of the standard query operator methods execute in one of two main ways: <span class="hl">immediate or deferred</span>… All the standard query operators that <b>return a scalar result execute immediately</b>. Examples of such queries are <code>Count</code>, <code>Max</code>, <code>Average</code>, and <code>First</code>… Almost all the standard query operators whose return type is <code>IEnumerable&lt;T&gt;</code> or <code>IOrderedEnumerable&lt;TElement&gt;</code> <b>execute in a deferred manner</b>». Практика: увидел в сигнатуре <code>IEnumerable&lt;T&gt;</code> — работа отложена; увидел <code>int/bool/T</code> — работа сейчас.',
      sources: ["ms-intro"],
    },
    {
      id: "s2", num: "02", kicker: "Точка исполнения", title: "На строке объявления не бежит НИЧЕГО",
      viewBox: "0 0 340 210", zones: TL_ZONES,
      code: ["var q = src.Select(x => Work(x));  // 0 вызовов Work", "// ... другой код ...", "var list = q.ToList();             // ЗДЕСЬ Work вызывается N раз"],
      scenes: [
        { codeLine: 0, caption: 'Строка <code>var q = src.Select(Work)</code> — <span class="hl">0 вызовов</span> <code>Work</code>. Возвращён лишь объект-запрос.', nodes: [{ id: "d", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "Select(Work)", detail: "0 вызовов · отложено", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>ToList()</code> <b>перечисляет</b> запрос → только теперь <code>Work</code> вызывается для каждого элемента.', nodes: [{ id: "d", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "Select(Work)", detail: "отложено" }, { id: "r", kind: "gate", at: { zone: "tl", row: 1 }, state: "ok", label: "ToList()", detail: "перечисляет · Work×N", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Итог: «performed only when the query variable is <span class="hl">enumerated</span>». Тяжёлый запрос без перечисления — бесплатен.', nodes: [{ id: "r", kind: "gate", at: { zone: "tl", row: 0 }, state: "ok", label: "перечисление", detail: "= исполнение", accent: true }], edges: [] },
      ],
      explain: 'Где именно исполняется отложенный запрос — дословно: «Deferred execution means that the operation <b>isn\'t performed at the point in the code where the query is declared</b>. The operation is performed <span class="hl">only when the query variable is enumerated</span>, for example by using a <code>foreach</code> statement». Перечисление запускают: <code>foreach</code>, <code>ToList/ToArray/ToDictionary</code>, и immediate-операторы (<code>Count/First/…</code>). Следствие для отладки: если <code>Select</code> с побочным эффектом «не сработал» — вероятно, запрос ни разу не перечислили. Машинная панель покажет это счётчиком.',
      sources: ["ms-intro"],
    },
    {
      id: "s3", num: "03", kicker: "Streaming · по элементу", title: "Streaming-оператор выдаёт элемент, не читая весь источник",
      viewBox: "0 0 340 210", zones: STREAM_ZONES,
      code: ["// Where + First: streaming", "src.Where(x => pred(x)).First();", "// читает элементы ПО ОДНОМУ и останавливается на первом совпадении"],
      scenes: [
        { codeLine: 1, caption: '<code>Where</code> — <b>streaming</b>: берёт элемент, проверяет предикат, при истине <span class="hl">сразу отдаёт</span>. Не ждёт конца источника.', nodes: [{ id: "s", kind: "gate", at: { zone: "stream", row: 0 }, state: "ok", label: "элемент → предикат", detail: "yield если true", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>First()</code> просит <b>один</b> элемент → <code>Where</code> читает ровно до первого совпадения и <span class="hl">останавливается</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "stream", row: 0 }, state: "ok", label: "Where", detail: "по одному" }, { id: "f", kind: "gate", at: { zone: "stream", row: 1 }, state: "ok", label: "First()", detail: "стоп на первом", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Итог: часть источника <span class="hl">не прочитана вовсе</span>. Это позволяет LINQ работать с бесконечными последовательностями.', nodes: [{ id: "s", kind: "gate", at: { zone: "stream", row: 0 }, state: "ok", label: "прочитано частично", detail: "остаток не тронут", accent: true }], edges: [] },
      ],
      explain: 'Streaming-операторы не буферизуют вход. Дословно: «<span class="hl">Streaming operators don\'t have to read all the source data before they yield elements</span>. At the time of execution, a streaming operator performs its operation on each source element as it is read and yields the element if appropriate. A streaming operator continues to read source elements until a result element can be produced». К streaming относятся <code>Where, Select, Take, Skip, Cast, Concat</code>. Практический выигрыш: <code>Where(...).First()</code> читает источник только до первого совпадения — остальное не трогает. Именно поэтому LINQ работает и с ленивыми/бесконечными источниками (<code>Enumerable.Range</code>, генераторы). Точное число прочитанного — в машинной панели.',
      sources: ["ms-intro"],
    },
    {
      id: "s4", num: "04", kicker: "Nonstreaming · буферизует", title: "OrderBy/GroupBy читают ВЕСЬ источник до первого результата",
      viewBox: "0 0 340 210", zones: NONS_ZONES,
      code: ["// OrderBy: nonstreaming (buffering)", "src.OrderByDescending(x => x).First();", "// чтобы отдать МАКСИМУМ, нужно увидеть ВСЕ элементы"],
      scenes: [
        { codeLine: 1, caption: '<code>OrderBy</code> не может отдать первый элемент, не увидев <span class="hl">все</span>: вдруг последний окажется наименьшим/наибольшим.', nodes: [{ id: "n", kind: "gate", at: { zone: "nons", row: 0 }, state: "fail", label: "OrderBy", detail: "нужен весь вход", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Он <b>буферизует</b> источник в структуру, сортирует, и лишь потом <span class="hl">начинает выдавать</span>. Первый результат стоит прочтения всего.', nodes: [{ id: "n", kind: "gate", at: { zone: "nons", row: 0 }, state: "fail", label: "буфер + сортировка", detail: "весь источник в памяти" }, { id: "y", kind: "gate", at: { zone: "nons", row: 1 }, state: "ok", label: "затем yield", detail: "после чтения всего", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Даже <code>.First()</code> над <code>OrderBy</code> прочитает <span class="hl">весь</span> источник — в отличие от streaming <code>Where.First()</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "nons", row: 0 }, state: "fail", label: "First() над OrderBy", detail: "читает всё равно всё", accent: true }], edges: [] },
      ],
      explain: 'Nonstreaming (буферизующие) операторы обязаны прочитать источник целиком. Дословно: «Nonstreaming operators <span class="hl">must read all the source data before they can yield a result element</span>. Operations such as sorting or grouping fall into this category. At the time of execution, nonstreaming query operators read all the source data, put it into a data structure, perform the operation, and yield the resulting elements». К ним относятся <code>OrderBy/OrderByDescending, GroupBy, Reverse, ThenBy</code>. Логика неизбежна: чтобы вернуть <b>максимум</b> (первый после <code>OrderByDescending</code>), нужно увидеть все элементы. Поэтому <code>OrderBy(...).First()</code> — это полный проход источника, а не streaming-«стоп на первом». Разница — в панели: 10 из 10 против 7 из 100.',
      sources: ["ms-intro"],
    },
    {
      id: "s5", num: "05", kicker: "Ловушка · повторное перечисление", title: "Каждый foreach прогоняет запрос заново",
      viewBox: "0 0 340 210", zones: TRAP_ZONES,
      code: ["var q = src.Where(x => Expensive(x));", "var a = q.Count();   // прогон источника #1", "var b = q.ToList();  // прогон источника #2 — Expensive снова!", "// хочешь один прогон → q = ....ToList() один раз"],
      scenes: [
        { codeLine: 1, caption: 'Первое перечисление (<code>Count</code>) — прогон источника <b>#1</b>. <code>Expensive</code> вызван для каждого элемента.', nodes: [{ id: "q", kind: "gate", at: { zone: "trap", row: 0 }, state: "ok", label: "q.Count()", detail: "прогон #1", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Второе перечисление (<code>ToList</code>) — прогон <span class="hl">#2</span>: <code>Expensive</code> вызывается <b>снова</b>. Запрос не кеширует.', nodes: [{ id: "q", kind: "gate", at: { zone: "trap", row: 0 }, state: "ok", label: "q.Count()", detail: "#1" }, { id: "q2", kind: "gate", at: { zone: "trap", row: 1 }, state: "fail", label: "q.ToList()", detail: "прогон #2 — дубль работы", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Лечение: материализуй один раз — <code>var cached = q.ToList()</code> — и дальше работай со списком (immediate «reuse of results»).', nodes: [{ id: "fix", kind: "gate", at: { zone: "trap", row: 0 }, state: "ok", label: "q.ToList() один раз", detail: "кеш результата", accent: true }], edges: [] },
      ],
      explain: 'Обратная сторона deferred — <b>повторное перечисление</b>. Дословно: «If the query variable is enumerated multiple times, the <span class="hl">results might differ every time</span>» — и каждый раз это новый проход источника со всеми побочными эффектами/затратами. «Immediate execution provides <b>reuse of query results</b>, not query declaration. The results are retrieved once, then stored for future use». То есть если запрос дорогой или источник может измениться/иссякнуть (сетевой поток), материализуй один раз через <code>ToList/ToArray</code> и работай с коллекцией. Классический баг: два <code>foreach</code> по одному <code>q</code> дважды бьют в БД. Deferred — мощь и грабли одновременно.',
      sources: ["ms-intro"],
    },
    {
      id: "s6", num: "06", kicker: "Машинная панель · счётчик итераций", title: "Когда РЕАЛЬНО бежит: 0→3, 7 из 100, 10 из 10",
      viewBox: "0 0 340 210", zones: COUNTER_ZONES,
      code: ["// DEFERRED: Select+счётчик, до/после ToList", "before=calls; q.ToList(); after=calls;", "// STREAMING: Where(seen++).First() над Range(1,100)", "// NONSTREAM: OrderByDescending(seen++).First() над Range(1,10)"],
      predictAt: 1, predictQ: 'Select со счётчиком: <code>before = calls</code>, затем <code>q.ToList()</code>, затем <code>after = calls</code> (источник — 3 элемента). Что за числа before/after?',
      console: true,
      scenes: [
        { codeLine: 1, out: "before=0 after=3", caption: '<b>DEFERRED</b>: до <code>ToList</code> счётчик <span class="hl">0</span> — <code>Select</code> не бежал. После — <b>3</b> (по элементу). Объявление не исполняет.', nodes: [{ id: "d", kind: "gate", at: { zone: "c1", row: 0 }, state: "ok", label: "before=0", detail: "after=3", accent: true }], edges: [] },
        { codeLine: 2, out: "first=7 seen=7", caption: '<b>STREAMING</b>: <code>Where.First()</code> над 100 элементами прочитал только <span class="hl">7</span> — остановился на первом кратном 7. 93 элемента не тронуты.', nodes: [{ id: "d", kind: "gate", at: { zone: "c1", row: 0 }, state: "ok", label: "deferred", detail: "0→3" }, { id: "s", kind: "gate", at: { zone: "c2", row: 0 }, state: "ok", label: "seen=7", detail: "из 100", accent: true }], edges: [] },
        { codeLine: 3, out: "first=10 seen=10", caption: '<b>NONSTREAMING</b>: <code>OrderByDescending.First()</code> над 10 элементами прочитал <span class="hl">все 10</span> до первого результата — сортировке нужен весь вход.', nodes: [{ id: "s", kind: "gate", at: { zone: "c2", row: 0 }, state: "ok", label: "stream", detail: "7/100" }, { id: "n", kind: "gate", at: { zone: "c3", row: 0 }, state: "fail", label: "seen=10", detail: "из 10", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель отвечает на вопрос урока — <b>когда и сколько реально читается</b> — живым счётчиком, снятым прогоном. (1) <b>Deferred</b>: <code>Select</code> с инкрементом счётчика до <code>ToList</code> даёт <code>before=0</code>, после — <code>after=3</code>: объявление не исполнило ничего, работа случилась на перечислении. (2) <b>Streaming</b>: <code>Where(seen++).First()</code> над <code>Range(1,100)</code> → <code>first=7 seen=7</code>: прочитано ровно 7 элементов до первого кратного 7, остальные 93 не тронуты. (3) <b>Nonstreaming</b>: <code>OrderByDescending(seen++).First()</code> над <code>Range(1,10)</code> → <code>first=10 seen=10</code>: чтобы отдать максимум, сортировка прочла <span class="hl">весь</span> источник. Три числа — три поведения: отложено, потоково, буферизованно. Это и есть «уровень ниже» LINQ.',
      sources: ["ms-intro"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int calls = 0; var src = new List&lt;int&gt;{1,2,3}; var q = src.Select(x =&gt; { calls++; return x*2; }); Console.Write($"before={calls} "); var list = q.ToList(); Console.Write($"after={calls}");</code> — что напечатает?',
      options: ["before=0 after=3", "before=3 after=3", "before=0 after=0", "before=3 after=6"], correctIndex: 0, xp: 10,
      okText: '<code>Select</code> отложен: на строке объявления счётчик <span class="hl">0</span> (before=0). <code>ToList()</code> перечисляет → лямбда бежит 3 раза (after=3). «performed only when the query variable is enumerated».',
      noText: 'Объявление <code>Select</code> ничего не исполняет → before=0. <code>ToList()</code> прогоняет по 3 элементам → after=3. Реальный вывод: <b>before=0 after=3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=0 after=3" }, sourceRefs: ["ms-intro"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int seen = 0; var src = Enumerable.Range(1, 100); var first = src.Where(x =&gt; { seen++; return x % 7 == 0; }).First(); Console.WriteLine($"first={first} seen={seen}");</code> — что напечатает?',
      options: ["first=7 seen=7", "first=7 seen=100", "first=1 seen=1", "first=7 seen=14"], correctIndex: 0, xp: 10,
      okText: '<code>Where</code> — <b>streaming</b>: <code>First()</code> читает по одному до первого кратного 7. Это 7-й элемент → <b>first=7 seen=7</b>. Остальные 93 не прочитаны.',
      noText: '«Streaming operators don\'t have to read all the source data». Первое кратное 7 — само число 7, на 7-м шаге. Реальный вывод: <b>first=7 seen=7</b> (не 100).',
      verify: { kind: "exec", run: "dotnet run", expect: "first=7 seen=7" }, sourceRefs: ["ms-intro"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int seen = 0; var src = Enumerable.Range(1, 10); var q = src.OrderByDescending(x =&gt; { seen++; return x; }); int firstOut = q.First(); Console.WriteLine($"first={firstOut} seen={seen}");</code> — что напечатает?',
      options: ["first=10 seen=10", "first=10 seen=1", "first=1 seen=10", "first=10 seen=0"], correctIndex: 0, xp: 10,
      okText: '<code>OrderByDescending</code> — <b>nonstreaming</b>: чтобы вернуть максимум, читает ВЕСЬ источник (seen=10), потом отдаёт первый — 10. <b>first=10 seen=10</b>. Даже <code>.First()</code> не спасает от полного прохода.',
      noText: '«Nonstreaming operators must read all the source data before they can yield a result element». Сортировка видит все 10 → seen=10, максимум 10. Реальный вывод: <b>first=10 seen=10</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "first=10 seen=10" }, sourceRefs: ["ms-intro"],
    },
  ],

  takeaways: [
    { icon: "why", k: "deferred = при перечислении", v: '«the operation is performed only when the query variable is enumerated». Возврат <code>IEnumerable&lt;T&gt;</code> → отложено (замер: before=0 after=3). Возврат скаляра (<code>Count/First</code>) → immediate.' },
    { icon: "cost", k: "streaming vs nonstreaming", v: 'Streaming (<code>Where/Select/Take</code>) выдаёт по элементу — <code>Where.First()</code> прочёл <b>7 из 100</b>. Nonstreaming (<code>OrderBy/GroupBy</code>) буферизует весь вход — <code>OrderBy.First()</code> прочёл <b>10 из 10</b>.' },
    { icon: "avoid", k: "не перечисляй дважды", v: 'Каждый <code>foreach</code>/<code>Count</code> — новый прогон источника (побочные эффекты и запросы к БД повторяются). Дорогой запрос → <code>ToList()</code> один раз: «reuse of query results».' },
  ],

  foot: 'урок · <b>отложенное выполнение LINQ</b> · 6 анимир. разборов · панель счётчика итераций (0→3 · 7/100 · 10/10) · дизайн <b>mid</b>',
};
