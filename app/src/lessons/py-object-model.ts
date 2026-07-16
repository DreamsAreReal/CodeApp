/**
 * Lesson: Object model (PY.M8.object-model) — attributes live in dictionaries
 * (instance __dict__ shadows class __dict__), the MRO is the C3 linearization
 * that drives every lookup, super() goes to the NEXT class in the MRO (sibling
 * in a diamond — md's "super() = parent" fixed per RS-02 A-7), functions become
 * bound methods through the descriptor protocol (RS-02 B-5, the invisible bit),
 * property/classmethod/staticmethod are the same machinery, and name mangling
 * is a textual rename, not privacy.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank; all six
 *     passages were re-fetch-verified against the live pages on 2026-07-16
 *     (tutorial/classes, howto/mro, howto/descriptor, library/functions);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt;
 *   - console outputs of every segment come from executed spikes:
 *     evidence/spikes/f8_{lookup,super_mro,descriptor,property,cls_static}_out.txt
 *     plus card runs PY.M8_c{1,3,4}; the md interview polymorphism example is
 *     FIXED (RS-02 A-2), the runnable version is f8_polymorphism_fixed.py.
 *
 * Loop: cards c1..c4 map to backend review items `PY.M8.object-model/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1/s2: instances on the left, the shared class on the right.
const Z_INST: Zone = { id: "inst", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИНСТАНСЫ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "свой __dict__", subCls: "vz-zsub", subY: 47 };
const Z_CLS: Zone = { id: "cls", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "КЛАСС Counter", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "один на всех", subCls: "vz-zsub heap", subY: 47 };
const ATTR_ZONES: Zone[] = [Z_INST, Z_CLS];

// s3/s4: the linearized order as a band over the call band.
const Z_MRO: Zone = { id: "mro", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "MRO · ПОРЯДОК ПОИСКА", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_CALL: Zone = { id: "call", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ВЫЗОВ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const MRO_ZONES: Zone[] = [Z_MRO, Z_CALL];

// s5: your code on the left, the descriptor machinery x-rayed on the right.
const Z_CODE: Zone = { id: "codez", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ТВОЙ КОД", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "точка у имени", subCls: "vz-zsub", subY: 47 };
const Z_XRAY: Zone = { id: "xray", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone xray", label: "РЕНТГЕН · __get__", labelCls: "vz-zlabel xray", lx: 257, ly: 24, sub: "невидимое в рантайме", subCls: "vz-zsub", subY: 47 };
const DESC_ZONES: Zone[] = [Z_CODE, Z_XRAY];

// s6: reads/writes on the left, the property gates on the right.
const Z_USE: Zone = { id: "use", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ЧТЕНИЕ / ЗАПИСЬ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "o.total", subCls: "vz-zsub", subY: 47 };
const Z_PROP: Zone = { id: "prop", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "PROPERTY", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "дескриптор с гейтом", subCls: "vz-zsub heap", subY: 47 };
const PROP_ZONES: Zone[] = [Z_USE, Z_PROP];

// s7: the three method kinds over what gets passed implicitly.
const Z_KINDS: Zone = { id: "kinds", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ТРИ ВИДА МЕТОДОВ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_ARG: Zone = { id: "arg", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "НЕЯВНЫЙ ПЕРВЫЙ АРГУМЕНТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const KIND_ZONES: Zone[] = [Z_KINDS, Z_ARG];

// s8: your access attempts on the left, the object's real dict on the right.
const Z_TRY: Zone = { id: "tryz", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ДОСТУП", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "снаружи класса", subCls: "vz-zsub", subY: 47 };
const Z_OBJ: Zone = { id: "objz", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТ p", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "__dict__ на самом деле", subCls: "vz-zsub heap", subY: 47 };
const MANGLE_ZONES: Zone[] = [Z_TRY, Z_OBJ];

export const pyObjectModel: LessonData = {
  id: "PY.M8.object-model",
  track: "PY",
  lang: "python",
  module: "M8.1",
  title: "Объектная модель: атрибуты, MRO, дескрипторы",
  kicker: "Python · object model · механизм",
  home: { subtitle: "Тени атрибутов, C3-порядок, bound methods, mangling", icon: "types", estMinutes: 10 },
  prereqs: ["PY.M7.context-managers"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-tut-classes", kind: "doc", org: "docs.python.org", title: "Tutorial 9 · Classes (class/instance variables, private variables)", url: "https://docs.python.org/3/tutorial/classes.html", date: "2026-07-16" },
    { id: "py-mro-howto", kind: "doc", org: "docs.python.org", title: "HOWTO · The Python 2.3 Method Resolution Order (C3)", url: "https://docs.python.org/3/howto/mro.html", date: "2026-07-16" },
    { id: "py-desc-howto", kind: "doc", org: "docs.python.org", title: "HOWTO · Descriptor Guide", url: "https://docs.python.org/3/howto/descriptor.html", date: "2026-07-16" },
    { id: "py-funcs", kind: "doc", org: "docs.python.org", title: "Built-in Functions · classmethod / staticmethod / super", url: "https://docs.python.org/3/library/functions.html", date: "2026-07-16" },
  ],

  spec: [
    { text: "«the linearization of C is the sum of C plus the merge of the linearizations of the parents and the list of the parents.»", source: "py-mro-howto" },
  ],
  edgeCases: [
    { text: "Тень возникает и внутри метода: первая запись <code>self.total = self.total + 1</code> читает из класса, а пишет в инстанс — дальше каждый объект считает своё, класс не двигается.", source: "py-tut-classes" },
    { text: "<code>super()</code> в diamond-иерархии уходит к <b>sibling</b>-классу, не к родителю: докстрока дословно — «delegates method calls to a parent or sibling class of type».", source: "py-funcs" },
    { text: "Mangling не запирает данные: <code>p._P__x</code> снаружи читается свободно — «nothing in Python makes it possible to enforce data hiding — it is all based upon convention».", source: "py-tut-classes" },
  ],

  misconceptions: [
    {
      wrong: "Полиморфизм — это выучить пример дословно",
      hook: 'Разбор собеса из конспекта: пример полиморфизма с пометкой <span class="wrong">«выучить дословно»</span> — <code>Circle</code>/<code>Rectangle</code> без <code>__init__</code> — на «а запусти» падает <code>AttributeError</code>. Сильный ответ — механизм, не заклинание: у обоих объектов есть <code>area()</code>, точка находит метод по классу инстанса. Починенный вариант (<code>Circle(2), Rectangle(3, 4)</code>) печатает <code>12.56</code> и <code>12</code> (python3.12 ×2). Ниже — машинка точки: словари, MRO, дескрипторы, mangling.',
      source: "py-tut-classes",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Атрибуты · два словаря", title: "Чтение идёт цепочкой: инстанс → класс",
      viewBox: "0 0 340 260", zones: ATTR_ZONES,
      code: ["class Counter:", "    total = 0", "c1 = Counter(); c2 = Counter()"],
      console: true,
      scenes: [
        {
          codeLine: 1,
          caption: '<code>total = 0</code> в теле класса — это запись в <b>словарь класса</b>: атрибут один, лежит в <code>Counter.__dict__</code>.',
          nodes: [
            { id: "cl", kind: "obj", at: { zone: "cls", row: 0 }, typeTag: "Counter", value: "class", w: 96 },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 1 }, value: "total = 0", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: 'Два инстанса — два <b>пустых</b> <code>__dict__</code> (спайк: <code>c1.__dict__</code> → <code>{}</code>). Своих атрибутов у них пока нет.',
          nodes: [
            { id: "c1", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "c1 · dict", value: "{}", w: 96, accent: true },
            { id: "c2", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "c2 · dict", value: "{}", w: 96, accent: true },
            { id: "cl", kind: "obj", at: { zone: "cls", row: 0 }, typeTag: "Counter", value: "class", w: 96, ghost: true },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 1 }, value: "total = 0", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "0",
          caption: '<code>print(c1.total)</code>: в <code>c1.__dict__</code> пусто → поиск шагает в класс и находит <code>0</code>. Цепочка, как в hash-lookup: сначала свой словарь, потом общий.',
          nodes: [
            { id: "c1", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "c1 · dict", value: "{}", w: 96 },
            { id: "c2", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "c2 · dict", value: "{}", w: 96, ghost: true },
            { id: "cl", kind: "obj", at: { zone: "cls", row: 0 }, typeTag: "Counter", value: "class", w: 96, ghost: true },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 1 }, value: "total = 0", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "c1", to: "tot", accent: true }],
        },
      ],
      explain: 'Атрибуты — записи в обычных словарях: у каждого инстанса свой <code>__dict__</code>, у класса — общий. Норма Tutorial дословно: «instance variables are for data unique to each instance and class variables are for attributes and methods shared by all instances of the class». Чтение <code>c1.total</code> идёт цепочкой инстанс → класс → базовые классы — поэтому «атрибут класса» виден через любой объект, пока инстанс не завёл собственный. Реальный прогон 3.12: <code>c1.total</code> → <code>0</code> при пустом <code>c1.__dict__</code>.',
      sources: ["py-tut-classes"],
    },

    {
      id: "s2", num: "02", kicker: "Собес-ловушка · запись ≠ чтение", title: "c1.total = 5 создаёт тень, класс не тронут",
      viewBox: "0 0 340 260", zones: ATTR_ZONES,
      code: ["c1.total = 5   # куда попадёт?", "print(c1.total, c2.total,", "      Counter.total)"],
      console: true,
      predictAt: 2,
      predictQ: "Тень создана: у c1 в __dict__ теперь свой total. Что напечатает print(c1.total, c2.total, Counter.total)?",
      scenes: [
        {
          codeLine: 0,
          caption: 'Присваивание <b>через инстанс</b>. Поиск-цепочка здесь не работает: запись всегда идёт в первый словарь — в <code>c1.__dict__</code>.',
          nodes: [
            { id: "five", kind: "chip", at: { zone: "inst", row: 0 }, value: "total = 5", w: 96, accent: true },
            { id: "c1", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "c1 · dict", value: "{}", w: 120 },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 0 }, value: "total = 0", w: 96 },
          ],
          edges: [{ id: "e1", from: "five", to: "c1", accent: true }],
        },
        {
          codeLine: 0,
          caption: 'В <code>c1.__dict__</code> появился <b>собственный</b> <code>total</code> — тень. Классовый <code>total = 0</code> жив, просто для <code>c1</code> он теперь заслонён.',
          nodes: [
            { id: "c1", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "c1 · dict", value: "total: 5", w: 120, accent: true },
            { id: "c2", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "c2 · dict", value: "{}", w: 96, ghost: true },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 0 }, value: "total = 0", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "5 0 0",
          caption: '<code>c1.total</code> находит тень (5), <code>c2.total</code> и <code>Counter.total</code> — классовый 0. Реальный вывод: <code>5 0 0</code>.',
          nodes: [
            { id: "c1", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "c1 · dict", value: "total: 5", w: 120, accent: true },
            { id: "c2", kind: "obj", at: { zone: "inst", row: 1 }, typeTag: "c2 · dict", value: "{}", w: 96 },
            { id: "tot", kind: "chip", at: { zone: "cls", row: 0 }, value: "total = 0", w: 96, accent: true },
          ],
          edges: [{ id: "e2", from: "c2", to: "tot", accent: true }],
        },
      ],
      explain: 'Асимметрия — сердце ловушки: <b>чтение</b> идёт цепочкой инстанс → класс, а <b>запись</b> через инстанс всегда кладёт в <code>__dict__</code> самого объекта. Поэтому «изменение атрибута класса» через <code>c1.total = 5</code> на деле создаёт локальную тень, и общий счётчик перестаёт быть общим — классика падающих сессий на собесе. Общее состояние меняют по имени класса: <code>Counter.total += 1</code> (карточка c2 этого урока: тогда все трое печатают одно).',
      sources: ["py-tut-classes"],
    },

    {
      id: "s3", num: "03", kicker: "Наследование · C3-линеаризация", title: "MRO: кто ответит на hello()",
      viewBox: "0 0 340 260", zones: MRO_ZONES,
      code: ['class B(A): ...  # hello → "B"', 'class C(A): ...  # hello → "C"', "class D(B, C): pass", "print(D().hello())"],
      console: true,
      scenes: [
        {
          codeLine: 2,
          caption: 'Diamond: <code>D(B, C)</code>, обе базы наследуют <code>A</code>. C3 выстроил <b>один список</b> — <code>D → B → C → A</code> (хвост — <code>object</code>).',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D", accent: true },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B" },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C" },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A" },
            { id: "call", kind: "chip", at: { zone: "call", row: 0 }, value: "d.hello()", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "B",
          caption: 'Поиск шагает по списку: в <code>D</code> метода нет → следующий <code>B</code> — <span class="hl">нашёл</span>. До <code>C</code> дело не дошло: печатается <code>B</code>.',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D", ghost: true },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B", accent: true },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C" },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A" },
            { id: "hit", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "hello в B", detail: "стоп на первом" },
          ],
          edges: [{ id: "e1", from: "hit", to: "b", accent: true }],
        },
        {
          codeLine: 3, out: "B\n['D', 'B', 'C', 'A', 'object']",
          caption: 'Порядок не тайна — он лежит в <code>D.__mro__</code>: <code>[\'D\', \'B\', \'C\', \'A\', \'object\']</code>. На собесе это готовый инструмент проверки себя.',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D" },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B", accent: true },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C" },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A" },
            { id: "mro", kind: "chip", at: { zone: "call", row: 0 }, value: "D.__mro__", w: 96, accent: true },
          ],
          edges: [],
        },
      ],
      explain: 'MRO — единственный источник правды для поиска: определение C3 дословно — «the linearization of C is the sum of C plus the merge of the linearizations of the parents and the list of the parents». Для <code>D(B, C)</code> это <code>[D, B, C, A, object]</code>: локальный порядок баз (сначала B, потом C) сохранён, каждый класс встречается один раз, и «despite the name, the MRO determines the resolution order of attributes, not only of methods». Реальный прогон 3.12: <code>B</code>.',
      sources: ["py-mro-howto"],
    },

    {
      id: "s4", num: "04", kicker: "Фикс конспекта · super ≠ родитель", title: "super() идёт к следующему по MRO",
      viewBox: "0 0 340 260", zones: MRO_ZONES,
      code: ["class B(A):", "    def who(self):", '        return "B->" + super().who()', "print(D().who())  # D(B, C)"],
      console: true,
      scenes: [
        {
          codeLine: 3,
          caption: 'Все четыре класса зовут <code>super().who()</code>. Старт — <code>D</code>: его <code>super()</code> смотрит в MRO и идёт к следующему — <code>B</code>.',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D", accent: true },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B" },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C" },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A" },
            { id: "st", kind: "chip", at: { zone: "call", row: 0 }, value: "старт: D", w: 96 },
          ],
          edges: [{ id: "e1", from: "d", to: "b", accent: true }],
        },
        {
          codeLine: 2,
          caption: 'Ключевой кадр: <code>super()</code> внутри <code>B</code> (родитель которого — <code>A</code>!) на инстансе <code>D</code> уходит к <span class="hl">sibling-классу C</span> — следующему по MRO.',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D", ghost: true },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B", accent: true },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C", accent: true },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A" },
            { id: "sib", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "B → C", detail: "sibling, не A" },
          ],
          edges: [{ id: "e2", from: "b", to: "c", accent: true }],
        },
        {
          codeLine: 3, out: "D->B->C->A",
          caption: 'Полная цепочка вызовов — ровно порядок MRO: <code>D->B->C->A</code> (спайк ×2). Каждый класс diamond-а отработал по одному разу.',
          nodes: [
            { id: "d", kind: "chip", at: { zone: "mro", row: 0, col: 0 }, value: "D", accent: true },
            { id: "b", kind: "chip", at: { zone: "mro", row: 0, col: 1 }, value: "B", accent: true },
            { id: "c", kind: "chip", at: { zone: "mro", row: 0, col: 2 }, value: "C", accent: true },
            { id: "a", kind: "chip", at: { zone: "mro", row: 0, col: 3 }, value: "A", accent: true },
            { id: "res", kind: "chip", at: { zone: "call", row: 0 }, value: "D->B->C->A", w: 120, accent: true },
          ],
          edges: [{ id: "e3", from: "d", to: "b" }, { id: "e4", from: "b", to: "c", accent: true }, { id: "e5", from: "c", to: "a" }],
        },
      ],
      explain: 'Формулировка конспекта «super() — это обращение к родительскому классу» верна только для одиночного наследования. Докстрока дословно: «Return a proxy object that delegates method calls to a parent or sibling class of type» — <code>super()</code> берёт <b>следующий класс в MRO инстанса</b>, а не родителя лексически. Поэтому в diamond кооперативная цепочка обходит все классы по одному разу: <code>D->B->C->A</code> (реальный прогон 3.12 ×2). Это и есть ответ на follow-up собеса «а что сделает super() в ромбе».',
      sources: ["py-funcs", "py-mro-howto"],
    },

    {
      id: "s5", num: "05", kicker: "Невидимое · протокол дескрипторов", title: "Функция + точка = bound method",
      viewBox: "0 0 340 260", zones: DESC_ZONES,
      code: ['raw = User.__dict__["greet"]', "bound = raw.__get__(u, User)", "print(type(raw).__name__)", "print(type(bound).__name__)"],
      console: true,
      scenes: [
        {
          codeLine: 2, out: "function",
          caption: 'В словаре класса метод — <b>обычная функция</b>: <code>type(raw).__name__</code> → <code>function</code>. Никакой магии в неё не зашито.',
          nodes: [
            { id: "raw", kind: "obj", at: { zone: "xray", row: 0 }, typeTag: "function", value: "greet", w: 96, accent: true },
            { id: "u", kind: "chip", at: { zone: "codez", row: 0 }, value: "u", },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "function\nmethod",
          caption: 'Точка дергает у функции <code>__get__</code> — функция и есть дескриптор. Возврат — <b>новый объект</b> <code>method</code>, внутри которого спарены <code>u</code> и <code>greet</code>.',
          nodes: [
            { id: "get", kind: "chip", at: { zone: "xray", row: 0 }, value: "__get__", w: 96, accent: true },
            { id: "bnd", kind: "obj", at: { zone: "xray", row: 1 }, typeTag: "method", value: "u+greet", w: 96, accent: true },
            { id: "u", kind: "chip", at: { zone: "codez", row: 0 }, value: "u" },
          ],
          edges: [{ id: "e1", from: "get", to: "bnd", accent: true }],
        },
        {
          codeLine: 3, out: "function\nmethod",
          caption: 'Поэтому <code>u.greet()</code> не передаёт <code>self</code> руками: bound method уже держит <code>u</code> — спайк подтверждает <code>bound() == u.greet()</code> → <code>True</code>.',
          nodes: [
            { id: "u", kind: "chip", at: { zone: "codez", row: 0 }, value: "u", accent: true },
            { id: "callv", kind: "chip", at: { zone: "codez", row: 1 }, value: "u.greet()", w: 96, accent: true },
            { id: "bnd", kind: "obj", at: { zone: "xray", row: 0 }, typeTag: "method", value: "u+greet", w: 96 },
          ],
          edges: [{ id: "e2", from: "callv", to: "bnd", accent: true }],
        },
      ],
      explain: 'Ответ на «почему self не пишут при вызове» живёт в протоколе дескрипторов: «Descriptors are used throughout the language. It is how functions turn into bound methods». Точка находит функцию в словаре класса и зовёт её <code>__get__(instance, owner)</code>; получившийся <code>method</code> — пара «объект + функция», и «Functions stored in class dictionaries get turned into methods when invoked». Реальный прогон 3.12: <code>function</code> → <code>method</code>, <code>User.greet(u) == u.greet()</code> → <code>True</code> — «магия точки» разобрана до деталей.',
      sources: ["py-desc-howto"],
    },

    {
      id: "s6", num: "06", kicker: "Тот же протокол · property", title: "property: атрибут с гейтом на записи",
      viewBox: "0 0 340 260", zones: PROP_ZONES,
      code: ["@property", "def total(self): return self._total", "@total.setter", "def total(self, v): ...  # v<0 → raise"],
      console: true,
      scenes: [
        {
          codeLine: 1, out: "100",
          caption: 'Чтение <code>o.total</code> выглядит как поле, но проходит через <b>getter</b>: дескриптор <code>property</code> перехватил точку.',
          nodes: [
            { id: "rd", kind: "chip", at: { zone: "use", row: 0 }, value: "o.total", w: 96, accent: true },
            { id: "gt", kind: "gate", at: { zone: "prop", row: 0 }, state: "ok", label: "getter", detail: "_total → 100" },
          ],
          edges: [{ id: "e1", from: "rd", to: "gt", accent: true }],
        },
        {
          codeLine: 3, out: "100\n250",
          caption: 'Запись <code>o.total = 250</code> уходит в <b>setter</b> — валидация прошла, состояние обновлено.',
          nodes: [
            { id: "wr", kind: "chip", at: { zone: "use", row: 0 }, value: "= 250", w: 72, accent: true },
            { id: "st", kind: "gate", at: { zone: "prop", row: 0 }, state: "ok", label: "setter", detail: "v ≥ 0 · записано" },
          ],
          edges: [{ id: "e2", from: "wr", to: "st", accent: true }],
        },
        {
          codeLine: 3, out: "100\n250\nValueError",
          caption: 'А <code>o.total = -1</code> гейт не проходит: setter бросает <code>ValueError</code> — невалидное состояние <span class="hl">не существует ни мгновения</span>.',
          nodes: [
            { id: "wr", kind: "chip", at: { zone: "use", row: 0 }, value: "= -1", w: 72, accent: true },
            { id: "st", kind: "gate", at: { zone: "prop", row: 0 }, state: "fail", label: "setter", detail: "ValueError" },
          ],
          edges: [{ id: "e3", from: "wr", to: "st", accent: true }],
        },
      ],
      explain: '<code>property</code> — не отдельная магия, а тот же протокол, что делал bound methods: «Common tools like classmethod(), staticmethod(), property(), and functools.cached_property() are all implemented as descriptors». Getter/setter дают интерфейс поля с контролем инварианта: снаружи <code>o.total = -1</code>, внутри — гейт с <code>raise</code>. Реальный прогон 3.12: <code>100</code>, <code>250</code>, <code>ValueError</code>. В тестовых моделях так защищают инварианты фикстур без смены call-sites.',
      sources: ["py-desc-howto"],
    },

    {
      id: "s7", num: "07", kicker: "Собес-классика · три вида методов", title: "classmethod vs staticmethod: что придёт первым",
      viewBox: "0 0 340 260", zones: KIND_ZONES,
      code: ["def greet(self): ...       # self", "@classmethod", "def from_env(cls): return cls()", '@staticmethod  # ping() → "pong"'],
      console: true,
      scenes: [
        {
          codeLine: 0,
          caption: 'Обычный метод: первым неявно приходит <b>инстанс</b> — это <code>self</code> (bound method из разбора 05).',
          nodes: [
            { id: "im", kind: "chip", at: { zone: "kinds", row: 0, col: 0 }, value: "greet(self)", w: 120, accent: true },
            { id: "cm", kind: "chip", at: { zone: "kinds", row: 0, col: 1 }, value: "from_env(cls)", w: 120, ghost: true },
            { id: "u", kind: "obj", at: { zone: "arg", row: 0 }, typeTag: "инстанс", value: "u", w: 96, accent: true },
          ],
          edges: [{ id: "e1", from: "u", to: "im", accent: true }],
        },
        {
          codeLine: 2, out: "ApiClient",
          caption: '<code>@classmethod</code>: первым приходит <b>класс</b>. Фабрика <code>from_env</code> возвращает <code>cls()</code> — и в наследнике создаст наследника.',
          nodes: [
            { id: "im", kind: "chip", at: { zone: "kinds", row: 0, col: 0 }, value: "greet(self)", w: 120, ghost: true },
            { id: "cm", kind: "chip", at: { zone: "kinds", row: 0, col: 1 }, value: "from_env(cls)", w: 120, accent: true },
            { id: "k", kind: "obj", at: { zone: "arg", row: 0 }, typeTag: "класс", value: "ApiClient", w: 96, accent: true },
          ],
          edges: [{ id: "e2", from: "k", to: "cm", accent: true }],
        },
        {
          codeLine: 3, out: "ApiClient\npong",
          caption: '<code>@staticmethod</code>: неявного аргумента <b>нет вообще</b> — просто функция, живущая в namespace класса рядом с тем, что тестирует.',
          nodes: [
            { id: "cm", kind: "chip", at: { zone: "kinds", row: 0, col: 0 }, value: "from_env(cls)", w: 120, ghost: true },
            { id: "sm", kind: "chip", at: { zone: "kinds", row: 0, col: 1 }, value: "ping()", w: 96, accent: true },
            { id: "no", kind: "gate", at: { zone: "arg", row: 0 }, state: "ok", label: "ничего", detail: "нет неявного" },
          ],
          edges: [{ id: "e3", from: "no", to: "sm", accent: true }],
        },
      ],
      explain: 'Разница — в том, что дескриптор подставит первым аргументом. Дословно: «A class method receives the class as an implicit first argument, just like an instance method receives the instance» и «A static method does not receive an implicit first argument». Отсюда и практика: <code>@classmethod</code> — фабрики (<code>from_env</code>, <code>from_dict</code>), уважающие наследование через <code>cls</code>; <code>@staticmethod</code> — утилита, которой не нужно ни состояние, ни класс. Реальный прогон 3.12: <code>ApiClient</code>, <code>pong</code>.',
      sources: ["py-funcs"],
    },

    {
      id: "s8", num: "08", kicker: "Не приватность · текстовая замена", title: "Mangling: __x переименован в _P__x",
      viewBox: "0 0 340 260", zones: MANGLE_ZONES,
      code: ["class P:", "    def __init__(self):", "        self.__x = 1   # → _P__x", "print(p.__x)  # ?"],
      console: true,
      predictAt: 2,
      predictQ: "В __dict__ объекта лежит ключ _P__x (ты видел, что p._P__x читается). Что сделает print(p.__x) снаружи класса?",
      scenes: [
        {
          codeLine: 2,
          caption: 'Компилятор <b>текстуально переименовал</b> идентификатор: в <code>__dict__</code> объекта лежит не <code>__x</code>, а <code>_P__x</code>.',
          nodes: [
            { id: "sx", kind: "slot", at: { zone: "objz", row: 0 }, name: "_P__x", value: "1", w: 96, accent: true },
            { id: "src", kind: "chip", at: { zone: "tryz", row: 0 }, value: "self.__x", w: 96 },
          ],
          edges: [{ id: "e1", from: "src", to: "sx", accent: true }],
        },
        {
          codeLine: 3, out: "1",
          caption: 'Знаешь настоящее имя — читаешь снаружи свободно: <code>p._P__x</code> → <code>1</code>. Никакого замка на данных нет.',
          nodes: [
            { id: "ok", kind: "chip", at: { zone: "tryz", row: 0 }, value: "p._P__x", w: 96, accent: true },
            { id: "sx", kind: "slot", at: { zone: "objz", row: 0 }, name: "_P__x", value: "1", w: 96 },
          ],
          edges: [{ id: "e2", from: "ok", to: "sx", accent: true }],
        },
        {
          codeLine: 3, out: "1\nAttributeError",
          caption: 'А вот <code>p.__x</code> снаружи ищет буквально ключ <code>__x</code> — его в словаре нет: <code>AttributeError</code>. Замена имён работает только в теле класса.',
          nodes: [
            { id: "bad", kind: "chip", at: { zone: "tryz", row: 0 }, value: "p.__x", w: 72, accent: true },
            { id: "no", kind: "gate", at: { zone: "objz", row: 0 }, state: "fail", label: "__x", detail: "ключа __x нет" },
          ],
          edges: [{ id: "e3", from: "bad", to: "no", accent: true }],
        },
      ],
      explain: 'Mangling — механика компилятора, не контроль доступа: «Any identifier of the form __spam (at least two leading underscores, at most one trailing underscore) is textually replaced with _classname__spam, where classname is the current class name with leading underscore(s) stripped». Цель — защитить атрибут от случайного <b>переопределения в наследнике</b>, а не спрятать: «nothing in Python makes it possible to enforce data hiding — it is all based upon convention». Реальный прогон 3.12: <code>1</code>, затем <code>AttributeError</code>.',
      sources: ["py-tut-classes"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Counter: total = 0</code> (в <code>__init__</code> только <code>self.count = 0</code>). Дальше: <code>c1 = Counter(); c2 = Counter(); c1.total = 5</code>.<br/><code>print(c1.total, c2.total, Counter.total)</code> — что напечатает (одна строка)?',
      options: ["5 0 0", "5 5 5", "5 0 5", "0 0 0"], correctIndex: 0, xp: 10,
      okText: 'Запись через инстанс создала тень в <code>c1.__dict__</code>; чтение у <code>c2</code> и у класса по-прежнему находит классовый <code>0</code>.',
      noText: 'Чтение идёт цепочкой инстанс → класс, а запись — всегда в словарь самого объекта: <code>c1.total = 5</code> не трогает класс. Реальный вывод python3.12: <code>5 0 0</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M8_c1.py", expect: "5 0 0" },
      sourceRefs: ["py-tut-classes"],
    },
    {
      // MODIFY rung: c1's Counter now increments THROUGH THE CLASS — shared for real.
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Тот же <code>Counter</code>, но метод чинит тень: <code>def inc(self): Counter.total += 1</code>. Вызываем <code>c1.inc()</code> и <code>c2.inc()</code>.<br/><code>print(c1.total, c2.total, Counter.total)</code> — что теперь (одна строка)?',
      options: ["2 2 2", "1 1 2", "1 1 0", "2 0 2"], correctIndex: 0, xp: 10,
      okText: 'Запись по имени <b>класса</b> меняет общий словарь: теней нет, оба инстанса читают классовый <code>total = 2</code>.',
      noText: 'Оба вызова записали в <code>Counter.__dict__</code> (1, затем 2); у инстансов собственных <code>total</code> не появилось — чтение у всех троих находит одно значение. Реальный вывод python3.12: <code>2 2 2</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M8_c2.py", expect: "2 2 2" },
      sourceRefs: ["py-tut-classes"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>B(A)</code> и <code>C(A)</code> оба переопределяют <code>hello</code> (возвращают <code>"B"</code> / <code>"C"</code>), <code>class D(B, C): pass</code>.<br/><code>print(D().hello())</code> и <code>print([c.__name__ for c in D.__mro__])</code> — что напечатают (две строки)?',
      options: ["B и ['D', 'B', 'C', 'A', 'object']", "C и ['D', 'C', 'B', 'A', 'object']", "B и ['D', 'B', 'A', 'C', 'object']", "A и ['D', 'B', 'C', 'A', 'object']"], correctIndex: 0, xp: 10,
      okText: 'C3 сохранил порядок баз из заголовка <code>D(B, C)</code>: поиск идёт D → B (нашёл, стоп) → C → A → object.',
      noText: 'Линеаризация «the sum of C plus the merge of the linearizations of the parents and the list of the parents» даёт <code>[D, B, C, A, object]</code> — до <code>C</code> поиск не дошёл. Реальный вывод python3.12: <code>B</code>, затем <code>[\'D\', \'B\', \'C\', \'A\', \'object\']</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M8_c3.py", expect: "B\n['D', 'B', 'C', 'A', 'object']" },
      sourceRefs: ["py-mro-howto"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>class P</code> в <code>__init__</code> делает <code>self.__x = 1</code>. Снаружи: <code>print(p._P__x)</code>, затем <code>print(p.__x)</code> под <code>try/except AttributeError as e: print(type(e).__name__)</code>.<br/>Что напечатает (две строки)?',
      options: ["1, затем AttributeError", "AttributeError, затем 1", "1, затем 1", "AttributeError, затем AttributeError"], correctIndex: 0, xp: 10,
      okText: 'Идентификатор <code>__x</code> в теле класса переименован в <code>_P__x</code> — под этим ключом значение читается; ключа <code>__x</code> в словаре нет.',
      noText: 'Mangling — текстовая замена «__spam → _classname__spam» только внутри тела класса: снаружи <code>p._P__x</code> работает, <code>p.__x</code> ищет несуществующий ключ. Реальный вывод python3.12: <code>1</code>, затем <code>AttributeError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M8_c4.py", expect: "1\nAttributeError" },
      sourceRefs: ["py-tut-classes"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Page Object — это класс: <code>BasePage</code> держит общие методы, страницы наследуют, mixin-ы (скриншоты, ожидания) встраиваются по MRO. Фабрики окружений — <code>@classmethod from_env(cls)</code>: в наследнике вернут наследника. <code>@property</code> защищает инварианты тестовых моделей.' },
    { icon: "cost", k: "Тень атрибута класса", v: 'Запись через инстанс (<code>self.total = ...</code> или <code>c1.total = ...</code>) создаёт локальную тень, и «общий» счётчик/конфиг молча расщепляется по объектам. Общее состояние меняй по имени класса — или не держи мутабельное состояние в классовых атрибутах вовсе.' },
    { icon: "avoid", k: "super() и mangling на собесе", v: 'Не говори «super() зовёт родителя» — он идёт к следующему по MRO (в diamond — к sibling). И не называй <code>__x</code> приватностью: это текстовая замена от случайного переопределения, снаружи всё читается через <code>_P__x</code>.' },
  ],

  foot: 'урок · <b>object model</b> · 8 анимир. разборов · атрибуты, MRO, дескрипторы · дизайн <b>mid</b>',
};
