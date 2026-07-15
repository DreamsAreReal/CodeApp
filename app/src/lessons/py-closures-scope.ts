/**
 * Lesson: LEGB и замыкания (PY.M4.closures-scope) — the scope chain, compile-time
 * name binding (UnboundLocalError, the md A-1 fix), nonlocal, closure CELLS made
 * visible (an x-ray zone + a real `dis` frame), and the late-binding loop trap.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (docs.python.org,
 *     URLs fetch-verified 2026-07-15);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see evidence/py-cards/census-log.txt;
 *   - the UnboundLocalError message in s2 is the real 3.12 wording (3.11+ rephrase,
 *     RS-03) — evidence/spikes/f4_unboundlocal.py;
 *   - the `dis` opcodes in s5 are copied from a real `python3.12 -m dis` run —
 *     evidence/spikes/f4_dis_closure.txt; cell facts (`__closure__[0].cell_contents`
 *     → 2/3) — evidence/spikes/f4_xray_cells.py.
 *
 * Loop: cards c1..c3 map to backend review items `PY.M4.closures-scope/c{1..3}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: a name request on top, the LEGB chain below.
const Z_ASK: Zone = { id: "ask", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ЧТЕНИЕ ИМЕНИ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_CHAIN: Zone = { id: "chain", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "ЦЕПОЧКА SCOPE-ОВ · LEGB", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const LEGB_ZONES: Zone[] = [Z_ASK, Z_CHAIN];

// s2: what the compiler decides vs what execution hits.
const Z_COMPILE: Zone = { id: "compile", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "КОМПИЛЯЦИЯ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "имена красятся тут", subCls: "vz-zsub", subY: 47 };
const Z_RUN: Zone = { id: "run", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ВЫПОЛНЕНИЕ", labelCls: "vz-zlabel heap", lx: 257, ly: 24 };
const COMPILE_ZONES: Zone[] = [Z_COMPILE, Z_RUN];

// s3: the enclosing frame's name vs the inner function.
const Z_ENC: Zone = { id: "enc", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ENCLOSING", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "make_counter", subCls: "vz-zsub", subY: 47 };
const Z_INNER: Zone = { id: "inner", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "INNER · inc", labelCls: "vz-zlabel heap", lx: 257, ly: 24 };
const NONLOCAL_ZONES: Zone[] = [Z_ENC, Z_INNER];

// s4: two factory calls, two closures, two separate cells.
const Z_D2: Zone = { id: "d2", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "DOUBLE", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "make_multiplier(2)", subCls: "vz-zsub", subY: 47 };
const Z_D3: Zone = { id: "d3", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "TRIPLE", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "make_multiplier(3)", subCls: "vz-zsub heap", subY: 47 };
const FACTORY_ZONES: Zone[] = [Z_D2, Z_D3];

// s5: the function object next to an X-RAY of its normally invisible cells.
const Z_FN: Zone = { id: "fn", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ФУНКЦИЯ", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_XRAY: Zone = { id: "xray", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "РЕНТГЕН · __closure__", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "невидимое в рантайме", subCls: "vz-zsub", subY: 47 };
const XRAY_ZONES: Zone[] = [Z_FN, Z_XRAY];

// s6: three lambdas from one loop, all wired to ONE shared cell.
const Z_LAMBDAS: Zone = { id: "lams", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ТРИ ЛЯМБДЫ", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_CELL: Zone = { id: "cell", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "ЯЧЕЙКА i", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "одна на всех", subCls: "vz-zsub", subY: 47 };
const LATE_ZONES: Zone[] = [Z_LAMBDAS, Z_CELL];

export const pyClosuresScope: LessonData = {
  id: "PY.M4.closures-scope",
  track: "PY",
  lang: "python",
  module: "M4.1",
  title: "LEGB и замыкания",
  kicker: "Python · scope и замыкания · механизм",
  home: { subtitle: "Компилятор красит имена; cells; late binding [2, 2, 2]", icon: "types", estMinutes: 7 },
  prereqs: ["PY.M1.names-objects"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-tut-scopes", kind: "doc", org: "docs.python.org", title: "Tutorial · Python Scopes and Namespaces", url: "https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces", date: "2026-07-15" },
    { id: "py-faq-unbound", kind: "doc", org: "docs.python.org", title: "FAQ · Why am I getting an UnboundLocalError…?", url: "https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value", date: "2026-07-15" },
    { id: "py-datamodel-func", kind: "doc", org: "docs.python.org", title: "Data model · Callable types (function attributes)", url: "https://docs.python.org/3/reference/datamodel.html", date: "2026-07-15" },
    { id: "py-dis", kind: "doc", org: "docs.python.org", title: "dis — Disassembler for Python bytecode", url: "https://docs.python.org/3/library/dis.html", date: "2026-07-15" },
  ],

  spec: [
    { text: "«At any time during execution, there are 3 or 4 nested scopes whose namespaces are directly accessible.»", source: "py-tut-scopes" },
  ],
  edgeCases: [
    { text: "Присваивание где угодно в теле делает имя локальным <b>на этапе компиляции</b> — чтение до присваивания даёт <code>UnboundLocalError</code>, а не «создаёт локальную».", source: "py-faq-unbound" },
    { text: "Замыкание захватывает <b>переменную (cell)</b>, не значение: все лямбды цикла делят одну ячейку — после цикла все видят её последнее значение.", source: "py-datamodel-func" },
    { text: "<code>global</code> в тестовом коде — shared state между тестами; проброс состояния делай фикстурами, а не модульными переменными.", source: "py-tut-scopes" },
  ],

  misconceptions: [
    {
      wrong: "double(5), triple(5) вернут «10 10» — фабрики делят один factor",
      hook: 'Классика собеса: <code>make_multiplier(2)</code> и <code>make_multiplier(3)</code> — и junior отвечает <span class="wrong">«10 10»</span>. На самом деле каждый вызов фабрики создаёт <span class="hl">свой scope</span>, и каждое замыкание уносит <b>свою ячейку</b> — <code>10 15</code>. Но рядом живёт обратная ловушка: лямбды из одного цикла делят <b>одну</b> ячейку — <code>[2, 2, 2]</code>. Разница между этими двумя случаями — весь механизм замыканий: ниже шесть разборов, от порядка поиска LEGB до реальных cell-объектов в <code>__closure__</code> и их байткода.',
      source: "py-datamodel-func",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Поиск имени · четыре слоя", title: "LEGB: Local → Enclosing → Global → Built-in",
      viewBox: "0 0 340 260", zones: LEGB_ZONES,
      code: ["def outer():", "    y = 20", "    def inner():", "        print(x, y, len)"],
      scenes: [
        {
          codeLine: 3,
          caption: 'Чтение имени идёт по цепочке изнутри наружу. <code>x</code> в локальном scope <code>inner</code> — <span class="hl">не найден</span>.',
          nodes: [
            { id: "q", kind: "chip", at: { zone: "ask", row: 0 }, value: "x = ?", accent: true },
            { id: "l", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "Local", accent: true },
            { id: "e", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "Enclosing" },
            { id: "g", kind: "chip", at: { zone: "chain", row: 1, col: 0 }, value: "Global" },
            { id: "b", kind: "chip", at: { zone: "chain", row: 1, col: 1 }, value: "Built-in" },
          ],
          edges: [{ id: "ql", from: "q", to: "l", accent: true }],
        },
        {
          codeLine: 3,
          caption: 'Дальше — enclosing-scope внешней функции: <code>y</code> нашёлся бы здесь, но <code>x</code> — снова мимо.',
          nodes: [
            { id: "q", kind: "chip", at: { zone: "ask", row: 0 }, value: "x = ?", accent: true },
            { id: "l", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "Local", ghost: true },
            { id: "e", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "Enclosing", accent: true },
            { id: "g", kind: "chip", at: { zone: "chain", row: 1, col: 0 }, value: "Global" },
            { id: "b", kind: "chip", at: { zone: "chain", row: 1, col: 1 }, value: "Built-in" },
          ],
          edges: [{ id: "qe", from: "q", to: "e", accent: true }],
        },
        {
          codeLine: 3,
          caption: 'Глобальный scope модуля отдаёт <code>x</code>; ещё уровень ниже — built-in (<code>print</code>, <code>len</code>). Порядок фиксирован: «there are 3 or 4 nested scopes whose namespaces are directly accessible».',
          nodes: [
            { id: "q", kind: "chip", at: { zone: "ask", row: 0 }, value: "x ✓ найден", accent: true },
            { id: "l", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "Local", ghost: true },
            { id: "e", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "Enclosing", ghost: true },
            { id: "g", kind: "chip", at: { zone: "chain", row: 1, col: 0 }, value: "Global", accent: true },
            { id: "b", kind: "chip", at: { zone: "chain", row: 1, col: 1 }, value: "Built-in" },
          ],
          edges: [{ id: "qg", from: "q", to: "g", accent: true }],
        },
      ],
      explain: 'Порядок поиска имени — LEGB: Local (тело текущей функции) → Enclosing (все объемлющие функции) → Global (модуль) → Built-in (<code>print</code>, <code>len</code>). Документация формулирует это как «At any time during execution, there are 3 or 4 nested scopes whose namespaces are directly accessible» — «3 or 4», потому что enclosing-слой существует только у вложенных функций. Важная асимметрия, из которой вырастут следующие разборы: цепочка работает для <b>чтения</b>; присваивание по умолчанию всегда пишет в локальный scope.',
      sources: ["py-tut-scopes"],
    },

    {
      id: "s2", num: "02", kicker: "Имя решается до запуска · A-1 фикс", title: "Компилятор красит имена: UnboundLocalError",
      viewBox: "0 0 340 260", zones: COMPILE_ZONES,
      code: ["count = 0", "def inc():", "    count += 1   # ?", "inc()"],
      console: true,
      predictAt: 1,
      predictQ: "В теле inc() есть присваивание count. Что произойдёт при вызове inc()?",
      scenes: [
        {
          codeLine: 2, out: "",
          caption: 'Ещё <b>до выполнения</b> компилятор размечает имена: увидел присваивание <code>count += 1</code> — имя покрашено как <span class="hl">локальное</span> всей функции.',
          nodes: [
            { id: "paint", kind: "chip", at: { zone: "compile", row: 0 }, value: "count · local", accent: true },
            { id: "rule", kind: "chip", at: { zone: "compile", row: 1 }, value: "решено до запуска" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "UnboundLocalError",
          caption: 'На выполнении <code>+=</code> сначала <b>читает</b> локальный <code>count</code> — а он ещё не связан: «cannot access local variable \'count\' where it is not associated with a value» (реальный текст 3.12).',
          nodes: [
            { id: "paint", kind: "chip", at: { zone: "compile", row: 0 }, value: "count · local", ghost: true },
            { id: "rule", kind: "chip", at: { zone: "compile", row: 1 }, value: "решено до запуска", ghost: true },
            { id: "boom", kind: "gate", at: { zone: "run", row: 0 }, state: "fail", label: "чтение до записи", detail: "UnboundLocalError" },
          ],
          edges: [{ id: "pb", from: "paint", to: "boom", accent: true }],
        },
        {
          codeLine: 2, out: "1",
          caption: '<code>global count</code> перекрашивает имя: присваивание идёт в scope модуля — <code>inc()</code> печатает 1. Точная формулировка для собеса: не «создастся локальная», а <span class="hl">имя стало локальным при компиляции</span>.',
          nodes: [
            { id: "paint", kind: "chip", at: { zone: "compile", row: 0 }, value: "count: модуль", w: 120, accent: true },
            { id: "rule", kind: "chip", at: { zone: "compile", row: 1 }, value: "директива" },
            { id: "okg", kind: "gate", at: { zone: "run", row: 0 }, state: "ok", label: "запись в модуль", detail: "count → 1" },
          ],
          edges: [{ id: "po", from: "paint", to: "okg", accent: true }],
        },
      ],
      explain: 'FAQ описывает механизм дословно: когда ты присваиваешь имени значение внутри функции, «that variable becomes local to that scope and shadows any similarly named variable in the outer scope». Ключ — <b>когда</b> это решается: на компиляции тела, целиком, а не построчно. Поэтому <code>count += 1</code> без директивы не «читает глобальную и создаёт локальную» — чтение уже относится к локальному имени, которое ещё не связано: <code>UnboundLocalError</code>. Директивы <code>global</code>/<code>nonlocal</code> — способ перекрасить имя. Для тестов держи правило: <code>global</code> — это shared state между тестами, состояние пробрасывай фикстурами.',
      sources: ["py-faq-unbound", "py-tut-scopes"],
    },

    {
      id: "s3", num: "03", kicker: "nonlocal · перепривязка в enclosing", title: "Счётчик в замыкании: nonlocal n",
      viewBox: "0 0 340 260", zones: NONLOCAL_ZONES,
      code: ["def make_counter():", "    n = 0", "    def inc():", "        nonlocal n; n += 1; return n"],
      console: true,
      scenes: [
        {
          codeLine: 1, out: "",
          caption: 'Фабрика создала scope с <code>n = 0</code>; внутренняя <code>inc</code> будет его менять.',
          nodes: [
            { id: "n", kind: "slot", at: { zone: "enc", row: 0 }, name: "n", value: "0", accent: true },
            { id: "inc", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "function", value: "inc" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "",
          caption: 'Без <code>nonlocal</code> присваивание покрасило бы <code>n</code> в локальное имя <code>inc</code> — и чтение упало бы, как в разборе 02.',
          nodes: [
            { id: "n", kind: "slot", at: { zone: "enc", row: 0 }, name: "n", value: "0" },
            { id: "inc", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "function", value: "inc" },
            { id: "warn", kind: "gate", at: { zone: "inner", row: 1 }, state: "fail", label: "без nonlocal", detail: "n стал бы local" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "1 2 3",
          caption: '<code>nonlocal n</code> направляет перепривязку в <span class="hl">enclosing</span>: три вызова двигают один и тот же <code>n</code> — <code>1 2 3</code> (реальный прогон 3.12).',
          nodes: [
            { id: "n", kind: "slot", at: { zone: "enc", row: 0 }, name: "n", value: "3", accent: true },
            { id: "inc", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "function", value: "inc", accent: true },
          ],
          edges: [{ id: "wn", from: "inc", to: "n", accent: true }],
        },
      ],
      explain: 'Пара директив разводит два адресата перепривязки: <code>global</code> — scope модуля, <code>nonlocal</code> — ближайший enclosing. Счётчик из разбора — минимальный стойкий пример: <code>n</code> живёт в кадре <code>make_counter</code>, а <code>inc</code> через <code>nonlocal</code> перепривязывает его, и состояние переживает вызовы — <code>1 2 3</code>. Это тот же механизм «функция + захваченное окружение», на котором стоит параметризация декораторов: фабрика удерживает настройку, wrapper её использует.',
      sources: ["py-tut-scopes", "py-faq-unbound"],
    },

    {
      id: "s4", num: "04", kicker: "Каждый вызов фабрики — свой scope", title: "double и triple не делят factor",
      viewBox: "0 0 340 260", zones: FACTORY_ZONES,
      code: ["double = make_multiplier(2)", "triple = make_multiplier(3)", "print(double(5), triple(5))"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: '<code>make_multiplier(2)</code> отработал и вернул замыкание: <code>double</code> унёс <span class="hl">свою</span> ячейку <code>factor=2</code>.',
          nodes: [
            { id: "fd", kind: "obj", at: { zone: "d2", row: 0 }, typeTag: "closure", value: "double", w: 96, accent: true },
            { id: "cd", kind: "chip", at: { zone: "d2", row: 1 }, value: "cell: 2", accent: true },
          ],
          edges: [{ id: "ed", from: "fd", to: "cd", accent: true }],
        },
        {
          codeLine: 1, out: "",
          caption: 'Второй вызов фабрики — <b>новый scope</b> и новая ячейка: <code>triple</code> держит <code>factor=3</code>. Никакого разделения.',
          nodes: [
            { id: "fd", kind: "obj", at: { zone: "d2", row: 0 }, typeTag: "closure", value: "double", w: 96 },
            { id: "cd", kind: "chip", at: { zone: "d2", row: 1 }, value: "cell: 2" },
            { id: "ft", kind: "obj", at: { zone: "d3", row: 0 }, typeTag: "closure", value: "triple", w: 96, accent: true },
            { id: "ct", kind: "chip", at: { zone: "d3", row: 1 }, value: "cell: 3", accent: true },
          ],
          edges: [
            { id: "ed", from: "fd", to: "cd" },
            { id: "et", from: "ft", to: "ct", accent: true },
          ],
        },
        {
          codeLine: 2, out: "10 15",
          caption: 'Вызовы читают каждый свою ячейку: <code>10 15</code> (реальный прогон 3.12) — а не «10 10».',
          nodes: [
            { id: "fd", kind: "obj", at: { zone: "d2", row: 0 }, typeTag: "closure", value: "double", w: 96, accent: true },
            { id: "cd", kind: "chip", at: { zone: "d2", row: 1 }, value: "cell: 2" },
            { id: "ft", kind: "obj", at: { zone: "d3", row: 0 }, typeTag: "closure", value: "triple", w: 96, accent: true },
            { id: "ct", kind: "chip", at: { zone: "d3", row: 1 }, value: "cell: 3" },
          ],
          edges: [
            { id: "ed", from: "fd", to: "cd", accent: true },
            { id: "et", from: "ft", to: "ct", accent: true },
          ],
        },
      ],
      explain: 'Замыкание — функция плюс захваченное окружение. Каждый вызов <code>make_multiplier</code> исполняет тело заново, в свежем кадре, и внутренняя функция захватывает <b>ячейки этого кадра</b>: у <code>double</code> и <code>triple</code> они разные, отсюда <code>10 15</code>. Проверяется это не на веру — рентгеном из следующего разбора: <code>double.__closure__[0].cell_contents == 2</code>, <code>triple.__closure__[0].cell_contents == 3</code> (реальный прогон в evidence урока).',
      sources: ["py-datamodel-func", "py-tut-scopes"],
    },

    {
      id: "s5", num: "05", kicker: "Рентген · невидимое становится видимым", title: "__closure__: ячейки в байткоде",
      viewBox: "0 0 340 210", zones: XRAY_ZONES,
      code: ["def make_multiplier(factor):", "    def multiply(x):", "        return x * factor", "    return multiply"],
      il: [
        { off: "0", op: "MAKE_CELL", arg: "0 (factor)", cmt: "// параметр станет ячейкой" },
        { off: "4", op: "LOAD_CLOSURE", arg: "0 (factor)", cmt: "// ячейка на стек" },
        { off: "6", op: "BUILD_TUPLE", arg: "1", cmt: "// кортеж ячеек" },
        { off: "8", op: "LOAD_CONST", arg: "1 (multiply)", cmt: "// код внутренней" },
        { off: "10", op: "MAKE_FUNCTION", arg: "8 (closure)", cmt: "// функция + замыкание" },
        { off: "6*", op: "LOAD_DEREF", arg: "1 (factor)", cmt: "// чтение из ячейки" },
      ],
      scenes: [
        {
          codeLine: 0, ilLine: 0,
          caption: '<code>MAKE_CELL factor</code>: компилятор знал, что параметр захватят, — и завёл под него <span class="hl">ячейку</span>, а не обычный слот.',
          nodes: [
            { id: "cell", kind: "chip", at: { zone: "xray", row: 0 }, value: "cell · factor", accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 1, ilLine: 2,
          caption: '<code>LOAD_CLOSURE</code> + <code>BUILD_TUPLE</code>: ячейки собираются в кортеж — будущий <code>__closure__</code>.',
          nodes: [
            { id: "cell", kind: "chip", at: { zone: "xray", row: 0 }, value: "cell · factor", accent: true },
            { id: "tup", kind: "chip", at: { zone: "xray", row: 1 }, value: "__closure__", accent: true },
          ],
          edges: [{ id: "ct", from: "cell", to: "tup", accent: true }],
        },
        {
          codeLine: 3, ilLine: 4,
          caption: '<code>MAKE_FUNCTION 8 (closure)</code>: объект-функция рождается с прикреплённым кортежем ячеек.',
          nodes: [
            { id: "fn", kind: "obj", at: { zone: "fn", row: 0 }, typeTag: "function", value: "multiply", accent: true },
            { id: "cell", kind: "chip", at: { zone: "xray", row: 0 }, value: "cell · factor" },
            { id: "tup", kind: "chip", at: { zone: "xray", row: 1 }, value: "__closure__" },
          ],
          edges: [{ id: "fc", from: "fn", to: "tup", accent: true }],
        },
        {
          codeLine: 2, ilLine: 5,
          caption: 'Вызов читает захваченное не по имени, а опкодом <code>LOAD_DEREF</code> — <span class="hl">напрямую из ячейки</span>. Вот где физически живёт «память» замыкания.',
          nodes: [
            { id: "fn", kind: "obj", at: { zone: "fn", row: 0 }, typeTag: "function", value: "multiply", accent: true },
            { id: "cell", kind: "chip", at: { zone: "xray", row: 0 }, value: "cell · factor", accent: true },
            { id: "tup", kind: "chip", at: { zone: "xray", row: 1 }, value: "__closure__", ghost: true },
          ],
          edges: [{ id: "fd2", from: "fn", to: "cell", accent: true }],
        },
      ],
      explain: 'Панель выше — реальный вывод <code>python3.12 -m dis</code> (лог — в evidence урока; помеченная строка <code>6*</code> — из дизассемблирования тела <code>multiply</code>). Datamodel описывает атрибут дословно: <code>__closure__</code> — «None or a tuple of cells that contain bindings for the names specified in the co_freevars attribute», и «A cell object has the attribute cell_contents». То есть замыкание — не магия, а кортеж конкретных объектов-ячеек, пришитый к функции; прочитать его можно прямо из теста: <code>double.__closure__[0].cell_contents</code> → <code>2</code>.',
      sources: ["py-datamodel-func", "py-dis"],
    },

    {
      id: "s6", num: "06", kicker: "Late binding · ловушка цикла", title: "[lambda: i …] → [2, 2, 2]: захвачена переменная",
      viewBox: "0 0 340 260", zones: LATE_ZONES,
      code: ["funcs = [lambda: i for i in range(3)]", "print([f() for f in funcs])", "funcs = [lambda i=i: i for i in range(3)]", "print([f() for f in funcs])"],
      console: true,
      predictAt: 1,
      predictQ: "Цикл закончился, i = 2. Что напечатает [f() for f in funcs]?",
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Три лямбды из одного цикла захватили <span class="hl">одну и ту же ячейку</span> <code>i</code> — не три значения.',
          nodes: [
            { id: "f0", kind: "chip", at: { zone: "lams", row: 0 }, value: "λ №0" },
            { id: "f1", kind: "chip", at: { zone: "lams", row: 1 }, value: "λ №1" },
            { id: "f2", kind: "chip", at: { zone: "lams", row: 2 }, value: "λ №2" },
            { id: "ci", kind: "obj", at: { zone: "cell", row: 0 }, typeTag: "cell", value: "i = 0", accent: true },
          ],
          edges: [
            { id: "e0", from: "f0", to: "ci", accent: true },
            { id: "e1", from: "f1", to: "ci" },
            { id: "e2", from: "f2", to: "ci" },
          ],
        },
        {
          codeLine: 1, out: "[2, 2, 2]",
          caption: 'Цикл дошёл до конца — в ячейке <code>i = 2</code>. Все три вызова читают её <b>сейчас</b> (late binding): <code>[2, 2, 2]</code>.',
          nodes: [
            { id: "f0", kind: "chip", at: { zone: "lams", row: 0 }, value: "λ №0 → 2", accent: true },
            { id: "f1", kind: "chip", at: { zone: "lams", row: 1 }, value: "λ №1 → 2", accent: true },
            { id: "f2", kind: "chip", at: { zone: "lams", row: 2 }, value: "λ №2 → 2", accent: true },
            { id: "ci", kind: "obj", at: { zone: "cell", row: 0 }, typeTag: "cell", value: "i = 2", accent: true },
          ],
          edges: [
            { id: "e0", from: "f0", to: "ci", accent: true },
            { id: "e1", from: "f1", to: "ci", accent: true },
            { id: "e2", from: "f2", to: "ci", accent: true },
          ],
        },
        {
          codeLine: 3, out: "[0, 1, 2]",
          caption: 'Починка — <code>lambda i=i:</code>: дефолт вычисляется <b>при создании</b> лямбды (урок «Имена и объекты») и замораживает текущее значение: <code>[0, 1, 2]</code>.',
          nodes: [
            { id: "f0", kind: "chip", at: { zone: "lams", row: 0 }, value: "λ · i=0", accent: true },
            { id: "f1", kind: "chip", at: { zone: "lams", row: 1 }, value: "λ · i=1", accent: true },
            { id: "f2", kind: "chip", at: { zone: "lams", row: 2 }, value: "λ · i=2", accent: true },
            { id: "ok", kind: "gate", at: { zone: "cell", row: 0 }, state: "ok", label: "своё значение", detail: "дефолт i=i" },
          ],
          edges: [],
        },
      ],
      explain: 'Замыкание захватывает <b>переменную</b>, не её значение: все лямбды цикла указывают на одну ячейку, чтение происходит при вызове (late binding) — отсюда <code>[2, 2, 2]</code>. Починки две: дефолт-аргумент <code>lambda i=i: i</code> — значение фиксируется в момент создания функции (тот же механизм «дефолт вычисляется один раз при def», что и в mutable-default); либо фабрика из разбора 04 — каждый вызов даёт отдельный scope. В тестах эта ловушка живёт в колбэках и параметризации, собранных циклом: три «разных» обработчика молча смотрят в один финальный элемент.',
      sources: ["py-datamodel-func", "py-faq-unbound"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>funcs = [lambda: i for i in range(3)]</code><br/><code>print([f() for f in funcs])</code><br/>затем починка: <code>funcs = [lambda i=i: i for i in range(3)]</code><br/><code>print([f() for f in funcs])</code> — что напечатают ОБЕ строки?',
      options: ["[2, 2, 2] и [0, 1, 2]", "[0, 1, 2] и [0, 1, 2]", "[2, 2, 2] и [2, 2, 2]", "[0, 1, 2] и [2, 2, 2]"], correctIndex: 0, xp: 10,
      okText: 'Лямбды захватили <span class="hl">одну ячейку</span> <code>i</code> и читают её при вызове — после цикла там 2: <code>[2, 2, 2]</code>. Дефолт <code>i=i</code> вычисляется при создании каждой лямбды и замораживает текущее значение: <code>[0, 1, 2]</code>.',
      noText: 'Ключ — что захватывается: <b>переменная (cell)</b>, не значение. Одна ячейка на все лямбды + чтение при вызове = <code>[2, 2, 2]</code>; дефолт-аргумент фиксирует значение в момент создания = <code>[0, 1, 2]</code>. Реальный вывод python3.12 подтверждает обе строки.',
      verify: { kind: "exec", run: "python3.12 PY.M4_c1.py", expect: "[2, 2, 2]\n[0, 1, 2]" },
      sourceRefs: ["py-datamodel-func", "py-faq-unbound"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>def make_counter():<br/>&nbsp;&nbsp;n = 0<br/>&nbsp;&nbsp;def inc(): nonlocal n; n += 1; return n<br/>&nbsp;&nbsp;return inc</code><br/><code>c = make_counter(); print(c(), c(), c())</code> — что напечатает?',
      options: ["1 2 3", "1 1 1", "UnboundLocalError", "0 1 2"], correctIndex: 0, xp: 10,
      okText: '<code>nonlocal</code> направляет перепривязку в enclosing-кадр: все три вызова двигают <b>один</b> <code>n</code> — <code>1 2 3</code>. Без директивы присваивание сделало бы <code>n</code> локальным на компиляции — и чтение упало бы <code>UnboundLocalError</code>.',
      noText: 'Состояние живёт в ячейке enclosing-scope и переживает вызовы: <code>1 2 3</code> (реальный прогон python3.12). Ошибка была бы без <code>nonlocal</code>: присваивание красит имя локальным при компиляции, чтение до записи — <code>UnboundLocalError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M4_c2.py", expect: "1 2 3" },
      sourceRefs: ["py-faq-unbound", "py-tut-scopes"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>double = make_multiplier(2); triple = make_multiplier(3)</code><br/><code>print(double(5), triple(5))</code> — что напечатает (фабрика возвращает <code>multiply(x) = x * factor</code>)?',
      options: ["10 15", "10 10", "15 15", "25 25"], correctIndex: 0, xp: 10,
      okText: 'Каждый вызов фабрики — <span class="hl">свой scope и своя ячейка</span>: <code>double.__closure__[0].cell_contents == 2</code>, у <code>triple</code> — 3. Итог <code>10 15</code>, и это проверяемо рентгеном <code>__closure__</code> прямо из теста.',
      noText: '«10 10» — ответ junior-а: фабрики НЕ делят factor. Каждый вызов <code>make_multiplier</code> исполняет тело заново и отдаёт замыкание со своей ячейкой (<code>cell_contents</code>: 2 и 3). Реальный вывод python3.12: <code>10 15</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M4_c3.py", expect: "10 15" },
      sourceRefs: ["py-datamodel-func", "py-tut-scopes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Фабрика-замыкание — механизм под <code>@pytest.fixture(scope=…)</code> и параметризованными декораторами: настройка живёт в ячейке фабрики, wrapper её читает. <code>__closure__[0].cell_contents</code> — рентген для отладки.' },
    { icon: "cost", k: "Late binding в колбэках", v: 'Обработчики/лямбды, собранные циклом, делят одну ячейку и читают её при вызове: все смотрят в последний элемент. Фиксируй значение дефолтом <code>i=i</code> или фабрикой.' },
    { icon: "avoid", k: "global и точность формулировок", v: 'В тестах <code>global</code> — shared state, пробрасывай состояние фикстурами. На собесе не говори «создастся локальная»: присваивание делает имя локальным на компиляции, чтение до записи — <code>UnboundLocalError</code>.' },
  ],

  foot: 'урок · <b>LEGB и замыкания</b> · 6 анимир. разборов + dis · cells-рентген · дизайн <b>mid</b>',
};
