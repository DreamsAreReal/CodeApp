/**
 * Lesson: Классы и виртуальная диспетчеризация (CS.S1.classes-virtual-dispatch) — expert
 * density, 5 animated deep-dives. What actually happens when you call a method through a
 * base reference: a VIRTUAL call routes through the object's method table (vtable) to the
 * most-derived override (run-time type), while a `new`-HIDDEN method is bound at compile
 * time by the reference's declared type — the single most common polymorphism trap.
 *
 * SIGNATURE machine panel (s3): the method-table lookup — `Base b = new Derived(); b.V()`
 * routes to Derived.V through the vtable, a real run-csharp measurement (Derived.V / Base.N),
 * evidence/F6/classes-virtual-dispatch-exec.txt.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../object-oriented/ and
 *     .../object-oriented/polymorphism (fetch-verified 2026-07-18);
 *   - every card's verify.expect is the REAL stdout of the backend run-csharp endpoint
 *     (evidence/F6/classes-virtual-dispatch-exec.txt: Derived.V/Base.N/Derived.N; Area=12.57).
 *
 * Loop: cards c1..c2 map to backend review items `CS.S1.classes-virtual-dispatch/c{1..2}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: base class beside its derived class (inheritance).
const Z_BASE: Zone = { id: "base", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "BASE CLASS", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "объявляет члены", subCls: "vz-zsub", subY: 47 };
const Z_DERIVED: Zone = { id: "derived", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "DERIVED CLASS", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "наследует + переопределяет", subCls: "vz-zsub heap", subY: 47 };
const INHERIT_ZONES: Zone[] = [Z_BASE, Z_DERIVED];

// s2/s4/s5: the call site (a base-typed variable) beside the object on the heap.
const Z_REF: Zone = { id: "ref", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ПЕРЕМЕННАЯ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "объявлена Base", subCls: "vz-zsub", subY: 47 };
const Z_OBJ: Zone = { id: "obj", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ОБЪЕКТ · КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "run-time тип Derived", subCls: "vz-zsub heap", subY: 47 };
const CALL_ZONES: Zone[] = [Z_REF, Z_OBJ];

// s3 (SIGNATURE): the method table — the call resolves by indexing the object's vtable slot.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВЫЗОВ · b.V()", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "b : Base", subCls: "vz-zsub", subY: 47 };
const Z_VTABLE: Zone = { id: "vtable", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "МЕТОД-ТАБЛИЦА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "vtable объекта Derived", subCls: "vz-zsub heap", subY: 47 };
const VTABLE_ZONES: Zone[] = [Z_CALL, Z_VTABLE];

export const classesVirtualDispatch: LessonData = {
  id: "CS.S1.classes-virtual-dispatch",
  track: "CS",
  section: "CS.S1",
  module: "S1.3",
  lang: "csharp",
  title: "Классы и виртуальная диспетчеризация",
  kicker: "C# вглубь · S1 · method table",
  home: { subtitle: "vtable, override, невиртуальный вызов", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-poly", kind: "doc", org: "Microsoft Learn", title: "Polymorphism (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism", date: "2025-10-13" },
    { id: "ms-oop", kind: "doc", org: "Microsoft Learn", title: "Classes, structs, and records (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/", date: "2025-04-17" },
    // Machine-level provenance for the vtable/method-table mechanic (s3): the term "vtable"
    // is not on the Learn C# fundamentals pages, so the SLOT-in-method-table mechanism is
    // sourced to the CLR's own Book of the Runtime (BOTR) + the ECMA-335 CLI standard.
    { id: "botr-method-slots", kind: "doc", org: "dotnet/runtime (Book of the Runtime)", title: "Method Descriptor — Method Slots (MethodTable slot / virtual dispatch)", url: "https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/method-descriptor.md", date: "2026-07-18" },
    { id: "ecma-335", kind: "spec", org: "ECMA International", title: "ECMA-335 CLI — I.8.10 Method definitions, inheritance, and overriding (virtual methods)", url: "https://ecma-international.org/publications-and-standards/standards/ecma-335/", date: "2012-06-01" },
  ],

  spec: [
    { text: "«At run-time, when client code calls the method, the CLR looks up the run-time type of the object, and invokes that override of the virtual method.»", source: "ms-poly" },
  ],
  edgeCases: [
    { text: "<code>new</code> прячет, а не переопределяет: вызванный метод зависит от <span class=\"hl\">compile-time</span> типа переменной, не от типа объекта. Тихая ловушка при рефакторинге.", source: "ms-poly" },
    { text: "Переопределить можно только <code>virtual</code>/<code>abstract</code> член, и обязательно через <code>override</code>. Без <code>virtual</code> в базе — компилятор потребует <code>new</code>.", source: "ms-poly" },
    { text: "Виртуальный вызов <b>внутри</b> метода базы уходит в derived-override (диспетчеризация по объекту) — источник сюрпризов, если база вызывает свой же virtual в конструкторе.", source: "ms-poly" },
  ],

  misconceptions: [
    {
      wrong: "override и new — просто два способа переопределить метод",
      hook: 'На вид <code>override</code> и <code>new</code> делают одно — «свою версию метода». На машинном уровне это <span class="wrong">две разные механики</span>. <code>override</code> — <b>виртуальный</b> вызов: «the CLR looks up the <b>run-time type</b> of the object, and invokes that override». <code>new</code> — <b>сокрытие</b>: «the method that gets called depends on the <span class="hl">compile-time type</span> of the variable». Один и тот же объект через <code>Base</code>-ссылку: <code>b.V()</code> → <b>Derived.V</b>, а <code>b.N()</code> → <b>Base.N</b> (реальный прогон). Дальше <b>пять разборов</b>: наследование, vtable-панель и <code>base</code>.',
      source: "ms-poly",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Наследование · члены базы", title: "Derived содержит все члены Base",
      viewBox: "0 0 340 210", zones: INHERIT_ZONES,
      code: ["class Base { public virtual string V(); }", "class Derived : Base { public override string V(); }"],
      scenes: [
        { codeLine: 0, caption: '<code>Base</code> объявляет член <code>V()</code> как <span class="hl">virtual</span> — «точку расширения».', nodes: [{ id: "bV", kind: "obj", at: { zone: "base", row: 0 }, typeTag: "Base", value: "virtual V()", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Derived : Base</code> <b>автоматически содержит</b> все public/protected/internal члены базы.', nodes: [{ id: "bV", kind: "obj", at: { zone: "base", row: 0 }, typeTag: "Base", value: "virtual V()" }, { id: "dInh", kind: "obj", at: { zone: "derived", row: 0 }, typeTag: "Derived", value: "унаследован V()", accent: true }], edges: [{ id: "e1", from: "dInh", to: "bV", accent: true }] },
        { codeLine: 1, caption: '<code>override</code> даёт <b>свою</b> реализацию V() — она встанет в метод-таблицу объекта поверх базовой.', nodes: [{ id: "bV", kind: "obj", at: { zone: "base", row: 0 }, typeTag: "Base", value: "virtual V()" }, { id: "dV", kind: "obj", at: { zone: "derived", row: 0 }, typeTag: "Derived", value: "override V()", accent: true }], edges: [{ id: "e1", from: "dV", to: "bV" }] },
      ],
      explain: 'Наследование даёт derived-классу все члены базы: «A class that derives from another class, called the <b>base class</b>, automatically contains all the public, protected, and internal members of the base class except its constructors and finalizers». Переопределять можно только помеченное <code>virtual</code>/<code>abstract</code>, и обязательно через <code>override</code>: «A derived class can override a base class member <span class="hl">only if</span> the base class member is declared as <code>virtual</code> or <code>abstract</code>. The derived member must use the <code>override</code> keyword». Так строится полиморфизм: «every type is polymorphic because all types… inherit from <code>Object</code>».',
      sources: ["ms-oop", "ms-poly"],
    },
    {
      id: "s2", num: "02", kicker: "override · run-time дисп.", title: "Base-ссылка вызывает Derived-override",
      viewBox: "0 0 340 210", zones: CALL_ZONES,
      code: ["Base b = new Derived();", "Console.WriteLine(b.V());"],
      predictAt: 1, predictQ: 'Переменная объявлена <code>Base</code>, объект — <code>Derived</code>. Что вернёт виртуальный <code>b.V()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Base b = new Derived()</code>: переменная <b>b</b> объявлена <code>Base</code>, а в куче — <span class="hl">Derived</span>.', nodes: [{ id: "b", kind: "ref", at: { zone: "ref", row: 0 }, name: "b", value: "Base" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Derived", value: "override V", accent: true }], edges: [{ id: "e", from: "b", to: "o" }] },
        { codeLine: 1, out: "Derived.V", caption: '<code>b.V()</code> — <b>виртуальный</b>: CLR смотрит на <span class="hl">run-time тип</span> объекта и зовёт его override → <b>Derived.V</b> (реальный прогон).', nodes: [{ id: "b", kind: "ref", at: { zone: "ref", row: 0 }, name: "b", value: "Base" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Derived", value: "override V", accent: true }, { id: "call", kind: "gate", at: { zone: "obj", row: 1 }, state: "ok", label: "vtable →", detail: "Derived.V" }], edges: [{ id: "e", from: "b", to: "o" }] },
      ],
      explain: 'Виртуальный вызов диспетчеризуется по объекту, не по переменной: «At run-time, when client code calls the method, the CLR looks up the <span class="hl">run-time type</span> of the object, and invokes that override of the virtual method». И это работает даже через базовую ссылку: «When a derived class overrides a virtual member, that member is called <b>even when</b> an instance of that class is being accessed as an instance of the base class». Поэтому <code>Base b = new Derived(); b.V()</code> печатает <code>Derived.V</code>. Это и есть полиморфизм: один вызов через базовый тип бьёт в нужный override.',
      sources: ["ms-poly"],
    },
    {
      id: "s3", num: "03", kicker: "Машинная панель · vtable", title: "Как вызов находит override — метод-таблица",
      viewBox: "0 0 340 210", zones: VTABLE_ZONES,
      code: ["Base b = new Derived();", "b.V();   // индексируем слот V в vtable объекта"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Компилятор знает лишь <b>слот</b> метода V() в таблице (по типу Base) — но не конкретную реализацию.', nodes: [{ id: "b", kind: "ref", at: { zone: "call", row: 0 }, name: "b.V()", value: "слот V" }, { id: "vt", kind: "obj", at: { zone: "vtable", row: 0 }, typeTag: "vtable", value: "[V]→?" }], edges: [{ id: "e", from: "b", to: "vt" }] },
        { codeLine: 1, out: "", caption: 'В рантайме слот V в <span class="hl">метод-таблице объекта Derived</span> указывает на <b>Derived.V</b> — override перезаписал слот базы.', nodes: [{ id: "b", kind: "ref", at: { zone: "call", row: 0 }, name: "b.V()", value: "слот V" }, { id: "vt", kind: "obj", at: { zone: "vtable", row: 0 }, typeTag: "vtable", value: "[V]→Derived", accent: true }], edges: [{ id: "e", from: "b", to: "vt", accent: true }] },
        { codeLine: 1, out: "Derived.V", caption: 'Прыжок по адресу из слота → выполняется <b>Derived.V</b> (реальный прогон). Диспетчеризация — <span class="hl">один indirect-переход</span> через таблицу.', nodes: [{ id: "b", kind: "ref", at: { zone: "call", row: 0 }, name: "b.V()", value: "слот V" }, { id: "vt", kind: "obj", at: { zone: "vtable", row: 0 }, typeTag: "vtable", value: "[V]→Derived" }, { id: "run", kind: "gate", at: { zone: "vtable", row: 1 }, state: "ok", label: "jump →", detail: "Derived.V" }], edges: [{ id: "e", from: "b", to: "vt" }] },
      ],
      explain: 'Это машинная панель урока — как именно вызов находит override. У каждого объекта есть <b>метод-таблица</b> (MethodTable), и в ней — <b>слоты</b> виртуальных методов; дословно из Book of the Runtime рантайма: «Each MethodDesc has a <span class="hl">slot</span>, which contains the current entry point of the method» и «The slot is stored in <b>MethodTable</b> for methods that require efficient lookup via slot index, e.g. <span class="hl">virtual methods</span>». Для виртуального члена компилятор эмитит не прямой вызов, а обращение к слоту таблицы; <code>override</code> в Derived <b>перезаписывает</b> этот слот адресом своей реализации, поэтому <code>b.V()</code> через слот попадает в <code>Derived.V</code> (собственный прогон: <b>Derived.V</b>). Ключ: слот выбирается по типу переменной (Base знает, где слот V), а адрес в слоте — от run-time типа объекта (ECMA-335 §I.8.10: «types can provide their own implementation of a virtual method… this is known as overriding»). Отсюда цена и сила виртуальности: один indirect-переход, но истинный полиморфизм.',
      sources: ["ms-poly", "botr-method-slots", "ecma-335"],
    },
    {
      id: "s4", num: "04", kicker: "new · сокрытие", title: "new прячет по compile-time типу",
      viewBox: "0 0 340 210", zones: CALL_ZONES,
      code: ["class Base { public string N() => \"Base.N\"; }", "class Derived : Base { public new string N() => \"Derived.N\"; }", "Base b = new Derived();  Console.WriteLine(b.N());", "Derived d = new Derived();  Console.WriteLine(d.N());"],
      predictAt: 2, predictQ: 'Объект — <code>Derived</code>, но <code>N()</code> скрыт через <code>new</code>. Что вернёт <code>b.N()</code> при <code>Base b</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "Base.N", caption: 'Через <code>Base b</code>: <code>new</code>-метод <b>не в vtable-слоте</b> — компилятор берёт версию по <span class="hl">типу переменной</span> → <b>Base.N</b>.', nodes: [{ id: "b", kind: "ref", at: { zone: "ref", row: 0 }, name: "b", value: "Base" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Derived", value: "new N" }, { id: "call", kind: "gate", at: { zone: "ref", row: 1 }, state: "fail", label: "compile-time →", detail: "Base.N" }], edges: [{ id: "e", from: "b", to: "o" }] },
        { codeLine: 3, out: "Base.N\nDerived.N", caption: 'Тот же объект через <code>Derived d</code>: тип переменной — Derived → <span class="hl">Derived.N</span>. Один объект, два ответа — решает <b>declared type</b>.', nodes: [{ id: "d", kind: "ref", at: { zone: "ref", row: 0 }, name: "d", value: "Derived" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Derived", value: "new N", accent: true }, { id: "call", kind: "gate", at: { zone: "ref", row: 1 }, state: "ok", label: "compile-time →", detail: "Derived.N" }], edges: [{ id: "e", from: "d", to: "o" }] },
      ],
      explain: '<code>new</code> — это <b>сокрытие</b>, не переопределение: «you\'re creating a method that <span class="hl">hides</span> the base class method rather than overriding it. This is different from virtual methods. With method hiding, the method that gets called depends on the <b>compile-time type</b> of the variable, not the run-time type of the object». Поэтому один и тот же <code>Derived</code>-объект даёт <code>Base.N</code> через <code>Base</code>-ссылку и <code>Derived.N</code> через <code>Derived</code>-ссылку (реальный прогон): «the method that gets called depends on the variable\'s <b>declared type</b>». Это тихий баг: обновил метод в derived через <code>new</code> — а старый код с базовой ссылкой зовёт старую версию.',
      sources: ["ms-poly"],
    },
    {
      id: "s5", num: "05", kicker: "base · вызов внутри метода", title: "Virtual внутри метода базы бьёт в override",
      viewBox: "0 0 340 210", zones: CALL_ZONES,
      code: ["class Shape { virtual double Area()=>0;", "  virtual string Describe()=>$\"Area={Area()}\"; }", "class Circle:Shape { override double Area()=>12.57; }", "Shape s = new Circle(2); s.Describe();"],
      console: true,
      scenes: [
        { codeLine: 3, out: "", caption: '<code>s.Describe()</code> — метод <b>базы</b> Shape (Circle его не трогал). Внутри он зовёт <code>Area()</code>.', nodes: [{ id: "s", kind: "ref", at: { zone: "ref", row: 0 }, name: "s", value: "Shape" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Circle", value: "override Area", accent: true }], edges: [{ id: "e", from: "s", to: "o" }] },
        { codeLine: 3, out: "Area=12.57", caption: 'Внутренний <code>Area()</code> — тоже <b>виртуальный</b>: диспетчеризация по объекту → <span class="hl">Circle.Area</span> → <b>Area=12.57</b> (реальный прогон).', nodes: [{ id: "s", kind: "ref", at: { zone: "ref", row: 0 }, name: "s", value: "Shape" }, { id: "o", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Circle", value: "override Area" }, { id: "call", kind: "gate", at: { zone: "obj", row: 1 }, state: "ok", label: "virtual Area →", detail: "Circle.Area" }], edges: [{ id: "e", from: "s", to: "o" }] },
      ],
      explain: 'Виртуальность работает и <b>внутри</b> методов базы: <code>Shape.Describe()</code> не переопределён, но его вызов <code>Area()</code> — виртуальный, поэтому уходит в <code>Circle.Area</code> (реальный прогон: <code>Area=12.57</code>, т.е. 3.14159·2² округлённо). Диспетчеризация всегда по объекту, кто бы ни звал. Обратный инструмент — <code>base</code>: derived-override может дозвониться до базовой реализации: «A derived class that replaces or overrides a method… can still access the method or property on the base class using the <code>base</code> keyword». Рекомендация доки — звать <code>base</code> из override, чтобы поведение базы не терялось.',
      sources: ["ms-poly"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Base { public virtual string V()=>"Base.V"; public string N()=>"Base.N"; } class Derived: Base { public override string V()=>"Derived.V"; public new string N()=>"Derived.N"; }</code><br/><code>Base b = new Derived(); Console.WriteLine(b.V()); Console.WriteLine(b.N());</code> — обе строки?',
      options: ["Derived.V\\nBase.N", "Derived.V\\nDerived.N", "Base.V\\nBase.N", "Base.V\\nDerived.N"], correctIndex: 0, xp: 10,
      okText: '<code>V()</code> — virtual: диспетчеризация по <span class="hl">run-time</span> типу → <b>Derived.V</b>. <code>N()</code> скрыт через <code>new</code>: вызов по <span class="hl">compile-time</span> типу переменной (Base) → <b>Base.N</b>.',
      noText: 'override → virtual → run-time тип; new → сокрытие → compile-time тип переменной. Через <code>Base b</code>: <code>b.V()</code>=<b>Derived.V</b>, <code>b.N()</code>=<b>Base.N</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Derived.V\nBase.N" }, sourceRefs: ["ms-poly"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Shape { public virtual double Area()=>0; public virtual string Describe()=>$"Area={Area()}"; } class Circle: Shape { double r; public Circle(double r){this.r=r;} public override double Area()=>Math.Round(3.14159*r*r,2); }</code><br/><code>Shape s = new Circle(2); Console.WriteLine(s.Describe());</code> — что напечатает?',
      options: ["Area=12.57", "Area=0", "Area=12.56636", "Area="], correctIndex: 0, xp: 10,
      okText: 'Базовый <code>Describe()</code> зовёт <b>виртуальный</b> <code>Area()</code> — диспетчеризация по объекту (Circle) → <code>Circle.Area</code> = <code>3.14159·4</code> ≈ <b>12.57</b>.',
      noText: 'Виртуальный вызов <b>внутри</b> метода базы всё равно бьёт в override: <code>Area()</code> → <code>Circle.Area</code>. Реальный вывод: <b>Area=12.57</b>, не Area=0.',
      verify: { kind: "exec", run: "dotnet run", expect: "Area=12.57" }, sourceRefs: ["ms-poly"],
    },
  ],

  takeaways: [
    { icon: "why", k: "override vs new", v: '<code>override</code> — <b>виртуальный</b> вызов по run-time типу (через vtable-слот). <code>new</code> — <b>сокрытие</b> по compile-time типу переменной. Разные механики, не синонимы.' },
    { icon: "cost", k: "vtable-диспетчеризация", v: 'Виртуальный вызов = <span class="hl">indirect-переход</span> через слот метод-таблицы объекта. Слот выбирает тип переменной; адрес в слоте — run-time тип. Один объект через Base-ссылку зовёт Derived-override.' },
    { icon: "avoid", k: "Ловушка new", v: '<code>new</code> прячет молча: старый код с базовой ссылкой позовёт <b>старую</b> версию. Виртуальный <code>Area()</code> внутри метода базы уходит в derived — осторожно с virtual-вызовами в конструкторе.' },
  ],

  foot: 'урок · <b>виртуальная диспетчеризация</b> · 5 анимир. разборов · vtable-панель · override vs new · дизайн <b>mid</b>',
};
