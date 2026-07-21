/**
 * Lesson: Generics — механика и constraints (CS.S1.generics-basics) — expert density,
 * 5 animated deep-dives. The senior mental model: generics give compile-time type safety (no
 * runtime casts); a generic type definition is an OPEN template (can't instantiate) vs a
 * CONSTRUCTED closed type; a method is generic only if it has its OWN type-parameter list (and
 * the compiler infers T); `where` constraints unlock members; and — the machine truth —
 * .NET generics carry FULL runtime type info (no Java-style type erasure) and store value types
 * WITHOUT boxing.
 *
 * SIGNATURE machine panel (s5): generics avoid boxing — a real GC.GetAllocatedBytesForCurrentThread
 * measurement shows List<int> allocating ~8.4 KB for 1000 ints (inline) vs ArrayList ~40.6 KB
 * (a boxed object per int). REAL run-csharp measurement, evidence/F8/generics-basics-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn generics + constraints (fetch 2026-07-18)
 * + GT-M3-s1.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../fundamentals/types/generics,
 *     .../standard/generics/, and .../generics/constraints-on-type-parameters;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F8/generics-basics-exec.txt:
 *     "42 Int32"; "Int32 String"; "True False True");
 *   - NO GT-M3 red flags: NOT type erasure (full runtime type info, measured via typeof(T) + List<int>
 *     without boxing); `where T:struct` requires a NON-nullable value type (Nullable<T> is rejected,
 *     CS0453); NO claim of CLR native-code specialization as a Learn fact (kept to no-erasure + no-boxing).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S1.generics-basics/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: one template code path serving many types, checked at compile time.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ОДНА ВЕРСИЯ КОДА", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "class Box<T>", subCls: "vz-zsub", subY: 47 };
const Z_USES: Zone = { id: "uses", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "МНОГО ТИПОВ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "compile-time проверка", subCls: "vz-zsub heap", subY: 47 };
const SAFETY_ZONES: Zone[] = [Z_CODE, Z_USES];

// s2: open (definition) vs closed (constructed) type.
const Z_OPEN: Zone = { id: "open", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "OPEN · List<>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "шаблон · нельзя new", subCls: "vz-zsub", subY: 47 };
const Z_CLOSED: Zone = { id: "closed", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "CLOSED · List<int>", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "constructed · можно new", subCls: "vz-zsub good", subY: 47 };
const OPENCLOSED_ZONES: Zone[] = [Z_OPEN, Z_CLOSED];

// s3: generic method + inference.
const Z_METHOD: Zone = { id: "method", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "МЕТОД · Echo<T>", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "свой список <T>", subCls: "vz-zsub", subY: 47 };
const Z_INFER: Zone = { id: "infer", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ВЫВОД T", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "Echo(42) → T=int", subCls: "vz-zsub heap", subY: 47 };
const METHOD_ZONES: Zone[] = [Z_METHOD, Z_INFER];

// s4: where-constraints — non-nullable value type gate.
const Z_STRUCT: Zone = { id: "structc", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "where T : struct", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "NON-nullable value type", subCls: "vz-zsub", subY: 47 };
const CONSTRAINT_ZONES: Zone[] = [Z_STRUCT];

// s5 (SIGNATURE): boxing panel — List<int> inline vs ArrayList boxed, measured.
const Z_GEN: Zone = { id: "gen", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "List<int>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "inline · без боксинга", subCls: "vz-zsub good", subY: 47 };
const Z_ARR: Zone = { id: "arr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ArrayList", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "боксит каждый int", subCls: "vz-zsub heap", subY: 47 };
const BOX_ZONES: Zone[] = [Z_GEN, Z_ARR];

export const genericsBasics: LessonData = {
  id: "CS.S1.generics-basics",
  track: "CS",
  section: "CS.S1",
  module: "S1.8",
  lang: "csharp",
  title: "Generics: механика и constraints",
  kicker: "C# вглубь · S1 · без боксинга",
  home: { subtitle: "type safety, open/closed, where, без боксинга", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1.type-system-map"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-generics-cs", kind: "doc", org: "Microsoft Learn", title: "Generic types and methods (C# fundamentals)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics", date: "2026-04-10" },
    { id: "ms-generics-std", kind: "doc", org: "Microsoft Learn", title: "Generics in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/", date: "2022-07-26" },
    { id: "ms-constraints", kind: "doc", org: "Microsoft Learn", title: "Constraints on type parameters (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters", date: "2025-11-25" },
  ],

  spec: [
    { text: "«Generic collection types generally perform better for storing and manipulating value types because there is no need to box the value types.» <span class=\"ru-tr\">«Обобщённые типы коллекций обычно работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы.»</span>", source: "ms-generics-std" },
  ],
  edgeCases: [
    { text: "<b>Open</b> (generic type definition) — шаблон с плейсхолдерами, экземпляр создать нельзя; <b>closed</b> (constructed) — результат подстановки конкретных типов. «you cannot create instances of a… generic type definition». <span class=\"ru-tr\">«нельзя создать экземпляры… определения обобщённого типа».</span>", source: "ms-generics-std" },
    { text: "Метод обобщён, только если у него <b>свой</b> список параметров типа — не потому что лежит в generic-типе. Компилятор часто <span class=\"hl\">выводит</span> T.", source: "ms-generics-std" },
    { text: "Без constraint компилятору доступны только члены <code>System.Object</code>. <code>where T:struct</code> подразумевает <code>new()</code>; при <code>where T:class</code> избегай <code>==</code>/<code>!=</code> (только ссылочная идентичность).", source: "ms-constraints" },
  ],

  misconceptions: [
    {
      wrong: "дженерики C# = type erasure как в Java, и List<int> боксит каждый int",
      hook: 'Главный миф для пришедших из Java: «<span class="wrong">дженерики — это type erasure</span>». В C# — нет: типы <b>полностью</b> известны в рантайме (<code>typeof(T)</code> внутри метода даёт реальный тип), а <code>List&lt;int&gt;</code> хранит <code>int</code> <span class="hl">inline, без боксинга</span>. Второй миф: «<span class="wrong">where T:struct пускает и Nullable&lt;T&gt;</span>» — нет, нужен NON-nullable value type. Ниже <b>пять разборов</b>: compile-time type safety, open vs closed тип, вывод T, гейт <code>where T:struct</code>, и <b>машинная панель</b> — реально снятая цена боксинга (<code>List&lt;int&gt;</code> ~8.4 KB против <code>ArrayList</code> ~40.6 KB на 1000 int).',
      source: "ms-generics-std",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Type safety · на компиляции", title: "Одна версия кода, проверка на компиляции",
      viewBox: "0 0 340 210", zones: SAFETY_ZONES,
      code: ["class Box<T> { public T Value; }", "var bi = new Box<int> { Value = 1 };", "// bi.Value = \"x\";  // ошибка КОМПИЛЯЦИИ, не рантайма"],
      scenes: [
        { codeLine: 0, caption: '<code>Box&lt;T&gt;</code> — <b>одна</b> версия кода с плейсхолдером <code>T</code>. Пишешь раз — работает для любого типа.', nodes: [{ id: "b", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "Box<T>", value: "T Value", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Box&lt;int&gt;</code>: <code>T</code> = <code>int</code>. Компилятор знает точный тип поля — <span class="hl">никаких кастов</span> в рантайме.', nodes: [{ id: "b", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "Box<T>", value: "T Value" }, { id: "bi", kind: "obj", at: { zone: "uses", row: 0 }, typeTag: "Box<int>", value: "int Value", accent: true }], edges: [{ id: "e1", from: "bi", to: "b", accent: true }] },
        { codeLine: 2, caption: 'Присвоить строку в <code>Box&lt;int&gt;.Value</code> — <span class="hl">ошибка компиляции</span>, а не <code>InvalidCastException</code> в рантайме.', nodes: [{ id: "bi", kind: "obj", at: { zone: "uses", row: 0 }, typeTag: "Box<int>", value: "int Value" }, { id: "err", kind: "gate", at: { zone: "uses", row: 1 }, state: "fail", label: "Value = \"x\"", detail: "compile error", accent: true }], edges: [] },
      ],
      explain: 'Главная выгода дженериков — type safety на компиляции: «Type safety. Generics shift the burden of type safety from you to the compiler. There is <b>no need to write code to test for the correct data type</b> because it is enforced at compile time. The need for type casting and the possibility of <span class="hl">runtime errors are reduced</span>». <span class="ru-tr">«Типобезопасность. Обобщения перекладывают бремя типобезопасности с вас на компилятор. <b>Нет необходимости писать код для проверки правильности типа данных</b>, потому что она обеспечивается на этапе компиляции. Потребность в приведении типов и вероятность ошибок времени выполнения снижаются».</span> Одна версия кода <code>Box&lt;T&gt;</code> обслуживает любой тип; ошибка типа ловится на компиляции, а не как <code>InvalidCastException</code> в рантайме. Это и есть замена нетипизированных <code>Hashtable</code>/<code>ArrayList</code> с их кастами.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s2", num: "02", kicker: "Open vs closed · тип-шаблон", title: "List<> — шаблон, List<int> — готовый тип",
      viewBox: "0 0 340 210", zones: OPENCLOSED_ZONES,
      code: ["Type open = typeof(List<>);      // generic type definition", "Type closed = typeof(List<int>);  // constructed type", "// open.IsGenericTypeDefinition, closed.IsConstructedGenericType"],
      predictAt: 1, predictQ: '<code>List&lt;&gt;</code> (open) и <code>List&lt;int&gt;</code> (closed): что даст <code>open.IsGenericTypeDefinition</code>, <code>closed.IsGenericTypeDefinition</code>, <code>closed.IsConstructedGenericType</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>List&lt;&gt;</code> — <b>open</b> (generic type definition): шаблон с плейсхолдером. Экземпляр создать <span class="hl">нельзя</span>.', nodes: [{ id: "o", kind: "obj", at: { zone: "open", row: 0 }, typeTag: "List<>", value: "шаблон", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>List&lt;int&gt;</code> — <b>closed</b> (constructed): подставили <code>int</code>. Теперь это готовый тип, можно <code>new</code>.', nodes: [{ id: "o", kind: "obj", at: { zone: "open", row: 0 }, typeTag: "List<>", value: "шаблон" }, { id: "c", kind: "obj", at: { zone: "closed", row: 0 }, typeTag: "List<int>", value: "готов", accent: true }], edges: [{ id: "e", from: "c", to: "o" }] },
        { codeLine: 2, out: "True False True", caption: 'Панель: open <b>IsGenericTypeDefinition</b>=True, closed=False, closed <b>IsConstructedGenericType</b>=True (реальный прогон).', nodes: [{ id: "go", kind: "gate", at: { zone: "open", row: 0 }, state: "ok", label: "open · def", detail: "True" }, { id: "gc", kind: "gate", at: { zone: "closed", row: 0 }, state: "ok", label: "closed · constructed", detail: "True" }], edges: [] },
      ],
      explain: 'Терминология точная. «A <b>generic type definition</b> is a class, structure, or interface declaration that functions as a <span class="hl">template</span>… Because a generic type definition is only a template, you <b>cannot create instances</b> of a… generic type definition». <span class="ru-tr">«<b>Определение обобщённого типа</b> — это объявление класса, структуры или интерфейса, которое выступает шаблоном… Поскольку определение обобщённого типа — всего лишь шаблон, вы <b>не можете создать экземпляры</b>… определения обобщённого типа».</span> А «A <b>constructed generic type</b>… is the result of specifying types for the generic type parameters». <span class="ru-tr">«<b>Сконструированный обобщённый тип</b>… — это результат указания типов для параметров обобщённого типа».</span> Прогон подтверждает: <code>typeof(List&lt;&gt;)</code> (open) — <code>IsGenericTypeDefinition</code> True; <code>typeof(List&lt;int&gt;)</code> (closed) — False, зато <code>IsConstructedGenericType</code> True. Инстанцируешь только закрытый тип.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s3", num: "03", kicker: "Generic method · вывод T", title: "Метод обобщён своим списком <T>, T выводится",
      viewBox: "0 0 340 210", zones: METHOD_ZONES,
      code: ["T Echo<T>(T x) => x;      // свой список <T>", "var r = Echo(42);          // T выведен = int", "Console.WriteLine($\"{r} {r.GetType().Name}\");"],
      predictAt: 1, predictQ: '<code>Echo&lt;T&gt;(T x)</code>, вызов <code>Echo(42)</code> без явного <code>&lt;int&gt;</code>. Что даст <code>r</code> и <code>r.GetType().Name</code>?', console: true,
      scenes: [
        { codeLine: 0, caption: '<code>Echo&lt;T&gt;</code> обобщён, потому что имеет <b>свой</b> список параметров типа <code>&lt;T&gt;</code>.', nodes: [{ id: "m", kind: "obj", at: { zone: "method", row: 0 }, typeTag: "Echo<T>", value: "(T x) => x", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Echo(42)</code> без <code>&lt;int&gt;</code>: компилятор <span class="hl">выводит T=int</span> из аргумента.', nodes: [{ id: "m", kind: "obj", at: { zone: "method", row: 0 }, typeTag: "Echo<T>", value: "(T x) => x" }, { id: "i", kind: "gate", at: { zone: "infer", row: 0 }, state: "ok", label: "Echo(42)", detail: "T = int", accent: true }], edges: [] },
        { codeLine: 2, out: "42 Int32", caption: 'Панель: <code>r</code>=<b>42</b>, <code>GetType().Name</code>=<span class="hl">Int32</span> — тип известен в рантайме (реальный прогон).', nodes: [{ id: "i", kind: "gate", at: { zone: "infer", row: 0 }, state: "ok", label: "T = int", detail: "выведен" }, { id: "rt", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "r.GetType()", detail: "Int32", accent: true }], edges: [] },
      ],
      explain: 'Тонкость определения обобщённого метода: «It\'s important to note that a method is <b>not generic</b> just because it belongs to a generic type… A method is generic <span class="hl">only if it has its own list of type parameters</span>». <span class="ru-tr">«Важно отметить, что метод <b>не является обобщённым</b> лишь потому, что он принадлежит обобщённому типу… Метод является обобщённым только если у него есть собственный список параметров типа».</span> <code>Echo&lt;T&gt;</code> обобщён своим <code>&lt;T&gt;</code>; при вызове <code>Echo(42)</code> компилятор выводит <code>T=int</code> из аргумента, явно писать <code>&lt;int&gt;</code> не нужно. И <code>r.GetType().Name</code> в рантайме даёт <code>Int32</code> — это первый намёк на следующий разбор: типы у дженериков C# <b>не стёрты</b>, они реальны в рантайме.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s4", num: "04", kicker: "where T:struct · гейт типа", title: "Constraint пускает NON-nullable value type",
      viewBox: "0 0 340 210", zones: CONSTRAINT_ZONES,
      code: ["T First<T>(T[] a) where T : struct => a[0];", "int[] xs = {5, 6};    First(xs);   // OK — int value type", "int?[] ns = {7};      First(ns);   // ❌ CS0453"],
      scenes: [
        { codeLine: 0, caption: '<code>where T:struct</code>: <span class="hl">гейт типа</span> — T обязан быть value-типом. Без constraint доступны только члены <code>object</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "structc", row: 0 }, state: "ok", label: "where T : struct", detail: "value type", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>First&lt;int&gt;</code>: <code>int</code> — non-nullable value type → <span class="hl">проходит</span> гейт.', nodes: [{ id: "g", kind: "gate", at: { zone: "structc", row: 0 }, state: "ok", label: "T = int", detail: "OK · value type" }, { id: "ok", kind: "chip", at: { zone: "structc", row: 1 }, value: "First(xs) → 5", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>First&lt;int?&gt;</code>: <code>int?</code> — <b>nullable</b> value type → <span class="hl">гейт закрыт</span>, CS0453 «must be a non-nullable value type». <span class="ru-tr">«должен быть non-nullable значимым типом».</span>', nodes: [{ id: "g", kind: "gate", at: { zone: "structc", row: 0 }, state: "ok", label: "T = int", detail: "OK" }, { id: "no", kind: "gate", at: { zone: "structc", row: 1 }, state: "fail", label: "T = int?", detail: "CS0453", accent: true }], edges: [] },
      ],
      explain: 'Опровержение мифа «<code>where T:struct</code> пускает Nullable». Дословно из таблицы constraints: «<code>where T : struct</code> — The type argument must be a <span class="hl">non-nullable value type</span>… the <code>struct</code> constraint implies the <code>new()</code> constraint». <span class="ru-tr">«<code>where T : struct</code> — аргумент типа должен быть non-nullable значимым типом… ограничение <code>struct</code> подразумевает ограничение <code>new()</code>».</span> Прогон: <code>First(int[])</code> компилируется, а <code>First(int?[])</code> даёт <b>CS0453</b> — «must be a non-nullable value type». <span class="ru-tr">«должен быть non-nullable значимым типом».</span> Без constraint компилятор «can only assume the members of <code>System.Object</code>». <span class="ru-tr">«может опираться только на члены <code>System.Object</code>».</span> constraint разблокирует операции над типом. Другие: <code>where T:class</code> (reference type), <code>new()</code> (public parameterless ctor, всегда последний).',
      sources: ["ms-constraints"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · без боксинга", title: "List<int> inline (~8.4 KB) vs ArrayList (~40.6 KB)",
      viewBox: "0 0 340 210", zones: BOX_ZONES,
      code: ["var g = new List<int>();     for(..1000) g.Add(i);   // inline", "var o = new ArrayList();      for(..1000) o.Add(i);   // боксит", "// GC.GetAllocatedBytesForCurrentThread() вокруг каждого"],
      predictAt: 1, predictQ: 'Что дороже по аллокациям на 1000 int — <code>List&lt;int&gt;</code> (inline) или необобщённый <code>ArrayList</code> (боксит)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>List&lt;int&gt;</code> хранит <code>int</code> <span class="hl">inline</span> в массиве — заранее известный тип, <b>0 боксов</b>.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "int[] inline", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>ArrayList</code> хранит <code>object</code> — каждый <code>int</code> <span class="hl">боксится</span> в отдельный объект на куче.', nodes: [{ id: "g", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "List<int>", value: "int[] inline" }, { id: "a", kind: "obj", at: { zone: "arr", row: 0 }, typeTag: "ArrayList", value: "1000 боксов", accent: true }], edges: [] },
        { codeLine: 2, out: "8392 40568", caption: 'Панель: <code>List&lt;int&gt;</code> — <b>~8.4 KB</b>, <code>ArrayList</code> — <b>~40.6 KB</b> (боксы). Обобщения дешевле в ~5 раз (реальный прогон).', nodes: [{ id: "gg", kind: "gate", at: { zone: "gen", row: 0 }, state: "ok", label: "List<int>", detail: "8392 B" }, { id: "ag", kind: "gate", at: { zone: "arr", row: 0 }, state: "fail", label: "ArrayList", detail: "40568 B", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — цена боксинга, снятая числом. Дословно: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». <span class="ru-tr">«Обобщённые типы коллекций обычно работают лучше при хранении и обработке значимых типов, потому что нет необходимости упаковывать значимые типы».</span> Прогон <code>GC.GetAllocatedBytesForCurrentThread()</code> вокруг 1000 вставок: <code>List&lt;int&gt;</code> — <b>8392 байта</b> (int-массив inline), необобщённый <code>ArrayList</code> — <b>40568 байт</b> (каждый <code>int</code> боксится в объект на куче). Это же измерение опровергает «type erasure»: тип элемента известен на этапе построения, поэтому <code>List&lt;int&gt;</code> вообще не создаёт object-обёрток — в отличие от языков со стиранием типов, где обобщённая коллекция боксила бы примитивы.',
      sources: ["ms-generics-std"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>T Echo&lt;T&gt;(T x) => x; var r = Echo(42); Console.WriteLine($"{r} {r.GetType().Name}");</code> — что напечатает?',
      options: ["42 Int32", "42 Object", "42 T", "42 int"], correctIndex: 0, xp: 10,
      okText: 'Компилятор <b>выводит</b> <code>T=int</code> из аргумента <code>42</code>. В рантайме тип реален: <code>GetType().Name</code> → <span class="hl">Int32</span> (не Object, не стёрт).',
      noText: 'Type inference: <code>Echo(42)</code> без явного <code>&lt;int&gt;</code> → T=int. Дженерики C# хранят полный runtime-тип, поэтому <b>Int32</b>. Реальный вывод: <b>42 Int32</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "42 Int32" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>string TypeOf&lt;T&gt;() => typeof(T).Name; Console.WriteLine($"{TypeOf&lt;int&gt;()} {TypeOf&lt;string&gt;()}");</code> — что напечатает?',
      options: ["Int32 String", "T T", "Object Object", "int string"], correctIndex: 0, xp: 10,
      okText: '<code>typeof(T)</code> внутри дженерика даёт <b>реальный</b> тип аргумента: <code>Int32</code> и <code>String</code>. Тип НЕ стёрт (в отличие от Java) — <span class="hl">полная runtime-информация</span>.',
      noText: 'Дженерики C# — без type erasure: <code>typeof(T)</code> знает конкретный тип в рантайме. Реальный вывод: <b>Int32 String</b>, а не «T T» или «Object Object».',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32 String" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type open=typeof(List&lt;&gt;); Type closed=typeof(List&lt;int&gt;); Console.WriteLine($"{open.IsGenericTypeDefinition} {closed.IsGenericTypeDefinition} {closed.IsConstructedGenericType}");</code> — что напечатает?',
      options: ["True False True", "True True False", "False True True", "True False False"], correctIndex: 0, xp: 10,
      okText: '<code>List&lt;&gt;</code> — <b>open</b> (generic type definition): <code>IsGenericTypeDefinition</code>=True. <code>List&lt;int&gt;</code> — <b>closed</b> (constructed): не definition (False), зато <code>IsConstructedGenericType</code>=<span class="hl">True</span>.',
      noText: '«a generic type definition is only a template… you cannot create instances» <span class="ru-tr">«определение обобщённого типа — всего лишь шаблон… нельзя создать экземпляры»</span>; constructed = подстановка типов. Реальный вывод: <b>True False True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False True" }, sourceRefs: ["ms-generics-std"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Type safety + без erasure", v: 'Одна версия кода, проверка типов <span class="hl">на компиляции</span> (нет runtime-кастов). Типы НЕ стёрты: <code>typeof(T)</code> даёт реальный тип (Int32/String) — в отличие от Java.' },
    { icon: "cost", k: "Без боксинга (замер)", v: '<code>List&lt;int&gt;</code> хранит <code>int</code> inline — <b>~8.4 KB</b> на 1000, а <code>ArrayList</code> боксит каждый — <b>~40.6 KB</b>. «no need to box the value types» <span class="ru-tr">«нет необходимости упаковывать значимые типы»</span> = ~5× дешевле.' },
    { icon: "avoid", k: "Open/closed и where", v: 'Инстанцируешь только <b>closed</b> (constructed) тип, не <code>List&lt;&gt;</code>. <code>where T:struct</code> — <span class="hl">non-nullable</span> value type (<code>int?</code> → CS0453); <code>new()</code> — последним.' },
  ],

  foot: 'урок · <b>generics: механика</b> · 5 анимир. разборов · панель боксинга List<int> vs ArrayList · дизайн <b>mid</b>',
};
