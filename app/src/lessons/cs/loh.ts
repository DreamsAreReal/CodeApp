/**
 * Lesson: Large Object Heap — the 85000-byte threshold, gen2, sweep-not-compact (CS.S7.loh) —
 * expert density, 5 animated deep-dives. An object >= 85,000 bytes is a large object and the runtime
 * allocates it on the LOH (usually arrays). The LOH is sometimes called "generation 3" — physically
 * separate but logically collected as part of generation 2, so a large object is freed only during a
 * gen2 (full) collection. By default the GC does NOT compact the LOH: it SWEEPS it (builds a free
 * list) because copying large objects is expensive. Compaction is opt-in via
 * GCSettings.LargeObjectHeapCompactionMode = CompactOnce (one-time, reverts to Default).
 *
 * SIGNATURE machine panel (s5): REAL LOH measurements — a byte[1000] is gen0 while a byte[100000]
 * (>=85000) is gen2/LOH (small=0 large=2), and a LOH object survives a gen0 collection but is freed
 * only by a gen2 collection (aliveAfterGen0=True aliveAfterGen2=False). evidence/F13/loh-exec.txt.
 *
 * Accuracy contract (G7) — verified against large-object-heap (fetch 2026-07-19) +
 * GCLargeObjectHeapCompactionMode API + GT-M5-s7.md (LF F1..F11, MM9/MM10). Two channels: the
 * threshold/gen and sweep facts on the LOH page; the compaction API on its own page.
 *   - every English quote is VERBATIM from the sources[] page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F13/loh-exec.txt:
 *     "small=0 large=2"; "default=Default afterSet=CompactOnce"; "aliveAfterGen0=True aliveAfterGen2=False");
 *   - NO GT-M5 myths: MM9 (LOH is always compacted like a normal heap) — no, by default the GC sweeps
 *     it (Default = not compacted); MM10 (LOH is an independent gen3 collected on its own) — no,
 *     physically gen3 but logically collected with gen2 (full GC).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.loh/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the 85000 threshold.
const Z_SMALL: Zone = { id: "small", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "< 85 000 байт", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "small object heap (SOH) · gen0", subCls: "vz-zsub good", subY: 47 };
const Z_LARGE: Zone = { id: "large", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "≥ 85 000 байт", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "large object heap (LOH)", subCls: "vz-zsub heap", subY: 47 };
const THRESH_ZONES: Zone[] = [Z_SMALL, Z_LARGE];

// s2: LOH = gen3 physically / gen2 logically.
const Z_GEN3: Zone = { id: "gen3", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "LOH · «generation 3»", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "физически отдельно · логически собирается с gen2", subCls: "vz-zsub heap", subY: 47 };
const GEN3_ZONES: Zone[] = [Z_GEN3];

// s3: not compacted → sweep.
const Z_SWEEP: Zone = { id: "sweep", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕ компактится", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "GC делает sweep", subCls: "vz-zsub heap", subY: 47 };
const Z_FREELIST: Zone = { id: "freelist", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "free list", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "из мёртвых · переиспользуется", subCls: "vz-zsub", subY: 47 };
const SWEEP_ZONES: Zone[] = [Z_SWEEP, Z_FREELIST];

// s4: request compaction.
const Z_MODE: Zone = { id: "mode", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "CompactOnce", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "LargeObjectHeapCompactionMode", subCls: "vz-zsub good", subY: 47 };
const Z_PIN: Zone = { id: "pin", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "не должен двигаться → пинь", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "future .NET может компактить", subCls: "vz-zsub", subY: 47 };
const MODE_ZONES: Zone[] = [Z_MODE, Z_PIN];

// s5 (SIGNATURE): real measurement.
const Z_THR: Zone = { id: "thr", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "порог 85000", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "small=gen0 · large=gen2", subCls: "vz-zsub", subY: 47 };
const Z_ONLY2: Zone = { id: "only2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "freed только gen2", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "пережил gen0 · собран gen2", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_THR, Z_ONLY2];

export const loh: LessonData = {
  id: "CS.S7.loh",
  track: "CS",
  section: "CS.S7",
  module: "S7.5",
  lang: "csharp",
  title: "Large Object Heap: порог 85000, gen2, sweep",
  kicker: "C# вглубь · S7 · большие объекты",
  home: { subtitle: "порог 85000, LOH=gen2, не компактится, CompactOnce", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.generations"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-loh", kind: "doc", org: "Microsoft Learn", title: "Large object heap (LOH) on Windows", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap", date: "2021-11-11" },
    { id: "ms-loh-compact", kind: "doc", org: "Microsoft Learn", title: "GCSettings.LargeObjectHeapCompactionMode", url: "https://learn.microsoft.com/en-us/dotnet/api/system.runtime.gcsettings.largeobjectheapcompactionmode", date: "2024-11-01" },
  ],

  spec: [
    { text: "«If an object is greater than or equal to 85,000 bytes in size, it\'s considered a large object. This number was determined by performance tuning. When an object allocation request is for 85,000 or more bytes, the runtime allocates it on the large object heap.»", source: "ms-loh" },
  ],
  edgeCases: [
    { text: "LOH = «generation 3» логически с gen2 (verbatim): «if they are large objects, they go on the large object heap (LOH), which is <span class=\"hl\">sometimes referred to as generation 3</span>. Generation 3 is a physical generation that\'s <b>logically collected as part of generation 2</b>».", source: "ms-loh" },
    { text: "Собирается только в gen2 (verbatim): «<span class=\"hl\">Large objects belong to generation 2 because they are collected only during a generation 2 collection</span>. … a generation 2 GC is also called a <i>full GC</i>».", source: "ms-loh" },
    { text: "Runtime сам кладёт малые объекты на LOH (verbatim): «Sometimes, the debugger shows that the total size of the LOH is less than 85,000 bytes. <span class=\"hl\">This happens because the runtime itself uses the LOH to allocate some objects that are smaller than a large object</span>».", source: "ms-loh" },
  ],

  misconceptions: [
    {
      wrong: "LOH компактится как обычная куча / LOH — независимое поколение gen3, собирается само",
      hook: 'Два мифа. «<span class="wrong">LOH компактится как обычная куча</span>» — нет: «because compaction is expensive, the GC <span class="hl"><i>sweeps</i> the LOH</span>; it makes a free list out of dead objects». По умолчанию <code>LargeObjectHeapCompactionMode == Default</code> (не компактится). «<span class="wrong">LOH — независимое gen3</span>» — нет: «Generation 3 is a physical generation that\'s <span class="hl">logically collected as part of generation 2</span>» → большой объект освобождается только на gen2/full GC. Ниже <b>пять разборов</b>: порог 85000, LOH как gen3/gen2, sweep вместо compact, запрос компакции + пиннинг, и <b>машинная панель</b> — реальный замер порога и «freed только gen2».',
      source: "ms-loh",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Порог 85000", title: "≥ 85 000 байт → большой объект → LOH",
      viewBox: "0 0 340 210", zones: THRESH_ZONES,
      code: ["var small = new byte[1000];     // < 85000 → SOH, gen0", "var large = new byte[100000];   // ≥ 85000 → LOH", "// порог 85000 подобран перф-тюнингом; конфигурируем"],
      scenes: [
        { codeLine: 0, caption: 'Объект <span class="hl">меньше 85000 байт</span> кладётся на small object heap (SOH) — обычный путь, gen0.', nodes: [{ id: "s", kind: "obj", at: { zone: "small", row: 0 }, typeTag: "byte[1000]", value: "SOH · gen0", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Объект <span class="hl">≥ 85000 байт</span> — «большой»: runtime аллоцирует его на <b>large object heap (LOH)</b> (обычно это массивы).', nodes: [{ id: "s", kind: "obj", at: { zone: "small", row: 0 }, typeTag: "byte[1000]", value: "SOH" }, { id: "l", kind: "obj", at: { zone: "large", row: 0 }, typeTag: "byte[100000]", value: "LOH", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Порог <b>85000</b> «was determined by performance tuning»; его можно <span class="hl">конфигурировать</span> (large-object-heap-threshold).', nodes: [{ id: "l", kind: "obj", at: { zone: "large", row: 0 }, typeTag: "порог", value: "85000 байт", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «<span class="hl">If an object is greater than or equal to 85,000 bytes in size, it\'s considered a large object</span>. This number was determined by performance tuning. When an object allocation request is for 85,000 or more bytes, the runtime allocates it on the large object heap». Почему отдельная куча: «For instance, compacting it—that is, copying it in memory elsewhere on the heap—<b>can be expensive</b>. Because of this, the garbage collector places large objects on the large object heap». То есть большие объекты (обычно массивы) выделяются на LOH, а не на SOH, ровно с порога <b>85000</b> байт. Замером (панель) подтвердим: <code>byte[1000]</code> — gen0, <code>byte[100000]</code> — gen2/LOH. Важная деталь: порог считается по <b>полному размеру объекта</b> (payload + заголовок), а не только по payload.',
      sources: ["ms-loh"],
    },
    {
      id: "s2", num: "02", kicker: "LOH = gen3 / gen2", title: "Физически generation 3, логически собирается с gen2",
      viewBox: "0 0 340 210", zones: GEN3_ZONES,
      code: ["// LOH иногда зовут «generation 3»", "// но это ФИЗИЧЕСКОЕ поколение", "// логически собирается как ЧАСТЬ gen2 → freed только на gen2 (full GC)"],
      scenes: [
        { codeLine: 0, caption: 'LOH иногда называют <span class="hl">«generation 3»</span> — но это отдельная физическая область для больших объектов.', nodes: [{ id: "g", kind: "gate", at: { zone: "gen3", row: 0 }, state: "ok", label: "LOH", detail: "«generation 3»", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Логически gen3 <span class="hl">собирается как часть gen2</span>: большой объект освобождается ТОЛЬКО в gen2-сборе.', nodes: [{ id: "g", kind: "gate", at: { zone: "gen3", row: 0 }, state: "ok", label: "gen3", detail: "физически" }, { id: "c", kind: "gate", at: { zone: "gen3", row: 1 }, state: "ok", label: "собирается с gen2", detail: "full GC", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Следствие: <span class="hl">частые большие временные объекты → частые gen2/full GC</span> (дорого). Замер: LOH-объект переживает gen0, но собран gen2.', nodes: [{ id: "c", kind: "gate", at: { zone: "gen3", row: 0 }, state: "ok", label: "freed только gen2", detail: "не gen0/gen1" }, { id: "w", kind: "gate", at: { zone: "gen3", row: 1 }, state: "fail", label: "частый LOH", detail: "→ частый full GC", accent: true }], edges: [] },
      ],
      explain: 'Дословно (LF F2/F3): «Newly allocated objects… if they are large objects, they go on the large object heap (LOH), <span class="hl">which is sometimes referred to as generation 3. Generation 3 is a physical generation that\'s logically collected as part of generation 2</span>». И прямо: «<span class="hl">Large objects belong to generation 2 because they are collected only during a generation 2 collection</span>. When a generation is collected, all its younger generation(s) are also collected. … a generation 2 GC is also called a <i>full GC</i>». Отсюда практическое: LOH-объект нельзя собрать «дёшево» gen0-сбором — только полным gen2. Поэтому обилие <b>временных</b> больших объектов провоцирует частые дорогие full-GC (разбор мифа MM10 — LOH не «сам по себе gen3»). Стоимость и рекомендацию пула разберём в границах.',
      sources: ["ms-loh"],
    },
    {
      id: "s3", num: "03", kicker: "Sweep, не compact", title: "LOH не уплотняется: GC делает sweep + free list",
      viewBox: "0 0 340 210", zones: SWEEP_ZONES,
      code: ["// обычную кучу GC compact-ит (копирует живые вместе)", "// НО копировать большие объекты дорого → LOH GC SWEEP-ит", "// из мёртвых объектов строится free list, переиспользуется под новые"],
      scenes: [
        { codeLine: 1, caption: 'Обычную кучу GC <b>уплотняет</b> (compact — копирует живые). Для больших объектов копирование <span class="hl">дорого</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "sweep", row: 0 }, state: "fail", label: "compact LOH", detail: "дорого — нет", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Поэтому GC <span class="hl">делает sweep LOH</span>, а не compact: мёртвые объекты не двигаются, их место помечается свободным.', nodes: [{ id: "s", kind: "gate", at: { zone: "sweep", row: 0 }, state: "ok", label: "sweep", detail: "не двигает", accent: true }, { id: "f", kind: "gate", at: { zone: "freelist", row: 0 }, state: "ok", label: "free list", detail: "из мёртвых" }], edges: [{ id: "e1", from: "s", to: "f" }] },
        { codeLine: 2, caption: 'Из мёртвых строится <span class="hl">free list</span>, переиспользуемый под новые большие аллокации; соседние мёртвые сливаются в один свободный блок.', nodes: [{ id: "f", kind: "gate", at: { zone: "freelist", row: 0 }, state: "ok", label: "free list", detail: "reused" }, { id: "m", kind: "gate", at: { zone: "freelist", row: 1 }, state: "ok", label: "соседние мёртвые", detail: "→ один блок", accent: true }], edges: [] },
      ],
      explain: 'Дословно (LF F4, миф MM9): «When a garbage collection is triggered, the GC traces through the live objects and compacts them. But <span class="hl">because compaction is expensive, the GC <i>sweeps</i> the LOH; it makes a free list out of dead objects that can be reused later to satisfy large object allocation requests. Adjacent dead objects are made into one free object</span>». То есть по умолчанию LOH <b>НЕ компактится</b> — GC лишь помечает мёртвые блоки свободными (sweep) и собирает из них free-list. Плюс: не платим за копирование мегабайтных массивов. Минус: <b>фрагментация</b> (дыры между живыми большими объектами остаются). Это прямое опровержение мифа «LOH уплотняется, как обычная куча»: значение по умолчанию <code>LargeObjectHeapCompactionMode == Default</code> означает «не компактить». Как всё же запросить компакцию — разбор 04.',
      sources: ["ms-loh"],
    },
    {
      id: "s4", num: "04", kicker: "Запрос компакции", title: "CompactOnce: компактить LOH в следующий full GC",
      viewBox: "0 0 340 210", zones: MODE_ZONES,
      code: ["GCSettings.LargeObjectHeapCompactionMode =", "    GCLargeObjectHeapCompactionMode.CompactOnce;   // одноразово", "// компактит в следующий full blocking GC, затем сбрасывается в Default", "// в будущем .NET может компактить сам → если объект не должен двигаться, пинь"],
      scenes: [
        { codeLine: 1, caption: '<code>LargeObjectHeapCompactionMode = CompactOnce</code> просит компактить LOH <span class="hl">в следующий full blocking GC</span>.', nodes: [{ id: "m", kind: "gate", at: { zone: "mode", row: 0 }, state: "ok", label: "CompactOnce", detail: "next full GC", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Это <span class="hl">одноразово</span>: после компакции значение сбрасывается обратно в <code>Default</code> (не компактить).', nodes: [{ id: "m", kind: "gate", at: { zone: "mode", row: 0 }, state: "ok", label: "CompactOnce", detail: "1 раз" }, { id: "d", kind: "gate", at: { zone: "mode", row: 1 }, state: "ok", label: "→ Default", detail: "сброс", accent: true }], edges: [] },
        { codeLine: 3, caption: 'В будущем .NET может компактить LOH <b>сам</b> → если объект <span class="hl">не должен двигаться</span> (напр. передан в native), всё равно пиньте его.', nodes: [{ id: "d", kind: "gate", at: { zone: "mode", row: 0 }, state: "ok", label: "future auto-compact", detail: "возможно" }, { id: "p", kind: "gate", at: { zone: "pin", row: 0 }, state: "fail", label: "нельзя двигать", detail: "→ pin", accent: true }], edges: [] },
      ],
      explain: 'Дословно (LF F5/F8): «.NET Core and .NET Framework (starting with .NET Framework 4.5.1) include the <code>GCSettings.LargeObjectHeapCompactionMode</code> property that allows users to specify that <span class="hl">the LOH should be compacted during the next full blocking GC</span>. And in the future, .NET may decide to compact the LOH automatically. This means that, if you allocate large objects and want to make sure that they don\'t move, <span class="hl">you should still pin them</span>». Механика: выставляете <code>CompactOnce</code> → при следующем full blocking GC LOH уплотняется <b>один раз</b>, затем режим возвращается в <code>Default</code>. Замером (панель) подтвердим: default = <code>Default</code>, после установки = <code>CompactOnce</code>. Компакция снижает фрагментацию, но дорога (копирование больших блоков) — потому по требованию, а не всегда.',
      sources: ["ms-loh", "ms-loh-compact"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Порог 85000 и «freed только gen2» — на числах",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["GC.GetGeneration(new byte[1000])     // 0 (SOH)", "GC.GetGeneration(new byte[100000])   // 2 (LOH ≥ 85000)", "// LOH-объект: пережил GC.Collect(0), собран GC.Collect(2)"],
      predictAt: 1, predictQ: 'Какие поколения у <code>byte[1000]</code> и <code>byte[100000]</code> по <code>GC.GetGeneration</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Левый замер: <code>byte[1000]</code> — <b>gen0</b> (SOH), <code>byte[100000]</code> (≥85000) — <b>gen2</b> (LOH).', nodes: [{ id: "t", kind: "gate", at: { zone: "thr", row: 0 }, state: "ok", label: "small=0 large=2", detail: "порог 85000", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Правый замер: LOH-объект <span class="hl">переживает <code>GC.Collect(0)</code></span> (не gen0), но освобождается на <code>GC.Collect(2)</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "thr", row: 0 }, state: "ok", label: "порог", detail: "small=0 large=2" }, { id: "o", kind: "gate", at: { zone: "only2", row: 0 }, state: "ok", label: "gen0 → жив", detail: "gen2 → собран", accent: true }], edges: [] },
        { codeLine: 1, out: "small=0 large=2 · aliveAfterGen0=True aliveAfterGen2=False", caption: 'Панель: <b>small=0 large=2</b> (порог 85000, 3/3) и <b>aliveAfterGen0=True aliveAfterGen2=False</b> — «collected only during a generation 2 collection» (3/3).', nodes: [{ id: "t", kind: "gate", at: { zone: "thr", row: 0 }, state: "ok", label: "small=0 large=2", detail: "порог" }, { id: "o", kind: "gate", at: { zone: "only2", row: 0 }, state: "ok", label: "gen0 жив, gen2 собран", detail: "True/False", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — порог LOH и «freed только gen2», снятые в рантайме. (1) <b>Порог</b>: <code>GC.GetGeneration(new byte[1000])</code> → <b>0</b> (SOH), <code>GC.GetGeneration(new byte[100000])</code> → <b>2</b> (LOH, т.к. ≥85000): печать <code>small=0 large=2</code>, детерминированно 3/3. Точная граница по полному размеру массива (payload+заголовок): замерено <code>byte[84972]</code>=gen0, <code>byte[84976]</code>=gen2 — то есть переход ровно на 85000 байтах суммарно. (2) <b>Freed только gen2</b>: LOH-объект <span class="hl">переживает</span> <code>GC.Collect(0)</code> (<code>aliveAfterGen0=True</code>) и освобождается лишь на <code>GC.Collect(2)</code> (<code>aliveAfterGen2=False</code>) — прямое исполняемое подтверждение «collected only during a generation 2 collection». Числа реальны: LOH — это отдельная физическая куча с порогом 85000, sweep-сборкой и привязкой к gen2.',
      sources: ["ms-loh"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var small = new byte[1000]; var large = new byte[100000]; Console.WriteLine($"small={GC.GetGeneration(small)} large={GC.GetGeneration(large)}");</code> — что напечатает?',
      options: ["small=0 large=2", "small=0 large=0", "small=0 large=3", "small=2 large=2"], correctIndex: 0, xp: 10,
      okText: 'Порог <b>85000</b>: <code>byte[1000]</code> — SOH, <b>gen0</b>; <code>byte[100000]</code> (≥85000) — <span class="hl">LOH, gen2</span> (LOH иногда зовут «generation 3», но логически это gen2). Печать: <b>small=0 large=2</b>.',
      noText: '«greater than or equal to 85,000 bytes… large object… on the large object heap»; LOH = gen2. Реальный вывод: <b>small=0 large=2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "small=0 large=2" }, sourceRefs: ["ms-loh"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var def = GCSettings.LargeObjectHeapCompactionMode; GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce; var set = GCSettings.LargeObjectHeapCompactionMode; GCSettings.LargeObjectHeapCompactionMode = def; Console.WriteLine($"default={def} afterSet={set}");</code> — что напечатает?',
      options: ["default=Default afterSet=CompactOnce", "default=CompactOnce afterSet=CompactOnce", "default=Default afterSet=Default", "default=CompactOnce afterSet=Default"], correctIndex: 0, xp: 10,
      okText: 'По умолчанию LOH <span class="hl">НЕ компактится</span> — режим <code>Default</code> (GC делает sweep). Компакцию просят явно через <code>CompactOnce</code>. Печать: <b>default=Default afterSet=CompactOnce</b>.',
      noText: 'Default = не компактить (sweep); CompactOnce — по требованию. Реальный вывод: <b>default=Default afterSet=CompactOnce</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "default=Default afterSet=CompactOnce" }, sourceRefs: ["ms-loh-compact"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static WeakReference Make(){ var big = new byte[200000]; return new WeakReference(big); } var wr = Make(); GC.Collect(0); GC.WaitForPendingFinalizers(); bool afterGen0 = wr.IsAlive; GC.Collect(2); GC.WaitForPendingFinalizers(); bool afterGen2 = wr.IsAlive; Console.WriteLine($"aliveAfterGen0={afterGen0} aliveAfterGen2={afterGen2}");</code> — что напечатает?',
      options: ["aliveAfterGen0=True aliveAfterGen2=False", "aliveAfterGen0=False aliveAfterGen2=False", "aliveAfterGen0=True aliveAfterGen2=True", "aliveAfterGen0=False aliveAfterGen2=True"], correctIndex: 0, xp: 10,
      okText: 'LOH-объект «<span class="hl">collected only during a generation 2 collection</span>»: <code>GC.Collect(0)</code> его НЕ трогает (жив), <code>GC.Collect(2)</code> — собирает. Печать: <b>aliveAfterGen0=True aliveAfterGen2=False</b>.',
      noText: 'Большой объект в gen2 (LOH) освобождается только полным gen2-сбором. Реальный вывод: <b>aliveAfterGen0=True aliveAfterGen2=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "aliveAfterGen0=True aliveAfterGen2=False" }, sourceRefs: ["ms-loh"],
    },
  ],

  takeaways: [
    { icon: "why", k: "порог 85000", v: '«greater than or equal to <b>85,000 bytes</b>… large object… on the large object heap» (обычно массивы). Замер: <code>byte[1000]</code>=gen0, <code>byte[100000]</code>=gen2. Порог — по полному размеру объекта, конфигурируем.' },
    { icon: "cost", k: "LOH = gen2, не gen3-сам", v: 'LOH — «generation 3» физически, но «<span class="hl">logically collected as part of generation 2</span>» → freed только на gen2/full GC (замер: жив после gen0, собран gen2). Частые временные большие объекты → частые дорогие full-GC.' },
    { icon: "avoid", k: "sweep, не compact", v: 'По умолчанию LOH «<span class="hl">the GC <i>sweeps</i> the LOH</span>» (free list), НЕ компактит (<code>Default</code>) → фрагментация. Компакция — по требованию <code>CompactOnce</code> (замер), одноразово. Стоимость аллокации «dominated by memory clearing» → пул больших объектов.' },
  ],

  foot: 'урок · <b>Large Object Heap</b> · 5 анимир. разборов · панель реального замера (порог 85000, freed только gen2) · дизайн <b>mid</b>',
};
