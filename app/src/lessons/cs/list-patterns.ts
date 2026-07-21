/**
 * Lesson: List patterns & slice (CS.S5.list-patterns) — expert density, closes section S5.
 * A list pattern matches an array/list against a SEQUENCE of nested patterns ([1, 2, 3]);
 * the slice pattern `..` matches zero-or-more elements and there can be AT MOST ONE per
 * list pattern. The senior payoff a level below: a slice can carry a NESTED subpattern
 * (`.. var s`) that BINDS the matched middle, so one pattern both shapes and captures.
 *
 * SIGNATURE machine panel (s5): the slice capture — ['a' or 'A', .. var s, 'a' or 'A']
 * matches "aBBA" and binds the middle to s == "BB", while "apron" fails the shape. REAL
 * run-csharp measurement (this file's exec cards): Message aBBA matches; inner part is BB.
 * / ...doesn't match.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited Learn patterns + is-operator pages
 *     (fetch-verified 2026-07-21);
 *   - every card's verify.expect is REAL stdout from the backend run-csharp endpoint
 *     (this file's exec cards): "True\nFalse\nFalse\nTrue" / "True\nTrue\nTrue\nTrue" /
 *     the slice-capture text.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S5.list-patterns/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: list pattern matches each element positionally.
const Z_SEQ: Zone = { id: "seq", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ПОСЛЕДОВАТЕЛЬНОСТЬ · [1, 2, 3]", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "каждый элемент → свой паттерн", subCls: "vz-zsub", subY: 47 };
const SEQ_ZONES: Zone[] = [Z_SEQ];

// s2: discard / var inside a list.
const Z_LST: Zone = { id: "lst", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СПИСОК", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "[1, 2, 3]", subCls: "vz-zsub", subY: 47 };
const Z_ELT: Zone = { id: "elt", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "[var first, _, _]", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "captured / skipped", subCls: "vz-zsub heap", subY: 47 };
const ELT_ZONES: Zone[] = [Z_LST, Z_ELT];

// s3: slice pattern .. at start/end.
const Z_ARR: Zone = { id: "arr", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "SLICE .. · НОЛЬ ИЛИ БОЛЬШЕ", labelCls: "vz-zlabel sm", lx: 170, ly: 24, sub: "матчит начало/конец, середину пропускает", subCls: "vz-zsub", subY: 47 };
const ARR_ZONES: Zone[] = [Z_ARR];

// s4: at most one slice.
const Z_ONE: Zone = { id: "onez", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОДИН slice · OK", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "[.., 2, 4]", subCls: "vz-zsub good", subY: 47 };
const Z_TWO: Zone = { id: "twoz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДВА slice · НЕЛЬЗЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "[.., 2, ..]", subCls: "vz-zsub heap", subY: 47 };
const ONE_ZONES: Zone[] = [Z_ONE, Z_TWO];

// s5 (SIGNATURE): slice with a nested subpattern captures the middle.
const Z_SHAPE: Zone = { id: "shape", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "['a' or 'A', .. var s, 'a' or 'A']", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_CAP: Zone = { id: "cap", x: 14, y: 130, w: 312, h: 100, cls: "vz-zone good", label: "SLICE ЗАХВАТЫВАЕТ СЕРЕДИНУ → s", labelCls: "vz-zlabel good sm", lx: 130, ly: 120 };
const CAP_ZONES: Zone[] = [Z_SHAPE, Z_CAP];

export const listPatterns: LessonData = {
  id: "CS.S5.list-patterns",
  track: "CS",
  section: "CS.S5",
  module: "S5.7",
  lang: "csharp",
  title: "List patterns и slice",
  kicker: "C# вглубь · S5 · форма последовательности",
  home: { subtitle: "[..], discard/var в списке, slice .., один slice", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-patterns", kind: "doc", org: "Microsoft Learn", title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns", date: "2026-06-05" },
    { id: "ms-is", kind: "doc", org: "Microsoft Learn", title: "The is operator (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/is", date: "2026-01-20" },
  ],

  spec: [
    { text: "«a list pattern matches when each nested pattern matches the corresponding element of an input sequence.»", source: "ms-patterns" },
    { text: "«A slice pattern matches zero or more elements. You can use at most one slice pattern in a list pattern. The slice pattern can only appear in a list pattern.»", source: "ms-patterns" },
  ],
  edgeCases: [
    { text: "Внутри списка любой паттерн: <code>[0 or 1, &lt;= 2, &gt;= 3]</code>. Пропустить элемент — discard <code>_</code>, захватить — <code>var</code>.", source: "ms-patterns" },
    { text: "List-паттерны — исключение из проверки полноты: switch по ним <span class=\"hl\">не даёт warning</span>, если не все входы покрыты.", source: "ms-patterns" },
    { text: "Slice может нести <b>вложенный субпаттерн</b>: <code>[&lt; 0, .. { Length: 2 or 4 }, &gt; 0]</code> — ограничение на длину среза.", source: "ms-patterns" },
  ],

  misconceptions: [
    {
      wrong: "list pattern — это просто сравнение массива с массивом по значениям",
      hook: 'List pattern матчит <b>форму</b>, а не значения: «a list pattern matches when <span class="hl">each nested pattern matches</span> the corresponding element of an input sequence» — внутри каждой позиции может стоять любой паттерн (relational, or, var, discard). Отдельная сила — <b>slice</b> <code>..</code>: «A slice pattern matches <span class="hl">zero or more elements</span>. You can use <b>at most one</b> slice pattern in a list pattern». А ниже абстракции — slice умеет <b>захватывать</b>: <code>.. var s</code> связывает середину. Дальше <b>пять разборов</b> — форма списка, discard/var, slice, «один slice» и <b>машинная панель</b> захвата среза.',
      source: "ms-patterns",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Форма списка · по элементам", title: "[1, 2, 3] матчит каждый элемент своим паттерном",
      viewBox: "0 0 340 210", zones: SEQ_ZONES,
      code: ["int[] numbers = { 1, 2, 3 };", "numbers is [1, 2, 3]       // True", "numbers is [1, 2, 3, 4]    // False (длина)", "numbers is [0 or 1, <= 2, >= 3]  // True"],
      predictAt: 1, predictQ: 'Что даст <code>numbers is [1, 2, 3, 4]</code> для массива из 3 элементов?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>[1, 2, 3]</code>: три constant-паттерна по позициям. Массив <code>{1,2,3}</code> совпадает поэлементно → <span class="hl">True</span>.', nodes: [{ id: "e1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "[0]=1 ✓" }, { id: "e2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "[1]=2 ✓" }, { id: "e3", kind: "chip", at: { zone: "seq", row: 0, col: 2 }, value: "[2]=3 ✓", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>[1, 2, 3, 4]</code>: паттерн ждёт <b>4</b> элемента, массив — 3. Длина не сошлась → <span class="hl">False</span>.', nodes: [{ id: "e1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "нужно 4" }, { id: "len", kind: "gate", at: { zone: "seq", row: 1 }, state: "fail", label: "длина 3 ≠ 4", detail: "False", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>[0 or 1, &lt;= 2, &gt;= 3]</code>: внутри — <b>любые паттерны</b>. <code>1</code>∈{0,1}, <code>2</code>≤2, <code>3</code>≥3 → <span class="hl">True</span>. Форма, а не значения.', nodes: [{ id: "e1", kind: "chip", at: { zone: "seq", row: 0, col: 0 }, value: "0 or 1 ✓" }, { id: "e2", kind: "chip", at: { zone: "seq", row: 0, col: 1 }, value: "<= 2 ✓" }, { id: "e3", kind: "chip", at: { zone: "seq", row: 0, col: 2 }, value: ">= 3 ✓", accent: true }], edges: [] },
      ],
      explain: 'List pattern сопоставляет последовательность с набором вложенных паттернов: «You can match an array or a list against a <b>sequence of patterns</b>… a list pattern matches when <span class="hl">each nested pattern matches the corresponding element</span> of an input sequence». Длина учитывается — <code>[1, 2, 3, 4]</code> не совпадёт с трёхэлементным массивом. И внутри позиции — любой паттерн: «You can use <b>any pattern within a list pattern</b>», поэтому <code>[0 or 1, &lt;= 2, &gt;= 3]</code> проверяет форму, а не конкретные числа. Прогон: <code>True / False / False / True</code>.',
      sources: ["ms-patterns"],
    },
    {
      id: "s2", num: "02", kicker: "discard / var в списке", title: "[var first, _, _] — захватить один, пропустить остальные",
      viewBox: "0 0 340 210", zones: ELT_ZONES,
      code: ["List<int> numbers = new() { 1, 2, 3 };", "if (numbers is [var first, _, _])", "  WriteLine(first);   // 1"],
      scenes: [
        { codeLine: 0, caption: 'Список из трёх. Хотим <b>только первый</b> элемент, форму — «ровно три».', nodes: [{ id: "l", kind: "obj", at: { zone: "lst", row: 0 }, typeTag: "numbers", value: "[1,2,3]", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>[var first, _, _]</code>: <code>var</code> <span class="hl">захватывает</span> первый, два <code>_</code> — «любой элемент, но пропустить».', nodes: [{ id: "l", kind: "obj", at: { zone: "lst", row: 0 }, typeTag: "numbers", value: "[1,2,3]" }, { id: "f", kind: "slot", at: { zone: "elt", row: 0 }, name: "first", value: "1", accent: true }, { id: "sk", kind: "chip", at: { zone: "elt", row: 1 }, value: "_ , _ пропущены" }], edges: [{ id: "e", from: "l", to: "f", accent: true }] },
        { codeLine: 2, caption: 'Форма «три элемента» задана числом позиций; <code>first == 1</code>. Discard матчит любой элемент, но не связывает.', nodes: [{ id: "l", kind: "obj", at: { zone: "lst", row: 0 }, typeTag: "numbers", value: "[1,2,3]" }, { id: "f", kind: "slot", at: { zone: "elt", row: 0 }, name: "first", value: "1" }, { id: "out", kind: "chip", at: { zone: "elt", row: 1 }, value: "→ 1", accent: true }], edges: [{ id: "e", from: "l", to: "f" }] },
      ],
      explain: 'Внутри списка работают те же «универсальные» паттерны: «To match any element, use the <b>discard pattern</b> or, if you also want to <b>capture the element</b>, use the <b>var pattern</b>». Так <code>[var first, _, _]</code> означает «ровно три элемента; захвати первый, остальные пропусти». <code>_</code> матчит любой элемент, но ничего не связывает; <code>var</code> — матчит и связывает. Число позиций фиксирует длину, а не значения. Отсюда идиома «достать голову списка известной длины».',
      sources: ["ms-patterns"],
    },
    {
      id: "s3", num: "03", kicker: "Slice .. · начало и конец", title: "[> 0, > 0, ..] и [.., > 0, > 0] — матч по краям",
      viewBox: "0 0 340 210", zones: ARR_ZONES,
      code: ["new[] { 1,2,3,4,5 } is [> 0, > 0, ..]   // True", "new[] { 1,2,3,4 }   is [.., > 0, > 0]   // True", "new[] { 2,4 }       is [.., 2, 4]       // True"],
      console: true,
      scenes: [
        { codeLine: 0, out: "True", caption: '<code>[&gt; 0, &gt; 0, ..]</code>: два элемента в <b>начале</b>, затем slice <code>..</code> — «остальное, ноль или больше». Первые два &gt;0 → <span class="hl">True</span>.', nodes: [{ id: "h1", kind: "gate", at: { zone: "arr", row: 0, col: 0 }, state: "ok", label: "[0]>0", detail: "1 ✓" }, { id: "h2", kind: "gate", at: { zone: "arr", row: 0, col: 1 }, state: "ok", label: "[1]>0", detail: "2 ✓" }, { id: "sl", kind: "chip", at: { zone: "arr", row: 0, col: 2 }, value: "..", accent: true }], edges: [] },
        { codeLine: 1, out: "True", caption: '<code>[.., &gt; 0, &gt; 0]</code>: slice в <b>начале</b>, два элемента в конце. Последние два &gt;0 → <span class="hl">True</span>.', nodes: [{ id: "sl", kind: "chip", at: { zone: "arr", row: 0, col: 0 }, value: ".." }, { id: "t1", kind: "gate", at: { zone: "arr", row: 0, col: 1 }, state: "ok", label: "[-2]>0", detail: "3 ✓" }, { id: "t2", kind: "gate", at: { zone: "arr", row: 0, col: 2 }, state: "ok", label: "[-1]>0", detail: "4 ✓", accent: true }], edges: [] },
        { codeLine: 2, out: "True", caption: '<code>[.., 2, 4]</code> на <code>{2,4}</code>: slice матчит <b>ноль</b> элементов, затем <code>2, 4</code>. Ноль-или-больше → <span class="hl">True</span>.', nodes: [{ id: "sl", kind: "chip", at: { zone: "arr", row: 0, col: 0 }, value: ".. = 0 элем", accent: true }, { id: "t1", kind: "gate", at: { zone: "arr", row: 0, col: 1 }, state: "ok", label: "2", detail: "✓" }, { id: "t2", kind: "gate", at: { zone: "arr", row: 0, col: 2 }, state: "ok", label: "4", detail: "✓" }], edges: [] },
      ],
      explain: 'Slice pattern даёт гибкую форму: «To match elements only at the start or end - or both - of an input sequence, use the <b>slice pattern</b> <code>..</code>». Ключевое свойство: «A slice pattern matches <span class="hl">zero or more elements</span>». Поэтому <code>[&gt; 0, &gt; 0, ..]</code> фиксирует начало, <code>[.., &gt; 0, &gt; 0]</code> — конец, а <code>[.., 2, 4]</code> на <code>{2,4}</code> истинно, потому что slice может съесть <b>ноль</b> элементов. Прогон подтверждает все три: <code>True / True / True</code>. Slice — не «хотя бы один», а «сколько угодно, включая ноль».',
      sources: ["ms-patterns"],
    },
    {
      id: "s4", num: "04", kicker: "Один slice на паттерн", title: "Не больше одного .. и только внутри list pattern",
      viewBox: "0 0 340 210", zones: ONE_ZONES,
      code: ["[.., 2, 4]        // ok: один slice", "[>= 0, .., 2 or 4]  // ok: один slice", "// [.., 2, ..]     // нельзя: два slice"],
      scenes: [
        { codeLine: 0, caption: 'Один <code>..</code> — легально: он делит список на «край — slice — край». Здесь slice в начале.', nodes: [{ id: "ok", kind: "gate", at: { zone: "onez", row: 0 }, state: "ok", label: "[.., 2, 4]", detail: "один ..", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>[&gt;= 0, .., 2 or 4]</code> — тоже один slice, между началом и концом. Тоже <span class="hl">ok</span>.', nodes: [{ id: "ok", kind: "gate", at: { zone: "onez", row: 0 }, state: "ok", label: "[.., 2, 4]", detail: "один .." }, { id: "ok2", kind: "gate", at: { zone: "onez", row: 1 }, state: "ok", label: "[>=0, .., 2or4]", detail: "один ..", accent: true }], edges: [] },
        { codeLine: 2, caption: '<b>Два</b> slice — нельзя: «at most one slice pattern». Иначе позиция среза неоднозначна. И <code>..</code> живёт только в list pattern.', nodes: [{ id: "ok", kind: "gate", at: { zone: "onez", row: 0 }, state: "ok", label: "один ..", detail: "ok" }, { id: "no", kind: "gate", at: { zone: "twoz", row: 0 }, state: "fail", label: "[.., 2, ..]", detail: "два — ошибка", accent: true }], edges: [] },
      ],
      explain: 'У slice — жёсткие ограничения: «A slice pattern matches zero or more elements. You can use <b>at most one slice pattern</b> in a list pattern. The slice pattern <span class="hl">can only appear in a list pattern</span>». Два <code>..</code> запрещены — иначе непонятно, куда отнести элементы между ними (позиция среза стала бы неоднозначной). И <code>..</code> не паттерн общего назначения: вне <code>[ ]</code> его использовать нельзя. Один slice + фиксированные края — вот полный контракт формы.',
      sources: ["ms-patterns"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · slice захватывает середину", title: "['a'|'A', .. var s, 'a'|'A'] — форма И захват среза",
      viewBox: "0 0 340 238", zones: CAP_ZONES,
      code: ["message is ['a' or 'A', .. var s, 'a' or 'A']", "  ? $\"matches; inner part is {s}.\"", "  : \"doesn't match.\"", "MatchMessage(\"aBBA\"); MatchMessage(\"apron\");"],
      predictAt: 1, predictQ: 'Что захватит <code>var s</code> для строки <code>"aBBA"</code>?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Паттерн: первый и последний символ — <code>\'a\' or \'A\'</code>, а между ними slice <code>.. var s</code> — <span class="hl">захватывает середину</span>.', nodes: [{ id: "sh", kind: "gate", at: { zone: "shape", row: 0 }, state: "ok", label: "['a'|'A', .. var s, 'a'|'A']", detail: "форма + захват", accent: true }], edges: [] },
        { codeLine: 3, out: "Message aBBA matches; inner part is BB.", caption: '<code>"aBBA"</code>: края — <code>a</code> и <code>A</code> ✓; slice <code>.. var s</code> связывает середину → <code>s == "BB"</code>. Матч (реальный прогон).', nodes: [{ id: "sh", kind: "gate", at: { zone: "shape", row: 0 }, state: "ok", label: "aBBA", detail: "края a/A ✓" }, { id: "cap", kind: "slot", at: { zone: "cap", row: 0 }, name: "s", value: "\"BB\"", accent: true }], edges: [{ id: "e", from: "sh", to: "cap", accent: true }] },
        { codeLine: 3, out: "Message aBBA matches; inner part is BB.\nMessage apron doesn't match.", caption: '<code>"apron"</code>: последний символ <code>n</code> не <code>\'a\'/\'A\'</code> → форма не совпала → <span class="hl">doesn\'t match</span>. Один паттерн и проверил форму, и захватил срез.', nodes: [{ id: "sh", kind: "gate", at: { zone: "shape", row: 0 }, state: "fail", label: "apron", detail: "конец 'n' ✗" }, { id: "no", kind: "chip", at: { zone: "cap", row: 0 }, value: "doesn't match", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — slice с захватом, снятая прогоном. Дока: «You can also <b>nest a subpattern within a slice pattern</b>», пример — <code>message is [\'a\' or \'A\', .. var s, \'a\' or \'A\']</code>, где <code>MatchMessage("aBBA")</code> даёт «Message aBBA matches; inner part is <b>BB</b>.», а <code>MatchMessage("apron")</code> — «Message apron <span class="hl">doesn\'t match</span>.». То есть один list pattern одновременно (1) проверяет <b>форму</b> — первый/последний символ буква <code>a/A</code>, (2) через <code>.. var s</code> <b>связывает</b> середину в переменную. Slice — не только пропуск, но и захват произвольно длинного среза. Так S5 замыкается: паттерны сопоставляют не значения, а форму данных, попутно доставая нужное.',
      sources: ["ms-patterns", "ms-is"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int[] numbers = { 1, 2, 3 };</code><br/><code>WriteLine(numbers is [1, 2, 3]); WriteLine(numbers is [1, 2, 4]); WriteLine(numbers is [1, 2, 3, 4]); WriteLine(numbers is [0 or 1, &lt;= 2, &gt;= 3]);</code> — четыре строки?',
      options: ["True\\nFalse\\nFalse\\nTrue", "True\\nFalse\\nTrue\\nTrue", "True\\nTrue\\nFalse\\nTrue", "True\\nFalse\\nFalse\\nFalse"], correctIndex: 0, xp: 10,
      okText: '<code>[1,2,3]</code> совпал → True. <code>[1,2,4]</code>: <code>4≠3</code> → False. <code>[1,2,3,4]</code>: длина 3≠4 → False. <code>[0 or 1, &lt;=2, &gt;=3]</code>: форма подходит → <b>True</b>.',
      noText: 'List pattern сверяет каждый элемент И длину. Точное совпадение и корректная форma дают True; неверное значение или длина — False. Итог: <code>True / False / False / True</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nFalse\nFalse\nTrue" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>WriteLine(new[]{1,2,3,4,5} is [&gt; 0, &gt; 0, ..]); WriteLine(new[]{1,2,3,4} is [.., &gt; 0, &gt; 0]); WriteLine(new[]{2,4} is [.., 2, 4]); WriteLine(new[]{1,2,3,4} is [&gt;= 0, .., 2 or 4]);</code> — четыре строки?',
      options: ["True\\nTrue\\nTrue\\nTrue", "True\\nTrue\\nFalse\\nTrue", "False\\nTrue\\nTrue\\nTrue", "True\\nFalse\\nTrue\\nFalse"], correctIndex: 0, xp: 10,
      okText: 'Slice <code>..</code> матчит <b>ноль или больше</b>. Первые два &gt;0 → True. Последние два &gt;0 → True. <code>[.., 2, 4]</code> на <code>{2,4}</code>: slice = 0 элементов → True. <code>[&gt;=0, .., 2 or 4]</code> → True.',
      noText: 'Ключ — slice ест ноль-или-больше, поэтому даже <code>[.., 2, 4]</code> на массиве ровно из <code>{2,4}</code> истинно. Все четыре → <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nTrue\nTrue\nTrue" }, sourceRefs: ["ms-patterns"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>void MatchMessage(string m) { var r = m is [\'a\' or \'A\', .. var s, \'a\' or \'A\'] ? $"Message {m} matches; inner part is {s}." : $"Message {m} doesn\'t match."; WriteLine(r); }</code><br/><code>MatchMessage("aBBA"); MatchMessage("apron");</code> — обе строки?',
      options: ["Message aBBA matches; inner part is BB.\\nMessage apron doesn't match.", "Message aBBA matches; inner part is BBA.\\nMessage apron matches; inner part is pro.", "Message aBBA doesn't match.\\nMessage apron doesn't match.", "Message aBBA matches; inner part is aBB.\\nMessage apron doesn't match."], correctIndex: 0, xp: 10,
      okText: 'Slice <code>.. var s</code> <b>захватывает</b> середину. <code>"aBBA"</code>: края a/A ✓, <code>s == "BB"</code> → matches. <code>"apron"</code>: конец <code>n</code> ≠ a/A → форма не совпала → <b>doesn\'t match</b>.',
      noText: 'Один list pattern проверяет форму (первый/последний символ) И связывает середину. <code>"aBBA"</code> → inner <b>BB</b>; <code>"apron"</code> — конец не буква a/A → не совпало.',
      verify: { kind: "exec", run: "dotnet run", expect: "Message aBBA matches; inner part is BB.\nMessage apron doesn't match." }, sourceRefs: ["ms-patterns", "ms-is"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Форма, не значения", v: 'List pattern <code>[p0, p1, …]</code> матчит, когда <b>каждый вложенный паттерн</b> совпал с элементом на своей позиции, а число позиций фиксирует длину. Внутри — <span class="hl">любой паттерн</span>.' },
    { icon: "cost", k: "Slice ..", v: 'Slice <code>..</code> матчит <b>ноль или больше</b> элементов; <span class="hl">не больше одного</span> на список и только внутри <code>[ ]</code>. С вложенным <code>.. var s</code> — захватывает срез в переменную.' },
    { icon: "avoid", k: "Без warning полноты", v: 'Switch по list-паттернам — <b>исключение</b>: не даёт warning об непокрытых входах. Здесь discard <code>_</code>-рукав особенно важен, чтобы не поймать <code>SwitchExpressionException</code>.' },
  ],

  foot: 'урок · <b>list patterns и slice</b> · 5 анимир. разборов · панель захвата среза (inner part is BB) · дизайн <b>mid</b>',
};
