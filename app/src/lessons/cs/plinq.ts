/**
 * Lesson: PLINQ — parallel LINQ (CS.S3.plinq) — expert density, 6 animated deep-dives + a
 * machine panel. What a senior must reason about: PLINQ is a parallel implementation of the LINQ
 * pattern; `AsParallel()` is the opt-in that partitions the source into segments run on separate
 * worker threads. It is conservative (falls back to sequential when parallelism is unsafe or
 * unprofitable), order is NOT preserved by default (AsOrdered restores it, at a cost), degree of
 * parallelism is capped by WithDegreeOfParallelism, and ForAll skips the final merge.
 *
 * SIGNATURE machine panel (s6): a REAL PLINQ run (compiled net10.0 Release console app) shows
 * AsParallel actually spreading work across >=2 worker threads (evens=100000 threadsUsed>=2:True),
 * while AsOrdered preserves source order (20,40,...,200).
 *
 * NOTE on exec cards: the run-csharp scripting host references System.Linq (Enumerable) but NOT
 * System.Linq.Parallel, so `AsParallel` cannot run there. The parallel behaviour is proven by the
 * compiled-app measurement above; the exec cards (this file's cards, run-csharp on the app backend
 * :5080) run the SEQUENTIAL form, whose result PLINQ with AsOrdered()/Count()/Sum() is DEFINED to
 * reproduce exactly (result-equivalence is PLINQ's core guarantee) — the measured parallel outputs
 * (A/B/C) match the card outputs 1:1.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from
 *     learn.microsoft.com/.../standard/parallel-programming/introduction-to-plinq (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp (this file's exec cards on the app
 *     backend :5080) and equals the measured PLINQ output ("20,40,...,200"; "100000"; "dopSum=5050").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.plinq/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: PLINQ = LINQ pattern, parallel implementation.
const Z_SEQ: Zone = { id: "seq", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "LINQ · последовательно", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "один поток", subCls: "vz-zsub", subY: 47 };
const Z_PAR: Zone = { id: "par", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "PLINQ · параллельно", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "AsParallel() · много ядер", subCls: "vz-zsub good", subY: 47 };
const INTRO_ZONES: Zone[] = [Z_SEQ, Z_PAR];

// s2: partitioning the source into segments across worker threads.
const Z_PART: Zone = { id: "part", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "ПАРТИЦИОНИРОВАНИЕ · сегменты на потоки", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "источник делится, потоки работают параллельно", subCls: "vz-zsub good", subY: 47 };
const PART_ZONES: Zone[] = [Z_PART];

// s3: conservative execution — falls back to sequential.
const Z_CONS: Zone = { id: "cons", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "PLINQ КОНСЕРВАТИВЕН", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "не выгодно/небезопасно → последовательно", subCls: "vz-zsub", subY: 47 };
const CONS_ZONES: Zone[] = [Z_CONS];

// s4: ordering — default unordered, AsOrdered restores at a cost.
const Z_UNORD: Zone = { id: "unord", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "по умолчанию", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "порядок НЕ гарантирован", subCls: "vz-zsub", subY: 47 };
const Z_ORD: Zone = { id: "ord", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AsOrdered()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "буфер+сортировка · дороже", subCls: "vz-zsub good", subY: 47 };
const ORD_ZONES: Zone[] = [Z_UNORD, Z_ORD];

// s5: ForAll vs foreach (merge step).
const Z_FE: Zone = { id: "fe", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "foreach", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "слияние на 1 поток", subCls: "vz-zsub", subY: 47 };
const Z_FA: Zone = { id: "fa", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ForAll", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "без финального слияния", subCls: "vz-zsub good", subY: 47 };
const FORALL_ZONES: Zone[] = [Z_FE, Z_FA];

// s6 (SIGNATURE): real PLINQ measurement — threads + order.
const Z_THREADS: Zone = { id: "threads", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AsParallel · потоки", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "threadsUsed >= 2", subCls: "vz-zsub good", subY: 47 };
const Z_ORDERED: Zone = { id: "ordered", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AsOrdered · порядок", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "20,40,…,200", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_THREADS, Z_ORDERED];

export const plinq: LessonData = {
  id: "CS.S3.plinq",
  track: "CS",
  section: "CS.S3",
  module: "S3.7",
  lang: "csharp",
  title: "PLINQ: параллельные запросы, порядок, партиционирование",
  kicker: "C# вглубь · S3 · LINQ на всех ядрах",
  home: { subtitle: "AsParallel, партиционирование, консервативность, AsOrdered, ForAll", icon: "collections", estMinutes: 11 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-plinq", kind: "doc", org: "Microsoft Learn", title: "Introduction to PLINQ — .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/introduction-to-plinq", date: "2017-03-30" },
  ],

  spec: [
    { text: "«Parallel LINQ (PLINQ) is a parallel implementation of the Language-Integrated Query (LINQ) pattern. PLINQ implements the full set of LINQ standard query operators as extension methods for the System.Linq namespace and has additional operators for parallel operations.» <span class=\"ru-tr\">«Parallel LINQ (PLINQ) — это параллельная реализация паттерна Language-Integrated Query (LINQ). PLINQ реализует полный набор стандартных операторов запросов LINQ как методы расширения для пространства имён System.Linq и имеет дополнительные операторы для параллельных операций.»</span>", source: "ms-plinq" },
  ],
  edgeCases: [
    { text: "Партиционирование: «PLINQ attempts to make full use of all the processors on the system. It does this by <span class=\"hl\">partitioning the data source into segments</span>, and then executing the query on each segment on <b>separate worker threads</b> in parallel». <span class=\"ru-tr\">«PLINQ пытается в полной мере использовать все процессоры системы. Он делает это, разбивая источник данных на сегменты, а затем выполняя запрос над каждым сегментом на <b>отдельных рабочих потоках</b> параллельно».</span>", source: "ms-plinq" },
    { text: "Консервативен: «By default, PLINQ is conservative… If it is <b>not safe to parallelize</b> a query, PLINQ just runs the query sequentially. If PLINQ has a choice between a potentially expensive parallel algorithm or an inexpensive sequential algorithm, it <span class=\"hl\">chooses the sequential algorithm by default</span>». <span class=\"ru-tr\">«По умолчанию PLINQ консервативен… Если параллелить запрос <b>небезопасно</b>, PLINQ просто выполняет запрос последовательно. Если у PLINQ есть выбор между потенциально дорогим параллельным алгоритмом и недорогим последовательным алгоритмом, он по умолчанию выбирает последовательный алгоритм».</span>", source: "ms-plinq" },
    { text: "Порядок стоит денег: «An <code>AsOrdered</code> sequence is still processed in parallel, but its results are <span class=\"hl\">buffered and sorted</span>… an <code>AsOrdered</code> sequence might be processed <b>more slowly</b> than the default AsUnordered sequence». <span class=\"ru-tr\">«Последовательность <code>AsOrdered</code> по-прежнему обрабатывается параллельно, но её результаты буферизуются и сортируются… последовательность <code>AsOrdered</code> может обрабатываться <b>медленнее</b>, чем стандартная последовательность AsUnordered».</span>", source: "ms-plinq" },
  ],

  misconceptions: [
    {
      wrong: "добавил AsParallel() — и любой LINQ-запрос автоматически стал быстрее",
      hook: 'Наивная надежда: <span class="wrong">«прицепил <code>AsParallel()</code> — запрос ускорился»</span>. Не всегда: «parallelism can introduce its own complexities, and <b>not all query operations run faster in PLINQ. In fact, parallelization actually slows down certain queries</b>». <span class="ru-tr">«параллелизм может привносить собственные сложности, и <b>не все операции запросов выполняются быстрее в PLINQ. На самом деле распараллеливание фактически замедляет некоторые запросы</b>».</span> PLINQ — это параллельная реализация LINQ: «Parallel LINQ (PLINQ) is a <span class="hl">parallel implementation of the Language-Integrated Query (LINQ) pattern</span>». <span class="ru-tr">«Parallel LINQ (PLINQ) — это параллельная реализация паттерна Language-Integrated Query (LINQ)».</span> Он <b>партиционирует</b> источник на потоки, но по умолчанию <b>консервативен</b> и порядок не хранит. Ниже <b>шесть разборов</b> и <b>машинная панель</b> — реальный прогон PLINQ: <code>AsParallel</code> раскидал работу на <span class="hl">≥2 потока</span> (threadsUsed≥2), а <code>AsOrdered</code> сохранил порядок (20,40,…,200).',
      source: "ms-plinq",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "PLINQ = параллельный LINQ", title: "AsParallel() — та же модель запросов на всех ядрах",
      viewBox: "0 0 340 210", zones: INTRO_ZONES,
      code: ["var seq = src.Where(x => f(x)).Select(...);            // 1 поток", "var par = src.AsParallel().Where(x => f(x)).Select(...); // много ядер"],
      scenes: [
        { codeLine: 0, caption: 'Обычный LINQ (LINQ to Objects) исполняет запрос <span class="hl">в одном потоке</span>, элемент за элементом.', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "ok", label: "LINQ", detail: "один поток", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>AsParallel()</code> — <b>точка входа</b> в PLINQ: тот же <code>Where/Select</code>, но привязанный к <span class="hl">ParallelEnumerable</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "ok", label: "LINQ", detail: "один поток" }, { id: "p", kind: "gate", at: { zone: "par", row: 0 }, state: "ok", label: "AsParallel()", detail: "→ ParallelEnumerable", accent: true }], edges: [] },
        { codeLine: 1, caption: 'PLINQ реализует <b>весь набор</b> стандартных операторов + свои (<code>AsOrdered</code>, <code>ForAll</code>, <code>WithDegreeOfParallelism</code>).', nodes: [{ id: "p", kind: "gate", at: { zone: "par", row: 0 }, state: "ok", label: "полный набор LINQ", detail: "+ параллельные операторы", accent: true }], edges: [] },
      ],
      explain: 'PLINQ — параллельная реализация той же модели запросов. Дословно: «<span class="hl">Parallel LINQ (PLINQ) is a parallel implementation of the Language-Integrated Query (LINQ) pattern</span>. PLINQ implements the full set of LINQ standard query operators as extension methods for the <code>System.Linq</code> namespace and has <b>additional operators for parallel operations</b>». <span class="ru-tr">«Parallel LINQ (PLINQ) — это параллельная реализация паттерна Language-Integrated Query (LINQ). PLINQ реализует полный набор стандартных операторов запросов LINQ как методы расширения для пространства имён <code>System.Linq</code> и имеет <b>дополнительные операторы для параллельных операций</b>».</span> Вход — <code>AsParallel()</code>: «The <code>AsParallel</code> extension method <b>binds the subsequent query operators</b>… to the <code>System.Linq.ParallelEnumerable</code> implementations». <span class="ru-tr">«Метод расширения <code>AsParallel</code> <b>привязывает последующие операторы запроса</b>… к реализациям <code>System.Linq.ParallelEnumerable</code>».</span> И как обычный LINQ, «PLINQ queries, just like sequential LINQ queries… have <b>deferred execution</b>, which means they do not begin executing until the query is enumerated». <span class="ru-tr">«Запросы PLINQ, как и последовательные запросы LINQ… имеют <b>отложенное выполнение</b>, что означает, что они не начинают выполняться, пока запрос не будет перечислен».</span> То есть синтаксис прежний, меняется исполнитель — <code>ParallelEnumerable</code>.',
      sources: ["ms-plinq"],
    },
    {
      id: "s2", num: "02", kicker: "Партиционирование", title: "Источник делится на сегменты, потоки работают параллельно",
      viewBox: "0 0 340 210", zones: PART_ZONES,
      code: ["var par = bigSource.AsParallel().Where(x => Heavy(x));", "// PLINQ режет источник на сегменты", "// каждый сегмент считает отдельный worker-поток"],
      scenes: [
        { codeLine: 1, caption: 'PLINQ <span class="hl">партиционирует</span> источник: делит его на сегменты, чтобы раздать разным потокам.', nodes: [{ id: "s", kind: "gate", at: { zone: "part", row: 0 }, state: "ok", label: "источник → сегменты", detail: "partitioning", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Каждый сегмент считает <b>отдельный worker-поток</b> — параллельно на нескольких процессорах.', nodes: [{ id: "s", kind: "gate", at: { zone: "part", row: 0 }, state: "ok", label: "сегменты", detail: "partitioning" }, { id: "t", kind: "gate", at: { zone: "part", row: 1 }, state: "ok", label: "worker-потоки", detail: "по сегменту на поток", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Число партиций <span class="hl">фиксировано</span>, но данные могут переназначаться между ними в рантайме для балансировки нагрузки.', nodes: [{ id: "t", kind: "gate", at: { zone: "part", row: 0 }, state: "ok", label: "фикс. число партиций", detail: "load balancing внутри", accent: true }], edges: [] },
      ],
      explain: 'Как PLINQ достигает параллелизма — дословно: «The primary difference is that <b>PLINQ attempts to make full use of all the processors on the system</b>. It does this by <span class="hl">partitioning the data source into segments, and then executing the query on each segment on separate worker threads in parallel</span> on multiple processors. In many cases, parallel execution means that the query runs significantly faster». <span class="ru-tr">«Главное отличие в том, что <b>PLINQ пытается в полной мере использовать все процессоры системы</b>. Он делает это, разбивая источник данных на сегменты, а затем выполняя запрос над каждым сегментом на отдельных рабочих потоках параллельно на нескольких процессорах. Во многих случаях параллельное выполнение означает, что запрос работает значительно быстрее».</span> По умолчанию «PLINQ uses <b>all of the processors on the host computer</b>». <span class="ru-tr">«PLINQ использует <b>все процессоры хост-компьютера</b>».</span> Про партиции: «PLINQ supports a <b>fixed number of partitions</b> (although data may be dynamically reassigned to those partitions during runtime for load balancing.)». <span class="ru-tr">«PLINQ поддерживает <b>фиксированное число партиций</b> (хотя данные могут динамически переназначаться этим партициям во время выполнения для балансировки нагрузки.)».</span> Машинная панель докажет партиционирование, посчитав реальное число задействованных потоков (≥2).',
      sources: ["ms-plinq"],
    },
    {
      id: "s3", num: "03", kicker: "Консервативность", title: "PLINQ сам откатывается к последовательному, если так дешевле/безопаснее",
      viewBox: "0 0 340 210", zones: CONS_ZONES,
      code: ["src.AsParallel().Select(cheap);   // может пойти ПОСЛЕДОВАТЕЛЬНО", "// PLINQ анализирует запрос:", "//   небезопасно параллелить → sequential", "//   дешевле последовательно → sequential (по умолчанию)"],
      scenes: [
        { codeLine: 1, caption: 'PLINQ <span class="hl">анализирует структуру</span> запроса в рантайме перед тем, как параллелить.', nodes: [{ id: "a", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "анализ запроса", detail: "runtime", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Если параллелить <b>небезопасно</b> — PLINQ просто <span class="hl">выполнит последовательно</span>. Корректность важнее скорости.', nodes: [{ id: "a", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "анализ", detail: "runtime" }, { id: "u", kind: "gate", at: { zone: "cons", row: 1 }, state: "fail", label: "небезопасно", detail: "→ sequential", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Выбор между дорогим параллельным и дешёвым последовательным алгоритмом → по умолчанию <span class="hl">последовательный</span>. Форсировать можно <code>WithExecutionMode</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "дорогой parallel vs дешёвый seq", detail: "по умолчанию seq" }, { id: "f", kind: "gate", at: { zone: "cons", row: 1 }, state: "ok", label: "WithExecutionMode", detail: "форсировать parallel", accent: true }], edges: [] },
      ],
      explain: 'PLINQ осторожен. Дословно: «By default, PLINQ is conservative. At runtime, the PLINQ infrastructure analyzes the overall structure of the query. If the query is likely to yield speedups by parallelization, PLINQ partitions the source sequence into tasks… <span class="hl">If it is not safe to parallelize a query, PLINQ just runs the query sequentially</span>. If PLINQ has a choice between a potentially expensive parallel algorithm or an inexpensive sequential algorithm, it <b>chooses the sequential algorithm by default</b>». <span class="ru-tr">«По умолчанию PLINQ консервативен. Во время выполнения инфраструктура PLINQ анализирует общую структуру запроса. Если запрос, вероятно, даст ускорение за счёт распараллеливания, PLINQ разбивает исходную последовательность на задачи… Если параллелить запрос небезопасно, PLINQ просто выполняет запрос последовательно. Если у PLINQ есть выбор между потенциально дорогим параллельным алгоритмом и недорогим последовательным алгоритмом, он <b>по умолчанию выбирает последовательный алгоритм</b>».</span> Форсировать параллелизм — <code>WithExecutionMode</code>: «instruct PLINQ to select the parallel algorithm. This is useful when you know by <b>testing and measurement</b> that a particular query executes faster in parallel». <span class="ru-tr">«предписать PLINQ выбрать параллельный алгоритм. Это полезно, когда вы знаете по <b>тестированию и измерениям</b>, что конкретный запрос выполняется быстрее параллельно».</span> Отсюда правило: <code>AsParallel()</code> — это разрешение, а не приказ; всегда меряй.',
      sources: ["ms-plinq"],
    },
    {
      id: "s4", num: "04", kicker: "Порядок", title: "По умолчанию порядок не сохраняется; AsOrdered — за плату",
      viewBox: "0 0 340 210", zones: ORD_ZONES,
      code: ["src.AsParallel().Select(f);              // порядок НЕ гарантирован", "src.AsParallel().AsOrdered().Select(f);  // порядок источника сохранён"],
      scenes: [
        { codeLine: 0, caption: 'По умолчанию (<code>AsUnordered</code>) параллельные потоки отдают результаты <span class="hl">как получится</span> — порядок источника не гарантирован.', nodes: [{ id: "u", kind: "gate", at: { zone: "unord", row: 0 }, state: "fail", label: "AsUnordered", detail: "порядок любой", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>AsOrdered()</code> восстанавливает порядок источника: результаты <b>буферизуются и сортируются</b> — но всё ещё считаются параллельно.', nodes: [{ id: "u", kind: "gate", at: { zone: "unord", row: 0 }, state: "fail", label: "AsUnordered", detail: "быстрее" }, { id: "o", kind: "gate", at: { zone: "ord", row: 0 }, state: "ok", label: "AsOrdered", detail: "буфер+сортировка", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Плата за порядок: <code>AsOrdered</code>-последовательность может считаться <span class="hl">медленнее</span> дефолтной. Бери порядок только когда он реально нужен.', nodes: [{ id: "o", kind: "gate", at: { zone: "unord", row: 0 }, state: "ok", label: "AsOrdered", detail: "медленнее" }, { id: "c", kind: "gate", at: { zone: "ord", row: 0 }, state: "ok", label: "стоимость", detail: "extra work", accent: true }], edges: [] },
      ],
      explain: 'Порядок в параллельном мире — не бесплатен. Дословно: «In some queries, a query operator must produce results that preserve the ordering of the source sequence. PLINQ provides the <code>AsOrdered</code> operator for this purpose. <code>AsOrdered</code> is distinct from <code>AsSequential</code>. An <span class="hl">AsOrdered sequence is still processed in parallel, but its results are buffered and sorted</span>. Because order preservation typically involves <b>extra work</b>, an <code>AsOrdered</code> sequence might be processed <b>more slowly</b> than the default <code>AsUnordered</code> sequence». <span class="ru-tr">«В некоторых запросах оператор запроса должен производить результаты, сохраняющие порядок исходной последовательности. Для этой цели PLINQ предоставляет оператор <code>AsOrdered</code>. <code>AsOrdered</code> отличается от <code>AsSequential</code>. Последовательность AsOrdered по-прежнему обрабатывается параллельно, но её результаты буферизуются и сортируются. Поскольку сохранение порядка обычно требует <b>дополнительной работы</b>, последовательность <code>AsOrdered</code> может обрабатываться <b>медленнее</b>, чем стандартная последовательность <code>AsUnordered</code>».</span> Важно: <code>AsOrdered</code> ≠ <code>AsSequential</code> — первое сохраняет параллелизм, второе делает участок однопоточным. Машинная панель покажет, что <code>AsOrdered</code> реально даёт исходный порядок (20,40,…,200).',
      sources: ["ms-plinq"],
    },
    {
      id: "s5", num: "05", kicker: "ForAll vs foreach", title: "ForAll не сливает результаты обратно в один поток",
      viewBox: "0 0 340 210", zones: FORALL_ZONES,
      code: ["foreach (var x in par) { ... }   // слияние результатов на 1 поток", "par.ForAll(x => sink.Add(x));    // обработка параллельно, без слияния"],
      scenes: [
        { codeLine: 0, caption: '<code>foreach</code> по PLINQ-запросу требует <span class="hl">слить</span> результаты всех потоков обратно в поток цикла — сам <code>foreach</code> не параллелен.', nodes: [{ id: "f", kind: "gate", at: { zone: "fe", row: 0 }, state: "ok", label: "foreach", detail: "merge → 1 поток", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>ForAll</code> обрабатывает элементы <b>параллельно</b> и <span class="hl">пропускает финальное слияние</span> — быстрее, если порядок не важен.', nodes: [{ id: "f", kind: "gate", at: { zone: "fe", row: 0 }, state: "ok", label: "foreach", detail: "с merge" }, { id: "a", kind: "gate", at: { zone: "fa", row: 0 }, state: "ok", label: "ForAll", detail: "без merge", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Расплата: приёмник должен быть <span class="hl">потокобезопасным</span> (напр. <code>ConcurrentBag</code>) — несколько потоков пишут одновременно.', nodes: [{ id: "a", kind: "gate", at: { zone: "fe", row: 0 }, state: "ok", label: "ForAll", detail: "параллельно" }, { id: "s", kind: "gate", at: { zone: "fa", row: 0 }, state: "ok", label: "ConcurrentBag", detail: "потокобезопасно", accent: true }], edges: [] },
      ],
      explain: 'Как забирать результаты PLINQ — дословно: «In PLINQ, you can also use <code>foreach</code> to execute the query and iterate through the results. However, <b><code>foreach</code> itself does not run in parallel</b>, and therefore, it requires that the output from all parallel tasks be <span class="hl">merged back into the thread on which the loop is running</span>… For faster query execution when order preservation is not required and when the processing of the results can itself be parallelized, use the <code>ForAll</code> method… <b><code>ForAll</code> does not perform this final merge step</b>». <span class="ru-tr">«В PLINQ вы также можете использовать <code>foreach</code>, чтобы выполнить запрос и пройти по результатам. Однако <b>сам <code>foreach</code> не выполняется параллельно</b>, и поэтому он требует, чтобы вывод от всех параллельных задач был слит обратно в поток, на котором выполняется цикл… Для более быстрого выполнения запроса, когда сохранение порядка не требуется и когда обработку результатов саму по себе можно распараллелить, используйте метод <code>ForAll</code>… <b><code>ForAll</code> не выполняет этот финальный шаг слияния</b>».</span> В примере доки приёмник — <code>ConcurrentBag&lt;T&gt;</code>: «it is optimized for multiple threads adding concurrently». <span class="ru-tr">«он оптимизирован для нескольких потоков, добавляющих одновременно».</span> Правило: нужен порядок или сериальная обработка (<code>Console.WriteLine</code> на элемент) — <code>foreach</code>; нужна максимальная параллельность записи — <code>ForAll</code> + потокобезопасный приёмник.',
      sources: ["ms-plinq"],
    },
    {
      id: "s6", num: "06", kicker: "Машинная панель · реальный PLINQ", title: "AsParallel раскидал на ≥2 потока; AsOrdered сохранил порядок",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// (A) реальный прогон (compiled net10.0):", "Range(1,200000).AsParallel().Where(...считаем потоки...).Count()", "//  → evens=100000 threadsUsed>=2: True", "// (B) Range(1,20).AsParallel().AsOrdered().Where(even).Select(*10)", "//  → 20,40,60,80,100,120,140,160,180,200"],
      predictAt: 3, predictQ: 'PLINQ считает параллельно в разном порядке. Что вернёт <code>AsParallel().AsOrdered().Where(even).Select(x*10)</code> над 1..20?',
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>(A)</b> Считаем, сколько <span class="hl">разных потоков</span> реально трогали элементы внутри <code>Where</code> при <code>AsParallel</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "threads", row: 0 }, state: "ok", label: "AsParallel", detail: "считаем потоки", accent: true }], edges: [] },
        { codeLine: 2, out: "threadsUsed>=2: True", caption: 'Реальный прогон: <span class="hl">threadsUsed ≥ 2 = True</span>, evens=100000. Партиционирование раздало сегменты на несколько worker-потоков.', nodes: [{ id: "t", kind: "gate", at: { zone: "threads", row: 0 }, state: "ok", label: "threadsUsed≥2", detail: "True · параллельно", accent: true }], edges: [] },
        { codeLine: 4, out: "20,40,60,80,100,120,140,160,180,200", caption: '<b>(B)</b> <code>AsOrdered()</code> при параллельном счёте сохранил <span class="hl">исходный порядок</span>: <b>20,40,…,200</b> (реальный прогон). Тот же результат, что у последовательного LINQ.', nodes: [{ id: "t", kind: "gate", at: { zone: "threads", row: 0 }, state: "ok", label: "≥2 потока", detail: "True" }, { id: "o", kind: "gate", at: { zone: "ordered", row: 0 }, state: "ok", label: "AsOrdered", detail: "20,40,…,200", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — <b>реальный</b> прогон PLINQ (скомпилированное net10.0-приложение; <code>AsParallel</code> недоступен в scripting-хосте урока, поэтому замер снят отдельным бинарём). (A) <code>Range(1,200000).AsParallel().Where(…)</code> с подсчётом уникальных <code>ManagedThreadId</code> внутри предиката дал <b>threadsUsed≥2: True</b> и evens=100000 — партиционирование действительно раскидало работу на несколько потоков. (B) <code>Range(1,20).AsParallel().AsOrdered().Where(even).Select(x*10)</code> вернул <b>20,40,60,80,100,120,140,160,180,200</b> — параллельный счёт, но порядок источника восстановлен. (C) <code>WithDegreeOfParallelism(2).Sum(1..100)</code> = 5050 — ограничение числа процессоров не теряет элементы. Три числа — три гарантии PLINQ: параллелит (потоки≥2), умеет сохранять порядок, и результат равен последовательному. Exec-карты урока (run-csharp на бэкенде приложения :5080) гоняют последовательную форму — её вывод PLINQ с <code>AsOrdered/Count/Sum</code> по определению повторяет 1:1.',
      sources: ["ms-plinq"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Enumerable.Range(1, 20).AsParallel().AsOrdered().Where(x =&gt; x % 2 == 0).Select(x =&gt; x * 10)</code> — <code>AsOrdered</code> сохраняет порядок источника. Что напечатает <code>string.Join(",", …)</code>?',
      options: ["20,40,60,80,100,120,140,160,180,200", "200,180,160,140,120,100,80,60,40,20", "2,4,6,8,10,12,14,16,18,20", "10,30,50,70,90,110,130,150,170,190"], correctIndex: 0, xp: 10,
      okText: 'Чётные 1..20 → {2,4,…,20}, <code>*10</code> → {20,40,…,200}. <code>AsOrdered</code> сохраняет порядок источника даже при параллельном счёте — <b>20,40,…,200</b> (совпадает с последовательным LINQ; реальный PLINQ-прогон).',
      noText: '<code>AsOrdered</code> «is still processed in parallel, but its results are buffered and sorted» <span class="ru-tr">«по-прежнему обрабатывается параллельно, но её результаты буферизуются и сортируются»</span> — порядок источника восстановлен. Чётные ×10: <b>20,40,60,80,100,120,140,160,180,200</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "20,40,60,80,100,120,140,160,180,200" }, sourceRefs: ["ms-plinq"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'PLINQ гарантирует тот же РЕЗУЛЬТАТ, что и последовательный LINQ. Сколько чётных чисел в <code>Enumerable.Range(1, 200000)</code> (<code>Where(x =&gt; x % 2 == 0).Count()</code>)?',
      options: ["100000", "200000", "99999", "100001"], correctIndex: 0, xp: 10,
      okText: 'Ровно половина из 200000 — чётные → <b>100000</b>. <code>AsParallel().Where(even).Count()</code> партиционирует и считает на нескольких потоках, но итог совпадает с последовательным (реальный PLINQ: threadsUsed≥2, evens=100000).',
      noText: 'В 1..200000 чётных ровно половина = <b>100000</b>. Параллельный счёт даёт тот же результат — PLINQ гарантирует result-эквивалентность.',
      verify: { kind: "exec", run: "dotnet run", expect: "100000" }, sourceRefs: ["ms-plinq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>WithDegreeOfParallelism(2)</code> ограничивает число процессоров, но не теряет элементы. Чему равна сумма <code>Enumerable.Range(1, 100).Sum()</code> (печать <code>$"dopSum={r}"</code>)?',
      options: ["dopSum=5050", "dopSum=100", "dopSum=5000", "dopSum=10100"], correctIndex: 0, xp: 10,
      okText: 'Сумма 1..100 = 100·101/2 = <b>5050</b>. <code>WithDegreeOfParallelism(2).Sum()</code> считает на ≤2 процессорах, но обрабатывает ВСЕ элементы → тот же <b>5050</b> (реальный PLINQ-прогон).',
      noText: 'Ограничение параллелизма не выбрасывает элементы: сумма 1..100 = <b>5050</b>. Параллельная агрегация даёт тот же результат, что последовательная.',
      verify: { kind: "exec", run: "dotnet run", expect: "dopSum=5050" }, sourceRefs: ["ms-plinq"],
    },
  ],

  takeaways: [
    { icon: "why", k: "PLINQ = параллельный LINQ", v: '«a parallel implementation of the Language-Integrated Query (LINQ) pattern» <span class="ru-tr">«параллельная реализация паттерна Language-Integrated Query (LINQ)»</span>. <code>AsParallel()</code> партиционирует источник «into segments… on separate worker threads» <span class="ru-tr">«на сегменты… на отдельных рабочих потоках»</span> (замер: threadsUsed≥2). Deferred, как обычный LINQ.' },
    { icon: "cost", k: "порядок и консервативность", v: 'По умолчанию порядок НЕ сохранён; <code>AsOrdered</code> «buffered and sorted» <span class="ru-tr">«буферизуются и сортируются»</span> — медленнее (замер: 20,40,…,200). PLINQ «conservative» <span class="ru-tr">«консервативен»</span>: небезопасно/невыгодно → sequential. «not all query operations run faster». <span class="ru-tr">«не все операции запросов выполняются быстрее».</span>' },
    { icon: "avoid", k: "меряй, не гадай", v: 'Result-эквивалентность гарантирована (замер: count=100000, sum=5050 == sequential). Но ускорение — нет: «parallelization actually slows down certain queries». <span class="ru-tr">«распараллеливание фактически замедляет некоторые запросы».</span> <code>ForAll</code> без merge, но приёмник — <code>ConcurrentBag</code>.' },
  ],

  foot: 'урок · <b>PLINQ</b> · 6 анимир. разборов · панель реального PLINQ-прогона (потоки≥2 · AsOrdered) · дизайн <b>mid</b>',
};
