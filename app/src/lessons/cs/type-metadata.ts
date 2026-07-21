/**
 * Lesson: Type и метаданные членов (CS.S6.type-metadata) — expert density, 5 animated
 * deep-dives. A Type object is the handle to a type's baked-in metadata (Name / FullName /
 * Namespace / IsValueType); its members come as MemberInfo[] whose MemberType tags the kind
 * (Field / Method / Property / Constructor); and BindingFlags is the QUERY FILTER over that
 * metadata — visibility × lifetime × declared-only — where forgetting Instance/Static returns
 * nothing.
 *
 * SIGNATURE machine panel (s5): the SAME class at the SAME DeclaredOnly|Instance scope — adding
 * BindingFlags.NonPublic flips the member count 3 → 5 (REAL run-csharp measurement, this file's exec cards).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM: the GetMembers intro from
 *     learn.microsoft.com/.../fundamentals/reflection/get-type-member-information (ms.date 2019-09-03),
 *     the BindingFlags field descriptions + Instance/Static note from
 *     learn.microsoft.com/.../api/system.reflection.bindingflags (ms.date 2025-07-01)
 *     (microsoft_docs_fetch-verified 2026-07-21);
 *   - every card verify.expect is REAL run-csharp stdout (this file's exec cards)
 *     (c1: Int32/System · c2: 3/5 · c3: 0/2).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.type-metadata/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the Type object beside the metadata table it reads (Name/FullName/Namespace/kind).
const Z_HANDLE: Zone = { id: "handle", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ОБЪЕКТ Type", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "typeof / GetType", subCls: "vz-zsub", subY: 47 };
const Z_MDTABLE: Zone = { id: "mdtable", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "МЕТАДАННЫЕ ТИПА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Name · FullName · …", subCls: "vz-zsub heap", subY: 47 };
const HANDLE_ZONES: Zone[] = [Z_HANDLE, Z_MDTABLE];

// s2: GetMembers → MemberInfo[] — tall members lane (h=234 → inner 218u) so three stacked
// obj rows (measured 212u) fit with PAD≥8; the Type handle stays a single centred row.
const Z_TYPE2: Zone = { id: "type", x: 14, y: 34, w: 130, h: 234, cls: "vz-zone", label: "Type", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "GetMembers()", subCls: "vz-zsub", subY: 47 };
const Z_MEMBERS2: Zone = { id: "members", x: 156, y: 34, w: 170, h: 234, cls: "vz-zone heap", label: "MemberInfo[]", labelCls: "vz-zlabel heap sm", lx: 241, ly: 22, sub: "по одному на член", subCls: "vz-zsub heap", subY: 40 };
const MEMBERS2_ZONES: Zone[] = [Z_TYPE2, Z_MEMBERS2];

// s3: MemberType tags — one gate per lane, standard-height zones.
const Z_TYPE: Zone = { id: "type", x: 14, y: 34, w: 130, h: 168, cls: "vz-zone", label: "Type", labelCls: "vz-zlabel sm", lx: 79, ly: 24, sub: "GetMember(...)", subCls: "vz-zsub", subY: 47 };
const Z_MEMBERS: Zone = { id: "members", x: 156, y: 34, w: 170, h: 168, cls: "vz-zone heap", label: "MemberInfo", labelCls: "vz-zlabel heap sm", lx: 241, ly: 24, sub: "MemberType", subCls: "vz-zsub heap", subY: 47 };
const MEMBERS_ZONES: Zone[] = [Z_TYPE, Z_MEMBERS];

// s4: BindingFlags as a 2-axis filter (visibility × lifetime) narrowing the metadata query.
const Z_FILTER: Zone = { id: "filter", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "BindingFlags · ФИЛЬТР", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "видимость × время жизни", subCls: "vz-zsub", subY: 47 };
const Z_RESULT: Zone = { id: "result", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЧТО ВЕРНЁТСЯ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "подмножество членов", subCls: "vz-zsub heap", subY: 47 };
const FILTER_ZONES: Zone[] = [Z_FILTER, Z_RESULT];

// s5 (SIGNATURE): same class, same scope, NonPublic toggled — count 3 vs 5.
const Z_PUBONLY: Zone = { id: "pubOnly", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Public | Instance", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "DeclaredOnly", subCls: "vz-zsub good", subY: 47 };
const Z_WITHPRIV: Zone = { id: "withPriv", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "+ NonPublic", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "тот же класс", subCls: "vz-zsub heap", subY: 47 };
const COUNT_ZONES: Zone[] = [Z_PUBONLY, Z_WITHPRIV];

export const typeMetadata: LessonData = {
  id: "CS.S6.type-metadata",
  track: "CS",
  section: "CS.S6",
  module: "S6.2",
  lang: "csharp",
  title: "Type и метаданные членов",
  kicker: "C# вглубь · S6 · запрос к метаданным",
  home: { subtitle: "Type-свойства, MemberInfo, MemberType, BindingFlags-фильтр", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-getmembers", kind: "doc", org: "Microsoft Learn", title: "How to: Get type and member information by using reflection", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/get-type-member-information", date: "2019-09-03" },
    { id: "ms-bindingflags", kind: "doc", org: "Microsoft Learn", title: "BindingFlags Enum (System.Reflection)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.bindingflags", date: "2025-07-01" },
    { id: "ms-type", kind: "doc", org: "Microsoft Learn", title: "Type Class (System)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.type", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The System.Reflection namespace contains many methods for obtaining information about types and their members.»", source: "ms-getmembers" },
  ],
  edgeCases: [
    { text: "<code>BindingFlags</code> — «Specifies flags that control binding and the way in which the search for members and types is conducted by reflection».", source: "ms-bindingflags" },
    { text: "Ловушка: «You must specify <b>Instance</b> or <b>Static</b> along with <b>Public</b> or <b>NonPublic</b> or no members will be returned» — только <code>Public</code> вернёт <span class=\"hl\">пустой</span> массив.", source: "ms-bindingflags" },
    { text: "<code>DeclaredOnly</code> — «only members declared at the level of the supplied type's hierarchy should be considered. Inherited members are not considered» — отсекает унаследованное от <code>object</code>.", source: "ms-bindingflags" },
  ],

  misconceptions: [
    {
      wrong: "GetMembers() возвращает все члены типа — публичные и приватные",
      hook: 'Нет: <code>GetMembers()</code> без аргументов даёт только <b>public</b> члены (и с учётом наследования от <code>object</code>). Приватные, статические, declared-only — это <span class="hl">параметры запроса</span>, а не поведение по умолчанию. <code>BindingFlags</code>: «Specifies flags that control binding and the way in which the search for members and types is conducted by reflection». А главная ловушка прямо в доке: «You must specify <b>Instance</b> or <b>Static</b> along with <b>Public</b> or <b>NonPublic</b> or <span class="hl">no members will be returned</span>». Дальше <b>пять разборов</b>: Type как ручка к метаданным, <code>MemberInfo[]</code> и <code>MemberType</code>, оси фильтра, и <b>машинная панель</b> — как один флаг <code>NonPublic</code> меняет счётчик членов (реальный прогон: 3 → 5).',
      source: "ms-bindingflags",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Type · ручка к метаданным", title: "Один Type — набор свойств о типе",
      viewBox: "0 0 340 210", zones: HANDLE_ZONES,
      code: ["Type t = typeof(int);", "t.Name;       // Int32", "t.FullName;   // System.Int32", "t.Namespace;  // System", "t.IsValueType;// True"],
      predictAt: 1, predictQ: 'Для <code>typeof(int)</code> — что вернёт <code>t.Name</code> и <code>t.FullName</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Объект <code>Type</code> — <span class="hl">ручка</span> к метаданным типа. Сам int здесь ни при чём: это описание.', nodes: [{ id: "t", kind: "obj", at: { zone: "handle", row: 0 }, typeTag: "Type", value: "typeof(int)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Свойства читают таблицу метаданных: <code>Name = Int32</code>, <code>FullName = System.Int32</code>, <code>Namespace = System</code>.', nodes: [{ id: "t", kind: "obj", at: { zone: "handle", row: 0 }, typeTag: "Type", value: "typeof(int)" }, { id: "md", kind: "obj", at: { zone: "mdtable", row: 0 }, typeTag: "Name/FullName", value: "Int32", accent: true }], edges: [{ id: "e1", from: "t", to: "md", accent: true }] },
        { codeLine: 4, out: "Int32\nSystem.Int32", caption: '<code>IsValueType = True</code> — это тоже метаданные. Type знает <span class="hl">всё</span> о типе, не создавая ни одного экземпляра (реальный прогон).', nodes: [{ id: "t", kind: "obj", at: { zone: "handle", row: 0 }, typeTag: "Type", value: "typeof(int)" }, { id: "md", kind: "obj", at: { zone: "mdtable", row: 0 }, typeTag: "Name/FullName", value: "Int32" }, { id: "vt", kind: "chip", at: { zone: "mdtable", row: 1 }, value: "IsValueType", accent: true }], edges: [{ id: "e1", from: "t", to: "md" }] },
      ],
      explain: 'Объект <code>Type</code> — единая точка доступа к метаданным: имя, полное имя, namespace, категория, базовый тип, интерфейсы, атрибуты. Всё это компилятор записал в сборку, а <code>Type</code> только читает — экземпляр создавать не нужно. Получить <code>Type</code> можно статически (<code>typeof(int)</code>), от объекта (<code>x.GetType()</code>) или по строке (<code>Type.GetType("System.Int32")</code>). Реальный вывод: <code>Int32</code> и <code>System.Int32</code>. Отсюда стартует любой обход членов — с ручки к метаданным.',
      sources: ["ms-type", "ms-getmembers"],
    },
    {
      id: "s2", num: "02", kicker: "GetMembers · MemberInfo[]", title: "Члены приходят массивом MemberInfo",
      viewBox: "0 0 340 276", zones: MEMBERS2_ZONES,
      code: ["Type t = typeof(string);", "MemberInfo[] members = t.GetMembers();", "// по одному MemberInfo на каждый член"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Стартуем с <code>Type</code> для <code>string</code> — ручка к метаданным готова.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "string", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>GetMembers()</code> возвращает <span class="hl">MemberInfo[]</span> — по объекту на каждый член: методы, свойства, поля.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "string" }, { id: "m1", kind: "obj", at: { zone: "members", row: 0 }, typeTag: "MemberInfo", value: "Length", accent: true }, { id: "m2", kind: "obj", at: { zone: "members", row: 1 }, typeTag: "MemberInfo", value: "Substring" }], edges: [{ id: "e1", from: "t", to: "m1", accent: true }] },
        { codeLine: 2, out: "", caption: 'Каждый <code>MemberInfo</code> несёт <code>.Name</code>, <code>.MemberType</code>, <code>.DeclaringType</code> — <b>описание</b> члена, готовое к чтению или вызову.', nodes: [{ id: "t", kind: "obj", at: { zone: "type", row: 0 }, typeTag: "Type", value: "string" }, { id: "m1", kind: "obj", at: { zone: "members", row: 0 }, typeTag: "MemberInfo", value: "Length" }, { id: "m2", kind: "obj", at: { zone: "members", row: 1 }, typeTag: "MemberInfo", value: "Substring" }, { id: "m3", kind: "obj", at: { zone: "members", row: 2 }, typeTag: "MemberInfo", value: "IndexOf", accent: true }], edges: [{ id: "e1", from: "t", to: "m1" }] },
      ],
      explain: 'Обход членов — один вызов: «This article demonstrates one of these methods, <b>Type.GetMembers</b>». Результат — массив <code>MemberInfo</code>, базового класса для всех родов членов. В доке пример буквально считает их: <code>Type MyType = Type.GetType("System.IO.BinaryReader")</code>, затем <code>MyType.GetMembers(…)</code> и печать <code>Mymemberinfoarray.Length</code> и имён. Каждый <code>MemberInfo</code> — не строка, а объект: у него есть <code>Name</code>, <code>MemberType</code>, <code>DeclaringType</code> и приведение к профильному Info-классу.',
      sources: ["ms-getmembers"],
    },
    {
      id: "s3", num: "03", kicker: "MemberType · род члена", title: "MemberType размечает: поле, метод, свойство",
      viewBox: "0 0 340 210", zones: MEMBERS_ZONES,
      code: ["t.GetMember(\"Length\")[0].MemberType    // Property", "t.GetMethod(\"Substring\").MemberType     // Method", "// приведение: (MethodInfo)member"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Length</code> у string — это свойство: <code>MemberType = <span class="hl">Property</span></code>.', nodes: [{ id: "len", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "Length", detail: "Property" }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Substring</code> — метод: <code>MemberType = <span class="hl">Method</span></code>. Один enum различает роды.', nodes: [{ id: "len", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "Length", detail: "Property" }, { id: "sub", kind: "gate", at: { zone: "members", row: 0 }, state: "ok", label: "Substring", detail: "Method", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'По <code>MemberType</code> приводишь к профильному Info: <code>Method</code> → <code>MethodInfo</code>, <code>Field</code> → <code>FieldInfo</code> — и получаешь <b>его</b> операции.', nodes: [{ id: "len", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "Length", detail: "→ PropertyInfo" }, { id: "sub", kind: "gate", at: { zone: "members", row: 0 }, state: "ok", label: "Substring", detail: "→ MethodInfo", accent: true }], edges: [] },
      ],
      explain: '<code>MemberInfo</code> — общий предок, а конкретный род члена размечен свойством <code>MemberType</code> (enum <code>MemberTypes</code>): <code>Field</code>, <code>Method</code>, <code>Property</code>, <code>Constructor</code>, <code>Event</code>, <code>NestedType</code>. Реальный прогон: у <code>Length</code> — <code>Property</code>, у <code>Substring</code> — <code>Method</code>. Зная род, приводишь <code>MemberInfo</code> к профильному классу (<code>PropertyInfo</code>, <code>MethodInfo</code>) и получаешь специфичные операции: у <code>MethodInfo</code> — <code>Invoke</code> и <code>GetParameters</code>, у <code>FieldInfo</code> — <code>GetValue</code>/<code>SetValue</code>. Так один массив описывает разнородные члены.',
      sources: ["ms-getmembers"],
    },
    {
      id: "s4", num: "04", kicker: "BindingFlags · оси фильтра", title: "BindingFlags — запрос: видимость × время жизни",
      viewBox: "0 0 340 210", zones: FILTER_ZONES,
      code: ["// две оси обязательны:", "BindingFlags.Public | BindingFlags.NonPublic  // видимость", "BindingFlags.Instance | BindingFlags.Static   // время жизни", "// + DeclaredOnly отсекает унаследованное"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Ось <b>видимости</b>: <code>Public</code> и/или <code>NonPublic</code>. «public members are to be included in the search».', nodes: [{ id: "pub", kind: "chip", at: { zone: "filter", row: 0 }, value: "Public", accent: true }, { id: "npub", kind: "chip", at: { zone: "filter", row: 1 }, value: "NonPublic" }], edges: [] },
        { codeLine: 2, out: "", caption: 'Ось <b>времени жизни</b>: <code>Instance</code> и/или <code>Static</code>. <span class="hl">Обе оси обязательны</span> — иначе массив пуст.', nodes: [{ id: "pub", kind: "chip", at: { zone: "filter", row: 0 }, value: "Public" }, { id: "npub", kind: "chip", at: { zone: "filter", row: 1 }, value: "NonPublic" }, { id: "inst", kind: "chip", at: { zone: "result", row: 0 }, value: "Instance", accent: true }, { id: "stat", kind: "chip", at: { zone: "result", row: 1 }, value: "Static" }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>DeclaredOnly</code> — модификатор: «Inherited members are not considered». Убирает члены <code>object</code>.', nodes: [{ id: "pub", kind: "chip", at: { zone: "filter", row: 0 }, value: "Public" }, { id: "npub", kind: "chip", at: { zone: "filter", row: 1 }, value: "NonPublic" }, { id: "inst", kind: "chip", at: { zone: "result", row: 0 }, value: "Instance" }, { id: "decl", kind: "gate", at: { zone: "result", row: 1 }, state: "ok", label: "DeclaredOnly", detail: "без наследия", accent: true }], edges: [] },
      ],
      explain: '<code>BindingFlags</code> — не «настройка», а сам <b>запрос</b>: «Specifies flags that control binding and the way in which the search for members and types is conducted by reflection». Две ортогональные оси обязательны вместе — доступность (<code>Public</code>/<code>NonPublic</code>) и время жизни (<code>Instance</code>/<code>Static</code>). Прямое предупреждение: «You must specify <b>Instance</b> or <b>Static</b> along with <b>Public</b> or <b>NonPublic</b> or <span class="hl">no members will be returned</span>» — классический баг «reflection ничего не находит». <code>DeclaredOnly</code> сверху отсекает унаследованное: «only members declared at the level of the supplied type\'s hierarchy… Inherited members are not considered».',
      sources: ["ms-bindingflags"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный счётчик", title: "Один флаг NonPublic: было 3 членов, стало 5",
      viewBox: "0 0 340 210", zones: COUNT_ZONES,
      code: ["class Box { public int A; private int B;", "            public void M(){} private void N(){} }", "var f = BindingFlags.Instance | BindingFlags.DeclaredOnly;", "typeof(Box).GetMembers(f | Public).Length;            // 3", "typeof(Box).GetMembers(f | Public | NonPublic).Length;// 5"],
      predictAt: 3, predictQ: 'У <code>Box</code> по 1 public и 1 private поля и метода. Public|Instance|DeclaredOnly даёт 3. Сколько станет, добавив <code>NonPublic</code>?', console: true,
      scenes: [
        { codeLine: 3, out: "public-only: 3", caption: '<code>Public | Instance | DeclaredOnly</code> — видны только публичные: поле <code>A</code>, метод <code>M</code> и конструктор. <span class="hl">3 члена</span>.', nodes: [{ id: "pub", kind: "gate", at: { zone: "pubOnly", row: 0 }, state: "ok", label: "public-only", detail: "3 члена" }, { id: "list", kind: "chip", at: { zone: "pubOnly", row: 1 }, value: "A · M · .ctor", accent: true }], edges: [] },
        { codeLine: 4, out: "public-only: 3\n+ nonpublic: 5", caption: 'Добавили один флаг <code>NonPublic</code> — <span class="hl">5 членов</span>: тот же класс, но теперь видны private <code>B</code> и <code>N</code> (реальный прогон).', nodes: [{ id: "pub", kind: "gate", at: { zone: "pubOnly", row: 0 }, state: "ok", label: "public-only", detail: "3 члена" }, { id: "list", kind: "chip", at: { zone: "pubOnly", row: 1 }, value: "A · M · .ctor" }, { id: "priv", kind: "gate", at: { zone: "withPriv", row: 0 }, state: "ok", label: "+ NonPublic", detail: "5 членов", accent: true }, { id: "plist", kind: "chip", at: { zone: "withPriv", row: 1 }, value: "+ B · N", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятый счётчик. Класс, тип и scope (<code>Instance | DeclaredOnly</code>) не меняются; меняется <b>один бит</b> запроса. <code>Public | Instance | DeclaredOnly</code> → <b>3</b> члена (<code>A</code>, <code>M</code>, <code>.ctor</code>); добавили <code>NonPublic</code> → <b>5</b> (<code>+ B</code>, <code>+ N</code>) — собственный прогон. Это доказывает: <code>BindingFlags</code> — не косметика, а фильтр над метаданными, и результат reflection полностью им определён. Отсюда практика: reflection «не видит» приватное поле не потому, что «нельзя», а потому что запрос не попросил <code>NonPublic</code>.',
      sources: ["ms-bindingflags"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Type t = Type.GetType("System.Int32");</code><br/><code>Console.WriteLine(t.Name); Console.WriteLine(t.Namespace);</code> — обе строки?',
      options: ["Int32\\nSystem", "System.Int32\\nSystem", "Int32\\nInt32", "System.Int32\\nInt32"], correctIndex: 0, xp: 10,
      okText: '<code>Type.GetType("System.Int32")</code> берёт <b>Type</b> по полному имени. <code>Name</code> — короткое (<span class="hl">Int32</span>), <code>Namespace</code> — <b>System</b>. Полное имя дал бы <code>FullName</code>.',
      noText: 'Не путай <code>Name</code> и <code>FullName</code>: <code>Name = Int32</code> (без namespace), <code>Namespace = System</code>. <code>FullName</code> собрал бы их в <code>System.Int32</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32\nSystem" }, sourceRefs: ["ms-type", "ms-getmembers"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Box { public int A; private int B; public void M(){} private void N(){} }</code><br/>scope = <code>Instance | DeclaredOnly</code>. <code>GetMembers(scope | Public).Length</code>, затем <code>GetMembers(scope | Public | NonPublic).Length</code> — обе строки?',
      options: ["public-only: 3\\n+ nonpublic: 5", "public-only: 2\\n+ nonpublic: 4", "public-only: 4\\n+ nonpublic: 4", "public-only: 3\\n+ nonpublic: 4"], correctIndex: 0, xp: 10,
      okText: 'Public|Instance|DeclaredOnly = <b>3</b> (<code>A</code>, <code>M</code>, <code>.ctor</code>). Один флаг <span class="hl">NonPublic</span> добавляет private <code>B</code> и <code>N</code> → <b>5</b>. Тот же класс — разный запрос.',
      noText: 'Не забудь <b>конструктор</b>: публичных членов у declared-only <code>Box</code> три (<code>A</code>, <code>M</code>, <code>.ctor</code>). <code>NonPublic</code> открывает ещё два — <code>B</code> и <code>N</code>: итого <b>5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "public-only: 3\n+ nonpublic: 5" }, sourceRefs: ["ms-bindingflags"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Box { public int A; }</code><br/><code>Console.WriteLine(t.GetMembers(BindingFlags.Public).Length);</code><br/><code>Console.WriteLine(t.GetMembers(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly).Length);</code> — обе строки?',
      options: ["0\\n2", "1\\n2", "0\\n1", "2\\n2"], correctIndex: 0, xp: 10,
      okText: 'Только <code>Public</code> без оси времени жизни → <span class="hl">0</span>: «You must specify Instance or Static along with Public or NonPublic or no members will be returned». С <code>Instance | DeclaredOnly</code> → <b>2</b> (поле <code>A</code> + <code>.ctor</code>).',
      noText: 'Классическая ловушка: <code>BindingFlags.Public</code> сам по себе даёт пустой массив — нужна вторая ось (<code>Instance</code>/<code>Static</code>). Тогда declared-only <code>Box</code> вернёт <b>2</b> члена.',
      verify: { kind: "exec", run: "dotnet run", expect: "0\n2" }, sourceRefs: ["ms-bindingflags"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Type = ручка", v: '<code>Type</code> читает метаданные типа (<code>Name</code>/<code>FullName</code>/<code>Namespace</code>/<code>IsValueType</code>) без единого экземпляра. Члены — <code>GetMembers()</code> → <code>MemberInfo[]</code>.' },
    { icon: "cost", k: "MemberType", v: 'У каждого <code>MemberInfo</code> есть <code>MemberType</code> (<code>Field</code>/<code>Method</code>/<code>Property</code>/…). По нему приводишь к профильному Info-классу и получаешь <span class="hl">его операции</span>.' },
    { icon: "avoid", k: "BindingFlags = запрос", v: 'Две обязательные оси: <b>видимость</b> (<code>Public</code>/<code>NonPublic</code>) × <b>время жизни</b> (<code>Instance</code>/<code>Static</code>). Забыл вторую — <span class="hl">пустой</span> массив. Один <code>NonPublic</code> сменил 3 на 5.' },
  ],

  foot: 'урок · <b>Type и метаданные членов</b> · 5 анимир. разборов · оси BindingFlags · панель-счётчик 3 vs 5 · дизайн <b>mid</b>',
};
