/**
 * Lesson: TPL — Parallel.For / Parallel.ForEach and the degree of parallelism (CS.S8.tpl-parallel) —
 * expert density, 5 animated deep-dives. The Task Parallel Library is the recommended way to add data
 * parallelism: Parallel.For / Parallel.ForEach run the same operation over a partitioned source with
 * no manual threads or work items; the TPL partitions the data, schedules on the ThreadPool and
 * dynamically scales concurrency; ParallelOptions.MaxDegreeOfParallelism caps that concurrency (=1 is
 * effectively sequential). It is NOT free: a tiny loop body or few iterations can run slower than a
 * sequential loop because of parallelization overhead.
 *
 * SIGNATURE machine panel (s5): MaxDegreeOfParallelism = 1 forces Parallel.For onto a single thread —
 * REAL measurement of a real Parallel.For run (this file's exec cards): distinctThreads=1.
 *
 * PROVENANCE NOTE: the Roslyn CSharpScript sandbox at /api/authoring/run-csharp does NOT reference the
 * System.Threading.Tasks.Parallel assembly for direct top-level compilation, so the exec numbers were
 * produced by REALLY invoking Parallel.For / Parallel.ForEach via reflection on that same backend (the
 * type executes identically to a compiled `dotnet` project). The verify.expect strings are the real,
 * deterministic stdout of that execution — Interlocked aggregation makes the results reproducible:
 * c1 "sum=5050" · c2 "processed=1000" · c3 "distinctThreads=1".
 *
 * Accuracy contract (G4/G7/G8): every English quote is VERBATIM from the cited MS Learn page
 * (Task Parallel Library (TPL), Data Parallelism (TPL)), fetched 2026-07-21.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.tpl-parallel/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what TPL is — the top of the ladder.
const Z_TPL: Zone = { id: "tpl", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "TPL", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "ты пишешь ЧТО", subCls: "vz-zsub good", subY: 47 };
const Z_RUNTIME: Zone = { id: "runtime", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "TPL прячет КАК", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "партиции · планировщик · пул", subCls: "vz-zsub heap", subY: 47 };
const TPL_ZONES: Zone[] = [Z_TPL, Z_RUNTIME];

// s2: sequential -> parallel loop.
const Z_SEQ: Zone = { id: "seq", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "foreach", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "по одному, один поток", subCls: "vz-zsub", subY: 47 };
const Z_PAR: Zone = { id: "par", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Parallel.ForEach", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "партиции параллельно", subCls: "vz-zsub good", subY: 47 };
const PAR_ZONES: Zone[] = [Z_SEQ, Z_PAR];

// s3: partitioning + dynamic scaling.
const Z_SOURCE: Zone = { id: "source", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ИСТОЧНИК", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "коллекция / диапазон", subCls: "vz-zsub", subY: 47 };
const Z_PARTS: Zone = { id: "parts", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПАРТИЦИИ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "по потокам · ребаланс", subCls: "vz-zsub good", subY: 47 };
const PART_ZONES: Zone[] = [Z_SOURCE, Z_PARTS];

// s4: overhead — when NOT to parallelize.
const Z_SMALL: Zone = { id: "small", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕЛКОЕ ТЕЛО", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "overhead > выигрыш", subCls: "vz-zsub heap", subY: 47 };
const Z_BIG: Zone = { id: "big", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ТЯЖЁЛОЕ ТЕЛО", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "параллель окупается", subCls: "vz-zsub good", subY: 47 };
const OVER_ZONES: Zone[] = [Z_SMALL, Z_BIG];

// s5 (SIGNATURE): MaxDegreeOfParallelism = 1.
const Z_MDOP: Zone = { id: "mdop", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "MaxDegreeOfParallelism · потолок конкурентности", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "=1 → фактически последовательно (1 поток)", subCls: "vz-zsub good", subY: 40 };
const MDOP_ZONES: Zone[] = [Z_MDOP];

export const tplParallel: LessonData = {
  id: "CS.S8.tpl-parallel",
  track: "CS",
  section: "CS.S8",
  module: "S8.8",
  lang: "csharp",
  title: "TPL: Parallel.For/ForEach и degree of parallelism",
  kicker: "C# вглубь · S8 · data parallelism",
  home: { subtitle: "Parallel.For/ForEach, партиции, MaxDegreeOfParallelism, overhead", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.interlocked"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-tpl", kind: "doc", org: "Microsoft Learn", title: "Task Parallel Library (TPL)", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl", date: "2025-10-22" },
    { id: "ms-data", kind: "doc", org: "Microsoft Learn", title: "Data Parallelism (Task Parallel Library)", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/data-parallelism-task-parallel-library", date: "2021-09-15" },
  ],

  spec: [
    { text: "TPL сам масштабирует и прячет низкий уровень: «The TPL dynamically scales the degree of concurrency to use all the available processors most efficiently… the TPL handles the partitioning of the work, the scheduling of threads on the ThreadPool… cancellation support, state management, and other low-level details». <span class=\"ru-tr\">«TPL динамически масштабирует степень параллелизма, чтобы наиболее эффективно задействовать все доступные процессоры… TPL берёт на себя разбиение работы на партиции, планирование потоков в ThreadPool… поддержку отмены, управление состоянием и прочие низкоуровневые детали».</span>", source: "ms-tpl" },
    { text: "Data parallelism = одна операция над элементами: «the same operation is performed concurrently (that is, in parallel) on elements in a source collection or array… the source collection is partitioned so that multiple threads can operate on different segments concurrently». <span class=\"ru-tr\">«одна и та же операция выполняется конкурентно (то есть параллельно) над элементами исходной коллекции или массива… исходная коллекция разбивается на партиции так, что несколько потоков могут работать над разными сегментами одновременно».</span>", source: "ms-data" },
  ],
  edgeCases: [
    { text: "Не всё стоит параллелить: «if a loop performs only a small amount of work on each iteration, or it doesn't run for many iterations, then the overhead of parallelization can cause the code to run more slowly». <span class=\"ru-tr\">«если цикл выполняет лишь небольшой объём работы на каждой итерации или прогоняется по немногим итерациям, то накладные расходы на распараллеливание могут заставить код работать медленнее».</span>", source: "ms-tpl" },
    { text: "Планировщик балансирует сам: «Behind the scenes, the Task Scheduler partitions the task based on system resources and workload. When possible, the scheduler redistributes work among multiple threads and processors if the workload becomes unbalanced». <span class=\"ru-tr\">«За кулисами планировщик задач разбивает задачу на партиции исходя из системных ресурсов и нагрузки. По возможности планировщик перераспределяет работу между несколькими потоками и процессорами, если нагрузка становится несбалансированной».</span>", source: "ms-data" },
    { text: "Overload-ы дают контроль: перегрузки «let you stop or break loop execution, monitor the state of the loop… maintain thread-local state… control the degree of concurrency» <span class=\"ru-tr\">«позволяют остановить или прервать выполнение цикла, отслеживать состояние цикла… поддерживать состояние, локальное для потока… управлять степенью параллелизма»</span> через ParallelLoopState, ParallelOptions, ParallelLoopResult.", source: "ms-data" },
  ],

  misconceptions: [
    {
      wrong: "Parallel.For — это «просто быстрее foreach», всегда и без трейдофов",
      hook: 'Нет: <code>Parallel.For</code>/<code>ForEach</code> — это <b>data parallelism</b> с реальной ценой. Что он делает: «<span class="hl">the same operation is performed concurrently… on elements in a source collection</span>… the source collection is partitioned so that multiple threads can operate on different segments concurrently». <span class="ru-tr">«одна и та же операция выполняется конкурентно… над элементами исходной коллекции… исходная коллекция разбивается на партиции так, что несколько потоков могут работать над разными сегментами одновременно».</span> И он прячет всю кухню: «<span class="hl">the TPL handles the partitioning of the work, the scheduling of threads on the ThreadPool</span>… and other low-level details». <span class="ru-tr">«TPL берёт на себя разбиение работы на партиции, планирование потоков в <code>ThreadPool</code>… и прочие низкоуровневые детали».</span>, плюс «<span class="hl">dynamically scales the degree of concurrency</span>». <span class="ru-tr">«динамически масштабирует степень параллелизма».</span> Но выигрыш не гарантирован: «if a loop performs only a <span class="hl">small amount of work</span> on each iteration, or it doesn\'t run for many iterations, then the <span class="hl">overhead of parallelization can cause the code to run more slowly</span>». <span class="ru-tr">«если цикл выполняет лишь небольшой объём работы на каждой итерации или прогоняется по немногим итерациям, то накладные расходы на распараллеливание могут заставить код работать медленнее».</span> А степень параллелизма можно ограничить (<code>MaxDegreeOfParallelism</code>). Дальше <b>пять разборов</b>: что такое TPL, seq→parallel-цикл, партиционирование и ребаланс, overhead (когда НЕ параллелить), и <b>машинная панель</b> — <code>MaxDegreeOfParallelism=1</code> = один поток реальным прогоном.',
      source: ["ms-tpl", "ms-data"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что такое TPL", title: "Пишешь ЧТО распараллелить; TPL решает КАК",
      viewBox: "0 0 340 210", zones: TPL_ZONES,
      code: ["// TPL = System.Threading.Tasks", "Parallel.ForEach(items, Process);  // ты описываешь операцию", "// партиции, потоки, планировщик — на TPL"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Ты пишешь <b>операцию</b> над элементами — <code>Parallel.ForEach(items, Process)</code>. Ни потоков, ни work items вручную.', nodes: [{ id: "t", kind: "gate", at: { zone: "tpl", row: 0 }, state: "ok", label: "Parallel.ForEach", detail: "что делать", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'TPL берёт на себя всё низкоуровневое: «<span class="hl">the partitioning of the work, the scheduling of threads on the <code>ThreadPool</code></span>… and other low-level details». <span class="ru-tr">«разбиение работы на партиции, планирование потоков в <code>ThreadPool</code>… и прочие низкоуровневые детали».</span>', nodes: [{ id: "t", kind: "gate", at: { zone: "tpl", row: 0 }, state: "ok", label: "Parallel.ForEach", detail: "что" }, { id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "ok", label: "TPL runtime", detail: "партиции · планировщик · пул", accent: true }], edges: [{ id: "e1", from: "t", to: "r", accent: true }] },
        { codeLine: 0, out: "", caption: 'И масштабирует сам: «<span class="hl">dynamically scales the degree of concurrency to use all the available processors most efficiently</span>». <span class="ru-tr">«динамически масштабирует степень параллелизма, чтобы наиболее эффективно задействовать все доступные процессоры».</span>', nodes: [{ id: "t", kind: "gate", at: { zone: "tpl", row: 0 }, state: "ok", label: "твой код", detail: "операция" }, { id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "ok", label: "auto-scale", detail: "по числу ядер", accent: true }], edges: [] },
      ],
      explain: 'TPL — рекомендованный высокий уровень многопоточности: «The Task Parallel Library (TPL) is a set of public types and APIs in the <code>System.Threading</code> and <code>System.Threading.Tasks</code> namespaces». <span class="ru-tr">«Task Parallel Library (TPL) — это набор публичных типов и API в пространствах имён <code>System.Threading</code> и <code>System.Threading.Tasks</code>».</span> Ценность — в сокрытии: «<span class="hl">The TPL dynamically scales the degree of concurrency to use all the available processors most efficiently. In addition, the TPL handles the partitioning of the work, the scheduling of threads on the ThreadPool</span>… <span class="hl">cancellation support, state management, and other low-level details</span>». <span class="ru-tr">«TPL динамически масштабирует степень параллелизма, чтобы наиболее эффективно задействовать все доступные процессоры. Кроме того, TPL берёт на себя разбиение работы на партиции, планирование потоков в ThreadPool… поддержку отмены, управление состоянием и прочие низкоуровневые детали».</span> Это «data parallelism» <span class="ru-tr">«параллелизм данных»</span>: «Data parallelism refers to scenarios in which <span class="hl">the same operation is performed concurrently (that is, in parallel) on elements in a source collection or array</span>». <span class="ru-tr">«Параллелизм данных относится к сценариям, в которых одна и та же операция выполняется конкурентно (то есть параллельно) над элементами исходной коллекции или массива».</span> Реализация — «the <code>System.Threading.Tasks.Parallel</code> class. This class provides method-based parallel implementations of <code>for</code> and <code>foreach</code> loops». <span class="ru-tr">«класс <code>System.Threading.Tasks.Parallel</code>. Этот класс предоставляет основанные на методах параллельные реализации циклов <code>for</code> и <code>foreach</code>».</span>',
      sources: ["ms-tpl", "ms-data"],
    },
    {
      id: "s2", num: "02", kicker: "seq → parallel", title: "foreach → Parallel.ForEach: та же логика, без потоков",
      viewBox: "0 0 340 210", zones: PAR_ZONES,
      code: ["foreach (var item in source) Process(item);          // последовательно", "Parallel.ForEach(source, item => Process(item));      // параллельно", "// «You write the loop logic… much as you would write a sequential loop»"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Обычный <code>foreach</code> — по одному элементу, на одном потоке.', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "ok", label: "foreach", detail: "1 поток, по очереди", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Parallel.ForEach</code> — та же логика тела, но по партициям параллельно: «You write the loop logic… <span class="hl">much as you would write a sequential loop</span>». <span class="ru-tr">«Ты пишешь логику цикла… почти так же, как писал бы последовательный цикл».</span>', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "ok", label: "foreach", detail: "по очереди" }, { id: "p", kind: "gate", at: { zone: "par", row: 0 }, state: "ok", label: "Parallel.ForEach", detail: "параллельно", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Ключевое: «<span class="hl">You do not have to create threads or queue work items. In basic loops, you do not have to take locks. The TPL handles all the low-level work for you</span>». <span class="ru-tr">«Тебе не нужно создавать потоки или ставить рабочие элементы в очередь. В простых циклах не нужно брать блокировки. TPL берёт на себя всю низкоуровневую работу за тебя».</span>', nodes: [{ id: "p", kind: "gate", at: { zone: "par", row: 0 }, state: "ok", label: "без потоков вручную", detail: "TPL сам", accent: true }], edges: [] },
      ],
      explain: 'Синтаксически параллельный цикл почти неотличим от последовательного: «<span class="hl">You write the loop logic for a <code>Parallel.For</code> or <code>Parallel.ForEach</code> loop much as you would write a sequential loop. You do not have to create threads or queue work items. In basic loops, you do not have to take locks. The TPL handles all the low-level work for you</span>». <span class="ru-tr">«Ты пишешь логику цикла <code>Parallel.For</code> или <code>Parallel.ForEach</code> почти так же, как писал бы последовательный цикл. Тебе не нужно создавать потоки или ставить рабочие элементы в очередь. В простых циклах не нужно брать блокировки. TPL берёт на себя всю низкоуровневую работу за тебя».</span> Но есть важная оговорка про <b>общее состояние</b>: тело выполняется на нескольких потоках одновременно, поэтому любая запись в разделяемую переменную из тела должна быть синхронизирована (Interlocked/lock) — иначе гонка. Для суммирования есть перегрузки с thread-local-состоянием, но простой и надёжный путь — атомарный аккумулятор (<code>Interlocked.Add</code>), как в машинной панели ниже (sum=5050).',
      sources: ["ms-data"],
    },
    {
      id: "s3", num: "03", kicker: "Партиции · ребаланс", title: "TPL режет источник на партиции и балансирует нагрузку",
      viewBox: "0 0 340 210", zones: PART_ZONES,
      code: ["Parallel.For(0, n, i => Work(i));", "// TPL партиционирует [0..n) по потокам", "// при дисбалансе перераспределяет работу"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Источник (диапазон/коллекция) — вход. TPL решит, как его поделить.', nodes: [{ id: "src", kind: "obj", at: { zone: "source", row: 0 }, typeTag: "[0..n)", value: "источник", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Режется на <b>партиции</b>: «<span class="hl">the TPL partitions the data source so that the loop can operate on multiple parts concurrently</span>». <span class="ru-tr">«TPL разбивает источник данных на партиции так, что цикл может работать над несколькими частями одновременно».</span>', nodes: [{ id: "src", kind: "obj", at: { zone: "source", row: 0 }, typeTag: "[0..n)", value: "источник" }, { id: "p", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "partitions", value: "по потокам", accent: true }], edges: [{ id: "e1", from: "src", to: "p", accent: true }] },
        { codeLine: 2, out: "", caption: 'При перекосе — <b>ребаланс</b>: «the scheduler <span class="hl">redistributes work among multiple threads and processors if the workload becomes unbalanced</span>». <span class="ru-tr">«планировщик перераспределяет работу между несколькими потоками и процессорами, если нагрузка становится несбалансированной».</span>', nodes: [{ id: "p", kind: "obj", at: { zone: "parts", row: 0 }, typeTag: "partitions", value: "работают" }, { id: "rb", kind: "gate", at: { zone: "parts", row: 1 }, state: "ok", label: "rebalance", detail: "при дисбалансе", accent: true }], edges: [] },
      ],
      explain: 'Партиционирование — сердце data parallelism: «When a parallel loop runs, the TPL partitions the data source so that the loop can operate on multiple parts concurrently. <span class="hl">Behind the scenes, the Task Scheduler partitions the task based on system resources and workload. When possible, the scheduler redistributes work among multiple threads and processors if the workload becomes unbalanced</span>». <span class="ru-tr">«Когда параллельный цикл выполняется, TPL разбивает источник данных на партиции так, что цикл может работать над несколькими частями одновременно. За кулисами планировщик задач разбивает задачу на партиции исходя из системных ресурсов и нагрузки. По возможности планировщик перераспределяет работу между несколькими потоками и процессорами, если нагрузка становится несбалансированной».</span> То есть число и размер партиций — не фиксированы: планировщик подбирает их под ядра и нагрузку и умеет докидывать работу простаивающим потокам (work-stealing). Можно и переопределить: «You can also supply your own <span class="hl">custom partitioner or scheduler</span>». <span class="ru-tr">«Ты также можешь предоставить собственный кастомный разбивщик на партиции или планировщик».</span> Порядок обработки при этом <b>не</b> гарантирован — параллельный цикл не сохраняет последовательность (в отличие от <code>foreach</code>).',
      sources: ["ms-data"],
    },
    {
      id: "s4", num: "04", kicker: "Overhead · когда НЕ", title: "Мелкое тело или мало итераций — параллель ЗАМЕДЛИТ",
      viewBox: "0 0 340 210", zones: OVER_ZONES,
      code: ["Parallel.For(0, 10, i => arr[i]++);   // ⛔ тело крошечное -> overhead > выигрыш", "Parallel.For(0, 1_000_000, i => HeavyCompute(i));  // ✅ окупается", "// параллелизация — тоже сложность: локи, гонки, дедлоки"],
      predictAt: 2, predictQ: 'Почему <code>Parallel.For(0, 10, i =&gt; arr[i]++)</code> может оказаться <b>медленнее</b> обычного цикла, а тяжёлое тело на миллионе итераций — быстрее?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Крошечное тело / мало итераций: «<span class="hl">the overhead of parallelization can cause the code to run more slowly</span>». <span class="ru-tr">«накладные расходы на распараллеливание могут заставить код работать медленнее».</span>', nodes: [{ id: "s", kind: "gate", at: { zone: "small", row: 0 }, state: "fail", label: "мелкое тело", detail: "overhead > выигрыш", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Тяжёлое тело на многих итерациях — параллель окупается: работа делится по ядрам, накладные расходы малы относительно неё.', nodes: [{ id: "s", kind: "gate", at: { zone: "small", row: 0 }, state: "fail", label: "мелкое", detail: "медленнее" }, { id: "b", kind: "gate", at: { zone: "big", row: 0 }, state: "ok", label: "тяжёлое тело", detail: "окупается", accent: true }], edges: [] },
        { codeLine: 2, out: "параллель ≠ бесплатно", caption: 'И это сложность: «parallelization, like any multithreaded code, <span class="hl">adds complexity</span>… have a basic understanding of… <span class="hl">locks, deadlocks, and race conditions</span>». <span class="ru-tr">«распараллеливание, как и любой многопоточный код, добавляет сложности… иметь базовое понимание… блокировок, взаимных блокировок (deadlock) и состояний гонки».</span>', nodes: [{ id: "b", kind: "gate", at: { zone: "big", row: 0 }, state: "ok", label: "быстрее", detail: "но сложнее" }, { id: "c", kind: "gate", at: { zone: "big", row: 1 }, state: "fail", label: "локи/гонки/дедлоки", detail: "надо понимать", accent: true }], edges: [] },
      ],
      explain: 'Параллелизм — не бесплатный ускоритель. «not all code is suitable for parallelization. For example, <span class="hl">if a loop performs only a small amount of work on each iteration, or it doesn\'t run for many iterations, then the overhead of parallelization can cause the code to run more slowly</span>». <span class="ru-tr">«не всякий код пригоден для распараллеливания. Например, если цикл выполняет лишь небольшой объём работы на каждой итерации или прогоняется по немногим итерациям, то накладные расходы на распараллеливание могут заставить код работать медленнее».</span> И это ответственность разработчика: «parallelization, like any multithreaded code, <span class="hl">adds complexity to your program execution</span>. Although the TPL simplifies multithreaded scenarios, we recommend that you have a basic understanding of threading concepts, for example, <span class="hl">locks, deadlocks, and race conditions</span>, so that you can use the TPL effectively». <span class="ru-tr">«распараллеливание, как и любой многопоточный код, добавляет сложности в выполнение твоей программы. Хотя TPL упрощает многопоточные сценарии, мы рекомендуем иметь базовое понимание концепций многопоточности, например блокировок, взаимных блокировок (deadlock) и состояний гонки, чтобы ты мог эффективно использовать TPL».</span> Практика: параллель окупается на «крупнозернистой» работе (тяжёлое тело × много итераций); на мелочи — накладные расходы на партиционирование, планирование и синхронизацию съедают выигрыш. Мерить, не угадывать.',
      sources: ["ms-tpl"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · MaxDOP", title: "MaxDegreeOfParallelism = 1 → один поток (последовательно)",
      viewBox: "0 0 340 210", zones: MDOP_ZONES,
      code: ["var opts = new ParallelOptions { MaxDegreeOfParallelism = 1 };", "var seen = new HashSet<int>();", "Parallel.For(0, 20, opts, i => { lock(seen) seen.Add(Environment.CurrentManagedThreadId); });", "// seen.Count == ?"],
      predictAt: 3, predictQ: '<code>Parallel.For(0, 20, opts, ...)</code> с <code>MaxDegreeOfParallelism = 1</code> собирает <code>ManagedThreadId</code> в set. Сколько различных потоков (<code>seen.Count</code>)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ParallelOptions.MaxDegreeOfParallelism</code> — потолок конкурентности: одна из перегрузок, что «<span class="hl">control the degree of concurrency</span>». <span class="ru-tr">«управляют степенью параллелизма».</span>', nodes: [{ id: "o", kind: "gate", at: { zone: "mdop", row: 0 }, state: "ok", label: "MaxDegreeOfParallelism = 1", detail: "потолок = 1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'С потолком 1 TPL не запускает партиции параллельно — тело идёт на <span class="hl">одном потоке</span>, фактически последовательно.', nodes: [{ id: "o", kind: "gate", at: { zone: "mdop", row: 0 }, state: "ok", label: "MaxDOP = 1", detail: "нет параллелизма" }, { id: "one", kind: "gate", at: { zone: "mdop", row: 1 }, state: "ok", label: "1 поток", detail: "все 20 итераций", accent: true }], edges: [] },
        { codeLine: 3, out: "distinctThreads=1", caption: 'Панель: <b>distinctThreads=1</b> (реальный прогон Parallel.For) — все 20 итераций на одном <code>ManagedThreadId</code>. MaxDOP=1 = последовательно.', nodes: [{ id: "res", kind: "gate", at: { zone: "mdop", row: 0 }, state: "ok", label: "seen.Count", detail: "1", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — управление степенью параллелизма. <code>ParallelOptions.MaxDegreeOfParallelism</code> задаёт максимум одновременных операций; перегрузки <code>Parallel.For</code>/<code>ForEach</code> с <code>ParallelOptions</code> — среди тех, что «<span class="hl">control the degree of concurrency</span>» <span class="ru-tr">«управляют степенью параллелизма»</span> (рядом с <code>ParallelLoopState</code>, <code>ParallelLoopResult</code>, <code>CancellationToken</code>). Реальный прогон <code>Parallel.For(0, 20, opts, …)</code> с <code>MaxDegreeOfParallelism = 1</code> собрал ровно <b>один</b> различный <code>ManagedThreadId</code> (печать <b>distinctThreads=1</b>) — при потолке 1 параллельный цикл выполняется на одном потоке, то есть последовательно. Это удобный рубильник: отладка гонок (MaxDOP=1 воспроизводит «как бы последовательно»), ограничение нагрузки (не занять все ядра), или тонкая настройка под I/O-bound тело. Без ограничения TPL сам подбирает степень «to use all the available processors most efficiently». <span class="ru-tr">«чтобы наиболее эффективно задействовать все доступные процессоры».</span>',
      sources: ["ms-tpl", "ms-data"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>long sum = 0; Parallel.For(1, 101, i => { Interlocked.Add(ref sum, i); }); Console.WriteLine($"sum={sum}");</code> — что напечатает (сумма 1..100)?',
      options: ["sum=5050", "sum=100", "sum (меньше 5050, непредсказуемо)", "sum=0"], correctIndex: 0, xp: 10,
      okText: '<code>Parallel.For(1, 101, …)</code> проходит <code>i</code> = 1..100; <code>Interlocked.Add</code> атомарен → потерянных обновлений нет. Сумма арифметической прогрессии = <b>5050</b>, детерминированно.',
      noText: 'Верхняя граница <code>Parallel.For</code> исключается (1..100); атомарный аккумулятор даёт точную сумму. Реальный вывод: <b>sum=5050</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "sum=5050" }, sourceRefs: ["ms-data"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var src = Enumerable.Range(1, 1000).ToArray(); int processed = 0; Parallel.ForEach(src, x => { Interlocked.Increment(ref processed); }); Console.WriteLine($"processed={processed}");</code> — что напечатает?',
      options: ["processed=1000", "processed (меньше 1000, непредсказуемо)", "processed=1", "processed=0"], correctIndex: 0, xp: 10,
      okText: '<code>Parallel.ForEach</code> выполняет тело для <span class="hl">каждого</span> элемента ровно один раз (партиции покрывают весь источник); атомарный счётчик → ровно <b>1000</b>.',
      noText: 'Все 1000 элементов обрабатываются по разу, атомарный инкремент не теряет счёт. Реальный вывод: <b>processed=1000</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "processed=1000" }, sourceRefs: ["ms-data"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var opts = new ParallelOptions { MaxDegreeOfParallelism = 1 }; var seen = new HashSet&lt;int&gt;(); Parallel.For(0, 20, opts, i => { lock(seen) seen.Add(Environment.CurrentManagedThreadId); }); Console.WriteLine($"distinctThreads={seen.Count}");</code> — что напечатает?',
      options: ["distinctThreads=1", "distinctThreads=20", "distinctThreads (много, непредсказуемо)", "distinctThreads=0"], correctIndex: 0, xp: 10,
      okText: '<code>MaxDegreeOfParallelism = 1</code> «control the degree of concurrency» <span class="ru-tr">«управляет степенью параллелизма»</span> → потолок 1: все 20 итераций идут на <span class="hl">одном</span> потоке. Различных <code>ManagedThreadId</code> — <b>1</b>.',
      noText: 'Потолок параллелизма 1 делает цикл фактически последовательным — один поток на все итерации. Реальный вывод: <b>distinctThreads=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "distinctThreads=1" }, sourceRefs: ["ms-data"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что это", v: 'TPL data parallelism: «<span class="hl">the same operation is performed concurrently… on elements in a source collection</span>». <span class="ru-tr">«одна и та же операция выполняется конкурентно… над элементами исходной коллекции».</span> <code>Parallel.For/ForEach</code> прячут «the partitioning of the work, the scheduling of threads on the <code>ThreadPool</code>» <span class="ru-tr">«разбиение работы на партиции, планирование потоков в <code>ThreadPool</code>»</span> и «dynamically scales the degree of concurrency». <span class="ru-tr">«динамически масштабирует степень параллелизма».</span>' },
    { icon: "cost", k: "Не бесплатно", v: '«if a loop performs only a <span class="hl">small amount of work</span>… the overhead of parallelization can cause the code to run more slowly». <span class="ru-tr">«если цикл выполняет лишь небольшой объём работы… накладные расходы на распараллеливание могут заставить код работать медленнее».</span> Тело на нескольких потоках → синхронизируй общее состояние (sum=5050 через Interlocked). Порядок не сохраняется.' },
    { icon: "avoid", k: "degree of parallelism", v: '<code>MaxDegreeOfParallelism</code> ограничивает конкурентность; =1 → один поток (distinctThreads=1), фактически последовательно. Перегрузки «control the degree of concurrency» <span class="ru-tr">«управляют степенью параллелизма»</span>, дают <code>ParallelLoopState</code>, отмену, thread-local.' },
  ],

  foot: 'урок · <b>TPL: Parallel.For/ForEach</b> · 5 анимир. разборов · панель MaxDegreeOfParallelism=1 · дизайн <b>mid</b>',
};
