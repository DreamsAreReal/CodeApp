/**
 * Lesson: The iterator state machine (CS.S18.iterator-state-machine) — expert density,
 * 5 animated deep-dives, the SIGNATURE machine lesson of the section. Although you write an
 * iterator as a method, the compiler translates it into a NESTED CLASS that is, in effect, a
 * state machine: it generates Current/MoveNext/Dispose for you; MoveNext resumes the body
 * after the previous yield return; the IEnumerator<T> contract (positioned before the first
 * element, Current undefined until MoveNext, false past the end) is where the machine sits;
 * Reset is NOT supported (throws NotSupportedException). The generated members are named
 * `<G>d__0` / `<>1__state` (start = -2) / `<>2__current` — Roslyn-generated, .NET 10.
 *
 * SIGNATURE machine panel (s5): the generated-state-machine panel — REAL reflection on the
 * compiled iterator via run-csharp: nested type `<G>d__0`, a `<>1__state` field (value -2 on
 * the freshly-returned object, before iteration), and Reset() throwing NotSupportedException.
 * Provenance: the member NAMES + the -2 start are ROSLYN-GENERATED (.NET 10 spike/reflection),
 * NOT quoted from Learn — GT-M6 §6 rule. The behaviour (nested class = state machine, generates
 * MoveNext/Current/Dispose, Reset throws) IS Learn (S3), the exact names are Roslyn.
 *
 * Accuracy contract (G4/G7/G8):
 *   - Learn quotes VERBATIM from S3 (programming-guide/concepts/iterators) + S4 (IEnumerator<T>
 *     API), fetch-verified 2026-07-21.
 *   - card verify.expect is REAL run-csharp stdout (this file's exec log):
 *     c1 "stateMachine=<G>d__0 hasStateField=True resetThrows=True";
 *     c2 "m1=True:10 m2=True:20 m3=False"; c3 "state before iteration: -2".
 *   - The generated-member NAMES (<G>d__0 / <>1__state / -2) are RUN-CSHARP REFLECTION output
 *     (Roslyn .NET 10), marked as such — never attributed to Learn.
 *   - NO GT-M6 myths: MИ-4 (must implement IEnumerator by hand) refuted by s2; MИ-7 (Reset
 *     restarts) refuted by s4; MИ-3 (foreach copies) refuted by s1 desugar.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S18.iterator-state-machine/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: method → nested class (compiler transform).
const Z_SRC: Zone = { id: "src", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "твой код · метод", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "IEnumerable<int> G(){ yield… }", subCls: "vz-zsub", subY: 47 };
const Z_GEN: Zone = { id: "gen", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "компилятор · nested-класс", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "стейт-машина <G>d__0", subCls: "vz-zsub good", subY: 47 };
const XFORM_ZONES: Zone[] = [Z_SRC, Z_GEN];

// s2: generated members.
const Z_MEMBERS: Zone = { id: "members", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "сгенерированные члены <G>d__0", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "MoveNext · Current · Dispose · поля состояния", subCls: "vz-zsub good", subY: 47 };
const MEMBERS_ZONES: Zone[] = [Z_MEMBERS];

// s3: the IEnumerator<T> contract (panel where the machine sits).
const Z_CONTRACT: Zone = { id: "contract", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "контракт IEnumerator<T> · где живёт машина", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "перед 1-м → MoveNext → Current → false за концом", subCls: "vz-zsub", subY: 47 };
const CONTRACT_ZONES: Zone[] = [Z_CONTRACT];

// s4: Reset not supported.
const Z_RESET: Zone = { id: "reset", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Reset()", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "на итераторе → бросает", subCls: "vz-zsub heap", subY: 47 };
const Z_NEW: Zone = { id: "newit", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "новый итератор", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "чтобы начать сначала", subCls: "vz-zsub good", subY: 47 };
const RESET_ZONES: Zone[] = [Z_RESET, Z_NEW];

// s5 (SIGNATURE): the generated-state-machine panel with real reflection numbers.
const Z_TYPE: Zone = { id: "type", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "nested-тип", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "рефлексия на скомпилированном", subCls: "vz-zsub good", subY: 47 };
const Z_STATE: Zone = { id: "statez", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "поле <>1__state", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "до обхода · Roslyn .NET 10", subCls: "vz-zsub", subY: 47 };
const SM_ZONES: Zone[] = [Z_TYPE, Z_STATE];

export const iteratorStateMachine: LessonData = {
  id: "CS.S18.iterator-state-machine",
  track: "CS",
  section: "CS.S18",
  module: "S18.3",
  lang: "csharp",
  title: "Стейт-машина итератора: во что компилятор превращает yield",
  kicker: "C# вглубь · S18 · nested-класс = автомат",
  home: { subtitle: "MoveNext/Current, <>1__state, Reset → NotSupported", icon: "async", estMinutes: 11 },
  prereqs: ["CS.S18.yield-contract"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-iter-pg", kind: "doc", org: "Microsoft Learn", title: "Iterate through collections (C#) — Technical Implementation", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/iterators", date: "2026-03-30" },
    { id: "ms-ienumerator", kind: "doc", org: "Microsoft Learn", title: "IEnumerator<T> Interface (.NET API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ienumerator-1", date: "2025-07-01" },
    { id: "roslyn-sm", kind: "artifact", org: "Roslyn / .NET 10", title: "Compiler-generated iterator state machine (reflection, run-csharp / spike .NET 10.0.301)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/iterators", date: "2026-07-21" },
  ],

  spec: [
    { text: "«Although you write an iterator as a method, the compiler translates it into a nested class that is, in effect, a state machine.»", source: "ms-iter-pg" },
  ],
  edgeCases: [
    { text: 'Компилятор сам генерирует члены: «When the compiler detects the iterator, it automatically generates the <code>Current</code>, <code>MoveNext</code>, and <code>Dispose</code> methods». Вручную <code>IEnumerator</code> не пишешь.', source: "ms-iter-pg" },
    { text: 'Контракт <code>IEnumerator&lt;T&gt;</code>: «Initially, the enumerator is positioned before the first element… <code>Current</code> is undefined. Therefore, you must call <code>MoveNext</code>…»; за концом «<code>MoveNext</code> returns <code>false</code>».', source: "ms-ienumerator" },
    { text: 'Имена сгенерированных членов (<code>&lt;G&gt;d__0</code>, <code>&lt;&gt;1__state</code>, старт <b>-2</b>) — <span class="hl">Roslyn-generated, .NET 10</span> (рефлексия), а не цитата Learn. Могут меняться между версиями компилятора.', source: "roslyn-sm" },
  ],

  misconceptions: [
    {
      wrong: "чтобы сделать итератор, надо вручную реализовать IEnumerator (Current/MoveNext/Dispose); итератор можно перезапустить через Reset()",
      hook: 'Два мифа о механике итераторов. «<span class="wrong">надо вручную реализовать IEnumerator</span>» — нет: «you don\'t have to implement the whole <code>IEnumerator</code> interface… it automatically generates the <code>Current</code>, <code>MoveNext</code>, and <code>Dispose</code> methods». Компилятор превращает твой метод в <b>nested-класс = стейт-машину</b>. «<span class="wrong">Reset() перезапускает</span>» — нет: «Iterators don\'t support the <code>IEnumerator.Reset</code> method… Calling <code>Reset</code>… throws a <code>NotSupportedException</code>»; чтобы начать сначала — <b>новый</b> итератор. Ниже <b>пять разборов</b>: метод → nested-класс, сгенерированные члены, контракт <code>IEnumerator&lt;T&gt;</code> (перед первым → MoveNext → false), <code>Reset</code> бросает, и <b>машинная панель</b> — реальная рефлексия: тип <code>&lt;G&gt;d__0</code>, поле <code>&lt;&gt;1__state</code> = <b>-2</b> до обхода (Roslyn .NET 10).',
      source: "ms-iter-pg",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Метод → nested-класс", title: "Компилятор превращает итератор в стейт-машину",
      viewBox: "0 0 340 210", zones: XFORM_ZONES,
      code: ["IEnumerable<int> G(){ yield return 1; yield return 2; }   // ты пишешь метод", "// компилятор генерирует nested-класс <G>d__0 — стейт-машину", "// foreach → GetEnumerator() + while(MoveNext()){ Current } (НЕ копия коллекции)"],
      scenes: [
        { codeLine: 0, caption: 'Ты пишешь обычный <b>метод</b> с <code>yield return</code>. Никакого класса-энумератора руками.', nodes: [{ id: "m", kind: "gate", at: { zone: "src", row: 0 }, state: "ok", label: "G()", detail: "yield return 1,2", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Компилятор генерирует <span class="hl">nested-класс</span> <code>&lt;G&gt;d__0</code> — «in effect, a state machine», которая отслеживает позицию обхода.', nodes: [{ id: "m", kind: "gate", at: { zone: "src", row: 0 }, state: "ok", label: "G()", detail: "метод" }, { id: "sm", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "<G>d__0", value: "стейт-машина", accent: true }], edges: [{ id: "e1", from: "m", to: "sm" }] },
        { codeLine: 2, caption: '<code>foreach</code> обходит через <span class="hl">энумератор</span> (<code>GetEnumerator</code>/<code>MoveNext</code>/<code>Current</code>) — <b>не</b> делает копию/снимок коллекции.', nodes: [{ id: "sm", kind: "obj", at: { zone: "gen", row: 0 }, typeTag: "<G>d__0", value: "MoveNext/Current" }, { id: "fe", kind: "chip", at: { zone: "gen", row: 1 }, value: "foreach → без копии", accent: true }], edges: [] },
      ],
      explain: 'Ключевой факт S18.3: «Although you write an iterator as a method, the compiler translates it into a nested class that is, in effect, a state machine. This class keeps track of the position of the iterator as long the <code>foreach</code> loop in the client code continues». То есть <code>yield return</code> — синтаксис, за которым компилятор строит объект-автомат: <code>&lt;G&gt;d__0</code> (имя — Roslyn-generated, .NET 10; провенанс — рефлексия, не Learn). А <code>foreach</code> — не магия и не копия: он разворачивается в <code>GetEnumerator()</code> + <code>while(MoveNext()){ Current }</code> + <code>Dispose()</code> в <code>finally</code> (обход через энумератор, без снимка коллекции — поэтому мутация коллекции во время обхода делает поведение undefined).',
      sources: ["ms-iter-pg"],
    },
    {
      id: "s2", num: "02", kicker: "Сгенерированные члены", title: "Компилятор пишет Current/MoveNext/Dispose за тебя",
      viewBox: "0 0 340 210", zones: MEMBERS_ZONES,
      code: ["// в <G>d__0 компилятор генерирует:", "bool MoveNext()        // резюмирует тело до следующего yield return", "T Current { get; }     // текущее значение", "void Dispose()         // очистка (using в теле → сюда)"],
      scenes: [
        { codeLine: 1, caption: '<span class="hl"><code>MoveNext()</code></span> — «resumes after the previous <code>yield return</code>» и идёт до следующего. Возвращает <code>true</code>/<code>false</code>.', nodes: [{ id: "mn", kind: "gate", at: { zone: "members", row: 0, col: 0 }, state: "ok", label: "MoveNext()", detail: "bool", accent: true }], edges: [] },
        { codeLine: 2, caption: '<span class="hl"><code>Current</code></span> — текущий элемент. Оба сгенерированы: «you don\'t have to implement the whole <code>IEnumerator</code> interface».', nodes: [{ id: "mn", kind: "gate", at: { zone: "members", row: 0, col: 0 }, state: "ok", label: "MoveNext()", detail: "bool" }, { id: "cur", kind: "gate", at: { zone: "members", row: 0, col: 1 }, state: "ok", label: "Current", detail: "T", accent: true }], edges: [] },
        { codeLine: 3, caption: 'И <span class="hl"><code>Dispose()</code></span> — «it automatically generates the <code>Current</code>, <code>MoveNext</code>, and <code>Dispose</code> methods». Сюда попадает <code>finally</code> от <code>using</code>.', nodes: [{ id: "mn", kind: "gate", at: { zone: "members", row: 0, col: 0 }, state: "ok", label: "MoveNext", detail: "bool" }, { id: "cur", kind: "gate", at: { zone: "members", row: 0, col: 1 }, state: "ok", label: "Current", detail: "T" }, { id: "dis", kind: "gate", at: { zone: "members", row: 1 }, state: "ok", label: "Dispose()", detail: "очистка / finally", accent: true }], edges: [] },
      ],
      explain: 'Ты не реализуешь энумератор руками: «When you create an iterator for a class or struct, you don\'t have to implement the whole <code>IEnumerator</code> interface. When the compiler detects the iterator, it automatically generates the <code>Current</code>, <code>MoveNext</code>, and <code>Dispose</code> methods of the <code>IEnumerator</code> or <code>IEnumerator&lt;T&gt;</code> interface». А как именно <code>MoveNext</code> двигает тело: «On each successive iteration of the <code>foreach</code> loop (or the direct call to <code>IEnumerator.MoveNext</code>), the next iterator code body resumes after the previous <code>yield return</code> statement. It then continues to the next <code>yield return</code> statement until the end of the iterator body is reached, or until a <code>yield break</code> statement is encountered». В сгенерированном <code>&lt;G&gt;d__0</code> реальная рефлексия видит <code>MoveNext</code>, <code>get_Current</code>, <code>Dispose</code>, а также поля состояния (машинная панель, разбор 05).',
      sources: ["ms-iter-pg"],
    },
    {
      id: "s3", num: "03", kicker: "Контракт IEnumerator<T>", title: "Перед первым → MoveNext → Current → false за концом",
      viewBox: "0 0 340 210", zones: CONTRACT_ZONES,
      code: ["var e = Nums().GetEnumerator();   // Nums: yield return 10; yield return 20;", "e.MoveNext()  // true, Current = 10       (до этого Current не определён)", "e.MoveNext()  // true, Current = 20", "e.MoveNext()  // false  → за концом, Current не определён"],
      predictAt: 1, predictQ: 'Энумератор над <code>{10,20}</code>. Печать <code>m1={MoveNext()}:{Current} m2=… m3=…</code> — какова строка?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Свежий энумератор стоит <span class="hl">ПЕРЕД</span> первым элементом; <code>Current</code> ещё не определён. «Initially, the enumerator is positioned before the first element».', nodes: [{ id: "e", kind: "gate", at: { zone: "contract", row: 0, col: 0 }, state: "ok", label: "перед первым", detail: "Current undefined", accent: true }], edges: [] },
        { codeLine: 1, out: "m1=True:10", caption: 'Первый <code>MoveNext()</code> → <code>true</code>, ставит <span class="hl"><code>Current = 10</code></span>. «you must call <code>MoveNext</code>… before reading… <code>Current</code>».', nodes: [{ id: "e", kind: "gate", at: { zone: "contract", row: 0, col: 0 }, state: "ok", label: "MoveNext #1", detail: "true" }, { id: "c1", kind: "gate", at: { zone: "contract", row: 0, col: 1 }, state: "ok", label: "Current", detail: "10", accent: true }], edges: [] },
        { codeLine: 3, out: "m1=True:10 m2=True:20 m3=False", caption: 'Второй → <code>20</code>; третий — <span class="hl"><code>false</code></span> (за концом). «If <code>MoveNext</code> passes the end… <code>MoveNext</code> returns <code>false</code>». Вывод: <b>m1=True:10 m2=True:20 m3=False</b>.', nodes: [{ id: "c2", kind: "gate", at: { zone: "contract", row: 0, col: 0 }, state: "ok", label: "MoveNext #2", detail: "20" }, { id: "end", kind: "gate", at: { zone: "contract", row: 0, col: 1 }, state: "fail", label: "MoveNext #3", detail: "false", accent: true }], edges: [] },
      ],
      explain: 'Панель, куда «садится» стейт-машина, — контракт <code>IEnumerator&lt;T&gt;</code> (S4): «Initially, the enumerator is positioned before the first element in the collection. At this position, <code>Current</code> is undefined. Therefore, you must call <code>MoveNext</code> to advance the enumerator to the first element of the collection before reading the value of <code>Current</code>». Далее: «<code>Current</code> returns the same object until <code>MoveNext</code> is called. <code>MoveNext</code> sets <code>Current</code> to the next element». За концом: «If <code>MoveNext</code> passes the end of the collection, the enumerator is positioned after the last element in the collection and <code>MoveNext</code> returns <code>false</code>… If the last call to <code>MoveNext</code> returned <code>false</code>, <code>Current</code> is undefined». Реальный прогон подтверждает: <code>m1=True:10 m2=True:20 m3=False</code>. Именно этот контракт стейт-машина реализует полями состояния.',
      sources: ["ms-ienumerator"],
    },
    {
      id: "s4", num: "04", kicker: "Reset не поддержан", title: "Reset() бросает NotSupportedException",
      viewBox: "0 0 340 210", zones: RESET_ZONES,
      code: ["var e = Nums().GetEnumerator();", "e.Reset();   // → NotSupportedException (итераторы не поддерживают Reset)", "// чтобы начать сначала — получить НОВЫЙ итератор: Nums().GetEnumerator()"],
      scenes: [
        { codeLine: 1, caption: '<code>Reset()</code> на итераторе <span class="hl">бросает</span>: «Iterators don\'t support the <code>IEnumerator.Reset</code> method… throws a <code>NotSupportedException</code>».', nodes: [{ id: "r", kind: "gate", at: { zone: "reset", row: 0 }, state: "fail", label: "e.Reset()", detail: "NotSupportedException", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Стейт-машина не умеет «отмотать» позицию назад — <code>Reset</code> из <code>IEnumerator</code> реализован как бросок исключения.', nodes: [{ id: "r", kind: "gate", at: { zone: "reset", row: 0 }, state: "fail", label: "Reset", detail: "бросает" }, { id: "n", kind: "chip", at: { zone: "reset", row: 1 }, value: "нельзя отмотать", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Чтобы пройти заново — <span class="hl">новый</span> итератор: «To reiterate from the start, you must obtain a new iterator». Свежая машина со свежим состоянием.', nodes: [{ id: "r", kind: "gate", at: { zone: "reset", row: 0 }, state: "fail", label: "Reset", detail: "нет" }, { id: "nw", kind: "gate", at: { zone: "newit", row: 0 }, state: "ok", label: "Nums().GetEnumerator()", detail: "новый обход", accent: true }], edges: [{ id: "e1", from: "r", to: "nw" }] },
      ],
      explain: 'Итераторы <b>однопроходны</b>: «Iterators don\'t support the <code>IEnumerator.Reset</code> method. To reiterate from the start, you must obtain a new iterator. Calling <code>Reset</code> on the iterator returned by an iterator method throws a <code>NotSupportedException</code>». Причина — стейт-машина хранит позицию в поле состояния и не реализует откат; сам <code>Reset</code> в API «is provided for COM interoperability… the implementer can simply throw a <code>NotSupportedException</code>» — что компилятор и делает. Практический вывод: если нужно пройти последовательность дважды, вызови метод-итератор ещё раз (получишь новую машину), а не пытайся «перемотать» существующий энумератор. Реальный прогон в машинной панели (05) ловит этот бросок: <code>resetThrows=True</code>.',
      sources: ["ms-iter-pg", "ms-ienumerator"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальная рефлексия", title: "Тип <G>d__0, поле <>1__state = -2 до обхода",
      viewBox: "0 0 340 214", zones: SM_ZONES,
      code: ["static class D { public static IEnumerable<int> G(){ yield return 1; yield return 2; } }", "var seq = D.G();                          // ещё НЕ обходили", "seq.GetType().Name                        // <G>d__0", "seq.GetType().GetField(\"<>1__state\")...   // значение до обхода: -2"],
      predictAt: 2, predictQ: 'Тип объекта, который вернул итератор-метод <code>G()</code> (до обхода) — как он называется в рантайме?',
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Вызвали <code>D.G()</code> — получили объект стейт-машины. Рефлексия читает его <span class="hl">рантайм-тип</span>.', nodes: [{ id: "t", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "seq = D.G()", detail: "объект машины", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Имя типа — <span class="hl"><code>&lt;G&gt;d__0</code></span>: сгенерированный компилятором nested-класс (Roslyn .NET 10; провенанс — рефлексия, не Learn).', nodes: [{ id: "t", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "тип", detail: "<G>d__0" }, { id: "note", kind: "chip", at: { zone: "type", row: 1 }, value: "Roslyn-generated", accent: true }], edges: [] },
        { codeLine: 3, out: "state before iteration: -2", caption: 'У объекта есть поле <code>&lt;&gt;1__state</code>; до начала обхода оно равно <span class="hl">-2</span> (кодирует «ещё не в итерации»). Реальный прогон: <b>state before iteration: -2</b>.', nodes: [{ id: "t", kind: "gate", at: { zone: "type", row: 0 }, state: "ok", label: "<G>d__0", detail: "nested" }, { id: "st", kind: "gate", at: { zone: "statez", row: 0 }, state: "ok", label: "<>1__state", detail: "-2", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — <b>реальная рефлексия</b> на скомпилированном итераторе (собственный прогон run-csharp; тот же результат воспроизводит спайк <code>.spikes/iterator-statemachine</code> на .NET 10.0.301). Объект, который вернул <code>G()</code>, имеет рантайм-тип <code>&lt;G&gt;d__0</code> — сгенерированный компилятором nested-класс, реализующий <code>IEnumerable&lt;int&gt;</code>/<code>IEnumerator&lt;int&gt;</code>/<code>IDisposable</code>. У него поле <code>&lt;&gt;1__state</code>, и на <b>свежем</b> объекте (метод вызван, но <code>foreach</code> не начат) оно равно <b>-2</b> — отрицательное значение кодирует «ещё не в состоянии итерации»; после начала обхода <code>MoveNext</code> переставляет его в значения, кодирующие точку возобновления по <code>yield</code>-ам. <b>Провенанс честный:</b> имена <code>&lt;G&gt;d__0</code>/<code>&lt;&gt;1__state</code> и значение <b>-2</b> — Roslyn-generated (.NET 10, рефлексия), а НЕ цитата Microsoft Learn; они могут меняться между версиями компилятора. Сам факт «поле состояния существует и кодирует прогресс» следует из документированной стейт-машины (S3).',
      sources: ["roslyn-sm", "ms-iter-pg"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static class D { public static IEnumerable&lt;int&gt; G(){ yield return 1; yield return 2; } } var seq = D.G(); bool hasState = seq.GetType().GetField("&lt;&gt;1__state", BindingFlags.NonPublic|BindingFlags.Instance) != null; bool resetThrows=false; try { D.G().GetEnumerator().Reset(); } catch(NotSupportedException){ resetThrows=true; } Console.WriteLine($"stateMachine={seq.GetType().Name} hasStateField={hasState} resetThrows={resetThrows}");</code> — что напечатает?',
      options: ["stateMachine=<G>d__0 hasStateField=True resetThrows=True", "stateMachine=IEnumerable`1 hasStateField=False resetThrows=False", "stateMachine=<G>d__0 hasStateField=True resetThrows=False", "stateMachine=G hasStateField=False resetThrows=True"], correctIndex: 0, xp: 10,
      okText: 'Итератор-метод возвращает <span class="hl">сгенерированную стейт-машину</span> <code>&lt;G&gt;d__0</code> (имя — Roslyn .NET 10) с полем <code>&lt;&gt;1__state</code>; <code>Reset()</code> на ней бросает <code>NotSupportedException</code>. Печать: <b>&lt;G&gt;d__0 True True</b>.',
      noText: 'Компилятор превращает <code>G()</code> в nested-класс-автомат <code>&lt;G&gt;d__0</code> с полем состояния; <code>Reset</code> не поддержан → бросок. Реальный вывод: <b>stateMachine=&lt;G&gt;d__0 hasStateField=True resetThrows=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "stateMachine=<G>d__0 hasStateField=True resetThrows=True" }, sourceRefs: ["roslyn-sm", "ms-iter-pg"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; Nums(){ yield return 10; yield return 20; } var e = Nums().GetEnumerator(); var log = new StringBuilder(); log.Append($"m1={e.MoveNext()}:{e.Current} "); log.Append($"m2={e.MoveNext()}:{e.Current} "); log.Append($"m3={e.MoveNext()}"); Console.WriteLine(log.ToString());</code> — что напечатает?',
      options: ["m1=True:10 m2=True:20 m3=False", "m1=True:0 m2=True:10 m3=True", "m1=True:10 m2=True:20 m3=True", "m1=False:0 m2=True:10 m3=True"], correctIndex: 0, xp: 10,
      okText: 'Контракт <code>IEnumerator&lt;T&gt;</code>: первый <code>MoveNext</code> ставит <code>Current=10</code> (до него <code>Current</code> не определён), второй — <code>20</code>, третий — <span class="hl"><code>false</code></span> за концом. Печать: <b>m1=True:10 m2=True:20 m3=False</b>.',
      noText: 'Энумератор стоит перед первым элементом; <code>MoveNext</code> двигает <code>Current</code>; за концом даёт <code>false</code>. Реальный вывод: <b>m1=True:10 m2=True:20 m3=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "m1=True:10 m2=True:20 m3=False" }, sourceRefs: ["ms-ienumerator"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static class D { public static IEnumerable&lt;int&gt; G(){ yield return 1; yield return 2; } } var seq = D.G(); var f = seq.GetType().GetField("&lt;&gt;1__state", BindingFlags.NonPublic|BindingFlags.Instance); Console.WriteLine($"state before iteration: {f.GetValue(seq)}");</code> — что напечатает?',
      options: ["state before iteration: -2", "state before iteration: 0", "state before iteration: -1", "state before iteration: 1"], correctIndex: 0, xp: 10,
      okText: 'На <span class="hl">свежем</span> объекте стейт-машины (метод вызван, обход не начат) поле <code>&lt;&gt;1__state</code> = <b>-2</b> — кодирует «ещё не в итерации» (Roslyn .NET 10, рефлексия). Печать: <b>state before iteration: -2</b>.',
      noText: 'До первого <code>MoveNext</code> поле состояния сгенерированной машины отрицательно (-2 на .NET 10). Реальный вывод: <b>state before iteration: -2</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "state before iteration: -2" }, sourceRefs: ["roslyn-sm"],
    },
  ],

  takeaways: [
    { icon: "why", k: "метод → автомат", v: 'Компилятор превращает итератор в <span class="hl">nested-класс = стейт-машину</span> (<code>&lt;G&gt;d__0</code>, Roslyn .NET 10). «the compiler translates it into a nested class that is, in effect, a state machine». <code>foreach</code> обходит через энумератор, не копирует коллекцию.' },
    { icon: "cost", k: "члены и контракт", v: 'Генерируются <code>Current</code>/<code>MoveNext</code>/<code>Dispose</code> — руками <code>IEnumerator</code> не пишешь. Контракт: перед первым → <code>MoveNext</code> → <code>Current</code>; за концом <code>false</code> (замер: m1=True:10 … m3=False).' },
    { icon: "avoid", k: "Reset / состояние", v: '<code>Reset()</code> бросает <code>NotSupportedException</code> — заново только через новый итератор. Поле <code>&lt;&gt;1__state</code> = <b>-2</b> до обхода (реальная рефлексия; имена/значение — Roslyn .NET 10, не Learn).' },
  ],

  foot: 'урок · <b>стейт-машина итератора</b> · 5 анимир. разборов · панель рефлексии &lt;G&gt;d__0 / &lt;&gt;1__state=-2 · дизайн <b>mid</b>',
};
