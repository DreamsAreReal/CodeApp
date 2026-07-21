/**
 * Lesson: Custom exceptions — deriving from Exception (CS.S9.custom-exceptions) — expert density, 5
 * animated deep-dives. When no predefined exception fits, derive your own class from Exception; end
 * the class name with "Exception"; implement the three common constructors (parameterless, message,
 * message+inner). A custom type participates in the hierarchy — a base custom type catches its
 * derived custom types. When to throw: the method can't complete its function, an invalid object
 * state, or an argument caused an exception (then wrap via innerException). Add properties only when
 * useful, and override ToString() if you do.
 *
 * SIGNATURE machine panel (s5): a custom nested exception really IS an Exception in the hierarchy —
 * a base custom catch catches the derived custom exception, and its GetType().Name is the derived
 * type. REAL run-csharp measurement (this file's exec cards): "NotFoundException".
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from standard/exceptions/how-to-create-user-defined-exceptions
 *     and csharp/fundamentals/exceptions/creating-and-throwing-exceptions (fetched 2026-07-21);
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp with a NESTED custom
 *     exception class (not top-level static): c1 "EmployeeListNotFoundException|no list|True" (type +
 *     message + it is-a Exception) · c2 "NotFoundException" (base custom catch, real derived type) ·
 *     c3 "load failed|disk" (three-ctor wrap keeps inner message).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S9.custom-exceptions/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: derive from Exception when predefined ones don't fit.
const Z_PRE: Zone = { id: "pre", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ПРЕДОПРЕДЕЛЁННЫЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не подошли", subCls: "vz-zsub", subY: 47 };
const Z_OWN: Zone = { id: "own", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СВОЙ КЛАСС", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: ": Exception, …Exception", subCls: "vz-zsub good", subY: 47 };
const OWN_ZONES: Zone[] = [Z_PRE, Z_OWN];

// s2: the three common constructors.
const Z_CTORS: Zone = { id: "ctors", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ТРИ ОБЩИХ КОНСТРУКТОРА", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "() · (message) · (message, inner)", subCls: "vz-zsub", subY: 40 };
const CTORS_ZONES: Zone[] = [Z_CTORS];

// s3: when to throw — three conditions.
const Z_WHEN: Zone = { id: "when", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "КОГДА БРОСАТЬ", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "не выполнить · невалидное состояние · аргумент → wrap", subCls: "vz-zsub", subY: 40 };
const WHENT_ZONES: Zone[] = [Z_WHEN];

// s4: wrap via innerException.
const Z_ORIG: Zone = { id: "orig", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "исходная (низкоур.)", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "IndexOutOfRange…", subCls: "vz-zsub heap", subY: 47 };
const Z_DOMAIN: Zone = { id: "domain", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "доменная + inner", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "new …(msg, e)", subCls: "vz-zsub good", subY: 47 };
const WRAP2_ZONES: Zone[] = [Z_ORIG, Z_DOMAIN];

// s5 (SIGNATURE): custom type participates in the hierarchy.
const Z_BASE: Zone = { id: "base", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "catch (DomainException)", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "своя база", subCls: "vz-zsub good", subY: 47 };
const Z_DERIVED: Zone = { id: "derived", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "throw NotFoundException", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "свой наследник", subCls: "vz-zsub heap", subY: 47 };
const HIER_ZONES: Zone[] = [Z_BASE, Z_DERIVED];

export const customExceptions: LessonData = {
  id: "CS.S9.custom-exceptions",
  track: "CS",
  section: "CS.S9",
  module: "S9.5",
  lang: "csharp",
  title: "Пользовательские исключения: свой класс : Exception",
  kicker: "C# вглубь · S9 · свой тип исключения",
  home: { subtitle: "derive from Exception, три конструктора, когда бросать, wrap", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S9.exceptions-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-userdef", kind: "doc", org: "Microsoft Learn", title: "How to: Create User-Defined Exceptions", url: "https://learn.microsoft.com/en-us/dotnet/standard/exceptions/how-to-create-user-defined-exceptions", date: "2022-08-10" },
    { id: "ms-create", kind: "doc", org: "Microsoft Learn", title: "Creating and Throwing Exceptions - C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/creating-and-throwing-exceptions", date: "2023-10-31" },
  ],

  spec: [
    { text: "«if none of the predefined exceptions meet your needs, you can create your own exception class by deriving from the Exception class». <span class=\"ru-tr\">«если ни одно из предопределённых исключений вам не подходит, вы можете создать собственный класс исключения, унаследовав его от класса Exception».</span>", source: "ms-userdef" },
    { text: "«When creating your own exceptions, end the class name of the user-defined exception with the word \"Exception\", and implement the three common constructors». <span class=\"ru-tr\">«Создавая собственные исключения, завершайте имя класса пользовательского исключения словом \"Exception\" и реализуйте три общих конструктора».</span>", source: "ms-userdef" },
  ],
  edgeCases: [
    { text: "Три конструктора: «The derived classes should define at least three constructors: one parameterless constructor, one that sets the message property, and one that sets both the <code>Message</code> and <code>InnerException</code> properties». <span class=\"ru-tr\">«Производные классы должны определять минимум три конструктора: один без параметров, один, задающий свойство message, и один, задающий сразу свойства <code>Message</code> и <code>InnerException</code>».</span>", source: "ms-create" },
    { text: "Свойства — только полезные: «Add new properties to the exception class when the data they provide is useful to resolving the exception. If new properties are added to the derived exception class, <code>ToString()</code> should be overridden to return the added information». <span class=\"ru-tr\">«Добавляйте новые свойства в класс исключения, когда предоставляемые ими данные полезны для разрешения исключения. Если в производный класс исключения добавлены новые свойства, следует переопределить <code>ToString()</code>, чтобы возвращать добавленную информацию».</span>", source: "ms-create" },
    { text: "Не бросай базовые типы: «Don't throw <code>System.Exception</code>, <code>System.SystemException</code>, <code>System.NullReferenceException</code>, or <code>System.IndexOutOfRangeException</code> intentionally from your own source code». <span class=\"ru-tr\">«Не бросайте <code>System.Exception</code>, <code>System.SystemException</code>, <code>System.NullReferenceException</code> или <code>System.IndexOutOfRangeException</code> намеренно из собственного исходного кода».</span>", source: "ms-create" },
  ],

  misconceptions: [
    {
      wrong: "свой exception — это отдельная «магическая» сущность; достаточно class MyError без наследования от Exception",
      hook: 'Пользовательское исключение — обычный класс, <b>наследник</b> <code>Exception</code>. «if none of the predefined exceptions meet your needs, you can <span class="hl">create your own exception class by deriving from the Exception class</span>». <span class="ru-tr">«если ни одно из предопределённых исключений вам не подходит, вы можете создать собственный класс исключения, унаследовав его от класса Exception».</span> Есть конвенции: «When creating your own exceptions, <span class="hl">end the class name of the user-defined exception with the word "Exception"</span>, and implement the <span class="hl">three common constructors</span>» <span class="ru-tr">«Создавая собственные исключения, завершайте имя класса пользовательского исключения словом "Exception" и реализуйте три общих конструктора»</span> — «<span class="hl">one parameterless constructor, one that sets the message property, and one that sets both the Message and InnerException properties</span>». <span class="ru-tr">«один конструктор без параметров, один, задающий свойство message, и один, задающий сразу свойства Message и InnerException».</span> И он живёт в общей иерархии: базовый твой тип ловит производные твои типы. Дальше <b>пять разборов</b>: наследование <code>: Exception</code>, три конструктора, когда бросать, обёртка через <code>innerException</code>, и <b>машинная панель</b> — свой тип реально в иерархии: <code>catch</code> по своей базе ловит наследника (реальный прогон: NotFoundException).',
      source: ["ms-userdef", "ms-create"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Свой класс", title: "Нет подходящего — наследуйся от Exception",
      viewBox: "0 0 340 210", zones: OWN_ZONES,
      code: ["// предопределённые (ArgumentException, InvalidOperationException…) не подходят →", "public class EmployeeListNotFoundException : Exception", "{ /* … */ }   // имя оканчивается на \"Exception\""],
      scenes: [
        { codeLine: 0, out: "", caption: '.NET уже даёт иерархию: «.NET provides a hierarchy of exception classes <span class="hl">ultimately derived from the Exception base class</span>». <span class="ru-tr">«.NET предоставляет иерархию классов исключений, в конечном счёте производных от базового класса Exception».</span> Сначала ищи подходящий готовый.', nodes: [{ id: "p", kind: "obj", at: { zone: "pre", row: 0 }, typeTag: "Exception hierarchy", value: "готовые", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Если ни один не подходит — «<span class="hl">create your own exception class by deriving from the Exception class</span>». <span class="ru-tr">«создайте собственный класс исключения, унаследовав его от класса Exception».</span> Наследуешься от <code>Exception</code>.', nodes: [{ id: "p", kind: "obj", at: { zone: "pre", row: 0 }, typeTag: "готовые", value: "не подошли" }, { id: "o", kind: "obj", at: { zone: "own", row: 0 }, typeTag: "MyException : Exception", value: "свой", accent: true }], edges: [{ id: "e1", from: "o", to: "p", accent: true }] },
        { codeLine: 2, out: "", caption: 'Конвенция имени: «<span class="hl">end the class name of the user-defined exception with the word "Exception"</span>» <span class="ru-tr">«завершайте имя класса пользовательского исключения словом "Exception"»</span> — <code>EmployeeListNotFoundException</code>, не <code>EmployeeListError</code>.', nodes: [{ id: "o", kind: "obj", at: { zone: "own", row: 0 }, typeTag: "…Exception", value: "имя по конвенции", accent: true }], edges: [] },
      ],
      explain: 'Своё исключение — не отдельная сущность, а <b>класс в общей иерархии</b>. «.NET provides a hierarchy of exception classes ultimately derived from the <code>Exception</code> base class. However, <span class="hl">if none of the predefined exceptions meet your needs, you can create your own exception class by deriving from the Exception class</span>». <span class="ru-tr">«.NET предоставляет иерархию классов исключений, в конечном счёте производных от базового класса <code>Exception</code>. Однако если ни одно из предопределённых исключений вам не подходит, вы можете создать собственный класс исключения, унаследовав его от класса Exception».</span> Две конвенции сразу: имя «<span class="hl">end the class name of the user-defined exception with the word "Exception"</span>» <span class="ru-tr">«завершайте имя класса пользовательского исключения словом "Exception"»</span> (чтобы тип читался как исключение) и набор конструкторов (следующий разбор). Заметь: свой тип обязан наследовать <code>Exception</code> (или его потомка) — иначе его нельзя <code>throw</code> и он не участвует в <code>catch</code>-иерархии. Практика: не плоди свои типы там, где точно подходит <code>ArgumentException</code>/<code>InvalidOperationException</code>; свой — когда вызывающему полезно ловить <b>именно</b> твою доменную ошибку.',
      sources: ["ms-userdef", "ms-create"],
    },
    {
      id: "s2", num: "02", kicker: "Три конструктора", title: "() · (message) · (message, inner)",
      viewBox: "0 0 340 276", zones: CTORS_ZONES,
      code: ["public EmployeeListNotFoundException() { }", "public EmployeeListNotFoundException(string message) : base(message) { }", "public EmployeeListNotFoundException(string message, Exception inner) : base(message, inner) { }"],
      scenes: [
        { codeLine: 0, out: "", caption: '1 — <b>без параметров</b>: «one parameterless constructor». <span class="ru-tr">«один конструктор без параметров».</span> Базовый случай, когда сообщение по умолчанию.', nodes: [{ id: "c0", kind: "gate", at: { zone: "ctors", row: 0 }, state: "ok", label: "()", detail: "parameterless", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '2 — <b>(message)</b>: «one that <span class="hl">sets the message property</span>». <span class="ru-tr">«один, задающий свойство message».</span> Передаёт текст в <code>base(message)</code> → свойство <code>Message</code>.', nodes: [{ id: "c0", kind: "gate", at: { zone: "ctors", row: 0 }, state: "ok", label: "()", detail: "parameterless" }, { id: "c1", kind: "gate", at: { zone: "ctors", row: 1 }, state: "ok", label: "(message)", detail: "base(message)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '3 — <b>(message, inner)</b>: «one that sets both the <span class="hl">Message and InnerException properties</span>». <span class="ru-tr">«один, задающий сразу свойства Message и InnerException».</span> Для обёртки причины.', nodes: [{ id: "c0", kind: "gate", at: { zone: "ctors", row: 0 }, state: "ok", label: "()", detail: "parameterless" }, { id: "c1", kind: "gate", at: { zone: "ctors", row: 1 }, state: "ok", label: "(message)", detail: "Message" }, { id: "c2", kind: "gate", at: { zone: "ctors", row: 2 }, state: "ok", label: "(message, inner)", detail: "Message + Inner", accent: true }], edges: [] },
      ],
      explain: 'Три конструктора — не ритуал, а покрытие типовых сценариев вызова. «The derived classes should <span class="hl">define at least three constructors: one parameterless constructor, one that sets the message property, and one that sets both the Message and InnerException properties</span>». <span class="ru-tr">«Производные классы должны определять минимум три конструктора: один без параметров, один, задающий свойство message, и один, задающий сразу свойства Message и InnerException».</span> Каждый лишь делегирует в <code>base(...)</code>: <code>base()</code>, <code>base(message)</code>, <code>base(message, inner)</code> — так свойства <code>Message</code> и <code>InnerException</code> заполняет базовый <code>Exception</code>, а не ты руками. Наличие <code>(message, inner)</code> критично для обёртки: без него нельзя сохранить причину при переводе ошибки на доменный уровень. Пример из доков помечен <code>[Serializable]</code> — исторически для передачи между доменами/процессами; сам паттерн трёх конструкторов — обязательная база любого пользовательского исключения.',
      sources: ["ms-create", "ms-userdef"],
    },
    {
      id: "s3", num: "03", kicker: "Когда бросать", title: "Три условия: не выполнить · невалидное состояние · аргумент",
      viewBox: "0 0 340 276", zones: WHENT_ZONES,
      code: ["// 1: метод не может выполнить свою функцию (напр. невалидный параметр)", "// 2: недопустимый вызов по состоянию объекта → InvalidOperationException", "// 3: аргумент вызвал исключение → поймать и обернуть в ArgumentException"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Условие 1: «The method <span class="hl">can\'t complete its defined functionality</span>» <span class="ru-tr">«Метод не может выполнить свою определённую функциональность»</span> — например, параметру передали недопустимое значение.', nodes: [{ id: "c1", kind: "gate", at: { zone: "when", row: 0 }, state: "fail", label: "не может выполнить", detail: "invalid value", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Условие 2: «An <span class="hl">inappropriate call to an object is made, based on the object state</span>» <span class="ru-tr">«Совершён недопустимый вызов объекта исходя из состояния объекта»</span> → бросай <code>InvalidOperationException</code> (напр. запись в read-only).', nodes: [{ id: "c1", kind: "gate", at: { zone: "when", row: 0 }, state: "fail", label: "не может выполнить", detail: "invalid value" }, { id: "c2", kind: "gate", at: { zone: "when", row: 1 }, state: "fail", label: "невалидное состояние", detail: "InvalidOperation", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Условие 3: «When an <span class="hl">argument to a method causes an exception</span>» <span class="ru-tr">«Когда аргумент метода вызывает исключение»</span> → поймать исходное и «passed to the constructor… as the <code>InnerException</code> parameter». <span class="ru-tr">«передаётся в конструктор… как параметр <code>InnerException</code>».</span>', nodes: [{ id: "c1", kind: "gate", at: { zone: "when", row: 0 }, state: "fail", label: "не выполнить", detail: "1" }, { id: "c2", kind: "gate", at: { zone: "when", row: 1 }, state: "fail", label: "состояние", detail: "2" }, { id: "c3", kind: "gate", at: { zone: "when", row: 2 }, state: "fail", label: "аргумент → wrap", detail: "3 · inner", accent: true }], edges: [] },
      ],
      explain: 'Доки задают конкретные поводы для <code>throw</code>: «Programmers should throw exceptions when one or more of the following conditions are true: The method <span class="hl">can\'t complete its defined functionality</span>… An <span class="hl">inappropriate call to an object is made, based on the object state</span>… When an <span class="hl">argument to a method causes an exception</span>». <span class="ru-tr">«Программистам следует бросать исключения, когда истинно одно или несколько из следующих условий: Метод не может выполнить свою определённую функциональность… Совершён недопустимый вызов объекта исходя из состояния объекта… Когда аргумент метода вызывает исключение».</span> Третий случай прямо про обёртку: «the original exception should be caught and an <code>ArgumentException</code> instance should be created. The original exception should be <span class="hl">passed to the constructor of the ArgumentException as the InnerException parameter</span>». <span class="ru-tr">«исходное исключение следует поймать и создать экземпляр <code>ArgumentException</code>. Исходное исключение следует передать в конструктор ArgumentException как параметр InnerException».</span> И анти-паттерны: «<span class="hl">Don\'t use exceptions to change the flow of a program as part of ordinary execution</span>. Use exceptions to report and handle error conditions»; <span class="ru-tr">«Не используйте исключения для изменения хода программы в рамках обычного выполнения. Используйте исключения, чтобы сообщать об ошибочных ситуациях и обрабатывать их»;</span> «<span class="hl">Don\'t throw System.Exception, System.SystemException, System.NullReferenceException, or System.IndexOutOfRangeException intentionally</span>» <span class="ru-tr">«Не бросайте System.Exception, System.SystemException, System.NullReferenceException или System.IndexOutOfRangeException намеренно»</span> — бросай самый <b>конкретный</b> подходящий тип.',
      sources: ["ms-create"],
    },
    {
      id: "s4", num: "04", kicker: "Обёртка · inner", title: "Аргумент вызвал ошибку — оберни, передав исходное в inner",
      viewBox: "0 0 340 210", zones: WRAP2_ZONES,
      code: ["try { return array[index]; }", "catch (IndexOutOfRangeException e)", "{ throw new ArgumentOutOfRangeException(\"Parameter index is out of range.\", e); }"],
      predictAt: 1, predictQ: 'Индекс за границей бросил <code>IndexOutOfRangeException</code>; мы оборачиваем в <code>ArgumentOutOfRangeException(msg, e)</code>. Что окажется в <code>InnerException</code> внешнего?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Низкоуровневая ошибка: <code>array[index]</code> вне диапазона → <code>IndexOutOfRangeException</code>. Вызывающему это <b>не</b> говорит про его аргумент.', nodes: [{ id: "o", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "IndexOutOfRangeException", value: "исходная", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Ловим и <span class="hl">оборачиваем</span> в осмысленное <code>ArgumentOutOfRangeException</code>, передав <code>e</code> вторым аргументом → в <code>InnerException</code>.', nodes: [{ id: "o", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "исходная", value: "→ inner" }, { id: "d", kind: "obj", at: { zone: "domain", row: 0 }, typeTag: "ArgumentOutOfRangeException", value: "+ msg", accent: true }], edges: [{ id: "e1", from: "d", to: "o", accent: true }] },
        { codeLine: 2, out: "", caption: '«The original exception should be <span class="hl">passed to the constructor… as the InnerException parameter</span>» <span class="ru-tr">«Исходное исключение следует передать в конструктор… как параметр InnerException»</span> — корень сохранён, вызывающий видит осмысленный тип.', nodes: [{ id: "o", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "inner", value: "первопричина" }, { id: "d", kind: "obj", at: { zone: "domain", row: 0 }, typeTag: "внешнее", value: "про аргумент", accent: true }], edges: [{ id: "e1", from: "d", to: "o" }] },
      ],
      explain: 'Обёртка через <code>innerException</code> переводит ошибку на понятный уровень, не теряя корень. Из доков (третье условие броска): «the original exception should be caught and an <code>ArgumentException</code> instance should be created. The <span class="hl">original exception should be passed to the constructor of the ArgumentException as the InnerException parameter</span>». <span class="ru-tr">«исходное исключение следует поймать и создать экземпляр <code>ArgumentException</code>. Исходное исключение следует передать в конструктор ArgumentException как параметр InnerException».</span> Пример: <code>catch (IndexOutOfRangeException e) { throw new ArgumentOutOfRangeException("Parameter index is out of range.", e); }</code> — вызывающий получает осмысленное «индекс вне диапазона» (это <b>его</b> ошибка аргумента), а отладчик по <code>InnerException</code> доходит до <code>IndexOutOfRangeException</code>. Сообщение — «<span class="hl">This string should be set to explain the reason for the exception</span>», <span class="ru-tr">«Эту строку следует задать так, чтобы объяснить причину исключения»,</span> и «<span class="hl">Information that is sensitive to security shouldn\'t be put in the message text</span>». <span class="ru-tr">«Информацию, чувствительную с точки зрения безопасности, не следует помещать в текст сообщения».</span> Именно для этого у своего типа нужен конструктор <code>(message, inner)</code>.',
      sources: ["ms-create"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · иерархия", title: "Свой тип в иерархии: база ловит наследника",
      viewBox: "0 0 340 210", zones: HIER_ZONES,
      code: ["class DomainException : Exception { … }", "class NotFoundException : DomainException { … }   // свой наследник своего", "try { throw new NotFoundException(\"x\"); } catch (DomainException e) { /* e.GetType().Name ? */ }"],
      predictAt: 2, predictQ: 'Свой <code>NotFoundException : DomainException : Exception</code>. Брошен <code>NotFoundException</code>, ловим по своей базе <code>catch (DomainException)</code>. Что напечатает <code>e.GetType().Name</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Свои типы образуют <span class="hl">свою иерархию</span>: <code>NotFoundException</code> — наследник твоего же <code>DomainException</code> (тот — наследник <code>Exception</code>).', nodes: [{ id: "d", kind: "obj", at: { zone: "derived", row: 0 }, typeTag: "NotFoundException", value: ": DomainException", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>catch (DomainException)</code> — своя <b>база</b> — ловит своего наследника: точно как <code>SystemException</code> ловит <code>IndexOutOfRange</code>. Иерархия работает и для твоих типов.', nodes: [{ id: "d", kind: "obj", at: { zone: "derived", row: 0 }, typeTag: "NotFoundException", value: "брошено" }, { id: "b", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "catch (DomainException)", detail: "ловит наследника", accent: true }], edges: [{ id: "e1", from: "d", to: "b", accent: true }] },
        { codeLine: 2, out: "NotFoundException", caption: 'Панель: <span class="hl">NotFoundException</span> (реальный прогон) — пойман базой, но <code>GetType()</code> отдаёт <b>реальный</b> тип. Свой exception полноценно живёт в иерархии.', nodes: [{ id: "d", kind: "obj", at: { zone: "derived", row: 0 }, typeTag: "NotFoundException", value: "реальный тип" }, { id: "b", kind: "gate", at: { zone: "base", row: 0 }, state: "ok", label: "e.GetType().Name", detail: "NotFoundException", accent: true }], edges: [{ id: "e1", from: "d", to: "b" }] },
      ],
      explain: 'Машинная панель — доказательство, что пользовательский тип <b>не</b> магия, а полноправный участник иерархии. Своя цепочка <code>NotFoundException : DomainException : Exception</code> ведёт себя как встроенная: <code>catch</code> по своей базе <code>DomainException</code> ловит производный <code>NotFoundException</code> (ровно как <code>SystemException</code> ловит <code>IndexOutOfRangeException</code>), а <code>GetType().Name</code> пойманного объекта — <b>реальный</b> брошенный тип. Реальный прогон печатает <code>NotFoundException</code>. Практический смысл своей иерархии: объявляешь доменную базу (<code>DomainException</code>), вызывающий одним <code>catch</code> по базе перехватывает <b>все</b> доменные ошибки, а внутри различает по конкретному типу. Свойства добавляй лишь по надобности: «<span class="hl">Add new properties to the exception class when the data they provide is useful</span>… <code>ToString()</code> should be overridden to return the added information». <span class="ru-tr">«Добавляйте новые свойства в класс исключения, когда предоставляемые ими данные полезны… <code>ToString()</code> следует переопределить, чтобы возвращать добавленную информацию».</span>',
      sources: ["ms-userdef", "ms-create"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class EmployeeListNotFoundException : Exception { public EmployeeListNotFoundException() {} public EmployeeListNotFoundException(string message) : base(message) {} public EmployeeListNotFoundException(string message, Exception inner) : base(message, inner) {} } try { throw new EmployeeListNotFoundException("no list"); } catch (Exception e) { Console.WriteLine($"{e.GetType().Name}|{e.Message}|{e is Exception}"); }</code> — что напечатает?',
      options: ["EmployeeListNotFoundException|no list|True", "Exception|no list|True", "EmployeeListNotFoundException||True", "EmployeeListNotFoundException|no list|False"], correctIndex: 0, xp: 10,
      okText: 'Свой тип «derived from the <code>Exception</code> base class», <span class="ru-tr">«производный от базового класса <code>Exception</code>»,</span> ловится как <code>Exception</code> (<code>is Exception</code> → True), <code>base(message)</code> кладёт текст в <code>Message</code>, <code>GetType()</code> — реальный тип. Печать: <b>EmployeeListNotFoundException|no list|True</b>.',
      noText: 'Пользовательское исключение — наследник <code>Exception</code>: оно <i>is-a</i> Exception, несёт <code>Message</code> из <code>base(message)</code>, а его тип — заданный тобой. Реальный вывод: <b>EmployeeListNotFoundException|no list|True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "EmployeeListNotFoundException|no list|True" }, sourceRefs: ["ms-userdef", "ms-create"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class DomainException : Exception { public DomainException(string m) : base(m) {} } class NotFoundException : DomainException { public NotFoundException(string m) : base(m) {} } string r; try { throw new NotFoundException("x"); } catch (DomainException e) { r = e.GetType().Name; } Console.WriteLine(r);</code> — что напечатает?',
      options: ["NotFoundException", "DomainException", "Exception", "(не поймано)"], correctIndex: 0, xp: 10,
      okText: 'Своя иерархия <code>NotFoundException : DomainException : Exception</code>: <code>catch</code> по своей базе ловит производный, но <code>GetType()</code> отдаёт <b>реальный</b> тип. Печать: <b>NotFoundException</b>.',
      noText: 'Пользовательские типы участвуют в иерархии так же, как встроенные: база ловит наследника, тип объекта не меняется. Реальный вывод: <b>NotFoundException</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "NotFoundException" }, sourceRefs: ["ms-userdef"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class ConfigException : Exception { public ConfigException(string m, Exception inner) : base(m, inner) {} } string r; try { try { throw new InvalidOperationException("disk"); } catch (Exception e) { throw new ConfigException("load failed", e); } } catch (ConfigException e) { r = $"{e.Message}|{e.InnerException?.Message}"; } Console.WriteLine(r);</code> — что напечатает?',
      options: ["load failed|disk", "disk|load failed", "load failed|", "|disk"], correctIndex: 0, xp: 10,
      okText: 'Конструктор <code>(message, inner)</code> «sets both the <span class="hl">Message and InnerException properties</span>» <span class="ru-tr">«задаёт сразу свойства Message и InnerException»</span>: свой <code>Message</code> = «load failed», обёрнутая причина в <code>InnerException.Message</code> = «disk». Печать: <b>load failed|disk</b>.',
      noText: 'Третий конструктор передаёт причину в <code>base(m, inner)</code>: внешнее хранит своё сообщение и ссылку на inner. Реальный вывод: <b>load failed|disk</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "load failed|disk" }, sourceRefs: ["ms-create"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Свой = : Exception", v: '«<span class="hl">create your own exception class by deriving from the Exception class</span>», <span class="ru-tr">«создайте собственный класс исключения, унаследовав его от класса Exception»,</span> имя «<span class="hl">end… with the word "Exception"</span>». <span class="ru-tr">«завершайте… словом "Exception"».</span> Не отдельная сущность — класс в общей иерархии (замер: is Exception = True).' },
    { icon: "cost", k: "Три конструктора", v: '«<span class="hl">at least three constructors: one parameterless constructor, one that sets the message property, and one that sets both the Message and InnerException properties</span>». <span class="ru-tr">«минимум три конструктора: один без параметров, один, задающий свойство message, и один, задающий сразу свойства Message и InnerException».</span> Делегируют в <code>base(...)</code> (замер обёртки: load failed|disk).' },
    { icon: "avoid", k: "Когда/что бросать", v: 'Бросай при «can\'t complete… functionality», <span class="ru-tr">«не может выполнить… функциональность»,</span> невалидном состоянии, ошибке аргумента (→ wrap в inner). НЕ бросай <code>System.Exception/NullReferenceException/IndexOutOfRangeException</code> сам. База ловит наследника (замер: NotFoundException).' },
  ],

  foot: 'урок · <b>пользовательские исключения</b> · 5 анимир. разборов · панель своя иерархия · дизайн <b>mid</b>',
};
