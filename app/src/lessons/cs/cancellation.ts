/**
 * Lesson: Cooperative cancellation — CancellationToken, ThrowIfCancellationRequested, linked tokens
 * (CS.S2.cancellation) — expert density, 5 animated deep-dives. Cancellation is COOPERATIVE: the
 * requester only signals; each listener notices and terminates gracefully — nothing kills the thread.
 * The final status is decided by HOW the delegate ends: just returning => RanToCompletion (NOT
 * Canceled), throwing OperationCanceledException with the matching token => Canceled. CancellationToken
 * is a lightweight VALUE type; IsCancellationRequested is one-way; CreateLinkedTokenSource joins tokens.
 *
 * SIGNATURE machine panel (s5): the library's status decision — after the delegate ends it compares:
 * plain return -> RanToCompletion; OperationCanceledException whose token matches AND
 * IsCancellationRequested -> Canceled; any other exception -> Faulted. A real run-csharp measurement
 * (return=RanToCompletion throwIf=Canceled). evidence/F11/cancellation-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Cancellation in Managed Threads + Task Cancellation
 * (fetch 2026-07-18) + GT-M4-s2.md S2.8 (exc:F13..F24):
 *   - card verify.expect is the REAL stdout of run-csharp (evidence/F11/cancellation-exec.txt:
 *     "return=RanToCompletion throwIf=Canceled"; "True False True"; "status=Canceled caught=TaskCanceledException");
 *   - NO GT-M4 myths: M-cancel-2 (cancel kills the thread like Thread.Abort) — no, cooperative;
 *     M-cancel-11 (return == Canceled) — no, return => RanToCompletion; M-token-12 (CancellationToken
 *     is a reference type) — no, value type (True).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.cancellation/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: cooperative — requester signals, listener notices.
const Z_REQ: Zone = { id: "req", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "запросчик · cts.Cancel()", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "только сигналит", subCls: "vz-zsub good", subY: 47 };
const Z_LIS: Zone = { id: "lis", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "слушатель · сам замечает", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "graceful terminate · поток не убит", subCls: "vz-zsub good", subY: 47 };
const COOP_ZONES: Zone[] = [Z_REQ, Z_LIS];

// s2: three framework types.
const Z_TYPES: Zone = { id: "types", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "три типа модели отмены", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "CTS (source) · CancellationToken (value) · OperationCanceledException", subCls: "vz-zsub", subY: 47 };
const TYPES_ZONES: Zone[] = [Z_TYPES];

// s3: return vs ThrowIfCancellationRequested → status.
const Z_RET: Zone = { id: "ret", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "просто return", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "RanToCompletion · НЕ Canceled", subCls: "vz-zsub heap", subY: 47 };
const Z_THROW: Zone = { id: "throw", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ThrowIfCancellationRequested", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "Canceled · верный способ", subCls: "vz-zsub good", subY: 47 };
const STATUS_ZONES: Zone[] = [Z_RET, Z_THROW];

// s4: consumer side + linked tokens.
const Z_CONS: Zone = { id: "cons", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "await Canceled-задачи", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "TaskCanceledException", subCls: "vz-zsub", subY: 47 };
const Z_LINK: Zone = { id: "link", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "linked token", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "любой источник отменяет", subCls: "vz-zsub good", subY: 47 };
const CONS_ZONES: Zone[] = [Z_CONS, Z_LINK];

// s5 (SIGNATURE): the library's status decision.
const Z_PLAIN: Zone = { id: "plain", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "return → RanToCompletion", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "«просто вышел»", subCls: "vz-zsub heap", subY: 47 };
const Z_OCE: Zone = { id: "oce", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "OCE (токен совпал) → Canceled", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "иначе → Faulted", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_PLAIN, Z_OCE];

export const cancellation: LessonData = {
  id: "CS.S2.cancellation",
  track: "CS",
  section: "CS.S2",
  module: "S2.8",
  lang: "csharp",
  title: "Кооперативная отмена: токен, ThrowIf, статусы",
  kicker: "C# вглубь · S2 · отмена не убивает поток",
  home: { subtitle: "CancellationToken, ThrowIfCancellationRequested, linked, статусы", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.tap-contract"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-cancel", kind: "doc", org: "Microsoft Learn", title: "Cancellation in Managed Threads", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads", date: "2023-05-24" },
    { id: "ms-task-cancel", kind: "doc", org: "Microsoft Learn", title: "Task Cancellation", url: "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation", date: "2023-05-24" },
  ],

  spec: [
    { text: "«The .NET Framework provides a unified model for cooperative cancellation of asynchronous or long-running synchronous operations.» <span class=\"ru-tr\">«.NET Framework предоставляет единую модель кооперативной отмены асинхронных или длительных синхронных операций.»</span> — модель отмены КООПЕРАТИВНА: фреймворк не убивает поток, слушатели сами останавливаются.", source: "ms-cancel" },
  ],
  edgeCases: [
    { text: 'Отмена <b>кооперативна</b>: только запрашивающий объект (CTS) выдаёт запрос; каждый слушатель <b>сам</b> замечает <code>IsCancellationRequested</code> и «gracefully terminate» <span class="ru-tr">«корректно завершается»</span>. Фреймворк <span class="hl">не прерывает</span> поток (это не <code>Thread.Abort</code>) и не гарантирует немедленную остановку.', source: "ms-cancel" },
    { text: "Токен <b>одноразовый</b>: после <code>IsCancellationRequested == true</code> его нельзя сбросить. <code>CancellationTokenSource</code> — <code>IDisposable</code> (нужен <code>Dispose</code>); <code>CancellationToken</code> — лёгкий <b>value type</b>, передаётся слушателям как параметр.", source: "ms-cancel" },
    { text: "Слушать можно тремя способами: polling (<code>IsCancellationRequested</code> — дёшево, для циклов), callback (<code>Register</code> — для заблокированных операций; колбэк синхронный), wait handle (<code>WaitHandle</code>). <code>CreateLinkedTokenSource</code> объединяет несколько токенов (linked CTS тоже <code>Dispose</code>).", source: "ms-cancel" },
  ],

  misconceptions: [
    {
      wrong: "отмена убивает поток как Thread.Abort; просто return из делегата = Canceled; CancellationToken — reference type",
      hook: 'Три ошибки об отмене. «<span class="wrong">отмена убивает поток</span>» — нет: она <span class="hl">кооперативна</span>, фреймворк лишь сигналит, слушатель сам корректно останавливается; поток не прерывается. «<span class="wrong">return = Canceled</span>» — нет: если делегат просто <code>return</code>, статус <code>RanToCompletion</code>; <code>Canceled</code> получается ТОЛЬКО через <code>ThrowIfCancellationRequested</code> (OperationCanceledException с совпавшим токеном). «<span class="wrong">CancellationToken — класс</span>» — нет, это <b>value type</b>. Ниже <b>пять разборов</b>: кооперативность, три типа, return vs ThrowIf → статус, потребитель + linked, и <b>машинная панель</b> — как библиотека выбирает финальный статус.',
      source: "ms-cancel",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Кооперативность", title: "Отмена сигналится, а не форсируется — поток не убивают",
      viewBox: "0 0 340 210", zones: COOP_ZONES,
      code: ["var cts = new CancellationTokenSource();", "cts.Cancel();                       // ЗАПРОСЧИК: только выдаёт сигнал", "while (!token.IsCancellationRequested) { ... }   // СЛУШАТЕЛЬ: сам замечает и выходит"],
      scenes: [
        { codeLine: 1, caption: 'Запросчик (<code>CancellationTokenSource</code>) <span class="hl">только выдаёт сигнал</span> — <code>Cancel()</code>. Он никого не прерывает.', nodes: [{ id: "r", kind: "gate", at: { zone: "req", row: 0 }, state: "ok", label: "cts.Cancel()", detail: "сигнал", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Слушатель <span class="hl">сам замечает</span> запрос (<code>IsCancellationRequested</code>) и корректно останавливается. Поток НЕ прерывается фреймворком.', nodes: [{ id: "r", kind: "gate", at: { zone: "req", row: 0 }, state: "ok", label: "Cancel()", detail: "сигнал" }, { id: "l", kind: "gate", at: { zone: "lis", row: 0 }, state: "ok", label: "listener", detail: "graceful stop", accent: true }], edges: [{ id: "e1", from: "r", to: "l" }] },
        { codeLine: 0, caption: 'Единая кооперативная модель (с .NET Framework 4). Отмена <b>не гарантирует</b> мгновенную остановку — задача может доработать текущий элемент.', nodes: [{ id: "r", kind: "gate", at: { zone: "req", row: 0 }, state: "ok", label: "requester", detail: "signal only" }, { id: "l", kind: "gate", at: { zone: "lis", row: 0 }, state: "ok", label: "listener", detail: "notices · stops", accent: true }], edges: [{ id: "e1", from: "r", to: "l" }] },
      ],
      explain: 'Модель отмены (verbatim + GT exc:F13/F24, M-cancel-2/3): «The .NET Framework provides a <span class="hl">unified model for cooperative cancellation</span> of asynchronous or long-running synchronous operations». <span class="ru-tr">«.NET Framework предоставляет единую модель кооперативной отмены асинхронных или длительных синхронных операций».</span> Ключевое слово — <b>cooperative</b>: только запрашивающий объект (<code>CancellationTokenSource</code>) выдаёт запрос через <code>Cancel()</code>; каждый слушатель <b>сам</b> замечает запрос и «gracefully terminate» <span class="ru-tr">«корректно завершается»</span>. Фреймворк <b>не убивает поток</b> — это не <code>Thread.Abort</code>, и <code>CancellationToken</code> сам по себе не прерывает синхронный код. Отмена также <b>не гарантирует</b> немедленную остановку: задача может обработать ещё элементы, прежде чем заметит сигнал. Практика: чтобы отмена работала, код обязан её проверять — сама по себе она ничего не остановит.',
      sources: ["ms-cancel"],
    },
    {
      id: "s2", num: "02", kicker: "Три типа", title: "CTS (source), CancellationToken (value), OperationCanceledException",
      viewBox: "0 0 340 210", zones: TYPES_ZONES,
      code: ["CancellationTokenSource cts = new();   // выдаёт запрос, IDisposable → Dispose", "CancellationToken token = cts.Token;   // лёгкий VALUE type, параметр слушателям", "token.ThrowIfCancellationRequested();  // слушатель бросает OperationCanceledException"],
      scenes: [
        { codeLine: 0, caption: '<code>CancellationTokenSource</code> — <span class="hl">источник</span>: создаёт токен, выдаёт запрос для всех копий, <code>IDisposable</code> (нужен <code>Dispose</code>).', nodes: [{ id: "cts", kind: "obj", at: { zone: "types", row: 0, col: 0 }, typeTag: "CancellationTokenSource", value: "source · IDisposable", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>CancellationToken</code> — лёгкий <span class="hl">value type</span>: копия из <code>cts.Token</code>, передаётся слушателям как параметр.', nodes: [{ id: "cts", kind: "obj", at: { zone: "types", row: 0, col: 0 }, typeTag: "CTS", value: "source" }, { id: "tok", kind: "obj", at: { zone: "types", row: 0, col: 1 }, typeTag: "CancellationToken", value: "value type", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>OperationCanceledException</code> — слушатели <b>бросают</b> его, приняв запрос (обычно через <code>ThrowIfCancellationRequested</code>).', nodes: [{ id: "tok", kind: "obj", at: { zone: "types", row: 0, col: 0 }, typeTag: "CancellationToken", value: "value" }, { id: "oce", kind: "obj", at: { zone: "types", row: 1, col: 0 }, typeTag: "OperationCanceledException", value: "бросает слушатель", accent: true }], edges: [] },
      ],
      explain: 'Три типа модели (GT exc:F14/F16/F17): <code>CancellationTokenSource</code> — создаёт токен и выдаёт запрос отмены сразу для всех его копий; реализует <code>IDisposable</code>, поэтому его нужно <code>Dispose</code> (или <code>using</code>). <code>CancellationToken</code> — лёгкий <b>value type</b> (не класс!), который передают слушателям как параметр метода; несёт <code>IsCancellationRequested</code>. <code>OperationCanceledException</code> — исключение, которое слушатель <b>бросает</b>, приняв запрос. Общий паттерн: создать <code>CTS</code> → передать <code>Token</code> в задачи/методы → обеспечить реакцию (polling / <code>Register</code>) → вызвать <code>Cancel()</code>. Отмена относится к <b>операциям</b>, токен <b>одноразовый</b>: после запроса его нельзя «разотменить».',
      sources: ["ms-cancel"],
    },
    {
      id: "s3", num: "03", kicker: "return vs ThrowIf", title: "return → RanToCompletion; ThrowIfCancellationRequested → Canceled",
      viewBox: "0 0 340 210", zones: STATUS_ZONES,
      code: ["Task.Run(() => { /* просто вышел */ });                 // → RanToCompletion", "Task.Run(() => token.ThrowIfCancellationRequested(), token);  // → Canceled", "// статус решает, КАК завершился делегат, а не факт запроса отмены"],
      predictAt: 1, predictQ: 'Токен уже отменён. Делегат A просто <code>return</code>; делегат B зовёт <code>ThrowIfCancellationRequested()</code>. Статусы задач?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Делегат <span class="hl">просто <code>return</code></span> (даже если отмену запросили) → статус <code>RanToCompletion</code>, НЕ <code>Canceled</code>.', nodes: [{ id: "r", kind: "gate", at: { zone: "ret", row: 0 }, state: "fail", label: "return", detail: "RanToCompletion", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Делегат зовёт <code>ThrowIfCancellationRequested()</code> — бросает <code>OperationCanceledException</code> с <b>совпавшим токеном</b> → статус <code>Canceled</code>.', nodes: [{ id: "r", kind: "gate", at: { zone: "ret", row: 0 }, state: "fail", label: "return", detail: "RanToCompletion" }, { id: "t", kind: "gate", at: { zone: "throw", row: 0 }, state: "ok", label: "ThrowIf...", detail: "Canceled", accent: true }], edges: [] },
        { codeLine: 2, out: "return=RanToCompletion throwIf=Canceled", caption: 'Печать: <b>return=RanToCompletion throwIf=Canceled</b> (реальный прогон). <code>Canceled</code> — это <span class="hl">осознанный бросок</span> с токеном, а не «отмену запросили».', nodes: [{ id: "r", kind: "gate", at: { zone: "ret", row: 0 }, state: "fail", label: "return", detail: "RanToCompletion" }, { id: "t", kind: "gate", at: { zone: "throw", row: 0 }, state: "ok", label: "ThrowIf", detail: "Canceled", accent: true }], edges: [] },
      ],
      explain: 'Как получается статус <code>Canceled</code> (GT exc:F19/F21/F22, M-cancel-11): просто <code>return</code> из делегата даёт <code>RanToCompletion</code> — даже если отмену запросили. Чтобы получить <code>Canceled</code>, делегат должен <b>бросить</b> <code>OperationCanceledException</code>, обычно через <code>token.ThrowIfCancellationRequested()</code>; библиотека ловит его, сверяет токен исключения со своим — если совпал и <code>IsCancellationRequested == true</code>, статус становится <code>Canceled</code>; иначе (другое исключение или несовпавший токен) — <code>Faulted</code> (обычная ошибка). Прогон: <code>return</code> → <b>RanToCompletion</b>, <code>ThrowIfCancellationRequested</code> → <b>Canceled</b>. Вывод: правильный способ завершить отменяемый делегат — <code>ThrowIfCancellationRequested</code>, а не тихий выход.',
      sources: ["ms-task-cancel"],
    },
    {
      id: "s4", num: "04", kicker: "Потребитель · linked", title: "await Canceled-задачи → TaskCanceledException; linked-токены",
      viewBox: "0 0 340 210", zones: CONS_ZONES,
      code: ["try { await canceledTask; } catch (OperationCanceledException e) { /* TaskCanceledException */ }", "var linked = CancellationTokenSource.CreateLinkedTokenSource(a.Token, b.Token);", "a.Cancel();   // → linked.Token тоже отменён (любой из источников)"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>await</code> Canceled-задачи бросает <code>TaskCanceledException</code> (наследник <code>OperationCanceledException</code>) — ловится обычным <code>catch</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "await Canceled", detail: "TaskCanceledException", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>CreateLinkedTokenSource</code> объединяет несколько токенов в один <span class="hl">связанный</span> (linked CTS тоже <code>Dispose</code>).', nodes: [{ id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "await Canceled", detail: "TaskCanceled" }, { id: "l", kind: "gate", at: { zone: "link", row: 0 }, state: "ok", label: "linked(a,b)", detail: "объединён", accent: true }], edges: [] },
        { codeLine: 2, out: "status=Canceled caught=TaskCanceledException", caption: 'Отмена <span class="hl">любого</span> источника отменяет linked-токен. Печать потребителя: <b>status=Canceled caught=TaskCanceledException</b> (реальный прогон).', nodes: [{ id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "caught", detail: "TaskCanceled" }, { id: "l", kind: "gate", at: { zone: "link", row: 0 }, state: "ok", label: "a.Cancel()", detail: "linked отменён", accent: true }], edges: [] },
      ],
      explain: 'Сторона потребителя (GT exc:F23/F20): ожидание <code>Canceled</code>-задачи через <code>await</code> бросает <code>OperationCanceledException</code> (точнее <code>TaskCanceledException</code> — его наследник), при <code>Wait</code> — обёрнутый в <code>AggregateException</code>. При этом <code>Task.Exception == null</code>: отмена — это не сбой. Прогон: <code>status=Canceled</code>, пойман <b>TaskCanceledException</b>. <b>Linked-токены</b>: <code>CancellationTokenSource.CreateLinkedTokenSource(t1, t2, ...)</code> создаёт источник, чей токен отменяется, как только отменён <b>любой</b> из входных (полезно объединить «таймаут ИЛИ пользователь нажал стоп»); связанный CTS тоже <code>IDisposable</code> — его нужно <code>Dispose</code>.',
      sources: ["ms-task-cancel", "ms-cancel"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · выбор статуса", title: "Как библиотека решает: RanToCompletion / Canceled / Faulted",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// после завершения делегата библиотека смотрит, КАК он закончился:", "return (без исключения)                         → RanToCompletion", "throw OCE, token == свой && IsCancellationRequested → Canceled;  иначе → Faulted"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Делегат вышел <span class="hl">без исключения</span> → <code>RanToCompletion</code>. Отмену «запросили» — не важно; важно, КАК завершился делегат.', nodes: [{ id: "p", kind: "obj", at: { zone: "plain", row: 0 }, typeTag: "return", value: "RanToCompletion", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Брошен <code>OperationCanceledException</code>, чей <span class="hl">токен совпал</span> со своим и <code>IsCancellationRequested</code> → <code>Canceled</code>. Любое иное исключение → <code>Faulted</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "plain", row: 0 }, typeTag: "return", value: "RanToCompletion" }, { id: "o", kind: "obj", at: { zone: "oce", row: 0 }, typeTag: "OCE · токен совпал", value: "Canceled", accent: true }], edges: [] },
        { codeLine: 0, out: "return=RanToCompletion throwIf=Canceled", caption: 'Панель: тот же отменённый токен → <b>два разных статуса</b> по способу выхода: <b>return=RanToCompletion throwIf=Canceled</b> (реальный прогон). Статус — следствие поведения делегата.', nodes: [{ id: "p", kind: "gate", at: { zone: "plain", row: 0 }, state: "fail", label: "return", detail: "RanToCompletion" }, { id: "o", kind: "gate", at: { zone: "oce", row: 0 }, state: "ok", label: "ThrowIf → OCE", detail: "Canceled", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — правило, по которому библиотека присваивает финальный статус отменяемой задаче. После того как делегат завершился, проверяется <b>как именно</b>: (1) вышел без исключения → <code>RanToCompletion</code> (даже если <code>Cancel()</code> был вызван); (2) бросил <code>OperationCanceledException</code>, чей <b>токен совпадает</b> с токеном задачи И <code>IsCancellationRequested == true</code> → <code>Canceled</code> (это «честная» кооперативная отмена, <code>Task.Exception == null</code>); (3) любое другое исключение (или OCE с чужим токеном) → <code>Faulted</code>. Прогон подтверждает развилку: один и тот же отменённый токен даёт <b>RanToCompletion</b> при тихом <code>return</code> и <b>Canceled</b> при <code>ThrowIfCancellationRequested</code>. Отсюда дисциплина: в отменяемом коде регулярно зови <code>ThrowIfCancellationRequested()</code> — только так задача получит статус <code>Canceled</code>, а не молчаливый успех.',
      sources: ["ms-task-cancel"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var cts = new CancellationTokenSource(); var ct = cts.Token; cts.Cancel(); var justReturn = Task.Run(() =&gt; { }); justReturn.Wait(); var threw = Task.Run(() =&gt; { ct.ThrowIfCancellationRequested(); }, ct); try { threw.Wait(); } catch { } Console.WriteLine($"return={justReturn.Status} throwIf={threw.Status}");</code> — что напечатает?',
      options: ["return=RanToCompletion throwIf=Canceled", "return=Canceled throwIf=Canceled", "return=RanToCompletion throwIf=Faulted", "return=Canceled throwIf=Faulted"], correctIndex: 0, xp: 10,
      okText: 'Просто <code>return</code> → <code>RanToCompletion</code> (даже при запрошенной отмене); <code>ThrowIfCancellationRequested</code> с совпавшим токеном → <code>Canceled</code>. Печать: <b>return=RanToCompletion throwIf=Canceled</b>.',
      noText: 'Статус <code>Canceled</code> даёт только осознанный бросок OCE, не тихий выход. Реальный вывод: <b>return=RanToCompletion throwIf=Canceled</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "return=RanToCompletion throwIf=Canceled" }, sourceRefs: ["ms-task-cancel"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var cts = new CancellationTokenSource(); var ct = cts.Token; bool before = ct.IsCancellationRequested; cts.Cancel(); bool after = ct.IsCancellationRequested; Console.WriteLine($"{typeof(CancellationToken).IsValueType} {before} {after}");</code> — что напечатает?',
      options: ["True False True", "False False True", "True True True", "True False False"], correctIndex: 0, xp: 10,
      okText: '<code>CancellationToken</code> — <span class="hl">value type</span> (True); <code>IsCancellationRequested</code> идёт <b>False → True</b> и обратно не сбрасывается (токен одноразовый). Печать: <b>True False True</b>.',
      noText: '<code>CancellationToken</code> — value type; запрос отмены необратим. Реальный вывод: <b>True False True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False True" }, sourceRefs: ["ms-cancel"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var cts = new CancellationTokenSource(); cts.Cancel(); var t = Task.Run(() =&gt; cts.Token.ThrowIfCancellationRequested(), cts.Token); string type; try { await t; type="none"; } catch (OperationCanceledException e){ type = e.GetType().Name; } Console.WriteLine($"status={t.Status} caught={type}");</code> — что напечатает?',
      options: ["status=Canceled caught=TaskCanceledException", "status=Faulted caught=OperationCanceledException", "status=Canceled caught=OperationCanceledException", "status=Faulted caught=TaskCanceledException"], correctIndex: 0, xp: 10,
      okText: 'Задача с брошенным OCE (токен совпал) → <code>Canceled</code>; <code>await</code> её бросает <code>TaskCanceledException</code> (наследник <code>OperationCanceledException</code>), ловится этим <code>catch</code>. Печать: <b>status=Canceled caught=TaskCanceledException</b>.',
      noText: 'Canceled-задача при <code>await</code> бросает <code>TaskCanceledException</code>. Реальный вывод: <b>status=Canceled caught=TaskCanceledException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "status=Canceled caught=TaskCanceledException" }, sourceRefs: ["ms-task-cancel"],
    },
  ],

  takeaways: [
    { icon: "why", k: "кооперативно", v: 'Отмена <span class="hl">сигналится, не форсируется</span>: <code>CTS.Cancel()</code> лишь просит, слушатель сам замечает <code>IsCancellationRequested</code> и корректно выходит. Поток НЕ убивают (не <code>Thread.Abort</code>).' },
    { icon: "avoid", k: "статус решает делегат", v: 'Просто <code>return</code> → <code>RanToCompletion</code> (замер), НЕ <code>Canceled</code>. <code>Canceled</code> — только через <code>ThrowIfCancellationRequested</code> (OCE с совпавшим токеном); иначе → <code>Faulted</code>.' },
    { icon: "cost", k: "типы + потребитель", v: '<code>CancellationToken</code> — <b>value type</b> (замер: True), токен одноразовый. <code>await</code> Canceled-задачи → <code>TaskCanceledException</code> (замер). <code>CreateLinkedTokenSource</code> — «любой источник отменяет»; всё <code>IDisposable</code>.' },
  ],

  foot: 'урок · <b>кооперативная отмена</b> · 5 анимир. разборов · панель выбора статуса задачи · дизайн <b>mid</b>',
};
