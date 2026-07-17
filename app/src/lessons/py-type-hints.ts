/**
 * Lesson: Type hints (PY.M10.type-hints) — hints do NOT gate anything at
 * runtime (PEP 484: "no type checking happens at runtime"), they are DATA
 * stored in the function's __annotations__ dict (x-rayed), `int | None` is the
 * modern 3.10+ spelling of Optional (PEP 604) that builds a real runtime
 * object (types.UnionType), and Pydantic turns the SAME hints into an actual
 * runtime gate: coercion "1" -> 1, ValidationError on "abc" — the bridge to
 * API-test contracts.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the live pages, fetch-verified
 *     2026-07-16 (PEP 484, library/typing, PEP 604, pydantic.dev models page —
 *     the canonical docs.pydantic.dev URL 301s to pydantic.dev, RS-02 C-9);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt;
 *   - console outputs of every segment come from executed spikes:
 *     evidence/spikes/f10_{hints_runtime,annotations,pep604,pydantic}_out.txt
 *     (each run twice, stderr empty; the pydantic spike runs in the authoring
 *     venv — python 3.12.13 + pydantic 2.13.4, versions logged in the out-file);
 *   - per RS-03: the PEP 604 segment is presented as "3.10+ syntax", NO
 *     version-trap exec card (the 3.9 def-time TypeError is a historic note).
 *
 * Loop: cards c1..c4 map to backend review items `PY.M10.type-hints/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the call band over the CPython runtime band.
const Z_CALLB: Zone = { id: "callb", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ВЫЗОВ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_RTB: Zone = { id: "rtb", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "РАНТАЙМ CPYTHON", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const NOOP_ZONES: Zone[] = [Z_CALLB, Z_RTB];

// s2: the function object on the left, its annotations dict x-rayed on the right.
const Z_FOBJ: Zone = { id: "fobj", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТ ФУНКЦИИ", labelCls: "vz-zlabel heap", lx: 83, ly: 24, sub: "создан на def", subCls: "vz-zsub heap", subY: 47 };
const Z_XR: Zone = { id: "xr", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "РЕНТГЕН · __annotations__", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "обычный dict", subCls: "vz-zsub", subY: 47 };
const ANN_ZONES: Zone[] = [Z_FOBJ, Z_XR];

// s3: the annotation spelling band over the runtime-object band.
const Z_ANN: Zone = { id: "ann", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "АННОТАЦИЯ · ДВЕ ЗАПИСИ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_RTO: Zone = { id: "rto", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "РАНТАЙМ-ОБЪЕКТ", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const UNION_ZONES: Zone[] = [Z_ANN, Z_RTO];

// s4: raw input band over the Pydantic model gate band.
const Z_RAW: Zone = { id: "raw", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ВХОД · СЫРЫЕ ДАННЫЕ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_GATEB: Zone = { id: "gateb", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "МОДЕЛЬ USER · РАНТАЙМ-ГЕЙТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const PYD_ZONES: Zone[] = [Z_RAW, Z_GATEB];

export const pyTypeHints: LessonData = {
  id: "PY.M10.type-hints",
  track: "PY",
  lang: "python",
  module: "M10.1",
  title: "Type hints: метаданные, а не проверка",
  kicker: "Python · type hints · механизм",
  home: { subtitle: "__annotations__, int | None, Pydantic", icon: "types", estMinutes: 5 },
  prereqs: ["PY.M9.exceptions"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "pep-484", kind: "spec", org: "peps.python.org", title: "PEP 484 — Type Hints (Abstract, Non-goals)", url: "https://peps.python.org/pep-0484/", date: "2026-07-16" },
    { id: "py-typing", kind: "doc", org: "docs.python.org", title: "typing — Support for type hints", url: "https://docs.python.org/3/library/typing.html", date: "2026-07-16" },
    { id: "pep-604", kind: "spec", org: "peps.python.org", title: "PEP 604 — Allow writing union types as X | Y (Final, 3.10)", url: "https://peps.python.org/pep-0604/", date: "2026-07-16" },
    { id: "pydantic-models", kind: "doc", org: "pydantic.dev", title: "Pydantic · Concepts · Models", url: "https://pydantic.dev/docs/validation/latest/concepts/models/", date: "2026-07-16" },
  ],

  spec: [
    { text: "«While these annotations are available at runtime through the usual __annotations__ attribute, no type checking happens at runtime.»", source: "pep-484" },
  ],
  edgeCases: [
    { text: "<code>Optional[X]</code> — это <code>X | None</code>, а не «необязательный аргумент»: «Note that this is not the same concept as an optional argument, which is one that has a default».", source: "py-typing" },
    { text: "Хинты читают внешние инструменты, не интерпретатор: «They can be used by third party tools such as type checkers, IDEs, linters» — mypy в CI ловит несостыковки ДО запуска тестов.", source: "py-typing" },
    { text: "Проверяй отсутствие через <code>x is None</code>, не truthiness: <code>0</code>, <code>\"\"</code> и <code>[]</code> — валидные значения, которые <code>if x:</code> примет за «пусто» (спайк: <code>label(0)</code> → <code>found</code>).", source: "py-typing" },
  ],

  misconceptions: [
    {
      wrong: "Хинты — это проверка типов",
      hook: 'Вопрос с собеса из конспекта: <code>def add(a: int, b: int)</code> — что сделает <code>add("a", "b")</code>? Ожидаемый <span class="wrong">TypeError не случится</span>: спайк python3.12 ×2 печатает <code>ab</code>. PEP 484 дословно: «no type checking happens at runtime» — хинты лежат данными в <code>__annotations__</code>, их читают IDE и mypy. Рантайм-гейт из тех же хинтов строит только Pydantic — и это мост к контрактам API-тестов. Ниже четыре разбора: несуществующий гейт → рентген данных → современный <code>int | None</code> → гейт настоящий.',
      source: "pep-484",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Собес-классика · гейта нет", title: 'add("a", "b") с int-хинтами печатает ab',
      viewBox: "0 0 340 260", zones: NOOP_ZONES,
      // NB: no predictAt on the FIRST segment — the new-lessons harness asserts
      // s1 advances by AUTOPLAY, and a predict gate blocks progression by design
      // (the hook already poses the TypeError-or-ab question); gates live on s3/s4.
      code: ["def add(a: int, b: int) -> int:", "    return a + b", 'print(add("a", "b"))  # ?'],
      console: true,
      scenes: [
        {
          codeLine: 2,
          caption: 'Вызов с «неправильными» типами уходит в рантайм. Аннотация <code>a: int, b: int</code> едет рядом — как <b>метаданные</b>.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "callb", row: 0, col: 0 }, value: 'add("a", "b")', w: 120, accent: true },
            { id: "hint", kind: "chip", at: { zone: "callb", row: 0, col: 1 }, value: "a: int, b: int", w: 144 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "ab",
          caption: 'В рантайме <span class="hl">проверки не существует</span>: CPython не сверяет аргументы с хинтами — «no type checking happens at runtime».',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "callb", row: 0, col: 0 }, value: 'add("a", "b")', w: 120, ghost: true },
            { id: "hint", kind: "chip", at: { zone: "callb", row: 0, col: 1 }, value: "a: int, b: int", w: 144 },
            { id: "g1", kind: "gate", at: { zone: "rtb", row: 0 }, state: "ok", label: "проверки типов нет", detail: "хинты — метаданные", w: 144 },
          ],
          edges: [{ id: "e1", from: "call", to: "g1", accent: true }],
        },
        {
          codeLine: 2, out: "ab",
          caption: '<code>+</code> у строк — конкатенация: тихо получилось <code>ab</code>. Неверный тип молча уезжает вглубь теста и падает далеко от причины.',
          nodes: [
            { id: "hint", kind: "chip", at: { zone: "callb", row: 0 }, value: "a: int, b: int", w: 144, ghost: true },
            { id: "g1", kind: "gate", at: { zone: "rtb", row: 0, col: 0 }, state: "ok", label: "проверки типов нет", detail: "хинты — метаданные", w: 144 },
            { id: "res", kind: "chip", at: { zone: "rtb", row: 0, col: 1 }, value: "'ab'", w: 56, accent: true },
          ],
          edges: [{ id: "e2", from: "g1", to: "res", accent: true }],
        },
      ],
      explain: 'PEP 484 закрепил это в самих целях дизайна: «It should also be emphasized that Python will remain a dynamically typed language, and the authors have no desire to ever make type hints mandatory, even by convention». Хинт — декларация для инструментов, не инструкция интерпретатору: реальный прогон 3.12 ×2 печатает <code>ab</code>, никакого TypeError. Сильный собес-ответ: «проверка типов — работа mypy/IDE на этапе анализа; в рантайме гейт появляется, только если его построить» — чем и займётся разбор 04.',
      sources: ["pep-484"],
    },

    {
      id: "s2", num: "02", kicker: "Невидимое · где живут хинты", title: "__annotations__: dict на объекте функции",
      viewBox: "0 0 340 260", zones: ANN_ZONES,
      code: ["def f(x: int) -> str: return str(x)", "a = f.__annotations__", "print(a['x'].__name__)", "print(a['return'].__name__)"],
      console: true,
      scenes: [
        {
          codeLine: 0,
          caption: '<code>def</code> собрал объект-функцию. Хинты компилятор не выбросил — сложил <b>в него</b>.',
          nodes: [
            { id: "f", kind: "obj", at: { zone: "fobj", row: 0 }, typeTag: "function", value: "f", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: 'Рентген: <code>f.__annotations__</code> — обычный dict. Спайк: <code>{\'x\': &lt;class \'int\'&gt;, \'return\': &lt;class \'str\'&gt;}</code>.',
          nodes: [
            { id: "f", kind: "obj", at: { zone: "fobj", row: 0 }, typeTag: "function", value: "f", w: 96 },
            { id: "ax", kind: "chip", at: { zone: "xr", row: 0 }, value: "'x': int", w: 96, accent: true },
            { id: "ar", kind: "chip", at: { zone: "xr", row: 1 }, value: "'return': str", w: 120, accent: true },
          ],
          edges: [{ id: "x1", from: "f", to: "ax", accent: true }],
        },
        {
          codeLine: 2, out: "int",
          caption: 'Раз это данные — их можно <b>читать</b>: <code>a[\'x\'].__name__</code> → <code>int</code>. Значения dict — настоящие объекты-классы.',
          nodes: [
            { id: "f", kind: "obj", at: { zone: "fobj", row: 0 }, typeTag: "function", value: "f", w: 96, ghost: true },
            { id: "ax", kind: "chip", at: { zone: "xr", row: 0 }, value: "'x': int", w: 96, accent: true },
            { id: "ar", kind: "chip", at: { zone: "xr", row: 1 }, value: "'return': str", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "int\nstr",
          caption: 'И <code>\'return\'</code> — просто ещё один ключ. Ровно этот dict читают Pydantic и FastAPI, когда строят валидацию по твоим хинтам.',
          nodes: [
            { id: "f", kind: "obj", at: { zone: "fobj", row: 0 }, typeTag: "function", value: "f", w: 96, ghost: true },
            { id: "ax", kind: "chip", at: { zone: "xr", row: 0 }, value: "'x': int", w: 96 },
            { id: "ar", kind: "chip", at: { zone: "xr", row: 1 }, value: "'return': str", w: 120, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Та же фраза PEP 484 целиком: «While these annotations are available at runtime through the usual __annotations__ attribute, no type checking happens at runtime» — обе половины важны. Хинты <b>доступны</b> в рантайме (dict на объекте функции, реальный прогон 3.12 ×2: <code>int</code>, <code>str</code>), но интерпретатор их не применяет. Это и есть механизм моста: библиотека может прочитать <code>__annotations__</code> и построить по ним поведение — валидацию, сериализацию, DI-подстановку фикстур.',
      sources: ["pep-484"],
    },

    {
      id: "s3", num: "03", kicker: "Современный синтаксис · PEP 604", title: "int | None: запись 3.10+ и рантайм-объект",
      viewBox: "0 0 340 260", zones: UNION_ZONES,
      code: ["def label(x: int | None = None):", '    if x is None: return "default"', '    return "found"', "print(label(), label(0))"],
      console: true,
      predictAt: 2,
      predictQ: "label(0): ноль — falsy, но проверка написана как x is None. Что вернётся — default или found?",
      scenes: [
        {
          codeLine: 0,
          caption: 'Две записи — один смысл: «Optional[X] is equivalent to X | None». Пайп-форма — стандарт с 3.10 (PEP 604).',
          nodes: [
            { id: "pipe", kind: "chip", at: { zone: "ann", row: 0, col: 0 }, value: "int | None", w: 96, accent: true },
            { id: "opt", kind: "chip", at: { zone: "ann", row: 0, col: 1 }, value: "Optional[int]", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 0,
          caption: '<code>|</code> на типах — оператор, создающий <b>объект</b>: спайк — <code>type(int | None).__name__</code> → <code>UnionType</code>. Аннотация снова живёт данными.',
          nodes: [
            { id: "pipe", kind: "chip", at: { zone: "ann", row: 0, col: 0 }, value: "int | None", w: 96, accent: true },
            { id: "opt", kind: "chip", at: { zone: "ann", row: 0, col: 1 }, value: "Optional[int]", w: 120, ghost: true },
            { id: "uo", kind: "obj", at: { zone: "rto", row: 0 }, typeTag: "types.UnionType", value: "int | None", w: 144, accent: true },
          ],
          edges: [{ id: "e1", from: "pipe", to: "uo", accent: true }],
        },
        {
          codeLine: 3, out: "default found",
          caption: '<code>label(0)</code> → <code>found</code>: ноль — это <b>значение</b>, не отсутствие. Проверка <code>x is None</code> отличает их; <code>if x:</code> — нет.',
          nodes: [
            { id: "pipe", kind: "chip", at: { zone: "ann", row: 0, col: 0 }, value: "int | None", w: 96, ghost: true },
            { id: "opt", kind: "chip", at: { zone: "ann", row: 0, col: 1 }, value: "Optional[int]", w: 120, ghost: true },
            { id: "uo", kind: "obj", at: { zone: "rto", row: 0, col: 0 }, typeTag: "types.UnionType", value: "int | None", w: 144 },
            { id: "res", kind: "chip", at: { zone: "rto", row: 0, col: 1 }, value: "found", w: 56, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'PEP 604 (Final, Python 3.10): «This PEP proposes overloading the | operator on types to allow writing Union[X, Y] as X | Y». На нашем раннере 3.12 это рабочий синтаксис и рабочий объект (спайк ×2: <code>UnionType</code>, <code>default found</code>); историческая справка — на 3.9 строка <code>def label(x: int | None)</code> падала TypeError прямо на def, потому что аннотации вычисляются. Отсюда два правила: пайп-форма — для кодовых баз 3.10+, а «нет значения» проверяется только через <code>is None</code> — иначе <code>0</code>, пустая строка и пустой список превращаются в ложное «отсутствие».',
      sources: ["pep-604", "py-typing"],
    },

    {
      id: "s4", num: "04", kicker: "Мост к API-тестам · Pydantic", title: "Pydantic делает из хинтов рантайм-гейт",
      viewBox: "0 0 340 260", zones: PYD_ZONES,
      code: ["class User(BaseModel):", "    id: int", 'u = User(id="1")   # тип поля?', 'User(id="abc")     # ?'],
      console: true,
      predictAt: 1,
      predictQ: 'User(id="1") при поле id: int — у u.id останется строка "1" или станет целое 1?',
      scenes: [
        {
          codeLine: 1,
          caption: '«Models are simply classes which inherit from BaseModel and define fields as annotated attributes» — Pydantic читает те же хинты (рентген из 02) и строит по ним <b>гейт</b>.',
          nodes: [
            { id: "hint", kind: "chip", at: { zone: "gateb", row: 0 }, value: "id: int", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "int 1",
          caption: 'Гейт не только проверяет — <b>приводит</b>: строка <code>"1"</code> стала целым. Спайк: <code>type(u.id).__name__</code> → <code>int</code>, значение <code>1</code>.',
          nodes: [
            { id: "raw1", kind: "chip", at: { zone: "raw", row: 0 }, value: 'id="1"', w: 72, accent: true },
            { id: "g1", kind: "gate", at: { zone: "gateb", row: 0 }, state: "ok", label: "id: int", detail: "приведено: 1 (int)", w: 144 },
          ],
          edges: [{ id: "e1", from: "raw1", to: "g1", accent: true }],
        },
        {
          codeLine: 3, out: "int 1\nValidationError",
          caption: 'А <code>id="abc"</code> в int не приводится — гейт закрыт: <code>ValidationError</code>. Невалидный ответ API не проживёт в тесте ни строки.',
          nodes: [
            { id: "raw1", kind: "chip", at: { zone: "raw", row: 0, col: 0 }, value: 'id="1"', w: 72, ghost: true },
            { id: "raw2", kind: "chip", at: { zone: "raw", row: 0, col: 1 }, value: 'id="abc"', w: 96, accent: true },
            { id: "g2", kind: "gate", at: { zone: "gateb", row: 0 }, state: "fail", label: "id: int", detail: "ValidationError", w: 144 },
          ],
          edges: [{ id: "e2", from: "raw2", to: "g2", accent: true }],
        },
      ],
      explain: 'Это тот самый недостающий рантайм-гейт из разбора 01, только построенный библиотекой поверх <code>__annotations__</code>. Документация Pydantic показывает коэрцию дословно на своём примере: «Note that the string \'123\' was coerced to an integer and its value is 123» — наш спайк (python 3.12.13, pydantic 2.13.4, ×2) подтверждает то же для <code>"1"</code> → <code>1</code>, а мусор отбивается исключением: «Pydantic\'s ValidationError is raised when data cannot be successfully parsed into a model instance». В API-тестах модель — контракт ответа: поля и типы проверяются на каждом разборе JSON, и ломается тест в момент несоответствия, а не тремя ассертами позже.',
      sources: ["pydantic-models"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>def add(a: int, b: int) -> int: return a + b</code><br/><code>print(add("a", "b"))</code> — что напечатает (одна строка)?',
      options: ["ab", "TypeError", "a + b", "None"], correctIndex: 0, xp: 10,
      okText: 'Рантайм хинты не проверяет («no type checking happens at runtime») — <code>+</code> у строк отработал конкатенацией.',
      noText: 'Гейта типов в CPython нет: хинты — метаданные для IDE/mypy. Строки склеились. Реальный вывод python3.12: <code>ab</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M10_c1.py", expect: "ab" },
      sourceRefs: ["pep-484"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>def f(x: int) -> str: return str(x)</code>, затем <code>a = f.__annotations__</code>.<br/><code>print(a[\'x\'].__name__)</code> и <code>print(a[\'return\'].__name__)</code> — что напечатают (две строки)?',
      options: ["int, затем str", "x, затем return", "str, затем int", "KeyError"], correctIndex: 0, xp: 10,
      okText: 'Хинты лежат данными: <code>__annotations__</code> — dict, где под <code>\'x\'</code> — класс <code>int</code>, под <code>\'return\'</code> — класс <code>str</code>.',
      noText: '«…available at runtime through the usual __annotations__ attribute» — это обычный dict с объектами-классами; <code>.__name__</code> печатает их имена. Реальный вывод python3.12: <code>int</code>, затем <code>str</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M10_c2.py", expect: "int\nstr" },
      sourceRefs: ["pep-484"],
    },
    {
      // MODIFY rung: c1's add now enforces the hint by hand with isinstance.
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Код из c1 <b>дополнили проверкой</b>: первая строка <code>add</code> — <code>if not isinstance(a, int) or not isinstance(b, int): raise TypeError("int required")</code>.<br/><code>print(add(2, 3))</code>, затем <code>print(add("a", "b"))</code> под <code>try/except TypeError as e: print(type(e).__name__)</code> — что напечатает (две строки)?',
      options: ["5, затем TypeError", "5, затем ab", "TypeError, затем TypeError", "5, затем int required"], correctIndex: 0, xp: 10,
      okText: 'Рантайм-гейт появился, потому что ты его <b>написал</b>: числа проходят (<code>5</code>), строки отбиты <code>TypeError</code>. Pydantic делает ровно это — системно, по всем полям.',
      noText: 'Хинт сам не проверяет, но isinstance-гейт — проверяет: <code>add(2, 3)</code> → <code>5</code>, строки поднимают TypeError, пойманный except-ом. Реальный вывод python3.12: <code>5</code>, затем <code>TypeError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M10_c3.py", expect: "5\nTypeError" },
      sourceRefs: ["pep-484"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>def label(x: int | None = None):</code> внутри <code>if x is None: return "default"</code>, иначе <code>return "found"</code>.<br/><code>print(label())</code> и <code>print(label(0))</code> — что напечатают (две строки)?',
      options: ["default, затем found", "default, затем default", "found, затем found", "TypeError на int | None"], correctIndex: 0, xp: 10,
      okText: '<code>0</code> — значение, не отсутствие: <code>0 is None</code> — False, ветка found. Пайп-синтаксис на 3.10+ рабочий.',
      noText: 'Проверка написана через <code>is None</code>, поэтому falsy-ноль не путается с «нет значения»: <code>label()</code> → default, <code>label(0)</code> → found. Реальный вывод python3.12: <code>default</code>, затем <code>found</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M10_c4.py", expect: "default\nfound" },
      sourceRefs: ["py-typing", "pep-604"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Pydantic-модель — контракт ответа API: поля-хинты реально валидируются на каждом разборе JSON, мусор падает <code>ValidationError</code>-ом сразу. mypy в CI — статический гейт до запуска; хинты в сигнатурах фикстур дают IDE честные подсказки по всему тест-коду.' },
    { icon: "cost", k: "Хинты без инструментов", v: 'Сами по себе хинты ничего не ловят: неверный тип молча уезжает вглубь и роняет тест далеко от причины (<code>ab</code> вместо TypeError). Цена контракта — подключённый инструмент: mypy на анализе или Pydantic в рантайме.' },
    { icon: "avoid", k: "Optional и truthiness", v: 'Не говори «Optional — значит аргумент необязательный»: это <code>X | None</code>, тип. И не проверяй отсутствие через <code>if x:</code> — ноль, пустая строка и пустой список провалятся в ветку «нет значения»; только <code>x is None</code>.' },
  ],

  foot: 'урок · <b>type hints</b> · 4 анимир. разбора · __annotations__, PEP 604, Pydantic-гейт · дизайн <b>mid</b>',
};
