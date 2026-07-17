/**
 * Lesson: Карта типовой системы (CS.S1.type-system-map) — expert density, the entry
 * lesson of the C# track's first session (design «Опыт»). The mental map a senior needs:
 * every type derives from System.Object through the CTS; a variable has a COMPILE-TIME
 * type (declared/inferred) AND a RUN-TIME type (the actual instance) that can differ; and
 * which of the two governs which mechanism — overload resolution vs virtual dispatch.
 *
 * SIGNATURE machine panel (s3): the SAME run-time String object routed to DIFFERENT method
 * overloads purely by the variable's compile-time type — a real run-csharp measurement
 * (object overload / string overload / String), evidence/F6/type-system-map-exec.txt.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../fundamentals/types/
 *     (fetch-verified 2026-07-18);
 *   - every card's verify.expect is the REAL stdout of the backend run-csharp endpoint
 *     (evidence/F6/type-system-map-exec.txt: System.String; object overload/string overload; Dog).
 *
 * Loop: cards c1..c2 map to backend review items `CS.S1.type-system-map/c{1..2}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the CTS hierarchy — object at the root, ValueType and reference types under it.
const Z_CTS: Zone = { id: "cts", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "COMMON TYPE SYSTEM", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "всё наследует System.Object", subCls: "vz-zsub", subY: 47 };
const CTS_ZONES: Zone[] = [Z_CTS];

// s2/s4/s5: a variable's two types — the compile-time lane (what the source says) beside the
// run-time lane (what the instance actually is).
const Z_COMPILE: Zone = { id: "compile", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "COMPILE-TIME ТИП", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "что сказано в коде", subCls: "vz-zsub", subY: 47 };
const Z_RUNTIME: Zone = { id: "runtime", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "RUN-TIME ТИП", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "чем объект оказался", subCls: "vz-zsub heap", subY: 47 };
const TWO_TYPE_ZONES: Zone[] = [Z_COMPILE, Z_RUNTIME];

// s3 (SIGNATURE): two mechanisms fed by two types — overload resolution (compile-time) above,
// virtual dispatch (run-time) below.
const Z_OVERLOAD: Zone = { id: "overload", x: 14, y: 34, w: 312, h: 92, cls: "vz-zone", label: "OVERLOAD RESOLUTION · COMPILE-TIME", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_DISPATCH: Zone = { id: "dispatch", x: 14, y: 158, w: 312, h: 92, cls: "vz-zone heap", label: "VIRTUAL DISPATCH · RUN-TIME", labelCls: "vz-zlabel heap sm", lx: 170, ly: 148 };
const MECH_ZONES: Zone[] = [Z_OVERLOAD, Z_DISPATCH];

export const typeSystemMap: LessonData = {
  id: "CS.S1.type-system-map",
  track: "CS",
  section: "CS.S1",
  module: "S1.1",
  lang: "csharp",
  title: "Карта типовой системы",
  kicker: "C# вглубь · S1 · тип во времени",
  home: { subtitle: "CTS, compile-time vs run-time тип", icon: "types", estMinutes: 8 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-types", kind: "doc", org: "Microsoft Learn", title: "The C# type system", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/", date: "2026-03-24" },
    { id: "ms-cts", kind: "doc", org: "Microsoft Learn", title: "Common Type System", url: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/common-type-system", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The compile-time type controls overload resolution and available conversions. The run-time type controls virtual method dispatch, is expressions, and switch expressions.»", source: "ms-types" },
  ],
  edgeCases: [
    { text: "<code>object o = \"hi\"</code>: <b>compile-time</b> тип — <code>object</code>, <b>run-time</b> — <code>String</code>. Присваивание легально, т.к. есть implicit conversion (identity/reference/boxing).", source: "ms-types" },
    { text: "Overload и <code>is</code>/<code>switch</code> смотрят на <span class=\"hl\">разные</span> типы: перегрузка — на compile-time, <code>is</code> — на run-time. Отсюда «неожиданная» перегрузка при <code>object</code>-параметре.", source: "ms-types" },
    { text: "Всё наследует <code>System.Object</code>; value-типы — через <code>System.ValueType</code>. Это и есть CTS — единая иерархия для value и reference.", source: "ms-types" },
  ],

  misconceptions: [
    {
      wrong: "у переменной один тип — тот, что написан в объявлении",
      hook: 'У переменной <span class="wrong">не один тип, а два</span>: <b>compile-time</b> (что написано в коде) и <b>run-time</b> (чем объект оказался в куче). <code>object o = "hi"</code> — статически это <code>object</code>, а <code>o.GetType()</code> вернёт <code>String</code>. И это не педантизм: «The <b>compile-time type</b> controls overload resolution… The <b>run-time type</b> controls virtual method dispatch, <code>is</code> expressions, and <code>switch</code> expressions». Дальше <b>пять разборов</b>: иерархия CTS, два типа одной переменной, и <b>машинная панель</b> — как один и тот же объект уходит в <span class="hl">разные перегрузки</span> по compile-time типу (реальный прогон).',
      source: "ms-types",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "CTS · единая иерархия", title: "Всё наследует System.Object",
      viewBox: "0 0 340 210", zones: CTS_ZONES,
      code: ["// value и reference — одна иерархия", "int, struct  : System.ValueType : object", "string, class: object"],
      scenes: [
        { codeLine: 1, caption: 'В корне — <code>System.Object</code>. От него наследует <b>всё</b>: это и делает <code>object</code> универсальным «верхним» типом.', nodes: [{ id: "obj", kind: "obj", at: { zone: "cts", row: 0 }, typeTag: "System.Object", value: "корень", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Value-типы (<code>int</code>, struct, enum) идут через <span class="hl">System.ValueType</span> — но и он наследует <code>object</code>.', nodes: [{ id: "obj", kind: "obj", at: { zone: "cts", row: 0 }, typeTag: "System.Object", value: "" }, { id: "vt", kind: "obj", at: { zone: "cts", row: 1, col: 0 }, typeTag: "ValueType", value: "int, struct", accent: true }], edges: [{ id: "e1", from: "vt", to: "obj" }] },
        { codeLine: 2, caption: 'Reference-типы (class, string, array, delegate) наследуют <code>object</code> напрямую. Одна система типов — <b>CTS</b>.', nodes: [{ id: "obj", kind: "obj", at: { zone: "cts", row: 0 }, typeTag: "System.Object", value: "" }, { id: "vt", kind: "obj", at: { zone: "cts", row: 1, col: 0 }, typeTag: "ValueType", value: "int, struct" }, { id: "rt", kind: "obj", at: { zone: "cts", row: 1, col: 1 }, typeTag: "class, string", value: "ref", accent: true }], edges: [{ id: "e1", from: "vt", to: "obj" }, { id: "e2", from: "rt", to: "obj", accent: true }] },
      ],
      explain: 'CTS — единая иерархия: «All types ultimately derive from <code>System.Object</code>. Value types derive from <code>System.ValueType</code>, which derives from <code>object</code>. This unified hierarchy is called the <b>Common Type System</b> (CTS)». Практический смысл: любое значение можно трактовать как <code>object</code> (отсюда boxing value-типов), а компилятор строго типизирован — «C# is a strongly typed language. Every variable, constant, and expression has a type… The compiler enforces <span class="hl">type safety</span>». Тип — не подсказка, а контракт, встроенный в метаданные сборки.',
      sources: ["ms-types", "ms-cts"],
    },
    {
      id: "s2", num: "02", kicker: "Два типа переменной", title: "compile-time тип vs run-time тип",
      viewBox: "0 0 340 210", zones: TWO_TYPE_ZONES,
      code: ["object o = \"hello\";", "Console.WriteLine(o.GetType().FullName);"],
      predictAt: 1, predictQ: 'Что напечатает <code>o.GetType().FullName</code>, если <code>o</code> объявлен как <code>object</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>object o = "hello"</code>: в коде тип — <b>object</b>. Так его видит компилятор.', nodes: [{ id: "ct", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "o", value: "object", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: 'Но в куче лежит <span class="hl">String</span> — это run-time тип: чем объект оказался на самом деле.', nodes: [{ id: "ct", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "o", value: "object" }, { id: "rt", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "GetType()", value: "String", accent: true }], edges: [{ id: "e", from: "ct", to: "rt", accent: true }] },
        { codeLine: 1, out: "System.String", caption: '<code>o.GetType()</code> читает <b>run-time</b> тип → <span class="hl">System.String</span> (реальный прогон). Присваивание легально: String наследует object.', nodes: [{ id: "ct", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "o", value: "object" }, { id: "rt", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "GetType()", value: "String", accent: true }], edges: [{ id: "e", from: "ct", to: "rt" }] },
      ],
      explain: 'У переменной два типа: «The <b>compile-time type</b> is the declared or inferred type in source code. The <b>run-time type</b> is the actual type of the instance the variable refers to». Здесь compile-time — <code>object</code>, run-time — <code>String</code>: «boxed has a compile-time type of <code>object</code> but a run-time type of <code>string</code>. The assignment works because <code>string</code> derives from <code>object</code>». Легально любое присваивание, где есть implicit conversion от run-time к compile-time типу (identity, reference, boxing). Реальный вывод <code>GetType().FullName</code> — <code>System.String</code>.',
      sources: ["ms-types"],
    },
    {
      id: "s3", num: "03", kicker: "Машинная панель · кто решает", title: "Один объект, две перегрузки — по compile-time типу",
      viewBox: "0 0 340 250", zones: MECH_ZONES,
      code: ["string Describe(object x) => \"object overload\";", "string Describe(string x) => \"string overload\";", "object o = \"hi\"; string s = \"hi\";", "Describe(o);  Describe(s);"],
      console: true,
      scenes: [
        { codeLine: 3, out: "", caption: 'И <code>o</code>, и <code>s</code> в run-time — <b>String</b>. Но компилятор выбирает перегрузку по <span class="hl">compile-time</span> типу.', nodes: [{ id: "o", kind: "ref", at: { zone: "overload", row: 0, col: 0 }, name: "o", value: "object" }, { id: "s", kind: "ref", at: { zone: "overload", row: 0, col: 1 }, name: "s", value: "string" }], edges: [] },
        { codeLine: 3, out: "object overload", caption: '<code>Describe(o)</code>: compile-time тип <b>object</b> → уходит в <span class="hl">object overload</span>, хотя объект — String.', nodes: [{ id: "o", kind: "ref", at: { zone: "overload", row: 0, col: 0 }, name: "o", value: "object", accent: true }, { id: "s", kind: "ref", at: { zone: "overload", row: 0, col: 1 }, name: "s", value: "string" }, { id: "r1", kind: "gate", at: { zone: "dispatch", row: 0 }, state: "ok", label: "Describe(o) →", detail: "object overload" }], edges: [{ id: "e1", from: "o", to: "r1", accent: true }] },
        { codeLine: 3, out: "object overload\nstring overload", caption: '<code>Describe(s)</code>: compile-time тип <b>string</b> → <span class="hl">string overload</span>. Тот же класс объекта, разный маршрут — решил компилятор.', nodes: [{ id: "o", kind: "ref", at: { zone: "overload", row: 0, col: 0 }, name: "o", value: "object" }, { id: "s", kind: "ref", at: { zone: "overload", row: 0, col: 1 }, name: "s", value: "string", accent: true }, { id: "r2", kind: "gate", at: { zone: "dispatch", row: 0 }, state: "ok", label: "Describe(s) →", detail: "string overload" }], edges: [{ id: "e2", from: "s", to: "r2", accent: true }] },
      ],
      explain: 'Это машинная панель урока — реально снятый маршрут вызова. Обе переменные держат один класс объекта (<code>String</code>), но <code>Describe(o)</code> печатает <b>object overload</b>, а <code>Describe(s)</code> — <b>string overload</b> (собственный прогон, evidence урока). Причина буквально в спеке: «The <b>compile-time type</b> controls <span class="hl">overload resolution</span> and available conversions». Компилятор фиксирует перегрузку в момент компиляции по статическому типу — рантайм тут не участвует. Это ловушка API с <code>object</code>-параметрами: перегрузка ловит не то, «что лежит», а «как объявлено».',
      sources: ["ms-types"],
    },
    {
      id: "s4", num: "04", kicker: "Виртуальный вызов · run-time", title: "А диспетчеризация решает по run-time типу",
      viewBox: "0 0 340 210", zones: TWO_TYPE_ZONES,
      code: ["class Animal { override ToString() => \"Animal\"; }", "class Dog : Animal { override ToString() => \"Dog\"; }", "Animal a = new Dog();", "Console.WriteLine(a.ToString());"],
      predictAt: 2, predictQ: 'Тип переменной — <code>Animal</code>, объект — <code>Dog</code>. Что напечатает <code>a.ToString()</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>Animal a = new Dog()</code>: compile-time тип — <b>Animal</b>, run-time — <b>Dog</b>.', nodes: [{ id: "ct", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "a", value: "Animal" }, { id: "rt", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "объект", value: "Dog", accent: true }], edges: [{ id: "e", from: "ct", to: "rt" }] },
        { codeLine: 3, out: "Dog", caption: '<code>a.ToString()</code> — <b>виртуальный</b> вызов: диспетчеризация по <span class="hl">run-time</span> типу → <code>Dog</code> (реальный прогон), не Animal.', nodes: [{ id: "ct", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "a", value: "Animal" }, { id: "rt", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "объект", value: "Dog", accent: true }, { id: "call", kind: "gate", at: { zone: "runtime", row: 1 }, state: "ok", label: "vtable →", detail: "Dog.ToString" }], edges: [{ id: "e", from: "ct", to: "rt" }] },
      ],
      explain: 'Зеркальный случай: тот же дуализм, но другой механизм. Виртуальный вызов идёт по <b>run-time</b> типу: «The <b>run-time type</b> controls <span class="hl">virtual method dispatch</span>, <code>is</code> expressions, and <code>switch</code> expressions». Поэтому <code>a.ToString()</code> при <code>Animal a = new Dog()</code> печатает <code>Dog</code> — рантайм смотрит в vtable объекта, а не на объявленный тип. Собери оба факта: <b>compile-time</b> тип решает перегрузку и доступные конверсии (s3), <b>run-time</b> тип — виртуальную диспетчеризацию, <code>is</code>, <code>switch</code>. Это и есть карта: какой тип что контролирует.',
      sources: ["ms-types"],
    },
    {
      id: "s5", num: "05", kicker: "value vs reference · тип хранения", title: "Тип определяет, как переменная хранит данные",
      viewBox: "0 0 340 210", zones: TWO_TYPE_ZONES,
      code: ["var point2 = point1;   // struct: копия", "var list2 = list1;     // class: та же ссылка", "list2.Add(4);          // list1.Count == 4"],
      scenes: [
        { codeLine: 0, caption: '<b>value-тип</b> (struct): <code>point2 = point1</code> — <span class="hl">копия данных</span>, две независимые переменные.', nodes: [{ id: "p1", kind: "obj", at: { zone: "compile", row: 0 }, typeTag: "point1", value: "(3,4)" }, { id: "p2", kind: "obj", at: { zone: "compile", row: 1 }, typeTag: "point2", value: "(3,4)", accent: true }], edges: [] },
        { codeLine: 1, caption: '<b>reference-тип</b> (class): <code>list2 = list1</code> — <span class="hl">та же ссылка</span>, один объект на двоих.', nodes: [{ id: "l1", kind: "ref", at: { zone: "compile", row: 0 }, name: "list1" }, { id: "l2", kind: "ref", at: { zone: "compile", row: 1 }, name: "list2", accent: true }, { id: "list", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "List", value: "[1,2,3]" }], edges: [{ id: "e1", from: "l1", to: "list" }, { id: "e2", from: "l2", to: "list", accent: true }] },
        { codeLine: 2, caption: '<code>list2.Add(4)</code> виден через <code>list1</code> — <b>один</b> объект: <code>list1.Count == 4</code>.', nodes: [{ id: "l1", kind: "ref", at: { zone: "compile", row: 0 }, name: "list1" }, { id: "l2", kind: "ref", at: { zone: "compile", row: 1 }, name: "list2" }, { id: "list", kind: "obj", at: { zone: "runtime", row: 0 }, typeTag: "List", value: "[1,2,3,4]", accent: true }], edges: [{ id: "e1", from: "l1", to: "list" }, { id: "e2", from: "l2", to: "list" }] },
      ],
      explain: 'Категория типа (value/reference) — это про то, как переменная <b>хранит данные</b>: «Value types hold their data directly. When you assign a value type to a new variable, the runtime <span class="hl">copies the data</span>… Reference types hold a reference to an object on the managed heap. When you assign a reference type… both variables point to the <b>same object</b>». Поэтому struct-копия независима, а <code>list2.Add(4)</code> виден через <code>list1</code> (<code>Count == 4</code>). Эта развилка — фундамент раздела: следующий урок (S1.2) разбирает копирование value-типов на машинном уровне.',
      sources: ["ms-types"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string Describe(object x) => "object overload"; static string Describe(string x) => "string overload";</code><br/><code>object o = "hi"; Console.WriteLine(Describe(o)); Console.WriteLine(Describe("hi"));</code> — обе строки?',
      options: ["object overload\\nstring overload", "string overload\\nstring overload", "object overload\\nobject overload", "string overload\\nobject overload"], correctIndex: 0, xp: 10,
      okText: 'Перегрузка выбирается по <span class="hl">compile-time</span> типу: <code>o</code> объявлен <code>object</code> → <b>object overload</b> (хотя объект — String); литерал <code>"hi"</code> — <code>string</code> → <b>string overload</b>.',
      noText: '«The compile-time type controls overload resolution». <code>o</code> статически <code>object</code>, поэтому <code>Describe(o)</code> → <b>object overload</b>, а <code>Describe("hi")</code> → <b>string overload</b>. Run-time тип (String) тут ни при чём.',
      verify: { kind: "exec", run: "dotnet run", expect: "object overload\nstring overload" }, sourceRefs: ["ms-types"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Animal { public override string ToString()=>"Animal"; } class Dog: Animal { public override string ToString()=>"Dog"; }</code><br/><code>Animal a = new Dog(); Console.WriteLine(a.ToString()); Console.WriteLine(a.GetType().Name);</code> — обе строки?',
      options: ["Dog\\nDog", "Animal\\nAnimal", "Animal\\nDog", "Dog\\nAnimal"], correctIndex: 0, xp: 10,
      okText: 'Виртуальный вызов и <code>GetType()</code> оба смотрят на <span class="hl">run-time</span> тип — <code>Dog</code>. Compile-time тип <code>Animal</code> здесь ничего не решает.',
      noText: '«The run-time type controls virtual method dispatch». Объект — <code>Dog</code>, поэтому <code>a.ToString()</code> = <b>Dog</b> и <code>a.GetType().Name</code> = <b>Dog</b>, хоть переменная объявлена <code>Animal</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Dog\nDog" }, sourceRefs: ["ms-types"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Два типа одной переменной", v: '<b>Compile-time</b> тип — что написано в коде; <b>run-time</b> тип — чем объект оказался. <code>object o = "hi"</code>: object статически, <span class="hl">String</span> в рантайме.' },
    { icon: "cost", k: "Кто что решает", v: 'Compile-time тип → <b>overload resolution</b> и конверсии. Run-time тип → <b>virtual dispatch</b>, <code>is</code>, <code>switch</code>. Путаница здесь — источник «неожиданных» перегрузок.' },
    { icon: "avoid", k: "CTS и категория", v: 'Всё наследует <code>System.Object</code> (value-типы — через <code>ValueType</code>). Категория (value/reference) решает, <span class="hl">копия или общая ссылка</span> при присваивании.' },
  ],

  foot: 'урок · <b>карта типовой системы</b> · 5 анимир. разборов · панель overload vs dispatch · дизайн <b>mid</b>',
};
