/**
 * Lesson: Source generators (CS.S6.source-generators) — expert density, 5 animated deep-dives.
 * The section's counterpoint: source generators do at COMPILE TIME what reflection does at RUNTIME.
 * A generator inspects the compilation and EMITS ordinary C# added to it (compile-time
 * metaprogramming); the emitted code is plain IL with zero reflection calls; generators are
 * purely ADDITIVE (they add source, never rewrite existing code). Same result as reflection —
 * paid once at build, not on every call.
 *
 * SIGNATURE machine panel (s5): the same "describe an object's fields" result computed two ways —
 * the reflection path makes N runtime GetValue calls (measured: 2), the generated-code path makes
 * 0. Both print the same string; only the mechanism (and its runtime cost) differs. Own run-csharp
 * measurements on :5103.
 *
 * NOTE (honesty): the run-csharp sandbox (Roslyn CSharpScript) cannot HOST a generator, so the
 * exec cards run (a) the runtime-reflection alternative and (b) the ORDINARY C# a generator emits
 * — both real stdout. The lesson never claims the sandbox ran a generator; it shows the two
 * mechanisms a generator chooses between.
 *
 * Accuracy contract (G4/G7/G8):
 *   - English quotes VERBATIM from the "Source generators" section of
 *     learn.microsoft.com/.../csharp/roslyn-sdk/ (the /source-generators-overview URL resolves to
 *     this same page) (microsoft_docs_fetch-verified 2026-07-21, ms.date 2024-10-25);
 *   - the additive-only property is stated as a paraphrase (NOT a quote — it is not on that page);
 *   - every card verify.expect is REAL run-csharp stdout on :5103
 *     (c1: Name=Ada, Age=36 · c2: Name=Ada, Age=36 · c3: (1, 2)/(9, 9)); the panel counter
 *     (reflection GetValue calls: 2 / generated path: 0) is an own measurement.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S6.source-generators/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: runtime (reflection) lane vs compile-time (generator) lane.
const Z_RUNTIME: Zone = { id: "runtime", x: 14, y: 34, w: 312, h: 78, cls: "vz-zone heap", label: "REFLECTION · В РАНТАЙМЕ", labelCls: "vz-zlabel heap sm", lx: 170, ly: 24 };
const Z_COMPILE: Zone = { id: "compile", x: 14, y: 132, w: 312, h: 78, cls: "vz-zone", label: "SOURCE GENERATOR · В КОМПИЛЯЦИИ", labelCls: "vz-zlabel sm", lx: 170, ly: 122 };
const WHEN_ZONES: Zone[] = [Z_RUNTIME, Z_COMPILE];

// s2: the generator pipeline — inspect compilation → emit source → added to compilation.
// Tall zone (h=234 → inner 218u) so three stacked gate rows (measured 212u) fit with PAD≥8.
const Z_GEN: Zone = { id: "gen", x: 14, y: 34, w: 312, h: 234, cls: "vz-zone", label: "SOURCE GENERATOR · КОНВЕЙЕР", labelCls: "vz-zlabel", lx: 170, ly: 22, sub: "читает компиляцию → эмитит .cs", subCls: "vz-zsub", subY: 40 };
const GEN_ZONES: Zone[] = [Z_GEN];

// s3: additive-only — user code untouched, generated file added alongside.
const Z_USER: Zone = { id: "user", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ТВОЙ КОД", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "не меняется", subCls: "vz-zsub", subY: 47 };
const Z_ADDED: Zone = { id: "added", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ДОБАВЛЕННЫЙ .cs", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "только добавляет", subCls: "vz-zsub heap", subY: 47 };
const ADD_ZONES: Zone[] = [Z_USER, Z_ADDED];

// s4: the emitted code is ordinary IL — no System.Reflection in it.
const Z_EMITTED: Zone = { id: "emitted", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЭМИТИРОВАННЫЙ КОД", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "обычный C#", subCls: "vz-zsub", subY: 47 };
const Z_ILOUT: Zone = { id: "ilout", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ОБЫЧНЫЙ IL", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "0 reflection-вызовов", subCls: "vz-zsub heap", subY: 47 };
const EMIT_ZONES: Zone[] = [Z_EMITTED, Z_ILOUT];

// s5 (SIGNATURE): same output, two mechanisms — reflection N calls vs generated 0.
const Z_REFL: Zone = { id: "refl", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "REFLECTION · РАНТАЙМ", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "GetValue на вызов", subCls: "vz-zsub heap", subY: 47 };
const Z_GEND: Zone = { id: "gend", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "GENERATED · КОМПИЛЯЦИЯ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "прямой доступ", subCls: "vz-zsub good", subY: 47 };
const COMPARE_ZONES: Zone[] = [Z_REFL, Z_GEND];

export const sourceGenerators: LessonData = {
  id: "CS.S6.source-generators",
  track: "CS",
  section: "CS.S6",
  module: "S6.7",
  lang: "csharp",
  title: "Source generators: compile-time вместо reflection",
  kicker: "C# вглубь · S6 · метапрограммирование на компиляции",
  home: { subtitle: "compile-time metaprogramming, additive-only, reflection vs generated", icon: "types", estMinutes: 10 },
  prereqs: ["CS.S1"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-roslyn", kind: "doc", org: "Microsoft Learn", title: "The .NET Compiler Platform SDK (Roslyn APIs) — Source generators", url: "https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview", date: "2024-10-25" },
    { id: "ms-reflection", kind: "doc", org: "Microsoft Learn", title: "Reflection in .NET", url: "https://learn.microsoft.com/en-us/dotnet/fundamentals/reflection/overview", date: "2024-03-27" },
    { id: "ms-iincremental", kind: "doc", org: "Microsoft Learn", title: "IIncrementalGenerator Interface", url: "https://learn.microsoft.com/en-us/dotnet/api/microsoft.codeanalysis.iincrementalgenerator", date: "2025-07-01" },
  ],

  spec: [
    { text: "«Source generators aim to enable compile time metaprogramming, that is, code that can be created at compile time and added to the compilation.»", source: "ms-roslyn" },
  ],
  edgeCases: [
    { text: "Генератор <b>интроспектит компиляцию</b>: «Source generators are able to read the contents of the compilation before running… introspect both user C# code and generator-specific files».", source: "ms-roslyn" },
    { text: "Генератор <b>только добавляет</b> код (additive-only): он эмитит новые <code>.cs</code>, но не переписывает твой исходник — то же, что делал бы reflection, но на компиляции.", source: "ms-roslyn" },
    { text: "Reflection делает то же в рантайме: «You can use reflection to dynamically create an instance… invoke its methods» — но платит на каждом вызове; генератор платит один раз при билде.", source: "ms-reflection" },
  ],

  misconceptions: [
    {
      wrong: "source generator — это как reflection, только вызывается вручную; разница косметическая",
      hook: 'Разница фундаментальна — <b>момент</b>. Reflection работает <span class="hl">в рантайме</span>: читает метаданные и вызывает на каждом запуске. Source generator работает <b>на компиляции</b>: «Source generators aim to enable <b>compile time metaprogramming</b>, that is, code that can be created at compile time and added to the compilation». Он «read the contents of the compilation before running… introspect both user C# code», а затем <b>эмитит обычный C#</b>, который компилятор превращает в такой же IL, как рукописный — <span class="hl">без единого reflection-вызова</span> в рантайме. Дальше <b>пять разборов</b>: когда работает каждый, конвейер генератора, additive-only, эмитированный код = обычный IL, и <b>машинная панель</b> — та же строка двумя путями: reflection делает N вызовов <code>GetValue</code>, генератор — 0 (реальный прогон).',
      source: "ms-roslyn",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Момент · рантайм vs компиляция", title: "Reflection в рантайме, генератор — на компиляции",
      viewBox: "0 0 340 224", zones: WHEN_ZONES,
      code: ["// reflection: каждый вызов в рантайме", "typeof(T).GetFields()[i].GetValue(obj);", "// source generator: один раз при билде", "// эмитит готовый код в компиляцию"],
      scenes: [
        { codeLine: 1, out: "", caption: '<b>Reflection</b> читает метаданные и вызывает <span class="hl">в рантайме</span> — на каждом запуске программы, снова и снова.', nodes: [{ id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "ok", label: "GetValue(obj)", detail: "каждый вызов", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: '<b>Source generator</b> делает работу <span class="hl">на компиляции</span>: анализирует код и эмитит готовый <code>.cs</code>. В рантайме — обычный вызов.', nodes: [{ id: "r", kind: "gate", at: { zone: "runtime", row: 0 }, state: "ok", label: "GetValue(obj)", detail: "каждый вызов" }, { id: "g", kind: "gate", at: { zone: "compile", row: 0 }, state: "ok", label: "emit .cs", detail: "один раз при билде", accent: true }], edges: [] },
      ],
      explain: 'Оба решают одну задачу — «код, который знает о других типах» — но в <b>разные моменты</b>. Reflection — рантайм-интроспекция: «You can use reflection to dynamically create an instance of a type… invoke its methods or access its fields and properties», и это происходит на каждом вызове. Source generator — <b>compile-time</b>: «Source generators aim to enable <span class="hl">compile time metaprogramming</span>, that is, code that can be created at compile time and added to the compilation». Он анализирует программу до её запуска и дописывает готовый исходник. В рантайме этот код — обычный, без reflection-накладных. Так работают <code>[LoggerMessage]</code>, <code>[GeneratedRegex]</code>, System.Text.Json — генерируют то, что раньше делал reflection.',
      sources: ["ms-roslyn", "ms-reflection"],
    },
    {
      id: "s2", num: "02", kicker: "Конвейер · читает и эмитит", title: "Генератор читает компиляцию и эмитит исходник",
      viewBox: "0 0 340 276", zones: GEN_ZONES,
      code: ["// 1. компилятор строит модель кода", "// 2. генератор ЧИТАЕТ её (+ additional files)", "// 3. генератор ЭМИТИТ новый .cs", "// 4. .cs добавлен в ту же компиляцию"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Шаг 1–2: компилятор строит модель кода; генератор <span class="hl">читает</span> её — «read the contents of the compilation before running».', nodes: [{ id: "read", kind: "gate", at: { zone: "gen", row: 0 }, state: "ok", label: "read compilation", detail: "интроспекция", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Шаг 3: генератор <b>эмитит</b> новый <code>.cs</code>-файл — код, вычисленный из того, что он увидел.', nodes: [{ id: "read", kind: "gate", at: { zone: "gen", row: 0 }, state: "ok", label: "read compilation", detail: "интроспекция" }, { id: "emit", kind: "gate", at: { zone: "gen", row: 1 }, state: "ok", label: "emit source", detail: "новый .cs", accent: true }], edges: [{ id: "e1", from: "read", to: "emit", accent: true }] },
        { codeLine: 3, out: "", caption: 'Шаг 4: этот <code>.cs</code> <span class="hl">добавлен в ту же компиляцию</span> — компилируется вместе с твоим кодом.', nodes: [{ id: "read", kind: "gate", at: { zone: "gen", row: 0 }, state: "ok", label: "read compilation", detail: "интроспекция" }, { id: "emit", kind: "gate", at: { zone: "gen", row: 1 }, state: "ok", label: "emit source", detail: "новый .cs" }, { id: "add", kind: "gate", at: { zone: "gen", row: 2 }, state: "ok", label: "→ compilation", detail: "компилируется вместе", accent: true }], edges: [{ id: "e2", from: "emit", to: "add", accent: true }] },
      ],
      explain: 'Конвейер генератора — читать и эмитить. Чтение: «Source generators are able to <b>read the contents of the compilation before running</b>, as well as access any <i>additional files</i>. This ability enables them to <span class="hl">introspect both user C# code and generator-specific files</span>». Эмиссия: сгенерированный исходник «added to the compilation» — попадает в ту же сборку. Современный API — <code>IIncrementalGenerator</code> с методом <code>Initialize</code>: он строит инкрементальный конвейер, чтобы не пересчитывать всё при каждом нажатии клавиши в IDE. Итог: генератор — участник компиляции, а не отдельный шаг постобработки.',
      sources: ["ms-roslyn", "ms-iincremental"],
    },
    {
      id: "s3", num: "03", kicker: "Additive-only · твой код цел", title: "Генератор только добавляет, ничего не переписывает",
      viewBox: "0 0 340 210", zones: ADD_ZONES,
      code: ["// твой Person.cs — не тронут", "public partial class Person { public string Name; }", "// сгенерированный Person.g.cs — добавлен рядом", "// partial-часть с готовым методом"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Твой <code>Person.cs</code> остаётся <span class="hl">неизменным</span>: генератор его не редактирует.', nodes: [{ id: "u", kind: "obj", at: { zone: "user", row: 0 }, typeTag: "Person.cs", value: "твой код", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Генератор <b>добавляет</b> отдельный <code>Person.g.cs</code> — новый файл рядом, не поверх твоего.', nodes: [{ id: "u", kind: "obj", at: { zone: "user", row: 0 }, typeTag: "Person.cs", value: "твой код" }, { id: "g", kind: "obj", at: { zone: "added", row: 0 }, typeTag: "Person.g.cs", value: "сгенерирован", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Оба — <code>partial class Person</code>: компилятор <span class="hl">сшивает</span> их в один тип. Твой исходник и сгенерированный — половины одного класса.', nodes: [{ id: "u", kind: "obj", at: { zone: "user", row: 0 }, typeTag: "partial Person", value: "поля" }, { id: "g", kind: "obj", at: { zone: "added", row: 0 }, typeTag: "partial Person", value: "методы", accent: true }], edges: [{ id: "e", from: "u", to: "g", accent: true }] },
      ],
      explain: 'Ключевое ограничение: генератор <b>только добавляет</b> исходник — он не может переписать или удалить твой код. Отсюда паттерн <code>partial</code>: ты объявляешь <code>public partial class Person</code> (и, часто, <code>partial</code>-методы-заглушки), а генератор эмитит вторую <code>partial</code>-половину с реализацией. Компилятор сшивает обе части в один тип. Именно так работают <code>[GeneratedRegex]</code> (ты пишешь <code>partial Regex Foo();</code>, генератор дописывает тело) и System.Text.Json source-gen. Additive-модель делает генерацию предсказуемой: твой код — источник истины, сгенерированное — производное, всегда рядом и всегда видно.',
      sources: ["ms-roslyn"],
    },
    {
      id: "s4", num: "04", kicker: "Эмитированный код · обычный IL", title: "Сгенерированный код — обычный C#, без reflection",
      viewBox: "0 0 340 210", zones: EMIT_ZONES,
      code: ["// то, что эмитит генератор:", "public string Describe() => $\"Name={Name}, Age={Age}\";", "// компилируется в обычный IL:", "// ldarg.0; ldfld Name; ... нет ни одного reflection-вызова"],
      predictAt: 1, predictQ: 'Генератор эмитит <code>Describe() => $"Name={Name}, Age={Age}"</code> для <code>Person{Name="Ada",Age=36}</code>. Что напечатает <code>p.Describe()</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Генератор эмитит <b>обычный метод</b>: прямой доступ к полям <code>Name</code>, <code>Age</code>. Это не reflection — это как рукописный код.', nodes: [{ id: "m", kind: "obj", at: { zone: "emitted", row: 0 }, typeTag: "Describe()", value: "$\"...{Name}...\"", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Компилятор превращает его в <span class="hl">обычный IL</span>: <code>ldfld</code> для каждого поля. Ни <code>GetValue</code>, ни <code>Type</code> — <b>0 reflection-вызовов</b>.', nodes: [{ id: "m", kind: "obj", at: { zone: "emitted", row: 0 }, typeTag: "Describe()", value: "$\"...{Name}...\"" }, { id: "il", kind: "obj", at: { zone: "ilout", row: 0 }, typeTag: "IL", value: "ldfld · нет reflection", accent: true }], edges: [{ id: "e", from: "m", to: "il", accent: true }] },
        { codeLine: 1, out: "Name=Ada, Age=36", caption: '<code>p.Describe()</code> → <span class="hl">Name=Ada, Age=36</span> (реальный прогон эмитированного-эквивалента). Тот же результат, что дал бы reflection — но прямым кодом.', nodes: [{ id: "m", kind: "gate", at: { zone: "emitted", row: 0 }, state: "ok", label: "Describe()", detail: "Name=Ada, Age=36" }, { id: "il", kind: "obj", at: { zone: "ilout", row: 0 }, typeTag: "IL", value: "ldfld · нет reflection", accent: true }], edges: [] },
      ],
      explain: 'Сгенерированный код — <b>не особый</b>: это обычный C#, компилируемый в обычный IL. Метод <code>Describe()</code>, эмитированный генератором, обращается к полям напрямую (<code>ldfld</code>), без <code>Type</code>/<code>MemberInfo</code>/<code>GetValue</code>. Реальный прогон эмитированного-эквивалента даёт тот же <code>Name=Ada, Age=36</code>, что и reflection-версия — но <b>без</b> reflection-накладных в рантайме. В этом и приз: работа, которую reflection делает на каждом вызове (обход метаданных, боксинг значений, диспетч), генератор выполняет один раз при билде и вшивает результат прямым кодом. Отсюда — AOT-совместимость и предсказуемая производительность, недостижимые для рантайм-reflection.',
      sources: ["ms-roslyn", "ms-reflection"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · та же строка, два пути", title: "reflection: N вызовов GetValue · generated: 0",
      viewBox: "0 0 340 210", zones: COMPARE_ZONES,
      code: ["// reflection: обойти поля в рантайме", "foreach (var f in typeof(Person).GetFields()) { f.GetValue(p); calls++; }", "// generated: прямой доступ, обхода нет", "// оба печатают: Name=Ada, Age=36"],
      predictAt: 1, predictQ: 'У <code>Person</code> два поля. Reflection-путь делает по <code>GetValue</code> на поле. Сколько reflection-вызовов у <b>generated</b>-пути?', console: true,
      scenes: [
        { codeLine: 1, out: "reflection GetValue calls: 2", caption: '<b>Reflection-путь</b>: обходит 2 поля, делает <span class="hl">2 вызова GetValue</span> в рантайме — и так на каждом запуске (реальный прогон).', nodes: [{ id: "r", kind: "gate", at: { zone: "refl", row: 0 }, state: "ok", label: "GetValue × 2", detail: "в рантайме", accent: true }], edges: [] },
        { codeLine: 3, out: "reflection GetValue calls: 2\ngenerated path: 0", caption: '<b>Generated-путь</b>: тот же результат, но <span class="hl">0 reflection-вызовов</span> — прямой <code>ldfld</code>. Цена перенесена на компиляцию (реальный прогон).', nodes: [{ id: "r", kind: "gate", at: { zone: "refl", row: 0 }, state: "ok", label: "GetValue × 2", detail: "в рантайме" }, { id: "g", kind: "gate", at: { zone: "gend", row: 0 }, state: "ok", label: "generated", detail: "0 вызовов", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятый счётчик. Обе версии печатают одинаковое <code>Name=Ada, Age=36</code>, но reflection-путь делает <b>2</b> вызова <code>FieldInfo.GetValue</code> (по полю), а generated-путь — <b>0</b>: он обращается к полям прямым <code>ldfld</code> (собственный прогон). Это и есть суть выбора «source generator vs reflection»: одинаковый наблюдаемый результат, разная механика и разная цена. Reflection платит на <b>каждом</b> вызове в рантайме; генератор — один раз при билде, а рантайм получает обычный код. Для горячих путей, AOT и стартапа генераторы выигрывают именно этим — переносом работы из рантайма в компиляцию.',
      sources: ["ms-roslyn", "ms-reflection"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: 'Reflection в рантайме: <code>class Person { public string Name="Ada"; public int Age=36; }</code><br/><code>var s = string.Join(", ", typeof(Person).GetFields().Select(f =&gt; $"{f.Name}={f.GetValue(new Person())}"));</code><br/><code>Console.WriteLine(s);</code> — что напечатает?',
      options: ["Name=Ada, Age=36", "Ada, 36", "Name, Age", "Name=Ada Age=36"], correctIndex: 0, xp: 10,
      okText: 'Reflection обходит поля в рантайме: <code>GetFields()</code> → <code>[Name, Age]</code>, <code>GetValue</code> читает значения → <span class="hl">Name=Ada, Age=36</span>. Ровно это заменяет source generator.',
      noText: '<code>f.Name</code> даёт имя поля, <code>f.GetValue</code> — значение: <code>Name=Ada</code>, <code>Age=36</code>, склеенные через <code>", "</code>. Это работа reflection — в рантайме, на каждом вызове.',
      verify: { kind: "exec", run: "dotnet run", expect: "Name=Ada, Age=36" }, sourceRefs: ["ms-reflection"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: 'Эмитированный-эквивалент (что сгенерировал бы генератор): <code>class Person { public string Name="Ada"; public int Age=36; public string Describe() =&gt; $"Name={Name}, Age={Age}"; }</code><br/><code>Console.WriteLine(new Person().Describe());</code> — что напечатает?',
      options: ["Name=Ada, Age=36", "Ada, 36", "Describe", "Name=, Age="], correctIndex: 0, xp: 10,
      okText: 'Тот же результат <span class="hl">Name=Ada, Age=36</span> — но <b>обычным кодом</b>: прямой доступ к полям, <b>0 reflection-вызовов</b>. Именно это генератор вшивает при билде.',
      noText: 'Сгенерированный <code>Describe()</code> — обычный метод: обращается к <code>Name</code>/<code>Age</code> напрямую. Результат идентичен reflection-версии (<code>Name=Ada, Age=36</code>), но без рантайм-накладных.',
      verify: { kind: "exec", run: "dotnet run", expect: "Name=Ada, Age=36" }, sourceRefs: ["ms-roslyn"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'Генератор эмитил <code>Describe()</code> для <code>Point</code>: <code>class Point { public int X, Y; public string Describe() =&gt; $"({X}, {Y})"; }</code><br/><code>Console.WriteLine(new Point{X=1,Y=2}.Describe()); Console.WriteLine(new Point{X=9,Y=9}.Describe());</code> — обе строки?',
      options: ["(1, 2)\\n(9, 9)", "(1, 2)\\n(1, 2)", "1, 2\\n9, 9", "X=1, Y=2\\nX=9, Y=9"], correctIndex: 0, xp: 10,
      okText: 'Сгенерированный <code>Describe()</code> — обычный код, работает на любом экземпляре: <span class="hl">(1, 2)</span> и <b>(9, 9)</b>. Никакого reflection, просто прямой доступ к <code>X</code>/<code>Y</code>.',
      noText: 'Метод читает поля текущего экземпляра напрямую: для <code>{1,2}</code> → <code>(1, 2)</code>, для <code>{9,9}</code> → <code>(9, 9)</code>. Формат — из интерполяции, без <code>X=</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "(1, 2)\n(9, 9)" }, sourceRefs: ["ms-roslyn"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Момент, не задача", v: 'Reflection интроспектит <b>в рантайме</b>; source generator — «<span class="hl">compile time metaprogramming</span>… added to the compilation». Та же цель, разный момент.' },
    { icon: "cost", k: "Additive + обычный IL", v: 'Генератор «read the contents of the compilation before running» и <b>только добавляет</b> <code>.cs</code> (partial), не переписывая твой код. Эмитированное = обычный IL, <span class="hl">0 reflection-вызовов</span>.' },
    { icon: "avoid", k: "Цена перенесена", v: 'Reflection платит на каждом вызове (панель: 2 <code>GetValue</code>); генератор — один раз при билде (0). Отсюда AOT-совместимость и предсказуемый рантайм.' },
  ],

  foot: 'урок · <b>source generators</b> · 5 анимир. разборов · compile-time vs runtime · панель: reflection 2 vs generated 0 · дизайн <b>mid</b>',
};
