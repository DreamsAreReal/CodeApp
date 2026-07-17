/**
 * Lesson: Хэшируемость и O(1) (PY.M2.collections-hash) — why set/dict lookups are
 * (on average) O(1), why a dict key must be hashable, the tuple-with-a-list trap,
 * set algebra for test assertions, and the 3.7+ dict insertion-order guarantee.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (docs.python.org /
 *     wiki.python.org, URLs fetch-verified 2026-07-15);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see docs/tasks/python-track/evidence/py-cards/census-log.txt;
 *   - complexity claims follow the CPython TimeComplexity wiki: set/dict membership
 *     is AVERAGE O(1), worst-case O(n) (RS-02 A-6 wording fix) — never bare "O(1)".
 *
 * Loop: cards c1..c3 map to backend review items `PY.M2.collections-hash/c{1..3}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: linear scan through a list (left) vs a hash jump into buckets (right).
const Z_SCAN: Zone = { id: "scan", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "X IN LIST", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "сравнения подряд", subCls: "vz-zsub", subY: 47 };
const Z_HASH: Zone = { id: "hash", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "X IN SET", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "hash → бакет", subCls: "vz-zsub heap", subY: 47 };
const SCAN_ZONES: Zone[] = [Z_SCAN, Z_HASH];

// s2/s3: a candidate key on the left, the dict's bucket table on the right.
const Z_KEY: Zone = { id: "key", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "КЛЮЧ", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_BUCKETS: Zone = { id: "buckets", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "BUCKETS", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "таблица dict", subCls: "vz-zsub heap", subY: 47 };
const KEY_ZONES: Zone[] = [Z_KEY, Z_BUCKETS];

// s4: two sets of ids side by side — the test's expectation vs the API's answer.
const Z_EXP: Zone = { id: "exp", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "EXPECTED", labelCls: "vz-zlabel good", lx: 83, ly: 24 };
const Z_ACT: Zone = { id: "act", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ACTUAL", labelCls: "vz-zlabel", lx: 257, ly: 24 };
const SET_ZONES: Zone[] = [Z_EXP, Z_ACT];

// s5: one wide band — the dict as an ordered row of inserted keys.
const Z_ORDER: Zone = { id: "order", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone heap", label: "DICT · ПОРЯДОК ВСТАВКИ", labelCls: "vz-zlabel heap", lx: 170, ly: 24 };
const Z_READ: Zone = { id: "read", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone", label: "ЧТЕНИЕ · LIST(D)", labelCls: "vz-zlabel", lx: 170, ly: 148 };
const ORDER_ZONES: Zone[] = [Z_ORDER, Z_READ];

export const pyCollectionsHash: LessonData = {
  id: "PY.M2.collections-hash",
  track: "PY",
  lang: "python",
  module: "M2.1",
  title: "Хэшируемость и O(1)",
  kicker: "Python · коллекции · механизм",
  home: { subtitle: "tuple — ключ dict, list — TypeError", icon: "collections", estMinutes: 7 },
  prereqs: ["PY.M1.names-objects"],
  depth: 3,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-tut-ds", kind: "doc", org: "docs.python.org", title: "Tutorial · Data Structures", url: "https://docs.python.org/3/tutorial/datastructures.html", date: "2026-07-15" },
    { id: "py-glossary-hashable", kind: "doc", org: "docs.python.org", title: "Glossary · hashable", url: "https://docs.python.org/3/glossary.html#term-hashable", date: "2026-07-15" },
    { id: "py-wiki-tc", kind: "wiki", org: "wiki.python.org", title: "TimeComplexity (CPython wiki)", url: "https://wiki.python.org/moin/TimeComplexity", date: "2026-07-15" },
    { id: "py-whatsnew37", kind: "doc", org: "docs.python.org", title: "What's New In Python 3.7", url: "https://docs.python.org/3/whatsnew/3.7.html", date: "2026-07-15" },
    { id: "py-stdtypes-dict", kind: "doc", org: "docs.python.org", title: "Built-in Types · Mapping Types — dict", url: "https://docs.python.org/3/library/stdtypes.html#mapping-types-dict", date: "2026-07-15" },
  ],

  spec: [
    { text: "«Hashable objects which compare equal must have the same hash value.»", source: "py-glossary-hashable" },
  ],
  edgeCases: [
    { text: "<code>x in set</code> — <b>в среднем</b> O(1); worst-case O(n) при коллизиях (CPython TimeComplexity). Готовый follow-up собеса — не говори «просто O(1)».", source: "py-wiki-tc" },
    { text: "Tuple с mutable-содержимым нехэшируем: <code>{(1, [2]): 1}</code> → <code>TypeError</code> — хэш обязан не меняться за время жизни объекта.", source: "py-glossary-hashable" },
    { text: "Порядок <b>set</b> спекой не гарантирован — в assert-ах сравнивай множества, не их распечатку; порядок <b>dict</b> — гарантия языка с 3.7.", source: "py-whatsnew37" },
  ],

  misconceptions: [
    {
      wrong: "разница list/set/tuple — «изменяемый / неизменяемый / неупорядоченный»",
      hook: 'На собесе этого <span class="wrong">мало</span> — заученная тройка слов не отвечает на «зачем set вообще нужен» и «почему tuple может быть ключом dict». Настоящая разница живёт в <b>хэш-таблице</b>: set и dict находят элемент <span class="hl">прыжком по хэшу</span> — в среднем O(1) против O(n) сканом списка, — а ключом может быть только <b>хэшируемое</b> («Hashable objects which compare equal must have the same hash value»). Ниже — пять разборов: скан против бакетов, TypeError list-ключа, ловушка tuple-с-списком, set-алгебра для диффов и гарантия порядка dict.',
      source: "py-glossary-hashable",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Поиск · скан против хэш-прыжка", title: "x in list — O(n), x in set — в среднем O(1)",
      viewBox: "0 0 340 260", zones: SCAN_ZONES,
      code: ["99 in [17, 42, 99]   # скан", "99 in {17, 42, 99}   # hash"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Список не знает, <b>где</b> лежит 99: проверка идёт <span class="hl">подряд</span>. Сравнение №1 — <code>17 == 99</code>? Нет.',
          nodes: [
            { id: "l17", kind: "chip", at: { zone: "scan", row: 0 }, value: "17 == 99? нет", accent: true },
            { id: "l42", kind: "chip", at: { zone: "scan", row: 1 }, value: "42" },
            { id: "l99", kind: "chip", at: { zone: "scan", row: 2 }, value: "99" },
          ],
          edges: [],
        },
        {
          codeLine: 0,
          caption: 'Сравнение №2 — снова мимо. На списке из n элементов таких шагов до <span class="hl">n</span>: это и есть O(n).',
          nodes: [
            { id: "l17", kind: "chip", at: { zone: "scan", row: 0 }, value: "17", ghost: true },
            { id: "l42", kind: "chip", at: { zone: "scan", row: 1 }, value: "42 == 99? нет", accent: true },
            { id: "l99", kind: "chip", at: { zone: "scan", row: 2 }, value: "99" },
          ],
          edges: [],
        },
        {
          codeLine: 0,
          caption: 'Только третье сравнение находит элемент. В тесте, который гоняет <code>x in big_list</code> в цикле, это превращается в O(n²).',
          nodes: [
            { id: "l17", kind: "chip", at: { zone: "scan", row: 0 }, value: "17", ghost: true },
            { id: "l42", kind: "chip", at: { zone: "scan", row: 1 }, value: "42", ghost: true },
            { id: "l99", kind: "chip", at: { zone: "scan", row: 2 }, value: "99 ✓", accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: 'Set считает <code>hash(99)</code> и <span class="hl">прыгает сразу в бакет</span> — в среднем <b>одно</b> сравнение. Worst-case при коллизиях — O(n), но хэш-функция делает их редкими.',
          nodes: [
            { id: "l17", kind: "chip", at: { zone: "scan", row: 0 }, value: "17", ghost: true },
            { id: "l42", kind: "chip", at: { zone: "scan", row: 1 }, value: "42", ghost: true },
            { id: "l99", kind: "chip", at: { zone: "scan", row: 2 }, value: "99", ghost: true },
            { id: "hgate", kind: "gate", at: { zone: "hash", row: 0 }, state: "ok", label: "hash(99) → бакет", detail: "99 ✓ · 1 сравнение" },
          ],
          edges: [],
        },
      ],
      explain: 'Механика: список хранит элементы подряд и вынужден сравнивать по одному; хэш-таблица считает от элемента число (<code>hash(x)</code>) и по нему сразу знает бакет. По таблице сложности CPython membership-проверка <code>x in s</code> для set/dict — average O(1), worst O(n); для list — O(n). Отсюда рабочее правило AQA: большая выборка, по которой много проверок «есть ли» — это <code>set</code>, не <code>list</code>. Worst-case оговорку держи наготове: «в среднем O(1), при коллизиях O(n)» — стандартный follow-up после ответа «O(1)».',
      sources: ["py-wiki-tc", "py-tut-ds"],
    },

    {
      id: "s2", num: "02", kicker: "Ключ dict · контракт хэшируемости", title: "tuple — ключ; list — TypeError",
      viewBox: "0 0 340 260", zones: KEY_ZONES,
      code: ['d[(1, 2)] = "ok"     # tuple', 'd[[1, 2]] = "no"     # list'],
      console: true,
      predictAt: 1,
      predictQ: "Теперь ключом идёт list [1, 2] — что произойдёт при выполнении этой строки?",
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Кортеж <code>(1, 2)</code> хэшируем: dict считает <code>hash((1, 2))</code> и кладёт пару в бакет. Составной ключ вида <code>(host, port)</code> — легален.',
          nodes: [
            { id: "kt", kind: "obj", at: { zone: "key", row: 0 }, typeTag: "tuple", value: "(1, 2)", accent: true },
            { id: "g1", kind: "gate", at: { zone: "buckets", row: 0 }, state: "ok", label: "hash((1, 2))", detail: "→ бакет" },
          ],
          edges: [{ id: "e1", from: "kt", to: "g1", accent: true }],
        },
        {
          codeLine: 1, out: "TypeError",
          caption: 'Список — <b>нехэшируем</b>: «You can\'t use lists as keys». CPython отвечает <code>TypeError</code> ещё на входе в таблицу.',
          nodes: [
            { id: "kl", kind: "obj", at: { zone: "key", row: 0 }, typeTag: "list", value: "[1, 2]", accent: true },
            { id: "g2", kind: "gate", at: { zone: "buckets", row: 0 }, state: "fail", label: "hash([1, 2])", detail: "TypeError · unhashable" },
          ],
          edges: [{ id: "e2", from: "kl", to: "g2", accent: true }],
        },
        {
          codeLine: 1, out: "TypeError",
          caption: 'Почему запрет жёсткий: хэш обязан <span class="hl">не меняться за время жизни</span> объекта, а list мутирует — «положили в один бакет, изменили, ищем в другом» сломало бы таблицу.',
          nodes: [
            { id: "why", kind: "gate", at: { zone: "key", row: 0 }, state: "fail", label: "list мутирует", detail: "hash «уплыл» бы" },
            { id: "law", kind: "gate", at: { zone: "buckets", row: 0 }, state: "ok", label: "hash стабилен", detail: "контракт ключа" },
          ],
          edges: [],
        },
      ],
      explain: 'Контракт из глоссария: «Hashable objects which compare equal must have the same hash value» — и хэш не должен меняться за время жизни объекта. Tuple неизменяем — его хэш стабилен, поэтому он годится в ключи dict и в элементы set. List изменяем: положи его в бакет — а после <code>append</code> хэш стал бы другим, и таблица потеряла бы запись. Поэтому запрет — на входе: «You can\'t use lists as keys» (Tutorial), <code>TypeError: unhashable type</code>. В тестах это же правило разрешает составные ключи-кортежи: <code>results[(env, browser)]</code>.',
      sources: ["py-glossary-hashable", "py-tut-ds"],
    },

    {
      id: "s3", num: "03", kicker: "Ловушка · хэшируемость смотрит вглубь", title: "tuple со списком внутри — уже не ключ",
      viewBox: "0 0 340 260", zones: KEY_ZONES,
      code: ["t = (1, [2, 3])", "d[t] = 1   # ?"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Слоты кортежа заморожены, но слот №1 держит <span class="hl">ссылку на mutable-список</span> — знакомая картина из урока «Имена и объекты».',
          nodes: [
            { id: "t", kind: "obj", at: { zone: "key", row: 0 }, typeTag: "tuple", accent: true },
            { id: "inner", kind: "chip", at: { in: "t" }, value: "1 · [2, 3]" },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "TypeError",
          caption: '<code>hash(t)</code> считается из хэшей содержимого — а у списка хэша <b>нет</b>. Кортеж «хэшируем, если внутри только хэшируемое».',
          nodes: [
            { id: "t", kind: "obj", at: { zone: "key", row: 0 }, typeTag: "tuple", accent: true },
            { id: "inner", kind: "chip", at: { in: "t" }, value: "1 · [2, 3]" },
            { id: "g", kind: "gate", at: { zone: "buckets", row: 0 }, state: "fail", label: "hash(t)", detail: "TypeError" },
          ],
          edges: [{ id: "e", from: "t", to: "g", accent: true }],
        },
      ],
      explain: 'Хэш кортежа — функция от хэшей его элементов, поэтому «неизменяемый контейнер» — ещё не гарантия ключа: <code>(1, [2, 3])</code> падает с <code>TypeError</code>, как только dict пытается его хэшировать. Это прямое продолжение «мелкой неизменяемости» из урока про имена: tuple замораживает <b>ссылки</b>, а не объекты за ними. Практический тест на собесе: «может ли tuple быть ключом dict?» — «да, если внутри только хэшируемое» — и сразу пример с вложенным списком.',
      sources: ["py-glossary-hashable", "py-tut-ds"],
    },

    {
      id: "s4", num: "04", kicker: "Set-алгебра · диффы в assert-ах", title: "expected - actual: что пропало из ответа",
      viewBox: "0 0 340 260", zones: SET_ZONES,
      code: ["missing = expected - actual", "extra   = actual - expected"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Тест ждёт ID <code>{1, 2, 3}</code>, API вернул <code>{1, 3}</code>. Сравнивать распечатки — хрупко; сравнивать <span class="hl">множества</span> — точно.',
          nodes: [
            { id: "e1", kind: "chip", at: { zone: "exp", row: 0 }, value: "id: 1" },
            { id: "e2", kind: "chip", at: { zone: "exp", row: 1 }, value: "id: 2" },
            { id: "e3", kind: "chip", at: { zone: "exp", row: 2 }, value: "id: 3" },
            { id: "a1", kind: "chip", at: { zone: "act", row: 0 }, value: "id: 1" },
            { id: "a3", kind: "chip", at: { zone: "act", row: 2 }, value: "id: 3" },
          ],
          edges: [],
        },
        {
          codeLine: 0,
          caption: '<code>expected - actual</code> → <code>{2}</code>: разность множеств называет <b>пропавший ID</b> сама — и «A set is an unordered collection with no duplicate elements», дубликаты не замаскируют дыру.',
          nodes: [
            { id: "e1", kind: "chip", at: { zone: "exp", row: 0 }, value: "id: 1", ghost: true },
            { id: "e2", kind: "chip", at: { zone: "exp", row: 1 }, value: "id: 2 пропал", w: 120, accent: true },
            { id: "e3", kind: "chip", at: { zone: "exp", row: 2 }, value: "id: 3", ghost: true },
            { id: "a1", kind: "chip", at: { zone: "act", row: 0 }, value: "id: 1", ghost: true },
            { id: "a3", kind: "chip", at: { zone: "act", row: 2 }, value: "id: 3", ghost: true },
          ],
          edges: [],
        },
      ],
      explain: 'Set-операции — готовый язык диффов для проверок: <code>expected - actual</code> — чего не хватает, <code>actual - expected</code> — что лишнее, <code>&</code> — пересечение, <code>^</code> — расхождение с обеих сторон. Это одновременно и быстрее (каждая проверка — average O(1)), и честнее: «A set is an unordered collection with no duplicate elements» — сравнение не зависит ни от порядка ответа API, ни от дублей. Одно «но» для отчётов: порядок элементов set спекой не гарантирован — в лог печатай <code>sorted(missing)</code>.',
      sources: ["py-tut-ds", "py-wiki-tc"],
    },

    {
      id: "s5", num: "05", kicker: "Порядок · гарантия, не случайность", title: "dict помнит порядок вставки — это спека (3.7+)",
      viewBox: "0 0 340 260", zones: ORDER_ZONES,
      code: ['d["b"] = 1; d["a"] = 2; d["c"] = 3', "print(list(d))"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Ключи входят в dict в порядке <code>b → a → c</code>.',
          nodes: [
            { id: "kb", kind: "chip", at: { zone: "order", row: 0, col: 0 }, value: '"b": 1', accent: true },
            { id: "ka", kind: "chip", at: { zone: "order", row: 0, col: 1 }, value: '"a": 2' },
            { id: "kc", kind: "chip", at: { zone: "order", row: 0, col: 2 }, value: '"c": 3' },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "['b', 'a', 'c']",
          caption: 'Итерация возвращает <span class="hl">порядок вставки</span>, не алфавит: <code>[\'b\', \'a\', \'c\']</code> (реальный прогон python3.12). С 3.7 это <b>часть спецификации языка</b>.',
          nodes: [
            { id: "kb", kind: "chip", at: { zone: "order", row: 0, col: 0 }, value: '"b": 1' },
            { id: "ka", kind: "chip", at: { zone: "order", row: 0, col: 1 }, value: '"a": 2' },
            { id: "kc", kind: "chip", at: { zone: "order", row: 0, col: 2 }, value: '"c": 3' },
            { id: "rb", kind: "chip", at: { zone: "read", row: 0, col: 0 }, value: "'b'", accent: true },
            { id: "ra", kind: "chip", at: { zone: "read", row: 0, col: 1 }, value: "'a'", accent: true },
            { id: "rc", kind: "chip", at: { zone: "read", row: 0, col: 2 }, value: "'c'", accent: true },
          ],
          edges: [
            { id: "ob", from: "kb", to: "rb", accent: true },
            { id: "oa", from: "ka", to: "ra", accent: true },
            { id: "oc", from: "kc", to: "rc", accent: true },
          ],
        },
      ],
      explain: 'С Python 3.7 порядок вставки — норма, на которую можно опираться: «the insertion-order preservation nature of dict objects has been declared to be an official part of the Python language spec» (What\'s New In Python 3.7). Значит, JSON-подобные структуры в тестах сохраняют порядок полей, каким его собрали. Держи границу чёткой: у <b>dict</b> порядок гарантирован, у <b>set</b> — нет; распечатка set может меняться от запуска к запуску, и assert по её тексту — флак.',
      sources: ["py-whatsnew37", "py-stdtypes-dict"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>d = {}; d[(1, 2)] = "ok"</code><br/><code>try: d[[1, 2]] = "no"<br/>except TypeError: print("TypeError")</code><br/><code>print(d[(1, 2)])</code> — что напечатают обе строки?',
      options: ["TypeError и ok", "ok и ok", "TypeError и KeyError", "ничего и ok"], correctIndex: 0, xp: 10,
      okText: 'Ключ dict обязан быть хэшируемым: tuple — да, list — нет («You can\'t use lists as keys»), поэтому вторая вставка падает <code>TypeError</code>, а первая пара живёт: <code>ok</code>. Составные ключи в тестах — кортежи: <code>(env, browser)</code>.',
      noText: 'Разведи два ключа: <code>(1, 2)</code> — tuple, хэшируем, вставка прошла; <code>[1, 2]</code> — list, нехэшируем → <code>TypeError</code> (пойман <code>except</code>). Реальный вывод python3.12: <code>TypeError</code>, затем <code>ok</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M2_c1.py", expect: "TypeError\nok" },
      sourceRefs: ["py-tut-ds", "py-glossary-hashable"],
    },
    {
      // MODIFY rung: c1's illegal list key frozen into a tuple — same data, legal key.
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Ключ из первой карточки <b>починили</b> заморозкой:<br/><code>lst = [1, 2]; d = {}</code><br/><code>d[tuple(lst)] = "ok"</code><br/><code>print(d[(1, 2)])</code> затем <code>print((1, 2) in d)</code> — что напечатают обе строки?',
      options: ["ok и True", "KeyError", "ok и False", "TypeError и False"], correctIndex: 0, xp: 10,
      okText: '<code>tuple(lst)</code> строит хэшируемую копию данных — и <code>hash((1, 2))</code> у любого равного кортежа одинаков: «Hashable objects which compare equal must have the same hash value». Поэтому и чтение по литералу <code>(1, 2)</code>, и <code>in</code> находят запись: <code>ok</code>, <code>True</code>.',
      noText: 'Ключом стал кортеж <code>(1, 2)</code> — а равные кортежи обязаны иметь равный хэш («Hashable objects which compare equal must have the same hash value»), так что литерал <code>(1, 2)</code> попадает в тот же бакет. Реальный вывод python3.12: <code>ok</code>, затем <code>True</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M2_c2.py", expect: "ok\nTrue" },
      sourceRefs: ["py-glossary-hashable"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>d = {}; d["b"] = 1; d["a"] = 2; d["c"] = 3</code><br/><code>print(list(d))</code> — что напечатает?',
      options: ["['b', 'a', 'c']", "['a', 'b', 'c']", "порядок не определён", "['c', 'a', 'b']"], correctIndex: 0, xp: 10,
      okText: 'Dict сохраняет <span class="hl">порядок вставки</span> — с 3.7 это официальная часть спецификации языка, не деталь реализации: <code>[\'b\', \'a\', \'c\']</code>. Не путай с set — там порядок не гарантирован.',
      noText: 'Не алфавит и не «не определён»: с Python 3.7 «the insertion-order preservation nature of dict objects has been declared to be an official part of the Python language spec». Ключи выходят как входили: <code>[\'b\', \'a\', \'c\']</code> (реальный прогон python3.12).',
      verify: { kind: "exec", run: "python3.12 PY.M2_c3.py", expect: "['b', 'a', 'c']" },
      sourceRefs: ["py-whatsnew37"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Большая выборка + много проверок «есть ли» — <code>set</code> (average O(1) membership); диффы ответов API — <code>expected - actual</code> / <code>actual - expected</code>; составной ключ кэша или результатов — tuple <code>(env, browser)</code>.' },
    { icon: "cost", k: "Скан в цикле", v: '<code>x in list</code> внутри цикла по n элементам — O(n²): на тысячах записей тест «вдруг» минутами жуёт данные. Один <code>set(...)</code> на входе убирает всю полку сложности.' },
    { icon: "avoid", k: "Порядок и хэш", v: 'Не полагайся на порядок set (спека не обещает) и не бери в ключи ничего mutable — даже спрятанного внутрь tuple: <code>(1, [2])</code> → TypeError. Порядок dict — гарантирован (3.7+).' },
  ],

  foot: 'урок · <b>хэшируемость и O(1)</b> · 5 анимир. разборов · buckets · set-алгебра · дизайн <b>mid</b>',
};
