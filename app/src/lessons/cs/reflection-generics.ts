/**
 * Lesson: Reflection и generics (CS.S6.reflection-generics) — expert density, 5 animated
 * deep-dives. From reflection's view a generic type carries a set of type PARAMETERS (an open
 * definition, the template) or type ARGUMENTS (a closed constructed type). Only a closed type is
 * instantiable; MakeGenericType turns a definition into a closed type; GetGenericArguments reads
 * the argument list; IsGenericParameter tells a parameter (T) from an argument (int).
 *
 * SIGNATURE machine panel (s5): the open definition List<> (IsGenericTypeDefinition=True,
 * ContainsGenericParameters=True → NOT instantiable) is closed with MakeGenericType(int) into
 * List`1 (ContainsGenericParameters=False → instantiable). The flags flip and the type name
 * grows its `1 arity suffix — REAL run-csharp measurement (this file's exec cards, app backend :5080).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from
 *     learn.microsoft.com/.../fundamentals/reflection/reflection-and-generic-types
 *     (microsoft_docs_fetch-verified 2026-07-21, ms.date 2017-03-30);
 *   - every card verify.expect is REAL run-csharp stdout (this file's exec cards, app backend :5080)
 *     (c1: True/False · c2: open def:True instantiable:False / closed:List`1 instantiable:True ·
 *      c3: Int32/String); the ArgumentException on open-type CreateInstance is an own measurement.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.reflection-generics/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: parameters (open) lane vs arguments (closed) lane.
const Z_OPEN: Zone = { id: "open", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОТКРЫТЫЙ · ПАРАМЕТРЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Dictionary<TKey,TValue>", subCls: "vz-zsub", subY: 47 };
const Z_CLOSED: Zone = { id: "closed", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЗАКРЫТЫЙ · АРГУМЕНТЫ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Dictionary<int,string>", subCls: "vz-zsub heap", subY: 47 };
const PA_ZONES: Zone[] = [Z_OPEN, Z_CLOSED];

// s2: the flags that classify a Type (IsGenericType / IsGenericTypeDefinition / Contains).
// Tall zone (h=234 → inner 218u) so three stacked gate rows (measured 212u) fit with PAD≥8.
const Z_FLAGS: Zone = { id: "flags", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "ФЛАГИ КЛАССИФИКАЦИИ Type", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "IsGenericType · …Definition · Contains", subCls: "vz-zsub", subY: 40 };
const FLAGS_ZONES: Zone[] = [Z_FLAGS];

// s3: definition ↔ closed round-trip (GetGenericTypeDefinition / MakeGenericType).
const Z_DEF: Zone = { id: "def", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОПРЕДЕЛЕНИЕ (ШАБЛОН)", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Dictionary<,>", subCls: "vz-zsub", subY: 47 };
const Z_MADE: Zone = { id: "made", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЗАКРЫТЫЙ ТИП", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "MakeGenericType", subCls: "vz-zsub heap", subY: 47 };
const ROUND_ZONES: Zone[] = [Z_DEF, Z_MADE];

// s4: GetGenericArguments — the array, and IsGenericParameter per element.
const Z_TYPE: Zone = { id: "type", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "Type", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "GetGenericArguments", subCls: "vz-zsub", subY: 47 };
const Z_ARGS: Zone = { id: "args", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone heap", label: "Type[] АРГУМЕНТОВ", labelCls: "vz-zlabel heap sm", lx: 241, ly: 24, sub: "IsGenericParameter?", subCls: "vz-zsub heap", subY: 47 };
const ARGS_ZONES: Zone[] = [Z_TYPE, Z_ARGS];

// s5 (SIGNATURE): MakeGenericType flips instantiability; open throws, closed works.
const Z_TEMPLATE: Zone = { id: "template", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List<> · ОТКРЫТ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "не создать", subCls: "vz-zsub heap", subY: 47 };
const Z_INSTANTIABLE: Zone = { id: "inst", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "List`1 · ЗАКРЫТ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "instantiable", subCls: "vz-zsub good", subY: 47 };
const MAKE_ZONES: Zone[] = [Z_TEMPLATE, Z_INSTANTIABLE];

export const reflectionGenerics: LessonData = {
  id: "CS.S6.reflection-generics",
  track: "CS",
  section: "CS.S6",
  module: "S6.6",
  lang: "csharp",
  title: "Reflection и generics: открытые и закрытые типы",
  kicker: "C# вглубь · S6 · параметры vs аргументы",
  home: { subtitle: "открытый/закрытый, MakeGenericType, GetGenericArguments, IsGenericParameter", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-refgen", kind: "doc", org: "Microsoft Learn", title: "Reflection and Generic Types", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/reflection-and-generic-types", date: "2017-03-30" },
    { id: "ms-makegen", kind: "doc", org: "Microsoft Learn", title: "Type.MakeGenericType Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.type.makegenerictype", date: "2025-07-01" },
    { id: "ms-isgen", kind: "doc", org: "Microsoft Learn", title: "Type.IsGenericType Property", url: "https://learn.microsoft.com/en-us/dotnet/api/system.type.isgenerictype", date: "2025-07-01" },
  ],

  spec: [
    { text: "«…a generic type has associated with it a set of type parameters (if it's a generic type definition) or type arguments (if it's a constructed type).» <span class=\"ru-tr\">«…с generic-типом связан набор параметров типа (если это определение generic-типа) или аргументов типа (если это сконструированный тип).»</span>", source: "ms-refgen" },
  ],
  edgeCases: [
    { text: "Инстанцировать можно <b>только закрытый</b> тип: «You can only create an instance of a generic type if it's <span class=\"hl\">closed</span>» <span class=\"ru-tr\">«Создать экземпляр generic-типа можно, только если он <b>закрытый</b>»</span> — открытый бросает.", source: "ms-refgen" },
    { text: "<code>IsGenericParameter</code> различает <code>T</code> и <code>int</code>: «The <code>IsGenericParameter</code> property is <b>true</b> if the element is a type parameter». <span class=\"ru-tr\">«Свойство <code>IsGenericParameter</code> равно <b>true</b>, если элемент является параметром типа».</span>", source: "ms-refgen" },
    { text: "Открытый ≠ определение: базовый тип <code>D&lt;V,W&gt; : B&lt;int,V&gt;</code> даёт <code>B&lt;int,V&gt;</code> — «open, but it's not a generic type definition» <span class=\"ru-tr\">«открытый, но не определение generic-типа»</span> (смесь аргумента и параметра).", source: "ms-refgen" },
  ],

  misconceptions: [
    {
      wrong: "typeof(List<>) и typeof(List<int>) — по сути один и тот же тип",
      hook: 'Это <b>разные</b> типы для рантайма. «From the point of view of reflection, the difference between a generic type and an ordinary type is that a generic type has associated with it a set of <b>type parameters</b> (if it\'s a generic type definition) or <b>type arguments</b> (if it\'s a constructed type)». <span class="ru-tr">«С точки зрения reflection различие между generic-типом и обычным типом в том, что с generic-типом связан набор <b>параметров типа</b> (если это определение generic-типа) или <b>аргументов типа</b> (если это сконструированный тип)».</span> <code>List&lt;&gt;</code> — <span class="hl">открытое определение</span> (шаблон), <code>List&lt;int&gt;</code> — закрытый тип. И это не педантизм: «You can only create an instance of a generic type <b>if it\'s closed</b>» <span class="ru-tr">«Создать экземпляр generic-типа можно, только <b>если он закрытый</b>»</span> — из <code>List&lt;&gt;</code> объект не создать. Дальше <b>пять разборов</b>: параметры vs аргументы, флаги <code>Is*</code>, round-trip <code>GetGenericTypeDefinition</code>↔<code>MakeGenericType</code>, <code>GetGenericArguments</code>, и <b>машинная панель</b> — как <code>MakeGenericType</code> делает открытый тип инстанцируемым (реальный прогон: флаги переключаются).',
      source: "ms-refgen",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Параметры vs аргументы", title: "Открытый несёт параметры, закрытый — аргументы",
      viewBox: "0 0 340 210", zones: PA_ZONES,
      code: ["typeof(Dictionary<,>)        // открытый: TKey, TValue", "typeof(Dictionary<int,string>) // закрытый: int, string"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Dictionary&lt;,&gt;</code> — <b>открытое определение</b>: несёт <span class="hl">параметры</span> <code>TKey</code>, <code>TValue</code> — заглушки.', nodes: [{ id: "o", kind: "obj", at: { zone: "open", row: 0 }, typeTag: "Dictionary<,>", value: "TKey,TValue", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Dictionary&lt;int,string&gt;</code> — <b>закрытый</b> тип: параметры заменены <span class="hl">аргументами</span> <code>int</code>, <code>string</code>.', nodes: [{ id: "o", kind: "obj", at: { zone: "open", row: 0 }, typeTag: "Dictionary<,>", value: "TKey,TValue" }, { id: "c", kind: "obj", at: { zone: "closed", row: 0 }, typeTag: "Dictionary<int,string>", value: "int, string", accent: true }], edges: [{ id: "e", from: "o", to: "c", accent: true }] },
      ],
      explain: 'Для reflection generic-тип — это тип <b>плюс список типов-спутников</b>: «a generic type has associated with it a set of <b>type parameters</b> (if it\'s a generic type definition) or <b>type arguments</b> (if it\'s a constructed type)». <span class="ru-tr">«с generic-типом связан набор <b>параметров типа</b> (если это определение generic-типа) или <b>аргументов типа</b> (если это сконструированный тип)».</span> Параметры (<code>TKey</code>, <code>TValue</code>) — заглушки открытого определения; аргументы (<code>int</code>, <code>string</code>) — конкретные типы закрытого. И то, и другое — «represented by instances of the <code>Type</code> class» <span class="ru-tr">«представлено экземплярами класса <code>Type</code>»</span>: даже <code>T</code> в рантайме это объект <code>Type</code>, просто особый. Определения — «the <b>templates</b> from which instantiable types are created» <span class="ru-tr">«<b>шаблоны</b>, из которых создаются инстанцируемые типы»</span>; <code>Dictionary&lt;TKey,TValue&gt;</code> из BCL — именно такое определение.',
      sources: ["ms-refgen"],
    },
    {
      id: "s2", num: "02", kicker: "Флаги · классификация Type", title: "Is-флаги отвечают: generic? definition? открыт?",
      viewBox: "0 0 340 276", zones: FLAGS_ZONES,
      code: ["open.IsGenericType            // True", "open.IsGenericTypeDefinition  // True (это шаблон)", "closed.IsGenericTypeDefinition// False (уже закрыт)", "closed.ContainsGenericParameters // False → создаваем"],
      predictAt: 1, predictQ: 'Для <code>typeof(Dictionary&lt;,&gt;)</code> и <code>typeof(Dictionary&lt;int,string&gt;)</code> — что даст <code>IsGenericTypeDefinition</code> у каждого?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>IsGenericType</code> — <b>оба</b> дают <code>True</code>: и открытый, и закрытый — generic.', nodes: [{ id: "g", kind: "gate", at: { zone: "flags", row: 0 }, state: "ok", label: "IsGenericType", detail: "open=T, closed=T", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>IsGenericTypeDefinition</code> — только у <span class="hl">открытого шаблона</span> <code>True</code>: <code>Dictionary&lt;,&gt;</code>. У закрытого — <code>False</code>.', nodes: [{ id: "g", kind: "gate", at: { zone: "flags", row: 0 }, state: "ok", label: "IsGenericType", detail: "open=T, closed=T" }, { id: "d", kind: "gate", at: { zone: "flags", row: 1 }, state: "ok", label: "IsGenericTypeDefinition", detail: "open=T, closed=F", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>ContainsGenericParameters</code> — <code>True</code> = <b>открыт</b> (нельзя создать). У закрытого <code>False</code> → <span class="hl">инстанцируем</span>.', nodes: [{ id: "g", kind: "gate", at: { zone: "flags", row: 0 }, state: "ok", label: "IsGenericType", detail: "open=T, closed=T" }, { id: "d", kind: "gate", at: { zone: "flags", row: 1 }, state: "ok", label: "IsGenericTypeDefinition", detail: "open=T, closed=F" }, { id: "cp", kind: "gate", at: { zone: "flags", row: 2 }, state: "ok", label: "ContainsGenericParameters", detail: "open=T, closed=F", accent: true }], edges: [] },
      ],
      explain: 'Три флага классифицируют <code>Type</code>. <code>IsGenericType</code> — «It returns <code>true</code> if the type is generic» <span class="ru-tr">«Возвращает <code>true</code>, если тип является generic-типом»</span> (оба варианта). <code>IsGenericTypeDefinition</code> — только у шаблона: отличает <code>Dictionary&lt;,&gt;</code> от <code>Dictionary&lt;int,string&gt;</code>. <code>ContainsGenericParameters</code> — ключ к созданию: «The <code>Type.ContainsGenericParameters</code> property returns <code>true</code> if a type is <b>open</b>» <span class="ru-tr">«Свойство <code>Type.ContainsGenericParameters</code> возвращает <code>true</code>, если тип <b>открытый</b>»</span>, а «You can only create an instance of a generic type if it\'s <span class="hl">closed</span>» <span class="ru-tr">«Создать экземпляр generic-типа можно, только если он <b>закрытый</b>»</span>. Реальный прогон: у <code>Dictionary&lt;,&gt;</code> — <code>def=True, contains=True</code>; у <code>Dictionary&lt;int,string&gt;</code> — <code>def=False, contains=False</code>. Именно <code>Contains</code> решает, можно ли <code>CreateInstance</code>.',
      sources: ["ms-refgen", "ms-isgen"],
    },
    {
      id: "s3", num: "03", kicker: "Round-trip · шаблон ↔ закрытый", title: "GetGenericTypeDefinition и MakeGenericType",
      viewBox: "0 0 340 210", zones: ROUND_ZONES,
      code: ["Type closed1 = typeof(Dictionary<int,string>);", "Type def = closed1.GetGenericTypeDefinition(); // <,>", "Type closed2 = def.MakeGenericType(typeof(int), typeof(MyClass));"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Есть закрытый <code>Dictionary&lt;int,string&gt;</code>. Хотим получить <code>Dictionary&lt;int,MyClass&gt;</code> — напрямую нельзя.', nodes: [{ id: "c1", kind: "obj", at: { zone: "made", row: 0 }, typeTag: "Dictionary<int,string>", value: "закрыт", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>GetGenericTypeDefinition()</code> <span class="hl">снимает аргументы</span> → шаблон <code>Dictionary&lt;,&gt;</code>. Возвращаемся к определению.', nodes: [{ id: "c1", kind: "obj", at: { zone: "made", row: 0 }, typeTag: "Dictionary<int,string>", value: "закрыт" }, { id: "def", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "Dictionary<,>", value: "шаблон", accent: true }], edges: [{ id: "e1", from: "c1", to: "def", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>MakeGenericType(int, MyClass)</code> <span class="hl">подставляет</span> новые аргументы → <code>Dictionary&lt;int,MyClass&gt;</code>. Новый закрытый тип.', nodes: [{ id: "def", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "Dictionary<,>", value: "шаблон" }, { id: "c2", kind: "obj", at: { zone: "made", row: 0 }, typeTag: "Dictionary<int,MyClass>", value: "новый", accent: true }], edges: [{ id: "e2", from: "def", to: "c2", accent: true }] },
      ],
      explain: 'Между шаблоном и закрытым типом — round-trip. Из закрытого к определению: «Use the <code>GetGenericTypeDefinition</code> method to obtain the generic type definition» <span class="ru-tr">«Используйте метод <code>GetGenericTypeDefinition</code>, чтобы получить определение generic-типа»</span>. Из определения к закрытому: «use the <code>MakeGenericType</code> method to create a <b>closed</b> generic type» <span class="ru-tr">«используйте метод <code>MakeGenericType</code>, чтобы создать <b>закрытый</b> generic-тип»</span>. Доковый пример дословно: «if you have a <code>Type</code> object representing <code>Dictionary&lt;int, string&gt;</code> and you want to create the type <code>Dictionary&lt;string, MyClass&gt;</code>, you can use the <code>GetGenericTypeDefinition</code> method to get a <code>Type</code> representing <code>Dictionary&lt;TKey, TValue&gt;</code> and then use the <code>MakeGenericType</code> method to produce a <code>Type</code> representing <code>Dictionary&lt;int, MyClass&gt;</code>». <span class="ru-tr">«если у вас есть объект <code>Type</code>, представляющий <code>Dictionary&lt;int, string&gt;</code>, и вы хотите создать тип <code>Dictionary&lt;string, MyClass&gt;</code>, вы можете методом <code>GetGenericTypeDefinition</code> получить <code>Type</code>, представляющий <code>Dictionary&lt;TKey, TValue&gt;</code>, а затем методом <code>MakeGenericType</code> получить <code>Type</code>, представляющий <code>Dictionary&lt;int, MyClass&gt;</code>».</span> Важно: только имея <b>определение</b>, можно подставить аргументы — «You must have a generic type or method definition» <span class="ru-tr">«У вас должно быть определение generic-типа или generic-метода»</span>.',
      sources: ["ms-refgen", "ms-makegen"],
    },
    {
      id: "s4", num: "04", kicker: "GetGenericArguments · разбор списка", title: "Массив аргументов и кто из них — параметр",
      viewBox: "0 0 340 210", zones: ARGS_ZONES,
      code: ["typeof(Dictionary<int,string>).GetGenericArguments()", "//  → [ Int32, String ]  (аргументы: IsGenericParameter=False)", "typeof(Dictionary<,>).GetGenericArguments()", "//  → [ TKey, TValue ]  (параметры: IsGenericParameter=True)"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>GetGenericArguments()</code> у закрытого даёт массив <span class="hl">аргументов</span>: <code>[Int32, String]</code>.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Dictionary<int,string>", value: "closed" }, { id: "a0", kind: "chip", at: { zone: "args", row: 0 }, value: "Int32", accent: true }, { id: "a1", kind: "chip", at: { zone: "args", row: 1 }, value: "String" }], edges: [] },
        { codeLine: 2, out: "", caption: 'У <b>открытого</b> тот же метод даёт <span class="hl">параметры</span>: <code>[TKey, TValue]</code> — это тоже <code>Type</code>-объекты.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Dictionary<,>", value: "open" }, { id: "a0", kind: "chip", at: { zone: "args", row: 0 }, value: "TKey", accent: true }, { id: "a1", kind: "chip", at: { zone: "args", row: 1 }, value: "TValue" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Различить их — <code>IsGenericParameter</code>: <code>True</code> для <code>TKey</code>/<code>TValue</code>, <code>False</code> для <code>Int32</code>/<code>String</code>.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Dictionary<,>", value: "open" }, { id: "a0", kind: "gate", at: { zone: "args", row: 0 }, state: "ok", label: "TKey", detail: "IsGenericParameter=T", accent: true }, { id: "a1", kind: "gate", at: { zone: "args", row: 1 }, state: "fail", label: "Int32", detail: "IsGenericParameter=F" }], edges: [] },
      ],
      explain: 'Список спутников читается одним методом: «Use the <code>Type.GetGenericArguments</code> method to obtain an <b>array of <code>Type</code> objects</b> that represent the type parameters or type arguments of a generic type». <span class="ru-tr">«Используйте метод <code>Type.GetGenericArguments</code>, чтобы получить <b>массив объектов <code>Type</code></b>, представляющих параметры типа или аргументы типа generic-типа».</span> У закрытого это аргументы (<code>Int32</code>, <code>String</code>), у открытого — параметры (<code>TKey</code>, <code>TValue</code>). Отличить элемент помогает <code>IsGenericParameter</code>: «The <code>IsGenericParameter</code> property is <b>true</b> if the element is a <span class="hl">type parameter</span>» <span class="ru-tr">«Свойство <code>IsGenericParameter</code> равно <b>true</b>, если элемент является параметром типа»</span>. Про параметр reflection знает больше: «You can determine the type parameter\'s <b>source</b>, its <b>position</b>, and its <b>constraints</b>» <span class="ru-tr">«Можно определить <b>источник</b> параметра типа, его <b>позицию</b> и его <b>ограничения</b>»</span> — позицию читает <code>GenericParameterPosition</code>, ограничения — <code>GetGenericParameterConstraints</code>, вплоть до вариантности через <code>GenericParameterAttributes</code>.',
      sources: ["ms-refgen"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · MakeGenericType закрывает тип", title: "Открытый List<> нельзя создать — MakeGenericType чинит это",
      viewBox: "0 0 340 210", zones: MAKE_ZONES,
      code: ["Type open = typeof(List<>);", "// open.ContainsGenericParameters == True → CreateInstance бросит", "Type closed = open.MakeGenericType(typeof(int)); // List`1", "Console.WriteLine($\"closed: {closed.Name}, instantiable: {!closed.ContainsGenericParameters}\");"],
      predictAt: 1, predictQ: '<code>List&lt;&gt;</code> открыт (создать нельзя). После <code>MakeGenericType(int)</code> — как называется тип и станет ли он инстанцируемым?', console: true,
      scenes: [
        { codeLine: 0, out: "open def: True, instantiable: False", caption: '<code>List&lt;&gt;</code> — открытое определение: <code>ContainsGenericParameters=True</code> → <span class="hl">создать экземпляр нельзя</span> (бросит ArgumentException).', nodes: [{ id: "o", kind: "gate", at: { zone: "template", row: 0 }, state: "fail", label: "List<>", detail: "создать: нет", accent: true }], edges: [] },
        { codeLine: 2, out: "open def: True, instantiable: False\nclosed: List`1, instantiable: True", caption: '<code>MakeGenericType(int)</code> подставил аргумент → <span class="hl">List`1</span> (арность в имени). Теперь <code>ContainsGenericParameters=False</code> → <b>инстанцируем</b> (реальный прогон).', nodes: [{ id: "o", kind: "gate", at: { zone: "template", row: 0 }, state: "fail", label: "List<>", detail: "создать: нет" }, { id: "c", kind: "gate", at: { zone: "inst", row: 0 }, state: "ok", label: "List`1", detail: "создать: да", accent: true }], edges: [{ id: "e", from: "o", to: "c", accent: true }] },
      ],
      explain: 'Это машинная панель урока — реально снятое переключение флагов. Открытый <code>List&lt;&gt;</code> инстанцировать нельзя: <code>ContainsGenericParameters=True</code>, и <code>Activator.CreateInstance</code> бросает <b>ArgumentException</b> (собственный прогон). <code>MakeGenericType(typeof(int))</code> подставляет аргумент и возвращает закрытый тип — его имя <code>List`1</code> (суффикс <code>`1</code> — арность, число параметров), <code>ContainsGenericParameters</code> становится <code>False</code>, и тип <b>инстанцируем</b>. Собственный прогон: <code>open def: True, instantiable: False</code> → <code>closed: List`1, instantiable: True</code>. Так DI-контейнеры строят <code>List&lt;T&gt;</code> для типа <code>T</code>, известного лишь в рантайме: определение + <code>MakeGenericType</code> → готовый закрытый тип.',
      sources: ["ms-refgen", "ms-makegen"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type open = typeof(Dictionary&lt;,&gt;); Type closed = typeof(Dictionary&lt;int,string&gt;);</code><br/><code>Console.WriteLine(open.IsGenericTypeDefinition); Console.WriteLine(closed.IsGenericTypeDefinition);</code> — обе строки?',
      options: ["True\\nFalse", "True\\nTrue", "False\\nTrue", "False\\nFalse"], correctIndex: 0, xp: 10,
      okText: '<code>IsGenericTypeDefinition</code> — <b>только у шаблона</b>: <code>Dictionary&lt;,&gt;</code> → <span class="hl">True</span>, а закрытый <code>Dictionary&lt;int,string&gt;</code> → <b>False</b> (у него уже аргументы).',
      noText: 'Определение — это открытый шаблон <code>&lt;,&gt;</code> (True). Как только подставлены аргументы — это уже не «definition» (False). Оба при этом <code>IsGenericType=True</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True\nFalse" }, sourceRefs: ["ms-refgen"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type open = typeof(List&lt;&gt;);</code><br/><code>WriteLine($"open def: {open.IsGenericTypeDefinition}, instantiable: {!open.ContainsGenericParameters}");</code><br/><code>Type closed = open.MakeGenericType(typeof(int));</code><br/><code>WriteLine($"closed: {closed.Name}, instantiable: {!closed.ContainsGenericParameters}");</code> — обе строки?',
      options: ["open def: True, instantiable: False\\nclosed: List`1, instantiable: True", "open def: True, instantiable: True\\nclosed: List`1, instantiable: True", "open def: False, instantiable: False\\nclosed: List, instantiable: True", "open def: True, instantiable: False\\nclosed: List, instantiable: False"], correctIndex: 0, xp: 10,
      okText: 'Открытый <code>List&lt;&gt;</code> — <span class="hl">не инстанцируем</span> (contains=True). <code>MakeGenericType(int)</code> закрыл его → <code>List`1</code> (арность в имени), теперь <b>instantiable: True</b>.',
      noText: 'Только закрытый тип создаваем: «You can only create an instance… if it\'s closed» <span class="ru-tr">«Создать экземпляр можно… только если он закрытый»</span>. Имя закрытого — <code>List`1</code> (суффикс <code>`1</code> — число параметров), и он инстанцируем.',
      verify: { kind: "exec", run: "dotnet run", expect: "open def: True, instantiable: False\nclosed: List`1, instantiable: True" }, sourceRefs: ["ms-refgen", "ms-makegen"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var args = typeof(Dictionary&lt;int,string&gt;).GetGenericArguments();</code><br/><code>Console.WriteLine(args[0].Name); Console.WriteLine(args[1].Name);</code> — обе строки?',
      options: ["Int32\\nString", "TKey\\nTValue", "int\\nstring", "Dictionary`2\\nString"], correctIndex: 0, xp: 10,
      okText: 'У закрытого типа <code>GetGenericArguments</code> даёт <b>аргументы</b>: <code>args[0].Name = <span class="hl">Int32</span></code>, <code>args[1].Name = String</code> (CLR-имена, не C#-псевдонимы).',
      noText: '<code>GetGenericArguments</code> у <b>закрытого</b> типа возвращает реальные типы-аргументы: <code>Int32</code> и <code>String</code>. Параметры (<code>TKey</code>/<code>TValue</code>) увидел бы у открытого <code>Dictionary&lt;,&gt;</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32\nString" }, sourceRefs: ["ms-refgen"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Параметры vs аргументы", v: 'Открытое определение (<code>List&lt;&gt;</code>) несёт <b>параметры</b> (<code>T</code>), закрытый тип (<code>List&lt;int&gt;</code>) — <b>аргументы</b> (<code>int</code>). Оба — <code>Type</code>-объекты; <code>IsGenericParameter</code> различает.' },
    { icon: "cost", k: "Только закрытый создаваем", v: '«You can only create an instance… if it\'s <span class="hl">closed</span>» <span class="ru-tr">«Создать экземпляр можно… только если он <b>закрытый</b>»</span>. <code>ContainsGenericParameters=True</code> = открыт = <code>CreateInstance</code> бросит <code>ArgumentException</code>.' },
    { icon: "avoid", k: "Round-trip", v: '<code>GetGenericTypeDefinition</code> снимает аргументы до шаблона; <code>MakeGenericType(args)</code> закрывает шаблон. Собственный прогон: <code>List&lt;&gt;</code> → <code>List`1</code>, instantiable флип False→True.' },
  ],

  foot: 'урок · <b>reflection и generics</b> · 5 анимир. разборов · открытый/закрытый · панель MakeGenericType (флаги флип) · дизайн <b>mid</b>',
};
