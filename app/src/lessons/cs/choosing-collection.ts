/**
 * Lesson: Выбор коллекции по алгоритмической сложности (CS.S17.choosing-collection).
 * The decision is not taste — it is the amortized/worst-case complexity table. Membership
 * (`Contains`) is the sharpest example: List<T> is a LINEAR scan, HashSet<T>/Dictionary
 * jump straight to a bucket. The lesson walks the "consider the following questions" flow
 * and lands on a REAL comparison-count panel.
 *
 * SIGNATURE machine panel (s4): a deterministic Equals-call counter (a Probe key that
 * increments a static counter in Equals). Contains(absent) over 1000 items: List = 1000
 * Equals calls (full O(n) scan), HashSet = 0 (empty bucket, never compares). Contains(found
 * @ index 500): List = 501, HashSet = 1. REAL measurements, reproducible
 * (evidence: scratchpad l2count.cs / l2found.cs, backend run-csharp, 2026-07-21).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from selecting-a-collection-class + collections/ index
 *     (fetch-verified 2026-07-21) — GT-M6-collections-core F5/F6/F7.
 *   - card verify.expect = REAL run-csharp stdout; anti-echo (numbers are computed).
 *   - the O(1)/O(n) complexities come from the collections-index complexity table (F7);
 *     the comparison counts (1000/0, 501/1) are OWN measurements, framed as such.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.choosing-collection/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the question funnel — scenario narrows to a family.
const Z_Q: Zone = { id: "q", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВОПРОС", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "consider the questions", subCls: "vz-zsub", subY: 47 };
const Z_PICK: Zone = { id: "pick", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "ТИП", labelCls: "vz-zlabel good sm", lx: 257, ly: 24, sub: "generic по умолчанию", subCls: "vz-zsub good", subY: 47 };
const FUNNEL_ZONES: Zone[] = [Z_Q, Z_PICK];

// s2: the complexity table as two lanes — amortized vs worst case.
const Z_AMORT: Zone = { id: "amort", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AMORTIZED", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "обычный путь", subCls: "vz-zsub good", subY: 47 };
const Z_WORST: Zone = { id: "worst", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "WORST CASE", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "коллизии / resize", subCls: "vz-zsub heap", subY: 47 };
const COMPLEXITY_ZONES: Zone[] = [Z_AMORT, Z_WORST];

// s3: membership — List linear walk vs HashSet bucket jump.
const Z_WALK: Zone = { id: "walk", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List · линейный обход", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "O(n)", subCls: "vz-zsub heap", subY: 47 };
const Z_JUMP: Zone = { id: "jump", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HashSet · бакет", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "O(1)", subCls: "vz-zsub good", subY: 47 };
const MEMBER_ZONES: Zone[] = [Z_WALK, Z_JUMP];

// s4 (SIGNATURE): the comparison-count panel — one measured number per lane.
const Z_CNT_LIST: Zone = { id: "cntList", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List.Contains", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "Equals-вызовы", subCls: "vz-zsub heap", subY: 47 };
const Z_CNT_SET: Zone = { id: "cntSet", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HashSet.Contains", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Equals-вызовы", subCls: "vz-zsub good", subY: 47 };
const COUNT_ZONES: Zone[] = [Z_CNT_LIST, Z_CNT_SET];

export const choosingCollection: LessonData = {
  id: "CS.S17.choosing-collection",
  track: "CS",
  section: "CS.S17",
  module: "S17.2",
  lang: "csharp",
  title: "Выбор коллекции: алгоритмическая сложность",
  kicker: "C# вглубь · S17 · O() решает",
  home: { subtitle: "amortized vs worst-case, List vs Dictionary vs HashSet", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S17.collections-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-selecting", kind: "doc", org: "Microsoft Learn", title: "Selecting a Collection Class", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/selecting-a-collection-class", date: "2026-03-30" },
    { id: "ms-collections", kind: "doc", org: "Microsoft Learn", title: "Collections and Data Structures", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/", date: "2026-03-30" },
    { id: "ms-hashset-contains", kind: "doc", org: "Microsoft Learn", title: "HashSet<T>.Contains(T) Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1.contains", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Be sure to choose your collection class carefully. Using the wrong type can restrict your use of the collection.» <span class=\"ru-tr\">«Обязательно тщательно выбирайте класс коллекции. Использование неподходящего типа может ограничить возможности работы с коллекцией.»</span>", source: "ms-selecting" },
    { text: "«Avoid using the types in the System.Collections namespace. The generic and concurrent versions of the collections are recommended because of their greater type safety and other improvements.» <span class=\"ru-tr\">«Избегайте использования типов из пространства имён System.Collections. Рекомендуются generic- и concurrent-версии коллекций из-за их большей типобезопасности и других улучшений.»</span>", source: "ms-selecting" },
  ],
  edgeCases: [
    { text: "<code>List&lt;T&gt;.Item[Int32]</code> — O(1) и amortized, и worst-case (индекс в массив). А вот <code>List&lt;T&gt;.Contains</code> — <b>линейный</b> перебор, O(n).", source: "ms-collections" },
    { text: "<code>Dictionary&lt;T&gt;</code> lookup — O(1) amortized, но worst-case «O(1) – or strictly O(n)»: при массовых коллизиях бакет вырождается в список.", source: "ms-collections" },
    { text: "«<code>Dictionary&lt;TKey,TValue&gt;</code> … provides faster lookup than the <code>SortedDictionary&lt;TKey,TValue&gt;</code>» <span class=\"ru-tr\">«<code>Dictionary&lt;TKey,TValue&gt;</code> … обеспечивает более быстрый поиск, чем <code>SortedDictionary&lt;TKey,TValue&gt;</code>»</span>: хеш быстрее дерева на поиск, но не хранит порядок.", source: "ms-selecting" },
  ],

  misconceptions: [
    {
      wrong: "любая коллекция ищет элемент примерно одинаково — разница только в удобстве API",
      hook: 'Кажется, что <code>list.Contains(x)</code> и <code>set.Contains(x)</code> — «одно и то же с разным синтаксисом». Машинно это <span class="wrong">разные алгоритмы</span>: <code>List&lt;T&gt;</code> перебирает элементы по одному (O(n)), <code>HashSet&lt;T&gt;</code> прыгает сразу в бакет по хешу (O(1)). Дока прямо предупреждает: «Be sure to <span class="hl">choose your collection class carefully</span>. Using the wrong type can restrict your use of the collection». <span class="ru-tr">«Обязательно тщательно выбирайте класс коллекции. Использование неподходящего типа может ограничить возможности работы с коллекцией».</span> Дальше <b>четыре разбора</b>: воронка вопросов, таблица amortized vs worst-case, линейный обход против бакета и <b>машинная панель</b> — реально снятый счётчик <code>Equals</code>: поиск отсутствующего среди 1000 = <b>1000</b> сравнений у <code>List</code> против <b>0</b> у <code>HashSet</code>.',
      source: "ms-selecting",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Воронка · вопрос → тип", title: "Дока выбирает от вопроса, а не от привычки",
      viewBox: "0 0 340 210", zones: FUNNEL_ZONES,
      code: ["// доступ по индексу?      -> List<T>", "// поиск по ключу?         -> Dictionary<K,V>", "// быстрый поиск/членство?  -> HashSet<T> / Dictionary", "// FIFO / LIFO?            -> Queue<T> / Stack<T>"],
      scenes: [
        { codeLine: 0, caption: '«Do you need to <b>access each element by index</b>?» <span class="ru-tr">«Нужен ли вам <b>доступ к каждому элементу по индексу</b>?»</span> → <code>List&lt;T&gt;</code> (и <code>ArrayList</code>): доступ по zero-based индексу.', nodes: [{ id: "qi", kind: "chip", at: { zone: "q", row: 0 }, value: "по индексу?" }, { id: "list", kind: "obj", at: { zone: "pick", row: 0 }, typeTag: "List<T>", value: "index O(1)", accent: true }], edges: [{ id: "e1", from: "qi", to: "list", accent: true }] },
        { codeLine: 1, caption: '«access to their elements <b>by the key</b>» <span class="ru-tr">«доступ к их элементам <b>по ключу</b>»</span> → <code>Dictionary&lt;TKey,TValue&gt;</code>: доступ по ключу, поиск через хеш.', nodes: [{ id: "qi", kind: "chip", at: { zone: "q", row: 0 }, value: "по индексу?" }, { id: "list", kind: "obj", at: { zone: "pick", row: 0 }, typeTag: "List<T>", value: "index O(1)" }, { id: "qk", kind: "chip", at: { zone: "q", row: 1 }, value: "по ключу?" }, { id: "dict", kind: "obj", at: { zone: "pick", row: 1 }, typeTag: "Dictionary", value: "key O(1)", accent: true }], edges: [{ id: "e1", from: "qi", to: "list" }, { id: "e2", from: "qk", to: "dict", accent: true }] },
        { codeLine: 2, caption: '«Do you need <b>fast searches and retrieval</b>?» <span class="ru-tr">«Нужны ли вам <b>быстрый поиск и извлечение</b>?»</span> → хеш-типы: <code>Dictionary</code> «faster lookup than the <code>SortedDictionary</code>» <span class="ru-tr">«более быстрый поиск, чем у <code>SortedDictionary</code>»</span>. Общий совет: избегать <code>System.Collections</code>, брать generic.', nodes: [{ id: "qk", kind: "chip", at: { zone: "q", row: 0 }, value: "по ключу?" }, { id: "dict", kind: "obj", at: { zone: "pick", row: 0 }, typeTag: "Dictionary", value: "key O(1)" }, { id: "qs", kind: "chip", at: { zone: "q", row: 1 }, value: "быстрый поиск?" }, { id: "hash", kind: "obj", at: { zone: "pick", row: 1 }, typeTag: "hash-типы", value: "O(1)", accent: true }], edges: [{ id: "e2", from: "qk", to: "dict" }, { id: "e3", from: "qs", to: "hash", accent: true }] },
      ],
      explain: 'Страница «Selecting a Collection Class» <span class="ru-tr">«Выбор класса коллекции»</span> устроена как воронка вопросов: «Be sure to choose your collection class carefully. Using the wrong type can restrict your use of the collection». <span class="ru-tr">«Обязательно тщательно выбирайте класс коллекции. Использование неподходящего типа может ограничить возможности работы с коллекцией».</span> Дальше «Consider the following questions» <span class="ru-tr">«Рассмотрите следующие вопросы»</span>: нужен доступ по индексу → <code>List&lt;T&gt;</code>; по ключу → <code>Dictionary&lt;TKey,TValue&gt;</code>; «Do you need fast searches and retrieval of information?» <span class="ru-tr">«Нужны ли вам быстрый поиск и извлечение информации?»</span> → хеш-типы, где «The <code>Dictionary&lt;TKey,TValue&gt;</code> generic class provides <span class="hl">faster lookup</span> than the <code>SortedDictionary&lt;TKey,TValue&gt;</code>». <span class="ru-tr">«Обобщённый класс <code>Dictionary&lt;TKey,TValue&gt;</code> обеспечивает более быстрый поиск, чем <code>SortedDictionary&lt;TKey,TValue&gt;</code>».</span> И общий императив: «Avoid using the types in the <code>System.Collections</code> namespace». <span class="ru-tr">«Избегайте использования типов из пространства имён <code>System.Collections</code>».</span>',
      sources: ["ms-selecting"],
    },
    {
      id: "s2", num: "02", kicker: "Две колонки · amortized vs worst", title: "У сложности два числа: обычный путь и худший",
      viewBox: "0 0 340 210", zones: COMPLEXITY_ZONES,
      code: ["List<T>.Add           : O(1) / O(n)   // amortized / worst", "List<T>.Item[Int32]   : O(1) / O(1)", "HashSet<T>.Add,lookup : O(1) / O(n)", "Dictionary<T> lookup  : O(1) / O(1)-or-O(n)"],
      scenes: [
        { codeLine: 0, caption: '<code>List&lt;T&gt;.Add</code>: <span class="hl">O(1)</span> amortized, но <span class="wrong">O(n)</span> в худшем — когда ёмкость переполнена и массив реаллоцируется.', nodes: [{ id: "add1", kind: "gate", at: { zone: "amort", row: 0 }, state: "ok", label: "List.Add", detail: "O(1)" }, { id: "add2", kind: "gate", at: { zone: "worst", row: 0 }, state: "fail", label: "resize", detail: "O(n)", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>List&lt;T&gt;.Item[Int32]</code>: <b>O(1) / O(1)</b> — индексация в массив всегда за константу, и обычно, и в худшем.', nodes: [{ id: "add1", kind: "gate", at: { zone: "amort", row: 0 }, state: "ok", label: "List.Add", detail: "O(1)" }, { id: "add2", kind: "gate", at: { zone: "worst", row: 0 }, state: "fail", label: "resize", detail: "O(n)" }, { id: "idx1", kind: "gate", at: { zone: "amort", row: 1 }, state: "ok", label: "List[i]", detail: "O(1)" }, { id: "idx2", kind: "gate", at: { zone: "worst", row: 1 }, state: "ok", label: "List[i]", detail: "O(1)", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>Dictionary&lt;T&gt;</code> lookup: O(1) amortized, worst-case дока пишет как «<span class="wrong">O(1) – or strictly O(n)</span>» — деградация при массовых коллизиях в один бакет.', nodes: [{ id: "d1", kind: "gate", at: { zone: "amort", row: 0 }, state: "ok", label: "Dict lookup", detail: "O(1)" }, { id: "d2", kind: "gate", at: { zone: "worst", row: 0 }, state: "fail", label: "коллизии", detail: "O(n)", accent: true }, { id: "hs1", kind: "gate", at: { zone: "amort", row: 1 }, state: "ok", label: "HashSet", detail: "O(1)" }, { id: "hs2", kind: "gate", at: { zone: "worst", row: 1 }, state: "fail", label: "HashSet", detail: "O(n)" }], edges: [] },
      ],
      explain: 'Таблица «Algorithmic complexity of collections» <span class="ru-tr">«Алгоритмическая сложность коллекций»</span> даёт по <b>два</b> числа на операцию — amortized и worst case. <code>List&lt;T&gt;.Add</code> — <code>O(1)</code> / <code>O(n)</code> (O(n) на reallocate), <code>List&lt;T&gt;.Item[Int32]</code> — <code>O(1)</code> / <code>O(1)</code>, <code>HashSet&lt;T&gt;.Add, lookup</code> — <code>O(1)</code> / <code>O(n)</code>, а <code>Dictionary&lt;T&gt;</code> lookup — <code>O(1)</code> / «<code>O(1) – or strictly O(n)</code>». Худший случай хеша — коллизии: много ключей в один бакет вырождают поиск в линейный. Выбор по «обычному» O() без взгляда на worst-case — источник неожиданных провалов под нагрузкой.',
      sources: ["ms-collections"],
    },
    {
      id: "s3", num: "03", kicker: "Членство · обход vs прыжок", title: "List.Contains идёт по всем, HashSet — в бакет",
      viewBox: "0 0 340 210", zones: MEMBER_ZONES,
      code: ["list.Contains(x);   // сравнивает с [0], [1], [2] …", "set.Contains(x);    // hash(x) -> бакет -> сравнение"],
      scenes: [
        { codeLine: 0, caption: '<code>List.Contains(x)</code>: перебор с начала. Проверили <code>[0]</code> — не то, идём к <code>[1]</code>.', nodes: [{ id: "l0", kind: "slot", at: { zone: "walk", row: 0 }, name: "[0]", value: "≠", accent: true }, { id: "l1", kind: "slot", at: { zone: "walk", row: 1 }, name: "[1]", value: "?" }, { id: "h", kind: "obj", at: { zone: "jump", row: 0 }, typeTag: "hash(x)", value: "→ бакет", accent: true }], edges: [] },
        { codeLine: 0, caption: 'Так до конца: если <code>x</code> нет, <code>List</code> сравнил со <span class="wrong">всеми n</span> элементами. Линейная работа на каждый промах.', nodes: [{ id: "l0", kind: "slot", at: { zone: "walk", row: 0 }, name: "[0]", value: "≠" }, { id: "l1", kind: "slot", at: { zone: "walk", row: 1 }, name: "[1]", value: "≠", accent: true }, { id: "h", kind: "obj", at: { zone: "jump", row: 0 }, typeTag: "hash(x)", value: "→ бакет" }], edges: [] },
        { codeLine: 1, caption: '<code>set.Contains(x)</code>: считает <code>hash(x)</code>, идёт <span class="hl">сразу в бакет</span>. Пустой бакет — ответ «нет» без единого сравнения (O(1)).', nodes: [{ id: "l0", kind: "slot", at: { zone: "walk", row: 0 }, name: "[0..n]", value: "n сравн." }, { id: "h", kind: "obj", at: { zone: "jump", row: 0 }, typeTag: "hash(x)", value: "→ бакет" }, { id: "b", kind: "gate", at: { zone: "jump", row: 1 }, state: "ok", label: "бакет пуст", detail: "нет · O(1)", accent: true }], edges: [{ id: "e1", from: "h", to: "b", accent: true }] },
      ],
      explain: 'Разница между <code>List</code> и <code>HashSet</code> для членства — не в API, а в алгоритме. <code>List&lt;T&gt;.Contains</code> — линейный перебор: сравнивает искомое с <code>[0]</code>, <code>[1]</code>, … пока не найдёт или не дойдёт до конца (O(n)). <code>HashSet&lt;T&gt;.Contains</code> считает хеш, находит бакет и сравнивает только его содержимое — «This method is an O(1) operation» <span class="ru-tr">«Этот метод выполняется за O(1)»</span> (страница <code>HashSet&lt;T&gt;.Contains</code>). Если бакет пуст, ответ «нет» приходит без единого сравнения элементов. Именно поэтому для «часто проверяю принадлежность» дока ведёт к хеш-типам, а не к <code>List</code>.',
      sources: ["ms-collections", "ms-hashset-contains"],
    },
    {
      id: "s4", num: "04", kicker: "Машинная панель · реальный замер", title: "Счётчик сравнений: 1000 у List против 0 у HashSet",
      viewBox: "0 0 340 214", zones: COUNT_ZONES,
      code: ["// Probe.Equals инкрементит статический счётчик", "list.Contains(absent);   // считаем Equals-вызовы", "set.Contains(absent);    // считаем Equals-вызовы", "// N = 1000, искомого в коллекции нет"],
      predictAt: 2, predictQ: 'Ищем <b>отсутствующий</b> ключ среди 1000. Сколько раз <code>List.Contains</code> вызовет <code>Equals</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Ключ <code>Probe</code> считает вызовы своего <code>Equals</code>. Ищем отсутствующий элемент среди 1000 — сначала в <code>List</code>.', nodes: [{ id: "l", kind: "gate", at: { zone: "cntList", row: 0 }, state: "fail", label: "List.Contains", detail: "замер…" }], edges: [] },
        { codeLine: 1, out: "List.Contains: 1000 Equals-вызовов", caption: '<code>List</code> прошёл <span class="wrong">все 1000</span> элементов — 1000 вызовов <code>Equals</code> на один промах. Это и есть O(n).', nodes: [{ id: "l", kind: "gate", at: { zone: "cntList", row: 0 }, state: "fail", label: "List.Contains", detail: "1000" }, { id: "ln", kind: "chip", at: { zone: "cntList", row: 1 }, value: "линейный обход", accent: true }], edges: [] },
        { codeLine: 2, out: "HashSet.Contains: 0 Equals-вызовов", caption: '<code>HashSet</code> — <span class="hl">0 вызовов</span> <code>Equals</code>: хеш привёл в пустой бакет, сравнивать не с чем. O(1) в буквальном машинном смысле.', nodes: [{ id: "l", kind: "gate", at: { zone: "cntList", row: 0 }, state: "fail", label: "List.Contains", detail: "1000" }, { id: "s", kind: "gate", at: { zone: "cntSet", row: 0 }, state: "ok", label: "HashSet", detail: "0" }, { id: "sn", kind: "chip", at: { zone: "cntSet", row: 1 }, value: "бакет по хешу", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятый счётчик, не легенда об O(). Ключ <code>Probe</code> инкрементит статический счётчик в своём <code>Equals</code>; поиск отсутствующего среди 1000 даёт <b>List.Contains: 1000</b> вызовов <code>Equals</code> против <b>HashSet.Contains: 0</b> (собственный прогон). List честно сравнил с каждым элементом; HashSet вычислил бакет по хешу, увидел его пустым и вернул «нет», ни разу не позвав <code>Equals</code>. Для найденного в середине (index 500) счёт — <b>501</b> против <b>1</b>. Вот граница O(n) и O(1) в конкретных числах: не «примерно быстрее», а на три порядка меньше работы.',
      sources: ["ms-collections"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Ключ <code>Probe</code> считает вызовы <code>Equals</code>. Среди 1000 <code>Probe</code> ищем <b>отсутствующий</b>: <code>list.Contains(absent)</code>, затем <code>set.Contains(absent)</code>. Печать: <code>$"{listCmp} {setCmp}"</code> — что выведет?',
      options: ["1000 0", "1000 1000", "1 1", "1000 1"], correctIndex: 0, xp: 10,
      okText: '<code>List</code> перебрал все 1000 (O(n)) → 1000 <code>Equals</code>; <code>HashSet</code> попал в пустой бакет и не сравнивал ни разу → <b>0</b>. Вывод: <b>1000 0</b>.',
      noText: 'Отсутствующий элемент — худший случай для <code>List</code>: полный обход, 1000 сравнений. <code>HashSet</code> идёт в бакет по хешу; бакет пуст → 0 вызовов <code>Equals</code>. Итого <b>1000 0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1000 0" }, sourceRefs: ["ms-collections"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Тот же <code>Probe</code>-счётчик, но ищем <b>элемент по индексу 500</b> (он в коллекции): <code>list.Contains(mid)</code>, <code>set.Contains(mid)</code>. Печать <code>$"{listMid} {setMid}"</code> — что выведет?',
      options: ["501 1", "500 1", "501 501", "1000 1"], correctIndex: 0, xp: 10,
      okText: '<code>List</code> сравнивает с <code>[0]…[500]</code> — <b>501</b> вызов (нашёл на 501-м). <code>HashSet</code> прыгнул в бакет и подтвердил одним <code>Equals</code> → <b>1</b>. Вывод: <b>501 1</b>.',
      noText: 'Индекс 500 — это 501-й элемент (с нуля), <code>List</code> дошёл до него линейно: 501 сравнение. <code>HashSet</code> — 1 (бакет + подтверждение). Итого <b>501 1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "501 1" }, sourceRefs: ["ms-collections"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var list = new List&lt;int&gt; { 5, 3, 9, 1 }; Console.WriteLine(list[2]); Console.WriteLine(list.IndexOf(9));</code> — что напечатает (две строки)?',
      options: ["9\\n2", "9\\n9", "3\\n2", "2\\n9"], correctIndex: 0, xp: 10,
      okText: '<code>list[2]</code> — индексация в массив O(1) → <b>9</b>. <code>IndexOf(9)</code> — линейный поиск, вернул позицию <b>2</b>. Индекс и поиск — разные операции с разной сложностью.',
      noText: 'Доступ по индексу <code>list[2]</code> берёт третий элемент → <b>9</b> (O(1)). <code>IndexOf(9)</code> ищет значение 9 и возвращает его индекс → <b>2</b> (O(n)). Вывод: <code>9</code>, затем <code>2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "9\n2" }, sourceRefs: ["ms-collections"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Выбор от вопроса", v: 'Дока: «choose your collection class carefully… Consider the following questions». <span class="ru-tr">«тщательно выбирайте класс коллекции… Рассмотрите следующие вопросы».</span> Индекс → <code>List&lt;T&gt;</code>, ключ → <code>Dictionary</code>, быстрый поиск/членство → хеш-типы. И «Avoid… <code>System.Collections</code>» <span class="ru-tr">«Избегайте… <code>System.Collections</code>»</span> — бери generic.' },
    { icon: "cost", k: "Два числа сложности", v: 'У операции <b>amortized</b> и <b>worst-case</b>: <code>List.Add</code> O(1)/O(n) (resize), <code>List[i]</code> O(1)/O(1), <code>Dictionary</code> lookup O(1)/«O(1) – or strictly O(n)» при коллизиях. Смотри оба.' },
    { icon: "avoid", k: "Членство ≠ индекс", v: '<code>List.Contains</code> — линейный обход: реальный замер <b>1000</b> сравнений на промах среди 1000, <b>501</b> при находке @500. <code>HashSet.Contains</code> — <b>0</b> и <b>1</b>: бакет по хешу, O(1).' },
  ],

  foot: 'урок · <b>выбор коллекции</b> · 4 разбора · amortized vs worst-case · панель сравнений 1000/0 · 501/1 · дизайн <b>mid</b>',
};
