/**
 * Lesson: GC generations — gen0/1/2, the managed heap, promotion (CS.S7.generations) — expert
 * density, 5 animated deep-dives. The managed heap is divided into THREE generations (0, 1, 2):
 * new objects start in gen0, survivors are promoted gen0→gen1→gen2. gen0 is the youngest,
 * cheapest and most frequent collection; collecting a generation collects it AND all younger; a
 * gen2 collection is a FULL GC. Large objects (>=85000 bytes) go on the LOH ("generation 3"),
 * physically separate but logically collected with gen2 (LOH detail — S7.5).
 *
 * SIGNATURE machine panel (s5): REAL generation measurements — a new byte[100] is gen0 and is
 * promoted to gen1 after surviving a gen0 collection (gen0=0 afterCollect=1), and GC.Collect(2)
 * bumps BOTH the gen0 and gen2 counters (gen2 = full GC). evidence/F12/generations-exec.txt.
 *
 * Accuracy contract (G7) — verified against GC fundamentals (fetch 2026-07-19) + GT-M5-s7.md
 * (GF F14..F20). NOTE: the fundamentals page carries ai-usage: ai-assisted; the "three generations"
 * and "full GC" facts are structural CLR invariants also observable by reflection (GC.MaxGeneration).
 *   - every English quote is VERBATIM from the fundamentals page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F12/generations-exec.txt:
 *     "gen0=0 afterCollect=1"; "maxGen=2 generations=3"; "gen0Bumped=True gen2Bumped=True");
 *   - NO GT-M5 myths: MM3 (gen0 collection is slow / GC always expensive) — no, a portion collects
 *     faster than the whole; gen0 is cheapest and most frequent, the expensive one is full gen2.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.generations/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: three generations.
const Z_GENS: Zone = { id: "gens", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "MANAGED HEAP · три поколения", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "gen0 (юный) · gen1 (буфер) · gen2 (старый)", subCls: "vz-zsub good", subY: 47 };
const GENS_ZONES: Zone[] = [Z_GENS];

// s2: why generations.
const Z_YOUNG: Zone = { id: "young", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "новые · живут коротко", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "gen0 · часто, дёшево", subCls: "vz-zsub good", subY: 47 };
const Z_OLD: Zone = { id: "old", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "старые · живут долго", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "gen2 · редко, дорого", subCls: "vz-zsub", subY: 47 };
const WHY_ZONES: Zone[] = [Z_YOUNG, Z_OLD];

// s3: promotion.
const Z_G0: Zone = { id: "g0", x: 14, y: 34, w: 96, h: 168, cls: "vz-zone good", label: "gen0", labelCls: "vz-zlabel good sm", lx: 62, ly: 24, sub: "new", subCls: "vz-zsub good", subY: 47 };
const Z_G1: Zone = { id: "g1", x: 122, y: 34, w: 96, h: 168, cls: "vz-zone", label: "gen1", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "буфер", subCls: "vz-zsub", subY: 47 };
const Z_G2: Zone = { id: "g2", x: 230, y: 34, w: 96, h: 168, cls: "vz-zone", label: "gen2", labelCls: "vz-zlabel sm", lx: 278, ly: 24, sub: "долгожители", subCls: "vz-zsub", subY: 47 };
const PROMO_ZONES: Zone[] = [Z_G0, Z_G1, Z_G2];

// s4: collecting a generation = it + younger; gen2 = full GC.
const Z_COLLECT: Zone = { id: "collect", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "СБОР ПОКОЛЕНИЯ = оно + все младшие", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "gen2 collect = full GC (весь heap)", subCls: "vz-zsub", subY: 47 };
const COLLECT_ZONES: Zone[] = [Z_COLLECT];

// s5 (SIGNATURE): real generation measurement.
const Z_PROMOTE: Zone = { id: "promote", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "gen0 → gen1", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "пережил сбор → повышен", subCls: "vz-zsub good", subY: 47 };
const Z_FULL: Zone = { id: "full", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "gen2 = full GC", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "бьёт gen0 и gen2", subCls: "vz-zsub", subY: 47 };
const SIG_ZONES: Zone[] = [Z_PROMOTE, Z_FULL];

export const generations: LessonData = {
  id: "CS.S7.generations",
  track: "CS",
  section: "CS.S7",
  module: "S7.2",
  lang: "csharp",
  title: "Поколения GC: gen0/1/2, managed heap, продвижение",
  kicker: "C# вглубь · S7 · поколения кучи",
  home: { subtitle: "три поколения, продвижение, gen2 = full GC", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.gc-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-gc-fund", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22" },
  ],

  spec: [
    { text: "«the managed heap is divided into three generations, 0, 1, and 2, so it can handle long-lived and short-lived objects separately. The garbage collector stores new objects in generation 0.» <span class=\"ru-tr\">«управляемая куча разделена на три поколения — 0, 1 и 2, чтобы обрабатывать долгоживущие и короткоживущие объекты раздельно. Сборщик мусора хранит новые объекты в поколении 0.»</span>", source: "ms-gc-fund" },
  ],
  edgeCases: [
    { text: "Сбор поколения захватывает и младшие (verbatim): «<span class=\"hl\">Collecting a generation means collecting objects in that generation and all its younger generations</span>. A generation 2 garbage collection is also known as a <b>full garbage collection</b> because it reclaims objects in all generations». <span class=\"ru-tr\">«Сбор поколения означает сбор объектов в этом поколении и во всех его младших поколениях. Сбор мусора поколения 2 также известен как <b>полный сбор мусора</b>, потому что он освобождает объекты во всех поколениях».</span>", source: "ms-gc-fund" },
    { text: "Продвижение (verbatim): «Objects that survive a generation 0 garbage collection are <span class=\"hl\">promoted to generation 1</span>. … Objects that survive a generation 1 garbage collection are promoted to generation 2. … Objects that survive a generation 2 garbage collection remain in generation 2». <span class=\"ru-tr\">«Объекты, пережившие сбор мусора поколения 0, продвигаются в поколение 1. … Объекты, пережившие сбор мусора поколения 1, продвигаются в поколение 2. … Объекты, пережившие сбор мусора поколения 2, остаются в поколении 2».</span>", source: "ms-gc-fund" },
    { text: "Большие объекты — на LOH: «if they\'re large objects, they go on the large object heap (LOH), which is <span class=\"hl\">sometimes referred to as <i>generation 3</i></span>. Generation 3 is a physical generation that\'s <b>logically collected as part of generation 2</b>» <span class=\"ru-tr\">«если это большие объекты, они попадают в кучу больших объектов (LOH), которую иногда называют <i>поколением 3</i>. Поколение 3 — это физическое поколение, которое <b>логически собирается как часть поколения 2</b>»</span> (детали LOH — S7.5).", source: "ms-gc-fund" },
  ],

  misconceptions: [
    {
      wrong: "любой сбор мусора дорогой и надолго стопает приложение / gen0-сбор такой же тяжёлый, как полный",
      hook: 'Миф: «<span class="wrong">GC всегда дорого стопает приложение</span>» / «gen0-сбор такой же тяжёлый, как полный». Нет — вся идея поколений в обратном: «<span class="hl">It\'s faster to compact the memory for a portion of the managed heap than for the entire managed heap</span>» <span class="ru-tr">«Уплотнить память для части управляемой кучи быстрее, чем для всей управляемой кучи»</span>. gen0 — самый частый и <b>дешёвый</b>: «Garbage collection occurs <span class="hl">most frequently in this generation</span>» <span class="ru-tr">«Сбор мусора происходит чаще всего именно в этом поколении»</span>, и «Most objects are reclaimed… in generation 0 and don\'t survive to the next generation» <span class="ru-tr">«Большинство объектов освобождается… в поколении 0 и не доживает до следующего поколения»</span>. Дорогой — только <b>full</b> gen2. Ниже <b>пять разборов</b>: три поколения, зачем они, продвижение, сбор поколения = оно + младшие (gen2 = full GC), и <b>машинная панель</b> — реальный замер продвижения и full-GC.',
      source: "ms-gc-fund",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три поколения", title: "Heap разделён на gen0, gen1, gen2",
      viewBox: "0 0 340 210", zones: GENS_ZONES,
      code: ["var o = new object();          // новые объекты → gen0", "// пережил сбор gen0 → продвинут в gen1", "// пережил gen1 → gen2 (долгожители)"],
      scenes: [
        { codeLine: 0, caption: 'managed heap разделён на <span class="hl">три поколения — 0, 1, 2</span>. Новые объекты кладутся в <b>gen0</b>.', nodes: [{ id: "g", kind: "chip", at: { zone: "gens", row: 0, col: 0 }, value: "gen0 · new", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Объект, переживший сбор gen0, <span class="hl">продвигается в gen1</span> — буфер между короткоживущими и долгоживущими.', nodes: [{ id: "g", kind: "chip", at: { zone: "gens", row: 0, col: 0 }, value: "gen0" }, { id: "g1", kind: "chip", at: { zone: "gens", row: 0, col: 1 }, value: "gen1 · буфер", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Пережил и gen1 → <b>gen2</b>: долгоживущие (напр. статические данные на весь процесс).', nodes: [{ id: "g", kind: "chip", at: { zone: "gens", row: 0, col: 0 }, value: "gen0" }, { id: "g1", kind: "chip", at: { zone: "gens", row: 0, col: 1 }, value: "gen1" }, { id: "g2", kind: "chip", at: { zone: "gens", row: 1, col: 0 }, value: "gen2 · долгожители", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «To optimize the performance of the garbage collector, <span class="hl">the managed heap is divided into three generations, 0, 1, and 2</span>, so it can handle long-lived and short-lived objects separately. The garbage collector stores new objects in generation 0. Objects created early in the application\'s lifetime that survive collections are promoted and stored in generations 1 and 2» <span class="ru-tr">«Чтобы оптимизировать производительность сборщика мусора, управляемая куча разделена на три поколения — 0, 1 и 2, чтобы обрабатывать долгоживущие и короткоживущие объекты раздельно. Сборщик мусора хранит новые объекты в поколении 0. Объекты, созданные в начале жизни приложения и пережившие сборы, продвигаются и хранятся в поколениях 1 и 2»</span>. Модель: <b>gen0</b> — самый юный, короткоживущие (напр. временная переменная); <b>gen1</b> — буфер; <b>gen2</b> — долгожители. Это НЕ произвольное деление, а оптимизация: собирать часть кучи дешевле, чем всю (разбор 02). Замером подтверждается: <code>GC.MaxGeneration == 2</code> → ровно 3 поколения.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s2", num: "02", kicker: "Зачем поколения", title: "Часть кучи собрать быстрее целого; новые живут коротко",
      viewBox: "0 0 340 210", zones: WHY_ZONES,
      code: ["// допущения алгоритма GC:", "// 1) новые объекты живут КОРОТКО (умирают в gen0)", "// 2) старые объекты живут ДОЛГО", "// → gen0 собираем часто и дёшево, gen2 — редко"],
      scenes: [
        { codeLine: 1, caption: 'Допущение 1: <span class="hl">новые объекты живут коротко</span> — большинство умирает в gen0, не доживая до старших поколений.', nodes: [{ id: "y", kind: "gate", at: { zone: "young", row: 0 }, state: "ok", label: "новые", detail: "короткая жизнь", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Допущение 2: <span class="hl">старые объекты живут долго</span> — их незачем проверять на каждом сборе.', nodes: [{ id: "y", kind: "gate", at: { zone: "young", row: 0 }, state: "ok", label: "новые", detail: "gen0" }, { id: "o", kind: "gate", at: { zone: "old", row: 0 }, state: "ok", label: "старые", detail: "gen2 · долго", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Итог: <span class="hl">собрать ЧАСТЬ кучи быстрее, чем всю</span> → gen0 собираем часто и дёшево, gen2 — редко. Миф «GC всегда дорого» неверен.', nodes: [{ id: "y", kind: "gate", at: { zone: "young", row: 0 }, state: "ok", label: "gen0", detail: "часто · дёшево" }, { id: "o", kind: "gate", at: { zone: "old", row: 0 }, state: "ok", label: "gen2", detail: "редко · дорого", accent: true }], edges: [] },
      ],
      explain: 'Основание модели (verbatim, раздел The GC algorithm is based on several considerations): «<span class="hl">It\'s faster to compact the memory for a portion of the managed heap than for the entire managed heap</span>. … Newer objects have shorter lifetimes, and older objects have longer lifetimes. … Newer objects tend to be related to each other and accessed by the application around the same time» <span class="ru-tr">«Уплотнить память для части управляемой кучи быстрее, чем для всей управляемой кучи. … Более новые объекты живут меньше, а более старые — дольше. … Более новые объекты обычно связаны друг с другом и используются приложением примерно в одно и то же время»</span>. Отсюда про gen0: «Garbage collection occurs <span class="hl">most frequently in this generation</span>» <span class="ru-tr">«Сбор мусора происходит чаще всего именно в этом поколении»</span> и «<span class="hl">Most objects are reclaimed for garbage collection in generation 0 and don\'t survive to the next generation</span>» <span class="ru-tr">«Большинство объектов освобождается сбором мусора в поколении 0 и не доживает до следующего поколения»</span>. Практический вывод (анти-миф MM3): рядовой gen0-сбор — дешёвый и частый; дорогая пауза — это <b>full</b> gen2 (разбор 04). Меньше короткоживущего мусора → меньше даже дешёвых gen0-сборов.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s3", num: "03", kicker: "Продвижение", title: "Пережил сбор → повышен в следующее поколение",
      viewBox: "0 0 340 210", zones: PROMO_ZONES,
      code: ["var o = new byte[100];   // gen0", "GC.Collect(0);            // сбор gen0; o пережил", "GC.GetGeneration(o);      // теперь 1 — продвинут в gen1"],
      predictAt: 1, predictQ: '<code>o</code> в gen0. После <code>GC.Collect(0)</code> (o переживает сбор) — какое поколение вернёт <code>GC.GetGeneration(o)</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Новый <code>byte[100]</code> — в <b>gen0</b> (замер: <code>GC.GetGeneration(o) == 0</code>).', nodes: [{ id: "o", kind: "obj", at: { zone: "g0", row: 0 }, typeTag: "o", value: "gen0", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Сбор gen0; <code>o</code> достижим (root) — <span class="hl">переживает</span> сбор и продвигается.', nodes: [{ id: "o", kind: "obj", at: { zone: "g0", row: 0 }, typeTag: "o", value: "пережил" }, { id: "p", kind: "gate", at: { zone: "g1", row: 0 }, state: "ok", label: "промоушен", detail: "→ gen1", accent: true }], edges: [{ id: "e1", from: "o", to: "p" }] },
        { codeLine: 2, out: "gen0=0 afterCollect=1", caption: 'Печать: <b>gen0=0 afterCollect=1</b> (замер 5/5). «Objects that survive a generation 0 garbage collection are <span class="hl">promoted to generation 1</span>» <span class="ru-tr">«Объекты, пережившие сбор мусора поколения 0, продвигаются в поколение 1»</span>.', nodes: [{ id: "o", kind: "obj", at: { zone: "g1", row: 0 }, typeTag: "o", value: "gen1", accent: true }], edges: [] },
      ],
      explain: 'Механика выживания (verbatim, раздел Survival and promotions): «Objects that aren\'t reclaimed in a garbage collection are known as <b>survivors</b> and are promoted to the next generation: <span class="hl">Objects that survive a generation 0 garbage collection are promoted to generation 1</span>. Objects that survive a generation 1 garbage collection are promoted to generation 2. Objects that survive a generation 2 garbage collection remain in generation 2» <span class="ru-tr">«Объекты, не освобождённые при сборе мусора, называются <b>выжившими</b> и продвигаются в следующее поколение: объекты, пережившие сбор мусора поколения 0, продвигаются в поколение 1. Объекты, пережившие сбор мусора поколения 1, продвигаются в поколение 2. Объекты, пережившие сбор мусора поколения 2, остаются в поколении 2»</span>. Прогон подтверждает нижний шаг: rooted <code>byte[100]</code> стартует в gen0, после <code>GC.Collect(0)</code> (он достижим → выживает) <code>GC.GetGeneration</code> возвращает <b>1</b> — детерминированно 5/5. Практика: долгоживущие данные оседают в gen2, поэтому «утечка» в managed-мире — это чаще случайно удержанная ссылка на объект, который дорос до gen2 и там застрял.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s4", num: "04", kicker: "Сбор = поколение + младшие", title: "gen2 collect = full GC (весь heap)",
      viewBox: "0 0 340 210", zones: COLLECT_ZONES,
      code: ["GC.Collect(0);   // собирает только gen0", "GC.Collect(1);   // собирает gen1 И gen0", "GC.Collect(2);   // full GC: gen2 И gen1 И gen0 (весь heap)"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Сбор поколения = <span class="hl">оно И все младшие</span>. <code>Collect(0)</code> — только gen0.', nodes: [{ id: "c", kind: "gate", at: { zone: "collect", row: 0 }, state: "ok", label: "Collect(0)", detail: "gen0", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Collect(2)</code> — <b>full GC</b>: собирает gen2 <span class="hl">и</span> gen1 <span class="hl">и</span> gen0 (весь managed heap).', nodes: [{ id: "c", kind: "gate", at: { zone: "collect", row: 0 }, state: "ok", label: "Collect(0)", detail: "gen0" }, { id: "f", kind: "gate", at: { zone: "collect", row: 1 }, state: "ok", label: "Collect(2)", detail: "gen2+gen1+gen0", accent: true }], edges: [] },
        { codeLine: 2, out: "gen0Bumped=True gen2Bumped=True", caption: 'Замер: после <code>GC.Collect(2)</code> счётчики <b>и gen0, и gen2</b> выросли — full GC действительно захватил младшие. Печать: <b>gen0Bumped=True gen2Bumped=True</b>.', nodes: [{ id: "c", kind: "gate", at: { zone: "collect", row: 0 }, state: "ok", label: "gen0 count", detail: "вырос" }, { id: "f", kind: "gate", at: { zone: "collect", row: 1 }, state: "ok", label: "gen2 count", detail: "вырос", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «Garbage collections occur in specific generations as conditions warrant. <span class="hl">Collecting a generation means collecting objects in that generation and all its younger generations</span>. A generation 2 garbage collection is also known as a <b>full garbage collection</b> because it reclaims objects in all generations (that is, all objects in the managed heap)» <span class="ru-tr">«Сборы мусора происходят в конкретных поколениях, когда для этого возникают условия. Сбор поколения означает сбор объектов в этом поколении и во всех его младших поколениях. Сбор мусора поколения 2 также известен как <b>полный сбор мусора</b>, потому что он освобождает объекты во всех поколениях (то есть все объекты в управляемой куче)»</span>. Прогон это подтверждает напрямую: <code>GC.Collect(2)</code> поднимает <code>CollectionCount(0)</code> И <code>CollectionCount(2)</code> — то есть full GC прошёл и по младшим (<b>gen0Bumped=True gen2Bumped=True</b>). Отсюда стоимость: gen0-сбор дешёвый и локальный, а gen2/full — самый дорогой (весь heap, максимальные паузы). Именно full GC хочется минимизировать; частые gen0 — норма.',
      sources: ["ms-gc-fund"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Продвижение gen0→gen1 и full-GC — на числах",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["var o=new byte[100]; GC.Collect(0);", "GC.GetGeneration(o)  // 0 → 1 (пережил сбор, продвинут)", "GC.Collect(2)        // full: счётчики gen0 И gen2 растут"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Левый замер: rooted <code>o</code> был gen0, после <code>GC.Collect(0)</code> стал <b>gen1</b> — <span class="hl">продвижение</span> (survivor).', nodes: [{ id: "p", kind: "gate", at: { zone: "promote", row: 0 }, state: "ok", label: "GetGeneration(o)", detail: "0 → 1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Правый замер: <code>GC.Collect(2)</code> — <span class="hl">full GC</span>, поднимает счётчики и gen0, и gen2 (собрал младшие).', nodes: [{ id: "p", kind: "gate", at: { zone: "promote", row: 0 }, state: "ok", label: "промоушен", detail: "0 → 1" }, { id: "f", kind: "gate", at: { zone: "full", row: 0 }, state: "ok", label: "Collect(2)", detail: "gen0 ∧ gen2 ↑", accent: true }], edges: [] },
        { codeLine: 0, out: "gen0=0 afterCollect=1 · gen0Bumped=True gen2Bumped=True", caption: 'Панель: <b>gen0=0 afterCollect=1</b> (продвижение, 5/5) и <b>gen0Bumped=True gen2Bumped=True</b> (full GC бьёт младшие, 3/3). Обе цифры — реальный рантайм.', nodes: [{ id: "p", kind: "gate", at: { zone: "promote", row: 0 }, state: "ok", label: "gen0 → gen1", detail: "afterCollect=1" }, { id: "f", kind: "gate", at: { zone: "full", row: 0 }, state: "ok", label: "full GC", detail: "gen0 ∧ gen2", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — модель поколений, снятая в рантайме. (1) <b>Продвижение</b>: <code>var o=new byte[100]</code> стартует в gen0; после <code>GC.Collect(0)</code> (o достижим → выживает) <code>GC.GetGeneration(o)</code> возвращает <b>1</b> — детерминированно 5/5, ровно как в доке «survive a generation 0 garbage collection are promoted to generation 1» <span class="ru-tr">«пережившие сбор мусора поколения 0 продвигаются в поколение 1»</span>. (2) <b>Full GC</b>: <code>GC.Collect(2)</code> увеличивает <code>GC.CollectionCount(0)</code> И <code>GC.CollectionCount(2)</code> — доказательство, что «Collecting a generation means collecting… all its younger generations» <span class="ru-tr">«Сбор поколения означает сбор… всех его младших поколений»</span> (3/3). Числа реальны, а не декоративны: движок действительно ведёт учёт по поколениям, и full-GC действительно проходит по всей куче. Практика: держи объекты короткоживущими (умирают в gen0), избегай ссылок, тащащих временные данные в gen2, — тогда дорогих full-GC меньше.',
      sources: ["ms-gc-fund"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var o = new byte[100]; int g0 = GC.GetGeneration(o); GC.Collect(0); GC.WaitForPendingFinalizers(); int g1 = GC.GetGeneration(o); GC.KeepAlive(o); Console.WriteLine($"gen0={g0} afterCollect={g1}");</code> — что напечатает?',
      options: ["gen0=0 afterCollect=1", "gen0=0 afterCollect=0", "gen0=1 afterCollect=2", "gen0=0 afterCollect=2"], correctIndex: 0, xp: 10,
      okText: 'Новый объект — в <b>gen0</b>; переживший сбор gen0 <span class="hl">продвигается в gen1</span>. Печать: <b>gen0=0 afterCollect=1</b> (замер 5/5).',
      noText: '«Objects that survive a generation 0 garbage collection are promoted to generation 1» <span class="ru-tr">«Объекты, пережившие сбор мусора поколения 0, продвигаются в поколение 1»</span>. Реальный вывод: <b>gen0=0 afterCollect=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "gen0=0 afterCollect=1" }, sourceRefs: ["ms-gc-fund"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Console.WriteLine($"maxGen={GC.MaxGeneration} generations={GC.MaxGeneration+1}");</code> — сколько поколений в managed heap?',
      options: ["maxGen=2 generations=3", "maxGen=3 generations=4", "maxGen=1 generations=2", "maxGen=2 generations=2"], correctIndex: 0, xp: 10,
      okText: 'Heap разделён на <span class="hl">три поколения — 0, 1, 2</span>; старшее — <code>GC.MaxGeneration == 2</code>. Печать: <b>maxGen=2 generations=3</b>. LOH иногда зовут «generation 3» <span class="ru-tr">«поколение 3»</span>, но физически, логически — часть gen2.',
      noText: '«divided into three generations, 0, 1, and 2» <span class="ru-tr">«разделена на три поколения — 0, 1 и 2»</span>; MaxGeneration=2. Реальный вывод: <b>maxGen=2 generations=3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "maxGen=2 generations=3" }, sourceRefs: ["ms-gc-fund"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int g0 = GC.CollectionCount(0); int g2 = GC.CollectionCount(2); GC.Collect(2); int g0b = GC.CollectionCount(0); int g2b = GC.CollectionCount(2); Console.WriteLine($"gen0Bumped={g0b&gt;g0} gen2Bumped={g2b&gt;g2}");</code> — что напечатает?',
      options: ["gen0Bumped=True gen2Bumped=True", "gen0Bumped=False gen2Bumped=True", "gen0Bumped=True gen2Bumped=False", "gen0Bumped=False gen2Bumped=False"], correctIndex: 0, xp: 10,
      okText: '<code>GC.Collect(2)</code> — <b>full GC</b>: «collecting… that generation and <span class="hl">all its younger generations</span>» <span class="ru-tr">«сбор… этого поколения и всех его младших поколений»</span> → счётчики и gen0, и gen2 растут. Печать: <b>gen0Bumped=True gen2Bumped=True</b>.',
      noText: 'gen2-сбор = full GC, захватывает младшие. Реальный вывод: <b>gen0Bumped=True gen2Bumped=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "gen0Bumped=True gen2Bumped=True" }, sourceRefs: ["ms-gc-fund"],
    },
  ],

  takeaways: [
    { icon: "why", k: "три поколения", v: 'Heap = <span class="hl">gen0/gen1/gen2</span> (<code>MaxGeneration==2</code>). Новые → gen0; пережил сбор → промоушен в следующее (замер: gen0→gen1). LOH иногда зовут «generation 3» <span class="ru-tr">«поколение 3»</span> — физически отдельно, логически с gen2.' },
    { icon: "cost", k: "gen0 дёшев, full дорог", v: 'Идея: «It\'s faster to compact the memory for a portion of the managed heap than for the entire managed heap» <span class="ru-tr">«Уплотнить память для части управляемой кучи быстрее, чем для всей управляемой кучи»</span>. gen0 — «most frequently» <span class="ru-tr">«чаще всего»</span>, дёшево; дорогая пауза — <b>full</b> gen2. Миф «GC всегда дорого» неверен.' },
    { icon: "avoid", k: "gen2 = full GC", v: 'Сбор поколения = оно + все младшие; <b>gen2 = full GC</b> (весь heap) — замер: <code>Collect(2)</code> бьёт и gen0, и gen2. Держи объекты короткоживущими → меньше дорогих full-GC.' },
  ],

  foot: 'урок · <b>поколения GC</b> · 5 анимир. разборов · панель реального замера (продвижение + full GC) · дизайн <b>mid</b>',
};
