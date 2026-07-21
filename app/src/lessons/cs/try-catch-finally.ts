/**
 * Lesson: try / catch / finally / throw (CS.S9.try-catch-finally) — expert density, 5 animated
 * deep-dives. The three try forms (try-catch, try-finally, try-catch-finally); a catch clause names
 * the base type it handles; the runtime checks catch clauses top-to-bottom and at most one runs; a
 * finally block runs whenever control LEAVES the try — normal exit, a jump statement (return/break/
 * continue/goto), OR a propagating exception. The finally guarantee (release resources) is the whole
 * point of try-finally, and the compiler lowers `using` to it.
 *
 * SIGNATURE machine panel (s5): a finally block fires even on an early `return` — control leaving the
 * try via a jump still runs finally FIRST, before the value is returned. REAL run-csharp measurement
 * (this file's exec cards): "try;finally;r=1".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from csharp/language-reference/statements/exception-handling-
 *     statements (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1 "TCF"
 *     (try->catch->finally order, finally runs on exception) · c2 "try;finally;r=1" (finally runs on
 *     early return) · c3 "argnull" (top-to-bottom, first matching catch, at most one runs).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.try-catch-finally/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the three try forms.
const Z_FORMS: Zone[] = [
  { id: "forms", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ТРИ ФОРМЫ try", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "try-catch · try-finally · try-catch-finally", subCls: "vz-zsub", subY: 40 },
];

// s2: catch clause names a base type, matches derived.
const Z_TRY: Zone = { id: "try", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "try { … }", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "тут может бросить", subCls: "vz-zsub heap", subY: 47 };
const Z_CATCH: Zone = { id: "catch", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "catch (BaseType)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "базовый тип, что обрабатываешь", subCls: "vz-zsub good", subY: 47 };
const TRYCATCH_ZONES: Zone[] = [Z_TRY, Z_CATCH];

// s3: several catch clauses, top-to-bottom, at most one runs.
const Z_ORDER: Zone = { id: "order", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "НЕСКОЛЬКО catch · СВЕРХУ ВНИЗ · РОВНО ОДИН", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "runtime checks in the specified order, top to bottom", subCls: "vz-zsub", subY: 40 };
const ORDER_ZONES: Zone[] = [Z_ORDER];

// s4: finally runs whenever control leaves the try.
const Z_LEAVE: Zone = { id: "leave", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "КОНТРОЛЬ ПОКИДАЕТ try", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "3 способа выхода", subCls: "vz-zsub", subY: 47 };
const Z_FIN: Zone = { id: "fin", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "finally ВСЕГДА", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "release resources", subCls: "vz-zsub good", subY: 47 };
const LEAVE_ZONES: Zone[] = [Z_LEAVE, Z_FIN];

// s5 (SIGNATURE): finally beats an early return.
const Z_RET: Zone = { id: "ret", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "try { return 1; }", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "ранний return", subCls: "vz-zsub heap", subY: 47 };
const Z_BEFORE: Zone = { id: "before", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "finally { … } ПЕРЕД возвратом", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "выполняется до отдачи значения", subCls: "vz-zsub good", subY: 47 };
const RETFIN_ZONES: Zone[] = [Z_RET, Z_BEFORE];

export const tryCatchFinally: LessonData = {
  id: "CS.S9.try-catch-finally",
  track: "CS",
  section: "CS.S9",
  module: "S9.2",
  lang: "csharp",
  title: "try / catch / finally: формы и гарантии",
  kicker: "C# вглубь · S9 · операторы обработки",
  home: { subtitle: "три формы try, порядок catch, гарантия finally", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S9.exceptions-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-stmts", kind: "doc", org: "Microsoft Learn", title: "Exception-handling statements - throw, try-catch, try-finally, try-catch-finally", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements", date: "2026-01-16" },
  ],

  spec: [
    { text: "«You can use the try statement in any of the following forms: try-catch… try-finally… and try-catch-finally - as a combination of the preceding two forms.»", source: "ms-stmts" },
    { text: "«In a try-finally statement, the finally block runs when control leaves the try block.» — по нормальному выходу, по jump-оператору (return/break/continue/goto) или по распространению исключения.", source: "ms-stmts" },
  ],
  edgeCases: [
    { text: "Порядок и единственность: «the runtime checks catch clauses in the specified order, from top to bottom. <b>At most, only one catch block runs for any thrown exception</b>».", source: "ms-stmts" },
    { text: "Catch без типа ловит всё и должен быть последним: «A catch clause without any specified exception type matches any exception and, if present, must be the last catch clause».", source: "ms-stmts" },
    { text: "finally после catch: «When a catch block handles an exception, the finally block runs <b>after the catch block finishes</b> (even if another exception occurs during execution of the catch block)».", source: "ms-stmts" },
    { text: "Компилятор превращает <code>using</code> в try-finally: «The compiler transforms a <code>using</code> statement into a try-finally statement».", source: "ms-stmts" },
  ],

  misconceptions: [
    {
      wrong: "finally выполняется только если было исключение; при обычном return он пропускается",
      hook: 'Наоборот: <code>finally</code> — про «контроль <b>покидает</b> <code>try</code>», а не «случилось исключение». «<span class="hl">In a try-finally statement, the finally block runs when control leaves the try block</span>». Способов выхода <b>три</b>: «normal execution», «execution of a jump statement (that is, <code>return</code>, <code>break</code>, <code>continue</code>, or <code>goto</code>)», или «propagation of an exception out of the <code>try</code> block». А <code>catch</code>-ветки проверяются «<span class="hl">in the specified order, from top to bottom</span>» и «<span class="hl">at most, only one catch block runs for any thrown exception</span>». Дальше <b>пять разборов</b>: три формы <code>try</code>, <code>catch</code> по базовому типу, порядок нескольких <code>catch</code>, три способа выхода из <code>try</code>, и <b>машинная панель</b> — <code>finally</code> срабатывает даже при раннем <code>return</code>, до отдачи значения (реальный прогон).',
      source: "ms-stmts",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три формы", title: "try-catch · try-finally · try-catch-finally",
      viewBox: "0 0 340 210", zones: Z_FORMS,
      code: ["try { … } catch (E e) { … }              // обработать ошибку", "try { … } finally { … }                  // гарантировать очистку", "try { … } catch (E e) { … } finally { … } // и то, и другое"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>try-catch</code> — «to handle exceptions that might occur during execution of the code inside a <code>try</code> block». <span class="hl">Ловим</span> и обрабатываем.', nodes: [{ id: "tc", kind: "gate", at: { zone: "forms", row: 0 }, state: "ok", label: "try-catch", detail: "обработка", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>try-finally</code> — «to specify the code that runs when <span class="hl">control leaves the try block</span>». Гарантированная очистка <b>без</b> обработки.', nodes: [{ id: "tc", kind: "gate", at: { zone: "forms", row: 0 }, state: "ok", label: "try-catch", detail: "обработка" }, { id: "tf", kind: "gate", at: { zone: "forms", row: 1 }, state: "ok", label: "try-finally", detail: "очистка", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>try-catch-finally</code> — «a <span class="hl">combination of the preceding two forms</span>»: и поймать, и гарантированно прибраться.', nodes: [{ id: "tc", kind: "gate", at: { zone: "forms", row: 0 }, state: "ok", label: "try-catch", detail: "обработка" }, { id: "tf", kind: "gate", at: { zone: "forms", row: 1 }, state: "ok", label: "try-finally", detail: "очистка" }, { id: "tcf", kind: "gate", at: { zone: "forms", row: 2 }, state: "ok", label: "try-catch-finally", detail: "оба", accent: true }], edges: [] },
      ],
      explain: 'Один оператор <code>try</code>, три формы под три задачи. «You can use the <code>try</code> statement in any of the following forms: <span class="hl">try-catch</span> - to handle exceptions that might occur during execution of the code inside a <code>try</code> block, <span class="hl">try-finally</span> - to specify the code that runs when control leaves the <code>try</code> block, and <span class="hl">try-catch-finally</span> - as a combination of the preceding two forms». Важное различие: <code>catch</code> — про <b>обработку</b> ошибки (решаешь, что делать), <code>finally</code> — про <b>гарантию</b> выполнения кода на выходе (очистка ресурсов). Форма <code>try-finally</code> без <code>catch</code> законна: ты не обрабатываешь исключение (оно летит дальше вверх), но гарантированно закрываешь ресурс. <code>throw</code> и <code>try</code> — базовые операторы модели: «Use the <code>throw</code> statement to throw an exception. Use the <code>try</code> statement to catch and handle exceptions».',
      sources: ["ms-stmts"],
    },
    {
      id: "s2", num: "02", kicker: "catch по типу", title: "catch-ветка называет базовый тип обрабатываемых исключений",
      viewBox: "0 0 340 210", zones: TRYCATCH_ZONES,
      code: ["try { var r = Process(-3, 4); }", "catch (ArgumentException e) { Console.WriteLine($\"Processing failed: {e.Message}\"); }", "// ArgumentNullException (наследник) тоже поймается этим catch"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Код, который может бросить, — <span class="hl">внутри</span> <code>try</code>: «Place the code where an exception might occur inside a <code>try</code> block».', nodes: [{ id: "t", kind: "gate", at: { zone: "try", row: 0 }, state: "fail", label: "Process(-3,4)", detail: "может бросить", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>catch (ArgumentException)</code> называет <span class="hl">базовый тип</span>: «Use a <i>catch clause</i> to specify the base type of exceptions you want to handle».', nodes: [{ id: "t", kind: "gate", at: { zone: "try", row: 0 }, state: "fail", label: "Process", detail: "бросает" }, { id: "c", kind: "gate", at: { zone: "catch", row: 0 }, state: "ok", label: "catch (ArgumentException)", detail: "базовый тип", accent: true }], edges: [{ id: "e1", from: "t", to: "c", accent: true }] },
        { codeLine: 2, out: "", caption: 'Наследник (<code>ArgumentNullException</code>) — <b>тоже</b> подходит: базовый тип ловит всех потомков. Можно опустить переменную и указать только тип.', nodes: [{ id: "t", kind: "gate", at: { zone: "try", row: 0 }, state: "fail", label: "throw", detail: "ArgumentNull" }, { id: "c", kind: "gate", at: { zone: "catch", row: 0 }, state: "ok", label: "catch (ArgumentException)", detail: "матч по базе", accent: true }], edges: [{ id: "e1", from: "t", to: "c" }] },
      ],
      explain: 'Форма <code>try-catch</code> и правило матча по типу. «Use the <code>try-catch</code> statement to handle exceptions that might occur during execution of a code block. <span class="hl">Place the code where an exception might occur inside a try block</span>. Use a <i>catch clause</i> to <span class="hl">specify the base type of exceptions you want to handle</span> in the corresponding <code>catch</code> block». Поскольку <code>catch</code> берёт <b>базовый</b> тип, он ловит и все производные — <code>catch (ArgumentException)</code> поймает <code>ArgumentNullException</code>. «As the preceding example also shows, you can <span class="hl">omit declaration of an exception variable</span> and specify only the exception type in a catch clause» — если сам объект не нужен. Практика: лови самый <b>конкретный</b> тип, который умеешь обработать, чтобы не проглотить чужие ошибки.',
      sources: ["ms-stmts"],
    },
    {
      id: "s3", num: "03", kicker: "Порядок catch", title: "Несколько catch: сверху вниз, ровно один срабатывает",
      viewBox: "0 0 340 276", zones: ORDER_ZONES,
      code: ["try { throw new ArgumentNullException(\"p\"); }", "catch (ArgumentNullException) { s=\"argnull\"; }  // ← первый совпавший", "catch (ArgumentException)     { s=\"arg\"; }      // не дойдёт", "catch (Exception)             { s=\"exc\"; }      // не дойдёт"],
      predictAt: 1, predictQ: 'Брошен <code>ArgumentNullException</code>. Три <code>catch</code> подряд: <code>ArgumentNullException</code> → <code>ArgumentException</code> → <code>Exception</code>. Какой сработает — что в <code>s</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Проверка идёт <span class="hl">сверху вниз</span>: «the runtime checks catch clauses in the specified order, from top to bottom». Первый — <code>ArgumentNullException</code> — совпал.', nodes: [{ id: "c1", kind: "gate", at: { zone: "order", row: 0 }, state: "ok", label: "catch (ArgumentNullException)", detail: "СОВПАЛ", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Остальные <code>catch</code> <b>не выполняются</b>: «<span class="hl">at most, only one catch block runs for any thrown exception</span>» — хотя <code>ArgumentException</code> и <code>Exception</code> тоже подошли бы.', nodes: [{ id: "c1", kind: "gate", at: { zone: "order", row: 0 }, state: "ok", label: "ArgumentNullException", detail: "выполнен" }, { id: "c2", kind: "gate", at: { zone: "order", row: 1 }, state: "fail", label: "ArgumentException", detail: "пропущен", accent: true }, { id: "c3", kind: "gate", at: { zone: "order", row: 2 }, state: "fail", label: "Exception", detail: "пропущен" }], edges: [] },
        { codeLine: 1, out: "argnull", caption: 'Результат — <span class="hl">argnull</span> (реальный прогон): сработал первый совпавший. Порядок веток важен — самые узкие типы ставь выше.', nodes: [{ id: "c1", kind: "gate", at: { zone: "order", row: 0 }, state: "ok", label: "argnull", detail: "первый матч", accent: true }, { id: "c2", kind: "gate", at: { zone: "order", row: 1 }, state: "fail", label: "arg", detail: "skip" }, { id: "c3", kind: "gate", at: { zone: "order", row: 2 }, state: "fail", label: "exc", detail: "skip" }], edges: [] },
      ],
      explain: 'Несколько <code>catch</code> — упорядоченный поиск с ровно одним победителем. «When an exception occurs, the runtime <span class="hl">checks catch clauses in the specified order, from top to bottom</span>. <span class="hl">At most, only one catch block runs for any thrown exception</span>». Поэтому порядок веток — часть логики: узкий <code>ArgumentNullException</code> должен стоять <b>выше</b> широкого <code>ArgumentException</code>, иначе широкий перехватит первым и узкая ветка станет мёртвой. Ветка без типа — универсальная и обязана быть последней: «A catch clause without any specified exception type <span class="hl">matches any exception and, if present, must be the last catch clause</span>». Прогон печатает <code>argnull</code>: совпал первый, остальные пропущены даже будучи совместимыми.',
      sources: ["ms-stmts"],
    },
    {
      id: "s4", num: "04", kicker: "Гарантия finally", title: "finally выполняется, когда контроль покидает try — тремя путями",
      viewBox: "0 0 340 210", zones: LEAVE_ZONES,
      code: ["try { … } finally { Cleanup(); }", "// finally бежит при: нормальном выходе · return/break/continue/goto · исключении", "// поэтому его используют для release resources"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Путь 1 — <b>нормальный</b> выход: тело <code>try</code> отработало без ошибок, контроль уходит дальше → <code>finally</code> бежит.', nodes: [{ id: "n", kind: "gate", at: { zone: "leave", row: 0 }, state: "ok", label: "normal execution", detail: "выход", accent: true }, { id: "f", kind: "gate", at: { zone: "fin", row: 0 }, state: "ok", label: "finally", detail: "бежит" }], edges: [{ id: "e1", from: "n", to: "f", accent: true }] },
        { codeLine: 1, out: "", caption: 'Путь 2 — <span class="hl">jump</span>: «execution of a jump statement (that is, <code>return</code>, <code>break</code>, <code>continue</code>, or <code>goto</code>)». Даже ранний <code>return</code> сперва прогонит <code>finally</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "leave", row: 0 }, state: "ok", label: "normal", detail: "выход" }, { id: "j", kind: "gate", at: { zone: "leave", row: 1 }, state: "ok", label: "return/break/…", detail: "jump", accent: true }, { id: "f", kind: "gate", at: { zone: "fin", row: 0 }, state: "ok", label: "finally", detail: "бежит" }], edges: [{ id: "e2", from: "j", to: "f", accent: true }] },
        { codeLine: 2, out: "", caption: 'Путь 3 — <span class="hl">исключение</span>: «propagation of an exception out of the <code>try</code> block». Отсюда идиома — «to clean up allocated resources used in the <code>try</code> block».', nodes: [{ id: "j", kind: "gate", at: { zone: "leave", row: 0 }, state: "ok", label: "jump", detail: "выход" }, { id: "ex", kind: "gate", at: { zone: "leave", row: 1 }, state: "fail", label: "exception", detail: "propagation", accent: true }, { id: "f", kind: "gate", at: { zone: "fin", row: 0 }, state: "ok", label: "finally", detail: "release", accent: true }], edges: [{ id: "e3", from: "ex", to: "f", accent: true }] },
      ],
      explain: '<code>finally</code> — гарантия про <b>выход из <code>try</code></b>, а не про исключение. «In a <code>try-finally</code> statement, the <span class="hl">finally block runs when control leaves the try block</span>. Control might leave the <code>try</code> block as a result of: <span class="hl">normal execution</span>, execution of a <span class="hl">jump statement (that is, return, break, continue, or goto)</span>, or <span class="hl">propagation of an exception</span> out of the <code>try</code> block». Все три пути ведут через <code>finally</code>, поэтому это правильное место для освобождения ресурсов. Ровно эту гарантию компилятор использует для <code>using</code>: «<span class="hl">The compiler transforms a using statement into a try-finally statement</span>». Единственное исключение — немедленное завершение процесса: «The only cases where <code>finally</code> blocks don\'t execute involve <span class="hl">immediate termination of a program</span>» (например, <code>Environment.FailFast</code>).',
      sources: ["ms-stmts"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · finally vs return", title: "finally бежит даже при раннем return — до отдачи значения",
      viewBox: "0 0 340 210", zones: RETFIN_ZONES,
      code: ["int M(){ try { log(\"try\"); return 1; } finally { log(\"finally\"); } }", "int r = M();", "// порядок: try → finally → значение возвращается. НЕ try → значение → finally"],
      predictAt: 1, predictQ: 'В <code>try</code> стоит <code>return 1;</code>, а рядом <code>finally</code>, логирующий «finally». Что раньше — возврат значения или <code>finally</code>? Что напечатает <code>log</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>try</code> логирует «try» и делает <code>return 1</code>. Это <b>jump</b> — контроль покидает <code>try</code>, но значение <span class="hl">ещё не отдано</span>.', nodes: [{ id: "t", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "try: return 1", detail: "jump из try", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: '<code>finally</code> <span class="hl">перехватывает</span> выход: «the finally block runs when control leaves the try block». Логирует «finally» — <b>до</b> фактического возврата.', nodes: [{ id: "t", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "return 1", detail: "отложен" }, { id: "f", kind: "gate", at: { zone: "before", row: 0 }, state: "ok", label: "finally: log", detail: "ПЕРЕД возвратом", accent: true }], edges: [{ id: "e1", from: "t", to: "f", accent: true }] },
        { codeLine: 1, out: "try;finally;r=1", caption: 'Панель: <span class="hl">try;finally;r=1</span> (реальный прогон) — <code>finally</code> отработал между <code>return</code> и передачей значения. Значение <code>1</code> сохранено и отдано после.', nodes: [{ id: "t", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "try", detail: "1-й" }, { id: "f", kind: "gate", at: { zone: "before", row: 0 }, state: "ok", label: "finally → r=1", detail: "2-й, потом возврат", accent: true }], edges: [{ id: "e1", from: "t", to: "f" }] },
      ],
      explain: 'Машинная панель — <code>finally</code> против раннего <code>return</code>. <code>return</code> входит в список jump-операторов, при которых «the <span class="hl">finally block runs when control leaves the try block</span>»: контроль уже покидает <code>try</code>, но <code>finally</code> выполняется <b>первым</b>, и только потом метод фактически возвращает значение. Реальный прогон печатает <code>try;finally;r=1</code>: сначала тело <code>try</code>, затем <code>finally</code>, и значение <code>1</code> корректно доходит до вызывающего. Это гарантия очистки, которую нельзя обойти обычным <code>return</code> — ресурс закроется даже на «счастливом» пути с ранним выходом. Именно поэтому «You can also use the <code>finally</code> block to <span class="hl">clean up allocated resources</span> used in the <code>try</code> block» и почему <code>using</code> лоуэрится в <code>try-finally</code>.',
      sources: ["ms-stmts"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s=""; try { s+="T"; throw new InvalidOperationException(); } catch (Exception) { s+="C"; } finally { s+="F"; } Console.WriteLine(s);</code> — что напечатает?',
      options: ["TCF", "TC", "TF", "TCFC"], correctIndex: 0, xp: 10,
      okText: '<code>try</code> добавляет T и бросает → <code>catch</code> добавляет C → <code>finally</code> «runs when control leaves the try block» добавляет F. Порядок: <b>TCF</b>.',
      noText: '<code>finally</code> бежит и при исключении (после <code>catch</code>). T (try) → C (catch) → F (finally). Реальный вывод: <b>TCF</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "TCF" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string log=""; int M(){ try { log+="try;"; return 1; } finally { log+="finally;"; } } int r=M(); Console.WriteLine(log+"r="+r);</code> — что напечатает?',
      options: ["try;finally;r=1", "try;r=1", "try;r=1finally;", "finally;try;r=1"], correctIndex: 0, xp: 10,
      okText: '<code>return</code> — jump-оператор: контроль покидает <code>try</code>, но <code>finally</code> «runs when control leaves the try block» отрабатывает <b>до</b> отдачи значения. Затем возвращается 1. Печать: <b>try;finally;r=1</b>.',
      noText: 'Ранний <code>return</code> НЕ пропускает <code>finally</code> — он выполняется между <code>return</code> и передачей значения. Реальный вывод: <b>try;finally;r=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "try;finally;r=1" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s=""; try { throw new ArgumentNullException("p"); } catch (ArgumentNullException) { s="argnull"; } catch (ArgumentException) { s="arg"; } catch (Exception) { s="exc"; } Console.WriteLine(s);</code> — что напечатает?',
      options: ["argnull", "arg", "exc", "argnullargexc"], correctIndex: 0, xp: 10,
      okText: 'Проверка <code>catch</code> «in the specified order, from top to bottom» — первым совпал <code>ArgumentNullException</code>; «<span class="hl">at most, only one catch block runs</span>», остальные пропущены. Печать: <b>argnull</b>.',
      noText: 'Хотя <code>ArgumentException</code> и <code>Exception</code> тоже подошли бы, срабатывает <b>только первый</b> совпавший сверху. Реальный вывод: <b>argnull</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "argnull" }, sourceRefs: ["ms-stmts"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Три формы", v: '«try-catch - to handle exceptions… try-finally - to specify the code that runs when <span class="hl">control leaves the try block</span>… try-catch-finally - as a combination». <code>catch</code> называет <b>базовый</b> тип (ловит наследников).' },
    { icon: "cost", k: "Порядок catch", v: '«runtime checks catch clauses <span class="hl">in the specified order, from top to bottom</span>… <span class="hl">at most, only one catch block runs</span>». Узкие типы — выше; <code>catch</code> без типа — последним (замер: argnull).' },
    { icon: "avoid", k: "Гарантия finally", v: '<code>finally</code> бежит при выходе из <code>try</code> тремя путями: normal · jump (return/break/…) · exception — даже ранний <code>return</code> проходит через него (замер: try;finally;r=1). Отсюда <code>using</code> → try-finally.' },
  ],

  foot: 'урок · <b>try / catch / finally</b> · 5 анимир. разборов · панель finally vs return · дизайн <b>mid</b>',
};
