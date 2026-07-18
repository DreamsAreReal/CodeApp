/**
 * Lesson: Интерфейсы — explicit-реализация и default interface methods (CS.S1.interfaces-dim) —
 * expert density, 5 animated deep-dives. The machine truth about interface dispatch: an EXPLICIT
 * implementation and a DEFAULT interface method live ONLY behind the interface reference (not on
 * the class's public surface); DIM (C# 8.0) lets you add a member to a shipped interface without
 * breaking existing implementers; and two interfaces with the same member name are disambiguated
 * by explicit implementation.
 *
 * SIGNATURE machine panel (s2): the interface-reference gate — the same object calls DIFFERENT
 * code through the class variable vs the interface variable (class-Hi vs Hi), a REAL run-csharp
 * measurement (evidence/F7/interfaces-dim-exec.txt), plus the CS1061 compile error proving a DIM
 * is not on the class instance.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn interfaces + explicit-interface-
 * implementation (fetch 2026-07-18) + GT-M3-s1.md:
 *   - every English quote is VERBATIM from those two Learn pages;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F7/interfaces-dim-exec.txt:
 *     "class-Hi Hi"; "working\nresting (default)"; "A B");
 *   - NO GT-M3 red flags: interfaces CAN have a method body (DIM, C# 8.0 + .NET Core 3.0 runtime);
 *     DIM/explicit callable ONLY via the interface reference (not on the class instance); explicit
 *     has no access modifier (CS0106); DIM is not multiple inheritance of state (no instance fields).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.interfaces-dim/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the contract on the left, the two implementing types on the right.
const Z_CONTRACT: Zone = { id: "contract", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ИНТЕРФЕЙС · КОНТРАКТ", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "методы без тела*", subCls: "vz-zsub", subY: 47 };
const Z_IMPLS: Zone = { id: "impls", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "РЕАЛИЗАЦИИ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "class / struct", subCls: "vz-zsub heap", subY: 47 };
const CONTRACT_ZONES: Zone[] = [Z_CONTRACT, Z_IMPLS];

// s2 (SIGNATURE): the interface-reference gate — class var vs interface var over one object.
const Z_CLASSVAR: Zone = { id: "classvar", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "En e (класс)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "public Hello()", subCls: "vz-zsub", subY: 47 };
const Z_IFACEVAR: Zone = { id: "ifacevar", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IGreet i (интерфейс)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "explicit Hello()", subCls: "vz-zsub good", subY: 47 };
const GATE_ZONES: Zone[] = [Z_CLASSVAR, Z_IFACEVAR];

// s3: DIM version resilience — a shipped interface gains a member, old class still works.
const Z_IFACE: Zone = { id: "iface", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IWorker (обновлён)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Work() + Rest() default", subCls: "vz-zsub", subY: 47 };
const Z_OLDCLASS: Zone = { id: "oldclass", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Bee (старый класс)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "только Work()", subCls: "vz-zsub good", subY: 47 };
const DIM_ZONES: Zone[] = [Z_IFACE, Z_OLDCLASS];

// s4: two interfaces, same member name — explicit disambiguation.
const Z_IA: Zone = { id: "ia", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "IA.Id()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "explicit → A", subCls: "vz-zsub", subY: 47 };
const Z_IB: Zone = { id: "ib", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "IB.Id()", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "explicit → B", subCls: "vz-zsub heap", subY: 47 };
const DISAMBIG_ZONES: Zone[] = [Z_IA, Z_IB];

// s5: the boundaries — explicit no access modifier (CS0106), DIM needs the runtime.
// Tall zone (3 gate rows ~ 210u) needs a tall viewBox — engine rejects a zone shorter than its rows.
const Z_RULES: Zone = { id: "rules", x: 14, y: 34, w: 312, h: 258, cls: "vz-zone", label: "ГРАНИЦЫ КОНТРАКТА", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "что запрещено / что нужно", subCls: "vz-zsub", subY: 47 };
const RULES_ZONES: Zone[] = [Z_RULES];

export const interfacesDim: LessonData = {
  id: "CS.S1.interfaces-dim",
  track: "CS",
  section: "CS.S1",
  module: "S1.6",
  lang: "csharp",
  title: "Интерфейсы: explicit-реализация и DIM",
  kicker: "C# вглубь · S1 · диспетчер контракта",
  home: { subtitle: "explicit vs implicit, default interface methods", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1.classes-virtual-dispatch"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-iface", kind: "doc", org: "Microsoft Learn", title: "Interfaces (C# fundamentals)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces", date: "2026-04-10" },
    { id: "ms-explicit", kind: "doc", org: "Microsoft Learn", title: "Explicit Interface Implementation (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation", date: "2021-03-24" },
    { id: "ms-dim", kind: "doc", org: "Microsoft Learn", title: "Default interface methods — safely update interfaces (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions", date: "2024-11-01" },
  ],

  spec: [
    { text: "«An explicit interface implementation is a class member that is only called through the specified interface… neither are available directly on the class.»", source: "ms-explicit" },
  ],
  edgeCases: [
    { text: "Explicit-реализация <b>не имеет модификатора доступа</b>: указание <code>public</code> → ошибка <span class=\"hl\">CS0106</span>. Она доступна только через ссылку интерфейса.", source: "ms-explicit" },
    { text: "DIM (default interface method) — тело метода в интерфейсе, <b>C# 8.0</b>; требует поддержки рантайма (<b>.NET Core 3.0+</b>) — не чисто компиляторная фича.", source: "ms-dim" },
    { text: "Интерфейс не содержит <b>instance-полей</b>/instance-конструкторов/финализаторов; члены <code>public</code> по умолчанию. DIM ≠ множественное наследование состояния.", source: "ms-iface" },
  ],

  misconceptions: [
    {
      wrong: "интерфейс не может иметь тело метода, а default-метод можно вызвать прямо на экземпляре",
      hook: 'Две ложные интуиции. Первая — «<span class="wrong">интерфейс не может иметь тело метода</span>»: с <b>C# 8.0</b> может — это default interface method (DIM). Вторая — «<span class="wrong">default-метод виден на экземпляре класса</span>»: нет, и explicit, и DIM живут <b>только за ссылкой интерфейса</b> — «that method is only accessible through a reference of the interface type». Один объект через <code>класс</code>-переменную и через <code>интерфейс</code>-переменную зовёт <span class="hl">разный код</span>. Ниже <b>пять разборов</b>: контракт, <b>машинная панель</b> гейта интерфейс-ссылки (реально снятое <code>class-Hi Hi</code> + CS1061), DIM как версионирование, дизамбигуация двух интерфейсов и границы.',
      source: "ms-explicit",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Контракт · множественная реализация", title: "Интерфейс — контракт, а не наследование класса",
      viewBox: "0 0 340 210", zones: CONTRACT_ZONES,
      code: ["interface ILogger { void Log(string m); string Name { get; } }", "class ConsoleLogger : ILogger { ... }", "class FileLogger : ILogger { ... }"],
      scenes: [
        { codeLine: 0, caption: '<code>ILogger</code> — <b>контракт</b>: методы/свойства, которые тип обязан реализовать. Инстанцировать нельзя.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "ILogger", value: "Log/Name", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Два несвязанных класса реализуют <span class="hl">один</span> контракт — так C# заменяет множественное наследование классов.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "ILogger", value: "Log/Name" }, { id: "cl", kind: "obj", at: { zone: "impls", row: 0 }, typeTag: "ConsoleLogger", value: "→ ILogger", accent: true }], edges: [{ id: "e1", from: "cl", to: "c", accent: true }] },
        { codeLine: 2, caption: 'Класс может реализовать <b>несколько</b> интерфейсов (через запятую), но наследует только один базовый класс.', nodes: [{ id: "c", kind: "obj", at: { zone: "contract", row: 0 }, typeTag: "ILogger", value: "Log/Name" }, { id: "cl", kind: "obj", at: { zone: "impls", row: 0 }, typeTag: "ConsoleLogger", value: "→ ILogger" }, { id: "fl", kind: "obj", at: { zone: "impls", row: 1 }, typeTag: "FileLogger", value: "→ ILogger", accent: true }], edges: [{ id: "e1", from: "cl", to: "c" }, { id: "e2", from: "fl", to: "c", accent: true }] },
      ],
      explain: 'Интерфейс — контракт, а не наследование: «An interface defines a <b>contract</b>: a group of related methods, properties, events, and indexers that a class or struct must implement. Interfaces let a single type <span class="hl">implement multiple contracts</span>, which is important because C# doesn\'t support multiple inheritance of classes». Любой класс/структура, реализующий контракт, обязан дать все члены; инстанцировать интерфейс нельзя. Ключевая асимметрия: «A class can inherit from only one base class but can <b>implement multiple interfaces</b>». Члены интерфейса <code>public</code> по умолчанию, instance-полей в нём нет.',
      sources: ["ms-iface"],
    },
    {
      id: "s2", num: "02", kicker: "Машинная панель · гейт интерфейс-ссылки", title: "Один объект, два маршрута: класс vs интерфейс",
      viewBox: "0 0 340 214", zones: GATE_ZONES,
      code: ["interface IGreet { string Hello(); }", "class En : IGreet { string IGreet.Hello() => \"Hi\";  // explicit", "                     public string Hello() => \"class-Hi\"; }", "var e = new En(); IGreet i = e;   // один объект, две переменные"],
      predictAt: 3, predictQ: 'У <code>En</code> есть <b>explicit</b> <code>IGreet.Hello()</code>=\"Hi\" и <b>public</b> <code>Hello()</code>=\"class-Hi\". Что даст <code>e.Hello()</code> и <code>i.Hello()</code>?', console: true,
      scenes: [
        { codeLine: 3, out: "", caption: 'Один объект <code>En</code>, две переменные: <b>e</b> типа класса, <b>i</b> типа интерфейса — смотрят на <span class="hl">один</span> экземпляр.', nodes: [{ id: "e", kind: "ref", at: { zone: "classvar", row: 0 }, name: "e : En", value: "→ obj" }, { id: "i", kind: "ref", at: { zone: "ifacevar", row: 0 }, name: "i : IGreet", value: "→ obj", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>e.Hello()</code> зовёт <b>public</b> метод класса → <code>class-Hi</code>. Explicit-реализация с этой стороны <span class="hl">не видна</span>.', nodes: [{ id: "e", kind: "ref", at: { zone: "classvar", row: 0 }, name: "e : En", value: "→ obj" }, { id: "ce", kind: "gate", at: { zone: "classvar", row: 1 }, state: "ok", label: "e.Hello()", detail: "class-Hi" }], edges: [] },
        { codeLine: 3, out: "class-Hi Hi", caption: '<code>i.Hello()</code> через <b>интерфейс</b>-ссылку зовёт <span class="hl">explicit</span> <code>IGreet.Hello()</code> → <code>Hi</code>. Панель: <b>class-Hi Hi</b> (реальный прогон).', nodes: [{ id: "ce", kind: "gate", at: { zone: "classvar", row: 0 }, state: "ok", label: "e.Hello() →", detail: "class-Hi" }, { id: "ie", kind: "gate", at: { zone: "ifacevar", row: 0 }, state: "ok", label: "i.Hello() →", detail: "Hi" }], edges: [] },
      ],
      explain: 'Это машинная панель урока — гейт интерфейс-ссылки, снятый числом. Explicit-реализация живёт <b>только</b> за ссылкой интерфейса: «An explicit interface implementation is a class member that is <span class="hl">only called through the specified interface</span>… neither are available directly on the class». Прогон: <code>e.Hello()</code> (класс-переменная) → <code>class-Hi</code>, <code>i.Hello()</code> (интерфейс-переменная) → <code>Hi</code>. Тот же принцип у DIM: default-метод «is <b>only accessible through a reference of the interface type</b>. The inherited member doesn\'t appear as part of the public interface» — вызов <code>s.Info(...)</code> прямо на экземпляре даёт <b>CS1061</b> (проверено). Диспетчер контракта решает по типу переменной, а не по объекту.',
      sources: ["ms-explicit"],
    },
    {
      id: "s3", num: "03", kicker: "DIM · версионирование интерфейса", title: "Добавили метод в интерфейс — старый класс жив",
      viewBox: "0 0 340 210", zones: DIM_ZONES,
      code: ["interface IWorker { void Work(); void Rest() => Console.WriteLine(\"resting (default)\"); }", "class Bee : IWorker { public void Work() => Console.WriteLine(\"working\"); }", "IWorker w = new Bee();", "w.Work(); w.Rest();   // Rest() унаследован из интерфейса"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В интерфейс <b>добавили</b> <code>Rest()</code> — но с <span class="hl">телом по умолчанию</span> (DIM, C# 8.0).', nodes: [{ id: "if", kind: "obj", at: { zone: "iface", row: 0 }, typeTag: "IWorker", value: "Work + Rest()def", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Bee</code> написан ДО этого — реализует только <code>Work()</code>. И всё равно <b>компилируется</b>: <code>Rest()</code> унаследован.', nodes: [{ id: "if", kind: "obj", at: { zone: "iface", row: 0 }, typeTag: "IWorker", value: "Work + Rest()def" }, { id: "bee", kind: "obj", at: { zone: "oldclass", row: 0 }, typeTag: "Bee", value: "только Work()", accent: true }], edges: [{ id: "e", from: "bee", to: "if" }] },
        { codeLine: 3, out: "working\nresting (default)", caption: '<code>w.Work()</code> → <code>working</code> (Bee), <code>w.Rest()</code> → <code>resting (default)</code> (тело интерфейса). Реальный прогон.', nodes: [{ id: "w1", kind: "gate", at: { zone: "oldclass", row: 0 }, state: "ok", label: "w.Work()", detail: "working" }, { id: "w2", kind: "gate", at: { zone: "iface", row: 0 }, state: "ok", label: "w.Rest()", detail: "default" }], edges: [] },
      ],
      explain: 'Ради этого DIM и придуман: расширять уже выпущенный интерфейс, не ломая тех, кто его реализовал. «Default interface members let an interface provide a <b>method body</b>. Implementing types inherit the default implementation and can optionally override it». Прогон: <code>Bee</code> реализует лишь <code>Work()</code>, но <code>Rest()</code> (DIM) достаётся ему из интерфейса — <code>w.Rest()</code> печатает <code>resting (default)</code>. Важные границы: DIM появился в <b>C# 8.0</b> и <span class="hl">требует рантайма .NET Core 3.0+</span> (доработки CLR, не чистая компиляция). И это НЕ множественное наследование состояния — instance-поля в интерфейсе запрещены.',
      sources: ["ms-dim", "ms-iface"],
    },
    {
      id: "s4", num: "04", kicker: "Дизамбигуация · два интерфейса", title: "Одно имя в двух интерфейсах — explicit разводит",
      viewBox: "0 0 340 210", zones: DISAMBIG_ZONES,
      code: ["interface IA { string Id(); } interface IB { string Id(); }", "class C : IA, IB { string IA.Id() => \"A\"; string IB.Id() => \"B\"; }", "var c = new C();", "Console.WriteLine($\"{((IA)c).Id()} {((IB)c).Id()}\");"],
      predictAt: 2, predictQ: 'У <code>IA</code> и <code>IB</code> есть <code>Id()</code>; C даёт explicit <code>A</code> и <code>B</code>. Что даст <code>((IA)c).Id()</code> и <code>((IB)c).Id()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Два интерфейса объявляют <code>Id()</code> с одной сигнатурой. C даёт <span class="hl">две разные</span> explicit-реализации.', nodes: [{ id: "a", kind: "obj", at: { zone: "ia", row: 0 }, typeTag: "IA.Id()", value: "\"A\"", accent: true }, { id: "b", kind: "obj", at: { zone: "ib", row: 0 }, typeTag: "IB.Id()", value: "\"B\"", accent: true }], edges: [] },
        { codeLine: 3, out: "A B", caption: '<code>(IA)c</code> зовёт <code>IA.Id()</code>→<b>A</b>, <code>(IB)c</code> зовёт <code>IB.Id()</code>→<b>B</b>. Explicit развёл одноимённые члены (реальный прогон).', nodes: [{ id: "ga", kind: "gate", at: { zone: "ia", row: 0 }, state: "ok", label: "(IA)c.Id()", detail: "A" }, { id: "gb", kind: "gate", at: { zone: "ib", row: 0 }, state: "ok", label: "(IB)c.Id()", detail: "B" }], edges: [] },
      ],
      explain: 'Explicit нужен, когда «two interfaces declare members with the same name». Дословно повод: «If a class implements two interfaces that contain a member with the same signature, then implementing that member on the class will cause <b>both interfaces to use that member</b>» — а если нужны РАЗНЫЕ реализации, помечаешь их именем интерфейса. Прогон: <code>(IA)c.Id()</code> → <b>A</b>, <code>(IB)c.Id()</code> → <b>B</b>. «The class member <code>IControl.Paint</code> is only available through the <code>IControl</code> interface, and <code>ISurface.Paint</code> is only available through <code>ISurface</code>. Both method implementations are <span class="hl">separate</span>». Одна общая (implicit) реализация годится, только если устраивают оба контракта.',
      sources: ["ms-explicit"],
    },
    {
      id: "s5", num: "05", kicker: "Границы · что запрещено", title: "explicit без модификатора, DIM требует рантайм",
      viewBox: "0 0 340 300", zones: RULES_ZONES,
      code: ["public void IControl.Paint() {}   // ❌ CS0106 — модификатор запрещён", "interface I { int x; }            // ❌ instance-поля запрещены", "// DIM: C# 8.0 + .NET Core 3.0+ рантайм"],
      scenes: [
        { codeLine: 0, caption: 'Explicit-реализация <b>не имеет модификатора доступа</b>: <code>public IControl.Paint()</code> → <span class="hl">CS0106</span>.', nodes: [{ id: "r1", kind: "gate", at: { zone: "rules", row: 0 }, state: "fail", label: "public explicit", detail: "CS0106" }], edges: [] },
        { codeLine: 1, caption: 'Интерфейс не может иметь <b>instance-полей</b>/конструкторов/финализаторов — DIM это не меняет.', nodes: [{ id: "r1", kind: "gate", at: { zone: "rules", row: 0 }, state: "fail", label: "public explicit", detail: "CS0106" }, { id: "r2", kind: "gate", at: { zone: "rules", row: 1 }, state: "fail", label: "instance-поле", detail: "запрещено", accent: true }], edges: [] },
        { codeLine: 2, caption: 'DIM работает только на рантайме <span class="hl">.NET Core 3.0+</span> — это доработка CLR, а не чисто компиляторная фича.', nodes: [{ id: "r1", kind: "gate", at: { zone: "rules", row: 0 }, state: "fail", label: "public explicit", detail: "CS0106" }, { id: "r2", kind: "gate", at: { zone: "rules", row: 1 }, state: "fail", label: "instance-поле", detail: "запрещено" }, { id: "r3", kind: "gate", at: { zone: "rules", row: 2 }, state: "ok", label: "DIM", detail: ".NET Core 3.0+", accent: true }], edges: [] },
      ],
      explain: 'Границы контракта. Explicit-реализация <b>без модификатора доступа</b>: «An explicit interface implementation doesn\'t have an access modifier since it isn\'t accessible as a member of the type… If you specify an access modifier… you get compiler error <span class="hl">CS0106</span>». Интерфейс не может иметь instance-полей/конструкторов/финализаторов — поэтому DIM <b>не</b> даёт множественного наследования состояния (наследуется поведение, не поля). И DIM — не только про компилятор: она «requires runtime support» — CLR-доработки в <b>.NET Core 3.0+</b>. Всё это делает интерфейс мощным контрактом без побочных эффектов настоящего множественного наследования.',
      sources: ["ms-explicit", "ms-iface", "ms-dim"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IGreet{ string Hello(); } class En:IGreet{ string IGreet.Hello()=>"Hi"; public string Hello()=>"class-Hi"; }</code><br/><code>var e=new En(); IGreet i=e; Console.WriteLine($"{e.Hello()} {i.Hello()}");</code> — что напечатает?',
      options: ["class-Hi Hi", "Hi class-Hi", "class-Hi class-Hi", "Hi Hi"], correctIndex: 0, xp: 10,
      okText: '<code>e.Hello()</code> (класс-переменная) → <b>public</b> метод <code>class-Hi</code>. <code>i.Hello()</code> (интерфейс-ссылка) → <span class="hl">explicit</span> <code>IGreet.Hello()</code> = <code>Hi</code>. Один объект, разный маршрут.',
      noText: '«explicit interface implementation… is only called through the specified interface». Через класс — public (<b>class-Hi</b>), через интерфейс — explicit (<b>Hi</b>).',
      verify: { kind: "exec", run: "dotnet run", expect: "class-Hi Hi" }, sourceRefs: ["ms-explicit"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IWorker{ void Work(); void Rest()=>Console.WriteLine("resting (default)"); } class Bee:IWorker{ public void Work()=>Console.WriteLine("working"); }</code><br/><code>IWorker w=new Bee(); w.Work(); w.Rest();</code> — что напечатает (две строки)?',
      options: ["working\\nresting (default)", "working\\nworking", "resting (default)\\nworking", "ошибка компиляции"], correctIndex: 0, xp: 10,
      okText: '<code>Bee</code> реализует только <code>Work()</code>, а <code>Rest()</code> — <b>DIM</b> (default interface method), унаследован из интерфейса. <code>w.Work()</code>→working, <code>w.Rest()</code>→<span class="hl">resting (default)</span>.',
      noText: 'DIM (C# 8.0) даёт телу метода жить в интерфейсе — старый класс без <code>Rest()</code> всё равно работает. Реальный вывод: <b>working</b>, затем <b>resting (default)</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "working\nresting (default)" }, sourceRefs: ["ms-dim"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>interface IA{ string Id(); } interface IB{ string Id(); } class C:IA,IB{ string IA.Id()=>"A"; string IB.Id()=>"B"; }</code><br/><code>var c=new C(); Console.WriteLine($"{((IA)c).Id()} {((IB)c).Id()}");</code> — что напечатает?',
      options: ["A B", "B A", "A A", "B B"], correctIndex: 0, xp: 10,
      okText: 'Explicit разводит одноимённые члены: <code>(IA)c.Id()</code> зовёт <code>IA.Id()</code>→<b>A</b>, <code>(IB)c.Id()</code> зовёт <code>IB.Id()</code>→<b>B</b>. Реализации <span class="hl">раздельны</span>.',
      noText: '«Both method implementations are separate». Маршрут решает тип ссылки: через <code>IA</code> — <b>A</b>, через <code>IB</code> — <b>B</b>. Реальный вывод: <b>A B</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "A B" }, sourceRefs: ["ms-explicit"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Гейт интерфейс-ссылки", v: 'Explicit и DIM живут <span class="hl">только за ссылкой интерфейса</span>: <code>e.Hello()</code>→class-Hi, <code>i.Hello()</code>→Hi (один объект). Вызов DIM прямо на экземпляре — CS1061. Маршрут решает тип переменной.' },
    { icon: "cost", k: "DIM = версионирование", v: '<b>DIM</b> (C# 8.0, рантайм .NET Core 3.0+) даёт телу метода жить в интерфейсе — можно расширить выпущенный контракт, не ломая реализаторов (<code>Bee</code> без <code>Rest()</code> работает). Это не наследование состояния.' },
    { icon: "avoid", k: "Границы", v: 'Explicit — <b>без модификатора доступа</b> (<code>public</code>→CS0106). Два интерфейса с одним именем — <span class="hl">explicit разводит</span> (A vs B). Instance-полей в интерфейсе нет.' },
  ],

  foot: 'урок · <b>интерфейсы: explicit + DIM</b> · 5 анимир. разборов · панель гейта интерфейс-ссылки · дизайн <b>mid</b>',
};
