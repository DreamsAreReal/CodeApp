/**
 * Lesson: Обзор коллекций .NET — generic vs non-generic (CS.S17.collections-overview).
 * The map of the collection families and the ONE axis that separates them: a generic
 * collection is type-safe at compile time and stores value types inline; a non-generic
 * collection stores everything as `object`, so a value type is BOXED going in and cast
 * going out. Same 1000 ints, two very different heap footprints.
 *
 * SIGNATURE machine panel (s5): a live GC.GetAllocatedBytesForCurrentThread() delta —
 * filling ArrayList with 1000 ints allocates 32056 bytes (1000 boxes) vs 4056 bytes for
 * List<int> (one int[]). REAL measurement, deterministic across runs
 * (evidence: scratchpad l1panel.cs, backend run-csharp, 2026-07-21).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../standard/collections/
 *     (fetch-verified 2026-07-21) — GT-M6-collections-core F1/F2/F3/F4/F8.
 *   - every card's `verify.expect` is REAL stdout of the backend run-csharp endpoint.
 *   - the panel numbers (32056 / 4056 bytes) are OWN GC.GetAllocatedBytesForCurrentThread
 *     measurements, not memorised.
 *   - 0 myths: List=array (not linked list, M2) stated with source; the boxing tax of
 *     non-generic value-type storage is framed as GT F14, not invented.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.collections-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1/s2: two lanes — generic (type-safe, inline value) vs non-generic (object, boxed).
const Z_GEN: Zone = { id: "gen", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "GENERIC · List<int>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "type-safe · инлайн", subCls: "vz-zsub good", subY: 47 };
const Z_NON: Zone = { id: "non", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "NON-GENERIC · ArrayList", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "элемент = object", subCls: "vz-zsub heap", subY: 47 };
const LANE_ZONES: Zone[] = [Z_GEN, Z_NON];

// s3: interface backbone — ICollection<T> / IEnumerable<T> feed foreach.
const Z_IFACE: Zone = { id: "iface", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "КОНТРАКТ", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "IEnumerable<T>", subCls: "vz-zsub", subY: 47 };
const Z_CONSUME: Zone = { id: "consume", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "foreach / LINQ", labelCls: "vz-zlabel good sm", lx: 257, ly: 24, sub: "movable pointer", subCls: "vz-zsub good", subY: 47 };
const IFACE_ZONES: Zone[] = [Z_IFACE, Z_CONSUME];

// s4: the choose-a-collection map — scenario picks a family.
const Z_MAP: Zone = { id: "map", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ВЫБОР СЕМЕЙСТВА · сценарий → тип", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "generic по умолчанию", subCls: "vz-zsub", subY: 47 };
const MAP_ZONES: Zone[] = [Z_MAP];

// s5 (SIGNATURE): the boxing-tax counter — two lanes, one measured number each.
const Z_BOX_GEN: Zone = { id: "boxGen", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "List<int> · int[]", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub good", subY: 47 };
const Z_BOX_NON: Zone = { id: "boxNon", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ArrayList · 1000 box", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub heap", subY: 47 };
const BOX_ZONES: Zone[] = [Z_BOX_GEN, Z_BOX_NON];

export const collectionsOverview: LessonData = {
  id: "CS.S17.collections-overview",
  track: "CS",
  section: "CS.S17",
  module: "S17.1",
  lang: "csharp",
  title: "Обзор коллекций .NET: generic vs non-generic",
  kicker: "C# вглубь · S17 · карта семейств",
  home: { subtitle: "generic vs non-generic, контракт, цена боксинга", icon: "collections", estMinutes: 9 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-collections", kind: "doc", org: "Microsoft Learn", title: "Collections and Data Structures", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/", date: "2026-03-30" },
    { id: "ms-hashtable-dict", kind: "doc", org: "Microsoft Learn", title: "Hashtable and Dictionary Collection Types", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/hashtable-and-dictionary-collection-types", date: "2026-03-30" },
    { id: "ms-alloc-bytes", kind: "doc", org: "Microsoft Learn", title: "GC.GetAllocatedBytesForCurrentThread Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.gc.getallocatedbytesforcurrentthread", date: "2025-07-01" },
  ],

  spec: [
    { text: "«There are two main types of collections; generic collections and non-generic collections. Generic collections are type-safe at compile time.»", source: "ms-collections" },
    { text: "«In general, you should use generic collections.»", source: "ms-collections" },
  ],
  edgeCases: [
    { text: "Non-generic (<code>ArrayList</code>, <code>Hashtable</code>) хранят элемент как <code>object</code> — value-тип <b>боксится</b> при вставке и требует приведения при чтении.", source: "ms-hashtable-dict" },
    { text: "Любая коллекция, реализующая <code>IEnumerable&lt;T&gt;</code>, — <i>queryable</i>: работает <code>foreach</code> и LINQ. Энумератор — «movable pointer to any element».", source: "ms-collections" },
    { text: "<code>List&lt;T&gt;</code> — это <b>массив</b> под капотом, не связный список: индекс O(1); для последовательного доступа есть отдельный <code>LinkedList&lt;T&gt;</code>.", source: "ms-collections" },
  ],

  misconceptions: [
    {
      wrong: "generic и non-generic коллекции — одно и то же, разница только в синтаксисе",
      hook: 'Non-generic <code>ArrayList</code> и generic <code>List&lt;int&gt;</code> дают одинаковый API, но платят по-разному. Дока проводит границу прямо: «There are two main types of collections; generic collections and non-generic collections. <span class="hl">Generic collections are type-safe at compile time</span>». Non-generic хранят элемент как <code>object</code> — каждый <code>int</code> <span class="wrong">упаковывается в кучу</span>. Дальше <b>пять разборов</b>: две дорожки хранения, контракт <code>IEnumerable&lt;T&gt;</code>, карта выбора и <b>машинная панель</b> — реально снятый счётчик: 1000 <code>int</code> в <code>ArrayList</code> = <b>32056 байт</b> кучи против <b>4056</b> у <code>List&lt;int&gt;</code>.',
      source: "ms-collections",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Ось · два семейства", title: "Две ветки: generic type-safe, non-generic хранит object",
      viewBox: "0 0 340 210", zones: LANE_ZONES,
      code: ["var g = new List<int>();      // generic", "var n = new ArrayList();      // non-generic", "g.Add(1);   // int лежит inline в int[]", "n.Add(1);   // int боксится в object"],
      scenes: [
        { codeLine: 1, caption: 'Два семейства коллекций. Слева — <b>generic</b> <code>List&lt;int&gt;</code>: параметр типа <code>int</code> фиксирован на компиляции. Справа — <b>non-generic</b> <code>ArrayList</code>: элемент всегда <code>object</code>.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "T = int", accent: true }, { id: "n", kind: "obj", at: { zone: "non", row: 0 }, typeTag: "ArrayList", value: "T = object" }], edges: [] },
        { codeLine: 2, caption: '<code>g.Add(1)</code>: <code>int</code> ложится <span class="hl">inline</span> в <code>int[]</code> — без заголовка объекта, без кучи per-элемент.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "T = int" }, { id: "gi", kind: "slot", at: { zone: "gen", row: 1 }, name: "[0]", value: "1", accent: true }, { id: "n", kind: "obj", at: { zone: "non", row: 0 }, typeTag: "ArrayList", value: "T = object" }], edges: [] },
        { codeLine: 3, caption: '<code>n.Add(1)</code>: элемент — <code>object</code>, поэтому <code>int</code> <span class="wrong">боксится</span> — уходит в кучу отдельным объектом, а слот держит на него ссылку.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "T = int" }, { id: "gi", kind: "slot", at: { zone: "gen", row: 1 }, name: "[0]", value: "1" }, { id: "n", kind: "obj", at: { zone: "non", row: 0 }, typeTag: "ArrayList", value: "T = object" }, { id: "ni", kind: "ref", at: { zone: "non", row: 1 }, name: "[0]", value: "box", accent: true }], edges: [] },
      ],
      explain: 'Верхнеуровневая карта коллекций стоит на одной оси: «There are <b>two main types</b> of collections; generic collections and non-generic collections. Generic collections are <span class="hl">type-safe at compile time</span>. Because of this, generic collections typically offer better performance». Generic принимают параметр типа и «don\'t require that you cast to and from the <code>Object</code> type». Non-generic «store items as <code>Object</code>, require casting» — а для value-типа хранение как <code>object</code> означает boxing на вставке и unboxing на чтении. Это не стиль, а разные машинные затраты.',
      sources: ["ms-collections", "ms-hashtable-dict"],
    },
    {
      id: "s2", num: "02", kicker: "Цена · boxing на чтении", title: "Non-generic заставляет приводить тип обратно",
      viewBox: "0 0 340 210", zones: LANE_ZONES,
      code: ["foreach (int x in g) sum += x;      // generic: без cast", "foreach (object o in n) sum += (int)o; // unbox", "// оба дают 6, но n прошёл через кучу и cast"],
      predictAt: 2, predictQ: 'Оба цикла суммируют <code>{1,2,3}</code>. Что напечатает <code>WriteLine($"{sumG} {sumN}")</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<b>generic</b>: <code>foreach (int x in g)</code> — <code>x</code> уже <code>int</code>, компилятор знает тип, приведения нет.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "1 2 3", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<b>non-generic</b>: элемент — <code>object</code>, чтобы сложить, нужен <span class="wrong">unbox</span> <code>(int)o</code> — распаковка из кучи обратно в значение.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "1 2 3" }, { id: "n", kind: "obj", at: { zone: "non", row: 0 }, typeTag: "ArrayList", value: "obj obj obj" }, { id: "gate", kind: "gate", at: { zone: "non", row: 1 }, state: "fail", label: "(int)o", detail: "unbox", accent: true }], edges: [] },
        { codeLine: 2, out: "6 6", caption: 'Результат одинаков — <b>6 6</b> — но у <code>ArrayList</code> к нему шли через кучу и приведение. Одна и та же логика, разная цена (реальный прогон).', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "sum 6", accent: true }, { id: "n", kind: "obj", at: { zone: "non", row: 0 }, typeTag: "ArrayList", value: "sum 6", accent: true }], edges: [] },
      ],
      explain: 'Type-safety generic-коллекции — это не только «нельзя положить строку в <code>List&lt;int&gt;</code>»; это отсутствие приведений на горячем пути. Non-generic «require casting»: у <code>ArrayList</code> каждый элемент — <code>object</code>, и суммирование требует <code>(int)o</code>. Для value-типа это ещё и unboxing — чтение из упакованного в куче объекта. Оба цикла печатают <code>6 6</code>, но generic прошёл без единого cast, а non-generic — через кучу и распаковку. Дока и рекомендует по умолчанию generic именно поэтому.',
      sources: ["ms-collections", "ms-hashtable-dict"],
    },
    {
      id: "s3", num: "03", kicker: "Контракт · перечисление", title: "IEnumerable<T> — общий двигатель foreach и LINQ",
      viewBox: "0 0 340 210", zones: IFACE_ZONES,
      code: ["// любая коллекция реализует IEnumerable(<T>)", "foreach (var x in coll) { ... }   // GetEnumerator()", "coll.Where(x => x > 0);           // LINQ, если <T>"],
      scenes: [
        { codeLine: 0, caption: 'Каждая .NET-коллекция реализует <code>IEnumerable</code> или <code>IEnumerable&lt;T&gt;</code>. Энумератор — «movable pointer to any element in the collection».', nodes: [{ id: "coll", kind: "obj", at: { zone: "iface", row: 0 }, typeTag: "IEnumerable<T>", value: "GetEnumerator", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>foreach</code> берёт энумератор через <code>GetEnumerator()</code> и «hide the complexity of manipulating the enumerator» — двигает указатель за тебя.', nodes: [{ id: "coll", kind: "obj", at: { zone: "iface", row: 0 }, typeTag: "IEnumerable<T>", value: "GetEnumerator" }, { id: "fe", kind: "chip", at: { zone: "consume", row: 0 }, value: "foreach", accent: true }], edges: [{ id: "e1", from: "coll", to: "fe" }] },
        { codeLine: 2, caption: 'Реализующий <code>IEnumerable&lt;T&gt;</code> тип «is considered a <span class="hl">queryable type</span>» — к нему применим LINQ: <code>Where</code>, <code>Select</code>, <code>OrderBy</code>.', nodes: [{ id: "coll", kind: "obj", at: { zone: "iface", row: 0 }, typeTag: "IEnumerable<T>", value: "GetEnumerator" }, { id: "fe", kind: "chip", at: { zone: "consume", row: 0 }, value: "foreach" }, { id: "linq", kind: "chip", at: { zone: "consume", row: 1 }, value: "LINQ Where", accent: true }], edges: [{ id: "e1", from: "coll", to: "fe" }, { id: "e2", from: "coll", to: "linq", accent: true }] },
      ],
      explain: 'То, что делает семейство коллекций единым, — интерфейс перечисления: «.NET collections either implement <code>System.Collections.IEnumerable</code> or <code>System.Collections.Generic.IEnumerable&lt;T&gt;</code> to enable the collection to be iterated through. An enumerator can be thought of as a <span class="hl">movable pointer</span> to any element in the collection». <code>foreach</code> «use the enumerator exposed by the <code>GetEnumerator</code> method and hide the complexity of manipulating the enumerator». А любой тип с <code>IEnumerable&lt;T&gt;</code> «is considered a queryable type and can be queried with LINQ» — поэтому один контракт даёт и цикл, и запросы.',
      sources: ["ms-collections"],
    },
    {
      id: "s4", num: "04", kicker: "Карта · выбор по сценарию", title: "Сценарий выбирает семейство, не наоборот",
      viewBox: "0 0 340 210", zones: MAP_ZONES,
      code: ["// key/value быстрый поиск  -> Dictionary<K,V>", "// доступ по индексу        -> List<T>", "// множество без дублей     -> HashSet<T>", "// FIFO / LIFO              -> Queue<T> / Stack<T>"],
      scenes: [
        { codeLine: 0, caption: 'Дока предлагает выбирать <span class="hl">от сценария</span>. «Store items as key/value pairs for quick look-up by key» → <code>Dictionary&lt;TKey,TValue&gt;</code>.', nodes: [{ id: "kv", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "key/value" }, { id: "dict", kind: "obj", at: { zone: "map", row: 0, col: 1 }, typeTag: "Dictionary", value: "K,V", accent: true }], edges: [{ id: "e1", from: "kv", to: "dict", accent: true }] },
        { codeLine: 1, caption: '«Access items by index» → <code>List&lt;T&gt;</code> (non-generic аналог — <code>Array</code>/<code>ArrayList</code>). Массив под капотом, индекс O(1).', nodes: [{ id: "kv", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "key/value" }, { id: "dict", kind: "obj", at: { zone: "map", row: 0, col: 1 }, typeTag: "Dictionary", value: "K,V" }, { id: "idx", kind: "chip", at: { zone: "map", row: 1, col: 0 }, value: "по индексу" }, { id: "list", kind: "obj", at: { zone: "map", row: 1, col: 1 }, typeTag: "List<T>", value: "index O(1)", accent: true }], edges: [{ id: "e1", from: "kv", to: "dict" }, { id: "e2", from: "idx", to: "list", accent: true }] },
        { codeLine: 3, caption: '«A set for mathematical functions» → <code>HashSet&lt;T&gt;</code>; FIFO → <code>Queue&lt;T&gt;</code>, LIFO → <code>Stack&lt;T&gt;</code>. Общее правило: «you should use <b>generic</b> collections».', nodes: [{ id: "idx", kind: "chip", at: { zone: "map", row: 0, col: 0 }, value: "по индексу" }, { id: "list", kind: "obj", at: { zone: "map", row: 0, col: 1 }, typeTag: "List<T>", value: "index O(1)" }, { id: "set", kind: "chip", at: { zone: "map", row: 1, col: 0 }, value: "множество" }, { id: "hs", kind: "obj", at: { zone: "map", row: 1, col: 1 }, typeTag: "HashSet<T>", value: "без дублей", accent: true }], edges: [{ id: "e3", from: "set", to: "hs", accent: true }] },
      ],
      explain: 'Учебник выбора коллекции идёт от задачи к типу: «you should use generic collections… The following table describes some common collection scenarios». Ключевые строки: «Store items as key/value pairs for quick look-up by key» → <code>Dictionary&lt;TKey,TValue&gt;</code> (non-generic <code>Hashtable</code>); «Access items by index» → <code>List&lt;T&gt;</code> (<code>Array</code>/<code>ArrayList</code>); «A set for mathematical functions» → <code>HashSet&lt;T&gt;</code>/<code>SortedSet&lt;T&gt;</code>. Отдельная страница «selecting a collection class» добавляет ось алгоритмической сложности — но дефолт всегда generic.',
      sources: ["ms-collections"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Цена боксинга: 32056 байт против 4056 на 1000 int",
      viewBox: "0 0 340 214", zones: BOX_ZONES,
      code: ["b0 = GC.GetAllocatedBytesForCurrentThread();", "for (int i=0;i<1000;i++) al.Add(i);   // ArrayList", "b1 = GC.GetAllocatedBytesForCurrentThread();", "for (int i=0;i<1000;i++) list.Add(i); // List<int>", "b2 = GC.GetAllocatedBytesForCurrentThread();"],
      predictAt: 2, predictQ: 'Сколько байт кучи стоит залить <b>1000 int</b> в <code>List&lt;int&gt;</code> (один <code>int[]</code>)?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Заливаем 1000 <code>int</code> в <code>ArrayList</code> и меряем прирост живым счётчиком <code>GC.GetAllocatedBytesForCurrentThread()</code>.', nodes: [{ id: "al", kind: "gate", at: { zone: "boxNon", row: 0 }, state: "fail", label: "ArrayList.Add ×1000", detail: "замер…" }], edges: [] },
        { codeLine: 2, out: "ArrayList<obj>: 32056 bytes", caption: '<code>ArrayList</code> — <span class="wrong">32056 байт</span>: 1000 <code>int</code> упакованы в 1000 отдельных boxed-объектов в куче плюс массив ссылок.', nodes: [{ id: "al", kind: "gate", at: { zone: "boxNon", row: 0 }, state: "fail", label: "ArrayList", detail: "32056 байт" }, { id: "b1", kind: "chip", at: { zone: "boxNon", row: 1 }, value: "1000 box", accent: true }], edges: [] },
        { codeLine: 3, out: "List<int>: 4056 bytes", caption: '<code>List&lt;int&gt;</code> — <span class="hl">4056 байт</span>: значения лежат inline в одном <code>int[]</code>, ни одного box. Разница ×8 на ровном месте.', nodes: [{ id: "al", kind: "gate", at: { zone: "boxNon", row: 0 }, state: "fail", label: "ArrayList", detail: "32056 байт" }, { id: "li", kind: "gate", at: { zone: "boxGen", row: 0 }, state: "ok", label: "List<int>", detail: "4056 байт" }, { id: "b2", kind: "chip", at: { zone: "boxGen", row: 1 }, value: "один int[]", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — реально снятое число. <code>GC.GetAllocatedBytesForCurrentThread()</code> «returns the number of bytes allocated on the current managed thread»; вокруг двух заливок оно даёт <b>ArrayList: 32056 bytes</b> и <b>List&lt;int&gt;: 4056 bytes</b> (собственный прогон). Разница — это boxing: у <code>Hashtable</code>/<code>ArrayList</code> «elements … are of type <code>Object</code>; therefore, boxing and unboxing typically occur when you store or retrieve a value type». Каждый <code>int</code> в <code>ArrayList</code> стал отдельным объектом в куче; в <code>List&lt;int&gt;</code> все 1000 лежат в одном массиве. Вот что стоит за словами «better performance».',
      sources: ["ms-alloc-bytes", "ms-hashtable-dict"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var al = new ArrayList(); al.Add(1); al.Add(2); al.Add(3); int s=0; foreach(object o in al) s+=(int)o;</code><br/>то же для <code>List&lt;int&gt;</code> в <code>s2</code>. <code>WriteLine($"{s} {s2}")</code> — что напечатает?',
      options: ["6 6", "3 3", "0 6", "6 0"], correctIndex: 0, xp: 10,
      okText: 'Оба суммируют <code>{1,2,3}</code> → <b>6 6</b>. Разница не в результате, а в цене: <code>ArrayList</code> боксил каждый <code>int</code> и требовал <code>(int)o</code>, <code>List&lt;int&gt;</code> — ни того, ни другого.',
      noText: 'Логика одинакова, вывод — <b>6 6</b>. Ключ урока в том, что <code>ArrayList</code> хранит <code>object</code> (boxing + cast), а <code>List&lt;int&gt;</code> — inline, но сумма та же.',
      verify: { kind: "exec", run: "dotnet run", expect: "6 6" }, sourceRefs: ["ms-collections"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var list = new List&lt;int&gt; { 10, 20, 30 }; Console.WriteLine(list.Count); Console.WriteLine(list is IEnumerable&lt;int&gt;);</code> — что напечатает (две строки)?',
      options: ["3\\nTrue", "3\\nFalse", "30\\nTrue", "0\\nTrue"], correctIndex: 0, xp: 10,
      okText: '<code>Count</code> = <b>3</b>; и <code>List&lt;int&gt;</code> реализует <code>IEnumerable&lt;int&gt;</code> → <b>True</b>. Именно этот интерфейс делает тип «queryable» — доступным для <code>foreach</code> и LINQ.',
      noText: 'Три элемента → <code>Count</code> = 3. <code>List&lt;T&gt;</code> реализует <code>IEnumerable&lt;T&gt;</code>, поэтому <code>is IEnumerable&lt;int&gt;</code> → <b>True</b>. Вывод: <code>3</code>, затем <code>True</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "3\nTrue" }, sourceRefs: ["ms-collections"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Замер: <code>b0=GC.GetAllocatedBytesForCurrentThread(); var list=new List&lt;int&gt;(1000); for(int i=0;i&lt;1000;i++) list.Add(i); b1=GC.GetAllocatedBytesForCurrentThread(); WriteLine($"List&lt;int&gt;: {b1-b0} bytes");</code> (после прогрева JIT) — что напечатает?',
      options: ["List<int>: 4056 bytes", "List<int>: 32056 bytes", "List<int>: 0 bytes", "List<int>: 24000 bytes"], correctIndex: 0, xp: 10,
      okText: '<code>List&lt;int&gt;</code> держит значения inline в одном <code>int[]</code> — <span class="hl">4056 байт</span> на 1000 <code>int</code> (массив + заголовок). Никакого boxing: ×8 меньше, чем у <code>ArrayList</code> (32056).',
      noText: '1000 <code>int</code> лежат в одном массиве, не по объекту на элемент — <b>4056 байт</b> (реальный замер). 32056 — это <code>ArrayList</code>, где каждый <code>int</code> упакован в куче отдельно.',
      verify: { kind: "exec", run: "dotnet run", expect: "List<int>: 4056 bytes" }, sourceRefs: ["ms-alloc-bytes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Ось семейств", v: '<b>generic</b> (<code>List&lt;T&gt;</code>, <code>Dictionary&lt;K,V&gt;</code>) — «type-safe at compile time», хранят <code>T</code> без приведений; <b>non-generic</b> (<code>ArrayList</code>, <code>Hashtable</code>) — элемент <code>object</code>, cast + boxing. Дефолт — generic.' },
    { icon: "cost", k: "Цена боксинга", v: '1000 <code>int</code> в <code>ArrayList</code> = <b>32056 байт</b> кучи (1000 box), в <code>List&lt;int&gt;</code> = <b>4056</b> (один <code>int[]</code>) — реальный замер. «Better performance» — это про эту разницу.' },
    { icon: "avoid", k: "Контракт", v: 'Единый двигатель — <code>IEnumerable&lt;T&gt;</code>: даёт <code>foreach</code> (энумератор — «movable pointer») и делает тип queryable для LINQ. <code>List&lt;T&gt;</code> — <b>массив</b>, не связный список.' },
  ],

  foot: 'урок · <b>обзор коллекций</b> · 5 разборов · generic vs non-generic · панель боксинга 32056 vs 4056 байт · дизайн <b>mid</b>',
};
