/**
 * Lesson: stdlib + idioms cheatsheet (PY.M13.stdlib-idioms) — the P2 reference
 * sections of the user's md (§13 stdlib, §14 files/pathlib, §15 idioms) kept as
 * a CHEATSHEET lesson: three story segments where there IS a mechanism to
 * animate (pathlib path as an object, json round-trip with the key-coercion
 * trap, EAFP vs LBYL) plus a 6-card predict deck for the everyday API
 * (truthiness, enumerate/zip). Per the gate decision, cheatsheets carry a
 * predict deck WITHOUT the mandatory modify/explain ladder (features.md header).
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the live docs (pathlib, json,
 *     glossary EAFP/LBYL, stdtypes truth-value testing, functions zip/
 *     enumerate); all passages fetch-verified against the live pages on
 *     2026-07-17;
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt;
 *   - all console outputs come from executed spikes: evidence/spikes/
 *     f13_{pathlib,glob,json_roundtrip,eafp,truthiness,enumerate_zip}_out.txt
 *     (each run x2).
 *
 * Loop: cards c1..c6 map to backend review items `PY.M13.stdlib-idioms/c{1..6}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the pure path object over its computed results.
const Z_PATH: Zone = { id: "pathz", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "PATHLIB · ОБЪЕКТ ПУТИ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_PRES: Zone = { id: "pres", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "РЕЗУЛЬТАТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const PATH_ZONES: Zone[] = [Z_PATH, Z_PRES];

// s2: live Python objects over the JSON wire string.
const Z_PYOBJ: Zone = { id: "pyobj", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "PYTHON · ЖИВЫЕ ОБЪЕКТЫ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_WIRE: Zone = { id: "wire", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "JSON · СТРОКА", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const JSON_ZONES: Zone[] = [Z_PYOBJ, Z_WIRE];

// s3: the look-before-you-leap check over the try/except path.
const Z_LBYL: Zone = { id: "lbyl", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "LBYL · ПРОВЕРЬ ЗАРАНЕЕ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_EAFP: Zone = { id: "eafp", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "EAFP · TRY / EXCEPT", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const EAFP_ZONES: Zone[] = [Z_LBYL, Z_EAFP];

export const pyStdlibIdioms: LessonData = {
  id: "PY.M13.stdlib-idioms",
  track: "PY",
  lang: "python",
  module: "M13.1",
  title: "Шпаргалка: stdlib и идиомы",
  kicker: "Python · шпаргалка · stdlib и идиомы",
  home: { subtitle: "pathlib, json, EAFP, truthiness, zip", icon: "types", estMinutes: 6 },
  prereqs: ["PY.M9.exceptions"],
  depth: 3,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-pathlib", kind: "doc", org: "docs.python.org", title: "pathlib — Object-oriented filesystem paths", url: "https://docs.python.org/3/library/pathlib.html", date: "2026-07-17" },
    { id: "py-json", kind: "doc", org: "docs.python.org", title: "json — JSON encoder and decoder", url: "https://docs.python.org/3/library/json.html", date: "2026-07-17" },
    { id: "py-glossary", kind: "doc", org: "docs.python.org", title: "Glossary — EAFP / LBYL", url: "https://docs.python.org/3/glossary.html#term-EAFP", date: "2026-07-17" },
    { id: "py-truth", kind: "doc", org: "docs.python.org", title: "Built-in Types — Truth Value Testing", url: "https://docs.python.org/3/library/stdtypes.html#truth-value-testing", date: "2026-07-17" },
    { id: "py-funcs", kind: "doc", org: "docs.python.org", title: "Built-in Functions — zip / enumerate", url: "https://docs.python.org/3/library/functions.html#zip", date: "2026-07-17" },
  ],

  spec: [
    { text: "«Keys in key/value pairs of JSON are always of the type str. When a dictionary is converted into JSON, all the keys of the dictionary are coerced to strings.»", source: "py-json" },
  ],
  edgeCases: [
    { text: "zip обрывается на короткой стороне: «By default, zip() stops when the shortest iterable is exhausted.» — <code>zip([1, 2, 3], \"ab\")</code> даёт две пары (спайк ×2).", source: "py-funcs" },
    { text: "Falsy — только пустое и нулевое: «empty sequences and collections: '', (), [], {}, set(), range(0)». Непустая строка <code>\"0\"</code> и список <code>[0]</code> — truthy (спайк ×2).", source: "py-truth" },
    { text: "Порядок glob не обещан: «The paths are returned in no particular order. If you need a specific order, sort the results.» — в assert только <code>sorted(...)</code>.", source: "py-pathlib" },
  ],

  misconceptions: [
    {
      wrong: "Безопасно взять ключ можно только проверив заранее: if key in d — а try/except это дорогой хак",
      hook: 'Собес-блок конспекта §15. Рефлекс из C-подобных языков — LBYL («look before you leap»: проверь, потом бери). Глоссарий Python называет питоничным обратный стиль: «Easier to ask for forgiveness than permission. This common Python coding style assumes the existence of valid keys or attributes and catches exceptions if the assumption proves false.» Ниже шпаргалка ежедневного stdlib: путь как объект (pathlib), json round-trip с ловушкой ключей, EAFP против LBYL — и колода на truthiness/zip/enumerate.',
      source: "py-glossary",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "pathlib · путь — объект", title: "Слэш собирает путь, I/O не нужен",
      viewBox: "0 0 340 260", zones: PATH_ZONES,
      code: ['p = Path("tests") / "users.json"', "print(p.suffix, p.stem)", 'g = Path("tests").glob("test_*.py")', "print(sorted(f.name for f in g))"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Оператор <code>/</code> строит дочерний путь из частей — получился <b>объект</b> <code>tests/users.json</code>, файловая система не тронута.',
          nodes: [
            { id: "pa", kind: "chip", at: { zone: "pathz", row: 0, col: 0 }, value: 'Path("tests")', w: 120, accent: true },
            { id: "pb", kind: "chip", at: { zone: "pathz", row: 0, col: 1 }, value: '/ "users.json"', w: 144, accent: true },
            { id: "pr", kind: "chip", at: { zone: "pres", row: 0, col: 0 }, value: "tests/users.json", w: 144, accent: true },
            { id: "pn", kind: "chip", at: { zone: "pres", row: 0, col: 1 }, value: "новый Path", w: 96 },
          ],
          edges: [{ id: "ep1", from: "pb", to: "pr", accent: true }],
        },
        {
          codeLine: 1, out: ".json users",
          caption: 'Анатомия без I/O: <code>suffix</code> — последний точечный кусок, <code>stem</code> — имя без него. Путь не обязан существовать.',
          nodes: [
            { id: "pr2", kind: "chip", at: { zone: "pathz", row: 0 }, value: "tests/users.json", w: 144, accent: true },
            { id: "sx", kind: "chip", at: { zone: "pres", row: 0, col: 0 }, value: "suffix · .json", w: 144, accent: true },
            { id: "st", kind: "chip", at: { zone: "pres", row: 0, col: 1 }, value: "stem · users", w: 120, accent: true },
          ],
          edges: [{ id: "ep2", from: "pr2", to: "sx", accent: true }],
        },
        {
          codeLine: 3, out: ".json users\n['test_cart.py', 'test_login.py']",
          caption: '<code>glob</code> — уже I/O: паттерн <code>test_*.py</code> пропускает два файла, <code>conftest.py</code> и <code>readme.md</code> отсеяны. Порядок не обещан — в консоли <code>sorted</code>.',
          nodes: [
            { id: "gp", kind: "chip", at: { zone: "pathz", row: 0, col: 0 }, value: "glob · test_*.py", w: 168, accent: true },
            { id: "gio", kind: "chip", at: { zone: "pathz", row: 0, col: 1 }, value: "I/O", w: 56 },
            { id: "fl1", kind: "chip", at: { zone: "pres", row: 0, col: 0 }, value: "test_login.py", w: 120, accent: true },
            { id: "fl2", kind: "chip", at: { zone: "pres", row: 0, col: 1 }, value: "test_cart.py", w: 120, accent: true },
            { id: "fl3", kind: "chip", at: { zone: "pres", row: 1, col: 0 }, value: "conftest.py", w: 120, ghost: true },
            { id: "fl4", kind: "chip", at: { zone: "pres", row: 1, col: 1 }, value: "readme.md", w: 96, ghost: true },
          ],
          edges: [],
        },
      ],
      explain: 'Модуль по норме docs: «This module offers classes representing filesystem paths with semantics appropriate for different operating systems», а слэш — штатный конструктор: «The slash operator helps create child paths, like os.path.join()». Ключевое деление: «Path classes are divided between pure paths, which provide purely computational operations without I/O, and concrete paths, which inherit from pure paths but also provide I/O operations» — <code>suffix</code>/<code>stem</code>/<code>parts</code> считаются без диска (спайк ×2), а <code>glob</code>/<code>read_text</code> уже ходят в ФС. Порядок glob не гарантирован — фиксируй <code>sorted()</code>.',
      sources: ["py-pathlib"],
    },

    {
      id: "s2", num: "02", kicker: "json · round-trip", title: "dumps → loads: ключи выйдут строками",
      viewBox: "0 0 340 260", zones: JSON_ZONES,
      code: ['d = {"id": 1, "ok": True, "err": None}', "s = json.dumps(d); print(s)", 'print(json.loads(s)["id"] + 1)', 'print(json.loads(json.dumps({1: "a"})))'],
      console: true,
      predictAt: 2,
      predictQ: 'json.dumps({1: "a"}) сериализует ключ-int, затем json.loads разбирает обратно. Что напечатается — {1: \'a\'} или {\'1\': \'a\'}?',
      scenes: [
        {
          codeLine: 1, out: '{"id": 1, "ok": true, "err": null}',
          caption: '<code>dumps</code> переводит по таблице конверсии: <code>True</code> → <code>true</code>, <code>None</code> → <code>null</code>, кавычки двойные — это уже <b>строка</b>.',
          nodes: [
            { id: "ok1", kind: "chip", at: { zone: "pyobj", row: 0, col: 0 }, value: "ok · True", w: 96, accent: true },
            { id: "er1", kind: "chip", at: { zone: "pyobj", row: 0, col: 1 }, value: "err · None", w: 96, accent: true },
            { id: "jok", kind: "chip", at: { zone: "wire", row: 0, col: 0 }, value: '"ok": true', w: 96, accent: true },
            { id: "jer", kind: "chip", at: { zone: "wire", row: 0, col: 1 }, value: '"err": null', w: 120, accent: true },
          ],
          edges: [{ id: "ej1", from: "ok1", to: "jok", accent: true }, { id: "ej2", from: "er1", to: "jer" }],
        },
        {
          codeLine: 2, out: '{"id": 1, "ok": true, "err": null}\n2',
          caption: '<code>loads</code> возвращает живые объекты: <code>d["id"]</code> — снова <code>int</code>, арифметика работает: <code>1 + 1 = 2</code>.',
          nodes: [
            { id: "ld", kind: "chip", at: { zone: "pyobj", row: 0, col: 0 }, value: "loads(s)", w: 96, accent: true },
            { id: "idc", kind: "chip", at: { zone: "pyobj", row: 0, col: 1 }, value: "id · 1 (int)", w: 120, accent: true },
            { id: "js2", kind: "chip", at: { zone: "wire", row: 0 }, value: "строка не тронута", w: 168, ghost: true },
          ],
          edges: [{ id: "ej3", from: "js2", to: "ld", accent: true }],
        },
        {
          codeLine: 3, out: '{"id": 1, "ok": true, "err": null}\n2\n{\'1\': \'a\'}',
          caption: 'Ловушка: JSON-ключ бывает <b>только строкой</b> — int-ключ <code>1</code> коэрчится в <code>"1"</code>, обратно приезжает <code>{\'1\': \'a\'}</code>, и он <span class="wrong">не равен</span> исходному.',
          nodes: [
            { id: "ik", kind: "chip", at: { zone: "pyobj", row: 0, col: 0 }, value: '{1: "a"}', w: 96, accent: true },
            { id: "ika", kind: "chip", at: { zone: "pyobj", row: 0, col: 1 }, value: "ключ-int", w: 96 },
            { id: "gk", kind: "gate", at: { zone: "wire", row: 0 }, state: "fail", label: "ключ 1 → '1'", detail: "loads ≠ исходный" },
          ],
          edges: [],
        },
      ],
      explain: 'Контракты docs дословно: <code>dumps</code> — «Serialize obj to a JSON formatted str using this conversion table», и по той же таблице <code>True</code> → <code>true</code>, <code>None</code> → <code>null</code>. Про ключи норма жёсткая: «Keys in key/value pairs of JSON are always of the type str. When a dictionary is converted into JSON, all the keys of the dictionary are coerced to strings» — отсюда официальное следствие: «loads(dumps(x)) != x if x has non-string keys» (спайк ×2: <code>False</code>). Сравнивай канонизированные структуры или держи ключи строками сразу.',
      sources: ["py-json"],
    },

    {
      id: "s3", num: "03", kicker: "EAFP vs LBYL · собес-блок", title: "Питоничный путь: пробуй и лови",
      viewBox: "0 0 340 260", zones: EAFP_ZONES,
      code: ['if "name" in d: ...  # LBYL', 'try: print(d["name"])       # EAFP', 'except KeyError: print("Anonymous")', 'print(d.get("name", "Anonymous"))'],
      console: true,
      predictAt: 1,
      predictQ: 'В d = {"role": "qa"} ключа "name" нет. Что вылетит из d["name"] и поймается в except — KeyError или AttributeError?',
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'LBYL — два шага: сначала «посмотрел» (<code>in d</code> → <code>False</code>), потом «взял». Между ними состояние словаря может измениться.',
          nodes: [
            { id: "dd", kind: "chip", at: { zone: "lbyl", row: 0 }, value: '{"role": "qa"}', w: 144, accent: true },
            { id: "ck", kind: "chip", at: { zone: "lbyl", row: 1 }, value: "in d? · False", w: 120, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "Anonymous",
          caption: 'EAFP — один шаг: берём сразу, отсутствие ключа — это <code>KeyError</code>, и его ловит <code>except</code>: печатается default.',
          nodes: [
            { id: "dd", kind: "chip", at: { zone: "lbyl", row: 0 }, value: '{"role": "qa"}', w: 144, ghost: true },
            { id: "ck", kind: "chip", at: { zone: "lbyl", row: 1 }, value: "in d? · False", w: 120, ghost: true },
            { id: "ge", kind: "gate", at: { zone: "eafp", row: 0 }, state: "ok", label: "except KeyError", detail: "пойман → default" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "Anonymous\nAnonymous",
          caption: 'Третий путь — короче обоих: <code>d.get(key, default)</code> вообще не бросает исключение на отсутствующем ключе.',
          nodes: [
            { id: "dd", kind: "chip", at: { zone: "lbyl", row: 0 }, value: '{"role": "qa"}', w: 144, ghost: true },
            { id: "gt", kind: "chip", at: { zone: "eafp", row: 0, col: 0 }, value: "get · default", w: 120, accent: true },
            { id: "ga", kind: "chip", at: { zone: "eafp", row: 0, col: 1 }, value: "'Anonymous'", w: 120, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Глоссарий определяет оба стиля: LBYL — «Look before you leap. This coding style explicitly tests for pre-conditions before making calls or lookups», EAFP — «This clean and fast style is characterized by the presence of many try and except statements». Довод против LBYL — гонка: «…can fail if another thread removes key from mapping after the test, but before the lookup». В тестах EAFP уже норма: <code>pytest.raises(KeyError)</code> — это «пробуй и лови», оформленное как assert; а для словарей с default быстрее всего <code>d.get(key, default)</code> (спайк ×2).',
      sources: ["py-glossary"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>p = Path("tests") / "data" / "users.json"</code><br/><code>print(p.suffix)</code>, затем <code>print(p.stem)</code> — что напечатают две строки?',
      options: [".json и users", "json и users.json", ".json и users.json", "FileNotFoundError — пути нет"], correctIndex: 0, xp: 10,
      okText: '<code>suffix</code> — «The last dot-separated portion of the final component»: <code>.json</code> с точкой; <code>stem</code> — «The final path component, without its suffix»: <code>users</code>. Чистая арифметика имён, диск не нужен.',
      noText: 'Анатомия пути — pure-часть pathlib, без I/O: путь не обязан существовать. Реальный вывод python3.12: <code>.json</code>, затем <code>users</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c1.py", expect: ".json\nusers" },
      sourceRefs: ["py-pathlib"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>print(json.dumps({"ok": True, "err": None}))</code> — что напечатает?',
      options: ['{"ok": true, "err": null}', '{"ok": True, "err": None}', "{'ok': true, 'err': null}", "TypeError — None не сериализуется"], correctIndex: 0, xp: 10,
      okText: '<code>dumps</code> идёт по таблице конверсии: <code>True</code> → <code>true</code>, <code>None</code> → <code>null</code>, ключи в двойных кавычках — это уже JSON-строка, не Python-литерал.',
      noText: '«Serialize obj to a JSON formatted str using this conversion table» — литералы переводятся в JSON-нотацию. Реальный вывод python3.12: <code>{"ok": true, "err": null}</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c2.py", expect: "{\"ok\": true, \"err\": null}" },
      sourceRefs: ["py-json"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>d = json.loads(json.dumps({1: "a"}))</code><br/><code>print(d)</code>, затем <code>print(d == {1: "a"})</code> — что напечатают?',
      options: ["{'1': 'a'} и False", "{1: 'a'} и True", "{'1': 'a'} и True", "TypeError — ключ-int запрещён"], correctIndex: 0, xp: 10,
      okText: 'JSON-ключ бывает только строкой: при <code>dumps</code> ключ <code>1</code> коэрчится в <code>"1"</code>, обратно приезжает <code>{\'1\': \'a\'}</code> — и он не равен исходному словарю.',
      noText: '«When a dictionary is converted into JSON, all the keys of the dictionary are coerced to strings», отсюда «loads(dumps(x)) != x if x has non-string keys». Реальный вывод python3.12: <code>{\'1\': \'a\'}</code>, затем <code>False</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c3.py", expect: "{'1': 'a'}\nFalse" },
      sourceRefs: ["py-json"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>d = {"role": "qa"}</code><br/><code>print(d.get("name", "Anonymous"))</code>, затем <code>print(d["name"])</code> под <code>try/except KeyError as e: print(type(e).__name__)</code> — что напечатают две строки?',
      options: ["Anonymous, затем KeyError", "KeyError, затем Anonymous", "None, затем KeyError", "Anonymous, затем Anonymous"], correctIndex: 0, xp: 10,
      okText: '<code>get</code> вернул default вместо исключения; прямое <code>d["name"]</code> бросает <code>KeyError</code> — EAFP-ветка ловит его и печатает имя типа.',
      noText: 'EAFP «assumes the existence of valid keys or attributes and catches exceptions if the assumption proves false» — а <code>get(key, default)</code> не бросает вовсе. Реальный вывод python3.12: <code>Anonymous</code>, затем <code>KeyError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c4.py", expect: "Anonymous\nKeyError" },
      sourceRefs: ["py-glossary"],
    },
    {
      id: "c5", type: "predict-output", engagementLevel: "responding",
      question: '<code>for v in ["", [], {}, "0"]: print(bool(v))</code> — что напечатают четыре строки?',
      options: ["False False False True", "False False False False", "True True True True", "False True False True"], correctIndex: 0, xp: 10,
      okText: 'Пустые строка, список и словарь — falsy («empty sequences and collections»), а <code>"0"</code> — НЕпустая строка: <code>len == 1</code> → truthy.',
      noText: '«By default, an object is considered true unless its class defines either a __bool__() method that returns False or a __len__() method that returns zero, when called with the object» — falsy здесь только пустые коллекции. Реальный вывод python3.12: <code>False</code> ×3, затем <code>True</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c5.py", expect: "False\nFalse\nFalse\nTrue" },
      sourceRefs: ["py-truth"],
    },
    {
      id: "c6", type: "predict-output", engagementLevel: "responding",
      question: '<code>for i, (a, b) in enumerate(zip([1, 2, 3], "ab"), start=1):</code><br/><code>    print(i, a, b)</code> — что напечатает?',
      options: ["1 1 a и 2 2 b", "1 1 a, 2 2 b и 3 3 ?", "0 1 a и 1 2 b", "ValueError — длины различаются"], correctIndex: 0, xp: 10,
      okText: '<code>zip</code> остановился на короткой стороне <code>"ab"</code> — только две пары; <code>enumerate(..., start=1)</code> нумерует их с единицы.',
      noText: '«By default, zip() stops when the shortest iterable is exhausted», а enumerate возвращает «a count (from start which defaults to 0)» вместе с элементами. Реальный вывод python3.12: <code>1 1 a</code>, затем <code>2 2 b</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M13_c6.py", expect: "1 1 a\n2 2 b" },
      sourceRefs: ["py-funcs"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: '<code>Path(__file__).parent / "data"</code> — тестовые данные рядом с тестом; <code>sorted(root.glob("test_*.py"))</code> — сбор файлов и артефактов; <code>json.dumps/loads</code> — тела API-запросов и фикстуры; EAFP — это стиль <code>pytest.raises</code>; <code>enumerate(..., start=1)</code> — нумерация шагов в отчётах.' },
    { icon: "cost", k: "Round-trip не тождество", v: '«loads(dumps(x)) != x if x has non-string keys» — ключи-int вернутся строками. Сравнивай канонизированные структуры или держи ключи строками с самого начала.' },
    { icon: "avoid", k: "LBYL под гонкой", v: 'Проверка заранее может протухнуть между «посмотрел» и «взял»: «…can fail if another thread removes key from mapping after the test, but before the lookup». Атомарнее EAFP или <code>d.get(key, default)</code>. И не пиши <code>if len(lst) == 0</code> — идиома пустоты: <code>if not lst</code>.' },
  ],

  foot: 'урок · <b>шпаргалка stdlib+идиомы</b> · 3 разбора + колода 6 карт · дизайн <b>mid</b>',
};
