/**
 * Lesson: Exceptions — overview: the exception object, stack unwinding, first-chance
 * (CS.S9.exceptions-overview) — expert density, 5 animated deep-dives. An exception is a real
 * OBJECT deriving from System.Exception, thrown from where a problem occurred and passed UP the
 * call stack. When thrown, the CLR unwinds the stack looking for the first matching catch — an
 * exception thrown deep down can be caught far up. The exception object carries state (Message,
 * the call stack, InnerException). A first-chance notification fires the MOMENT the exception is
 * thrown, BEFORE the CLR searches for a handler.
 *
 * This is the DEDICATED S9 treatment (S9 = «Исключения»), complementing CS.S2.exceptions (which is
 * strictly about async: await-unwrap vs .Wait-wrap, WhenAll, Aggregate._Flatten). Zero overlap: S9
 * is the synchronous exception model — object, unwinding, filters, rethrow, custom, best-practices.
 *
 * SIGNATURE machine panel (s5): AppDomain.FirstChanceException fires at THROW time, before the catch
 * runs — REAL run-csharp measurement (this file's exec cards): "firstchance InvalidOperationException,
 * then caught". Order is deterministic: first-chance BEFORE catch.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the cited MS Learn page (csharp/fundamentals/exceptions,
 *     standard/exceptions), fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp: c1 "boom" (message
 *     of the caught exception thrown 3 frames down) · c2 "outer|inner" (Message + InnerException) ·
 *     c3 "IndexOutOfRangeException" (a base-class catch still catches the concrete derived type).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.exceptions-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what an exception is — an object deriving from System.Exception.
const Z_ERR: Zone = { id: "err", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕСТО ПРОБЛЕМЫ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "throw new …Exception", subCls: "vz-zsub heap", subY: 47 };
const Z_OBJ: Zone = { id: "obj", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОБЪЕКТ-ИСКЛЮЧЕНИЕ", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: ": System.Exception", subCls: "vz-zsub", subY: 47 };
const ERR_ZONES: Zone[] = [Z_ERR, Z_OBJ];

// s2: unwinding — throw deep down, caught far up. One tall zone = the call stack.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "СТЕК ВЫЗОВОВ · РАСКРУТКА ВВЕРХ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "CLR ищет catch снизу вверх", subCls: "vz-zsub", subY: 40 };
const STACK_ZONES: Zone[] = [Z_STACK];

// s3: catch matches by type (base catches derived).
const Z_THROWN: Zone = { id: "thrown", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "БРОШЕНО", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "конкретный тип", subCls: "vz-zsub heap", subY: 47 };
const Z_HAND: Zone = { id: "hand", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОБРАБОТЧИК", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "catch (BaseType)", subCls: "vz-zsub good", subY: 47 };
const HAND_ZONES: Zone[] = [Z_THROWN, Z_HAND];

// s4: the exception object carries state — Message / call-stack / InnerException.
const Z_STATE: Zone = { id: "state", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ОБЪЕКТ НЕСЁТ СОСТОЯНИЕ ОБ ОШИБКЕ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Message · StackTrace · InnerException", subCls: "vz-zsub", subY: 40 };
const OBJSTATE_ZONES: Zone[] = [Z_STATE];

// s5 (SIGNATURE): first-chance fires BEFORE the catch.
const Z_THROW: Zone = { id: "throw", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МОМЕНТ throw", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "1 · FirstChanceException", subCls: "vz-zsub heap", subY: 47 };
const Z_SEARCH: Zone = { id: "search", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПОИСК catch", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "2 · раскрутка · обработка", subCls: "vz-zsub good", subY: 47 };
const FC_ZONES: Zone[] = [Z_THROW, Z_SEARCH];

export const exceptionsOverview: LessonData = {
  id: "CS.S9.exceptions-overview",
  track: "CS",
  section: "CS.S9",
  module: "S9.1",
  lang: "csharp",
  title: "Исключения: объект, раскрутка стека, first-chance",
  kicker: "C# вглубь · S9 · модель исключения",
  home: { subtitle: "Объект : System.Exception, раскрутка вверх, first-chance", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-csexc", kind: "doc", org: "Microsoft Learn", title: "Exceptions and Exception Handling - C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/", date: "2021-05-14" },
    { id: "ms-stdexc", kind: "doc", org: "Microsoft Learn", title: "Handling and throwing exceptions in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/exceptions/", date: "2018-06-19" },
    { id: "ms-stmts", kind: "doc", org: "Microsoft Learn", title: "Exception-handling statements - throw, try-catch, try-finally, try-catch-finally", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements", date: "2026-01-16" },
  ],

  spec: [
    { text: "«In .NET, an exception is an object that inherits from the System.Exception class. An exception is thrown from an area of code where a problem has occurred. The exception is passed up the stack until the application handles it or the program terminates.»", source: "ms-stdexc" },
    { text: "«When an exception is thrown, the CLR will unwind the stack, looking for a method with a catch block for the specific exception type, and it will execute the first such catch block that it finds.»", source: "ms-csexc" },
  ],
  edgeCases: [
    { text: "Исключение может бросить не тот метод, что ты вызвал напрямую: «an exception may be thrown not by a method that your code has called directly, but by another method further down in the call stack».", source: "ms-csexc" },
    { text: "Все исключения наследуют один корень: «Exceptions are types that all ultimately derive from <code>System.Exception</code>». Поэтому <code>catch (Exception)</code> ловит любое.", source: "ms-csexc" },
    { text: "Объект несёт диагностику: «Exception objects contain detailed information about the error, such as the <b>state of the call stack</b> and a text description of the error». Не находится ни один обработчик — «it will terminate the process».", source: "ms-csexc" },
  ],

  misconceptions: [
    {
      wrong: "исключение — это просто «код ошибки» / goto, который прыгает в ближайший catch того же метода",
      hook: 'Исключение — не флаг возврата, а <b>объект</b>: «<span class="hl">In .NET, an exception is an object that inherits from the System.Exception class</span>. An exception is thrown from an area of code where a problem has occurred. <span class="hl">The exception is passed up the stack until the application handles it or the program terminates</span>». И ловит его не обязательно текущий метод: «an exception may be thrown not by a method that your code has called directly, but by <span class="hl">another method further down in the call stack</span>». Механика — <b>раскрутка стека</b>: «When an exception is thrown, the CLR will <span class="hl">unwind the stack, looking for a method with a catch block for the specific exception type</span>, and it will execute the <span class="hl">first such catch block that it finds</span>». Дальше <b>пять разборов</b>: объект <code>: System.Exception</code>, раскрутка снизу вверх, ловля по типу (база ловит наследника), состояние объекта (Message/стек/Inner), и <b>машинная панель</b> — first-chance срабатывает <b>в момент throw</b>, до поиска обработчика (реальный прогон).',
      source: ["ms-stdexc", "ms-csexc"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что это", title: "Исключение — объект, наследник System.Exception",
      viewBox: "0 0 340 210", zones: ERR_ZONES,
      code: ["throw new InvalidOperationException(\"boom\");", "// это НЕ код возврата и НЕ goto —", "// это объект, унаследованный от System.Exception"],
      scenes: [
        { codeLine: 0, out: "", caption: 'В точке проблемы код делает <code>throw new …Exception(…)</code> — <span class="hl">создаёт объект</span>. «Exceptions are created by using the <code>throw</code> keyword».', nodes: [{ id: "t", kind: "gate", at: { zone: "err", row: 0 }, state: "fail", label: "throw new", detail: "проблема тут", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Это <b>объект</b>, а не флаг: «<span class="hl">an exception is an object that inherits from the System.Exception class</span>». У него есть тип, <code>Message</code>, стек.', nodes: [{ id: "t", kind: "gate", at: { zone: "err", row: 0 }, state: "fail", label: "throw new", detail: "проблема тут" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "InvalidOperationException", value: ": System.Exception", accent: true }], edges: [{ id: "e1", from: "t", to: "o", accent: true }] },
        { codeLine: 2, out: "", caption: 'Кто может бросить: «Exceptions can be generated by the <span class="hl">common language runtime (CLR)</span>, by .NET or third-party libraries, or by application code» — единая модель для всех источников.', nodes: [{ id: "t", kind: "gate", at: { zone: "err", row: 0 }, state: "fail", label: "throw", detail: "проблема" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "…Exception", value: ": System.Exception" }, { id: "src", kind: "chip", at: { zone: "err", row: 1 }, value: "CLR · библиотека · код", accent: true }], edges: [] },
      ],
      explain: 'Модель .NET: ошибка сигнализируется не возвратом кода, а <b>исключением-объектом</b>. «.NET provides a model for notifying applications of errors in a uniform way: <span class="hl">.NET operations indicate failure by throwing exceptions</span>». Конкретно: «<span class="hl">In .NET, an exception is an object that inherits from the System.Exception class</span>. An exception is thrown from an area of code where a problem has occurred». Преимущество перед кодами возврата: «Failures don\'t go unnoticed because if an exception is thrown and you don\'t handle it, the runtime <span class="hl">terminates your application</span>» — забыть проверить нельзя, в отличие от игнорируемого return-кода. Источник может быть любой: «Exceptions can be generated by the common language runtime (CLR), by .NET or third-party libraries, or by application code».',
      sources: ["ms-stdexc", "ms-csexc"],
    },
    {
      id: "s2", num: "02", kicker: "Раскрутка стека", title: "Брошено глубоко — поймано выше: CLR раскручивает стек",
      viewBox: "0 0 340 276", zones: STACK_ZONES,
      code: ["void A(){ try { B(); } catch (Exception e) { /* поймано ЗДЕСЬ */ } }", "void B(){ C(); }              // просто вызывает C — catch'а нет", "void C(){ throw new InvalidOperationException(); }  // бросок ГЛУБОКО"],
      scenes: [
        { codeLine: 2, out: "", caption: '<code>C</code> — самый глубокий кадр — бросает. У <code>C</code> нет <code>catch</code>. Исключение начинает <span class="hl">идти вверх</span> по стеку.', nodes: [{ id: "c", kind: "gate", at: { zone: "stack", row: 0, col: 0 }, state: "fail", label: "C() бросает", detail: "нет catch", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'CLR раскручивает кадр <code>C</code> и смотрит на вызвавший <code>B</code>: «the CLR looks at the <span class="hl">method that called the current method, and so on up the call stack</span>». У <code>B</code> тоже нет catch — дальше вверх.', nodes: [{ id: "c", kind: "gate", at: { zone: "stack", row: 0, col: 0 }, state: "fail", label: "C бросает", detail: "нет catch" }, { id: "b", kind: "gate", at: { zone: "stack", row: 1, col: 0 }, state: "fail", label: "B()", detail: "нет catch", accent: true }], edges: [{ id: "e1", from: "c", to: "b", accent: true }] },
        { codeLine: 0, out: "", caption: 'У <code>A</code> есть подходящий <code>catch</code> — <span class="hl">первый найденный</span> обработчик выполняется. Бросок из <code>C</code>, поимка в <code>A</code>: два кадра вверх.', nodes: [{ id: "c", kind: "gate", at: { zone: "stack", row: 0, col: 0 }, state: "fail", label: "C бросает", detail: "нет catch" }, { id: "b", kind: "gate", at: { zone: "stack", row: 1, col: 0 }, state: "fail", label: "B", detail: "нет catch" }, { id: "a", kind: "gate", at: { zone: "stack", row: 2, col: 0 }, state: "ok", label: "A() ловит", detail: "первый catch", accent: true }], edges: [{ id: "e1", from: "c", to: "b" }, { id: "e2", from: "b", to: "a", accent: true }] },
      ],
      explain: 'Ключевая механика: исключение не обязано ловиться там, где брошено. «In many cases, an exception may be thrown <span class="hl">not by a method that your code has called directly, but by another method further down in the call stack</span>». Что делает рантайм: «When an exception is thrown, the CLR will <span class="hl">unwind the stack, looking for a method with a catch block for the specific exception type</span>, and it will execute the <span class="hl">first such catch block that it finds</span>». Пошагово из reference: «the CLR looks at the method that called the current method, and so on up the call stack. If there\'s no compatible <code>catch</code> block, the CLR terminates the executing thread». Отсюда: бросок из <code>C</code> ловится в <code>A</code> через промежуточный <code>B</code> без единого <code>catch</code> в <code>B</code>. «If it finds no appropriate catch block anywhere in the call stack, it will <span class="hl">terminate the process</span>».',
      sources: ["ms-csexc", "ms-stmts"],
    },
    {
      id: "s3", num: "03", kicker: "Ловля по типу", title: "catch (BaseType) ловит конкретный наследник",
      viewBox: "0 0 340 210", zones: HAND_ZONES,
      code: ["int[] a = new int[2];", "try { Console.WriteLine(a[5]); }   // бросает IndexOutOfRangeException", "catch (SystemException e) { /* база ловит наследника */ }"],
      predictAt: 2, predictQ: 'Индексация за границей бросает <code>IndexOutOfRangeException</code>, а <code>catch</code> ловит <code>SystemException</code> (базу). Что напечатает <code>e.GetType().Name</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Индексация <code>a[5]</code> вне диапазона — рантайм бросает конкретный <code>IndexOutOfRangeException</code>. «Thrown by the runtime only when an array is indexed improperly».', nodes: [{ id: "t", kind: "obj", at: { zone: "thrown", row: 0 }, typeTag: "brошено", value: "IndexOutOfRangeException", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>catch (SystemException)</code> — база в иерархии. Все исключения «<span class="hl">ultimately derive from System.Exception</span>», значит наследник <b>подходит</b> под базовый catch.', nodes: [{ id: "t", kind: "obj", at: { zone: "thrown", row: 0 }, typeTag: "brошено", value: "IndexOutOfRange" }, { id: "h", kind: "gate", at: { zone: "hand", row: 0 }, state: "ok", label: "catch (SystemException)", detail: "матч по базе", accent: true }], edges: [{ id: "e1", from: "t", to: "h", accent: true }] },
        { codeLine: 2, out: "IndexOutOfRangeException", caption: 'Пойман базовым <code>catch</code>, но <b>динамический тип не меняется</b>: <code>e.GetType().Name</code> = <span class="hl">IndexOutOfRangeException</span> (реальный прогон). Ловля базой ≠ приведение к базе.', nodes: [{ id: "t", kind: "obj", at: { zone: "thrown", row: 0 }, typeTag: "brошено", value: "IndexOutOfRange" }, { id: "h", kind: "gate", at: { zone: "hand", row: 0 }, state: "ok", label: "e.GetType()", detail: "IndexOutOfRange", accent: true }], edges: [{ id: "e1", from: "t", to: "h" }] },
      ],
      explain: 'Матч <code>catch</code> — по <b>совместимости типа</b>, а не по точному равенству. «Use a <i>catch clause</i> to specify the <span class="hl">base type of exceptions you want to handle</span> in the corresponding <code>catch</code> block». Так как «Exceptions are types that all ultimately <span class="hl">derive from System.Exception</span>», <code>catch (SystemException)</code> — и тем более <code>catch (Exception)</code> — ловит любой производный тип. Но пойманный объект остаётся собой: его <code>GetType()</code> возвращает <b>реальный</b> брошенный тип (<code>IndexOutOfRangeException</code>), а не тип из <code>catch</code>. Практика: лови <b>конкретный</b> тип, который умеешь обработать; широкий <code>catch (Exception)</code> — только если реально можешь оставить приложение в известном состоянии («Don\'t catch an exception unless you can handle it and leave the application in a known state»).',
      sources: ["ms-csexc", "ms-stdexc", "ms-stmts"],
    },
    {
      id: "s4", num: "04", kicker: "Состояние объекта", title: "Объект несёт Message, стек и InnerException",
      viewBox: "0 0 340 276", zones: OBJSTATE_ZONES,
      code: ["try { throw new InvalidOperationException(\"inner\"); }", "catch (Exception ex) { throw new ApplicationException(\"outer\", ex); }  // оборачиваем", "// у внешнего: Message=\"outer\", InnerException.Message=\"inner\""],
      predictAt: 1, predictQ: 'Внутреннее бросили с «inner», обернули во внешнее «outer», передав первое как <code>innerException</code>. Что напечатает <code>$"{e.Message}|{e.InnerException?.Message}"</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Брошено <code>InvalidOperationException("inner")</code>. Объект несёт <b>диагностику</b>: «Exception objects contain <span class="hl">detailed information about the error</span>».', nodes: [{ id: "i", kind: "obj", at: { zone: "state", row: 0 }, typeTag: "inner: InvalidOperationException", value: "Message=\"inner\"", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Ловим и <span class="hl">оборачиваем</span>: <code>new ApplicationException("outer", ex)</code>. Второй аргумент кладёт первое в <code>InnerException</code> — цепочка причин.', nodes: [{ id: "i", kind: "obj", at: { zone: "state", row: 1 }, typeTag: "inner", value: "Message=\"inner\"" }, { id: "o", kind: "obj", at: { zone: "state", row: 0 }, typeTag: "outer: ApplicationException", value: "Message=\"outer\"", accent: true }], edges: [{ id: "e1", from: "o", to: "i", accent: true }] },
        { codeLine: 2, out: "outer|inner", caption: 'Печать <code>Message|InnerException.Message</code> = <span class="hl">outer|inner</span> (реальный прогон). Состояние ошибки — «the <b>state of the call stack</b> and a text description of the error» — живёт в объекте.', nodes: [{ id: "o", kind: "obj", at: { zone: "state", row: 0 }, typeTag: "outer", value: "Message=\"outer\"" }, { id: "i", kind: "obj", at: { zone: "state", row: 1 }, typeTag: "inner (Inner)", value: "Message=\"inner\"", accent: true }], edges: [{ id: "e1", from: "o", to: "i" }] },
      ],
      explain: 'Исключение — носитель <b>состояния об ошибке</b>, а не просто сигнал. «Exception objects contain <span class="hl">detailed information about the error, such as the state of the call stack and a text description of the error</span>». Текстовое описание — свойство <code>Message</code>; снимок стека на момент броска — <code>StackTrace</code>; а <code>InnerException</code> хранит <b>первопричину</b>, если ты обернул низкоуровневую ошибку в доменную (передав её вторым аргументом конструктора). Реальный прогон печатает <code>outer|inner</code>: внешнее исключение помнит своё сообщение и держит ссылку на внутреннее. Это позволяет ловить, добавлять контекст и перебрасывать, не теряя исходную причину — «If a <code>catch</code> block defines an exception variable, you can use it to <span class="hl">obtain more information about the type of exception</span> that occurred».',
      sources: ["ms-csexc"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · first-chance", title: "First-chance срабатывает в момент throw — до поиска catch",
      viewBox: "0 0 340 210", zones: FC_ZONES,
      code: ["AppDomain.CurrentDomain.FirstChanceException += (s,e) => log(\"firstchance\");", "try { throw new InvalidOperationException(\"x\"); }", "catch (Exception ex) { log(\"caught\"); }   // порядок: firstchance → caught"],
      predictAt: 1, predictQ: 'Подписан <code>FirstChanceException</code>; затем <code>throw</code> внутри <code>try</code>, ловим в <code>catch</code>. Что раньше — уведомление first-chance или тело <code>catch</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'В момент <code>throw</code> — <span class="hl">ещё до</span> поиска обработчика — рантайм поднимает <code>FirstChanceException</code>. Это «первый шанс» увидеть исключение.', nodes: [{ id: "th", kind: "gate", at: { zone: "throw", row: 0 }, state: "fail", label: "throw", detail: "1 · firstchance", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Только <b>после</b> уведомления CLR начинает раскрутку и ищет <code>catch</code> — «unwind the stack, looking for a method with a <code>catch</code> block». Обработка идёт <span class="hl">вторым</span> шагом.', nodes: [{ id: "th", kind: "gate", at: { zone: "throw", row: 0 }, state: "fail", label: "throw", detail: "1 · firstchance" }, { id: "s", kind: "gate", at: { zone: "search", row: 0 }, state: "ok", label: "поиск catch", detail: "2 · раскрутка", accent: true }], edges: [{ id: "e1", from: "th", to: "s", accent: true }] },
        { codeLine: 2, out: "firstchance:InvalidOperationException caught:InvalidOperationException", caption: 'Панель: <span class="hl">first-chance ПЕРЕД catch</span> (реальный прогон) — уведомление о броске всегда раньше выполнения обработчика. Один и тот же тип в обоих событиях.', nodes: [{ id: "th", kind: "gate", at: { zone: "throw", row: 0 }, state: "fail", label: "firstchance", detail: "InvalidOp · 1-й" }, { id: "s", kind: "gate", at: { zone: "search", row: 0 }, state: "ok", label: "caught", detail: "InvalidOp · 2-й", accent: true }], edges: [{ id: "e1", from: "th", to: "s" }] },
      ],
      explain: 'Машинная панель — временной порядок событий исключения, снятый событием <code>AppDomain.FirstChanceException</code>. Оно поднимается <b>в момент броска</b>, ещё до того как CLR начнёт искать обработчик: сначала «первый шанс» (диагностика/логи), только потом «When an exception is thrown, the CLR will <span class="hl">unwind the stack, looking for a method with a catch block for the specific exception type</span>». Реальный прогон печатает <code>firstchance:InvalidOperationException</code> раньше, чем <code>caught:InvalidOperationException</code> — детерминированный порядок: уведомление о броске → раскрутка/поиск → тело <code>catch</code>. Практический смысл: first-chance перехватывает <b>все</b> исключения (даже те, что будут обработаны) в точке возникновения, где стек ещё цел, — база для APM/трейсинга. Не находится ни один <code>catch</code> → «it will terminate the process».',
      sources: ["ms-csexc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>string log = ""; void C(){ throw new InvalidOperationException("boom"); } void B(){ C(); } void A(){ B(); } try { A(); } catch (InvalidOperationException e) { log = e.Message; } Console.WriteLine(log);</code> — что напечатает?',
      options: ["boom", "InvalidOperationException", "(пустая строка)", "A B C"], correctIndex: 0, xp: 10,
      okText: 'Бросок в <code>C</code> (3 кадра вниз) раскручивает стек через <code>B</code> без <code>catch</code> и ловится в <code>A</code>: «unwind the stack… execute the <span class="hl">first such catch block that it finds</span>». <code>e.Message</code> = <b>boom</b>.',
      noText: 'Исключение «passed up the stack until the application handles it»: брошено в <code>C</code>, поймано в <code>A</code>. <code>Message</code> сохраняется. Реальный вывод: <b>boom</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "boom" }, sourceRefs: ["ms-csexc"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>try { try { throw new InvalidOperationException("inner"); } catch (Exception ex) { throw new ApplicationException("outer", ex); } } catch (Exception e) { Console.WriteLine($"{e.Message}|{e.InnerException?.Message}"); }</code> — что напечатает?',
      options: ["outer|inner", "inner|outer", "outer|", "inner|"], correctIndex: 0, xp: 10,
      okText: 'Внутреннее (<code>"inner"</code>) обёрнуто во внешнее (<code>"outer"</code>) через второй аргумент — он кладёт причину в <code>InnerException</code>. Объект несёт «detailed information about the error». Печать: <b>outer|inner</b>.',
      noText: '<code>e.Message</code> — сообщение внешнего (<b>outer</b>), <code>e.InnerException.Message</code> — сообщение обёрнутой причины (<b>inner</b>). Реальный вывод: <b>outer|inner</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "outer|inner" }, sourceRefs: ["ms-csexc"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>string r; try { int[] a = new int[2]; Console.WriteLine(a[5]); r="none"; } catch (SystemException e) { r = e.GetType().Name; } Console.WriteLine(r);</code> — что напечатает (какой тип у пойманного объекта)?',
      options: ["IndexOutOfRangeException", "SystemException", "Exception", "none"], correctIndex: 0, xp: 10,
      okText: 'Рантайм бросает конкретный <code>IndexOutOfRangeException</code>; базовый <code>catch (SystemException)</code> его ловит (все «<span class="hl">ultimately derive from System.Exception</span>»), но <code>GetType()</code> отдаёт <b>реальный</b> тип. Печать: <b>IndexOutOfRangeException</b>.',
      noText: 'Ловля базой — не приведение к базе: динамический тип объекта остаётся <code>IndexOutOfRangeException</code>. Реальный вывод: <b>IndexOutOfRangeException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "IndexOutOfRangeException" }, sourceRefs: ["ms-csexc", "ms-stdexc"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Объект, не флаг", v: '«<span class="hl">an exception is an object that inherits from the System.Exception class</span>… passed up the stack until the application handles it or the program terminates». Несёт <code>Message</code>, снимок стека, <code>InnerException</code> (замер: outer|inner).' },
    { icon: "cost", k: "Раскрутка", v: 'Брошено глубоко — поймано выше: CLR «<span class="hl">unwind the stack, looking for a method with a catch block</span>… the first such catch block that it finds». Нет обработчика нигде → «terminate the process» (замер: boom из C, поймано в A).' },
    { icon: "avoid", k: "Тип и first-chance", v: 'База ловит наследника, но <code>GetType()</code> — реальный тип (замер: IndexOutOfRangeException). <code>FirstChanceException</code> срабатывает <b>в момент throw</b>, до поиска catch (замер: firstchance перед caught).' },
  ],

  foot: 'урок · <b>исключения: модель</b> · 5 анимир. разборов · панель first-chance vs catch · дизайн <b>mid</b>',
};
