/**
 * Lesson: Custom LINQ operators via extension methods (CS.S3.custom-operators) — expert density,
 * 5 animated deep-dives + a machine panel. The section's capstone: the standard query operators
 * are themselves extension methods, so you extend LINQ the same way — a top-level static method
 * with a `this` first parameter on IEnumerable<T>, implemented with `yield return` so it stays
 * DEFERRED (the one rule the docs mandate for custom operators). Binding is compile-time: an
 * instance method with the same signature always wins over an extension.
 *
 * SIGNATURE machine panel (s5): a REAL compiled net10.0 project with a genuine top-level
 * static-class extension operator. Called with instance syntax, `Range(1,10).EveryOther()`
 * compiles to a PLAIN STATIC CALL `MyOperators::EveryOther<int32>(IEnumerable<int>)` — "compiled
 * to the same IL" — and `new Widget().Tag()` binds to `Widget::Tag()` (instance), NOT the
 * extension. Measurements reproduce via this file's run-csharp exec cards.
 *
 * NOTE: run-csharp (CSharpScript) cannot host a TOP-LEVEL static class (it nests the class →
 * CS1109), so the extension-method DEFINITION is proven by the compiled IL + run; the exec cards
 * in this file run the SAME operator body as a local iterator (identical yield/deferred mechanics).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from
 *     learn.microsoft.com/.../csharp/programming-guide/classes-and-structs/extension-methods
 *     ("Extension members" page) and the LINQ landing page (fetch 2026-07-21);
 *   - every card's verify.expect is the REAL stdout of run-csharp (this file's exec cards) ("1,3,5,7,9";
 *     "before=0 after=5"; "21").
 *
 * Loop: cards c1..c3 map to backend review items `CS.S3.custom-operators/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: standard operators ARE extension methods → you extend LINQ the same way.
const Z_STD: Zone = { id: "std", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "СТАНДАРТНЫЕ ОПЕРАТОРЫ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "Where/Select — extension", subCls: "vz-zsub", subY: 47 };
const Z_YOURS: Zone = { id: "yours", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ТВОЙ ОПЕРАТОР", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тем же способом", subCls: "vz-zsub good", subY: 47 };
const EXT_ZONES: Zone[] = [Z_STD, Z_YOURS];

// s2: anatomy of an extension method (static + this + top-level static class).
const Z_ANAT: Zone = { id: "anat", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "АНАТОМИЯ EXTENSION-МЕТОДА", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "static · this-параметр · top-level static class · using", subCls: "vz-zsub good", subY: 47 };
const ANAT_ZONES: Zone[] = [Z_ANAT];

// s3: deferred requirement — yield return keeps it lazy.
const Z_DEFER: Zone = { id: "defer", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "КАСТОМНЫЙ ОПЕРАТОР ОБЯЗАН БЫТЬ DEFERRED", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "yield return → ленивый, как встроенные", subCls: "vz-zsub good", subY: 47 };
const DEFER_ZONES: Zone[] = [Z_DEFER];

// s4: compile-time binding — instance method wins.
const Z_INST: Zone = { id: "inst", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "INSTANCE-МЕТОД", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "приоритет выше", subCls: "vz-zsub good", subY: 47 };
const Z_EXTM: Zone = { id: "extm", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "EXTENSION-МЕТОД", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "fallback, если нет instance", subCls: "vz-zsub", subY: 47 };
const BIND_ZONES: Zone[] = [Z_INST, Z_EXTM];

// s5 (SIGNATURE): the IL — extension via instance syntax = plain static call; instance wins.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "seq.EveryOther()", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "instance-синтаксис", subCls: "vz-zsub good", subY: 47 };
const Z_ILZ: Zone = { id: "ilz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "RELEASE IL", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "call MyOperators::EveryOther", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_CALL, Z_ILZ];

export const customOperators: LessonData = {
  id: "CS.S3.custom-operators",
  track: "CS",
  section: "CS.S3",
  module: "S3.8",
  lang: "csharp",
  title: "Кастомные операторы LINQ: extension-методы",
  kicker: "C# вглубь · S3 · расширяем LINQ сами",
  home: { subtitle: "extension-метод, this-параметр, deferred через yield, приоритет instance", icon: "collections", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-ext", kind: "doc", org: "Microsoft Learn", title: "Extension members — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods", date: "2025-11-20" },
    { id: "ms-linq", kind: "doc", org: "Microsoft Learn", title: "Language Integrated Query (LINQ) — C#", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", date: "2025-12-01" },
    { id: "ms-il-ldloc", kind: "doc", org: "Microsoft Learn", title: "System.Linq.Enumerable", url: "https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Extension methods are static methods, but they're called as if they were instance methods on the extended type… Both forms of extension methods are compiled to the same IL (Intermediate Language).»", source: "ms-ext" },
  ],
  edgeCases: [
    { text: "LINQ-операторы — это и есть extension-методы: «The most common extension members are the <span class=\"hl\">LINQ standard query operators</span> that add query functionality to the existing <code>IEnumerable</code> and <code>IEnumerable&lt;T&gt;</code> types».", source: "ms-ext" },
    { text: "Кастомный оператор обязан быть отложенным: «Custom implementations of the standard query operators should use <span class=\"hl\">deferred execution</span> to return the results».", source: "ms-linq" },
    { text: "Приоритет instance: «At compile time, extension members always have <span class=\"hl\">lower priority than instance</span> (or static) members defined in the type itself… if a type has a method named <code>Process(int i)</code>, and you have an extension method with the same signature, the compiler always binds to the member method».", source: "ms-ext" },
  ],

  misconceptions: [
    {
      wrong: "чтобы добавить свой LINQ-оператор, надо менять исходники .NET или наследовать коллекцию",
      hook: 'Ложная преграда: <span class="wrong">свой оператор LINQ = патчить .NET или наследовать <code>List</code></span>. На деле — обычный <b>extension-метод</b>: «Extension members enable you to <span class="hl">"add" methods to existing types without creating a new derived type, recompiling, or otherwise modifying the original type</span>». Сами <code>Where/Select</code> — тоже extension: «The most common extension members are the <b>LINQ standard query operators</b>». Ниже <b>пять разборов</b>: LINQ как extension, анатомия оператора, обязательная <b>отложенность</b> (yield), приоритет instance-метода, и <b>машинная панель</b> — реальный IL: <code>seq.EveryOther()</code> компилируется в <span class="hl">обычный статический вызов</span> <code>MyOperators::EveryOther</code>, а <code>widget.Tag()</code> связывается с instance-методом, не с extension.',
      source: "ms-ext",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "LINQ = extension-методы", title: "Where/Select — extension; свой оператор пишется так же",
      viewBox: "0 0 340 210", zones: EXT_ZONES,
      code: ["seq.Where(...)      // extension из Enumerable", "seq.Select(...)     // extension из Enumerable", "seq.EveryOther()    // ТВОЙ extension — в общей цепочке"],
      scenes: [
        { codeLine: 0, caption: 'Встроенные <code>Where/Select</code> — это <span class="hl">extension-методы</span> из класса <code>Enumerable</code>, подцепляемые через <code>using System.Linq</code>.', nodes: [{ id: "s", kind: "obj", at: { zone: "std", row: 0 }, typeTag: "Enumerable", value: "Where/Select", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Свой оператор <code>EveryOther</code> — <b>тем же механизмом</b>: extension-метод на <code>IEnumerable&lt;T&gt;</code>. Для вызывающего неотличим от встроенного.', nodes: [{ id: "s", kind: "obj", at: { zone: "std", row: 0 }, typeTag: "Enumerable", value: "Where/Select" }, { id: "y", kind: "obj", at: { zone: "yours", row: 0 }, typeTag: "твой класс", value: "EveryOther", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Он встаёт в <span class="hl">общую цепочку</span>: <code>seq.Where(...).EveryOther().Select(...)</code> — свой и встроенные операторы вперемешку.', nodes: [{ id: "s", kind: "obj", at: { zone: "std", row: 0 }, typeTag: "встроенные", value: "Where" }, { id: "y", kind: "obj", at: { zone: "yours", row: 0 }, typeTag: "твой", value: "EveryOther", accent: true }], edges: [{ id: "e", from: "s", to: "y", accent: true }] },
      ],
      explain: 'LINQ построен на extension-методах — и ты расширяешь его тем же приёмом. Дословно: «Extension members enable you to <span class="hl">"add" methods to existing types without creating a new derived type, recompiling, or otherwise modifying the original type</span>». И: «The most common extension members are the <b>LINQ standard query operators</b> that add query functionality to the existing <code>IEnumerable</code> and <code>IEnumerable&lt;T&gt;</code> types. To use the standard query operators, first bring them into scope with a <code>using System.Linq</code> directive». Значит <code>Where/Select</code> «висят» на <code>IEnumerable&lt;T&gt;</code> ровно так же, как повиснет твой <code>EveryOther</code> — и в цепочке они неразличимы.',
      sources: ["ms-ext"],
    },
    {
      id: "s2", num: "02", kicker: "Анатомия оператора", title: "static метод + this-параметр в top-level static class",
      viewBox: "0 0 340 210", zones: ANAT_ZONES,
      code: ["public static class MyOperators   // top-level static class", "{", "  public static IEnumerable<T> EveryOther<T>(this IEnumerable<T> src)", "  { ... }", "}"],
      scenes: [
        { codeLine: 0, caption: 'Оператор живёт в <span class="hl">top-level static class</span> (не вложенном). Требование компилятора для extension-методов.', nodes: [{ id: "c", kind: "gate", at: { zone: "anat", row: 0 }, state: "ok", label: "static class MyOperators", detail: "top-level, не nested", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Метод <code>static</code>, а первый параметр помечен <span class="hl"><code>this</code></span> — он задаёт тип, который метод расширяет (<code>IEnumerable&lt;T&gt;</code>).', nodes: [{ id: "c", kind: "gate", at: { zone: "anat", row: 0 }, state: "ok", label: "static class", detail: "контейнер" }, { id: "t", kind: "gate", at: { zone: "anat", row: 1 }, state: "ok", label: "this IEnumerable<T> src", detail: "расширяемый тип", accent: true }], edges: [] },
        { codeLine: 2, caption: 'После <code>using</code> нужного namespace метод <b>виден как instance</b>: <code>seq.EveryOther()</code>. В IntelliSense — рядом с <code>Where/Select</code>.', nodes: [{ id: "t", kind: "gate", at: { zone: "anat", row: 0 }, state: "ok", label: "this-параметр", detail: "тип" }, { id: "u", kind: "gate", at: { zone: "anat", row: 1 }, state: "ok", label: "using → в области", detail: "seq.EveryOther()", accent: true }], edges: [] },
      ],
      explain: 'Анатомия extension-метода — дословно: «Extension methods are defined as static methods but are called by using instance method syntax. Their <b>first parameter specifies which type the method operates on</b>. The parameter follows the <span class="hl"><code>this</code> modifier</span>. Extension methods are only in scope when you explicitly import the namespace into your source code with a <code>using</code> directive». Плюс структурное требование: «Both forms of extensions must be defined inside a <b>non-nested, nongeneric static class</b>». То есть: top-level <code>static class</code> → <code>static</code> метод → первый параметр <code>this IEnumerable&lt;T&gt; src</code> → добавляешь <code>using</code> — и <code>seq.EveryOther()</code> работает как родной оператор.',
      sources: ["ms-ext"],
    },
    {
      id: "s3", num: "03", kicker: "Обязательно deferred", title: "yield return делает оператор ленивым — как встроенные",
      viewBox: "0 0 340 210", zones: DEFER_ZONES,
      code: ["public static IEnumerable<T> EveryOther<T>(this IEnumerable<T> src) {", "  int i = 0;", "  foreach (var x in src)", "    if (i++ % 2 == 0) yield return x;   // ← отложенно", "}"],
      scenes: [
        { codeLine: 3, caption: '<code>yield return</code> превращает метод в <b>итератор</b>: тело <span class="hl">не бежит</span>, пока результат не начнут перечислять.', nodes: [{ id: "y", kind: "gate", at: { zone: "defer", row: 0 }, state: "ok", label: "yield return", detail: "→ ленивый итератор", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Так кастомный оператор <span class="hl">ведёт себя как встроенный</span>: deferred, streaming, композируется с <code>Where/Select</code>.', nodes: [{ id: "y", kind: "gate", at: { zone: "defer", row: 0 }, state: "ok", label: "yield", detail: "ленивый" }, { id: "b", kind: "gate", at: { zone: "defer", row: 1 }, state: "ok", label: "как встроенный", detail: "deferred + streaming", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Собрать результат в <code>List</code> внутри и вернуть его — <b>ошибка</b>: это <span class="hl">immediate</span>, ломает ленивость и совместимость с бесконечными источниками.', nodes: [{ id: "bad", kind: "gate", at: { zone: "defer", row: 0 }, state: "fail", label: "return list", detail: "eager — плохо", accent: true }, { id: "ok", kind: "gate", at: { zone: "defer", row: 1 }, state: "ok", label: "yield return", detail: "deferred — правильно" }], edges: [] },
      ],
      explain: 'Главное правило кастомного оператора — <b>отложенность</b>. Дословно (LINQ): «Custom implementations of the standard query operators should use <span class="hl">deferred execution</span> to return the results». Реализация через <code>yield return</code> даёт это бесплатно: метод становится компиляторным итератором (стейт-машина из раздела S18), тело исполняется лениво при перечислении. Если вместо этого собрать всё в <code>List</code> и вернуть его — оператор станет <b>immediate</b>: потеряет ленивость, перестанет работать с бесконечными/дорогими источниками и будет читать вход целиком даже под <code>.First()</code>. Машинная панель докажет отложенность счётчиком (before=0).',
      sources: ["ms-linq"],
    },
    {
      id: "s4", num: "04", kicker: "Приоритет связывания", title: "Instance-метод всегда бьёт extension с той же сигнатурой",
      viewBox: "0 0 340 210", zones: BIND_ZONES,
      code: ["static class Ext { public static string Tag(this object o) => \"ext\"; }", "class Widget { public string Tag() => \"instance\"; }", "new Widget().Tag();   // → \"instance\", extension НЕ вызван"],
      scenes: [
        { codeLine: 2, caption: 'Компилятор сначала ищет <span class="hl">instance-метод</span> нужной сигнатуры в самом типе. Нашёл <code>Widget.Tag()</code> — берёт его.', nodes: [{ id: "i", kind: "gate", at: { zone: "inst", row: 0 }, state: "ok", label: "Widget.Tag()", detail: "instance найден", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Extension <code>Tag(this object)</code> <b>не вызывается</b>: «extension members always have <span class="hl">lower priority</span> than instance (or static) members».', nodes: [{ id: "i", kind: "gate", at: { zone: "inst", row: 0 }, state: "ok", label: "instance", detail: "выбран" }, { id: "e", kind: "gate", at: { zone: "extm", row: 0 }, state: "fail", label: "Ext.Tag(this object)", detail: "проигнорирован", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Extension вызовется <span class="hl">только если instance-метода нет</span>. Отсюда риск: добавили метод в тип — твой extension тихо «отвалился».', nodes: [{ id: "e", kind: "gate", at: { zone: "inst", row: 0 }, state: "ok", label: "нет instance", detail: "тогда extension" }, { id: "f", kind: "gate", at: { zone: "extm", row: 0 }, state: "ok", label: "fallback", detail: "extension сработает", accent: true }], edges: [] },
      ],
      explain: 'Связывание extension-методов — <b>compile-time</b>, с чёткой приоритезацией. Дословно: «You can use extension members to extend a class or interface, but <b>not to override behavior</b> defined in a class. An extension member with the same name and signature as an interface or class members are never called. At compile time, extension members always have <span class="hl">lower priority than instance (or static) members</span> defined in the type itself… When the compiler encounters a member invocation, it first looks for a match in the type\'s members. If no match is found, it searches for any extension members». Практический риск: если в тип позже добавят instance-метод с той же сигнатурой, вызовы «молча» переключатся на него — твой extension перестанет вызываться без единой ошибки компиляции.',
      sources: ["ms-ext"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный IL", title: "seq.EveryOther() — это обычный статический вызов",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// instance-синтаксис:", "Enumerable.Range(1,10).EveryOther()", "// Release IL (ilspycmd):", "call MyOperators::EveryOther<int32>(IEnumerable<int>)", "// а new Widget().Tag() → call instance Widget::Tag()  (не extension)"],
      predictAt: 1, predictQ: 'Extension вызван как <code>seq.EveryOther()</code> (instance-синтаксис). Во что это компилируется в IL?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Пишем <code>seq.EveryOther()</code> — выглядит как <span class="hl">метод экземпляра</span>. Но это extension-метод.', nodes: [{ id: "c", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "seq.EveryOther()", detail: "instance-синтаксис", accent: true }], edges: [] },
        { codeLine: 3, out: "call MyOperators::EveryOther", caption: 'В IL это <span class="hl">обычный статический вызов</span> <code>call MyOperators::EveryOther&lt;int32&gt;(IEnumerable&lt;int&gt;)</code> — seq передан <b>первым аргументом</b> (реальный IL).', nodes: [{ id: "c", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "seq.EveryOther()", detail: "синтаксис" }, { id: "il", kind: "gate", at: { zone: "ilz", row: 0 }, state: "ok", label: "call static", detail: "EveryOther(seq)", accent: true }], edges: [{ id: "e", from: "c", to: "il", accent: true }] },
        { codeLine: 4, out: "call instance Widget::Tag", caption: 'А <code>new Widget().Tag()</code> в IL — <span class="hl">call instance Widget::Tag()</span>: extension проигнорирован, instance выиграл (реальный IL).', nodes: [{ id: "il", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "EveryOther", detail: "static call" }, { id: "w", kind: "gate", at: { zone: "ilz", row: 0 }, state: "ok", label: "Widget::Tag", detail: "instance call", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — реальный Release-IL (ilspycmd), доказывающий два факта. (1) <b>Instance-синтаксис — иллюзия</b>: <code>Enumerable.Range(1,10).EveryOther()</code> компилируется в <code>call …MyOperators::EveryOther&lt;int32&gt;(IEnumerable&lt;int&gt;)</code> — обычный статический вызов, где приёмник <code>seq</code> стал <b>первым аргументом</b>. Дословно: «Extension methods are static methods, but they\'re called as if they were instance methods… Both forms of extension methods are <span class="hl">compiled to the same IL</span>». (2) <b>Приоритет instance</b>: <code>new Widget().Tag()</code> компилируется в <code>call instance string Widget::Tag()</code> — extension <code>MyOperators::Tag</code> в IL <b>не вызывается</b>, что подтверждает «lower priority than instance (or static) members». (Реальный оператор снят компиляцией; exec-карты урока гоняют тело оператора локальным итератором, т.к. scripting-хост не хостит top-level static class.)',
      sources: ["ms-ext", "ms-il-ldloc"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;T&gt; EveryOther&lt;T&gt;(IEnumerable&lt;T&gt; src){ int i=0; foreach(var x in src){ if(i++ % 2 == 0) yield return x; } } var r = EveryOther(Enumerable.Range(1, 10)); Console.WriteLine(string.Join(",", r));</code> — что напечатает?',
      options: ["1,3,5,7,9", "2,4,6,8,10", "1,2,3,4,5", "1,3,5,7,9,10"], correctIndex: 0, xp: 10,
      okText: 'Оператор пропускает элементы с чётным <b>индексом</b> (0,2,4,…) → это значения на нечётных позициях счёта: 1,3,5,7,9. Тело кастомного оператора LINQ — обычный <code>yield</code>-итератор.',
      noText: 'Отдаёт каждый второй по индексу, начиная с 0-го (значения 1,3,5,7,9). Реальный вывод: <b>1,3,5,7,9</b>. Это и есть тело extension-оператора <code>EveryOther</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1,3,5,7,9" }, sourceRefs: ["ms-ext"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Track(IEnumerable&lt;int&gt; src, Action onEach){ foreach(var x in src){ onEach(); yield return x; } } int calls=0; var q = Track(Enumerable.Range(1,5), () =&gt; calls++); Console.Write($"before={calls} "); var list = q.ToList(); Console.Write($"after={calls}");</code> — что напечатает?',
      options: ["before=0 after=5", "before=5 after=5", "before=0 after=0", "before=1 after=5"], correctIndex: 0, xp: 10,
      okText: 'Кастомный оператор на <code>yield return</code> — <b>deferred</b>: до <code>ToList</code> счётчик 0 (before=0); перечисление вызывает <code>onEach</code> 5 раз (after=5). Именно поэтому «Custom implementations … should use deferred execution».',
      noText: '<code>yield return</code> делает оператор ленивым: объявление не исполняет тело → before=0; <code>ToList</code> прогоняет 5 элементов → after=5. Реальный вывод: <b>before=0 after=5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "before=0 after=5" }, sourceRefs: ["ms-linq"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;T&gt; EveryOther&lt;T&gt;(IEnumerable&lt;T&gt; src){ int i=0; foreach(var x in src){ if(i++ % 2 == 0) yield return x; } } var r = EveryOther(Enumerable.Range(1, 10)).Where(x =&gt; x &gt; 3).Sum(); Console.WriteLine(r);</code> — что напечатает?',
      options: ["21", "25", "18", "9"], correctIndex: 0, xp: 10,
      okText: 'Кастомный оператор <span class="hl">композируется</span> со встроенными: <code>EveryOther</code> → {1,3,5,7,9}; <code>Where(&gt;3)</code> → {5,7,9}; <code>Sum</code> → <b>21</b>. Для LINQ он неотличим от родного оператора.',
      noText: '{1,3,5,7,9} после EveryOther; &gt;3 → {5,7,9}; сумма = <b>21</b>. Свой deferred-оператор встаёт в цепочку с <code>Where/Sum</code> как встроенный.',
      verify: { kind: "exec", run: "dotnet run", expect: "21" }, sourceRefs: ["ms-ext"],
    },
  ],

  takeaways: [
    { icon: "why", k: "свой оператор = extension", v: 'LINQ-операторы сами extension-методы; свой пишется так же: top-level <code>static class</code>, <code>static</code> метод, первый параметр <code>this IEnumerable&lt;T&gt;</code>, <code>using</code>. «"add" methods to existing types without … modifying the original type».' },
    { icon: "cost", k: "обязательно deferred", v: '«Custom implementations … should use deferred execution» — реализуй через <code>yield return</code> (замер: before=0 after=5). Так оператор ленив, streaming, композируется с <code>Where/Select</code> и работает с бесконечными источниками.' },
    { icon: "avoid", k: "instance бьёт extension", v: 'Связывание compile-time: «extension members always have lower priority than instance (or static) members» (замер IL: <code>widget.Tag()</code> → instance-вызов). Добавили instance-метод той же сигнатуры — extension молча перестал вызываться.' },
  ],

  foot: 'урок · <b>кастомные операторы LINQ</b> · 5 анимир. разборов · IL-панель: extension → статический вызов · дизайн <b>mid</b>',
};
