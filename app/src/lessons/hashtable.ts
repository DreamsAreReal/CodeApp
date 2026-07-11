/**
 * Lesson: Хеш-таблицы (Dictionary<TKey,TValue>) — коллизии и resize
 * (T2.M5.hashtable) — expert density, 6 animated deep-dives.
 *
 * Every claim carries a source id. All English text inside guillemets « » is
 * verbatim from the Dictionary<TKey,TValue> "Remarks" on learn.microsoft.com
 * (source id `ms-dictionary`), copied character-for-character. Algorithmic
 * facts (average O(1), worst O(n), separate chaining, load factor -> resize)
 * are stated in our own words and attributed to CLRS ch. 11 as a concept
 * source. The .NET internal mechanism (bucket array of indices + entries
 * array, collisions linked by index) is described in our own words and
 * attributed to the Dictionary.cs source link (`ms-dict-src`) — NOT quoted.
 *
 * The diagram uses a bucket-array Zone layout (NOT the stack/heap memory
 * model): buckets = `slot` cells, keys/entries = `chip` nodes, chain links &
 * lookups = ref `edges`, the equality-comparer check = a `gate` node.
 *
 * Ground truth for card `c1` is REAL execution via the backend
 * POST /api/authoring/run-csharp (Roslyn CSharpScript, top-level statements):
 * `d["cat"]=1; d["dog"]=2; d["cat"]=3; Console.WriteLine(d.Count)` prints "2"
 * (re-assigning an existing key overwrites, it does not add).
 * Loop: card `c1` maps to backend review item `T2.M5.hashtable/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Bucket-array backdrop: the bucket table on the left, the incoming key stream
// on the right. This is a data-structure diagram, NOT a stack/heap memory model.
const Z_TABLE: Zone = { x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "МАССИВ BUCKET'ОВ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "size 8 · индекс = hash%8", subCls: "vz-zsub", subY: 47 };
const Z_KEYS: Zone = { x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "КЛЮЧИ", labelCls: "vz-zlabel good sm", lx: 257, ly: 24, sub: "поток вставок", subCls: "vz-zsub good", subY: 47 };
const HT_ZONES: Zone[] = [Z_TABLE, Z_KEYS];

// A wide single-table backdrop for the chaining / worst-case / resize walks.
const Z_WIDE: Zone = { x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "МАССИВ BUCKET'ОВ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "bucket -> entries -> цепочка по индексу", subCls: "vz-zsub", subY: 47 };

export const hashtable: LessonData = {
  id: "T2.M5.hashtable",
  track: "T2",
  module: "M2.5",
  title: "Хеш-таблицы: коллизии и resize",
  kicker: "Ядро .NET · структуры данных · нюанс",
  home: { subtitle: "hash -> bucket, коллизии, resize, семантика ключа", icon: "collections", estMinutes: 10 },
  prereqs: ["T2.M2.closures"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-dictionary", kind: "doc", org: "Microsoft Learn", title: "Dictionary<TKey,TValue> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2", date: "2025-09-01" },
    { id: "ms-dict-src", kind: "src", org: "GitHub · dotnet/runtime", title: "Dictionary.cs (реализация: buckets + entries, цепочка по индексу)", url: "https://github.com/dotnet/runtime/blob/main/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/Dictionary.cs", date: "2025-09-01" },
    { id: "clrs-ch11", kind: "book", org: "MIT Press · CLRS", title: "Introduction to Algorithms — Chapter 11: Hash Tables", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", date: "2022-04-05" },
  ],

  spec: [
    { text: "Средний поиск/вставка/удаление по ключу — амортизированно O(1); худший случай — O(n) при вырожденном хешировании (все ключи в одну цепочку).", source: "clrs-ch11" },
    { text: "«Retrieving a value by using its key is very fast, close to O(1), because the Dictionary<TKey,TValue> class is implemented as a hash table.»", source: "ms-dictionary" },
  ],
  edgeCases: [
    { text: "Плохой/вырожденный хеш кладёт все ключи в один bucket → таблица деградирует в связный список, поиск O(n).", source: "clrs-ch11" },
    { text: "<code>null</code>-ключ запрещён: «A key cannot be null, but a value can be, if its type TValue is a reference type.» → <code>ArgumentNullException</code>.", source: "ms-dictionary" },
    { text: "Порядок обхода не определён: «The order in which the items are returned is undefined.» — не полагайся на порядок вставки.", source: "ms-dictionary" },
  ],

  misconceptions: [
    {
      wrong: "хеш-таблица — это всегда O(1)",
      hook: '«<code>Dictionary</code> — это всегда O(1)» — это правда только <b>в среднем</b>. Внутри — <span class="wrong">массив bucket\'ов</span>, а <code>hash(key)</code> лишь <b>указывает индекс</b>; при коллизиях ключи выстраиваются в <span class="wrong">цепочку</span>, и вырожденный хеш превращает поиск в линейный скан <span class="wrong">O(n)</span>. Скорость «depends on the quality of the hashing algorithm». Ниже — <b>шесть разборов</b>, каждый со своей анимацией и разбором механизма: от индекса bucket\'а и цепочки коллизий до resize с перехешированием и семантики перезаписи ключа.',
      source: "ms-dictionary",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Индекс bucket'а · не перебор", title: "hash(key) указывает bucket напрямую",
      viewBox: "0 0 340 214", zones: HT_ZONES,
      code: ['var d = new Dictionary<string,int>();', 'd["cat"] = 1;   // hash(cat) % 8 = 3', 'd["dog"] = 2;   // hash(dog) % 8 = 6'],
      scenes: [
        { codeLine: 0, caption: 'Таблица — это <b>массив bucket\'ов</b> (здесь size 8). Пусто: все ячейки свободны, ключей нет.', nodes: [
          { id: "b3", kind: "slot", x: 89, y: 96, name: "b3", value: "—" },
          { id: "b6", kind: "slot", x: 89, y: 150, name: "b6", value: "—" },
          { id: "kc", kind: "chip", x: 257, y: 104, value: "cat" },
          { id: "kd", kind: "chip", x: 257, y: 158, value: "dog" },
        ], edges: [] },
        { codeLine: 1, caption: '<code>d["cat"]=1</code>: считаем <span class="hl">hash("cat") % 8 = 3</span> → идём <b>прямо</b> в bucket 3, без перебора.', nodes: [
          { id: "b3", kind: "slot", x: 89, y: 96, name: "b3", value: "cat", accent: true },
          { id: "b6", kind: "slot", x: 89, y: 150, name: "b6", value: "—" },
          { id: "kc", kind: "chip", x: 257, y: 104, value: "cat", accent: true },
          { id: "kd", kind: "chip", x: 257, y: 158, value: "dog" },
        ], edges: [{ id: "e_c", from: "kc", to: "b3", accent: true }] },
        { codeLine: 2, caption: '<code>d["dog"]=2</code>: <span class="hl">hash("dog") % 8 = 6</span> → bucket 6. Разные хеши — разные ячейки, доступ близок к O(1).', nodes: [
          { id: "b3", kind: "slot", x: 89, y: 96, name: "b3", value: "cat" },
          { id: "b6", kind: "slot", x: 89, y: 150, name: "b6", value: "dog", accent: true },
          { id: "kc", kind: "chip", x: 257, y: 104, value: "cat" },
          { id: "kd", kind: "chip", x: 257, y: 158, value: "dog", accent: true },
        ], edges: [{ id: "e_d", from: "kd", to: "b6", accent: true }] },
      ],
      explain: 'Ключ не ищется перебором — <code>hash(key)</code> <b>вычисляет индекс</b> bucket\'а, и таблица идёт туда напрямую. Отсюда почти константный доступ: «Retrieving a value by using its key is very fast, close to O(1), because the Dictionary<TKey,TValue> class is implemented as a hash table». В .NET это буквально массив: bucket\'ы держат индекс в массив записей <code>entries</code>, а сама запись хранит ключ, значение и хеш (механизм по исходнику <code>Dictionary.cs</code>). Индекс = <code>hash % size</code> — вот почему поиск не зависит от числа элементов.',
      sources: ["ms-dictionary", "ms-dict-src", "clrs-ch11"],
    },
    {
      id: "s2", num: "02", kicker: "Коллизия · цепочка", title: "Два ключа в один bucket → цепочка",
      viewBox: "0 0 340 220", zones: [Z_WIDE],
      code: ['d["cat"] = 1;   // hash % 8 = 3', 'd["fox"] = 9;   // hash % 8 = 3  (!)', 'int v = d["fox"];  // lookup'],
      predictAt: 1, predictQ: 'Куда попадёт <code>"fox"</code>, если <code>hash("fox") % 8</code> тоже равен <b>3</b> — туда же, где уже лежит <code>"cat"</code>?',
      scenes: [
        { codeLine: 0, caption: 'В bucket 3 уже лежит запись <code>cat</code> (ключ, значение, хеш).', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 100, name: "b3", value: "→", accent: true },
          { id: "e_cat", kind: "obj", x: 240, y: 112, typeTag: "entry cat", value: "1" },
        ], edges: [{ id: "l", from: "b3", to: "e_cat", accent: true }] },
        { codeLine: 1, caption: '<span class="hl">КОЛЛИЗИЯ</span>: <code>hash("fox") % 8 = 3</code> — тот же bucket. .NET <b>связывает</b> новую запись со старой по индексу → цепочка.', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 100, name: "b3", value: "→", accent: true },
          { id: "e_fox", kind: "obj", x: 176, y: 112, typeTag: "entry fox", value: "9", accent: true },
          { id: "e_cat", kind: "obj", x: 280, y: 112, typeTag: "entry cat", value: "1" },
        ], edges: [{ id: "l", from: "b3", to: "e_fox", accent: true }, { id: "ch", from: "e_fox", to: "e_cat", accent: true }] },
        { codeLine: 2, caption: 'Lookup <code>d["fox"]</code>: bucket 3 → идём по цепочке и <b>сравниваем ключи</b> comparer\'ом до совпадения.', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 88, name: "b3", value: "→" },
          { id: "e_fox", kind: "obj", x: 176, y: 100, typeTag: "entry fox", value: "9", accent: true },
          { id: "e_cat", kind: "obj", x: 280, y: 100, typeTag: "entry cat", value: "1" },
          { id: "eq", kind: "gate", x: 172, y: 180, state: "ok", label: 'Equals("fox","fox")', detail: "✓ ключ найден" },
        ], edges: [{ id: "l", from: "b3", to: "e_fox" }, { id: "ch", from: "e_fox", to: "e_cat" }] },
      ],
      explain: 'Индексов bucket\'ов конечное число, а ключей — сколько угодно, поэтому <b>коллизии неизбежны</b>: два разных ключа дают один индекс. .NET решает это <b>сцеплением по индексу</b> — новая запись в том же bucket\'е ссылается на предыдущую (поле-«next» в массиве <code>entries</code>), образуя цепочку (механизм по исходнику <code>Dictionary.cs</code>). Bucket указывает не на «значение», а на <b>голову цепочки</b>. Поэтому lookup внутри bucket\'а — это не мгновенный ответ, а проход по цепочке со <b>сравнением ключей</b>: «Dictionary<TKey,TValue> requires an equality implementation to determine whether keys are equal».',
      sources: ["ms-dictionary", "ms-dict-src", "clrs-ch11"],
    },
    {
      id: "s3", num: "03", kicker: "Равенство · hash не финал", title: "Совпадение хеша ≠ совпадение ключа",
      viewBox: "0 0 340 216", zones: [Z_WIDE],
      code: ['int v = d["fox"];  // цепочка: fox -> cat', '// шаг 1: Equals("fox","fox")? нет — это cat', '// шаг 2: Equals("fox","cat")? ... по цепочке'],
      scenes: [
        { codeLine: 0, caption: 'Bucket 3 держит цепочку <code>cat → fox</code>. Один хеш — но ключи <b>разные</b>, их надо различить.', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 88, name: "b3", value: "→" },
          { id: "e_cat", kind: "obj", x: 176, y: 100, typeTag: "entry cat", value: "1" },
          { id: "e_fox", kind: "obj", x: 280, y: 100, typeTag: "entry fox", value: "9" },
        ], edges: [{ id: "l", from: "b3", to: "e_cat" }, { id: "ch", from: "e_cat", to: "e_fox" }] },
        { codeLine: 1, caption: 'Шаг 1: сравниваем искомый <code>"fox"</code> с головой цепочки <code>"cat"</code> → <span class="hl">не равны</span>, идём дальше.', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 88, name: "b3", value: "→" },
          { id: "e_cat", kind: "obj", x: 176, y: 100, typeTag: "entry cat", value: "1", accent: true },
          { id: "e_fox", kind: "obj", x: 280, y: 100, typeTag: "entry fox", value: "9" },
          { id: "eq", kind: "gate", x: 172, y: 180, state: "fail", label: 'Equals("fox","cat")', detail: "✗ мимо — next" },
        ], edges: [{ id: "l", from: "b3", to: "e_cat" }, { id: "ch", from: "e_cat", to: "e_fox", accent: true }] },
        { codeLine: 2, caption: 'Шаг 2: сравниваем с <code>"fox"</code> → <span class="hl">равны</span>. Только теперь возвращаем значение <b>9</b>.', nodes: [
          { id: "b3", kind: "slot", x: 64, y: 88, name: "b3", value: "→" },
          { id: "e_cat", kind: "obj", x: 176, y: 100, typeTag: "entry cat", value: "1" },
          { id: "e_fox", kind: "obj", x: 280, y: 100, typeTag: "entry fox", value: "9", accent: true },
          { id: "eq", kind: "gate", x: 172, y: 180, state: "ok", label: 'Equals("fox","fox")', detail: "✓ вернуть 9" },
        ], edges: [{ id: "l", from: "b3", to: "e_cat" }, { id: "ch", from: "e_cat", to: "e_fox" }] },
      ],
      explain: 'Хеш — только <b>адрес bucket\'а</b>, а не доказательство равенства ключей: разные ключи законно делят один хеш. Поэтому внутри bucket\'а таблица обязана сверять <b>сами ключи</b>, а не хеши: «Dictionary<TKey,TValue> requires an equality implementation to determine whether keys are equal» — по умолчанию это <code>EqualityComparer&lt;TKey&gt;.Default</code>. И <b>качество</b> хеша решает всё: «The speed of retrieval depends on the quality of the hashing algorithm of the type specified for TKey» — плохой хеш собьёт ключи в один bucket и превратит поиск в длинную цепочку сравнений.',
      sources: ["ms-dictionary", "clrs-ch11"],
    },
    {
      id: "s4", num: "04", kicker: "Худший случай · O(n)", title: "Вырожденный хеш → линейный скан",
      viewBox: "0 0 340 222", zones: [Z_WIDE],
      code: ['// bad GetHashCode(): всегда возвращает 0', 'class Bad { public override int GetHashCode()=>0; }', 'int v = d[key];   // O(n) скан'],
      scenes: [
        { codeLine: 0, caption: 'Хороший хеш <b>раскидывает</b> ключи по bucket\'ам: короткие цепочки, доступ ~O(1).', nodes: [
          { id: "b1", kind: "slot", x: 88, y: 76, name: "b1", value: "ant" },
          { id: "b3", kind: "slot", x: 88, y: 116, name: "b3", value: "cat" },
          { id: "b6", kind: "slot", x: 88, y: 156, name: "b6", value: "dog" },
          { id: "ok", kind: "gate", x: 256, y: 108, state: "ok", label: "равномерно", detail: "~O(1)" },
        ], edges: [] },
        { codeLine: 1, caption: '<span class="hl">Вырожденный хеш</span> (<code>GetHashCode()=>0</code>): ВСЕ ключи в <b>один</b> bucket 0 → одна длинная цепочка.', nodes: [
          { id: "b0", kind: "slot", x: 52, y: 108, name: "b0", value: "→", accent: true },
          { id: "c1", kind: "chip", x: 118, y: 120, value: "ant", accent: true },
          { id: "c2", kind: "chip", x: 176, y: 120, value: "cat", accent: true },
          { id: "c3", kind: "chip", x: 234, y: 120, value: "dog", accent: true },
          { id: "c4", kind: "chip", x: 292, y: 120, value: "fox", accent: true },
        ], edges: [{ id: "l0", from: "b0", to: "c1", accent: true }, { id: "l1", from: "c1", to: "c2", accent: true }, { id: "l2", from: "c2", to: "c3", accent: true }, { id: "l3", from: "c3", to: "c4", accent: true }] },
        { codeLine: 2, caption: 'Lookup теперь <span class="wrong">линейно</span> обходит всю цепочку из n элементов → <b>O(n)</b>. Хеш-таблица выродилась в список.', nodes: [
          { id: "b0", kind: "slot", x: 52, y: 108, name: "b0", value: "→" },
          { id: "c1", kind: "chip", x: 118, y: 120, value: "ant" },
          { id: "c2", kind: "chip", x: 176, y: 120, value: "cat" },
          { id: "c3", kind: "chip", x: 234, y: 120, value: "dog" },
          { id: "c4", kind: "chip", x: 292, y: 120, value: "fox", accent: true },
          { id: "scan", kind: "gate", x: 172, y: 190, state: "fail", label: "скан n сравнений", detail: "O(n) — деградация" },
        ], edges: [{ id: "l0", from: "b0", to: "c1" }, { id: "l1", from: "c1", to: "c2" }, { id: "l2", from: "c2", to: "c3" }, { id: "l3", from: "c3", to: "c4", accent: true }] },
      ],
      explain: 'Вот почему «хеш-таблица всегда O(1)» — <b>миф</b>: O(1) держится, только пока хеш раскидывает ключи ровно и цепочки короткие. Дай вырожденный хеш (например <code>GetHashCode()</code>, всегда возвращающий одно число) — и все ключи упадут в один bucket, цепочка станет длиной n, а поиск деградирует в <span class="wrong">линейный скан O(n)</span>. Ровно об этом предупреждает документация: «The speed of retrieval depends on the quality of the hashing algorithm of the type specified for TKey». Итог: средний случай — O(1), <b>худший — O(n)</b> (CLRS, гл. 11), и разницу определяет качество <code>GetHashCode</code>.',
      sources: ["ms-dictionary", "clrs-ch11"],
    },
    {
      id: "s5", num: "05", kicker: "Resize · rehash", title: "Рост нагрузки → массив растёт, ключи перехешируются",
      viewBox: "0 0 340 224", zones: [Z_WIDE],
      code: ['// массив заполняется -> нужен рост', '// capacity увеличивается автоматически', 'd.Add("owl", 4);   // триггерит resize 8 -> 16'],
      scenes: [
        { codeLine: 0, caption: 'Массив <b>size 8</b> почти полон: цепочки удлиняются, <span class="hl">фактор загрузки</span> растёт.', nodes: [
          { id: "b3", kind: "slot", x: 88, y: 88, name: "b3", value: "cat → fox" },
          { id: "b6", kind: "slot", x: 88, y: 148, name: "b6", value: "dog → ant" },
          { id: "load", kind: "gate", x: 268, y: 118, state: "fail", label: "load высок", detail: "цепочки ↑" },
        ], edges: [] },
        { codeLine: 1, caption: 'Триггер: .NET <b>реаллоцирует</b> внутренний массив вдвое (8 → <span class="hl">16</span>) — свободных индексов больше.', nodes: [
          { id: "old", kind: "obj", x: 88, y: 118, typeTag: "старый массив", value: "size 8" },
          { id: "new", kind: "obj", x: 252, y: 118, typeTag: "новый массив", value: "size 16", accent: true },
        ], edges: [{ id: "g", from: "old", to: "new", accent: true }] },
        { codeLine: 2, caption: '<b>Rehash</b>: индекс каждого ключа пересчитывается <code>hash % 16</code> и запись переезжает. Цепочки снова короткие → амортизированно O(1).', nodes: [
          { id: "n3", kind: "slot", x: 76, y: 84, name: "b3", value: "cat", accent: true },
          { id: "n6", kind: "slot", x: 200, y: 84, name: "b6", value: "dog" },
          { id: "n11", kind: "slot", x: 76, y: 128, name: "b11", value: "fox", accent: true },
          { id: "n14", kind: "slot", x: 200, y: 128, name: "b14", value: "ant" },
          { id: "ok", kind: "gate", x: 170, y: 190, state: "ok", label: "перераспределено", detail: "hash % 16" },
        ], edges: [] },
      ],
      explain: 'Чтобы цепочки не росли бесконечно, таблица <b>растёт</b> вместе с нагрузкой. Как только заполнение переходит порог, .NET увеличивает ёмкость: «As elements are added to a Dictionary<TKey,TValue>, the capacity is automatically increased as required by reallocating the internal array». Рост — не «дописать в конец»: индекс <code>hash % size</code> зависит от размера, поэтому <b>каждый</b> ключ <span class="hl">перехешируется</span> под новый размер и переезжает в свой bucket. Один resize стоит O(n), но случается редко (размер удваивается), поэтому вставка — <b>амортизированно O(1)</b> (CLRS, гл. 11). Отсюда правило: знаешь размер заранее — задай <code>capacity</code> в конструкторе и избеги лишних rehash.',
      sources: ["ms-dictionary", "clrs-ch11"],
    },
    {
      id: "s6", num: "06", kicker: "Семантика ключа · перезапись", title: "Индексатор перезаписывает, а не добавляет",
      viewBox: "0 0 340 216", zones: [Z_WIDE],
      code: ['d["cat"] = 1;   // вставка', 'd["dog"] = 2;   // вставка (новый ключ)', 'd["cat"] = 3;   // ПЕРЕЗАПИСЬ, не вставка', 'Console.WriteLine(d.Count);   // => 2'],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>d["cat"]=1</code>: ключа ещё нет → <b>вставка</b>. Count = 1.', nodes: [
          { id: "bc", kind: "slot", x: 116, y: 96, name: "cat", value: "1", accent: true },
          { id: "cnt", kind: "chip", x: 280, y: 128, value: "Count 1" },
        ], edges: [] },
        { codeLine: 1, out: "", caption: '<code>d["dog"]=2</code>: <span class="hl">другой</span> ключ → новая запись. Count = 2.', nodes: [
          { id: "bc", kind: "slot", x: 116, y: 88, name: "cat", value: "1" },
          { id: "bd", kind: "slot", x: 116, y: 148, name: "dog", value: "2", accent: true },
          { id: "cnt", kind: "chip", x: 280, y: 118, value: "Count 2" },
        ], edges: [] },
        { codeLine: 2, out: "", caption: '<code>d["cat"]=3</code>: ключ <b>уже есть</b> → индексатор <span class="hl">перезаписывает</span> значение той же записи. Новой строки нет.', nodes: [
          { id: "bc", kind: "slot", x: 116, y: 88, name: "cat", value: "1 → 3", accent: true },
          { id: "bd", kind: "slot", x: 116, y: 148, name: "dog", value: "2" },
          { id: "cnt", kind: "chip", x: 280, y: 118, value: "Count 2" },
        ], edges: [] },
        { codeLine: 3, out: "2", caption: '<code>WriteLine(d.Count)</code> → <b>2</b>: два <span class="hl">уникальных</span> ключа, третья вставка лишь обновила <code>cat</code>.', nodes: [
          { id: "bc", kind: "slot", x: 116, y: 88, name: "cat", value: "3" },
          { id: "bd", kind: "slot", x: 116, y: 148, name: "dog", value: "2" },
          { id: "cnt", kind: "chip", x: 280, y: 118, value: "Count 2", accent: true },
        ], edges: [] },
      ],
      explain: 'Ключ в словаре <b>уникален</b>: «Every key in a Dictionary<TKey,TValue> must be unique according to the dictionary\'s equality comparer. A key cannot be null, but a value can be, if its type TValue is a reference type». Отсюда разница двух путей записи: <code>Add(key,…)</code> на существующем ключе <b>бросает</b> <code>ArgumentException</code>, а <span class="hl">индексатор</span> <code>d[key]=…</code> тихо <b>перезаписывает</b> значение той же записи. Поэтому <code>d["cat"]=1; d["dog"]=2; d["cat"]=3</code> оставляет ровно <b>два</b> ключа: третья запись нашла существующий <code>cat</code> по хешу и равенству и обновила его значение с 1 на 3 — <code>Count</code> остаётся <b>2</b>.',
      sources: ["ms-dictionary"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Что напечатает этот код?<br><code>var d = new Dictionary&lt;string,int&gt;();<br>d["cat"]=1; d["dog"]=2; d["cat"]=3;<br>Console.WriteLine(d.Count);</code>',
      options: ["3", "2", "4", "1"], correctIndex: 1, xp: 10,
      okText: 'Верно — <b>2</b>. Ключ уникален; третья запись <code>d["cat"]=3</code> нашла существующий <code>cat</code> и <span class="hl">перезаписала</span> значение (1 → 3), а не добавила новый ключ. Уникальных ключей — <code>cat</code> и <code>dog</code>.',
      noText: 'Нет — будет <b>2</b>. <code>d["cat"]=3</code> не добавляет ключ, а <span class="hl">перезаписывает</span> уже существующий <code>cat</code>: «Every key … must be unique». В словаре остаются два ключа — <code>cat</code> и <code>dog</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2" }, sourceRefs: ["ms-dictionary"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Зачем хеш-таблица", v: 'Меняем память на скорость: массив bucket\'ов + <code>hash(key)</code> дают доступ по ключу в среднем <span class="hl">O(1)</span>, без перебора.' },
    { icon: "cost", k: "Цена", v: 'Коллизии → цепочки и сравнения ключей; вырожденный хеш → <span class="wrong">O(n)</span>; рост → resize + полный rehash (амортизированно O(1)).' },
    { icon: "avoid", k: "Как не выстрелить", v: 'Хороший <code>GetHashCode</code>/comparer; знаешь размер — задай <code>capacity</code>; помни: индексатор <span class="hl">перезаписывает</span>, а <code>Add</code> на дубле бросает.' },
  ],

  foot: 'урок · <b>hash tables</b> · 6 анимир. разборов · формат <b>lesson-as-data</b> · дизайн <b>mid</b>',
};
