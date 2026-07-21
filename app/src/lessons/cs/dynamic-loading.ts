/**
 * Lesson: Динамическая загрузка и использование типов (CS.S6.dynamic-loading) — expert
 * density, 5 animated deep-dives. Reflection is the runtime's late-binding machinery: binding
 * (locating the implementation for a name) that happens at runtime, not compile time. You load
 * a type by string from a loaded assembly, InvokeMember by name, let the Binder pick the right
 * overload from the argument types, and let ChangeType WIDEN an argument to the parameter type.
 *
 * SIGNATURE machine panel (s5): the default Binder's ChangeType — an Int32 argument is coerced
 * to the method's Int64 parameter (a documented WIDENING coercion) and the call succeeds; a
 * String→Double argument (NOT a widening coercion) throws MissingMethodException under the
 * default binder (REAL run-csharp measurement — this file's exec cards).
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from
 *     learn.microsoft.com/.../fundamentals/reflection/dynamically-loading-and-using-types
 *     (microsoft_docs_fetch-verified 2026-07-21, ms.date 2017-03-30);
 *   - the "default binder widens Int32→Int64 but not String→Double" behaviour is an OWN
 *     measured finding matching the page's widening-coercion table (string→double is absent);
 *   - every card verify.expect is REAL run-csharp stdout (this file's exec cards)
 *     (c1: 42 · c2: late/System.Text.StringBuilder · c3: long:42/str:hi).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.dynamic-loading/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: compile-time (early) binding lane above run-time (late) binding lane.
const Z_EARLY: Zone = { id: "early", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone", label: "EARLY BINDING · КОМПИЛЯЦИЯ", labelCls: "vz-zlabel sm", lx: 170, ly: 24 };
const Z_LATE: Zone = { id: "late", x: 14, y: 132, w: 312, h: 78, cls: "vz-zone heap", label: "LATE BINDING · РАНТАЙМ", labelCls: "vz-zlabel heap sm", lx: 170, ly: 122 };
const BIND_ZONES: Zone[] = [Z_EARLY, Z_LATE];

// s2: load an assembly → get a type by string → create instance.
const Z_ASM: Zone = { id: "asm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЗАГРУЖЕННАЯ СБОРКА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "имя типа — строка", subCls: "vz-zsub", subY: 47 };
const Z_INST: Zone = { id: "inst", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЭКЗЕМПЛЯР В РАНТАЙМЕ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "CreateInstance", subCls: "vz-zsub heap", subY: 47 };
const LOAD_ZONES: Zone[] = [Z_ASM, Z_INST];

// s3: InvokeMember dispatch — name+args in, resolved member out.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "InvokeMember", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "имя + аргументы", subCls: "vz-zsub", subY: 47 };
const Z_PICKED: Zone = { id: "picked", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ВЫБРАННАЯ ПЕРЕГРУЗКА", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "Binder решает", subCls: "vz-zsub heap", subY: 47 };
const INVOKE_ZONES: Zone[] = [Z_CALL, Z_PICKED];

// s4: the Binder's two jobs — member selection (BindToMethod) + argument coercion (ChangeType).
const Z_SELECT: Zone = { id: "select", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ВЫБОР ЧЛЕНА", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "BindToMethod", subCls: "vz-zsub", subY: 47 };
const Z_COERCE: Zone = { id: "coerce", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "КОЭРЦИЯ АРГУМЕНТОВ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "ChangeType", subCls: "vz-zsub heap", subY: 47 };
const BINDER_ZONES: Zone[] = [Z_SELECT, Z_COERCE];

// s5 (SIGNATURE): widening coercion works (Int32→Int64), non-widening (String→Double) throws.
const Z_WIDE: Zone = { id: "wide", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "WIDENING · РАБОТАЕТ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "Int32 → Int64", subCls: "vz-zsub good", subY: 47 };
const Z_NOWIDE: Zone = { id: "nowide", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕ WIDENING · БРОСАЕТ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "String → Double", subCls: "vz-zsub heap", subY: 47 };
const COERCE_ZONES: Zone[] = [Z_WIDE, Z_NOWIDE];

export const dynamicLoading: LessonData = {
  id: "CS.S6.dynamic-loading",
  track: "CS",
  section: "CS.S6",
  module: "S6.3",
  lang: "csharp",
  title: "Динамическая загрузка и late binding",
  kicker: "C# вглубь · S6 · связывание в рантайме",
  home: { subtitle: "early vs late binding, InvokeMember, Binder, ChangeType", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-dynload", kind: "doc", org: "Microsoft Learn", title: "Dynamically Loading and Using Types", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/dynamically-loading-and-using-types", date: "2017-03-30" },
    { id: "ms-invokemember", kind: "doc", org: "Microsoft Learn", title: "Type.InvokeMember Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.type.invokemember", date: "2025-07-01" },
    { id: "ms-binder", kind: "doc", org: "Microsoft Learn", title: "Binder Class (System.Reflection)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.reflection.binder", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Reflection provides infrastructure used by language compilers to implement implicit late binding.»", source: "ms-dynload" },
  ],
  edgeCases: [
    { text: "Late binding — про <b>момент</b>: «When this process occurs at runtime rather than at compile time, it's called <b>late binding</b>».", source: "ms-dynload" },
    { text: "<code>CreateInstance</code> — частный случай <code>InvokeMember</code>: «specialized forms of <code>InvokeMember</code> that create new instances of the specified type».", source: "ms-dynload" },
    { text: "Default-binder <code>ChangeType</code> — <b>только widening</b>: <code>Int32→Int64</code> проходит, <code>String→Double</code> под дефолтным binder бросает (нужен кастомный binder).", source: "ms-dynload" },
  ],

  misconceptions: [
    {
      wrong: "late binding — это про производительность; «динамика» = медленно и неуправляемо",
      hook: 'Late binding — это про <b>момент связывания</b>, а не про скорость. «Binding is the process of <span class="hl">locating the declaration</span>… that corresponds to a uniquely specified type. When this process occurs at <b>runtime</b> rather than at <b>compile time</b>, it\'s called late binding». И это не хаос: reflection даёт точный протокол — «you can <b>load an assembly at runtime</b>, obtain information about types in that assembly, specify the type that you want, and then <b>invoke methods</b>… on that type». Дальше <b>пять разборов</b>: early vs late, загрузка типа по строке, диспетч <code>InvokeMember</code>, роль <code>Binder</code>, и <b>машинная панель</b> — как <code>ChangeType</code> <span class="hl">расширяет</span> аргумент <code>Int32→Int64</code>, но пасует на <code>String→Double</code> (реальный прогон).',
      source: "ms-dynload",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Момент связывания", title: "Early binding — компилятор, late binding — рантайм",
      viewBox: "0 0 340 224", zones: BIND_ZONES,
      code: ["// early: тип известен компилятору", "calc.Twice(21);", "// late: имя метода — строка в рантайме", "t.InvokeMember(\"Twice\", …, args);"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Early binding</b>: <code>calc.Twice(21)</code> — компилятор знает тип, метод и сигнатуру. Связал на <span class="hl">компиляции</span>.', nodes: [{ id: "e", kind: "gate", at: { zone: "early", row: 0 }, state: "ok", label: "Twice(21)", detail: "связано в компиляции", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Late binding</b>: имя метода — <span class="hl">строка</span> <code>"Twice"</code>, тип известен только в рантайме. Связывание отложено.', nodes: [{ id: "e", kind: "gate", at: { zone: "early", row: 0 }, state: "ok", label: "Twice(21)", detail: "связано в компиляции" }, { id: "l", kind: "gate", at: { zone: "late", row: 0 }, state: "ok", label: '"Twice" + args', detail: "связано в рантайме", accent: true }], edges: [] },
      ],
      explain: 'Разница не в скорости, а в <b>моменте</b>: «Binding is the process of <span class="hl">locating the declaration (that is, the implementation)</span> that corresponds to a uniquely specified type. When this process occurs at <b>runtime</b> rather than at compile time, it\'s called <b>late binding</b>». Reflection — это инфраструктура late binding: «Reflection provides infrastructure used by language compilers to implement implicit late binding». В early-случае компилятор вшивает вызов по метаданным на этапе билда; в late — имя метода это строка, а нужную реализацию ищет рантайм. Так работают плагины и DI: «useful if you don\'t know an object\'s type at compile time».',
      sources: ["ms-dynload"],
    },
    {
      id: "s2", num: "02", kicker: "Загрузка · тип по строке", title: "Из сборки достаём тип по имени и создаём экземпляр",
      viewBox: "0 0 340 210", zones: LOAD_ZONES,
      code: ["Assembly asm = typeof(string).Assembly;", "Type t = asm.GetType(\"System.Text.StringBuilder\");", "object sb = Activator.CreateInstance(t);"],
      scenes: [
        { codeLine: 0, out: "", caption: 'У нас есть <b>загруженная сборка</b> — контейнер типов, уже в процессе.', nodes: [{ id: "asm", kind: "obj", at: { zone: "asm", row: 0 }, typeTag: "Assembly", value: "CoreLib", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>asm.GetType("System.Text.StringBuilder")</code> — берём <code>Type</code> по <span class="hl">строковому имени</span>. Тип в коде не назван.', nodes: [{ id: "asm", kind: "obj", at: { zone: "asm", row: 0 }, typeTag: "Assembly", value: "CoreLib" }, { id: "t", kind: "obj", at: { zone: "asm", row: 1 }, typeTag: "Type", value: "\"...StringBuilder\"", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>Activator.CreateInstance(t)</code> — <span class="hl">живой экземпляр</span> в куче. Это форма <code>InvokeMember</code> для конструктора.', nodes: [{ id: "asm", kind: "obj", at: { zone: "asm", row: 0 }, typeTag: "Assembly", value: "CoreLib" }, { id: "t", kind: "obj", at: { zone: "asm", row: 1 }, typeTag: "Type", value: "\"...StringBuilder\"" }, { id: "sb", kind: "obj", at: { zone: "inst", row: 0 }, typeTag: "StringBuilder", value: "новый", accent: true }], edges: [{ id: "e1", from: "t", to: "sb", accent: true }] },
      ],
      explain: 'Протокол динамики буквально описан: «you can <b>load an assembly at runtime</b>, obtain information about types in that assembly, <span class="hl">specify the type that you want</span>, and then invoke methods or access fields or properties on that type». Тип задаётся <b>строкой</b> (<code>asm.GetType(name)</code> или <code>Type.GetType(name)</code>) — в коде класса нет. Дальше — <code>Activator.CreateInstance(t)</code>: «The <code>CreateInstance</code> methods… are <b>specialized forms of InvokeMember</b> that create new instances of the specified type». Так грузятся плагины: имя типа приходит из конфига/ввода, а не из <code>using</code>.',
      sources: ["ms-dynload"],
    },
    {
      id: "s3", num: "03", kicker: "Диспетч · InvokeMember", title: "InvokeMember: имя + аргументы → выбранный член",
      viewBox: "0 0 340 210", zones: INVOKE_ZONES,
      code: ["t.InvokeMember(\"PrintValue\",", "  BindingFlags.InvokeMethod, null,", "  instance, new object[]{ 42L });", "// две перегрузки: long и string"],
      predictAt: 3, predictQ: 'Есть <code>PrintValue(long)</code> и <code>PrintValue(string)</code>. Вызов с аргументом <code>42L</code> — какую перегрузку выберет Binder?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>InvokeMember("PrintValue", …, args)</code>: имя метода — строка, аргумент — <code>42L</code> (<b>long</b>).', nodes: [{ id: "call", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "InvokeMember", value: "\"PrintValue\"", accent: true }, { id: "arg", kind: "chip", at: { zone: "call", row: 1 }, value: "arg: 42L" }], edges: [] },
        { codeLine: 3, out: "", caption: 'Кандидатов два: <code>PrintValue(long)</code> и <code>PrintValue(string)</code>. <span class="hl">Binder</span> смотрит на тип аргумента.', nodes: [{ id: "call", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "InvokeMember", value: "\"PrintValue\"" }, { id: "arg", kind: "chip", at: { zone: "call", row: 1 }, value: "arg: 42L" }, { id: "o1", kind: "chip", at: { zone: "picked", row: 0 }, value: "PrintValue(long)", accent: true }, { id: "o2", kind: "chip", at: { zone: "picked", row: 1 }, value: "PrintValue(string)" }], edges: [] },
        { codeLine: 3, out: "long:42", caption: 'Аргумент — <code>long</code> → выбрана <code>PrintValue(long)</code> → печать <b>long:42</b> (реальный прогон). Строковый аргумент ушёл бы в другую перегрузку.', nodes: [{ id: "call", kind: "obj", at: { zone: "call", row: 0 }, typeTag: "InvokeMember", value: "\"PrintValue\"" }, { id: "arg", kind: "chip", at: { zone: "call", row: 1 }, value: "arg: 42L" }, { id: "o1", kind: "gate", at: { zone: "picked", row: 0 }, state: "ok", label: "PrintValue(long)", detail: "выбрана", accent: true }, { id: "o2", kind: "chip", at: { zone: "picked", row: 1 }, value: "PrintValue(string)" }], edges: [{ id: "e", from: "call", to: "o1", accent: true }] },
      ],
      explain: '<code>Type.InvokeMember</code> — единый вход для late-вызова: «Use <b>Type.InvokeMember</b> to invoke a member of a type». Когда одноимённых членов несколько, включается разрешение перегрузок: «Overload resolution is needed when more than one member with the same name is available. The <b>Binder.BindToMethod</b>… methods are used to resolve binding to a single member». Тип фактического аргумента (<code>42L</code> → <code>long</code>) определяет выбор — как в доке Case 2 с двумя <code>PrintValue</code>. Реальный прогон: <code>42L</code> → <code>long:42</code>. То есть late binding не отменяет типовую строгость — просто разрешение отложено в рантайм.',
      sources: ["ms-dynload", "ms-invokemember"],
    },
    {
      id: "s4", num: "04", kicker: "Binder · две работы", title: "Binder: выбрать член и привести аргументы",
      viewBox: "0 0 340 210", zones: BINDER_ZONES,
      code: ["// работа 1: выбор члена", "Binder.BindToMethod(...)  // из кандидатов", "// работа 2: коэрция аргументов", "Binder.ChangeType(arg, paramType, ...)"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Работа 1 — выбор члена</b>: <code>BindToMethod</code> «returns the MethodBase to invoke» из списка кандидатов.', nodes: [{ id: "sel", kind: "gate", at: { zone: "select", row: 0 }, state: "ok", label: "BindToMethod", detail: "→ MethodBase", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Работа 2 — коэрция</b>: <code>ChangeType</code> приводит фактический аргумент к <span class="hl">типу параметра</span> выбранного метода.', nodes: [{ id: "sel", kind: "gate", at: { zone: "select", row: 0 }, state: "ok", label: "BindToMethod", detail: "→ MethodBase" }, { id: "ch", kind: "gate", at: { zone: "coerce", row: 0 }, state: "ok", label: "ChangeType", detail: "arg → paramType", accent: true }], edges: [{ id: "e", from: "sel", to: "ch", accent: true }] },
        { codeLine: 3, out: "", caption: 'Важно: «<code>ChangeType</code> is called for <b>every argument</b> even if the types match exactly» — коэрция всегда в цепочке.', nodes: [{ id: "sel", kind: "gate", at: { zone: "select", row: 0 }, state: "ok", label: "BindToMethod", detail: "→ MethodBase" }, { id: "ch", kind: "gate", at: { zone: "coerce", row: 0 }, state: "ok", label: "ChangeType", detail: "каждый аргумент", accent: true }], edges: [{ id: "e", from: "sel", to: "ch" }] },
      ],
      explain: 'Late-вызов делает не «магия», а объект <code>Binder</code> — «The <code>Binder</code> class provides custom control of member selection and invocation». У него две задачи. Первая — <b>выбор члена</b>: «<code>BindToMethod</code> returns the <span class="hl">MethodBase</span> to invoke, or a null reference… if no such invocation is possible». Вторая — <b>коэрция аргументов</b>: «<code>ChangeType</code> performs argument coercion (type conversion), which converts the actual arguments to the type of the formal arguments of the selected method», причём «<code>ChangeType</code> is called for <b>every argument</b> even if the types match exactly». Дефолтный binder делает это по правилам CTS; кастомный (<code>: Binder</code>) может переопределить всё.',
      sources: ["ms-dynload", "ms-binder"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальная коэрция", title: "ChangeType расширяет Int32→Int64, но пасует на String→Double",
      viewBox: "0 0 340 210", zones: COERCE_ZONES,
      code: ["// метод: Take(long v)", "t.InvokeMember(\"Take\", …, args: new object[]{ (int)41 });", "// arg — Int32, параметр — Int64 (widening)", "// а new object[]{ \"5.5\" } к double — бросит"],
      predictAt: 1, predictQ: 'У метода параметр <code>long</code>, а в args лежит <code>(int)41</code>. Дефолтный Binder приведёт <code>Int32→Int64</code> — что выйдет?', console: true,
      scenes: [
        { codeLine: 1, out: "coerced to long: 41", caption: 'Аргумент <code>Int32</code>, параметр <code>Int64</code> — это <span class="hl">widening</span> (в таблице доки). <code>ChangeType</code> расширяет, вызов проходит: <b>coerced to long: 41</b> (реальный прогон).', nodes: [{ id: "ok", kind: "gate", at: { zone: "wide", row: 0 }, state: "ok", label: "Int32 → Int64", detail: "widening ✓", accent: true }, { id: "res", kind: "chip", at: { zone: "wide", row: 1 }, value: "long: 41" }], edges: [] },
        { codeLine: 3, out: "coerced to long: 41", caption: 'А <code>String "5.5" → Double</code> — <b>не widening</b> (в таблице такой строки нет). Дефолтный Binder не находит метод → <span class="hl">MissingMethodException</span>.', nodes: [{ id: "ok", kind: "gate", at: { zone: "wide", row: 0 }, state: "ok", label: "Int32 → Int64", detail: "widening ✓" }, { id: "res", kind: "chip", at: { zone: "wide", row: 1 }, value: "long: 41" }, { id: "bad", kind: "gate", at: { zone: "nowide", row: 0 }, state: "fail", label: "String → Double", detail: "throws", accent: true }, { id: "ex", kind: "chip", at: { zone: "nowide", row: 1 }, value: "MissingMethod", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятое поведение дефолтного binder. Правило доки: «<code>ChangeType</code> performs <span class="hl">only lossless or widening coercions</span>», и в таблице widening есть <code>Int32 → Int64</code>, но <b>нет</b> <code>String → Double</code>. Прогон подтверждает: <code>(int)41</code> к параметру <code>long</code> коэрцится → <b>coerced to long: 41</b>; а <code>"5.5"</code> к <code>double</code> под дефолтным binder бросает <b>MissingMethodException</b> — метод «не найден», потому что аргумент не приводится widening-путём. Именно поэтому доковый Case 3 (<code>"5.5"</code>→<code>double</code>) требует <b>кастомного</b> <code>Binder</code>, вызывающего <code>Convert.ChangeType</code>. Late binding строг ровно настолько, насколько строг binder.',
      sources: ["ms-dynload"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>public class Calc { public long Twice(long v)=>v*2; }</code><br/><code>object c = Activator.CreateInstance(typeof(Calc));</code><br/><code>Console.WriteLine(typeof(Calc).InvokeMember("Twice", BindingFlags.InvokeMethod, null, c, new object[]{21L}));</code> — что напечатает?',
      options: ["42", "21", "Twice", "System.Int64"], correctIndex: 0, xp: 10,
      okText: 'Late binding: экземпляр создан <code>Activator.CreateInstance</code>, метод найден по строке <code>"Twice"</code> и вызван — вернул <code>21*2 = <span class="hl">42</span></code>. Тип известен только в рантайме.',
      noText: '<code>InvokeMember</code> реально вызывает метод и возвращает его результат: <code>Twice(21) = <b>42</b></code>. Имя метода — строка, но вызов настоящий.',
      verify: { kind: "exec", run: "dotnet run", expect: "42" }, sourceRefs: ["ms-dynload"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>Assembly asm = typeof(string).Assembly;</code><br/><code>Type t = asm.GetType("System.Text.StringBuilder"); object sb = Activator.CreateInstance(t);</code><br/><code>t.InvokeMember("Append", BindingFlags.InvokeMethod, null, sb, new object[]{"late"}); Console.WriteLine(sb); Console.WriteLine(t.FullName);</code> — обе строки?',
      options: ["late\\nSystem.Text.StringBuilder", "\\nSystem.Text.StringBuilder", "late\\nStringBuilder", "System.Text.StringBuilder\\nlate"], correctIndex: 0, xp: 10,
      okText: 'Тип загружен <b>по строке</b> из сборки, экземпляр создан, <code>Append("late")</code> вызван поздним связыванием — <code>sb</code> печатает <span class="hl">late</span>, <code>FullName</code> — <b>System.Text.StringBuilder</b>.',
      noText: 'Ни одного <code>using StringBuilder</code>: тип получен <code>asm.GetType("...StringBuilder")</code>. После <code>Append("late")</code> объект печатает <code>late</code>, а <code>FullName</code> — полное имя типа.',
      verify: { kind: "exec", run: "dotnet run", expect: "late\nSystem.Text.StringBuilder" }, sourceRefs: ["ms-dynload"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>public class D { public string PrintValue(long v)=>$"long:{v}"; public string PrintValue(string v)=>$"str:{v}"; }</code><br/><code>WriteLine(t.InvokeMember("PrintValue", InvokeMethod, null, d, new object[]{42L}));</code><br/><code>WriteLine(t.InvokeMember("PrintValue", InvokeMethod, null, d, new object[]{"hi"}));</code> — обе строки?',
      options: ["long:42\\nstr:hi", "str:42\\nstr:hi", "long:42\\nlong:hi", "str:hi\\nlong:42"], correctIndex: 0, xp: 10,
      okText: 'Binder выбирает перегрузку по <span class="hl">типу аргумента</span>: <code>42L</code> (long) → <code>PrintValue(long)</code> → <b>long:42</b>; <code>"hi"</code> (string) → <b>str:hi</b>. «The appropriate method is selected by the call to <code>BindToMethod</code>».',
      noText: 'Разрешение перегрузок в late binding живёт: тип фактического аргумента решает. <code>long</code> → <code>long:42</code>, <code>string</code> → <code>str:hi</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "long:42\nstr:hi" }, sourceRefs: ["ms-dynload", "ms-invokemember"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Момент, не скорость", v: 'Late binding — связывание в <b>рантайме</b>, а не на компиляции. Reflection — «infrastructure… to implement implicit late binding». Тип может прийти из конфига/ввода.' },
    { icon: "cost", k: "Протокол", v: 'Загрузить сборку → <code>asm.GetType("имя")</code> → <code>Activator.CreateInstance</code> → <code>InvokeMember("метод", args)</code>. <code>CreateInstance</code> — одна из «specialized forms of <code>InvokeMember</code>».' },
    { icon: "avoid", k: "Binder строг", v: '<code>Binder</code> выбирает член (<code>BindToMethod</code>) и <b>коэрцит</b> аргументы (<code>ChangeType</code>). Дефолт делает <span class="hl">только widening</span>: <code>Int32→Int64</code> — да, <code>String→Double</code> — бросает.' },
  ],

  foot: 'урок · <b>динамическая загрузка и late binding</b> · 5 анимир. разборов · Binder · панель ChangeType widening · дизайн <b>mid</b>',
};
