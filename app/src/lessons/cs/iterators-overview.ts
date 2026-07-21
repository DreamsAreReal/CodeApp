/**
 * Lesson: Iterators & deferred execution (CS.S18.iterators-overview) — expert density,
 * 5 animated deep-dives. An iterator method (a method with `yield return`) is LAZY: calling
 * it does NOT run its body — you get an object; the body starts only when you begin iterating,
 * runs up to the first `yield return`, suspends, hands the value back, and resumes AFTER that
 * `yield return` on the next step. `foreach`/`await foreach` sit on top of
 * IEnumerable<T>/IEnumerator<T> (sync) and IAsyncEnumerable<T> (async).
 *
 * SIGNATURE machine panel (s5): the deferred-execution counter — create N iterator objects,
 * count how many BODIES actually ran (0), then step one MoveNext and watch the body start.
 * REAL run-csharp measurement (evidence: "created 2 iterators, bodies run: 0").
 *
 * Accuracy contract (G4/G7/G8) — every English quote is VERBATIM from the two source pages
 * (fetch-verified 2026-07-21):
 *   - S1 https://learn.microsoft.com/en-us/dotnet/csharp/iterators
 *   - S2 https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield
 *   card verify.expect is the REAL stdout of run-csharp (this file's exec log):
 *     c1 "Caller: got the object, nothing ran yet.\nIterator: start.\nCaller: 1\nIterator: after 1";
 *     c2 "created 2 iterators, bodies run: 0"; c3 "10 20 30".
 *   NO GT-M6 iterator myths: MИ-1 (iterator runs immediately) refuted by s2/c1; MИ-2 (buffers
 *   the whole sequence first) refuted by s3.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S18.iterators-overview/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: iterator method → produces an iterator object (lazy source).
const Z_METHOD: Zone = { id: "method", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "iterator-метод · yield return", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "определяет КАК генерировать", subCls: "vz-zsub good", subY: 47 };
const Z_OBJ: Zone = { id: "iobj", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "iterator · объект обхода", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "по запросу, элемент за элементом", subCls: "vz-zsub", subY: 47 };
const SRC_ZONES: Zone[] = [Z_METHOD, Z_OBJ];

// s2: lazy execution — call vs first iteration.
const Z_CALL: Zone = { id: "call", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "вызов Produce()", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "тело НЕ исполняется", subCls: "vz-zsub", subY: 47 };
const Z_ITER: Zone = { id: "iter", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "начало обхода · foreach", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "тело стартует до 1-го yield", subCls: "vz-zsub good", subY: 47 };
const LAZY_ZONES: Zone[] = [Z_CALL, Z_ITER];

// s3: suspend/resume timeline across yields.
const Z_FLOW: Zone = { id: "flow", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "исполнение итератора · пауза/возобновление", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "тело → yield → пауза → resume после yield", subCls: "vz-zsub good", subY: 47 };
const FLOW_ZONES: Zone[] = [Z_FLOW];

// s4: foreach / await foreach over the two interface families.
const Z_SYNC: Zone = { id: "sync", x: 8, y: 34, w: 156, h: 168, cls: "vz-zone", label: "foreach", labelCls: "vz-zlabel sm", lx: 86, ly: 24, sub: "IEnumerable<T> / IEnumerator<T>", subCls: "vz-zsub", subY: 47 };
const Z_ASYNC: Zone = { id: "async", x: 172, y: 34, w: 168, h: 168, cls: "vz-zone good", label: "await foreach", labelCls: "vz-zlabel good sm", lx: 256, ly: 24, sub: "IAsyncEnumerable<T>", subCls: "vz-zsub good", subY: 47 };
const FOREACH_ZONES: Zone[] = [Z_SYNC, Z_ASYNC];

// s5 (SIGNATURE): the deferred-execution counter panel.
const Z_CREATED: Zone = { id: "created", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "создано итераторов", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "var a = Nums(); var b = Nums();", subCls: "vz-zsub", subY: 47 };
const Z_RAN: Zone = { id: "ran", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "тел исполнено", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "счётчик calls внутри тела", subCls: "vz-zsub good", subY: 47 };
const COUNTER_ZONES: Zone[] = [Z_CREATED, Z_RAN];

export const iteratorsOverview: LessonData = {
  id: "CS.S18.iterators-overview",
  track: "CS",
  section: "CS.S18",
  module: "S18.1",
  lang: "csharp",
  title: "Итераторы и ленивое исполнение",
  kicker: "C# вглубь · S18 · вызов ≠ исполнение",
  home: { subtitle: "yield return, ленивость, foreach/await foreach", icon: "async", estMinutes: 10 },
  prereqs: [],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-iterators", kind: "doc", org: "Microsoft Learn", title: "Iterators (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/iterators", date: "2026-03-30" },
    { id: "ms-yield", kind: "doc", org: "Microsoft Learn", title: "yield statement (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield", date: "2026-03-30" },
  ],

  spec: [
    { text: "«An iterator method defines how to generate the objects in a sequence when requested. You use the yield return contextual keywords to define an iterator method.»", source: "ms-iterators" },
  ],
  edgeCases: [
    { text: 'Вызов итератор-метода возвращает <b>объект</b> и <span class="hl">не исполняет тело</span>: «Calling an iterator doesn\'t execute it immediately». Тело стартует при начале обхода.', source: "ms-yield" },
    { text: '<code>foreach</code> опирается на <code>IEnumerable&lt;T&gt;</code>/<code>IEnumerator&lt;T&gt;</code>; для async-последовательности — <code>await foreach</code> над <code>IAsyncEnumerable&lt;T&gt;</code>.', source: "ms-iterators" },
    { text: 'В одном методе <span class="hl">нельзя</span> смешивать <code>return</code> и <code>yield return</code>: «you can\'t have both a return statement and a yield return statement in the same method». Обход — разбить на два метода.', source: "ms-iterators" },
  ],

  misconceptions: [
    {
      wrong: "yield-метод исполняется сразу при вызове; итератор буферизует всю последовательность до первого элемента",
      hook: 'Две ходовые ошибки про итераторы. «<span class="wrong">исполняется сразу при вызове</span>» — нет: <code>var seq = Produce()</code> лишь <b>создаёт объект</b>, тело не бежит. Дословно: «Calling an iterator doesn\'t execute it immediately». Тело стартует только когда ты <span class="hl">начинаешь обход</span> — исполняется до первого <code>yield return</code>, приостанавливается, отдаёт значение. «<span class="wrong">буферизует всю последовательность</span>» — нет: элементы отдаются <b>по одному</b>, с паузой на каждом <code>yield return</code>; на следующем шаге тело возобновляется ПОСЛЕ него. Ниже <b>пять разборов</b>: итератор как объект, ленивость (замер порядка вывода), пауза/возобновление, <code>foreach</code>/<code>await foreach</code>, и <b>машинная панель</b> — счётчик «создано итераторов vs тел исполнено» (2 vs 0).',
      source: "ms-yield",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Итератор · источник по запросу", title: "yield return определяет, КАК генерировать последовательность",
      viewBox: "0 0 340 210", zones: SRC_ZONES,
      code: ["IEnumerable<int> GetSingleDigits(){", "  for (int i = 0; i < 10; i++) yield return i;", "}   // это iterator-метод: у него есть yield return"],
      scenes: [
        { codeLine: 0, caption: '<b>iterator-метод</b> — обычный метод, но в теле есть <code>yield return</code>. Он не собирает список, а <span class="hl">описывает</span>, как порождать элементы.', nodes: [{ id: "m", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "GetSingleDigits()", detail: "yield return i", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Вызов метода даёт <b>iterator</b> — объект обхода. «An iterator is an object that traverses a container, particularly lists».', nodes: [{ id: "m", kind: "gate", at: { zone: "method", row: 0 }, state: "ok", label: "GetSingleDigits()", detail: "iterator-метод" }, { id: "o", kind: "obj", at: { zone: "iobj", row: 0 }, typeTag: "IEnumerable<int>", value: "объект обхода", accent: true }], edges: [{ id: "e1", from: "m", to: "o" }] },
        { codeLine: 2, caption: 'Элементы генерируются <span class="hl">по запросу</span>, элемент за элементом — не разом. Это делает итератор ленивым (разбор 02).', nodes: [{ id: "o", kind: "obj", at: { zone: "iobj", row: 0 }, typeTag: "IEnumerable<int>", value: "ленивый" }, { id: "seq", kind: "chip", at: { zone: "iobj", row: 1 }, value: "0,1,2,… по одному", accent: true }], edges: [] },
      ],
      explain: 'Итератор-метод — способ построить источник последовательности, не материализуя её. «An iterator method defines how to generate the objects in a sequence when requested. You use the <code>yield return</code> contextual keywords to define an iterator method». Сам итератор — «An iterator is an object that traverses a container, particularly lists». Ключевая идея: метод с <code>yield return</code> возвращает не готовый список, а <b>объект</b>, который умеет отдавать элементы по одному по запросу. Как именно «по запросу» работает механически — следующие разборы: ленивость (02), пауза/возобновление (03) и машинная панель (05).',
      sources: ["ms-iterators", "ms-yield"],
    },
    {
      id: "s2", num: "02", kicker: "Ленивость · вызов ≠ исполнение", title: "Вызов возвращает объект; тело стартует только при обходе",
      viewBox: "0 0 340 210", zones: LAZY_ZONES,
      code: ["IEnumerable<int> Produce(){ Console.WriteLine(\"Iterator: start.\"); yield return 1; ... }", "var seq = Produce();                       // тело НЕ бежит", "Console.WriteLine(\"Caller: got the object, nothing ran yet.\");", "foreach (var i in seq) Console.WriteLine($\"Caller: {i}\");  // ТЕПЕРЬ бежит"],
      predictAt: 2, predictQ: 'Тело <code>Produce()</code> печатает «Iterator: start.». Что напечатается ПЕРВЫМ — эта строка или «Caller: got the object…»?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>var seq = Produce()</code>: получили <b>объект</b>. Тело метода <span class="hl">не исполнялось</span> — «Iterator: start.» ещё не напечатано.', nodes: [{ id: "c", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "seq = Produce()", detail: "объект, тело спит", accent: true }], edges: [] },
        { codeLine: 2, out: "Caller: got the object, nothing ran yet.", caption: 'Печатается строка вызывающего <span class="hl">раньше</span> тела итератора — доказательство, что тело ещё не бежало.', nodes: [{ id: "c", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "seq = Produce()", detail: "тело спит" }, { id: "p", kind: "chip", at: { zone: "call", row: 1 }, value: "Caller печатает первым", accent: true }], edges: [] },
        { codeLine: 3, out: "Iterator: start.\nCaller: 1", caption: '<code>foreach</code> начинает обход — <span class="hl">теперь</span> тело исполняется до первого <code>yield return</code>: печать «Iterator: start.», затем отдаётся 1.', nodes: [{ id: "c", kind: "gate", at: { zone: "call", row: 0 }, state: "ok", label: "seq = Produce()", detail: "объект" }, { id: "i", kind: "gate", at: { zone: "iter", row: 0 }, state: "ok", label: "foreach", detail: "тело стартовало", accent: true }], edges: [{ id: "e1", from: "c", to: "i" }] },
      ],
      explain: 'Центральный факт S18.1 — <b>ленивость</b>: «Calling an iterator doesn\'t execute it immediately». Строка <code>var seq = Produce()</code> лишь создаёт объект-итератор; тело метода не запускается. Реальный порядок вывода это доказывает: «Caller: got the object, nothing ran yet.» печатается <b>раньше</b> «Iterator: start.» из тела. Дальше: «when you start to iterate over an iterator\'s result, the iterator executes until the first <code>yield return</code> statement is reached. Then, the execution of the iterator is suspended and the caller gets the first iteration value». То есть тело оживает только на <code>foreach</code> и работает до первого <code>yield</code>. Практический смысл — можно строить конвейеры LINQ, где ничего не считается, пока не пошёл обход.',
      sources: ["ms-yield"],
    },
    {
      id: "s3", num: "03", kicker: "Пауза / возобновление", title: "yield return приостанавливает; следующий шаг возобновляет ПОСЛЕ него",
      viewBox: "0 0 340 210", zones: FLOW_ZONES,
      code: ["IEnumerable<int> Nums(){ Console.WriteLine(\"A\"); yield return 1; Console.WriteLine(\"B\"); yield return 2; }", "// шаг 1: тело → A → yield 1 (пауза)   шаг 2: resume → B → yield 2 (пауза)"],
      scenes: [
        { codeLine: 0, caption: 'Шаг 1 обхода: тело идёт до <span class="hl">первого</span> <code>yield return 1</code>, печатает «A», <b>приостанавливается</b> и отдаёт 1.', nodes: [{ id: "a", kind: "chip", at: { zone: "flow", row: 0, col: 0 }, value: "тело: печать A" }, { id: "y1", kind: "gate", at: { zone: "flow", row: 0, col: 1 }, state: "ok", label: "yield return 1", detail: "пауза, отдал 1", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Шаг 2: тело <span class="hl">возобновляется ПОСЛЕ</span> <code>yield return 1</code> — печатает «B», идёт до <code>yield return 2</code>, снова пауза.', nodes: [{ id: "y1", kind: "gate", at: { zone: "flow", row: 0, col: 0 }, state: "ok", label: "resume после yield 1", detail: "печать B" }, { id: "y2", kind: "gate", at: { zone: "flow", row: 0, col: 1 }, state: "ok", label: "yield return 2", detail: "пауза, отдал 2", accent: true }], edges: [{ id: "e1", from: "y1", to: "y2" }] },
        { codeLine: 1, caption: 'Конец тела → итерация завершена. «The iteration completes when control reaches the end of an iterator or a <code>yield break</code> statement».', nodes: [{ id: "y2", kind: "gate", at: { zone: "flow", row: 0, col: 0 }, state: "ok", label: "yield return 2", detail: "отдал 2" }, { id: "end", kind: "gate", at: { zone: "flow", row: 0, col: 1 }, state: "fail", label: "конец тела", detail: "MoveNext → false", accent: true }], edges: [{ id: "e2", from: "y2", to: "end" }] },
      ],
      explain: 'Механизм отдачи — <b>пауза на каждом</b> <code>yield return</code>, а не буферизация. «the iterator executes until the first <code>yield return</code> statement is reached. Then, the execution of the iterator is suspended... On each subsequent iteration, the execution of the iterator resumes <b>after</b> the <code>yield return</code> statement that caused the previous suspension and continues until the next <code>yield return</code> statement is reached». Поэтому элементы приходят по одному: печать «A» → отдать 1 → (пауза) → печать «B» → отдать 2. «The iteration completes when control reaches the end of an iterator or a <code>yield break</code> statement». Это опровергает миф «буферизует всё сразу»: между двумя элементами тело реально останавливается и ждёт следующего запроса.',
      sources: ["ms-yield"],
    },
    {
      id: "s4", num: "04", kicker: "foreach / await foreach", title: "Две пары интерфейсов: sync и async",
      viewBox: "0 0 340 210", zones: FOREACH_ZONES,
      code: ["foreach (var x in seq)          // seq : IEnumerable<T>", "await foreach (var x in aseq)   // aseq : IAsyncEnumerable<T>", "// foreach опирается на IEnumerable<T> + IEnumerator<T>"],
      scenes: [
        { codeLine: 0, caption: 'Синхронный обход — <code>foreach</code> над <span class="hl"><code>IEnumerable&lt;T&gt;</code></span>. «It relies on two generic interfaces… <code>IEnumerable&lt;T&gt;</code> and <code>IEnumerator&lt;T&gt;</code>».', nodes: [{ id: "f", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "foreach", detail: "IEnumerable<T>", accent: true, w: 120 }, { id: "en", kind: "chip", at: { zone: "sync", row: 1 }, value: "IEnumerator<T>", w: 120 }], edges: [] },
        { codeLine: 1, caption: 'Асинхронный обход — <code>await foreach</code> над <span class="hl"><code>IAsyncEnumerable&lt;T&gt;</code></span>: элементы добываются асинхронно.', nodes: [{ id: "f", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "foreach", detail: "IEnumerable<T>", w: 120 }, { id: "af", kind: "gate", at: { zone: "async", row: 0 }, state: "ok", label: "await foreach", detail: "IAsyncEnumerable<T>", accent: true, w: 144 }], edges: [] },
        { codeLine: 2, caption: 'Выбор по типу последовательности: «When a sequence is an …<code>IEnumerable&lt;T&gt;</code>, you use <code>foreach</code>. When a sequence is an …<code>IAsyncEnumerable&lt;T&gt;</code>, you use <code>await foreach</code>» (в доке — с квалификатором <code>System.Collections.Generic.</code>).', nodes: [{ id: "f", kind: "gate", at: { zone: "sync", row: 0 }, state: "ok", label: "IEnumerable<T>", detail: "→ foreach", w: 120 }, { id: "af", kind: "gate", at: { zone: "async", row: 0 }, state: "ok", label: "IAsyncEnumerable<T>", detail: "→ await foreach", accent: true, w: 144 }], edges: [] },
      ],
      explain: 'Обход стоит на двух парах интерфейсов. Синхронный <code>foreach</code>: «It relies on two generic interfaces defined in the .NET core library to generate the code necessary to iterate a collection: <code>IEnumerable&lt;T&gt;</code> and <code>IEnumerator&lt;T&gt;</code>». Асинхронный — <code>await foreach</code> над <code>IAsyncEnumerable&lt;T&gt;</code>. Правило выбора дословно: «When a sequence is an <code>System.Collections.Generic.IEnumerable&lt;T&gt;</code>, you use <code>foreach</code>. When a sequence is an <code>System.Collections.Generic.IAsyncEnumerable&lt;T&gt;</code>, you use <code>await foreach</code>». А любой синхронный итератор имеет async-двойник: «All of these preceding examples would have an asynchronous counterpart. In each case, you\'d replace the return type of <code>IEnumerable&lt;T&gt;</code> with an <code>IAsyncEnumerable&lt;T&gt;</code>» — это тема S18.4. Как <code>foreach</code> разворачивается в <code>GetEnumerator</code>/<code>MoveNext</code>/<code>Current</code> — машинная тема S18.3.',
      sources: ["ms-iterators"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Счётчик: 2 итератора создано, 0 тел исполнено",
      viewBox: "0 0 340 214", zones: COUNTER_ZONES,
      code: ["int calls = 0;", "IEnumerable<int> Nums(){ calls++; yield return 1; yield return 2; }", "var a = Nums();  var b = Nums();          // создали 2 объекта", "Console.WriteLine($\"created 2 iterators, bodies run: {calls}\");"],
      predictAt: 2, predictQ: 'Тело <code>Nums()</code> инкрементит <code>calls</code>. Создали 2 итератора, ещё НЕ обходили. Чему равен <code>calls</code>?', console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Создаём <b>два</b> итератора: <code>var a = Nums(); var b = Nums();</code>. Каждый вызов вернул объект.', nodes: [{ id: "a", kind: "obj", at: { zone: "created", row: 0 }, typeTag: "a = Nums()", value: "объект" }, { id: "b", kind: "obj", at: { zone: "created", row: 1 }, typeTag: "b = Nums()", value: "объект", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Счётчик <code>calls</code> внутри тела ещё <span class="hl">нетронут</span>: ни одно тело не запускалось при вызове.', nodes: [{ id: "a", kind: "obj", at: { zone: "created", row: 0 }, typeTag: "созданы", value: "2 объекта" }, { id: "r", kind: "gate", at: { zone: "ran", row: 0 }, state: "ok", label: "calls", detail: "0", accent: true }], edges: [] },
        { codeLine: 3, out: "created 2 iterators, bodies run: 0", caption: 'Печать: <b>created 2 iterators, bodies run: 0</b> (реальный прогон). Два объекта — ноль исполненных тел: вызов ≠ исполнение.', nodes: [{ id: "cnt", kind: "gate", at: { zone: "created", row: 0 }, state: "ok", label: "создано", detail: "2 итератора" }, { id: "r", kind: "gate", at: { zone: "ran", row: 0 }, state: "ok", label: "bodies run", detail: "0", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — реально снятое число, а не легенда. Счётчик <code>calls</code> сидит <b>внутри</b> тела итератора (первой строкой). Создаём два итератора и печатаем счётчик <b>до</b> любого обхода — вывод: <code>created 2 iterators, bodies run: 0</code> (собственный прогон run-csharp). Ноль исполненных тел при двух созданных объектах — это и есть «Calling an iterator doesn\'t execute it immediately», выраженное числом. Тело оживёт только на первом <code>MoveNext</code> (который прячется за <code>foreach</code>) — механику стейт-машины, что это отслеживает, разбираем в S18.3.',
      sources: ["ms-yield"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Produce(){ Console.WriteLine("Iterator: start."); yield return 1; Console.WriteLine("Iterator: after 1"); } var seq = Produce(); Console.WriteLine("Caller: got the object, nothing ran yet."); foreach (var i in seq) Console.WriteLine($"Caller: {i}");</code> — что напечатает (по строкам)?',
      options: ["Caller: got the object, nothing ran yet.\\nIterator: start.\\nCaller: 1\\nIterator: after 1", "Iterator: start.\\nCaller: got the object, nothing ran yet.\\nCaller: 1\\nIterator: after 1", "Caller: got the object, nothing ran yet.\\nCaller: 1", "Iterator: start.\\nIterator: after 1\\nCaller: got the object, nothing ran yet.\\nCaller: 1"], correctIndex: 0, xp: 10,
      okText: 'Итератор <span class="hl">ленив</span>: <code>var seq = Produce()</code> не запускает тело, поэтому «Caller: got the object…» печатается ПЕРВЫМ. Тело оживает на <code>foreach</code>. «Calling an iterator doesn\'t execute it immediately».',
      noText: 'Вызов итератора возвращает объект и не исполняет тело — строка вызывающего печатается раньше «Iterator: start.». Реальный вывод: сначала «Caller: got the object, nothing ran yet.», затем «Iterator: start.», «Caller: 1», «Iterator: after 1».',
      verify: { kind: "exec", run: "dotnet run", expect: "Caller: got the object, nothing ran yet.\nIterator: start.\nCaller: 1\nIterator: after 1" }, sourceRefs: ["ms-yield"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int calls=0; IEnumerable&lt;int&gt; Nums(){ calls++; yield return 1; yield return 2; } var a = Nums(); var b = Nums(); Console.WriteLine($"created 2 iterators, bodies run: {calls}");</code> — что напечатает?',
      options: ["created 2 iterators, bodies run: 0", "created 2 iterators, bodies run: 2", "created 2 iterators, bodies run: 1", "created 2 iterators, bodies run: 4"], correctIndex: 0, xp: 10,
      okText: 'Счётчик стоит в теле, а тело <span class="hl">не бежит</span> при вызове: два созданных итератора — ноль исполненных тел. Печать: <b>created 2 iterators, bodies run: 0</b>. Вызов ≠ исполнение.',
      noText: 'Итератор-метод при вызове только создаёт объект — <code>calls++</code> внутри тела не выполняется. Реальный вывод: <b>created 2 iterators, bodies run: 0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "created 2 iterators, bodies run: 0" }, sourceRefs: ["ms-yield"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Nums(){ yield return 10; yield return 20; yield return 30; } var e = Nums().GetEnumerator(); var sb = new StringBuilder(); while (e.MoveNext()) sb.Append(e.Current).Append(" "); Console.WriteLine(sb.ToString().Trim());</code> — что напечатает?',
      options: ["10 20 30", "30 20 10", "10", "(пусто)"], correctIndex: 0, xp: 10,
      okText: '<code>foreach</code> разворачивается в это: <code>GetEnumerator()</code>, затем <code>while(MoveNext()){ Current }</code>. Каждый <code>MoveNext</code> возобновляет тело до следующего <code>yield return</code>. Печать: <b>10 20 30</b>.',
      noText: 'Ручной обход <code>MoveNext</code>/<code>Current</code> — это то, во что компилятор превращает <code>foreach</code>. Реальный вывод: <b>10 20 30</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "10 20 30" }, sourceRefs: ["ms-iterators"],
    },
  ],

  takeaways: [
    { icon: "why", k: "вызов ≠ исполнение", v: 'Метод с <code>yield return</code> при вызове возвращает <span class="hl">объект</span> и не исполняет тело: «Calling an iterator doesn\'t execute it immediately». Тело стартует при начале обхода (замер: 2 итератора, 0 тел исполнено).' },
    { icon: "cost", k: "пауза / возобновление", v: 'Тело идёт до <code>yield return</code>, <b>приостанавливается</b>, отдаёт значение; следующий шаг возобновляет ПОСЛЕ него. Элементы отдаются по одному — не буфер (миф). Конец тела / <code>yield break</code> завершают.' },
    { icon: "avoid", k: "foreach / await foreach", v: '<code>foreach</code> над <code>IEnumerable&lt;T&gt;</code>/<code>IEnumerator&lt;T&gt;</code>; <code>await foreach</code> над <code>IAsyncEnumerable&lt;T&gt;</code>. Разворот <code>foreach</code> → <code>GetEnumerator</code>/<code>MoveNext</code>/<code>Current</code> — тема S18.3.' },
  ],

  foot: 'урок · <b>итераторы и ленивость</b> · 5 анимир. разборов · панель-счётчик 2 vs 0 (вызов ≠ исполнение) · дизайн <b>mid</b>',
};
