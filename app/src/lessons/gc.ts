/**
 * Lesson: GC и управление памятью (T1.M4.gc) — expert density, 6 animated
 * deep-dives. Every claim carries a source id; all English quotes are verbatim
 * from learn.microsoft.com (Fundamentals of garbage collection / Large object
 * heap / Using objects that implement IDisposable), retrieved 2026-07-09.
 * Reuses the shared memory-model primitives (heap zones + obj/ref/gate).
 *
 * Loop: card `c1` maps to backend review item `T1.M4.gc/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// One managed heap, split into the three generations across the width.
// Auto-layout v2: zones carry an `id`; nodes declare only `at:{zone,row,col}` and the
// engine computes every x/y/w/h — no crooked frame is authorable.
const Z_HEAP_GENS: Zone[] = [
  { id: "gen0", x: 14, y: 34, w: 100, h: 168, cls: "vz-zone heap", label: "GEN 0", labelCls: "vz-zlabel heap sm", lx: 64, ly: 24, sub: "youngest · часто", subCls: "vz-zsub heap", subY: 47 },
  { id: "gen1", x: 120, y: 34, w: 100, h: 168, cls: "vz-zone", label: "GEN 1", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "буфер", subCls: "vz-zsub", subY: 47 },
  { id: "gen2", x: 226, y: 34, w: 100, h: 168, cls: "vz-zone good", label: "GEN 2", labelCls: "vz-zlabel good sm", lx: 276, ly: 24, sub: "long-lived · редко", subCls: "vz-zsub good", subY: 47 },
];

// s3 (gen-0 collection trigger): the collect gate carries a wide detail
// ("→ collect gen 0") that cannot fit a 100u generation column, so the three
// generations sit on top (shorter) and a full-width gate band spans below them.
const Z_GC_GENS_TOP: Zone[] = [
  { id: "gen0", x: 14, y: 34, w: 100, h: 124, cls: "vz-zone heap", label: "GEN 0", labelCls: "vz-zlabel heap sm", lx: 64, ly: 24, sub: "youngest", subCls: "vz-zsub heap", subY: 47 },
  { id: "gen1", x: 120, y: 34, w: 100, h: 124, cls: "vz-zone", label: "GEN 1", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "буфер", subCls: "vz-zsub", subY: 47 },
  { id: "gen2", x: 226, y: 34, w: 100, h: 124, cls: "vz-zone good", label: "GEN 2", labelCls: "vz-zlabel good sm", lx: 276, ly: 24, sub: "редко", subCls: "vz-zsub good", subY: 47 },
];
const Z_GC_TRIGGER: Zone = { id: "trigger", x: 14, y: 166, w: 312, h: 80, cls: "vz-zone heap", label: "ТРИГГЕР СБОРКИ", labelCls: "vz-zlabel heap sm", lx: 170, ly: 161 };
const GC_TRIGGER_ZONES: Zone[] = [...Z_GC_GENS_TOP, Z_GC_TRIGGER];

export const gc: LessonData = {
  id: "T1.M4.gc",
  track: "T1",
  section: "T1",
  module: "M1.4",
  title: "GC и память",
  kicker: "Ядро C# · управляемая куча · нюанс",
  home: { subtitle: "Поколения, mark-sweep-compact, LOH и IDisposable", icon: "gc", estMinutes: 11 },
  prereqs: ["T1.M3.boxing"],
  depth: 4,
  version: "1",
  status: "self-pass",

  // COMPOSITE-QUOTES (frozen — do NOT extend, see types.ts):
  //   spec[0] (ms-gc) · spec ms-loh · scene captions (heap/gen0/relocate) · explains
  //   (alloc, generations, roots/promote, mark/relocate/compact, LOH+using) · takeaway "why".
  //   Each stitches non-adjacent source sentences via «…».
  sources: [
    { id: "ms-gc", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22", archived: "https://web.archive.org/web/20251030225000/https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals" },
    { id: "ms-loh", kind: "doc", org: "Microsoft Learn", title: "The large object heap (LOH)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap", date: "2021-11-11", archived: "https://web.archive.org/web/20220922232211/https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap" },
    { id: "ms-idisposable", kind: "doc", org: "Microsoft Learn", title: "Using objects that implement IDisposable", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/using-objects", date: "2021-05-18", archived: "https://web.archive.org/web/20220922232204/https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/using-objects" },
  ],

  spec: [
    { text: "«The garbage collector stores new objects in generation 0… Objects… that survive collections are promoted and stored in generations 1 and 2.»", source: "ms-gc" },
  ],
  edgeCases: [
    { text: "Объект ≥ <code>85 000</code> байт идёт на <b>LOH</b> и собирается только в gen 2: «if they are large objects, they go on the large object heap (LOH), which is sometimes referred to as <i>generation 3</i>… logically collected as part of generation 2».", source: "ms-loh" },
    { text: "GC <b>не</b> вызывает <code>Dispose</code>: «The GC does <i>not</i> dispose your objects, as it has no knowledge of <code>IDisposable.Dispose()</code>». Освобождение unmanaged-ресурсов — на тебе (<code>using</code> / <code>try-finally</code>).", source: "ms-idisposable" },
  ],

  misconceptions: [
    {
      wrong: "GC — это один проход, который «чистит всю кучу» и заодно зовёт мои Dispose",
      hook: 'Расхожая картинка: GC периодически «останавливает мир», проходит <span class="wrong">всю кучу</span> и попутно освобождает ресурсы. На деле куча разбита на <b>поколения</b> (гипотеза о времени жизни), собирается чаще всего <span class="wrong">только gen 0</span>, а <code>Dispose</code> сборщик <span class="wrong">не зовёт вообще</span>. Ниже — <b>шесть разборов</b> с анимацией: аллокация в gen 0, сборка и promotion, mark-sweep-compact, порог LOH <b>85 000</b> байт и почему <code>using</code> — это твоя работа, а не GC.',
      source: "ms-gc",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Куча · где живут объекты", title: "Управляемая куча — одна на процесс",
      viewBox: "0 0 340 214",
      zones: [{ id: "heap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "УПРАВЛЯЕМАЯ КУЧА", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "одна на процесс · все потоки", subCls: "vz-zsub heap", subY: 47 }],
      code: ["var a = new object();", "var b = new byte[16];", "// next-object pointer ↑"],
      scenes: [
        { codeLine: 0, caption: 'Все reference-типы живут на <b>управляемой куче</b>. Куча держит <span class="hl">указатель</span> на адрес следующего объекта.', nodes: [{ id: "a", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "object", value: "", accent: true }, { id: "ptr", kind: "chip", at: { zone: "heap", row: 1, col: 0 }, value: "next→" }], edges: [] },
        { codeLine: 1, caption: 'Следующий объект аллоцируется <span class="hl">сразу за</span> предыдущим — «adding a value to a pointer», почти как стек по скорости.', nodes: [{ id: "a", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "object", value: "" }, { id: "b", kind: "obj", at: { zone: "heap", row: 0, col: 1 }, typeTag: "byte[16]", value: "", accent: true }, { id: "ptr", kind: "chip", at: { zone: "heap", row: 1, col: 1 }, value: "next→" }], edges: [] },
        { codeLine: 2, caption: 'Куча — <span class="hl">общая</span>: «There\'s a managed heap for each managed process. All threads… allocate on the same heap».', nodes: [{ id: "a", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "object", value: "" }, { id: "b", kind: "obj", at: { zone: "heap", row: 0, col: 1 }, typeTag: "byte[16]", value: "" }, { id: "ptr", kind: "chip", at: { zone: "heap", row: 1, col: 1 }, value: "next→", accent: true }], edges: [] },
      ],
      explain: 'GC — «an automatic memory manager». При старте процесса рантайм резервирует непрерывный регион — <b>управляемую кучу</b> — и держит указатель на адрес следующего объекта: «The managed heap maintains a pointer to the address where the next object in the heap will be allocated». Аллокация дёшева, потому что это сдвиг указателя: «allocates memory for an object by adding a value to a pointer… almost as fast as allocating memory from the stack». И куча одна: «There\'s a managed heap for each managed process. All threads in the process allocate memory for objects on the same heap».',
      sources: ["ms-gc"],
    },
    {
      id: "s2", num: "02", kicker: "Поколения · гипотеза о времени жизни", title: "Почему куча делится на 0/1/2",
      viewBox: "0 0 340 214", zones: Z_HEAP_GENS,
      code: ["// managed heap = gen 0 | gen 1 | gen 2", "var tmp = new object();  // → gen 0"],
      scenes: [
        { codeLine: 0, caption: 'Куча делится на <b>три поколения</b>. Идея: «Newer objects have shorter lifetimes, and older objects have longer lifetimes».', nodes: [{ id: "g0", kind: "chip", at: { zone: "gen0", row: 0 }, value: "0" }, { id: "g1", kind: "chip", at: { zone: "gen1", row: 0 }, value: "1" }, { id: "g2", kind: "chip", at: { zone: "gen2", row: 0 }, value: "2" }], edges: [] },
        { codeLine: 1, caption: 'Новый объект попадает в <span class="hl">gen 0</span> — «the garbage collector stores new objects in generation 0». Gen 0 — самое молодое и короткоживущее.', nodes: [{ id: "o", kind: "obj", at: { zone: "gen0", row: 0 }, typeTag: "object", value: "new", accent: true }, { id: "g1", kind: "chip", at: { zone: "gen1", row: 0 }, value: "gen 1" }, { id: "g2", kind: "chip", at: { zone: "gen2", row: 0 }, value: "gen 2" }], edges: [] },
      ],
      explain: 'Поколения — не произвольное деление, а ставка на статистику времени жизни. GC-алгоритм опирается на три соображения: «It\'s faster to compact… a portion of the managed heap than… the entire managed heap», «Newer objects have shorter lifetimes, and older objects have longer lifetimes», «Newer objects tend to be related… and accessed… around the same time». Отсюда: «the managed heap is divided into three generations, 0, 1, and 2, so it can handle long-lived and short-lived objects separately». Gen 0 — «the youngest and contains short-lived objects… Garbage collection occurs most frequently in this generation».',
      sources: ["ms-gc"],
    },
    {
      id: "s3", num: "03", kicker: "Триггер · gen 0 заполнилась", title: "Что запускает gen 0-сборку",
      viewBox: "0 0 340 250", zones: GC_TRIGGER_ZONES,
      code: ["for (int k = 0; k < N; k++)", "    _ = new object();  // fills gen 0"],
      scenes: [
        { codeLine: 1, caption: 'Аллокации <b>копятся</b> в gen 0. Большинство объектов тут и умирает — «Most objects are reclaimed… in generation 0».', nodes: [{ id: "a", kind: "obj", at: { zone: "gen0", row: 0 }, typeTag: "obj", value: "" }, { id: "b", kind: "obj", at: { zone: "gen0", row: 1 }, typeTag: "obj", value: "", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Gen 0 <span class="hl">заполнилась</span> → «If an application attempts to create a new object when generation 0 is full, the garbage collector performs a collection».', nodes: [{ id: "gate", kind: "gate", at: { zone: "trigger", row: 0 }, state: "ok", label: "gen 0 полна", detail: "→ collect gen 0" }], edges: [] },
        { codeLine: 1, caption: 'Сборщик смотрит <span class="hl">только gen 0</span>, не всю кучу: «starts by examining the objects in generation 0 rather than all objects in the managed heap».', nodes: [{ id: "gate", kind: "gate", at: { zone: "trigger", row: 0 }, state: "ok", label: "GC · gen 0", detail: "не вся куча" }, { id: "reclaim", kind: "chip", at: { zone: "gen0", row: 0 }, value: "собран", accent: true }, { id: "g2", kind: "chip", at: { zone: "gen2", row: 0 }, value: "нетронут" }], edges: [] },
      ],
      explain: 'Самая частая сборка — реакция на заполнение gen 0: «If an application attempts to create a new object when generation 0 is full, the garbage collector performs a collection to free address space for the object». Дешевизна в том, что смотрится только молодое поколение: «The garbage collector starts by examining the objects in generation 0 rather than all objects in the managed heap. A collection of generation 0 alone often reclaims enough memory». Другие условия сборки — низкая физпамять и явный <code>GC.Collect</code>, но в норме её звать не надо.',
      sources: ["ms-gc"],
    },
    {
      id: "s4", num: "04", kicker: "Survival · promotion", title: "Выжившие продвигаются в старшее поколение",
      viewBox: "0 0 340 214", zones: Z_HEAP_GENS,
      code: ["var keep = new object();  // рутовый → выживет", "// gen 0 collection…"],
      predictAt: 1, predictQ: 'Объект жив (на него есть ссылка) и переживает сборку gen 0. В каком поколении он окажется после неё?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Живой объект <code>keep</code> в <b>gen 0</b>: на него ссылается root, значит он <span class="hl">достижим</span> и не мусор.', nodes: [{ id: "keep", kind: "obj", at: { zone: "gen0", row: 0 }, typeTag: "object", value: "keep", accent: true }, { id: "root", kind: "ref", at: { zone: "gen0", row: 1 }, name: "root" }], edges: [{ id: "r", from: "root", to: "keep" }] },
        { codeLine: 1, out: "gen 1", caption: 'Сборка gen 0: выжившие <span class="hl">продвигаются в gen 1</span> — «Objects that survive a generation 0 garbage collection are promoted to generation 1».', nodes: [{ id: "keep", kind: "obj", at: { zone: "gen1", row: 0 }, typeTag: "object", value: "keep", accent: true }, { id: "root", kind: "ref", at: { zone: "gen1", row: 1 }, name: "root" }], edges: [{ id: "r", from: "root", to: "keep", accent: true }] },
      ],
      explain: 'GC решает, что живо, обходя <b>корни</b>: «An application\'s roots include static fields, local variables on a thread\'s stack, CPU registers, GC handles». Недостижимое — мусор: «The garbage collector considers unreachable objects garbage and releases the memory». Выжившие не остаются в gen 0, а <span class="hl">продвигаются</span>: «Objects that survive a generation 0 garbage collection are promoted to generation 1… survive a generation 1… promoted to generation 2… survive a generation 2… remain in generation 2». Это и подтверждает реальный прогон: объект показывает gen 0, после <code>GC.Collect()</code> — <b>gen 1</b>.',
      sources: ["ms-gc"],
    },
    {
      id: "s5", num: "05", kicker: "Фазы · mark → relocate → compact", title: "Пометить, переставить, уплотнить",
      viewBox: "0 0 340 210",
      zones: [{ id: "heap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "GC-КУЧА · СБОРКА", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "mark · relocate · compact", subCls: "vz-zsub heap", subY: 47 }],
      code: ["// live: A, C   dead: B, D"],
      scenes: [
        { codeLine: 0, caption: '<b>Mark</b>: сборщик строит список <span class="hl">живых</span> объектов из корней; A и C достижимы, B и D — нет.', nodes: [{ id: "A", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "A", value: "✓", accent: true }, { id: "B", kind: "obj", at: { zone: "heap", row: 0, col: 1 }, typeTag: "B", value: "×", good: false }, { id: "C", kind: "obj", at: { zone: "heap", row: 0, col: 2 }, typeTag: "C", value: "✓", accent: true }, { id: "D", kind: "obj", at: { zone: "heap", row: 0, col: 3 }, typeTag: "D", value: "×" }], edges: [] },
        { codeLine: 0, caption: '<b>Compact</b>: живые A и C <span class="hl">сдвигаются вместе</span>, мёртвое место освобождается — «uses a memory-copying function to compact the reachable objects».', nodes: [{ id: "A", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "A", value: "✓" }, { id: "C", kind: "obj", at: { zone: "heap", row: 0, col: 1 }, typeTag: "C", value: "✓", accent: true }, { id: "free", kind: "chip", at: { zone: "heap", row: 1, col: 1 }, value: "свободно" }], edges: [] },
        { codeLine: 0, caption: '<b>Relocate</b>: корни <span class="hl">перенастраиваются</span> на новые адреса — «makes the necessary pointer corrections so that the… roots point to the objects in their new locations».', nodes: [{ id: "A", kind: "obj", at: { zone: "heap", row: 0, col: 0 }, typeTag: "A", value: "✓" }, { id: "C", kind: "obj", at: { zone: "heap", row: 0, col: 1 }, typeTag: "C", value: "✓" }, { id: "root", kind: "chip", at: { zone: "heap", row: 1, col: 1 }, value: "root→C", accent: true }], edges: [{ id: "r", from: "root", to: "C", accent: true }] },
      ],
      explain: 'Сборка — не просто «стереть мусор», а три фазы: «A marking phase that finds and creates a list of all live objects. A relocating phase that updates the references to the objects that are compacted. A compacting phase that reclaims the space occupied by the dead objects and compacts the surviving objects». Уплотнение сдвигает выживших к старому концу сегмента и <span class="hl">чинит указатели</span> корней. Но платим только когда есть смысл: «Memory is compacted only if a collection discovers a significant number of unreachable objects. If all the objects… survive… there\'s no need for… compaction».',
      sources: ["ms-gc"],
    },
    {
      id: "s6", num: "06", kicker: "LOH · IDisposable · using", title: "Порог 85 000 байт и что GC НЕ делает",
      viewBox: "0 0 340 250",
      zones: [
        { id: "soh", x: 14, y: 34, w: 150, h: 124, cls: "vz-zone heap", label: "SOH", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "< 85 000 · gen 0-2", subCls: "vz-zsub heap", subY: 47 },
        { id: "loh", x: 176, y: 34, w: 150, h: 124, cls: "vz-zone good", label: "LOH", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "≥ 85 000 · с gen 2", subCls: "vz-zsub good", subY: 47 },
        { id: "dispose", x: 14, y: 166, w: 312, h: 80, cls: "vz-zone", label: "IDISPOSABLE · USING", labelCls: "vz-zlabel sm", lx: 170, ly: 161 },
      ],
      code: ["var s = new byte[1000];    // SOH · gen 0", "var big = new byte[100000]; // LOH", "using var f = File.Open(...); // Dispose"],
      scenes: [
        { codeLine: 0, caption: 'Малый объект (< 85 000 байт) идёт на <b>small object heap</b>, стартует в gen 0.', nodes: [{ id: "s", kind: "obj", at: { zone: "soh", row: 0 }, typeTag: "byte[1000]", value: "gen 0", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Объект <span class="hl">≥ 85 000</span> байт идёт на <b>LOH</b>. Реальный прогон: <code>GC.GetGeneration(big)</code> = <b>2</b> — LOH собирается с gen 2.', nodes: [{ id: "s", kind: "obj", at: { zone: "soh", row: 0 }, typeTag: "byte[1000]", value: "gen 0" }, { id: "big", kind: "obj", at: { zone: "loh", row: 0 }, typeTag: "byte[100000]", value: "gen 2", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>GC ≠ Dispose</b>: сборщик <span class="hl">не</span> зовёт <code>Dispose</code>. Unmanaged-ресурс освобождает <code>using</code> — он гарантирует <code>Dispose</code> даже при исключении.', nodes: [{ id: "res", kind: "chip", at: { zone: "soh", row: 0 }, value: "файл · handle", accent: true }, { id: "gate", kind: "gate", at: { zone: "dispose", row: 0 }, state: "fail", label: "GC не зовёт Dispose", detail: "→ using / try-finally" }], edges: [] },
      ],
      explain: 'Куча — сумма двух: «the large object heap and the small object heap. The large object heap contains objects that are 85,000 bytes and larger». Дословно порог: «If an object is greater than or equal to 85,000 bytes in size, it\'s considered a large object… the runtime allocates it on the large object heap». LOH собирается только в gen 2 и <b>обычно не уплотняется</b>, потому что уплотнение дорого: «But because compaction is expensive, the GC sweeps the LOH; it makes a free list out of dead objects that can be reused later to satisfy large object allocation requests». Отдельно: GC <span class="hl">не</span> управляет твоими ресурсами — «The GC does <i>not</i> dispose your objects». Для unmanaged есть <code>using</code>: «The <code>using</code> statement obtains one or more resources, executes the statements… and automatically disposes of the object» — компилятор эмитит эквивалент <code>try/finally</code> с <code>Dispose</code> в <code>finally</code>.',
      sources: ["ms-gc", "ms-loh", "ms-idisposable"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var o = new object(); Console.Write(GC.GetGeneration(o)); GC.Collect(); Console.Write(GC.GetGeneration(o));</code> — что напечатает?',
      options: ["01", "00", "11", "02"], correctIndex: 0, xp: 10,
      okText: 'Новый объект — в <b>gen 0</b> (печатает <code>0</code>). Он достижим (переменная <code>o</code> — root), поэтому переживает сборку и <span class="hl">продвигается в gen 1</span> — «promoted to generation 1». Итог: <code>01</code>.',
      noText: 'Новый объект стартует в <b>gen 0</b>. Так как он ещё жив, сборка gen 0 его <span class="hl">продвигает в gen 1</span>, а не оставляет и не удаляет. Реальный вывод — <code>01</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "01" }, sourceRefs: ["ms-gc"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Зачем поколения", v: 'Ставка на время жизни: чаще собирать <span class="hl">молодой</span> gen 0 дешевле, чем всю кучу — «faster to compact a portion… than the entire heap».' },
    { icon: "cost", k: "Что происходит", v: 'mark → relocate → <span class="hl">compact</span>; выжившие <b>продвигаются</b> в старшее поколение; объекты <b>≥ 85 000</b> байт — на LOH, собираются с gen 2.' },
    { icon: "avoid", k: "Твоя работа", v: 'GC <span class="hl">не зовёт Dispose</span>: unmanaged-ресурсы освобождай через <code>using</code> / <code>try-finally</code>; не сори временными большими массивами.' },
  ],

  foot: 'урок · <b>GC и память</b> · 6 анимир. разборов · поколения · LOH · формат <b>lesson-as-data</b> · дизайн <b>mid</b>',
};
