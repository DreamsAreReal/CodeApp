/**
 * Lesson: *args, **kwargs и распаковка (PY.M3.args-unpacking) — packing extra
 * arguments into a tuple/dict, unpacking containers into a call (*locator),
 * the parameter-order rules, and starred assignment (first, *rest).
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from docs.python.org (Tutorial · More on
 *     Defining Functions) / peps.python.org (PEP 3132), URLs fetch-verified
 *     2026-07-15 (RS-02 bank discipline: quotes taken from a live fetch);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt.
 *
 * Loop: cards c1..c3 map to backend review items `PY.M3.args-unpacking/c{1..3}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the call site on top, the receiving function frame below.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ВЫЗОВ · f(1, 2, 3, x=4)", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_FRAME: Zone = { id: "frame", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "КАДР ФУНКЦИИ · ПАРАМЕТРЫ", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const PACK_ZONES: Zone[] = [Z_CALL, Z_FRAME];

// s2: a container object on the left, the call it explodes into on the right.
const Z_BOX: Zone = { id: "box", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "КОНТЕЙНЕР", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_INTO: Zone = { id: "into", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "В ВЫЗОВ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "* и ** раскрывают", subCls: "vz-zsub heap", subY: 47 };
const UNPACK_ZONES: Zone[] = [Z_BOX, Z_INTO];

// s3: the one legal parameter order as a wide band + a verdict band below.
const Z_SIG: Zone = { id: "sig", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "СИГНАТУРА · ПОРЯДОК", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_LAW: Zone = { id: "law", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "КОМПИЛЯТОР", labelCls: "vz-zlabel heap", lx: 170, ly: 148 };
const SIG_ZONES: Zone[] = [Z_SIG, Z_LAW];

// s4: starred assignment — names on the left, the list being split on the right.
const Z_TGT: Zone = { id: "tgt", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ЦЕЛИ", labelCls: "vz-zlabel", lx: 83, ly: 24 };
const Z_SRC: Zone = { id: "src", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ИСТОЧНИК", labelCls: "vz-zlabel heap", lx: 257, ly: 24 };
const STAR_ZONES: Zone[] = [Z_TGT, Z_SRC];

export const pyArgsUnpacking: LessonData = {
  id: "PY.M3.args-unpacking",
  track: "PY",
  lang: "python",
  module: "M3.1",
  title: "*args, **kwargs и распаковка",
  kicker: "Python · функции · механизм",
  home: { subtitle: "Упаковка в tuple/dict, распаковка вызова, find_element(*locator)", icon: "types", estMinutes: 5 },
  prereqs: ["PY.M1.names-objects"],
  depth: 3,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-tut-args", kind: "doc", org: "docs.python.org", title: "Tutorial · More on Defining Functions (keyword / arbitrary argument lists)", url: "https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments", date: "2026-07-15" },
    { id: "py-tut-unpack", kind: "doc", org: "docs.python.org", title: "Tutorial · Unpacking Argument Lists", url: "https://docs.python.org/3/tutorial/controlflow.html#unpacking-argument-lists", date: "2026-07-15" },
    { id: "pep3132", kind: "pep", org: "peps.python.org", title: "PEP 3132 · Extended Iterable Unpacking", url: "https://peps.python.org/pep-3132/", date: "2026-07-15" },
    { id: "py-defaults", kind: "doc", org: "docs.python.org", title: "Tutorial · Default argument values", url: "https://docs.python.org/3/tutorial/controlflow.html#default-argument-values", date: "2026-07-15" },
  ],

  spec: [
    { text: "«These arguments will be wrapped up in a tuple.»", source: "py-tut-args" },
  ],
  edgeCases: [
    { text: "<code>*rest</code> в присваивании собирает <b>list</b>, а <code>*args</code> в сигнатуре — <b>tuple</b>: два родственных синтаксиса — два разных контейнера.", source: "pep3132" },
    { text: "Параметры после <code>*args</code> — keyword-only: «they can only be used as keywords rather than positional arguments».", source: "py-tut-args" },
    { text: "Дефолты и здесь вычисляются один раз при <code>def</code> — mutable-дефолт в <code>**kwargs</code>-обёртках копит состояние (урок «Имена и объекты»).", source: "py-defaults" },
  ],

  misconceptions: [
    {
      wrong: "*locator в find_element(*locator) — специальный синтаксис Selenium",
      hook: 'Каждый AQA писал <code>driver.find_element(*locator)</code> — и многие уверены, что <span class="wrong">звёздочка — магия Selenium</span>. Это обычный механизм языка: <code>*</code> в вызове <span class="hl">распаковывает</span> любой список или кортеж в позиционные аргументы («write the function call with the <code>*</code>-operator to unpack the arguments out of a list or tuple»), а <code>**</code> — словарь в именованные. Тот же механизм в обратную сторону — <code>*args</code>/<code>**kwargs</code> — собирает лишние аргументы в tuple и dict; на нём стоят все универсальные wrapper-ы и фикстуры. Ниже — четыре разбора.',
      source: "py-tut-unpack",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Упаковка · лишние аргументы", title: "*args собирает tuple, **kwargs — dict",
      viewBox: "0 0 340 260", zones: PACK_ZONES,
      code: ["def f(a, *args, **kwargs): ...", "f(1, 2, 3, x=4)"],
      predictAt: 2,
      predictQ: "Куда попадёт x=4 — и контейнер какого типа его примет?",
      scenes: [
        {
          codeLine: 1,
          caption: 'Первый позиционный аргумент занимает обычный параметр: <code>a = 1</code>.',
          nodes: [
            { id: "v1", kind: "chip", at: { zone: "call", row: 0, col: 0 }, value: "1", accent: true },
            { id: "v2", kind: "chip", at: { zone: "call", row: 0, col: 1 }, value: "2" },
            { id: "v3", kind: "chip", at: { zone: "call", row: 0, col: 2 }, value: "3" },
            { id: "v4", kind: "chip", at: { zone: "call", row: 1, col: 0 }, value: "x=4" },
            { id: "pa", kind: "chip", at: { zone: "frame", row: 0, col: 0 }, value: "a = 1", accent: true },
          ],
          edges: [{ id: "e1", from: "v1", to: "pa", accent: true }],
        },
        {
          codeLine: 1,
          caption: 'Лишние позиционные <code>2, 3</code> упаковываются в <span class="hl">tuple</span>: «These arguments will be wrapped up in a tuple».',
          nodes: [
            { id: "v1", kind: "chip", at: { zone: "call", row: 0, col: 0 }, value: "1", ghost: true },
            { id: "v2", kind: "chip", at: { zone: "call", row: 0, col: 1 }, value: "2", accent: true },
            { id: "v3", kind: "chip", at: { zone: "call", row: 0, col: 2 }, value: "3", accent: true },
            { id: "v4", kind: "chip", at: { zone: "call", row: 1, col: 0 }, value: "x=4" },
            { id: "pa", kind: "chip", at: { zone: "frame", row: 0, col: 0 }, value: "a = 1" },
            { id: "pargs", kind: "chip", at: { zone: "frame", row: 0, col: 1 }, value: "args=(2,3)", accent: true },
          ],
          edges: [
            { id: "e2", from: "v2", to: "pargs", accent: true },
            { id: "e3", from: "v3", to: "pargs", accent: true },
          ],
        },
        {
          codeLine: 1,
          caption: 'Лишние именованные уходят в <span class="hl">dict</span>: «it receives a dictionary» — <code>kwargs = {\'x\': 4}</code>. Кадр собран: 1 · (2, 3) · {\'x\': 4}.',
          nodes: [
            { id: "v1", kind: "chip", at: { zone: "call", row: 0, col: 0 }, value: "1", ghost: true },
            { id: "v2", kind: "chip", at: { zone: "call", row: 0, col: 1 }, value: "2", ghost: true },
            { id: "v3", kind: "chip", at: { zone: "call", row: 0, col: 2 }, value: "3", ghost: true },
            { id: "v4", kind: "chip", at: { zone: "call", row: 1, col: 0 }, value: "x=4", accent: true },
            { id: "pa", kind: "chip", at: { zone: "frame", row: 0, col: 0 }, value: "a = 1" },
            { id: "pargs", kind: "chip", at: { zone: "frame", row: 0, col: 1 }, value: "args=(2,3)" },
            { id: "pkw", kind: "chip", at: { zone: "frame", row: 1, col: 0 }, value: "kwargs={'x':4}", w: 144, accent: true },
          ],
          edges: [{ id: "e4", from: "v4", to: "pkw", accent: true }],
        },
      ],
      explain: 'Упаковка — это правило распределения аргументов по кадру вызова: обычные параметры берут своё, дальше «These arguments will be wrapped up in a tuple» — лишние позиционные становятся кортежем <code>args</code>, а для финального <code>**name</code> — «it receives a dictionary» — лишние именованные становятся словарём. Именно поэтому универсальный wrapper пишется как <code>def wrapper(*args, **kwargs)</code>: он принимает <b>любую</b> сигнатуру и пробрасывает её дальше без потерь — эта пара будет в каждом декораторе следующего урока.',
      sources: ["py-tut-args"],
    },

    {
      id: "s2", num: "02", kicker: "Распаковка · контейнер в вызов", title: "find_element(*locator) — не магия Selenium",
      viewBox: "0 0 340 260", zones: UNPACK_ZONES,
      code: ['locator = (By.ID, "submit")', "driver.find_element(*locator)"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Локатор в POM хранится <b>одним объектом</b> — кортежем из двух элементов.',
          nodes: [
            { id: "loc", kind: "obj", at: { zone: "box", row: 0 }, typeTag: "tuple · locator", value: "2 элемента", accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 1,
          caption: '<code>*</code> в вызове <span class="hl">раскрывает кортеж</span> в отдельные позиционные аргументы: «write the function call with the <code>*</code>-operator to unpack the arguments out of a list or tuple».',
          nodes: [
            { id: "loc", kind: "obj", at: { zone: "box", row: 0 }, typeTag: "tuple · locator", value: "2 элемента" },
            { id: "a1", kind: "chip", at: { zone: "into", row: 0 }, value: "By.ID", accent: true },
            { id: "a2", kind: "chip", at: { zone: "into", row: 1 }, value: '"submit"', accent: true },
          ],
          edges: [
            { id: "u1", from: "loc", to: "a1", accent: true },
            { id: "u2", from: "loc", to: "a2", accent: true },
          ],
        },
        {
          codeLine: 1,
          caption: 'Симметрично для словарей: «dictionaries can deliver keyword arguments with the <code>**</code>-operator» — <code>client.get(**params)</code> разворачивает конфиг в именованные.',
          nodes: [
            { id: "cfg", kind: "obj", at: { zone: "box", row: 0 }, typeTag: "dict · params", value: "k: v", accent: true },
            { id: "k1", kind: "chip", at: { zone: "into", row: 0 }, value: "url=...", accent: true },
            { id: "k2", kind: "chip", at: { zone: "into", row: 1 }, value: "timeout=...", accent: true },
          ],
          edges: [
            { id: "u3", from: "cfg", to: "k1", accent: true },
            { id: "u4", from: "cfg", to: "k2", accent: true },
          ],
        },
      ],
      explain: 'Распаковка — зеркальный близнец упаковки: та же звёздочка, но на стороне <b>вызова</b>. Кортеж локатора раскрывается в два позиционных аргумента <code>find_element(By.ID, "submit")</code>, словарь параметров — в именованные. Отсюда постоянная пара приёмов в тестовом коде: локаторы и координаты живут данными (tuple в POM), конфиги запросов — словарями, а в точке вызова <code>*</code>/<code>**</code> превращают данные в аргументы. Никакой библиотечной магии — чистый механизм языка.',
      sources: ["py-tut-unpack"],
    },

    {
      id: "s3", num: "03", kicker: "Сигнатура · один законный порядок", title: "pos → *args → keyword-only → **kwargs",
      viewBox: "0 0 340 260", zones: SIG_ZONES,
      console: true,
      code: ["def f(a, *args, key=1, **kw): ok", "def g(**kw, a): SyntaxError"],
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Порядок фиксирован: позиционные, потом <code>*args</code>, после него — только именованные, замыкает <code>**kwargs</code>.',
          nodes: [
            { id: "p1", kind: "chip", at: { zone: "sig", row: 0, col: 0 }, value: "a", accent: true },
            { id: "p2", kind: "chip", at: { zone: "sig", row: 0, col: 1 }, value: "*args", accent: true },
            { id: "p3", kind: "chip", at: { zone: "sig", row: 1, col: 0 }, value: "key=1 · kw-only" },
            { id: "p4", kind: "chip", at: { zone: "sig", row: 1, col: 1 }, value: "**kw · последний" },
          ],
          edges: [],
        },
        {
          codeLine: 0, out: "",
          caption: 'Всё после <code>*args</code> — keyword-only: «they can only be used as keywords rather than positional arguments». <code>f(1, 2, key=5)</code> — да; <code>f(1, 2, 5)</code> в <code>key</code> не попадёт.',
          nodes: [
            { id: "p1", kind: "chip", at: { zone: "sig", row: 0, col: 0 }, value: "a" },
            { id: "p2", kind: "chip", at: { zone: "sig", row: 0, col: 1 }, value: "*args" },
            { id: "p3", kind: "chip", at: { zone: "sig", row: 1, col: 0 }, value: "key=1 · kw-only", accent: true },
            { id: "p4", kind: "chip", at: { zone: "sig", row: 1, col: 1 }, value: "**kw · последний" },
            { id: "law1", kind: "gate", at: { zone: "law", row: 0 }, state: "ok", label: "f(1, 2, key=5)", detail: "kw-only — по имени" },
          ],
          edges: [{ id: "l1", from: "p3", to: "law1", accent: true }],
        },
        {
          codeLine: 1, out: "SyntaxError",
          caption: 'Нарушил порядок — упадёт <b>на компиляции</b>, до всякого запуска тестов: <code>def g(**kw, a)</code> → <code>SyntaxError</code>.',
          nodes: [
            { id: "p1", kind: "chip", at: { zone: "sig", row: 0, col: 0 }, value: "**kw", accent: true },
            { id: "p2", kind: "chip", at: { zone: "sig", row: 0, col: 1 }, value: "a · после **kw", accent: true },
            { id: "law2", kind: "gate", at: { zone: "law", row: 0 }, state: "fail", label: "def g(**kw, a)", detail: "SyntaxError" },
          ],
          edges: [{ id: "l2", from: "p2", to: "law2", accent: true }],
        },
      ],
      explain: 'Сигнатура читается слева направо одним законным порядком: позиционные → <code>*args</code> → keyword-only → <code>**kwargs</code>. Документация формулирует и почему: variadic-параметры «scoop up all remaining input arguments», поэтому всё, что стоит после <code>*args</code>, физически может прийти только по имени — «they can only be used as keywords rather than positional arguments». Этим пользуются API фикстур и клиентов: обязательные позиционные вначале, тонкие настройки — keyword-only, чтобы вызовы читались как <code>get(url, timeout=5)</code>, а не <code>get(url, 5, True, None)</code>.',
      sources: ["py-tut-args"],
    },

    {
      id: "s4", num: "04", kicker: "Распаковка присваивания · head/tail", title: "first, *rest: звёздочка слева собирает list",
      viewBox: "0 0 340 260", zones: STAR_ZONES,
      code: ["first, *rest = [1, 2, 3, 4]"],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Справа — обычный список из четырёх элементов.',
          nodes: [
            { id: "srcl", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "list", value: "[1,2,3,4]", w: 120, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 0, out: "1\n[2, 3, 4]",
          caption: '<code>first</code> забирает голову, <code>*rest</code> — «assigned a <b>list</b> of all items… that are not assigned to any of the mandatory expressions». Заметь: это <span class="hl">list</span>, а <code>*args</code> в сигнатуре — tuple.',
          nodes: [
            { id: "t1", kind: "chip", at: { zone: "tgt", row: 0 }, value: "first=1", accent: true },
            { id: "t2", kind: "chip", at: { zone: "tgt", row: 1 }, value: "rest=[2,3,4]", w: 120, accent: true },
            { id: "srcl", kind: "obj", at: { zone: "src", row: 0 }, typeTag: "list", value: "[1,2,3,4]", w: 120 },
          ],
          edges: [
            { id: "d1", from: "srcl", to: "t1", accent: true },
            { id: "d2", from: "srcl", to: "t2", accent: true },
          ],
        },
      ],
      explain: 'Звёздочка работает и слева от <code>=</code> (PEP 3132): помеченная цель получает список всего, что не разобрали обязательные имена — «assigned a list of all items from the iterable being unpacked that are not assigned to any of the mandatory expressions». Идиомы для тестов: <code>head, *tail = rows</code> — отделить заголовок от данных; <code>first, *_, last = log_lines</code> — взять края. И держи в голове рифму-ловушку для собеса: <code>*rest</code> при присваивании — <b>list</b>, <code>*args</code> в сигнатуре — <b>tuple</b>.',
      sources: ["pep3132", "py-tut-args"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>def f(a, *args, **kwargs): print(a, args, kwargs)</code><br/><code>f(1, 2, 3, x=4)</code> — что напечатает?',
      options: ["1 (2, 3) {'x': 4}", "1 [2, 3] {'x': 4}", "1 (2, 3, 4) {}", "TypeError"], correctIndex: 0, xp: 10,
      okText: 'Кадр собирается по правилу упаковки: <code>a</code> берёт первый позиционный, лишние позиционные — в <span class="hl">tuple</span> («These arguments will be wrapped up in a tuple»), именованный <code>x=4</code> — в dict. Итог: <code>1 (2, 3) {\'x\': 4}</code>.',
      noText: 'Три контейнера кадра: <code>a = 1</code> (обычный параметр), <code>args = (2, 3)</code> — <b>tuple</b>, не list («These arguments will be wrapped up in a tuple»), <code>kwargs = {\'x\': 4}</code> — dict. Реальный вывод python3.12: <code>1 (2, 3) {\'x\': 4}</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M3_c1.py", expect: "1 (2, 3) {'x': 4}" },
      sourceRefs: ["py-tut-args"],
    },
    {
      // MODIFY rung: the same call as c1, but assembled from containers via * / **.
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Вызов из первой карточки <b>переписали через распаковку</b>:<br/><code>pos = [2, 3]; kw = {"x": 4}</code><br/><code>f(1, *pos, **kw)</code> — что напечатает тот же <code>f</code>?',
      options: ["1 (2, 3) {'x': 4}", "1 ([2, 3],) {'kw': {'x': 4}}", "1 [2, 3] {'x': 4}", "TypeError"], correctIndex: 0, xp: 10,
      okText: 'Распаковка на входе, упаковка внутри: <code>*pos</code> раскрыл список в позиционные, <code>**kw</code> — словарь в именованные, а кадр собрал их обратно в <code>args</code>-tuple и <code>kwargs</code>-dict. Байт-в-байт тот же вывод: <code>1 (2, 3) {\'x\': 4}</code> — так wrapper пробрасывает аргументы без потерь.',
      noText: '<code>*pos</code> — не «передать список одним аргументом», а «write the function call with the <code>*</code>-operator to unpack the arguments out of a list or tuple»: вызов эквивалентен <code>f(1, 2, 3, x=4)</code>. Реальный вывод python3.12: <code>1 (2, 3) {\'x\': 4}</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M3_c2.py", expect: "1 (2, 3) {'x': 4}" },
      sourceRefs: ["py-tut-unpack"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>first, *rest = [1, 2, 3, 4]</code><br/><code>print(first)</code> затем <code>print(rest)</code> — что напечатают обе строки?',
      options: ["1 и [2, 3, 4]", "1 и (2, 3, 4)", "[1] и [2, 3, 4]", "ValueError"], correctIndex: 0, xp: 10,
      okText: 'PEP 3132: помеченная звёздочкой цель получает <span class="hl">list</span> всего неразобранного — <code>rest = [2, 3, 4]</code>, а <code>first</code> — голову. Контраст для собеса: <code>*args</code> в сигнатуре — tuple, <code>*rest</code> в присваивании — list.',
      noText: 'Не tuple: в присваивании звёздочка собирает именно список — «assigned a list of all items from the iterable being unpacked that are not assigned to any of the mandatory expressions». Реальный вывод python3.12: <code>1</code>, затем <code>[2, 3, 4]</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M3_c3.py", expect: "1\n[2, 3, 4]" },
      sourceRefs: ["pep3132"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: '<code>find_element(*locator)</code> — распаковка кортежа из POM; <code>client.get(**params)</code> — конфиг словарём; <code>def wrapper(*args, **kwargs)</code> — универсальная сигнатура каждого декоратора и фикстуры.' },
    { icon: "cost", k: "Типы контейнеров", v: '<code>*args</code> — tuple, <code>**kwargs</code> — dict, <code>*rest</code> при присваивании — list. Перепутал tuple/list в assert-е — тест падает на равенстве типов, а не данных.' },
    { icon: "avoid", k: "Порядок сигнатуры", v: 'Не ставь ничего позиционного после <code>*args</code> — оно станет keyword-only; <code>**kwargs</code> всегда последний, иначе SyntaxError ещё на компиляции. Тонкие флаги API делай keyword-only осознанно.' },
  ],

  foot: 'урок · <b>*args и распаковка</b> · 4 анимир. разбора · упаковка/распаковка · дизайн <b>mid</b>',
};
