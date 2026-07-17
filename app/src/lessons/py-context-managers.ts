/**
 * Lesson: Context managers (PY.M7.context-managers) — the with statement as a
 * two-method protocol: __enter__/__exit__, the __exit__ return value deciding an
 * exception's fate (True suppresses), @contextlib.contextmanager as a one-yield
 * generator (bridge from PY.M6), the lost-teardown trap (yield without
 * try/finally), and with-vs-try/finally (why the sugar exists, PEP 343).
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank
 *     (docs.python.org / peps.python.org); the three with-statement sentences and
 *     both contextlib sentences were re-fetch-verified against the live pages
 *     on 2026-07-16 before authoring;
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see evidence/py-cards/census-log.txt;
 *   - the lost-teardown fact in s4 (code after a bare `yield` never runs when the
 *     with-body raises; the try/finally variant keeps it) is executed evidence —
 *     evidence/spikes/f7_cm_no_finally_out.txt.
 *
 * Loop: cards c1..c4 map to backend review items `PY.M7.context-managers/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1/s2: the with-block on the left, the protocol methods on the right.
const Z_WITH: Zone = { id: "withb", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "WITH-БЛОК", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "твой код", subCls: "vz-zsub", subY: 47 };
const Z_PROTO: Zone = { id: "proto", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ПРОТОКОЛ CM", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "две скобки тела", subCls: "vz-zsub heap", subY: 47 };
const PROTO_ZONES: Zone[] = [Z_WITH, Z_PROTO];

// s3/s4: the generator band over the with-body band (the PY.M6 fixture pattern).
const Z_CMG: Zone = { id: "cmg", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "CM-ГЕНЕРАТОР", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_BODY: Zone = { id: "body", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ТЕЛО WITH", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const GEN_ZONES: Zone[] = [Z_CMG, Z_BODY];

// s5: the manual try/finally ceremony vs the packed with statement.
const Z_MAN: Zone = { id: "man", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВРУЧНУЮ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "try/finally", subCls: "vz-zsub", subY: 47 };
const Z_SUGAR: Zone = { id: "sugar", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "WITH", labelCls: "vz-zlabel good", lx: 257, ly: 24, sub: "протокол", subCls: "vz-zsub", subY: 47 };
const SUGAR_ZONES: Zone[] = [Z_MAN, Z_SUGAR];

export const pyContextManagers: LessonData = {
  id: "PY.M7.context-managers",
  track: "PY",
  lang: "python",
  module: "M7.1",
  title: "with: протокол enter/exit",
  kicker: "Python · context managers · механизм",
  home: { subtitle: "__exit__ и @contextmanager", icon: "gc", estMinutes: 7 },
  prereqs: ["PY.M6.generators"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-with-stmt", kind: "doc", org: "docs.python.org", title: "Compound statements · The with statement", url: "https://docs.python.org/3/reference/compound_stmts.html#the-with-statement", date: "2026-07-16" },
    { id: "pep343", kind: "pep", org: "peps.python.org", title: "PEP 343 · The “with” Statement", url: "https://peps.python.org/pep-0343/", date: "2026-07-16" },
    { id: "py-contextlib", kind: "doc", org: "docs.python.org", title: "contextlib · @contextlib.contextmanager", url: "https://docs.python.org/3/library/contextlib.html#contextlib.contextmanager", date: "2026-07-16" },
  ],

  spec: [
    { text: "«The with statement guarantees that if the __enter__() method returns without an error, then __exit__() will always be called.»", source: "py-with-stmt" },
  ],
  edgeCases: [
    { text: "Вернуть из <code>__exit__</code> истину — значит подавить <b>любое</b> исключение тела, включая <code>AssertionError</code> твоих проверок: случайный truthy-возврат делает тесты вечно зелёными.", source: "py-with-stmt" },
    { text: "<code>@contextmanager</code> без <code>try/finally</code> вокруг <code>yield</code> теряет teardown: исключение из тела with влетает в генератор на точке yield, и код после неё не исполняется.", source: "py-contextlib" },
    { text: "Гарантия начинается со слов «if the __enter__() method returns without an error»: если бросил сам <code>__enter__</code> — <code>__exit__</code> не вызывается; ресурс, захваченный наполовину, чисти внутри самого <code>__enter__</code>.", source: "py-with-stmt" },
  ],

  misconceptions: [
    {
      wrong: "with — это синтаксис для файлов",
      hook: 'Вопрос с собеса: «зачем <code>with</code>, если есть <code>try/finally</code>?» Слабый ответ — <span class="wrong">«with — это как-то про файлы»</span>. Сильный — про протокол: <code>with</code> работает с <b>любым</b> объектом, у которого есть <code>__enter__</code>/<code>__exit__</code>, и придуман, чтобы «factor out standard uses of try/finally statements» (PEP 343). Файл — лишь самый известный context manager; той же машинкой сделаны <code>httpx.Client</code>, testcontainers и <code>allure.step</code>. Ниже пять разборов: протокол, право <code>__exit__</code> гасить исключения, генератор-CM, ловушка потерянного teardown и десахаризация.',
      source: "pep343",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Протокол · две скобки вокруг тела", title: "with — это __enter__ и __exit__",
      viewBox: "0 0 340 260", zones: PROTO_ZONES,
      code: ["with TempUser() as user:", "    run_test(user)", "# юзер удалён — гарантия __exit__"],
      scenes: [
        {
          codeLine: 0,
          caption: '<code>with</code> вычислил выражение и вызвал <code>__enter__()</code>: его <b>возврат</b> — то, что попадёт в <code>as user</code>.',
          nodes: [
            { id: "ent", kind: "chip", at: { zone: "proto", row: 0 }, value: "__enter__()", w: 120, accent: true },
            { id: "user", kind: "chip", at: { zone: "withb", row: 0 }, value: "as user", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "ent", to: "user", accent: true }],
        },
        {
          codeLine: 1,
          caption: 'Тело работает с <code>user</code>. Протокол ждёт выхода — <b>любого</b>: нормального, через return или через исключение.',
          nodes: [
            { id: "ent", kind: "chip", at: { zone: "proto", row: 0 }, value: "__enter__()", w: 120, ghost: true },
            { id: "user", kind: "chip", at: { zone: "withb", row: 0 }, value: "as user", w: 96 },
            { id: "run", kind: "chip", at: { zone: "withb", row: 1 }, value: "тело бежит", w: 120, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'Выход из тела — и <code>__exit__()</code> вызван: «__exit__() will always be called». Cleanup не зависит от того, <b>как</b> тело закончилось.',
          nodes: [
            { id: "user", kind: "chip", at: { zone: "withb", row: 0 }, value: "as user", w: 96, ghost: true },
            { id: "run", kind: "chip", at: { zone: "withb", row: 1 }, value: "тело вышло", w: 120 },
            { id: "ex", kind: "gate", at: { zone: "proto", row: 0 }, state: "ok", label: "__exit__()", detail: "вызван всегда" },
          ],
          edges: [{ id: "e2", from: "run", to: "ex", accent: true }],
        },
      ],
      explain: 'Context manager — это протокол из двух методов: <code>__enter__</code> исполняется на входе (его возврат привязывается к <code>as</code>-имени), <code>__exit__</code> — на выходе. Ключевая норма дословно: «The with statement guarantees that if the __enter__() method returns without an error, then __exit__() will always be called» — тело может завершиться нормально, через <code>return</code> или упасть, cleanup случится в любом случае. Для тестовой инфраструктуры это и есть контракт «временный юзер удалён, соединение закрыто, контейнер погашен» — без единого <code>finally</code> в коде теста.',
      sources: ["py-with-stmt"],
    },

    {
      id: "s2", num: "02", kicker: "Исключение · __exit__ решает", title: "return True из __exit__ гасит ValueError",
      viewBox: "0 0 340 260", zones: PROTO_ZONES,
      code: ["with CM():      # __exit__ → True", '    raise ValueError("boom")', 'print("after")  # ?'],
      console: true,
      predictAt: 1,
      predictQ: "Тело with бросило ValueError, а __exit__ вернул True. Что случится с исключением — и дойдёт ли исполнение до print(\"after\")?",
      scenes: [
        {
          codeLine: 1, out: "enter\nbody",
          caption: 'Тело бросило <code>ValueError</code> — но исключение летит не наружу: его <b>тип, значение и traceback</b> передаются аргументами в <code>__exit__()</code>.',
          nodes: [
            { id: "ve", kind: "chip", at: { zone: "withb", row: 0 }, value: "ValueError", w: 120, accent: true },
            { id: "ex", kind: "obj", at: { zone: "proto", row: 0 }, typeTag: "__exit__", value: "t, v, tb", w: 96 },
          ],
          edges: [{ id: "e1", from: "ve", to: "ex", accent: true }],
        },
        {
          codeLine: 2, out: "enter\nbody\nexit\nafter",
          caption: '<code>__exit__</code> вернул <code>True</code> → «the exception is suppressed» — исполнение продолжается со строки <b>после</b> with: <code>after</code> в консоли.',
          nodes: [
            { id: "ve", kind: "chip", at: { zone: "withb", row: 0 }, value: "ValueError", w: 120, ghost: true },
            { id: "aft", kind: "chip", at: { zone: "withb", row: 1 }, value: "after", accent: true },
            { id: "ok", kind: "gate", at: { zone: "proto", row: 0 }, state: "ok", label: "return True", detail: "подавлено" },
          ],
          edges: [{ id: "e2", from: "ok", to: "aft", accent: true }],
        },
        {
          codeLine: 2, out: "enter\nbody\nexit\nafter",
          caption: 'Контраст (консоль выше — сценарий True): верни <code>False</code> или ничего (<code>None</code> — falsy) — и та же ValueError <span class="hl">перелетит наружу</span>.',
          nodes: [
            { id: "ok", kind: "gate", at: { zone: "proto", row: 0 }, state: "ok", label: "return True", detail: "подавлено" },
            { id: "no", kind: "gate", at: { zone: "proto", row: 1 }, state: "fail", label: "return False", detail: "reraised" },
            { id: "ve", kind: "chip", at: { zone: "withb", row: 0 }, value: "ValueError", w: 120, accent: true },
          ],
          edges: [{ id: "e3", from: "no", to: "ve", accent: true }],
        },
      ],
      explain: 'Судьбу исключения решает <b>возврат</b> <code>__exit__</code> — норма дословно: «If the suite was exited due to an exception, and the return value from the __exit__() method was false, the exception is reraised. If the return value was true, the exception is suppressed, and execution continues with the statement following the with statement». Реальный прогон 3.12: <code>enter</code>, <code>body</code>, <code>exit</code>, <code>after</code> — программа жива. Метод без явного <code>return</code> возвращает <code>None</code> (falsy) — поэтому обычный CM исключений <b>не</b> глотает; подавление — осознанное решение, как в <code>contextlib.suppress</code>.',
      sources: ["py-with-stmt"],
    },

    {
      id: "s3", num: "03", kicker: "contextlib · генератор становится CM", title: "@contextmanager: setup / yield / teardown",
      viewBox: "0 0 340 260", zones: GEN_ZONES,
      code: ["@contextmanager", "def cm():", '    print("setup"); yield 42', '    print("teardown")'],
      console: true,
      scenes: [
        {
          codeLine: 2, out: "setup",
          caption: '<code>with cm() as v:</code> прогнал генератор до <code>yield</code>: setup выполнен, <code>42</code> привязан к <code>v</code>, кадр <span class="hl">заморожен</span> — знакомая пауза из урока генераторов.',
          nodes: [
            { id: "setup", kind: "chip", at: { zone: "cmg", row: 0, col: 0 }, value: "setup", accent: true },
            { id: "pause", kind: "chip", at: { zone: "cmg", row: 0, col: 1 }, value: "yield · пауза", w: 120, accent: true },
            { id: "v", kind: "slot", at: { zone: "body", row: 0 }, name: "v", value: "42" },
          ],
          edges: [{ id: "g1", from: "pause", to: "v", accent: true }],
        },
        {
          codeLine: 2, out: "setup\n42",
          caption: '«At the point where the generator yields, the block nested in the with statement is executed» — тело бежит, генератор стоит на паузе.',
          nodes: [
            { id: "setup", kind: "chip", at: { zone: "cmg", row: 0, col: 0 }, value: "setup", ghost: true },
            { id: "pause", kind: "chip", at: { zone: "cmg", row: 0, col: 1 }, value: "yield · пауза", w: 120, ghost: true },
            { id: "run", kind: "chip", at: { zone: "body", row: 0 }, value: "print(v)", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "setup\n42\nteardown",
          caption: 'Тело вышло → <code>__exit__</code> будит генератор, и код после <code>yield</code> исполняется: teardown. Один декоратор превратил генератор в context manager.',
          nodes: [
            { id: "pause", kind: "chip", at: { zone: "cmg", row: 0, col: 0 }, value: "yield · пауза", w: 120, ghost: true },
            { id: "td", kind: "chip", at: { zone: "cmg", row: 0, col: 1 }, value: "teardown", w: 96, accent: true },
            { id: "run", kind: "chip", at: { zone: "body", row: 0 }, value: "тело завершено", w: 144 },
          ],
          edges: [{ id: "g2", from: "run", to: "td", accent: true }],
        },
      ],
      explain: '<code>@contextmanager</code> собирает CM из генератора с одним <code>yield</code>: до него — <code>__enter__</code> (setup), сам отданный объект — значение для <code>as</code>, после — <code>__exit__</code> (teardown). Требование дословно: «This iterator must yield exactly one value, which will be bound to the targets in the with statement’s as clause, if any». Пауза кадра между setup и teardown — ровно механизм генераторов: тело with играет роль «теста» из yield-фикстуры pytest. Реальный прогон 3.12: <code>setup</code>, <code>42</code>, <code>teardown</code>.',
      sources: ["py-contextlib"],
    },

    {
      id: "s4", num: "04", kicker: "Ловушка · исключение влетает в генератор", title: "yield без try/finally теряет teardown",
      viewBox: "0 0 340 260", zones: GEN_ZONES,
      code: ["@contextmanager", "def timer():", '    print("start"); yield', '    print("elapsed")  # ← ?'],
      console: true,
      predictAt: 2,
      predictQ: "Тело with бросило ValueError, а yield в timer() не обёрнут try/finally. Напечатается ли elapsed?",
      scenes: [
        {
          codeLine: 2, out: "start",
          caption: 'Setup прошёл (<code>start</code> в консоли), генератор на паузе, тело with бежит.',
          nodes: [
            { id: "st", kind: "chip", at: { zone: "cmg", row: 0, col: 0 }, value: "start", ghost: true },
            { id: "pause", kind: "chip", at: { zone: "cmg", row: 0, col: 1 }, value: "yield · пауза", w: 120, accent: true },
            { id: "run", kind: "chip", at: { zone: "body", row: 0 }, value: "тело бежит", w: 120, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "start",
          caption: 'Тело упало. Исключение «is reraised inside the generator at the point where the yield occurred» — оно влетает <b>внутрь</b> кадра, прямо в строку <code>yield</code>.',
          nodes: [
            { id: "pause", kind: "chip", at: { zone: "cmg", row: 0, col: 0 }, value: "yield · пауза", w: 120 },
            { id: "ve", kind: "chip", at: { zone: "body", row: 0 }, value: "ValueError", w: 120, accent: true },
          ],
          edges: [{ id: "t1", from: "ve", to: "pause", accent: true }],
        },
        {
          codeLine: 3, out: "start",
          caption: 'Генератор не ловит исключение — оно летит дальше, и строка после <code>yield</code> <span class="hl">недостижима</span>: замер потерян молча (реальный прогон 3.12 — evidence урока).',
          nodes: [
            { id: "dead", kind: "gate", at: { zone: "cmg", row: 0 }, state: "fail", label: "elapsed", detail: "не напечатан" },
            { id: "ve", kind: "chip", at: { zone: "body", row: 0 }, value: "ValueError", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "start",
          caption: 'Починка — <code>try: yield</code> / <code>finally: print(...)</code>: finally исполняется и при исключении, teardown выживает. То же правило — для каждой yield-фикстуры pytest.',
          nodes: [
            { id: "fix", kind: "gate", at: { zone: "cmg", row: 0 }, state: "ok", label: "finally:", detail: "teardown жив" },
            { id: "ve", kind: "chip", at: { zone: "body", row: 0 }, value: "ValueError", w: 120, ghost: true },
          ],
          edges: [],
        },
      ],
      explain: 'Исключение из тела with не «обходит» генератор — contextlib вбрасывает его в кадр на точке паузы: «If an unhandled exception occurs in the block, it is reraised inside the generator at the point where the yield occurred». Значит, голый <code>yield</code> — это teardown только для счастливого пути: спайк урока (python3.12 ×2) показывает <code>start</code> без <code>elapsed</code> у варианта без страховки и <code>start</code> → <code>elapsed</code> у варианта с <code>try/finally</code>. Правило одно на весь стек: в <code>@contextmanager</code> и в yield-фикстурах cleanup живёт под <code>finally</code>.',
      sources: ["py-contextlib"],
    },

    {
      id: "s5", num: "05", kicker: "Зачем сахар · PEP 343", title: "with — это try/finally, вынесенный за скобки",
      viewBox: "0 0 340 260", zones: SUGAR_ZONES,
      code: ["f = open(p)", "try:     data = f.read()", "finally: f.close()", "# with open(p) as f: — то же"],
      scenes: [
        {
          codeLine: 2,
          caption: 'Каждый ресурс вручную — церемония: открыть, обернуть <code>try</code>, не забыть <code>finally</code> с <code>close</code>. Три места, где можно ошибиться, — на <b>каждый</b> ресурс.',
          nodes: [
            { id: "op", kind: "chip", at: { zone: "man", row: 0 }, value: "open(p)", w: 96, accent: true },
            { id: "tr", kind: "chip", at: { zone: "man", row: 1 }, value: "try: тело", w: 96 },
            { id: "fin", kind: "chip", at: { zone: "man", row: 2 }, value: "f.close()", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 3,
          caption: 'PEP 343 придуман ровно для этого: «factor out standard uses of try/finally statements» — церемония упакована в протокол объекта, гарантия больше не зависит от твоей памяти.',
          nodes: [
            { id: "op", kind: "chip", at: { zone: "man", row: 0 }, value: "open(p)", w: 96, ghost: true },
            { id: "tr", kind: "chip", at: { zone: "man", row: 1 }, value: "try: тело", w: 96, ghost: true },
            { id: "fin", kind: "chip", at: { zone: "man", row: 2 }, value: "f.close()", w: 96, ghost: true },
            { id: "w", kind: "chip", at: { zone: "sugar", row: 0 }, value: "with open(p)", w: 120, accent: true },
            { id: "pr", kind: "chip", at: { zone: "sugar", row: 1 }, value: "протокол CM", w: 120 },
            { id: "gx", kind: "chip", at: { zone: "sugar", row: 2 }, value: "exit всегда", w: 120, accent: true },
          ],
          edges: [{ id: "s1", from: "w", to: "gx", accent: true }],
        },
      ],
      explain: 'Ответ на собес-вопрос «зачем with, если есть try/finally» — цитатой из первоисточника: «This PEP adds a new statement “with” to the Python language to make it possible to factor out standard uses of try/finally statements». Семантика та же (Reference даёт формальную развёртку with в try/finally c <code>__enter__</code>/<code>__exit__</code>), но паттерн cleanup переехал из каждого call-site в сам объект-ресурс: написан один раз автором CM, а не N раз пользователями. Идиома «ресурс живёт ровно столько, сколько блок» и есть то, что на собесах называют RAII-стилем в Python.',
      sources: ["pep343", "py-with-stmt"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'CM печатает <code>enter</code> в <code>__enter__</code> и <code>exit</code> в <code>__exit__</code>, а его <code>__exit__</code> возвращает <code>True</code>.<br/><code>with CM(): print("body"); raise ValueError("boom")</code><br/><code>print("after")</code> — что напечатает (четыре строки)?',
      options: ["enter, body, exit, after", "enter, body, exit и traceback ValueError", "enter, body, after", "enter, body, ValueError, after"], correctIndex: 0, xp: 10,
      okText: '<code>__exit__</code> вызван и при исключении, а его <code>True</code> гасит ValueError: «the exception is suppressed, and execution continues with the statement following the with statement» — поэтому <code>after</code> печатается.',
      noText: 'Исключение из тела уходит аргументами в <code>__exit__</code>; возврат <code>True</code> подавляет его, и жизнь продолжается после with. Реальный вывод python3.12: <code>enter</code>, <code>body</code>, <code>exit</code>, <code>after</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M7_c1.py", expect: "enter\nbody\nexit\nafter" },
      sourceRefs: ["py-with-stmt"],
    },
    {
      // MODIFY rung: c1's CM with __exit__ returning False — the exception now escapes.
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Тот же CM из c1, но <code>__exit__</code> теперь возвращает <b>False</b>; весь with обёрнут в <code>try/except ValueError as e: print(type(e).__name__)</code>.<br/>Что напечатает теперь (четыре строки)?',
      options: ["enter, body, exit, ValueError", "enter, body, ValueError, exit", "enter, body, exit, after", "enter, body, ValueError"], correctIndex: 0, xp: 10,
      okText: 'Гарантия не изменилась: <code>exit</code> печатается до вылета. Но <code>False</code> → «the exception is reraised» — ValueError долетает до внешнего <code>except</code>, который печатает имя.',
      noText: '<code>__exit__</code> вызывается <b>всегда</b> (поэтому <code>exit</code> — третья строка), а вот подавление выключено: falsy-возврат отпускает исключение наружу. Реальный вывод python3.12: <code>enter</code>, <code>body</code>, <code>exit</code>, <code>ValueError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M7_c2.py", expect: "enter\nbody\nexit\nValueError" },
      sourceRefs: ["py-with-stmt"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>@contextmanager def cm(): print("setup"); yield 42; print("teardown")</code><br/><code>with cm() as v: print(v)</code> — что напечатает (три строки)?',
      options: ["setup, 42, teardown", "setup, teardown, 42", "42, setup, teardown", "setup, 42"], correctIndex: 0, xp: 10,
      okText: 'Генератор бежит до <code>yield</code> (setup), отданное значение попадает в <code>as v</code>, тело печатает <code>42</code>, выход из with будит генератор — teardown.',
      noText: 'Порядок задаёт пауза кадра: до <code>yield</code> — вход, «at the point where the generator yields, the block nested in the with statement is executed», после — выход. Реальный вывод python3.12: <code>setup</code>, <code>42</code>, <code>teardown</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M7_c3.py", expect: "setup\n42\nteardown" },
      sourceRefs: ["py-contextlib"],
    },
    {
      // MODIFY rung: c3's body now RAISES and the bare yield has no try/finally — teardown is lost.
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: 'Тот же <code>cm()</code> из c3 (yield <b>не</b> обёрнут try/finally), но тело with теперь бросает: <code>with cm() as v: raise ValueError("boom")</code> — всё под <code>try/except ValueError as e: print(type(e).__name__)</code>.<br/>Что напечатает (две строки)?',
      options: ["setup, ValueError", "setup, teardown, ValueError", "setup, ValueError, teardown", "ValueError"], correctIndex: 0, xp: 10,
      okText: 'Исключение «is reraised inside the generator at the point where the yield occurred» — генератор его не ловит, строка <code>print("teardown")</code> недостижима. Cleanup молча потерян.',
      noText: 'Сравни с c3: там тело вышло нормально и генератор продолжился. Здесь ValueError влетает в кадр на <code>yield</code> и летит дальше — до teardown исполнение не доходит. Реальный вывод python3.12: <code>setup</code>, <code>ValueError</code>. Починка — <code>try/finally</code> вокруг yield.',
      verify: { kind: "exec", run: "python3.12 PY.M7_c4.py", expect: "setup\nValueError" },
      sourceRefs: ["py-contextlib"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: '<code>with httpx.Client() as c:</code> закрывает соединения, testcontainers гасит контейнер, <code>with allure.step(...):</code> закрывает шаг отчёта. <code>pytest.raises(...)</code> — тоже CM, с инвертированной логикой: его <code>__exit__</code> проверяет, что ожидаемое исключение случилось.' },
    { icon: "cost", k: "Право гасить исключения", v: '<code>return True</code> из <code>__exit__</code> — это catch на всё: тело with не доложит о падении, включая <code>AssertionError</code>. Подавляй точечно и осознанно (<code>contextlib.suppress(KeyError)</code>), а не «на всякий случай».' },
    { icon: "avoid", k: "Голый yield в CM и фикстурах", v: 'В <code>@contextmanager</code> и в yield-фикстурах cleanup живёт под <code>try/finally</code>: исключение из тела влетает в генератор на точке yield, и строки после голого <code>yield</code> при падении не исполняются.' },
  ],

  foot: 'урок · <b>context managers</b> · 5 анимир. разборов · протокол enter/exit · дизайн <b>mid</b>',
};
