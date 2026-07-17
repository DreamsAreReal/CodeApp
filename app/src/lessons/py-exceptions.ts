/**
 * Lesson: Exceptions (PY.M9.exceptions) — the REAL class tree (FileNotFoundError
 * and ConnectionError are subclasses of OSError, not direct Exception children —
 * md's hierarchy fixed per RS-02 A-3), handler search is first-match-in-order
 * (specific before general), else runs only on the clean path while finally runs
 * on both, a return inside finally DISCARDS the in-flight exception (PEP 765),
 * and `raise ... from e` chains the cause as __cause__.
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the live pages, fetch-verified
 *     2026-07-16 (reference/compound_stmts try statement, reference/simple_stmts
 *     raise statement, library/exceptions, PEP 765);
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt;
 *   - console outputs of every segment come from executed spikes:
 *     evidence/spikes/f9_{hierarchy,except_order,flow_paths,finally_swallow,
 *     raise_from}_out.txt (each run twice, stderr empty).
 *
 * Loop: cards c1..c4 map to backend review items `PY.M9.exceptions/c{1..4}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the isa-tree band over the catch band (MRO-band geometry).
const Z_TREE: Zone = { id: "tree", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ДЕРЕВО КЛАССОВ · ISA", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_CATCH: Zone = { id: "catch", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ПЕРЕХВАТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const TREE_ZONES: Zone[] = [Z_TREE, Z_CATCH];

// s2: the flying exception (turning into the verdict gate) over the handler chain.
// NB: a wide gate must NOT share a zone-grid column with chip rows (column width =
// max cell over rows -> zone-wide ladder shrink, natural-headroom violation).
const Z_FLY: Zone = { id: "fly", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ЧТО ЛЕТИТ · ПЕРЕХВАТ", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_CHAIN: Zone = { id: "chain", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "EXCEPT-ЦЕПОЧКА · ПОРЯДОК ЗАПИСИ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const ORDER_ZONES: Zone[] = [Z_FLY, Z_CHAIN];

// s3: the clean path band over the exception path band.
const Z_OK: Zone = { id: "okp", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone good", label: "ЧИСТЫЙ ПУТЬ", labelCls: "vz-zlabel good", lx: 170, ly: 24 };
const Z_ERR: Zone = { id: "errp", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone", label: "ПУТЬ С ИСКЛЮЧЕНИЕМ", labelCls: "vz-zlabel", lx: 170, ly: 148 };
const FLOW_ZONES: Zone[] = [Z_OK, Z_ERR];

// s4: the read() frame band over the caller band.
const Z_FRM: Zone = { id: "frm", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "КАДР read() · FINALLY", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_CALL: Zone = { id: "call", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ВЫЗЫВАЮЩИЙ КОД", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const SWALLOW_ZONES: Zone[] = [Z_FRM, Z_CALL];

// s5: the new wrapping exception on the left, its preserved cause on the right.
const Z_NEW: Zone = { id: "neww", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "НОВОЕ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "raise … from e", subCls: "vz-zsub", subY: 47 };
const Z_CAUSE: Zone = { id: "cause", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ПРИЧИНА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "живёт в __cause__", subCls: "vz-zsub heap", subY: 47 };
const CHAIN_ZONES: Zone[] = [Z_NEW, Z_CAUSE];

export const pyExceptions: LessonData = {
  id: "PY.M9.exceptions",
  track: "PY",
  section: "PY",
  lang: "python",
  module: "M9.1",
  title: "Исключения: дерево, порядок, finally",
  kicker: "Python · исключения · механизм",
  home: { subtitle: "OSError, first-match, raise from", icon: "gc", estMinutes: 7 },
  prereqs: ["PY.M8.object-model"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "py-exc-hier", kind: "doc", org: "docs.python.org", title: "Built-in Exceptions · exception hierarchy", url: "https://docs.python.org/3/library/exceptions.html#exception-hierarchy", date: "2026-07-16" },
    { id: "py-try-stmt", kind: "doc", org: "docs.python.org", title: "Compound statements · The try statement", url: "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement", date: "2026-07-16" },
    { id: "py-raise-stmt", kind: "doc", org: "docs.python.org", title: "Simple statements · The raise statement", url: "https://docs.python.org/3/reference/simple_stmts.html#the-raise-statement", date: "2026-07-16" },
    { id: "pep-765", kind: "spec", org: "peps.python.org", title: "PEP 765 — Disallow return/break/continue that exit a finally block", url: "https://peps.python.org/pep-0765/", date: "2026-07-16" },
  ],

  spec: [
    { text: "«If the finally clause executes a return, break or continue statement, the saved exception is discarded.»", source: "py-try-stmt" },
  ],
  edgeCases: [
    { text: "Порядок except-ов — это порядок записи: «This search inspects the except clauses in turn until one is found that matches the exception» — общий класс раньше специфичного делает специфичный обработчик недостижимым.", source: "py-try-stmt" },
    { text: "<code>except Exception</code> ≠ голый <code>except:</code> — мимо первого пролетают system-exiting-ветки BaseException (<code>KeyboardInterrupt</code>, <code>SystemExit</code>, <code>GeneratorExit</code>): «All built-in, non-system-exiting exceptions are derived from this class».", source: "py-exc-hier" },
    { text: "<code>else</code> бежит только если «no exception was raised, and no return, continue, or break statement was executed» — успешный код после try там не попадает под свой же except.", source: "py-try-stmt" },
  ],

  misconceptions: [
    {
      wrong: "finally — это «просто выполнится в конце»",
      hook: 'Вопрос с собеса из конспекта: в <code>try</code> стоит <code>return "from try"</code>, в <code>finally</code> — <code>return "from finally"</code>. Что вернётся? Спайк python3.12 ×2: <span class="hl">from finally</span> — finally перезаписывает return. Хуже: если в try летит <b>исключение</b>, return в finally его <span class="wrong">молча стирает</span> — норма дословно: «the saved exception is discarded». Это не стиль, а официально признанная ловушка: PEP 765 (Final, 3.14) вводит SyntaxWarning на такой код. Ниже — дерево классов, порядок перехвата и цепочки причин.',
      source: "py-try-stmt",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Фикс конспекта · дерево классов", title: "except OSError ловит файлы и сеть разом",
      viewBox: "0 0 340 260", zones: TREE_ZONES,
      code: ["try:", '    raise FileNotFoundError("no cfg")', "except OSError as e:", "    print(type(e).__name__)"],
      console: true,
      scenes: [
        {
          codeLine: 1,
          caption: 'Схема конспекта рисовала <code>FileNotFoundError</code> прямым ребёнком <code>Exception</code>. Реальное дерево: между ними стоит <span class="hl">OSError</span>.',
          nodes: [
            { id: "ex", kind: "chip", at: { zone: "tree", row: 0 }, value: "Exception", w: 96 },
            { id: "os", kind: "chip", at: { zone: "tree", row: 1, col: 0 }, value: "OSError", w: 96, accent: true },
            { id: "fnf", kind: "chip", at: { zone: "tree", row: 1, col: 1 }, value: "FileNotFoundError", w: 168, accent: true },
          ],
          edges: [{ id: "e1", from: "ex", to: "os" }, { id: "e2", from: "os", to: "fnf", accent: true }],
        },
        {
          codeLine: 3, out: "FileNotFoundError",
          caption: 'Обработчик совпадает по <b>классу или базовому классу</b>: <code>FileNotFoundError</code> isa <code>OSError</code> — перехвачен, печатает своё имя.',
          nodes: [
            { id: "ex", kind: "chip", at: { zone: "tree", row: 0 }, value: "Exception", ghost: true, w: 96 },
            { id: "os", kind: "chip", at: { zone: "tree", row: 1, col: 0 }, value: "OSError", w: 96 },
            { id: "fnf", kind: "chip", at: { zone: "tree", row: 1, col: 1 }, value: "FileNotFoundError", w: 168, accent: true },
            { id: "g1", kind: "gate", at: { zone: "catch", row: 0 }, state: "ok", label: "except OSError", detail: "ловит подклассы", w: 144 },
          ],
          edges: [{ id: "e3", from: "fnf", to: "g1", accent: true }],
        },
        {
          codeLine: 2, out: "FileNotFoundError",
          caption: 'Сетевая ветка — <b>тот же except</b>: <code>ConnectionError</code> тоже подкласс <code>OSError</code> (спайк ×2: обе печатают своё имя).',
          nodes: [
            { id: "ex", kind: "chip", at: { zone: "tree", row: 0 }, value: "Exception", ghost: true, w: 96 },
            { id: "os", kind: "chip", at: { zone: "tree", row: 1, col: 0 }, value: "OSError", w: 96, accent: true },
            { id: "conn", kind: "chip", at: { zone: "tree", row: 1, col: 1 }, value: "ConnectionError", w: 144, accent: true },
            { id: "g1", kind: "gate", at: { zone: "catch", row: 0 }, state: "ok", label: "except OSError", detail: "ловит подклассы", w: 144 },
          ],
          edges: [{ id: "e4", from: "conn", to: "g1", accent: true }],
        },
      ],
      explain: 'Иерархия — рабочий инструмент, а не справка: <code>OSError</code> «is raised when a system function returns a system-related error, including I/O failures such as "file not found" or "disk full"», и в его ветке живут обе повседневные беды тестов — <code>FileNotFoundError</code> и <code>ConnectionError</code> («A base class for connection-related issues»). Спайк 3.12 ×2: <code>__mro__</code> обоих — <code>[…, \'OSError\', \'Exception\', \'BaseException\', \'object\']</code>. Поэтому retry-обвязка по файлам и сети — один <code>except OSError</code>, а не перечисление листьев.',
      sources: ["py-exc-hier"],
    },

    {
      id: "s2", num: "02", kicker: "Порядок · первый совпавший", title: "Общий except раньше точного — точный мёртв",
      viewBox: "0 0 340 260", zones: ORDER_ZONES,
      code: ['try: raise FileNotFoundError("x")', 'except OSError: print("A")', 'except FileNotFoundError: print("B")'],
      console: true,
      predictAt: 1,
      predictQ: "Летит FileNotFoundError. В цепочке сначала общий except OSError, потом точный except FileNotFoundError. Что напечатается — A или B?",
      scenes: [
        {
          codeLine: 0,
          caption: 'Исключение летит вниз по цепочке. Поиск обработчика идёт <b>в порядке записи</b>: «inspects the except clauses in turn».',
          nodes: [
            { id: "inst", kind: "chip", at: { zone: "fly", row: 0 }, value: "FileNotFoundError", w: 168, accent: true },
            { id: "h1", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "OSError", w: 96 },
            { id: "h2", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "FileNotFoundError", w: 168 },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "A",
          caption: '<code>FileNotFoundError</code> isa <code>OSError</code> → исключение поглощено <b>первым</b> совпавшим except-ом: <code>A</code>. Поиск остановлен.',
          nodes: [
            { id: "g1", kind: "gate", at: { zone: "fly", row: 0 }, state: "ok", label: "except OSError", detail: "первый · совпал", w: 144 },
            { id: "h1", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "OSError", w: 96, accent: true },
            { id: "h2", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "FileNotFoundError", w: 168 },
          ],
          edges: [{ id: "e1", from: "h1", to: "g1", accent: true }],
        },
        {
          codeLine: 2, out: "A",
          caption: 'Точный обработчик <span class="hl">недостижим навсегда</span> — до него ни одно исключение этой ветки не долетит. Специфичный класс ставь раньше общего.',
          nodes: [
            { id: "g1", kind: "gate", at: { zone: "fly", row: 0 }, state: "ok", label: "except OSError", detail: "первый · совпал", w: 144 },
            { id: "h1", kind: "chip", at: { zone: "chain", row: 0, col: 0 }, value: "OSError", w: 96, accent: true },
            { id: "h2", kind: "chip", at: { zone: "chain", row: 0, col: 1 }, value: "FileNotFoundError", w: 168, ghost: true },
          ],
          edges: [{ id: "e1", from: "h1", to: "g1", accent: true }],
        },
      ],
      explain: 'Норма Reference: «When an exception occurs in the try suite, a search for an exception handler is started. This search inspects the except clauses in turn until one is found that matches the exception», а совпадение — по классу или его базе: «The raised exception matches an except clause whose expression evaluates to the class or a non-virtual base class of the exception object, or to a tuple that contains such a class». Отсюда правило порядка: <code>except OSError</code> над <code>except FileNotFoundError</code> съедает всё — спайк 3.12 ×2 печатает <code>A</code>, ветка <code>B</code> мертва. Линтеры ловят это как unreachable except, но на ревью чужого кода дерево классов держи в голове сам.',
      sources: ["py-try-stmt"],
    },

    {
      id: "s3", num: "03", kicker: "Полный поток · else и finally", title: "else — только чистый путь, finally — оба",
      viewBox: "0 0 340 260", zones: FLOW_ZONES,
      code: ["try: x = 1", 'except ValueError: print("err")', 'else: print("else")', 'finally: print("finally")'],
      console: true,
      scenes: [
        {
          codeLine: 0,
          caption: '<code>try</code> отработал без исключения — путь идёт мимо <code>except</code>.',
          nodes: [
            { id: "try1", kind: "chip", at: { zone: "okp", row: 0, col: 0 }, value: "try", w: 56, accent: true },
            { id: "els1", kind: "chip", at: { zone: "okp", row: 0, col: 1 }, value: "else", w: 56 },
            { id: "fin1", kind: "chip", at: { zone: "okp", row: 0, col: 2 }, value: "finally", w: 96 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "else",
          caption: '<code>else</code> бежит <b>только</b> когда try чист: код «после успеха» не накрыт своим же except-ом.',
          nodes: [
            { id: "try1", kind: "chip", at: { zone: "okp", row: 0, col: 0 }, value: "try", w: 56, ghost: true },
            { id: "els1", kind: "chip", at: { zone: "okp", row: 0, col: 1 }, value: "else", w: 56, accent: true },
            { id: "fin1", kind: "chip", at: { zone: "okp", row: 0, col: 2 }, value: "finally", w: 96 },
          ],
          edges: [{ id: "e1", from: "try1", to: "els1", accent: true }],
        },
        {
          codeLine: 3, out: "else\nfinally",
          caption: 'А если бы try упал: <code>except</code> → всё равно <code>finally</code>, а <code>else</code> пропущен (спайк ×2: <code>err2</code>, <code>finally2</code>). <code>finally</code> бежит на обоих путях.',
          nodes: [
            { id: "try1", kind: "chip", at: { zone: "okp", row: 0, col: 0 }, value: "try", w: 56, ghost: true },
            { id: "els1", kind: "chip", at: { zone: "okp", row: 0, col: 1 }, value: "else", w: 56, accent: true },
            { id: "fin1", kind: "chip", at: { zone: "okp", row: 0, col: 2 }, value: "finally", w: 96, accent: true },
            { id: "exc2", kind: "chip", at: { zone: "errp", row: 0, col: 0 }, value: "except", w: 72, accent: true },
            { id: "fin2", kind: "chip", at: { zone: "errp", row: 0, col: 1 }, value: "finally", w: 96, accent: true },
          ],
          edges: [{ id: "e2", from: "exc2", to: "fin2", accent: true }],
        },
      ],
      explain: 'Условие входа в <code>else</code> сформулировано в норме исчерпывающе: «The optional else clause is executed if the control flow leaves the try suite, no exception was raised, and no return, continue, or break statement was executed». Смысл для тестов: в <code>try</code> держи только строку, которая может упасть, а работу с результатом уноси в <code>else</code> — иначе <code>except ValueError</code> случайно поймает ValueError из твоей собственной обработки. <code>finally</code> — общий хвост обоих путей; реальный прогон 3.12 ×2: чистый путь — <code>else</code>, <code>finally</code>; путь с ошибкой — <code>err2</code>, <code>finally2</code>.',
      sources: ["py-try-stmt"],
    },

    {
      id: "s4", num: "04", kicker: "Собес-ловушка · return в finally", title: "return в finally стирает исключение",
      viewBox: "0 0 340 260", zones: SWALLOW_ZONES,
      code: ["def read():", '    try: raise ValueError("bad")', '    finally: return "done"', "print(read())   # ?"],
      console: true,
      predictAt: 1,
      predictQ: 'В try летит ValueError, но finally делает return "done". Что увидит print(read()) — ValueError или done?',
      scenes: [
        {
          codeLine: 1,
          caption: '<code>ValueError</code> поднят и <b>сохранён</b>: перед вылетом из функции обязан отработать <code>finally</code>.',
          nodes: [
            { id: "ve", kind: "obj", at: { zone: "frm", row: 0 }, typeTag: "ValueError", value: "bad", w: 96, accent: true },
            { id: "pr", kind: "chip", at: { zone: "call", row: 0 }, value: "print(read())", w: 144 },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: '<code>finally</code> исполняет <code>return</code> — и по норме «the saved exception is discarded»: сохранённый <code>ValueError</code> <span class="hl">стёрт</span>.',
          nodes: [
            { id: "ve", kind: "obj", at: { zone: "frm", row: 0, col: 0 }, typeTag: "ValueError", value: "bad", w: 96, ghost: true },
            { id: "g1", kind: "gate", at: { zone: "frm", row: 0, col: 1 }, state: "fail", label: "return в finally", detail: "исключение стёрто", w: 144 },
            { id: "pr", kind: "chip", at: { zone: "call", row: 0 }, value: "print(read())", w: 144 },
          ],
          edges: [{ id: "e1", from: "ve", to: "g1", accent: true }],
        },
        {
          codeLine: 3, out: "done",
          caption: 'Вызывающий получает <code>done</code>, как будто ошибки не было. Реальный прогон ×2 — и тот же спайк: return из try перезаписан return-ом из finally.',
          nodes: [
            { id: "g1", kind: "gate", at: { zone: "frm", row: 0 }, state: "fail", label: "return в finally", detail: "исключение стёрто", w: 144 },
            { id: "pr", kind: "chip", at: { zone: "call", row: 0, col: 0 }, value: "print(read())", w: 144, ghost: true },
            { id: "done", kind: "chip", at: { zone: "call", row: 0, col: 1 }, value: "done", w: 56, accent: true },
          ],
          edges: [{ id: "e2", from: "g1", to: "done", accent: true }],
        },
      ],
      explain: 'Механизм: исключение из <code>try</code> сохраняется, выполняется <code>finally</code>, и «If there is a saved exception it is re-raised at the end of the finally clause» — но «If the finally clause executes a return, break or continue statement, the saved exception is discarded». Спайк 3.12 ×2: функция с <code>raise</code> в try и <code>return "done"</code> в finally возвращает <code>done</code>; парный спайк — return из try перезаписан (<code>from finally</code>). Ловушка признана официально: PEP 765 (Final) — «This PEP proposes to withdraw support for return, break and continue statements that break out of a finally block», с 3.14 такой код получает SyntaxWarning.',
      sources: ["py-try-stmt", "pep-765"],
    },

    {
      id: "s5", num: "05", kicker: "Цепочка причин · raise from", title: "__cause__: обёртка не теряет исходную ошибку",
      viewBox: "0 0 340 260", zones: CHAIN_ZONES,
      code: ['try: int("x")', "except ValueError as e:", '    raise RuntimeError("cfg") from e', "# у RuntimeError: __cause__ → e"],
      console: true,
      scenes: [
        {
          codeLine: 0,
          caption: '<code>int("x")</code> упал — <code>ValueError</code>. Это исходная причина, которую хочется не потерять при обёртке.',
          nodes: [
            { id: "ve", kind: "obj", at: { zone: "cause", row: 0 }, typeTag: "ValueError", value: "'x'", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 2,
          caption: '<code>raise … from e</code> поднимает новое исключение и <b>пристёгивает</b> старое: «it will be attached to the raised exception as the __cause__ attribute».',
          nodes: [
            { id: "rt", kind: "obj", at: { zone: "neww", row: 0 }, typeTag: "RuntimeError", value: "cfg", w: 96, accent: true },
            { id: "cc", kind: "chip", at: { zone: "neww", row: 1 }, value: "__cause__", w: 96, accent: true },
            { id: "ve", kind: "obj", at: { zone: "cause", row: 0 }, typeTag: "ValueError", value: "'x'", w: 96 },
          ],
          edges: [{ id: "e1", from: "cc", to: "ve", accent: true }],
        },
        {
          codeLine: 3, out: "RuntimeError\nValueError",
          caption: 'Обе ступени доступны программно: спайк печатает <code>type(e).__name__</code> и <code>type(e.__cause__).__name__</code>. В traceback упавшего теста видны обе.',
          nodes: [
            { id: "rt", kind: "obj", at: { zone: "neww", row: 0 }, typeTag: "RuntimeError", value: "cfg", w: 96 },
            { id: "cc", kind: "chip", at: { zone: "neww", row: 1 }, value: "__cause__", w: 96 },
            { id: "ve", kind: "obj", at: { zone: "cause", row: 0 }, typeTag: "ValueError", value: "'x'", w: 96, accent: true },
          ],
          edges: [{ id: "e2", from: "cc", to: "ve", accent: true }],
        },
      ],
      explain: 'Норма raise-statement: «The from clause is used for exception chaining: if given, the second expression must be another exception class or instance» и «If the second expression is an exception instance, it will be attached to the raised exception as the __cause__ attribute (which is writable)». Если цепочку не оборвали, «If the raised exception is not handled, both exceptions will be printed» — отчёт о падении показывает и доменную обёртку («конфиг не прочитан»), и техническую причину (<code>ValueError</code> парсинга). Реальный прогон 3.12 ×2: <code>RuntimeError</code>, затем <code>ValueError</code> из <code>__cause__</code>.',
      sources: ["py-raise-stmt"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>def read():</code> в <code>try</code> — <code>raise ValueError("bad")</code>, в <code>finally</code> — <code>return "done"</code>.<br/><code>print(read())</code> — что напечатает (одна строка)?',
      options: ["done", "ValueError", "bad", "None"], correctIndex: 0, xp: 10,
      okText: '<code>return</code> в <code>finally</code> отбрасывает сохранённое исключение — «the saved exception is discarded»: наружу уходит значение, ошибки как не бывало.',
      noText: 'Исключение из <code>try</code> сохраняется до конца <code>finally</code>, но <code>return</code> внутри finally его стирает и возвращает своё значение. Реальный вывод python3.12: <code>done</code>. С 3.14 такой код — SyntaxWarning (PEP 765).',
      verify: { kind: "exec", run: "python3.12 PY.M9_c1.py", expect: "done" },
      sourceRefs: ["py-try-stmt", "pep-765"],
    },
    {
      // MODIFY rung: c1's finally now only prints — the exception flies again.
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Код из c1 <b>починили</b>: <code>finally</code> теперь только <code>print("cleanup")</code>, без return. Снаружи: <code>print(read())</code> под <code>try/except ValueError as e: print(type(e).__name__)</code>.<br/>Что напечатает (две строки)?',
      options: ["cleanup, затем ValueError", "ValueError, затем cleanup", "cleanup, затем None", "только ValueError"], correctIndex: 0, xp: 10,
      okText: 'Без return finally отработал (<code>cleanup</code>) — и сохранённое исключение перевзведено: «If there is a saved exception it is re-raised at the end of the finally clause».',
      noText: 'finally выполняется <b>до</b> вылета исключения из функции: сначала <code>cleanup</code>, затем <code>ValueError</code> долетает до внешнего except. Реальный вывод python3.12: <code>cleanup</code>, затем <code>ValueError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M9_c2.py", expect: "cleanup\nValueError" },
      sourceRefs: ["py-try-stmt"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>try: x = 1</code>, дальше ветки: <code>except ValueError: print("err")</code>, <code>else: print("else")</code>, <code>finally: print("finally")</code>.<br/>Что напечатает (сколько строк и какие)?',
      options: ["else и finally", "только finally", "err и finally", "else, err и finally"], correctIndex: 0, xp: 10,
      okText: 'Чистый путь: except пропущен, <code>else</code> бежит (исключения не было), <code>finally</code> бежит всегда.',
      noText: '<code>else</code> выполняется, когда try завершился без исключения; <code>finally</code> — на любом пути. Реальный вывод python3.12: <code>else</code>, затем <code>finally</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M9_c3.py", expect: "else\nfinally" },
      sourceRefs: ["py-try-stmt"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: 'Летит <code>ConnectionError("api down")</code>. Цепочка: <code>except FileNotFoundError: print("file")</code> → <code>except OSError as e: print("os:", type(e).__name__)</code> → <code>except Exception: print("exc")</code>.<br/>Что напечатает (одна строка)?',
      options: ['os: ConnectionError', "file", "exc", "ConnectionError без префикса"], correctIndex: 0, xp: 10,
      okText: 'Поиск в порядке записи: <code>FileNotFoundError</code> не совпал (другая ветка), <code>OSError</code> — база <code>ConnectionError</code> → совпал первым; до <code>Exception</code> дело не дошло.',
      noText: '<code>ConnectionError</code> — подкласс <code>OSError</code> (не FileNotFoundError!), а поиск останавливается на первом совпавшем except. Реальный вывод python3.12: <code>os: ConnectionError</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M9_c4.py", expect: "os: ConnectionError" },
      sourceRefs: ["py-exc-hier", "py-try-stmt"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: '<code>pytest.raises(ValueError, match="...")</code> — контекст-менеджер, который ЖДЁТ исключение: не прилетело — тест красный. Retry-обвязки ловят <code>except OSError</code> (файлы и сеть — одна ветка дерева), а не <code>except Exception</code>. Обёртки API-клиентов поднимают доменную ошибку через <code>raise … from e</code> — в отчёте видны обе ступени.' },
    { icon: "cost", k: "except Exception: pass", v: 'Глушилка прячет и баги теста, и реальные сбои сервиса — зелёный тест на мёртвом API. Лови самый узкий класс, который умеешь обработать; порядок — специфичный раньше общего, иначе точная ветка недостижима.' },
    { icon: "avoid", k: "return/break/continue в finally", v: 'Стирает летящее исключение («the saved exception is discarded») и перезаписывает return из try. PEP 765: с 3.14 — SyntaxWarning. В finally — только cleanup; значения возвращай из try/else.' },
  ],

  foot: 'урок · <b>исключения</b> · 5 анимир. разборов · OSError-дерево, first-match, finally-ловушка, __cause__ · дизайн <b>mid</b>',
};
