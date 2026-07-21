/**
 * Lesson: Best practices for exceptions (CS.S9.exception-best-practices) — expert density, 5 animated
 * deep-dives. What to catch: order catches most-derived to least; don't catch what you can't recover
 * from. Avoid exceptions on the hot path: check common conditions up front, or call Try* methods
 * (TryParse returns bool + out, no throw). Restore state on failure (roll back side effects and
 * rethrow with throw;). Throw the most-specific PREDEFINED type; use exception builder / static throw
 * helpers (ArgumentNullException.ThrowIfNull); don't throw in finally; the user message comes from
 * Message.
 *
 * SIGNATURE machine panel (s5): the anti-crash discipline — a failed deposit rolls back the withdrawal
 * and rethrows, so no partial side effect survives. REAL run-csharp measurement (this file's exec
 * cards): "rolledback from=100 to=0" (the withdrawal is reversed; balances are restored).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from standard/exceptions/best-practices-for-exceptions
 *     (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1 "ok=False v=0"
 *     (TryParse of an overflowing value: no throw, returns false) · c2 "rolledback from=100 to=0"
 *     (restore state: failed deposit rolls back withdrawal) · c3 "ArgumentNullException:arg" (the
 *     ThrowIfNull builder helper throws the right type with the paramName).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.exception-best-practices/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what to catch — order most-derived to least, don't catch what you can't recover.
const Z_CAN: Zone = { id: "can", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "МОГУ восстановиться", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "лови · конкретный тип", subCls: "vz-zsub good", subY: 47 };
const Z_CANT: Zone = { id: "cant", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕ могу", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "не лови · пусти выше", subCls: "vz-zsub heap", subY: 47 };
const CATCH_ZONES: Zone[] = [Z_CAN, Z_CANT];

// s2: avoid on hot path — check first, or Try*.
const Z_CHECK: Zone = { id: "check", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "проверить заранее", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "if (state != …)", subCls: "vz-zsub good", subY: 47 };
const Z_TRY: Zone = { id: "try", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Try* методы", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "TryParse → bool + out", subCls: "vz-zsub good", subY: 47 };
const AVOID_ZONES: Zone[] = [Z_CHECK, Z_TRY];

// s3: throw the most-specific predefined; builder helpers; don't throw in finally.
const Z_THROWBP: Zone = { id: "throwbp", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "КАК БРОСАТЬ ПРАВИЛЬНО", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "predefined · builder helpers · не в finally", subCls: "vz-zsub", subY: 40 };
const THROWBP_ZONES: Zone[] = [Z_THROWBP];

// s4: capture & rethrow — throw; in handler, ExceptionDispatchInfo elsewhere.
const Z_INHANDLER: Zone = { id: "inhandler", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "в catch", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "throw;", subCls: "vz-zsub good", subY: 47 };
const Z_ELSEWHERE: Zone = { id: "elsewhere", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "вне catch", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ExceptionDispatchInfo", subCls: "vz-zsub good", subY: 47 };
const CAPTURE_ZONES: Zone[] = [Z_INHANDLER, Z_ELSEWHERE];

// s5 (SIGNATURE): restore state on failure.
const Z_STATE: Zone = { id: "state", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "БЕЗ ПОБОЧНЫХ ЭФФЕКТОВ ПРИ ИСКЛЮЧЕНИИ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "deposit упал → withdrawal откатан", subCls: "vz-zsub", subY: 40 };
const RESTORE_ZONES: Zone[] = [Z_STATE];

export const exceptionBestPractices: LessonData = {
  id: "CS.S9.exception-best-practices",
  track: "CS",
  section: "CS.S9",
  module: "S9.6",
  lang: "csharp",
  title: "Практики исключений: что бросать и ловить",
  kicker: "C# вглубь · S9 · дисциплина ошибок",
  home: { subtitle: "что ловить, Try* вместо throw, восстановление состояния, builder-хелперы", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S9.throw-vs-rethrow"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-best", kind: "doc", org: "Microsoft Learn", title: "Best practices for exceptions", url: "https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions", date: "2025-10-22" },
  ],

  spec: [
    { text: "«In catch blocks, always order exceptions from the most derived to the least derived.» — и «When your code can't recover from an exception, don't catch that exception».", source: "ms-best" },
    { text: "«Introduce a new exception class only when a predefined one doesn't apply.» — бросай самый конкретный ПРЕДОПРЕДЕЛЁННЫЙ тип.", source: "ms-best" },
  ],
  edgeCases: [
    { text: "Try* вместо throw: «<code>Int32.TryParse</code> doesn't throw this exception. Instead, it <b>returns a Boolean and has an <code>out</code> parameter</b> that contains the parsed valid integer upon success».", source: "ms-best" },
    { text: "Восстанавливай состояние: «Callers should be able to <b>assume that there are no side effects when an exception is thrown</b> from a method» — откати частичные изменения и переброс через <code>throw;</code>.", source: "ms-best" },
    { text: "Не бросай в finally: «<b>Don't raise exceptions in <code>finally</code> clauses</b>». И не из <code>Equals</code>/<code>GetHashCode</code>/<code>ToString</code>/статических конструкторов.", source: "ms-best" },
    { text: "Сообщение — из <code>Message</code>: «The error message the user sees is <b>derived from the <code>Exception.Message</code> property</b> of the exception that was thrown, and not from the name of the exception class».", source: "ms-best" },
  ],

  misconceptions: [
    {
      wrong: "лови всё через catch(Exception), бросай new Exception(...) — «главное не уронить приложение»",
      hook: 'Устойчивость — не «поймать всё», а <b>дисциплина</b>. «a <span class="hl">crashed app is more reliable and diagnosable than an app with undefined behavior</span>»: «<span class="hl">When your code can\'t recover from an exception, don\'t catch that exception</span>. Enable methods further up the call stack to recover if possible». А в <code>catch</code>-блоках — «<span class="hl">always order exceptions from the most derived to the least derived</span>». На горячем пути — избегай исключения вовсе: «<code>Int32.TryParse</code> <span class="hl">doesn\'t throw this exception. Instead, it returns a Boolean and has an out parameter</span>». Бросай осмысленно: «<span class="hl">Introduce a new exception class only when a predefined one doesn\'t apply</span>». Дальше <b>пять разборов</b>: что ловить, Try* вместо throw, как бросать (predefined/builder/не в finally), захват-и-переброс, и <b>машинная панель</b> — восстановление состояния: упавший deposit откатывает withdrawal (реальный прогон).',
      source: "ms-best",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что ловить", title: "Лови конкретное, что можешь восстановить; порядок most→least derived",
      viewBox: "0 0 340 210", zones: CATCH_ZONES,
      code: ["try { … }", "catch (SqlException ex) { retry(); }        // могу восстановиться — ловлю конкретно", "// StackOverflow/OutOfMemory — восстановиться нельзя → НЕ ловлю"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Лови там, где реально можешь восстановиться, и <b>конкретный</b> тип. «<span class="hl">In catch blocks, always order exceptions from the most derived to the least derived</span>».', nodes: [{ id: "c", kind: "gate", at: { zone: "can", row: 0 }, state: "ok", label: "catch (конкретное)", detail: "recover", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Не можешь исправить — <span class="hl">не лови</span>: «When your code can\'t recover from an exception, <code>don\'t catch that exception</code>. Enable methods further up the call stack to recover».', nodes: [{ id: "c", kind: "gate", at: { zone: "can", row: 0 }, state: "ok", label: "могу", detail: "лови" }, { id: "n", kind: "gate", at: { zone: "cant", row: 0 }, state: "fail", label: "не могу", detail: "пусти выше", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: 'Ресурсы — через <code>using</code>/<code>finally</code>: «Prefer <code>using</code> statements… Code in a <code>finally</code> clause is <span class="hl">almost always executed even when exceptions are thrown</span>».', nodes: [{ id: "c", kind: "gate", at: { zone: "can", row: 0 }, state: "ok", label: "using/finally", detail: "release", accent: true }, { id: "n", kind: "gate", at: { zone: "cant", row: 0 }, state: "fail", label: "не лови лишнее", detail: "выше" }], edges: [] },
      ],
      explain: 'Философия раздела: «Proper exception handling is essential for application reliability… <span class="hl">a crashed app is more reliable and diagnosable than an app with undefined behavior</span>». Отсюда — не глотать всё подряд. «For code that can potentially generate an exception, and <span class="hl">when your app can recover from that exception</span>, use <code>try</code>/<code>catch</code> blocks». Порядок веток: «<span class="hl">always order exceptions from the most derived to the least derived</span>… More derived exceptions aren\'t handled by a <code>catch</code> clause that\'s preceded by a <code>catch</code> clause for a base exception class». И явное: «<span class="hl">When your code can\'t recover from an exception, don\'t catch that exception</span>». Очистку веди через ресурсные конструкции: «Clean up resources that are allocated with either <code>using</code> statements or <code>finally</code> blocks. <span class="hl">Prefer using statements</span>».',
      sources: ["ms-best"],
    },
    {
      id: "s2", num: "02", kicker: "Избегай на hot path", title: "Проверь условие заранее или зови Try* — без исключения",
      viewBox: "0 0 340 210", zones: AVOID_ZONES,
      code: ["if (conn.State != ConnectionState.Closed) conn.Close();  // проверка вместо throw", "bool ok = int.TryParse(s, out int v);   // Try* → bool + out, без броска", "// исключения — для РЕДКИХ (истинно исключительных) событий"],
      predictAt: 1, predictQ: '<code>int.TryParse("999999999999999", out int v)</code> — значение переполняет <code>Int32</code>. Что напечатает <code>$"ok={ok} v={v}"</code>? Бросит ли?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Частое условие — <span class="hl">проверь заранее</span>, не лови: «You can avoid that by using an <code>if</code> statement to check the connection state before trying to close it».', nodes: [{ id: "ch", kind: "gate", at: { zone: "check", row: 0 }, state: "ok", label: "if (state != Closed)", detail: "без throw", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>TryParse</code> — Try*-паттерн: «<span class="hl">doesn\'t throw this exception. Instead, it returns a Boolean and has an out parameter</span> that contains the parsed valid integer upon success».', nodes: [{ id: "ch", kind: "gate", at: { zone: "check", row: 0 }, state: "ok", label: "проверка", detail: "заранее" }, { id: "t", kind: "gate", at: { zone: "try", row: 0 }, state: "ok", label: "TryParse", detail: "bool + out", accent: true }], edges: [] },
        { codeLine: 1, out: "ok=False v=0", caption: 'Переполнение → <code>TryParse</code> вернул <span class="hl">false</span>, <code>v=0</code>, <b>без</b> исключения. Печать: <b>ok=False v=0</b> (реальный прогон). Ноль <code>try/catch</code>-оверхеда.', nodes: [{ id: "ch", kind: "gate", at: { zone: "check", row: 0 }, state: "ok", label: "проверка", detail: "заранее" }, { id: "t", kind: "gate", at: { zone: "try", row: 0 }, state: "ok", label: "ok=False", detail: "v=0", accent: true }], edges: [] },
      ],
      explain: 'Исключения — для <b>исключительного</b>, не для рутины. «Use exception handling <span class="hl">if the event doesn\'t occur often, that is, if the event is truly exceptional and indicates an error</span>… Check for error conditions in code <span class="hl">if the event happens routinely and could be considered part of normal execution</span>». Два инструмента избегания: (1) проверка состояния заранее (<code>if (conn.State != Closed)</code>) и (2) Try*-методы — «<code>Int32.TryParse</code> <span class="hl">doesn\'t throw this exception. Instead, it returns a Boolean and has an out parameter</span>»; так же <code>Dictionary.TryGetValue</code>. Реальный прогон: <code>TryParse</code> переполняющего значения вернул <code>ok=False v=0</code>, не бросив. Ещё вариант — «return <code>null</code> (or default) for most common error cases instead of throwing». Заметка про гонки: «there can be <span class="hl">race conditions where the guarded condition changes between the check and the operation</span>» — проверка не панацея в конкуренции.',
      sources: ["ms-best"],
    },
    {
      id: "s3", num: "03", kicker: "Как бросать", title: "Predefined-тип · builder-хелперы · никогда в finally",
      viewBox: "0 0 340 276", zones: THROWBP_ZONES,
      code: ["ArgumentNullException.ThrowIfNull(arg);          // builder-хелпер вместо if+throw", "if (state invalid) throw new InvalidOperationException(...);  // predefined", "finally { /* НЕ бросать здесь */ }"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Бросай самый конкретный <b>готовый</b> тип: «<span class="hl">Introduce a new exception class only when a predefined one doesn\'t apply</span>». Невалидное состояние → <code>InvalidOperationException</code>; плохой аргумент → <code>ArgumentException</code>.', nodes: [{ id: "p", kind: "gate", at: { zone: "throwbp", row: 0 }, state: "ok", label: "predefined тип", detail: "самый конкретный", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: '<span class="hl">Builder-хелперы</span>: «Some key .NET exception types have such <b>static <code>throw</code> helper methods</b>… You should call these methods instead of constructing and throwing». <code>ArgumentNullException.ThrowIfNull</code> — одна строка.', nodes: [{ id: "p", kind: "gate", at: { zone: "throwbp", row: 0 }, state: "ok", label: "predefined", detail: "конкретный" }, { id: "b", kind: "gate", at: { zone: "throwbp", row: 1 }, state: "ok", label: "ThrowIfNull(...)", detail: "builder helper", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Запреты: «<span class="hl">Don\'t raise exceptions in finally clauses</span>» и «Don\'t raise exceptions from unexpected places» — <code>Equals</code>/<code>GetHashCode</code>/<code>ToString</code>/статических конструкторов.', nodes: [{ id: "p", kind: "gate", at: { zone: "throwbp", row: 0 }, state: "ok", label: "predefined", detail: "1" }, { id: "b", kind: "gate", at: { zone: "throwbp", row: 1 }, state: "ok", label: "builder", detail: "2" }, { id: "f", kind: "gate", at: { zone: "throwbp", row: 2 }, state: "fail", label: "НЕ в finally", detail: "запрет", accent: true }], edges: [] },
      ],
      explain: 'Правильный бросок — конкретный, лаконичный, в нужном месте. Тип: «<span class="hl">Introduce a new exception class only when a predefined one doesn\'t apply</span>»: невалидное состояние → <code>InvalidOperationException</code>, плохой аргумент → <code>ArgumentException</code>; и «you <span class="hl">shouldn\'t raise some reserved exception types, such as AccessViolationException, IndexOutOfRangeException, NullReferenceException and StackOverflowException</span>». Лаконичность — builder-хелперы: «Some key .NET exception types have such <span class="hl">static throw helper methods</span>… You should call these methods instead of constructing and throwing» (<code>ArgumentNullException.ThrowIfNull</code>, <code>ObjectDisposedException.ThrowIf</code>). Место: «<span class="hl">Place throw statements where the stack trace is helpful</span>»; «<span class="hl">Don\'t raise exceptions in finally clauses</span>»; сообщение — «<span class="hl">derived from the Exception.Message property</span>… should end in a period».',
      sources: ["ms-best"],
    },
    {
      id: "s4", num: "04", kicker: "Захват и переброс", title: "В catch — throw;; вне catch — ExceptionDispatchInfo",
      viewBox: "0 0 340 210", zones: CAPTURE_ZONES,
      code: ["catch (Exception e) { rollback(); throw; }   // из обработчика — throw;", "// вне catch:", "var edi = ExceptionDispatchInfo.Capture(e); … edi.Throw();"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Перебрасываешь <b>внутри</b> <code>catch</code> — «use the <code>throw</code> statement <span class="hl">without specifying the exception</span>». <code>throw e;</code> «the stack trace is <b>restarted</b> at the current method».', nodes: [{ id: "h", kind: "gate", at: { zone: "inhandler", row: 0 }, state: "ok", label: "throw;", detail: "стек цел", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Перебрасываешь <b>не</b> из обработчика — «use <span class="hl">ExceptionDispatchInfo.Capture(Exception)</span> to capture the exception in the handler and <code>ExceptionDispatchInfo.Throw()</code> when you want to rethrow it».', nodes: [{ id: "h", kind: "gate", at: { zone: "inhandler", row: 0 }, state: "ok", label: "throw;", detail: "в catch" }, { id: "e", kind: "gate", at: { zone: "elsewhere", row: 0 }, state: "ok", label: "Capture / Throw", detail: "вне catch", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Оба пути <span class="hl">сохраняют</span> исходный стек. <code>ExceptionDispatchInfo</code> хранит пойманное и позволяет бросить позже с оригинальным трейсом.', nodes: [{ id: "h", kind: "gate", at: { zone: "inhandler", row: 0 }, state: "ok", label: "throw;", detail: "стек сохранён" }, { id: "e", kind: "gate", at: { zone: "elsewhere", row: 0 }, state: "ok", label: "EDI.Throw()", detail: "стек сохранён", accent: true }], edges: [] },
      ],
      explain: 'Сохранение стека при перебросе — два способа по месту. «Once an exception is thrown, part of the information it carries is the <b>stack trace</b>… If you rethrow an exception by specifying the exception in the <code>throw</code> statement, for example, <code>throw e</code>, the <span class="hl">stack trace is restarted at the current method and the list of method calls… is lost</span>». Отсюда: «If you rethrow the exception <span class="hl">from within the handler (catch block)</span>… use the <code>throw</code> statement <span class="hl">without specifying the exception</span>» (правило анализатора CA2200). «If you\'re rethrowing the exception <span class="hl">from somewhere other than the handler</span>… use <span class="hl">ExceptionDispatchInfo.Capture(Exception)</span> to capture the exception in the handler and <code>ExceptionDispatchInfo.Throw()</code> when you want to rethrow it». Первый — обычный <code>throw;</code>; второй нужен, когда переброс делается вне <code>catch</code> (напр. асинхронный конвейер).',
      sources: ["ms-best"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · восстановление", title: "Упавший deposit откатывает withdrawal — без побочных эффектов",
      viewBox: "0 0 340 210", zones: RESTORE_ZONES,
      code: ["from.Withdrawal(amount);              // сняли 50: from 100 → 50", "try { to.Deposit(amount); }           // deposit БРОСАЕТ", "catch { from.Rollback(); throw; }     // откат: from 50 → 100, переброс"],
      predictAt: 1, predictQ: 'Сняли 50 с <code>from</code> (100→50), но <code>deposit</code> бросил. В <code>catch</code> — откат и <code>throw;</code>. Каким останется <code>from</code>? Что напечатает исход?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Сняли amount с <code>from</code> — частичное изменение сделано. Если сейчас упасть без отката, деньги <span class="hl">пропадут</span>.', nodes: [{ id: "w", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "fail", label: "withdraw", detail: "from 100→50", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>deposit</code> <b>бросает</b>. Правило: «Callers should be able to <span class="hl">assume that there are no side effects when an exception is thrown</span> from a method».', nodes: [{ id: "w", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "fail", label: "withdraw", detail: "from=50" }, { id: "d", kind: "gate", at: { zone: "state", row: 0, col: 1 }, state: "fail", label: "deposit!", detail: "бросил", accent: true }], edges: [] },
        { codeLine: 2, out: "rolledback from=100 to=0", caption: 'Панель: <span class="hl">rolledback from=100 to=0</span> (реальный прогон) — <code>catch</code> откатил снятие (<code>from</code> снова 100) и через <code>throw;</code> отдал ошибку. Ноль частичных эффектов.', nodes: [{ id: "w", kind: "gate", at: { zone: "state", row: 0, col: 0 }, state: "ok", label: "rollback", detail: "from=100" }, { id: "d", kind: "gate", at: { zone: "state", row: 0, col: 1 }, state: "fail", label: "deposit упал", detail: "to=0" }, { id: "r", kind: "gate", at: { zone: "state", row: 0, col: 2 }, state: "ok", label: "throw;", detail: "переброс", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — главная практика надёжности: атомарность видимого состояния. «Callers should be able to <span class="hl">assume that there are no side effects when an exception is thrown from a method</span>». Пример из доков — перевод денег: сняли с одного счёта, но <code>Deposit</code> упал — «you <span class="hl">don\'t want the withdrawal to remain in effect</span>». Решение: «catch any exceptions thrown by the deposit transaction and <span class="hl">roll back the withdrawal</span>», причём переброс — через <code>throw;</code>: «This example illustrates the use of <code>throw</code> to <span class="hl">rethrow the original exception</span>, making it easier for callers to see the real cause». Реальный прогон печатает <code>rolledback from=100 to=0</code>: снятие отменено (<code>from</code> = исходные 100), <code>to</code> не изменился, ошибка проброшена наверх с целым стеком. Альтернатива отката — «throw a new exception and include the original exception as the <code>inner</code> exception».',
      sources: ["ms-best"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool ok = int.TryParse("999999999999999", out int v); Console.WriteLine($"ok={ok} v={v}");</code> — что напечатает (значение переполняет Int32)?',
      options: ["ok=False v=0", "ok=True v=999999999999999", "(бросает OverflowException)", "ok=False v=-1"], correctIndex: 0, xp: 10,
      okText: '<code>TryParse</code> — Try*-паттерн: «<span class="hl">doesn\'t throw this exception. Instead, it returns a Boolean and has an out parameter</span>». Переполнение → <code>false</code>, <code>out</code> = <code>0</code> (default). Печать: <b>ok=False v=0</b>.',
      noText: 'В отличие от <code>int.Parse</code>, <code>TryParse</code> не бросает — возвращает <code>false</code> и <code>0</code> в <code>out</code>. Реальный вывод: <b>ok=False v=0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ok=False v=0" }, sourceRefs: ["ms-best"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int from=100, to=0; string outcome; void Withdraw(){ from-=50; } void Deposit(){ throw new InvalidOperationException("deposit failed"); } try { Withdraw(); try { Deposit(); } catch { from+=50; throw; } outcome="committed"; } catch (Exception) { outcome="rolledback"; } Console.WriteLine($"{outcome} from={from} to={to}");</code> — что напечатает?',
      options: ["rolledback from=100 to=0", "committed from=50 to=50", "rolledback from=50 to=0", "committed from=100 to=0"], correctIndex: 0, xp: 10,
      okText: 'Withdraw снял 50 (100→50), Deposit бросил → <code>catch</code> откатил (+50 → 100) и сделал <code>throw;</code>. «no side effects when an exception is thrown». Печать: <b>rolledback from=100 to=0</b>.',
      noText: 'Частичное изменение (снятие) откатывается при сбое depositа; <code>from</code> восстановлен до 100. Реальный вывод: <b>rolledback from=100 to=0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "rolledback from=100 to=0" }, sourceRefs: ["ms-best"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string r; void M(object arg){ ArgumentNullException.ThrowIfNull(arg); } try { M(null!); r="nothrow"; } catch (ArgumentNullException e) { r = e.GetType().Name + ":" + e.ParamName; } Console.WriteLine(r);</code> — что напечатает?',
      options: ["ArgumentNullException:arg", "NullReferenceException:arg", "ArgumentNullException:", "nothrow"], correctIndex: 0, xp: 10,
      okText: '<code>ArgumentNullException.ThrowIfNull</code> — builder-хелпер: «call these methods <span class="hl">instead of constructing and throwing</span>». Бросает <code>ArgumentNullException</code>, а <code>ParamName</code> = имя аргумента <b>arg</b>. Печать: <b>ArgumentNullException:arg</b>.',
      noText: 'Статический хелпер <code>ThrowIfNull</code> бросает именно <code>ArgumentNullException</code> и подставляет <code>ParamName</code> из имени переменной. Реальный вывод: <b>ArgumentNullException:arg</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ArgumentNullException:arg" }, sourceRefs: ["ms-best"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что ловить", v: '«<span class="hl">order exceptions from the most derived to the least derived</span>»; «<span class="hl">When your code can\'t recover from an exception, don\'t catch that exception</span>». «a crashed app is more reliable… than an app with undefined behavior».' },
    { icon: "cost", k: "Избегай на hot path", v: 'Проверь заранее или зови Try*: «<code>TryParse</code> <span class="hl">doesn\'t throw… returns a Boolean and has an out parameter</span>» (замер: ok=False v=0). Исключения — для «truly exceptional» событий.' },
    { icon: "avoid", k: "Как бросать / состояние", v: '«<span class="hl">Introduce a new exception class only when a predefined one doesn\'t apply</span>», builder-хелперы (замер: ArgumentNullException:arg), не в <code>finally</code>. Восстанавливай состояние: «no side effects when an exception is thrown» (замер: rolledback from=100).' },
  ],

  foot: 'урок · <b>практики исключений</b> · 5 анимир. разборов · панель rollback состояния · дизайн <b>mid</b>',
};
