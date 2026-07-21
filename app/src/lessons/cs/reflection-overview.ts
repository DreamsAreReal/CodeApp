/**
 * Lesson: Reflection — обзор (CS.S6.reflection-overview) — expert density, 5 animated
 * deep-dives. Reflection is the runtime's self-description: System.Reflection + System.Type
 * read the metadata baked into a loaded assembly. The containment chain assembly → module →
 * type → member is a real object graph you can walk; a Type you obtain via typeof is not the
 * abstract System.Type but a concrete internal RuntimeType supplied by the CLR; and you can
 * create an instance and invoke a method with nothing but its metadata.
 *
 * SIGNATURE machine panel (s5): the "level below" — typeof(int).GetType().Name is the REAL
 * internal CLR class you actually hold: RuntimeType (REAL run-csharp measurement via this
 * file's exec cards on the app backend, evidence in each card's verify).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from learn.microsoft.com/.../fundamentals/reflection/overview
 *     (microsoft_docs_fetch-verified 2026-07-21, canonical URL ms.date 2024-03-27);
 *   - every card's verify.expect is the REAL stdout of the run-csharp exec cards on the app backend
 *     (c1: RuntimeType · c2: System.Private.Uri / System.Private.Uri.dll · c3: hi / StringBuilder);
 *   - the s5 machine-panel number (a Type is really a RuntimeType) is an OWN measurement.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.reflection-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two entry namespaces (System.Reflection + System.Type) reading assembly metadata.
const Z_API: Zone = { id: "api", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "REFLECTION API", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "System.Reflection", subCls: "vz-zsub", subY: 47 };
const Z_META: Zone = { id: "meta", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕТАДАННЫЕ СБОРКИ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "запечены компилятором", subCls: "vz-zsub heap", subY: 47 };
const API_ZONES: Zone[] = [Z_API, Z_META];

// s2/s3: the containment ladder assembly → module → type → member as one vertical chain.
// Tall zone (h=234 → inner 218u) so three stacked obj rows (measured 212u total) fit with PAD≥8.
const Z_CHAIN: Zone = { id: "chain", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ГРАФ ОБЪЕКТОВ REFLECTION", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "assembly → module → type → member", subCls: "vz-zsub", subY: 40 };
const CHAIN_ZONES: Zone[] = [Z_CHAIN];

// s4: dynamic create + invoke — the metadata lane feeds a live instance lane.
const Z_METAINFO: Zone = { id: "metainfo", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ТОЛЬКО МЕТАДАННЫЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Type + MethodInfo", subCls: "vz-zsub", subY: 47 };
const Z_LIVE: Zone = { id: "live", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЖИВОЙ ЭКЗЕМПЛЯР", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "создан в рантайме", subCls: "vz-zsub heap", subY: 47 };
const CREATE_ZONES: Zone[] = [Z_METAINFO, Z_LIVE];

// s5 (SIGNATURE): the abstract-vs-concrete reveal — what typeof actually hands you.
const Z_DECLARED: Zone = { id: "declared", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЧТО В КОДЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "переменная типа Type", subCls: "vz-zsub", subY: 47 };
const Z_ACTUAL: Zone = { id: "actual", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЧТО В КУЧЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GetType().Name", subCls: "vz-zsub heap", subY: 47 };
const ACTUAL_ZONES: Zone[] = [Z_DECLARED, Z_ACTUAL];

export const reflectionOverview: LessonData = {
  id: "CS.S6.reflection-overview",
  track: "CS",
  section: "CS.S6",
  module: "S6.1",
  lang: "csharp",
  title: "Reflection: обзор и граф метаданных",
  kicker: "C# вглубь · S6 · самоописание рантайма",
  home: { subtitle: "System.Reflection, граф assembly→member, RuntimeType", icon: "types", estMinutes: 9 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-reflection", kind: "doc", org: "Microsoft Learn", title: "Reflection in .NET", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/overview", date: "2024-03-27" },
    { id: "ms-type", kind: "doc", org: "Microsoft Learn", title: "Type Class (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.type", date: "2025-07-01" },
    { id: "ms-activator", kind: "doc", org: "Microsoft Learn", title: "Activator.CreateInstance Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.activator.createinstance", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The classes in the System.Reflection namespace, together with System.Type, enable you to obtain information about loaded assemblies and the types defined within them.» <span class=\"ru-tr\">«Классы из пространства имён System.Reflection вместе с System.Type позволяют получать сведения о загруженных сборках и об определённых в них типах.»</span>", source: "ms-reflection" },
  ],
  edgeCases: [
    { text: "Иерархия вложенности буквальна: «Assemblies contain modules, modules contain types, and types contain members» <span class=\"ru-tr\">«Сборки содержат модули, модули содержат типы, а типы содержат члены»</span> — reflection даёт объект на каждый уровень.", source: "ms-reflection" },
    { text: "<code>CustomAttributeData</code> читает атрибуты <b>без</b> их инстанцирования — «allows you to examine attributes without creating instances of them» <span class=\"ru-tr\">«позволяет изучать атрибуты без создания их экземпляров»</span> (нужно в MetadataLoadContext).", source: "ms-reflection" },
    { text: "Абстрактный <code>Type</code> ты не держишь напрямую: рантайм подсовывает internal-подкласс <code>RuntimeType</code> — все абстрактные методы реализованы там.", source: "ms-reflection" },
  ],

  misconceptions: [
    {
      wrong: "reflection — это медленная магия, которая «как-то» читает мои классы",
      hook: 'Никакой магии: reflection — это <span class="hl">чтение метаданных</span>, которые компилятор уже запёк в сборку. «The classes in the <b>System.Reflection</b> namespace, together with <b>System.Type</b>, enable you to obtain information about loaded assemblies and the types defined within them». <span class="ru-tr">«Классы из пространства имён <b>System.Reflection</b> вместе с <b>System.Type</b> позволяют получать сведения о загруженных сборках и об определённых в них типах».</span> И это не плоский набор строк, а <b>граф объектов</b>: «Assemblies contain modules, modules contain types, and types contain members». <span class="ru-tr">«Сборки содержат модули, модули содержат типы, а типы содержат члены».</span> Дальше <b>пять разборов</b>: два входных namespace, лестница <code>assembly → module → type → member</code>, свой Info-класс на каждый род члена, динамическое создание экземпляра по одному <code>Type</code>, и <b>машинная панель</b> — что за класс на самом деле стоит за <code>typeof</code> (реальный прогон: <code>RuntimeType</code>).',
      source: "ms-reflection",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Вход · два namespace", title: "System.Reflection + System.Type читают метаданные",
      viewBox: "0 0 340 210", zones: API_ZONES,
      code: ["using System.Reflection;", "// метаданные типа уже в сборке —", "// reflection их только читает"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Точка входа — <code>System.Reflection</code> вместе с <code>System.Type</code>. Через них ты <span class="hl">читаешь</span>, а не создаёшь заново.', nodes: [{ id: "api", kind: "chip", at: { zone: "api", row: 0 }, value: "System.Reflection", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'То, что ты читаешь, — <b>метаданные</b>: имена типов, членов, сигнатуры. Компилятор запёк их в сборку при билде.', nodes: [{ id: "api", kind: "chip", at: { zone: "api", row: 0 }, value: "System.Reflection" }, { id: "type", kind: "chip", at: { zone: "api", row: 1 }, value: "System.Type", accent: true }, { id: "md", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "Metadata", value: "типы, члены", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'API читает эту таблицу метаданных из <span class="hl">загруженной сборки</span> — отсюда и «loaded assemblies». <span class="ru-tr">«загруженные сборки».</span>', nodes: [{ id: "api", kind: "chip", at: { zone: "api", row: 0 }, value: "System.Reflection" }, { id: "type", kind: "chip", at: { zone: "api", row: 1 }, value: "System.Type" }, { id: "md", kind: "obj", at: { zone: "meta", row: 0 }, typeTag: "Metadata", value: "типы, члены" }, { id: "asm", kind: "obj", at: { zone: "meta", row: 1 }, typeTag: "Assembly", value: "loaded", accent: true }], edges: [{ id: "e1", from: "type", to: "md", accent: true }] },
      ],
      explain: 'Reflection — это API самоописания рантайма: «The classes in the <b>System.Reflection</b> namespace, together with <b>System.Type</b>, enable you to obtain information about <span class="hl">loaded assemblies</span> and the types defined within them, such as classes, interfaces, and value types». <span class="ru-tr">«Классы из пространства имён <b>System.Reflection</b> вместе с <b>System.Type</b> позволяют получать сведения о загруженных сборках и об определённых в них типах — таких как классы, интерфейсы и типы-значения».</span> Ключевое слово — <b>loaded</b>: ты читаешь метаданные уже загруженной в процесс сборки, которые компилятор записал при билде. И не только читаешь: «You can also use reflection to <b>create type instances at runtime</b>, and to invoke and access them». <span class="ru-tr">«Reflection можно также использовать, чтобы <b>создавать экземпляры типов во время выполнения</b>, а также вызывать их и обращаться к ним».</span> То есть reflection — не «медленная магия», а типизированный доступ к таблице метаданных.',
      sources: ["ms-reflection"],
    },
    {
      id: "s2", num: "02", kicker: "Граф · вложенность", title: "assembly → module → type → member",
      viewBox: "0 0 340 276", zones: CHAIN_ZONES,
      code: ["Assembly a = typeof(string).Assembly;", "Module  m = typeof(string).Module;", "Type    t = typeof(string);", "MethodInfo mi = t.GetMethod(\"Substring\");"],
      scenes: [
        { codeLine: 0, out: "", caption: '<b>Assembly</b> — корень: контейнер, который .NET загрузил в процесс.', nodes: [{ id: "asm", kind: "obj", at: { zone: "chain", row: 0 }, typeTag: "Assembly", value: "System.Private.CoreLib", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Внутри — <b>Module</b>: «Assemblies contain modules». <span class="ru-tr">«Сборки содержат модули».</span> Обычно один .dll на сборку.', nodes: [{ id: "asm", kind: "obj", at: { zone: "chain", row: 0 }, typeTag: "Assembly", value: "System.Private.CoreLib" }, { id: "mod", kind: "obj", at: { zone: "chain", row: 1 }, typeTag: "Module", value: "…CoreLib.dll", accent: true }], edges: [{ id: "e1", from: "mod", to: "asm", accent: true }] },
        { codeLine: 2, out: "", caption: 'В модуле — <b>Type</b>: «modules contain types». <span class="ru-tr">«модули содержат типы».</span> Здесь — <code>String</code>.', nodes: [{ id: "asm", kind: "obj", at: { zone: "chain", row: 0 }, typeTag: "Assembly", value: "…CoreLib" }, { id: "mod", kind: "obj", at: { zone: "chain", row: 1 }, typeTag: "Module", value: "…CoreLib.dll" }, { id: "typ", kind: "obj", at: { zone: "chain", row: 2, col: 0 }, typeTag: "Type", value: "String", accent: true }], edges: [{ id: "e1", from: "mod", to: "asm" }, { id: "e2", from: "typ", to: "mod", accent: true }] },
        { codeLine: 3, out: "", caption: 'В типе — <b>члены</b>: «types contain members». <span class="ru-tr">«типы содержат члены».</span> <code>GetMethod</code> достаёт <span class="hl">MethodInfo</span> для <code>Substring</code>.', nodes: [{ id: "asm", kind: "obj", at: { zone: "chain", row: 0 }, typeTag: "Assembly", value: "…CoreLib" }, { id: "mod", kind: "obj", at: { zone: "chain", row: 1 }, typeTag: "Module", value: "…CoreLib.dll" }, { id: "typ", kind: "obj", at: { zone: "chain", row: 2, col: 0 }, typeTag: "Type", value: "String" }, { id: "mem", kind: "obj", at: { zone: "chain", row: 2, col: 1 }, typeTag: "MethodInfo", value: "Substring", accent: true }], edges: [{ id: "e1", from: "mod", to: "asm" }, { id: "e2", from: "typ", to: "mod" }, { id: "e3", from: "mem", to: "typ", accent: true }] },
      ],
      explain: 'Reflection отражает <b>физическую вложенность</b> сборки один-к-одному: «<span class="hl">Assemblies contain modules, modules contain types, and types contain members</span>. Reflection provides objects that encapsulate assemblies, modules, and types». <span class="ru-tr">«Сборки содержат модули, модули содержат типы, а типы содержат члены. Reflection предоставляет объекты, которые инкапсулируют сборки, модули и типы».</span> Каждый уровень — свой класс: <code>Assembly</code>, <code>Module</code>, <code>Type</code>, а члены — <code>MethodInfo</code>/<code>FieldInfo</code>/<code>PropertyInfo</code>/<code>ConstructorInfo</code>. Спускаешься по графу навигационными свойствами (<code>.Assembly</code>, <code>.Module</code>) и методами-геттерами (<code>GetMethod</code>, <code>GetFields</code>). Это не строки — это связанный объектный граф метаданных.',
      sources: ["ms-reflection"],
    },
    {
      id: "s3", num: "03", kicker: "Члены · какой Info", title: "У каждого рода члена — свой Info-класс",
      viewBox: "0 0 340 276", zones: CHAIN_ZONES,
      code: ["t.GetMethod(...)      // MethodInfo", "t.GetField(...)       // FieldInfo", "t.GetProperty(...)    // PropertyInfo", "t.GetConstructor(...) // ConstructorInfo"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Метод → <b>MethodInfo</b>: имя, тип возврата, параметры, <code>abstract</code>/<code>virtual</code>.', nodes: [{ id: "mi", kind: "obj", at: { zone: "chain", row: 0, col: 0 }, typeTag: "MethodInfo", value: "имя, возврат", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Поле → <b>FieldInfo</b>: имя, модификаторы, <code>static</code> — и <span class="hl">get/set значения</span>.', nodes: [{ id: "mi", kind: "obj", at: { zone: "chain", row: 0, col: 0 }, typeTag: "MethodInfo", value: "имя, возврат" }, { id: "fi", kind: "obj", at: { zone: "chain", row: 0, col: 1 }, typeTag: "FieldInfo", value: "get/set", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Свойство → <b>PropertyInfo</b>: тип данных, read-only/writable, get/set значения.', nodes: [{ id: "mi", kind: "obj", at: { zone: "chain", row: 0, col: 0 }, typeTag: "MethodInfo", value: "имя, возврат" }, { id: "fi", kind: "obj", at: { zone: "chain", row: 0, col: 1 }, typeTag: "FieldInfo", value: "get/set" }, { id: "pi", kind: "obj", at: { zone: "chain", row: 1, col: 0 }, typeTag: "PropertyInfo", value: "read/write", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Конструктор → <b>ConstructorInfo</b>. Плюс <code>ParameterInfo</code>, <code>EventInfo</code> — каждый род <span class="hl">члена свой класс</span>.', nodes: [{ id: "mi", kind: "obj", at: { zone: "chain", row: 0, col: 0 }, typeTag: "MethodInfo", value: "имя, возврат" }, { id: "fi", kind: "obj", at: { zone: "chain", row: 0, col: 1 }, typeTag: "FieldInfo", value: "get/set" }, { id: "pi", kind: "obj", at: { zone: "chain", row: 1, col: 0 }, typeTag: "PropertyInfo", value: "read/write" }, { id: "ci", kind: "obj", at: { zone: "chain", row: 1, col: 1 }, typeTag: "ConstructorInfo", value: "ctor", accent: true }], edges: [] },
      ],
      explain: 'Члены — не однородный список: у каждого рода свой Info-класс с профильными данными. «Use <b>MethodInfo</b> to discover information such as the name, return type, parameters, access modifiers, and implementation details (such as <code>abstract</code> or <code>virtual</code>) of a method». <span class="ru-tr">«Используйте <b>MethodInfo</b>, чтобы узнать такие сведения, как имя, тип возвращаемого значения, параметры, модификаторы доступа и детали реализации (например, <code>abstract</code> или <code>virtual</code>) метода».</span> «Use <b>FieldInfo</b> to discover information such as the name, access modifiers, and implementation details (such as <code>static</code>) of a field, and <span class="hl">to get or set field values</span>». <span class="ru-tr">«Используйте <b>FieldInfo</b>, чтобы узнать такие сведения, как имя, модификаторы доступа и детали реализации (например, <code>static</code>) поля, а также чтобы читать или задавать значения поля».</span> Аналогично <code>PropertyInfo</code>, <code>ConstructorInfo</code>, <code>ParameterInfo</code>, <code>EventInfo</code>. Info-объект — не только «описание»: через него можно <b>читать/писать</b> значения и <b>вызывать</b> метод.',
      sources: ["ms-reflection"],
    },
    {
      id: "s4", num: "04", kicker: "Создать и вызвать · рантайм", title: "Из одного Type — живой экземпляр и вызов метода",
      viewBox: "0 0 340 210", zones: CREATE_ZONES,
      code: ["Type t = typeof(StringBuilder);", "object sb = Activator.CreateInstance(t);", "var m = t.GetMethod(\"Append\", new[]{typeof(string)});", "m.Invoke(sb, new object[]{\"hi\"});"],
      predictAt: 3, predictQ: 'После <code>Invoke(sb, "hi")</code> — что напечатает <code>sb.ToString()</code> и <code>sb.GetType().Name</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'На входе — только <b>метаданные</b>: объект <code>Type</code> для <code>StringBuilder</code>. Экземпляра ещё нет.', nodes: [{ id: "t", kind: "obj", at: { zone: "metainfo", row: 0 }, typeTag: "Type", value: "StringBuilder", accent: true }, { id: "none", kind: "chip", at: { zone: "live", row: 0 }, value: "пусто" }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Activator.CreateInstance(t)</code> — <span class="hl">создаёт живой экземпляр</span> по метаданным. Куча получила настоящий StringBuilder.', nodes: [{ id: "t", kind: "obj", at: { zone: "metainfo", row: 0 }, typeTag: "Type", value: "StringBuilder" }, { id: "sb", kind: "obj", at: { zone: "live", row: 0 }, typeTag: "StringBuilder", value: "\"\"", accent: true }], edges: [{ id: "e1", from: "t", to: "sb", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>GetMethod("Append", [string])</code> — берём <b>MethodInfo</b> нужной перегрузки (по типам параметров).', nodes: [{ id: "t", kind: "obj", at: { zone: "metainfo", row: 0 }, typeTag: "Type", value: "StringBuilder" }, { id: "m", kind: "obj", at: { zone: "metainfo", row: 1 }, typeTag: "MethodInfo", value: "Append(string)", accent: true }, { id: "sb", kind: "obj", at: { zone: "live", row: 0 }, typeTag: "StringBuilder", value: "\"\"" }], edges: [] },
        { codeLine: 3, out: "hi\nStringBuilder", caption: '<code>m.Invoke(sb, ["hi"])</code> — вызов через метаданные меняет <span class="hl">реальный</span> объект: <code>ToString() = "hi"</code>, тип = <b>StringBuilder</b> (реальный прогон).', nodes: [{ id: "t", kind: "obj", at: { zone: "metainfo", row: 0 }, typeTag: "Type", value: "StringBuilder" }, { id: "m", kind: "obj", at: { zone: "metainfo", row: 1 }, typeTag: "MethodInfo", value: "Append(string)" }, { id: "sb", kind: "obj", at: { zone: "live", row: 0 }, typeTag: "StringBuilder", value: "\"hi\"", accent: true }], edges: [{ id: "e2", from: "m", to: "sb", accent: true }] },
      ],
      explain: 'Метаданных достаточно, чтобы <b>создать</b> объект и <b>вызвать</b> его метод — без знания типа в коде: «You can use reflection to dynamically <span class="hl">create an instance of a type</span>… You can then invoke the type\'s methods or access its fields and properties». <span class="ru-tr">«Reflection можно использовать, чтобы динамически создать экземпляр типа… После этого можно вызывать методы типа либо обращаться к его полям и свойствам».</span> <code>Activator.CreateInstance(t)</code> строит экземпляр по <code>Type</code>, <code>t.GetMethod(name, paramTypes)</code> находит перегрузку, <code>MethodInfo.Invoke(target, args)</code> её выполняет. Реальный вывод — <code>hi</code> и <code>StringBuilder</code>: изменился настоящий объект в куче. Так работают DI-контейнеры, сериализаторы, плагины — тип известен только в рантайме.',
      sources: ["ms-reflection", "ms-activator"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · что реально держишь", title: "typeof отдаёт не Type, а RuntimeType",
      viewBox: "0 0 340 210", zones: ACTUAL_ZONES,
      code: ["Type t = typeof(int);", "Console.WriteLine(t.GetType().Name);", "// какой класс стоит за t на самом деле?"],
      predictAt: 1, predictQ: 'Переменная объявлена как <code>Type</code>. Что напечатает <code>t.GetType().Name</code> — какой класс лежит в куче?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В коде <code>t</code> — статически <b>Type</b>. Но <code>Type</code> <span class="hl">абстрактный</span>: инстанцировать его нельзя.', nodes: [{ id: "decl", kind: "obj", at: { zone: "declared", row: 0 }, typeTag: "t", value: "Type (abstract)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Значит в куче лежит какой-то <b>конкретный подкласс</b>. Спросим сам объект: <code>t.GetType()</code>.', nodes: [{ id: "decl", kind: "obj", at: { zone: "declared", row: 0 }, typeTag: "t", value: "Type (abstract)" }, { id: "q", kind: "gate", at: { zone: "actual", row: 0 }, state: "ok", label: "t.GetType()", detail: "?" }], edges: [{ id: "e", from: "decl", to: "q", accent: true }] },
        { codeLine: 2, out: "RuntimeType", caption: 'Ответ — <span class="hl">RuntimeType</span>: internal-класс CLR, что реализует все абстрактные методы <code>Type</code> (реальный прогон). Вот уровень ниже <code>typeof</code>.', nodes: [{ id: "decl", kind: "obj", at: { zone: "declared", row: 0 }, typeTag: "t", value: "Type (abstract)" }, { id: "rt", kind: "obj", at: { zone: "actual", row: 0 }, typeTag: "GetType()", value: "RuntimeType", accent: true }], edges: [{ id: "e", from: "decl", to: "rt" }] },
      ],
      explain: 'Это машинная панель урока — реально снятое имя класса. Ты пишешь <code>Type</code>, но <b>не держишь</b> его: «when you use reflection, you don\'t work directly with these classes, most of which are <span class="hl">abstract</span>… Instead, you work with types provided by the common language runtime (CLR)». <span class="ru-tr">«когда вы используете reflection, вы не работаете напрямую с этими классами — большинство из них абстрактные… Вместо этого вы работаете с типами, которые предоставляет общеязыковая среда выполнения (CLR)».</span> Конкретно: «when you use the C# <code>typeof</code> operator… to obtain a <code>Type</code> object, the object is really a <b>RuntimeType</b>. <code>RuntimeType</code> derives from <code>Type</code> and provides implementations of all the abstract methods». <span class="ru-tr">«когда вы используете оператор C# <code>typeof</code>… чтобы получить объект <code>Type</code>, этот объект на самом деле является <b>RuntimeType</b>. <code>RuntimeType</code> наследуется от <code>Type</code> и предоставляет реализации всех абстрактных методов».</span> Собственный прогон подтверждает: <code>typeof(int).GetType().Name</code> → <b>RuntimeType</b> — internal-класс, не документируемый отдельно, потому что описан базой. Абстракция <code>Type</code> — фасад над рантайм-реализацией.',
      sources: ["ms-reflection"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type t = typeof(int);</code><br/><code>Console.WriteLine(t.GetType().Name);</code> — что напечатает (какой класс реально стоит за <code>t</code>)?',
      options: ["RuntimeType", "Type", "Int32", "System.Type"], correctIndex: 0, xp: 10,
      okText: 'Ты объявил <code>Type</code>, но <code>Type</code> <b>абстрактный</b> — в куче лежит его CLR-подкласс <span class="hl">RuntimeType</span>. «the object is really a RuntimeType. RuntimeType derives from Type». <span class="ru-tr">«этот объект на самом деле является RuntimeType. RuntimeType наследуется от Type».</span>',
      noText: 'Не путай «что за тип отражаем» (<code>int</code>) с «какой класс у самого Type-объекта». <code>t.GetType()</code> смотрит на run-time класс объекта <code>t</code> — это <b>RuntimeType</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "RuntimeType" }, sourceRefs: ["ms-reflection"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type t = typeof(Uri);</code><br/><code>Console.WriteLine(t.Assembly.GetName().Name); Console.WriteLine(t.Module.Name);</code> — обе строки?',
      options: ["System.Private.Uri\\nSystem.Private.Uri.dll", "System.Uri\\nUri.dll", "System.Private.CoreLib\\nSystem.Private.CoreLib.dll", "Uri\\nSystem.Private.Uri.dll"], correctIndex: 0, xp: 10,
      okText: 'Граф <b>assembly → module</b>: <code>Uri</code> живёт в сборке <span class="hl">System.Private.Uri</span>, её модуль — одноимённый .dll. «Assemblies contain modules, modules contain types». <span class="ru-tr">«Сборки содержат модули, модули содержат типы».</span>',
      noText: '<code>.Assembly.GetName().Name</code> даёт имя <b>сборки</b> (не типа), <code>.Module.Name</code> — файл модуля. Для <code>Uri</code> это <code>System.Private.Uri</code> и <code>System.Private.Uri.dll</code> (реальный прогон).',
      verify: { kind: "exec", run: "dotnet run", expect: "System.Private.Uri\nSystem.Private.Uri.dll" }, sourceRefs: ["ms-reflection"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type t = typeof(StringBuilder); object sb = Activator.CreateInstance(t);</code><br/><code>t.GetMethod("Append", new[]{typeof(string)}).Invoke(sb, new object[]{"hi"}); Console.WriteLine(sb); Console.WriteLine(sb.GetType().Name);</code> — обе строки?',
      options: ["hi\\nStringBuilder", "\\nStringBuilder", "hi\\nType", "StringBuilder\\nhi"], correctIndex: 0, xp: 10,
      okText: 'По одному <code>Type</code> reflection <b>создала</b> экземпляр (<code>CreateInstance</code>) и <b>вызвала</b> метод (<code>Invoke</code>) — изменился <span class="hl">реальный</span> объект: <code>ToString()="hi"</code>, тип <b>StringBuilder</b>.',
      noText: '<code>Activator.CreateInstance</code> строит настоящий объект, <code>MethodInfo.Invoke</code> реально его меняет: <code>sb</code> печатает <b>hi</b>, а <code>GetType().Name</code> — <b>StringBuilder</b>. «create an instance of a type… then invoke the type\'s methods». <span class="ru-tr">«создать экземпляр типа… после чего вызывать методы типа».</span>',
      verify: { kind: "exec", run: "dotnet run", expect: "hi\nStringBuilder" }, sourceRefs: ["ms-reflection", "ms-activator"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что это", v: 'Reflection = <span class="hl">чтение метаданных</span> загруженной сборки через <code>System.Reflection</code> + <code>System.Type</code>. Компилятор их запёк — ты только читаешь и вызываешь.' },
    { icon: "cost", k: "Граф", v: '<code>assembly → module → type → member</code> — связанный объектный граф. У члена свой Info-класс (<code>MethodInfo</code>/<code>FieldInfo</code>/…), через него можно <b>читать/писать/вызывать</b>.' },
    { icon: "avoid", k: "Уровень ниже", v: '<code>typeof</code> отдаёт не абстрактный <code>Type</code>, а internal <span class="hl">RuntimeType</span> от CLR. По одному <code>Type</code> можно <code>Activator.CreateInstance</code> + <code>Invoke</code> — основа DI и сериализаторов.' },
  ],

  foot: 'урок · <b>reflection: обзор</b> · 5 анимир. разборов · граф assembly→member · панель RuntimeType · дизайн <b>mid</b>',
};
