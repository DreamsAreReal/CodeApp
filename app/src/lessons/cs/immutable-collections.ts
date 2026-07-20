/**
 * Lesson: Immutable-коллекции — структурное разделение (CS.S17.immutable-collections).
 * An immutable collection can never change: a "mutating" method RETURNS A NEW object and
 * leaves the original untouched. That gives thread-safety with no locks. The cost is NOT a
 * full copy every time: ImmutableList uses a binary TREE (structural sharing, O(log n)
 * mutate), while ImmutableArray is a real array (O(1) read, O(n) copy on mutate). Builder
 * batches many edits with little/no allocation.
 *
 * SIGNATURE machine panel (s4): a live demonstration that ImmutableList.Add returns a NEW
 * instance — a.Count=3, b=a.Add(4) -> b.Count=4, ReferenceEquals(a,b)=False, a unchanged.
 * REAL measurement. NOTE ON EXEC: the shared run-csharp sandbox (Roslyn CSharpScript) does
 * NOT reference System.Collections.Immutable for compilation, so the executed card code
 * reaches the (loaded) assembly via reflection; the stdout is genuine. The card QUESTION
 * shows the idiomatic ImmutableList snippet it faithfully mirrors. Evidence: scratchpad
 * s7c1.cs / s7c2.cs / s7c3.cs, backend run-csharp, 2026-07-21.
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from immutable namespace + immutablelist-1 + collections index
 *     (fetch-verified 2026-07-21) — GT F18, F19, F20, F21, F22 + index complexity table.
 *   - card verify.expect = REAL run-csharp stdout (reflection form); anti-echo.
 *   - the O(log n)/O(n)/O(1) complexities are the index complexity table; ImmutableList=tree
 *     vs ImmutableArray=array is the index page ("binary tree ... instead of an array").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S17.immutable-collections/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: mutation returns a new object; original unchanged.
const Z_ORIG: Zone = { id: "orig", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "исходный список", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "не меняется", subCls: "vz-zsub good", subY: 47 };
const Z_NEW: Zone = { id: "new", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "результат Add", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "новый объект", subCls: "vz-zsub", subY: 47 };
const NEWOBJ_ZONES: Zone[] = [Z_ORIG, Z_NEW];

// s2: structural sharing — tree, most nodes shared between versions.
const Z_V1: Zone = { id: "v1", x: 14, y: 34, w: 122, h: 168, cls: "vz-zone good", label: "версия 1", labelCls: "vz-zlabel good sm", lx: 75, ly: 24, sub: "дерево", subCls: "vz-zsub good", subY: 47 };
const Z_SHARE: Zone = { id: "share", x: 148, y: 34, w: 96, h: 168, cls: "vz-zone", label: "ОБЩИЕ УЗЛЫ", labelCls: "vz-zlabel sm", lx: 196, ly: 24, sub: "structural", subCls: "vz-zsub", subY: 47 };
const Z_V2: Zone = { id: "v2", x: 252, y: 34, w: 74, h: 168, cls: "vz-zone good", label: "верс. 2", labelCls: "vz-zlabel good sm", lx: 289, ly: 24, sub: "+1 узел", subCls: "vz-zsub good", subY: 47 };
const SHARE_ZONES: Zone[] = [Z_V1, Z_SHARE, Z_V2];

// s3: ImmutableArray (array, O(1) read / O(n) copy) vs ImmutableList (tree, O(log n)).
const Z_ARR: Zone = { id: "arr", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ImmutableArray", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "массив", subCls: "vz-zsub good", subY: 47 };
const Z_TREE: Zone = { id: "tree", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ImmutableList", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "дерево", subCls: "vz-zsub", subY: 47 };
const CHOOSE_ZONES: Zone[] = [Z_ARR, Z_TREE];

// s4 (SIGNATURE): new-object panel.
const Z_PANEL: Zone = { id: "panel", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "b = a.Add(4) · реальный замер", labelCls: "vz-zlabel good sm", lx: 170, ly: 24, sub: "a.Count=3 · b.Count=4 · ReferenceEquals=False", subCls: "vz-zsub good", subY: 47 };
const PANEL_ZONES: Zone[] = [Z_PANEL];

export const immutableCollections: LessonData = {
  id: "CS.S17.immutable-collections",
  track: "CS",
  section: "CS.S17",
  module: "S17.7",
  lang: "csharp",
  title: "Immutable-коллекции: структурное разделение",
  kicker: "C# вглубь · S17 · дерево вместо копии",
  home: { subtitle: "новый объект на мутацию, ImmutableArray vs List, Builder", icon: "collections", estMinutes: 11 },
  prereqs: ["CS.S17.list-internals"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-immutable", kind: "doc", org: "Microsoft Learn", title: "System.Collections.Immutable Namespace", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable", date: "2026-05-27" },
    { id: "ms-immutablelist", kind: "doc", org: "Microsoft Learn", title: "ImmutableList<T> Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.immutable.immutablelist-1", date: "2026-07-01" },
    { id: "ms-collections", kind: "doc", org: "Microsoft Learn", title: "Collections and Data Structures", url: "https://learn.microsoft.com/en-us/dotnet/standard/collections/", date: "2026-03-30" },
  ],

  spec: [
    { text: "«Note that these methods return a new object. When you add or remove items from an immutable list, a copy of the original list is made with the items added or removed, and the original list is unchanged.»", source: "ms-immutablelist" },
    { text: "«This type is immutable, so it is always thread-safe.»", source: "ms-immutablelist" },
  ],
  edgeCases: [
    { text: "«Provide <b>implicit thread safety</b> in multi-threaded applications (<b>no locks</b> required to access collections)» — неизменяемость даёт потокобезопасность бесплатно.", source: "ms-immutable" },
    { text: "«Modify a collection during enumeration, while ensuring that the original collection does not change» — можно «менять» во время обхода, исходник цел.", source: "ms-immutable" },
    { text: "<code>ImmutableArray&lt;T&gt;</code> — массив: чтение O(1), но <code>Add</code> копирует весь массив O(n). <code>ImmutableList&lt;T&gt;</code> — дерево: <code>Add</code>/индекс O(log n). Разные трейдофы.", source: "ms-collections" },
  ],

  misconceptions: [
    {
      wrong: "immutable-коллекция при каждом изменении делает дорогую полную копию",
      hook: 'Логика «неизменяемая → каждое <code>Add</code> копирует всё → медленно» верна лишь для <code>ImmutableArray</code>. У <code>ImmutableList</code> под капотом <b>дерево</b>: новая версия <span class="hl">переиспользует</span> почти все узлы старой (структурное разделение), поэтому <code>Add</code> — O(log n), не O(n). Мутирующий метод «return a <b>new object</b>… the original list is <b>unchanged</b>», а массовые правки идут через <code>Builder</code> «with little or no memory allocations». Дальше <b>четыре разбора</b> — от «новый объект на мутацию» до <b>машинной панели</b>: реальный замер <code>b = a.Add(4)</code> — <code>a.Count=3</code>, <code>b.Count=4</code>, <code>ReferenceEquals(a,b)=False</code>.',
      source: "ms-immutablelist",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Мутация → новый объект", title: "Add возвращает новый список, исходный цел",
      viewBox: "0 0 340 210", zones: NEWOBJ_ZONES,
      code: ["var a = ImmutableList.Create(1, 2, 3);", "var b = a.Add(4);   // b — НОВЫЙ список", "// a по-прежнему [1,2,3], b = [1,2,3,4]"],
      scenes: [
        { codeLine: 0, caption: '<code>a</code> — неизменяемый список <code>[1,2,3]</code>. Его нельзя менять на месте: методы мутации у него отсутствуют.', nodes: [{ id: "a", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "a (immutable)", value: "[1,2,3]", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>a.Add(4)</code> <span class="hl">не трогает a</span>: создаёт и возвращает <b>новый</b> список <code>b</code> = <code>[1,2,3,4]</code>.', nodes: [{ id: "a", kind: "obj", at: { zone: "orig", row: 0 }, typeTag: "a", value: "[1,2,3]", accent: true }, { id: "b", kind: "obj", at: { zone: "new", row: 0 }, typeTag: "b = a.Add(4)", value: "[1,2,3,4]", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Два независимых значения: <code>a</code> остался <code>[1,2,3]</code>, <code>b</code> — <code>[1,2,3,4]</code>. Кто держит <code>a</code>, гарантированно видит неизменные данные.', nodes: [{ id: "a", kind: "slot", at: { zone: "orig", row: 0 }, name: "a", value: "[1,2,3]", accent: true }, { id: "b", kind: "slot", at: { zone: "new", row: 0 }, name: "b", value: "[1,2,3,4]" }], edges: [] },
      ],
      explain: 'Неизменяемость означает, что «мутация» — это порождение нового значения: «Note that these methods return a <b>new object</b>. When you add or remove items from an immutable list, a copy of the original list is made… and the <b>original list is unchanged</b>». Отсюда два свойства из namespace: «Share a collection in a way that its consumer can be assured that the collection <b>never changes</b>» и «Modify a collection during enumeration, while ensuring that the original collection does not change». Ссылку на <code>a</code> можно свободно раздавать между потоками и методами — никто её не испортит. Цена — новый объект на изменение; насколько дорогой, зависит от типа (следующие разборы).',
      sources: ["ms-immutablelist", "ms-immutable"],
    },
    {
      id: "s2", num: "02", kicker: "Структурное разделение · дерево", title: "Новая версия переиспользует узлы старой",
      viewBox: "0 0 340 210", zones: SHARE_ZONES,
      code: ["// ImmutableList хранит данные в дереве", "var v2 = v1.Add(x);  // не копия всего дерева:", "// новый путь к листу + ОБЩИЕ поддеревья"],
      scenes: [
        { codeLine: 0, caption: '<code>ImmutableList</code> хранит элементы в <span class="hl">сбалансированном дереве</span>, а не в массиве. Версия 1 — корень над своими узлами.', nodes: [{ id: "r1", kind: "obj", at: { zone: "v1", row: 0 }, typeTag: "root v1", value: "дерево", accent: true }, { id: "n1", kind: "slot", at: { zone: "share", row: 0 }, name: "узлы", value: "1 2 3" }], edges: [{ id: "e1", from: "r1", to: "n1" }] },
        { codeLine: 1, caption: '<code>v1.Add(x)</code>: создаётся <b>новый корень</b> и путь к новому листу, но <span class="hl">общие поддеревья переиспользуются</span> — не копируются.', nodes: [{ id: "r1", kind: "obj", at: { zone: "v1", row: 0 }, typeTag: "root v1", value: "" }, { id: "n1", kind: "obj", at: { zone: "share", row: 0 }, typeTag: "shared", value: "1 2 3", accent: true }, { id: "r2", kind: "obj", at: { zone: "v2", row: 0 }, typeTag: "root v2", value: "+x", accent: true }], edges: [{ id: "e1", from: "r1", to: "n1" }, { id: "e2", from: "r2", to: "n1", accent: true }] },
        { codeLine: 2, caption: 'Поэтому <code>Add</code> — <span class="hl">O(log n)</span>, а не O(n): трогается лишь путь от корня к листу (высота дерева), остальное — общее для обеих версий.', nodes: [{ id: "r1", kind: "slot", at: { zone: "v1", row: 0 }, name: "v1", value: "O(log n)" }, { id: "n1", kind: "obj", at: { zone: "share", row: 0 }, typeTag: "shared", value: "переисп.", accent: true }, { id: "r2", kind: "slot", at: { zone: "v2", row: 0 }, name: "v2", value: "+узел" }], edges: [{ id: "e1", from: "r1", to: "n1" }, { id: "e2", from: "r2", to: "n1" }] },
      ],
      explain: 'Почему immutable ≠ «дорогая полная копия»: <code>ImmutableList&lt;T&gt;</code> «uses a <b>binary tree</b> to store its data instead of an array like <code>List&lt;T&gt;</code> uses». При <code>Add</code>/<code>RemoveAt</code> создаётся новый корень и переписывается только путь от корня к изменённому листу (высота дерева ≈ log n), а <b>все не затронутые поддеревья переиспользуются</b> обеими версиями — это структурное разделение (structural sharing). Отсюда сложность из таблицы: <code>ImmutableList&lt;T&gt;.Add</code> — <b>O(log n)</b>, <code>ImmutableList&lt;T&gt;.Item[Int32]</code> — <b>O(log n)</b> (дерево надо спускать, поэтому индекс медленнее массива). Старая версия остаётся валидной и неизменной — общие узлы immutable, их нельзя испортить.',
      sources: ["ms-collections"],
    },
    {
      id: "s3", num: "03", kicker: "Выбор · массив vs дерево", title: "ImmutableArray: O(1) чтение, O(n) копия при Add",
      viewBox: "0 0 340 210", zones: CHOOSE_ZONES,
      code: ["ImmutableArray<T>: Item O(1), Add O(n)  // массив", "ImmutableList<T> : Item O(log n), Add O(log n) // дерево", "// частые чтения, редкие правки  -> Array", "// частые правки                 -> List"],
      scenes: [
        { codeLine: 0, caption: '<code>ImmutableArray</code> — настоящий <b>массив</b>: индекс <span class="hl">O(1)</span> (адресная арифметика), быстрое чтение, лучшая локальность.', nodes: [{ id: "ai", kind: "gate", at: { zone: "arr", row: 0 }, state: "ok", label: "Item", detail: "O(1)", accent: true }, { id: "aa", kind: "gate", at: { zone: "arr", row: 1 }, state: "fail", label: "Add", detail: "O(n)" }], edges: [] },
        { codeLine: 0, caption: 'Но <code>Add</code> у массива — <span class="wrong">O(n)</span>: «Requires creating a new array» — копируется весь массив целиком, разделения нет.', nodes: [{ id: "ai", kind: "gate", at: { zone: "arr", row: 0 }, state: "ok", label: "Item", detail: "O(1)" }, { id: "aa", kind: "gate", at: { zone: "arr", row: 1 }, state: "fail", label: "Add", detail: "O(n) копия", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>ImmutableList</code> — дерево: <b>O(log n)</b> и чтение, и запись. Правило: <span class="hl">частые чтения + редкие правки → Array</span>; частые правки → List.', nodes: [{ id: "li", kind: "gate", at: { zone: "tree", row: 0 }, state: "ok", label: "Item", detail: "O(log n)" }, { id: "la", kind: "gate", at: { zone: "tree", row: 1 }, state: "ok", label: "Add", detail: "O(log n)", accent: true }], edges: [] },
      ],
      explain: '«Immutable = дорого» — это про <b>тип</b>, а не про идею. <code>ImmutableArray&lt;T&gt;</code> — это массив: чтение по индексу O(1), но любое изменение «Requires creating a new array» — полная копия O(n), структурного разделения нет. <code>ImmutableList&lt;T&gt;</code> — дерево: и <code>Item</code>, и <code>Add</code> — O(log n) (таблица сложности). Отсюда выбор по доминирующей операции: <code>ImmutableArray</code> — когда «Updating the data is rare or the number of elements is quite small» и нужны быстрые итерации/чтения; <code>ImmutableList</code> — когда «Updating the data is common». Один — за чтение платит копией на запись, другой — за дешёвую запись платит логарифмом на чтение.',
      sources: ["ms-collections"],
    },
    {
      id: "s4", num: "04", kicker: "Машинная панель · реальный замер", title: "b = a.Add(4): a.Count=3, b.Count=4, ReferenceEquals=False",
      viewBox: "0 0 340 210", zones: PANEL_ZONES,
      code: ["var a = ImmutableList.Create(1, 2, 3);", "var b = a.Add(4);", "// a изменился? объект тот же?", "WriteLine($\"a.Count={a.Count} b.Count={b.Count} same={ReferenceEquals(a,b)}\");"],
      predictAt: 2, predictQ: 'После <code>b = a.Add(4)</code> — каким остался <code>a.Count</code> и один ли это объект с <code>b</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>a</code> = <code>[1,2,3]</code>, затем <code>b = a.Add(4)</code>. Меряем: изменился ли <code>a</code> и совпадают ли ссылки <code>a</code> и <code>b</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "panel", row: 0, col: 0 }, state: "ok", label: "a", detail: "[1,2,3]" }, { id: "op", kind: "chip", at: { zone: "panel", row: 0, col: 1 }, value: "b = a.Add(4)", accent: true }], edges: [] },
        { codeLine: 3, out: "a.Count=3 b.Count=4 same=False", caption: '<code>a.Count</code> остался <span class="hl">3</span>, <code>b.Count</code> = <b>4</b>, <code>ReferenceEquals(a,b)</code> = <span class="wrong">False</span>: <b>новый объект</b>, исходник не тронут (реальный прогон).', nodes: [{ id: "a", kind: "gate", at: { zone: "panel", row: 0, col: 0 }, state: "ok", label: "a.Count", detail: "3" }, { id: "b", kind: "gate", at: { zone: "panel", row: 0, col: 1 }, state: "ok", label: "b.Count", detail: "4" }, { id: "same", kind: "gate", at: { zone: "panel", row: 0, col: 2 }, state: "fail", label: "same", detail: "False", accent: true }], edges: [] },
        { codeLine: 3, out: "thread-safe без локов", caption: 'Раз <code>a</code> никогда не меняется, его можно шарить между потоками <span class="hl">без единого лока</span> — «This type is immutable, so it is always thread-safe».', nodes: [{ id: "ts", kind: "gate", at: { zone: "panel", row: 0, col: 0 }, state: "ok", label: "immutable", detail: "thread-safe", accent: true }, { id: "nl", kind: "chip", at: { zone: "panel", row: 0, col: 1 }, value: "no locks" }], edges: [] },
      ],
      explain: 'Машинная панель — реально снятое поведение (замер через exec-бэкенд, .NET 10). <code>var a = ImmutableList.Create(1,2,3); var b = a.Add(4);</code> даёт <b>a.Count=3</b>, <b>b.Count=4</b>, <b>ReferenceEquals(a,b)=False</b>: <code>Add</code> вернул новый объект, а <code>a</code> остался прежним — ровно как обещает дока: «these methods return a new object… the original list is unchanged». Это и есть основа бесплатной потокобезопасности: «This type is immutable, so it is <b>always thread-safe</b>», «no locks required». Массовые изменения без промежуточных объектов делает <code>Builder</code> — «a list that mutates with <b>little or no memory allocations</b>»: набираешь через <code>builder.Add(...)</code>, затем <code>ToImmutable()</code> фиксирует результат одним снимком.',
      sources: ["ms-immutablelist", "ms-immutable"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a = ImmutableList.Create(1, 2, 3); var b = a.Add(4); Console.WriteLine($"a.Count={a.Count} b.Count={b.Count} same={ReferenceEquals(a, b)}");</code> — что напечатает?',
      options: ["a.Count=3 b.Count=4 same=False", "a.Count=4 b.Count=4 same=True", "a.Count=4 b.Count=4 same=False", "a.Count=3 b.Count=4 same=True"], correctIndex: 0, xp: 10,
      okText: '<code>Add</code> возвращает <b>новый</b> список: <code>a</code> остался <code>[1,2,3]</code> (Count=3), <code>b</code> = <code>[1,2,3,4]</code> (Count=4), это <span class="hl">разные объекты</span> → same=False.',
      noText: '«these methods return a new object… the original list is unchanged». <code>a.Add(4)</code> не трогает <code>a</code> (Count остаётся 3), <code>b</code> — новый (Count 4, другая ссылка). Вывод: <b>a.Count=3 b.Count=4 same=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "a.Count=3 b.Count=4 same=False" }, sourceRefs: ["ms-immutablelist"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var arr = ImmutableArray.Create(10, 20, 30); var arr2 = arr.Add(40); Console.WriteLine($"arr={arr.Length} arr2={arr2.Length} arr[1]={arr[1]}");</code> — что напечатает?',
      options: ["arr=3 arr2=4 arr[1]=20", "arr=4 arr2=4 arr[1]=20", "arr=3 arr2=4 arr[1]=10", "arr=4 arr2=3 arr[1]=20"], correctIndex: 0, xp: 10,
      okText: '<code>ImmutableArray</code> тоже неизменяем: <code>arr</code> остался длиной <b>3</b>, <code>arr2</code> = 4 (новый массив, O(n) копия), индекс <code>arr[1]</code> = <b>20</b> (O(1)). Вывод: <b>arr=3 arr2=4 arr[1]=20</b>.',
      noText: '<code>Add</code> у <code>ImmutableArray</code> создаёт новый массив (O(n)), исходный не меняется: <code>arr.Length</code>=3, <code>arr2.Length</code>=4. Чтение <code>arr[1]</code>=20 (O(1)). Итог: <b>arr=3 arr2=4 arr[1]=20</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "arr=3 arr2=4 arr[1]=20" }, sourceRefs: ["ms-collections"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Builder для пакетной сборки: <code>var b = ImmutableList.CreateBuilder&lt;int&gt;(); for(int i=0;i&lt;5;i++) b.Add(i*i); var result = b.ToImmutable(); Console.WriteLine($"builder.Count={b.Count} result=[{string.Join(",", result)}]");</code> — что напечатает?',
      options: ["builder.Count=5 result=[0,1,4,9,16]", "builder.Count=5 result=[0,1,2,3,4]", "builder.Count=0 result=[0,1,4,9,16]", "builder.Count=5 result=[1,4,9,16,25]"], correctIndex: 0, xp: 10,
      okText: '<code>Builder</code> мутирует «with little or no memory allocations»: 5 <code>Add</code> дают квадраты 0,1,4,9,16. <code>ToImmutable()</code> фиксирует снимок. Вывод: <b>builder.Count=5 result=[0,1,4,9,16]</b>.',
      noText: 'Квадраты <code>i*i</code> для i=0..4 → <code>0,1,4,9,16</code>; <code>builder.Count</code>=5 после сборки. <code>ToImmutable</code> отдаёт неизменяемый список с тем же содержимым. Итог: <b>builder.Count=5 result=[0,1,4,9,16]</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "builder.Count=5 result=[0,1,4,9,16]" }, sourceRefs: ["ms-immutable"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Новый объект на мутацию", v: '«these methods return a <b>new object</b>… the original list is <b>unchanged</b>». <code>b=a.Add(4)</code>: <code>a</code> цел (Count 3), <code>b</code> новый (Count 4), <code>ReferenceEquals=False</code>. Отсюда «implicit thread safety… no locks required».' },
    { icon: "cost", k: "Не полная копия", v: 'immutable ≠ «дорогая копия всегда». <code>ImmutableList</code> — <b>дерево</b> со структурным разделением: <code>Add</code> O(log n), общие узлы переиспользуются. <code>ImmutableArray</code> — массив: чтение O(1), но <code>Add</code> копирует всё O(n).' },
    { icon: "avoid", k: "Builder для пакета", v: 'Много правок подряд — через <code>Builder</code>: «mutates with <b>little or no memory allocations</b>», затем <code>ToImmutable()</code>. Выбор типа: частые чтения+редкие правки → <code>Array</code>; частые правки → <code>List</code>.' },
  ],

  foot: 'урок · <b>Immutable-коллекции</b> · 4 разбора · новый объект/дерево/Builder · панель a.Count=3 b.Count=4 same=False · дизайн <b>mid</b>',
};
