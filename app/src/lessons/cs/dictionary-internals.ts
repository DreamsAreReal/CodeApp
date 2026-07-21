/**
 * Lesson: Dictionary изнутри — бакеты, хеш, коллизии, resize (CS.S17.dictionary-internals).
 * The section flagship. A Dictionary is a hash table: a key's hash picks a BUCKET; add
 * stores in that bucket; lookup regenerates the hash and searches only that bucket.
 * Collisions (two keys, one hash) share a bucket. GetHashCode + Equals are the contract;
 * mutating a live key breaks lookup. The internal bucket array reallocates (prime-sized) as
 * it fills.
 *
 * SIGNATURE machine panel (s5): the REAL internal bucket-array growth, read by reflection on
 * the private `_buckets` field: 0 -> 3 -> 7 -> 17 -> 37 (resize at Count 1/4/8/18). Adding
 * the 4th key grows buckets 3 -> 7. Prime-sizing is a runtime IMPLEMENTATION DETAIL (not a
 * documented API contract) — marked as such. Evidence: scratchpad l3resize.cs / l3c.cs,
 * backend run-csharp, 2026-07-21. The collision demo (picnic=630, basket=634; stressed=877=
 * desserts=877) is the docs' own ASCII-sum example, run live (l3collide.cs).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from hashtable-and-dictionary-collection-types + dictionary-2
 *     (fetch-verified 2026-07-21) — GT-M6-collections-core F9–F19.
 *   - card verify.expect = REAL run-csharp stdout; anti-echo (True False / 1 2 / 3 -> 7 are
 *     computed).
 *   - the prime bucket sizes (3/7/17/37) are OWN reflection measurements framed as an
 *     implementation detail; the O(1) / "order undefined" / key-not-null facts are quoted.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.dictionary-internals/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: hash function -> bucket index.
const Z_KEY: Zone = { id: "key", x: 14, y: 34, w: 122, h: 168, cls: "vz-zone", label: "КЛЮЧ", labelCls: "vz-zlabel sm", lx: 75, ly: 24, sub: "GetHashCode()", subCls: "vz-zsub", subY: 47 };
const Z_BUCKETS: Zone = { id: "buckets", x: 160, y: 34, w: 166, h: 168, cls: "vz-zone good", label: "БАКЕТЫ", labelCls: "vz-zlabel good sm", lx: 243, ly: 24, sub: "hash % n", subCls: "vz-zsub good", subY: 47 };
const HASH_ZONES: Zone[] = [Z_KEY, Z_BUCKETS];

// s2: collision — two keys land in one bucket (chaining).
const Z_HASH2: Zone = { id: "hash2", x: 14, y: 34, w: 122, h: 168, cls: "vz-zone", label: "ХЕШ", labelCls: "vz-zlabel sm", lx: 75, ly: 24, sub: "ASCII-сумма", subCls: "vz-zsub", subY: 47 };
const Z_CHAIN: Zone = { id: "chain", x: 160, y: 34, w: 166, h: 168, cls: "vz-zone heap", label: "БАКЕТ · цепочка", labelCls: "vz-zlabel heap sm", lx: 243, ly: 24, sub: "коллизия", subCls: "vz-zsub heap", subY: 47 };
const COLLIDE_ZONES: Zone[] = [Z_HASH2, Z_CHAIN];

// s3: contract — GetHashCode + Equals; mutated key breaks lookup.
const Z_CONTRACT: Zone = { id: "contract", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОНТРАКТ КЛЮЧА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "hash + equals", subCls: "vz-zsub", subY: 47 };
const Z_BROKEN: Zone = { id: "broken", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МУТАЦИЯ КЛЮЧА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "хеш уехал", subCls: "vz-zsub heap", subY: 47 };
const CONTRACT_ZONES: Zone[] = [Z_CONTRACT, Z_BROKEN];

// s4: enumeration order undefined.
const Z_INS: Zone = { id: "ins", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВСТАВКА", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "c, a, b", subCls: "vz-zsub", subY: 47 };
const Z_ENUM: Zone = { id: "enum", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "foreach", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "order undefined", subCls: "vz-zsub heap", subY: 47 };
const ORDER_ZONES: Zone[] = [Z_INS, Z_ENUM];

// s5 (SIGNATURE): the resize panel — internal bucket array grows prime-sized.
const Z_RESIZE: Zone = { id: "resize", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "_buckets · внутренний массив (реальный замер, рефлексия)", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "0 → 3 → 7 → 17 → 37", subCls: "vz-zsub good", subY: 47 };
const RESIZE_ZONES: Zone[] = [Z_RESIZE];

export const dictionaryInternals: LessonData = {
  id: "CS.S17.dictionary-internals",
  track: "CS",
  section: "CS.S17",
  module: "S17.3",
  lang: "csharp",
  title: "Dictionary изнутри: бакеты, хеш, коллизии",
  kicker: "C# вглубь · S17 · хеш-таблица",
  home: { subtitle: "бакеты, GetHashCode/Equals, resize, коллизии", icon: "collections", estMinutes: 11 },
  prereqs: ["CS.S17.collections-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-hashtable-dict", kind: "doc", org: "Microsoft Learn", title: "Hashtable and Dictionary Collection Types", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/hashtable-and-dictionary-collection-types", date: "2026-03-30" },
    { id: "ms-dictionary", kind: "doc", org: "Microsoft Learn", title: "Dictionary<TKey,TValue> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2", date: "2026-07-01" },
    { id: "runtime-dict", kind: "source", org: "dotnet/runtime", title: "Dictionary.cs (internal _buckets, prime sizing)", url: "https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/Dictionary.cs", date: "2026-07-21" },
  ],

  spec: [
    { text: "«A Hashtable object consists of buckets that contain the elements of the collection. A bucket is a virtual subgroup of elements within the Hashtable, which makes searching and retrieving easier and faster than in most collections. Each bucket is associated with a hash code, which is generated using a hash function and is based on the key of the element.» <span class=\"ru-tr\">«Объект Hashtable состоит из бакетов, которые содержат элементы коллекции. Бакет — это виртуальная подгруппа элементов внутри Hashtable, что делает поиск и извлечение проще и быстрее, чем в большинстве коллекций. Каждый бакет связан с хеш-кодом, который вычисляется хеш-функцией на основе ключа элемента.»</span>", source: "ms-hashtable-dict" },
    { text: "«Retrieving a value by using its key is very fast, close to O(1), because the Dictionary&lt;TKey,TValue&gt; class is implemented as a hash table.» <span class=\"ru-tr\">«Извлечение значения по ключу очень быстрое, близко к O(1), потому что класс Dictionary&lt;TKey,TValue&gt; реализован как хеш-таблица.»</span>", source: "ms-dictionary" },
  ],
  edgeCases: [
    { text: "«A hash function must always return the same hash code for the same key» <span class=\"ru-tr\">«Хеш-функция должна всегда возвращать один и тот же хеш-код для одного и того же ключа»</span> — поэтому <b>мутация живого ключа</b>, меняющая хеш, ломает поиск (ключ уходит не в свой бакет).", source: "ms-hashtable-dict" },
    { text: "«A key cannot be <code>null</code>, but a value can be, if its type <code>TValue</code> is a reference type» <span class=\"ru-tr\">«Ключ не может быть <code>null</code>, но значение может, если его тип <code>TValue</code> — ссылочный»</span> — ключ <code>null</code> бросит <code>ArgumentNullException</code>.", source: "ms-dictionary" },
    { text: "«The order in which the items are returned is <b>undefined</b>» <span class=\"ru-tr\">«Порядок, в котором возвращаются элементы, <b>не определён</b>»</span> — <code>foreach</code> по <code>Dictionary</code> не хранит порядок вставки; полагаться нельзя.", source: "ms-dictionary" },
  ],

  misconceptions: [
    {
      wrong: "хеш-код уникален для каждого ключа, а Dictionary сохраняет порядок вставки",
      hook: 'Два соблазнительных, но ложных допущения. Первое: «хеш уникален» — нет, «It is possible for a hash function to generate the <span class="wrong">same hash code for two different keys</span>» <span class="ru-tr">«Хеш-функция может сгенерировать одинаковый хеш-код для двух разных ключей»</span> (это коллизия). Второе: «Dictionary помнит порядок» — нет, «The order in which the items are returned is <span class="hl">undefined</span>» <span class="ru-tr">«Порядок, в котором возвращаются элементы, не определён»</span>. Dictionary — это хеш-таблица: ключ через <code>GetHashCode</code> выбирает <b>бакет</b>, коллизии делят бакет, а внутренний массив бакетов реаллоцируется по мере роста. Дальше <b>пять разборов</b> — от бакета по хешу до <b>машинной панели</b>: реально снятый рост внутреннего массива <code>_buckets</code> <b>0 → 3 → 7 → 17 → 37</b> (рефлексия, .NET 10).',
      source: "ms-hashtable-dict",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Хеш → бакет", title: "Ключ через GetHashCode выбирает бакет",
      viewBox: "0 0 340 210", zones: HASH_ZONES,
      code: ["d[\"cat\"] = 1;   // hash(\"cat\") -> бакет i", "d[\"dog\"] = 2;   // hash(\"dog\") -> бакет j", "var v = d[\"cat\"]; // снова hash(\"cat\") -> бакет i"],
      scenes: [
        { codeLine: 0, caption: '<code>d["cat"]=1</code>: считается <code>hash("cat")</code>, из него — индекс бакета. Значение кладётся <span class="hl">в этот бакет</span>.', nodes: [{ id: "k1", kind: "chip", at: { zone: "key", row: 0 }, value: '"cat"', accent: true }, { id: "b0", kind: "slot", at: { zone: "buckets", row: 0 }, name: "бакет i", value: "cat→1", accent: true }], edges: [{ id: "e1", from: "k1", to: "b0", accent: true }] },
        { codeLine: 1, caption: '<code>d["dog"]=2</code>: другой хеш → <span class="hl">другой бакет</span>. Ключи расходятся по бакетам без взаимного влияния.', nodes: [{ id: "k1", kind: "chip", at: { zone: "key", row: 0 }, value: '"cat"' }, { id: "k2", kind: "chip", at: { zone: "key", row: 1 }, value: '"dog"', accent: true }, { id: "b0", kind: "slot", at: { zone: "buckets", row: 0 }, name: "бакет i", value: "cat→1" }, { id: "b1", kind: "slot", at: { zone: "buckets", row: 1 }, name: "бакет j", value: "dog→2", accent: true }], edges: [{ id: "e1", from: "k1", to: "b0" }, { id: "e2", from: "k2", to: "b1", accent: true }] },
        { codeLine: 2, caption: 'Чтение <code>d["cat"]</code>: тот же <code>hash("cat")</code> → тот же бакет i. Поиск идёт <span class="hl">только в нём</span>, не по всей таблице — отсюда «close to O(1)».', nodes: [{ id: "k1", kind: "chip", at: { zone: "key", row: 0 }, value: '"cat"', accent: true }, { id: "b0", kind: "slot", at: { zone: "buckets", row: 0 }, name: "бакет i", value: "cat→1", accent: true }, { id: "b1", kind: "slot", at: { zone: "buckets", row: 1 }, name: "бакет j", value: "dog→2" }], edges: [{ id: "e1", from: "k1", to: "b0", accent: true }] },
      ],
      explain: 'Dictionary — это хеш-таблица: «A <code>Hashtable</code> object consists of <b>buckets</b> that contain the elements… Each bucket is associated with a hash code, which is generated using a hash function and is based on the key» <span class="ru-tr">«Объект <code>Hashtable</code> состоит из <b>бакетов</b>, которые содержат элементы… Каждый бакет связан с хеш-кодом, вычисляемым хеш-функцией на основе ключа»</span>. Механика put/get симметрична: «When an object is added… it is stored in the bucket that is associated with the hash code that matches the object\'s hash code. When a value is being searched for… the hash code is generated for that value, and the bucket associated with that hash code is searched» <span class="ru-tr">«Когда объект добавляется… он сохраняется в бакете, связанном с хеш-кодом, совпадающим с хеш-кодом объекта. Когда значение ищется… для этого значения вычисляется хеш-код, и просматривается бакет, связанный с этим хеш-кодом»</span>. Поэтому поиск по ключу — «very fast, close to O(1), because the <code>Dictionary&lt;TKey,TValue&gt;</code> class is implemented as a hash table» <span class="ru-tr">«очень быстрый, близко к O(1), потому что класс <code>Dictionary&lt;TKey,TValue&gt;</code> реализован как хеш-таблица»</span>, и «depends on the quality of the hashing algorithm» <span class="ru-tr">«зависит от качества алгоритма хеширования»</span>.',
      sources: ["ms-hashtable-dict", "ms-dictionary"],
    },
    {
      id: "s2", num: "02", kicker: "Коллизия · один бакет на двоих", title: "Разные ключи с одним хешом делят бакет",
      viewBox: "0 0 340 210", zones: COLLIDE_ZONES,
      code: ["// пример из доков: хеш = сумма ASCII-кодов", "hash(\"picnic\") = 630   hash(\"basket\") = 634", "hash(\"stressed\") = 877 hash(\"desserts\") = 877"],
      predictAt: 2, predictQ: 'ASCII-суммы: попадут ли <code>"stressed"</code> и <code>"desserts"</code> в один бакет?', console: true,
      scenes: [
        { codeLine: 1, out: "picnic=630 basket=634", caption: '«"picnic" and "basket" would be in <span class="hl">different buckets</span>» <span class="ru-tr">«"picnic" и "basket" попали бы в разные бакеты»</span>: суммы ASCII 630 и 634 — разные хеши, разные бакеты.', nodes: [{ id: "p", kind: "chip", at: { zone: "hash2", row: 0 }, value: "picnic 630" }, { id: "bk", kind: "chip", at: { zone: "hash2", row: 1 }, value: "basket 634" }, { id: "bp", kind: "slot", at: { zone: "chain", row: 0 }, name: "бакет", value: "picnic", accent: true }, { id: "bb", kind: "slot", at: { zone: "chain", row: 1 }, name: "бакет", value: "basket" }], edges: [{ id: "e1", from: "p", to: "bp", accent: true }, { id: "e2", from: "bk", to: "bb" }] },
        { codeLine: 2, out: "stressed=877 desserts=877", caption: '«"stressed" and "desserts" would have the <span class="wrong">same hash code</span> and would be in the <b>same bucket</b>» <span class="ru-tr">«"stressed" и "desserts" имели бы одинаковый хеш-код и попали бы в <b>один и тот же бакет</b>»</span>: 877 == 877 — коллизия.', nodes: [{ id: "s", kind: "chip", at: { zone: "hash2", row: 0 }, value: "stressed 877", accent: true }, { id: "de", kind: "chip", at: { zone: "hash2", row: 1 }, value: "desserts 877", accent: true }, { id: "bc", kind: "slot", at: { zone: "chain", row: 0 }, name: "бакет 877", value: "stressed", accent: true }], edges: [{ id: "e1", from: "s", to: "bc", accent: true }] },
        { codeLine: 2, out: "collide=True", caption: 'Оба легли в один бакет — внутри он держит <span class="hl">цепочку</span>. Поиск в этом бакете сравнивает ключи через <code>Equals</code>, пока не найдёт нужный.', nodes: [{ id: "s", kind: "chip", at: { zone: "hash2", row: 0 }, value: "stressed 877" }, { id: "de", kind: "chip", at: { zone: "hash2", row: 1 }, value: "desserts 877" }, { id: "bc", kind: "obj", at: { zone: "chain", row: 0 }, typeTag: "бакет 877", value: "stressed→desserts", accent: true }], edges: [{ id: "e1", from: "s", to: "bc" }, { id: "e2", from: "de", to: "bc", accent: true }] },
      ],
      explain: 'Хеш не уникален по построению: «It is possible for a hash function to generate the same hash code for two different keys… but a hash function that generates a unique hash code for each unique key results in better performance» <span class="ru-tr">«Хеш-функция может сгенерировать одинаковый хеш-код для двух разных ключей… но хеш-функция, дающая уникальный хеш-код для каждого уникального ключа, обеспечивает лучшую производительность»</span>. Дока даёт наглядный пример на сумме ASCII-кодов: «The string "picnic" would have a hash code that is different from… "basket"; therefore… in different buckets. In contrast, "stressed" and "desserts" would have the <b>same hash code</b> and would be in the <b>same bucket</b>» <span class="ru-tr">«Строка "picnic" имела бы хеш-код, отличный от… "basket"; поэтому… в разных бакетах. Напротив, "stressed" и "desserts" имели бы <b>одинаковый хеш-код</b> и попали бы в <b>один и тот же бакет</b>»</span>. Реальный прогон подтверждает: 630 ≠ 634, но 877 == 877. Коллизия не ошибка — бакет держит цепочку, и поиск в нём идёт через <code>Equals</code>; много коллизий в один бакет и есть тот самый worst-case O(n).',
      sources: ["ms-hashtable-dict"],
    },
    {
      id: "s3", num: "03", kicker: "Контракт · hash + equals", title: "GetHashCode находит бакет, Equals — элемент в нём",
      viewBox: "0 0 340 210", zones: CONTRACT_ZONES,
      code: ["// ключ обязан дать хеш и уметь сравниваться", "d[key] = \"v\";       // hash(key) -> бакет, лежит там", "key.Id = 999;        // мутируем ключ ПОСЛЕ вставки", "d.ContainsKey(key);  // ищет в НОВОМ бакете -> мимо"],
      predictAt: 3, predictQ: 'После <code>key.Id = 999</code> найдёт ли <code>d.ContainsKey(key)</code> запись? (<code>before</code> / <code>after</code>)', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>d[key]="v"</code>: <code>hash(key)</code> при <code>Id=1</code> ведёт в бакет A, запись легла туда. <code>ContainsKey</code> сейчас — <b>True</b>.', nodes: [{ id: "hc", kind: "chip", at: { zone: "contract", row: 0 }, value: "GetHashCode" }, { id: "eq", kind: "chip", at: { zone: "contract", row: 1 }, value: "Equals" }, { id: "ba", kind: "slot", at: { zone: "broken", row: 0 }, name: "бакет A", value: "Id=1 → v", accent: true }], edges: [{ id: "e1", from: "hc", to: "ba", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>key.Id = 999</code>: хеш ключа <span class="wrong">изменился</span>. Запись всё ещё физически в бакете A, но новый <code>hash(key)</code> указывает на бакет B.', nodes: [{ id: "hc", kind: "chip", at: { zone: "contract", row: 0 }, value: "hash → B", accent: true }, { id: "eq", kind: "chip", at: { zone: "contract", row: 1 }, value: "Equals" }, { id: "ba", kind: "slot", at: { zone: "broken", row: 0 }, name: "бакет A", value: "Id=1 → v" }, { id: "bb", kind: "gate", at: { zone: "broken", row: 1 }, state: "fail", label: "бакет B", detail: "пусто", accent: true }], edges: [{ id: "e1", from: "hc", to: "bb", accent: true }] },
        { codeLine: 3, out: "True False", caption: '<code>ContainsKey</code> ищет в бакете B — он <span class="wrong">пуст</span> → <b>False</b>. Запись «потеряна», хотя физически в таблице. Вывод: <b>True False</b> (реальный прогон).', nodes: [{ id: "ba", kind: "slot", at: { zone: "broken", row: 0 }, name: "бакет A", value: "Id=1 → v (сирота)" }, { id: "bb", kind: "gate", at: { zone: "broken", row: 1 }, state: "fail", label: "поиск в B", detail: "мимо", accent: true }], edges: [] },
      ],
      explain: 'Контракт ключа — две согласованные операции. «Each object that is used as an element… must be able to generate a hash code for itself by using an implementation of the <code>GetHashCode</code> method» <span class="ru-tr">«Каждый объект, используемый как элемент… должен уметь генерировать для себя хеш-код через реализацию метода <code>GetHashCode</code>»</span>, а сам Dictionary «requires an equality implementation to determine whether keys are equal» <span class="ru-tr">«требует реализации сравнения на равенство, чтобы определять, равны ли ключи»</span> (по умолчанию <code>EqualityComparer&lt;T&gt;.Default</code>, а если <code>TKey</code> реализует <code>IEquatable&lt;T&gt;</code> — эта реализация). GetHashCode выбирает бакет, Equals находит нужный ключ внутри бакета. Отсюда инвариант: «As long as an object is used as a key… it must not change in any way that affects its <b>hash value</b>» <span class="ru-tr">«Пока объект используется как ключ… он не должен меняться никаким образом, влияющим на его <b>хеш-значение</b>»</span>. Мутация живого ключа уводит его хеш в другой бакет — запись становится сиротой: реальный прогон даёт <code>True</code> до мутации и <code>False</code> после. Переопределять надо <b>оба</b> метода согласованно.',
      sources: ["ms-hashtable-dict", "ms-dictionary"],
    },
    {
      id: "s4", num: "04", kicker: "Порядок · undefined", title: "foreach по Dictionary не хранит порядок вставки",
      viewBox: "0 0 340 210", zones: ORDER_ZONES,
      code: ["d[\"c\"]=1; d[\"a\"]=2; d[\"b\"]=3;   // вставили c, a, b", "foreach (var kv in d) ...          // порядок не гарантирован", "// раскладка по бакетам, а не по времени вставки"],
      scenes: [
        { codeLine: 0, caption: 'Вставили в порядке <b>c, a, b</b>. Кажется, что <code>foreach</code> вернёт их так же — но нет.', nodes: [{ id: "c", kind: "slot", at: { zone: "ins", row: 0 }, name: "1)", value: '"c"', accent: true }, { id: "a", kind: "slot", at: { zone: "ins", row: 1 }, name: "2)", value: '"a"' }, { id: "b", kind: "slot", at: { zone: "ins", row: 2 }, name: "3)", value: '"b"' }], edges: [] },
        { codeLine: 1, caption: 'Каждый ключ лёг в бакет по <span class="hl">своему хешу</span>, а не по времени вставки. Итератор идёт по внутренней раскладке.', nodes: [{ id: "c", kind: "slot", at: { zone: "ins", row: 0 }, name: "1)", value: '"c"' }, { id: "a", kind: "slot", at: { zone: "ins", row: 1 }, name: "2)", value: '"a"' }, { id: "b", kind: "slot", at: { zone: "ins", row: 2 }, name: "3)", value: '"b"' }, { id: "e", kind: "chip", at: { zone: "enum", row: 0 }, value: "hash-раскладка", accent: true }], edges: [] },
        { codeLine: 2, caption: '«The order in which the items are returned is <span class="wrong">undefined</span>» <span class="ru-tr">«Порядок, в котором возвращаются элементы, не определён»</span>. Полагаться на порядок нельзя; нужен порядок — <code>SortedDictionary</code> или <code>List</code> отдельно.', nodes: [{ id: "e", kind: "gate", at: { zone: "enum", row: 0 }, state: "fail", label: "order", detail: "undefined", accent: true }, { id: "kvp", kind: "chip", at: { zone: "enum", row: 1 }, value: "KeyValuePair" }], edges: [] },
      ],
      explain: 'Порядок перечисления <code>Dictionary</code> — не порядок вставки. «The <code>foreach</code> statement… returns an object of the type of the elements… the element type is a <code>KeyValuePair&lt;TKey,TValue&gt;</code>… The order in which the items are returned is <b>undefined</b>» <span class="ru-tr">«Оператор <code>foreach</code>… возвращает объект типа элементов… тип элемента — <code>KeyValuePair&lt;TKey,TValue&gt;</code>… Порядок, в котором возвращаются элементы, <b>не определён</b>»</span>. Причина машинная: элементы разложены по бакетам согласно хешу, а итератор обходит внутреннюю структуру, не журнал вставок. Практический вывод: любой код, который «неявно» опирается на порядок ключей словаря, — баг, который может проявиться после resize или на другой версии рантайма. Нужен детерминированный порядок — берите <code>SortedDictionary&lt;TKey,TValue&gt;</code> (по ключу) или храните последовательность отдельно.',
      sources: ["ms-dictionary"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Resize: внутренний массив _buckets растёт 3 → 7 → 17 → 37",
      viewBox: "0 0 340 214", zones: RESIZE_ZONES,
      code: ["// читаем private _buckets.Length рефлексией", "for (int i=0;i<20;i++) d[i]=i;   // добавляем ключи", "// buckets меняются, когда бакеты переполняются"],
      predictAt: 1, predictQ: 'Внутренний массив <code>_buckets</code> пуст у нового <code>Dictionary</code>. Каким он станет после <b>первого</b> добавления?', console: true,
      scenes: [
        { codeLine: 0, out: "empty: buckets=0", caption: 'Новый <code>Dictionary</code> — <span class="hl">ноль бакетов</span>: внутренний массив ещё не выделен (ленивая аллокация до первого <code>Add</code>).', nodes: [{ id: "b0", kind: "gate", at: { zone: "resize", row: 0, col: 0 }, state: "ok", label: "empty", detail: "0" }], edges: [] },
        { codeLine: 1, out: "count=1 → buckets=3\ncount=4 → buckets=7", caption: 'Первый <code>Add</code> → <span class="hl">3</span> бакета. На 4-м ключе бакеты переполняются, массив реаллоцируется в <span class="hl">7</span>.', nodes: [{ id: "b0", kind: "gate", at: { zone: "resize", row: 0, col: 0 }, state: "ok", label: "1 → 3", detail: "первый add" }, { id: "b1", kind: "gate", at: { zone: "resize", row: 0, col: 1 }, state: "ok", label: "4 → 7", detail: "resize", accent: true }], edges: [] },
        { codeLine: 1, out: "count=8 → buckets=17\ncount=18 → buckets=37", caption: 'Дальше: 8-й ключ → <span class="hl">17</span>, 18-й → <span class="hl">37</span>. Массив бакетов — <b>простые числа</b> (деталь реализации <code>Dictionary.cs</code>), реаллокация с рехешем всех ключей.', nodes: [{ id: "b1", kind: "gate", at: { zone: "resize", row: 0, col: 0 }, state: "ok", label: "4 → 7", detail: "" }, { id: "b2", kind: "gate", at: { zone: "resize", row: 0, col: 1 }, state: "ok", label: "8 → 17", detail: "resize" }, { id: "b3", kind: "gate", at: { zone: "resize", row: 0, col: 2 }, state: "ok", label: "18 → 37", detail: "resize", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятый рост внутреннего массива бакетов, прочитанный рефлексией по private-полю <code>_buckets</code> (провенанс: собственный прогон, .NET 10, <b>деталь реализации</b>, не публичный API). Дока обещает лишь механику: «As elements are added to a <code>Dictionary&lt;TKey,TValue&gt;</code>, the capacity is automatically increased as required by <b>reallocating the internal array</b>» <span class="ru-tr">«По мере добавления элементов в <code>Dictionary&lt;TKey,TValue&gt;</code> ёмкость автоматически увеличивается по мере необходимости через <b>переаллокацию внутреннего массива</b>»</span>. Замер конкретизирует: <b>0 → 3 → 7 → 17 → 37</b> (resize на Count 1/4/8/18). Размеры — <b>простые числа</b> (выбор <code>Dictionary.cs</code> в dotnet/runtime: простое уменьшает кластеризацию при <code>hash % n</code>). Каждый resize — не только новый массив, но и <b>рехеш</b> всех ключей в новые бакеты; это скрытая цена роста, которую убирает заранее заданная capacity в конструкторе.',
      sources: ["ms-dictionary", "runtime-dict"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Хеш = сумма ASCII: <code>hash("stressed")</code> vs <code>hash("desserts")</code>, и <code>hash("picnic")</code> vs <code>hash("basket")</code>. Печать <code>$"{a}=={b} {c}!={d}"</code> где сравниваются равенства сумм — что выведет для <code>(stressed==desserts) (picnic!=basket)</code>?',
      options: ["True True", "True False", "False True", "False False"], correctIndex: 0, xp: 10,
      okText: 'ASCII-суммы: stressed=877=desserts → <b>True</b> (коллизия, один бакет); picnic=630 ≠ basket=634 → <b>True</b> (разные бакеты). Пример прямо из доков.',
      noText: '«stressed» и «desserts» — анаграммы, суммы ASCII равны (877) → коллизия, True. «picnic» (630) и «basket» (634) — разные → picnic!=basket тоже True. Итого <b>True True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True True" }, sourceRefs: ["ms-hashtable-dict"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Ключ с <code>GetHashCode()=>Id</code>: <code>d[key]="v"; bool before=d.ContainsKey(key); key.Id=999; bool after=d.ContainsKey(key);</code> Печать <code>$"{before} {after}"</code> — что выведет?',
      options: ["True False", "True True", "False False", "False True"], correctIndex: 0, xp: 10,
      okText: 'До мутации ключ в своём бакете → <b>True</b>. После <code>key.Id=999</code> хеш уехал в другой бакет, <code>ContainsKey</code> ищет там — пусто → <b>False</b>. Мутация живого ключа ломает поиск.',
      noText: '«it must not change in any way that affects its hash value» <span class="ru-tr">«он не должен меняться никаким образом, влияющим на его хеш-значение»</span>. Меняем <code>Id</code> после вставки — новый хеш ведёт в другой (пустой) бакет. before=True, after=<b>False</b>: запись стала сиротой.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-dictionary"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var d = new Dictionary&lt;string,int&gt;(); d["cat"]=1; d["cat"]=2; Console.WriteLine($"{d.Count} {d["cat"]}");</code> — что напечатает?',
      options: ["1 2", "2 2", "2 1", "1 1"], correctIndex: 0, xp: 10,
      okText: 'Тот же ключ — <b>перезапись</b>, не добавление: <code>Count</code> = 1, значение = 2. «Every key… must be unique» <span class="ru-tr">«Каждый ключ… должен быть уникальным»</span>; повторный индексатор обновляет.',
      noText: 'Ключ <code>"cat"</code> уникален — второе присваивание перезаписывает значение, а не добавляет пару. <code>Count</code> остаётся <b>1</b>, <code>d["cat"]</code> = <b>2</b>. Вывод: <code>1 2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1 2" }, sourceRefs: ["ms-dictionary"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Хеш → бакет", v: 'Dictionary — хеш-таблица: <code>GetHashCode</code> ключа выбирает <b>бакет</b>, <code>Equals</code> находит элемент внутри него. Поиск «close to O(1)» <span class="ru-tr">«близко к O(1)»</span> — идёт в один бакет, не по всей таблице.' },
    { icon: "cost", k: "Коллизии и resize", v: 'Хеш не уникален: разные ключи (<code>stressed</code>/<code>desserts</code>, 877) делят бакет — worst-case O(n). Внутренний массив бакетов растёт реаллокацией с рехешем: реальный замер <b>0→3→7→17→37</b> (простые числа, деталь реализации).' },
    { icon: "avoid", k: "Ловушки ключа", v: '<b>Мутация</b> живого ключа, меняющая хеш, ломает поиск (<code>True→False</code>). Ключ не может быть <code>null</code>. Порядок <code>foreach</code> — <b>undefined</b>. Переопределяй <code>GetHashCode</code> и <code>Equals</code> согласованно.' },
  ],

  foot: 'урок · <b>Dictionary изнутри</b> · 5 разборов · бакеты/коллизии/контракт · панель resize 0→3→7→17→37 · дизайн <b>mid</b>',
};
