/**
 * Lesson: Лямбды и замыкания — capture-семантика (CS.S4.closures-capture) — expert
 * density, 6 animated deep-dives. The central thesis: a closure captures the VARIABLE,
 * not its value at creation time; the compiler hoists the captured local into a field of
 * a display-class, so every delegate shares ONE storage cell — which explains the
 * for/foreach loop trap and the heap cost of a capturing lambda.
 *
 * SIGNATURE machine panel (s5): a live GC.GetAllocatedBytesForCurrentThread() counter —
 * a capturing lambda costs 64 bytes (display-class instance + delegate) every time; a
 * static, non-capturing lambda costs 88 bytes on the FIRST reach of its call-site (the
 * compiler builds and caches the delegate once) and then 0 bytes on every repeat reach
 * (verified in a loop: 88 -> 0 -> 0). REAL measurement via the run-csharp endpoint on the
 * EXACT panel code (scratchpad clos_panel.py / clos_repeat.py, :5080, 2026-07-21, 4/4).
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from a page fetched directly and confirmed
 *     byte-for-byte (2026-07-21):
 *       · lambda-expressions (S1): "Use a lambda expression…", the Action/Func
 *         conversion, "outer variables", "A variable that you capture isn't garbage
 *         collected…", "A lambda expression can't directly capture an in, ref, or out
 *         parameter…", "To prevent unintentional capture… apply the static modifier…",
 *         "A static lambda can't capture local variables or instance state…";
 *       · delegates guide (S2): "A delegate is a type that represents references to
 *         methods…", "Lambda expressions (in certain contexts) are compiled to delegate
 *         types.";
 *       · Roslyn Closure Conversion design doc (S5): "we also have to create an
 *         'environment'…", "Since the local variables are now fields in a class
 *         instance…", "Instead of referring to local variables, the rewritten closure
 *         now references fields on the environment.";
 *       · Lippert archive blog (S7): "Closures close over variables, not over values.",
 *         the "current value of variable v" clause, the C# 5 UPDATE ("a fresh copy of
 *         the variable each time. The 'for' loop will not be changed."), "one loop
 *         variable for the whole loop…";
 *       · migration guide (S4): "Beginning with C# 5 (Visual Studio 2012), foreach
 *         iterator variables are scoped within the iteration.";
 *       · Tepliakov DevBlogs (S8): "2 heap allocations if a lambda captures…", "0 heap
 *         allocations only if a lambda does not capture anything or captures a static
 *         state." (class B — implementation detail, framed as such, not a doc contract).
 *   - the display-class HOISTING mechanic (s3) is stated from the Roslyn design doc
 *     (S5, verbatim); the `<>c__DisplayClass…` NAME is an implementation detail (Roslyn
 *     GeneratedNames), NOT a public API — labelled as a decompiler artefact.
 *   - every card's `verify.expect` is the REAL stdout of the run-csharp endpoint
 *     (measured 2026-07-21): c1 "5\n10"; c2 "for: 3,3,3\nforeach: 0,1,2"; c3
 *     "capturing lambda: 64 bytes".
 *   - the s5 machine-panel numbers (64 bytes capturing every time; 88 bytes static on
 *     first call-site reach, 0 on repeats) are OWN GC.GetAllocatedBytesForCurrentThread
 *     measurements (stable over 4 runs); the CS8820 vs CS8821 distinction is measured too.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S4.closures-capture/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the lambda expression (source) beside the delegate it converts to.
const Z_LAMBDA: Zone = { id: "lambda", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ЛЯМБДА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "анонимная функция", subCls: "vz-zsub", subY: 47 };
const Z_DELEGATE: Zone = { id: "delegate", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ДЕЛЕГАТ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "Func / Action", subCls: "vz-zsub heap", subY: 47 };
const CONVERT_ZONES: Zone[] = [Z_LAMBDA, Z_DELEGATE];

// s2: the enclosing method's variable (left) shared by the delegate (right).
const Z_SCOPE: Zone = { id: "scope", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ВНЕШНИЙ СКОУП", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "переменная v", subCls: "vz-zsub", subY: 47 };
const Z_CLOSURE: Zone = { id: "closure", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ЗАМЫКАНИЕ", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "делегат смотрит на v", subCls: "vz-zsub heap", subY: 47 };
const CAPTURE_ZONES: Zone[] = [Z_SCOPE, Z_CLOSURE];

// s3: the display-class on the heap, its hoisted field nested inside it; the delegates share it.
const Z_DELS: Zone = { id: "dels", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ДЕЛЕГАТЫ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "оба замыкания", subCls: "vz-zsub", subY: 47 };
const Z_ENV: Zone = { id: "env", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ENVIRONMENT · КУЧА", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "display-класс", subCls: "vz-zsub heap", subY: 47 };
const ENV_ZONES: Zone[] = [Z_DELS, Z_ENV];

// s4: two lanes — for (shared variable) vs foreach (fresh copy per iteration).
const Z_FOR: Zone = { id: "forLane", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "for · ОБЩАЯ i", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "одна переменная", subCls: "vz-zsub", subY: 47 };
const Z_FE: Zone = { id: "feLane", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "foreach · КОПИЯ", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "свежая на итерацию", subCls: "vz-zsub good", subY: 47 };
const LOOP_ZONES: Zone[] = [Z_FOR, Z_FE];

// s5 (SIGNATURE): the allocation counter — capturing vs static lambda, one measured number each.
const Z_CAP_LANE: Zone = { id: "capLane", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЗАХВАТ · ЛЯМБДА", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub heap", subY: 47 };
const Z_STATIC_LANE: Zone = { id: "staticLane", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "static · БЕЗ ЗАХВАТА", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "GC.GetAllocatedBytes", subCls: "vz-zsub good", subY: 47 };
const ALLOC_ZONES: Zone[] = [Z_CAP_LANE, Z_STATIC_LANE];

// s6: the static-lambda guard — capture attempt blocked at compile time.
const Z_GUARD: Zone = { id: "guard", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "static ЛЯМБДА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "запрещает захват", subCls: "vz-zsub", subY: 47 };
const Z_OUTER: Zone = { id: "outer", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "ВНЕШНЕЕ СОСТОЯНИЕ", labelCls: "vz-zlabel heap sm", lx: 257, ly: 24, sub: "локали · this", subCls: "vz-zsub heap", subY: 47 };
const GUARD_ZONES: Zone[] = [Z_GUARD, Z_OUTER];

export const closuresCapture: LessonData = {
  id: "CS.S4.closures-capture",
  track: "CS",
  section: "CS.S4",
  module: "S4.1",
  lang: "csharp",
  title: "Лямбды и замыкания: захват переменной",
  kicker: "C# вглубь · S4 · display-класс",
  home: { subtitle: "Захват переменной, ловушка цикла, аллокация замыкания", icon: "types", estMinutes: 11 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-lambda", kind: "doc", org: "Microsoft Learn", title: "Lambda expressions (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions", date: "2026-01-20", archived: "https://github.com/dotnet/docs/blob/489ab432482b3e4d50ab952d3a41cfc9b9a245c8/docs/csharp/language-reference/operators/lambda-expressions.md" },
    { id: "ms-delegates", kind: "doc", org: "Microsoft Learn", title: "Work with delegate types (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/", date: "2025-03-11", archived: "https://github.com/dotnet/docs/blob/4257ed8517531683a4d693be2d173e646194be67/docs/csharp/programming-guide/delegates/index.md" },
    // Machine-level provenance for the display-class HOISTING mechanic (s3): the C#
    // reference does not describe how the compiler stores captured variables, so the
    // "environment / fields in a class instance" mechanic is sourced to the CLR
    // compiler's own design doc (Roslyn Closure Conversion). The `<>c__DisplayClass…`
    // name is a Roslyn implementation detail (GeneratedNames), not a public API.
    { id: "roslyn-closures", kind: "doc", org: "dotnet/roslyn (compiler design doc)", title: "Closure Conversion", url: "https://github.com/dotnet/roslyn/blob/main/docs/compilers/Design/Closure%20Conversion.md", date: "2026-07-21" },
    { id: "ms-foreach-migration", kind: "doc", org: "Microsoft Learn (.NET Framework migration)", title: "Retargeting changes for migration to .NET Framework 4.5.x — Foreach iterator variable is now scoped within the iteration", url: "https://learn.microsoft.com/en-us/dotnet/framework/migration-guide/retargeting/4.5.x", date: "2023-07-31" },
    { id: "ms-iteration", kind: "doc", org: "Microsoft Learn", title: "Iteration statements (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements", date: "2026-01-16" },
    { id: "lippert-loop", kind: "blog", org: "Microsoft Learn (archive · Eric Lippert)", title: "Closing over the loop variable considered harmful", url: "https://learn.microsoft.com/en-us/archive/blogs/ericlippert/closing-over-the-loop-variable-considered-harmful", date: "2009-11-12", archived: "https://docs-archive.visualstudio.com/DefaultCollection/docs-archive-project/_git/blogs-archive-pr/commit/5019655ffa733bb8ab1266cc2a6a7b70a1ecdfa6" },
    { id: "devblogs-tepliakov", kind: "blog", org: "Microsoft DevBlogs (Sergey Tepliakov)", title: "Dissecting the local functions in C# 7", url: "https://devblogs.microsoft.com/premier-developer/dissecting-the-local-functions-in-c-7/", date: "2017-10-03" },
    // S6 (static-anonymous-functions feature spec) confirms the static→no-alloc fact
    // independently, but its preview URL 404s on direct fetch; the same fact is quoted
    // VERBATIM from S1 (verified). Kept as a provenance pointer, no quote taken from it.
    { id: "spec-static-fn", kind: "spec", org: "Microsoft Learn (C# 9 feature spec)", title: "Static anonymous functions", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-9.0/static-anonymous-functions", date: "2020-09-01" },
  ],

  spec: [
    { text: "«If you capture variables in this way, the lambda expression stores them for use even if the variables go out of scope and would normally be garbage collected.»", source: "ms-lambda" },
  ],
  edgeCases: [
    { text: "Захваченная переменная переживает scope: «A variable that you capture isn't garbage collected until the delegate that references it becomes eligible for garbage collection» — замыкание держит объект живым.", source: "ms-lambda" },
    { text: "Лямбда <span class=\"hl\">не может</span> напрямую захватить <code>in</code>/<code>ref</code>/<code>out</code>-параметр: «A lambda expression can't directly capture an <code>in</code>, <code>ref</code>, or <code>out</code> parameter from the enclosing method».", source: "ms-lambda" },
    { text: "Ловушка <code>for</code> жива во всех версиях: переменная цикла — общая. Воркэраунд — копия в тело цикла: <code>int copy = i;</code> и захватывать <code>copy</code> (реальный прогон: <code>0,1,2</code>).", source: "lippert-loop" },
  ],

  misconceptions: [
    {
      wrong: "замыкание захватывает значение переменной на момент создания лямбды",
      hook: 'Интуиция подсказывает: лямбда <span class="wrong">снимает копию значения</span> в момент, когда её создали. На машинном уровне это не так: захватывается <b>переменная</b>, а не снимок. Дословно (Эрик Липперт, участник дизайна C#): «Because <code>()=&gt;v</code> means "return <b>the current value of variable v</b>", not "return the value v was back when the delegate was created". <span class="hl">Closures close over variables, not over values.</span>» Компилятор поднимает локаль в <b>поле</b> общего display-класса — потому два делегата над одной переменной видят одно хранилище (реальный прогон: <code>5</code>, затем <code>10</code>). Дальше <b>шесть разборов</b>: от лямбда→делегат и общего поля до ловушки <code>for</code>/<code>foreach</code> и <b>машинной панели</b> — реально снятого счётчика аллокаций (<b>64 байта</b> захват против <b>0</b> у static-лямбды).',
      source: "lippert-loop",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Лямбда · анонимная функция", title: "=> создаёт функцию, которая становится делегатом",
      viewBox: "0 0 340 210", zones: CONVERT_ZONES,
      code: ["Func<int, int> square = x => x * x;", "Action<string> log = msg => Console.WriteLine(msg);"],
      scenes: [
        { codeLine: 0, caption: 'Оператор <code>=&gt;</code> отделяет параметры от тела: <code>x =&gt; x * x</code> — <b>анонимная функция</b> без имени.', nodes: [{ id: "lam", kind: "chip", at: { zone: "lambda", row: 0 }, value: "x => x*x", w: 96, accent: true }], edges: [] },
        { codeLine: 0, caption: 'Возвращает значение → конвертируется в <code>Func</code>. Компилятор выводит тип делегата из параметров и возврата.', nodes: [{ id: "lam", kind: "chip", at: { zone: "lambda", row: 0 }, value: "x => x*x", w: 96 }, { id: "func", kind: "obj", at: { zone: "delegate", row: 0 }, typeTag: "Func<int,int>", value: "→ square", accent: true }], edges: [{ id: "e1", from: "lam", to: "func", accent: true }] },
        { codeLine: 1, caption: 'Не возвращает значение → <code>Action</code>. Делегат — <b>типобезопасная ссылка на метод</b>; лямбда компилируется в него.', nodes: [{ id: "lam", kind: "chip", at: { zone: "lambda", row: 0 }, value: "msg => …", w: 96 }, { id: "func", kind: "obj", at: { zone: "delegate", row: 0 }, typeTag: "Func<int,int>", value: "square" }, { id: "act", kind: "obj", at: { zone: "delegate", row: 1 }, typeTag: "Action<string>", value: "→ log", accent: true }], edges: [{ id: "e2", from: "lam", to: "act", accent: true }] },
      ],
      explain: 'Лямбда — это способ записать анонимную функцию: «Use a <b>lambda expression</b> to create an anonymous function. Use the lambda declaration operator <code>=&gt;</code> to separate the lambda\'s parameter list from its body». Сама по себе типа она не имеет («A lambda expression doesn\'t have a type because the common type system has no intrinsic concept of \'lambda expression.\'»), но конвертируется в делегат: «If a lambda expression doesn\'t return a value, convert it to one of the <code>Action</code> delegate types. If it returns a value, convert it to one of the <code>Func</code> delegate types». А делегат — «a type that represents references to methods with a particular parameter list and return type»; «Lambda expressions (in certain contexts) are compiled to delegate types». Эта связка лямбда→делегат и есть каркас, на который дальше сядет захват.',
      sources: ["ms-lambda", "ms-delegates"],
    },
    {
      id: "s2", num: "02", kicker: "Захват · переменная, не значение", title: "Делегат видит текущее значение переменной, не снимок",
      viewBox: "0 0 340 210", zones: CAPTURE_ZONES,
      code: ["Func<int> f;", "int v = 5;", "f = () => v;        // захватили v", "Console.WriteLine(f());   // 5", "v = 10;", "Console.WriteLine(f());   // ?"],
      predictAt: 5, predictQ: 'После <code>f = () =&gt; v</code> мы изменили <code>v = 10</code>. Что напечатает второй <code>f()</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: '<code>() =&gt; v</code> захватывает <b>переменную v</b>, а не число 5. Делегат хранит <span class="hl">ссылку на само хранилище</span> v.', nodes: [{ id: "v", kind: "slot", at: { zone: "scope", row: 0 }, name: "v", value: "5" }, { id: "f", kind: "ref", at: { zone: "closure", row: 0 }, name: "f", value: "() => v", accent: true }], edges: [{ id: "e", from: "f", to: "v", accent: true }] },
        { codeLine: 3, out: "5", caption: 'Первый <code>f()</code> читает <b>текущее</b> значение v → <code>5</code>.', nodes: [{ id: "v", kind: "slot", at: { zone: "scope", row: 0 }, name: "v", value: "5", accent: true }, { id: "f", kind: "ref", at: { zone: "closure", row: 0 }, name: "f", value: "() => v" }], edges: [{ id: "e", from: "f", to: "v" }] },
        { codeLine: 4, out: "5", caption: '<code>v = 10</code> меняет <b>ту же переменную</b>, на которую смотрит делегат. Никакого снимка «5» внутри лямбды нет.', nodes: [{ id: "v", kind: "slot", at: { zone: "scope", row: 0 }, name: "v", value: "10", accent: true }, { id: "f", kind: "ref", at: { zone: "closure", row: 0 }, name: "f", value: "() => v" }], edges: [{ id: "e", from: "f", to: "v", accent: true }] },
        { codeLine: 5, out: "5\n10", caption: 'Второй <code>f()</code> читает v <span class="hl">в момент вызова</span> → <code>10</code>. Захват переменной, не значения (реальный прогон).', nodes: [{ id: "v", kind: "slot", at: { zone: "scope", row: 0 }, name: "v", value: "10" }, { id: "f", kind: "ref", at: { zone: "closure", row: 0 }, name: "f", value: "() => v", accent: true }], edges: [{ id: "e", from: "f", to: "v", accent: true }] },
      ],
      explain: 'Центральный тезис темы, дословно от участника дизайна C#: «Because <code>()=&gt;v</code> means "return <b>the current value of variable v</b>", not "return the value v was back when the delegate was created". <span class="hl">Closures close over variables, not over values.</span>» Лямбда ссылается на <i>outer variable</i>, и «If you capture variables in this way, the lambda expression stores them for use even if the variables go out of scope and would normally be garbage collected». Поэтому <code>f()</code> после <code>v = 10</code> печатает <code>10</code>, а не <code>5</code> (реальный прогон: <code>5</code>, затем <code>10</code>). И захваченная переменная переживает scope: «A variable that you capture isn\'t garbage collected until the delegate that references it becomes eligible for garbage collection» — делегат держит её живой.',
      sources: ["ms-lambda", "lippert-loop"],
    },
    {
      id: "s3", num: "03", kicker: "Механика · display-класс", title: "Захваченная локаль становится полем общего класса",
      viewBox: "0 0 340 210", zones: ENV_ZONES,
      code: ["int v = 5;", "Func<int> read  = () => v;", "Action  write = () => v++;", "// оба захватили одну v"],
      scenes: [
        { codeLine: 0, caption: 'Компилятор видит: <code>v</code> захвачена лямбдами. Чтобы делегат пережил метод, нужен <b>environment</b> в куче.', nodes: [{ id: "env", kind: "obj", at: { zone: "env", row: 0 }, typeTag: "DisplayClass", value: "", accent: true }, { id: "vf", kind: "chip", at: { in: "env" }, value: "v = 5", w: 72 }], edges: [] },
        { codeLine: 1, caption: 'Локаль <code>v</code> <span class="hl">поднимается в поле</span> display-класса. <code>read</code> — делегат, чьё тело читает <code>env.v</code>.', nodes: [{ id: "read", kind: "chip", at: { zone: "dels", row: 0 }, value: "read: () => v", w: 120 }, { id: "env", kind: "obj", at: { zone: "env", row: 0 }, typeTag: "DisplayClass", value: "", accent: true }, { id: "vf", kind: "chip", at: { in: "env" }, value: "v = 5", w: 72 }], edges: [{ id: "e1", from: "read", to: "env" }] },
        { codeLine: 2, caption: 'Второй делегат захватил <b>ту же</b> <code>v</code> — тот же экземпляр класса. Оба ссылаются на <span class="hl">одно поле</span>: не копия, а общее хранилище.', nodes: [{ id: "read", kind: "chip", at: { zone: "dels", row: 0 }, value: "read: () => v", w: 120 }, { id: "write", kind: "chip", at: { zone: "dels", row: 1 }, value: "write: v++", w: 120, accent: true }, { id: "env", kind: "obj", at: { zone: "env", row: 0 }, typeTag: "DisplayClass", value: "", accent: true }, { id: "vf", kind: "chip", at: { in: "env" }, value: "v = 5", w: 72 }], edges: [{ id: "e1", from: "read", to: "env" }, { id: "e2", from: "write", to: "env", accent: true }] },
      ],
      explain: 'Это машинный слой захвата — как компилятор реализует «общую переменную». Из design-doc компилятора Roslyn: чтобы замыкание пережило метод, «we also have to create an <b>"environment"</b> to hold its captured variables and somehow deliver that environment into the context of the rewritten method». Захваченные локали <b>перестают быть локалями</b>: «Since the local variables are now <span class="hl">fields in a class instance</span> we can keep the same delegate signature and rely on field access to read and write the free variables», и «Instead of referring to local variables, the rewritten closure now references <b>fields on the environment</b>». Поэтому «замыкание копирует переменную» — миф: <code>read</code> и <code>write</code> делят <b>одно поле</b> одного экземпляра. В декомпиляторе этот класс виден как <code>&lt;&gt;c__DisplayClass…</code> (деталь реализации Roslyn, не публичный API).',
      sources: ["roslyn-closures"],
    },
    {
      id: "s4", num: "04", kicker: "Ловушка цикла · for vs foreach", title: "for делит переменную; foreach даёт свежую копию",
      viewBox: "0 0 340 210", zones: LOOP_ZONES,
      code: ["var forF = new List<Func<int>>();", "for (int i = 0; i < 3; i++) forF.Add(() => i);", "var feF = new List<Func<int>>();", "foreach (var j in new[]{0,1,2}) feF.Add(() => j);"],
      predictAt: 3, predictQ: 'Обе петли строят три делегата. Что напечатают <code>for</code> и <code>foreach</code> — одинаково?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>for</code>: <b>одна</b> переменная <code>i</code> на весь цикл. Все три делегата захватили <span class="hl">её же</span> — одно поле.', nodes: [{ id: "fi", kind: "slot", at: { zone: "forLane", row: 0 }, name: "i", value: "3", accent: true }, { id: "fd", kind: "chip", at: { zone: "forLane", row: 1 }, value: "3 делегата → i", w: 144 }], edges: [] },
        { codeLine: 1, out: "for: 3,3,3", caption: 'После цикла <code>i == 3</code> — и все делегаты читают <b>его</b>. Печать: <span class="hl">for: 3,3,3</span> (реальный прогон). Ловушка жива во всех версиях.', nodes: [{ id: "fi", kind: "slot", at: { zone: "forLane", row: 0 }, name: "i", value: "3", accent: true }, { id: "fg", kind: "gate", at: { zone: "forLane", row: 1 }, state: "fail", label: "все три →", detail: "3,3,3" }], edges: [] },
        { codeLine: 3, out: "for: 3,3,3\nforeach: 0,1,2", caption: '<code>foreach</code> (с C# 5): переменная <b>scoped внутри итерации</b> — на каждой свежая копия. Печать: <span class="hl">foreach: 0,1,2</span>.', nodes: [{ id: "fi", kind: "slot", at: { zone: "forLane", row: 0 }, name: "i", value: "3" }, { id: "fg", kind: "gate", at: { zone: "forLane", row: 1 }, state: "fail", label: "for →", detail: "3,3,3" }, { id: "fej", kind: "gate", at: { zone: "feLane", row: 0 }, state: "ok", label: "foreach →", detail: "0,1,2" }, { id: "fec", kind: "chip", at: { zone: "feLane", row: 1 }, value: "копия на итер.", w: 144, accent: true }], edges: [] },
      ],
      explain: 'Одна и та же на вид петля даёт разный результат, потому что <code>for</code> и <code>foreach</code> захватывают по-разному. <code>foreach</code> изменили в C# 5: «Beginning with C# 5 (Visual Studio 2012), <code>foreach</code> iterator variables are <b>scoped within the iteration</b>» — на каждой итерации логически свежая переменная, поэтому каждый делегат захватывает свою (<code>foreach: 0,1,2</code>). А <code>for</code> НЕ меняли: Липперт прямо ограничил изменение — «closures will close over a fresh copy of the variable each time. <span class="hl">The "for" loop will not be changed.</span>», потому что «there is one loop variable for the whole loop, not a new fresh variable "i" every time through». В <code>for</code> все делегаты делят одну <code>i</code>, после цикла равную 3 → <code>for: 3,3,3</code> (реальный прогон). Воркэраунд для <code>for</code>: <code>int copy = i;</code> в теле цикла и захватывать <code>copy</code>.',
      sources: ["ms-foreach-migration", "lippert-loop", "ms-iteration"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Счётчик аллокаций: захват 64 байта, static 88 (потом 0 из кэша)",
      viewBox: "0 0 340 214", zones: ALLOC_ZONES,
      code: ["int x = 41;", "b0 = GC.GetAllocatedBytesForCurrentThread();", "Func<int> cap = () => x + 1;   // захват", "b1 = GC.GetAllocatedBytesForCurrentThread();", "Func<int> st  = static () => 42;  // без захвата", "b2 = GC.GetAllocatedBytesForCurrentThread();"],
      predictAt: 2, predictQ: 'Сколько байт кучи стоит захватывающая лямбда <code>() =&gt; x + 1</code>?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Замеряем аллокации <b>до и после</b> создания лямбды живым счётчиком <code>GC.GetAllocatedBytesForCurrentThread()</code>.', nodes: [{ id: "cap", kind: "gate", at: { zone: "capLane", row: 0 }, state: "ok", label: "() => x + 1", detail: "замер…" }], edges: [] },
        { codeLine: 2, out: "capturing lambda: 64 bytes", caption: 'Захват <code>x</code> → <span class="hl">64 байта</span> в куче: экземпляр display-класса + сам делегат. Замыкание давит на GC.', nodes: [{ id: "cap", kind: "gate", at: { zone: "capLane", row: 0 }, state: "fail", label: "захват", detail: "64 байта" }, { id: "c0", kind: "chip", at: { zone: "capLane", row: 1 }, value: "env + делегат", w: 120, accent: true }], edges: [] },
        { codeLine: 4, out: "capturing lambda: 64 bytes\nstatic lambda: 88 bytes", caption: '<code>static () =&gt; 42</code> при <b>первом</b> достижении call-site стоит <span class="hl">88 байт</span>: делегат создаётся один раз и <b>кэшируется</b> в static-поле — на повторных проходах уже <b>0</b>. Захват же платит каждый раз.', nodes: [{ id: "cap", kind: "gate", at: { zone: "capLane", row: 0 }, state: "fail", label: "захват", detail: "64 байта" }, { id: "st", kind: "gate", at: { zone: "staticLane", row: 0 }, state: "ok", label: "static (1-й раз)", detail: "88 байт" }, { id: "s0", kind: "chip", at: { zone: "staticLane", row: 1 }, value: "кэш → повтор 0", w: 144, accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — реально снятое число, не легенда. Табло: <code>GC.GetAllocatedBytesForCurrentThread()</code> вокруг двух лямбд даёт <b>capturing lambda: 64 bytes</b> и <b>static lambda: 88 bytes при первом достижении call-site</b> (собственный прогон, стабильно ×4). Важная тонкость честного замера: не-захватывающую лямбду компилятор кэширует в статическое поле — но <b>сам кэш инициализируется один раз</b>, и именно этот первый проход стоит 88 байт (делегат + инициализация поля). Повторные достижения того же call-site возвращают кэшированный делегат и стоят <b>ровно 0</b> (проверено в цикле: 88 → 0 → 0). Направление подтверждает первичка: авторский разбор компилятора — «<b>2 heap allocations</b> if a lambda captures local variable or argument of enclosing method (one for closure instance and another one for a delegate itself)» и «<b>0 heap allocations</b> only if a lambda does not capture anything or captures a static state» (число «2» — деталь реализации, не контракт доков; здесь захват материализуется как 64 байта: environment + делегат). Практика: в горячем (повторном) пути static-лямбда = 0 аллокаций, а захват платит на каждом проходе.',
      sources: ["devblogs-tepliakov", "ms-lambda"],
    },
    {
      id: "s6", num: "06", kicker: "static · управление захватом", title: "static-лямбда запрещает захват — и это ловит компилятор",
      viewBox: "0 0 340 210", zones: GUARD_ZONES,
      code: ["Func<double,double> square = static x => x * x;  // ок: не захватывает", "int local = 5;", "Func<int> bad = static () => local;  // ошибка компиляции"],
      scenes: [
        { codeLine: 0, caption: '<code>static x =&gt; x * x</code> работает только с параметрами и static-членами — <b>захвата нет</b>, аллокации замыкания нет.', nodes: [{ id: "sq", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "static square", detail: "0 аллокаций" }], edges: [] },
        { codeLine: 2, caption: '<code>static () =&gt; local</code> пытается захватить локаль. <code>static</code> это <span class="hl">запрещает</span> — компилятор рубит на месте.', nodes: [{ id: "sq", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "static square", detail: "0 аллокаций" }, { id: "bad", kind: "gate", at: { zone: "guard", row: 1 }, state: "fail", label: "static () => local", detail: "хочет захват", accent: true }, { id: "loc", kind: "chip", at: { zone: "outer", row: 0 }, value: "local = 5", w: 96 }], edges: [{ id: "e", from: "bad", to: "loc", accent: true }] },
        { codeLine: 2, caption: 'Ошибка компиляции — не рантайм-сюрприз: <span class="hl">CS8820</span> (static-лямбда не может ссылаться на локаль/параметр; захват <code>this</code>/<code>base</code> — это отдельный <code>CS8821</code>).', nodes: [{ id: "sq", kind: "gate", at: { zone: "guard", row: 0 }, state: "ok", label: "static square", detail: "0 аллокаций" }, { id: "block", kind: "gate", at: { zone: "guard", row: 1 }, state: "fail", label: "захват local", detail: "CS8820" }, { id: "loc", kind: "chip", at: { zone: "outer", row: 0 }, value: "local = 5", w: 96 }], edges: [] },
      ],
      explain: 'С C# 9 у лямбды есть модификатор, управляющий захватом: «To prevent unintentional capture of local variables or instance state by the lambda, apply the <code>static</code> modifier to a lambda expression». Что именно запрещено — тоже дословно: «A static lambda <b>can\'t capture local variables or instance state</b> from enclosing scopes, but it can reference static members and constant definitions». Попытка захватить локаль из static-лямбды — ошибка компиляции (реальный прогон эндпоинта: <code>error CS8820: A static anonymous function cannot contain a reference to \'local\'</code>), а не тихая аллокация в рантайме. Тонкость: захват локали/параметра — это <code>CS8820</code>, а ссылка на <code>this</code>/<code>base</code> — отдельный <code>CS8821</code>. Практический смысл двойной: в горячем пути <code>static</code> гарантирует <b>0</b> closure-аллокаций на повторных вызовах (разбор 05), и он же ловит случайный захват <code>this</code> — частую причину неожиданного удержания объекта в памяти. Не забываем границу: даже обычная лямбда «can\'t directly capture an <code>in</code>, <code>ref</code>, or <code>out</code> parameter from the enclosing method».',
      sources: ["ms-lambda"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>Func&lt;int&gt; f; int v = 5; f = () =&gt; v; Console.WriteLine(f()); v = 10; Console.WriteLine(f());</code> — что напечатают обе строки?',
      options: ["5\\n10", "5\\n5", "10\\n10", "10\\n5"], correctIndex: 0, xp: 10,
      okText: 'Лямбда захватила <b>переменную</b> <code>v</code>, а не число 5. Второй <code>f()</code> читает <span class="hl">текущее</span> значение → <code>10</code>. «Closures close over variables, not over values».',
      noText: 'Захват — это ссылка на само хранилище <code>v</code>, а не снимок значения. После <code>v = 10</code> делегат видит <code>10</code>. Реальный вывод: <code>5</code>, затем <code>10</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "5\n10" }, sourceRefs: ["ms-lambda", "lippert-loop"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var forF=new List&lt;Func&lt;int&gt;&gt;(); for(int i=0;i&lt;3;i++) forF.Add(()=&gt;i);</code><br/><code>var feF=new List&lt;Func&lt;int&gt;&gt;(); foreach(var j in new[]{0,1,2}) feF.Add(()=&gt;j);</code><br/>печать <code>"for: "+…</code> и <code>"foreach: "+…</code> (через запятую) — обе строки?',
      options: ["for: 3,3,3\\nforeach: 0,1,2", "for: 0,1,2\\nforeach: 0,1,2", "for: 3,3,3\\nforeach: 3,3,3", "for: 0,1,2\\nforeach: 3,3,3"], correctIndex: 0, xp: 10,
      okText: '<code>for</code> делит <b>одну</b> <code>i</code> (после цикла = 3) → <code>3,3,3</code>. С C# 5 переменная <code>foreach</code> «scoped within the iteration» — свежая на каждой → <code>0,1,2</code>. Изменение затронуло только foreach.',
      noText: 'Разные механики захвата: <code>for</code> — общая переменная (ловушка жива), <code>foreach</code> — копия на итерацию (с C# 5). Реальный вывод: <code>for: 3,3,3</code>, затем <code>foreach: 0,1,2</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "for: 3,3,3\nforeach: 0,1,2" }, sourceRefs: ["ms-foreach-migration", "lippert-loop"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: 'В прогретом методе: <code>int x=41; long b0=GC.GetAllocatedBytesForCurrentThread(); Func&lt;int&gt; f=()=&gt;x+1; long b1=GC.GetAllocatedBytesForCurrentThread(); GC.KeepAlive(f); Console.WriteLine($"capturing lambda: {b1-b0} bytes");</code> — что напечатает?',
      options: ["capturing lambda: 64 bytes", "capturing lambda: 0 bytes", "capturing lambda: 24 bytes", "capturing lambda: 88 bytes"], correctIndex: 0, xp: 10,
      okText: 'Захват <code>x</code> аллоцирует <b>экземпляр display-класса + делегат</b> → <span class="hl">64 байта</span> кучи (собственный замер). Не-захватывающая static-лямбда стоила бы <code>0</code> — компилятор её кэширует.',
      noText: 'Захватывающая лямбда — не бесплатна: environment + делегат в куче. Реальный замер <code>GC.GetAllocatedBytesForCurrentThread()</code>: <code>64 bytes</code>. Ноль даёт только отсутствие захвата (static-состояние).',
      verify: { kind: "exec", run: "dotnet run", expect: "capturing lambda: 64 bytes" }, sourceRefs: ["devblogs-tepliakov", "ms-lambda"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что захватывается", v: 'Лямбда захватывает <span class="hl">переменную</span>, не её значение: читает текущее значение в момент вызова. «Closures close over variables, not over values». Компилятор поднимает локаль в <b>поле</b> общего display-класса — потому делегаты делят хранилище.' },
    { icon: "avoid", k: "Ловушка цикла", v: '<code>for</code> делит одну переменную (<code>3,3,3</code>) — ловушка жива во всех версиях, воркэраунд <code>int copy = i;</code>. С C# 5 <code>foreach</code> даёт свежую копию на итерацию (<code>0,1,2</code>). Одинаковыми они не захватываются.' },
    { icon: "cost", k: "Цена и static", v: 'Захват локали/аргумента = <span class="hl">heap-аллокация</span> на каждом проходе (environment + делегат; замер: 64 байта). <code>static</code>-лямбда запрещает захват → на повторных проходах <b>0 байт</b> (кэш; первый проход — 88) и защита от случайного захвата <code>this</code>; попытка захвата локали — ошибка компиляции CS8820.' },
  ],

  foot: 'урок · <b>лямбды и замыкания · захват переменной</b> · 6 анимир. разборов · display-класс · for/foreach · панель-счётчик 64 (захват) vs 88→0 (static) байта · дизайн <b>mid</b>',
};
