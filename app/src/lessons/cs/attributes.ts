/**
 * Lesson: Атрибуты — создание и чтение (CS.S6.attributes) — expert density, 5 animated
 * deep-dives. An attribute is metadata welded onto a declaration at compile time; you define
 * one by deriving from System.Attribute (AttributeUsage restricts its targets); its parameters
 * split into POSITIONAL (constructor args, required) and NAMED (properties/fields, optional);
 * and reflection reconstructs the attribute OBJECT at runtime via GetCustomAttribute (null when
 * absent).
 *
 * SIGNATURE machine panel (s5): the two parameter kinds, read back from IL metadata into a live
 * object — positional Name=api (constructor arg) and named Cached=True (property) — an own
 * run-csharp measurement on :5103.
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM: the attribute definition + parameter kinds from
 *     learn.microsoft.com/.../csharp/advanced-topics/reflection-and-attributes/ (ms.date 2025-03-14),
 *     the retrieval two-step + null-when-absent + AllowMultiple from
 *     learn.microsoft.com/.../standard/attributes/retrieving-information-stored-in-attributes
 *     (ms.date 2022-08-05) (microsoft_docs_fetch-verified 2026-07-21);
 *   - every card verify.expect is REAL run-csharp stdout on :5103
 *     (c1: ada/2 · c2: positional Name=api/named Cached=True · c3: True/0).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.attributes/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the declaration with an attribute literal welded into its metadata.
const Z_DECL: Zone = { id: "decl", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ДЕКЛАРАЦИЯ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "[Info] class Widget", subCls: "vz-zsub", subY: 47 };
const Z_MD: Zone = { id: "md", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕТАДАННЫЕ IL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "атрибут запечён", subCls: "vz-zsub heap", subY: 47 };
const DECL_ZONES: Zone[] = [Z_DECL, Z_MD];

// s2: defining a custom attribute — derive from Attribute + AttributeUsage sets targets.
// Tall zone (h=210 → inner 194u) so three stacked rows (obj + gate + chip, measured 180u)
// fit with PAD≥8.
const Z_DEF: Zone = { id: "def", x: 14, y: 34, w: 312, h: 210, cls: "vz-zone", label: "ОПРЕДЕЛЕНИЕ АТРИБУТА", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: ": Attribute + [AttributeUsage]", subCls: "vz-zsub", subY: 47 };
const DEF_ZONES: Zone[] = [Z_DEF];

// s3: positional (ctor) vs named (property) parameters.
const Z_POS: Zone = { id: "pos", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "POSITIONAL", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "аргументы ctor", subCls: "vz-zsub", subY: 47 };
const Z_NAMED: Zone = { id: "named", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "NAMED", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "свойства / поля", subCls: "vz-zsub heap", subY: 47 };
const PARAM_ZONES: Zone[] = [Z_POS, Z_NAMED];

// s4: read it back — GetCustomAttribute reconstructs the object, or null if absent.
const Z_TARGET: Zone = { id: "target", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЦЕЛЬ · Type/MethodInfo", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "GetCustomAttribute", subCls: "vz-zsub", subY: 47 };
const Z_INSTANCE: Zone = { id: "instance", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЖИВОЙ ОБЪЕКТ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "или null", subCls: "vz-zsub heap", subY: 47 };
const READ_ZONES: Zone[] = [Z_TARGET, Z_INSTANCE];

// s5 (SIGNATURE): both parameter kinds reconstructed from IL — positional + named.
const Z_LIT: Zone = { id: "lit", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЛИТЕРАЛ В КОДЕ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "[Tag(\"api\", Cached=true)]", subCls: "vz-zsub", subY: 47 };
const Z_OBJ: Zone = { id: "obj", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ОБЪЕКТ ИЗ МЕТАДАННЫХ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "реальный прогон", subCls: "vz-zsub good", subY: 47 };
const RECON_ZONES: Zone[] = [Z_LIT, Z_OBJ];

export const attributes: LessonData = {
  id: "CS.S6.attributes",
  track: "CS",
  section: "CS.S6",
  module: "S6.4",
  lang: "csharp",
  title: "Атрибуты: создание и чтение",
  kicker: "C# вглубь · S6 · метаданные на декларации",
  home: { subtitle: "custom attribute, AttributeUsage, positional/named, GetCustomAttribute", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-attr", kind: "doc", org: "Microsoft Learn", title: "Attributes and reflection (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/reflection-and-attributes/", date: "2025-03-14" },
    { id: "ms-attr-retrieve", kind: "doc", org: "Microsoft Learn", title: "Retrieving Information Stored in Attributes", url: "https://learn.microsoft.com/en-us/dotnet/standard/attributes/retrieving-information-stored-in-attributes", date: "2022-08-05" },
    { id: "ms-attrusage", kind: "doc", org: "Microsoft Learn", title: "AttributeUsageAttribute Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.attributeusageattribute", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Attributes provide a powerful way to associate metadata, or declarative information, with code (assemblies, types, methods, properties, and so on).» <span class=\"ru-tr\">«Атрибуты дают мощный способ связать метаданные, или декларативную информацию, с кодом (сборками, типами, методами, свойствами и так далее).»</span>", source: "ms-attr" },
  ],
  edgeCases: [
    { text: "Читаешь атрибут — <b>конструируешь объект</b>: «declare an instance of the attribute… use the <code>Attribute.GetCustomAttribute</code> method to initialize the new attribute». <span class=\"ru-tr\">«объяви экземпляр атрибута… используй метод <code>Attribute.GetCustomAttribute</code>, чтобы инициализировать новый атрибут».</span>", source: "ms-attr-retrieve" },
    { text: "Нет атрибута → <span class=\"hl\">null</span>: «If the attribute isn't found, the <code>GetCustomAttribute</code> method initializes… to a null value». <span class=\"ru-tr\">«Если атрибут не найден, метод <code>GetCustomAttribute</code> инициализирует… значением null».</span>", source: "ms-attr-retrieve" },
    { text: "Несколько экземпляров на цель → нужен «<code>AllowMultiple</code> property set to <b>true</b> in the <code>AttributeUsageAttribute</code>» <span class=\"ru-tr\">«свойство <code>AllowMultiple</code>, установленное в <b>true</b> в <code>AttributeUsageAttribute</code>»</span> + <code>GetCustomAttributes</code> (массив).", source: "ms-attr-retrieve" },
  ],

  misconceptions: [
    {
      wrong: "атрибут — это «активная» аннотация, которая сама что-то делает при загрузке класса",
      hook: 'Атрибут <b>ничего не делает сам</b>: это <span class="hl">пассивные метаданные</span>, впаянные в декларацию. «Attributes provide a powerful way to associate <b>metadata, or declarative information</b>, with code». <span class="ru-tr">«Атрибуты дают мощный способ связать <b>метаданные, или декларативную информацию</b>, с кодом».</span> Пока кто-то (фреймворк, ты) не <b>прочитает</b> их через reflection — они молчат: «After you associate an attribute with a program entity, you can <b>query</b> the attribute at run time by using… reflection». <span class="ru-tr">«После того как ты связал атрибут с программной сущностью, ты можешь <b>запросить</b> этот атрибут во время выполнения с помощью… reflection».</span> И чтение — это <b>конструирование объекта</b>: «declare an instance of the attribute… use <code>Attribute.GetCustomAttribute</code> to initialize the new attribute». <span class="ru-tr">«объяви экземпляр атрибута… используй <code>Attribute.GetCustomAttribute</code>, чтобы инициализировать новый атрибут».</span> Дальше <b>пять разборов</b>: метаданные на декларации, определение своего атрибута, positional vs named параметры, чтение (или null), и <b>машинная панель</b> — оба вида параметров, восстановленные из IL в живой объект (реальный прогон).',
      source: "ms-attr",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Атрибут · метаданные на декларации", title: "[Info] впаивает данные в метаданные типа",
      viewBox: "0 0 340 210", zones: DECL_ZONES,
      code: ["[Info(\"ada\", Version = 2)]", "class Widget { }", "// атрибут не «работает» — он лежит в метаданных"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>[Info("ada", Version=2)]</code> над классом — это <b>декларативная</b> пометка в квадратных скобках.', nodes: [{ id: "d", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "class Widget", value: "[Info]", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Компилятор <span class="hl">впаивает</span> её в метаданные типа Widget — как и имена членов, это часть IL.', nodes: [{ id: "d", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "class Widget", value: "[Info]" }, { id: "m", kind: "obj", at: { zone: "md", row: 0 }, typeTag: "Metadata", value: "Info: ada, 2", accent: true }], edges: [{ id: "e", from: "d", to: "m", accent: true }] },
        { codeLine: 2, out: "", caption: 'Сам по себе атрибут <b>ничего не делает</b> при загрузке: он ждёт, пока кто-то его <span class="hl">прочитает</span> reflection-ом.', nodes: [{ id: "d", kind: "obj", at: { zone: "decl", row: 0 }, typeTag: "class Widget", value: "[Info]" }, { id: "m", kind: "obj", at: { zone: "md", row: 0 }, typeTag: "Metadata", value: "Info: ada, 2" }, { id: "wait", kind: "chip", at: { zone: "md", row: 1 }, value: "пассивно ждёт", accent: true }], edges: [{ id: "e", from: "d", to: "m" }] },
      ],
      explain: 'Атрибут — это <b>данные</b>, а не поведение: «Attributes provide a powerful way to associate <span class="hl">metadata, or declarative information</span>, with code (assemblies, types, methods, properties, and so on)». <span class="ru-tr">«Атрибуты дают мощный способ связать метаданные, или декларативную информацию, с кодом (сборками, типами, методами, свойствами и так далее)».</span> Первое свойство доки прямое: «Attributes <b>add metadata</b> to your program. <i>Metadata</i> is information about the types defined in a program». <span class="ru-tr">«Атрибуты <b>добавляют метаданные</b> к твоей программе. <i>Метаданные</i> — это информация о типах, определённых в программе».</span> Компилятор записывает атрибут в ту же таблицу метаданных сборки, что и имена типов/членов. Ключевое: он пассивен, пока не прочитан — «After you associate an attribute with a program entity, you can <b>query</b> the attribute at run time by using… reflection». <span class="ru-tr">«После того как ты связал атрибут с программной сущностью, ты можешь <b>запросить</b> этот атрибут во время выполнения с помощью… reflection».</span> Никакого кода «при загрузке» атрибут не запускает.',
      sources: ["ms-attr"],
    },
    {
      id: "s2", num: "02", kicker: "Свой атрибут · : Attribute", title: "Определить = наследовать Attribute, ограничить AttributeUsage",
      viewBox: "0 0 340 252", zones: DEF_ZONES,
      code: ["[AttributeUsage(AttributeTargets.Class)]", "class InfoAttribute : Attribute {", "  public string Author;", "  public InfoAttribute(string a) => Author = a; }"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Свой атрибут — обычный класс, что <span class="hl">наследует <code>System.Attribute</code></span>. Суффикс «Attribute» — конвенция.', nodes: [{ id: "cls", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "InfoAttribute", value: ": Attribute", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: '<code>[AttributeUsage(AttributeTargets.Class)]</code> — где его можно ставить. Здесь: только на <b>классы</b>.', nodes: [{ id: "cls", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "InfoAttribute", value: ": Attribute" }, { id: "usage", kind: "gate", at: { zone: "def", row: 1 }, state: "ok", label: "AttributeUsage", detail: "Targets.Class", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Данные атрибута — <b>поля и свойства</b>, а конструктор задаёт обязательные значения. Так атрибут «принимает аргументы».', nodes: [{ id: "cls", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "InfoAttribute", value: ": Attribute" }, { id: "usage", kind: "gate", at: { zone: "def", row: 1 }, state: "ok", label: "AttributeUsage", detail: "Targets.Class" }, { id: "data", kind: "chip", at: { zone: "def", row: 2 }, value: "Author · ctor(a)", accent: true }], edges: [] },
      ],
      explain: 'Свой атрибут = класс-наследник <code>System.Attribute</code>. По конвенции: «all attribute names end with the suffix "Attribute"… you don\'t need to specify the attribute suffix when you use attributes in code» <span class="ru-tr">«все имена атрибутов заканчиваются суффиксом "Attribute"… тебе не нужно указывать суффикс атрибута, когда ты используешь атрибуты в коде»</span> — <code>[Info]</code> и <code>[InfoAttribute]</code> эквивалентны. <code>AttributeUsage</code> ограничивает цели («A specific attribute might restrict the types of declarations on which it\'s valid» <span class="ru-tr">«Конкретный атрибут может ограничивать типы деклараций, на которых он допустим»</span>): <code>AttributeTargets.Class</code>, <code>.Method</code>, <code>.Property</code> и т.д. А «Attributes can <b>accept arguments</b> in the same way as methods and properties» <span class="ru-tr">«Атрибуты могут <b>принимать аргументы</b> так же, как методы и свойства»</span> — через конструктор и свойства. Никакого спец-синтаксиса: обычный класс, чьи экземпляры создаёт компилятор из литерала.',
      sources: ["ms-attr", "ms-attrusage"],
    },
    {
      id: "s3", num: "03", kicker: "Параметры · positional vs named", title: "Positional — аргументы ctor, named — свойства",
      viewBox: "0 0 340 210", zones: PARAM_ZONES,
      code: ["[Tag(\"api\", Cached = true)]", "//   ^^^^^ positional  ^^^^^^^^^^ named", "// \"api\"     → аргумент конструктора", "// Cached=true → свойство/поле атрибута"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>"api"</code> — <b>positional</b>: идёт в <span class="hl">конструктор</span>, обязателен, порядок фиксирован.', nodes: [{ id: "p", kind: "obj", at: { zone: "pos", row: 0 }, typeTag: "ctor(name)", value: "\"api\"", accent: true }], edges: [] },
        { codeLine: 0, out: "", caption: '<code>Cached = true</code> — <b>named</b>: присваивает <span class="hl">свойство/поле</span>, опционален, порядок любой.', nodes: [{ id: "p", kind: "obj", at: { zone: "pos", row: 0 }, typeTag: "ctor(name)", value: "\"api\"" }, { id: "n", kind: "obj", at: { zone: "named", row: 0 }, typeTag: "Cached", value: "= true", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Итог: positional задаёт <b>ctor</b>-аргументы, named — присваивания полям. Один литерал → две разные механики.', nodes: [{ id: "p", kind: "gate", at: { zone: "pos", row: 0 }, state: "ok", label: "positional", detail: "ctor · required", accent: true }, { id: "n", kind: "gate", at: { zone: "named", row: 0 }, state: "ok", label: "named", detail: "property · optional", accent: true }], edges: [] },
      ],
      explain: 'Параметры атрибута — двух родов: «Many attributes have parameters, which can be <b>positional</b>, unnamed, or <b>named</b>». <span class="ru-tr">«У многих атрибутов есть параметры, которые могут быть <b>позиционными</b>, безымянными, или <b>именованными</b>».</span> Positional — «<span class="hl">Parameters of the attribute constructor</span>» <span class="ru-tr">«Параметры конструктора атрибута»</span>: обязательны, идут первыми, в фиксированном порядке. Named — «<span class="hl">Properties or fields of the attribute</span>» <span class="ru-tr">«Свойства или поля атрибута»</span>: опциональны, после позиционных, в любом порядке. Пример доки — три эквивалентных <code>DllImport</code>: <code>[DllImport("user32.dll", SetLastError=false, ExactSpelling=false)]</code>, где имя dll позиционно, а остальное — named-присваивания свойств. Компилятор кодирует и то, и другое в метаданные литерала.',
      sources: ["ms-attr"],
    },
    {
      id: "s4", num: "04", kicker: "Чтение · GetCustomAttribute", title: "Reflection восстанавливает объект атрибута (или null)",
      viewBox: "0 0 340 210", zones: READ_ZONES,
      code: ["var attr = typeof(Widget).GetCustomAttribute<InfoAttribute>();", "if (attr != null) Console.WriteLine(attr.Author);", "// на типе без [Info] attr == null"],
      predictAt: 1, predictQ: 'На <code>Widget</code> висит <code>[Info("ada")]</code>. Что вернёт <code>GetCustomAttribute&lt;InfoAttribute&gt;().Author</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Цель — <code>Type</code> (или <code>MethodInfo</code>/<code>PropertyInfo</code>). <code>GetCustomAttribute</code> ищет в её метаданных.', nodes: [{ id: "t", kind: "obj", at: { zone: "target", row: 0 }, typeTag: "typeof(Widget)", value: "GetCustom…", accent: true }], edges: [] },
        { codeLine: 1, out: "ada", caption: 'Атрибут есть → reflection <span class="hl">конструирует объект</span> <code>InfoAttribute</code> из метаданных. <code>attr.Author = "ada"</code> (реальный прогон).', nodes: [{ id: "t", kind: "obj", at: { zone: "target", row: 0 }, typeTag: "typeof(Widget)", value: "GetCustom…" }, { id: "a", kind: "obj", at: { zone: "instance", row: 0 }, typeTag: "InfoAttribute", value: "Author=ada", accent: true }], edges: [{ id: "e", from: "t", to: "a", accent: true }] },
        { codeLine: 2, out: "ada", caption: 'На типе <b>без</b> <code>[Info]</code> — <code>GetCustomAttribute</code> вернёт <span class="hl">null</span>. Отсюда обязательная проверка на null.', nodes: [{ id: "t", kind: "obj", at: { zone: "target", row: 0 }, typeTag: "typeof(Widget)", value: "GetCustom…" }, { id: "a", kind: "obj", at: { zone: "instance", row: 0 }, typeTag: "InfoAttribute", value: "Author=ada" }, { id: "nul", kind: "gate", at: { zone: "instance", row: 1 }, state: "fail", label: "нет атрибута", detail: "→ null", accent: true }], edges: [] },
      ],
      explain: 'Чтение атрибута — <b>двухшаговый</b> процесс с конструированием объекта: «Retrieving a custom attribute is a simple process. First, declare an instance of the attribute you want to retrieve. Then, use the <code>Attribute.GetCustomAttribute</code> method to <span class="hl">initialize the new attribute</span> to the value of the attribute you want to retrieve. Once the new attribute is initialized, you can use its <b>properties</b> to get the values». <span class="ru-tr">«Получение пользовательского атрибута — простой процесс. Сначала объяви экземпляр атрибута, который хочешь получить. Затем используй метод <code>Attribute.GetCustomAttribute</code>, чтобы инициализировать новый атрибут значением того атрибута, который хочешь получить. Как только новый атрибут инициализирован, можешь использовать его <b>свойства</b>, чтобы получить значения».</span> То есть reflection читает метаданные литерала и <b>воссоздаёт</b> экземпляр атрибута с теми значениями. Если атрибута нет: «If the attribute isn\'t found, the <code>GetCustomAttribute</code> method initializes… to a <b>null</b> value» <span class="ru-tr">«Если атрибут не найден, метод <code>GetCustomAttribute</code> инициализирует… значением <b>null</b>»</span> — поэтому проверка на null обязательна. Для нескольких экземпляров — <code>GetCustomAttributes</code> (массив) + <code>AllowMultiple = true</code>.',
      sources: ["ms-attr-retrieve"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · оба параметра из IL", title: "Из литерала в IL и обратно в объект: positional + named",
      viewBox: "0 0 340 210", zones: RECON_ZONES,
      code: ["[Tag(\"api\", Cached = true)] class Svc {}", "var a = typeof(Svc).GetCustomAttribute<TagAttribute>();", "Console.WriteLine($\"positional Name={a.Name}\");", "Console.WriteLine($\"named Cached={a.Cached}\");"],
      predictAt: 1, predictQ: '<code>[Tag("api", Cached=true)]</code>: reflection восстановит объект. Что в <code>a.Name</code> (positional) и <code>a.Cached</code> (named)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В коде — литерал: positional <code>"api"</code> в ctor, named <code>Cached=true</code> в свойство. Компилятор кодирует оба в IL.', nodes: [{ id: "lit", kind: "obj", at: { zone: "lit", row: 0 }, typeTag: "[Tag(...)]", value: "api · Cached", accent: true }], edges: [] },
        { codeLine: 2, out: "positional Name=api", caption: 'Reflection читает IL и <span class="hl">воссоздаёт объект</span>: ctor получил <code>"api"</code> → <code>a.Name = api</code> (реальный прогон).', nodes: [{ id: "lit", kind: "obj", at: { zone: "lit", row: 0 }, typeTag: "[Tag(...)]", value: "api · Cached" }, { id: "obj", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Name (ctor)", value: "api", accent: true }], edges: [{ id: "e", from: "lit", to: "obj", accent: true }] },
        { codeLine: 3, out: "positional Name=api\nnamed Cached=True", caption: 'И свойство: named-присваивание восстановлено → <code>a.Cached = <b>True</b></code>. Оба вида параметров — из одних метаданных (реальный прогон).', nodes: [{ id: "lit", kind: "obj", at: { zone: "lit", row: 0 }, typeTag: "[Tag(...)]", value: "api · Cached" }, { id: "obj", kind: "obj", at: { zone: "obj", row: 0 }, typeTag: "Name (ctor)", value: "api" }, { id: "obj2", kind: "obj", at: { zone: "obj", row: 1 }, typeTag: "Cached (prop)", value: "True", accent: true }], edges: [{ id: "e", from: "lit", to: "obj" }] },
      ],
      explain: 'Это машинная панель урока — реально восстановленный объект. Литерал <code>[Tag("api", Cached=true)]</code> компилятор раскладывает в метаданные: позиционный аргумент — в запись вызова конструктора, named — в именованное присваивание. Reflection читает обе части и <b>конструирует</b> живой <code>TagAttribute</code>: собственный прогон даёт <b>positional Name=api</b> и <b>named Cached=True</b>. Это доказывает механику: атрибут в рантайме — не «строка-аннотация», а полноценный объект, чьи ctor-аргументы и свойства восстановлены из IL. На этом стоят ASP.NET-роутинг (<code>[HttpPost]</code>), сериализация, валидация — фреймворк просто читает эти объекты.',
      sources: ["ms-attr", "ms-attr-retrieve"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>[AttributeUsage(AttributeTargets.Class)] class InfoAttribute : Attribute { public string Author; public int Version; public InfoAttribute(string a){Author=a;} }</code><br/><code>[Info("ada", Version=2)] class Widget {}</code><br/><code>var a = typeof(Widget).GetCustomAttribute&lt;InfoAttribute&gt;(); WriteLine(a.Author); WriteLine(a.Version);</code> — обе строки?',
      options: ["ada\\n2", "ada\\n0", "\\n2", "InfoAttribute\\n2"], correctIndex: 0, xp: 10,
      okText: 'Reflection <b>воссоздаёт объект</b> из метаданных: ctor-аргумент <code>"ada"</code> → <code>Author</code>, named <code>Version=2</code> → <code>Version</code>. Печать: <span class="hl">ada</span> и <b>2</b>.',
      noText: '«use <code>GetCustomAttribute</code> to initialize the new attribute». <span class="ru-tr">«используй <code>GetCustomAttribute</code>, чтобы инициализировать новый атрибут».</span> Значения из литерала восстановлены: <code>Author=ada</code>, <code>Version=2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "ada\n2" }, sourceRefs: ["ms-attr-retrieve"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class TagAttribute : Attribute { public string Name; public bool Cached; public TagAttribute(string name){Name=name;} }</code><br/><code>[Tag("api", Cached=true)] class Svc {}</code><br/><code>var a = typeof(Svc).GetCustomAttribute&lt;TagAttribute&gt;(); WriteLine($"positional Name={a.Name}"); WriteLine($"named Cached={a.Cached}");</code> — обе строки?',
      options: ["positional Name=api\\nnamed Cached=True", "positional Name=api\\nnamed Cached=False", "positional Name=\\nnamed Cached=True", "positional Name=Svc\\nnamed Cached=True"], correctIndex: 0, xp: 10,
      okText: 'Positional <code>"api"</code> идёт в <b>конструктор</b> → <code>Name=api</code>; named <code>Cached=true</code> присваивает <b>свойство</b> → <code>Cached=<span class="hl">True</span></code>. Один литерал — две механики.',
      noText: 'Positional = «Parameters of the attribute constructor» <span class="ru-tr">«Параметры конструктора атрибута»</span>, named = «Properties or fields». <span class="ru-tr">«Свойства или поля».</span> <code>Name=api</code> (ctor), <code>Cached=True</code> (свойство).',
      verify: { kind: "exec", run: "dotnet run", expect: "positional Name=api\nnamed Cached=True" }, sourceRefs: ["ms-attr"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class MarkAttribute : Attribute {}</code><br/><code>class Plain {}</code><br/><code>WriteLine(typeof(Plain).GetCustomAttribute&lt;MarkAttribute&gt;() == null);</code><br/><code>WriteLine(typeof(Plain).GetCustomAttributes(false).Length);</code> — обе строки?',
      options: ["True\\n0", "False\\n1", "True\\n1", "False\\n0"], correctIndex: 0, xp: 10,
      okText: 'Атрибута нет → «<code>GetCustomAttribute</code> method initializes… to a <span class="hl">null</span> value» <span class="ru-tr">«метод <code>GetCustomAttribute</code> инициализирует… значением null»</span> → <code>== null</code> это <b>True</b>. Своих атрибутов на <code>Plain</code> ноль → <code>Length = 0</code>.',
      noText: 'Отсутствие атрибута даёт <b>null</b>, а не исключение — поэтому <code>== null</code> → <code>True</code>. И <code>GetCustomAttributes</code> вернёт пустой массив: <code>0</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\n0" }, sourceRefs: ["ms-attr-retrieve"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Пассивные метаданные", v: 'Атрибут — «metadata, or declarative information» <span class="ru-tr">«метаданные, или декларативная информация»</span>, впаянная в декларацию. Сам <b>ничего не делает</b>, пока кто-то не <span class="hl">прочитает</span> его reflection-ом.' },
    { icon: "cost", k: "Определение + параметры", v: 'Свой атрибут = <code>: Attribute</code> + <code>[AttributeUsage]</code> (цели). Параметры: <b>positional</b> (аргументы ctor, обязательны) и <b>named</b> (свойства, опциональны).' },
    { icon: "avoid", k: "Чтение = объект или null", v: '<code>GetCustomAttribute</code> <b>конструирует объект</b> из метаданных; нет атрибута → <span class="hl">null</span> (проверяй!). Несколько — <code>GetCustomAttributes</code> + <code>AllowMultiple=true</code>.' },
  ],

  foot: 'урок · <b>атрибуты: создание и чтение</b> · 5 анимир. разборов · positional/named · панель восстановления из IL · дизайн <b>mid</b>',
};
