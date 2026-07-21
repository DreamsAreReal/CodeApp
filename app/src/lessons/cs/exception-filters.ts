/**
 * Lesson: Exception filters — the `when` keyword (CS.S9.exception-filters) — expert density, 5
 * animated deep-dives. A `when` clause is a Boolean expression that further examines an exception
 * and decides whether the catch handles it. THE machine-level point: the filter is evaluated BEFORE
 * the stack is unwound — the original call stack and local variables are still intact during filter
 * evaluation (traditional catch runs AFTER unwinding). If the filter is false, the exception keeps
 * propagating and the original stack trace isn't changed. You can have several catch clauses of the
 * same type distinguished by filters; with a filter present, catch(Exception) needn't be last.
 *
 * SIGNATURE machine panel (s5): the filter runs BEFORE the catch body and BEFORE unwinding — order is
 * throw -> filter -> catch. REAL run-csharp measurement (this file's exec cards): "throw;filter;catch;".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from language-reference/statements/exception-handling-statements
 *     (the `when` filter + "Exception filters vs. traditional" + "Stack trace preservation" sections)
 *     and the how-to try-catch page (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1 "retry-branch"
 *     (two same-type catches split by filter; the matching one runs) · c2 "throw;filter;catch;" (filter
 *     evaluated between throw and catch body) · c3 "outer" (a false filter lets the exception continue
 *     to the outer catch — not swallowed).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.exception-filters/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: a when filter is a Boolean that decides if the catch handles it.
const Z_EX: Zone = { id: "ex", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ИСКЛЮЧЕНИЕ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "тип совпал", subCls: "vz-zsub heap", subY: 47 };
const Z_WHEN: Zone = { id: "when", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "when (bool)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "решает: обрабатывать?", subCls: "vz-zsub good", subY: 47 };
const WHEN_ZONES: Zone[] = [Z_EX, Z_WHEN];

// s2: several catch clauses of same type, split by filters.
const Z_SPLIT: Zone = { id: "split", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ОДИН ТИП · РАЗНЫЕ when · РАЗНЫЕ ВЕТКИ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "catch (IOException) when (…) · when (…)", subCls: "vz-zsub", subY: 40 };
const SPLIT_ZONES: Zone[] = [Z_SPLIT];

// s3: filter false -> exception keeps propagating (not swallowed).
const Z_FALSE: Zone = { id: "false", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "when → false", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "этот catch НЕ ловит", subCls: "vz-zsub heap", subY: 47 };
const Z_CONT: Zone = { id: "cont", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "поиск ПРОДОЛЖАЕТСЯ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "летит к внешнему catch", subCls: "vz-zsub good", subY: 47 };
const FALSE_ZONES: Zone[] = [Z_FALSE, Z_CONT];

// s4: filter runs BEFORE unwinding — stack + locals intact.
const Z_INTACT: Zone = { id: "intact", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "when: стек ЦЕЛ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "before the stack is unwound", subCls: "vz-zsub good", subY: 47 };
const Z_UNW: Zone = { id: "unw", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "обычный catch: стек РАЗМОТАН", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "after the stack is unwound", subCls: "vz-zsub heap", subY: 47 };
const INTACT_ZONES: Zone[] = [Z_INTACT, Z_UNW];

// s5 (SIGNATURE): order throw -> filter -> catch.
const Z_TIME: Zone = { id: "time", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ПОРЯДОК ВО ВРЕМЕНИ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "throw → when-фильтр → тело catch", subCls: "vz-zsub", subY: 40 };
const TIME_ZONES: Zone[] = [Z_TIME];

export const exceptionFilters: LessonData = {
  id: "CS.S9.exception-filters",
  track: "CS",
  section: "CS.S9",
  module: "S9.3",
  lang: "csharp",
  title: "Фильтры исключений: when без раскрутки стека",
  kicker: "C# вглубь · S9 · when-фильтр",
  home: { subtitle: "when (bool), оценка до раскрутки, false → поиск дальше", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S9.try-catch-finally"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-stmts", kind: "doc", org: "Microsoft Learn", title: "Exception-handling statements - the when filter", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements", date: "2026-01-16" },
    { id: "ms-howto", kind: "doc", org: "Microsoft Learn", title: "How to: Use the Try-Catch Block to Catch Exceptions", url: "https://learn.microsoft.com/en-us/dotnet/standard/exceptions/how-to-use-the-try-catch-block-to-catch-exceptions", date: "2019-02-06" },
  ],

  spec: [
    { text: "«An exception filter is a Boolean expression that follows the when keyword» <span class=\"ru-tr\">«Фильтр исключений — это булево выражение, идущее после ключевого слова when»</span> — он «further examines an exception and decides if the corresponding catch block handles that exception» <span class=\"ru-tr\">«дополнительно исследует исключение и решает, обрабатывает ли его соответствующий блок catch»</span>.", source: "ms-stmts" },
    { text: "«Exception filters (when): The filter expression is evaluated before the stack is unwound. This means the original call stack and all local variables remain intact during filter evaluation.» <span class=\"ru-tr\">«Фильтры исключений (when): выражение фильтра вычисляется до раскрутки стека. Это значит, что исходный стек вызовов и все локальные переменные остаются нетронутыми во время вычисления фильтра.»</span>", source: "ms-stmts" },
  ],
  edgeCases: [
    { text: "Несколько <code>catch</code> одного типа различаются фильтрами: «You can provide several <code>catch</code> clauses for the same exception type <b>if they distinguish by exception filters</b>» <span class=\"ru-tr\">«Можно задать несколько предложений <code>catch</code> для одного и того же типа исключения, <b>если они различаются фильтрами исключений</b>»</span>.", source: "ms-stmts" },
    { text: "С фильтром порядок гибче: «if an exception filter is present, a <code>catch (Exception e)</code> clause <b>doesn't need to be the last clause</b>» <span class=\"ru-tr\">«если присутствует фильтр исключений, предложение <code>catch (Exception e)</code> <b>не обязано быть последним предложением</b>»</span>.", source: "ms-stmts" },
    { text: "<code>false</code>-фильтр не портит стек: «The <code>when</code> filter doesn't unwind the stack, so <b>if a when filter is false, the original stack trace isn't changed</b>» <span class=\"ru-tr\">«Фильтр <code>when</code> не раскручивает стек, поэтому <b>если фильтр when равен false, исходная трассировка стека не меняется</b>»</span>.", source: "ms-stmts" },
    { text: "Каждый <code>catch</code> в how-to называет тип: «Each <code>catch</code> block includes the exception type and can contain additional statements needed to handle that exception type» <span class=\"ru-tr\">«Каждый блок <code>catch</code> включает тип исключения и может содержать дополнительные операторы, нужные для обработки этого типа исключения»</span>.", source: "ms-howto" },
  ],

  misconceptions: [
    {
      wrong: "when — это просто сахар над if внутри catch; разницы нет, стек всё равно уже размотан",
      hook: 'Разница — <b>машинная</b>, во времени вычисления. «An <span class="hl">exception filter is a Boolean expression that follows the when keyword</span>» <span class="ru-tr">«Фильтр исключений — это булево выражение, идущее после ключевого слова when»</span>, который «<span class="hl">further examines an exception and decides if the corresponding catch block handles that exception</span>» <span class="ru-tr">«дополнительно исследует исключение и решает, обрабатывает ли его соответствующий блок catch»</span>. Ключ: «<span class="hl">The filter expression is evaluated before the stack is unwound</span>. This means the <span class="hl">original call stack and all local variables remain intact during filter evaluation</span>» <span class="ru-tr">«Выражение фильтра вычисляется до раскрутки стека. Это значит, что исходный стек вызовов и все локальные переменные остаются нетронутыми во время вычисления фильтра»</span> — тогда как обычный <code>catch</code> «runs <span class="hl">after the stack is unwound</span>» <span class="ru-tr">«выполняется после раскрутки стека»</span>. И если фильтр <code>false</code>, «the <code>when</code> filter <span class="hl">doesn\'t unwind the stack</span>, so if a when filter is false, the original stack trace isn\'t changed» <span class="ru-tr">«фильтр <code>when</code> не раскручивает стек, поэтому если фильтр when равен false, исходная трассировка стека не меняется»</span> — исключение летит дальше нетронутым. Дальше <b>пять разборов</b>: <code>when</code> как булев решатель, несколько <code>catch</code> одного типа по фильтрам, <code>false</code>→поиск продолжается, оценка <b>до</b> раскрутки (стек цел), и <b>машинная панель</b> — порядок throw→filter→catch (реальный прогон).',
      source: "ms-stmts",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "when", title: "when — булево, решающее, ловит ли этот catch",
      viewBox: "0 0 340 210", zones: WHEN_ZONES,
      code: ["try { var result = Process(-3, 4); }", "catch (Exception e) when (e is ArgumentException || e is DivideByZeroException)", "{ Console.WriteLine($\"Processing failed: {e.Message}\"); }"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Тип в <code>catch</code> уже совпал — но это ещё не решение. Дальше идёт <span class="hl">фильтр</span>.', nodes: [{ id: "e", kind: "obj", at: { zone: "ex", row: 0 }, typeTag: "Exception", value: "тип совпал", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>when (…)</code> — «a <span class="hl">Boolean expression that follows the when keyword</span>» <span class="ru-tr">«булево выражение, идущее после ключевого слова when»</span>. Он «further examines an exception and decides if the corresponding <code>catch</code> block handles that exception» <span class="ru-tr">«дополнительно исследует исключение и решает, обрабатывает ли его соответствующий блок <code>catch</code>»</span>.', nodes: [{ id: "e", kind: "obj", at: { zone: "ex", row: 0 }, typeTag: "Exception", value: "тип совпал" }, { id: "w", kind: "gate", at: { zone: "when", row: 0 }, state: "ok", label: "when (e is …)", detail: "true → ловим", accent: true }], edges: [{ id: "e1", from: "e", to: "w", accent: true }] },
        { codeLine: 2, out: "", caption: 'Один <code>catch</code>-блок через фильтр обрабатывает <b>два</b> типа: «uses an exception filter to provide a <span class="hl">single catch block to handle exceptions of two specified types</span>» <span class="ru-tr">«использует фильтр исключений, чтобы предоставить один блок catch для обработки исключений двух указанных типов»</span>.', nodes: [{ id: "e", kind: "obj", at: { zone: "ex", row: 0 }, typeTag: "Exception", value: "Argument | DivByZero" }, { id: "w", kind: "gate", at: { zone: "when", row: 0 }, state: "ok", label: "when → true", detail: "единый catch", accent: true }], edges: [{ id: "e1", from: "e", to: "w" }] },
      ],
      explain: 'Фильтр — второй, необязательный критерий отбора после типа. «Along with an exception type, you can also specify an exception filter that <span class="hl">further examines an exception and decides if the corresponding catch block handles that exception</span>. An <span class="hl">exception filter is a Boolean expression that follows the when keyword</span>» <span class="ru-tr">«Наряду с типом исключения можно также задать фильтр исключений, который дополнительно исследует исключение и решает, обрабатывает ли его соответствующий блок catch. Фильтр исключений — это булево выражение, идущее после ключевого слова when»</span>. В теле фильтра — любое булево выражение над пойманным <code>e</code>: проверка типа (<code>e is …</code>), содержимого <code>Message</code>, внешнего состояния. Практический эффект — один <code>catch</code> покрывает несколько условий без <code>if</code>-лестницы внутри: «The preceding example uses an exception filter to provide a <span class="hl">single catch block to handle exceptions of two specified types</span>» <span class="ru-tr">«Предыдущий пример использует фильтр исключений, чтобы предоставить один блок catch для обработки исключений двух указанных типов»</span>. Обычный <code>catch</code> по типу решает «мой ли это тип», <code>when</code> добавляет «и подходит ли он по условию».',
      sources: ["ms-stmts"],
    },
    {
      id: "s2", num: "02", kicker: "Несколько по фильтрам", title: "Несколько catch одного типа, различённых when",
      viewBox: "0 0 340 276", zones: SPLIT_ZONES,
      code: ["catch (IOException ex) when (ex.Message.Contains(\"access denied\"))  { … }", "catch (IOException ex) when (ex.Message.Contains(\"not found\"))      { … }", "catch (IOException)    { /* прочие I/O — без фильтра, последним */ }"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Три <code>catch</code> <b>одного</b> типа <code>IOException</code>, но с разными <code>when</code>. «You can provide several <code>catch</code> clauses for the same exception type <span class="hl">if they distinguish by exception filters</span>» <span class="ru-tr">«Можно задать несколько предложений <code>catch</code> для одного и того же типа исключения, если они различаются фильтрами исключений»</span>.', nodes: [{ id: "a", kind: "gate", at: { zone: "split", row: 0 }, state: "ok", label: 'when "access denied"', detail: "ветка 1", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Разные условия → <span class="hl">разное поведение</span> для одного типа, без вложенных <code>if</code>. Каждый <code>when</code> сужает по своему признаку.', nodes: [{ id: "a", kind: "gate", at: { zone: "split", row: 0 }, state: "ok", label: 'when "access denied"', detail: "ветка 1" }, { id: "b", kind: "gate", at: { zone: "split", row: 1 }, state: "ok", label: 'when "not found"', detail: "ветка 2", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Ветка <b>без</b> фильтра — по правилу последняя из веток этого типа: «If such a clause exists, it must be the <span class="hl">last of the clauses that specify that exception type</span>» <span class="ru-tr">«Если такое предложение существует, оно должно быть последним из предложений, задающих этот тип исключения»</span>.', nodes: [{ id: "a", kind: "gate", at: { zone: "split", row: 0 }, state: "ok", label: 'when "access denied"', detail: "1" }, { id: "b", kind: "gate", at: { zone: "split", row: 1 }, state: "ok", label: 'when "not found"', detail: "2" }, { id: "c", kind: "gate", at: { zone: "split", row: 2 }, state: "ok", label: "catch (IOException)", detail: "без when · последним", accent: true }], edges: [] },
      ],
      explain: 'Фильтры снимают запрет «один тип — один <code>catch</code>»: «<span class="hl">You can provide several catch clauses for the same exception type if they distinguish by exception filters</span>. One of those clauses might have no exception filter. If such a clause exists, it must be the <span class="hl">last of the clauses that specify that exception type</span>» <span class="ru-tr">«Можно задать несколько предложений catch для одного и того же типа исключения, если они различаются фильтрами исключений. У одного из этих предложений фильтра исключений может не быть. Если такое предложение существует, оно должно быть последним из предложений, задающих этот тип исключения»</span>. Так один <code>IOException</code> обрабатывается по-разному в зависимости от условия (доступ запрещён / файл не найден / сеть), а «catch-all» этого типа замыкает список. Ещё следствие фильтров для порядка: «if an exception filter is present, a <code>catch (Exception e)</code> clause <span class="hl">doesn\'t need to be the last clause</span>» <span class="ru-tr">«если присутствует фильтр исключений, предложение <code>catch (Exception e)</code> не обязано быть последним предложением»</span> — обычно широкий <code>catch (Exception)</code> обязан быть последним, но при наличии фильтра это правило смягчается.',
      sources: ["ms-stmts"],
    },
    {
      id: "s3", num: "03", kicker: "false → дальше", title: "Фильтр false — исключение НЕ проглочено, летит к внешнему catch",
      viewBox: "0 0 340 210", zones: FALSE_ZONES,
      code: ["try {", "  try { throw new InvalidOperationException(\"x\"); }", "  catch (Exception e) when (e.Message == \"nomatch\") { s=\"inner\"; }  // when=false", "} catch (Exception) { s=\"outer\"; }   // сюда и прилетит"],
      predictAt: 2, predictQ: 'Внутренний <code>catch</code> имеет <code>when (e.Message == "nomatch")</code>, но сообщение — «x» (фильтр <b>false</b>). Внешний <code>catch</code> без фильтра. Что в <code>s</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Тип совпал (<code>Exception</code>), но фильтр <code>when</code> вернул <span class="hl">false</span> — этот <code>catch</code> <b>не</b> обрабатывает.', nodes: [{ id: "f", kind: "gate", at: { zone: "false", row: 0 }, state: "fail", label: 'when == "nomatch"', detail: "false", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Исключение <span class="hl">продолжает поиск</span> — как будто этой ветки не было. «The <code>when</code> filter doesn\'t unwind the stack, so if a when filter is false, the original stack trace isn\'t changed» <span class="ru-tr">«Фильтр <code>when</code> не раскручивает стек, поэтому если фильтр when равен false, исходная трассировка стека не меняется»</span>.', nodes: [{ id: "f", kind: "gate", at: { zone: "false", row: 0 }, state: "fail", label: "when false", detail: "не ловит" }, { id: "c", kind: "gate", at: { zone: "cont", row: 0 }, state: "ok", label: "внешний catch", detail: "перехватит", accent: true }], edges: [{ id: "e1", from: "f", to: "c", accent: true }] },
        { codeLine: 3, out: "outer", caption: 'Результат — <span class="hl">outer</span> (реальный прогон): <code>false</code>-фильтр не глушит исключение, оно поймано <b>снаружи</b>. Фильтр решает «не мой» — не «съесть молча».', nodes: [{ id: "f", kind: "gate", at: { zone: "false", row: 0 }, state: "fail", label: "inner", detail: "пропущен" }, { id: "c", kind: "gate", at: { zone: "cont", row: 0 }, state: "ok", label: "outer", detail: "поймал", accent: true }], edges: [{ id: "e1", from: "f", to: "c" }] },
      ],
      explain: 'Ложный фильтр — это «этот <code>catch</code> не подходит», а не «исключение обработано». Поиск обработчика продолжается дальше по стеку, как если бы ветки с <code>false</code>-фильтром не существовало. Причём — <b>без побочных эффектов на диагностику</b>: «Exception filters preserve the original <code>ex.StackTrace</code> property… The <code>when</code> filter doesn\'t unwind the stack, so if a <span class="hl">when filter is false, the original stack trace isn\'t changed</span>» <span class="ru-tr">«Фильтры исключений сохраняют исходное свойство <code>ex.StackTrace</code>… Фильтр <code>when</code> не раскручивает стек, поэтому если фильтр when равен false, исходная трассировка стека не меняется»</span>. Реальный прогон печатает <code>outer</code>: внутренний фильтр отверг (сообщение «x» ≠ «nomatch»), исключение долетело до внешнего <code>catch</code> целым. Отсюда паттерн «залогировать и пропустить дальше»: фильтр может осмотреть исключение, вернуть <code>false</code> — и оно продолжит подниматься с нетронутым стеком.',
      sources: ["ms-stmts"],
    },
    {
      id: "s4", num: "04", kicker: "До раскрутки", title: "Фильтр считается ДО раскрутки — стек и локальные целы",
      viewBox: "0 0 340 210", zones: INTACT_ZONES,
      code: ["catch (Exception ex) when (LogAndFilter(ex, context))  // фильтр: стек ещё цел", "// vs обычный catch { if(...) } — тело бежит ПОСЛЕ раскрутки", "// LogAndFilter видит полный стек и локальные переменные throw-места"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>when</code> вычисляется <span class="hl">до</span> размотки: «The filter expression is evaluated <b>before the stack is unwound</b>» <span class="ru-tr">«Выражение фильтра вычисляется <b>до раскрутки стека</b>»</span>. Стек броска ещё на месте.', nodes: [{ id: "i", kind: "gate", at: { zone: "intact", row: 0 }, state: "ok", label: "when-фильтр", detail: "стек ЦЕЛ", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Обычный <code>catch</code>+<code>if</code> — тело бежит <span class="hl">после</span> размотки: «The catch block runs <b>after the stack is unwound</b>, potentially losing valuable debugging information» <span class="ru-tr">«Блок catch выполняется <b>после раскрутки стека</b>, потенциально теряя ценную отладочную информацию»</span>.', nodes: [{ id: "i", kind: "gate", at: { zone: "intact", row: 0 }, state: "ok", label: "when", detail: "стек ЦЕЛ" }, { id: "u", kind: "gate", at: { zone: "unw", row: 0 }, state: "fail", label: "catch + if", detail: "стек размотан", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Потому фильтр — точка для логирования из места сбоя: «<span class="hl">the original call stack and all local variables remain intact during filter evaluation</span>» <span class="ru-tr">«исходный стек вызовов и все локальные переменные остаются нетронутыми во время вычисления фильтра»</span>. Debugger покажет исходную точку падения.', nodes: [{ id: "i", kind: "gate", at: { zone: "intact", row: 0 }, state: "ok", label: "when: log", detail: "локальные видны", accent: true }, { id: "u", kind: "gate", at: { zone: "unw", row: 0 }, state: "fail", label: "catch: log", detail: "инфо потеряна" }], edges: [] },
      ],
      explain: 'Это и есть машинная суть <code>when</code>: момент вычисления. «Exception filters (<code>when</code>): <span class="hl">The filter expression is evaluated before the stack is unwound</span>. This means the <span class="hl">original call stack and all local variables remain intact during filter evaluation</span>» <span class="ru-tr">«Фильтры исключений (<code>when</code>): выражение фильтра вычисляется до раскрутки стека. Это значит, что исходный стек вызовов и все локальные переменные остаются нетронутыми во время вычисления фильтра»</span> — против «Traditional <code>catch</code> blocks: The catch block runs <span class="hl">after the stack is unwound</span>, potentially losing valuable debugging information» <span class="ru-tr">«Традиционные блоки <code>catch</code>: блок catch выполняется после раскрутки стека, потенциально теряя ценную отладочную информацию»</span>. Отсюда преимущества: «<b>Better debugging experience</b>: Since the stack isn\'t unwound until a filter matches, debuggers can show the original point of failure with all local variables intact» <span class="ru-tr">«<b>Лучший опыт отладки</b>: поскольку стек не раскручивается, пока фильтр не совпадёт, отладчики могут показать исходную точку сбоя со всеми нетронутыми локальными переменными»</span> и «<b>Performance benefits</b>: If no filter matches, the exception continues propagating without the <span class="hl">overhead of stack unwinding and restoration</span>» <span class="ru-tr">«<b>Выигрыш в производительности</b>: если ни один фильтр не совпадает, исключение продолжает распространяться без накладных расходов на раскрутку и восстановление стека»</span>. Логирование из <code>when</code> происходит там, где стек ещё описывает реальное место сбоя.',
      sources: ["ms-stmts"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · порядок", title: "throw → фильтр → тело catch: фильтр между ними",
      viewBox: "0 0 340 210", zones: TIME_ZONES,
      code: ["bool Filter(){ log(\"filter\"); return true; }", "try { log(\"throw\"); throw new Exception(); }", "catch when (Filter()) { log(\"catch\"); }   // порядок: throw → filter → catch"],
      predictAt: 1, predictQ: 'Логируем «throw» перед броском, «filter» внутри <code>when</code>, «catch» в теле. В каком порядке они напечатаются?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Сначала тело <code>try</code> бросает — лог «throw». Исключение возникло, но обработчик <span class="hl">ещё не выбран</span>.', nodes: [{ id: "t", kind: "gate", at: { zone: "time", row: 0, col: 0 }, state: "fail", label: "throw", detail: "1", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'CLR <span class="hl">до раскрутки</span> вычисляет <code>when (Filter())</code> — лог «filter». Фильтр решает, брать ли этот <code>catch</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "time", row: 0, col: 0 }, state: "fail", label: "throw", detail: "1" }, { id: "f", kind: "gate", at: { zone: "time", row: 0, col: 1 }, state: "ok", label: "filter", detail: "2 · до раскрутки", accent: true }], edges: [{ id: "e1", from: "t", to: "f", accent: true }] },
        { codeLine: 2, out: "throw;filter;catch;", caption: 'Панель: <span class="hl">throw;filter;catch;</span> (реальный прогон) — фильтр строго <b>между</b> броском и телом <code>catch</code>. Вернул <code>true</code> → выполняется тело (лог «catch»).', nodes: [{ id: "t", kind: "gate", at: { zone: "time", row: 0, col: 0 }, state: "fail", label: "throw", detail: "1" }, { id: "f", kind: "gate", at: { zone: "time", row: 0, col: 1 }, state: "ok", label: "filter", detail: "2" }, { id: "c", kind: "gate", at: { zone: "time", row: 0, col: 2 }, state: "ok", label: "catch", detail: "3", accent: true }], edges: [{ id: "e1", from: "t", to: "f" }, { id: "e2", from: "f", to: "c", accent: true }] },
      ],
      explain: 'Машинная панель — временной порядок <code>throw → when-фильтр → тело catch</code>. Реальный прогон печатает <code>throw;filter;catch;</code>: фильтр <code>Filter()</code> выполнился <b>после</b> броска, но <b>до</b> тела обработчика — ровно потому, что «The <span class="hl">filter expression is evaluated before the stack is unwound</span>» <span class="ru-tr">«Выражение фильтра вычисляется до раскрутки стека»</span>. Если бы фильтр вернул <code>false</code>, тело <code>catch</code> не выполнилось бы вовсе, а исключение продолжило поиск с целым стеком. Практический вывод раздела: <code>when</code> — не косметика над <code>if</code> внутри <code>catch</code>. Оценка до раскрутки даёт три вещи: точную диагностику из места сбоя, отсутствие оверхеда размотки при несовпадении и возможность «осмотреть-и-пропустить». «The exception filter approach is valuable in applications where <span class="hl">preserving debugging information is crucial for diagnosing code errors</span>» <span class="ru-tr">«Подход с фильтром исключений ценен в приложениях, где сохранение отладочной информации критично для диагностики ошибок кода»</span>.',
      sources: ["ms-stmts"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s; try { throw new InvalidOperationException("retry"); } catch (InvalidOperationException e) when (e.Message == "fatal") { s="fatal-branch"; } catch (InvalidOperationException e) when (e.Message == "retry") { s="retry-branch"; } Console.WriteLine(s);</code> — что напечатает?',
      options: ["retry-branch", "fatal-branch", "(исключение не поймано)", "InvalidOperationException"], correctIndex: 0, xp: 10,
      okText: 'Два <code>catch</code> одного типа, «distinguish by exception filters» <span class="ru-tr">«различаются фильтрами исключений»</span>. Первый <code>when</code> (== "fatal") — <code>false</code>, второй (== "retry") — <code>true</code>. Сработала вторая ветка. Печать: <b>retry-branch</b>.',
      noText: 'Фильтр отбирает нужную ветку из нескольких <code>catch</code> одного типа. Сообщение «retry» матчит второй <code>when</code>. Реальный вывод: <b>retry-branch</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "retry-branch" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string log=""; bool Filter(){ log+="filter;"; return true; } try { log+="throw;"; throw new Exception(); } catch when (Filter()) { log+="catch;"; } Console.WriteLine(log);</code> — что напечатает?',
      options: ["throw;filter;catch;", "throw;catch;filter;", "filter;throw;catch;", "throw;catch;"], correctIndex: 0, xp: 10,
      okText: '«The filter expression is <span class="hl">evaluated before the stack is unwound</span>» <span class="ru-tr">«Выражение фильтра вычисляется до раскрутки стека»</span>: <code>throw</code> → <code>Filter()</code> → (true) тело <code>catch</code>. Фильтр строго <b>между</b> броском и обработкой. Печать: <b>throw;filter;catch;</b>.',
      noText: 'Фильтр считается ДО раскрутки и ДО тела <code>catch</code>. Порядок: throw → filter → catch. Реальный вывод: <b>throw;filter;catch;</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "throw;filter;catch;" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string s; try { try { throw new InvalidOperationException("x"); } catch (Exception e) when (e.Message == "nomatch") { s="inner"; } } catch (Exception) { s="outer"; } Console.WriteLine(s);</code> — что напечатает?',
      options: ["outer", "inner", "(не поймано, падает)", "x"], correctIndex: 0, xp: 10,
      okText: 'Внутренний фильтр <code>false</code> (сообщение «x» ≠ «nomatch») → этот <code>catch</code> не ловит; «if a <span class="hl">when filter is false</span>» <span class="ru-tr">«если фильтр when равен false»</span> исключение продолжает поиск и ловится внешним. Печать: <b>outer</b>.',
      noText: '<code>false</code>-фильтр не проглатывает исключение — оно летит дальше к внешнему <code>catch</code> с нетронутым стеком. Реальный вывод: <b>outer</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "outer" }, sourceRefs: ["ms-stmts"],
    },
  ],

  takeaways: [
    { icon: "why", k: "when", v: '«An <span class="hl">exception filter is a Boolean expression that follows the when keyword</span>» <span class="ru-tr">«Фильтр исключений — это булево выражение, идущее после ключевого слова when»</span> — «further examines an exception and decides if the corresponding catch block handles that exception» <span class="ru-tr">«дополнительно исследует исключение и решает, обрабатывает ли его соответствующий блок catch»</span>. Один <code>catch</code> может покрыть несколько условий.' },
    { icon: "cost", k: "До раскрутки", v: '«The filter expression is <span class="hl">evaluated before the stack is unwound</span>… the original call stack and all local variables remain intact» <span class="ru-tr">«Выражение фильтра вычисляется до раскрутки стека… исходный стек вызовов и все локальные переменные остаются нетронутыми»</span> — точная диагностика из места сбоя (замер порядка: throw;filter;catch;).' },
    { icon: "avoid", k: "false → дальше", v: '<code>false</code>-фильтр не глотает исключение: «if a <span class="hl">when filter is false, the original stack trace isn\'t changed</span>» <span class="ru-tr">«если фильтр when равен false, исходная трассировка стека не меняется»</span> — оно продолжает поиск (замер: outer). Несколько <code>catch</code> одного типа различают по <code>when</code>.' },
  ],

  foot: 'урок · <b>фильтры исключений (when)</b> · 5 анимир. разборов · панель throw→filter→catch · дизайн <b>mid</b>',
};
