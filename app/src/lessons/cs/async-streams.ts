/**
 * Lesson: Async streams — IAsyncEnumerable<T>, await foreach, cancellation (CS.S2.async-streams) —
 * expert density, 5 animated deep-dives. An async stream is a method with THREE marks: async +
 * yield return + returns IAsyncEnumerable<T>; it is consumed with `await foreach`. It is LAZY /
 * on-demand — elements are produced as they become ready, not buffered whole, so you can even read
 * never-ending streams (something Task<IEnumerable<T>> cannot). Cancellation flows via
 * [EnumeratorCancellation] + WithCancellation.
 *
 * SIGNATURE machine panel (s5): `await foreach` desugars into GetAsyncEnumerator() +
 * while(await e.MoveNextAsync()) + await e.DisposeAsync() in finally; MoveNextAsync() returns
 * ValueTask<bool> (the S2.5 hot-path value type) and the enumerator is IAsyncDisposable. A real
 * reflection measurement (moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True).
 * evidence/F11/async-streams-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against the generate-consume-async-stream tutorial +
 * await operator ref (fetch 2026-07-18) + GT-M4-s2.md S2.9 (str:F9..F16):
 *   - card verify.expect is the REAL stdout of run-csharp (evidence/F11/async-streams-exec.txt:
 *     "1 4 9"; "moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True"; "took=3 vals=012");
 *   - NO GT-M4 myths: M-stream-13 (an async stream buffers the whole sequence) — no, lazy/on-demand,
 *     you can break out of an infinite one; M-stream-14 (await foreach == sync foreach over Tasks /
 *     needs Task<IEnumerable>) — no, it desugars to MoveNextAsync/DisposeAsync.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.async-streams/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the three marks of an async stream.
const Z_MARKS: Zone = { id: "marks", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "async-стрим · три признака", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "async + yield return + IAsyncEnumerable<T>", subCls: "vz-zsub good", subY: 47 };
const MARKS_ZONES: Zone[] = [Z_MARKS];

// s2: await foreach consumption.
const Z_PROD: Zone = { id: "prod", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "производитель · yield return", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "async IAsyncEnumerable<int>", subCls: "vz-zsub good", subY: 47 };
const Z_CONS: Zone = { id: "cons", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "потребитель · await foreach", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "элемент за элементом", subCls: "vz-zsub good", subY: 47 };
const FOREACH_ZONES: Zone[] = [Z_PROD, Z_CONS];

// s3: lazy / on-demand vs Task<IEnumerable>.
const Z_LAZY: Zone = { id: "lazy", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "async-стрим · лениво", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "по мере готовности · можно break", subCls: "vz-zsub good", subY: 47 };
const Z_WHOLE: Zone = { id: "whole", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Task<IEnumerable<T>>", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "ждёт ВСЮ коллекцию", subCls: "vz-zsub heap", subY: 47 };
const LAZY_ZONES: Zone[] = [Z_LAZY, Z_WHOLE];

// s4: cancellation of a stream.
const Z_ATTR: Zone = { id: "attr", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "[EnumeratorCancellation]", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "на параметре генератора", subCls: "vz-zsub good", subY: 47 };
const Z_WITH: Zone = { id: "with", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: ".WithCancellation(token)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "при потреблении", subCls: "vz-zsub good", subY: 47 };
const CANCEL_ZONES: Zone[] = [Z_ATTR, Z_WITH];

// s5 (SIGNATURE): await foreach desugaring.
const Z_DESUGAR: Zone = { id: "desugar", x: 14, y: 32, w: 312, h: 176, cls: "vz-zone good", label: "await foreach · десугаринг", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "GetAsyncEnumerator → while(await MoveNextAsync) → DisposeAsync", subCls: "vz-zsub good", subY: 45 };
const SIG_ZONES: Zone[] = [Z_DESUGAR];

export const asyncStreams: LessonData = {
  id: "CS.S2.async-streams",
  track: "CS",
  section: "CS.S2",
  module: "S2.9",
  lang: "csharp",
  title: "Async streams: IAsyncEnumerable, await foreach",
  kicker: "C# вглубь · S2 · поток по требованию",
  home: { subtitle: "async yield return, await foreach, лениво, WithCancellation", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.valuetask"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-stream", kind: "doc", org: "Microsoft Learn", title: "Generate and consume async streams (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream", date: "2023-02-14" },
    { id: "ms-await", kind: "doc", org: "Microsoft Learn", title: "await operator (await foreach / using)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await", date: "2024-11-11" },
  ],

  spec: [
    { text: "Async-стрим — метод с тремя признаками: модификатор async, тело содержит yield return, возвращаемый тип IAsyncEnumerable<T>; потребляется через await foreach.", source: "ms-stream" },
  ],
  edgeCases: [
    { text: 'Три интерфейса (аналоги синхронных): <code>IAsyncEnumerable&lt;T&gt;</code>, <code>IAsyncEnumerator&lt;T&gt;</code>, <code>IAsyncDisposable</code> — добавлены в .NET Standard 2.1 (реализованы в .NET Core 3.0). <code>IAsyncEnumerator&lt;T&gt;</code> наследует <code>IAsyncDisposable</code>; <code>MoveNextAsync()</code> возвращает <code>ValueTask&lt;bool&gt;</code> — value type ради перфа (S2.5).', source: "ms-stream" },
    { text: 'Отмена стрима: <code>[EnumeratorCancellation]</code> на параметре <code>CancellationToken</code> генератора + <code>WithCancellation(token)</code> при потреблении: <code>await foreach (var x in src.WithCancellation(t))</code>. Атрибут делает токен из <code>GetAsyncEnumerator</code> видимым телу итератора.', source: "ms-stream" },
    { text: '<code>ConfigureAwait</code> для стрима — это НЕ <code>Task.ConfigureAwait</code>: по умолчанию элементы обрабатываются в захваченном контексте, отключается расширением <code>TaskAsyncEnumerableExtensions.ConfigureAwait</code> НАД <code>IAsyncEnumerable&lt;T&gt;</code> (не над задачей).', source: "ms-await" },
  ],

  misconceptions: [
    {
      wrong: "async-стрим буферизует всю последовательность; await foreach — это синхронный foreach над Task-ами / нужен Task<IEnumerable>",
      hook: 'Две ошибки о стримах. «<span class="wrong">буферизует всю последовательность</span>» — нет: async-стрим <span class="hl">ленив</span>, отдаёт элементы по мере готовности; можно читать даже <b>бесконечные</b> потоки и <code>break</code> в любой момент (замер: took=3 из бесконечного). «<span class="wrong">await foreach = foreach над Task-ами</span>» — нет: <code>await foreach</code> <b>десугарится</b> в <code>GetAsyncEnumerator()</code> + <code>while(await MoveNextAsync())</code> + <code>await DisposeAsync()</code>; это не <code>Task&lt;IEnumerable&lt;T&gt;&gt;</code> (тот ждёт ВСЮ коллекцию). Ниже <b>пять разборов</b>: три признака, <code>await foreach</code>, ленивость vs <code>Task&lt;IEnumerable&gt;</code>, отмена стрима, и <b>машинная панель</b> — во что разворачивается <code>await foreach</code>.',
      source: "ms-stream",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Три признака", title: "async + yield return + IAsyncEnumerable<T>",
      viewBox: "0 0 340 210", zones: MARKS_ZONES,
      code: ["async IAsyncEnumerable<int> Nums()   // 1) async  3) возврат IAsyncEnumerable<T>", "{ for (int i=1; i<=3; i++){ await Task.Delay(1); yield return i*i; } }  // 2) yield return", "// потребляется через await foreach (разбор 02)"],
      scenes: [
        { codeLine: 0, caption: 'Признак 1 — модификатор <code>async</code>; признак 3 — возвращаемый тип <span class="hl"><code>IAsyncEnumerable&lt;T&gt;</code></span>.', nodes: [{ id: "a", kind: "chip", at: { zone: "marks", row: 0, col: 0 }, value: "async", accent: true }, { id: "r", kind: "chip", at: { zone: "marks", row: 0, col: 1 }, value: "IAsyncEnumerable<T>" }], edges: [] },
        { codeLine: 1, caption: 'Признак 2 — в теле <span class="hl"><code>yield return</code></span> (это делает метод итератором) и <code>await</code> внутри (это делает его async).', nodes: [{ id: "a", kind: "chip", at: { zone: "marks", row: 0, col: 0 }, value: "async" }, { id: "r", kind: "chip", at: { zone: "marks", row: 0, col: 1 }, value: "IAsyncEnumerable<T>" }, { id: "y", kind: "chip", at: { zone: "marks", row: 1, col: 0 }, value: "yield return", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Все три вместе → <b>async-стрим</b>: асинхронно порождает последовательность. Потребитель — <code>await foreach</code>.', nodes: [{ id: "a", kind: "chip", at: { zone: "marks", row: 0, col: 0 }, value: "async" }, { id: "r", kind: "chip", at: { zone: "marks", row: 0, col: 1 }, value: "IAsyncEnumerable<T>" }, { id: "y", kind: "chip", at: { zone: "marks", row: 1, col: 0 }, value: "yield return" }, { id: "s", kind: "chip", at: { zone: "marks", row: 1, col: 1 }, value: "= async-стрим", accent: true }], edges: [] },
      ],
      explain: 'Async-стрим (GT str:F9): метод с <b>тремя</b> признаками одновременно — (1) модификатор <code>async</code>; (2) тело содержит <code>yield return</code> (порождает элементы по одному, как обычный итератор); (3) возвращаемый тип <code>IAsyncEnumerable&lt;T&gt;</code>. Сигнатура: <code>async IAsyncEnumerable&lt;T&gt; ...</code>. Это гибрид итератора (<code>yield</code>) и async-метода (<code>await</code>): последовательность, элементы которой добываются <b>асинхронно</b> (например, страницами из сети). Обычный <code>IEnumerable&lt;T&gt;</code> так не может — в нём нет <code>await</code>; <code>Task&lt;IEnumerable&lt;T&gt;&gt;</code> тоже не то — он отдаёт всю коллекцию разом (разбор 03). Потребляется async-стрим через <code>await foreach</code> (разбор 02).',
      sources: ["ms-stream"],
    },
    {
      id: "s2", num: "02", kicker: "await foreach", title: "Потребление: элемент за элементом через await foreach",
      viewBox: "0 0 340 210", zones: FOREACH_ZONES,
      code: ["async IAsyncEnumerable<int> Nums(){ for(int i=1;i<=3;i++){ await Task.Delay(1); yield return i*i; } }", "await foreach (var n in Nums()) Console.Write(n + \" \");   // 1 4 9", "// каждый n приходит по мере готовности — не всё сразу"],
      predictAt: 1, predictQ: '<code>Nums()</code> порождает <code>i*i</code> для i=1..3. Что напечатает <code>await foreach (var n in Nums()) Write(n+" ")</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Производитель <code>Nums()</code> асинхронно порождает <b>1, 4, 9</b> — по одному, с <code>await</code> между.', nodes: [{ id: "p", kind: "gate", at: { zone: "prod", row: 0 }, state: "ok", label: "Nums()", detail: "yield 1,4,9", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>await foreach</code> тянет элементы <span class="hl">по одному</span>: получил <code>n</code> — обработал — запросил следующий.', nodes: [{ id: "p", kind: "gate", at: { zone: "prod", row: 0 }, state: "ok", label: "Nums()", detail: "1,4,9" }, { id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "await foreach", detail: "n за n", accent: true }], edges: [] },
        { codeLine: 2, out: "1 4 9", caption: 'Печать: <b>1 4 9</b> (реальный прогон). Элементы пришли по мере готовности, а не одним буфером.', nodes: [{ id: "c", kind: "gate", at: { zone: "cons", row: 0 }, state: "ok", label: "вывод", detail: "1 4 9", accent: true }], edges: [] },
      ],
      explain: 'Потребление async-стрима (GT str:F9): единственный синтаксис — <code>await foreach (var n in stream) { ... }</code>. Он тянет элементы <b>по одному</b>: запрашивает следующий, ждёт его (<code>await</code>), обрабатывает, снова запрашивает. Прогон: <code>Nums()</code> порождает <code>i*i</code> для i=1..3 → печать <b>1 4 9</b>. Обычный <code>foreach</code> тут не подойдёт — он не умеет <code>await</code> между элементами; именно <code>await foreach</code> координирует асинхронное получение каждого следующего элемента. Механику разворота (во что превращается <code>await foreach</code>) разбираем в машинной панели (разбор 05).',
      sources: ["ms-stream"],
    },
    {
      id: "s3", num: "03", kicker: "Лениво", title: "On-demand: можно читать бесконечный поток, break в любой миг",
      viewBox: "0 0 340 210", zones: LAZY_ZONES,
      code: ["async IAsyncEnumerable<int> Infinite(){ int i=0; while(true){ await Task.Delay(1); yield return i++; } }", "int taken=0; await foreach (var n in Infinite()){ Write(n); if(++taken==3) break; }  // took=3 vals=012", "// Task<IEnumerable<int>> тут ЗАВИСНЕТ — он ждёт всю (бесконечную) коллекцию"],
      predictAt: 1, predictQ: '<code>Infinite()</code> порождает 0,1,2,… без конца. <code>await foreach</code> с <code>break</code> после 3-го. Сколько взято и какие значения?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Infinite()</code> порождает <b>0, 1, 2, …</b> <span class="hl">без конца</span>. У async-стрима это нормально — он ленив.', nodes: [{ id: "l", kind: "gate", at: { zone: "lazy", row: 0 }, state: "ok", label: "Infinite()", detail: "0,1,2,…", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>await foreach</code> берёт <span class="hl">по мере готовности</span> и по <code>break</code> просто прекращает тянуть — производитель дальше не бежит.', nodes: [{ id: "l", kind: "gate", at: { zone: "lazy", row: 0 }, state: "ok", label: "Infinite()", detail: "лениво" }, { id: "b", kind: "gate", at: { zone: "lazy", row: 1 }, state: "ok", label: "break после 3", detail: "took=3", accent: true }], edges: [] },
        { codeLine: 2, out: "took=3 vals=012", caption: 'Печать: <b>took=3 vals=012</b> (реальный прогон). <code>Task&lt;IEnumerable&lt;int&gt;&gt;</code> так НЕ может — он ждёт всю коллекцию и на бесконечной завис бы.', nodes: [{ id: "b", kind: "gate", at: { zone: "lazy", row: 0 }, state: "ok", label: "took=3", detail: "012" }, { id: "w", kind: "gate", at: { zone: "whole", row: 0 }, state: "fail", label: "Task<IEnumerable>", detail: "ждёт всё · завис", accent: true }], edges: [] },
      ],
      explain: 'Ленивость / on-demand (GT str:F12/F16, M-stream-13): элементы async-стрима отдаются <b>по мере готовности</b> и не буферизуются целиком — <code>MoveNextAsync</code> выдаёт следующий, как только он доступен. Поэтому можно читать «never ending streams» и в любой момент <code>break</code> — производитель дальше не исполняется. Прогон: из <b>бесконечного</b> <code>Infinite()</code> взяли ровно <b>3</b> (took=3 vals=012) и вышли. Это ключевое отличие от <code>Task&lt;IEnumerable&lt;T&gt;&gt;</code>: тот сначала дожидается <b>всей</b> коллекции и лишь потом отдаёт её — на бесконечной последовательности он бы завис, а память на большой — раздулась бы. Async-стрим = «поток по требованию».',
      sources: ["ms-stream"],
    },
    {
      id: "s4", num: "04", kicker: "Отмена стрима", title: "[EnumeratorCancellation] + WithCancellation(token)",
      viewBox: "0 0 340 210", zones: CANCEL_ZONES,
      code: ["async IAsyncEnumerable<int> Nums([EnumeratorCancellation] CancellationToken ct){ ... }", "await foreach (var n in Nums().WithCancellation(token)) { ... }", "// атрибут связывает токен потребителя с телом итератора"],
      scenes: [
        { codeLine: 0, caption: 'На параметре <code>CancellationToken</code> генератора — атрибут <span class="hl"><code>[EnumeratorCancellation]</code></span>: он делает токен из <code>GetAsyncEnumerator</code> видимым телу итератора.', nodes: [{ id: "a", kind: "gate", at: { zone: "attr", row: 0 }, state: "ok", label: "[EnumeratorCancellation]", detail: "на параметре", accent: true }], edges: [] },
        { codeLine: 1, caption: 'При потреблении — <span class="hl"><code>.WithCancellation(token)</code></span>: <code>await foreach (var n in src.WithCancellation(t))</code>. Токен доходит до тела стрима.', nodes: [{ id: "a", kind: "gate", at: { zone: "attr", row: 0 }, state: "ok", label: "[EnumeratorCancellation]", detail: "генератор" }, { id: "w", kind: "gate", at: { zone: "with", row: 0 }, state: "ok", label: ".WithCancellation(t)", detail: "потребитель", accent: true }], edges: [{ id: "e1", from: "w", to: "a" }] },
        { codeLine: 2, caption: 'Связка «атрибут + WithCancellation» — <span class="hl">штатный</span> способ пробросить отмену в async-стрим (кооперативно, как в S2.8).', nodes: [{ id: "a", kind: "gate", at: { zone: "attr", row: 0 }, state: "ok", label: "тело видит ct", detail: "кооперативная отмена" }, { id: "w", kind: "gate", at: { zone: "with", row: 0 }, state: "ok", label: "WithCancellation", detail: "проброс токена", accent: true }], edges: [{ id: "e1", from: "w", to: "a" }] },
      ],
      explain: 'Отмена async-стрима (GT str:F14): токен пробрасывается связкой из двух частей. (1) На параметре <code>CancellationToken</code> метода-генератора ставят атрибут <code>[EnumeratorCancellation]</code> — он говорит компилятору взять токен, переданный в <code>GetAsyncEnumerator(token)</code>, и сделать его видимым телу итератора. (2) При потреблении вызывают <code>Nums().WithCancellation(token)</code>: <code>await foreach (var n in Nums().WithCancellation(t)) { ... }</code>. В результате тело стрима видит актуальный <code>ct</code> и может кооперативно проверять <code>ThrowIfCancellationRequested()</code> (как в S2.8). Без атрибута токен из <code>WithCancellation</code> не «доедет» до генератора. Это стандартный, безопасный способ сделать поток отменяемым.',
      sources: ["ms-stream"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · десугаринг", title: "Во что разворачивается await foreach",
      viewBox: "0 0 340 214", zones: SIG_ZONES,
      code: ["await foreach (var n in stream) { body; }   // разворачивается в:", "var e = stream.GetAsyncEnumerator();", "try { while (await e.MoveNextAsync()) { var n = e.Current; body; } }", "finally { if (e != null) await e.DisposeAsync(); }   // MoveNextAsync → ValueTask<bool>"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>await foreach</code> сначала берёт <span class="hl">async-энумератор</span>: <code>stream.GetAsyncEnumerator()</code>.', nodes: [{ id: "g", kind: "obj", at: { zone: "desugar", row: 0 }, typeTag: "GetAsyncEnumerator()", value: "IAsyncEnumerator<T>", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Затем цикл: <code>while (await e.MoveNextAsync())</code> — <code>MoveNextAsync()</code> возвращает <span class="hl"><code>ValueTask&lt;bool&gt;</code></span> (value type ради перфа, S2.5); <code>e.Current</code> — элемент.', nodes: [{ id: "g", kind: "obj", at: { zone: "desugar", row: 0 }, typeTag: "GetAsyncEnumerator", value: "энумератор" }, { id: "m", kind: "gate", at: { zone: "desugar", row: 1 }, state: "ok", label: "await MoveNextAsync()", detail: "ValueTask<bool>", accent: true }], edges: [] },
        { codeLine: 3, out: "moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True", caption: 'В <code>finally</code> — <code>await e.DisposeAsync()</code> (энумератор — <span class="hl"><code>IAsyncDisposable</code></span>). Замер рефлексией: <b>moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True</b>.', nodes: [{ id: "m", kind: "gate", at: { zone: "desugar", row: 0 }, state: "ok", label: "MoveNextAsync", detail: "ValueTask<bool>" }, { id: "d", kind: "gate", at: { zone: "desugar", row: 1 }, state: "ok", label: "await DisposeAsync", detail: "IAsyncDisposable", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — во что компилятор разворачивает <code>await foreach</code> (GT str:F11/F13). Цикл <code>await foreach (var n in stream) { body }</code> десугарится в: <code>var e = stream.GetAsyncEnumerator();</code> затем <code>try { while (await e.MoveNextAsync()) { var n = e.Current; body; } } finally { if (e != null) await e.DisposeAsync(); }</code>. Два ключевых наблюдения: <code>MoveNextAsync()</code> возвращает <b><code>ValueTask&lt;bool&gt;</code></b> — не <code>Task&lt;bool&gt;</code>: интерфейсы стрима используют value-обёртку ради перфа (тот самый <code>ValueTask</code> из S2.5, ведь следующий элемент часто готов синхронно); а <code>IAsyncEnumerator&lt;T&gt;</code> наследует <b><code>IAsyncDisposable</code></b>, поэтому очистка идёт через <code>await DisposeAsync()</code> в <code>finally</code>. Замер рефлексией подтверждает обе сигнатуры: <b>moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True</b>. Так async-стрим соединяет итератор, <code>ValueTask</code> и асинхронную очистку в одну конструкцию.',
      sources: ["ms-stream", "ms-await"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async IAsyncEnumerable&lt;int&gt; Nums(){ for(int i=1;i&lt;=3;i++){ await Task.Delay(1); yield return i*i; } } var sb = new StringBuilder(); await foreach (var n in Nums()) sb.Append(n).Append(" "); Console.WriteLine(sb.ToString().Trim());</code> — что напечатает?',
      options: ["1 4 9", "1 2 3", "9 4 1", "0 1 4"], correctIndex: 0, xp: 10,
      okText: '<code>async IAsyncEnumerable&lt;int&gt;</code> + <code>yield return i*i</code> порождает квадраты 1, 4, 9; <code>await foreach</code> тянет их <span class="hl">по одному</span>. Печать: <b>1 4 9</b>.',
      noText: 'Async-стрим (async + yield return + IAsyncEnumerable) через <code>await foreach</code> отдаёт i*i. Реальный вывод: <b>1 4 9</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1 4 9" }, sourceRefs: ["ms-stream"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>bool vt = typeof(IAsyncEnumerator&lt;int&gt;).GetMethod("MoveNextAsync").ReturnType == typeof(ValueTask&lt;bool&gt;); bool disp = typeof(IAsyncDisposable).IsAssignableFrom(typeof(IAsyncEnumerator&lt;int&gt;)); Console.WriteLine($"moveNextIsValueTaskBool={vt} enumeratorIsAsyncDisposable={disp}");</code> — что напечатает?',
      options: ["moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True", "moveNextIsValueTaskBool=False enumeratorIsAsyncDisposable=True", "moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=False", "moveNextIsValueTaskBool=False enumeratorIsAsyncDisposable=False"], correctIndex: 0, xp: 10,
      okText: '<code>MoveNextAsync()</code> возвращает <span class="hl"><code>ValueTask&lt;bool&gt;</code></span> (value type ради перфа, S2.5), а <code>IAsyncEnumerator&lt;T&gt;</code> — <code>IAsyncDisposable</code> (очистка через <code>DisposeAsync</code>). Печать: <b>True True</b>.',
      noText: 'Интерфейсы стрима: <code>MoveNextAsync → ValueTask&lt;bool&gt;</code>, энумератор — <code>IAsyncDisposable</code>. Реальный вывод: <b>moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "moveNextIsValueTaskBool=True enumeratorIsAsyncDisposable=True" }, sourceRefs: ["ms-stream"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>async IAsyncEnumerable&lt;int&gt; Infinite(){ int i=0; while(true){ await Task.Delay(1); yield return i++; } } int taken=0; var sb=new StringBuilder(); await foreach (var n in Infinite()){ sb.Append(n); if(++taken==3) break; } Console.WriteLine($"took={taken} vals={sb}");</code> — что напечатает?',
      options: ["took=3 vals=012", "(зависает навсегда)", "took=0 vals=", "took=3 vals=123"], correctIndex: 0, xp: 10,
      okText: 'Async-стрим <span class="hl">ленив</span>: из <b>бесконечного</b> <code>Infinite()</code> берём по одному и по <code>break</code> прекращаем — производитель дальше не бежит. Печать: <b>took=3 vals=012</b> (<code>Task&lt;IEnumerable&gt;</code> тут завис бы).',
      noText: 'On-demand: можно <code>break</code> из бесконечного стрима. Реальный вывод: <b>took=3 vals=012</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "took=3 vals=012" }, sourceRefs: ["ms-stream"],
    },
  ],

  takeaways: [
    { icon: "why", k: "три признака", v: 'Async-стрим = <code>async</code> + <code>yield return</code> + возврат <code>IAsyncEnumerable&lt;T&gt;</code>; потребляется через <code>await foreach</code> (замер: 1 4 9). Гибрид итератора и async-метода.' },
    { icon: "cost", k: "лениво / on-demand", v: 'Элементы отдаются <span class="hl">по мере готовности</span>, не буферизуются: можно читать бесконечный поток и <code>break</code> в любой миг (замер: took=3 из бесконечного). <code>Task&lt;IEnumerable&lt;T&gt;&gt;</code> так не может — ждёт всё.' },
    { icon: "avoid", k: "десугаринг + отмена", v: '<code>await foreach</code> → <code>GetAsyncEnumerator</code> + <code>while(await MoveNextAsync())</code> + <code>await DisposeAsync()</code>; <code>MoveNextAsync → ValueTask&lt;bool&gt;</code>, энумератор — <code>IAsyncDisposable</code> (замер: True True). Отмена — <code>[EnumeratorCancellation]</code> + <code>WithCancellation</code>.' },
  ],

  foot: 'урок · <b>async streams</b> · 5 анимир. разборов · панель десугаринга await foreach · дизайн <b>mid</b>',
};
