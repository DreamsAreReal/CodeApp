/**
 * Lesson: Замыкания и захват переменных (T2.M2.closures) — expert density, 5
 * animated deep-dives. Every claim carries a source id; all English quotes are
 * verbatim from learn.microsoft.com (Lambda expressions — "Capture of outer
 * variables and variable scope") and the C# language specification (§13.9.5
 * The foreach statement), retrieved 2026-07-09. Reuses the shared memory-model
 * primitives (stack + heap zones + slot/ref/obj/chip/gate).
 *
 * Ground truth for card `c1` is REAL execution via the backend
 * POST /api/authoring/run-csharp: the `for`-loop capture prints "333".
 * Loop: card `c1` maps to backend review item `T2.M2.closures/c1`.
 */
import type { Zone } from "../engine/index.ts";
import type { LessonData } from "./types.ts";

// Stack (locals) on the left, GC heap (the compiler-generated display class) on the right.
// Auto-layout v2: zones carry an `id` and nodes declare only `at:{zone,row,col}` /
// `at:{in}` — the engine computes every x/y/w/h, so no crooked frame is authorable.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "СТЕК ПОТОКА", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "локальные · слоты", subCls: "vz-zsub", subY: 47 };
const Z_HEAP: Zone = { id: "heap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "GC-КУЧА", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "display class", subCls: "vz-zsub heap", subY: 47 };
const MM_ZONES: Zone[] = [Z_STACK, Z_HEAP];

export const closures: LessonData = {
  id: "T2.M2.closures",
  track: "T2",
  module: "M2.2",
  title: "Замыкания и захват",
  kicker: "Ядро C# · лямбды · нюанс",
  home: { subtitle: "Захват переменной (не значения), display class, gotcha цикла", icon: "types", estMinutes: 10 },
  prereqs: ["T1.M3.boxing"],
  depth: 4,
  version: "1",
  status: "self-pass",

  // COMPOSITE-QUOTES (frozen — do NOT extend, see types.ts):
  //   seg display-class explain · "delegate alive" scene caption · foreach scene caption
  //   · foreach-vs-for explain (cs-spec §13.9.5.2). Each stitches non-adjacent sentences via «…».
  sources: [
    { id: "ms-lambda", kind: "doc", org: "Microsoft Learn", title: "Lambda expressions (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions", date: "2026-01-20", archived: "https://web.archive.org/web/20260113115930/https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions" },
    { id: "ms-delegates-lambdas", kind: "doc", org: "Microsoft Learn", title: "Lambda expressions, delegates, and events (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas", date: "2024-11-06" },
    { id: "cs-spec-foreach", kind: "spec", org: "Microsoft Learn · C# language specification", title: "C# language specification · §13.9.5.2 Synchronous foreach", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/statements", date: "2023-06-22", archived: "https://web.archive.org/web/20230623135450/https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/statements" },
    { id: "cs-history", kind: "doc", org: "Microsoft Learn", title: "The history of C# (C# 5.0)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history", date: "2025-11-18", archived: "https://web.archive.org/web/20251110080950/https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history" },
    { id: "ms-gc", kind: "doc", org: "Microsoft Learn", title: "Fundamentals of garbage collection", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", date: "2025-10-22", archived: "https://web.archive.org/web/20251030225000/https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals" },
  ],

  spec: [
    { text: "«If you capture variables in this way, the lambda expression stores them for use even if the variables go out of scope and would normally be garbage collected.»", source: "ms-lambda" },
  ],
  edgeCases: [
    { text: "Захваченная переменная <b>переживает</b> свою область видимости: «A variable that you capture isn't garbage collected until the delegate that references it becomes eligible for garbage collection».", source: "ms-lambda" },
    { text: "<code>static</code>-лямбда <b>не</b> захватывает: «A static lambda can't capture local variables or instance state from enclosing scopes, but it can reference static members and constant definitions».", source: "ms-lambda" },
    { text: "Лямбда не может <b>прямо</b> захватить <code>in</code>/<code>ref</code>/<code>out</code>-параметр: «A lambda expression can't directly capture an in, ref, or out parameter from the enclosing method».", source: "ms-lambda" },
  ],

  misconceptions: [
    {
      wrong: "лямбда захватывает ЗНАЧЕНИЕ переменной в момент создания",
      hook: 'Расхожая картинка: <code>x => x + n</code> «запоминает» <span class="wrong">значение</span> <code>n</code> на момент создания лямбды. На деле захватывается сама <b>переменная</b> (ячейка), а не снимок значения: компилятор поднимает её в <b>поле display-класса</b> на куче, и все лямбды делят <span class="wrong">одну ячейку</span> — значение читается в момент исполнения лямбды, а не захвата. Ниже — <b>пять разборов</b> с анимацией: захват переменной, display-класс на куче, общая ячейка, продлённое время жизни и классический gotcha захвата переменной цикла.',
      source: "ms-lambda",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Захват · переменная, не значение", title: "Лямбда ссылается на внешнюю переменную",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["int n = 1;", "Func<int,int> add = x => x + n;", "n = 100;", "Console.Write(add(5)); // 105"],
      predictAt: 2, predictQ: 'Лямбда создана при <code>n == 1</code>, потом <code>n = 100</code>. Что напечатает <code>add(5)</code> — 6 или 105?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Лямбда ссылается на <b>внешнюю переменную</b> <code>n</code> — «Lambdas can refer to <span class="hl">outer variables</span>». Это захват переменной, а не копия значения.', nodes: [{ id: "n", kind: "slot", at: { zone: "stack", row: 0 }, name: "n", value: "1" }, { id: "add", kind: "ref", at: { zone: "stack", row: 1 }, name: "add", accent: true }, { id: "cap", kind: "chip", at: { zone: "heap", row: 0 }, value: "→ n" }], edges: [{ id: "e", from: "add", to: "cap", accent: true }] },
        { codeLine: 2, out: "", caption: '<code>n = 100</code> меняет <span class="hl">ту же ячейку</span>, на которую смотрит лямбда — захвачена переменная, не снимок.', nodes: [{ id: "n", kind: "slot", at: { zone: "stack", row: 0 }, name: "n", value: "100", accent: true }, { id: "add", kind: "ref", at: { zone: "stack", row: 1 }, name: "add" }, { id: "cap", kind: "chip", at: { zone: "heap", row: 0 }, value: "→ n" }], edges: [{ id: "e", from: "add", to: "cap", accent: true }] },
        { codeLine: 3, out: "105", caption: 'При вызове лямбда читает <span class="hl">текущее</span> <code>n = 100</code> → <code>5 + 100 = 105</code>. Значение берётся в момент <b>вызова</b>, не создания.', nodes: [{ id: "n", kind: "slot", at: { zone: "stack", row: 0 }, name: "n", value: "100" }, { id: "add", kind: "ref", at: { zone: "stack", row: 1 }, name: "add", accent: true }, { id: "cap", kind: "chip", at: { zone: "heap", row: 0 }, value: "→ 100", accent: true }], edges: [{ id: "e", from: "add", to: "cap", accent: true }] },
      ],
      explain: 'Лямбда захватывает <b>переменную</b>, а не её значение. Дословно: «Lambdas can refer to <i>outer variables</i>. These <i>outer variables</i> are the variables that are in scope in the method that defines the lambda expression». Захват — по ссылке на ячейку: значение читается в момент <b>исполнения</b>, а не захвата (это прямое следствие захвата переменной, а не снимка значения). Поэтому изменение <code>n</code> после создания лямбды видно внутри: <code>add(5)</code> печатает <b>105</b>, а не 6.',
      sources: ["ms-lambda", "ms-delegates-lambdas"],
    },
    {
      id: "s2", num: "02", kicker: "Компилятор · display class", title: "Захваченная переменная уезжает в поле на куче",
      viewBox: "0 0 340 214", zones: MM_ZONES,
      code: ["int n = 1;", "Func<int,int> add = x => x + n;", "// компилятор: n → поле display-класса"],
      il: [
        { off: "// hoist", op: "newobj", arg: "<>c__DisplayClass0_0", cmt: "// closure на куче" },
        { off: "// field", op: "stfld", arg: "int32 …::n", cmt: "// n стало полем" },
        { off: "// deleg", op: "ldftn", arg: "<>b__0", cmt: "// метод лямбды" },
        { off: "// bind", op: "newobj", arg: "Func`2::.ctor", cmt: "// делегат → display" },
      ],
      scenes: [
        { codeLine: 1, ilLine: 0, caption: 'Есть захват → компилятор генерит <b>display-класс</b> (<code>&lt;&gt;c__DisplayClass</code>) и создаёт его экземпляр на <span class="hl">куче</span>.', nodes: [{ id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "DisplayClass", value: "", accent: true }], edges: [] },
        { codeLine: 1, ilLine: 1, caption: 'Локальная <code>n</code> <span class="hl">поднимается</span> (hoisting) и становится <b>полем</b> этого объекта — она больше не живёт просто на стеке.', nodes: [{ id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "DisplayClass", value: "", accent: true }, { id: "nf", kind: "slot", at: { in: "dc" }, name: "n", value: "1" }], edges: [] },
        { codeLine: 1, ilLine: 2, caption: 'Тело лямбды — <b>метод</b> display-класса (<code>&lt;&gt;b__0</code>); делегат <code>add</code> держит ссылку на объект и на этот метод.', nodes: [{ id: "add", kind: "ref", at: { zone: "stack", row: 0 }, name: "add", accent: true }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "DisplayClass", value: "b__0()" }, { id: "nf", kind: "slot", at: { in: "dc" }, name: "n", value: "1" }], edges: [{ id: "e", from: "add", to: "dc", accent: true }] },
      ],
      explain: 'Захват реализован не магией, а <b>подъёмом переменной в объект на куче</b>. Компилятор синтезирует <i>display class</i> (в IL — <code>&lt;&gt;c__DisplayClass…</code>): захваченная локальная <code>n</code> становится его <b>полем</b>, тело лямбды — методом этого класса, а делегат хранит ссылку на экземпляр. Комбинацию лямбды и захваченных ею переменных называют <b>замыканием</b>. Именно поэтому «the lambda expression stores them for use even if the variables go out of scope» — данные физически живут в объекте на управляемой куче, а не в стековом слоте.',
      sources: ["ms-lambda", "ms-gc"],
    },
    {
      id: "s3", num: "03", kicker: "Общая ячейка · несколько лямбд", title: "Две лямбды делят одну переменную",
      viewBox: "0 0 340 214", zones: MM_ZONES,
      code: ["int x = 1;", "Action  inc = () => x++;", "Func<int> get = () => x;", "inc(); inc(); Console.Write(get()); // 3"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Обе лямбды захватывают <b>ту же</b> <code>x</code> — компилятор кладёт их в <span class="hl">один</span> display-класс, <code>x</code> = общее поле.', nodes: [{ id: "inc", kind: "ref", at: { zone: "stack", row: 0 }, name: "inc" }, { id: "get", kind: "ref", at: { zone: "stack", row: 1 }, name: "get" }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "shared x", value: "1", accent: true }], edges: [{ id: "e1", from: "inc", to: "dc" }, { id: "e2", from: "get", to: "dc" }] },
        { codeLine: 3, out: "", caption: '<code>inc()</code> дважды меняет <span class="hl">общую ячейку</span> <code>x</code> → 3. Изменение видно всем, кто захватил <code>x</code>.', nodes: [{ id: "inc", kind: "ref", at: { zone: "stack", row: 0 }, name: "inc", accent: true }, { id: "get", kind: "ref", at: { zone: "stack", row: 1 }, name: "get" }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "shared x", value: "3", accent: true }], edges: [{ id: "e1", from: "inc", to: "dc", accent: true }, { id: "e2", from: "get", to: "dc" }] },
        { codeLine: 3, out: "3", caption: '<code>get()</code> читает ту же ячейку → печатает <b>3</b>. Разные лямбды — <span class="hl">одно</span> состояние.', nodes: [{ id: "inc", kind: "ref", at: { zone: "stack", row: 0 }, name: "inc" }, { id: "get", kind: "ref", at: { zone: "stack", row: 1 }, name: "get", accent: true }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "shared x", value: "3", accent: true }], edges: [{ id: "e1", from: "inc", to: "dc" }, { id: "e2", from: "get", to: "dc", accent: true }] },
      ],
      explain: 'Если несколько лямбд захватывают одну и ту же локальную переменную, они делят <b>одну ячейку</b> — тот же экземпляр display-класса. Пример из офдока показывает это буквально: «Another lambda observes a new value of captured variable» — обновление, сделанное через одну лямбду, видит другая. Поэтому замыкания — удобный носитель <b>изменяемого общего состояния</b>: <code>inc</code> и <code>get</code> работают с общим <code>x</code>, и после двух <code>inc()</code> печатается <b>3</b>. Реальный прогон подтверждает вывод <code>3</code>.',
      sources: ["ms-lambda"],
    },
    {
      id: "s4", num: "04", kicker: "Время жизни · переживает scope", title: "Захват продлевает жизнь переменной",
      viewBox: "0 0 340 210", zones: MM_ZONES,
      code: ["Func<int> Make() {", "  int seed = 42;   // локальная", "  return () => seed; // захват", "}"],
      scenes: [
        { codeLine: 1, caption: '<code>seed</code> — локальная в <code>Make</code>. Обычно после выхода из метода её слот на стеке исчезает.', nodes: [{ id: "seed", kind: "slot", at: { zone: "stack", row: 0 }, name: "seed", value: "42", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Лямбда <span class="hl">захватывает</span> <code>seed</code> → она уже поле display-класса на <b>куче</b>, а не стековый слот.', nodes: [{ id: "seed", kind: "slot", at: { zone: "stack", row: 0 }, name: "seed", value: "42", state: "" }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "DisplayClass", value: "seed=42", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>Make</code> вернулся, стек-кадр ушёл — но объект <span class="hl">жив</span>, пока жив делегат: «isn\'t garbage collected until the delegate… becomes eligible».', nodes: [{ id: "ret", kind: "chip", at: { zone: "stack", row: 0 }, value: "делегат", accent: true }, { id: "dc", kind: "obj", at: { zone: "heap", row: 0 }, typeTag: "DisplayClass", value: "seed=42", accent: true }], edges: [{ id: "e", from: "ret", to: "dc", accent: true }] },
      ],
      explain: 'Захват меняет <b>время жизни</b> переменной. Обычно локальная умирает с кадром стека; захваченная — нет: «If you capture variables in this way, the lambda expression stores them for use even if the variables go out of scope and would normally be garbage collected». Точный якорь на GC: «A variable that you capture isn\'t garbage collected until the delegate that references it becomes eligible for garbage collection». То есть display-класс на куче держит переменную живой ровно столько, сколько жив ссылающийся на него делегат — типичный источник «утечек» через долгоживущие обработчики событий.',
      sources: ["ms-lambda", "ms-gc"],
    },
    {
      id: "s5", num: "05", kicker: "Gotcha · захват переменной цикла", title: "for делит одну переменную, foreach — нет",
      viewBox: "0 0 340 214",
      zones: [
        { id: "for", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "for · одна i", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "общая ячейка", subCls: "vz-zsub", subY: 47 },
        { id: "foreach", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "foreach · своя n", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "по ячейке/итер.", subCls: "vz-zsub good", subY: 47 },
      ],
      code: ["var a = new List<Action>();", "for (int i=0;i<3;i++) a.Add(()=>Write(i));", "// → 333  (все делят одну i)"],
      predictAt: 1, predictQ: 'Три лямбды захватили <code>i</code> из <code>for</code> и вызваны ПОСЛЕ цикла. Что напечатает — 012 или 333?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<b>for</b>: единственная переменная <code>i</code> на весь цикл. Все три лямбды захватывают <span class="hl">одну и ту же</span> ячейку.', nodes: [{ id: "l0", kind: "ref", at: { zone: "for", row: 0 }, name: "λ0" }, { id: "l1", kind: "ref", at: { zone: "for", row: 1 }, name: "λ1" }, { id: "l2", kind: "ref", at: { zone: "for", row: 2 }, name: "λ2" }, { id: "i", kind: "chip", at: { zone: "foreach", row: 0 }, value: "i", accent: true }], edges: [{ id: "e0", from: "l0", to: "i" }, { id: "e1", from: "l1", to: "i" }, { id: "e2", from: "l2", to: "i", accent: true }] },
        { codeLine: 2, out: "333", caption: 'После цикла <code>i == 3</code>. Каждая лямбда читает <span class="hl">общую</span> ячейку → печатает <b>3</b> трижды: <code>333</code>. (Реальный прогон.)', nodes: [{ id: "l0", kind: "ref", at: { zone: "for", row: 0 }, name: "λ0" }, { id: "l1", kind: "ref", at: { zone: "for", row: 1 }, name: "λ1" }, { id: "l2", kind: "ref", at: { zone: "for", row: 2 }, name: "λ2" }, { id: "i", kind: "chip", at: { zone: "foreach", row: 0 }, value: "3", accent: true }], edges: [{ id: "e0", from: "l0", to: "i" }, { id: "e1", from: "l1", to: "i" }, { id: "e2", from: "l2", to: "i" }] },
        { codeLine: 2, out: "333", caption: '<b>foreach</b> (C# 5+) даёт <span class="hl">свежую</span> переменную на итерацию → <code>012</code>. Спека: «because each iteration has its own variable v… earlier versions of C# declared v outside».', nodes: [{ id: "n0", kind: "chip", at: { zone: "foreach", row: 0 }, value: "n=0", good: true }, { id: "n1", kind: "chip", at: { zone: "foreach", row: 1 }, value: "n=1", good: true }, { id: "n2", kind: "chip", at: { zone: "foreach", row: 2 }, value: "n=2", good: true, accent: true }, { id: "gate", kind: "gate", at: { zone: "for", row: 0 }, label: "for → 333", detail: "общая i = 3" }], edges: [] },
      ],
      explain: 'Классический gotcha: <code>for (int i…) list.Add(() =&gt; i)</code> печатает <b>333</b>, потому что все лямбды захватили <span class="hl">одну</span> переменную <code>i</code>, а после цикла в ней 3. Реальный прогон подтверждает <code>333</code>. С <code>foreach</code> — иначе: начиная с <b>C# 5</b> переменная цикла <b>своя на каждую итерацию</b>, поэтому вывод <code>012</code>. Спека фиксирует смену семантики: «because each iteration has its own variable <code>v</code>, the one captured by <code>f</code> in the first iteration will continue to hold the value… <i>(Note that earlier versions of C# declared <code>v</code> outside of the <code>while</code> loop.)</i>». Починка для <code>for</code>: завести <code>int copy = i;</code> и захватывать <code>copy</code>.',
      sources: ["cs-spec-foreach", "ms-lambda"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>var a=new List&lt;Action&gt;(); for(int i=0;i&lt;3;i++) a.Add(()=&gt;Console.Write(i)); foreach(var f in a) f();</code> — что напечатает?',
      options: ["333", "012", "000", "3"], correctIndex: 0, xp: 10,
      okText: 'Все три лямбды захватили <span class="hl">одну</span> переменную <code>i</code> (в <code>for</code> она одна на весь цикл). После цикла <code>i == 3</code>, поэтому каждая печатает <b>3</b> → <code>333</code>. С <code>foreach</code> было бы <code>012</code> (своя переменная на итерацию, C# 5+).',
      noText: 'Захватывается <b>переменная</b>, а не значение. В <code>for</code> переменная <code>i</code> <span class="hl">одна</span> на весь цикл; к моменту вызова лямбд <code>i == 3</code>, поэтому вывод — <code>333</code>, не <code>012</code>. Отдельная ячейка на итерацию — это <code>foreach</code> (C# 5+).',
      verify: { kind: "exec", run: "dotnet run", expect: "333" }, sourceRefs: ["ms-lambda", "cs-spec-foreach"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что захватывается", v: 'Захватывается <span class="hl">переменная</span> (ячейка), не значение: «Lambdas can refer to <i>outer variables</i>»; значение читается в момент <b>вызова</b>.' },
    { icon: "cost", k: "Как устроено", v: 'Компилятор поднимает захваченную переменную в <b>поле display-класса</b> на куче; несколько лямбд делят одну ячейку; переменная <b>переживает</b> свой scope, пока жив делегат.' },
    { icon: "avoid", k: "Gotcha цикла", v: '<code>for</code> делит одну <code>i</code> → <code>333</code>; <code>foreach</code> (C# 5+) даёт ячейку на итерацию → <code>012</code>. В <code>for</code> копируй: <code>int c = i;</code>. Не нужен захват — <code>static</code>-лямбда.' },
  ],

  foot: 'урок · <b>замыкания и захват</b> · 5 анимир. разборов + IL · display class · gotcha цикла · дизайн <b>mid</b>',
};
