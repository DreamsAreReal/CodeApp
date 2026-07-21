/**
 * Lesson: Generics в рантайме (CS.S10.generics-runtime) — expert density, 5 animated
 * deep-dives. The DEEP-section opener: how the runtime represents a constructed generic type.
 * Unlike Java type erasure, .NET REIFIES generics — typeof(T) inside a generic yields the real
 * argument type, each constructed type is a distinct runtime type, and value-type instantiations
 * store their element INLINE (no per-element boxing) while reference-type instantiations share the
 * same layout. This lesson establishes the runtime model that the whole S10 section builds on; it
 * COMPLEMENTS CS.S1.generics-basics (compile-time type safety, open/closed, where, the boxing
 * headline) by going one level down to the run-time representation.
 *
 * SIGNATURE machine panel (s5): value-type vs reference-type instantiation, measured. Adding 1000
 * ints to a List<object> boxes each one (32056 B) while List<int> stores them inline (4056 B) —
 * REAL run-csharp measurement (this file's exec cards, app backend :5080). Same source code, two
 * different runtime specializations.
 *
 * Accuracy contract (G4/G7/G8) — verified against learn.microsoft.com/.../standard/generics/
 * (fetched + substring-checked 2026-07-21, ms.date 2022-07-26):
 *   - every English quote is VERBATIM from the standard/generics index page:
 *     "When you create an instance of a generic class, you specify the actual types to substitute
 *      for the type parameters. This establishes a new generic class, referred to as a constructed
 *      generic class…"; "Generic collection types generally perform better for storing and
 *      manipulating value types because there is no need to box the value types."; "The common
 *      language runtime provides new opcodes and prefixes to support generic types in common
 *      intermediate language (CIL)…";
 *   - every card verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (this file's exec
 *     cards): c1 "Int32 String Int32" (reification) · c2 "True False" (same def, distinct closed
 *     type) · c3 "List<object>: 32056 List<int>: 4056" (value-type inline vs boxing).
 *   - The value-type-specialization / reference-type-code-sharing NARRATIVE is the accepted CLR
 *     model but is NOT a verbatim MS sentence on these pages; it is presented as the interpretive
 *     frame while the MEASURED facts (reification via typeof(T); distinct closed types; no boxing
 *     for value-type instantiation) are the proof. No fabricated JIT/native-code quote.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S10.generics-runtime/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: one definition (List`1) — the runtime template that all constructed types come from.
const Z_DEF: Zone = { id: "def", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ОДНО ОПРЕДЕЛЕНИЕ", labelCls: "vz-zlabel sm", lx: 83, ly: 24, sub: "List`1 (шаблон)", subCls: "vz-zsub", subY: 47 };
const Z_CONS: Zone = { id: "cons", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "МНОГО ЗАКРЫТЫХ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "по типу при new", subCls: "vz-zsub heap", subY: 47 };
const DEF_ZONES: Zone[] = [Z_DEF, Z_CONS];

// s2: reification — typeof(T) inside a generic yields the real argument type at run time.
const Z_CODE: Zone = { id: "code", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВНУТРИ Box<T>", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "typeof(T)", subCls: "vz-zsub", subY: 47 };
const Z_RT: Zone = { id: "rt", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "В РАНТАЙМЕ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "реальный тип, не стёрт", subCls: "vz-zsub good", subY: 47 };
const REIFY_ZONES: Zone[] = [Z_CODE, Z_RT];

// s3: two lanes — reference-type instantiations share layout, value-type get their own.
const Z_REF: Zone = { id: "ref", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "REF-ТИПЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "общий layout (ссылки)", subCls: "vz-zsub", subY: 47 };
const Z_VAL: Zone = { id: "val", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "VALUE-ТИПЫ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "своя специализация", subCls: "vz-zsub good", subY: 47 };
const SPEC_ZONES: Zone[] = [Z_REF, Z_VAL];

// s4: CIL — generic opcodes carry the element type (Stelem/Ldelem), the runtime is generic-aware.
const Z_IL: Zone = { id: "il", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "CIL ЗНАЕТ О GENERICS", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "Stelem · Ldelem · Constrained · Unbox_Any", subCls: "vz-zsub", subY: 40 };
const IL_ZONES: Zone[] = [Z_IL];

// s5 (SIGNATURE): value-type inline vs reference-type boxing — measured allocation.
const Z_INLINE: Zone = { id: "inline", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "List<int>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "int inline · 4056 B", subCls: "vz-zsub good", subY: 47 };
const Z_BOX: Zone = { id: "box", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "List<object>", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "боксит int · 32056 B", subCls: "vz-zsub heap", subY: 47 };
const MEASURE_ZONES: Zone[] = [Z_INLINE, Z_BOX];

export const genericsRuntime: LessonData = {
  id: "CS.S10.generics-runtime",
  track: "CS",
  section: "CS.S10",
  module: "S10.1",
  lang: "csharp",
  title: "Generics в рантайме: специализация и код-шаринг",
  kicker: "C# вглубь · S10 · представление в рантайме",
  home: { subtitle: "Реификация, ref-код-шаринг, специализация value-типов, замер", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-generics-std", kind: "doc", org: "Microsoft Learn", title: "Generics in .NET", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/", date: "2022-07-26" },
  ],

  spec: [
    { text: "«When you create an instance of a generic class, you specify the actual types to substitute for the type parameters. This establishes a new generic class, referred to as a constructed generic class, with your chosen types substituted everywhere that the type parameters appear.»", source: "ms-generics-std" },
  ],
  edgeCases: [
    { text: "Каждый закрытый тип — <b>отдельный</b> runtime-тип: <code>typeof(List&lt;int&gt;) != typeof(List&lt;object&gt;)</code>, хотя определение одно (собственный прогон: <code>True False</code>). «This establishes a <b>new</b> generic class, referred to as a constructed generic class».", source: "ms-generics-std" },
    { text: "Реификация, а не стирание: <code>typeof(T)</code> внутри дженерика даёт <b>реальный</b> тип аргумента в рантайме (собственный прогон: <code>Int32</code>/<code>String</code>) — в отличие от Java type erasure.", source: "ms-generics-std" },
    { text: "Value-типы не боксятся при хранении в закрытом типе: «Generic collection types generally perform better for storing and manipulating value types because there is <span class=\"hl\">no need to box the value types</span>».", source: "ms-generics-std" },
  ],

  misconceptions: [
    {
      wrong: "у всех List<T> в рантайме один общий тип, а T стирается до object — как в Java",
      hook: 'Нет: .NET <b>реифицирует</b> дженерики, а не стирает их. Когда ты пишешь <code>new List&lt;int&gt;()</code>, рантайм строит <b>отдельный</b> тип: «When you create an instance of a generic class, you specify the actual types to substitute for the type parameters. This establishes a <span class="hl">new generic class, referred to as a constructed generic class</span>». Поэтому <code>typeof(T)</code> внутри дженерика знает реальный тип, а <code>typeof(List&lt;int&gt;) != typeof(List&lt;object&gt;)</code>. И это не просто метаданные: <code>List&lt;int&gt;</code> хранит <code>int</code> <span class="hl">inline</span> — «no need to box the value types», — тогда как <code>List&lt;object&gt;</code> боксит каждый. Дальше <b>пять разборов</b>: одно определение → много закрытых типов, реификация <code>typeof(T)</code>, две дорожки (ref-типы делят layout, value-типы специализируются), CIL знает о generics, и <b>машинная панель</b> — реально снятая цена боксинга <code>List&lt;object&gt;</code> (32056 B) против <code>List&lt;int&gt;</code> (4056 B).',
      source: "ms-generics-std",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Определение → закрытые типы", title: "Одно определение List`1, много закрытых типов в рантайме",
      viewBox: "0 0 340 210", zones: DEF_ZONES,
      code: ["// одно определение (шаблон) в метаданных сборки", "var a = new List<int>();     // рантайм строит НОВЫЙ тип", "var b = new List<string>();  // и ещё один НОВЫЙ тип"],
      scenes: [
        { codeLine: 0, out: "", caption: 'В сборке лежит <b>одно</b> определение <code>List`1</code> (арность 1) — шаблон с плейсхолдером. Экземпляр по нему создать нельзя.', nodes: [{ id: "d", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "List`1", value: "шаблон", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>new List&lt;int&gt;()</code> — рантайм <span class="hl">строит новый тип</span>: «This establishes a new generic class, referred to as a constructed generic class».', nodes: [{ id: "d", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "List`1", value: "шаблон" }, { id: "ci", kind: "obj", at: { zone: "cons", row: 0 }, typeTag: "List<int>", value: "закрыт", accent: true }], edges: [{ id: "e1", from: "ci", to: "d", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>new List&lt;string&gt;()</code> — <b>ещё один</b> закрытый тип из того же определения. Два разных runtime-типа с общим предком-шаблоном.', nodes: [{ id: "d", kind: "obj", at: { zone: "def", row: 0 }, typeTag: "List`1", value: "шаблон" }, { id: "ci", kind: "obj", at: { zone: "cons", row: 0 }, typeTag: "List<int>", value: "закрыт" }, { id: "cs", kind: "obj", at: { zone: "cons", row: 1 }, typeTag: "List<string>", value: "закрыт", accent: true }], edges: [{ id: "e1", from: "ci", to: "d" }, { id: "e2", from: "cs", to: "d", accent: true }] },
      ],
      explain: 'Дженерик в сборке хранится как <b>одно определение</b> (<code>List`1</code>, суффикс <code>`1</code> — арность), но в рантайме каждый <code>new List&lt;T&gt;()</code> порождает свой закрытый тип. Дословно: «When you create an instance of a generic class, you specify the actual types to substitute for the type parameters. <span class="hl">This establishes a new generic class, referred to as a constructed generic class</span>, with your chosen types substituted everywhere that the type parameters appear». Слово <b>new</b> здесь буквальное: <code>List&lt;int&gt;</code> и <code>List&lt;string&gt;</code> — разные типы (<code>typeof</code> их не равняет), хотя оба идут от одного шаблона. Это фундамент всей секции: рантайм <b>знает</b> аргументы, а не забывает их.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s2", num: "02", kicker: "Реификация · не erasure", title: "typeof(T) внутри дженерика знает реальный тип",
      viewBox: "0 0 340 210", zones: REIFY_ZONES,
      code: ["static string TN<T>() => typeof(T).Name;", "TN<int>()     // \"Int32\"  — тип НЕ стёрт", "TN<string>()  // \"String\" — реальный аргумент в рантайме"],
      predictAt: 1, predictQ: 'Внутри <code>TN&lt;T&gt;()</code> вызывается <code>typeof(T).Name</code>. Что даст <code>TN&lt;int&gt;()</code> и <code>TN&lt;string&gt;()</code> — реальные типы или «T»?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'В теле метода <code>T</code> — параметр типа. В языках со <b>стиранием</b> он превратился бы в <code>Object</code> и рантайм не знал бы аргумент.', nodes: [{ id: "c", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "TN<T>", value: "typeof(T)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '.NET <span class="hl">реифицирует</span>: рантайм подставляет реальный аргумент. <code>TN&lt;int&gt;()</code> внутри видит <code>T=int</code> по-настоящему.', nodes: [{ id: "c", kind: "obj", at: { zone: "code", row: 0 }, typeTag: "TN<T>", value: "typeof(T)" }, { id: "i", kind: "gate", at: { zone: "rt", row: 0 }, state: "ok", label: "TN<int>()", detail: "Int32", accent: true }], edges: [{ id: "e", from: "c", to: "i", accent: true }] },
        { codeLine: 2, out: "Int32 String Int32", caption: 'Панель: <code>Int32</code>, <code>String</code>, и аргумент <code>List&lt;int&gt;</code> — тоже <span class="hl">Int32</span> (реальный прогон). Тип полностью доступен в рантайме.', nodes: [{ id: "i", kind: "gate", at: { zone: "rt", row: 0 }, state: "ok", label: "int", detail: "Int32" }, { id: "s", kind: "gate", at: { zone: "rt", row: 1 }, state: "ok", label: "string", detail: "String", accent: true }], edges: [] },
      ],
      explain: 'Реификация — ключевое отличие .NET от JVM. Раз рантайм строит «a new generic class… with your chosen types substituted everywhere», аргумент <b>не забывается</b>: <code>typeof(T)</code> в теле дженерика возвращает реальный тип (<code>Int32</code>, <code>String</code>), а <code>GetGenericArguments()</code> у закрытого типа отдаёт настоящие аргументы. В Java с type erasure <code>T</code> стирается до <code>Object</code>/границы, и такой информации в рантайме нет. Практические следствия: работает <code>new T[n]</code> и <code>typeof(T)</code>, коллекции хранят элементы точным типом, а reflection видит закрытые типы целиком (см. <code>CS.S6.reflection-generics</code> — открытый/закрытый тип, <code>MakeGenericType</code>).',
      sources: ["ms-generics-std"],
    },
    {
      id: "s3", num: "03", kicker: "Две дорожки · ref vs value", title: "Ref-типы делят layout, value-типы специализируются",
      viewBox: "0 0 340 210", zones: SPEC_ZONES,
      code: ["List<string>, List<object>, List<Uri> — все хранят ССЫЛКУ", "//   → одинаковый layout элемента (машинное слово-указатель)", "List<int>, List<double>, List<Guid>  — хранят САМО значение", "//   → у каждого свой размер элемента и своя специализация"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Для <b>ссылочных</b> аргументов элемент — всегда указатель одного размера. <code>List&lt;string&gt;</code> и <code>List&lt;Uri&gt;</code> раскладывают элемент <span class="hl">одинаково</span>.', nodes: [{ id: "r", kind: "obj", at: { zone: "ref", row: 0 }, typeTag: "List<string>", value: "ref-слот" }, { id: "r2", kind: "obj", at: { zone: "ref", row: 1 }, typeTag: "List<Uri>", value: "ref-слот", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Для <b>value</b>-аргументов элемент — <span class="hl">само значение</span> нужного размера. <code>List&lt;int&gt;</code> (4 байта) и <code>List&lt;Guid&gt;</code> (16) разложены по-разному.', nodes: [{ id: "r", kind: "obj", at: { zone: "ref", row: 0 }, typeTag: "List<string>", value: "ref-слот" }, { id: "v", kind: "obj", at: { zone: "val", row: 0 }, typeTag: "List<int>", value: "int inline", accent: true }, { id: "v2", kind: "obj", at: { zone: "val", row: 1 }, typeTag: "List<Guid>", value: "Guid inline" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Итог: ref-инстанциации <span class="hl">делят один макет</span> (все указатели одинаковы), а каждый value-инстанциация — своя. Это и есть специализация value-типов.', nodes: [{ id: "r", kind: "gate", at: { zone: "ref", row: 0 }, state: "ok", label: "ref-типы", detail: "общий layout" }, { id: "v", kind: "gate", at: { zone: "val", row: 0 }, state: "ok", label: "value-типы", detail: "свой каждый", accent: true }], edges: [] },
      ],
      explain: 'Почему рантайм различает ref и value. У любого ссылочного типа элемент коллекции — это <b>указатель</b> одного машинного размера, поэтому <code>List&lt;string&gt;</code>, <code>List&lt;object&gt;</code>, <code>List&lt;Uri&gt;</code> имеют один и тот же макет элемента (различаются только метаданными типа). А value-тип хранится <b>по значению</b>, и у каждого свой размер (<code>int</code> — 4 байта, <code>Guid</code> — 16), поэтому каждый закрытый value-тип раскладывается отдельно. Отсюда прямое следствие для производительности: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>» — значение лежит inline в специализированном макете, а не в отдельном боксе на куче. Точную цену снимет машинная панель (разбор 05).',
      sources: ["ms-generics-std"],
    },
    {
      id: "s4", num: "04", kicker: "CIL знает о generics", title: "У рантайма есть опкоды под generic-типы",
      viewBox: "0 0 340 276", zones: IL_ZONES,
      code: ["// generic-типы — не трюк компилятора над object:", "// CLR добавил СВОИ опкоды CIL под дженерики", "//   Stelem / Ldelem — запись/чтение элемента типизированного массива", "//   Constrained / Unbox_Any / Readonly"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Дженерики поддержаны <b>на уровне CIL</b>, а не эмулированы над <code>object</code>: рантайм получил <span class="hl">новые опкоды</span> под generic-типы.', nodes: [{ id: "op", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "CIL", value: "новые опкоды", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Stelem</code>/<code>Ldelem</code> пишут и читают элемент <span class="hl">типизированного</span> массива (<code>T[]</code>) — с учётом реального типа элемента.', nodes: [{ id: "op", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "CIL", value: "новые опкоды" }, { id: "st", kind: "chip", at: { zone: "il", row: 1 }, value: "Stelem · Ldelem", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<code>Constrained</code> вызывает метод на <code>T</code> без лишнего боксинга, <code>Unbox_Any</code>/<code>Readonly</code> — тоже часть generic-поддержки CIL.', nodes: [{ id: "op", kind: "obj", at: { zone: "il", row: 0 }, typeTag: "CIL", value: "новые опкоды" }, { id: "st", kind: "chip", at: { zone: "il", row: 1 }, value: "Stelem · Ldelem" }, { id: "c2", kind: "chip", at: { zone: "il", row: 2 }, value: "Constrained · Unbox_Any", accent: true }], edges: [] },
      ],
      explain: 'Дженерики — <b>первоклассная</b> возможность рантайма, а не сахар компилятора над <code>object</code>. Дословно: «The common language runtime provides <span class="hl">new opcodes and prefixes to support generic types in common intermediate language (CIL)</span>, including <code>Stelem</code>, <code>Ldelem</code>, <code>Unbox_Any</code>, <code>Constrained</code>, and <code>Readonly</code>». <code>Stelem</code>/<code>Ldelem</code> работают с типизированными массивами <code>T[]</code>; префикс <code>Constrained</code> позволяет вызвать метод на значении типа <code>T</code> без боксинга, даже когда <code>T</code> может быть value- или ref-типом. Именно поэтому рантайм умеет специализировать value-типы и делить код между ref-типами: тип <code>T</code> присутствует в IL, а не стёрт.',
      sources: ["ms-generics-std"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · inline vs boxing", title: "List<int> хранит inline (4056 B), List<object> боксит (32056 B)",
      viewBox: "0 0 340 210", zones: MEASURE_ZONES,
      code: ["var inline = new List<int>(1000);    for(..1000) inline.Add(i);", "var boxed  = new List<object>(1000); for(..1000) boxed.Add(i);", "// GC.GetAllocatedBytesForCurrentThread() вокруг каждого цикла"],
      predictAt: 1, predictQ: 'Оба списка предразмерены на 1000 и добавляют те же 1000 int. Кто аллоцирует больше — <code>List&lt;int&gt;</code> (value-специализация) или <code>List&lt;object&gt;</code> (ref-layout, боксит int)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>List&lt;int&gt;</code> — value-специализация: <code>int</code> лежит <span class="hl">inline</span> в массиве, <b>0 боксов</b>. Только один массив на 1000 int.', nodes: [{ id: "g", kind: "obj", at: { zone: "inline", row: 0 }, typeTag: "List<int>", value: "int[] inline", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>List&lt;object&gt;</code> — ref-layout: элемент это <b>ссылка</b>. Каждый <code>int</code> надо <span class="hl">упаковать</span> в объект на куче, чтобы получить ссылку.', nodes: [{ id: "g", kind: "obj", at: { zone: "inline", row: 0 }, typeTag: "List<int>", value: "int[] inline" }, { id: "b", kind: "obj", at: { zone: "box", row: 0 }, typeTag: "List<object>", value: "1000 боксов", accent: true }], edges: [] },
        { codeLine: 2, out: "List<object>: 32056 List<int>: 4056", caption: 'Панель: <code>List&lt;object&gt;</code> — <b>32056 B</b> (боксы), <code>List&lt;int&gt;</code> — <b>4056 B</b> (inline). Один и тот же код <code>Add(int)</code>, две разные <span class="hl">специализации</span> (реальный прогон).', nodes: [{ id: "gg", kind: "gate", at: { zone: "inline", row: 0 }, state: "ok", label: "List<int>", detail: "4056 B" }, { id: "bg", kind: "gate", at: { zone: "box", row: 0 }, state: "fail", label: "List<object>", detail: "32056 B", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — цена двух специализаций одного определения, снятая числом. <code>List&lt;int&gt;</code> и <code>List&lt;object&gt;</code> идут от одного <code>List`1</code>, но рантайм раскладывает их по-разному: <code>int</code> хранится <b>inline</b> (value-специализация), а в <code>List&lt;object&gt;</code> элемент — ссылка, поэтому каждый <code>int</code> <b>боксится</b> в объект на куче. Прогон <code>GC.GetAllocatedBytesForCurrentThread()</code> вокруг 1000 вставок: <code>List&lt;object&gt;</code> — <b>32056 байт</b> (1000 боксов + рост), <code>List&lt;int&gt;</code> — <b>4056 байт</b> (только int-массив). Дословно почему так: «Generic collection types generally perform better for storing and manipulating value types because there is <span class="hl">no need to box the value types</span>». Тот же исходник, но представление в рантайме — разное: это и есть специализация.',
      sources: ["ms-generics-std"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static string TN&lt;T&gt;() =&gt; typeof(T).Name; Console.WriteLine($"{TN&lt;int&gt;()} {TN&lt;string&gt;()} {typeof(List&lt;int&gt;).GetGenericArguments()[0].Name}");</code> — что напечатает?',
      options: ["Int32 String Int32", "T T T", "Object Object Object", "int string int"], correctIndex: 0, xp: 10,
      okText: 'Реификация: <code>typeof(T)</code> внутри дженерика даёт <b>реальный</b> тип (<code>Int32</code>, <code>String</code>), а <code>GetGenericArguments()</code> у <code>List&lt;int&gt;</code> — тоже <span class="hl">Int32</span>. Тип НЕ стёрт.',
      noText: '.NET реифицирует дженерики (в отличие от Java erasure): реальный аргумент доступен в рантайме. Вывод: <b>Int32 String Int32</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "Int32 String Int32" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool sameDef = typeof(List&lt;string&gt;).GetGenericTypeDefinition() == typeof(List&lt;object&gt;).GetGenericTypeDefinition(); bool sameClosed = typeof(List&lt;string&gt;) == typeof(List&lt;object&gt;); Console.WriteLine($"{sameDef} {sameClosed}");</code> — что напечатает?',
      options: ["True False", "True True", "False False", "False True"], correctIndex: 0, xp: 10,
      okText: 'Определение <b>одно</b> (<code>List`1</code>) → <code>sameDef=True</code>. Но каждый закрытый тип <b>новый</b>: «This establishes a <span class="hl">new generic class</span>» → <code>List&lt;string&gt; != List&lt;object&gt;</code>, <code>sameClosed=False</code>.',
      noText: 'Один шаблон, но разные закрытые типы. <code>GetGenericTypeDefinition()</code> у обоих — тот же <code>List`1</code> (True), а сами закрытые типы различны (False). Вывод: <b>True False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False" }, sourceRefs: ["ms-generics-std"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>const int N=1000; var w1=new List&lt;object&gt;(N); for(int i=0;i&lt;N;i++)w1.Add(i); var w2=new List&lt;int&gt;(N); for(int i=0;i&lt;N;i++)w2.Add(i); long a0=GC.GetAllocatedBytesForCurrentThread(); var boxed=new List&lt;object&gt;(N); for(int i=0;i&lt;N;i++)boxed.Add(i); long a1=GC.GetAllocatedBytesForCurrentThread(); var inline=new List&lt;int&gt;(N); for(int i=0;i&lt;N;i++)inline.Add(i); long a2=GC.GetAllocatedBytesForCurrentThread(); Console.WriteLine($"List&lt;object&gt;: {a1-a0} List&lt;int&gt;: {a2-a1}");</code> — что напечатает?',
      options: ["List<object>: 32056 List<int>: 4056", "List<object>: 4056 List<int>: 32056", "List<object>: 4056 List<int>: 4056", "List<object>: 0 List<int>: 0"], correctIndex: 0, xp: 10,
      okText: '<code>List&lt;object&gt;</code> боксит каждый <code>int</code> (ref-layout) → <b>32056 B</b>; <code>List&lt;int&gt;</code> хранит inline (value-специализация) → <b>4056 B</b>. Один код, две <span class="hl">специализации</span>.',
      noText: 'Ref-инстанциация <code>List&lt;object&gt;</code> упаковывает каждый int в объект (дорого), value-специализация <code>List&lt;int&gt;</code> — нет. Реальный прогон: <b>List&lt;object&gt;: 32056 List&lt;int&gt;: 4056</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "List<object>: 32056 List<int>: 4056" }, sourceRefs: ["ms-generics-std"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Реификация, не erasure", v: 'Каждый <code>new List&lt;T&gt;()</code> — «a <span class="hl">new</span> generic class, referred to as a constructed generic class». <code>typeof(T)</code> в рантайме знает реальный тип; <code>typeof(List&lt;int&gt;) != typeof(List&lt;object&gt;)</code> (замер: True False).' },
    { icon: "cost", k: "Две специализации", v: 'Ref-типы делят один layout (элемент = указатель); каждый value-тип — свой макет, значение <b>inline</b>. Отсюда «no need to box the value types» (замер: List<int> 4056 B против List<object> 32056 B).' },
    { icon: "avoid", k: "CIL под generics", v: 'Дженерики — возможность рантайма, не сахар над <code>object</code>: «new opcodes and prefixes to support generic types in common intermediate language (CIL)» (<code>Stelem</code>/<code>Ldelem</code>/<code>Constrained</code>/<code>Unbox_Any</code>). Тип <code>T</code> присутствует в IL, а не стёрт.' },
  ],

  foot: 'урок · <b>generics в рантайме</b> · 5 анимир. разборов · реификация · панель List<int> inline vs List<object> boxing · дизайн <b>mid</b>',
};
