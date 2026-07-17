/**
 * Lesson: strings + control flow cheatsheet (PY.M12.strings-flow) — the P2
 * reference sections of the user's md (§2 strings/f-strings, §4 flow) kept as a
 * CHEATSHEET lesson: three story segments where there IS a mechanism to animate
 * (slice semantics on a live string, f-string format-spec pipeline, the loop
 * else contract) plus a 6-card predict deck for the everyday API (str methods,
 * walrus). Per the gate decision, cheatsheets carry a predict deck WITHOUT the
 * mandatory modify/explain ladder (features.md header).
 *
 * Accuracy contract (G2/G2a):
 *   - every English quote is VERBATIM from the RS-02 source bank (PEP 498,
 *     stdtypes, tutorial/controlflow, reference/expressions); all passages
 *     re-fetch-verified against the live pages on 2026-07-16;
 *   - every card's `verify.expect` is the REAL stdout of python3.12 (3.12.13),
 *     run twice as a file — see evidence/py-cards/census-log.txt;
 *   - all console outputs come from executed spikes: evidence/spikes/
 *     f12_{slices,fstrings,percent,for_else,for_else_empty,slice_over,walrus,
 *     str_methods}_out.txt (each run x2).
 *
 * Loop: cards c1..c6 map to backend review items `PY.M12.strings-flow/c{1..6}`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// s1: the string with its index rows over the slice result.
const Z_STR: Zone = { id: "str", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "СТРОКА · s = \"Test\"", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_RES: Zone = { id: "res", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "СРЕЗ · РЕЗУЛЬТАТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const SLICE_ZONES: Zone[] = [Z_STR, Z_RES];

// s2: the expression+spec pipeline over the resulting string.
const Z_EXPR: Zone = { id: "expr", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ВЫРАЖЕНИЕ + FORMAT-SPEC", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_OUT: Zone = { id: "outz", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "СТРОКА-РЕЗУЛЬТАТ", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const FMT_ZONES: Zone[] = [Z_EXPR, Z_OUT];

// s3: the scanning loop over the else branch.
const Z_ITER: Zone = { id: "iter", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "ЦИКЛ · x in [1, 2, 3]", labelCls: "vz-zlabel", lx: 170, ly: 24 };
const Z_ELSE: Zone = { id: "elsez", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone good", label: "ELSE-ВЕТКА ЦИКЛА", labelCls: "vz-zlabel good", lx: 170, ly: 148 };
const ELSE_ZONES: Zone[] = [Z_ITER, Z_ELSE];

export const pyStringsFlow: LessonData = {
  id: "PY.M12.strings-flow",
  track: "PY",
  section: "PY",
  lang: "python",
  module: "M12.1",
  title: "Шпаргалка: строки и поток управления",
  kicker: "Python · шпаргалка · строки и поток",
  home: { subtitle: "Срезы, f-string, for-else, walrus", icon: "types", estMinutes: 6 },
  prereqs: ["PY.M1.names-objects"],
  depth: 3,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "pep-498", kind: "pep", org: "peps.python.org", title: "PEP 498 — Literal String Interpolation", url: "https://peps.python.org/pep-0498/", date: "2026-07-16" },
    { id: "py-stdtypes", kind: "doc", org: "docs.python.org", title: "Built-in Types · sequence operations / str", url: "https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str", date: "2026-07-16" },
    { id: "py-tut-flow", kind: "doc", org: "docs.python.org", title: "Tutorial 4 · More Control Flow Tools (else on loops)", url: "https://docs.python.org/3/tutorial/controlflow.html", date: "2026-07-16" },
    { id: "py-ref-expr", kind: "doc", org: "docs.python.org", title: "Expressions · Assignment expressions (walrus)", url: "https://docs.python.org/3/reference/expressions.html", date: "2026-07-16" },
  ],

  spec: [
    { text: "«In a for or while loop the break statement may be paired with an else clause. If the loop finishes without executing the break, the else clause executes.»", source: "py-tut-flow" },
  ],
  edgeCases: [
    { text: "Срез прощает выход за границы: <code>\"Test\"[1:100]</code> → <code>est</code>, а одиночный индекс — нет: <code>\"Test\"[100]</code> → <code>IndexError</code> (спайк ×2).", source: "py-stdtypes" },
    { text: "Walrus привязывает И возвращает: «An assignment expression (sometimes also called a \"named expression\" or \"walrus\") assigns an expression to an identifier, while also returning the value of the expression.» — <code>if (n := len(items)) > 2: print(n)</code> → <code>3</code>.", source: "py-ref-expr" },
    { text: "f-строка — не константа: «It should be noted that an f-string is really an expression evaluated at run time, not a constant value.» Внутри скобок — любой живой код.", source: "pep-498" },
  ],

  misconceptions: [
    {
      wrong: "else у цикла сработает после break — «нашли элемент, обработали»",
      hook: 'Трик-вопрос из конспекта. <code>else</code> у цикла читают как угодно: «выполнится после <code>break</code>», «выполнится, если коллекция пуста». Норма Tutorial дословно: «If the loop finishes without executing the <code>break</code>, the <code>else</code> clause executes» — то есть <code>else</code> означает <span class="wrong">«break НЕ сработал»</span>. На пустой коллекции он поэтому <b>тоже</b> выполняется (спайк ×2: <code>else ran</code>). Ниже три разбора-шпаргалки: срезы на живой строке, конвейер f-string спеков и контракт for-else + колода карточек на ежедневный API.',
      source: "py-tut-flow",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Срезы · полуинтервал и шаг", title: "s[i:j:k]: старт включён, стоп — нет",
      viewBox: "0 0 340 260", zones: SLICE_ZONES,
      code: ['s = "Test"', "print(s[1:3]); print(s[-1])", "print(s[::-1])", "print(s[::2])"],
      console: true,
      scenes: [
        {
          codeLine: 1, out: "es",
          caption: '<code>s[1:3]</code> — полуинтервал: индекс 1 <b>включён</b>, 3 — <span class="hl">исключён</span>. Забрали <code>e</code> и <code>s</code>.',
          nodes: [
            { id: "t0", kind: "chip", at: { zone: "str", row: 0, col: 0 }, value: "T · 0", w: 56 },
            { id: "t1", kind: "chip", at: { zone: "str", row: 0, col: 1 }, value: "e · 1", w: 56, accent: true },
            { id: "t2", kind: "chip", at: { zone: "str", row: 0, col: 2 }, value: "s · 2", w: 56, accent: true },
            { id: "t3", kind: "chip", at: { zone: "str", row: 0, col: 3 }, value: "t · 3", w: 56 },
            { id: "r1", kind: "chip", at: { zone: "res", row: 0, col: 0 }, value: "'es'", w: 56, accent: true },
            { id: "n1", kind: "chip", at: { zone: "res", row: 0, col: 1 }, value: "полуинтервал", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 1, out: "es\nt",
          caption: 'Отрицательный индекс — счёт <b>с конца</b>: <code>s[-1]</code> — последний символ. Движок подставляет <code>len(s) + i</code>.',
          nodes: [
            { id: "t0", kind: "chip", at: { zone: "str", row: 0, col: 0 }, value: "T · 0", w: 56, ghost: true },
            { id: "t1", kind: "chip", at: { zone: "str", row: 0, col: 1 }, value: "e · 1", w: 56, ghost: true },
            { id: "t2", kind: "chip", at: { zone: "str", row: 0, col: 2 }, value: "s · 2", w: 56, ghost: true },
            { id: "t3", kind: "chip", at: { zone: "str", row: 0, col: 3 }, value: "t · 3", w: 56, accent: true },
            { id: "m0", kind: "chip", at: { zone: "str", row: 1, col: 0 }, value: "-4", w: 56, ghost: true },
            { id: "m1", kind: "chip", at: { zone: "str", row: 1, col: 1 }, value: "-3", w: 56, ghost: true },
            { id: "m2", kind: "chip", at: { zone: "str", row: 1, col: 2 }, value: "-2", w: 56, ghost: true },
            { id: "m3", kind: "chip", at: { zone: "str", row: 1, col: 3 }, value: "-1", w: 56, accent: true },
            { id: "r2", kind: "chip", at: { zone: "res", row: 0, col: 0 }, value: "'t'", w: 56, accent: true },
            { id: "n2", kind: "chip", at: { zone: "res", row: 0, col: 1 }, value: "счёт с конца", w: 120 },
          ],
          edges: [],
        },
        {
          codeLine: 2, out: "es\nt\ntseT",
          caption: 'Шаг <code>-1</code> идёт справа налево по всей строке: <code>s[::-1]</code> — идиома реверса. Новая строка, исходная не тронута.',
          nodes: [
            { id: "t0", kind: "chip", at: { zone: "str", row: 0, col: 0 }, value: "T · 0", w: 56, accent: true },
            { id: "t1", kind: "chip", at: { zone: "str", row: 0, col: 1 }, value: "e · 1", w: 56, accent: true },
            { id: "t2", kind: "chip", at: { zone: "str", row: 0, col: 2 }, value: "s · 2", w: 56, accent: true },
            { id: "t3", kind: "chip", at: { zone: "str", row: 0, col: 3 }, value: "t · 3", w: 56, accent: true },
            { id: "r3", kind: "chip", at: { zone: "res", row: 0, col: 0 }, value: "'tseT'", w: 72, accent: true },
            { id: "n3", kind: "chip", at: { zone: "res", row: 0, col: 1 }, value: "шаг -1", w: 72 },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "es\nt\ntseT\nTs",
          caption: 'Шаг <code>2</code> берёт каждый второй: индексы 0 и 2 → <code>Ts</code>. Реальный прогон всех четырёх срезов — в консоли.',
          nodes: [
            { id: "t0", kind: "chip", at: { zone: "str", row: 0, col: 0 }, value: "T · 0", w: 56, accent: true },
            { id: "t1", kind: "chip", at: { zone: "str", row: 0, col: 1 }, value: "e · 1", w: 56, ghost: true },
            { id: "t2", kind: "chip", at: { zone: "str", row: 0, col: 2 }, value: "s · 2", w: 56, accent: true },
            { id: "t3", kind: "chip", at: { zone: "str", row: 0, col: 3 }, value: "t · 3", w: 56, ghost: true },
            { id: "r4", kind: "chip", at: { zone: "res", row: 0, col: 0 }, value: "'Ts'", w: 56, accent: true },
            { id: "n4", kind: "chip", at: { zone: "res", row: 0, col: 1 }, value: "шаг 2", w: 56 },
          ],
          edges: [],
        },
      ],
      explain: 'Вся механика — одна формула из таблицы sequence operations: <code>s[i:j:k]</code> — «slice of s from i to j with step k». Отрицательные индексы нормированы правилом «If i or j is negative, the index is relative to the end of sequence s: len(s) + i or len(s) + j is substituted». Срез всегда строит <b>новую</b> строку — исходная неизменяема; и он прощает выход за границы (<code>s[1:100]</code> → <code>est</code>), в отличие от одиночного индекса (<code>s[100]</code> → <code>IndexError</code>, спайк ×2). Хвост ID из лога — <code>s[-4:]</code>, реверс — <code>s[::-1]</code>.',
      sources: ["py-stdtypes"],
    },

    {
      id: "s2", num: "02", kicker: "f-строки · конвейер формата", title: "После двоеточия — спека, не магия",
      viewBox: "0 0 340 260", zones: FMT_ZONES,
      code: ['name = "Alice"', 'print(f"{99.5:.2f}", f"{7:04d}")', 'print(f"{name!r}")', 'print(f"{name=}")'],
      console: true,
      predictAt: 1,
      predictQ: "name = \"Alice\". Конверсия !r зовёт repr. Что напечатает print(f\"{name!r}\") — Alice или 'Alice'?",
      scenes: [
        {
          codeLine: 1, out: "99.50 0007",
          caption: 'После двоеточия — <b>спецификация формата</b>: <code>.2f</code> — два знака после точки, <code>04d</code> — нули до ширины 4.',
          nodes: [
            { id: "v1", kind: "chip", at: { zone: "expr", row: 0, col: 0 }, value: "99.5", w: 56, accent: true },
            { id: "sp1", kind: "chip", at: { zone: "expr", row: 0, col: 1 }, value: ":.2f", w: 56, accent: true },
            { id: "v2", kind: "chip", at: { zone: "expr", row: 0, col: 2 }, value: "7", w: 56 },
            { id: "sp2", kind: "chip", at: { zone: "expr", row: 0, col: 3 }, value: ":04d", w: 56 },
            { id: "o1", kind: "chip", at: { zone: "outz", row: 0, col: 0 }, value: "'99.50'", w: 96, accent: true },
            { id: "o2", kind: "chip", at: { zone: "outz", row: 0, col: 1 }, value: "'0007'", w: 72 },
          ],
          edges: [{ id: "e1", from: "sp1", to: "o1", accent: true }],
        },
        {
          codeLine: 2, out: "99.50 0007\n'Alice'",
          caption: 'Конверсия <code>!r</code> прогоняет значение через <code>repr</code>: в строке видны <span class="hl">кавычки</span> — отладка отличит строку <code>"1"</code> от числа <code>1</code>.',
          nodes: [
            { id: "v3", kind: "chip", at: { zone: "expr", row: 0, col: 0 }, value: "name", w: 56, accent: true },
            { id: "sp3", kind: "chip", at: { zone: "expr", row: 0, col: 1 }, value: "!r", w: 56, accent: true },
            { id: "o3", kind: "chip", at: { zone: "outz", row: 0, col: 0 }, value: "'Alice'", w: 96, accent: true },
            { id: "n5", kind: "chip", at: { zone: "outz", row: 0, col: 1 }, value: "repr · кавычки", w: 144 },
          ],
          edges: [{ id: "e2", from: "sp3", to: "o3", accent: true }],
        },
        {
          codeLine: 3, out: "99.50 0007\n'Alice'\nname='Alice'",
          caption: '<code>{name=}</code> — дебаг-шорткат (3.8+): печатает <b>имя и значение</b> разом. Реальный прогон 3.12 — все три строки в консоли.',
          nodes: [
            { id: "v4", kind: "chip", at: { zone: "expr", row: 0, col: 0 }, value: "{name=}", w: 96, accent: true },
            { id: "o4", kind: "chip", at: { zone: "outz", row: 0, col: 0 }, value: "name='Alice'", w: 120, accent: true },
          ],
          edges: [{ id: "e3", from: "v4", to: "o4", accent: true }],
        },
      ],
      explain: 'f-строка — выражение, не шаблон: «In Python source code, an f-string is a literal string, prefixed with \'f\', which contains expressions inside braces» и «It should be noted that an f-string is really an expression evaluated at run time, not a constant value». Отсюда сила спеков: <code>{метрика:.2f}</code> в отчёте, <code>{счётчик:04d}</code> в именах артефактов, <code>{0.85:.1%}</code> → <code>85.0%</code> (спайк ×2), <code>{x=}</code> — в дебаг-логах. Конверсия <code>!r</code> — тот же <code>repr</code>, что печатает консоль.',
      sources: ["pep-498"],
    },

    {
      id: "s3", num: "03", kicker: "for-else · трик-вопрос", title: "else выполняется, когда break НЕ сработал",
      viewBox: "0 0 340 260", zones: ELSE_ZONES,
      code: ["for x in [1, 2, 3]:", "    if x == 99: break", "else:", '    print("not found")'],
      console: true,
      predictAt: 1,
      predictQ: "Цикл прошёл все три элемента, break ни разу не сработал. Выполнится ли else-ветка?",
      scenes: [
        {
          codeLine: 1, out: "",
          caption: 'Цикл сканирует: каждый <code>x</code> сравнили с 99 — <code>break</code> ни разу не сработал.',
          nodes: [
            { id: "x1", kind: "chip", at: { zone: "iter", row: 0, col: 0 }, value: "1", w: 56, accent: true },
            { id: "x2", kind: "chip", at: { zone: "iter", row: 0, col: 1 }, value: "2", w: 56, accent: true },
            { id: "x3", kind: "chip", at: { zone: "iter", row: 0, col: 2 }, value: "3", w: 56, accent: true },
            { id: "nb", kind: "chip", at: { zone: "iter", row: 1 }, value: "break? нет", w: 96, accent: true },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "not found",
          caption: 'Контракт дословно: «If the loop finishes without executing the <code>break</code>, the <code>else</code> clause executes» — печатается <code>not found</code>.',
          nodes: [
            { id: "x1", kind: "chip", at: { zone: "iter", row: 0, col: 0 }, value: "1", w: 56, ghost: true },
            { id: "x2", kind: "chip", at: { zone: "iter", row: 0, col: 1 }, value: "2", w: 56, ghost: true },
            { id: "x3", kind: "chip", at: { zone: "iter", row: 0, col: 2 }, value: "3", w: 56, ghost: true },
            { id: "ok", kind: "gate", at: { zone: "elsez", row: 0 }, state: "ok", label: "break не было", detail: "else выполняется" },
          ],
          edges: [],
        },
        {
          codeLine: 3, out: "not found",
          caption: 'Тот же контракт — в polling-паттерне <code>wait_for</code> из конспекта: <code>break</code> при успехе, <code>else</code> = «не дождались» → <code>raise TimeoutError</code>.',
          nodes: [
            { id: "ck", kind: "chip", at: { zone: "iter", row: 0, col: 0 }, value: "check · False", w: 120, accent: true },
            { id: "dl", kind: "chip", at: { zone: "iter", row: 0, col: 1 }, value: "deadline", w: 96, accent: true },
            { id: "to", kind: "gate", at: { zone: "elsez", row: 0 }, state: "fail", label: "без break", detail: "TimeoutError" },
          ],
          edges: [],
        },
      ],
      explain: 'Ключ к трик-вопросу — читать <code>else</code> как «no break»: «In a for or while loop the break statement may be paired with an else clause. If the loop finishes without executing the break, the else clause executes». Следствие, на котором ловят дальше: на <b>пустой</b> коллекции else тоже выполнится — цикл завершился, break не было (спайк ×2: <code>else ran</code>). В тестах это каркас поллинга: <code>while time.time() &lt; deadline: … break</code>, а <code>else: raise TimeoutError</code> — честный «не дождались».',
      sources: ["py-tut-flow"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>s = "Test"</code><br/><code>print(s[::-1])</code>, затем <code>print(s[1:3])</code> — что напечатают обе строки?',
      options: ["tseT и es", "tseT и est", "TseT и esт", "Test и es"], correctIndex: 0, xp: 10,
      okText: 'Шаг <code>-1</code> обходит строку справа налево — <code>tseT</code>; полуинтервал <code>[1:3)</code> берёт индексы 1 и 2 — <code>es</code>, тройка исключена.',
      noText: 'Формула среза — <code>s[i:j:k]</code>: «slice of s from i to j with step k», стоп не входит. Реальный вывод python3.12: <code>tseT</code>, затем <code>es</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c1.py", expect: "tseT\nes" },
      sourceRefs: ["py-stdtypes"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>print(f"{99.5:.2f}")</code>, затем <code>print(f"{7:04d}")</code> — что напечатают обе строки?',
      options: ["99.50 и 0007", "99.5 и 7", "99.50 и 7000", "99,50 и 0007"], correctIndex: 0, xp: 10,
      okText: '<code>.2f</code> — фиксированная точка, два знака: <code>99.50</code> (ноль дописан). <code>04d</code> — целое шириной 4, слева нули: <code>0007</code>.',
      noText: 'После двоеточия — спецификация формата: <code>.2f</code> добивает знаки после точки, <code>04d</code> — ширину нулями. Реальный вывод python3.12: <code>99.50</code>, затем <code>0007</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c2.py", expect: "99.50\n0007" },
      sourceRefs: ["pep-498"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>name = "Alice"</code><br/><code>print(f"{name!r}")</code>, затем <code>print(f"{name=}")</code> — что напечатают обе строки?',
      options: ["'Alice' и name='Alice'", "Alice и Alice", "'Alice' и name=Alice", "Alice и name='Alice'"], correctIndex: 0, xp: 10,
      okText: '<code>!r</code> зовёт <code>repr</code> — строка печатается с кавычками; <code>{name=}</code> добавляет имя переменной и тоже показывает repr значения.',
      noText: 'Обе формы — про отладку: <code>!r</code> = repr (кавычки видны), <code>=</code> печатает «имя=значение». Реальный вывод python3.12: <code>\'Alice\'</code>, затем <code>name=\'Alice\'</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c3.py", expect: "'Alice'\nname='Alice'" },
      sourceRefs: ["pep-498"],
    },
    {
      id: "c4", type: "predict-output", engagementLevel: "responding",
      question: '<code>for x in [1, 2, 3]:</code> внутри <code>if x == 99: print("found!"); break</code>, у цикла есть <code>else: print("not found")</code>.<br/>Что напечатает программа?',
      options: ["not found", "ничего", "found!", "not found три раза"], correctIndex: 0, xp: 10,
      okText: '99 в списке нет — <code>break</code> не сработал, а именно это и есть условие else-ветки цикла: печатается <code>not found</code> один раз, после цикла.',
      noText: '«If the loop finishes without executing the break, the else clause executes» — else относится к циклу, не к if, и означает «break не было». Реальный вывод python3.12: <code>not found</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c4.py", expect: "not found" },
      sourceRefs: ["py-tut-flow"],
    },
    {
      id: "c5", type: "predict-output", engagementLevel: "responding",
      question: '<code>print("  Hi  ".strip())</code>, затем <code>print(",".join(["a", "b", "c"]))</code>, затем <code>print("hello".count("l"))</code> — что напечатают три строки?',
      options: ["Hi · a,b,c · 2", "Hi · abc · 2", "  Hi   · a,b,c · 3", "Hi · a, b, c · 2"], correctIndex: 0, xp: 10,
      okText: '<code>strip</code> срезает пробелы с обеих сторон; <code>join</code> зовётся у <b>разделителя</b> и склеивает список; <code>count</code> считает вхождения — в <code>hello</code> две <code>l</code>.',
      noText: 'Ежедневная тройка: <code>strip</code> → <code>Hi</code>, <code>",".join([...])</code> → <code>a,b,c</code> (метод у разделителя!), <code>count("l")</code> → <code>2</code>. Реальный вывод python3.12 — эти три строки.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c5.py", expect: "Hi\na,b,c\n2" },
      sourceRefs: ["py-stdtypes"],
    },
    {
      id: "c6", type: "predict-output", engagementLevel: "responding",
      question: '<code>items = [1, 2, 3]</code><br/><code>if (n := len(items)) > 2: print(n)</code> — что напечатает?',
      options: ["3", "True", "ничего", "SyntaxError"], correctIndex: 0, xp: 10,
      okText: 'Walrus привязал <code>n = 3</code> и <b>вернул</b> 3 в условие: <code>3 > 2</code> — истина, печатается <code>3</code>. Одно выражение — и проверка, и переменная.',
      noText: '«An assignment expression … assigns an expression to an identifier, while also returning the value of the expression» — условие видит 3, ветка печатает уже связанное <code>n</code>. Реальный вывод python3.12: <code>3</code>.',
      verify: { kind: "exec", run: "python3.12 PY.M12_c6.py", expect: "3" },
      sourceRefs: ["py-ref-expr"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Где это в твоих инструментах", v: 'Срезы — хвосты ID и логов (<code>s[-4:]</code>, <code>s[::-1]</code>); f-string спеки — метрики в отчётах (<code>{ms:.2f}</code>), номера артефактов (<code>{i:04d}</code>), дебаг <code>{x=}</code>; <code>while…else</code> — каркас <code>wait_for</code>-поллинга: <code>break</code> при успехе, <code>else</code> → <code>TimeoutError</code>.' },
    { icon: "cost", k: "Строка неизменяема", v: 'Каждый срез и <code>replace</code> — новая строка. «There is also no mutable string type, but str.join() or io.StringIO can be used to efficiently construct strings from multiple fragments» — конкатенация в цикле плодит объекты, собирай через <code>join</code>.' },
    { icon: "avoid", k: "else на цикле", v: 'Не вешай на <code>else</code> логику успеха: он значит ровно «break не сработал» — и выполнится даже на пустой коллекции. Успех обрабатывай до <code>break</code>, провал — в <code>else</code>.' },
  ],

  foot: 'урок · <b>шпаргалка strings+flow</b> · 3 разбора + колода 6 карт · дизайн <b>mid</b>',
};
