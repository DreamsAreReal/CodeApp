/**
 * Lesson: The async-iterator state machine, INSIDE (CS.S18.async-iterator-statemachine) —
 * expert density, 5 animated deep-dives. This is the INTERNALS lesson: how the compiler builds
 * an `async IAsyncEnumerable<T>` method. NOT a duplicate of CS.S2.async-streams (which is about
 * USING await foreach / cancellation). Here: the generated type is BOTH an iterator machine AND
 * an async machine — it implements IAsyncStateMachine, and its progress is driven by an
 * AsyncIteratorMethodBuilder (Create / MoveNext<TStateMachine> guarding ExecutionContext /
 * AwaitOnCompleted / Complete). A plain sync iterator is NOT an IAsyncStateMachine; the async one
 * is — that is the combined machine.
 *
 * SIGNATURE machine panel (s5): the AsyncIteratorMethodBuilder panel — REAL reflection via
 * run-csharp proving the generated state machine (name pattern `<G>d__N`) implements
 * IAsyncStateMachine (async iterator) while a sync iterator does not, and that
 * AsyncIteratorMethodBuilder is a struct with Create/MoveNext/Complete. Stable, deterministic
 * measurements (the `d__N` suffix and the generated-field layout are NOT stable — a static-class
 * method measured `<G>d__0`, a top-level local function `<G>d__1` — so this lesson deliberately
 * measures interface+builder facts, not the suffix or field names).
 *
 * Accuracy contract (G4/G7/G8):
 *   - Learn quotes VERBATIM from S1 (iterators, await-foreach desugar) + S7 (AsyncIteratorMethodBuilder
 *     API), fetch-verified 2026-07-21.
 *   - card verify.expect is REAL run-csharp stdout (this file's exec log, each confirmed stable 3x):
 *     c1 "syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True";
 *     c2 "isStruct=True Create=True MoveNext=True Complete=True";
 *     c3 "vals=12 asyncStateMachine=True".
 *   - The generated type NAME follows the pattern <G>d__N (N is a Roslyn ordinal that varies by
 *     declaring context), Roslyn-generated (.NET 10, reflection), marked as such — not a fixed literal.
 *   - NO GT-M6 myths: MИ-9 (async iterator is just an async method, no separate machine) refuted by
 *     s2/s5 (AsyncIteratorMethodBuilder); MИ-8 (await foreach == foreach over Tasks) refuted by s1;
 *     M10/F23: IteratorStateMachineAttribute is VB-only — flagged, not attributed to C#.
 *   - DEDUP: consumption (await foreach usage, cancellation) lives in CS.S2.async-streams; this
 *     lesson is strictly the compiler transform / builder internals.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S18.async-iterator-statemachine/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: async iterator = iterator machine + async machine.
const Z_ITERM: Zone = { id: "iterm", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "итератор-машина", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "yield return · MoveNext", subCls: "vz-zsub", subY: 47 };
const Z_ASYNCM: Zone = { id: "asyncm", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "async-машина", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "await · IAsyncStateMachine", subCls: "vz-zsub good", subY: 47 };
const COMBINE_ZONES: Zone[] = [Z_ITERM, Z_ASYNCM];

// s2: the AsyncIteratorMethodBuilder members.
const Z_BUILDER: Zone = { id: "builder", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "AsyncIteratorMethodBuilder · «builder for asynchronous iterators»", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "Create · MoveNext · AwaitOnCompleted · Complete", subCls: "vz-zsub good", subY: 47 };
const BUILDER_ZONES: Zone[] = [Z_BUILDER];

// s3: MoveNext<TStateMachine> guards ExecutionContext; AwaitOnCompleted schedules resume.
const Z_MOVE: Zone = { id: "move", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "builder.MoveNext(sm)", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "гонит IAsyncStateMachine.MoveNext", subCls: "vz-zsub good", subY: 47 };
const Z_AWAIT: Zone = { id: "awaitz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "AwaitOnCompleted", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "await не готов → расписать resume", subCls: "vz-zsub", subY: 47 };
const DRIVE_ZONES: Zone[] = [Z_MOVE, Z_AWAIT];

// s4: await foreach desugar (async side) + IteratorStateMachineAttribute VB-only boundary.
const Z_DESUGAR: Zone = { id: "desugar", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "потребление · await foreach → async-энумератор", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "GetAsyncEnumerator → await MoveNextAsync → await DisposeAsync", subCls: "vz-zsub", subY: 47 };
const DESUGAR_ZONES: Zone[] = [Z_DESUGAR];

// s5 (SIGNATURE): the builder+interface reflection panel.
const Z_SYNC: Zone = { id: "syncz", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "sync-итератор", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "IEnumerable<T>", subCls: "vz-zsub", subY: 47 };
const Z_ASYNC: Zone = { id: "asyncz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "async-итератор <G>d__N", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "IAsyncStateMachine · Roslyn .NET 10", subCls: "vz-zsub good", subY: 47 };
const REFLECT_ZONES: Zone[] = [Z_SYNC, Z_ASYNC];

export const asyncIteratorStatemachine: LessonData = {
  id: "CS.S18.async-iterator-statemachine",
  track: "CS",
  section: "CS.S18",
  module: "S18.4",
  lang: "csharp",
  title: "Async-итератор изнутри: AsyncIteratorMethodBuilder",
  kicker: "C# вглубь · S18 · итератор + async автомат",
  home: { subtitle: "IAsyncStateMachine, AsyncIteratorMethodBuilder, комбинация", icon: "async", estMinutes: 11 },
  prereqs: ["CS.S18.iterator-state-machine"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-iterators", kind: "doc", org: "Microsoft Learn", title: "Iterators (C#) — async counterpart + Deeper dive into foreach", url: "https://learn.microsoft.com/en-us/dotnet/csharp/iterators", date: "2026-03-30" },
    { id: "ms-builder", kind: "doc", org: "Microsoft Learn", title: "AsyncIteratorMethodBuilder Struct (.NET API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.asynciteratormethodbuilder", date: "2025-07-01" },
    { id: "ms-attr", kind: "doc", org: "Microsoft Learn", title: "IteratorStateMachineAttribute Class (.NET API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.iteratorstatemachineattribute", date: "2025-07-01" },
    { id: "roslyn-async-sm", kind: "artifact", org: "Roslyn / .NET 10", title: "Compiler-generated async-iterator state machine (reflection, run-csharp .NET 10)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/iterators", date: "2026-07-21" },
  ],

  spec: [
    { text: "«Represents a builder for asynchronous iterators.» <span class=\"ru-tr\">«Представляет строитель для асинхронных итераторов.»</span>", source: "ms-builder" },
  ],
  edgeCases: [
    { text: 'Async-двойник любого итератора — заменой типа возврата: «All of these preceding examples would have an asynchronous counterpart. In each case, you\'d replace the return type of <code>IEnumerable&lt;T&gt;</code> with an <code>IAsyncEnumerable&lt;T&gt;</code>» <span class="ru-tr">«У всех предыдущих примеров был бы асинхронный аналог. В каждом случае вы бы заменили тип возврата <code>IEnumerable&lt;T&gt;</code> на <code>IAsyncEnumerable&lt;T&gt;</code>»</span>.', source: "ms-iterators" },
    { text: 'Сгенерированный async-итератор реализует <code>IAsyncStateMachine</code> (комбинация итератор- и async-машины); sync-итератор — <b>нет</b>. Драйвер прогресса — <code>AsyncIteratorMethodBuilder</code>.', source: "ms-builder" },
    { text: '<span class="hl">Граница</span>: <code>IteratorStateMachineAttribute</code> — <b>VB-only</b>, к C#-итераторам не применяется. Для C# доказательство «это итератор» — сам сгенерированный тип/интерфейс, не атрибут.', source: "ms-attr" },
  ],

  misconceptions: [
    {
      wrong: "async-итератор — это просто async-метод, отдельной стейт-машины нет; у C#-итератора есть атрибут IteratorStateMachineAttribute",
      hook: 'Два мифа о внутренностях async-итератора. «<span class="wrong">просто async-метод, машины нет</span>» — нет: <code>async IAsyncEnumerable&lt;T&gt;</code> компилируется в <b>комбинированную</b> стейт-машину — она реализует <code>IAsyncStateMachine</code> И ведёт себя как итератор; её прогресс гонит <code>AsyncIteratorMethodBuilder</code> — «a builder for asynchronous iterators» <span class="ru-tr">«строитель для асинхронных итераторов»</span> (замер: async-итератор <code>IAsyncStateMachine=True</code>, sync — <code>False</code>). «<span class="wrong">у C#-итератора есть IteratorStateMachineAttribute</span>» — нет: этот атрибут <b>VB-only</b>, к C# не применяется. Ниже <b>пять разборов</b>: итератор-машина + async-машина, члены <code>AsyncIteratorMethodBuilder</code>, как <code>MoveNext</code>/<code>AwaitOnCompleted</code> гонят автомат, десугар <code>await foreach</code> и граница VB-атрибута, и <b>машинная панель</b> — реальная рефлексия: сгенерированный тип вида <code>&lt;G&gt;d__N : IAsyncStateMachine</code> (суффикс <code>d__N</code> — ординал Roslyn, зависит от контекста объявления). (Использование <code>await foreach</code>/отмена — в S2.9, тут только внутренности.)',
      source: "ms-builder",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Две машины в одной", title: "async IAsyncEnumerable<T> = итератор-машина + async-машина",
      viewBox: "0 0 340 210", zones: COMBINE_ZONES,
      code: ["async IAsyncEnumerable<int> G(){ await Task.Yield(); yield return 1; yield return 2; }", "// yield return → как итератор (пауза/возобновление)", "// await          → как async-метод (IAsyncStateMachine)"],
      scenes: [
        { codeLine: 1, caption: '<code>yield return</code> даёт <span class="hl">итераторную</span> сторону: пауза/возобновление, отдача по одному (как S18.3).', nodes: [{ id: "it", kind: "gate", at: { zone: "iterm", row: 0 }, state: "ok", label: "yield return", detail: "пауза/resume", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>await</code> даёт <span class="hl">async</span>-сторону: между элементами можно ждать (IAsyncStateMachine).', nodes: [{ id: "it", kind: "gate", at: { zone: "iterm", row: 0 }, state: "ok", label: "yield return", detail: "итератор" }, { id: "as", kind: "gate", at: { zone: "asyncm", row: 0 }, state: "ok", label: "await", detail: "IAsyncStateMachine", accent: true }], edges: [] },
        { codeLine: 0, caption: 'Компилятор строит <b>одну</b> стейт-машину, объединяющую обе. Это «asynchronous counterpart» <span class="ru-tr">«асинхронный аналог»</span> синхронного итератора — заменой <code>IEnumerable&lt;T&gt;</code> на <code>IAsyncEnumerable&lt;T&gt;</code>.', nodes: [{ id: "combined", kind: "obj", at: { zone: "iterm", row: 0 }, typeTag: "<G>d__N", value: "итератор + async" }, { id: "sm", kind: "gate", at: { zone: "asyncm", row: 0 }, state: "ok", label: "одна машина", detail: "combine", accent: true }], edges: [{ id: "e1", from: "combined", to: "sm" }] },
      ],
      explain: 'Async-итератор — <b>комбинация</b> двух автоматов, а не «async-метод, который случайно yield-ит». Со стороны итератора он делает пауза/возобновление на <code>yield return</code> (стейт-машина из S18.3); со стороны async — умеет <code>await</code> между элементами (async-стейт-машина из M4). Дока формулирует происхождение прямо: «All of these preceding examples would have an asynchronous counterpart. In each case, you\'d replace the return type of <code>IEnumerable&lt;T&gt;</code> with an <code>IAsyncEnumerable&lt;T&gt;</code>» <span class="ru-tr">«У всех предыдущих примеров был бы асинхронный аналог. В каждом случае вы бы заменили тип возврата <code>IEnumerable&lt;T&gt;</code> на <code>IAsyncEnumerable&lt;T&gt;</code>»</span>. Компилятор эмитит <b>один</b> nested-тип (имя вида <code>&lt;G&gt;d__N</code>, где <code>N</code> — ординал Roslyn, зависящий от контекста объявления, .NET 10), который реализует и итераторный контракт (<code>MoveNextAsync</code>/<code>Current</code>), и <code>IAsyncStateMachine</code> — доказательство рефлексией в машинной панели (05). <i>Само использование</i> <code>await foreach</code> и отмена — отдельная тема (S2.9); здесь мы вскрываем внутренности.',
      sources: ["ms-iterators", "ms-builder"],
    },
    {
      id: "s2", num: "02", kicker: "AsyncIteratorMethodBuilder", title: "Builder, который «строит асинхронные итераторы»",
      viewBox: "0 0 340 210", zones: BUILDER_ZONES,
      code: ["public struct AsyncIteratorMethodBuilder   // «Represents a builder for asynchronous iterators.»", "  Create()                 // создать builder", "  MoveNext<TStateMachine>(sm)  // гнать MoveNext, охраняя ExecutionContext", "  AwaitOnCompleted / AwaitUnsafeOnCompleted / Complete()"],
      scenes: [
        { codeLine: 0, caption: '<span class="hl"><code>AsyncIteratorMethodBuilder</code></span> — <code>struct</code>: «Represents a builder for asynchronous iterators» <span class="ru-tr">«Представляет строитель для асинхронных итераторов»</span>. Поле такого builder-а лежит в сгенерированной машине.', nodes: [{ id: "b", kind: "obj", at: { zone: "builder", row: 0 }, typeTag: "AsyncIteratorMethodBuilder", value: "struct · builder", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Create()</code> — «Creates an instance of the <code>AsyncIteratorMethodBuilder</code> struct» <span class="ru-tr">«Создаёт экземпляр структуры <code>AsyncIteratorMethodBuilder</code>»</span>; <code>MoveNext&lt;TStateMachine&gt;</code> гонит автомат.', nodes: [{ id: "b", kind: "obj", at: { zone: "builder", row: 0 }, typeTag: "AsyncIteratorMethodBuilder", value: "struct" }, { id: "cr", kind: "chip", at: { zone: "builder", row: 1, col: 0 }, value: "Create()" }, { id: "mn", kind: "chip", at: { zone: "builder", row: 1, col: 1 }, value: "MoveNext<TSM>", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Плюс <code>AwaitOnCompleted</code>/<code>AwaitUnsafeOnCompleted</code> (расписать resume) и <span class="hl"><code>Complete()</code></span> — «Marks iteration as being completed» <span class="ru-tr">«Помечает итерацию как завершённую»</span>.', nodes: [{ id: "b", kind: "obj", at: { zone: "builder", row: 0 }, typeTag: "AsyncIteratorMethodBuilder", value: "члены builder-а" }, { id: "aw", kind: "chip", at: { zone: "builder", row: 1, col: 0 }, value: "AwaitOnCompleted" }, { id: "cm", kind: "chip", at: { zone: "builder", row: 1, col: 1 }, value: "Complete()", accent: true }], edges: [] },
      ],
      explain: 'Прогресс async-итератора ведёт специальный builder — <code>AsyncIteratorMethodBuilder</code>: «Represents a builder for asynchronous iterators» <span class="ru-tr">«Представляет строитель для асинхронных итераторов»</span>. Это <code>struct</code> (по API: «public struct AsyncIteratorMethodBuilder» <span class="ru-tr">«public struct AsyncIteratorMethodBuilder»</span>), поле которого хранится внутри сгенерированной машины. Его члены (дословно из API): <code>Create()</code> — «Creates an instance of the <code>AsyncIteratorMethodBuilder</code> struct» <span class="ru-tr">«Создаёт экземпляр структуры <code>AsyncIteratorMethodBuilder</code>»</span>; <code>MoveNext&lt;TStateMachine&gt;(TStateMachine)</code> — «Invokes <code>MoveNext()</code> on the state machine while guarding the <code>ExecutionContext</code>» <span class="ru-tr">«Вызывает <code>MoveNext()</code> на стейт-машине, охраняя <code>ExecutionContext</code>»</span>; <code>AwaitOnCompleted</code>/<code>AwaitUnsafeOnCompleted</code> — «Schedules the state machine to proceed to the next action when the specified awaiter completes» <span class="ru-tr">«Планирует переход стейт-машины к следующему действию, когда указанный awaiter завершится»</span>; <code>Complete()</code> — «Marks iteration as being completed, whether successfully or otherwise» <span class="ru-tr">«Помечает итерацию как завершённую — успешно или иначе»</span>. Это тот же method-builder-паттерн, что у обычного async-метода (M4), но специализированный под итератор — потому «asynchronous iterator» <span class="ru-tr">«асинхронный итератор»</span>.',
      sources: ["ms-builder"],
    },
    {
      id: "s3", num: "03", kicker: "Как builder гонит машину", title: "MoveNext охраняет контекст; AwaitOnCompleted расписывает resume",
      viewBox: "0 0 340 210", zones: DRIVE_ZONES,
      code: ["// MoveNextAsync() → builder.MoveNext(ref stateMachine)", "//   → IAsyncStateMachine.MoveNext(): тело идёт до await или yield return", "// await не готов → AwaitOnCompleted расписывает продолжение, MoveNext выходит", "// awaiter завершился → MoveNext снова, тело возобновляется"],
      scenes: [
        { codeLine: 0, caption: '<code>MoveNextAsync()</code> зовёт <span class="hl"><code>builder.MoveNext(sm)</code></span> — «Invokes <code>MoveNext()</code> on the state machine while guarding the <code>ExecutionContext</code>» <span class="ru-tr">«Вызывает <code>MoveNext()</code> на стейт-машине, охраняя <code>ExecutionContext</code>»</span>.', nodes: [{ id: "m", kind: "gate", at: { zone: "move", row: 0 }, state: "ok", label: "builder.MoveNext(sm)", detail: "guard ExecutionContext", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Тело доходит до <code>await</code>, awaiter <span class="hl">не готов</span> → <code>AwaitOnCompleted</code> расписывает продолжение, а <code>MoveNext</code> <b>выходит</b> (поток свободен).', nodes: [{ id: "m", kind: "gate", at: { zone: "move", row: 0 }, state: "ok", label: "MoveNext", detail: "тело → await" }, { id: "a", kind: "gate", at: { zone: "awaitz", row: 0 }, state: "ok", label: "AwaitOnCompleted", detail: "расписать resume", accent: true }], edges: [{ id: "e1", from: "m", to: "a" }] },
        { codeLine: 3, caption: 'Awaiter завершился → <span class="hl"><code>MoveNext</code> снова</span>: тело возобновляется до <code>yield return</code> (отдать элемент) или конца → <code>Complete()</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "awaitz", row: 0 }, state: "ok", label: "awaiter готов", detail: "callback" }, { id: "m2", kind: "gate", at: { zone: "move", row: 0 }, state: "ok", label: "MoveNext снова", detail: "resume → yield", accent: true }], edges: [{ id: "e1", from: "a", to: "m2" }] },
      ],
      explain: 'Механика прогона — тот же цикл «MoveNext → await → callback → MoveNext», что у async-метода, но обёрнутый в итератор. <code>MoveNextAsync()</code> (потребитель дёргает его в <code>await foreach</code>) внутри вызывает <code>builder.MoveNext(ref stateMachine)</code>: «Invokes <code>MoveNext()</code> on the state machine while guarding the <code>ExecutionContext</code>» <span class="ru-tr">«Вызывает <code>MoveNext()</code> на стейт-машине, охраняя <code>ExecutionContext</code>»</span>. Если тело упирается в <b>незавершённый</b> <code>await</code>, builder через <code>AwaitOnCompleted</code>/<code>AwaitUnsafeOnCompleted</code> — «Schedules the state machine to proceed to the next action when the specified awaiter completes» <span class="ru-tr">«Планирует переход стейт-машины к следующему действию, когда указанный awaiter завершится»</span> — расписывает продолжение и <code>MoveNext</code> выходит, освобождая поток (никакого блокирования). Когда awaiter завершается, callback снова зовёт <code>MoveNext</code>, тело возобновляется до следующего <code>yield return</code> (элемент готов) либо до конца, где builder делает <code>Complete()</code> — «Marks iteration as being completed» <span class="ru-tr">«Помечает итерацию как завершённую»</span>. Так поле состояния (<code>&lt;&gt;1__state</code>) кодирует и точки <code>yield</code>, и точки <code>await</code>.',
      sources: ["ms-builder"],
    },
    {
      id: "s4", num: "04", kicker: "Десугар потребления · граница", title: "await foreach → async-энумератор; IteratorStateMachineAttribute — VB-only",
      viewBox: "0 0 340 210", zones: DESUGAR_ZONES,
      code: ["// со стороны потребителя await foreach разворачивается в:", "var e = seq.GetAsyncEnumerator();", "try { while (await e.MoveNextAsync()) { var x = e.Current; ... } }", "finally { if (e is IAsyncDisposable d) await d.DisposeAsync(); }"],
      scenes: [
        { codeLine: 1, caption: 'Потребитель берёт <span class="hl">async-энумератор</span>: «<code>var enumerator = collection.GetAsyncEnumerator();</code>» — симметрично синхронному <code>GetEnumerator</code>.', nodes: [{ id: "g", kind: "obj", at: { zone: "desugar", row: 0 }, typeTag: "GetAsyncEnumerator()", value: "IAsyncEnumerator<T>", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Цикл: «<code>while (await enumerator.MoveNextAsync())</code>» — каждый элемент через <code>await MoveNextAsync()</code>, не через одну общую таску коллекции.', nodes: [{ id: "g", kind: "obj", at: { zone: "desugar", row: 0 }, typeTag: "GetAsyncEnumerator", value: "энумератор" }, { id: "w", kind: "gate", at: { zone: "desugar", row: 1 }, state: "ok", label: "await MoveNextAsync()", detail: "по одному", accent: true }], edges: [] },
        { codeLine: 3, caption: '<span class="hl">Граница</span>: <code>IteratorStateMachineAttribute</code> — <b>VB-only</b>, к C# не применяется. Для C# «это итератор» доказывает сам тип, не атрибут.', nodes: [{ id: "w", kind: "gate", at: { zone: "desugar", row: 0 }, state: "ok", label: "await MoveNextAsync", detail: "async-обход" }, { id: "attr", kind: "gate", at: { zone: "desugar", row: 1 }, state: "fail", label: "IteratorStateMachineAttribute", detail: "VB-only, не C#", accent: true }], edges: [] },
      ],
      explain: 'Со стороны потребителя <code>await foreach</code> разворачивается симметрично синхронному (из «Deeper dive into <code>foreach</code>» <span class="ru-tr">«Углублённый разбор <code>foreach</code>»</span>): «<code>var enumerator = collection.GetAsyncEnumerator();</code>» затем «<code>while (await enumerator.MoveNextAsync())</code>» с телом «<code>var item = enumerator.Current;</code>», а в <code>finally</code> — «<code>if (enumerator is IAsyncDisposable asyncDisposable) await asyncDisposable.DisposeAsync();</code>». Это поэлементный async-обход — <b>не</b> одна таска на всю коллекцию (подробнее об использовании — S2.9). Важная <b>граница</b> уровня стейт-машины: атрибут <code>IteratorStateMachineAttribute</code> «applies to Visual Basic methods but not C# methods» <span class="ru-tr">«применяется к методам Visual Basic, но не к методам C#»</span> — «You can\'t use <code>IteratorStateMachineAttribute</code> to test whether a method is an iterator method in C#» <span class="ru-tr">«Нельзя использовать <code>IteratorStateMachineAttribute</code>, чтобы проверить, является ли метод итератором в C#»</span>. Поэтому для C# «доказательство итератора» — сам сгенерированный nested-тип и его интерфейсы (машинная панель), а не атрибут. (Для контраста: <code>AsyncStateMachineAttribute</code> эмитится и для C# async-методов — это M4.)',
      sources: ["ms-iterators", "ms-attr"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальная рефлексия", title: "async-итератор : IAsyncStateMachine (sync — нет)",
      viewBox: "0 0 340 214", zones: REFLECT_ZONES,
      code: ["IEnumerable<int> S(){ yield return 1; }                          // sync-итератор", "async IAsyncEnumerable<int> A(){ await Task.Yield(); yield return 1; }  // async", "typeof(IAsyncStateMachine).IsAssignableFrom(S().GetType())  // False", "typeof(IAsyncStateMachine).IsAssignableFrom(A().GetType())  // True"],
      predictAt: 2, predictQ: 'Реализует ли сгенерированный тип <b>sync</b>-итератора интерфейс <code>IAsyncStateMachine</code>?',
      console: true,
      scenes: [
        { codeLine: 2, out: "", caption: 'Sync-итератор <code>S()</code> — обычная итератор-машина, <span class="hl">не</span> async: <code>IAsyncStateMachine</code> = <b>False</b>.', nodes: [{ id: "s", kind: "gate", at: { zone: "syncz", row: 0 }, state: "fail", label: "sync <S>d__", detail: "IAsyncStateMachine=False", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Async-итератор <code>A()</code> — <span class="hl">комбинированная</span> машина: <code>IAsyncStateMachine</code> = <b>True</b>. Вот отличие от простого итератора.', nodes: [{ id: "s", kind: "gate", at: { zone: "syncz", row: 0 }, state: "fail", label: "sync", detail: "False" }, { id: "a", kind: "gate", at: { zone: "asyncz", row: 0 }, state: "ok", label: "async <G>d__N", detail: "IAsyncStateMachine=True", accent: true }], edges: [] },
        { codeLine: 3, out: "syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True", caption: 'Вывод (реальный прогон): <b>sync=False async=True</b>. Async-итератор действительно несёт async-стейт-машину — миф «просто async-метод» опровергнут.', nodes: [{ id: "s", kind: "gate", at: { zone: "syncz", row: 0 }, state: "fail", label: "sync", detail: "False" }, { id: "a", kind: "gate", at: { zone: "asyncz", row: 0 }, state: "ok", label: "async", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — <b>реальная рефлексия</b> (собственный прогон run-csharp, стабильно воспроизводится). Ключевой замер: сгенерированный тип <b>sync</b>-итератора (<code>IEnumerable&lt;int&gt; S()</code>) <b>не</b> реализует <code>IAsyncStateMachine</code>, а <b>async</b>-итератор (<code>async IAsyncEnumerable&lt;int&gt; A()</code>) — реализует. Вывод: <code>syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True</code>. Это прямое доказательство, что async-итератор — <b>не</b> «просто async-метод» и <b>не</b> «просто итератор»: компилятор эмитит комбинированную машину, реализующую <code>IAsyncStateMachine</code>, прогресс которой ведёт <code>AsyncIteratorMethodBuilder</code>. Имя типа вида <code>&lt;G&gt;d__N</code> (суффикс <code>N</code> — ординал Roslyn: у статического метода вышло <code>d__0</code>, у top-level локальной функции — <code>d__1</code>; замер) и раскладка полей — Roslyn-generated (.NET 10); стабильный, воспроизводимый факт здесь — именно <b>интерфейс</b> и <b>наличие builder-а</b>, а не имена полей/суффикс (они могут меняться по контексту и оптимизациям).',
      sources: ["roslyn-async-sm", "ms-builder"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; S(){ yield return 1; } async IAsyncEnumerable&lt;int&gt; A(){ await Task.Yield(); yield return 1; } bool s = typeof(IAsyncStateMachine).IsAssignableFrom(S().GetType()); bool a = typeof(IAsyncStateMachine).IsAssignableFrom(A().GetType()); Console.WriteLine($"syncIterator.IAsyncStateMachine={s} asyncIterator.IAsyncStateMachine={a}");</code> — что напечатает?',
      options: ["syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True", "syncIterator.IAsyncStateMachine=True asyncIterator.IAsyncStateMachine=True", "syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=False", "syncIterator.IAsyncStateMachine=True asyncIterator.IAsyncStateMachine=False"], correctIndex: 0, xp: 10,
      okText: 'Async-итератор — <span class="hl">комбинированная</span> машина: её тип реализует <code>IAsyncStateMachine</code>. Sync-итератор — нет. Печать: <b>sync=False async=True</b>. Async-итератор ≠ «просто async-метод».',
      noText: 'Компилятор эмитит для <code>async IAsyncEnumerable&lt;T&gt;</code> async-стейт-машину (<code>IAsyncStateMachine</code>), для sync-итератора — обычную. Реальный вывод: <b>syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "syncIterator.IAsyncStateMachine=False asyncIterator.IAsyncStateMachine=True" }, sourceRefs: ["roslyn-async-sm", "ms-builder"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var t = typeof(AsyncIteratorMethodBuilder); Console.WriteLine($"isStruct={t.IsValueType} Create={t.GetMethod("Create")!=null} MoveNext={t.GetMethod("MoveNext")!=null} Complete={t.GetMethod("Complete")!=null}");</code> — что напечатает?',
      options: ["isStruct=True Create=True MoveNext=True Complete=True", "isStruct=False Create=True MoveNext=True Complete=True", "isStruct=True Create=False MoveNext=False Complete=False", "isStruct=True Create=True MoveNext=False Complete=True"], correctIndex: 0, xp: 10,
      okText: '<code>AsyncIteratorMethodBuilder</code> — <code>struct</code> («public struct…») с членами <code>Create</code>/<code>MoveNext</code>/<code>Complete</code>: builder «for asynchronous iterators» <span class="ru-tr">«для асинхронных итераторов»</span>. Печать: <b>isStruct=True Create=True MoveNext=True Complete=True</b>.',
      noText: 'Builder async-итератора — value type с документированными <code>Create</code>/<code>MoveNext</code>/<code>AwaitOnCompleted</code>/<code>Complete</code>. Реальный вывод: <b>isStruct=True Create=True MoveNext=True Complete=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "isStruct=True Create=True MoveNext=True Complete=True" }, sourceRefs: ["ms-builder"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>async IAsyncEnumerable&lt;int&gt; G(){ await Task.Yield(); yield return 1; await Task.Yield(); yield return 2; } var sb = new StringBuilder(); await foreach(var x in G()) sb.Append(x); bool asyncSM = typeof(IAsyncStateMachine).IsAssignableFrom(G().GetType()); Console.WriteLine($"vals={sb} asyncStateMachine={asyncSM}");</code> — что напечатает?',
      options: ["vals=12 asyncStateMachine=True", "vals=12 asyncStateMachine=False", "vals=21 asyncStateMachine=True", "vals= asyncStateMachine=True"], correctIndex: 0, xp: 10,
      okText: 'Async-итератор чередует <code>await</code> и <code>yield return</code>, отдавая <b>1</b> затем <b>2</b>; его тип — <span class="hl">async-стейт-машина</span>. Печать: <b>vals=12 asyncStateMachine=True</b>.',
      noText: 'Тело <code>await Task.Yield(); yield return 1; await…; yield return 2;</code> даёт последовательность 1,2, а тип реализует <code>IAsyncStateMachine</code>. Реальный вывод: <b>vals=12 asyncStateMachine=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "vals=12 asyncStateMachine=True" }, sourceRefs: ["roslyn-async-sm"],
    },
  ],

  takeaways: [
    { icon: "why", k: "две машины в одной", v: 'async-итератор — <span class="hl">комбинация</span> итератор-машины (<code>yield</code>) и async-машины (<code>await</code>): её тип реализует <code>IAsyncStateMachine</code>, sync-итератор — нет (замер: sync=False async=True). Не «просто async-метод».' },
    { icon: "cost", k: "AsyncIteratorMethodBuilder", v: '«Represents a builder for asynchronous iterators» <span class="ru-tr">«Представляет строитель для асинхронных итераторов»</span> — <code>struct</code> с <code>Create</code>/<code>MoveNext&lt;TSM&gt;</code> (guard ExecutionContext)/<code>AwaitOnCompleted</code>/<code>Complete</code>. Гонит машину по циклу MoveNext → await → callback → MoveNext.' },
    { icon: "avoid", k: "граница VB-атрибута", v: '<code>IteratorStateMachineAttribute</code> — <b>VB-only</b>, к C# не применяется; для C# «это итератор» доказывает тип/интерфейс, не атрибут. Использование <code>await foreach</code>/отмена — отдельно в S2.9.' },
  ],

  foot: 'урок · <b>async-итератор изнутри</b> · 5 анимир. разборов · панель IAsyncStateMachine + AsyncIteratorMethodBuilder · дизайн <b>mid</b>',
};
