/**
 * Lesson: throw; vs throw e; — preserving the stack trace (CS.S9.throw-vs-rethrow) — expert density,
 * 5 animated deep-dives. Inside a catch, `throw;` re-throws the SAME exception and PRESERVES its
 * original stack trace; `throw e;` re-throws and RESETS the StackTrace to the current line — the
 * originating frame is lost. A third option is wrapping: throw a new exception passing the caught one
 * as innerException, which keeps the cause while adding context. Good practice: add information when
 * rethrowing.
 *
 * SIGNATURE machine panel (s5): the same failing origin method, rethrown two ways. Deterministic proof
 * (NOT a raw trace): does the ORIGINATING method name still appear in ex.StackTrace? throw; -> True,
 * throw e; -> False. REAL run-csharp measurement (this file's exec cards): "rethrow=True throwEx=False".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from language-reference/statements/exception-handling-statements
 *     (the `throw;` vs `throw e;` note) and standard/exceptions/how-to-explicitly-throw-exceptions
 *     (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1 "True" (throw;
 *     keeps the Origin frame) · c2 "False" (throw e; loses it) · c3 "rethrow=True throwEx=False"
 *     (both, side by side). Numbers are booleans about whether "Origin" is a substring of StackTrace —
 *     deterministic and repeatable, never a raw trace with line numbers.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.throw-vs-rethrow/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: throw; re-throws the SAME exception the catch handles.
const Z_CAUGHT: Zone = { id: "caught", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "catch (e) { … }", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "поймал исключение", subCls: "vz-zsub heap", subY: 47 };
const Z_RETH: Zone = { id: "reth", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "throw;", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "переброс ТОГО ЖЕ", subCls: "vz-zsub good", subY: 47 };
const RETH_ZONES: Zone[] = [Z_CAUGHT, Z_RETH];

// s2: throw; preserves — throw e; updates. Two lanes.
const Z_KEEP: Zone = { id: "keep", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "throw;", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "preserves original stack trace", subCls: "vz-zsub good", subY: 47 };
const Z_RESET: Zone = { id: "reset", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "throw e;", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "updates the StackTrace property", subCls: "vz-zsub heap", subY: 47 };
const KEEPRESET_ZONES: Zone[] = [Z_KEEP, Z_RESET];

// s3: wrapping — new exception with innerException keeps the cause.
const Z_INNER: Zone = { id: "inner", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "исходная причина", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "→ innerException", subCls: "vz-zsub heap", subY: 47 };
const Z_WRAP: Zone = { id: "wrap", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "новое + контекст", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "throw new …(msg, e)", subCls: "vz-zsub good", subY: 47 };
const WRAP_ZONES: Zone[] = [Z_INNER, Z_WRAP];

// s4: the anti-pattern — throw e; erases the origin frame from the stack.
const Z_STACKW: Zone = { id: "stackw", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "СТЕК: ГДЕ РЕАЛЬНО УПАЛО", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "throw e; стирает кадр Origin", subCls: "vz-zsub", subY: 40 };
const STACKW_ZONES: Zone[] = [Z_STACKW];

// s5 (SIGNATURE): does Origin survive in StackTrace? throw; True, throw e; False.
const Z_T1: Zone = { id: "t1", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "throw;", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: 'StackTrace.Contains("Origin")', subCls: "vz-zsub good", subY: 47 };
const Z_T2: Zone = { id: "t2", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "throw e;", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: 'StackTrace.Contains("Origin")', subCls: "vz-zsub heap", subY: 47 };
const SIG_ZONES: Zone[] = [Z_T1, Z_T2];

export const throwVsRethrow: LessonData = {
  id: "CS.S9.throw-vs-rethrow",
  track: "CS",
  section: "CS.S9",
  module: "S9.4",
  lang: "csharp",
  title: "throw; vs throw ex; — сохранение стека",
  kicker: "C# вглубь · S9 · переброс исключения",
  home: { subtitle: "throw; сохраняет стек, throw e; сбрасывает, обёртка через inner", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S9.try-catch-finally"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-stmts", kind: "doc", org: "Microsoft Learn", title: "Exception-handling statements - throw; vs throw e;", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements", date: "2026-01-16" },
    { id: "ms-rethrow", kind: "doc", org: "Microsoft Learn", title: "How to: Explicitly Throw Exceptions", url: "https://learn.microsoft.com/en-us/dotnet/standard/exceptions/how-to-explicitly-throw-exceptions", date: "2017-03-30" },
  ],

  spec: [
    { text: "«Inside a catch block, use a throw; statement to re-throw the exception that the catch block handles.»", source: "ms-stmts" },
    { text: "«throw; preserves the original stack trace of the exception, which is stored in the Exception.StackTrace property. In contrast, throw e; updates the StackTrace property of e.»", source: "ms-stmts" },
  ],
  edgeCases: [
    { text: "Пойманное можно бросить снова: «You can also throw a caught exception again using the <code>throw</code> statement».", source: "ms-rethrow" },
    { text: "При перебросе добавляй контекст: «It's good coding practice to <b>add information to an exception that's rethrown</b> to provide more information when debugging».", source: "ms-rethrow" },
    { text: "<code>throw e;</code> требует конвертируемости: «In a <code>throw e;</code> statement, the result of expression <code>e</code> must be implicitly convertible to <code>System.Exception</code>».", source: "ms-stmts" },
  ],

  misconceptions: [
    {
      wrong: "throw ex; и throw; внутри catch — одно и то же; логируй и перебрось через throw ex;",
      hook: 'Разница <b>критична</b> для диагностики. «Inside a <code>catch</code> block, use a <span class="hl">throw; statement to re-throw the exception that the catch block handles</span>». Отличие от <code>throw e;</code> — в стеке: «<span class="hl">throw; preserves the original stack trace of the exception, which is stored in the Exception.StackTrace property</span>. In contrast, <span class="hl">throw e; updates the StackTrace property of e</span>». То есть <code>throw e;</code> <b>переписывает</b> место падения на строку переброса — исходный кадр теряется. Третий путь — <b>обёртка</b>: бросить новое, передав пойманное как <code>innerException</code>, чтобы «<span class="hl">add information to an exception that\'s rethrown</span>». Дальше <b>пять разборов</b>: <code>throw;</code> как переброс того же, preserve vs update, обёртка через inner, потеря кадра Origin, и <b>машинная панель</b> — жив ли метод-источник в <code>StackTrace</code> (реальный прогон: throw;→True, throw e;→False).',
      source: ["ms-stmts", "ms-rethrow"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "throw;", title: "throw; внутри catch перебрасывает ТО ЖЕ исключение",
      viewBox: "0 0 340 210", zones: RETH_ZONES,
      code: ["try { ProcessShapes(shapeAmount); }", "catch (Exception e)", "{ LogError(e, \"Shape processing failed.\"); throw; }"],
      scenes: [
        { codeLine: 1, out: "", caption: '<code>catch (Exception e)</code> ловит исключение — например, чтобы залогировать перед тем, как пустить дальше.', nodes: [{ id: "c", kind: "gate", at: { zone: "caught", row: 0 }, state: "fail", label: "catch (e)", detail: "поймал", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>throw;</code> <b>без операнда</b> — «a <span class="hl">throw; statement to re-throw the exception that the catch block handles</span>». Перебрасывается <b>то же самое</b> исключение.', nodes: [{ id: "c", kind: "gate", at: { zone: "caught", row: 0 }, state: "fail", label: "catch (e)", detail: "log" }, { id: "r", kind: "gate", at: { zone: "reth", row: 0 }, state: "ok", label: "throw;", detail: "тот же объект", accent: true }], edges: [{ id: "e1", from: "c", to: "r", accent: true }] },
        { codeLine: 2, out: "", caption: 'Типовой сценарий — «залогировать и пропустить»: <code>catch</code> добавляет запись в лог, <code>throw;</code> отдаёт ошибку вызывающему <span class="hl">нетронутой</span>.', nodes: [{ id: "c", kind: "gate", at: { zone: "caught", row: 0 }, state: "fail", label: "log(e)", detail: "побочный эффект" }, { id: "r", kind: "gate", at: { zone: "reth", row: 0 }, state: "ok", label: "throw;", detail: "дальше вверх", accent: true }], edges: [{ id: "e1", from: "c", to: "r" }] },
      ],
      explain: 'Переброс без операнда — базовый инструмент «поймать, что-то сделать, пустить дальше». «Inside a <code>catch</code> block, use a <span class="hl">throw; statement to re-throw the exception that the catch block handles</span>». То же и в reference по <code>try-catch</code>: «To re-throw a caught exception, use the <code>throw</code> statement». Смысл — не <b>обработать</b> (оставить приложение в известном состоянии ты не можешь/не хочешь), а вклиниться с побочным эффектом (лог, метрика, очистка) и пропустить исключение к тому, кто действительно его обработает. Ключевое — <code>throw;</code> отдаёт <b>тот же объект</b> с его состоянием, а не создаёт новый. Разница с <code>throw e;</code> — в следующем разборе.',
      sources: ["ms-stmts"],
    },
    {
      id: "s2", num: "02", kicker: "preserve vs update", title: "throw; сохраняет стек — throw e; переписывает его",
      viewBox: "0 0 340 210", zones: KEEPRESET_ZONES,
      code: ["catch (Exception e) { throw; }     // StackTrace: место ИСХОДНОГО броска", "catch (Exception e) { throw e; }   // StackTrace: место ЭТОЙ строки", "// один и тот же e, но StackTrace разный"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>throw;</code> — «<span class="hl">preserves the original stack trace of the exception</span>, which is stored in the <code>Exception.StackTrace</code> property». Стек указывает на <b>настоящее</b> место падения.', nodes: [{ id: "k", kind: "gate", at: { zone: "keep", row: 0 }, state: "ok", label: "throw;", detail: "стек ИСХОДНЫЙ", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>throw e;</code> — «In contrast, <span class="hl">throw e; updates the StackTrace property of e</span>». Стек <b>переписывается</b> на строку с <code>throw e;</code>.', nodes: [{ id: "k", kind: "gate", at: { zone: "keep", row: 0 }, state: "ok", label: "throw;", detail: "стек ИСХОДНЫЙ" }, { id: "r", kind: "gate", at: { zone: "reset", row: 0 }, state: "fail", label: "throw e;", detail: "стек ПЕРЕЗАПИСАН", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Объект <code>e</code> — тот же, но <code>StackTrace</code> у него разный. <code>throw e;</code> прячет, <span class="hl">откуда реально</span> прилетела ошибка — диагностика ломается.', nodes: [{ id: "k", kind: "gate", at: { zone: "keep", row: 0 }, state: "ok", label: "throw;", detail: "видно источник", accent: true }, { id: "r", kind: "gate", at: { zone: "reset", row: 0 }, state: "fail", label: "throw e;", detail: "источник скрыт" }], edges: [] },
      ],
      explain: 'Это несущий нюанс раздела. «<span class="hl">throw; preserves the original stack trace of the exception, which is stored in the Exception.StackTrace property. In contrast, throw e; updates the StackTrace property of e</span>». Механически: <code>throw;</code> продолжает распространение <b>текущего</b> исключения, не трогая его снимок стека; <code>throw e;</code> расценивается как <b>новый</b> бросок объекта <code>e</code> из текущей точки, и рантайм перезаписывает <code>StackTrace</code> строкой <code>throw e;</code>. В логах это выглядит так, будто ошибка возникла в обработчике, а не в реальном месте сбоя, — самый частый способ «потерять» стек в проде. Правило простое: перебрасываешь то же исключение — пиши <code>throw;</code>, не <code>throw e;</code>.',
      sources: ["ms-stmts"],
    },
    {
      id: "s3", num: "03", kicker: "Обёртка", title: "Новое исключение + inner: контекст без потери причины",
      viewBox: "0 0 340 210", zones: WRAP_ZONES,
      code: ["catch (FileNotFoundException e)", "{", "    throw new FileNotFoundException(\"[data.txt not in c:\\\\temp directory]\", e);", "}"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Поймали низкоуровневое <code>FileNotFoundException</code>. Хотим добавить <b>доменный</b> контекст, не теряя причину.', nodes: [{ id: "i", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "FileNotFoundException", value: "исходная", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Бросаем <span class="hl">новое</span> исключение, передав пойманное <b>вторым аргументом</b> — оно ложится в <code>InnerException</code>. Причина сохранена.', nodes: [{ id: "i", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "исходная", value: "→ inner" }, { id: "w", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "new …(msg, e)", value: "+ контекст", accent: true }], edges: [{ id: "e1", from: "w", to: "i", accent: true }] },
        { codeLine: 2, out: "", caption: '«<span class="hl">add information to an exception that\'s rethrown</span> to provide more information when debugging» — обёртка добавляет смысл, <code>inner</code> хранит корень.', nodes: [{ id: "i", kind: "obj", at: { zone: "inner", row: 0 }, typeTag: "inner", value: "первопричина" }, { id: "w", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "внешнее", value: "доменный смысл", accent: true }], edges: [{ id: "e1", from: "w", to: "i" }] },
      ],
      explain: 'Третий путь между «пробросить как есть» и «проглотить» — <b>обернуть</b>. «You can also throw a caught exception again using the <code>throw</code> statement. It\'s good coding practice to <span class="hl">add information to an exception that\'s rethrown to provide more information when debugging</span>». Технически: бросаешь <b>новое</b> исключение доменного типа/сообщения, а пойманное передаёшь конструктору вторым параметром — оно становится <code>InnerException</code>. Так внешний слой получает осмысленную ошибку («не удалось загрузить конфиг»), а отладчик по цепочке <code>InnerException</code> доходит до корня («файл не найден»). Пример из доков: <code>throw new FileNotFoundException("[data.txt not in c:\\temp directory]", e)</code> — новый текст плюс исходное <code>e</code> как причина. Обёртка — не замена <code>throw;</code>, а осознанный перевод ошибки на уровень абстракции выше.',
      sources: ["ms-rethrow"],
    },
    {
      id: "s4", num: "04", kicker: "Потеря кадра", title: "throw e; стирает кадр Origin — «упало» будто в обработчике",
      viewBox: "0 0 340 276", zones: STACKW_ZONES,
      code: ["void Origin(){ throw new InvalidOperationException(); }  // ← настоящее место", "void Middle(){ try { Origin(); } catch (Exception e) { throw e; } }  // ← перезапишет сюда", "// в StackTrace верхнего catch кадра Origin больше НЕТ"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Реальный сбой — в <code>Origin</code>. Его кадр — самая ценная строка для отладки: где именно упало.', nodes: [{ id: "o", kind: "gate", at: { zone: "stackw", row: 0 }, state: "fail", label: "Origin()", detail: "настоящее место", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Middle</code> ловит и делает <code>throw e;</code>. Рантайм «<span class="hl">updates the StackTrace property of e</span>» — снимок стека начинается заново <b>отсюда</b>.', nodes: [{ id: "o", kind: "gate", at: { zone: "stackw", row: 0 }, state: "fail", label: "Origin()", detail: "стёрт из стека" }, { id: "m", kind: "gate", at: { zone: "stackw", row: 1 }, state: "fail", label: "Middle: throw e;", detail: "новый старт стека", accent: true }], edges: [{ id: "e1", from: "m", to: "o", accent: true }] },
        { codeLine: 2, out: "", caption: 'Наверху видно <code>Middle</code>, но <span class="hl">не</span> <code>Origin</code>. С <code>throw;</code> было бы наоборот — кадр <code>Origin</code> сохранён. Отсюда правило: <code>throw;</code>.', nodes: [{ id: "o", kind: "gate", at: { zone: "stackw", row: 0 }, state: "fail", label: "Origin", detail: "потерян (throw e;)" }, { id: "m", kind: "gate", at: { zone: "stackw", row: 1 }, state: "ok", label: "throw; сохранил бы Origin", detail: "правильный путь", accent: true }], edges: [] },
      ],
      explain: 'Наглядная цена <code>throw e;</code> — потеря кадра источника. Поскольку «<code>throw e;</code> <span class="hl">updates the StackTrace property of e</span>», снимок стека начинается со строки <code>throw e;</code> в <code>Middle</code>, а кадр <code>Origin</code> (где действительно бросили) в него не попадает. В проде это означает «стектрейс показывает обработчик, а не баг» — часы отладки не туда. С <code>throw;</code> «<span class="hl">preserves the original stack trace</span>», и <code>Origin</code> остаётся в трейсе. Детерминированный признак (следующий разбор): проверяем, <b>есть</b> ли подстрока <code>"Origin"</code> в <code>StackTrace</code>, — с <code>throw;</code> она есть, с <code>throw e;</code> её нет. Практика ревью: <code>throw ex;</code> внутри <code>catch</code> — почти всегда ошибка; либо <code>throw;</code>, либо осознанная обёртка с <code>innerException</code>.',
      sources: ["ms-stmts"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · жив ли Origin", title: "StackTrace.Contains(\"Origin\"): throw;→True, throw e;→False",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["void Origin() => throw new InvalidOperationException(\"x\");", "// перехватываем в Middle и перебрасываем двумя способами,", "// затем в верхнем catch: e.StackTrace.Contains(\"Origin\") ?"],
      predictAt: 1, predictQ: 'Метод <code>Origin</code> бросает; <code>Middle</code> ловит и перебрасывает — через <code>throw;</code> или <code>throw e;</code>. Останется ли имя <code>Origin</code> в <code>StackTrace</code> в каждом случае?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>throw;</code> «preserves the original stack trace» → кадр <code>Origin</code> <b>на месте</b>: <code>StackTrace.Contains("Origin") == True</code>.', nodes: [{ id: "t1", kind: "gate", at: { zone: "t1", row: 0 }, state: "ok", label: "throw;", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>throw e;</code> «updates the StackTrace property of e» → кадр <code>Origin</code> <b>стёрт</b>: <code>StackTrace.Contains("Origin") == False</code>.', nodes: [{ id: "t1", kind: "gate", at: { zone: "t1", row: 0 }, state: "ok", label: "throw;", detail: "True" }, { id: "t2", kind: "gate", at: { zone: "t2", row: 0 }, state: "fail", label: "throw e;", detail: "False", accent: true }], edges: [] },
        { codeLine: 2, out: "rethrow=True throwEx=False", caption: 'Панель: <span class="hl">rethrow=True throwEx=False</span> (реальный прогон) — детерминированный признак сохранения источника. <code>throw;</code> хранит кадр, <code>throw e;</code> теряет.', nodes: [{ id: "t1", kind: "gate", at: { zone: "t1", row: 0 }, state: "ok", label: "rethrow", detail: "True" }, { id: "t2", kind: "gate", at: { zone: "t2", row: 0 }, state: "fail", label: "throwEx", detail: "False", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — детерминированное доказательство сохранения стека <b>без</b> печати самого (нестабильного) трейса. Меряем булев признак: содержит ли <code>ex.StackTrace</code> имя метода-источника <code>"Origin"</code>. Реальный прогон печатает <code>rethrow=True throwEx=False</code>: с <code>throw;</code> кадр <code>Origin</code> сохранён (<code>True</code>), с <code>throw e;</code> — потерян (<code>False</code>). Это ровно то, что обещают доки: «<span class="hl">throw; preserves the original stack trace of the exception, which is stored in the Exception.StackTrace property. In contrast, throw e; updates the StackTrace property of e</span>». Итог раздела: внутри <code>catch</code> перебрасывай через <code>throw;</code> (сохранишь место сбоя) или оборачивай в новое с <code>innerException</code> (добавишь контекст, сохранив причину). <code>throw ex;</code> — почти всегда потеря диагностики.',
      sources: ["ms-stmts"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string r; void Origin(){ throw new InvalidOperationException("x"); } void Middle(){ try { Origin(); } catch (Exception) { throw; } } try { Middle(); } catch (Exception e) { r = e.StackTrace!.Contains("Origin").ToString(); } Console.WriteLine(r);</code> — что напечатает?',
      options: ["True", "False", "Origin", "(пусто)"], correctIndex: 0, xp: 10,
      okText: '<code>throw;</code> «<span class="hl">preserves the original stack trace</span>» — кадр метода-источника <code>Origin</code> остаётся в <code>StackTrace</code>. Проверка <code>Contains("Origin")</code> → <b>True</b>.',
      noText: 'Переброс через <code>throw;</code> не трогает снимок стека: место реального сбоя (<code>Origin</code>) сохранено. Реальный вывод: <b>True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string r; void Origin(){ throw new InvalidOperationException("x"); } void Middle(){ try { Origin(); } catch (Exception e) { throw e; } } try { Middle(); } catch (Exception e) { r = e.StackTrace!.Contains("Origin").ToString(); } Console.WriteLine(r);</code> — что напечатает?',
      options: ["False", "True", "Origin", "(исключение не поймано)"], correctIndex: 0, xp: 10,
      okText: '<code>throw e;</code> «<span class="hl">updates the StackTrace property of e</span>» — снимок стека переписывается со строки переброса; кадр <code>Origin</code> стёрт. <code>Contains("Origin")</code> → <b>False</b>.',
      noText: 'В отличие от <code>throw;</code>, <code>throw e;</code> сбрасывает <code>StackTrace</code> на текущую строку — источник теряется. Реальный вывод: <b>False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "False" }, sourceRefs: ["ms-stmts"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string Test(bool useThrowSemicolon){ void Origin(){ throw new InvalidOperationException("x"); } try { try { Origin(); } catch (Exception e) { if (useThrowSemicolon) throw; else throw e; } } catch (Exception e) { return e.StackTrace!.Contains("Origin").ToString(); } return "n/a"; } Console.WriteLine($"rethrow={Test(true)} throwEx={Test(false)}");</code> — что напечатает?',
      options: ["rethrow=True throwEx=False", "rethrow=False throwEx=True", "rethrow=True throwEx=True", "rethrow=False throwEx=False"], correctIndex: 0, xp: 10,
      okText: 'Один источник, два способа переброса: <code>throw;</code> хранит кадр <code>Origin</code> (True), <code>throw e;</code> его теряет (False). «throw; preserves… throw e; updates the StackTrace». Печать: <b>rethrow=True throwEx=False</b>.',
      noText: '<code>throw;</code> сохраняет стек, <code>throw e;</code> переписывает — признак <code>Contains("Origin")</code> различает их. Реальный вывод: <b>rethrow=True throwEx=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "rethrow=True throwEx=False" }, sourceRefs: ["ms-stmts"],
    },
  ],

  takeaways: [
    { icon: "why", k: "throw;", v: '«Inside a <code>catch</code> block, use a <span class="hl">throw; statement to re-throw the exception that the catch block handles</span>» — перебрасывает ТОТ ЖЕ объект. Паттерн «залогировать и пропустить».' },
    { icon: "cost", k: "preserve vs update", v: '«<span class="hl">throw; preserves the original stack trace</span>… In contrast, <span class="hl">throw e; updates the StackTrace property of e</span>». Признак сохранения (замер): rethrow=True throwEx=False.' },
    { icon: "avoid", k: "throw ex; = потеря", v: '<code>throw ex;</code> стирает кадр источника — «упало будто в обработчике». Либо <code>throw;</code>, либо обёртка <code>throw new …(msg, e)</code> с <code>innerException</code> — «add information to an exception that\'s rethrown».' },
  ],

  foot: 'урок · <b>throw; vs throw ex;</b> · 5 анимир. разборов · панель Contains("Origin") · дизайн <b>mid</b>',
};
