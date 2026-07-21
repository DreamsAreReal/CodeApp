/**
 * Lesson: HashSet<T> — множество и O(1) Contains (CS.S17.hashset).
 * A HashSet is "a Dictionary<TKey,TValue> collection without values": the keys of a hash
 * table, no payload. It holds unique elements in no particular order; Add dedups (returns
 * false for a dup); Contains is O(1) — it hashes to a bucket, independent of set size.
 * Set algebra (Union/Intersect/Except) is its native operation.
 *
 * SIGNATURE machine panel (s4): a Probe key counts Equals calls. Finding element @50000 in
 * a 100,000-element collection: List = 50001 comparisons, HashSet = 1 — O(1) is literal,
 * constant regardless of size. Even in a 100k set, Contains(found) makes exactly 1 Equals
 * call. REAL, reproducible. Evidence: scratchpad l5panel.cs / l5c1.cs / l5c2.cs / l5c3.cs,
 * backend run-csharp, 2026-07-21.
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from hashset-1 + hashset-1.contains + hashtable-and-dictionary
 *     (fetch-verified 2026-07-21) — GT-M6-collections-core F27–F31.
 *   - card verify.expect = REAL run-csharp stdout; anti-echo (True False 1 / counts computed).
 *   - "This method is an O(1) operation" is the exact HashSet.Contains Remarks quote.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.hashset/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: HashSet = Dictionary keys without values.
const Z_DICT: Zone = { id: "dict", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Dictionary<K,V>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "ключ + значение", subCls: "vz-zsub", subY: 47 };
const Z_SET: Zone = { id: "set", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HashSet<T>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "только ключи", subCls: "vz-zsub good", subY: 47 };
const MODEL_ZONES: Zone[] = [Z_DICT, Z_SET];

// s2: dedup — Add returns bool.
const Z_ADD: Zone = { id: "add", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Add — уникальность · возвращает bool", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "дубликат отвергается, Count не растёт", subCls: "vz-zsub good", subY: 47 };
const ADD_ZONES: Zone[] = [Z_ADD];

// s3: set algebra.
const Z_A: Zone = { id: "setA", x: 14, y: 34, w: 100, h: 168, cls: "vz-zone", label: "A", labelCls: "vz-zlabel sm", lx: 64, ly: 24, sub: "1 2 3 4", subCls: "vz-zsub", subY: 47 };
const Z_OP: Zone = { id: "op", x: 122, y: 34, w: 96, h: 168, cls: "vz-zone good", label: "ОПЕРАЦИЯ", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "∪ ∩ −", subCls: "vz-zsub good", subY: 47 };
const Z_B: Zone = { id: "setB", x: 226, y: 34, w: 100, h: 168, cls: "vz-zone", label: "B", labelCls: "vz-zlabel sm", lx: 276, ly: 24, sub: "3 4 5 6", subCls: "vz-zsub", subY: 47 };
const ALGEBRA_ZONES: Zone[] = [Z_A, Z_OP, Z_B];

// s4 (SIGNATURE): O(1) comparison count at scale.
const Z_CNT_L: Zone = { id: "cntL", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List.Contains", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "100 000 элементов", subCls: "vz-zsub heap", subY: 47 };
const Z_CNT_S: Zone = { id: "cntS", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "HashSet.Contains", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "100 000 элементов", subCls: "vz-zsub good", subY: 47 };
const SCALE_ZONES: Zone[] = [Z_CNT_L, Z_CNT_S];

export const hashSet: LessonData = {
  id: "CS.S17.hashset",
  track: "CS",
  section: "CS.S17",
  module: "S17.5",
  lang: "csharp",
  title: "HashSet<T>: множество и O(1) Contains",
  kicker: "C# вглубь · S17 · Dictionary без значений",
  home: { subtitle: "уникальность, Contains O(1), set-операции", icon: "collections", estMinutes: 9 },
  prereqs: ["CS.S17.dictionary-internals"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-hashset", kind: "doc", org: "Microsoft Learn", title: "HashSet<T> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1", date: "2026-07-01" },
    { id: "ms-hashset-contains", kind: "doc", org: "Microsoft Learn", title: "HashSet<T>.Contains(T) Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1.contains", date: "2026-07-01" },
    { id: "ms-hashtable-dict", kind: "doc", org: "Microsoft Learn", title: "Hashtable and Dictionary Collection Types", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/hashtable-and-dictionary-collection-types", date: "2026-03-30" },
  ],

  spec: [
    { text: "«The HashSet&lt;T&gt; class provides high-performance set operations. A set is a collection that contains no duplicate elements, and whose elements are in no particular order.» <span class=\"ru-tr\">«Класс HashSet&lt;T&gt; предоставляет высокопроизводительные операции над множествами. Множество — это коллекция, которая не содержит повторяющихся элементов и элементы которой не упорядочены.»</span>", source: "ms-hashset" },
    { text: "«This method is an O(1) operation.» <span class=\"ru-tr\">«Этот метод является операцией O(1).»</span>", source: "ms-hashset-contains" },
  ],
  edgeCases: [
    { text: "«In simple terms, the <code>HashSet&lt;T&gt;</code> class can be thought of as a <code>Dictionary&lt;TKey,TValue&gt;</code> collection <b>without values</b>» <span class=\"ru-tr\">«Проще говоря, класс <code>HashSet&lt;T&gt;</code> можно рассматривать как коллекцию <code>Dictionary&lt;TKey,TValue&gt;</code> <b>без значений</b>»</span> — те же бакеты, но хранятся только ключи.", source: "ms-hashset" },
    { text: "«A <code>HashSet&lt;T&gt;</code> collection is <b>not sorted</b> and cannot contain duplicate elements» <span class=\"ru-tr\">«Коллекция <code>HashSet&lt;T&gt;</code> <b>не отсортирована</b> и не может содержать повторяющихся элементов»</span> — порядок не определён, дубликаты отбрасываются.", source: "ms-hashset" },
    { text: "<code>Add</code> возвращает <code>bool</code>: <code>true</code> если элемент добавлен, <code>false</code> если уже был — удобно детектить дубликаты без отдельного <code>Contains</code>.", source: "ms-hashset" },
  ],

  misconceptions: [
    {
      wrong: "HashSet медленнее List для проверки «есть ли элемент» — ведь List проще",
      hook: 'Интуиция «List проще, значит быстрее» здесь <span class="wrong">обратна истине</span>. Для проверки принадлежности <code>List&lt;T&gt;.Contains</code> — линейный обход O(n), а <code>HashSet&lt;T&gt;.Contains</code> — «This method is an <span class="hl">O(1) operation</span>» <span class="ru-tr">«Этот метод является операцией O(1)»</span>: хеш ведёт в бакет за константу, независимо от размера. HashSet — «In simple terms, the <code>HashSet&lt;T&gt;</code> class can be thought of as a <code>Dictionary&lt;TKey,TValue&gt;</code> collection <b>without values</b>» <span class="ru-tr">«Проще говоря, класс <code>HashSet&lt;T&gt;</code> можно рассматривать как коллекцию <code>Dictionary&lt;TKey,TValue&gt;</code> <b>без значений</b>»</span>: ключи хеш-таблицы без нагрузки. Дальше <b>четыре разбора</b> — от модели «словарь без значений» до <b>машинной панели</b>: реальный счётчик сравнений на 100 000 элементов — <b>50001</b> у <code>List</code> против <b>1</b> у <code>HashSet</code>.',
      source: "ms-hashset",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Модель · словарь без значений", title: "HashSet — это ключи Dictionary без нагрузки",
      viewBox: "0 0 340 210", zones: MODEL_ZONES,
      code: ["Dictionary<string,int> d; // ключ -> значение", "HashSet<string> set;       // только ключ", "// та же хеш-таблица, у set нет поля value"],
      scenes: [
        { codeLine: 0, caption: '<code>Dictionary&lt;K,V&gt;</code> хранит пару: ключ (в бакете по хешу) плюс <span class="hl">значение</span> рядом.', nodes: [{ id: "dk", kind: "slot", at: { zone: "dict", row: 0 }, name: "key", value: '"cat"', accent: true }, { id: "dv", kind: "slot", at: { zone: "dict", row: 1 }, name: "value", value: "7" }], edges: [] },
        { codeLine: 1, caption: '<code>HashSet&lt;T&gt;</code> — <span class="hl">та же таблица</span>, но <b>без поля value</b>: в бакете лежит только ключ.', nodes: [{ id: "dk", kind: "slot", at: { zone: "dict", row: 0 }, name: "key", value: '"cat"' }, { id: "dv", kind: "slot", at: { zone: "dict", row: 1 }, name: "value", value: "7" }, { id: "sk", kind: "slot", at: { zone: "set", row: 0 }, name: "elem", value: '"cat"', accent: true }], edges: [] },
        { codeLine: 2, caption: 'Отсюда всё: уникальность, O(1)-членство и порядок «no particular order» <span class="ru-tr">«без определённого порядка»</span> — наследуются от механики бакетов Dictionary.', nodes: [{ id: "dk", kind: "obj", at: { zone: "dict", row: 0 }, typeTag: "key+value", value: "пара" }, { id: "sk", kind: "obj", at: { zone: "set", row: 0 }, typeTag: "только key", value: "хеш → бакет", accent: true }], edges: [] },
      ],
      explain: 'HashSet устроен как хеш-таблица без нагрузки: «The <code>HashSet&lt;T&gt;</code> class is based on the model of mathematical sets and provides high-performance set operations similar to accessing the <b>keys</b> of the <code>Dictionary&lt;TKey,TValue&gt;</code> or <code>Hashtable</code> collections. In simple terms, the <code>HashSet&lt;T&gt;</code> class can be thought of as a <code>Dictionary&lt;TKey,TValue&gt;</code> collection <b>without values</b>» <span class="ru-tr">«Класс <code>HashSet&lt;T&gt;</code> построен на модели математических множеств и предоставляет высокопроизводительные операции над множествами, аналогичные обращению к <b>ключам</b> коллекций <code>Dictionary&lt;TKey,TValue&gt;</code> или <code>Hashtable</code>. Проще говоря, класс <code>HashSet&lt;T&gt;</code> можно рассматривать как коллекцию <code>Dictionary&lt;TKey,TValue&gt;</code> <b>без значений</b>.»</span>. Всё поведение множества — следствие этой механики: элемент кладётся в бакет по своему хешу (уникальность через <code>Equals</code> в бакете), поиск идёт в один бакет (O(1)), а порядок обхода — «in no particular order» <span class="ru-tr">«без определённого порядка»</span>, как и у ключей словаря.',
      sources: ["ms-hashset", "ms-hashtable-dict"],
    },
    {
      id: "s2", num: "02", kicker: "Уникальность · Add → bool", title: "Add отбрасывает дубликат и говорит об этом",
      viewBox: "0 0 340 210", zones: ADD_ZONES,
      code: ["var set = new HashSet<int>();", "bool a = set.Add(5);   // true  — новый", "bool b = set.Add(5);   // false — уже есть", "// Count == 1, не 2"],
      predictAt: 2, predictQ: 'Второй <code>set.Add(5)</code> для уже существующего 5 — что вернёт и каким станет <code>Count</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>set.Add(5)</code>: элемента нет — добавлен, метод вернул <span class="hl">true</span>. Count = 1.', nodes: [{ id: "a1", kind: "gate", at: { zone: "add", row: 0, col: 0 }, state: "ok", label: "Add(5)", detail: "true", accent: true }, { id: "e5", kind: "slot", at: { zone: "add", row: 1, col: 0 }, name: "бакет", value: "5" }, { id: "cnt", kind: "chip", at: { zone: "add", row: 1, col: 1 }, value: "Count=1" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Повторный <code>set.Add(5)</code>: хеш ведёт в тот же бакет, <code>Equals</code> находит 5 — <span class="wrong">дубликат</span>, вернулся <b>false</b>.', nodes: [{ id: "a2", kind: "gate", at: { zone: "add", row: 0, col: 0 }, state: "fail", label: "Add(5) снова", detail: "false", accent: true }, { id: "e5", kind: "slot", at: { zone: "add", row: 1, col: 0 }, name: "бакет", value: "5" }, { id: "cnt", kind: "chip", at: { zone: "add", row: 1, col: 1 }, value: "Count=1" }], edges: [] },
        { codeLine: 3, out: "True False 1", caption: 'Итог: <b>True False 1</b>. Множество не хранит дубликаты; <code>Add</code>-возврат <code>bool</code> сразу говорит «был ли новым» (реальный прогон).', nodes: [{ id: "r", kind: "gate", at: { zone: "add", row: 0, col: 0 }, state: "ok", label: "True False", detail: "Count 1", accent: true }], edges: [] },
      ],
      explain: 'Уникальность — определяющее свойство: «A set is a collection that contains <b>no duplicate elements</b>» <span class="ru-tr">«Множество — это коллекция, которая не содержит <b>повторяющихся элементов</b>»</span>, и «A <code>HashSet&lt;T&gt;</code> collection is not sorted and <b>cannot contain duplicate elements</b>» <span class="ru-tr">«Коллекция <code>HashSet&lt;T&gt;</code> не отсортирована и <b>не может содержать повторяющихся элементов</b>»</span>. Механически <code>Add</code> хеширует элемент, идёт в бакет и через <code>Equals</code> проверяет, нет ли уже такого; если есть — не добавляет и возвращает <code>false</code>, иначе кладёт и возвращает <code>true</code>. Реальный прогон: <code>Add(5)</code> → <code>true</code>, повторный <code>Add(5)</code> → <code>false</code>, <code>Count</code> = 1. Возврат <code>bool</code> — практичный сигнал: можно детектить «первое появление» без отдельного <code>Contains</code>. Ёмкость при этом растёт сама: «A <code>HashSet&lt;T&gt;</code> object\'s capacity automatically increases as elements are added to the object» <span class="ru-tr">«Ёмкость объекта <code>HashSet&lt;T&gt;</code> автоматически увеличивается по мере добавления элементов в объект»</span>.',
      sources: ["ms-hashset"],
    },
    {
      id: "s3", num: "03", kicker: "Множества · алгебра", title: "Union, Intersect, Except — родная операция",
      viewBox: "0 0 340 210", zones: ALGEBRA_ZONES,
      code: ["A = {1,2,3,4}   B = {3,4,5,6}", "A.UnionWith(B)     -> {1,2,3,4,5,6}  (6)", "A.IntersectWith(B) -> {3,4}          (2)", "A.ExceptWith(B)    -> {1,2}          (2)"],
      scenes: [
        { codeLine: 1, caption: '<code>UnionWith</code> — <b>объединение</b>: все элементы обоих множеств без дублей → <span class="hl">{1,2,3,4,5,6}</span>, 6 штук.', nodes: [{ id: "a", kind: "obj", at: { zone: "setA", row: 0 }, typeTag: "A", value: "1234" }, { id: "u", kind: "gate", at: { zone: "op", row: 0 }, state: "ok", label: "∪ Union", detail: "= 6", accent: true }, { id: "b", kind: "obj", at: { zone: "setB", row: 0 }, typeTag: "B", value: "3456" }], edges: [{ id: "e1", from: "a", to: "u" }, { id: "e2", from: "b", to: "u" }] },
        { codeLine: 2, caption: '<code>IntersectWith</code> — <b>пересечение</b>: только общие элементы → <span class="hl">{3,4}</span>, 2 штуки.', nodes: [{ id: "a", kind: "obj", at: { zone: "setA", row: 0 }, typeTag: "A", value: "1234" }, { id: "i", kind: "gate", at: { zone: "op", row: 0 }, state: "ok", label: "∩ Intersect", detail: "= 2", accent: true }, { id: "b", kind: "obj", at: { zone: "setB", row: 0 }, typeTag: "B", value: "3456" }], edges: [{ id: "e1", from: "a", to: "i" }, { id: "e2", from: "b", to: "i" }] },
        { codeLine: 3, caption: '<code>ExceptWith</code> — <b>разность</b>: A минус общие → <span class="hl">{1,2}</span>, 2 штуки. Это и есть «high-performance set operations» <span class="ru-tr">«высокопроизводительные операции над множествами»</span>.', nodes: [{ id: "a", kind: "obj", at: { zone: "setA", row: 0 }, typeTag: "A", value: "1234" }, { id: "e", kind: "gate", at: { zone: "op", row: 0 }, state: "ok", label: "− Except", detail: "= 2", accent: true }, { id: "b", kind: "obj", at: { zone: "setB", row: 0 }, typeTag: "B", value: "3456" }], edges: [{ id: "e1", from: "a", to: "e" }] },
      ],
      explain: 'Множественная алгебра — родная операция <code>HashSet</code>, ради неё он и «provides high-performance set operations similar to accessing the keys of the <code>Dictionary</code>» <span class="ru-tr">«предоставляет высокопроизводительные операции над множествами, аналогичные обращению к ключам <code>Dictionary</code>»</span>. <code>UnionWith</code> (объединение), <code>IntersectWith</code> (пересечение), <code>ExceptWith</code> (разность), <code>SymmetricExceptWith</code> (симметрическая разность), плюс предикаты <code>IsSubsetOf</code>/<code>IsSupersetOf</code>/<code>Overlaps</code>. На <code>A={1,2,3,4}</code>, <code>B={3,4,5,6}</code> реальный прогон даёт <code>union=6</code>, <code>intersect=2</code>, <code>except=2</code>. Каждая операция использует O(1)-членство под капотом, поэтому пересечение двух множеств — линейно по меньшему, а не квадратично, как наивное сравнение двух списков.',
      sources: ["ms-hashset"],
    },
    {
      id: "s4", num: "04", kicker: "Машинная панель · реальный замер", title: "O(1) буквально: 1 сравнение против 50001 на 100 000",
      viewBox: "0 0 340 214", zones: SCALE_ZONES,
      code: ["// 100 000 элементов и в List, и в HashSet", "// ищем элемент по индексу 50000 (он есть)", "list.Contains(target);   // считаем Equals", "set.Contains(target);    // считаем Equals"],
      predictAt: 3, predictQ: 'Ищем элемент @50000 среди <b>100 000</b>. Сколько <code>Equals</code> сделает <code>HashSet.Contains</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "List: 50001 сравнений", caption: '<code>List.Contains</code> дошёл линейно до элемента @50000 — <span class="wrong">50001</span> сравнений. Число растёт с размером — O(n).', nodes: [{ id: "l", kind: "gate", at: { zone: "cntL", row: 0 }, state: "fail", label: "List", detail: "50001" }, { id: "ln", kind: "chip", at: { zone: "cntL", row: 1 }, value: "~ N/2", accent: true }], edges: [] },
        { codeLine: 3, out: "HashSet: 1 сравнение", caption: '<code>HashSet.Contains</code> — <span class="hl">1 сравнение</span>: хеш привёл прямо в бакет, один <code>Equals</code> подтвердил. «This method is an O(1) operation» <span class="ru-tr">«Этот метод является операцией O(1)»</span>.', nodes: [{ id: "l", kind: "gate", at: { zone: "cntL", row: 0 }, state: "fail", label: "List", detail: "50001" }, { id: "s", kind: "gate", at: { zone: "cntS", row: 0 }, state: "ok", label: "HashSet", detail: "1" }, { id: "sn", kind: "chip", at: { zone: "cntS", row: 1 }, value: "не зависит от N", accent: true }], edges: [] },
        { codeLine: 3, out: "Contains(found)=True, 1 сравнение", caption: 'Ключевое: <b>1</b> — <span class="hl">не зависит от размера</span>. И на 100, и на 100 000 <code>HashSet.Contains</code> делает одно сравнение. Вот что значит O(1).', nodes: [{ id: "s", kind: "gate", at: { zone: "cntS", row: 0 }, state: "ok", label: "O(1)", detail: "1 сравн.", accent: true }, { id: "big", kind: "chip", at: { zone: "cntS", row: 1 }, value: "100k = та же 1" }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятый счётчик сравнений. Ключ <code>Probe</code> считает вызовы <code>Equals</code>; поиск элемента @50000 среди 100 000 даёт <b>List: 50001</b> против <b>HashSet: 1</b> (собственный прогон). Разница в природе алгоритма: <code>List</code> идёт линейно (число сравнений ≈ позиция), а <code>HashSet</code> хеширует в бакет и делает одно подтверждающее сравнение — «This method is an <b>O(1) operation</b>» <span class="ru-tr">«Этот метод является операцией O(1)»</span>. Главное свойство O(1) — <b>независимость от N</b>: то же одно сравнение и на множестве из 100 элементов, и из 100 000. Поэтому для частой проверки принадлежности <code>HashSet</code> бьёт <code>List</code> тем сильнее, чем больше данных — ровно там, где интуиция «список проще» подводит.',
      sources: ["ms-hashset-contains"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var set = new HashSet&lt;int&gt;(); bool a = set.Add(5); bool b = set.Add(5); Console.WriteLine($"{a} {b} {set.Count}");</code> — что напечатает?',
      options: ["True False 1", "True True 2", "True False 2", "False False 1"], correctIndex: 0, xp: 10,
      okText: 'Первый <code>Add(5)</code> — новый → <b>True</b>; второй — дубликат → <b>False</b>; <code>Count</code> = <b>1</b> (множество без дублей). Вывод: <b>True False 1</b>.',
      noText: 'Множество «cannot contain duplicate elements» <span class="ru-tr">«не может содержать повторяющихся элементов»</span>. <code>Add</code> возвращает <code>bool</code>: true для нового, false для повтора. Второй 5 отброшен, Count=1. Итого <b>True False 1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False 1" }, sourceRefs: ["ms-hashset"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>A={1,2,3,4}, B={3,4,5,6}</code>: <code>u=A∪B, i=A∩B, e=A\\B</code> (UnionWith/IntersectWith/ExceptWith на копиях A). Печать <code>$"union={u.Count} intersect={i.Count} except={e.Count}"</code> — что выведет?',
      options: ["union=6 intersect=2 except=2", "union=8 intersect=2 except=4", "union=6 intersect=4 except=2", "union=4 intersect=2 except=2"], correctIndex: 0, xp: 10,
      okText: 'Объединение {1..6} → <b>6</b>; пересечение {3,4} → <b>2</b>; разность {1,2} → <b>2</b>. Множественная алгебра HashSet без дублей.',
      noText: 'A∪B = {1,2,3,4,5,6} (6, без дублей); A∩B = {3,4} (2, общие); A\\B = {1,2} (2, только в A). Итого <b>union=6 intersect=2 except=2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "union=6 intersect=2 except=2" }, sourceRefs: ["ms-hashset"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Ключ <code>Probe</code> считает <code>Equals</code>. В <code>HashSet</code> из 100 000 <code>Probe</code> ищем присутствующий элемент: <code>set.Contains(found)</code>. Печать <code>$"Contains(found)={has}, Equals-вызовов={cmp}"</code> — что выведет?',
      options: ["Contains(found)=True, Equals-вызовов=1", "Contains(found)=True, Equals-вызовов=100000", "Contains(found)=True, Equals-вызовов=50000", "Contains(found)=False, Equals-вызовов=1"], correctIndex: 0, xp: 10,
      okText: '<code>HashSet.Contains</code> — O(1): хеш → бакет → <b>1</b> подтверждающий <code>Equals</code>, независимо от 100 000 элементов. Вывод: <b>Contains(found)=True, Equals-вызовов=1</b>.',
      noText: '«This method is an O(1) operation» <span class="ru-tr">«Этот метод является операцией O(1)»</span>: размер множества не влияет. Хеш ведёт в бакет, один <code>Equals</code> подтверждает совпадение → <b>1</b>. Это и есть смысл O(1).',
      verify: { kind: "exec", run: "dotnet run", expect: "Contains(found)=True, Equals-вызовов=1" }, sourceRefs: ["ms-hashset-contains"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Словарь без значений", v: '<code>HashSet&lt;T&gt;</code> — «a <code>Dictionary&lt;TKey,TValue&gt;</code> collection <b>without values</b>» <span class="ru-tr">«коллекция <code>Dictionary&lt;TKey,TValue&gt;</code> <b>без значений</b>»</span>: ключи хеш-таблицы. Уникальность, «no particular order» <span class="ru-tr">«без определённого порядка»</span> и O(1)-членство наследуются от механики бакетов.' },
    { icon: "cost", k: "O(1) Contains буквально", v: '<code>Contains</code> — «This method is an <b>O(1) operation</b>» <span class="ru-tr">«Этот метод является операцией O(1)»</span>: реальный замер на 100 000 элементов — <b>1</b> сравнение против <b>50001</b> у <code>List</code>. Число сравнений <b>не зависит от N</b>.' },
    { icon: "avoid", k: "Уникальность и алгебра", v: '<code>Add</code> отбрасывает дубликат и возвращает <code>bool</code> (<b>True False 1</b>). Родные операции — <code>UnionWith</code>/<code>IntersectWith</code>/<code>ExceptWith</code>. Порядок не гарантирован — не полагайся на него.' },
  ],

  foot: 'урок · <b>HashSet<T></b> · 4 разбора · множество/уникальность/set-алгебра · панель O(1) 1 vs 50001 на 100k · дизайн <b>mid</b>',
};
