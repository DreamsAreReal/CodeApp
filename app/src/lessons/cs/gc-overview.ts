/**
 * Lesson: Garbage collection — the automatic memory manager (CS.S7.gc-overview) — expert density,
 * 5 animated deep-dives. The mental model a senior must get right: in the CLR the GC is an
 * AUTOMATIC memory manager — it allocates on the managed heap by bumping a pointer, determines
 * liveness from ROOTS (static fields, thread-stack locals, CPU registers, GC handles, finalize
 * queue), reclaims unreachable objects, and — the myth this lesson kills — its optimizing engine
 * decides WHEN to collect based on allocations; the moment is NOT deterministic and not the user\'s.
 *
 * SIGNATURE machine panel (s5): a REAL allocation measurement via
 * GC.GetAllocatedBytesForCurrentThread() — a byte[1000] costs exactly 1024 bytes (payload + object
 * header, 8-byte aligned), and sustained allocation triggers a gen0 collection with NO GC.Collect()
 * call (ranAutomatically=True). evidence/F12/gc-overview-exec.txt.
 *
 * Accuracy contract (G7) — verified against GC overview + fundamentals (fetch 2026-07-19) +
 * GT-M5-s7.md (GF F1..F6, MM1). NOTE: the fundamentals page carries ai-usage: ai-assisted; the
 * automatic-manager definition is cross-confirmed by the GC overview landing page (ms-gc-ov).
 *   - every English quote is VERBATIM from the sources[] page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F12/gc-overview-exec.txt:
 *     "ranAutomatically=True"; "zeroed=True"; "1024");
 *   - NO GT-M5 myths: MM1 (GC is deterministic / runs at a predictable moment) — no, the optimizing
 *     engine decides based on allocations; the threshold is continuously adjusted.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.gc-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: GC = automatic memory manager.
const Z_GC: Zone = { id: "gc", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "GC · АВТОМАТИЧЕСКИЙ МЕНЕДЖЕР ПАМЯТИ", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "аллокация + освобождение — без ручного кода", subCls: "vz-zsub good", subY: 47 };
const GC_ZONES: Zone[] = [Z_GC];

// s2: roots → reachability graph.
const Z_ROOTS: Zone = { id: "roots", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОРНИ (roots)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "static · стек · регистры · handles", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "managed heap", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "достижимо — живо · нет — мусор", subCls: "vz-zsub good", subY: 47 };
const ROOTS_ZONES: Zone[] = [Z_ROOTS, Z_HEAP];

// s3: allocation is a pointer bump.
const Z_ALLOC: Zone = { id: "alloc", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "АЛЛОКАЦИЯ · сдвиг указателя", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "next-указатель + размер · почти как стек", subCls: "vz-zsub good", subY: 47 };
const ALLOC_ZONES: Zone[] = [Z_ALLOC];

// s4: conditions for a GC (not deterministic).
const Z_WHEN: Zone = { id: "when", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "КОГДА СБОР · решает движок", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "low-memory · порог (подстраивается) · GC.Collect", subCls: "vz-zsub", subY: 47 };
const WHEN_ZONES: Zone[] = [Z_WHEN];

// s5 (SIGNATURE): real allocation measurement.
const Z_MEASURE: Zone = { id: "measure", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "byte[1000]", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "аллоцировано 1024 байта", subCls: "vz-zsub good", subY: 47 };
const Z_AUTO: Zone = { id: "auto", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "сбор сам", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "без GC.Collect() · gen0 растёт", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_MEASURE, Z_AUTO];

export const gcOverview: LessonData = {
  id: "CS.S7.gc-overview",
  track: "CS",
  section: "CS.S7",
  module: "S7.1",
  lang: "csharp",
  title: "Garbage Collector: автоматический менеджер памяти",
  kicker: "C# вглубь · S7 · память ниже абстракции",
  home: { subtitle: "GC = авто-менеджер, roots, аллокация, когда сбор", icon: "gc", estMinutes: 10 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-gc-ov", kind: "doc", org: "Microsoft Learn", title: "Garbage collection (overview)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/", date: "2024-11-01" },
    { id: "ms-gc-fund", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22" },
  ],

  spec: [
    { text: "«In the common language runtime (CLR), the garbage collector (GC) serves as an automatic memory manager. The garbage collector manages the allocation and release of memory for an application.»", source: "ms-gc-fund" },
  ],
  edgeCases: [
    { text: "GC определяет живость по <b>корням</b> (verbatim): «An application\'s roots include <span class=\"hl\">static fields, local variables on a thread\'s stack, CPU registers, GC handles, and the finalize queue</span>». Недостижимое из корней — мусор.", source: "ms-gc-fund" },
    { text: "Две гарантии GC: «Managed objects <span class=\"hl\">automatically get clean content to start with</span>, so their constructors don\'t have to initialize every data field» и «memory safety by making sure that an object can\'t use for itself the memory allocated for another object».", source: "ms-gc-fund" },
    { text: "Аллокация из managed heap дешёвая: «Because the runtime allocates memory for an object by <span class=\"hl\">adding a value to a pointer</span>, it\'s almost as fast as allocating memory from the stack».", source: "ms-gc-fund" },
  ],

  misconceptions: [
    {
      wrong: "GC детерминирован — срабатывает в предсказуемый момент / по расписанию, и это можно контролировать",
      hook: 'Живучий миф: «<span class="wrong">GC срабатывает в предсказуемый момент</span>» (по таймеру/расписанию, и я это контролирую). Нет: «The garbage collector\'s <span class="hl">optimizing engine determines the best time</span> to perform a collection <b>based on the allocations being made</b>»; порог «is <span class="hl">continuously adjusted</span> as the process runs». Момент сбора выбирает движок, не пользователь и не фиксированное расписание. Ниже <b>пять разборов</b>: GC как авто-менеджер, корни и достижимость, аллокация = сдвиг указателя, когда случается сбор, и <b>машинная панель</b> — реальный замер аллокации (byte[1000] = 1024 байта) + сбор без <code>GC.Collect()</code>.',
      source: "ms-gc-fund",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "GC = авто-менеджер", title: "CLR сам управляет аллокацией и освобождением памяти",
      viewBox: "0 0 340 210", zones: GC_ZONES,
      code: ["var data = new byte[1000];   // аллоцирует GC — ручной malloc не нужен", "// ...используем data...", "// data больше недостижим → GC освободит память сам, без free()"],
      scenes: [
        { codeLine: 0, caption: 'В CLR <b>GC — автоматический менеджер памяти</b>: он аллоцирует объект, разработчику не нужен ручной <code>malloc</code>/<code>free</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "gc", row: 0 }, state: "ok", label: "new byte[1000]", detail: "аллоцирует GC", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Когда объект становится <span class="hl">недостижим</span>, GC освобождает его память <b>сам</b> — без ручного освобождения.', nodes: [{ id: "a", kind: "gate", at: { zone: "gc", row: 0 }, state: "ok", label: "data", detail: "жив, пока достижим" }, { id: "f", kind: "gate", at: { zone: "gc", row: 1 }, state: "ok", label: "недостижим", detail: "GC освободит сам", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Итог: «Frees developers from having to manually release memory» — <span class="hl">нет утечек «забыл free»</span> и нет доступа к освобождённой памяти.', nodes: [{ id: "a", kind: "gate", at: { zone: "gc", row: 0 }, state: "ok", label: "авто-менеджер", detail: "alloc + release", accent: true }], edges: [] },
      ],
      explain: 'Ядро S7: дословно «In the common language runtime (CLR), the garbage collector (GC) serves as an <span class="hl">automatic memory manager</span>. The garbage collector manages the <b>allocation and release</b> of memory for an application. Therefore, developers working with managed code don\'t have to write code to perform memory management tasks». Выгоды (verbatim, страница overview/fundamentals): «Frees developers from having to manually release memory»; «Allocates objects on the managed heap efficiently»; «Reclaims objects that are no longer being used, clears their memory». Это устраняет два класса ошибок из C/C++: утечку «забыл освободить» и обращение к уже освобождённой памяти. Как GC решает, что объект больше не нужен — по достижимости из корней (разбор 02).',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s2", num: "02", kicker: "Корни · достижимость", title: "Живость = достижимость из roots; остальное — мусор",
      viewBox: "0 0 340 210", zones: ROOTS_ZONES,
      code: ["// roots: static-поля, локальные на стеке, регистры CPU, GC handles, finalize queue", "object a = new object();   // достижим из локальной переменной (root) → живой", "a = null;                  // больше не достижим из корней → мусор"],
      scenes: [
        { codeLine: 0, caption: 'GC строит граф достижимости от <span class="hl">корней</span>: static-поля, локальные на стеке потока, регистры CPU, GC handles, finalize queue.', nodes: [{ id: "r", kind: "gate", at: { zone: "roots", row: 0 }, state: "ok", label: "roots", detail: "5 видов", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Пока объект <span class="hl">достижим</span> из корня (напр. локальной переменной) — он <b>живой</b>, GC его не тронет.', nodes: [{ id: "r", kind: "gate", at: { zone: "roots", row: 0 }, state: "ok", label: "root → a", detail: "ссылается" }, { id: "o", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "object a", value: "живой", accent: true }], edges: [{ id: "e1", from: "r", to: "o" }] },
        { codeLine: 2, caption: 'Стал <span class="hl">недостижим</span> из всех корней — «considers unreachable objects garbage and releases the memory». Память освободится в следующий сбор.', nodes: [{ id: "r", kind: "gate", at: { zone: "roots", row: 0 }, state: "ok", label: "root = null", detail: "не ссылается" }, { id: "o", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "object", value: "мусор", accent: true }], edges: [] },
      ],
      explain: 'Как GC определяет, что живо (verbatim): «It determines which objects are no longer being used by <span class="hl">examining the application\'s <i>roots</i></span>. An application\'s roots include <b>static fields, local variables on a thread\'s stack, CPU registers, GC handles, and the finalize queue</b>. … The garbage collector uses this list to create a graph that contains all the objects that are reachable from the roots». И далее: «Objects that aren\'t in the graph are unreachable from the application\'s roots. The garbage collector <span class="hl">considers unreachable objects garbage</span> and releases the memory allocated for them». Ключ: живость — это НЕ «есть ли ещё переменная в исходнике», а <b>достижимость из активных корней в рантайме</b>. Обнулил последнюю ссылку → объект стал кандидатом на сбор.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s3", num: "03", kicker: "Аллокация · сдвиг указателя", title: "Выделение на heap — почти как на стеке",
      viewBox: "0 0 340 210", zones: ALLOC_ZONES,
      code: ["// managed heap хранит указатель на «следующий адрес»", "var a = new object();   // объект по next-указателю; next += размер", "var b = new object();   // b лежит сразу за a (contiguous)"],
      scenes: [
        { codeLine: 0, caption: 'managed heap держит <span class="hl">указатель на следующий свободный адрес</span> («next»). Аллокация — это положить объект туда.', nodes: [{ id: "p", kind: "gate", at: { zone: "alloc", row: 0 }, state: "ok", label: "next-указатель", detail: "адрес аллокации", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Выделить объект = положить по next и <b>сдвинуть указатель</b> на размер: «adding a value to a pointer».', nodes: [{ id: "p", kind: "gate", at: { zone: "alloc", row: 0 }, state: "ok", label: "a", detail: "next += размер" }, { id: "n", kind: "gate", at: { zone: "alloc", row: 1 }, state: "ok", label: "next двигается", detail: "почти как стек", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Подряд выделенные объекты лежат <span class="hl">непрерывно</span> (contiguously) → хорошая локальность, быстрый доступ.', nodes: [{ id: "p", kind: "gate", at: { zone: "alloc", row: 0 }, state: "ok", label: "a · b", detail: "рядом" }, { id: "c", kind: "gate", at: { zone: "alloc", row: 1 }, state: "ok", label: "contiguous", detail: "локальность", accent: true }], edges: [] },
      ],
      explain: 'Почему аллокация в .NET дешёвая (verbatim): «When you initialize a new process, the runtime reserves a contiguous region of address space… The <span class="hl">managed heap maintains a pointer to the address where the next object in the heap will be allocated</span>». И про стоимость: «Allocating memory from the managed heap is faster than unmanaged memory allocation. <span class="hl">Because the runtime allocates memory for an object by adding a value to a pointer, it\'s almost as fast as allocating memory from the stack</span>. In addition, because new objects that are allocated consecutively are <b>stored contiguously</b> in the managed heap, an application can access the objects quickly». То есть в норме выделение — это инкремент указателя, а не поиск свободного блока, как в классическом <code>malloc</code>. Реальную цену в байтах измерим в панели (разбор 05).',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s4", num: "04", kicker: "Когда сбор", title: "Момент сбора выбирает движок — не расписание",
      viewBox: "0 0 340 210", zones: WHEN_ZONES,
      code: ["// сбор случается при ОДНОМ из условий:", "// 1) low physical memory (сигнал ОС/хоста)", "// 2) аллокации превысили порог (порог непрерывно подстраивается)", "// 3) вызван GC.Collect() — почти никогда не нужно вручную"],
      scenes: [
        { codeLine: 1, caption: 'Условие 1 — <span class="hl">мало физической памяти</span>: сигнал от ОС (low memory notification) или от хоста.', nodes: [{ id: "m", kind: "gate", at: { zone: "when", row: 0 }, state: "ok", label: "low memory", detail: "сигнал ОС/хоста", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Условие 2 — аллокации <span class="hl">превысили порог</span>; сам порог «is <b>continuously adjusted</b> as the process runs» — не фиксирован.', nodes: [{ id: "m", kind: "gate", at: { zone: "when", row: 0 }, state: "ok", label: "low memory", detail: "1" }, { id: "t", kind: "gate", at: { zone: "when", row: 1 }, state: "ok", label: "порог аллокаций", detail: "подстраивается", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Условие 3 — явный <code>GC.Collect()</code>: «In almost all cases, <span class="hl">you don\'t have to call this method</span>» — движок работает continuously. Момент — за движком.', nodes: [{ id: "t", kind: "gate", at: { zone: "when", row: 0 }, state: "ok", label: "порог", detail: "2" }, { id: "g", kind: "gate", at: { zone: "when", row: 1 }, state: "fail", label: "GC.Collect()", detail: "почти никогда", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «GC детерминирован». Дословно (раздел Conditions for a garbage collection): сбор происходит когда истинно одно из: «The system has <b>low physical memory</b>… The <span class="hl">memory that\'s used by allocated objects on the managed heap surpasses an acceptable threshold. This threshold is continuously adjusted as the process runs</span>… The <code>GC.Collect</code> method is called. In almost all cases, <span class="hl">you don\'t have to call this method because the garbage collector runs continuously</span>». И про выбор момента: «The garbage collector\'s <b>optimizing engine determines the best time</b> to perform a collection based on the allocations being made». Вывод: момент сбора — недетерминированный, его выбирает движок по аллокациям; полагаться на «когда именно» нельзя, и звать <code>GC.Collect()</code> для «ускорения» — почти всегда антипаттерн.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "byte[1000] = 1024 байта; сбор идёт сам",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["long a = GC.GetAllocatedBytesForCurrentThread();", "var o = new byte[1000];  long b = GC.GetAllocatedBytesForCurrentThread();", "// b - a == 1024  (payload 1000 + заголовок объекта, выравнивание 8)"],
      predictAt: 1, predictQ: 'Сколько байтов аллоцирует <code>new byte[1000]</code> по <code>GC.GetAllocatedBytesForCurrentThread()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Снимаем счётчик аллокаций потока <span class="hl">до</span> и <span class="hl">после</span> выделения — <code>GC.GetAllocatedBytesForCurrentThread()</code>.', nodes: [{ id: "m", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "снять a, b", detail: "счётчик потока", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>byte[1000]</code>: payload 1000 байт + заголовок объекта, выровнено на 8 → ровно <b>1024</b> байта на managed heap (реальный замер).', nodes: [{ id: "m", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "b - a", detail: "1024 байта", accent: true }], edges: [] },
        { codeLine: 2, out: "1024", caption: 'Панель: <b>1024</b> байта (замер 3/3). А устойчивая аллокация <span class="hl">сама</span> запускает gen0-сбор — без единого <code>GC.Collect()</code> (ranAutomatically=True).', nodes: [{ id: "m", kind: "gate", at: { zone: "measure", row: 0 }, state: "ok", label: "byte[1000]", detail: "1024" }, { id: "a", kind: "gate", at: { zone: "auto", row: 0 }, state: "ok", label: "сбор сам", detail: "gen0++", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реальная цена аллокации и авто-сбор, снятые в рантайме. Замер через <code>GC.GetAllocatedBytesForCurrentThread()</code>: <code>new byte[1000]</code> прибавляет ровно <b>1024</b> байта (1000 payload + заголовок объекта, выравнивание до кратного 8) — детерминированно 3/3 прогона. Второе измерение подтверждает недетерминизм момента сбора из разбора 04: цикл устойчивых аллокаций (2 млн <code>byte[64]</code>) поднимает <code>GC.CollectionCount(0)</code> <b>без единого</b> вызова <code>GC.Collect()</code> — <code>ranAutomatically=True</code>. Это и есть «авто-менеджер»: ты пишешь <code>new</code>, движок сам решает и когда аллоцировать (сдвиг указателя), и когда собрать (по порогу). Числа заголовка/выравнивания — деталь реализации CoreCLR; важен факт: аллокация имеет измеримую цену, а сбор происходит сам.',
      sources: ["ms-gc-fund"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int before = GC.CollectionCount(0); var sink = new object[16]; for (int i=0;i&lt;2_000_000;i++){ sink[i%16] = new byte[64]; } int after = GC.CollectionCount(0); Console.WriteLine($"ranAutomatically={after&gt;before}");</code> — что напечатает (сбор шёл БЕЗ <code>GC.Collect()</code>)?',
      options: ["ranAutomatically=True", "ranAutomatically=False", "0", "(исключение)"], correctIndex: 0, xp: 10,
      okText: 'Устойчивая аллокация превысила порог — движок <span class="hl">сам</span> запустил gen0-сбор, без единого <code>GC.Collect()</code>. Момент выбирает движок: <b>ranAutomatically=True</b>.',
      noText: '«the garbage collector runs continuously» — сбор идёт сам при превышении порога. Реальный вывод: <b>ranAutomatically=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ranAutomatically=True" }, sourceRefs: ["ms-gc-fund"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = new int[4]; Console.WriteLine($"zeroed={a[0]==0 &amp;&amp; a[1]==0 &amp;&amp; a[2]==0 &amp;&amp; a[3]==0}");</code> — что напечатает?',
      options: ["zeroed=True", "zeroed=False", "(мусор в памяти)", "(исключение)"], correctIndex: 0, xp: 10,
      okText: 'Гарантия GC: «Managed objects <span class="hl">automatically get clean content to start with</span>» — новый массив обнулён. <b>zeroed=True</b>. Конструктору не нужно инициализировать каждое поле.',
      noText: 'GC даёт новым объектам чистое (обнулённое) содержимое. Реальный вывод: <b>zeroed=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "zeroed=True" }, sourceRefs: ["ms-gc-fund"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>long a = GC.GetAllocatedBytesForCurrentThread(); var o = new byte[1000]; GC.KeepAlive(o); long b = GC.GetAllocatedBytesForCurrentThread(); Console.WriteLine(b - a);</code> — сколько байтов?',
      options: ["1024", "1000", "1008", "8"], correctIndex: 0, xp: 10,
      okText: '<code>byte[1000]</code> = payload <b>1000</b> + заголовок объекта, выровнено на 8 → ровно <b>1024</b> байта из managed heap (реальный замер 3/3). Аллокация имеет измеримую цену.',
      noText: 'Payload 1000 + заголовок объекта, выравнивание до кратного 8 = 1024. Реальный вывод: <b>1024</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1024" }, sourceRefs: ["ms-gc-fund"],
    },
  ],

  takeaways: [
    { icon: "why", k: "авто-менеджер", v: 'GC — «automatic memory manager»: сам аллоцирует (сдвиг next-указателя, «almost as fast as… the stack») и сам освобождает недостижимое. Нет ручного <code>free</code> → нет утечек «забыл» и use-after-free.' },
    { icon: "cost", k: "живость = достижимость", v: 'Живо то, что <span class="hl">достижимо из корней</span> (static, локальные на стеке, регистры, GC handles, finalize queue). Обнулил последнюю ссылку → GC «considers unreachable objects garbage», память освободится в сбор.' },
    { icon: "avoid", k: "момент — за движком", v: '«optimizing engine determines the best time… based on the allocations»; порог «continuously adjusted». Сбор недетерминирован (замер: gen0 растёт сам). <code>GC.Collect()</code> «you don\'t have to call» — почти всегда антипаттерн.' },
  ],

  foot: 'урок · <b>GC: авто-менеджер памяти</b> · 5 анимир. разборов · панель реального замера аллокации (1024 байта) · дизайн <b>mid</b>',
};
