/**
 * Lesson: Декораторы (PY.M5.decorators) — the flagship of the Python track's
 * middle: @ as name rebinding, def-time execution, the wrapper order, stacked
 * decorators, the factory pattern behind @pytest.fixture(scope=…),
 * functools.wraps, the "decorator ≠ fixture" interview refutation, and a real
 * `dis` frame showing the sugar as five opcodes.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (docs.python.org /
 *     peps.python.org, URLs fetch-verified 2026-07-15);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see evidence/py-cards/census-log.txt;
 *   - the `dis` opcodes in s8 are copied from a real `python3.12 -m dis` run —
 *     evidence/spikes/f5_dis_decorator.txt.
 *
 * DIS-ARG-ABBREV (track convention): a LOAD_CONST argument shown as a code object —
 *   `(<code object add at 0x…>)` in the raw dis output — is abbreviated to the
 *   function name, `(add)`. Display shortening only (a raw memory address is both
 *   meaningless and forbidden in expects per RS-03); offsets/opcodes stay
 *   byte-for-byte with the logged run.
 *
 * COMPOSITE-QUOTES: segments[s4].explain — «func = f1(arg)(f2(func))» and «except
 * that the original function is not temporarily bound to the name func» are two
 * fragments of ONE sentence from compound_stmts.html#function-definitions (the
 * bank C-5.1 composite); do not extend.
 *
 * Loop: cards c1..c4 map to backend review items `PY.M5.decorators/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1/s8: the M1 memory-model pair — names on the left, objects on the right.
const Z_NAMES: Zone = { id: "names", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИМЕНА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "frame · только ссылки", subCls: "vz-zsub", subY: 47 };
const Z_OBJS: Zone = { id: "objs", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТЫ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "куча CPython", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_NAMES, Z_OBJS];

// s2: what runs at import/def-time vs what waits for the call.
const Z_DEF: Zone = { id: "deftime", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "DEF-TIME", labelCls: "vz-zlabel heap", lx: 83, ly: 24, sub: "во время импорта", subCls: "vz-zsub heap", subY: 47 };
const Z_CALLT: Zone = { id: "calltime", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone", label: "CALL-TIME", labelCls: "vz-zlabel", lx: 257, ly: 24, sub: "когда вызовут", subCls: "vz-zsub", subY: 47 };
const TIME_ZONES: Zone[] = [Z_DEF, Z_CALLT];

// s3: the wrapper shell around the original function.
const Z_WRAP: Zone = { id: "wrap", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "WRAPPER", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_ORIG: Zone = { id: "orig", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОРИГИНАЛ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "func · захвачен", subCls: "vz-zsub heap", subY: 47 };
const WRAP_ZONES: Zone[] = [Z_WRAP, Z_ORIG];

// s4: the decorator stack band over the application order band.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "СТЕК ДЕКОРАТОРОВ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_APPLY: Zone = { id: "apply", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "ПОРЯДОК ПРИМЕНЕНИЯ", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const STACK_ZONES: Zone[] = [Z_STACK, Z_APPLY];

// s5: the factory call chain — repeat(3) -> decorator -> wrapper.
const Z_FAB: Zone = { id: "fab", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ФАБРИКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "repeat(3)", subCls: "vz-zsub", subY: 47 };
const Z_CLO: Zone = { id: "clo", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "ЗАМЫКАНИЕ", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "times захвачен", subCls: "vz-zsub", subY: 47 };
const FAB_ZONES: Zone[] = [Z_FAB, Z_CLO];

// s6: the wrapped function's metadata without and with functools.wraps.
const Z_META: Zone = { id: "meta", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "__NAME__", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_TOOLING: Zone = { id: "tooling", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "PYTEST ВИДИТ", labelCls: "vz-zlabel heap", lx: 257, ly: 24 };
const META_ZONES: Zone[] = [Z_META, Z_TOOLING];

// s7: language mechanism vs pytest construct — the refutation frame.
const Z_LANG: Zone = { id: "lang", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "МЕХАНИЗМ ЯЗЫКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "кирпич", subCls: "vz-zsub", subY: 47 };
const Z_PYTEST: Zone = { id: "pytest", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "КОНСТРУКЦИЯ PYTEST", labelCls: "vz-zlabel good", lx: 257, ly: 24, sub: "дом", subCls: "vz-zsub", subY: 47 };
const REFUT_ZONES: Zone[] = [Z_LANG, Z_PYTEST];

export const pyDecorators: LessonData = {
  id: "PY.M5.decorators",
  track: "PY",
  lang: "python",
  module: "M5.1",
  title: "Декораторы: из чего сделан pytest",
  kicker: "Python · декораторы · механизм",
  home: { subtitle: "Def-time, wraps, фабрика @fixture", icon: "types", estMinutes: 9 },
  prereqs: ["PY.M4.closures-scope"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-glossary-deco", kind: "doc", org: "docs.python.org", title: "Glossary · decorator", url: "https://docs.python.org/3/glossary.html#term-decorator", date: "2026-07-15" },
    { id: "py-compound-def", kind: "doc", org: "docs.python.org", title: "Compound statements · Function definitions", url: "https://docs.python.org/3/reference/compound_stmts.html#function-definitions", date: "2026-07-15" },
    { id: "py-functools-wraps", kind: "doc", org: "docs.python.org", title: "functools · @functools.wraps", url: "https://docs.python.org/3/library/functools.html#functools.wraps", date: "2026-07-15" },
    { id: "pep318", kind: "pep", org: "peps.python.org", title: "PEP 318 · Decorators for Functions and Methods", url: "https://peps.python.org/pep-0318/", date: "2026-07-15" },
    { id: "py-dis", kind: "doc", org: "docs.python.org", title: "dis — Disassembler for Python bytecode", url: "https://docs.python.org/3/library/dis.html", date: "2026-07-15" },
  ],

  spec: [
    { text: "«A function returning another function, usually applied as a function transformation using the @wrapper syntax.»", source: "py-glossary-deco" },
  ],
  edgeCases: [
    { text: "Wrapper без <code>return</code> «съедает» результат: задекорированный вызов возвращает <code>None</code> — классический баг самописных retry/step-декораторов.", source: "py-glossary-deco" },
    { text: "Декораторы применяются <b>снизу вверх</b>: ближний к функции — первым; итог для стека из двух — «func = f1(arg)(f2(func))».", source: "py-compound-def" },
    { text: "Без <code>functools.wraps</code> у обёрнутой функции <code>__name__ == 'wrapper'</code> — в отчёте pytest и traceback теряется реальное имя теста.", source: "py-functools-wraps" },
  ],

  misconceptions: [
    {
      wrong: "«декораторы в целом — это и есть фикстуры»",
      hook: 'Реальный фейл собеса (ecommpay): кандидат сказал «<span class="wrong">декораторы — это и есть фикстуры</span>» — и Head of QA это поймал. Понятия перепутаны: <b>декоратор</b> — механизм языка, «a function returning another function, usually applied as a function transformation using the <code>@wrapper</code> syntax»; <b>фикстура</b> — конструкция pytest для setup/teardown, лишь <span class="hl">реализованная через</span> декоратор. Дом сделан из кирпича, но дом ≠ кирпич. Ниже — восемь разборов механизма: от перепривязки имени до реальных опкодов сахара <code>@</code>.',
      source: "py-glossary-deco",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Сахар · перепривязка имени", title: "@log — это add = log(add)",
      viewBox: "0 0 340 260", zones: MM_ZONES,
      code: ["@log", "def add(a, b): ...", "# ≈ add = log(add)"],
      scenes: [
        {
          codeLine: 1,
          caption: '<code>def</code> создал объект-функцию, имя <code>add</code> ссылается на него — ровно модель «имена → объекты».',
          nodes: [
            { id: "nm", kind: "slot", at: { zone: "names", row: 0 }, name: "add", value: "" },
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "nm", to: "fadd", accent: true }],
        },
        {
          codeLine: 2,
          caption: '<code>log(add)</code> вызван и вернул <b>новую функцию</b>: wrapper держит оригинал в замыкании.',
          nodes: [
            { id: "nm", kind: "slot", at: { zone: "names", row: 0 }, name: "add", value: "" },
            { id: "fw", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "wrapper", w: 96, accent: true },
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "function", value: "add", w: 96 },
          ],
          edges: [
            { id: "e1", from: "nm", to: "fadd" },
            { id: "cap", from: "fw", to: "fadd", accent: true },
          ],
        },
        {
          codeLine: 2,
          caption: 'Имя <code>add</code> <span class="hl">перепривязано</span> на wrapper; оригинал жив — но добраться до него теперь можно только через замыкание.',
          nodes: [
            { id: "nm", kind: "slot", at: { zone: "names", row: 0 }, name: "add", value: "", accent: true },
            { id: "fw", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "wrapper", w: 96, accent: true },
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "function", value: "add", w: 96, ghost: true },
          ],
          edges: [
            { id: "e2", from: "nm", to: "fw", accent: true },
            { id: "cap", from: "fw", to: "fadd" },
          ],
        },
      ],
      explain: 'Глоссарий определяет декоратор без магии: «A function returning another function, usually applied as a function transformation using the <code>@wrapper</code> syntax». То есть <code>@log</code> — синтаксический сахар над «вызвать <code>log</code>, результат привязать к имени <code>add</code>» — та же перепривязка имени, что и в уроке «Имена и объекты». Language Reference аккуратен в формулировке — «roughly equivalent»: при стеке декораторов имя связывается <b>один раз</b>, после применения всех, а не после каждого. Оригинальная функция не исчезает — она объект в куче, удерживаемый замыканием wrapper-а.',
      sources: ["py-glossary-deco", "py-compound-def"],
    },

    {
      id: "s2", num: "02", kicker: "Def-time · декоратор уже сработал", title: "decorating foo печатается на импорте",
      viewBox: "0 0 340 260", zones: TIME_ZONES,
      code: ["@deco", "def foo(): ...", 'print("done")'],
      console: true,
      predictAt: 1,
      predictQ: "Модуль импортирован, foo() НИ РАЗУ не вызывали. Что уже напечатано в консоли?",
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Импорт исполняет модуль сверху вниз и доходит до <code>@deco</code> над <code>def foo</code>.',
          nodes: [
            { id: "imp", kind: "chip", at: { zone: "deftime", row: 0 }, value: "import идёт", w: 120, accent: true },
            { id: "wait", kind: "chip", at: { zone: "calltime", row: 0 }, value: "foo не вызван", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "decorating foo",
          caption: 'Декоратор исполняется <span class="hl">на def-time</span>: <code>deco(foo)</code> вызван прямо во время импорта — <code>decorating foo</code> уже в консоли.',
          nodes: [
            { id: "imp", kind: "chip", at: { zone: "deftime", row: 0 }, value: "import идёт", w: 120, ghost: true },
            { id: "ran", kind: "gate", at: { zone: "deftime", row: 1 }, state: "ok", label: "deco(foo) вызван", detail: "на def-time" },
            { id: "wait", kind: "chip", at: { zone: "calltime", row: 0 }, value: "foo не вызван", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "decorating foo\ndone",
          caption: 'Только теперь модуль печатает <code>done</code>. Порядок в консоли — <code>decorating foo</code>, затем <code>done</code>: вызова <code>foo()</code> так и не было.',
          nodes: [
            { id: "ran", kind: "gate", at: { zone: "deftime", row: 0 }, state: "ok", label: "deco(foo) вызван", detail: "на def-time" },
            { id: "wait", kind: "chip", at: { zone: "calltime", row: 0 }, value: "foo не вызван", w: 120, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Тело wrapper-а ждёт вызова, но сам <b>декоратор</b> — код уровня модуля: он исполняется, когда интерпретатор доходит до <code>def</code>, то есть на импорте. Отсюда два практических следствия для тестового фреймворка: тяжёлая работа в декораторе (сбор конфигов, подключение к сервисам) замедляет <b>импорт</b> всех тестов, даже отфильтрованных; а ошибки в декораторе валят collection pytest ещё до запуска первого теста. PEP 318 объясняет, зачем сахар вообще ввели: «move the transformation of the method closer to the method\'s own declaration».',
      sources: ["py-glossary-deco", "pep318"],
    },

    {
      id: "s3", num: "03", kicker: "Порядок wrapper-а · before → func → after", title: "before, after, 5 — и не забудь return",
      viewBox: "0 0 340 260", zones: WRAP_ZONES,
      code: ['print("before")', "result = func(*args, **kwargs)", 'print("after")', "return result"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "before",
          caption: 'Вызов <code>add(2, 3)</code> попадает в wrapper: сначала его код <b>до</b> вызова оригинала.',
          nodes: [
            { id: "b", kind: "chip", at: { zone: "wrap", row: 0 }, value: "before", accent: true },
            { id: "fo", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "function", value: "add", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "before",
          caption: 'Wrapper зовёт захваченный оригинал с теми же аргументами — <code>*args, **kwargs</code> пробрасывают любую сигнатуру (урок распаковки).',
          nodes: [
            { id: "b", kind: "chip", at: { zone: "wrap", row: 0 }, value: "before", ghost: true },
            { id: "call", kind: "chip", at: { zone: "wrap", row: 1 }, value: "func(2, 3)", w: 120, accent: true },
            { id: "fo", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "function", value: "add", w: 96, accent: true },
          ],
          edges: [{ id: "c", from: "call", to: "fo", accent: true }],
        },
        {
          codeLine: 3, out: "before\nafter\n5",
          caption: '<code>after</code> — и <span class="hl">return result</span>: вызов вернул 5. Забудешь <code>return</code> — результат оригинала «съеден», наружу уйдёт <code>None</code>.',
          nodes: [
            { id: "b", kind: "chip", at: { zone: "wrap", row: 0 }, value: "before", ghost: true },
            { id: "a", kind: "chip", at: { zone: "wrap", row: 1 }, value: "after·return", w: 120, accent: true },
            { id: "fo", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "function", value: "add", w: 96 },
          ],
          edges: [{ id: "r", from: "fo", to: "a", accent: true }],
        },
      ],
      explain: 'Порядок исполнения обёрнутого вызова фиксирован: код wrapper-а до → оригинал → код после → <code>return result</code>. Реальный прогон python3.12: <code>before</code>, <code>after</code>, <code>5</code>. Два обязательных элемента самописного декоратора: сигнатура <code>*args, **kwargs</code> (иначе обёртка работает не с любой функцией) и <b>возврат результата</b> — wrapper без <code>return</code> молча превращает каждый вызов в <code>None</code>, и «почему мой хелпер вернул None» становится дежурным багом ретраев и таймеров.',
      sources: ["py-glossary-deco"],
    },

    {
      id: "s4", num: "04", kicker: "Стек · применяется снизу вверх", title: "@a @b def f → f = a(b(f))",
      viewBox: "0 0 340 260", zones: STACK_ZONES,
      code: ["@a", "@b", "def f(): ..."],
      scenes: [
        {
          codeLine: 2,
          caption: 'Стек из двух декораторов над <code>f</code>. Кто применится первым?',
          nodes: [
            { id: "da", kind: "chip", at: { zone: "stack", row: 0, col: 0 }, value: "@a · верхний" , w: 120 },
            { id: "db", kind: "chip", at: { zone: "stack", row: 0, col: 1 }, value: "@b · ближний", w: 120 },
            { id: "ff", kind: "chip", at: { zone: "stack", row: 1, col: 0 }, value: "def f", accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: '<span class="hl">Ближний к функции — первым</span>: сначала <code>b(f)</code>…',
          nodes: [
            { id: "da", kind: "chip", at: { zone: "stack", row: 0, col: 0 }, value: "@a · верхний", w: 120 },
            { id: "db", kind: "chip", at: { zone: "stack", row: 0, col: 1 }, value: "@b · ближний", w: 120, accent: true },
            { id: "ff", kind: "chip", at: { zone: "stack", row: 1, col: 0 }, value: "def f" },
            { id: "r1", kind: "chip", at: { zone: "apply", row: 0, col: 0 }, value: "b(f)", accent: true },
          ],
          edges: [{ id: "s1", from: "db", to: "r1", accent: true }],
        },
        {
          codeLine: 0,
          caption: '…затем верхний оборачивает результат: <code>f = a(b(f))</code>. Порядок отчёта allure/marks зависит от этого напрямую.',
          nodes: [
            { id: "da", kind: "chip", at: { zone: "stack", row: 0, col: 0 }, value: "@a · верхний", w: 120, accent: true },
            { id: "db", kind: "chip", at: { zone: "stack", row: 0, col: 1 }, value: "@b · ближний", w: 120 },
            { id: "ff", kind: "chip", at: { zone: "stack", row: 1, col: 0 }, value: "def f" },
            { id: "r1", kind: "chip", at: { zone: "apply", row: 0, col: 0 }, value: "b(f)" },
            { id: "r2", kind: "chip", at: { zone: "apply", row: 0, col: 1 }, value: "a(b(f))", accent: true },
          ],
          edges: [{ id: "s2", from: "da", to: "r2", accent: true }],
        },
      ],
      explain: 'Language Reference даёт точную формулу для стека: результат «roughly equivalent» коду «func = f1(arg)(f2(func))» — с одной оговоркой дословно: «except that the original function is not temporarily bound to the name func». Читается снизу вверх: ближний декоратор применяется первым, верхний оборачивает уже обёрнутое. В тестовом коде это не абстракция: стек <code>@allure.epic</code> / <code>@pytest.mark.parametrize</code> строит цепочку обёрток, и от порядка зависит, что видит отчёт и в каком порядке срабатывают marks.',
      sources: ["py-compound-def"],
    },

    {
      id: "s5", num: "05", kicker: "Фабрика · декоратор с аргументами", title: "@repeat(3) — это три шага, не один",
      viewBox: "0 0 340 260", zones: FAB_ZONES,
      code: ["@repeat(3)", "def greet(): ...", "# 1) repeat(3) 2) decorator(greet) 3) greet = wrapper"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Шаг 1: <code>repeat(3)</code> — обычный вызов. Он возвращает <b>декоратор</b>, замкнувший <code>times=3</code> в ячейку (урок замыканий).',
          nodes: [
            { id: "fab", kind: "obj", at: { zone: "fab", row: 0 }, typeTag: "factory", value: "repeat", w: 96, accent: true },
            { id: "cell", kind: "chip", at: { zone: "clo", row: 0 }, value: "cell: 3", accent: true },
          ],
          edges: [{ id: "f1", from: "fab", to: "cell", accent: true }],
        },
        {
          codeLine: 1,
          caption: 'Шаг 2: полученный декоратор применяется к <code>greet</code> и строит wrapper — тот видит <code>times</code> через замыкание.',
          nodes: [
            { id: "dec", kind: "obj", at: { zone: "fab", row: 0 }, typeTag: "decorator", value: "deco", w: 96, accent: true },
            { id: "cell", kind: "chip", at: { zone: "clo", row: 0 }, value: "cell: 3" },
            { id: "wr", kind: "chip", at: { zone: "clo", row: 1 }, value: "wrapper", w: 96, accent: true },
          ],
          edges: [
            { id: "f2", from: "dec", to: "wr", accent: true },
            { id: "f3", from: "wr", to: "cell", accent: true },
          ],
        },
        {
          codeLine: 2,
          caption: 'Шаг 3: имя <code>greet</code> перепривязано на wrapper. Это и есть <code>@pytest.fixture(scope="session")</code>: <span class="hl">fixture — фабрика декораторов</span>.',
          nodes: [
            { id: "dec", kind: "obj", at: { zone: "fab", row: 0 }, typeTag: "fixture(…)", value: "фабрика", w: 96, accent: true },
            { id: "cell", kind: "chip", at: { zone: "clo", row: 0 }, value: "cell: 3" },
            { id: "wr", kind: "chip", at: { zone: "clo", row: 1 }, value: "wrapper", w: 96 },
          ],
          edges: [
            { id: "f2", from: "dec", to: "wr" },
            { id: "f3", from: "wr", to: "cell" },
          ],
        },
      ],
      explain: '<code>@repeat(3)</code> раскладывается на три шага: вызов фабрики (возвращает декоратор, замкнувший <code>times=3</code>), применение декоратора (строит wrapper) и перепривязка имени. Настройка живёт не в глобале, а в <b>ячейке замыкания</b> — у каждого применения фабрики она своя, как у <code>double</code>/<code>triple</code> из урока замыканий. Ровно по этой схеме устроены <code>@pytest.fixture(scope=…)</code> и <code>@pytest.mark.parametrize(…)</code>: скобки с аргументами — признак фабрики, которая ещё только вернёт декоратор.',
      sources: ["py-glossary-deco", "pep318"],
    },

    {
      id: "s6", num: "06", kicker: "functools.wraps · спасаем метаданные", title: "__name__ == 'wrapper': кто съел имя теста",
      viewBox: "0 0 340 260", zones: META_ZONES,
      code: ["print(greet.__name__)", "# без wraps → 'wrapper'", "@functools.wraps(func)"],
      console: true,
      scenes: [
        {
          codeLine: 1, out: "wrapper",
          caption: 'После декорирования имя <code>greet</code> указывает на wrapper — и <code>__name__</code> честно отвечает <code>wrapper</code> (реальный прогон 3.12).',
          nodes: [
            { id: "who", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "__name__", value: "'wrapper'", w: 120, accent: true },
            { id: "bad", kind: "gate", at: { zone: "tooling", row: 0 }, state: "fail", label: "отчёт pytest", detail: "имя потеряно" },
          ],
          edges: [{ id: "m1", from: "who", to: "bad", accent: true }],
        },
        {
          codeLine: 2, out: "greet",
          caption: '<code>@functools.wraps(func)</code> на wrapper-е копирует мету оригинала — «Update a wrapper function to look like the wrapped function».',
          nodes: [
            { id: "who", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "__name__", value: "'greet'", w: 120, accent: true },
            { id: "good", kind: "gate", at: { zone: "tooling", row: 0 }, state: "ok", label: "отчёт pytest", detail: "имя настоящее" },
          ],
          edges: [{ id: "m2", from: "who", to: "good", accent: true }],
        },
      ],
      explain: 'Wrapper — новая функция, у неё свои метаданные, поэтому без страховки <code>greet.__name__</code> честно печатает <code>wrapper</code>. <code>functools.wraps</code> чинит это по документации дословно: «Update a <i>wrapper</i> function to look like the <i>wrapped</i> function» — копируются <code>__name__</code>, <code>__qualname__</code>, <code>__doc__</code>, <code>__module__</code>, и появляется <code>__wrapped__</code> — ссылка на оригинал. Для AQA это не косметика: traceback, фильтры <code>-k</code> и отчёты pytest ищут функции по именам — самописный декоратор без <code>wraps</code> прячет реальные имена тестов.',
      sources: ["py-functools-wraps"],
    },

    {
      id: "s7", num: "07", kicker: "Refutation · дом ≠ кирпич", title: "Декоратор — механизм; фикстура — конструкция pytest",
      viewBox: "0 0 340 260", zones: REFUT_ZONES,
      scenes: [
        {
          caption: 'Слева — механизмы <b>языка</b>: декоратор, замыкание, генератор. Они работают в любом Python-коде, без всякого pytest.',
          nodes: [
            { id: "l1", kind: "chip", at: { zone: "lang", row: 0 }, value: "декоратор", accent: true },
            { id: "l2", kind: "chip", at: { zone: "lang", row: 1 }, value: "замыкание" },
            { id: "l3", kind: "chip", at: { zone: "lang", row: 2 }, value: "генератор" },
          ],
          edges: [],
        },
        {
          caption: 'Справа — конструкции <b>pytest</b>, собранные из этих кирпичей: <code>@pytest.fixture</code> — декоратор-фабрика над генератором. Связаны — но <span class="hl">не синонимы</span>.',
          nodes: [
            { id: "l1", kind: "chip", at: { zone: "lang", row: 0 }, value: "декоратор", accent: true },
            { id: "l2", kind: "chip", at: { zone: "lang", row: 1 }, value: "замыкание" },
            { id: "l3", kind: "chip", at: { zone: "lang", row: 2 }, value: "генератор" },
            { id: "p1", kind: "chip", at: { zone: "pytest", row: 0 }, value: "fixture", accent: true },
            { id: "p2", kind: "chip", at: { zone: "pytest", row: 1 }, value: "parametrize", w: 120 },
            { id: "p3", kind: "chip", at: { zone: "pytest", row: 2 }, value: "marks" },
          ],
          edges: [{ id: "b1", from: "l1", to: "p1", accent: true }],
        },
      ],
      explain: 'Формулировка на собес — в две фразы. Декоратор — обёртка функции, механизм самого Python: «A function returning another function, usually applied as a function transformation using the <code>@wrapper</code> syntax». Фикстура — сущность pytest для setup/teardown и внедрения зависимостей; она <b>реализована через</b> декоратор <code>@pytest.fixture</code> (а её teardown — через генератор), но это отношение «сделано из», а не равенство: дом сделан из кирпича — дом ≠ кирпич. Перепутаешь — интервьюер услышит, что механизм языка и конструкцию фреймворка ты не различаешь.',
      sources: ["py-glossary-deco"],
    },

    {
      id: "s8", num: "08", kicker: "Байткод · сахар в опкодах", title: "dis: @ — это CALL и STORE_NAME",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["@log", "def add(a, b): ..."],
      il: [
        { off: "8", op: "LOAD_NAME", arg: "0 (log)", cmt: "// декоратор на стек" },
        { off: "10", op: "LOAD_CONST", arg: "1 (add)", cmt: "// код функции" },
        { off: "12", op: "MAKE_FUNCTION", arg: "0", cmt: "// объект-функция add" },
        { off: "14", op: "CALL", arg: "0", cmt: "// log(add) — def-time" },
        { off: "22", op: "STORE_NAME", arg: "1 (add)", cmt: "// имя → результат" },
        { off: "0*", op: "MAKE_CELL", arg: "0 (func)", cmt: "// wrapper замыкает func" },
      ],
      scenes: [
        {
          codeLine: 1, ilLine: 2,
          caption: '<code>MAKE_FUNCTION</code> строит объект-функцию <code>add</code> — пока это обычный def.',
          nodes: [
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 0, ilLine: 3,
          caption: '<code>CALL 0</code> — вот весь сахар: интерпретатор просто <span class="hl">вызывает</span> <code>log</code> с функцией на стеке. Внутри <code>log</code> опкод <code>MAKE_CELL</code> замыкает <code>func</code>.',
          nodes: [
            { id: "fw", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "wrapper", w: 96, accent: true },
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "function", value: "add", w: 96 },
          ],
          edges: [{ id: "cap", from: "fw", to: "fadd", accent: true }],
        },
        {
          codeLine: 0, ilLine: 4,
          caption: '<code>STORE_NAME add</code> привязывает имя к результату вызова. Никакой новой сущности в VM у «декоратора» нет: <b>вызов + привязка имени</b>.',
          nodes: [
            { id: "nm", kind: "slot", at: { zone: "names", row: 0 }, name: "add", value: "", accent: true },
            { id: "fw", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "wrapper", w: 96, accent: true },
            { id: "fadd", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "function", value: "add", w: 96, ghost: true },
          ],
          edges: [
            { id: "e2", from: "nm", to: "fw", accent: true },
            { id: "cap", from: "fw", to: "fadd" },
          ],
        },
      ],
      explain: 'Панель выше — реальный вывод <code>python3.12 -m dis</code> (лог — в evidence урока; строка <code>0*</code> — из дизассемблирования тела <code>log</code>). В байткоде у декоратора нет собственного опкода: <code>LOAD_NAME log</code> → <code>MAKE_FUNCTION</code> → <code>CALL 0</code> → <code>STORE_NAME add</code> — вызов функции и перепривязка имени, исполненные на def-time. Помни и оговорку dis-докам дословно: «Bytecode is an implementation detail of the CPython interpreter» — опкоды в уроке всегда из реального прогона 3.12.',
      sources: ["py-dis", "py-compound-def"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Лог-декоратор: wrapper печатает <code>before</code>, зовёт <code>func</code>, печатает <code>after</code>, возвращает результат.<br/><code>@log def add(a, b): return a + b</code><br/><code>print(add(2, 3))</code> — что напечатает (три строки)?',
      options: ["before, after, 5", "before, 5, after", "5, before, after", "before, after, None"], correctIndex: 0, xp: 10,
      okText: 'Порядок wrapper-а: свой код до → оригинал → свой код после → <code>return result</code>. Печати <code>before</code>/<code>after</code> происходят внутри вызова, а <code>5</code> печатает внешний <code>print</code> — последним.',
      noText: 'Проиграй вызов: <code>add(2, 3)</code> — это wrapper: <code>before</code> → <code>func(2, 3)</code> (вернул 5, ничего не печатая) → <code>after</code> → return 5 → внешний <code>print(5)</code>. Реальный вывод python3.12: <code>before</code>, <code>after</code>, <code>5</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M5_c1.py", expect: "before\nafter\n5" },
      sourceRefs: ["py-glossary-deco"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Декоратор <b>без</b> functools.wraps вернул wrapper.<br/><code>@deco def greet(): pass</code><br/><code>print(greet.__name__)</code> — что напечатает?',
      options: ["wrapper", "greet", "deco", "AttributeError"], correctIndex: 0, xp: 10,
      okText: 'Имя <code>greet</code> теперь ссылается на wrapper — новую функцию со своей метой: <code>__name__ == \'wrapper\'</code>. Починка — <code>@functools.wraps(func)</code>: «Update a wrapper function to look like the wrapped function».',
      noText: 'После декорирования за именем <code>greet</code> живёт wrapper, и его <code>__name__</code> — <code>wrapper</code> (реальный прогон python3.12). Именно поэтому в самописных декораторах <code>functools.wraps</code> обязателен — иначе pytest показывает не те имена.',
      verify: { kind: "exec", run: "python3.12 PY.M5_c2.py", expect: "wrapper" },
      sourceRefs: ["py-functools-wraps"],
    },
    {
      // MODIFY rung: c1's wrapper with the `return` REMOVED — the classic swallowed result.
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Из wrapper-а первой карточки <b>убрали return</b>: он зовёт <code>f(*args, **kwargs)</code>, но ничего не возвращает.<br/><code>@deco def add(a, b): return a + b</code><br/><code>print(add(2, 3))</code> — что напечатает теперь?',
      options: ["None", "5", "TypeError", "ничего"], correctIndex: 0, xp: 10,
      okText: 'Wrapper «съел» результат: оригинал вернул 5 <b>внутрь</b> wrapper-а, а сам wrapper без <code>return</code> отдал <code>None</code> — его и печатает внешний <code>print</code>. Дежурный баг самописных retry/step-обёрток.',
      noText: 'Наружу возвращается то, что вернул <b>wrapper</b>, а не оригинал: без <code>return</code> это <code>None</code> (реальный прогон python3.12). Сравни с c1 — там <code>return result</code> пробрасывал пятёрку наружу.',
      verify: { kind: "exec", run: "python3.12 PY.M5_c3.py", expect: "None" },
      sourceRefs: ["py-glossary-deco"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>def deco(f): print("decorating", f.__name__); return f</code><br/><code>@deco def foo(): pass</code><br/><code>print("done")</code> — что и в каком порядке напечатает запуск файла (foo не вызывают)?',
      options: ["decorating foo, потом done", "только done", "done, потом decorating foo", "ничего"], correctIndex: 0, xp: 10,
      okText: 'Декоратор — код def-time: <code>deco(foo)</code> исполнился при определении функции, до <code>print("done")</code>. Вызов <code>foo()</code> для этого не нужен вовсе.',
      noText: 'Не жди вызова: декоратор применяется в момент <code>def</code>, при исполнении модуля. Реальный вывод python3.12: <code>decorating foo</code>, затем <code>done</code>. Поэтому тяжёлые декораторы замедляют импорт, а их ошибки валят collection.',
      verify: { kind: "exec", run: "python3.12 PY.M5_c4.py", expect: "decorating foo\ndone" },
      sourceRefs: ["py-glossary-deco", "py-compound-def"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: '<code>@pytest.fixture(scope=…)</code> и <code>@pytest.mark.parametrize</code> — фабрики декораторов; <code>@allure.step</code> — wrapper вокруг шага. Скобки с аргументами = фабрика, которая ещё вернёт декоратор.' },
    { icon: "cost", k: "Def-time и потерянный return", v: 'Декоратор исполняется на импорте: тяжёлый код в нём тормозит collection всех тестов. Wrapper без <code>return</code> молча превращает результаты в <code>None</code>.' },
    { icon: "avoid", k: "wraps и порядок стека", v: 'В каждом самописном декораторе — <code>@functools.wraps(func)</code>, иначе pytest теряет имена тестов. Стек применяется снизу вверх: порядок <code>@allure</code>/<code>@mark</code> не косметика.' },
  ],

  foot: 'урок · <b>декораторы</b> · 8 анимир. разборов + dis · фабрика @fixture · дизайн <b>mid</b>',
};
