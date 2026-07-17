/**
 * Lesson: Имена и объекты (PY.M1.names-objects) — the Python track opener, expert
 * density, 8 animated deep-dives: track map -> name binding -> mutable/immutable ->
 * aliasing -> mutable default -> refcount+GC -> small-int cache -> a real `dis` frame.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (docs.python.org /
 *     peps.python.org, all URLs fetch-verified 2026-07-15);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13), run
 *     twice as a file — see docs/tasks/python-track/evidence/py-cards/census-log.txt;
 *   - the `dis` opcodes in s8 are copied from a real `python3.12 -m dis` run — see
 *     docs/tasks/python-track/evidence/F1/dis-s8.txt;
 *   - the int("256")/int("257") identity facts in s7 are executed evidence — see
 *     docs/tasks/python-track/evidence/F1/int-cache-s7.txt. Literal `257 is 257`
 *     is NOT claimed anywhere (RS-03: undefined across execution modes).
 *
 * Loop: cards c1..c3 map to backend review items `PY.M1.names-objects/c{1..3}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Python memory model: NAMES on the left (a frame holds only references), OBJECTS
// on the right (every value is a heap object). Deliberate contrast with the C#-track
// zones: there is no "value in a slot" here — a name is never a box.
const Z_NAMES: Zone = { id: "names", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИМЕНА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "frame · только ссылки", subCls: "vz-zsub", subY: 47 };
const Z_OBJS: Zone = { id: "objs", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТЫ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "куча CPython", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_NAMES, Z_OBJS];

// s1 (track map): two full-width bands — the 6 language mechanisms on top, the
// AQA tools built from them below.
const Z_MECH: Zone = { id: "mech", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "6 МЕХАНИЗМОВ ЯЗЫКА", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_TOOLS: Zone = { id: "tools", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ТВОИ ИНСТРУМЕНТЫ · AQA", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const MAP_ZONES: Zone[] = [Z_MECH, Z_TOOLS];

export const pyNamesObjects: LessonData = {
  id: "PY.M1.names-objects",
  track: "PY",
  section: "PY",
  lang: "python",
  module: "M1.1",
  title: "Имена и объекты",
  kicker: "Python · модель памяти · механизм",
  home: { subtitle: "Имя → объект: aliasing, refcount", icon: "types", estMinutes: 10 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-datamodel", kind: "doc", org: "docs.python.org", title: "Data model · Objects, values and types", url: "https://docs.python.org/3/reference/datamodel.html#objects-values-and-types", date: "2026-07-15" },
    { id: "py-defaults", kind: "doc", org: "docs.python.org", title: "Tutorial · Default argument values", url: "https://docs.python.org/3/tutorial/controlflow.html#default-argument-values", date: "2026-07-15" },
    { id: "py-faq-defaults", kind: "doc", org: "docs.python.org", title: "FAQ · Why are default values shared between objects?", url: "https://docs.python.org/3/faq/programming.html#why-are-default-values-shared-between-objects", date: "2026-07-15" },
    { id: "py-gc", kind: "doc", org: "docs.python.org", title: "gc — Garbage Collector interface", url: "https://docs.python.org/3/library/gc.html", date: "2026-07-15" },
    { id: "py-int-cache", kind: "doc", org: "docs.python.org", title: "Python/C API · Integer Objects (small-int cache)", url: "https://docs.python.org/3/c-api/long.html#c.PyLong_FromLong", date: "2026-07-15" },
    { id: "pep8", kind: "pep", org: "peps.python.org", title: "PEP 8 · Programming Recommendations", url: "https://peps.python.org/pep-0008/#programming-recommendations", date: "2026-07-15" },
    { id: "py-dis", kind: "doc", org: "docs.python.org", title: "dis — Disassembler for Python bytecode", url: "https://docs.python.org/3/library/dis.html", date: "2026-07-15" },
    { id: "py-glossary-deco", kind: "doc", org: "docs.python.org", title: "Glossary · decorator", url: "https://docs.python.org/3/glossary.html#term-decorator", date: "2026-07-15" },
    { id: "pep492", kind: "pep", org: "peps.python.org", title: "PEP 492 · Coroutines with async and await syntax", url: "https://peps.python.org/pep-0492/", date: "2026-07-15" },
  ],

  spec: [
    { text: "«Every object has an identity, a type and a value.»", source: "py-datamodel" },
  ],
  edgeCases: [
    { text: "Неизменяемость <code>tuple</code> — мелкая: слоты заморожены, но объект-список ВНУТРИ остаётся изменяемым — <code>t[1].append(4)</code> работает (реальный прогон python3.12: <code>(1, [2, 3, 4])</code>).", source: "py-datamodel" },
    { text: "Identity малых <code>int</code> — деталь реализации: «CPython keeps an array of integer objects for all integers between -5 and 256» — поэтому <code>is</code> на числах — баг, а не проверка равенства.", source: "py-int-cache" },
    { text: "<code>del</code> удаляет <b>имя</b>, а не объект: объект живёт, пока на него есть ссылки; на нуле CPython освобождает его — тайминг освобождения — деталь реализации, не гарантия спецификации.", source: "py-gc" },
  ],

  misconceptions: [
    {
      wrong: "переменная в Python хранит значение",
      hook: 'Расхожая картинка «<span class="wrong">переменная — коробка со значением</span>» в Python не работает: <b>имя ссылается на объект</b>. Все значения — объекты в куче CPython, а присваивание лишь <span class="hl">привязывает имя</span> к объекту — «Every object has an identity, a type and a value». Из этой модели выводится всё, на чём валят на собесе: aliasing (<code>b = a</code> — второе имя, не копия), mutable default (один список на все вызовы), «is против ==» и жизнь объекта по счётчику ссылок. Ниже — <b>восемь разборов</b> с анимацией: от карты трека до реального байткода <code>dis</code>.',
      source: "py-datamodel",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Карта трека · из чего сделаны инструменты", title: "6 механизмов под твоим стеком AQA",
      viewBox: "0 0 340 260", zones: MAP_ZONES,
      scenes: [
        {
          caption: 'Весь Python-трек — <b>шесть механизмов языка</b>. Не «темы из учебника», а детали, из которых собраны твои рабочие инструменты.',
          nodes: [
            { id: "m-obj", kind: "chip", at: { zone: "mech", row: 0, col: 0 }, value: "объекты", accent: true },
            { id: "m-clo", kind: "chip", at: { zone: "mech", row: 0, col: 1 }, value: "замыкания" },
            { id: "m-wit", kind: "chip", at: { zone: "mech", row: 0, col: 2 }, value: "with" },
            { id: "m-dec", kind: "chip", at: { zone: "mech", row: 1, col: 0 }, value: "декораторы" },
            { id: "m-gen", kind: "chip", at: { zone: "mech", row: 1, col: 1 }, value: "генераторы" },
            { id: "m-asy", kind: "chip", at: { zone: "mech", row: 1, col: 2 }, value: "async" },
          ],
          edges: [],
        },
        {
          caption: '<code>@pytest.fixture</code> — это <span class="hl">декоратор</span> («a function returning another function»), а yield-фикстура с teardown — <span class="hl">генератор</span>.',
          nodes: [
            { id: "m-obj", kind: "chip", at: { zone: "mech", row: 0, col: 0 }, value: "объекты" },
            { id: "m-clo", kind: "chip", at: { zone: "mech", row: 0, col: 1 }, value: "замыкания" },
            { id: "m-wit", kind: "chip", at: { zone: "mech", row: 0, col: 2 }, value: "with" },
            { id: "m-dec", kind: "chip", at: { zone: "mech", row: 1, col: 0 }, value: "декораторы", accent: true },
            { id: "m-gen", kind: "chip", at: { zone: "mech", row: 1, col: 1 }, value: "генераторы", accent: true },
            { id: "m-asy", kind: "chip", at: { zone: "mech", row: 1, col: 2 }, value: "async" },
            { id: "t-fix", kind: "chip", at: { zone: "tools", row: 0, col: 0 }, value: "@pytest.fixture", accent: true },
            { id: "t-htx", kind: "chip", at: { zone: "tools", row: 0, col: 1 }, value: "with httpx" },
            { id: "t-yld", kind: "chip", at: { zone: "tools", row: 1, col: 0 }, value: "yield-фикстуры", accent: true },
            { id: "t-acl", kind: "chip", at: { zone: "tools", row: 1, col: 1 }, value: "AsyncClient" },
          ],
          edges: [
            { id: "e-dec", from: "m-dec", to: "t-fix", accent: true },
            { id: "e-gen", from: "m-gen", to: "t-yld", accent: true },
          ],
        },
        {
          caption: '<code>with httpx.Client()</code> — контекст-менеджер, <code>AsyncClient</code> — event loop. Все четыре инструмента разобраны на механизмы.',
          nodes: [
            { id: "m-obj", kind: "chip", at: { zone: "mech", row: 0, col: 0 }, value: "объекты" },
            { id: "m-clo", kind: "chip", at: { zone: "mech", row: 0, col: 1 }, value: "замыкания" },
            { id: "m-wit", kind: "chip", at: { zone: "mech", row: 0, col: 2 }, value: "with", accent: true },
            { id: "m-dec", kind: "chip", at: { zone: "mech", row: 1, col: 0 }, value: "декораторы" },
            { id: "m-gen", kind: "chip", at: { zone: "mech", row: 1, col: 1 }, value: "генераторы" },
            { id: "m-asy", kind: "chip", at: { zone: "mech", row: 1, col: 2 }, value: "async", accent: true },
            { id: "t-fix", kind: "chip", at: { zone: "tools", row: 0, col: 0 }, value: "@pytest.fixture" },
            { id: "t-htx", kind: "chip", at: { zone: "tools", row: 0, col: 1 }, value: "with httpx", accent: true },
            { id: "t-yld", kind: "chip", at: { zone: "tools", row: 1, col: 0 }, value: "yield-фикстуры" },
            { id: "t-acl", kind: "chip", at: { zone: "tools", row: 1, col: 1 }, value: "AsyncClient", accent: true },
          ],
          edges: [
            { id: "e-wit", from: "m-wit", to: "t-htx", accent: true },
            { id: "e-asy", from: "m-asy", to: "t-acl", accent: true },
          ],
        },
        {
          caption: 'Механизмы <span class="hl">выводятся друг из друга</span>: декоратор — функция, замкнувшая другую; корутина — родственник генератора. Забыл деталь — восстанови её из соседнего блока. Фундамент всех шести — <span class="hl">имена → объекты</span>: с него и начинаем.',
          nodes: [
            { id: "m-obj", kind: "chip", at: { zone: "mech", row: 0, col: 0 }, value: "объекты", accent: true },
            { id: "m-clo", kind: "chip", at: { zone: "mech", row: 0, col: 1 }, value: "замыкания", accent: true },
            { id: "m-wit", kind: "chip", at: { zone: "mech", row: 0, col: 2 }, value: "with" },
            { id: "m-dec", kind: "chip", at: { zone: "mech", row: 1, col: 0 }, value: "декораторы" },
            { id: "m-gen", kind: "chip", at: { zone: "mech", row: 1, col: 1 }, value: "генераторы" },
            { id: "m-asy", kind: "chip", at: { zone: "mech", row: 1, col: 2 }, value: "async" },
            { id: "t-fix", kind: "chip", at: { zone: "tools", row: 0, col: 0 }, value: "@pytest.fixture" },
            { id: "t-htx", kind: "chip", at: { zone: "tools", row: 0, col: 1 }, value: "with httpx" },
            { id: "t-yld", kind: "chip", at: { zone: "tools", row: 1, col: 0 }, value: "yield-фикстуры" },
            { id: "t-acl", kind: "chip", at: { zone: "tools", row: 1, col: 1 }, value: "AsyncClient" },
          ],
          edges: [
            { id: "e-clo", from: "m-clo", to: "m-dec", accent: true },
            { id: "e-gen", from: "m-gen", to: "m-asy", accent: true },
          ],
        },
      ],
      explain: 'Хребет трека: каждый инструмент AQA — тонкая обёртка над механизмом языка. <code>@pytest.fixture</code> и <code>@allure.step</code> — декораторы: «A function returning another function, usually applied as a function transformation using the <code>@wrapper</code> syntax». Фикстура с teardown — генератор (код после <code>yield</code>), <code>with httpx.Client()</code> / testcontainers — протокол контекст-менеджера, <code>AsyncClient</code> и нагрузка — event loop. Механизмы связаны и между собой — про корутины это зафиксировано дословно: «Since, internally, coroutines are a special kind of generators, every await is suspended by a yield somewhere down the chain of await calls». Понял механизм — инструмент перестаёт быть магией; забыл деталь на собесе — выведи её из соседнего блока этой карты.',
      sources: ["py-glossary-deco", "pep492", "py-datamodel"],
    },

    {
      id: "s2", num: "02", kicker: "Привязка · имя ≠ коробка", title: "Присваивание привязывает имя к объекту",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["x = 257", 'x = "hi"   # тип у объекта', "y = x"],
      scenes: [
        {
          codeLine: 0,
          caption: '<code>x = 257</code> не кладёт значение «в переменную»: создаётся <b>объект</b> <code>int</code> в куче, а имя <code>x</code> лишь <span class="hl">ссылается</span> на него.',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "" },
            { id: "o1", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int · refs: 1", value: "257", accent: true },
          ],
          edges: [{ id: "e1", from: "x", to: "o1", accent: true }],
        },
        {
          codeLine: 1,
          caption: 'Переприсваивание <span class="hl">перекидывает ссылку</span>: у имени нет типа — тип живёт у объекта. Старый <code>int 257</code> остался без ссылок.',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "" },
            { id: "o2", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "str · refs: 1", value: "'hi'", accent: true },
            { id: "o1", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "int · refs: 0", value: "257", ghost: true },
          ],
          edges: [{ id: "e2", from: "x", to: "o2", accent: true }],
        },
        {
          codeLine: 2,
          caption: '<code>y = x</code> — <b>второе имя</b> на тот же объект: <span class="hl">refs: 2</span>. Никакого копирования значения не произошло.',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "" },
            { id: "y", kind: "slot", at: { zone: "names", row: 1 }, name: "y", value: "", accent: true },
            { id: "o2", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "str · refs: 2", value: "'hi'", accent: true },
          ],
          edges: [
            { id: "e2", from: "x", to: "o2" },
            { id: "e3", from: "y", to: "o2", accent: true },
          ],
        },
      ],
      explain: 'Фрейм функции или модуля держит <b>только имена-ссылки</b>; все значения — объекты в куче CPython. Дословно: «Every object has an identity, a type and a value». Тип — свойство <b>объекта</b>, не имени, поэтому одно имя может по очереди ссылаться на <code>int</code> и <code>str</code>, а <code>y = x</code> создаёт второе имя, не вторую «копию значения». Оставшийся без ссылок объект CPython освобождает по счётчику ссылок (разбор 06).',
      sources: ["py-datamodel", "py-gc"],
    },

    {
      id: "s3", num: "03", kicker: "Mutable vs immutable · два мира", title: "Список меняется на месте, строка — никогда",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["a = [1, 2]; b = a", "a.append(3)   # b тоже видит", 's = "py"', 's = s + "!"   # НОВЫЙ объект'],
      scenes: [
        {
          codeLine: 0,
          caption: 'Один объект-список, два имени: <code>a</code> и <code>b</code> ссылаются на <span class="hl">одну и ту же</span> кучу-сущность.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2]" },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst" },
            { id: "eb", from: "b", to: "lst" },
          ],
        },
        {
          codeLine: 1,
          caption: '<code>append</code> меняет объект <b>на месте</b> — идентичность та же, значение новое. Оба имени видят <code>[1,2,3]</code>: мутация «протекает» через все ссылки.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2,3]", accent: true },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst", accent: true },
            { id: "eb", from: "b", to: "lst", accent: true },
          ],
        },
        {
          codeLine: 2,
          caption: 'Строка — <b>immutable</b>: объект <code>\'py\'</code> не изменится никогда.',
          nodes: [
            { id: "s", kind: "slot", at: { zone: "names", row: 0 }, name: "s", value: "" },
            { id: "st1", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "str", value: "'py'" },
          ],
          edges: [{ id: "es", from: "s", to: "st1" }],
        },
        {
          codeLine: 3,
          caption: '«Изменение» строки — это <span class="hl">новый объект</span> <code>\'py!\'</code> и переезд имени. Старый <code>\'py\'</code> остался нетронутым.',
          nodes: [
            { id: "s", kind: "slot", at: { zone: "names", row: 0 }, name: "s", value: "", accent: true },
            { id: "st2", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "str", value: "'py!'", accent: true },
            { id: "st1", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "str", value: "'py'", ghost: true },
          ],
          edges: [{ id: "es2", from: "s", to: "st2", accent: true }],
        },
      ],
      explain: 'Водораздел языка: «Objects whose value can change are said to be <i>mutable</i>; objects whose value is unchangeable once they are created are called <i>immutable</i>». <code>list</code>/<code>dict</code>/<code>set</code> мутируют на месте — и это видят <b>все</b> имена, ссылающиеся на объект; <code>int</code>/<code>str</code>/<code>tuple</code> не меняются — любая «правка» рождает новый объект и перепривязку имени. На собесе спросят «почему строку нельзя изменить» — правильный ответ через модель: менять нечего, операция <code>+</code> создаёт другой объект.',
      sources: ["py-datamodel"],
    },

    {
      id: "s4", num: "04", kicker: "Aliasing · собес-ловушка", title: "b = a — второе имя, не копия",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["a = [1, 2, 3]", "b = a          # копия ссылки", "b.append(4)", "print(a); print(a is b)"],
      predictAt: 3,
      predictQ: '<code>b = a</code>, затем <code>b.append(4)</code>. Что напечатает <code>print(a)</code> — <code>[1, 2, 3]</code> или <code>[1, 2, 3, 4]</code>?',
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: 'Список создан один раз; имя <code>a</code> ссылается на него.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 1", value: "[1,2,3]" },
          ],
          edges: [{ id: "ea", from: "a", to: "lst" }],
        },
        {
          codeLine: 1, out: "",
          caption: '<code>b = a</code> копирует <span class="hl">ссылку</span>, не список: та же сущность, <span class="hl">refs: 2</span>.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "", accent: true },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2,3]", accent: true },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst" },
            { id: "eb", from: "b", to: "lst", accent: true },
          ],
        },
        {
          codeLine: 2, out: "",
          caption: 'Мутация через <code>b</code> меняет <b>единственный</b> объект — «через какое имя менять» не имеет значения.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2,3,4]", accent: true },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst" },
            { id: "eb", from: "b", to: "lst", accent: true },
          ],
        },
        {
          codeLine: 3, out: "[1, 2, 3, 4]",
          caption: '<code>print(a)</code> → <code>[1, 2, 3, 4]</code> (реальный прогон python3.12). Имя <code>a</code> смотрит на тот же изменённый объект.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "", accent: true },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2,3,4]", accent: true },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst", accent: true },
            { id: "eb", from: "b", to: "lst" },
          ],
        },
        {
          codeLine: 3, out: "True",
          caption: '<code>a is b</code> → <code>True</code>: <code>is</code> сравнивает <b>identity</b>, и здесь она одна. Нужна независимая копия — копируй явно: <code>b = list(a)</code>.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · id: одна", value: "[1,2,3,4]", accent: true },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst", accent: true },
            { id: "eb", from: "b", to: "lst", accent: true },
          ],
        },
      ],
      explain: 'Aliasing — прямое следствие привязки имён: <code>b = a</code> даёт объекту второе имя, а «Every object has an identity, a type and a value» — идентичность у него одна, что и подтверждает <code>a is b → True</code>. Поэтому мутация через любое имя видна через все остальные. В тестах это классический источник «плавающих» данных: фикстура вернула список, два теста его разделили — и первый <code>append</code> «испортил» данные второму. Лечится явной копией на границе (<code>list(a)</code>, <code>a[:]</code>), а не верой в «переменные».',
      sources: ["py-datamodel"],
    },

    {
      id: "s5", num: "05", kicker: "Mutable default · один список на все вызовы", title: "Дефолт вычисляется один раз — при def",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["def add(x, items=[]):", "    items.append(x); return items", 'print(add("a"))', 'print(add("b"))'],
      predictAt: 2,
      predictQ: 'Первый вызов напечатал <code>[\'a\']</code>. Что напечатает <code>add("b")</code> — <code>[\'b\']</code> или <code>[\'a\', \'b\']</code>?',
      console: true,
      scenes: [
        {
          codeLine: 0, out: "",
          caption: '<code>def</code> — исполняемый оператор: он создаёт <b>объект-функцию</b> и <span class="hl">один раз</span> вычисляет дефолт <code>[]</code>, пряча его у функции.',
          nodes: [
            { id: "fn", kind: "slot", at: { zone: "names", row: 0 }, name: "fn", value: "" },
            { id: "fo", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add", accent: true },
            { id: "df", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "__defaults__", value: "[]", accent: true },
          ],
          edges: [
            { id: "ef", from: "fn", to: "fo" },
            { id: "ed", from: "fo", to: "df", accent: true },
          ],
        },
        {
          codeLine: 2, out: "['a']",
          caption: 'Вызов без <code>items</code> берёт <span class="hl">тот самый</span> список из <code>__defaults__</code> и мутирует его: <code>[\'a\']</code>.',
          nodes: [
            { id: "fn", kind: "slot", at: { zone: "names", row: 0 }, name: "fn", value: "" },
            { id: "fo", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add" },
            { id: "df", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "__defaults__", value: "['a']", accent: true },
          ],
          edges: [
            { id: "ef", from: "fn", to: "fo" },
            { id: "ed", from: "fo", to: "df", accent: true },
          ],
        },
        {
          codeLine: 3, out: "['a', 'b']",
          caption: 'Второй вызов приходит в <b>тот же объект</b>: <code>[\'a\', \'b\']</code> (реальный прогон). Состояние пережило вызов — дефолт не пересоздаётся.',
          nodes: [
            { id: "fn", kind: "slot", at: { zone: "names", row: 0 }, name: "fn", value: "" },
            { id: "fo", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add" },
            { id: "df", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "__defaults__", value: "['a','b']", accent: true },
          ],
          edges: [
            { id: "ef", from: "fn", to: "fo" },
            { id: "ed", from: "fo", to: "df", accent: true },
          ],
        },
        {
          codeLine: 0, out: "",
          caption: 'Починка — сторожевой дефолт: <code>items=None</code>, и <span class="hl">новый список в теле</span> на каждый вызов.',
          nodes: [
            { id: "fn", kind: "slot", at: { zone: "names", row: 0 }, name: "fn", value: "" },
            { id: "fo", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "function", value: "add" },
            { id: "fix", kind: "gate", at: { zone: "objs", row: 1 }, state: "ok", label: "починка", detail: "items = None" },
          ],
          edges: [{ id: "ef", from: "fn", to: "fo" }],
        },
      ],
      explain: 'Дефолт — часть <b>объекта-функции</b>, не вызова. Дословно из Tutorial: «The default value is evaluated only once. This makes a difference when the default is a mutable object such as a list…», и из FAQ: «Default values are created exactly once, when the function is defined». Поэтому <code>items=[]</code> — один общий список на все вызовы: состояние накапливается. На собесе спросят «что напечатает второй вызов» — отвечай через механизм def-time, а не заученным выводом. В хелперах и фикстурах пиши <code>items=None</code> + создание внутри.',
      sources: ["py-defaults", "py-faq-defaults"],
    },

    {
      id: "s6", num: "06", kicker: "Время жизни · refcount + циклический gc", title: "del удаляет имя — объект живёт по счётчику ссылок",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["a = [1, 2]; b = a", "del a         # refs: 2 → 1", "del b         # refs: 0", "# кольцо: a.append(a) → gc"],
      scenes: [
        {
          codeLine: 0,
          caption: 'Объект жив, пока на него смотрят имена: <span class="hl">refs: 2</span>.',
          nodes: [
            { id: "a", kind: "slot", at: { zone: "names", row: 0 }, name: "a", value: "" },
            { id: "b", kind: "slot", at: { zone: "names", row: 1 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 2", value: "[1,2]" },
          ],
          edges: [
            { id: "ea", from: "a", to: "lst" },
            { id: "eb", from: "b", to: "lst" },
          ],
        },
        {
          codeLine: 1,
          caption: '<code>del a</code> удаляет <b>имя</b>, не объект: счётчик падает до <span class="hl">1</span>, объект жив — <code>b</code> продолжает работать.',
          nodes: [
            { id: "b", kind: "slot", at: { zone: "names", row: 0 }, name: "b", value: "" },
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 1", value: "[1,2]", accent: true },
          ],
          edges: [{ id: "eb", from: "b", to: "lst" }],
        },
        {
          codeLine: 2,
          caption: 'Последняя ссылка ушла — счётчик <span class="hl">0</span>, CPython освобождает объект (обычно сразу). Но это <b>деталь реализации CPython</b>, не гарантия спецификации языка.',
          nodes: [
            { id: "lst", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 0", value: "[1,2]", ghost: true },
          ],
          edges: [],
        },
        {
          codeLine: 3,
          caption: 'Кольцо ссылок счётчик не спасёт: объект ссылается <span class="hl">сам на себя</span>, refs никогда не 0 — такие циклы находит <b>циклический сборщик</b>.',
          nodes: [
            { id: "gc", kind: "gate", at: { zone: "names", row: 0 }, state: "ok", label: "циклический gc", detail: "нашёл кольцо" },
            { id: "cyc", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "list · refs: 1" },
            { id: "self", kind: "chip", at: { in: "cyc" }, value: "→ сам себя", accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'Память CPython держится на двух механизмах. Основной — <b>счётчик ссылок</b>: каждая привязка имени/контейнера увеличивает его, каждая потеря — уменьшает; на нуле CPython освобождает объект — обычно сразу, но это <span class="hl">деталь реализации CPython</span>, а не гарантия спецификации языка. Второй — циклический сборщик: «the collector supplements the reference counting already used in Python» — он ловит кольца, до которых счётчик не дотягивается. Практическое следствие для тестов: не строй cleanup на «объект умрёт вот здесь» — файл или клиент закрывай явно через <code>with</code> (урок context managers).',
      sources: ["py-gc"],
    },

    {
      id: "s7", num: "07", kicker: "Кэш малых int · is ≠ ==", title: "Почему is на числах — баг",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ['int("256") is int("256")  # True', 'int("257") is int("257")  # False'],
      console: true,
      scenes: [
        {
          codeLine: 0, out: "True",
          caption: 'Малые числа <span class="hl">прекэшированы</span>: оба вызова <code>int("256")</code> вернули <b>один</b> объект из кэша −5…256 → <code>is</code> даёт <code>True</code>.',
          nodes: [
            { id: "c1", kind: "chip", at: { zone: "names", row: 0 }, value: "вызов №1" },
            { id: "c2", kind: "chip", at: { zone: "names", row: 1 }, value: "вызов №2" },
            { id: "o", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int", value: "256", accent: true },
            { id: "k", kind: "chip", at: { zone: "objs", row: 1 }, value: "кэш −5…256" },
          ],
          edges: [
            { id: "e1", from: "c1", to: "o" },
            { id: "e2", from: "c2", to: "o", accent: true },
          ],
        },
        {
          codeLine: 1, out: "False",
          caption: '<code>257</code> вне кэша: два вызова — <span class="hl">два разных объекта</span> с равными значениями → <code>is</code> даёт <code>False</code> (реальный прогон 3.12).',
          nodes: [
            { id: "c1", kind: "chip", at: { zone: "names", row: 0 }, value: "вызов №1" },
            { id: "c2", kind: "chip", at: { zone: "names", row: 1 }, value: "вызов №2" },
            { id: "oa", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int", value: "257", accent: true },
            { id: "ob", kind: "obj", at: { zone: "objs", row: 1 }, typeTag: "int", value: "257", accent: true },
          ],
          edges: [
            { id: "e1", from: "c1", to: "oa" },
            { id: "e2", from: "c2", to: "ob", accent: true },
          ],
        },
        {
          codeLine: 1, out: "False",
          caption: 'Вывод: identity малых int — <b>деталь реализации</b>. Значения сравнивай <code>==</code>; <code>is</code> оставь для <code>None</code>.',
          nodes: [
            { id: "gate", kind: "gate", at: { zone: "names", row: 0 }, state: "fail", label: "is на числах", detail: "деталь CPython" },
            { id: "ok", kind: "gate", at: { zone: "objs", row: 0 }, state: "ok", label: "== — значение", detail: "is — для None" },
          ],
          edges: [],
        },
      ],
      explain: 'CPython оптимизирует малые числа: «CPython keeps an array of integer objects for all integers between -5 and 256» — поэтому рантайм-значения в этом диапазоне делят один объект, а «соседние» 257 уже нет. Мы показываем это на <code>int("257")</code> — <b>рантайм-объектах</b>: с литералами в одном файле результат другой (компилятор складывает константы), т.е. поведение зависит от способа исполнения — верный признак того, что опираться на него нельзя. Правило PEP 8: «Comparisons to singletons like None should always be done with <code>is</code> or <code>is not</code>, never the equality operators» — а для булевых наоборот: «Don\'t compare boolean values to True or False using ==» — пиши просто <code>if x:</code>.',
      sources: ["py-int-cache", "pep8"],
    },

    {
      id: "s8", num: "08", kicker: "Байткод · невидимое становится видимым", title: "dis: привязка имён в опкодах",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["x = 257", "y = x"],
      il: [
        { off: "0", op: "RESUME", arg: "0", cmt: "// 3.12: старт кадра" },
        { off: "2", op: "LOAD_CONST", arg: "0 (257)", cmt: "// объект из co_consts" },
        { off: "4", op: "STORE_NAME", arg: "0 (x)", cmt: "// привязать имя x" },
        { off: "6", op: "LOAD_NAME", arg: "0 (x)", cmt: "// что за именем x?" },
        { off: "8", op: "STORE_NAME", arg: "1 (y)", cmt: "// второе имя" },
        { off: "10", op: "RETURN_CONST", arg: "1 (None)", cmt: "" },
      ],
      scenes: [
        {
          codeLine: 0, ilLine: 1,
          caption: '<code>LOAD_CONST</code> кладёт на стек VM <span class="hl">ссылку на объект</span> <code>257</code> из констант кадра — значение уже живёт объектом.',
          nodes: [
            { id: "o", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int · refs: 0", value: "257", accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 0, ilLine: 2,
          caption: '<code>STORE_NAME x</code> — вот она, привязка: имя <code>x</code> начинает <span class="hl">ссылаться</span> на объект. Ни одного «копирования значения».',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "", accent: true },
            { id: "o", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int · refs: 1", value: "257", accent: true },
          ],
          edges: [{ id: "ex", from: "x", to: "o", accent: true }],
        },
        {
          codeLine: 1, ilLine: 3,
          caption: '<code>LOAD_NAME x</code> достаёт из фрейма ссылку, спрятанную за именем <code>x</code>.',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "", accent: true },
            { id: "o", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int · refs: 1", value: "257" },
          ],
          edges: [{ id: "ex", from: "x", to: "o", accent: true }],
        },
        {
          codeLine: 1, ilLine: 4,
          caption: '<code>STORE_NAME y</code> — второе имя на <b>тот же</b> объект: <span class="hl">refs: 2</span>. Весь разбор 02 — вот в этих четырёх опкодах.',
          nodes: [
            { id: "x", kind: "slot", at: { zone: "names", row: 0 }, name: "x", value: "" },
            { id: "y", kind: "slot", at: { zone: "names", row: 1 }, name: "y", value: "", accent: true },
            { id: "o", kind: "obj", at: { zone: "objs", row: 0 }, typeTag: "int · refs: 2", value: "257", accent: true },
          ],
          edges: [
            { id: "ex", from: "x", to: "o" },
            { id: "ey", from: "y", to: "o", accent: true },
          ],
        },
      ],
      explain: 'Панель выше — реальный вывод <code>python3.12 -m dis</code> (лог прогона — в evidence волны). «The dis module supports the analysis of CPython bytecode by disassembling it» — и в байткоде видно главное: <code>LOAD_CONST</code> оперирует <b>ссылкой на объект</b>, а <code>STORE_NAME</code> просто записывает её в таблицу имён кадра. Присваивание — одна запись в словарь имён, без копий значения. Помни и оговорку дословно: «Bytecode is an implementation detail of the CPython interpreter» — опкоды меняются между версиями (эти — из 3.12), поэтому в уроках они всегда из реального прогона.',
      sources: ["py-dis"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>def add_item(item, items=[]):&nbsp;items.append(item);&nbsp;return items</code><br/><code>print(add_item("a"))</code> затем <code>print(add_item("b"))</code> — что напечатают ОБА вызова (две строки)?',
      options: ["['a'] и ['a', 'b']", "['a'] и ['b']", "['a', 'b'] и ['a', 'b']", "TypeError"], correctIndex: 0, xp: 10,
      okText: 'Дефолт <code>[]</code> вычислен <span class="hl">один раз — при def</span> («Default values are created exactly once, when the function is defined») и живёт в <code>__defaults__</code> объекта-функции. Второй вызов мутирует <b>тот же</b> список: <code>[\'a\', \'b\']</code>. Починка: <code>items=None</code> + новый список в теле.',
      noText: 'Ключ — <b>когда</b> вычисляется дефолт: не при вызове, а при <code>def</code>, один раз («The default value is evaluated only once»). Оба вызова делят один список, поэтому реальный вывод python3.12: <code>[\'a\']</code>, затем <code>[\'a\', \'b\']</code>. Забыл — выведи из модели: дефолт это объект у функции, а список mutable.',
      verify: { kind: "exec", run: "python3.12 PY.M1_c1.py", expect: "['a']\n['a', 'b']" },
      sourceRefs: ["py-defaults", "py-faq-defaults"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>a = [1, 2, 3]; b = a; b.append(4)</code><br/><code>print(a)</code> затем <code>print(a is b)</code> — что напечатают обе строки?',
      options: ["[1, 2, 3, 4] и True", "[1, 2, 3] и True", "[1, 2, 3, 4] и False", "[1, 2, 3] и False"], correctIndex: 0, xp: 10,
      okText: '<code>b = a</code> — вторая <span class="hl">ссылка на тот же объект</span>, не копия. Мутация через <code>b</code> видна через <code>a</code>: <code>[1, 2, 3, 4]</code>; identity одна — <code>a is b → True</code>. Нужна независимая копия — <code>list(a)</code> или <code>a[:]</code>.',
      noText: 'Присваивание в Python не копирует объект — оно <b>привязывает второе имя</b>. Список один, поэтому <code>print(a)</code> показывает мутацию (<code>[1, 2, 3, 4]</code>), а <code>a is b</code> — <code>True</code> (одна identity). Реальный вывод python3.12 подтверждает.',
      verify: { kind: "exec", run: "python3.12 PY.M1_c2.py", expect: "[1, 2, 3, 4]\nTrue" },
      sourceRefs: ["py-datamodel"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>t = (1, [2, 3]); t[1].append(4); print(t)</code> — что напечатает?',
      options: ["(1, [2, 3, 4])", "TypeError", "(1, [2, 3])", "AttributeError"], correctIndex: 0, xp: 10,
      okText: 'Неизменяемость tuple — <span class="hl">мелкая</span>: заморожены его <b>слоты-ссылки</b>, а не объекты за ними. <code>t[1]</code> — обычный mutable-список, <code>append</code> легален: <code>(1, [2, 3, 4])</code>. <code>TypeError</code> был бы на перепривязке слота: <code>t[0] = 9</code>.',
      noText: 'Tuple запрещает <b>перепривязку слотов</b> (<code>t[0] = 9</code> — TypeError), но слот 1 держит ссылку на mutable-список — и сам список менять можно. Реальный вывод python3.12: <code>(1, [2, 3, 4])</code>. Отсюда же: такой tuple нехэшируем (ключом dict не станет).',
      verify: { kind: "exec", run: "python3.12 PY.M1_c3.py", expect: "(1, [2, 3, 4])" },
      sourceRefs: ["py-datamodel"],
    },
    {
      // The MODIFY rung of the recall ladder (predict -> modify -> explain): the code of c1
      // repaired with the sentinel default from segment s5 — predict the CHANGED behaviour.
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: 'Код из первой карточки <b>починили</b> дефолтом-стражем:<br/><code>def add_item(item, items=None):<br/>&nbsp;&nbsp;if items is None: items = []<br/>&nbsp;&nbsp;items.append(item); return items</code><br/><code>print(add_item("a"))</code> затем <code>print(add_item("b"))</code> — что напечатают обе строки теперь?',
      options: ["['a'] и ['b']", "['a'] и ['a', 'b']", "['b'] и ['b']", "None и None"], correctIndex: 0, xp: 10,
      okText: 'Именно так работает починка: дефолт теперь <code>None</code> — immutable-страж, вычисленный один раз при <code>def</code>, — а <span class="hl">новый список создаётся в теле</span> на каждый вызов. Состояние больше не переживает вызов: <code>[\'a\']</code>, затем <code>[\'b\']</code>. Это идиома для хелперов и фикстур.',
      noText: 'Сравни с c1: там общий список жил в <code>__defaults__</code> и копил состояние. Здесь дефолт — <code>None</code>, а список рождается <b>внутри вызова</b>, каждый раз новый. Реальный вывод python3.12: <code>[\'a\']</code>, затем <code>[\'b\']</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M1_c4.py", expect: "['a']\n['b']" },
      sourceRefs: ["py-defaults", "py-faq-defaults"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Фикстура возвращает <span class="hl">объект, не копию</span>: разделили список/словарь между тестами — мутация одного видна всем (aliasing). На границах фикстур отдавай копию или стройся на immutable.' },
    { icon: "cost", k: "Состояние переживает вызов", v: 'Mutable default в сигнатурах хелперов и фикстур (<code>def helper(x, acc=[])</code> в conftest) копит состояние между вызовами — «The default value is evaluated only once». Пиши <code>None</code>-дефолт.' },
    { icon: "avoid", k: "is / == / жизнь объекта", v: '<code>is</code> — только для <code>None</code>; значения — через <code>==</code> (identity малых int — деталь реализации). Cleanup по счётчику ссылок не планируй — файлы и клиенты закрывай через <code>with</code>.' },
  ],

  foot: 'урок · <b>имена и объекты</b> · 8 анимир. разборов + dis · refcount · int-кэш · дизайн <b>mid</b>',
};
