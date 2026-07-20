/**
 * Lesson: List<T> изнутри — массив, Capacity, рост (CS.S17.list-internals).
 * List<T> is a growable ARRAY, not a linked list: index is O(1); Add is amortized O(1)
 * because the internal array reallocates in DOUBLING jumps, not per element. Capacity is
 * how many fit before resize; Count is how many are there; Capacity >= Count always.
 * TrimExcess shrinks capacity to count.
 *
 * SIGNATURE machine panel (s5): the REAL Capacity growth sequence 0 -> 4 -> 8 -> 16 -> 32
 * (doubling), and the reallocation count — 1000 Add cause only 9 reallocations (amortized
 * O(1)), 0 if pre-sized. The docs' own example (5 adds -> Capacity 8, TrimExcess -> 5) is
 * reproduced live. Evidence: scratchpad l4cap.cs / l4c1.cs / l4c2.cs / l4c3.cs,
 * backend run-csharp, 2026-07-21. The x2 growth factor is an IMPLEMENTATION detail
 * (List.cs, not a doc contract) — marked as such (GT M8).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from list-1 + list-1.capacity + collections index
 *     (fetch-verified 2026-07-21) — GT-M6-collections-core F20–F26.
 *   - card verify.expect = REAL run-csharp stdout; anti-echo (8/5, 9, 0 are computed).
 *   - the doubling / x2 is presented as List.cs implementation detail, NOT quoted from docs.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.list-internals/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: array under the hood — inline slots in one int[].
const Z_LIST: Zone = { id: "list", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "List<int>", labelCls: "vz-zlabel sm", lx: 83, ly: 22, sub: "обёртка", subCls: "vz-zsub", subY: 38 };
const Z_ARR: Zone = { id: "arr", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "int[] под капотом", labelCls: "vz-zlabel good sm", lx: 257, ly: 22, sub: "непрерывная память", subCls: "vz-zsub good", subY: 38 };
const ARRAY_ZONES: Zone[] = [Z_LIST, Z_ARR];

// s2: Capacity vs Count — headroom.
const Z_CAP: Zone = { id: "cap", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "Capacity ≥ Count · запас в массиве", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "Count реально, Capacity — сколько влезет", subCls: "vz-zsub", subY: 47 };
const CAPCOUNT_ZONES: Zone[] = [Z_CAP];

// s3: the doubling reallocation — old array copied into a new, bigger one.
const Z_OLD: Zone = { id: "old", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "старый массив (полон)", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "Count == Capacity", subCls: "vz-zsub heap", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "новый массив ×2", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "элементы скопированы", subCls: "vz-zsub good", subY: 47 };
const REALLOC_ZONES: Zone[] = [Z_OLD, Z_NEW];

// s4: index O(1) vs Contains O(n) — same array, two access patterns.
const Z_IDX: Zone = { id: "idx", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "list[i]", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "адрес = base + i·size", subCls: "vz-zsub good", subY: 47 };
const Z_SCAN: Zone = { id: "scan", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "list.Contains(x)", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "линейный обход", subCls: "vz-zsub heap", subY: 47 };
const ACCESS_ZONES: Zone[] = [Z_IDX, Z_SCAN];

// s5 (SIGNATURE): the capacity-growth panel.
const Z_GROW: Zone = { id: "grow", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Capacity рост (реальный замер) · 0 → 4 → 8 → 16 → 32", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "1000 Add = 9 реаллокаций (amortized O(1))", subCls: "vz-zsub good", subY: 47 };
const GROW_ZONES: Zone[] = [Z_GROW];

export const listInternals: LessonData = {
  id: "CS.S17.list-internals",
  track: "CS",
  section: "CS.S17",
  module: "S17.4",
  lang: "csharp",
  title: "List<T> изнутри: массив, Capacity, рост",
  kicker: "C# вглубь · S17 · массив под капотом",
  home: { subtitle: "int[] под капотом, Capacity/Count, амортизированный Add", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S17.collections-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-list", kind: "doc", org: "Microsoft Learn", title: "List<T> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1", date: "2026-07-01" },
    { id: "ms-list-capacity", kind: "doc", org: "Microsoft Learn", title: "List<T>.Capacity Property", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity", date: "2026-07-01" },
    { id: "ms-collections", kind: "doc", org: "Microsoft Learn", title: "Collections and Data Structures", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/", date: "2026-03-30" },
    { id: "runtime-list", kind: "source", org: "dotnet/runtime", title: "List.cs (x2 growth factor)", url: "https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/List.cs", date: "2026-07-21" },
  ],

  spec: [
    { text: "«Represents a strongly typed list of objects that can be accessed by index.»", source: "ms-list" },
    { text: "«Capacity is the number of elements that the List&lt;T&gt; can store before resizing is required, whereas Count is the number of elements that are actually in the List&lt;T&gt;.»", source: "ms-list-capacity" },
  ],
  edgeCases: [
    { text: "«The List&lt;T&gt; class is the generic equivalent of the <code>ArrayList</code> class» — та же идея (массив по индексу), но type-safe и без боксинга.", source: "ms-list" },
    { text: "«<code>List&lt;T&gt;</code> accepts <code>null</code> as a valid value for reference types and allows <b>duplicate</b> elements» — не множество, дубликаты и <code>null</code> разрешены.", source: "ms-list" },
    { text: "Установка <code>Capacity</code> — O(n) (реаллокация + копирование), чтение — O(1). Множитель роста ×2 — деталь реализации <code>List.cs</code>, не контракт документации.", source: "ms-list-capacity" },
  ],

  misconceptions: [
    {
      wrong: "List<T> — связный список, и его ёмкость растёт на +1 при каждом Add",
      hook: 'Два разных мифа с одним источником — незнанием, что <code>List&lt;T&gt;</code> внутри. Первый: «связный список» — нет, «Represents a strongly typed list of objects that can be <span class="hl">accessed by index</span>», это <b>массив</b> (связный — отдельный <code>LinkedList&lt;T&gt;</code>). Второй: «ёмкость +1 на каждый Add» — нет, массив растёт <span class="wrong">скачками</span>: «If Count exceeds Capacity… the capacity is increased by <b>automatically reallocating the internal array</b>». Дальше <b>пять разборов</b> — от массива под капотом до <b>машинной панели</b>: реально снятый рост Capacity <b>0 → 4 → 8 → 16 → 32</b>, где 1000 <code>Add</code> дают всего <b>9 реаллокаций</b> (amortized O(1)).',
      source: "ms-list",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Под капотом · массив", title: "List<T> — это обёртка над обычным массивом",
      viewBox: "0 0 340 210", zones: ARRAY_ZONES,
      code: ["var list = new List<int> { 10, 20, 30 };", "// внутри: int[] _items + int _size (Count)", "list[1];   // прямой адрес в массиве: base + 1·size"],
      scenes: [
        { codeLine: 0, caption: '<code>List&lt;int&gt;</code> — тонкая обёртка: держит поле <code>_items</code> (массив) и <code>_size</code> (это и есть <code>Count</code>).', nodes: [{ id: "l", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List<int>", value: "Count=3", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Данные лежат в <span class="hl">непрерывном массиве</span> <code>int[]</code>: <code>[10][20][30]</code> подряд в памяти, без указателей между элементами.', nodes: [{ id: "l", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List<int>", value: "Count=3" }, { id: "a0", kind: "slot", at: { zone: "arr", row: 0 }, name: "[0]", value: "10", accent: true }, { id: "a1", kind: "slot", at: { zone: "arr", row: 1 }, name: "[1]", value: "20" }, { id: "a2", kind: "slot", at: { zone: "arr", row: 2 }, name: "[2]", value: "30" }], edges: [{ id: "e1", from: "l", to: "a0" }] },
        { codeLine: 2, caption: '<code>list[1]</code> — <span class="hl">вычисление адреса</span>: <code>base + 1·sizeof(int)</code>. Не обход, а арифметика — потому индекс O(1).', nodes: [{ id: "l", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "List<int>", value: "Count=3" }, { id: "a0", kind: "slot", at: { zone: "arr", row: 0 }, name: "[0]", value: "10" }, { id: "a1", kind: "slot", at: { zone: "arr", row: 1 }, name: "[1]", value: "20", accent: true }, { id: "a2", kind: "slot", at: { zone: "arr", row: 2 }, name: "[2]", value: "30" }], edges: [{ id: "e1", from: "l", to: "a1", accent: true }] },
      ],
      explain: 'За «списком» стоит массив: «Represents a strongly typed list of objects that can be <b>accessed by index</b>», и «The <code>List&lt;T&gt;</code> class is the <b>generic equivalent</b> of the <code>ArrayList</code> class». Внутри — поле-массив <code>_items</code> и счётчик <code>_size</code> (= <code>Count</code>). Элементы лежат непрерывно, поэтому <code>list[i]</code> — это адресная арифметика <code>base + i·size</code>, а не обход узлов: индекс O(1) и amortized, и worst-case. Из массива же растут остальные свойства: дубликаты и <code>null</code> разрешены («accepts <code>null</code>… and allows duplicate elements»), но порядок не гарантирован отсортированным («not guaranteed to be sorted»).',
      sources: ["ms-list", "ms-collections"],
    },
    {
      id: "s2", num: "02", kicker: "Capacity ≥ Count", title: "Ёмкость — это запас, а не число элементов",
      viewBox: "0 0 340 210", zones: CAPCOUNT_ZONES,
      code: ["var list = new List<int>();  // Capacity 0, Count 0", "list.Add(1);                 // Capacity 4, Count 1", "// в массиве 4 слота, занят 1 — три про запас"],
      scenes: [
        { codeLine: 0, caption: 'Пустой <code>List</code>: <code>Capacity=0</code>, <code>Count=0</code> — внутренний массив ещё не выделен.', nodes: [{ id: "cnt", kind: "gate", at: { zone: "cap", row: 0, col: 0 }, state: "ok", label: "Count", detail: "0" }, { id: "cp", kind: "gate", at: { zone: "cap", row: 0, col: 1 }, state: "ok", label: "Capacity", detail: "0", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Первый <code>Add</code>: массив выделяется на <span class="hl">4</span> слота. <code>Count=1</code>, но <code>Capacity=4</code> — <b>три про запас</b>.', nodes: [{ id: "cnt", kind: "gate", at: { zone: "cap", row: 0, col: 0 }, state: "ok", label: "Count", detail: "1" }, { id: "cp", kind: "gate", at: { zone: "cap", row: 0, col: 1 }, state: "ok", label: "Capacity", detail: "4", accent: true }, { id: "s0", kind: "slot", at: { zone: "cap", row: 1, col: 0 }, name: "[0]", value: "1", accent: true }, { id: "s1", kind: "slot", at: { zone: "cap", row: 1, col: 1 }, name: "[1]", value: "·" }, { id: "s2", kind: "slot", at: { zone: "cap", row: 1, col: 2 }, name: "[2]", value: "·" }, { id: "s3", kind: "slot", at: { zone: "cap", row: 1, col: 3 }, name: "[3]", value: "·" }], edges: [] },
        { codeLine: 2, caption: 'Пока <code>Count &lt; Capacity</code>, <code>Add</code> просто пишет в свободный слот — <span class="hl">O(1)</span>, без аллокаций. Запас амортизирует рост.', nodes: [{ id: "cnt", kind: "gate", at: { zone: "cap", row: 0, col: 0 }, state: "ok", label: "Count", detail: "3" }, { id: "cp", kind: "gate", at: { zone: "cap", row: 0, col: 1 }, state: "ok", label: "Capacity", detail: "4" }, { id: "s0", kind: "slot", at: { zone: "cap", row: 1, col: 0 }, name: "[0]", value: "1" }, { id: "s1", kind: "slot", at: { zone: "cap", row: 1, col: 1 }, name: "[1]", value: "2" }, { id: "s2", kind: "slot", at: { zone: "cap", row: 1, col: 2 }, name: "[2]", value: "3", accent: true }, { id: "s3", kind: "slot", at: { zone: "cap", row: 1, col: 3 }, name: "[3]", value: "·" }], edges: [] },
      ],
      explain: 'Два числа: «<code>Capacity</code> is the number of elements that the <code>List&lt;T&gt;</code> can store <b>before resizing is required</b>, whereas <code>Count</code> is the number of elements that are actually in the <code>List&lt;T&gt;</code>». Инвариант — «<code>Capacity</code> is always <b>greater than or equal to</b> <code>Count</code>». Само свойство определено как «the total number of elements the internal data structure can hold <b>without resizing</b>». Запас (Capacity − Count) — это свободные слоты в массиве; пока они есть, <code>Add</code> пишет в них за O(1), не трогая GC. Именно этот запас превращает O(n)-реаллокации в amortized O(1) на большинстве вставок.',
      sources: ["ms-list-capacity"],
    },
    {
      id: "s3", num: "03", kicker: "Рост · реаллокация ×2", title: "Полный массив → новый вдвое больше, с копированием",
      viewBox: "0 0 340 210", zones: REALLOC_ZONES,
      code: ["// Count == Capacity, а нужно ещё добавить", "list.Add(x);   // старого места нет:", "//   1) выделить массив ×2", "//   2) скопировать старые элементы", "//   3) добавить новый"],
      predictAt: 2, predictQ: 'Когда массив полон (<code>Count==Capacity</code>) и делают <code>Add</code> — во сколько раз обычно растёт ёмкость?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Массив полон: <code>Count == Capacity == 4</code>. Свободных слотов нет, а <code>Add</code> требует места.', nodes: [{ id: "o0", kind: "slot", at: { zone: "old", row: 0 }, name: "[0..3]", value: "полон", accent: true }, { id: "need", kind: "gate", at: { zone: "new", row: 0 }, state: "fail", label: "Add", detail: "нет места" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Выделяется <span class="hl">новый массив ×2</span> (4 → 8) и старые элементы <b>копируются</b> в него — это O(n) работа.', nodes: [{ id: "o0", kind: "slot", at: { zone: "old", row: 0 }, name: "старый", value: "4 слота" }, { id: "n0", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "новый int[8]", value: "копия", accent: true }], edges: [{ id: "e1", from: "o0", to: "n0", accent: true }] },
        { codeLine: 4, out: "", caption: 'Новый элемент ложится в свежий слот. Старый массив — мусор для GC. Реаллокация редка, поэтому <code>Add</code> <span class="hl">amortized O(1)</span>.', nodes: [{ id: "n0", kind: "slot", at: { zone: "new", row: 0 }, name: "[0..3]", value: "скопир." }, { id: "n1", kind: "slot", at: { zone: "new", row: 1 }, name: "[4]", value: "x", accent: true }], edges: [] },
      ],
      explain: 'Рост — это не «+1», а реаллокация: «If <code>Count</code> exceeds <code>Capacity</code> while adding elements, the capacity is increased by <b>automatically reallocating the internal array</b> before copying the old elements and adding the new elements». Дока гарантирует только сам факт реаллокации+копирования; <b>множитель ×2</b> — деталь реализации <code>List.cs</code> (dotnet/runtime), а не контракт документации (не приписывать «doubles» как цитату Learn). Одна реаллокация — O(n) (копирование всех элементов), но происходит она всё реже по мере роста, поэтому суммарно <code>Add</code> — amortized O(1). Установка <code>Capacity</code> вручную тоже O(n): «setting the property is an O(<i>n</i>) operation».',
      sources: ["ms-list-capacity", "runtime-list"],
    },
    {
      id: "s4", num: "04", kicker: "Доступ · индекс vs поиск", title: "list[i] — арифметика; Contains — обход",
      viewBox: "0 0 340 210", zones: ACCESS_ZONES,
      code: ["list[500];          // O(1): адрес = base + 500·size", "list.Contains(x);   // O(n): сравнить с каждым", "list.IndexOf(x);    // O(n): вернуть первую позицию"],
      scenes: [
        { codeLine: 0, caption: '<code>list[500]</code> — один шаг: вычислить адрес <code>base + 500·size</code> и прочитать. <span class="hl">O(1)</span> независимо от размера.', nodes: [{ id: "i", kind: "gate", at: { zone: "idx", row: 0 }, state: "ok", label: "list[500]", detail: "1 шаг", accent: true }, { id: "s0", kind: "slot", at: { zone: "scan", row: 0 }, name: "[0]", value: "?" }], edges: [] },
        { codeLine: 1, caption: '<code>Contains(x)</code> — другое: сравнить с <code>[0]</code>, <code>[1]</code>, … <span class="wrong">O(n)</span>. Массив хорош для индекса, но не для «есть ли такой».', nodes: [{ id: "i", kind: "gate", at: { zone: "idx", row: 0 }, state: "ok", label: "list[500]", detail: "1 шаг" }, { id: "s0", kind: "slot", at: { zone: "scan", row: 0 }, name: "[0]", value: "≠", accent: true }, { id: "s1", kind: "slot", at: { zone: "scan", row: 1 }, name: "[1]", value: "≠" }, { id: "s2", kind: "slot", at: { zone: "scan", row: 2 }, name: "…", value: "n сравн." }], edges: [] },
        { codeLine: 2, caption: 'Итог: <code>List</code> выбирают за <b>индекс</b> и порядок, а частое «членство» — повод взять <code>HashSet</code>. Один массив — две очень разные операции.', nodes: [{ id: "i", kind: "gate", at: { zone: "idx", row: 0 }, state: "ok", label: "индекс", detail: "O(1)", accent: true }, { id: "sc", kind: "gate", at: { zone: "scan", row: 0 }, state: "fail", label: "Contains", detail: "O(n)", accent: true }], edges: [] },
      ],
      explain: 'Один и тот же массив даёт две разные сложности. Индексатор <code>list[i]</code> — O(1) и amortized, и worst-case (таблица сложности: «<code>List&lt;T&gt;.Item[Int32]</code> — O(1) / O(1)»): адрес считается арифметикой. А <code>Contains</code>/<code>IndexOf</code> — линейный перебор O(n): сравнение с каждым элементом до совпадения. Поэтому <code>List</code> — правильный выбор, когда нужен доступ по индексу или сохранённый порядок вставки, но для частой проверки принадлежности он проигрывает <code>HashSet&lt;T&gt;</code> (O(1) Contains). Выбирать надо под доминирующую операцию, а не «по привычке к списку».',
      sources: ["ms-collections"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Capacity: 0 → 4 → 8 → 16 → 32; 1000 Add = 9 реаллокаций",
      viewBox: "0 0 340 214", zones: GROW_ZONES,
      code: ["var list = new List<int>();", "for (int i=0;i<1000;i++) list.Add(i);", "// печатаем Capacity на каждом её изменении", "// и считаем число реаллокаций"],
      predictAt: 1, predictQ: 'Сколько раз реаллоцируется внутренний массив за <b>1000</b> <code>Add</code> в пустой <code>List</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "0 → 4 → 8 → 16 → 32 …", caption: 'Реальный замер роста <code>Capacity</code>: <span class="hl">0 → 4 → 8 → 16 → 32</span> — удвоение после первой четвёрки (деталь реализации <code>List.cs</code>).', nodes: [{ id: "g0", kind: "gate", at: { zone: "grow", row: 0, col: 0 }, state: "ok", label: "1→4", detail: "" }, { id: "g1", kind: "gate", at: { zone: "grow", row: 0, col: 1 }, state: "ok", label: "5→8", detail: "" }, { id: "g2", kind: "gate", at: { zone: "grow", row: 0, col: 2 }, state: "ok", label: "9→16", detail: "" }, { id: "g3", kind: "gate", at: { zone: "grow", row: 0, col: 3 }, state: "ok", label: "17→32", detail: "×2", accent: true }], edges: [] },
        { codeLine: 3, out: "1000 Add -> 9 реаллокаций, Capacity=1024", caption: 'На 1000 <code>Add</code> массив реаллоцировался <span class="hl">всего 9 раз</span> (Capacity дошла до 1024). Не 1000 копирований — 9. Это и есть amortized O(1).', nodes: [{ id: "r", kind: "gate", at: { zone: "grow", row: 0, col: 0 }, state: "ok", label: "1000 Add", detail: "9 реаллок." }, { id: "cap", kind: "chip", at: { zone: "grow", row: 1, col: 0 }, value: "Capacity 1024", accent: true }], edges: [] },
        { codeLine: 3, out: "prealloc 1000: 0 реаллокаций", caption: '<code>new List&lt;int&gt;(1000)</code> — <span class="hl">0 реаллокаций</span>: место выделено сразу. Дока и советует «set the initial capacity to be the estimated size».', nodes: [{ id: "r", kind: "gate", at: { zone: "grow", row: 0, col: 0 }, state: "ok", label: "1000 Add", detail: "9 реаллок." }, { id: "p", kind: "gate", at: { zone: "grow", row: 0, col: 1 }, state: "ok", label: "prealloc", detail: "0 реаллок.", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятые числа. Рост <code>Capacity</code>: <b>0 → 4 → 8 → 16 → 32</b> (собственный прогон) — после первой аллокации на 4 массив <b>удваивается</b> (множитель ×2 — деталь реализации <code>List.cs</code>, не цитата доков, GT M8). Ключевой замер: <b>1000 Add = 9 реаллокаций</b> (Capacity 1024), а не 1000 — потому что каждое удвоение вдвое отдаляет следующее. Отсюда amortized O(1) на <code>Add</code>, хотя каждая отдельная реаллокация — O(n). Пред-выделение (<code>new List&lt;int&gt;(1000)</code>) даёт <b>0 реаллокаций</b>; дока: «The best way to avoid poor performance caused by multiple reallocations is to set the <b>initial capacity</b> to be the estimated size of the collection». Совпадает с примером Learn: 5 <code>Add</code> → Capacity 8, <code>TrimExcess()</code> → 5.',
      sources: ["ms-list-capacity", "ms-collections", "runtime-list"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var list = new List&lt;int&gt;(); for(int i=0;i&lt;5;i++) list.Add(i); int cap=list.Capacity; list.TrimExcess(); WriteLine($"Capacity: {cap}  after TrimExcess: {list.Capacity}");</code> — что напечатает? (пример из доков)',
      options: ["Capacity: 8  after TrimExcess: 5", "Capacity: 5  after TrimExcess: 5", "Capacity: 8  after TrimExcess: 8", "Capacity: 16  after TrimExcess: 5"], correctIndex: 0, xp: 10,
      okText: '5 <code>Add</code> в пустой список → Capacity <b>8</b> (рост 0→4→8). <code>TrimExcess</code> ужимает до Count → <b>5</b>. Ровно пример из документации.',
      noText: 'Рост Capacity скачками: 0→4 (первый Add), 4→8 (пятый). После 5 элементов Capacity=8. <code>TrimExcess</code> сжимает до Count=5. Вывод: <b>Capacity: 8  after TrimExcess: 5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Capacity: 8  after TrimExcess: 5" }, sourceRefs: ["ms-list-capacity"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Считаем реаллокации внутреннего массива: <code>var list=new List&lt;int&gt;(); int r=0,p=list.Capacity; for(int i=0;i&lt;1000;i++){ list.Add(i); if(list.Capacity!=p){r++; p=list.Capacity;} } WriteLine($"1000 Add -> {r} реаллокаций, финальная Capacity={list.Capacity}");</code> — что выведет?',
      options: ["1000 Add -> 9 реаллокаций, финальная Capacity=1024", "1000 Add -> 1000 реаллокаций, финальная Capacity=1000", "1000 Add -> 1 реаллокаций, финальная Capacity=1000", "1000 Add -> 250 реаллокаций, финальная Capacity=1024"], correctIndex: 0, xp: 10,
      okText: 'Удвоение (4→8→16→…→1024) даёт всего <b>9</b> реаллокаций на 1000 <code>Add</code>, финальная Capacity=1024. Не по копированию на элемент — вот почему <code>Add</code> amortized O(1).',
      noText: 'Массив удваивается: 4,8,16,32,64,128,256,512,1024 — 9 шагов роста покрывают 1000 элементов. Итог: <b>9 реаллокаций, Capacity=1024</b>. Реаллокаций logₐ(N), а не N.',
      verify: { kind: "exec", run: "dotnet run", expect: "1000 Add -> 9 реаллокаций, финальная Capacity=1024" }, sourceRefs: ["ms-list-capacity"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Пред-выделенная ёмкость: <code>var list=new List&lt;int&gt;(1000); int r=0,p=list.Capacity; for(int i=0;i&lt;1000;i++){ list.Add(i); if(list.Capacity!=p){r++;p=list.Capacity;} } WriteLine($"prealloc 1000: {r} реаллокаций");</code> — что выведет?',
      options: ["prealloc 1000: 0 реаллокаций", "prealloc 1000: 9 реаллокаций", "prealloc 1000: 1 реаллокаций", "prealloc 1000: 1000 реаллокаций"], correctIndex: 0, xp: 10,
      okText: '<code>new List&lt;int&gt;(1000)</code> выделяет массив сразу — 1000 <code>Add</code> помещаются без роста → <b>0 реаллокаций</b>. Именно это советует дока для горячего пути.',
      noText: 'Начальная Capacity=1000 покрывает все 1000 <code>Add</code>: <code>Count</code> не превышает <code>Capacity</code>, реаллокаций <b>0</b>. Пред-выделение убирает копирования — «set the initial capacity».',
      verify: { kind: "exec", run: "dotnet run", expect: "prealloc 1000: 0 реаллокаций" }, sourceRefs: ["ms-list-capacity"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Массив, не список", v: '<code>List&lt;T&gt;</code> — «accessed by index», generic-эквивалент <code>ArrayList</code>: данные в непрерывном <code>int[]</code>. Индекс <code>list[i]</code> — O(1) (адресная арифметика). Связный список — отдельный <code>LinkedList&lt;T&gt;</code>.' },
    { icon: "cost", k: "Capacity и рост", v: '<code>Capacity ≥ Count</code> всегда; запас амортизирует. Рост — реаллокация массива с копированием (×2 — деталь <code>List.cs</code>): реальный замер <b>0→4→8→16→32</b>, 1000 <code>Add</code> = <b>9</b> реаллокаций.' },
    { icon: "avoid", k: "Пред-выделяй и не ищи линейно", v: '<code>new List&lt;T&gt;(n)</code> → <b>0</b> реаллокаций (дока: «set the initial capacity»). <code>Contains</code>/<code>IndexOf</code> — O(n): для частого членства бери <code>HashSet</code>. Дубликаты и <code>null</code> разрешены.' },
  ],

  foot: 'урок · <b>List<T> изнутри</b> · 5 разборов · массив/Capacity/amortized Add · панель роста 0→4→8→16→32 · 1000 Add = 9 реаллок. · дизайн <b>mid</b>',
};
