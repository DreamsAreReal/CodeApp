/**
 * Lesson: Генераторы (PY.M6.generators) — yield is a PAUSE, not a return: the
 * lazy call, the frozen frame (gi_frame x-ray), StopIteration, the pytest
 * yield-fixture setup/teardown pattern, measured genexpr-vs-list memory, and
 * single-use exhaustion.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (docs.python.org,
 *     URLs fetch-verified 2026-07-15);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see evidence/py-cards/census-log.txt;
 *   - the frozen-frame facts in s2 (GEN_CREATED/GEN_SUSPENDED, f_locals {'n': 41},
 *     live instruction pointer) are executed evidence — evidence/spikes/
 *     f6_gi_frame_out.txt;
 *   - the memory numbers in s5 (list 38.4 MB total vs genexpr object 200 B for
 *     1M squares) are OWN python3.12 measurements (md's "~30 MB" NOT quoted,
 *     RS-02 A-5) — evidence/spikes/f6_genexpr_memory_out.txt.
 *
 * Loop: cards c1..c4 map to backend review items `PY.M6.generators/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1/s3/s6: the calling code on the left, the generator object on the right.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВЫЗЫВАЮЩИЙ КОД", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_GEN: Zone = { id: "gen", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ГЕНЕРАТОР", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "объект в куче", subCls: "vz-zsub heap", subY: 47 };
const GEN_ZONES: Zone[] = [Z_CODE, Z_GEN];

// s2: the generator next to an X-RAY of its frozen frame.
const Z_G2: Zone = { id: "g2", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ГЕНЕРАТОР", labelCls: "vz-zlabel heap", lx: 83, ly: 24 };
const Z_FRAME: Zone = { id: "frame", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "РЕНТГЕН · gi_frame", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "замороженный кадр", subCls: "vz-zsub", subY: 47 };
const FRAME_ZONES: Zone[] = [Z_G2, Z_FRAME];

// s4: the fixture timeline band over the test band.
const Z_FIX: Zone = { id: "fix", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ФИКСТУРА · ГЕНЕРАТОР", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_TEST: Zone = { id: "test", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ТЕСТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const FIX_ZONES: Zone[] = [Z_FIX, Z_TEST];

// s5: materialised list vs lazy stream, with MEASURED sizes.
const Z_LIST: Zone = { id: "list", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "LIST COMP", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "всё в памяти сразу", subCls: "vz-zsub", subY: 47 };
const Z_LAZY: Zone = { id: "lazy", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GENEXPR", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "по одному элементу", subCls: "vz-zsub heap", subY: 47 };
const MEM_ZONES: Zone[] = [Z_LIST, Z_LAZY];

export const pyGenerators: LessonData = {
  id: "PY.M6.generators",
  track: "PY",
  lang: "python",
  module: "M6.1",
  title: "yield: пауза, а не return",
  kicker: "Python · генераторы · механизм",
  home: { subtitle: "Замороженный кадр, исчерпание, yield-фикстуры, ленивость", icon: "async", estMinutes: 8 },
  prereqs: ["PY.M4.closures-scope"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-yield-expr", kind: "doc", org: "docs.python.org", title: "Expressions · Yield expressions", url: "https://docs.python.org/3/reference/expressions.html#yield-expressions", date: "2026-07-15" },
    { id: "py-glossary-gen", kind: "doc", org: "docs.python.org", title: "Glossary · generator", url: "https://docs.python.org/3/glossary.html#term-generator", date: "2026-07-15" },
    { id: "py-exc-hierarchy", kind: "doc", org: "docs.python.org", title: "Built-in Exceptions · exception hierarchy", url: "https://docs.python.org/3/library/exceptions.html#exception-hierarchy", date: "2026-07-15" },
  ],

  spec: [
    { text: "«By suspended, we mean that all local state is retained, including the current bindings of local variables, the instruction pointer, the internal evaluation stack, and the state of any exception handling.»", source: "py-yield-expr" },
  ],
  edgeCases: [
    { text: "Генератор одноразов: второй <code>sum(g)</code> получает исчерпанный итератор и возвращает <code>0</code> — частая причина «пустых» данных в тестах.", source: "py-glossary-gen" },
    { text: "<code>next()</code> после последнего <code>yield</code> — <code>StopIteration</code>; цикл <code>for</code> ловит его сам, ручной <code>next()</code> — нет.", source: "py-yield-expr" },
    { text: "При закрытии генератора в кадр влетает <code>GeneratorExit</code> (ветка BaseException) — так pytest добивает yield-фикстуры; teardown-код должен переживать это.", source: "py-exc-hierarchy" },
  ],

  misconceptions: [
    {
      wrong: "yield — это такой return",
      hook: 'Вопрос с собеса: «поменяй в фикстуре <code>yield</code> на <code>return</code> — что изменится?» Если <span class="wrong">yield — просто return</span>, то ничего. На деле <code>return</code> <b>завершает</b> функцию, а <code>yield</code> ставит её на <span class="hl">паузу</span>: кадр замораживается целиком — «all local state is retained, including the current bindings of local variables, the instruction pointer, the internal evaluation stack» — и продолжит с того же места. Для pytest-фикстуры это значит: код после <code>yield</code> — teardown, и замена на <code>return</code> молча <b>удаляет cleanup</b>. Ниже шесть разборов: от ленивого вызова до замера памяти.',
      source: "py-yield-expr",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Ленивый старт · тело не бежит", title: "g = gen() ничего не исполняет",
      viewBox: "0 0 340 260", zones: GEN_ZONES,
      code: ['def gen():', '    print("start"); yield 1', "g = gen()", 'print("created")'],
      console: true,
      scenes: [
        {
          codeLine: 2, out: "",
          caption: 'Вызов генераторной функции <b>не исполняет тело</b>: создаётся объект-генератор в состоянии <code>GEN_CREATED</code>.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "code", row: 0 }, value: "g = gen()", w: 96, accent: true },
            { id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "generator", value: "created", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "call", to: "g", accent: true }],
        },
        {
          codeLine: 3, out: "created",
          caption: 'Доказательство в консоли: <code>created</code> напечатан, а <code>start</code> — <span class="hl">нет</span>. Тело ждёт первого <code>next()</code>.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "code", row: 0 }, value: "g = gen()", w: 96, ghost: true },
            { id: "norun", kind: "chip", at: { zone: "code", row: 1 }, value: "start? нет", w: 96, accent: true },
            { id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "generator", value: "created", w: 96 },
          ],
          edges: [],
        },
      ],
      explain: 'Генераторная функция при вызове возвращает объект-итератор, не результат: тело не исполняется ни на строку (спайк урока: <code>inspect.getgeneratorstate(g)</code> сразу после вызова — <code>GEN_CREATED</code>). Запуск случится при первом <code>next(g)</code> — тогда напечатается <code>start</code> и исполнение доедет до первого <code>yield</code>. Практическое следствие для тестов: генератор с багом внутри «создаётся» без ошибок — падение придёт позже, при первом потреблении, в другом месте стектрейса.',
      sources: ["py-glossary-gen", "py-yield-expr"],
    },

    {
      id: "s2", num: "02", kicker: "Рентген · что именно заморожено", title: "gi_frame: locals + instruction pointer живы",
      viewBox: "0 0 340 260", zones: FRAME_ZONES,
      code: ["def gen():", "    n = 41", "    yield 1      # пауза здесь", "    n += 1; yield n"],
      console: true,
      scenes: [
        {
          codeLine: 2, out: "",
          caption: '<code>next(g)</code> исполнил тело до <code>yield</code> и <span class="hl">заморозил кадр</span>: состояние — <code>GEN_SUSPENDED</code>.',
          nodes: [
            { id: "g", kind: "obj", at: { zone: "g2", row: 0 }, typeTag: "generator", value: "paused", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "",
          caption: 'Рентген кадра — это реальные атрибуты: <code>g.gi_frame.f_locals</code> → <code>{\'n\': 41}</code>, указатель инструкции жив. «All local state is retained».',
          nodes: [
            { id: "g", kind: "obj", at: { zone: "g2", row: 0 }, typeTag: "generator", value: "paused", w: 96 },
            { id: "loc", kind: "chip", at: { zone: "frame", row: 0 }, value: "n = 41", accent: true },
            { id: "ip", kind: "chip", at: { zone: "frame", row: 1 }, value: "IP · на yield", w: 120, accent: true },
          ],
          edges: [{ id: "x1", from: "g", to: "loc", accent: true }],
        },
        {
          codeLine: 3, out: "42",
          caption: 'Второй <code>next(g)</code> размораживает кадр <b>с того же места</b>: <code>n += 1</code> видит сохранённое <code>n = 41</code> → <code>42</code> (реальный прогон 3.12).',
          nodes: [
            { id: "g", kind: "obj", at: { zone: "g2", row: 0 }, typeTag: "generator", value: "running", w: 96, accent: true },
            { id: "loc", kind: "chip", at: { zone: "frame", row: 0 }, value: "n = 42", accent: true },
            { id: "ip", kind: "chip", at: { zone: "frame", row: 1 }, value: "IP · дальше", w: 120 },
          ],
          edges: [{ id: "x1", from: "g", to: "loc", accent: true }],
        },
      ],
      explain: 'Спецификация перечисляет замороженное дословно: «By suspended, we mean that all local state is retained, including the current bindings of local variables, the instruction pointer, the internal evaluation stack, and the state of any exception handling». Это не метафора — кадр доступен как объект: <code>g.gi_frame.f_locals</code> показывает живые локальные переменные между вызовами <code>next()</code> (прогон — в evidence урока). Пауза и точное возобновление — тот самый механизм, на котором дальше стоят и yield-фикстуры pytest, и корутины async-урока.',
      sources: ["py-yield-expr"],
    },

    {
      id: "s3", num: "03", kicker: "Конец тела · исключение как сигнал", title: "next() после последнего yield → StopIteration",
      viewBox: "0 0 340 260", zones: GEN_ZONES,
      code: ["g = gen()      # один yield", "print(next(g)) # 1", "next(g)        # ?"],
      console: true,
      predictAt: 1,
      predictQ: "Единственный yield уже отдан. Что сделает второй next(g)?",
      scenes: [
        {
          codeLine: 1, out: "1",
          caption: 'Первый <code>next</code> добежал до единственного <code>yield</code> и отдал <code>1</code>.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "code", row: 0 }, value: "next(g) → 1", w: 120, accent: true },
            { id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "generator", value: "paused", w: 96 },
          ],
          edges: [{ id: "e1", from: "call", to: "g", accent: true }],
        },
        {
          codeLine: 2, out: "1\nStopIteration",
          caption: 'Второй <code>next</code> доводит тело до конца — и сигналит <span class="hl">StopIteration</span>. Цикл <code>for</code> ловит его сам; ручной <code>next()</code> — нет.',
          nodes: [
            { id: "call", kind: "chip", at: { zone: "code", row: 0 }, value: "next(g) → 1", w: 120, ghost: true },
            { id: "boom", kind: "gate", at: { zone: "gen", row: 0 }, state: "fail", label: "тело кончилось", detail: "StopIteration" },
          ],
          edges: [],
        },
      ],
      explain: 'Протокол итерации завершается не флагом, а исключением: когда тело генератора доходит до конца, очередной <code>next()</code> поднимает <code>StopIteration</code>. Конструкции <code>for</code>, <code>sum</code>, <code>list</code> обрабатывают его сами — поэтому в обычном коде ты его не видишь; ручной <code>next(g)</code> — единственное место, где оно долетает до тебя (реальный прогон 3.12: <code>1</code>, затем имя исключения через <code>except</code>). В тестах ручной <code>next</code> встречается в драйверах данных — оборачивай хвост в <code>next(g, default)</code>, если конец потока легален.',
      sources: ["py-yield-expr", "py-glossary-gen"],
    },

    {
      id: "s4", num: "04", kicker: "Твой инструмент · yield-фикстура", title: "Код после yield — это teardown",
      viewBox: "0 0 340 260", zones: FIX_ZONES,
      code: ["@pytest.fixture", "def db(): conn = connect()", "    yield conn   # тест ЗДЕСЬ", "    conn.close() # teardown"],
      console: true,
      scenes: [
        {
          codeLine: 2, out: "",
          caption: 'Pytest прогоняет фикстуру до <code>yield</code> (setup), отдаёт <code>conn</code> тесту и <span class="hl">замораживает кадр</span> — разбор 02 в действии.',
          nodes: [
            { id: "setup", kind: "chip", at: { zone: "fix", row: 0, col: 0 }, value: "setup", accent: true },
            { id: "pause", kind: "chip", at: { zone: "fix", row: 0, col: 1 }, value: "yield · пауза", w: 120, accent: true },
            { id: "t", kind: "chip", at: { zone: "test", row: 0, col: 0 }, value: "тест бежит", w: 120, accent: true },
          ],
          edges: [{ id: "f1", from: "pause", to: "t", accent: true }],
        },
        {
          codeLine: 3, out: "",
          caption: 'Тест закончился (или <b>упал</b>) — pytest будит генератор, и код после <code>yield</code> выполняется: <code>conn.close()</code>. Teardown гарантирован.',
          nodes: [
            { id: "setup", kind: "chip", at: { zone: "fix", row: 0, col: 0 }, value: "setup", ghost: true },
            { id: "pause", kind: "chip", at: { zone: "fix", row: 0, col: 1 }, value: "yield · пауза", w: 120, ghost: true },
            { id: "td", kind: "chip", at: { zone: "fix", row: 1, col: 0 }, value: "teardown", w: 96, accent: true },
            { id: "t", kind: "chip", at: { zone: "test", row: 0, col: 0 }, value: "тест завершён", w: 120 },
          ],
          edges: [{ id: "f2", from: "t", to: "td", accent: true }],
        },
        {
          codeLine: 3, out: "",
          caption: 'Замени <code>yield</code> на <code>return</code> — функция <b>завершится</b> на setup-е: строк после return не существует, teardown <span class="hl">молча исчез</span>.',
          nodes: [
            { id: "setup", kind: "chip", at: { zone: "fix", row: 0, col: 0 }, value: "setup" },
            { id: "ret", kind: "chip", at: { zone: "fix", row: 0, col: 1 }, value: "return conn", w: 120, accent: true },
            { id: "dead", kind: "gate", at: { zone: "test", row: 0, col: 0 }, state: "fail", label: "conn.close()", detail: "не выполнится" },
            { id: "t", kind: "chip", at: { zone: "test", row: 0, col: 1 }, value: "юзеры копятся", w: 120, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Yield-фикстура — генератор, которым управляет pytest: setup до <code>yield</code>, пауза на время теста, возобновление после — и код после <code>yield</code> выполняется даже при упавшем тесте, потому что замороженный кадр жив. Замена <code>yield</code> → <code>return</code> убивает механизм: <code>return</code> завершает функцию, teardown-строк больше не существует — соединения не закрываются, тестовые юзеры остаются в БД. И перекрёстный факт из иерархии исключений: при принудительном закрытии генератора внутрь влетает <code>GeneratorExit</code> (ветка <code>BaseException</code>) — не глуши его голым <code>except:</code> в teardown-коде.',
      sources: ["py-yield-expr", "py-exc-hierarchy"],
    },

    {
      id: "s5", num: "05", kicker: "Ленивость · замер, не легенда", title: "1M квадратов: список ~38 MB, genexpr — 200 байт",
      viewBox: "0 0 340 260", zones: MEM_ZONES,
      code: ["lst = [x**2 for x in range(1_000_000)]", "gen = (x**2 for x in range(1_000_000))"],
      scenes: [
        {
          codeLine: 0,
          caption: 'List comprehension материализует <b>все</b> элементы сразу: контейнер 8.4 MB + миллион int-объектов ≈ <span class="hl">38.4 MB</span> (замер python3.12, evidence урока).',
          nodes: [
            { id: "big", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "list · 1M", value: "38.4 MB", w: 96, accent: true },
            { id: "items", kind: "chip", at: { zone: "list", row: 1 }, value: "int × 1M", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: 'Genexpr — <b>рецепт</b>, не данные: объект в 200 байт, элементы рождаются по одному при потреблении и тут же отпускаются.',
          nodes: [
            { id: "big", kind: "obj", at: { zone: "list", row: 0 }, typeTag: "list · 1M", value: "38.4 MB", w: 96, ghost: true },
            { id: "items", kind: "chip", at: { zone: "list", row: 1 }, value: "int × 1M", w: 96, ghost: true },
            { id: "tiny", kind: "obj", at: { zone: "lazy", row: 0 }, typeTag: "genexpr", value: "200 байт", w: 96, accent: true },
            { id: "one", kind: "chip", at: { zone: "lazy", row: 1 }, value: "по одному", w: 96, accent: true },
          ],
          edges: [{ id: "m1", from: "tiny", to: "one", accent: true }],
        },
      ],
      explain: 'Числа в заголовке — собственный замер на python3.12 (лог в evidence): <code>sys.getsizeof</code> контейнера — 8 448 728 байт, плюс int-объекты — 31 868 928 байт, итого ≈ 38.4 MB; объект genexpr — 200 байт. Ленивость — это про <b>пик памяти</b>: <code>sum(x**2 for x in range(10**6))</code> держит в памяти один элемент за раз. Правило для тестовых данных: поток, который потребляется один раз (чтение огромного CSV, генерация нагрузочных запросов), — генератор; данные, к которым вернёшься, — список.',
      sources: ["py-glossary-gen"],
    },

    {
      id: "s6", num: "06", kicker: "Одноразовость · пустой второй проход", title: "sum(g) дважды: 5, потом 0",
      viewBox: "0 0 340 260", zones: GEN_ZONES,
      code: ["g = (x * x for x in range(3))", "print(sum(g))   # 5", "print(sum(g))   # ?"],
      console: true,
      predictAt: 1,
      predictQ: "Первый sum(g) уже отработал. Что напечатает второй print(sum(g))?",
      scenes: [
        {
          codeLine: 1, out: "5",
          caption: 'Первый <code>sum</code> прокрутил генератор до конца: <code>0 + 1 + 4 = 5</code>. Поток исчерпан.',
          nodes: [
            { id: "c1", kind: "chip", at: { zone: "code", row: 0 }, value: "sum → 5", w: 96, accent: true },
            { id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "genexpr", value: "иссяк", w: 96 },
          ],
          edges: [{ id: "e1", from: "c1", to: "g", accent: true }],
        },
        {
          codeLine: 2, out: "5\n0",
          caption: 'Второй <code>sum</code> получает <b>тот же исчерпанный объект</b>: ни одного элемента — <code>0</code>. Не ошибка, а тихий ноль.',
          nodes: [
            { id: "c1", kind: "chip", at: { zone: "code", row: 0 }, value: "sum → 5", ghost: true, w: 96 },
            { id: "c2", kind: "chip", at: { zone: "code", row: 1 }, value: "sum → 0", w: 96, accent: true },
            { id: "boom", kind: "gate", at: { zone: "gen", row: 0 }, state: "fail", label: "exhausted", detail: "элементов нет" },
          ],
          edges: [{ id: "e2", from: "c2", to: "boom", accent: true }],
        },
      ],
      explain: 'Генератор — одноразовый итератор: состояние «где я» живёт в его же кадре, и после полного прохода перезапустить его нельзя — второй <code>sum(g)</code> тихо возвращает <code>0</code> (реальный прогон 3.12: <code>5</code>, затем <code>0</code>). Это любимый источник «пустых» тестовых данных: фикстура отдала генератор, первый тест его выпил — второму досталось ничего, и всё зелёное, потому что ноль элементов не падает. Нужно два прохода — материализуй список или создавай генератор заново на каждый проход.',
      sources: ["py-glossary-gen", "py-yield-expr"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>def gen(): print("start"); yield 1; print("middle"); yield 2</code><br/><code>g = gen(); print("created"); print(next(g)); print(next(g))</code> — что напечатает (пять строк, по порядку)?',
      options: ["created, start, 1, middle, 2", "start, created, 1, middle, 2", "start, 1, middle, 2, created", "created, 1, 2"], correctIndex: 0, xp: 10,
      okText: 'Вызов <code>gen()</code> тела не исполняет — сначала <code>created</code>. Первый <code>next</code> бежит до первого <code>yield</code> (<code>start</code>, <code>1</code>), второй — до второго (<code>middle</code>, <code>2</code>). Пауза точно на <code>yield</code>.',
      noText: 'Ключ — ленивость: <code>g = gen()</code> лишь создаёт объект, поэтому <code>created</code> печатается первым; тело стартует при <code>next()</code>. Реальный вывод python3.12: <code>created, start, 1, middle, 2</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M6_c1.py", expect: "created\nstart\n1\nmiddle\n2" },
      sourceRefs: ["py-glossary-gen", "py-yield-expr"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>g = (x * x for x in range(3))</code><br/><code>print(sum(g))</code> затем <code>print(sum(g))</code> — что напечатают обе строки?',
      options: ["5 и 0", "5 и 5", "5 и StopIteration", "0 и 0"], correctIndex: 0, xp: 10,
      okText: 'Генератор одноразов: первый <code>sum</code> исчерпал поток (<code>0+1+4=5</code>), второму достался пустой итератор — <code>sum</code> пустого равен <code>0</code>. Тихий ноль, не ошибка.',
      noText: 'Перезапуска нет: состояние генератора живёт в его кадре, второй проход начинается с исчерпанного объекта. <code>sum</code> ловит StopIteration сам и возвращает <code>0</code>. Реальный вывод python3.12: <code>5</code>, затем <code>0</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M6_c2.py", expect: "5\n0" },
      sourceRefs: ["py-glossary-gen"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>def gen(): yield 1</code><br/><code>g = gen(); print(next(g))</code>, затем <code>next(g)</code> под <code>try/except StopIteration: print("StopIteration")</code> — что напечатают обе строки?',
      options: ["1 и StopIteration", "1 и None", "1 и 1", "1 и 0"], correctIndex: 0, xp: 10,
      okText: 'Единственный <code>yield</code> отдан — тело закончилось, и очередной <code>next()</code> сигналит <code>StopIteration</code>. <code>for</code>/<code>sum</code> ловят его сами; ручной <code>next</code> — нет (или <code>next(g, default)</code>).',
      noText: 'Конец генератора — исключение, а не «None»: второй <code>next(g)</code> поднимает <code>StopIteration</code>, здесь пойманный <code>except</code>-ом. Реальный вывод python3.12: <code>1</code>, затем <code>StopIteration</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M6_c3.py", expect: "1\nStopIteration" },
      sourceRefs: ["py-yield-expr"],
    },
    {
      // MODIFY rung: c2's genexpr materialised into a LIST — now both passes see data.
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: 'Код из c2 <b>починили материализацией</b>: <code>g = [x * x for x in range(3)]</code> (список вместо genexpr).<br/><code>print(sum(g))</code> затем <code>print(sum(g))</code> — что напечатают теперь?',
      options: ["5 и 5", "5 и 0", "0 и 0", "TypeError"], correctIndex: 0, xp: 10,
      okText: 'Список — не итератор, а контейнер: каждый <code>sum</code> получает свежую итерацию по тем же данным — <code>5</code> и <code>5</code>. Плата — память: все элементы живут сразу (замер из разбора 05).',
      noText: 'Квадратные скобки материализуют данные: список можно проходить сколько угодно раз, «исчерпания» нет. Реальный вывод python3.12: <code>5</code>, затем <code>5</code>. Правило: один проход — генератор, много проходов — список.',
      verify: { kind: "exec", run: "python3.12 PY.M6_c4.py", expect: "5\n5" },
      sourceRefs: ["py-glossary-gen"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Каждая yield-фикстура pytest — генератор: setup до <code>yield</code>, тест на паузе кадра, teardown после — даже при падении. Потоковые тестовые данные (огромный CSV, нагрузочные запросы) — генератором: пик памяти константный.' },
    { icon: "cost", k: "Одноразовость", v: 'Исчерпанный генератор молча отдаёт пустоту: второй проход — <code>0</code> элементов и зелёный тест на пустых данных. Нужно два прохода — материализуй список или создавай поток заново.' },
    { icon: "avoid", k: "return в фикстуре и голый except", v: 'Замена <code>yield</code> → <code>return</code> удаляет teardown молча. В teardown-коде не глуши всё подряд: при закрытии генератора влетает <code>GeneratorExit</code> (BaseException) — голый <code>except:</code> ломает протокол закрытия.' },
  ],

  foot: 'урок · <b>генераторы</b> · 6 анимир. разборов · gi_frame-рентген · замер 38.4 MB vs 200 B · дизайн <b>mid</b>',
};
